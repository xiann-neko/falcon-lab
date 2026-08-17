import type {
  ContentModule,
  ContentTrack,
  QuizQuestion,
  ConceptSection,
  Scenario,
} from '../types'

// ═══════════════════════════════════════════════════════════════════════════════
// Track 3.2 — Optimization
// ═══════════════════════════════════════════════════════════════════════════════

// ── Module 3.2.1: Cost Optimization Strategies ────────────────────────────────

const costConcepts: ConceptSection[] = [
  {
    title: 'Reducing Ingestion Volume at the Source',
    body: 'In LogScale, storage cost scales directly with ingested data volume × retention period. The most cost-efficient intervention is reducing volume at the point of ingest — before data is written to any tier.\n\n**High-value / keep:** authentication logs, EDR telemetry, network connection logs, DNS, alert data — these feed detection rules and active investigations.\n\n**Low-value / reduce or drop:** application debug logs, verbose health check pings, duplicate heartbeat events, raw HTTP access logs where only anomalies matter.\n\nTo drop events in a parser, use a conditional expression:\n```\n// In a LogScale parser: drop health check events\nchecking(category) {\n  case health_check: drop()\n}\n```\n\nBefore dropping any event type, confirm: do any detection rules or saved searches query these events? Does a compliance requirement mandate retention? If both answers are "no", dropping is safe.',
    codeExample: '// Parser filter: drop noisy heartbeat events before storage\n// Only processes events where status != "heartbeat"\nstatus != heartbeat\n| parseJson()',
    codeLanguage: 'cql',
  },
  {
    title: 'Tiered Retention as a Cost Control',
    body: 'Not all retained data costs the same. Cost = volume per day × retention days. High-volume events with long retention are your biggest cost drivers.\n\n**Cost optimisation framework:**\n1. Measure daily ingestion volume per event type\n2. Multiply by retention days to get total stored GB per type\n3. Rank by stored GB — the top 3 types often account for 70%+ of total storage\n4. For each top cost driver, ask: Is this retention period justified by business/compliance need? Can we reduce it?\n5. Implement tag-based retention overrides to reduce retention on types where it is safe\n\n**LTR vs. deletion decision:** If a compliance requirement mandates long retention but the data is rarely queried, move it to LTR. If there is no compliance requirement, delete it after the operational window closes. LTR is much cheaper per GB than Hot or Warm — use it for must-keep, rarely-query data.',
  },
]

