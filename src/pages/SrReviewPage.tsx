import { useNavigate } from 'react-router-dom'
import { useDueReviews } from '../hooks/useDueReviews'
import { SrReviewRunner } from '../features/sr-review/SrReviewRunner'

export default function SrReviewPage() {
  const navigate = useNavigate()
  const { items, count, loading } = useDueReviews()

  if (loading) {
    return <div className="p-8 text-brand-muted">Loading review queue...</div>
  }

  if (count === 0) {
    return (
      <div className="p-8 space-y-4">
        <h2 className="text-2xl font-bold text-brand-text">Spaced Repetition Review</h2>
        <p className="text-brand-muted">No items due for review. Great job staying current!</p>
        <button
          className="px-6 py-2 bg-brand-surface border border-brand-border text-brand-text rounded hover:border-brand-accent transition-colors"
          onClick={() => navigate('/')}
        >
          ← Back to Dashboard
        </button>
      </div>
    )
  }

  return (
    <div className="p-8 max-w-2xl">
      <h2 className="text-2xl font-bold text-brand-text mb-6">Spaced Repetition Review</h2>
      <SrReviewRunner items={items} onDone={() => navigate('/')} />
    </div>
  )
}
