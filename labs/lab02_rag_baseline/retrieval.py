"""Lab 02 — a RAG retrieval layer you can reason about.

No vector database, no embedding API: a deterministic hashed embedding and a
BM25-style lexical index are enough to make the real engineering lessons visible.

What this lab actually teaches:
  * structure-aware chunking beats fixed windows on structured documents
  * exact identifiers are a lexical problem, which dense retrieval loses
  * authorisation and validity must filter at retrieval, never in the prompt
  * fusing two rankings needs a rank-based rule, not score addition
  * a citation is only worth something if it is verified against the claim
"""

from __future__ import annotations

import hashlib
import math
import re
from collections import Counter
from dataclasses import dataclass, field
from datetime import date
from typing import Iterable, Sequence

TOKEN_RE = re.compile(r"[a-z0-9]+(?:-[a-z0-9]+)*", re.IGNORECASE)
# The clause number must not swallow the punctuation that follows it, otherwise
# every citation reads "Article 1." and no two documents can be compared.
CLAUSE_RE = re.compile(
    r"^\s*(?:Article|Clause)\s+(\d+(?:\.\d+)*|[A-Za-z0-9][A-Za-z0-9\-]*)\s*[.:\u2014-]?\s*",
    re.IGNORECASE,
)

EMBEDDING_DIM = 64


def tokenize(text: str) -> list[str]:
    """Lowercase tokens, keeping hyphenated identifiers such as GAV-2019-B intact."""
    return [match.group(0).lower() for match in TOKEN_RE.finditer(text)]


@dataclass(frozen=True)
class Chunk:
    """A retrievable unit that knows where it came from and who may read it."""

    doc_id: str
    chunk_id: str
    section: str
    text: str
    agency: str
    effective_from: date
    effective_to: date | None = None

    def is_valid_on(self, when: date) -> bool:
        if when < self.effective_from:
            return False
        return self.effective_to is None or when <= self.effective_to

    def citation(self) -> str:
        return f"{self.doc_id}#{self.chunk_id} ({self.section})"


@dataclass(frozen=True)
class Entitlements:
    """What the caller is allowed to see. Enforced inside the query, not after."""

    agencies: frozenset[str]

    @classmethod
    def of(cls, *agencies: str) -> "Entitlements":
        return cls(frozenset(agencies))

    def allows(self, chunk: Chunk) -> bool:
        return chunk.agency in self.agencies


def chunk_policy(
    *,
    doc_id: str,
    body: str,
    agency: str,
    effective_from: date,
    effective_to: date | None = None,
) -> list[Chunk]:
    """Split on the document's own clause structure, keeping each clause whole.

    A fixed 512-token window would cut clauses in half and destroy the citation,
    which is the unit a customer and an auditor actually care about.
    """
    chunks: list[Chunk] = []
    current_heading: str | None = None
    current_lines: list[str] = []

    def flush() -> None:
        if current_heading is None:
            return
        text = " ".join(line.strip() for line in current_lines if line.strip())
        if text:
            chunks.append(
                Chunk(
                    doc_id=doc_id,
                    chunk_id=current_heading,
                    section=f"Article {current_heading}",
                    text=text,
                    agency=agency,
                    effective_from=effective_from,
                    effective_to=effective_to,
                )
            )

    for line in body.splitlines():
        match = CLAUSE_RE.match(line)
        if match:
            flush()
            current_heading = match.group(1)
            current_lines = [line[match.end() :]]
        else:
            current_lines.append(line)
    flush()
    return chunks


def embed(text: str) -> list[float]:
    """A deterministic bag-of-words hash embedding.

    It is not a good embedding. It is a *reproducible* one, which is what a lab
    needs: the lesson is about the retrieval architecture, not the encoder.
    """
    vector = [0.0] * EMBEDDING_DIM
    for token in tokenize(text):
        digest = hashlib.sha256(token.encode("utf-8")).digest()
        index = digest[0] % EMBEDDING_DIM
        sign = 1.0 if digest[1] % 2 == 0 else -1.0
        vector[index] += sign
    norm = math.sqrt(sum(value * value for value in vector)) or 1.0
    return [value / norm for value in vector]


def cosine(left: Sequence[float], right: Sequence[float]) -> float:
    return sum(a * b for a, b in zip(left, right))


