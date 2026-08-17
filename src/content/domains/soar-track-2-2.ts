import type {
  ContentModule,
  ContentTrack,
  QuizQuestion,
  ConceptSection,
  Scenario,
} from '../types'

// ═══════════════════════════════════════════════════════════════════════════════
// Track 2.2 — Workflow Builder
// ═══════════════════════════════════════════════════════════════════════════════

// ── Module 2.2.1: Actions Library — Notifications, Enrichment, Response ───────

const actionsLibraryConcepts: ConceptSection[] = [
  {
    title: 'Notification Actions',
    body: 'Notification actions communicate workflow results and alerts to humans and systems:\n\n- **Send Email:** sends a message to one or more email addresses. Supports template variables for personalised, context-rich messages (e.g., include the detection name, severity, affected host).\n- **Send Slack/Teams message:** posts to a webhook-configured channel or room. Use for real-time SOC alerting — Slack/Teams notifications arrive faster than email for operational use.\n- **Create Ticket (ServiceNow/Jira):** creates an incident or task in your ITSM platform with enriched context pre-filled. Eliminates manual ticket creation for routine detections.\n\nBest practice: include the detection link, severity, and affected host in every notification so recipients have full context without logging into Falcon.',
    codeExample: '// Example Slack message template using Fusion variables\n// Message: "🚨 {{trigger.display_name}} | {{trigger.severity}} | Host: {{trigger.device.hostname}}"\n// Result: "🚨 Ransomware: STOP/DJVU | Critical | Host: WIN-DC-PROD-01"',
    codeLanguage: 'typescript',
  },
  {
    title: 'Enrichment and Response Actions',
    body: '**Enrichment actions** add context to a detection or incident by querying external sources:\n- **Threat Intelligence lookup:** query CrowdStrike Threat Intelligence for indicator reputation (IP, domain, hash)\n- **Identity enrichment:** look up the affected user in Active Directory or Falcon Identity Protection\n- **Sandbox analysis:** submit a suspicious file hash to the Falcon sandbox for detonation analysis\n- **WHOIS/GeoIP:** resolve an external IP to its owner and geographic location\n\n**Response actions** take direct action on the environment:\n- **Contain Host (Network Containment):** isolates the device from the network while keeping the Falcon sensor connected — the most common automated response action\n- **Run RTR Command:** executes a Real Time Response command on a host (get file, run script, kill process)\n- **Block Indicator:** adds an IP, domain, or hash to a Custom IOA or Network Containment block list\n- **Update Incident:** changes an incident\'s status, severity, or assigned analyst in Falcon',
  },
]

