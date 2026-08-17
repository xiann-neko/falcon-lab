import type { ContentDomain, Scenario } from '../types'
import { fdrTrack } from './platform-track-5-1'
import { apiTrack } from './platform-track-5-2'
import { governanceTrack } from './platform-track-5-3'
import { threatIntelTrack } from './platform-track-5-4'

const platformCumulativeScenario: Scenario = {
  id: 'platform-cumulative',
  title: 'Platform Mastery: Full-Stack Security Engineering Incident',
  context: 'A new zero-day exploit targeting a popular enterprise application is being actively exploited in the wild. Falcon Intelligence has just published an advisory with IOCs, TTPs, and a threat actor profile. Your job is to integrate the intelligence, detect any evidence of compromise in your environment, automate the response, and report findings — using every Platform Essentials capability.',
  isCumulative: true,
  steps: [
    {
      id: 'pf-cum-s1',
      narrative: 'Falcon Intelligence publishes the advisory with 12 high-confidence IOCs (IPs and hashes, all confidence ≥ 90). You need them operational in LogScale immediately. What is the fastest correct path to detection coverage?',
      choices: [
        // Distribution s1=0: correct answer at index 0
        { text: 'Import the IOCs into the malicious-ips and malicious-hashes LogScale lookup tables immediately — existing CQL saved searches using lookup() against these tables will automatically match the new IOCs as soon as the import completes, with zero query changes required' },
        { text: 'Write new individual CQL saved searches for each of the 12 IOCs — hardcoded IOC values in saved searches ensure deterministic matching without lookup table latency' },
        { text: 'Email the IOCs to the SOC team and ask analysts to manually check each one against FDR telemetry before formalising detection' },
        { text: 'Submit the IOCs to CrowdStrike support for addition to the Falcon platform shared detection engine — custom IOC operationalisation requires support ticket processing' },
      ],
      correctChoiceIndex: 0,
      wrongConsequence: 'Writing 12 individual saved searches is slow and creates 12 rules to maintain instead of 1 lookup table update. Manual analyst checking is a single-session activity, not persistent detection coverage. CrowdStrike support is not the channel for self-service IOC management — the Falcon console and API provide this directly.',
      reasoning: 'Lookup table import is the highest-leverage operationalisation path for multiple IOCs: update one file (or use the API to update the table), and all existing saved searches that reference it immediately start matching the new IOCs. No query changes required. For 12 high-confidence IOCs, immediate import is appropriate — no manual pre-validation needed at this confidence level.',
      docTitle: 'LogScale Lookup Table Import',
      docUrl: 'https://library.humio.com/falcon-logscale/docs-lookup-files.html',
    },
    {
      id: 'pf-cum-s2',
      narrative: 'You run a retroactive LogScale query against 30 days of FDR data. Two endpoints have DNS requests to advisory C2 domains from 11 days ago. You need to investigate via the Falcon API. Which endpoint and method retrieves full details for these two specific devices?',
      choices: [
        { text: 'GET /devices/queries/devices/v1?filter=hostname:\'ENDPOINT-A\' — query by hostname to get device details directly' },
        // Distribution s2=1: correct answer at index 1
        { text: 'Step 1: GET /devices/queries/devices/v1?filter=hostname:\'ENDPOINT-A\'+hostname:\'ENDPOINT-B\' to get AIDs; Step 2: POST /devices/entities/devices/v2 with the AIDs in the request body to get full device details — the standard two-step query-then-fetch pattern' },
        { text: 'POST /devices/entities/devices/v2 with hostnames in the body — entity endpoints accept both AIDs and hostnames' },
        { text: 'GET /detects/queries/detects/v1?filter=device.hostname:\'ENDPOINT-A\' — detection queries include host detail data inline' },
      ],
      correctChoiceIndex: 1,
      wrongConsequence: 'The query endpoint returns IDs, not details — GET /devices/queries/devices/v1 returns AIDs, not full device information. POST /devices/entities/devices/v2 accepts AIDs, not hostnames. Detection query endpoints return detection IDs, not device details inline.',
      reasoning: 'The Falcon API query-then-fetch pattern: Step 1 queries for device AIDs using FQL filter on hostname; Step 2 POSTs those AIDs to the entity endpoint to retrieve full details (sensor version, last seen, containment status, OS version). This two-step pattern is consistent across all Falcon API resource types.',
      docTitle: 'Falcon Devices API',
      docUrl: 'https://falcon.crowdstrike.com/documentation/page/falcon-api-devices',
    },
    {
      id: 'pf-cum-s3',
      narrative: 'The API confirms both endpoints have active Falcon sensors and are not currently contained. Your SOAR playbook should now contain ENDPOINT-A (confirmed compromise indicators) but requires analyst approval before containing ENDPOINT-B (less clear evidence). Which Fusion SOAR design handles this correctly?',
      choices: [
        { text: 'Auto-contain both endpoints immediately — the 11-day dwell time justifies immediate containment without analyst review for either endpoint' },
        { text: 'Send an analyst approval request for both endpoints — no automated containment should occur without explicit approval for every action' },
        // Distribution s3=2: correct answer at index 2
        { text: 'Auto-contain ENDPOINT-A (confirmed compromise) via `POST /devices/action/v2` with action_name=contain; simultaneously send an analyst approval workflow for ENDPOINT-B with the evidence summary — confirmed and unconfirmed compromise warrant different automation levels' },
        { text: 'Do not contain either endpoint — containment decisions must always escalate to the CISO before execution' },
      ],
      correctChoiceIndex: 2,
      wrongConsequence: 'Auto-containing both without review ignores the evidence quality difference — ENDPOINT-B\'s less clear evidence may turn out to be a false positive. Requiring analyst approval for both delays the confirmed compromise (ENDPOINT-A) unnecessarily. CISO escalation before all containment is operationally impractical for routine incident response.',
      reasoning: 'Risk-calibrated automation: confirmed compromise (ENDPOINT-A) justifies automated containment immediately — every minute of delay extends dwell time. Unconfirmed compromise (ENDPOINT-B) warrants an analyst review workflow with the evidence presented. This is the SOAR design principle of matching automation level to evidence quality and action reversibility.',
      docTitle: 'Falcon Fusion SOAR Containment Design',
      docUrl: 'https://falcon.crowdstrike.com/documentation/page/falcon-fusion-soar',
    },
    {
      id: 'pf-cum-s4',
      narrative: 'Investigation confirms ENDPOINT-A had the zero-day backdoor installed 11 days ago. You have the backdoor\'s SHA256 hash — it is not yet in the Falcon Intelligence feed. You want all other Falcon-protected endpoints to detect it immediately. What two actions should you take?',
      choices: [
        { text: 'Add the hash to the FDR event filter configuration — FDR will flag the hash in the telemetry stream before LogScale ingestion' },
        { text: 'Create a Falcon custom IOC only — the custom IOC automatically propagates to LogScale lookup tables through the FDR integration' },
        { text: 'Submit the hash to CrowdStrike through the intelligence portal and wait for it to be added to the shared feed — custom IOC creation is not self-service' },
        // Distribution s4=3: correct answer at index 3
        { text: 'Update the LogScale malicious-hashes lookup table with the new hash AND create a Falcon custom IOC (action=Detect) for the SHA256 — the lookup table enables retrospective detection in LogScale queries; the custom IOC enables real-time Falcon sensor detection on all endpoints going forward' },
      ],
      correctChoiceIndex: 3,
      wrongConsequence: 'FDR does not have an event filter for hashes — it is a raw telemetry export. Custom IOCs do NOT automatically propagate to LogScale lookup tables — these are separate systems that must be updated independently. Waiting for CrowdStrike to add it to the shared feed delays coverage by days.',
      reasoning: 'Two complementary updates are required: (1) Lookup table update → historical detection in LogScale queries (any future CQL search against FDR telemetry will match this hash retroactively); (2) Custom Falcon IOC (action=Detect) → real-time sensor detection (all Falcon sensors immediately detect the hash if it appears on any endpoint). Neither alone provides complete coverage.',
      docTitle: 'IOC Dual-Coverage Strategy',
      docUrl: 'https://falcon.crowdstrike.com/documentation/page/falcon-intelligence-ioc',
    },
    {
      id: 'pf-cum-s5',
      narrative: 'The CISO needs a briefing in 2 hours. They want the executive dashboard updated to show the current incident impact and a one-time incident summary report emailed to the board security committee. What is the fastest way to produce the report?',
      choices: [
        // Distribution s5=0: correct answer at index 0
        { text: 'Create a one-time LogScale saved search capturing: incident timeline, affected endpoints, C2 connections, response actions taken — export as CSV and email to the board committee; separately verify the CISO\'s live dashboard link reflects current data; no new report infrastructure needed' },
        { text: 'Build a new executive dashboard specifically for the incident and share a new link with the board committee' },
        { text: 'Write a manual narrative report in Word from memory — LogScale query results should not be sent to board-level stakeholders' },
        { text: 'Create a new scheduled search that will deliver the report in 24 hours — scheduled searches are the only compliant way to email LogScale data' },
      ],
      correctChoiceIndex: 0,
      wrongConsequence: 'Building a new dashboard for a one-time briefing takes time better spent on the investigation. Manual memory-based reports introduce accuracy risk. Scheduled searches deliver on a recurring schedule — a one-time immediate email requires a saved search run and manual export, not a scheduled search that delivers in 24 hours.',
      reasoning: 'For a one-time urgent report: run a targeted LogScale saved search, export the results as CSV, and email directly. The CISO\'s existing live dashboard link continues to show real-time metrics — it does not need to be rebuilt. Two separate deliverables: the one-time CSV export (for the board committee) and the live dashboard link (for the CISO). Both can be ready within minutes.',
      docTitle: 'LogScale Reporting for Incident Communication',
      docUrl: 'https://library.humio.com/falcon-logscale/docs-alerts-scheduled-searches.html',
    },
    {
      id: 'pf-cum-s6',
      narrative: 'Post-incident, the CISO asks: "How do we ensure our FDR and API integrations are compliant and our access is appropriately governed? What should our quarterly review cover?" What is the complete answer?',
      choices: [
        { text: 'A quarterly review should check only the API client list and rotate all client secrets on a fixed quarterly schedule' },
        // Distribution s6=1: correct answer at index 1
        { text: 'A quarterly review should check: (1) API client audit — verify all clients are documented, their scopes match their stated purpose, and unused clients are removed; (2) LogScale RBAC — confirm repository access matches current team roles and off-boarded users are removed; (3) IOC governance — review stale IOC expiry and zero-hit IOC relevance; (4) FDR S3 lifecycle — verify retention policy removes data older than the defined retention period; (5) Scheduled search health — confirm recurring reports are delivering correctly and still relevant' },
        { text: 'Quarterly reviews are unnecessary for mature SIEM/SOAR platforms — annual reviews aligned with SOC 2 audit cycles are sufficient' },
        { text: 'The quarterly review should focus exclusively on LogScale query performance and storage cost optimisation — governance items are covered by the annual security review' },
      ],
      correctChoiceIndex: 1,
      wrongConsequence: 'A review limited to API client secrets misses the majority of governance scope. Annual-only reviews create 9-month windows where stale access, unused IOCs, and undocumented integrations accumulate risk unchecked. Query performance and storage optimisation are operational concerns, not governance — treating them as a substitute for access control review leaves RBAC, IOC hygiene, and report health ungoverned.',
      reasoning: 'A comprehensive quarterly governance review covers five areas: API client inventory and scope validation; LogScale RBAC access verification (including off-boarding); IOC list hygiene (stale indicators, zero-hit review, expiry enforcement); FDR S3 retention compliance; and scheduled search health. Each area has a quarterly risk rhythm: API clients accumulate without cleanup, RBAC drifts as teams change, IOCs go stale, S3 costs grow, and scheduled searches break silently.',
      docTitle: 'SIEM/SOAR Governance Review Framework',
      docUrl: 'https://falcon.crowdstrike.com/documentation/page/falcon-rbac',
    },
  ],
}

export const platformDomain = {
  id: 'platform',
  title: 'Platform Essentials',
  emoji: '🔧',
  order: 5,
  tracks: [fdrTrack, apiTrack, governanceTrack, threatIntelTrack],
  cumulativeScenario: platformCumulativeScenario,
} satisfies ContentDomain
