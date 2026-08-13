import type { QuizQuestion, ContentModule, ContentDomain } from './types'

// This test verifies that the type interfaces compile correctly.
// If this file compiles, all type definitions are valid TypeScript.

describe('content type interfaces compile', () => {
  it('QuizQuestion can be constructed with all required fields', () => {
    const q: QuizQuestion = {
      id: 'test-q1',
      text: 'What is LogScale?',
      options: ['A', 'B', 'C', 'D'],
      correctIndex: 0,
      explanation: 'Explanation text.',
      docTitle: 'LogScale Overview',
      docUrl: 'https://library.humio.com/falcon-logscale/docs/index.html',
    }
    expect(q.id).toBe('test-q1')
    expect(q.options).toHaveLength(4)
  })
})
