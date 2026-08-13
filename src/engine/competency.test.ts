import { calculateCompetency } from './competency'
import { CompetencyLevel } from '../db/index'

// ── Modules WITHOUT a challenge (LTR, Charlotte AI, Platform) ─────────────────

describe('calculateCompetency — no challenge modules', () => {
  const base = { hasChallenge: false, challengeScore: null }

  it('returns Novice when quiz has not been attempted', () => {
    expect(calculateCompetency({ ...base, quizScore: null, scenarioPassed: null }))
      .toBe(CompetencyLevel.Novice)
  })

  it('returns Novice for quiz score below 40%', () => {
    expect(calculateCompetency({ ...base, quizScore: 39, scenarioPassed: null }))
      .toBe(CompetencyLevel.Novice)
  })

  it('returns Aware for quiz score 40%', () => {
    expect(calculateCompetency({ ...base, quizScore: 40, scenarioPassed: null }))
      .toBe(CompetencyLevel.Aware)
  })

  it('returns Aware for quiz score 69%', () => {
    expect(calculateCompetency({ ...base, quizScore: 69, scenarioPassed: null }))
      .toBe(CompetencyLevel.Aware)
  })

  it('returns Practitioner for quiz score 70% (no scenario required for Practitioner)', () => {
    expect(calculateCompetency({ ...base, quizScore: 70, scenarioPassed: null }))
      .toBe(CompetencyLevel.Practitioner)
  })

  it('returns Practitioner for quiz score 89%', () => {
    expect(calculateCompetency({ ...base, quizScore: 89, scenarioPassed: null }))
      .toBe(CompetencyLevel.Practitioner)
  })

  it('returns SME for quiz score 90% + scenario passed', () => {
    expect(calculateCompetency({ ...base, quizScore: 90, scenarioPassed: true }))
      .toBe(CompetencyLevel.SME)
  })

  it('returns Practitioner (not SME) when quiz ≥90% but scenario not yet attempted', () => {
    expect(calculateCompetency({ ...base, quizScore: 95, scenarioPassed: null }))
      .toBe(CompetencyLevel.Practitioner)
  })

  it('returns Practitioner (not SME) when quiz ≥90% but scenario failed', () => {
    expect(calculateCompetency({ ...base, quizScore: 95, scenarioPassed: false }))
      .toBe(CompetencyLevel.Practitioner)
  })
})

// ── Modules WITH a challenge (SIEM CQL, SOAR) ─────────────────────────────────

describe('calculateCompetency — with challenge modules', () => {
  const base = { hasChallenge: true }

  it('returns Novice when quiz has not been attempted', () => {
    expect(calculateCompetency({ ...base, quizScore: null, challengeScore: null, scenarioPassed: null }))
      .toBe(CompetencyLevel.Novice)
  })

  it('returns Aware for quiz 40–69% regardless of challenge score', () => {
    expect(calculateCompetency({ ...base, quizScore: 55, challengeScore: 90, scenarioPassed: null }))
      .toBe(CompetencyLevel.Aware)
  })

  it('returns Practitioner when quiz ≥70% AND challenge ≥70%', () => {
    expect(calculateCompetency({ ...base, quizScore: 70, challengeScore: 70, scenarioPassed: null }))
      .toBe(CompetencyLevel.Practitioner)
  })

  it('returns Aware (not Practitioner) when quiz ≥70% but challenge <70%', () => {
    expect(calculateCompetency({ ...base, quizScore: 75, challengeScore: 65, scenarioPassed: null }))
      .toBe(CompetencyLevel.Aware)
  })

  it('returns Aware (not Practitioner) when quiz ≥70% but challenge not yet attempted', () => {
    expect(calculateCompetency({ ...base, quizScore: 75, challengeScore: null, scenarioPassed: null }))
      .toBe(CompetencyLevel.Aware)
  })

  it('returns SME when quiz ≥90% AND challenge ≥90% AND scenario passed', () => {
    expect(calculateCompetency({ ...base, quizScore: 90, challengeScore: 90, scenarioPassed: true }))
      .toBe(CompetencyLevel.SME)
  })

  it('returns Practitioner (not SME) when challenge is 89% even if quiz ≥90% and scenario passed', () => {
    expect(calculateCompetency({ ...base, quizScore: 95, challengeScore: 89, scenarioPassed: true }))
      .toBe(CompetencyLevel.Practitioner)
  })

  it('returns Practitioner (not SME) when quiz ≥90% and challenge ≥90% but scenario not passed', () => {
    expect(calculateCompetency({ ...base, quizScore: 90, challengeScore: 90, scenarioPassed: false }))
      .toBe(CompetencyLevel.Practitioner)
  })
})
