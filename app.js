const planEn = {
  duration: "20 weeks",
  targetRole: "Principal Software Engineer — DevEx, Engineering Excellence, GenAI / Agentic AI",
  readinessTarget: "Interview-ready with strong architecture, strategy, delivery, and assessment discipline",
  goals: [
    "Become current on GenAI for software development and coding agents",
    "Develop strong practical judgment for agentic systems, evals, and security",
    "Operate AI systems in production with LLMOps, cost, and reliability discipline",
    "Sharpen Principal-level DevEx and engineering excellence thinking",
    "Lead through influence, mentorship, and organizational design",
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
        { name: "Microsoft Learn: Generative AI", url: "https://learn.microsoft.com/en-us/ai/playbook/technology-guidance/generative-ai/" },
        { name: "Andrej Karpathy: Intro to LLMs", url: "https://www.youtube.com/watch?v=zjkBMFhNj_g" },
        { name: "Prompt Engineering Guide", url: "https://www.promptingguide.ai/" }
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
        { name: "LangChain overview", url: "https://python.langchain.com/docs/introduction/" },
        { name: "OpenAI: A practical guide to building agents", url: "https://cdn.openai.com/business-guides-and-resources/a-practical-guide-to-building-agents.pdf" },
        { name: "ReAct: Reasoning and acting in LLMs", url: "https://arxiv.org/abs/2210.03629" }
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
        { name: "Google Cloud: 2025 DORA report announcement", url: "https://cloud.google.com/blog/products/ai-machine-learning/announcing-the-2025-dora-report" },
        { name: "Hamel Husain: Your AI product needs evals", url: "https://hamel.dev/blog/posts/evals/" },
        { name: "OpenAI Evals framework", url: "https://github.com/openai/evals" }
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
        { name: "OWASP Top 10 for LLM Applications", url: "https://genai.owasp.org/llm-top-10/" },
        { name: "Model Context Protocol specification", url: "https://modelcontextprotocol.io/specification/2025-06-18" },
        { name: "NIST AI Risk Management Framework", url: "https://www.nist.gov/itl/ai-risk-management-framework" },
        { name: "Simon Willison on prompt injection", url: "https://simonwillison.net/series/prompt-injection/" }
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
      id: "llmops-cost",
      weeks: "Weeks 9-10",
      title: "LLMOps, production operations, and cost engineering",
      objective:
        "Learn to run GenAI systems in production: deployment patterns, model lifecycle, observability for LLM apps, latency engineering, capacity planning, and cost control at scale.",
      outcomes: [
        "Design deployment, versioning, and rollback strategies for models and prompts",
        "Instrument LLM applications with traces, quality signals, and cost telemetry",
        "Apply caching, routing, batching, and model-tiering to control latency and spend"
      ],
      deliverables: [
        "An operations runbook for an LLM-powered service covering rollout, monitoring, and incident response",
        "A cost model comparing model tiers, caching strategies, and routing policies for a target workload"
      ],
      resources: [
        { name: "OpenAI: production best practices", url: "https://platform.openai.com/docs/guides/production-best-practices" },
        { name: "Chip Huyen: AI engineering blog", url: "https://huyenchip.com/blog/" },
        { name: "OpenTelemetry: GenAI semantic conventions", url: "https://opentelemetry.io/docs/specs/semconv/gen-ai/" },
        { name: "Anthropic: prompt caching", url: "https://docs.anthropic.com/en/docs/build-with-claude/prompt-caching" },
        { name: "Databricks: The big book of MLOps", url: "https://www.databricks.com/resources/ebook/the-big-book-of-mlops" }
      ],
      quiz: [
        {
          prompt: "A production coding assistant sees p95 latency spikes and rising spend. Which lever usually delivers the largest immediate win without hurting quality?",
          options: [
            "Switch every request to the largest available model",
            "Add prompt and response caching plus routing simple requests to a smaller model",
            "Remove observability instrumentation to reduce overhead",
            "Increase the context window on all requests"
          ],
          answer: 1,
          explanation:
            "Caching and model-tier routing cut both latency and cost for the high-volume simple cases while preserving the strong model for hard requests."
        },
        {
          prompt: "Why should prompts and model versions be treated like code artifacts in production systems?",
          options: [
            "Because prompts compress better than code",
            "Because behavior changes silently otherwise, making regressions impossible to trace, review, or roll back",
            "Because model providers require it",
            "Because it eliminates the need for evals"
          ],
          answer: 1,
          explanation:
            "Versioned prompts and pinned models make behavior changes reviewable, testable, and reversible — the same discipline applied to code releases."
        },
        {
          prompt: "Which signal set gives the strongest production picture of an LLM feature's health?",
          options: [
            "Token counts alone",
            "Uptime of the model provider",
            "Latency, cost per request, quality evals on sampled traffic, and user feedback loops together",
            "Number of deployed prompt variants"
          ],
          answer: 2,
          explanation:
            "LLM operations require combining classic SLO signals with sampled quality evaluation and feedback, because a fast, cheap, wrong answer is still a failure."
        }
      ]
    },
    {
      id: "devex-platform",
      weeks: "Weeks 11-12",
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
        { name: "Puppet: State of platform engineering 2026", url: "https://www.puppet.com/resources/2026-state-of-platform-engineering" },
        { name: "The SPACE of developer productivity", url: "https://queue.acm.org/detail.cfm?id=3454124" },
        { name: "DevEx: what actually drives productivity", url: "https://queue.acm.org/detail.cfm?id=3595878" },
        { name: "Backstage developer portal", url: "https://backstage.io/docs/overview/what-is-backstage/" }
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
      weeks: "Weeks 13-14",
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
        { name: "Thoughtworks Technology Radar", url: "https://www.thoughtworks.com/radar" },
        { name: "Software Engineering at Google (free book)", url: "https://abseil.io/resources/swe-book" },
        { name: "Google testing blog", url: "https://testing.googleblog.com/" }
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
      weeks: "Weeks 15-16",
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
        { name: "Google Cloud architecture center", url: "https://cloud.google.com/architecture" },
        { name: "Architecture decision records", url: "https://adr.github.io/" },
        { name: "C4 model for architecture diagrams", url: "https://c4model.com/" }
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
      id: "leadership-influence",
      weeks: "Weeks 17-18",
      title: "Technical leadership, mentorship, and organizational influence",
      objective:
        "Master the people dimension of the Principal role: staff-plus archetypes, leading without authority, mentorship and sponsorship, technical writing, and driving change across organizational boundaries.",
      outcomes: [
        "Choose the right staff-plus operating mode for a given organizational context",
        "Build alignment across teams through writing, sponsorship, and coalition building",
        "Scale your impact through mentoring, delegation, and growing other senior engineers"
      ],
      deliverables: [
        "A written technical vision or strategy memo for an engineering organization",
        "A mentorship and sponsorship plan identifying engineers to grow and concrete actions"
      ],
      resources: [
        { name: "StaffEng: stories and guides for staff-plus engineers", url: "https://staffeng.com/" },
        { name: "LeadDev: staff-plus engineering", url: "https://leaddev.com/staffplus" },
        { name: "Will Larson: Staff engineer archetypes", url: "https://staffeng.com/guides/staff-archetypes/" },
        { name: "The Pragmatic Engineer blog", url: "https://blog.pragmaticengineer.com/" },
        { name: "Camille Fournier's blog", url: "https://skamille.medium.com/" }
      ],
      quiz: [
        {
          prompt: "You disagree with a direction chosen by another team that affects your platform. What is the strongest Principal-level first move?",
          options: [
            "Escalate immediately to their director",
            "Publicly document why their choice is wrong",
            "Understand their constraints directly, then work toward a shared decision with explicit tradeoffs",
            "Build a competing solution to prove your point"
          ],
          answer: 2,
          explanation:
            "Principal influence starts from understanding context and constraints, then aligning through tradeoff-driven discussion — escalation is a later resort, not a first move."
        },
        {
          prompt: "What most reliably scales a Principal engineer's impact beyond their own output?",
          options: [
            "Reviewing every significant pull request personally",
            "Growing other engineers through mentorship, clear standards, and delegated ownership",
            "Attending every architecture meeting",
            "Owning all critical-path code"
          ],
          answer: 1,
          explanation:
            "At Principal scope, leverage comes from multiplying others — mentorship, standards, and delegation outperform personal throughput."
        },
        {
          prompt: "Why is written communication disproportionately important at staff-plus levels?",
          options: [
            "Because meetings are always inefficient",
            "Because durable, asynchronous artifacts align large groups, survive personnel changes, and scale decisions beyond rooms you are in",
            "Because executives refuse verbal briefings",
            "Because documents replace the need for relationships"
          ],
          answer: 1,
          explanation:
            "Writing scales influence: RFCs, strategy memos, and decision records reach people and time horizons that conversations cannot."
        }
      ]
    },
    {
      id: "interview-readiness",
      weeks: "Weeks 19-20",
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
        { name: "Thoughtworks Technology Radar", url: "https://www.thoughtworks.com/radar" },
        { name: "System design primer", url: "https://github.com/donnemartin/system-design-primer" },
        { name: "Tech Interview Handbook", url: "https://www.techinterviewhandbook.org/" }
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

const planFr = {
  duration: "20 semaines",
  targetRole: "Ingénieur logiciel principal — DevEx, excellence en ingénierie, GenAI / IA agentique",
  readinessTarget: "Prêt pour les entretiens avec une solide discipline d'architecture, de stratégie, de livraison et d'évaluation",
  goals: [
    "Se mettre à jour sur la GenAI pour le développement logiciel et les agents de codage",
    "Développer un solide jugement pratique sur les systèmes agentiques, les évaluations et la sécurité",
    "Exploiter des systèmes d'IA en production avec une discipline LLMOps, de coûts et de fiabilité",
    "Affûter une pensée DevEx et excellence en ingénierie de niveau Principal",
    "Diriger par l'influence, le mentorat et le design organisationnel",
    "S'exercer à des contrôles de connaissances difficiles et à la décision par scénarios",
    "Terminer avec un portfolio d'évaluation finale utilisable en entretien"
  ],
  modules: [
    {
      id: "foundations",
      weeks: "Semaines 1-2",
      title: "Fondamentaux des LLM et de la GenAI pour développeurs",
      objective:
        "Construire un modèle mental solide des systèmes LLM modernes, des compromis d'inférence, des mécanismes de prompting, des embeddings, des limites du fine-tuning et des contraintes de production.",
      outcomes: [
        "Expliquer où s'insèrent le prompting, la récupération, l'usage d'outils et le fine-tuning",
        "Raisonner sur la latence, les fenêtres de contexte, l'ancrage, le risque d'hallucination et les coûts",
        "Traduire les capacités des modèles en choix d'architecture logicielle"
      ],
      deliverables: [
        "Une note d'architecture d'une page comparant les conceptions prompt seul, RAG et usage d'outils",
        "Un tableau de compromis latence, qualité et coût pour trois choix de modèles"
      ],
      resources: [
        { name: "OpenAI developer guides", url: "https://platform.openai.com/docs/guides" },
        { name: "Anthropic documentation", url: "https://docs.anthropic.com/" },
        { name: "Microsoft Learn: Generative AI", url: "https://learn.microsoft.com/en-us/ai/playbook/technology-guidance/generative-ai/" },
        { name: "Andrej Karpathy: Intro to LLMs", url: "https://www.youtube.com/watch?v=zjkBMFhNj_g" },
        { name: "Prompt Engineering Guide", url: "https://www.promptingguide.ai/" }
      ],
      quiz: [
        {
          prompt: "Vous avez besoin d'un comportement déterministe pour un assistant de migration de code avec des besoins de contexte modérés. Quel changement de conception apporte généralement la plus grande amélioration de qualité avant le fine-tuning ?",
          options: [
            "Augmenter la température pour que le modèle explore plus d'options",
            "Ajouter de la récupération, des exemples canoniques et des contraintes de sortie explicites",
            "Passer immédiatement à un modèle d'embeddings plus grand",
            "Supprimer les instructions système pour réduire la longueur du prompt"
          ],
          answer: 1,
          explanation:
            "Pour la plupart des outils développeurs, l'ancrage et des contraintes claires améliorent la fiabilité plus vite que le fine-tuning. La température augmente l'exploration, pas le déterminisme."
        },
        {
          prompt: "Quelle affirmation décrit le mieux la frontière entre RAG et fine-tuning ?",
          options: [
            "Le RAG modifie les poids du modèle, tandis que le fine-tuning modifie les gabarits de prompt",
            "Le RAG fournit du contexte externe à l'exécution, tandis que le fine-tuning modifie le comportement du modèle par l'entraînement",
            "Ils sont fonctionnellement identiques pour les assistants de codage",
            "Le fine-tuning est préférable dès que les documents changent fréquemment"
          ],
          answer: 1,
          explanation:
            "Le RAG est un ancrage à l'exécution ; le fine-tuning met à jour le comportement du modèle. Une connaissance qui change souvent favorise généralement la récupération."
        },
        {
          prompt: "Quelle est la meilleure raison d'éviter de résumer le code source trop tôt dans un pipeline d'assistant de codage ?",
          options: [
            "Les résumés réduisent toujours l'usage de tokens mais cassent le cache",
            "Un résumé précoce peut supprimer les détails exacts nécessaires à un raisonnement correct sur le code",
            "Les résumés rendent les embeddings impossibles",
            "Les résumés empêchent l'appel de fonctions"
          ],
          answer: 1,
          explanation:
            "Le travail de codage agentique dépend souvent de la préservation des signatures exactes, des sites d'appel et des cas limites qui peuvent être perdus par un résumé prématuré."
        }
      ]
    },
    {
      id: "agentic-systems",
      weeks: "Semaines 3-4",
      title: "Ingénierie des agents et systèmes utilisant des outils",
      objective:
        "Comprendre les patterns mono-agent et multi-agents, la mémoire, la planification, le routage d'outils, l'orchestration et les modes de défaillance dans les workflows de développement logiciel.",
      outcomes: [
        "Choisir l'architecture d'agent viable la plus simple pour une tâche donnée",
        "Expliquer quand les boucles, planificateurs, critiques ou la décomposition multi-agents se justifient",
        "Identifier les risques d'usage incontrôlé d'outils, de dérive de contexte et d'autonomie non bornée"
      ],
      deliverables: [
        "Un document de conception pour un agent d'analyse de dépôt avec autonomie bornée",
        "Un catalogue des modes de défaillance pour les erreurs d'outils, la mémoire obsolète et les actions dangereuses"
      ],
      resources: [
        { name: "Anthropic: Building effective agents", url: "https://www.anthropic.com/engineering/building-effective-agents" },
        { name: "Model Context Protocol introduction", url: "https://modelcontextprotocol.io/introduction" },
        { name: "LangChain overview", url: "https://python.langchain.com/docs/introduction/" },
        { name: "OpenAI: A practical guide to building agents", url: "https://cdn.openai.com/business-guides-and-resources/a-practical-guide-to-building-agents.pdf" },
        { name: "ReAct: Reasoning and acting in LLMs", url: "https://arxiv.org/abs/2210.03629" }
      ],
      quiz: [
        {
          prompt: "Quand une architecture multi-agents est-elle généralement justifiée ?",
          options: [
            "Chaque fois que l'équipe veut une architecture moderne",
            "Quand des sous-problèmes indépendants nécessitent des outils différents ou un contexte isolé de longue durée",
            "Chaque fois que la latence est la priorité absolue",
            "Uniquement avec MCP"
          ],
          answer: 1,
          explanation:
            "Les conceptions multi-agents sont pertinentes quand la décomposition apporte une vraie valeur, pas comme choix par défaut."
        },
        {
          prompt: "Quelle est la meilleure protection contre un agent exécutant une séquence d'actions d'outils dangereuse ?",
          options: [
            "Augmenter la limite de tokens pour que l'agent raisonne plus longtemps",
            "Autoriser un accès shell libre mais ajouter plus d'avertissements dans le prompt",
            "Restreindre les permissions des outils, exiger des points de contrôle explicites et réviser les actions critiques",
            "Stocker plus de mémoire à long terme"
          ],
          answer: 2,
          explanation:
            "La sécurité vient des permissions, de l'exécution bornée, des points de contrôle et des actions révisables, plus que du prompting seul."
        },
        {
          prompt: "Quel signal suggère le plus fortement que votre boucle de planification est sur-conçue ?",
          options: [
            "L'agent résout la tâche en une passe avec un appel d'outil direct",
            "L'agent a toujours besoin d'une base vectorielle",
            "Le système utilise des sorties JSON",
            "L'interface affiche les étapes de raisonnement"
          ],
          answer: 0,
          explanation:
            "Si un chemin direct fonctionne de manière fiable, ajouter des planificateurs et des critiques augmente généralement le coût et la complexité sans améliorer les résultats."
        }
      ]
    },
    {
      id: "retrieval-evals",
      weeks: "Semaines 5-6",
      title: "Récupération, ancrage et systèmes d'évaluation",
      objective:
        "Concevoir des workflows de récupération et d'évaluation à haut signal pour les outils développeurs internes, les systèmes de connaissances et les assistants de support.",
      outcomes: [
        "Définir des évaluations hors ligne et en ligne reflétant de vraies tâches d'ingénierie",
        "Concevoir des stratégies de récupération qui préservent la confiance et la provenance",
        "Utiliser des taxonomies d'échec plutôt que de simples scores agrégés"
      ],
      deliverables: [
        "Un jeu de données de référence de 25 questions d'ingénierie avec les sources de preuve attendues",
        "Une grille d'évaluation pour l'exactitude, la qualité des citations, la latence et la qualité des refus"
      ],
      resources: [
        { name: "OpenAI guides", url: "https://platform.openai.com/docs/guides" },
        { name: "LlamaIndex documentation", url: "https://docs.llamaindex.ai/" },
        { name: "Google Cloud: 2025 DORA report announcement", url: "https://cloud.google.com/blog/products/ai-machine-learning/announcing-the-2025-dora-report" },
        { name: "Hamel Husain: Your AI product needs evals", url: "https://hamel.dev/blog/posts/evals/" },
        { name: "OpenAI Evals framework", url: "https://github.com/openai/evals" }
      ],
      quiz: [
        {
          prompt: "Quelle paire de métriques est la plus dangereuse à optimiser isolément pour un assistant RAG ?",
          options: [
            "Latence et profondeur de récupération",
            "Longueur des réponses et usage de tokens",
            "Score moyen de benchmark et confiance des utilisateurs",
            "Précision@k et taux d'hallucination"
          ],
          answer: 2,
          explanation:
            "Les scores moyennés peuvent masquer des échecs de confiance catastrophiques. Une évaluation de niveau Principal doit préserver la visibilité des échecs, pas l'aplatir."
        },
        {
          prompt: "Pourquoi préserver les citations ou traces de sources dans un assistant d'ingénierie interne ?",
          options: [
            "Pour réduire le coût du modèle",
            "Pour permettre à l'utilisateur de valider la réponse et d'accélérer une investigation plus poussée",
            "Parce que les citations empêchent automatiquement les hallucinations",
            "Parce que les embeddings l'exigent"
          ],
          answer: 1,
          explanation:
            "La visibilité des sources est essentielle pour la confiance, le débogage et l'adoption, même si elle n'élimine pas automatiquement les hallucinations."
        },
        {
          prompt: "Quelle est la meilleure raison de créer des jeux d'évaluation spécifiques aux tâches plutôt que de se fier uniquement aux benchmarks publics ?",
          options: [
            "Les benchmarks publics sont toujours obsolètes",
            "Les workflows internes ont des exigences de risque, de contexte et de qualité différentes",
            "Les évaluations spécifiques aux tâches n'ont pas besoin d'étiquettes",
            "Elles rendent les expérimentations en ligne inutiles"
          ],
          answer: 1,
          explanation:
            "Les outils développeurs réussissent ou échouent sur des workflows, attentes et contraintes locaux que les benchmarks génériques capturent rarement."
        }
      ]
    },
    {
      id: "security-governance",
      weeks: "Semaines 7-8",
      title: "Sécurité GenAI, gouvernance et livraison responsable",
      objective:
        "Se préparer à discuter d'injection de prompt, de fuite de données, d'autorisation, d'auditabilité, de gouvernance des modèles et de patterns de déploiement sécurisés pour les produits d'IA.",
      outcomes: [
        "Identifier les modes de défaillance courants de sécurité des LLM et systèmes agentiques",
        "Concevoir des frontières de politique pour les outils, la mémoire et les données sensibles",
        "Intégrer la sécurité et la conformité dans la livraison au lieu de les traiter comme une revue tardive"
      ],
      deliverables: [
        "Un modèle de menaces pour un assistant de codage interne",
        "Une checklist sécurisée par défaut pour les prompts, les politiques d'outils et la journalisation"
      ],
      resources: [
        { name: "OWASP GenAI Security Project", url: "https://genai.owasp.org/" },
        { name: "OWASP Top 10 for LLM Applications", url: "https://genai.owasp.org/llm-top-10/" },
        { name: "Model Context Protocol specification", url: "https://modelcontextprotocol.io/specification/2025-06-18" },
        { name: "NIST AI Risk Management Framework", url: "https://www.nist.gov/itl/ai-risk-management-framework" },
        { name: "Simon Willison on prompt injection", url: "https://simonwillison.net/series/prompt-injection/" }
      ],
      quiz: [
        {
          prompt: "Un assistant de dépôt lit du markdown non fiable provenant d'une pull request puis appelle des outils de déploiement. Quel est le risque principal ?",
          options: [
            "Surapprentissage du modèle",
            "Injection de prompt franchissant une frontière de confiance vers des actions privilégiées",
            "Incompatibilité de dimension des embeddings",
            "Sous-utilisation des tokens"
          ],
          answer: 1,
          explanation:
            "Le vrai danger est qu'un contenu non fiable influence un comportement privilégié via les outils ou les instructions."
        },
        {
          prompt: "Quelle mitigation est la plus solide par défaut pour des agents utilisant des outils avec accès à des systèmes sensibles ?",
          options: [
            "Utiliser un échantillonnage top-p plus élevé",
            "Séparer les outils en lecture seule et en écriture, et exiger des approbations explicites pour les effets de bord",
            "Stocker définitivement tous les prompts utilisateurs pour le débogage",
            "Laisser l'agent auto-approuver ses relances"
          ],
          answer: 1,
          explanation:
            "La séparation des permissions et les portes d'approbation explicites réduisent le rayon d'impact de l'injection de prompt, du mauvais routage et des actions hallucinées."
        },
        {
          prompt: "Pourquoi l'auditabilité est-elle particulièrement importante pour les workflows développeurs augmentés par l'IA ?",
          options: [
            "Parce qu'elle réduit le coût de calcul",
            "Parce qu'elle permet de reconstituer les décisions, preuves et actions lors d'incidents ou de revues de politique",
            "Parce qu'elle empêche la dérive du modèle",
            "Parce qu'elle remplace la revue de code"
          ],
          answer: 1,
          explanation:
            "La gouvernance de niveau Principal exige la traçabilité des actions, décisions et preuves, surtout quand l'automatisation touche des systèmes de production."
        }
      ]
    },
    {
      id: "llmops-cost",
      weeks: "Semaines 9-10",
      title: "LLMOps, opérations en production et ingénierie des coûts",
      objective:
        "Apprendre à exploiter des systèmes GenAI en production : patterns de déploiement, cycle de vie des modèles, observabilité des applications LLM, ingénierie de la latence, planification de capacité et maîtrise des coûts à l'échelle.",
      outcomes: [
        "Concevoir des stratégies de déploiement, de versionnage et de rollback pour les modèles et les prompts",
        "Instrumenter les applications LLM avec des traces, des signaux de qualité et une télémétrie des coûts",
        "Appliquer le cache, le routage, le batching et la hiérarchisation de modèles pour maîtriser latence et dépenses"
      ],
      deliverables: [
        "Un runbook d'exploitation pour un service propulsé par LLM couvrant déploiement, supervision et réponse aux incidents",
        "Un modèle de coûts comparant niveaux de modèles, stratégies de cache et politiques de routage pour une charge cible"
      ],
      resources: [
        { name: "OpenAI: production best practices", url: "https://platform.openai.com/docs/guides/production-best-practices" },
        { name: "Chip Huyen: AI engineering blog", url: "https://huyenchip.com/blog/" },
        { name: "OpenTelemetry: GenAI semantic conventions", url: "https://opentelemetry.io/docs/specs/semconv/gen-ai/" },
        { name: "Anthropic: prompt caching", url: "https://docs.anthropic.com/en/docs/build-with-claude/prompt-caching" },
        { name: "Databricks: The big book of MLOps", url: "https://www.databricks.com/resources/ebook/the-big-book-of-mlops" }
      ],
      quiz: [
        {
          prompt: "Un assistant de codage en production subit des pics de latence p95 et des dépenses croissantes. Quel levier apporte généralement le plus grand gain immédiat sans nuire à la qualité ?",
          options: [
            "Basculer chaque requête vers le plus grand modèle disponible",
            "Ajouter un cache de prompts et de réponses et router les requêtes simples vers un modèle plus petit",
            "Supprimer l'instrumentation d'observabilité pour réduire la surcharge",
            "Augmenter la fenêtre de contexte sur toutes les requêtes"
          ],
          answer: 1,
          explanation:
            "Le cache et le routage par niveau de modèle réduisent à la fois la latence et le coût pour les cas simples à fort volume, tout en réservant le modèle puissant aux requêtes difficiles."
        },
        {
          prompt: "Pourquoi les prompts et versions de modèles doivent-ils être traités comme des artefacts de code en production ?",
          options: [
            "Parce que les prompts se compressent mieux que le code",
            "Parce que sinon le comportement change silencieusement, rendant les régressions impossibles à tracer, réviser ou annuler",
            "Parce que les fournisseurs de modèles l'exigent",
            "Parce que cela élimine le besoin d'évaluations"
          ],
          answer: 1,
          explanation:
            "Des prompts versionnés et des modèles épinglés rendent les changements de comportement révisables, testables et réversibles — la même discipline que pour les releases de code."
        },
        {
          prompt: "Quel ensemble de signaux donne la vision la plus solide de la santé d'une fonctionnalité LLM en production ?",
          options: [
            "Le nombre de tokens seul",
            "La disponibilité du fournisseur de modèle",
            "Latence, coût par requête, évaluations de qualité sur trafic échantillonné et boucles de retour utilisateurs ensemble",
            "Le nombre de variantes de prompts déployées"
          ],
          answer: 2,
          explanation:
            "L'exploitation des LLM exige de combiner les signaux SLO classiques avec l'évaluation de qualité échantillonnée et le feedback, car une réponse rapide, bon marché et fausse reste un échec."
        }
      ]
    },
    {
      id: "devex-platform",
      weeks: "Semaines 11-12",
      title: "Developer Experience et ingénierie de plateforme",
      objective:
        "Développer une solide pensée produit autour des plateformes internes, des systèmes en libre-service, des parcours développeurs et de l'amélioration mesurable de la productivité.",
      outcomes: [
        "Relier le travail DevEx à des résultats métier et d'ingénierie mesurables",
        "Utiliser DORA, SPACE et des signaux qualitatifs sans abus de métriques",
        "Concevoir les plateformes internes comme des produits plutôt que des surfaces de contrôle"
      ],
      deliverables: [
        "Un tableau de bord DevEx pour une organisation d'ingénierie",
        "Un brief produit pour une capacité de plateforme interne avec des métriques d'adoption"
      ],
      resources: [
        { name: "DORA insights", url: "https://dora.dev/insights/" },
        { name: "Platform Engineering", url: "https://platformengineering.org/" },
        { name: "Puppet: State of platform engineering 2026", url: "https://www.puppet.com/resources/2026-state-of-platform-engineering" },
        { name: "The SPACE of developer productivity", url: "https://queue.acm.org/detail.cfm?id=3454124" },
        { name: "DevEx: what actually drives productivity", url: "https://queue.acm.org/detail.cfm?id=3595878" },
        { name: "Backstage developer portal", url: "https://backstage.io/docs/overview/what-is-backstage/" }
      ],
      quiz: [
        {
          prompt: "Quel est le mode d'échec le plus courant quand les équipes adoptent les métriques DORA pour le travail DevEx ?",
          options: [
            "Elles collectent trop de feedback qualitatif",
            "Elles utilisent les métriques comme cibles d'optimisation locale sans comprendre le contexte ni les compromis",
            "Elles refusent de comparer les équipes",
            "Elles se concentrent trop sur l'apprentissage des incidents"
          ],
          answer: 1,
          explanation:
            "Les métriques deviennent nuisibles quand elles servent de tableau de scores plutôt que de signaux liés aux résultats des développeurs et de la livraison."
        },
        {
          prompt: "Qu'est-ce qui démontre le mieux un état d'esprit produit en ingénierie de plateforme ?",
          options: [
            "Imposer l'usage des outils sans boucles de feedback",
            "Optimiser uniquement pour la standardisation",
            "Traiter les ingénieurs internes comme des clients, mesurer l'adoption et itérer sur les frictions",
            "Construire plus de templates que les équipes n'en demandent"
          ],
          answer: 2,
          explanation:
            "Les plateformes internes réussissent quand elles réduisent la friction et gagnent la confiance par une itération et des preuves dignes d'un produit."
        },
        {
          prompt: "Quelle combinaison donne la compréhension DevEx la plus solide ?",
          options: [
            "Uniquement les données d'enquêtes",
            "Uniquement les métriques de déploiement",
            "Métriques de livraison, feedback qualitatif, traces de workflows et contexte métier",
            "Uniquement le nombre de tickets"
          ],
          answer: 2,
          explanation:
            "L'expérience développeur est multidimensionnelle et nécessite des signaux quantitatifs et qualitatifs ensemble."
        }
      ]
    },
    {
      id: "excellence-reliability",
      weeks: "Semaines 13-14",
      title: "Excellence en ingénierie, fiabilité et maturité opérationnelle",
      objective:
        "Renforcer les connaissances de niveau Principal en stratégie de test, observabilité, ingénierie de release, SRE, gestion d'incidents et économie de la qualité.",
      outcomes: [
        "Définir des stratégies de qualité en couches : tests unitaires, d'intégration, de bout en bout et contrôles en production",
        "Relier la conception de l'observabilité à un diagnostic plus rapide et à des changements plus sûrs",
        "Aborder les incidents comme des systèmes d'apprentissage plutôt que des exercices de blâme"
      ],
      deliverables: [
        "Une stratégie de test pour une équipe plateforme de taille moyenne",
        "Un modèle de revue d'incident avec des actions correctives systémiques"
      ],
      resources: [
        { name: "Google SRE book", url: "https://sre.google/sre-book/table-of-contents/" },
        { name: "OpenTelemetry documentation", url: "https://opentelemetry.io/docs/" },
        { name: "Thoughtworks Technology Radar", url: "https://www.thoughtworks.com/radar" },
        { name: "Software Engineering at Google (free book)", url: "https://abseil.io/resources/swe-book" },
        { name: "Google testing blog", url: "https://testing.googleblog.com/" }
      ],
      quiz: [
        {
          prompt: "Quelle est la meilleure raison d'investir dans une télémétrie de haute qualité pour les plateformes développeurs ?",
          options: [
            "Elle réduit le besoin de gestion de produit",
            "Elle rend les tableaux de bord plus modernes",
            "Elle raccourcit les boucles de détection et de diagnostic des pannes et régressions visibles par les développeurs",
            "Elle remplace la réponse aux incidents"
          ],
          answer: 2,
          explanation:
            "La télémétrie est précieuse parce qu'elle améliore la détection, le diagnostic et la vitesse de décision quand les outils internes cassent."
        },
        {
          prompt: "Quelle affirmation correspond le mieux à un état d'esprit d'excellence en ingénierie ?",
          options: [
            "La qualité appartient surtout à la QA",
            "Le travail de fiabilité ralentit le produit et doit être différé",
            "La qualité, l'observabilité, la sécurité des releases et l'apprentissage des incidents sont des capacités systémiques partagées",
            "Les post-mortems doivent se concentrer sur la personne qui a mergé le changement"
          ],
          answer: 2,
          explanation:
            "L'excellence en ingénierie est systémique. Elle traite la fiabilité et la qualité comme des capacités partagées dans toute l'organisation."
        },
        {
          prompt: "Quelle est la principale faiblesse de s'appuyer uniquement sur des tests de bout en bout pour une plateforme d'ingénierie complexe ?",
          options: [
            "Ils sont trop déterministes",
            "Ils sont coûteux, lents et localisent mal les pannes sans couches de tests de plus bas niveau",
            "Ils ne peuvent pas couvrir les parcours utilisateurs",
            "Ils accélèrent la CI"
          ],
          answer: 1,
          explanation:
            "Une pyramide de tests équilibrée ou un portefeuille de tests est nécessaire parce que les vérifications de bout en bout seules sont lentes et faibles en diagnostic."
        }
      ]
    },
    {
      id: "principal-systems",
      weeks: "Semaines 15-16",
      title: "Architecture, influence et stratégie de niveau Principal",
      objective:
        "Se préparer à diriger par l'architecture, les cadres de décision, les feuilles de route et l'influence transverse plutôt que par la seule profondeur d'implémentation.",
      outcomes: [
        "Cadrer les grandes décisions techniques avec compromis, contraintes et résultats mesurables",
        "Conduire le changement organisationnel via les RFC, les standards et la communication exécutive",
        "Équilibrer innovation, risque et adoption dans les stratégies de plateformes augmentées par l'IA"
      ],
      deliverables: [
        "Une RFC pour introduire une capacité de plateforme d'IA interne",
        "Une cartographie des parties prenantes et un plan d'adoption pour la RFC"
      ],
      resources: [
        { name: "DORA capabilities", url: "https://dora.dev/capabilities/" },
        { name: "Team Topologies", url: "https://teamtopologies.com/" },
        { name: "Google Cloud architecture center", url: "https://cloud.google.com/architecture" },
        { name: "Architecture decision records", url: "https://adr.github.io/" },
        { name: "C4 model for architecture diagrams", url: "https://c4model.com/" }
      ],
      quiz: [
        {
          prompt: "Quel comportement distingue le plus clairement un ingénieur Principal d'un ingénieur senior en entretien ?",
          options: [
            "Retenir plus de syntaxe de mémoire",
            "Piloter des décisions à l'échelle de l'organisation par des compromis clairs, de l'alignement et une direction technique de long terme",
            "Écrire le code le plus rapide dans une épreuve de codage",
            "Éviter les discussions non techniques"
          ],
          answer: 1,
          explanation:
            "Le périmètre Principal se définit par la stratégie, le levier organisationnel, la qualité des décisions et la pensée systémique de long terme."
        },
        {
          prompt: "Une plateforme d'IA interne proposée accélérerait certaines équipes mais ajoute de la friction de gouvernance. Quelle est la meilleure étape suivante ?",
          options: [
            "La lancer immédiatement dans toute l'organisation",
            "La rejeter parce que la gouvernance ralentit toujours l'innovation",
            "La piloter avec des équipes cibles, définir des métriques de résultats et itérer sur les garde-fous et l'UX",
            "La transformer en projet de hackathon"
          ],
          answer: 2,
          explanation:
            "Une approche Principal utilise un déploiement ciblé, un apprentissage mesurable et une conception itérative des garde-fous."
        },
        {
          prompt: "Quel est le meilleur indicateur de la santé de votre processus de revue d'architecture ?",
          options: [
            "Chaque proposition est approuvée",
            "Les documents sont longs et exhaustifs",
            "Les compromis importants émergent tôt et les équipes avancent ensuite avec clarté",
            "Seuls les ingénieurs staff-plus parlent pendant la revue"
          ],
          answer: 2,
          explanation:
            "L'objectif de la revue d'architecture est de meilleures décisions et de l'alignement, pas de la cérémonie."
        }
      ]
    },
    {
      id: "leadership-influence",
      weeks: "Semaines 17-18",
      title: "Leadership technique, mentorat et influence organisationnelle",
      objective:
        "Maîtriser la dimension humaine du rôle Principal : archétypes staff-plus, diriger sans autorité, mentorat et sponsoring, écriture technique et conduite du changement au-delà des frontières organisationnelles.",
      outcomes: [
        "Choisir le bon mode opératoire staff-plus pour un contexte organisationnel donné",
        "Construire l'alignement entre équipes par l'écriture, le sponsoring et la construction de coalitions",
        "Démultiplier son impact par le mentorat, la délégation et la croissance d'autres ingénieurs seniors"
      ],
      deliverables: [
        "Une vision technique écrite ou un mémo de stratégie pour une organisation d'ingénierie",
        "Un plan de mentorat et de sponsoring identifiant les ingénieurs à faire grandir et des actions concrètes"
      ],
      resources: [
        { name: "StaffEng: stories and guides for staff-plus engineers", url: "https://staffeng.com/" },
        { name: "LeadDev: staff-plus engineering", url: "https://leaddev.com/staffplus" },
        { name: "Will Larson: Staff engineer archetypes", url: "https://staffeng.com/guides/staff-archetypes/" },
        { name: "The Pragmatic Engineer blog", url: "https://blog.pragmaticengineer.com/" },
        { name: "Camille Fournier's blog", url: "https://skamille.medium.com/" }
      ],
      quiz: [
        {
          prompt: "Vous êtes en désaccord avec une direction prise par une autre équipe qui affecte votre plateforme. Quel est le meilleur premier geste de niveau Principal ?",
          options: [
            "Escalader immédiatement vers leur directeur",
            "Documenter publiquement pourquoi leur choix est mauvais",
            "Comprendre directement leurs contraintes, puis travailler vers une décision partagée avec des compromis explicites",
            "Construire une solution concurrente pour prouver votre point"
          ],
          answer: 2,
          explanation:
            "L'influence Principal commence par la compréhension du contexte et des contraintes, puis l'alignement par la discussion des compromis — l'escalade est un recours ultérieur, pas un premier geste."
        },
        {
          prompt: "Qu'est-ce qui démultiplie le plus sûrement l'impact d'un ingénieur Principal au-delà de sa propre production ?",
          options: [
            "Réviser personnellement chaque pull request significative",
            "Faire grandir d'autres ingénieurs par le mentorat, des standards clairs et une propriété déléguée",
            "Assister à chaque réunion d'architecture",
            "Posséder tout le code du chemin critique"
          ],
          answer: 1,
          explanation:
            "Au niveau Principal, le levier vient de la multiplication des autres — mentorat, standards et délégation surpassent le débit personnel."
        },
        {
          prompt: "Pourquoi la communication écrite est-elle disproportionnément importante aux niveaux staff-plus ?",
          options: [
            "Parce que les réunions sont toujours inefficaces",
            "Parce que des artefacts durables et asynchrones alignent de grands groupes, survivent aux changements de personnel et étendent les décisions au-delà des salles où vous êtes",
            "Parce que les dirigeants refusent les briefings oraux",
            "Parce que les documents remplacent le besoin de relations"
          ],
          answer: 1,
          explanation:
            "L'écriture démultiplie l'influence : RFC, mémos de stratégie et registres de décisions atteignent des personnes et des horizons temporels que les conversations ne peuvent pas atteindre."
        }
      ]
    },
    {
      id: "interview-readiness",
      weeks: "Semaines 19-20",
      title: "Préparation aux entretiens et exercices de communication",
      objective:
        "Transformer les connaissances en performance d'entretien reproductible : conception de systèmes, récits de leadership, stratégie technique et jugement produit IA.",
      outcomes: [
        "Donner des réponses concises de niveau exécutif avec de la profondeur technique en dessous",
        "Présenter des récits cohérents sur la DevEx, l'excellence en ingénierie et l'adoption de l'IA",
        "Défendre des choix d'architecture et de feuille de route sous pression"
      ],
      deliverables: [
        "Une banque de 15 récits STAR avec métriques et leçons apprises",
        "Trois conceptions de systèmes prêtes pour le tableau blanc : assistant de codage, plateforme d'IA interne et système d'insights d'ingénierie"
      ],
      resources: [
        { name: "OpenAI guides", url: "https://platform.openai.com/docs/guides" },
        { name: "Anthropic docs", url: "https://docs.anthropic.com/" },
        { name: "Thoughtworks Technology Radar", url: "https://www.thoughtworks.com/radar" },
        { name: "System design primer", url: "https://github.com/donnemartin/system-design-primer" },
        { name: "Tech Interview Handbook", url: "https://www.techinterviewhandbook.org/" }
      ],
      quiz: [
        {
          prompt: "Qu'est-ce qui rend généralement une réponse de niveau Principal faible même quand l'idée technique est correcte ?",
          options: [
            "Utiliser des diagrammes",
            "Ne pas relier la décision à l'impact organisationnel, à l'adoption et aux compromis",
            "Mentionner des risques",
            "Fournir des métriques"
          ],
          answer: 1,
          explanation:
            "À ce niveau, les réponses solides relient le détail d'implémentation à la valeur organisationnelle, à la conduite du changement et aux preuves."
        },
        {
          prompt: "Lors d'un entretien de conception de système, que faire en premier après avoir clarifié les exigences ?",
          options: [
            "Se lancer directement dans la conception du schéma de base de données",
            "Énoncer les critères de succès, les contraintes et le contexte opérationnel avant la conception détaillée",
            "Discuter immédiatement de chaque cas limite possible",
            "Commencer à coder l'API"
          ],
          answer: 1,
          explanation:
            "Un candidat Principal doit cadrer le problème, les critères de succès et les contraintes avant de s'engager dans des choix de conception."
        },
        {
          prompt: "Quel artefact de préparation est le plus réutilisable dans les entretiens de haut niveau ?",
          options: [
            "Une liste de buzzwords mémorisée",
            "Un cadre de décision personnel reliant objectifs métier, risques, métriques et choix d'architecture",
            "Une liste d'anecdotes sur les langages",
            "Une bibliothèque d'icônes UML génériques"
          ],
          answer: 1,
          explanation:
            "Des cadres réutilisables aident à répondre avec cohérence dans les entretiens de leadership, d'architecture et de stratégie IA."
        }
      ]
    }
  ],
  finalAssessment: [
    {
      title: "Étude de cas d'architecture",
      summary: "Concevoir un assistant de codage IA interne pour une organisation de 600 ingénieurs.",
      criteria: [
        "Énoncer les objectifs, les utilisateurs et les contraintes opérationnelles",
        "Décrire les frontières de modèle, de récupération, d'outils et de politiques",
        "Couvrir la fiabilité, l'observabilité et la stratégie de déploiement",
        "Défendre les compromis face aux questions"
      ]
    },
    {
      title: "Stratégie d'excellence en ingénierie",
      summary: "Créer une feuille de route DevEx et plateforme sur 12 mois avec des métriques de succès.",
      criteria: [
        "Utiliser ensemble DORA, le feedback qualitatif et les métriques d'adoption",
        "Prioriser la feuille de route avec des compromis explicites",
        "Montrer une gouvernance sans créer de friction excessive",
        "Expliquer comment gagner l'adoption"
      ]
    },
    {
      title: "Revue de sécurité et de gouvernance",
      summary: "Auditer un système agentique contre l'injection de prompt, la fuite de données et l'usage dangereux d'outils.",
      criteria: [
        "Identifier les frontières de confiance et les actions privilégiées",
        "Proposer des mitigations contre l'injection de prompt et l'usage abusif de la mémoire",
        "Spécifier les mécanismes d'approbation, d'audit et d'incident",
        "Signaler les risques résiduels et les compromis acceptables"
      ]
    },
    {
      title: "Exercice d'incident et de fiabilité",
      summary: "Mener une analyse post-incident pour une panne de plateforme développeur propulsée par l'IA.",
      criteria: [
        "Reconstituer la détection, l'impact et la chronologie",
        "Séparer les causes, les facteurs contributifs et les signaux manqués",
        "Recommander des actions correctives systémiques",
        "Relier les correctifs à l'observabilité et aux pratiques de release"
      ]
    },
    {
      title: "Panel de communication exécutive",
      summary: "Présenter la stratégie à la direction de l'ingénierie et défendre l'investissement.",
      criteria: [
        "Communiquer clairement à l'altitude exécutive",
        "Traduire les détails techniques profonds en valeur métier",
        "Gérer les objections sur le coût, la sécurité et l'adoption",
        "Conclure avec des résultats mesurables et les prochaines étapes"
      ]
    },
    {
      title: "Seuil de préparation",
      summary: "Ne valider que lorsque la profondeur technique et la communication de niveau Principal sont solides.",
      criteria: [
        "Moyenne des quiz de modules supérieure ou égale à 80 %",
        "Tous les livrables terminés et revus",
        "Capstone noté fort dans au moins quatre dimensions sur cinq",
        "Capable d'expliquer les compromis sans approximation"
      ]
    }
  ],
  applicationPlan: [
    {
      title: "Périmètre produit",
      bullets: [
        "Parcours structurés pour la GenAI, les systèmes d'agents, la DevEx, l'excellence en ingénierie et les entretiens",
        "Curation de ressources avec métadonnées de fraîcheur et revue périodique",
        "Quiz difficiles, notation par scénarios et évaluations capstone",
        "Suivi de progression, recommandations et score de préparation aux entretiens"
      ]
    },
    {
      title: "Capacités clés",
      bullets: [
        "Moteur de parcours d'apprentissage avec des curricula par rôle",
        "Moteur d'évaluation avec notation objective et par grille",
        "Ingestion de ressources pour la documentation officielle, les rapports et une sélection de livres",
        "Tableau de bord analytique pour la confiance, la progression et les signaux faibles"
      ]
    },
    {
      title: "Architecture suggérée",
      bullets: [
        "Frontend : interface web statique d'abord, puis application componentisée si la croissance le justifie",
        "Couche de contenu : définitions de modules en JSON versionné ou via un CMS",
        "Services d'évaluation : notation des quiz, workflows de grilles et revue des soumissions",
        "Couche IA optionnelle : interviewer simulé, assistant de feedback et recommandations d'étude adaptatives"
      ]
    },
    {
      title: "Modèle de données",
      bullets: [
        "Parcours, modules, leçons, ressources, quiz, dimensions de grilles et capstones",
        "Événements de progression utilisateur et tentatives d'évaluation",
        "Dates de fraîcheur des ressources, étiquettes et niveau de preuve",
        "Instantanés de préparation liés aux rôles cibles"
      ]
    },
    {
      title: "Feuille de route",
      bullets: [
        "Phase 1 : MVP statique avec contenu organisé et progression locale",
        "Phase 2 : gestion de contenu hébergée, comptes utilisateurs et historique",
        "Phase 3 : recommandations adaptatives, entretiens simulés et analyses plus riches",
        "Phase 4 : revues collaboratives et workflows de mentorat"
      ]
    },
    {
      title: "Niveau d'exigence",
      bullets: [
        "Privilégier les sources officielles ou primaires autant que possible",
        "Réviser les ressources chaque trimestre pour l'obsolescence et les liens cassés",
        "Utiliser des évaluations qui testent le raisonnement, pas seulement la mémorisation",
        "Mesurer le succès par la préparation aux entretiens et la qualité réelle des décisions"
      ]
    }
  ]
};

const plans = { en: planEn, fr: planFr };

const ui = {
  en: {
    pageTitle: "Principal Engineer Learning Path",
    metaDescription:
      "A 20-week learning path with curated resources, hard quizzes, and a final assessment for Principal Software Engineer roles focused on DevEx, engineering excellence, GenAI, and agentic AI.",
    heroEyebrow: "Principal interview preparation system",
    heroTitle: "Learning Path for DevEx, Engineering Excellence, GenAI, and Agentic AI",
    heroSummary:
      "A complete 20-week plan with current resources, hard assessments, and a final readiness review for Principal Software Engineer roles centered on Developer Experience, Engineering Excellence, and AI-powered development.",
    goalsTitle: "Target outcomes",
    curriculumEyebrow: "Curriculum",
    curriculumTitle: "Learning path",
    curriculumCopy: "Each module combines study, implementation, and a difficult checkpoint quiz.",
    assessmentEyebrow: "Final validation",
    assessmentTitle: "Global assessment",
    assessmentCopy: "Use this as the final Principal-level readiness gate before interviews.",
    planEyebrow: "Product direction",
    planTitle: "Application plan",
    planCopy: "A practical blueprint for evolving this content into a broader learning product.",
    footerNote:
      "Progress is stored locally in your browser. Use the export and import tools to move it between devices.",
    footerLink: "View source on GitHub",
    statTargetRole: "Target role",
    statDuration: "Duration",
    statModuleCompletion: "Module completion",
    statAverageScore: "Average quiz score",
    statReadinessTarget: "Readiness target",
    exportProgress: "Export progress",
    importProgress: "Import progress",
    resetProgress: "Reset progress",
    quizQuestionsPill: (count) => `${count} hard quiz questions`,
    deliverablesPill: (count) => `${count} deliverables`,
    outcomesHeading: "Outcomes",
    deliverablesHeading: "Deliverables",
    resourcesHeading: "Resources",
    scoreQuiz: "Score quiz",
    markComplete: "Mark module deliverables complete",
    latestScore: (score) => `Latest score: ${score}%`,
    notScored: "Not scored yet",
    scoreLabel: "Score:",
    correct: "Correct",
    reviewNeeded: "Review needed",
    resetConfirm: "Reset all quiz scores and completion status?",
    importError: "Could not import progress: the file is not a valid progress export.",
    languageSwitcherLabel: "Language"
  },
  fr: {
    pageTitle: "Parcours d'apprentissage Ingénieur Principal",
    metaDescription:
      "Un parcours d'apprentissage de 20 semaines avec des ressources organisées, des quiz difficiles et une évaluation finale pour les postes d'ingénieur logiciel principal axés sur la DevEx, l'excellence en ingénierie, la GenAI et l'IA agentique.",
    heroEyebrow: "Système de préparation aux entretiens Principal",
    heroTitle: "Parcours d'apprentissage DevEx, excellence en ingénierie, GenAI et IA agentique",
    heroSummary:
      "Un plan complet de 20 semaines avec des ressources à jour, des évaluations exigeantes et une revue finale de préparation pour les postes d'ingénieur logiciel principal centrés sur la Developer Experience, l'excellence en ingénierie et le développement propulsé par l'IA.",
    goalsTitle: "Résultats visés",
    curriculumEyebrow: "Programme",
    curriculumTitle: "Parcours d'apprentissage",
    curriculumCopy: "Chaque module combine étude, mise en pratique et un quiz de contrôle difficile.",
    assessmentEyebrow: "Validation finale",
    assessmentTitle: "Évaluation globale",
    assessmentCopy: "Utilisez ceci comme dernier jalon de préparation de niveau Principal avant les entretiens.",
    planEyebrow: "Direction produit",
    planTitle: "Plan d'application",
    planCopy: "Un plan pratique pour faire évoluer ce contenu vers un produit d'apprentissage plus large.",
    footerNote:
      "La progression est stockée localement dans votre navigateur. Utilisez les outils d'export et d'import pour la transférer entre appareils.",
    footerLink: "Voir le code source sur GitHub",
    statTargetRole: "Poste visé",
    statDuration: "Durée",
    statModuleCompletion: "Modules terminés",
    statAverageScore: "Score moyen aux quiz",
    statReadinessTarget: "Objectif de préparation",
    exportProgress: "Exporter la progression",
    importProgress: "Importer la progression",
    resetProgress: "Réinitialiser la progression",
    quizQuestionsPill: (count) => `${count} questions de quiz difficiles`,
    deliverablesPill: (count) => `${count} livrables`,
    outcomesHeading: "Résultats",
    deliverablesHeading: "Livrables",
    resourcesHeading: "Ressources",
    scoreQuiz: "Noter le quiz",
    markComplete: "Marquer les livrables du module comme terminés",
    latestScore: (score) => `Dernier score : ${score}%`,
    notScored: "Pas encore noté",
    scoreLabel: "Score :",
    correct: "Correct",
    reviewNeeded: "À revoir",
    resetConfirm: "Réinitialiser tous les scores de quiz et les statuts de complétion ?",
    importError: "Impossible d'importer la progression : le fichier n'est pas un export de progression valide.",
    languageSwitcherLabel: "Langue"
  }
};

const storageKey = "principal-learning-path-state";
const languageStorageKey = "principal-learning-path-language";

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

const loadLanguage = () => {
  try {
    const stored = localStorage.getItem(languageStorageKey);
    return stored === "fr" || stored === "en" ? stored : "en";
  } catch (error) {
    return "en";
  }
};

let language = loadLanguage();
let plan = plans[language];
let t = ui[language];

const setLanguage = (nextLanguage) => {
  if (!plans[nextLanguage] || nextLanguage === language) return;
  language = nextLanguage;
  plan = plans[language];
  t = ui[language];
  try {
    localStorage.setItem(languageStorageKey, language);
  } catch (error) {
    // Ignore storage failures; the selection still applies for this visit.
  }
  renderAll();
};

const applyStaticText = () => {
  document.documentElement.lang = language;
  document.title = t.pageTitle;
  const metaDescription = document.querySelector('meta[name="description"]');
  if (metaDescription) metaDescription.setAttribute("content", t.metaDescription);
  document.querySelectorAll("[data-i18n]").forEach((element) => {
    const text = t[element.dataset.i18n];
    if (typeof text === "string") element.textContent = text;
  });
};

const updateLanguageSwitcher = () => {
  const switcher = document.getElementById("language-switcher");
  if (switcher) switcher.setAttribute("aria-label", t.languageSwitcherLabel);
  document.querySelectorAll(".lang-button").forEach((button) => {
    const isActive = button.dataset.lang === language;
    button.classList.toggle("lang-button--active", isActive);
    button.setAttribute("aria-pressed", String(isActive));
  });
};

const summarize = () => {
  const completedCount = Object.values(state.completed).filter(Boolean).length;
  const scoreValues = Object.values(state.scores).filter((value) => Number.isFinite(value));
  const averageScore = scoreValues.length
    ? Math.round(scoreValues.reduce((sum, value) => sum + value, 0) / scoreValues.length)
    : 0;
  const completionPercent = Math.round((completedCount / plan.modules.length) * 100);

  document.getElementById("overview").innerHTML = `
    <div class="stat">
      <strong>${t.statTargetRole}</strong>
      <span>${plan.targetRole}</span>
    </div>
    <div class="stat">
      <strong>${t.statDuration}</strong>
      <span>${plan.duration}</span>
    </div>
    <div class="stat">
      <strong>${t.statModuleCompletion}</strong>
      <span>${completedCount} / ${plan.modules.length}</span>
      <div class="progress-track" role="progressbar" aria-valuenow="${completionPercent}" aria-valuemin="0" aria-valuemax="100" aria-label="${t.statModuleCompletion}">
        <div class="progress-fill" style="width: ${completionPercent}%"></div>
      </div>
    </div>
    <div class="stat">
      <strong>${t.statAverageScore}</strong>
      <span>${averageScore}%</span>
    </div>
    <div class="stat">
      <strong>${t.statReadinessTarget}</strong>
      <span>${plan.readinessTarget}</span>
    </div>
    <div class="progress-tools">
      <button type="button" class="button--ghost" id="export-progress">${t.exportProgress}</button>
      <button type="button" class="button--ghost" id="import-progress">${t.importProgress}</button>
      <button type="button" class="button--ghost" id="reset-progress">${t.resetProgress}</button>
    </div>
  `;

  document.getElementById("export-progress").addEventListener("click", exportProgress);
  document.getElementById("import-progress").addEventListener("click", importProgress);
  document.getElementById("reset-progress").addEventListener("click", resetProgress);
};

const exportProgress = () => {
  const blob = new Blob([JSON.stringify(state, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "learning-path-progress.json";
  link.click();
  URL.revokeObjectURL(url);
};

const importProgress = () => {
  const input = document.createElement("input");
  input.type = "file";
  input.accept = "application/json";
  input.addEventListener("change", () => {
    const file = input.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const imported = JSON.parse(reader.result);
        if (!imported || typeof imported !== "object") throw new Error("Invalid file");
        state.completed = imported.completed && typeof imported.completed === "object" ? imported.completed : {};
        state.scores = imported.scores && typeof imported.scores === "object" ? imported.scores : {};
        saveState(state);
        summarize();
        renderModules();
      } catch (error) {
        alert(t.importError);
      }
    };
    reader.readAsText(file);
  });
  input.click();
};

const resetProgress = () => {
  if (!confirm(t.resetConfirm)) return;
  state.completed = {};
  state.scores = {};
  saveState(state);
  summarize();
  renderModules();
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
              <span class="meta-pill">${t.quizQuestionsPill(module.quiz.length)}</span>
              <span class="meta-pill">${t.deliverablesPill(module.deliverables.length)}</span>
            </div>
          </div>

          <h4>${t.outcomesHeading}</h4>
          <ul>${module.outcomes.map((item) => `<li>${item}</li>`).join("")}</ul>

          <h4>${t.deliverablesHeading}</h4>
          <ul>${module.deliverables.map((item) => `<li>${item}</li>`).join("")}</ul>

          <h4>${t.resourcesHeading}</h4>
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
              <button type="submit">${t.scoreQuiz}</button>
            </form>
            <div class="module__footer">
              <label class="checkbox-row">
                <input type="checkbox" data-complete="${module.id}" ${state.completed[module.id] ? "checked" : ""} />
                ${t.markComplete}
              </label>
              <span class="badge">${score !== undefined ? t.latestScore(score) : t.notScored}</span>
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

      const badge = form.closest(".quiz").querySelector(".badge");
      badge.textContent = t.latestScore(score);

      const resultElement = document.getElementById(`result-${module.id}`);
      resultElement.className = `result ${score >= 80 ? "result--good" : "result--bad"}`;
      resultElement.innerHTML = `
        <p><strong>${t.scoreLabel}</strong> ${score}%</p>
        <ul>
          ${module.quiz
            .map(
              (question, index) => `
                <li>
                  <strong>Q${index + 1}:</strong> ${answers[index] === question.answer ? t.correct : t.reviewNeeded} —
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

const renderAll = () => {
  applyStaticText();
  updateLanguageSwitcher();
  summarize();
  renderGoals();
  renderModules();
  renderFinalAssessment();
  renderApplicationPlan();
};

document.querySelectorAll(".lang-button").forEach((button) => {
  button.addEventListener("click", () => setLanguage(button.dataset.lang));
});

renderAll();
