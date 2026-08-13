import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { ReadinessBar } from './ReadinessBar'
import { DomainCard } from './DomainCard'

describe('ReadinessBar', () => {
  it('renders the label and score', () => {
    render(<ReadinessBar score={67} label="Overall" />)
    expect(screen.getByText('Overall')).toBeInTheDocument()
    expect(screen.getByText('67%')).toBeInTheDocument()
  })

  it('renders without a label', () => {
    render(<ReadinessBar score={50} />)
    expect(screen.getByRole('progressbar')).toBeInTheDocument()
  })

  it('progressbar has correct aria attributes', () => {
    render(<ReadinessBar score={42} label="SIEM" />)
    const bar = screen.getByRole('progressbar')
    expect(bar).toHaveAttribute('aria-valuenow', '42')
    expect(bar).toHaveAttribute('aria-valuemin', '0')
    expect(bar).toHaveAttribute('aria-valuemax', '100')
  })
})

describe('DomainCard', () => {
  it('renders domain title and score', () => {
    render(
      <MemoryRouter>
        <DomainCard id="siem" title="SIEM" emoji="📡" href="/siem" score={55} />
      </MemoryRouter>
    )
    expect(screen.getByText('SIEM')).toBeInTheDocument()
    expect(screen.getByText('55%')).toBeInTheDocument()
  })

  it('renders the emoji', () => {
    render(
      <MemoryRouter>
        <DomainCard id="soar" title="SOAR" emoji="⚡" href="/soar" score={0} />
      </MemoryRouter>
    )
    expect(screen.getByText('⚡')).toBeInTheDocument()
  })

  it('links to the correct href', () => {
    render(
      <MemoryRouter>
        <DomainCard id="ltr" title="LTR" emoji="🗄️" href="/ltr" score={20} />
      </MemoryRouter>
    )
    expect(screen.getByRole('link')).toHaveAttribute('href', '/ltr')
  })
})

import { waitFor } from '@testing-library/react'
import 'fake-indexeddb/auto'
import { db } from '../../db'
import { DueReviewCard } from './DueReviewCard'

describe('DueReviewCard', () => {
  beforeEach(async () => {
    await db.delete()
    await db.open()
  })

  it('shows "No reviews due" when queue is empty', async () => {
    render(<MemoryRouter><DueReviewCard /></MemoryRouter>)
    await waitFor(() => expect(screen.getByText(/No reviews due/i)).toBeInTheDocument())
  })

  it('shows due count and links to /review when items are due', async () => {
    const past = new Date(Date.now() - 86400000).toISOString()
    await db.spacedRepetition.add({ questionId: 'q1', moduleId: 'm1', dueDate: past, retryCount: 0 })
    await db.spacedRepetition.add({ questionId: 'q2', moduleId: 'm1', dueDate: past, retryCount: 0 })

    render(<MemoryRouter><DueReviewCard /></MemoryRouter>)
    await waitFor(() => expect(screen.getByText(/2 questions ready/i)).toBeInTheDocument())
    expect(screen.getByRole('link')).toHaveAttribute('href', '/review')
  })
})
