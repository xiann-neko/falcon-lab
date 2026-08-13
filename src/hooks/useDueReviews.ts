import { useState, useEffect } from 'react'
import { db } from '../db'
import type { SpacedRepetitionItem } from '../db/schema'

export interface DueReviews {
  items:   SpacedRepetitionItem[]
  count:   number
  loading: boolean
}

export function useDueReviews(): DueReviews {
  const [state, setState] = useState<DueReviews>({ items: [], count: 0, loading: true })

  useEffect(() => {
    let cancelled = false
    const now = new Date().toISOString()  // ISO datetime — dueDate is stored in same format

    db.spacedRepetition
      .where('dueDate')
      .belowOrEqual(now)
      .toArray()
      .then((items: SpacedRepetitionItem[]) => {
        if (!cancelled) setState({ items, count: items.length, loading: false })
      })

    return () => { cancelled = true }
  }, [])

  return state
}
