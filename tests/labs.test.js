const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const rootDir = path.join(__dirname, "..");
const labsDir = path.join(rootDir, "labs");

// Each lab maps to a module of the AI Engineer Expert track and must stay
// runnable offline: the Python CI has no API key and never will.
const LABS = [
  { dir: "lab01_chat_service", impl: "service.py", tests: "test_service.py", module: "python-prod-ai" },
  { dir: "lab02_rag_baseline", impl: "retrieval.py", tests: "test_retrieval.py", module: "rag-grounding" },
  { dir: "lab03_eval_harness", impl: "harness.py", tests: "test_harness.py", module: "genai-evaluation" },
  { dir: "lab04_tracing", impl: "tracing.py", tests: "test_tracing.py", module: "ai-observability" },
  { dir: "lab05_cost_router", impl: "router.py", tests: "test_router.py", module: "ai-cost-governance" },
  { dir: "lab06_guardrails", impl: "guardrails.py", tests: "test_guardrails.py", module: "ai-security-safety" }
];

const readPlanModuleIds = () => {
  const plan = JSON.parse(fs.readFileSync(path.join(rootDir, "data", "plan.en.json"), "utf8"));
  return new Set(plan.modules.map((module) => module.id));
};

test("every lab exists with an implementation and a test suite", () => {
  for (const lab of LABS) {
    const dir = path.join(labsDir, lab.dir);
    assert.ok(fs.existsSync(dir), `${lab.dir} exists`);
    assert.ok(fs.existsSync(path.join(dir, lab.impl)), `${lab.dir}/${lab.impl} exists`);
    assert.ok(fs.existsSync(path.join(dir, lab.tests)), `${lab.dir}/${lab.tests} exists`);
  }
});

test("every lab maps to a module that is actually in the learning path", () => {
  const moduleIds = readPlanModuleIds();
  for (const lab of LABS) {
    assert.ok(moduleIds.has(lab.module), `${lab.dir} targets unknown module ${lab.module}`);
  }
});

test("the labs project declares every lab as a test path", () => {
  const pyproject = fs.readFileSync(path.join(labsDir, "pyproject.toml"), "utf8");
  for (const lab of LABS) {
    assert.ok(pyproject.includes(lab.dir), `pyproject.toml lists ${lab.dir}`);
  }
});

test("labs never require a provider API key", () => {
  const forbidden = /\b(OPENAI_API_KEY|ANTHROPIC_API_KEY|AZURE_OPENAI_KEY)\b/;
  for (const lab of LABS) {
    for (const file of [lab.impl, lab.tests]) {
      const source = fs.readFileSync(path.join(labsDir, lab.dir, file), "utf8");
      assert.ok(!forbidden.test(source), `${lab.dir}/${file} must run without a provider key`);
    }
  }
});

test("every lab test suite carries a meaningful number of assertions", () => {
  for (const lab of LABS) {
    const source = fs.readFileSync(path.join(labsDir, lab.dir, lab.tests), "utf8");
    const testCount = (source.match(/^def test_|^async def test_/gm) || []).length;
    assert.ok(testCount >= 10, `${lab.dir}: ${testCount} tests, expected at least 10`);
  }
});

test("the labs CI workflow runs pytest without secrets", () => {
  const workflow = fs.readFileSync(path.join(rootDir, ".github", "workflows", "labs.yml"), "utf8");
  assert.match(workflow, /pytest/);
  assert.ok(!workflow.includes("secrets."), "the labs workflow must not depend on secrets");
});

test("the labs README documents each lab", () => {
  const readme = fs.readFileSync(path.join(labsDir, "README.md"), "utf8");
  for (const lab of LABS) {
    assert.ok(readme.includes(lab.dir), `README documents ${lab.dir}`);
  }
});

