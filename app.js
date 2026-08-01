const engine = typeof LearningEngine !== "undefined" ? LearningEngine : null;

let plans = null;
let academies = null;
let academySettings = { passThreshold: 80 };

// ---------------------------------------------------------------------------
// Server mode (plan.md Phase 2): when the app is hosted by server/server.js,
// content is loaded sanitized from the API (no answers in the client) and
// quizzes are scored server-side. On static hosting (GitHub Pages) the app
// keeps working entirely locally, exactly as before.
// ---------------------------------------------------------------------------

const server = {
  available: false,
  account: null,
  token: null,
  lastSyncAt: null,
  syncError: false
};

const sessionStorageKey = "principal-learning-path-session";

const loadSession = () => {
  try {
    const stored = JSON.parse(localStorage.getItem(sessionStorageKey)) || null;
    if (stored && typeof stored.token === "string" && stored.account) return stored;
  } catch (error) {
    // fall through
  }
  return null;
};

const saveSession = () => {
  try {
    if (server.token) {
      localStorage.setItem(sessionStorageKey, JSON.stringify({ token: server.token, account: server.account }));
    } else {
      localStorage.removeItem(sessionStorageKey);
    }
  } catch (error) {
    // Ignore storage failures.
  }
};

const apiFetch = async (path, { method = "GET", body, auth = true } = {}) => {
  const headers = {};
  if (auth && server.token) headers.Authorization = ["Bearer", server.token].join(" ");
  if (body !== undefined) headers["Content-Type"] = "application/json";
  const response = await fetch(`api/${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined
  });
  let payload = null;
  try {
    payload = await response.json();
  } catch (error) {
    payload = null;
  }
  return { ok: response.ok, status: response.status, payload };
};

const detectServer = async () => {
  try {
    const { ok, payload } = await apiFetch("health", { auth: false });
    server.available = Boolean(ok && payload && payload.ok);
  } catch (error) {
    server.available = false;
  }
};

const restoreSession = async () => {
  if (!server.available) return;
  const stored = loadSession();
  if (!stored) return;
  server.token = stored.token;
  server.account = stored.account;
  const { ok, payload } = await apiFetch("me");
  if (ok && payload.account) {
    server.account = payload.account;
    saveSession();
  } else {
    server.token = null;
    server.account = null;
    saveSession();
  }
};

const fetchJson = async (path) => {
  const base = server.available ? "api/content" : "./data";
  const response = await fetch(`${base}/${path}`);
  if (!response.ok) throw new Error(`Failed to load ${path}: ${response.status}`);
  return response.json();
};

const loadContent = async () => {
  const [planEn, planFr, academyEn, academyFr, settings] = await Promise.all([
    fetchJson("plan.en.json"),
    fetchJson("plan.fr.json"),
    fetchJson("academy.en.json"),
    fetchJson("academy.fr.json"),
    fetchJson("academy-settings.json")
  ]);
  plans = { en: planEn, fr: planFr };
  academies = { en: academyEn, fr: academyFr };
  academySettings = settings;
};

const ui = {
  en: {
    pageTitle: "Principal Engineer Learning Path",
    contentLoadError:
      "Unable to load the learning content. Please refresh the page or try again later.",
    metaDescription:
      "A 20-week learning path with curated resources, hard quizzes, and a final assessment for Principal Software Engineer roles focused on DevEx, engineering excellence, GenAI, and agentic AI.",
    heroEyebrow: "Principal interview preparation system",
    heroTitle: "Learning Path for DevEx, Engineering Excellence, GenAI, and Agentic AI",
    heroSummary:
      "A complete 20-week plan with current resources, hard assessments, and a final readiness review for Principal Software Engineer roles centered on Developer Experience, Engineering Excellence, and AI-powered development.",
    goalsTitle: "Target outcomes",
    curriculumEyebrow: "Curriculum",
    curriculumTitle: "Learning path",
    curriculumCopy: "Each module combines study, implementation, and a difficult checkpoint quiz.",
    assessmentEyebrow: "Final validation",
    assessmentTitle: "Global assessment",
    assessmentCopy: "Use this as the final Principal-level readiness gate before interviews.",
    planEyebrow: "Product direction",
    planTitle: "Application plan",
    planCopy: "A practical blueprint for evolving this content into a broader learning product.",
    footerNote:
      "Progress is stored locally in your browser. Use the export and import tools to move it between devices.",
    footerLink: "View source on GitHub",
    statTargetRole: "Target role",
    statDuration: "Duration",
    statModuleCompletion: "Module completion",
    statAverageScore: "Average quiz score",
    statReadinessTarget: "Readiness target",
    exportProgress: "Export progress",
    importProgress: "Import progress",
    resetProgress: "Reset progress",
    quizQuestionsPill: (count) => `${count} hard quiz questions`,
    deliverablesPill: (count) => `${count} deliverables`,
    outcomesHeading: "Outcomes",
    deliverablesHeading: "Deliverables",
    resourcesHeading: "Resources",
    scoreQuiz: "Score quiz",
    markComplete: "Mark module deliverables complete",
    latestScore: (score) => `Latest score: ${score}%`,
    notScored: "Not scored yet",
    scoreLabel: "Score:",
    correct: "Correct",
    reviewNeeded: "Review needed",
    resetConfirm: "Reset all quiz scores and completion status?",
    importError: "Could not import progress: the file is not a valid progress export.",
    languageSwitcherLabel: "Language",
    academyEyebrow: "Copilot Academy",
    academyTitle: "GitHub Copilot mastery quizzes",
    academyCopy:
      "Progressive quizzes built from the AxaFrance learning-path-copilot handbook. Pass each level to unlock the next.",
    academySiteLink: "Open the handbook",
    academyRepoLink: "Source repository (AxaFrance)",
    academyLevelPill: (position, total) => `Level ${position} / ${total}`,
    academyQuestionsPill: (count) => `${count} questions`,
    academyPassPill: (threshold) => `Pass mark: ${threshold}%`,
    academyModulesHeading: "Handbook modules covered",
    academyLockedBadge: "🔒 Locked",
    academyPassedBadge: "✓ Passed",
    academyUnlockedBadge: "Unlocked",
    academyLockedNote: (rank, threshold) =>
      `Locked — score at least ${threshold}% on the ${rank} level to unlock this quiz.`,
    academyBestScore: (score) => `Best score: ${score}%`,
    academyNotAttempted: "Not attempted yet",
    academyPassMessage: "Level passed! The next level is unlocked.",
    academyFinalPassMessage: "All levels passed — you are a Copilot Master! 🏆",
    academyFailMessage: (threshold) =>
      `Below the ${threshold}% pass mark — review the resources and retry.`,
    statAcademy: "Copilot Academy levels",
    dashboardEyebrow: "Analytics",
    dashboardTitle: "Readiness dashboard",
    dashboardCopy:
      "Interview readiness score, weak-signal recommendations, and mock interviews with rubric feedback.",
    readinessHeading: "Interview readiness",
    compModules: "Deliverables completed",
    compQuizzes: "Quiz mastery",
    compAcademy: "Copilot Academy",
    compInterviews: "Mock interviews",
    riskZonesHeading: "Risk zones",
    noRiskZones: "No risk zones — keep it up!",
    riskUnattempted: "quiz not attempted",
    riskBelow: (score) => `scored ${score}%`,
    riskStale: "needs a refresh",
    riskAcademyNotPassed: "level not passed",
    riskInterviewNever: "no mock interview yet",
    riskInterviewStale: "last mock interview is getting old",
    recommendationsHeading: "Recommended next steps",
    recUnattempted: "Take this quiz for the first time",
    recBelow: (score) => `Raise your ${score}% above the pass mark`,
    recStale: (days) => `Refresh it — last attempt ${days} days ago`,
    recDeliverables: "Finish and check off the deliverables",
    recAcademy: "Pass the next Copilot Academy level",
    recInterview: "Run a mock interview to benchmark yourself",
    recGo: "Go",
    interviewHeading: "Mock interview",
    interviewIntro:
      "A timed-feeling rehearsal: hard questions sampled across every module, scored with a rubric. The optional AI interviewer described in the plan can plug in later; this simulator is fully deterministic.",
    startInterview: (count) => `Start a ${count}-question mock interview`,
    interviewSubmit: "Submit interview",
    interviewCancel: "Cancel",
    interviewUnanswered: "Answer all questions before submitting.",
    rubricHeading: "Rubric feedback",
    interviewBreakdownHeading: "Per-module breakdown",
    interviewHistoryHeading: "Readiness snapshots",
    dimAccuracy: "Accuracy",
    dimBreadth: "Breadth",
    dimConsistency: "Consistency",
    dimMastery: "Mastery",
    dimCorrectness: "Correctness",
    dimDepth: "Depth",
    dimTradeoffs: "Trade-offs",
    dimCommunication: "Communication",
    accountEyebrow: "Server mode",
    accountTitle: "Account & sync",
    accountCopy: "Progress is scored server-side and synchronized across devices while you are signed in.",
    authIntroSignedOut:
      "Create an account to sync progress across devices, or sign in with your account ID and sync key. No password and no email: keep the generated sync key safe.",
    createAccountHeading: "Create account",
    displayNamePlaceholder: "Display name",
    createAccountButton: "Create account & get sync key",
    accountCreateError: "Could not create the account. Try again later.",
    syncKeyNotice: "Store this sync key somewhere safe — it is shown only once:",
    accountIdLabel: "Account ID",
    copyKey: "Copy",
    signInHeading: "Sign in",
    accountIdPlaceholder: "Account ID (acct-…)",
    syncKeyPlaceholder: "Sync key",
    signInButton: "Sign in",
    signInError: "Sign-in failed — check the account ID and sync key.",
    signedInAs: (name, role) => `Signed in as ${name} — role: ${role}`,
    serverScoringNote: "Quizzes are scored server-side; correct answers never reach the browser.",
    syncNow: "Sync now",
    signOut: "Sign out",
    deleteAccount: "Delete server account",
    deleteAccountConfirm: "Delete your server account and all synced data? This cannot be undone.",
    lastSync: (time) => `Last sync: ${time}`,
    syncFailed: "Sync failed — changes are kept locally and retried on the next sync.",
    notSignedIn: "Sign in from the Account & sync panel to use this section.",
    communityEyebrow: "Collaboration",
    communityTitle: "Deliverables, mentoring & cohorts",
    communityCopy:
      "Submit deliverables for rubric review, mentor other learners, and compare anonymously with your cohort.",
    submitHeading: "Submit a deliverable for review",
    moduleSelectLabel: "Module",
    deliverablePlaceholder: "Describe the deliverable: what you built and where the evidence lives.",
    urlPlaceholder: "https:// link to the evidence (optional)",
    submitButton: "Submit for review",
    submissionError: "Could not submit — describe the deliverable and pick a module.",
    submissionsHeading: "My submissions",
    noSubmissions: "No submissions yet.",
    statusPending: "Pending review",
    statusReviewed: "Reviewed",
    reviewScore: (score) => `Rubric score: ${score}%`,
    reviewPassed: "Passed",
    reviewFailed: "Needs work",
    feedbackLabel: "Feedback",
    mentorQueueHeading: "Mentor review queue",
    noPending: "No submissions waiting for review.",
    reviewButton: "Send review",
    feedbackPlaceholder: "Feedback for the learner",
    cohortsHeading: "Cohorts",
    joinCodePlaceholder: "Join code",
    joinButton: "Join cohort",
    cohortNamePlaceholder: "New cohort name",
    createCohortButton: "Create cohort",
    cohortMembers: (count) => `${count} member(s)`,
    cohortJoinCode: (code) => `Join code: ${code}`,
    viewStats: "Compare anonymously",
    cohortAvg: (score) => `Cohort average readiness: ${score}%`,
    cohortYou: (score) => `Your readiness: ${score}%`,
    cohortDistribution: "Readiness distribution",
    cohortError: "Cohort action failed.",
    authorEyebrow: "Authoring",
    authorTitle: "Content studio",
    authorCopy: "Edit the versioned content, validate it against the schema, and publish without redeploying.",
    authorFileLabel: "Content file",
    authorLoad: "Load",
    authorPublish: "Validate & publish",
    authorPublished: (file) => `Published ${file} — live immediately, no redeploy needed.`,
    authorErrors: "Validation errors:",
    authorInvalidJson: "The editor content is not valid JSON.",
    authorLoadError: "Could not load the content file."
  },
  fr: {
    pageTitle: "Parcours d'apprentissage Ingénieur Principal",
    contentLoadError:
      "Impossible de charger le contenu pédagogique. Veuillez actualiser la page ou réessayer plus tard.",
    metaDescription:
      "Un parcours d'apprentissage de 20 semaines avec des ressources organisées, des quiz difficiles et une évaluation finale pour les postes d'ingénieur logiciel principal axés sur la DevEx, l'excellence en ingénierie, la GenAI et l'IA agentique.",
    heroEyebrow: "Système de préparation aux entretiens Principal",
    heroTitle: "Parcours d'apprentissage DevEx, excellence en ingénierie, GenAI et IA agentique",
    heroSummary:
      "Un plan complet de 20 semaines avec des ressources à jour, des évaluations exigeantes et une revue finale de préparation pour les postes d'ingénieur logiciel principal centrés sur la Developer Experience, l'excellence en ingénierie et le développement propulsé par l'IA.",
    goalsTitle: "Résultats visés",
    curriculumEyebrow: "Programme",
    curriculumTitle: "Parcours d'apprentissage",
    curriculumCopy: "Chaque module combine étude, mise en pratique et un quiz de contrôle difficile.",
    assessmentEyebrow: "Validation finale",
    assessmentTitle: "Évaluation globale",
    assessmentCopy: "Utilisez ceci comme dernier jalon de préparation de niveau Principal avant les entretiens.",
    planEyebrow: "Direction produit",
    planTitle: "Plan d'application",
    planCopy: "Un plan pratique pour faire évoluer ce contenu vers un produit d'apprentissage plus large.",
    footerNote:
      "La progression est stockée localement dans votre navigateur. Utilisez les outils d'export et d'import pour la transférer entre appareils.",
    footerLink: "Voir le code source sur GitHub",
    statTargetRole: "Poste visé",
    statDuration: "Durée",
    statModuleCompletion: "Modules terminés",
    statAverageScore: "Score moyen aux quiz",
    statReadinessTarget: "Objectif de préparation",
    exportProgress: "Exporter la progression",
    importProgress: "Importer la progression",
    resetProgress: "Réinitialiser la progression",
    quizQuestionsPill: (count) => `${count} questions de quiz difficiles`,
    deliverablesPill: (count) => `${count} livrables`,
    outcomesHeading: "Résultats",
    deliverablesHeading: "Livrables",
    resourcesHeading: "Ressources",
    scoreQuiz: "Noter le quiz",
    markComplete: "Marquer les livrables du module comme terminés",
    latestScore: (score) => `Dernier score : ${score}%`,
    notScored: "Pas encore noté",
    scoreLabel: "Score :",
    correct: "Correct",
    reviewNeeded: "À revoir",
    resetConfirm: "Réinitialiser tous les scores de quiz et les statuts de complétion ?",
    importError: "Impossible d'importer la progression : le fichier n'est pas un export de progression valide.",
    languageSwitcherLabel: "Langue",
    academyEyebrow: "Académie Copilot",
    academyTitle: "Quiz de maîtrise GitHub Copilot",
    academyCopy:
      "Des quiz progressifs construits à partir du handbook learning-path-copilot d'AXA France. Réussissez chaque niveau pour déverrouiller le suivant.",
    academySiteLink: "Ouvrir le handbook",
    academyRepoLink: "Dépôt source (AXA France)",
    academyLevelPill: (position, total) => `Niveau ${position} / ${total}`,
    academyQuestionsPill: (count) => `${count} questions`,
    academyPassPill: (threshold) => `Seuil de réussite : ${threshold}%`,
    academyModulesHeading: "Modules du handbook couverts",
    academyLockedBadge: "🔒 Verrouillé",
    academyPassedBadge: "✓ Réussi",
    academyUnlockedBadge: "Déverrouillé",
    academyLockedNote: (rank, threshold) =>
      `Verrouillé — obtenez au moins ${threshold}% au niveau ${rank} pour déverrouiller ce quiz.`,
    academyBestScore: (score) => `Meilleur score : ${score}%`,
    academyNotAttempted: "Pas encore tenté",
    academyPassMessage: "Niveau réussi ! Le niveau suivant est déverrouillé.",
    academyFinalPassMessage: "Tous les niveaux réussis — vous êtes un Maître Copilot ! 🏆",
    academyFailMessage: (threshold) =>
      `Sous le seuil de ${threshold}% — révisez les ressources et réessayez.`,
    statAcademy: "Niveaux de l'Académie Copilot",
    dashboardEyebrow: "Analytique",
    dashboardTitle: "Tableau de bord de préparation",
    dashboardCopy:
      "Score de préparation aux entretiens, recommandations fondées sur les signaux faibles et entretiens simulés avec grille de feedback.",
    readinessHeading: "Préparation aux entretiens",
    compModules: "Livrables terminés",
    compQuizzes: "Maîtrise des quiz",
    compAcademy: "Académie Copilot",
    compInterviews: "Entretiens simulés",
    riskZonesHeading: "Zones à risque",
    noRiskZones: "Aucune zone à risque — continuez !",
    riskUnattempted: "quiz non tenté",
    riskBelow: (score) => `score de ${score}%`,
    riskStale: "à rafraîchir",
    riskAcademyNotPassed: "niveau non réussi",
    riskInterviewNever: "aucun entretien simulé",
    riskInterviewStale: "dernier entretien simulé ancien",
    recommendationsHeading: "Prochaines étapes recommandées",
    recUnattempted: "Tentez ce quiz une première fois",
    recBelow: (score) => `Faites passer vos ${score}% au-dessus du seuil`,
    recStale: (days) => `Rafraîchissez — dernière tentative il y a ${days} jours`,
    recDeliverables: "Terminez et cochez les livrables",
    recAcademy: "Réussissez le prochain niveau de l'Académie Copilot",
    recInterview: "Lancez un entretien simulé pour vous évaluer",
    recGo: "Aller",
    interviewHeading: "Entretien simulé",
    interviewIntro:
      "Une répétition réaliste : des questions difficiles échantillonnées dans tous les modules, notées avec une grille. L'interviewer IA optionnel décrit dans le plan pourra s'y brancher ; ce simulateur est entièrement déterministe.",
    startInterview: (count) => `Démarrer un entretien simulé de ${count} questions`,
    interviewSubmit: "Soumettre l'entretien",
    interviewCancel: "Annuler",
    interviewUnanswered: "Répondez à toutes les questions avant de soumettre.",
    rubricHeading: "Feedback par grille",
    interviewBreakdownHeading: "Détail par module",
    interviewHistoryHeading: "Instantanés de préparation",
    dimAccuracy: "Exactitude",
    dimBreadth: "Étendue",
    dimConsistency: "Régularité",
    dimMastery: "Maîtrise",
    dimCorrectness: "Justesse",
    dimDepth: "Profondeur",
    dimTradeoffs: "Arbitrages",
    dimCommunication: "Communication",
    accountEyebrow: "Mode serveur",
    accountTitle: "Compte et synchronisation",
    accountCopy:
      "La progression est notée côté serveur et synchronisée entre appareils lorsque vous êtes connecté.",
    authIntroSignedOut:
      "Créez un compte pour synchroniser la progression entre appareils, ou connectez-vous avec votre identifiant et votre clé de synchronisation. Ni mot de passe ni e-mail : conservez précieusement la clé générée.",
    createAccountHeading: "Créer un compte",
    displayNamePlaceholder: "Nom affiché",
    createAccountButton: "Créer le compte et obtenir la clé",
    accountCreateError: "Impossible de créer le compte. Réessayez plus tard.",
    syncKeyNotice: "Conservez cette clé de synchronisation en lieu sûr — elle n'est affichée qu'une seule fois :",
    accountIdLabel: "Identifiant du compte",
    copyKey: "Copier",
    signInHeading: "Se connecter",
    accountIdPlaceholder: "Identifiant (acct-…)",
    syncKeyPlaceholder: "Clé de synchronisation",
    signInButton: "Se connecter",
    signInError: "Connexion impossible — vérifiez l'identifiant et la clé.",
    signedInAs: (name, role) => `Connecté en tant que ${name} — rôle : ${role}`,
    serverScoringNote: "Les quiz sont notés côté serveur ; les bonnes réponses n'atteignent jamais le navigateur.",
    syncNow: "Synchroniser",
    signOut: "Se déconnecter",
    deleteAccount: "Supprimer le compte serveur",
    deleteAccountConfirm:
      "Supprimer votre compte serveur et toutes les données synchronisées ? Cette action est irréversible.",
    lastSync: (time) => `Dernière synchronisation : ${time}`,
    syncFailed: "Échec de synchronisation — les changements restent locaux et seront retentés.",
    notSignedIn: "Connectez-vous depuis le panneau Compte et synchronisation pour utiliser cette section.",
    communityEyebrow: "Collaboration",
    communityTitle: "Livrables, mentorat et cohortes",
    communityCopy:
      "Soumettez vos livrables pour une revue par grille, mentorez d'autres apprenants et comparez-vous anonymement à votre cohorte.",
    submitHeading: "Soumettre un livrable pour revue",
    moduleSelectLabel: "Module",
    deliverablePlaceholder: "Décrivez le livrable : ce que vous avez construit et où se trouvent les preuves.",
    urlPlaceholder: "Lien https:// vers les preuves (facultatif)",
    submitButton: "Soumettre pour revue",
    submissionError: "Soumission impossible — décrivez le livrable et choisissez un module.",
    submissionsHeading: "Mes soumissions",
    noSubmissions: "Aucune soumission pour le moment.",
    statusPending: "En attente de revue",
    statusReviewed: "Revue effectuée",
    reviewScore: (score) => `Score de grille : ${score}%`,
    reviewPassed: "Validé",
    reviewFailed: "À retravailler",
    feedbackLabel: "Feedback",
    mentorQueueHeading: "File de revue mentor",
    noPending: "Aucune soumission en attente de revue.",
    reviewButton: "Envoyer la revue",
    feedbackPlaceholder: "Feedback pour l'apprenant",
    cohortsHeading: "Cohortes",
    joinCodePlaceholder: "Code d'accès",
    joinButton: "Rejoindre la cohorte",
    cohortNamePlaceholder: "Nom de la nouvelle cohorte",
    createCohortButton: "Créer une cohorte",
    cohortMembers: (count) => `${count} membre(s)`,
    cohortJoinCode: (code) => `Code d'accès : ${code}`,
    viewStats: "Comparer anonymement",
    cohortAvg: (score) => `Préparation moyenne de la cohorte : ${score}%`,
    cohortYou: (score) => `Votre préparation : ${score}%`,
    cohortDistribution: "Distribution de la préparation",
    cohortError: "L'action sur la cohorte a échoué.",
    authorEyebrow: "Rédaction",
    authorTitle: "Studio de contenu",
    authorCopy:
      "Modifiez le contenu versionné, validez-le contre le schéma et publiez sans redéploiement.",
    authorFileLabel: "Fichier de contenu",
    authorLoad: "Charger",
    authorPublish: "Valider et publier",
    authorPublished: (file) => `${file} publié — en ligne immédiatement, sans redéploiement.`,
    authorErrors: "Erreurs de validation :",
    authorInvalidJson: "Le contenu de l'éditeur n'est pas du JSON valide.",
    authorLoadError: "Impossible de charger le fichier de contenu."
  }
};

