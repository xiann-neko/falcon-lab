import { useState, useEffect } from 'react'
import { db } from '../db'
import { getModule } from '../content'

export interface LastModuleState {
  href:  string  // full route path, e.g. '/siem/module/some-module-id'
  title: string
}

const DOMAIN_ROUTES: Record<string, string> = {
  'siem':         '/siem',
  'soar':         '/soar',
  'ltr':          '/ltr',
  'charlotte-ai': '/charlotte',
  'platform':     '/platform',
}

export function useLastModule(): LastModuleState | null {
  const [state, setState] = useState<LastModuleState | null>(null)

  useEffect(() => {
    let cancelled = false

    db.appState.get('currentModuleId').then(record => {
      if (cancelled || !record) return
      const mod = getModule(record.value)
      if (!mod || cancelled) return
      const domainRoute = DOMAIN_ROUTES[mod.domainId]
      if (!domainRoute || cancelled) return
      setState({ href: `${domainRoute}/module/${mod.id}`, title: mod.title })
    })

    return () => { cancelled = true }
  }, [])

  return state
}
