# Falcon Lab Plan 7: SOAR Domain Content (Tracks 2.1–2.4)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Author all SOAR domain content — Tracks 2.1 (Foundations), 2.2 (Workflow Builder), 2.3 (Playbook Design), and 2.4 (Integrations & Advanced) — 10 modules total, 4 track scenarios, 1 mid-track PlaybookChallenge, and 1 SOAR cumulative scenario, making the Falcon Fusion SOAR domain fully playable end-to-end.

**Architecture:** Same pattern as SIEM Plan 6. Each track is authored in its own file (`soar-track-2-1.ts` through `soar-track-2-4.ts`) and imported into the existing `soar.ts` domain file. The cumulative scenario replaces the stub in `soar.ts`. No component code changes needed.

**Tech Stack:** TypeScript data files only. Validation: `npx tsc --noEmit` + `npm test`.

## Global Constraints

- TypeScript strict mode — no type errors, no unused imports (`noUnusedLocals: true` in `tsconfig.app.json` — `tsc -b` enforces this)
- All quiz question `id` fields globally unique — prefixes: `soar-f-*` (Track 2.1), `soar-wf-*` (Track 2.2), `soar-pb-*` (Track 2.3), `soar-int-*` (Track 2.4)
- All scenario `id` and `stepId` fields unique across the domain
- Every `docUrl` begins with `https://falcon.crowdstrike.com/documentation`
- Every module's `lastReviewed` field: `'2026-08-17'`
- `ContentModule.quiz` is `QuizQuestion[]` (plain array, NOT `{ questions: QuizQuestion[] }`)
- `ContentModule.challenge?` is of type `Challenge`; SOAR challenges use `type: 'playbook'`
- `PlaybookChallenge` fields: `type: 'playbook'`, `id`, `prompt`, `scenario`, `steps: PlaybookStep[]` (in correct order), `stepExplanations: string[]` (parallel array, same length as `steps`)
- `PlaybookStep` fields: `id`, `label` (short action name), `action` (full description)
- Scenario `steps` must have exactly 5 entries for track scenarios; 6 for the cumulative scenario
- `isCumulative: false` on all track scenarios; `isCumulative: true` on the cumulative scenario
- All new track files import types from `'../types'` — only import types that are actually used
- `soar.ts` imports new tracks and adds them to `tracks[]` in order
- Existing `soarCumulativeScenario` stub (with `steps: []`) must be completely replaced in Task 5
- `npm test` must pass after each task

---

## File Map

| Status | File | Role |
|---|---|---|
| **Create** | `src/content/domains/soar-track-2-1.ts` | Track 2.1 Foundations — 2 modules + scenario |
| **Create** | `src/content/domains/soar-track-2-2.ts` | Track 2.2 Workflow Builder — 3 modules + scenario |
| **Create** | `src/content/domains/soar-track-2-3.ts` | Track 2.3 Playbook Design — 3 modules + PlaybookChallenge + scenario |
| **Create** | `src/content/domains/soar-track-2-4.ts` | Track 2.4 Integrations & Advanced — 2 modules + scenario |
| **Modify** | `src/content/domains/soar.ts` | Import 4 new tracks, populate `tracks[]`, replace cumulative scenario stub |

---

### Task 1: Track 2.1 — Foundations

**Files:**
- Create: `src/content/domains/soar-track-2-1.ts`
- Modify: `src/content/domains/soar.ts` — add import + add `foundationsTrack` to `tracks` array

- [ ] **Step 1: Create `src/content/domains/soar-track-2-1.ts`**

Write this file verbatim:

```typescript
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
    codeLanguage: 'javascript',
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
```

- [ ] **Step 2: Add import and track to `soar.ts`**

In `src/content/domains/soar.ts`, add the import at the top:
```typescript
import { foundationsTrack } from './soar-track-2-1'
```

Update the `tracks` array:
```typescript
tracks: [foundationsTrack],
```

- [ ] **Step 3: TypeScript check + tests**

```
npx tsc --noEmit
npm test
```

Expected: no errors, all tests pass.

- [ ] **Step 4: Commit**

```
git add src/content/domains/soar-track-2-1.ts src/content/domains/soar.ts
git commit -m "feat: add SOAR Track 2.1 Foundations modules and scenario"
```

---

### Task 2: Track 2.2 — Workflow Builder

**Files:**
- Create: `src/content/domains/soar-track-2-2.ts`
- Modify: `src/content/domains/soar.ts`

- [ ] **Step 1: Create `src/content/domains/soar-track-2-2.ts`**

