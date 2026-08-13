import { DOMAINS } from '../content'
import { useAllProgress } from '../hooks/useAllProgress'
import { ReadinessBar } from '../features/dashboard/ReadinessBar'
import { DomainCard } from '../features/dashboard/DomainCard'
import { ContinueCard } from '../features/dashboard/ContinueCard'
import { DueReviewCard } from '../features/dashboard/DueReviewCard'

const DOMAIN_ROUTES: Record<string, string> = {
  'siem':         '/siem',
  'soar':         '/soar',
  'ltr':          '/ltr',
  'charlotte-ai': '/charlotte',
  'platform':     '/platform',
}

export default function DashboardPage() {
  const { domainScores, overallScore, loading } = useAllProgress()

  if (loading) {
    return <div className="p-8 text-brand-muted">Loading...</div>
  }

  return (
    <div className="p-6 space-y-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-brand-text">Dashboard</h1>

      {/* Overall SME Readiness */}
      <section className="p-4 bg-brand-surface border border-brand-border rounded-lg space-y-3">
        <h2 className="text-lg font-semibold text-brand-text">SME Readiness</h2>
        <ReadinessBar score={overallScore} label="Overall" />
      </section>

      {/* Continue card — null when no module visited yet */}
      <ContinueCard />

      {/* Due for review — null while loading, "no reviews" or count card when ready */}
      <DueReviewCard />

      {/* Domain readiness cards */}
      <section>
        <h2 className="text-lg font-semibold text-brand-text mb-3">Domains</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {DOMAINS.map(domain => (
            <DomainCard
              key={domain.id}
              id={domain.id}
              title={domain.title}
              emoji={domain.emoji}
              href={DOMAIN_ROUTES[domain.id] ?? `/${domain.id}`}
              score={domainScores[domain.id] ?? 0}
            />
          ))}
        </div>
      </section>
    </div>
  )
}
