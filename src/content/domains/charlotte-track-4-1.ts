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
