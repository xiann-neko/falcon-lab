import { Link } from 'react-router-dom'
import { ReadinessBar } from './ReadinessBar'

interface DomainCardProps {
  id:    string   // domain id, e.g. 'siem'
  title: string   // display name, e.g. 'SIEM'
  emoji: string
  href:  string   // route, e.g. '/siem'
  score: number   // 0–100
}

export function DomainCard({ id: _id, title, emoji, href, score }: DomainCardProps) {
  return (
    <Link
      to={href}
      className="block p-4 bg-brand-surface border border-brand-border rounded-lg hover:border-brand-accent transition-colors"
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-xl">{emoji}</span>
          <span className="font-medium text-brand-text">{title}</span>
        </div>
        <span className="text-brand-muted text-sm">{score}%</span>
      </div>
      <ReadinessBar score={score} />
    </Link>
  )
}
