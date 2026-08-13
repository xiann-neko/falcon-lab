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
