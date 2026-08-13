import { render, screen, fireEvent } from '@testing-library/react'
import { vi } from 'vitest'
import { QuizRunner } from './QuizRunner'
import type { QuizQuestion } from '../../content/types'

const makeQ = (id: string, correctIndex = 0): QuizQuestion => ({
  id, text: `Question ${id}`, options: ['A', 'B', 'C', 'D'],
  correctIndex, explanation: `Explanation for ${id}`,
  docTitle: 'Doc', docUrl: 'https://example.com',
})

describe('QuizRunner', () => {
  it('shows the first question and progress', () => {
    render(<QuizRunner questions={[makeQ('q1')]} onComplete={vi.fn()} />)
    expect(screen.getByText('Question q1')).toBeInTheDocument()
    expect(screen.getByText('Question 1 of 1')).toBeInTheDocument()
  })

  it('reveals explanation after answering', () => {
    render(<QuizRunner questions={[makeQ('q1')]} onComplete={vi.fn()} />)
    fireEvent.click(screen.getAllByRole('button')[0])
    expect(screen.getByText('Explanation for q1')).toBeInTheDocument()
  })

  it('shows correct feedback for a right answer', () => {
    render(<QuizRunner questions={[makeQ('q1', 0)]} onComplete={vi.fn()} />)
    fireEvent.click(screen.getAllByRole('button')[0]) // A = index 0 = correct
    expect(screen.getByText('✓ Correct')).toBeInTheDocument()
  })

  it('shows incorrect feedback for a wrong answer', () => {
    render(<QuizRunner questions={[makeQ('q1', 0)]} onComplete={vi.fn()} />)
    fireEvent.click(screen.getAllByRole('button')[1]) // B = index 1 = wrong
    expect(screen.getByText('✗ Incorrect')).toBeInTheDocument()
  })

  it('calls onComplete with result after the last question', () => {
    const onComplete = vi.fn()
    render(<QuizRunner questions={[makeQ('q1', 0)]} onComplete={onComplete} />)
    fireEvent.click(screen.getAllByRole('button')[0]) // answer
    fireEvent.click(screen.getByText('See Results'))
    expect(onComplete).toHaveBeenCalledOnce()
    expect(onComplete.mock.calls[0][0]).toMatchObject({ score: 100, correct: 1, total: 1 })
    expect(onComplete.mock.calls[0][1]).toEqual([0]) // answers array
  })

  it('advances to the next question on Next', () => {
    render(<QuizRunner questions={[makeQ('q1'), makeQ('q2')]} onComplete={vi.fn()} />)
    fireEvent.click(screen.getAllByRole('button')[0]) // answer q1
    fireEvent.click(screen.getByText('Next Question'))
    expect(screen.getByText('Question q2')).toBeInTheDocument()
    expect(screen.getByText('Question 2 of 2')).toBeInTheDocument()
  })
})
