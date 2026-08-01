const plan = {
  duration: "16 weeks",
  targetRole: "Principal Software Engineer — DevEx, Engineering Excellence, GenAI / Agentic AI",
  readinessTarget: "Interview-ready with strong architecture, strategy, delivery, and assessment discipline",
  goals: [
    "Become current on GenAI for software development and coding agents",
    "Develop strong practical judgment for agentic systems, evals, and security",
    "Sharpen Principal-level DevEx and engineering excellence thinking",
    "Practice difficult knowledge checks and scenario-driven decision making",
    "Finish with a final assessment portfolio you can use in interviews"
  ],
  modules: [
    {
      id: "foundations",
      weeks: "Weeks 1-2",
      title: "LLM and GenAI foundations for developers",
      objective:
        "Build a strong mental model of modern LLM systems, inference tradeoffs, prompting mechanics, embeddings, fine-tuning boundaries, and production constraints.",
      outcomes: [
        "Explain where prompting, retrieval, tool use, and fine-tuning each fit",
        "Reason about latency, context windows, grounding, hallucination risk, and cost",
        "Translate model capabilities into software architecture choices"
      ],
      deliverables: [
        "A one-page architecture note comparing prompt-only, RAG, and tool-using designs",
        "A tradeoff table for latency, quality, and cost across three model choices"
      ],
      resources: [
        { name: "OpenAI developer guides", url: "https://platform.openai.com/docs/guides" },
        { name: "Anthropic documentation", url: "https://docs.anthropic.com/" },
        { name: "Microsoft Learn: Generative AI", url: "https://learn.microsoft.com/en-us/ai/playbook/technology-guidance/generative-ai/" }
      ],
      quiz: [
        {
          prompt: "You need deterministic behavior for a code-migration assistant with moderate context needs. Which design change usually gives the biggest quality improvement before fine-tuning?",
          options: [
            "Increase temperature so the model explores more options",
            "Add retrieval, canonical examples, and explicit output constraints",
            "Switch immediately to a larger embedding model",
            "Remove system instructions to reduce prompt length"
          ],
          answer: 1,
          explanation:
            "For most developer tools, grounding plus clear constraints improves reliability faster than fine-tuning. Temperature increases exploration, not determinism."
        },
        {
          prompt: "Which statement best describes the boundary between RAG and fine-tuning?",
          options: [
            "RAG changes model weights, while fine-tuning changes prompt templates",
            "RAG supplies external context at runtime, while fine-tuning changes model behavior through training",
            "They are functionally identical for coding assistants",
            "Fine-tuning is preferred whenever documents change frequently"
          ],
          answer: 1,
          explanation:
            "RAG is runtime grounding; fine-tuning updates model behavior. Frequently changing knowledge usually favors retrieval."
        },
        {
          prompt: "What is the strongest reason to avoid summarizing source code too early in a coding assistant pipeline?",
          options: [
            "Summaries always lower token usage but break caching",
            "Early summarization can remove the exact details needed for correct code reasoning",
            "Summaries make embeddings impossible",
            "Summaries prevent function calling"
          ],
          answer: 1,
          explanation:
            "Agentic coding work often depends on preserving exact signatures, call sites, and edge cases that can be lost in premature summarization."
        }
      ]
    },
    {
      id: "agentic-systems",
      weeks: "Weeks 3-4",
      title: "Agent engineering and tool-using systems",
      objective:
        "Understand single-agent and multi-agent patterns, memory, planning, tool routing, orchestration, and failure modes in software-development workflows.",
      outcomes: [
        "Choose the simplest viable agent architecture for a given task",
        "Explain when loops, planners, critics, or multi-agent decomposition are justified",
        "Identify runaway tool use, context drift, and unbounded autonomy risks"
      ],
      deliverables: [
        "A design doc for a repository analysis agent with bounded autonomy",
        "A failure-mode catalog for tool errors, stale memory, and unsafe actions"
      ],
      resources: [
        { name: "Anthropic: Building effective agents", url: "https://www.anthropic.com/engineering/building-effective-agents" },
        { name: "Model Context Protocol introduction", url: "https://modelcontextprotocol.io/introduction" },
        { name: "LangChain overview", url: "https://python.langchain.com/docs/introduction/" }
      ],
      quiz: [
        {
          prompt: "When is a multi-agent architecture usually justified?",
          options: [
            "Whenever the team wants a modern architecture",
            "When independent subproblems require different tools or long-lived isolated context",
            "Whenever latency is the top priority",
            "Only when using MCP"
          ],
          answer: 1,
          explanation:
            "Multi-agent designs are best when there is genuine decomposition value, not as a default choice."
        },
        {
          prompt: "What is the best safeguard against an agent taking a harmful sequence of tool actions?",
          options: [
            "Raise the token limit so the agent reasons longer",
            "Allow free-form shell access but add more prompt warnings",
            "Constrain tool permissions, require explicit checkpoints, and review critical actions",
            "Store more long-term memory"
          ],
          answer: 2,
          explanation:
            "Safety comes from permissions, bounded execution, checkpoints, and reviewable actions more than from prompting alone."
        },
        {
          prompt: "Which signal most strongly suggests your planner loop is over-engineered?",
          options: [
            "The agent solves the task in one pass with a direct tool call",
            "The agent always needs a vector database",
            "The system uses JSON outputs",
            "The UI shows reasoning steps"
          ],
          answer: 0,
          explanation:
            "If a direct path works reliably, adding planners and critics usually increases cost and complexity without improving outcomes."
        }
      ]
    },
    {
      id: "retrieval-evals",
      weeks: "Weeks 5-6",
      title: "Retrieval, grounding, and evaluation systems",
      objective:
        "Design high-signal retrieval and evaluation workflows for internal developer tools, knowledge systems, and support assistants.",
      outcomes: [
        "Define offline and online evals that reflect real engineering tasks",
        "Design retrieval strategies that preserve trust and provenance",
        "Use failure taxonomies instead of only aggregate scores"
      ],
      deliverables: [
        "A golden dataset of 25 engineering questions with expected evidence sources",
        "An evaluation rubric for correctness, citation quality, latency, and refusal quality"
      ],
      resources: [
        { name: "OpenAI guides", url: "https://platform.openai.com/docs/guides" },
        { name: "LlamaIndex documentation", url: "https://docs.llamaindex.ai/" },
        { name: "Google Cloud: 2025 DORA report announcement", url: "https://cloud.google.com/blog/products/ai-machine-learning/announcing-the-2025-dora-report" }
      ],
      quiz: [
        {
          prompt: "Which metric pair is most dangerous to optimize in isolation for a RAG assistant?",
          options: [
            "Latency and retrieval depth",
            "Answer length and token usage",
            "Average benchmark score and user trust",
            "Precision@k and hallucination rate"
          ],
          answer: 2,
          explanation:
            "Averaged scores can hide catastrophic trust failures. Principal-level evaluation should preserve failure visibility, not flatten it away."
        },
        {
          prompt: "Why should you preserve citations or source traces in an internal engineering assistant?",
          options: [
            "To reduce model cost",
            "To let the user validate the answer and accelerate deeper investigation",
            "Because citations automatically prevent hallucinations",
            "Because embeddings require it"
          ],
          answer: 1,
          explanation:
            "Source visibility is essential for trust, debugging, and adoption, even though it does not automatically eliminate hallucinations."
        },
        {
          prompt: "What is the strongest reason to create task-specific eval datasets instead of relying only on public benchmarks?",
          options: [
            "Public benchmarks are always out of date",
            "Internal workflows have different risk, context, and quality requirements",
            "Task-specific evals do not need labels",
            "They make online experiments unnecessary"
          ],
          answer: 1,
          explanation:
            "Developer tools succeed or fail on local workflows, expectations, and constraints that generic benchmarks rarely capture."
        }
      ]
    },
    {
      id: "security-governance",
      weeks: "Weeks 7-8",
      title: "GenAI security, governance, and responsible delivery",
      objective:
        "Prepare to discuss prompt injection, data leakage, authorization, auditability, model governance, and secure deployment patterns for AI products.",
      outcomes: [
        "Identify common LLM and agentic security failure modes",
        "Design policy boundaries for tools, memory, and sensitive data",
        "Incorporate security and compliance into delivery instead of treating them as a late review"
      ],
      deliverables: [
        "A threat model for an internal coding assistant",
        "A secure-by-default checklist for prompts, tool policies, and logging"
      ],
      resources: [
        { name: "OWASP GenAI Security Project", url: "https://genai.owasp.org/" },
        { name: "OWASP GenAI resources", url: "https://genai.owasp.org/resources/" },
        { name: "Model Context Protocol specification", url: "https://modelcontextprotocol.io/specification/2025-06-18" }
      ],
      quiz: [
        {
          prompt: "A repository assistant reads untrusted markdown from a pull request and then calls deployment tools. What is the primary risk?",
          options: [
            "Model overfitting",
            "Prompt injection crossing a trust boundary into privileged actions",
            "Embedding dimensionality mismatch",
            "Token underutilization"
          ],
          answer: 1,
          explanation:
            "The dangerous issue is untrusted content influencing privileged behavior through tools or instructions."
        },
        {
          prompt: "Which mitigation is the strongest default for tool-using agents with access to sensitive systems?",
          options: [
            "Use higher top-p sampling",
            "Separate read-only and write-capable tools and require explicit approvals for side effects",
            "Store all user prompts permanently for debugging",
            "Allow the agent to self-approve retries"
          ],
          answer: 1,
          explanation:
            "Permission separation and explicit approval gates reduce the blast radius of prompt injection, misrouting, and hallucinated actions."
        },
        {
          prompt: "Why is auditability especially important for AI-enhanced developer workflows?",
          options: [
            "Because it reduces compute cost",
            "Because it allows reconstruction of decisions, evidence, and actions during incidents or policy review",
            "Because it prevents model drift",
            "Because it replaces code review"
          ],
          answer: 1,
          explanation:
            "Principal-level governance requires traceability for actions, decisions, and evidence, especially when automation affects production systems."
        }
      ]
    },
    {
      id: "devex-platform",
      weeks: "Weeks 9-10",
      title: "Developer Experience and platform engineering",
      objective:
        "Build strong product thinking around internal platforms, self-service systems, developer journeys, and measurable productivity improvement.",
      outcomes: [
        "Connect DevEx work to measurable business and engineering outcomes",
        "Use DORA, SPACE, and qualitative signals without metric abuse",
        "Design internal platforms as products rather than control surfaces"
      ],
      deliverables: [
        "A DevEx scorecard for an engineering organization",
        "A product brief for an internal platform capability with adoption metrics"
      ],
      resources: [
        { name: "DORA insights", url: "https://dora.dev/insights/" },
        { name: "Platform Engineering", url: "https://platformengineering.org/" },
        { name: "Puppet: State of platform engineering 2026", url: "https://www.puppet.com/resources/2026-state-of-platform-engineering" }
      ],
      quiz: [
        {
          prompt: "What is the most common failure mode when teams adopt DORA metrics for DevEx work?",
          options: [
            "They collect too much qualitative feedback",
            "They use metrics as local optimization targets without understanding context or tradeoffs",
            "They refuse to compare teams",
            "They focus too much on incident learning"
          ],
          answer: 1,
          explanation:
            "Metrics become harmful when used as scoreboards rather than signals tied to developer and delivery outcomes."
        },
        {
          prompt: "What best demonstrates a platform-engineering product mindset?",
          options: [
            "Mandating tool usage without feedback loops",
            "Optimizing only for standardization",
            "Treating internal engineers as customers, measuring adoption, and iterating on friction",
            "Building more templates than teams request"
          ],
          answer: 2,
          explanation:
            "Internal platforms succeed when they reduce friction and win trust through product-like iteration and evidence."
        },
        {
          prompt: "Which combination gives the strongest DevEx understanding?",
          options: [
            "Only survey data",
            "Only deployment metrics",
            "Delivery metrics, qualitative feedback, workflow traces, and business context",
            "Only ticket counts"
          ],
          answer: 2,
          explanation:
            "Developer experience is multidimensional and needs quantitative and qualitative signals together."
        }
      ]
    },
    {
      id: "excellence-reliability",
      weeks: "Weeks 11-12",
      title: "Engineering excellence, reliability, and operational maturity",
      objective:
        "Strengthen Principal-level knowledge in testing strategy, observability, release engineering, SRE, incident handling, and quality economics.",
      outcomes: [
        "Define layered quality strategies across unit, integration, end-to-end, and production checks",
        "Connect observability design to faster diagnosis and safer change",
        "Discuss incidents as learning systems rather than blame exercises"
      ],
      deliverables: [
        "A test strategy for a medium-sized platform team",
        "An incident review template with systemic corrective actions"
      ],
      resources: [
        { name: "Google SRE book", url: "https://sre.google/sre-book/table-of-contents/" },
        { name: "OpenTelemetry documentation", url: "https://opentelemetry.io/docs/" },
        { name: "Thoughtworks Technology Radar", url: "https://www.thoughtworks.com/radar" }
      ],
      quiz: [
        {
          prompt: "What is the strongest reason to invest in high-quality telemetry for developer platforms?",
          options: [
            "It reduces the need for product management",
            "It makes dashboards look more modern",
            "It shortens detection and diagnosis loops for developer-facing failures and regressions",
            "It replaces incident response"
          ],
          answer: 2,
          explanation:
            "Telemetry is valuable because it improves detection, diagnosis, and decision speed when internal tools break."
        },
        {
          prompt: "Which statement best matches an engineering-excellence mindset?",
          options: [
            "Quality belongs mostly to QA",
            "Reliability work slows product work and should be deferred",
            "Quality, observability, release safety, and incident learning are shared system capabilities",
            "Postmortems should focus on the person who merged the change"
          ],
          answer: 2,
          explanation:
            "Engineering excellence is systemic. It treats reliability and quality as shared capabilities across the organization."
        },
        {
          prompt: "What is the key weakness of relying only on end-to-end tests for a complex engineering platform?",
          options: [
            "They are too deterministic",
            "They are expensive, slow, and poor at localizing failures without lower-level test layers",
            "They cannot cover user journeys",
            "They make CI faster"
          ],
          answer: 1,
          explanation:
            "A balanced testing pyramid or test portfolio is needed because end-to-end checks alone are slow and diagnostically weak."
        }
      ]
    },
    {
      id: "principal-systems",
      weeks: "Weeks 13-14",
      title: "Principal-level architecture, influence, and strategy",
      objective:
        "Prepare to lead with architecture, decision frameworks, roadmaps, and cross-functional influence rather than only implementation depth.",
      outcomes: [
        "Frame large technical decisions with tradeoffs, constraints, and measurable outcomes",
        "Lead organizational change through RFCs, standards, and executive communication",
        "Balance innovation, risk, and adoption in AI-enabled platform strategies"
      ],
      deliverables: [
        "An RFC for introducing an internal AI platform capability",
        "A stakeholder map and adoption plan for the RFC"
      ],
      resources: [
        { name: "DORA capabilities", url: "https://dora.dev/capabilities/" },
        { name: "Team Topologies", url: "https://teamtopologies.com/" },
        { name: "Google Cloud architecture center", url: "https://cloud.google.com/architecture" }
      ],
      quiz: [
        {
          prompt: "Which behavior most clearly distinguishes a Principal engineer from a senior engineer in interview settings?",
          options: [
            "Remembering more syntax from memory",
            "Driving organization-wide decisions through clear tradeoffs, alignment, and long-term technical direction",
            "Writing the fastest code in a coding round",
            "Avoiding non-technical discussions"
          ],
          answer: 1,
          explanation:
            "Principal scope is defined by strategy, organizational leverage, decision quality, and long-horizon systems thinking."
        },
        {
          prompt: "A proposed internal AI platform would improve speed for some teams but adds governance friction. What is the strongest next step?",
          options: [
            "Launch it org-wide immediately",
            "Reject it because governance always slows innovation",
            "Pilot it with target teams, define outcome metrics, and iterate on guardrails and UX",
            "Convert it into a hackathon project"
          ],
          answer: 2,
          explanation:
            "A Principal approach uses focused rollout, measurable learning, and iterative guardrail design."
        },
        {
          prompt: "What is the best indicator that your architecture review process is healthy?",
          options: [
            "Every proposal is approved",
            "Documents are long and comprehensive",
            "Important tradeoffs are surfaced early and teams can move with clarity afterward",
            "Only staff-plus engineers speak in the review"
          ],
          answer: 2,
          explanation:
            "The goal of architecture review is better decisions and alignment, not ceremony."
        }
      ]
    },
    {
      id: "interview-readiness",
      weeks: "Weeks 15-16",
      title: "Interview readiness and communication drills",
      objective:
        "Turn knowledge into repeatable interview performance across system design, leadership stories, technical strategy, and AI product judgment.",
      outcomes: [
        "Deliver concise, executive-level answers with technical depth underneath",
        "Present coherent stories for DevEx, engineering excellence, and AI adoption",
        "Defend architecture and roadmap choices under pressure"
      ],
      deliverables: [
        "A bank of 15 STAR stories with metrics and lessons learned",
        "Three whiteboard-ready system designs: coding assistant, internal AI platform, and engineering insights system"
      ],
      resources: [
        { name: "OpenAI guides", url: "https://platform.openai.com/docs/guides" },
        { name: "Anthropic docs", url: "https://docs.anthropic.com/" },
        { name: "Thoughtworks Technology Radar", url: "https://www.thoughtworks.com/radar" }
      ],
      quiz: [
        {
          prompt: "What usually makes a Principal-level answer weak even when the technical idea is correct?",
          options: [
            "Using diagrams",
            "Failing to connect the decision to org impact, adoption, and tradeoffs",
            "Mentioning risks",
            "Providing metrics"
          ],
          answer: 1,
          explanation:
            "At this level, strong answers connect implementation detail to organizational value, change management, and evidence."
        },
        {
          prompt: "During a system-design interview, what should you do first after clarifying requirements?",
          options: [
            "Jump straight into database schema design",
            "State success criteria, constraints, and the operating context before deep design",
            "Discuss every possible edge case immediately",
            "Begin coding the API"
          ],
          answer: 1,
          explanation:
            "A Principal candidate should frame the problem, success criteria, and constraints before committing to design choices."
        },
        {
          prompt: "Which preparation artifact is most reusable across high-level interviews?",
          options: [
            "A memorized list of buzzwords",
            "A personal decision framework linking business goals, risks, metrics, and architecture choices",
            "A list of language trivia",
            "A library of generic UML icons"
          ],
          answer: 1,
          explanation:
            "Reusable frameworks help you answer consistently across leadership, architecture, and AI strategy interviews."
        }
      ]
    }
  ],
  finalAssessment: [
    {
      title: "Architecture case study",
      summary: "Design an internal AI coding assistant for a 600-engineer organization.",
      criteria: [
        "State goals, users, and operating constraints",
        "Describe model, retrieval, tool, and policy boundaries",
        "Cover reliability, observability, and rollout strategy",
        "Defend tradeoffs under questioning"
      ]
    },
    {
      title: "Engineering excellence strategy",
      summary: "Create a 12-month DevEx and platform roadmap with success metrics.",
      criteria: [
        "Use DORA, qualitative feedback, and adoption metrics together",
        "Prioritize the roadmap with explicit tradeoffs",
        "Show governance without creating excessive friction",
        "Explain how you would win adoption"
      ]
    },
    {
      title: "Security and governance review",
      summary: "Review an agentic system for prompt injection, data leakage, and unsafe tool use.",
      criteria: [
        "Identify trust boundaries and privileged actions",
        "Propose mitigations for prompt injection and memory misuse",
        "Specify approval, audit, and incident mechanisms",
        "Call out residual risks and acceptable compromises"
      ]
    },
    {
      title: "Incident and reliability drill",
      summary: "Run a post-incident analysis for an AI-powered developer platform outage.",
      criteria: [
        "Reconstruct detection, impact, and timeline",
        "Separate causes, contributors, and missed signals",
        "Recommend systemic corrective actions",
        "Tie fixes back to observability and release practices"
      ]
    },
    {
      title: "Executive communication panel",
      summary: "Present the strategy to engineering leadership and defend the investment.",
      criteria: [
        "Communicate clearly at executive altitude",
        "Translate deep technical details into business value",
        "Handle pushback on cost, safety, and adoption",
        "Close with measurable outcomes and next steps"
      ]
    },
    {
      title: "Readiness threshold",
      summary: "Pass only when both technical depth and Principal-level communication are strong.",
      criteria: [
        "Module quiz average at or above 80%",
        "All deliverables completed and reviewed",
        "Capstone scored strong in at least four of five dimensions",
        "Able to explain tradeoffs without hand-waving"
      ]
    }
  ],
  applicationPlan: [
    {
      title: "Product scope",
      bullets: [
        "Structured tracks for GenAI, agent systems, DevEx, engineering excellence, and interviews",
        "Resource curation with freshness metadata and periodic review",
        "Hard quizzes, scenario grading, and capstone assessments",
        "Progress tracking, recommendations, and interview readiness scoring"
      ]
    },
    {
      title: "Core capabilities",
      bullets: [
        "Learning-path engine with role-based curricula",
        "Assessment engine with objective and rubric-based scoring",
        "Resource ingestion for official docs, reports, and selected books",
        "Analytics dashboard for confidence, progress, and weak-signal areas"
      ]
    },
    {
      title: "Suggested architecture",
      bullets: [
        "Frontend: static web UI first, then componentized app if growth justifies it",
        "Content layer: versioned JSON or CMS-backed module definitions",
        "Assessment services: quiz scoring, rubric workflows, and submission review",
        "Optional AI layer: mock interviewer, feedback assistant, and adaptive study recommendations"
      ]
    },
    {
      title: "Data model",
      bullets: [
        "Tracks, modules, lessons, resources, quizzes, rubric dimensions, and capstones",
        "User progress events and assessment attempts",
        "Resource freshness dates, tags, and evidence level",
        "Readiness snapshots tied to target roles"
      ]
    },
    {
      title: "Roadmap",
      bullets: [
        "Phase 1: static MVP with curated content and local progress",
        "Phase 2: hosted content management, user accounts, and history",
        "Phase 3: adaptive recommendations, mock interviews, and richer analytics",
        "Phase 4: collaborative reviews and mentor workflows"
      ]
    },
    {
      title: "Quality bar",
      bullets: [
        "Prefer official or primary sources wherever possible",
        "Review resources quarterly for staleness and broken links",
        "Use assessments that test reasoning, not memorization only",
        "Measure success by interview readiness and real decision quality"
      ]
    }
  ]
};