```typescript
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
    codeLanguage: 'javascript',
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
      'Threat Intelligence lookup enrichment action — query the hash against CrowdStrike Threat Intelligence',
      'Contain Host action — containment implicitly validates the hash reputation',
      'RTR Command action — run a hash check script on the affected host',
      'Send Email action — email the hash to the threat intel team for manual review',
    ],
    correctIndex: 0,
    explanation: 'Threat Intelligence lookup is an enrichment action that queries CrowdStrike\'s indicator database for a given hash, IP, or domain. It returns a reputation verdict (malicious, suspicious, unknown) and supporting evidence that downstream conditions can use to branch the workflow — e.g., auto-contain if malicious, send alert if suspicious, no action if unknown.',
    docTitle: 'Falcon Fusion Enrichment Actions',
    docUrl: 'https://falcon.crowdstrike.com/documentation/page/falcon-fusion-actions',
  },
  {
    id: 'soar-wf-q3',
    text: 'What is the recommended best practice for Slack/Teams notification actions in a Fusion workflow?',
    options: [
      'Include the detection name, severity, affected host, and a direct link to the detection in the message',
      'Send only a generic "alert fired" message to keep notification size small',
      'Route all notifications to a single #general channel to ensure maximum visibility',
      'Use email instead of Slack/Teams for SOC alerting — email is more reliable',
    ],
    correctIndex: 0,
    explanation: 'Notifications are only useful if recipients have enough context to act on them. A message with the detection name, severity, hostname, and a direct Falcon link lets the analyst immediately understand the alert and jump to the correct place without logging in and searching. A generic "alert fired" message just adds noise.',
    docTitle: 'Falcon Fusion Notification Best Practices',
    docUrl: 'https://falcon.crowdstrike.com/documentation/page/falcon-fusion-actions',
  },
  {
    id: 'soar-wf-q4',
    text: 'A Fusion workflow needs to execute a PowerShell remediation script on a compromised host. Which action supports this?',
    options: [
      'Run RTR Command — executes Real Time Response commands on the host',
      'Contain Host — containment includes script execution capability',
      'Block Indicator — scripts are deployed via indicator blocking',
      'Create Ticket — the ITSM ticket triggers the script via a webhook',
    ],
    correctIndex: 0,
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
    codeLanguage: 'javascript',
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
      'Switch/Case — evaluates one field against multiple values and routes to the matching case',
      'Multiple If/Else blocks — one for each severity level',
      'Loop — iterate over severity levels until the matching one is found',
      'Condition — a single true/false condition handles multiple values',
    ],
    correctIndex: 0,
    explanation: 'Switch/Case is the correct construct when routing on multiple values of a single field. It produces cleaner, more readable workflows than nested If/Else chains. Each case maps to a severity value (Critical, High, Medium, Low) with its own action branch — exactly matching the multi-path routing need.',
    docTitle: 'Falcon Fusion Conditions and Branching',
    docUrl: 'https://falcon.crowdstrike.com/documentation/page/falcon-fusion-conditions',
  },
  {
    id: 'soar-wf-q7',
    text: 'A Fusion workflow needs to contain all hosts linked to a Critical incident. The incident may have 1–15 affected devices. Which construct handles this correctly?',
    options: [
      'Loop — iterate over the incident\'s device list and run Contain Host for each device',
      'Parallel actions — add up to 15 parallel Contain Host actions, one per potential host',
      'A single Contain Host action — it automatically contains all linked devices',
      'Condition — check each device ID sequentially with nested If/Else conditions',
    ],
    correctIndex: 0,
    explanation: 'A Loop iterates over the incident\'s device array and executes Contain Host for each entry — handling 1 device or 15 with the same workflow. Adding 15 parallel static actions only works if exactly 15 devices are always affected. A single Contain Host action targets one device ID, not a list.',
    docTitle: 'Falcon Fusion Loop Action',
    docUrl: 'https://falcon.crowdstrike.com/documentation/page/falcon-fusion-conditions',
  },
  {
    id: 'soar-wf-q8',
    text: 'What is the purpose of setting a "max iterations" limit on a Fusion Loop action?',
    options: [
      'To prevent runaway loops — if the input list is unexpectedly large, the limit stops the loop from running indefinitely',
      'To control how fast the loop runs (iterations per second)',
      'To set the maximum number of errors before the loop stops',
      'To limit the number of parallel branches inside the loop body',
    ],
    correctIndex: 0,
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
      '"Continue on error" — the loop proceeds to host 24 even if host 23 failed',
      '"Stop on error" — the loop halts at host 23 to prevent cascading failures',
      'No configuration needed — Fusion automatically retries failed iterations before continuing',
      'Use a separate error trigger to restart the loop from host 24',
    ],
    correctIndex: 0,
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
    codeLanguage: 'javascript',
  },
]

const variablesQuestions: QuizQuestion[] = [
  {
    id: 'soar-wf-q11',
    text: 'In Falcon Fusion, how do you reference the hostname of the device from a Detection trigger in a downstream action?',
    options: [
      '{{trigger.device.hostname}} — dot-path template variable referencing the trigger payload field',
      'DEVICE_HOSTNAME — Fusion automatically substitutes this reserved keyword',
      'Run a "Get Device" action first to retrieve the hostname, then reference its output',
      'The hostname is not available in workflow templates — only the device ID is passed',
    ],
    correctIndex: 0,
    explanation: 'Fusion uses {{variable.path}} template syntax to reference payload fields. Detection triggers include a device object with hostname, device_id, site, OS, and more. These are directly available in all downstream templates without any preliminary lookup action.',
    docTitle: 'Falcon Fusion Variables',
    docUrl: 'https://falcon.crowdstrike.com/documentation/page/falcon-fusion-variables',
  },
  {
    id: 'soar-wf-q12',
    text: 'A Fusion workflow uses a Loop to contain 10 hosts. You want to count how many containments succeeded for use in a final summary notification. How do you implement this?',
    options: [
      'Use a custom variable as a counter — increment it inside the loop body when a Contain Host action succeeds',
      'Use a payload variable — {{trigger.contained_count}} auto-tracks containment successes',
      'Count the loop iterations — iterations always equal successes',
      'Run a separate "Get Containment Status" action after the loop completes',
    ],
    correctIndex: 0,
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
      'Via the action output variable: {{actions.createTicket.ticket_id}} (or the action\'s configured output name)',
      'Via a trigger payload variable: {{trigger.ticket_id}}',
      'Ticket IDs cannot be referenced in later steps — they are only visible in the Fusion execution log',
      'By running a "Get Ticket" action after the Create Ticket action to retrieve the ID',
    ],
    correctIndex: 0,
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
        { text: 'Correct the typo in both the Slack template and the ServiceNow ticket template — change host_name to hostname in both actions' },
        { text: 'Add a "Get Device" action before both actions to retrieve the hostname separately, avoiding the template variable entirely' },
        { text: 'Create a custom variable at the start of the workflow that stores the hostname, then reference the custom variable in both templates' },
        { text: 'Fix only the Slack template — the ServiceNow issue is from a different root cause' },
      ],
      correctChoiceIndex: 0,
      wrongConsequence: 'Adding a "Get Device" action solves the issue but adds unnecessary latency and complexity when the data is already in the trigger payload. Creating a custom variable is a valid pattern but also adds steps that are not needed. Fixing only Slack leaves the ServiceNow issue unresolved.',
      reasoning: 'The root cause is identical in both places — a single typo in the variable path. Fix it at the source in both templates. The trigger payload already contains the correct hostname; no extra actions are needed. Correcting the path in both templates simultaneously is the simplest and most complete fix.',
      docTitle: 'Falcon Fusion Variables',
      docUrl: 'https://falcon.crowdstrike.com/documentation/page/falcon-fusion-variables',
    },
    {
      id: 'soar-wf-s3',
      narrative: 'After fixing the templates, you review the containment logic. The workflow contains hosts if TI verdict is "malicious". You notice the condition is: `actions.threatIntel.verdict == "Malicious"` (capital M). CrowdStrike Threat Intelligence returns `"malicious"` (lowercase). What is the impact and fix?',
      choices: [
        { text: 'The condition never evaluates to true — no hosts have been contained since the workflow was deployed. Fix: change to lowercase "malicious"' },
        { text: 'The condition works correctly — Fusion conditions are case-insensitive by default' },
        { text: 'The condition sometimes fails — TI verdicts are inconsistently capitalised' },
        { text: 'The containment still ran because the fallback else-branch contains by default' },
      ],
      correctChoiceIndex: 0,
      wrongConsequence: 'Fusion conditions are case-sensitive string comparisons. "Malicious" !== "malicious". The workflow has been deployed for six weeks with this bug — meaning zero automated containments have occurred during that time, despite potentially many malicious indicators being detected.',
      reasoning: 'String comparisons in Fusion are case-sensitive. "Malicious" (capital M) never matches "malicious" (lowercase) from the TI API. The fix is to match the exact casing returned by the API. This is a silent logic failure — the workflow ran successfully but the containment branch was never taken.',
      docTitle: 'Falcon Fusion Condition Syntax',
      docUrl: 'https://falcon.crowdstrike.com/documentation/page/falcon-fusion-conditions',
    },
    {
      id: 'soar-wf-s4',
      narrative: 'Fixing the condition to lowercase "malicious", you re-test with a simulated malicious detection. The TI lookup correctly returns "malicious", but the Contain Host action now fails with "Device ID not found". You check the template: the action uses `{{trigger.device.device_id}}`. What is the likely cause?',
      choices: [
        { text: 'The field name is wrong — check the actual Detection trigger payload structure to confirm the correct device ID field path' },
        { text: 'Containment requires the device\'s serial number, not the device ID' },
        { text: 'The device was decommissioned between the detection and the containment action' },
        { text: 'Contain Host actions must be triggered by an Incident trigger, not a Detection trigger' },
      ],
      correctChoiceIndex: 0,
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
```

- [ ] **Step 2: Add import and track to `soar.ts`**

```typescript
import { workflowBuilderTrack } from './soar-track-2-2'
// tracks: [foundationsTrack, workflowBuilderTrack]
```

- [ ] **Step 3: TypeScript check + tests**

```
npx tsc --noEmit
npm test
```

- [ ] **Step 4: Commit**

```
git add src/content/domains/soar-track-2-2.ts src/content/domains/soar.ts
git commit -m "feat: add SOAR Track 2.2 Workflow Builder modules and scenario"
```

---

### Task 3: Track 2.3 — Playbook Design (with PlaybookChallenge)

**Files:**
- Create: `src/content/domains/soar-track-2-3.ts`
- Modify: `src/content/domains/soar.ts`

The **PlaybookChallenge** is on Module 2 (Triage & Escalation Playbooks). The student must correctly order 5 steps of a triage playbook.

- [ ] **Step 1: Create `src/content/domains/soar-track-2-3.ts`**

