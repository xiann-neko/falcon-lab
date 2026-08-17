import type {
  ContentModule,
  ContentTrack,
  QuizQuestion,
  ConceptSection,
  PlaybookChallenge,
  PlaybookStep,
  Scenario,
} from '../types'

// ═══════════════════════════════════════════════════════════════════════════════
// Track 2.3 — Playbook Design
// ═══════════════════════════════════════════════════════════════════════════════

// ── Module 2.3.1: Anatomy of a Production Playbook ────────────────────────────

const anatomyConcepts: ConceptSection[] = [
  {
    title: 'What Makes a Playbook "Production-Grade"?',
    body: 'A production-grade Fusion playbook is more than a working workflow — it is reliable, maintainable, and trustworthy enough to run without human supervision on live detections.\n\nKey properties:\n- **Idempotent:** running the playbook twice on the same event produces the same result without duplicate tickets, double-containments, or repeated notifications\n- **Scoped:** tight trigger conditions and condition filters ensure the playbook only fires on the events it was designed for — not every detection in the environment\n- **Documented:** purpose, owner, trigger scope, expected execution time, and escalation path are documented inside the playbook description or in a linked runbook\n- **Error-handled:** every action that can fail has defined error handling — continue, stop, or notify\n- **Tested:** the playbook has been validated in a test environment with representative events before production deployment',
  },
  {
    title: 'Structure: Purpose, Scope, and Escalation Path',
    body: 'Every production Fusion playbook should be designed with a clear three-part structure:\n\n**Purpose:** What problem does this playbook solve? What does it automate? Why does it exist? Write this in the playbook description in one or two sentences.\n\n**Scope:** Which events trigger this playbook, and which ones should NOT? Define this via tight trigger filters and conditions. Overly broad playbooks (e.g., all detections of any severity) create noise and risk unintended actions.\n\n**Escalation path:** What happens if the playbook cannot resolve the situation automatically? Define the fallback — paging a specific analyst, creating a high-priority ticket, or sending a dedicated alert — so nothing falls through the cracks.\n\nExample playbook description:\n```\nPlaybook: Auto-Contain Critical Ransomware Detections\nOwner: SOC Team (soc-team@example.com)\nTrigger: Detection — severity=Critical, tactic=Ransomware\nScope: Production hosts only (tag=production). Excludes lab and sandbox hosts.\nEscalation: If containment fails, page on-call via PagerDuty P1.\nLast reviewed: 2026-08-17\n```',
    codeExample: '// Playbook description template\n// Purpose: Auto-contain Critical ransomware detections on production hosts\n// Owner: SOC Team\n// Trigger: Detection — severity=Critical, tactic contains "Ransomware"\n// Scope: device.tags contains "production" (excludes lab/sandbox)\n// Escalation: containment failure → PagerDuty P1 page\n// Reviewed: 2026-08-17',
    codeLanguage: 'typescript',
  },
]

