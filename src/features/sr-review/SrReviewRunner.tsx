import { useState } from 'react'
import { db } from '../../db'
import { getModule } from '../../content'
import { scheduleDueDate, advanceRetryCount, shouldRetireItem } from '../../engine'
import type { SpacedRepetitionItem } from '../../db/schema'
import type { QuizQuestion } from '../../content/types'

export interface SrReviewRunnerProps {
  items:  SpacedRepetitionItem[]
  onDone: (reviewed: number, retired: number) => void
}

export function SrReviewRunner({ items, onDone }: SrReviewRunnerProps) {
  const [index,    setIndex]    = useState(0)
  const [selected, setSelected] = useState<number | null>(null)
  const [revealed, setRevealed] = useState(false)
  const [stats,    setStats]    = useState({ reviewed: 0, retired: 0 })

  // ── Completion screen ────────────────────────────────────────────────────────
  if (index >= items.length) {
    return (
      <div className="space-y-4 text-center p-8">
        <p className="text-brand-text text-xl font-semibold">Review complete!</p>
        <p className="text-brand-muted">
          {stats.reviewed} reviewed · {stats.retired} retired
        </p>
        <button
          className="px-6 py-2 bg-brand-accent text-white rounded font-medium hover:opacity-90"
          onClick={() => onDone(stats.reviewed, stats.retired)}
        >
          Back to Dashboard
        </button>
      </div>
    )
  }

  const item = items[index]
  const mod  = getModule(item.moduleId)
  const question: QuizQuestion | undefined = mod?.quiz.find(q => q.id === item.questionId)

  // ── Defensive guard: question not found in content ───────────────────────────
  if (!question) {
    return (
      <div className="p-8 space-y-4">
        <p className="text-brand-muted">Question not found — skipping.</p>
        <button
          className="px-4 py-2 bg-brand-surface border border-brand-border text-brand-text rounded hover:border-brand-accent"
          onClick={() => setIndex(i => i + 1)}
        >
          Skip
        </button>
      </div>
    )
  }

  const isCorrect = revealed && selected === question.correctIndex

  async function handleAnswer(idx: number) {
    if (revealed) return
    setSelected(idx)
    setRevealed(true)

    const correct = idx === question!.correctIndex
    if (correct) {
      const newRetryCount = advanceRetryCount(item.retryCount)
      const retire        = shouldRetireItem(newRetryCount)
      if (retire) {
        await db.spacedRepetition.delete(item.id!)
        setStats(s => ({ reviewed: s.reviewed + 1, retired: s.retired + 1 }))
      } else {
        await db.spacedRepetition.update(item.id!, {
          retryCount: newRetryCount,
          dueDate:    scheduleDueDate(newRetryCount),
        })
        setStats(s => ({ ...s, reviewed: s.reviewed + 1 }))
      }
    } else {
      // Wrong — reset retry count to 0, reschedule for tomorrow
      await db.spacedRepetition.update(item.id!, {
        retryCount: 0,
        dueDate:    scheduleDueDate(0),
      })
      setStats(s => ({ ...s, reviewed: s.reviewed + 1 }))
    }
  }

  function handleNext() {
    setSelected(null)
    setRevealed(false)
    setIndex(i => i + 1)
  }

  const isLast = index + 1 >= items.length

  return (
    <div className="space-y-4">
      <p className="text-brand-muted text-sm">Review {index + 1} of {items.length}</p>
      <p className="text-brand-text font-medium text-lg">{question.text}</p>

      <div className="space-y-2">
        {question.options.map((opt, i) => {
          let cls = 'w-full text-left p-3 rounded border text-sm transition-colors '
          if (!revealed) {
            cls += 'border-brand-border bg-brand-surface hover:border-brand-accent text-brand-text cursor-pointer'
          } else if (i === question!.correctIndex) {
            cls += 'border-green-500 bg-green-900/30 text-green-300'
          } else if (i === selected) {
            cls += 'border-red-500 bg-red-900/30 text-red-300'
          } else {
            cls += 'border-brand-border bg-brand-surface text-brand-muted'
          }
          return (
            <button key={i} className={cls} onClick={() => handleAnswer(i)} disabled={revealed}>
              {opt}
            </button>
          )
        })}
      </div>

      {revealed && (
        <div className="p-4 rounded border border-brand-border bg-brand-surface space-y-2">
          <p className={`font-semibold ${isCorrect ? 'text-green-400' : 'text-red-400'}`}>
            {isCorrect ? '✓ Correct' : '✗ Incorrect'}
          </p>
          <p className="text-brand-muted text-sm">{question.explanation}</p>
        </div>
      )}

      {revealed && (
        <button
          className="mt-2 px-6 py-2 bg-brand-accent text-white rounded font-medium hover:opacity-90"
          onClick={handleNext}
        >
          {isLast ? 'Finish Review' : 'Next'}
        </button>
      )}
    </div>
  )
}