class LexicalIndex:
    """BM25. The only thing that reliably finds a rare exact token."""

    def __init__(self, chunks: Sequence[Chunk], *, k1: float = 1.5, b: float = 0.75) -> None:
        self.chunks = list(chunks)
        self.k1 = k1
        self.b = b
        self._tokens = [tokenize(c.text + " " + c.section) for c in self.chunks]
        self._lengths = [len(t) for t in self._tokens]
        self._avg_length = (sum(self._lengths) / len(self._lengths)) if self._lengths else 0.0
        self._df: Counter[str] = Counter()
        for tokens in self._tokens:
            self._df.update(set(tokens))

    def _idf(self, term: str) -> float:
        n = len(self.chunks)
        df = self._df.get(term, 0)
        return math.log(1 + (n - df + 0.5) / (df + 0.5))

    def search(self, query: str, candidates: Iterable[int]) -> list[tuple[int, float]]:
        terms = tokenize(query)
        scored: list[tuple[int, float]] = []
        for index in candidates:
            counts = Counter(self._tokens[index])
            length = self._lengths[index] or 1
            score = 0.0
            for term in terms:
                tf = counts.get(term, 0)
                if tf == 0:
                    continue
                denominator = tf + self.k1 * (
                    1 - self.b + self.b * length / (self._avg_length or 1)
                )
                score += self._idf(term) * (tf * (self.k1 + 1)) / denominator
            if score > 0:
                scored.append((index, score))
        scored.sort(key=lambda item: (-item[1], item[0]))
        return scored


class DenseIndex:
    """Semantic recall: finds paraphrases that share no vocabulary."""

    def __init__(self, chunks: Sequence[Chunk]) -> None:
        self.chunks = list(chunks)
        self._vectors = [embed(c.text + " " + c.section) for c in self.chunks]

    def search(self, query: str, candidates: Iterable[int]) -> list[tuple[int, float]]:
        query_vector = embed(query)
        scored = [(index, cosine(query_vector, self._vectors[index])) for index in candidates]
        scored = [(index, score) for index, score in scored if score > 0]
        scored.sort(key=lambda item: (-item[1], item[0]))
        return scored


def reciprocal_rank_fusion(
    rankings: Sequence[Sequence[tuple[int, float]]], *, k: int = 60
) -> list[tuple[int, float]]:
    """Fuse rankings by rank, not by score.

    Lexical and dense scores live on incompatible scales, so adding them lets
    whichever scale happens to be larger dominate the result.
    """
    fused: dict[int, float] = {}
    for ranking in rankings:
        for rank, (index, _score) in enumerate(ranking):
            fused[index] = fused.get(index, 0.0) + 1.0 / (k + rank + 1)
    ordered = sorted(fused.items(), key=lambda item: (-item[1], item[0]))
    return ordered


@dataclass
class RetrievalResult:
    chunk: Chunk
    score: float
    rank: int


@dataclass
class Retriever:
    """Hybrid retrieval with authorisation and temporal validity applied first."""

    chunks: list[Chunk] = field(default_factory=list)

    def __post_init__(self) -> None:
        self.lexical = LexicalIndex(self.chunks)
        self.dense = DenseIndex(self.chunks)

    def _allowed(self, entitlements: Entitlements, when: date) -> list[int]:
        return [
            index
            for index, chunk in enumerate(self.chunks)
            if entitlements.allows(chunk) and chunk.is_valid_on(when)
        ]

    def search(
        self,
        query: str,
        *,
        entitlements: Entitlements,
        when: date,
        top_k: int = 5,
    ) -> list[RetrievalResult]:
        candidates = self._allowed(entitlements, when)
        if not candidates:
            return []
        fused = reciprocal_rank_fusion(
            [
                self.lexical.search(query, candidates),
                self.dense.search(query, candidates),
            ]
        )
        return [
            RetrievalResult(chunk=self.chunks[index], score=score, rank=rank)
            for rank, (index, score) in enumerate(fused[:top_k])
        ]


def order_for_context(results: Sequence[RetrievalResult]) -> list[RetrievalResult]:
    """Put the strongest evidence at the edges of the context window.

    Models attend unevenly across a long context, so the weakest candidates
    belong in the middle where attention is lowest.
    """
    if len(results) <= 2:
        return list(results)
    head: list[RetrievalResult] = []
    tail: list[RetrievalResult] = []
    for position, result in enumerate(results):
        (head if position % 2 == 0 else tail).append(result)
    return head + list(reversed(tail))


def verify_citations(claim: str, cited: Sequence[Chunk], *, min_overlap: float = 0.3) -> list[Chunk]:
    """Keep only the citations whose text actually supports the claim.

    An unverified citation is decoration: it looks like evidence and is not.
    """
    claim_terms = {term for term in tokenize(claim) if len(term) > 3}
    if not claim_terms:
        return []
    supported = []
    for chunk in cited:
        chunk_terms = set(tokenize(chunk.text))
        overlap = len(claim_terms & chunk_terms) / len(claim_terms)
        if overlap >= min_overlap:
            supported.append(chunk)
    return supported


