# Learning Path — AI Engineer Expert (GenAI, Agentic, Evaluation & Cost Governance)

A zero-build static application that presents a complete interview-preparation learning path for an **AI Engineer Expert** role focused on:

- Production GenAI application patterns: RAG, conversational assistants, workflow automation
- Agentic and tool-using systems with bounded autonomy
- **GenAI evaluation**: golden datasets, LLM-as-a-judge, regression gating, human feedback
- **AI observability**: OpenTelemetry GenAI tracing, SLIs and SLOs, cost and quality correlation
- **AI consumption and cost governance**: model routing, caching, context budgets, quotas, chargeback
- Reliability, security, privacy and guardrails for AI services
- Responsible AI in regulated industries: EU AI Act, GDPR, DORA, insurance supervision

> The track was retargeted from a *Principal Software Engineer — DevEx / GenAI* path.
> The gap analysis, the module taxonomy and the remaining roadmap live in
> [`plan-ai-engineer-expert.md`](plan-ai-engineer-expert.md); the content transformations are
> recorded in [`scripts/migrations/README.md`](scripts/migrations/README.md).

## Live site

Once GitHub Pages is enabled (see below), the app is available at:

**https://thiernodialloafa.github.io/learningpathdevexiaagenticfordev/**

## What is included

- English and French versions of the full app and quizzes, selectable with the EN / FR switcher (choice is remembered per browser)
- A **24-week structured learning path across 12 modules** with **236 scenario-driven questions**, in strict EN/FR parity
- Four pillar modules matching the competencies the role singles out: `genai-evaluation`, `ai-observability`, `ai-cost-governance`, `responsible-ai-regulated`
- Curated, authoritative resources: OpenAI and Anthropic docs, OpenTelemetry GenAI semantic conventions, Ragas, DeepEval, OWASP Top 10 for LLM applications, NIST AI RMF, FinOps for AI, EU AI Act, DORA, EIOPA
- Hard module quizzes with scoring and explanations that justify the correct answer **and** every distractor
- **Copilot Academy**: a separate quiz track built from the [AxaFrance learning-path-copilot](https://github.com/AxaFrance/learning-path-copilot) handbook ([site](https://axafrance.github.io/learning-path-copilot/)), with six progressively unlocked levels (Beginner → Padawan → Intermediate → Confirmed → Expert → Master). Score at least 80% on a level to unlock the next; each level links the handbook modules it covers
- A global assessment built on the role's competencies, from evaluation strategy to stakeholder communication
- An application plan describing the product, architecture, and roadmap for scaling this into a fuller training platform
- Local progress tracking with export, import, and reset tools
- **Readiness dashboard**: an interview readiness score (module completion, quiz mastery, Copilot Academy, mock interviews), risk zones, and adaptive next-step recommendations
- **Mock interviews**: deterministic 10-question simulations for the full path or specialized Evaluation, Cost & FinOps, Safety & Compliance, and System Design tracks, graded with a rubric and saved as readiness snapshots
- **Capstones**: three applied assessments reviewed by mentors; passing reviews contribute 15% of interview readiness
- **Resource governance**: resource types, evidence levels, and explicit review-date status; a weekly workflow checks curated links
- **Optional server mode**: a dependency-free Node.js server (`server/`) that adds accounts with cross-device sync, server-side quiz scoring, deliverable submissions with rubric-based mentor reviews, anonymized cohorts, and a content authoring studio
- **Offline support (PWA)**: a manifest and service worker cache the app shell and content for degraded offline revision

## Learning path

| # | Module | Weeks | Questions |
| --- | --- | --- | --- |
| 1 | LLM and GenAI foundations for production engineers | 1-2 | 20 |
| 2 | Production Python and API engineering for AI systems | 3 | 18 |
| 3 | Retrieval, grounding and context engineering | 4-5 | 18 |
| 4 | Agentic and tool-using systems in production | 6-7 | 20 |
| 5 | **GenAI evaluation: quality, regression testing and human feedback** | 8-10 | 24 |
| 6 | **Observability and tracing for AI applications** | 11-12 | 20 |
| 7 | **AI consumption, cost drivers and usage governance** | 13-14 | 20 |
| 8 | Reliability, latency and operational maturity for AI services | 15-16 | 14 |
| 9 | AI security, privacy, safety and guardrails | 17-18 | 13 |
| 10 | **Responsible AI in regulated industries** | 19-20 | 20 |
| 11 | AI platform patterns, reusable standards and cross-functional delivery | 21-22 | 23 |
| 12 | Interview readiness: trade-offs, metrics and stakeholder communication | 23-24 | 26 |


## Run locally

Because the content is loaded from JSON files with `fetch`, serve the folder over HTTP (opening `index.html` directly from disk will not load the content):

```bash
python3 -m http.server 8000
```

Then visit `http://localhost:8000`.

## Run in server mode (accounts, sync, mentoring)

The same static app upgrades itself automatically when it is served by the bundled zero-dependency Node.js server:

```bash
node server/server.js            # defaults to port 3000
PORT=8080 node server/server.js  # custom port
```

Server mode adds, on top of everything the static site does:

- **Accounts & sync**: passwordless accounts based on a generated sync key (scrypt-hashed, shown once). Progress is merged across devices — no email, no password, no PII. `server/auth.js` documents OIDC as the production upgrade path.
- **Sync key reset**: a signed-in learner can rotate their own key (`POST /api/accounts/me/sync-key`, current device stays signed in, other devices are revoked); an admin can reset any account for a learner who lost their key (`POST /api/accounts/:id/sync-key`, all sessions revoked). The new key is returned once and never stored in clear text.
- **Server-side scoring**: the API serves sanitized content (no answers or explanations in the browser); quizzes and mock interviews are graded via the API, and attempt history is recorded.
- **Community**: deliverable submissions reviewed against a 4-dimension rubric, a mentor review queue (mentor/admin roles), and cohorts with anonymized aggregate stats.
- **Authoring studio**: authors/admins edit content JSON in the browser, validate it against the schema, and publish without redeploying (stored as an overlay in the data directory).
- **GDPR-friendly**: accounts can be deleted with all their data (`DELETE /api/accounts/me`); the first account created becomes admin.

State is stored as JSON files under `server/.data/` (configurable with `DATA_DIR`); the roadmap documents PostgreSQL as the scale-up path.

## Validate and test

```bash
node --check app.js                 # JavaScript syntax check
node scripts/validate-content.js    # Content schema validation
node --test tests/*.test.js         # Automated tests (content, engine, server API, PWA)
node scripts/check-links.js         # Optional live check of curated external links
```

## Deploy to GitHub Pages

This repository ships with a GitHub Actions workflow (`.github/workflows/deploy.yml`) that validates and deploys the site automatically on every push to `main`.

One-time setup:

1. Open the repository on GitHub and go to **Settings → Pages**.
2. Under **Build and deployment**, set **Source** to **GitHub Actions**.
3. Push to `main` (or run the **Deploy to GitHub Pages** workflow manually from the **Actions** tab).

The workflow checks JavaScript syntax, validates the content files, runs the automated tests, uploads the static files as a Pages artifact, and publishes them. The deployed URL appears on the workflow run and in **Settings → Pages**.

## Project structure

| File | Purpose |
| --- | --- |
| `index.html` | Page shell and section containers |
| `app.js` | Content loading, UI translations, rendering logic, and server-mode integration |
| `lib/engine.js` | Shared learning engine (scoring, readiness, recommendations, interviews, rubrics) used by the browser and the server |
| `data/*.json` | Versioned content: learning plans (EN/FR), Copilot Academy levels (EN/FR), and academy settings |
| `server/` | Optional dependency-free Node.js server: API, auth, JSON file store, content overlay/publishing |
| `scripts/validate-content.js` | Dependency-free schema validation for the content files (module + CLI) |
| `scripts/migrations/` | One-time, parity-checked content migrations |
| `scripts/check-links.js` | Deduplicated external resource-link checker (also run weekly in CI) |
| `tests/*.test.js` | Automated tests: content schema, engine, server API end-to-end, and PWA wiring |
| `styles.css` | Styling for the dark, responsive layout |
| `manifest.webmanifest`, `sw.js`, `icons/` | PWA manifest, service worker (offline cache), and app icon |
| `plan.md` | Application plan and roadmap |
| `.github/workflows/deploy.yml` | CI validation and GitHub Pages deployment |
| `.nojekyll` | Disables Jekyll processing on GitHub Pages |

## Notes

- The app is dependency-free and uses browser `localStorage` to persist quiz scores, completion status, and the selected language. Progress is per-browser; use **Export progress** / **Import progress** in the overview panel to move it between devices. Quiz scores are shared across languages, so switching between English and French keeps your progress.
- Copilot Academy progress (best score per level) is stored in the same state and included in exports/imports/reset. Level unlocking is derived from best scores, so passed levels stay unlocked across sessions and languages.
- Content lives in versioned JSON files under `data/` and is validated in CI by `scripts/validate-content.js` and `node --test tests/*.test.js`, in addition to `node --check app.js`.
- The GitHub Pages deployment stays fully static: the app probes `api/health` at startup and only shows the account, community, and authoring panels when the server answers. In server mode the `data/` directory is not served directly — the API serves sanitized content so answers stay server-side.
