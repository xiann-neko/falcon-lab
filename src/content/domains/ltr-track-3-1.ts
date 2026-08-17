import type {
  ContentModule,
  ContentTrack,
  QuizQuestion,
  ConceptSection,
  Scenario,
} from '../types'

// ═══════════════════════════════════════════════════════════════════════════════
// Track 3.1 — Data Architecture
// ═══════════════════════════════════════════════════════════════════════════════

// ── Module 3.1.1: Hot / Warm / Cold Tiers Explained ──────────────────────────

const tiersConcepts: ConceptSection[] = [
  {
    title: 'The LogScale Data Tier Model',
    body: 'LogScale organises stored data into three tiers, each optimising for a different balance of speed, cost, and access frequency:\n\n**Hot tier:** NVMe SSD-backed storage for recent, actively-queried data. Retention windows default to 7–30 days but can be extended. Hot data has a full in-memory index — queries return in milliseconds to seconds even across billions of events. Detection rules, live dashboards, and active investigations run on Hot.\n\n**Warm tier:** Slower SSD or spinning disk for data that is queried occasionally. Typical window: 30–90 days. The index exists but is partially cold — queries take seconds to minutes. Use Warm for recent-history investigation and weekly reporting.\n\n**Cold / LTR tier:** Compressed data segments written to S3-compatible object storage. No in-memory index — every query downloads and decompresses segments before searching. Queries take minutes to hours. LTR is designed for compliance archives, regulatory retention, and rare historical lookups — not operational monitoring.',
  },
  {
    title: 'How LogScale Routes Queries Across Tiers',
    body: 'LogScale transparently queries all relevant tiers when you run a search. A query with no time bounds hits Hot, Warm, and LTR simultaneously — the LTR leg determines overall query time.\n\nQuery performance guidelines by tier:\n- **Hot:** milliseconds–seconds\n- **Warm:** seconds–minutes\n- **LTR:** minutes–hours (depends on matched segment count)\n\nThe single most important optimisation for any LogScale query is **an explicit time bound**. `start` and `end` parameters restrict which tier segments are downloaded. Without them, a simple query like `error | count()` scans every event ever ingested.\n\nData movement between tiers is automatic — you define retention policies and LogScale ages data through the pipeline without manual intervention. When data exceeds its configured retention, it is permanently deleted.',
    codeExample: '// Time-bound query — only searches Hot and Warm (last 30 days)\n#type=authentication\n| action=failed\n| start=2026-07-18T00:00:00Z end=2026-08-17T23:59:59Z\n| groupBy([user], function=count())\n| sort(count, order=desc)',
    codeLanguage: 'cql',
  },
]

