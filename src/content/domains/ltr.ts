import type { ContentDomain, Scenario } from '../types'
import { dataArchitectureTrack } from './ltr-track-3-1'
import { optimizationTrack } from './ltr-track-3-2'

const ltrCumulativeScenario: Scenario = {
  id: 'ltr-cumulative',
  title: 'LTR Capstone: 7-Year Compliance Audit',
  context: 'A financial services regulator has notified your organisation that it will conduct a data retention audit in one week. The requirement: prove you can retrieve specific user authentication events from exactly 7 years ago within 4 hours, and demonstrate that only authorised personnel have ever accessed that data. Your LogScale + LTR infrastructure must pass the audit.',
  isCumulative: true,
  steps: [
    {
      id: 'ltr-cum-s1',
      narrative: 'Before writing a single query, what is the first operational check you must perform?',
      choices: [
        { text: 'Confirm that 7-year-old authentication data exists in LTR — verify the retention policy has been set to ≥2555 days since before the data was ingested and that no retention change retroactively deleted it' },
        { text: 'Run a test query immediately to see how fast LTR responds' },
        { text: 'Contact CrowdStrike support to request a performance guarantee for the 4-hour SLA' },
        { text: 'Export all LTR data to a separate system for the auditors to review directly' },
      ],
      correctChoiceIndex: 0,
      wrongConsequence: 'Running a query before confirming the data exists wastes time and may produce zero results for reasons unrelated to query quality. CrowdStrike support cannot guarantee query SLAs — that is a function of data volume and query design. Exporting all LTR data is impractical at scale and may take weeks.',
      reasoning: 'The first check in any compliance audit scenario is data existence verification. LogScale\'s retention policy is not retroactive — if the retention was set to 7 years from day one and has never been reduced, the data should exist. Check the retention policy configuration history and confirm the effective retention at the time the 7-year-old data was ingested. If data was deleted by a previous policy change, no query can retrieve it.',
      docTitle: 'LogScale Retention Policy Verification',
      docUrl: 'https://falcon.crowdstrike.com/documentation/page/logscale-retention',
    },
    {
      id: 'ltr-cum-s2',
      narrative: 'You confirm 7-year retention has been in place since deployment. However, your LTR S3 bucket is configured in us-east-1 and your organisation\'s data residency policy requires EU storage for all EU citizen data. What is the compliance risk?',
      choices: [
        { text: 'No risk — AWS guarantees data stays within US-East and does not transfer it to EU without request' },
        { text: 'The LTR bucket region violates GDPR data residency requirements for EU citizen data — authentication events containing EU citizen identifiers are stored outside the permitted region, which is a regulatory breach independent of query performance' },
        { text: 'Minor risk — data residency applies only to personal data at rest in Hot tier, not LTR archive segments' },
        { text: 'No risk — the regulator conducting this audit is a financial services regulator, not a data protection authority' },
      ],
      correctChoiceIndex: 1,
      wrongConsequence: 'AWS does not guarantee data stays in a region unless you configure cross-region replication explicitly — and even then, the primary bucket is in us-east-1. GDPR data residency applies to all processing of EU personal data regardless of tier — LTR is not exempt. Financial services regulation and GDPR can apply simultaneously to the same data.',
      reasoning: 'GDPR Article 44 restricts transfer of EU personal data outside the EEA without adequate safeguards. LTR segments stored in us-east-1 containing EU authentication events constitute a transfer to a third country — a potential GDPR violation. This is a serious finding that must be escalated to the Data Protection Officer immediately, separate from the audit query performance question.',
      docTitle: 'LogScale LTR Data Residency',
      docUrl: 'https://falcon.crowdstrike.com/documentation/page/logscale-ltr',
    },
    {
      id: 'ltr-cum-s3',
      narrative: 'Setting the data residency issue aside for remediation, you write the audit query: retrieve all authentication events for user "j.rodriguez@corp.example" from exactly 7 years ago (August 2019). What must the query include?',
      choices: [
        { text: 'A wildcard search: `j.rodriguez* | start=2019-08-01T00:00:00Z end=2019-08-31T23:59:59Z`' },
        { text: 'A user filter only: `user="j.rodriguez@corp.example"` with no time bound — LogScale will search LTR automatically' },
        { text: 'Type and time filters first: `#type=authentication | start=2019-08-01T00:00:00Z end=2019-08-31T23:59:59Z | user="j.rodriguez@corp.example"`' },
        { text: 'groupBy first: `groupBy([user]) | user="j.rodriguez@corp.example" | start=2019-08-01T00:00:00Z end=2019-08-31T23:59:59Z`' },
      ],
      correctChoiceIndex: 2,
      wrongConsequence: 'A wildcard search (*) bypasses the type index — all segments across all sources are candidates for download. A user filter with no time bound triggers a full LTR scan across 7 years of all event types — this could run for many hours and blow the 4-hour SLA. groupBy before filtering produces semantically wrong results.',
      reasoning: 'LTR queries must lead with indexed metadata fields (#type=authentication) to use segment metadata pruning — skipping non-authentication segments without downloading them. The explicit monthly time bound (August 2019) then restricts the remaining segment set to one month. Only then does the user field filter run against the downloaded segments. This three-layer filter (type, time, field) is the minimum viable LTR query pattern for compliance lookups.',
      docTitle: 'LogScale LTR Query Best Practices',
      docUrl: 'https://falcon.crowdstrike.com/documentation/page/logscale-ltr',
    },
    {
      id: 'ltr-cum-s4',
      narrative: 'You run the optimised query. It returns the correct results in 2 hours 47 minutes — within the 4-hour SLA, but the auditor asks: "Can you guarantee sub-2-hour retrieval in all future audits?" How do you address this?',
      choices: [
        { text: 'Yes — once the query is optimised, LogScale caches the result and future runs of the same query are instant' },
        { text: 'Yes — LTR performance is stable and deterministic; the same query always takes the same time regardless of data volume changes' },
        { text: 'No — LTR has a hard cap of 4 hours per query and cannot be optimised further' },
        { text: 'No — LTR query time scales with matched segment count, which grows as more data is added; to guarantee sub-2-hour retrieval, pre-compute and cache compliance query results as scheduled saved searches rather than relying on on-demand LTR queries' },
      ],
      correctChoiceIndex: 3,
      wrongConsequence: 'LogScale does not cache LTR query results between separate query runs. LTR performance is not deterministic — it degrades as total data volume grows and as segment count for the target time range increases. There is no hard 4-hour cap — a poorly written LTR query can run indefinitely.',
      reasoning: 'The honest and technically correct answer is that on-demand LTR query time is not guaranteed. As more data accumulates, even a well-optimised query may slow over time. The architectural solution is to pre-compute compliance reports via scheduled saved searches: run the audit query monthly, store results in a dedicated summary repository, and provide auditors with the pre-computed results rather than triggering live LTR queries on demand.',
      docTitle: 'LogScale Scheduled Saved Searches',
      docUrl: 'https://falcon.crowdstrike.com/documentation/page/logscale-saved-searches',
    },
    {
      id: 'ltr-cum-s5',
      narrative: 'The auditor\'s second requirement: prove that only authorised staff have accessed the authentication repository in the past 7 years. What do you present?',
      choices: [
        { text: 'LogScale\'s _audit repository — it records every query with user identity, target repository, query text, and timestamp; export the 7-year audit log covering the authentication repository access history' },
        { text: 'The list of current RBAC role assignments — show which roles have access to the authentication repository today' },
        { text: 'A signed attestation from all analysts who ever worked at the organisation confirming they only accessed authorised repositories' },
        { text: 'The LogScale license agreement which specifies that only authorised users can access the platform' },
      ],
      correctChoiceIndex: 0,
      wrongConsequence: 'Current RBAC assignments show who has access now, not who accessed the data historically. Signed attestations are not an auditable technical control — they cannot be independently verified. A license agreement describes authorisation policies but provides no evidence of actual access events.',
      reasoning: 'The _audit repository is LogScale\'s tamper-evident record of all query activity. It records who ran which query, against which repository, over which time range, and when. This is the technical evidence an auditor needs to verify historical access control. The audit log must itself be retained in LTR to be available for 7-year lookback — confirm this retention is configured before the audit.',
      docTitle: 'LogScale Audit Repository',
      docUrl: 'https://falcon.crowdstrike.com/documentation/page/logscale-audit-log',
    },
    {
      id: 'ltr-cum-s6',
      narrative: 'After the audit passes, you want to prevent analysts from accidentally running unbounded queries against LTR in the future — protecting both query performance and cost. What operational control do you implement?',
      choices: [
        { text: 'Remove all analyst access to the LogScale UI — only compliance officers may run queries' },
        { text: 'Implement a query policy or governance rule requiring all saved searches and scheduled reports that access LTR to include an explicit time bound; document and communicate this as a team standard with code review for new saved searches' },
        { text: 'Configure LogScale to automatically terminate any query running longer than 30 minutes' },
        { text: 'Move all LTR data to Hot tier so queries are fast regardless of time bounds' },
      ],
      correctChoiceIndex: 1,
      wrongConsequence: 'Removing analyst access eliminates the investigative value of LTR entirely. Auto-terminating queries at 30 minutes may cancel legitimate long-running compliance queries without warning. Moving all data to Hot tier defeats the cost advantage of LTR and is likely cost-prohibitive for 7 years of data.',
      reasoning: 'The most practical and proportionate control is a query governance policy: all saved searches and scheduled reports that access LTR must include an explicit time bound. This is documented as a team standard, communicated in onboarding, and enforced through code review of new saved searches before they are published. It prevents accidental full-LTR scans without blocking legitimate compliance query access.',
      docTitle: 'LogScale Query Governance',
      docUrl: 'https://falcon.crowdstrike.com/documentation/page/logscale-administration',
    },
  ],
}

export const ltrDomain = {
  id: 'ltr',
  title: 'LTR & Data Tiers',
  emoji: '🗄️',
  order: 3,
  tracks: [dataArchitectureTrack, optimizationTrack],
  cumulativeScenario: ltrCumulativeScenario,
} satisfies ContentDomain
