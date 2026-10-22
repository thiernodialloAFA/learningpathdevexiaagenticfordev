#!/usr/bin/env node
/**
 * Migration 04 — Deepen "ai-observability", the second pillar of the role
 * ("observability and operational monitoring for AI applications, including
 * tracing, latency, reliability, usage, cost efficiency").
 *
 * Adds 11 authored questions covering OpenTelemetry GenAI semantic conventions,
 * span design for chains and agents, trace-to-cost-to-quality correlation,
 * SLI/SLO definition, sampling, and PII-safe logging.
 *
 * Usage: node scripts/migrations/04-deepen-ai-observability.js [--dry-run]
 */

const { appendQuestions } = require("./lib/insert-module");

appendQuestions(
  {
    moduleId: "ai-observability",
    quiz: {
      en: [
        {
          prompt:
            "You instrument a RAG chain with OpenTelemetry. What is the correct span structure?",
          options: [
            "A root span for the request, child spans for retrieval, reranking and the model call, each carrying its own attributes",
            "One span per request carrying all attributes, to keep the trace small",
            "One span per model call only, since the model is the slow part",
            "A span per user session, with the requests recorded as span events",
          ],
          answer: 0,
          explanation:
            "Correct: a span per logical operation is what lets you attribute latency and failure to a stage, which is the entire point of tracing a chain. 'One span per request' is wrong because it gives you a single opaque duration with nothing to diagnose. 'Only the model call' is wrong because retrieval and reranking are frequent latency culprits. 'A span per session' is wrong because sessions are long-lived and unsuitable as trace roots.",
        },
        {
          prompt:
            "Which attribute set on a GenAI span is the minimum needed to analyse quality, latency and cost together?",
          options: [
            "Model identifier, operation name, input and output token counts, finish reason, and the correlation identifier of the request",
            "The full prompt text and the full completion text",
            "The wall-clock duration and the HTTP status code",
            "The user identifier and the session identifier",
          ],
          answer: 0,
          explanation:
            "Correct: model and operation identify what ran, token counts drive the cost calculation, finish reason explains truncation or refusal, and the correlation identifier joins the span to quality signals. 'Full prompt and completion text' is wrong as a minimum because it is expensive and a privacy liability. 'Duration and status code' is wrong because it tells you nothing about cost or truncation. 'User and session identifiers' are useful for grouping but do not explain a single call.",
        },
        {
          prompt:
            "An agent run takes 40 seconds and nobody can say why. Which instrumentation change helps most?",
          options: [
            "Emit a child span per loop iteration and per tool invocation, with the step index as an attribute",
            "Increase the log level to debug for the agent module",
            "Record the total number of tool calls as a metric",
            "Add a timer around the whole agent run",
          ],
          answer: 0,
          explanation:
            "Correct: per-step and per-tool spans reveal which iteration and which tool consumed the time, and expose loops. 'Debug logging' is wrong because unstructured verbosity does not give you a timeline you can aggregate. 'A total tool-call counter' is wrong because a count without durations does not locate the cost. 'A timer around the whole run' is wrong because it re-measures the 40 seconds you already know about.",
        },
        {
          prompt:
            "Which latency indicator best reflects the experience of a user of a streaming assistant?",
          options: [
            "Time to first token, together with inter-token latency",
            "Total server-side processing time",
            "Mean end-to-end response time",
            "Model provider API latency as reported by the provider",
          ],
          answer: 0,
          explanation:
            "Correct: in a streaming interface the user judges responsiveness by when text starts and how smoothly it flows, which is exactly time to first token and inter-token latency. 'Total processing time' is wrong because the user is already reading before it ends. 'Mean end-to-end time' is wrong because a mean hides the tail that drives complaints. 'Provider-reported latency' is wrong because it excludes retrieval, your own overhead and the network.",
        },
        {
          prompt:
            "You must set an SLO for a customer-facing GenAI assistant. Which formulation is strongest?",
          options: [
            "99% of requests return a first token within 2 seconds and a grounded answer, measured over a rolling 28-day window",
            "The assistant is available 99.9% of the time",
            "Average response time stays below 3 seconds",
            "No more than 10 errors per day",
          ],
          answer: 0,
          explanation:
            "Correct: it combines a user-visible latency target with a quality condition, states a percentile and a window, which makes it measurable and enforceable. 'Availability 99.9%' is wrong because a GenAI feature can be fully available and uselessly wrong. 'Average below 3 seconds' is wrong because averages hide the tail. 'No more than 10 errors per day' is wrong because an absolute count is meaningless without traffic volume.",
        },
        {
          prompt:
            "Tracing every request of a high-traffic assistant is too expensive. What is the right sampling strategy?",
          options: [
            "Head sampling for the baseline plus tail-based sampling that always keeps errors, slow requests and low-quality outputs",
            "Sample one request in a hundred uniformly",
            "Trace only requests from internal users",
            "Disable tracing and rely on metrics",
          ],
          answer: 0,
          explanation:
            "Correct: uniform sampling keeps a statistical baseline while tail-based rules guarantee that the interesting traces, which are rare by definition, are never dropped. 'One in a hundred uniformly' is wrong because it will discard most incidents. 'Only internal users' is wrong because internal traffic is not representative. 'Disable tracing' is wrong because metrics tell you something is wrong but never where.",
        },
        {
          prompt:
            "Prompts sent to your assistant may contain policy numbers and health information. How should they be logged?",
          options: [
            "Redact detected personal data before export, log a hash or reference instead, and apply a short retention period",
            "Log everything but restrict dashboard access to the platform team",
            "Log nothing, and reproduce issues locally when they are reported",
            "Encrypt the logs at rest and keep them indefinitely",
          ],
          answer: 0,
          explanation:
            "Correct: redaction at the source plus a reference for correlation preserves debuggability while minimising the data held, and short retention limits exposure. 'Restrict dashboard access' is wrong because access control does not reduce the data you collected. 'Log nothing' is wrong because GenAI defects are rarely reproducible without the context. 'Encrypt and keep indefinitely' is wrong because encryption at rest does not satisfy data minimisation or retention limits.",
        },
        {
          prompt:
            "Your dashboard shows token usage and your finance report shows the invoice, but nobody can say which feature drives the spend. What is missing?",
          options: [
            "A cost attribute computed per span from model, token counts and cache status, tagged with feature and tenant",
            "A more detailed invoice from the provider",
            "A monthly budget alert",
            "A separate API key per environment",
          ],
          answer: 0,
          explanation:
            "Correct: attributing cost at span level with feature and tenant tags is what turns an invoice into an actionable breakdown. 'A more detailed invoice' is wrong because the provider cannot know your feature boundaries. 'A budget alert' is wrong because it tells you that you overspent, not where. 'A key per environment' separates environments but not features inside one environment.",
        },
        {
          prompt:
            "Which alert is most likely to catch a silent quality degradation before users complain?",
          options: [
            "A sustained drop in the groundedness score of sampled production answers, evaluated continuously",
            "An increase in the 5xx error rate of the AI endpoint",
            "An increase in p95 latency",
            "A drop in the number of requests per minute",
          ],
          answer: 0,
          explanation:
            "Correct: silent degradation means the system still answers successfully but worse, so only a continuous quality signal on sampled traffic will catch it. 'The 5xx rate' is wrong because a degraded answer is a 200. 'p95 latency' is wrong because quality can fall with no latency change. 'A drop in request rate' is wrong because it is a lagging effect that appears after users have already given up.",
        },
        {
          prompt:
            "A production trace shows a wrong answer. What is the most valuable next step for the team's maturity?",
          options: [
            "Convert the trace into a reproducible evaluation case and add it to the regression suite",
            "Patch the system prompt until that question answers correctly",
            "File a ticket with the model provider",
            "Add a filter that blocks that specific question",
          ],
          answer: 0,
          explanation:
            "Correct: turning production failures into permanent regression cases is the loop that compounds quality over time. 'Patch the prompt until it passes' is wrong because without a test you cannot know if you broke something else or if it regresses later. 'File a provider ticket' is wrong because the defect is usually in your context or prompt, not the model. 'Block that question' is wrong because it hides the class of failure rather than fixing it.",
        },
        {
          prompt:
            "Two teams instrument their GenAI services with different custom span names and attribute keys. What is the consequence, and the fix?",
          options: [
            "Cross-service dashboards and alerts cannot be shared; adopt the OpenTelemetry GenAI semantic conventions as the common contract",
            "Nothing breaks, because each team owns its own dashboards",
            "Trace context propagation will fail between the services",
            "Sampling decisions become inconsistent and must be centralised",
          ],
          answer: 0,
          explanation:
            "Correct: shared conventions are what allow one query, one dashboard and one alert to work across services, which is the point of a semantic convention. 'Nothing breaks' is wrong because it forgoes any organisation-wide view, which is exactly what a platform role must deliver. 'Context propagation will fail' is wrong because propagation depends on trace headers, not attribute naming. 'Sampling becomes inconsistent' is a separate concern unaffected by attribute keys.",
        },
      ],
      fr: [
        {
          prompt:
            "Vous instrumentez une chaîne RAG avec OpenTelemetry. Quelle structure de spans est correcte ?",
          options: [
            "Un span racine pour la requête, des spans enfants pour la recherche, le reranking et l'appel au modèle, chacun portant ses propres attributs",
            "Un span par requête portant tous les attributs, pour garder une trace légère",
            "Un span pour le seul appel au modèle, puisque c'est la partie lente",
            "Un span par session utilisateur, les requêtes étant consignées comme événements du span",
          ],
          answer: 0,
          explanation:
            "Correct : un span par opération logique est ce qui permet d'attribuer la latence et l'échec à une étape, c'est tout l'intérêt de tracer une chaîne. « Un span par requête » est faux car cela donne une durée opaque unique, sans rien à diagnostiquer. « Seulement l'appel au modèle » est faux car la recherche et le reranking sont des coupables fréquents de latence. « Un span par session » est faux car les sessions sont longues et inadaptées comme racines de trace.",
        },
        {
          prompt:
            "Quel jeu d'attributs sur un span GenAI constitue le minimum pour analyser ensemble qualité, latence et coût ?",
          options: [
            "Identifiant du modèle, nom de l'opération, nombres de tokens en entrée et en sortie, raison de fin et identifiant de corrélation de la requête",
            "Le texte complet du prompt et de la complétion",
            "La durée mesurée et le code de statut HTTP",
            "L'identifiant utilisateur et l'identifiant de session",
          ],
          answer: 0,
          explanation:
            "Correct : le modèle et l'opération identifient ce qui s'est exécuté, les tokens pilotent le calcul de coût, la raison de fin explique troncature ou refus, et l'identifiant de corrélation relie le span aux signaux de qualité. « Le texte complet » est faux comme minimum car c'est coûteux et c'est un risque de confidentialité. « Durée et code HTTP » est faux car cela ne dit rien du coût ni de la troncature. « Utilisateur et session » servent au regroupement mais n'expliquent pas un appel isolé.",
        },
        {
          prompt:
            "Une exécution d'agent dure 40 secondes et personne ne sait pourquoi. Quel changement d'instrumentation aide le plus ?",
          options: [
            "Émettre un span enfant par itération de boucle et par appel d'outil, avec l'index de l'étape en attribut",
            "Passer le module agent en niveau de journalisation debug",
            "Enregistrer le nombre total d'appels d'outils comme métrique",
            "Ajouter un chronomètre autour de l'exécution complète de l'agent",
          ],
          answer: 0,
          explanation:
            "Correct : des spans par étape et par outil révèlent quelle itération et quel outil ont consommé le temps, et exposent les boucles. « Le niveau debug » est faux car une verbosité non structurée ne fournit pas une chronologie agrégeable. « Un compteur d'appels d'outils » est faux car un décompte sans durées ne localise pas le coût. « Un chronomètre global » est faux car il remesure les 40 secondes déjà connues.",
        },
        {
          prompt:
            "Quel indicateur de latence reflète le mieux l'expérience d'un utilisateur d'assistant en streaming ?",
          options: [
            "Le temps jusqu'au premier token, associé à la latence entre tokens",
            "Le temps de traitement total côté serveur",
            "Le temps de réponse moyen de bout en bout",
            "La latence de l'API du fournisseur telle qu'il la rapporte",
          ],
          answer: 0,
          explanation:
            "Correct : dans une interface en streaming, l'utilisateur juge la réactivité au moment où le texte démarre et à la fluidité du flux, c'est-à-dire le temps jusqu'au premier token et la latence entre tokens. « Le temps de traitement total » est faux car l'utilisateur lit déjà avant la fin. « Le temps moyen » est faux car une moyenne masque la queue de distribution. « La latence rapportée par le fournisseur » est faux car elle exclut la recherche, votre propre surcoût et le réseau.",
        },
        {
          prompt:
            "Vous devez fixer un SLO pour un assistant GenAI destiné aux clients. Quelle formulation est la plus solide ?",
          options: [
            "99 % des requêtes renvoient un premier token en moins de 2 secondes et une réponse ancrée, mesuré sur une fenêtre glissante de 28 jours",
            "L'assistant est disponible 99,9 % du temps",
            "Le temps de réponse moyen reste sous 3 secondes",
            "Pas plus de 10 erreurs par jour",
          ],
          answer: 0,
          explanation:
            "Correct : elle combine une cible de latence visible par l'utilisateur et une condition de qualité, précise un centile et une fenêtre, donc elle est mesurable et opposable. « Disponible 99,9 % » est faux car une fonctionnalité GenAI peut être pleinement disponible et inutilement fausse. « Moyenne sous 3 secondes » est faux car les moyennes masquent la queue. « Pas plus de 10 erreurs par jour » est faux car un décompte absolu n'a pas de sens sans volume de trafic.",
        },
        {
          prompt:
            "Tracer toutes les requêtes d'un assistant à fort trafic coûte trop cher. Quelle stratégie d'échantillonnage adopter ?",
          options: [
            "Un échantillonnage en tête pour la ligne de base, plus un échantillonnage en queue conservant toujours les erreurs, les requêtes lentes et les sorties de faible qualité",
            "Échantillonner uniformément une requête sur cent",
            "Ne tracer que les requêtes des utilisateurs internes",
            "Désactiver le traçage et s'appuyer sur les métriques",
          ],
          answer: 0,
          explanation:
            "Correct : l'échantillonnage uniforme conserve une ligne de base statistique tandis que les règles en queue garantissent que les traces intéressantes, rares par définition, ne sont jamais perdues. « Une sur cent uniformément » est faux car cela écartera la plupart des incidents. « Seulement les utilisateurs internes » est faux car le trafic interne n'est pas représentatif. « Désactiver le traçage » est faux car les métriques signalent qu'il y a un problème mais jamais où.",
        },
        {
          prompt:
            "Les prompts envoyés à votre assistant peuvent contenir des numéros de contrat et des données de santé. Comment les journaliser ?",
          options: [
            "Masquer les données personnelles détectées avant l'export, journaliser une empreinte ou une référence à la place, et appliquer une rétention courte",
            "Tout journaliser mais restreindre l'accès aux tableaux de bord à l'équipe plateforme",
            "Ne rien journaliser et reproduire les problèmes en local lorsqu'ils sont signalés",
            "Chiffrer les journaux au repos et les conserver indéfiniment",
          ],
          answer: 0,
          explanation:
            "Correct : le masquage à la source plus une référence de corrélation préserve la capacité de diagnostic tout en minimisant les données détenues, et une rétention courte limite l'exposition. « Restreindre l'accès » est faux car le contrôle d'accès ne réduit pas les données collectées. « Ne rien journaliser » est faux car les défauts GenAI sont rarement reproductibles sans le contexte. « Chiffrer et conserver indéfiniment » est faux car le chiffrement au repos ne satisfait ni la minimisation ni les limites de rétention.",
        },
        {
          prompt:
            "Votre tableau de bord montre la consommation de tokens et le rapport financier montre la facture, mais personne ne sait quelle fonctionnalité porte la dépense. Que manque-t-il ?",
          options: [
            "Un attribut de coût calculé par span à partir du modèle, des tokens et de l'état du cache, étiqueté par fonctionnalité et par entité",
            "Une facture plus détaillée du fournisseur",
            "Une alerte budgétaire mensuelle",
            "Une clé d'API distincte par environnement",
          ],
          answer: 0,
          explanation:
            "Correct : attribuer le coût au niveau du span, avec des étiquettes de fonctionnalité et d'entité, est ce qui transforme une facture en ventilation actionnable. « Une facture plus détaillée » est faux car le fournisseur ne peut pas connaître vos frontières fonctionnelles. « Une alerte budgétaire » est faux car elle signale le dépassement, pas son origine. « Une clé par environnement » sépare les environnements, pas les fonctionnalités au sein d'un environnement.",
        },
        {
          prompt:
            "Quelle alerte a le plus de chances d'attraper une dégradation silencieuse de la qualité avant les réclamations ?",
          options: [
            "Une baisse durable du score d'ancrage des réponses de production échantillonnées, évalué en continu",
            "Une hausse du taux d'erreurs 5xx du point d'entrée IA",
            "Une hausse de la latence p95",
            "Une baisse du nombre de requêtes par minute",
          ],
          answer: 0,
          explanation:
            "Correct : une dégradation silencieuse signifie que le système répond toujours avec succès mais moins bien, donc seul un signal de qualité continu sur du trafic échantillonné la détecte. « Le taux de 5xx » est faux car une réponse dégradée est un 200. « La latence p95 » est faux car la qualité peut chuter sans variation de latence. « Une baisse du trafic » est faux car c'est un effet retardé, qui apparaît une fois les utilisateurs déjà partis.",
        },
        {
          prompt:
            "Une trace de production montre une réponse fausse. Quelle est l'étape suivante la plus utile pour la maturité de l'équipe ?",
          options: [
            "Convertir la trace en cas d'évaluation reproductible et l'ajouter à la suite de non-régression",
            "Retoucher le prompt système jusqu'à ce que cette question soit correcte",
            "Ouvrir un ticket chez le fournisseur du modèle",
            "Ajouter un filtre qui bloque cette question précise",
          ],
          answer: 0,
          explanation:
            "Correct : transformer les défaillances de production en cas de non-régression permanents est la boucle qui fait progresser la qualité dans la durée. « Retoucher le prompt jusqu'à ce que ça passe » est faux car sans test vous ignorez si vous avez cassé autre chose ou si cela régressera plus tard. « Un ticket fournisseur » est faux car le défaut est généralement dans votre contexte ou votre prompt, pas dans le modèle. « Bloquer cette question » est faux car cela masque la classe de défaillance au lieu de la corriger.",
        },
        {
          prompt:
            "Deux équipes instrumentent leurs services GenAI avec des noms de spans et des clés d'attributs personnalisés différents. Quelle en est la conséquence, et la correction ?",
          options: [
            "Les tableaux de bord et alertes inter-services ne peuvent pas être partagés ; adopter les conventions sémantiques GenAI d'OpenTelemetry comme contrat commun",
            "Rien ne casse, chaque équipe possède ses propres tableaux de bord",
            "La propagation du contexte de trace échouera entre les services",
            "Les décisions d'échantillonnage deviennent incohérentes et doivent être centralisées",
          ],
          answer: 0,
          explanation:
            "Correct : des conventions partagées sont ce qui permet à une requête, un tableau de bord et une alerte de fonctionner entre services, c'est la raison d'être d'une convention sémantique. « Rien ne casse » est faux car cela renonce à toute vue transverse, précisément ce qu'un rôle plateforme doit fournir. « La propagation échouera » est faux car elle dépend des en-têtes de trace, pas du nommage des attributs. « L'échantillonnage devient incohérent » est une préoccupation distincte, non affectée par les clés d'attributs.",
        },
      ],
    },
  },
  "Migration 04 — deepen ai-observability"
);

