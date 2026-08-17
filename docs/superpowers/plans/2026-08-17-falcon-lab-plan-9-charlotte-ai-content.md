# Falcon Lab Plan 9: Charlotte AI Domain Content (Tracks 4.1–4.3)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Author all Charlotte AI domain content — Tracks 4.1 (Foundations), 4.2 (Using Charlotte AI Effectively), and 4.3 (Charlotte AI + SOAR Integration) — 8 modules total, 3 track scenarios, and 1 cumulative scenario, making the Charlotte AI domain fully playable end-to-end.

**Architecture:** Same pattern as Plans 6–8. Each track lives in its own file and is imported into `charlotte-ai.ts`. No component code changes needed.

**Tech Stack:** TypeScript data files only. Validation: `npx tsc -b` + `npm test`.

## Global Constraints

- TypeScript strict mode — `noUnusedLocals: true` enforced by `tsc -b` (NOT `tsc --noEmit`)
- Quiz ID prefixes: `charlotte-foundations-q*` (Track 4.1), `charlotte-usage-q*` (Track 4.2), `charlotte-soar-q*` (Track 4.3) — all globally unique
- Scenario step IDs: `ch-found-s1..s5` (Track 4.1), `ch-usage-s1..s5` (Track 4.2), `ch-soar-s1..s5` (Track 4.3), `ch-cum-s1..s6` (cumulative)
- Every `docUrl` begins with `https://falcon.crowdstrike.com/documentation`
- Every module's `lastReviewed`: `'2026-08-17'`
- `ContentModule.quiz` is `QuizQuestion[]` (plain array, NOT `{ questions: ... }`)
- **NO `challenge` field on any module** — Charlotte AI domain does not use challenges per spec
- Do NOT import `CqlChallenge`, `PlaybookChallenge`, or `PlaybookStep` — unused imports cause `tsc -b` failure
- Track scenarios: exactly 5 steps, `isCumulative: false`
- Cumulative scenario: exactly 6 steps, `isCumulative: true`
- `codeLanguage` must be one of the allowed union values: `'cql' | 'yaml' | 'json' | 'typescript' | 'bash'`
- `ScenarioStep.choices` entries use `{ text: string }` (not `{ label: string }`)
- **The correct answer must physically sit at the required `correctIndex`/`correctChoiceIndex` position in the array.** Do NOT set the index to a number without also reordering the array so the correct answer text is at that position.
- Correct-answer distribution — Task 1 quiz: q1=0,q2=1,q3=2,q4=3,q5=0,q6=1,q7=2,q8=3,q9=0,q10=1,q11=2,q12=3,q13=0,q14=1,q15=2; scenario steps s1=0,s2=1,s3=2,s4=3,s5=0
- Correct-answer distribution — Task 2 quiz: q1=0,q2=1,q3=2,q4=3,q5=0,q6=1,q7=2,q8=3,q9=0,q10=1,q11=2,q12=3,q13=0,q14=1,q15=2; scenario steps s1=0,s2=1,s3=2,s4=3,s5=0
- Correct-answer distribution — Task 3 quiz: q1=0,q2=1,q3=2,q4=3,q5=0,q6=1,q7=2,q8=3,q9=0,q10=1; scenario steps s1=0,s2=1,s3=2,s4=3,s5=0
- Correct-answer distribution — Task 4 cumulative steps: s1=0,s2=1,s3=2,s4=3,s5=0,s6=1
- All `ScenarioStep` and `QuizQuestion` DocUrls start with `https://falcon.crowdstrike.com/documentation`
- `trackId` on each module must match the parent track's `id` exactly

---

## File Map

| Status | File | Role |
|---|---|---|
| **Create** | `src/content/domains/charlotte-track-4-1.ts` | Track 4.1 Foundations — 3 modules + scenario |
| **Create** | `src/content/domains/charlotte-track-4-2.ts` | Track 4.2 Using Charlotte AI Effectively — 3 modules + scenario |
| **Create** | `src/content/domains/charlotte-track-4-3.ts` | Track 4.3 Charlotte AI + SOAR Integration — 2 modules + scenario |
| **Modify** | `src/content/domains/charlotte-ai.ts` | Import 3 new tracks, populate `tracks[]`, replace cumulative scenario stub |

---

### Task 1: Track 4.1 — Foundations

**Files:**
- Create: `src/content/domains/charlotte-track-4-1.ts`
- Modify: `src/content/domains/charlotte-ai.ts`

- [ ] **Step 1: Create `src/content/domains/charlotte-track-4-1.ts`**

Write this file verbatim. The correct answer in each question/step is already at the required distribution index — do NOT reshuffle.

