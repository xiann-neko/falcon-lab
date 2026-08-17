import type {
  ContentDomain,
  ContentModule,
  ContentTrack,
  QuizQuestion,
  ConceptSection,
  Scenario,
  ScenarioStep,
} from '../types'

import { cqlTrack } from './siem-track-1-2'
import { detectionTrack } from './siem-track-1-3'
import { dashboardsTrack } from './siem-track-1-4'

// ═══════════════════════════════════════════════════════════════════════════════
// Track 1.1 — LogScale Foundations
// ═══════════════════════════════════════════════════════════════════════════════

// ── Module: What is LogScale? ─────────────────────────────────────────────────

const whatIsLogscaleConcepts: ConceptSection[] = [
  {
    title: 'What is LogScale?',
    body: 'LogScale (formerly Humio) is a high-throughput log management and SIEM platform acquired by CrowdStrike in 2021 and rebranded as CrowdStrike Falcon LogScale. It is engineered for real-time log ingestion and fast search at petabyte scale.\n\nUnlike traditional SIEM solutions that use row-based relational storage, LogScale uses a columnar time-series storage format. This lets it compress and scan only the relevant columns during search, enabling sub-second responses on billions of events. Within the Falcon platform it powers the Next-Gen SIEM capability, serving as the central data store for all sensor telemetry, third-party integrations, and custom log sources.',
  },
  {
    title: 'Repositories and Views',
    body: 'Data in LogScale is organized into repositories. A repository is an isolated store for log events with its own ingest endpoints, parser configurations, retention policy, and access controls. Organizations typically create separate repositories for different data source types or compliance boundaries.\n\nA view is a read-only window across one or more repositories. Views let analysts query data from multiple repositories simultaneously without duplicating storage. For example, a "Security" view might span both the "Firewall" and "Authentication" repositories.',
    codeExample: '// CQL: count all failed login events in the last hour\nstatus=failed | count()',
    codeLanguage: 'cql',
  },
]

const whatIsLogscaleQuestions: QuizQuestion[] = [
  {
    id: 'siem-what-is-q1',
    text: 'What was LogScale originally called before CrowdStrike acquired it in 2021?',
    options: ['Sumo Logic', 'Humio', 'Elastic SIEM', 'Graylog'],
    correctIndex: 1,
    explanation: 'LogScale was formerly known as Humio — a Danish log management company founded in 2016. CrowdStrike acquired Humio in 2021 and rebranded it as Falcon LogScale, integrating it into the Next-Gen SIEM product line.',
    docTitle: 'Falcon LogScale Documentation — Overview',
    docUrl: 'https://library.humio.com/falcon-logscale/docs/index.html',
  },
  {
    id: 'siem-what-is-q2',
    text: 'Which storage format does LogScale use to enable fast log queries at scale?',
    options: [
      'Row-based relational storage',
      'Document-oriented (JSON) storage',
      'Columnar time-series storage',
      'Graph-based storage',
    ],
    correctIndex: 2,
    explanation: 'LogScale uses a columnar time-series storage format. This lets it compress and scan only the columns relevant to a given query rather than reading entire rows. The result is extremely fast search across large event volumes.',
    docTitle: 'LogScale Architecture',
    docUrl: 'https://library.humio.com/falcon-logscale/docs/installation/architecture.html',
  },
  {
    id: 'siem-what-is-q3',
    text: 'In LogScale, what is a repository?',
    options: [
      'A Git repository containing saved CQL queries',
      'An isolated data store with its own ingest endpoints, parsers, and retention policy',
      'A collection of saved searches and dashboards',
      'A backup copy of the SIEM configuration',
    ],
    correctIndex: 1,
    explanation: 'A repository in LogScale is an isolated store for log events. Each repository has its own ingest tokens, parser configurations, data retention policy, and access controls. Organizations typically create separate repositories for different data sources or teams.',
    docTitle: 'Repositories',
    docUrl: 'https://library.humio.com/falcon-logscale/docs/repos-and-views/repositories/',
  },
  {
    id: 'siem-what-is-q4',
    text: 'What is a LogScale "view" used for?',
    options: [
      'A user interface theme or dashboard layout',
      'A SQL-style computed view of a database table',
      'A read-only window spanning one or more repositories for cross-repo search',
      'A scheduled report sent by email',
    ],
    correctIndex: 2,
    explanation: 'A view in LogScale provides a read-only window across one or more repositories, letting you search data from multiple repositories simultaneously without duplicating storage. Views are commonly used to create unified search interfaces — for example, combining firewall and authentication logs into one "Security" view.',
    docTitle: 'Views',
    docUrl: 'https://library.humio.com/falcon-logscale/docs/repos-and-views/views/',
  },
  {
    id: 'siem-what-is-q5',
    text: 'Which query language does LogScale use for searching and analyzing events?',
    options: [
      'SQL (Structured Query Language)',
      'SPL (Splunk Processing Language)',
      'LQL / CQL (LogScale Query Language / CrowdStrike Query Language)',
      'KQL (Kusto Query Language)',
    ],
    correctIndex: 2,
    explanation: 'LogScale uses its own pipe-based query language — called LogScale Query Language (LQL) in open-source documentation and CQL (CrowdStrike Query Language) within the Falcon platform. Unlike SQL, CQL uses a streaming pipeline model where filters and transformations are chained with `|` and evaluated left-to-right.',
    docTitle: 'Query Language Overview',
    docUrl: 'https://library.humio.com/data-analysis/syntax.html',
  },
]

