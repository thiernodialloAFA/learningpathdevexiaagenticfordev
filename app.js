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

const academySettings = {
  passThreshold: 80,
  siteUrl: "https://axafrance.github.io/learning-path-copilot/",
  repoUrl: "https://github.com/AxaFrance/learning-path-copilot"
};

const academyDoc = (path) =>
  `https://github.com/AxaFrance/learning-path-copilot/blob/main/docs/${path}`;

const copilotAcademyEn = {
  levels: [
    {
      id: "academy-beginner",
      icon: "🌱",
      rank: "Beginner",
      title: "First steps with Copilot",
      focus:
        "The three Copilot surfaces, persistent instructions, and reusable prompt files — the foundations every developer needs.",
      modules: ["100 · Setup & posture", "101 · Custom instructions", "102 · Custom prompts"],
      resources: [
        { name: "100 · Setup & posture", url: academyDoc("01-fondations/100-setup-posture.md") },
        { name: "101 · Instructions", url: academyDoc("01-fondations/101-instructions.md") },
        { name: "102 · Prompts", url: academyDoc("01-fondations/102-prompts.md") }
      ],
      quiz: [
        {
          prompt:
            "In VS Code, which Copilot surface can read your workspace, create several files in one turn, and propose a global diff you accept or reject?",
          options: [
            "Inline suggestion",
            "Copilot Chat",
            "Agent mode",
            "The Copilot status bar icon"
          ],
          answer: 2,
          explanation:
            "Inline suggestion only sees the open file, chat answers without modifying files, and agent mode is the surface that reads the file tree and proposes multi-file diffs."
        },
        {
          prompt:
            "\"Use Vitest, never Jest\" must apply to every conversation in your repo. What is it?",
          options: [
            "A prompt — restate it in each request",
            "A persistent instruction, e.g. in .github/copilot-instructions.md",
            "A skill triggered by the semantic router",
            "An MCP server setting"
          ],
          answer: 1,
          explanation:
            "A prompt covers today's one-shot intent; a permanent team rule belongs in an instruction file that is loaded at every interaction."
        },
        {
          prompt:
            "Which file do Copilot Chat and agent mode load automatically for every conversation in a repository, with no activation step?",
          options: [
            ".vscode/copilot.json",
            ".github/copilot-instructions.md",
            "README.md",
            ".agents/instructions.md"
          ],
          answer: 1,
          explanation:
            ".github/copilot-instructions.md at the repo root is loaded automatically — it is the single file the whole team shares."
        },
        {
          prompt:
            "You want TypeScript-only rules that load only when a .ts file is in scope. What does the handbook recommend?",
          options: [
            "Add the rules to README.md",
            "Create .github/instructions/typescript.instructions.md with an applyTo: '**/*.ts' frontmatter",
            "Put every language's rules in one big copilot-instructions.md",
            "Rename the file to typescript.prompt.md"
          ],
          answer: 1,
          explanation:
            "Scoped instruction files in .github/instructions/ use an applyTo glob so they only load when matching files are in scope, keeping global context lean."
        },
        {
          prompt:
            "In a .prompt.md file, which mode should you pick for a command that explains code but must never modify files?",
          options: ["agent", "edit", "ask", "chat"],
          answer: 2,
          explanation:
            "ask responds in chat only; edit modifies the open file; agent can read, write, and run commands. Using agent for everything adds latency and unnecessary tool calls."
        }
      ]
    },
    {
      id: "academy-padawan",
      icon: "⚔️",
      rank: "Padawan",
      title: "Skills, agents, and hooks",
      focus:
        "Teach Copilot procedural know-how, build custom conversation agents, and automate on agent events.",
      modules: ["103 · Skills", "104 · Agents (.agent.md)", "105 · Hooks"],
      resources: [
        { name: "103 · Skills", url: academyDoc("01-fondations/103-skills.md") },
        { name: "104 · Agents", url: academyDoc("01-fondations/104-agents.md") },
        { name: "105 · Hooks", url: academyDoc("01-fondations/105-hooks.md") }
      ],
      quiz: [
        {
          prompt:
            "What determines whether Copilot loads a skill stored in .agents/skills/<name>/SKILL.md?",
          options: [
            "The skill is loaded in every conversation, like an instruction",
            "The semantic router matches the skill's description against the user's request",
            "The user must type the skill name in the prompt",
            "The skill loads whenever its folder is open in the editor"
          ],
          answer: 1,
          explanation:
            "The description is a semantic trigger, not documentation: the router loads the skill only when the request matches it. That is why it should start with 'Use when…'."
        },
        {
          prompt:
            "A procedure is only needed when someone asks for a commit message, but a style rule must apply everywhere. How do you split them?",
          options: [
            "Both as skills",
            "Both as instructions",
            "Commit procedure as a skill, style rule as an instruction",
            "Commit procedure as an instruction, style rule as a skill"
          ],
          answer: 2,
          explanation:
            "Instruction = permanent rule loaded in every conversation; skill = conditional procedure loaded on semantic trigger. Duplicating the same content in both feeds Copilot twice."
        },
        {
          prompt:
            "How do you build a review-only agent (.agent.md) that cannot modify files or run commands?",
          options: [
            "Add 'read-only' to its description",
            "Set model: gpt-5-mini",
            "Omit editFiles and runInTerminal from its tools list",
            "Set mode: ask in the frontmatter"
          ],
          answer: 2,
          explanation:
            "The tools key is the strongest lever: anything not listed is forbidden, so an agent without editFiles and runInTerminal can only read and discuss."
        },
        {
          prompt: "Agent A delegates to agent B with runSubagent. What context does B receive?",
          options: [
            "A's full conversation history",
            "B runs isolated with its own tools and model — only what A explicitly passes",
            "Everything in A's context window plus the workspace",
            "B shares A's tool permissions automatically"
          ],
          answer: 1,
          explanation:
            "Sub-agents run in isolated sub-conversations and inherit their own frontmatter configuration, not the caller's context — the caller must pass what matters."
        },
        {
          prompt: "Which hook mechanism can block a dangerous tool call before it executes?",
          options: [
            "PostToolUse with decision: 'block'",
            "SessionStart with additionalContext",
            "PreToolUse returning permissionDecision: 'deny'",
            "Stop with a reason"
          ],
          answer: 2,
          explanation:
            "PreToolUse fires before a tool executes and its permissionDecision (allow/deny/ask) is the only mechanism that can stop the call before it runs. PostToolUse only reacts afterwards."
        }
      ]
    },
    {
      id: "academy-intermediate",
      icon: "🛠️",
      rank: "Intermediate",
      title: "Tools and models",
      focus:
        "Extend Copilot with MCP servers without compromising security, and pick the right model for each task.",
      modules: ["106 · MCP", "107 · Model choice"],
      resources: [
        { name: "106 · MCP", url: academyDoc("01-fondations/106-mcp.md") },
        { name: "107 · Model choice", url: academyDoc("01-fondations/107-choix-de-modeles.md") }
      ],
      quiz: [
        {
          prompt:
            "Why does the handbook say \"never connect an MCP server you haven't audited\"?",
          options: [
            "MCP servers slow down inline completions",
            "An MCP server is an executable process running with your permissions — it can read files, run commands, or exfiltrate secrets",
            "MCP servers overwrite copilot-instructions.md",
            "MCP servers only work with one model family"
          ],
          answer: 1,
          explanation:
            "Unlike a skill (text only), an MCP server is a real process on your machine, so it inherits your permissions and can touch files, networks, and environment secrets."
        },
        {
          prompt:
            "What is the recommended way to give an MCP server a GitHub token in .vscode/mcp.json?",
          options: [
            "Hard-code the token in the env block",
            "Use ${input:github-token} so VS Code prompts for it",
            "Commit the token in .env",
            "Paste the token in the chat once per session"
          ],
          answer: 1,
          explanation:
            "${input:} triggers a VS Code prompt so the team can share the server configuration without ever committing credentials."
        },
        {
          prompt:
            "You keep 5 MCP servers with 10 tools each connected. What is the hidden cost even when you never use them?",
          options: [
            "Nothing — unused tools are free",
            "50 tool descriptions are injected into the system prompt on every request",
            "Each server charges a per-minute fee",
            "VS Code disables inline completions"
          ],
          answer: 1,
          explanation:
            "Every connected server adds its tool descriptions to Copilot's context each turn, which is why the handbook recommends preferring an existing CLI (gh, az, git) when one exists."
        },
        {
          prompt:
            "According to the GitHub task categories, which models should you pick for deep reasoning and debugging?",
          options: [
            "Raptor mini and GPT-5 mini",
            "Claude Haiku 4.5",
            "GPT-5.5, Claude Opus 4.7, Gemini 3.1 Pro, or Goldeneye",
            "Any model — they are equivalent"
          ],
          answer: 2,
          explanation:
            "Fast repetitive tasks suit Haiku-class models and general coding suits GPT-5 mini or Raptor mini, while deep reasoning and debugging calls for premium reasoning models."
        },
        {
          prompt: "Why is \"one model per session\" the recommended rule?",
          options: [
            "Model switching is not allowed by license",
            "Switching invalidates the prompt cache prefix, producing inconsistent results and re-billing tokens at full price",
            "Different models cannot read the same files",
            "Sessions crash when models change"
          ],
          answer: 1,
          explanation:
            "The prompt cache reuses already-processed input tokens; a mid-session model switch invalidates the whole cached prefix and wastes tokens."
        }
      ]
    },
    {
      id: "academy-confirmed",
      icon: "🚀",
      rank: "Confirmed",
      title: "Composition at team scale",
      focus:
        "Package, share, and orchestrate primitives with APM, multi-agent workflows, plugins, and the Copilot CLI.",
      modules: ["207 · APM", "208 · Workflows", "209 · Plugins", "210 · Copilot CLI"],
      resources: [
        { name: "207 · APM", url: academyDoc("02-composition/207-apm.md") },
        { name: "208 · Workflows", url: academyDoc("02-composition/208-workflows.md") },
        { name: "209 · Plugins", url: academyDoc("02-composition/209-plugins.md") },
        { name: "210 · Copilot CLI", url: academyDoc("02-composition/210-copilot-cli.md") }
      ],
      quiz: [
        {
          prompt:
            "In an APM setup, where does the exact resolved commit SHA of each dependency live?",
          options: [
            "In apm.yml next to each dependency",
            "In apm.lock.yaml (resolved_commit + content_hash), generated automatically",
            "In .github/copilot-instructions.md",
            "Only in the Git tag"
          ],
          answer: 1,
          explanation:
            "apm.yml declares dependencies (optionally pinned with #tag); the lockfile stores the resolved commit and content hash and should be committed, like package-lock.json."
        },
        {
          prompt: "Which command makes APM-installed primitives visible to VS Code / Copilot?",
          options: ["apm audit", "apm run copilot", "apm compile -t copilot", "apm publish"],
          answer: 2,
          explanation:
            "apm compile -t copilot writes the compiled configuration (e.g. .github/copilot-instructions.md) so Copilot picks it up with zero extra config."
        },
        {
          prompt:
            "In an Outside-In workflow, why must the orchestrator explicitly pass sub-agent N's output to sub-agent N+1?",
          options: [
            "To keep an audit log",
            "Because sub-agents run in isolated conversations and never see previous steps' history",
            "Because sub-agents only accept JSON",
            "To avoid exceeding the model's rate limit"
          ],
          answer: 1,
          explanation:
            "Each sub-agent has its own isolated context. The orchestrator is the relay: it collects step N's output and transmits it as input to step N+1 — and it never does the work itself."
        },
        {
          prompt:
            "What defines a Copilot plugin, compared with installing individual primitives via APM?",
          options: [
            "A plugin is a paid binary from a store",
            "A plugin is a bundle of skills/agents (manifest .github/plugin/plugin.json) installed as a block, e.g. from github/awesome-copilot",
            "A plugin only works in JetBrains IDEs",
            "A plugin is another name for an MCP server"
          ],
          answer: 1,
          explanation:
            "Plugins deliver a coherent kit of primitives as one Git repo, with user or project scope; APM manages individual primitives per project. They complement each other."
        },
        {
          prompt:
            "In the terminal, which command asks Copilot to explain an unfamiliar shell command flag by flag?",
          options: [
            "gh copilot suggest -t shell",
            "gh copilot explain",
            "gh explain",
            "copilot --help"
          ],
          answer: 1,
          explanation:
            "gh copilot explain breaks down a given command; gh copilot suggest proposes a command from a description (with -t shell/gh/git types and the ghcs/ghce aliases)."
        }
      ]
    },
    {
      id: "academy-expert",
      icon: "🧠",
      rank: "Expert",
      title: "Pipelines, LSP, and evals",
      focus:
        "Run rigorous multi-agent pipelines, wire compiler-grade LSP intelligence, and prove skill value with binary and LLM-judge evals.",
      modules: [
        "211 · Agent pipeline",
        "212 · LSP",
        "213 · APM vs plugins",
        "310 · Binary evals",
        "315 · LLM-judge evals"
      ],
      resources: [
        { name: "211 · Agent pipeline", url: academyDoc("02-composition/211-pipeline-agents-handbook.md") },
        { name: "212 · LSP", url: academyDoc("02-composition/212-lsp.md") },
        { name: "213 · APM vs plugins", url: academyDoc("02-composition/213-apm-vs-plugins.md") },
        { name: "310 · Binary evals", url: academyDoc("03-ingenierie-de-contexte/310-evals.md") },
        { name: "315 · LLM-judge evals", url: academyDoc("03-ingenierie-de-contexte/315-evals-llm-juge.md") }
      ],
      quiz: [
        {
          prompt:
            "In the handbook's writing pipeline, why must the reviewer agent start with FRESH CONTEXT (never reading previous review rounds)?",
          options: [
            "To save tokens",
            "To avoid inheriting the writer's biases and to re-verify every citation in its real source context",
            "Because review files are deleted after each round",
            "Because the reviewer uses a smaller model"
          ],
          answer: 1,
          explanation:
            "A warm-context reviewer sees quotes in the author's intended framing. Fresh context plus re-fetching every cited URL is the only way to get genuine adversarial fact-checking."
        },
        {
          prompt:
            "The writer–reviewer alignment loop is bounded at 3 rounds. What happens if round 3 still ends in REVISE?",
          options: [
            "The chapter is auto-published",
            "The loop restarts from zero",
            "A human checkpoint: the pipeline stops and asks a human to decide",
            "The orchestrator rewrites the chapter itself"
          ],
          answer: 2,
          explanation:
            "Every agent loop must have a deterministic human exit — an unbounded loop is an agent that self-justifies indefinitely."
        },
        {
          prompt:
            "What is the main benefit of configuring LSP servers for Copilot CLI (.github/lsp.json)?",
          options: [
            "It enables syntax highlighting in the terminal",
            "Compiler-grade operations like find-references return compact structured results instead of loading whole files into context",
            "It replaces the need for Git",
            "It makes Copilot work offline"
          ],
          answer: 1,
          explanation:
            "LSP gives Copilot precise code navigation (definitions, references, symbols) with token-efficient results, and the CLI uses configured servers automatically."
        },
        {
          prompt:
            "Which part of an installed skill is loaded into context at EVERY turn, even when the skill never triggers?",
          options: [
            "The full SKILL.md body",
            "Nothing until it triggers",
            "The name + description frontmatter (roughly 35–300 tokens per skill)",
            "Only the folder name"
          ],
          answer: 2,
          explanation:
            "Descriptions are always loaded so the router can match them; bodies load on demand. That is why symlinking a whole multi-stack skill repo everywhere destroys the targeted-context benefit."
        },
        {
          prompt:
            "You run your eval fixtures with_skill (9/10) and without_skill (8/10). What does the handbook conclude?",
          options: [
            "Ship it — 9/10 is a great score",
            "The +10% delta is below the ~30% bar: the skill probably doesn't justify its place in context",
            "Add more assertions until the delta grows",
            "Rewrite the fixtures so without_skill fails"
          ],
          answer: 1,
          explanation:
            "The with/without delta is the only objective proof of a skill's value. A skill improving results by less than ~30% — or a without_skill score already ≥80% — is probably unnecessary."
        },
        {
          prompt: "In pairwise LLM-judge comparisons, how do you neutralize position bias?",
          options: [
            "Always put the candidate answer first",
            "Use a longer rubric",
            "Call the judge twice with the order inverted and only declare a winner if both calls agree",
            "Raise the temperature"
          ],
          answer: 2,
          explanation:
            "Judges favor the first answer. The double-call-with-inversion protocol (plus a judge from a different model family and calibration on a golden set) makes verdicts trustworthy."
        }
      ]
    },
    {
      id: "academy-master",
      icon: "🏆",
      rank: "Master",
      title: "Context engineering mastery",
      focus:
        "Token sobriety, mechanical reduction tooling, autoresearch loops, and cache-aware model orchestration.",
      modules: [
        "311 · Tokens & context",
        "312 · Sobriety patterns",
        "313 · Reduction tools",
        "314 · Autoresearch",
        "316 · Moving context between models",
        "317 · Orchestrating subagents",
        "318 · Measuring consumption"
      ],
      resources: [
        { name: "311 · Tokens & context", url: academyDoc("03-ingenierie-de-contexte/311-tokens-contexte.md") },
        { name: "312 · Sobriety patterns", url: academyDoc("03-ingenierie-de-contexte/312-patterns-sobriete.md") },
        { name: "313 · Reduction tools", url: academyDoc("03-ingenierie-de-contexte/313-outils-reduction.md") },
        { name: "314 · Autoresearch", url: academyDoc("03-ingenierie-de-contexte/314-autoresearch.md") },
        { name: "316 · Moving context", url: academyDoc("03-ingenierie-de-contexte/316-deplacer-contexte-modeles.md") },
        { name: "317 · Subagents", url: academyDoc("03-ingenierie-de-contexte/317-orchestrer-subagents.md") },
        { name: "318 · Measuring usage", url: academyDoc("03-ingenierie-de-contexte/318-mesurer-optimiser-consommation.md") }
      ],
      quiz: [
        {
          prompt:
            "Why does output quality degrade even on models with huge context windows?",
          options: [
            "Long contexts are truncated silently",
            "Signal dilution: the model attends to every token, so more noise means less focus on what matters",
            "Big windows disable the prompt cache",
            "Tokens beyond 100k are free but ignored"
          ],
          answer: 1,
          explanation:
            "Signal dilution is the most insidious of the four costs (cost, latency, saturation, dilution): quality drops as the signal-to-noise ratio drops, regardless of window size."
        },
        {
          prompt:
            "Which code-structuring practice most reduces the context Copilot needs to load?",
          options: [
            "Merging related services into one big file for fewer reads",
            "SRP with domain-driven names: one file = one intent, e.g. calculateShippingCost(order, policy): Money",
            "Files of at most 5 lines",
            "Adding detailed comments on every line"
          ],
          answer: 1,
          explanation:
            "Ubiquitous language and SOLID make the code self-describing so only the relevant file gets loaded; over-fragmentation (5-line files) adds navigation noise — target ~30–80 lines."
        },
        {
          prompt:
            "What distinguishes a genuinely useful synthesis sub-agent from a fake one?",
          options: [
            "It uses a premium model",
            "It reads 3 files (~4000 tokens) and returns a ~200-token conclusion instead of copy-pasting raw file contents",
            "It always returns JSON",
            "It runs in under 10 ms"
          ],
          answer: 1,
          explanation:
            "A sub-agent that pastes 500 raw lines shifts cost instead of reducing it. SNIP/RTK and ast-grep/rg/jq apply the same principle mechanically (up to ~90–99% savings)."
        },
        {
          prompt:
            "In an autoresearch loop, how many changes should each experiment make to SKILL.md?",
          options: [
            "As many as possible to converge faster",
            "Exactly one mutation, then re-run and KEEP or DISCARD",
            "One per eval fixture",
            "None — only the fixtures change"
          ],
          answer: 1,
          explanation:
            "One mutation at a time is the only way to know what helped. Stop at a 95%+ pass rate on 3 consecutive experiments — with 70–85% being the realistic ceiling for most skills."
        },
        {
          prompt:
            "You planned with a deep-reasoning model and now want a lighter model to implement. When is the Markdown transfer (plan.md + new session) better than forking the conversation?",
          options: [
            "When the implementation needs every detail of the planning reasoning",
            "When the plan is cleanly summarizable in a document, so the new session starts with minimal, noise-free context",
            "When you want to keep the warm cache prefix",
            "Never — forking is always better"
          ],
          answer: 1,
          explanation:
            "Fork inherits full context including planning noise; a plan.md transfer starts a clean session where only the spec matters (at the price of a cold cache)."
        },
        {
          prompt:
            "In the Route & Assemble subagent pattern, which model tier should the orchestrator itself run on?",
          options: [
            "The premium reasoning tier — it makes the hardest decisions",
            "The lightweight tier (e.g. Haiku 4.5 / Gemini Flash) because it only routes and assembles, never reasons deeply or writes code",
            "The same tier as the implementer",
            "It doesn't matter"
          ],
          answer: 1,
          explanation:
            "The orchestrator's value is routing: planner sub-agents get deep-reasoning models, implementers get everyday engineering models, and each sub-agent's context is discarded after completion."
        },
        {
          prompt: "Which action does NOT break the prompt cache during a long session?",
          options: [
            "Editing an earlier message",
            "Reinserting a large block at the top of the conversation",
            "Appending new context at the end of the conversation",
            "Switching models mid-session"
          ],
          answer: 2,
          explanation:
            "The cache reuses the stable prefix (system + tools + earlier messages). Adding to the end preserves it — that is how sessions reach ~88% cache hit rates in Agent Debug Logs."
        }
      ]
    }
  ]
};

