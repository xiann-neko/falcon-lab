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
