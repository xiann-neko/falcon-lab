import type {
  ContentModule,
  ContentTrack,
  QuizQuestion,
  ConceptSection,
  Scenario,
} from '../types'

// ═══════════════════════════════════════════════════════════════════════════════
// Track 1.3 — Detection & Alerting
// ═══════════════════════════════════════════════════════════════════════════════

// ── Module 1.3.1: Saved Searches & Scheduled Alerts ──────────────────────────

const savedSearchesConcepts: ConceptSection[] = [
  {
    title: 'Saved Searches',
    body: 'A saved search in LogScale is a named, stored CQL query. Saved searches serve two purposes: reusability (analysts can run the same query without retyping it) and scheduling (the query runs automatically on a schedule and triggers alerts).\n\nTo create a saved search: write and test your query in the search UI, click "Save search", give it a name, an optional description, and optional tags. Saved searches are scoped to the repository or view where they are created.\n\nBest practice: include the author name, creation date, and a brief explanation of what the query detects in the description or as // comments in the query body.',
  },
  {
    title: 'Scheduled Alerts',
    body: 'A scheduled alert runs a saved search on a configurable schedule and fires an action when the result meets a condition.\n\nKey configuration options:\n- **Schedule:** how often the query runs (e.g., every 5 minutes, every hour)\n- **Time window:** the look-back period the query uses each run (e.g., last 15 minutes)\n- **Trigger condition:** when to fire — "on non-empty result" (any match triggers), or "when count exceeds N"\n- **Throttle:** minimum time between repeated alerts for the same condition (prevents alert storms)\n- **Actions:** what happens when the alert fires (webhook, email, PagerDuty — covered in Module 1.3.2)\n\nFor detection use cases, set the schedule interval ≤ the time window so there are no coverage gaps. Example: schedule every 5 min, time window 10 min.',
    codeExample: '// Alert query: Detect new local admin account creations\n// Schedule: every 5 min | Window: last 10 min | Trigger: non-empty result\n#event_simpleName = UserAccountCreated\n| LocalAdminFlag = true\n| table([ComputerName, UserName, UTC_time])',
    codeLanguage: 'cql',
  },
]

