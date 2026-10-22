#!/usr/bin/env node
/**
 * Migration 02 — Add the module "python-prod-ai" (Week 3).
 *
 * The AI Engineer Expert role explicitly asks for "strong software engineering
 * foundations for production-grade AI systems, including Python or similar
 * languages, APIs, integration patterns, monitoring, and automation".
 * The previous track had zero coverage of this.
 *
 * The module mixes 12 newly authored questions with 8 engineering-quality
 * questions recovered from data/archive/plan-out-of-scope.*.json so that nothing
 * useful is lost.
 *
 * Usage: node scripts/migrations/02-module-python-prod-ai.js [--dry-run]
 */

const { insertModule } = require("./lib/insert-module");

// Indices refer to data/archive/plan-out-of-scope.*.json (re-indexed by migration 01).
// These six are testing / CI / quality-economics questions that belong to
// software-engineering foundations rather than to DevEx leadership.
const RECOVER = [["excellence-reliability", [1, 2, 3, 4, 6, 7]]];

const QUIZ = {
  en: [
    {
      prompt:
        "A FastAPI endpoint calls a chat model that takes 9 seconds to produce a full answer. Users abandon the page. What is the highest-value change before touching the model?",
      options: [
        "Stream the response token by token over SSE so the user sees output within a second",
        "Increase the uvicorn worker count",
        "Raise the HTTP client timeout to 60 seconds",
        "Cache the final answer for the next user",
      ],
      answer: 0,
      explanation:
        "Correct: streaming attacks perceived latency, which is what drives abandonment, and it needs no model change. 'Increase the uvicorn worker count' is wrong because the bottleneck is a remote call, not local CPU. 'Raise the HTTP client timeout' is wrong because it makes users wait longer, not less. 'Cache the final answer' is wrong because it helps only on repeated identical questions and does nothing for the first user.",
    },
    {
      prompt:
        "An async FastAPI handler calls a synchronous SDK method to reach the model. Under load, unrelated endpoints become slow. What happened?",
      options: [
        "The synchronous call blocks the event loop, stalling every coroutine on that worker",
        "FastAPI serialises all requests by design",
        "The model provider is rate limiting the service",
        "Pydantic validation is the bottleneck",
      ],
      answer: 0,
      explanation:
        "Correct: a blocking call inside a coroutine holds the event loop, so every other request on that worker waits. Use an async client or offload to a thread pool. 'FastAPI serialises all requests' is wrong because it is concurrent by design. 'The provider is rate limiting' is wrong because that produces 429 errors on the AI route, not slowness everywhere. 'Pydantic validation' is wrong because it is CPU-cheap compared with a multi-second network call.",
    },
    {
      prompt:
        "Your service retries provider 429 responses immediately, three times, from every instance. What is the correct retry policy?",
      options: [
        "Exponential backoff with jitter, a retry budget, and respect for the Retry-After header",
        "Retry twice instead of three times",
        "Retry only on 500 errors and fail fast on 429",
        "Queue every request through a single global worker",
      ],
      answer: 0,
      explanation:
        "Correct: backoff spreads load over time, jitter prevents synchronised retry storms, a budget caps amplification, and Retry-After is the provider telling you exactly when to come back. 'Retry twice' is wrong because the storm pattern remains. 'Fail fast on 429' is wrong because 429 is the most retryable status there is. 'A single global worker' is wrong because it trades a retry problem for a throughput ceiling.",
    },
    {
      prompt:
        "You need an LLM to return an object your code can rely on. Which approach is strongest in Python?",
      options: [
        "Define a Pydantic model, request structured output against its JSON schema, validate, and repair or reject on failure",
        "Ask the model politely to answer in JSON and call json.loads",
        "Parse the answer with a regular expression tuned on observed outputs",
        "Accept free text and let downstream code handle whatever arrives",
      ],
      answer: 0,
      explanation:
        "Correct: the schema constrains generation, Pydantic enforces the contract at the boundary, and an explicit repair or reject path makes failure visible. 'Ask politely and json.loads' is wrong because it crashes on the first stray token. 'A regular expression' is wrong because it encodes today's output shape and silently breaks on model updates. 'Accept free text' is wrong because it pushes an unvalidated contract into business logic.",
    },
    {
      prompt:
        "Your CI suite calls the real model API on every pull request. Builds are slow, flaky and expensive. What is the best structure?",
      options: [
        "Record and replay provider responses for unit tests, keep a small live contract test on a schedule",
        "Delete the tests that call the model",
        "Set temperature to zero and keep calling the live API",
        "Mock everything and never call the provider again",
      ],
      answer: 0,
      explanation:
        "Correct: replayed cassettes make unit tests fast, deterministic and free, while a scheduled live contract test still detects provider drift. 'Delete the tests' is wrong because it removes the safety net. 'Temperature zero on live calls' is wrong because it reduces but does not remove variance, and keeps the cost and flakiness. 'Never call the provider again' is wrong because you then discover breaking API changes in production.",
    },
    {
      prompt:
        "An HTTP client to the model provider is created with no timeout. What is the most likely production failure?",
      options: [
        "Hung connections exhaust the pool and the whole service stops serving, not just the AI route",
        "Requests return incorrect content",
        "The provider bills twice for each call",
        "Pydantic raises validation errors",
      ],
      answer: 0,
      explanation:
        "Correct: without a timeout a stalled connection is held forever, the pool saturates and the failure spreads beyond the AI feature. 'Incorrect content' is wrong because timeouts affect availability, not correctness. 'Billed twice' is wrong because billing follows completed calls. 'Validation errors' is wrong because nothing reaches validation when the call never returns.",
    },
    {
      prompt:
        "A model-serving service works locally but fails in production with a different library behaviour. The project installs dependencies with a loose version range and no lock file. What is the fix?",
      options: [
        "Commit a resolved lock file and build from it so every environment installs identical versions",
        "Pin only the AI SDK and leave the rest loose",
        "Always install the latest versions so everyone is on the same release",
        "Vendor the libraries into the repository",
      ],
      answer: 0,
      explanation:
        "Correct: a committed lock file makes the dependency graph reproducible across developer machines, CI and production. 'Pin only the AI SDK' is wrong because transitive dependencies cause most of these drifts. 'Always install the latest' is wrong because two installs minutes apart can still differ. 'Vendor the libraries' is wrong because it is a heavy workaround for a solved problem and complicates security patching.",
    },
    {
      prompt:
        "You must be able to reconstruct what happened in a single user conversation that spanned three services. Which logging approach supports that?",
      options: [
        "Structured JSON logs carrying a correlation identifier propagated across every service and model call",
        "Printing the prompt and the answer to standard output",
        "Writing one log line per request with a human-readable sentence",
        "Logging only errors to keep volume low",
      ],
      answer: 0,
      explanation:
        "Correct: machine-parseable fields plus a propagated correlation identifier let you join the whole conversation across services. 'Printing prompt and answer' is wrong because it is unqueryable and leaks personal data. 'A human-readable sentence' is wrong because it cannot be filtered or aggregated reliably. 'Logging only errors' is wrong because most GenAI problems are silent quality failures, not exceptions.",
    },
    {
      prompt:
        "Where should the provider API key live for a containerised Python AI service?",
      options: [
        "Injected at runtime from a secret manager into the process environment, never committed and never logged",
        "In a settings.py file excluded from version control by .gitignore",
        "Baked into the container image so deployment is simple",
        "In a configuration file encrypted with a key stored next to it",
      ],
      answer: 0,
      explanation:
        "Correct: runtime injection from a secret manager keeps the secret out of the image, the repository and the logs, and makes rotation possible. 'A gitignored settings file' is wrong because it is one mistake away from being committed and is not rotatable. 'Baked into the image' is wrong because anyone who can pull the image gets the key. 'Encrypted next to its key' is wrong because storing the key with the ciphertext provides no protection.",
    },
    {
      prompt:
        "Profiling shows that a large share of request time is spent establishing TLS connections to the model provider. The code creates a new client object per request. What should change?",
      options: [
        "Create one long-lived client at application startup and reuse its connection pool",
        "Switch to a faster model",
        "Add more replicas of the service",
        "Disable TLS certificate verification",
      ],
      answer: 0,
      explanation:
        "Correct: a reused client keeps connections warm and removes handshake cost from the critical path. 'A faster model' is wrong because the overhead is in the transport, not the inference. 'More replicas' is wrong because it multiplies the same waste. 'Disable certificate verification' is wrong because it is a serious security regression for a minor gain.",
    },
    {
      prompt:
        "A POST endpoint starts an expensive multi-step agent run. A client timeout causes the browser to retry, and the run executes twice. What is the right control?",
      options: [
        "Accept a client-supplied idempotency key and return the existing run for a repeated key",
        "Increase the client timeout",
        "Block duplicate requests from the same IP address",
        "Make the endpoint synchronous so retries are impossible",
      ],
      answer: 0,
      explanation:
        "Correct: an idempotency key makes a repeated submission return the original run instead of starting a new one, which is the standard fix for retried non-idempotent writes. 'Increase the timeout' is wrong because it narrows the window without closing it. 'Block by IP' is wrong because it breaks legitimate shared-network users and misses other retry paths. 'Make it synchronous' is wrong because long synchronous calls make timeouts and retries more likely.",
    },
    {
      prompt:
        "A batch job launches asyncio.gather over 5000 documents, each calling the embedding API. The provider returns 429 and the job collapses. What is the correct design?",
      options: [
        "Bound concurrency with a semaphore sized to the rate limit, batch inputs per call, and apply backoff",
        "Catch the 429 exception and continue to the next document",
        "Split the job across 10 processes so each sends fewer requests",
        "Request a quota increase and run the same code",
      ],
      answer: 0,
      explanation:
        "Correct: bounded concurrency keeps the job inside the provider budget, batching reduces the number of calls, and backoff absorbs transient limits. 'Catch and continue' is wrong because it silently drops documents. 'Ten processes' is wrong because the aggregate request rate is unchanged or worse. 'Request a quota increase' is wrong because unbounded fan-out will saturate any quota you are granted.",
    },
  ],
  fr: [
    {
      prompt:
        "Un point d'entrée FastAPI appelle un modèle de chat qui met 9 secondes à produire une réponse complète. Les utilisateurs quittent la page. Quel changement apporte le plus de valeur avant de toucher au modèle ?",
      options: [
        "Diffuser la réponse token par token en SSE pour que l'utilisateur voie du texte en moins d'une seconde",
        "Augmenter le nombre de workers uvicorn",
        "Porter le délai du client HTTP à 60 secondes",
        "Mettre la réponse finale en cache pour l'utilisateur suivant",
      ],
      answer: 0,
      explanation:
        "Correct : le streaming s'attaque à la latence perçue, qui est la cause de l'abandon, et ne demande aucun changement de modèle. « Augmenter le nombre de workers » est faux car le goulot est un appel distant, pas le CPU local. « Porter le délai à 60 secondes » est faux car cela fait attendre plus longtemps, pas moins. « Mettre en cache » est faux car cela n'aide que sur des questions identiques répétées et ne fait rien pour le premier utilisateur.",
    },
    {
      prompt:
        "Un handler FastAPI asynchrone appelle une méthode synchrone du SDK pour joindre le modèle. En charge, des points d'entrée sans rapport deviennent lents. Que se passe-t-il ?",
      options: [
        "L'appel synchrone bloque la boucle d'événements et fige toutes les coroutines de ce worker",
        "FastAPI sérialise toutes les requêtes par conception",
        "Le fournisseur de modèle limite le débit du service",
        "La validation Pydantic est le goulot d'étranglement",
      ],
      answer: 0,
      explanation:
        "Correct : un appel bloquant dans une coroutine retient la boucle d'événements, donc toutes les autres requêtes du worker attendent. Il faut un client asynchrone ou un déport sur un pool de threads. « FastAPI sérialise tout » est faux car il est concurrent par conception. « Le fournisseur limite le débit » est faux car cela produirait des erreurs 429 sur la route IA, pas une lenteur généralisée. « La validation Pydantic » est faux car son coût CPU est négligeable face à un appel réseau de plusieurs secondes.",
    },
    {
      prompt:
        "Votre service relance immédiatement, trois fois et depuis chaque instance, les réponses 429 du fournisseur. Quelle est la bonne politique de relance ?",
      options: [
        "Backoff exponentiel avec gigue, budget de relances et respect de l'en-tête Retry-After",
        "Relancer deux fois au lieu de trois",
        "Relancer uniquement sur les erreurs 500 et échouer vite sur 429",
        "Faire passer toutes les requêtes par un unique worker global",
      ],
      answer: 0,
      explanation:
        "Correct : le backoff étale la charge, la gigue évite les tempêtes de relances synchronisées, le budget plafonne l'amplification et Retry-After est le fournisseur qui indique quand revenir. « Relancer deux fois » est faux car le schéma de tempête demeure. « Échouer vite sur 429 » est faux car c'est le statut le plus relançable qui soit. « Un worker global unique » est faux car cela échange un problème de relance contre un plafond de débit.",
    },
    {
      prompt:
        "Vous avez besoin qu'un LLM renvoie un objet sur lequel votre code peut s'appuyer. Quelle approche est la plus solide en Python ?",
      options: [
        "Définir un modèle Pydantic, demander une sortie structurée conforme à son schéma JSON, valider, puis réparer ou rejeter en cas d'échec",
        "Demander poliment au modèle de répondre en JSON puis appeler json.loads",
        "Analyser la réponse avec une expression régulière ajustée sur les sorties observées",
        "Accepter du texte libre et laisser le code en aval gérer ce qui arrive",
      ],
      answer: 0,
      explanation:
        "Correct : le schéma contraint la génération, Pydantic fait respecter le contrat à la frontière, et un chemin explicite de réparation ou de rejet rend l'échec visible. « Demander poliment puis json.loads » est faux car cela casse au premier token parasite. « Une expression régulière » est faux car elle encode la forme de sortie du jour et se brise silencieusement à la mise à jour du modèle. « Accepter du texte libre » est faux car cela pousse un contrat non validé dans la logique métier.",
    },
    {
      prompt:
        "Votre suite CI appelle l'API réelle du modèle à chaque pull request. Les builds sont lents, instables et coûteux. Quelle structure adopter ?",
      options: [
        "Enregistrer et rejouer les réponses du fournisseur pour les tests unitaires, et garder un petit test de contrat en direct planifié",
        "Supprimer les tests qui appellent le modèle",
        "Mettre la température à zéro et continuer d'appeler l'API réelle",
        "Tout simuler et ne plus jamais appeler le fournisseur",
      ],
      answer: 0,
      explanation:
        "Correct : les cassettes rejouées rendent les tests unitaires rapides, déterministes et gratuits, tandis qu'un test de contrat en direct planifié détecte encore la dérive du fournisseur. « Supprimer les tests » est faux car cela retire le filet de sécurité. « Température zéro en direct » est faux car cela réduit la variance sans la supprimer, et conserve le coût et l'instabilité. « Ne plus jamais appeler le fournisseur » est faux car les ruptures d'API se découvrent alors en production.",
    },
    {
      prompt:
        "Un client HTTP vers le fournisseur de modèle est créé sans aucun délai d'expiration. Quelle est la défaillance la plus probable en production ?",
      options: [
        "Des connexions suspendues épuisent le pool et tout le service cesse de répondre, pas seulement la route IA",
        "Les requêtes renvoient un contenu incorrect",
        "Le fournisseur facture deux fois chaque appel",
        "Pydantic lève des erreurs de validation",
      ],
      answer: 0,
      explanation:
        "Correct : sans délai, une connexion bloquée est retenue indéfiniment, le pool sature et la panne dépasse la fonctionnalité IA. « Contenu incorrect » est faux car les délais touchent la disponibilité, pas la justesse. « Facturé deux fois » est faux car la facturation suit les appels aboutis. « Erreurs de validation » est faux car rien n'atteint la validation quand l'appel ne revient jamais.",
    },
    {
      prompt:
        "Un service d'inférence fonctionne en local mais échoue en production avec un comportement de bibliothèque différent. Le projet installe ses dépendances avec des plages de versions larges et sans fichier de verrouillage. Quelle est la correction ?",
      options: [
        "Versionner un fichier de verrouillage résolu et construire à partir de lui pour que chaque environnement installe des versions identiques",
        "Épingler uniquement le SDK IA et laisser le reste libre",
        "Toujours installer les dernières versions pour que tout le monde soit sur la même publication",
        "Embarquer les bibliothèques dans le dépôt",
      ],
      answer: 0,
      explanation:
        "Correct : un fichier de verrouillage versionné rend le graphe de dépendances reproductible entre postes de développement, CI et production. « Épingler uniquement le SDK IA » est faux car les dépendances transitives causent l'essentiel de ces dérives. « Toujours installer les dernières versions » est faux car deux installations à quelques minutes d'écart peuvent différer. « Embarquer les bibliothèques » est faux car c'est un contournement lourd d'un problème résolu, qui complique les correctifs de sécurité.",
    },
    {
      prompt:
        "Vous devez pouvoir reconstituer ce qui s'est passé dans une conversation utilisateur traversant trois services. Quelle approche de journalisation le permet ?",
      options: [
        "Des journaux JSON structurés portant un identifiant de corrélation propagé à chaque service et à chaque appel de modèle",
        "Afficher le prompt et la réponse sur la sortie standard",
        "Écrire une ligne de journal par requête sous forme de phrase lisible",
        "Ne journaliser que les erreurs pour limiter le volume",
      ],
      answer: 0,
      explanation:
        "Correct : des champs exploitables par machine et un identifiant de corrélation propagé permettent de reconstituer la conversation entière entre services. « Afficher prompt et réponse » est faux car c'est non interrogeable et cela expose des données personnelles. « Une phrase lisible » est faux car elle ne peut être filtrée ni agrégée de façon fiable. « Ne journaliser que les erreurs » est faux car la plupart des problèmes GenAI sont des défaillances de qualité silencieuses, pas des exceptions.",
    },
    {
      prompt:
        "Où doit résider la clé d'API du fournisseur pour un service IA Python conteneurisé ?",
      options: [
        "Injectée à l'exécution depuis un gestionnaire de secrets dans l'environnement du processus, jamais versionnée ni journalisée",
        "Dans un fichier settings.py exclu du contrôle de version par .gitignore",
        "Intégrée à l'image du conteneur pour simplifier le déploiement",
        "Dans un fichier de configuration chiffré avec une clé stockée à côté",
      ],
      answer: 0,
      explanation:
        "Correct : l'injection à l'exécution depuis un gestionnaire de secrets garde le secret hors de l'image, du dépôt et des journaux, et rend la rotation possible. « Un fichier settings ignoré par git » est faux car il est à une erreur près d'être versionné et n'est pas rotatif. « Intégrée à l'image » est faux car quiconque peut récupérer l'image obtient la clé. « Chiffrée avec la clé à côté » est faux car stocker la clé avec le chiffré n'apporte aucune protection.",
    },
    {
      prompt:
        "Le profilage montre qu'une part importante du temps de requête est consacrée à l'établissement des connexions TLS vers le fournisseur. Le code crée un nouvel objet client à chaque requête. Que faut-il changer ?",
      options: [
        "Créer un client unique à longue durée de vie au démarrage de l'application et réutiliser son pool de connexions",
        "Passer à un modèle plus rapide",
        "Ajouter des réplicas du service",
        "Désactiver la vérification des certificats TLS",
      ],
      answer: 0,
      explanation:
        "Correct : un client réutilisé garde les connexions chaudes et sort le coût de la poignée de main du chemin critique. « Un modèle plus rapide » est faux car le surcoût est dans le transport, pas l'inférence. « Des réplicas » est faux car cela multiplie le même gaspillage. « Désactiver la vérification des certificats » est faux car c'est une régression de sécurité majeure pour un gain mineur.",
    },
    {
      prompt:
        "Un point d'entrée POST démarre une exécution d'agent coûteuse en plusieurs étapes. Un délai côté client provoque une relance du navigateur et l'exécution a lieu deux fois. Quel est le bon contrôle ?",
      options: [
        "Accepter une clé d'idempotence fournie par le client et renvoyer l'exécution existante pour une clé déjà vue",
        "Augmenter le délai côté client",
        "Bloquer les requêtes dupliquées venant de la même adresse IP",
        "Rendre le point d'entrée synchrone pour empêcher les relances",
      ],
      answer: 0,
      explanation:
        "Correct : une clé d'idempotence fait renvoyer l'exécution d'origine au lieu d'en lancer une nouvelle, c'est la correction standard des écritures non idempotentes relancées. « Augmenter le délai » est faux car cela réduit la fenêtre sans la fermer. « Bloquer par IP » est faux car cela casse les utilisateurs légitimes en réseau partagé et rate les autres chemins de relance. « Rendre synchrone » est faux car les appels synchrones longs rendent délais et relances plus probables.",
    },
    {
      prompt:
        "Un traitement par lot lance un asyncio.gather sur 5000 documents, chacun appelant l'API d'embeddings. Le fournisseur renvoie des 429 et le traitement s'effondre. Quelle conception est correcte ?",
      options: [
        "Borner la concurrence par un sémaphore dimensionné sur la limite de débit, regrouper les entrées par appel et appliquer un backoff",
        "Capturer l'exception 429 et passer au document suivant",
        "Répartir le traitement sur 10 processus pour que chacun envoie moins de requêtes",
        "Demander une augmentation de quota et garder le même code",
      ],
      answer: 0,
      explanation:
        "Correct : la concurrence bornée maintient le traitement dans le budget du fournisseur, le regroupement réduit le nombre d'appels et le backoff absorbe les limites transitoires. « Capturer et passer au suivant » est faux car cela perd silencieusement des documents. « Dix processus » est faux car le débit agrégé reste identique, voire pire. « Demander plus de quota » est faux car un éventail d'appels non borné saturera n'importe quel quota accordé.",
    },
  ],
};

