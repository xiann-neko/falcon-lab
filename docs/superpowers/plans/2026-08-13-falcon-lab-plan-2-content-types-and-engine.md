# Falcon Lab — Plan 2: Content Types & Engine

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Define TypeScript interfaces for all learning content (domains, tracks, modules, quizzes, challenges, scenarios) and implement pure engine functions for quiz scoring, competency calculation, spaced repetition scheduling, and domain readiness — all fully unit-tested with no UI dependencies.

**Architecture:** Two new top-level source directories: `src/content/` for data types and seed curriculum, and `src/engine/` for pure calculation functions. Content types mirror the domain/track/module hierarchy from the design spec. Engine functions are pure (no DB reads/writes, no React, no side-effects) so they can be tested in isolation. The content registry pattern — all domains registered in one file, each domain's data in its own file — lets future plans add content by adding one file with no component changes needed. Only Domain 1, Track 1.1 carries full content in this plan; the remaining domains are registered stubs.

**Tech Stack:** Vite 8 · React 19 · TypeScript 6 · React Router 7 · Dexie 4 · Vitest (existing from Plan 1)

## Global Constraints

- Dark mode only: background `#0F1923`, accent `#E01B2D`, text `#FFFFFF`
- No UI components in this plan — pure TypeScript data and functions only
- No backend, no external API calls
- All tests run with `npm test`
- All engine functions must be pure: no DB reads/writes, no React imports, no side-effects
- Module IDs use lowercase kebab-case matching the `moduleId` key in `src/db/schema.ts` (e.g. `siem-logscale-what-is`)
- Every quiz question must have: `id` (globally unique), `text`, `options` (exactly 4 strings), `correctIndex` (0-based), `explanation`, `docTitle`, `docUrl`
- Every fully-populated module must have: at least one `ConceptSection`, at least 5 `QuizQuestion` entries, `lastReviewed` ISO date string
- Official doc base URLs: LogScale docs → `https://library.humio.com/`, CrowdStrike docs → `https://falcon.crowdstrike.com/documentation/`
- `CompetencyLevel` enum is already defined in `src/db/index.ts` — import from there, do not redefine it
- Content files export named constants — no default exports except for the domain objects

---

## File Map

| Status | Path | Responsibility |
|---|---|---|
| Create | `src/content/types.ts` | All TypeScript interfaces for learning content (Domain, Track, Module, QuizQuestion, Challenge, Scenario, etc.) |
| Create | `src/content/index.ts` | Re-exports all types and registry helpers |
| Create | `src/content/registry.ts` | Full domain/track/module registry — all 5 domains registered; Track 1.1 fully populated, rest stubs |
| Create | `src/content/registry.test.ts` | Registry lookup tests + question ID uniqueness check |
| Create | `src/content/domains/siem.ts` | Domain 1 (LogScale SIEM) — Track 1.1 complete (3 modules + questions + scenario); remaining tracks are stubs |
| Create | `src/content/domains/soar.ts` | Domain 2 stub |
| Create | `src/content/domains/ltr.ts` | Domain 3 stub |
| Create | `src/content/domains/charlotte-ai.ts` | Domain 4 stub |
| Create | `src/content/domains/platform.ts` | Domain 5 stub |
| Create | `src/engine/quiz.ts` | Quiz scoring, CQL challenge scoring, playbook challenge scoring |
| Create | `src/engine/quiz.test.ts` | Tests for quiz engine |
| Create | `src/engine/competency.ts` | Competency level calculation |
| Create | `src/engine/competency.test.ts` | Tests for competency engine |
| Create | `src/engine/spaced-repetition.ts` | Spaced repetition due-date scheduling |
| Create | `src/engine/spaced-repetition.test.ts` | Tests for SR engine |
| Create | `src/engine/domain-readiness.ts` | Domain readiness + overall SME readiness |
| Create | `src/engine/domain-readiness.test.ts` | Tests for readiness engine |
| Create | `src/engine/index.ts` | Re-exports all engine functions |

---

### Task 1: Content Type System

**Files:**
- Create: `src/content/types.ts`
- Create: `src/content/index.ts`

**Interfaces:**
- Produces (exported from `src/content/types.ts`): `QuizQuestion`, `ConceptSection`, `CqlChallenge`, `PlaybookStep`, `PlaybookChallenge`, `Challenge`, `ScenarioChoice`, `ScenarioStep`, `Scenario`, `ContentModule`, `ContentTrack`, `ContentDomain`
- Produces (re-exported from `src/content/index.ts`): all types above

- [ ] **Step 1: Write the compile-time type test first**

Create `src/content/types.test.ts`:
```typescript
import type { QuizQuestion, ContentModule, ContentDomain } from './types'

// This test verifies that the type interfaces compile correctly.
// If this file compiles, all type definitions are valid TypeScript.

describe('content type interfaces compile', () => {
  it('QuizQuestion can be constructed with all required fields', () => {
    const q: QuizQuestion = {
      id: 'test-q1',
      text: 'What is LogScale?',
      options: ['A', 'B', 'C', 'D'],
      correctIndex: 0,
      explanation: 'Explanation text.',
      docTitle: 'LogScale Overview',
      docUrl: 'https://library.humio.com/falcon-logscale/docs/index.html',
    }
    expect(q.id).toBe('test-q1')
    expect(q.options).toHaveLength(4)
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npm test -- --reporter=verbose
```

Expected: FAIL — `./types` module not found.

- [ ] **Step 3: Create `src/content/types.ts`**

