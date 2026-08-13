import { useTutorSettings } from '../../hooks/useTutorSettings'

const MODEL_OPTIONS = [
  { value: 'claude-sonnet-5',          label: 'Claude Sonnet 5 (Recommended)' },
  { value: 'claude-haiku-4-5-20251001', label: 'Claude Haiku 4.5 (Fastest)' },
  { value: 'claude-opus-5',             label: 'Claude Opus 5 (Most Capable)' },
]

export function TutorSettings() {
  const { settings, loading, setMode, setApiKey, setModel } = useTutorSettings()

  if (loading) return <div className="text-brand-muted text-sm">Loading…</div>

  return (
    <div className="space-y-4">
      {/* Mode radio group */}
      <fieldset className="space-y-2">
        <legend className="text-sm font-medium text-brand-text">Tutor Mode</legend>
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="radio"
            name="tutorMode"
            value="clipboard"
            checked={settings.mode === 'clipboard'}
            onChange={() => setMode('clipboard')}
            className="accent-brand-accent"
            aria-label="Clipboard Mode"
          />
          <span className="text-brand-text text-sm">Clipboard Mode</span>
          <span className="text-brand-muted text-xs">— copy the prompt to paste into Claude.ai</span>
        </label>
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="radio"
            name="tutorMode"
            value="apikey"
            checked={settings.mode === 'apikey'}
            onChange={() => setMode('apikey')}
            className="accent-brand-accent"
            aria-label="API Key Mode"
          />
          <span className="text-brand-text text-sm">API Key Mode</span>
          <span className="text-brand-muted text-xs">— streams responses inline from your Anthropic account</span>
        </label>
      </fieldset>

      {/* API key + model selector — shown only in apikey mode */}
      {settings.mode === 'apikey' && (
        <div className="space-y-3 pl-4 border-l border-brand-border">
          <div className="space-y-1">
            <label htmlFor="tutor-api-key" className="block text-sm text-brand-text">
              API Key
            </label>
            <input
              id="tutor-api-key"
              type="password"
              aria-label="API Key"
              value={settings.apiKey}
              onChange={e => setApiKey(e.target.value)}
              placeholder="sk-ant-api…"
              className="w-full px-3 py-2 bg-brand-bg border border-brand-border rounded text-brand-text text-sm placeholder:text-brand-muted focus:outline-none focus:border-brand-accent"
            />
            <p className="text-brand-muted text-xs">
              Your key is stored locally in IndexedDB and never sent anywhere except directly to api.anthropic.com.
            </p>
          </div>
          <div className="space-y-1">
            <label htmlFor="tutor-model" className="block text-sm text-brand-text">
              Model
            </label>
            <select
              id="tutor-model"
              aria-label="Model"
              value={settings.model}
              onChange={e => setModel(e.target.value)}
              className="w-full px-3 py-2 bg-brand-bg border border-brand-border rounded text-brand-text text-sm focus:outline-none focus:border-brand-accent"
            >
              {MODEL_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
        </div>
      )}
    </div>
  )
}
