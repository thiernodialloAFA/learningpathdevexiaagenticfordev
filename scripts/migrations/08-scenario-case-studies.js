"use strict";

const fs = require("node:fs");
const path = require("node:path");

const ROOT = path.resolve(__dirname, "..", "..");
const DATA = path.join(ROOT, "data");
const LANGS = ["en", "fr"];
const DRY_RUN = process.argv.includes("--dry-run");
const SCENARIO_INTRODUCER =
  /^(a |an |the |your |you |suppose |assume |given |after |when |during |consider |imagine |in production|for |a team|a service|a company|a user|a model|a system|a rag|an agent|an assistant|a support|a production|a repository|a prompt|a new|a developer|an internal|an interviewer|a behavioral|a system-design)/i;

const rewrites = {
  "ai-security-safety": {
    3: {
      en: "A security review is mapping the attack surface of an agentic coding assistant before its first production deployment. Which threat-model asset is most often overlooked?",
      fr: "Une revue de sécurité cartographie la surface d'attaque d'un assistant de codage agentique avant son premier déploiement en production. Quel actif est le plus souvent oublié dans le modèle de menace ?"
    }
  },
  "interview-readiness-aie": {
    0: {
      en: "You present a technically sound design in an AI Engineer Expert interview, but the panel says your answer did not address the business outcome. What usually makes a Principal-level answer weak in this situation?",
      fr: "Lors d'un entretien d'ingénieur expert en IA, vous présentez une architecture techniquement solide, mais le jury indique que la réponse ne traite pas du résultat métier. Qu'est-ce qui rend généralement une réponse de niveau Principal faible dans cette situation ?"
    },
    2: {
      en: "You have one week before a senior AI engineering interview and can prepare only one reusable artifact. Which preparation artifact is most reusable across high-level interviews?",
      fr: "Il vous reste une semaine avant un entretien d'ingénierie IA senior et vous ne pouvez préparer qu'un seul support réutilisable. Lequel sera le plus utile dans différents entretiens de haut niveau ?"
    },
    3: {
      en: "An interviewer asks you to describe a leadership story where your technically preferred approach was not adopted. What makes the STAR format Principal-level rather than senior-level?",
      fr: "Un recruteur vous demande de raconter une situation où l'approche technique que vous préfériez n'a pas été retenue. Qu'est-ce qui distingue un récit STAR de niveau Principal d'un récit de niveau senior ?"
    },
    5: {
      en: "You are asked to whiteboard an internal AI platform for several regulated business units. Which topic must appear early in the design?",
      fr: "Vous devez concevoir au tableau une plateforme IA interne destinée à plusieurs entités métier réglementées. Quel sujet doit apparaître tôt dans la conception ?"
    },
    8: {
      en: "An executive gives you five minutes to explain a complex AI architecture decision and its risks. What is the best way to keep the answer concise but deep?",
      fr: "Un dirigeant vous accorde cinq minutes pour expliquer une décision d'architecture IA complexe et ses risques. Comment rendre la réponse à la fois concise et approfondie ?"
    }
  }
};

const readPlan = (lang) =>
  JSON.parse(fs.readFileSync(path.join(DATA, `plan.${lang}.json`), "utf8"));

const plans = Object.fromEntries(LANGS.map((lang) => [lang, readPlan(lang)]));
for (const module of plans.en.modules) {
  for (const question of module.quiz) {
    question.type = SCENARIO_INTRODUCER.test(question.prompt) ? "scenario" : "knowledge";
  }
}
const englishByModule = new Map(plans.en.modules.map((module) => [module.id, module]));
for (const module of plans.fr.modules) {
  const englishModule = englishByModule.get(module.id);
  module.quiz.forEach((question, index) => {
    question.type = englishModule.quiz[index].type;
  });
}
for (const lang of LANGS) {
  for (const [moduleId, questions] of Object.entries(rewrites)) {
    const module = plans[lang].modules.find((entry) => entry.id === moduleId);
    if (!module) throw new Error(`Module not found: ${moduleId}`);
    for (const [index, translations] of Object.entries(questions)) {
      const question = module.quiz[Number(index)];
      if (!question) throw new Error(`Question not found: ${moduleId}[${index}]`);
      question.prompt = translations[lang];
      question.type = "scenario";
    }
  }
}

for (const module of plans.fr.modules) {
  const englishModule = englishByModule.get(module.id);
  module.quiz.forEach((question, index) => {
    if (question.type !== englishModule.quiz[index].type) {
      throw new Error(`Question format parity failed: ${module.id}[${index}]`);
    }
  });
}

const scenarioCounts = plans.en.modules.map((module) => ({
  id: module.id,
  count: module.quiz.filter((question) => question.type === "scenario").length,
  total: module.quiz.length
}));
for (const module of scenarioCounts) {
  if (module.count / module.total < 0.4) {
    throw new Error(`${module.id} has ${module.count}/${module.total} scenario questions; expected at least 40%`);
  }
}

if (!DRY_RUN) {
  for (const lang of LANGS) {
    fs.writeFileSync(
      path.join(DATA, `plan.${lang}.json`),
      `${JSON.stringify(plans[lang], null, 2)}\n`,
      "utf8"
    );
  }
}

console.log("Migration 08 — scenario-based questions");
for (const module of scenarioCounts) {
  console.log(`  ${module.id}: ${module.count}/${module.total} scenarios`);
}
if (DRY_RUN) console.log("  (dry run, nothing written)");
