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
      'Charlotte AI has no memory of the previous session — you must re-establish the investigation context by re-asking the relevant questions in the new session',
      'Charlotte AI recalls the previous session context and continues the investigation from the 3 suspicious destinations',
      'Charlotte AI prompts you to log in to restore your previous session\'s investigation thread',
      'Charlotte AI has a 24-hour session memory — the investigation context is available if the new session starts within 24 hours of the previous one',
    ],
    correctIndex: 0,
    explanation: 'Charlotte AI does not retain context across browser sessions. When a session closes, the conversation history and investigation context are lost. In a new session, Charlotte AI starts fresh with no knowledge of your previous questions or findings. For multi-session investigations, document your intermediate findings externally — in the escalation ticket, investigation notes, or a saved query — so you can re-establish context in the new session.',
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
      'Ask Charlotte AI to re-rank all 40 alerts by risk score before beginning any investigation — the initial ranking may have missed critical context',
      'Investigate the 5 high-priority alerts first, then spot-check a sample of the 35 low-priority ones to verify Charlotte AI\'s assessment before de-escalating any; never bulk-close alerts based solely on AI triage without any human verification',
    ],
    correctIndex: 3,
    explanation: 'The correct operational approach is to investigate the 5 high-priority alerts first, then spot-check a representative sample of the 35 low-priority alerts before bulk-closing any. Charlotte AI can under-score genuinely critical alerts because novel techniques, unusual patterns, or missing data context may not match its training data. Without human spot-checking, bulk-closing creates audit and coverage gaps that sophisticated attackers can exploit.',
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
      'Export the query to a CSV and review the raw CQL syntax offline before running it in the Falcon platform',
      'Check the number of results it would return on a sample window — run the query against the last 1 hour to verify field names are correct and the result volume is manageable before expanding to 7 days',
    ],
    correctIndex: 3,
    explanation: 'The most important first validation step is to run a short sample window test (1 hour). This verifies that Charlotte AI used the correct field names for your parser schema and shows whether the result volume is manageable before scaling to 7 days. This quick validation prevents running an incorrect or overly broad query at scale.',
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
    correctIndex: 2,
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
        { text: 'Ask Charlotte AI to automatically create and populate the escalation ticket in your ITSM system' },
        { text: 'Export all Charlotte AI conversation logs as a PDF and attach them to the ticket without editing' },
        { text: 'Skip the ticket update — containment is more urgent than documentation in the remaining 13 minutes' },
        { text: 'Ask Charlotte AI to generate a timeline summary of the investigation findings: initial detection, credential dumping, lateral movement targets, and current scope — then copy this into the ticket as your investigation narrative' },
      ],
      correctChoiceIndex: 3,
      wrongConsequence: 'Charlotte AI cannot integrate with external ITSM systems. Exporting raw AI conversation logs is low-quality documentation — the ticket needs structured findings, not a raw chat log. Skipping ticket documentation risks the escalation being rejected as incomplete, which forces you to redo the work later under more pressure.',
      reasoning: 'Asking Charlotte AI to generate a timeline summary of the investigation is the highest-efficiency documentation step. Charlotte AI has session context of everything you asked — it can produce a structured narrative (initial detection → credential dumping → lateral movement → current scope) that you copy-paste and lightly edit. This takes 2 minutes versus 10 minutes of manual writing, leaving you 11 minutes for containment actions.',
      docTitle: 'Charlotte AI Investigation Documentation',
      docUrl: 'https://falcon.crowdstrike.com/documentation/page/charlotte-ai-best-practices',
    },
    {
      id: 'ch-usage-s5',
      narrative: 'At 15:00 you update the ticket and trigger Network Containment on FIN-WORKSTATION-07 and FIN-SERVER-01. After the session ends, your manager asks for a hunting query to check if other workstations show similar mimikatz or LSASS access patterns from the last 7 days. What is the correct approach?',
      choices: [
        { text: 'Start a new Charlotte AI session and ask it to generate a hunting query for LSASS memory access patterns matching T1003.001 — review the generated CQL for correct field names, test on a 1-hour window first, then run it across 7 days' },
        { text: 'Use the investigation notes from the closed session — Charlotte AI has auto-saved a hunting query based on the session findings' },
        { text: 'The hunting query is not necessary — containment of the affected devices is sufficient response' },
        { text: 'Ask Charlotte AI in the same session to generate the hunting query before you close the browser' },
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
