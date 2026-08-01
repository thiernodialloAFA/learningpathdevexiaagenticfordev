# Learning Path DevEx / GenAI / Agentic Interview Prep

A zero-build static application that presents a complete interview-preparation learning path for a Principal Software Engineer role focused on:

- GenAI for software development
- Agentic AI systems and LLMOps
- Developer Experience and platform engineering
- Engineering excellence and organizational impact
- Technical leadership, mentorship, and influence

## Live site

Once GitHub Pages is enabled (see below), the app is available at:

**https://thiernodialloafa.github.io/learningpathdevexiaagenticfordev/**

## What is included

- English and French versions of the full app and quizzes, selectable with the EN / FR switcher (choice is remembered per browser)
- A 20-week structured learning path across 10 modules
- Curated, authoritative resources for GenAI, agent systems, LLMOps, DevEx, engineering excellence, and staff-plus leadership
- Hard module quizzes with scoring and explanations
- **Copilot Academy**: a separate quiz track built from the [AxaFrance learning-path-copilot](https://github.com/AxaFrance/learning-path-copilot) handbook ([site](https://axafrance.github.io/learning-path-copilot/)), with six progressively unlocked levels (Beginner → Padawan → Intermediate → Confirmed → Expert → Master). Score at least 80% on a level to unlock the next; each level links the handbook modules it covers
- A global assessment aligned to Principal-level expectations
- An application plan describing the product, architecture, and roadmap for scaling this into a fuller training platform
- Local progress tracking with export, import, and reset tools

## Run locally

Because the content is loaded from JSON files with `fetch`, serve the folder over HTTP (opening `index.html` directly from disk will not load the content):

```bash
python3 -m http.server 8000
```

Then visit `http://localhost:8000`.

## Validate and test

```bash
node --check app.js                 # JavaScript syntax check
node scripts/validate-content.js    # Content schema validation
node --test tests/*.test.js         # Automated tests
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
| `app.js` | Content loading, UI translations, and rendering logic |
| `data/*.json` | Versioned content: learning plans (EN/FR), Copilot Academy levels (EN/FR), and academy settings |
| `scripts/validate-content.js` | Dependency-free schema validation for the content files |
| `tests/content.test.js` | Automated tests (content schema, EN/FR parity, quiz integrity) |
| `styles.css` | Styling for the dark, responsive layout |
| `plan.md` | Application plan and roadmap |
| `.github/workflows/deploy.yml` | CI validation and GitHub Pages deployment |
| `.nojekyll` | Disables Jekyll processing on GitHub Pages |

## Notes

- The app is dependency-free and uses browser `localStorage` to persist quiz scores, completion status, and the selected language. Progress is per-browser; use **Export progress** / **Import progress** in the overview panel to move it between devices. Quiz scores are shared across languages, so switching between English and French keeps your progress.
- Copilot Academy progress (best score per level) is stored in the same state and included in exports/imports/reset. Level unlocking is derived from best scores, so passed levels stay unlocked across sessions and languages.
- Content lives in versioned JSON files under `data/` and is validated in CI by `scripts/validate-content.js` and `node --test tests/*.test.js`, in addition to `node --check app.js`.
