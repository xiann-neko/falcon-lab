# Falcon Lab Plan 6: SIEM Domain Content (Tracks 1.2–1.4)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Author all remaining SIEM domain content — Tracks 1.2 (CQL), 1.3 (Detection & Alerting), and 1.4 (Dashboards & Reporting), with full module concepts, quiz questions, the mid-track CQL challenge, three track scenarios, and the SIEM cumulative scenario — making the SIEM domain fully playable end-to-end.

**Architecture:** All content lives in TypeScript data files under `src/content/domains/`. Each new track is authored in its own file (`siem-track-1-2.ts`, `siem-track-1-3.ts`, `siem-track-1-4.ts`) then imported into the existing `siem.ts` domain file. The cumulative scenario replaces the existing stub in `siem.ts`. No component code changes are needed — the content type system and all UI are already complete.

**Tech Stack:** TypeScript data files only. Validation: `npx tsc --noEmit` + `npm test` (existing registry tests).

## Global Constraints

- Content must compile with TypeScript strict mode — no type errors
- All quiz question `id` fields must be globally unique strings (use `'siem-cql-*'`, `'siem-det-*'`, `'siem-dash-*'` prefixes)
- All scenario `id` and `stepId` fields must be unique strings
- Every `docUrl` must begin with `https://library.humio.com` or `https://falcon.crowdstrike.com/documentation`
- Every module's `lastReviewed` field: `'2026-08-17'`
- `ContentModule.quiz` is `QuizQuestion[]` (plain array, NOT `{ questions: QuizQuestion[] }`)
- `ContentModule.challenge?` is of type `Challenge` (which is `CqlChallenge | PlaybookChallenge`) — CQL challenges use `type: 'cql'`
- `CqlChallenge.requiredComponents` is `string[]` — substrings checked against the learner's answer
- Scenario `steps` must have `5` entries minimum
- All new track files import types from `'../types'`
- `siem.ts` imports new tracks: `import { cqlTrack } from './siem-track-1-2'`, etc.
- The existing Track 1.1 (foundationsTrack) must not be modified
- `npm test` must pass after each task

---

## File Map

| Status | File | Role |
|---|---|---|
| **Create** | `src/content/domains/siem-track-1-2.ts` | Track 1.2 CQL — 4 modules + CQL challenge + track scenario |
| **Create** | `src/content/domains/siem-track-1-3.ts` | Track 1.3 Detection & Alerting — 3 modules + track scenario |
| **Create** | `src/content/domains/siem-track-1-4.ts` | Track 1.4 Dashboards & Reporting — 2 modules + track scenario |
| **Modify** | `src/content/domains/siem.ts` | Import new tracks, add to `tracks[]`, replace cumulative scenario stub |

---

### Task 1: Track 1.2 — CQL Modules

**Files:**
- Create: `src/content/domains/siem-track-1-2.ts` (modules only — scenario comes in Task 2)

**Produces:** `export const cqlTrack: ContentTrack` — but Task 2 will add the scenario and finalize the export. For this task, export the four modules and a placeholder track (scenario steps will be a stub `[]` until Task 2 fills it in).

- [ ] **Step 1: Create `src/content/domains/siem-track-1-2.ts` with the four CQL modules**

Write the file below verbatim. All concept body text, quiz questions, options, explanations, and the CQL challenge are included — copy them exactly.