```typescript
// ── Quiz content ──────────────────────────────────────────────────────────────

/** A single multiple-choice question in a module quiz. */
export interface QuizQuestion {
  id:           string    // globally unique, e.g. 'siem-logscale-what-is-q1'
  text:         string
  options:      string[]  // exactly 4 options
  correctIndex: number    // 0-based index into options
  explanation:  string    // shown immediately after answering (correct or incorrect)
  docTitle:     string    // title of the official documentation page
  docUrl:       string    // URL to the official CrowdStrike/LogScale documentation
}

/** A section of learning content within a module. */
export interface ConceptSection {
  title:         string
  body:          string             // plain text explanation (may contain \n for paragraphs)
  codeExample?:  string             // CQL query, YAML snippet, bash command, etc.
  codeLanguage?: 'cql' | 'yaml' | 'json' | 'typescript' | 'bash'
}

// ── Challenge content ─────────────────────────────────────────────────────────

/**
 * A hands-on CQL writing challenge (mid-track for SIEM).
 * The learner writes a CQL query; the engine checks for required components.
 */
export interface CqlChallenge {
  type:                   'cql'
  id:                     string
  prompt:                 string    // what the learner must query
  scenario:               string    // context / background description
  requiredComponents:     string[]  // substrings that must appear in the answer
  modelAnswer:            string    // the correct CQL query shown after submission
  componentExplanations:  Record<string, string>  // key = component, value = why it's required
}

/** A single step (action) in a SOAR playbook ordering challenge. */
export interface PlaybookStep {
  id:     string
  label:  string  // short action name (e.g. "Enrich with VirusTotal")
  action: string  // full description of what this step does
}

/**
 * A hands-on SOAR playbook ordering challenge (mid-track for SOAR).
 * The learner arranges steps into the correct sequence via drag-and-drop.
 */
export interface PlaybookChallenge {
  type:              'playbook'
  id:                string
  prompt:            string
  scenario:          string
  steps:             PlaybookStep[]  // in the CORRECT order
  stepExplanations:  string[]        // parallel array — why each step comes where it does
}

export type Challenge = CqlChallenge | PlaybookChallenge

// ── Scenario content ──────────────────────────────────────────────────────────

/** A single answer option in a scenario decision point. */
export interface ScenarioChoice {
  text: string
}

/** A single decision point in a branching scenario simulation. */
export interface ScenarioStep {
  id:                 string
  narrative:          string           // situation description presented to the learner
  choices:            ScenarioChoice[] // 3–4 answer options
  correctChoiceIndex: number           // 0-based index of the correct choice
  wrongConsequence:   string           // shown when the learner picks a wrong option
  reasoning:          string           // explanation of the correct action (always shown after)
  docTitle:           string
  docUrl:             string
}

/** A branching scenario simulation (end of track or end of domain). */
export interface Scenario {
  id:           string
  title:        string
  context:      string          // narrative introduction shown before Step 1
  steps:        ScenarioStep[]  // 5–8 decision points (0 for stub scenarios)
  isCumulative: boolean         // true for end-of-domain cross-track scenarios
}

// ── Curriculum hierarchy ──────────────────────────────────────────────────────

/** A single learning module (one topic, one quiz, optional challenge). */
export interface ContentModule {
  id:           string       // e.g. 'siem-logscale-what-is'
  title:        string
  trackId:      string
  domainId:     string
  order:        number       // 1-based position within the track
  lastReviewed: string       // ISO date string — staleness indicator
  concepts:     ConceptSection[]
  quiz:         QuizQuestion[]
  challenge?:   Challenge    // present only for SIEM CQL and SOAR modules
}

/** A group of modules with a shared end-of-track scenario. */
export interface ContentTrack {
  id:       string  // e.g. 'siem-logscale-foundations'
  title:    string
  domainId: string
  order:    number  // 1-based position within the domain
  modules:  ContentModule[]
  scenario: Scenario
}

/** One of the five top-level learning domains. */
export interface ContentDomain {
  id:                 string  // 'siem' | 'soar' | 'ltr' | 'charlotte-ai' | 'platform'
  title:              string
  emoji:              string
  order:              number  // display order 1–5
  tracks:             ContentTrack[]
  cumulativeScenario: Scenario
}
```

- [ ] **Step 4: Create `src/content/index.ts`** (initial — gains registry exports in Task 2)

```typescript
export type {
  QuizQuestion,
  ConceptSection,
  CqlChallenge,
  PlaybookStep,
  PlaybookChallenge,
  Challenge,
  ScenarioChoice,
  ScenarioStep,
  Scenario,
  ContentModule,
  ContentTrack,
  ContentDomain,
} from './types'
```

- [ ] **Step 5: Run test to verify it passes**

```bash
npm test -- --reporter=verbose
```

Expected: PASS — the single type compile test passes. All existing 17 tests still pass. Total: 18 passing.

- [ ] **Step 6: Commit**

```bash
git add src/content/
git commit -m "feat: add content type system (Domain, Track, Module, Quiz, Challenge, Scenario interfaces)"
```

---

### Task 2: Curriculum Seed Data

**Files:**
- Create: `src/content/domains/siem.ts`
- Create: `src/content/domains/soar.ts`
- Create: `src/content/domains/ltr.ts`
- Create: `src/content/domains/charlotte-ai.ts`
- Create: `src/content/domains/platform.ts`
- Create: `src/content/registry.ts`
- Create: `src/content/registry.test.ts`
- Modify: `src/content/index.ts`

**Interfaces:**
- Consumes: all types from `src/content/types.ts`
- Produces (exported from `src/content/registry.ts`):
  - `DOMAINS: ContentDomain[]` — all 5 domains in order
  - `getDomain(id: string): ContentDomain | undefined`
  - `getTrack(trackId: string): ContentTrack | undefined`
  - `getModule(moduleId: string): ContentModule | undefined`
  - `getAllModules(): ContentModule[]`
  - `getDomainModules(domainId: string): ContentModule[]`
  - `getTrackScenario(trackId: string): Scenario | undefined`
  - `getDomainCumulativeScenario(domainId: string): Scenario | undefined`

- [ ] **Step 1: Write the failing registry tests first**

Create `src/content/registry.test.ts`:
```typescript
import { getDomain, getModule, getAllModules, getTrack, getDomainCumulativeScenario, DOMAINS } from './registry'

describe('registry lookups', () => {
  it('registers exactly 5 domains', () => {
    expect(DOMAINS).toHaveLength(5)
  })

  it('finds the SIEM domain', () => {
    const domain = getDomain('siem')
    expect(domain).toBeDefined()
    expect(domain?.title).toBe('LogScale / Next-Gen SIEM')
    expect(domain?.emoji).toBe('📡')
    expect(domain?.order).toBe(1)
  })

  it('returns undefined for an unknown domain ID', () => {
    expect(getDomain('unknown')).toBeUndefined()
  })

  it('finds Track 1.1 (siem-logscale-foundations) by ID', () => {
    const track = getTrack('siem-logscale-foundations')
    expect(track).toBeDefined()
    expect(track?.modules).toHaveLength(3)
    expect(track?.scenario.id).toBe('siem-foundations-track-scenario')
  })

  it('finds a module by ID and includes its quiz', () => {
    const mod = getModule('siem-logscale-what-is')
    expect(mod).toBeDefined()
    expect(mod?.title).toMatch(/What is LogScale/i)
    expect(mod?.quiz.length).toBeGreaterThanOrEqual(5)
    expect(mod?.concepts.length).toBeGreaterThanOrEqual(1)
  })

  it('returns undefined for an unknown module ID', () => {
    expect(getModule('does-not-exist')).toBeUndefined()
  })

  it('getAllModules includes all 3 Track 1.1 modules', () => {
    const ids = getAllModules().map(m => m.id)
    expect(ids).toContain('siem-logscale-what-is')
    expect(ids).toContain('siem-logscale-ingestion')
    expect(ids).toContain('siem-logscale-data-model')
  })

  it('all question IDs are globally unique across the registry', () => {
    const questionIds = getAllModules().flatMap(m => m.quiz.map(q => q.id))
    const unique = new Set(questionIds)
    expect(unique.size).toBe(questionIds.length)
  })

  it('returns the SIEM cumulative scenario', () => {
    const scenario = getDomainCumulativeScenario('siem')
    expect(scenario).toBeDefined()
    expect(scenario?.isCumulative).toBe(true)
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
npm test -- --reporter=verbose
```