const SPEC = {
  insertAfter: "genai-foundations",
  id: "python-prod-ai",
  weeks: { en: "Week 3", fr: "Semaine 3" },
  title: {
    en: "Production Python and API engineering for AI systems",
    fr: "Python de production et ingénierie d'API pour systèmes IA",
  },
  objective: {
    en: "Close the gap between a notebook that works and a service that survives: async I/O, strict contracts, timeouts, retries, reproducible builds, tests that do not call the provider, and automation.",
    fr: "Combler l'écart entre un notebook qui marche et un service qui tient : entrées-sorties asynchrones, contrats stricts, délais, relances, builds reproductibles, tests qui n'appellent pas le fournisseur, et automatisation.",
  },
  outcomes: {
    en: [
      "Expose a streaming AI endpoint with FastAPI without blocking the event loop",
      "Enforce contracts at the boundary with Pydantic and structured model output",
      "Apply timeouts, bounded concurrency, retries with jitter and connection reuse to every provider call",
      "Test AI code deterministically with recorded responses, and keep a scheduled live contract test",
      "Ship reproducibly: lock files, environment-based configuration, secret management and CI automation",
      "Emit structured logs with a correlation identifier that survives service hops",
    ],
    fr: [
      "Exposer un point d'entrée IA en streaming avec FastAPI sans bloquer la boucle d'événements",
      "Faire respecter les contrats à la frontière avec Pydantic et la sortie structurée du modèle",
      "Appliquer délais, concurrence bornée, relances avec gigue et réutilisation des connexions à chaque appel fournisseur",
      "Tester le code IA de façon déterministe avec des réponses enregistrées, et conserver un test de contrat en direct planifié",
      "Livrer de façon reproductible : fichiers de verrouillage, configuration par environnement, gestion des secrets et automatisation CI",
      "Émettre des journaux structurés avec un identifiant de corrélation qui survit aux sauts entre services",
    ],
  },
  deliverables: {
    en: [
      "A FastAPI chat service with streaming, timeout, bounded concurrency, retry with jitter and a reused client",
      "A test suite that runs offline with recorded provider responses, plus one scheduled live contract test",
      "A CI pipeline running lint, type checks, tests and dependency audit on every pull request",
    ],
    fr: [
      "Un service de chat FastAPI avec streaming, délai, concurrence bornée, relance avec gigue et client réutilisé",
      "Une suite de tests exécutable hors ligne avec réponses fournisseur enregistrées, plus un test de contrat en direct planifié",
      "Une chaîne CI exécutant lint, vérification de types, tests et audit de dépendances à chaque pull request",
    ],
  },
  resources: [
    { name: "FastAPI documentation", url: "https://fastapi.tiangolo.com/" },
    { name: "Pydantic — models and validation", url: "https://docs.pydantic.dev/latest/concepts/models/" },
    { name: "Python asyncio — developing with asyncio", url: "https://docs.python.org/3/library/asyncio-dev.html" },
    { name: "pytest documentation", url: "https://docs.pytest.org/en/stable/" },
    { name: "OpenAI Python SDK", url: "https://github.com/openai/openai-python" },
    { name: "The Twelve-Factor App", url: "https://12factor.net/" },
    { name: "uv — Python packaging and project management", url: "https://docs.astral.sh/uv/" },
  ],
  recoverFromArchive: RECOVER,
  quiz: QUIZ,
};

insertModule(SPEC, "Migration 02 — python-prod-ai");