const storageKey = "principal-learning-path-state";
const languageStorageKey = "principal-learning-path-language";

const loadState = () => {
  try {
    return engine.normalizeState(JSON.parse(localStorage.getItem(storageKey)) || {});
  } catch (error) {
    return engine.normalizeState({});
  }
};

let syncTimer = null;

const scheduleSync = () => {
  if (!server.available || !server.token) return;
  clearTimeout(syncTimer);
  syncTimer = setTimeout(() => {
    pushProgress().then(() => renderAccount());
  }, 1500);
};

const saveState = (nextState) => {
  if (nextState) state = nextState;
  localStorage.setItem(storageKey, JSON.stringify(state));
  scheduleSync();
};

let state = loadState();

// Pulls the server copy, merges it with the local one (best score wins,
// completion flags OR together), stores the merge locally and pushes it back.
const syncProgress = async () => {
  if (!server.available || !server.token) return false;
  try {
    const remote = await apiFetch("progress");
    if (!remote.ok) throw new Error("pull failed");
    state = engine.mergeProgress(state, remote.payload.state);
    localStorage.setItem(storageKey, JSON.stringify(state));
    const pushed = await apiFetch("progress", { method: "PUT", body: { state } });
    if (!pushed.ok) throw new Error("push failed");
    state = engine.normalizeState(pushed.payload.state);
    localStorage.setItem(storageKey, JSON.stringify(state));
    server.lastSyncAt = new Date().toISOString();
    server.syncError = false;
    return true;
  } catch (error) {
    server.syncError = true;
    return false;
  }
};