Expected: FAIL — `./registry` module not found.

- [ ] **Step 3: Create `src/content/domains/siem.ts`**

This is the only domain with full content. Track 1.1 has 3 modules (15 questions total) and an end-of-track scenario. The remaining SIEM tracks are left for future content releases.

```typescript
import type {
  ContentDomain,
  ContentModule,
  ContentTrack,
  QuizQuestion,
  ConceptSection,
  Scenario,
  ScenarioStep,
} from '../types'

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

// ── SIEM cumulative scenario (stub) ──────────────────────────────────────────

const siemCumulativeScenario: Scenario = {
  id: 'siem-cumulative',
  title: 'SIEM Domain — Cumulative End-of-Domain Scenario',
  context: 'Coming in a future content release. This scenario will span multiple tracks, requiring both CQL query writing and detection pattern knowledge.',
  isCumulative: true,
  steps: [],
}

// ── Domain 1 export ───────────────────────────────────────────────────────────

export const siemDomain: ContentDomain = {
  id: 'siem',
  title: 'LogScale / Next-Gen SIEM',
  emoji: '📡',
  order: 1,
  tracks: [foundationsTrack],
  cumulativeScenario: siemCumulativeScenario,
}
```

- [ ] **Step 4: Create the four stub domain files**

Create `src/content/domains/soar.ts`:
```typescript
import type { ContentDomain, Scenario } from '../types'

const soarCumulativeScenario: Scenario = {
  id: 'soar-cumulative',
  title: 'Falcon Fusion SOAR — End-of-Domain Scenario',
  context: 'Coming in a future content release.',
  isCumulative: true,
  steps: [],
}

export const soarDomain: ContentDomain = {
  id: 'soar',
  title: 'Falcon Fusion SOAR',
  emoji: '⚡',
  order: 2,
  tracks: [],
  cumulativeScenario: soarCumulativeScenario,
}
```

Create `src/content/domains/ltr.ts`:
```typescript
import type { ContentDomain, Scenario } from '../types'

const ltrCumulativeScenario: Scenario = {
  id: 'ltr-cumulative',
  title: 'LTR & Data Tiers — End-of-Domain Scenario',
  context: 'Coming in a future content release.',
  isCumulative: true,
  steps: [],
}

export const ltrDomain: ContentDomain = {
  id: 'ltr',
  title: 'LTR & Data Tiers',
  emoji: '🗄️',
  order: 3,
  tracks: [],
  cumulativeScenario: ltrCumulativeScenario,
}
```

Create `src/content/domains/charlotte-ai.ts`:
```typescript
import type { ContentDomain, Scenario } from '../types'

const charlotteCumulativeScenario: Scenario = {
  id: 'charlotte-ai-cumulative',
  title: 'Charlotte AI — End-of-Domain Scenario',
  context: 'Coming in a future content release.',
  isCumulative: true,
  steps: [],
}

export const charlotteAiDomain: ContentDomain = {
  id: 'charlotte-ai',
  title: 'Charlotte AI',
  emoji: '🤖',
  order: 4,
  tracks: [],
  cumulativeScenario: charlotteCumulativeScenario,
}
```

Create `src/content/domains/platform.ts`:
```typescript
import type { ContentDomain, Scenario } from '../types'

const platformCumulativeScenario: Scenario = {
  id: 'platform-cumulative',
  title: 'Platform Essentials — End-of-Domain Scenario',
  context: 'Coming in a future content release.',
  isCumulative: true,
  steps: [],
}

export const platformDomain: ContentDomain = {
  id: 'platform',
  title: 'Platform Essentials',
  emoji: '🔧',
  order: 5,
  tracks: [],
  cumulativeScenario: platformCumulativeScenario,
}
```

- [ ] **Step 5: Create `src/content/registry.ts`**

```typescript
import { siemDomain }        from './domains/siem'
import { soarDomain }        from './domains/soar'
import { ltrDomain }         from './domains/ltr'
import { charlotteAiDomain } from './domains/charlotte-ai'
import { platformDomain }    from './domains/platform'
import type { ContentDomain, ContentModule, ContentTrack, Scenario } from './types'

/** All five learning domains in display order. */
export const DOMAINS: ContentDomain[] = [
  siemDomain,
  soarDomain,
  ltrDomain,
  charlotteAiDomain,
  platformDomain,
]

export function getDomain(id: string): ContentDomain | undefined {
  return DOMAINS.find(d => d.id === id)
}

export function getTrack(trackId: string): ContentTrack | undefined {
  for (const domain of DOMAINS) {
    const track = domain.tracks.find(t => t.id === trackId)
    if (track) return track
  }
  return undefined
}

export function getModule(moduleId: string): ContentModule | undefined {
  for (const domain of DOMAINS) {
    for (const track of domain.tracks) {
      const mod = track.modules.find(m => m.id === moduleId)
      if (mod) return mod
    }
  }
  return undefined
}

/** All modules across all domains and tracks. */
export function getAllModules(): ContentModule[] {
  return DOMAINS.flatMap(d => d.tracks.flatMap(t => t.modules))
}

/** All modules within a specific domain. */
export function getDomainModules(domainId: string): ContentModule[] {
  const domain = getDomain(domainId)
  return domain ? domain.tracks.flatMap(t => t.modules) : []
}

export function getTrackScenario(trackId: string): Scenario | undefined {
  return getTrack(trackId)?.scenario
}

export function getDomainCumulativeScenario(domainId: string): Scenario | undefined {
  return getDomain(domainId)?.cumulativeScenario
}
```

- [ ] **Step 6: Update `src/content/index.ts` to add registry exports**

