import 'fake-indexeddb/auto'
import { renderHook, waitFor, act } from '@testing-library/react'
import { db } from '../db'
import { useTutorSettings } from './useTutorSettings'

beforeEach(async () => {
  await db.appState.clear()
})

describe('useTutorSettings', () => {
  it('returns defaults when no appState keys exist', async () => {
    const { result } = renderHook(() => useTutorSettings())
    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.settings.mode).toBe('clipboard')
    expect(result.current.settings.apiKey).toBe('')
    expect(result.current.settings.model).toBe('claude-sonnet-5')
  })

  it('reads persisted mode from appState', async () => {
    await db.appState.put({ key: 'tutorMode', value: 'apikey' })
    const { result } = renderHook(() => useTutorSettings())
    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.settings.mode).toBe('apikey')
  })

  it('setMode persists to DB and updates state', async () => {
    const { result } = renderHook(() => useTutorSettings())
    await waitFor(() => expect(result.current.loading).toBe(false))
    await act(async () => { await result.current.setMode('apikey') })
    expect(result.current.settings.mode).toBe('apikey')
    const stored = await db.appState.get('tutorMode')
    expect(stored?.value).toBe('apikey')
  })

  it('setApiKey persists to DB and updates state', async () => {
    const { result } = renderHook(() => useTutorSettings())
    await waitFor(() => expect(result.current.loading).toBe(false))
    await act(async () => { await result.current.setApiKey('sk-ant-test-key') })
    expect(result.current.settings.apiKey).toBe('sk-ant-test-key')
    const stored = await db.appState.get('tutorApiKey')
    expect(stored?.value).toBe('sk-ant-test-key')
  })

  it('setModel persists to DB and updates state', async () => {
    const { result } = renderHook(() => useTutorSettings())
    await waitFor(() => expect(result.current.loading).toBe(false))
    await act(async () => { await result.current.setModel('claude-haiku-4-5-20251001') })
    expect(result.current.settings.model).toBe('claude-haiku-4-5-20251001')
    const stored = await db.appState.get('tutorModel')
    expect(stored?.value).toBe('claude-haiku-4-5-20251001')
  })
})
