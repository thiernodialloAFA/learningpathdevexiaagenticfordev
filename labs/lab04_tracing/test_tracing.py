"""Tests are the specification for lab 04."""

from __future__ import annotations

import pytest

from lab04_tracing.tracing import (
    PRICES,
    ModelPrice,
    SloReport,
    TailSampler,
    Tracer,
    evaluate_slo,
    percentile,
    redact,
)


class FakeClock:
    """Deterministic time so latency assertions never flake."""

    def __init__(self) -> None:
        self.now = 0.0

    def __call__(self) -> float:
        return self.now

    def advance(self, seconds: float) -> None:
        self.now += seconds


def build_rag_trace(clock: FakeClock) -> Tracer:
    """The canonical span tree of a RAG request."""
    tracer = Tracer(feature="claims-assistant", tenant="axa-fr", clock=clock)
    with tracer.span("chat.request") as root:
        root.record_prompt("Contact jean.dupont@example.com about POL-123456")
        with tracer.span("retrieval.search") as retrieval:
            clock.advance(0.12)
            retrieval.set("retrieval.top_k", 5)
        with tracer.span("retrieval.rerank"):
            clock.advance(0.30)
        with tracer.span("chat.completion") as completion:
            clock.advance(0.90)
            completion.record_model_call(
                model="large",
                operation="chat",
                input_tokens=12_000,
                output_tokens=300,
                cached_tokens=6_000,
            )
    return tracer


def test_the_chain_produces_a_span_tree_not_a_single_opaque_span():
    tracer = build_rag_trace(FakeClock())
    trace = tracer.trace
    assert trace is not None
    assert len(trace.spans) == 4
    root = trace.root
    assert root is not None and root.name == "chat.request"
    assert {span.name for span in trace.children_of(root)} == {
        "retrieval.search",
        "retrieval.rerank",
        "chat.completion",
    }


def test_every_span_shares_one_trace_id():
    trace = build_rag_trace(FakeClock()).trace
    assert len({span.trace_id for span in trace.spans}) == 1


def test_per_stage_durations_locate_the_bottleneck():
    trace = build_rag_trace(FakeClock()).trace
    slowest = trace.slowest_span()
    assert slowest is not None and slowest.name == "chat.completion"
    assert slowest.duration_ms == pytest.approx(900, abs=1)


def test_a_model_span_carries_the_gen_ai_semantic_attributes():
    trace = build_rag_trace(FakeClock()).trace
    completion = next(s for s in trace.spans if s.name == "chat.completion")
    for key in (
        "gen_ai.system",
        "gen_ai.operation.name",
        "gen_ai.request.model",
        "gen_ai.usage.input_tokens",
        "gen_ai.usage.output_tokens",
        "gen_ai.response.finish_reason",
    ):
        assert key in completion.attributes, f"missing {key}"


def test_every_span_is_tagged_with_feature_and_tenant_so_cost_can_be_split():
    trace = build_rag_trace(FakeClock()).trace
    assert all(span.attributes["feature"] == "claims-assistant" for span in trace.spans)
    assert all(span.attributes["tenant"] == "axa-fr" for span in trace.spans)


def test_cost_is_attributed_on_the_span_and_accounts_for_the_cache():
    trace = build_rag_trace(FakeClock()).trace
    completion = next(s for s in trace.spans if s.name == "chat.completion")
    price = PRICES["large"]
    expected = price.cost(input_tokens=12_000, output_tokens=300, cached_tokens=6_000)
    assert completion.attributes["cost.eur"] == pytest.approx(expected)
    assert trace.total_cost_eur == pytest.approx(expected)


def test_caching_is_cheaper_than_paying_full_input_price():
    price = PRICES["large"]
    full = price.cost(input_tokens=12_000, output_tokens=300)
    cached = price.cost(input_tokens=12_000, output_tokens=300, cached_tokens=12_000)
    assert cached < full


