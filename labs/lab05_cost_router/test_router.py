"""Tests are the specification for lab 05."""

from __future__ import annotations

import math

import pytest

from lab05_cost_router.router import (
    LARGE,
    SMALL,
    CascadeRouter,
    ContextPoint,
    PromptCache,
    SemanticCache,
    choose_context_budget,
    fine_tuning_break_even,
    monthly_cost,
    summarise,
)

# --------------------------------------------------------------------------
# Unit cost
# --------------------------------------------------------------------------


def test_context_is_the_dominant_driver_of_a_rag_assistant():
    breakdown = monthly_cost(
        requests=100_000,
        model=LARGE,
        input_tokens=12_000,
        output_tokens=300,
        embedding_cost_per_request=0.000002,
        rerank_cost_per_request=0.00001,
    )
    assert breakdown.largest_driver() == "context"
    assert breakdown.share_of("context") > 0.85


def test_the_breakdown_sums_to_the_total():
    breakdown = monthly_cost(
        requests=10, model=SMALL, input_tokens=1000, output_tokens=100,
        embedding_cost_per_request=0.1, rerank_cost_per_request=0.2,
    )
    assert breakdown.total == pytest.approx(
        breakdown.context + breakdown.generation + breakdown.embeddings + breakdown.reranking
    )


def test_caching_the_whole_prefix_cuts_the_context_driver():
    full = monthly_cost(requests=1000, model=LARGE, input_tokens=12_000, output_tokens=300)
    cached = monthly_cost(
        requests=1000, model=LARGE, input_tokens=12_000, output_tokens=300, cached_tokens=10_000
    )
    assert cached.context < full.context
    assert cached.generation == pytest.approx(full.generation)


def test_cached_tokens_cannot_exceed_input_tokens():
    with pytest.raises(ValueError):
        LARGE.cost(input_tokens=100, output_tokens=10, cached_tokens=200)


# --------------------------------------------------------------------------
# Prompt caching
# --------------------------------------------------------------------------


PREAMBLE = "policy preamble " * 1000


def test_a_stable_prefix_is_billed_at_the_cached_rate_after_the_first_call():
    cache = PromptCache(min_prefix_tokens=1024)
    assert cache.lookup(PREAMBLE, 6000) == 0  # first call populates
    assert cache.lookup(PREAMBLE, 6000) == 6000
    assert cache.hit_rate == 0.5


def test_a_prefix_that_changes_every_request_never_hits():
    cache = PromptCache(min_prefix_tokens=1024)
    for i in range(5):
        # A timestamp, reordered examples or stray whitespace all do this.
        assert cache.lookup(f"{PREAMBLE} {i}", 6000) == 0
    assert cache.hits == 0
    assert cache.hit_rate == 0.0


def test_a_prefix_below_the_minimum_is_not_cacheable():
    cache = PromptCache(min_prefix_tokens=1024)
    cache.lookup("short prefix", 100)
    assert cache.lookup("short prefix", 100) == 0


# --------------------------------------------------------------------------
# Semantic caching
# --------------------------------------------------------------------------


def test_a_semantic_cache_returns_a_stored_answer_for_the_same_question():
    cache = SemanticCache(threshold=0.95)
    cache.put("what is the deductible", "150 euros")
    assert cache.get("what is the deductible") == "150 euros"
    assert cache.hits == 1


def test_a_strict_threshold_refuses_a_merely_similar_question():
    """A false hit answers a different question with full confidence."""
    cache = SemanticCache(threshold=0.99)
    cache.put("what is the deductible for water damage", "500 euros")
    assert cache.get("what is the deductible for bodily injury") is None


def test_a_loose_threshold_produces_the_false_hit_you_must_control():
    cache = SemanticCache(threshold=0.1)
    cache.put("what is the deductible for water damage", "500 euros")
    assert cache.get("what is the deductible for bodily injury") == "500 euros"


def test_invalidation_is_required_when_upstream_content_changes():
    cache = SemanticCache(threshold=0.95)
    cache.put("what is the deductible", "300 euros")
    cache.invalidate()
    assert cache.get("what is the deductible") is None