const tiersQuestions: QuizQuestion[] = [
  {
    id: 'ltr-arch-q1',
    text: 'Which storage type backs the Hot tier in LogScale, enabling millisecond-level query performance?',
    options: [
      'NVMe SSD with a full in-memory event index',
      'S3-compatible object storage with compressed segment bundles',
      'Spinning disk with a partially warm index',
      'In-memory DRAM cache with no persistent storage',
    ],
    correctIndex: 0,
    explanation: 'Hot tier uses NVMe SSD storage combined with a fully resident in-memory index. This combination allows LogScale to evaluate queries against billions of events in milliseconds — the same infrastructure that powers live detection rules and real-time dashboards.',
    docTitle: 'LogScale Data Tiers',
    docUrl: 'https://falcon.crowdstrike.com/documentation/page/logscale-data-tiers',
  },
  {
    id: 'ltr-arch-q2',
    text: 'A LogScale query with no time bounds runs for 45 minutes and returns no results. What is the most likely explanation?',
    options: [
      'The query has a syntax error that prevents execution',
      'The query is scanning all tiers including LTR — LTR segment downloads account for the long runtime',
      'LogScale rate-limits queries that exceed 10 minutes',
      'The Hot tier index has become corrupted and requires rebuilding',
    ],
    correctIndex: 1,
    explanation: 'Without a time bound, LogScale queries Hot, Warm, and LTR. The LTR leg requires downloading and decompressing compressed segment objects from S3 storage — a process that scales with the total volume of data ever ingested. A 45-minute runtime with no results is the classic symptom of an unbounded query hitting years of LTR data.',
    docTitle: 'LogScale Query Performance',
    docUrl: 'https://falcon.crowdstrike.com/documentation/page/logscale-query-performance',
  },
  {
    id: 'ltr-arch-q3',
    text: 'What is the primary design purpose of the LTR (Long Term Repository) tier?',
    options: [
      'Real-time detection — LTR stores the most recent events for fastest access',
      'Dashboard caching — LTR pre-aggregates query results for dashboard widgets',
      'Compliance archival and rare historical lookups where slow query time is acceptable',
      'Backup — LTR mirrors Hot tier data for disaster recovery',
    ],
    correctIndex: 2,
    explanation: 'LTR is purpose-built for compliance archival and infrequent historical access. It sacrifices query speed (minutes to hours) for extremely low storage cost at multi-year retention scales. It is not suitable for operational monitoring, live detection, or dashboards — those workloads require Hot tier.',
    docTitle: 'LogScale LTR Overview',
    docUrl: 'https://falcon.crowdstrike.com/documentation/page/logscale-ltr',
  },
  {
    id: 'ltr-arch-q4',
    text: 'Detection rules and live dashboards should run against which LogScale tier for best performance?',
    options: [
      'LTR — it stores the most complete dataset for accurate detection',
      'Warm — balanced cost and performance for ongoing monitoring',
      'All tiers simultaneously — LogScale automatically optimises tier selection',
      'Hot tier — NVMe SSD and in-memory index provide millisecond query response',
    ],
    correctIndex: 3,
    explanation: 'Detection rules and dashboards require sub-second response times. Only Hot tier provides this — NVMe SSD with a full in-memory index. Warm is too slow for live detection. LTR queries can take hours. Querying all tiers for a dashboard widget would make it unusably slow.',
    docTitle: 'LogScale Hot Tier',
    docUrl: 'https://falcon.crowdstrike.com/documentation/page/logscale-data-tiers',
  },
  {
    id: 'ltr-arch-q5',
    text: 'What automatically moves data from Hot → Warm → LTR → deletion in LogScale?',
    options: [
      'Retention policies configured at the repository level that define per-tier age thresholds',
      'A scheduled manual export job that runs nightly',
      'The LogScale agent on each endpoint, which manages its own event lifecycle',
      'A CQL query that must be run weekly to trigger tier migration',
    ],
    correctIndex: 0,
    explanation: 'Retention policies configured at the repository level define how long data stays in each tier. LogScale evaluates these policies continuously and automatically ages data through Hot → Warm → LTR and finally to deletion without any manual intervention. The policy is declared once; LogScale enforces it indefinitely.',
    docTitle: 'LogScale Retention Policies',
    docUrl: 'https://falcon.crowdstrike.com/documentation/page/logscale-retention',
  },
]

export const tiersModule: ContentModule = {
  id: 'ltr-arch-hot-warm-cold',
  title: 'Hot / Warm / Cold Tiers Explained',
  trackId: 'ltr-data-architecture',
  domainId: 'ltr',
  order: 1,
  lastReviewed: '2026-08-17',
  concepts: tiersConcepts,
  quiz: tiersQuestions,
}

// ── Module 3.1.2: Retention Policies & Data Lifecycle ────────────────────────

const retentionConcepts: ConceptSection[] = [
  {
    title: 'Repository-Level and Tag-Based Retention',
    body: 'LogScale supports two retention configuration levels:\n\n**Repository-level retention:** A single default TTL (time-to-live) applied to all events in a repository. Simple to configure; treats all data equally regardless of type or value.\n\n**Tag-based retention overrides:** Events can be tagged in parsers with special retention metadata. LogScale honours these tags to apply different retention periods to different event types within the same repository. Example policy:\n- `#type=authentication` → 730 days (2 years, for compliance)\n- `#type=dns` → 90 days (high volume, limited investigation value)\n- `#type=process_creation` → 365 days (EDR telemetry, investigation value)\n\nTag-based retention is configured in parsers at ingest time — the tag is written with the event and evaluated by LogScale\'s retention engine. This allows a single repository to contain a heterogeneous mix of retention periods without splitting data across multiple repositories.',
  },
  {
    title: 'Data Lifecycle and Deletion',
    body: 'The LogScale data lifecycle for every event:\n\n1. **Ingest:** event arrives, parser tags it (including retention tags), written to Hot\n2. **Hot phase:** active indexing, live detection, real-time queries\n3. **Warm phase:** index partially ages, queries slower; typical window 30–90 days after ingest\n4. **LTR phase:** compressed into object storage; queries require segment downloads\n5. **Deletion:** when retention expires, data is permanently and irrecoverably deleted\n\n**Right-to-erasure (GDPR Art. 17):** LogScale provides a Delete API that performs targeted deletion of events matching a specific query (e.g., all events containing a specific user identifier). This is distinct from retention expiry — it allows on-demand deletion before the retention window closes.\n\nPlan your retention policy before you ingest significant data volume — changing retention later does not retroactively restore already-deleted data.',
  },
]

