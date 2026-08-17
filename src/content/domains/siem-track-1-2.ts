import type {
  ContentModule,
  ContentTrack,
  QuizQuestion,
  ConceptSection,
  CqlChallenge,
  Scenario,
} from '../types'

// ═══════════════════════════════════════════════════════════════════════════════
// Track 1.2 — CQL (CrowdStrike Query Language)
// ═══════════════════════════════════════════════════════════════════════════════

// ── Module 1.2.1: Basic Search & Filtering ────────────────────────────────────

const basicSearchConcepts: ConceptSection[] = [
  {
    title: 'The CQL Pipeline Model',
    body: 'CrowdStrike Query Language (CQL) uses a pipeline model: data flows from left to right through stages separated by the pipe character `|`. Each stage receives the output of the previous stage and passes its own output to the next.\n\nA query starts implicitly from all events in the selected time range. Field filters narrow the event set: `field = value` keeps only matching events. `head(N)` keeps the first N events; `tail(N)` keeps the last N. `select([field1, field2])` keeps only the named fields.\n\nExample — find the 10 most recent failed logins:\n```\nstatus = failed | head(10)\n```',
    codeExample: '// Find failed authentication events and limit to 100\n#event_simpleName = UserLogonFailed2\n| head(100)',
    codeLanguage: 'cql',
  },
  {
    title: 'Field Comparisons and Text Search',
    body: 'Comparison operators: `=` (equals), `!=` (not equals), `>`, `<`, `>=`, `<=`. Field names are case-sensitive. String values are case-insensitive by default.\n\nWildcard matching: use `*` to match any sequence of characters within a value. Example: `ComputerName = WIN-*` matches any hostname starting with "WIN-".\n\nBare keywords (no field name) perform a full-text search across all fields. Example: `powershell` finds any event containing that word anywhere.\n\nTo use regular expressions, chain `| regex("pattern")` (searches all fields) or `| regex("pattern", field=FieldName)` (searches a specific field).',
    codeExample: '// Find events involving PowerShell on Windows hosts\n#event_simpleName = ProcessRollup2\n| ImageFileName = *powershell*\n| ComputerName = WIN-*',
    codeLanguage: 'cql',
  },
]

const basicSearchQuestions: QuizQuestion[] = [
  {
    id: 'siem-cql-basic-q1',
    text: 'In CQL, what character separates pipeline stages?',
    options: ['|  (pipe)', '&  (ampersand)', '>>  (redirect)', ';  (semicolon)'],
    correctIndex: 0,
    explanation: 'CQL uses the pipe character | to chain operations, similar to Unix shell pipelines. Each stage receives the output of the previous stage as its input.',
    docTitle: 'CQL Syntax Overview',
    docUrl: 'https://library.humio.com/data-analysis/syntax.html',
  },
  {
    id: 'siem-cql-basic-q2',
    text: 'Which CQL operator keeps only events where a field does NOT match a value?',
    options: ['!=', '<>', 'NOT =', '!=='],
    correctIndex: 0,
    explanation: 'The != operator is the "not equals" comparator in CQL. It filters out events where the named field matches the specified value, keeping only those where it does not.',
    docTitle: 'CQL Filtering',
    docUrl: 'https://library.humio.com/data-analysis/filtering.html',
  },
  {
    id: 'siem-cql-basic-q3',
    text: 'How does LogScale handle case sensitivity for string field values by default?',
    options: [
      'String values are case-insensitive (WIN-PC01 matches win-pc01)',
      'String values are case-sensitive (WIN-PC01 does NOT match win-pc01)',
      'Field names are case-insensitive',
      'All comparisons are case-sensitive',
    ],
    correctIndex: 0,
    explanation: 'By default, string value comparisons in LogScale are case-insensitive. This simplifies querying real-world log data where casing may vary. Field names themselves are always case-sensitive.',
    docTitle: 'CQL Filtering — Case Sensitivity',
    docUrl: 'https://library.humio.com/data-analysis/filtering.html',
  },
  {
    id: 'siem-cql-basic-q4',
    text: 'Which CQL function limits the result set to the first N events?',
    options: ['head(N)', 'limit(N)', 'top(N)', 'first(N)'],
    correctIndex: 0,
    explanation: 'The head(N) function keeps only the first N events from the pipeline — useful during query development to avoid processing millions of results. tail(N) is the complementary function that keeps the last N events.',
    docTitle: 'CQL Functions — head()',
    docUrl: 'https://library.humio.com/data-analysis/functions-head.html',
  },
  {
    id: 'siem-cql-basic-q5',
    text: 'In LogScale CQL, tag fields (such as #event_simpleName) are searched faster than regular fields because:',
    options: [
      'They are indexed at ingest time, allowing direct lookup without full scan',
      'They are stored in memory rather than on disk',
      'They use a different compression algorithm',
      'They contain pre-computed aggregations',
    ],
    correctIndex: 0,
    explanation: 'Fields prefixed with # are "tags" in LogScale. Tags are indexed at ingest time, meaning LogScale builds a lookup structure that makes tag-based filters very fast — it can jump directly to matching events without scanning every row. Always lead queries with tag filters when possible.',
    docTitle: 'LogScale Tags and Indexing',
    docUrl: 'https://library.humio.com/data-analysis/tags.html',
  },
]

