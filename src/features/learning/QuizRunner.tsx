import { useState } from 'react'
import type { QuizQuestion } from '../../content/types'
import { scoreQuiz, type QuizResult } from '../../engine'

interface Props {
  questions:  QuizQuestion[]
  onComplete: (result: QuizResult, answers: number[]) => void
}

export function QuizRunner({ questions, onComplete }: Props) {
  const [current,  setCurrent]  = useState(0)
  const [answers,  setAnswers]  = useState<number[]>([])
  const [selected, setSelected] = useState<number | null>(null)
  const [revealed, setRevealed] = useState(false)

  const question  = questions[current]
  const isCorrect = revealed && selected === question.correctIndex

  function handleAnswer(idx: number) {
    if (revealed) return
    setSelected(idx)
    setRevealed(true)
  }

  function handleNext() {
    const newAnswers = [...answers, selected!]
    if (current + 1 >= questions.length) {
      onComplete(scoreQuiz(newAnswers, questions), newAnswers)
    } else {
      setAnswers(newAnswers)
      setCurrent(c => c + 1)
      setSelected(null)
      setRevealed(false)
    }
  }

  return (
    <div className="space-y-4">
      <p className="text-brand-muted text-sm">Question {current + 1} of {questions.length}</p>
      <p className="text-brand-text font-medium text-lg">{question.text}</p>

      <div className="space-y-2">
        {question.options.map((opt, i) => {
          let cls = 'w-full text-left p-3 rounded border text-sm transition-colors '
          if (!revealed) {
            cls += 'border-brand-border bg-brand-surface hover:border-brand-accent text-brand-text cursor-pointer'
          } else if (i === question.correctIndex) {
            cls += 'border-green-500 bg-green-900/30 text-green-300'
          } else if (i === selected) {
            cls += 'border-red-500 bg-red-900/30 text-red-300'
          } else {
            cls += 'border-brand-border bg-brand-surface text-brand-muted'
          }
          return (
            <button key={i} className={cls} onClick={() => handleAnswer(i)} disabled={revealed}>
              {opt}
            </button>
          )
        })}
      </div>

      {revealed && (
        <div className="p-4 rounded border border-brand-border bg-brand-surface space-y-2">
          <p className={`font-semibold ${isCorrect ? 'text-green-400' : 'text-red-400'}`}>
            {isCorrect ? '✓ Correct' : '✗ Incorrect'}
          </p>
          <p className="text-brand-muted text-sm">{question.explanation}</p>
          <p className="text-brand-muted/70 text-xs">
            Reference:{' '}
            <a href={question.docUrl} target="_blank" rel="noopener noreferrer"
               className="underline hover:text-brand-text">
              {question.docTitle}
            </a>
          </p>
        </div>
      )}

      {revealed && (
        <button
          className="mt-2 px-6 py-2 bg-brand-accent text-white rounded font-medium hover:opacity-90"
          onClick={handleNext}
        >
          {current + 1 >= questions.length ? 'See Results' : 'Next Question'}
        </button>
      )}
    </div>
  )
}
