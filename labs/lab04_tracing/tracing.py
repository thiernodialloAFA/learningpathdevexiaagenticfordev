"""Lab 04 — tracing a GenAI chain the way OpenTelemetry expects.

A miniature tracer in the standard library, using the `gen_ai.*` semantic
conventions. The point is not to rebuild OpenTelemetry: it is to internalise the
span shape, the attributes and the sampling decisions you will configure for
real, and to see cost and quality attached to the same trace as latency.

What this lab teaches:
  * one span per logical operation, not one span per request
  * which attributes make a span analysable for quality, latency and cost
  * cost must be attributed per span, tagged with feature and tenant
  * tail-based sampling keeps the rare interesting traces a 1% sample destroys
  * prompts must be redacted before export, not access-controlled afterwards
"""

from __future__ import annotations

import re
import time
import uuid
from contextlib import contextmanager
from dataclasses import dataclass, field
from typing import Any, Iterator, Sequence

# --------------------------------------------------------------------------
# Pricing: cost is a first-class span attribute, not a monthly invoice
# --------------------------------------------------------------------------


@dataclass(frozen=True)
class ModelPrice:
    """Euro per 1,000 tokens. Cached input is billed at a fraction of input."""

    input_per_1k: float
    output_per_1k: float
    cached_input_per_1k: float = 0.0

    def cost(self, *, input_tokens: int, output_tokens: int, cached_tokens: int = 0) -> float:
        billable_input = max(input_tokens - cached_tokens, 0)
        return (
            billable_input / 1000 * self.input_per_1k
            + cached_tokens / 1000 * self.cached_input_per_1k
            + output_tokens / 1000 * self.output_per_1k
        )


PRICES: dict[str, ModelPrice] = {
    "small": ModelPrice(input_per_1k=0.00015, output_per_1k=0.0006, cached_input_per_1k=0.000075),
    "large": ModelPrice(input_per_1k=0.0025, output_per_1k=0.01, cached_input_per_1k=0.00125),
}


# --------------------------------------------------------------------------
# Redaction: what leaves the process must already be safe
# --------------------------------------------------------------------------

PII_PATTERNS: tuple[tuple[str, re.Pattern[str]], ...] = (
    ("EMAIL", re.compile(r"[\w.\-+]+@[\w\-]+\.[\w.\-]+")),
    ("IBAN", re.compile(r"\b[A-Z]{2}\d{2}[A-Z0-9]{10,30}\b")),
    ("POLICY", re.compile(r"\b(?:POL|CTR)-\d{6,}\b")),
    ("PHONE", re.compile(r"\b(?:\+33|0)\s?[1-9](?:[\s.\-]?\d{2}){4}\b")),
    ("SSN_FR", re.compile(r"\b[12]\s?\d{2}\s?\d{2}\s?\d{2}\s?\d{3}\s?\d{3}\s?\d{2}\b")),
)


def redact(text: str) -> str:
    """Replace detected personal data with a stable placeholder.

    Restricting dashboard access does not reduce the data you collected; this
    does. Redaction happens at the source, before the span is exported.
    """
    for label, pattern in PII_PATTERNS:
        text = pattern.sub(f"[{label}]", text)
    return text


# --------------------------------------------------------------------------
# The span model
# --------------------------------------------------------------------------


@dataclass
class Span:
    """A single logical operation, following OpenTelemetry GenAI conventions."""

    name: str
    trace_id: str
    span_id: str
    parent_id: str | None
    start: float
    end: float | None = None
    attributes: dict[str, Any] = field(default_factory=dict)
    status: str = "ok"

    @property
    def duration_ms(self) -> float:
        return ((self.end or self.start) - self.start) * 1000

    def set(self, key: str, value: Any) -> "Span":
        self.attributes[key] = value
        return self

    def record_model_call(
        self,
        *,
        model: str,
        operation: str,
        input_tokens: int,
        output_tokens: int,
        cached_tokens: int = 0,
        finish_reason: str = "stop",
    ) -> "Span":
        """Attach the minimum attribute set needed to analyse one model call."""
        price = PRICES[model]
        self.attributes.update(
            {
                "gen_ai.system": "lab",
                "gen_ai.operation.name": operation,
                "gen_ai.request.model": model,
                "gen_ai.usage.input_tokens": input_tokens,
                "gen_ai.usage.output_tokens": output_tokens,
                "gen_ai.usage.cached_input_tokens": cached_tokens,
                "gen_ai.response.finish_reason": finish_reason,
                "cost.eur": round(
                    price.cost(
                        input_tokens=input_tokens,
                        output_tokens=output_tokens,
                        cached_tokens=cached_tokens,
                    ),
                    8,
                ),
            }
        )
        return self

    def record_prompt(self, prompt: str) -> "Span":
        """Store the prompt only in redacted form."""
        self.attributes["gen_ai.prompt.redacted"] = redact(prompt)
        return self


