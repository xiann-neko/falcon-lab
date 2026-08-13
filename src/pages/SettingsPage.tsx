import { ExportImport } from '../features/settings/ExportImport'

export default function SettingsPage() {
  return (
    <div className="p-6 space-y-8 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-brand-text">Settings</h1>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-brand-text">Progress Data</h2>
        <p className="text-brand-muted text-sm">
          Export your progress to a JSON file and import it on another device (iPad, laptop) to keep your competency levels, quiz history, and spaced repetition queue in sync.
        </p>
        <ExportImport />
      </section>
    </div>
  )
}