const retentionQuestions: QuizQuestion[] = [
  {
    id: 'ltr-arch-q6',
    text: 'Your organisation needs authentication logs retained for 2 years but DNS logs for only 90 days. Both are in the same LogScale repository. How do you implement this?',
    options: [
      'Split authentication and DNS into separate repositories with different global retention settings',
      'Use tag-based retention — set a 730-day retention tag on auth events and a 90-day tag on DNS events in their respective parsers',
      'Configure two separate LogScale clusters with different default retention policies',
      'Keep both event types in the same repository with 2-year retention — selectively delete DNS events manually every 90 days',
    ],
    correctIndex: 1,
    explanation: 'Tag-based retention is exactly the feature designed for this scenario. By tagging auth events with a 730-day retention override and DNS events with a 90-day override in their parsers, both event types coexist in the same repository with different TTLs. This avoids the operational overhead of separate repositories while respecting different retention requirements per event type.',
    docTitle: 'LogScale Tag-Based Retention',
    docUrl: 'https://falcon.crowdstrike.com/documentation/page/logscale-retention',
  },
  {
    id: 'ltr-arch-q7',
    text: 'Where should retention tags be set for LogScale events?',
    options: [
      'In the LogScale retention policy UI after events have been ingested',
      'By an analyst who manually tags events during an investigation',
      'In parsers at ingest time — the tag is written with the event and evaluated continuously by the retention engine',
      'In the LTR bucket configuration — S3 object tags control LogScale retention',
    ],
    correctIndex: 2,
    explanation: 'Retention tags are set in parsers at ingest time. The parser processes each event as it arrives and stamps it with the appropriate retention metadata. LogScale\'s retention engine then reads these tags continuously to determine when to age or delete each event. Post-ingest tagging is not supported — retention is a write-time decision.',
    docTitle: 'LogScale Parser Retention Tags',
    docUrl: 'https://falcon.crowdstrike.com/documentation/page/logscale-retention',
  },
  {
    id: 'ltr-arch-q8',
    text: 'A compliance regulation requires user authentication data to be retrievable for 7 years. Which tier must store this data for the later years of retention?',
    options: [
      'Hot tier — compliance data must always be immediately accessible',
      'Warm tier — it provides a balance of cost and accessibility for long-term data',
      'A separate cold backup system outside LogScale',
      'LTR (Long Term Repository) — S3-backed object storage designed for multi-year, low-cost archival',
    ],
    correctIndex: 3,
    explanation: 'Only LTR is designed for multi-year retention at scale. Hot and Warm tiers have cost and capacity limits that make them impractical for 7-year retention of high-volume authentication data. LTR\'s S3-backed compressed storage provides the per-GB economics needed for long-term compliance archives, with the trade-off of slower query access.',
    docTitle: 'LogScale LTR for Compliance',
    docUrl: 'https://falcon.crowdstrike.com/documentation/page/logscale-ltr',
  },
  {
    id: 'ltr-arch-q9',
    text: 'What happens to a LogScale event when its retention period expires?',
    options: [
      'It is permanently and irrecoverably deleted — no recovery is possible after expiry',
      'It is moved to a quarantine repository for 30 additional days before permanent deletion',
      'It is exported to an external backup before deletion',
      'It is compressed and stored in a "cold archive" tier below LTR',
    ],
    correctIndex: 0,
    explanation: 'Retention expiry in LogScale is permanent — events are irrecoverably deleted when their TTL expires. There is no quarantine period, no automatic export, and no sub-LTR archive. This is why retention planning must happen before ingestion: it is not possible to recover data that has already been deleted by a retention policy.',
    docTitle: 'LogScale Data Deletion',
    docUrl: 'https://falcon.crowdstrike.com/documentation/page/logscale-retention',
  },
  {
    id: 'ltr-arch-q10',
    text: 'A GDPR right-to-erasure request arrives for a specific user\'s data. The user\'s events are spread across Hot, Warm, and LTR. How does LogScale support this deletion?',
    options: [
      'Wait for the retention policy to expire — GDPR erasure is satisfied by normal retention policies',
      'LogScale\'s Delete API performs targeted deletion of events matching a specific query across all tiers — including LTR',
      'Manually identify and delete each event from each tier separately using the LogScale console',
      'Delete the entire repository containing the user\'s data, then re-ingest everything else',
    ],
    correctIndex: 1,
    explanation: 'LogScale provides a Delete API that accepts a CQL query and deletes all matching events across all tiers — Hot, Warm, and LTR — without touching non-matching data. This is the correct mechanism for GDPR right-to-erasure: targeted, cross-tier deletion of a specific data subject\'s records before the natural retention window closes.',
    docTitle: 'LogScale Delete API',
    docUrl: 'https://falcon.crowdstrike.com/documentation/page/logscale-data-deletion',
  },
]

