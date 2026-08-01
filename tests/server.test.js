// End-to-end tests for the learning platform server (plan.md Phases 2 & 4):
// accounts, sessions, progress sync and import, server-side scoring with
// sanitized content, authoring publish flow, submissions with rubric
// reviews, cohorts with anonymized stats, and access control.

const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");

const { createApp } = require("../server/server.js");

let baseUrl;
let server;
let dataDir;

const api = async (method, route, { token, body } = {}) => {
  const headers = {};
  if (token) headers.Authorization = ["Bearer", token].join(" ");
  if (body !== undefined) headers["Content-Type"] = "application/json";
  const response = await fetch(`${baseUrl}${route}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined
  });
  const payload = await response.json();
  return { status: response.status, payload };
};

test.before(async () => {
  dataDir = fs.mkdtempSync(path.join(os.tmpdir(), "learning-server-test-"));
  const app = createApp({ dataDir });
  server = app.server;
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  baseUrl = `http://127.0.0.1:${server.address().port}`;
});

test.after(async () => {
  await new Promise((resolve) => server.close(resolve));
  fs.rmSync(dataDir, { recursive: true, force: true });
});

// Shared fixtures created by the account test and reused afterwards.
const accounts = {};

test("health endpoint responds", async () => {
  const { status, payload } = await api("GET", "/api/health");
  assert.equal(status, 200);
  assert.equal(payload.ok, true);
});

test("sanitized content hides answers and explanations", async () => {
  const { status, payload } = await api("GET", "/api/content/plan.en.json");
  assert.equal(status, 200);
  assert.ok(Array.isArray(payload.modules) && payload.modules.length > 0);
  for (const module of payload.modules) {
    for (const question of module.quiz) {
      assert.equal(question.answer, undefined);
      assert.equal(question.explanation, undefined);
      assert.ok(question.prompt && Array.isArray(question.options));
    }
  }
  const academy = await api("GET", "/api/content/academy.fr.json");
  assert.equal(academy.status, 200);
  for (const level of academy.payload.levels) {
    for (const question of level.quiz) assert.equal(question.answer, undefined);
  }
  const unknown = await api("GET", "/api/content/secrets.json");
  assert.equal(unknown.status, 404);
});

test("account creation and session sign-in; first account is admin", async () => {
  const first = await api("POST", "/api/accounts", { body: { displayName: "Ada" } });
  assert.equal(first.status, 201);
  assert.equal(first.payload.account.role, "admin");
  assert.ok(first.payload.syncKey.length >= 24);
  accounts.admin = { ...first.payload.account, syncKey: first.payload.syncKey };

  const second = await api("POST", "/api/accounts", { body: { displayName: "Grace" } });
  assert.equal(second.payload.account.role, "learner");
  accounts.learner = { ...second.payload.account, syncKey: second.payload.syncKey };

  const third = await api("POST", "/api/accounts", { body: { displayName: "Mentor" } });
  accounts.mentor = { ...third.payload.account, syncKey: third.payload.syncKey };

  const badLogin = await api("POST", "/api/sessions", {
    body: { accountId: accounts.admin.id, syncKey: "wrong-key" }
  });
  assert.equal(badLogin.status, 401);

  for (const key of ["admin", "learner", "mentor"]) {
    const login = await api("POST", "/api/sessions", {
      body: { accountId: accounts[key].id, syncKey: accounts[key].syncKey }
    });
    assert.equal(login.status, 201);
    accounts[key].token = login.payload.token;
  }

  const me = await api("GET", "/api/me", { token: accounts.learner.token });
  assert.equal(me.payload.account.displayName, "Grace");

  const anonymous = await api("GET", "/api/me");
  assert.equal(anonymous.status, 401);
});

test("admin can grant roles; non-admin cannot", async () => {
  const denied = await api("PUT", `/api/accounts/${accounts.mentor.id}/role`, {
    token: accounts.learner.token,
    body: { role: "mentor" }
  });
  assert.equal(denied.status, 403);

  const granted = await api("PUT", `/api/accounts/${accounts.mentor.id}/role`, {
    token: accounts.admin.token,
    body: { role: "mentor" }
  });
  assert.equal(granted.status, 200);
  assert.equal(granted.payload.account.role, "mentor");

  const invalid = await api("PUT", `/api/accounts/${accounts.mentor.id}/role`, {
    token: accounts.admin.token,
    body: { role: "superuser" }
  });
  assert.equal(invalid.status, 400);
});