Replace the entire file with:
```typescript
export type {
  QuizQuestion,
  ConceptSection,
  CqlChallenge,
  PlaybookStep,
  PlaybookChallenge,
  Challenge,
  ScenarioChoice,
  ScenarioStep,
  Scenario,
  ContentModule,
  ContentTrack,
  ContentDomain,
} from './types'

export {
  DOMAINS,
  getDomain,
  getTrack,
  getModule,
  getAllModules,
  getDomainModules,
  getTrackScenario,
  getDomainCumulativeScenario,
} from './registry'
```

- [ ] **Step 7: Run the full test suite**

```bash
npm test -- --reporter=verbose
```

Expected: all 9 registry tests pass, all prior 18 tests pass. Total: 27 passing.

- [ ] **Step 8: Commit**

```bash
git add src/content/
git commit -m "feat: add curriculum seed data — Domain 1 Track 1.1 (3 modules, 15 questions, track scenario)"
```

---

### Task 3: Quiz Engine

**Files:**
- Create: `src/engine/quiz.ts`
- Create: `src/engine/quiz.test.ts`

**Interfaces:**
- Produces (exported from `src/engine/quiz.ts`):
  - `QuizResult` — `{ score: number; correct: number; total: number }`
  - `scoreQuiz(answers: number[], questions: QuizQuestion[]): QuizResult`
  - `CqlChallengeResult` — `{ score: number; present: string[]; missing: string[] }`
  - `scoreCqlChallenge(submission: string, requiredComponents: string[]): CqlChallengeResult`
  - `PlaybookChallengeResult` — `{ score: number; correctPositions: boolean[] }`
  - `scorePlaybookChallenge(submittedIds: string[], correctIds: string[]): PlaybookChallengeResult`

- [ ] **Step 1: Write the failing tests first**

Create `src/engine/quiz.test.ts`:
```typescript
import { scoreQuiz, scoreCqlChallenge, scorePlaybookChallenge } from './quiz'
import type { QuizQuestion } from '../content/types'

/** Helper: create N questions where correctIndex is always 0. */
const makeQuestions = (n: number): QuizQuestion[] =>
  Array.from({ length: n }, (_, i) => ({
    id: `q${i}`,
    text: `Question ${i}`,
    options: ['Correct', 'Wrong A', 'Wrong B', 'Wrong C'],
    correctIndex: 0,
    explanation: '',
    docTitle: '',
    docUrl: '',
  }))

// ── scoreQuiz ─────────────────────────────────────────────────────────────────

describe('scoreQuiz', () => {
  it('returns 100% when all answers are correct', () => {
    const result = scoreQuiz([0, 0, 0, 0, 0], makeQuestions(5))
    expect(result.score).toBe(100)
    expect(result.correct).toBe(5)
    expect(result.total).toBe(5)
  })

  it('returns 0% when all answers are wrong', () => {
    const result = scoreQuiz([1, 1, 1, 1, 1], makeQuestions(5))
    expect(result.score).toBe(0)
    expect(result.correct).toBe(0)
  })

  it('returns 60% for 3 correct out of 5', () => {
    const result = scoreQuiz([0, 0, 0, 1, 1], makeQuestions(5))
    expect(result.score).toBe(60)
    expect(result.correct).toBe(3)
  })

  it('rounds to the nearest integer (2/3 = 66.67 → 67)', () => {
    expect(scoreQuiz([0, 0, 1], makeQuestions(3)).score).toBe(67)
  })

  it('throws when answer count does not match question count', () => {
    expect(() => scoreQuiz([0, 0], makeQuestions(3))).toThrow()
  })

  it('returns score 0 for an empty quiz', () => {
    const result = scoreQuiz([], [])
    expect(result.score).toBe(0)
    expect(result.correct).toBe(0)
    expect(result.total).toBe(0)
  })
})

// ── scoreCqlChallenge ────────────────────────────────────────────────────────

describe('scoreCqlChallenge', () => {
  it('returns 100% when all required components are present', () => {
    const result = scoreCqlChallenge(
      'status=failed | count() | groupBy(host)',
      ['status=failed', 'count()', 'groupBy'],
    )
    expect(result.score).toBe(100)
    expect(result.present).toHaveLength(3)
    expect(result.missing).toHaveLength(0)
  })

  it('returns 0% when no required components are present', () => {
    const result = scoreCqlChallenge('SELECT * FROM logs', ['count()', 'groupBy', 'status=failed'])
    expect(result.score).toBe(0)
    expect(result.missing).toHaveLength(3)
  })

  it('performs case-insensitive matching', () => {
    const result = scoreCqlChallenge('STATUS=FAILED | COUNT()', ['status=failed', 'count()'])
    expect(result.score).toBe(100)
  })

  it('returns partial score when only some components are present', () => {
    const result = scoreCqlChallenge(
      'status=failed | count()',
      ['status=failed', 'count()', 'groupBy'],
    )
    expect(result.score).toBe(67)  // 2/3 = 66.67 → 67
    expect(result.present).toContain('status=failed')
    expect(result.missing).toContain('groupBy')
  })

  it('returns 100% when requiredComponents is empty', () => {
    expect(scoreCqlChallenge('anything', []).score).toBe(100)
  })
})

// ── scorePlaybookChallenge ───────────────────────────────────────────────────

describe('scorePlaybookChallenge', () => {
  it('returns 100% when all steps are in the correct order', () => {
    const correct = ['step1', 'step2', 'step3']
    const result = scorePlaybookChallenge(['step1', 'step2', 'step3'], correct)
    expect(result.score).toBe(100)
    expect(result.correctPositions).toEqual([true, true, true])
  })

  it('returns 0% when no steps are in the correct position', () => {
    const correct = ['step1', 'step2', 'step3']
    const result = scorePlaybookChallenge(['step3', 'step1', 'step2'], correct)
    expect(result.score).toBe(0)
    expect(result.correctPositions).toEqual([false, false, false])
  })

  it('returns 50% when half the steps are in the correct position', () => {
    const correct = ['step1', 'step2', 'step3', 'step4']
    const result = scorePlaybookChallenge(['step1', 'step3', 'step2', 'step4'], correct)
    expect(result.score).toBe(50)
    expect(result.correctPositions).toEqual([true, false, false, true])
  })

  it('returns 100% for an empty challenge', () => {
    expect(scorePlaybookChallenge([], []).score).toBe(100)
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
npm test -- --reporter=verbose
```

Expected: FAIL — `./quiz` module not found.

- [ ] **Step 3: Create `src/engine/quiz.ts`**