const costQuestions: QuizQuestion[] = [
  {
    id: 'ltr-opt-q1',
    text: 'Where is the most cost-efficient place to reduce LogScale storage volume?',
    options: [
      'At ingestion — drop or filter events in parsers before they are written to any tier',
      'In the LTR bucket — use S3 lifecycle rules to delete objects after their retention period',
      'In Hot tier — delete high-volume event types from Hot while keeping them in Warm and LTR',
      'In the LogScale UI — manually delete events from old repositories each week',
    ],
    correctIndex: 0,
    explanation: 'Dropping events at ingest time in parsers is the most efficient intervention — the event is never written to storage, never occupies index space, and never consumes query resources. Any reduction that happens after ingest (S3 lifecycle rules, manual deletion, Hot-only deletion) has already paid the ingestion and indexing cost. The parser is the last zero-cost filter before commitment to storage.',
    docTitle: 'LogScale Parser Volume Reduction',
    docUrl: 'https://falcon.crowdstrike.com/documentation/page/logscale-parsers',
  },
  {
    id: 'ltr-opt-q2',
    text: 'You find that a data source generates 500 GB/day but no detection rule has ever matched an event from it. What is the most appropriate action?',
    options: [
      'Keep it — the absence of matches means your environment is clean, which validates the source\'s value',
      'Reduce or eliminate ingestion of this source — 500 GB/day with zero detection value is pure storage cost with no security return',
      'Reduce its retention to 7 days and route it directly to LTR for low-cost archiving',
      'Increase detection rules targeting this source — the absence of matches indicates missing coverage, not absence of threats',
    ],
    correctIndex: 1,
    explanation: 'A data source that has never contributed to a detection, investigation, or saved search over a meaningful period is a strong candidate for elimination or significant volume reduction. 500 GB/day equates to roughly 15 TB/month of storage cost. Before cutting it entirely, confirm there are no compliance requirements mandating retention and no upcoming detection rules in development that would use it.',
    docTitle: 'LogScale Cost Optimisation',
    docUrl: 'https://falcon.crowdstrike.com/documentation/page/logscale-cost-optimisation',
  },
  {
    id: 'ltr-opt-q3',
    text: 'Your highest storage cost drivers are: (1) EDR telemetry 200 GB/day × 365 days, (2) DNS logs 400 GB/day × 90 days, (3) Application debug logs 1 TB/day × 30 days. Which is the biggest cost and what should you consider?',
    options: [
      'DNS logs (36 TB total) — 90-day retention is already aggressive; no change needed',
      'DNS logs (36 TB total) — reduce retention to 30 days to match application log retention',
      'Application debug logs (30 TB total) — consider dropping at ingest entirely if they serve no security detection purpose',
      'EDR telemetry (73 TB total) — consider reducing to 180 days retention; EDR is high-value for investigations',
    ],
    correctIndex: 2,
    explanation: 'Application debug logs at 1 TB/day × 30 days = 30 TB total. While EDR is the biggest single storage consumer (73 TB), it is high-value security data that justifies its cost. Debug logs are typically low-security-value and are the best candidate for ingest-time elimination. Dropping 1 TB/day saves approximately $X/month depending on tier pricing — the largest proportional reduction for the least security risk.',
    docTitle: 'LogScale Storage Cost Analysis',
    docUrl: 'https://falcon.crowdstrike.com/documentation/page/logscale-cost-optimisation',
  },
  {
    id: 'ltr-opt-q4',
    text: 'A compliance requirement mandates 5-year retention for network connection logs, but analysts rarely query data older than 6 months. What is the cost-optimal storage strategy?',
    options: [
      'Delete after 6 months — active query patterns define effective retention requirements',
      'Keep all 5 years in Warm tier — it balances cost and accessibility for medium-term data',
      'Keep all 5 years in Hot tier — compliance data must always be immediately accessible',
      'Keep 6 months in Hot/Warm for active use; move older data to LTR — satisfies compliance at LTR\'s lower per-GB cost while keeping recent data fast',
    ],
    correctIndex: 3,
    explanation: 'LTR provides a compliant long-term archive at a fraction of the cost of Hot or Warm storage. Keeping 6 months of actively-queried data in Hot/Warm maintains operational query performance. Older data in LTR satisfies the 5-year compliance requirement at minimal cost — the trade-off (slow LTR queries) is acceptable since analysts rarely need data older than 6 months.',
    docTitle: 'LogScale LTR Cost Strategy',
    docUrl: 'https://falcon.crowdstrike.com/documentation/page/logscale-cost-optimisation',
  },
  {
    id: 'ltr-opt-q5',
    text: 'What formula helps identify your biggest LogScale storage cost drivers?',
    options: [
      'Event type volume per day × retention days = total stored GB per type; rank by this product to find the highest-cost sources',
      'Event type count per hour ÷ query frequency = cost efficiency ratio',
      'Total ingested GB ÷ number of detection rules that use the source = cost-per-detection',
      'Storage tier price × number of repositories = total monthly cost',
    ],
    correctIndex: 0,
    explanation: 'The product of daily volume × retention days gives total stored GB per event type — the metric that directly drives storage cost. Ranking event types by this product identifies which sources consume the most storage. The top 3–5 types typically account for 60–80% of total cost and are therefore the highest-leverage targets for retention policy changes or ingest-time filtering.',
    docTitle: 'LogScale Storage Cost Calculation',
    docUrl: 'https://falcon.crowdstrike.com/documentation/page/logscale-cost-optimisation',
  },
]

export const costModule: ContentModule = {
  id: 'ltr-opt-cost',
  title: 'Cost Optimization Strategies',
  trackId: 'ltr-optimization',
  domainId: 'ltr',
  order: 1,
  lastReviewed: '2026-08-17',
  concepts: costConcepts,
  quiz: costQuestions,
}

// ── Module 3.2.2: Query Performance Across Tiers ─────────────────────────────

