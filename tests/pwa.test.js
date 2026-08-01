const test = require("node:test");
const assert = require("node:assert");
const fs = require("node:fs");
const path = require("node:path");
const { execFileSync } = require("node:child_process");

const root = path.join(__dirname, "..");

test("manifest.webmanifest is valid JSON with required fields", () => {
  const manifest = JSON.parse(fs.readFileSync(path.join(root, "manifest.webmanifest"), "utf8"));
  assert.ok(manifest.name);
  assert.ok(manifest.short_name);
  assert.equal(manifest.start_url, "./");
  assert.equal(manifest.display, "standalone");
  assert.ok(Array.isArray(manifest.icons) && manifest.icons.length > 0);
  for (const icon of manifest.icons) {
    assert.ok(icon.src && icon.sizes && icon.type);
    assert.ok(fs.existsSync(path.join(root, icon.src)), `icon exists: ${icon.src}`);
  }
});

test("service worker and frontend scripts parse", () => {
  for (const file of ["sw.js", "app.js", "lib/engine.js"]) {
    execFileSync(process.execPath, ["--check", path.join(root, file)]);
  }
});

test("index.html wires up the PWA and the shared engine", () => {
  const html = fs.readFileSync(path.join(root, "index.html"), "utf8");
  assert.ok(html.includes('rel="manifest"'));
  assert.ok(html.includes("lib/engine.js"));
});
