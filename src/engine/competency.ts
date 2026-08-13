import { CompetencyLevel } from '../db/schema'

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
