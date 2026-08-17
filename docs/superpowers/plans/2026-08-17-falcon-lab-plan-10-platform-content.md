# Falcon Lab Plan 10: Platform Essentials Domain Content (Tracks 5.1–5.4)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Author all Platform Essentials domain content — Tracks 5.1 (FDR), 5.2 (APIs & Automation), 5.3 (Reporting & Governance), and 5.4 (Threat Intelligence Integration) — 9 modules total, 4 track scenarios, and 1 cumulative scenario, making the Platform Essentials domain fully playable end-to-end.

**Architecture:** Same pattern as Plans 6–9. Each track lives in its own file imported into `platform.ts`. No component code changes needed.

**Tech Stack:** TypeScript data files only. Validation: `npx tsc -b` + `npm test`.

## Global Constraints

- TypeScript strict mode — `noUnusedLocals: true` enforced by `tsc -b` (NOT `tsc --noEmit`)
- Quiz ID prefixes: `platform-fdr-q*` (Track 5.1), `platform-api-q*` (Track 5.2), `platform-gov-q*` (Track 5.3), `platform-ti-q*` (Track 5.4) — all globally unique
- Scenario step IDs: `pf-fdr-s1..s5` (Track 5.1), `pf-api-s1..s5` (Track 5.2), `pf-gov-s1..s5` (Track 5.3), `pf-ti-s1..s5` (Track 5.4), `pf-cum-s1..s6` (cumulative)
- Every `docUrl` begins with `https://falcon.crowdstrike.com/documentation` OR `https://library.humio.com` (both are valid for this domain)
- Every module's `lastReviewed`: `'2026-08-17'`
- `ContentModule.quiz` is `QuizQuestion[]` (plain array, NOT `{ questions: ... }`)
- **NO `challenge` field on any module** — Platform Essentials has no challenges per spec
- Do NOT import `CqlChallenge`, `PlaybookChallenge`, or `PlaybookStep` — unused imports cause `tsc -b` failure
- Track scenarios: exactly 5 steps, `isCumulative: false`
- Cumulative scenario: exactly 6 steps, `isCumulative: true`
- `codeLanguage` must be one of: `'cql' | 'yaml' | 'json' | 'typescript' | 'bash'` — only include when `codeExample` is also present on the same `ConceptSection`
- `ScenarioStep.choices` entries use `{ text: string }` (not `{ label: string }`)
- **The correct answer must physically sit at the required `correctIndex`/`correctChoiceIndex` position.** Do NOT set the index number without reordering the array so the correct answer text is at that position.
- Correct-answer distribution — Task 1 quiz: q1=0,q2=1,q3=2,q4=3,q5=0,q6=1,q7=2,q8=3,q9=0,q10=1; scenario s1=0,s2=1,s3=2,s4=3,s5=0
- Correct-answer distribution — Task 2 quiz: q1=0,q2=1,q3=2,q4=3,q5=0,q6=1,q7=2,q8=3,q9=0,q10=1,q11=2,q12=3,q13=0,q14=1,q15=2; scenario s1=0,s2=1,s3=2,s4=3,s5=0
- Correct-answer distribution — Task 3 quiz: q1=0,q2=1,q3=2,q4=3,q5=0,q6=1,q7=2,q8=3,q9=0,q10=1; scenario s1=0,s2=1,s3=2,s4=3,s5=0
- Correct-answer distribution — Task 4 quiz: q1=0,q2=1,q3=2,q4=3,q5=0,q6=1,q7=2,q8=3,q9=0,q10=1; scenario s1=0,s2=1,s3=2,s4=3,s5=0
- Correct-answer distribution — Task 5 cumulative: s1=0,s2=1,s3=2,s4=3,s5=0,s6=1
- `trackId` on each module must match parent track `id` exactly
- `ScenarioStep` has NO `explanation` field — only `wrongConsequence`, `reasoning`, `docTitle`, `docUrl`

---

## File Map

| Status | File | Role |
|---|---|---|
| **Create** | `src/content/domains/platform-track-5-1.ts` | Track 5.1 FDR — 2 modules + scenario |
| **Create** | `src/content/domains/platform-track-5-2.ts` | Track 5.2 APIs & Automation — 3 modules + scenario |
| **Create** | `src/content/domains/platform-track-5-3.ts` | Track 5.3 Reporting & Governance — 2 modules + scenario |
| **Create** | `src/content/domains/platform-track-5-4.ts` | Track 5.4 Threat Intelligence Integration — 2 modules + scenario |
| **Modify** | `src/content/domains/platform.ts` | Import 4 new tracks, populate `tracks[]`, replace cumulative scenario stub |

---

### Task 1: Track 5.1 — Falcon Data Replicator (FDR)

**Files:**
- Create: `src/content/domains/platform-track-5-1.ts`
- Modify: `src/content/domains/platform.ts`

- [ ] **Step 1: Create `src/content/domains/platform-track-5-1.ts`**

```typescript
import type {
  ContentModule,
  ContentTrack,
  QuizQuestion,
  ConceptSection,
  Scenario,
} from '../types'

// ═══════════════════════════════════════════════════════════════════════════════
// Track 5.1 — Falcon Data Replicator (FDR)
// ═══════════════════════════════════════════════════════════════════════════════

// ── Module 5.1.1: What FDR is & How It Feeds SIEM ───────────────────────────

const whatIsFdrConcepts: ConceptSection[] = [
  {
    title: 'Falcon Data Replicator (FDR): What It Is and Why It Exists',
    body: 'Falcon Data Replicator (FDR) is a CrowdStrike service that continuously exports raw Falcon sensor telemetry to an Amazon S3 bucket in near-real-time. It exists to solve a fundamental SIEM architecture problem: the Falcon detection API only delivers alerts and incidents — not the underlying raw events that generated them.\n\n**What FDR provides that the Falcon API does not:**\n- Raw process creation events (every process spawned on every endpoint)\n- Network connection records (every outbound/inbound TCP/UDP connection)\n- DNS resolution attempts (every domain lookup from every endpoint)\n- File system events (file creation, modification, deletion by monitored processes)\n- Authentication events (user logins, privilege escalation, credential use)\n\nThis telemetry is the foundation of proactive threat hunting, forensic investigation, and SIEM correlation rules. Without FDR, a SIEM connected only to the Falcon detection API is an alert console — it sees only what Falcon decided was suspicious. With FDR, the SIEM sees everything Falcon sensors record, enabling analysts to hunt for threats Falcon has not yet detected.\n\n**FDR deployment options:**\n- **Falcon-managed S3:** CrowdStrike provides and manages the bucket; customer has read access\n- **Customer-managed S3:** Customer-owned bucket in their AWS account; FDR pushes data there\n\nLogScale ingests FDR data via its built-in FDR connector, which automatically applies parsers and field normalisations.',
  },
  {
    title: 'FDR Data Format and Delivery',
    body: 'FDR exports event data in JSONL (JSON Lines) format — one JSON object per line, one event per object. Files are gzip-compressed and written to S3 with this partition structure:\n\n```\ns3://[bucket]/[cid]/[year]/[month]/[day]/[hour]/[event_simpleName]/[file].jsonl.gz\n```\n\nKey delivery characteristics:\n\n**Latency:** FDR is near-real-time — events typically arrive in S3 within seconds to a few minutes of being generated on the sensor. There is no guaranteed sub-second delivery; events are batched and buffered before writing. This means FDR is not appropriate for use cases requiring real-time response (that requires the Falcon streaming API), but it is appropriate for detection, investigation, and hunting workloads.\n\n**Volume:** A mid-size enterprise (1,000 endpoints) generating typical endpoint activity produces 5–20 GB of compressed FDR data per day. High-frequency event types (process creation, DNS, network connections) account for the majority of volume.\n\n**Completeness:** FDR delivers all events the Falcon sensor generates and CrowdStrike has configured for export — including events that did not trigger any detection. This is the full-fidelity telemetry stream.\n\n**Retention in S3:** FDR does not manage S3 retention. Data remains in S3 until the S3 bucket lifecycle policy removes it. Analysts are responsible for configuring appropriate retention on the S3 bucket.',
  },
]

const whatIsFdrQuestions: QuizQuestion[] = [
  {
    id: 'platform-fdr-q1',
    text: 'What is the primary purpose of Falcon Data Replicator (FDR)?',
    options: [
      'To continuously export raw Falcon sensor telemetry (process events, network connections, DNS, authentication) to an S3 bucket — enabling SIEM platforms and data lakes to access the full-fidelity event stream beyond what the Falcon detection API provides',
      'To replicate Falcon detection alerts to a backup Falcon tenant for disaster recovery and business continuity',
      'To synchronise Falcon configuration (policies, groups, prevention settings) between multiple Falcon CIDs in a multi-tenant deployment',
      'To stream Falcon threat intelligence (IOCs, actor profiles) to customer S3 buckets for integration with third-party security products',
    ],
    correctIndex: 0,
    explanation: 'FDR\'s core purpose is exporting raw sensor telemetry — not detections, not intelligence, not configuration. The Falcon API already delivers detections and incidents. FDR fills the gap: it provides the raw events (process creation, network connections, DNS queries, authentication) that are the foundation of hunting, investigation, and SIEM correlation rules that go beyond alert-only visibility.',
    docTitle: 'Falcon Data Replicator (FDR) Overview',
    docUrl: 'https://falcon.crowdstrike.com/documentation/page/falcon-data-replicator',
  },
  {
    id: 'platform-fdr-q2',
    text: 'In what format does FDR deliver event data to S3?',
    options: [
      'CSV (comma-separated values), one row per event, uncompressed, with a header row defining column names',
      'JSONL (JSON Lines), gzip-compressed — one JSON object per line, one event per object, partitioned by event type and time in the S3 key structure',
      'Parquet columnar format, Snappy-compressed, optimised for analytical queries across large event datasets',
      'XML format, base64-encoded, with each file containing a batch of events wrapped in a root document element',
    ],
    correctIndex: 1,
    explanation: 'FDR writes JSONL (JSON Lines) files — one JSON object per line — to S3. Files are gzip-compressed to reduce storage and transfer costs. The S3 key structure partitions data by CID, date, hour, and event_simpleName, making it efficient for time-bounded queries. Parquet and CSV are used by some analytics platforms but are not the FDR export format.',
    docTitle: 'FDR Data Format',
    docUrl: 'https://falcon.crowdstrike.com/documentation/page/falcon-data-replicator',
  },
  {
    id: 'platform-fdr-q3',
    text: 'A SIEM engineer says: "Our Falcon integration is complete — we receive all Falcon detections via the API. We don\'t need FDR." What is the key gap in this reasoning?',
    options: [
      'There is no gap — the Falcon detection API includes all raw sensor telemetry alongside the detection context; FDR is redundant for customers using the Falcon API',
      'The gap is latency — the Falcon API delivers events with up to 24-hour delay, while FDR provides the same data in near-real-time',
      'The Falcon API only delivers events that triggered detections (alerts); it does not provide the raw telemetry stream — the underlying process, network, DNS, and authentication events that did NOT trigger a detection are only available via FDR',
      'The gap is volume — the Falcon API caps event delivery at 10,000 events per day, while FDR has no volume limits',
    ],
    correctIndex: 2,
    explanation: 'The Falcon detection API delivers alerts and incidents — events Falcon already decided were suspicious. FDR provides the raw full-fidelity telemetry stream: every process, every network connection, every DNS query, every auth event — including the 99% of events that did not trigger any detection. Without FDR, the SIEM cannot hunt for threats Falcon has not yet detected, cannot reconstruct a complete attack timeline, and cannot build correlation rules from raw event data.',
    docTitle: 'FDR vs. Falcon Detection API',
    docUrl: 'https://falcon.crowdstrike.com/documentation/page/falcon-data-replicator',
  },
  {
    id: 'platform-fdr-q4',
    text: 'What is FDR\'s typical event delivery latency from sensor generation to S3 availability?',
    options: [
      'Sub-second — FDR uses a direct streaming connection with no buffering, equivalent to a live event stream',
      'Exactly 5 minutes — FDR batches events in fixed 5-minute windows before writing to S3',
      'Up to 24 hours — FDR is a daily batch export service, not a near-real-time stream',
      'Seconds to a few minutes — FDR is near-real-time but not instantaneous; events are batched and buffered before S3 writes, making it appropriate for detection, investigation, and hunting but not for real-time automated response',
    ],
    correctIndex: 3,
    explanation: 'FDR is near-real-time, typically delivering events within seconds to a few minutes of sensor generation. It is NOT sub-second streaming (that requires the Falcon Event Stream API) and NOT daily batch. The batching model means FDR is ideal for SIEM ingestion, hunting, and investigation but not for use cases requiring immediate event-by-event reaction — for those, use the Falcon streaming API.',
    docTitle: 'FDR Delivery Characteristics',
    docUrl: 'https://falcon.crowdstrike.com/documentation/page/falcon-data-replicator',
  },
  {
    id: 'platform-fdr-q5',
    text: 'An organisation wants FDR data to land in their own AWS account\'s S3 bucket so their data governance team controls retention and access. Is this possible?',
    options: [
      'Yes — FDR supports customer-managed S3, where CrowdStrike pushes FDR data to a customer-owned S3 bucket in the customer\'s AWS account, giving the customer full control over retention, access policies, and encryption',
      'No — FDR only supports Falcon-managed S3 buckets; customers can read from the bucket but cannot control its configuration or move data to their own account',
      'Yes — but only for Enterprise tier customers; lower tiers are restricted to Falcon-managed S3 only',
      'No — FDR data cannot be stored in customer-owned S3 due to CrowdStrike data residency requirements; it must remain in CrowdStrike-managed infrastructure',
    ],
    correctIndex: 0,
    explanation: 'FDR supports customer-managed S3: the customer provides their own AWS S3 bucket and grants CrowdStrike write access. CrowdStrike pushes FDR data to that bucket, giving the customer full control over retention policies, encryption settings, access controls, and lifecycle management. This is the preferred model for organisations with strict data governance requirements. Falcon-managed S3 (where CrowdStrike owns the bucket) is also an option.',
    docTitle: 'FDR S3 Configuration Options',
    docUrl: 'https://falcon.crowdstrike.com/documentation/page/falcon-data-replicator',
  },
]

export const whatIsFdrModule: ContentModule = {
  id: 'platform-fdr-what-is',
  title: 'What FDR is & How It Feeds SIEM',
  trackId: 'platform-fdr',
  domainId: 'platform',
  order: 1,
  lastReviewed: '2026-08-17',
  concepts: whatIsFdrConcepts,
  quiz: whatIsFdrQuestions,
}

// ── Module 5.1.2: Schema, Event Types & Field Mapping ───────────────────────

const fdrSchemaConcepts: ConceptSection[] = [
  {
    title: 'Core FDR Fields: aid, cid, and event_simpleName',
    body: 'Every FDR event contains three universal fields that are essential for SIEM correlation and multi-tenant environments:\n\n**`aid` (Agent ID):** The unique identifier for the specific Falcon sensor instance on an endpoint. This is the primary key for identifying which device generated an event. The `aid` is stable across reboots and OS reinstalls (as long as the sensor is not removed and reinstalled). Use `aid` to correlate events from the same endpoint across different event types.\n\n**`cid` (Customer ID):** The unique identifier for the CrowdStrike customer account (tenant). In multi-tenant deployments (e.g., an MSSP serving multiple customers), the `cid` distinguishes events from different organisations. In a single-tenant deployment, `cid` is constant across all events.\n\n**`event_simpleName`:** The event type identifier — what kind of activity was recorded. This is the primary field for filtering event data by category. Common values:\n\n| event_simpleName | Activity recorded |\n|---|---|\n| `ProcessRollup2` | Process creation (new process started) |\n| `NetworkConnectIP4` | Outbound IPv4 TCP/UDP connection attempt |\n| `NetworkConnectIP6` | Outbound IPv6 connection attempt |\n| `DnsRequest` | DNS resolution attempt |\n| `UserLogon` | User authentication/login |\n| `UserLogonFailed` | Failed authentication attempt |\n| `ArchiveFileWritten` | Archive file created or modified |\n| `PeFileWritten` | Portable executable (PE) file written to disk |',
  },
  {
    title: 'Event-Specific Fields: Process, Network, and DNS Events',
    body: 'Beyond the universal fields, each event type carries specific fields relevant to the activity recorded:\n\n**Process events (`ProcessRollup2`):**\n- `ImageFileName`: Full path of the executed binary\n- `CommandLine`: The command line including arguments\n- `ParentProcessId`: PID of the parent process\n- `ProcessId`: PID of this process\n- `UserName`: The user account that launched the process\n- `SHA256HashData`: SHA256 hash of the executable\n\n**Network events (`NetworkConnectIP4`):**\n- `LocalAddressIP4`: Source IP of the connecting endpoint\n- `RemoteAddressIP4`: Destination IP being connected to\n- `LocalPort`: Source port\n- `RemotePort`: Destination port\n- `Protocol`: TCP or UDP\n- `ImageFileName`: Process making the connection\n\n**DNS events (`DnsRequest`):**\n- `DomainName`: The domain being resolved\n- `RequestType`: DNS record type (A, AAAA, MX, TXT)\n- `ImageFileName`: Process that initiated the DNS lookup\n\n**In LogScale:** When FDR data is ingested via the FDR connector, the connector applies parsers that normalise these fields. The `event_simpleName` value maps to LogScale\'s `#type` tag, enabling CQL filters like `#type=ProcessRollup2`.',
    codeExample: '// Example CQL query using FDR fields in LogScale\n// Find all PowerShell processes connecting to external IPs in the last 24h\n#type=NetworkConnectIP4\n| ImageFileName=/powershell\.exe/i\n| NOT RemoteAddressIP4=/(^10\\.)|(^192\\.168\\.)|(^172\\.(1[6-9]|2[0-9]|3[01])\\.)/\n| start=now()-24h\n| groupBy([aid, RemoteAddressIP4, RemotePort], function=count())\n| sort(count, order=desc)',
    codeLanguage: 'cql',
  },
]

