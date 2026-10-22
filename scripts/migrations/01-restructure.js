#!/usr/bin/env node
/**
 * Migration 01 — Restructure the learning path from
 *   "Principal Software Engineer — DevEx / GenAI"  (10 modules / 20 weeks)
 * to
 *   "AI Engineer Expert — Production GenAI, Agentic, Evaluation & Cost Governance"
 *   (12 modules / 24 weeks, see plan-ai-engineer-expert.md).
 *
 * This migration is STRUCTURAL only: it re-homes existing questions into the new
 * module taxonomy, rewrites module metadata (title/objective/outcomes/deliverables/
 * resources) and the plan header. Brand-new modules and top-up questions are added
 * by the following migrations.
 *
 * Strict EN/FR parity is guaranteed because questions are moved by index.
 *
 * Usage: node scripts/migrations/01-restructure.js [--dry-run]
 */

const fs = require("node:fs");
const path = require("node:path");

const ROOT = path.resolve(__dirname, "..", "..");
const DATA = path.join(ROOT, "data");
const ARCHIVE = path.join(DATA, "archive");
const DRY_RUN = process.argv.includes("--dry-run");

/* ------------------------------------------------------------------ */
/* 1. Plan header                                                      */
/* ------------------------------------------------------------------ */

const HEADER = {
  en: {
    duration: "24 weeks",
    targetRole:
      "AI Engineer Expert — Production GenAI, Agentic Systems, Evaluation & Cost Governance",
    readinessTarget:
      "Ready to own production GenAI work packages end to end: evaluation, observability, cost governance, reliability and safety, in a regulated insurance context",
    goals: [
      "Build production-grade GenAI and agentic systems, not demos",
      "Master GenAI evaluation: golden datasets, LLM-as-a-judge, regression gates, human feedback",
      "Instrument AI applications with tracing, quality, latency, usage and cost telemetry",
      "Govern AI consumption and cost: model selection, routing, caching, context budgets, quotas",
      "Engineer reliability, safety, privacy and guardrails for tool-using systems",
      "Apply responsible-AI and regulatory requirements of insurance and financial services",
      "Translate business needs into technical requirements and communicate trade-offs with metrics",
      "Finish with an evidence portfolio: evals, dashboards, cost models and capstones usable in interviews",
    ],
  },
  fr: {
    duration: "24 semaines",
    targetRole:
      "AI Engineer Expert — GenAI en production, systèmes agentiques, évaluation et gouvernance des coûts",
    readinessTarget:
      "Capable de porter de bout en bout un lot de travaux GenAI en production : évaluation, observabilité, gouvernance des coûts, fiabilité et sécurité, dans un contexte assurance régulé",
    goals: [
      "Construire des systèmes GenAI et agentiques de qualité production, pas des démos",
      "Maîtriser l'évaluation GenAI : jeux de référence, LLM-as-a-judge, garde-fous de non-régression, feedback humain",
      "Instrumenter les applications IA : traces, qualité, latence, usage et télémétrie de coût",
      "Gouverner la consommation et le coût IA : choix de modèle, routage, cache, budget de contexte, quotas",
      "Concevoir fiabilité, sécurité, confidentialité et garde-fous pour les systèmes outillés",
      "Appliquer les exigences d'IA responsable et de conformité de l'assurance et de la finance",
      "Traduire un besoin métier en exigence technique et communiquer les arbitrages avec des métriques",
      "Terminer avec un portfolio de preuves : évaluations, tableaux de bord, modèles de coût et capstones utilisables en entretien",
    ],
  },
};

/* ------------------------------------------------------------------ */
/* 2. Target module taxonomy                                           */
/* ------------------------------------------------------------------ */

/**
 * `from` entries are [sourceModuleId, [questionIndices]] applied in order.
 * Indices refer to the CURRENT data/plan.en.json (identical in plan.fr.json).
 */
