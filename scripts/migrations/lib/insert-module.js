"use strict";

/**
 * Shared helper for content migrations that insert a new module into
 * data/plan.en.json and data/plan.fr.json while preserving strict EN/FR parity.
 *
 * A module spec looks like:
 * {
 *   id: "module-id",
 *   insertAfter: "existing-module-id" | null,   // null => insert first
 *   weeks|title|objective: { en, fr },
 *   outcomes|deliverables: { en: [...], fr: [...] },
 *   resources: [{ name, url }],
 *   quiz: { en: [...], fr: [...] },             // newly authored questions
 *   recoverFromArchive: [["source-module-id", [indices]]]  // optional
 * }
 *
 * Recovered questions are appended after the authored ones and removed from the
 * archive file so a question never exists twice.
 */

const fs = require("node:fs");
const path = require("node:path");

const ROOT = path.resolve(__dirname, "..", "..", "..");
const DATA = path.join(ROOT, "data");
const LANGS = ["en", "fr"];
const DRY_RUN = process.argv.includes("--dry-run");

const planFile = (lang) => path.join(DATA, `plan.${lang}.json`);
const archiveFile = (lang) =>
  path.join(DATA, "archive", `plan-out-of-scope.${lang}.json`);

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, "utf8"));
}

function writeJson(file, value) {
  const body = `${JSON.stringify(value, null, 2)}\n`;
  if (DRY_RUN) {
    console.log(`[dry-run] would write ${file} (${body.length} bytes)`);
    return;
  }
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, body, "utf8");
}

function takeFromArchive(archive, spec) {
  const taken = [];
  for (const [moduleId, indices] of spec) {
    const source = archive.modules.find((m) => m.id === moduleId);
    if (!source) throw new Error(`Archive module not found: ${moduleId}`);
    for (const index of indices) {
      const question = source.quiz[index];
      if (!question) {
        throw new Error(`Archive question not found: ${moduleId}[${index}]`);
      }
      taken.push({ moduleId, index, question });
    }
  }
  return taken;
}

function dropFromArchive(archive, taken) {
  const byModule = new Map();
  for (const { moduleId, index } of taken) {
    if (!byModule.has(moduleId)) byModule.set(moduleId, new Set());
    byModule.get(moduleId).add(index);
  }
  archive.modules = archive.modules
    .map((m) => {
      const drop = byModule.get(m.id);
      if (!drop) return m;
      return { ...m, quiz: m.quiz.filter((_, i) => !drop.has(i)) };
    })
    .filter((m) => m.quiz.length > 0);
  return archive;
}

function assertParity(plans) {
  const [en, fr] = LANGS.map((lang) => plans[lang]);
  if (en.modules.length !== fr.modules.length) {
    throw new Error("Parity broken: module count differs");
  }
  en.modules.forEach((module, i) => {
    const other = fr.modules[i];
    if (module.id !== other.id) {
      throw new Error(`Parity broken at ${i}: ${module.id} vs ${other.id}`);
    }
    if (module.quiz.length !== other.quiz.length) {
      throw new Error(`Parity broken in ${module.id}: quiz length differs`);
    }
    module.quiz.forEach((question, q) => {
      if (question.answer !== other.quiz[q].answer) {
        throw new Error(`Parity broken in ${module.id}[${q}]: answer differs`);
      }
    });
  });
}

