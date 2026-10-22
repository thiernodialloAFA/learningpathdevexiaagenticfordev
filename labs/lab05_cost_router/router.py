"""Lab 05 — routing, caching and the arithmetic of AI spend.

Every lever in this module trades quality, latency or risk against money. The
lab exists so that you can state that trade-off with a number instead of an
opinion.

What this lab teaches:
  * a unit-cost model broken down by driver, not by invoice line
  * prompt caching requires a byte-identical stable prefix
  * a semantic cache trades correctness for cost; the threshold is the control
  * a cascade only wins on cost per *resolved task*, never cost per call
  * fine-tuning is a break-even calculation, not a preference
"""

from __future__ import annotations

import hashlib
import math
from dataclasses import dataclass, field
from typing import Callable, Sequence

# --------------------------------------------------------------------------
# Unit cost
# --------------------------------------------------------------------------


@dataclass(frozen=True)
class ModelSpec:
    """Price in euro per 1,000 tokens, plus the quality ceiling of the model."""

    name: str
    input_per_1k: float
    output_per_1k: float
    cached_input_per_1k: float
    quality: float  # 0..1, the share of tasks this model resolves correctly

    def cost(self, *, input_tokens: int, output_tokens: int, cached_tokens: int = 0) -> float:
        if cached_tokens > input_tokens:
            raise ValueError("cached tokens cannot exceed input tokens")
        billable = input_tokens - cached_tokens
        return (
            billable / 1000 * self.input_per_1k
            + cached_tokens / 1000 * self.cached_input_per_1k
            + output_tokens / 1000 * self.output_per_1k
        )


SMALL = ModelSpec(
    name="small",
    input_per_1k=0.00015,
    output_per_1k=0.0006,
    cached_input_per_1k=0.000075,
    quality=0.78,
)
LARGE = ModelSpec(
    name="large",
    input_per_1k=0.0025,
    output_per_1k=0.01,
    cached_input_per_1k=0.00125,
    quality=0.94,
)


@dataclass(frozen=True)
class CostBreakdown:
    """Spend split by driver, which is what makes a reduction plan possible."""

    context: float
    generation: float
    embeddings: float
    reranking: float

    @property
    def total(self) -> float:
        return self.context + self.generation + self.embeddings + self.reranking

    def share_of(self, driver: str) -> float:
        value = getattr(self, driver)
        return value / self.total if self.total else 0.0

    def largest_driver(self) -> str:
        return max(
            ("context", "generation", "embeddings", "reranking"),
            key=lambda name: getattr(self, name),
        )


def monthly_cost(
    *,
    requests: int,
    model: ModelSpec,
    input_tokens: int,
    output_tokens: int,
    cached_tokens: int = 0,
    embedding_cost_per_request: float = 0.0,
    rerank_cost_per_request: float = 0.0,
) -> CostBreakdown:
    """Model the monthly bill of one feature, driver by driver."""
    billable_input = input_tokens - cached_tokens
    context = requests * (
        billable_input / 1000 * model.input_per_1k
        + cached_tokens / 1000 * model.cached_input_per_1k
    )
    generation = requests * output_tokens / 1000 * model.output_per_1k
    return CostBreakdown(
        context=context,
        generation=generation,
        embeddings=requests * embedding_cost_per_request,
        reranking=requests * rerank_cost_per_request,
    )


# --------------------------------------------------------------------------
# Prompt caching: only a byte-identical stable prefix is cacheable
# --------------------------------------------------------------------------


@dataclass
class PromptCache:
    """Counts how many input tokens the provider can bill at the cached rate."""

    min_prefix_tokens: int = 1024
    _seen: set[str] = field(default_factory=set)
    hits: int = 0
    misses: int = 0

    @staticmethod
    def _fingerprint(prefix: str) -> str:
        return hashlib.sha256(prefix.encode("utf-8")).hexdigest()

    def lookup(self, prefix: str, prefix_tokens: int) -> int:
        """Return the number of tokens billed at the cached rate.

        A prefix that changes on every request — a timestamp, reordered
        examples, different whitespace — never gets a hit, which is the most
        common reason a caching project delivers nothing.
        """
        if prefix_tokens < self.min_prefix_tokens:
            self.misses += 1
            return 0
        key = self._fingerprint(prefix)
        if key in self._seen:
            self.hits += 1
            return prefix_tokens
        self._seen.add(key)
        self.misses += 1
        return 0

    @property
    def hit_rate(self) -> float:
        total = self.hits + self.misses
        return self.hits / total if total else 0.0


# --------------------------------------------------------------------------
# Semantic cache: cheap, and wrong if the threshold is loose
# --------------------------------------------------------------------------


