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
    codeLanguage: 'typescript',
    body: 'Integrating Falcon Fusion with IT Service Management tools closes the loop between security alerts and operational response workflows.\n\n**ServiceNow:** Fusion\'s Create Incident action creates a ServiceNow incident with pre-configured field mappings — caller, short description, priority, category, and assignment group. Use template variables to pre-fill the description with detection name, TI verdict, affected host, and investigation links. The created incident ID is available as an action output for downstream notifications.\n\n**Jira:** Similar Create Issue action — configure project key, issue type (Bug/Task/Story), priority, labels, and description. Jira integration is common for security teams that track remediation work alongside development in the same Jira project.\n\nBest practices:\n- Map Falcon severity to ITSM priority consistently (Critical→P1, High→P2, Medium→P3)\n- Pre-fill description with all enrichment context so analysts have everything in the ticket without accessing Falcon\n- Always store the ticket ID in a workflow variable for use in notifications',
  },
  {
    title: 'Email and Messaging Platform Integration',
    codeLanguage: 'typescript',
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
      'All security detections → P1 to ensure the fastest response times',
      'Critical → P1, High → P2, Medium → P3, Low → P4 (or no ticket)',
      'ITSM priority should be manually set by the analyst after reviewing the ticket',
      'Map based on affected asset type: servers always P1, workstations always P3',
    ],
    correctIndex: 1,
    explanation: 'Mapping Falcon severity to ITSM priority consistently ensures the ITSM SLA engine correctly prioritises security tickets. All P1 generates ticket storm and desensitises responders. Manual priority setting by analysts defeats the automation. Asset-type mapping is less accurate than severity-based mapping — a Critical detection on a workstation may still be P1.',
    docTitle: 'Falcon Fusion ITSM Priority Mapping',
    docUrl: 'https://falcon.crowdstrike.com/documentation/page/falcon-fusion-integrations',
  },
  {
    id: 'soar-int-q3',
    text: 'For a P1 Critical incident, which notification combination ensures both immediate human response AND team-wide awareness?',
    options: [
      'Email to the SOC team distribution list (reliably reaches all members)',
      'Slack #soc-general message (maximum audience visibility)',
      'PagerDuty on-call page (guaranteed delivery, paging escalation) + Slack #soc-critical (team visibility)',
      'Create a ServiceNow ticket only — the assignee is automatically paged by ServiceNow',
    ],
    correctIndex: 2,
    explanation: 'P1 requires both guaranteed delivery to the on-call analyst (PagerDuty handles escalation if unacknowledged) and team visibility (Slack ensures the broader SOC is aware). Email is too slow for P1. #soc-general creates noise for non-SOC members. A ticket alone does not guarantee immediate human attention — ServiceNow paging requires specific configuration that many organisations do not have.',
    docTitle: 'SOC Alert Routing Standards',
    docUrl: 'https://falcon.crowdstrike.com/documentation/page/falcon-fusion-integrations',
  },
  {
    id: 'soar-int-q4',
    text: 'A Fusion workflow creates a ServiceNow ticket and then sends a Slack notification that includes the ticket number. In which order must these actions run?',
    options: [
      'Send Slack first — notify the team immediately, then create the ticket asynchronously',
      'Both can run in parallel — the Slack action can reference the ticket ID before it is created',
      'The order does not matter — Fusion caches all action outputs at the end of execution',
      'Create ServiceNow ticket first — the ticket ID from its output is then used in the Slack message template',
    ],
    correctIndex: 3,
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
    codeLanguage: 'typescript',
    body: 'Fusion provides a testing approach to validate workflows without executing destructive actions:\n\n**Test mode / simulation:** Some Falcon environments support running a workflow against a real or synthetic event in a sandbox mode where response actions (Contain Host, Delete File, Disable Account) are logged but not executed. Notification actions (email, Slack, ticket) may still fire — configure test notification targets (a dedicated #fusion-testing Slack channel) to avoid alerting real stakeholders.\n\n**Step-by-step validation:**\n1. Enable the workflow in a non-production Falcon environment with a lab device as the test target\n2. Trigger a detection manually on the lab device\n3. Review the execution log: verify each action input/output, check template variable resolution, confirm branch conditions evaluated correctly\n4. Confirm no unintended actions fired\n5. Repeat with edge cases: missing TI verdict, asset not in lookup table, duplicate trigger\n\nNever enable a new production playbook without at least one full test-path execution.',
  },
  {
    title: 'Versioning and Governance',
    codeLanguage: 'typescript',
    body: '**Versioning:** Fusion does not have native version control (no git-style history). Best practice:\n- Before editing a production playbook, duplicate it (Save As copy)\n- Name the copy with a version suffix: "Auto-Contain Critical v1" → backup, edit original to create v2\n- Keep the previous version disabled (not deleted) as a rollback option for 30 days\n- Document changes in the playbook description with date and author\n\n**Governance framework — every playbook must have:**\n- **Owner:** named analyst responsible for the playbook (not a team — one person)\n- **Purpose and scope:** one-paragraph description of what it does and what it does NOT do\n- **Review date:** the next scheduled review (quarterly for production playbooks)\n- **Escalation path:** what happens if the playbook fails\n- **Change log:** brief notes on what changed in each version\n\n**Quarterly review checklist:**\n- Does the playbook still fire on the right events? (Check trigger filter validity)\n- Are action outputs still formatted correctly? (Check template variables against current payload schemas)\n- Are the integrations still valid? (Check webhook URLs, ServiceNow connectivity, TI query quotas)\n- Have thresholds or conditions become misaligned with the current threat landscape?',
  },
]

