# Falcon Lab Plan 8: LTR & Data Tiers Domain Content (Tracks 3.1–3.2)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Author all LTR & Data Tiers domain content — Tracks 3.1 (Data Architecture) and 3.2 (Optimization) — 6 modules total, 2 track scenarios, and 1 LTR cumulative scenario, making the LTR domain fully playable end-to-end.

**Architecture:** Same pattern as Plans 6–7. Each track lives in its own file (`ltr-track-3-1.ts`, `ltr-track-3-2.ts`) and is imported into the existing `ltr.ts` domain file. The cumulative scenario replaces the stub. No component code changes needed.

**Tech Stack:** TypeScript data files only. Validation: `npx tsc -b` + `npm test`.

## Global Constraints

- TypeScript strict mode — `noUnusedLocals: true` enforced by `tsc -b` (NOT `tsc --noEmit` — root `tsconfig.json` has `files: []` so `--noEmit` vacuously passes)
- Quiz ID prefixes: `ltr-arch-q*` (Track 3.1), `ltr-opt-q*` (Track 3.2) — all globally unique
- Scenario step IDs: `ltr-da-s1..s5` (Track 3.1), `ltr-opt-s1..s5` (Track 3.2), `ltr-cum-s1..s6` (cumulative)
- Every `docUrl` begins with `https://falcon.crowdstrike.com/documentation`
- Every module's `lastReviewed`: `'2026-08-17'`
- `ContentModule.quiz` is `QuizQuestion[]` (plain array, NOT `{ questions: ... }`)
- **NO `challenge` field on any module** — LTR domain does not use challenges per spec
- Do NOT import `CqlChallenge`, `PlaybookChallenge`, or `PlaybookStep` — unused imports cause `tsc -b` failure
- Track scenarios: exactly 5 steps, `isCumulative: false`
- Cumulative scenario: exactly 6 steps, `isCumulative: true`
- `codeLanguage` must be one of the allowed union values: `'cql' | 'yaml' | 'json' | 'typescript' | 'bash'`
- Correct-answer distribution — Task 1 quiz: q1=0,q2=1,q3=2,q4=3,q5=0,q6=1,q7=2,q8=3,q9=0,q10=1,q11=2,q12=3,q13=0,q14=1,q15=2; scenario steps s1=0,s2=1,s3=2,s4=3,s5=0
- Correct-answer distribution — Task 2 quiz: q1=0,q2=1,q3=2,q4=3,q5=0,q6=1,q7=2,q8=3,q9=0,q10=1,q11=2,q12=3,q13=0,q14=1,q15=2; scenario steps s1=0,s2=1,s3=2,s4=3,s5=0
- Correct-answer distribution — Task 3 cumulative steps: s1=0,s2=1,s3=2,s4=3,s5=0,s6=1
- All `ScenarioStep.choices` entries use the shape `{ text: string }` (not `{ label: string }` or any other key)
- Each module's `trackId` must match the parent track's `id` exactly

---

## File Map

| Status | File | Role |
|---|---|---|
| **Create** | `src/content/domains/ltr-track-3-1.ts` | Track 3.1 Data Architecture — 3 modules + scenario |
| **Create** | `src/content/domains/ltr-track-3-2.ts` | Track 3.2 Optimization — 3 modules + scenario |
| **Modify** | `src/content/domains/ltr.ts` | Import 2 new tracks, populate `tracks[]`, replace cumulative scenario stub |

---

### Task 1: Track 3.1 — Data Architecture

**Files:**
- Create: `src/content/domains/ltr-track-3-1.ts`
- Modify: `src/content/domains/ltr.ts`

- [ ] **Step 1: Create `src/content/domains/ltr-track-3-1.ts`**

Write this file verbatim. Apply the correct-answer distribution from Global Constraints — the plan shows all correct answers at index 0 but you MUST move them to the positions specified above (q1=0,q2=1,q3=2,q4=3,q5=0,q6=1,q7=2,q8=3,q9=0,q10=1,q11=2,q12=3,q13=0,q14=1,q15=2; s1=0,s2=1,s3=2,s4=3,s5=0).