const actionsLibraryQuestions: QuizQuestion[] = [
  {
    id: 'soar-wf-q1',
    text: 'Which Falcon Fusion action isolates a compromised host from the network while keeping the Falcon sensor connection active?',
    options: [
      'Contain Host (Network Containment)',
      'Run RTR Command — shutdown network interfaces',
      'Block Indicator — block the host\'s IP address',
      'Update Incident — set status to Contained',
    ],
    correctIndex: 0,
    explanation: 'Network Containment is Falcon\'s native host isolation action. It cuts all network communications except the Falcon sensor connection to the cloud — so the host is isolated from attackers and the network, but Falcon can still execute RTR commands, collect evidence, and remove containment remotely when the investigation is complete.',
    docTitle: 'Falcon Fusion Actions — Network Containment',
    docUrl: 'https://falcon.crowdstrike.com/documentation/page/falcon-fusion-actions',
  },
  {
    id: 'soar-wf-q2',
    text: 'You want a Fusion workflow to automatically check whether a process hash from a detection is known-malicious using CrowdStrike intelligence. Which action type is correct?',
    options: [
      'Contain Host action — containment implicitly validates the hash reputation',
      'Threat Intelligence lookup enrichment action — query the hash against CrowdStrike Threat Intelligence',
      'RTR Command action — run a hash check script on the affected host',
      'Send Email action — email the hash to the threat intel team for manual review',
    ],
    correctIndex: 1,
    explanation: 'Threat Intelligence lookup is an enrichment action that queries CrowdStrike\'s indicator database for a given hash, IP, or domain. It returns a reputation verdict (malicious, suspicious, unknown) and supporting evidence that downstream conditions can use to branch the workflow — e.g., auto-contain if malicious, send alert if suspicious, no action if unknown.',
    docTitle: 'Falcon Fusion Enrichment Actions',
    docUrl: 'https://falcon.crowdstrike.com/documentation/page/falcon-fusion-actions',
  },
  {
    id: 'soar-wf-q3',
    text: 'What is the recommended best practice for Slack/Teams notification actions in a Fusion workflow?',
    options: [
      'Send only a generic "alert fired" message to keep notification size small',
      'Route all notifications to a single #general channel to ensure maximum visibility',
      'Include the detection name, severity, affected host, and a direct link to the detection in the message',
      'Use email instead of Slack/Teams for SOC alerting — email is more reliable',
    ],
    correctIndex: 2,
    explanation: 'Notifications are only useful if recipients have enough context to act on them. A message with the detection name, severity, hostname, and a direct Falcon link lets the analyst immediately understand the alert and jump to the correct place without logging in and searching. A generic "alert fired" message just adds noise.',
    docTitle: 'Falcon Fusion Notification Best Practices',
    docUrl: 'https://falcon.crowdstrike.com/documentation/page/falcon-fusion-actions',
  },
  {
    id: 'soar-wf-q4',
    text: 'A Fusion workflow needs to execute a PowerShell remediation script on a compromised host. Which action supports this?',
    options: [
      'Contain Host — containment includes script execution capability',
      'Block Indicator — scripts are deployed via indicator blocking',
      'Create Ticket — the ITSM ticket triggers the script via a webhook',
      'Run RTR Command — executes Real Time Response commands on the host',
    ],
    correctIndex: 3,
    explanation: 'Real Time Response (RTR) is CrowdStrike\'s remote shell capability. The Run RTR Command action lets a workflow execute commands, run scripts, kill processes, or retrieve files from a host — all through the Falcon sensor connection, even on a contained host. This is the correct mechanism for remote remediation.',
    docTitle: 'Falcon RTR Actions in Fusion',
    docUrl: 'https://falcon.crowdstrike.com/documentation/page/falcon-fusion-actions',
  },
  {
    id: 'soar-wf-q5',
    text: 'Which Fusion action type would you use to prevent a newly discovered malicious domain from being accessed by any Falcon-protected host?',
    options: [
      'Block Indicator — adds the domain to a network-level block list enforced across all Falcon agents',
      'Contain Host — containment blocks all external domains for the affected host',
      'Run RTR Command — push a hosts file update to block the domain locally',
      'Send Email — notify the firewall team to add a manual block rule',
    ],
    correctIndex: 0,
    explanation: 'The Block Indicator action adds an IP, domain, or hash to a Falcon Custom IOA or indicator block list. This policy is pushed to all Falcon-protected endpoints within minutes, preventing any host from communicating with the blocked indicator. Host containment only isolates one host. RTR hosts-file updates are host-specific and don\'t scale. Email to firewall team introduces manual delay.',
    docTitle: 'Falcon Fusion Block Indicator Action',
    docUrl: 'https://falcon.crowdstrike.com/documentation/page/falcon-fusion-actions',
  },
]

export const actionsLibraryModule: ContentModule = {
  id: 'soar-workflow-actions-library',
  title: 'Actions Library — Notifications, Enrichment, Response',
  trackId: 'soar-workflow-builder',
  domainId: 'soar',
  order: 1,
  lastReviewed: '2026-08-17',
  concepts: actionsLibraryConcepts,
  quiz: actionsLibraryQuestions,
}

// ── Module 2.2.2: Conditions, Branching & Loops ───────────────────────────────