export const basicSearchModule: ContentModule = {
  id: 'siem-cql-basic-search',
  title: 'Basic Search & Filtering',
  trackId: 'siem-cql',
  domainId: 'siem',
  order: 1,
  lastReviewed: '2026-08-17',
  concepts: basicSearchConcepts,
  quiz: basicSearchQuestions,
}

// ── Module 1.2.2: Aggregation Functions ──────────────────────────────────────

const aggregationConcepts: ConceptSection[] = [
  {
    title: 'Counting and Grouping',
    body: 'Aggregation functions collapse many events into summary statistics. `count()` returns the total number of events matching the query. `groupBy([field])` groups events by the values of one or more fields — similar to SQL GROUP BY. The result is one row per unique group.\n\nCombining groupBy with count is the most common aggregation pattern: group by a field, count events per group, then sort to find the top offenders.\n\n`timeslice(1h)` buckets events into time windows (e.g., hourly). Used with groupBy it creates time-series data for trending.',
    codeExample: '// Top 10 source IPs by failed login count (last 24h)\n#event_simpleName = UserLogonFailed2\n| groupBy([RemoteIP], function=count())\n| sort(field=_count, order=desc)\n| head(10)',
    codeLanguage: 'cql',
  },
  {
    title: 'Statistical Aggregation Functions',
    body: '`avg(field)` — arithmetic mean of a numeric field\n`sum(field)` — sum of all values\n`max(field)` — maximum value\n`min(field)` — minimum value\n`percentile(field=myField, percentile=95)` — Nth percentile\n\nThese functions can be used standalone or combined inside `groupBy` using the `function=` parameter. Multiple functions can be combined with an array: `function=[count(), avg(BytesIn)]`.',
    codeExample: '// Average and max bytes transferred, grouped by destination\n#event_simpleName = NetworkConnectIP4\n| groupBy([RemoteIP], function=[count(), avg(BytesWritten), max(BytesWritten)])',
    codeLanguage: 'cql',
  },
]