const fdrSchemaQuestions: QuizQuestion[] = [
  {
    id: 'platform-fdr-q6',
    text: 'An analyst needs to correlate all events from the same endpoint across multiple FDR event types (process, network, DNS). Which field should they use as the correlation key?',
    options: [
      'ComputerName — the hostname of the endpoint, which is stable and human-readable across all event types',
      'aid (Agent ID) — the unique, stable identifier for the specific Falcon sensor instance on that endpoint; it is consistent across all event types for the same device',
      'cid (Customer ID) — the tenant identifier that groups all events from the same customer account',
      'ProcessId — the unique process identifier that links process and network events from the same execution chain',
    ],
    correctIndex: 1,
    explanation: '`aid` (Agent ID) is the correct correlation key because it uniquely and stably identifies the Falcon sensor on a specific endpoint. ComputerName can change (rename, DHCP, VM provisioning) and is not guaranteed unique. `cid` identifies the tenant, not the device — all endpoints in the same organisation share the same `cid`. `ProcessId` is only relevant for correlating process-level events and is not present in all event types.',
    docTitle: 'FDR Field Reference',
    docUrl: 'https://falcon.crowdstrike.com/documentation/page/falcon-data-replicator',
  },
  {
    id: 'platform-fdr-q7',
    text: 'A SIEM engineer wants to detect DNS requests to newly registered domains from any endpoint. Which FDR event type and field combination should they use?',
    options: [
      'event_simpleName=NetworkConnectIP4, field: RemoteAddressIP4 — filter for IPs with low reputation scores in the threat intelligence lookup',
      'event_simpleName=ProcessRollup2, field: CommandLine — search for process commands that include DNS resolver utilities like nslookup or dig',
      'event_simpleName=DnsRequest, field: DomainName — match the queried domain against a lookup table of newly registered domains or apply regex patterns for suspicious naming conventions',
      'event_simpleName=UserLogon, field: RemoteAddressIP4 — identify login events from hosts that recently resolved suspicious domains',
    ],
    correctIndex: 2,
    explanation: '`event_simpleName=DnsRequest` with field `DomainName` is the correct combination for DNS-based detection. The `DnsRequest` event type is specifically generated when the Falcon sensor records a DNS resolution attempt, and `DomainName` contains the queried domain. Matching against a newly registered domain list or applying entropy/pattern analysis against `DomainName` is the standard approach for detecting C2 beaconing via DNS.',
    docTitle: 'FDR DNS Event Fields',
    docUrl: 'https://falcon.crowdstrike.com/documentation/page/falcon-data-replicator',
  },
  {
    id: 'platform-fdr-q8',
    text: 'In LogScale, FDR data ingested via the FDR connector shows `#type=ProcessRollup2`. What does the `#type` tag represent?',
    options: [
      'A LogScale internal metadata field that indicates the ingest source (FDR connector vs. HEC vs. API)',
      'A customer-defined tag that classifies events by severity for alert routing purposes',
      'A LogScale repository identifier that specifies which data silo the event was stored in',
      'The parsed event type from the `event_simpleName` FDR field — the FDR connector maps `event_simpleName` values to LogScale `#type` tags, enabling CQL filters like `#type=ProcessRollup2`',
    ],
    correctIndex: 3,
    explanation: 'The `#type` tag in LogScale corresponds to the `event_simpleName` field from FDR — the FDR connector parser applies this mapping automatically on ingest. This enables CQL queries to filter by event type using `#type=ProcessRollup2` rather than `event_simpleName=ProcessRollup2`. Understanding this mapping is essential for writing FDR-based CQL queries correctly.',
    docTitle: 'FDR LogScale Integration',
    docUrl: 'https://falcon.crowdstrike.com/documentation/page/falcon-data-replicator',
  },
  {
    id: 'platform-fdr-q9',
    text: 'Which FDR field contains the full file path of the executable that initiated a network connection in a NetworkConnectIP4 event?',
    options: [
      'ImageFileName — the full file system path of the process binary that opened the network connection',
      'CommandLine — the full command including arguments of the process that initiated the connection',
      'ParentProcessId — the process ID of the parent that spawned the connecting process',
      'ProcessId — the process ID of the process that established the connection',
    ],
    correctIndex: 0,
    explanation: '`ImageFileName` contains the full file path of the binary executable (e.g., `C:\\Windows\\System32\\powershell.exe`) that initiated the network connection. This field is present in both `NetworkConnectIP4` and `ProcessRollup2` events, enabling correlation between process and network telemetry. `CommandLine` contains the arguments but not the binary path independently; `ParentProcessId` and `ProcessId` are numeric identifiers, not file paths.',
    docTitle: 'FDR NetworkConnectIP4 Fields',
    docUrl: 'https://falcon.crowdstrike.com/documentation/page/falcon-data-replicator',
  },
  {
    id: 'platform-fdr-q10',
    text: 'A threat hunter wants to find all PE (portable executable) files written to disk on any endpoint in the last 7 days. Which FDR event type captures this activity?',
    options: [
      'ProcessRollup2 — captures executable file creation when a process writes a new binary to disk',
      'PeFileWritten — specifically records when a portable executable file is written to the file system, providing the file hash, path, and writing process',
      'ArchiveFileWritten — captures all file write activity including PE files, providing a superset of PeFileWritten data',
      'NetworkConnectIP4 — captures PE file downloads when they arrive via network connection before being written to disk',
    ],
    correctIndex: 1,
    explanation: '`PeFileWritten` is the FDR event type specifically generated when a PE (portable executable — .exe, .dll, .sys) file is written to the file system. It provides the file path, SHA256 hash, and the process that wrote the file. This event is particularly valuable for detecting malware dropping payloads, lateral movement tools being written to disk, or suspicious DLL placement. `ProcessRollup2` records process execution, not file creation.',
    docTitle: 'FDR File System Event Types',
    docUrl: 'https://falcon.crowdstrike.com/documentation/page/falcon-data-replicator',
  },
]

export const fdrSchemaModule: ContentModule = {
  id: 'platform-fdr-schema',
  title: 'Schema, Event Types & Field Mapping',
  trackId: 'platform-fdr',
  domainId: 'platform',
  order: 2,
  lastReviewed: '2026-08-17',
  concepts: fdrSchemaConcepts,
  quiz: fdrSchemaQuestions,
}

// ── Track 5.1 Scenario ─────────────────────────────────────────────────────

const fdrScenario: Scenario = {
  id: 'platform-fdr-scenario',
  title: 'FDR Deployment: Extending SIEM Visibility Beyond Falcon Detections',
  context: 'Your organisation has Falcon deployed on 2,000 endpoints and uses a SIEM that currently receives only Falcon detections via the Falcon API. Your CISO has asked you to deploy FDR to improve threat hunting capability. You need to design and validate the FDR-to-SIEM pipeline.',
  isCumulative: false,
  steps: [
    {
      id: 'pf-fdr-s1',
      narrative: 'Your CISO asks: "We already get Falcon alerts in the SIEM. Why do we need FDR? What does it add?" What is the most accurate answer?',
      choices: [
        { text: 'FDR provides the raw telemetry events — process creation, network connections, DNS queries, authentication — that are NOT in the Falcon detection API. This full-fidelity stream enables hunting for threats Falcon has not yet detected and reconstructing complete attack timelines, not just the alerts at the end of an attack chain.' },
        { text: 'FDR adds redundancy — if the Falcon API is unavailable, FDR delivers the same detection alerts from S3 as a backup channel.' },
        { text: 'FDR reduces SIEM costs by delivering compressed events at a lower per-GB ingest rate than the Falcon API streaming endpoint.' },
        { text: 'FDR is required by CrowdStrike to be deployed alongside the Falcon API for compliance with the Falcon platform Terms of Service.' },
      ],
      correctChoiceIndex: 0,
      wrongConsequence: 'FDR is not a redundancy channel for detection alerts — it provides raw telemetry that the API does not expose. It is not a cost-reduction tool. And it is not a compliance requirement. The CISO needs to understand the substantive visibility gap FDR fills.',
      reasoning: 'The correct answer directly addresses the gap: the Falcon API delivers what Falcon already decided is suspicious. FDR delivers everything the sensors record — including the 99% of events that did not trigger a detection. A SIEM with only API-based detection integration cannot hunt, cannot reconstruct attack timelines from raw events, and cannot build novel detection rules from the full telemetry stream.',
      docTitle: 'FDR and the Falcon API',
      docUrl: 'https://falcon.crowdstrike.com/documentation/page/falcon-data-replicator',
    },
    {
      id: 'pf-fdr-s2',
      narrative: 'You are designing the S3 bucket configuration. Your data governance team requires that all security data remain in your organisation\'s own AWS account with your own KMS encryption keys. Which FDR deployment model meets this requirement?',
      choices: [
        { text: 'Falcon-managed S3 — request CrowdStrike to apply your KMS key to their managed bucket' },
        { text: 'Customer-managed S3 — provision an S3 bucket in your AWS account, configure server-side encryption with your KMS key, and grant CrowdStrike write access via an IAM role; FDR pushes data to your bucket under your encryption and access controls' },
        { text: 'Hybrid mode — CrowdStrike stores the last 24 hours in Falcon-managed S3 and replicates older data to your customer-managed bucket daily' },
        { text: 'Neither model supports customer-owned KMS encryption — FDR requires CrowdStrike-managed encryption keys regardless of bucket ownership' },
      ],
      correctChoiceIndex: 1,
      wrongConsequence: 'Falcon-managed S3 does not support customer-owned KMS keys — CrowdStrike manages encryption on their buckets. There is no hybrid mode in FDR. The statement that FDR requires CrowdStrike-managed keys is incorrect — customer-managed S3 with customer KMS keys is the standard enterprise deployment pattern for data sovereignty requirements.',
      reasoning: 'Customer-managed S3 gives your organisation full control: your bucket, your KMS key, your IAM access policies, your S3 lifecycle rules. CrowdStrike is granted write-only access via a cross-account IAM role to push FDR data. Your data governance team can enforce bucket policies, audit access via CloudTrail, and configure retention without any dependency on CrowdStrike infrastructure.',
      docTitle: 'FDR Customer-Managed S3 Configuration',
      docUrl: 'https://falcon.crowdstrike.com/documentation/page/falcon-data-replicator',
    },
    {
      id: 'pf-fdr-s3',
      narrative: 'After FDR is deployed, you write a LogScale query to detect PowerShell processes making external network connections. You use `#type=PowerShell AND RemoteAddressIP4=external`. The query returns zero results despite confirmed PowerShell network activity. What is the most likely cause?',
      choices: [
        { text: 'LogScale does not index `RemoteAddressIP4` — network fields are only available in the raw event and cannot be queried directly' },
        { text: 'The query syntax is incorrect — LogScale uses `eventType` not `#type` for FDR event type filtering' },
        { text: 'The `#type` value is wrong — PowerShell network connections appear as `#type=NetworkConnectIP4`, not `#type=PowerShell`; the correct query filters by `#type=NetworkConnectIP4` and `ImageFileName=/powershell\\.exe/i`' },
        { text: 'FDR does not export network connection events — only process events are available in FDR; network data requires the Falcon streaming API' },
      ],
      correctChoiceIndex: 2,
      wrongConsequence: 'LogScale fully indexes FDR fields including `RemoteAddressIP4`. `#type` is the correct LogScale filter for event type. FDR does export `NetworkConnectIP4` events. The problem is the `#type` value used — `#type=PowerShell` does not exist. The FDR connector maps `event_simpleName=NetworkConnectIP4` to `#type=NetworkConnectIP4`; the PowerShell process is identified via `ImageFileName`, not via a separate event type.',
      reasoning: 'The correct query structure separates the event type filter from the process filter: `#type=NetworkConnectIP4 | ImageFileName=/powershell\\.exe/i`. FDR does not have a `#type=PowerShell` event type — it has `ProcessRollup2` for process creation and `NetworkConnectIP4` for network connections. The PowerShell identity is carried in the `ImageFileName` field of the `NetworkConnectIP4` event.',
      docTitle: 'FDR CQL Query Patterns',
      docUrl: 'https://falcon.crowdstrike.com/documentation/page/falcon-data-replicator',
    },
    {
      id: 'pf-fdr-s4',
      narrative: 'Your threat hunting team wants to correlate `ProcessRollup2` events (process creation) with `NetworkConnectIP4` events (network connections) to find processes that were spawned and immediately made an outbound connection. Which field links these two event types for a given endpoint?',
      choices: [
        { text: 'ComputerName — the hostname that is present in both event types' },
        { text: 'RemoteAddressIP4 — the network destination that is present in both event types' },
        { text: 'ProcessId — the process identifier that is present in both event types for the same process instance' },
        { text: 'aid — the Falcon sensor agent ID that uniquely identifies the endpoint and is present in all FDR event types; combined with ProcessId for the same PID, it links a specific process creation to its subsequent network connections' },
      ],
      correctChoiceIndex: 3,
      wrongConsequence: 'ComputerName links events from the same machine but is not reliable for process-level correlation — the same machine may have thousands of processes and network connections in a short window. `RemoteAddressIP4` is only in `NetworkConnectIP4` events, not `ProcessRollup2`. `ProcessId` alone is insufficient — PIDs can be reused across short time windows on busy systems. The combination of `aid` (device identifier) and `ProcessId` (process instance) provides the reliable link between process creation and its network activity.',
      reasoning: 'The two-field join is `aid` + `ProcessId`: `aid` ensures events are from the same sensor/endpoint, and `ProcessId` ensures events are from the same process instance. A query that groups by both fields can identify processes that appeared in `ProcessRollup2` and then appeared in `NetworkConnectIP4` within a short time window — a pattern consistent with malware that executes and immediately calls home.',
      docTitle: 'FDR Cross-Event Correlation',
      docUrl: 'https://falcon.crowdstrike.com/documentation/page/falcon-data-replicator',
    },
    {
      id: 'pf-fdr-s5',
      narrative: 'Six months after FDR deployment, your S3 bucket has accumulated 18 TB of data. Your hunting team only queries the last 90 days. Your cloud cost team asks about optimising storage costs. What is the recommended S3 lifecycle approach?',
      choices: [
        { text: 'Configure S3 lifecycle rules to transition data older than 90 days to S3 Glacier Instant Retrieval for lower storage cost while keeping it queryable for compliance investigations when needed, and delete data older than your organisation\'s defined retention period (e.g., 12 months)' },
        { text: 'Delete all data older than 90 days immediately — if the hunting team does not use it, it has no value and creates unnecessary cost and compliance risk' },
        { text: 'Move all FDR data to S3 Standard-Infrequent Access regardless of age — all security data has equal value and should be retained at the same access tier' },
        { text: 'Contact CrowdStrike to disable FDR for the past 6 months and re-enable it going forward — this will reduce the S3 bucket size retroactively' },
      ],
      correctChoiceIndex: 0,
      wrongConsequence: 'Deleting all data older than 90 days destroys forensic and compliance value — a breach discovered today may have started 6 months ago and requires historical telemetry for investigation. Moving everything to S3 Standard-IA ignores the cost hierarchy (Glacier is cheaper for rarely accessed data). CrowdStrike cannot retroactively remove data already written to your S3 bucket.',
      reasoning: 'A tiered S3 lifecycle policy is the standard approach: hot data (last 90 days) in S3 Standard for fast hunting queries; older data in Glacier Instant Retrieval for infrequent compliance investigations at lower cost; deletion at your defined retention horizon (typically 12–24 months for security telemetry). This balances hunting performance, compliance investigation capability, and cloud cost efficiency.',
      docTitle: 'FDR S3 Storage Lifecycle',
      docUrl: 'https://falcon.crowdstrike.com/documentation/page/falcon-data-replicator',
    },
  ],
}

// ── Track 5.1 Export ────────────────────────────────────────────────────────

export const fdrTrack: ContentTrack = {
  id: 'platform-fdr',
  title: 'Falcon Data Replicator (FDR)',
  domainId: 'platform',
  order: 1,
  modules: [whatIsFdrModule, fdrSchemaModule],
  scenario: fdrScenario,
}
```

**Note on q3:** The correct answer ("The Falcon API only delivers events that triggered detections...") is at `options[2]` with `correctIndex: 2` — matching the required distribution (q3=2). The explanation is clean; no changes needed.

- [ ] **Step 2: Update `src/content/domains/platform.ts`**

```typescript
import { fdrTrack } from './platform-track-5-1'
// tracks: [fdrTrack]
```

- [ ] **Step 3: TypeScript check + tests**

```
npx tsc -b
npm test
```

- [ ] **Step 4: Commit**

```
git add src/content/domains/platform-track-5-1.ts src/content/domains/platform.ts
git commit -m "feat: add Platform Essentials Track 5.1 FDR modules and scenario"
```

---

### Task 2: Track 5.2 — CrowdStrike APIs & Automation

**Files:**
- Create: `src/content/domains/platform-track-5-2.ts`
- Modify: `src/content/domains/platform.ts`

- [ ] **Step 1: Create `src/content/domains/platform-track-5-2.ts`**

Apply distribution: q1=0,q2=1,q3=2,q4=3,q5=0,q6=1,q7=2,q8=3,q9=0,q10=1,q11=2,q12=3,q13=0,q14=1,q15=2; s1=0,s2=1,s3=2,s4=3,s5=0. The correct answer must physically sit at the required index.

```typescript
import type {
  ContentModule,
  ContentTrack,
  QuizQuestion,
  ConceptSection,
  Scenario,
} from '../types'

// ═══════════════════════════════════════════════════════════════════════════════
// Track 5.2 — CrowdStrike APIs & Automation
// ═══════════════════════════════════════════════════════════════════════════════

