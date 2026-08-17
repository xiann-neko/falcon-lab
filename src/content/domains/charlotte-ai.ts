import type { ContentDomain, Scenario } from '../types'
import { foundationsTrack } from './charlotte-track-4-1'
import { usingCharlotteTrack } from './charlotte-track-4-2'
import { charlotteSoarTrack } from './charlotte-track-4-3'

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
  tracks: [foundationsTrack, usingCharlotteTrack, charlotteSoarTrack],
  cumulativeScenario: charlotteCumulativeScenario,
} satisfies ContentDomain