export const retentionModule: ContentModule = {
  id: 'ltr-arch-retention',
  title: 'Retention Policies & Data Lifecycle',
  trackId: 'ltr-data-architecture',
  domainId: 'ltr',
  order: 2,
  lastReviewed: '2026-08-17',
  concepts: retentionConcepts,
  quiz: retentionQuestions,
}

// ── Module 3.1.3: Long Term Repository (LTR) Deep Dive ───────────────────────

const ltrDeepDiveConcepts: ConceptSection[] = [
  {
    title: 'LTR Architecture: Object Storage and Compressed Segments',
    body: 'The Long Term Repository stores data as compressed, self-contained segment files in S3-compatible object storage. Each segment bundles a time range of events from a specific source, compressed with LZ4 or Zstandard.\n\nKey architectural implications:\n\n**No persistent index:** Unlike Hot tier, LTR has no resident index. Every query must first identify which segment files cover the requested time range and sources, download them from S3, decompress them, and then search the raw event bytes. This is why LTR queries are 100–1,000× slower than Hot queries of equivalent scope.\n\n**Segment granularity:** A segment typically covers a few minutes to an hour of events from one source. A query for "all authentication events in Q1 2025" may need to download thousands of segments — each download is a separate S3 GET request.\n\n**Appropriate LTR use cases:**\n- 7-year regulatory compliance archives (SOX, HIPAA, GDPR)\n- Annual trend analysis (year-over-year incident volume)\n- Historical forensics when an attacker had persistent access for years\n- Litigation hold data that must be preserved but rarely queried',
  },
  {
    title: 'LTR Query Best Practices',
    body: 'Writing efficient LTR queries requires a fundamentally different mindset than Hot/Warm queries.\n\n**Rule 1 — Always add explicit time bounds.** Without `start` and `end`, LogScale downloads every segment ever written to LTR. A one-line filter like `#type=authentication` with no time bound can take hours on a mature LTR with years of data.\n\n**Rule 2 — Filter on indexed fields before aggregating.** `#type` tags and source fields are stored in segment metadata — LogScale can skip entire segments without downloading them if the metadata does not match. Always lead with `#type=...` or `source=...`.\n\n**Rule 3 — Schedule, don\'t wait.** Long LTR queries should be submitted as saved searches or scheduled reports that run off-peak (e.g. 02:00 UTC). Waiting 4 hours at a terminal for LTR results is an anti-pattern.\n\n**Rule 4 — Sample before you aggregate.** Add `| head 1000` while building an LTR query to validate field names and value formats before running the full aggregation across terabytes of archive data.',
    codeExample: '// LTR query best practice: explicit time bounds + indexed field filter first\n#type=authentication\n| start=2025-01-01T00:00:00Z end=2025-03-31T23:59:59Z\n| action=failed\n| groupBy([user, source_ip], function=count())\n| sort(count, order=desc, limit=50)',
    codeLanguage: 'cql',
  },
]

