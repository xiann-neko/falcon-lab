import { getAllModules, getModule } from '../content/registry'
import { scoreQuiz } from './quiz'

describe('engine integration', () => {
  it('scoreQuiz works with a real module from the registry', () => {
    const mod = getModule('siem-logscale-what-is')
    expect(mod).toBeDefined()
    // Answer all wrong — score should be 0
    const allWrong = mod!.quiz.map(() => -1)
    const result = scoreQuiz(allWrong, mod!.quiz)
    expect(result.score).toBe(0)
    expect(result.correct).toBe(0)
    expect(result.total).toBe(mod!.quiz.length)
  })

  it('all seed module questions have exactly 4 options and a valid correctIndex', () => {
    const modules = getAllModules()
    expect(modules.length).toBeGreaterThan(0)
    for (const mod of modules) {
      for (const q of mod.quiz) {
        expect(q.options, `question ${q.id} must have exactly 4 options`).toHaveLength(4)
        expect(q.correctIndex, `question ${q.id} correctIndex must be 0–3`).toBeGreaterThanOrEqual(0)
        expect(q.correctIndex, `question ${q.id} correctIndex must be 0–3`).toBeLessThanOrEqual(3)
      }
    }
  })
})