const aggregationQuestions: QuizQuestion[] = [
  {
    id: 'siem-cql-agg-q1',
    text: 'Which CQL function returns the total number of events in the current result set?',
    options: ['count()', 'sum()', 'total()', 'aggregate()'],
    correctIndex: 0,
    explanation: 'count() is the primary counting function in LogScale CQL. It returns the number of events passing through that point in the pipeline. The result is stored in an auto-created field named _count.',
    docTitle: 'CQL Aggregation Functions — count()',
    docUrl: 'https://library.humio.com/data-analysis/functions-count.html',
  },
  {
    id: 'siem-cql-agg-q2',
    text: 'How do you group results by a field named "source_ip" and count events per group?',
    options: [
      'groupBy([source_ip], function=count())',
      'group(source_ip) | count()',
      'GROUP BY source_ip | count()',
      'aggregate([source_ip], count)',
    ],
    correctIndex: 0,
    explanation: 'The correct syntax is groupBy([fieldName], function=aggregateFunction()). Field names are passed as an array. The function= parameter specifies what to compute per group — in this case count().',
    docTitle: 'CQL Aggregation — groupBy()',
    docUrl: 'https://library.humio.com/data-analysis/functions-groupby.html',
  },
  {
    id: 'siem-cql-agg-q3',
    text: 'Which CQL function divides events into fixed-width time buckets for trend analysis?',
    options: ['timeslice()', 'timeGroup()', 'bucket()', 'interval()'],
    correctIndex: 0,
    explanation: 'timeslice() splits the time range into equal-width buckets (e.g., timeslice(1h) creates hourly buckets). Combined with groupBy([_bucket]), it produces time-series data ideal for charts showing how a metric changes over time.',
    docTitle: 'CQL Functions — timeslice()',
    docUrl: 'https://library.humio.com/data-analysis/functions-timeslice.html',
  },
  {
    id: 'siem-cql-agg-q4',
    text: 'What CQL expression calculates the 95th percentile of a field named "ResponseTimeMs"?',
    options: [
      'percentile(field=ResponseTimeMs, percentile=95)',
      'p95(ResponseTimeMs)',
      'quantile(ResponseTimeMs, 0.95)',
      'pct(ResponseTimeMs, 95)',
    ],
    correctIndex: 0,
    explanation: 'LogScale uses percentile(field=fieldName, percentile=N) where N is 0–100. The 95th percentile is commonly used for SLA monitoring — if p95 response time exceeds your SLA threshold, 5% of requests are breaching it.',
    docTitle: 'CQL Functions — percentile()',
    docUrl: 'https://library.humio.com/data-analysis/functions-percentile.html',
  },
  {
    id: 'siem-cql-agg-q5',
    text: 'How do you compute BOTH the count and average of "BytesWritten" per destination IP in a single groupBy?',
    options: [
      'groupBy([RemoteIP], function=[count(), avg(BytesWritten)])',
      'groupBy([RemoteIP]) | count() | avg(BytesWritten)',
      'groupBy([RemoteIP], count=true, avg=BytesWritten)',
      'count() | avg(BytesWritten) | groupBy([RemoteIP])',
    ],
    correctIndex: 0,
    explanation: 'Multiple aggregation functions can be passed to groupBy as an array: function=[count(), avg(BytesWritten)]. This computes all aggregations in a single pass, which is more efficient than chaining separate groupBy calls.',
    docTitle: 'CQL Aggregation — Multiple Functions',
    docUrl: 'https://library.humio.com/data-analysis/functions-groupby.html',
  },
]

export const aggregationModule: ContentModule = {
  id: 'siem-cql-aggregations',
  title: 'Aggregation Functions',
  trackId: 'siem-cql',
  domainId: 'siem',
  order: 2,
  lastReviewed: '2026-08-17',
  concepts: aggregationConcepts,
  quiz: aggregationQuestions,
}

// ── Module 1.2.3: Advanced Functions ─────────────────────────────────────────

const advancedFunctionsConcepts: ConceptSection[] = [
  {
    title: 'Regex, Format, and String Manipulation',
    body: '`regex("pattern")` filters events matching a regular expression (Perl-compatible, PCRE2). Add `field=FieldName` to scope the regex to one field, otherwise it searches the raw event line.\n\n`format(format="%s_%s", field=[Field1, Field2], as=NewField)` creates a new field by formatting existing ones using printf-style templates — useful for building composite keys or normalising values.\n\n`replace(regex="pattern", with="replacement", field=FieldName)` performs regex substitution in-place.\n\n`splitString(by=",", field=csvField, as=items)` splits a delimited string into an array of values that can be further processed.',
    codeExample: '// Extract username from "DOMAIN\\\\user" format and create a normalised field\n#event_simpleName = UserLogon\n| regex("^(?P<domain>[^\\\\\\\\]+)\\\\\\\\(?P<user>.+)$", field=UserName)\n| format(format="%s@internal", field=[user], as=NormalisedUser)',
    codeLanguage: 'cql',
  },
  {
    title: 'Lookup Tables and Joins',
    body: '`lookup(file="tableName.csv", field=localField, key=csvKeyColumn)` enriches events from a static CSV lookup table. LogScale stores lookup files in the repository. This is efficient for static reference data like asset inventories, threat intelligence lists, or user directories.\n\n`join({subquery}, field=[sharedField], mode=inner)` merges two live query result sets at query time. Join is more powerful than lookup but more expensive — use it when the enrichment data is dynamic (changes frequently) or must be computed from another LogScale query.',
    codeExample: '// Enrich network events with hostname from asset inventory lookup\n#event_simpleName = NetworkConnectIP4\n| lookup(file="asset_inventory.csv", field=LocalIP, key=ip_address)\n| table([LocalIP, hostname, department, RemoteIP, RemotePort])',
    codeLanguage: 'cql',
  },
]

