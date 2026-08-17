import type { ContentDomain, Scenario } from '../types'
import { foundationsTrack } from './soar-track-2-1'
import { workflowBuilderTrack } from './soar-track-2-2'
import { playbookDesignTrack } from './soar-track-2-3'
import { integrationsTrack } from './soar-track-2-4'

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
  tracks: [foundationsTrack, workflowBuilderTrack, playbookDesignTrack, integrationsTrack],
  cumulativeScenario: soarCumulativeScenario,
} satisfies ContentDomain