const anatomyQuestions: QuizQuestion[] = [
  {
    id: 'soar-pb-q1',
    text: 'What does "idempotent" mean in the context of a Fusion playbook?',
    options: [
      'Running the playbook twice on the same event produces the same result without creating duplicates or unintended effects',
      'The playbook can run simultaneously across multiple detections without performance degradation',
      'The playbook\'s actions are reversible — containment can be automatically undone',
      'The playbook runs independently without requiring human approval for any action',
    ],
    correctIndex: 0,
    explanation: 'Idempotency means multiple executions produce the same outcome as a single execution. In SOAR, this is critical because workflows can sometimes re-trigger (due to detection updates, retries, or testing). An idempotent playbook that creates tickets checks whether a ticket already exists before creating a new one, preventing duplicate P1 tickets for the same incident.',
    docTitle: 'Falcon Fusion Playbook Best Practices',
    docUrl: 'https://falcon.crowdstrike.com/documentation/page/falcon-fusion-playbook-design',
  },
  {
    id: 'soar-pb-q2',
    text: 'Why should production Fusion playbooks have "tight trigger conditions" rather than broad ones?',
    options: [
      'Broad conditions slow down Fusion — more trigger evaluations increase platform load',
      'Broad conditions cause the playbook to fire on unintended events — potentially containing hosts or creating tickets incorrectly',
      'Broad conditions require more complex action logic, making the playbook harder to maintain',
      'CrowdStrike licensing charges per trigger evaluation, so broad conditions increase cost',
    ],
    correctIndex: 1,
    explanation: 'Overly broad trigger conditions — such as "fire on all detections" — cause automation to act on events it was not designed for. This can lead to false-positive containments (isolating a production server for an Informational detection), unnecessary tickets, and alert fatigue. Tight conditions scope the playbook precisely to its intended scenario.',
    docTitle: 'Falcon Fusion Trigger Scoping',
    docUrl: 'https://falcon.crowdstrike.com/documentation/page/falcon-fusion-playbook-design',
  },
  {
    id: 'soar-pb-q3',
    text: 'A Fusion playbook creates a ServiceNow ticket automatically. To prevent duplicate tickets when the playbook re-triggers, what is the correct design pattern?',
    options: [
      'Set the playbook trigger to only fire once per detection by using a "fire once" flag in the trigger settings',
      'Use the Loop action with max iterations = 1 to prevent the ticket creation from running more than once',
      'Add a condition before ticket creation that checks if a ticket already exists for this detection (e.g., check for an existing ticket ID in the incident fields)',
      'Add an If/Else after ticket creation that stops the workflow if the ticket action ran',
    ],
    correctIndex: 2,
    explanation: 'The correct idempotency pattern is to check before acting — query for an existing ticket linked to this detection/incident before creating a new one. If a ticket already exists, skip creation. Fusion does not have a native "fire once" trigger flag. The Loop and If/Else patterns don\'t address re-triggering from the beginning of the workflow.',
    docTitle: 'Falcon Fusion Idempotency Patterns',
    docUrl: 'https://falcon.crowdstrike.com/documentation/page/falcon-fusion-playbook-design',
  },
  {
    id: 'soar-pb-q4',
    text: 'Which element of a production playbook defines what happens if the automation cannot resolve the situation (e.g., containment fails)?',
    options: [
      'The scope — limits which events trigger the playbook to avoid edge cases',
      'The error handler on each individual action — determines if the workflow continues or stops',
      'The trigger condition — scoping the trigger tightly prevents scenarios the playbook cannot handle',
      'The escalation path — defines the fallback action (page on-call, create high-priority ticket, send alert)',
    ],
    correctIndex: 3,
    explanation: 'The escalation path is the explicit plan for when automation fails or reaches its limits. It ensures that a failed playbook action does not silently drop the alert. An escalation path for containment failure might be: if Contain Host action fails → create high-priority Jira ticket + page on-call via PagerDuty. This closes the loop between automation and human response.',
    docTitle: 'Falcon Fusion Escalation Design',
    docUrl: 'https://falcon.crowdstrike.com/documentation/page/falcon-fusion-playbook-design',
  },
  {
    id: 'soar-pb-q5',
    text: 'What should be documented inside a production Fusion playbook\'s description field?',
    options: [
      'Purpose, owner, trigger scope, escalation path, and last review date',
      'Only the trigger conditions — the actions are self-documenting',
      'The full JSON payload structure of the trigger event',
      'A list of all analysts who approved the playbook design',
    ],
    correctIndex: 0,
    explanation: 'A playbook description should answer: what does this do (purpose), who is responsible (owner), when does it fire (trigger scope), what happens if it fails (escalation path), and when was it last validated (review date). This information allows any analyst to understand the playbook without reading every action configuration.',
    docTitle: 'Falcon Fusion Playbook Documentation',
    docUrl: 'https://falcon.crowdstrike.com/documentation/page/falcon-fusion-playbook-design',
  },
]

export const anatomyModule: ContentModule = {
  id: 'soar-playbook-anatomy',
  title: 'Anatomy of a Production Playbook',
  trackId: 'soar-playbook-design',
  domainId: 'soar',
  order: 1,
  lastReviewed: '2026-08-17',
  concepts: anatomyConcepts,
  quiz: anatomyQuestions,
}

// ── Module 2.3.2: Triage & Escalation Playbooks (with PlaybookChallenge) ──────

