import { useState, useEffect } from 'react'
import { db } from '../db'
import type { CompetencyRecord } from '../db/schema'

/**
 * Reads the CompetencyRecord for a single module from Dexie.
 * Returns null if no record exists yet (module not started).
 */
export function useModuleProgress(moduleId: string): CompetencyRecord | null {
  const [record, setRecord] = useState<CompetencyRecord | null>(null)

  useEffect(() => {
    let cancelled = false
    setRecord(null)
    db.competency.get(moduleId).then(r => {
      if (!cancelled) setRecord(r ?? null)
    })
    return () => { cancelled = true }
  }, [moduleId])

  return record
}
