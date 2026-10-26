#!/usr/bin/env node
"use strict";

const fs = require("node:fs");
const path = require("node:path");

const DATA_DIR = path.join(__dirname, "..", "data");
const CONTENT_FILES = ["plan.en.json", "plan.fr.json", "academy.en.json", "academy.fr.json"];
const UNVERIFIABLE_STATUSES = new Set([403, 429]);

const collectLinks = (dataDir = DATA_DIR) => {
  const links = new Map();
  for (const file of CONTENT_FILES) {
    const content = JSON.parse(fs.readFileSync(path.join(dataDir, file), "utf8"));
    const collections = [
      ...(Array.isArray(content.modules) ? content.modules : []),
      ...(Array.isArray(content.levels) ? content.levels : [])
    ];
    for (const item of collections) {
      for (const resource of item.resources || []) {
        const labels = links.get(resource.url) || [];
        labels.push(`${file}: ${resource.name}`);
        links.set(resource.url, labels);
      }
    }
  }
  return [...links].map(([url, labels]) => ({ url, labels }));
};

const request = async (url, method, fetcher, timeoutMs) => {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetcher(url, {
      method,
      redirect: "follow",
      signal: controller.signal,
      headers: method === "GET" ? { Range: "bytes=0-0" } : undefined
    });
    if (response.body && typeof response.body.cancel === "function") {
      await response.body.cancel();
    }
    return response.status;
  } finally {
    clearTimeout(timer);
  }
};

const checkLink = async (url, { fetcher = fetch, timeoutMs = 10000 } = {}) => {
  let status = await request(url, "HEAD", fetcher, timeoutMs);
  if (status === 405 || status === 501 || status >= 400 && !UNVERIFIABLE_STATUSES.has(status)) {
    status = await request(url, "GET", fetcher, timeoutMs);
  }
  return {
    url,
    status,
    ok: status >= 200 && status < 400 || UNVERIFIABLE_STATUSES.has(status),
    warning: UNVERIFIABLE_STATUSES.has(status)
  };
};

const checkLinks = async ({ links, fetcher = fetch, concurrency = 8, timeoutMs = 10000 }) => {
  if (!Array.isArray(links)) throw new TypeError("links must be an array");
  const results = new Array(links.length);
  let cursor = 0;
  const workers = Array.from({ length: Math.min(concurrency, links.length) }, async () => {
    while (cursor < links.length) {
      const index = cursor;
      cursor += 1;
      try {
        results[index] = await checkLink(links[index].url || links[index], { fetcher, timeoutMs });
      } catch (error) {
        results[index] = {
          url: links[index].url || links[index],
          ok: false,
          error: error.name === "AbortError" ? `timed out after ${timeoutMs}ms` : error.message
        };
      }
    }
  });
  await Promise.all(workers);
  return results;
};

module.exports = { collectLinks, checkLink, checkLinks };

if (require.main === module) {
  const links = collectLinks();
  checkLinks({ links }).then((results) => {
    for (const result of results) {
      const reference = links.find((link) => link.url === result.url);
      const label = reference ? reference.labels[0] : result.url;
      if (result.warning) {
        console.warn(`WARN ${result.status} ${result.url} (${label}; access restricted)`);
      } else if (result.ok) {
        console.log(`OK ${result.status} ${result.url}`);
      } else {
        console.error(`FAIL ${result.status || result.error} ${result.url} (${label})`);
      }
    }
    const failures = results.filter((result) => !result.ok);
    console.log(`Checked ${results.length} unique links; ${failures.length} failed.`);
    if (failures.length > 0) process.exitCode = 1;
  }).catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
}