// ── Module 5.2.1: Falcon API Fundamentals (OAuth2, Scopes) ──────────────────

const apiFundamentalsConcepts: ConceptSection[] = [
  {
    title: 'Falcon API Authentication: OAuth2 Client Credentials Flow',
    body: 'The Falcon platform API uses the OAuth2 client credentials flow for authentication. This is a machine-to-machine flow designed for automated scripts and integrations — it does not involve user login prompts.\n\n**Setup process (one-time):**\n1. In the Falcon console, navigate to **Support & Resources → API Clients & Keys**\n2. Click **Add new API client**\n3. Name the client (e.g., "SIEM-integration-readonly")\n4. Assign the minimum required scopes (e.g., Detections:Read)\n5. Save — you receive a **Client ID** and **Client Secret** (the secret is shown only once)\n\n**Token acquisition (every 30 minutes):**\n```\nPOST https://api.crowdstrike.com/oauth2/token\nContent-Type: application/x-www-form-urlencoded\n\nclient_id=YOUR_CLIENT_ID&client_secret=YOUR_CLIENT_SECRET\n```\n\nThe response includes an `access_token` (Bearer token) valid for 30 minutes.\n\n**Using the token:**\n```\nGET https://api.crowdstrike.com/detects/queries/detects/v1\nAuthorization: Bearer YOUR_ACCESS_TOKEN\n```\n\n**Security best practices:**\n- Store client credentials in a secrets manager (AWS Secrets Manager, HashiCorp Vault), never in code or config files\n- Use one API client per integration — do not share credentials between systems\n- Apply principle of least privilege — grant only the scopes the integration actually requires\n- Rotate client secrets periodically',
    codeExample: '# Acquire Falcon API bearer token\ncurl -s -X POST https://api.crowdstrike.com/oauth2/token \\\n  -H "Content-Type: application/x-www-form-urlencoded" \\\n  -d "client_id=${FALCON_CLIENT_ID}&client_secret=${FALCON_CLIENT_SECRET}" \\\n  | jq -r \'.access_token\'',
    codeLanguage: 'bash',
  },
  {
    title: 'API Scopes: Least Privilege for SIEM/SOAR Integrations',
    body: 'Falcon API scopes control what each API client is permitted to read or write. Scopes are assigned per-verb (Read/Write) — an integration that only needs to read detections should have `Detections:Read` but NOT `Detections:Write`.\n\n**Key scopes for SIEM/SOAR engineers:**\n\n| Scope | Use case |\n|---|---|\n| `Detections:Read` | Query and retrieve detection alerts |\n| `Incidents:Read` | Query and retrieve incidents |\n| `Event Streams:Read` | Subscribe to the Falcon real-time event stream |\n| `Hosts:Read` | Query host/device inventory |\n| `Custom IOA Rules:Read/Write` | Manage custom detection rules |\n| `IOC Management:Read/Write` | Manage indicators of compromise |\n| `Workflows:Read/Write` | Interact with Fusion SOAR workflows |\n| `Falcon Intelligence:Read` | Access threat intelligence data |\n\n**Scope selection principle:** Before creating an API client, list every API endpoint the integration will call, identify the scope required for each, and grant only those scopes. A read-only SIEM integration should never have `:Write` scopes — if the credentials are compromised, the attacker cannot modify platform configuration.\n\n**Audit trail:** Every API call made with a client is logged in Falcon\'s audit log under the client\'s name. Using a descriptive client name (not "api-client-1") makes audit log review meaningful.',
  },
]

const apiFundamentalsQuestions: QuizQuestion[] = [
  {
    id: 'platform-api-q1',
    text: 'Which authentication flow does the Falcon API use for machine-to-machine integrations?',
    options: [
      'OAuth2 client credentials flow — the integration presents a Client ID and Client Secret to obtain a short-lived Bearer token (30-minute TTL) used in subsequent API requests',
      'API key authentication — a static API key is passed in the X-API-Key header on every request without a separate token acquisition step',
      'SAML 2.0 federated authentication — the integration authenticates via the organisation\'s identity provider (IdP) to obtain a Falcon API session token',
      'Basic authentication — the integration passes a Base64-encoded username:password in the Authorization header on every API request',
    ],
    correctIndex: 0,
    explanation: 'The Falcon API uses OAuth2 client credentials flow. The integration POST-s a Client ID and Client Secret to the token endpoint (`/oauth2/token`) and receives a short-lived Bearer token (30-minute TTL). This token is then passed as `Authorization: Bearer <token>` on all subsequent API calls. Static API keys, SAML federation, and Basic auth are not used by the Falcon platform API.',
    docTitle: 'Falcon API Authentication',
    docUrl: 'https://falcon.crowdstrike.com/documentation/page/falcon-api-oauth2',
  },
  {
    id: 'platform-api-q2',
    text: 'What is the correct endpoint and method to obtain a Falcon API Bearer token?',
    options: [
      'GET https://api.crowdstrike.com/auth/token — include Client ID and Secret as query parameters',
      'POST https://api.crowdstrike.com/oauth2/token — include Client ID and Secret as form-encoded body parameters (application/x-www-form-urlencoded)',
      'POST https://api.crowdstrike.com/api/v1/authenticate — include Client ID and Secret as a JSON body',
      'GET https://auth.crowdstrike.com/oauth2/authorize — redirect the client to the Falcon login page to complete the OAuth2 authorization code flow',
    ],
    correctIndex: 1,
    explanation: 'The correct token endpoint is `POST https://api.crowdstrike.com/oauth2/token` with the body as `application/x-www-form-urlencoded` containing `client_id` and `client_secret`. GET requests do not work for token acquisition. The JSON body format is incorrect — the Falcon token endpoint requires form-encoded parameters. The authorization code flow (redirect to login page) is for user-facing OAuth2, not machine-to-machine client credentials.',
    docTitle: 'Falcon API Token Endpoint',
    docUrl: 'https://falcon.crowdstrike.com/documentation/page/falcon-api-oauth2',
  },
  {
    id: 'platform-api-q3',
    text: 'A SIEM integration needs to query Falcon detections but should never be able to modify detection status or create custom IOA rules. Which scope assignment follows the principle of least privilege?',
    options: [
      'Grant Detections:Read, Detections:Write, Custom IOA Rules:Read, Custom IOA Rules:Write — broader scopes simplify future integration changes',
      'Grant Detections:Read, Incidents:Read, Hosts:Read — read-only scopes for the specific data the integration queries, with no write scopes',
      'Grant Detections:Read only — the minimum scope needed; add additional scopes only when a specific requirement is confirmed',
      'Grant Administrator scope — a single high-privilege scope is easier to manage than multiple specific scopes',
    ],
    correctIndex: 2,
    explanation: 'Principle of least privilege means granting the minimum scopes actually required — and nothing more. If the integration only queries detections, grant only `Detections:Read`. Adding `Incidents:Read` and `Hosts:Read` preemptively violates least privilege. Granting write scopes the integration does not need creates an attack surface: if the credentials are compromised, the attacker gains write capabilities. Administrator scope for a read-only integration is the worst possible choice.',
    docTitle: 'Falcon API Scope Best Practices',
    docUrl: 'https://falcon.crowdstrike.com/documentation/page/falcon-api-oauth2',
  },
  {
    id: 'platform-api-q4',
    text: 'A Falcon API Bearer token is acquired at 09:00. At what time does it expire?',
    options: [
      'At 17:00 (8 hours later) — Falcon tokens are valid for one business day',
      'At 09:24 (24 minutes later) — the token TTL matches the Falcon console session timeout',
      'At 10:00 (60 minutes later) — Falcon tokens are valid for one hour by default',
      'At 09:30 (30 minutes later) — Falcon API Bearer tokens have a fixed 30-minute TTL and must be refreshed by re-calling the token endpoint with the client credentials',
    ],
    correctIndex: 3,
    explanation: 'Falcon API Bearer tokens have a fixed 30-minute TTL. At 09:00, the token expires at 09:30. Integrations must implement token refresh logic — typically by catching a 401 Unauthorized response and re-acquiring a new token. There is no refresh token flow in the client credentials grant; the integration simply re-POSTs its client credentials to get a new token.',
    docTitle: 'Falcon API Token TTL',
    docUrl: 'https://falcon.crowdstrike.com/documentation/page/falcon-api-oauth2',
  },
  {
    id: 'platform-api-q5',
    text: 'Where should Falcon API client credentials (Client ID and Client Secret) be stored in a production automation system?',
    options: [
      'In a secrets manager (AWS Secrets Manager, HashiCorp Vault, Azure Key Vault) — credentials are retrieved at runtime and never stored in code, config files, or environment variable declarations in source control',
      'In the automation script as hardcoded variables — this is the most reliable way to ensure the integration always has access to its credentials',
      'In a plaintext config file in the deployment directory — config files are not tracked by git and are therefore safe from exposure',
      'In the CI/CD pipeline\'s environment variables file checked into the repository — this ensures all pipeline runs use the same credentials',
    ],
    correctIndex: 0,
    explanation: 'Client credentials must be stored in a dedicated secrets manager — never hardcoded, never in plaintext config files, and never in source control (including CI/CD environment variable files committed to git). Secrets managers provide: encrypted at-rest storage, access audit logging, rotation management, and just-in-time credential retrieval. Hardcoded credentials in scripts or config files are the most common cause of credential exposure via accidental git commits.',
    docTitle: 'Falcon API Credential Security',
    docUrl: 'https://falcon.crowdstrike.com/documentation/page/falcon-api-oauth2',
  },
]

export const apiFundamentalsModule: ContentModule = {
  id: 'platform-api-fundamentals',
  title: 'Falcon API Fundamentals (OAuth2, Scopes)',
  trackId: 'platform-api',
  domainId: 'platform',
  order: 1,
  lastReviewed: '2026-08-17',
  concepts: apiFundamentalsConcepts,
  quiz: apiFundamentalsQuestions,
}

// ── Module 5.2.2: Key API Endpoints for SIEM/SOAR Engineers ─────────────────

const apiEndpointsConcepts: ConceptSection[] = [
  {
    title: 'Detection and Incident Endpoints',
    body: 'The detection and incident APIs are the most commonly used endpoints for SIEM/SOAR integrations. They follow a two-step query + entity-fetch pattern:\n\n**Step 1 — Query for IDs:**\n- `GET /detects/queries/detects/v1` — returns a list of detection IDs matching a filter\n- `GET /incidents/queries/incidents/v1` — returns a list of incident IDs\n- `GET /devices/queries/devices/v1` — returns a list of host AIDs\n\n**Step 2 — Fetch entity details by ID:**\n- `POST /detects/entities/summaries/GET/v1` — POST a body of `{ "ids": ["det:cid:id1", "det:cid:id2"] }` to get full detection details\n- `POST /incidents/entities/incidents/GET/v1` — POST incident IDs to get full incident details\n- `POST /devices/entities/devices/v2` — POST AIDs to get host details\n\n**FQL (Falcon Query Language) filters:** Both query endpoints accept an `filter` parameter using FQL syntax:\n- `filter=status:\'new\'` — detections in new/open state\n- `filter=severity_name:\'Critical\'+status:\'new\'` — critical unacknowledged detections\n- `filter=max_severity_displayname:\'High\'` — incidents with High max severity\n\n**Pagination:** Query endpoints return up to 500 IDs per call. Use `offset` and `limit` parameters for pagination:\n```\nGET /detects/queries/detects/v1?filter=status:\'new\'&limit=100&offset=100\n```',
    codeExample: '# Two-step pattern: query IDs then fetch details\n\n# Step 1: Get detection IDs (max 500 per call)\nIDS=$(curl -s -H "Authorization: Bearer $TOKEN" \\\n  "https://api.crowdstrike.com/detects/queries/detects/v1?filter=status:\'new\'&limit=100" \\\n  | jq -r \'.resources[]\')\n\n# Step 2: Fetch detection details\ncurl -s -X POST https://api.crowdstrike.com/detects/entities/summaries/GET/v1 \\\n  -H "Authorization: Bearer $TOKEN" \\\n  -H "Content-Type: application/json" \\\n  -d "{\"ids\": [\"$(echo $IDS | tr \' \' \'\",\"\')\"]}"',
    codeLanguage: 'bash',
  },
  {
    title: 'Event Streaming and Host Management Endpoints',
    body: 'Beyond detections and incidents, SIEM/SOAR engineers commonly use these endpoint groups:\n\n**Event Streaming (real-time):**\n- `GET /event-streams/entities/streams/v4` — list available streaming connections for the tenant\n- Subscribe to the partition URLs returned to receive real-time Falcon events (detections, audit events, auth events) as they occur\n- Unlike FDR (S3-based batch), the Event Streams API delivers events in real time with sub-second latency — use this for real-time alerting, not historical hunting\n\n**Host and Device Management:**\n- `GET /devices/queries/devices/v1?filter=platform_name:\'Windows\'+status:\'normal\'` — find all healthy Windows hosts\n- `POST /devices/entities/devices/v2` — get detailed host information (hostname, OS version, sensor version, last seen, containment status)\n- `POST /devices/action/v2` — trigger host actions: `contain` (network containment) or `lift_containment`\n\n**IOC Management:**\n- `POST /iocs/entities/indicators/v1` — create a custom IOC (block/monitor a file hash, IP, domain)\n- `GET /iocs/queries/indicators/v1` — list existing IOCs with filters\n- `DELETE /iocs/entities/indicators/v1` — delete an IOC\n\n**Rate Limits:** All Falcon API endpoints have rate limits (typically 100–6,000 requests per minute depending on the endpoint). Implement exponential backoff when receiving `429 Too Many Requests` responses.',
  },
]

const apiEndpointsQuestions: QuizQuestion[] = [
  {
    id: 'platform-api-q6',
    text: 'What is the correct two-step pattern for retrieving Falcon detection details via the API?',
    options: [
      'Step 1: POST /detects/entities/summaries/GET/v1 with an empty body to get all detections. Step 2: Filter the returned JSON client-side for the detections you need.',
      'Step 1: GET /detects/queries/detects/v1 with a filter to retrieve detection IDs. Step 2: POST /detects/entities/summaries/GET/v1 with those IDs to fetch full detection details.',
      'Step 1: GET /detects/entities/detects/v1 to fetch all detection details in a single paginated call. Step 2: Parse the response for the specific fields needed.',
      'Step 1: POST /detects/queries/detects/v1 with a filter payload. Step 2: GET /detects/entities/summaries/GET/v1 with the IDs as query parameters.',
    ],
    correctIndex: 1,
    explanation: 'The Falcon API uses a query-then-fetch pattern. Query endpoints (GET, returning IDs) and entity endpoints (POST with IDs, returning details) are separate. Step 1: `GET /detects/queries/detects/v1?filter=status:\'new\'` returns detection IDs. Step 2: `POST /detects/entities/summaries/GET/v1` with a body of `{"ids": [...]}` returns the full detection details. This two-step pattern is consistent across detections, incidents, and hosts.',
    docTitle: 'Falcon Detections API',
    docUrl: 'https://falcon.crowdstrike.com/documentation/page/falcon-api-detections',
  },
  {
    id: 'platform-api-q7',
    text: 'A SOAR playbook needs to automatically place a compromised host in network containment via the Falcon API. Which endpoint and action name achieves this?',
    options: [
      'POST /network/containment/v1 with body {"device_id": "<aid>", "action": "isolate"}',
      'PATCH /devices/entities/devices/v2 with body {"aid": "<aid>", "contained": true}',
      'POST /devices/action/v2 with body {"action_name": "contain", "ids": ["<aid>"]} — the contain action triggers Falcon\'s network containment on the specified host, blocking all external network traffic while preserving the Falcon sensor connection',
      'POST /incidents/action/v1 with body {"action": "contain_host", "host_id": "<aid>"}',
    ],
    correctIndex: 2,
    explanation: '`POST /devices/action/v2` is the correct endpoint for host actions including network containment. The request body specifies `"action_name": "contain"` and the list of AIDs to contain. Containment blocks all network traffic except the Falcon sensor\'s connection to CrowdStrike, allowing remote investigation to continue. To lift containment, use the same endpoint with `"action_name": "lift_containment"`. The other endpoint paths do not exist in the Falcon API.',
    docTitle: 'Falcon Devices Action API',
    docUrl: 'https://falcon.crowdstrike.com/documentation/page/falcon-api-devices',
  },
  {
    id: 'platform-api-q8',
    text: 'Your SIEM integration calls `GET /detects/queries/detects/v1` and receives 500 detection IDs in the response (the maximum per call). How do you retrieve additional detections beyond the first 500?',
    options: [
      'The Falcon API limits detection queries to 500 results per tenant per day — if you receive 500, you have seen all available detections',
      'Use the `next_page_token` from the response body in a subsequent GET request to retrieve the next page',
      'Increase the `limit` parameter beyond 500 — the 500 limit is a default, not a maximum',
      'Use the `offset` and `limit` parameters: increment `offset` by the `limit` value in each subsequent call (e.g., offset=0,limit=500 → offset=500,limit=500 → offset=1000) until the response resources array is empty or smaller than the limit',
    ],
    correctIndex: 3,
    explanation: 'The Falcon API query endpoints use `offset`-based pagination. The `limit` parameter is capped at 500 for most endpoints. To paginate beyond the first 500 results: call again with `offset=500&limit=500`, then `offset=1000&limit=500`, and so on. Stop when the response contains fewer IDs than the requested limit (indicating the last page) or when `resources` is empty. There is no `next_page_token` in the Falcon API — it uses explicit offset/limit parameters.',
    docTitle: 'Falcon API Pagination',
    docUrl: 'https://falcon.crowdstrike.com/documentation/page/falcon-api-detections',
  },
  {
    id: 'platform-api-q9',
    text: 'What is the key difference between the Falcon Event Streams API and FDR for real-time SIEM use cases?',
    options: [
      'The Event Streams API delivers real-time events with sub-second latency via a persistent connection — appropriate for real-time alerting and automated response; FDR is near-real-time (seconds to minutes via S3) — appropriate for detection, investigation, and hunting workloads',
      'FDR delivers real-time events and the Event Streams API delivers batch events — they are the reverse of what most documentation implies',
      'Both deliver the same events at the same latency; the difference is that FDR requires an S3 bucket while Event Streams uses a direct HTTP connection',
      'The Event Streams API and FDR are mutually exclusive — customers must choose one based on their SIEM architecture',
    ],
    correctIndex: 0,
    explanation: 'Event Streams API = real-time streaming (sub-second, persistent connection, appropriate for live detection and automated response). FDR = near-real-time batch to S3 (seconds to minutes, appropriate for hunting, investigation, and SIEM correlation). They are NOT mutually exclusive — many organisations use both: Event Streams for real-time response and FDR for historical analysis. The events delivered may overlap, but the latency and access patterns differ significantly.',
    docTitle: 'Falcon Event Streams API',
    docUrl: 'https://falcon.crowdstrike.com/documentation/page/falcon-api-streaming',
  },
  {
    id: 'platform-api-q10',
    text: 'A SOAR playbook calls the Falcon API and receives a 429 HTTP status code. What does this indicate and how should the playbook respond?',
    options: [
      'A 429 indicates rate limiting — the API client has exceeded the allowed request rate for this endpoint. The playbook should implement exponential backoff: wait briefly, retry, and increase the wait interval on each successive 429 response.',
      'A 429 indicates the Bearer token has expired — the playbook should immediately re-authenticate and retry the request with a new token.',
      'A 429 indicates the Falcon API is temporarily unavailable — the playbook should alert the SOC team and halt execution.',
      'A 429 indicates the API client does not have the required scope — the playbook should request additional permissions before retrying.',
    ],
    correctIndex: 0,
    explanation: '429 Too Many Requests is the standard HTTP rate limiting response. The Falcon API rate-limits clients per endpoint per minute. The correct response is exponential backoff: wait a short interval (e.g., 1 second), retry, and if another 429 is received, double the wait interval. Token expiry returns 401 Unauthorized; API unavailability returns 503 Service Unavailable; insufficient scope returns 403 Forbidden.',
    docTitle: 'Falcon API Rate Limiting',
    docUrl: 'https://falcon.crowdstrike.com/documentation/page/falcon-api-rate-limits',
  },
]

