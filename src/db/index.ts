import { FalconLabDB } from './schema'

// Singleton DB instance — shared across the whole app
export const db = new FalconLabDB()

// Re-export everything consumers need
export { CompetencyLevel, FalconLabDB } from './schema'
export type {
  CompetencyRecord,
  QuizHistoryEntry,
  ScenarioDecision,
  ScenarioHistoryEntry,
  SpacedRepetitionItem,
  AppStateEntry,
} from './schema'