const MODULES = [
  {
    id: "genai-foundations",
    from: [["foundations", "*"]],
    weeks: { en: "Weeks 1-2", fr: "Semaines 1-2" },
    title: {
      en: "LLM and GenAI foundations for production engineers",
      fr: "Fondations LLM et GenAI pour ingénieurs de production",
    },
    objective: {
      en: "Build an accurate mental model of how modern models behave so that every downstream decision — model choice, prompt, context budget, guardrail — is grounded in how the technology actually works.",
      fr: "Construire un modèle mental exact du comportement des modèles modernes afin que chaque décision en aval — choix de modèle, prompt, budget de contexte, garde-fou — repose sur le fonctionnement réel de la technologie.",
    },
    outcomes: {
      en: [
        "Explain tokenisation, context windows, sampling parameters and their cost and latency consequences",
        "Compare model families (reasoning, chat, small, embedding) and justify a selection for a given task",
        "Use structured output, function schemas and deterministic settings where correctness matters",
        "Name the real failure modes — hallucination, knowledge cut-off, context rot, prompt sensitivity — and their mitigations",
      ],
      fr: [
        "Expliquer la tokenisation, les fenêtres de contexte, les paramètres d'échantillonnage et leurs conséquences en coût et latence",
        "Comparer les familles de modèles (raisonnement, chat, petits modèles, embeddings) et justifier un choix pour une tâche donnée",
        "Utiliser la sortie structurée, les schémas de fonction et les réglages déterministes là où la justesse compte",
        "Nommer les vrais modes de défaillance — hallucination, date de coupure, dégradation du contexte, sensibilité au prompt — et leurs mitigations",
      ],
    },
    deliverables: {
      en: [
        "A comparison sheet of four candidate models: quality, p95 latency, cost per 1M tokens, context window, deployment region",
        "A one-page note explaining to a non-technical stakeholder why a model can be confidently wrong",
      ],
      fr: [
        "Une fiche comparative de quatre modèles candidats : qualité, latence p95, coût par million de tokens, fenêtre de contexte, région de déploiement",
        "Une note d'une page expliquant à une partie prenante non technique pourquoi un modèle peut se tromper avec assurance",
      ],
    },
    resources: [
      { name: "OpenAI Platform — developer guides", url: "https://platform.openai.com/docs/guides" },
      { name: "Anthropic — build with Claude documentation", url: "https://docs.anthropic.com/en/docs/build-with-claude/overview" },
      { name: "Azure OpenAI Service documentation", url: "https://learn.microsoft.com/en-us/azure/ai-services/openai/" },
      { name: "Hugging Face — LLM course", url: "https://huggingface.co/learn/llm-course" },
      { name: "A survey of hallucination in large language models (arXiv)", url: "https://arxiv.org/abs/2311.05232" },
    ],
  },

  {
    id: "rag-grounding",
    from: [["retrieval-evals", [1, 3, 7, 9, 10, 15, 16]]],
    weeks: { en: "Weeks 4-5", fr: "Semaines 4-5" },
    title: {
      en: "Retrieval, grounding and context engineering",
      fr: "Recherche, ancrage et ingénierie du contexte",
    },
    objective: {
      en: "Design retrieval pipelines that put the right evidence in the context window, keep provenance intact, and fail in ways you can diagnose.",
      fr: "Concevoir des chaînes de recherche qui placent la bonne preuve dans la fenêtre de contexte, préservent la provenance et échouent de manière diagnosticable.",
    },
    outcomes: {
      en: [
        "Choose chunking, metadata and indexing strategies that match the document corpus and the query shape",
        "Combine lexical and dense retrieval, reranking and query rewriting, and justify each stage by its measured gain",
        "Enforce citations, attribution and document-level authorisation in the retrieval layer",
        "Separate retrieval failures from generation failures with a diagnostic decision tree",
      ],
      fr: [
        "Choisir des stratégies de découpage, de métadonnées et d'indexation adaptées au corpus et à la forme des requêtes",
        "Combiner recherche lexicale et dense, reranking et réécriture de requête, et justifier chaque étape par son gain mesuré",
        "Imposer citations, attribution et autorisation au niveau document dans la couche de recherche",
        "Distinguer les échecs de recherche des échecs de génération via un arbre de décision diagnostique",
      ],
    },
    deliverables: {
      en: [
        "A diagnosis of a failing RAG assistant: retrieval vs generation vs prompt, with the evidence used for each verdict",
        "A context budget for one assistant: what enters the window, in what order, and what is dropped first under pressure",
      ],
      fr: [
        "Le diagnostic d'un assistant RAG défaillant : recherche, génération ou prompt, avec la preuve retenue pour chaque verdict",
        "Un budget de contexte pour un assistant : ce qui entre dans la fenêtre, dans quel ordre, et ce qui saute en premier sous contrainte",
      ],
    },
    resources: [
      { name: "Retrieval-Augmented Generation for knowledge-intensive NLP (arXiv)", url: "https://arxiv.org/abs/2005.11401" },
      { name: "Azure AI Search — retrieval augmented generation overview", url: "https://learn.microsoft.com/en-us/azure/search/retrieval-augmented-generation-overview" },
      { name: "Anthropic — contextual retrieval", url: "https://www.anthropic.com/news/contextual-retrieval" },
      { name: "pgvector — vector similarity search for Postgres", url: "https://github.com/pgvector/pgvector" },
      { name: "Elasticsearch — hybrid search with reciprocal rank fusion", url: "https://www.elastic.co/docs/solutions/search/hybrid-search" },
    ],
  },

  {
    id: "agentic-systems",
    from: [["agentic-systems", "*"]],
    weeks: { en: "Weeks 6-7", fr: "Semaines 6-7" },
    title: {
      en: "Agentic and tool-using systems in production",
      fr: "Systèmes agentiques et outillés en production",
    },
    objective: {
      en: "Decide when an agent is the right pattern, and engineer the loop, the tools and the guardrails so that autonomy stays bounded, observable and reversible.",
      fr: "Décider quand un agent est le bon pattern, puis concevoir la boucle, les outils et les garde-fous pour que l'autonomie reste bornée, observable et réversible.",
    },
    outcomes: {
      en: [
        "Choose between a deterministic workflow, a single tool-using assistant and a multi-agent orchestration, with the cost of each",
        "Design tool schemas, least-privilege scopes, sandboxing and MCP integrations",
        "Bound the loop: step budgets, loop detection, timeouts, compensation and idempotency",
        "Place human-in-the-loop approvals where an irreversible action would otherwise occur",
      ],
      fr: [
        "Arbitrer entre workflow déterministe, assistant outillé unique et orchestration multi-agents, avec le coût de chacun",
        "Concevoir les schémas d'outils, les périmètres de moindre privilège, le bac à sable et les intégrations MCP",
        "Borner la boucle : budget de pas, détection de boucle, délais, compensation et idempotence",
        "Placer les validations humaines là où une action irréversible aurait lieu sans elles",
      ],
    },
    deliverables: {
      en: [
        "An agent design for a claims-handling task: tool inventory, permission scopes, HITL checkpoints, rollback plan",
        "A failure catalogue for that agent: partial failure, tool timeout, hallucinated argument, infinite loop, and the control for each",
      ],
      fr: [
        "La conception d'un agent de traitement de sinistre : inventaire d'outils, périmètres de permission, points de validation humaine, plan de retour arrière",
        "Le catalogue de défaillances de cet agent : échec partiel, délai d'outil, argument halluciné, boucle infinie, et le contrôle associé à chacun",
      ],
    },
    resources: [
      { name: "Anthropic — building effective agents", url: "https://www.anthropic.com/engineering/building-effective-agents" },
      { name: "Model Context Protocol — specification", url: "https://modelcontextprotocol.io/specification/2025-06-18" },
      { name: "OpenAI — agents guide", url: "https://platform.openai.com/docs/guides/agents" },
      { name: "LangGraph documentation", url: "https://langchain-ai.github.io/langgraph/" },
      { name: "Microsoft Semantic Kernel documentation", url: "https://learn.microsoft.com/en-us/semantic-kernel/overview/" },
    ],
  },

  {
    id: "genai-evaluation",
    from: [["retrieval-evals", [0, 2, 4, 5, 6, 8, 11, 12, 13, 14, 17, 18, 19]]],
    weeks: { en: "Weeks 8-10", fr: "Semaines 8-10" },
    title: {
      en: "GenAI evaluation: quality, regression testing and human feedback",
      fr: "Évaluation GenAI : qualité, non-régression et feedback humain",
    },
    objective: {
      en: "Own the discipline the role is built on: define what good means for a GenAI application, measure it reproducibly, block regressions in CI, and keep the measurement honest with human feedback.",
      fr: "Maîtriser la discipline au cœur du poste : définir ce que « bon » signifie pour une application GenAI, le mesurer de façon reproductible, bloquer les régressions en CI et garder la mesure honnête grâce au feedback humain.",
    },
    outcomes: {
      en: [
        "Build golden datasets with acceptance criteria, negative cases and unanswerable questions",
        "Select metrics per layer: retrieval (context precision and recall), generation (faithfulness, relevancy), task success",
        "Operate LLM-as-a-judge safely: rubrics, pairwise comparison, known biases, calibration against human annotators",
        "Gate releases with regression thresholds while handling non-determinism and flakiness",
        "Close the loop with online evaluation: A/B, canary, shadow traffic, guardrail metrics and user feedback",
        "Report evaluation results so that a non-technical stakeholder can act on them",
      ],
      fr: [
        "Construire des jeux de référence avec critères d'acceptation, cas négatifs et questions sans réponse",
        "Choisir les métriques par couche : recherche (précision et rappel du contexte), génération (fidélité, pertinence), réussite de la tâche",
        "Utiliser le LLM-as-a-judge sans se tromper : rubriques, comparaison par paires, biais connus, calibration face aux annotateurs humains",
        "Verrouiller les livraisons par des seuils de non-régression tout en gérant le non-déterminisme et l'instabilité",
        "Boucler avec l'évaluation en ligne : A/B, canari, trafic fantôme, métriques garde-fous et retours utilisateurs",
        "Restituer les résultats d'évaluation pour qu'une partie prenante non technique puisse décider",
      ],
    },
    deliverables: {
      en: [
        "A golden dataset of 50 insurance cases with expected evidence and acceptance criteria",
        "An executable evaluation suite wired into CI with explicit regression thresholds",
        "A one-page note answering: how would we know within 24 hours that the assistant has degraded?",
      ],
      fr: [
        "Un jeu de référence de 50 cas d'assurance avec preuves attendues et critères d'acceptation",
        "Une suite d'évaluation exécutable branchée en CI avec des seuils de non-régression explicites",
        "Une note d'une page répondant à : comment saurions-nous en moins de 24 heures que l'assistant s'est dégradé ?",
      ],
    },
    resources: [
      { name: "OpenAI Evals framework", url: "https://github.com/openai/evals" },
      { name: "Ragas — evaluation framework for RAG applications", url: "https://docs.ragas.io/en/stable/" },
      { name: "DeepEval — LLM evaluation framework", url: "https://deepeval.com/docs/getting-started" },
      { name: "Judging LLM-as-a-judge with MT-Bench and Chatbot Arena (arXiv)", url: "https://arxiv.org/abs/2306.05685" },
      { name: "Azure AI Foundry — evaluation of generative AI applications", url: "https://learn.microsoft.com/en-us/azure/ai-foundry/concepts/evaluation-approach-gen-ai" },
      { name: "LangSmith — evaluation concepts", url: "https://docs.langchain.com/langsmith/evaluation-concepts" },
      { name: "Stanford CRFM — Holistic Evaluation of Language Models (HELM)", url: "https://crfm.stanford.edu/helm/" },
    ],
  },

  {
    id: "ai-observability",
    from: [
      ["llmops-cost", [2, 4, 7, 14]],
      ["excellence-reliability", [0, 6, 9, 16, 19]],
    ],
    weeks: { en: "Weeks 11-12", fr: "Semaines 11-12" },
    title: {
      en: "Observability and tracing for AI applications",
      fr: "Observabilité et traçage des applications IA",
    },
    objective: {
      en: "Make a GenAI system legible in production: every call traced, every trace correlated to quality, latency and cost, every degradation surfaced before the business notices.",
      fr: "Rendre un système GenAI lisible en production : chaque appel tracé, chaque trace corrélée à la qualité, la latence et le coût, chaque dégradation détectée avant le métier.",
    },
    outcomes: {
      en: [
        "Instrument chains and agents with OpenTelemetry GenAI semantic conventions and meaningful span attributes",
        "Correlate a single trace to its quality score, token usage and euro cost",
        "Define the SLI and SLO set of a GenAI feature: TTFT, p95 latency, error rate, fallback rate, groundedness",
        "Log prompts and outputs safely: sampling, redaction of personal data, retention limits",
        "Turn traces into improvement: from production trace to evaluation case to fix",
      ],
      fr: [
        "Instrumenter chaînes et agents avec les conventions sémantiques GenAI d'OpenTelemetry et des attributs de span utiles",
        "Corréler une trace unique à son score de qualité, sa consommation de tokens et son coût en euros",
        "Définir les SLI et SLO d'une fonctionnalité GenAI : TTFT, latence p95, taux d'erreur, taux de repli, ancrage",
        "Journaliser prompts et réponses sans risque : échantillonnage, masquage des données personnelles, durées de rétention",
        "Transformer les traces en amélioration : de la trace de production au cas d'évaluation puis au correctif",
      ],
    },
    deliverables: {
      en: [
        "An instrumentation plan for a RAG assistant: span tree, attributes, six SLIs, three SLOs, five alerts",
        "A redaction and retention policy for prompt and completion logs",
      ],
      fr: [
        "Un plan d'instrumentation pour un assistant RAG : arbre de spans, attributs, six SLI, trois SLO, cinq alertes",
        "Une politique de masquage et de rétention pour les journaux de prompts et de réponses",
      ],
    },
    resources: [
      { name: "OpenTelemetry — semantic conventions for generative AI", url: "https://opentelemetry.io/docs/specs/semconv/gen-ai/" },
      { name: "Langfuse — tracing documentation", url: "https://langfuse.com/docs/tracing" },
      { name: "Arize Phoenix — LLM tracing and evaluation", url: "https://arize.com/docs/phoenix" },
      { name: "LangSmith — observability concepts", url: "https://docs.langchain.com/langsmith/observability-concepts" },
      { name: "Google SRE Workbook — implementing SLOs", url: "https://sre.google/workbook/implementing-slos/" },
    ],
  },

  {
    id: "ai-cost-governance",
    from: [["llmops-cost", [0, 3, 5, 9, 11, 12, 15, 17, 19]]],
    weeks: { en: "Weeks 13-14", fr: "Semaines 13-14" },
    title: {
      en: "AI consumption, cost drivers and usage governance",
      fr: "Consommation IA, inducteurs de coût et gouvernance d'usage",
    },
    objective: {
      en: "Own the second pillar of the role: build a defensible unit-cost model for a GenAI product, cut spend without silently cutting quality, and govern consumption across entities.",
      fr: "Maîtriser le second pilier du poste : bâtir un modèle de coût unitaire défendable pour un produit GenAI, réduire la dépense sans dégrader silencieusement la qualité, et gouverner la consommation entre entités.",
    },
    outcomes: {
      en: [
        "Model unit cost precisely: input, output, cached and reasoning tokens, embeddings, reranking, vector store, egress",
        "Apply the main levers — model routing and cascades, prompt and semantic caching, context compression, batch APIs",
        "Decide between prompting, fine-tuning and distillation using a break-even analysis",
        "Compare pay-as-you-go against provisioned throughput for a known traffic profile",
        "Govern usage across teams: quotas, rate limits, chargeback and showback, budget alerts, approval paths",
        "Express every saving as a quality, latency and risk trade-off rather than a pure number",
      ],
      fr: [
        "Modéliser finement le coût unitaire : tokens d'entrée, de sortie, en cache et de raisonnement, embeddings, reranking, base vectorielle, sortie réseau",
        "Appliquer les leviers principaux — routage et cascade de modèles, cache de prompt et sémantique, compression de contexte, API batch",
        "Arbitrer entre prompting, fine-tuning et distillation à l'aide d'une analyse de seuil de rentabilité",
        "Comparer le paiement à l'usage et le débit provisionné pour un profil de trafic connu",
        "Gouverner l'usage entre équipes : quotas, limites de débit, refacturation et visibilité, alertes budgétaires, circuits d'approbation",
        "Exprimer chaque économie comme un arbitrage qualité, latence et risque plutôt qu'un simple chiffre",
      ],
    },
    deliverables: {
      en: [
        "A quantified cost model for an assistant serving 100k requests per month, broken down by driver",
        "A plan that removes 40% of that cost, with the measured quality impact of each lever",
        "A usage governance policy: quotas, routing rules, approval thresholds, budget alerting",
      ],
      fr: [
        "Un modèle de coût chiffré pour un assistant à 100 000 requêtes par mois, ventilé par inducteur",
        "Un plan supprimant 40 % de ce coût, avec l'impact qualité mesuré de chaque levier",
        "Une politique de gouvernance d'usage : quotas, règles de routage, seuils d'approbation, alertes budgétaires",
      ],
    },
    resources: [
      { name: "OpenAI — prompt caching guide", url: "https://platform.openai.com/docs/guides/prompt-caching" },
      { name: "Anthropic — prompt caching", url: "https://docs.anthropic.com/en/docs/build-with-claude/prompt-caching" },
      { name: "Anthropic — message batches API", url: "https://docs.anthropic.com/en/docs/build-with-claude/batch-processing" },
      { name: "Azure OpenAI — provisioned throughput (PTU)", url: "https://learn.microsoft.com/en-us/azure/ai-services/openai/concepts/provisioned-throughput" },
      { name: "FinOps Foundation — FinOps for AI", url: "https://www.finops.org/wg/finops-for-ai-overview/" },
      { name: "Microsoft Cost Management documentation", url: "https://learn.microsoft.com/en-us/azure/cost-management-billing/" },
    ],
  },

  {
    id: "ai-reliability",
    from: [
      ["llmops-cost", [1, 6, 8, 10, 13, 16, 18]],
      ["excellence-reliability", [3, 5, 8, 10, 12, 13, 17]],
    ],
    weeks: { en: "Weeks 15-16", fr: "Semaines 15-16" },
    title: {
      en: "Reliability, latency and operational maturity for AI services",
      fr: "Fiabilité, latence et maturité opérationnelle des services IA",
    },
    objective: {
      en: "Run GenAI systems that degrade gracefully: latency budgets, provider failover, versioned prompts and models, progressive rollout and incident response built for probabilistic components.",
      fr: "Exploiter des systèmes GenAI qui se dégradent proprement : budgets de latence, bascule de fournisseur, prompts et modèles versionnés, déploiement progressif et réponse à incident conçue pour des composants probabilistes.",
    },
    outcomes: {
      en: [
        "Build an end-to-end latency budget and use streaming to manage perceived latency",
        "Apply timeouts, retries with jitter, circuit breakers, rate-limit handling and multi-provider fallback",
        "Version and roll out prompts and models progressively, with a rollback unit that actually works",
        "Write and rehearse a GenAI incident runbook, then run a blameless postmortem on it",
        "Plan capacity against quota, token throughput and traffic shape rather than request count alone",
      ],
      fr: [
        "Construire un budget de latence bout en bout et utiliser le streaming pour maîtriser la latence perçue",
        "Appliquer délais, relances avec gigue, disjoncteurs, gestion des limites de débit et repli multi-fournisseur",
        "Versionner et déployer progressivement prompts et modèles, avec une unité de retour arrière réellement opérationnelle",
        "Rédiger et répéter un runbook d'incident GenAI, puis en tirer un postmortem sans blâme",
        "Planifier la capacité sur les quotas, le débit de tokens et la forme du trafic, pas seulement le nombre de requêtes",
      ],
    },
    deliverables: {
      en: [
        "An incident runbook for: the assistant has been answering incorrectly since model X was deployed",
        "A resilience design: timeout, retry, circuit breaker, fallback chain and degraded mode for one AI endpoint",
      ],
      fr: [
        "Un runbook d'incident pour : l'assistant répond faux depuis le déploiement du modèle X",
        "Une conception de résilience : délai, relance, disjoncteur, chaîne de repli et mode dégradé pour un point d'entrée IA",
      ],
    },
    resources: [
      { name: "Google SRE Book", url: "https://sre.google/sre-book/table-of-contents/" },
      { name: "AWS Well-Architected Framework — reliability pillar", url: "https://docs.aws.amazon.com/wellarchitected/latest/reliability-pillar/welcome.html" },
      { name: "OpenAI — rate limits", url: "https://platform.openai.com/docs/guides/rate-limits" },
      { name: "Azure Architecture Center — AI workloads on Azure", url: "https://learn.microsoft.com/en-us/azure/well-architected/ai/" },
      { name: "Google SRE Workbook — incident response", url: "https://sre.google/workbook/incident-response/" },
    ],
  },

  {
    id: "ai-security-safety",
    from: [["security-governance", [0, 1, 3, 5, 6, 7, 8, 10, 12, 13, 14, 16, 19]]],
    weeks: { en: "Weeks 17-18", fr: "Semaines 17-18" },
    title: {
      en: "AI security, privacy, safety and guardrails",
      fr: "Sécurité, confidentialité, safety et garde-fous de l'IA",
    },
    objective: {
      en: "Treat the model as an untrusted component and the context as untrusted input, then build the controls that keep a tool-using system safe for customer data.",
      fr: "Traiter le modèle comme un composant non fiable et le contexte comme une entrée non fiable, puis bâtir les contrôles qui protègent les données client dans un système outillé.",
    },
    outcomes: {
      en: [
        "Work fluently with the OWASP Top 10 for LLM applications and MITRE ATLAS techniques",
        "Defend against direct and indirect prompt injection, and against data exfiltration through tools",
        "Apply least privilege to tools, isolate execution, and enforce document-level authorisation in retrieval",
        "Minimise and protect personal data: detection, redaction, residency, retention, no-training guarantees",
        "Run red-teaming and safety evaluations, and define content filtering thresholds",
      ],
      fr: [
        "Manier couramment l'OWASP Top 10 pour applications LLM et les techniques MITRE ATLAS",
        "Se défendre contre l'injection de prompt directe et indirecte, et contre l'exfiltration de données via les outils",
        "Appliquer le moindre privilège aux outils, isoler l'exécution et imposer l'autorisation au niveau document dans la recherche",
        "Minimiser et protéger les données personnelles : détection, masquage, localisation, rétention, garanties de non-entraînement",
        "Mener red teaming et évaluations de safety, et définir les seuils de filtrage de contenu",
      ],
    },
    deliverables: {
      en: [
        "A STRIDE-style threat model for an agent that reads customer contracts and can call internal APIs",
        "A guardrail specification: input filters, tool policy, output checks, and what each one blocks",
      ],
      fr: [
        "Un modèle de menace de type STRIDE pour un agent qui lit des contrats clients et peut appeler des API internes",
        "Une spécification de garde-fous : filtres en entrée, politique d'outils, contrôles en sortie, et ce que chacun bloque",
      ],
    },
    resources: [
      { name: "OWASP Top 10 for LLM applications", url: "https://owasp.org/www-project-top-10-for-large-language-model-applications/" },
      { name: "MITRE ATLAS — adversarial threat landscape for AI systems", url: "https://atlas.mitre.org/" },
      { name: "NIST AI Risk Management Framework", url: "https://www.nist.gov/itl/ai-risk-management-framework" },
      { name: "Azure AI Content Safety documentation", url: "https://learn.microsoft.com/en-us/azure/ai-services/content-safety/" },
      { name: "Microsoft — AI red teaming guidance", url: "https://learn.microsoft.com/en-us/azure/ai-foundry/concepts/ai-red-teaming-agent" },
    ],
  },

  {
    id: "responsible-ai-regulated",
    from: [["security-governance", [2, 4, 9, 11, 15, 17, 18]]],
    weeks: { en: "Weeks 19-20", fr: "Semaines 19-20" },
    title: {
      en: "Responsible AI in regulated industries",
      fr: "IA responsable en industrie régulée",
    },
    objective: {
      en: "Ship AI in insurance without being blocked by compliance: know the obligations, produce the evidence as a by-product of engineering, and design human oversight that is real.",
      fr: "Livrer de l'IA en assurance sans être bloqué par la conformité : connaître les obligations, produire la preuve comme sous-produit de l'ingénierie et concevoir une supervision humaine réelle.",
    },
    outcomes: {
      en: [
        "Classify a use case under the EU AI Act and list the resulting obligations and timeline",
        "Apply GDPR to GenAI: legal basis, DPIA, data subject rights, automated decision-making",
        "Account for DORA operational resilience and critical third-party provider requirements",
        "Produce model cards, system cards, audit trails and traceability evidence from the pipeline itself",
        "Design meaningful human oversight, and test for bias and fairness in pricing and underwriting contexts",
      ],
      fr: [
        "Classer un cas d'usage au regard du règlement européen sur l'IA et lister les obligations et le calendrier associés",
        "Appliquer le RGPD à la GenAI : base légale, AIPD, droits des personnes, décision automatisée",
        "Prendre en compte la résilience opérationnelle DORA et les exigences sur les prestataires tiers critiques",
        "Produire fiches de modèle, fiches de système, pistes d'audit et preuves de traçabilité depuis la chaîne elle-même",
        "Concevoir une supervision humaine effective et tester les biais et l'équité en tarification et en souscription",
      ],
    },
    deliverables: {
      en: [
        "A compliance sheet for one use case: EU AI Act classification, required controls, evidence, owner",
        "A model card and audit-trail specification that an internal auditor could accept",
      ],
      fr: [
        "Une fiche de conformité pour un cas d'usage : classification au titre du règlement IA, contrôles requis, preuves, responsable",
        "Une fiche de modèle et une spécification de piste d'audit acceptables par un auditeur interne",
      ],
    },
    resources: [
      { name: "EU Artificial Intelligence Act — official text (EUR-Lex)", url: "https://eur-lex.europa.eu/eli/reg/2024/1689/oj" },
      { name: "Digital Operational Resilience Act (DORA) — official text", url: "https://eur-lex.europa.eu/eli/reg/2022/2554/oj" },
      { name: "EIOPA — artificial intelligence governance", url: "https://www.eiopa.europa.eu/digital-transformation/artificial-intelligence_en" },
      { name: "CNIL — AI how-to sheets", url: "https://www.cnil.fr/en/ai-how-to-sheets" },
      { name: "ISO/IEC 42001 — AI management systems", url: "https://www.iso.org/standard/42001" },
      { name: "NIST — generative AI profile (AI 600-1)", url: "https://www.nist.gov/publications/artificial-intelligence-risk-management-framework-generative-artificial-intelligence" },
    ],
  },

  {
    id: "ai-platform-delivery",
    from: [
      ["principal-systems", [1, 5, 6, 7, 8, 10, 12, 13, 14, 15, 16]],
      ["devex-platform", [1, 3, 5, 7, 9, 12, 16, 19]],
      ["leadership-influence", [5, 6, 11, 14]],
    ],
    weeks: { en: "Weeks 21-22", fr: "Semaines 21-22" },
    title: {
      en: "AI platform patterns, reusable standards and cross-functional delivery",
      fr: "Patterns de plateforme IA, standards réutilisables et delivery transverse",
    },
    objective: {
      en: "Move from one good application to shared capability: gateways, prompt registries, evaluation as a service, golden paths and a lifecycle that many entities can actually adopt.",
      fr: "Passer d'une bonne application à une capacité partagée : passerelles, registre de prompts, évaluation en tant que service, chemins balisés et un cycle de vie réellement adoptable par plusieurs entités.",
    },
    outcomes: {
      en: [
        "Design the building blocks of an internal AI platform: LLM gateway, prompt registry, tool catalogue, evaluation service, shared guardrails",
        "Define golden paths and reusable patterns that teams adopt because they are faster, not because they are mandated",
        "Argue build versus buy with cost, lock-in, compliance and time-to-value",
        "Govern the use-case lifecycle from intake to production to decommission",
        "Scope work packages, manage dependencies and keep cross-functional stakeholders aligned",
      ],
      fr: [
        "Concevoir les briques d'une plateforme IA interne : passerelle LLM, registre de prompts, catalogue d'outils, service d'évaluation, garde-fous partagés",
        "Définir des chemins balisés et des patterns réutilisables adoptés parce qu'ils sont plus rapides, pas parce qu'ils sont imposés",
        "Argumenter faire ou acheter avec le coût, la dépendance, la conformité et le délai de valeur",
        "Gouverner le cycle de vie des cas d'usage, de l'entrée en portefeuille à la production puis au décommissionnement",
        "Cadrer des lots de travaux, gérer les dépendances et maintenir l'alignement des parties prenantes transverses",
      ],
    },
    deliverables: {
      en: [
        "An architecture proposal for a GenAI platform shared by five entities, with an adoption plan",
        "A one-page intake-to-production checklist that a new use case must satisfy",
      ],
      fr: [
        "Une proposition d'architecture de plateforme GenAI partagée par cinq entités, avec un plan d'adoption",
        "Une checklist d'une page, de l'entrée en portefeuille à la production, que tout nouveau cas d'usage doit satisfaire",
      ],
    },
    resources: [
      { name: "Azure AI Foundry documentation", url: "https://learn.microsoft.com/en-us/azure/ai-foundry/" },
      { name: "Amazon Bedrock documentation", url: "https://docs.aws.amazon.com/bedrock/latest/userguide/what-is-bedrock.html" },
      { name: "LiteLLM — LLM gateway documentation", url: "https://docs.litellm.ai/docs/" },
      { name: "Google Cloud — MLOps: continuous delivery and automation pipelines", url: "https://cloud.google.com/architecture/mlops-continuous-delivery-and-automation-pipelines-in-machine-learning" },
      { name: "Team Topologies — key concepts", url: "https://teamtopologies.com/key-concepts" },
    ],
  },

  {
    id: "interview-readiness-aie",
    from: [
      ["interview-readiness", "*"],
      ["principal-systems", [0, 9, 19]],
      ["leadership-influence", [2, 13, 18]],
    ],
    weeks: { en: "Weeks 23-24", fr: "Semaines 23-24" },
    title: {
      en: "Interview readiness: trade-offs, metrics and stakeholder communication",
      fr: "Préparation à l'entretien : arbitrages, métriques et communication",
    },
    objective: {
      en: "Convert everything above into answers: quantified stories, defensible trade-offs, a live system design, and explanations a non-technical panel can follow.",
      fr: "Convertir tout ce qui précède en réponses : récits chiffrés, arbitrages défendables, une conception système en direct et des explications suivables par un jury non technique.",
    },
    outcomes: {
      en: [
        "Tell STAR stories that end in a metric, a trade-off and a lesson",
        "Defend a quality, cost, latency and risk trade-off under challenge",
        "Run a 45-minute GenAI system design out loud, including back-of-the-envelope cost and capacity",
        "Read a trace or an evaluation report live and state the next action",
        "Explain a technical choice to product, compliance and executive audiences in under two minutes",
      ],
      fr: [
        "Raconter des récits STAR qui se terminent par une métrique, un arbitrage et un enseignement",
        "Défendre un arbitrage qualité, coût, latence et risque sous contradiction",
        "Dérouler à voix haute une conception système GenAI en 45 minutes, estimations de coût et de capacité comprises",
        "Lire en direct une trace ou un rapport d'évaluation et énoncer l'action suivante",
        "Expliquer un choix technique à un public produit, conformité ou direction en moins de deux minutes",
      ],
    },
    deliverables: {
      en: [
        "Six quantified STAR stories mapped to the role's competencies",
        "Three rehearsed system designs: RAG assistant, agentic workflow, evaluation and cost platform",
        "One one-page decision note written for a non-technical reader",
      ],
      fr: [
        "Six récits STAR chiffrés, rattachés aux compétences du poste",
        "Trois conceptions système répétées : assistant RAG, workflow agentique, plateforme d'évaluation et de coût",
        "Une note de décision d'une page rédigée pour un lecteur non technique",
      ],
    },
    resources: [
      { name: "Google — technical interview preparation guide", url: "https://www.google.com/about/careers/applications/how-we-hire/" },
      { name: "Amazon — leadership principles", url: "https://www.aboutamazon.com/about-us/leadership-principles" },
      { name: "AXA — artificial intelligence commitments", url: "https://www.axa.com/en/about-us/artificial-intelligence" },
      { name: "Pyramid Principle — structured communication overview", url: "https://en.wikipedia.org/wiki/Minto_Pyramid_Principle" },
      { name: "Google SRE Workbook — on-call and communication", url: "https://sre.google/workbook/on-call/" },
    ],
  },
];

