import type { ContentDomain, Scenario } from '../types'
import { foundationsTrack } from './charlotte-track-4-1'
import { usingCharlotteTrack } from './charlotte-track-4-2'
import { charlotteSoarTrack } from './charlotte-track-4-3'

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
        { text: 'The 72-hour history is a coincidence — the earlier connections to the same IP are unrelated to tonight\'s incident' },
        { text: 'The incident started tonight on CORP-FIN-01 — the 72-hour CORP-JUMP-01 connections are false positives because Charlotte AI\'s historical network queries are unreliable' },
        { text: 'CORP-JUMP-01 was likely the initial access point — connections to the C2 IP began 68 hours ago, 3 days before the first Falcon detection fired on CORP-FIN-01; the incident timeline extends at least 72 hours further back than the initial alert suggested' },
        { text: 'CORP-JUMP-01 connections indicate the attacker has already been detected and remediated by Falcon 72 hours ago — the current incident is a re-infection' },
      ],
      correctChoiceIndex: 2,
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
        { text: 'Accept it but add a 20% buffer — increase the reported scope by 20% to account for Charlotte AI\'s known accuracy limitations' },
        { text: 'Treat it as a partial answer — Charlotte AI\'s scope assessment is based on what data is in LogScale; devices without Falcon sensors, systems with gaps in telemetry coverage, or cloud workloads not ingested into LogScale are invisible to Charlotte AI\'s analysis; manually verify sensor coverage and check cloud workload logs separately' },
      ],
      correctChoiceIndex: 3,
      wrongConsequence: 'Accepting Charlotte AI\'s scope assessment as definitive creates false confidence in an incomplete picture. Rejecting all scope assessments from Charlotte AI ignores the significant investigative value it provides for covered devices. A "20% buffer" has no factual basis. The correct approach is: treat Charlotte AI\'s scope as accurate for the telemetry it has access to, then verify coverage gaps separately.',
      reasoning: 'A "20% buffer" is not meaningful engineering practice. The correct approach is to treat Charlotte AI\'s scope assessment as accurate for devices and data sources within your LogScale telemetry, while recognizing a critical caveat: "the 4 identified devices appear to be the full scope" only holds if every device in your environment has a Falcon sensor deployed, all telemetry is ingested into LogScale, and cloud workloads are included. For a 72-hour dwell-time incident, manually verify sensor coverage on all devices in the affected network segment and check cloud workload logs separately before declaring scope closed. Devices without Falcon sensors, cloud workloads not forwarded to LogScale, and network segments with no telemetry are all invisible to Charlotte AI\'s analysis.',
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

export const charlotteAiDomain = {
  id: 'charlotte-ai',
  title: 'Charlotte AI',
  emoji: '🤖',
  order: 4,
  tracks: [foundationsTrack, usingCharlotteTrack, charlotteSoarTrack],
  cumulativeScenario: charlotteCumulativeScenario,
} satisfies ContentDomain
