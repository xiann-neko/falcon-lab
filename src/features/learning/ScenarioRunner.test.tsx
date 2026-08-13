import { render, screen, fireEvent } from '@testing-library/react'
import { vi } from 'vitest'
import { ScenarioRunner } from './ScenarioRunner'
import type { Scenario } from '../../content/types'

const makeScenario = (): Scenario => ({
  id: 'test', title: 'Test Scenario', context: 'Some context', isCumulative: false,
  steps: [
    {
      id: 's1', narrative: 'Step 1 narrative',
      choices: [{ text: 'Good choice' }, { text: 'Bad choice' }],
      correctChoiceIndex: 0, wrongConsequence: 'That was wrong',
      reasoning: 'Good choice is better', docTitle: 'Doc', docUrl: 'https://example.com',
    },
    {
      id: 's2', narrative: 'Step 2 narrative',
      choices: [{ text: 'Option A' }, { text: 'Option B' }],
      correctChoiceIndex: 1, wrongConsequence: 'Wrong again',
      reasoning: 'Option B is correct', docTitle: 'Doc', docUrl: 'https://example.com',
    },
  ],
})

describe('ScenarioRunner', () => {
  it('renders the first step narrative', () => {
    render(<ScenarioRunner scenario={makeScenario()} onComplete={vi.fn()} />)
    expect(screen.getByText('Step 1 narrative')).toBeInTheDocument()
    expect(screen.getByText('Step 1 of 2')).toBeInTheDocument()
  })

  it('reveals reasoning after a choice is made', () => {
    render(<ScenarioRunner scenario={makeScenario()} onComplete={vi.fn()} />)
    fireEvent.click(screen.getByText('Good choice'))
    expect(screen.getByText('Good choice is better')).toBeInTheDocument()
  })

  it('shows wrong consequence for an incorrect choice', () => {
    render(<ScenarioRunner scenario={makeScenario()} onComplete={vi.fn()} />)
    fireEvent.click(screen.getByText('Bad choice'))
    expect(screen.getByText('That was wrong')).toBeInTheDocument()
  })

  it('advances to the next step', () => {
    render(<ScenarioRunner scenario={makeScenario()} onComplete={vi.fn()} />)
    fireEvent.click(screen.getByText('Good choice'))
    fireEvent.click(screen.getByText('Next Decision'))
    expect(screen.getByText('Step 2 narrative')).toBeInTheDocument()
  })

  it('calls onComplete with score 100 when all steps correct', () => {
    const onComplete = vi.fn()
    render(<ScenarioRunner scenario={makeScenario()} onComplete={onComplete} />)
    fireEvent.click(screen.getByText('Good choice')) // step 1 correct
    fireEvent.click(screen.getByText('Next Decision'))
    fireEvent.click(screen.getByText('Option B'))    // step 2 correct
    fireEvent.click(screen.getByText('Complete Scenario'))
    expect(onComplete).toHaveBeenCalledOnce()
    const [decisions, score, passed] = onComplete.mock.calls[0]
    expect(decisions).toHaveLength(2)
    expect(score).toBe(100)
    expect(passed).toBe(true)
  })

  it('renders empty-state message for a scenario with no steps', () => {
    const empty: Scenario = { id: 'e', title: 'E', context: '', isCumulative: false, steps: [] }
    render(<ScenarioRunner scenario={empty} onComplete={vi.fn()} />)
    expect(screen.getByText(/no steps yet/i)).toBeInTheDocument()
  })
})
