import 'fake-indexeddb/auto'
import { renderHook, waitFor } from '@testing-library/react'
import { db } from '../db'
import { getAllModules } from '../content'
import { useTutorContext } from './useTutorContext'

const MOD = getAllModules()[0]

beforeEach(async () => {
  await db.competency.clear()
  await db.quizHistory.clear()
  await db.appState.clear()
})

describe('useTutorContext', () => {
  it('returns null context when no currentModuleId is set', async () => {
    const { result } = renderHook(() => useTutorContext())
    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.context).toBeNull()
  })

  it('returns null context for an unknown moduleId', async () => {
    await db.appState.put({ key: 'currentModuleId', value: 'nonexistent-module' })
    const { result } = renderHook(() => useTutorContext())
    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.context).toBeNull()
  })

  it('returns context with module name and no quiz history', async () => {
    await db.appState.put({ key: 'currentModuleId', value: MOD.id })
    const { result } = renderHook(() => useTutorContext())
    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.context).not.toBeNull()
    expect(result.current.context!.moduleName).toBe(MOD.title)
  })

  it('returns competency level from DB record', async () => {
    await db.appState.put({ key: 'currentModuleId', value: MOD.id })
    await db.competency.put({
      moduleId: MOD.id,
      level: 'aware' as any,
      quizScore: 70,
      challengeScore: null,
      scenarioScore: null,
      updatedAt: '2026-08-13',
    })
    const { result } = renderHook(() => useTutorContext())
    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.context!.competencyLevel).toBe('aware')
    expect(result.current.context!.quizScore).toBe(70)
  })

  it('identifies wrong answers from most recent quiz attempt', async () => {
    await db.appState.put({ key: 'currentModuleId', value: MOD.id })
    const q = MOD.quiz[0]
    // Wrong answer — older attempt
    await db.quizHistory.add({
      moduleId: MOD.id,
      questionId: q.id,
      selectedAnswer: (q.correctIndex + 1) % 4,
      isCorrect: false,
      answeredAt: '2026-08-12T10:00:00.000Z',
    })
    // Correct answer — newer attempt
    await db.quizHistory.add({
      moduleId: MOD.id,
      questionId: q.id,
      selectedAnswer: q.correctIndex,
      isCorrect: true,
      answeredAt: '2026-08-13T10:00:00.000Z',
    })
    const { result } = renderHook(() => useTutorContext())
    await waitFor(() => expect(result.current.loading).toBe(false))
    // Most recent attempt was correct, so no wrong answers
    expect(result.current.context!.recentWrongAnswers).toHaveLength(0)
  })

  it('includes completed module titles from competency table', async () => {
    await db.appState.put({ key: 'currentModuleId', value: MOD.id })
    await db.competency.put({
      moduleId: MOD.id,
      level: 'novice' as any,
      quizScore: 50,
      challengeScore: null,
      scenarioScore: null,
      updatedAt: '2026-08-13',
    })
    const { result } = renderHook(() => useTutorContext())
    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.context!.completedModuleTitles).toContain(MOD.title)
  })
})