const savedSearchesQuestions: QuizQuestion[] = [
  {
    id: 'siem-det-saved-q1',
    text: 'What are the two primary uses of a saved search in LogScale?',
    options: [
      'Reusability (run on-demand without retyping) and scheduling (automatic execution for alerts)',
      'Data export and dashboard display',
      'Access control and audit logging',
      'Backup and disaster recovery',
    ],
    correctIndex: 0,
    explanation: 'Saved searches serve dual purposes: analysts can retrieve and run them on-demand without rewriting the query, and the scheduler can run them automatically on a configured interval to power alerts and dashboards.',
    docTitle: 'LogScale Saved Searches',
    docUrl: 'https://library.humio.com/data-analysis/saved-queries.html',
  },
  {
    id: 'siem-det-saved-q2',
    text: 'When configuring a scheduled alert, why should the schedule interval be less than or equal to the query time window?',
    options: [
      'To ensure there are no gaps in detection coverage between query runs',
      'To reduce the number of API calls to the LogScale backend',
      'To comply with CrowdStrike licensing requirements for scheduled queries',
      'To prevent the query from timing out on large datasets',
    ],
    correctIndex: 0,
    explanation: 'If the schedule runs every 10 minutes but the time window is only 5 minutes, there is a 5-minute blind spot between runs. Setting the window >= the interval guarantees every event is covered by at least one query execution.',
    docTitle: 'LogScale Scheduled Alerts',
    docUrl: 'https://library.humio.com/dashboards/alerts-scheduled.html',
  },
  {
    id: 'siem-det-saved-q3',
    text: 'What does the "throttle" setting on a LogScale scheduled alert control?',
    options: [
      'The minimum time between repeated alert firings for the same condition (prevents alert storms)',
      'The maximum query execution time before the alert is cancelled',
      'The rate limit on outbound webhook calls',
      'The number of events the query can return per run',
    ],
    correctIndex: 0,
    explanation: 'Throttling suppresses duplicate alert notifications. If an alert fires every 5 minutes for a persisting condition, a throttle of 1 hour means you receive only one notification per hour instead of 12. This prevents analysts from being overwhelmed by repeated alerts for the same ongoing issue.',
    docTitle: 'LogScale Alert Throttling',
    docUrl: 'https://library.humio.com/dashboards/alerts-scheduled.html',
  },
  {
    id: 'siem-det-saved-q4',
    text: 'Which trigger condition should you use when ANY result from a detection query should fire an alert?',
    options: [
      '"On non-empty result" — fires whenever the query returns at least one event',
      '"Count exceeds 0" — fires when the count is greater than zero',
      '"On change" — fires when the result count changes from the previous run',
      '"Always" — fires on every scheduled run regardless of results',
    ],
    correctIndex: 0,
    explanation: '"On non-empty result" is the simplest and most common trigger for detection queries — it fires whenever the query finds at least one matching event. "Count exceeds N" is better for volume-based thresholds (e.g., fire only when failures > 50).',
    docTitle: 'LogScale Alert Trigger Conditions',
    docUrl: 'https://library.humio.com/dashboards/alerts-scheduled.html',
  },
  {
    id: 'siem-det-saved-q5',
    text: 'A saved search is scoped to which level in LogScale?',
    options: [
      'The repository or view where it was created',
      'The entire LogScale organisation (all repositories)',
      'The user account that created it',
      'The Falcon platform tenant',
    ],
    correctIndex: 0,
    explanation: 'Saved searches in LogScale are repository-scoped or view-scoped — they exist within the repository or view where they were created and can only query data accessible through that scope. This aligns with the access control model where different teams may have different repository permissions.',
    docTitle: 'LogScale Repository Access Control',
    docUrl: 'https://library.humio.com/data-analysis/saved-queries.html',
  },
]

export const savedSearchesModule: ContentModule = {
  id: 'siem-detection-saved-searches',
  title: 'Saved Searches & Scheduled Alerts',
  trackId: 'siem-detection',
  domainId: 'siem',
  order: 1,
  lastReviewed: '2026-08-17',
  concepts: savedSearchesConcepts,
  quiz: savedSearchesQuestions,
}

// ── Module 1.3.2: Alert Actions & Integrations ────────────────────────────────

const alertActionsConcepts: ConceptSection[] = [
  {
    title: 'Alert Actions',
    body: 'An alert action defines what happens when a scheduled alert fires. LogScale supports several built-in action types:\n\n- **Webhook:** sends an HTTP POST to a URL with a configurable JSON payload. Use this for Slack, Teams, PagerDuty, Splunk SIEM integration, or any HTTP-capable system.\n- **Email:** sends an email to a list of recipients with the alert name, query, and triggered time.\n- **OpsGenie / PagerDuty:** native integrations for on-call paging systems.\n- **Falcon Fusion:** can trigger a SOAR workflow (advanced — requires Fusion access).\n\nActions are configured separately from alerts and then attached to one or more alerts. One action can be reused by many alerts.',
  },
  {
    title: 'Structuring Webhook Payloads',
    body: 'For webhook actions, LogScale provides template variables you can use in the payload body:\n- `{alert_name}` — the name of the alert that fired\n- `{triggered_timestamp}` — when the alert triggered (ISO 8601)\n- `{query}` — the CQL query that ran\n- `{result_count}` — number of matching events\n- `{repository}` — the source repository\n\nFor Slack webhooks, the payload must be JSON with a "text" or "blocks" field. For PagerDuty, the payload includes "routing_key", "event_action", and "payload" fields.\n\nAlways test webhook actions with a manual trigger before relying on them for production alerting.',
    codeExample: '// Example Slack webhook payload for a LogScale alert action\n{\n  "text": "🚨 *{alert_name}* fired at {triggered_timestamp}\\n>{result_count} matching events in {repository}"\n}',
    codeLanguage: 'json',
  },
]

