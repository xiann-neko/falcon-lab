import { Link } from 'react-router-dom'
import { getDomain } from '../../content'
import { useDomainProgress } from '../../hooks/useDomainProgress'
import { CompetencyBadge } from './CompetencyBadge'
import { CompetencyLevel } from '../../engine'

interface Props { domainId: string }

export function DomainPage({ domainId }: Props) {
  const domain   = getDomain(domainId)
  const progress = useDomainProgress(domainId)

  if (!domain) return <div className="p-8 text-brand-muted">Domain not found.</div>

  return (
    <div className="p-8 max-w-3xl">
      <h2 className="text-3xl font-bold text-brand-text mb-1">
        {domain.emoji} {domain.title}
      </h2>

      <div className="mt-8 space-y-8">
        {domain.tracks.length === 0 ? (
          <p className="text-brand-muted">Content coming soon.</p>
        ) : (
          domain.tracks.map(track => {
            const trackModuleIds = track.modules.map(m => m.id)
            const allDone = trackModuleIds.length > 0 &&
              trackModuleIds.every(id => progress.some(r => r.moduleId === id))

            return (
              <section key={track.id}>
                <h3 className="text-lg font-semibold text-brand-text mb-3 pb-2 border-b border-brand-border">
                  {track.title}
                </h3>
                <div className="space-y-2">
                  {track.modules.map(mod => {
                    const rec = progress.find(r => r.moduleId === mod.id)
                    return (
                      <Link
                        key={mod.id}
                        to={`module/${mod.id}`}
                        className="flex items-center justify-between p-4 bg-brand-surface border border-brand-border rounded hover:border-brand-accent transition-colors"
                      >
                        <span className="text-brand-text">{mod.title}</span>
                        {rec
                          ? <CompetencyBadge level={rec.level as CompetencyLevel} />
                          : <span className="text-brand-muted text-sm">Not started</span>
                        }
                      </Link>
                    )
                  })}
                </div>

                {allDone && track.scenario.steps.length > 0 && (
                  <Link
                    to={`scenario/track/${track.id}`}
                    className="mt-3 inline-flex items-center gap-2 px-4 py-2 bg-brand-accent text-white rounded font-medium text-sm hover:opacity-90"
                  >
                    🎯 Track Scenario: {track.scenario.title}
                  </Link>
                )}
              </section>
            )
          })
        )}
      </div>
    </div>
  )
}
