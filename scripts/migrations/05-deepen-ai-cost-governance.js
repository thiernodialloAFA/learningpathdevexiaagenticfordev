#!/usr/bin/env node
/**
 * Migration 05 — Deepen "ai-cost-governance", the third pillar of the role
 * ("AI consumption optimisation ... model selection, context management, prompt
 * design, caching, routing, orchestration, infrastructure choices, and usage
 * governance").
 *
 * Adds 11 authored questions covering unit-cost modelling, prompt and semantic
 * caching, model cascades, context budgets, batch processing, provisioned
 * throughput, fine-tuning break-even and chargeback.
 *
 * Usage: node scripts/migrations/05-deepen-ai-cost-governance.js [--dry-run]
 */

const { appendQuestions } = require("./lib/insert-module");

appendQuestions(
  {
    moduleId: "ai-cost-governance",
    quiz: {
      en: [
        {
          prompt:
            "A RAG assistant sends 12,000 input tokens and generates 300 output tokens per request. Output tokens are billed four times the input rate. Where is the spend concentrated?",
          options: [
            "In the input tokens, because 12,000 at rate one still exceeds 300 at rate four by a factor of ten",
            "In the output tokens, because their unit rate is four times higher",
            "Evenly, because the rate difference compensates the volume difference",
            "In the embedding calls, which dominate any RAG pipeline",
          ],
          answer: 0,
          explanation:
            "Correct: 12,000 units of cost versus 1,200 means the retrieved context dominates, so context trimming and caching are the first levers. 'In the output tokens' is wrong because a four-times rate does not compensate a forty-times volume gap. 'Evenly' is wrong for the same arithmetic reason. 'The embedding calls' is wrong because embedding a query is a tiny fraction of a generation call.",
        },
        {
          prompt:
            "Your prompt begins with a 6,000-token policy preamble identical on every request, followed by the user question. Which lever applies first?",
          options: [
            "Prompt caching on the stable prefix, keeping the prefix byte-identical so the cache is hit",
            "Summarising the preamble with a small model on every request",
            "Moving the preamble to the end of the prompt",
            "Switching to a model with a larger context window",
          ],
          answer: 0,
          explanation:
            "Correct: a large invariant prefix is exactly the shape prompt caching is designed for, and cached input tokens are billed at a fraction of the normal rate. 'Summarising on every request' is wrong because it adds a model call to save tokens on another one. 'Moving the preamble to the end' is wrong because caching requires the stable content to be the prefix. 'A larger context window' is wrong because it increases capacity, not affordability.",
        },
        {
          prompt:
            "You add a semantic cache keyed on embedding similarity. Which risk must you control first?",
          options: [
            "A false hit returning a stale or wrong answer for a question that was only superficially similar",
            "The additional latency of computing the query embedding",
            "The storage cost of the cached answers",
            "The need to re-embed the cache when the model is upgraded",
          ],
          answer: 0,
          explanation:
            "Correct: a semantic cache trades correctness for cost, and a wrongly matched question returns a confidently wrong answer, so the similarity threshold and the invalidation policy are the critical controls. 'The embedding latency' is wrong because it is milliseconds against seconds saved. 'Storage cost' is wrong because text is negligible next to inference. 'Re-embedding on upgrade' is real but operational, not a correctness risk to users.",
        },
        {
          prompt:
            "You introduce a cascade: a small model answers first and escalates to a large model when confidence is low. What must be measured to call this a success?",
          options: [
            "The escalation rate, the end-to-end quality on the full traffic, and the cost per resolved task",
            "The cost per model call before and after",
            "The share of traffic handled by the small model",
            "The latency of the small model",
          ],
          answer: 0,
          explanation:
            "Correct: a cascade only wins if quality on the whole traffic holds while the cost of actually resolving a task falls, and the escalation rate explains the economics. 'Cost per model call' is wrong because a cascade can make two calls where there was one. 'Share handled by the small model' is wrong because it is a vanity metric if quality drops. 'Small-model latency' is wrong because the escalated path dominates the user-visible tail.",
        },
        {
          prompt:
            "A nightly job classifies 200,000 documents with no latency requirement. What is the strongest cost decision?",
          options: [
            "Use the provider's batch API, which trades turnaround time for a substantially lower token rate",
            "Run the same synchronous calls with higher concurrency",
            "Switch to the cheapest model regardless of quality",
            "Negotiate a volume discount with the provider",
          ],
          answer: 0,
          explanation:
            "Correct: batch processing exists precisely for latency-insensitive bulk workloads and is the largest structural discount available without changing the model. 'Higher concurrency' is wrong because it finishes sooner at the same unit price while risking rate limits. 'The cheapest model regardless of quality' is wrong because unusable classifications cost more than they save. 'Negotiating a discount' is a commercial lever, not an engineering one, and is usually smaller.",
        },
        {
          prompt:
            "Your traffic is steady at a high and predictable volume during business hours. Which purchasing model should you evaluate?",
          options: [
            "Provisioned throughput for the predictable baseline, with pay-as-you-go absorbing the peaks",
            "Pay-as-you-go only, since it requires no commitment",
            "Provisioned throughput sized for the daily peak",
            "A dedicated self-hosted deployment of an open-weight model",
          ],
          answer: 0,
          explanation:
            "Correct: reserving capacity for the predictable floor captures the discount and the latency stability, while on-demand covers variability without paying for idle reserved capacity. 'Pay-as-you-go only' is wrong because it leaves the baseline discount on the table. 'Sized for the peak' is wrong because you then pay for reserved capacity that idles most of the day. 'Self-hosting' may be viable but introduces operational, scaling and compliance costs that must be proven first.",
        },
        {
          prompt:
            "Fine-tuning a small model would cost 20,000 euros and cut per-request cost by 0.004 euros. Traffic is 1 million requests per year. What does the break-even analysis say?",
          options: [
            "Savings are about 4,000 euros per year, so the five-year payback makes fine-tuning hard to justify on cost alone",
            "It pays back within a year, so proceed",
            "Break-even cannot be computed without knowing the model size",
            "Fine-tuning always pays back because inference dominates total cost",
          ],
          answer: 0,
          explanation:
            "Correct: one million times 0.004 is 4,000 euros per year against a 20,000 euro investment, a five-year payback, which means the decision must rest on quality or latency gains rather than cost. 'Pays back within a year' is wrong arithmetically. 'Cannot be computed' is wrong because the two figures given are sufficient. 'Fine-tuning always pays back' is wrong because it ignores the maintenance cost of a tuned model across base-model upgrades.",
        },
        {
          prompt:
            "A team proposes cutting cost by truncating retrieved context to the top two chunks. How should the proposal be evaluated?",
          options: [
            "Run the evaluation suite at two, three and five chunks and plot cost against the quality metric to pick an informed point",
            "Accept it, because fewer tokens always reduce cost",
            "Reject it, because reducing context always harms quality",
            "Accept it for simple questions only, based on prompt length",
          ],
          answer: 0,
          explanation:
            "Correct: a context budget decision is an empirical trade-off, and the curve of quality against cost is what makes the chosen point defensible. 'Accept it because fewer tokens cost less' is wrong because it ignores the quality side entirely. 'Reject it because context always helps' is wrong because irrelevant context also degrades answers. 'Based on prompt length' is wrong because length is a poor proxy for question difficulty.",
        },
        {
          prompt:
            "Five entities share one GenAI platform and nobody owns the invoice. Which governance mechanism changes behaviour most effectively?",
          options: [
            "Per-entity showback with quotas and budget alerts, so each team sees and owns its own consumption",
            "A monthly report of total platform spend sent to all entities",
            "A central approval step for every new use case",
            "A hard global rate limit shared by all entities",
          ],
          answer: 0,
          explanation:
            "Correct: attributing consumption to the team that causes it, with a quota and an alert, is what creates accountability and self-correction. 'A total spend report' is wrong because a shared number is nobody's responsibility. 'Central approval for every use case' is wrong because it slows delivery without governing ongoing consumption. 'A shared global rate limit' is wrong because it punishes well-behaved teams for a noisy neighbour.",
        },
        {
          prompt:
            "A cost reduction cut spend by 35% and the headline quality metric stayed flat. What must you check before declaring success?",
          options: [
            "Whether the guardrail metrics moved: escalation to human agents, refusal rate, latency tail and the hardest query segments",
            "Whether the saving persists for a full billing cycle",
            "Whether the provider changed its prices in the same period",
            "Whether the evaluation suite was run on the same hardware",
          ],
          answer: 0,
          explanation:
            "Correct: an unchanged average frequently hides a collapse on the hard segment, which surfaces as escalations, refusals and tail latency rather than in the headline metric. 'Persistence for a billing cycle' matters for accounting but not for quality risk. 'A price change' would alter the saving but not the question of hidden degradation. 'The same hardware' is irrelevant to a hosted model evaluation.",
        },
        {
          prompt:
            "Which statement would you put in front of a steering committee to justify a model routing policy?",
          options: [
            "Routing cuts cost per resolved claim from 0.42 to 0.26 euros with groundedness unchanged and escalation up 0.3 points, within the agreed tolerance",
            "Routing reduces our token consumption by 38%",
            "Routing lets us use the newest small model, which is state of the art",
            "Routing is a best practice recommended by the main providers",
          ],
          answer: 0,
          explanation:
            "Correct: it states a business unit cost, the quality evidence, the side effect and the agreed tolerance, which is exactly what a decision body needs. 'Reduces token consumption by 38%' is wrong because tokens are not the business unit and say nothing about quality. 'The newest small model' is wrong because novelty is not an argument. 'A best practice recommended by providers' is wrong because authority is not evidence for your workload.",
        },
      ],
      fr: [
        {
          prompt:
            "Un assistant RAG envoie 12 000 tokens en entrée et génère 300 tokens en sortie par requête. Les tokens de sortie sont facturés quatre fois le tarif d'entrée. Où se concentre la dépense ?",
          options: [
            "Dans les tokens d'entrée, car 12 000 au tarif un dépasse encore 300 au tarif quatre d'un facteur dix",
            "Dans les tokens de sortie, car leur tarif unitaire est quatre fois plus élevé",
            "De façon équilibrée, car l'écart de tarif compense l'écart de volume",
            "Dans les appels d'embeddings, qui dominent toute chaîne RAG",
          ],
          answer: 0,
          explanation:
            "Correct : 12 000 unités de coût contre 1 200 signifie que le contexte récupéré domine, donc la réduction du contexte et le cache sont les premiers leviers. « Dans les tokens de sortie » est faux car un tarif quatre fois supérieur ne compense pas un écart de volume de quarante. « De façon équilibrée » est faux pour la même raison arithmétique. « Les appels d'embeddings » est faux car encoder une requête représente une fraction infime d'un appel de génération.",
        },
        {
          prompt:
            "Votre prompt commence par un préambule de politique de 6 000 tokens identique à chaque requête, suivi de la question utilisateur. Quel levier s'applique en premier ?",
          options: [
            "Le cache de prompt sur le préfixe stable, en gardant ce préfixe identique à l'octet près pour que le cache soit touché",
            "Résumer le préambule avec un petit modèle à chaque requête",
            "Déplacer le préambule à la fin du prompt",
            "Passer à un modèle à plus grande fenêtre de contexte",
          ],
          answer: 0,
          explanation:
            "Correct : un grand préfixe invariant est exactement la forme pour laquelle le cache de prompt est conçu, et les tokens d'entrée en cache sont facturés à une fraction du tarif normal. « Résumer à chaque requête » est faux car cela ajoute un appel de modèle pour économiser des tokens sur un autre. « Déplacer le préambule à la fin » est faux car le cache exige que le contenu stable soit en préfixe. « Une plus grande fenêtre » est faux car cela augmente la capacité, pas l'économie.",
        },
        {
          prompt:
            "Vous ajoutez un cache sémantique indexé sur la similarité d'embeddings. Quel risque faut-il maîtriser en premier ?",
          options: [
            "Un faux positif renvoyant une réponse périmée ou fausse pour une question seulement superficiellement similaire",
            "La latence supplémentaire du calcul de l'embedding de requête",
            "Le coût de stockage des réponses mises en cache",
            "La nécessité de recalculer les embeddings du cache lors d'une montée de version du modèle",
          ],
          answer: 0,
          explanation:
            "Correct : un cache sémantique échange de la justesse contre du coût, et une question mal appariée renvoie une réponse fausse avec assurance, donc le seuil de similarité et la politique d'invalidation sont les contrôles critiques. « La latence d'embedding » est faux car il s'agit de millisecondes contre des secondes économisées. « Le coût de stockage » est faux car le texte est négligeable face à l'inférence. « Le recalcul lors d'une montée de version » est réel mais opérationnel, pas un risque de justesse pour les utilisateurs.",
        },
        {
          prompt:
            "Vous introduisez une cascade : un petit modèle répond d'abord et escalade vers un grand modèle quand la confiance est faible. Que faut-il mesurer pour parler de succès ?",
          options: [
            "Le taux d'escalade, la qualité de bout en bout sur l'ensemble du trafic et le coût par tâche résolue",
            "Le coût par appel de modèle avant et après",
            "La part du trafic traitée par le petit modèle",
            "La latence du petit modèle",
          ],
          answer: 0,
          explanation:
            "Correct : une cascade ne gagne que si la qualité sur tout le trafic se maintient pendant que le coût de résolution effective d'une tâche baisse, et le taux d'escalade explique l'économie. « Le coût par appel » est faux car une cascade peut faire deux appels là où il y en avait un. « La part du petit modèle » est faux car c'est une métrique de façade si la qualité chute. « La latence du petit modèle » est faux car c'est le chemin escaladé qui domine la queue visible par l'utilisateur.",
        },
        {
          prompt:
            "Un traitement nocturne classe 200 000 documents sans contrainte de latence. Quelle est la décision de coût la plus forte ?",
          options: [
            "Utiliser l'API batch du fournisseur, qui échange du délai de restitution contre un tarif au token nettement inférieur",
            "Lancer les mêmes appels synchrones avec plus de concurrence",
            "Passer au modèle le moins cher sans considération de qualité",
            "Négocier une remise sur volume avec le fournisseur",
          ],
          answer: 0,
          explanation:
            "Correct : le traitement par lots existe précisément pour les charges massives insensibles à la latence et constitue la plus grande remise structurelle disponible sans changer de modèle. « Plus de concurrence » est faux car cela termine plus tôt au même prix unitaire tout en risquant les limites de débit. « Le modèle le moins cher » est faux car des classifications inexploitables coûtent plus qu'elles n'économisent. « Négocier une remise » est un levier commercial, pas d'ingénierie, et généralement plus faible.",
        },
        {
          prompt:
            "Votre trafic est stable, élevé et prévisible pendant les heures ouvrées. Quel modèle d'achat évaluer ?",
          options: [
            "Du débit provisionné pour le socle prévisible, le paiement à l'usage absorbant les pics",
            "Uniquement le paiement à l'usage, puisqu'il n'exige aucun engagement",
            "Du débit provisionné dimensionné sur le pic journalier",
            "Un déploiement dédié auto-hébergé d'un modèle à poids ouverts",
          ],
          answer: 0,
          explanation:
            "Correct : réserver la capacité du socle prévisible capte la remise et la stabilité de latence, tandis que l'usage à la demande couvre la variabilité sans payer de capacité réservée inutilisée. « Uniquement à l'usage » est faux car cela laisse la remise du socle de côté. « Dimensionné sur le pic » est faux car vous payez alors une capacité réservée inactive la majeure partie de la journée. « L'auto-hébergement » peut être viable mais introduit des coûts d'exploitation, de montée en charge et de conformité à démontrer d'abord.",
        },
        {
          prompt:
            "Le fine-tuning d'un petit modèle coûterait 20 000 euros et réduirait le coût par requête de 0,004 euro. Le trafic est d'un million de requêtes par an. Que dit l'analyse de seuil de rentabilité ?",
          options: [
            "L'économie est d'environ 4 000 euros par an, soit un retour sur cinq ans, ce qui rend le fine-tuning difficile à justifier sur le seul coût",
            "Le retour se fait en moins d'un an, il faut y aller",
            "Le seuil ne peut pas être calculé sans connaître la taille du modèle",
            "Le fine-tuning est toujours rentable car l'inférence domine le coût total",
          ],
          answer: 0,
          explanation:
            "Correct : un million multiplié par 0,004 donne 4 000 euros par an face à 20 000 euros investis, soit cinq ans de retour, ce qui impose de fonder la décision sur des gains de qualité ou de latence plutôt que de coût. « Moins d'un an » est faux arithmétiquement. « Impossible à calculer » est faux car les deux chiffres donnés suffisent. « Toujours rentable » est faux car cela ignore le coût de maintenance d'un modèle ajusté à chaque montée de version du modèle de base.",
        },
        {
          prompt:
            "Une équipe propose de réduire le coût en tronquant le contexte récupéré aux deux meilleurs passages. Comment évaluer cette proposition ?",
          options: [
            "Exécuter la suite d'évaluation à deux, trois et cinq passages et tracer le coût face à la métrique de qualité pour choisir un point éclairé",
            "L'accepter, car moins de tokens réduit toujours le coût",
            "La refuser, car réduire le contexte nuit toujours à la qualité",
            "L'accepter pour les seules questions simples, en se basant sur la longueur du prompt",
          ],
          answer: 0,
          explanation:
            "Correct : un budget de contexte est un arbitrage empirique, et la courbe qualité contre coût est ce qui rend le point retenu défendable. « L'accepter car moins de tokens coûte moins » est faux car cela ignore entièrement le versant qualité. « La refuser car le contexte aide toujours » est faux car un contexte non pertinent dégrade aussi les réponses. « En se basant sur la longueur » est faux car la longueur est un mauvais indicateur de difficulté.",
        },
        {
          prompt:
            "Cinq entités partagent une plateforme GenAI et personne ne porte la facture. Quel mécanisme de gouvernance change le plus efficacement les comportements ?",
          options: [
            "Une visibilité des coûts par entité avec quotas et alertes budgétaires, pour que chaque équipe voie et assume sa consommation",
            "Un rapport mensuel de la dépense totale de la plateforme envoyé à toutes les entités",
            "Une étape d'approbation centrale pour chaque nouveau cas d'usage",
            "Une limite de débit globale et dure partagée par toutes les entités",
          ],
          answer: 0,
          explanation:
            "Correct : attribuer la consommation à l'équipe qui la provoque, avec un quota et une alerte, est ce qui crée la responsabilité et l'autocorrection. « Un rapport de dépense totale » est faux car un chiffre partagé n'est la responsabilité de personne. « Une approbation centrale par cas d'usage » est faux car cela ralentit la livraison sans gouverner la consommation courante. « Une limite globale partagée » est faux car elle punit les équipes vertueuses à cause d'un voisin bruyant.",
        },
        {
          prompt:
            "Une réduction de coût a diminué la dépense de 35 % et la métrique de qualité phare n'a pas bougé. Que faut-il vérifier avant de déclarer le succès ?",
          options: [
            "Si les métriques garde-fous ont bougé : escalade vers des conseillers humains, taux de refus, queue de latence et segments de requêtes les plus difficiles",
            "Si l'économie persiste sur un cycle de facturation complet",
            "Si le fournisseur a modifié ses prix sur la même période",
            "Si la suite d'évaluation a été exécutée sur le même matériel",
          ],
          answer: 0,
          explanation:
            "Correct : une moyenne inchangée masque fréquemment un effondrement sur le segment difficile, qui se manifeste par des escalades, des refus et une queue de latence plutôt que dans la métrique phare. « La persistance sur un cycle » compte pour la comptabilité mais pas pour le risque qualité. « Un changement de prix » modifierait l'économie mais pas la question de la dégradation cachée. « Le même matériel » est sans objet pour l'évaluation d'un modèle hébergé.",
        },
        {
          prompt:
            "Quelle formulation présenteriez-vous à un comité de pilotage pour justifier une politique de routage de modèles ?",
          options: [
            "Le routage ramène le coût par sinistre traité de 0,42 à 0,26 euro, à ancrage inchangé et avec une escalade en hausse de 0,3 point, dans la tolérance convenue",
            "Le routage réduit notre consommation de tokens de 38 %",
            "Le routage nous permet d'utiliser le dernier petit modèle, qui est à l'état de l'art",
            "Le routage est une bonne pratique recommandée par les principaux fournisseurs",
          ],
          answer: 0,
          explanation:
            "Correct : elle énonce un coût unitaire métier, la preuve de qualité, l'effet de bord et la tolérance convenue, ce dont une instance de décision a exactement besoin. « Réduit la consommation de tokens de 38 % » est faux car le token n'est pas l'unité métier et ne dit rien de la qualité. « Le dernier petit modèle » est faux car la nouveauté n'est pas un argument. « Une bonne pratique recommandée » est faux car l'argument d'autorité ne vaut pas preuve sur votre charge.",
        },
      ],
    },
  },
  "Migration 05 — deepen ai-cost-governance"
);

