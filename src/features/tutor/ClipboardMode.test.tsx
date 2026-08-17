import { vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { ClipboardMode } from './ClipboardMode'
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

beforeEach(() => {
  Object.assign(navigator, {
    clipboard: { writeText: vi.fn().mockResolvedValue(undefined) },
  })
})

describe('ClipboardMode', () => {
  it('renders the question textarea', () => {
    render(<ClipboardMode context={CONTEXT} />)
    expect(screen.getByPlaceholderText(/type your question/i)).toBeInTheDocument()
  })

  it('renders the copy button', () => {
    render(<ClipboardMode context={CONTEXT} />)
    expect(screen.getByRole('button', { name: /copy prompt/i })).toBeInTheDocument()
  })

  it('copy button is disabled when question is empty', () => {
    render(<ClipboardMode context={CONTEXT} />)
    expect(screen.getByRole('button', { name: /copy prompt/i })).toBeDisabled()
  })

  it('copy button is enabled when question is not empty', async () => {
    render(<ClipboardMode context={CONTEXT} />)
    fireEvent.change(screen.getByPlaceholderText(/type your question/i), {
      target: { value: 'What is CQL?' },
    })
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /copy prompt/i })).not.toBeDisabled()
    })
  })

  it('copies generated prompt to clipboard on button click', async () => {
    render(<ClipboardMode context={CONTEXT} />)
    fireEvent.change(screen.getByPlaceholderText(/type your question/i), {
      target: { value: 'What is CQL?' },
    })
    fireEvent.click(screen.getByRole('button', { name: /copy prompt/i }))
    await waitFor(() => {
      expect(navigator.clipboard.writeText).toHaveBeenCalledOnce()
      const [calledWith] = (navigator.clipboard.writeText as ReturnType<typeof vi.fn>).mock.calls[0]
      expect(calledWith).toContain('What is CQL?')
      expect(calledWith).toContain('CrowdStrike SIEM and SOAR tutor')
    })
  })

  it('shows prompt preview after copying', async () => {
    render(<ClipboardMode context={CONTEXT} />)
    fireEvent.change(screen.getByPlaceholderText(/type your question/i), {
      target: { value: 'What is CQL?' },
    })
    fireEvent.click(screen.getByRole('button', { name: /copy prompt/i }))
    await waitFor(() => {
      expect(screen.getByRole('region', { name: /prompt preview/i })).toBeInTheDocument()
    })
  })

  it('works with null context', () => {
    render(<ClipboardMode context={null} />)
    expect(screen.getByPlaceholderText(/type your question/i)).toBeInTheDocument()
  })
})
