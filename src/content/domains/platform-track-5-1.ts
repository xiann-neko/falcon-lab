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
    codeExample: '// Example CQL query using FDR fields in LogScale\n// Find all PowerShell processes connecting to external IPs in the last 24h\n#type=NetworkConnectIP4\n| ImageFileName=/powershell\\.exe/i\n| NOT RemoteAddressIP4=/(^10\\.)|(^192\\.168\\.)|(^172\\.(1[6-9]|2[0-9]|3[01])\\.)/\n| start=now()-24h\n| groupBy([aid, RemoteAddressIP4, RemotePort], function=count())\n| sort(count, order=desc)',
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