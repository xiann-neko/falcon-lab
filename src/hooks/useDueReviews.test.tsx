import { renderHook, waitFor } from '@testing-library/react'
import 'fake-indexeddb/auto'
import { db } from '../db'
import { useDueReviews } from './useDueReviews'

beforeEach(async () => {
  await db.delete()
  await db.open()
})

describe('useDueReviews', () => {
  it('returns loading:true initially then loading:false', async () => {
    const { result } = renderHook(() => useDueReviews())
    expect(result.current.loading).toBe(true)
    await waitFor(() => expect(result.current.loading).toBe(false))
  })

  it('returns count:0 when no items are due', async () => {
    const future = new Date(Date.now() + 7 * 86400000).toISOString()
    await db.spacedRepetition.add({ questionId: 'q1', moduleId: 'm1', dueDate: future, retryCount: 0 })
    const { result } = renderHook(() => useDueReviews())
    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.count).toBe(0)
  })

  it('returns past-due items and ignores future ones', async () => {
    const past   = new Date(Date.now() - 86400000).toISOString()  // yesterday
    const future = new Date(Date.now() + 86400000).toISOString()  // tomorrow
    await db.spacedRepetition.add({ questionId: 'q1', moduleId: 'm1', dueDate: past,   retryCount: 0 })
    await db.spacedRepetition.add({ questionId: 'q2', moduleId: 'm1', dueDate: future, retryCount: 1 })

    const { result } = renderHook(() => useDueReviews())
    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.count).toBe(1)
    expect(result.current.items).toHaveLength(1)
    expect(result.current.items[0].questionId).toBe('q1')
  })
})