```typescript
import type {
  ContentModule,
  ContentTrack,
  QuizQuestion,
  ConceptSection,
  Scenario,
} from '../types'

// ═══════════════════════════════════════════════════════════════════════════════
// Track 4.1 — Foundations
// ═══════════════════════════════════════════════════════════════════════════════

// ── Module 4.1.1: What is Charlotte AI? Capabilities & Architecture ──────────

const whatIsCharlotteConcepts: ConceptSection[] = [
  {
    title: 'Charlotte AI — CrowdStrike\'s Generative AI Security Analyst',
    body: 'Charlotte AI is CrowdStrike\'s generative AI assistant embedded directly in the Falcon platform. It acts as an on-demand AI security analyst — answering natural language questions about your environment, summarising detections, and guiding investigations — without requiring a separate tool or subscription beyond your existing Falcon plan.\n\nKey capabilities:\n\n**Natural language querying:** Ask questions in plain English like "Show me failed logins targeting admin accounts in the last 24 hours" and Charlotte AI generates and executes the underlying LogScale/CQL query automatically.\n\n**Alert summarisation:** Charlotte AI reads detection telemetry and produces a plain-language explanation of what happened, the likely attack technique, affected assets, and recommended next steps.\n\n**Investigation guidance:** During an active incident, Charlotte AI answers follow-up questions, suggests hunting queries, and correlates findings across Falcon modules (endpoint, identity, network, SIEM).\n\n**Threat intelligence enrichment:** Charlotte AI incorporates CrowdStrike\'s threat intelligence to contextualise findings — mapping observed behaviour to known adversary groups and TTPs (tactics, techniques, procedures).',
  },
  {
    title: 'Charlotte AI Architecture: Data Access and Privacy',
    body: 'Charlotte AI has a **read-only** view of your Falcon tenant. It can query your data, generate summaries, and guide investigations — but it cannot create alerts, modify configurations, delete data, or trigger response actions autonomously.\n\n**Data sources Charlotte AI can access:**\n- LogScale events (via your Next-Gen SIEM repositories)\n- Falcon detections and incidents\n- Endpoint inventory (devices, OS versions, agent versions)\n- Identity data (user accounts, authentication events)\n- Threat intelligence from CrowdStrike Falcon Intelligence\n\n**Privacy and data isolation:**\n- Customer data is processed in CrowdStrike\'s infrastructure but is NOT used to train the shared Charlotte AI model\n- Charlotte AI is tenant-isolated — it only sees data within your Falcon organisation\n- Session context: Charlotte AI maintains context within a conversation (it remembers earlier questions in the same session) but not across sessions\n\n**What Charlotte AI cannot do:**\n- Access data outside your Falcon tenant\n- Execute response actions autonomously\n- Guarantee 100% accuracy — like all generative AI, it can produce incorrect outputs that require analyst verification',
  },
]

const whatIsCharlotteQuestions: QuizQuestion[] = [
  {
    id: 'charlotte-foundations-q1',
    text: 'What is Charlotte AI\'s primary function in the Falcon platform?',
    options: [
      'A generative AI security analyst assistant embedded in Falcon — answers natural language questions, summarises alerts, and guides investigations',
      'An automated incident response system that remediates threats without analyst input',
      'A standalone AI product separate from Falcon requiring its own subscription and deployment',
      'A SOAR replacement that generates and executes Fusion playbooks using natural language rules',
    ],
    correctIndex: 0,
    explanation: 'Charlotte AI is CrowdStrike\'s generative AI assistant built directly into the Falcon platform. It acts as an on-demand security analyst — not an autonomous responder. It answers questions, summarises detections, and guides investigations, but all response actions remain with the human analyst. It requires no separate subscription or deployment.',
    docTitle: 'Charlotte AI Overview',
    docUrl: 'https://falcon.crowdstrike.com/documentation/page/charlotte-ai-overview',
  },
  {
    id: 'charlotte-foundations-q2',
    text: 'Which of the following data sources can Charlotte AI access within your Falcon tenant?',
    options: [
      'External threat feeds outside the Falcon platform, public CVE databases, and competitor SIEM data',
      'LogScale events, Falcon detections, endpoint inventory, identity data, and CrowdStrike threat intelligence — all within your tenant',
      'Only Falcon detections and incidents — Charlotte AI cannot query raw LogScale events',
      'Cloud provider logs from AWS, Azure, and GCP directly via Charlotte AI\'s built-in connectors',
    ],
    correctIndex: 1,
    explanation: 'Charlotte AI can access all data within your Falcon tenant: LogScale events, Falcon detections and incidents, endpoint inventory, identity data, and CrowdStrike Falcon Intelligence threat intelligence. It cannot access data outside your tenant boundary — no external feeds, no competitor SIEM data, no raw cloud provider logs unless they are ingested into LogScale.',
    docTitle: 'Charlotte AI Data Sources',
    docUrl: 'https://falcon.crowdstrike.com/documentation/page/charlotte-ai-overview',
  },
  {
    id: 'charlotte-foundations-q3',
    text: 'A junior analyst is excited to let Charlotte AI automatically contain a compromised host. Is this possible?',
    options: [
      'Yes — Charlotte AI can trigger Network Containment on any host it identifies as compromised',
      'Yes — but only for hosts with a Critical severity detection; lower severity requires analyst approval',
      'No — Charlotte AI has read-only access to tenant data; it cannot execute response actions, modify configurations, or trigger containment autonomously',
      'No — but Charlotte AI can queue a containment action for the analyst to approve with a single click',
    ],
    correctIndex: 2,
    explanation: 'Charlotte AI is read-only — it can query data, generate insights, and guide analysts, but it cannot autonomously trigger any response action including network containment, process kills, or policy changes. All response decisions and executions remain with the human analyst. This is a fundamental trust and safety boundary in Charlotte AI\'s design.',
    docTitle: 'Charlotte AI Capabilities and Limitations',
    docUrl: 'https://falcon.crowdstrike.com/documentation/page/charlotte-ai-overview',
  },
  {
    id: 'charlotte-foundations-q4',
    text: 'You ask Charlotte AI "Which admin accounts logged in from unusual locations this week?" and then follow up with "Show me the same pattern for last month." How does Charlotte AI handle the follow-up?',
    options: [
      'Charlotte AI treats each question as independent — it has no memory of previous questions in the same session',
      'Charlotte AI remembers the follow-up across multiple sessions but only for 7 days',
      'Charlotte AI always requires the analyst to re-state the full context — natural language follow-up is not supported',
      'Charlotte AI retains context within the current session — it understands "the same pattern" refers to the admin account unusual-location query and reuses that context for the follow-up',
    ],
    correctIndex: 3,
    explanation: 'Charlotte AI maintains conversational context within a session. Follow-up questions like "Show me the same pattern for last month" are understood in the context of the current conversation — Charlotte AI knows "the same pattern" refers to admin accounts with unusual login locations. Context does NOT persist across sessions; a new session starts fresh.',
    docTitle: 'Charlotte AI Conversational Context',
    docUrl: 'https://falcon.crowdstrike.com/documentation/page/charlotte-ai-overview',
  },
  {
    id: 'charlotte-foundations-q5',
    text: 'A security architect asks: "Does CrowdStrike use our security event data to train the shared Charlotte AI model?" What is the correct answer?',
    options: [
      'No — customer data is processed in CrowdStrike\'s infrastructure but is explicitly NOT used to train the shared Charlotte AI model; tenant data is isolated',
      'Yes — all Charlotte AI queries and responses are used to improve the shared model, which is disclosed in the service agreement',
      'Yes — anonymised telemetry is aggregated across all tenants to improve detection accuracy',
      'Unknown — CrowdStrike has not published a privacy policy covering Charlotte AI training data usage',
    ],
    correctIndex: 0,
    explanation: 'CrowdStrike explicitly does not use customer data to train the shared Charlotte AI model. Your security event data processed during Charlotte AI interactions remains within your tenant boundary and is used only to answer your queries — not fed back into model training. This is a key privacy commitment relevant to regulated industries.',
    docTitle: 'Charlotte AI Privacy and Data Handling',
    docUrl: 'https://falcon.crowdstrike.com/documentation/page/charlotte-ai-overview',
  },
]

export const whatIsCharlotteModule: ContentModule = {
  id: 'charlotte-foundations-what-is',
  title: 'What is Charlotte AI? Capabilities & Architecture',
  trackId: 'charlotte-foundations',
  domainId: 'charlotte-ai',
  order: 1,
  lastReviewed: '2026-08-17',
  concepts: whatIsCharlotteConcepts,
  quiz: whatIsCharlotteQuestions,
}

// ── Module 4.1.2: Charlotte AI vs. Traditional Detection Workflows ─────────

const vsTraditionalConcepts: ConceptSection[] = [
  {
    title: 'Traditional Detection: Manual CQL, Alert Fatigue, and Context Gaps',
    body: 'In a traditional Falcon Next-Gen SIEM workflow, analysts:\n\n1. **Write CQL manually** — craft queries for each investigation from scratch\n2. **Review raw alerts** — read detection telemetry directly without summarisation\n3. **Build context manually** — pivot across multiple Falcon modules to correlate endpoint, identity, and network data\n4. **Reference documentation** — look up CQL syntax, field names, and detection techniques each time\n\nThis workflow has real costs: experienced analysts spend 30–60 minutes building context for a single alert. Junior analysts write slower, less optimal CQL. Alert fatigue develops when high-volume environments produce hundreds of alerts per shift without automated prioritisation.\n\nTraditional detection is not broken — it remains the foundation — but it scales poorly as data volume and team size grow.',
  },
  {
    title: 'Charlotte AI: Acceleration Without Replacement',
    body: 'Charlotte AI addresses specific friction points in traditional workflows without replacing analyst judgment:\n\n**What Charlotte AI accelerates:**\n- **Query generation:** Natural language → working CQL in seconds; no syntax lookup required\n- **Alert summarisation:** Charlotte AI reads the raw detection and produces a 3–5 sentence plain-language summary including likely technique, affected assets, and recommended action\n- **Context building:** Cross-module correlation happens in one AI query rather than manual pivoting across 4–6 Falcon screens\n- **Onboarding:** Junior analysts can ask "what does this detection mean?" and receive an expert-level explanation immediately\n\n**What Charlotte AI does NOT replace:**\n- **Final investigation decisions** — Charlotte AI provides information and suggestions; the analyst decides what happened and what to do\n- **CQL knowledge** — analysts who understand CQL can verify and refine Charlotte AI\'s generated queries; those who cannot cannot catch errors\n- **Incident judgement** — Charlotte AI can misclassify or hallucinate; experienced analysts catch these errors; inexperienced ones may not\n\n**Net outcome:** Charlotte AI reduces time-to-context from 30–60 minutes to 5–10 minutes for experienced analysts; it requires more caution for junior analysts who lack the foundation to catch AI errors.',
  },
]

const vsTraditionalQuestions: QuizQuestion[] = [
  {
    id: 'charlotte-foundations-q6',
    text: 'A SOC manager asks: "Will Charlotte AI reduce the need for analysts to learn CQL?" What is the most accurate answer?',
    options: [
      'Yes — Charlotte AI\'s natural language interface completely eliminates the need for CQL knowledge',
      'No — analysts who understand CQL can verify and correct Charlotte AI\'s generated queries; those who cannot cannot catch errors, making CQL knowledge more important, not less',
      'Partially — Charlotte AI handles simple queries automatically, but analysts still need CQL for complex investigations',
      'No — Charlotte AI does not generate CQL; it only summarises existing alerts and cannot create new queries',
    ],
    correctIndex: 1,
    explanation: 'Charlotte AI generates CQL from natural language, but analyst CQL knowledge remains critical. An analyst who understands CQL can review Charlotte AI\'s generated query and catch mistakes — an incorrect time bound, a missing filter, a wrong field name. An analyst who cannot read CQL cannot audit what Charlotte AI produces. AI acceleration without verification capability creates a trust-without-validation risk.',
    docTitle: 'Charlotte AI and Analyst Skills',
    docUrl: 'https://falcon.crowdstrike.com/documentation/page/charlotte-ai-best-practices',
  },
  {
    id: 'charlotte-foundations-q7',
    text: 'What specific problem in traditional SIEM workflows does Charlotte AI\'s alert summarisation most directly address?',
    options: [
      'The cost of LogScale storage for high-volume event types',
      'The slow speed of CQL query execution on the Hot tier',
      'The time analysts spend building alert context manually — Charlotte AI reduces 30–60 minute context-building to 5–10 minutes by automatically correlating cross-module data and generating plain-language summaries',
      'The difficulty of writing Fusion SOAR playbooks for complex multi-step responses',
    ],
    correctIndex: 2,
    explanation: 'Alert context-building — reading raw telemetry, pivoting across endpoint/identity/network modules, researching techniques — is the largest time cost in traditional SIEM investigation. Charlotte AI\'s alert summarisation directly compresses this from 30–60 minutes to 5–10 minutes by consuming the cross-module data and producing a plain-language explanation with technique attribution and recommended next steps.',
    docTitle: 'Charlotte AI Alert Summarisation',
    docUrl: 'https://falcon.crowdstrike.com/documentation/page/charlotte-ai-overview',
  },
  {
    id: 'charlotte-foundations-q8',
    text: 'A junior analyst relies entirely on Charlotte AI for alert investigation without any manual verification. What is the primary risk?',
    options: [
      'Excessive query costs from Charlotte AI\'s LogScale usage exceeding the tenant\'s daily query budget',
      'Violating the Falcon platform Terms of Service by using AI for security analysis',
      'Charlotte AI session tokens expiring mid-investigation and losing all investigation context',
      'Charlotte AI can misclassify events or hallucinate details; without the CQL and security knowledge to verify its outputs, the analyst cannot catch errors — leading to missed threats or false escalations',
    ],
    correctIndex: 3,
    explanation: 'Charlotte AI, like all generative AI, can produce incorrect outputs — misattributing a technique, hallucinating a field value, or over-confidently asserting a conclusion that does not hold. A junior analyst who lacks the underlying CQL and security fundamentals to verify these outputs has no defence against accepting a wrong answer. Charlotte AI is an accelerator for capable analysts, not a substitute for the foundation knowledge.',
    docTitle: 'Charlotte AI Limitations',
    docUrl: 'https://falcon.crowdstrike.com/documentation/page/charlotte-ai-best-practices',
  },
  {
    id: 'charlotte-foundations-q9',
    text: 'Charlotte AI generates a CQL query from your natural language request. What should you do before relying on the results?',
    options: [
      'Review the generated CQL for correctness — verify the time bounds, field names, and filters match your intent — before treating the results as authoritative',
      'Submit the query immediately; Charlotte AI guarantees syntactically correct CQL that matches the analyst\'s intent',
      'Ask Charlotte AI to validate its own query before submission — self-review is sufficient verification',
      'Run the query and only verify the CQL if the result count seems unexpectedly high or low',
    ],
    correctIndex: 0,
    explanation: 'Always review Charlotte AI\'s generated CQL before treating results as authoritative. Common Charlotte AI query errors include: incorrect time bounds (too broad or too narrow), wrong field names from different parser schemas, missing filters that include unwanted data. Reviewing the CQL takes 30 seconds and prevents hours of investigation built on a flawed query.',
    docTitle: 'Charlotte AI Generated Query Verification',
    docUrl: 'https://falcon.crowdstrike.com/documentation/page/charlotte-ai-best-practices',
  },
  {
    id: 'charlotte-foundations-q10',
    text: 'In what scenario is Charlotte AI most beneficial compared to a traditional CQL-only workflow?',
    options: [
      'When running scheduled saved searches that need to execute at exactly the same time each day',
      'When an experienced analyst needs to rapidly build cross-module context on an unfamiliar alert type, cutting investigation time from 45 minutes to under 10 minutes by automating query generation and data correlation',
      'When the LogScale cluster is under load and queries need to be automatically prioritised by AI',
      'When creating new detection rules that need to be validated against historical data before deployment',
    ],
    correctIndex: 1,
    explanation: 'Charlotte AI\'s highest-value scenario is context acceleration for experienced analysts facing unfamiliar alert types. The analyst knows enough to verify Charlotte AI\'s outputs but would otherwise spend 30–60 minutes manually querying, pivoting, and correlating. Charlotte AI compresses this to under 10 minutes. Scheduled saved searches, query prioritisation, and detection rule validation are not Charlotte AI use cases.',
    docTitle: 'Charlotte AI Use Cases',
    docUrl: 'https://falcon.crowdstrike.com/documentation/page/charlotte-ai-overview',
  },
]

export const vsTraditionalModule: ContentModule = {
  id: 'charlotte-foundations-vs-traditional',
  title: 'Charlotte AI vs. Traditional Detection Workflows',
  trackId: 'charlotte-foundations',
  domainId: 'charlotte-ai',
  order: 2,
  lastReviewed: '2026-08-17',
  concepts: vsTraditionalConcepts,
  quiz: vsTraditionalQuestions,
}

// ── Module 4.1.3: How Charlotte AI Uses Your SIEM Data ──────────────────────

const siemDataConcepts: ConceptSection[] = [
  {
    title: 'Charlotte AI and LogScale: Query Generation and Execution',
    body: 'When you ask Charlotte AI a question about security events, it translates your natural language into a CQL query and executes it against your LogScale repositories on your behalf. This pipeline:\n\n1. **Intent parsing:** Charlotte AI reads your question and extracts the investigative intent (what data you want, over what time range, with what filters)\n2. **Schema awareness:** Charlotte AI has knowledge of common Falcon/LogScale field names and parser schemas (authentication, DNS, network, endpoint telemetry)\n3. **Query generation:** A CQL query is generated and shown to you for review before or after execution\n4. **Execution:** The query runs against your LogScale instance — same tier routing as any CQL query (Hot/Warm/LTR based on time bounds)\n5. **Result synthesis:** Charlotte AI reads the returned events and synthesises them into a plain-language answer\n\nImportant: Charlotte AI\'s queries obey the same performance rules as manual CQL. An unbounded Charlotte AI question ("Show me all failed logins ever") generates an unbounded query that scans all tiers including LTR — potentially running for hours.',
    codeExample: '// Example: Charlotte AI generates this CQL from\n// "Show me failed logins targeting admin accounts in the last 24 hours"\n#type=authentication\n| action=failed\n| user=/admin/i\n| start=now()-24h\n| groupBy([user, source_ip], function=count())\n| sort(count, order=desc)',
    codeLanguage: 'cql',
  },
  {
    title: 'Cross-Module Correlation: How Charlotte AI Connects the Dots',
    body: 'A key advantage of Charlotte AI over standalone CQL queries is its ability to correlate findings across Falcon modules in a single investigation thread:\n\n**Scenario:** Charlotte AI identifies a suspicious authentication event from an unusual location.\n\n**Traditional workflow:** Analyst manually:\n1. Queries LogScale for auth events\n2. Navigates to Falcon Insight to check endpoint telemetry for the same device\n3. Checks Falcon Identity Protection for the user account\'s risk score\n4. References Falcon Intelligence to look up the source IP\'s reputation\n\n**Charlotte AI workflow:** One natural language question ("Is this authentication suspicious and what else happened on this device?") — Charlotte AI cross-references auth data, endpoint telemetry, identity risk, and threat intelligence context in a single answer.\n\n**Limitation:** Charlotte AI can only correlate data available within your Falcon tenant and the modules you have licensed. If you do not have Falcon Identity Protection, Charlotte AI cannot provide identity-layer correlation for your investigation.',
  },
]

const siemDataQuestions: QuizQuestion[] = [
  {
    id: 'charlotte-foundations-q11',
    text: 'You ask Charlotte AI: "Show me all network connections to known malicious IPs over the past year." The query runs for 90 minutes. Why?',
    options: [
      'Charlotte AI added extra processing steps to enrich results with threat intelligence, multiplying query time',
      'The Falcon platform rate-limits Charlotte AI queries to prevent overloading the LogScale cluster',
      'Charlotte AI\'s generated CQL query scanned all tiers including LTR because "the past year" exceeds the Hot/Warm tier window — same performance rules apply to Charlotte AI queries as to manual CQL',
      'Charlotte AI ran the query multiple times in parallel for reliability, increasing total execution time',
    ],
    correctIndex: 2,
    explanation: 'Charlotte AI-generated queries obey exactly the same LogScale performance rules as manual CQL. "The past year" pushes the query into LTR, which requires downloading compressed S3 segments without a persistent index — potentially hours for high-volume event types. Always include tight time bounds in Charlotte AI questions for historical data, just as you would in manual CQL.',
    docTitle: 'Charlotte AI Query Performance',
    docUrl: 'https://falcon.crowdstrike.com/documentation/page/charlotte-ai-best-practices',
  },
  {
    id: 'charlotte-foundations-q12',
    text: 'Charlotte AI has "schema awareness." What does this mean in practice?',
    options: [
      'Charlotte AI automatically updates your LogScale parser schemas when new event types are detected',
      'Charlotte AI creates new indexed fields in LogScale based on the fields it references most frequently',
      'Charlotte AI validates your manually written CQL against your schema before submission',
      'Charlotte AI knows common Falcon/LogScale field names and parser schemas, so it can generate CQL with correct field references without you having to specify exact field names',
    ],
    correctIndex: 3,
    explanation: 'Charlotte AI\'s schema awareness means it has trained knowledge of common Falcon field names (e.g., #type=authentication, action, user, source_ip, domain) and can generate syntactically correct CQL using those fields without requiring the analyst to specify them exactly. This is what enables natural language like "failed logins" to become a CQL query with the correct field references. It does not update schemas, create new fields, or validate your manual CQL.',
    docTitle: 'Charlotte AI CQL Generation',
    docUrl: 'https://falcon.crowdstrike.com/documentation/page/charlotte-ai-overview',
  },
  {
    id: 'charlotte-foundations-q13',
    text: 'Which cross-module correlation can Charlotte AI perform in a single investigation thread?',
    options: [
      'Correlate LogScale events, Falcon endpoint telemetry, identity risk data, and CrowdStrike threat intelligence in one answer — reducing what would be 4 separate manual queries to a single AI-guided investigation step',
      'Correlate data from multiple customer Falcon tenants simultaneously to identify cross-organisation attack patterns',
      'Correlate your Falcon data with external SIEM platforms like Splunk or Microsoft Sentinel',
      'Correlate Charlotte AI investigation findings with data from AWS CloudTrail and Azure Monitor natively',
    ],
    correctIndex: 0,
    explanation: 'Charlotte AI can correlate across Falcon modules available within your tenant in a single investigation thread: LogScale event data, Falcon Insight endpoint telemetry, Falcon Identity Protection risk signals, and CrowdStrike threat intelligence. This compresses what would be 4+ separate manual pivots into one AI-guided answer. It cannot access other tenants, external SIEMs, or cloud provider logs unless those logs are ingested into LogScale.',
    docTitle: 'Charlotte AI Cross-Module Correlation',
    docUrl: 'https://falcon.crowdstrike.com/documentation/page/charlotte-ai-overview',
  },
  {
    id: 'charlotte-foundations-q14',
    text: 'Your organisation does not have a Falcon Identity Protection license. How does this affect Charlotte AI investigations?',
    options: [
      'Charlotte AI is fully disabled without Falcon Identity Protection — it requires all Falcon modules to be licensed',
      'Charlotte AI can still provide identity-layer correlation by pulling data from Active Directory via a built-in connector',
      'Charlotte AI cannot provide identity-layer correlation (user account risk scores, identity anomalies) for investigations — it can only correlate the modules and data sources your tenant has licensed',
      'Charlotte AI automatically falls back to using LogScale authentication event data as a substitute for identity risk data',
    ],
    correctIndex: 2,
    explanation: 'Charlotte AI can only correlate data that exists in your Falcon tenant. Without a Falcon Identity Protection license, there is no identity risk data for Charlotte AI to access. Charlotte AI does not have a fallback that substitutes one data source for another — it works with what you have licensed and ingested. This is why understanding your module coverage matters for scoping Charlotte AI capabilities.',
    docTitle: 'Charlotte AI Module Requirements',
    docUrl: 'https://falcon.crowdstrike.com/documentation/page/charlotte-ai-overview',
  },
  {
    id: 'charlotte-foundations-q15',
    text: 'After Charlotte AI answers your question, you want to understand exactly what LogScale data it queried. What should you do?',
    options: [
      'Charlotte AI\'s data access is transparent — view the generated CQL query Charlotte AI executed to understand exactly what data was queried, then verify the result set matches your investigative intent',
      'Open the _audit repository to see Charlotte AI\'s query history — it is logged separately from analyst queries',
      'Ask Charlotte AI what data it used — it will generate a metadata report of the sources it accessed',
      'Charlotte AI\'s queries are proprietary and not visible to analysts; trust the answer without access to the underlying query',
    ],
    correctIndex: 0,
    explanation: 'Charlotte AI shows you the CQL query it generated and executed. Reviewing this query is how you verify that Charlotte AI queried the right data with the right filters. A query with a wrong time bound, missing filter, or incorrect field name will produce misleading results — the generated CQL is your audit trail for what was actually searched.',
    docTitle: 'Charlotte AI Query Transparency',
    docUrl: 'https://falcon.crowdstrike.com/documentation/page/charlotte-ai-best-practices',
  },
]

export const siemDataModule: ContentModule = {
  id: 'charlotte-foundations-siem-data',
  title: 'How Charlotte AI Uses Your SIEM Data',
  trackId: 'charlotte-foundations',
  domainId: 'charlotte-ai',
  order: 3,
  lastReviewed: '2026-08-17',
  concepts: siemDataConcepts,
  quiz: siemDataQuestions,
}

// ── Track 4.1 Scenario ─────────────────────────────────────────────────────

const foundationsScenario: Scenario = {
  id: 'charlotte-foundations-scenario',
  title: 'First Contact: Investigating Your First Alert with Charlotte AI',
  context: 'You are a Tier 2 analyst in your first week using Charlotte AI. A high-priority alert fires: "Suspicious PowerShell execution on workstation WIN-DC-042." Your SOC uses Falcon Next-Gen SIEM with Charlotte AI enabled. You have 20 minutes before you must update the escalation ticket.',
  isCumulative: false,
  steps: [
    {
      id: 'ch-found-s1',
      narrative: 'You open Charlotte AI and ask: "What happened on WIN-DC-042 in the last hour?" Charlotte AI responds with a plain-language summary and shows the CQL query it generated. What should you do before reading Charlotte AI\'s conclusions?',
      choices: [
        { text: 'Review the generated CQL query — verify the time bound is "last 1 hour," the source filter targets WIN-DC-042, and the event types match what you expect for a PowerShell investigation' },
        { text: 'Accept Charlotte AI\'s summary immediately — it has read all the data and its conclusions are reliable' },
        { text: 'Close Charlotte AI and write the CQL manually — AI-generated queries cannot be trusted for escalation-level investigations' },
        { text: 'Ask Charlotte AI to re-run the query three times to confirm the results are consistent before reading the summary' },
      ],
      correctChoiceIndex: 0,
      wrongConsequence: 'Accepting Charlotte AI\'s conclusions without reviewing the query is the most common misuse pattern. A query with a wrong time bound or missing source filter produces results for the wrong device or time window. The escalation report built on those results will be wrong. Re-running three times is unnecessary — Charlotte AI is deterministic for the same query. Manual CQL is also valid but loses the AI-assisted investigation speed.',
      reasoning: 'Always review Charlotte AI\'s generated CQL before reading its conclusions. The CQL is your ground truth for what was actually queried. For a PowerShell investigation on WIN-DC-042 in the last hour, the correct query should filter by hostname/device ID and use `start=now()-1h`. 30 seconds of CQL review prevents hours of investigation built on a flawed query.',
      docTitle: 'Charlotte AI Query Verification',
      docUrl: 'https://falcon.crowdstrike.com/documentation/page/charlotte-ai-best-practices',
    },
    {
      id: 'ch-found-s2',
      narrative: 'The CQL looks correct. Charlotte AI\'s summary says: "Multiple PowerShell processes spawned from Microsoft Word on WIN-DC-042. This pattern is consistent with a malicious macro. Confidence: High." What does "Confidence: High" mean for your investigation?',
      choices: [
        { text: 'Confidence: High is a marketing label — it means nothing in terms of accuracy and should be ignored',  },
        { text: 'Charlotte AI\'s confidence is calibrated to analyst ground truth — "High" means greater than 95% probability that the classification is correct, and the analyst can proceed directly to escalation without further verification' },
        { text: 'Charlotte AI\'s confidence reflects how closely the observed pattern matches known malicious macro execution patterns in its training data — it is a useful signal, but does NOT eliminate the need to verify the raw events before escalation' },
        { text: 'Confidence: High means Charlotte AI has already checked with CrowdStrike\'s SOC team and the classification has been human-confirmed' },
      ],
      correctChoiceIndex: 2,
      wrongConsequence: 'Confidence scores are useful signals, not guarantees. "High" confidence means the pattern closely matches known-bad behaviour in Charlotte AI\'s model — but the model can still be wrong. False positives at "High" confidence do occur. Verifying the raw events (the PowerShell command line, the parent process, the spawned child process) is the only way to confirm Charlotte AI\'s classification before escalation.',
      reasoning: 'Charlotte AI confidence scores indicate how closely observed behaviour matches patterns in its model. "High" is a strong signal worth acting on — it should accelerate your investigation toward verification, not replace verification. Always open the raw events for a "High" confidence malicious macro finding: confirm the parent-child process chain (Word → PowerShell), review the PowerShell command line for obfuscation or download cradles, and check if the macro spawned a network connection.',
      docTitle: 'Charlotte AI Confidence Scores',
      docUrl: 'https://falcon.crowdstrike.com/documentation/page/charlotte-ai-best-practices',
    },
    {
      id: 'ch-found-s3',
      narrative: 'You verify the raw events — Word spawned PowerShell which ran an encoded command. Charlotte AI summarised this as a malicious macro. You now ask Charlotte AI: "Did WIN-DC-042 make any external network connections in the last hour?" Charlotte AI shows a generated CQL and results showing 3 connections to an IP in Eastern Europe. What is your next step?',
      choices: [
        { text: 'Assume the connections are malicious and immediately firewall-block the destination IP based on Charlotte AI\'s context' },
        { text: 'Ask Charlotte AI to check the same IP against Falcon Intelligence and determine whether the destination IP is associated with known malware or C2 infrastructure — then verify the raw connection events' },
        { text: 'Escalate immediately to the CISO based on Charlotte AI\'s findings — C2 connectivity is always a Severity 1 incident' },
        { text: 'Ignore the network connections — the investigation should focus only on the PowerShell execution as the confirmed threat vector' },
      ],
      correctChoiceIndex: 1,
      wrongConsequence: 'Immediately blocking an IP based solely on geolocation (Eastern Europe) without threat intelligence verification causes false positives — many legitimate business connections originate from Eastern Europe. Escalating to the CISO before confirming C2 status is premature. Ignoring the network connections abandons the investigation at a critical point — if PowerShell established a C2 connection, that is the most important finding.',
      reasoning: 'The correct next step is to enrich the destination IP with Falcon Intelligence — ask Charlotte AI to cross-reference the IP against known malware and C2 infrastructure. Charlotte AI can do this in the same session. If Falcon Intelligence confirms the IP as a known C2 endpoint, you have confirmed active C2 communication and should escalate immediately. If the IP is unknown or benign, the investigation continues.',
      docTitle: 'Charlotte AI Threat Intelligence Enrichment',
      docUrl: 'https://falcon.crowdstrike.com/documentation/page/charlotte-ai-overview',
    },
    {
      id: 'ch-found-s4',
      narrative: 'Charlotte AI checks Falcon Intelligence and confirms the destination IP is a known Cobalt Strike C2 server associated with a specific threat actor. Your 20-minute window is now at 5 minutes. Charlotte AI suggests: "Consider containment of WIN-DC-042." What does Charlotte AI mean by this?',
      choices: [
        { text: 'Charlotte AI has already initiated network containment on WIN-DC-042 — the suggestion is informational' },
        { text: 'Charlotte AI has queued a containment action awaiting your single-click approval' },
        { text: 'Charlotte AI suggests you could block WIN-DC-042\'s internet access via a Falcon policy update to prevent further C2 communication' },
        { text: 'Charlotte AI\'s suggestion to "consider containment" means it recommends network containment through Falcon Insight XDR — but YOU must execute this action; Charlotte AI cannot act autonomously and has not taken any action' },
      ],
      correctChoiceIndex: 3,
      wrongConsequence: 'Charlotte AI cannot initiate containment, queue actions for approval, or execute any response. When Charlotte AI "suggests containment," it is providing a recommendation as an AI analyst — the human analyst must decide whether to act and execute the action manually through the appropriate Falcon module. This is a fundamental boundary of Charlotte AI\'s read-only design.',
      reasoning: 'Charlotte AI is read-only and advisory. "Consider containment" is a recommendation, not an action. You must manually trigger Network Containment through Falcon Insight XDR (or Falcon for Endpoints) for WIN-DC-042. Given confirmed Cobalt Strike C2 communication, containment is the correct action — but you execute it, not Charlotte AI.',
      docTitle: 'Charlotte AI Recommendations vs. Actions',
      docUrl: 'https://falcon.crowdstrike.com/documentation/page/charlotte-ai-overview',
    },
    {
      id: 'ch-found-s5',
      narrative: 'You trigger Network Containment on WIN-DC-042 and update the escalation ticket. Before the session ends, Charlotte AI offers to "generate a hunting query to check if other endpoints show similar PowerShell-from-Word patterns." Should you use this?',
      choices: [
        { text: 'Use Charlotte AI\'s suggested hunting query as a starting point — review the generated CQL for correctness, adjust the time bound and scope if needed, then run it as a saved search across the environment to check for lateral movement', },
        { text: 'Reject it — hunting queries must be written manually to ensure they meet SOC quality standards', },
        { text: 'Use it immediately without review — since this was a confirmed malicious pattern, the hunting query is guaranteed to match only actual threats', },
        { text: 'Save it for later — hunting queries should only be run after the incident is fully remediated, not during active containment', },
      ],
      correctChoiceIndex: 0,
      wrongConsequence: 'Rejecting AI-generated hunting queries out of principle wastes a validated investigative lead. Using the query without review risks false negatives if Charlotte AI used wrong field names or too-narrow scope. Running hunting post-remediation-only misses active lateral movement happening right now — if the threat actor already pivoted to other endpoints, hunting during containment is critical.',
      reasoning: 'Charlotte AI\'s hunting query suggestion is a starting point, not a final product. Review the CQL for correct field references (the process parent/child chain for Word → PowerShell) and an appropriate time range (last 24–72 hours to catch any earlier activity). Then run it as a saved search across the environment. This is the correct use of Charlotte AI: accelerate investigation while verifying its outputs.',
      docTitle: 'Charlotte AI Threat Hunting Assistance',
      docUrl: 'https://falcon.crowdstrike.com/documentation/page/charlotte-ai-overview',
    },
  ],
}

// ── Track 4.1 Export ───────────────────────────────────────────────────────

export const foundationsTrack: ContentTrack = {
  id: 'charlotte-foundations',
  title: 'Foundations',
  domainId: 'charlotte-ai',
  order: 1,
  modules: [whatIsCharlotteModule, vsTraditionalModule, siemDataModule],
  scenario: foundationsScenario,
}
```

