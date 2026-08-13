import type { Challenge } from '../../content/types'
import type { CqlChallengeResult, PlaybookChallengeResult } from '../../engine'
import { CqlChallengeRunner } from './CqlChallengeRunner'
import { PlaybookRunner } from './PlaybookRunner'

type AnyResult = CqlChallengeResult | PlaybookChallengeResult

interface Props { challenge: Challenge; onComplete: (r: AnyResult) => void }

export function ChallengeRunner({ challenge, onComplete }: Props) {
  if (challenge.type === 'cql') {
    return <CqlChallengeRunner challenge={challenge} onComplete={onComplete} />
  }
  return <PlaybookRunner challenge={challenge} onComplete={onComplete} />
}