const advancedFunctionsQuestions: QuizQuestion[] = [
  {
    id: 'siem-cql-adv-q1',
    text: 'Which CQL function filters events using a regular expression pattern?',
    options: ['regex()', 'match()', 'grep()', 'like()'],
    correctIndex: 0,
    explanation: 'regex() applies a PCRE2-compatible regular expression. Without a field= argument, it searches the entire raw event text. With field=FieldName, it restricts the search to that field. Capture groups using (?P<name>) automatically create named fields.',
    docTitle: 'CQL Functions — regex()',
    docUrl: 'https://library.humio.com/data-analysis/functions-regex.html',
  },
  {
    id: 'siem-cql-adv-q2',
    text: 'What does the LogScale format() function do?',
    options: [
      'Creates a new field by combining existing fields using a printf-style template',
      'Reformats a timestamp to ISO 8601',
      'Converts a number to a human-readable string (e.g. "1.2 GB")',
      'Normalises all field names to lowercase',
    ],
    correctIndex: 0,
    explanation: 'format() builds a new string field from existing fields using a C printf-style format string. The field= parameter lists source fields (in order), and as= names the output. Example: format(format="%s:%d", field=[hostname, port], as=endpoint) produces "webserver01:443".',
    docTitle: 'CQL Functions — format()',
    docUrl: 'https://library.humio.com/data-analysis/functions-format.html',
  },
  {
    id: 'siem-cql-adv-q3',
    text: 'When should you prefer lookup() over join() for data enrichment?',
    options: [
      'When the enrichment data is static and stored in a CSV file (e.g. an asset inventory)',
      'When the enrichment data changes frequently and must be computed from a live query',
      'When you need to enrich more than 1000 events per second',
      'When the enrichment requires arithmetic calculations',
    ],
    correctIndex: 0,
    explanation: 'lookup() reads from a static CSV file stored in LogScale — ideal for reference data that changes infrequently (asset inventory, known-bad IP lists, user directories). join() runs a subquery at search time for dynamic enrichment but is significantly more expensive. Choose lookup() for performance whenever the data can be preloaded.',
    docTitle: 'CQL Functions — lookup()',
    docUrl: 'https://library.humio.com/data-analysis/functions-lookup.html',
  },
  {
    id: 'siem-cql-adv-q4',
    text: 'Which CQL function replaces text within a field using a regex pattern?',
    options: [
      'replace(regex="pattern", with="replacement", field=FieldName)',
      'substitute(field=FieldName, from="pattern", to="replacement")',
      'sed(field=FieldName, expr="s/pattern/replacement/")',
      'update(field=FieldName, regex="pattern", value="replacement")',
    ],
    correctIndex: 0,
    explanation: 'replace() performs in-place regex substitution on a field. The regex= parameter is a PCRE2 pattern, with= is the replacement string (supports capture group references like \\1), and field= names the field to modify. The field is updated with the result.',
    docTitle: 'CQL Functions — replace()',
    docUrl: 'https://library.humio.com/data-analysis/functions-replace.html',
  },
  {
    id: 'siem-cql-adv-q5',
    text: 'How does join() differ from lookup() in LogScale CQL?',
    options: [
      'join() merges two live query result sets at search time; lookup() reads from a pre-stored CSV file',
      'join() is faster than lookup() because it runs in parallel',
      'lookup() supports wildcards; join() only supports exact field matches',
      'join() is used for time-series data; lookup() is for event data',
    ],
    correctIndex: 0,
    explanation: 'The key distinction: lookup() reads a static CSV file that was uploaded to the LogScale repository ahead of time. join() runs a second CQL query (the subquery inside {}) at search time and merges the results. join() is more powerful but more expensive — it runs two full queries and then correlates them.',
    docTitle: 'CQL Functions — join()',
    docUrl: 'https://library.humio.com/data-analysis/functions-join.html',
  },
]