test("progress sync merges across devices and imports the legacy export", async () => {
  const deviceA = await api("PUT", "/api/progress", {
    token: accounts.learner.token,
    body: { state: { completed: { "genai-foundations": true }, scores: { "genai-foundations": 60 } } }
  });
  assert.equal(deviceA.status, 200);

  // The legacy localStorage export has no wrapper object: import accepts it raw.
  const legacyImport = await api("POST", "/api/progress/import", {
    token: accounts.learner.token,
    body: { completed: {}, scores: { "genai-foundations": 90 }, academy: { beginner: 85 } }
  });
  assert.equal(legacyImport.status, 200);
  assert.equal(legacyImport.payload.state.scores["genai-foundations"], 90, "best score wins");
  assert.equal(legacyImport.payload.state.completed["genai-foundations"], true, "completion preserved");
  assert.equal(legacyImport.payload.state.academy.beginner, 85);

  const fetched = await api("GET", "/api/progress", { token: accounts.learner.token });
  assert.equal(fetched.payload.state.scores["genai-foundations"], 90);
  assert.ok(fetched.payload.updatedAt);
});

test("server-side scoring records attempts and updates progress", async () => {
  const planContent = await api("GET", "/api/content/plan.en.json");
  const module = planContent.payload.modules[0];
  const answers = module.quiz.map(() => 0);

  const attempt = await api("POST", "/api/attempts", {
    token: accounts.learner.token,
    body: { kind: "module", id: module.id, answers, language: "en" }
  });
  assert.equal(attempt.status, 201);
  assert.ok(attempt.payload.score >= 0 && attempt.payload.score <= 100);
  assert.equal(attempt.payload.detail.length, module.quiz.length);
  assert.ok(attempt.payload.detail.every((entry) => typeof entry.explanation === "string"));
  assert.ok(attempt.payload.state.attempts[module.id].count >= 1);

  const history = await api("GET", "/api/attempts", { token: accounts.learner.token });
  assert.ok(history.payload.attempts.some((entry) => entry.refId === module.id));

  const mismatch = await api("POST", "/api/attempts", {
    token: accounts.learner.token,
    body: { kind: "module", id: module.id, answers: [0] }
  });
  assert.equal(mismatch.status, 400);

  const unknown = await api("POST", "/api/attempts", {
    token: accounts.learner.token,
    body: { kind: "module", id: "nope", answers: [0] }
  });
  assert.equal(unknown.status, 404);
});

test("anonymous scoring endpoint works without an account", async () => {
  const academyContent = await api("GET", "/api/content/academy.en.json");
  const level = academyContent.payload.levels[0];
  const scored = await api("POST", "/api/score", {
    body: { kind: "academy", id: level.id, answers: level.quiz.map(() => 0) }
  });
  assert.equal(scored.status, 200);
  assert.ok(Number.isFinite(scored.payload.score));
  assert.ok(Number.isInteger(scored.payload.passThreshold));
});

test("interview attempts are scored server-side and produce a rubric plus snapshot", async () => {
  const planContent = await api("GET", "/api/content/plan.en.json");
  const modules = planContent.payload.modules.slice(0, 2);
  const items = modules.map((module) => ({ moduleId: module.id, questionIndex: 0 }));
  const attempt = await api("POST", "/api/attempts", {
    token: accounts.learner.token,
    body: { kind: "interview", items, answers: items.map(() => 0) }
  });
  assert.equal(attempt.status, 201);
  assert.equal(attempt.payload.rubric.length, 4);
  assert.equal(attempt.payload.state.interviews.length, 1);

  const invalid = await api("POST", "/api/attempts", {
    token: accounts.learner.token,
    body: { kind: "interview", items: [{ moduleId: "nope", questionIndex: 0 }], answers: [0] }
  });
  assert.equal(invalid.status, 400);
});

test("authoring requires the author or admin role and validates content", async () => {
  const denied = await api("GET", "/api/authoring/content/academy-settings.json", {
    token: accounts.learner.token
  });
  assert.equal(denied.status, 403);

  const full = await api("GET", "/api/authoring/content/plan.en.json", { token: accounts.admin.token });
  assert.equal(full.status, 200);
  assert.ok(full.payload.modules[0].quiz[0].answer !== undefined, "authors see answers");

  const settings = await api("GET", "/api/authoring/content/academy-settings.json", {
    token: accounts.admin.token
  });

  const invalid = await api("PUT", "/api/authoring/content/academy-settings.json", {
    token: accounts.admin.token,
    body: { ...settings.payload, passThreshold: 999 }
  });
  assert.equal(invalid.status, 422);
  assert.ok(invalid.payload.errors.some((error) => error.includes("passThreshold")));

  const valid = await api("PUT", "/api/authoring/content/academy-settings.json", {
    token: accounts.admin.token,
    body: { ...settings.payload, passThreshold: 75 }
  });
  assert.equal(valid.status, 200);

  // Published without redeploy: the sanitized content reflects the change.
  const republished = await api("GET", "/api/content/academy-settings.json");
  assert.equal(republished.payload.passThreshold, 75);
});

