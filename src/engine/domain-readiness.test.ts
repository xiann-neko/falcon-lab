import { moduleReadinessScore, domainReadinessScore, overallSmeReadiness } from './domain-readiness'

describe('moduleReadinessScore', () => {
  it('returns 0 when nothing has been attempted', () => {
    expect(moduleReadinessScore(null, null, null)).toBe(0)
  })

  it('returns 20 for perfect quiz only (no challenge, no scenario)', () => {
    expect(moduleReadinessScore(100, null, null)).toBe(20)
  })

  it('returns 35 for perfect challenge only', () => {
    expect(moduleReadinessScore(null, 100, null)).toBe(35)
  })

  it('returns 45 for perfect scenario only', () => {
    expect(moduleReadinessScore(null, null, 100)).toBe(45)
  })

  it('returns 100 for full completion (quiz 100 + challenge 100 + scenario 100)', () => {
    expect(moduleReadinessScore(100, 100, 100)).toBe(100)
  })

  it('calculates correct weighted score without challenge', () => {
    // quiz=80, no challenge, scenario=100: 80*0.20 + 0*0.35 + 100*0.45 = 16 + 0 + 45 = 61
    expect(moduleReadinessScore(80, null, 100)).toBe(61)
  })

  it('calculates correct weighted score with all three components', () => {
    // quiz=80, challenge=70, scenario=100: 80*0.20 + 70*0.35 + 100*0.45 = 16 + 24.5 + 45 = 85.5 → 86
    expect(moduleReadinessScore(80, 70, 100)).toBe(86)
  })
})

describe('domainReadinessScore', () => {
  it('returns 0 for an empty domain', () => {
    expect(domainReadinessScore([])).toBe(0)
  })

  it('returns the exact score when only one module exists', () => {
    expect(domainReadinessScore([60])).toBe(60)
  })

  it('returns the rounded average of all module scores', () => {
    // (20 + 80 + 60) / 3 = 53.33 → 53
    expect(domainReadinessScore([20, 80, 60])).toBe(53)
  })

  it('rounds 0.5 up', () => {
    // (33 + 34) / 2 = 33.5 → 34
    expect(domainReadinessScore([33, 34])).toBe(34)
  })
})

describe('overallSmeReadiness', () => {
  it('returns 0 when no domains are provided', () => {
    expect(overallSmeReadiness([])).toBe(0)
  })

  it('returns 0 when all domains are at 0%', () => {
    expect(overallSmeReadiness([0, 0, 0, 0, 0])).toBe(0)
  })

  it('returns 100 when all domains are complete', () => {
    expect(overallSmeReadiness([100, 100, 100, 100, 100])).toBe(100)
  })

  it('returns the unweighted average of all domain scores', () => {
    // (60 + 40 + 20 + 0 + 0) / 5 = 24
    expect(overallSmeReadiness([60, 40, 20, 0, 0])).toBe(24)
  })

  it('rounds to nearest integer', () => {
    // (33 + 34 + 33 + 34 + 33) / 5 = 33.4 → 33
    expect(overallSmeReadiness([33, 34, 33, 34, 33])).toBe(33)
  })
})
