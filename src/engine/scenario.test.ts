import { scoreScenario } from './scenario'
import type { ScenarioDecision } from '../db/schema'
import type { ScenarioStep } from '../content/types'

const makeStep = (id: string): ScenarioStep => ({
  id, narrative: 'Narrative', choices: [{ text: 'A' }, { text: 'B' }],
  correctChoiceIndex: 0, wrongConsequence: 'Wrong', reasoning: 'Reason',
  docTitle: 'Doc', docUrl: 'https://example.com',
})

const makeDecision = (stepId: string, isCorrect: boolean): ScenarioDecision => ({
  stepId, choiceIndex: isCorrect ? 0 : 1, isCorrect,
})

const STEPS = [makeStep('s1'), makeStep('s2'), makeStep('s3'), makeStep('s4'), makeStep('s5')]

describe('scoreScenario', () => {
  it('returns score 100 and passed when all decisions correct', () => {
    const decisions = STEPS.map(s => makeDecision(s.id, true))
    const result = scoreScenario(decisions, STEPS)
    expect(result.score).toBe(100)
    expect(result.passed).toBe(true)
  })

  it('returns score 0 and not passed when all decisions wrong', () => {
    const decisions = STEPS.map(s => makeDecision(s.id, false))
    const result = scoreScenario(decisions, STEPS)
    expect(result.score).toBe(0)
    expect(result.passed).toBe(false)
  })

  it('returns score 60 and not passed for 3/5 correct', () => {
    const decisions = [
      makeDecision('s1', true), makeDecision('s2', true), makeDecision('s3', true),
      makeDecision('s4', false), makeDecision('s5', false),
    ]
    const result = scoreScenario(decisions, STEPS)
    expect(result.score).toBe(60)
    expect(result.passed).toBe(false)
  })

  it('returns score 80 and passed for 4/5 correct (boundary: >= 70 passes)', () => {
    const decisions = [
      makeDecision('s1', true), makeDecision('s2', true), makeDecision('s3', true),
      makeDecision('s4', true), makeDecision('s5', false),
    ]
    const result = scoreScenario(decisions, STEPS)
    expect(result.score).toBe(80)
    expect(result.passed).toBe(true)
  })

  it('returns score 0 for empty steps (zero-division guard)', () => {
    const result = scoreScenario([], [])
    expect(result.score).toBe(0)
    expect(result.passed).toBe(false)
  })

  it('rounds fractional score with Math.round', () => {
    // 2/3 = 66.666... → rounds to 67
    const threeSteps = [makeStep('a'), makeStep('b'), makeStep('c')]
    const decisions = [makeDecision('a', true), makeDecision('b', true), makeDecision('c', false)]
    const result = scoreScenario(decisions, threeSteps)
    expect(result.score).toBe(67)
    expect(result.passed).toBe(false) // 67 < 70
  })
})