const triageConcepts: ConceptSection[] = [
  {
    title: 'Automated Triage: Enrich → Score → Route',
    body: 'The triage playbook is the most common SOAR pattern. Its goal is to automatically determine the severity and routing of an alert so analysts start working on the right alerts first.\n\nThe standard pattern is **Enrich → Score → Route:**\n\n1. **Enrich:** gather additional context not in the original detection — threat intelligence verdict, affected asset criticality, user risk score, historical activity\n2. **Score:** combine enrichment results to compute a composite severity or priority score (e.g., Critical TI verdict + High-value asset = P1; Critical TI + Low-value asset = P2)\n3. **Route:** act on the score — create the appropriately-prioritised ticket, assign to the correct team, and notify the right channel\n\nThis pattern removes the manual "is this important?" step from the analyst workflow — by the time an analyst picks up an alert, the triage is already done.',
  },
  {
    title: 'Escalation Logic and Communication',
    body: 'Escalation in a triage playbook defines who gets notified and how urgently, based on the computed score.\n\nCommon escalation patterns:\n- **P1 (Critical + High-value):** contain host immediately, page on-call analyst via PagerDuty, update incident to Critical, assign to Tier 3\n- **P2 (Critical + Low-value or High + High-value):** create High priority ticket, send Slack notification to #soc-alerts, assign to Tier 2\n- **P3 (Medium):** create Medium priority ticket, email daily digest, assign to Tier 1 queue\n- **P4 (Low/Informational):** log to SIEM dashboard, no ticket, no notification\n\nCommunication actions should include: detection details, enrichment results (TI verdict, asset owner), assigned ticket link, and direct Falcon link. Escalation should be automatic for P1 — analysts cannot miss Critical confirmed threats waiting in a queue.',
  },
]

const triagePlaybookSteps: PlaybookStep[] = [
  {
    id: 'soar-pb-challenge-step-1',
    label: 'Enrich with Threat Intelligence',
    action: 'Query CrowdStrike Threat Intelligence for the reputation of the detection\'s primary indicator (process hash or network IOC). Store the verdict (malicious / suspicious / unknown) for use in the scoring step.',
  },
  {
    id: 'soar-pb-challenge-step-2',
    label: 'Check Asset Criticality',
    action: 'Look up the affected device in the asset inventory lookup table. Retrieve the asset criticality tag (Critical / High / Standard / Low) to use in composite scoring.',
  },
  {
    id: 'soar-pb-challenge-step-3',
    label: 'Compute Priority Score',
    action: 'Evaluate TI verdict and asset criticality together using a Switch/Case condition: (malicious + Critical asset → P1), (malicious + High asset → P2), (suspicious + Critical asset → P2), (all other combinations → P3 or P4). Store the computed priority in a custom variable.',
  },
  {
    id: 'soar-pb-challenge-step-4',
    label: 'Create Prioritised Ticket',
    action: 'Create a ServiceNow incident with the computed priority, pre-filled with the detection name, TI verdict, asset owner, and affected host. Reference the ticket ID for the notification step.',
  },
  {
    id: 'soar-pb-challenge-step-5',
    label: 'Notify and Escalate',
    action: 'Branch on priority: P1 → page on-call via PagerDuty AND send Slack to #soc-critical. P2 → send Slack to #soc-alerts only. P3/P4 → no real-time notification (email digest). Include ticket ID and Falcon link in all notifications.',
  },
]

const triageChallenge: PlaybookChallenge = {
  type: 'playbook',
  id: 'soar-pb-challenge-triage',
  prompt: 'Arrange the following five playbook steps in the correct order for a Detection Triage & Escalation playbook. The playbook receives a Critical detection and must automatically determine priority and notify the right team.',
  scenario: 'A Critical severity detection has fired on a production host running your ERP system. Your triage playbook must automatically enrich the detection, score its priority, create the appropriate ticket, and notify the right team — all within 30 seconds of the detection firing, before any analyst touches it.',
  steps: triagePlaybookSteps,
  stepExplanations: [
    'Enrichment must come first — you need the TI verdict to compute the score. Without it, you cannot determine priority and all downstream routing is guesswork.',
    'Asset criticality is the second enrichment input needed for scoring. It must be gathered before the scoring step that combines both enrichment results.',
    'Scoring combines TI verdict (Step 1) and asset criticality (Step 2) — it cannot run until both inputs are available. The computed priority drives all downstream routing decisions.',
    'Ticket creation comes after scoring so the ticket priority reflects the computed score. Creating the ticket before scoring would require updating it after scoring, adding complexity.',
    'Notification is the final step because it references both the ticket ID (from Step 4) and the computed priority (from Step 3). Notifying before creating the ticket means the notification cannot include the ticket link.',
  ],
}

