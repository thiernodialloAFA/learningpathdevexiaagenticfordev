"use strict";

const fs = require("node:fs");
const path = require("node:path");

const ROOT = path.resolve(__dirname, "..", "..");
const DATA = path.join(ROOT, "data");
const LANGS = ["en", "fr"];
const DRY_RUN = process.argv.includes("--dry-run");

const capstones = {
  en: [
    {
      id: "capstone-evaluation",
      afterModule: "genai-evaluation",
      title: "CAP-1 — Evaluation strategy for an underwriting assistant",
      description: "Build and defend an evaluation suite for an AI-assisted insurance underwriting workflow.",
      deliverable: "Golden dataset, quality and safety rubric, regression gates, and a short decision record."
    },
    {
      id: "capstone-cost-observability",
      afterModule: "ai-cost-governance",
      title: "CAP-2 — Cost and observability audit",
      description: "Audit an existing assistant's spend, latency, and quality, then propose a measurable improvement plan.",
      deliverable: "Trace-based cost analysis, unit-economics model, and a plan targeting a 40% cost reduction without breaching quality SLOs."
    },
    {
      id: "capstone-regulated-release",
      afterModule: "responsible-ai-regulated",
      title: "CAP-3 — Regulated production-readiness dossier",
      description: "Prepare an insurance AI use case for production under applicable AI Act, DORA, privacy, and security controls.",
      deliverable: "Use-case classification, threat model, oversight plan, evidence register, and production SLO."
    }
  ],
  fr: [
    {
      id: "capstone-evaluation",
      afterModule: "genai-evaluation",
      title: "CAP-1 — Stratégie d'évaluation d'un assistant de souscription",
      description: "Construisez et défendez une suite d'évaluation pour un parcours de souscription d'assurance assisté par l'IA.",
      deliverable: "Jeu de données de référence, grilles de qualité et de sûreté, seuils de régression et courte note de décision."
    },
    {
      id: "capstone-cost-observability",
      afterModule: "ai-cost-governance",
      title: "CAP-2 — Audit des coûts et de l'observabilité",
      description: "Auditez les dépenses, la latence et la qualité d'un assistant existant, puis proposez un plan d'amélioration mesurable.",
      deliverable: "Analyse des coûts à partir des traces, modèle économique unitaire et plan visant 40 % de réduction des coûts sans enfreindre les SLO de qualité."
    },
    {
      id: "capstone-regulated-release",
      afterModule: "responsible-ai-regulated",
      title: "CAP-3 — Dossier de mise en production réglementée",
      description: "Préparez un cas d'usage IA en assurance pour la production selon les contrôles applicables de l'AI Act, DORA, de la protection des données et de la sécurité.",
      deliverable: "Classification du cas d'usage, modèle de menace, plan de supervision, registre des preuves et SLO de production."
    }
  ]
};

const inferType = (resource) => {
  const source = `${resource.name} ${resource.url}`.toLowerCase();
  if (/arxiv|doi\.org|paper|research/.test(source)) return "paper";
  if (/standard|regulation|act|dora|gdpr|iso\//.test(source)) return "standard";
  if (/github\.com/.test(source)) return "repository";
  if (/course|training|academy/.test(source)) return "course";
  if (/book|workbook/.test(source)) return "book";
  if (/tool|sdk|langfuse|deepeval|ragas|phoenix/.test(source)) return "tool";
  if (/dataset|benchmark|helm/.test(source)) return "dataset";
  if (/docs\.|documentation|developer guides|semantic conventions/.test(source)) return "documentation";
  if (/blog|article|guide|whitepaper/.test(source)) return "article";
  return "website";
};

const inferLevel = (resource) => {
  const host = new URL(resource.url).hostname.toLowerCase();
  if (
    /(^|\.)((openai|anthropic|microsoft|opentelemetry|nist|eur-lex|eiopa|cnil|finops|owasp|iso)\.[a-z.]+)$/.test(host) ||
    host.endsWith(".gov") ||
    host.endsWith(".europa.eu")
  ) {
    return "primary";
  }
  return host === "github.com" || host.endsWith(".github.io") ? "community" : "secondary";
};

const plans = {};
const academies = {};
for (const lang of LANGS) {
  const file = path.join(DATA, `plan.${lang}.json`);
  const plan = JSON.parse(fs.readFileSync(file, "utf8"));
  const academyFile = path.join(DATA, `academy.${lang}.json`);
  const academy = JSON.parse(fs.readFileSync(academyFile, "utf8"));
  for (const collection of [...plan.modules, ...academy.levels]) {
    for (const resource of collection.resources) {
      resource.type = resource.type || inferType(resource);
      resource.reviewedAt = resource.reviewedAt || null;
      resource.level = resource.level || inferLevel(resource);
    }
  }
  if (plan.capstones && JSON.stringify(plan.capstones.map((entry) => [entry.id, entry.afterModule])) !==
      JSON.stringify(capstones[lang].map((entry) => [entry.id, entry.afterModule]))) {
    throw new Error(`Unexpected capstones already exist in plan.${lang}.json`);
  }
  if (!plan.capstones) plan.capstones = capstones[lang];
  plans[lang] = plan;
  academies[lang] = academy;
}

if (JSON.stringify(plans.en.capstones.map((entry) => [entry.id, entry.afterModule])) !==
    JSON.stringify(plans.fr.capstones.map((entry) => [entry.id, entry.afterModule]))) {
  throw new Error("Capstone parity failed");
}

if (!DRY_RUN) {
  for (const lang of LANGS) {
    fs.writeFileSync(path.join(DATA, `plan.${lang}.json`), `${JSON.stringify(plans[lang], null, 2)}\n`, "utf8");
    fs.writeFileSync(path.join(DATA, `academy.${lang}.json`), `${JSON.stringify(academies[lang], null, 2)}\n`, "utf8");
  }
}

console.log("Migration 09 — resource metadata and capstones");
for (const lang of LANGS) {
  const resources = [
    ...plans[lang].modules.flatMap((module) => module.resources),
    ...academies[lang].levels.flatMap((level) => level.resources)
  ];
  console.log(`  ${lang}: ${resources.length} resources tagged; reviewedAt remains null pending an actual review`);
}
console.log("  ensured three capstones in both languages");
if (DRY_RUN) console.log("  (dry run, nothing written)");