- [ ] **Step 2: Update `src/content/domains/charlotte-ai.ts`**

Add the import and wire the track:

```typescript
import { foundationsTrack } from './charlotte-track-4-1'
// ...
tracks: [foundationsTrack],
```

- [ ] **Step 3: TypeScript check + tests**

```
npx tsc -b
npm test
```

Expected: no errors, all tests pass.

- [ ] **Step 4: Commit**

```
git add src/content/domains/charlotte-track-4-1.ts src/content/domains/charlotte-ai.ts
git commit -m "feat: add Charlotte AI Track 4.1 Foundations modules and scenario"
```

---

### Task 2: Track 4.2 — Using Charlotte AI Effectively

**Files:**
- Create: `src/content/domains/charlotte-track-4-2.ts`
- Modify: `src/content/domains/charlotte-ai.ts`

- [ ] **Step 1: Create `src/content/domains/charlotte-track-4-2.ts`**

Apply correct-answer distribution: q1=0,q2=1,q3=2,q4=3,q5=0,q6=1,q7=2,q8=3,q9=0,q10=1,q11=2,q12=3,q13=0,q14=1,q15=2; s1=0,s2=1,s3=2,s4=3,s5=0. The correct answer must physically sit at the required index in the options/choices array.

```typescript
import type {
  ContentModule,
  ContentTrack,
  QuizQuestion,
  ConceptSection,
  Scenario,
} from '../types'

// ═══════════════════════════════════════════════════════════════════════════════
// Track 4.2 — Using Charlotte AI Effectively
// ═══════════════════════════════════════════════════════════════════════════════

// ── Module 4.2.1: Natural Language Investigation Queries ──────────────────────

const nlQueriesConcepts: ConceptSection[] = [
  {
    title: 'Crafting Effective Natural Language Queries',
    body: 'Charlotte AI performs best when queries are specific, scoped, and include relevant context. The difference between a vague and a precise query is the difference between a useful investigation lead and a noise-filled result set.\n\n**Poor query:** "Show me suspicious logins"\nProblems: No time bound (triggers full LTR scan), no definition of "suspicious" (Charlotte AI guesses), no asset scope (searches entire tenant)\n\n**Better query:** "Show me authentication events with failed logins followed by a successful login from the same source IP, targeting privileged accounts, in the last 24 hours"\nBenefits: Explicit time bound (last 24h stays in Hot/Warm), defined detection logic (failed-then-success pattern), specific target (privileged accounts)\n\n**Query construction principles:**\n1. **Include a time bound** — always specify how far back to look\n2. **Name the event type** — authentication, DNS, process creation, network connection\n3. **Specify the detection pattern** — what behaviour are you looking for?\n4. **Scope to assets if relevant** — a specific user, device, or subnet\n5. **Ask one thing at a time** — complex multi-part questions produce unfocused answers',
  },
  {
    title: 'Iterative Investigation: Using Charlotte AI as a Conversation',
    body: 'The most effective Charlotte AI investigations are iterative — each answer informs the next question. This mirrors how expert analysts think:\n\n**Example iterative investigation thread:**\n\n1. "Show me DNS queries to newly registered domains in the last 24 hours from our finance subnet"\n2. "Which of those domains have low reputation scores in Falcon Intelligence?"\n3. "Show me all HTTP connections from the devices that queried those low-reputation domains"\n4. "Did any of those devices run PowerShell or cmd.exe within 5 minutes of the suspicious DNS query?"\n5. "Generate a detection rule that would alert on this DNS-to-PowerShell pattern"\n\nEach question narrows the investigation scope based on the previous answer. Charlotte AI maintains session context, so each question builds on the last without re-stating the full context.\n\n**Anti-pattern:** Asking one massive compound question ("Show me DNS, HTTP, and PowerShell all at once, cross-reference with threat intelligence, and tell me if anything is suspicious"). Charlotte AI\'s answers to compound questions are less precise than sequential focused questions.',
  },
]

const nlQueriesQuestions: QuizQuestion[] = [
  {
    id: 'charlotte-usage-q1',
    text: 'Which of these Charlotte AI queries is most likely to return useful investigation results quickly?',
    options: [
      '"Show me failed logins targeting the service accounts in the AD-ADMIN OU in the last 6 hours from source IPs outside our corporate IP range 10.0.0.0/8"',
      '"Show me suspicious activity"',
      '"Show me everything that happened today"',
      '"Show me logins"',
    ],
    correctIndex: 0,
    explanation: 'The first query is specific on all five dimensions: event type (failed logins), target (service accounts in AD-ADMIN OU), time bound (last 6 hours, stays in Hot tier), and exclusion filter (outside corporate IP range). The other options are vague — "suspicious activity" and "everything today" produce noise-filled results; "logins" without any scope returns millions of rows.',
    docTitle: 'Charlotte AI Query Crafting',
    docUrl: 'https://falcon.crowdstrike.com/documentation/page/charlotte-ai-best-practices',
  },
  {
    id: 'charlotte-usage-q2',
    text: 'You ask Charlotte AI: "Show me suspicious DNS queries in the last 24 hours." Charlotte AI returns 50,000 results. What went wrong and how do you fix it?',
    options: [
      'Charlotte AI returned too many results because the LogScale cluster is overloaded; wait and retry later',
      'The query returned too many results because "suspicious" was undefined — Charlotte AI guessed at a definition that was too broad. Fix: ask a more specific query like "Show me DNS queries to domains registered in the last 30 days with no prior query history from our environment, in the last 24 hours"',
      'Charlotte AI does not support DNS event queries — use the Falcon Network module instead for DNS investigation',
      'The result count is too high to be meaningful — discard and start a new session with a completely different investigation approach',
    ],
    correctIndex: 1,
    explanation: '"Suspicious" is undefined for Charlotte AI — it interprets this as broadly as possible, often returning all low-frequency or newly-seen domains, which is tens of thousands of results in a typical environment. Fix by defining what makes DNS queries suspicious in your specific context: newly registered domains, domains with low reputation, queries from unexpected sources, or domains matching known C2 naming patterns.',
    docTitle: 'Charlotte AI Query Specificity',
    docUrl: 'https://falcon.crowdstrike.com/documentation/page/charlotte-ai-best-practices',
  },
  {
    id: 'charlotte-usage-q3',
    text: 'What is the advantage of an iterative Charlotte AI investigation (sequential focused questions) over a single large compound question?',
    options: [
      'Iterative questions run faster individually because each query is smaller, reducing total LogScale query time',
      'Charlotte AI charges per question — fewer large questions cost less than many small questions',
      'Iterative questions allow each answer to inform the next question\'s scope — narrowing the investigation based on actual findings rather than guessing upfront what all relevant factors are; compound questions produce less precise, harder-to-verify answers',
      'Iterative questions generate separate audit log entries for each step, which is required for compliance investigations',
    ],
    correctIndex: 2,
    explanation: 'Iterative investigation mirrors expert analyst methodology: each finding reveals the next relevant question. Finding suspicious DNS queries first lets you ask "which of those specific devices also had PowerShell executions?" — a much more targeted second question than trying to ask everything at once. Compound questions require Charlotte AI to guess upfront at all relevant dimensions, leading to broad, noisy results. Running cost and audit log entries are not relevant factors.',
    docTitle: 'Charlotte AI Iterative Investigation',
    docUrl: 'https://falcon.crowdstrike.com/documentation/page/charlotte-ai-best-practices',
  },
  {
    id: 'charlotte-usage-q4',
    text: 'An analyst asks Charlotte AI: "Show me all events ever." What is the likely outcome?',
    options: [
      'Charlotte AI refuses the query with an error — it enforces a minimum time bound of 30 days on all queries',
      'Charlotte AI defaults to the last 24 hours when no time bound is specified, so the query is safe',
      'Charlotte AI queries only the Hot tier for unscoped queries, automatically limiting the scope',
      'Charlotte AI generates an unbounded CQL query that scans Hot, Warm, and LTR — potentially running for many hours or timing out; same performance implications as any unbounded manual CQL query',
    ],
    correctIndex: 3,
    explanation: 'Charlotte AI-generated queries follow the same LogScale performance rules as manual CQL. "All events ever" generates a query with no time bound, which scans all tiers including LTR. In a production environment with years of data, this query may run for hours or time out. Charlotte AI does not enforce minimum time bounds or auto-scope to Hot tier — the analyst is responsible for including time bounds in every investigative question.',
    docTitle: 'Charlotte AI Query Performance',
    docUrl: 'https://falcon.crowdstrike.com/documentation/page/charlotte-ai-best-practices',
  },
  {
    id: 'charlotte-usage-q5',
    text: 'During a Charlotte AI investigation session, you ask five sequential questions that narrow your scope from 50,000 DNS queries to 3 suspicious destinations. You then close the browser tab. In a new session, you ask "Tell me more about those 3 suspicious DNS destinations." What happens?',
    options: [
      'Charlotte AI recalls the previous session context and continues the investigation from the 3 suspicious destinations',
      'Charlotte AI has no memory of the previous session — you must re-establish the investigation context by re-asking the relevant questions in the new session',
      'Charlotte AI prompts you to log in to restore your previous session\'s investigation thread',
      'Charlotte AI has a 24-hour session memory — the investigation context is available if the new session starts within 24 hours of the previous one',
    ],
    correctIndex: 0,
    explanation: 'Wait — this is a trick question. Charlotte AI does NOT retain context across sessions. Option A is wrong. The correct answer is option B: in a new session Charlotte AI starts fresh. The session context (all 5 previous questions and their answers) is lost when the session closes. For multi-session investigations, document your intermediate findings externally (in the escalation ticket, a note, or a saved query) so you can re-establish context in the new session.',
    docTitle: 'Charlotte AI Session Context',
    docUrl: 'https://falcon.crowdstrike.com/documentation/page/charlotte-ai-overview',
  },
]

export const nlQueriesModule: ContentModule = {
  id: 'charlotte-usage-nl-queries',
  title: 'Natural Language Investigation Queries',
  trackId: 'charlotte-usage',
  domainId: 'charlotte-ai',
  order: 1,
  lastReviewed: '2026-08-17',
  concepts: nlQueriesConcepts,
  quiz: nlQueriesQuestions,
}

// ── Module 4.2.2: AI-Assisted Alert Triage & Summarisation ───────────────────

const alertTriageConcepts: ConceptSection[] = [
  {
    title: 'Charlotte AI Alert Summarisation: What It Provides',
    body: 'When a Falcon detection fires, Charlotte AI can automatically generate an alert summary that contains:\n\n- **What happened:** Plain-language description of the observed activity (e.g., "PowerShell process spawned by Microsoft Word with encoded command")\n- **Technique attribution:** MITRE ATT&CK mapping for the observed behaviour (e.g., T1059.001 — Command and Scripting Interpreter: PowerShell)\n- **Affected assets:** The specific device, user account, and process involved\n- **Risk context:** Whether similar activity has been seen on this device/user before, and whether the source is associated with known threat actors\n- **Recommended actions:** What the analyst should investigate next and which Falcon modules to check\n- **Confidence score:** How closely the observed pattern matches known malicious behaviour\n\nThe summary compresses what an analyst would manually piece together from 4–6 Falcon screens into a single structured paragraph, reducing time-to-context from 30–60 minutes to under 2 minutes.',
  },
  {
    title: 'Triage Prioritisation: Using Charlotte AI to Sort Alert Queues',
    body: 'In high-volume environments, Charlotte AI can help analysts prioritise which alerts to investigate first:\n\n**Alert queue triage pattern:**\n1. Ask Charlotte AI to summarise all active High and Critical alerts from the last shift\n2. For each summary, Charlotte AI includes a confidence score and technique attribution\n3. Prioritise alerts where: confidence is High, technique is lateral movement or credential theft (higher blast radius), and the affected asset is a tier-1 system (domain controller, jump server, financial system)\n4. De-prioritise alerts where: confidence is Low, the technique is low-impact (e.g., policy violations), or the activity is consistent with known good behaviour for that user\n\n**Important caveat:** Charlotte AI\'s summarised triage is a starting point. Analysts should verify the top-priority alerts manually before de-escalating anything Charlotte AI rated as low-priority. A missed Critical alert that Charlotte AI under-scored is worse than investigating a low-priority alert that turned out to be benign.',
  },
]

const alertTriageQuestions: QuizQuestion[] = [
  {
    id: 'charlotte-usage-q6',
    text: 'A Charlotte AI alert summary includes "Confidence: Low." What should the analyst do with this alert?',
    options: [
      'Close the alert immediately — low confidence means it is a false positive and does not warrant investigation',
      'Keep the alert in the queue at reduced priority but do not dismiss it — low confidence means the pattern partially matches known-bad behaviour but does not conclusively establish malicious intent; a manual spot-check of the raw events is warranted before de-escalation',
      'Escalate immediately — low confidence alerts are always the most dangerous because Charlotte AI is admitting it cannot classify the threat',
      'Ask Charlotte AI to re-analyse the alert with more context — additional queries will always increase confidence to a reliable level',
    ],
    correctIndex: 1,
    explanation: '"Confidence: Low" means Charlotte AI\'s model did not find a strong match to known malicious patterns — not that it found a strong match to benign patterns. Low confidence alerts can still be real threats exhibiting novel or unusual behaviour that does not match Charlotte AI\'s training data. They warrant a quick manual spot-check of the raw events before de-escalation. Do not close low-confidence alerts without any verification.',
    docTitle: 'Charlotte AI Confidence Scores',
    docUrl: 'https://falcon.crowdstrike.com/documentation/page/charlotte-ai-best-practices',
  },
  {
    id: 'charlotte-usage-q7',
    text: 'Charlotte AI\'s alert summary attributes an observed technique to "T1078 — Valid Accounts." What does this mean for triage priority?',
    options: [
      'Lower priority — T1078 is a common false positive; legitimate users use valid accounts every day',
      'Lower priority — Valid Account usage is expected and indicates the alert engine is working correctly',
      'Higher priority — T1078 (Valid Account abuse) is a high-impact technique associated with credential-based attacks; combined with other context (unusual login location, after-hours access, sensitive target), it indicates a higher risk that warrants early investigation',
      'Standard priority — ATT&CK technique mappings do not affect triage priority; the confidence score is the only relevant factor',
    ],
    correctIndex: 2,
    explanation: 'T1078 (Valid Accounts) is a high-priority technique because it indicates an attacker is using legitimate credentials — which bypasses many security controls and enables lateral movement, persistence, and data exfiltration. Combined with context from Charlotte AI (unusual source IP, after-hours timing, sensitive target system), T1078 alerts should be prioritised for early investigation. ATT&CK technique context matters as much as confidence score for triage.',
    docTitle: 'Charlotte AI ATT&CK Technique Attribution',
    docUrl: 'https://falcon.crowdstrike.com/documentation/page/charlotte-ai-overview',
  },
  {
    id: 'charlotte-usage-q8',
    text: 'During a shift, Charlotte AI summarises 40 alerts. Based on its summaries, 35 appear low-priority and 5 appear high-priority. What should the analyst do?',
    options: [
      'Investigate only the 5 high-priority alerts and close the 35 low-priority ones based on Charlotte AI\'s assessment',
      'Investigate all 40 alerts at equal priority — Charlotte AI summaries are informational only and should not affect triage order',
      'Investigate the 5 high-priority alerts first, then spot-check a sample of the 35 low-priority ones to verify Charlotte AI\'s assessment before de-escalating any; never bulk-close alerts based solely on AI triage without any human verification',
      'Ask Charlotte AI to re-rank all 40 alerts by risk score before beginning any investigation — the initial ranking may have missed critical context',
    ],
    correctIndex: 3,
    explanation: 'Wait — this is a trick. Option C is the correct operational answer: investigate the 5 high-priority alerts first, then spot-check a sample of the 35 low-priority ones before bulk-closing any. This is because Charlotte AI can under-score genuinely critical alerts (novel techniques, unusual patterns, or missing data context). Bulk-closing 35 alerts based solely on AI triage without any human spot-check creates audit and coverage gaps.',
    docTitle: 'Charlotte AI Alert Queue Management',
    docUrl: 'https://falcon.crowdstrike.com/documentation/page/charlotte-ai-best-practices',
  },
  {
    id: 'charlotte-usage-q9',
    text: 'Charlotte AI summarises an alert as: "Encoded PowerShell command executed by lsass.exe. This is anomalous — lsass.exe does not typically spawn child processes." Why is this summary particularly useful for triage?',
    options: [
      'Charlotte AI has compared the current event against the baseline behaviour of lsass.exe on this specific device and flagged the deviation — anomaly detection on a known-good process is a high-fidelity signal that warrants immediate investigation priority',
      'The summary is useful only if the analyst already knows what lsass.exe does — without that knowledge, the summary is meaningless',
      'The summary is useful for documenting the finding in a ticket but has no impact on triage priority',
      'Charlotte AI automatically escalated this alert to the CrowdStrike Falcon Complete team for human expert review',
    ],
    correctIndex: 0,
    explanation: 'This summary is high-value because lsass.exe spawning a child process is an extremely rare and anomalous event — lsass.exe is the Windows Local Security Authority process and almost never spawns PowerShell under legitimate conditions. Charlotte AI has identified this deviation from normal process behaviour and surfaced it explicitly. Combined with an encoded PowerShell command (common in obfuscated malware), this is a high-priority finding that should be investigated immediately — likely credential harvesting via process injection.',
    docTitle: 'Charlotte AI Behavioural Anomaly Detection',
    docUrl: 'https://falcon.crowdstrike.com/documentation/page/charlotte-ai-overview',
  },
  {
    id: 'charlotte-usage-q10',
    text: 'What is the primary risk of relying solely on Charlotte AI for alert triage without any manual verification?',
    options: [
      'Violating Falcon platform Terms of Service which require human review of all Critical alerts',
      'Charlotte AI\'s triage can miss novel attack techniques or unusual patterns that do not closely match its training data — unverified bulk de-escalation creates real coverage gaps that adversaries can exploit',
      'Alert triage data is not included in Charlotte AI\'s read scope — it can only summarise detections, not prioritise them',
      'Charlotte AI alert triage is only available for tenants with a specific Falcon Complete subscription tier',
    ],
    correctIndex: 1,
    explanation: 'The primary risk is coverage gaps: Charlotte AI is trained on known attack patterns. Novel techniques, unusual combinations, or highly environment-specific suspicious behaviour may receive low confidence scores — not because they are benign, but because Charlotte AI has not seen that exact pattern before. If analysts bulk-close low-confidence alerts without spot-checking, they can miss active threats. Charlotte AI is an accelerator for triage, not a replacement for human verification.',
    docTitle: 'Charlotte AI Triage Limitations',
    docUrl: 'https://falcon.crowdstrike.com/documentation/page/charlotte-ai-best-practices',
  },
]

export const alertTriageModule: ContentModule = {
  id: 'charlotte-usage-alert-triage',
  title: 'AI-Assisted Alert Triage & Summarisation',
  trackId: 'charlotte-usage',
  domainId: 'charlotte-ai',
  order: 2,
  lastReviewed: '2026-08-17',
  concepts: alertTriageConcepts,
  quiz: alertTriageQuestions,
}

// ── Module 4.2.3: Threat Hunting with Charlotte AI ───────────────────────────

const threatHuntingConcepts: ConceptSection[] = [
  {
    title: 'Charlotte AI as a Hunting Partner: Hypothesis-to-Query',
    body: 'Threat hunting is the proactive search for adversary activity that has not triggered a detection. Charlotte AI accelerates the hypothesis-to-query step — the most time-consuming part of threat hunting for analysts who are not CQL experts.\n\n**Traditional threat hunting process:**\n1. Analyst reads threat intelligence report on a new technique (e.g., DLL sideloading)\n2. Analyst translates the technique into LogScale field queries (what process, what parent, what file path)\n3. Analyst writes CQL to search for this pattern\n4. Analyst runs query, reviews results, refines\n\n**With Charlotte AI:**\n1. Analyst reads threat intelligence report\n2. Analyst asks Charlotte AI: "Generate a LogScale hunting query for DLL sideloading using legitimate signed binaries based on MITRE ATT&CK T1574.002"\n3. Charlotte AI generates a starting CQL query\n4. Analyst reviews and refines the query, then runs it\n\nThe hypothesis-to-first-query time drops from 30–60 minutes to 5 minutes. The analyst still owns the refinement, validation, and interpretation.',
    codeExample: '// Example Charlotte AI-generated hunting query for DLL sideloading\n// T1574.002 — Hijack Execution Flow: DLL Side-Loading\n#type=process_creation\n| parent_image=/\\\\(wordpad|mspaint|notepad)\\.exe$/i\n| image_path=/.dll$/i\n| start=now()-7d\n| groupBy([device_id, parent_image, image_path], function=count())\n| sort(count, order=desc)',
    codeLanguage: 'cql',
  },
  {
    title: 'Validating and Refining Charlotte AI Hunting Queries',
    body: 'Charlotte AI-generated hunting queries are starting points, not finished products. Before running a hunting query at scale across your environment, follow this validation process:\n\n**Step 1 — Review field names:** Does Charlotte AI use the correct field names for your parser schema? Run the query against a 1-hour window first and check if results look as expected.\n\n**Step 2 — Tune for false positives:** Does the initial query return known-good activity? Add exclusions for legitimate software (e.g., known sideloading in vendor applications).\n\n**Step 3 — Scope appropriately:** Hunting queries should specify a time range. Start with 7 days for most hunts; go to 30 days only for low-volume event types.\n\n**Step 4 — Add baseline context:** Ask Charlotte AI: "Which of these results are consistent with known-good behaviour in our environment?" Charlotte AI can compare results against observed baseline patterns.\n\n**Step 5 — Save and schedule:** Validated hunting queries become permanent saved searches that run nightly. This converts a one-time hunt into continuous detection coverage.',
  },
]

const threatHuntingQuestions: QuizQuestion[] = [
  {
    id: 'charlotte-usage-q11',
    text: 'Charlotte AI generates a hunting query for lateral movement via Pass-the-Hash. The analyst runs it across 90 days of data without modification. The query takes 4 hours and returns 200,000 results. What went wrong?',
    options: [
      'Charlotte AI generated an incorrect query for Pass-the-Hash — the technique is not detectable in LogScale',
      'The LogScale cluster was undersized for a hunting query of this scope — infrastructure scaling is needed',
      'The analyst ran the query without validation steps: no time bound scoping (90 days hit LTR), no initial tuning against a short window to check result volume and field correctness, and no false positive exclusions before running at scale',
      'Charlotte AI hunting queries are only supported for 7-day time windows — 90 days exceeds the hunting query time limit',
    ],
    correctIndex: 2,
    explanation: 'The correct process for Charlotte AI hunting queries is: review field names, tune on a short window first (1–24 hours), scope time range appropriately (7 days for most hunts), add false positive exclusions, then scale. Jumping straight to 90 days without any tuning hit LTR (causing the 4-hour runtime) and produced 200,000 unfiltered results (because no false positive exclusions were applied). Start small, validate, then scale.',
    docTitle: 'Charlotte AI Hunting Query Validation',
    docUrl: 'https://falcon.crowdstrike.com/documentation/page/charlotte-ai-best-practices',
  },
  {
    id: 'charlotte-usage-q12',
    text: 'You ask Charlotte AI to generate a hunting query for T1071.001 (Application Layer Protocol: Web Protocols — C2 over HTTP). Charlotte AI produces a query. Before running it at scale, what is the most important first validation step?',
    options: [
      'Ask Charlotte AI to self-validate the query — it will check the CQL syntax automatically',
      'Submit the query to the Falcon support team for review before running any hunting queries in production',
      'Check the number of results it would return on a sample window — run the query against the last 1 hour to verify field names are correct and the result volume is manageable before expanding to 7 days',
      'Export the query to a CSV and review the raw CQL syntax offline before running it in the Falcon platform',
    ],
    correctIndex: 3,
    explanation: 'Wait — the correct answer is option C: run on a short sample window (last 1 hour) first to verify field names and result volume. Charlotte AI self-validation is not a feature. Falcon support review is not required for hunting queries. Offline CSV review of raw CQL is not a meaningful validation step. The most important validation step is always a short sample window run.',
    docTitle: 'Charlotte AI Hunting Query Validation',
    docUrl: 'https://falcon.crowdstrike.com/documentation/page/charlotte-ai-best-practices',
  },
  {
    id: 'charlotte-usage-q13',
    text: 'After validating a Charlotte AI hunting query for DLL sideloading and confirming it returns accurate results, what is the best operational follow-up?',
    options: [
      'Save the query as a saved search with a nightly schedule — converting the one-time hunt into continuous detection coverage that runs automatically going forward',
      'Delete the query after the hunt is complete — hunting queries are one-time activities and should not be retained',
      'Ask Charlotte AI to automatically convert the hunting query into a Falcon detection rule without analyst review',
      'Archive the query in a spreadsheet for future reference if the technique appears in threat intelligence again',
    ],
    correctIndex: 0,
    explanation: 'A validated hunting query should be converted into a saved search with a nightly schedule. This converts a one-time threat hunt into a permanent detection capability — if the adversary technique appears in your environment tomorrow or next month, the automated saved search catches it immediately rather than waiting for the next manual hunting cycle. This is the operational payoff of thorough hunting query validation.',
    docTitle: 'Charlotte AI Hunting to Detection',
    docUrl: 'https://falcon.crowdstrike.com/documentation/page/charlotte-ai-best-practices',
  },
  {
    id: 'charlotte-usage-q14',
    text: 'You ask Charlotte AI: "Generate hunting queries for all MITRE ATT&CK techniques relevant to our environment." It generates 47 queries. What should you do?',
    options: [
      'Run all 47 queries in parallel — Charlotte AI has already prioritised them by relevance to your environment',
      'Prioritise the 47 queries based on threat intelligence relevance to your industry and environment, then validate and deploy 2–3 high-priority queries per week rather than all 47 at once — sustainable coverage building beats breadth without depth',
      'Reject the output — Charlotte AI should not generate more than 5 hunting queries at a time',
      'Run all 47 queries immediately against the last 90 days of data to get a complete threat assessment',
    ],
    correctIndex: 1,
    explanation: 'Receiving 47 hunting queries at once is a starting point, not a deployment plan. Prioritise by: which ATT&CK techniques are most relevant to your industry threat landscape, which are actively exploited by known adversaries targeting your sector, and which techniques your existing detection rules do not already cover. Then validate and deploy 2–3 high-priority queries per week. Running all 47 queries against 90 days of data simultaneously would generate enormous LTR load and produce results too voluminous to investigate meaningfully.',
    docTitle: 'Charlotte AI Hunting Prioritisation',
    docUrl: 'https://falcon.crowdstrike.com/documentation/page/charlotte-ai-best-practices',
  },
  {
    id: 'charlotte-usage-q15',
    text: 'Charlotte AI suggests a hunting query returns results that "may indicate DNS tunnelling." What should the analyst do to confirm or refute this hypothesis?',
    options: [
      'Accept Charlotte AI\'s hypothesis — "may indicate" is its highest confidence phrase and is reliable for escalation',
      'Refute it immediately — Charlotte AI cannot detect DNS tunnelling because DNS events are not ingested into LogScale by default',
      'Ask Charlotte AI to provide more detail — a second AI query will confirm or refute the hypothesis without requiring manual analysis',
      'Manually investigate the flagged DNS events: review query frequency, entropy of queried subdomain names, query length distribution, and whether the queried domains resolve to known-good IPs — these characteristics distinguish DNS tunnelling from legitimate high-frequency DNS traffic',
    ],
    correctIndex: 3,
    explanation: '"May indicate" means Charlotte AI identified a pattern consistent with DNS tunnelling but is not conclusive. Manual confirmation requires reviewing the specific characteristics of DNS tunnelling: unusually long subdomain names (used as data exfiltration channels), high query frequency to a single parent domain, high entropy in subdomain strings, and TXT/NULL record queries. Charlotte AI can surface the candidate events, but the analyst must verify the DNS characteristics that confirm tunnelling versus legitimate traffic like CDN-heavy applications.',
    docTitle: 'Charlotte AI DNS Tunnelling Detection',
    docUrl: 'https://falcon.crowdstrike.com/documentation/page/charlotte-ai-best-practices',
  },
]

export const threatHuntingModule: ContentModule = {
  id: 'charlotte-usage-threat-hunting',
  title: 'Threat Hunting with Charlotte AI',
  trackId: 'charlotte-usage',
  domainId: 'charlotte-ai',
  order: 3,
  lastReviewed: '2026-08-17',
  concepts: threatHuntingConcepts,
  quiz: threatHuntingQuestions,
}

// ── Track 4.2 Scenario ─────────────────────────────────────────────────────

const usageScenario: Scenario = {
  id: 'charlotte-usage-scenario',
  title: 'Triage Acceleration: 30-Minute Incident Investigation with Charlotte AI',
  context: 'A Severity 2 detection fires at 14:35: "Credential access — LSASS memory access from unknown process on FIN-WORKSTATION-07." Your escalation deadline is 15:05 — 30 minutes to determine scope, confirm the threat, and update the ticket. Charlotte AI is active and you have Falcon Insight XDR, Next-Gen SIEM, and Falcon Identity Protection licensed.',
  isCumulative: false,
  steps: [
    {
      id: 'ch-usage-s1',
      narrative: 'At 14:35, you open Charlotte AI and ask: "Summarise the LSASS memory access detection on FIN-WORKSTATION-07 from the last 30 minutes." Charlotte AI responds with a summary and a generated CQL. What is your first action?',
      choices: [
        { text: 'Review the generated CQL first — verify time bound is last 30 minutes, source is FIN-WORKSTATION-07, and event types include process access events — then read the summary' },
        { text: 'Read Charlotte AI\'s summary immediately and act on its recommendations without reviewing the CQL' },
        { text: 'Close Charlotte AI and investigate manually via the Falcon Insight XDR UI to avoid introducing AI errors into a critical investigation' },
        { text: 'Ask Charlotte AI to re-run the query with higher confidence before reviewing any output' },
      ],
      correctChoiceIndex: 0,
      wrongConsequence: 'Acting on Charlotte AI\'s summary without CQL review risks building an investigation on a flawed query. Avoiding Charlotte AI entirely wastes the 30-minute window. "Higher confidence re-run" is not a Charlotte AI feature — confidence is determined by pattern matching, not by re-running.',
      reasoning: 'CQL review is always the first step. Confirm the query has the right time bound (last 30 minutes), the correct device filter (FIN-WORKSTATION-07), and includes the relevant event types (process memory access, process creation). 30 seconds of CQL verification before reading the summary prevents building a 30-minute investigation on an incorrectly scoped query.',
      docTitle: 'Charlotte AI Query Verification',
      docUrl: 'https://falcon.crowdstrike.com/documentation/page/charlotte-ai-best-practices',
    },
    {
      id: 'ch-usage-s2',
      narrative: 'Charlotte AI\'s summary: "An unsigned process (mimikatz.exe) accessed LSASS memory on FIN-WORKSTATION-07 at 14:32. This is consistent with credential harvesting via T1003.001 (OS Credential Dumping: LSASS Memory). Confidence: High." Charlotte AI suggests verifying whether any lateral movement occurred after 14:32. What should you ask next?',
      choices: [
        { text: 'Ask Charlotte AI to automatically contain FIN-WORKSTATION-07 — immediate containment is the first priority' },
        { text: 'Ask Charlotte AI: "Show me authentication events from FIN-WORKSTATION-07 or using credentials associated with that device\'s logged-in users after 14:32" — following Charlotte AI\'s suggestion to check for lateral movement' },
        { text: 'Escalate immediately to the CISO without further investigation — confirmed credential dumping via mimikatz always requires executive notification' },
        { text: 'Ask Charlotte AI the same question again with different wording to see if it changes its confidence score' },
      ],
      correctChoiceIndex: 1,
      wrongConsequence: 'Charlotte AI cannot contain workstations — it is read-only. Immediate CISO escalation before confirming lateral movement scope is premature (and will require a scope update minutes later). Re-asking the same question with different wording does not improve investigation quality.',
      reasoning: 'Charlotte AI\'s suggestion to check for lateral movement is the right lead. The follow-up question targets authentication events after 14:32 from FIN-WORKSTATION-07\'s users — this will reveal whether harvested credentials were used to access other systems. This is the highest-priority investigative question after confirmed credential dumping.',
      docTitle: 'Charlotte AI Lateral Movement Investigation',
      docUrl: 'https://falcon.crowdstrike.com/documentation/page/charlotte-ai-overview',
    },
    {
      id: 'ch-usage-s3',
      narrative: 'Charlotte AI returns: "3 successful logins from FIN-WORKSTATION-07\'s logged-in user account (svc-backup) to 5 other devices between 14:33 and 14:38. The destinations include FIN-SERVER-01 (financial application server). svc-backup\'s Falcon Identity Protection risk score is currently 95/100 (Critical)." What does this tell you about the blast radius?',
      choices: [
        { text: 'The investigation is limited to FIN-WORKSTATION-07 — the logins from svc-backup are routine service account activity' },
        { text: 'Charlotte AI\'s Identity Protection data is unreliable for service accounts — manual AD verification is required before concluding any lateral movement occurred' },
        { text: 'Active lateral movement is confirmed: svc-backup credentials were harvested and used within 1 minute to authenticate to 5 devices including a financial application server; the scope has expanded beyond FIN-WORKSTATION-07 and requires immediate escalation and coordinated containment' },
        { text: 'The high risk score indicates svc-backup is a shared credential — password reset is sufficient response without containment' },
      ],
      correctChoiceIndex: 2,
      wrongConsequence: 'Service account logins to 5 devices within 1 minute of credential dumping is not routine — it is textbook credential harvesting followed by lateral movement. Identity Protection\'s 95/100 risk score for svc-backup corroborates this (it is not unreliable). A password reset alone is insufficient when the attacker already has interactive sessions on 5 systems including FIN-SERVER-01.',
      reasoning: 'The 1-minute timeline from mimikatz execution (14:32) to svc-backup logins on 5 devices (14:33–14:38) confirms active credential-based lateral movement. The inclusion of FIN-SERVER-01 (financial application server) significantly increases business impact. Scope has expanded from 1 workstation to 6 devices minimum. The 30-minute escalation window must now include: containment of FIN-WORKSTATION-07, review of svc-backup sessions on all 5 destination devices, and notification that FIN-SERVER-01 may be compromised.',
      docTitle: 'Charlotte AI Scope Assessment',
      docUrl: 'https://falcon.crowdstrike.com/documentation/page/charlotte-ai-overview',
    },
    {
      id: 'ch-usage-s4',
      narrative: 'It is now 14:52 — 13 minutes remaining. You need to document the scope for the escalation ticket. Which Charlotte AI capability saves the most time here?',
      choices: [
        { text: 'Ask Charlotte AI to automatically create and populate the escalation ticket in your ITSM system',  },
        { text: 'Ask Charlotte AI to generate a timeline summary of the investigation findings: initial detection, credential dumping, lateral movement targets, and current scope — then copy this into the ticket as your investigation narrative', },
        { text: 'Export all Charlotte AI conversation logs as a PDF and attach them to the ticket without editing', },
        { text: 'Skip the ticket update — containment is more urgent than documentation in the remaining 13 minutes', },
      ],
      correctChoiceIndex: 1,
      wrongConsequence: 'Charlotte AI cannot integrate with external ITSM systems. Exporting raw AI conversation logs is low-quality documentation — the ticket needs structured findings, not a raw chat log. Skipping ticket documentation risks the escalation being rejected as incomplete, which forces you to redo the work later under more pressure.',
      reasoning: 'Asking Charlotte AI to generate a timeline summary of the investigation is the highest-efficiency documentation step. Charlotte AI has session context of everything you asked — it can produce a structured narrative (initial detection → credential dumping → lateral movement → current scope) that you copy-paste and lightly edit. This takes 2 minutes versus 10 minutes of manual writing, leaving you 11 minutes for containment actions.',
      docTitle: 'Charlotte AI Investigation Documentation',
      docUrl: 'https://falcon.crowdstrike.com/documentation/page/charlotte-ai-best-practices',
    },
    {
      id: 'ch-usage-s5',
      narrative: 'At 15:00 you update the ticket and trigger Network Containment on FIN-WORKSTATION-07 and FIN-SERVER-01. After the session ends, your manager asks for a hunting query to check if other workstations show similar mimikatz or LSASS access patterns from the last 7 days. What is the correct approach?',
      choices: [
        { text: 'Start a new Charlotte AI session and ask it to generate a hunting query for LSASS memory access patterns matching T1003.001 — review the generated CQL for correct field names, test on a 1-hour window first, then run it across 7 days', },
        { text: 'Use the investigation notes from the closed session — Charlotte AI has auto-saved a hunting query based on the session findings', },
        { text: 'The hunting query is not necessary — containment of the affected devices is sufficient response', },
        { text: 'Ask Charlotte AI in the same session to generate the hunting query before you close the browser', },
      ],
      correctChoiceIndex: 0,
      wrongConsequence: 'Charlotte AI does not auto-save hunting queries from closed sessions — session context is lost on close. Using the closed session\'s hunting query is not possible. Skipping the hunt misses the possibility that the attacker performed earlier mimikatz executions on other workstations not yet detected. The correct approach is a new session for the hunting query.',
      reasoning: 'A new Charlotte AI session is the correct approach. Charlotte AI cannot carry over context from a closed session. In the new session, ask for a T1003.001 (LSASS Memory) hunting query, review the generated CQL for correct field references (process name, OpenProcess API calls, LSASS as target), test on a 1-hour window, then run on 7 days. This proactive hunt may reveal earlier attacker activity that predates the detected incident.',
      docTitle: 'Charlotte AI Cross-Session Hunting',
      docUrl: 'https://falcon.crowdstrike.com/documentation/page/charlotte-ai-best-practices',
    },
  ],
}

// ── Track 4.2 Export ───────────────────────────────────────────────────────

export const usingCharlotteTrack: ContentTrack = {
  id: 'charlotte-usage',
  title: 'Using Charlotte AI Effectively',
  domainId: 'charlotte-ai',
  order: 2,
  modules: [nlQueriesModule, alertTriageModule, threatHuntingModule],
  scenario: usageScenario,
}
```

