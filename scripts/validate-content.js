#!/usr/bin/env node
// Dependency-free validation of the versioned content files in data/.
// Usable both as a CLI (fails with exit code 1 when any content file is
// missing, malformed, or violates the expected schema, so CI can block
// invalid content) and as a module: the server's authoring API reuses
// validateContentSet() to validate proposed content before publishing.

const fs = require("fs");
const path = require("path");

const CONTENT_FILES = [
  "plan.en.json",
  "plan.fr.json",
  "academy.en.json",
  "academy.fr.json",
  "academy-settings.json"
];

const isNonEmptyString = (value) => typeof value === "string" && value.trim().length > 0;

const checkStringArray = (fail, file, value, label) => {
  if (!Array.isArray(value) || value.length === 0) {
    fail(file, `${label} must be a non-empty array`);
    return;
  }
  value.forEach((item, index) => {
    if (!isNonEmptyString(item)) fail(file, `${label}[${index}] must be a non-empty string`);
  });
};

const checkResources = (fail, file, resources, label) => {
  if (!Array.isArray(resources) || resources.length === 0) {
    fail(file, `${label} must be a non-empty array`);
    return;
  }
  resources.forEach((resource, index) => {
    if (!isNonEmptyString(resource.name)) fail(file, `${label}[${index}].name must be a non-empty string`);
    if (!isNonEmptyString(resource.url) || !/^https:\/\//.test(resource.url)) {
      fail(file, `${label}[${index}].url must be an https URL`);
    }
  });
};

const checkQuiz = (fail, file, quiz, label) => {
  if (!Array.isArray(quiz) || quiz.length === 0) {
    fail(file, `${label} must be a non-empty array`);
    return;
  }
  quiz.forEach((question, index) => {
    const qLabel = `${label}[${index}]`;
    if (!isNonEmptyString(question.prompt)) fail(file, `${qLabel}.prompt must be a non-empty string`);
    if (!Array.isArray(question.options) || question.options.length < 2) {
      fail(file, `${qLabel}.options must contain at least 2 options`);
    }
    if (!Number.isInteger(question.answer) || question.answer < 0 || question.answer >= (question.options || []).length) {
      fail(file, `${qLabel}.answer must be a valid option index`);
    }
    if (!isNonEmptyString(question.explanation)) fail(file, `${qLabel}.explanation must be a non-empty string`);
  });
};

const validatePlan = (fail, file, plan) => {
  if (!plan) return;

  ["duration", "targetRole", "readinessTarget"].forEach((key) => {
    if (!isNonEmptyString(plan[key])) fail(file, `${key} must be a non-empty string`);
  });
  checkStringArray(fail, file, plan.goals, "goals");

  if (!Array.isArray(plan.modules) || plan.modules.length === 0) {
    fail(file, "modules must be a non-empty array");
  } else {
    const ids = new Set();
    plan.modules.forEach((module, index) => {
      const label = `modules[${index}]`;
      if (!isNonEmptyString(module.id)) {
        fail(file, `${label}.id must be a non-empty string`);
      } else if (ids.has(module.id)) {
        fail(file, `${label}.id "${module.id}" is duplicated`);
      } else {
        ids.add(module.id);
      }
      ["weeks", "title", "objective"].forEach((key) => {
        if (!isNonEmptyString(module[key])) fail(file, `${label}.${key} must be a non-empty string`);
      });
      checkStringArray(fail, file, module.outcomes, `${label}.outcomes`);
      checkStringArray(fail, file, module.deliverables, `${label}.deliverables`);
      checkResources(fail, file, module.resources, `${label}.resources`);
      checkQuiz(fail, file, module.quiz, `${label}.quiz`);
    });
  }

  if (!Array.isArray(plan.finalAssessment) || plan.finalAssessment.length === 0) {
    fail(file, "finalAssessment must be a non-empty array");
  }
  if (!Array.isArray(plan.applicationPlan) || plan.applicationPlan.length === 0) {
    fail(file, "applicationPlan must be a non-empty array");
  }
};

