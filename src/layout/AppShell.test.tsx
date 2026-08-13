import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import 'fake-indexeddb/auto'
import { db } from '../db'
import AppShell, { NAV_ITEMS } from './AppShell'

beforeEach(async () => {
  await db.delete()
  await db.open()
})

function renderShell(initialPath = '/') {
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <AppShell />
    </MemoryRouter>
  )
}

test('renders all 7 navigation labels in the document', () => {
  renderShell()
  // Each label appears in both sidebar and tab bar, so getAllBy is fine
  NAV_ITEMS.forEach(item => {
    expect(screen.getAllByText(new RegExp(item.label, 'i')).length).toBeGreaterThan(0)
  })
})

test('Dashboard page content is shown at root path', async () => {
  renderShell('/')
  // The dashboard renders an h1 with "Dashboard" once useAllProgress hook resolves
  await waitFor(() => expect(screen.getByRole('heading', { name: /dashboard/i })).toBeInTheDocument())
})

test('SIEM page content is shown at /siem', () => {
  renderShell('/siem')
  expect(screen.getByRole('heading', { name: /siem/i })).toBeInTheDocument()
})

test('Tutor page content is shown at /tutor', () => {
  renderShell('/tutor')
  expect(screen.getByRole('heading', { name: /tutor/i })).toBeInTheDocument()
})

test('Settings page content is shown at /settings', () => {
  renderShell('/settings')
  expect(screen.getByRole('heading', { name: /settings/i })).toBeInTheDocument()
})