```typescript
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
    body: 'Every production Fusion playbook should be designed with a clear three-part structure:\n\n**Purpose:** What problem does this playbook solve? What does it automate? Why does it exist? Write this in the playbook description in one or two sentences.\n\n**Scope:** Which events trigger this playbook, and which ones should NOT? Define this via tight trigger filters and conditions. Overly broad playbooks (e.g., all detections of any severity) create noise and risk unintended actions.\n\n**Escalation path:** What happens if the playbook cannot resolve the situation automatically? Define the fallback — paging a specific analyst, creating a high-priority ticket, or sending a dedicated alert — so nothing falls through the cracks.\n\nExample playbook description:\n```\nPlaybook: Auto-Contain Critical Ransomware Detections\nOwner: SOC Team (ross.anne.ilagan@accenture.com)\nTrigger: Detection — severity=Critical, tactic=Ransomware\nScope: Production hosts only (tag=production). Excludes lab and sandbox hosts.\nEscalation: If containment fails, page on-call via PagerDuty P1.\nLast reviewed: 2026-08-17\n```',
    codeExample: '// Playbook description template\n// Purpose: Auto-contain Critical ransomware detections on production hosts\n// Owner: SOC Team\n// Trigger: Detection — severity=Critical, tactic contains "Ransomware"\n// Scope: device.tags contains "production" (excludes lab/sandbox)\n// Escalation: containment failure → PagerDuty P1 page\n// Reviewed: 2026-08-17',
    codeLanguage: 'javascript',
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
      'Broad conditions cause the playbook to fire on unintended events — potentially containing hosts or creating tickets incorrectly',
      'Broad conditions slow down Fusion — more trigger evaluations increase platform load',
      'Broad conditions require more complex action logic, making the playbook harder to maintain',
      'CrowdStrike licensing charges per trigger evaluation, so broad conditions increase cost',
    ],
    correctIndex: 0,
    explanation: 'Overly broad trigger conditions — such as "fire on all detections" — cause automation to act on events it was not designed for. This can lead to false-positive containments (isolating a production server for an Informational detection), unnecessary tickets, and alert fatigue. Tight conditions scope the playbook precisely to its intended scenario.',
    docTitle: 'Falcon Fusion Trigger Scoping',
    docUrl: 'https://falcon.crowdstrike.com/documentation/page/falcon-fusion-playbook-design',
  },
  {
    id: 'soar-pb-q3',
    text: 'A Fusion playbook creates a ServiceNow ticket automatically. To prevent duplicate tickets when the playbook re-triggers, what is the correct design pattern?',
    options: [
      'Add a condition before ticket creation that checks if a ticket already exists for this detection (e.g., check for an existing ticket ID in the incident fields)',
      'Set the playbook trigger to only fire once per detection by using a "fire once" flag in the trigger settings',
      'Use the Loop action with max iterations = 1 to prevent the ticket creation from running more than once',
      'Add an If/Else after ticket creation that stops the workflow if the ticket action ran',
    ],
    correctIndex: 0,
    explanation: 'The correct idempotency pattern is to check before acting — query for an existing ticket linked to this detection/incident before creating a new one. If a ticket already exists, skip creation. Fusion does not have a native "fire once" trigger flag. The Loop and If/Else patterns don\'t address re-triggering from the beginning of the workflow.',
    docTitle: 'Falcon Fusion Idempotency Patterns',
    docUrl: 'https://falcon.crowdstrike.com/documentation/page/falcon-fusion-playbook-design',
  },
  {
    id: 'soar-pb-q4',
    text: 'Which element of a production playbook defines what happens if the automation cannot resolve the situation (e.g., containment fails)?',
    options: [
      'The escalation path — defines the fallback action (page on-call, create high-priority ticket, send alert)',
      'The scope — limits which events trigger the playbook to avoid edge cases',
      'The error handler on each individual action — determines if the workflow continues or stops',
      'The trigger condition — scoping the trigger tightly prevents scenarios the playbook cannot handle',
    ],
    correctIndex: 0,
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
      'Enrich → Score → Route (notify and create ticket based on score)',
      'Route → Enrich → Score (route immediately, then enrich for future reference)',
      'Score → Enrich → Route (compute score first, then gather context)',
      'Route → Score → Enrich (take action immediately while enrichment runs in parallel)',
    ],
    correctIndex: 0,
    explanation: 'Enrich first — gather the context needed for scoring (TI verdict, asset value). Score second — combine enrichment results into a priority. Route last — act based on the score. Routing before enrichment means acting on incomplete information. Scoring before enriching means you have no data to score.',
    docTitle: 'Falcon Fusion Triage Playbook Pattern',
    docUrl: 'https://falcon.crowdstrike.com/documentation/page/falcon-fusion-playbook-design',
  },
  {
    id: 'soar-pb-q7',
    text: 'In a triage playbook, a detection on a Critical-tagged production asset with a "malicious" TI verdict is computed as P1. What actions should P1 routing trigger?',
    options: [
      'Immediate host containment + PagerDuty page to on-call analyst + Critical incident ticket',
      'Send Slack notification to #soc-alerts + create a Standard priority ticket',
      'Log the event to the SIEM dashboard and include in the next daily report',
      'Assign to Tier 1 queue and wait for analyst triage during business hours',
    ],
    correctIndex: 0,
    explanation: 'P1 is the highest priority — a confirmed malicious indicator on a Critical asset. The response must be immediate: contain the host to stop the threat, page on-call so a human is engaged, and create a Critical ticket for tracking. Slack-only notification is insufficient for P1 — on-call paging ensures 24/7 human awareness. P1 alerts cannot wait for business hours.',
    docTitle: 'SOC Escalation Tiers',
    docUrl: 'https://falcon.crowdstrike.com/documentation/page/falcon-fusion-playbook-design',
  },
  {
    id: 'soar-pb-q8',
    text: 'Why should automated triage playbooks run their enrichment steps BEFORE creating a ticket?',
    options: [
      'So the ticket is created with the correct priority and pre-filled context — avoiding a manual update after the fact',
      'Ticket creation locks the detection, preventing enrichment actions from running',
      'CrowdStrike Threat Intelligence requires an active ticket before it accepts enrichment queries',
      'Creating a ticket triggers a second workflow that conflicts with the triage playbook',
    ],
    correctIndex: 0,
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
      'It ensures consistent scoring across all detections and eliminates the manual "is this important?" step — analysts start work already knowing the priority and context',
      'Automated triage is more accurate than human triage in all cases',
      'Automated triage eliminates the need for Tier 1 analysts entirely',
      'Automated triage reduces the number of detections by filtering out false positives before analysts see them',
    ],
    correctIndex: 0,
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
      'Network Containment — isolates the host while keeping the Falcon sensor connected; fully reversible',
      'Deleting suspicious files from the host — directly removes potential threats',
      'Disabling the affected user\'s account in Active Directory',
      'Terminating a process identified as malicious on a production database server',
    ],
    correctIndex: 0,
    explanation: 'Network Containment is the safest automated response because: the Falcon sensor remains connected (analysts can still run RTR commands), it is fully reversible in seconds from the Falcon console, and its blast radius is limited to the one contained host. File deletion, account disabling, and process termination on production systems carry higher risk of business impact and are harder to reverse.',
    docTitle: 'Falcon Fusion Response Action Safety',
    docUrl: 'https://falcon.crowdstrike.com/documentation/page/falcon-fusion-playbook-design',
  },
  {
    id: 'soar-pb-q12',
    text: 'When should a Falcon Fusion remediation playbook use an Approval action instead of executing automatically?',
    options: [
      'When the action has a high blast radius or is difficult to reverse — such as deleting files, disabling accounts, or re-imaging a host',
      'When the detection severity is below High — low-severity actions always need approval',
      'When the playbook has been running for more than 30 days without a review',
      'When the affected host is a workstation — servers can be acted on automatically',
    ],
    correctIndex: 0,
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
      'In the playbook\'s description field — so any analyst can find recovery steps immediately during a false-positive incident',
      'In a separate internal wiki page linked from the playbook',
      'In the Falcon incident notes attached to the triggered detection',
      'Rollback procedures are unnecessary — Falcon Fusion actions are always reversible automatically',
    ],
    correctIndex: 0,
    explanation: 'The playbook description is the first place an analyst looks when investigating a playbook\'s actions. Inline documentation of the rollback procedure means recovery steps are immediately accessible without navigating to a separate system. During a high-pressure false-positive situation, every extra click and search costs time.',
    docTitle: 'Falcon Fusion Playbook Documentation',
    docUrl: 'https://falcon.crowdstrike.com/documentation/page/falcon-fusion-playbook-design',
  },
  {
    id: 'soar-pb-q15',
    text: 'An analyst closes a Falcon incident as "False Positive". A recovery workflow should automatically do which of the following?',
    options: [
      'Release host containment and re-enable any accounts or blocks that were applied by the triage playbook for this incident',
      'Delete the incident from Falcon to remove the false positive from reporting metrics',
      'Trigger a new investigation workflow to find the root cause of the false positive',
      'Notify CrowdStrike of the false positive to improve detection accuracy',
    ],
    correctIndex: 0,
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
        { text: 'Step 1 creates the ticket before enrichment — the ticket will have wrong priority and no TI verdict. Reorder to: TI enrichment first, then create ticket with enriched context.' },
        { text: 'The playbook correctly creates the ticket first to immediately track the detection, then enriches for additional context.' },
        { text: 'The on-call paging threshold (TI=malicious) is too high — page for all Critical detections regardless of TI verdict.' },
        { text: 'The playbook is missing a loop — it should contain all hosts linked to the Critical detection.' },
      ],
      correctChoiceIndex: 0,
      wrongConsequence: 'Creating a ticket before enrichment is not "correct" — the ticket lacks the TI verdict that determines whether this should be P1 or P2. The analyst assigned to the ticket has to manually add this context. Paging for all Critical detections without TI validation would generate excessive on-call pages. A loop for containment is a separate concern.',
      reasoning: 'The Enrich → Score → Route pattern requires enrichment to run BEFORE ticket creation. The ticket priority and pre-filled context should reflect the TI verdict. A ticket created before enrichment is incomplete — it has to be manually updated afterward, defeating the automation value.',
      docTitle: 'Triage Playbook Sequencing',
      docUrl: 'https://falcon.crowdstrike.com/documentation/page/falcon-fusion-playbook-design',
    },
    {
      id: 'soar-pb-s3',
      narrative: 'Playbook 3: "Malware Remediation". Trigger: Detection TI=malicious. Steps: (1) Contain host, (2) Delete all files in the detection\'s process directory, (3) Disable the user\'s AD account. No approval step. What is your assessment?',
      choices: [
        { text: 'DISABLE immediately — steps 2 and 3 are high-risk, irreversible actions that must not run without human approval. Rebuild with an Approval action before file deletion and account disabling.' },
        { text: 'Approve — confirmed malicious TI justifies full automated remediation without delays.' },
        { text: 'Approve with monitoring — watch the execution log for 48 hours and disable if false positives appear.' },
        { text: 'Remove only the account-disabling step — file deletion is safe to automate for confirmed malicious detections.' },
      ],
      correctChoiceIndex: 0,
      wrongConsequence: 'TI verdicts are not infallible — false positives occur. Automatically deleting files and disabling accounts based on a TI match risks deleting legitimate files and locking out valid users. 48-hour monitoring means the playbook runs uncontrolled while you watch. File deletion is NOT safe without approval — it is irreversible.',
      reasoning: 'File deletion and account disabling are high-risk, difficult-to-reverse actions. Even with a malicious TI verdict, a false positive is possible. These actions require an Approval action that pauses the workflow and sends a senior analyst a review request. Host containment (Step 1) is safe to automate — Steps 2 and 3 are not.',
      docTitle: 'Falcon Fusion High-Risk Action Design',
      docUrl: 'https://falcon.crowdstrike.com/documentation/page/falcon-fusion-playbook-design',
    },
    {
      id: 'soar-pb-s4',
      narrative: 'Playbook 4: "Incident Auto-Close". Trigger: Incident created, severity=Low. Action: Immediately close the incident as False Positive. Description: "Auto-close low severity." Owner: unknown. What is the critical governance problem?',
      choices: [
        { text: 'The playbook auto-closes Low incidents as False Positive without any validation — hiding real Low-severity threats. Must be disabled and rebuilt with validation logic before any auto-closure.' },
        { text: 'The description is too short — expand it to explain the auto-close logic.' },
        { text: 'The unknown owner is the primary problem — assign an owner and it can continue running.' },
        { text: 'Auto-closing Low incidents is a valid operational efficiency — analysts should focus on High/Critical only.' },
      ],
      correctChoiceIndex: 0,
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
```

