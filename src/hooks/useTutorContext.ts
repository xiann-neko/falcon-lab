import { useState, useEffect } from 'react'
import { db } from '../db'
import type { CompetencyRecord, QuizHistoryEntry } from '../db/schema'
import { getModule, getTrack, getDomainModules, DOMAINS } from '../content'
import { moduleReadinessScore, domainReadinessScore, overallSmeReadiness } from '../engine'

export interface WrongAnswer {
  questionText: string
  studentAnswer: string
  correctAnswer: string
  docUrl: string
}

export interface StudentContext {
  moduleName: string
  trackTitle: string
  domainId: string
  competencyLevel: string
  quizScore: number | null
  quizCorrect: number
  quizTotal: number
  recentWrongAnswers: WrongAnswer[]
  overallSmeReadiness: number
  completedModuleTitles: string[]
}

export interface TutorContextState {
  context: StudentContext | null
  loading: boolean
}

export function useTutorContext(): TutorContextState {
  const [state, setState] = useState<TutorContextState>({ context: null, loading: true })

  useEffect(() => {
    let cancelled = false

    async function load() {
      const appEntry = await db.appState.get('currentModuleId')
      if (!appEntry) {
        if (!cancelled) setState({ context: null, loading: false })
        return
      }

      const moduleId = appEntry.value
      const mod = getModule(moduleId)
      if (!mod) {
        if (!cancelled) setState({ context: null, loading: false })
        return
      }

      const track = getTrack(mod.trackId)

      const [competencyRec, quizHistoryEntries, allCompetency] = await Promise.all([
        db.competency.get(moduleId),
        db.quizHistory.where('moduleId').equals(moduleId).toArray(),
        db.competency.toArray(),
      ])

      if (cancelled) return

      // Group quiz history by questionId, take most recent entry per question
      const latestByQuestion = new Map<string, QuizHistoryEntry>()
      const sorted = [...quizHistoryEntries].sort((a, b) => b.answeredAt.localeCompare(a.answeredAt))
      for (const entry of sorted) {
        if (!latestByQuestion.has(entry.questionId)) {
          latestByQuestion.set(entry.questionId, entry)
        }
      }

      const recentEntries = Array.from(latestByQuestion.values())
      const quizCorrect = recentEntries.filter(e => e.isCorrect).length
      const quizTotal = mod.quiz.length

      const wrongEntries = recentEntries.filter(e => !e.isCorrect)
      const recentWrongAnswers: WrongAnswer[] = wrongEntries.flatMap(entry => {
        const q = mod.quiz.find(q => q.id === entry.questionId)
        if (!q) return []
        return [{
          questionText: q.text,
          studentAnswer: q.options[entry.selectedAnswer] ?? 'Unknown',
          correctAnswer: q.options[q.correctIndex],
          docUrl: q.docUrl,
        }]
      })

      // Compute overall SME readiness from all competency records
      const byModule = new Map<string, CompetencyRecord>()
      for (const r of allCompetency) byModule.set(r.moduleId, r)

      const domainScores = DOMAINS.map(domain => {
        const modules = getDomainModules(domain.id)
        const moduleScores = modules.map(m => {
          const rec = byModule.get(m.id)
          return moduleReadinessScore(rec?.quizScore ?? null, rec?.challengeScore ?? null, rec?.scenarioScore ?? null)
        })
        return domainReadinessScore(moduleScores)
      })

      const smeReadiness = Math.round(overallSmeReadiness(domainScores))

      // Resolve completed module titles
      const completedModuleTitles = allCompetency.flatMap(r => {
        const m = getModule(r.moduleId)
        return m ? [m.title] : []
      })

      setState({
        context: {
          moduleName: mod.title,
          trackTitle: track?.title ?? mod.trackId,
          domainId: mod.domainId,
          competencyLevel: competencyRec?.level ?? 'No data',
          quizScore: competencyRec?.quizScore ?? null,
          quizCorrect,
          quizTotal,
          recentWrongAnswers,
          overallSmeReadiness: smeReadiness,
          completedModuleTitles,
        },
        loading: false,
      })
    }

    load()
    return () => { cancelled = true }
  }, [])

  return state
}