test("submission and rubric review workflow (mentoring)", async () => {
  const planContent = await api("GET", "/api/content/plan.en.json");
  const moduleId = planContent.payload.modules[0].id;

  const rejected = await api("POST", "/api/submissions", {
    token: accounts.learner.token,
    body: { moduleId: "nope", deliverable: "text" }
  });
  assert.equal(rejected.status, 400);

  const created = await api("POST", "/api/submissions", {
    token: accounts.learner.token,
    body: { moduleId, deliverable: "Prompt library covering refactor and test flows", url: "https://example.com/repo" }
  });
  assert.equal(created.status, 201);
  const submissionId = created.payload.submission.id;
  assert.equal(created.payload.submission.status, "pending");

  const queueDenied = await api("GET", "/api/submissions?scope=pending", { token: accounts.learner.token });
  assert.equal(queueDenied.status, 403);

  const queue = await api("GET", "/api/submissions?scope=pending", { token: accounts.mentor.token });
  assert.equal(queue.status, 200);
  assert.ok(queue.payload.submissions.some((entry) => entry.id === submissionId));

  const reviewDenied = await api("POST", `/api/submissions/${submissionId}/review`, {
    token: accounts.learner.token,
    body: { ratings: { correctness: 4 } }
  });
  assert.equal(reviewDenied.status, 403);

  const review = await api("POST", `/api/submissions/${submissionId}/review`, {
    token: accounts.mentor.token,
    body: {
      ratings: { correctness: 4, depth: 3, tradeoffs: 3, communication: 4 },
      feedback: "Strong evidence, tighten the eval story."
    }
  });
  assert.equal(review.status, 200);
  assert.equal(review.payload.submission.status, "reviewed");
  assert.equal(review.payload.submission.review.passed, true);
  assert.ok(review.payload.submission.review.score > 0);

  const mine = await api("GET", "/api/submissions?scope=mine", { token: accounts.learner.token });
  assert.equal(mine.payload.submissions[0].review.feedback, "Strong evidence, tighten the eval story.");
});

test("cohorts: mentor creates, learner joins by code, stats are anonymized", async () => {
  const denied = await api("POST", "/api/cohorts", { token: accounts.learner.token, body: { name: "Nope" } });
  assert.equal(denied.status, 403);

  const created = await api("POST", "/api/cohorts", { token: accounts.mentor.token, body: { name: "Fall cohort" } });
  assert.equal(created.status, 201);
  const { id: cohortId, joinCode } = created.payload.cohort;
  assert.ok(joinCode);

  const badJoin = await api("POST", "/api/cohorts/join", { token: accounts.learner.token, body: { joinCode: "zzzz" } });
  assert.equal(badJoin.status, 404);

  const joined = await api("POST", "/api/cohorts/join", { token: accounts.learner.token, body: { joinCode } });
  assert.equal(joined.status, 200);
  assert.equal(joined.payload.cohort.memberCount, 2);
  assert.equal(joined.payload.cohort.joinCode, undefined, "join code hidden from plain members");

  const outsiderStats = await api("GET", `/api/cohorts/${cohortId}/stats`, { token: accounts.admin.token });
  assert.equal(outsiderStats.status, 403);

  const stats = await api("GET", `/api/cohorts/${cohortId}/stats`, { token: accounts.learner.token });
  assert.equal(stats.status, 200);
  assert.equal(stats.payload.cohort.memberCount, 2);
  assert.ok(Number.isFinite(stats.payload.anonymized.averageReadiness));
  assert.ok(Number.isFinite(stats.payload.you.readiness));
  assert.equal(JSON.stringify(stats.payload).includes(accounts.mentor.id), false, "no member ids leak");
});

test("static serving exposes the app shell but never data/ or the store", async () => {
  const index = await fetch(`${baseUrl}/`);
  assert.equal(index.status, 200);
  assert.match(await index.text(), /Principal Engineer Learning Path/);

  const engineJs = await fetch(`${baseUrl}/lib/engine.js`);
  assert.equal(engineJs.status, 200);

  for (const blocked of ["/data/plan.en.json", "/server/server.js", "/server/.data/store.json", "/../etc/passwd", "/%2e%2e/etc/passwd", "/.gitignore"]) {
    const response = await fetch(`${baseUrl}${blocked}`);
    assert.equal(response.status, 404, `${blocked} must not be served`);
  }
});

test("GDPR account deletion removes personal data", async () => {
  const created = await api("POST", "/api/accounts", { body: { displayName: "Ephemeral" } });
  const login = await api("POST", "/api/sessions", {
    body: { accountId: created.payload.account.id, syncKey: created.payload.syncKey }
  });
  const token = login.payload.token;
  await api("PUT", "/api/progress", { token, body: { state: { scores: { "genai-foundations": 10 } } } });

  const deleted = await api("DELETE", "/api/accounts/me", { token });
  assert.equal(deleted.status, 200);

  const afterwards = await api("GET", "/api/me", { token });
  assert.equal(afterwards.status, 401);

  const store = JSON.parse(fs.readFileSync(path.join(dataDir, "store.json"), "utf8"));
  assert.equal(store.accounts[created.payload.account.id], undefined);
  assert.equal(store.progress[created.payload.account.id], undefined);
});
