import type { ScenarioDecision } from '../db/schema'
import type { ScenarioStep } from '../content/types'

export interface ScenarioResult {
  score:  number   // 0–100 integer, Math.round((correct / total) * 100)
  passed: boolean  // score >= 70
}

/**
 * Scores a completed scenario simulation.
 * Uses ScenarioDecision.isCorrect so the scorer doesn't re-evaluate answers.
 */
export function scoreScenario(
  decisions: ScenarioDecision[],
  steps: ScenarioStep[],
): ScenarioResult {
  if (steps.length === 0) return { score: 0, passed: false }
  const correct = decisions.filter(d => d.isCorrect).length
  const score = Math.round((correct / steps.length) * 100)
  return { score, passed: score >= 70 }
}
