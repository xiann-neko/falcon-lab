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
