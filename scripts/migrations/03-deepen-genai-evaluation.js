#!/usr/bin/env node
/**
 * Migration 03 — Deepen "genai-evaluation", the first pillar of the
 * AI Engineer Expert role ("GenAI application evaluation").
 *
 * Adds 11 authored questions covering what the restructured module was missing:
 * LLM-as-a-judge mechanics and biases, judge calibration, regression gating in
 * CI, non-determinism, online evaluation, and safety evaluation.
 *
 * Usage: node scripts/migrations/03-deepen-genai-evaluation.js [--dry-run]
 */

const { appendQuestions } = require("./lib/insert-module");

appendQuestions(
  {
    moduleId: "genai-evaluation",
    quiz: {
      en: [
        {
          prompt:
            "You adopt an LLM judge to score answer quality. Before trusting a single number from it, what must you do first?",
          options: [
            "Calibrate the judge against a human-labelled subset and report the agreement rate",
            "Use the largest available model as the judge",
            "Run the judge three times and average the scores",
            "Ask the judge to also explain its reasoning",
          ],
          answer: 0,
          explanation:
            "Correct: a judge is itself a model under test, so its scores are meaningless until you measure agreement with human labels on a representative subset. 'Use the largest model' is wrong because size does not guarantee alignment with your rubric. 'Average three runs' is wrong because it reduces variance around a possibly biased centre. 'Ask for reasoning' is wrong because an explanation improves debuggability but does not establish validity.",
        },
        {
          prompt:
            "Your pairwise LLM judge consistently prefers the response shown first. What is the standard mitigation?",
          options: [
            "Evaluate each pair in both orders and only count a win when the judge agrees with itself",
            "Instruct the judge to ignore the order of the answers",
            "Always place the new candidate second",
            "Switch from pairwise comparison to a numeric score",
          ],
          answer: 0,
          explanation:
            "Correct: position bias is measured and cancelled by swapping the order and requiring consistency, which also surfaces how often the judge is unstable. 'Instruct it to ignore order' is wrong because the bias persists despite the instruction. 'Always place the new candidate second' is wrong because it systematically penalises your candidate. 'Switch to a numeric score' is wrong because pointwise scoring introduces its own calibration drift without removing bias.",
        },
        {
          prompt:
            "An evaluation suite scores answers against a reference text with ROUGE. A correct answer phrased differently scores poorly. What is the right correction?",
          options: [
            "Replace lexical overlap with criterion-based grading that checks whether required facts and citations are present",
            "Expand the reference answers with more synonyms",
            "Lower the passing threshold so paraphrases pass",
            "Set temperature to zero so output matches the reference",
          ],
          answer: 0,
          explanation:
            "Correct: the metric should check the claims that matter, not surface word overlap, which is why fact and citation checks or rubric grading are used for open-ended answers. 'More synonyms' is wrong because it endlessly chases wording variants. 'Lower the threshold' is wrong because it hides real failures together with false ones. 'Temperature zero' is wrong because it makes output stable, not aligned with one arbitrary phrasing.",
        },
        {
          prompt:
            "You want a CI gate for a RAG assistant. Which gate design is strongest?",
          options: [
            "Block on a drop in the primary quality metric beyond a stated tolerance, and block on any regression in the safety and refusal subsets",
            "Block when the average score falls below last week's average",
            "Block on any individual case that changes its verdict",
            "Warn on regressions but never block, to keep delivery fast",
          ],
          answer: 0,
          explanation:
            "Correct: a tolerance absorbs legitimate noise on the primary metric, while safety and refusal subsets are treated as hard gates because their failures are not acceptable at any rate. 'Below last week's average' is wrong because a drifting baseline lets quality erode slowly. 'Any case changing verdict' is wrong because non-determinism makes that gate permanently red. 'Warn but never block' is wrong because an unenforced gate is documentation, not control.",
        },
        {
          prompt:
            "Re-running the same evaluation suite without any code change produces scores of 81%, 84% and 79%. What should you conclude?",
          options: [
            "The suite needs repeated runs and a confidence interval so the gate compares distributions rather than single points",
            "The evaluation suite is broken and must be rewritten",
            "The model provider changed the model silently",
            "The golden dataset is too small to be useful",
          ],
          answer: 0,
          explanation:
            "Correct: generation is stochastic, so a responsible gate measures run-to-run variance and compares intervals instead of single numbers. 'The suite is broken' is wrong because variance is expected behaviour, not a defect. 'The provider changed the model' is wrong because that is a hypothesis you can only test after establishing your own baseline variance. 'The dataset is too small' may contribute, but the first step is to quantify the variance you actually have.",
        },
        {
          prompt:
            "An underwriting assistant scores 92% on your offline suite but complaints rise after launch. What is the most likely cause?",
          options: [
            "The golden dataset does not reflect the real distribution of production queries",
            "The offline suite used too few metrics",
            "The model is overfitted to the system prompt",
            "The judge model is too lenient on long answers",
          ],
          answer: 0,
          explanation:
            "Correct: a high offline score that does not survive contact with users almost always means distribution mismatch, so the dataset must be refreshed from sampled production traffic. 'Too few metrics' is wrong because more metrics on the wrong data still measure the wrong thing. 'Overfitted to the system prompt' is not a coherent failure mode for an unmodified model. 'A lenient judge' is possible but would usually show up as disagreement with human review, which is a separate check.",
        },
        {
          prompt:
            "Which evaluation layer isolates whether a wrong answer was caused by retrieval rather than generation?",
          options: [
            "Context recall and context precision measured on the retrieved chunks against the expected evidence",
            "Answer relevancy scored by a judge model",
            "End-to-end task success rate",
            "User thumbs-up rate in production",
          ],
          answer: 0,
          explanation:
            "Correct: measuring whether the expected evidence was actually retrieved separates a retrieval miss from a generation failure, which is the first branch of any RAG diagnosis. 'Answer relevancy' is wrong because it scores the final answer and conflates both causes. 'Task success rate' is wrong for the same reason, at an even coarser level. 'Thumbs-up rate' is wrong because it is an aggregate online signal with no causal resolution.",
        },
        {
          prompt:
            "You can label 200 production conversations per month with expert annotators. How should you spend that budget?",
          options: [
            "Stratify sampling across high-risk intents, low-confidence outputs and disagreements with the automated judge",
            "Label a uniform random sample so the statistics stay unbiased",
            "Label the conversations with the most user messages",
            "Label the conversations that received a thumbs-down",
          ],
          answer: 0,
          explanation:
            "Correct: stratified sampling spends scarce expert attention where information gain and business risk are highest, including the cases where your automation is least reliable. 'Uniform random' is wrong because most traffic is easy and teaches you little. 'Most user messages' is wrong because conversation length is a weak proxy for risk. 'Only thumbs-down' is wrong because it misses silent failures users never report.",
        },
        {
          prompt:
            "A new prompt version improves offline quality by four points. What is the safest way to confirm the gain in production?",
          options: [
            "Run a canary on a traffic slice with guardrail metrics on latency, cost and escalation rate, and a pre-agreed rollback rule",
            "Deploy to all users and watch the dashboard for a week",
            "Ship it because the offline suite is the agreed gate",
            "Run it in shadow mode indefinitely and never promote it",
          ],
          answer: 0,
          explanation:
            "Correct: a canary limits exposure, guardrail metrics catch the regressions the quality metric does not see, and a pre-agreed rollback rule removes hesitation during an incident. 'Deploy to all users' is wrong because it maximises blast radius. 'Ship because offline passed' is wrong because offline suites systematically miss production distribution effects. 'Shadow mode indefinitely' is wrong because it never delivers the value and costs twice.",
        },
        {
          prompt:
            "What distinguishes a safety evaluation from a quality evaluation for a customer-facing assistant?",
          options: [
            "Safety evaluation uses adversarial and edge-case inputs and is judged against an absolute threshold rather than an average",
            "Safety evaluation uses a larger judge model",
            "Safety evaluation runs only before the first release",
            "Safety evaluation replaces quality evaluation once compliance has signed off",
          ],
          answer: 0,
          explanation:
            "Correct: safety is measured on deliberately hostile inputs and fails on the individual case, because an average safety score hides the incident you actually care about. 'A larger judge model' is wrong because model size is not the distinguishing property. 'Only before the first release' is wrong because new jailbreaks and new content appear continuously. 'Replaces quality evaluation' is wrong because the two answer different questions and both remain necessary.",
        },
        {
          prompt:
            "You must report evaluation results to a steering committee that includes compliance and finance. Which format is strongest?",
          options: [
            "One headline quality metric with its trend, the guardrail metrics it is traded against, and the two open risks with owners",
            "The full metric table from the evaluation framework",
            "A selection of impressive example conversations",
            "The aggregate judge score and nothing else, to avoid confusion",
          ],
          answer: 0,
          explanation:
            "Correct: a decision-making audience needs one headline number in context, the trade-offs behind it, and the risks that require a decision. 'The full metric table' is wrong because it transfers the interpretation burden to the audience. 'Impressive examples' is wrong because cherry-picked anecdotes are not evidence and damage credibility. 'The aggregate score alone' is wrong because it hides exactly the trade-offs this audience is accountable for.",
        },
      ],
      fr: [
        {
          prompt:
            "Vous adoptez un juge LLM pour noter la qualité des réponses. Avant de faire confiance à un seul de ses chiffres, que devez-vous faire d'abord ?",
          options: [
            "Calibrer le juge sur un sous-ensemble annoté par des humains et publier le taux d'accord",
            "Utiliser le plus gros modèle disponible comme juge",
            "Lancer le juge trois fois et moyenner les scores",
            "Demander au juge d'expliquer aussi son raisonnement",
          ],
          answer: 0,
          explanation:
            "Correct : un juge est lui-même un modèle à tester, ses scores n'ont aucun sens tant que l'accord avec des annotations humaines n'est pas mesuré sur un échantillon représentatif. « Le plus gros modèle » est faux car la taille ne garantit pas l'alignement sur votre rubrique. « Moyenner trois exécutions » est faux car cela réduit la variance autour d'un centre possiblement biaisé. « Demander le raisonnement » est faux car une explication améliore le débogage mais n'établit pas la validité.",
        },
        {
          prompt:
            "Votre juge LLM en comparaison par paires préfère systématiquement la réponse affichée en premier. Quelle est la mitigation standard ?",
          options: [
            "Évaluer chaque paire dans les deux ordres et ne compter une victoire que si le juge est d'accord avec lui-même",
            "Demander au juge d'ignorer l'ordre des réponses",
            "Toujours placer le nouveau candidat en second",
            "Passer de la comparaison par paires à une note numérique",
          ],
          answer: 0,
          explanation:
            "Correct : le biais de position se mesure et s'annule en permutant l'ordre et en exigeant la cohérence, ce qui révèle aussi la fréquence d'instabilité du juge. « Lui demander d'ignorer l'ordre » est faux car le biais persiste malgré la consigne. « Toujours placer le candidat en second » est faux car cela le pénalise systématiquement. « Passer à une note numérique » est faux car la notation ponctuelle introduit sa propre dérive de calibration sans supprimer le biais.",
        },
        {
          prompt:
            "Une suite d'évaluation note les réponses face à un texte de référence avec ROUGE. Une bonne réponse formulée autrement obtient un score médiocre. Quelle est la bonne correction ?",
          options: [
            "Remplacer le recouvrement lexical par une notation par critères vérifiant la présence des faits et des citations attendus",
            "Enrichir les réponses de référence avec davantage de synonymes",
            "Abaisser le seuil de réussite pour que les paraphrases passent",
            "Mettre la température à zéro pour que la sortie colle à la référence",
          ],
          answer: 0,
          explanation:
            "Correct : la métrique doit vérifier les affirmations qui comptent, pas le recouvrement de mots, d'où l'usage de contrôles de faits et de citations ou d'une notation par rubrique pour les réponses ouvertes. « Davantage de synonymes » est faux car cela poursuit indéfiniment les variantes de formulation. « Abaisser le seuil » est faux car cela masque les vraies défaillances avec les fausses. « Température zéro » est faux car cela rend la sortie stable, pas alignée sur une formulation arbitraire.",
        },
        {
          prompt:
            "Vous voulez un verrou CI pour un assistant RAG. Quelle conception est la plus solide ?",
          options: [
            "Bloquer sur une baisse de la métrique de qualité principale au-delà d'une tolérance annoncée, et bloquer sur toute régression des sous-ensembles safety et refus",
            "Bloquer quand le score moyen passe sous la moyenne de la semaine précédente",
            "Bloquer dès qu'un cas individuel change de verdict",
            "Avertir sur les régressions sans jamais bloquer, pour garder le rythme de livraison",
          ],
          answer: 0,
          explanation:
            "Correct : une tolérance absorbe le bruit légitime de la métrique principale, tandis que les sous-ensembles safety et refus sont des verrous durs car leurs défaillances ne sont acceptables à aucun taux. « Sous la moyenne de la semaine précédente » est faux car une référence glissante laisse la qualité s'éroder lentement. « Tout cas changeant de verdict » est faux car le non-déterminisme rendrait ce verrou perpétuellement rouge. « Avertir sans bloquer » est faux car un verrou non appliqué est de la documentation, pas un contrôle.",
        },
        {
          prompt:
            "Relancer la même suite d'évaluation sans aucun changement de code donne 81 %, 84 % puis 79 %. Que faut-il conclure ?",
          options: [
            "La suite exige des exécutions répétées et un intervalle de confiance pour que le verrou compare des distributions et non des points isolés",
            "La suite d'évaluation est cassée et doit être réécrite",
            "Le fournisseur a changé le modèle silencieusement",
            "Le jeu de référence est trop petit pour être utile",
          ],
          answer: 0,
          explanation:
            "Correct : la génération est stochastique, un verrou sérieux mesure donc la variance entre exécutions et compare des intervalles plutôt que des nombres isolés. « La suite est cassée » est faux car la variance est un comportement attendu, pas un défaut. « Le fournisseur a changé le modèle » est faux car c'est une hypothèse qui ne peut être testée qu'après avoir établi sa propre variance de référence. « Le jeu est trop petit » peut y contribuer, mais la première étape est de quantifier la variance réellement observée.",
        },
        {
          prompt:
            "Un assistant de souscription obtient 92 % sur votre suite hors ligne mais les réclamations augmentent après la mise en service. Quelle est la cause la plus probable ?",
          options: [
            "Le jeu de référence ne reflète pas la distribution réelle des requêtes de production",
            "La suite hors ligne utilisait trop peu de métriques",
            "Le modèle est surajusté au prompt système",
            "Le modèle juge est trop indulgent avec les réponses longues",
          ],
          answer: 0,
          explanation:
            "Correct : un score hors ligne élevé qui ne survit pas au contact des utilisateurs signale presque toujours un écart de distribution, et le jeu doit être réalimenté par du trafic de production échantillonné. « Trop peu de métriques » est faux car davantage de métriques sur les mauvaises données mesurent toujours la mauvaise chose. « Surajusté au prompt système » n'est pas un mode de défaillance cohérent pour un modèle non modifié. « Un juge indulgent » est possible mais se manifesterait par un désaccord avec la revue humaine, qui est un contrôle distinct.",
        },
        {
          prompt:
            "Quelle couche d'évaluation permet d'isoler si une mauvaise réponse vient de la recherche plutôt que de la génération ?",
          options: [
            "Le rappel et la précision du contexte mesurés sur les passages récupérés face aux preuves attendues",
            "La pertinence de la réponse notée par un modèle juge",
            "Le taux de réussite de la tâche de bout en bout",
            "Le taux de pouces levés en production",
          ],
          answer: 0,
          explanation:
            "Correct : mesurer si la preuve attendue a bien été récupérée sépare un échec de recherche d'un échec de génération, ce qui est la première bifurcation de tout diagnostic RAG. « La pertinence de la réponse » est faux car elle note la réponse finale et confond les deux causes. « Le taux de réussite » est faux pour la même raison, à un grain encore plus grossier. « Le taux de pouces levés » est faux car c'est un signal en ligne agrégé sans résolution causale.",
        },
        {
          prompt:
            "Vous pouvez faire annoter 200 conversations de production par mois par des experts. Comment dépenser ce budget ?",
          options: [
            "Échantillonner de façon stratifiée sur les intentions à fort risque, les sorties peu confiantes et les désaccords avec le juge automatique",
            "Annoter un échantillon aléatoire uniforme pour que les statistiques restent non biaisées",
            "Annoter les conversations comportant le plus de messages utilisateur",
            "Annoter les conversations ayant reçu un pouce baissé",
          ],
          answer: 0,
          explanation:
            "Correct : l'échantillonnage stratifié dépense une attention experte rare là où le gain d'information et le risque métier sont les plus élevés, y compris là où votre automatisation est la moins fiable. « Aléatoire uniforme » est faux car l'essentiel du trafic est facile et n'apprend presque rien. « Le plus de messages » est faux car la longueur est un mauvais indicateur de risque. « Seulement les pouces baissés » est faux car cela rate les défaillances silencieuses jamais signalées.",
        },
        {
          prompt:
            "Une nouvelle version de prompt améliore la qualité hors ligne de quatre points. Quelle est la façon la plus sûre de confirmer le gain en production ?",
          options: [
            "Lancer un canari sur une fraction du trafic avec des métriques garde-fous sur la latence, le coût et le taux d'escalade, et une règle de retour arrière convenue à l'avance",
            "Déployer pour tous les utilisateurs et surveiller le tableau de bord pendant une semaine",
            "Livrer, puisque la suite hors ligne est le verrou convenu",
            "Le faire tourner indéfiniment en mode fantôme sans jamais le promouvoir",
          ],
          answer: 0,
          explanation:
            "Correct : un canari limite l'exposition, les métriques garde-fous attrapent les régressions que la métrique de qualité ne voit pas, et une règle de retour arrière convenue supprime l'hésitation pendant l'incident. « Déployer pour tous » est faux car cela maximise le rayon d'impact. « Livrer puisque le hors ligne est passé » est faux car les suites hors ligne ratent systématiquement les effets de distribution de production. « Mode fantôme indéfini » est faux car cela ne délivre jamais la valeur et coûte double.",
        },
        {
          prompt:
            "Qu'est-ce qui distingue une évaluation de safety d'une évaluation de qualité pour un assistant destiné aux clients ?",
          options: [
            "L'évaluation de safety utilise des entrées adverses et des cas limites, et se juge sur un seuil absolu plutôt que sur une moyenne",
            "L'évaluation de safety utilise un modèle juge plus gros",
            "L'évaluation de safety ne s'exécute qu'avant la première mise en service",
            "L'évaluation de safety remplace l'évaluation de qualité une fois la conformité validée",
          ],
          answer: 0,
          explanation:
            "Correct : la safety se mesure sur des entrées délibérément hostiles et échoue au cas individuel, car un score moyen de safety masque précisément l'incident qui compte. « Un modèle juge plus gros » est faux car la taille n'est pas la propriété distinctive. « Seulement avant la première mise en service » est faux car de nouveaux contournements et contenus apparaissent en continu. « Remplace l'évaluation de qualité » est faux car les deux répondent à des questions différentes et restent toutes deux nécessaires.",
        },
        {
          prompt:
            "Vous devez restituer des résultats d'évaluation à un comité de pilotage incluant la conformité et la finance. Quel format est le plus solide ?",
          options: [
            "Une métrique de qualité phare avec sa tendance, les métriques garde-fous avec lesquelles elle s'arbitre, et les deux risques ouverts avec leurs responsables",
            "Le tableau complet des métriques issu du framework d'évaluation",
            "Une sélection de conversations d'exemple impressionnantes",
            "Le score agrégé du juge et rien d'autre, pour éviter la confusion",
          ],
          answer: 0,
          explanation:
            "Correct : un auditoire décisionnaire a besoin d'un chiffre phare remis en contexte, des arbitrages qui le sous-tendent et des risques appelant une décision. « Le tableau complet » est faux car il transfère la charge d'interprétation à l'auditoire. « Des exemples impressionnants » est faux car des anecdotes choisies ne sont pas des preuves et abîment la crédibilité. « Le score agrégé seul » est faux car il masque exactement les arbitrages dont cet auditoire est comptable.",
        },
      ],
    },
  },
  "Migration 03 — deepen genai-evaluation"
);

