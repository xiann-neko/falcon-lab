import type {
  ContentModule,
  ContentTrack,
  QuizQuestion,
  ConceptSection,
  Scenario,
} from '../types'

// ═══════════════════════════════════════════════════════════════════════════════
// Track 2.1 — Foundations
// ═══════════════════════════════════════════════════════════════════════════════

// ── Module 2.1.1: What is Falcon Fusion? Architecture & Concepts ──────────────

const whatIsFusionConcepts: ConceptSection[] = [
  {
    title: 'Falcon Fusion: Native SOAR in the Falcon Platform',
    body: 'Falcon Fusion is CrowdStrike\'s Security Orchestration, Automation, and Response (SOAR) capability built directly into the Falcon platform. Unlike standalone SOAR tools that require separate deployment and API integration, Fusion is natively embedded — it has direct, real-time access to every Falcon detection, incident, device, identity, and threat intelligence signal without configuration.\n\nFusion workflows are visual, no-code automation sequences. Each workflow responds to a triggering event by executing a chain of conditions and actions. A workflow that contains host, creates a ticket, and notifies the SOC can be built in minutes — and runs in under a second when a detection fires.\n\nKey benefit of native SOAR: no authentication setup, no API keys to manage, no data extraction lag. Falcon events arrive in Fusion in real time because Fusion runs inside the same platform that generates them.',
  },
  {
    title: 'Workflow Anatomy: Trigger → Condition → Action',
    body: 'Every Fusion workflow has three layers:\n\n**Trigger:** The event that starts the workflow. Triggers are always a Falcon event — a new detection, an incident status change, a scheduled time, or a manual invocation. The trigger payload contains all event data (device info, detection details, incident fields) available to downstream conditions and actions.\n\n**Condition (optional):** A filter that evaluates trigger payload fields. If the condition evaluates to false, the workflow stops. Use conditions to scope workflows to specific scenarios — for example, only process detections of severity High or Critical, or only act on devices in a specific site.\n\n**Actions:** One or more response steps executed when the trigger fires (and conditions pass). Actions can run sequentially or in parallel. Examples: contain a host, send a Slack message, create a ServiceNow ticket, run an RTR command, update an incident field.\n\nWorkflows are stateless per execution — each trigger firing creates a new execution instance. Long-running state (e.g., waiting for analyst approval) requires using an Approval action or an external system.',
    codeExample: '// Conceptual workflow structure (not real code — Fusion uses a visual builder)\n// Trigger:   New Detection — severity in [High, Critical]\n// Condition: Device.tags contains "production"\n// Action 1:  Contain host (Network Containment)\n// Action 2:  Create ServiceNow ticket\n// Action 3:  Send Slack notification to #soc-alerts',
    codeLanguage: 'typescript',
  },
]