const validateAcademy = (fail, file, academy) => {
  if (!academy) return;

  if (!Array.isArray(academy.levels) || academy.levels.length === 0) {
    fail(file, "levels must be a non-empty array");
    return;
  }
  const ids = new Set();
  academy.levels.forEach((level, index) => {
    const label = `levels[${index}]`;
    if (!isNonEmptyString(level.id)) {
      fail(file, `${label}.id must be a non-empty string`);
    } else if (ids.has(level.id)) {
      fail(file, `${label}.id "${level.id}" is duplicated`);
    } else {
      ids.add(level.id);
    }
    ["icon", "rank", "title", "focus"].forEach((key) => {
      if (!isNonEmptyString(level[key])) fail(file, `${label}.${key} must be a non-empty string`);
    });
    checkStringArray(fail, file, level.modules, `${label}.modules`);
    checkResources(fail, file, level.resources, `${label}.resources`);
    checkQuiz(fail, file, level.quiz, `${label}.quiz`);
  });
};

const validateSettings = (fail, file, settings) => {
  if (!settings) return;
  if (!Number.isInteger(settings.passThreshold) || settings.passThreshold < 1 || settings.passThreshold > 100) {
    fail(file, "passThreshold must be an integer between 1 and 100");
  }
  ["siteUrl", "repoUrl"].forEach((key) => {
    if (!isNonEmptyString(settings[key]) || !/^https:\/\//.test(settings[key])) {
      fail(file, `${key} must be an https URL`);
    }
  });
};

const checkParity = (fail, fileA, a, fileB, b, listKey, idKey) => {
  if (!a || !b || !Array.isArray(a[listKey]) || !Array.isArray(b[listKey])) return;
  if (a[listKey].length !== b[listKey].length) {
    fail(fileB, `${listKey} count differs from ${fileA} (${b[listKey].length} vs ${a[listKey].length})`);
    return;
  }
  a[listKey].forEach((entry, index) => {
    const other = b[listKey][index];
    if (entry[idKey] !== other[idKey]) {
      fail(fileB, `${listKey}[${index}].${idKey} "${other[idKey]}" differs from ${fileA} "${entry[idKey]}"`);
    }
  });
};

// Validates a full set of parsed content objects keyed by file name.
// Returns an array of error strings (empty when the set is valid).
const validateContentSet = (contents) => {
  const errors = [];
  const fail = (file, message) => errors.push(`${file}: ${message}`);
  const source = contents || {};

  for (const file of CONTENT_FILES) {
    if (source[file] === undefined || source[file] === null) fail(file, "file is missing");
  }

  validatePlan(fail, "plan.en.json", source["plan.en.json"]);
  validatePlan(fail, "plan.fr.json", source["plan.fr.json"]);
  validateAcademy(fail, "academy.en.json", source["academy.en.json"]);
  validateAcademy(fail, "academy.fr.json", source["academy.fr.json"]);
  validateSettings(fail, "academy-settings.json", source["academy-settings.json"]);

  checkParity(fail, "plan.en.json", source["plan.en.json"], "plan.fr.json", source["plan.fr.json"], "modules", "id");
  checkParity(
    fail,
    "academy.en.json",
    source["academy.en.json"],
    "academy.fr.json",
    source["academy.fr.json"],
    "levels",
    "id"
  );

  return errors;
};

// Reads the content files from a directory into a { fileName: object } map.
// Parse or read failures are reported through the errors array.
const readContentDir = (dataDir, errors) => {
  const contents = {};
  for (const file of CONTENT_FILES) {
    const fullPath = path.join(dataDir, file);
    if (!fs.existsSync(fullPath)) continue;
    try {
      contents[file] = JSON.parse(fs.readFileSync(fullPath, "utf8"));
    } catch (error) {
      errors.push(`${file}: invalid JSON: ${error.message}`);
    }
  }
  return contents;
};

module.exports = { CONTENT_FILES, validateContentSet, readContentDir };

if (require.main === module) {
  const dataDir = path.join(__dirname, "..", "data");
  const parseErrors = [];
  const contents = readContentDir(dataDir, parseErrors);
  const errors = [...parseErrors, ...validateContentSet(contents)];

  if (errors.length > 0) {
    console.error(`Content validation failed with ${errors.length} error(s):`);
    errors.forEach((error) => console.error(`  - ${error}`));
    process.exit(1);
  }

  console.log("Content validation passed.");
}
