import { siemDomain }        from './domains/siem'
import { soarDomain }        from './domains/soar'
import { ltrDomain }         from './domains/ltr'
import { charlotteAiDomain } from './domains/charlotte-ai'
import { platformDomain }    from './domains/platform'
import type { ContentDomain, ContentModule, ContentTrack, Scenario } from './types'

/** All five learning domains in display order. */
export const DOMAINS: ContentDomain[] = [
  siemDomain,
  soarDomain,
  ltrDomain,
  charlotteAiDomain,
  platformDomain,
]

export function getDomain(id: string): ContentDomain | undefined {
  return DOMAINS.find(d => d.id === id)
}

export function getTrack(trackId: string): ContentTrack | undefined {
  for (const domain of DOMAINS) {
    const track = domain.tracks.find(t => t.id === trackId)
    if (track) return track
  }
  return undefined
}

export function getModule(moduleId: string): ContentModule | undefined {
  for (const domain of DOMAINS) {
    for (const track of domain.tracks) {
      const mod = track.modules.find(m => m.id === moduleId)
      if (mod) return mod
    }
  }
  return undefined
}

/** All modules across all domains and tracks. */
export function getAllModules(): ContentModule[] {
  return DOMAINS.flatMap(d => d.tracks.flatMap(t => t.modules))
}

/** All modules within a specific domain. */
export function getDomainModules(domainId: string): ContentModule[] {
  const domain = getDomain(domainId)
  return domain ? domain.tracks.flatMap(t => t.modules) : []
}

export function getTrackScenario(trackId: string): Scenario | undefined {
  return getTrack(trackId)?.scenario
}

export function getDomainCumulativeScenario(domainId: string): Scenario | undefined {
  return getDomain(domainId)?.cumulativeScenario
}