export const apiEndpointsModule: ContentModule = {
  id: 'platform-api-endpoints',
  title: 'Key API Endpoints for SIEM/SOAR Engineers',
  trackId: 'platform-api',
  domainId: 'platform',
  order: 2,
  lastReviewed: '2026-08-17',
  concepts: apiEndpointsConcepts,
  quiz: apiEndpointsQuestions,
}

// ── Module 5.2.3: Building Automation Scripts Against the API ────────────────

const apiAutomationConcepts: ConceptSection[] = [
  {
    title: 'FalconPy: The Official CrowdStrike Python SDK',
    body: 'FalconPy is CrowdStrike\'s officially supported Python SDK for the Falcon API. It handles OAuth2 token acquisition and refresh automatically, provides a class-based interface for each API service, and abstracts pagination helpers.\n\n**Installation:**\n```\npip install crowdstrike-falconpy\n```\n\n**Basic usage pattern:**\n```python\nfrom falconpy import Detections\n\nfalcon = Detections(\n    client_id=os.environ["FALCON_CLIENT_ID"],\n    client_secret=os.environ["FALCON_CLIENT_SECRET"]\n)\n\n# Query detection IDs\nids_response = falcon.query_detections(filter="status:\'new\'")\ndetection_ids = ids_response["body"]["resources"]\n\n# Fetch detection details\ndetails_response = falcon.get_detect_summaries(ids=detection_ids)\ndetections = details_response["body"]["resources"]\n```\n\nFalconPy automatically refreshes the Bearer token when it expires — no manual token management required. It also handles the two-step query/entity pattern transparently for most service classes.\n\n**Key service classes for SIEM/SOAR:**\n- `Detections` — manage detections\n- `Incidents` — manage incidents\n- `Hosts` — query and act on endpoints\n- `IOC` — manage indicators of compromise\n- `Intel` — access Falcon Intelligence data\n- `EventStreams` — subscribe to real-time event streams',
  },
  {
    title: 'Production Script Patterns: Error Handling and Reliability',
    body: 'A production-grade Falcon API automation script requires more than happy-path API calls. Key reliability patterns:\n\n**Token refresh handling (without FalconPy):**\n- Check token expiry before each API call (subtract 60 seconds from 30-minute TTL for safety margin)\n- Re-acquire token proactively rather than waiting for a 401 response mid-run\n\n**Rate limit handling:**\n- Implement exponential backoff with jitter on 429 responses\n- Use the `X-Ratelimit-Remaining` and `X-Ratelimit-RetryAfter` response headers to pace requests\n\n**Idempotent operations:**\n- SOAR automation scripts should be designed to run safely if triggered multiple times for the same event\n- Check if an action has already been taken (e.g., host already contained) before executing containment\n- Use the Falcon audit log to verify prior actions rather than assuming state\n\n**Logging and observability:**\n- Log every API call with: timestamp, endpoint, HTTP status, request ID from response headers\n- Log all state changes (detection status updated, host contained, IOC created) with the detection/incident ID as correlation key\n- Alert on repeated 401 or 403 errors — these indicate credential issues, not transient failures\n\n**Testing automation against Falcon:**\n- Use the Falcon API sandbox environment for development (separate CID with test data)\n- Test error paths explicitly: simulate 429, 401, and 503 responses\n- Validate that idempotent actions do not create duplicate results',
  },
]

const apiAutomationQuestions: QuizQuestion[] = [
  {
    id: 'platform-api-q11',
    text: 'What is the primary advantage of using FalconPy (the official Python SDK) over making raw HTTP requests to the Falcon API?',
    options: [
      'FalconPy provides access to undocumented Falcon API endpoints not available via direct HTTP calls',
      'FalconPy automatically handles OAuth2 token acquisition and refresh, eliminating manual token management from automation scripts',
      'FalconPy delivers faster API responses than direct HTTP by maintaining a persistent connection pool to CrowdStrike servers',
      'FalconPy is required by CrowdStrike — third-party HTTP clients are blocked by the Falcon API gateway',
    ],
    correctIndex: 1,
    explanation: 'FalconPy\'s primary practical advantage is automatic OAuth2 token management — it acquires the initial token and refreshes it transparently when it expires, so automation scripts do not need to implement token lifecycle logic. It also provides a clean service-based interface that abstracts the two-step query/entity pattern. FalconPy does not have access to undocumented APIs, does not provide faster responses (it makes the same HTTP calls), and is not required — any HTTP client can call the Falcon API.',
    docTitle: 'FalconPy Python SDK',
    docUrl: 'https://falcon.crowdstrike.com/documentation/page/falcon-api-sdk',
  },
  {
    id: 'platform-api-q12',
    text: 'A SOAR playbook is triggered by a Falcon detection and should automatically contain the affected host. Before executing containment, what should the script check?',
    options: [
      'Whether the detection severity is Critical — containment should only be triggered for Critical detections, not High or Medium',
      'Whether the detection was created in the last 5 minutes — older detections may be stale and should not trigger automated containment',
      'Whether the host already exists in Falcon — if it does not exist, containment will fail silently',
      'Whether the host is already contained — triggering containment on an already-contained host is a redundant operation; checking first prevents duplicate audit log entries and allows the playbook to log that containment was already in place',
    ],
    correctIndex: 3,
    explanation: 'Checking the current host containment status before executing containment is the idempotent design pattern: if the host is already contained (by a prior run, a manual action, or another automation), the playbook logs this state and continues without re-triggering containment. This prevents duplicate actions, keeps the audit log clean, and ensures the playbook is safe to re-run on the same detection without side effects.',
    docTitle: 'Falcon API Automation Best Practices',
    docUrl: 'https://falcon.crowdstrike.com/documentation/page/falcon-api-sdk',
  },
  {
    id: 'platform-api-q13',
    text: 'Your Falcon API automation script logs a sustained series of 401 Unauthorized responses after running successfully for weeks. What is the most likely cause?',
    options: [
      'The Falcon API client credentials (Client ID or Client Secret) have been rotated or the client has been deleted — the automation is using stale credentials that are no longer valid',
      'The Bearer token TTL has changed from 30 minutes to a shorter interval — the script\'s token refresh interval is now too long',
      'The Falcon API rate limit for the token endpoint has been exceeded — 401 responses are returned instead of 429 when too many token requests are made',
      'The API client\'s scopes have been automatically reduced by CrowdStrike\'s quarterly permission review process',
    ],
    correctIndex: 0,
    explanation: 'A sustained series of 401 Unauthorized responses after a previously working integration almost always indicates a credential problem: the Client Secret was rotated (a new secret was generated, invalidating the old one), the API client was deleted, or the client was suspended. Bearer token refresh logic handles 401s from expired tokens with a single re-auth; sustained 401s across multiple re-auth attempts indicate the credentials themselves are no longer valid.',
    docTitle: 'Falcon API Credential Troubleshooting',
    docUrl: 'https://falcon.crowdstrike.com/documentation/page/falcon-api-oauth2',
  },
  {
    id: 'platform-api-q14',
    text: 'Which Falcon API response header tells an automation script how long to wait before retrying after receiving a 429 rate limit response?',
    options: [
      'X-CrowdStrike-Wait-Seconds — a CrowdStrike-specific header indicating the retry interval in seconds',
      'X-Ratelimit-RetryAfter — contains the Unix timestamp after which the next request will be accepted; the script should wait until this time before retrying',
      'Retry-After — the standard HTTP header (in seconds) that all Falcon API rate-limit responses include',
      'X-Ratelimit-Reset — contains the epoch time when the rate limit window resets for this endpoint',
    ],
    correctIndex: 1,
    explanation: 'The Falcon API uses `X-Ratelimit-RetryAfter`, which contains a Unix timestamp indicating when the rate limit resets for this endpoint. The script should calculate the wait duration by subtracting the current time from this timestamp and sleeping for that interval. The companion header `X-Ratelimit-Remaining` shows how many requests remain in the current window — useful for proactive rate limit management.',
    docTitle: 'Falcon API Rate Limit Headers',
    docUrl: 'https://falcon.crowdstrike.com/documentation/page/falcon-api-rate-limits',
  },
  {
    id: 'platform-api-q15',
    text: 'You are building a Falcon API integration for a new security tool. Which practice best ensures the integration remains maintainable as the Falcon API evolves?',
    options: [
      'Use CrowdStrike-versioned API paths (e.g., `/v1`, `/v2`) and update the integration when CrowdStrike deprecates older API versions, checking the Falcon API changelog and deprecation notices regularly',
      'Hardcode all API response field names directly in the application logic — this ensures the integration does not break when CrowdStrike changes its field documentation',
      'Pin to the specific API version in use today and never update — API version changes always break backward compatibility',
      'Build the integration against the Falcon API Swagger/OpenAPI specification and regenerate client code from the spec on a weekly schedule to stay current automatically',
    ],
    correctIndex: 0,
    explanation: 'Using versioned API paths and monitoring the Falcon API changelog for deprecation notices is the sustainable maintenance approach. CrowdStrike maintains backward compatibility within a version (e.g., `/v1`) and announces deprecations in advance when a new version (`/v2`) replaces an old one. Hardcoding field names in application logic breaks when fields are renamed or removed. Pinning to a version without updating eventually hits a forced migration when the version is sunset. Auto-regenerating from Swagger weekly introduces untested changes without validation.',
    docTitle: 'Falcon API Versioning',
    docUrl: 'https://falcon.crowdstrike.com/documentation/page/falcon-api-versioning',
  },
]

export const apiAutomationModule: ContentModule = {
  id: 'platform-api-automation',
  title: 'Building Automation Scripts Against the Falcon API',
  trackId: 'platform-api',
  domainId: 'platform',
  order: 3,
  lastReviewed: '2026-08-17',
  concepts: apiAutomationConcepts,
  quiz: apiAutomationQuestions,
}

// ── Track 5.2 Scenario ─────────────────────────────────────────────────────

const apiScenario: Scenario = {
  id: 'platform-api-scenario',
  title: 'Building the Integration: Falcon API for Automated Triage',
  context: 'You are building a SOAR automation that automatically triages Falcon detections: new Critical detections should trigger host containment after analyst approval. The SOAR system uses the Falcon API. You are designing the authentication, query, and action logic.',
  isCumulative: false,
  steps: [
    {
      id: 'pf-api-s1',
      narrative: 'You need to create a Falcon API client for the SOAR integration. The integration will: (1) query new Critical detections, (2) read host details, and (3) trigger network containment after analyst approval. Which scope set follows least privilege?',
      choices: [
        { text: 'Detections:Read, Hosts:Read, Devices:Write — the minimum scopes for querying detections, reading host details, and triggering containment actions' },
        { text: 'Detections:Read, Incidents:Read, Hosts:Read, Hosts:Write, Custom IOA Rules:Read, Workflows:Read, Falcon Intelligence:Read — broad read access prevents future scope additions' },
        { text: 'Administrator — a single high-privilege scope eliminates scope configuration complexity' },
        { text: 'Detections:Write, Hosts:Write, Devices:Write — write scopes include read access, so this reduces the number of scope assignments' },
      ],
      correctChoiceIndex: 0,
      wrongConsequence: 'The broad scope set violates least privilege — granting Intelligence, Workflows, and IOA Rules scopes to a triage-only integration creates unnecessary attack surface. Administrator scope is the most dangerous option. Write-only scopes do not include read access in the Falcon API — they are genuinely separate.',
      reasoning: 'The integration needs exactly three capabilities: read detections (Detections:Read), read host information (Hosts:Read), and trigger containment actions on devices (Devices:Write — the containment action endpoint requires this scope). No other scopes are needed for this use case. Grant exactly these three; add additional scopes only when a specific new requirement is confirmed.',
      docTitle: 'Falcon API Client Scope Configuration',
      docUrl: 'https://falcon.crowdstrike.com/documentation/page/falcon-api-oauth2',
    },
    {
      id: 'pf-api-s2',
      narrative: 'Your script acquires a Bearer token at integration startup. After 35 minutes, it calls `GET /detects/queries/detects/v1` and receives a 401 Unauthorized response. What should the script do?',
      choices: [
        { text: 'Log the 401 as a fatal error and halt execution — the integration credentials may have been revoked' },
        { text: 'Re-acquire a new Bearer token by re-calling POST /oauth2/token with the client credentials, then retry the failed request with the new token — a 401 after 30+ minutes is almost certainly a token expiry, not a credential problem' },
        { text: 'Retry the request with the same expired token — some API endpoints accept tokens beyond their 30-minute TTL' },
        { text: 'Sleep for 30 minutes and retry — the token will automatically renew after its TTL expires' },
      ],
      correctChoiceIndex: 1,
      wrongConsequence: 'Halting on the first 401 is too aggressive — token expiry is expected after 30 minutes and is handled by re-authentication. Retrying with an expired token will produce another 401. Tokens do not auto-renew — the integration must explicitly re-call the token endpoint. Sleeping 30 minutes is a non-functional approach to token refresh.',
      reasoning: 'A 401 after 35 minutes of operation is almost certainly token expiry (TTL = 30 minutes). The correct response is immediate re-authentication: POST /oauth2/token with client credentials to get a new token, then retry the original request. Production scripts should track token acquisition time and proactively refresh the token 60 seconds before expiry rather than waiting for a 401.',
      docTitle: 'Falcon API Token Refresh',
      docUrl: 'https://falcon.crowdstrike.com/documentation/page/falcon-api-oauth2',
    },
    {
      id: 'pf-api-s3',
      narrative: 'You call `GET /detects/queries/detects/v1?filter=status:\'new\'+severity_name:\'Critical\'` and receive exactly 500 detection IDs. You need all new Critical detections, not just the first 500. What do you do?',
      choices: [
        { text: 'Accept the 500-ID response as complete — the Falcon API guarantees that Critical detections always fit within the 500-result limit' },
        { text: 'Use a tighter time-based filter (e.g., `created_timestamp:>\'2026-01-01\'`) to reduce the result set below 500 — this is the recommended approach for large result sets' },
        { text: 'Paginate using offset/limit: call again with offset=500,limit=500; continue incrementing offset by 500 until a response returns fewer than 500 IDs, indicating the last page has been reached' },
        { text: 'Switch to the POST /detects/queries/detects/v1 endpoint — the POST version supports unlimited results and does not have the 500-ID cap' },
      ],
      correctChoiceIndex: 2,
      wrongConsequence: 'A 500-ID response does not guarantee completeness — it guarantees there are AT LEAST 500 results; there may be thousands more. Time-based sub-filtering may miss detections outside the filtered window. There is no unlimited POST version of the query endpoint — both GET and POST-based query endpoints use the same 500-per-call limit with offset pagination.',
      reasoning: 'When the query returns exactly 500 IDs (the maximum), there may be more. Paginate by incrementing offset: offset=0 limit=500, then offset=500 limit=500, then offset=1000 limit=500, and so on until a response returns fewer than 500 IDs (or zero). Collect all IDs across all pages before fetching entity details in batches.',
      docTitle: 'Falcon API Pagination',
      docUrl: 'https://falcon.crowdstrike.com/documentation/page/falcon-api-detections',
    },
    {
      id: 'pf-api-s4',
      narrative: 'You are about to trigger network containment on the affected host via `POST /devices/action/v2`. Before executing, the script calls `POST /devices/entities/devices/v2` to check the host\'s current status. The response shows `"status": "containment_pending"`. What should the script do?',
      choices: [
        { text: 'Trigger containment anyway — the API is idempotent and will handle duplicate containment requests gracefully' },
        { text: 'Abort the entire playbook — if containment is pending, the playbook has been triggered in error' },
        { text: 'Wait 60 seconds and re-check the status — containment_pending means the sensor is processing the command; proceed when status becomes "contained" or log that containment was already in progress if the timeout is reached' },
        { text: 'Escalate to a human analyst — automated scripts cannot handle containment_pending status and require manual intervention' },
      ],
      correctChoiceIndex: 3,
      wrongConsequence: 'Triggering containment on a host in "containment_pending" state sends a duplicate command that the sensor is already processing — potentially causing unexpected state transitions. Aborting the entire playbook loses the rest of the triage workflow. Automated scripts can absolutely handle containment_pending — it is a standard expected state during automated workflows.',
      reasoning: 'Wait and re-poll is the correct handling for "containment_pending": the Falcon sensor has received the containment command and is applying it. Retrying after 60 seconds allows the sensor to complete the pending containment and report "contained" status. If the timeout is reached without a state transition, log the anomaly and alert a human. This is a standard SOAR polling pattern for asynchronous Falcon operations.',
      docTitle: 'Falcon Host Containment Status',
      docUrl: 'https://falcon.crowdstrike.com/documentation/page/falcon-api-devices',
    },
    {
      id: 'pf-api-s5',
      narrative: 'Your SOAR integration has been running in production for 3 months. The Falcon API changelog announces that `/detects/queries/detects/v1` will be deprecated in 6 months in favour of `/detects/queries/detects/v2` with an improved filter syntax. What should you do?',
      choices: [
        { text: 'Update the integration to use `/v2` before the deprecation deadline, validate the new endpoint in a non-production environment first, and update the FQL filter syntax to match the v2 specification — planned migrations during deprecation windows are safer than emergency updates after sunset' },
        { text: 'Continue using `/v1` indefinitely — CrowdStrike rarely enforces API deprecation deadlines and the endpoint will likely remain functional after the announced sunset date' },
        { text: 'Replace the entire SOAR integration with a new one built on the Falcon console UI — API integrations are inherently fragile and UI-based workflows are more stable' },
        { text: 'Contact CrowdStrike support to request an exemption from the deprecation — long-running production integrations are typically granted permanent extensions' },
      ],
      correctChoiceIndex: 0,
      wrongConsequence: 'Ignoring deprecation timelines and assuming CrowdStrike will not enforce them is the highest-risk approach — when the sunset happens, the integration breaks in production without warning. Replacing API integrations with UI-based workflows is not scalable for automated SOAR. Support exemptions exist for genuinely exceptional cases but should not be relied on as a maintenance strategy.',
      reasoning: 'The 6-month deprecation window is ample time for a planned migration. The correct approach: (1) read the v2 changelog to identify filter syntax changes, (2) implement v2 support in a development branch, (3) validate against the Falcon sandbox environment, (4) deploy to production well before the deadline. Planned migrations during deprecation windows are always safer, cheaper, and less disruptive than emergency remediations after a broken production integration.',
      docTitle: 'Falcon API Versioning and Deprecation',
      docUrl: 'https://falcon.crowdstrike.com/documentation/page/falcon-api-versioning',
    },
  ],
}

