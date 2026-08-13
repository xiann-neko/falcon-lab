import { Link } from 'react-router-dom'
import { useLastModule } from '../../hooks/useLastModule'

export function ContinueCard() {
  const lastModule = useLastModule()

  if (!lastModule) return null

  return (
    <Link
      to={lastModule.href}
      className="block p-4 bg-brand-surface border border-brand-border rounded-lg hover:border-brand-accent transition-colors"
    >
      <p className="text-brand-muted text-xs uppercase tracking-wide mb-1">
        Continue where you left off
      </p>
      <p className="text-brand-text font-medium">{lastModule.title}</p>
    </Link>
  )
}