const whatIsLogscaleModule: ContentModule = {
  id: 'siem-logscale-what-is',
  title: 'What is LogScale? Architecture & key concepts',
  trackId: 'siem-logscale-foundations',
  domainId: 'siem',
  order: 1,
  lastReviewed: '2026-08-13',
  concepts: whatIsLogscaleConcepts,
  quiz: whatIsLogscaleQuestions,
}

// ── Module: Data ingestion ────────────────────────────────────────────────────

const ingestionConcepts: ConceptSection[] = [
  {
    title: 'Ingest Tokens',
    body: "An ingest token is an API key tied to a specific LogScale repository. It authorizes a log source to send data to that repository. Each repository can have multiple ingest tokens — one per log shipper or source type — enabling you to revoke a single source's access without affecting others.\n\nIngest tokens are transmitted as HTTP Bearer tokens in the Authorization header: `Authorization: Bearer <ingest-token>`. This is the standard pattern used by log shippers such as Filebeat, Fluentd, and Vector.",
    codeExample: '# Send a structured event via curl (HEC interface)\ncurl -H "Authorization: Bearer $INGEST_TOKEN" \\\n     -H "Content-Type: application/json" \\\n     -d \'{"timestamp":"2026-08-13T14:00:00Z","message":"Login succeeded","username":"alice"}\' \\\n     https://cloud.community.humio.com/api/v1/ingest/humio-structured',
    codeLanguage: 'bash',
  },
  {
    title: 'Parsers',
    body: "A parser transforms raw log text into structured events with named fields. Without a parser, events are stored as unstructured text in the `@rawstring` field — searchable but not field-filterable.\n\nA parser is associated with an ingest token. When events arrive via that token, LogScale applies the parser to extract fields. For example, an Apache access log parser extracts `method`, `url`, `status`, `bytes`, and `responseTime` from each log line.\n\nLogScale ships with built-in parsers for common formats (syslog, JSON, Windows Event Log). Custom parsers are written using CQL expressions and Grok-style pattern matching.",
    codeExample: "// Parser snippet: extract HTTP method, URL, and status from a web server log\nparseRegex(field=@rawstring,\n  regex='(?P<method>GET|POST|PUT|DELETE) (?P<url>[^ ]+) HTTP\\/[^ ]+ (?P<status>\\d+)')",
    codeLanguage: 'cql',
  },
]

