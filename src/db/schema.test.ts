import { db, CompetencyLevel } from './index'

beforeEach(async () => {
  await db.competency.clear()
  await db.quizHistory.clear()
  await db.scenarioHistory.clear()
  await db.spacedRepetition.clear()
  await db.appState.clear()
})

// ── competency ────────────────────────────────────────────────────────────────

describe('competency table', () => {
  it('stores and retrieves a record by moduleId', async () => {
    await db.competency.put({
      moduleId: 'siem-logscale-foundations',
      level: CompetencyLevel.Practitioner,
      quizScore: 75,
      challengeScore: null,
      scenarioScore: null,
      updatedAt: '2026-08-12T10:00:00Z',
    })
    const record = await db.competency.get('siem-logscale-foundations')
    expect(record?.level).toBe(CompetencyLevel.Practitioner)
    expect(record?.quizScore).toBe(75)
    expect(record?.challengeScore).toBeNull()
  })

  it('overwrites an existing record on put', async () => {
    await db.competency.put({
      moduleId: 'm1', level: CompetencyLevel.Aware, quizScore: 50,
      challengeScore: null, scenarioScore: null, updatedAt: '',
    })
    await db.competency.put({
      moduleId: 'm1', level: CompetencyLevel.Practitioner, quizScore: 80,
      challengeScore: 72, scenarioScore: null, updatedAt: '',
    })
    const record = await db.competency.get('m1')
    expect(record?.level).toBe(CompetencyLevel.Practitioner)
    expect(record?.quizScore).toBe(80)
    expect(record?.challengeScore).toBe(72)
  })

  it('returns all competency records', async () => {
    await db.competency.bulkPut([
      { moduleId: 'a', level: CompetencyLevel.Novice, quizScore: null, challengeScore: null, scenarioScore: null, updatedAt: '' },
      { moduleId: 'b', level: CompetencyLevel.SME, quizScore: 95, challengeScore: 91, scenarioScore: 88, updatedAt: '' },
    ])
    const all = await db.competency.toArray()
    expect(all).toHaveLength(2)
  })
})

// ── quizHistory ───────────────────────────────────────────────────────────────

describe('quizHistory table', () => {
  it('adds an entry and retrieves by moduleId', async () => {
    await db.quizHistory.add({
      moduleId: 'siem-cql-basic',
      questionId: 'q1',
      selectedAnswer: 2,
      isCorrect: false,
      answeredAt: '2026-08-12T10:00:00Z',
    })
    const entries = await db.quizHistory.where('moduleId').equals('siem-cql-basic').toArray()
    expect(entries).toHaveLength(1)
    expect(entries[0].isCorrect).toBe(false)
    expect(entries[0].selectedAnswer).toBe(2)
  })

  it('auto-increments the id field', async () => {
    const id1 = await db.quizHistory.add({ moduleId: 'm', questionId: 'q1', selectedAnswer: 0, isCorrect: true, answeredAt: '' })
    const id2 = await db.quizHistory.add({ moduleId: 'm', questionId: 'q2', selectedAnswer: 1, isCorrect: false, answeredAt: '' })
    expect(id2).toBeGreaterThan(id1 as number)
  })
})

// ── spacedRepetition ──────────────────────────────────────────────────────────

describe('spacedRepetition table', () => {
  it('stores a due item and retrieves items due on or before today', async () => {
    const yesterday = new Date(Date.now() - 86_400_000).toISOString()
    const tomorrow  = new Date(Date.now() + 86_400_000).toISOString()
    await db.spacedRepetition.bulkAdd([
      { questionId: 'q-due',   moduleId: 'mod', dueDate: yesterday, retryCount: 0 },
      { questionId: 'q-later', moduleId: 'mod', dueDate: tomorrow,  retryCount: 0 },
    ])
    const now = new Date().toISOString()
    const due = await db.spacedRepetition.where('dueDate').belowOrEqual(now).toArray()
    expect(due).toHaveLength(1)
    expect(due[0].questionId).toBe('q-due')
  })

  it('increments retryCount on update', async () => {
    const id = await db.spacedRepetition.add({ questionId: 'q1', moduleId: 'm', dueDate: '', retryCount: 0 })
    await db.spacedRepetition.update(id as number, { retryCount: 1 })
    const item = await db.spacedRepetition.get(id as number)
    expect(item?.retryCount).toBe(1)
  })
})

// ── scenarioHistory ───────────────────────────────────────────────────────────

describe('scenarioHistory table', () => {
  it('stores a scenario result and retrieves by scenarioId', async () => {
    await db.scenarioHistory.add({
      scenarioId: 'siem-track1-scenario',
      decisions: [
        { stepId: 'step1', choiceIndex: 0, isCorrect: true },
        { stepId: 'step2', choiceIndex: 2, isCorrect: false },
      ],
      finalScore: 60,
      completedAt: '2026-08-12T10:00:00Z',
    })
    const entries = await db.scenarioHistory
      .where('scenarioId').equals('siem-track1-scenario').toArray()
    expect(entries).toHaveLength(1)
    expect(entries[0].finalScore).toBe(60)
    expect(entries[0].decisions).toHaveLength(2)
    expect(entries[0].decisions[1].isCorrect).toBe(false)
  })

  it('stores multiple results for the same scenario and returns all', async () => {
    await db.scenarioHistory.bulkAdd([
      { scenarioId: 'sc1', decisions: [], finalScore: 40, completedAt: '2026-08-10T00:00:00Z' },
      { scenarioId: 'sc1', decisions: [], finalScore: 85, completedAt: '2026-08-12T00:00:00Z' },
    ])
    const entries = await db.scenarioHistory.where('scenarioId').equals('sc1').toArray()
    expect(entries).toHaveLength(2)
  })
})

// ── appState ──────────────────────────────────────────────────────────────────

describe('appState table', () => {
  it('stores and retrieves a key-value pair', async () => {
    await db.appState.put({ key: 'currentModuleId', value: 'siem-logscale-foundations' })
    const entry = await db.appState.get('currentModuleId')
    expect(entry?.value).toBe('siem-logscale-foundations')
  })

  it('overwrites an existing key on put', async () => {
    await db.appState.put({ key: 'k', value: 'first' })
    await db.appState.put({ key: 'k', value: 'second' })
    const entry = await db.appState.get('k')
    expect(entry?.value).toBe('second')
  })
})
