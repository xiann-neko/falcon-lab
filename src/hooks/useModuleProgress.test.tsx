import { renderHook, act } from '@testing-library/react'
import { db } from '../db'
import { CompetencyLevel } from '../engine'
import { useModuleProgress } from './useModuleProgress'

describe('useModuleProgress', () => {
  beforeEach(async () => { await db.competency.clear() })

  it('returns null when no record exists', async () => {
    const { result } = renderHook(() => useModuleProgress('does-not-exist'))
    await act(async () => {})
    expect(result.current).toBeNull()
  })

  it('returns the record when it exists', async () => {
    await db.competency.put({
      moduleId: 'siem-logscale-what-is', level: CompetencyLevel.Practitioner,
      quizScore: 80, challengeScore: null, scenarioScore: null, updatedAt: '2026-08-13',
    })
    const { result } = renderHook(() => useModuleProgress('siem-logscale-what-is'))
    await act(async () => {})
    expect(result.current?.level).toBe(CompetencyLevel.Practitioner)
    expect(result.current?.quizScore).toBe(80)
  })

  it('returns null when moduleId changes to one without a record', async () => {
    await db.competency.put({
      moduleId: 'siem-logscale-ingestion', level: CompetencyLevel.Aware,
      quizScore: 55, challengeScore: null, scenarioScore: null, updatedAt: '2026-08-13',
    })
    const { result, rerender } = renderHook(({ id }) => useModuleProgress(id), {
      initialProps: { id: 'siem-logscale-ingestion' },
    })
    await act(async () => {})
    expect(result.current?.level).toBe(CompetencyLevel.Aware)
    rerender({ id: 'siem-logscale-data-model' })
    await act(async () => {})
    expect(result.current).toBeNull()
  })
})