```typescript
import type { QuizQuestion } from '../content/types'

// ── Quiz scoring ──────────────────────────────────────────────────────────────

export interface QuizResult {
  score:   number  // 0–100 (rounded to nearest integer)
  correct: number  // number of questions answered correctly
  total:   number  // total number of questions
}

/**
 * Score a quiz attempt.
 * @param answers   - Submitted answer index per question (0-based), same order as questions
 * @param questions - The question bank
 * @throws if answers.length !== questions.length
 */
export function scoreQuiz(answers: number[], questions: QuizQuestion[]): QuizResult {
  if (answers.length !== questions.length) {
    throw new Error(
      `Answer count (${answers.length}) must match question count (${questions.length})`
    )
  }
  const total = questions.length
  if (total === 0) return { score: 0, correct: 0, total: 0 }

  const correct = questions.filter((q, i) => answers[i] === q.correctIndex).length
  return { score: Math.round((correct / total) * 100), correct, total }
}

// ── CQL challenge scoring ─────────────────────────────────────────────────────

export interface CqlChallengeResult {
  score:   number    // 0–100 (percentage of required components present)
  present: string[]  // required components found in the submission
  missing: string[]  // required components not found in the submission
}

/**
 * Score a CQL challenge submission.
 * Checks how many required components appear in the submitted query via
 * case-insensitive substring match.
 *
 * @param submission        - The learner's submitted CQL query string
 * @param requiredComponents - Substrings that must be present in the query
 */
export function scoreCqlChallenge(
  submission: string,
  requiredComponents: string[],
): CqlChallengeResult {
  if (requiredComponents.length === 0) return { score: 100, present: [], missing: [] }

  const lower = submission.toLowerCase()
  const present: string[] = []
  const missing: string[] = []

  for (const component of requiredComponents) {
    if (lower.includes(component.toLowerCase())) {
      present.push(component)
    } else {
      missing.push(component)
    }
  }

  return {
    score: Math.round((present.length / requiredComponents.length) * 100),
    present,
    missing,
  }
}

// ── Playbook challenge scoring ────────────────────────────────────────────────

export interface PlaybookChallengeResult {
  score:            number     // 0–100 (% of steps in the correct position)
  correctPositions: boolean[]  // parallel to submittedIds — true if correctly placed
}

/**
 * Score a SOAR playbook ordering challenge.
 * A step is "correct" only if it appears in the exact same position as in correctIds.
 *
 * @param submittedIds - Step IDs in the order the learner placed them
 * @param correctIds   - Step IDs in the correct order (from PlaybookChallenge.steps)
 */
export function scorePlaybookChallenge(
  submittedIds: string[],
  correctIds: string[],
): PlaybookChallengeResult {
  const total = correctIds.length
  if (total === 0) return { score: 100, correctPositions: [] }

  const correctPositions = submittedIds.map((id, i) => id === correctIds[i])
  const numCorrect = correctPositions.filter(Boolean).length

  return {
    score: Math.round((numCorrect / total) * 100),
    correctPositions,
  }
}
```

- [ ] **Step 4: Run tests to verify they all pass**

```bash
npm test -- --reporter=verbose
```

Expected: PASS — all 14 quiz engine tests pass. All prior tests still pass. Total: 41 passing.

- [ ] **Step 5: Commit**

```bash
git add src/engine/quiz.ts src/engine/quiz.test.ts
git commit -m "feat: add quiz engine (quiz scoring, CQL challenge scoring, playbook challenge scoring)"
```

---

### Task 4: Competency Engine

**Files:**
- Create: `src/engine/competency.ts`
- Create: `src/engine/competency.test.ts`

**Interfaces:**
- Consumes: `CompetencyLevel` enum from `src/db/index.ts` (already defined in Plan 1)
- Produces:
  - `CompetencyParams` — `{ quizScore: number | null; challengeScore: number | null; scenarioPassed: boolean | null; hasChallenge: boolean }`
  - `calculateCompetency(params: CompetencyParams): CompetencyLevel`

- [ ] **Step 1: Write the failing tests first**

Create `src/engine/competency.test.ts`:
```typescript
import { calculateCompetency } from './competency'
import { CompetencyLevel } from '../db/index'

// ── Modules WITHOUT a challenge (LTR, Charlotte AI, Platform) ─────────────────

describe('calculateCompetency — no challenge modules', () => {
  const base = { hasChallenge: false, challengeScore: null }

  it('returns Novice when quiz has not been attempted', () => {
    expect(calculateCompetency({ ...base, quizScore: null, scenarioPassed: null }))
      .toBe(CompetencyLevel.Novice)
  })

  it('returns Novice for quiz score below 40%', () => {
    expect(calculateCompetency({ ...base, quizScore: 39, scenarioPassed: null }))
      .toBe(CompetencyLevel.Novice)
  })

  it('returns Aware for quiz score 40%', () => {
    expect(calculateCompetency({ ...base, quizScore: 40, scenarioPassed: null }))
      .toBe(CompetencyLevel.Aware)
  })

  it('returns Aware for quiz score 69%', () => {
    expect(calculateCompetency({ ...base, quizScore: 69, scenarioPassed: null }))
      .toBe(CompetencyLevel.Aware)
  })

  it('returns Practitioner for quiz score 70% (no scenario required for Practitioner)', () => {
    expect(calculateCompetency({ ...base, quizScore: 70, scenarioPassed: null }))
      .toBe(CompetencyLevel.Practitioner)
  })

  it('returns Practitioner for quiz score 89%', () => {
    expect(calculateCompetency({ ...base, quizScore: 89, scenarioPassed: null }))
      .toBe(CompetencyLevel.Practitioner)
  })

  it('returns SME for quiz score 90% + scenario passed', () => {
    expect(calculateCompetency({ ...base, quizScore: 90, scenarioPassed: true }))
      .toBe(CompetencyLevel.SME)
  })

  it('returns Practitioner (not SME) when quiz ≥90% but scenario not yet attempted', () => {
    expect(calculateCompetency({ ...base, quizScore: 95, scenarioPassed: null }))
      .toBe(CompetencyLevel.Practitioner)
  })

  it('returns Practitioner (not SME) when quiz ≥90% but scenario failed', () => {
    expect(calculateCompetency({ ...base, quizScore: 95, scenarioPassed: false }))
      .toBe(CompetencyLevel.Practitioner)
  })
})

// ── Modules WITH a challenge (SIEM CQL, SOAR) ─────────────────────────────────

describe('calculateCompetency — with challenge modules', () => {
  const base = { hasChallenge: true }

  it('returns Novice when quiz has not been attempted', () => {
    expect(calculateCompetency({ ...base, quizScore: null, challengeScore: null, scenarioPassed: null }))
      .toBe(CompetencyLevel.Novice)
  })

  it('returns Aware for quiz 40–69% regardless of challenge score', () => {
    expect(calculateCompetency({ ...base, quizScore: 55, challengeScore: 90, scenarioPassed: null }))
      .toBe(CompetencyLevel.Aware)
  })

  it('returns Practitioner when quiz ≥70% AND challenge ≥70%', () => {
    expect(calculateCompetency({ ...base, quizScore: 70, challengeScore: 70, scenarioPassed: null }))
      .toBe(CompetencyLevel.Practitioner)
  })

  it('returns Aware (not Practitioner) when quiz ≥70% but challenge <70%', () => {
    expect(calculateCompetency({ ...base, quizScore: 75, challengeScore: 65, scenarioPassed: null }))
      .toBe(CompetencyLevel.Aware)
  })

  it('returns Aware (not Practitioner) when quiz ≥70% but challenge not yet attempted', () => {
    expect(calculateCompetency({ ...base, quizScore: 75, challengeScore: null, scenarioPassed: null }))
      .toBe(CompetencyLevel.Aware)
  })

  it('returns SME when quiz ≥90% AND challenge ≥90% AND scenario passed', () => {
    expect(calculateCompetency({ ...base, quizScore: 90, challengeScore: 90, scenarioPassed: true }))
      .toBe(CompetencyLevel.SME)
  })

  it('returns Practitioner (not SME) when challenge is 89% even if quiz ≥90% and scenario passed', () => {
    expect(calculateCompetency({ ...base, quizScore: 95, challengeScore: 89, scenarioPassed: true }))
      .toBe(CompetencyLevel.Practitioner)
  })

  it('returns Practitioner (not SME) when quiz ≥90% and challenge ≥90% but scenario not passed', () => {
    expect(calculateCompetency({ ...base, quizScore: 90, challengeScore: 90, scenarioPassed: false }))
      .toBe(CompetencyLevel.Practitioner)
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
npm test -- --reporter=verbose
```

