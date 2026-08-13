import { renderHook, waitFor } from '@testing-library/react'
import 'fake-indexeddb/auto'
import { db } from '../db'
import { CompetencyLevel } from '../engine'
import { getDomainModules } from '../content'
import { useAllProgress } from './useAllProgress'

beforeEach(async () => {
  await db.delete()
  await db.open()
})

describe('useAllProgress', () => {
  it('returns loading:true initially then loading:false', async () => {
    const { result } = renderHook(() => useAllProgress())
    expect(result.current.loading).toBe(true)
    await waitFor(() => expect(result.current.loading).toBe(false))
  })

  it('has an entry for all 5 domain IDs', async () => {
    const { result } = renderHook(() => useAllProgress())
    await waitFor(() => expect(result.current.loading).toBe(false))
    for (const id of ['siem', 'soar', 'ltr', 'charlotte-ai', 'platform']) {
      expect(result.current.domainScores).toHaveProperty(id)
    }
  })

  it('returns 0 for all domains when no competency records exist', async () => {
    const { result } = renderHook(() => useAllProgress())
    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.overallScore).toBe(0)
  })

  it('reflects a seeded competency record in the domain score', async () => {
    const modules = getDomainModules('siem')
    if (modules.length > 0) {
      await db.competency.put({
        moduleId:       modules[0].id,
        level:          CompetencyLevel.Practitioner,
        quizScore:      100,
        challengeScore: null,
        scenarioScore:  null,
        updatedAt:      new Date().toISOString(),
      })
    }
    const { result } = renderHook(() => useAllProgress())
    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.domainScores['siem']).toBeGreaterThan(0)
  })
})
