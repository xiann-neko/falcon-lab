import type { ConceptSection } from '../../content/types'

interface Props { sections: ConceptSection[] }

export function ConceptReader({ sections }: Props) {
  return (
    <div className="space-y-6">
      {sections.map((section, i) => (
        <div key={i}>
          <h3 className="text-lg font-semibold text-brand-text mb-2">{section.title}</h3>
          <p className="text-brand-muted whitespace-pre-wrap leading-relaxed">{section.body}</p>
          {section.codeExample && (
            <pre className="mt-3 bg-brand-surface border border-brand-border rounded p-4 overflow-x-auto text-sm text-brand-text font-mono">
              <code>{section.codeExample}</code>
            </pre>
          )}
        </div>
      ))}
    </div>
  )
}
