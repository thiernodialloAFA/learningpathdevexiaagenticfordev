const test = require("node:test");
const assert = require("node:assert/strict");

const { collectLinks, checkLink, checkLinks } = require("../scripts/check-links.js");

test("collectLinks deduplicates resource URLs across content languages", () => {
  const links = collectLinks();
  assert.ok(links.length > 0);
  assert.equal(new Set(links.map((link) => link.url)).size, links.length);
  assert.ok(links.every((link) => link.labels.length >= 1));
});

test("checkLink falls back to GET when a host does not support HEAD", async () => {
  const methods = [];
  const result = await checkLink("https://example.com/docs", {
    fetcher: async (_url, options) => {
      methods.push(options.method);
      return { status: options.method === "HEAD" ? 405 : 200, body: null };
    }
  });
  assert.deepEqual(methods, ["HEAD", "GET"]);
  assert.equal(result.ok, true);
  assert.equal(result.status, 200);
});

test("checkLinks reports broken URLs and marks access-restricted URLs as warnings", async () => {
  const results = await checkLinks({
    links: ["https://broken.example", "https://private.example"],
    fetcher: async (url) => ({
      status: url.includes("broken") ? 404 : 403,
      body: null
    })
  });
  assert.equal(results[0].ok, false);
  assert.equal(results[0].status, 404);
  assert.equal(results[1].ok, true);
  assert.equal(results[1].warning, true);
});
