const test = require("node:test");
const assert = require("node:assert/strict");

const engine = require("../lib/engine.js");

const modules = [
  {
    id: "m1",
    title: "Module 1",
    quiz: [
      { prompt: "q1", options: ["a", "b"], answer: 0, explanation: "e1" },
      { prompt: "q2", options: ["a", "b"], answer: 1, explanation: "e2" }
    ]
  },
  {
    id: "m2",
    title: "Module 2",
    quiz: [
      { prompt: "q3", options: ["a", "b"], answer: 1, explanation: "e3" },
      { prompt: "q4", options: ["a", "b"], answer: 0, explanation: "e4" }
    ]
  }
];

const academyLevels = [
  { id: "l1", title: "Level 1" },
  { id: "l2", title: "Level 2" }
];

test("scoreQuiz scores answers and reports per-question detail", () => {
  const result = engine.scoreQuiz(modules[0].quiz, [0, 0]);
  assert.equal(result.score, 50);
  assert.equal(result.correct, 1);
  assert.equal(result.total, 2);
  assert.deepEqual(result.detail.map((entry) => entry.correct), [true, false]);
  assert.equal(result.detail[1].explanation, "e2");
});

test("normalizeState drops junk and clamps scores", () => {
  const state = engine.normalizeState({
    completed: { m1: true, m2: "yes" },
    scores: { m1: 150, m2: "high", m3: -4 },
    academy: { l1: 88.6 },
    attempts: { m1: { count: 0, lastAt: "not-a-date" }, m2: { count: 2, lastAt: "2026-01-01T00:00:00.000Z", lastScore: 70 } },
    interviews: [{ at: "2026-01-02T00:00:00.000Z", score: 61.4 }, { bogus: true }]
  });
  assert.deepEqual(state.completed, { m1: true });
  assert.deepEqual(state.scores, { m1: 100, m3: 0 });
  assert.deepEqual(state.academy, { l1: 89 });
  assert.deepEqual(Object.keys(state.attempts), ["m2"]);
  assert.equal(state.interviews.length, 1);
  assert.equal(state.interviews[0].score, 61);
});

test("mergeProgress keeps best scores, ORs completion, and unions interviews", () => {
  const deviceA = {
    completed: { m1: true },
    scores: { m1: 60 },
    academy: { l1: 90 },
    attempts: { m1: { count: 1, lastAt: "2026-01-01T00:00:00.000Z", lastScore: 60 } },
    interviews: [{ at: "2026-01-01T00:00:00.000Z", score: 40 }]
  };
  const deviceB = {
    completed: { m2: true },
    scores: { m1: 80, m2: 50 },
    academy: { l1: 70 },
    attempts: { m1: { count: 3, lastAt: "2026-02-01T00:00:00.000Z", lastScore: 80 } },
    interviews: [{ at: "2026-02-01T00:00:00.000Z", score: 70 }]
  };
  const merged = engine.mergeProgress(deviceA, deviceB);
  assert.deepEqual(merged.completed, { m1: true, m2: true });
  assert.deepEqual(merged.scores, { m1: 80, m2: 50 });
  assert.deepEqual(merged.academy, { l1: 90 });
  assert.equal(merged.attempts.m1.count, 3);
  assert.equal(merged.attempts.m1.lastAt, "2026-02-01T00:00:00.000Z");
  assert.equal(merged.interviews.length, 2);
});

test("recordAttempt increments the attempt counter", () => {
  let state = engine.normalizeState({});
  state = engine.recordAttempt(state, "m1", 50, "2026-01-01T00:00:00.000Z");
  state = engine.recordAttempt(state, "m1", 90, "2026-01-02T00:00:00.000Z");
  assert.equal(state.attempts.m1.count, 2);
  assert.equal(state.attempts.m1.lastScore, 90);
});

test("computeReadiness is 0 for an empty state and 100 when everything is mastered", () => {
  const empty = engine.computeReadiness({ modules, academyLevels, state: {}, passThreshold: 80 });
  assert.equal(empty.score, 0);
  assert.ok(empty.riskZones.some((zone) => zone.kind === "interview" && zone.reason === "never-run"));
  assert.ok(empty.riskZones.some((zone) => zone.kind === "module" && zone.id === "m1" && zone.reason === "unattempted"));

  const now = Date.parse("2026-03-01T00:00:00.000Z");
  const full = engine.computeReadiness({
    modules,
    academyLevels,
    passThreshold: 80,
    now,
    state: {
      completed: { m1: true, m2: true },
      scores: { m1: 100, m2: 100 },
      academy: { l1: 100, l2: 100 },
      attempts: {
        m1: { count: 1, lastAt: "2026-02-28T00:00:00.000Z", lastScore: 100 },
        m2: { count: 1, lastAt: "2026-02-28T00:00:00.000Z", lastScore: 100 }
      },
      interviews: [{ at: "2026-02-28T00:00:00.000Z", score: 100 }]
    }
  });
  assert.equal(full.score, 100);
  assert.equal(full.riskZones.length, 0);
});