Expected: FAIL — `./competency` module not found.

- [ ] **Step 3: Create `src/engine/competency.ts`**

```typescript
import { CompetencyLevel } from '../db/index'

export interface CompetencyParams {
  quizScore:      number | null   // 0–100, or null if not yet attempted
  challengeScore: number | null   // 0–100, or null if no challenge / not attempted
  scenarioPassed: boolean | null  // true/false, or null if scenario not attempted
  hasChallenge:   boolean         // true for SIEM CQL and SOAR modules only
}

/**
 * Calculate the competency level for a module based on its assessment scores.
 *
 * Rules (from design spec):
 *
 * Novice:       quizScore is null OR quizScore < 40
 *
 * Aware:        quizScore 40–69%
 *               OR quizScore ≥70 but challenge threshold not met (when hasChallenge=true)
 *
 * Practitioner: hasChallenge=false: quizScore ≥70%
 *               hasChallenge=true:  quizScore ≥70% AND challengeScore ≥70%
 *
 * SME:          hasChallenge=false: quizScore ≥90% AND scenarioPassed=true
 *               hasChallenge=true:  quizScore ≥90% AND challengeScore ≥90% AND scenarioPassed=true
 *
 * Note: competency can decrease on retry — it always reflects the most recent scores.
 */
export function calculateCompetency(params: CompetencyParams): CompetencyLevel {
  const { quizScore, challengeScore, scenarioPassed, hasChallenge } = params

  if (quizScore === null || quizScore < 40) return CompetencyLevel.Novice

  // SME: quiz ≥90%, optional challenge ≥90%, scenario passed
  const smeQuizOk      = quizScore >= 90
  const smeChallengeOk = !hasChallenge || (challengeScore !== null && challengeScore >= 90)
  if (smeQuizOk && smeChallengeOk && scenarioPassed === true) {
    return CompetencyLevel.SME
  }

  // Practitioner: quiz ≥70%, challenge ≥70% if applicable
  const practitionerQuizOk      = quizScore >= 70
  const practitionerChallengeOk = !hasChallenge || (challengeScore !== null && challengeScore >= 70)
  if (practitionerQuizOk && practitionerChallengeOk) {
    return CompetencyLevel.Practitioner
  }

  return CompetencyLevel.Aware
}
```

- [ ] **Step 4: Run tests to verify they all pass**

```bash
npm test -- --reporter=verbose
```

Expected: PASS — all 17 competency tests pass. All prior tests still pass. Total: 58 passing.

- [ ] **Step 5: Commit**

```bash
git add src/engine/competency.ts src/engine/competency.test.ts
git commit -m "feat: add competency engine (Novice / Aware / Practitioner / SME level calculation)"
```

---

### Task 5: Spaced Repetition & Domain Readiness Engines

**Files:**
- Create: `src/engine/spaced-repetition.ts`
- Create: `src/engine/spaced-repetition.test.ts`
- Create: `src/engine/domain-readiness.ts`
- Create: `src/engine/domain-readiness.test.ts`
- Create: `src/engine/index.ts`

**Interfaces:**
- Produces (from `src/engine/spaced-repetition.ts`):
  - `SR_RETIREMENT_COUNT: 3` — exported constant
  - `scheduleDueDate(retryCount: number, from?: Date): string`
  - `shouldRetireItem(retryCount: number): boolean`
  - `advanceRetryCount(retryCount: number): number`
  - `createSrItem(questionId: string, moduleId: string, from?: Date): { questionId: string; moduleId: string; dueDate: string; retryCount: number }`
- Produces (from `src/engine/domain-readiness.ts`):
  - `moduleReadinessScore(quizScore: number | null, challengeScore: number | null, scenarioScore: number | null): number`
  - `domainReadinessScore(moduleScores: number[]): number`
  - `overallSmeReadiness(domainReadinesses: number[]): number`

- [ ] **Step 1: Write the failing spaced repetition tests**