```typescript
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

// ── Track 1.2 Scenario (stub — filled in by Task 2) ──────────────────────────

const cqlScenarioStub: Scenario = {
  id: 'siem-cql-scenario',
  title: 'CQL Threat Hunt: Lateral Movement Investigation',
  context: 'Scenario steps coming in Task 2.',
  steps: [],
  isCumulative: false,
}

// ── Track 1.2 Export ──────────────────────────────────────────────────────────

export const cqlTrack: ContentTrack = {
  id: 'siem-cql',
  title: 'CQL — CrowdStrike Query Language',
  domainId: 'siem',
  order: 2,
  modules: [basicSearchModule, aggregationModule, advancedFunctionsModule, productionQueriesModule],
  scenario: cqlScenarioStub,
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: Temporarily import in siem.ts to confirm the import chain works**

At the top of `src/content/domains/siem.ts`, add (do not yet add to the tracks array — that comes in Task 2):

```typescript
import { cqlTrack } from './siem-track-1-2'
```

Run `npx tsc --noEmit` again. Expected: no errors.

- [ ] **Step 4: Run full test suite**

```
npm test
```

Expected: all existing tests pass. The new track is imported but not yet in the `tracks` array, so registry counts are unchanged.

- [ ] **Step 5: Commit**

```
git add src/content/domains/siem-track-1-2.ts src/content/domains/siem.ts
git commit -m "feat: add SIEM Track 1.2 CQL modules (basic search, aggregations, advanced functions, production queries + CQL challenge)"
```

---

### Task 2: Track 1.2 Scenario + Wire Track into siem.ts

Add the 5-step CQL scenario to the Track 1.2 file and add the track to siem.ts's `tracks` array.

**Files:**
- Modify: `src/content/domains/siem-track-1-2.ts` — replace stub scenario with full 5-step scenario; add `Scenario` and `ScenarioStep` imports if not present
- Modify: `src/content/domains/siem.ts` — add `cqlTrack` to the `tracks` array

- [ ] **Step 1: Replace the stub scenario in `siem-track-1-2.ts`**

Replace the `cqlScenarioStub` constant and its usage with the full scenario below:

```typescript
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
```

Also update the `cqlTrack` export to use `cqlScenario` instead of `cqlScenarioStub`:

```typescript
export const cqlTrack: ContentTrack = {
  id: 'siem-cql',
  title: 'CQL — CrowdStrike Query Language',
  domainId: 'siem',
  order: 2,
  modules: [basicSearchModule, aggregationModule, advancedFunctionsModule, productionQueriesModule],
  scenario: cqlScenario,
}
```

Remove the `cqlScenarioStub` constant entirely.

- [ ] **Step 2: Add `cqlTrack` to the `tracks` array in `siem.ts`**

In `src/content/domains/siem.ts`, find the `tracks` array in the domain export. It currently reads `tracks: [foundationsTrack]`. Update it to:

```typescript
tracks: [foundationsTrack, cqlTrack],
```

The import of `cqlTrack` from Task 1 Step 3 is already in place.

- [ ] **Step 3: Verify TypeScript compiles**

```
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 4: Run full test suite**

```
npm test
```

Expected: all existing tests pass (the registry now sees more modules — verify the registry test file does not hard-code module counts that would break).

- [ ] **Step 5: Commit**

```
git add src/content/domains/siem-track-1-2.ts src/content/domains/siem.ts
git commit -m "feat: add SIEM Track 1.2 CQL scenario and wire track into domain"
```

---

### Task 3: Track 1.3 — Detection & Alerting

Three modules (saved searches & alerts, alert actions & integrations, threat detection patterns) plus a 5-step track scenario.

**Files:**
- Create: `src/content/domains/siem-track-1-3.ts`
- Modify: `src/content/domains/siem.ts` — import and add `detectionTrack` to `tracks` array

- [ ] **Step 1: Create `src/content/domains/siem-track-1-3.ts`**

```typescript
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
      '#event_simpleName = DnsRequest | regex("(?P<root>[^.]+\\\\.[^.]+)$", field=DomainName) | groupBy([root], function=count(as=queries)) | queries > 100',
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
```

- [ ] **Step 2: Add import and track to `siem.ts`**

In `siem.ts`, add the import:
```typescript
import { detectionTrack } from './siem-track-1-3'
```

Update `tracks` array:
```typescript
tracks: [foundationsTrack, cqlTrack, detectionTrack],
```

- [ ] **Step 3: TypeScript check + full test suite**

```
npx tsc --noEmit
npm test
```

Expected: no TypeScript errors, all tests pass.

- [ ] **Step 4: Commit**

