# Plan d'application — Plateforme d'apprentissage DevEx / GenAI / Agentic

> Ce document extrait la section « Application plan » de l'application actuelle (`app.js`) et l'enrichit
> pour servir de feuille de route concrète : transformer le site statique existant en une véritable
> application de formation, multi-utilisateurs et évolutive.

---

## 1. Vision et objectifs

Faire évoluer l'actuel site statique de préparation aux entretiens (Principal Software Engineer —
GenAI, systèmes agentiques, DevEx, excellence en ingénierie) vers une plateforme de formation complète :

- **Pour les apprenants** : parcours personnalisés, quiz exigeants, suivi de progression durable
  (multi-appareils), score de préparation aux entretiens et recommandations adaptatives.
- **Pour les auteurs de contenu** : gestion de contenu versionnée, revue de fraîcheur des ressources,
  publication sans redéploiement du code.
- **Pour les mentors / évaluateurs** : workflows de revue par grilles (rubrics), feedback sur les
  livrables et les capstones.

### Critères de succès

- Progression persistée côté serveur et synchronisée entre appareils (fin de la dépendance exclusive à `localStorage`).
- Contenu (modules, quiz, ressources) modifiable sans toucher au code applicatif.
- Évaluations qui testent le raisonnement (scénarios, grilles) et pas seulement la mémorisation.
- Mesure du succès par la préparation réelle aux entretiens et la qualité des décisions.

---

## 2. Périmètre produit