const ltrDeepDiveQuestions: QuizQuestion[] = [
  {
    id: 'ltr-arch-q11',
    text: 'Why are LTR queries significantly slower than equivalent Hot tier queries?',
    options: [
      'LTR runs on shared infrastructure with lower CPU priority than Hot',
      'LTR data is encrypted with a different key that requires additional decryption passes',
      'LTR has no persistent index — every query downloads and decompresses S3 segment objects before searching event bytes',
      'LTR queries are intentionally throttled to prevent overloading the archive storage',
    ],
    correctIndex: 2,
    explanation: 'The fundamental reason for LTR query latency is the absence of a persistent index. Hot tier keeps an in-memory index of all events; a query resolves to index lookups in milliseconds. LTR must identify relevant S3 segment files, issue GET requests to object storage, download compressed bundles, decompress them, and then scan event bytes linearly — this process scales with data volume, not query complexity.',
    docTitle: 'LogScale LTR Query Architecture',
    docUrl: 'https://falcon.crowdstrike.com/documentation/page/logscale-ltr',
  },
  {
    id: 'ltr-arch-q12',
    text: 'What is the single most important optimisation to add to any LTR query?',
    options: [
      'Add | head 1000 to limit result rows before aggregation',
      'Use groupBy() instead of count() for more efficient aggregation in object storage',
      'Run the query during business hours when cluster resources are at peak capacity',
      'An explicit start and end time bound — this limits the number of S3 segments downloaded',
    ],
    correctIndex: 3,
    explanation: 'An explicit time bound (start= and end=) is the most impactful single optimisation for LTR queries. Without it, every segment ever written to LTR is a candidate for download. With tight time bounds, LogScale can skip entire years of segments by checking segment file metadata before issuing any S3 GET requests.',
    docTitle: 'LogScale LTR Query Optimisation',
    docUrl: 'https://falcon.crowdstrike.com/documentation/page/logscale-ltr',
  },
  {
    id: 'ltr-arch-q13',
    text: 'Which of these is the most appropriate use case for LTR?',
    options: [
      'A 7-year compliance archive of authentication events required by a financial services regulation',
      'A live SOC dashboard showing failed logins in the past 24 hours',
      'Real-time detection rules that alert on brute-force authentication attempts',
      'A 5-minute rolling window query for the Falcon platform health dashboard',
    ],
    correctIndex: 0,
    explanation: 'LTR is purpose-built for long-term, infrequent-access compliance archives. A 7-year authentication archive — queried only for regulatory audits or historical forensics — is the ideal LTR use case: high retention period, low query frequency, acceptable query latency measured in minutes. Live dashboards, real-time detection, and short-window operational queries all belong on Hot tier.',
    docTitle: 'LogScale LTR Use Cases',
    docUrl: 'https://falcon.crowdstrike.com/documentation/page/logscale-ltr',
  },
  {
    id: 'ltr-arch-q14',
    text: 'You want to query LTR for DNS queries to .ru domains from Q1 2025. Which CQL structure is correct?',
    options: [
      'domain=*.ru | start=2025-01-01T00:00:00Z | groupBy([domain])',
      '#type=dns | start=2025-01-01T00:00:00Z end=2025-03-31T23:59:59Z | domain=/.ru$/ | groupBy([domain], function=count())',
      'groupBy([domain]) | #type=dns | start=2025-01-01 end=2025-03-31',
      '* | domain contains ".ru" | start=2025-01-01T00:00:00Z end=2025-03-31T23:59:59Z',
    ],
    correctIndex: 1,
    explanation: 'The correct pattern leads with the indexed type tag (#type=dns) then adds the explicit ISO-8601 time bounds, then applies the field filter (domain regex), and finally aggregates. This order allows LogScale to skip non-DNS segments using metadata before downloading, and limits segment downloads to Q1 2025 only. Starting with a wildcard (*) or aggregation before filtering defeats both optimisations.',
    docTitle: 'LogScale LTR CQL Patterns',
    docUrl: 'https://falcon.crowdstrike.com/documentation/page/logscale-ltr',
  },
  {
    id: 'ltr-arch-q15',
    text: 'What storage technology backs LTR segment files?',
    options: [
      'NVMe SSD arrays co-located with the LogScale cluster',
      'A distributed SQL database that stores events as rows for flexible querying',
      'S3-compatible object storage — each segment is a self-contained compressed file stored as an S3 object',
      'Network-attached spinning disk arrays with RAID redundancy',
    ],
    correctIndex: 2,
    explanation: 'LTR stores data as compressed segment files in S3-compatible object storage. Each segment is an independent S3 object containing a time-range slice of events from a specific source, compressed with LZ4 or Zstandard. The S3 model provides unlimited scale and very low per-GB storage cost — the trade-off is that every query requires S3 GET requests, decompression, and linear event scanning.',
    docTitle: 'LogScale LTR Storage Architecture',
    docUrl: 'https://falcon.crowdstrike.com/documentation/page/logscale-ltr',
  },
]