const queryPerfConcepts: ConceptSection[] = [
  {
    title: 'CQL Optimisation Principles by Tier',
    body: 'The fundamental principle for all LogScale query optimisation is: **filter first, aggregate last.** The earlier you reduce the event set, the less work all downstream operations do.\n\n**Hot tier optimisations:**\n- Always use `#type` tags — they are indexed and allow LogScale to skip entire segments\n- Avoid `*` wildcard field searches — they bypass indexing and scan event bytes\n- Use specific field names from your parser schema\n\n**Warm tier optimisations:**\n- Same rules as Hot\n- Add `| head 1000` for exploratory queries to avoid full-Warm scans\n- Prefer saved searches over ad-hoc queries for recurring Warm-range reports\n\n**LTR tier optimisations:**\n- Mandatory explicit time bounds (`start=` and `end=`)\n- Lead with `#type` or `source` for segment metadata pruning\n- Schedule all LTR queries as off-peak saved searches\n- Use `| head 1000` while validating query field references before running full aggregation',
    codeExample: '// Fast (indexed field filter first)\n#type=authentication | action=failed | groupBy([user], function=count())\n\n// Slow (wildcard bypasses index)\n* | action="failed" | groupBy([user], function=count())',
    codeLanguage: 'cql',
  },
  {
    title: 'Cross-Tier Query Patterns and Dashboard Design',
    body: 'When a query\'s time range spans multiple tiers (e.g. last 60 days covers both Hot and Warm), LogScale parallelises the tier queries where possible — but the slowest tier determines overall query time.\n\n**Explicit time bounds are mandatory for predictable performance.** Without them, every tier participates including LTR.\n\n**Dashboard design rules:**\n- Scope all dashboard widgets to Hot tier (recent 7–30 days) — LTR and Warm queries make dashboards unusably slow on refresh\n- For compliance or trend dashboards that need older data: pre-compute aggregations via scheduled saved searches and display the saved results, not live queries\n- Set explicit `start` and `end` parameters on every dashboard widget — never rely on the default "all time" window\n\n**Recurring report pattern:**\n- Write the query as a saved search\n- Schedule it off-peak (02:00 UTC)\n- Send results by email or export to a report store\n- Do not run monthly LTR queries interactively during business hours',
  },
]

