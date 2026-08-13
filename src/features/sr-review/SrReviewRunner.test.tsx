import 'fake-indexeddb/auto'
import { vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { db } from '../../db'
import { SrReviewRunner } from './SrReviewRunner'
import type { SpacedRepetitionItem } from '../../db/schema'

// Mock content lookup so tests don't depend on seed data
vi.mock('../../content', () => ({
  getModule: (_id: string) => ({
    id: 'test-module',
    title: 'Test Module',
    quiz: [
      {
        id: 'q1',
        text: 'What is LogScale?',
        options: ['A log platform', 'B thing', 'C thing', 'D thing'],
        correctIndex: 0,
        explanation: 'LogScale is a log platform.',
        docTitle: 'Docs',
        docUrl: 'https://example.com',
      },
    ],
  }),
}))

// Mock engine SR functions so tests don't depend on timing
vi.mock('../../engine', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../../engine')>()
  return {
    ...actual,
    scheduleDueDate:   vi.fn(() => '2099-01-01T00:00:00.000Z'),
    advanceRetryCount: vi.fn((n: number) => n + 1),
    shouldRetireItem:  vi.fn(() => false),
  }
})

const makeItem = (id: number): SpacedRepetitionItem => ({
  id,
  questionId: 'q1',
  moduleId:   'test-module',
  dueDate:    '2026-01-01T00:00:00.000Z',
  retryCount: 0,
})

beforeEach(async () => {
  await db.delete()
  await db.open()
  // Pre-insert items so db.spacedRepetition.update/delete has a real row to target
  await db.spacedRepetition.add({ questionId: 'q1', moduleId: 'test-module', dueDate: '2026-01-01T00:00:00.000Z', retryCount: 0 })
})

describe('SrReviewRunner', () => {
  it('shows question text and progress indicator', () => {
    render(<SrReviewRunner items={[makeItem(1)]} onDone={vi.fn()} />)
    expect(screen.getByText('What is LogScale?')).toBeInTheDocument()
    expect(screen.getByText('Review 1 of 1')).toBeInTheDocument()
  })

  it('shows correct feedback after a correct answer', () => {
    render(<SrReviewRunner items={[makeItem(1)]} onDone={vi.fn()} />)
    fireEvent.click(screen.getAllByRole('button')[0])  // A = index 0 = correct
    expect(screen.getByText('✓ Correct')).toBeInTheDocument()
  })

  it('shows incorrect feedback after a wrong answer', () => {
    render(<SrReviewRunner items={[makeItem(1)]} onDone={vi.fn()} />)
    fireEvent.click(screen.getAllByRole('button')[1])  // B = index 1 = wrong
    expect(screen.getByText('✗ Incorrect')).toBeInTheDocument()
  })

  it('shows Finish Review on the last item', () => {
    render(<SrReviewRunner items={[makeItem(1)]} onDone={vi.fn()} />)
    fireEvent.click(screen.getAllByRole('button')[0])
    expect(screen.getByText('Finish Review')).toBeInTheDocument()
  })

  it('shows completion screen and calls onDone after finishing', async () => {
    const onDone = vi.fn()
    render(<SrReviewRunner items={[makeItem(1)]} onDone={onDone} />)
    fireEvent.click(screen.getAllByRole('button')[0])  // answer
    fireEvent.click(screen.getByText('Finish Review'))
    await waitFor(() => expect(screen.getByText(/Review complete/i)).toBeInTheDocument())
    fireEvent.click(screen.getByText('Back to Dashboard'))
    expect(onDone).toHaveBeenCalledOnce()
  })
})
