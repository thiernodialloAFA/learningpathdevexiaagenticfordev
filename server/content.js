// Content layer for the learning platform server.
//
// The versioned JSON files in data/ remain the source of truth in Git.
// Authors can publish updates through the authoring API without a code
// redeploy: published files are written to an overlay directory and take
// precedence over the repository files immediately.
//
// Learners are served *sanitized* content: quiz answer indices and
// explanations are stripped so correct answers are no longer exposed to
// the client. Scoring happens server-side (plan.md Phase 2).

const fs = require("fs");
const path = require("path");
const { CONTENT_FILES, validateContentSet } = require("../scripts/validate-content.js");

const createContentLayer = ({ repoDir, dataDir }) => {
  const baseDir = path.join(repoDir, "data");
  const overlayDir = path.join(dataDir, "content");

  const readJsonFile = (dir, file) => {
    const fullPath = path.join(dir, file);
    if (!fs.existsSync(fullPath)) return null;
    return JSON.parse(fs.readFileSync(fullPath, "utf8"));
  };

  // Effective content: overlay (published without redeploy) wins over repo data.
  const getFull = (file) => {
    if (!CONTENT_FILES.includes(file)) return null;
    const overlay = readJsonFile(overlayDir, file);
    if (overlay !== null) return overlay;
    return readJsonFile(baseDir, file);
  };

  const getFullSet = () => {
    const set = {};
    for (const file of CONTENT_FILES) set[file] = getFull(file);
    return set;
  };

  const sanitizeQuiz = (quiz) =>
    (Array.isArray(quiz) ? quiz : []).map((question) => ({
      prompt: question.prompt,
      options: question.options
    }));

  // Public view of a content file with correct answers and explanations removed.
  const getSanitized = (file) => {
    const full = getFull(file);
    if (full === null) return null;
    const clone = JSON.parse(JSON.stringify(full));
    if (Array.isArray(clone.modules)) {
      for (const module of clone.modules) module.quiz = sanitizeQuiz(module.quiz);
    }
    if (Array.isArray(clone.levels)) {
      for (const level of clone.levels) level.quiz = sanitizeQuiz(level.quiz);
    }
    return clone;
  };

  // Validates the candidate against the schema and cross-language parity
  // (using the current effective set for the other files), then publishes
  // it to the overlay directory. Returns an array of validation errors;
  // the file is only written when the array is empty.
  const publish = (file, candidate) => {
    if (!CONTENT_FILES.includes(file)) return [`${file}: unknown content file`];
    const set = getFullSet();
    set[file] = candidate;
    const errors = validateContentSet(set);
    if (errors.length > 0) return errors;
    fs.mkdirSync(overlayDir, { recursive: true });
    const fullPath = path.join(overlayDir, file);
    const tmpPath = `${fullPath}.tmp`;
    fs.writeFileSync(tmpPath, JSON.stringify(candidate, null, 2));
    fs.renameSync(tmpPath, fullPath);
    return [];
  };

  return { CONTENT_FILES, getFull, getFullSet, getSanitized, publish };
};

module.exports = { createContentLayer };
