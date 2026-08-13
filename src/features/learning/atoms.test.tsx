import { render, screen } from '@testing-library/react'
import { ConceptReader } from './ConceptReader'
import { CompetencyBadge } from './CompetencyBadge'
import { CompetencyLevel } from '../../engine'
import type { ConceptSection } from '../../content/types'

describe('ConceptReader', () => {
  it('renders section title and body', () => {
    const sections: ConceptSection[] = [
      { title: 'What is LogScale?', body: 'A fast log management system.' },
    ]
    render(<ConceptReader sections={sections} />)
    expect(screen.getByText('What is LogScale?')).toBeInTheDocument()
    expect(screen.getByText('A fast log management system.')).toBeInTheDocument()
  })

  it('renders a code block when codeExample is present', () => {
    const sections: ConceptSection[] = [
      { title: 'Query', body: 'Run this.', codeExample: '#event.type = "Login"', codeLanguage: 'cql' },
    ]
    render(<ConceptReader sections={sections} />)
    expect(screen.getByText('#event.type = "Login"')).toBeInTheDocument()
    expect(document.querySelector('pre')).toBeTruthy()
  })

  it('does not render a code block when codeExample is absent', () => {
    const sections: ConceptSection[] = [{ title: 'Intro', body: 'Just text.' }]
    render(<ConceptReader sections={sections} />)
    expect(document.querySelector('pre')).toBeNull()
  })

  it('renders multiple sections in order', () => {
    const sections: ConceptSection[] = [
      { title: 'Section A', body: 'Body A.' },
      { title: 'Section B', body: 'Body B.' },
    ]
    render(<ConceptReader sections={sections} />)
    const headings = screen.getAllByRole('heading', { level: 3 })
    expect(headings[0]).toHaveTextContent('Section A')
    expect(headings[1]).toHaveTextContent('Section B')
  })
})

describe('CompetencyBadge', () => {
  it('renders Novice label', () => {
    render(<CompetencyBadge level={CompetencyLevel.Novice} />)
    expect(screen.getByText('Novice')).toBeInTheDocument()
  })

  it('renders SME label', () => {
    render(<CompetencyBadge level={CompetencyLevel.SME} />)
    expect(screen.getByText('SME')).toBeInTheDocument()
  })
})