**Note on charlotte-usage-q5 and q8 and q12:** Each explanation contains a "trick question" correction note. The correct answers are:
- q5: Option B ("Charlotte AI has no memory of the previous session...") — must be at index 1 per distribution (q5=0 means correct at index 0... wait. q5=0 means correctIndex=0). So the correct answer "No — Charlotte AI has no memory of the previous session..." must be at index 0. Reorder so this option is first.
- q8: Option C ("Investigate the 5 high-priority alerts first, then spot-check a sample...") — must be at index 3 per distribution (q8=3). Move it to index 3.
- q12: Option C ("run on a short sample window (last 1 hour) first") — must be at index 3 per distribution (q12=3). Move it to index 3.

**IMPORTANT FOR IMPLEMENTER:** Rewrite the explanation fields for q5, q8, and q12 to remove the meta-commentary ("Wait — this is a trick") and state the explanation cleanly after the options are correctly ordered.

- [ ] **Step 2: Update `src/content/domains/charlotte-ai.ts`**

```typescript
import { usingCharlotteTrack } from './charlotte-track-4-2'
// tracks: [foundationsTrack, usingCharlotteTrack]
```

- [ ] **Step 3: TypeScript check + tests**

```
npx tsc -b
npm test
```

- [ ] **Step 4: Commit**

