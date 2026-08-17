import { buildPrompt } from './buildPrompt'
import type { StudentContext } from '../../hooks/useTutorContext'

const BASE_CONTEXT: StudentContext = {
  moduleName: 'LogScale Fundamentals',
  trackTitle: 'SIEM Core',
  domainId: 'siem',
  competencyLevel: 'aware',
  quizScore: 70,
  quizCorrect: 7,
  quizTotal: 10,
  recentWrongAnswers: [],
  overallSmeReadiness: 42,
  completedModuleTitles: ['LogScale Fundamentals'],
}

describe('buildPrompt', () => {
  it('includes the verbatim system instruction', () => {
    const prompt = buildPrompt(BASE_CONTEXT, 'What is CQL?')
    expect(prompt).toContain('You are an expert CrowdStrike SIEM and SOAR tutor.')
    expect(prompt).toContain('https://library.humio.com')
    expect(prompt).toContain('https://falcon.crowdstrike.com/documentation')
  })

  it('includes module name, track, and domain in student context', () => {
    const prompt = buildPrompt(BASE_CONTEXT, 'What is CQL?')
    expect(prompt).toContain('LogScale Fundamentals')
    expect(prompt).toContain('SIEM Core')
    expect(prompt).toContain('siem')
  })

  it('includes competency level and quiz score', () => {
    const prompt = buildPrompt(BASE_CONTEXT, 'What is CQL?')
    expect(prompt).toContain('aware')
    expect(prompt).toContain('70%')
    expect(prompt).toContain('7/10 correct')
  })

  it('shows None when there are no wrong answers', () => {
    const prompt = buildPrompt(BASE_CONTEXT, 'What is CQL?')
    expect(prompt).toContain('Questions answered incorrectly:\n    None')
  })

  it('formats wrong answers correctly', () => {
    const context: StudentContext = {
      ...BASE_CONTEXT,
      recentWrongAnswers: [{
        questionText: 'What does CQL stand for?',
        studentAnswer: 'Crowdstrike Query Logic',
        correctAnswer: 'CrowdStrike Query Language',
        docUrl: 'https://library.humio.com/cql',
      }],
    }
    const prompt = buildPrompt(context, 'Tell me more about CQL')
    expect(prompt).toContain('Q: What does CQL stand for?')
    expect(prompt).toContain('Student answered: Crowdstrike Query Logic')
    expect(prompt).toContain('Correct answer: CrowdStrike Query Language')
    expect(prompt).toContain('Doc reference: https://library.humio.com/cql')
  })

  it('includes overall SME readiness', () => {
    const prompt = buildPrompt(BASE_CONTEXT, 'What is CQL?')
    expect(prompt).toContain('Overall SME readiness: 42%')
  })

  it('includes the verbatim student question', () => {
    const prompt = buildPrompt(BASE_CONTEXT, 'How do I write a CQL query?')
    expect(prompt).toContain('STUDENT QUESTION:\n"How do I write a CQL query?"')
  })

  it('handles null context gracefully', () => {
    const prompt = buildPrompt(null, 'What is SIEM?')
    expect(prompt).toContain('No module selected yet')
    expect(prompt).toContain('STUDENT QUESTION:\n"What is SIEM?"')
  })

  it('omits quiz score parenthetical when quizScore is null', () => {
    const context: StudentContext = { ...BASE_CONTEXT, quizScore: null }
    const prompt = buildPrompt(context, 'Q?')
    // Should not contain "(null%)" or similar
    expect(prompt).not.toMatch(/\(null%\)/)
    expect(prompt).not.toMatch(/\(undefined%\)/)
  })
})
