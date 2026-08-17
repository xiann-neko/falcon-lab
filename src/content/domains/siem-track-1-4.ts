import type {
  ContentModule,
  ContentTrack,
  QuizQuestion,
  ConceptSection,
  Scenario,
} from '../types'

// ═══════════════════════════════════════════════════════════════════════════════
// Track 1.4 — Dashboards & Reporting
// ═══════════════════════════════════════════════════════════════════════════════

// ── Module 1.4.1: Building Dashboards ────────────────────────────────────────

const buildingDashboardsConcepts: ConceptSection[] = [
  {
    title: 'Dashboard Panels and Widget Types',
    body: 'A LogScale dashboard is a collection of panels, each visualising the result of a saved search. Panel types:\n\n- **Time chart:** plots a metric over time — ideal for trend analysis (e.g., events per hour)\n- **Bar chart / Pie chart:** shows proportional distribution (e.g., event count by severity)\n- **Single value (stat):** displays one number prominently — ideal for KPIs (e.g., "Active Alerts: 3")\n- **Table:** shows raw query results with sortable columns\n- **World map / Geo map:** plots IP addresses or geo-data on a map\n\nEach panel links to a saved search. The dashboard time picker sets the global time range; individual panels can override this.',
  },
  {
    title: 'Creating and Structuring Dashboards',
    body: 'To create a dashboard: navigate to Dashboards → New Dashboard. Add panels by selecting saved searches or writing inline queries. Drag panels to resize and rearrange them.\n\nDashboard design principles for SOC use:\n1. **Overview at the top:** KPI panels (total events, active alerts, severity breakdown) in the first row\n2. **Trend in the middle:** time-series charts showing activity over the current shift\n3. **Detail at the bottom:** tables with the most recent individual events for drill-down\n\nDashboard parameters (variables) let analysts filter the entire dashboard by a shared value — for example a ?hostname parameter that scopes all panels to one host.\n\nUse descriptive panel titles. Avoid "Query 1" — "Failed Logins per Hour (last 24h)" tells analysts what they are looking at.',
    codeExample: '// Saved search powering a "Failed Logins per Hour" time chart panel\n// Linked to a dashboard with timeslice set by the global time picker\n#event_simpleName = UserLogonFailed2\n| timeslice(1h)\n| groupBy([_bucket], function=count())',
    codeLanguage: 'cql',
  },
]

