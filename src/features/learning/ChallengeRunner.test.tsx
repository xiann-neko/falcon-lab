import { render, screen, fireEvent } from '@testing-library/react'
import { vi } from 'vitest'
import { CqlChallengeRunner } from './CqlChallengeRunner'
import type { CqlChallenge } from '../../content/types'

const makeChallenge = (): CqlChallenge => ({
  type: 'cql', id: 'c1',
  prompt: 'Find all failed logins',
  scenario: 'Users are being locked out.',
  requiredComponents: ['event.type', 'Failed'],
  modelAnswer: '#event.type = "Login" | Failed',
  componentExplanations: { 'event.type': 'filter by type', 'Failed': 'filter failures' },
})

describe('CqlChallengeRunner', () => {
  it('renders prompt and scenario', () => {
    render(<CqlChallengeRunner challenge={makeChallenge()} onComplete={vi.fn()} />)
    expect(screen.getByText('Find all failed logins')).toBeInTheDocument()
    expect(screen.getByText('Users are being locked out.')).toBeInTheDocument()
  })

  it('submit button is disabled when the textarea is empty', () => {
    render(<CqlChallengeRunner challenge={makeChallenge()} onComplete={vi.fn()} />)
    expect(screen.getByRole('button', { name: /submit query/i })).toBeDisabled()
  })

  it('shows score and model answer after submit', () => {
    const onComplete = vi.fn()
    render(<CqlChallengeRunner challenge={makeChallenge()} onComplete={onComplete} />)
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'event.type Failed' } })
    fireEvent.click(screen.getByRole('button', { name: /submit query/i }))
    expect(screen.getByText(/Score: 100/)).toBeInTheDocument()
    expect(onComplete).toHaveBeenCalledOnce()
  })

  it('lists missing components for a partial match', () => {
    render(<CqlChallengeRunner challenge={makeChallenge()} onComplete={vi.fn()} />)
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'event.type' } })
    fireEvent.click(screen.getByRole('button', { name: /submit query/i }))
    expect(screen.getByText(/Missing:/i)).toBeInTheDocument()
  })
})
