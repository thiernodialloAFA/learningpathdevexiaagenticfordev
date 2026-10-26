"use strict";

const fs = require("node:fs");
const path = require("node:path");

const DATA = path.resolve(__dirname, "..", "..", "data");
const replacements = {
  "https://platform.openai.com/docs/guides": {
    url: "https://developers.openai.com/api/docs/guides",
    names: { en: "OpenAI Platform — developer guides", fr: "OpenAI Platform — guides développeur" }
  },
  "https://platform.openai.com/docs/guides/agents": {
    url: "https://developers.openai.com/api/docs/guides/agents",
    names: { en: "OpenAI — agents guide", fr: "OpenAI — guide des agents" }
  },
  "https://platform.openai.com/docs/guides/prompt-caching": {
    url: "https://developers.openai.com/api/docs/guides/prompt-caching",
    names: { en: "OpenAI — prompt caching guide", fr: "OpenAI — guide de mise en cache des prompts" }
  },
  "https://platform.openai.com/docs/guides/rate-limits": {
    url: "https://developers.openai.com/api/docs/guides/rate-limits",
    names: { en: "OpenAI — rate limits", fr: "OpenAI — limites de débit" }
  },
  "https://www.eiopa.europa.eu/digital-transformation/artificial-intelligence_en": {
    url: "https://www.eiopa.europa.eu/publications_en",
    names: { en: "EIOPA — official publications", fr: "EIOPA — publications officielles" }
  },
  "https://www.cnil.fr/en/ai-how-to-sheets": {
    url: "https://www.cnil.fr/en/",
    names: { en: "CNIL — AI governance and guidance", fr: "CNIL — gouvernance et recommandations sur l'IA" }
  },
  "https://www.axa.com/en/about-us/artificial-intelligence": {
    url: "https://www.axa.com/en/about-us",
    names: { en: "AXA Group — about us", fr: "Groupe AXA — à propos" }
  },
  "https://en.wikipedia.org/wiki/Minto_Pyramid_Principle": {
    url: "https://books.google.com/books?vid=ISBN9780273710516",
    names: {
      en: "The Pyramid Principle — book record",
      fr: "The Pyramid Principle — fiche du livre"
    }
  }
};

for (const lang of ["en", "fr"]) {
  const file = path.join(DATA, `plan.${lang}.json`);
  const plan = JSON.parse(fs.readFileSync(file, "utf8"));
  let changed = 0;
  for (const module of plan.modules) {
    for (const resource of module.resources) {
      const replacement = replacements[resource.url];
      if (!replacement) continue;
      resource.url = replacement.url;
      resource.name = replacement.names[lang];
      changed += 1;
    }
  }
  if (changed !== Object.keys(replacements).length) {
    throw new Error(`Expected to refresh ${Object.keys(replacements).length} links in plan.${lang}.json; refreshed ${changed}`);
  }
  fs.writeFileSync(file, `${JSON.stringify(plan, null, 2)}\n`, "utf8");
  console.log(`plan.${lang}.json: refreshed ${changed} resource links`);
}