- [ ] **Step 2: Add import and track to `soar.ts`**

```typescript
import { playbookDesignTrack } from './soar-track-2-3'
// tracks: [foundationsTrack, workflowBuilderTrack, playbookDesignTrack]
```

- [ ] **Step 3: TypeScript check + tests**

```
npx tsc --noEmit
npm test
```

- [ ] **Step 4: Commit**

```
git add src/content/domains/soar-track-2-3.ts src/content/domains/soar.ts
git commit -m "feat: add SOAR Track 2.3 Playbook Design modules, PlaybookChallenge, and scenario"
```

---

### Task 4: Track 2.4 — Integrations & Advanced

**Files:**
- Create: `src/content/domains/soar-track-2-4.ts`
- Modify: `src/content/domains/soar.ts`

- [ ] **Step 1: Create `src/content/domains/soar-track-2-4.ts`**

```typescript
import type {
  ContentModule,
  ContentTrack,
  QuizQuestion,
  ConceptSection,
  Scenario,
} from '../types'

// ═══════════════════════════════════════════════════════════════════════════════
// Track 2.4 — Integrations & Advanced
// ═══════════════════════════════════════════════════════════════════════════════

// ── Module 2.4.1: 3rd-Party Integrations (ITSM, Email, Slack) ─────────────────

const integrationsConcepts: ConceptSection[] = [
  {
    title: 'ITSM Integration: ServiceNow and Jira',
    body: 'Integrating Falcon Fusion with IT Service Management tools closes the loop between security alerts and operational response workflows.\n\n**ServiceNow:** Fusion\'s Create Incident action creates a ServiceNow incident with pre-configured field mappings — caller, short description, priority, category, and assignment group. Use template variables to pre-fill the description with detection name, TI verdict, affected host, and investigation links. The created incident ID is available as an action output for downstream notifications.\n\n**Jira:** Similar Create Issue action — configure project key, issue type (Bug/Task/Story), priority, labels, and description. Jira integration is common for security teams that track remediation work alongside development in the same Jira project.\n\nBest practices:\n- Map Falcon severity to ITSM priority consistently (Critical→P1, High→P2, Medium→P3)\n- Pre-fill description with all enrichment context so analysts have everything in the ticket without accessing Falcon\n- Always store the ticket ID in a workflow variable for use in notifications',
  },
  {
    title: 'Email and Messaging Platform Integration',
    body: '**Email via SMTP:** Fusion\'s Send Email action supports dynamic recipients, subject, and HTML body. Use for formal stakeholder notifications, compliance reporting, and non-SOC communication (e.g., notifying a department head that their employee\'s device was contained).\n\n**Slack via Webhook:** Configure a Slack webhook in your workspace, paste the URL into the Fusion Slack action, and compose the message with template variables. Supports Markdown formatting — bold for critical fields, code blocks for IOCs, links for Falcon URLs.\n\n**Microsoft Teams:** Similar webhook-based integration. Teams uses Adaptive Card JSON for rich message formatting — more complex to configure but produces better-structured messages than plain text.\n\nChoosing the right channel:\n- P1 Critical: PagerDuty (guaranteed delivery, on-call paging) + Slack #soc-critical (team awareness)\n- P2 High: Slack #soc-alerts + email to ticket assignee\n- P3 Medium: ticket only (no real-time notification)\n- Daily summaries: scheduled email to management',
  },
]

const integrationsQuestions: QuizQuestion[] = [
  {
    id: 'soar-int-q1',
    text: 'When configuring a Fusion ServiceNow ticket creation action, what information should always be pre-filled in the ticket description?',
    options: [
      'Detection name, TI verdict, affected hostname, computed priority, and direct Falcon detection link',
      'Only the detection ID — analysts can retrieve all other context by looking up the detection in Falcon',
      'The full raw JSON payload from the Fusion trigger event',
      'The Falcon console URL homepage so analysts know where to log in',
    ],
    correctIndex: 0,
    explanation: 'The ITSM ticket should be self-contained — an analyst should be able to understand the alert and begin response directly from the ticket without accessing Falcon. Detection name, TI verdict, hostname, priority, and the direct Falcon link provide the complete picture. Raw JSON is unreadable in a ticket. A generic Falcon homepage URL is useless — link directly to the detection.',
    docTitle: 'Falcon Fusion ServiceNow Integration',
    docUrl: 'https://falcon.crowdstrike.com/documentation/page/falcon-fusion-integrations',
  },
  {
    id: 'soar-int-q2',
    text: 'How should Falcon detection severity be mapped to ITSM ticket priority?',
    options: [
      'Critical → P1, High → P2, Medium → P3, Low → P4 (or no ticket)',
      'All security detections → P1 to ensure the fastest response times',
      'ITSM priority should be manually set by the analyst after reviewing the ticket',
      'Map based on affected asset type: servers always P1, workstations always P3',
    ],
    correctIndex: 0,
    explanation: 'Mapping Falcon severity to ITSM priority consistently ensures the ITSM SLA engine correctly prioritises security tickets. All P1 generates ticket storm and desensitises responders. Manual priority setting by analysts defeats the automation. Asset-type mapping is less accurate than severity-based mapping — a Critical detection on a workstation may still be P1.',
    docTitle: 'Falcon Fusion ITSM Priority Mapping',
    docUrl: 'https://falcon.crowdstrike.com/documentation/page/falcon-fusion-integrations',
  },
  {
    id: 'soar-int-q3',
    text: 'For a P1 Critical incident, which notification combination ensures both immediate human response AND team-wide awareness?',
    options: [
      'PagerDuty on-call page (guaranteed delivery, paging escalation) + Slack #soc-critical (team visibility)',
      'Email to the SOC team distribution list (reliably reaches all members)',
      'Slack #soc-general message (maximum audience visibility)',
      'Create a ServiceNow ticket only — the assignee is automatically paged by ServiceNow',
    ],
    correctIndex: 0,
    explanation: 'P1 requires both guaranteed delivery to the on-call analyst (PagerDuty handles escalation if unacknowledged) and team visibility (Slack ensures the broader SOC is aware). Email is too slow for P1. #soc-general creates noise for non-SOC members. A ticket alone does not guarantee immediate human attention — ServiceNow paging requires specific configuration that many organisations do not have.',
    docTitle: 'SOC Alert Routing Standards',
    docUrl: 'https://falcon.crowdstrike.com/documentation/page/falcon-fusion-integrations',
  },
  {
    id: 'soar-int-q4',
    text: 'A Fusion workflow creates a ServiceNow ticket and then sends a Slack notification that includes the ticket number. In which order must these actions run?',
    options: [
      'Create ServiceNow ticket first — the ticket ID from its output is then used in the Slack message template',
      'Send Slack first — notify the team immediately, then create the ticket asynchronously',
      'Both can run in parallel — the Slack action can reference the ticket ID before it is created',
      'The order does not matter — Fusion caches all action outputs at the end of execution',
    ],
    correctIndex: 0,
    explanation: 'Action output variables (like the ServiceNow ticket ID) are only available after the action completes. The Slack notification that includes {{actions.createTicket.ticket_id}} must run AFTER the Create Ticket action — otherwise the variable resolves to an empty string. Parallel execution would have the same problem — the Slack action cannot reference output that hasn\'t been generated yet.',
    docTitle: 'Falcon Fusion Action Ordering',
    docUrl: 'https://falcon.crowdstrike.com/documentation/page/falcon-fusion-integrations',
  },
  {
    id: 'soar-int-q5',
    text: 'Which Fusion notification action is most appropriate for formally notifying a department head (non-SOC) that their employee\'s device was contained and is temporarily unavailable?',
    options: [
      'Send Email — formal, asynchronous communication appropriate for non-SOC stakeholders who do not use Slack or Teams',
      'Send Slack message — reaches all internal users via the company Slack workspace',
      'Create ServiceNow ticket — department heads can be assigned tickets for their awareness',
      'PagerDuty page — ensures immediate delivery to the department head',
    ],
    correctIndex: 0,
    explanation: 'Email is the correct channel for formal, non-operational communication to stakeholders outside the SOC. Department heads typically do not monitor the security Slack channels. ITSM tickets are for tracking work, not stakeholder notification. PagerDuty is for on-call engineering teams — using it for department heads would be inappropriate and alarming.',
    docTitle: 'Fusion Notification Channel Selection',
    docUrl: 'https://falcon.crowdstrike.com/documentation/page/falcon-fusion-integrations',
  },
]

export const integrationsModule: ContentModule = {
  id: 'soar-integrations-third-party',
  title: '3rd-Party Integrations (ITSM, Email, Slack)',
  trackId: 'soar-integrations',
  domainId: 'soar',
  order: 1,
  lastReviewed: '2026-08-17',
  concepts: integrationsConcepts,
  quiz: integrationsQuestions,
}

// ── Module 2.4.2: Testing, Versioning & Playbook Governance ───────────────────

const governanceConcepts: ConceptSection[] = [
  {
    title: 'Testing Playbooks Before Production',
    body: 'Fusion provides a testing approach to validate workflows without executing destructive actions:\n\n**Test mode / simulation:** Some Falcon environments support running a workflow against a real or synthetic event in a sandbox mode where response actions (Contain Host, Delete File, Disable Account) are logged but not executed. Notification actions (email, Slack, ticket) may still fire — configure test notification targets (a dedicated #fusion-testing Slack channel) to avoid alerting real stakeholders.\n\n**Step-by-step validation:**\n1. Enable the workflow in a non-production Falcon environment with a lab device as the test target\n2. Trigger a detection manually on the lab device\n3. Review the execution log: verify each action input/output, check template variable resolution, confirm branch conditions evaluated correctly\n4. Confirm no unintended actions fired\n5. Repeat with edge cases: missing TI verdict, asset not in lookup table, duplicate trigger\n\nNever enable a new production playbook without at least one full test-path execution.',
  },
  {
    title: 'Versioning and Governance',
    body: '**Versioning:** Fusion does not have native version control (no git-style history). Best practice:\n- Before editing a production playbook, duplicate it (Save As copy)\n- Name the copy with a version suffix: "Auto-Contain Critical v1" → backup, edit original to create v2\n- Keep the previous version disabled (not deleted) as a rollback option for 30 days\n- Document changes in the playbook description with date and author\n\n**Governance framework — every playbook must have:**\n- **Owner:** named analyst responsible for the playbook (not a team — one person)\n- **Purpose and scope:** one-paragraph description of what it does and what it does NOT do\n- **Review date:** the next scheduled review (quarterly for production playbooks)\n- **Escalation path:** what happens if the playbook fails\n- **Change log:** brief notes on what changed in each version\n\n**Quarterly review checklist:**\n- Does the playbook still fire on the right events? (Check trigger filter validity)\n- Are action outputs still formatted correctly? (Check template variables against current payload schemas)\n- Are the integrations still valid? (Check webhook URLs, ServiceNow connectivity, TI query quotas)\n- Have thresholds or conditions become misaligned with the current threat landscape?',
  },
]

const governanceQuestions: QuizQuestion[] = [
  {
    id: 'soar-int-q6',
    text: 'What is the recommended approach before editing a production Falcon Fusion playbook?',
    options: [
      'Duplicate the playbook first (Save As), then edit the original — keeping the duplicate as a disabled rollback copy',
      'Edit the production playbook directly — Fusion tracks all changes automatically in a version history',
      'Export the playbook to JSON as a backup, then edit and re-import if needed',
      'Disable the playbook before editing to prevent it from firing on incomplete changes',
    ],
    correctIndex: 0,
    explanation: 'Falcon Fusion does not have native version control. Duplicating the playbook before editing creates a manually managed rollback copy. If the edited version causes issues, restore by re-enabling the backup. JSON export is less reliable (import may fail after platform updates). Editing while disabled still overwrites the previous state without a backup.',
    docTitle: 'Falcon Fusion Versioning Practices',
    docUrl: 'https://falcon.crowdstrike.com/documentation/page/falcon-fusion-governance',
  },
  {
    id: 'soar-int-q7',
    text: 'During testing of a new Fusion playbook, the Slack notification action sends a message to #soc-critical. How should you prevent real analysts from being alerted during testing?',
    options: [
      'Configure the test notification target to a dedicated #fusion-testing Slack channel, not the production #soc-critical channel',
      'Test without the Slack action — add it back only after production deployment',
      'Disable the Slack workspace during testing to prevent message delivery',
      'Testing with real channels is acceptable — analysts understand test notifications are not real alerts',
    ],
    correctIndex: 0,
    explanation: 'Using a dedicated test channel (e.g., #fusion-testing) routes test notifications away from production monitoring channels. Analysts in #soc-critical should only receive genuine alerts — test messages cause confusion and erode trust in the channel. Removing the Slack action for testing means the notification path is not validated. Disabling the Slack workspace is impractical.',
    docTitle: 'Fusion Testing Channels',
    docUrl: 'https://falcon.crowdstrike.com/documentation/page/falcon-fusion-governance',
  },
  {
    id: 'soar-int-q8',
    text: 'What does a quarterly playbook review check that a one-time activation test does NOT?',
    options: [
      'Whether trigger conditions are still valid (API schemas change), integrations still work (webhook URLs expire), and thresholds are still appropriate for the current threat environment',
      'Whether the playbook executed at least once successfully',
      'Whether the playbook has a documented owner and description',
      'Whether the playbook has been approved by the CISO',
    ],
    correctIndex: 0,
    explanation: 'A one-time activation test validates the playbook at a point in time. Quarterly reviews detect drift: API payload schemas may have changed (breaking template variables), webhook URLs may have expired (breaking integrations), and detection thresholds may be miscalibrated for today\'s threat landscape. Owner/description are set at creation; CISO approval is a one-time governance step.',
    docTitle: 'Fusion Quarterly Review Process',
    docUrl: 'https://falcon.crowdstrike.com/documentation/page/falcon-fusion-governance',
  },
  {
    id: 'soar-int-q9',
    text: 'A production playbook has no named owner — it was built by an analyst who left the organisation. What is the risk of leaving it running without an owner?',
    options: [
      'Nobody validates or tunes it — false positives accumulate, thresholds drift, and integrations break without anyone noticing or fixing them',
      'The playbook will automatically disable itself after 90 days without an active owner',
      'Ownerless playbooks run less frequently to conserve platform resources',
      'There is no risk — playbooks execute independently of ownership records',
    ],
    correctIndex: 0,
    explanation: 'Ownership is accountability. An ownerless playbook has no one to review quarterly, fix broken integrations, or tune misaligned thresholds. Over time it silently becomes unreliable — generating false positives that analysts ignore or missing threats because conditions no longer match real attack patterns. Assign an owner immediately; the owner is responsible for ongoing governance.',
    docTitle: 'Falcon Fusion Playbook Ownership',
    docUrl: 'https://falcon.crowdstrike.com/documentation/page/falcon-fusion-governance',
  },
  {
    id: 'soar-int-q10',
    text: 'Which of the following is a valid edge case that MUST be tested before a triage playbook goes to production?',
    options: [
      'A detection where the TI lookup returns no verdict (the indicator is not in the database) — to verify the playbook handles missing enrichment data gracefully',
      'A detection that fires on a Saturday — to verify the playbook runs outside business hours',
      'A detection where the severity value is null — which cannot occur in the Falcon schema',
      'A detection from a host running an OS version released after the playbook was written',
    ],
    correctIndex: 0,
    explanation: 'Missing TI verdict is a common real-world edge case — not every IOC is in the CrowdStrike database. If the playbook assumes a verdict is always present and routes on its value, a missing verdict will cause the condition to evaluate incorrectly, potentially skipping escalation for a real threat. Test this path explicitly to confirm the playbook defaults to a safe behaviour (e.g., treat unknown as suspicious).',
    docTitle: 'Falcon Fusion Edge Case Testing',
    docUrl: 'https://falcon.crowdstrike.com/documentation/page/falcon-fusion-governance',
  },
]

export const governanceModule: ContentModule = {
  id: 'soar-integrations-governance',
  title: 'Testing, Versioning & Playbook Governance',
  trackId: 'soar-integrations',
  domainId: 'soar',
  order: 2,
  lastReviewed: '2026-08-17',
  concepts: governanceConcepts,
  quiz: governanceQuestions,
}

// ── Track 2.4 Scenario ────────────────────────────────────────────────────────

const integrationsScenario: Scenario = {
  id: 'soar-integrations-scenario',
  title: 'Integration Rollout: Connecting Fusion to Your ITSM Stack',
  context: 'Your organisation is expanding Falcon Fusion from internal SOC notifications to a full ITSM integration. The project requires: (1) ServiceNow ticket creation for all High/Critical detections, (2) Slack notifications for the SOC, (3) PagerDuty pages for on-call P1 escalations, and (4) a governance framework to maintain the integrations over time. You are the Fusion owner leading the rollout.',
  isCumulative: false,
  steps: [
    {
      id: 'soar-int-s1',
      narrative: 'You configure the ServiceNow Create Incident action. The field mapping includes: Short Description = "{{trigger.display_name}}", Priority = "{{trigger.severity}}", Description = "{{trigger.description}}". In testing, the ticket Priority field shows "Critical" instead of "1 - Critical" (the ServiceNow P1 format). What is the fix?',
      choices: [
        { text: 'Add a Switch/Case condition to map Falcon severity values (Critical, High) to ServiceNow priority values (1, 2) before the ticket creation action' },
        { text: 'Change the ServiceNow field mapping to use Priority = 1 hardcoded — all security tickets should be P1' },
        { text: 'Submit a ServiceNow configuration change request to accept raw Falcon severity strings as priority values' },
        { text: 'Use the severity string as-is — ServiceNow will auto-correct the priority format on ticket save' },
      ],
      correctChoiceIndex: 0,
      wrongConsequence: 'Hardcoding P1 means Medium detections create P1 tickets — breaking SLA expectations and burying genuine P1s in noise. Expecting ServiceNow to auto-correct is unreliable — the field validation will likely reject the raw string. A ServiceNow config change is outside the Fusion owner\'s control and takes weeks.',
      reasoning: 'Falcon severity (string: "Critical", "High") must be mapped to ServiceNow priority (integer: 1, 2, 3, 4) before passing to the ticket action. A Switch/Case condition stores the mapped integer in a custom variable, which is then referenced in the ticket action\'s Priority field.',
      docTitle: 'Falcon Fusion ServiceNow Mapping',
      docUrl: 'https://falcon.crowdstrike.com/documentation/page/falcon-fusion-integrations',
    },
    {
      id: 'soar-int-s2',
      narrative: 'After fixing the priority mapping, you test a P1 scenario. The ServiceNow ticket is created correctly, but the Slack message shows "Ticket: " with no ticket number — the template uses {{actions.serviceNow.incident_number}} but the output field is actually {{actions.serviceNow.sys_id}}. What do you fix and what lesson does this reinforce?',
      choices: [
        { text: 'Update the template to use the correct output field name {{actions.serviceNow.sys_id}}. Lesson: always inspect action output schemas in the Fusion execution log to confirm exact field names before using them in templates' },
        { text: 'Add a "Get Ticket" action after creation to retrieve the ticket number separately' },
        { text: 'Use the ticket URL instead of the ticket number in the Slack message' },
        { text: 'Remove the ticket reference from the Slack message — ticket IDs are internal to ServiceNow' },
      ],
      correctChoiceIndex: 0,
      wrongConsequence: 'Adding a "Get Ticket" action adds latency and complexity when the data is already in the creation action output — you just need the correct field name. Using the URL alone is less readable than a ticket number + URL. Removing the reference leaves the Slack message less useful.',
      reasoning: 'The fix is a single template variable name correction. The deeper lesson is that action output field names must be verified against the actual execution log output — not assumed. Fusion\'s template syntax silently produces empty strings for invalid paths, so testing is the only way to catch output field name errors.',
      docTitle: 'Falcon Fusion Action Output Schema',
      docUrl: 'https://falcon.crowdstrike.com/documentation/page/falcon-fusion-variables',
    },
    {
      id: 'soar-int-s3',
      narrative: 'Three weeks post-launch, analysts report the PagerDuty pages stopped firing. The Fusion execution log shows the PagerDuty action completing with status SUCCESS but no pages are being received. What is the likely cause and first diagnostic step?',
      choices: [
        { text: 'The PagerDuty integration key (routing key) may have been rotated or the service disabled — verify the integration key is still valid in the PagerDuty console and matches the Fusion action configuration' },
        { text: 'Fusion\'s PagerDuty action has a 30-day expiry and must be reconfigured monthly' },
        { text: 'PagerDuty recently changed its API format and the action payload is now invalid' },
        { text: 'The Falcon sensor update changed the trigger payload structure, causing the PagerDuty action to skip' },
      ],
      correctChoiceIndex: 0,
      wrongConsequence: 'There is no 30-day expiry on Fusion actions. API format changes would typically cause action failures, not SUCCESS with no delivery. Payload structure changes would affect all actions, not only PagerDuty. The most common cause of "action succeeds but no delivery" is an invalid or rotated integration key that the receiving system quietly ignores.',
      reasoning: '"SUCCESS" in Fusion means the HTTP request was sent and received a 200 response — it does not confirm the page was delivered to an on-call engineer. PagerDuty returns 200 even for requests with invalid or decommissioned routing keys. The first diagnostic step is to verify the integration key is active in PagerDuty and matches what Fusion is using.',
      docTitle: 'Falcon Fusion Integration Troubleshooting',
      docUrl: 'https://falcon.crowdstrike.com/documentation/page/falcon-fusion-integrations',
    },
    {
      id: 'soar-int-s4',
      narrative: 'You establish a quarterly governance review for all Fusion playbooks. For the first review (90 days post-launch), a junior analyst proposes reviewing only the playbooks that fired more than 100 times — "since they have the most impact". What is wrong with this approach?',
      choices: [
        { text: 'Low-firing playbooks may have broken silently — a playbook that fired 0 times may have a broken trigger condition or failed integration, missing all the detections it should have caught' },
        { text: 'The approach is correct — high-frequency playbooks have more impact and should be prioritised' },
        { text: 'The threshold of 100 is too low — review only playbooks that fired more than 1000 times' },
        { text: 'Quarterly reviews should be based on playbook age, not execution count' },
      ],
      correctChoiceIndex: 0,
      wrongConsequence: 'High-frequency review only catches overactive playbooks. Low-firing or zero-firing playbooks are the more dangerous blind spot — they should be catching threats but may have silently broken. A playbook with 0 executions in 90 days is either covering a rare scenario (legitimate) or broken (critical). Both cases need review.',
      reasoning: 'Quarterly reviews must cover ALL playbooks. A playbook that fired 0 times in 90 days could mean: (1) no detections matched the trigger — expected if it covers rare scenarios, or (2) the trigger condition broke, the integration failed, or the playbook was accidentally disabled. Without reviewing, you cannot tell which. Both explanations require attention.',
      docTitle: 'Fusion Quarterly Review Framework',
      docUrl: 'https://falcon.crowdstrike.com/documentation/page/falcon-fusion-governance',
    },
    {
      id: 'soar-int-s5',
      narrative: 'After 6 months of operation, a manager asks for the ROI of the Fusion integration. You have execution logs showing 847 P1 detections handled, with average automated response time of 8 seconds vs. the previous 23-minute manual triage average. A colleague suggests also quantifying MTTR reduction. What is the most credible way to present this data?',
      choices: [
        { text: 'Present the measured data (8-second automated triage vs 23-minute manual), calculate analyst hours saved (847 × 22.87 minutes ÷ 60), and compare MTTR before and after using incident closure timestamps from ServiceNow' },
        { text: 'State that the integration is "10x faster" without specific data — the qualitative improvement is obvious' },
        { text: 'Ask CrowdStrike for industry benchmark data to substitute for your organisation\'s actual metrics' },
        { text: 'Estimate cost savings by multiplying analyst hours saved by average fully-loaded analyst cost, but do not present the raw timing data as it may be questioned' },
      ],
      correctChoiceIndex: 0,
      wrongConsequence: '"10x faster" without data is unverifiable and easy to dismiss. Industry benchmarks do not reflect your specific environment. Presenting only cost savings without the underlying measurement methodology opens you to challenges. Presenting both the measured timing data AND the derived metrics (hours saved, MTTR delta) gives a complete, verifiable picture.',
      reasoning: 'Credible ROI presentation requires measured data (8-second vs 23-minute triage), derived metrics (analyst hours saved from the measured delta), and outcome metrics (MTTR from ServiceNow timestamps). This chain — raw measurement → derived efficiency → business outcome — is transparent and defensible. Each number traces back to a system of record.',
      docTitle: 'SOAR ROI Measurement',
      docUrl: 'https://falcon.crowdstrike.com/documentation/page/falcon-fusion-governance',
    },
  ],
}

// ── Track 2.4 Export ──────────────────────────────────────────────────────────

export const integrationsTrack: ContentTrack = {
  id: 'soar-integrations',
  title: 'Integrations & Advanced',
  domainId: 'soar',
  order: 4,
  modules: [integrationsModule, governanceModule],
  scenario: integrationsScenario,
}
```