const conditionsConcepts: ConceptSection[] = [
  {
    title: 'If/Else Conditions and Switch Branching',
    body: 'Conditions in Falcon Fusion evaluate payload fields or action results and route the workflow to different action paths based on the outcome.\n\n**If/Else:** the simplest branch — if a condition is true, take path A; if false, take path B. Example: if threat intelligence verdict = "malicious", contain the host; else, log the hash and continue.\n\n**Switch/Case:** for multiple mutually exclusive branches based on a single field value. Example: route on detection severity — Critical → contain and page; High → ticket and Slack; Medium → ticket only; Low → log only.\n\nCondition expressions use JSON-path syntax to reference payload fields: `trigger.severity == "Critical"` or `actions[0].result.verdict == "malicious"`. Conditions support logical operators: AND, OR, NOT.',
    codeExample: '// Conceptual switch on detection severity\n// Critical  → Contain Host + Page On-Call + Create P1 Ticket\n// High      → Create P2 Ticket + Slack #soc-alerts\n// Medium    → Create P3 Ticket\n// (default) → Log event only',
    codeLanguage: 'typescript',
  },
  {
    title: 'Loops: Iterating Over Lists of Items',
    body: 'Fusion\'s Loop action iterates over an array of items and executes a set of actions for each element. Common use cases:\n- Contain multiple hosts linked to one incident (loop over the incident\'s device list)\n- Enrich a list of indicators extracted from a threat report\n- Send individual notifications for each affected user in a credential breach\n\n**Loop configuration:**\n- **Input array:** the list to iterate over (from trigger payload or a previous action result)\n- **Loop body actions:** what to execute per item (can be any action or sub-workflow)\n- **Max iterations:** a safety limit to prevent runaway loops (e.g., 100 max)\n- **Error handling:** continue-on-error or stop-on-error per iteration\n\n**Important:** Loop bodies run sequentially by default. For large lists, consider the performance impact — a loop over 100 hosts with a 2-second containment action takes ~200 seconds.',
  },
]

const conditionsQuestions: QuizQuestion[] = [
  {
    id: 'soar-wf-q6',
    text: 'In Falcon Fusion, which workflow construct should you use when you need to route execution to one of FOUR different paths based on the detection severity value?',
    options: [
      'Multiple If/Else blocks — one for each severity level',
      'Switch/Case — evaluates one field against multiple values and routes to the matching case',
      'Loop — iterate over severity levels until the matching one is found',
      'Condition — a single true/false condition handles multiple values',
    ],
    correctIndex: 1,
    explanation: 'Switch/Case is the correct construct when routing on multiple values of a single field. It produces cleaner, more readable workflows than nested If/Else chains. Each case maps to a severity value (Critical, High, Medium, Low) with its own action branch — exactly matching the multi-path routing need.',
    docTitle: 'Falcon Fusion Conditions and Branching',
    docUrl: 'https://falcon.crowdstrike.com/documentation/page/falcon-fusion-conditions',
  },
  {
    id: 'soar-wf-q7',
    text: 'A Fusion workflow needs to contain all hosts linked to a Critical incident. The incident may have 1–15 affected devices. Which construct handles this correctly?',
    options: [
      'Parallel actions — add up to 15 parallel Contain Host actions, one per potential host',
      'A single Contain Host action — it automatically contains all linked devices',
      'Loop — iterate over the incident\'s device list and run Contain Host for each device',
      'Condition — check each device ID sequentially with nested If/Else conditions',
    ],
    correctIndex: 2,
    explanation: 'A Loop iterates over the incident\'s device array and executes Contain Host for each entry — handling 1 device or 15 with the same workflow. Adding 15 parallel static actions only works if exactly 15 devices are always affected. A single Contain Host action targets one device ID, not a list.',
    docTitle: 'Falcon Fusion Loop Action',
    docUrl: 'https://falcon.crowdstrike.com/documentation/page/falcon-fusion-conditions',
  },
  {
    id: 'soar-wf-q8',
    text: 'What is the purpose of setting a "max iterations" limit on a Fusion Loop action?',
    options: [
      'To control how fast the loop runs (iterations per second)',
      'To set the maximum number of errors before the loop stops',
      'To limit the number of parallel branches inside the loop body',
      'To prevent runaway loops — if the input list is unexpectedly large, the limit stops the loop from running indefinitely',
    ],
    correctIndex: 3,
    explanation: 'The max iterations safety limit protects against runaway loops caused by unexpectedly large input lists — for example if an action returns an array of thousands of items instead of the expected dozens. The loop processes up to the limit and stops, preventing the workflow from running for hours or causing rate-limit issues.',
    docTitle: 'Falcon Fusion Loop Safety Limits',
    docUrl: 'https://falcon.crowdstrike.com/documentation/page/falcon-fusion-conditions',
  },
  {
    id: 'soar-wf-q9',
    text: 'You want a Fusion workflow to contain a host only if a threat intelligence lookup returns "malicious". Which construct implements this logic?',
    options: [
      'If/Else condition — if actions[threatIntelLookup].verdict == "malicious", execute Contain Host; else skip',
      'Switch/Case — route on the verdict value to the Contain Host action',
      'Loop — iterate until a malicious verdict is found',
      'A second trigger — trigger a containment workflow when the verdict is malicious',
    ],
    correctIndex: 0,
    explanation: 'If/Else is the correct construct for a binary decision — malicious → contain, not malicious → no containment. The condition references the threat intel action result using its output path. Switch/Case works too but is overkill for a binary decision. Loops and second triggers are wrong patterns for this requirement.',
    docTitle: 'Falcon Fusion If/Else Conditions',
    docUrl: 'https://falcon.crowdstrike.com/documentation/page/falcon-fusion-conditions',
  },
  {
    id: 'soar-wf-q10',
    text: 'A Fusion Loop is iterating over 50 hosts to contain them. Host 23 returns an error (the host is offline). What should "error handling" be set to in order to continue containing the remaining hosts?',
    options: [
      '"Stop on error" — the loop halts at host 23 to prevent cascading failures',
      '"Continue on error" — the loop proceeds to host 24 even if host 23 failed',
      'No configuration needed — Fusion automatically retries failed iterations before continuing',
      'Use a separate error trigger to restart the loop from host 24',
    ],
    correctIndex: 1,
    explanation: '"Continue on error" tells the loop to log the failure for host 23 and proceed to host 24. For containment workflows, you want to contain as many hosts as possible even if individual containment operations fail — skipping a host entirely is worse than logging the failure and moving on. "Stop on error" would leave hosts 24-50 uncontained.',
    docTitle: 'Falcon Fusion Loop Error Handling',
    docUrl: 'https://falcon.crowdstrike.com/documentation/page/falcon-fusion-conditions',
  },
]

