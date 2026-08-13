import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getTrackScenario, getTrack } from '../../content'
import { db } from '../../db'
import { calculateCompetency, CompetencyLevel } from '../../engine'
import type { ScenarioDecision } from '../../db/schema'
import { ScenarioRunner } from './ScenarioRunner'

export function ScenarioPage() {
  const { trackId } = useParams<{ trackId: string }>()
  const navigate = useNavigate()
  const scenario = trackId ? getTrackScenario(trackId) : undefined
  const track    = trackId ? getTrack(trackId) : undefined
  const [done, setDone] = useState(false)
  const [score, setScore] = useState<number | null>(null)

  if (!scenario || !track) {
    return <div className="p-8 text-brand-muted">Scenario not found.</div>
  }

  async function handleComplete(decisions: ScenarioDecision[], finalScore: number, passed: boolean) {
    setScore(finalScore)
    setDone(true)

    // Write scenario history
    await db.scenarioHistory.add({
      scenarioId:  scenario!.id,
      decisions,
      finalScore,
      completedAt: new Date().toISOString(),
    })

    // Update each module's competency record with the scenario score
    for (const mod of track!.modules) {
      const existing = await db.competency.get(mod.id)
      const lvl = calculateCompetency({
        quizScore:      existing?.quizScore ?? null,
        challengeScore: existing?.challengeScore ?? null,
        scenarioPassed: passed,
        hasChallenge:   !!mod.challenge,
      })
      await db.competency.put({
        moduleId:       mod.id,
        level:          lvl,
        quizScore:      existing?.quizScore ?? null,
        challengeScore: existing?.challengeScore ?? null,
        scenarioScore:  finalScore,
        updatedAt:      new Date().toISOString().split('T')[0],
      })
    }
  }

  if (done) {
    return (
      <div className="p-8 max-w-3xl">
        <h2 className="text-2xl font-bold text-brand-text mb-4">
          {score !== null && score >= 70 ? '🎉 Scenario Complete!' : '📋 Scenario Complete'}
        </h2>
        <p className="text-brand-muted mb-2">
          Score: <span className="text-brand-text font-medium">{score}/100</span>
          {score !== null && score >= 70
            ? <span className="ml-2 text-green-400">— Passed</span>
            : <span className="ml-2 text-red-400">— Not yet passing (70 required)</span>
          }
        </p>
        <button
          className="mt-6 px-6 py-2 bg-brand-surface border border-brand-border text-brand-text rounded font-medium hover:border-brand-accent transition-colors"
          onClick={() => navigate(-1)}
        >
          ← Back to Domain
        </button>
      </div>
    )
  }

  return (
    <div className="p-8 max-w-3xl">
      <h2 className="text-2xl font-bold text-brand-text mb-2">{scenario.title}</h2>
      <p className="text-brand-muted mb-6 text-sm">{scenario.context}</p>
      <ScenarioRunner scenario={scenario} onComplete={handleComplete} />
    </div>
  )
}