- [ ] **Step 2: Add import and track to `soar.ts`**

```typescript
import { integrationsTrack } from './soar-track-2-4'
// tracks: [foundationsTrack, workflowBuilderTrack, playbookDesignTrack, integrationsTrack]
```

- [ ] **Step 3: TypeScript check + tests**

```
npx tsc --noEmit
npm test
```

- [ ] **Step 4: Commit**

```
git add src/content/domains/soar-track-2-4.ts src/content/domains/soar.ts
git commit -m "feat: add SOAR Track 2.4 Integrations & Advanced modules and scenario"
```

---

### Task 5: SOAR Cumulative Scenario + Final Wiring

Replace the stub cumulative scenario in `soar.ts` with a full 6-step cross-domain capstone scenario.

**Files:**
- Modify: `src/content/domains/soar.ts`

- [ ] **Step 1: Replace the `soarCumulativeScenario` stub in `soar.ts`**

Find the stub (it has `steps: []` and `context: 'Coming in a future content release.'`). Replace the entire constant with:

```typescript
const soarCumulativeScenario: Scenario = {
  id: 'soar-cumulative',
  title: 'SOAR Capstone: End-to-End Automated Incident Response',
  context: 'This scenario applies all Falcon Fusion SOAR skills: triggers, conditions, actions, variables, playbook design, and governance. A ransomware detection fires at 02:14 on a Saturday morning — outside business hours. Your automated playbooks must handle the complete response: triage, containment, communication, and recovery tracking — with zero manual intervention until the on-call analyst is paged and acknowledges.',
  isCumulative: true,
  steps: [
    {
      id: 'soar-cum-s1',
      narrative: 'At 02:14, a Critical detection fires: "Ransomware: STOP/DJVU" on host FINANCE-PC-07, a production host tagged "critical-asset". Your triage playbook triggers. Step 1 is a TI lookup on the malware hash. The TI action returns verdict = "malicious" with confidence = 98. Step 2 checks asset criticality — FINANCE-PC-07 has criticality tag "Critical". The scoring step evaluates: malicious TI + Critical asset. What priority should the scoring condition assign?',
      choices: [
        { text: 'P1 — the combination of malicious TI verdict and Critical-tagged asset meets the highest priority threshold' },
        { text: 'P2 — ransomware on a workstation is always P2 regardless of TI verdict' },
        { text: 'P3 — it is outside business hours so P1 should be downgraded to avoid waking the on-call engineer' },
        { text: 'Unknown — the scoring step cannot run until an analyst manually reviews the TI result' },
      ],
      correctChoiceIndex: 0,
      wrongConsequence: 'P2 ignores asset criticality — a Critical production finance host with confirmed ransomware is P1 regardless of device type. Downgrading severity based on time of day is dangerous; 02:14 is exactly when P1 requires on-call paging. Requiring manual review before scoring defeats the purpose of automated triage.',
      reasoning: 'The triage scoring rule is: malicious TI + Critical asset = P1. Time of day is irrelevant to severity — it may affect who is notified (on-call vs daytime team) but not the threat classification. P1 at 02:14 is the correct assessment and triggers on-call paging.',
      docTitle: 'Falcon Fusion Triage Scoring',
      docUrl: 'https://falcon.crowdstrike.com/documentation/page/falcon-fusion-playbook-design',
    },
    {
      id: 'soar-cum-s2',
      narrative: 'The triage playbook scores the detection as P1. The next actions in the workflow are: (A) Contain FINANCE-PC-07, (B) Create ServiceNow P1 incident, (C) Page on-call via PagerDuty. Which execution order is correct for A and B, and can C run in parallel with A?',
      choices: [
        { text: 'A (Contain) and C (PagerDuty) run in parallel first — containment stops the threat while the on-call is paged. B (ServiceNow ticket) runs after A completes so the ticket includes the containment status.' },
        { text: 'B (ticket) first, then A (contain), then C (page) — the ticket must exist before any actions are taken' },
        { text: 'All three must run sequentially: A then B then C — parallel execution is not supported for critical actions' },
        { text: 'C (page) first to wake the on-call analyst before any automated actions are taken' },
      ],
      correctChoiceIndex: 0,
      wrongConsequence: 'Creating a ticket before containment leaves the ransomware running while the ITSM record is being written. Sequential A→B→C adds unnecessary latency. Paging before containment means ransomware continues spreading for the minutes it takes the analyst to acknowledge and respond.',
      reasoning: 'Containment is the top priority — stop the threat immediately. C (paging) can run in parallel since it does not depend on containment completing. B (ticket) benefits from running after A so the containment status can be referenced in the ticket description. Parallel A+C, then B is the most efficient and safe ordering.',
      docTitle: 'Falcon Fusion Parallel Action Design',
      docUrl: 'https://falcon.crowdstrike.com/documentation/page/falcon-fusion-actions',
    },
    {
      id: 'soar-cum-s3',
      narrative: 'FINANCE-PC-07 is contained. The PagerDuty page fires and the on-call analyst acknowledges at 02:19 — 5 minutes after detection. The ServiceNow P1 ticket is created. However, the ticket Description field shows: "Host: . Verdict: . Detection: Ransomware: STOP/DJVU." — the hostname and verdict fields are blank. What is the root cause?',
      choices: [
        { text: 'The ticket description template contains variable references that resolved to empty strings — the field paths are incorrect (e.g. a typo in the variable path or wrong action output name)' },
        { text: 'Parallel execution caused a race condition — the TI action output was not available when the ticket was created' },
        { text: 'ServiceNow strips variable content from descriptions for security reasons' },
        { text: 'The ticket was created before the detection trigger payload was fully loaded' },
      ],
      correctChoiceIndex: 0,
      wrongConsequence: 'The ticket runs after the TI action completes (sequential), so TI output is available — no race condition. ServiceNow does not strip content. The trigger payload is available immediately when the workflow starts. Silent empty strings from malformed template variable paths is the correct diagnosis.',
      reasoning: 'Fusion template variables that reference wrong paths produce empty strings silently — the action still succeeds. Blank hostname and verdict fields in the ticket description indicate the variable paths (e.g., {{trigger.device.hostname}} and {{actions.threatIntel.verdict}}) are malformed or reference wrong field names. Check the execution log input/output to find the correct paths.',
      docTitle: 'Fusion Template Variable Debugging',
      docUrl: 'https://falcon.crowdstrike.com/documentation/page/falcon-fusion-variables',
    },
    {
      id: 'soar-cum-s4',
      narrative: 'You fix the template variable paths. The on-call analyst investigates and determines the detection is genuine ransomware. They find the ransomware accessed a shared drive — potentially 3 additional hosts accessed that share in the past hour. The analyst triggers a manual investigation workflow with the shared drive path as an input parameter. What should this workflow do?',
      choices: [
        { text: 'Query Falcon for all hosts that accessed the shared drive path in the past hour, then loop over the results to contain each host and create linked sub-tickets in the P1 ServiceNow incident' },
        { text: 'Send a Slack message to the SOC team listing the shared drive path and ask analysts to identify affected hosts manually' },
        { text: 'Contain all hosts in the Finance department — if one host is infected the whole department is at risk' },
        { text: 'Close the current P1 and open a new incident for each of the 3 additional hosts separately' },
      ],
      correctChoiceIndex: 0,
      wrongConsequence: 'Manual identification defeats the purpose of automation during an active incident. Containing the entire Finance department is an excessive blast radius — only hosts that actually accessed the share are likely affected. Closing and reopening incidents fragments the investigation trail.',
      reasoning: 'A targeted automated response is correct: query for hosts that specifically accessed the share (not the entire department), loop over results to contain each one, and link all sub-tickets to the parent P1 for unified tracking. This limits the blast radius to confirmed exposure while automating the containment of all affected hosts.',
      docTitle: 'Falcon Fusion Loop and RTR Actions',
      docUrl: 'https://falcon.crowdstrike.com/documentation/page/falcon-fusion-actions',
    },
    {
      id: 'soar-cum-s5',
      narrative: 'Three additional hosts are contained. The analyst determines FINANCE-PC-07 must be re-imaged — a 2-hour process. They also confirm the malware hash should be blocked across the organisation. A Fusion action is available to Block Indicator. Should this action be included in the automated workflow or require manual analyst approval?',
      choices: [
        { text: 'Block Indicator can be automated for this scenario — a confirmed malicious hash from active ransomware is high-confidence and the action is organisation-wide with controllable impact. Include in the workflow with an analyst-approval step as a governance gate.' },
        { text: 'Block Indicator must always be manual — blocking any indicator without human approval is against SOAR best practices' },
        { text: 'Block Indicator should be fully automated with no approval step — confirmed malicious hashes should be blocked instantly' },
        { text: 'Block Indicator is not available in Falcon Fusion — it must be done in the Falcon console manually' },
      ],
      correctChoiceIndex: 0,
      wrongConsequence: '"Always manual" is too conservative — it eliminates a key SOAR benefit for high-confidence scenarios. "Fully automated with no approval" skips the governance gate — indicator blocking affects every Falcon-protected host and a false positive could block a legitimate business tool. Block Indicator is available in Fusion.',
      reasoning: 'Indicator blocking has organisation-wide impact — a false positive blocks a legitimate hash on all endpoints simultaneously. This warrants a brief analyst-approval gate even for high-confidence scenarios. The Approval action pauses the workflow, sends an approval request with context (hash, confidence, scope), and only proceeds when approved. This balances speed with control.',
      docTitle: 'Falcon Fusion Block Indicator Action',
      docUrl: 'https://falcon.crowdstrike.com/documentation/page/falcon-fusion-actions',
    },
    {
      id: 'soar-cum-s6',
      narrative: 'The incident is resolved at 07:45 (5.5 hours after detection). The analyst closes the ServiceNow incident as True Positive. A recovery workflow triggers on incident closure. It must: release containment on all 4 hosts, verify the indicator block is in place, and generate a post-incident report. What is the correct trigger for this recovery workflow?',
      choices: [
        { text: 'Incident trigger — filtered to status change: Closed (True Positive), linked to the P1 incident. This fires automatically when the analyst closes the incident.' },
        { text: 'Schedule trigger — run nightly to check for closed incidents and clean up containment' },
        { text: 'Manual trigger — the analyst must explicitly run the recovery workflow after closing the incident' },
        { text: 'Detection trigger — fires when the original ransomware detection is marked resolved' },
      ],
      correctChoiceIndex: 0,
      wrongConsequence: 'A schedule trigger introduces up to 24 hours of unnecessary containment for resolved incidents. A manual trigger requires the analyst to remember an extra step after a 5.5-hour incident — a failure-prone dependency on human memory at the end of a stressful response. A detection trigger fires on detection resolution, not incident closure — these are different events.',
      reasoning: 'The Incident trigger filtered to status = Closed (True Positive) fires automatically the moment the analyst closes the incident — no additional manual steps needed. The trigger payload includes the incident ID, which the recovery workflow uses to identify the linked hosts, devices, and indicators to clean up. This closes the full automation loop.',
      docTitle: 'Falcon Fusion Incident Trigger',
      docUrl: 'https://falcon.crowdstrike.com/documentation/page/falcon-fusion-triggers',
    },
  ],
}
```

