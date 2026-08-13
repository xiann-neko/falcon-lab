import { CompetencyLevel } from '../../engine'

const BADGE_STYLES: Record<CompetencyLevel, string> = {
  [CompetencyLevel.Novice]:       'bg-gray-700 text-gray-300',
  [CompetencyLevel.Aware]:        'bg-blue-900 text-blue-300',
  [CompetencyLevel.Practitioner]: 'bg-green-900 text-green-300',
  [CompetencyLevel.SME]:          'bg-brand-accent text-white',
}

const BADGE_LABELS: Record<CompetencyLevel, string> = {
  [CompetencyLevel.Novice]:       'Novice',
  [CompetencyLevel.Aware]:        'Aware',
  [CompetencyLevel.Practitioner]: 'Practitioner',
  [CompetencyLevel.SME]:          'SME',
}

interface Props { level: CompetencyLevel }

export function CompetencyBadge({ level }: Props) {
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${BADGE_STYLES[level]}`}
    >
      {BADGE_LABELS[level]}
    </span>
  )
}