const alertActionsQuestions: QuizQuestion[] = [
  {
    id: 'siem-det-actions-q1',
    text: 'Which LogScale alert action type is the most flexible for integrating with third-party tools like Slack, Teams, or custom APIs?',
    options: [
      'Webhook — sends an HTTP POST to any URL with a configurable JSON payload',
      'Email — sends a structured email notification',
      'OpsGenie — pages on-call engineers',
      'Falcon Fusion — triggers a SOAR workflow',
    ],
    correctIndex: 0,
    explanation: 'Webhook actions send an HTTP POST to any URL — making them compatible with any system that can receive HTTP requests. Slack, Microsoft Teams, PagerDuty, custom automation scripts, ticketing systems, and SOAR platforms all support webhook ingestion.',
    docTitle: 'LogScale Alert Actions',
    docUrl: 'https://library.humio.com/dashboards/alerts-actions.html',
  },
  {
    id: 'siem-det-actions-q2',
    text: 'In LogScale, how is an alert action related to an alert?',
    options: [
      'Actions are configured separately and can be attached to multiple alerts for reuse',
      'Each alert has exactly one dedicated action defined inline',
      'Actions are defined inside the CQL query using special syntax',
      'Actions are inherited from the repository settings and cannot be customised per alert',
    ],
    correctIndex: 0,
    explanation: 'LogScale separates the alert definition (query + trigger condition) from the action (what to do when triggered). A single action — such as a Slack webhook — can be attached to multiple alerts. This DRY approach means updating the webhook URL in one place updates all alerts that use it.',
    docTitle: 'LogScale Alerts and Actions',
    docUrl: 'https://library.humio.com/dashboards/alerts-actions.html',
  },
  {
    id: 'siem-det-actions-q3',
    text: 'Which LogScale template variable inserts the number of matching events into a webhook payload?',
    options: [
      '{result_count}',
      '{event_count}',
      '{match_count}',
      '{hits}',
    ],
    correctIndex: 0,
    explanation: '{result_count} is the LogScale template variable that inserts the number of events returned by the alert query into the webhook payload. Including it in alert notifications gives responders immediate context about the alert scale without requiring them to re-run the query.',
    docTitle: 'LogScale Webhook Payload Templates',
    docUrl: 'https://library.humio.com/dashboards/alerts-actions.html',
  },
  {
    id: 'siem-det-actions-q4',
    text: 'What is the correct approach before relying on a webhook action for production alerting?',
    options: [
      'Manually trigger the action from the LogScale UI to verify the payload is received correctly by the target system',
      'Enable the alert and wait for the first real trigger to validate delivery',
      'Check the LogScale system logs for action delivery confirmations',
      'Test using a curl command from the LogScale server CLI',
    ],
    correctIndex: 0,
    explanation: 'LogScale\'s action configuration UI includes a "Test" or manual trigger button. Always use it to send a test payload before enabling the alert in production. This verifies the webhook URL is reachable, the payload is valid JSON, and the receiving system interprets it correctly.',
    docTitle: 'LogScale Alert Testing',
    docUrl: 'https://library.humio.com/dashboards/alerts-actions.html',
  },
  {
    id: 'siem-det-actions-q5',
    text: 'Which of the following is a native LogScale action type that can trigger a SOAR workflow in CrowdStrike?',
    options: [
      'Falcon Fusion action',
      'SOAR webhook action',
      'CrowdStrike API action',
      'Fusion Trigger action',
    ],
    correctIndex: 0,
    explanation: 'LogScale has a native Falcon Fusion action type that directly invokes a Falcon Fusion SOAR workflow when an alert fires. This creates a tight integration between the SIEM detection layer and the SOAR response layer — a detection in LogScale can automatically launch a containment or enrichment playbook in Fusion.',
    docTitle: 'LogScale Falcon Fusion Integration',
    docUrl: 'https://falcon.crowdstrike.com/documentation/page/fusion-integration',
  },
]

