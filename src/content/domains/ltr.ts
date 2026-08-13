import type { ContentDomain, Scenario } from '../types'

const ltrCumulativeScenario: Scenario = {
  id: 'ltr-cumulative',
  title: 'LTR & Data Tiers — End-of-Domain Scenario',
  context: 'Coming in a future content release.',
  isCumulative: true,
  steps: [],
}

export const ltrDomain: ContentDomain = {
  id: 'ltr',
  title: 'LTR & Data Tiers',
  emoji: '🗄️',
  order: 3,
  tracks: [],
  cumulativeScenario: ltrCumulativeScenario,
}