const pushProgress = async () => {
  if (!server.available || !server.token) return false;
  try {
    const pushed = await apiFetch("progress", { method: "PUT", body: { state } });
    if (!pushed.ok) throw new Error("push failed");
    state = engine.normalizeState(pushed.payload.state);
    localStorage.setItem(storageKey, JSON.stringify(state));
    server.lastSyncAt = new Date().toISOString();
    server.syncError = false;
    return true;
  } catch (error) {
    server.syncError = true;
    return false;
  }
};

const loadLanguage = () => {
  try {
    const stored = localStorage.getItem(languageStorageKey);
    return stored === "fr" || stored === "en" ? stored : "en";
  } catch (error) {
    return "en";
  }
};

let language = loadLanguage();
let plan = null;
let t = ui[language];
let academy = null;

const setLanguage = (nextLanguage) => {
  if (!plans || !plans[nextLanguage] || nextLanguage === language) return;
  language = nextLanguage;
  plan = plans[language];
  t = ui[language];
  academy = academies[language];
  try {
    localStorage.setItem(languageStorageKey, language);
  } catch (error) {
    // Ignore storage failures; the selection still applies for this visit.
  }
  renderAll();
};

const applyStaticText = () => {
  document.documentElement.lang = language;
  document.title = t.pageTitle;
  const metaDescription = document.querySelector('meta[name="description"]');
  if (metaDescription) metaDescription.setAttribute("content", t.metaDescription);
  document.querySelectorAll("[data-i18n]").forEach((element) => {
    const text = t[element.dataset.i18n];
    if (typeof text === "string") element.textContent = text;
  });
};

const updateLanguageSwitcher = () => {
  const switcher = document.getElementById("language-switcher");
  if (switcher) switcher.setAttribute("aria-label", t.languageSwitcherLabel);
  document.querySelectorAll(".lang-button").forEach((button) => {
    const isActive = button.dataset.lang === language;
    button.classList.toggle("lang-button--active", isActive);
    button.setAttribute("aria-pressed", String(isActive));
  });
};

