import { renderHook, waitFor } from '@testing-library/react'
import 'fake-indexeddb/auto'
import { db } from '../db'
import { getDomainModules } from '../content'
import { useLastModule } from './useLastModule'

beforeEach(async () => {
  await db.delete()
  await db.open()
})

describe('useLastModule', () => {
  it('returns null when no currentModuleId is stored', async () => {
    const { result } = renderHook(() => useLastModule())
    await waitFor(() => expect(result.current).toBeNull())
  })

  it('returns href and title when a valid module is stored', async () => {
    const modules = getDomainModules('siem')
    if (modules.length === 0) return  // skip if no siem modules in seed data
    const mod = modules[0]
    await db.appState.put({ key: 'currentModuleId', value: mod.id })

    const { result } = renderHook(() => useLastModule())
    await waitFor(() => expect(result.current).not.toBeNull())
    expect(result.current!.title).toBe(mod.title)
    expect(result.current!.href).toBe(`/siem/module/${mod.id}`)
  })

  it('returns null for an unknown module id', async () => {
    await db.appState.put({ key: 'currentModuleId', value: 'nonexistent-module-id' })
    const { result } = renderHook(() => useLastModule())
    // Stays null because getModule returns undefined
    await new Promise(r => setTimeout(r, 50))
    expect(result.current).toBeNull()
  })
})