// ── Track 5.2 Export ────────────────────────────────────────────────────────

export const apiTrack: ContentTrack = {
  id: 'platform-api',
  title: 'CrowdStrike APIs & Automation',
  domainId: 'platform',
  order: 2,
  modules: [apiFundamentalsModule, apiEndpointsModule, apiAutomationModule],
  scenario: apiScenario,
}
```

- [ ] **Step 2: Update `src/content/domains/platform.ts`**

```typescript
import { apiTrack } from './platform-track-5-2'
// tracks: [fdrTrack, apiTrack]
```

- [ ] **Step 3: TypeScript check + tests**

```
npx tsc -b
npm test
```

- [ ] **Step 4: Commit**

```
git add src/content/domains/platform-track-5-2.ts src/content/domains/platform.ts
git commit -m "feat: add Platform Essentials Track 5.2 APIs & Automation modules and scenario"
```

---

### Task 3: Track 5.3 — Reporting & Governance

**Files:**
- Create: `src/content/domains/platform-track-5-3.ts`
- Modify: `src/content/domains/platform.ts`

- [ ] **Step 1: Create `src/content/domains/platform-track-5-3.ts`**

Apply distribution: q1=0,q2=1,q3=2,q4=3,q5=0,q6=1,q7=2,q8=3,q9=0,q10=1; s1=0,s2=1,s3=2,s4=3,s5=0. The correct answer must physically sit at the required index.

```typescript
import type {
  ContentModule,
  ContentTrack,
  QuizQuestion,
  ConceptSection,
  Scenario,
} from '../types'

// ═══════════════════════════════════════════════════════════════════════════════
// Track 5.3 — Reporting & Governance
// ═══════════════════════════════════════════════════════════════════════════════

// ── Module 5.3.1: Scheduled Reports & Executive Dashboards ──────────────────

const reportingConcepts: ConceptSection[] = [
  {
    title: 'LogScale Scheduled Searches: Automating Recurring Reports',
    body: 'LogScale saved searches can be scheduled to run automatically and deliver results to stakeholders who do not have direct LogScale access. Scheduled searches are the primary mechanism for recurring operational reports.\n\n**Creating a scheduled search:**\n1. Write and validate a CQL query in LogScale\n2. Save it as a saved search with a descriptive name\n3. Configure a schedule: frequency (hourly, daily, weekly), time, and time zone\n4. Set an alert threshold: trigger delivery only if the query returns results, or always deliver\n5. Configure delivery: email (CSV attachment or inline summary), webhook, or Slack\n\n**Key scheduled report use cases for SIEM/SOAR engineers:**\n\n| Report | Query pattern | Audience |\n|---|---|\n---|\n| Daily detection summary | Count detections by severity, last 24h | SOC lead |\n| Weekly MTTD report | Average time from event to detection, last 7 days | Security manager |\n| Monthly threat summary | Top detection types, affected hosts, remediation rate | CISO |\n| Compliance report | Specific event types required by framework (e.g., all admin logins, last 30 days) | Audit team |\n\n**Delivery format considerations:**\n- **CSV email attachment:** Suitable for data-heavy reports consumed by analysts in Excel/Sheets\n- **Inline summary email:** Suitable for executive-level reports needing a simple narrative view\n- **Webhook/Slack:** Suitable for operational alerts to a SOC channel on a schedule',
  },
  {
    title: 'Executive Dashboards in LogScale: Metrics That Matter',
    body: 'LogScale dashboards aggregate multiple saved searches into a visual view. Dashboards can be shared via a read-only link — allowing executives and stakeholders to view real-time metrics without a LogScale account.\n\n**Key SIEM metrics for executive dashboards:**\n\n**Operational metrics:**\n- Alert volume by severity (Critical / High / Medium / Low) — trend over time\n- Mean Time to Detect (MTTD): average time between event occurrence and Falcon detection\n- Mean Time to Respond (MTTR): average time between detection and analyst acknowledgement\n- Detection-to-containment time: MTTD + analyst response + containment execution\n\n**Coverage metrics:**\n- Endpoint coverage: % of known endpoints with active Falcon sensors\n- FDR telemetry coverage: % of expected event types present in the last 24 hours\n- LogScale ingest health: events/second compared to expected baseline\n\n**Trend metrics:**\n- Week-over-week alert volume change\n- Top recurring detection types (recurring detections may indicate a detection tuning gap)\n- Repeat offender endpoints (same host generating detections repeatedly)\n\n**Dashboard sharing options:**\n- **Public link:** Anyone with the link can view (no auth required) — use only for internal non-sensitive dashboards\n- **Logged-in users:** Only users with LogScale accounts can view — appropriate for SIEM team dashboards\n- **Scheduled email screenshot:** A dashboard rendered as an image on a schedule — appropriate for executives who prefer email delivery',
  },
]

const reportingQuestions: QuizQuestion[] = [
  {
    id: 'platform-gov-q1',
    text: 'An audit team needs a monthly report of all successful logins to domain administrator accounts for the past 30 days. They do not have LogScale access. Which approach delivers this most effectively?',
    options: [
      'Create a LogScale scheduled search that runs monthly, queries all successful domain admin logins for the past 30 days, and emails the results as a CSV attachment to the audit team\'s distribution list',
      'Share read-only LogScale dashboard access with the audit team for self-service reporting',
      'Export the LogScale data monthly to a CSV file manually and email it to the audit team',
      'Create a Falcon API script that the audit team runs manually when they need the report',
    ],
    correctIndex: 0,
    explanation: 'A scheduled search with email delivery is the correct approach for recipients without LogScale access who need a recurring report on a fixed schedule. The audit team receives the CSV automatically each month without needing to log into LogScale, run queries, or rely on a manual process. Giving the audit team LogScale access goes beyond their need (they only need the specific report). Manual export and API scripts introduce human dependencies.',
    docTitle: 'LogScale Scheduled Searches',
    docUrl: 'https://library.humio.com/falcon-logscale/docs-alerts-scheduled-searches.html',
  },
  {
    id: 'platform-gov-q2',
    text: 'Your CISO wants a real-time dashboard showing current alert volume, MTTD, and MTTR. Stakeholders including non-technical executives should be able to view it without logging into LogScale. Which sharing approach is appropriate?',
    options: [
      'Create individual LogScale accounts for all executive stakeholders — they need access to the full LogScale interface to understand the metrics in context',
      'Share a read-only dashboard link with executives — LogScale dashboards can be shared via a URL that does not require authentication, allowing stakeholders to view the live dashboard without a LogScale account',
      'Schedule a daily email with a screenshot of the dashboard at a fixed time — real-time access requires LogScale accounts',
      'Export the dashboard data to a Google Sheets document and share the Sheet link — LogScale cannot provide real-time access to non-authenticated users',
    ],
    correctIndex: 1,
    explanation: 'LogScale dashboards can be shared via a read-only link that does not require LogScale authentication. The link displays the live dashboard with real-time data as the queries refresh. This is appropriate for executive stakeholders who need visibility into security metrics without needing full LogScale access. Creating individual accounts for executives gives excessive platform access; scheduled screenshots lose real-time currency.',
    docTitle: 'LogScale Dashboard Sharing',
    docUrl: 'https://library.humio.com/falcon-logscale/docs-dashboards.html',
  },
  {
    id: 'platform-gov-q3',
    text: 'Which SIEM metric most directly measures the effectiveness of your threat detection capability?',
    options: [
      'Total alert volume — more alerts indicate more comprehensive threat coverage',
      'Endpoint coverage percentage — the proportion of endpoints with active Falcon sensors',
      'Mean Time to Detect (MTTD) — the average time between a threat event occurring and it being detected by the SIEM; lower MTTD means threats are identified earlier in the attack lifecycle',
      'Total events ingested per day — higher ingest volume indicates better telemetry coverage',
    ],
    correctIndex: 2,
    explanation: 'MTTD (Mean Time to Detect) directly measures detection effectiveness: how quickly your SIEM identifies threat activity after it occurs. Low MTTD means early detection = limited attacker dwell time = reduced blast radius. Total alert volume is a volume metric, not an effectiveness metric — high alert volume can indicate poor tuning (noise). Endpoint coverage measures deployment completeness. Events/day measures data volume, not detection quality.',
    docTitle: 'SIEM KPIs and Metrics',
    docUrl: 'https://falcon.crowdstrike.com/documentation/page/falcon-siem-reporting',
  },
  {
    id: 'platform-gov-q4',
    text: 'A scheduled LogScale search for a compliance report shows the same endpoint appearing in the "admin logins from unusual locations" report every week for 3 months. What does this pattern suggest and what should happen?',
    options: [
      'The compliance report query is working correctly — recurring appearances indicate comprehensive monitoring coverage',
      'The endpoint owner is a frequent business traveller — no action needed, recurring alerts for travel are expected and compliant',
      'The LogScale scheduled search has a bug — it is repeatedly reporting historical data rather than new events each week',
      'A recurring detection pattern for the same endpoint over 3 months indicates either a persistent threat on that endpoint, a legitimate activity pattern that needs a suppression rule, or a detection logic gap — it warrants investigation and either remediation or intentional tuning',
    ],
    correctIndex: 3,
    explanation: 'Recurring detections for the same endpoint over 3 months warrant investigation, not acceptance. Three outcomes are possible: (1) genuine ongoing threat — investigate and remediate; (2) known legitimate activity — document it and create a tuning exclusion with a documented rationale; (3) detection logic gap producing false positives — refine the CQL query. Ignoring recurring patterns is a common detection quality gap. Compliance reports should drive action, not just produce data.',
    docTitle: 'Detection Tuning and Governance',
    docUrl: 'https://falcon.crowdstrike.com/documentation/page/falcon-siem-reporting',
  },
  {
    id: 'platform-gov-q5',
    text: 'Which delivery format is most appropriate for a weekly detection summary report sent to the SOC lead who needs to analyse trends across detection types and affected hosts?',
    options: [
      'CSV email attachment — SOC leads can open the CSV in Excel or Sheets to filter, sort, pivot, and analyse data across detection types and hosts',
      'Inline text email — a summary paragraph in the email body is the most consumable format for SOC leads',
      'LogScale dashboard link — the SOC lead should use the live dashboard for all reporting needs',
      'PDF report — a rendered PDF locks in the snapshot and is the best format for archiving and forwarding',
    ],
    correctIndex: 0,
    explanation: 'CSV is the correct format for a SOC lead who needs to analyse trends: they can open it in Excel or Google Sheets, sort by detection type, filter by host, create pivot tables, and chart trends — none of which are possible with inline text. Dashboard links require real-time LogScale access and do not provide the historical snapshot the weekly report represents. PDF is good for archiving but poor for interactive analysis.',
    docTitle: 'LogScale Report Delivery Formats',
    docUrl: 'https://library.humio.com/falcon-logscale/docs-alerts-scheduled-searches.html',
  },
]

export const reportingModule: ContentModule = {
  id: 'platform-gov-reporting',
  title: 'Scheduled Reports & Executive Dashboards',
  trackId: 'platform-governance',
  domainId: 'platform',
  order: 1,
  lastReviewed: '2026-08-17',
  concepts: reportingConcepts,
  quiz: reportingQuestions,
}

// ── Module 5.3.2: Role-Based Access Control for SIEM/SOAR ───────────────────

const rbacConcepts: ConceptSection[] = [
  {
    title: 'Falcon Platform RBAC: Roles and Repository Access',
    body: 'The Falcon platform uses role-based access control (RBAC) to govern what users can see and do across platform modules. For SIEM/SOAR engineers, RBAC applies at two levels:\n\n**Level 1 — Falcon Platform Roles:**\n- **Falcon Administrator:** Full platform access including user management, policy configuration, and billing\n- **Security Analyst:** Access to detections, incidents, and the Falcon console; cannot modify policies or manage users\n- **Security Responder:** All Security Analyst permissions plus the ability to trigger response actions (containment, process kill)\n- **Security Operations Manager:** All Responder permissions plus user and role management (but not billing/configuration)\n\n**Level 2 — LogScale Repository Access:**\nLogScale uses repository-level access control separately from Falcon platform roles:\n- Users or groups are granted access to specific repositories (read, write, or admin)\n- A security analyst might have access to the `falcon-alerts` and `falcon-endpoint` repositories but NOT the `hr-audit` repository that contains employee data\n- Repository access is managed in LogScale\'s user/group settings\n\n**Principle of least privilege in practice:**\n- SOC analysts: Security Analyst role + read access to SIEM repositories they need\n- Automation service accounts: Only the API scopes required; no Falcon console role\n- SIEM administrators: LogScale repository admin; Falcon Security Operations Manager\n- Executives viewing dashboards: Dashboard link access only (no platform role required)',
  },
  {
    title: 'Service Accounts and API Client Governance',
    body: 'Automation and integrations in the Falcon platform use API clients (not user accounts). Governing these service accounts is a critical SIEM/SOAR operations discipline.\n\n**API client inventory best practices:**\n- Maintain a register of all API clients: name, purpose, owner, scopes granted, creation date, last secret rotation date\n- Use descriptive names: "SOAR-triage-automation" not "api-client-3"\n- One API client per integration or system — never share credentials between different tools\n\n**Lifecycle management:**\n- Rotate client secrets on a schedule (quarterly is common for production integrations)\n- Remove unused API clients immediately when an integration is decommissioned\n- Review API client audit logs quarterly to verify usage patterns match the stated purpose\n\n**Separation of concerns:**\n- Read-only integrations (SIEM data export, reporting) get `:Read` scopes only\n- Response integrations (containment, IOC creation) get `:Write` scopes on specific resources only\n- Never create a multi-purpose API client with broad scopes to "avoid future scope additions"\n\n**Audit log review:**\nEvery Falcon API call is logged under the API client name in the Falcon audit log. Quarterly reviews should verify: (1) the call pattern matches the integration\'s documented purpose, (2) no unexpected endpoints are being called, (3) the call volume is consistent with the integration\'s expected activity.',
  },
]

