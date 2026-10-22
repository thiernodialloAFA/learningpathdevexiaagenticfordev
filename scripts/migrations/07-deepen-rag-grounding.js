#!/usr/bin/env node
/**
 * Migration 07 — Deepen "rag-grounding".
 *
 * RAG is named explicitly in the job description as a core GenAI application
 * pattern. After the split in migration 01 the module only kept 7 questions.
 *
 * Adds 11 authored questions on chunking, hybrid search, reranking, query
 * rewriting, context ordering, document-level authorisation, freshness and
 * agentic retrieval.
 *
 * Usage: node scripts/migrations/07-deepen-rag-grounding.js [--dry-run]
 */

const { appendQuestions } = require("./lib/insert-module");

appendQuestions(
  {
    moduleId: "rag-grounding",
    quiz: {
      en: [
        {
          prompt:
            "Your corpus is made of insurance policies with numbered clauses. Which chunking strategy is strongest?",
          options: [
            "Split on the document's own structure, keeping each clause whole with its section heading and document identifier as metadata",
            "Fixed 512-token windows with 20% overlap",
            "One chunk per page of the source PDF",
            "One chunk per document, relying on a long context window",
          ],
          answer: 0,
          explanation:
            "Correct: structure-aware chunking keeps a legally meaningful unit intact and attaches the metadata needed for citation and filtering. 'Fixed windows with overlap' is wrong because it cuts clauses in half and duplicates text. 'One chunk per page' is wrong because page boundaries are a printing artefact unrelated to meaning. 'One chunk per document' is wrong because it floods the context with irrelevant clauses and makes precise citation impossible.",
        },
        {
          prompt:
            "Users search with internal product codes such as GAV-2019-B. Dense retrieval misses them. What is the correct fix?",
          options: [
            "Add lexical search and fuse it with dense results, because exact identifiers are a lexical matching problem",
            "Fine-tune the embedding model on the full corpus",
            "Increase the number of retrieved chunks from five to twenty",
            "Instruct the model to ask the user to rephrase the question",
          ],
          answer: 0,
          explanation:
            "Correct: rare exact tokens are exactly where lexical search beats embeddings, and hybrid fusion captures both behaviours. 'Fine-tune the embedding model' is wrong because it is expensive and still weak on rare identifiers. 'Retrieve twenty chunks' is wrong because the right chunk is not in the candidate set at all. 'Ask the user to rephrase' is wrong because it pushes the system's limitation onto the user.",
        },
        {
          prompt:
            "What problem does a cross-encoder reranker solve that a vector search alone does not?",
          options: [
            "It scores each candidate jointly with the query, so it can rank relevance that a single-vector similarity cannot capture",
            "It increases the number of candidates that can be retrieved",
            "It removes the need to store embeddings",
            "It guarantees that the retrieved passages are factually correct",
          ],
          answer: 0,
          explanation:
            "Correct: a bi-encoder compresses the query and the document into independent vectors, whereas a cross-encoder reads them together and resolves fine-grained relevance. 'More candidates' is wrong because the reranker consumes candidates rather than producing them. 'Removes the need for embeddings' is wrong because reranking operates on a shortlist produced by first-stage retrieval. 'Guarantees factual correctness' is wrong because relevance is not truth.",
        },
        {
          prompt:
            "A user asks: 'And what about the deductible in that case?' after three earlier messages. Retrieval returns nothing useful. What is missing?",
          options: [
            "Query rewriting that resolves the conversational references into a standalone question before retrieval",
            "A larger number of retrieved chunks",
            "A longer context window for the generation model",
            "A reranker on the retrieved candidates",
          ],
          answer: 0,
          explanation:
            "Correct: a follow-up question is meaningless on its own, so it must be rewritten into a self-contained query before it hits the index. 'More chunks' is wrong because the query itself carries no searchable content. 'A longer context window' is wrong because the failure occurs before generation. 'A reranker' is wrong because reranking a list of irrelevant candidates produces a well-ordered list of irrelevant candidates.",
        },
        {
          prompt:
            "Evaluation shows the correct passage is retrieved as the twelfth of fifteen chunks, yet the answer ignores it. What is the most effective change?",
          options: [
            "Rerank and keep fewer, better-ordered chunks, placing the strongest evidence at the start or the end of the context",
            "Increase the temperature so the model explores the context more",
            "Retrieve thirty chunks so the correct one is more likely to be included",
            "Instruct the model to read every chunk carefully",
          ],
          answer: 0,
          explanation:
            "Correct: models attend unevenly across a long context, so reducing and ordering the evidence is the reliable remedy for a passage that is present but ignored. 'Increase the temperature' is wrong because sampling randomness does not improve attention over context. 'Retrieve thirty chunks' is wrong because it worsens the dilution that caused the problem. 'Instruct the model to read carefully' is wrong because an instruction does not change how attention distributes.",
        },
        {
          prompt:
            "A broker must not see documents belonging to another agency. Where must this be enforced?",
          options: [
            "As a filter inside the retrieval query, using the caller's entitlements, before any candidate reaches the model",
            "In the system prompt, instructing the model to refuse documents from other agencies",
            "In the user interface, hiding citations the user may not open",
            "In a post-processing step that removes unauthorised content from the answer",
          ],
          answer: 0,
          explanation:
            "Correct: authorisation must be applied at retrieval so unauthorised content never enters the context, because anything in the context can leak into the answer. 'In the system prompt' is wrong because instructions are not an access-control mechanism. 'In the user interface' is wrong because the data has already been exposed to the model and may be paraphrased. 'Post-processing the answer' is wrong because it attempts to unsee information that already influenced generation.",
        },
        {
          prompt:
            "Your index contains both the 2019 and the 2024 version of each policy. Customers receive answers from the outdated version. What is the right design?",
          options: [
            "Store effective dates as metadata and filter or boost by validity at query time, with the version stated in the citation",
            "Delete the 2019 documents from the index",
            "Add 'use the most recent document' to the system prompt",
            "Re-embed the corpus with a newer embedding model",
          ],
          answer: 0,
          explanation:
            "Correct: temporal validity is a metadata and filtering problem, and surfacing the version in the citation lets the user verify it. 'Delete the old versions' is wrong because historical policies are needed to answer about contracts signed then. 'Add an instruction to the prompt' is wrong because the model cannot reliably infer validity from chunk text. 'Re-embed with a newer model' is wrong because recency of the embedding model has nothing to do with recency of the content.",
        },
        {
          prompt:
            "What is the strongest way to make citations trustworthy rather than decorative?",
          options: [
            "Verify after generation that each cited passage actually supports the claim it is attached to, and flag or drop unsupported claims",
            "Ask the model to always include at least three citations",
            "Display the similarity score next to each citation",
            "Show the full retrieved chunk under every answer",
          ],
          answer: 0,
          explanation:
            "Correct: a post-generation attribution check is what distinguishes a verified citation from a plausible-looking reference. 'At least three citations' is wrong because quantity invites irrelevant references. 'Displaying the similarity score' is wrong because retrieval similarity does not prove the passage supports the specific claim. 'Showing the full chunk' helps a motivated reader but does not detect an unsupported claim.",
        },
        {
          prompt:
            "When is agentic retrieval, where the model decides to search again, genuinely justified over single-shot RAG?",
          options: [
            "For multi-hop questions whose required evidence cannot be identified from the initial query alone",
            "Whenever the first retrieval returns a low similarity score",
            "For every question, because more searching always improves grounding",
            "When the corpus is too large to index in one vector store",
          ],
          answer: 0,
          explanation:
            "Correct: iterative retrieval pays for its extra latency and cost when the second query can only be formed after reading the first results, which is the definition of multi-hop. 'Whenever similarity is low' is wrong because low similarity often means the answer simply is not in the corpus. 'For every question' is wrong because it multiplies cost and latency on queries a single retrieval answers. 'Corpus size' is wrong because that is an indexing and sharding concern.",
        },
        {
          prompt:
            "A RAG assistant invents a clause number that does not exist, while all retrieved passages were correct. What does this indicate?",
          options: [
            "A generation-side failure, addressed with stricter grounding instructions, structured citation output and an attribution check",
            "A retrieval failure requiring better chunking",
            "An embedding model that is too small for the corpus",
            "Insufficient context window, requiring a larger model",
          ],
          answer: 0,
          explanation:
            "Correct: when the evidence supplied was correct, the defect lies in how the model used it, so the remedies are grounding constraints and verification of the output. 'A retrieval failure' is wrong because retrieval demonstrably succeeded. 'An embedding model too small' is wrong for the same reason. 'Insufficient context window' is wrong because truncation would have removed evidence rather than invented a reference.",
        },
        {
          prompt:
            "You must choose between sending 30 retrieved chunks to a long-context model and reranking down to 5. What is the decisive argument?",
          options: [
            "Measure both on the evaluation suite: fewer, well-ranked chunks usually match or beat the long context at a fraction of the cost and latency",
            "Always use the long context, because the model should decide what is relevant",
            "Always rerank, because long contexts are never reliable",
            "Choose based on which option uses the newest model version",
          ],
          answer: 0,
          explanation:
            "Correct: this is an empirical trade-off and the evaluation suite decides it, with the common outcome favouring precision because dilution hurts quality as well as cost. 'Always use the long context' is wrong because it delegates relevance to a component that attends unevenly and bills every token. 'Always rerank' is wrong as an absolute, since some synthesis tasks genuinely need breadth. 'The newest model version' is wrong because novelty is not an argument about context strategy.",
        },
      ],
      fr: [
        {
          prompt:
            "Votre corpus est constitué de contrats d'assurance à clauses numérotées. Quelle stratégie de découpage est la plus solide ?",
          options: [
            "Découper selon la structure propre du document, en gardant chaque clause entière avec son titre de section et l'identifiant du document en métadonnées",
            "Des fenêtres fixes de 512 tokens avec 20 % de recouvrement",
            "Un passage par page du PDF source",
            "Un passage par document, en s'appuyant sur une grande fenêtre de contexte",
          ],
          answer: 0,
          explanation:
            "Correct : un découpage conscient de la structure préserve une unité juridiquement signifiante et y attache les métadonnées nécessaires à la citation et au filtrage. « Des fenêtres fixes avec recouvrement » est faux car cela coupe les clauses en deux et duplique du texte. « Un passage par page » est faux car la pagination est un artefact d'impression sans rapport avec le sens. « Un passage par document » est faux car cela noie le contexte de clauses non pertinentes et rend la citation précise impossible.",
        },
        {
          prompt:
            "Les utilisateurs cherchent avec des codes produit internes comme GAV-2019-B. La recherche dense les rate. Quelle est la bonne correction ?",
          options: [
            "Ajouter une recherche lexicale et fusionner ses résultats avec ceux de la recherche dense, car un identifiant exact est un problème d'appariement lexical",
            "Affiner le modèle d'embeddings sur l'ensemble du corpus",
            "Passer de cinq à vingt passages récupérés",
            "Demander au modèle d'inviter l'utilisateur à reformuler sa question",
          ],
          answer: 0,
          explanation:
            "Correct : les tokens exacts et rares sont précisément le terrain où la recherche lexicale bat les embeddings, et la fusion hybride capte les deux comportements. « Affiner le modèle d'embeddings » est faux car c'est coûteux et reste faible sur les identifiants rares. « Vingt passages » est faux car le bon passage n'est pas du tout dans l'ensemble candidat. « Inviter à reformuler » est faux car cela reporte la limite du système sur l'utilisateur.",
        },
        {
          prompt:
            "Quel problème un reranker à encodeur croisé résout-il, que la recherche vectorielle seule ne résout pas ?",
          options: [
            "Il note chaque candidat conjointement avec la requête, et saisit donc une pertinence fine qu'une similarité entre vecteurs uniques ne capte pas",
            "Il augmente le nombre de candidats récupérables",
            "Il supprime le besoin de stocker des embeddings",
            "Il garantit que les passages récupérés sont factuellement exacts",
          ],
          answer: 0,
          explanation:
            "Correct : un bi-encodeur compresse la requête et le document en vecteurs indépendants, alors qu'un encodeur croisé les lit ensemble et tranche la pertinence fine. « Plus de candidats » est faux car le reranker consomme des candidats au lieu d'en produire. « Supprime le besoin d'embeddings » est faux car le reranking s'applique à une liste restreinte issue de la première étape. « Garantit l'exactitude factuelle » est faux car la pertinence n'est pas la vérité.",
        },
        {
          prompt:
            "Un utilisateur demande « Et la franchise dans ce cas ? » après trois messages précédents. La recherche ne renvoie rien d'utile. Que manque-t-il ?",
          options: [
            "Une réécriture de requête qui résout les références conversationnelles en une question autonome avant la recherche",
            "Un plus grand nombre de passages récupérés",
            "Une fenêtre de contexte plus grande pour le modèle de génération",
            "Un reranker sur les candidats récupérés",
          ],
          answer: 0,
          explanation:
            "Correct : une question de relance n'a aucun sens isolée, elle doit être réécrite en requête autonome avant d'atteindre l'index. « Plus de passages » est faux car la requête elle-même ne porte aucun contenu recherchable. « Une fenêtre plus grande » est faux car l'échec survient avant la génération. « Un reranker » est faux car réordonner des candidats non pertinents produit une liste bien ordonnée de candidats non pertinents.",
        },
        {
          prompt:
            "L'évaluation montre que le bon passage est récupéré en douzième position sur quinze, mais la réponse l'ignore. Quel changement est le plus efficace ?",
          options: [
            "Reranker et conserver moins de passages mieux ordonnés, en plaçant la preuve la plus forte au début ou à la fin du contexte",
            "Augmenter la température pour que le modèle explore davantage le contexte",
            "Récupérer trente passages pour que le bon ait plus de chances d'y figurer",
            "Demander au modèle de lire chaque passage attentivement",
          ],
          answer: 0,
          explanation:
            "Correct : les modèles prêtent une attention inégale sur un long contexte, donc réduire et ordonner les preuves est le remède fiable à un passage présent mais ignoré. « Augmenter la température » est faux car l'aléa d'échantillonnage n'améliore pas l'attention sur le contexte. « Trente passages » est faux car cela aggrave la dilution à l'origine du problème. « Demander de lire attentivement » est faux car une consigne ne change pas la répartition de l'attention.",
        },
        {
          prompt:
            "Un courtier ne doit pas voir les documents appartenant à une autre agence. Où cette règle doit-elle être appliquée ?",
          options: [
            "Comme filtre dans la requête de recherche, à partir des droits de l'appelant, avant qu'un seul candidat n'atteigne le modèle",
            "Dans le prompt système, en demandant au modèle de refuser les documents d'autres agences",
            "Dans l'interface, en masquant les citations que l'utilisateur ne peut pas ouvrir",
            "Dans un post-traitement qui retire le contenu non autorisé de la réponse",
          ],
          answer: 0,
          explanation:
            "Correct : l'autorisation doit s'appliquer à la recherche pour qu'aucun contenu non autorisé n'entre dans le contexte, car tout ce qui est dans le contexte peut fuiter dans la réponse. « Dans le prompt système » est faux car une consigne n'est pas un mécanisme de contrôle d'accès. « Dans l'interface » est faux car la donnée a déjà été exposée au modèle et peut être reformulée. « Un post-traitement » est faux car cela tente d'effacer une information qui a déjà influencé la génération.",
        },
        {
          prompt:
            "Votre index contient la version 2019 et la version 2024 de chaque contrat. Les clients reçoivent des réponses issues de la version obsolète. Quelle est la bonne conception ?",
          options: [
            "Stocker les dates d'effet en métadonnées et filtrer ou pondérer par validité au moment de la requête, la version étant indiquée dans la citation",
            "Supprimer les documents de 2019 de l'index",
            "Ajouter « utilise le document le plus récent » au prompt système",
            "Recalculer les embeddings du corpus avec un modèle plus récent",
          ],
          answer: 0,
          explanation:
            "Correct : la validité temporelle est un problème de métadonnées et de filtrage, et afficher la version dans la citation permet à l'utilisateur de vérifier. « Supprimer les anciennes versions » est faux car les contrats historiques sont nécessaires pour répondre sur des polices signées à l'époque. « Ajouter une consigne au prompt » est faux car le modèle ne peut pas déduire la validité de façon fiable depuis le texte du passage. « Recalculer avec un modèle plus récent » est faux car la récence du modèle d'embeddings n'a rien à voir avec celle du contenu.",
        },
        {
          prompt:
            "Quelle est la façon la plus solide de rendre les citations fiables plutôt que décoratives ?",
          options: [
            "Vérifier après génération que chaque passage cité étaye réellement l'affirmation à laquelle il est rattaché, et signaler ou retirer les affirmations non étayées",
            "Demander au modèle d'inclure toujours au moins trois citations",
            "Afficher le score de similarité à côté de chaque citation",
            "Afficher le passage récupéré complet sous chaque réponse",
          ],
          answer: 0,
          explanation:
            "Correct : un contrôle d'attribution après génération est ce qui distingue une citation vérifiée d'une référence d'apparence plausible. « Au moins trois citations » est faux car la quantité invite des références non pertinentes. « Afficher le score de similarité » est faux car la similarité de recherche ne prouve pas que le passage étaye l'affirmation précise. « Afficher le passage complet » aide un lecteur motivé mais ne détecte pas une affirmation non étayée.",
        },
        {
          prompt:
            "Quand la recherche agentique, où le modèle décide de relancer une recherche, est-elle réellement justifiée face à un RAG en une passe ?",
          options: [
            "Pour les questions à sauts multiples dont les preuves nécessaires ne peuvent pas être identifiées depuis la seule requête initiale",
            "Dès que la première recherche renvoie un score de similarité faible",
            "Pour chaque question, car chercher davantage améliore toujours l'ancrage",
            "Quand le corpus est trop volumineux pour être indexé dans une seule base vectorielle",
          ],
          answer: 0,
          explanation:
            "Correct : la recherche itérative justifie sa latence et son coût supplémentaires quand la deuxième requête ne peut être formulée qu'après lecture des premiers résultats, ce qui est la définition du saut multiple. « Dès que la similarité est faible » est faux car une faible similarité signifie souvent que la réponse n'est tout simplement pas dans le corpus. « Pour chaque question » est faux car cela multiplie coût et latence sur des requêtes qu'une seule recherche traite. « La taille du corpus » est faux car c'est une question d'indexation et de partitionnement.",
        },
        {
          prompt:
            "Un assistant RAG invente un numéro de clause inexistant alors que tous les passages récupérés étaient corrects. Qu'est-ce que cela indique ?",
          options: [
            "Une défaillance côté génération, à traiter par des consignes d'ancrage plus strictes, une sortie de citation structurée et un contrôle d'attribution",
            "Une défaillance de recherche appelant un meilleur découpage",
            "Un modèle d'embeddings trop petit pour le corpus",
            "Une fenêtre de contexte insuffisante, nécessitant un modèle plus grand",
          ],
          answer: 0,
          explanation:
            "Correct : lorsque les preuves fournies étaient correctes, le défaut réside dans l'usage qu'en a fait le modèle, donc les remèdes sont les contraintes d'ancrage et la vérification de la sortie. « Une défaillance de recherche » est faux car la recherche a manifestement réussi. « Un modèle d'embeddings trop petit » est faux pour la même raison. « Une fenêtre insuffisante » est faux car une troncature aurait supprimé des preuves plutôt qu'inventé une référence.",
        },
        {
          prompt:
            "Vous devez choisir entre envoyer 30 passages récupérés à un modèle à long contexte et reranker jusqu'à 5. Quel est l'argument décisif ?",
          options: [
            "Mesurer les deux sur la suite d'évaluation : moins de passages bien classés égalent ou dépassent généralement le long contexte, pour une fraction du coût et de la latence",
            "Toujours utiliser le long contexte, car c'est au modèle de décider ce qui est pertinent",
            "Toujours reranker, car les longs contextes ne sont jamais fiables",
            "Choisir selon l'option qui utilise la version de modèle la plus récente",
          ],
          answer: 0,
          explanation:
            "Correct : c'est un arbitrage empirique que la suite d'évaluation tranche, avec un résultat fréquent en faveur de la précision car la dilution dégrade la qualité autant que le coût. « Toujours le long contexte » est faux car cela délègue la pertinence à un composant dont l'attention est inégale et qui facture chaque token. « Toujours reranker » est faux comme absolu, puisque certaines tâches de synthèse ont réellement besoin d'étendue. « La version de modèle la plus récente » est faux car la nouveauté n'est pas un argument sur la stratégie de contexte.",
        },
      ],
    },
  },
  "Migration 07 — deepen rag-grounding"
);

