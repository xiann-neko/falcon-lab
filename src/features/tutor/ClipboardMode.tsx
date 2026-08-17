import { useState } from 'react'
import { buildPrompt } from './buildPrompt'
import type { StudentContext } from '../../hooks/useTutorContext'

interface ClipboardModeProps {
  context: StudentContext | null
}

export function ClipboardMode({ context }: ClipboardModeProps) {
  const [question, setQuestion] = useState('')
  const [preview, setPreview] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  async function handleCopy() {
    const prompt = buildPrompt(context, question)
    await navigator.clipboard.writeText(prompt)
    setPreview(prompt)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <label htmlFor="tutor-question" className="block text-sm font-medium text-brand-text">
          Your Question
        </label>
        <textarea
          id="tutor-question"
          value={question}
          onChange={e => setQuestion(e.target.value)}
          placeholder="Type your question about CrowdStrike SIEM, SOAR, or related topics…"
          rows={4}
          className="w-full px-3 py-2 bg-brand-bg border border-brand-border rounded text-brand-text text-sm placeholder:text-brand-muted focus:outline-none focus:border-brand-accent resize-none"
        />
      </div>

      <button
        onClick={handleCopy}
        disabled={!question.trim()}
        className="px-5 py-2 bg-brand-accent text-white rounded font-medium text-sm hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition-opacity"
      >
        {copied ? '✓ Copied!' : 'Copy prompt for Claude.ai'}
      </button>

      {preview && (
        <section aria-label="Prompt Preview" className="space-y-2">
          <p className="text-brand-muted text-xs">Prompt preview — paste this into Claude.ai:</p>
          <textarea
            readOnly
            value={preview}
            rows={12}
            className="w-full px-3 py-2 bg-brand-bg border border-brand-border rounded text-brand-muted text-xs font-mono resize-none focus:outline-none"
            aria-label="Generated prompt"
          />
        </section>
      )}
    </div>
  )
}