const rbacQuestions: QuizQuestion[] = [
  {
    id: 'platform-gov-q6',
    text: 'A new SOC analyst needs to investigate Falcon detections and read endpoint telemetry in LogScale but should not be able to trigger containment or modify platform policies. Which role and access combination is correct?',
    options: [
      'Falcon Administrator role + LogScale admin access to all repositories — maximum access ensures no capability gaps',
      'Security Analyst Falcon role + read access to the relevant LogScale repositories — analysts can view detections and query SIEM data without response or configuration capabilities',
      'Security Responder Falcon role + read access to LogScale repositories — Responder role is required to query LogScale data',
      'No Falcon role + LogScale admin access — LogScale query access is independent of Falcon platform roles',
    ],
    correctIndex: 1,
    explanation: 'Security Analyst Falcon role grants detection and incident visibility in the Falcon console without response or policy modification capabilities. LogScale repository read access grants query capability for the specific repositories the analyst needs. This combination satisfies the requirement: investigation capability without containment or configuration access. Security Responder adds unnecessary response capabilities; Falcon Administrator and LogScale admin grant excessive privileges.',
    docTitle: 'Falcon RBAC Roles',
    docUrl: 'https://falcon.crowdstrike.com/documentation/page/falcon-rbac',
  },
  {
    id: 'platform-gov-q7',
    text: 'Your organisation has three separate data sources in LogScale: `falcon-endpoint` (Falcon sensor telemetry), `falcon-alerts` (Falcon detections), and `hr-audit` (HR system audit logs). The SOC team should access the first two but not the third. How should this be enforced?',
    options: [
      'Create a single "SOC" role in the Falcon platform that restricts the console view to security-relevant data',
      'Place all three repositories in separate LogScale organisations — cross-organisation repository access is not possible',
      'Grant the SOC team group access to the `falcon-endpoint` and `falcon-alerts` LogScale repositories with read permission; do not grant any access to the `hr-audit` repository — LogScale\'s repository-level access control enforces this boundary',
      'Encrypt the `hr-audit` repository with a separate encryption key that only HR admins possess — LogScale access control alone is insufficient to protect sensitive HR data',
    ],
    correctIndex: 2,
    explanation: 'LogScale uses repository-level access control: users and groups can be granted or denied access to specific repositories independently. Granting the SOC team group access to `falcon-endpoint` and `falcon-alerts` while not granting access to `hr-audit` enforces the data boundary. SOC analysts will see only their permitted repositories in the LogScale interface. Falcon platform roles do not control LogScale repository access — they are separate control planes.',
    docTitle: 'LogScale Repository Access Control',
    docUrl: 'https://library.humio.com/falcon-logscale/docs-user-management.html',
  },
  {
    id: 'platform-gov-q8',
    text: 'An analyst leaves the SOC team and their position is eliminated. What access revocation steps are required?',
    options: [
      'Disable their Falcon console account only — LogScale access is tied to the Falcon account and is automatically revoked',
      'Disable their LogScale access only — Falcon console access requires a separate user account system',
      'Notify the SIEM vendor to audit for any data the analyst may have exported before leaving — access revocation alone is insufficient',
      'Disable or delete their Falcon platform account AND revoke their LogScale repository access — these are separate control planes; revoking Falcon access does not automatically remove LogScale access',
    ],
    correctIndex: 3,
    explanation: 'Falcon platform access and LogScale repository access are managed independently. Disabling the Falcon account removes console access but does NOT automatically revoke LogScale access if it was separately granted. Offboarding requires explicit action in both systems: (1) disable/delete the Falcon user account, and (2) remove the user from all LogScale repository and group memberships. Checklists for access revocation must cover both planes.',
    docTitle: 'Falcon and LogScale Offboarding',
    docUrl: 'https://falcon.crowdstrike.com/documentation/page/falcon-rbac',
  },
  {
    id: 'platform-gov-q9',
    text: 'During a quarterly API client audit, you find an API client named "old-siem-integration" that has not made any API calls in 6 months. The original SIEM it served was decommissioned. What should you do?',
    options: [
      'Delete the API client immediately — unused API clients with valid credentials are an attack surface even if they appear inactive; the credentials may have been exfiltrated and could be used to access the Falcon platform at any time',
      'Keep the API client in place but rotate its secret — rotating the secret ensures existing credentials cannot be used',
      'Archive the API client by disabling it in the console — disabled clients retain their credentials for future reactivation',
      'Keep the API client for 12 more months before deletion — CrowdStrike recommends a 12-month grace period after integration decommissioning',
    ],
    correctIndex: 0,
    explanation: 'Unused API clients with valid credentials are an active attack surface regardless of their call history. If the credentials were exfiltrated at any point, they remain valid until the client is deleted. Best practice: delete API clients immediately when the integration they serve is decommissioned. There is no value in keeping credentials that serve no current purpose — the risk is asymmetric. Rotating the secret while keeping the client leaves an unnecessary attack surface if the new secret is also exfiltrated.',
    docTitle: 'Falcon API Client Lifecycle Management',
    docUrl: 'https://falcon.crowdstrike.com/documentation/page/falcon-api-oauth2',
  },
  {
    id: 'platform-gov-q10',
    text: 'Which RBAC configuration violates the principle of least privilege for a read-only automated reporting integration?',
    options: [
      'Detections:Read + Incidents:Read + Hosts:Read scopes — covers exactly the resources the integration queries',
      'Security Analyst role assigned to the API client alongside the API scopes — API clients can be assigned platform roles for additional access',
      'Detections:Read + Incidents:Read + Hosts:Read + Custom IOA Rules:Write + Workflows:Write — write scopes on detection rules and SOAR workflows are not needed for a read-only reporting integration; they create unnecessary attack surface',
      'Read-only access to the LogScale repositories the integration queries — scoped to the minimum required data sources',
    ],
    correctIndex: 2,
    explanation: 'Granting `Custom IOA Rules:Write` and `Workflows:Write` scopes to a read-only reporting integration is a clear least-privilege violation. If these credentials are compromised, an attacker could modify custom detection rules (effectively blinding the SIEM) or modify SOAR playbooks to disable automated responses. Write scopes must be granted only when explicitly required — read-only integrations must have read-only scopes.',
    docTitle: 'Falcon API Scope Governance',
    docUrl: 'https://falcon.crowdstrike.com/documentation/page/falcon-api-oauth2',
  },
]

export const rbacModule: ContentModule = {
  id: 'platform-gov-rbac',
  title: 'Role-Based Access Control for SIEM/SOAR',
  trackId: 'platform-governance',
  domainId: 'platform',
  order: 2,
  lastReviewed: '2026-08-17',
  concepts: rbacConcepts,
  quiz: rbacQuestions,
}

// ── Track 5.3 Scenario ─────────────────────────────────────────────────────

const governanceScenario: Scenario = {
  id: 'platform-governance-scenario',
  title: 'Building a Governance Framework for a Growing SOC',
  context: 'Your organisation\'s SOC has grown from 3 to 12 analysts over 6 months. You have been asked to formalise the SIEM/SOAR governance framework: RBAC design, reporting cadence, and API client management. Executive stakeholders expect monthly security metrics reports.',
  isCumulative: false,
  steps: [
    {
      id: 'pf-gov-s1',
      narrative: 'You are designing role assignments for the 12-analyst team. Three analysts are Tier 1 (alert triage only), six are Tier 2 (investigation and response), and three are SIEM engineers (who build detection rules and manage integrations). What is the correct Falcon platform role for Tier 1 analysts?',
      choices: [
        { text: 'Security Analyst — read access to detections and incidents without response or policy modification capabilities; appropriate for alert triage without over-provisioning' },
        { text: 'Security Responder — Tier 1 analysts should be able to contain hosts they identify as compromised during triage' },
        { text: 'Security Operations Manager — provides the broadest access needed for any analyst function' },
        { text: 'Falcon Administrator — maximum access eliminates capability questions during triage escalations' },
      ],
      correctChoiceIndex: 0,
      wrongConsequence: 'Security Responder adds containment capabilities that Tier 1 analysts should not have autonomously — containment should require Tier 2 or manager approval. Operations Manager and Administrator roles vastly over-provision for alert triage. Escalation questions are better handled via process (escalate to Tier 2) than by giving Tier 1 analysts admin access.',
      reasoning: 'Security Analyst is the correct role for Tier 1: it provides read access to detections, incidents, and host information needed for triage, without the containment and policy capabilities that should be gated to senior analysts. Least privilege for triage means read-only with structured escalation paths for response actions.',
      docTitle: 'Falcon RBAC Analyst Roles',
      docUrl: 'https://falcon.crowdstrike.com/documentation/page/falcon-rbac',
    },
    {
      id: 'pf-gov-s2',
      narrative: 'The three SIEM engineers need to build detection rules, manage LogScale repository configurations, and maintain API clients. They should NOT have billing access or the ability to add/remove user accounts. Which role is appropriate?',
      choices: [
        { text: 'Security Analyst — add LogScale admin access on top of the base role to enable rule building',  },
        { text: 'Security Operations Manager — includes user and role management but not billing; combined with LogScale repository admin access, this covers SIEM engineer requirements without granting billing privileges' },
        { text: 'Falcon Administrator — SIEM engineers need full admin access to manage all platform components effectively' },
        { text: 'Security Responder — provides all permissions needed for detection rule management' },
      ],
      correctChoiceIndex: 1,
      wrongConsequence: 'Security Analyst lacks the management capabilities SIEM engineers need for rule building and API client management. Falcon Administrator grants billing access which is explicitly out of scope. Security Responder provides response capabilities but not SIEM management permissions — it does not grant the rule building or integration management access SIEM engineers require.',
      reasoning: 'Security Operations Manager grants user and role management capabilities (but not billing) and provides sufficient platform access for API client management and configuration. Combined with LogScale repository admin access (granted separately in LogScale), this covers SIEM engineer requirements: detection rule management, repository administration, and API client governance, while explicitly excluding billing access.',
      docTitle: 'Falcon Security Operations Manager Role',
      docUrl: 'https://falcon.crowdstrike.com/documentation/page/falcon-rbac',
    },
    {
      id: 'pf-gov-s3',
      narrative: 'The CISO wants a live dashboard showing alert volume, MTTD, and endpoint coverage. They should be able to check it from their browser without a LogScale account. Simultaneously, the compliance team needs a monthly CSV report of all privileged account logins for the past 30 days. Which two configurations cover both requirements?',
      choices: [
        { text: 'Create a public read-only LogScale dashboard link for the CISO; create a monthly scheduled search that emails a CSV of privileged account logins to the compliance team' },
        { text: 'Create individual LogScale accounts for the CISO and compliance team members with read access to the relevant repositories; they can run their own queries as needed' },
        { text: 'Export the dashboard as a PDF weekly and email it to the CISO; create a Falcon API script the compliance team runs manually each month' },
        { text: 'Configure a Slack channel with the live dashboard embedded; create a monthly calendar reminder for the SIEM engineer to manually export and email the compliance report' },
      ],
      correctChoiceIndex: 0,
      wrongConsequence: 'Creating LogScale accounts for the CISO and compliance team provides more access than required — the CISO needs a live read-only view, not query capability; the compliance team needs a monthly export, not query access. PDF weekly exports lose real-time currency for the CISO and miss the monthly schedule for compliance. Manual processes create human-dependency risk.',
      reasoning: 'Read-only dashboard link = no authentication required, real-time data, appropriate for CISO visibility needs. Scheduled CSV search = automatic monthly delivery to compliance team without requiring their LogScale access. These are the minimum-privilege, automated approaches for each use case.',
      docTitle: 'LogScale Dashboard and Scheduled Search',
      docUrl: 'https://library.humio.com/falcon-logscale/docs-dashboards.html',
    },
    {
      id: 'pf-gov-s4',
      narrative: 'During your quarterly API client audit, you discover 7 active API clients. Only 4 have documentation (owner, purpose, scopes). The other 3 are named "api-client-1", "api-client-2", and "test-integration". None of the 3 have recent API call activity in the audit log. What is the correct governance response?',
      choices: [
        { text: 'Keep all 7 clients — removing unknown clients may break undiscovered integrations' },
        { text: 'Rotate the secrets on the 3 unknown clients as a precaution — this limits damage if credentials were exfiltrated without impacting any integration that may silently depend on them' },
        { text: 'Mark the 3 unknown clients as requiring documentation by the next quarterly review — immediate deletion may cause unintended service disruption' },
        { text: 'Immediately delete the 3 undocumented inactive clients — undocumented API clients with no current usage are an unmanaged attack surface; document and confirm all remaining active clients as part of the governance action' },
      ],
      correctChoiceIndex: 3,
      wrongConsequence: 'Keeping undocumented inactive clients violates API governance — they are unmanaged attack surfaces. Rotating secrets on unknown clients reduces risk but does not eliminate the attack surface (new secrets can also be exfiltrated). Deferring deletion to the next quarterly review leaves the risk in place for another 3 months. An integration that silently depends on an undocumented unknown client is itself an undocumented integration that should be discovered and documented before the audit.',
      reasoning: 'Delete undocumented inactive API clients immediately. If any integration breaks after deletion, that integration is itself undocumented — which is a governance failure that needs immediate resolution. The correct sequence: (1) delete the 3 unknown clients, (2) monitor for integration failures, (3) if failures occur, document the broken integration, create a properly named and scoped API client, and update the client registry. Clean governance requires knowing every API client and its purpose.',
      docTitle: 'Falcon API Client Governance',
      docUrl: 'https://falcon.crowdstrike.com/documentation/page/falcon-api-oauth2',
    },
    {
      id: 'pf-gov-s5',
      narrative: 'A Tier 1 analyst reports that they cannot access the `falcon-endpoint` LogScale repository to query FDR telemetry during an alert triage. They have a Security Analyst Falcon role but were not explicitly granted LogScale repository access. What is the correct fix?',
      choices: [
        { text: 'Grant the analyst a Security Responder Falcon role — this role includes LogScale repository access as part of its elevated permissions' },
        { text: 'Upgrade the analyst to Falcon Administrator temporarily while they complete the investigation, then downgrade after' },
        { text: 'Grant the analyst read access to the `falcon-endpoint` LogScale repository explicitly in LogScale\'s user/group settings — Falcon platform roles and LogScale repository access are managed separately and the Falcon role does not automatically grant LogScale access' },
        { text: 'Recreate the analyst\'s Falcon account — repository access permissions are sometimes lost during account updates and recreation restores them' },
      ],
      correctChoiceIndex: 2,
      wrongConsequence: 'Security Responder does not include automatic LogScale access — they are separate control planes. Temporary Falcon Administrator access is wildly disproportionate for a LogScale access issue. Account recreation does not fix missing repository grants that were never made.',
      reasoning: 'Falcon platform roles and LogScale repository access are independent. The Security Analyst Falcon role grants Falcon console access — it does not automatically grant access to LogScale repositories. Repository access must be explicitly granted in LogScale\'s user management settings. Grant the analyst read access to `falcon-endpoint` in LogScale, leaving their Security Analyst Falcon role unchanged.',
      docTitle: 'LogScale Repository Access vs. Falcon Roles',
      docUrl: 'https://library.humio.com/falcon-logscale/docs-user-management.html',
    },
  ],
}

// ── Track 5.3 Export ────────────────────────────────────────────────────────

export const governanceTrack: ContentTrack = {
  id: 'platform-governance',
  title: 'Reporting & Governance',
  domainId: 'platform',
  order: 3,
  modules: [reportingModule, rbacModule],
  scenario: governanceScenario,
}
```

- [ ] **Step 2: Update `src/content/domains/platform.ts`**

```typescript
import { governanceTrack } from './platform-track-5-3'
// tracks: [fdrTrack, apiTrack, governanceTrack]
```

- [ ] **Step 3: TypeScript check + tests**

```
npx tsc -b
npm test
```

- [ ] **Step 4: Commit**

```
git add src/content/domains/platform-track-5-3.ts src/content/domains/platform.ts
git commit -m "feat: add Platform Essentials Track 5.3 Reporting & Governance modules and scenario"
```

---

### Task 4: Track 5.4 — Threat Intelligence Integration

**Files:**
- Create: `src/content/domains/platform-track-5-4.ts`
- Modify: `src/content/domains/platform.ts`

- [ ] **Step 1: Create `src/content/domains/platform-track-5-4.ts`**

Apply distribution: q1=0,q2=1,q3=2,q4=3,q5=0,q6=1,q7=2,q8=3,q9=0,q10=1; s1=0,s2=1,s3=2,s4=3,s5=0.

```typescript
import type {
  ContentModule,
  ContentTrack,
  QuizQuestion,
  ConceptSection,
  Scenario,
} from '../types'

// ═══════════════════════════════════════════════════════════════════════════════
// Track 5.4 — Threat Intelligence Integration
// ═══════════════════════════════════════════════════════════════════════════════

// ── Module 5.4.1: Falcon Intelligence Feeds in LogScale ─────────────────────

const tiFeedsConcepts: ConceptSection[] = [
  {
    title: 'Falcon Intelligence: What It Provides and How It Feeds LogScale',
    body: 'Falcon Intelligence is CrowdStrike\'s threat intelligence platform, providing:\n\n**Indicator feeds (IOCs):**\n- **Malware hashes:** SHA256/MD5 hashes of known malicious files, updated continuously\n- **Malicious domains:** Domains associated with C2 infrastructure, phishing, and malware distribution\n- **Malicious IPs:** IP addresses hosting C2 servers, scanning platforms, and attacker infrastructure\n- **Malicious URLs:** Specific URLs used in phishing campaigns and exploit kit landing pages\n\n**Contextual intelligence:**\n- **Threat actor profiles:** TTPs, targeted industries, geographic focus, and weaponry for known adversary groups\n- **Malware families:** Technical descriptions of malware families, behavioural patterns, and detection guidance\n- **Vulnerability intelligence:** CVE context including exploitability, active exploitation status, and affected software\n\n**Integration with LogScale:**\nFalcon Intelligence IOCs can be ingested into LogScale as lookup tables. A lookup table is a key-value reference dataset that CQL queries can join against using the `lookup()` function. This enables real-time IOC matching against ingested telemetry:\n\n```cql\n// Match DNS requests against known malicious domains\n#type=DnsRequest\n| lookup(field=DomainName, file="malicious-domains.csv", include=[threat_category, confidence])\n| confidence > 70\n```\n\nLookup tables can be updated automatically when new IOC feeds are received, keeping detection rules current without modifying the CQL queries themselves.',
    codeExample: '// LogScale lookup() for IOC matching — match observed IPs against threat intel feed\n#type=NetworkConnectIP4\n| start=now()-1h\n| lookup(field=RemoteAddressIP4, file="malicious-ips.csv", include=[threat_actor, confidence, category])\n| confidence > 50\n| groupBy([RemoteAddressIP4, threat_actor, category], function=count())\n| sort(count, order=desc)',
    codeLanguage: 'cql',
  },
  {
    title: 'Indicator Confidence Levels and Feed Management',
    body: 'Not all threat intelligence indicators carry equal confidence. IOC feeds typically assign confidence levels (0–100) that reflect the reliability of the attribution and the recency of observation:\n\n**Confidence tiers:**\n- **High (80–100):** Recently observed, verified attribution, multiple corroborating sources\n- **Medium (50–79):** Observed but less recently, single source, or partial attribution\n- **Low (1–49):** Historical, unverified, or low-confidence attribution\n\n**Operational use of confidence levels:**\n- **High-confidence IOCs:** Generate alerts immediately on match; block at network/endpoint controls\n- **Medium-confidence IOCs:** Generate alerts for analyst review; do not auto-block without investigation\n- **Low-confidence IOCs:** Use for hunting context only; do not generate operational alerts\n\n**Feed staleness problem:** IOC feeds degrade over time. An IP or domain that was a C2 server 18 months ago may now be used by a legitimate business (infrastructure is recycled). IOCs older than 90–180 days should be reviewed for continued relevance before inclusion in active alert rules.\n\n**Feed update management:**\n- Schedule automatic download and import of updated Falcon Intelligence IOC feeds (via API or FDR)\n- Set expiry timestamps on IOCs in lookup tables to automatically age out stale indicators\n- Track hit rates on IOCs — an IOC that never matches in 6 months may not be relevant to your environment and can be removed to reduce false-positive risk',
  },
]