const summarize = () => {
  const completedCount = Object.values(state.completed).filter(Boolean).length;
  const scoreValues = Object.values(state.scores).filter((value) => Number.isFinite(value));
  const averageScore = scoreValues.length
    ? Math.round(scoreValues.reduce((sum, value) => sum + value, 0) / scoreValues.length)
    : 0;
  const completionPercent = Math.round((completedCount / plan.modules.length) * 100);
  const academyPassedCount = academy.levels.filter(
    (level) => (state.academy[level.id] ?? -1) >= academySettings.passThreshold
  ).length;
  const academyPercent = Math.round((academyPassedCount / academy.levels.length) * 100);

  document.getElementById("overview").innerHTML = `
    <div class="stat">
      <strong>${t.statTargetRole}</strong>
      <span>${plan.targetRole}</span>
    </div>
    <div class="stat">
      <strong>${t.statDuration}</strong>
      <span>${plan.duration}</span>
    </div>
    <div class="stat">
      <strong>${t.statModuleCompletion}</strong>
      <span>${completedCount} / ${plan.modules.length}</span>
      <div class="progress-track" role="progressbar" aria-valuenow="${completionPercent}" aria-valuemin="0" aria-valuemax="100" aria-label="${t.statModuleCompletion}">
        <div class="progress-fill" style="width: ${completionPercent}%"></div>
      </div>
    </div>
    <div class="stat">
      <strong>${t.statAverageScore}</strong>
      <span>${averageScore}%</span>
    </div>
    <div class="stat">
      <strong>${t.statAcademy}</strong>
      <span>${academyPassedCount} / ${academy.levels.length}</span>
      <div class="progress-track" role="progressbar" aria-valuenow="${academyPercent}" aria-valuemin="0" aria-valuemax="100" aria-label="${t.statAcademy}">
        <div class="progress-fill" style="width: ${academyPercent}%"></div>
      </div>
    </div>
    <div class="stat">
      <strong>${t.statReadinessTarget}</strong>
      <span>${plan.readinessTarget}</span>
    </div>
    <div class="progress-tools">
      <button type="button" class="button--ghost" id="export-progress">${t.exportProgress}</button>
      <button type="button" class="button--ghost" id="import-progress">${t.importProgress}</button>
      <button type="button" class="button--ghost" id="reset-progress">${t.resetProgress}</button>
    </div>
  `;

  document.getElementById("export-progress").addEventListener("click", exportProgress);
  document.getElementById("import-progress").addEventListener("click", importProgress);
  document.getElementById("reset-progress").addEventListener("click", resetProgress);
};

const exportProgress = () => {
  const blob = new Blob([JSON.stringify(state, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "learning-path-progress.json";
  link.click();
  URL.revokeObjectURL(url);
};

const importProgress = () => {
  const input = document.createElement("input");
  input.type = "file";
  input.accept = "application/json";
  input.addEventListener("change", () => {
    const file = input.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const imported = JSON.parse(reader.result);
        if (!imported || typeof imported !== "object") throw new Error("Invalid file");
        saveState(engine.normalizeState(imported));
        summarize();
        renderModules();
        renderCopilotAcademy();
        renderDashboard();
      } catch (error) {
        alert(t.importError);
      }
    };
    reader.readAsText(file);
  });
  input.click();
};

const resetProgress = () => {
  if (!confirm(t.resetConfirm)) return;
  saveState(engine.normalizeState({}));
  summarize();
  renderModules();
  renderCopilotAcademy();
  renderDashboard();
};

const escapeHtml = (value) =>
  String(value ?? "").replace(/[&<>"']/g, (character) => {
    switch (character) {
      case "&":
        return "&amp;";
      case "<":
        return "&lt;";
      case ">":
        return "&gt;";
      case '"':
        return "&quot;";
      default:
        return "&#39;";
    }
  });

const renderGoals = () => {
  document.getElementById("goals").innerHTML = plan.goals
    .map((goal) => `<span class="chip">${goal}</span>`)
    .join("");
};

const openAccordions = new Set();

// Grades a quiz either locally (static mode: content ships with answers) or
// via the API (server mode: content is sanitized, scoring stays server-side;
// signed-in attempts are recorded in the account history).
const gradeQuiz = async ({ kind, id, questions, answers }) => {
  if (server.available) {
    const route = server.token ? "attempts" : "score";
    const { ok, payload } = await apiFetch(route, {
      method: "POST",
      body: { kind, id, answers, language }
    });
    if (!ok || !payload) throw new Error("Scoring failed");
    if (payload.state) {
      state = engine.mergeProgress(state, payload.state);
      localStorage.setItem(storageKey, JSON.stringify(state));
      server.lastSyncAt = new Date().toISOString();
      server.syncError = false;
    }
    return { score: payload.score, detail: payload.detail };
  }
  return engine.scoreQuiz(questions, answers);
};

const trackAccordions = (rootElement) => {
  rootElement.querySelectorAll("details[data-accordion]").forEach((detailsElement) => {
    detailsElement.addEventListener("toggle", () => {
      if (detailsElement.open) {
        openAccordions.add(detailsElement.dataset.accordion);
      } else {
        openAccordions.delete(detailsElement.dataset.accordion);
      }
    });
  });
};

const renderModules = () => {
  const modulesElement = document.getElementById("modules");

  modulesElement.innerHTML = plan.modules
    .map((module) => {
      const score = state.scores[module.id];
      const accordionId = `module-${module.id}`;

      return `
        <details class="module accordion" data-accordion="${accordionId}"${openAccordions.has(accordionId) ? " open" : ""}>
          <summary class="accordion__summary">
            <div class="accordion__title">
              <p class="eyebrow">${module.weeks}</p>
              <h3>${module.title}</h3>
            </div>
            <span class="accordion__chevron" aria-hidden="true">▾</span>
          </summary>
          <div class="accordion__body">
          <div class="module__header">
            <p>${module.objective}</p>
            <div class="meta-list">
              <span class="meta-pill">${t.quizQuestionsPill(module.quiz.length)}</span>
              <span class="meta-pill">${t.deliverablesPill(module.deliverables.length)}</span>
            </div>
          </div>

          <h4>${t.outcomesHeading}</h4>
          <ul>${module.outcomes.map((item) => `<li>${item}</li>`).join("")}</ul>

          <h4>${t.deliverablesHeading}</h4>
          <ul>${module.deliverables.map((item) => `<li>${item}</li>`).join("")}</ul>

          <h4>${t.resourcesHeading}</h4>
          <div class="resource-list">
            ${module.resources
              .map((resource) => `<a class="resource-link" href="${resource.url}" target="_blank" rel="noreferrer">${resource.name}</a>`)
              .join("")}
          </div>

          <div class="quiz">
            <form data-module="${module.id}">
              ${module.quiz
                .map(
                  (question, questionIndex) => `
                    <fieldset>
                      <legend>${questionIndex + 1}. ${question.prompt}</legend>
                      ${question.options
                        .map(
                          (option, optionIndex) => `
                            <label>
                              <input type="radio" name="${module.id}-${questionIndex}" value="${optionIndex}" />
                              ${option}
                            </label>
                          `
                        )
                        .join("")}
                    </fieldset>
                  `
                )
                .join("")}
              <button type="submit">${t.scoreQuiz}</button>
            </form>
            <div class="module__footer">
              <label class="checkbox-row">
                <input type="checkbox" data-complete="${module.id}" ${state.completed[module.id] ? "checked" : ""} />
                ${t.markComplete}
              </label>
              <span class="badge">${score !== undefined ? t.latestScore(score) : t.notScored}</span>
            </div>
            <div id="result-${module.id}"></div>
          </div>
          </div>
        </details>
      `;
    })
    .join("");

  trackAccordions(modulesElement);

  modulesElement.querySelectorAll("form").forEach((form) => {
    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      const module = plan.modules.find((entry) => entry.id === form.dataset.module);

      const answers = module.quiz.map((_, index) => {
        const selected = form.querySelector(`input[name="${module.id}-${index}"]:checked`);
        return selected ? Number(selected.value) : null;
      });

      let feedback;
      try {
        feedback = await gradeQuiz({ kind: "module", id: module.id, questions: module.quiz, answers });
      } catch (error) {
        alert(t.contentLoadError);
        return;
      }
      const score = feedback.score;
      if (!(server.available && server.token)) {
        state = engine.recordAttempt(state, module.id, score);
        state.scores[module.id] = score;
      }
      saveState(state);
      summarize();
      renderDashboard();

      const badge = form.closest(".quiz").querySelector(".badge");
      badge.textContent = t.latestScore(score);

      const resultElement = document.getElementById(`result-${module.id}`);
      resultElement.className = `result ${score >= 80 ? "result--good" : "result--bad"}`;
      resultElement.innerHTML = `
        <p><strong>${t.scoreLabel}</strong> ${score}%</p>
        <ul>
          ${feedback.detail
            .map(
              (entry, index) => `
                <li>
                  <strong>Q${index + 1}:</strong> ${entry.correct ? t.correct : t.reviewNeeded} —
                  ${entry.explanation}
                </li>
              `
            )
            .join("")}
        </ul>
      `;
    });
  });

  modulesElement.querySelectorAll("[data-complete]").forEach((checkbox) => {
    checkbox.addEventListener("change", (event) => {
      state.completed[event.target.dataset.complete] = event.target.checked;
      saveState(state);
      summarize();
    });
  });
};

