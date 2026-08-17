import type { ContentDomain, Scenario } from '../types'
import { foundationsTrack } from './soar-track-2-1'
import { workflowBuilderTrack } from './soar-track-2-2'
import { playbookDesignTrack } from './soar-track-2-3'
import { integrationsTrack } from './soar-track-2-4'

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
        { text: 'B (ticket) first, then A (contain), then C (page) — the ticket must exist before any actions are taken' },
        { text: 'A (Contain) and C (PagerDuty) run in parallel first — containment stops the threat while the on-call is paged. B (ServiceNow ticket) runs after A completes so the ticket includes the containment status.' },
        { text: 'All three must run sequentially: A then B then C — parallel execution is not supported for critical actions' },
        { text: 'C (page) first to wake the on-call analyst before any automated actions are taken' },
      ],
      correctChoiceIndex: 1,
      wrongConsequence: 'Creating a ticket before containment leaves the ransomware running while the ITSM record is being written. Sequential A→B→C adds unnecessary latency. Paging before containment means ransomware continues spreading for the minutes it takes the analyst to acknowledge and respond.',
      reasoning: 'Containment is the top priority — stop the threat immediately. C (paging) can run in parallel since it does not depend on containment completing. B (ticket) benefits from running after A so the containment status can be referenced in the ticket description. Parallel A+C, then B is the most efficient and safe ordering.',
      docTitle: 'Falcon Fusion Parallel Action Design',
      docUrl: 'https://falcon.crowdstrike.com/documentation/page/falcon-fusion-actions',
    },
    {
      id: 'soar-cum-s3',
      narrative: 'FINANCE-PC-07 is contained. The PagerDuty page fires and the on-call analyst acknowledges at 02:19 — 5 minutes after detection. The ServiceNow P1 ticket is created. However, the ticket Description field shows: "Host: . Verdict: . Detection: Ransomware: STOP/DJVU." — the hostname and verdict fields are blank. What is the root cause?',
      choices: [
        { text: 'Parallel execution caused a race condition — the TI action output was not available when the ticket was created' },
        { text: 'ServiceNow strips variable content from descriptions for security reasons' },
        { text: 'The ticket description template contains variable references that resolved to empty strings — the field paths are incorrect (e.g. a typo in the variable path or wrong action output name)' },
        { text: 'The ticket was created before the detection trigger payload was fully loaded' },
      ],
      correctChoiceIndex: 2,
      wrongConsequence: 'The ticket runs after the TI action completes (sequential), so TI output is available — no race condition. ServiceNow does not strip content. The trigger payload is available immediately when the workflow starts. Silent empty strings from malformed template variable paths is the correct diagnosis.',
      reasoning: 'Fusion template variables that reference wrong paths produce empty strings silently — the action still succeeds. Blank hostname and verdict fields in the ticket description indicate the variable paths (e.g., {{trigger.device.hostname}} and {{actions.threatIntel.verdict}}) are malformed or reference wrong field names. Check the execution log input/output to find the correct paths.',
      docTitle: 'Fusion Template Variable Debugging',
      docUrl: 'https://falcon.crowdstrike.com/documentation/page/falcon-fusion-variables',
    },
    {
      id: 'soar-cum-s4',
      narrative: 'You fix the template variable paths. The on-call analyst investigates and determines the detection is genuine ransomware. They find the ransomware accessed a shared drive — potentially 3 additional hosts accessed that share in the past hour. The analyst triggers a manual investigation workflow with the shared drive path as an input parameter. What should this workflow do?',
      choices: [
        { text: 'Send a Slack message to the SOC team listing the shared drive path and ask analysts to identify affected hosts manually' },
        { text: 'Contain all hosts in the Finance department — if one host is infected the whole department is at risk' },
        { text: 'Close the current P1 and open a new incident for each of the 3 additional hosts separately' },
        { text: 'Query Falcon for all hosts that accessed the shared drive path in the past hour, then loop over the results to contain each host and create linked sub-tickets in the P1 ServiceNow incident' },
      ],
      correctChoiceIndex: 3,
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
        { text: 'Schedule trigger — run nightly to check for closed incidents and clean up containment' },
        { text: 'Incident trigger — filtered to status change: Closed (True Positive), linked to the P1 incident. This fires automatically when the analyst closes the incident.' },
        { text: 'Manual trigger — the analyst must explicitly run the recovery workflow after closing the incident' },
        { text: 'Detection trigger — fires when the original ransomware detection is marked resolved' },
      ],
      correctChoiceIndex: 1,
      wrongConsequence: 'A schedule trigger introduces up to 24 hours of unnecessary containment for resolved incidents. A manual trigger requires the analyst to remember an extra step after a 5.5-hour incident — a failure-prone dependency on human memory at the end of a stressful response. A detection trigger fires on detection resolution, not incident closure — these are different events.',
      reasoning: 'The Incident trigger filtered to status = Closed (True Positive) fires automatically the moment the analyst closes the incident — no additional manual steps needed. The trigger payload includes the incident ID, which the recovery workflow uses to identify the linked hosts, devices, and indicators to clean up. This closes the full automation loop.',
      docTitle: 'Falcon Fusion Incident Trigger',
      docUrl: 'https://falcon.crowdstrike.com/documentation/page/falcon-fusion-triggers',
    },
  ],
}

export const soarDomain = {
  id: 'soar',
  title: 'Falcon Fusion SOAR',
  emoji: '⚡',
  order: 2,
  tracks: [foundationsTrack, workflowBuilderTrack, playbookDesignTrack, integrationsTrack],
  cumulativeScenario: soarCumulativeScenario,
} satisfies ContentDomain