function insertModule(spec, label) {
  if (spec.quiz.en.length !== spec.quiz.fr.length) {
    throw new Error("Authored quiz length differs between EN and FR");
  }
  spec.quiz.en.forEach((question, i) => {
    if (question.answer !== spec.quiz.fr[i].answer) {
      throw new Error(`Authored question ${i}: answer index differs EN/FR`);
    }
  });

  const plans = {};
  const archives = {};

  for (const lang of LANGS) {
    const plan = readJson(planFile(lang));
    if (plan.modules.some((m) => m.id === spec.id)) {
      throw new Error(`Module already present: ${spec.id} (${lang})`);
    }

    let quiz = spec.quiz[lang].slice();
    if (spec.recoverFromArchive) {
      const archive = readJson(archiveFile(lang));
      const taken = takeFromArchive(archive, spec.recoverFromArchive);
      quiz = quiz.concat(taken.map((t) => t.question));
      archives[lang] = dropFromArchive(archive, taken);
    }

    const module = {
      id: spec.id,
      weeks: spec.weeks[lang],
      title: spec.title[lang],
      objective: spec.objective[lang],
      outcomes: spec.outcomes[lang],
      deliverables: spec.deliverables[lang],
      resources: spec.resources,
      quiz,
    };

    const at = spec.insertAfter
      ? plan.modules.findIndex((m) => m.id === spec.insertAfter) + 1
      : 0;
    if (spec.insertAfter && at === 0) {
      throw new Error(`insertAfter module not found: ${spec.insertAfter}`);
    }
    plan.modules.splice(at, 0, module);
    plans[lang] = plan;
  }

  assertParity(plans);

  for (const lang of LANGS) {
    writeJson(planFile(lang), plans[lang]);
    if (archives[lang]) writeJson(archiveFile(lang), archives[lang]);
  }

  const inserted = plans.en.modules.find((m) => m.id === spec.id);
  console.log(label);
  console.log(
    `  inserted ${spec.id} after ${spec.insertAfter ?? "(start)"} — ${inserted.quiz.length} questions, ${spec.resources.length} resources`
  );
  console.log(`  plan now has ${plans.en.modules.length} modules`);
  if (DRY_RUN) console.log("  (dry run, nothing written)");
}

/**
 * Append newly authored questions to an existing module, in strict EN/FR parity.
 *
 * spec = {
 *   moduleId: "genai-evaluation",
 *   resources: [{ name, url }],          // optional, appended if not already present
 *   outcomes: { en: [...], fr: [...] },  // optional, replaces outcomes
 *   quiz: { en: [...], fr: [...] }
 * }
 */
function appendQuestions(spec, label) {
  if (spec.quiz.en.length !== spec.quiz.fr.length) {
    throw new Error("Authored quiz length differs between EN and FR");
  }
  spec.quiz.en.forEach((question, i) => {
    if (question.answer !== spec.quiz.fr[i].answer) {
      throw new Error(`Authored question ${i}: answer index differs EN/FR`);
    }
    if (question.answer < 0 || question.answer >= question.options.length) {
      throw new Error(`Authored question ${i}: answer index out of range`);
    }
  });

  const plans = {};
  for (const lang of LANGS) {
    const plan = readJson(planFile(lang));
    const module = plan.modules.find((m) => m.id === spec.moduleId);
    if (!module) throw new Error(`Module not found: ${spec.moduleId} (${lang})`);

    const seen = new Set(module.quiz.map((q) => q.prompt));
    for (const question of spec.quiz[lang]) {
      if (seen.has(question.prompt)) {
        throw new Error(`Duplicate prompt in ${spec.moduleId}: ${question.prompt}`);
      }
      module.quiz.push(question);
    }
    if (spec.outcomes) module.outcomes = spec.outcomes[lang];
    if (spec.resources) {
      const urls = new Set(module.resources.map((r) => r.url));
      for (const resource of spec.resources) {
        if (!urls.has(resource.url)) module.resources.push(resource);
      }
    }
    plans[lang] = plan;
  }

  assertParity(plans);
  for (const lang of LANGS) writeJson(planFile(lang), plans[lang]);

  const module = plans.en.modules.find((m) => m.id === spec.moduleId);
  console.log(label);
  console.log(
    `  ${spec.moduleId}: +${spec.quiz.en.length} questions -> ${module.quiz.length} total, ${module.resources.length} resources`
  );
  if (DRY_RUN) console.log("  (dry run, nothing written)");
}

module.exports = { insertModule, appendQuestions, readJson, writeJson, assertParity, LANGS, DATA, planFile, archiveFile, DRY_RUN };