export const advancedFunctionsModule: ContentModule = {
  id: 'siem-cql-advanced-functions',
  title: 'Advanced Functions',
  trackId: 'siem-cql',
  domainId: 'siem',
  order: 3,
  lastReviewed: '2026-08-17',
  concepts: advancedFunctionsConcepts,
  quiz: advancedFunctionsQuestions,
}

// ── Module 1.2.4: Writing Production-Grade Queries (with CQL Challenge) ───────

const productionQueriesConcepts: ConceptSection[] = [
  {
    title: 'Query Optimisation Principles',
    body: 'Performance in LogScale is determined by how much data each stage must process. The golden rule: **filter early, aggregate late**. Place tag filters (`#field = value`) first — tags are indexed and skip non-matching events without reading field data. Follow with field filters, then transformations, then aggregations.\n\nAvoid `regex()` and `join()` on large unfiltered datasets — they scan every event. Always pre-filter to a specific `#event_simpleName` or time range before applying expensive operations.\n\nUse `head()` during development to cap results and speed up iteration. Remove it before saving a production query.',
    codeExample: '// SLOW — regex runs on all events, then filters\n*\n| regex("powershell", field=ImageFileName)\n| #event_simpleName = ProcessRollup2\n\n// FAST — indexed tag filter first, then regex on reduced set\n#event_simpleName = ProcessRollup2\n| regex("powershell", field=ImageFileName)',
    codeLanguage: 'cql',
  },
  {
    title: 'Saved Searches and Query Parameters',
    body: 'Save a query in LogScale by clicking "Save search" in the search UI. Saved searches can be scheduled as alerts. Add a description and tags so other analysts can discover and reuse them.\n\nQuery parameters (written as `?paramName`) make saved queries reusable templates. Example: `#event_simpleName = ProcessRollup2 | UserName = ?user` — when run, LogScale prompts for the value of `user`. Parameters can have default values: `?user := "admin"`.\n\nUse `//` for comments in saved queries to document what a query does, why it exists, and what threshold values mean.',
    codeExample: '// Saved query: Logins from a specific user — accepts ?username parameter\n// Purpose: Investigate authentication activity for a named user\n// Author: SOC Tier 2 — updated 2026-08-17\n#event_simpleName = UserLogon\n| UserName = ?username\n| groupBy([ComputerName, RemoteIP], function=count())\n| sort(field=_count, order=desc)',
    codeLanguage: 'cql',
  },
]

const cqlChallenge: CqlChallenge = {
  type: 'cql',
  id: 'siem-cql-challenge-brute-force',
  prompt: 'Write a CQL query that detects potential brute-force login attempts: find all source IPs (RemoteIP) with more than 10 failed authentication events, sorted by failure count descending. Use the indexed tag filter first for performance.',
  scenario: 'A P2 incident has been raised for unusual authentication activity. You must quickly identify which external IPs are generating excessive failed logins — a pattern consistent with brute-force or credential-stuffing attacks against your Falcon-protected endpoints.',
  requiredComponents: [
    '#event_simpleName = UserLogonFailed2',
    'groupBy',
    'RemoteIP',
    'count()',
    'sort',
  ],
  modelAnswer: '#event_simpleName = UserLogonFailed2\n| groupBy([RemoteIP], function=count())\n| _count > 10\n| sort(field=_count, order=desc)',
  componentExplanations: {
    '#event_simpleName = UserLogonFailed2': 'The indexed tag filter must come first. #event_simpleName is a tag field that LogScale indexes at ingest — filtering on it avoids scanning non-authentication events entirely.',
    'groupBy': 'groupBy([RemoteIP], function=count()) aggregates all failed events per source IP, producing one row per unique IP with its failure count in _count.',
    'RemoteIP': 'RemoteIP is the CrowdStrike field for the source IP address of a network authentication event. It must be included in the groupBy field list.',
    'count()': 'count() computes the number of events per group. The result is stored in _count, which can then be filtered and sorted.',
    'sort': 'sort(field=_count, order=desc) orders results highest-to-lowest failure count, putting the most aggressive source IPs at the top of the list.',
  },
}

