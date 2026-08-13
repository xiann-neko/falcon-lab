import { useState } from 'react'
import type { PlaybookChallenge, PlaybookStep } from '../../content/types'
import { scorePlaybookChallenge, type PlaybookChallengeResult } from '../../engine'

interface Props { challenge: PlaybookChallenge; onComplete: (r: PlaybookChallengeResult) => void }

export function PlaybookRunner({ challenge, onComplete }: Props) {
  // Lazy initializer so shuffle only runs once
  const [order,  setOrder]  = useState<PlaybookStep[]>(() =>
    [...challenge.steps].sort(() => Math.random() - 0.5)
  )
  const [result, setResult] = useState<PlaybookChallengeResult | null>(null)

  function swap(i: number, j: number) {
    if (result) return
    const next = [...order]
    ;[next[i], next[j]] = [next[j], next[i]]
    setOrder(next)
  }

  function handleSubmit() {
    const correctIds  = challenge.steps.map(s => s.id)
    const submittedIds = order.map(s => s.id)
    const r = scorePlaybookChallenge(submittedIds, correctIds)
    setResult(r)
    onComplete(r)
  }

  return (
    <div className="space-y-4">
      <p className="text-brand-text font-medium">{challenge.prompt}</p>
      <p className="text-brand-muted text-sm">{challenge.scenario}</p>

      <ol className="space-y-2">
        {order.map((step, i) => (
          <li key={step.id}
              className="flex items-center gap-3 bg-brand-surface border border-brand-border rounded p-3">
            <span className="text-brand-muted text-sm w-5 shrink-0">{i + 1}.</span>
            <span className="flex-1 text-brand-text text-sm">{step.label}</span>
            {!result && (
              <div className="flex gap-1">
                <button aria-label="Move up"   onClick={() => swap(i, i - 1)} disabled={i === 0}
                        className="px-2 py-1 text-brand-muted hover:text-brand-text disabled:opacity-30">↑</button>
                <button aria-label="Move down" onClick={() => swap(i, i + 1)} disabled={i === order.length - 1}
                        className="px-2 py-1 text-brand-muted hover:text-brand-text disabled:opacity-30">↓</button>
              </div>
            )}
            {result && (
              <span className={result.correctPositions[i] ? 'text-green-400' : 'text-red-400'}>
                {result.correctPositions[i] ? '✓' : '✗'}
              </span>
            )}
          </li>
        ))}
      </ol>

      {!result && (
        <button className="px-6 py-2 bg-brand-accent text-white rounded font-medium hover:opacity-90"
                onClick={handleSubmit}>
          Submit Order
        </button>
      )}
      {result && (
        <p className="text-brand-text font-semibold">Score: {result.score}/100</p>
      )}
    </div>
  )
}