const academyFeedback = {};

const academyBestScore = (levelId) => {
  const score = state.academy[levelId];
  return Number.isFinite(score) ? score : null;
};

const isAcademyLevelPassed = (levelId) =>
  (academyBestScore(levelId) ?? -1) >= academySettings.passThreshold;

const isAcademyLevelUnlocked = (index) =>
  index === 0 || isAcademyLevelPassed(academy.levels[index - 1].id);

const renderAcademyResult = (level, feedback) => {
  const passed = feedback.score >= academySettings.passThreshold;
  const isLastLevel = academy.levels[academy.levels.length - 1].id === level.id;
  const statusMessage = passed
    ? isLastLevel
      ? t.academyFinalPassMessage
      : t.academyPassMessage
    : t.academyFailMessage(academySettings.passThreshold);

  return `
    <div class="result ${passed ? "result--good" : "result--bad"}">
      <p><strong>${t.scoreLabel}</strong> ${feedback.score}% — ${statusMessage}</p>
      <ul>
        ${feedback.detail
          .map(
            (entry, index) => `
              <li>
                <strong>Q${index + 1}:</strong> ${entry.correct ? t.correct : t.reviewNeeded} —
                ${entry.explanation}
              </li>
            `
          )
          .join("")}
      </ul>
    </div>
  `;
};

const renderCopilotAcademy = () => {
  const totalLevels = academy.levels.length;
  const currentIndex = academy.levels.findIndex((level) => !isAcademyLevelPassed(level.id));

  document.getElementById("academy-progress").innerHTML = `
    ${academy.levels
      .map((level, index) => {
        const passed = isAcademyLevelPassed(level.id);
        const modifier = passed
          ? " rank-step--passed"
          : index === currentIndex
            ? " rank-step--current"
            : "";
        return `<span class="rank-step${modifier}">${level.icon} ${level.rank}</span>`;
      })
      .join("")}
    <a class="resource-link" href="${academySettings.siteUrl}" target="_blank" rel="noreferrer">${t.academySiteLink}</a>
    <a class="resource-link" href="${academySettings.repoUrl}" target="_blank" rel="noreferrer">${t.academyRepoLink}</a>
  `;

  const academyElement = document.getElementById("copilot-academy");

  academyElement.innerHTML = academy.levels
    .map((level, index) => {
      const unlocked = isAcademyLevelUnlocked(index);
      const passed = isAcademyLevelPassed(level.id);
      const bestScore = academyBestScore(level.id);
      const badgeModifier = passed ? " rank-badge--passed" : unlocked ? "" : " rank-badge--locked";
      const badgeState = passed
        ? t.academyPassedBadge
        : unlocked
          ? t.academyUnlockedBadge
          : t.academyLockedBadge;
      const feedback = academyFeedback[level.id];
      const accordionId = `level-${level.id}`;

      const body = unlocked
        ? `
          <h4>${t.resourcesHeading}</h4>
          <div class="resource-list">
            ${level.resources
              .map(
                (resource) =>
                  `<a class="resource-link" href="${resource.url}" target="_blank" rel="noreferrer">${resource.name}</a>`
              )
              .join("")}
          </div>

          <div class="quiz">
            <form data-level="${level.id}">
              ${level.quiz
                .map(
                  (question, questionIndex) => `
                    <fieldset>
                      <legend>${questionIndex + 1}. ${question.prompt}</legend>
                      ${question.options
                        .map(
                          (option, optionIndex) => `
                            <label>
                              <input type="radio" name="${level.id}-${questionIndex}" value="${optionIndex}" />
                              ${option}
                            </label>
                          `
                        )
                        .join("")}
                    </fieldset>
                  `
                )
                .join("")}
              <button type="submit">${t.scoreQuiz}</button>
            </form>
            <div class="module__footer">
              <span class="badge">${bestScore !== null ? t.academyBestScore(bestScore) : t.academyNotAttempted}</span>
            </div>
            <div id="academy-result-${level.id}">${feedback ? renderAcademyResult(level, feedback) : ""}</div>
          </div>
        `
        : `
          <p class="locked-note">🔒 ${t.academyLockedNote(
            academy.levels[index - 1].rank,
            academySettings.passThreshold
          )}</p>
        `;

      return `
        <details class="level-card accordion${unlocked ? "" : " level-card--locked"}" data-accordion="${accordionId}"${openAccordions.has(accordionId) ? " open" : ""}>
          <summary class="accordion__summary">
            <div class="accordion__title">
              <p class="eyebrow">${t.academyLevelPill(index + 1, totalLevels)}</p>
              <h3>${level.icon} ${level.rank} — ${level.title}</h3>
            </div>
            <span class="rank-badge${badgeModifier}">${badgeState}</span>
            <span class="accordion__chevron" aria-hidden="true">▾</span>
          </summary>
          <div class="accordion__body">
          <div class="level-card__header">
            <p>${level.focus}</p>
            <div class="meta-list">
              <span class="meta-pill">${t.academyQuestionsPill(level.quiz.length)}</span>
              <span class="meta-pill">${t.academyPassPill(academySettings.passThreshold)}</span>
            </div>
          </div>

          <h4>${t.academyModulesHeading}</h4>
          <ul>${level.modules.map((item) => `<li>${item}</li>`).join("")}</ul>

          ${body}
          </div>
        </details>
      `;
    })
    .join("");

  trackAccordions(academyElement);

  academyElement.querySelectorAll("form").forEach((form) => {
    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      const level = academy.levels.find((entry) => entry.id === form.dataset.level);

      const answers = level.quiz.map((_, index) => {
        const selected = form.querySelector(`input[name="${level.id}-${index}"]:checked`);
        return selected ? Number(selected.value) : null;
      });

      let feedback;
      try {
        feedback = await gradeQuiz({ kind: "academy", id: level.id, questions: level.quiz, answers });
      } catch (error) {
        alert(t.contentLoadError);
        return;
      }
      const score = feedback.score;
      if (!(server.available && server.token)) {
        state = engine.recordAttempt(state, level.id, score);
        state.academy[level.id] = Math.max(academyBestScore(level.id) ?? 0, score);
      }
      saveState(state);
      academyFeedback[level.id] = feedback;
      summarize();
      renderCopilotAcademy();
      renderDashboard();
    });
  });
};

const renderFinalAssessment = () => {
  document.getElementById("global-assessment").innerHTML = plan.finalAssessment
    .map(
      (item) => `
        <article class="assessment-card">
          <h3>${item.title}</h3>
          <p>${item.summary}</p>
          <ul>${item.criteria.map((criterion) => `<li>${criterion}</li>`).join("")}</ul>
        </article>
      `
    )
    .join("");
};

const renderApplicationPlan = () => {
  document.getElementById("application-plan").innerHTML = plan.applicationPlan
    .map(
      (item) => `
        <article class="application-card">
          <h3>${item.title}</h3>
          <ul>${item.bullets.map((bullet) => `<li>${bullet}</li>`).join("")}</ul>
        </article>
      `
    )
    .join("");
};

// ---------------------------------------------------------------------------
// Phase 3 — Readiness dashboard, adaptive recommendations, mock interviews
// ---------------------------------------------------------------------------

const dimensionLabel = (id) => {
  const key = `dim${id.charAt(0).toUpperCase()}${id.slice(1)}`;
  return typeof t[key] === "string" ? t[key] : id;
};

const ratingDots = (rating, max) => "●".repeat(rating) + "○".repeat(Math.max(0, max - rating));

const jumpToAccordion = (sectionId, accordionId) => {
  const section = document.querySelector(`[data-accordion="${sectionId}"]`);
  if (section) section.open = true;
  const target = accordionId ? document.querySelector(`[data-accordion="${accordionId}"]`) : section;
  if (target) {
    target.open = true;
    target.scrollIntoView({ behavior: "smooth", block: "start" });
  }
};

const riskZoneLabel = (zone) => {
  if (zone.kind === "module") {
    const module = plan.modules.find((entry) => entry.id === zone.id);
    const title = module ? module.title : zone.id;
    if (zone.reason === "unattempted") return `${title} — ${t.riskUnattempted}`;
    if (zone.reason === "stale") return `${title} — ${t.riskStale}`;
    return `${title} — ${t.riskBelow(zone.score)}`;
  }
  if (zone.kind === "academy") {
    const level = academy.levels.find((entry) => entry.id === zone.id);
    return `${level ? level.title : zone.id} — ${t.riskAcademyNotPassed}`;
  }
  return zone.reason === "never-run" ? t.riskInterviewNever : t.riskInterviewStale;
};

