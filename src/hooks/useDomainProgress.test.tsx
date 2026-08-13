import { renderHook, act } from '@testing-library/react'
import { db } from '../db'
import { CompetencyLevel } from '../db/schema'
import { useDomainProgress } from './useDomainProgress'

describe('useDomainProgress', () => {
  beforeEach(async () => { await db.competency.clear() })

  it('returns empty array when no records exist for the domain', async () => {
    const { result } = renderHook(() => useDomainProgress('siem'))
    await act(async () => {})
    expect(result.current).toEqual([])
  })

  it('returns records for modules that have been completed', async () => {
    await db.competency.put({
      moduleId: 'siem-logscale-what-is', level: CompetencyLevel.Novice,
      quizScore: 30, challengeScore: null, scenarioScore: null, updatedAt: '2026-08-13',
    })
    const { result } = renderHook(() => useDomainProgress('siem'))
    await act(async () => {})
    expect(result.current).toHaveLength(1)
    expect(result.current[0].moduleId).toBe('siem-logscale-what-is')
  })

  it('returns empty array for a stub domain with no modules', async () => {
    const { result } = renderHook(() => useDomainProgress('soar'))
    await act(async () => {})
    expect(result.current).toEqual([])
  })
})
