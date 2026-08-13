import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { db } from '../../db'
import { DomainPage } from './DomainPage'
import { ModulePage } from './ModulePage'
import { ScenarioPage } from './ScenarioPage'

function renderAt(path: string, element: React.ReactElement) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="*" element={element} />
      </Routes>
    </MemoryRouter>
  )
}

describe('DomainPage', () => {
  it('renders domain title for SIEM', () => {
    renderAt('/siem', <DomainPage domainId="siem" />)
    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent(/LogScale/i)
  })

  it('renders "Content coming soon" for a stub domain', () => {
    renderAt('/soar', <DomainPage domainId="soar" />)
    expect(screen.getByText(/content coming soon/i)).toBeInTheDocument()
  })

  it('renders module links for SIEM Track 1.1', () => {
    renderAt('/siem', <DomainPage domainId="siem" />)
    expect(screen.getByText(/What is LogScale/i)).toBeInTheDocument()
  })
})

describe('ModulePage', () => {
  beforeEach(async () => {
    await db.competency.clear()
    await db.quizHistory.clear()
  })

  it('shows "Module not found" for an unknown ID', () => {
    render(
      <MemoryRouter initialEntries={['/siem/module/does-not-exist']}>
        <Routes>
          <Route path="/siem/module/:moduleId" element={<ModulePage />} />
        </Routes>
      </MemoryRouter>
    )
    expect(screen.getByText(/module not found/i)).toBeInTheDocument()
  })

  it('renders the concept phase for a real module', () => {
    render(
      <MemoryRouter initialEntries={['/siem/module/siem-logscale-what-is']}>
        <Routes>
          <Route path="/siem/module/:moduleId" element={<ModulePage />} />
        </Routes>
      </MemoryRouter>
    )
    expect(screen.getByRole('button', { name: /start quiz/i })).toBeInTheDocument()
  })

  it('advances to quiz phase when Start Quiz is clicked', () => {
    render(
      <MemoryRouter initialEntries={['/siem/module/siem-logscale-what-is']}>
        <Routes>
          <Route path="/siem/module/:moduleId" element={<ModulePage />} />
        </Routes>
      </MemoryRouter>
    )
    fireEvent.click(screen.getByRole('button', { name: /start quiz/i }))
    expect(screen.getByText(/Question 1 of/i)).toBeInTheDocument()
  })
})

describe('ScenarioPage', () => {
  it('renders "Scenario not found" for an unknown track ID', () => {
    render(
      <MemoryRouter initialEntries={['/siem/scenario/track/unknown-track']}>
        <Routes>
          <Route path="/siem/scenario/track/:trackId" element={<ScenarioPage />} />
        </Routes>
      </MemoryRouter>
    )
    expect(screen.getByText(/scenario not found/i)).toBeInTheDocument()
  })

  it('renders a heading for the siem-logscale-foundations track scenario', () => {
    render(
      <MemoryRouter initialEntries={['/siem/scenario/track/siem-logscale-foundations']}>
        <Routes>
          <Route path="/siem/scenario/track/:trackId" element={<ScenarioPage />} />
        </Routes>
      </MemoryRouter>
    )
    expect(screen.getByRole('heading', { level: 2 })).toBeInTheDocument()
  })
})