const buildingDashboardsQuestions: QuizQuestion[] = [
  {
    id: 'siem-dash-build-q1',
    text: 'Which LogScale dashboard panel type is best for displaying a single KPI number prominently (e.g. "Active Alerts: 3")?',
    options: [
      'Single value (stat) panel',
      'Time chart panel',
      'Table panel',
      'Bar chart panel',
    ],
    correctIndex: 0,
    explanation: 'Single value (stat) panels display one metric in large text — perfect for KPIs that analysts need to read at a glance. Pair them with conditional colouring (green/yellow/red thresholds) to add instant visual context.',
    docTitle: 'LogScale Dashboard Panels',
    docUrl: 'https://library.humio.com/dashboards/dashboards-widgets.html',
  },
  {
    id: 'siem-dash-build-q2',
    text: 'What is the recommended top-to-bottom structure for a SOC operational dashboard?',
    options: [
      'KPI summary panels → time-series trend charts → detailed event tables',
      'Detailed event tables → trend charts → KPI summary',
      'Alphabetically sorted panels with no specific ordering principle',
      'All panels the same size in a grid — visual hierarchy is not important',
    ],
    correctIndex: 0,
    explanation: 'The SOC dashboard should tell a story from high-level to low-level. Analysts scanning the dashboard should instantly see the overall health (KPIs), understand the trend (charts), then drill into specific events (tables) — all without scrolling back up to reorient.',
    docTitle: 'LogScale Dashboard Design',
    docUrl: 'https://library.humio.com/dashboards/dashboards-widgets.html',
  },
  {
    id: 'siem-dash-build-q3',
    text: 'How do dashboard parameters (variables) work in LogScale?',
    options: [
      'A shared ?variable in all panel queries that analysts can set once to filter the entire dashboard',
      'Parameters are only available in saved searches, not dashboards',
      'Each panel has its own independent time picker that overrides the dashboard time range',
      'Parameters require a separate API call to LogScale to evaluate before the dashboard loads',
    ],
    correctIndex: 0,
    explanation: 'Dashboard parameters use the same ?variable syntax as query parameters. When a dashboard has a parameter (e.g., ?hostname), every panel query that references ?hostname is scoped to the same value. Analysts can change the parameter from a dropdown without editing any individual panel query.',
    docTitle: 'LogScale Dashboard Parameters',
    docUrl: 'https://library.humio.com/dashboards/dashboards-parameters.html',
  },
  {
    id: 'siem-dash-build-q4',
    text: 'Which CQL function creates the time buckets needed for a time-series chart panel in LogScale?',
    options: [
      'timeslice()',
      'timeChart()',
      'bucket()',
      'groupByTime()',
    ],
    correctIndex: 0,
    explanation: 'timeslice() divides the query time range into equal-width time buckets (e.g., timeslice(1h) for hourly). The result field _bucket contains the bucket timestamp. groupBy([_bucket], function=count()) then counts events per bucket — which is exactly what a time chart panel needs to plot a line over time.',
    docTitle: 'CQL Functions — timeslice()',
    docUrl: 'https://library.humio.com/data-analysis/functions-timeslice.html',
  },
  {
    id: 'siem-dash-build-q5',
    text: 'What does a "Live" dashboard mode do in LogScale?',
    options: [
      'Automatically refreshes all panels at a set interval so the dashboard always shows current data',
      'Shares the dashboard to all users in real time without requiring a page reload',
      'Streams raw events to the dashboard without aggregation',
      'Locks the time range so it cannot be changed by other viewers',
    ],
    correctIndex: 0,
    explanation: 'Live mode sets the dashboard to auto-refresh every N seconds (configurable — typically 30s to 5 min). Each refresh re-runs all panel queries with the current time as the end of the time range. This keeps SOC operational dashboards current without manual intervention — analysts see live data as incidents evolve.',
    docTitle: 'LogScale Live Dashboards',
    docUrl: 'https://library.humio.com/dashboards/dashboards-live.html',
  },
]

export const buildingDashboardsModule: ContentModule = {
  id: 'siem-dashboards-building',
  title: 'Building Dashboards',
  trackId: 'siem-dashboards',
  domainId: 'siem',
  order: 1,
  lastReviewed: '2026-08-17',
  concepts: buildingDashboardsConcepts,
  quiz: buildingDashboardsQuestions,
}

// ── Module 1.4.2: Sharing, Permissions, and Governance ───────────────────────

const sharingGovernanceConcepts: ConceptSection[] = [
  {
    title: 'Dashboard Sharing and Access Control',
    body: 'LogScale controls dashboard visibility through roles and permissions at the repository/view level. A user who has read access to a view can see dashboards in that view. A user without repository access cannot see dashboards — even if given a direct link.\n\nSharing options:\n- **Within organisation:** share the dashboard URL — any authenticated user with view access can open it\n- **Embed in external portal:** dashboards can be embedded as iframes in other tools (with appropriate organisation-level settings enabled)\n- **Export to PDF/PNG:** dashboards can be exported as static reports for management distribution\n\nDashboards are mutable only by users with write permissions on the repository. Read-only users can view but not edit.',
  },
  {
    title: 'Saved Search Governance',
    body: 'Production saved searches and alerts require governance to stay accurate and trustworthy:\n\n- **Version comments:** use // comments to track change dates and authors inside the query\n- **Naming conventions:** prefix detection queries with "DET-" and investigation queries with "INV-" so they are discoverable by category\n- **Review cadence:** schedule quarterly reviews of all active alerts to validate thresholds are still appropriate\n- **Ownership:** assign each alert an owner — the analyst responsible for tuning and validating it\n- **Change control:** treat alert query changes like code changes — test in a dev repository before promoting to production\n\nUnowned alerts accumulate silently and generate false positives that erode analyst trust over time.',
  },
]

