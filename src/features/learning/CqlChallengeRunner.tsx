import { useState } from 'react'
import type { CqlChallenge } from '../../content/types'
import { scoreCqlChallenge, type CqlChallengeResult } from '../../engine'

interface Props { challenge: CqlChallenge; onComplete: (r: CqlChallengeResult) => void }

export function CqlChallengeRunner({ challenge, onComplete }: Props) {
  const [query,  setQuery]  = useState('')
  const [result, setResult] = useState<CqlChallengeResult | null>(null)

  function handleSubmit() {
    const r = scoreCqlChallenge(query, challenge.requiredComponents)
    setResult(r)
    onComplete(r)
  }

  return (
    <div className="space-y-4">
      <p className="text-brand-text font-medium">{challenge.prompt}</p>
      <p className="text-brand-muted text-sm">{challenge.scenario}</p>

      <textarea
        className="w-full h-32 bg-brand-surface border border-brand-border rounded p-3 text-brand-text font-mono text-sm focus:outline-none focus:border-brand-accent resize-none"
        placeholder="Write your CQL query here…"
        value={query}
        onChange={e => setQuery(e.target.value)}
        disabled={result !== null}
        aria-label="CQL query input"
      />

      {result === null && (
        <button
          className="px-6 py-2 bg-brand-accent text-white rounded font-medium hover:opacity-90 disabled:opacity-40"
          onClick={handleSubmit}
          disabled={query.trim() === ''}
        >
          Submit Query
        </button>
      )}

      {result && (
        <div className="p-4 rounded border border-brand-border bg-brand-surface space-y-2">
          <p className="text-brand-text font-semibold">Score: {result.score}/100</p>
          {result.present.length > 0 && (
            <p className="text-green-400 text-sm">✓ Found: {result.present.join(', ')}</p>
          )}
          {result.missing.length > 0 && (
            <p className="text-red-400 text-sm">Missing: {result.missing.join(', ')}</p>
          )}
          <div className="mt-3 pt-3 border-t border-brand-border">
            <p className="text-brand-muted text-xs mb-2">Model answer:</p>
            <pre className="bg-brand-bg border border-brand-border rounded p-3 text-brand-text text-sm overflow-x-auto">
              <code>{challenge.modelAnswer}</code>
            </pre>
          </div>
        </div>
      )}
    </div>
  )
}