export const alertActionsModule: ContentModule = {
  id: 'siem-detection-alert-actions',
  title: 'Alert Actions & Integrations',
  trackId: 'siem-detection',
  domainId: 'siem',
  order: 2,
  lastReviewed: '2026-08-17',
  concepts: alertActionsConcepts,
  quiz: alertActionsQuestions,
}

// ── Module 1.3.3: Threat Detection Patterns in CQL ───────────────────────────

const threatPatternsConcepts: ConceptSection[] = [
  {
    title: 'Threshold and Baseline Detection',
    body: 'The most common detection pattern is threshold-based: alert when a count exceeds a baseline. In LogScale CQL, this means aggregating events over a time window and filtering the result by count.\n\nBaseline detection requires establishing what "normal" looks like. Common approaches:\n- **Static threshold:** alert when count > N (N chosen from historical data)\n- **Rolling average comparison:** compare current window count to the average over the past N days\n- **Outlier detection:** use timeslice() to create a time series, then compare each bucket to neighbours\n\nFor static thresholds, start conservatively (high threshold to reduce false positives), then tune down as you validate the alert.',
    codeExample: '// Threshold detection: >50 DNS queries to a single external domain in 10 minutes\n// (potential DNS exfiltration or C2 beaconing)\n#event_simpleName = DnsRequest\n| DomainName != *.microsoft.com\n| DomainName != *.windows.com\n| groupBy([DomainName], function=count())\n| _count > 50',
    codeLanguage: 'cql',
  },
  {
    title: 'Correlation and Sequence Detection',
    body: 'Many threats require detecting a sequence of related events, not just a single anomaly. Examples:\n- Failed login followed by successful login from same IP (credential stuffing success)\n- Process creation of cmd.exe by a web server process (web shell)\n- Outbound connection immediately after a suspicious file write (malware callback)\n\nIn LogScale, sequence detection uses join() to correlate events across queries, or groupBy() across a time window to find the co-occurrence pattern. \n\nFor process hierarchy detection, CrowdStrike\'s ParentBaseFileName field links child to parent: filter on `#event_simpleName = ProcessRollup2 | ParentBaseFileName = w3wp.exe` to find all processes spawned by IIS.',
    codeExample: '// Detect cmd.exe spawned by web server processes (potential web shell)\n#event_simpleName = ProcessRollup2\n| FileName = cmd.exe\n| ParentBaseFileName = /w3wp.exe|httpd|nginx/',
    codeLanguage: 'cql',
  },
]