const copilotAcademyFr = {
  levels: [
    {
      id: "academy-beginner",
      icon: "🌱",
      rank: "Débutant",
      title: "Premiers pas avec Copilot",
      focus:
        "Les trois surfaces de Copilot, les instructions persistantes et les fichiers de prompt réutilisables — les fondations dont chaque développeur a besoin.",
      modules: ["100 · Setup & posture", "101 · Instructions personnalisées", "102 · Prompts personnalisés"],
      resources: [
        { name: "100 · Setup & posture", url: academyDoc("01-fondations/100-setup-posture.md") },
        { name: "101 · Instructions", url: academyDoc("01-fondations/101-instructions.md") },
        { name: "102 · Prompts", url: academyDoc("01-fondations/102-prompts.md") }
      ],
      quiz: [
        {
          prompt:
            "Dans VS Code, quelle surface de Copilot peut lire votre espace de travail, créer plusieurs fichiers en un tour et proposer un diff global à accepter ou refuser ?",
          options: [
            "La suggestion inline",
            "Copilot Chat",
            "Le mode agent",
            "L'icône Copilot de la barre d'état"
          ],
          answer: 2,
          explanation:
            "La suggestion inline ne voit que le fichier ouvert, le chat répond sans modifier de fichiers, et le mode agent est la surface qui lit l'arborescence et propose des diffs multi-fichiers."
        },
        {
          prompt:
            "« Utilise Vitest, jamais Jest » doit s'appliquer à chaque conversation du dépôt. De quoi s'agit-il ?",
          options: [
            "D'un prompt — à répéter dans chaque requête",
            "D'une instruction persistante, p. ex. dans .github/copilot-instructions.md",
            "D'un skill déclenché par le routeur sémantique",
            "D'un réglage de serveur MCP"
          ],
          answer: 1,
          explanation:
            "Un prompt couvre l'intention ponctuelle du jour ; une règle permanente d'équipe se place dans un fichier d'instructions chargé à chaque interaction."
        },
        {
          prompt:
            "Quel fichier Copilot Chat et le mode agent chargent-ils automatiquement pour chaque conversation d'un dépôt, sans étape d'activation ?",
          options: [
            ".vscode/copilot.json",
            ".github/copilot-instructions.md",
            "README.md",
            ".agents/instructions.md"
          ],
          answer: 1,
          explanation:
            ".github/copilot-instructions.md à la racine du dépôt est chargé automatiquement — c'est le fichier unique partagé par toute l'équipe."
        },
        {
          prompt:
            "Vous voulez des règles TypeScript chargées uniquement quand un fichier .ts est concerné. Que recommande le handbook ?",
          options: [
            "Ajouter les règles au README.md",
            "Créer .github/instructions/typescript.instructions.md avec un frontmatter applyTo: '**/*.ts'",
            "Mettre toutes les règles de tous les langages dans copilot-instructions.md",
            "Renommer le fichier en typescript.prompt.md"
          ],
          answer: 1,
          explanation:
            "Les fichiers d'instructions ciblés de .github/instructions/ utilisent un glob applyTo pour ne se charger que lorsque des fichiers correspondants sont concernés, ce qui garde le contexte global léger."
        },
        {
          prompt:
            "Dans un fichier .prompt.md, quel mode choisir pour une commande qui explique du code mais ne doit jamais modifier de fichiers ?",
          options: ["agent", "edit", "ask", "chat"],
          answer: 2,
          explanation:
            "ask répond uniquement dans le chat ; edit modifie le fichier ouvert ; agent peut lire, écrire et exécuter des commandes. Utiliser agent partout ajoute latence et appels d'outils inutiles."
        }
      ]
    },
    {
      id: "academy-padawan",
      icon: "⚔️",
      rank: "Padawan",
      title: "Skills, agents et hooks",
      focus:
        "Apprenez des savoir-faire procéduraux à Copilot, créez des agents de conversation personnalisés et automatisez sur les événements de l'agent.",
      modules: ["103 · Skills", "104 · Agents (.agent.md)", "105 · Hooks"],
      resources: [
        { name: "103 · Skills", url: academyDoc("01-fondations/103-skills.md") },
        { name: "104 · Agents", url: academyDoc("01-fondations/104-agents.md") },
        { name: "105 · Hooks", url: academyDoc("01-fondations/105-hooks.md") }
      ],
      quiz: [
        {
          prompt:
            "Qu'est-ce qui détermine si Copilot charge un skill stocké dans .agents/skills/<nom>/SKILL.md ?",
          options: [
            "Le skill est chargé à chaque conversation, comme une instruction",
            "Le routeur sémantique compare la description du skill à la requête de l'utilisateur",
            "L'utilisateur doit taper le nom du skill dans le prompt",
            "Le skill se charge dès que son dossier est ouvert dans l'éditeur"
          ],
          answer: 1,
          explanation:
            "La description est un déclencheur sémantique, pas de la documentation : le routeur ne charge le skill que si la requête correspond. C'est pourquoi elle doit commencer par « Use when… »."
        },
        {
          prompt:
            "Une procédure ne sert que lorsqu'on demande un message de commit, mais une règle de style doit s'appliquer partout. Comment les répartir ?",
          options: [
            "Les deux en skills",
            "Les deux en instructions",
            "La procédure de commit en skill, la règle de style en instruction",
            "La procédure de commit en instruction, la règle de style en skill"
          ],
          answer: 2,
          explanation:
            "Instruction = règle permanente chargée à chaque conversation ; skill = procédure conditionnelle chargée sur déclencheur sémantique. Dupliquer le même contenu dans les deux nourrit Copilot deux fois."
        },
        {
          prompt:
            "Comment construire un agent de revue (.agent.md) incapable de modifier des fichiers ou d'exécuter des commandes ?",
          options: [
            "Ajouter « read-only » à sa description",
            "Définir model: gpt-5-mini",
            "Omettre editFiles et runInTerminal de sa liste tools",
            "Définir mode: ask dans le frontmatter"
          ],
          answer: 2,
          explanation:
            "La clé tools est le levier le plus puissant : ce qui n'est pas listé est interdit, donc un agent sans editFiles ni runInTerminal ne peut que lire et discuter."
        },
        {
          prompt: "L'agent A délègue à l'agent B via runSubagent. Quel contexte B reçoit-il ?",
          options: [
            "Tout l'historique de conversation de A",
            "B s'exécute isolé avec ses propres outils et modèle — seulement ce que A transmet explicitement",
            "Tout le contexte de A plus l'espace de travail",
            "B hérite automatiquement des permissions d'outils de A"
          ],
          answer: 1,
          explanation:
            "Les sous-agents s'exécutent dans des sous-conversations isolées et héritent de leur propre configuration, pas du contexte de l'appelant — l'appelant doit transmettre ce qui compte."
        },
        {
          prompt:
            "Quel mécanisme de hook peut bloquer un appel d'outil dangereux avant son exécution ?",
          options: [
            "PostToolUse avec decision: 'block'",
            "SessionStart avec additionalContext",
            "PreToolUse retournant permissionDecision: 'deny'",
            "Stop avec une raison"
          ],
          answer: 2,
          explanation:
            "PreToolUse se déclenche avant l'exécution d'un outil et sa permissionDecision (allow/deny/ask) est le seul mécanisme qui puisse stopper l'appel avant qu'il ne s'exécute. PostToolUse ne fait que réagir après coup."
        }
      ]
    },
    {
      id: "academy-intermediate",
      icon: "🛠️",
      rank: "Intermédiaire",
      title: "Outils et modèles",
      focus:
        "Étendez Copilot avec des serveurs MCP sans compromettre la sécurité, et choisissez le bon modèle pour chaque tâche.",
      modules: ["106 · MCP", "107 · Choix de modèles"],
      resources: [
        { name: "106 · MCP", url: academyDoc("01-fondations/106-mcp.md") },
        { name: "107 · Choix de modèles", url: academyDoc("01-fondations/107-choix-de-modeles.md") }
      ],
      quiz: [
        {
          prompt:
            "Pourquoi le handbook dit-il « ne connectez jamais un serveur MCP que vous n'avez pas audité » ?",
          options: [
            "Les serveurs MCP ralentissent les complétions inline",
            "Un serveur MCP est un processus exécutable qui tourne avec vos permissions — il peut lire des fichiers, exécuter des commandes ou exfiltrer des secrets",
            "Les serveurs MCP écrasent copilot-instructions.md",
            "Les serveurs MCP ne fonctionnent qu'avec une seule famille de modèles"
          ],
          answer: 1,
          explanation:
            "Contrairement à un skill (texte seul), un serveur MCP est un vrai processus sur votre machine : il hérite de vos permissions et peut toucher fichiers, réseau et secrets d'environnement."
        },
        {
          prompt:
            "Quelle est la méthode recommandée pour fournir un token GitHub à un serveur MCP dans .vscode/mcp.json ?",
          options: [
            "Coder le token en dur dans le bloc env",
            "Utiliser ${input:github-token} pour que VS Code le demande",
            "Committer le token dans .env",
            "Coller le token dans le chat à chaque session"
          ],
          answer: 1,
          explanation:
            "${input:} déclenche une invite VS Code : l'équipe partage la configuration du serveur sans jamais committer d'identifiants."
        },
        {
          prompt:
            "Vous gardez 5 serveurs MCP de 10 outils chacun connectés. Quel est le coût caché même sans jamais les utiliser ?",
          options: [
            "Aucun — les outils inutilisés sont gratuits",
            "50 descriptions d'outils sont injectées dans le prompt système à chaque requête",
            "Chaque serveur facture à la minute",
            "VS Code désactive les complétions inline"
          ],
          answer: 1,
          explanation:
            "Chaque serveur connecté ajoute ses descriptions d'outils au contexte de Copilot à chaque tour ; d'où la règle : préférer une CLI existante (gh, az, git) quand elle existe."
        },
        {
          prompt:
            "Selon les catégories de tâches GitHub, quels modèles choisir pour le raisonnement profond et le débogage ?",
          options: [
            "Raptor mini et GPT-5 mini",
            "Claude Haiku 4.5",
            "GPT-5.5, Claude Opus 4.7, Gemini 3.1 Pro ou Goldeneye",
            "N'importe lequel — ils sont équivalents"
          ],
          answer: 2,
          explanation:
            "Les tâches rapides et répétitives conviennent aux modèles type Haiku et le codage généraliste à GPT-5 mini ou Raptor mini, tandis que le raisonnement profond appelle les modèles premium."
        },
        {
          prompt: "Pourquoi « un modèle par session » est-elle la règle recommandée ?",
          options: [
            "Changer de modèle est interdit par la licence",
            "Changer de modèle invalide le préfixe du cache de prompt, produit des résultats incohérents et refacture les tokens plein tarif",
            "Des modèles différents ne peuvent pas lire les mêmes fichiers",
            "Les sessions plantent quand on change de modèle"
          ],
          answer: 1,
          explanation:
            "Le cache de prompt réutilise les tokens d'entrée déjà traités ; un changement de modèle en cours de session invalide tout le préfixe mis en cache et gaspille des tokens."
        }
      ]
    },
    {
      id: "academy-confirmed",
      icon: "🚀",
      rank: "Confirmé",
      title: "Composition à l'échelle de l'équipe",
      focus:
        "Packagez, partagez et orchestrez les primitives avec APM, les workflows multi-agents, les plugins et la CLI Copilot.",
      modules: ["207 · APM", "208 · Workflows", "209 · Plugins", "210 · Copilot CLI"],
      resources: [
        { name: "207 · APM", url: academyDoc("02-composition/207-apm.md") },
        { name: "208 · Workflows", url: academyDoc("02-composition/208-workflows.md") },
        { name: "209 · Plugins", url: academyDoc("02-composition/209-plugins.md") },
        { name: "210 · Copilot CLI", url: academyDoc("02-composition/210-copilot-cli.md") }
      ],
      quiz: [
        {
          prompt:
            "Dans une configuration APM, où vit le SHA de commit exact résolu de chaque dépendance ?",
          options: [
            "Dans apm.yml à côté de chaque dépendance",
            "Dans apm.lock.yaml (resolved_commit + content_hash), généré automatiquement",
            "Dans .github/copilot-instructions.md",
            "Uniquement dans le tag Git"
          ],
          answer: 1,
          explanation:
            "apm.yml déclare les dépendances (épinglables avec #tag) ; le lockfile stocke le commit résolu et le hash de contenu et doit être commité, comme package-lock.json."
        },
        {
          prompt:
            "Quelle commande rend les primitives installées par APM visibles pour VS Code / Copilot ?",
          options: ["apm audit", "apm run copilot", "apm compile -t copilot", "apm publish"],
          answer: 2,
          explanation:
            "apm compile -t copilot écrit la configuration compilée (p. ex. .github/copilot-instructions.md) pour que Copilot la prenne en compte sans configuration supplémentaire."
        },
        {
          prompt:
            "Dans un workflow Outside-In, pourquoi l'orchestrateur doit-il transmettre explicitement la sortie du sous-agent N au sous-agent N+1 ?",
          options: [
            "Pour tenir un journal d'audit",
            "Parce que les sous-agents s'exécutent dans des conversations isolées et ne voient jamais l'historique des étapes précédentes",
            "Parce que les sous-agents n'acceptent que du JSON",
            "Pour éviter de dépasser la limite de débit du modèle"
          ],
          answer: 1,
          explanation:
            "Chaque sous-agent a son propre contexte isolé. L'orchestrateur est le relais : il collecte la sortie de l'étape N et la transmet en entrée de l'étape N+1 — et il ne fait jamais le travail lui-même."
        },
        {
          prompt:
            "Qu'est-ce qui définit un plugin Copilot, par rapport à l'installation de primitives individuelles via APM ?",
          options: [
            "Un plugin est un binaire payant d'un store",
            "Un plugin est un bundle de skills/agents (manifeste .github/plugin/plugin.json) installé en bloc, p. ex. depuis github/awesome-copilot",
            "Un plugin ne fonctionne que dans les IDE JetBrains",
            "Un plugin est un autre nom pour un serveur MCP"
          ],
          answer: 1,
          explanation:
            "Les plugins livrent un kit cohérent de primitives sous forme d'un dépôt Git, avec portée user ou project ; APM gère des primitives individuelles par projet. Les deux se complètent."
        },
        {
          prompt:
            "Dans le terminal, quelle commande demande à Copilot d'expliquer une commande shell inconnue drapeau par drapeau ?",
          options: [
            "gh copilot suggest -t shell",
            "gh copilot explain",
            "gh explain",
            "copilot --help"
          ],
          answer: 1,
          explanation:
            "gh copilot explain décompose une commande donnée ; gh copilot suggest propose une commande à partir d'une description (avec les types -t shell/gh/git et les alias ghcs/ghce)."
        }
      ]
    },
    {
      id: "academy-expert",
      icon: "🧠",
      rank: "Expert",
      title: "Pipelines, LSP et evals",
      focus:
        "Faites tourner des pipelines multi-agents rigoureux, branchez l'intelligence LSP de niveau compilateur et prouvez la valeur des skills avec des evals binaires et LLM-juge.",
      modules: [
        "211 · Pipeline d'agents",
        "212 · LSP",
        "213 · APM vs plugins",
        "310 · Evals binaires",
        "315 · Evals LLM-juge"
      ],
      resources: [
        { name: "211 · Pipeline d'agents", url: academyDoc("02-composition/211-pipeline-agents-handbook.md") },
        { name: "212 · LSP", url: academyDoc("02-composition/212-lsp.md") },
        { name: "213 · APM vs plugins", url: academyDoc("02-composition/213-apm-vs-plugins.md") },
        { name: "310 · Evals binaires", url: academyDoc("03-ingenierie-de-contexte/310-evals.md") },
        { name: "315 · Evals LLM-juge", url: academyDoc("03-ingenierie-de-contexte/315-evals-llm-juge.md") }
      ],
      quiz: [
        {
          prompt:
            "Dans le pipeline de rédaction du handbook, pourquoi l'agent reviewer doit-il démarrer avec un CONTEXTE FRAIS (sans lire les rounds de review précédents) ?",
          options: [
            "Pour économiser des tokens",
            "Pour éviter d'hériter des biais du writer et re-vérifier chaque citation dans son vrai contexte source",
            "Parce que les fichiers de review sont supprimés à chaque round",
            "Parce que le reviewer utilise un modèle plus petit"
          ],
          answer: 1,
          explanation:
            "Un reviewer en contexte chaud voit les citations dans le cadrage voulu par l'auteur. Contexte frais plus re-téléchargement de chaque URL citée : c'est la seule façon d'obtenir un vrai fact-checking contradictoire."
        },
        {
          prompt:
            "La boucle d'alignement writer–reviewer est bornée à 3 rounds. Que se passe-t-il si le round 3 se termine encore en REVISE ?",
          options: [
            "Le chapitre est auto-publié",
            "La boucle repart de zéro",
            "Un checkpoint humain : le pipeline s'arrête et demande à un humain de décider",
            "L'orchestrateur réécrit lui-même le chapitre"
          ],
          answer: 2,
          explanation:
            "Toute boucle d'agents doit avoir une sortie humaine déterministe — une boucle non bornée est un agent qui s'auto-justifie indéfiniment."
        },
        {
          prompt:
            "Quel est le principal bénéfice de configurer des serveurs LSP pour Copilot CLI (.github/lsp.json) ?",
          options: [
            "Cela active la coloration syntaxique dans le terminal",
            "Des opérations de niveau compilateur comme find-references renvoient des résultats structurés compacts au lieu de charger des fichiers entiers dans le contexte",
            "Cela remplace Git",
            "Cela fait fonctionner Copilot hors ligne"
          ],
          answer: 1,
          explanation:
            "LSP donne à Copilot une navigation de code précise (définitions, références, symboles) avec des résultats économes en tokens, et la CLI utilise automatiquement les serveurs configurés."
        },
        {
          prompt:
            "Quelle partie d'un skill installé est chargée dans le contexte à CHAQUE tour, même si le skill ne se déclenche jamais ?",
          options: [
            "Tout le corps du SKILL.md",
            "Rien tant qu'il ne se déclenche pas",
            "Le frontmatter name + description (environ 35–300 tokens par skill)",
            "Seulement le nom du dossier"
          ],
          answer: 2,
          explanation:
            "Les descriptions sont toujours chargées pour que le routeur puisse les évaluer ; les corps se chargent à la demande. C'est pourquoi symlinker partout un dépôt de skills multi-stacks détruit le bénéfice du contexte ciblé."
        },
        {
          prompt:
            "Vous exécutez vos fixtures d'eval with_skill (9/10) et without_skill (8/10). Que conclut le handbook ?",
          options: [
            "On publie — 9/10 est un super score",
            "Le delta de +10 % est sous la barre des ~30 % : le skill ne justifie probablement pas sa place dans le contexte",
            "Ajouter des assertions jusqu'à ce que le delta grossisse",
            "Réécrire les fixtures pour faire échouer without_skill"
          ],
          answer: 1,
          explanation:
            "Le delta with/without est la seule preuve objective de la valeur d'un skill. Un skill qui améliore de moins de ~30 % — ou un score without_skill déjà ≥ 80 % — est probablement inutile."
        },
        {
          prompt:
            "Dans les comparaisons pairwise en LLM-juge, comment neutraliser le biais de position ?",
          options: [
            "Toujours mettre la réponse candidate en premier",
            "Utiliser une rubrique plus longue",
            "Appeler le juge deux fois en inversant l'ordre et ne déclarer un gagnant que si les deux appels concordent",
            "Augmenter la température"
          ],
          answer: 2,
          explanation:
            "Les juges favorisent la première réponse. Le protocole du double appel inversé (plus un juge d'une autre famille de modèles et une calibration sur golden set) rend les verdicts fiables."
        }
      ]
    },
    {
      id: "academy-master",
      icon: "🏆",
      rank: "Maître",
      title: "Maîtrise de l'ingénierie de contexte",
      focus:
        "Sobriété de tokens, outillage de réduction mécanique, boucles d'autoresearch et orchestration de modèles consciente du cache.",
      modules: [
        "311 · Tokens & contexte",
        "312 · Patterns de sobriété",
        "313 · Outils de réduction",
        "314 · Autoresearch",
        "316 · Déplacer le contexte entre modèles",
        "317 · Orchestrer des subagents",
        "318 · Mesurer & optimiser sa consommation"
      ],
      resources: [
        { name: "311 · Tokens & contexte", url: academyDoc("03-ingenierie-de-contexte/311-tokens-contexte.md") },
        { name: "312 · Patterns de sobriété", url: academyDoc("03-ingenierie-de-contexte/312-patterns-sobriete.md") },
        { name: "313 · Outils de réduction", url: academyDoc("03-ingenierie-de-contexte/313-outils-reduction.md") },
        { name: "314 · Autoresearch", url: academyDoc("03-ingenierie-de-contexte/314-autoresearch.md") },
        { name: "316 · Déplacer le contexte", url: academyDoc("03-ingenierie-de-contexte/316-deplacer-contexte-modeles.md") },
        { name: "317 · Subagents", url: academyDoc("03-ingenierie-de-contexte/317-orchestrer-subagents.md") },
        { name: "318 · Mesurer sa consommation", url: academyDoc("03-ingenierie-de-contexte/318-mesurer-optimiser-consommation.md") }
      ],
      quiz: [
        {
          prompt:
            "Pourquoi la qualité se dégrade-t-elle même sur des modèles à très grande fenêtre de contexte ?",
          options: [
            "Les longs contextes sont tronqués silencieusement",
            "Dilution du signal : le modèle prête attention à chaque token, donc plus de bruit signifie moins de focus sur l'essentiel",
            "Les grandes fenêtres désactivent le cache de prompt",
            "Les tokens au-delà de 100k sont gratuits mais ignorés"
          ],
          answer: 1,
          explanation:
            "La dilution du signal est le plus insidieux des quatre coûts (coût, latence, saturation, dilution) : la qualité baisse quand le ratio signal/bruit baisse, quelle que soit la taille de la fenêtre."
        },
        {
          prompt:
            "Quelle pratique de structuration du code réduit le plus le contexte que Copilot doit charger ?",
          options: [
            "Fusionner les services liés dans un gros fichier pour moins de lectures",
            "SRP et noms métier : un fichier = une intention, p. ex. calculateShippingCost(order, policy): Money",
            "Des fichiers de 5 lignes maximum",
            "Des commentaires détaillés à chaque ligne"
          ],
          answer: 1,
          explanation:
            "Le langage omniprésent et SOLID rendent le code auto-descriptif : seul le fichier pertinent est chargé ; la sur-fragmentation (fichiers de 5 lignes) ajoute du bruit de navigation — visez ~30–80 lignes."
        },
        {
          prompt:
            "Qu'est-ce qui distingue un sous-agent de synthèse réellement utile d'un faux ?",
          options: [
            "Il utilise un modèle premium",
            "Il lit 3 fichiers (~4000 tokens) et renvoie une conclusion d'environ 200 tokens au lieu de copier-coller les fichiers bruts",
            "Il renvoie toujours du JSON",
            "Il s'exécute en moins de 10 ms"
          ],
          answer: 1,
          explanation:
            "Un sous-agent qui colle 500 lignes brutes déplace le coût au lieu de le réduire. SNIP/RTK et ast-grep/rg/jq appliquent le même principe mécaniquement (jusqu'à ~90–99 % d'économies)."
        },
        {
          prompt:
            "Dans une boucle d'autoresearch, combien de changements chaque expérience doit-elle apporter au SKILL.md ?",
          options: [
            "Le plus possible pour converger plus vite",
            "Exactement une mutation, puis re-exécution et KEEP ou DISCARD",
            "Un par fixture d'eval",
            "Aucun — seules les fixtures changent"
          ],
          answer: 1,
          explanation:
            "Une mutation à la fois est la seule façon de savoir ce qui a aidé. Arrêt à 95 %+ de réussite sur 3 expériences consécutives — 70–85 % étant le plafond réaliste de la plupart des skills."
        },
        {
          prompt:
            "Vous avez planifié avec un modèle de raisonnement profond et voulez implémenter avec un modèle plus léger. Quand le transfert Markdown (plan.md + nouvelle session) vaut-il mieux que le fork de conversation ?",
          options: [
            "Quand l'implémentation a besoin de chaque détail du raisonnement de planification",
            "Quand le plan se résume proprement dans un document : la nouvelle session démarre avec un contexte minimal sans bruit",
            "Quand on veut garder le préfixe de cache chaud",
            "Jamais — le fork est toujours meilleur"
          ],
          answer: 1,
          explanation:
            "Le fork hérite de tout le contexte, bruit de planification compris ; un transfert plan.md démarre une session propre où seule la spec compte (au prix d'un cache froid)."
        },
        {
          prompt:
            "Dans le pattern Route & Assemble, sur quel niveau de modèle l'orchestrateur lui-même doit-il tourner ?",
          options: [
            "Le niveau premium de raisonnement — il prend les décisions les plus dures",
            "Le niveau léger (p. ex. Haiku 4.5 / Gemini Flash) car il ne fait que router et assembler, sans raisonner profondément ni écrire de code",
            "Le même niveau que l'implémenteur",
            "Peu importe"
          ],
          answer: 1,
          explanation:
            "La valeur de l'orchestrateur est le routage : les sous-agents planificateurs reçoivent les modèles de raisonnement profond, les implémenteurs les modèles d'ingénierie courante, et le contexte de chaque sous-agent est jeté après usage."
        },
        {
          prompt:
            "Quelle action ne casse PAS le cache de prompt pendant une longue session ?",
          options: [
            "Modifier un message antérieur",
            "Réinsérer un gros bloc en haut de la conversation",
            "Ajouter le nouveau contexte à la fin de la conversation",
            "Changer de modèle en cours de session"
          ],
          answer: 2,
          explanation:
            "Le cache réutilise le préfixe stable (système + outils + messages antérieurs). Ajouter à la fin le préserve — c'est ainsi qu'on atteint ~88 % de cache hit dans les Agent Debug Logs."
        }
      ]
    }
  ]
};