const ingestionQuestions: QuizQuestion[] = [
  {
    id: 'siem-ingestion-q1',
    text: 'What is a LogScale ingest token?',
    options: [
      'A JWT used to authenticate CQL search queries',
      'An API key tied to a repository that authorizes log sources to send data',
      'A temporary session credential that expires after 24 hours',
      'A license key for the LogScale platform',
    ],
    correctIndex: 1,
    explanation: 'An ingest token is an API key generated per repository. It authorizes a specific log source to send data to that repository. A repository can have multiple tokens — one per source type — enabling granular revocation without disrupting other sources.',
    docTitle: 'Ingest Tokens',
    docUrl: 'https://library.humio.com/falcon-logscale/docs/ingesting-data/ingest-tokens/',
  },
  {
    id: 'siem-ingestion-q2',
    text: "How is an ingest token transmitted when using LogScale's HTTP Event Collector (HEC) interface?",
    options: [
      'As a query parameter in the URL: `?token=<value>`',
      'In the request body as a JSON field: `{"token": "<value>"}`',
      'As a Bearer token in the HTTP Authorization header',
      'As a cookie named `X-Humio-Token`',
    ],
    correctIndex: 2,
    explanation: 'When sending events to LogScale via HEC, the ingest token is passed as `Authorization: Bearer <your-ingest-token>`. This is the standard HEC authentication pattern, compatible with log shippers such as Filebeat, Fluentd, and Vector.',
    docTitle: 'HEC (HTTP Event Collector)',
    docUrl: 'https://library.humio.com/falcon-logscale/docs/ingesting-data/ingest-apis/hec/',
  },
  {
    id: 'siem-ingestion-q3',
    text: 'What does a LogScale parser do?',
    options: [
      'Compresses and deduplicates incoming log events',
      'Routes events to different repositories based on content',
      'Transforms raw log text into structured events with named fields',
      'Filters out events that match an exclusion rule before storage',
    ],
    correctIndex: 2,
    explanation: 'A parser processes raw incoming log data and extracts named fields from it. For example, an Apache access log parser extracts `method`, `url`, `status`, `bytes`, and `responseTime` from each raw line, making these fields available for CQL filtering and aggregation.',
    docTitle: 'Parsers',
    docUrl: 'https://library.humio.com/falcon-logscale/docs/parsers/',
  },
  {
    id: 'siem-ingestion-q4',
    text: 'What happens when an ingest token has no parser configured?',
    options: [
      'Ingestion fails and the event is rejected with an error',
      'Only JSON-formatted events are accepted and auto-structured',
      'Events are stored as raw text in the @rawstring field',
      'A default timestamp-only parser is applied automatically',
    ],
    correctIndex: 2,
    explanation: "If no parser is associated with an ingest token, LogScale accepts the data but stores it without field extraction. The raw event text is stored in `@rawstring`. Events are still searchable as raw text, but structured field filtering (e.g., `status=404`) is not possible.",
    docTitle: 'Parser Configuration',
    docUrl: 'https://library.humio.com/falcon-logscale/docs/parsers/parser-configuration/',
  },
  {
    id: 'siem-ingestion-q5',
    text: 'Which field is automatically added to every event ingested into LogScale?',
    options: ['#host', '@timestamp', '#source', '@eventtype'],
    correctIndex: 1,
    explanation: 'Every event receives a `@timestamp` field recording when the event occurred, in milliseconds since the Unix epoch. LogScale is a time-series store — all queries operate within time ranges — so `@timestamp` is required. It can be extracted from the log data by a parser, or defaults to the time LogScale received the event.',
    docTitle: 'Event Fields',
    docUrl: 'https://library.humio.com/falcon-logscale/docs/query/event-fields/',
  },
]

const ingestionModule: ContentModule = {
  id: 'siem-logscale-ingestion',
  title: 'Data ingestion — parsers, ingest tokens, sources',
  trackId: 'siem-logscale-foundations',
  domainId: 'siem',
  order: 2,
  lastReviewed: '2026-08-13',
  concepts: ingestionConcepts,
  quiz: ingestionQuestions,
}

// ── Module: The LogScale data model ──────────────────────────────────────────

const dataModelConcepts: ConceptSection[] = [
  {
    title: 'Tags vs Fields',
    body: 'LogScale events have two types of named attributes: tags and fields.\n\n**Tags** (prefixed with `#`) are indexed at ingest time and stored in a separate partition map. They drive "skip-segment" optimization — when you filter on a tag value (e.g., `#host=webserver1`), LogScale can skip entire storage segments that do not contain that tag value, making tag-filtered queries far faster than field-filtered ones. Common tags: `#host`, `#source`, `#type`.\n\n**Fields** (no prefix) are extracted by parsers and stored within the event payload. They are fully searchable via CQL but do not benefit from skip-segment optimization.',
    codeExample: '// Tag filter — uses skip-segment optimization (fast)\n#host=webserver1 | count()\n\n// Field filter — scans within matching segments\nstatus=500 | count()',
    codeLanguage: 'cql',
  },
  {
    title: 'System Fields and Multi-Value Fields',
    body: 'LogScale automatically populates system fields on every event. Fields prefixed with `@`:\n- `@timestamp` — event time in milliseconds since Unix epoch (required)\n- `@rawstring` — the original raw log line before parsing\n- `@id` — a unique event identifier assigned by LogScale\n- `@ingesttimestamp` — when LogScale received the event\n\nSystem tags (prefixed with `#`) — `#host`, `#source`, `#type` — are populated from the ingest token configuration or HTTP client headers.\n\n**Multi-value fields:** A field can appear multiple times in one event with different values. This is common in network events that reference multiple IP addresses. CQL aggregation functions work correctly across all values of a multi-value field.',
    codeExample: '// Filter on a system field\n@timestamp > now() - 1h | count()\n\n// Filter on a system tag\n#source=crowdstrike-falcon | count()',
    codeLanguage: 'cql',
  },
]