export const ltrDeepDiveModule: ContentModule = {
  id: 'ltr-arch-ltr-deep-dive',
  title: 'Long Term Repository (LTR) Deep Dive',
  trackId: 'ltr-data-architecture',
  domainId: 'ltr',
  order: 3,
  lastReviewed: '2026-08-17',
  concepts: ltrDeepDiveConcepts,
  quiz: ltrDeepDiveQuestions,
}

// ── Track 3.1 Scenario ────────────────────────────────────────────────────────

const dataArchScenario: Scenario = {
  id: 'ltr-data-architecture-scenario',
  title: 'Data Tier Triage: Diagnosing a 45-Minute Query',
  context: 'A Tier 2 analyst has escalated a LogScale query that has been running for 45 minutes with no results. The query is: `* | count()` with no time bounds, no source filter, and no type filter. You are the LogScale platform engineer on call. You need to diagnose the cause, explain it to the analyst, and apply the fix.',
  isCumulative: false,
  steps: [
    {
      id: 'ltr-da-s1',
      narrative: 'The query `* | count()` with no time bounds is sent to LogScale. Which tiers does it query, and why does this explain the 45-minute runtime?',
      choices: [
        { text: 'It queries Hot, Warm, and LTR simultaneously — no time bound means LTR segment downloads are included, and LTR queries scale with years of archived data' },
        { text: 'It queries only Hot — the wildcard operator * is only valid against the live streaming tier' },
        { text: 'It queries Hot and Warm but skips LTR because count() is too simple to trigger LTR access' },
        { text: 'It queries a cached result set — the 45-minute wait is LogScale refreshing its cache' },
      ],
      correctChoiceIndex: 0,
      wrongConsequence: 'The wildcard operator works across all tiers. Aggregation functions like count() do not change tier selection — tier access is determined entirely by time bounds. LogScale has no query-result cache that would account for a 45-minute wait.',
      reasoning: 'Without a time bound, LogScale cannot exclude any tier from the query scope. It issues segment downloads against Hot, Warm, and LTR. The LTR segment set may represent years of compressed data requiring thousands of S3 GET requests — this is what produces the 45-minute runtime on what appears to be a trivially simple query.',
      docTitle: 'LogScale Query Tier Routing',
      docUrl: 'https://falcon.crowdstrike.com/documentation/page/logscale-query-performance',
    },
    {
      id: 'ltr-da-s2',
      narrative: 'You add a 30-day time bound to the query: `* | start=now()-30d | count()`. The same query now runs in 8 seconds. Why does the time bound make such a dramatic difference?',
      choices: [
        { text: 'The 30-day bound coincidentally matches a LogScale performance tuning threshold that enables query parallelism' },
        { text: 'A time bound restricts the query to segments within the specified window — LogScale can skip all LTR segments whose metadata falls outside the range without downloading them, eliminating the dominant cost' },
        { text: 'The bound triggers LogScale to use a pre-computed summary index for the past 30 days' },
        { text: '30 days happens to be within the Hot tier window, which is indexed — Warm and LTR are not checked at all' },
      ],
      correctChoiceIndex: 1,
      wrongConsequence: 'There is no 30-day parallelism threshold or pre-computed summary index. The query still spans Hot and potentially Warm within 30 days — it does not exclusively hit Hot. The key is that LTR segments outside the time bound are excluded by metadata check without downloading.',
      reasoning: 'LTR segment files store their time range in S3 object metadata. When a query includes a time bound, LogScale evaluates each segment\'s metadata first — if the segment\'s time range does not overlap the query window, it is skipped without a download. This "metadata pruning" eliminates the dominant cost (S3 downloads) for the vast majority of LTR segments, reducing a multi-hour scan to seconds.',
      docTitle: 'LogScale Time Bound Optimisation',
      docUrl: 'https://falcon.crowdstrike.com/documentation/page/logscale-query-performance',
    },
    {
      id: 'ltr-da-s3',
      narrative: 'The analyst\'s actual use case is a compliance audit requiring authentication events from 3 years ago. Which tier will serve this query, and what does that mean for expected runtime?',
      choices: [
        { text: 'Warm tier — 3-year-old data is in Warm because it is occasionally accessed for compliance queries' },
        { text: 'Hot tier — compliance-flagged data is prioritised and kept in Hot regardless of age' },
        { text: 'LTR (Long Term Repository) — 3-year-old data has aged out of Hot and Warm into S3-backed object storage; expect minutes to hours depending on the matched segment count' },
        { text: 'The data has been deleted — LogScale default retention is 90 days and 3-year-old data no longer exists' },
      ],
      correctChoiceIndex: 2,
      wrongConsequence: 'Warm tier covers roughly 30–90 days of data, not 3 years. Data is not prioritised into Hot based on compliance tags — tier placement is age-based. Default retention does not apply if the organisation has configured longer retention for compliance — and this scenario assumes 3-year data exists.',
      reasoning: 'Three-year-old data has long since aged through Hot and Warm into LTR. The analyst should expect minutes to hours for this query, not seconds. The right approach: add tight time bounds (specific week or month), filter by `#type=authentication`, and schedule the query as an off-peak saved search rather than waiting at a terminal.',
      docTitle: 'LogScale LTR Query Expectations',
      docUrl: 'https://falcon.crowdstrike.com/documentation/page/logscale-ltr',
    },
    {
      id: 'ltr-da-s4',
      narrative: 'You help the analyst write the LTR query: `#type=authentication | start=2023-06-01T00:00:00Z end=2023-06-30T23:59:59Z | action=failed | groupBy([user], function=count())`. Why is `#type=authentication` placed first, before the time bound?',
      choices: [
        { text: 'CQL requires type filters to appear before time parameters — it is a syntax rule' },
        { text: 'Placing #type first is a stylistic convention with no performance impact' },
        { text: 'The order does not matter — LogScale internally reorders CQL operators for optimal execution' },
        { text: '#type is stored in S3 segment metadata — placing it first allows LogScale to exclude non-authentication segments by metadata check before issuing any S3 GET requests, reducing downloads further' },
      ],
      correctChoiceIndex: 3,
      wrongConsequence: 'CQL has no syntax requirement about filter order for type tags. The convention is not merely stylistic — it has a measurable performance impact. LogScale does not automatically reorder operators; the query plan follows the written order.',
      reasoning: '#type is one of the indexed fields stored in LTR segment metadata. By leading with #type=authentication, LogScale can evaluate each segment\'s metadata — checking both time range AND event type — before deciding whether to download it. This dual-metadata pruning further reduces the S3 GET request count compared to a time-bound-only filter.',
      docTitle: 'LogScale LTR Indexed Fields',
      docUrl: 'https://falcon.crowdstrike.com/documentation/page/logscale-ltr',
    },
    {
      id: 'ltr-da-s5',
      narrative: 'The query is ready. The analyst plans to run it and wait at their desk for results. How should this LTR query actually be executed?',
      choices: [
        { text: 'Submit it as a scheduled saved search to run off-peak (e.g. 02:00 UTC) and deliver results by email — LTR queries should not be run interactively during business hours' },
        { text: 'Run it interactively but add | head 10 to limit results and make it faster' },
        { text: 'Break the month into daily queries and run them sequentially to avoid timeout limits' },
        { text: 'Run it now and monitor CPU usage — cancel and retry if the cluster seems busy' },
      ],
      correctChoiceIndex: 0,
      wrongConsequence: '| head 10 on an aggregated query (groupBy + count) does not reduce the LTR segment downloads — it only limits the output rows after full aggregation. Daily sub-queries add overhead and do not address the fundamental issue. CPU monitoring and manual retries are not a reliable execution strategy for multi-hour queries.',
      reasoning: 'LTR queries that span a full month of authentication data may run for 30–90 minutes. The correct pattern is a scheduled saved search: submit the query to run during off-peak hours when it will not compete with real-time detection workloads, and configure email delivery of results. The analyst receives the output when they arrive the next morning.',
      docTitle: 'LogScale Saved Searches and Scheduling',
      docUrl: 'https://falcon.crowdstrike.com/documentation/page/logscale-saved-searches',
    },
  ],
}

// ── Track 3.1 Export ──────────────────────────────────────────────────────────

export const dataArchitectureTrack: ContentTrack = {
  id: 'ltr-data-architecture',
  title: 'Data Architecture',
  domainId: 'ltr',
  order: 1,
  modules: [tiersModule, retentionModule, ltrDeepDiveModule],
  scenario: dataArchScenario,
}
