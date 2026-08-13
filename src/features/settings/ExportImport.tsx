import { useRef, useState } from 'react'
import { db } from '../../db'
import { CompetencyLevel } from '../../engine'
import { moduleReadinessScore, domainReadinessScore } from '../../engine'
import { DOMAINS, getDomainModules } from '../../content'
import type { QuizHistoryEntry, ScenarioHistoryEntry, SpacedRepetitionItem } from '../../db/schema'

interface FalconLabExport {
  exportedAt:       string
  version:          '1.0'
  competency:       Record<string, string>
  quizHistory:      Omit<QuizHistoryEntry, 'id'>[]
  scenarioHistory:  Omit<ScenarioHistoryEntry, 'id'>[]
  spacedRepetition: Omit<SpacedRepetitionItem, 'id'>[]
  domainReadiness:  Record<string, number>
}

export function ExportImport() {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [status, setStatus] = useState<string | null>(null)

  // ── Export ───────────────────────────────────────────────────────────────────
  async function handleExport() {
    const [competencyRecords, quizHistory, scenarioHistory, spacedRepetition] = await Promise.all([
      db.competency.toArray(),
      db.quizHistory.toArray(),
      db.scenarioHistory.toArray(),
      db.spacedRepetition.toArray(),
    ])

    // Competency: export level string only (per spec)
    const competency: Record<string, string> = {}
    for (const r of competencyRecords) competency[r.moduleId] = r.level

    // Domain readiness: compute from stored scores
    const domainReadiness: Record<string, number> = {}
    const byModule = new Map(competencyRecords.map(r => [r.moduleId, r]))
    for (const domain of DOMAINS) {
      const scores = getDomainModules(domain.id).map(mod => {
        const rec = byModule.get(mod.id)
        return moduleReadinessScore(rec?.quizScore ?? null, rec?.challengeScore ?? null, rec?.scenarioScore ?? null)
      })
      domainReadiness[domain.id] = domainReadinessScore(scores)
    }

    const data: FalconLabExport = {
      exportedAt:       new Date().toISOString(),
      version:          '1.0',
      competency,
      quizHistory:      quizHistory.map(({ id: _id, ...rest }) => rest),
      scenarioHistory:  scenarioHistory.map(({ id: _id, ...rest }) => rest),
      spacedRepetition: spacedRepetition.map(({ id: _id, ...rest }) => rest),
      domainReadiness,
    }

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement('a')
    a.href     = url
    a.download = `falcon-lab-progress-${new Date().toISOString().split('T')[0]}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  // ── Import ───────────────────────────────────────────────────────────────────
  function handleImportClick() {
    fileInputRef.current?.click()
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setStatus(null)

    try {
      const text = await file.text()
      const data: FalconLabExport = JSON.parse(text)

      if (data.version !== '1.0') {
        setStatus('Import failed: unsupported version.')
        return
      }

      const now = new Date().toISOString()

      // Clear existing data (leave appState intact)
      await Promise.all([
        db.competency.clear(),
        db.quizHistory.clear(),
        db.scenarioHistory.clear(),
        db.spacedRepetition.clear(),
      ])

      // Restore competency (minimal records — scores set to null)
      const competencyEntries = Object.entries(data.competency).map(([moduleId, levelStr]) => ({
        moduleId,
        level:          levelStr as CompetencyLevel,
        quizScore:      null,
        challengeScore: null,
        scenarioScore:  null,
        updatedAt:      now,
      }))
      if (competencyEntries.length > 0) await db.competency.bulkPut(competencyEntries)

      // Restore history tables
      if (data.quizHistory?.length)      await db.quizHistory.bulkAdd(data.quizHistory)
      if (data.scenarioHistory?.length)  await db.scenarioHistory.bulkAdd(data.scenarioHistory)
      if (data.spacedRepetition?.length) await db.spacedRepetition.bulkAdd(data.spacedRepetition)

      setStatus('Imported successfully. Reload the page to see updated progress.')
    } catch {
      setStatus('Import failed: invalid file format.')
    }

    // Reset input so the same file can be re-imported
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3">
        <button
          className="px-5 py-2 bg-brand-accent text-white rounded font-medium hover:opacity-90 transition-opacity"
          onClick={handleExport}
        >
          Export Progress
        </button>
        <button
          className="px-5 py-2 bg-brand-surface border border-brand-border text-brand-text rounded font-medium hover:border-brand-accent transition-colors"
          onClick={handleImportClick}
        >
          Import Progress
        </button>
        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="application/json,.json"
          className="hidden"
          onChange={handleFileChange}
        />
      </div>

      {status && (
        <p className={`text-sm ${status.startsWith('Import failed') ? 'text-red-400' : 'text-green-400'}`}>
          {status}
        </p>
      )}
    </div>
  )
}