const dataModelQuestions: QuizQuestion[] = [
  {
    id: 'siem-data-model-q1',
    text: 'What distinguishes a tag from a regular field in LogScale?',
    options: [
      'Tags can only hold string values; regular fields can hold any type',
      'Tags are indexed at ingest time and enable skip-segment optimization for fast partition filtering',
      'Tags are set by users in CQL queries; fields are set by parsers',
      'Tags expire after the retention period; fields are permanent',
    ],
    correctIndex: 1,
    explanation: "Tags in LogScale are indexed at ingest time and stored in a separate partition map. This enables skip-segment optimization: when you filter on a tag (e.g., `#host=webserver1`), LogScale can skip entire storage segments that don't contain that tag, making tag-filtered queries significantly faster than regular field filters.",
    docTitle: 'Tags',
    docUrl: 'https://library.humio.com/falcon-logscale/docs/query/tags/',
  },
  {
    id: 'siem-data-model-q2',
    text: 'Which prefix identifies tag fields in LogScale CQL queries?',
    options: [
      '@ (at symbol) — e.g. @host',
      '$ (dollar sign) — e.g. $host',
      '# (hash symbol) — e.g. #host',
      '_ (underscore) — e.g. _host',
    ],
    correctIndex: 2,
    explanation: 'Tag fields in LogScale are prefixed with `#` (hash). For example, `#host`, `#source`, and `#type` are common tag fields. System metadata fields use the `@` prefix (`@timestamp`, `@rawstring`). Regular parser-extracted fields use no prefix.',
    docTitle: 'Tags',
    docUrl: 'https://library.humio.com/falcon-logscale/docs/query/tags/',
  },
  {
    id: 'siem-data-model-q3',
    text: 'Which system tag does LogScale automatically populate on every ingested event?',
    options: ['#eventid', '#host', '#timestamp', '#severity'],
    correctIndex: 1,
    explanation: "LogScale automatically assigns `#host` (the hostname of the system that sent the event) as a system tag to every ingested event. Other automatic system tags include `#source` and `#type`, populated from the ingest token configuration or the HTTP client's headers.",
    docTitle: 'System Tags',
    docUrl: 'https://library.humio.com/falcon-logscale/docs/query/tags/#system-tags',
  },
  {
    id: 'siem-data-model-q4',
    text: 'What is the data type and precision of the @timestamp field in LogScale?',
    options: [
      'ISO 8601 string with second precision (e.g., "2026-08-13T14:00:00Z")',
      'Unix timestamp in seconds (floating-point)',
      'Unix timestamp in milliseconds (integer)',
      'Unix timestamp in nanoseconds (integer)',
    ],
    correctIndex: 2,
    explanation: 'LogScale stores `@timestamp` as a millisecond-precision Unix timestamp (integer). All time-range calculations and storage partitioning use this value internally. The UI converts it to human-readable format for display, but the underlying field is always in milliseconds.',
    docTitle: 'Timestamp Formats',
    docUrl: 'https://library.humio.com/falcon-logscale/docs/parsers/timestamps/',
  },
  {
    id: 'siem-data-model-q5',
    text: 'How does LogScale represent a log field that has multiple values in a single event (e.g., two destination IPs)?',
    options: [
      'Only the first value is stored; subsequent values are discarded',
      'Values are concatenated with a pipe separator: "10.0.0.1|10.0.0.2"',
      'The field appears multiple times in the event, once per value',
      'Multi-value fields are unsupported; events must be split instead',
    ],
    correctIndex: 2,
    explanation: 'LogScale supports multi-value fields — a single field name can appear multiple times within one event, each instance holding a different value. This is common in network events that reference multiple IP addresses. CQL functions like `groupBy` and `count(distinct=field)` operate correctly across all values.',
    docTitle: 'Multi-value Fields',
    docUrl: 'https://library.humio.com/falcon-logscale/docs/query/multi-value-fields/',
  },
]