def _vector(text: str, dim: int = 32) -> list[float]:
    vec = [0.0] * dim
    for token in text.lower().split():
        digest = hashlib.sha256(token.encode("utf-8")).digest()
        vec[digest[0] % dim] += 1.0
    norm = math.sqrt(sum(v * v for v in vec)) or 1.0
    return [v / norm for v in vec]


def similarity(left: str, right: str) -> float:
    a, b = _vector(left), _vector(right)
    return sum(x * y for x, y in zip(a, b))


@dataclass
class SemanticCache:
    """Returns a previous answer for a *similar* question.

    The threshold is a correctness control, not a tuning parameter: too low and
    the cache confidently answers a different question.
    """

    threshold: float = 0.95
    entries: list[tuple[str, str]] = field(default_factory=list)
    hits: int = 0
    misses: int = 0

    def get(self, question: str) -> str | None:
        best_answer, best_score = None, 0.0
        for stored_question, answer in self.entries:
            score = similarity(question, stored_question)
            if score > best_score:
                best_answer, best_score = answer, score
        if best_answer is not None and best_score >= self.threshold:
            self.hits += 1
            return best_answer
        self.misses += 1
        return None

    def put(self, question: str, answer: str) -> None:
        self.entries.append((question, answer))

    def invalidate(self) -> None:
        """Content changed upstream: a stale cache is a correctness incident."""
        self.entries.clear()


# --------------------------------------------------------------------------
# Routing: a cascade is judged on cost per resolved task
# --------------------------------------------------------------------------


@dataclass(frozen=True)
class RoutingResult:
    model_used: str
    escalated: bool
    resolved: bool
    cost: float


Confidence = Callable[[str], float]


@dataclass
class CascadeRouter:
    """Try the cheap model, escalate when confidence is low."""

    small: ModelSpec = SMALL
    large: ModelSpec = LARGE
    escalate_below: float = 0.7

    def route(
        self,
        *,
        question: str,
        confidence: float,
        small_resolves: bool,
        large_resolves: bool,
        input_tokens: int,
        output_tokens: int,
    ) -> RoutingResult:
        small_cost = self.small.cost(input_tokens=input_tokens, output_tokens=output_tokens)
        if confidence >= self.escalate_below:
            return RoutingResult(
                model_used=self.small.name,
                escalated=False,
                resolved=small_resolves,
                cost=small_cost,
            )
        large_cost = self.large.cost(input_tokens=input_tokens, output_tokens=output_tokens)
        # The escalated path pays for both calls: that is why cost per call lies.
        return RoutingResult(
            model_used=self.large.name,
            escalated=True,
            resolved=large_resolves,
            cost=small_cost + large_cost,
        )


@dataclass(frozen=True)
class RoutingReport:
    total_cost: float
    resolved: int
    total: int
    escalations: int

    @property
    def escalation_rate(self) -> float:
        return self.escalations / self.total if self.total else 0.0

    @property
    def quality(self) -> float:
        return self.resolved / self.total if self.total else 0.0

    @property
    def cost_per_resolved_task(self) -> float:
        """The only cost figure worth putting in front of a steering committee."""
        return self.total_cost / self.resolved if self.resolved else math.inf


def summarise(results: Sequence[RoutingResult]) -> RoutingReport:
    return RoutingReport(
        total_cost=sum(r.cost for r in results),
        resolved=sum(1 for r in results if r.resolved),
        total=len(results),
        escalations=sum(1 for r in results if r.escalated),
    )


# --------------------------------------------------------------------------
# Break-even
# --------------------------------------------------------------------------


@dataclass(frozen=True)
class BreakEven:
    annual_saving: float
    payback_years: float

    @property
    def justified_on_cost_alone(self) -> bool:
        """Anything beyond two years must be justified by quality or latency."""
        return self.payback_years <= 2.0


def fine_tuning_break_even(
    *, investment: float, saving_per_request: float, requests_per_year: int
) -> BreakEven:
    annual = saving_per_request * requests_per_year
    return BreakEven(
        annual_saving=annual,
        payback_years=math.inf if annual <= 0 else investment / annual,
    )


# --------------------------------------------------------------------------
# Context budget: the quality/cost curve, not a guess
# --------------------------------------------------------------------------


@dataclass(frozen=True)
class ContextPoint:
    chunks: int
    quality: float
    cost: float


def choose_context_budget(
    points: Sequence[ContextPoint], *, max_quality_loss: float = 0.02
) -> ContextPoint:
    """Pick the cheapest point whose quality stays within the agreed tolerance.

    This is what turns "truncate to two chunks" from an opinion into a decision.
    """
    if not points:
        raise ValueError("no measured points")
    best_quality = max(point.quality for point in points)
    acceptable = [p for p in points if p.quality >= best_quality - max_quality_loss]
    return min(acceptable, key=lambda p: (p.cost, p.chunks))