@dataclass
class Trace:
    trace_id: str
    spans: list[Span] = field(default_factory=list)

    @property
    def root(self) -> Span | None:
        return next((span for span in self.spans if span.parent_id is None), None)

    @property
    def duration_ms(self) -> float:
        root = self.root
        return root.duration_ms if root else 0.0

    @property
    def total_cost_eur(self) -> float:
        return round(sum(span.attributes.get("cost.eur", 0.0) for span in self.spans), 8)

    @property
    def total_tokens(self) -> int:
        return sum(
            span.attributes.get("gen_ai.usage.input_tokens", 0)
            + span.attributes.get("gen_ai.usage.output_tokens", 0)
            for span in self.spans
        )

    def has_error(self) -> bool:
        return any(span.status == "error" for span in self.spans)

    def children_of(self, span: Span) -> list[Span]:
        return [candidate for candidate in self.spans if candidate.parent_id == span.span_id]

    def slowest_span(self) -> Span | None:
        non_root = [span for span in self.spans if span.parent_id is not None]
        return max(non_root, key=lambda s: s.duration_ms, default=None)


class Tracer:
    """Builds one trace per request, with a real parent/child span tree."""

    def __init__(self, *, feature: str, tenant: str, clock=time.perf_counter) -> None:
        self.feature = feature
        self.tenant = tenant
        self._clock = clock
        self._stack: list[Span] = []
        self.trace: Trace | None = None

    @contextmanager
    def span(self, name: str) -> Iterator[Span]:
        if self.trace is None:
            self.trace = Trace(trace_id=uuid.uuid4().hex)
        parent = self._stack[-1] if self._stack else None
        span = Span(
            name=name,
            trace_id=self.trace.trace_id,
            span_id=uuid.uuid4().hex[:16],
            parent_id=parent.span_id if parent else None,
            start=self._clock(),
        )
        # Every span carries the tags that let you split an invoice by owner.
        span.attributes["feature"] = self.feature
        span.attributes["tenant"] = self.tenant
        self.trace.spans.append(span)
        self._stack.append(span)
        try:
            yield span
        except Exception as exc:
            span.status = "error"
            span.attributes["error.type"] = type(exc).__name__
            raise
        finally:
            span.end = self._clock()
            self._stack.pop()


# --------------------------------------------------------------------------
# Sampling: keep the traces that teach you something
# --------------------------------------------------------------------------


@dataclass(frozen=True)
class TailSampler:
    """Head sampling for the baseline, tail rules for everything interesting.

    A uniform 1% sample discards almost every incident, because incidents are
    rare by definition. Tail rules are evaluated once the trace is complete.
    """

    baseline_rate: float = 0.01
    slow_threshold_ms: float = 2000.0
    quality_threshold: float = 0.6

    def keep(self, trace: Trace, *, quality: float | None = None, roll: float = 1.0) -> bool:
        if trace.has_error():
            return True
        if trace.duration_ms >= self.slow_threshold_ms:
            return True
        if quality is not None and quality < self.quality_threshold:
            return True
        return roll < self.baseline_rate


# --------------------------------------------------------------------------
# Service level indicators
# --------------------------------------------------------------------------


def percentile(values: Sequence[float], share: float) -> float:
    if not values:
        return 0.0
    ordered = sorted(values)
    index = min(len(ordered) - 1, int(round(share * (len(ordered) - 1))))
    return ordered[index]


@dataclass(frozen=True)
class SloReport:
    objective: str
    achieved: float
    target: float

    @property
    def met(self) -> bool:
        return self.achieved >= self.target


def evaluate_slo(
    *,
    ttft_samples_ms: Sequence[float],
    grounded_flags: Sequence[bool],
    latency_budget_ms: float = 2000.0,
    target: float = 0.99,
) -> SloReport:
    """A GenAI SLO couples a user-visible latency target with a quality condition.

    Availability alone is meaningless here: the system can be fully available
    and uselessly wrong.
    """
    if not ttft_samples_ms or len(ttft_samples_ms) != len(grounded_flags):
        raise ValueError("need one groundedness flag per latency sample")
    good = sum(
        1
        for latency, grounded in zip(ttft_samples_ms, grounded_flags)
        if latency <= latency_budget_ms and grounded
    )
    return SloReport(
        objective=f"first token <= {latency_budget_ms:.0f} ms and a grounded answer",
        achieved=good / len(ttft_samples_ms),
        target=target,
    )