Create `src/engine/spaced-repetition.test.ts`:
```typescript
import {
  scheduleDueDate,
  shouldRetireItem,
  advanceRetryCount,
  createSrItem,
  SR_RETIREMENT_COUNT,
} from './spaced-repetition'

describe('scheduleDueDate', () => {
  const base = new Date('2026-08-13T12:00:00.000Z')

  it('schedules 1 day out when retryCount is 0 (first incorrect answer)', () => {
    const due = new Date(scheduleDueDate(0, base))
    expect(due.getUTCDate()).toBe(14)  // 13 + 1
  })

  it('schedules 3 days out when retryCount is 1 (first correct retry)', () => {
    const due = new Date(scheduleDueDate(1, base))
    expect(due.getUTCDate()).toBe(16)  // 13 + 3
  })

  it('schedules 7 days out when retryCount is 2 (second correct retry)', () => {
    const due = new Date(scheduleDueDate(2, base))
    expect(due.getUTCDate()).toBe(20)  // 13 + 7
  })

  it('uses the maximum interval (7 days) for retryCount beyond the schedule', () => {
    const due2 = new Date(scheduleDueDate(2, base)).getUTCDate()
    const due9 = new Date(scheduleDueDate(9, base)).getUTCDate()
    expect(due2).toBe(due9)
  })

  it('defaults to the current time when no from date is provided', () => {
    const msInDay = 86_400_000
    const before = Date.now()
    const due = new Date(scheduleDueDate(0))
    const after = Date.now()
    expect(due.getTime()).toBeGreaterThanOrEqual(before + msInDay - 2000)
    expect(due.getTime()).toBeLessThanOrEqual(after + msInDay + 2000)
  })
})

describe('shouldRetireItem', () => {
  it(`returns true at retryCount ${SR_RETIREMENT_COUNT}`, () => {
    expect(shouldRetireItem(SR_RETIREMENT_COUNT)).toBe(true)
  })

  it('returns true above retirement count', () => {
    expect(shouldRetireItem(SR_RETIREMENT_COUNT + 1)).toBe(true)
  })

  it('returns false below retirement count', () => {
    expect(shouldRetireItem(0)).toBe(false)
    expect(shouldRetireItem(SR_RETIREMENT_COUNT - 1)).toBe(false)
  })
})

describe('advanceRetryCount', () => {
  it('increments retryCount by 1', () => {
    expect(advanceRetryCount(0)).toBe(1)
    expect(advanceRetryCount(1)).toBe(2)
  })

  it('caps at SR_RETIREMENT_COUNT', () => {
    expect(advanceRetryCount(SR_RETIREMENT_COUNT)).toBe(SR_RETIREMENT_COUNT)
    expect(advanceRetryCount(SR_RETIREMENT_COUNT + 5)).toBe(SR_RETIREMENT_COUNT)
  })
})

describe('createSrItem', () => {
  it('creates a new SR item with retryCount 0 and dueDate 1 day from now', () => {
    const from = new Date('2026-08-13T12:00:00.000Z')
    const item = createSrItem('siem-what-is-q1', 'siem-logscale-what-is', from)
    expect(item.questionId).toBe('siem-what-is-q1')
    expect(item.moduleId).toBe('siem-logscale-what-is')
    expect(item.retryCount).toBe(0)
    expect(new Date(item.dueDate).getUTCDate()).toBe(14)  // 1 day later
  })
})
```

- [ ] **Step 2: Write the failing domain readiness tests**

Create `src/engine/domain-readiness.test.ts`:
```typescript
import { moduleReadinessScore, domainReadinessScore, overallSmeReadiness } from './domain-readiness'

describe('moduleReadinessScore', () => {
  it('returns 0 when nothing has been attempted', () => {
    expect(moduleReadinessScore(null, null, null)).toBe(0)
  })

  it('returns 20 for perfect quiz only (no challenge, no scenario)', () => {
    expect(moduleReadinessScore(100, null, null)).toBe(20)
  })

  it('returns 35 for perfect challenge only', () => {
    expect(moduleReadinessScore(null, 100, null)).toBe(35)
  })

  it('returns 45 for perfect scenario only', () => {
    expect(moduleReadinessScore(null, null, 100)).toBe(45)
  })

  it('returns 100 for full completion (quiz 100 + challenge 100 + scenario 100)', () => {
    expect(moduleReadinessScore(100, 100, 100)).toBe(100)
  })

  it('calculates correct weighted score without challenge', () => {
    // quiz=80, no challenge, scenario=100: 80*0.20 + 0*0.35 + 100*0.45 = 16 + 0 + 45 = 61
    expect(moduleReadinessScore(80, null, 100)).toBe(61)
  })

  it('calculates correct weighted score with all three components', () => {
    // quiz=80, challenge=70, scenario=100: 80*0.20 + 70*0.35 + 100*0.45 = 16 + 24.5 + 45 = 85.5 → 86
    expect(moduleReadinessScore(80, 70, 100)).toBe(86)
  })
})

describe('domainReadinessScore', () => {
  it('returns 0 for an empty domain', () => {
    expect(domainReadinessScore([])).toBe(0)
  })

  it('returns the exact score when only one module exists', () => {
    expect(domainReadinessScore([60])).toBe(60)
  })

  it('returns the rounded average of all module scores', () => {
    // (20 + 80 + 60) / 3 = 53.33 → 53
    expect(domainReadinessScore([20, 80, 60])).toBe(53)
  })

  it('rounds 0.5 up', () => {
    // (33 + 34) / 2 = 33.5 → 34
    expect(domainReadinessScore([33, 34])).toBe(34)
  })
})

describe('overallSmeReadiness', () => {
  it('returns 0 when no domains are provided', () => {
    expect(overallSmeReadiness([])).toBe(0)
  })

  it('returns 0 when all domains are at 0%', () => {
    expect(overallSmeReadiness([0, 0, 0, 0, 0])).toBe(0)
  })

  it('returns 100 when all domains are complete', () => {
    expect(overallSmeReadiness([100, 100, 100, 100, 100])).toBe(100)
  })

  it('returns the unweighted average of all domain scores', () => {
    // (60 + 40 + 20 + 0 + 0) / 5 = 24
    expect(overallSmeReadiness([60, 40, 20, 0, 0])).toBe(24)
  })

  it('rounds to nearest integer', () => {
    // (33 + 34 + 33 + 34 + 33) / 5 = 33.4 → 33
    expect(overallSmeReadiness([33, 34, 33, 34, 33])).toBe(33)
  })
})
```

- [ ] **Step 3: Run tests to verify they fail**

```bash
npm test -- --reporter=verbose
```

Expected: FAIL — `./spaced-repetition` and `./domain-readiness` modules not found.

- [ ] **Step 4: Create `src/engine/spaced-repetition.ts`**

