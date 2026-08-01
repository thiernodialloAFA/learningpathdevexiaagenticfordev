const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { execFileSync } = require("node:child_process");

const rootDir = path.join(__dirname, "..");
const dataDir = path.join(rootDir, "data");

const readJson = (file) => JSON.parse(fs.readFileSync(path.join(dataDir, file), "utf8"));

const contentFiles = [
  "plan.en.json",
  "plan.fr.json",
  "academy.en.json",
  "academy.fr.json",
  "academy-settings.json"
];

test("all content files exist and are valid JSON", () => {
  for (const file of contentFiles) {
    assert.ok(fs.existsSync(path.join(dataDir, file)), `${file} exists`);
    assert.doesNotThrow(() => readJson(file), `${file} parses as JSON`);
  }
});

test("content validation script passes", () => {
  const output = execFileSync(process.execPath, [path.join(rootDir, "scripts", "validate-content.js")], {
    encoding: "utf8"
  });
  assert.match(output, /Content validation passed/);
});

test("EN and FR plans have matching module structure", () => {
  const en = readJson("plan.en.json");
  const fr = readJson("plan.fr.json");
  assert.equal(en.modules.length, fr.modules.length);
  en.modules.forEach((module, index) => {
    assert.equal(module.id, fr.modules[index].id, `module ${index} id matches`);
    assert.equal(module.quiz.length, fr.modules[index].quiz.length, `module ${module.id} quiz length matches`);
    module.quiz.forEach((question, qIndex) => {
      assert.equal(
        question.answer,
        fr.modules[index].quiz[qIndex].answer,
        `module ${module.id} question ${qIndex} answer index matches`
      );
    });
  });
});

test("EN and FR academies have matching level structure", () => {
  const en = readJson("academy.en.json");
  const fr = readJson("academy.fr.json");
  assert.equal(en.levels.length, fr.levels.length);
  en.levels.forEach((level, index) => {
    assert.equal(level.id, fr.levels[index].id, `level ${index} id matches`);
    assert.equal(level.quiz.length, fr.levels[index].quiz.length, `level ${level.id} quiz length matches`);
    level.quiz.forEach((question, qIndex) => {
      assert.equal(
        question.answer,
        fr.levels[index].quiz[qIndex].answer,
        `level ${level.id} question ${qIndex} answer index matches`
      );
    });
  });
});

test("every quiz answer index points at an existing option", () => {
  for (const file of ["plan.en.json", "plan.fr.json"]) {
    const plan = readJson(file);
    for (const module of plan.modules) {
      for (const question of module.quiz) {
        assert.ok(
          Number.isInteger(question.answer) && question.answer >= 0 && question.answer < question.options.length,
          `${file} module ${module.id}: answer in range`
        );
      }
    }
  }
  for (const file of ["academy.en.json", "academy.fr.json"]) {
    const academy = readJson(file);
    for (const level of academy.levels) {
      for (const question of level.quiz) {
        assert.ok(
          Number.isInteger(question.answer) && question.answer >= 0 && question.answer < question.options.length,
          `${file} level ${level.id}: answer in range`
        );
      }
    }
  }
});

test("app.js has valid syntax", () => {
  execFileSync(process.execPath, ["--check", path.join(rootDir, "app.js")]);
});