const academies = { en: copilotAcademyEn, fr: copilotAcademyFr };

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
    languageSwitcherLabel: "Language",
    academyEyebrow: "Copilot Academy",
    academyTitle: "GitHub Copilot mastery quizzes",
    academyCopy:
      "Progressive quizzes built from the AxaFrance learning-path-copilot handbook. Pass each level to unlock the next.",
    academySiteLink: "Open the handbook",
    academyRepoLink: "Source repository (AxaFrance)",
    academyLevelPill: (position, total) => `Level ${position} / ${total}`,
    academyQuestionsPill: (count) => `${count} questions`,
    academyPassPill: (threshold) => `Pass mark: ${threshold}%`,
    academyModulesHeading: "Handbook modules covered",
    academyLockedBadge: "🔒 Locked",
    academyPassedBadge: "✓ Passed",
    academyUnlockedBadge: "Unlocked",
    academyLockedNote: (rank, threshold) =>
      `Locked — score at least ${threshold}% on the ${rank} level to unlock this quiz.`,
    academyBestScore: (score) => `Best score: ${score}%`,
    academyNotAttempted: "Not attempted yet",
    academyPassMessage: "Level passed! The next level is unlocked.",
    academyFinalPassMessage: "All levels passed — you are a Copilot Master! 🏆",
    academyFailMessage: (threshold) =>
      `Below the ${threshold}% pass mark — review the resources and retry.`,
    statAcademy: "Copilot Academy levels"
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
    languageSwitcherLabel: "Langue",
    academyEyebrow: "Académie Copilot",
    academyTitle: "Quiz de maîtrise GitHub Copilot",
    academyCopy:
      "Des quiz progressifs construits à partir du handbook learning-path-copilot d'AXA France. Réussissez chaque niveau pour déverrouiller le suivant.",
    academySiteLink: "Ouvrir le handbook",
    academyRepoLink: "Dépôt source (AXA France)",
    academyLevelPill: (position, total) => `Niveau ${position} / ${total}`,
    academyQuestionsPill: (count) => `${count} questions`,
    academyPassPill: (threshold) => `Seuil de réussite : ${threshold}%`,
    academyModulesHeading: "Modules du handbook couverts",
    academyLockedBadge: "🔒 Verrouillé",
    academyPassedBadge: "✓ Réussi",
    academyUnlockedBadge: "Déverrouillé",
    academyLockedNote: (rank, threshold) =>
      `Verrouillé — obtenez au moins ${threshold}% au niveau ${rank} pour déverrouiller ce quiz.`,
    academyBestScore: (score) => `Meilleur score : ${score}%`,
    academyNotAttempted: "Pas encore tenté",
    academyPassMessage: "Niveau réussi ! Le niveau suivant est déverrouillé.",
    academyFinalPassMessage: "Tous les niveaux réussis — vous êtes un Maître Copilot ! 🏆",
    academyFailMessage: (threshold) =>
      `Sous le seuil de ${threshold}% — révisez les ressources et réessayez.`,
    statAcademy: "Niveaux de l'Académie Copilot"
  }
};

