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

Open `index.html` directly in a browser, or serve the folder:

```bash
python3 -m http.server 8000
```

Then visit `http://localhost:8000`.

## Deploy to GitHub Pages

This repository ships with a GitHub Actions workflow (`.github/workflows/deploy.yml`) that validates and deploys the site automatically on every push to `main`.

One-time setup:

1. Open the repository on GitHub and go to **Settings → Pages**.
2. Under **Build and deployment**, set **Source** to **GitHub Actions**.
3. Push to `main` (or run the **Deploy to GitHub Pages** workflow manually from the **Actions** tab).

The workflow checks JavaScript syntax, uploads the static files as a Pages artifact, and publishes them. The deployed URL appears on the workflow run and in **Settings → Pages**.

## Project structure

| File | Purpose |
| --- | --- |
| `index.html` | Page shell and section containers |
| `app.js` | Curriculum data in English and French (modules, quizzes, assessments), Copilot Academy level quizzes, UI translations, and rendering logic |
| `styles.css` | Styling for the dark, responsive layout |
| `.github/workflows/deploy.yml` | CI validation and GitHub Pages deployment |
| `.nojekyll` | Disables Jekyll processing on GitHub Pages |

## Notes

- The app is dependency-free and uses browser `localStorage` to persist quiz scores, completion status, and the selected language. Progress is per-browser; use **Export progress** / **Import progress** in the overview panel to move it between devices. Quiz scores are shared across languages, so switching between English and French keeps your progress.
- Copilot Academy progress (best score per level) is stored in the same state and included in exports/imports/reset. Level unlocking is derived from best scores, so passed levels stay unlocked across sessions and languages.
- There is no test framework; validation is done through `node --check app.js` (run in CI) and direct browser verification.