const triageQuestions: QuizQuestion[] = [
  {
    id: 'soar-pb-q6',
    text: 'What is the correct order of operations in an automated triage playbook?',
    options: [
      'Route → Enrich → Score (route immediately, then enrich for future reference)',
      'Enrich → Score → Route (notify and create ticket based on score)',
      'Score → Enrich → Route (compute score first, then gather context)',
      'Route → Score → Enrich (take action immediately while enrichment runs in parallel)',
    ],
    correctIndex: 1,
    explanation: 'Enrich first — gather the context needed for scoring (TI verdict, asset value). Score second — combine enrichment results into a priority. Route last — act based on the score. Routing before enrichment means acting on incomplete information. Scoring before enriching means you have no data to score.',
    docTitle: 'Falcon Fusion Triage Playbook Pattern',
    docUrl: 'https://falcon.crowdstrike.com/documentation/page/falcon-fusion-playbook-design',
  },
  {
    id: 'soar-pb-q7',
    text: 'In a triage playbook, a detection on a Critical-tagged production asset with a "malicious" TI verdict is computed as P1. What actions should P1 routing trigger?',
    options: [
      'Send Slack notification to #soc-alerts + create a Standard priority ticket',
      'Log the event to the SIEM dashboard and include in the next daily report',
      'Immediate host containment + PagerDuty page to on-call analyst + Critical incident ticket',
      'Assign to Tier 1 queue and wait for analyst triage during business hours',
    ],
    correctIndex: 2,
    explanation: 'P1 is the highest priority — a confirmed malicious indicator on a Critical asset. The response must be immediate: contain the host to stop the threat, page on-call so a human is engaged, and create a Critical ticket for tracking. Slack-only notification is insufficient for P1 — on-call paging ensures 24/7 human awareness. P1 alerts cannot wait for business hours.',
    docTitle: 'SOC Escalation Tiers',
    docUrl: 'https://falcon.crowdstrike.com/documentation/page/falcon-fusion-playbook-design',
  },
  {
    id: 'soar-pb-q8',
    text: 'Why should automated triage playbooks run their enrichment steps BEFORE creating a ticket?',
    options: [
      'Ticket creation locks the detection, preventing enrichment actions from running',
      'CrowdStrike Threat Intelligence requires an active ticket before it accepts enrichment queries',
      'Creating a ticket triggers a second workflow that conflicts with the triage playbook',
      'So the ticket is created with the correct priority and pre-filled context — avoiding a manual update after the fact',
    ],
    correctIndex: 3,
    explanation: 'If the ticket is created before enrichment completes, it is created with incorrect priority and missing context. The analyst would need to manually update the priority and add the enrichment notes — defeating the purpose of automation. Running enrichment first means the ticket is complete and correctly prioritised from the moment it is created.',
    docTitle: 'Falcon Fusion Playbook Sequencing',
    docUrl: 'https://falcon.crowdstrike.com/documentation/page/falcon-fusion-playbook-design',
  },
  {
    id: 'soar-pb-q9',
    text: 'A triage playbook\'s escalation step should include which information in the Slack P1 notification?',
    options: [
      'Detection name, TI verdict, affected asset, computed priority, ticket ID with link, and direct Falcon detection link',
      'Only the detection ID — analysts can find all other context by searching Falcon',
      'The full raw JSON payload from the trigger event',
      'A generic "P1 alert requires attention" message to avoid information overload',
    ],
    correctIndex: 0,
    explanation: 'P1 notifications interrupt the on-call analyst — they must be actionable immediately. Detection name, TI verdict, asset, priority, ticket link, and Falcon link let the analyst understand the situation and navigate to the right place without searching. Generic messages waste response time. Raw JSON is unreadable in a Slack message.',
    docTitle: 'SOC Notification Standards',
    docUrl: 'https://falcon.crowdstrike.com/documentation/page/falcon-fusion-playbook-design',
  },
  {
    id: 'soar-pb-q10',
    text: 'What is the value of automating the triage step (enrich → score → route) compared to having analysts triage manually?',
    options: [
      'Automated triage is more accurate than human triage in all cases',
      'It ensures consistent scoring across all detections and eliminates the manual "is this important?" step — analysts start work already knowing the priority and context',
      'Automated triage eliminates the need for Tier 1 analysts entirely',
      'Automated triage reduces the number of detections by filtering out false positives before analysts see them',
    ],
    correctIndex: 1,
    explanation: 'The key value of automated triage is consistency and speed. Human triage introduces variability — analysts apply different standards, may miss enrichment steps, and take minutes to hours. Automated triage applies the same rules to every detection in under a second, so analysts receive already-enriched, correctly-prioritised alerts and can focus on investigation and response instead of data gathering.',
    docTitle: 'SOAR Value Proposition',
    docUrl: 'https://falcon.crowdstrike.com/documentation/page/falcon-fusion-playbook-design',
  },
]

