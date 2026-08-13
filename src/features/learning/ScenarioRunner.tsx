import { useState } from 'react'
import type { Scenario } from '../../content/types'
import type { ScenarioDecision } from '../../db/schema'
import { scoreScenario } from '../../engine'

interface Props {
  scenario:   Scenario
  onComplete: (decisions: ScenarioDecision[], score: number, passed: boolean) => void
}

export function ScenarioRunner({ scenario, onComplete }: Props) {
  const [currentStep, setCurrentStep] = useState(0)
  const [decisions,   setDecisions]   = useState<ScenarioDecision[]>([])
  const [selected,    setSelected]    = useState<number | null>(null)
  const [revealed,    setRevealed]    = useState(false)

  if (scenario.steps.length === 0) {
    return <p className="text-brand-muted">This scenario has no steps yet.</p>
  }

  const step      = scenario.steps[currentStep]
  const isCorrect = selected === step.correctChoiceIndex

  function handleChoice(idx: number) {
    if (revealed) return
    setSelected(idx)
    setRevealed(true)
  }

  function handleNext() {
    const decision: ScenarioDecision = {
      stepId: step.id, choiceIndex: selected!,
      isCorrect: selected === step.correctChoiceIndex,
    }
    const newDecisions = [...decisions, decision]
    if (currentStep + 1 >= scenario.steps.length) {
      const { score, passed } = scoreScenario(newDecisions, scenario.steps)
      onComplete(newDecisions, score, passed)
    } else {
      setDecisions(newDecisions)
      setCurrentStep(s => s + 1)
      setSelected(null)
      setRevealed(false)
    }
  }

  return (
    <div className="space-y-4">
      <p className="text-brand-muted text-sm">Step {currentStep + 1} of {scenario.steps.length}</p>
      <p className="text-brand-text leading-relaxed">{step.narrative}</p>

      <div className="space-y-2">
        {step.choices.map((choice, i) => {
          let cls = 'w-full text-left p-3 rounded border text-sm transition-colors '
          if (!revealed) {
            cls += 'border-brand-border bg-brand-surface hover:border-brand-accent text-brand-text cursor-pointer'
          } else if (i === step.correctChoiceIndex) {
            cls += 'border-green-500 bg-green-900/30 text-green-300'
          } else if (i === selected) {
            cls += 'border-red-500 bg-red-900/30 text-red-300'
          } else {
            cls += 'border-brand-border bg-brand-surface text-brand-muted'
          }
          return (
            <button key={i} className={cls} onClick={() => handleChoice(i)} disabled={revealed}>
              {choice.text}
            </button>
          )
        })}
      </div>

      {revealed && (
        <div className="p-4 rounded border border-brand-border bg-brand-surface space-y-1">
          {!isCorrect && <p className="text-red-400 text-sm">{step.wrongConsequence}</p>}
          <p className="text-brand-muted text-sm">{step.reasoning}</p>
        </div>
      )}

      {revealed && (
        <button className="px-6 py-2 bg-brand-accent text-white rounded font-medium hover:opacity-90"
                onClick={handleNext}>
          {currentStep + 1 >= scenario.steps.length ? 'Complete Scenario' : 'Next Decision'}
        </button>
      )}
    </div>
  )
}