```typescript
/** Number of correct retries before a spaced repetition item is retired from the queue. */
export const SR_RETIREMENT_COUNT = 3

/**
 * Interval schedule in days. Index = retryCount at the time the item is scheduled.
 *   retryCount=0 (new miss):         1 day
 *   retryCount=1 (first correct):    3 days
 *   retryCount=2 (second correct):   7 days
 *   retryCount≥3:                    retired (check shouldRetireItem before scheduling)
 */
const INTERVAL_DAYS = [1, 3, 7] as const

/**
 * Calculate the ISO date string for the next review of a spaced repetition item.
 *
 * @param retryCount - The item's current retryCount (before this answer)
 * @param from       - Reference date (defaults to now)
 */
export function scheduleDueDate(retryCount: number, from: Date = new Date()): string {
  const days = INTERVAL_DAYS[Math.min(retryCount, INTERVAL_DAYS.length - 1)]
  const due = new Date(from)
  due.setDate(due.getDate() + days)
  return due.toISOString()
}

/**
 * Return true if the item has been retried enough times to be retired from the queue.
 */
export function shouldRetireItem(retryCount: number): boolean {
  return retryCount >= SR_RETIREMENT_COUNT
}

/**
 * Return the new retryCount after a correct answer.
 * Caps at SR_RETIREMENT_COUNT.
 */
export function advanceRetryCount(retryCount: number): number {
  return Math.min(retryCount + 1, SR_RETIREMENT_COUNT)
}

/**
 * Create a new spaced repetition item for a question just answered incorrectly.
 * The item is scheduled 1 day from now (retryCount = 0).
 */
export function createSrItem(
  questionId: string,
  moduleId: string,
  from: Date = new Date(),
): { questionId: string; moduleId: string; dueDate: string; retryCount: number } {
  return {
    questionId,
    moduleId,
    dueDate: scheduleDueDate(0, from),
    retryCount: 0,
  }
}
```

- [ ] **Step 5: Create `src/engine/domain-readiness.ts`**

```typescript
/**
 * Calculate the readiness score for a single module (0–100).
 *
 * Weights (from design spec):
 *   - Module quiz completed:       20%
 *   - Hands-on challenge passed:   35%
 *   - Scenario simulation passed:  45%
 *
 * Null means the activity was not yet attempted (treated as 0).
 * For modules without a challenge, challengeScore should be null — it contributes 0.
 * The max score for a no-challenge module is therefore 20 + 45 = 65. This is intentional:
 * challenge-bearing modules (SIEM CQL, SOAR) carry more total weight in domain readiness.
 *
 * The scenarioScore for a module is derived from the track-level scenario result
 * (100 = passed, 0 = failed / not attempted). Plan 3 distributes the track scenario
 * result to all modules in that track when writing competency records.
 */
export function moduleReadinessScore(
  quizScore:      number | null,
  challengeScore: number | null,
  scenarioScore:  number | null,
): number {
  const quiz      = quizScore      ?? 0
  const challenge = challengeScore ?? 0
  const scenario  = scenarioScore  ?? 0
  return Math.round(quiz * 0.20 + challenge * 0.35 + scenario * 0.45)
}

/**
 * Calculate the overall domain readiness score (0–100) as the rounded average
 * of all module readiness scores in the domain.
 *
 * @param moduleScores - Output of moduleReadinessScore() for each module in the domain
 */
export function domainReadinessScore(moduleScores: number[]): number {
  if (moduleScores.length === 0) return 0
  const sum = moduleScores.reduce((acc, s) => acc + s, 0)
  return Math.round(sum / moduleScores.length)
}

/**
 * Calculate the overall SME Readiness percentage (0–100) as the unweighted
 * average of all five domain readiness scores.
 *
 * From design spec: "Unweighted average across all five domain readiness scores,
 * displayed as a percentage on the dashboard."
 *
 * @param domainReadinesses - Array of domain readiness scores, one per domain (0–100 each)
 */
export function overallSmeReadiness(domainReadinesses: number[]): number {
  if (domainReadinesses.length === 0) return 0
  const sum = domainReadinesses.reduce((acc, s) => acc + s, 0)
  return Math.round(sum / domainReadinesses.length)
}
```

- [ ] **Step 6: Create `src/engine/index.ts`**

```typescript
export {
  scoreQuiz,
  scoreCqlChallenge,
  scorePlaybookChallenge,
} from './quiz'

export type {
  QuizResult,
  CqlChallengeResult,
  PlaybookChallengeResult,
} from './quiz'

export { calculateCompetency }  from './competency'
export type { CompetencyParams } from './competency'

export {
  SR_RETIREMENT_COUNT,
  scheduleDueDate,
  shouldRetireItem,
  advanceRetryCount,
  createSrItem,
} from './spaced-repetition'

export {
  moduleReadinessScore,
  domainReadinessScore,
  overallSmeReadiness,
} from './domain-readiness'
```

- [ ] **Step 7: Run the full test suite**

```bash
npm test -- --reporter=verbose
```

Expected: PASS — all SR tests (13) and all readiness tests (12) pass. All prior tests still pass.

Total test count across Plan 2: 1 (types) + 9 (registry) + 14 (quiz) + 17 (competency) + 13 (SR) + 12 (readiness) + 17 (Plan 1 carryover) = **83 tests passing**.

- [ ] **Step 8: Verify TypeScript build still passes cleanly**

```bash
npm run build
```

Expected: `dist/` created, no TypeScript errors, no build errors.

- [ ] **Step 9: Commit**

```bash
git add src/engine/
git commit -m "feat: add spaced repetition engine, domain readiness engine, and engine index re-exports"
```

---

## Verification Checklist

After all five tasks are complete:

- [ ] `npm test` → all tests pass (83 total, no failures, no skipped)
- [ ] `npm run build` → exits 0, no TypeScript errors
- [ ] `getModule('siem-logscale-what-is')` returns the module with 5 quiz questions and 2 concept sections
- [ ] `getModule('siem-logscale-ingestion')` returns the module with 5 quiz questions
- [ ] `getModule('siem-logscale-data-model')` returns the module with 5 quiz questions
- [ ] `getAllModules()` returns exactly 3 modules (Track 1.1 only)
- [ ] All question IDs are globally unique (confirmed by registry test)
- [ ] Engine functions have no imports from React, react-router-dom, or dexie

---

## What's Next

Plan 2 delivers the data model and calculation layer. The next plans build on it:

| Plan | Adds |
|---|---|
| **Plan 3: Learning Flow UI** | Module content viewer (concepts + code examples), quiz screen with immediate feedback + doc reference, CQL challenge editor, SOAR playbook drag-and-drop, scenario simulation screen |
| **Plan 4: Dashboard & Progress** | SME Readiness bar, domain readiness bars, "Continue" card (reads `appState`), "Due for Review" card (reads `spacedRepetition`), export/import JSON |
| **Plan 5: Claude Tutor & Settings** | Clipboard prompt mode, API key mode with streaming, settings screen |