const recommendationText = (recommendation) => {
  switch (recommendation.kind) {
    case "module-quiz":
      return recommendation.reason === "unattempted" ? t.recUnattempted : t.recBelow(recommendation.score);
    case "module-review":
      return t.recStale(recommendation.ageDays);
    case "module-complete":
      return t.recDeliverables;
    case "academy-level":
      return t.recAcademy;
    default:
      return t.recInterview;
  }
};

let currentInterview = null;
let interviewResult = null;

const INTERVIEW_QUESTION_COUNT = 10;

const renderDashboard = () => {
  const dashboardElement = document.getElementById("dashboard");
  if (!dashboardElement) return;

  const readiness = engine.computeReadiness({
    modules: plan.modules,
    academyLevels: academy.levels,
    state,
    passThreshold: academySettings.passThreshold
  });
  const recommendations = engine.buildRecommendations({
    modules: plan.modules,
    academyLevels: academy.levels,
    state,
    passThreshold: academySettings.passThreshold,
    limit: 5
  });

  const componentRow = (label, value) => `
    <div class="stat">
      <strong>${label}</strong>
      <span>${value}%</span>
      <div class="progress-track" role="progressbar" aria-valuenow="${value}" aria-valuemin="0" aria-valuemax="100" aria-label="${label}">
        <div class="progress-fill" style="width: ${value}%"></div>
      </div>
    </div>
  `;

  const visibleZones = readiness.riskZones.slice(0, 8);
  const hiddenZoneCount = readiness.riskZones.length - visibleZones.length;

  dashboardElement.innerHTML = `
    <div class="dashboard-card">
      <h3>${t.readinessHeading}</h3>
      <p class="readiness-score">${readiness.score}%</p>
      <div class="progress-track" role="progressbar" aria-valuenow="${readiness.score}" aria-valuemin="0" aria-valuemax="100" aria-label="${t.readinessHeading}">
        <div class="progress-fill" style="width: ${readiness.score}%"></div>
      </div>
      ${componentRow(t.compModules, readiness.components.moduleCompletion)}
      ${componentRow(t.compQuizzes, readiness.components.quizMastery)}
      ${componentRow(t.compAcademy, readiness.components.academyMastery)}
      ${componentRow(t.compInterviews, readiness.components.interviewMastery)}
    </div>
    <div class="dashboard-card">
      <h3>${t.riskZonesHeading}</h3>
      ${
        readiness.riskZones.length === 0
          ? `<p class="dashboard-empty">${t.noRiskZones}</p>`
          : `<div class="chips">${visibleZones
              .map((zone) => `<span class="chip chip--risk">${riskZoneLabel(zone)}</span>`)
              .join("")}${hiddenZoneCount > 0 ? `<span class="chip">+${hiddenZoneCount}</span>` : ""}</div>`
      }
      <h3>${t.recommendationsHeading}</h3>
      <ul class="recommendation-list">
        ${recommendations
          .map((recommendation, index) => {
            const title =
              recommendation.kind === "academy-level"
                ? (academy.levels.find((entry) => entry.id === recommendation.id) || {}).title || ""
                : recommendation.kind === "interview"
                  ? t.interviewHeading
                  : (plan.modules.find((entry) => entry.id === recommendation.id) || {}).title || "";
            return `
              <li>
                <div>
                  <strong>${title}</strong>
                  <span>${recommendationText(recommendation)}</span>
                </div>
                <button type="button" class="button--ghost" data-recommendation="${index}">${t.recGo}</button>
              </li>
            `;
          })
          .join("")}
      </ul>
    </div>
  `;

  dashboardElement.querySelectorAll("[data-recommendation]").forEach((button) => {
    button.addEventListener("click", () => {
      const recommendation = recommendations[Number(button.dataset.recommendation)];
      if (!recommendation) return;
      if (recommendation.kind === "academy-level") {
        jumpToAccordion("section-academy", `level-${recommendation.id}`);
      } else if (recommendation.kind === "interview") {
        const interviewElement = document.getElementById("interview-area");
        if (interviewElement) interviewElement.scrollIntoView({ behavior: "smooth", block: "start" });
      } else {
        jumpToAccordion("section-curriculum", `module-${recommendation.id}`);
      }
    });
  });

  renderInterviewArea();
};

const renderInterviewResult = () => {
  if (!interviewResult) return "";
  return `
    <div class="result ${interviewResult.score >= academySettings.passThreshold ? "result--good" : "result--bad"}">
      <p><strong>${t.scoreLabel}</strong> ${interviewResult.score}% (${interviewResult.correct}/${interviewResult.total})</p>
      <h4>${t.rubricHeading}</h4>
      <div class="rubric-grid">
        ${interviewResult.rubric
          .map(
            (dimension) => `
              <span class="rubric-dimension">
                <strong>${dimensionLabel(dimension.id)}</strong>
                <span class="rubric-dots" aria-label="${dimension.rating} / ${engine.RUBRIC_MAX_RATING}">${ratingDots(dimension.rating, engine.RUBRIC_MAX_RATING)}</span>
              </span>
            `
          )
          .join("")}
      </div>
      <h4>${t.interviewBreakdownHeading}</h4>
      <ul>
        ${interviewResult.breakdown
          .map((entry) => {
            const module = plan.modules.find((candidate) => candidate.id === entry.moduleId);
            return `<li>${module ? module.title : entry.moduleId}: ${entry.correct}/${entry.total}</li>`;
          })
          .join("")}
      </ul>
      <ul>
        ${interviewResult.detail
          .map(
            (entry, index) => `
              <li><strong>Q${index + 1}:</strong> ${entry.correct ? t.correct : t.reviewNeeded} — ${entry.explanation}</li>
            `
          )
          .join("")}
      </ul>
    </div>
  `;
};

const renderInterviewArea = () => {
  const interviewElement = document.getElementById("interview-area");
  if (!interviewElement) return;

  if (!currentInterview) {
    const snapshots = [...state.interviews].reverse().slice(0, 5);
    interviewElement.innerHTML = `
      <div class="interview-card">
        <h3>${t.interviewHeading}</h3>
        <p>${t.interviewIntro}</p>
        <button type="button" id="start-interview">${t.startInterview(INTERVIEW_QUESTION_COUNT)}</button>
        ${interviewResult ? renderInterviewResult() : ""}
        ${
          snapshots.length > 0
            ? `
              <h4>${t.interviewHistoryHeading}</h4>
              <ul class="snapshot-list">
                ${snapshots
                  .map(
                    (snapshot) =>
                      `<li><span>${new Date(snapshot.at).toLocaleString(language)}</span><strong>${snapshot.score}%</strong></li>`
                  )
                  .join("")}
              </ul>
            `
            : ""
        }
      </div>
    `;
    const startButton = document.getElementById("start-interview");
    if (startButton) {
      startButton.addEventListener("click", () => {
        currentInterview = engine.buildInterview({ modules: plan.modules, questionCount: INTERVIEW_QUESTION_COUNT });
        interviewResult = null;
        renderInterviewArea();
      });
    }
    return;
  }

  interviewElement.innerHTML = `
    <div class="interview-card">
      <h3>${t.interviewHeading}</h3>
      <form id="interview-form">
        ${currentInterview.questions
          .map(
            (question, index) => `
              <fieldset>
                <legend>${index + 1}. <span class="eyebrow">${question.moduleTitle}</span> ${question.prompt}</legend>
                ${question.options
                  .map(
                    (option, optionIndex) => `
                      <label>
                        <input type="radio" name="iv-${index}" value="${optionIndex}" />
                        ${option}
                      </label>
                    `
                  )
                  .join("")}
              </fieldset>
            `
          )
          .join("")}
        <div class="progress-tools">
          <button type="submit">${t.interviewSubmit}</button>
          <button type="button" class="button--ghost" id="cancel-interview">${t.interviewCancel}</button>
        </div>
      </form>
    </div>
  `;

  document.getElementById("cancel-interview").addEventListener("click", () => {
    currentInterview = null;
    renderInterviewArea();
  });

  document.getElementById("interview-form").addEventListener("submit", async (event) => {
    event.preventDefault();
    const answers = currentInterview.questions.map((_, index) => {
      const selected = document.querySelector(`input[name="iv-${index}"]:checked`);
      return selected ? Number(selected.value) : null;
    });
    if (answers.some((answer) => answer === null)) {
      alert(t.interviewUnanswered);
      return;
    }
    const items = currentInterview.questions.map((question) => ({
      moduleId: question.moduleId,
      questionIndex: question.questionIndex
    }));

    try {
      if (server.available) {
        const route = server.token ? "attempts" : "score";
        const { ok, payload } = await apiFetch(route, {
          method: "POST",
          body: { kind: "interview", items, answers, language }
        });
        if (!ok || !payload) throw new Error("Scoring failed");
        interviewResult = payload;
        if (payload.state) {
          state = engine.mergeProgress(state, payload.state);
          localStorage.setItem(storageKey, JSON.stringify(state));
        }
      } else {
        interviewResult = engine.scoreInterview({ modules: plan.modules, items, answers });
      }
    } catch (error) {
      alert(t.contentLoadError);
      return;
    }

    if (!(server.available && server.token)) {
      state = engine.recordAttempt(state, "interview", interviewResult.score);
      state.interviews = [
        ...state.interviews,
        {
          at: new Date().toISOString(),
          score: interviewResult.score,
          total: interviewResult.total,
          rubric: interviewResult.rubric
        }
      ].slice(-20);
    }
    saveState(state);
    currentInterview = null;
    summarize();
    renderDashboard();
  });
};

