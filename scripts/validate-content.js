#!/usr/bin/env node
// Dependency-free validation of the versioned content files in data/.
// Fails (exit code 1) when any content file is missing, malformed, or
// violates the expected schema, so CI can block invalid content.

const fs = require("fs");
const path = require("path");

const dataDir = path.join(__dirname, "..", "data");
const errors = [];

const fail = (file, message) => errors.push(`${file}: ${message}`);

const readJson = (file) => {
  const fullPath = path.join(dataDir, file);
  if (!fs.existsSync(fullPath)) {
    fail(file, "file is missing");
    return null;
  }
  try {
    return JSON.parse(fs.readFileSync(fullPath, "utf8"));
  } catch (error) {
    fail(file, `invalid JSON: ${error.message}`);
    return null;
  }
};

const isNonEmptyString = (value) => typeof value === "string" && value.trim().length > 0;

const checkStringArray = (file, value, label) => {
  if (!Array.isArray(value) || value.length === 0) {
    fail(file, `${label} must be a non-empty array`);
    return;
  }
  value.forEach((item, index) => {
    if (!isNonEmptyString(item)) fail(file, `${label}[${index}] must be a non-empty string`);
  });
};

const checkResources = (file, resources, label) => {
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

const checkQuiz = (file, quiz, label) => {
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

const validatePlan = (file) => {
  const plan = readJson(file);
  if (!plan) return null;

  ["duration", "targetRole", "readinessTarget"].forEach((key) => {
    if (!isNonEmptyString(plan[key])) fail(file, `${key} must be a non-empty string`);
  });
  checkStringArray(file, plan.goals, "goals");

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
      checkStringArray(file, module.outcomes, `${label}.outcomes`);
      checkStringArray(file, module.deliverables, `${label}.deliverables`);
      checkResources(file, module.resources, `${label}.resources`);
      checkQuiz(file, module.quiz, `${label}.quiz`);
    });
  }

  if (!Array.isArray(plan.finalAssessment) || plan.finalAssessment.length === 0) {
    fail(file, "finalAssessment must be a non-empty array");
  }
  if (!Array.isArray(plan.applicationPlan) || plan.applicationPlan.length === 0) {
    fail(file, "applicationPlan must be a non-empty array");
  }
  return plan;
};

const validateAcademy = (file) => {
  const academy = readJson(file);
  if (!academy) return null;

  if (!Array.isArray(academy.levels) || academy.levels.length === 0) {
    fail(file, "levels must be a non-empty array");
    return academy;
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
    checkStringArray(file, level.modules, `${label}.modules`);
    checkResources(file, level.resources, `${label}.resources`);
    checkQuiz(file, level.quiz, `${label}.quiz`);
  });
  return academy;
};

const validateSettings = (file) => {
  const settings = readJson(file);
  if (!settings) return null;
  if (!Number.isInteger(settings.passThreshold) || settings.passThreshold < 1 || settings.passThreshold > 100) {
    fail(file, "passThreshold must be an integer between 1 and 100");
  }
  ["siteUrl", "repoUrl"].forEach((key) => {
    if (!isNonEmptyString(settings[key]) || !/^https:\/\//.test(settings[key])) {
      fail(file, `${key} must be an https URL`);
    }
  });
  return settings;
};

const checkParity = (fileA, a, fileB, b, listKey, idKey) => {
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

const planEn = validatePlan("plan.en.json");
const planFr = validatePlan("plan.fr.json");
const academyEn = validateAcademy("academy.en.json");
const academyFr = validateAcademy("academy.fr.json");
validateSettings("academy-settings.json");

checkParity("plan.en.json", planEn, "plan.fr.json", planFr, "modules", "id");
checkParity("academy.en.json", academyEn, "academy.fr.json", academyFr, "levels", "id");

if (errors.length > 0) {
  console.error(`Content validation failed with ${errors.length} error(s):`);
  errors.forEach((error) => console.error(`  - ${error}`));
  process.exit(1);
}

console.log("Content validation passed.");