const queryPerfQuestions: QuizQuestion[] = [
  {
    id: 'ltr-opt-q6',
    text: 'Which CQL pattern runs faster on LogScale Hot tier, and why?',
    options: [
      '`* | action="failed" | #type=authentication | groupBy([user], function=count())` — wildcard is evaluated fastest since it matches everything immediately',
      '`#type=authentication | action=failed | groupBy([user], function=count())`  — indexed type filter first eliminates irrelevant segments before field evaluation',
      '`groupBy([user], function=count()) | action=failed | #type=authentication` — aggregating first reduces the event set before filtering',
      'Both patterns run identically — LogScale internally reorders CQL operators for optimal execution',
    ],
    correctIndex: 1,
    explanation: 'Leading with #type=authentication uses the indexed type field to exclude all non-authentication segments from evaluation immediately. The wildcard pattern (*) bypasses indexing and forces LogScale to scan every event byte before the field filter can be applied. LogScale does NOT automatically reorder CQL operators. Aggregating before filtering is a logical error that produces wrong results (aggregates on unfiltered data).',
    docTitle: 'LogScale CQL Optimisation',
    docUrl: 'https://falcon.crowdstrike.com/documentation/page/logscale-query-performance',
  },
  {
    id: 'ltr-opt-q7',
    text: 'You are building a SOC dashboard widget that shows failed logins in the past 7 days. Which configuration gives the best dashboard refresh performance?',
    options: [
      'Set the widget\'s time range to last 90 days to ensure full Warm coverage for trend context',
      'Run the query against LTR to access the most complete historical baseline for anomaly detection',
      'Explicit start=now()-7d end=now() bound — scopes the query to Hot tier only, enabling sub-second dashboard refresh',
      'No time bound — LogScale will automatically scope to the most recent data for dashboards',
    ],
    correctIndex: 2,
    explanation: 'An explicit 7-day time bound keeps the dashboard query in Hot tier (NVMe SSD + in-memory index), enabling sub-second refresh. Without a time bound, the query hits all tiers and dashboard refresh can take minutes. 90-day Warm coverage adds latency unnecessarily for a "last 7 days" widget. LTR is never appropriate for live dashboards.',
    docTitle: 'LogScale Dashboard Performance',
    docUrl: 'https://falcon.crowdstrike.com/documentation/page/logscale-dashboards',
  },
  {
    id: 'ltr-opt-q8',
    text: 'A monthly compliance report requires querying 90 days of network connection logs. When should this query run and how?',
    options: [
      'Split the 90-day window into 30 three-day queries run in parallel to speed up total execution time',
      'Interactively at the start of each month — run it, then leave it open until results appear',
      'During peak business hours on the last day of the month — the cluster has the most capacity when all analysts are active',
      'As a scheduled saved search running off-peak (e.g. 02:00 UTC on the 1st of the month), with results delivered by email',
    ],
    correctIndex: 3,
    explanation: 'A 90-day query spanning Hot, Warm, and potentially LTR can run for 30+ minutes. Scheduling it as an off-peak saved search avoids competing with real-time detection workloads during business hours, and email delivery means the analyst finds results waiting for them rather than watching a progress bar. Parallel sub-queries do not help — they all compete for the same cluster resources and S3 bandwidth.',
    docTitle: 'LogScale Saved Search Scheduling',
    docUrl: 'https://falcon.crowdstrike.com/documentation/page/logscale-saved-searches',
  },
  {
    id: 'ltr-opt-q9',
    text: 'Two CQL queries target the same LTR data: (A) `#type=dns | start=... | domain=/.ru$/` and (B) `domain=/.ru$/ | start=... | #type=dns`. Which is faster and why?',
    options: [
      'Query A — #type=dns appears first and is stored in segment metadata, allowing LogScale to skip non-DNS segments before any S3 GET requests; domain is a full-text field that requires downloading and scanning event bytes',
      'Query B — LogScale is optimised for field-value filters before type tags in LTR mode',
      'Both are identical — LogScale evaluates all filters simultaneously as a set',
      'Query B — applying the domain regex first narrows the segment set before the type filter',
    ],
    correctIndex: 0,
    explanation: 'Query A is significantly faster. #type=dns is stored in LTR segment metadata — LogScale evaluates it without downloading segments, skipping all non-DNS segments entirely. The domain field requires the segment to be downloaded, decompressed, and scanned byte-by-byte. Placing #type first means far fewer segments are downloaded before the regex match runs. LogScale does not reorder operators.',
    docTitle: 'LogScale LTR Filter Order',
    docUrl: 'https://falcon.crowdstrike.com/documentation/page/logscale-ltr',
  },
  {
    id: 'ltr-opt-q10',
    text: 'Why should LogScale dashboard widgets never use "all time" (no time bound) as their query window?',
    options: [
      'LogScale limits dashboard widgets to 90 days by default — "all time" queries are silently truncated',
      'An all-time dashboard query hits all tiers including LTR — query time scales with years of archived data, making dashboard refresh take minutes to hours instead of seconds',
      '"All time" queries consume a special dashboard license that most organisations do not have',
      'All-time queries are only supported in the LogScale CLI, not the UI dashboard builder',
    ],
    correctIndex: 1,
    explanation: 'An "all time" window sends the dashboard query against every tier — including LTR, which may hold years of compressed data. Dashboard widgets must refresh automatically; a refresh that takes 30 minutes makes the dashboard operationally useless. All dashboard widgets must have explicit, recent time bounds (typically last 24h to last 7d) to keep queries scoped to Hot tier and refreshing in under a second.',
    docTitle: 'LogScale Dashboard Best Practices',
    docUrl: 'https://falcon.crowdstrike.com/documentation/page/logscale-dashboards',
  },
]

export const queryPerfModule: ContentModule = {
  id: 'ltr-opt-query',
  title: 'Query Performance Across Tiers',
  trackId: 'ltr-optimization',
  domainId: 'ltr',
  order: 2,
  lastReviewed: '2026-08-17',
  concepts: queryPerfConcepts,
  quiz: queryPerfQuestions,
}