/* ------------------------------------------------------------------ */
/* 3. Final assessment, rewritten against the role competencies        */
/* ------------------------------------------------------------------ */

const FINAL_ASSESSMENT = {
  en: [
    {
      title: "GenAI evaluation case study",
      summary:
        "Design and defend the evaluation strategy of a production underwriting assistant, from golden dataset to CI regression gate.",
      criteria: [
        "Defines quality criteria per layer: retrieval, generation and task success",
        "Builds a golden dataset including negative and unanswerable cases",
        "Uses LLM-as-a-judge with a rubric and states its known biases and calibration method",
        "Sets regression thresholds and explains how non-determinism is handled",
        "Explains how a degradation would be detected within 24 hours in production",
      ],
    },
    {
      title: "Observability and reliability review",
      summary:
        "Instrument a GenAI feature and operate it: traces, SLOs, alerts, incident response and rollback.",
      criteria: [
        "Produces a span tree using OpenTelemetry GenAI semantic conventions",
        "Correlates a trace to quality, latency, token usage and cost",
        "Defines SLIs and SLOs that match user experience rather than vanity metrics",
        "Describes timeouts, retries, circuit breaking, fallback and degraded mode",
        "Walks through an incident runbook and a blameless postmortem",
      ],
    },
    {
      title: "Cost and consumption governance",
      summary:
        "Build a unit-cost model for a GenAI product and present a credible reduction plan with its quality impact.",
      criteria: [
        "Breaks cost down by driver, not by invoice line",
        "Applies routing, caching, context compression and batching with measured gains",
        "Uses a break-even analysis for fine-tuning or distillation",
        "Proposes quotas, chargeback and budget alerting across entities",
        "States the quality, latency and risk cost of each saving",
      ],
    },
    {
      title: "Agentic system design",
      summary:
        "Design a tool-using agent for a claims workflow with bounded autonomy and reversible actions.",
      criteria: [
        "Justifies agent versus deterministic workflow",
        "Specifies tool schemas, permission scopes and sandboxing",
        "Bounds the loop with step budgets, timeouts and loop detection",
        "Places human-in-the-loop approval before irreversible actions",
        "Describes partial failure, compensation and rollback",
      ],
    },
    {
      title: "Security, privacy and responsible AI",
      summary:
        "Review a customer-facing AI use case for security, privacy, safety and regulatory compliance.",
      criteria: [
        "Covers direct and indirect prompt injection and tool-based exfiltration",
        "Applies least privilege and document-level authorisation in retrieval",
        "Minimises personal data and states residency, retention and no-training guarantees",
        "Classifies the use case under the EU AI Act and lists resulting obligations",
        "Designs human oversight and the evidence trail an auditor would require",
      ],
    },
    {
      title: "Stakeholder communication panel",
      summary:
        "Present an AI initiative to a mixed audience of product, compliance and executive stakeholders.",
      criteria: [
        "Leads with business value and the metric that proves it",
        "Explains the technical choice and the discarded alternatives in plain language",
        "Quantifies the trade-off between quality, cost, latency and risk",
        "Gives a clear status, the main risk and the next decision needed",
        "Handles challenge without defensiveness and commits to a verifiable follow-up",
      ],
    },
    {
      title: "Readiness threshold",
      summary:
        "The bar to consider yourself interview-ready for an AI Engineer Expert position.",
      criteria: [
        "Readiness score of at least 85%",
        "Every module quiz at 85% or above, and the evaluation, observability, cost and responsible-AI modules at 90% or above",
        "All six Copilot Academy levels passed",
        "Three mock interviews at 80% or above, with accuracy, breadth and consistency ratings of at least three out of four",
        "Three capstones submitted and reviewed at 70% or above",
        "No risk zone left open for more than 30 days",
      ],
    },
  ],
  fr: [
    {
      title: "Étude de cas : évaluation GenAI",
      summary:
        "Concevoir et défendre la stratégie d'évaluation d'un assistant de souscription en production, du jeu de référence au verrou de non-régression en CI.",
      criteria: [
        "Définit les critères de qualité par couche : recherche, génération et réussite de la tâche",
        "Construit un jeu de référence incluant cas négatifs et questions sans réponse",
        "Utilise le LLM-as-a-judge avec une rubrique et expose ses biais connus et sa méthode de calibration",
        "Fixe des seuils de non-régression et explique le traitement du non-déterminisme",
        "Explique comment une dégradation serait détectée en moins de 24 heures en production",
      ],
    },
    {
      title: "Revue d'observabilité et de fiabilité",
      summary:
        "Instrumenter une fonctionnalité GenAI et l'exploiter : traces, SLO, alertes, réponse à incident et retour arrière.",
      criteria: [
        "Produit un arbre de spans conforme aux conventions sémantiques GenAI d'OpenTelemetry",
        "Corrèle une trace à la qualité, la latence, la consommation de tokens et le coût",
        "Définit des SLI et SLO alignés sur l'expérience utilisateur plutôt que sur des métriques de façade",
        "Décrit délais, relances, disjoncteur, repli et mode dégradé",
        "Déroule un runbook d'incident et un postmortem sans blâme",
      ],
    },
    {
      title: "Gouvernance du coût et de la consommation",
      summary:
        "Bâtir un modèle de coût unitaire pour un produit GenAI et présenter un plan de réduction crédible avec son impact qualité.",
      criteria: [
        "Ventile le coût par inducteur, et non par ligne de facture",
        "Applique routage, cache, compression de contexte et traitement par lots avec des gains mesurés",
        "Utilise une analyse de seuil de rentabilité pour le fine-tuning ou la distillation",
        "Propose quotas, refacturation et alertes budgétaires entre entités",
        "Énonce le coût en qualité, latence et risque de chaque économie",
      ],
    },
    {
      title: "Conception d'un système agentique",
      summary:
        "Concevoir un agent outillé pour un workflow de sinistres, avec une autonomie bornée et des actions réversibles.",
      criteria: [
        "Justifie le choix d'un agent plutôt qu'un workflow déterministe",
        "Spécifie schémas d'outils, périmètres de permission et bac à sable",
        "Borne la boucle par un budget de pas, des délais et une détection de boucle",
        "Place une validation humaine avant toute action irréversible",
        "Décrit l'échec partiel, la compensation et le retour arrière",
      ],
    },
    {
      title: "Sécurité, confidentialité et IA responsable",
      summary:
        "Revoir un cas d'usage IA destiné aux clients sous l'angle sécurité, confidentialité, safety et conformité réglementaire.",
      criteria: [
        "Couvre l'injection de prompt directe et indirecte et l'exfiltration via les outils",
        "Applique le moindre privilège et l'autorisation au niveau document dans la recherche",
        "Minimise les données personnelles et précise localisation, rétention et garanties de non-entraînement",
        "Classe le cas d'usage au titre du règlement européen sur l'IA et liste les obligations induites",
        "Conçoit la supervision humaine et la piste de preuves qu'un auditeur exigerait",
      ],
    },
    {
      title: "Panel de communication avec les parties prenantes",
      summary:
        "Présenter une initiative IA à un auditoire mixte : produit, conformité et direction.",
      criteria: [
        "Commence par la valeur métier et la métrique qui la démontre",
        "Explique le choix technique et les alternatives écartées en langage clair",
        "Chiffre l'arbitrage entre qualité, coût, latence et risque",
        "Donne un statut net, le risque principal et la prochaine décision attendue",
        "Encaisse la contradiction sans se braquer et s'engage sur un suivi vérifiable",
      ],
    },
    {
      title: "Seuil de préparation",
      summary:
        "La barre à atteindre pour se considérer prêt à un entretien d'AI Engineer Expert.",
      criteria: [
        "Score de préparation d'au moins 85 %",
        "Chaque quiz de module à 85 % ou plus, et les modules évaluation, observabilité, coût et IA responsable à 90 % ou plus",
        "Les six niveaux de la Copilot Academy validés",
        "Trois entretiens simulés à 80 % ou plus, avec des notes de justesse, d'étendue et de régularité d'au moins trois sur quatre",
        "Trois capstones soumis et évalués à 70 % ou plus",
        "Aucune zone à risque ouverte depuis plus de 30 jours",
      ],
    },
  ],
};