export const conditionsModule: ContentModule = {
  id: 'soar-workflow-conditions-branching',
  title: 'Conditions, Branching & Loops',
  trackId: 'soar-workflow-builder',
  domainId: 'soar',
  order: 2,
  lastReviewed: '2026-08-17',
  concepts: conditionsConcepts,
  quiz: conditionsQuestions,
}

// ── Module 2.2.3: Variables, Templates & Data Passing ────────────────────────

const variablesConcepts: ConceptSection[] = [
  {
    title: 'Payload Variables and Custom Variables',
    body: '**Payload variables** access data from the triggering event and from action outputs. They use a dot-path syntax:\n- `{{trigger.device.hostname}}` — the hostname from a Detection trigger\n- `{{trigger.severity}}` — detection severity\n- `{{actions.threatIntel.verdict}}` — the verdict returned by a previous Threat Intelligence action\n- `{{actions.createTicket.ticket_id}}` — the ticket ID created by a ServiceNow action\n\n**Custom variables** are user-defined values set within the workflow for intermediate storage:\n- Counters: track how many containment actions succeeded in a loop\n- Flags: mark whether a particular branch was taken (e.g., `wasContained = true`)\n- Computed values: store the result of a calculation or string concatenation for reuse\n\nCustom variables are scoped to the workflow execution — they reset on each new execution.',
  },
  {
    title: 'Templates for Dynamic Content',
    body: 'Templates let you build dynamic strings by embedding variable references in text. Fusion uses a `{{variable}}` syntax. Templates are used in:\n- Email and Slack message bodies\n- ServiceNow ticket descriptions\n- RTR command arguments\n- Condition expression values\n\nExample email template:\n```\nSubject: [{{trigger.severity}}] Detection on {{trigger.device.hostname}}\nBody:\nA {{trigger.severity}} detection was triggered on {{trigger.device.hostname}} \nat {{trigger.created_timestamp}}.\n\nDetection: {{trigger.display_name}}\nThreat Intel: {{actions.threatIntel.verdict}}\nTicket: {{actions.createTicket.ticket_id}}\n\nReview in Falcon: {{trigger.falcon_url}}\n```\n\nMalformed variable references (typos, wrong path) silently produce empty strings — always test templates with a real trigger payload before enabling in production.',
    codeExample: '// Template for a Slack notification message\n// "🚨 *{{trigger.severity}}* detection: {{trigger.display_name}}\\n"\n// "Host: {{trigger.device.hostname}} | TI verdict: {{actions.threatIntel.verdict}}\\n"\n// "Ticket: {{actions.createTicket.ticket_id}} | <{{trigger.falcon_url}}|View in Falcon>"',
    codeLanguage: 'typescript',
  },
]

