# Labs — executable Python exercises

Six labs that turn the theory of the learning path into code you can run.
They cover the engineering the *AI Engineer Expert* role is actually measured
on: evaluation, observability, cost governance, reliability and guardrails.

**No API key is ever required.** Every provider, judge and clock is faked, so
the suites are deterministic, free and runnable offline — which is also the
lesson of lab 01: AI code that can only be tested against a live provider is AI
code you cannot test.

## Quick start

```bash
cd labs
python -m pip install -e ".[dev]"
python -m pytest
```

Run one lab:

```bash
python -m pytest lab03_eval_harness -v
```

## How to use a lab

**The tests are the specification.** The reference implementation is provided so
the suite is green and readable, but you learn nothing by reading it.

1. Read the lab README below and the module docstring.
2. Read the test file. It is the requirement document.
3. Delete the implementation module and rebuild it until `pytest` is green.
4. Then attempt the extensions listed under *Going further*.

```bash
git checkout -- lab03_eval_harness/harness.py   # when you want the answer back
```

## The six labs

### `lab01_chat_service` — production Python and API engineering
*Module 2 · 14 tests*

A FastAPI `/chat` endpoint with SSE streaming, a bounded-concurrency semaphore,
a whole-stream timeout, exponential backoff with jitter, `Retry-After` support,
and a correlation identifier propagated into every log line.

Key lesson: a stream that has already emitted a token must **never** be
retried — replaying it duplicates output for the user.

*Going further:* add a circuit breaker; add a second provider and fail over to
it; expose `p95_ttft` as a Prometheus metric.

### `lab02_rag_baseline` — retrieval, grounding and context engineering
*Module 3 · 13 tests · standard library only*

Structure-aware chunking of insurance policies, a BM25 lexical index, a hashed
dense index, reciprocal rank fusion, document-level authorisation, temporal
validity, context ordering and citation verification.

Key lesson: authorisation and validity filter **inside the retrieval query**.
Anything that reaches the context window can reach the answer.

*Going further:* add a cross-encoder-style reranker; add query rewriting for
conversational follow-ups; measure what happens to precision at `top_k = 20`.

### `lab03_eval_harness` — GenAI evaluation 🏛️
*Module 5 · 21 tests · standard library only*

Golden cases with answerable, unanswerable and adversarial kinds; context recall
and precision; criterion-based grading; pairwise LLM-as-a-judge with
order-swapping; Cohen's kappa against human labels; repeated runs with a
confidence interval; and a release gate.

Key lesson: the gate has **two different rules**. Quality is compared with a
tolerance because generation is stochastic; safety fails on the individual case
at any rate.

*Going further:* add context relevance per chunk; add a pointwise judge and
compare its kappa with the pairwise one; make the gate emit a Markdown summary
for a pull request comment.

### `lab04_tracing` — observability for AI applications 🏛️
*Module 6 · 19 tests · standard library only*

A miniature tracer using the OpenTelemetry `gen_ai.*` semantic conventions: a
real span tree for a RAG chain, per-span cost attribution tagged by feature and
tenant, prompt redaction before export, tail-based sampling, percentiles and a
combined latency-and-groundedness SLO.

Key lesson: a 1% uniform sample discards almost every incident. Tail rules keep
errors, slow requests and low-quality outputs by construction.

*Going further:* export to a real OTLP collector; add an inter-token latency
histogram; alert on a sustained groundedness drop.

### `lab05_cost_router` — consumption and cost governance 🏛️
*Module 7 · 21 tests · standard library only*

A unit-cost model broken down by driver, a prompt cache that only hits on a
byte-identical prefix, a semantic cache whose threshold is a correctness
control, a small-to-large cascade, fine-tuning break-even and a context-budget
chooser driven by a measured quality/cost curve.

Key lesson: **cost per call is a misleading metric.** An escalated cascade
request pays for both models, so only cost per *resolved task* is defensible.

*Going further:* add batch pricing; add provisioned throughput with an idle
penalty; produce the steering-committee one-liner automatically.

### `lab06_guardrails` — security, privacy and safety 🏛️
*Module 9 · 24 tests · standard library only*

Direct and indirect prompt-injection detection, untrusted-content wrapping, PII
redaction, credential detection, a tool allowlist with scopes and argument
validation, a human-approval path for irreversible actions, output attribution
checks, and a parametrised red-team suite.

Key lesson: when injection is detected anywhere in the context, irreversible
tools are **denied outright** — a system-prompt instruction is not an
access-control mechanism.

*Going further:* add an output classifier; add per-tenant rate limiting; extend
the red-team suite with encoded and multilingual payloads.

🏛️ = a competency the job description names explicitly.

## Continuous integration

`.github/workflows/labs.yml` runs the whole suite on Python 3.11, 3.12 and 3.13
on every change under `labs/`. It needs no secret.

## Suggested deliverables

| Lab | Deliverable to put in your portfolio |
| --- | --- |
| 01 | A service with streaming, timeout, retry, bounded concurrency and tests that run offline |
| 02 | A diagnosis note: retrieval failure vs generation failure, with the evidence for each verdict |
| 03 | A golden dataset of 50 insurance cases and a CI gate with stated thresholds |
| 04 | An instrumentation plan: span tree, attributes, six SLIs, three SLOs, five alerts |
| 05 | A cost model for 100k requests per month and a plan removing 40% with measured quality impact |
| 06 | A STRIDE threat model and a guardrail specification stating what each control blocks |

