import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getModule } from '../../content'
import { db } from '../../db'
import {
  calculateCompetency, createSrItem, CompetencyLevel,
  type QuizResult, type CqlChallengeResult, type PlaybookChallengeResult,
} from '../../engine'
import { ConceptReader } from './ConceptReader'
import { QuizRunner } from './QuizRunner'
import { ChallengeRunner } from './ChallengeRunner'
import { CompetencyBadge } from './CompetencyBadge'

type Phase = 'concepts' | 'quiz' | 'challenge' | 'done'

export function ModulePage() {
  const { moduleId } = useParams<{ moduleId: string }>()
  const navigate = useNavigate()
  const mod = moduleId ? getModule(moduleId) : undefined

  const [phase,          setPhase]          = useState<Phase>('concepts')
  const [quizResult,     setQuizResult]     = useState<QuizResult | null>(null)
  const [challengeScore, setChallengeScore] = useState<number | null>(null)
  const [level,          setLevel]          = useState<CompetencyLevel | null>(null)

  if (!mod) {
    return <div className="p-8 text-brand-muted">Module not found.</div>
  }

  async function handleQuizComplete(result: QuizResult, answers: number[]) {
    setQuizResult(result)
    const now = new Date().toISOString()

    // Persist quiz history
    await db.quizHistory.bulkAdd(
      mod!.quiz.map((q, i) => ({
        moduleId:       mod!.id,
        questionId:     q.id,
        selectedAnswer: answers[i],
        isCorrect:      answers[i] === q.correctIndex,
        answeredAt:     now,
      }))
    )

    // Spaced repetition — queue incorrect answers
    const wrong = mod!.quiz.filter((_, i) => answers[i] !== mod!.quiz[i].correctIndex)
    if (wrong.length > 0) {
      await db.spacedRepetition.bulkAdd(
        wrong.map(q => createSrItem(q.id, mod!.id))
      )
    }

    if (mod!.challenge) {
      setPhase('challenge')
    } else {
      await persistCompetency(result.score, null)
      setPhase('done')
    }
  }

  async function handleChallengeComplete(result: CqlChallengeResult | PlaybookChallengeResult) {
    setChallengeScore(result.score)
    await persistCompetency(quizResult!.score, result.score)
    setPhase('done')
  }

  async function persistCompetency(qs: number, cs: number | null) {
    const lvl = calculateCompetency({
      quizScore:      qs,
      challengeScore: cs,
      scenarioPassed: null,
      hasChallenge:   !!mod!.challenge,
    })
    setLevel(lvl)
    await db.competency.put({
      moduleId:       mod!.id,
      level:          lvl,
      quizScore:      qs,
      challengeScore: cs,
      scenarioScore:  null,
      updatedAt:      new Date().toISOString().split('T')[0],
    })
  }

  if (phase === 'concepts') {
    return (
      <div className="p-8 max-w-3xl">
        <h2 className="text-2xl font-bold text-brand-text mb-6">{mod.title}</h2>
        <ConceptReader sections={mod.concepts} />
        <button
          className="mt-8 px-6 py-2 bg-brand-accent text-white rounded font-medium hover:opacity-90"
          onClick={() => setPhase('quiz')}
        >
          Start Quiz →
        </button>
      </div>
    )
  }

  if (phase === 'quiz') {
    return (
      <div className="p-8 max-w-3xl">
        <h2 className="text-2xl font-bold text-brand-text mb-6">Quiz: {mod.title}</h2>
        <QuizRunner questions={mod.quiz} onComplete={handleQuizComplete} />
      </div>
    )
  }

  if (phase === 'challenge' && mod.challenge) {
    return (
      <div className="p-8 max-w-3xl">
        <h2 className="text-2xl font-bold text-brand-text mb-6">Challenge: {mod.title}</h2>
        <ChallengeRunner challenge={mod.challenge} onComplete={handleChallengeComplete} />
      </div>
    )
  }

  // done phase
  return (
    <div className="p-8 max-w-3xl">
      <h2 className="text-2xl font-bold text-brand-text mb-4">✓ Module Complete</h2>
      {quizResult && (
        <p className="text-brand-muted mb-1">Quiz score: <span className="text-brand-text font-medium">{quizResult.score}/100</span></p>
      )}
      {challengeScore !== null && (
        <p className="text-brand-muted mb-1">Challenge score: <span className="text-brand-text font-medium">{challengeScore}/100</span></p>
      )}
      {level && (
        <div className="mt-4 flex items-center gap-3">
          <span className="text-brand-muted">Competency level:</span>
          <CompetencyBadge level={level} />
        </div>
      )}
      <button
        className="mt-8 px-6 py-2 bg-brand-surface border border-brand-border text-brand-text rounded font-medium hover:border-brand-accent transition-colors"
        onClick={() => navigate(-1)}
      >
        ← Back to Domain
      </button>
    </div>
  )
}
