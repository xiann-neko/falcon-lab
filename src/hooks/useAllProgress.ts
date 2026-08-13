import { useState, useEffect } from 'react'
import { db } from '../db'
import type { CompetencyRecord } from '../db/schema'
import { DOMAINS, getDomainModules } from '../content'
import { moduleReadinessScore, domainReadinessScore, overallSmeReadiness } from '../engine'

export interface AllProgress {
  domainScores: Record<string, number>
  overallScore: number
  loading:      boolean
}

export function useAllProgress(): AllProgress {
  const [progress, setProgress] = useState<AllProgress>({
    domainScores: {},
    overallScore: 0,
    loading:      true,
  })

  useEffect(() => {
    let cancelled = false

    db.competency.toArray().then((records: CompetencyRecord[]) => {
      if (cancelled) return

      const byModule = new Map<string, CompetencyRecord>()
      for (const r of records) byModule.set(r.moduleId, r)

      const domainScores: Record<string, number> = {}
      for (const domain of DOMAINS) {
        const modules = getDomainModules(domain.id)
        const moduleScores = modules.map(mod => {
          const rec = byModule.get(mod.id)
          return moduleReadinessScore(
            rec?.quizScore      ?? null,
            rec?.challengeScore ?? null,
            rec?.scenarioScore  ?? null,
          )
        })
        domainScores[domain.id] = domainReadinessScore(moduleScores)
      }

      const overall = overallSmeReadiness(Object.values(domainScores))
      setProgress({ domainScores, overallScore: overall, loading: false })
    })

    return () => { cancelled = true }
  }, [])

  return progress
}