def test_input_tokens_dominate_a_rag_request():
    """12,000 in at rate 1 beats 300 out at rate 4 by an order of magnitude."""
    price = ModelPrice(input_per_1k=1.0, output_per_1k=4.0)
    input_cost = price.cost(input_tokens=12_000, output_tokens=0)
    output_cost = price.cost(input_tokens=0, output_tokens=300)
    assert input_cost > output_cost * 9


def test_prompts_are_redacted_before_they_reach_the_span():
    trace = build_rag_trace(FakeClock()).trace
    prompt = trace.root.attributes["gen_ai.prompt.redacted"]
    assert "jean.dupont@example.com" not in prompt
    assert "POL-123456" not in prompt
    assert "[EMAIL]" in prompt and "[POLICY]" in prompt


def test_redaction_covers_the_usual_insurance_identifiers():
    redacted = redact("IBAN FR7630006000011234567890189 phone 06 12 34 56 78")
    assert "FR7630006000011234567890189" not in redacted
    assert "[IBAN]" in redacted
    assert "[PHONE]" in redacted


def test_a_failing_span_is_marked_and_propagates():
    tracer = Tracer(feature="f", tenant="t", clock=FakeClock())
    with pytest.raises(RuntimeError):
        with tracer.span("chat.request"):
            with tracer.span("chat.completion"):
                raise RuntimeError("provider exploded")
    trace = tracer.trace
    assert trace.has_error()
    failed = next(s for s in trace.spans if s.name == "chat.completion")
    assert failed.status == "error"
    assert failed.attributes["error.type"] == "RuntimeError"


def test_tail_sampling_always_keeps_an_error_trace():
    tracer = Tracer(feature="f", tenant="t", clock=FakeClock())
    with pytest.raises(RuntimeError):
        with tracer.span("chat.request"):
            raise RuntimeError("boom")
    assert TailSampler().keep(tracer.trace, roll=0.99) is True


def test_tail_sampling_always_keeps_a_slow_trace():
    clock = FakeClock()
    tracer = Tracer(feature="f", tenant="t", clock=clock)
    with tracer.span("chat.request"):
        clock.advance(3.0)
    assert TailSampler(slow_threshold_ms=2000).keep(tracer.trace, roll=0.99) is True


def test_tail_sampling_always_keeps_a_low_quality_trace():
    clock = FakeClock()
    tracer = Tracer(feature="f", tenant="t", clock=clock)
    with tracer.span("chat.request"):
        clock.advance(0.1)
    sampler = TailSampler(quality_threshold=0.6)
    assert sampler.keep(tracer.trace, quality=0.2, roll=0.99) is True
    assert sampler.keep(tracer.trace, quality=0.9, roll=0.99) is False


def test_tail_sampling_still_keeps_a_statistical_baseline():
    clock = FakeClock()
    tracer = Tracer(feature="f", tenant="t", clock=clock)
    with tracer.span("chat.request"):
        clock.advance(0.1)
    assert TailSampler(baseline_rate=0.05).keep(tracer.trace, quality=1.0, roll=0.01) is True


def test_percentile_reports_the_tail_not_the_mean():
    values = [10.0] * 95 + [900.0] * 5
    assert percentile(values, 0.5) == 10.0
    assert percentile(values, 0.95) >= 10.0
    assert percentile(values, 0.99) == 900.0


def test_the_slo_couples_latency_and_groundedness():
    report = evaluate_slo(
        ttft_samples_ms=[500, 600, 700, 800],
        grounded_flags=[True, True, True, True],
        latency_budget_ms=2000,
    )
    assert isinstance(report, SloReport)
    assert report.achieved == 1.0
    assert report.met


def test_a_fast_but_ungrounded_answer_burns_the_slo():
    report = evaluate_slo(
        ttft_samples_ms=[100, 100, 100, 100],
        grounded_flags=[True, False, False, True],
        latency_budget_ms=2000,
        target=0.99,
    )
    assert report.achieved == 0.5
    assert not report.met


def test_slo_requires_a_quality_flag_per_sample():
    with pytest.raises(ValueError):
        evaluate_slo(ttft_samples_ms=[100, 200], grounded_flags=[True])