const dataModelModule: ContentModule = {
  id: 'siem-logscale-data-model',
  title: 'The LogScale data model (events, tags, fields)',
  trackId: 'siem-logscale-foundations',
  domainId: 'siem',
  order: 3,
  lastReviewed: '2026-08-13',
  concepts: dataModelConcepts,
  quiz: dataModelQuestions,
}

// ── Track 1.1 scenario ────────────────────────────────────────────────────────

const foundationsTrackScenario: Scenario = {
  id: 'siem-foundations-track-scenario',
  title: 'Investigating a Failed Authentication Spike',
  context: "It's 14:32 on a Tuesday. Your SOC monitoring dashboard has just fired: 847 failed login attempts in the last 60 minutes, all from internal IP 10.5.1.44. You open LogScale to investigate.",
  isCumulative: false,
  steps: [
    {
      id: 'siem-foundations-step1',
      narrative: "You see the alert. You're looking at an empty LogScale search bar. What do you do first?",
      choices: [
        { text: 'Block 10.5.1.44 at the firewall immediately — 847 failed logins clearly indicates an attack' },
        { text: 'Search LogScale for all events from 10.5.1.44 in the last hour to understand the scope' },
        { text: 'Close the alert — this volume of failed logins is probably a misconfigured application' },
        { text: 'Escalate directly to management without investigating the logs' },
      ],
      correctChoiceIndex: 1,
      wrongConsequence: 'Taking action before gathering data risks disrupting legitimate services, missing the full scope of the attack, and destroying forensic evidence needed for the incident report.',
      reasoning: 'The first step in any SOC investigation is data collection. You need to understand the scope, pattern, and context before taking any remediation action. LogScale is your primary tool for this.',
      docTitle: 'SOC Investigation Workflow',
      docUrl: 'https://library.humio.com/falcon-logscale/docs/',
    },
    {
      id: 'siem-foundations-step2',
      narrative: 'You open the authentication repository in LogScale. Which CQL query correctly filters for failed login events from 10.5.1.44?',
      choices: [
        { text: "`SELECT * FROM events WHERE sourceIP = '10.5.1.44' AND status = 'failed'`" },
        { text: '`source=10.5.1.44 | status=failed | count()`' },
        { text: '`sourceIP=10.5.1.44 status=failed | count()`' },
        { text: '`filter(field=sourceIP, value=10.5.1.44) | count(failed)`' },
      ],
      correctChoiceIndex: 2,
      wrongConsequence: 'Using SQL syntax or incorrect pipe placement causes a parse error. LogScale uses CQL pipe-based syntax, not SQL. The pipe `|` chains to aggregate functions, not to field filters.',
      reasoning: 'In LogScale CQL, field filters use the `field=value` syntax. Multiple filters are space-separated (implicit AND). The pipe `|` chains to an aggregate: `sourceIP=10.5.1.44 status=failed | count()`.',
      docTitle: 'Query Language Overview',
      docUrl: 'https://library.humio.com/data-analysis/syntax.html',
    },
    {
      id: 'siem-foundations-step3',
      narrative: 'Your query returns 847 events. All of them target the same username: admin@company.com. What is your next step?',
      choices: [
        { text: 'Change the admin password immediately and mark the investigation complete' },
        { text: 'Search for any SUCCESSFUL logins from 10.5.1.44 or for admin@company.com in the same time window' },
        { text: 'Delete the 847 events from LogScale to prevent further data exposure' },
        { text: "Document '847 failed logins' and close the ticket — no success events appeared in the alert" },
      ],
      correctChoiceIndex: 1,
      wrongConsequence: "Acting on failed logins without checking for successful ones means you don't know if the account is already compromised. Changing the password won't terminate an existing attacker session.",
      reasoning: 'High failed login volume targeting one account raises a critical question: did any of them succeed? You must check for successful logins from the same source before determining severity and planning response.',
      docTitle: 'Threat Investigation',
      docUrl: 'https://library.humio.com/falcon-logscale/docs/',
    },
    {
      id: 'siem-foundations-step4',
      narrative: 'Running `username="admin@company.com" status=success | tail(10)` reveals 2 successful logins: one at 14:28 from 10.5.1.44, one at 14:31 from 203.0.113.42. Failed attempts peaked at 14:27. What does this pattern indicate?',
      choices: [
        { text: 'Normal login activity — users often log in from multiple locations' },
        { text: 'A brute-force attack that succeeded: the account was likely compromised at 14:28' },
        { text: "A LogScale parsing error — the 'success' labels are false positives from a misconfigured parser" },
        { text: 'The admin user was testing their own password reset procedure' },
      ],
      correctChoiceIndex: 1,
      wrongConsequence: 'Dismissing this pattern as normal leaves an actively compromised account in place. 847 failed attempts followed immediately by a successful login from the attack source is a textbook brute-force success pattern.',
      reasoning: "The timeline tells the story: 847 failed attempts from 10.5.1.44 → successful login at 14:28 → second successful login from a different IP (203.0.113.42) at 14:31, possibly pivoting. This is a confirmed credential compromise requiring immediate incident response.",
      docTitle: 'Detection Patterns',
      docUrl: 'https://library.humio.com/falcon-logscale/docs/',
    },
    {
      id: 'siem-foundations-step5',
      narrative: 'The incident has been confirmed and escalated. Before handing off to the incident response team, what should you capture from LogScale for the incident record?',
      choices: [
        { text: 'Only the source IP address — that is the only artifact IR needs' },
        { text: 'Nothing — LogScale data is confidential and cannot be included in incident records' },
        { text: 'Source IP, target username, attack time range, failed attempt count, exact successful login timestamps, source IPs of all successful logins, and a saved search link to the full event set' },
        { text: 'A screenshot of the LogScale search UI' },
      ],
      correctChoiceIndex: 2,
      wrongConsequence: 'Providing minimal data gives the IR team insufficient context. They need the full timeline and event context to scope the compromise, identify attacker pivots, and verify the attack independently.',
      reasoning: "A complete forensic handoff includes: attacker source IP, targeted account, full attack timeline (start/end), quantitative scope (847 failed attempts), critical event timestamps (successful logins at 14:28 and 14:31), all source IPs, and a persisted LogScale query URL so the IR team can independently verify and expand the investigation.",
      docTitle: 'Incident Documentation',
      docUrl: 'https://library.humio.com/falcon-logscale/docs/',
    },
  ] satisfies ScenarioStep[],
}