// ---------------------------------------------------------------------------
// Phase 2 — Account & multi-device sync (server mode)
// ---------------------------------------------------------------------------

const updatePanelVisibility = () => {
  const accountPanel = document.getElementById("account-panel");
  const communityPanel = document.getElementById("community-panel");
  const authorPanel = document.getElementById("author-panel");
  if (!accountPanel) return;
  accountPanel.hidden = !server.available;
  communityPanel.hidden = !server.available;
  const role = server.account ? server.account.role : null;
  authorPanel.hidden = !(server.available && (role === "author" || role === "admin"));
};

const renderAccount = () => {
  const accountElement = document.getElementById("account");
  if (!accountElement || !server.available) return;

  if (server.account && server.token) {
    accountElement.innerHTML = `
      <p>${t.signedInAs(escapeHtml(server.account.displayName), escapeHtml(server.account.role))}</p>
      <p class="dashboard-empty">${t.serverScoringNote}</p>
      <p class="sync-status${server.syncError ? " sync-status--error" : ""}">
        ${server.syncError ? t.syncFailed : server.lastSyncAt ? t.lastSync(new Date(server.lastSyncAt).toLocaleString(language)) : ""}
      </p>
      <div class="progress-tools">
        <button type="button" class="button--ghost" id="sync-now">${t.syncNow}</button>
        <button type="button" class="button--ghost" id="sign-out">${t.signOut}</button>
        <button type="button" class="button--ghost button--danger" id="delete-account">${t.deleteAccount}</button>
      </div>
    `;
    document.getElementById("sync-now").addEventListener("click", async () => {
      await syncProgress();
      renderAll();
    });
    document.getElementById("sign-out").addEventListener("click", async () => {
      await apiFetch("sessions", { method: "DELETE" });
      server.token = null;
      server.account = null;
      saveSession();
      renderAll();
    });
    document.getElementById("delete-account").addEventListener("click", async () => {
      if (!confirm(t.deleteAccountConfirm)) return;
      await apiFetch("accounts/me", { method: "DELETE" });
      server.token = null;
      server.account = null;
      saveSession();
      renderAll();
    });
    return;
  }

  accountElement.innerHTML = `
    <p>${t.authIntroSignedOut}</p>
    <div class="account-grid">
      <form id="create-account-form" class="account-form">
        <h3>${t.createAccountHeading}</h3>
        <input type="text" name="displayName" maxlength="80" placeholder="${t.displayNamePlaceholder}" />
        <button type="submit">${t.createAccountButton}</button>
        <div id="new-account-details"></div>
      </form>
      <form id="sign-in-form" class="account-form">
        <h3>${t.signInHeading}</h3>
        <input type="text" name="accountId" autocomplete="username" placeholder="${t.accountIdPlaceholder}" required />
        <input type="password" name="syncKey" autocomplete="current-password" placeholder="${t.syncKeyPlaceholder}" required />
        <button type="submit">${t.signInButton}</button>
        <div id="sign-in-error"></div>
      </form>
    </div>
  `;

  document.getElementById("create-account-form").addEventListener("submit", async (event) => {
    event.preventDefault();
    const displayName = event.target.elements.displayName.value;
    const created = await apiFetch("accounts", { method: "POST", body: { displayName }, auth: false });
    const detailsElement = document.getElementById("new-account-details");
    if (!created.ok) {
      detailsElement.innerHTML = `<p class="content-load-error">${t.accountCreateError}</p>`;
      return;
    }
    const { account, syncKey } = created.payload;
    const login = await apiFetch("sessions", {
      method: "POST",
      body: { accountId: account.id, syncKey },
      auth: false
    });
    detailsElement.innerHTML = `
      <p>${t.syncKeyNotice}</p>
      <p><strong>${t.accountIdLabel}:</strong> <code>${escapeHtml(account.id)}</code></p>
      <p class="sync-key-row"><code id="sync-key-value">${escapeHtml(syncKey)}</code>
        <button type="button" class="button--ghost" id="copy-sync-key">${t.copyKey}</button></p>
    `;
    document.getElementById("copy-sync-key").addEventListener("click", () => {
      if (navigator.clipboard) navigator.clipboard.writeText(syncKey).catch(() => {});
    });
    if (login.ok) {
      server.token = login.payload.token;
      server.account = login.payload.account;
      saveSession();
      await syncProgress();
      // Keep the sync key visible: re-render everything except the account panel.
      updatePanelVisibility();
      summarize();
      renderDashboard();
      renderCommunity();
      renderAuthoring();
      const signedInNote = document.createElement("p");
      signedInNote.textContent = t.signedInAs(server.account.displayName, server.account.role);
      detailsElement.prepend(signedInNote);
    }
  });

  document.getElementById("sign-in-form").addEventListener("submit", async (event) => {
    event.preventDefault();
    const accountId = event.target.elements.accountId.value.trim();
    const syncKey = event.target.elements.syncKey.value;
    const login = await apiFetch("sessions", { method: "POST", body: { accountId, syncKey }, auth: false });
    if (!login.ok) {
      document.getElementById("sign-in-error").innerHTML = `<p class="content-load-error">${t.signInError}</p>`;
      return;
    }
    server.token = login.payload.token;
    server.account = login.payload.account;
    saveSession();
    await syncProgress();
    renderAll();
  });
};

// ---------------------------------------------------------------------------
// Phase 4 — Submissions, mentoring reviews, cohorts (server mode)
// ---------------------------------------------------------------------------

const submissionCard = (submission) => {
  const module = plan.modules.find((entry) => entry.id === submission.moduleId);
  const review = submission.review;
  return `
    <article class="submission-card">
      <header>
        <strong>${module ? module.title : escapeHtml(submission.moduleId)}</strong>
        <span class="badge">${submission.status === "reviewed" ? t.statusReviewed : t.statusPending}</span>
      </header>
      <p>${escapeHtml(submission.deliverable)}</p>
      ${submission.url ? `<a class="resource-link" href="${escapeHtml(submission.url)}" target="_blank" rel="noreferrer">${escapeHtml(submission.url)}</a>` : ""}
      ${
        review
          ? `
            <div class="result ${review.passed ? "result--good" : "result--bad"}">
              <p><strong>${t.reviewScore(review.score)}</strong> — ${review.passed ? t.reviewPassed : t.reviewFailed}</p>
              <div class="rubric-grid">
                ${review.ratings
                  .map(
                    (dimension) => `
                      <span class="rubric-dimension">
                        <strong>${dimensionLabel(dimension.id)}</strong>
                        <span class="rubric-dots">${ratingDots(dimension.rating, dimension.max)}</span>
                      </span>
                    `
                  )
                  .join("")}
              </div>
              ${review.feedback ? `<p><strong>${t.feedbackLabel}:</strong> ${escapeHtml(review.feedback)}</p>` : ""}
            </div>
          `
          : ""
      }
    </article>
  `;
};