```
git add src/content/domains/siem-track-1-3.ts src/content/domains/siem.ts
git commit -m "feat: add SIEM Track 1.3 Detection & Alerting modules and scenario"
```

---

### Task 4: Track 1.4 — Dashboards & Reporting

Two modules (building dashboards, sharing & governance) plus a 5-step track scenario.

**Files:**
- Create: `src/content/domains/siem-track-1-4.ts`
- Modify: `src/content/domains/siem.ts`

- [ ] **Step 1: Create `src/content/domains/siem-track-1-4.ts`**

```typescript
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
```

- [ ] **Step 2: Add import and track to `siem.ts`**

```typescript
import { dashboardsTrack } from './siem-track-1-4'
// ...
tracks: [foundationsTrack, cqlTrack, detectionTrack, dashboardsTrack],
```

- [ ] **Step 3: TypeScript check + full test suite**

```
npx tsc --noEmit
npm test
```

Expected: no errors, all tests pass.

- [ ] **Step 4: Commit**

```
git add src/content/domains/siem-track-1-4.ts src/content/domains/siem.ts
git commit -m "feat: add SIEM Track 1.4 Dashboards & Reporting modules and scenario"
```

---

### Task 5: SIEM Cumulative Scenario + Final Wiring

Replace the stub cumulative scenario in `siem.ts` with a full 6-step cross-domain scenario that spans CQL, alerting, and dashboards.

**Files:**
- Modify: `src/content/domains/siem.ts` — replace stub cumulativeScenario

- [ ] **Step 1: Replace the `cumulativeScenario` stub in `siem.ts`**

Find the stub cumulative scenario object (it has `steps: []` and `context: 'Coming in a future content release...'`). Replace the entire object with:

```typescript
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
```

Also ensure the `siemCumulativeScenario` constant is used in the domain export. In `siem.ts`, the domain export should include:

```typescript
cumulativeScenario: siemCumulativeScenario,
```

Remove the old stub constant entirely.

- [ ] **Step 2: Run TypeScript check**

```
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: Run full test suite**

```
npm test
```

Expected: all tests pass. The SIEM domain now has 4 tracks, 12 modules, 1 CQL challenge, 4 track scenarios, and 1 cumulative scenario.

- [ ] **Step 4: Verify content registry sees all new modules**

Open Node.js REPL or add a temporary log to verify:

```
node -e "const { getAllModules } = require('./src/content/index.ts'); console.log(getAllModules().length)"
```

Expected: ≥12 modules (3 from Track 1.1 + 9 new). If the import system doesn't support this direct approach, rely on `npx tsc --noEmit` and `npm test` as sufficient validation.

- [ ] **Step 5: Commit**

```
git add src/content/domains/siem.ts
git commit -m "feat: add SIEM cumulative scenario completing the SIEM domain content"
```

---

## Self-Review

**Spec coverage:**
- ✅ Track 1.2: 4 modules (basic search, aggregations, advanced functions, production queries)
- ✅ Track 1.2 CQL challenge on Module 4 (brute force detection)
- ✅ Track 1.2 scenario (5 steps — CQL threat hunt)
- ✅ Track 1.3: 3 modules (saved searches, alert actions, threat patterns)
- ✅ Track 1.3 scenario (5 steps — alert triage)
- ✅ Track 1.4: 2 modules (building dashboards, sharing & governance)
- ✅ Track 1.4 scenario (5 steps — dashboard review)
- ✅ SIEM cumulative scenario (6 steps — end-to-end IR)

**Placeholder scan:** No TBD or TODO. All concept body text, quiz questions with 4 options each, explanations, docTitles, docUrls, and scenario steps are fully written.

**Type consistency:** All module `trackId` values match the parent track `id`. All `domainId` values are `'siem'`. All quiz question `id` fields use domain-specific prefixes (`siem-cql-*`, `siem-det-*`, `siem-dash-*`, `siem-cum-*`). The CQL challenge type is `'cql'` matching `CqlChallenge.type`. Cumulative scenario has `isCumulative: true`; track scenarios have `isCumulative: false`.