const productionQueriesQuestions: QuizQuestion[] = [
  {
    id: 'siem-cql-prod-q1',
    text: 'For maximum performance in LogScale CQL, where should tag field filters (#field) be placed?',
    options: [
      'At the very beginning of the query pipeline, before all other operations',
      'At the end, after aggregations complete',
      'Tag filters have no impact on query position — LogScale optimises automatically',
      'After regex() operations, which must always come first',
    ],
    correctIndex: 0,
    explanation: 'Tag fields are indexed at ingest. Placing a tag filter first lets LogScale skip non-matching events entirely without reading their field data. This can reduce the dataset by orders of magnitude before any expensive operations run.',
    docTitle: 'LogScale Query Performance',
    docUrl: 'https://library.humio.com/data-analysis/query-performance.html',
  },
  {
    id: 'siem-cql-prod-q2',
    text: 'Which CQL syntax adds a comment to a saved query?',
    options: ['// comment text', '# comment text', '/* comment text */', '-- comment text'],
    correctIndex: 0,
    explanation: 'LogScale CQL uses // for single-line comments. Comments are preserved in saved searches. Best practice: include the query purpose, author, last-updated date, and explanation of any threshold values (e.g., "// >10 failures chosen based on baseline analysis in Sept 2026").',
    docTitle: 'CQL Saved Searches',
    docUrl: 'https://library.humio.com/data-analysis/saved-queries.html',
  },
  {
    id: 'siem-cql-prod-q3',
    text: 'How do you define a reusable query parameter named "hostname" with a default value of "WIN-DC01" in a LogScale saved search?',
    options: [
      '?hostname := "WIN-DC01"  used in the query where the parameter appears',
      '${hostname = WIN-DC01}',
      '@hostname = "WIN-DC01"',
      '$param(hostname, default=WIN-DC01)',
    ],
    correctIndex: 0,
    explanation: 'LogScale query parameters use ?name syntax. To set a default value: ?paramName := "defaultValue". When the saved search runs, analysts can override the default. Parameters make saved searches reusable without editing the query text.',
    docTitle: 'CQL Query Parameters',
    docUrl: 'https://library.humio.com/data-analysis/query-parameters.html',
  },
  {
    id: 'siem-cql-prod-q4',
    text: 'Which function should be removed from a query before saving it for production use?',
    options: [
      'head(N) — used to cap result size during development iterations',
      'sort() — ordering is only needed during testing',
      'groupBy() — aggregation is always recalculated in production',
      'regex() — regular expressions are too slow for production',
    ],
    correctIndex: 0,
    explanation: 'head() is a development convenience: it limits results to the first N events, making queries faster to test. In production, you usually want all matching results. Always review saved searches for stray head() calls that would silently truncate alert or dashboard data.',
    docTitle: 'CQL Best Practices',
    docUrl: 'https://library.humio.com/data-analysis/query-best-practices.html',
  },
  {
    id: 'siem-cql-prod-q5',
    text: 'You need to find all events where "ImageFileName" matches either "powershell.exe" OR "cmd.exe". Which CQL expression is correct?',
    options: [
      'ImageFileName = /powershell.exe|cmd.exe/',
      'ImageFileName = powershell.exe OR ImageFileName = cmd.exe',
      'ImageFileName in ["powershell.exe", "cmd.exe"]',
      'match(field=ImageFileName, values=[powershell.exe, cmd.exe])',
    ],
    correctIndex: 0,
    explanation: 'LogScale supports regex literals using /pattern/ syntax directly in field comparisons. The alternation | inside the regex matches either option. This is more concise than multiple OR conditions and compiles to a single regex evaluation.',
    docTitle: 'CQL Filtering — Regex in Comparisons',
    docUrl: 'https://library.humio.com/data-analysis/filtering.html',
  },
]

