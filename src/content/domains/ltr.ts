import type { ContentDomain, Scenario } from '../types'
import { dataArchitectureTrack } from './ltr-track-3-1'
import { optimizationTrack } from './ltr-track-3-2'

const ltrCumulativeScenario: Scenario = {
  id: 'ltr-cumulative',
  title: 'LTR & Data Tiers — End-of-Domain Scenario',
  context: 'Coming in a future content release.',
  isCumulative: true,
  steps: [],
}

export const ltrDomain = {
  id: 'ltr',
  title: 'LTR & Data Tiers',
  emoji: '🗄️',
  order: 3,
  tracks: [dataArchitectureTrack, optimizationTrack],
  cumulativeScenario: ltrCumulativeScenario,
} satisfies ContentDomain
