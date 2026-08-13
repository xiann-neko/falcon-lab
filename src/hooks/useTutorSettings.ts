import { useState, useEffect } from 'react'
import { db } from '../db'

export interface TutorSettingsData {
  mode: 'clipboard' | 'apikey'
  apiKey: string
  model: string
}

export interface UseTutorSettingsReturn {
  settings: TutorSettingsData
  loading: boolean
  setMode: (mode: 'clipboard' | 'apikey') => Promise<void>
  setApiKey: (key: string) => Promise<void>
  setModel: (model: string) => Promise<void>
}

const DEFAULTS: TutorSettingsData = {
  mode: 'clipboard',
  apiKey: '',
  model: 'claude-sonnet-5',
}

export function useTutorSettings(): UseTutorSettingsReturn {
  const [settings, setSettings] = useState<TutorSettingsData>(DEFAULTS)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    async function load() {
      const [modeEntry, keyEntry, modelEntry] = await Promise.all([
        db.appState.get('tutorMode'),
        db.appState.get('tutorApiKey'),
        db.appState.get('tutorModel'),
      ])
      if (cancelled) return
      setSettings({
        mode: (modeEntry?.value as 'clipboard' | 'apikey') ?? DEFAULTS.mode,
        apiKey: keyEntry?.value ?? DEFAULTS.apiKey,
        model: modelEntry?.value ?? DEFAULTS.model,
      })
      setLoading(false)
    }
    load()
    return () => { cancelled = true }
  }, [])

  async function setMode(mode: 'clipboard' | 'apikey') {
    await db.appState.put({ key: 'tutorMode', value: mode })
    setSettings(prev => ({ ...prev, mode }))
  }

  async function setApiKey(apiKey: string) {
    await db.appState.put({ key: 'tutorApiKey', value: apiKey })
    setSettings(prev => ({ ...prev, apiKey }))
  }

  async function setModel(model: string) {
    await db.appState.put({ key: 'tutorModel', value: model })
    setSettings(prev => ({ ...prev, model }))
  }

  return { settings, loading, setMode, setApiKey, setModel }
}