const sharingGovernanceQuestions: QuizQuestion[] = [
  {
    id: 'siem-dash-gov-q1',
    text: 'A LogScale dashboard is shared with an external auditor who does not have a user account in your LogScale organisation. Which access method allows them to view the dashboard?',
    options: [
      'Exporting the dashboard to PDF and sending the file — external users cannot access the live dashboard without an account',
      'Sharing the dashboard URL — all URLs are publicly accessible without authentication',
      'Creating a read-only guest account for the auditor in LogScale',
      'Using the embed iframe option — iframes bypass authentication',
    ],
    correctIndex: 0,
    explanation: 'LogScale dashboards require authentication. External users without organisation accounts cannot access live dashboards via URL. The correct approach for external sharing is to export to PDF or PNG — producing a static snapshot that can be distributed without granting system access. Guest/embed access may be available in specific configurations but requires explicit org-level setup.',
    docTitle: 'LogScale Dashboard Sharing',
    docUrl: 'https://library.humio.com/dashboards/dashboards-sharing.html',
  },
  {
    id: 'siem-dash-gov-q2',
    text: 'What is the recommended naming convention for detection-type saved searches to improve discoverability?',
    options: [
      'Prefix with "DET-" (e.g. "DET-Brute Force Login")',
      'Use the date of creation as a prefix (e.g. "2026-08-17 Brute Force")',
      'Name them after the MITRE ATT&CK technique (e.g. "T1110.001")',
      'No convention needed — LogScale search makes all queries findable',
    ],
    correctIndex: 0,
    explanation: 'Category prefixes (DET- for detections, INV- for investigations, REP- for reports) make large libraries of saved searches manageable. Analysts can filter by prefix to see only detection alerts or only investigation templates. MITRE technique codes are useful tags to ADD but not as the primary name — they are too cryptic for day-to-day use.',
    docTitle: 'LogScale Saved Search Governance',
    docUrl: 'https://library.humio.com/data-analysis/saved-queries.html',
  },
  {
    id: 'siem-dash-gov-q3',
    text: 'Which user permission level in LogScale can edit a dashboard?',
    options: [
      'Users with write (or higher) permissions on the repository containing the dashboard',
      'Any authenticated user in the organisation',
      'Only the creator of the dashboard',
      'Users with the "Dashboard Editor" global role',
    ],
    correctIndex: 0,
    explanation: 'Dashboard mutability follows repository permissions. Write permission on the repository allows dashboard creation and editing. Read-only users can view dashboards and run their panels but cannot change panel queries, layout, or settings. This prevents analysts from accidentally breaking shared dashboards.',
    docTitle: 'LogScale Repository Permissions',
    docUrl: 'https://library.humio.com/dashboards/dashboards-sharing.html',
  },
  {
    id: 'siem-dash-gov-q4',
    text: 'Why should production alert query changes be tested in a development repository before being applied to production?',
    options: [
      'To catch unintended false positives or missed detections before they affect the live alert stream',
      'LogScale requires all queries to pass a validation step in dev before promotion',
      'Dev repositories have faster query execution for testing',
      'Production repositories do not allow query editing during business hours',
    ],
    correctIndex: 0,
    explanation: 'An untested alert change could start generating alert storms (false positives) or silently stop detecting threats (false negatives) — both are dangerous in production. Testing in a dev repository with representative data validates the change is safe. Treat alert query changes like code changes: test, review, promote.',
    docTitle: 'Alert Change Management',
    docUrl: 'https://library.humio.com/dashboards/alerts-scheduled.html',
  },
  {
    id: 'siem-dash-gov-q5',
    text: 'What is the primary risk of allowing saved searches and alerts to accumulate without assigned owners?',
    options: [
      'Nobody validates or tunes them — they generate stale false positives that erode analyst trust in the alert system',
      'LogScale will automatically disable unowned alerts after 90 days',
      'Unowned searches consume more compute resources than owned ones',
      'They cannot be triggered manually without an owner account',
    ],
    correctIndex: 0,
    explanation: 'Ownerless alerts have no one responsible for tuning when they start generating false positives, validating their thresholds remain relevant, or updating them when the environment changes. Over time, analysts learn to ignore them — which is the most dangerous outcome. Every alert should have a named owner and a review schedule.',
    docTitle: 'SOC Alert Governance',
    docUrl: 'https://library.humio.com/dashboards/alerts-scheduled.html',
  },
]