// ── Track 1.1 assembly ────────────────────────────────────────────────────────

const foundationsTrack: ContentTrack = {
  id: 'siem-logscale-foundations',
  title: 'LogScale Foundations',
  domainId: 'siem',
  order: 1,
  modules: [whatIsLogscaleModule, ingestionModule, dataModelModule],
  scenario: foundationsTrackScenario,
}

// ── SIEM cumulative scenario ─────────────────────────────────────────────────

const siemCumulativeScenario: Scenario = {
  id: 'siem-cumulative',
  title: 'SIEM Capstone: End-to-End Incident Response',
  context: 'This scenario combines all SIEM skills: LogScale data model, CQL querying, detection alerting, and dashboard governance. A Monday morning begins normally. By mid-morning, three independent signals appear. Your mission: use LogScale to determine whether they are related, identify the threat, contain it, and leave a dashboard in place for ongoing monitoring — all within a 90-minute response window.',
  isCumulative: true,
  steps: [
    {
      id: 'siem-cum-s1',
      narrative: 'At 09:12, a "High Failed Login Volume" alert fires: 847 failures from 14 IPs in the past hour. The alert uses a static threshold of 500. Three of the 14 IPs also appear in your threat intel lookup CSV as known Tor exit nodes. Which CQL query efficiently surfaces ONLY the Tor exit node IPs and their failure counts?',
      choices: [
        { text: '#event_simpleName = UserLogonFailed2 | groupBy([RemoteIP], function=count()) | lookup(file="tor_exit_nodes.csv", field=RemoteIP, key=ip) | isKnownTor = true | sort(field=_count, order=desc)' },
        { text: '#event_simpleName = UserLogonFailed2 | RemoteIP in tor_exit_nodes | count()' },
        { text: '#event_simpleName = UserLogonFailed2 | join({file="tor_exit_nodes.csv"}, field=[RemoteIP]) | count()' },
        { text: 'ThreatIntel = tor | #event_simpleName = UserLogonFailed2 | groupBy([RemoteIP])' },
      ],
      correctChoiceIndex: 0,
      wrongConsequence: 'Option B uses invalid "in file" syntax — LogScale does not support direct in-file membership. Option C confuses join() syntax — join() takes a subquery, not a file path. Option D invents a "ThreatIntel" field that does not exist in Falcon events.',
      reasoning: 'The correct pattern is: filter (tag) → aggregate (groupBy) → enrich (lookup) → filter enriched results. lookup() appends columns from the CSV to matching rows. Filtering on isKnownTor = true (a column in the CSV) after the lookup keeps only the Tor IPs. sort() puts the highest-volume attacker first.',
      docTitle: 'CQL Lookup and Threat Intel Enrichment',
      docUrl: 'https://library.humio.com/data-analysis/functions-lookup.html',
    },
    {
      id: 'siem-cum-s2',
      narrative: 'The three Tor IPs combined have 312 failures but also 2 successful logins — one for "svc_api" (a service account) and one for "admin_backup". At 09:34, a second unrelated alert fires: "Scheduled Task Created" on server DB-PROD-03. This could be persistence. How do you determine if these two alerts are related?',
      choices: [
        { text: 'Query UserLogon events for svc_api and admin_backup and check if either accessed DB-PROD-03 after the Tor IPs\' successful logins using timestamp correlation' },
        { text: 'Close the scheduled task alert — it fired 22 minutes after the login alert so they cannot be related' },
        { text: 'Escalate both alerts independently to different Tier 2 analysts for parallel investigation' },
        { text: 'Wait for a third alert before drawing any conclusions — two data points is insufficient' },
      ],
      correctChoiceIndex: 0,
      wrongConsequence: 'Time gaps of 22 minutes are entirely consistent with post-compromise lateral movement. Parallel investigation by separate analysts risks missing the connection between them. Waiting for a third alert delays response to what may already be an active intrusion.',
      reasoning: 'Correlating alerts is a core SOC skill. Query UserLogon for both compromised accounts, filter for the time window after the Tor login successes, and check if either account touched DB-PROD-03. If svc_api or admin_backup appears in a UserLogon event on DB-PROD-03 between 09:12 and 09:34, the alerts are almost certainly the same incident.',
      docTitle: 'LogScale Alert Correlation',
      docUrl: 'https://library.humio.com/data-analysis/query-best-practices.html',
    },
    {
      id: 'siem-cum-s3',
      narrative: 'Your correlation query confirms: svc_api logged into DB-PROD-03 at 09:29, 17 minutes after the successful Tor login. A scheduled task named "WindowsUpdate_Svc" was created at 09:34 by svc_api. This is a confirmed persistence mechanism. A third alert fires at 09:41: "Anomalous Outbound Data Volume" — 2.1GB outbound from DB-PROD-03 in 20 minutes. All three alerts are the same incident. What is the correct IMMEDIATE action?',
      choices: [
        { text: 'Isolate DB-PROD-03 via Falcon Real Time Response, disable svc_api, and open a P1 incident — these three correlated indicators confirm active data exfiltration' },
        { text: 'Continue investigating for another 30 minutes to determine what data was exfiltrated before taking action' },
        { text: 'Only disable svc_api — isolating DB-PROD-03 would disrupt database production operations' },
        { text: 'Alert the database administrator and wait for their approval before any containment' },
      ],
      correctChoiceIndex: 0,
      wrongConsequence: 'Waiting 30 more minutes during active exfiltration of 2.1GB/20min could allow gigabytes more data to leave. Disabling only the account does not revoke the active session or stop the scheduled task already in place. Waiting for DBA approval delays a time-critical containment decision — the SOC has authority to contain during active exfiltration.',
      reasoning: 'Three correlated indicators — external compromise, lateral movement, persistence, and active exfiltration — constitute a confirmed P1. The database disruption from isolation is an acceptable trade-off against ongoing data loss. Contain first, coordinate recovery second. Open the P1 incident immediately to trigger the full IR process.',
      docTitle: 'CrowdStrike Incident Response — Containment',
      docUrl: 'https://falcon.crowdstrike.com/documentation/page/incident-response',
    },
    {
      id: 'siem-cum-s4',
      narrative: 'DB-PROD-03 is isolated and svc_api is disabled. You need to determine the full scope: did the attacker access any other hosts using svc_api after the initial Tor login? Write the correct CQL query.',
      choices: [
        { text: '#event_simpleName = UserLogon | UserName = svc_api | timestamp > "2026-08-17T09:12:00Z" | groupBy([ComputerName]) | sort(field=_count, order=desc)' },
        { text: 'UserName = svc_api | EventType = logon | groupBy([ComputerName])' },
        { text: '#event_simpleName = UserLogon | groupBy([ComputerName]) | UserName = svc_api' },
        { text: 'svc_api | #event_simpleName = UserLogon | distinct(ComputerName)' },
      ],
      correctChoiceIndex: 0,
      wrongConsequence: 'Option B uses wrong field names. Option C places the UserName filter after the groupBy — at that point UserName is no longer a per-event field, it has been aggregated away. Option D puts a bare keyword "svc_api" before an indexed tag filter — bare keyword searches are slower and less precise.',
      reasoning: 'The correct pipeline: indexed tag filter → field filter → time filter → groupBy. Placing the timestamp filter explicitly ensures you only see activity after the attacker\'s initial compromise time. groupBy([ComputerName]) shows every host svc_api touched. sort() reveals the most-accessed hosts — likely the ones to investigate next.',
      docTitle: 'CQL Query Construction',
      docUrl: 'https://library.humio.com/data-analysis/syntax.html',
    },
    {
      id: 'siem-cum-s5',
      narrative: 'Scope confirmed: svc_api touched 4 hosts. All 4 are now isolated. The immediate incident is contained. You need to create a monitoring dashboard for the next 72 hours to detect if the attacker attempts to return using a different account or technique. Which panels should the dashboard include?',
      choices: [
        { text: 'Failed login volume by source IP (time chart), Successful logins from known Tor IPs (single value/alert), New scheduled tasks created (table, live), and Outbound data volume by host (time chart)' },
        { text: 'A single panel showing all events from the past 7 days sorted by timestamp' },
        { text: 'Only the three alerts that fired during the incident — no new panels needed' },
        { text: 'A dashboard showing all 22 existing alerts in a list view' },
      ],
      correctChoiceIndex: 0,
      wrongConsequence: 'A single chronological event list is too noisy to monitor effectively. Re-using only the original three alerts provides coverage for the same techniques but not variations (new account, different persistence method). Listing all 22 alerts is an audit view, not a monitoring dashboard.',
      reasoning: 'A targeted monitoring dashboard should cover: (1) the known attack vector (Tor IP logins), (2) the lateral movement technique (auth to multiple hosts), (3) the persistence technique (scheduled task creation), and (4) the impact indicator (outbound data volume). These four panels give responders immediate visibility into a return attempt or missed lateral movement.',
      docTitle: 'LogScale Dashboard Design for Incident Monitoring',
      docUrl: 'https://library.humio.com/dashboards/dashboards-widgets.html',
    },
    {
      id: 'siem-cum-s6',
      narrative: 'After the incident, you run a post-incident review. One finding: the three alerts fired independently with no automatic correlation — analysts had to connect them manually, which took 29 minutes. What process improvement addresses this gap?',
      choices: [
        { text: 'Create a correlation query saved search that joins UserLogon (from known bad IPs), ScheduledTaskCreated, and high outbound volume — run it as a single alert with a shorter schedule interval' },
        { text: 'Hire more analysts so alerts can be reviewed faster' },
        { text: 'Raise the thresholds on all three alerts so they only fire for extreme values' },
        { text: 'Purchase a separate SOAR tool to handle alert correlation — LogScale cannot correlate' },
      ],
      correctChoiceIndex: 0,
      wrongConsequence: 'More analysts does not solve the root problem — correlation logic. Raising thresholds makes each individual alert less sensitive and would have delayed detection further. LogScale CQL can perform multi-event correlation using join() and time-window patterns — a dedicated SOAR tool is not required for correlation queries.',
      reasoning: 'The fix is a compound detection alert that correlates the three signals in one query using join() and time-window logic: "find hosts where a suspicious external login was followed by a new scheduled task within 60 minutes AND outbound data volume exceeds baseline." This reduces the 29-minute manual correlation window to near-zero.',
      docTitle: 'LogScale Multi-Event Correlation',
      docUrl: 'https://library.humio.com/data-analysis/functions-join.html',
    },
  ],
}

// ── Domain 1 export ───────────────────────────────────────────────────────────

export const siemDomain = {
  id: 'siem',
  title: 'LogScale / Next-Gen SIEM',
  emoji: '📡',
  order: 1,
  tracks: [foundationsTrack, cqlTrack, detectionTrack, dashboardsTrack],
  cumulativeScenario: siemCumulativeScenario,
} satisfies ContentDomain