The domain export in `soar.ts` already has `cumulativeScenario: soarCumulativeScenario` — since you are replacing the constant with the same name, the export line does not change.

- [ ] **Step 2: TypeScript check + tests**

```
npx tsc --noEmit
npm test
```

Expected: no errors, all tests pass.

- [ ] **Step 3: Commit**

```
git add src/content/domains/soar.ts
git commit -m "feat: add SOAR cumulative scenario completing the SOAR domain content"
```

---

## Self-Review

**Spec coverage:**
- ✅ Track 2.1: 2 modules (What is Fusion, Triggers) + 5-step scenario
- ✅ Track 2.2: 3 modules (Actions Library, Conditions/Branching/Loops, Variables/Templates) + 5-step scenario
- ✅ Track 2.3: 3 modules (Anatomy, Triage & Escalation, Remediation) + PlaybookChallenge (5-step ordering on Module 2) + 5-step scenario
- ✅ Track 2.4: 2 modules (3rd-Party Integrations, Testing/Versioning/Governance) + 5-step scenario
- ✅ SOAR cumulative scenario: 6 steps (end-to-end Saturday-morning ransomware capstone)

**Placeholder scan:** No TBD, TODO, or placeholder text anywhere. All concept body text, quiz questions (4 options each with explanation + docTitle + docUrl), PlaybookChallenge (5 steps + 5 explanations), scenario steps (narrative + 4 choices + wrongConsequence + reasoning + docTitle + docUrl) are fully authored.

**Type consistency:**
- All `PlaybookStep` objects have `id`, `label`, `action`
- `PlaybookChallenge` has `type: 'playbook'`, `id`, `prompt`, `scenario`, `steps`, `stepExplanations` (same length as `steps` = 5)
- All module `trackId` values match the parent track's `id`
- Track orders: 2.1=1, 2.2=2, 2.3=3, 2.4=4
- Quiz ID uniqueness: `soar-f-q1..q10`, `soar-wf-q1..q15`, `soar-pb-q1..q15`, `soar-int-q1..q10` — all distinct, no collisions

**Unused import risk:** Only import types that are used in each file. Track 2.3 imports `PlaybookChallenge` and `PlaybookStep` — both used. Tracks 2.1, 2.2, 2.4 do NOT import `PlaybookChallenge`/`PlaybookStep` or `CqlChallenge` — they have no challenges.