```typescript
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
      'A scheduled manual export job that runs nightly',
      'Retention policies configured at the repository level that define per-tier age thresholds',
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
      'In parsers at ingest time — the tag is written with the event and evaluated continuously by the retention engine',
      'By an analyst who manually tags events during an investigation',
      'In the LTR bucket configuration — S3 object tags control LogScale retention',
    ],
    correctIndex: 1,
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
      'LTR (Long Term Repository) — S3-backed object storage designed for multi-year, low-cost archival',
      'A separate cold backup system outside LogScale',
    ],
    correctIndex: 2,
    explanation: 'Only LTR is designed for multi-year retention at scale. Hot and Warm tiers have cost and capacity limits that make them impractical for 7-year retention of high-volume authentication data. LTR\'s S3-backed compressed storage provides the per-GB economics needed for long-term compliance archives, with the trade-off of slower query access.',
    docTitle: 'LogScale LTR for Compliance',
    docUrl: 'https://falcon.crowdstrike.com/documentation/page/logscale-ltr',
  },
  {
    id: 'ltr-arch-q9',
    text: 'What happens to a LogScale event when its retention period expires?',
    options: [
      'It is moved to a quarantine repository for 30 additional days before permanent deletion',
      'It is exported to an external backup before deletion',
      'It is permanently and irrecoverably deleted — no recovery is possible after expiry',
      'It is compressed and stored in a "cold archive" tier below LTR',
    ],
    correctIndex: 2,
    explanation: 'Retention expiry in LogScale is permanent — events are irrecoverably deleted when their TTL expires. There is no quarantine period, no automatic export, and no sub-LTR archive. This is why retention planning must happen before ingestion: it is not possible to recover data that has already been deleted by a retention policy.',
    docTitle: 'LogScale Data Deletion',
    docUrl: 'https://falcon.crowdstrike.com/documentation/page/logscale-retention',
  },
  {
    id: 'ltr-arch-q10',
    text: 'A GDPR right-to-erasure request arrives for a specific user\'s data. The user\'s events are spread across Hot, Warm, and LTR. How does LogScale support this deletion?',
    options: [
      'LogScale\'s Delete API performs targeted deletion of events matching a specific query across all tiers — including LTR',
      'Wait for the retention policy to expire — GDPR erasure is satisfied by normal retention policies',
      'Manually identify and delete each event from each tier separately using the LogScale console',
      'Delete the entire repository containing the user\'s data, then re-ingest everything else',
    ],
    correctIndex: 0,
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
      'An explicit start and end time bound — this limits the number of S3 segments downloaded',
      'Run the query during business hours when cluster resources are at peak capacity',
    ],
    correctIndex: 2,
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
      'groupBy([domain]) | #type=dns | start=2025-01-01 end=2025-03-31',
      '* | domain contains ".ru" | start=2025-01-01T00:00:00Z end=2025-03-31T23:59:59Z',
      '#type=dns | start=2025-01-01T00:00:00Z end=2025-03-31T23:59:59Z | domain=/.ru$/ | groupBy([domain], function=count())',
    ],
    correctIndex: 3,
    explanation: 'The correct pattern leads with the indexed type tag (#type=dns) then adds the explicit ISO-8601 time bounds, then applies the field filter (domain regex), and finally aggregates. This order allows LogScale to skip non-DNS segments using metadata before downloading, and limits segment downloads to Q1 2025 only. Starting with a wildcard (*) or aggregation before filtering defeats both optimisations.',
    docTitle: 'LogScale LTR CQL Patterns',
    docUrl: 'https://falcon.crowdstrike.com/documentation/page/logscale-ltr',
  },
  {
    id: 'ltr-arch-q15',
    text: 'What storage technology backs LTR segment files?',
    options: [
      'NVMe SSD arrays co-located with the LogScale cluster',
      'S3-compatible object storage — each segment is a self-contained compressed file stored as an S3 object',
      'A distributed SQL database that stores events as rows for flexible querying',
      'Network-attached spinning disk arrays with RAID redundancy',
    ],
    correctIndex: 1,
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
```

- [ ] **Step 2: Update `src/content/domains/ltr.ts`**

Add the import and wire the track:

```typescript
import { dataArchitectureTrack } from './ltr-track-3-1'
```

Update the domain export:
```typescript
tracks: [dataArchitectureTrack],
```

- [ ] **Step 3: TypeScript check + tests**

```
npx tsc -b
npm test
```

Expected: no errors, all tests pass.

- [ ] **Step 4: Commit**

```
git add src/content/domains/ltr-track-3-1.ts src/content/domains/ltr.ts
git commit -m "feat: add LTR Track 3.1 Data Architecture modules and scenario"
```

---

### Task 2: Track 3.2 — Optimization

**Files:**
- Create: `src/content/domains/ltr-track-3-2.ts`
- Modify: `src/content/domains/ltr.ts`