// ── Module 3.2.3: Compliance & Data Governance ────────────────────────────────

const complianceConcepts: ConceptSection[] = [
  {
    title: 'Data Classification, Audit Logging, and Access Control',
    body: 'Compliance in LogScale requires three complementary controls:\n\n**Data classification:** Tag sensitive fields in parsers using metadata tags (e.g. `#pii=true` on fields containing personal identifiers). This allows retention policies to treat PII-bearing events differently and supports targeted deletion for right-to-erasure requests. Classification happens at parse time — it cannot be applied retroactively.\n\n**Audit logging:** LogScale maintains an internal audit log (`_audit` repository) that records every query executed — who ran it, when, against which repository, and over which time range. This is essential for SOC2, ISO27001, and regulatory audits that require proof of data access control. The `_audit` repository should itself be configured with long-term LTR retention.\n\n**Access control:** LogScale\'s role-based permission system allows restricting access to specific repositories. Sensitive repositories (e.g. containing HR data, executive communications, or PII-bearing authentication logs) should be scoped to only the roles that require access. Principle of least privilege applies: analysts need read access to investigation repositories but not to raw PII repositories.',
  },
  {
    title: 'Right-to-Erasure, Data Sovereignty, and the Data Processing Record',
    body: '**GDPR Article 17 — Right to Erasure:** LogScale\'s Delete API performs targeted deletion of all events matching a CQL query, across all tiers simultaneously. To erase a specific user\'s data: write a query that matches events containing their user identifier, submit it to the Delete API, and LogScale removes matching events from Hot, Warm, and LTR. Document each erasure request and its execution in your data processing record.\n\n**Data residency:** LTR stores data in an S3 bucket you configure. For EU data residency (GDPR), configure the LTR bucket in an EU region (e.g. eu-central-1). LogScale writes LTR segments to whichever bucket you specify — data never crosses regions unless the bucket is misconfigured. Verify bucket region at LTR setup time and re-verify annually.\n\n**Data Processing Record (GDPR Art. 30):** Document for each event type: what data is collected, its legal basis, where it is stored (tier + region), how long it is retained, and who has access. This record must be maintained and available for regulatory review. LogScale\'s retention policy configuration and role-based access control settings are the technical evidence backing this record.',
  },
]

