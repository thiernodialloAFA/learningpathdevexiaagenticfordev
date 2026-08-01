#!/usr/bin/env node
// Learning platform server (plan.md Phases 2 and 4).
//
// A dependency-free Node.js server that hosts the static app and a JSON
// REST API providing: passwordless accounts and sessions, cross-device
// progress sync (including import of the legacy localStorage export),
// server-side quiz scoring with sanitized content (answers are never sent
// to the client), schema-validated authoring with publish-without-redeploy,
// deliverable/capstone submissions with rubric reviews (mentoring), and
// cohorts with anonymized comparison.
//
// Usage:
//   node server/server.js                # http://127.0.0.1:4173
//   PORT=8080 HOST=0.0.0.0 node server/server.js
//   DATA_DIR=/var/lib/learning node server/server.js
//
// The first account created becomes the administrator.

const http = require("http");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const engine = require("../lib/engine.js");
const { createStore } = require("./store.js");
const { createContentLayer } = require("./content.js");
const auth = require("./auth.js");

const REPO_DIR = path.join(__dirname, "..");
const DATA_DIR = process.env.DATA_DIR || path.join(__dirname, ".data");
const HOST = process.env.HOST || "127.0.0.1";
const PORT = Number(process.env.PORT) || 4173;

const JSON_BODY_LIMIT = 512 * 1024; // 512 KB
const AUTHORING_BODY_LIMIT = 8 * 1024 * 1024; // 8 MB
const MAX_ANSWERS = 200;
const ATTEMPT_HISTORY_LIMIT = 200;

const LANGUAGES = ["en", "fr"];

class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

