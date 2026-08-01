// Shared learning engine: quiz scoring, progress merging, readiness scoring,
// adaptive recommendations, mock-interview building, and rubric scoring.
// Dependency-free and usable both in the browser (window.LearningEngine)
// and in Node.js (require("./lib/engine.js")) so the same logic powers the
// static frontend, the sync/scoring server, and the automated tests.
(function (global, factory) {
  if (typeof module === "object" && module.exports) {
    module.exports = factory();
  } else {
    global.LearningEngine = factory();
  }
})(typeof self !== "undefined" ? self : this, function () {
  "use strict";

  const DAY_MS = 24 * 60 * 60 * 1000;
  const STALE_AFTER_DAYS = 30;
  const INTERVIEW_GAP_DAYS = 14;

  const RUBRIC_MAX_RATING = 4;
  const RUBRIC_PASS_RATIO = 0.7;
  const RUBRIC_DIMENSIONS = [
    { id: "correctness" },
    { id: "depth" },
    { id: "tradeoffs" },
    { id: "communication" }
  ];
  const INTERVIEW_DIMENSIONS = [
    { id: "accuracy" },
    { id: "breadth" },
    { id: "consistency" },
    { id: "mastery" }
  ];

  const isObject = (value) => Boolean(value) && typeof value === "object" && !Array.isArray(value);

  // ---------------------------------------------------------------------------
  // Progress state
  // ---------------------------------------------------------------------------

  const normalizeState = (raw) => {
    const source = isObject(raw) ? raw : {};
    const completed = {};
    if (isObject(source.completed)) {
      for (const [key, value] of Object.entries(source.completed)) {
        if (value === true) completed[key] = true;
      }
    }
    const scores = {};
    if (isObject(source.scores)) {
      for (const [key, value] of Object.entries(source.scores)) {
        if (Number.isFinite(value)) scores[key] = Math.max(0, Math.min(100, Math.round(value)));
      }
    }
    const academy = {};
    if (isObject(source.academy)) {
      for (const [key, value] of Object.entries(source.academy)) {
        if (Number.isFinite(value)) academy[key] = Math.max(0, Math.min(100, Math.round(value)));
      }
    }
    const attempts = {};
    if (isObject(source.attempts)) {
      for (const [key, value] of Object.entries(source.attempts)) {
        if (!isObject(value)) continue;
        const lastAt = typeof value.lastAt === "string" && !Number.isNaN(Date.parse(value.lastAt))
          ? value.lastAt
          : null;
        if (!lastAt) continue;
        attempts[key] = {
          count: Number.isInteger(value.count) && value.count > 0 ? value.count : 1,
          lastAt,
          lastScore: Number.isFinite(value.lastScore)
            ? Math.max(0, Math.min(100, Math.round(value.lastScore)))
            : null
        };
      }
    }
    const interviews = [];
    if (Array.isArray(source.interviews)) {
      for (const entry of source.interviews) {
        if (!isObject(entry)) continue;
        if (typeof entry.at !== "string" || Number.isNaN(Date.parse(entry.at))) continue;
        if (!Number.isFinite(entry.score)) continue;
        interviews.push({
          at: entry.at,
          score: Math.max(0, Math.min(100, Math.round(entry.score))),
          total: Number.isInteger(entry.total) ? entry.total : null,
          rubric: Array.isArray(entry.rubric)
            ? entry.rubric
                .filter((dim) => isObject(dim) && typeof dim.id === "string" && Number.isFinite(dim.rating))
                .map((dim) => ({ id: dim.id, rating: Math.max(0, Math.min(RUBRIC_MAX_RATING, Math.round(dim.rating))) }))
            : []
        });
      }
      interviews.sort((a, b) => Date.parse(a.at) - Date.parse(b.at));
    }
    return { completed, scores, academy, attempts, interviews: interviews.slice(-20) };
  };

  const mergeProgress = (a, b) => {
    const left = normalizeState(a);
    const right = normalizeState(b);
    const merged = normalizeState({});
    for (const source of [left, right]) {
      for (const [key, value] of Object.entries(source.completed)) {
        if (value) merged.completed[key] = true;
      }
      for (const [key, value] of Object.entries(source.scores)) {
        merged.scores[key] = Math.max(merged.scores[key] ?? 0, value);
      }
      for (const [key, value] of Object.entries(source.academy)) {
        merged.academy[key] = Math.max(merged.academy[key] ?? 0, value);
      }
      for (const [key, value] of Object.entries(source.attempts)) {
        const existing = merged.attempts[key];
        if (!existing) {
          merged.attempts[key] = { ...value };
        } else {
          merged.attempts[key] = {
            count: Math.max(existing.count, value.count),
            lastAt: Date.parse(value.lastAt) > Date.parse(existing.lastAt) ? value.lastAt : existing.lastAt,
            lastScore:
              Date.parse(value.lastAt) > Date.parse(existing.lastAt) ? value.lastScore : existing.lastScore
          };
        }
      }
    }
    const seen = new Set();
    merged.interviews = [...left.interviews, ...right.interviews]
      .filter((entry) => {
        const key = `${entry.at}:${entry.score}`;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      })
      .sort((a, b) => Date.parse(a.at) - Date.parse(b.at))
      .slice(-20);
    return merged;
  };

  const recordAttempt = (state, id, score, at) => {
    const normalized = normalizeState(state);
    const timestamp = at || new Date().toISOString();
    const existing = normalized.attempts[id];
    normalized.attempts[id] = {
      count: existing ? existing.count + 1 : 1,
      lastAt: timestamp,
      lastScore: Number.isFinite(score) ? Math.max(0, Math.min(100, Math.round(score))) : null
    };
    return normalized;
  };

  // ---------------------------------------------------------------------------
  // Quiz scoring
  // ---------------------------------------------------------------------------

  const scoreQuiz = (questions, answers) => {
    if (!Array.isArray(questions) || questions.length === 0) {
      return { score: 0, correct: 0, total: 0, detail: [] };
    }
    const provided = Array.isArray(answers) ? answers : [];
    const detail = questions.map((question, index) => ({
      correct: provided[index] === question.answer,
      explanation: typeof question.explanation === "string" ? question.explanation : ""
    }));
    const correct = detail.filter((entry) => entry.correct).length;
    return {
      score: Math.round((correct / questions.length) * 100),
      correct,
      total: questions.length,
      detail
    };
  };

  // ---------------------------------------------------------------------------
  // Readiness scoring and risk zones
  // ---------------------------------------------------------------------------

  const computeReadiness = ({ modules, academyLevels, state, passThreshold, now }) => {
    const normalized = normalizeState(state);
    const reference = Number.isFinite(now) ? now : Date.now();
    const threshold = Number.isFinite(passThreshold) ? passThreshold : 80;
    const moduleList = Array.isArray(modules) ? modules : [];
    const levelList = Array.isArray(academyLevels) ? academyLevels : [];

    const completedCount = moduleList.filter((module) => normalized.completed[module.id]).length;
    const moduleCompletion = moduleList.length ? completedCount / moduleList.length : 0;

    const quizSum = moduleList.reduce((sum, module) => sum + (normalized.scores[module.id] ?? 0), 0);
    const quizMastery = moduleList.length ? quizSum / (moduleList.length * 100) : 0;

    const passedLevels = levelList.filter((level) => (normalized.academy[level.id] ?? -1) >= threshold).length;
    const academyMastery = levelList.length ? passedLevels / levelList.length : 0;

    const latestInterview = normalized.interviews[normalized.interviews.length - 1] || null;
    const interviewMastery = latestInterview ? latestInterview.score / 100 : 0;

    const score = Math.round(
      (moduleCompletion * 0.25 + quizMastery * 0.35 + academyMastery * 0.2 + interviewMastery * 0.2) * 100
    );

    const riskZones = [];
    for (const module of moduleList) {
      const quizScore = normalized.scores[module.id];
      if (quizScore === undefined) {
        riskZones.push({ kind: "module", id: module.id, reason: "unattempted" });
      } else if (quizScore < threshold) {
        riskZones.push({ kind: "module", id: module.id, reason: "below-threshold", score: quizScore });
      } else {
        const attempt = normalized.attempts[module.id];
        if (attempt && reference - Date.parse(attempt.lastAt) > STALE_AFTER_DAYS * DAY_MS) {
          riskZones.push({ kind: "module", id: module.id, reason: "stale", score: quizScore });
        }
      }
    }
    for (const level of levelList) {
      if ((normalized.academy[level.id] ?? -1) < threshold) {
        riskZones.push({ kind: "academy", id: level.id, reason: "not-passed" });
      }
    }
    if (!latestInterview) {
      riskZones.push({ kind: "interview", id: "interview", reason: "never-run" });
    } else if (reference - Date.parse(latestInterview.at) > INTERVIEW_GAP_DAYS * DAY_MS) {
      riskZones.push({ kind: "interview", id: "interview", reason: "stale" });
    }

    return {
      score,
      components: {
        moduleCompletion: Math.round(moduleCompletion * 100),
        quizMastery: Math.round(quizMastery * 100),
        academyMastery: Math.round(academyMastery * 100),
        interviewMastery: Math.round(interviewMastery * 100)
      },
      riskZones,
      latestInterview
    };
  };

  // ---------------------------------------------------------------------------
  // Adaptive recommendations (weak signals: coverage, low scores, recency)
  // ---------------------------------------------------------------------------

  const buildRecommendations = ({ modules, academyLevels, state, passThreshold, now, limit }) => {
    const normalized = normalizeState(state);
    const reference = Number.isFinite(now) ? now : Date.now();
    const threshold = Number.isFinite(passThreshold) ? passThreshold : 80;
    const moduleList = Array.isArray(modules) ? modules : [];
    const levelList = Array.isArray(academyLevels) ? academyLevels : [];
    const recommendations = [];

    moduleList.forEach((module, index) => {
      const score = normalized.scores[module.id];
      if (score === undefined) {
        recommendations.push({
          kind: "module-quiz",
          id: module.id,
          title: module.title,
          reason: "unattempted",
          priority: 1000 - index
        });
      } else if (score < threshold) {
        recommendations.push({
          kind: "module-quiz",
          id: module.id,
          title: module.title,
          reason: "below-threshold",
          score,
          priority: 900 - score
        });
      } else {
        const attempt = normalized.attempts[module.id];
        if (attempt) {
          const ageDays = Math.floor((reference - Date.parse(attempt.lastAt)) / DAY_MS);
          if (ageDays > STALE_AFTER_DAYS) {
            recommendations.push({
              kind: "module-review",
              id: module.id,
              title: module.title,
              reason: "stale",
              ageDays,
              priority: 400 + Math.min(ageDays, 365)
            });
          }
        }
      }
      if (score !== undefined && score >= threshold && !normalized.completed[module.id]) {
        recommendations.push({
          kind: "module-complete",
          id: module.id,
          title: module.title,
          reason: "deliverables-pending",
          priority: 500 - index
        });
      }
    });

    const nextLevelIndex = levelList.findIndex((level) => (normalized.academy[level.id] ?? -1) < threshold);
    if (nextLevelIndex !== -1) {
      const level = levelList[nextLevelIndex];
      recommendations.push({
        kind: "academy-level",
        id: level.id,
        title: level.title,
        reason: normalized.academy[level.id] === undefined ? "unattempted" : "below-threshold",
        priority: 450
      });
    }

    const latestInterview = normalized.interviews[normalized.interviews.length - 1] || null;
    if (!latestInterview || reference - Date.parse(latestInterview.at) > INTERVIEW_GAP_DAYS * DAY_MS) {
      recommendations.push({
        kind: "interview",
        id: "interview",
        reason: latestInterview ? "stale" : "never-run",
        priority: 350
      });
    }

    recommendations.sort((a, b) => b.priority - a.priority);
    return Number.isInteger(limit) && limit > 0 ? recommendations.slice(0, limit) : recommendations;
  };

  // ---------------------------------------------------------------------------
  // Mock interview building (deterministic, seeded)
  // ---------------------------------------------------------------------------

  const mulberry32 = (seed) => {
    let a = seed >>> 0;
    return () => {
      a = (a + 0x6d2b79f5) >>> 0;
      let t = a;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  };

  const buildInterview = ({ modules, questionCount, seed }) => {
    const moduleList = Array.isArray(modules) ? modules.filter((module) => Array.isArray(module.quiz)) : [];
    const requested = Number.isInteger(questionCount) && questionCount > 0 ? questionCount : 10;
    const usedSeed = Number.isInteger(seed) ? seed : Math.floor(Math.random() * 2 ** 31);
    const random = mulberry32(usedSeed);
    const pools = moduleList.map((module) => ({
      module,
      indices: module.quiz.map((_, index) => index)
    }));
    for (const pool of pools) {
      for (let i = pool.indices.length - 1; i > 0; i -= 1) {
        const j = Math.floor(random() * (i + 1));
        [pool.indices[i], pool.indices[j]] = [pool.indices[j], pool.indices[i]];
      }
    }
    const questions = [];
    let poolIndex = 0;
    let safety = pools.reduce((sum, pool) => sum + pool.indices.length, 0);
    while (questions.length < requested && safety > 0) {
      const pool = pools[poolIndex % pools.length];
      poolIndex += 1;
      if (pool.indices.length === 0) {
        safety -= 1;
        continue;
      }
      const questionIndex = pool.indices.pop();
      const question = pool.module.quiz[questionIndex];
      questions.push({
        moduleId: pool.module.id,
        moduleTitle: pool.module.title,
        questionIndex,
        prompt: question.prompt,
        options: question.options
      });
      safety -= 1;
    }
    return { seed: usedSeed, questions };
  };

  const scoreInterview = ({ modules, items, answers }) => {
    const moduleList = Array.isArray(modules) ? modules : [];
    const moduleById = new Map(moduleList.map((module) => [module.id, module]));
    const list = Array.isArray(items) ? items : [];
    const provided = Array.isArray(answers) ? answers : [];
    const detail = [];
    const perModule = new Map();
    list.forEach((item, index) => {
      const module = moduleById.get(item.moduleId);
      const question = module && Array.isArray(module.quiz) ? module.quiz[item.questionIndex] : null;
      const correct = Boolean(question) && provided[index] === question.answer;
      detail.push({
        correct,
        explanation: question && typeof question.explanation === "string" ? question.explanation : ""
      });
      const bucket = perModule.get(item.moduleId) || { moduleId: item.moduleId, correct: 0, total: 0 };
      bucket.total += 1;
      if (correct) bucket.correct += 1;
      perModule.set(item.moduleId, bucket);
    });
    const total = detail.length;
    const correct = detail.filter((entry) => entry.correct).length;
    const breakdown = [...perModule.values()];
    return {
      score: total ? Math.round((correct / total) * 100) : 0,
      correct,
      total,
      detail,
      breakdown,
      rubric: interviewRubric(breakdown)
    };
  };

  const toRating = (ratio) => Math.max(0, Math.min(RUBRIC_MAX_RATING, Math.round(ratio * RUBRIC_MAX_RATING)));

  const interviewRubric = (breakdown) => {
    const list = Array.isArray(breakdown) ? breakdown.filter((entry) => entry.total > 0) : [];
    if (list.length === 0) {
      return INTERVIEW_DIMENSIONS.map((dimension) => ({ id: dimension.id, rating: 0 }));
    }
    const totalQuestions = list.reduce((sum, entry) => sum + entry.total, 0);
    const totalCorrect = list.reduce((sum, entry) => sum + entry.correct, 0);
    const accuracy = totalQuestions ? totalCorrect / totalQuestions : 0;
    const breadth = list.filter((entry) => entry.correct > 0).length / list.length;
    const ratios = list.map((entry) => entry.correct / entry.total);
    const mean = ratios.reduce((sum, value) => sum + value, 0) / ratios.length;
    const variance = ratios.reduce((sum, value) => sum + (value - mean) ** 2, 0) / ratios.length;
    const consistency = Math.max(0, 1 - Math.sqrt(variance) * 2);
    const mastery = list.filter((entry) => entry.correct === entry.total).length / list.length;
    return [
      { id: "accuracy", rating: toRating(accuracy) },
      { id: "breadth", rating: toRating(breadth) },
      { id: "consistency", rating: toRating(consistency) },
      { id: "mastery", rating: toRating(mastery) }
    ];
  };

  // ---------------------------------------------------------------------------
  // Rubric scoring (deliverable and capstone reviews)
  // ---------------------------------------------------------------------------

  const scoreRubric = (ratings) => {
    const perDimension = RUBRIC_DIMENSIONS.map((dimension) => {
      const raw = isObject(ratings) ? ratings[dimension.id] : undefined;
      const rating = Number.isFinite(raw) ? Math.max(0, Math.min(RUBRIC_MAX_RATING, Math.round(raw))) : 0;
      return { id: dimension.id, rating, max: RUBRIC_MAX_RATING };
    });
    const earned = perDimension.reduce((sum, entry) => sum + entry.rating, 0);
    const max = RUBRIC_DIMENSIONS.length * RUBRIC_MAX_RATING;
    const score = Math.round((earned / max) * 100);
    return { score, passed: earned / max >= RUBRIC_PASS_RATIO, perDimension };
  };

  return {
    STALE_AFTER_DAYS,
    INTERVIEW_GAP_DAYS,
    RUBRIC_MAX_RATING,
    RUBRIC_PASS_RATIO,
    RUBRIC_DIMENSIONS,
    INTERVIEW_DIMENSIONS,
    normalizeState,
    mergeProgress,
    recordAttempt,
    scoreQuiz,
    computeReadiness,
    buildRecommendations,
    buildInterview,
    scoreInterview,
    interviewRubric,
    scoreRubric
  };
});