const storageKey = "principal-learning-path-state";

const loadState = () => {
  try {
    return JSON.parse(localStorage.getItem(storageKey)) || { completed: {}, scores: {} };
  } catch (error) {
    return { completed: {}, scores: {} };
  }
};

const saveState = (state) => {
  localStorage.setItem(storageKey, JSON.stringify(state));
};

const state = loadState();

const summarize = () => {
  const completedCount = Object.values(state.completed).filter(Boolean).length;
  const scoreValues = Object.values(state.scores).filter((value) => Number.isFinite(value));
  const averageScore = scoreValues.length
    ? Math.round(scoreValues.reduce((sum, value) => sum + value, 0) / scoreValues.length)
    : 0;

  document.getElementById("overview").innerHTML = `
    <div class="stat">
      <strong>Target role</strong>
      <span>${plan.targetRole}</span>
    </div>
    <div class="stat">
      <strong>Duration</strong>
      <span>${plan.duration}</span>
    </div>
    <div class="stat">
      <strong>Module completion</strong>
      <span>${completedCount} / ${plan.modules.length}</span>
    </div>
    <div class="stat">
      <strong>Average quiz score</strong>
      <span>${averageScore}%</span>
    </div>
    <div class="stat">
      <strong>Readiness target</strong>
      <span>${plan.readinessTarget}</span>
    </div>
  `;
};