const governanceQuestions: QuizQuestion[] = [
  {
    id: 'soar-int-q6',
    text: 'What is the recommended approach before editing a production Falcon Fusion playbook?',
    options: [
      'Edit the production playbook directly — Fusion tracks all changes automatically in a version history',
      'Duplicate the playbook first (Save As), then edit the original — keeping the duplicate as a disabled rollback copy',
      'Export the playbook to JSON as a backup, then edit and re-import if needed',
      'Disable the playbook before editing to prevent it from firing on incomplete changes',
    ],
    correctIndex: 1,
    explanation: 'Falcon Fusion does not have native version control. Duplicating the playbook before editing creates a manually managed rollback copy. If the edited version causes issues, restore by re-enabling the backup. JSON export is less reliable (import may fail after platform updates). Editing while disabled still overwrites the previous state without a backup.',
    docTitle: 'Falcon Fusion Versioning Practices',
    docUrl: 'https://falcon.crowdstrike.com/documentation/page/falcon-fusion-governance',
  },
  {
    id: 'soar-int-q7',
    text: 'During testing of a new Fusion playbook, the Slack notification action sends a message to #soc-critical. How should you prevent real analysts from being alerted during testing?',
    options: [
      'Test without the Slack action — add it back only after production deployment',
      'Disable the Slack workspace during testing to prevent message delivery',
      'Configure the test notification target to a dedicated #fusion-testing Slack channel, not the production #soc-critical channel',
      'Testing with real channels is acceptable — analysts understand test notifications are not real alerts',
    ],
    correctIndex: 2,
    explanation: 'Using a dedicated test channel (e.g., #fusion-testing) routes test notifications away from production monitoring channels. Analysts in #soc-critical should only receive genuine alerts — test messages cause confusion and erode trust in the channel. Removing the Slack action for testing means the notification path is not validated. Disabling the Slack workspace is impractical.',
    docTitle: 'Fusion Testing Channels',
    docUrl: 'https://falcon.crowdstrike.com/documentation/page/falcon-fusion-governance',
  },
  {
    id: 'soar-int-q8',
    text: 'What does a quarterly playbook review check that a one-time activation test does NOT?',
    options: [
      'Whether the playbook executed at least once successfully',
      'Whether the playbook has a documented owner and description',
      'Whether the playbook has been approved by the CISO',
      'Whether trigger conditions are still valid (API schemas change), integrations still work (webhook URLs expire), and thresholds are still appropriate for the current threat environment',
    ],
    correctIndex: 3,
    explanation: 'A one-time activation test validates the playbook at a point in time. Quarterly reviews detect drift: API payload schemas may have changed (breaking template variables), webhook URLs may have expired (breaking integrations), and detection thresholds may be miscalibrated for today\'s threat landscape. Owner/description are set at creation; CISO approval is a one-time governance step.',
    docTitle: 'Fusion Quarterly Review Process',
    docUrl: 'https://falcon.crowdstrike.com/documentation/page/falcon-fusion-governance',
  },
  {
    id: 'soar-int-q9',
    text: 'A production playbook has no named owner — it was built by an analyst who left of the organisation. What is the risk of leaving it running without an owner?',
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
      'A detection that fires on a Saturday — to verify the playbook runs outside business hours',
      'A detection where the TI lookup returns no verdict (the indicator is not in the database) — to verify the playbook handles missing enrichment data gracefully',
      'A detection where the severity value is null — which cannot occur in the Falcon schema',
      'A detection from a host running an OS version released after the playbook was written',
    ],
    correctIndex: 1,
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
        { text: 'Add a "Get Ticket" action after creation to retrieve the ticket number separately' },
        { text: 'Update the template to use the correct output field name {{actions.serviceNow.sys_id}}. Lesson: always inspect action output schemas in the Fusion execution log to confirm exact field names before using them in templates' },
        { text: 'Use the ticket URL instead of the ticket number in the Slack message' },
        { text: 'Remove the ticket reference from the Slack message — ticket IDs are internal to ServiceNow' },
      ],
      correctChoiceIndex: 1,
      wrongConsequence: 'Adding a "Get Ticket" action adds latency and complexity when the data is already in the creation action output — you just need the correct field name. Using the URL alone is less readable than a ticket number + URL. Removing the reference leaves the Slack message less useful.',
      reasoning: 'The fix is a single template variable name correction. The deeper lesson is that action output field names must be verified against the actual execution log output — not assumed. Fusion\'s template syntax silently produces empty strings for invalid paths, so testing is the only way to catch output field name errors.',
      docTitle: 'Falcon Fusion Action Output Schema',
      docUrl: 'https://falcon.crowdstrike.com/documentation/page/falcon-fusion-variables',
    },
    {
      id: 'soar-int-s3',
      narrative: 'Three weeks post-launch, analysts report the PagerDuty pages stopped firing. The Fusion execution log shows the PagerDuty action completing with status SUCCESS but no pages are being received. What is the likely cause and first diagnostic step?',
      choices: [
        { text: 'Fusion\'s PagerDuty action has a 30-day expiry and must be reconfigured monthly' },
        { text: 'PagerDuty recently changed its API format and the action payload is now invalid' },
        { text: 'The PagerDuty integration key (routing key) may have been rotated or the service disabled — verify the integration key is still valid in the PagerDuty console and matches the Fusion action configuration' },
        { text: 'The Falcon sensor update changed the trigger payload structure, causing the PagerDuty action to skip' },
      ],
      correctChoiceIndex: 2,
      wrongConsequence: 'There is no 30-day expiry on Fusion actions. API format changes would typically cause action failures, not SUCCESS with no delivery. Payload structure changes would affect all actions, not only PagerDuty. The most common cause of "action succeeds but no delivery" is an invalid or rotated integration key that the receiving system quietly ignores.',
      reasoning: '"SUCCESS" in Fusion means the HTTP request was sent and received a 200 response — it does not confirm the page was delivered to an on-call engineer. PagerDuty returns 200 even for requests with invalid or decommissioned routing keys. The first diagnostic step is to verify the integration key is active in PagerDuty and matches what Fusion is using.',
      docTitle: 'Falcon Fusion Integration Troubleshooting',
      docUrl: 'https://falcon.crowdstrike.com/documentation/page/falcon-fusion-integrations',
    },
    {
      id: 'soar-int-s4',
      narrative: 'You establish a quarterly governance review for all Fusion playbooks. For the first review (90 days post-launch), a junior analyst proposes reviewing only the playbooks that fired more than 100 times — "since they have the most impact". What is wrong with this approach?',
      choices: [
        { text: 'The approach is correct — high-frequency playbooks have more impact and should be prioritised' },
        { text: 'The threshold of 100 is too low — review only playbooks that fired more than 1000 times' },
        { text: 'Quarterly reviews should be based on playbook age, not execution count' },
        { text: 'Low-firing playbooks may have broken silently — a playbook that fired 0 times may have a broken trigger condition or failed integration, missing all the detections it should have caught' },
      ],
      correctChoiceIndex: 3,
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
