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
      'Configure Fusion detection-based triggers (e.g., LSASS access, malicious macro) to fire immediately while analysts use Charlotte AI in parallel to investigate scope — Fusion handles automated containment and notification at machine speed; Charlotte AI builds investigation context simultaneously; the analyst merges both to make the escalation decision',
      'Configure Fusion to auto-trigger containment playbooks immediately upon any Charlotte AI "High" confidence finding without analyst review',
      'Replace Charlotte AI with Fusion for all detection workflows — Fusion\'s automated playbooks are faster than AI-assisted investigation',
      'Use Charlotte AI to generate Fusion playbooks dynamically for each incident — AI-generated playbooks are faster to write than manually configured ones',
    ],
    correctIndex: 0,
    explanation: 'The MTTR-reducing strategy is to configure Fusion to fire immediately on Falcon detection signals (not Charlotte AI outputs) for automated containment, while Charlotte AI runs in parallel for scope investigation. The analyst receives both the Fusion containment confirmation and the Charlotte AI scope summary simultaneously — making a faster, more informed escalation decision than either tool alone. Charlotte AI should never directly trigger Fusion without analyst review because it can produce false positives that, if directly triggering containment, would take down legitimate business systems.',
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
      'No — Charlotte AI\'s AI-generated text is not admissible evidence in any regulatory context and must not be included in compliance reports',
      'Yes — Charlotte AI provides an auditable query log that regulators accept as primary evidence',
      'Partially — Charlotte AI summaries can accompany the report as supplementary context, but raw LogScale event exports and the Falcon detection record are the auditable primary evidence',
    ],
    correctIndex: 3,
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
      correctChoiceIndex: 2,
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
      wrongConsequence: 'There is no 95% threshold above which false positives are eliminated — Charlotte AI confidence is not calibrated to false positive rates at that precision. Novel techniques can produce High confidence findings when they resemble known patterns. Charlotte AI is fully capable of producing High confidence findings on novel activity.',
      reasoning: 'Charlotte AI confidence scores are not a safe Fusion trigger even at "High." Charlotte AI can generate High confidence false positives when legitimate business tools generate process behaviour that strongly resembles known malware. Additionally, a genuinely novel attack technique might produce a High confidence match to the closest known pattern even if it\'s not quite right. Auto-containment on Charlotte AI confidence without analyst verification is a design anti-pattern that will eventually take down legitimate business systems. The safe design: Fusion triggers on Falcon detection signals, Charlotte AI provides investigation context, analyst verifies before triggering containment.',
      docTitle: 'Charlotte AI Auto-Containment Risks',
      docUrl: 'https://falcon.crowdstrike.com/documentation/page/charlotte-ai-best-practices',
    },
    {
      id: 'ch-soar-s5',
      narrative: 'You are presenting the Charlotte AI + Fusion integration design to your CISO. They ask: "What is the one decision that should always require a human, never be automated?" What is your answer?',
      choices: [
        { text: 'Any response action with significant, difficult-to-reverse operational impact — network containment of critical systems, account lockouts for privileged accounts, data deletion — must always require human verification of Charlotte AI\'s findings before execution, because the cost of a wrong automated decision based on a Charlotte AI error exceeds the benefit of the speed gained by removing the human review step' },
        { text: 'Creating incident tickets — ticket creation should always require human review to ensure accuracy' },
        { text: 'Sending notification emails — automated notification emails are a compliance risk if they contain AI-generated content' },
        { text: 'No actions should require a human — full automation eliminates human error and should be the target state for all SOC operations' },
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