# --------------------------------------------------------------------------
# Routing
# --------------------------------------------------------------------------


def test_a_confident_question_stays_on_the_small_model():
    result = CascadeRouter().route(
        question="simple",
        confidence=0.9,
        small_resolves=True,
        large_resolves=True,
        input_tokens=2000,
        output_tokens=200,
    )
    assert result.model_used == "small"
    assert result.escalated is False


def test_an_escalated_request_pays_for_both_calls():
    router = CascadeRouter(escalate_below=0.7)
    result = router.route(
        question="hard",
        confidence=0.2,
        small_resolves=False,
        large_resolves=True,
        input_tokens=2000,
        output_tokens=200,
    )
    small_only = SMALL.cost(input_tokens=2000, output_tokens=200)
    large_only = LARGE.cost(input_tokens=2000, output_tokens=200)
    assert result.escalated is True
    assert result.cost == pytest.approx(small_only + large_only)
    assert result.cost > large_only, "this is why cost per call is a misleading metric"


def test_a_cascade_is_judged_on_cost_per_resolved_task():
    router = CascadeRouter(escalate_below=0.7)
    traffic = [(0.95, True, True)] * 80 + [(0.3, False, True)] * 20
    results = [
        router.route(
            question="q",
            confidence=confidence,
            small_resolves=small_ok,
            large_resolves=large_ok,
            input_tokens=2000,
            output_tokens=200,
        )
        for confidence, small_ok, large_ok in traffic
    ]
    report = summarise(results)
    assert report.escalation_rate == pytest.approx(0.2)
    assert report.quality == 1.0

    large_only_cost = 100 * LARGE.cost(input_tokens=2000, output_tokens=200)
    assert report.cost_per_resolved_task < large_only_cost / 100


def test_quality_collapse_is_visible_even_when_spend_drops():
    """Routing everything to the small model is cheap and not a success."""
    router = CascadeRouter(escalate_below=0.0)  # never escalate
    results = [
        router.route(
            question="q",
            confidence=0.1,
            small_resolves=False,
            large_resolves=True,
            input_tokens=2000,
            output_tokens=200,
        )
        for _ in range(10)
    ]
    report = summarise(results)
    assert report.quality == 0.0
    assert report.cost_per_resolved_task == math.inf


# --------------------------------------------------------------------------
# Break-even
# --------------------------------------------------------------------------


def test_the_twenty_thousand_euro_fine_tuning_question():
    result = fine_tuning_break_even(
        investment=20_000, saving_per_request=0.004, requests_per_year=1_000_000
    )
    assert result.annual_saving == pytest.approx(4_000)
    assert result.payback_years == pytest.approx(5.0)
    assert result.justified_on_cost_alone is False


def test_a_high_volume_workload_can_justify_fine_tuning():
    result = fine_tuning_break_even(
        investment=20_000, saving_per_request=0.004, requests_per_year=10_000_000
    )
    assert result.payback_years == pytest.approx(0.5)
    assert result.justified_on_cost_alone is True


def test_no_saving_means_no_payback():
    result = fine_tuning_break_even(
        investment=20_000, saving_per_request=0.0, requests_per_year=1_000_000
    )
    assert result.payback_years == math.inf


# --------------------------------------------------------------------------
# Context budget
# --------------------------------------------------------------------------


def test_the_context_budget_is_chosen_from_the_measured_curve():
    points = [
        ContextPoint(chunks=2, quality=0.80, cost=0.10),
        ContextPoint(chunks=3, quality=0.91, cost=0.14),
        ContextPoint(chunks=5, quality=0.92, cost=0.22),
    ]
    chosen = choose_context_budget(points, max_quality_loss=0.02)
    assert chosen.chunks == 3, "cheapest point still within the quality tolerance"


def test_a_tight_tolerance_keeps_the_expensive_point():
    points = [
        ContextPoint(chunks=2, quality=0.80, cost=0.10),
        ContextPoint(chunks=5, quality=0.92, cost=0.22),
    ]
    assert choose_context_budget(points, max_quality_loss=0.01).chunks == 5


def test_choosing_a_budget_requires_measurements():
    with pytest.raises(ValueError):
        choose_context_budget([])