/* ------------------------------------------------------------------ */
/* 4. Migration                                                        */
/* ------------------------------------------------------------------ */

function readJson(file) {
  return JSON.parse(fs.readFileSync(path.join(DATA, file), "utf8"));
}

function writeJson(file, value) {
  const target = path.join(DATA, file);
  const body = `${JSON.stringify(value, null, 2)}\n`;
  if (DRY_RUN) {
    console.log(`[dry-run] would write ${target} (${body.length} bytes)`);
    return;
  }
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, body, "utf8");
}

function pickQuestions(sourceModules, spec) {
  const out = [];
  for (const [moduleId, indices] of spec) {
    const source = sourceModules.get(moduleId);
    if (!source) throw new Error(`Unknown source module: ${moduleId}`);
    const list = indices === "*" ? source.quiz.map((_, i) => i) : indices;
    for (const index of list) {
      if (!source.quiz[index]) {
        throw new Error(`Missing question ${moduleId}[${index}]`);
      }
      out.push(source.quiz[index]);
    }
  }
  return out;
}

function buildPlan(lang, plan) {
  const sourceModules = new Map(plan.modules.map((m) => [m.id, m]));
  const used = new Map(plan.modules.map((m) => [m.id, new Set()]));

  const modules = MODULES.map((spec) => {
    for (const [moduleId, indices] of spec.from) {
      const source = sourceModules.get(moduleId);
      const list = indices === "*" ? source.quiz.map((_, i) => i) : indices;
      list.forEach((i) => used.get(moduleId).add(i));
    }
    return {
      id: spec.id,
      weeks: spec.weeks[lang],
      title: spec.title[lang],
      objective: spec.objective[lang],
      outcomes: spec.outcomes[lang],
      deliverables: spec.deliverables[lang],
      resources: spec.resources,
      quiz: pickQuestions(sourceModules, spec.from),
    };
  });

  // Nothing is lost: questions that left the scope of the new role are archived.
  const archived = plan.modules
    .map((m) => ({
      id: m.id,
      title: m.title,
      quiz: m.quiz.filter((_, i) => !used.get(m.id).has(i)),
    }))
    .filter((m) => m.quiz.length > 0);

  const next = {
    ...plan,
    duration: HEADER[lang].duration,
    targetRole: HEADER[lang].targetRole,
    readinessTarget: HEADER[lang].readinessTarget,
    goals: HEADER[lang].goals,
    modules,
    finalAssessment: FINAL_ASSESSMENT[lang],
  };

  return { next, archived };
}