const whatIsFusionQuestions: QuizQuestion[] = [
  {
    id: 'soar-f-q1',
    text: 'What is the primary architectural advantage of Falcon Fusion over standalone SOAR tools?',
    options: [
      'Native embedding in the Falcon platform — direct real-time access to Falcon events with no API setup',
      'Falcon Fusion supports more action types than standalone SOAR platforms',
      'Falcon Fusion runs on-premises, giving organisations full data control',
      'Falcon Fusion uses machine learning to automatically write playbooks',
    ],
    correctIndex: 0,
    explanation: 'Falcon Fusion\'s defining advantage is native embedding. It runs inside the Falcon platform and has direct, real-time access to every detection, incident, device, and identity event without requiring API keys, data pipelines, or authentication configuration. This eliminates the integration overhead that makes standalone SOAR tools complex to deploy.',
    docTitle: 'Falcon Fusion Overview',
    docUrl: 'https://falcon.crowdstrike.com/documentation/page/falcon-fusion',
  },
  {
    id: 'soar-f-q2',
    text: 'In a Falcon Fusion workflow, what is the role of a Condition?',
    options: [
      'It filters trigger events — if the condition is false the workflow stops without executing actions',
      'It defines what triggers start the workflow',
      'It specifies which actions run after the trigger fires',
      'It stores the result of an action for use by later steps',
    ],
    correctIndex: 0,
    explanation: 'Conditions are optional filters placed between the trigger and actions. They evaluate payload fields from the trigger event. If the condition returns false, the workflow terminates cleanly without executing any actions. This scopes automation to only the relevant events — e.g., only act on Critical detections, or only on production hosts.',
    docTitle: 'Falcon Fusion Conditions',
    docUrl: 'https://falcon.crowdstrike.com/documentation/page/falcon-fusion-conditions',
  },
  {
    id: 'soar-f-q3',
    text: 'How is state managed across multiple executions of a Falcon Fusion workflow?',
    options: [
      'Workflows are stateless per execution — each trigger firing creates a separate independent instance',
      'Fusion maintains a shared state object that all executions read and write',
      'Fusion stores execution state in a dedicated database accessible to all workflow instances',
      'State is passed between executions via Falcon\'s incident object',
    ],
    correctIndex: 0,
    explanation: 'Each workflow execution is independent and stateless — it starts, runs, and ends without sharing memory with past or concurrent executions. If a workflow needs to coordinate state across executions (e.g., "has this host been contained before?"), it must externalise that state to an incident field, a ticket system, or another external store.',
    docTitle: 'Falcon Fusion Workflow Execution',
    docUrl: 'https://falcon.crowdstrike.com/documentation/page/falcon-fusion-workflow',
  },
  {
    id: 'soar-f-q4',
    text: 'Which of the following is a valid Falcon Fusion trigger type?',
    options: [
      'New Detection — fires when Falcon creates a new detection event',
      'File Change — fires when a monitored file is modified on a host',
      'User Login — fires when any user logs into the Falcon console',
      'API Call — fires when an external system calls the Falcon API',
    ],
    correctIndex: 0,
    explanation: 'Falcon Fusion triggers are based on Falcon platform events. "New Detection" is one of the core trigger types — it fires when the Falcon sensor generates a detection, with the full detection payload available to downstream conditions and actions. File Change, User Login, and generic API Call are not Fusion trigger types.',
    docTitle: 'Falcon Fusion Trigger Types',
    docUrl: 'https://falcon.crowdstrike.com/documentation/page/falcon-fusion-triggers',
  },
  {
    id: 'soar-f-q5',
    text: 'In Falcon Fusion, can workflow actions run in parallel?',
    options: [
      'Yes — multiple actions can be configured to run simultaneously within one workflow execution',
      'No — Fusion workflows are strictly sequential; each action must complete before the next starts',
      'Only notification actions can run in parallel; response actions are always sequential',
      'Parallel execution requires a separate Fusion Enterprise licence tier',
    ],
    correctIndex: 0,
    explanation: 'Falcon Fusion supports both sequential and parallel action execution. When actions don\'t depend on each other\'s output (e.g., sending a Slack notification AND creating a ticket simultaneously), running them in parallel reduces total execution time. Actions that use the output of a previous step must run sequentially after it.',
    docTitle: 'Falcon Fusion Action Execution',
    docUrl: 'https://falcon.crowdstrike.com/documentation/page/falcon-fusion-actions',
  },
]

export const whatIsFusionModule: ContentModule = {
  id: 'soar-foundations-what-is-fusion',
  title: 'What is Falcon Fusion? Architecture & Concepts',
  trackId: 'soar-foundations',
  domainId: 'soar',
  order: 1,
  lastReviewed: '2026-08-17',
  concepts: whatIsFusionConcepts,
  quiz: whatIsFusionQuestions,
}

// ── Module 2.1.2: Triggers — Detections, Incidents, Schedules, Manual ─────────

const triggersConcepts: ConceptSection[] = [
  {
    title: 'Event-Driven Triggers: Detections and Incidents',
    body: 'The two most common Fusion trigger types for SOC use cases are Detection and Incident triggers.\n\n**Detection trigger:** Fires when Falcon creates a new detection. Configure which detections to act on using filter criteria:\n- Severity: Informational, Low, Medium, High, Critical\n- Tactic/Technique: MITRE ATT&CK category (e.g., Credential Access)\n- Status: New (unreviewed), In Progress, True Positive, False Positive\n- Assigned to: specific analyst or team\n\n**Incident trigger:** Fires when a Falcon incident is created OR when an existing incident\'s status changes. Use cases: auto-assign new incidents, send notifications when an incident is escalated to Critical, trigger containment when an incident is confirmed True Positive.\n\nBoth trigger types make the full event payload available — detection details, device info, process tree, and all associated metadata — to conditions and actions downstream.',
  },
  {
    title: 'Schedule and Manual Triggers',
    body: '**Schedule trigger:** Runs a workflow on a time-based schedule — daily, weekly, or using a cron expression for precise timing. Use cases:\n- Nightly cleanup: close resolved incidents older than 30 days\n- Morning briefing: compile overnight alert summary and send to SOC Slack channel\n- Weekly compliance: generate endpoint hygiene report\n\nScheduled workflows do not receive a trigger payload from a Falcon event — they start with a blank context. Their actions typically query Falcon APIs or external systems to gather the data they need.\n\n**Manual trigger:** Allows any authorised user to launch a workflow on demand from the Falcon console, from an incident, or via API. Use cases:\n- On-demand investigation: analyst triggers enrichment playbook on a specific device\n- Response on request: trigger containment for an IOC discovered outside Falcon\n- Testing: validate workflow logic without waiting for a real detection\n\nManual triggers can accept input parameters — the triggering user specifies values (e.g., an IP address or hostname) that the workflow uses as its starting data.',
  },
]

