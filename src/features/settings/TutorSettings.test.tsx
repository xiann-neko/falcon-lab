import 'fake-indexeddb/auto'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { db } from '../../db'
import { TutorSettings } from './TutorSettings'

beforeEach(async () => {
  await db.appState.clear()
})

describe('TutorSettings', () => {
  it('renders Clipboard Mode as selected by default', async () => {
    render(<TutorSettings />)
    await waitFor(() => {
      expect(screen.getByRole('radio', { name: /clipboard mode/i })).toBeChecked()
    })
  })

  it('does not show API key input in clipboard mode', async () => {
    render(<TutorSettings />)
    await waitFor(() => {
      expect(screen.queryByPlaceholderText(/sk-ant/i)).not.toBeInTheDocument()
    })
  })

  it('shows API key input and model selector when API Key mode is selected', async () => {
    render(<TutorSettings />)
    await waitFor(() => screen.getByRole('radio', { name: /api key mode/i }))
    fireEvent.click(screen.getByRole('radio', { name: /api key mode/i }))
    await waitFor(() => {
      expect(screen.getByPlaceholderText(/sk-ant/i)).toBeInTheDocument()
      expect(screen.getByRole('combobox', { name: /model/i })).toBeInTheDocument()
    })
  })

  it('persists mode change to DB', async () => {
    render(<TutorSettings />)
    await waitFor(() => screen.getByRole('radio', { name: /api key mode/i }))
    fireEvent.click(screen.getByRole('radio', { name: /api key mode/i }))
    await waitFor(async () => {
      const entry = await db.appState.get('tutorMode')
      expect(entry?.value).toBe('apikey')
    })
  })

  it('persists API key when typed', async () => {
    await db.appState.put({ key: 'tutorMode', value: 'apikey' })
    render(<TutorSettings />)
    await waitFor(() => screen.getByPlaceholderText(/sk-ant/i))
    fireEvent.change(screen.getByPlaceholderText(/sk-ant/i), { target: { value: 'sk-ant-test' } })
    await waitFor(async () => {
      const entry = await db.appState.get('tutorApiKey')
      expect(entry?.value).toBe('sk-ant-test')
    })
  })
})
