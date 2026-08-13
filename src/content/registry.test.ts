import { getDomain, getModule, getAllModules, getTrack, getDomainCumulativeScenario, DOMAINS } from './registry'

describe('registry lookups', () => {
  it('registers exactly 5 domains', () => {
    expect(DOMAINS).toHaveLength(5)
  })

  it('finds the SIEM domain', () => {
    const domain = getDomain('siem')
    expect(domain).toBeDefined()
    expect(domain?.title).toBe('LogScale / Next-Gen SIEM')
    expect(domain?.emoji).toBe('📡')
    expect(domain?.order).toBe(1)
  })

  it('returns undefined for an unknown domain ID', () => {
    expect(getDomain('unknown')).toBeUndefined()
  })

  it('finds Track 1.1 (siem-logscale-foundations) by ID', () => {
    const track = getTrack('siem-logscale-foundations')
    expect(track).toBeDefined()
    expect(track?.modules).toHaveLength(3)
    expect(track?.scenario.id).toBe('siem-foundations-track-scenario')
  })

  it('finds a module by ID and includes its quiz', () => {
    const mod = getModule('siem-logscale-what-is')
    expect(mod).toBeDefined()
    expect(mod?.title).toMatch(/What is LogScale/i)
    expect(mod?.quiz.length).toBeGreaterThanOrEqual(5)
    expect(mod?.concepts.length).toBeGreaterThanOrEqual(1)
  })

  it('returns undefined for an unknown module ID', () => {
    expect(getModule('does-not-exist')).toBeUndefined()
  })

  it('getAllModules includes all 3 Track 1.1 modules', () => {
    const ids = getAllModules().map(m => m.id)
    expect(ids).toContain('siem-logscale-what-is')
    expect(ids).toContain('siem-logscale-ingestion')
    expect(ids).toContain('siem-logscale-data-model')
  })

  it('all question IDs are globally unique across the registry', () => {
    const questionIds = getAllModules().flatMap(m => m.quiz.map(q => q.id))
    const unique = new Set(questionIds)
    expect(unique.size).toBe(questionIds.length)
  })

  it('returns the SIEM cumulative scenario', () => {
    const scenario = getDomainCumulativeScenario('siem')
    expect(scenario).toBeDefined()
    expect(scenario?.isCumulative).toBe(true)
  })
})
