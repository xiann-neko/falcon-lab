import { useState, useEffect } from 'react'
import { db } from '../db'
import type { CompetencyRecord } from '../db/schema'
import { getDomainModules } from '../content'

/**
 * Reads all CompetencyRecords for every module in a domain.
 * Returns only records that exist (not-started modules are omitted).
 */
export function useDomainProgress(domainId: string): CompetencyRecord[] {
  const [records, setRecords] = useState<CompetencyRecord[]>([])

  useEffect(() => {
    let cancelled = false
    const moduleIds = getDomainModules(domainId).map(m => m.id)
    if (moduleIds.length === 0) {
      setRecords([])
      return
    }
    db.competency.bulkGet(moduleIds).then(results => {
      if (!cancelled) {
        setRecords(results.filter((r): r is CompetencyRecord => r !== undefined))
      }
    })
    return () => { cancelled = true }
  }, [domainId])

  return records
}