const complianceQuestions: QuizQuestion[] = [
  {
    id: 'ltr-opt-q11',
    text: 'How does LogScale support GDPR Article 17 right-to-erasure requests?',
    options: [
      'By waiting for the retention policy to expire — GDPR erasure is satisfied by natural data lifecycle',
      'By deleting the entire repository containing the user\'s events and re-ingesting everything else',
      'Via the Delete API — submits a CQL query that matches the data subject\'s events; LogScale deletes all matching events across Hot, Warm, and LTR',
      'By setting a per-user retention tag to 0 days and waiting for the next retention sweep',
    ],
    correctIndex: 2,
    explanation: 'LogScale\'s Delete API accepts a CQL query and immediately deletes all matching events across all tiers. This provides the targeted, cross-tier erasure required by GDPR Art. 17 without affecting other users\' data. Waiting for retention expiry does not satisfy "without undue delay." Deleting and re-ingesting a full repository is impractical and destroys non-subject data. A 0-day retention tag affects future events, not existing ones.',
    docTitle: 'LogScale Data Deletion API',
    docUrl: 'https://falcon.crowdstrike.com/documentation/page/logscale-data-deletion',
  },
  {
    id: 'ltr-opt-q12',
    text: 'Where should LogScale\'s own audit logs be retained for compliance purposes?',
    options: [
      'In an external SIEM separate from LogScale — self-auditing creates a conflict of interest',
      'Deleted after 30 days — audit logs are operational data that does not need long-term retention',
      'Only in Hot tier — audit logs must be immediately accessible for real-time compliance monitoring',
      'In LTR — audit logs are low-volume, infrequently queried, and require multi-year retention for regulatory review; LTR provides the ideal cost and retention profile',
    ],
    correctIndex: 3,
    explanation: 'Audit logs satisfy all LTR criteria: low query frequency (only reviewed during audits), long retention requirement (typically 3–7 years for regulatory frameworks like SOC2 and ISO27001), and low volume relative to security telemetry. LTR provides the economical long-term archive needed without the cost of Hot/Warm retention. The audit logs document who accessed what — they must be independently verifiable, which LogScale\'s audit repository provides.',
    docTitle: 'LogScale Audit Logging',
    docUrl: 'https://falcon.crowdstrike.com/documentation/page/logscale-audit-log',
  },
  {
    id: 'ltr-opt-q13',
    text: 'An auditor asks: "Which LogScale users have queried the authentication event repository containing PII in the past 6 months?" Where is this information recorded?',
    options: [
      'In the _audit repository — LogScale records every query with the user identity, target repository, time range, and timestamp',
      'In the repository access logs exported to the S3 LTR bucket',
      'In the authentication repository itself — each query generates a meta-event alongside the returned results',
      'This information is not retained by LogScale — query activity is not logged by default',
    ],
    correctIndex: 0,
    explanation: 'LogScale\'s _audit repository records every query executed on the platform — the querying user\'s identity, the target repository, the query text, and the time range. This is precisely the evidence an auditor needs to verify access control. The _audit repository should itself have long-term LTR retention so audit history is available for regulatory review years later.',
    docTitle: 'LogScale Audit Repository',
    docUrl: 'https://falcon.crowdstrike.com/documentation/page/logscale-audit-log',
  },
  {
    id: 'ltr-opt-q14',
    text: 'Your organisation stores EU citizen data and must comply with GDPR data residency requirements. How do you ensure LTR data stays within the EU?',
    options: [
      'Enable LogScale\'s built-in GDPR mode — it automatically routes EU data to EU-region storage',
      'Configure the LTR S3 bucket in an EU region (e.g. eu-central-1) — LogScale writes LTR segments to the configured bucket; data never crosses regions unless the bucket is misconfigured',
      'Request data residency enforcement from CrowdStrike support — it is managed at the platform level',
      'Tag EU-origin events in parsers with #region=eu — LogScale routes tagged events to EU LTR automatically',
    ],
    correctIndex: 1,
    explanation: 'Data residency in LogScale LTR is controlled by your bucket configuration. Configure the LTR S3 bucket in an EU region (e.g. eu-central-1 or eu-west-1) and LogScale writes segments there — data never crosses regions unless the bucket is misconfigured. There is no built-in GDPR mode, region-routing tags, or support-managed enforcement for customer-controlled LTR buckets.',
    docTitle: 'LogScale LTR Data Residency',
    docUrl: 'https://falcon.crowdstrike.com/documentation/page/logscale-ltr',
  },
  {
    id: 'ltr-opt-q15',
    text: 'What document must GDPR Article 30 compliant organisations maintain that describes their LogScale data processing activities?',
    options: [
      'A LogScale architecture diagram showing data flow from sensor to repository',
      'A quarterly audit report showing all queries run against repositories containing personal data',
      'A Data Processing Record — documenting each event type: what is collected, legal basis, storage location and tier, retention period, and access roles',
      'A signed Data Processing Agreement (DPA) with CrowdStrike covering all LogScale repositories',
    ],
    correctIndex: 2,
    explanation: 'GDPR Art. 30 requires a Record of Processing Activities (RoPA), which maps to what this answer calls a Data Processing Record. For LogScale, this means documenting: which event types contain personal data, the legal basis for processing, which tiers/regions store it, retention durations, and who has access. LogScale\'s retention policy configs and RBAC settings provide the technical evidence. A DPA is a separate contract; architecture diagrams and quarterly audit reports are supporting documents, not the Art. 30 record itself.',
    docTitle: 'LogScale GDPR Compliance',
    docUrl: 'https://falcon.crowdstrike.com/documentation/page/logscale-compliance',
  },
]

export const complianceModule: ContentModule = {
  id: 'ltr-opt-compliance',
  title: 'Compliance & Data Governance',
  trackId: 'ltr-optimization',
  domainId: 'ltr',
  order: 3,
  lastReviewed: '2026-08-17',
  concepts: complianceConcepts,
  quiz: complianceQuestions,
}

// ── Track 3.2 Scenario ────────────────────────────────────────────────────────