const storageKey = "principal-learning-path-state";
const languageStorageKey = "principal-learning-path-language";

const loadState = () => {
  try {
    const stored = JSON.parse(localStorage.getItem(storageKey)) || {};
    return {
      completed: stored.completed && typeof stored.completed === "object" ? stored.completed : {},
      scores: stored.scores && typeof stored.scores === "object" ? stored.scores : {},
      academy: stored.academy && typeof stored.academy === "object" ? stored.academy : {}
    };
  } catch (error) {
    return { completed: {}, scores: {}, academy: {} };
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
let academy = academies[language];

const setLanguage = (nextLanguage) => {
  if (!plans[nextLanguage] || nextLanguage === language) return;
  language = nextLanguage;
  plan = plans[language];
  t = ui[language];
  academy = academies[language];
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
  const academyPassedCount = academy.levels.filter(
    (level) => (state.academy[level.id] ?? -1) >= academySettings.passThreshold
  ).length;
  const academyPercent = Math.round((academyPassedCount / academy.levels.length) * 100);

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
      <strong>${t.statAcademy}</strong>
      <span>${academyPassedCount} / ${academy.levels.length}</span>
      <div class="progress-track" role="progressbar" aria-valuenow="${academyPercent}" aria-valuemin="0" aria-valuemax="100" aria-label="${t.statAcademy}">
        <div class="progress-fill" style="width: ${academyPercent}%"></div>
      </div>
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
        state.academy = imported.academy && typeof imported.academy === "object" ? imported.academy : {};
        saveState(state);
        summarize();
        renderModules();
        renderCopilotAcademy();
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
  state.academy = {};
  saveState(state);
  summarize();
  renderModules();
  renderCopilotAcademy();
};

const renderGoals = () => {
  document.getElementById("goals").innerHTML = plan.goals
    .map((goal) => `<span class="chip">${goal}</span>`)
    .join("");
};

const openAccordions = new Set();

const trackAccordions = (rootElement) => {
  rootElement.querySelectorAll("details[data-accordion]").forEach((detailsElement) => {
    detailsElement.addEventListener("toggle", () => {
      if (detailsElement.open) {
        openAccordions.add(detailsElement.dataset.accordion);
      } else {
        openAccordions.delete(detailsElement.dataset.accordion);
      }
    });
  });
};

const renderModules = () => {
  const modulesElement = document.getElementById("modules");

  modulesElement.innerHTML = plan.modules
    .map((module) => {
      const score = state.scores[module.id];
      const accordionId = `module-${module.id}`;

      return `
        <details class="module accordion" data-accordion="${accordionId}"${openAccordions.has(accordionId) ? " open" : ""}>
          <summary class="accordion__summary">
            <div class="accordion__title">
              <p class="eyebrow">${module.weeks}</p>
              <h3>${module.title}</h3>
            </div>
            <span class="accordion__chevron" aria-hidden="true">▾</span>
          </summary>
          <div class="accordion__body">
          <div class="module__header">
            <p>${module.objective}</p>
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
          </div>
        </details>
      `;
    })
    .join("");

  trackAccordions(modulesElement);

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

const academyFeedback = {};

const academyBestScore = (levelId) => {
  const score = state.academy[levelId];
  return Number.isFinite(score) ? score : null;
};

const isAcademyLevelPassed = (levelId) =>
  (academyBestScore(levelId) ?? -1) >= academySettings.passThreshold;

const isAcademyLevelUnlocked = (index) =>
  index === 0 || isAcademyLevelPassed(academy.levels[index - 1].id);

const renderAcademyResult = (level, feedback) => {
  const passed = feedback.score >= academySettings.passThreshold;
  const isLastLevel = academy.levels[academy.levels.length - 1].id === level.id;
  const statusMessage = passed
    ? isLastLevel
      ? t.academyFinalPassMessage
      : t.academyPassMessage
    : t.academyFailMessage(academySettings.passThreshold);

  return `
    <div class="result ${passed ? "result--good" : "result--bad"}">
      <p><strong>${t.scoreLabel}</strong> ${feedback.score}% — ${statusMessage}</p>
      <ul>
        ${level.quiz
          .map(
            (question, index) => `
              <li>
                <strong>Q${index + 1}:</strong> ${feedback.answers[index] === question.answer ? t.correct : t.reviewNeeded} —
                ${question.explanation}
              </li>
            `
          )
          .join("")}
      </ul>
    </div>
  `;
};

const renderCopilotAcademy = () => {
  const totalLevels = academy.levels.length;
  const currentIndex = academy.levels.findIndex((level) => !isAcademyLevelPassed(level.id));

  document.getElementById("academy-progress").innerHTML = `
    ${academy.levels
      .map((level, index) => {
        const passed = isAcademyLevelPassed(level.id);
        const modifier = passed
          ? " rank-step--passed"
          : index === currentIndex
            ? " rank-step--current"
            : "";
        return `<span class="rank-step${modifier}">${level.icon} ${level.rank}</span>`;
      })
      .join("")}
    <a class="resource-link" href="${academySettings.siteUrl}" target="_blank" rel="noreferrer">${t.academySiteLink}</a>
    <a class="resource-link" href="${academySettings.repoUrl}" target="_blank" rel="noreferrer">${t.academyRepoLink}</a>
  `;

  const academyElement = document.getElementById("copilot-academy");

  academyElement.innerHTML = academy.levels
    .map((level, index) => {
      const unlocked = isAcademyLevelUnlocked(index);
      const passed = isAcademyLevelPassed(level.id);
      const bestScore = academyBestScore(level.id);
      const badgeModifier = passed ? " rank-badge--passed" : unlocked ? "" : " rank-badge--locked";
      const badgeState = passed
        ? t.academyPassedBadge
        : unlocked
          ? t.academyUnlockedBadge
          : t.academyLockedBadge;
      const feedback = academyFeedback[level.id];
      const accordionId = `level-${level.id}`;

      const body = unlocked
        ? `
          <h4>${t.resourcesHeading}</h4>
          <div class="resource-list">
            ${level.resources
              .map(
                (resource) =>
                  `<a class="resource-link" href="${resource.url}" target="_blank" rel="noreferrer">${resource.name}</a>`
              )
              .join("")}
          </div>

          <div class="quiz">
            <form data-level="${level.id}">
              ${level.quiz
                .map(
                  (question, questionIndex) => `
                    <fieldset>
                      <legend>${questionIndex + 1}. ${question.prompt}</legend>
                      ${question.options
                        .map(
                          (option, optionIndex) => `
                            <label>
                              <input type="radio" name="${level.id}-${questionIndex}" value="${optionIndex}" />
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
              <span class="badge">${bestScore !== null ? t.academyBestScore(bestScore) : t.academyNotAttempted}</span>
            </div>
            <div id="academy-result-${level.id}">${feedback ? renderAcademyResult(level, feedback) : ""}</div>
          </div>
        `
        : `
          <p class="locked-note">🔒 ${t.academyLockedNote(
            academy.levels[index - 1].rank,
            academySettings.passThreshold
          )}</p>
        `;

      return `
        <details class="level-card accordion${unlocked ? "" : " level-card--locked"}" data-accordion="${accordionId}"${openAccordions.has(accordionId) ? " open" : ""}>
          <summary class="accordion__summary">
            <div class="accordion__title">
              <p class="eyebrow">${t.academyLevelPill(index + 1, totalLevels)}</p>
              <h3>${level.icon} ${level.rank} — ${level.title}</h3>
            </div>
            <span class="rank-badge${badgeModifier}">${badgeState}</span>
            <span class="accordion__chevron" aria-hidden="true">▾</span>
          </summary>
          <div class="accordion__body">
          <div class="level-card__header">
            <p>${level.focus}</p>
            <div class="meta-list">
              <span class="meta-pill">${t.academyQuestionsPill(level.quiz.length)}</span>
              <span class="meta-pill">${t.academyPassPill(academySettings.passThreshold)}</span>
            </div>
          </div>

          <h4>${t.academyModulesHeading}</h4>
          <ul>${level.modules.map((item) => `<li>${item}</li>`).join("")}</ul>

          ${body}
          </div>
        </details>
      `;
    })
    .join("");

  trackAccordions(academyElement);

  academyElement.querySelectorAll("form").forEach((form) => {
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const level = academy.levels.find((entry) => entry.id === form.dataset.level);

      const answers = level.quiz.map((_, index) => {
        const selected = form.querySelector(`input[name="${level.id}-${index}"]:checked`);
        return selected ? Number(selected.value) : null;
      });

      const correct = answers.filter((answer, index) => answer === level.quiz[index].answer).length;
      const score = Math.round((correct / level.quiz.length) * 100);
      state.academy[level.id] = Math.max(academyBestScore(level.id) ?? 0, score);
      saveState(state);
      academyFeedback[level.id] = { score, answers };
      summarize();
      renderCopilotAcademy();
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
  renderCopilotAcademy();
  renderFinalAssessment();
  renderApplicationPlan();
};

document.querySelectorAll(".lang-button").forEach((button) => {
  button.addEventListener("click", () => setLanguage(button.dataset.lang));
});

renderAll();
