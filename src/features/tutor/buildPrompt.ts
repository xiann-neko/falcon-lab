import type { StudentContext } from '../../hooks/useTutorContext'

const SYSTEM_INSTRUCTION = `You are an expert CrowdStrike SIEM and SOAR tutor. The student
is preparing to become a Subject Matter Expert on:
- LogScale / Next-Gen SIEM and CQL (CrowdStrike Query Language)
- Falcon Fusion SOAR
- Long Term Repository (LTR) and Data Tiers
- Charlotte AI
- CrowdStrike Platform APIs and integrations

Your role: explain concepts clearly, correct misconceptions,
provide working CQL examples, and always cite the official
CrowdStrike/LogScale documentation as your reference source.
Official docs: https://library.humio.com and
https://falcon.crowdstrike.com/documentation

Do not make up features or syntax. If unsure, say so and
point to the docs.`

function buildStudentContext(context: StudentContext | null): string {
  if (!context) {
    return `STUDENT CONTEXT:
- No module selected yet. Student has not started a module.`
  }

  const quizScoreStr = context.quizScore !== null ? ` (${context.quizScore}%)` : ''

  let wrongAnswersBlock: string
  if (context.recentWrongAnswers.length === 0) {
    wrongAnswersBlock = 'None'
  } else {
    wrongAnswersBlock = context.recentWrongAnswers
      .map(w =>
        `    Q: ${w.questionText}\n` +
        `    Student answered: ${w.studentAnswer}\n` +
        `    Correct answer: ${w.correctAnswer}\n` +
        `    Doc reference: ${w.docUrl}`
      )
      .join('\n')
  }

  const completedList = context.completedModuleTitles.join(', ') || 'None'

  return `STUDENT CONTEXT:
- Currently studying: ${context.moduleName} (${context.trackTitle}, Domain: ${context.domainId})
- Competency level on this topic: ${context.competencyLevel}${quizScoreStr}
- Recent quiz performance: ${context.quizCorrect}/${context.quizTotal} correct
- Questions answered incorrectly:
    ${wrongAnswersBlock}
- Overall SME readiness: ${context.overallSmeReadiness}%
- Completed modules: ${completedList}`
}

export function buildPrompt(context: StudentContext | null, question: string): string {
  return `${SYSTEM_INSTRUCTION}

${buildStudentContext(context)}

STUDENT QUESTION:
"${question}"`
}