const renderGoals = () => {
  document.getElementById("goals").innerHTML = plan.goals
    .map((goal) => `<span class="chip">${goal}</span>`)
    .join("");
};

const renderModules = () => {
  const modulesElement = document.getElementById("modules");

  modulesElement.innerHTML = plan.modules
    .map((module) => {
      const score = state.scores[module.id];

      return `
        <article class="module">
          <div class="module__header">
            <div>
              <p class="eyebrow">${module.weeks}</p>
              <h3>${module.title}</h3>
              <p>${module.objective}</p>
            </div>
            <div class="meta-list">
              <span class="meta-pill">${module.quiz.length} hard quiz questions</span>
              <span class="meta-pill">${module.deliverables.length} deliverables</span>
            </div>
          </div>

          <h4>Outcomes</h4>
          <ul>${module.outcomes.map((item) => `<li>${item}</li>`).join("")}</ul>

          <h4>Deliverables</h4>
          <ul>${module.deliverables.map((item) => `<li>${item}</li>`).join("")}</ul>

          <h4>Resources</h4>
          <div class="resource-list">
            ${module.resources
              .map((resource) => `<a class="resource-link" href="${resource.url}" target="_blank" rel="noreferrer">${resource.name}</a>`)
              .join("")}
          </div>

          <div class="quiz">
            <form data-module="${module.id}">
              ${module.quiz
                .map(
                  (question, questionIndex) => `
                    <fieldset>
                      <legend>${questionIndex + 1}. ${question.prompt}</legend>
                      ${question.options
                        .map(
                          (option, optionIndex) => `
                            <label>
                              <input type="radio" name="${module.id}-${questionIndex}" value="${optionIndex}" />
                              ${option}
                            </label>
                          `
                        )
                        .join("")}
                    </fieldset>
                  `
                )
                .join("")}
              <button type="submit">Score quiz</button>
            </form>
            <div class="module__footer">
              <label class="checkbox-row">
                <input type="checkbox" data-complete="${module.id}" ${state.completed[module.id] ? "checked" : ""} />
                Mark module deliverables complete
              </label>
              <span class="badge">${score !== undefined ? `Latest score: ${score}%` : "Not scored yet"}</span>
            </div>
            <div id="result-${module.id}"></div>
          </div>
        </article>
      `;
    })
    .join("");

  modulesElement.querySelectorAll("form").forEach((form) => {
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const module = plan.modules.find((entry) => entry.id === form.dataset.module);

      const answers = module.quiz.map((_, index) => {
        const selected = form.querySelector(`input[name="${module.id}-${index}"]:checked`);
        return selected ? Number(selected.value) : null;
      });

      const correct = answers.filter((answer, index) => answer === module.quiz[index].answer).length;
      const score = Math.round((correct / module.quiz.length) * 100);
      state.scores[module.id] = score;
      saveState(state);
      summarize();
      renderModules();

      const resultElement = document.getElementById(`result-${module.id}`);
      resultElement.className = `result ${score >= 80 ? "result--good" : "result--bad"}`;
      resultElement.innerHTML = `
        <p><strong>Score:</strong> ${score}%</p>
        <ul>
          ${module.quiz
            .map(
              (question, index) => `
                <li>
                  <strong>Q${index + 1}:</strong> ${answers[index] === question.answer ? "Correct" : "Review needed"} —
                  ${question.explanation}
                </li>
              `
            )
            .join("")}
        </ul>
      `;
    });
  });

  modulesElement.querySelectorAll("[data-complete]").forEach((checkbox) => {
    checkbox.addEventListener("change", (event) => {
      state.completed[event.target.dataset.complete] = event.target.checked;
      saveState(state);
      summarize();
      renderModules();
    });
  });
};

const renderFinalAssessment = () => {
  document.getElementById("global-assessment").innerHTML = plan.finalAssessment
    .map(
      (item) => `
        <article class="assessment-card">
          <h3>${item.title}</h3>
          <p>${item.summary}</p>
          <ul>${item.criteria.map((criterion) => `<li>${criterion}</li>`).join("")}</ul>
        </article>
      `
    )
    .join("");
};

const renderApplicationPlan = () => {
  document.getElementById("application-plan").innerHTML = plan.applicationPlan
    .map(
      (item) => `
        <article class="application-card">
          <h3>${item.title}</h3>
          <ul>${item.bullets.map((bullet) => `<li>${bullet}</li>`).join("")}</ul>
        </article>
      `
    )
    .join("");
};

summarize();
renderGoals();
renderModules();
renderFinalAssessment();
renderApplicationPlan();