const triggersQuestions: QuizQuestion[] = [
  {
    id: 'soar-f-q6',
    text: 'Which Falcon Fusion trigger would you use to automatically contain a host whenever a Critical severity detection is created?',
    options: [
      'Detection trigger — filtered to severity = Critical',
      'Incident trigger — filtered to severity = Critical',
      'Schedule trigger — running every minute to check for Critical detections',
      'Manual trigger — invoked by the analyst after reviewing the detection',
    ],
    correctIndex: 0,
    explanation: 'Detection triggers fire when Falcon creates a new detection. By filtering the trigger to severity = Critical, the workflow activates only for Critical detections. This gives near-instant automated response (sub-second) compared to a schedule trigger (up to 1-minute delay) or manual trigger (requires analyst action).',
    docTitle: 'Falcon Fusion Detection Trigger',
    docUrl: 'https://falcon.crowdstrike.com/documentation/page/falcon-fusion-triggers',
  },
  {
    id: 'soar-f-q7',
    text: 'What data is available to workflow actions when a Schedule trigger fires?',
    options: [
      'No trigger payload — scheduled workflows start with a blank context and must query data themselves',
      'The most recent detection from the past 24 hours',
      'A summary of all open incidents at the time the schedule fires',
      'The same payload as a Detection trigger',
    ],
    correctIndex: 0,
    explanation: 'Schedule triggers run on a time schedule without a Falcon event payload. The workflow starts with no pre-populated context — it must use Query or Get actions to retrieve the data it needs (e.g., query open incidents, fetch endpoint metrics). This is unlike Detection or Incident triggers, which arrive with a rich event payload.',
    docTitle: 'Falcon Fusion Schedule Trigger',
    docUrl: 'https://falcon.crowdstrike.com/documentation/page/falcon-fusion-triggers',
  },
  {
    id: 'soar-f-q8',
    text: 'An analyst wants to trigger an enrichment playbook on a specific device while investigating an alert — without waiting for Falcon to generate a new detection. Which trigger type supports this?',
    options: [
      'Manual trigger — the analyst invokes the workflow on demand from the Falcon console or incident view',
      'Detection trigger — filtered to the specific device ID',
      'Schedule trigger — set to run every minute so it picks up the device quickly',
      'Incident trigger — filtered to the incident containing the alert',
    ],
    correctIndex: 0,
    explanation: 'Manual triggers allow any authorised user to launch a workflow on demand. The analyst can specify input parameters (e.g., the device ID) at invocation time. This is the correct pattern for analyst-initiated investigation workflows, as it provides immediate execution without needing to wait for a new Falcon event.',
    docTitle: 'Falcon Fusion Manual Trigger',
    docUrl: 'https://falcon.crowdstrike.com/documentation/page/falcon-fusion-triggers',
  },
  {
    id: 'soar-f-q9',
    text: 'You want a Fusion workflow to fire when an incident\'s status changes from "In Progress" to "Closed". Which trigger type and filter should you use?',
    options: [
      'Incident trigger — filtered to status change: Closed',
      'Detection trigger — filtered to linked detections being resolved',
      'Schedule trigger — running hourly to check incident statuses',
      'Manual trigger — invoked by the analyst who closes the incident',
    ],
    correctIndex: 0,
    explanation: 'Incident triggers can fire on incident creation or status changes. By filtering to status = Closed (or status change → Closed), the workflow activates exactly when an incident is closed — allowing post-closure actions like sending a summary report, updating a CMDB record, or calculating MTTR metrics.',
    docTitle: 'Falcon Fusion Incident Trigger',
    docUrl: 'https://falcon.crowdstrike.com/documentation/page/falcon-fusion-triggers',
  },
  {
    id: 'soar-f-q10',
    text: 'Which of the following is a valid use case for a Falcon Fusion Schedule trigger?',
    options: [
      'Nightly report: compile all critical detections from the past 24 hours and send a summary to the SOC team',
      'Immediate containment: isolate a host the moment a Critical detection is created',
      'Post-incident review: trigger automatically when an incident is marked resolved',
      'Manual investigation: allow analysts to run enrichment on demand for any device',
    ],
    correctIndex: 0,
    explanation: 'Schedule triggers are designed for periodic, time-based tasks that don\'t depend on a real-time event. A nightly summary report is a classic example — it runs at a fixed time, queries Falcon for the day\'s detections, and sends the compiled output. Immediate containment needs a Detection trigger (real-time); post-incident review needs an Incident trigger; manual investigation needs a Manual trigger.',
    docTitle: 'Falcon Fusion Schedule Trigger',
    docUrl: 'https://falcon.crowdstrike.com/documentation/page/falcon-fusion-triggers',
  },
]

