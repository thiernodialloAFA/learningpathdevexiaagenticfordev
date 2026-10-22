"""Tests are the specification for lab 02."""

from __future__ import annotations

from datetime import date

from lab02_rag_baseline.retrieval import (
    Chunk,
    Entitlements,
    Retriever,
    chunk_policy,
    order_for_context,
    reciprocal_rank_fusion,
    tokenize,
    verify_citations,
)

POLICY_2019 = """
Article 1. The GAV-2019-B guaranteed accident cover applies to the insured person.
Article 4. The deductible for a bodily injury claim is set at 300 euros per event.
Article 9. Water damage caused by a swimming pool is excluded from the cover.
"""

POLICY_2024 = """
Article 1. The GAV-2024-A guaranteed accident cover applies to the insured person.
Article 4. The deductible for a bodily injury claim is set at 150 euros per event.
Article 9. Water damage caused by a swimming pool is covered up to 5000 euros.
"""

OTHER_AGENCY = """
Article 2. Confidential commission terms for the Lyon agency brokerage network.
"""


def build_corpus() -> list[Chunk]:
    chunks = chunk_policy(
        doc_id="POL-2019",
        body=POLICY_2019,
        agency="paris",
        effective_from=date(2019, 1, 1),
        effective_to=date(2023, 12, 31),
    )
    chunks += chunk_policy(
        doc_id="POL-2024",
        body=POLICY_2024,
        agency="paris",
        effective_from=date(2024, 1, 1),
    )
    chunks += chunk_policy(
        doc_id="POL-LYON",
        body=OTHER_AGENCY,
        agency="lyon",
        effective_from=date(2020, 1, 1),
    )
    return chunks


PARIS = Entitlements.of("paris")
TODAY = date(2026, 6, 1)


def test_tokenizer_keeps_hyphenated_identifiers_whole():
    assert "gav-2019-b" in tokenize("The GAV-2019-B cover")


def test_chunking_follows_the_document_structure():
    chunks = chunk_policy(
        doc_id="POL-2024", body=POLICY_2024, agency="paris", effective_from=date(2024, 1, 1)
    )
    assert [c.chunk_id for c in chunks] == ["1", "4", "9"]
    assert "150 euros" in next(c.text for c in chunks if c.chunk_id == "4")
    # Each clause stays whole, which is what makes the citation meaningful.
    assert all("Article" not in c.text for c in chunks)


def test_citation_identifies_document_and_clause():
    chunk = build_corpus()[0]
    assert chunk.citation() == "POL-2019#1 (Article 1)"


def test_exact_product_code_is_found_even_though_it_is_rare():
    retriever = Retriever(build_corpus())
    results = retriever.search("GAV-2024-A", entitlements=PARIS, when=TODAY)
    assert results, "a rare exact identifier must still be retrievable"
    assert results[0].chunk.doc_id == "POL-2024"


def test_authorisation_filters_inside_the_query_not_after():
    retriever = Retriever(build_corpus())
    results = retriever.search(
        "commission terms brokerage", entitlements=PARIS, when=TODAY, top_k=10
    )
    assert all(result.chunk.agency == "paris" for result in results)
    assert all(result.chunk.doc_id != "POL-LYON" for result in results)


def test_an_unentitled_caller_retrieves_nothing_rather_than_a_filtered_answer():
    retriever = Retriever(build_corpus())
    results = retriever.search(
        "deductible", entitlements=Entitlements.of("marseille"), when=TODAY
    )
    assert results == []


def test_temporal_validity_excludes_the_superseded_version():
    retriever = Retriever(build_corpus())
    results = retriever.search("deductible bodily injury", entitlements=PARIS, when=TODAY)
    assert results
    assert all(result.chunk.doc_id != "POL-2019" for result in results)
    assert "150 euros" in results[0].chunk.text


def test_the_historical_version_is_still_reachable_for_a_past_date():
    retriever = Retriever(build_corpus())
    results = retriever.search(
        "deductible bodily injury", entitlements=PARIS, when=date(2021, 6, 1)
    )
    assert results
    assert results[0].chunk.doc_id == "POL-2019"
    assert "300 euros" in results[0].chunk.text


def test_reciprocal_rank_fusion_rewards_agreement_between_rankings():
    lexical = [(1, 90.0), (2, 10.0)]
    dense = [(2, 0.9), (1, 0.8)]
    fused = dict(reciprocal_rank_fusion([lexical, dense]))
    # Both rankings place 1 and 2 in the top two, so their fused scores are close:
    # the incompatible raw scales (90 vs 0.9) never get added together.
    assert abs(fused[1] - fused[2]) < 0.001


def test_fusion_promotes_a_document_both_rankings_agree_on():
    lexical = [(5, 1.0), (1, 0.9), (2, 0.8)]
    dense = [(9, 1.0), (1, 0.9), (3, 0.8)]
    ordered = [index for index, _ in reciprocal_rank_fusion([lexical, dense])]
    assert ordered[0] == 1


def test_context_ordering_pushes_the_weakest_evidence_to_the_middle():
    retriever = Retriever(build_corpus())
    results = retriever.search("deductible", entitlements=PARIS, when=TODAY, top_k=5)
    if len(results) >= 3:
        ordered = order_for_context(results)
        assert ordered[0] is results[0]
        assert ordered[-1] is results[1]
        assert len(ordered) == len(results)


def test_citation_verification_drops_an_unsupported_reference():
    corpus = build_corpus()
    deductible = next(c for c in corpus if c.doc_id == "POL-2024" and c.chunk_id == "4")
    exclusion = next(c for c in corpus if c.doc_id == "POL-2024" and c.chunk_id == "9")
    claim = "The deductible for a bodily injury claim is 150 euros."
    supported = verify_citations(claim, [deductible, exclusion])
    assert deductible in supported
    assert exclusion not in supported


def test_citation_verification_refuses_an_empty_claim():
    assert verify_citations("a an the", build_corpus()) == []