function main() {
  const report = [];
  for (const lang of ["en", "fr"]) {
    const file = `plan.${lang}.json`;
    const plan = readJson(file);
    const { next, archived } = buildPlan(lang, plan);
    writeJson(file, next);
    writeJson(
      path.join("archive", `plan-out-of-scope.${lang}.json`),
      {
        note:
          lang === "en"
            ? "Questions removed from the AI Engineer Expert track (DevEx, platform leadership, staff-plus influence). Kept for reference and possible reuse."
            : "Questions retirées du parcours AI Engineer Expert (DevEx, leadership plateforme, influence staff-plus). Conservées pour référence et réutilisation éventuelle.",
        modules: archived,
      }
    );
    report.push({
      lang,
      modules: next.modules.length,
      questions: next.modules.reduce((sum, m) => sum + m.quiz.length, 0),
      archived: archived.reduce((sum, m) => sum + m.quiz.length, 0),
    });
  }

  console.log("Migration 01 — restructure");
  for (const row of report) {
    console.log(
      `  ${row.lang}: ${row.modules} modules, ${row.questions} questions, ${row.archived} archived`
    );
  }
  for (const spec of MODULES) {
    console.log(`  - ${spec.id}`);
  }
  if (DRY_RUN) console.log("  (dry run, nothing written)");
}

main();