export const triageModule: ContentModule = {
  id: 'soar-playbook-triage-escalation',
  title: 'Triage & Escalation Playbooks',
  trackId: 'soar-playbook-design',
  domainId: 'soar',
  order: 2,
  lastReviewed: '2026-08-17',
  concepts: triageConcepts,
  quiz: triageQuestions,
  challenge: triageChallenge,
}

// ── Module 2.3.3: Remediation & Containment Playbooks ────────────────────────

const remediationConcepts: ConceptSection[] = [
  {
    title: 'Containment Actions and Safe Automation',
    body: 'Containment and remediation playbooks take direct action on the environment — making them the most powerful and most risky playbooks in the SOAR library. The core question for every response action is: **should this be fully automated, or does it require human approval?**\n\nActions safe for full automation (low blast radius, easily reversed):\n- Network Containment: Falcon maintains the sensor connection; containment is reversible in seconds\n- Blocking a newly discovered malicious indicator: adds to a block list with no host disruption\n- Sending a notification: zero risk of unintended impact\n\nActions that typically require human approval (high blast radius or difficult to reverse):\n- Deleting files (cannot be undone if incorrectly targeted)\n- Disabling user accounts (disrupts legitimate work if wrong account)\n- Terminating processes on production servers (may impact running services)\n- Re-imaging a host (lengthy and disruptive)\n\nFor high-risk actions, use Fusion\'s Approval action — pause the workflow, send an approval request to a senior analyst, and only proceed if explicitly approved.',
  },
  {
    title: 'Rollback and Recovery Patterns',
    body: 'Every automated containment action should have a documented recovery procedure. Automation at scale increases the risk of acting on false positives — a host contained incorrectly must be released quickly.\n\n**Network Containment release:** In Falcon, containment can be released from the device detail page or via RTR. A release workflow (triggered manually or on incident closure) can automate this.\n\n**Indicator block rollback:** Blocked indicators can be removed from the Custom IOA or network containment list. Document which workflow added the block so it can be quickly identified and removed if needed.\n\n**Account recovery:** If the playbook disabled an account and the detection is confirmed false positive, the account must be re-enabled in Active Directory or the identity provider. Automate the re-enable step in a recovery workflow triggered by an analyst\'s "False Positive" incident closure.\n\nDocument the rollback procedure in the playbook description. Analysts under pressure during a false-positive incident need to find the recovery steps immediately.',
  },
]