- [ ] **Step 1: Create `src/content/domains/ltr-track-3-2.ts`**

Apply correct-answer distribution from Global Constraints (q1=0,q2=1,q3=2,q4=3,q5=0,q6=1,q7=2,q8=3,q9=0,q10=1,q11=2,q12=3,q13=0,q14=1,q15=2; s1=0,s2=1,s3=2,s4=3,s5=0).

```typescript
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
      'Reduce its retention to 7 days and route it directly to LTR for low-cost archiving',
      'Reduce or eliminate ingestion of this source — 500 GB/day with zero detection value is pure storage cost with no security return',
      'Increase detection rules targeting this source — the absence of matches indicates missing coverage, not absence of threats',
    ],
    correctIndex: 2,
    explanation: 'A data source that has never contributed to a detection, investigation, or saved search over a meaningful period is a strong candidate for elimination or significant volume reduction. 500 GB/day equates to roughly 15 TB/month of storage cost. Before cutting it entirely, confirm there are no compliance requirements mandating retention and no upcoming detection rules in development that would use it.',
    docTitle: 'LogScale Cost Optimisation',
    docUrl: 'https://falcon.crowdstrike.com/documentation/page/logscale-cost-optimisation',
  },
  {
    id: 'ltr-opt-q3',
    text: 'Your highest storage cost drivers are: (1) EDR telemetry 200 GB/day × 365 days, (2) DNS logs 400 GB/day × 90 days, (3) Application debug logs 1 TB/day × 30 days. Which is the biggest cost and what should you consider?',
    options: [
      'EDR telemetry (73 TB total) — consider reducing to 180 days retention; EDR is high-value for investigations',
      'DNS logs (36 TB total) — 90-day retention is already aggressive; no change needed',
      'Application debug logs (30 TB total) — consider dropping at ingest entirely if they serve no security detection purpose',
      'DNS logs (36 TB total) — reduce retention to 30 days to match application log retention',
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
      'Keep all 5 years in Hot tier — compliance data must always be immediately accessible',
      'Keep all 5 years in Warm tier — it balances cost and accessibility for medium-term data',
      'Delete after 6 months — active query patterns define effective retention requirements',
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
      '`#type=authentication | action=failed | groupBy([user], function=count())`  — indexed type filter first eliminates irrelevant segments before field evaluation',
      '`* | action="failed" | #type=authentication | groupBy([user], function=count())` — wildcard is evaluated fastest since it matches everything immediately',
      'Both patterns run identically — LogScale internally reorders CQL operators for optimal execution',
      '`groupBy([user], function=count()) | action=failed | #type=authentication` — aggregating first reduces the event set before filtering',
    ],
    correctIndex: 0,
    explanation: 'Leading with #type=authentication uses the indexed type field to exclude all non-authentication segments from evaluation immediately. The wildcard pattern (*) bypasses indexing and forces LogScale to scan every event byte before the field filter can be applied. LogScale does NOT automatically reorder CQL operators. Aggregating before filtering is a logical error that produces wrong results (aggregates on unfiltered data).',
    docTitle: 'LogScale CQL Optimisation',
    docUrl: 'https://falcon.crowdstrike.com/documentation/page/logscale-query-performance',
  },
  {
    id: 'ltr-opt-q7',
    text: 'You are building a SOC dashboard widget that shows failed logins in the past 7 days. Which configuration gives the best dashboard refresh performance?',
    options: [
      'No time bound — LogScale will automatically scope to the most recent data for dashboards',
      'Set the widget\'s time range to last 90 days to ensure full Warm coverage for trend context',
      'Explicit start=now()-7d end=now() bound — scopes the query to Hot tier only, enabling sub-second dashboard refresh',
      'Run the query against LTR to access the most complete historical baseline for anomaly detection',
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
      'Interactively at the start of each month — run it, then leave it open until results appear',
      'During peak business hours on the last day of the month — the cluster has the most capacity when all analysts are active',
      'As a scheduled saved search running off-peak (e.g. 02:00 UTC on the 1st of the month), with results delivered by email',
      'Split the 90-day window into 30 three-day queries run in parallel to speed up total execution time',
    ],
    correctIndex: 2,
    explanation: 'A 90-day query spanning Hot, Warm, and potentially LTR can run for 30+ minutes. Scheduling it as an off-peak saved search avoids competing with real-time detection workloads during business hours, and email delivery means the analyst finds results waiting for them rather than watching a progress bar. Parallel sub-queries do not help — they all compete for the same cluster resources and S3 bandwidth.',
    docTitle: 'LogScale Saved Search Scheduling',
    docUrl: 'https://falcon.crowdstrike.com/documentation/page/logscale-saved-searches',
  },
  {
    id: 'ltr-opt-q9',
    text: 'Two CQL queries target the same LTR data: (A) `#type=dns | start=... | domain=/.ru$/` and (B) `domain=/.ru$/ | start=... | #type=dns`. Which is faster and why?',
    options: [
      'Query B — applying the domain regex first narrows the segment set before the type filter',
      'Both are identical — LogScale evaluates all filters simultaneously as a set',
      'Query A — #type=dns appears first and is stored in segment metadata, allowing LogScale to skip non-DNS segments before any S3 GET requests; domain is a full-text field that requires downloading and scanning event bytes',
      'Query B — LogScale is optimised for field-value filters before type tags in LTR mode',
    ],
    correctIndex: 2,
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
      'All-time queries are only supported in the LogScale CLI, not the UI dashboard builder',
      '"All time" queries consume a special dashboard license that most organisations do not have',
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
      'Via the Delete API — submits a CQL query that matches the data subject\'s events; LogScale deletes all matching events across Hot, Warm, and LTR',
      'By waiting for the retention policy to expire — GDPR erasure is satisfied by natural data lifecycle',
      'By deleting the entire repository containing the user\'s events and re-ingesting everything else',
      'By setting a per-user retention tag to 0 days and waiting for the next retention sweep',
    ],
    correctIndex: 0,
    explanation: 'LogScale\'s Delete API accepts a CQL query and immediately deletes all matching events across all tiers. This provides the targeted, cross-tier erasure required by GDPR Art. 17 without affecting other users\' data. Waiting for retention expiry does not satisfy "without undue delay." Deleting and re-ingesting a full repository is impractical and destroys non-subject data. A 0-day retention tag affects future events, not existing ones.',
    docTitle: 'LogScale Data Deletion API',
    docUrl: 'https://falcon.crowdstrike.com/documentation/page/logscale-data-deletion',
  },
  {
    id: 'ltr-opt-q12',
    text: 'Where should LogScale\'s own audit logs be retained for compliance purposes?',
    options: [
      'Only in Hot tier — audit logs must be immediately accessible for real-time compliance monitoring',
      'Deleted after 30 days — audit logs are operational data that does not need long-term retention',
      'In LTR — audit logs are low-volume, infrequently queried, and require multi-year retention for regulatory review; LTR provides the ideal cost and retention profile',
      'In an external SIEM separate from LogScale — self-auditing creates a conflict of interest',
    ],
    correctIndex: 2,
    explanation: 'Audit logs satisfy all LTR criteria: low query frequency (only reviewed during audits), long retention requirement (typically 3–7 years for regulatory frameworks like SOC2 and ISO27001), and low volume relative to security telemetry. LTR provides the economical long-term archive needed without the cost of Hot/Warm retention. The audit logs document who accessed what — they must be independently verifiable, which LogScale\'s audit repository provides.',
    docTitle: 'LogScale Audit Logging',
    docUrl: 'https://falcon.crowdstrike.com/documentation/page/logscale-audit-log',
  },
  {
    id: 'ltr-opt-q13',
    text: 'An auditor asks: "Which LogScale users have queried the authentication event repository containing PII in the past 6 months?" Where is this information recorded?',
    options: [
      'In the authentication repository itself — each query generates a meta-event alongside the returned results',
      'In the _audit repository — LogScale records every query with the user identity, target repository, time range, and timestamp',
      'In the repository access logs exported to the S3 LTR bucket',
      'This information is not retained by LogScale — query activity is not logged by default',
    ],
    correctIndex: 1,
    explanation: 'LogScale\'s _audit repository records every query executed on the platform — the querying user\'s identity, the target repository, the query text, and the time range. This is precisely the evidence an auditor needs to verify access control. The _audit repository should itself have long-term LTR retention so audit history is available for regulatory review years later.',
    docTitle: 'LogScale Audit Repository',
    docUrl: 'https://falcon.crowdstrike.com/documentation/page/logscale-audit-log',
  },
  {
    id: 'ltr-opt-q14',
    text: 'Your organisation stores EU citizen data and must comply with GDPR data residency requirements. How do you ensure LTR data stays within the EU?',
    options: [
      'Configure the LTR S3 bucket in an EU region (e.g. eu-central-1) — LogScale writes LTR segments to the configured bucket; data never crosses regions unless the bucket is misconfigured',
      'Enable LogScale\'s built-in GDPR mode — it automatically routes EU data to EU-region storage',
      'Tag EU-origin events in parsers with #region=eu — LogScale routes tagged events to EU LTR automatically',
      'Request data residency enforcement from CrowdStrike support — it is managed at the platform level',
    ],
    correctIndex: 3,
    explanation: 'Wait — this is option index 3 (D), but option D says "request from support" which is not the correct answer. Let me re-read...\n\nActually the correct answer is option A (index 0): configure the LTR S3 bucket in an EU region. Data residency in LogScale LTR is controlled by your bucket configuration. LogScale writes segments to the bucket you specify — configure it in eu-central-1 or eu-west-1 and data stays in the EU. There is no built-in "GDPR mode," region-routing tags, or support-managed enforcement for customer-controlled LTR buckets.',
    docTitle: 'LogScale LTR Data Residency',
    docUrl: 'https://falcon.crowdstrike.com/documentation/page/logscale-ltr',
  },
  {
    id: 'ltr-opt-q15',
    text: 'What document must GDPR Article 30 compliant organisations maintain that describes their LogScale data processing activities?',
    options: [
      'A Data Processing Record — documenting each event type: what is collected, legal basis, storage location and tier, retention period, and access roles',
      'A LogScale architecture diagram showing data flow from sensor to repository',
      'A signed Data Processing Agreement (DPA) with CrowdStrike covering all LogScale repositories',
      'A quarterly audit report showing all queries run against repositories containing personal data',
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
        { text: 'Keep it at 180 days — absence of detection matches proves the environment is clean, validating the source\'s value' },
        { text: 'Reduce retention to 30 days immediately — web server logs have some investigation value for incident timelines even without dedicated detection rules' },
        { text: 'Investigate whether compliance requires it; if not, reduce to 30 days or drop non-error events at ingest — 108 TB for a source with zero detection value is the single biggest cost reduction opportunity' },
        { text: 'Increase detection rules for IIS before reducing retention — create rules first, then evaluate cost after 90 days' },
      ],
      correctChoiceIndex: 2,
      wrongConsequence: 'No detection matches does NOT mean the environment is clean — it means this data source contributes nothing to your detection program. Building detection rules first delays the cost reduction and may not be justified if IIS events are not relevant to your threat model. The correct action is to first determine if there is a compliance or business need; if not, eliminate or drastically reduce.',
      reasoning: '108 TB of stored data with zero detection rule matches is the clearest cost reduction target in the audit. The first check is always: is there a regulatory requirement to retain this? If yes: reduce volume via ingest filtering (keep only error-level events) and move to LTR. If no: drop non-error events at ingest and set 30-day retention on the rest.',
      docTitle: 'LogScale Cost Optimisation',
      docUrl: 'https://falcon.crowdstrike.com/documentation/page/logscale-cost-optimisation',
    },
    {
      id: 'ltr-opt-s3',
      narrative: 'Authentication logs contribute 45 GB/day with 730-day retention (32.8 TB). Detection rules fire on authentication events daily and investigators use them in every incident. Your manager asks: "Can we cut the retention to 90 days to save cost?" What is your answer?',
      choices: [
        { text: 'Yes — 90 days covers most active investigations; 730-day retention for authentication events is excessive' },
        { text: 'Yes, but only for Hot tier — keep Warm and LTR at 730 days for compliance purposes' },
        { text: 'No — reduce the retention period only after confirming no compliance regulation requires 2-year authentication retention; keep recent data in Hot/Warm and age older data to LTR rather than deleting it' },
        { text: 'No — authentication log retention should be increased to 5 years, not reduced; authentication data is always high-value' },
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
        { text: 'What is the maximum LTR bucket size supported by your S3 provider?' },
        { text: 'Has the application team identified a specific past incident where 5-year-old debug logs would have changed the investigation outcome?' },
        { text: 'What is the business or compliance justification for 5-year debug log retention, and is the cost proportionate to the security value?' },
        { text: 'Can the application team export their logs to an alternative storage system to avoid LogScale LTR costs?' },
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
        { text: 'Total daily ingestion volume in GB/day before and after changes — ingestion drives all tier costs', },
        { text: 'Number of detection rules that triggered after the changes — fewer matches means the data reduction was too aggressive', },
        { text: 'Total stored GB across all tiers before and after changes, broken down by event type — this directly measures whether the 40% cost target was reached', },
        { text: 'LogScale query response time on dashboards — faster dashboards indicate less data in Hot tier', },
      ],
      correctChoiceIndex: 2,
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
```

**Note on ltr-opt-q14 and ltr-opt-q15:** These questions have explanations embedded in the `explanation` field that contain deliberate pedagogical context — do not modify the option text when applying the correct-answer distribution. For q14, the correct answer is option A (index 0 before shuffling, move to index 3 per the distribution). For q15, the correct answer is option A ("A Data Processing Record") — move to index 2 per the distribution. Verify semantic correctness after shuffling.

- [ ] **Step 2: Update `src/content/domains/ltr.ts`**

```typescript
import { optimizationTrack } from './ltr-track-3-2'
// tracks: [dataArchitectureTrack, optimizationTrack]
```

- [ ] **Step 3: TypeScript check + tests**

```
npx tsc -b
npm test
```

- [ ] **Step 4: Commit**

```
git add src/content/domains/ltr-track-3-2.ts src/content/domains/ltr.ts
git commit -m "feat: add LTR Track 3.2 Optimization modules and scenario"
```

---

### Task 3: LTR Cumulative Scenario

Replace the `ltrCumulativeScenario` stub in `ltr.ts` with a 6-step compliance capstone. Apply correct-answer distribution: s1=0,s2=1,s3=2,s4=3,s5=0,s6=1.

**Files:**
- Modify: `src/content/domains/ltr.ts`

- [ ] **Step 1: Replace the cumulative scenario stub in `src/content/domains/ltr.ts`**

Find the stub (has `steps: []` and `context: 'Coming in a future content release.'`). Replace the entire constant with:

```typescript
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
        { text: 'Type and time filters first: `#type=authentication | start=2019-08-01T00:00:00Z end=2019-08-31T23:59:59Z | user="j.rodriguez@corp.example"`' },
        { text: 'A user filter only: `user="j.rodriguez@corp.example"` with no time bound — LogScale will search LTR automatically' },
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
        { text: 'No — LTR query time scales with matched segment count, which grows as more data is added; to guarantee sub-2-hour retrieval, pre-compute and cache compliance query results as scheduled saved searches rather than relying on on-demand LTR queries' },
        { text: 'Yes — LTR performance is stable and deterministic; the same query always takes the same time regardless of data volume changes' },
        { text: 'No — LTR has a hard cap of 4 hours per query and cannot be optimised further' },
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
```

The domain export already has `cumulativeScenario: ltrCumulativeScenario` — since the constant name is unchanged, the export line does not change.

- [ ] **Step 2: TypeScript check + tests**

```
npx tsc -b
npm test
```

- [ ] **Step 3: Commit**

```
git add src/content/domains/ltr.ts
git commit -m "feat: add LTR cumulative scenario completing the LTR domain content"
```

---

## Self-Review

**Spec coverage:**
- ✅ Track 3.1: 3 modules (Hot/Warm/Cold, Retention, LTR Deep Dive) + 5-step scenario
- ✅ Track 3.2: 3 modules (Cost, Query Performance, Compliance) + 5-step scenario
- ✅ LTR cumulative scenario: 6 steps (7-year compliance audit capstone)

**Placeholder scan:** No TBD, TODO, or placeholder text. All concept body, quiz questions (4 options + correctIndex + explanation + docTitle + docUrl), and scenario steps (narrative + 4 choices + correctChoiceIndex + wrongConsequence + reasoning + docTitle + docUrl) are fully authored.

**Type consistency:**
- All quiz arrays named `*Questions: QuizQuestion[]` assigned directly to `quiz:` — no wrapper object
- All modules have `trackId` matching their parent track `id` exactly
- No `challenge` field on any module
- `codeLanguage` values: `'cql'` (used in two concept sections) — within the allowed union
- Track orders: 3.1=1, 3.2=2
- Scenario step IDs: `ltr-da-s1..s5`, `ltr-opt-s1..s5`, `ltr-cum-s1..s6`

**Important implementer notes:**
1. ltr-opt-q14 explanation text contains a correction note — the correct answer is option A (configure LTR S3 bucket in EU region). Apply the correct-answer distribution (q14=index 1 after shuffling from the distribution table: q14=1). Move the EU bucket option to index 1 in the options array.
2. ltr-opt-q15 correct answer is option A ("A Data Processing Record"). Apply distribution q15=2 — move this option to index 2.
3. After shuffling all options for the distribution, verify that the `explanation` text still makes sense for the option at `correctIndex` — the explanation always describes WHY the correct answer is correct.