const createApp = ({ dataDir = DATA_DIR } = {}) => {
  fs.mkdirSync(dataDir, { recursive: true });
  const store = createStore(dataDir);
  const content = createContentLayer({ repoDir: REPO_DIR, dataDir });
  const authLimiter = auth.createRateLimiter({ max: 20, windowMs: 10 * 60 * 1000 });

  // -------------------------------------------------------------------------
  // Helpers
  // -------------------------------------------------------------------------

  const clientKey = (req) => {
    if (process.env.TRUST_PROXY === "1") {
      const forwarded = req.headers["x-forwarded-for"];
      if (typeof forwarded === "string" && forwarded.length > 0) return forwarded.split(",")[0].trim();
    }
    return req.socket.remoteAddress || "unknown";
  };

  const sendJson = (res, status, payload) => {
    const body = JSON.stringify(payload);
    res.writeHead(status, {
      "Content-Type": "application/json; charset=utf-8",
      "Content-Length": Buffer.byteLength(body),
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff"
    });
    res.end(body);
  };

  const readJsonBody = (req, limit = JSON_BODY_LIMIT) =>
    new Promise((resolve, reject) => {
      let size = 0;
      const chunks = [];
      req.on("data", (chunk) => {
        size += chunk.length;
        if (size > limit) {
          reject(new HttpError(413, "Payload too large"));
          req.destroy();
          return;
        }
        chunks.push(chunk);
      });
      req.on("end", () => {
        if (chunks.length === 0) {
          resolve({});
          return;
        }
        try {
          resolve(JSON.parse(Buffer.concat(chunks).toString("utf8")));
        } catch (error) {
          reject(new HttpError(400, "Invalid JSON body"));
        }
      });
      req.on("error", reject);
    });

  const requireAccount = (req) => {
    const account = auth.authenticate(store, req);
    if (!account) throw new HttpError(401, "Authentication required");
    return account;
  };

  const requireRole = (req, ...roles) => {
    const account = requireAccount(req);
    if (!auth.hasRole(account, ...roles)) throw new HttpError(403, "Insufficient role");
    return account;
  };

  const languageOf = (body) => (LANGUAGES.includes(body.language) ? body.language : "en");

  const validAnswers = (answers) =>
    Array.isArray(answers) &&
    answers.length <= MAX_ANSWERS &&
    answers.every((value) => value === null || (Number.isInteger(value) && value >= 0 && value < 50));

  const getProgress = (accountId) => {
    const record = store.data.progress[accountId];
    return {
      state: engine.normalizeState(record ? record.state : {}),
      updatedAt: record ? record.updatedAt : null
    };
  };

  const putProgress = (accountId, state) => {
    const merged = engine.mergeProgress(getProgress(accountId).state, state);
    store.data.progress[accountId] = { state: merged, updatedAt: new Date().toISOString() };
    store.save();
    return store.data.progress[accountId];
  };

  const passThreshold = () => {
    const settings = content.getFull("academy-settings.json");
    return settings && Number.isInteger(settings.passThreshold) ? settings.passThreshold : 80;
  };

  // Scores a quiz attempt against the effective (full) content.
  const scoreAttempt = (body) => {
    const language = languageOf(body);
    if (!validAnswers(body.answers)) throw new HttpError(400, "answers must be an array of option indexes or nulls");

    if (body.kind === "module") {
      const plan = content.getFull(`plan.${language}.json`);
      const module = plan && plan.modules.find((entry) => entry.id === body.id);
      if (!module) throw new HttpError(404, "Unknown module");
      if (body.answers.length !== module.quiz.length) throw new HttpError(400, "answers length mismatch");
      return { kind: "module", refId: module.id, result: engine.scoreQuiz(module.quiz, body.answers) };
    }

    if (body.kind === "academy") {
      const academy = content.getFull(`academy.${language}.json`);
      const level = academy && academy.levels.find((entry) => entry.id === body.id);
      if (!level) throw new HttpError(404, "Unknown academy level");
      if (body.answers.length !== level.quiz.length) throw new HttpError(400, "answers length mismatch");
      return { kind: "academy", refId: level.id, result: engine.scoreQuiz(level.quiz, body.answers) };
    }

    if (body.kind === "interview") {
      const plan = content.getFull(`plan.${language}.json`);
      if (!plan) throw new HttpError(500, "Content unavailable");
      const items = Array.isArray(body.items) ? body.items : [];
      if (items.length === 0 || items.length > MAX_ANSWERS || items.length !== body.answers.length) {
        throw new HttpError(400, "items must be a non-empty array matching answers");
      }
      for (const item of items) {
        const module = plan.modules.find((entry) => entry.id === item.moduleId);
        if (!module || !Number.isInteger(item.questionIndex) || item.questionIndex < 0 || item.questionIndex >= module.quiz.length) {
          throw new HttpError(400, "items reference unknown questions");
        }
      }
      return { kind: "interview", refId: "interview", result: engine.scoreInterview({ modules: plan.modules, items, answers: body.answers }) };
    }

    throw new HttpError(400, "kind must be module, academy, or interview");
  };

  // -------------------------------------------------------------------------
  // API routes
  // -------------------------------------------------------------------------

  const routes = [];
  const route = (method, pattern, handler) => routes.push({ method, pattern, handler });

  route("GET", /^\/api\/health$/, async () => ({
    status: 200,
    payload: { ok: true, name: "learning-path-server", now: new Date().toISOString() }
  }));

  route("GET", /^\/api\/content\/(?<file>[a-z.-]+\.json)$/, async (req, params) => {
    const sanitized = content.getSanitized(params.file);
    if (sanitized === null) throw new HttpError(404, "Unknown content file");
    return { status: 200, payload: sanitized };
  });

  // Anonymous, stateless scoring: lets visitors score quizzes in server mode
  // without exposing answers and without creating an account.
  route("POST", /^\/api\/score$/, async (req) => {
    const body = await readJsonBody(req);
    const { result } = scoreAttempt(body);
    return { status: 200, payload: { ...result, passThreshold: passThreshold() } };
  });

  route("POST", /^\/api\/accounts$/, async (req) => {
    if (!authLimiter(clientKey(req))) throw new HttpError(429, "Too many requests, retry later");
    const body = await readJsonBody(req);
    const { account, syncKey } = auth.createAccount(store, { displayName: body.displayName });
    return { status: 201, payload: { account, syncKey } };
  });

  route("POST", /^\/api\/sessions$/, async (req) => {
    if (!authLimiter(clientKey(req))) throw new HttpError(429, "Too many requests, retry later");
    const body = await readJsonBody(req);
    const account = typeof body.accountId === "string" ? store.data.accounts[body.accountId] : null;
    if (!auth.verifySyncKey(account, body.syncKey)) throw new HttpError(401, "Invalid account id or sync key");
    const token = auth.createSession(store, account.id);
    return { status: 201, payload: { token, account: auth.publicAccount(account) } };
  });

  route("DELETE", /^\/api\/sessions$/, async (req) => {
    requireAccount(req);
    const header = req.headers.authorization || "";
    auth.destroySession(store, header.slice("Bearer ".length).trim());
    return { status: 200, payload: { ok: true } };
  });

  route("GET", /^\/api\/me$/, async (req) => {
    const account = requireAccount(req);
    return { status: 200, payload: { account: auth.publicAccount(account) } };
  });

  // GDPR: full deletion of the account and its personal data.
  route("DELETE", /^\/api\/accounts\/me$/, async (req) => {
    const account = requireAccount(req);
    delete store.data.accounts[account.id];
    delete store.data.progress[account.id];
    for (const [tokenHash, session] of Object.entries(store.data.sessions)) {
      if (session.accountId === account.id) delete store.data.sessions[tokenHash];
    }
    store.data.attempts = store.data.attempts.filter((attempt) => attempt.accountId !== account.id);
    store.data.submissions = store.data.submissions.filter((submission) => submission.accountId !== account.id);
    for (const cohort of Object.values(store.data.cohorts)) {
      cohort.members = cohort.members.filter((member) => member !== account.id);
      if (cohort.createdBy === account.id) cohort.createdBy = null;
    }
    store.save();
    return { status: 200, payload: { ok: true } };
  });

  route("GET", /^\/api\/accounts$/, async (req) => {
    requireRole(req, "admin");
    const accounts = Object.values(store.data.accounts).map(auth.publicAccount);
    return { status: 200, payload: { accounts } };
  });

  route("PUT", /^\/api\/accounts\/(?<id>acct-[a-f0-9]+)\/role$/, async (req, params) => {
    requireRole(req, "admin");
    const body = await readJsonBody(req);
    const target = store.data.accounts[params.id];
    if (!target) throw new HttpError(404, "Unknown account");
    if (!auth.ROLES.includes(body.role)) throw new HttpError(400, `role must be one of: ${auth.ROLES.join(", ")}`);
    target.role = body.role;
    store.save();
    return { status: 200, payload: { account: auth.publicAccount(target) } };
  });

  route("GET", /^\/api\/progress$/, async (req) => {
    const account = requireAccount(req);
    return { status: 200, payload: getProgress(account.id) };
  });

  // Merge-write progress (multi-device sync): completion flags OR, best
  // scores win, attempt history keeps the freshest entries.
  route("PUT", /^\/api\/progress$/, async (req) => {
    const account = requireAccount(req);
    const body = await readJsonBody(req);
    if (!body.state || typeof body.state !== "object") throw new HttpError(400, "state object required");
    const record = putProgress(account.id, body.state);
    return { status: 200, payload: record };
  });

  // Import of the legacy localStorage export produced by the static app.
  route("POST", /^\/api\/progress\/import$/, async (req) => {
    const account = requireAccount(req);
    const body = await readJsonBody(req);
    const state = body.state && typeof body.state === "object" ? body.state : body;
    if (!state || typeof state !== "object") throw new HttpError(400, "state object required");
    const record = putProgress(account.id, state);
    return { status: 200, payload: record };
  });

  route("POST", /^\/api\/attempts$/, async (req) => {
    const account = requireAccount(req);
    const body = await readJsonBody(req);
    const { kind, refId, result } = scoreAttempt(body);
    const at = new Date().toISOString();

    let state = getProgress(account.id).state;
    state = engine.recordAttempt(state, refId, result.score, at);
    if (kind === "module") {
      state.scores[refId] = Math.max(state.scores[refId] ?? 0, result.score);
    } else if (kind === "academy") {
      state.academy[refId] = Math.max(state.academy[refId] ?? 0, result.score);
    } else if (kind === "interview") {
      state.interviews = [...state.interviews, { at, score: result.score, total: result.total, rubric: result.rubric }].slice(-20);
    }
    store.data.progress[account.id] = { state: engine.normalizeState(state), updatedAt: at };

    store.data.attempts.push({
      id: `att-${crypto.randomBytes(6).toString("hex")}`,
      accountId: account.id,
      kind,
      refId,
      score: result.score,
      correct: result.correct,
      total: result.total,
      at
    });
    const mine = store.data.attempts.filter((attempt) => attempt.accountId === account.id);
    if (mine.length > ATTEMPT_HISTORY_LIMIT) {
      const cutoff = mine.length - ATTEMPT_HISTORY_LIMIT;
      const stale = new Set(mine.slice(0, cutoff).map((attempt) => attempt.id));
      store.data.attempts = store.data.attempts.filter((attempt) => !stale.has(attempt.id));
    }
    store.save();
    return {
      status: 201,
      payload: { ...result, kind, refId, at, passThreshold: passThreshold(), state: store.data.progress[account.id].state }
    };
  });

  route("GET", /^\/api\/attempts$/, async (req) => {
    const account = requireAccount(req);
    const attempts = store.data.attempts.filter((attempt) => attempt.accountId === account.id).slice(-100).reverse();
    return { status: 200, payload: { attempts } };
  });

  // ----- Authoring (Phase 2): validated publish without redeploy -----------

  route("GET", /^\/api\/authoring\/content\/(?<file>[a-z.-]+\.json)$/, async (req, params) => {
    requireRole(req, "author", "admin");
    const full = content.getFull(params.file);
    if (full === null) throw new HttpError(404, "Unknown content file");
    return { status: 200, payload: full };
  });

  route("PUT", /^\/api\/authoring\/content\/(?<file>[a-z.-]+\.json)$/, async (req, params) => {
    requireRole(req, "author", "admin");
    const candidate = await readJsonBody(req, AUTHORING_BODY_LIMIT);
    const errors = content.publish(params.file, candidate);
    if (errors.length > 0) return { status: 422, payload: { ok: false, errors } };
    return { status: 200, payload: { ok: true, file: params.file, publishedAt: new Date().toISOString() } };
  });

  // ----- Submissions and rubric reviews (Phase 4: mentoring) ---------------

  const publicSubmission = (submission) => ({ ...submission });

  route("POST", /^\/api\/submissions$/, async (req) => {
    const account = requireAccount(req);
    const body = await readJsonBody(req);
    const plan = content.getFull("plan.en.json");
    const module = plan && plan.modules.find((entry) => entry.id === body.moduleId);
    if (!module) throw new HttpError(400, "Unknown moduleId");
    const deliverable = typeof body.deliverable === "string" ? body.deliverable.trim().slice(0, 2000) : "";
    if (!deliverable) throw new HttpError(400, "deliverable text required");
    const url = typeof body.url === "string" && /^https:\/\/[^\s]+$/.test(body.url) ? body.url.slice(0, 500) : null;
    const submission = {
      id: `sub-${crypto.randomBytes(6).toString("hex")}`,
      accountId: account.id,
      moduleId: module.id,
      deliverable,
      url,
      status: "pending",
      createdAt: new Date().toISOString(),
      review: null
    };
    store.data.submissions.push(submission);
    store.save();
    return { status: 201, payload: { submission: publicSubmission(submission) } };
  });

  route("GET", /^\/api\/submissions$/, async (req) => {
    const account = requireAccount(req);
    const url = new URL(req.url, "http://localhost");
    const scope = url.searchParams.get("scope") || "mine";
    if (scope === "mine") {
      const submissions = store.data.submissions.filter((entry) => entry.accountId === account.id).reverse();
      return { status: 200, payload: { submissions: submissions.map(publicSubmission) } };
    }
    if (scope === "pending" || scope === "all") {
      if (!auth.hasRole(account, "mentor", "admin")) throw new HttpError(403, "Insufficient role");
      const submissions = store.data.submissions
        .filter((entry) => (scope === "pending" ? entry.status === "pending" : true))
        .reverse();
      return { status: 200, payload: { submissions: submissions.map(publicSubmission) } };
    }
    throw new HttpError(400, "scope must be mine, pending, or all");
  });

  route("POST", /^\/api\/submissions\/(?<id>sub-[a-f0-9]+)\/review$/, async (req, params) => {
    const reviewer = requireRole(req, "mentor", "admin");
    const body = await readJsonBody(req);
    const submission = store.data.submissions.find((entry) => entry.id === params.id);
    if (!submission) throw new HttpError(404, "Unknown submission");
    const rubric = engine.scoreRubric(body.ratings);
    const feedback = typeof body.feedback === "string" ? body.feedback.trim().slice(0, 2000) : "";
    submission.status = "reviewed";
    submission.review = {
      reviewerId: reviewer.id,
      ratings: rubric.perDimension,
      score: rubric.score,
      passed: rubric.passed,
      feedback,
      at: new Date().toISOString()
    };
    store.save();
    return { status: 200, payload: { submission: publicSubmission(submission) } };
  });

  // ----- Cohorts (Phase 4: study groups, anonymized comparison) ------------

  const cohortSummary = (cohort, account) => ({
    id: cohort.id,
    name: cohort.name,
    memberCount: cohort.members.length,
    createdAt: cohort.createdAt,
    joinCode: cohort.createdBy === account.id || auth.hasRole(account, "mentor", "admin") ? cohort.joinCode : undefined
  });

  route("POST", /^\/api\/cohorts$/, async (req) => {
    const account = requireRole(req, "mentor", "admin");
    const body = await readJsonBody(req);
    const name = typeof body.name === "string" ? body.name.trim().slice(0, 80) : "";
    if (!name) throw new HttpError(400, "name required");
    const cohort = {
      id: `coh-${crypto.randomBytes(6).toString("hex")}`,
      name,
      joinCode: crypto.randomBytes(4).toString("hex"),
      createdBy: account.id,
      createdAt: new Date().toISOString(),
      members: [account.id]
    };
    store.data.cohorts[cohort.id] = cohort;
    store.save();
    return { status: 201, payload: { cohort: cohortSummary(cohort, account) } };
  });

  route("POST", /^\/api\/cohorts\/join$/, async (req) => {
    const account = requireAccount(req);
    const body = await readJsonBody(req);
    const cohort = Object.values(store.data.cohorts).find(
      (entry) => typeof body.joinCode === "string" && entry.joinCode === body.joinCode.trim().toLowerCase()
    );
    if (!cohort) throw new HttpError(404, "Unknown join code");
    if (!cohort.members.includes(account.id)) {
      cohort.members.push(account.id);
      store.save();
    }
    return { status: 200, payload: { cohort: cohortSummary(cohort, account) } };
  });

  route("GET", /^\/api\/cohorts$/, async (req) => {
    const account = requireAccount(req);
    const cohorts = Object.values(store.data.cohorts)
      .filter((cohort) => cohort.members.includes(account.id))
      .map((cohort) => cohortSummary(cohort, account));
    return { status: 200, payload: { cohorts } };
  });

  // Anonymized aggregates only: no member identities or per-member data.
  route("GET", /^\/api\/cohorts\/(?<id>coh-[a-f0-9]+)\/stats$/, async (req, params) => {
    const account = requireAccount(req);
    const cohort = store.data.cohorts[params.id];
    if (!cohort) throw new HttpError(404, "Unknown cohort");
    if (!cohort.members.includes(account.id)) throw new HttpError(403, "Not a cohort member");

    const plan = content.getFull("plan.en.json");
    const academy = content.getFull("academy.en.json");
    const threshold = passThreshold();
    const modules = plan ? plan.modules : [];
    const levels = academy ? academy.levels : [];

    const readinessOf = (accountId) => {
      const { state } = getProgress(accountId);
      return engine.computeReadiness({ modules, academyLevels: levels, state, passThreshold: threshold });
    };

    const readinessScores = cohort.members.map((member) => readinessOf(member).score);
    const average = (values) => (values.length ? Math.round(values.reduce((sum, value) => sum + value, 0) / values.length) : 0);
    const distribution = { "0-25": 0, "26-50": 0, "51-75": 0, "76-100": 0 };
    for (const score of readinessScores) {
      if (score <= 25) distribution["0-25"] += 1;
      else if (score <= 50) distribution["26-50"] += 1;
      else if (score <= 75) distribution["51-75"] += 1;
      else distribution["76-100"] += 1;
    }

    return {
      status: 200,
      payload: {
        cohort: { id: cohort.id, name: cohort.name, memberCount: cohort.members.length },
        anonymized: {
          averageReadiness: average(readinessScores),
          readinessDistribution: distribution
        },
        you: { readiness: readinessOf(account.id).score }
      }
    };
  });

  // -------------------------------------------------------------------------
  // Static file serving (the same app that GitHub Pages hosts). The data/
  // directory is intentionally NOT served: in server mode the client loads
  // sanitized content from /api/content/ so answers stay server-side.
  // -------------------------------------------------------------------------

  const STATIC_FILES = new Set(["index.html", "app.js", "styles.css", "sw.js", "manifest.webmanifest"]);
  const STATIC_DIRS = new Set(["lib", "icons"]);
  const CONTENT_TYPES = {
    ".html": "text/html; charset=utf-8",
    ".js": "text/javascript; charset=utf-8",
    ".css": "text/css; charset=utf-8",
    ".json": "application/json; charset=utf-8",
    ".webmanifest": "application/manifest+json; charset=utf-8",
    ".svg": "image/svg+xml"
  };

  const serveStatic = (req, res) => {
    let pathname;
    try {
      pathname = decodeURIComponent(new URL(req.url, "http://localhost").pathname);
    } catch (error) {
      sendJson(res, 400, { error: "Bad request" });
      return;
    }
    if (pathname === "/") pathname = "/index.html";
    const relative = pathname.replace(/^\/+/, "");
    const segments = relative.split("/");
    const allowed =
      (segments.length === 1 && STATIC_FILES.has(segments[0])) ||
      (segments.length === 2 && STATIC_DIRS.has(segments[0]) && /^[\w.-]+$/.test(segments[1]));
    const fullPath = path.resolve(REPO_DIR, relative);
    if (!allowed || !fullPath.startsWith(REPO_DIR + path.sep) || !fs.existsSync(fullPath) || !fs.statSync(fullPath).isFile()) {
      sendJson(res, 404, { error: "Not found" });
      return;
    }
    const body = fs.readFileSync(fullPath);
    res.writeHead(200, {
      "Content-Type": CONTENT_TYPES[path.extname(fullPath)] || "application/octet-stream",
      "Content-Length": body.length,
      "Cache-Control": "no-cache",
      "X-Content-Type-Options": "nosniff",
      "Referrer-Policy": "no-referrer",
      "Content-Security-Policy":
        "default-src 'self'; img-src 'self' data:; style-src 'self' 'unsafe-inline'; script-src 'self'; connect-src 'self'; object-src 'none'; base-uri 'self'; frame-ancestors 'none'"
    });
    res.end(body);
  };

  const handler = async (req, res) => {
    const pathname = new URL(req.url, "http://localhost").pathname;
    if (pathname.startsWith("/api/")) {
      for (const entry of routes) {
        if (entry.method !== req.method) continue;
        const match = pathname.match(entry.pattern);
        if (!match) continue;
        try {
          const { status, payload } = await entry.handler(req, match.groups || {});
          sendJson(res, status, payload);
        } catch (error) {
          if (error instanceof HttpError) {
            sendJson(res, error.status, { error: error.message });
          } else {
            console.error(error);
            sendJson(res, 500, { error: "Internal server error" });
          }
        }
        return;
      }
      sendJson(res, 404, { error: "Unknown API route" });
      return;
    }
    if (req.method === "GET" || req.method === "HEAD") {
      serveStatic(req, res);
      return;
    }
    sendJson(res, 405, { error: "Method not allowed" });
  };

  const server = http.createServer((req, res) => {
    handler(req, res).catch((error) => {
      console.error(error);
      if (!res.headersSent) sendJson(res, 500, { error: "Internal server error" });
    });
  });

  return { server, store, content };
};

module.exports = { createApp };

if (require.main === module) {
  const { server } = createApp();
  server.listen(PORT, HOST, () => {
    console.log(`Learning platform server running at http://${HOST}:${PORT}`);
    console.log(`Data directory: ${DATA_DIR}`);
    console.log("The first account created becomes the administrator.");
  });
}