test("computeReadiness flags stale modules and below-threshold scores", () => {
  const now = Date.parse("2026-06-01T00:00:00.000Z");
  const readiness = engine.computeReadiness({
    modules,
    academyLevels,
    passThreshold: 80,
    now,
    state: {
      scores: { m1: 95, m2: 40 },
      attempts: { m1: { count: 1, lastAt: "2026-01-01T00:00:00.000Z", lastScore: 95 } },
      interviews: [{ at: "2026-05-30T00:00:00.000Z", score: 80 }]
    }
  });
  assert.ok(readiness.riskZones.some((zone) => zone.id === "m1" && zone.reason === "stale"));
  assert.ok(readiness.riskZones.some((zone) => zone.id === "m2" && zone.reason === "below-threshold"));
});

test("buildRecommendations prioritizes unattempted quizzes, then weak scores", () => {
  const recommendations = engine.buildRecommendations({
    modules,
    academyLevels,
    passThreshold: 80,
    state: { scores: { m1: 50 } }
  });
  assert.equal(recommendations[0].kind, "module-quiz");
  assert.equal(recommendations[0].id, "m2");
  assert.equal(recommendations[0].reason, "unattempted");
  assert.equal(recommendations[1].id, "m1");
  assert.equal(recommendations[1].reason, "below-threshold");
  assert.ok(recommendations.some((entry) => entry.kind === "academy-level" && entry.id === "l1"));
  assert.ok(recommendations.some((entry) => entry.kind === "interview" && entry.reason === "never-run"));
});

test("buildRecommendations suggests completing deliverables after passing and respects limit", () => {
  const recommendations = engine.buildRecommendations({
    modules,
    academyLevels,
    passThreshold: 80,
    state: { scores: { m1: 90, m2: 90 }, academy: { l1: 90, l2: 90 } },
    limit: 3
  });
  assert.equal(recommendations.length, 3);
  assert.ok(recommendations.some((entry) => entry.kind === "module-complete" && entry.id === "m1"));
});

test("buildInterview is deterministic for a seed and never repeats a question", () => {
  const first = engine.buildInterview({ modules, questionCount: 4, seed: 42 });
  const second = engine.buildInterview({ modules, questionCount: 4, seed: 42 });
  assert.deepEqual(first, second);
  assert.equal(first.questions.length, 4);
  const keys = first.questions.map((question) => `${question.moduleId}:${question.questionIndex}`);
  assert.equal(new Set(keys).size, keys.length);
  const prompts = first.questions.map((question) => question.prompt);
  assert.ok(prompts.every((prompt) => typeof prompt === "string" && prompt.length > 0));
  assert.ok(first.questions.every((question) => question.options.length >= 2));
  assert.ok(first.questions.every((question) => question.answer === undefined), "answers are not embedded");
});

test("buildInterview caps at the available question count", () => {
  const interview = engine.buildInterview({ modules, questionCount: 99, seed: 1 });
  assert.equal(interview.questions.length, 4);
});

test("scoreInterview scores by module and produces a rubric", () => {
  const items = [
    { moduleId: "m1", questionIndex: 0 },
    { moduleId: "m1", questionIndex: 1 },
    { moduleId: "m2", questionIndex: 0 },
    { moduleId: "m2", questionIndex: 1 }
  ];
  const result = engine.scoreInterview({ modules, items, answers: [0, 1, 1, 1] });
  assert.equal(result.score, 75);
  assert.equal(result.total, 4);
  const m1 = result.breakdown.find((entry) => entry.moduleId === "m1");
  assert.equal(m1.correct, 2);
  assert.equal(result.rubric.length, 4);
  const accuracy = result.rubric.find((dimension) => dimension.id === "accuracy");
  assert.equal(accuracy.rating, 3);
});

test("scoreRubric applies the pass ratio threshold", () => {
  const passing = engine.scoreRubric({ correctness: 3, depth: 3, tradeoffs: 3, communication: 3 });
  assert.equal(passing.score, 75);
  assert.equal(passing.passed, true);
  const failing = engine.scoreRubric({ correctness: 2, depth: 2, tradeoffs: 2, communication: 2 });
  assert.equal(failing.passed, false);
  const clamped = engine.scoreRubric({ correctness: 99, depth: -5 });
  assert.equal(clamped.perDimension.find((entry) => entry.id === "correctness").rating, 4);
  assert.equal(clamped.perDimension.find((entry) => entry.id === "depth").rating, 0);
});