const threatPatternsQuestions: QuizQuestion[] = [
  {
    id: 'siem-det-threat-q1',
    text: 'Which CQL pattern is most appropriate for detecting a brute-force login attack (many failures from one source)?',
    options: [
      'groupBy([RemoteIP], function=count()) followed by a threshold filter on _count',
      'count() on all failed logins followed by an alert if total > threshold',
      'timeslice(1m) to bucket events by minute and alert on any non-empty minute',
      'join() between the failed login events and the user account table',
    ],
    correctIndex: 0,
    explanation: 'A brute-force attack is per-source — you need to count failures grouped by source IP (RemoteIP) and identify IPs exceeding your threshold. A global count() would catch distributed attacks but wouldn\'t identify the attacking IP. timeslice alone doesn\'t correlate by source.',
    docTitle: 'LogScale Detection Patterns',
    docUrl: 'https://library.humio.com/data-analysis/query-best-practices.html',
  },
  {
    id: 'siem-det-threat-q2',
    text: 'In CrowdStrike Falcon sensor data, which field identifies the parent process that spawned a child process?',
    options: [
      'ParentBaseFileName',
      'ParentProcess',
      'InitiatingProcess',
      'SourceProcess',
    ],
    correctIndex: 0,
    explanation: 'ParentBaseFileName contains the filename (without path) of the parent process that created the current process. This is the key field for detecting suspicious process hierarchies — such as Office spawning PowerShell, or a web server spawning cmd.exe.',
    docTitle: 'CrowdStrike Falcon Schema — Process Events',
    docUrl: 'https://falcon.crowdstrike.com/documentation/page/re77ca49/crowdstrike-schema-documentation',
  },
  {
    id: 'siem-det-threat-q3',
    text: 'What is the primary advantage of using a rolling baseline threshold over a static threshold for anomaly detection?',
    options: [
      'It adapts automatically to normal traffic fluctuations (e.g. weekly patterns), reducing false positives',
      'It is simpler to configure because no historical data analysis is required',
      'It guarantees zero false negatives — every attack will be detected',
      'It requires less compute than static threshold queries',
    ],
    correctIndex: 0,
    explanation: 'Static thresholds set during low-traffic periods may generate false positives during normal business peaks (Monday mornings, month-end reporting). Rolling baselines compare current activity to a recent historical average, automatically adjusting for normal patterns while still detecting genuine anomalies.',
    docTitle: 'LogScale Anomaly Detection Patterns',
    docUrl: 'https://library.humio.com/data-analysis/query-best-practices.html',
  },
  {
    id: 'siem-det-threat-q4',
    text: 'Which CQL query detects a possible DNS exfiltration pattern — more than 100 unique subdomains queried under the same root domain in 15 minutes?',
    options: [
      '#event_simpleName = DnsRequest | DomainName = *.attacker.com | count() > 100',
      '#event_simpleName = DnsRequest | groupBy([DomainName]) | _count > 100',
      '#event_simpleName = DnsRequest | regex("(?P<root>[^.]+\\.[^.]+)$", field=DomainName) | groupBy([root], function=count(as=queries)) | queries > 100',
      '#event_simpleName = DnsRequest | DnsQueryCount > 100',
    ],
    correctIndex: 2,
    explanation: 'DNS exfiltration typically uses many unique subdomains under one root domain (each subdomain encodes data). You need to extract the root domain from each DNS query, count unique subdomains per root, and threshold on that count. Option C does this: regex extracts the root, groupBy counts per root, and the filter applies the threshold. Option A only finds queries to a known bad domain — useless for unknown C2.',
    docTitle: 'DNS Exfiltration Detection',
    docUrl: 'https://library.humio.com/data-analysis/query-best-practices.html',
  },
  {
    id: 'siem-det-threat-q5',
    text: 'When tuning a new threat detection alert, what is the best initial approach to threshold setting?',
    options: [
      'Start with a high (conservative) threshold to minimise false positives, then lower it gradually based on validation',
      'Start with threshold = 1 to catch every potential instance, then raise it based on false positives',
      'Use the average event count from the past 7 days as the initial threshold',
      'Set the threshold based on CrowdStrike published benchmarks without customisation',
    ],
    correctIndex: 0,
    explanation: 'Threshold tuning is iterative. Starting high means the first alerts you receive are more likely to be genuine — giving you validated examples to review. As you confirm true positives and identify the real attack rates, you can lower the threshold to catch subtler variants. Starting at 1 generates alert storms that cause analysts to stop trusting the system.',
    docTitle: 'Alert Tuning Best Practices',
    docUrl: 'https://library.humio.com/dashboards/alerts-scheduled.html',
  },
]

export const threatPatternsModule: ContentModule = {
  id: 'siem-detection-threat-patterns',
  title: 'Threat Detection Patterns in CQL',
  trackId: 'siem-detection',
  domainId: 'siem',
  order: 3,
  lastReviewed: '2026-08-17',
  concepts: threatPatternsConcepts,
  quiz: threatPatternsQuestions,
}

// ── Track 1.3 Scenario ────────────────────────────────────────────────────────

