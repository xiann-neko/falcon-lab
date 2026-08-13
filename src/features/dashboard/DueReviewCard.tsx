import { Link } from 'react-router-dom'
import { useDueReviews } from '../../hooks/useDueReviews'

export function DueReviewCard() {
  const { count, loading } = useDueReviews()

  if (loading) return null

  if (count === 0) {
    return (
      <div className="p-4 bg-brand-surface border border-brand-border rounded-lg">
        <p className="text-brand-muted text-sm">🧠 No reviews due — check back later.</p>
      </div>
    )
  }

  return (
    <Link
      to="/review"
      className="block p-4 bg-brand-surface border border-brand-accent rounded-lg hover:opacity-90 transition-opacity"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-brand-text font-medium">🧠 Due for Review</p>
          <p className="text-brand-muted text-sm mt-1">
            {count} question{count !== 1 ? 's' : ''} ready
          </p>
        </div>
        <span className="text-brand-accent font-bold text-xl">→</span>
      </div>
    </Link>
  )
}