const remediationQuestions: QuizQuestion[] = [
  {
    id: 'soar-pb-q11',
    text: 'Which of the following response actions is safest to fully automate in a Falcon Fusion playbook (without human approval)?',
    options: [
      'Deleting suspicious files from the host — directly removes potential threats',
      'Disabling the affected user\'s account in Active Directory',
      'Network Containment — isolates the host while keeping the Falcon sensor connected; fully reversible',
      'Terminating a process identified as malicious on a production database server',
    ],
    correctIndex: 2,
    explanation: 'Network Containment is the safest automated response because: the Falcon sensor remains connected (analysts can still run RTR commands), it is fully reversible in seconds from the Falcon console, and its blast radius is limited to the one contained host. File deletion, account disabling, and process termination on production systems carry higher risk of business impact and are harder to reverse.',
    docTitle: 'Falcon Fusion Response Action Safety',
    docUrl: 'https://falcon.crowdstrike.com/documentation/page/falcon-fusion-playbook-design',
  },
  {
    id: 'soar-pb-q12',
    text: 'When should a Falcon Fusion remediation playbook use an Approval action instead of executing automatically?',
    options: [
      'When the detection severity is below High — low-severity actions always need approval',
      'When the playbook has been running for more than 30 days without a review',
      'When the affected host is a workstation — servers can be acted on automatically',
      'When the action has a high blast radius or is difficult to reverse — such as deleting files, disabling accounts, or re-imaging a host',
    ],
    correctIndex: 3,
    explanation: 'Approval actions are for high-risk steps where the cost of a false positive is high — deleting the wrong file, disabling the wrong account, or re-imaging the wrong server can cause significant business disruption. Adding an Approval step pauses the workflow, notifies a senior analyst, and only proceeds with their explicit sign-off. Severity and host type alone don\'t determine whether approval is needed — the blast radius of the specific action does.',
    docTitle: 'Falcon Fusion Approval Actions',
    docUrl: 'https://falcon.crowdstrike.com/documentation/page/falcon-fusion-playbook-design',
  },
  {
    id: 'soar-pb-q13',
    text: 'A Fusion playbook contained a host that turned out to be a false positive. The host owner reports the device is unreachable and business operations are affected. What is the fastest path to restore connectivity?',
    options: [
      'Release containment from the Falcon device detail page or via an RTR command through the Falcon sensor (which remains connected during containment)',
      'Reinstall the Falcon sensor on the host to restore normal network connectivity',
      'Wait for the Fusion playbook to automatically reverse the containment after 1 hour',
      'Contact CrowdStrike support to remotely release the containment',
    ],
    correctIndex: 0,
    explanation: 'Falcon\'s Network Containment keeps the sensor connection active even while the host is isolated. This means an analyst can release containment in seconds from the Falcon console (Device detail → Release Containment) or by sending an RTR command. The reversal is immediate. Reinstalling the sensor is not required and does not help. Fusion has no automatic reversal timer. CrowdStrike support is unnecessary for a customer-initiated containment.',
    docTitle: 'Falcon Network Containment Release',
    docUrl: 'https://falcon.crowdstrike.com/documentation/page/network-containment',
  },
  {
    id: 'soar-pb-q14',
    text: 'Where should the rollback procedure for a containment playbook be documented?',
    options: [
      'In a separate internal wiki page linked from the playbook',
      'In the playbook\'s description field — so any analyst can find recovery steps immediately during a false-positive incident',
      'In the Falcon incident notes attached to the triggered detection',
      'Rollback procedures are unnecessary — Falcon Fusion actions are always reversible automatically',
    ],
    correctIndex: 1,
    explanation: 'The playbook description is the first place an analyst looks when investigating a playbook\'s actions. Inline documentation of the rollback procedure means recovery steps are immediately accessible without navigating to a separate system. During a high-pressure false-positive situation, every extra click and search costs time.',
    docTitle: 'Falcon Fusion Playbook Documentation',
    docUrl: 'https://falcon.crowdstrike.com/documentation/page/falcon-fusion-playbook-design',
  },
  {
    id: 'soar-pb-q15',
    text: 'An analyst closes a Falcon incident as "False Positive". A recovery workflow should automatically do which of the following?',
    options: [
      'Delete the incident from Falcon to remove the false positive from reporting metrics',
      'Trigger a new investigation workflow to find the root cause of the false positive',
      'Release host containment and re-enable any accounts or blocks that were applied by the triage playbook for this incident',
      'Notify CrowdStrike of the false positive to improve detection accuracy',
    ],
    correctIndex: 2,
    explanation: 'When an incident is confirmed False Positive, all automated response actions should be reversed — release containment, re-enable accounts, remove indicator blocks. A recovery workflow triggered by Incident status → "False Positive" can automate this cleanup. Deleting incidents removes audit history. Root cause investigation and CrowdStrike notification are manual judgment calls, not automated steps.',
    docTitle: 'Falcon Fusion Recovery Workflows',
    docUrl: 'https://falcon.crowdstrike.com/documentation/page/falcon-fusion-playbook-design',
  },
]

export const remediationModule: ContentModule = {
  id: 'soar-playbook-remediation',
  title: 'Remediation & Containment Playbooks',
  trackId: 'soar-playbook-design',
  domainId: 'soar',
  order: 3,
  lastReviewed: '2026-08-17',
  concepts: remediationConcepts,
  quiz: remediationQuestions,
}

// ── Track 2.3 Scenario ────────────────────────────────────────────────────────