*(extrait du plan d'origine, enrichi)*

- Parcours structurés pour la GenAI, les systèmes d'agents, la DevEx, l'excellence en ingénierie et les entretiens.
- Curation de ressources avec métadonnées de fraîcheur, niveau de preuve et revue périodique.
- Quiz difficiles, notation par scénarios et évaluations capstone.
- Suivi de progression, recommandations et score de préparation aux entretiens.
- **Ajouts** :
  - Piste « Copilot Academy » à niveaux progressifs (déjà présente) intégrée au même moteur de parcours.
  - Comptes utilisateurs avec historique des tentatives et instantanés de préparation.
  - Internationalisation complète (EN / FR déjà en place, extensible à d'autres langues).
  - Mode hors-ligne dégradé (PWA) pour continuer à réviser sans connexion.

---

## 3. Capacités clés

*(extrait du plan d'origine, enrichi)*

| Capacité | Description | Priorité |
| --- | --- | --- |
| Moteur de parcours | Curricula par rôle, prérequis entre modules, déverrouillage par score (≥ 80 %) | P0 |
| Moteur d'évaluation | Notation objective (QCM) + notation par grille (rubrics) avec workflow de revue | P0 |
| Gestion de contenu | Ingestion de docs officielles, rapports, livres ; définitions versionnées | P1 |
| Comptes et progression | Authentification, historique des tentatives, export/import, RGPD | P1 |
| Tableau de bord analytique | Confiance, progression, signaux faibles, temps passé par module | P2 |
| Couche IA optionnelle | Interviewer simulé, assistant de feedback, recommandations adaptatives | P3 |

---

## 4. Architecture cible

*(extrait du plan d'origine : « frontend statique d'abord, puis application componentisée si la croissance le justifie »)*

### 4.1 Vue d'ensemble

```
[ Frontend SPA/PWA ] ⇄ [ API REST/JSON ] ⇄ [ Services métier ] ⇄ [ Base de données ]
        │                        │                    │
   (i18n EN/FR)          (auth JWT/OIDC)      (moteur de parcours,
   (cache hors-ligne)                          moteur d'évaluation,
                                               couche IA optionnelle)
```

### 4.2 Frontend

- **Étape 1 (existant)** : UI statique sans dépendances (`index.html`, `app.js`, `styles.css`).
- **Étape 2** : application componentisée (framework moderne type React/Vue/Svelte + Vite),
  en conservant le design sombre et responsive actuel.
- Découpage en composants : parcours, module, quiz, académie, tableau de bord, plan.
- PWA : manifest + service worker pour le cache du contenu et le mode hors-ligne.

### 4.3 Couche de contenu

- Définitions de modules en **JSON versionné** dans un dépôt Git (source de vérité), puis
  éventuellement un CMS headless si le volume d'auteurs le justifie.
- Schéma validé en CI (JSON Schema) : tout contenu invalide bloque la publication.
- Pipeline de publication : PR → validation → déploiement du contenu indépendamment du code.

### 4.4 Services backend

- **API** : REST/JSON (Node.js/TypeScript ou équivalent), stateless, documentée via OpenAPI.
- **Service d'évaluation** : notation des quiz côté serveur (les réponses correctes ne sont plus
  exposées dans le bundle client), workflows de grilles, revue des soumissions.
- **Service de progression** : événements de progression, tentatives, instantanés de préparation.
- **Couche IA optionnelle** (Phase 3+) : interviewer simulé, assistant de feedback et
  recommandations d'étude adaptatives — derrière une API interne avec garde-fous
  (budgets de coûts, évaluations de qualité, journalisation).

### 4.5 Authentification et sécurité

- OIDC (ex. GitHub/Google) plutôt qu'une gestion de mots de passe maison.
- Autorisation par rôles : apprenant, auteur, mentor, administrateur.
- Bonnes pratiques : HTTPS partout, en-têtes de sécurité, protection CSRF, validation des entrées,
  secrets hors du code, dépendances auditées en CI.

---

## 5. Modèle de données

*(extrait du plan d'origine, précisé)*

Entités principales :

- **Track** (parcours) : id, titre, rôle cible, langue(s), modules ordonnés.
- **Module** : id, semaines, objectif, résultats attendus, livrables, prérequis.
- **Lesson / Resource** : nom, URL, type (doc officielle, rapport, livre, vidéo),
  date de fraîcheur, étiquettes, niveau de preuve.
- **Quiz / Question** : énoncé, options, réponse, explication, difficulté, module lié.
- **RubricDimension / Capstone** : dimensions de notation, seuils de réussite.
- **User** : identité, rôles, préférences (langue), consentement RGPD.
- **ProgressEvent** : utilisateur, module/quiz, score, horodatage, durée.
- **AssessmentAttempt** : tentative, réponses, score, feedback.
- **ReadinessSnapshot** : instantané de préparation lié à un rôle cible.

Choix de stockage : base relationnelle (PostgreSQL) pour la progression et les utilisateurs ;
contenu pédagogique en JSON versionné (lecture seule côté API).

Migration : l'export JSON actuel (`localStorage`) devient le format d'**import** de la Phase 2,
pour que les utilisateurs existants conservent leur progression.

---

## 6. Feuille de route

*(extrait du plan d'origine, détaillé en jalons livrables)*

### Phase 1 — MVP statique consolidé (existant, à finaliser)

- [x] Contenu organisé (10 modules, 20 semaines, EN/FR), quiz, Copilot Academy, évaluation globale.
- [x] Progression locale avec export / import / réinitialisation.
- [x] CI de validation (`node --check app.js`) et déploiement GitHub Pages.
- [x] Extraire le contenu de `app.js` vers des fichiers JSON dédiés (préparation de la couche de contenu).
- [x] Ajouter des tests automatisés de base (validation du schéma de contenu, tests de rendu).

### Phase 2 — Contenu hébergé, comptes et historique

- [ ] API backend + base de données (progression, tentatives, utilisateurs).
- [ ] Authentification OIDC et synchronisation multi-appareils.
- [ ] Import de la progression existante depuis l'export local.
- [ ] Espace auteur : édition de contenu validée par schéma, publication sans redéploiement.
- [ ] Notation des quiz côté serveur.

### Phase 3 — Adaptativité et analytique

- [ ] Recommandations adaptatives fondées sur les signaux faibles (scores, temps, récence).
- [ ] Entretiens simulés (interviewer IA) avec grilles de feedback.
- [ ] Tableau de bord analytique : confiance, progression, zones à risque.

### Phase 4 — Collaboration et mentorat

- [ ] Revues collaboratives des livrables et capstones.
- [ ] Workflows de mentorat : assignation, feedback par grille, suivi.
- [ ] Cohortes / groupes d'étude et comparaison anonymisée.

---

## 7. Qualité, exploitation et gouvernance

*(extrait du plan d'origine « Niveau d'exigence », étendu)*

### Contenu

- Privilégier les sources officielles ou primaires autant que possible.
- Réviser les ressources chaque trimestre (obsolescence, liens cassés — vérification automatisée en CI).
- Utiliser des évaluations qui testent le raisonnement, pas seulement la mémorisation.

### Ingénierie

- Tests automatisés : unitaires (moteurs de parcours/évaluation), intégration (API), e2e (parcours critiques).
- CI/CD : lint, tests, validation de schéma de contenu, analyse de sécurité, déploiement progressif.
- Observabilité : journaux structurés, métriques (disponibilité, latence, erreurs), alertes.
- Accessibilité (WCAG AA) et performance (budget de taille de bundle, Core Web Vitals).

### Produit

- Mesurer le succès par la préparation aux entretiens et la qualité réelle des décisions.
- Boucle de feedback utilisateur intégrée (signalement de question ambiguë ou de ressource obsolète).
- Respect de la vie privée : minimisation des données, export/suppression du compte (RGPD).

---

## 8. Risques et arbitrages

| Risque | Impact | Mitigation |
| --- | --- | --- |
| Sur-ingénierie précoce du backend | Retard, complexité inutile | Conserver l'approche « statique d'abord » ; ne passer en Phase 2 que sur signal d'usage réel |
| Obsolescence rapide du contenu GenAI | Perte de crédibilité | Métadonnées de fraîcheur + revue trimestrielle + vérification de liens en CI |
| Coûts de la couche IA | Dérive budgétaire | Couche IA strictement optionnelle, budgets et quotas, évaluation coût/valeur par fonctionnalité |
| Réponses de quiz exposées côté client | Triche, dévalorisation des scores | Notation côté serveur dès la Phase 2 |
| Migration de la progression locale | Perte de données utilisateurs | Import de l'export JSON existant, testé avant la bascule |