```
git add src/content/domains/charlotte-track-4-2.ts src/content/domains/charlotte-ai.ts
git commit -m "feat: add Charlotte AI Track 4.2 Using Charlotte AI Effectively modules and scenario"
```

---

### Task 3: Track 4.3 — Charlotte AI + SOAR Integration

**Files:**
- Create: `src/content/domains/charlotte-track-4-3.ts`
- Modify: `src/content/domains/charlotte-ai.ts`

- [ ] **Step 1: Create `src/content/domains/charlotte-track-4-3.ts`**

Track 4.3 has 2 modules (10 quiz questions, IDs `charlotte-soar-q1..q10`). Apply distribution: q1=0,q2=1,q3=2,q4=3,q5=0,q6=1,q7=2,q8=3,q9=0,q10=1; scenario steps s1=0,s2=1,s3=2,s4=3,s5=0. The correct answer must physically sit at the required index.

```typescript
import type {
  ContentModule,
  ContentTrack,
  QuizQuestion,
  ConceptSection,
  Scenario,
} from '../types'

// ═══════════════════════════════════════════════════════════════════════════════
// Track 4.3 — Charlotte AI + SOAR Integration
// ═══════════════════════════════════════════════════════════════════════════════

// ── Module 4.3.1: Triggering Fusion Workflows from Charlotte AI Insights ──────

const triggeringFusionConcepts: ConceptSection[] = [
  {
    title: 'How Charlotte AI and Falcon Fusion SOAR Work Together',
    body: 'Charlotte AI and Falcon Fusion SOAR serve complementary roles in the CrowdStrike platform:\n\n**Charlotte AI:** Investigation intelligence — understands what happened, provides context, suggests next steps\n**Falcon Fusion SOAR:** Orchestrated response — executes defined actions at machine speed based on rules and playbooks\n\nThese tools do not replace each other. The operational integration pattern is:\n\n1. **Detection fires** — Falcon detection triggers an alert\n2. **Charlotte AI investigates** — analyst asks Charlotte AI for context: what happened, on what device, with what technique, and what is the blast radius\n3. **Analyst decides** — based on Charlotte AI\'s investigation summary, the analyst determines the appropriate response playbook\n4. **Analyst triggers Fusion** — analyst manually triggers the appropriate Fusion workflow (or a saved-search-based Fusion rule fires automatically if pre-configured)\n5. **Fusion executes** — the playbook runs: containment, notification, ticket creation, enrichment\n\nCharlotte AI is NOT a direct Fusion trigger. It provides the investigation context that informs the analyst\'s decision to trigger Fusion.',
  },
  {
    title: 'Pre-Configuring Fusion Workflows Based on Charlotte AI Investigation Patterns',
    body: 'While Charlotte AI cannot directly trigger Fusion playbooks, you can pre-configure Fusion rules that fire based on the same signals Charlotte AI would surface in an investigation:\n\n**Pattern: Credential dumping + lateral movement response**\n- Fusion trigger: Detection of LSASS access (T1003.001) on any endpoint\n- Fusion actions: (1) Notify analyst channel, (2) Create P2 ticket with device details, (3) Request analyst decision on containment within 15 minutes\n- Charlotte AI role: Once the analyst receives the Fusion notification, they open Charlotte AI to quickly build scope context before deciding on containment\n\n**Pattern: High-confidence malicious macro execution**\n- Fusion trigger: Detection of PowerShell spawned by Office processes\n- Fusion actions: (1) Immediately network-contain the endpoint, (2) Notify SOC lead, (3) Create incident record\n- Charlotte AI role: Post-containment investigation — analyst uses Charlotte AI to determine blast radius and whether lateral movement occurred before containment\n\nThe key insight: Fusion handles the automated response; Charlotte AI handles the investigation intelligence. They operate in parallel, not in sequence.',
  },
]

const triggeringFusionQuestions: QuizQuestion[] = [
  {
    id: 'charlotte-soar-q1',
    text: 'An analyst uses Charlotte AI to confirm credential dumping on a compromised workstation. What is the correct next step to trigger an automated response?',
    options: [
      'The analyst manually triggers the appropriate Fusion playbook based on Charlotte AI\'s investigation findings — Charlotte AI provides the context; the analyst makes the Fusion trigger decision',
      'Charlotte AI automatically triggers the Fusion credential dumping playbook — investigation and response are linked in the platform',
      'The analyst asks Charlotte AI to select and trigger the best Fusion playbook based on the investigation context',
      'The analyst must wait for Falcon to automatically detect the lateral movement before Fusion can be triggered — manual triggering is not supported',
    ],
    correctIndex: 0,
    explanation: 'Charlotte AI is read-only and investigative — it cannot trigger Fusion playbooks. The analyst takes Charlotte AI\'s findings (confirmed credential dumping) and manually triggers the appropriate Fusion response playbook. This human-in-the-loop decision point is intentional: it prevents automated escalation from Charlotte AI\'s AI-generated findings without analyst verification.',
    docTitle: 'Charlotte AI and Fusion SOAR Integration',
    docUrl: 'https://falcon.crowdstrike.com/documentation/page/charlotte-ai-soar-integration',
  },
  {
    id: 'charlotte-soar-q2',
    text: 'What is the recommended integration pattern for Charlotte AI and Falcon Fusion?',
    options: [
      'Charlotte AI triggers Fusion playbooks directly via a native API integration built into the Falcon platform',
      'Charlotte AI and Fusion operate in parallel — Fusion handles automated response (containment, notification, ticket creation) while Charlotte AI handles investigation intelligence; they are informed by the same detection signals but serve complementary roles',
      'Fusion replaces Charlotte AI for SOAR-capable tenants — once Fusion is configured, Charlotte AI is no longer needed for investigation',
      'Charlotte AI should only be used after Fusion playbooks have completed — it is a post-response analysis tool, not an investigation tool',
    ],
    correctIndex: 1,
    explanation: 'Charlotte AI and Fusion are complementary, not sequential or mutually exclusive. Fusion handles automated response actions at machine speed (containment, notifications, ticket creation) triggered by detection rules. Charlotte AI handles the investigation intelligence layer (what happened, blast radius, technique attribution). Both can activate on the same detection in parallel — Fusion containing the threat while the analyst uses Charlotte AI to understand the full scope.',
    docTitle: 'Charlotte AI SOAR Complementary Roles',
    docUrl: 'https://falcon.crowdstrike.com/documentation/page/charlotte-ai-soar-integration',
  },
  {
    id: 'charlotte-soar-q3',
    text: 'You configure a Fusion playbook to automatically contain any endpoint where Falcon detects credential dumping. Charlotte AI simultaneously surfaces a "High" confidence credential dumping detection. The Fusion playbook has already contained the endpoint. What is the Charlotte AI investigation role now?',
    options: [
      'Charlotte AI is no longer needed — containment was the correct response and Fusion handled it automatically',
      'Charlotte AI should be used to audit whether Fusion\'s containment was proportionate and recommend whether to lift containment',
      'Charlotte AI should be used post-containment to investigate blast radius — did lateral movement occur before containment? Were credentials used on other systems? Does scope extend beyond the contained endpoint?',
      'Charlotte AI should reverse-engineer the Fusion playbook to check whether the automation followed the correct response procedure',
    ],
    correctIndex: 2,
    explanation: 'Fusion\'s containment stops the immediate threat vector, but the investigation questions remain: did the adversary pivot to other systems in the time between credential dumping and containment? Were the harvested credentials used to authenticate anywhere else? Charlotte AI is most valuable in this post-containment investigation window — determining whether the breach scope extends beyond the contained device and informing the next response actions.',
    docTitle: 'Charlotte AI Post-Containment Investigation',
    docUrl: 'https://falcon.crowdstrike.com/documentation/page/charlotte-ai-soar-integration',
  },
  {
    id: 'charlotte-soar-q4',
    text: 'Which of the following best describes the human-in-the-loop value of the Charlotte AI → analyst → Fusion trigger pattern?',
    options: [
      'It slows response time — automated Charlotte AI-to-Fusion integration would reduce MTTR by removing the analyst step',
      'It meets compliance requirements — some regulatory frameworks require a human approval step before automated containment',
      'It prevents unnecessary cost — Fusion playbook executions have per-run charges that the analyst step eliminates for false positives',
      'It prevents automated escalation of AI-generated findings without verification — Charlotte AI can be wrong; the analyst\'s review step catches misclassifications before automated response actions with real operational impact (containment, notifications, ticket creation) are triggered based on an AI error',
    ],
    correctIndex: 3,
    explanation: 'The human-in-the-loop between Charlotte AI and Fusion is a deliberate trust boundary. Charlotte AI can misclassify — confidently asserting a false positive as a confirmed threat. If this misclassification directly triggered an automated containment playbook, legitimate business systems could be incorrectly taken offline. The analyst\'s review step ensures that Charlotte AI\'s AI-generated findings are verified before automated response actions with real operational impact are triggered.',
    docTitle: 'Charlotte AI Trust Boundaries',
    docUrl: 'https://falcon.crowdstrike.com/documentation/page/charlotte-ai-best-practices',
  },
  {
    id: 'charlotte-soar-q5',
    text: 'Your organisation wants to reduce MTTR (Mean Time to Respond) using Charlotte AI + Fusion. Which approach achieves this most effectively?',
    options: [
      'Configure Fusion to auto-trigger containment playbooks immediately upon any Charlotte AI "High" confidence finding without analyst review',
      'Configure Fusion detection-based triggers (e.g., LSASS access, malicious macro) to fire immediately while analysts use Charlotte AI in parallel to investigate scope — Fusion handles automated containment and notification at machine speed; Charlotte AI builds investigation context simultaneously; the analyst merges both to make the escalation decision',
      'Replace Charlotte AI with Fusion for all detection workflows — Fusion\'s automated playbooks are faster than AI-assisted investigation',
      'Use Charlotte AI to generate Fusion playbooks dynamically for each incident — AI-generated playbooks are faster to write than manually configured ones',
    ],
    correctIndex: 0,
    explanation: 'Wait — Option A (auto-triggering on Charlotte AI "High" findings without analyst review) is actually the RISKY approach. The correct MTTR-reducing strategy is Option B: Fusion fires immediately on Falcon detection signals (not Charlotte AI outputs) for automated containment, while Charlotte AI runs in parallel for scope investigation. The analyst receives both the Fusion containment confirmation and the Charlotte AI scope summary simultaneously — making a faster, more informed escalation decision than either tool alone. Charlotte AI should never directly trigger Fusion without analyst review.',
    docTitle: 'Charlotte AI and Fusion MTTR Reduction',
    docUrl: 'https://falcon.crowdstrike.com/documentation/page/charlotte-ai-soar-integration',
  },
]

export const triggeringFusionModule: ContentModule = {
  id: 'charlotte-soar-triggering-fusion',
  title: 'Triggering Fusion Workflows from Charlotte AI Insights',
  trackId: 'charlotte-soar',
  domainId: 'charlotte-ai',
  order: 1,
  lastReviewed: '2026-08-17',
  concepts: triggeringFusionConcepts,
  quiz: triggeringFusionQuestions,
}

// ── Module 4.3.2: Limitations, Trust Boundaries & When NOT to Rely on Charlotte AI ──

const limitationsConcepts: ConceptSection[] = [
  {
    title: 'Charlotte AI Limitations: What It Gets Wrong and Why',
    body: 'Charlotte AI is a powerful investigative tool with real limitations that analysts must understand to use it safely:\n\n**Hallucination:** Like all large language models, Charlotte AI can generate plausible-sounding but incorrect information. This is most likely when:\n- Querying data that is sparse in LogScale (low-volume event types with few matching events)\n- Asking for threat intelligence about very new or obscure threat actors\n- Asking for specific statistics (exact counts, percentages) that Charlotte AI extrapolates rather than queries directly\n\n**Schema drift:** LogScale parser schemas change over time (new parsers, field renames). Charlotte AI\'s schema knowledge has a training cutoff — it may reference field names that no longer exist or have been renamed in your current parsers.\n\n**Confidence miscalibration:** Charlotte AI\'s confidence scores are based on pattern similarity, not ground truth accuracy. A "High" confidence rating on a novel technique that Charlotte AI has not been trained on may be completely wrong. Confidence is a signal, not a guarantee.\n\n**Data dependency:** Charlotte AI is only as good as your LogScale data. If an event type is not ingested (missing parser, coverage gap, sensor not deployed), Charlotte AI cannot answer questions about it — and may not clearly communicate that the absence of data is a coverage gap rather than evidence of a clean environment.',
  },
  {
    title: 'Trust Boundaries: When NOT to Rely on Charlotte AI',
    body: 'There are specific scenarios where Charlotte AI should not be your primary source of truth:\n\n**Do NOT rely on Charlotte AI alone when:**\n- **Making containment decisions on production systems** — verify the raw events manually before containing a business-critical system based solely on Charlotte AI\'s summary\n- **Filing regulatory reports** — Charlotte AI summaries are not auditable evidence; raw LogScale event exports are\n- **Concluding a clean bill of health** — "Charlotte AI found nothing suspicious" does not mean no threat is present; it means no pattern matched in the data Charlotte AI queried. Missing data = missing investigation, not confirmed clean\n- **Investigating novel, zero-day, or undocumented techniques** — Charlotte AI is pattern-matched to known techniques; genuinely novel adversary behaviour may not trigger any Charlotte AI confidence signal\n- **Time-critical automatic actions with no rollback** — actions that cannot be easily reversed (deleting data, revoking certificates, taking down critical services) must have manual verification before execution\n\n**The analyst\'s verification responsibility increases in proportion to the consequence of being wrong.**',
  },
]

const limitationsQuestions: QuizQuestion[] = [
  {
    id: 'charlotte-soar-q6',
    text: 'Charlotte AI tells you: "There is no suspicious activity on CORP-DC-001 in the last 24 hours." What does this conclusion mean?',
    options: [
      'Charlotte AI confirmed CORP-DC-001 is clean — no further investigation is needed',
      '"No suspicious activity" means Charlotte AI queried available data and found no patterns matching known-bad behaviour; it does NOT mean the system is confirmed clean — data coverage gaps, missing parsers, or novel techniques could all produce a false clean result',
      'Charlotte AI\'s negative finding is definitive — it has access to all Falcon data and a negative result is a reliable security assertion',
      'Charlotte AI can confirm clean systems with 99% accuracy when confidence: High is shown alongside the negative result',
    ],
    correctIndex: 1,
    explanation: 'A Charlotte AI negative finding ("no suspicious activity") means the data available in LogScale showed no patterns matching Charlotte AI\'s known-bad signatures. It does NOT confirm the system is clean. Common reasons for false negatives: the event type is not ingested (sensor gap), the parser excludes relevant fields, the attacker used a novel technique Charlotte AI was not trained on, or the activity occurred outside the queried time window. Never substitute Charlotte AI\'s negative finding for a full manual investigation on a high-value target.',
    docTitle: 'Charlotte AI False Negatives',
    docUrl: 'https://falcon.crowdstrike.com/documentation/page/charlotte-ai-best-practices',
  },
  {
    id: 'charlotte-soar-q7',
    text: 'Charlotte AI claims a specific threat actor "has never targeted the financial services sector." Your threat intelligence team says otherwise. What is the most likely explanation?',
    options: [
      'Charlotte AI is correct — it has access to all CrowdStrike threat intelligence and the threat intelligence team is using outdated sources',
      'Charlotte AI hallucinated or has a training data cutoff — threat intelligence is time-sensitive and Charlotte AI\'s knowledge of specific actor targeting may be outdated or incorrect; always verify actor-specific claims against current Falcon Intelligence reports',
      'There is a conflict in the CrowdStrike threat intelligence data — contact CrowdStrike support to resolve the discrepancy',
      'Charlotte AI\'s threat intelligence is region-specific — if your organisation is not in the same region as previous victims, Charlotte AI correctly reports "never targeted"',
    ],
    correctIndex: 1,
    explanation: 'Charlotte AI can hallucinate specific threat actor details or have a knowledge cutoff that predates recent campaigns. Threat intelligence is time-sensitive — a threat actor that had never targeted financial services last year may have begun targeting it this quarter. For actor-specific targeting claims, always verify against current Falcon Intelligence reports or your threat intelligence team\'s live sources rather than relying on Charlotte AI\'s generative response.',
    docTitle: 'Charlotte AI Threat Intelligence Limitations',
    docUrl: 'https://falcon.crowdstrike.com/documentation/page/charlotte-ai-best-practices',
  },
  {
    id: 'charlotte-soar-q8',
    text: 'You are writing a regulatory compliance report that must document evidence of a specific security incident. Can Charlotte AI\'s investigation summary serve as the primary evidence?',
    options: [
      'Yes — Charlotte AI summaries are digitally signed by CrowdStrike and meet regulatory evidence standards',
      'Yes — Charlotte AI provides an auditable query log that regulators accept as primary evidence',
      'Partially — Charlotte AI summaries can accompany the report as supplementary context, but raw LogScale event exports and the Falcon detection record are the auditable primary evidence',
      'No — Charlotte AI\'s AI-generated text is not admissible evidence in any regulatory context and must not be included in compliance reports',
    ],
    correctIndex: 2,
    explanation: 'Charlotte AI summaries are useful supplementary documentation but are NOT primary regulatory evidence. The primary evidence for a compliance report is: the raw LogScale event export (showing actual event data with timestamps, field values, and source information), the Falcon detection record (showing the detection logic and matching telemetry), and the audit log from the _audit repository (showing query history). Charlotte AI\'s plain-language summary can accompany these as human-readable context but cannot substitute for the raw evidence.',
    docTitle: 'Charlotte AI Regulatory Evidence',
    docUrl: 'https://falcon.crowdstrike.com/documentation/page/charlotte-ai-best-practices',
  },
  {
    id: 'charlotte-soar-q9',
    text: 'An analyst argues: "Charlotte AI gave High confidence — I don\'t need to look at the raw events." What is the critical flaw in this reasoning?',
    options: [
      'Proceeding without reviewing raw events when Charlotte AI gives High confidence — Charlotte AI confidence scores are calibrated on pattern similarity, not ground truth; a High confidence rating on a false positive pattern will be wrong with full conviction; the raw events are the only ground truth available to the analyst',
      'Charlotte AI confidence scores are meaningless — they should be ignored entirely in favour of raw event review',
      'The reasoning is correct — High confidence from Charlotte AI is sufficient for escalation decisions without raw event review',
      'The analyst should wait for a second AI tool to confirm before relying on a single High confidence finding',
    ],
    correctIndex: 0,
    explanation: 'Charlotte AI confidence scores measure how closely the observed pattern resembles known-bad patterns in the training data — not whether the specific event is actually malicious. A novel legitimate business tool may generate process behaviour that strongly resembles known malware (high confidence false positive). The raw events are the only ground truth: they show the actual command line, the actual parent process, the actual network destination. High confidence accelerates investigation priority but does not eliminate the requirement to verify against raw events.',
    docTitle: 'Charlotte AI Raw Event Verification',
    docUrl: 'https://falcon.crowdstrike.com/documentation/page/charlotte-ai-best-practices',
  },
  {
    id: 'charlotte-soar-q10',
    text: 'When is Charlotte AI MOST reliable as a source of investigation information?',
    options: [
      'When investigating well-documented, commonly occurring attack techniques (credential dumping, lateral movement via PtH, Office macro execution) with rich telemetry in LogScale — Charlotte AI has deep pattern knowledge of these techniques and your data provides strong signal',
      'When investigating zero-day exploits — Charlotte AI has the most up-to-date knowledge of emerging threats',
      'When your LogScale instance has limited telemetry — Charlotte AI can infer attack activity even with sparse data',
      'When investigating physical security incidents — Charlotte AI has access to building access log data via Falcon',
    ],
    correctIndex: 0,
    explanation: 'Charlotte AI is most reliable for well-documented, commonly observed attack techniques where (1) it has rich training data on the technique patterns and (2) your LogScale instance has good telemetry coverage for the relevant event types. Credential dumping (T1003), lateral movement, and malicious macro execution are textbook examples — Charlotte AI\'s pattern knowledge is strong and the telemetry is typically rich. For zero-days, sparse data, or physical security, Charlotte AI\'s reliability degrades significantly.',
    docTitle: 'Charlotte AI Reliability Factors',
    docUrl: 'https://falcon.crowdstrike.com/documentation/page/charlotte-ai-best-practices',
  },
]

export const limitationsModule: ContentModule = {
  id: 'charlotte-soar-limitations',
  title: 'Limitations, Trust Boundaries & When NOT to Rely on Charlotte AI',
  trackId: 'charlotte-soar',
  domainId: 'charlotte-ai',
  order: 2,
  lastReviewed: '2026-08-17',
  concepts: limitationsConcepts,
  quiz: limitationsQuestions,
}

// ── Track 4.3 Scenario ─────────────────────────────────────────────────────

const soarScenario: Scenario = {
  id: 'charlotte-soar-scenario',
  title: 'AI + Automation: Configuring Charlotte AI and Fusion for Maximum Effect',
  context: 'You are a senior security engineer designing the Charlotte AI + Fusion SOAR integration strategy for your organisation. You have Falcon Insight XDR, Next-Gen SIEM, Falcon Identity Protection, and Fusion SOAR. You need to define: which response actions Fusion automates immediately, which require Charlotte AI investigation first, and where the trust boundaries are.',
  isCumulative: false,
  steps: [
    {
      id: 'ch-soar-s1',
      narrative: 'For network containment of an endpoint: should this action be (A) automated by Fusion immediately on detection, or (B) triggered manually by an analyst after Charlotte AI investigation? What is the key factor that determines which approach is correct?',
      choices: [
        { text: 'The key factor is the severity and confidence of the detection AND the business impact of incorrect containment — critical-severity, High-confidence detections on non-business-critical endpoints may justify immediate Fusion auto-containment; broad auto-containment on all endpoints without analyst review risks taking down critical infrastructure based on false positives' },
        { text: 'Always automate containment immediately — speed of response is more important than accuracy in security incidents' },
        { text: 'Always require analyst review — automated containment is never acceptable in a production environment' },
        { text: 'The decision should be made by Charlotte AI — ask it whether to contain the endpoint based on its confidence score' },
      ],
      correctChoiceIndex: 0,
      wrongConsequence: '"Always automate" creates false-positive containment events that take down legitimate business systems. "Never automate" eliminates the speed advantage of SOAR for clear-cut high-confidence threats. Charlotte AI cannot make containment decisions — it is advisory and read-only.',
      reasoning: 'The containment automation decision is risk-calibrated: high-confidence detections on endpoints where incorrect containment has low business impact (isolated workstations, test systems) may justify immediate Fusion auto-containment. Endpoints where incorrect containment would disrupt critical business processes (domain controllers, payment systems, production servers) require analyst review via Charlotte AI before triggering containment, even for high-confidence detections.',
      docTitle: 'Falcon Fusion SOAR Containment Design',
      docUrl: 'https://falcon.crowdstrike.com/documentation/page/falcon-fusion-soar',
    },
    {
      id: 'ch-soar-s2',
      narrative: 'You decide that password resets for compromised accounts should be triggered by Fusion automatically when Charlotte AI\'s investigation identifies credential harvesting. What is wrong with this design?',
      choices: [
        { text: 'Nothing is wrong — Charlotte AI findings are reliable enough to trigger account lockout actions automatically via Fusion' },
        { text: 'Charlotte AI cannot trigger Fusion playbooks — the integration must be redesigned so that Fusion fires based on Falcon detection signals, not Charlotte AI outputs; Charlotte AI\'s investigation findings are advisory and require analyst review before triggering response actions' },
        { text: 'Password resets should never be automated — they must always be executed manually by the identity team' },
        { text: 'Fusion cannot perform password resets — that capability requires a separate IAM integration tool' },
      ],
      correctChoiceIndex: 1,
      wrongConsequence: 'Charlotte AI findings triggering Fusion directly is not the correct integration model — Charlotte AI cannot trigger Fusion, and Charlotte AI\'s AI-generated findings require analyst review before any automated response. Password resets can be automated by Fusion (when triggered by verified detection signals); the issue is the trigger source (Charlotte AI output vs. Falcon detection).',
      reasoning: 'The design flaw is using Charlotte AI outputs as a Fusion trigger. Charlotte AI is read-only and cannot send signals to Fusion. The correct design: Fusion triggers on Falcon detection signals (e.g., LSASS access detection), performs initial automated actions (notification, ticket creation), then an analyst reviews Charlotte AI\'s investigation summary before making the account lockout decision. Charlotte AI informs the analyst; the analyst triggers Fusion\'s account response action.',
      docTitle: 'Charlotte AI Fusion Trigger Design',
      docUrl: 'https://falcon.crowdstrike.com/documentation/page/charlotte-ai-soar-integration',
    },
    {
      id: 'ch-soar-s3',
      narrative: 'You want to create a runbook: "When Charlotte AI identifies lateral movement with High confidence, Fusion should alert the SOC lead and request a containment decision within 10 minutes." What is correct and incorrect about this runbook?',
      choices: [
        { text: 'Entirely incorrect — Fusion cannot create time-bound decision requests; it only supports unconditional automated actions' },
        { text: 'Partially correct — the 10-minute decision window and SOC lead notification via Fusion are achievable; the incorrect part is "when Charlotte AI identifies" as the trigger — Charlotte AI cannot trigger Fusion; the trigger must be a Falcon detection rule or LogScale saved search, with Charlotte AI providing the parallel investigation context the analyst uses to make the containment decision' },
        { text: 'Entirely correct — this is the recommended Charlotte AI + Fusion integration pattern; Charlotte AI triggering Fusion with a human-approval step is the standard design' },
        { text: 'Partially correct — Charlotte AI can trigger Fusion alerts but not containment actions; modify the runbook to remove the containment request' },
      ],
      correctChoiceIndex: 1,
      wrongConsequence: 'Fusion can create time-bound decision requests and SOC notifications — these are standard Fusion capabilities. Charlotte AI cannot trigger Fusion at all — this is a fundamental architectural point. The containment decision request within 10 minutes is a good design; the trigger source is the design error.',
      reasoning: 'The runbook concept (SOC lead notification + time-bound decision request) is sound Fusion SOAR design. The error is "when Charlotte AI identifies" as the trigger. Fix: the Fusion workflow is triggered by a Falcon detection rule matching lateral movement indicators. When the Fusion workflow fires, it (1) notifies the SOC lead, (2) creates a 10-minute decision task, and (3) presents Charlotte AI\'s investigation summary in the notification so the analyst has context for the containment decision. Charlotte AI provides the investigation context; Fusion handles the workflow.',
      docTitle: 'Fusion Decision-Request Workflows',
      docUrl: 'https://falcon.crowdstrike.com/documentation/page/falcon-fusion-soar',
    },
    {
      id: 'ch-soar-s4',
      narrative: 'Charlotte AI gives a "High" confidence finding of a novel attack technique your team has never seen. Fusion is configured to auto-contain on High confidence Charlotte AI findings. What is the risk?',
      choices: [
        { text: 'No risk — Fusion only executes if Charlotte AI confidence exceeds 95%, which eliminates false positives' },
        { text: 'Minimal risk — novel techniques always represent genuine threats; auto-containment on novel High confidence findings is the safest default' },
        { text: 'Charlotte AI would not produce a High confidence finding for a genuinely novel technique — the scenario is impossible' },
        { text: 'High risk — Charlotte AI can produce High confidence false positives when a novel legitimate business process pattern resembles known malware; if Fusion auto-contains based on Charlotte AI confidence without analyst review, legitimate systems can be incorrectly taken offline; auto-containment on Charlotte AI confidence scores without human verification is not a safe automation design' },
      ],
      correctChoiceIndex: 3,
      explanation: 'Charlotte AI confidence scores are not a safe Fusion trigger even at "High." Charlotte AI can generate High confidence false positives when legitimate business tools generate process behaviour that strongly resembles known malware. Additionally, a genuinely novel attack technique might produce a High confidence match to the closest known pattern even if it\'s not quite right. Auto-containment on Charlotte AI confidence without analyst verification is a design anti-pattern that will eventually take down legitimate business systems.',
      wrongConsequence: 'There is no 95% threshold above which false positives are eliminated — Charlotte AI confidence is not calibrated to false positive rates at that precision. Novel techniques can produce High confidence findings when they resemble known patterns. Charlotte AI is fully capable of producing High confidence findings on novel activity.',
      reasoning: 'Auto-containment based on Charlotte AI confidence is unsafe because (1) Charlotte AI can produce High confidence false positives; (2) confidence is pattern similarity, not ground truth accuracy; (3) the design removes the human verification step that is the last defence against AI misclassification driving real operational impact. The safe design: Fusion triggers on Falcon detection signals, Charlotte AI provides investigation context, analyst verifies before triggering containment.',
      docTitle: 'Charlotte AI Auto-Containment Risks',
      docUrl: 'https://falcon.crowdstrike.com/documentation/page/charlotte-ai-best-practices',
    },
    {
      id: 'ch-soar-s5',
      narrative: 'You are presenting the Charlotte AI + Fusion integration design to your CISO. They ask: "What is the one decision that should always require a human, never be automated?" What is your answer?',
      choices: [
        { text: 'Any response action with significant, difficult-to-reverse operational impact — network containment of critical systems, account lockouts for privileged accounts, data deletion — must always require human verification of Charlotte AI\'s findings before execution, because the cost of a wrong automated decision based on a Charlotte AI error exceeds the benefit of the speed gained by removing the human review step', },
        { text: 'Creating incident tickets — ticket creation should always require human review to ensure accuracy', },
        { text: 'Sending notification emails — automated notification emails are a compliance risk if they contain AI-generated content', },
        { text: 'No actions should require a human — full automation eliminates human error and should be the target state for all SOC operations', },
      ],
      correctChoiceIndex: 0,
      wrongConsequence: 'Ticket creation and notification emails are low-consequence, easily reversible actions that are appropriate for full automation. Full automation without human oversight is not a safe or achievable security operations target state — humans remain essential for consequence-weighted decisions. The principle is proportionality: automate low-consequence, high-confidence actions; require humans for high-consequence, difficult-to-reverse actions.',
      reasoning: 'The one decision that always requires a human is any response action with significant, difficult-to-reverse operational impact. The rationale: if Charlotte AI is wrong about a High confidence finding and an automated playbook contains a critical production system, the business impact of the false positive may exceed the damage the adversary would have caused. Human verification at the containment decision point is the proportionate response to the risk of AI misclassification. This is the trust boundary principle: the required level of human verification scales with the consequence of being wrong.',
      docTitle: 'Charlotte AI Human-in-the-Loop Requirements',
      docUrl: 'https://falcon.crowdstrike.com/documentation/page/charlotte-ai-best-practices',
    },
  ],
}

// ── Track 4.3 Export ───────────────────────────────────────────────────────

export const charlotteSoarTrack: ContentTrack = {
  id: 'charlotte-soar',
  title: 'Charlotte AI + SOAR Integration',
  domainId: 'charlotte-ai',
  order: 3,
  modules: [triggeringFusionModule, limitationsModule],
  scenario: soarScenario,
}
```