export const sharingGovernanceModule: ContentModule = {
  id: 'siem-dashboards-sharing-governance',
  title: 'Sharing, Permissions & Governance',
  trackId: 'siem-dashboards',
  domainId: 'siem',
  order: 2,
  lastReviewed: '2026-08-17',
  concepts: sharingGovernanceConcepts,
  quiz: sharingGovernanceQuestions,
}

// ── Track 1.4 Scenario ────────────────────────────────────────────────────────

const dashboardsScenario: Scenario = {
  id: 'siem-dashboards-scenario',
  title: 'SOC Dashboard Review: Build, Fix, Govern',
  context: 'You are taking over as the new SOC Lead. Your predecessor left behind a LogScale environment with 3 dashboards and 22 saved alerts — but no documentation, no owners, and several analyst complaints about "useless alerts". Your task this week: audit the dashboard setup, fix the critical gaps, and establish basic governance.',
  isCumulative: false,
  steps: [
    {
      id: 'siem-dash-s1',
      narrative: 'Opening the main SOC Operations dashboard, you find every panel is labelled "Query 1", "Query 2", etc. with no descriptions. Analysts have to open each panel to understand what it shows. What is your first governance action?',
      choices: [
        { text: 'Rename all panels with descriptive titles that include the metric name and time window (e.g. "Failed Logins per Hour — Last 24h")' },
        { text: 'Delete all unlabelled panels and rebuild from scratch' },
        { text: 'Add a shared text panel at the top explaining what each number in the dashboard means' },
        { text: 'Leave the panel names as-is — experienced analysts know what the queries mean' },
      ],
      correctChoiceIndex: 0,
      wrongConsequence: 'Deleting panels loses useful detections embedded in the dashboard. A single text panel describing all other panels creates a maintenance burden and still requires analysts to cross-reference it. Relying on institutional knowledge is a single-point-of-failure — when those analysts leave, the knowledge goes with them.',
      reasoning: 'Descriptive panel titles are the fastest and most permanent fix — they make the dashboard self-documenting. Include the metric, the scope (hosts/users/domains), and the time window directly in the title. Future analysts onboarding will understand the dashboard without asking anyone.',
      docTitle: 'LogScale Dashboard Best Practices',
      docUrl: 'https://library.humio.com/dashboards/dashboards-widgets.html',
    },
    {
      id: 'siem-dash-s2',
      narrative: 'You audit the 22 saved alerts and find 8 with no assigned owner and no documentation. Six of those have been generating 10+ alerts per day for the past 3 months with no analyst response recorded — they are being silently ignored. What is the correct action?',
      choices: [
        { text: 'Investigate each alert\'s recent firings to determine if it is a legitimate detection or false positive, then either assign an owner + tune it, or disable it with a documented reason' },
        { text: 'Delete all 8 unowned alerts immediately to reduce alert volume' },
        { text: 'Assign all 8 alerts to the most junior analyst as a learning exercise' },
        { text: 'Increase the threshold on all 8 alerts by 10x to reduce firing frequency' },
      ],
      correctChoiceIndex: 0,
      wrongConsequence: 'Deleting alerts may remove genuine detections — you don\'t know yet which of the 8 are valuable. Assigning to a junior analyst without investigation context is unfair and unlikely to result in proper tuning. Raising thresholds blindly could allow real attacks to go undetected.',
      reasoning: 'Each unowned alert must be individually assessed before action. Review its recent firings: are they all the same benign pattern (clear false positive to be tuned/disabled) or are there genuine incidents buried in the noise (needs owner + tuning)? Document your decision for each — including why you kept or disabled it.',
      docTitle: 'Alert Governance',
      docUrl: 'https://library.humio.com/dashboards/alerts-scheduled.html',
    },
    {
      id: 'siem-dash-s3',
      narrative: 'One analyst complains that the "Weekly Threat Summary" dashboard used in management reports has wrong numbers — it shows last month\'s data instead of the current week. The time picker appears to be hardcoded. How do you fix this?',
      choices: [
        { text: 'Change the dashboard\'s default time range to "Last 7 days" (relative) instead of a hardcoded absolute date range, and enable the time picker for viewers to adjust' },
        { text: 'Export the dashboard data to CSV weekly and recreate the dashboard manually with the current week\'s data' },
        { text: 'Set up a weekly scheduled email that automatically sends the dashboard PDF' },
        { text: 'Create a new copy of the dashboard each week with the correct hardcoded dates' },
      ],
      correctChoiceIndex: 0,
      wrongConsequence: 'Manual CSV exports and weekly copies are error-prone, time-consuming, and create clutter. Scheduled email is a good supplementary feature but doesn\'t fix the root cause. The fix must address why the time range is wrong — hardcoded absolute dates always become stale.',
      reasoning: 'Dashboard time ranges should use relative references ("Last 7 days", "This week") rather than hardcoded absolute dates. Relative ranges always show the correct window without maintenance. For management reports, combine a relative time range with a scheduled PDF export for automated delivery.',
      docTitle: 'LogScale Dashboard Time Controls',
      docUrl: 'https://library.humio.com/dashboards/dashboards-parameters.html',
    },
    {
      id: 'siem-dash-s4',
      narrative: 'A new analyst joins your team. They need access to the SIEM repository to view the SOC dashboard and run investigation queries. They should NOT be able to edit alerts or dashboard panel queries. What permission level should you grant?',
      choices: [
        { text: 'Read permission on the SIEM repository — they can view dashboards and run queries but cannot edit saved searches or alerts' },
        { text: 'Write permission — they need write access to run queries in the search bar' },
        { text: 'Admin permission on the repository — this is required to view dashboards' },
        { text: 'No permission needed — dashboards are publicly visible to all organisation members by default' },
      ],
      correctChoiceIndex: 0,
      wrongConsequence: 'Write permission would allow the new analyst to edit or delete production saved searches and alerts — a governance risk. Admin is far too broad. Dashboards in LogScale are not public — they require repository access to view.',
      reasoning: 'Read permission grants everything needed for dashboard viewing and running ad-hoc queries in the search bar. Write access is only needed to create or modify saved searches, alerts, and dashboards. Follow the principle of least privilege: start with read, elevate to write only when the analyst demonstrates proficiency and has a specific need.',
      docTitle: 'LogScale Repository Permissions',
      docUrl: 'https://library.humio.com/dashboards/dashboards-sharing.html',
    },
    {
      id: 'siem-dash-s5',
      narrative: 'After two weeks, your governance changes are in place. You want to establish a quarterly alert review process. Which elements should every quarterly review cover?',
      choices: [
        { text: 'Alert firing rate (too many = needs tuning), missed true positives (too few over 90 days is suspicious), threshold relevance (environment may have changed), and owner confirmation' },
        { text: 'Only the alerts that fired more than 100 times — low-volume alerts are working correctly by definition' },
        { text: 'Review only the alerts created in the past quarter — older alerts are proven and do not need review' },
        { text: 'Run each alert manually once and confirm it does not fire on clean test data' },
      ],
      correctChoiceIndex: 0,
      wrongConsequence: 'Low-volume alerts are NOT automatically correct — they may have stopped firing because a data source changed, a field name was updated, or the detection logic no longer applies to your current environment. Older alerts are not immune to staleness. A single manual test on clean data doesn\'t validate the alert\'s threshold calibration.',
      reasoning: 'A quarterly review must examine both over-alerting (noisy alerts that analysts ignore) and under-alerting (silent alerts that may have broken). For each alert: check firing rate, check if any firings led to confirmed incidents, verify the data source is still feeding, and confirm the assigned owner is still responsible. Document and date-stamp each review.',
      docTitle: 'Alert Review Process',
      docUrl: 'https://library.humio.com/dashboards/alerts-scheduled.html',
    },
  ],
}

// ── Track 1.4 Export ──────────────────────────────────────────────────────────

export const dashboardsTrack: ContentTrack = {
  id: 'siem-dashboards',
  title: 'Dashboards & Reporting',
  domainId: 'siem',
  order: 4,
  modules: [buildingDashboardsModule, sharingGovernanceModule],
  scenario: dashboardsScenario,
}
