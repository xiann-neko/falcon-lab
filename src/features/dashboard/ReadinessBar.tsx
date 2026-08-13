interface Props {
  score: number   // 0–100
  label?: string
}

export function ReadinessBar({ score, label }: Props) {
  const clamped = Math.min(100, Math.max(0, score))
  return (
    <div className="space-y-1">
      {label && (
        <div className="flex justify-between text-sm">
          <span className="text-brand-text">{label}</span>
          <span className="text-brand-muted">{score}%</span>
        </div>
      )}
      <div className="w-full bg-brand-surface rounded-full h-2 border border-brand-border">
        <div
          className="bg-brand-accent h-2 rounded-full transition-all duration-300"
          style={{ width: `${clamped}%` }}
          role="progressbar"
          aria-valuenow={score}
          aria-valuemin={0}
          aria-valuemax={100}
        />
      </div>
    </div>
  )
}
