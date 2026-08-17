import { useTutorContext } from '../hooks/useTutorContext'
import { useTutorSettings } from '../hooks/useTutorSettings'
import { ClipboardMode } from '../features/tutor/ClipboardMode'
import { ApiKeyMode } from '../features/tutor/ApiKeyMode'

export default function TutorPage() {
  const { context, loading: ctxLoading } = useTutorContext()
  const { settings, loading: settingsLoading } = useTutorSettings()

  if (ctxLoading || settingsLoading) {
    return <div className="p-8 text-brand-muted">Loading…</div>
  }

  return (
    <div className="p-6 space-y-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-brand-text">🧠 Claude Tutor</h1>

      {/* Context panel */}
      {context ? (
        <div className="bg-brand-surface border border-brand-border rounded p-4 space-y-1 text-sm">
          <p className="text-brand-muted">
            Currently studying:{' '}
            <span className="text-brand-text font-medium">{context.moduleName}</span>
          </p>
          <p className="text-brand-muted">
            Competency:{' '}
            <span className="text-brand-text">{context.competencyLevel}</span>
            {context.quizScore !== null && (
              <span className="text-brand-muted"> ({context.quizScore}%)</span>
            )}
          </p>
          <p className="text-brand-muted">
            SME readiness:{' '}
            <span className="text-brand-text">{context.overallSmeReadiness}%</span>
          </p>
          {context.recentWrongAnswers.length > 0 && (
            <p className="text-brand-muted">
              Recent mistakes:{' '}
              <span className="text-brand-text">{context.recentWrongAnswers.length} question{context.recentWrongAnswers.length !== 1 ? 's' : ''}</span>
              {' '}included in context
            </p>
          )}
        </div>
      ) : (
        <div className="bg-brand-surface border border-brand-border rounded p-4 text-sm text-brand-muted">
          No module selected yet — start a module to auto-populate your context.
          You can still ask general questions below.
        </div>
      )}

      {/* Mode dispatch */}
      {settings.mode === 'apikey' && settings.apiKey ? (
        <ApiKeyMode context={context} apiKey={settings.apiKey} model={settings.model} />
      ) : (
        <ClipboardMode context={context} />
      )}

      {settings.mode === 'apikey' && !settings.apiKey && (
        <p className="text-sm text-brand-muted border border-brand-border rounded px-3 py-2">
          API Key Mode is active but no key is set.{' '}
          <a href="/settings" className="text-brand-accent underline hover:no-underline">
            Add your key in Settings →
          </a>
        </p>
      )}
    </div>
  )
}
