import {
  scheduleDueDate,
  shouldRetireItem,
  advanceRetryCount,
  createSrItem,
  SR_RETIREMENT_COUNT,
} from './spaced-repetition'

describe('scheduleDueDate', () => {
  const base = new Date('2026-08-13T12:00:00.000Z')

  it('schedules 1 day out when retryCount is 0 (first incorrect answer)', () => {
    const due = new Date(scheduleDueDate(0, base))
    expect(due.getUTCDate()).toBe(14)  // 13 + 1
  })

  it('schedules 3 days out when retryCount is 1 (first correct retry)', () => {
    const due = new Date(scheduleDueDate(1, base))
    expect(due.getUTCDate()).toBe(16)  // 13 + 3
  })

  it('schedules 7 days out when retryCount is 2 (second correct retry)', () => {
    const due = new Date(scheduleDueDate(2, base))
    expect(due.getUTCDate()).toBe(20)  // 13 + 7
  })

  it('uses the maximum interval (7 days) for retryCount beyond the schedule', () => {
    const due2 = new Date(scheduleDueDate(2, base)).getUTCDate()
    const due9 = new Date(scheduleDueDate(9, base)).getUTCDate()
    expect(due2).toBe(due9)
  })

  it('defaults to the current time when no from date is provided', () => {
    const msInDay = 86_400_000
    const before = Date.now()
    const due = new Date(scheduleDueDate(0))
    const after = Date.now()
    expect(due.getTime()).toBeGreaterThanOrEqual(before + msInDay - 2000)
    expect(due.getTime()).toBeLessThanOrEqual(after + msInDay + 2000)
  })
})

describe('shouldRetireItem', () => {
  it(`returns true at retryCount ${SR_RETIREMENT_COUNT}`, () => {
    expect(shouldRetireItem(SR_RETIREMENT_COUNT)).toBe(true)
  })

  it('returns true above retirement count', () => {
    expect(shouldRetireItem(SR_RETIREMENT_COUNT + 1)).toBe(true)
  })

  it('returns false below retirement count', () => {
    expect(shouldRetireItem(0)).toBe(false)
    expect(shouldRetireItem(SR_RETIREMENT_COUNT - 1)).toBe(false)
  })
})

describe('advanceRetryCount', () => {
  it('increments retryCount by 1', () => {
    expect(advanceRetryCount(0)).toBe(1)
    expect(advanceRetryCount(1)).toBe(2)
  })

  it('caps at SR_RETIREMENT_COUNT', () => {
    expect(advanceRetryCount(SR_RETIREMENT_COUNT)).toBe(SR_RETIREMENT_COUNT)
    expect(advanceRetryCount(SR_RETIREMENT_COUNT + 5)).toBe(SR_RETIREMENT_COUNT)
  })
})

describe('createSrItem', () => {
  it('creates a new SR item with retryCount 0 and dueDate 1 day from now', () => {
    const from = new Date('2026-08-13T12:00:00.000Z')
    const item = createSrItem('siem-what-is-q1', 'siem-logscale-what-is', from)
    expect(item.questionId).toBe('siem-what-is-q1')
    expect(item.moduleId).toBe('siem-logscale-what-is')
    expect(item.retryCount).toBe(0)
    expect(new Date(item.dueDate).getUTCDate()).toBe(14)  // 1 day later
  })
})
