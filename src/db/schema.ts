import Dexie, { type Table } from 'dexie'

// ── Enums ─────────────────────────────────────────────────────────────────────

export enum CompetencyLevel {
  Novice       = 'novice',
  Aware        = 'aware',
  Practitioner = 'practitioner',
  SME          = 'sme',
}

// ── Table row types ───────────────────────────────────────────────────────────

export interface CompetencyRecord {
  moduleId:       string           // primary key
  level:          CompetencyLevel
  quizScore:      number | null    // 0–100
  challengeScore: number | null    // 0–100
  scenarioScore:  number | null    // 0–100
  updatedAt:      string           // ISO date string
}

export interface QuizHistoryEntry {
  id?:            number           // auto-increment primary key
  moduleId:       string           // indexed
  questionId:     string           // indexed
  selectedAnswer: number           // 0-indexed answer choice
  isCorrect:      boolean
  answeredAt:     string           // ISO date string, indexed
}

export interface ScenarioDecision {
  stepId:      string
  choiceIndex: number
  isCorrect:   boolean
}

export interface ScenarioHistoryEntry {
  id?:         number              // auto-increment primary key
  scenarioId:  string             // indexed
  decisions:   ScenarioDecision[]
  finalScore:  number             // 0–100
  completedAt: string             // ISO date string, indexed
}

export interface SpacedRepetitionItem {
  id?:        number              // auto-increment primary key
  questionId: string             // indexed
  moduleId:   string             // indexed
  dueDate:    string             // ISO date string, indexed — used for due-date range queries
  retryCount: number             // 0 → 1 → 2 → retired after 3rd correct retry
}

export interface AppStateEntry {
  key:   string  // primary key, e.g. 'currentModuleId', 'currentTrackId'
  value: string
}

// ── Dexie subclass ─────────────────────────────────────────────────────────────

export class FalconLabDB extends Dexie {
  competency!:       Table<CompetencyRecord,      string>
  quizHistory!:      Table<QuizHistoryEntry,      number>
  scenarioHistory!:  Table<ScenarioHistoryEntry,  number>
  spacedRepetition!: Table<SpacedRepetitionItem,  number>
  appState!:         Table<AppStateEntry,         string>

  constructor() {
    super('FalconLabDB')

    this.version(1).stores({
      // Format: 'primaryKey, index1, index2, ...'
      competency:       'moduleId',
      quizHistory:      '++id, moduleId, questionId, answeredAt',
      scenarioHistory:  '++id, scenarioId, completedAt',
      spacedRepetition: '++id, questionId, moduleId, dueDate',
      appState:         'key',
    })
  }
}