const tiFeedsQuestions: QuizQuestion[] = [
  {
    id: 'platform-ti-q1',
    text: 'How does Falcon Intelligence IOC data integrate with LogScale CQL queries for real-time detection?',
    options: [
      'IOC data is imported into LogScale as lookup tables; the CQL `lookup()` function joins ingested events against the lookup table at query time — enabling real-time IOC matching without modifying detection queries when the threat intelligence is updated',
      'IOC data is embedded directly in CQL detection queries as hardcoded filter values; when new IOCs are added, each detection query must be manually updated',
      'Falcon Intelligence connects directly to LogScale and adds IOC tags to events during ingest, before any CQL query runs',
      'IOC matching in LogScale requires the Falcon Threat Graph module — standard LogScale saved searches cannot perform IOC lookups',
    ],
    correctIndex: 0,
    explanation: 'Falcon Intelligence IOCs are stored in LogScale lookup tables (CSV files referenced by name). CQL queries use the `lookup()` function to join event data against the lookup table at query time. When the threat intelligence feed is updated (new IOCs added, confidence scores changed), only the lookup table changes — the CQL queries remain unchanged. This separation allows detection logic to stay current with evolving threat intelligence without manual query updates.',
    docTitle: 'LogScale Lookup Tables and Threat Intelligence',
    docUrl: 'https://library.humio.com/falcon-logscale/docs-lookup-files.html',
  },
  {
    id: 'platform-ti-q2',
    text: 'A LogScale IOC matching rule fires on a DNS request to a domain with a Falcon Intelligence confidence score of 35 (Low). What action is most appropriate?',
    options: [
      'Immediately block the domain at the DNS resolver and notify the security team — any IOC match warrants an immediate response',
      'Use the match as hunting context only — review the endpoint\'s recent activity to determine if further investigation is warranted, but do not generate an operational alert or block based on a low-confidence IOC alone',
      'Escalate directly to the CISO — low-confidence IOC matches are indicators of advanced persistent threats that evade high-confidence detection',
      'Delete the low-confidence IOC from the lookup table — IOCs below 50 confidence should not be in production detection tables',
    ],
    correctIndex: 1,
    explanation: 'Low-confidence IOCs (1–49) should be used for hunting context, not operational alerting or automated blocking. A confidence score of 35 means the attribution is uncertain — the domain may be legitimately used by non-malicious infrastructure. Use the match to initiate a focused investigation of the endpoint\'s recent behaviour, but do not auto-block or generate a high-priority alert. Operational alerts and blocks should be reserved for medium and high confidence IOC matches.',
    docTitle: 'Threat Intelligence Confidence Levels',
    docUrl: 'https://falcon.crowdstrike.com/documentation/page/falcon-intelligence-ioc',
  },
  {
    id: 'platform-ti-q3',
    text: 'An IOC for a specific IP address was added to your LogScale lookup table 18 months ago. It has not matched any events in the last 12 months. What should happen to this IOC?',
    options: [
      'Retain it indefinitely — a low match rate indicates the IOC is suppressing attacks proactively',
      'Increase its confidence score — the lack of matches suggests the IP is actively avoiding your environment, which implies high threat actor sophistication',
      'Review it for current relevance: check if the IP is still associated with malicious infrastructure in current Falcon Intelligence data; if the association is no longer current, remove or expire it to prevent false positives when IP infrastructure is recycled to legitimate uses',
      'Move it to a separate "historical" lookup table for archiving — retain it but remove it from active detection rules',
    ],
    correctIndex: 2,
    explanation: 'IOC staleness is a real operational problem: IP and domain infrastructure is recycled constantly. An IP used for C2 18 months ago may now host a legitimate CDN or business service. An 18-month-old IOC with no matches in 12 months warrants review: check current Falcon Intelligence data for the IP\'s current classification. If it is no longer confirmed malicious, remove or expire it. Retaining stale IOCs creates false positive risk when infrastructure is recycled.',
    docTitle: 'IOC Lifecycle Management',
    docUrl: 'https://falcon.crowdstrike.com/documentation/page/falcon-intelligence-ioc',
  },
  {
    id: 'platform-ti-q4',
    text: 'A threat actor profile in Falcon Intelligence shows they typically target the financial services sector using spear-phishing emails followed by PowerShell-based execution. How should this intelligence inform your LogScale detection rules?',
    options: [
      'It does not — threat actor profiles are strategic intelligence for the CISO; detection engineers should only use IOC feeds for operational rules',
      'Create a dedicated LogScale repository for financial-sector threat data — threat actor targeting implies different data should be stored separately',
      'Immediately block all PowerShell execution on endpoints — if a known threat actor uses PowerShell, it should be disabled organisation-wide',
      'Use it to validate that existing detection rules cover the specific attack patterns the actor uses — check that saved searches detect PowerShell execution patterns and email-delivered payload types; prioritise rule coverage for TTPs the actor is known to use',
    ],
    correctIndex: 3,
    explanation: 'Threat actor profiles directly inform detection rule coverage validation. If Falcon Intelligence shows an actor uses PowerShell post-exploitation following spear-phishing, verify LogScale detection rules cover PowerShell process spawned by common email client processes (Outlook → PowerShell chain), encoded PowerShell commands, and PowerShell making network connections. TTP-based detection coverage is the operational value of threat actor intelligence.',
    docTitle: 'Threat Actor Intelligence in Detection Engineering',
    docUrl: 'https://falcon.crowdstrike.com/documentation/page/falcon-intelligence-actors',
  },
  {
    id: 'platform-ti-q5',
    text: 'Which Falcon Intelligence data type is most useful for identifying whether a newly discovered file hash on an endpoint is associated with a known threat actor or malware family?',
    options: [
      'Malware hash indicators — SHA256 or MD5 hashes of known malicious files, cross-referenced against malware family and threat actor attribution data in the Falcon Intelligence feed',
      'Domain indicators — querying the file hash against domain-related threat intelligence to identify any C2 domains the malware family uses',
      'IP address indicators — looking up whether the file\'s author IP address is on a malicious IP list',
      'Vulnerability intelligence — checking whether the file exploits a known CVE associated with the suspected threat actor',
    ],
    correctIndex: 0,
    explanation: 'Malware hash indicators (SHA256/MD5) are the most direct intelligence source for a newly discovered file. A hash match in the Falcon Intelligence feed immediately provides: malware family classification, threat actor attribution, behavioural characteristics, and historical campaign context. Domain indicators relate to C2 infrastructure, not file identification. IP indicators and vulnerability intelligence do not identify files — they contextualise network and exploitation activity.',
    docTitle: 'Falcon Intelligence Malware Hash Indicators',
    docUrl: 'https://falcon.crowdstrike.com/documentation/page/falcon-intelligence-ioc',
  },
]

export const tiFeedsModule: ContentModule = {
  id: 'platform-ti-feeds',
  title: 'Falcon Intelligence Feeds in LogScale',
  trackId: 'platform-threat-intel',
  domainId: 'platform',
  order: 1,
  lastReviewed: '2026-08-17',
  concepts: tiFeedsConcepts,
  quiz: tiFeedsQuestions,
}

// ── Module 5.4.2: IOC Management & Enrichment in Playbooks ──────────────────

const iocPlaybookConcepts: ConceptSection[] = [
  {
    title: 'Falcon Fusion SOAR: IOC Enrichment Actions',
    body: 'Falcon Fusion SOAR playbooks can automatically enrich detection findings with Falcon Intelligence data at detection time, providing analysts with threat context before manual investigation begins.\n\n**IOC enrichment in Fusion workflows:**\n- **IP reputation lookup:** Fusion action that queries Falcon Intelligence for the reputation and threat classification of a source or destination IP from a detection\n- **Domain reputation lookup:** Check observed DNS destinations against Falcon Intelligence domain threat feeds\n- **File hash lookup:** Determine if a file SHA256 observed in a detection is a known malicious hash and retrieve the associated malware family and threat actor attribution\n\n**Typical enrichment playbook pattern:**\n1. Trigger: New Falcon detection with severity ≥ High\n2. Action: Extract observables (IPs, domains, hashes) from the detection telemetry\n3. Action: Look up each observable against Falcon Intelligence via the Intel API\n4. Condition: If any observable matches with confidence ≥ 70, escalate severity\n5. Action: Add enrichment context to the detection comment/ticket\n6. Action: Notify analyst with enriched context\n\n**Value of automated enrichment:**\nAn analyst receiving a detection with pre-populated threat intelligence context (this IP is a Cobalt Strike C2 used by [actor], confidence 95) can make a triage decision in 30 seconds rather than spending 5 minutes querying intelligence sources manually.',
  },
  {
    title: 'Custom IOC Management: Extending Falcon Detection',
    body: 'Beyond consuming Falcon Intelligence feeds, SIEM/SOAR engineers can create custom IOCs in the Falcon platform to extend detection coverage for organisation-specific threats:\n\n**Custom IOC types:**\n- **File hashes (SHA256, MD5):** Block execution or generate a detection when a specific file is observed\n- **IP addresses:** Generate alerts or block connections to/from specific IP addresses\n- **Domains:** Monitor or block DNS requests to specific domains\n- **Mutex/Registry patterns:** Advanced custom detection for specific malware behavioural indicators\n\n**IOC action types:**\n- **Detect:** Generate a Falcon detection when the IOC is observed — analyst review required before response\n- **Block:** Prevent the activity (block file execution, block network connection) — appropriate only for high-confidence IOCs from confirmed investigations\n\n**SOAR-driven IOC creation:**\nAfter an analyst confirms a malicious finding in an investigation, a Fusion playbook can automatically promote the observable to a custom IOC:\n1. Analyst confirms malicious file hash in investigation\n2. Fusion playbook creates a custom IOC for the hash with action = Detect\n3. The IOC is automatically applied to all endpoints with Falcon sensors\n4. Future executions of the same hash generate a Falcon detection immediately\n\n**IOC governance:**\n- Document the source investigation ID for every custom IOC created (audit trail)\n- Set expiry dates on IOCs — file hashes may be relevant indefinitely, but IP/domain IOCs should be reviewed and expired regularly\n- Review custom IOC hit rates quarterly — a hash IOC with zero hits in 12 months on your endpoint fleet may not be relevant to your environment',
  },
]

const iocPlaybookQuestions: QuizQuestion[] = [
  {
    id: 'platform-ti-q6',
    text: 'A Fusion SOAR playbook is designed to enrich detections by looking up observed IPs against Falcon Intelligence. Which sequence best describes this enrichment workflow?',
    options: [
      'The playbook manually adds IP reputation data to each detection by querying a public WHOIS service; Falcon Intelligence is not accessible from Fusion',
      'The playbook extracts the source or destination IP from the detection, calls the Falcon Intelligence API (Intel:Read scope) to retrieve reputation data, and adds the enrichment result (threat classification, confidence, actor attribution) to the detection as a comment or ticket field for analyst review',
      'The playbook blocks the IP automatically based on its presence in any Falcon Intelligence feed regardless of confidence score',
      'The playbook queries Falcon Intelligence but only after the analyst manually triggers the enrichment — automated IOC enrichment is not supported in Fusion SOAR',
    ],
    correctIndex: 1,
    explanation: 'Fusion playbooks can call the Falcon Intelligence API (with Intel:Read scope) automatically on detection trigger. The workflow: extract observables (IPs) from the detection → query Intel API for reputation/attribution → add enrichment context to the detection record. The Intel API returns threat classification, confidence score, and actor attribution — all of which are added to the ticket before analyst review, compressing manual enrichment time from minutes to seconds.',
    docTitle: 'Fusion SOAR Intel Enrichment',
    docUrl: 'https://falcon.crowdstrike.com/documentation/page/falcon-fusion-soar',
  },
  {
    id: 'platform-ti-q7',
    text: 'After confirming a malicious file hash during an investigation, which IOC action type should be used when the analyst wants to be notified if the same hash appears on any other endpoint, without automatically blocking execution?',
    options: [
      'Block — prevents execution and notifies the analyst simultaneously',
      'Monitor — tracks observed activity without generating a Falcon detection',
      'Detect — generates a Falcon detection (alert) when the hash is observed on any endpoint, enabling analyst review before any response action is taken',
      'Quarantine — automatically isolates any file matching the hash to a sandbox environment for further analysis',
    ],
    correctIndex: 2,
    explanation: '"Detect" generates a Falcon detection when the IOC is observed without automatically blocking it — the analyst receives an alert and can investigate before deciding on response. "Block" would prevent execution (appropriate only when confidence is highest and blocking is operationally safe). "Monitor" does not generate detections. "Quarantine" is not a standard Falcon custom IOC action type.',
    docTitle: 'Falcon Custom IOC Action Types',
    docUrl: 'https://falcon.crowdstrike.com/documentation/page/falcon-intelligence-ioc',
  },
  {
    id: 'platform-ti-q8',
    text: 'A SOAR playbook automatically creates custom IOCs from every investigation finding. After 12 months, the custom IOC list has grown to 8,000 entries. A third of them have never generated a hit. What is the correct governance approach?',
    options: [
      'Keep all 8,000 IOCs — the absence of hits proves they are effectively blocking threats proactively',
      'Delete all IOCs with zero hits — IOCs that have never matched have no demonstrated value',
      'Disable the SOAR playbook that creates IOCs automatically — automated IOC creation always leads to list bloat',
      'Review zero-hit IOCs quarterly: assess whether they are relevant to your environment (file hashes for malware families not targeting your industry, expired infrastructure), set expiry dates for IP/domain IOCs, and remove those with no current relevance — a bloated IOC list creates false-positive risk and degrades detection signal quality',
    ],
    correctIndex: 3,
    explanation: 'IOC list hygiene is an ongoing governance responsibility. Zero-hit IOCs may be irrelevant (malware targeting a different industry) or stale (infrastructure recycled to legitimate use). However, not all zero-hit IOCs should be deleted — a file hash for a known malware family in your threat landscape has protective value even without hits. Quarterly review with contextual assessment (current relevance, expiry for infrastructure IOCs) is the correct approach. Disabling automated IOC creation removes a valuable SOAR capability.',
    docTitle: 'IOC Governance and List Hygiene',
    docUrl: 'https://falcon.crowdstrike.com/documentation/page/falcon-intelligence-ioc',
  },
  {
    id: 'platform-ti-q9',
    text: 'Which Falcon API scope is required for a SOAR playbook to call the Falcon Intelligence API for IOC enrichment lookups?',
    options: [
      'Falcon Intelligence:Read — grants read access to threat intelligence data including IOC reputation, actor profiles, and malware intelligence',
      'Detections:Read — grants access to all Falcon data including threat intelligence context',
      'Custom IOA Rules:Read — grants access to intelligence data used by the detection rule engine',
      'Hosts:Read — includes threat intelligence enrichment data for host-based lookups',
    ],
    correctIndex: 0,
    explanation: '`Falcon Intelligence:Read` is the specific scope required to query the Falcon Intelligence API for IOC lookups, actor profiles, and malware intelligence. `Detections:Read` grants access to detection data, not intelligence API endpoints. `Custom IOA Rules:Read` governs custom detection rule management. `Hosts:Read` provides host/device data. Each scope is specific to its API service — Intelligence access requires the Intelligence scope.',
    docTitle: 'Falcon Intelligence API Scopes',
    docUrl: 'https://falcon.crowdstrike.com/documentation/page/falcon-api-oauth2',
  },
  {
    id: 'platform-ti-q10',
    text: 'What is the primary risk of automatically blocking all IOC matches in a Fusion SOAR playbook without analyst review?',
    options: [
      'Excessive Falcon API calls from the blocking actions may exceed rate limits and cause the playbook to fail',
      'Automated blocking of low and medium-confidence IOCs will generate false positives — legitimate business traffic, partner IPs, or SaaS platforms that share infrastructure with previously malicious actors can be incorrectly blocked, causing business disruption',
      'Falcon prevents automated blocking from SOAR playbooks — all block actions require manual analyst approval in the Falcon console',
      'Blocking actions permanently delete the IOC from the intelligence database, removing it from future detection coverage',
    ],
    correctIndex: 1,
    explanation: 'Automated blocking without confidence filtering causes false positives: IP and domain infrastructure is shared and recycled. A C2 IP used by an attacker 6 months ago may now serve legitimate CDN content. Blocking it automatically interrupts business traffic. Low and medium-confidence IOCs require analyst review before blocking. Only high-confidence, recently confirmed IOCs (typically from active investigations) should feed automated blocking playbooks. API rate limits, analyst approval requirements, and database deletion are not the primary risk.',
    docTitle: 'Automated IOC Blocking Risk',
    docUrl: 'https://falcon.crowdstrike.com/documentation/page/falcon-intelligence-ioc',
  },
]