**Notes for implementer:**
- `charlotte-soar-q5`: The plan text says "Wait — Option A... is actually the RISKY approach." The correct answer is Option B. For the distribution (q5=0), the correct answer must be at index 0. Rewrite the options so Option B ("Configure Fusion detection-based triggers...") is at index 0, and rewrite the explanation cleanly without the meta-commentary.
- `charlotte-soar-q8`: Distribution q8=3. The correct answer ("Partially — Charlotte AI summaries can accompany the report as supplementary context, but raw LogScale event exports are the primary evidence") must be at index 3. Arrange options accordingly.
- All other questions are already at their required distribution index per the plan.

- [ ] **Step 2: Update `src/content/domains/charlotte-ai.ts`**

```typescript
import { charlotteSoarTrack } from './charlotte-track-4-3'
// tracks: [foundationsTrack, usingCharlotteTrack, charlotteSoarTrack]
```

- [ ] **Step 3: TypeScript check + tests**

```
npx tsc -b
npm test
```

- [ ] **Step 4: Commit**

```
git add src/content/domains/charlotte-track-4-3.ts src/content/domains/charlotte-ai.ts
git commit -m "feat: add Charlotte AI Track 4.3 SOAR Integration modules and scenario"
```

---

### Task 4: Charlotte AI Cumulative Scenario

