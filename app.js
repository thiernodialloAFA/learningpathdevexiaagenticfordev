const contentBase = "./data";

let plans = null;
let academies = null;
let academySettings = { passThreshold: 80 };

const fetchJson = async (path) => {
  const response = await fetch(`${contentBase}/${path}`);
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
    statAcademy: "Copilot Academy levels"
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
    statAcademy: "Niveaux de l'Académie Copilot"
  }
};

const storageKey = "principal-learning-path-state";
const languageStorageKey = "principal-learning-path-language";

const loadState = () => {
  try {
    const stored = JSON.parse(localStorage.getItem(storageKey)) || {};
    return {
      completed: stored.completed && typeof stored.completed === "object" ? stored.completed : {},
      scores: stored.scores && typeof stored.scores === "object" ? stored.scores : {},
      academy: stored.academy && typeof stored.academy === "object" ? stored.academy : {}
    };
  } catch (error) {
    return { completed: {}, scores: {}, academy: {} };
  }
};

const saveState = (state) => {
  localStorage.setItem(storageKey, JSON.stringify(state));
};

const state = loadState();

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
        state.completed = imported.completed && typeof imported.completed === "object" ? imported.completed : {};
        state.scores = imported.scores && typeof imported.scores === "object" ? imported.scores : {};
        state.academy = imported.academy && typeof imported.academy === "object" ? imported.academy : {};
        saveState(state);
        summarize();
        renderModules();
        renderCopilotAcademy();
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
  state.completed = {};
  state.scores = {};
  state.academy = {};
  saveState(state);
  summarize();
  renderModules();
  renderCopilotAcademy();
};

const renderGoals = () => {
  document.getElementById("goals").innerHTML = plan.goals
    .map((goal) => `<span class="chip">${goal}</span>`)
    .join("");
};

const openAccordions = new Set();

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
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const module = plan.modules.find((entry) => entry.id === form.dataset.module);

      const answers = module.quiz.map((_, index) => {
        const selected = form.querySelector(`input[name="${module.id}-${index}"]:checked`);
        return selected ? Number(selected.value) : null;
      });

      const correct = answers.filter((answer, index) => answer === module.quiz[index].answer).length;
      const score = Math.round((correct / module.quiz.length) * 100);
      state.scores[module.id] = score;
      saveState(state);
      summarize();

      const badge = form.closest(".quiz").querySelector(".badge");
      badge.textContent = t.latestScore(score);

      const resultElement = document.getElementById(`result-${module.id}`);
      resultElement.className = `result ${score >= 80 ? "result--good" : "result--bad"}`;
      resultElement.innerHTML = `
        <p><strong>${t.scoreLabel}</strong> ${score}%</p>
        <ul>
          ${module.quiz
            .map(
              (question, index) => `
                <li>
                  <strong>Q${index + 1}:</strong> ${answers[index] === question.answer ? t.correct : t.reviewNeeded} —
                  ${question.explanation}
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
        ${level.quiz
          .map(
            (question, index) => `
              <li>
                <strong>Q${index + 1}:</strong> ${feedback.answers[index] === question.answer ? t.correct : t.reviewNeeded} —
                ${question.explanation}
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
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const level = academy.levels.find((entry) => entry.id === form.dataset.level);

      const answers = level.quiz.map((_, index) => {
        const selected = form.querySelector(`input[name="${level.id}-${index}"]:checked`);
        return selected ? Number(selected.value) : null;
      });

      const correct = answers.filter((answer, index) => answer === level.quiz[index].answer).length;
      const score = Math.round((correct / level.quiz.length) * 100);
      state.academy[level.id] = Math.max(academyBestScore(level.id) ?? 0, score);
      saveState(state);
      academyFeedback[level.id] = { score, answers };
      summarize();
      renderCopilotAcademy();
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

const renderAll = () => {
  applyStaticText();
  updateLanguageSwitcher();
  summarize();
  renderGoals();
  renderModules();
  renderCopilotAcademy();
  renderFinalAssessment();
  renderApplicationPlan();
};

document.querySelectorAll(".lang-button").forEach((button) => {
  button.addEventListener("click", () => setLanguage(button.dataset.lang));
});

loadContent()
  .then(() => {
    plan = plans[language];
    academy = academies[language];
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