const playbookScenario: Scenario = {
  id: 'soar-playbook-scenario',
  title: 'Playbook Design Review: Production-Readiness Assessment',
  context: 'Your organisation has built four Falcon Fusion playbooks over the past quarter. Before a planned audit, you are asked to review each playbook for production-readiness issues. Your review must identify design problems, propose fixes, and determine which playbooks are safe to keep running vs. which must be immediately disabled.',
  isCumulative: false,
  steps: [
    {
      id: 'soar-pb-s1',
      narrative: 'Playbook 1: "Auto-Contain All Detections". Trigger: ANY detection, no conditions. Action: Contain Host immediately. Description: none. What is your assessment?',
      choices: [
        { text: 'DISABLE immediately — no conditions means Informational/Low detections trigger host containment, causing massive operational disruption. Must be rebuilt with tight trigger conditions.' },
        { text: 'Approve as-is — broad coverage ensures no threats are missed.' },
        { text: 'Approve with minor documentation update — add a description to explain the broad scope.' },
        { text: 'Test in production for 24 hours to assess actual impact before deciding.' },
      ],
      correctChoiceIndex: 0,
      wrongConsequence: 'Approving broad automated containment without any conditions risks containing hundreds of production hosts for Informational detections that require no response. Testing in production with a known-bad playbook means 24 hours of potential false-positive containments. A description does not fix the logic problem.',
      reasoning: 'An unconditioned containment playbook firing on all detections violates the core principle of tight trigger scope. Informational and Low detections are common — this playbook would contain dozens of production hosts per day for events that pose no real threat. Disable immediately and rebuild with severity = Critical/High and production host tag conditions.',
      docTitle: 'Falcon Fusion Playbook Scoping',
      docUrl: 'https://falcon.crowdstrike.com/documentation/page/falcon-fusion-playbook-design',
    },
    {
      id: 'soar-pb-s2',
      narrative: 'Playbook 2: "Critical Detection Triage". Trigger: Detection severity=Critical. Steps: (1) Create ServiceNow ticket with detection details, (2) Enrich with TI, (3) Page on-call if TI=malicious. What design flaw do you identify?',
      choices: [
        { text: 'The playbook correctly creates the ticket first to immediately track the detection, then enriches for additional context.' },
        { text: 'Step 1 creates the ticket before enrichment — the ticket will have wrong priority and no TI verdict. Reorder to: TI enrichment first, then create ticket with enriched context.' },
        { text: 'The on-call paging threshold (TI=malicious) is too high — page for all Critical detections regardless of TI verdict.' },
        { text: 'The playbook is missing a loop — it should contain all hosts linked to the Critical detection.' },
      ],
      correctChoiceIndex: 1,
      wrongConsequence: 'Creating a ticket before enrichment is not "correct" — the ticket lacks the TI verdict that determines whether this should be P1 or P2. The analyst assigned to the ticket has to manually add this context. Paging for all Critical detections without TI validation would generate excessive on-call pages. A loop for containment is a separate concern.',
      reasoning: 'The Enrich → Score → Route pattern requires enrichment to run BEFORE ticket creation. The ticket priority and pre-filled context should reflect the TI verdict. A ticket created before enrichment is incomplete — it has to be manually updated afterward, defeating the automation value.',
      docTitle: 'Triage Playbook Sequencing',
      docUrl: 'https://falcon.crowdstrike.com/documentation/page/falcon-fusion-playbook-design',
    },
    {
      id: 'soar-pb-s3',
      narrative: 'Playbook 3: "Malware Remediation". Trigger: Detection TI=malicious. Steps: (1) Contain host, (2) Delete all files in the detection\'s process directory, (3) Disable the user\'s AD account. No approval step. What is your assessment?',
      choices: [
        { text: 'Approve — confirmed malicious TI justifies full automated remediation without delays.' },
        { text: 'Approve with monitoring — watch the execution log for 48 hours and disable if false positives appear.' },
        { text: 'DISABLE immediately — steps 2 and 3 are high-risk, irreversible actions that must not run without human approval. Rebuild with an Approval action before file deletion and account disabling.' },
        { text: 'Remove only the account-disabling step — file deletion is safe to automate for confirmed malicious detections.' },
      ],
      correctChoiceIndex: 2,
      wrongConsequence: 'TI verdicts are not infallible — false positives occur. Automatically deleting files and disabling accounts based on a TI match risks deleting legitimate files and locking out valid users. 48-hour monitoring means the playbook runs uncontrolled while you watch. File deletion is NOT safe without approval — it is irreversible.',
      reasoning: 'File deletion and account disabling are high-risk, difficult-to-reverse actions. Even with a malicious TI verdict, a false positive is possible. These actions require an Approval action that pauses the workflow and sends a senior analyst a review request. Host containment (Step 1) is safe to automate — Steps 2 and 3 are not.',
      docTitle: 'Falcon Fusion High-Risk Action Design',
      docUrl: 'https://falcon.crowdstrike.com/documentation/page/falcon-fusion-playbook-design',
    },
    {
      id: 'soar-pb-s4',
      narrative: 'Playbook 4: "Incident Auto-Close". Trigger: Incident created, severity=Low. Action: Immediately close the incident as False Positive. Description: "Auto-close low severity." Owner: unknown. What is the critical governance problem?',
      choices: [
        { text: 'The description is too short — expand it to explain the auto-close logic.' },
        { text: 'The unknown owner is the primary problem — assign an owner and it can continue running.' },
        { text: 'Auto-closing Low incidents is a valid operational efficiency — analysts should focus on High/Critical only.' },
        { text: 'The playbook auto-closes Low incidents as False Positive without any validation — hiding real Low-severity threats. Must be disabled and rebuilt with validation logic before any auto-closure.' },
      ],
      correctChoiceIndex: 3,
      wrongConsequence: 'A short description is a documentation issue but not the critical problem. An unknown owner is a governance problem but does not make the logic safe. Auto-closing Low incidents is not inherently valid — Low severity detections can still represent real threats that require awareness, even if not immediate response.',
      reasoning: 'Auto-closing incidents as False Positive without any investigation logic is dangerous — it systematically hides real threats. Low severity does not mean harmless. Legitimate low-severity detections (reconnaissance, early-stage enumeration) become invisible when auto-closed. This playbook must be disabled immediately. Rebuilding it would require validating that TI verdict is clean, host has no prior detections, and no analyst has flagged it before any auto-closure.',
      docTitle: 'Falcon Fusion Auto-Close Risks',
      docUrl: 'https://falcon.crowdstrike.com/documentation/page/falcon-fusion-playbook-design',
    },
    {
      id: 'soar-pb-s5',
      narrative: 'After the audit, you recommend disabling 3 of 4 playbooks and rebuilding them. Your manager asks: "What process changes prevent this from happening again?" Which answer is most complete?',
      choices: [
        { text: 'Require design review before enabling new playbooks, mandate documentation (purpose/scope/owner/escalation), test in a non-production environment first, and schedule quarterly playbook reviews with assigned owners' },
        { text: 'Add a monitoring dashboard that tracks playbook execution counts — high counts indicate over-broad triggers' },
        { text: 'Restrict playbook creation to Tier 3 analysts only — junior analysts should not have Fusion write access' },
        { text: 'Run all new playbooks in simulation mode for 7 days before enabling real actions' },
      ],
      correctChoiceIndex: 0,
      wrongConsequence: 'Execution-count monitoring catches symptoms but not root causes — it doesn\'t prevent bad playbook design from going live. Access restriction doesn\'t prevent Tier 3 analysts from making the same mistakes. Simulation mode is useful but doesn\'t replace design review, documentation standards, or ongoing governance.',
      reasoning: 'A governance framework that prevents recurrence must address all four failure modes found in the audit: no design review (Playbook 1/2/3/4 logic flaws), no documentation (Playbook 4 no description/owner), no testing (Playbooks 1-3 deployed without non-production validation), and no ongoing review (stale playbooks accumulate). All four controls are needed together.',
      docTitle: 'SOAR Playbook Governance',
      docUrl: 'https://falcon.crowdstrike.com/documentation/page/falcon-fusion-playbook-design',
    },
  ],
}

// ── Track 2.3 Export ──────────────────────────────────────────────────────────

export const playbookDesignTrack: ContentTrack = {
  id: 'soar-playbook-design',
  title: 'Playbook Design',
  domainId: 'soar',
  order: 3,
  modules: [anatomyModule, triageModule, remediationModule],
  scenario: playbookScenario,
}