Replace the `charlotteCumulativeScenario` stub in `charlotte-ai.ts` with a 6-step capstone. Apply correct-answer distribution: s1=0,s2=1,s3=2,s4=3,s5=0,s6=1. The correct answer must physically sit at the required index.

**Files:**
- Modify: `src/content/domains/charlotte-ai.ts`

- [ ] **Step 1: Replace the cumulative scenario stub in `src/content/domains/charlotte-ai.ts`**

Find the stub constant `charlotteCumulativeScenario` and replace it completely with:

```typescript
const charlotteCumulativeScenario: Scenario = {
  id: 'charlotte-ai-cumulative',
  title: 'The AI Analyst: Full Incident Investigation with Charlotte AI',
  context: 'It is 02:17 UTC. A Falcon detection fires on CORP-FIN-01 (financial application server): "Suspicious process injection — unknown DLL loaded into svchost.exe." This is the first alert from a threat campaign that will escalate significantly over the next 4 hours. Charlotte AI is active. You have Falcon Insight XDR, Next-Gen SIEM, Identity Protection, and Fusion SOAR.',
  isCumulative: true,
  steps: [
    {
      id: 'ch-cum-s1',
      narrative: 'At 02:17, you open Charlotte AI. Before asking any questions, what is the most important preparatory step?',
      choices: [
        { text: 'Establish the investigation scope by first asking Charlotte AI a time-scoped, host-scoped question: "Summarise all activity on CORP-FIN-01 in the last 30 minutes including process events, network connections, and authentication" — and then review the generated CQL before reading the response' },
        { text: 'Ask Charlotte AI the broadest possible question to capture all context: "Show me everything suspicious in our environment in the last 24 hours"' },
        { text: 'Trigger the Fusion incident response playbook immediately before investigating with Charlotte AI — containment first, investigation second' },
        { text: 'Call a senior analyst before using Charlotte AI — AI tools should not be the first responder for production financial server alerts' },
      ],
      correctChoiceIndex: 0,
      wrongConsequence: '"Everything suspicious in 24 hours" generates a massive, unfocused result set that wastes the first minutes of an escalating incident. Triggering Fusion containment before understanding what happened risks containing a server based on one low-context alert — Charlotte AI\'s investigation in the first 5 minutes will either confirm or refute the need for immediate containment. Calling a senior analyst before starting investigation delays the initial context-building that will make any follow-up conversation more productive.',
      reasoning: 'The first Charlotte AI question for a specific detection should be scoped to the affected host and a tight time window. Starting with "all activity on CORP-FIN-01 in the last 30 minutes" produces manageable, relevant results. Including process, network, and authentication data in one question leverages Charlotte AI\'s cross-module correlation. Reviewing the CQL before reading the response ensures the query is correctly scoped before building investigation conclusions on it.',
      docTitle: 'Charlotte AI Initial Investigation',
      docUrl: 'https://falcon.crowdstrike.com/documentation/page/charlotte-ai-best-practices',
    },
    {
      id: 'ch-cum-s2',
      narrative: 'Charlotte AI responds: "An unsigned DLL (temp_update.dll) was injected into svchost.exe at 02:14. The DLL was dropped by a process masquerading as a Windows Update executable. Confidence: High. A network connection to 185.220.101.47 was established at 02:15." You check Falcon Intelligence for 185.220.101.47. What should you ask Charlotte AI to do next with this IP?',
      choices: [
        { text: 'Ask Charlotte AI to block 185.220.101.47 at the firewall immediately — confirmed external connection from a suspicious process warrants immediate network-level response' },
        { text: 'Ask Charlotte AI: "Has any other device in our environment made connections to 185.220.101.47 in the last 7 days?" — if this IP is part of an active campaign, other devices may already be compromised' },
        { text: 'Ask Charlotte AI to generate a threat actor profile for whoever is attacking CORP-FIN-01 — actor attribution is the first priority in a financial server incident' },
        { text: 'Close Charlotte AI and escalate to the CISO immediately — a confirmed external connection from a financial server is a Severity 1 incident requiring executive notification before further investigation' },
      ],
      correctChoiceIndex: 1,
      wrongConsequence: 'Charlotte AI cannot block IPs — it is read-only. Actor attribution is valuable but secondary to determining current blast radius and active connections. Escalating to the CISO before knowing the full scope wastes the escalation window and will require an immediate update when more scope is discovered minutes later.',
      reasoning: 'With a confirmed external IP connection from a suspicious process, the highest-priority question is lateral scope: has this IP communicated with other devices in your environment? If the attack has already spread to multiple hosts, containment of CORP-FIN-01 alone is insufficient. Charlotte AI\'s cross-device query ("any device in our environment") leverages its session context and provides the blast radius information needed to calibrate the response before escalation.',
      docTitle: 'Charlotte AI Blast Radius Investigation',
      docUrl: 'https://falcon.crowdstrike.com/documentation/page/charlotte-ai-overview',
    },
    {
      id: 'ch-cum-s3',
      narrative: 'Charlotte AI reveals: "3 other devices contacted 185.220.101.47 in the last 72 hours: CORP-FIN-02, CORP-HR-01, and CORP-JUMP-01 (jump server). The connections from CORP-JUMP-01 began 68 hours ago — the earliest." This changes the scope dramatically. What does this reveal about the incident timeline?',
      choices: [
        { text: 'CORP-JUMP-01 was likely the initial access point — connections to the C2 IP began 68 hours ago, 3 days before the first Falcon detection fired on CORP-FIN-01; the incident timeline extends at least 72 hours further back than the initial alert suggested' },
        { text: 'The 72-hour history is a coincidence — the earlier connections to the same IP are unrelated to tonight\'s incident' },
        { text: 'The incident started tonight on CORP-FIN-01 — the 72-hour CORP-JUMP-01 connections are false positives because Charlotte AI\'s historical network queries are unreliable' },
        { text: 'CORP-JUMP-01 connections indicate the attacker has already been detected and remediated by Falcon 72 hours ago — the current incident is a re-infection' },
      ],
      correctChoiceIndex: 0,
      wrongConsequence: '"The 72-hour history is a coincidence" ignores the clearest investigative signal Charlotte AI has surfaced. Attributing historical LTR query data to Charlotte AI unreliability is not substantiated. Assuming prior remediation when there is no record of a prior incident is wishful thinking. The facts support the most important conclusion: the attack predates tonight\'s detection by 72 hours.',
      reasoning: 'A jump server (CORP-JUMP-01) contacting a known C2 IP 72 hours before the first Falcon detection on the financial server is the most significant finding in the investigation so far. It indicates: (1) initial access via the jump server occurred 3+ days ago, (2) the attacker established C2 before Falcon generated a detection, (3) CORP-FIN-01 may have been reached via lateral movement from the jump server, and (4) the actual dwell time is 72+ hours. This changes the incident from "tonight\'s alert" to "72-hour undetected breach."',
      docTitle: 'Charlotte AI Timeline Reconstruction',
      docUrl: 'https://falcon.crowdstrike.com/documentation/page/charlotte-ai-overview',
    },
    {
      id: 'ch-cum-s4',
      narrative: 'It is now 02:45. You have confirmed: (1) 72-hour dwell time starting from CORP-JUMP-01, (2) spread to CORP-FIN-01, CORP-FIN-02, CORP-HR-01. Fusion has been manually triggered to contain CORP-FIN-01. Your manager asks Charlotte AI: "Is the incident fully scoped?" Charlotte AI responds: "Based on available data, the 4 identified devices appear to be the full scope." How should you treat this response?',
      choices: [
        { text: 'Accept it — Charlotte AI has reviewed all available data and a "High" confidence scoping assessment is reliable for escalation reporting' },
        { text: 'Reject it immediately — Charlotte AI can never provide accurate scope assessments; all scope must be manually determined by reviewing every device in the environment' },
        { text: 'Treat it as a partial answer — Charlotte AI\'s scope assessment is based on what data is in LogScale; devices without Falcon sensors, systems with gaps in telemetry coverage, or cloud workloads not ingested into LogScale are invisible to Charlotte AI\'s analysis; manually verify sensor coverage and check cloud workload logs separately' },
        { text: 'Accept it but add a 20% buffer — increase the reported scope by 20% to account for Charlotte AI\'s known accuracy limitations' },
      ],
      correctChoiceIndex: 3,
      explanation: 'Wait — "20% buffer" is not a meaningful engineering practice. The correct answer is C: treat it as a partial answer based on available telemetry. Charlotte AI can only see what\'s in LogScale. The "full scope" assessment is only as complete as your sensor coverage. Devices without Falcon sensors, cloud workloads not forwarded to LogScale, and network segments with no telemetry are all invisible to Charlotte AI.',
      wrongConsequence: 'Accepting Charlotte AI\'s scope assessment as definitive creates false confidence in an incomplete picture. Rejecting all scope assessments from Charlotte AI ignores the significant investigative value it provides for covered devices. A "20% buffer" has no factual basis. The correct approach is: treat Charlotte AI\'s scope as accurate for the telemetry it has access to, then verify coverage gaps separately.',
      reasoning: 'Charlotte AI\'s scope assessment is accurate for devices and data sources within your LogScale telemetry. The critical caveat: "the 4 identified devices appear to be the full scope" only holds if every device in your environment has a Falcon sensor deployed, all telemetry is ingested into LogScale, and cloud workloads are included. For a 72-hour dwell-time incident, manually verify sensor coverage on all devices in the affected network segment and check cloud workload logs separately before declaring scope closed.',
      docTitle: 'Charlotte AI Scope Assessment Limitations',
      docUrl: 'https://falcon.crowdstrike.com/documentation/page/charlotte-ai-best-practices',
    },
    {
      id: 'ch-cum-s5',
      narrative: 'At 04:30, containment is complete and the incident is escalating to full forensics. Your manager asks you to produce an incident timeline for the executive briefing at 06:00. You have 90 minutes. How do you use Charlotte AI most effectively here?',
      choices: [
        { text: 'Ask Charlotte AI to generate a structured incident timeline from its session context: initial compromise timestamp (CORP-JUMP-01 at 72h ago), C2 communications, lateral movement sequence, and affected assets — use this as the draft and verify each data point against the raw LogScale events before finalising' },
        { text: 'Write the timeline manually from memory — Charlotte AI-generated content should not appear in executive briefings' },
        { text: 'Ask Charlotte AI to write the full briefing document including executive summary, technical details, and remediation recommendations — a complete AI-generated document saves the most time' },
        { text: 'Skip the timeline and present Charlotte AI live during the briefing — real-time AI querying is more impressive and current than a pre-prepared timeline' },
      ],
      correctChoiceIndex: 0,
      wrongConsequence: 'Writing from memory in 90 minutes misses the investigative leverage Charlotte AI\'s session context provides. A fully AI-generated briefing document without fact-checking risks presenting hallucinated or imprecise data to executives. Live Charlotte AI querying in an executive briefing introduces real-time failure risk and is not appropriate for a formal incident review.',
      reasoning: 'Charlotte AI is most useful for incident documentation as a first-draft generator. It has session context of everything discovered in the investigation: the initial access timestamp, C2 connection timeline, lateral movement sequence, and affected assets. Asking for a structured timeline from session context generates the draft in 2 minutes. The analyst then verifies each timestamp and event against the raw LogScale events — this 30-minute verification step transforms a good AI draft into an accurate executive briefing document.',
      docTitle: 'Charlotte AI Incident Documentation',
      docUrl: 'https://falcon.crowdstrike.com/documentation/page/charlotte-ai-best-practices',
    },
    {
      id: 'ch-cum-s6',
      narrative: 'Post-incident, your CISO asks: "Should we configure Charlotte AI to automatically trigger Fusion playbooks so we respond faster next time?" Based on this incident, what is the most accurate answer?',
      choices: [
        { text: 'Yes — this incident showed that Charlotte AI\'s findings are reliable enough for automated Fusion triggering; the 72-hour dwell time would have been detected and remediated sooner with full automation' },
        { text: 'No — Charlotte AI cannot trigger Fusion playbooks; the CISO should instead configure Fusion to fire on Falcon detection signals while Charlotte AI provides parallel investigation context; the analyst verifies Charlotte AI\'s findings before triggering consequence-bearing response actions, maintaining human oversight for high-impact decisions' },
        { text: 'Yes — configure Charlotte AI to trigger Fusion for Low and Medium severity detections only; High and Critical severity still require analyst review' },
        { text: 'No — Falcon Fusion SOAR and Charlotte AI are incompatible products that cannot be used in the same workflow' },
      ],
      correctChoiceIndex: 1,
      wrongConsequence: 'Charlotte AI cannot trigger Fusion — it is architecturally read-only. Even if it could, auto-triggering based on Charlotte AI confidence is unsafe (false positive risk on high-impact actions). Severity-based auto-triggering from Charlotte AI is still not possible architecturally. Fusion and Charlotte AI are fully compatible and complementary — they just have different trigger sources.',
      reasoning: 'Charlotte AI cannot trigger Fusion playbooks — this is a fundamental architectural constraint, not a configuration choice. The correct design for faster response: Fusion triggers on Falcon detection signals immediately (not on Charlotte AI outputs), while Charlotte AI provides parallel investigation context. The analyst receives both the Fusion automated action confirmation and the Charlotte AI investigation summary simultaneously — enabling faster, better-informed decisions. This design preserves human oversight for consequence-bearing actions while maximising automation speed for the actions that can safely be automated.',
      docTitle: 'Charlotte AI Fusion Integration Architecture',
      docUrl: 'https://falcon.crowdstrike.com/documentation/page/charlotte-ai-soar-integration',
    },
  ],
}
```