const variablesQuestions: QuizQuestion[] = [
  {
    id: 'soar-wf-q11',
    text: 'In Falcon Fusion, how do you reference the hostname of the device from a Detection trigger in a downstream action?',
    options: [
      'DEVICE_HOSTNAME — Fusion automatically substitutes this reserved keyword',
      'Run a "Get Device" action first to retrieve the hostname, then reference its output',
      '{{trigger.device.hostname}} — dot-path template variable referencing the trigger payload field',
      'The hostname is not available in workflow templates — only the device ID is passed',
    ],
    correctIndex: 2,
    explanation: 'Fusion uses {{variable.path}} template syntax to reference payload fields. Detection triggers include a device object with hostname, device_id, site, OS, and more. These are directly available in all downstream templates without any preliminary lookup action.',
    docTitle: 'Falcon Fusion Variables',
    docUrl: 'https://falcon.crowdstrike.com/documentation/page/falcon-fusion-variables',
  },
  {
    id: 'soar-wf-q12',
    text: 'A Fusion workflow uses a Loop to contain 10 hosts. You want to count how many containments succeeded for use in a final summary notification. How do you implement this?',
    options: [
      'Use a payload variable — {{trigger.contained_count}} auto-tracks containment successes',
      'Count the loop iterations — iterations always equal successes',
      'Run a separate "Get Containment Status" action after the loop completes',
      'Use a custom variable as a counter — increment it inside the loop body when a Contain Host action succeeds',
    ],
    correctIndex: 3,
    explanation: 'Custom variables are the correct tool for tracking loop-internal state like a success counter. Payload variables only reflect trigger data (fixed at the start of execution). Loop iterations do not always equal successes — some may error. A separate action after the loop would require querying each host\'s containment status individually.',
    docTitle: 'Falcon Fusion Custom Variables',
    docUrl: 'https://falcon.crowdstrike.com/documentation/page/falcon-fusion-variables',
  },
  {
    id: 'soar-wf-q13',
    text: 'What happens in Falcon Fusion when a template variable reference has a typo (e.g., {{trigger.device.hostnamme}} instead of {{trigger.device.hostname}})?',
    options: [
      'The malformed reference silently produces an empty string — the action runs but the field is blank',
      'Fusion raises a validation error and prevents the workflow from being saved',
      'The workflow execution fails at the action containing the typo',
      'Fusion substitutes the nearest matching variable name automatically',
    ],
    correctIndex: 0,
    explanation: 'Template variable resolution in Fusion is silent — an invalid path produces an empty string without halting execution. This means a typo in a ticket description or email body goes undetected until someone reviews the output and notices the blank field. Always validate templates with a test execution before enabling workflows in production.',
    docTitle: 'Falcon Fusion Template Validation',
    docUrl: 'https://falcon.crowdstrike.com/documentation/page/falcon-fusion-variables',
  },
  {
    id: 'soar-wf-q14',
    text: 'A workflow creates a ServiceNow ticket in step 2. Later steps need to reference the ticket\'s ID number. How is this accessed?',
    options: [
      'Via a trigger payload variable: {{trigger.ticket_id}}',
      'Via the action output variable: {{actions.createTicket.ticket_id}} (or the action\'s configured output name)',
      'Ticket IDs cannot be referenced in later steps — they are only visible in the Fusion execution log',
      'By running a "Get Ticket" action after the Create Ticket action to retrieve the ID',
    ],
    correctIndex: 1,
    explanation: 'When an action produces output (like a newly created ticket ID), Fusion stores it as an action output variable accessible via {{actions.actionName.outputField}}. This is the standard data passing pattern — each action\'s output becomes available to all subsequent steps in the workflow.',
    docTitle: 'Falcon Fusion Data Passing',
    docUrl: 'https://falcon.crowdstrike.com/documentation/page/falcon-fusion-variables',
  },
  {
    id: 'soar-wf-q15',
    text: 'Custom variables in a Fusion workflow are scoped to what?',
    options: [
      'The current workflow execution — they reset to their initial values on the next execution',
      'The workflow definition — they persist across all executions of the same workflow',
      'The Falcon organisation — they are shared across all workflows in the same CID',
      'The current loop iteration — they reset at the start of each loop',
    ],
    correctIndex: 0,
    explanation: 'Custom variables exist only for the duration of one workflow execution. When the next detection fires and the workflow runs again, custom variables start at their initial values. This stateless model ensures executions are independent and predictable — each run starts clean regardless of what previous runs did.',
    docTitle: 'Falcon Fusion Variable Scope',
    docUrl: 'https://falcon.crowdstrike.com/documentation/page/falcon-fusion-variables',
  },
]

