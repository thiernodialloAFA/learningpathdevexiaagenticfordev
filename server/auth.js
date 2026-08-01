// Passwordless authentication for the learning platform server.
//
// Accounts use generated sync keys instead of user-chosen passwords (the
// plan explicitly rules out home-grown password management): the server
// generates a high-entropy key at signup, stores only a scrypt hash of it,
// and the learner keeps the key to sign in from any device. Sessions are
// bearer tokens stored hashed (SHA-256) with an expiry. In a hosted
// production deployment this module is the seam where an OIDC provider
// (GitHub/Google) plugs in, as described in plan.md §4.5.

const crypto = require("crypto");

const ROLES = ["learner", "author", "mentor", "admin"];
const SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 days
const SCRYPT_KEYLEN = 32;

const hashKey = (syncKey, salt) =>
  crypto.scryptSync(syncKey, salt, SCRYPT_KEYLEN).toString("hex");

const hashToken = (token) => crypto.createHash("sha256").update(token).digest("hex");

const publicAccount = (account) => ({
  id: account.id,
  displayName: account.displayName,
  role: account.role,
  createdAt: account.createdAt
});

const createAccount = (store, { displayName }) => {
  const id = `acct-${crypto.randomBytes(6).toString("hex")}`;
  const syncKey = crypto.randomBytes(24).toString("base64url");
  const salt = crypto.randomBytes(16).toString("hex");
  const isFirstAccount = Object.keys(store.data.accounts).length === 0;
  const account = {
    id,
    displayName: typeof displayName === "string" && displayName.trim() ? displayName.trim().slice(0, 80) : "Learner",
    role: isFirstAccount ? "admin" : "learner",
    keySalt: salt,
    keyHash: hashKey(syncKey, salt),
    createdAt: new Date().toISOString()
  };
  store.data.accounts[id] = account;
  store.save();
  return { account: publicAccount(account), syncKey };
};

const verifySyncKey = (account, syncKey) => {
  if (!account || typeof syncKey !== "string" || syncKey.length === 0 || syncKey.length > 256) return false;
  const candidate = Buffer.from(hashKey(syncKey, account.keySalt), "hex");
  const expected = Buffer.from(account.keyHash, "hex");
  return candidate.length === expected.length && crypto.timingSafeEqual(candidate, expected);
};

const createSession = (store, accountId) => {
  const token = crypto.randomBytes(32).toString("hex");
  store.data.sessions[hashToken(token)] = {
    accountId,
    expiresAt: new Date(Date.now() + SESSION_TTL_MS).toISOString()
  };
  store.save();
  return token;
};

const destroySession = (store, token) => {
  if (typeof token !== "string") return;
  if (store.data.sessions[hashToken(token)]) {
    delete store.data.sessions[hashToken(token)];
    store.save();
  }
};

const bearerToken = (req) => {
  const header = req.headers.authorization || "";
  if (!header.startsWith("Bearer ")) return null;
  const token = header.slice("Bearer ".length).trim();
  return /^[a-f0-9]{64}$/.test(token) ? token : null;
};

// Returns the authenticated account for the request, or null.
const authenticate = (store, req) => {
  const token = bearerToken(req);
  if (!token) return null;
  const session = store.data.sessions[hashToken(token)];
  if (!session) return null;
  if (Date.parse(session.expiresAt) < Date.now()) {
    delete store.data.sessions[hashToken(token)];
    store.save();
    return null;
  }
  return store.data.accounts[session.accountId] || null;
};

const hasRole = (account, ...roles) => Boolean(account) && roles.includes(account.role);

// Simple fixed-window rate limiter, keyed by client address, to slow down
// brute-force attempts against account creation and sign-in.
const createRateLimiter = ({ max, windowMs }) => {
  const hits = new Map();
  return (key) => {
    const now = Date.now();
    const entry = hits.get(key);
    if (!entry || entry.resetAt <= now) {
      hits.set(key, { count: 1, resetAt: now + windowMs });
      return true;
    }
    entry.count += 1;
    return entry.count <= max;
  };
};

module.exports = {
  ROLES,
  createAccount,
  verifySyncKey,
  createSession,
  destroySession,
  authenticate,
  hasRole,
  publicAccount,
  createRateLimiter
};
