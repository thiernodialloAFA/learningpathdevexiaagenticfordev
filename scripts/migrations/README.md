# Content migrations

Dependency-free Node scripts that transform the versioned content in `data/`.

They exist because `data/plan.en.json` and `data/plan.fr.json` are large and must
stay in **strict EN/FR parity**: same module ids, same order, same number of
questions per module, and the same `answer` index for every question. Editing
them by hand breaks that invariant; a migration cannot.

## Running

Every migration supports a dry run:

```bash
node scripts/migrations/01-restructure.js --dry-run
node scripts/migrations/01-restructure.js
```

After any migration:

```bash
node scripts/validate-content.js
node --test tests/*.test.js
```

Migrations are **not idempotent** — they are applied once and then kept as a
record of how the content evolved. `02` and later refuse to run twice (duplicate
module id or duplicate prompt).

## Applied migrations

| # | Script | Effect |
| --- | --- | --- |
| 01 | `01-restructure.js` | Retargets the track from *Principal Software Engineer — DevEx / GenAI* (10 modules / 20 weeks) to *AI Engineer Expert* (11 modules at this stage / 24 weeks). Rewrites header, goals and final assessment; re-homes every question into the new taxonomy; archives out-of-scope questions into `data/archive/plan-out-of-scope.*.json`. |
| 02 | `02-module-python-prod-ai.js` | Inserts `python-prod-ai` (Week 3): 12 authored questions on async FastAPI, Pydantic contracts, retries, timeouts, lock files, secrets and bounded concurrency, plus 6 testing and CI questions recovered from the archive. |
| 03 | `03-deepen-genai-evaluation.js` | +11 questions on LLM-as-a-judge calibration and bias, CI regression gating, non-determinism, online evaluation and safety evaluation. |
| 04 | `04-deepen-ai-observability.js` | +11 questions on OpenTelemetry GenAI semantic conventions, span design, trace-to-cost correlation, SLIs and SLOs, sampling and PII-safe logging. |
| 05 | `05-deepen-ai-cost-governance.js` | +11 questions on unit-cost modelling, prompt and semantic caching, model cascades, batch APIs, provisioned throughput, fine-tuning break-even and chargeback. |
| 06 | `06-deepen-responsible-ai-regulated.js` | +13 questions on the EU AI Act, GDPR Article 22, DPIA, DORA, proxy discrimination, human oversight, model cards and post-market monitoring. |
| 07 | `07-deepen-rag-grounding.js` | +11 questions on structure-aware chunking, hybrid search, cross-encoder reranking, query rewriting, context ordering, document-level authorisation and agentic retrieval. |
| 08 | `08-scenario-case-studies.js` | Labels question formats, rewrites selected inherited questions as applied case studies and enforces at least 40% scenario questions in every module, with EN/FR format parity. |
| 09 | `09-resource-metadata-capstones.js` | Adds resource type, evidence level and an unreviewed (`null`) review date; defines the three bilingual capstones. |
| 10 | `10-refresh-resource-links.js` | Refreshes eight stale or unavailable curated links in both plan languages. |

## Writing a new migration

Use the shared helpers in `lib/insert-module.js`:

- `insertModule(spec, label)` — add a whole module at a chosen position.
- `appendQuestions(spec, label)` — add questions (and optionally resources or
  outcomes) to an existing module.

Both validate EN/FR parity before writing anything, and both honour `--dry-run`.

```js
const { appendQuestions } = require("./lib/insert-module");

appendQuestions(
  {
    moduleId: "agentic-systems",
    resources: [{ name: "…", url: "https://…" }],
    quiz: {
      en: [{ prompt: "…", options: ["…", "…"], answer: 0, explanation: "…" }],
      fr: [{ prompt: "…", options: ["…", "…"], answer: 0, explanation: "…" }],
    },
  },
  "Migration 08 — …"
);
```

### Authoring rules enforced by the tests

- Every module holds at least 12 questions; the four pillars named in the job
  description (`genai-evaluation`, `ai-observability`, `ai-cost-governance`,
  `responsible-ai-regulated`) hold at least 20.
- Prompts are unique inside a module.
- At least 40% of every module's questions are marked as applied scenarios.
- Explanations are at least 80 characters and state why the correct option is
  right **and** why each distractor is wrong.
- Resource URLs must start with `https://`.
- Resource freshness dates stay `null` until the source has actually been reviewed.
- The module id list and its order are asserted in `tests/content.test.js`.

## Archive

`data/archive/plan-out-of-scope.*.json` holds questions that left the track when
it was retargeted (DevEx metrics, platform leadership, staff-plus influence).
Nothing is deleted: a later migration can recover any of them with
`recoverFromArchive`, which also removes them from the archive so a question
never exists twice.