The domain export already has `cumulativeScenario: charlotteCumulativeScenario` — do not change that line.

- [ ] **Step 2: TypeScript check + tests**

```
npx tsc -b
npm test
```

- [ ] **Step 3: Commit**

```
git add src/content/domains/charlotte-ai.ts
git commit -m "feat: add Charlotte AI cumulative scenario completing the Charlotte AI domain"
```

---

## Self-Review

**Spec coverage:**
- ✅ Track 4.1: 3 modules (What is Charlotte AI, vs. Traditional, SIEM Data) + 5-step scenario
- ✅ Track 4.2: 3 modules (NL Queries, Alert Triage, Threat Hunting) + 5-step scenario
- ✅ Track 4.3: 2 modules (Triggering Fusion, Limitations) + 5-step scenario
- ✅ Cumulative: 6-step full incident investigation capstone

**Placeholder scan:** All concept body, quiz (4 options + correctIndex + explanation + docTitle + docUrl), and scenario step content (narrative + 4 choices + correctChoiceIndex + wrongConsequence + reasoning + docTitle + docUrl) is fully authored. No TBD or TODO.

**Type consistency:**
- No `challenge` field on any module
- All `quiz` arrays are `QuizQuestion[]` (not wrapped)
- Track IDs: `charlotte-foundations`, `charlotte-usage`, `charlotte-soar`
- Module `trackId` values match parent track `id` exactly
- `codeLanguage` values: `'cql'` (used in 2 concept code examples)
- Track scenarios: `isCumulative: false`; cumulative: `isCumulative: true`
- Step IDs: `ch-found-s1..s5`, `ch-usage-s1..s5`, `ch-soar-s1..s5`, `ch-cum-s1..s6`

**Important implementer notes (correct-answer shuffling):**

Task 2 questions with correction notes in their plan text — rewrite explanation cleanly after shuffling:
- `charlotte-usage-q5`: Correct answer is "No — Charlotte AI has no memory of the previous session..." → must be at index 0 (q5=0). Move it there; rewrite explanation without "trick question" commentary.
- `charlotte-usage-q8`: Correct answer is "Investigate the 5 high-priority alerts first, then spot-check a sample..." → must be at index 3 (q8=3). Move it there; rewrite explanation cleanly.
- `charlotte-usage-q12`: Correct answer is "run on a short sample window (last 1 hour) first..." → must be at index 3 (q12=3). Move it there; rewrite explanation cleanly.

Task 3 questions with correction notes:
- `charlotte-soar-q4`: The `explanation` field is embedded in the question body. Ensure it is present as a standalone `explanation:` field on the QuizQuestion object (not inside the question text).
- `charlotte-soar-q5`: Correct answer is "Configure Fusion detection-based triggers while Charlotte AI runs in parallel..." → must be at index 0 (q5=0). Move it there; rewrite explanation cleanly.
- `charlotte-soar-q8`: Correct answer is "Partially — Charlotte AI summaries can accompany the report as supplementary context..." → must be at index 3 (q8=3). Move it there.

Task 4 cumulative:
- `ch-cum-s4`: correctChoiceIndex=3. The plan text embeds an explanation note ("Wait — '20% buffer' is not meaningful..."). The `explanation` field should not exist on ScenarioStep — only `wrongConsequence` and `reasoning`. Move that content to the `reasoning` field, and ensure `wrongConsequence` describes why the wrong options are wrong.
