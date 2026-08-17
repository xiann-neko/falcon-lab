import { vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { ApiKeyMode } from './ApiKeyMode'
import type { StudentContext } from '../../hooks/useTutorContext'

const CONTEXT: StudentContext = {
  moduleName: 'LogScale Fundamentals',
  trackTitle: 'SIEM Core',
  domainId: 'siem',
  competencyLevel: 'aware',
  quizScore: 70,
  quizCorrect: 7,
  quizTotal: 10,
  recentWrongAnswers: [],
  overallSmeReadiness: 42,
  completedModuleTitles: ['LogScale Fundamentals'],
}

function makeStreamMock(text: string) {
  const encoder = new TextEncoder()
  const chunks = [
    encoder.encode(`event: content_block_delta\ndata: {"type":"content_block_delta","delta":{"type":"text_delta","text":"${text}"}}\n\n`),
    encoder.encode('event: message_stop\ndata: {"type":"message_stop"}\n\n'),
  ]
  let idx = 0
  const reader = {
    read: vi.fn(() => {
      if (idx < chunks.length) return Promise.resolve({ done: false, value: chunks[idx++] })
      return Promise.resolve({ done: true, value: undefined })
    }),
    cancel: vi.fn(),
    releaseLock: vi.fn(),
  }
  return {
    ok: true,
    body: { getReader: () => reader },
  }
}

beforeEach(() => {
  vi.restoreAllMocks()
})

describe('ApiKeyMode', () => {
  it('renders the question textarea and send button', () => {
    render(<ApiKeyMode context={CONTEXT} apiKey="sk-ant-test" model="claude-sonnet-5" />)
    expect(screen.getByPlaceholderText(/type your question/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /send/i })).toBeInTheDocument()
  })

  it('send button is disabled when question is empty', () => {
    render(<ApiKeyMode context={CONTEXT} apiKey="sk-ant-test" model="claude-sonnet-5" />)
    expect(screen.getByRole('button', { name: /send/i })).toBeDisabled()
  })

  it('shows user message in conversation after send', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(makeStreamMock('Hello from Claude!')))
    render(<ApiKeyMode context={CONTEXT} apiKey="sk-ant-test" model="claude-sonnet-5" />)
    fireEvent.change(screen.getByPlaceholderText(/type your question/i), {
      target: { value: 'What is CQL?' },
    })
    fireEvent.click(screen.getByRole('button', { name: /send/i }))
    await waitFor(() => {
      expect(screen.getByText('What is CQL?')).toBeInTheDocument()
    })
  })

  it('shows streamed assistant response', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(makeStreamMock('CQL is great!')))
    render(<ApiKeyMode context={CONTEXT} apiKey="sk-ant-test" model="claude-sonnet-5" />)
    fireEvent.change(screen.getByPlaceholderText(/type your question/i), {
      target: { value: 'What is CQL?' },
    })
    fireEvent.click(screen.getByRole('button', { name: /send/i }))
    await waitFor(() => {
      expect(screen.getByText(/CQL is great!/)).toBeInTheDocument()
    })
  })

  it('sends correct headers to Anthropic API', async () => {
    const mockFetch = vi.fn().mockResolvedValue(makeStreamMock('OK'))
    vi.stubGlobal('fetch', mockFetch)
    render(<ApiKeyMode context={CONTEXT} apiKey="sk-ant-mykey" model="claude-sonnet-5" />)
    fireEvent.change(screen.getByPlaceholderText(/type your question/i), {
      target: { value: 'Hello?' },
    })
    fireEvent.click(screen.getByRole('button', { name: /send/i }))
    await waitFor(() => expect(mockFetch).toHaveBeenCalled())
    const [url, options] = mockFetch.mock.calls[0]
    expect(url).toBe('https://api.anthropic.com/v1/messages')
    expect(options.headers['x-api-key']).toBe('sk-ant-mykey')
    expect(options.headers['anthropic-version']).toBe('2023-06-01')
    expect(options.headers['anthropic-dangerous-direct-browser-access']).toBe('true')
  })

  it('shows error message when API responds with non-ok status', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, status: 401, body: null }))
    render(<ApiKeyMode context={CONTEXT} apiKey="sk-ant-bad" model="claude-sonnet-5" />)
    fireEvent.change(screen.getByPlaceholderText(/type your question/i), {
      target: { value: 'Hello?' },
    })
    fireEvent.click(screen.getByRole('button', { name: /send/i }))
    await waitFor(() => {
      expect(screen.getByText(/API error: 401/i)).toBeInTheDocument()
    })
  })

  it('shows clear conversation button after first exchange', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(makeStreamMock('Done!')))
    render(<ApiKeyMode context={CONTEXT} apiKey="sk-ant-test" model="claude-sonnet-5" />)
    fireEvent.change(screen.getByPlaceholderText(/type your question/i), {
      target: { value: 'Hello?' },
    })
    fireEvent.click(screen.getByRole('button', { name: /send/i }))
    await waitFor(() => screen.getByText(/Done!/))
    expect(screen.getByRole('button', { name: /clear/i })).toBeInTheDocument()
  })
})
