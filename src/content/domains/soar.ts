import type { ContentDomain, Scenario } from '../types'

const soarCumulativeScenario: Scenario = {
  id: 'soar-cumulative',
  title: 'Falcon Fusion SOAR — End-of-Domain Scenario',
  context: 'Coming in a future content release.',
  isCumulative: true,
  steps: [],
}

export const soarDomain = {
  id: 'soar',
  title: 'Falcon Fusion SOAR',
  emoji: '⚡',
  order: 2,
  tracks: [],
  cumulativeScenario: soarCumulativeScenario,
} satisfies ContentDomain