export const iocPlaybookModule: ContentModule = {
  id: 'platform-ti-ioc',
  title: 'IOC Management & Enrichment in Playbooks',
  trackId: 'platform-threat-intel',
  domainId: 'platform',
  order: 2,
  lastReviewed: '2026-08-17',
  concepts: iocPlaybookConcepts,
  quiz: iocPlaybookQuestions,
}

// ── Track 5.4 Scenario ─────────────────────────────────────────────────────

const threatIntelScenario: Scenario = {
  id: 'platform-threat-intel-scenario',
  title: 'Threat Intelligence Integration: From IOC Feed to Detection',
  context: 'Falcon Intelligence has published a new advisory: threat actor LIGHTNING-BEAR is actively targeting financial services firms with spear-phishing delivering a custom backdoor. The advisory includes 15 C2 IP addresses (confidence 90), 8 malware file hashes (confidence 95), and 3 C2 domains (confidence 85). You need to operationalise this intelligence in your Falcon + LogScale environment.',
  isCumulative: false,
  steps: [
    {
      id: 'pf-ti-s1',
      narrative: 'You receive the LIGHTNING-BEAR advisory with IOCs. All three IOC types (IPs, hashes, domains) have confidence ≥ 85. What is the correct first step to operationalise them in LogScale?',
      choices: [
        { text: 'Import the IOCs into LogScale lookup tables: create or update three lookup tables (malicious-ips, malicious-hashes, malicious-domains) with the LIGHTNING-BEAR IOCs including their confidence scores and threat actor attribution, enabling existing CQL detection rules that use lookup() to immediately match against the new intelligence' },
        { text: 'Manually search LogScale for each IP, hash, and domain individually to check if they have already appeared in your environment before importing them' },
        { text: 'Contact CrowdStrike support to have the IOCs automatically added to Falcon\'s built-in detection engine — custom IOC management is handled through support tickets' },
        { text: 'Wait for Falcon to automatically ingest the advisory IOCs — Falcon Intelligence advisories are automatically applied to all tenants within 24 hours' },
      ],
      correctChoiceIndex: 0,
      wrongConsequence: 'Manual IOC-by-IOC searching is slow and does not operationalise the intelligence for ongoing detection. Support tickets are not how IOCs are managed — the Falcon console and API provide self-service IOC management. Automatic advisory-to-tenant IOC propagation without configuration is not how Falcon Intelligence works — IOCs require explicit import into lookup tables or custom IOC management.',
      reasoning: 'Lookup table import is the fastest way to operationalise multiple IOCs in LogScale. Once the tables are updated, any existing CQL saved search using `lookup()` against those tables will immediately start matching against the new LIGHTNING-BEAR IOCs. For high-confidence IOCs (≥85), immediate import for detection is appropriate — no need to manually pre-check each one before importing.',
      docTitle: 'LogScale Lookup Table Import',
      docUrl: 'https://library.humio.com/falcon-logscale/docs-lookup-files.html',
    },
    {
      id: 'pf-ti-s2',
      narrative: 'After importing the IOCs into LogScale lookup tables, you run a retroactive query for the past 30 days to check if LIGHTNING-BEAR has already been active in your environment. The query returns 3 matches: one DNS request to a LIGHTNING-BEAR C2 domain from 18 days ago on endpoint FIN-WS-009. What is the significance of this finding?',
      choices: [
        { text: 'Low significance — DNS requests to malicious domains are automatically blocked by Falcon; the fact that the request was made without a detection means Falcon already handled it' },
        { text: 'High significance — the DNS request 18 days ago suggests LIGHTNING-BEAR may have already compromised FIN-WS-009 or at least made contact; retrospective IOC matching revealed pre-existing activity that was not detected when it occurred; the endpoint requires immediate investigation for indicators of full compromise' },
        { text: 'Medium significance — DNS requests do not confirm compromise; monitor FIN-WS-009 for 7 days to see if additional activity occurs before initiating an investigation' },
        { text: 'No significance — the advisory IOC confidence is 85%; a 15% false positive rate means one match in a 30-day retroactive query is statistically likely to be a false positive' },
      ],
      correctChoiceIndex: 1,
      wrongConsequence: 'DNS requests to C2 domains are not automatically blocked — they generate a detection only if the domain was already in a detection rule. The 15% confidence uncertainty does not make a single match a probable false positive — 85% confidence is high. A 7-day monitoring wait delays investigation of what may be an active 18-day-old compromise. Retrospective IOC matches indicating pre-existing undetected activity are high-priority findings.',
      reasoning: 'A retrospective match 18 days ago means LIGHTNING-BEAR\'s C2 infrastructure contacted FIN-WS-009 (or FIN-WS-009 contacted the C2) before the advisory was published. This is the core value of retrospective IOC hunting: discovering historical activity that occurred before the intelligence was available. The endpoint needs immediate forensic investigation: full timeline reconstruction, check for lateral movement, and determination of whether the C2 contact resulted in a successful backdoor installation.',
      docTitle: 'Retrospective IOC Matching',
      docUrl: 'https://library.humio.com/falcon-logscale/docs-lookup-files.html',
    },
    {
      id: 'pf-ti-s3',
      narrative: 'You confirm FIN-WS-009 has the LIGHTNING-BEAR backdoor installed. During the investigation, you identify a previously unknown file hash of a variant not in the Falcon Intelligence feed. You want every other Falcon-protected endpoint to generate a detection if this new hash is observed. What do you do?',
      choices: [
        { text: 'Add the hash to the LogScale malicious-hashes lookup table — this is sufficient to detect the hash across all endpoints' },
        { text: 'Email the hash to CrowdStrike Falcon Intelligence for them to add it to the shared feed — customer-discovered hashes cannot be added as custom IOCs' },
        { text: 'Create a custom IOC in the Falcon platform for the file SHA256 with action = Detect — this immediately applies the detection rule to all endpoints with Falcon sensors in the tenant, generating a Falcon detection if the hash is observed' },
        { text: 'Add the hash to FDR\'s filter list — FDR can be configured to flag specific hashes in the event stream before LogScale ingestion' },
      ],
      correctChoiceIndex: 2,
      wrongConsequence: 'Adding the hash to LogScale lookup tables only detects it in historical FDR telemetry queries — it does not create a real-time Falcon sensor detection. Email submission does not create immediate protection — custom IOC management is self-service. FDR does not have a filter list for hashes — it is a raw telemetry export, not a detection engine.',
      reasoning: 'Custom IOC creation in the Falcon platform (`action=Detect`) is the correct mechanism for real-time endpoint detection of a newly discovered file hash. The custom IOC is immediately pushed to all Falcon sensors in the tenant — if any endpoint executes a file with this SHA256 in the future, Falcon generates a detection. This is the SOAR-to-detection promotion pattern: investigation finding → custom IOC → platform-wide coverage.',
      docTitle: 'Falcon Custom IOC Management',
      docUrl: 'https://falcon.crowdstrike.com/documentation/page/falcon-intelligence-ioc',
    },
    {
      id: 'pf-ti-s4',
      narrative: 'Your Fusion SOAR playbook has been automatically blocking all LIGHTNING-BEAR IOC matches without analyst review. Three days later, a business-critical partner application server stops receiving connections. Investigation reveals a LIGHTNING-BEAR C2 IP was recently recycled by a CDN and is now used by the partner application. What governance failure caused this?',
      choices: [
        { text: 'The partner did not notify your team before changing their CDN provider — the failure is on the partner\'s side' },
        { text: 'Falcon Intelligence should have detected the IP repurposing and automatically updated the IOC confidence to zero before it caused a block — the failure is in the intelligence feed update cadence' },
        { text: 'The LogScale lookup table update process removed the IP from the detection feed but the SOAR blocking rule was not updated simultaneously' },
        { text: 'The SOAR playbook was configured to auto-block without confidence filtering or analyst review — automated blocking of IOC matches without review causes false positives when infrastructure is recycled to legitimate use; high-confidence IOCs should still require analyst review before blocking business-critical traffic paths' },
      ],
      correctChoiceIndex: 3,
      wrongConsequence: 'Partner notification is a business process concern, not the governance failure that caused the block. Falcon Intelligence does update confidence scores when infrastructure is repurposed, but the 3-day window for repurposing detection can miss rapid recycling. The LogScale and SOAR rule discrepancy is not the described failure — the playbook was blocking all matches without confidence filtering. The root cause is the automation design: no analyst review gate before blocking production traffic.',
      reasoning: 'The governance failure is auto-blocking all IOC matches without: (1) confidence score filtering (high-confidence only for automated blocking), (2) exception management for known business traffic patterns, and (3) analyst review for blocking actions that affect production paths. The fix: update the SOAR playbook to require analyst approval before blocking, add an exception list for known partner IP ranges, and implement confidence thresholds (≥90 for auto-block, lower confidence requires review).',
      docTitle: 'Automated IOC Blocking Governance',
      docUrl: 'https://falcon.crowdstrike.com/documentation/page/falcon-intelligence-ioc',
    },
    {
      id: 'pf-ti-s5',
      narrative: '90 days after the LIGHTNING-BEAR incident, you are reviewing the 8 LIGHTNING-BEAR malware hash IOCs added during the response. None of them have generated a detection in 90 days. Should you remove them from the custom IOC list?',
      choices: [
        { text: 'Yes — remove them immediately; IOCs with zero hits in 90 days provide no value and create list bloat' },
        { text: 'No — retain file hash IOCs from confirmed malware families indefinitely; a hash that has not been seen in 90 days may still be deployed in a future campaign; unlike IP/domain IOCs, file hashes do not get recycled to legitimate use, making them safe to retain with no false-positive risk' },
        { text: 'Convert them to LogScale-only lookup entries and remove them from the Falcon custom IOC list — file hashes are more efficiently matched in LogScale queries than in the Falcon detection engine' },
        { text: 'Escalate to CrowdStrike to add them to the shared Falcon Intelligence feed — customer-confirmed malware hashes should be contributed back to the community feed' },
      ],
      correctChoiceIndex: 1,
      wrongConsequence: 'Removing hash IOCs based solely on zero hits is premature — the absence of hits means the malware has not been deployed in your environment in 90 days, not that the threat has passed. Unlike IP/domain IOCs (which are recycled infrastructure), file hashes are deterministic: a SHA256 that belongs to LIGHTNING-BEAR\'s backdoor will always belong to that backdoor. There is no false-positive risk from retaining it. LogScale-only matching loses real-time sensor detection capability. Hash contribution to the shared feed is a separate intelligence sharing decision, not a replacement for maintaining the custom IOC.',
      reasoning: 'File hash IOCs from confirmed malware families should be retained indefinitely: they are deterministic (a SHA256 never changes meaning), they carry no recycling risk (unlike IPs/domains), and their zero-hit rate is evidence the threat has not re-appeared — not evidence they are unnecessary. The governance review for file hash IOCs focuses on: are these hashes still associated with active malware families? (Yes, for LIGHTNING-BEAR.) If so, retain them.',
      docTitle: 'IOC Retention Policies',
      docUrl: 'https://falcon.crowdstrike.com/documentation/page/falcon-intelligence-ioc',
    },
  ],
}

// ── Track 5.4 Export ────────────────────────────────────────────────────────

export const threatIntelTrack: ContentTrack = {
  id: 'platform-threat-intel',
  title: 'Threat Intelligence Integration',
  domainId: 'platform',
  order: 4,
  modules: [tiFeedsModule, iocPlaybookModule],
  scenario: threatIntelScenario,
}
```

**Note on q4:** The correct answer ("Use it to validate that existing detection rules...") is at `options[3]` with `correctIndex: 3` — matching the required distribution (q4=3). The explanation is clean; no changes needed.

**Note on platform-ti-q5:** `correctIndex: 0` — correct answer is already at index 0 ("Malware hash indicators..."). No reordering needed.

- [ ] **Step 2: Update `src/content/domains/platform.ts`**

```typescript
import { threatIntelTrack } from './platform-track-5-4'
// tracks: [fdrTrack, apiTrack, governanceTrack, threatIntelTrack]
```

- [ ] **Step 3: TypeScript check + tests**

```
npx tsc -b
npm test
```

- [ ] **Step 4: Commit**

```
git add src/content/domains/platform-track-5-4.ts src/content/domains/platform.ts
git commit -m "feat: add Platform Essentials Track 5.4 Threat Intelligence modules and scenario"
```

---

### Task 5: Platform Essentials Cumulative Scenario

Replace the `platformCumulativeScenario` stub in `platform.ts` with a 6-step capstone. Apply distribution: s1=0,s2=1,s3=2,s4=3,s5=0,s6=1. The correct answer must physically sit at the required index.

**Files:**
- Modify: `src/content/domains/platform.ts`

- [ ] **Step 1: Replace the cumulative scenario stub in `src/content/domains/platform.ts`**

Find `const platformCumulativeScenario` and replace:

```typescript
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
        { text: 'Add the hash to the FDR event filter configuration — FDR will flag the hash in the telemetry stream before LogScale ingestion',  },
        { text: 'Update the LogScale malicious-hashes lookup table with the new hash AND create a Falcon custom IOC (action=Detect) for the SHA256 — the lookup table enables retrospective detection in LogScale queries; the custom IOC enables real-time Falcon sensor detection on all endpoints going forward' },
        { text: 'Submit the hash to CrowdStrike through the intelligence portal and wait for it to be added to the shared feed — custom IOC creation is not self-service' },
        { text: 'Create a Falcon custom IOC only — the custom IOC automatically propagates to LogScale lookup tables through the FDR integration' },
      ],
      correctChoiceIndex: 3,
      wrongConsequence: 'FDR does not have an event filter for hashes — it is a raw telemetry export. Waiting for CrowdStrike to add it to the shared feed delays coverage by days. Custom IOCs do NOT automatically propagate to LogScale lookup tables — these are separate systems that must be updated independently.',
      reasoning: 'Two complementary updates are required: (1) Lookup table update → historical detection in LogScale queries (any future CQL search against FDR telemetry will match this hash retroactively); (2) Custom Falcon IOC (action=Detect) → real-time sensor detection (all 2,000+ Falcon sensors immediately detect the hash if it appears on any endpoint). Neither alone provides complete coverage.',
      docTitle: 'IOC Dual-Coverage Strategy',
      docUrl: 'https://falcon.crowdstrike.com/documentation/page/falcon-intelligence-ioc',
    },
    {
      id: 'pf-cum-s5',
      narrative: 'The CISO needs a briefing in 2 hours. They want the executive dashboard updated to show the current incident impact and a one-time incident summary report emailed to the board security committee. What is the fastest way to produce the report?',
      choices: [
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
        { text: 'A quarterly review should check: (1) API client audit — verify all clients are documented, their scopes match their stated purpose, and unused clients are removed; (2) LogScale RBAC — confirm repository access matches current team roles and off-boarded users are removed; (3) IOC governance — review stale IOC expiry and zero-hit IOC relevance; (4) FDR S3 lifecycle — verify retention policy removes data older than the defined retention period; (5) Scheduled search health — confirm recurring reports are delivering correctly and still relevant' },
        { text: 'A quarterly review should check only the API client list and rotate all client secrets on a fixed quarterly schedule' },
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
```

The domain export must remain:
```typescript
export const platformDomain = {
  id: 'platform',
  title: 'Platform Essentials',
  emoji: '🔧',
  order: 5,
  tracks: [fdrTrack, apiTrack, governanceTrack, threatIntelTrack],
  cumulativeScenario: platformCumulativeScenario,
} satisfies ContentDomain
```

- [ ] **Step 2: TypeScript check + tests**

```
npx tsc -b
npm test
```

- [ ] **Step 3: Commit**

```
git add src/content/domains/platform.ts
git commit -m "feat: add Platform Essentials cumulative scenario completing the domain"
```

---

## Self-Review

**Spec coverage:**
- ✅ Track 5.1: 2 modules (What FDR is, Schema/Events) + 5-step scenario
- ✅ Track 5.2: 3 modules (OAuth2/Scopes, Key Endpoints, Automation Scripts) + 5-step scenario
- ✅ Track 5.3: 2 modules (Scheduled Reports/Dashboards, RBAC) + 5-step scenario
- ✅ Track 5.4: 2 modules (Intelligence Feeds in LogScale, IOC Management in Playbooks) + 5-step scenario
- ✅ Cumulative: 6-step full-stack incident capstone

**Placeholder scan:** All module concepts, quiz questions (4 options + correctIndex + explanation + docTitle + docUrl), and scenario steps (narrative + 4 choices + correctChoiceIndex + wrongConsequence + reasoning + docTitle + docUrl) are fully authored.

**Type consistency:**
- No `challenge` field on any module
- All `quiz` arrays are `QuizQuestion[]` (not wrapped)
- Track IDs: `platform-fdr`, `platform-api`, `platform-governance`, `platform-threat-intel`
- Module `trackId` values match parent track `id` exactly
- `codeLanguage` values: `'cql'` (FDR schema module, TI feeds module), `'bash'` (API fundamentals and endpoints modules)
- Track scenarios: `isCumulative: false`; cumulative: `isCumulative: true`
- Step IDs: `pf-fdr-s1..s5`, `pf-api-s1..s5`, `pf-gov-s1..s5`, `pf-ti-s1..s5`, `pf-cum-s1..s6`

**Distribution verification:**

All questions have the correct answer physically at the required index position. The plan's TypeScript is consistent with the distribution tables in Global Constraints — copy verbatim.
