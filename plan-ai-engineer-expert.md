# Plan d'adaptation — Parcours « AI Engineer Expert » (GenAI / Agentic, secteur assurance)

> Objectif : faire évoluer ce dépôt (aujourd'hui orienté *Principal Software Engineer — DevEx / GenAI*)
> pour couvrir **à 100 %** les compétences exigées par l'offre **AI Engineer Expert** (AXA Group),
> avec ressources officielles, quiz d'auto-évaluation, labs pratiques et rubriques de jugement.
>
> Ce document est le plan d'exécution. Il décrit quoi créer, où, avec quel schéma, et comment se mesurer.
>
> **État au 26/10/2026 — lots L1 à L12 livrés.** Le parcours est restructuré en 12 modules / 24 semaines,
> compte **236 questions** en parité EN/FR stricte, et comprend les labs, les tracks d'entretien,
> les capstones, les métadonnées des ressources et le contrôle périodique des liens. Voir §5.2 pour le détail et
> [`scripts/migrations/README.md`](scripts/migrations/README.md) pour le journal des migrations.

---

## 1. Analyse d'écart — Offre vs contenu existant

### 1.1 Décomposition de l'offre en 12 compétences cibles

| # | Compétence exigée (offre) | Preuve attendue en entretien |
| --- | --- | --- |
| C1 | Fondations LLM / GenAI applicables en production | Expliquer tokens, contexte, température, limites, choix de modèle |
| C2 | Patterns d'applications GenAI : RAG, assistants conversationnels, workflow automation | Dessiner une archi RAG et ses points de rupture |
| C3 | Systèmes agentiques / tool-using | Boucle agent, tool calling, planification, garde-fous, échec partiel |
| C4 | **Évaluation GenAI** (qualité, regression testing, LLM-as-judge, feedback humain) | Définir une suite d'éval + seuils de non-régression |
| C5 | **Observabilité IA** : tracing, latence, fiabilité, usage, coût | Instrumenter une app GenAI, lire une trace, définir SLO |
| C6 | **Gouvernance de consommation & coûts** (model selection, context mgmt, caching, routing) | Construire un modèle de coût par requête et un plan de réduction |
| C7 | Fiabilité & performance en production (latence, retries, fallback, dégradation) | Runbook d'incident sur un assistant GenAI |
| C8 | Sécurité, confidentialité, safety, guardrails | Prompt injection, PII, red teaming, DLP |
| C9 | Responsible AI & conformité en **industrie régulée** (assurance) | EU AI Act, DORA, GDPR, documentation modèle |
| C10 | Fondations software engineering de production (Python, APIs, intégration, automatisation, CI/CD) | Code review, design d'API, tests, packaging |
| C11 | Delivery & collaboration cross-fonctionnelle, ownership de work packages | Découpage, priorisation, dépendances, updates |
| C12 | Communication & traduction besoin métier → exigence technique, valeur business | Pitch 2 min + métriques, note de décision |

### 1.2 Couverture actuelle du dépôt

Contenu existant : 10 modules × 20 questions + 6 niveaux Copilot Academy × 15 questions.

| Module existant | Couvre | Verdict |
| --- | --- | --- |
| `foundations` (S1-2) | C1 | ✅ Garder tel quel |
| `agentic-systems` (S3-4) | C3 | ✅ Garder, enrichir patterns multi-agents + échecs |
| `retrieval-evals` (S5-6) | C2 + C4 (partiel) | ⚠️ **À scinder** : RAG et évaluation sont deux métiers distincts dans l'offre |
| `security-governance` (S7-8) | C8 + C9 (partiel) | ⚠️ Ajouter EU AI Act / DORA / assurance |
| `llmops-cost` (S9-10) | C5 + C6 + C7 (compressé) | ⚠️ **À scinder** : observabilité ≠ FinOps IA |
| `devex-platform` (S11-12) | — | ❌ Hors périmètre de l'offre → à **archiver** du parcours principal |
| `excellence-reliability` (S13-14) | C7 + C10 | ✅ Recentrer sur fiabilité des systèmes IA |
| `principal-systems` (S15-16) | C11 (partiel) | ⚠️ Recentrer : architecture de plateforme IA d'entreprise |
| `leadership-influence` (S17-18) | C11 | ⚠️ Réduire : l'offre est *expert contributeur*, pas manager |
| `interview-readiness` (S19-20) | C12 | ✅ Garder, réécrire les cas pour AXA / assurance |

**Écarts critiques non couverts aujourd'hui :**

1. **C4 — Évaluation GenAI comme discipline** (c'est le cœur de l'offre : « *Support key topics such as GenAI application evaluation* »). Pas de module dédié.
2. **C6 — AI cost & consumption governance** (2e topic clé explicite de l'offre). Noyé dans `llmops-cost`.
3. **C5 — Observabilité / tracing** (OpenTelemetry GenAI semantic conventions, LangSmith/Langfuse/Phoenix).
4. **C9 — Régulation assurance/finance** (EU AI Act, DORA, Solvency II, ACPR/EIOPA).
5. **C10 — Python de production pour l'IA** (le dépôt est 100 % JS : aucun exercice Python alors que l'offre dit « Python or similar »).
6. **Pratique** : aucun livrable exécutable (labs). Tout est QCM + déclaratif.

---

## 2. Parcours cible — 12 modules / 24 semaines

Nouveau `targetRole` : `AI Engineer Expert — Production GenAI, Agentic Systems, Evaluation & Cost Governance`
`readinessTarget` : `Ready to own production GenAI work packages: evaluation, observability, cost governance, safety — in a regulated insurance context`

| # | id | Semaines | Titre | Compétences |
| --- | --- | --- | --- | --- |
| 1 | `genai-foundations` | S1-2 | LLM & GenAI foundations for production engineers | C1 |
| 2 | `python-prod-ai` | S3 | **[NOUVEAU]** Production Python & API engineering for AI systems | C10 |
| 3 | `rag-grounding` | S4-5 | Retrieval, grounding and context engineering | C2 |
| 4 | `agentic-systems` | S6-7 | Agentic & tool-using systems in production | C3 |
| 5 | `genai-evaluation` | S8-10 | **[NOUVEAU — pilier]** GenAI evaluation: quality, regression, human feedback | C4 |
| 6 | `ai-observability` | S11-12 | **[NOUVEAU — pilier]** Observability & tracing for AI applications | C5 |
| 7 | `ai-cost-governance` | S13-14 | **[NOUVEAU — pilier]** AI consumption, cost drivers & usage governance | C6 |
| 8 | `ai-reliability` | S15-16 | Reliability, latency and operational maturity for AI services | C7 |
| 9 | `ai-security-safety` | S17-18 | AI security, privacy, safety & guardrails | C8 |
| 10 | `responsible-ai-regulated` | S19-20 | **[NOUVEAU]** Responsible AI in regulated industries (EU AI Act, DORA, GDPR) | C9 |
| 11 | `ai-platform-delivery` | S21-22 | AI platform patterns, reusable standards & cross-functional delivery | C11 |
| 12 | `interview-readiness-aie` | S23-24 | Interview readiness: trade-offs, metrics & stakeholder communication | C12 |

> Les 6 niveaux **Copilot Academy** sont conservés tels quels : ils restent pertinents (usage
> outillé de l'IA au quotidien) et alimentent déjà 20 % du score de readiness.

---

## 3. Contenu à produire, module par module

Format imposé par `scripts/validate-content.js` (voir §5). Pour chaque module : 5-7 ressources `https://`,
**20 questions** QCM avec `explanation` expliquant aussi pourquoi les distracteurs sont faux,
4-6 `outcomes`, 3-5 `deliverables`.

### M1 — `genai-foundations` (S1-2) *(réutilise l'existant, +5 questions)*
- **Outcomes** : tokenisation & coût, fenêtre de contexte, température/top-p, sampling, embeddings,
  limites (hallucination, cut-off), familles de modèles (reasoning vs chat vs small), structured output.
- **Ressources** : OpenAI docs (guides, structured outputs), Anthropic docs (prompt engineering, extended thinking),
  Azure OpenAI docs, Hugging Face LLM course, « A Survey of Hallucination in LLMs » (arXiv).
- **Deliverable** : fiche comparative de 4 modèles (qualité / latence / $ par 1M tokens / contexte / zone de déploiement).

### M2 — `python-prod-ai` (S3) **[NOUVEAU]**
- **Outcomes** : packaging (uv/poetry), typing + pydantic, FastAPI async & streaming (SSE),
  retries/timeouts/backoff (tenacity), tests (pytest, VCR/cassettes pour LLM), CI GitHub Actions,
  12-factor & config, structured logging.
- **Ressources** : FastAPI docs, Pydantic v2 docs, pytest docs, Python asyncio docs, OpenAI Python SDK,
  Twelve-Factor App.
- **Deliverable** : micro-service `/chat` FastAPI avec streaming, timeout, retry, cache et tests.
- **Pourquoi** : l'offre exige « strong software engineering foundations… Python, APIs, integration patterns,
  monitoring, automation ». Aujourd'hui zéro couverture.

### M3 — `rag-grounding` (S4-5)
- **Outcomes** : chunking & métadonnées, embeddings & vector stores, hybrid search (BM25 + dense),
  reranking, query rewriting, citations & attribution, context engineering / compression,
  graph & agentic RAG, modes d'échec (retrieval miss vs generation miss).
- **Ressources** : Azure AI Search RAG docs, « Retrieval-Augmented Generation » (arXiv 2005.11401),
  Anthropic Contextual Retrieval, pgvector, Elastic hybrid search guide.
- **Deliverable** : diagnostic d'un RAG défaillant — arbre de décision retrieval vs génération vs prompt.

### M4 — `agentic-systems` (S6-7)
- **Outcomes** : boucle ReAct & planification, tool/function calling et schémas, MCP,
  mémoire court/long terme, multi-agents (orchestrateur/worker, handoff), HITL & approbations,
  idempotence et compensation, budget de pas / anti-boucle, sandboxing d'outils, échecs partiels.
- **Ressources** : Anthropic « Building effective agents », OpenAI Agents/Assistants docs,
  Model Context Protocol spec, LangGraph docs, Microsoft Semantic Kernel / AutoGen docs.
- **Deliverable** : design d'un agent de traitement de sinistre : outils, garde-fous, points HITL, plan de rollback.

### M5 — `genai-evaluation` (S8-10) **[PILIER — 30 questions]**
- **Outcomes** :
  - Taxonomie : offline vs online, référence vs référence-libre, unitaire vs end-to-end.
  - Métriques RAG : context precision/recall, faithfulness/groundedness, answer relevancy.
  - **LLM-as-a-judge** : biais (position, verbosité, self-preference), calibration vs annotateurs humains,
    accord inter-juges (Cohen's κ), pairwise vs pointwise, rubriques.
  - **Regression testing** : golden datasets, snapshot/eval en CI, seuils de blocage, flakiness,
    gestion du non-déterminisme (seed, temperature 0, n-runs + variance).
  - Feedback humain : thumbs up/down, annotations expertes, échantillonnage, boucle d'amélioration.
  - Online : A/B, canary, shadow traffic, guardrail metrics.
  - Red teaming & safety evals, jeux de données adverses.
  - Reporting : dashboard d'éval, lecture par un non-technique.
- **Ressources** : OpenAI Evals (GitHub), Ragas docs, DeepEval docs, Azure AI Foundry evaluation docs,
  LangSmith evaluation docs, « Judging LLM-as-a-Judge » (arXiv 2306.05685), HELM (Stanford CRFM).
- **Deliverables** :
  1. Golden dataset de 50 cas (assurance) avec critères d'acceptation.
  2. Suite d'éval exécutable en CI avec seuils de non-régression.
  3. Note d'une page : « comment on sait que l'assistant s'est dégradé en 24 h ».

### M6 — `ai-observability` (S11-12) **[PILIER]**
- **Outcomes** : OpenTelemetry **GenAI semantic conventions** (spans `gen_ai.*`), traces/spans/attributs
  pour chaînes et agents, corrélation trace ↔ coût ↔ qualité, métriques (TTFT, tokens/s, p95 latence,
  taux d'erreur, taux de fallback, token usage), logging des prompts et **PII redaction**,
  SLI/SLO d'une app GenAI, alerting & drift d'usage, boucle trace → éval → correctif.
- **Ressources** : OpenTelemetry GenAI semantic conventions, Langfuse docs, LangSmith tracing docs,
  Arize Phoenix docs, Google SRE Workbook (SLO), Azure Monitor / Application Insights docs.
- **Deliverable** : plan d'instrumentation d'un assistant RAG (spans, attributs, 6 SLI, 3 SLO, 5 alertes).

### M7 — `ai-cost-governance` (S13-14) **[PILIER]**
- **Outcomes** : modèle de coût unitaire (input/output/cached/reasoning tokens, embeddings, re-ranking,
  vector store, egress), **model routing** (cascade small→large, classifieur de difficulté),
  **prompt caching** & semantic caching (hit rate, invalidation), compression de contexte & résumé,
  batch API & off-peak, fine-tuning/distillation vs prompting (break-even), quotas & rate limits,
  chargeback/showback par équipe, budget alerts, PTU/provisionné vs pay-as-you-go,
  arbitrage qualité/latence/coût, empreinte carbone.
- **Ressources** : OpenAI pricing & prompt caching docs, Anthropic prompt caching & batch docs,
  Azure OpenAI provisioned throughput (PTU) docs, FinOps Foundation « FinOps for AI », Azure Cost Management docs.
- **Deliverables** :
  1. Modèle de coût chiffré (tableur) d'un assistant à 100k requêtes/mois.
  2. Plan de réduction de 40 % du coût avec impact qualité quantifié.
  3. Politique de gouvernance d'usage (quotas, routage, approbations).

### M8 — `ai-reliability` (S15-16)
- **Outcomes** : budget de latence bout-en-bout, streaming & perception, timeouts/retries/jitter,
  circuit breaker, fallback multi-fournisseur, dégradation gracieuse, idempotence,
  rate limit 429 handling, capacity planning, incidents GenAI (runbook, postmortem), chaos pour IA,
  déploiements progressifs de prompts/modèles, versioning prompts & modèles, rollback.
- **Ressources** : Google SRE Book & Workbook, AWS Well-Architected Reliability Pillar,
  Azure architecture center — AI reliability, docs rate limits OpenAI/Anthropic.
- **Deliverable** : runbook d'incident « l'assistant répond faux depuis le déploiement du modèle X ».

### M9 — `ai-security-safety` (S17-18)
- **Outcomes** : **OWASP Top 10 for LLM Applications**, prompt injection directe/indirecte,
  exfiltration de données via outils, least privilege des tools, isolation d'exécution,
  PII detection & minimisation, data residency, rétention & non-entraînement sur données clients,
  secret management, supply chain IA (modèles/datasets), content filtering & safety classifiers,
  jailbreaks & red teaming, authz multi-tenant sur le retrieval (document-level security).
- **Ressources** : OWASP Top 10 for LLM Apps, NIST AI Risk Management Framework,
  MITRE ATLAS, Microsoft Responsible AI / Azure AI Content Safety docs, Anthropic safety best practices.
- **Deliverable** : threat model STRIDE adapté d'un agent qui lit des contrats clients.

### M10 — `responsible-ai-regulated` (S19-20) **[NOUVEAU]**
- **Outcomes** : **EU AI Act** (classification de risque, obligations GPAI, calendrier, documentation technique),
  GDPR (base légale, DPIA, droits, décision automatisée art. 22), **DORA** (résilience opérationnelle, tiers critiques),
  EIOPA / ACPR attentes sur l'IA en assurance, Solvency II & modèles, biais & équité en tarification/souscription,
  explicabilité et traçabilité des décisions, model cards & system cards, audit trail,
  human oversight, gestion des fournisseurs de modèles, ISO/IEC 42001.
- **Ressources** : texte EU AI Act (EUR-Lex), NIST AI RMF, EIOPA AI governance principles,
  CNIL — recommandations IA, ISO/IEC 42001 overview, EBA/DORA guidance.
- **Deliverable** : fiche de conformité d'un cas d'usage (classification AI Act + contrôles + preuves).

### M11 — `ai-platform-delivery` (S21-22)
- **Outcomes** : plateforme IA interne (gateway LLM, registre de prompts, catalogue d'outils, eval-as-a-service),
  patterns réutilisables & golden paths, SDK interne, guardrails partagés, multi-entités/multi-tenant,
  build vs buy, lifecycle governance (onboarding d'un cas d'usage → prod → décommission),
  découpage en work packages, gestion des dépendances, documentation & enablement de communauté.
- **Ressources** : Team Topologies (concepts), Azure AI Foundry / AWS Bedrock docs (plateforme),
  LiteLLM / gateway open source, Backstage docs, Google Cloud « MLOps: continuous delivery » whitepaper.
- **Deliverable** : proposition d'architecture plateforme GenAI partagée entre 5 entités + plan d'adoption.

### M12 — `interview-readiness-aie` (S23-24)
- **Outcomes** : STAR+Metrics, pitch 2 min, défense d'arbitrage qualité/coût/latence/risque,
  cas système en 45 min, lecture d'une trace en live, chiffrage à voix haute,
  communication à un public non technique, questions à poser au jury, scénarios AXA
  (souscription, sinistres, service client, conformité).
- **Deliverable** : 6 récits STAR chiffrés + 3 cas système préparés + 1 note de décision d'une page.

---

## 4. Au-delà du QCM — Nouveaux formats d'évaluation

Le moteur (`lib/engine.js`) supporte déjà : quiz (score 0-100), rubriques 4 dimensions (`scoreRubric`),
entretiens simulés (`buildInterview` / `scoreInterview`), readiness pondéré, recommandations adaptatives.
On exploite ces briques **sans casser le schéma** :

### 4.1 Questions de scénario
Garder le format QCM (contrainte du validateur) mais écrire des énoncés longs type étude de cas :
> *« Votre assistant RAG sinistres passe de 4,2 s à 11 s p95 après l'ajout d'un reranker cross-encoder.
> Le coût n'a pas bougé, la qualité +6 pts. Quelle est la **première** action ? »*

Cible : **≥ 40 % de questions de scénario** par module (contre ~10 % aujourd'hui).

### 4.2 Capstones notés par rubrique (4 dimensions existantes)
`correctness` / `depth` / `tradeoffs` / `communication`, seuil 70 %. Trois capstones :
- **CAP-1 (après M5)** : construire et défendre une suite d'évaluation pour un assistant de souscription.
- **CAP-2 (après M7)** : audit coût & observabilité d'un assistant existant + plan de réduction 40 %.
- **CAP-3 (après M10)** : dossier de mise en production conforme (AI Act + DORA + threat model + SLO).

Ces capstones passent par le flux **submissions + mentor review** déjà en place (`server/`).

### 4.3 Entretiens simulés spécialisés
Étendre `buildInterview` avec un filtre de modules (`moduleIds`) pour simuler des tracks :
« Evaluation deep-dive », « Cost & FinOps », « Safety & compliance », « System design ».

### 4.4 Labs pratiques (nouveau dossier `labs/`)
Python, exécutables, avec tests :
```
labs/
  01-chat-service/        FastAPI + streaming + retry + tests
  02-rag-baseline/        ingestion, hybrid search, citations
  03-eval-harness/        golden set + LLM-as-judge + CI gate
  04-tracing/             OpenTelemetry GenAI spans + export
  05-cost-router/         cascade small→large + cache + rapport $
  06-guardrails/          prompt injection tests + PII redaction
```
Chaque lab = 1 README (objectif, critères de réussite), 1 squelette, 1 suite de tests.

---

## 5. Changements techniques dans le dépôt

### 5.1 Contrainte à respecter — schéma de contenu
`scripts/validate-content.js` + `tests/content.test.js` imposent :
- `plan.*.json` : `duration`, `targetRole`, `readinessTarget` (strings non vides), `goals[]`,
  `modules[]` avec `id` unique, `weeks`, `title`, `objective`, `outcomes[]`, `deliverables[]`,
  `resources[{name, url https://, type?, reviewedAt?, level?}]`,
  `quiz[{prompt, options≥2, answer index valide, explanation, type?}]`,
  `finalAssessment[{title, criteria[]}]`, `applicationPlan[{title, bullets[]}]`,
  `capstones[{id, afterModule, title, description, deliverable}]`.
- **Parité EN/FR stricte** : même nombre de modules, mêmes `id` dans le même ordre, même nombre de
  questions par module, mêmes formats de questions et capstones alignés, **mêmes indices `answer`**. Toute nouvelle question doit être écrite
  simultanément dans `plan.en.json` et `plan.fr.json`.

### 5.2 Lot de travaux

| Lot | Travaux | Fichiers | Prio | État |
| --- | --- | --- | --- | --- |
| L1 | Réécrire `targetRole`, `readinessTarget`, `goals`, `duration` (24 weeks) | `data/plan.{en,fr}.json` | P0 | ✅ migration 01 |
| L2 | Restructurer en 12 modules (renommer/scinder/archiver `devex-platform`) | `data/plan.{en,fr}.json` | P0 | ✅ migrations 01-02 |
| L3 | Rédiger les 4 nouveaux modules piliers (M2, M5, M6, M7), EN+FR | `data/plan.{en,fr}.json` | P0 | ✅ migrations 02-05 |
| L4 | Rédiger M10 `responsible-ai-regulated` (assurance/EU AI Act) | `data/plan.{en,fr}.json` | P1 | ✅ migration 06 |
| L5 | Réécrire `finalAssessment` sur les 12 compétences C1-C12 | `data/plan.{en,fr}.json` | P1 | ✅ migration 01 |
| L6 | Convertir 40 % des questions existantes en scénarios | `data/plan.{en,fr}.json` | P1 | ⏳ ~45 % atteint sur les nouveaux modules, reste les modules hérités |
| L7 | Ajouter `labs/` + 6 labs Python avec tests + CI Python | `labs/`, `.github/workflows/` | P1 | ⬜ |
| L8 | Métadonnées de fraîcheur sur les ressources : `{name, url, type, reviewedAt, level}` (champs optionnels, validateur rétrocompatible) | `scripts/validate-content.js`, `data/*.json` | P2 | ⬜ |
| L9 | `buildInterview({moduleIds})` + UI de tracks d'entretien spécialisés | `lib/engine.js`, `app.js`, `tests/engine.test.js` | P2 | ⬜ |
| L10 | Vérification automatique des liens (CI hebdo) | `scripts/check-links.js`, workflow | P2 | ⬜ |
| L11 | 3 capstones CAP-1/2/3 branchés sur le flux submissions/rubriques | `data/plan.*.json`, `server/` | P2 | ⬜ |
| L12 | Pondération readiness ajustée : modules 25 % / quiz 30 % / academy 10 % / interviews 20 % / **capstones 15 %** | `lib/engine.js`, tests | P3 | ⬜ |

### 5.3 État du parcours livré

| Module | Semaines | Questions |
| --- | --- | --- |
| `genai-foundations` | 1-2 | 20 |
| `python-prod-ai` ⭐ | 3 | 18 |
| `rag-grounding` | 4-5 | 18 |
| `agentic-systems` | 6-7 | 20 |
| `genai-evaluation` 🏛️ | 8-10 | 24 |
| `ai-observability` 🏛️ | 11-12 | 20 |
| `ai-cost-governance` 🏛️ | 13-14 | 20 |
| `ai-reliability` | 15-16 | 14 |
| `ai-security-safety` | 17-18 | 13 |
| `responsible-ai-regulated` 🏛️⭐ | 19-20 | 20 |
| `ai-platform-delivery` | 21-22 | 23 |
| `interview-readiness-aie` | 23-24 | 26 |
| **Total** | **24 semaines** | **236** |

⭐ nouveau module · 🏛️ pilier explicitement nommé dans l'offre

### 5.4 Règle de non-régression

Après chaque lot : `node scripts/validate-content.js` puis `node --test tests/*.test.js` doivent passer.
`tests/content.test.js` verrouille désormais la taxonomie des 12 modules, le minimum de questions
par module (12, et 20 pour les piliers), la couverture de scénarios, les métadonnées des ressources,
l'unicité des énoncés et la longueur des explications.

---

## 6. Planning d'exécution (côté dépôt)

| Sprint | Durée | Livrable |
| --- | --- | --- |
| S1 | 1 sem. | ✅ L1 + L2 : nouvelle ossature 12 modules, contenu provisoire, tests verts |
| S2 | 2 sem. | ✅ L3 : M5 `genai-evaluation` + M6 `ai-observability` complets EN/FR |
| S3 | 2 sem. | ✅ L3 suite : M7 `ai-cost-governance` + M2 `python-prod-ai` |
| S4 | 1 sem. | ✅ L4 + L5 : conformité régulée + évaluation finale |
| S5 | 2 sem. | ✅ L7 : labs Python + CI |
| S6 | 1 sem. | ✅ L6 + L9 + L10 : scénarios, tracks d'entretien, check de liens |
| S7 | 1 sem. | ✅ L8 + L11 + L12 : fraîcheur, capstones, pondération |

---

## 7. Comment je me mesure (critères de sortie)

Prêt pour l'entretien quand **tout** est vrai :

> Cette liste mesure la progression d'un apprenant et reste à cocher pendant l'utilisation du parcours;
> elle ne représente pas des tâches de dépôt.

- [ ] Readiness score ≥ **85 %**.
- [ ] **Chaque** module ≥ 85 % au quiz, et les 4 piliers (M5, M6, M7, M10) ≥ **90 %**.
- [ ] Les 6 niveaux Copilot Academy passés (≥ 80 %).
- [ ] 3 entretiens simulés ≥ 80 % dont un track « Evaluation » et un track « Cost ».
- [ ] Rubrique d'entretien : `accuracy` ≥ 3/4, `breadth` ≥ 3/4, `consistency` ≥ 3/4.
- [ ] 3 capstones soumis et notés ≥ 70 %.
- [ ] 6 labs Python verts en CI.
- [ ] 6 récits STAR chiffrés + 3 cas système répétés à voix haute (< 45 min chacun).
- [ ] Aucune zone à risque (`riskZones`) ouverte depuis plus de 30 jours.

---

## 8. Banque de ressources de référence (socle à répartir dans les modules)

**Fondations & modèles** — OpenAI Platform docs · Anthropic docs · Azure OpenAI docs · Hugging Face LLM course
**RAG** — arXiv 2005.11401 · Azure AI Search RAG · Anthropic Contextual Retrieval · pgvector · Elastic hybrid search
**Agents** — Anthropic « Building effective agents » · Model Context Protocol · OpenAI Agents SDK · LangGraph · Semantic Kernel / AutoGen
**Évaluation** — OpenAI Evals · Ragas · DeepEval · LangSmith evaluation · arXiv 2306.05685 (LLM-as-judge) · Stanford HELM · Azure AI Foundry evaluation
**Observabilité** — OpenTelemetry GenAI semantic conventions · Langfuse · Arize Phoenix · LangSmith tracing · Google SRE Workbook
**Coût / FinOps** — OpenAI & Anthropic prompt caching + batch · Azure OpenAI PTU · FinOps Foundation (FinOps for AI) · Azure Cost Management
**Sécurité** — OWASP Top 10 for LLM Applications · NIST AI RMF · MITRE ATLAS · Azure AI Content Safety
**Régulation / assurance** — EU AI Act (EUR-Lex) · DORA · EIOPA AI governance · CNIL IA · ISO/IEC 42001 · GDPR art. 22
**Fiabilité & plateforme** — Google SRE Book · AWS Well-Architected (Reliability) · Google « MLOps » whitepaper · Team Topologies

---

## 9. État et suite

Tous les lots d'adaptation du dépôt, L1 à L12, sont livrés. La suite consiste à suivre les critères
personnels de préparation de la section 7, puis à maintenir le contenu et les liens à jour.