const renderCommunity = async () => {
  const communityElement = document.getElementById("community");
  if (!communityElement || !server.available) return;

  if (!server.token) {
    communityElement.innerHTML = `<p class="dashboard-empty">${t.notSignedIn}</p>`;
    return;
  }

  const isMentor = server.account && ["mentor", "admin"].includes(server.account.role);
  const [mine, pending, cohorts] = await Promise.all([
    apiFetch("submissions?scope=mine"),
    isMentor ? apiFetch("submissions?scope=pending") : Promise.resolve(null),
    apiFetch("cohorts")
  ]);

  const mySubmissions = mine.ok ? mine.payload.submissions : [];
  const pendingSubmissions = pending && pending.ok ? pending.payload.submissions : [];
  const myCohorts = cohorts.ok ? cohorts.payload.cohorts : [];

  communityElement.innerHTML = `
    <div class="community-grid">
      <div>
        <h3>${t.submitHeading}</h3>
        <form id="submission-form" class="account-form">
          <label>${t.moduleSelectLabel}
            <select name="moduleId">
              ${plan.modules.map((module) => `<option value="${module.id}">${module.title}</option>`).join("")}
            </select>
          </label>
          <textarea name="deliverable" rows="3" maxlength="2000" placeholder="${t.deliverablePlaceholder}" required></textarea>
          <input type="url" name="url" placeholder="${t.urlPlaceholder}" pattern="https://.*" />
          <button type="submit">${t.submitButton}</button>
          <div id="submission-error"></div>
        </form>
        <h3>${t.submissionsHeading}</h3>
        ${mySubmissions.length === 0 ? `<p class="dashboard-empty">${t.noSubmissions}</p>` : mySubmissions.map(submissionCard).join("")}
      </div>
      <div>
        ${
          isMentor
            ? `
              <h3>${t.mentorQueueHeading}</h3>
              ${
                pendingSubmissions.length === 0
                  ? `<p class="dashboard-empty">${t.noPending}</p>`
                  : pendingSubmissions
                      .map(
                        (submission) => `
                          <article class="submission-card">
                            <header>
                              <strong>${escapeHtml(submission.moduleId)}</strong>
                              <span class="badge">${escapeHtml(submission.accountId)}</span>
                            </header>
                            <p>${escapeHtml(submission.deliverable)}</p>
                            ${submission.url ? `<a class="resource-link" href="${escapeHtml(submission.url)}" target="_blank" rel="noreferrer">${escapeHtml(submission.url)}</a>` : ""}
                            <form class="account-form" data-review="${submission.id}">
                              ${engine.RUBRIC_DIMENSIONS.map(
                                (dimension) => `
                                  <label>${dimensionLabel(dimension.id)}
                                    <select name="${dimension.id}">
                                      ${[0, 1, 2, 3, 4]
                                        .map((rating) => `<option value="${rating}"${rating === 3 ? " selected" : ""}>${rating}</option>`)
                                        .join("")}
                                    </select>
                                  </label>
                                `
                              ).join("")}
                              <textarea name="feedback" rows="2" maxlength="2000" placeholder="${t.feedbackPlaceholder}"></textarea>
                              <button type="submit">${t.reviewButton}</button>
                            </form>
                          </article>
                        `
                      )
                      .join("")
              }
            `
            : ""
        }
        <h3>${t.cohortsHeading}</h3>
        ${myCohorts
          .map(
            (cohort) => `
              <article class="submission-card">
                <header>
                  <strong>${escapeHtml(cohort.name)}</strong>
                  <span class="badge">${t.cohortMembers(cohort.memberCount)}</span>
                </header>
                ${cohort.joinCode ? `<p><code>${t.cohortJoinCode(escapeHtml(cohort.joinCode))}</code></p>` : ""}
                <button type="button" class="button--ghost" data-cohort-stats="${cohort.id}">${t.viewStats}</button>
                <div id="cohort-stats-${cohort.id}"></div>
              </article>
            `
          )
          .join("")}
        <form id="join-cohort-form" class="account-form">
          <input type="text" name="joinCode" maxlength="16" placeholder="${t.joinCodePlaceholder}" required />
          <button type="submit">${t.joinButton}</button>
        </form>
        ${
          isMentor
            ? `
              <form id="create-cohort-form" class="account-form">
                <input type="text" name="name" maxlength="80" placeholder="${t.cohortNamePlaceholder}" required />
                <button type="submit">${t.createCohortButton}</button>
              </form>
            `
            : ""
        }
        <div id="cohort-error"></div>
      </div>
    </div>
  `;

  document.getElementById("submission-form").addEventListener("submit", async (event) => {
    event.preventDefault();
    const form = event.target;
    const created = await apiFetch("submissions", {
      method: "POST",
      body: {
        moduleId: form.elements.moduleId.value,
        deliverable: form.elements.deliverable.value,
        url: form.elements.url.value || undefined
      }
    });
    if (!created.ok) {
      document.getElementById("submission-error").innerHTML = `<p class="content-load-error">${t.submissionError}</p>`;
      return;
    }
    renderCommunity();
  });

  communityElement.querySelectorAll("[data-review]").forEach((form) => {
    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      const ratings = {};
      for (const dimension of engine.RUBRIC_DIMENSIONS) {
        ratings[dimension.id] = Number(form.elements[dimension.id].value);
      }
      await apiFetch(`submissions/${form.dataset.review}/review`, {
        method: "POST",
        body: { ratings, feedback: form.elements.feedback.value }
      });
      renderCommunity();
    });
  });

  communityElement.querySelectorAll("[data-cohort-stats]").forEach((button) => {
    button.addEventListener("click", async () => {
      const cohortId = button.dataset.cohortStats;
      const stats = await apiFetch(`cohorts/${cohortId}/stats`);
      const statsElement = document.getElementById(`cohort-stats-${cohortId}`);
      if (!stats.ok || !statsElement) return;
      const distribution = stats.payload.anonymized.readinessDistribution;
      statsElement.innerHTML = `
        <p>${t.cohortAvg(stats.payload.anonymized.averageReadiness)}<br />${t.cohortYou(stats.payload.you.readiness)}</p>
        <p><strong>${t.cohortDistribution}:</strong> ${Object.entries(distribution)
          .map(([bucket, count]) => `${bucket}%: ${count}`)
          .join(" · ")}</p>
      `;
    });
  });

  document.getElementById("join-cohort-form").addEventListener("submit", async (event) => {
    event.preventDefault();
    const joined = await apiFetch("cohorts/join", {
      method: "POST",
      body: { joinCode: event.target.elements.joinCode.value }
    });
    if (!joined.ok) {
      document.getElementById("cohort-error").innerHTML = `<p class="content-load-error">${t.cohortError}</p>`;
      return;
    }
    renderCommunity();
  });

  const createCohortForm = document.getElementById("create-cohort-form");
  if (createCohortForm) {
    createCohortForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      const created = await apiFetch("cohorts", {
        method: "POST",
        body: { name: event.target.elements.name.value }
      });
      if (!created.ok) {
        document.getElementById("cohort-error").innerHTML = `<p class="content-load-error">${t.cohortError}</p>`;
        return;
      }
      renderCommunity();
    });
  }
};

// ---------------------------------------------------------------------------
// Phase 2 — Author space: schema-validated publishing without redeploy
// ---------------------------------------------------------------------------

const AUTHORING_FILES = [
  "plan.en.json",
  "plan.fr.json",
  "academy.en.json",
  "academy.fr.json",
  "academy-settings.json"
];

const renderAuthoring = () => {
  const authoringElement = document.getElementById("authoring");
  if (!authoringElement || !server.available || !server.account) return;
  if (!["author", "admin"].includes(server.account.role)) return;

  authoringElement.innerHTML = `
    <form id="authoring-form" class="account-form">
      <label>${t.authorFileLabel}
        <select name="file">
          ${AUTHORING_FILES.map((file) => `<option value="${file}">${file}</option>`).join("")}
        </select>
      </label>
      <div class="progress-tools">
        <button type="button" class="button--ghost" id="author-load">${t.authorLoad}</button>
        <button type="submit">${t.authorPublish}</button>
      </div>
      <textarea name="content" rows="16" spellcheck="false" class="author-editor"></textarea>
      <div id="authoring-result"></div>
    </form>
  `;

  const form = document.getElementById("authoring-form");
  const resultElement = document.getElementById("authoring-result");

  document.getElementById("author-load").addEventListener("click", async () => {
    const file = form.elements.file.value;
    const loaded = await apiFetch(`authoring/content/${file}`);
    if (!loaded.ok) {
      resultElement.innerHTML = `<p class="content-load-error">${t.authorLoadError}</p>`;
      return;
    }
    form.elements.content.value = JSON.stringify(loaded.payload, null, 2);
    resultElement.innerHTML = "";
  });

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const file = form.elements.file.value;
    let candidate;
    try {
      candidate = JSON.parse(form.elements.content.value);
    } catch (error) {
      resultElement.innerHTML = `<p class="content-load-error">${t.authorInvalidJson}</p>`;
      return;
    }
    const published = await apiFetch(`authoring/content/${file}`, { method: "PUT", body: candidate });
    if (published.ok) {
      resultElement.innerHTML = `<div class="result result--good"><p>${t.authorPublished(file)}</p></div>`;
      await loadContent();
      plan = plans[language];
      academy = academies[language];
      renderAll();
      return;
    }
    const errors = published.payload && Array.isArray(published.payload.errors) ? published.payload.errors : [];
    resultElement.innerHTML = `
      <div class="result result--bad">
        <p>${t.authorErrors}</p>
        <ul>${errors.map((error) => `<li>${escapeHtml(error)}</li>`).join("")}</ul>
      </div>
    `;
  });
};

const renderAll = () => {
  applyStaticText();
  updateLanguageSwitcher();
  updatePanelVisibility();
  summarize();
  renderGoals();
  renderModules();
  renderCopilotAcademy();
  renderFinalAssessment();
  renderApplicationPlan();
  renderDashboard();
  renderAccount();
  renderCommunity();
  renderAuthoring();
};

document.querySelectorAll(".lang-button").forEach((button) => {
  button.addEventListener("click", () => setLanguage(button.dataset.lang));
});

detectServer()
  .then(() => restoreSession())
  .then(() => loadContent())
  .then(async () => {
    plan = plans[language];
    academy = academies[language];
    if (server.available && server.token) await syncProgress();
    renderAll();
  })
  .catch((error) => {
    console.error(error);
    const main = document.querySelector("main") || document.body;
    const message = document.createElement("p");
    message.className = "content-load-error";
    message.textContent = t.contentLoadError;
    main.prepend(message);
  });

// Degraded offline mode (PWA): cache the app shell and learning content.
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./sw.js").catch(() => {
      // Offline support is best-effort; the app works without it.
    });
  });
}