export const triggersModule: ContentModule = {
  id: 'soar-foundations-triggers',
  title: 'Triggers — Detections, Incidents, Schedules, Manual',
  trackId: 'soar-foundations',
  domainId: 'soar',
  order: 2,
  lastReviewed: '2026-08-17',
  concepts: triggersConcepts,
  quiz: triggersQuestions,
}

// ── Track 2.1 Scenario ────────────────────────────────────────────────────────

const foundationsScenario: Scenario = {
  id: 'soar-foundations-scenario',
  title: 'First Fusion Workflow: Automating Your First Response',
  context: 'You are a SOC analyst who has just been granted access to Falcon Fusion. Your team manually handles ~30 High/Critical detections per day — triaging, containing, and notifying stakeholders. Your manager wants to automate the three most time-consuming steps: host containment, ticket creation, and analyst notification. Your task is to design and validate your first Fusion workflow.',
  isCumulative: false,
  steps: [
    {
      id: 'soar-found-s1',
      narrative: 'You need to automate response to Critical detections. The workflow should only fire for Critical detections that are new (not yet reviewed). Which trigger and condition configuration is correct?',
      choices: [
        { text: 'Detection trigger filtered to severity = Critical AND status = New' },
        { text: 'Incident trigger filtered to severity = Critical' },
        { text: 'Schedule trigger running every minute to poll for Critical detections' },
        { text: 'Detection trigger with no conditions — process all detections, filter in the action' },
      ],
      correctChoiceIndex: 0,
      wrongConsequence: 'An Incident trigger fires after an incident is created — detections may not be linked to incidents immediately. A schedule trigger introduces up to 1-minute latency for critical threats. No conditions means your containment action fires on every detection including Informational ones, causing unnecessary disruption.',
      reasoning: 'The Detection trigger with severity = Critical and status = New fires immediately and precisely — only for new Critical detections. The condition filter keeps the workflow scoped, preventing automation from running on already-reviewed detections or lower-severity events. This is the correct pattern for real-time critical response.',
      docTitle: 'Falcon Fusion Detection Trigger',
      docUrl: 'https://falcon.crowdstrike.com/documentation/page/falcon-fusion-triggers',
    },
    {
      id: 'soar-found-s2',
      narrative: 'Your first action should contain the affected host. You want the action to use the device ID from the detection trigger payload automatically. How does Fusion provide this data to actions?',
      choices: [
        { text: 'Trigger payload fields are accessible as template variables in action configuration — e.g. {{trigger.device.device_id}}' },
        { text: 'You must run a separate "Get Device" action first to retrieve the device ID before containment' },
        { text: 'The device ID must be typed manually into the action — Fusion does not pass trigger data automatically' },
        { text: 'Only the incident ID is passed to actions; you cannot access detection-level device data' },
      ],
      correctChoiceIndex: 0,
      wrongConsequence: 'Running a separate "Get Device" action wastes time and adds unnecessary complexity when the data is already in the trigger payload. Manual typing is error-prone and defeats the purpose of automation. Only incident IDs is incorrect — Detection triggers carry full device, process, and detection metadata.',
      reasoning: 'Falcon Fusion makes all trigger payload fields available as template variables throughout the workflow. The device ID from the detection is directly accessible without a preliminary lookup action. This is the core efficiency of native SOAR — the event and its metadata arrive together.',
      docTitle: 'Falcon Fusion Variables and Payload',
      docUrl: 'https://falcon.crowdstrike.com/documentation/page/falcon-fusion-variables',
    },
    {
      id: 'soar-found-s3',
      narrative: 'After configuring the Contain Host action, you want to also send a Slack notification simultaneously (not after containment finishes). How do you configure this?',
      choices: [
        { text: 'Place the Slack action in parallel with the Contain Host action in the workflow builder — both execute at the same time' },
        { text: 'Add the Slack action after the Contain Host action — Fusion does not support true parallel execution' },
        { text: 'Create a second workflow triggered by the same detection event to send the Slack message' },
        { text: 'Use a Loop action with both Contain Host and Slack configured as loop iterations' },
      ],
      correctChoiceIndex: 0,
      wrongConsequence: 'Sequential placement means the Slack notification only sends after containment completes — adding latency. A second separate workflow adds management overhead and may fire at a slightly different time. A Loop is for iterating over lists of items, not for parallel execution of different actions.',
      reasoning: 'Fusion\'s workflow builder supports parallel action branches. By placing Contain Host and Slack Notification side-by-side in a parallel branch, both execute simultaneously — reducing total workflow time and ensuring the analyst is notified while containment is happening, not after.',
      docTitle: 'Falcon Fusion Parallel Actions',
      docUrl: 'https://falcon.crowdstrike.com/documentation/page/falcon-fusion-actions',
    },
    {
      id: 'soar-found-s4',
      narrative: 'You activate the workflow and a test detection fires, but the workflow does not execute. The detection is Critical and New. What should you check first?',
      choices: [
        { text: 'Verify the workflow is enabled — new workflows are disabled by default and must be manually activated' },
        { text: 'Check whether the detection was created before the workflow was saved' },
        { text: 'Confirm that the Falcon sensor on the affected host is reporting to the same CID' },
        { text: 'Restart the Falcon Fusion service from the platform settings' },
      ],
      correctChoiceIndex: 0,
      wrongConsequence: 'Detection creation time relative to save time does not affect workflow execution for new detections fired after saving. The CID is relevant for multi-tenant scenarios but not the first thing to check. There is no user-accessible Fusion service restart — the platform manages this.',
      reasoning: 'Falcon Fusion workflows must be explicitly enabled after creation. New workflows start in a disabled state so analysts can review and test them before they run against real events. An enabled workflow that still does not fire after a matching event is the next layer to investigate.',
      docTitle: 'Falcon Fusion Workflow Management',
      docUrl: 'https://falcon.crowdstrike.com/documentation/page/falcon-fusion-workflow',
    },
    {
      id: 'soar-found-s5',
      narrative: 'After enabling the workflow, it fires correctly on the next Critical detection. Your manager asks: how will you know if the workflow fails on a future execution (e.g., if the Slack webhook becomes invalid)? What is the correct monitoring approach?',
      choices: [
        { text: 'Review the Fusion execution logs — Falcon records each workflow run with status (success/failure) and per-action results; configure an alert on failed executions' },
        { text: 'Monitor the Slack channel — if no message arrives, the workflow failed' },
        { text: 'Fusion guarantees delivery of all actions; failures are retried automatically until they succeed' },
        { text: 'Ask the SOC team to manually verify each workflow execution against the detection list' },
      ],
      correctChoiceIndex: 0,
      wrongConsequence: 'Monitoring the Slack channel only catches Slack-specific failures — it misses containment failures or ticket creation errors. Fusion does not guarantee infinite retries — failed actions are recorded but not necessarily retried indefinitely. Manual verification is not scalable for high-volume environments.',
      reasoning: 'Falcon Fusion maintains an execution log for every workflow run. Each execution record shows success/failure status per action, execution time, and error details. Setting up a separate monitoring alert on Fusion execution failures creates a second layer of observability — so the automation itself alerts you when it breaks.',
      docTitle: 'Falcon Fusion Execution Logs',
      docUrl: 'https://falcon.crowdstrike.com/documentation/page/falcon-fusion-monitoring',
    },
  ],
}

// ── Track 2.1 Export ──────────────────────────────────────────────────────────

export const foundationsTrack: ContentTrack = {
  id: 'soar-foundations',
  title: 'Foundations',
  domainId: 'soar',
  order: 1,
  modules: [whatIsFusionModule, triggersModule],
  scenario: foundationsScenario,
}