export const productionQueriesModule: ContentModule = {
  id: 'siem-cql-production-queries',
  title: 'Writing Production-Grade Queries',
  trackId: 'siem-cql',
  domainId: 'siem',
  order: 4,
  lastReviewed: '2026-08-17',
  concepts: productionQueriesConcepts,
  quiz: productionQueriesQuestions,
  challenge: cqlChallenge,
}

// ── Track 1.2 Scenario ────────────────────────────────────────────────────────

const cqlScenario: Scenario = {
  id: 'siem-cql-scenario',
  title: 'CQL Threat Hunt: Lateral Movement Investigation',
  context: 'A threat intelligence tip has come in: a known credential-stuffing campaign is targeting CrowdStrike-protected environments in your sector. Your SOC manager has assigned you 45 minutes to determine whether your organisation is affected. Your primary tool is LogScale. You have full query access to all repositories.',
  isCumulative: false,
  steps: [
    {
      id: 'siem-cql-s1',
      narrative: 'You start by assessing the scope. You need to find all failed authentications in the past 24 hours and count them. Which query gives you the correct total count efficiently?',
      choices: [
        { text: '#event_simpleName = UserLogonFailed2 | count()' },
        { text: 'AuthResult = Failed | count()' },
        { text: 'status = failed | EventType = authentication | count()' },
        { text: 'UserLogonFailed2 | count()' },
      ],
      correctChoiceIndex: 0,
      wrongConsequence: 'Your query either uses wrong field names that return 0 results, or misses the indexed tag filter — making the search much slower than it needs to be on a 24-hour dataset.',
      reasoning: 'Starting with the indexed tag #event_simpleName = UserLogonFailed2 is correct. The # prefix tells LogScale this is an index field — it can skip billions of non-matching events instantly. count() then returns the total. "AuthResult = Failed" uses a non-standard field name and won\'t match CrowdStrike events.',
      docTitle: 'CrowdStrike Falcon Event Schema',
      docUrl: 'https://falcon.crowdstrike.com/documentation/page/re77ca49/crowdstrike-schema-documentation',
    },
    {
      id: 'siem-cql-s2',
      narrative: 'Your query returns 1,247 failed logins from 38 unique source IPs over 24 hours. Now you need to identify which IPs have more than 20 failures — a threshold consistent with automated brute-forcing. Which query is correct?',
      choices: [
        { text: '#event_simpleName = UserLogonFailed2 | groupBy([RemoteIP], function=count()) | _count > 20' },
        { text: '#event_simpleName = UserLogonFailed2 | count() > 20 | groupBy([RemoteIP])' },
        { text: '#event_simpleName = UserLogonFailed2 | where(count() > 20) | groupBy([RemoteIP])' },
        { text: '#event_simpleName = UserLogonFailed2 | RemoteIP.count > 20' },
      ],
      correctChoiceIndex: 0,
      wrongConsequence: 'The incorrect queries either filter before aggregation (so the per-IP counts are never computed), use where() on an aggregation result (invalid — where() applies per-event, not per-group), or use invalid syntax.',
      reasoning: 'The correct order is: filter (tag) → aggregate (groupBy with count) → post-aggregate filter (_count > 20). The _count field is created by count() inside groupBy. You cannot filter on _count before it is computed.',
      docTitle: 'CQL Aggregation — groupBy()',
      docUrl: 'https://library.humio.com/data-analysis/functions-groupby.html',
    },
    {
      id: 'siem-cql-s3',
      narrative: 'Three IPs exceed 20 failures. For one of them (198.51.100.47) you notice there are also SUCCESSFUL logins after the failures — possible compromise. You need to find which usernames logged in successfully from that IP after failing. Which approach is correct?',
      choices: [
        { text: 'Run two separate queries: one for UserLogonFailed2 from that IP, one for UserLogon from that IP, then compare the UserName lists manually or with join()' },
        { text: '#event_simpleName = UserLogonFailed2 AND UserLogon | RemoteIP = 198.51.100.47 | groupBy([UserName])' },
        { text: '#event_simpleName = UserLogon | RemoteIP = 198.51.100.47 | status = successful' },
        { text: 'RemoteIP = 198.51.100.47 | EventType in [UserLogon, UserLogonFailed2] | pivot([EventType])' },
      ],
      correctChoiceIndex: 0,
      wrongConsequence: 'Using AND between two event names is invalid CQL syntax. Querying only successful logins from the IP does not prove they were preceded by failures — it misses the correlation. The pivot syntax does not exist in LogScale.',
      reasoning: 'To correlate failed then successful logins, you need to find usernames that appear in both event types for that IP. The correct approach is to query each event type separately and then join on UserName, or to review both lists side-by-side. join() in CQL can automate this correlation.',
      docTitle: 'CQL Functions — join()',
      docUrl: 'https://library.humio.com/data-analysis/functions-join.html',
    },
    {
      id: 'siem-cql-s4',
      narrative: 'You confirm that the account "svc_backup" logged in successfully from 198.51.100.47 after 34 failed attempts. To detect lateral movement, you now query how many distinct hosts this account authenticated to in the last 2 hours. Which query is correct?',
      choices: [
        { text: '#event_simpleName = UserLogon | UserName = svc_backup | groupBy([ComputerName]) | count()' },
        { text: '#event_simpleName = UserLogon | UserName = svc_backup | count()' },
        { text: '#event_simpleName = UserLogon | UserName = svc_backup | distinct(ComputerName)' },
        { text: '#event_simpleName = UserLogon | UserName = svc_backup | select([ComputerName]) | unique()' },
      ],
      correctChoiceIndex: 0,
      wrongConsequence: 'count() alone tells you how many login events occurred — not how many unique hosts. distinct() and unique() are not standard LogScale aggregate functions. groupBy([ComputerName]) is the correct way to get one row per destination host.',
      reasoning: 'groupBy([ComputerName]) groups all logins by destination host, giving one result row per unique host with the event count in _count. This tells you both WHICH hosts were accessed and HOW MANY times. If _count rows > 4 in 2 hours for a service account, that is a strong lateral movement indicator.',
      docTitle: 'CQL Aggregation',
      docUrl: 'https://library.humio.com/data-analysis/functions-groupby.html',
    },
    {
      id: 'siem-cql-s5',
      narrative: 'Your query shows svc_backup authenticated to 9 hosts in 90 minutes — far beyond its normal pattern (1 backup server). This is confirmed lateral movement. What is the correct immediate action before continuing your LogScale investigation?',
      choices: [
        { text: 'Contain the compromised account (disable or isolate via Falcon Real Time Response) while keeping your LogScale session open to document the full scope' },
        { text: 'Continue querying for another 30 minutes to build a complete forensic picture before taking any action' },
        { text: 'Change the svc_backup password immediately and mark the incident resolved' },
        { text: 'Notify the backup system vendor and wait for their guidance before acting' },
      ],
      correctChoiceIndex: 0,
      wrongConsequence: 'Waiting 30 more minutes gives the threat actor time to establish persistence on all 9 hosts. Changing the password alone does not revoke active sessions or address hosts that may already be compromised. Waiting for vendor guidance is inappropriate for an active incident.',
      reasoning: 'The SOC principle is: contain first, investigate in parallel. Disabling the account or using Falcon Real Time Response to isolate the most critical compromised host stops the lateral movement immediately. Your LogScale session remains open — you continue documenting scope while the threat is contained. Documentation without containment is malpractice during an active incident.',
      docTitle: 'CrowdStrike Incident Response Best Practices',
      docUrl: 'https://falcon.crowdstrike.com/documentation/page/incident-response',
    },
  ],
}

// ── Track 1.2 Export ──────────────────────────────────────────────────────────

export const cqlTrack: ContentTrack = {
  id: 'siem-cql',
  title: 'CQL — CrowdStrike Query Language',
  domainId: 'siem',
  order: 2,
  modules: [basicSearchModule, aggregationModule, advancedFunctionsModule, productionQueriesModule],
  scenario: cqlScenario,
}
