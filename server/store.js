// Dependency-free JSON file store for the learning platform server.
// Data is kept in memory and persisted with atomic writes (tmp file +
// rename) so a crash can never leave a half-written store behind.
// PostgreSQL remains the documented scale-up path in plan.md; this store
// keeps the zero-dependency promise while providing the same entities
// (accounts, sessions, progress, attempts, submissions, cohorts).

const fs = require("fs");
const path = require("path");

const EMPTY = () => ({
  accounts: {},
  sessions: {},
  progress: {},
  attempts: [],
  submissions: [],
  cohorts: {}
});

const createStore = (dataDir) => {
  const file = path.join(dataDir, "store.json");
  let data = EMPTY();

  const load = () => {
    try {
      if (fs.existsSync(file)) {
        const parsed = JSON.parse(fs.readFileSync(file, "utf8"));
        data = { ...EMPTY(), ...parsed };
      }
    } catch (error) {
      console.error(`Could not read ${file}, starting with an empty store: ${error.message}`);
      data = EMPTY();
    }
  };

  const save = () => {
    fs.mkdirSync(dataDir, { recursive: true });
    const tmp = `${file}.tmp`;
    fs.writeFileSync(tmp, JSON.stringify(data, null, 2));
    fs.renameSync(tmp, file);
  };

  load();
  return {
    get data() {
      return data;
    },
    save
  };
};

module.exports = { createStore };
