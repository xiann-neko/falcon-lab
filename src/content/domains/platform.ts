import type { ContentDomain, Scenario } from '../types'

const platformCumulativeScenario: Scenario = {
  id: 'platform-cumulative',
  title: 'Platform Essentials — End-of-Domain Scenario',
  context: 'Coming in a future content release.',
  isCumulative: true,
  steps: [],
}

export const platformDomain = {
  id: 'platform',
  title: 'Platform Essentials',
  emoji: '🔧',
  order: 5,
  tracks: [],
  cumulativeScenario: platformCumulativeScenario,
} satisfies ContentDomain
