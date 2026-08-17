import { useState } from 'react'
import { buildPrompt } from './buildPrompt'
import type { StudentContext } from '../../hooks/useTutorContext'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

interface ApiKeyModeProps {
  context: StudentContext | null
  apiKey: string
  model: string
}

export function ApiKeyMode({ context, apiKey, model }: ApiKeyModeProps): JSX.Element {
  const [messages, setMessages] = useState<Message[]>([])
  const [question, setQuestion] = useState('')
  const [streaming, setStreaming] = useState(false)
  const [streamedContent, setStreamedContent] = useState('')
  const [error, setError] = useState<string | null>(null)

  async function handleSend() {
    if (!question.trim() || streaming) return

    const userContent =
      messages.length === 0
        ? buildPrompt(context, question) // first message: full 3-layer prompt
        : question // follow-ups: plain question

    const userMessage: Message = { role: 'user', content: question } // display the plain question
    const newMessages = [...messages, userMessage]
    setMessages(newMessages)
    setQuestion('')
    setStreaming(true)
    setStreamedContent('')
    setError(null)

    // Build API messages array: first call sends full prompt, follow-ups send plain questions
    const apiMessageHistory =
      messages.length === 0
        ? [{ role: 'user', content: userContent }]
        : [
            { role: 'user', content: buildPrompt(context, messages[0].content) },
            ...messages.slice(1).map(m => ({ role: m.role, content: m.content })),
            { role: 'user', content: question },
          ]

    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
          'anthropic-dangerous-direct-browser-access': 'true',
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          model,
          max_tokens: 2048,
          stream: true,
          messages: apiMessageHistory,
        }),
      })

      if (!response.ok) {
        setError(`API error: ${response.status} — check your API key in Settings.`)
        setStreaming(false)
        return
      }

      const reader = response.body!.getReader()
      const decoder = new TextDecoder()
      let buffer = ''
      let accumulated = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n\n')
        buffer = lines.pop() ?? ''

        for (const block of lines) {
          const dataLine = block.split('\n').find(l => l.startsWith('data: '))
          if (!dataLine) continue
          const data = dataLine.slice(6)
          try {
            const parsed = JSON.parse(data)
            if (parsed.type === 'content_block_delta' && parsed.delta?.type === 'text_delta') {
              accumulated += parsed.delta.text
              setStreamedContent(accumulated)
            }
          } catch {
            // malformed JSON — skip
          }
        }
      }

      setMessages(prev => [...prev, { role: 'assistant', content: accumulated }])
    } catch (err) {
      setError(`Network error — ${String(err)}`)
    } finally {
      setStreaming(false)
      setStreamedContent('')
    }
  }

  function handleClear() {
    setMessages([])
    setQuestion('')
    setStreamedContent('')
    setError(null)
  }

  return (
    <div className="space-y-4">
      {/* Conversation history */}
      {messages.length > 0 && (
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`rounded p-3 text-sm ${
                msg.role === 'user'
                  ? 'bg-brand-surface border border-brand-border text-brand-text ml-8'
                  : 'bg-brand-bg border border-brand-border text-brand-text mr-8'
              }`}
            >
              <p className="text-brand-muted text-xs mb-1">
                {msg.role === 'user' ? 'You' : 'Claude'}
              </p>
              <p className="whitespace-pre-wrap">{msg.content}</p>
            </div>
          ))}

          {/* Streaming response */}
          {streaming && streamedContent && (
            <div className="bg-brand-bg border border-brand-border rounded p-3 text-sm text-brand-text mr-8">
              <p className="text-brand-muted text-xs mb-1">Claude</p>
              <p className="whitespace-pre-wrap">{streamedContent}</p>
            </div>
          )}
          {streaming && !streamedContent && (
            <div className="bg-brand-bg border border-brand-border rounded p-3 text-sm text-brand-muted mr-8">
              Thinking…
            </div>
          )}
        </div>
      )}

      {/* Error message */}
      {error && (
        <p className="text-sm text-brand-accent border border-brand-accent rounded px-3 py-2">
          {error}
        </p>
      )}

      {/* Question input */}
      <div className="space-y-2">
        <textarea
          value={question}
          onChange={e => setQuestion(e.target.value)}
          onKeyDown={e => {
            if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleSend()
          }}
          placeholder="Type your question about CrowdStrike SIEM, SOAR, or related topics…"
          rows={3}
          disabled={streaming}
          className="w-full px-3 py-2 bg-brand-bg border border-brand-border rounded text-brand-text text-sm placeholder:text-brand-muted focus:outline-none focus:border-brand-accent resize-none disabled:opacity-60"
        />
        <div className="flex gap-2">
          <button
            onClick={handleSend}
            disabled={!question.trim() || streaming}
            className="px-5 py-2 bg-brand-accent text-white rounded font-medium text-sm hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition-opacity"
          >
            {streaming ? 'Sending…' : 'Send'}
          </button>
          {messages.length > 0 && (
            <button
              onClick={handleClear}
              disabled={streaming}
              className="px-4 py-2 bg-brand-surface border border-brand-border text-brand-text rounded text-sm hover:border-brand-accent transition-colors disabled:opacity-40"
            >
              Clear conversation
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
