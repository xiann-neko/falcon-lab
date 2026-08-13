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
