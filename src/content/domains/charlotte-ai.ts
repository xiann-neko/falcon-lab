import type { ContentDomain, Scenario } from '../types'

const charlotteCumulativeScenario: Scenario = {
  id: 'charlotte-ai-cumulative',
  title: 'Charlotte AI — End-of-Domain Scenario',
  context: 'Coming in a future content release.',
  isCumulative: true,
  steps: [],
}

export const charlotteAiDomain = {
  id: 'charlotte-ai',
  title: 'Charlotte AI',
  emoji: '🤖',
  order: 4,
  tracks: [],
  cumulativeScenario: charlotteCumulativeScenario,
} satisfies ContentDomain