export const variablesModule: ContentModule = {
  id: 'soar-workflow-variables-templates',
  title: 'Variables, Templates & Data Passing',
  trackId: 'soar-workflow-builder',
  domainId: 'soar',
  order: 3,
  lastReviewed: '2026-08-17',
  concepts: variablesConcepts,
  quiz: variablesQuestions,
}

// ── Track 2.2 Scenario ────────────────────────────────────────────────────────

const workflowScenario: Scenario = {
  id: 'soar-workflow-scenario',
  title: 'Workflow Debug: Fixing a Broken Automation',
  context: 'A senior analyst built a Falcon Fusion workflow six weeks ago. It was designed to: (1) enrich a Critical detection with threat intelligence, (2) contain the host if TI verdict is malicious, (3) create a ServiceNow P1 ticket with detection details, and (4) send a Slack notification. This morning, analysts noticed the workflow is running but the Slack messages are blank and the ServiceNow tickets are missing the hostname. You are assigned to find and fix all issues.',
  isCumulative: false,
  steps: [
    {
      id: 'soar-wf-s1',
      narrative: 'You open the Fusion execution log for the most recent run. It shows: TI lookup — SUCCESS; Contain Host — SUCCESS; Create Ticket — SUCCESS; Send Slack — SUCCESS. Yet the Slack message is blank. What is the most likely cause?',
      choices: [
        { text: 'The Slack message template contains malformed variable references that silently resolve to empty strings' },
        { text: 'The Slack action ran before the TI lookup completed, so the verdict was not yet available' },
        { text: 'Slack webhooks do not support template variables — you must hardcode all message text' },
        { text: 'The Slack channel was archived, causing messages to be discarded silently' },
      ],
      correctChoiceIndex: 0,
      wrongConsequence: 'All actions show SUCCESS in sequence, so ordering is not the issue. Slack webhooks fully support dynamic template content. An archived channel would cause the action to fail, not succeed silently. Silent empty-string resolution from malformed variables is the correct diagnosis.',
      reasoning: 'Fusion template variables that reference invalid paths silently produce empty strings — the action still "succeeds" (the webhook request was sent), but the message content is blank. The first step is to inspect the Slack action\'s message template and verify every {{variable}} reference against the actual trigger payload structure.',
      docTitle: 'Falcon Fusion Template Debugging',
      docUrl: 'https://falcon.crowdstrike.com/documentation/page/falcon-fusion-variables',
    },
    {
      id: 'soar-wf-s2',
      narrative: 'You inspect the Slack message template. The hostname variable is written as `{{trigger.device.host_name}}` but the correct field is `{{trigger.device.hostname}}` (no underscore). You also notice the ServiceNow ticket description uses `{{trigger.device.host_name}}` — causing the missing hostname issue too. What is the most efficient fix?',
      choices: [
        { text: 'Add a "Get Device" action before both actions to retrieve the hostname separately, avoiding the template variable entirely' },
        { text: 'Correct the typo in both the Slack template and the ServiceNow ticket template — change host_name to hostname in both actions' },
        { text: 'Create a custom variable at the start of the workflow that stores the hostname, then reference the custom variable in both templates' },
        { text: 'Fix only the Slack template — the ServiceNow issue is from a different root cause' },
      ],
      correctChoiceIndex: 1,
      wrongConsequence: 'Adding a "Get Device" action solves the issue but adds unnecessary latency and complexity when the data is already in the trigger payload. Creating a custom variable is a valid pattern but also adds steps that are not needed. Fixing only Slack leaves the ServiceNow issue unresolved.',
      reasoning: 'The root cause is identical in both places — a single typo in the variable path. Fix it at the source in both templates. The trigger payload already contains the correct hostname; no extra actions are needed. Correcting the path in both templates simultaneously is the simplest and most complete fix.',
      docTitle: 'Falcon Fusion Variables',
      docUrl: 'https://falcon.crowdstrike.com/documentation/page/falcon-fusion-variables',
    },
    {
      id: 'soar-wf-s3',
      narrative: 'After fixing the templates, you review the containment logic. The workflow contains hosts if TI verdict is "malicious". You notice the condition is: `actions.threatIntel.verdict == "Malicious"` (capital M). CrowdStrike Threat Intelligence returns `"malicious"` (lowercase). What is the impact and fix?',
      choices: [
        { text: 'The condition works correctly — Fusion conditions are case-insensitive by default' },
        { text: 'The condition sometimes fails — TI verdicts are inconsistently capitalised' },
        { text: 'The condition never evaluates to true — no hosts have been contained since the workflow was deployed. Fix: change to lowercase "malicious"' },
        { text: 'The containment still ran because the fallback else-branch contains by default' },
      ],
      correctChoiceIndex: 2,
      wrongConsequence: 'Fusion conditions are case-sensitive string comparisons. "Malicious" !== "malicious". The workflow has been deployed for six weeks with this bug — meaning zero automated containments have occurred during that time, despite potentially many malicious indicators being detected.',
      reasoning: 'String comparisons in Fusion are case-sensitive. "Malicious" (capital M) never matches "malicious" (lowercase) from the TI API. The fix is to match the exact casing returned by the API. This is a silent logic failure — the workflow ran successfully but the containment branch was never taken.',
      docTitle: 'Falcon Fusion Condition Syntax',
      docUrl: 'https://falcon.crowdstrike.com/documentation/page/falcon-fusion-conditions',
    },
    {
      id: 'soar-wf-s4',
      narrative: 'Fixing the condition to lowercase "malicious", you re-test with a simulated malicious detection. The TI lookup correctly returns "malicious", but the Contain Host action now fails with "Device ID not found". You check the template: the action uses `{{trigger.device.device_id}}`. What is the likely cause?',
      choices: [
        { text: 'Containment requires the device\'s serial number, not the device ID' },
        { text: 'The device was decommissioned between the detection and the containment action' },
        { text: 'Contain Host actions must be triggered by an Incident trigger, not a Detection trigger' },
        { text: 'The field name is wrong — check the actual Detection trigger payload structure to confirm the correct device ID field path' },
      ],
      correctChoiceIndex: 3,
      wrongConsequence: 'Containment uses the Falcon device_id (AID), not a serial number. The device being decommissioned is unlikely for a test detection on a known host. Contain Host works with any trigger type that provides a device ID.',
      reasoning: 'A "Device ID not found" error when the template looks correct usually indicates the variable path does not match the actual payload structure. Use Fusion\'s payload inspector (or the execution log\'s input data) to view the exact JSON of the trigger payload and find the correct path for the device identifier.',
      docTitle: 'Falcon Fusion Payload Inspection',
      docUrl: 'https://falcon.crowdstrike.com/documentation/page/falcon-fusion-variables',
    },
    {
      id: 'soar-wf-s5',
      narrative: 'After correcting all four issues (two template typos, one case-sensitive condition, one wrong device ID path), you re-enable the workflow and run a full test. All actions succeed and the Slack message shows correct content. What should you do before declaring the workflow production-ready?',
      choices: [
        { text: 'Document all four fixes with dates in the workflow description, test with two more real-world detection patterns, and set up a monitoring alert on workflow execution failures' },
        { text: 'Declare it production-ready immediately — a successful single test confirms the fixes are correct' },
        { text: 'Disable the workflow and rebuild it from scratch to ensure no hidden issues remain' },
        { text: 'Submit the fixes for peer review but keep the old broken workflow running in parallel as a backup' },
      ],
      correctChoiceIndex: 0,
      wrongConsequence: 'A single successful test covers only one detection pattern — additional tests with different severity levels, different device types, and a non-malicious TI result (to verify the else-branch) are needed. Rebuilding from scratch wastes time when the fixes are confirmed correct. Running the broken workflow in parallel creates duplicate containments.',
      reasoning: 'Four bugs were fixed — validating each fix requires testing the specific path it affects. Test the malicious branch (containment fires), the non-malicious branch (containment skipped), and verify the Slack/ServiceNow output includes correct content. Document fixes so future maintainers understand the workflow\'s history.',
      docTitle: 'Falcon Fusion Testing Best Practices',
      docUrl: 'https://falcon.crowdstrike.com/documentation/page/falcon-fusion-workflow',
    },
  ],
}

// ── Track 2.2 Export ──────────────────────────────────────────────────────────

export const workflowBuilderTrack: ContentTrack = {
  id: 'soar-workflow-builder',
  title: 'Workflow Builder',
  domainId: 'soar',
  order: 2,
  modules: [actionsLibraryModule, conditionsModule, variablesModule],
  scenario: workflowScenario,
}
