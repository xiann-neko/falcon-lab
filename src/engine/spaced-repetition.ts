import type { SpacedRepetitionItem } from '../db/schema'

/** Number of correct retries before a spaced repetition item is retired from the queue. */
export const SR_RETIREMENT_COUNT = 3

/**
 * Interval schedule in days. Index = retryCount at the time the item is scheduled.
 *   retryCount=0 (new miss):         1 day
 *   retryCount=1 (first correct):    3 days
 *   retryCount=2 (second correct):   7 days
 *   retryCount≥3:                    retired (check shouldRetireItem before scheduling)
 */
const INTERVAL_DAYS = [1, 3, 7] as const

/**
 * Calculate the ISO date string for the next review of a spaced repetition item.
 *
 * @param retryCount - The item's current retryCount (before this answer)
 * @param from       - Reference date (defaults to now)
 */
export function scheduleDueDate(retryCount: number, from: Date = new Date()): string {
  const days = INTERVAL_DAYS[Math.min(retryCount, INTERVAL_DAYS.length - 1)]
  const due = new Date(from)
  due.setDate(due.getDate() + days)
  return due.toISOString()
}

/**
 * Return true if the item has been retried enough times to be retired from the queue.
 */
export function shouldRetireItem(retryCount: number): boolean {
  return retryCount >= SR_RETIREMENT_COUNT
}

/**
 * Return the new retryCount after a correct answer.
 * Caps at SR_RETIREMENT_COUNT.
 */
export function advanceRetryCount(retryCount: number): number {
  return Math.min(retryCount + 1, SR_RETIREMENT_COUNT)
}

/**
 * Create a new spaced repetition item for a question just answered incorrectly.
 * The item is scheduled 1 day from now (retryCount = 0).
 */
export function createSrItem(
  questionId: string,
  moduleId: string,
  from: Date = new Date(),
): Omit<SpacedRepetitionItem, 'id'> {
  return {
    questionId,
    moduleId,
    dueDate: scheduleDueDate(0, from),
    retryCount: 0,
  }
}