const detectionScenario: Scenario = {
  id: 'siem-detection-scenario',
  title: 'Alert Triage: Separating Signal from Noise',
  context: 'Your SOC receives 200+ alerts per day from LogScale scheduled detections. Today, three alerts have fired simultaneously during a busy Monday morning. Your job is to triage them, determine which is the real incident, tune the false positives, and escalate appropriately — all within your SLA of 30 minutes per alert.',
  isCumulative: false,
  steps: [
    {
      id: 'siem-det-s1',
      narrative: 'Alert 1: "High Volume DNS Queries" has fired — 73 unique subdomains queried under the domain updates-cdn.net in 8 minutes from host WSUS-SRV-01. This is your Windows Server Update Services server. What is your first assessment step?',
      choices: [
        { text: 'Check whether updates-cdn.net is a known legitimate CDN/update service and whether WSUS-SRV-01 was running scheduled updates at that time' },
        { text: 'Immediately isolate WSUS-SRV-01 via Falcon Real Time Response — any mass DNS is suspicious' },
        { text: 'Increase the alert threshold to 200 so this does not fire again' },
        { text: 'Close the alert as a false positive without investigation since it came from a server, not a workstation' },
      ],
      correctChoiceIndex: 0,
      wrongConsequence: 'Isolating a WSUS server without verification could disrupt patching across your entire environment. Increasing the threshold blindly could allow future real C2 beaconing to go undetected. Dismissing server alerts is a dangerous habit — many APTs target servers specifically.',
      reasoning: 'Context is critical before any action. WSUS servers legitimately contact update CDNs with many subdomains. Check your change calendar for scheduled update windows, look up updates-cdn.net in threat intel, and review the DNS query content. If it matches a known update service, this is a tuning opportunity — not a threat.',
      docTitle: 'Alert Triage Best Practices',
      docUrl: 'https://falcon.crowdstrike.com/documentation/page/incident-response',
    },
    {
      id: 'siem-det-s2',
      narrative: 'After checking, updates-cdn.net is confirmed as a legitimate Microsoft WSUS CDN. You want to tune the alert so WSUS-SRV-01 does not trigger it in future. What is the correct tuning approach?',
      choices: [
        { text: 'Add an exclusion for WSUS-SRV-01 in the alert query: | ComputerName != WSUS-SRV-01' },
        { text: 'Delete the alert entirely since it generated a false positive' },
        { text: 'Raise the threshold from 100 to 500 to reduce sensitivity for all hosts' },
        { text: 'Change the schedule from every 5 minutes to every 60 minutes' },
      ],
      correctChoiceIndex: 0,
      wrongConsequence: 'Deleting the alert removes a valid detection capability. Raising the threshold for all hosts makes it harder to detect real exfiltration from workstations. Changing the schedule creates coverage gaps without fixing the root false-positive source.',
      reasoning: 'Scoped exclusions are the correct tuning approach. Adding | ComputerName != WSUS-SRV-01 keeps the detection active for all other hosts while suppressing known-good activity from the update server. Document the exclusion with a comment explaining why it was added.',
      docTitle: 'LogScale Alert Tuning',
      docUrl: 'https://library.humio.com/dashboards/alerts-scheduled.html',
    },
    {
      id: 'siem-det-s3',
      narrative: 'Alert 2: "PowerShell Encoded Command Execution" has fired on workstation LAPTOP-MKT-088. The alert detects PowerShell processes with "-EncodedCommand" in the command line — a technique used both by attackers and by some legitimate management tools. How do you determine if this is a threat?',
      choices: [
        { text: 'Run a CQL query to see the full decoded command and identify the parent process that launched PowerShell' },
        { text: 'Alert the user on LAPTOP-MKT-088 to ask if they ran PowerShell' },
        { text: 'Check if PowerShell is on the approved software list — if yes, close the alert' },
        { text: 'Escalate immediately to Tier 3 without further investigation' },
      ],
      correctChoiceIndex: 0,
      wrongConsequence: 'Asking the end user is unreliable — they may not know, and if it\'s an attack, the attacker has access. Simply checking if PowerShell is approved tells you nothing about this specific execution. Escalating without investigation wastes Tier 3 time and your triage SLA.',
      reasoning: 'The key investigative questions are: What did the encoded command actually do (decode it), and what launched PowerShell (parent process)? A Word document or browser spawning PowerShell is highly suspicious. svchost.exe or a management agent spawning PowerShell with a known-good encoded payload is probably legitimate.',
      docTitle: 'CrowdStrike Threat Hunting Guide',
      docUrl: 'https://falcon.crowdstrike.com/documentation/page/threat-hunting',
    },
    {
      id: 'siem-det-s4',
      narrative: 'Your CQL query reveals: PowerShell was spawned by winword.exe (Microsoft Word), and the decoded command downloads a file from an unknown external domain and executes it. This is confirmed malware. Alert 3 — a low-severity "Unusual Login Hours" for the same user — also just fired. What is the correct escalation sequence?',
      choices: [
        { text: 'Contain LAPTOP-MKT-088 via Falcon Real Time Response, escalate to Tier 3, and link Alert 3 as correlated evidence to the same incident' },
        { text: 'Handle Alert 3 first since it fired most recently, then address the malware alert' },
        { text: 'Wait to contain the host until Tier 3 reviews and approves — containment requires manager sign-off' },
        { text: 'Remediate the malware only (delete the downloaded file) without containing the host, then close both alerts' },
      ],
      correctChoiceIndex: 0,
      wrongConsequence: 'Handling the lower-severity alert first delays response to an active malware infection. Waiting for Tier 3 approval before containment allows the malware more dwell time. Remediating only the known file ignores potential persistence mechanisms, lateral movement, and C2 callbacks that may still be active.',
      reasoning: 'Word spawning PowerShell that downloads and executes an unknown file is a P1 indicator — contain immediately. Alert 3 (unusual login hours) for the same user is likely related — the attacker may have used the same credentials. All related alerts should be merged into one incident for unified investigation. Containment first, investigation after.',
      docTitle: 'CrowdStrike Incident Response',
      docUrl: 'https://falcon.crowdstrike.com/documentation/page/incident-response',
    },
    {
      id: 'siem-det-s5',
      narrative: 'The host is contained and the incident is escalated. After the incident, you review your alert stack to improve future detection. The PowerShell alert fired 47 seconds after the malicious execution. Your SLA target for detection is under 5 minutes. What change would REDUCE the detection gap further?',
      choices: [
        { text: 'Shorten the alert schedule interval (e.g., from every 5 minutes to every 1 minute) and keep the time window at 2 minutes' },
        { text: 'Increase the time window from 2 minutes to 30 minutes to catch more events per run' },
        { text: 'Add more alert actions (email + Slack + PagerDuty) so more people see the alert faster' },
        { text: 'Use a threshold of 0 events (fire on every query run even with no results) to guarantee the alert is always active' },
      ],
      correctChoiceIndex: 0,
      wrongConsequence: 'Increasing the time window means the alert looks further back in time — but this does not reduce how quickly it fires after the event occurs. Adding more action channels increases notification redundancy but doesn\'t change detection timing. Firing on 0 results floods analysts with empty alerts and trains them to ignore them.',
      reasoning: 'Detection gap is determined by the schedule interval — how often the query runs. If the schedule is every 5 minutes, the worst case gap is 5 minutes from event to alert. Reducing the interval to 1 minute cuts the maximum gap to 1 minute. The time window must stay >= interval to avoid coverage gaps — so if interval = 1 min, window = 2 min (slight overlap is fine).',
      docTitle: 'LogScale Alert Schedule Optimisation',
      docUrl: 'https://library.humio.com/dashboards/alerts-scheduled.html',
    },
  ],
}

// ── Track 1.3 Export ──────────────────────────────────────────────────────────

export const detectionTrack: ContentTrack = {
  id: 'siem-detection',
  title: 'Detection & Alerting',
  domainId: 'siem',
  order: 3,
  modules: [savedSearchesModule, alertActionsModule, threatPatternsModule],
  scenario: detectionScenario,
}