const optimizationScenario: Scenario = {
  id: 'ltr-optimization-scenario',
  title: 'Cost Audit: Reducing LogScale Spend by 40%',
  context: 'Your organisation\'s LogScale monthly bill increased 60% this quarter. Management wants a 40% cost reduction without losing critical security detection coverage. You are the LogScale platform engineer conducting the cost audit. You have access to LogScale ingestion metrics and the full list of retention policies and detection rules.',
  isCumulative: false,
  steps: [
    {
      id: 'ltr-opt-s1',
      narrative: 'Your first step is to identify the highest-volume event types and their retention periods. Where do you find this data in LogScale?',
      choices: [
        { text: 'In LogScale\'s ingestion metrics dashboard — it shows per-event-type daily volume; multiply by retention days from the repository policy to compute total stored GB per type' },
        { text: 'In the S3 LTR bucket — download all segment files and count bytes per event type' },
        { text: 'By running a CQL query: `* | groupBy([source], function=count())` against all tiers — count gives volume' },
        { text: 'By asking each application team to self-report their log volume estimates' },
      ],
      correctChoiceIndex: 0,
      wrongConsequence: 'Downloading and counting S3 segment files is impractical at scale and would take days. `count()` gives event counts not byte volume — event count does not correlate reliably with storage cost. Self-reported estimates from application teams are unreliable and miss the full picture.',
      reasoning: 'LogScale\'s ingestion metrics dashboard provides per-source and per-type daily GB ingested. Multiplying by the configured retention period from the repository policy gives total stored GB — the direct cost driver. This is the authoritative data source for identifying cost optimisation targets.',
      docTitle: 'LogScale Ingestion Metrics',
      docUrl: 'https://falcon.crowdstrike.com/documentation/page/logscale-administration',
    },
    {
      id: 'ltr-opt-s2',
      narrative: 'Your top finding: IIS web server access logs contribute 600 GB/day with 180-day retention (108 TB total stored). No detection rule in your library has ever matched an IIS event. What is your recommendation?',
      choices: [
        { text: 'Increase detection rules for IIS before reducing retention — create rules first, then evaluate cost after 90 days' },
        { text: 'Investigate whether compliance requires it; if not, reduce to 30 days or drop non-error events at ingest — 108 TB for a source with zero detection value is the single biggest cost reduction opportunity' },
        { text: 'Reduce retention to 30 days immediately — web server logs have some investigation value for incident timelines even without dedicated detection rules' },
        { text: 'Keep it at 180 days — absence of detection matches proves the environment is clean, validating the source\'s value' },
      ],
      correctChoiceIndex: 1,
      wrongConsequence: 'No detection matches does NOT mean the environment is clean — it means this data source contributes nothing to your detection program. Building detection rules first delays the cost reduction and may not be justified if IIS events are not relevant to your threat model. The correct action is to first determine if there is a compliance or business need; if not, eliminate or drastically reduce.',
      reasoning: '108 TB of stored data with zero detection rule matches is the clearest cost reduction target in the audit. The first check is always: is there a regulatory requirement to retain this? If yes: reduce volume via ingest filtering (keep only error-level events) and move to LTR. If no: drop non-error events at ingest and set 30-day retention on the rest.',
      docTitle: 'LogScale Cost Optimisation',
      docUrl: 'https://falcon.crowdstrike.com/documentation/page/logscale-cost-optimisation',
    },
    {
      id: 'ltr-opt-s3',
      narrative: 'Authentication logs contribute 45 GB/day with 730-day retention (32.8 TB). Detection rules fire on authentication events daily and investigators use them in every incident. Your manager asks: "Can we cut the retention to 90 days to save cost?" What is your answer?',
      choices: [
        { text: 'Yes, but only for Hot tier — keep Warm and LTR at 730 days for compliance purposes' },
        { text: 'No — authentication log retention should be increased to 5 years, not reduced; authentication data is always high-value' },
        { text: 'No — reduce the retention period only after confirming no compliance regulation requires 2-year authentication retention; keep recent data in Hot/Warm and age older data to LTR rather than deleting it' },
        { text: 'Yes — 90 days covers most active investigations; 730-day retention for authentication events is excessive' },
      ],
      correctChoiceIndex: 2,
      wrongConsequence: 'Cutting to 90 days without checking compliance requirements could delete data that a regulation mandates you keep (e.g. PCI DSS requires 1 year, SOX requires 7 years in some jurisdictions). Reducing only Hot retention is not how LogScale retention works — it is a per-repository or tag-based policy, not per-tier. Blanket 5-year retention adds cost without a compliance justification.',
      reasoning: 'Authentication logs are high-investigation-value — they should not be deleted without checking compliance requirements first. The cost-optimal answer is: check compliance obligations, keep active investigation window in Hot/Warm (90–180 days), and archive older data to LTR rather than deleting it. LTR authentication storage costs a fraction of Hot/Warm while satisfying retention requirements.',
      docTitle: 'LogScale Retention Strategy',
      docUrl: 'https://falcon.crowdstrike.com/documentation/page/logscale-retention',
    },
    {
      id: 'ltr-opt-s4',
      narrative: 'An application team wants to retain 5 years of raw application debug logs "just in case they are needed for future investigations." This would add 200 TB to your LTR. What governance question must you answer before agreeing?',
      choices: [
        { text: 'Can the application team export their logs to an alternative storage system to avoid LogScale LTR costs?' },
        { text: 'Has the application team identified a specific past incident where 5-year-old debug logs would have changed the investigation outcome?' },
        { text: 'What is the maximum LTR bucket size supported by your S3 provider?' },
        { text: 'What is the business or compliance justification for 5-year debug log retention, and is the cost proportionate to the security value?' },
      ],
      correctChoiceIndex: 3,
      wrongConsequence: 'S3 bucket size limits are not a practical constraint at 200 TB. Historical incident examples are informative but not the primary governance question. Offloading to alternative storage may solve the budget problem but avoids the fundamental governance question about whether the retention is justified at all.',
      reasoning: 'Every retention decision must be grounded in a business or compliance justification proportionate to the cost. 200 TB of debug logs over 5 years has a significant cost and negligible security value. The governance question is: what specific regulation, audit requirement, or security use case requires this data for 5 years? Without a clear answer, the retention is unjustified regardless of storage mechanism.',
      docTitle: 'LogScale Data Governance',
      docUrl: 'https://falcon.crowdstrike.com/documentation/page/logscale-compliance',
    },
    {
      id: 'ltr-opt-s5',
      narrative: 'After implementing changes — dropping IIS non-error logs at ingest, reducing application debug log retention to 30 days, and moving authentication logs older than 6 months to LTR — you want to confirm the cost reduction target was met. What metric do you verify?',
      choices: [
        { text: 'Total stored GB across all tiers before and after changes, broken down by event type — this directly measures whether the 40% cost target was reached' },
        { text: 'Total daily ingestion volume in GB/day before and after changes — ingestion drives all tier costs' },
        { text: 'LogScale query response time on dashboards — faster dashboards indicate less data in Hot tier' },
        { text: 'Number of detection rules that triggered after the changes — fewer matches means the data reduction was too aggressive' },
      ],
      correctChoiceIndex: 0,
      wrongConsequence: 'Ingestion volume alone does not capture the full picture — retention period changes reduce total stored GB without changing ingestion rate. Detection rule match rates indicate security coverage, not cost. Dashboard speed improves with Hot tier reduction but is an indirect proxy, not the direct cost measure.',
      reasoning: 'Total stored GB across all tiers, broken down by event type, is the direct cost metric. Compare before and after the changes: if total stored GB dropped by 40% or more, the target was met. Breaking down by type confirms which changes drove the reduction and allows you to verify that high-value event types (authentication, EDR) were not disproportionately reduced.',
      docTitle: 'LogScale Storage Metrics',
      docUrl: 'https://falcon.crowdstrike.com/documentation/page/logscale-administration',
    },
  ],
}

// ── Track 3.2 Export ──────────────────────────────────────────────────────────

export const optimizationTrack: ContentTrack = {
  id: 'ltr-optimization',
  title: 'Optimization',
  domainId: 'ltr',
  order: 2,
  modules: [costModule, queryPerfModule, complianceModule],
  scenario: optimizationScenario,
}
