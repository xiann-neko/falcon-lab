import 'fake-indexeddb/auto'
import { vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { db } from '../../db'
import { CompetencyLevel } from '../../engine'
import { ExportImport } from './ExportImport'

// Mock URL.createObjectURL and URL.revokeObjectURL (not available in jsdom)
global.URL.createObjectURL = vi.fn(() => 'blob:mock')
global.URL.revokeObjectURL = vi.fn()

// Mock anchor click to prevent jsdom errors
const clickSpy = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {})

beforeEach(async () => {
  await db.delete()
  await db.open()
  clickSpy.mockClear()
})

describe('ExportImport', () => {
  it('renders Export and Import buttons', () => {
    render(<ExportImport />)
    expect(screen.getByRole('button', { name: /export/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /import/i })).toBeInTheDocument()
  })

  it('triggers a file download on Export click', async () => {
    render(<ExportImport />)
    fireEvent.click(screen.getByRole('button', { name: /export/i }))
    await waitFor(() => expect(clickSpy).toHaveBeenCalledOnce())
  })

  it('shows success message after valid import', async () => {
    const exportData = {
      exportedAt:      new Date().toISOString(),
      version:         '1.0',
      competency:      { 'siem-module-1': CompetencyLevel.Practitioner },
      quizHistory:     [],
      scenarioHistory: [],
      spacedRepetition: [],
      domainReadiness: { siem: 20, soar: 0, ltr: 0, 'charlotte-ai': 0, platform: 0 },
    }
    const file = new File([JSON.stringify(exportData)], 'test.json', { type: 'application/json' })

    render(<ExportImport />)

    // Simulate file selection by directly calling the file handler
    // We find the hidden file input rendered by ExportImport and fire change event
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement
    Object.defineProperty(fileInput, 'files', { value: [file], writable: false })
    fireEvent.change(fileInput)

    await waitFor(() => expect(screen.getByText(/imported successfully/i)).toBeInTheDocument())
  })

  it('shows error message for invalid JSON', async () => {
    render(<ExportImport />)
    const file = new File(['not json'], 'bad.json', { type: 'application/json' })
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement
    Object.defineProperty(fileInput, 'files', { value: [file], writable: false })
    fireEvent.change(fileInput)

    await waitFor(() => expect(screen.getByText(/import failed/i)).toBeInTheDocument())
  })
})
