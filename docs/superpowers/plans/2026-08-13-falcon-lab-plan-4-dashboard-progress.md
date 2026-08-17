# Falcon Lab Plan 4: Dashboard & Progress

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement the Dashboard screen (SME readiness, domain cards, SR review card, continue card), the Spaced Repetition Review flow, and the Export/Import feature in Settings.

**Architecture:** Data flows from Dexie through purpose-built hooks (`useAllProgress`, `useDueReviews`, `useLastModule`) into pure display components (`ReadinessBar`, `DomainCard`, etc.) assembled in `DashboardPage`. The SR Review is a new `/review` route with its own runner component that updates Dexie after each answer. Export/Import serialises all Dexie tables to a JSON file and restores them on upload.

**Tech Stack:** Vite 8 + React 19 + TypeScript + Dexie 4 + Tailwind CSS v3 + Vitest + fake-indexeddb + @testing-library/react

## Global Constraints

- Dark mode only — brand Tailwind classes: `bg-brand-bg` (#0F1923), `bg-brand-surface` (#162230), `bg-brand-accent` (#E01B2D), `text-brand-text` (#FFFFFF), `text-brand-muted` (#8899AA), `border-brand-border` (#243446); no inline `style=` except for dynamic width on progress bars
- No new npm dependencies
- All DB reads use `useState` + `useEffect` + cancellation flag pattern — no dexie-react-hooks, no liveQuery
- `CompetencyLevel` consumed only via `src/engine` barrel (NOT from `src/db/schema` directly)
- Vitest globals: `describe`, `it`, `expect`, `beforeEach`, `afterEach` available without import; `vi` must be imported: `import { vi } from 'vitest'`
- `render`, `screen`, `fireEvent`, `waitFor`, `renderHook` imported from `@testing-library/react`
- `fake-indexeddb/auto` imported at the top of every DB-touching test file
- `ContentModule.quiz` is `QuizQuestion[]` (a plain array, NOT `{ questions: QuizQuestion[] }`)
- `ContentModule.domainId` is the domain string (`'siem'`, `'soar'`, `'ltr'`, `'charlotte-ai'`, `'platform'`)
- Domain → route mapping: siem→`/siem`, soar→`/soar`, ltr→`/ltr`, charlotte-ai→`/charlotte`, platform→`/platform`
- `scheduleDueDate` returns a full ISO datetime string (e.g. `'2026-08-13T00:00:00.000Z'`)
- Test counts are advisory ± 2; what matters is all meaningful behaviours are covered

---

## File Map

| Status | File | Role |
|---|---|---|
| **Create** | `src/hooks/useAllProgress.ts` | Reads all competency records; computes domain + overall readiness |
| **Create** | `src/hooks/useAllProgress.test.tsx` | Tests for useAllProgress |
| **Create** | `src/hooks/useDueReviews.ts` | Reads SR items due today or earlier |
| **Create** | `src/hooks/useDueReviews.test.tsx` | Tests for useDueReviews |
| **Create** | `src/hooks/useLastModule.ts` | Reads `currentModuleId` from appState; resolves to module metadata |
| **Create** | `src/hooks/useLastModule.test.tsx` | Tests for useLastModule |
| **Create** | `src/features/dashboard/ReadinessBar.tsx` | Horizontal progress bar with label + % |
| **Create** | `src/features/dashboard/DomainCard.tsx` | Clickable domain card with ReadinessBar |
| **Create** | `src/features/dashboard/DueReviewCard.tsx` | SR due-count card linking to `/review` |
| **Create** | `src/features/dashboard/ContinueCard.tsx` | "Continue where you left off" card |
| **Create** | `src/features/dashboard/dashboard.test.tsx` | Tests for dashboard display components |
| **Modify** | `src/pages/DashboardPage.tsx` | Replace stub with full dashboard |
| **Modify** | `src/features/learning/ModulePage.tsx` | Write `currentModuleId` to appState on mount |
| **Create** | `src/features/sr-review/SrReviewRunner.tsx` | Question-by-question SR review UI |
| **Create** | `src/features/sr-review/SrReviewRunner.test.tsx` | Tests for SrReviewRunner |
| **Create** | `src/pages/SrReviewPage.tsx` | Page wrapper for SrReviewRunner |
| **Modify** | `src/layout/AppShell.tsx` | Add `/review` route |
| **Create** | `src/features/settings/ExportImport.tsx` | Export JSON file / Import JSON file UI |
| **Create** | `src/features/settings/ExportImport.test.tsx` | Tests for ExportImport |
| **Modify** | `src/pages/SettingsPage.tsx` | Replace stub; embed ExportImport |

---

### Task 1: Progress Hooks (`useAllProgress` + `useDueReviews`)

**Files:**
- Create: `src/hooks/useAllProgress.ts`
- Create: `src/hooks/useAllProgress.test.tsx`
- Create: `src/hooks/useDueReviews.ts`
- Create: `src/hooks/useDueReviews.test.tsx`

**Interfaces:**
- Consumes: `db` from `../db`; `DOMAINS`, `getDomainModules` from `../content`; `moduleReadinessScore`, `domainReadinessScore`, `overallSmeReadiness` from `../engine`; `CompetencyRecord` from `../db/schema`; `SpacedRepetitionItem` from `../db/schema`
- Produces:
  - `export interface AllProgress { domainScores: Record<string, number>; overallScore: number; loading: boolean }`
  - `export function useAllProgress(): AllProgress`
  - `export interface DueReviews { items: SpacedRepetitionItem[]; count: number; loading: boolean }`
  - `export function useDueReviews(): DueReviews`

- [ ] **Step 1: Write the failing tests**

Create `src/hooks/useAllProgress.test.tsx`:
```typescript
import { renderHook, waitFor } from '@testing-library/react'
import 'fake-indexeddb/auto'
import { db } from '../db'
import { CompetencyLevel } from '../engine'
import { getDomainModules } from '../content'
import { useAllProgress } from './useAllProgress'

beforeEach(async () => {
  await db.delete()
  await db.open()
})

describe('useAllProgress', () => {
  it('returns loading:true initially then loading:false', async () => {
    const { result } = renderHook(() => useAllProgress())
    expect(result.current.loading).toBe(true)
    await waitFor(() => expect(result.current.loading).toBe(false))
  })

  it('has an entry for all 5 domain IDs', async () => {
    const { result } = renderHook(() => useAllProgress())
    await waitFor(() => expect(result.current.loading).toBe(false))
    for (const id of ['siem', 'soar', 'ltr', 'charlotte-ai', 'platform']) {
      expect(result.current.domainScores).toHaveProperty(id)
    }
  })

  it('returns 0 for all domains when no competency records exist', async () => {
    const { result } = renderHook(() => useAllProgress())
    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.overallScore).toBe(0)
  })

  it('reflects a seeded competency record in the domain score', async () => {
    const modules = getDomainModules('siem')
    if (modules.length > 0) {
      await db.competency.put({
        moduleId:       modules[0].id,
        level:          CompetencyLevel.Practitioner,
        quizScore:      100,
        challengeScore: null,
        scenarioScore:  null,
        updatedAt:      new Date().toISOString(),
      })
    }
    const { result } = renderHook(() => useAllProgress())
    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.domainScores['siem']).toBeGreaterThan(0)
  })
})
```

Create `src/hooks/useDueReviews.test.tsx`:
```typescript
import { renderHook, waitFor } from '@testing-library/react'
import 'fake-indexeddb/auto'
import { db } from '../db'
import { useDueReviews } from './useDueReviews'

beforeEach(async () => {
  await db.delete()
  await db.open()
})

describe('useDueReviews', () => {
  it('returns loading:true initially then loading:false', async () => {
    const { result } = renderHook(() => useDueReviews())
    expect(result.current.loading).toBe(true)
    await waitFor(() => expect(result.current.loading).toBe(false))
  })

  it('returns count:0 when no items are due', async () => {
    const future = new Date(Date.now() + 7 * 86400000).toISOString()
    await db.spacedRepetition.add({ questionId: 'q1', moduleId: 'm1', dueDate: future, retryCount: 0 })
    const { result } = renderHook(() => useDueReviews())
    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.count).toBe(0)
  })

  it('returns past-due items and ignores future ones', async () => {
    const past   = new Date(Date.now() - 86400000).toISOString()  // yesterday
    const future = new Date(Date.now() + 86400000).toISOString()  // tomorrow
    await db.spacedRepetition.add({ questionId: 'q1', moduleId: 'm1', dueDate: past,   retryCount: 0 })
    await db.spacedRepetition.add({ questionId: 'q2', moduleId: 'm1', dueDate: future, retryCount: 1 })

    const { result } = renderHook(() => useDueReviews())
    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.count).toBe(1)
    expect(result.current.items).toHaveLength(1)
    expect(result.current.items[0].questionId).toBe('q1')
  })
})
```

- [ ] **Step 2: Run tests to confirm they fail**

```bash
npm test -- --reporter=verbose
```
Expected: FAIL — `useAllProgress` and `useDueReviews` not found.

- [ ] **Step 3: Create `src/hooks/useAllProgress.ts`**

```typescript
import { useState, useEffect } from 'react'
import { db } from '../db'
import type { CompetencyRecord } from '../db/schema'
import { DOMAINS, getDomainModules } from '../content'
import { moduleReadinessScore, domainReadinessScore, overallSmeReadiness } from '../engine'

export interface AllProgress {
  domainScores: Record<string, number>
  overallScore: number
  loading:      boolean
}

export function useAllProgress(): AllProgress {
  const [progress, setProgress] = useState<AllProgress>({
    domainScores: {},
    overallScore: 0,
    loading:      true,
  })

  useEffect(() => {
    let cancelled = false

    db.competency.toArray().then((records: CompetencyRecord[]) => {
      if (cancelled) return

      const byModule = new Map<string, CompetencyRecord>()
      for (const r of records) byModule.set(r.moduleId, r)

      const domainScores: Record<string, number> = {}
      for (const domain of DOMAINS) {
        const modules = getDomainModules(domain.id)
        const moduleScores = modules.map(mod => {
          const rec = byModule.get(mod.id)
          return moduleReadinessScore(
            rec?.quizScore      ?? null,
            rec?.challengeScore ?? null,
            rec?.scenarioScore  ?? null,
          )
        })
        domainScores[domain.id] = domainReadinessScore(moduleScores)
      }

      const overall = overallSmeReadiness(Object.values(domainScores))
      setProgress({ domainScores, overallScore: overall, loading: false })
    })

    return () => { cancelled = true }
  }, [])

  return progress
}
```

- [ ] **Step 4: Create `src/hooks/useDueReviews.ts`**

```typescript
import { useState, useEffect } from 'react'
import { db } from '../db'
import type { SpacedRepetitionItem } from '../db/schema'

export interface DueReviews {
  items:   SpacedRepetitionItem[]
  count:   number
  loading: boolean
}

export function useDueReviews(): DueReviews {
  const [state, setState] = useState<DueReviews>({ items: [], count: 0, loading: true })

  useEffect(() => {
    let cancelled = false
    const now = new Date().toISOString()  // ISO datetime — dueDate is stored in same format

    db.spacedRepetition
      .where('dueDate')
      .belowOrEqual(now)
      .toArray()
      .then((items: SpacedRepetitionItem[]) => {
        if (!cancelled) setState({ items, count: items.length, loading: false })
      })

    return () => { cancelled = true }
  }, [])

  return state
}
```

- [ ] **Step 5: Run all tests to confirm ~134 passing**

```bash
npm test -- --reporter=verbose
```
Expected: ~134 passed (130 + 4 new hook tests).

- [ ] **Step 6: Commit**

```bash
git add src/hooks/useAllProgress.ts src/hooks/useAllProgress.test.tsx \
        src/hooks/useDueReviews.ts  src/hooks/useDueReviews.test.tsx
git commit -m "feat: add useAllProgress and useDueReviews hooks"
```

---

### Task 2: Dashboard Display Components (`ReadinessBar` + `DomainCard`)

**Files:**
- Create: `src/features/dashboard/ReadinessBar.tsx`
- Create: `src/features/dashboard/DomainCard.tsx`
- Create: `src/features/dashboard/dashboard.test.tsx`

**Interfaces:**
- Consumes: `Link` from `react-router-dom`
- Produces:
  - `export function ReadinessBar({ score, label }: { score: number; label?: string }): JSX.Element`
  - `export function DomainCard({ id, title, emoji, href, score }: DomainCardProps): JSX.Element`

- [ ] **Step 1: Write the failing tests**

Create `src/features/dashboard/dashboard.test.tsx`:
```typescript
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { ReadinessBar } from './ReadinessBar'
import { DomainCard } from './DomainCard'

describe('ReadinessBar', () => {
  it('renders the label and score', () => {
    render(<ReadinessBar score={67} label="Overall" />)
    expect(screen.getByText('Overall')).toBeInTheDocument()
    expect(screen.getByText('67%')).toBeInTheDocument()
  })

  it('renders without a label', () => {
    render(<ReadinessBar score={50} />)
    expect(screen.getByRole('progressbar')).toBeInTheDocument()
  })

  it('progressbar has correct aria attributes', () => {
    render(<ReadinessBar score={42} label="SIEM" />)
    const bar = screen.getByRole('progressbar')
    expect(bar).toHaveAttribute('aria-valuenow', '42')
    expect(bar).toHaveAttribute('aria-valuemin', '0')
    expect(bar).toHaveAttribute('aria-valuemax', '100')
  })
})

describe('DomainCard', () => {
  it('renders domain title and score', () => {
    render(
      <MemoryRouter>
        <DomainCard id="siem" title="SIEM" emoji="📡" href="/siem" score={55} />
      </MemoryRouter>
    )
    expect(screen.getByText('SIEM')).toBeInTheDocument()
    expect(screen.getByText('55%')).toBeInTheDocument()
  })

  it('renders the emoji', () => {
    render(
      <MemoryRouter>
        <DomainCard id="soar" title="SOAR" emoji="⚡" href="/soar" score={0} />
      </MemoryRouter>
    )
    expect(screen.getByText('⚡')).toBeInTheDocument()
  })

  it('links to the correct href', () => {
    render(
      <MemoryRouter>
        <DomainCard id="ltr" title="LTR" emoji="🗄️" href="/ltr" score={20} />
      </MemoryRouter>
    )
    expect(screen.getByRole('link')).toHaveAttribute('href', '/ltr')
  })
})
```

- [ ] **Step 2: Run tests to confirm they fail**

```bash
npm test -- --reporter=verbose
```
Expected: FAIL — components not found.

- [ ] **Step 3: Create `src/features/dashboard/ReadinessBar.tsx`**

```tsx
interface Props {
  score: number   // 0–100
  label?: string
}

export function ReadinessBar({ score, label }: Props) {
  const clamped = Math.min(100, Math.max(0, score))
  return (
    <div className="space-y-1">
      {label && (
        <div className="flex justify-between text-sm">
          <span className="text-brand-text">{label}</span>
          <span className="text-brand-muted">{score}%</span>
        </div>
      )}
      <div className="w-full bg-brand-surface rounded-full h-2 border border-brand-border">
        <div
          className="bg-brand-accent h-2 rounded-full transition-all duration-300"
          style={{ width: `${clamped}%` }}
          role="progressbar"
          aria-valuenow={score}
          aria-valuemin={0}
          aria-valuemax={100}
        />
      </div>
    </div>
  )
}
```

- [ ] **Step 4: Create `src/features/dashboard/DomainCard.tsx`**

```tsx
import { Link } from 'react-router-dom'
import { ReadinessBar } from './ReadinessBar'

interface DomainCardProps {
  id:    string   // domain id, e.g. 'siem'
  title: string   // display name, e.g. 'SIEM'
  emoji: string
  href:  string   // route, e.g. '/siem'
  score: number   // 0–100
}

export function DomainCard({ id: _id, title, emoji, href, score }: DomainCardProps) {
  return (
    <Link
      to={href}
      className="block p-4 bg-brand-surface border border-brand-border rounded-lg hover:border-brand-accent transition-colors"
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-xl">{emoji}</span>
          <span className="font-medium text-brand-text">{title}</span>
        </div>
        <span className="text-brand-muted text-sm">{score}%</span>
      </div>
      <ReadinessBar score={score} />
    </Link>
  )
}
```

- [ ] **Step 5: Run all tests to confirm ~140 passing**

```bash
npm test -- --reporter=verbose
```
Expected: ~140 passed (134 + 6 new component tests).

- [ ] **Step 6: Commit**

```bash
git add src/features/dashboard/ReadinessBar.tsx \
        src/features/dashboard/DomainCard.tsx   \
        src/features/dashboard/dashboard.test.tsx
git commit -m "feat: add ReadinessBar and DomainCard dashboard components"
```

---

### Task 3: "Continue Where You Left Off" (`useLastModule` + `ContinueCard` + ModulePage write)

**Files:**
- Create: `src/hooks/useLastModule.ts`
- Create: `src/hooks/useLastModule.test.tsx`
- Create: `src/features/dashboard/ContinueCard.tsx`
- Modify: `src/features/learning/ModulePage.tsx` (add `useEffect` to write `currentModuleId` to `db.appState`)

**Interfaces:**
- Consumes: `db` from `../db`; `getModule` from `../content`; `Link` from `react-router-dom`
- Produces:
  - `export interface LastModuleState { href: string; title: string }`
  - `export function useLastModule(): LastModuleState | null`
  - `export function ContinueCard(): JSX.Element | null`

Domain → route mapping used inside `useLastModule` (hardcoded constant, not exported):
```
siem          → /siem
soar          → /soar
ltr           → /ltr
charlotte-ai  → /charlotte
platform      → /platform
```

- [ ] **Step 1: Write the failing tests**

Create `src/hooks/useLastModule.test.tsx`:
```typescript
import { renderHook, waitFor } from '@testing-library/react'
import 'fake-indexeddb/auto'
import { db } from '../db'
import { getDomainModules } from '../content'
import { useLastModule } from './useLastModule'

beforeEach(async () => {
  await db.delete()
  await db.open()
})

describe('useLastModule', () => {
  it('returns null when no currentModuleId is stored', async () => {
    const { result } = renderHook(() => useLastModule())
    await waitFor(() => expect(result.current).toBeNull())
  })

  it('returns href and title when a valid module is stored', async () => {
    const modules = getDomainModules('siem')
    if (modules.length === 0) return  // skip if no siem modules in seed data
    const mod = modules[0]
    await db.appState.put({ key: 'currentModuleId', value: mod.id })

    const { result } = renderHook(() => useLastModule())
    await waitFor(() => expect(result.current).not.toBeNull())
    expect(result.current!.title).toBe(mod.title)
    expect(result.current!.href).toBe(`/siem/module/${mod.id}`)
  })

  it('returns null for an unknown module id', async () => {
    await db.appState.put({ key: 'currentModuleId', value: 'nonexistent-module-id' })
    const { result } = renderHook(() => useLastModule())
    // Stays null because getModule returns undefined
    await new Promise(r => setTimeout(r, 50))
    expect(result.current).toBeNull()
  })
})
```

- [ ] **Step 2: Run tests to confirm they fail**

```bash
npm test -- --reporter=verbose
```
Expected: FAIL — `useLastModule` not found.

- [ ] **Step 3: Create `src/hooks/useLastModule.ts`**

```typescript
import { useState, useEffect } from 'react'
import { db } from '../db'
import { getModule } from '../content'

export interface LastModuleState {
  href:  string  // full route path, e.g. '/siem/module/some-module-id'
  title: string
}

const DOMAIN_ROUTES: Record<string, string> = {
  'siem':         '/siem',
  'soar':         '/soar',
  'ltr':          '/ltr',
  'charlotte-ai': '/charlotte',
  'platform':     '/platform',
}

export function useLastModule(): LastModuleState | null {
  const [state, setState] = useState<LastModuleState | null>(null)

  useEffect(() => {
    let cancelled = false

    db.appState.get('currentModuleId').then(record => {
      if (cancelled || !record) return
      const mod = getModule(record.value)
      if (!mod || cancelled) return
      const domainRoute = DOMAIN_ROUTES[mod.domainId]
      if (!domainRoute || cancelled) return
      setState({ href: `${domainRoute}/module/${mod.id}`, title: mod.title })
    })

    return () => { cancelled = true }
  }, [])

  return state
}
```

- [ ] **Step 4: Create `src/features/dashboard/ContinueCard.tsx`**

```tsx
import { Link } from 'react-router-dom'
import { useLastModule } from '../../hooks/useLastModule'

export function ContinueCard() {
  const lastModule = useLastModule()

  if (!lastModule) return null

  return (
    <Link
      to={lastModule.href}
      className="block p-4 bg-brand-surface border border-brand-border rounded-lg hover:border-brand-accent transition-colors"
    >
      <p className="text-brand-muted text-xs uppercase tracking-wide mb-1">
        Continue where you left off
      </p>
      <p className="text-brand-text font-medium">{lastModule.title}</p>
    </Link>
  )
}
```

- [ ] **Step 5: Modify `src/features/learning/ModulePage.tsx` — write `currentModuleId` to appState on mount**

Add `useEffect` at the top of the `ModulePage` function body (after the `mod` lookup, before the early return):

```tsx
// Add to existing imports at the top of the file:
import { useState, useEffect } from 'react'
// (useState is already imported — add useEffect if not already present)
```

Add this block immediately after `const mod = moduleId ? getModule(moduleId) : undefined` and before `if (!mod) { return ... }`:

```tsx
  // Track the last visited module for the dashboard "Continue" card
  useEffect(() => {
    if (moduleId) {
      db.appState.put({ key: 'currentModuleId', value: moduleId })
    }
  }, [moduleId])
```

The file currently imports `useState` and `useParams` and `useNavigate`. Add `useEffect` to the React import line. The rest of `ModulePage.tsx` is unchanged.

Full updated import line:
```tsx
import { useState, useEffect } from 'react'
```

- [ ] **Step 6: Run all tests to confirm ~143 passing**

```bash
npm test -- --reporter=verbose
```
Expected: ~143 passed (140 + 3 new hook tests; ModulePage change adds no new tests but must not break existing ones).

- [ ] **Step 7: Commit**

```bash
git add src/hooks/useLastModule.ts src/hooks/useLastModule.test.tsx \
        src/features/dashboard/ContinueCard.tsx                      \
        src/features/learning/ModulePage.tsx
git commit -m "feat: add useLastModule hook, ContinueCard, and module tracking in ModulePage"
```

---

### Task 4: Full `DashboardPage` + `DueReviewCard`

**Files:**
- Modify: `src/pages/DashboardPage.tsx` (replace stub with full implementation)
- Create: `src/features/dashboard/DueReviewCard.tsx`

**Interfaces:**
- Consumes:
  - `useAllProgress` from `../hooks/useAllProgress`
  - `useDueReviews` from `../hooks/useDueReviews` (inside `DueReviewCard`)
  - `ReadinessBar` from `../features/dashboard/ReadinessBar`
  - `DomainCard` from `../features/dashboard/DomainCard`
  - `ContinueCard` from `../features/dashboard/ContinueCard`
  - `DueReviewCard` from `../features/dashboard/DueReviewCard`
  - `DOMAINS` from `../content` — shape: `{ id: string, title: string, emoji: string }[]`
- Produces: default export `DashboardPage`; named export `DueReviewCard`

`DOMAINS` is imported from `src/content/index.ts`. Each entry has `id`, `title`, `emoji` (from `ContentDomain`).

Domain-to-route mapping for `DomainCard` — use this constant inside `DashboardPage`:
```typescript
const DOMAIN_ROUTES: Record<string, string> = {
  'siem':         '/siem',
  'soar':         '/soar',
  'ltr':          '/ltr',
  'charlotte-ai': '/charlotte',
  'platform':     '/platform',
}
```

- [ ] **Step 1: Write the failing tests**

Add these tests to `src/features/dashboard/dashboard.test.tsx` (append, do not replace existing tests):

```typescript
import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import 'fake-indexeddb/auto'
import { db } from '../../db'
import { DueReviewCard } from './DueReviewCard'

// Add at end of dashboard.test.tsx:

describe('DueReviewCard', () => {
  beforeEach(async () => {
    await db.delete()
    await db.open()
  })

  it('shows "No reviews due" when queue is empty', async () => {
    render(<MemoryRouter><DueReviewCard /></MemoryRouter>)
    await waitFor(() => expect(screen.getByText(/No reviews due/i)).toBeInTheDocument())
  })

  it('shows due count and links to /review when items are due', async () => {
    const past = new Date(Date.now() - 86400000).toISOString()
    await db.spacedRepetition.add({ questionId: 'q1', moduleId: 'm1', dueDate: past, retryCount: 0 })
    await db.spacedRepetition.add({ questionId: 'q2', moduleId: 'm1', dueDate: past, retryCount: 0 })

    render(<MemoryRouter><DueReviewCard /></MemoryRouter>)
    await waitFor(() => expect(screen.getByText(/2 questions ready/i)).toBeInTheDocument())
    expect(screen.getByRole('link')).toHaveAttribute('href', '/review')
  })
})
```

- [ ] **Step 2: Run tests to confirm they fail**

```bash
npm test -- --reporter=verbose
```
Expected: FAIL — `DueReviewCard` not found.

- [ ] **Step 3: Create `src/features/dashboard/DueReviewCard.tsx`**

```tsx
import { Link } from 'react-router-dom'
import { useDueReviews } from '../../hooks/useDueReviews'

export function DueReviewCard() {
  const { count, loading } = useDueReviews()

  if (loading) return null

  if (count === 0) {
    return (
      <div className="p-4 bg-brand-surface border border-brand-border rounded-lg">
        <p className="text-brand-muted text-sm">🧠 No reviews due — check back later.</p>
      </div>
    )
  }

  return (
    <Link
      to="/review"
      className="block p-4 bg-brand-surface border border-brand-accent rounded-lg hover:opacity-90 transition-opacity"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-brand-text font-medium">🧠 Due for Review</p>
          <p className="text-brand-muted text-sm mt-1">
            {count} question{count !== 1 ? 's' : ''} ready
          </p>
        </div>
        <span className="text-brand-accent font-bold text-xl">→</span>
      </div>
    </Link>
  )
}
```

- [ ] **Step 4: Replace the stub `src/pages/DashboardPage.tsx`**

```tsx
import { DOMAINS } from '../content'
import { useAllProgress } from '../hooks/useAllProgress'
import { ReadinessBar } from '../features/dashboard/ReadinessBar'
import { DomainCard } from '../features/dashboard/DomainCard'
import { ContinueCard } from '../features/dashboard/ContinueCard'
import { DueReviewCard } from '../features/dashboard/DueReviewCard'

const DOMAIN_ROUTES: Record<string, string> = {
  'siem':         '/siem',
  'soar':         '/soar',
  'ltr':          '/ltr',
  'charlotte-ai': '/charlotte',
  'platform':     '/platform',
}

export default function DashboardPage() {
  const { domainScores, overallScore, loading } = useAllProgress()

  if (loading) {
    return <div className="p-8 text-brand-muted">Loading...</div>
  }

  return (
    <div className="p-6 space-y-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-brand-text">Dashboard</h1>

      {/* Overall SME Readiness */}
      <section className="p-4 bg-brand-surface border border-brand-border rounded-lg space-y-3">
        <h2 className="text-lg font-semibold text-brand-text">SME Readiness</h2>
        <ReadinessBar score={overallScore} label="Overall" />
      </section>

      {/* Continue card — null when no module visited yet */}
      <ContinueCard />

      {/* Due for review — null while loading, "no reviews" or count card when ready */}
      <DueReviewCard />

      {/* Domain readiness cards */}
      <section>
        <h2 className="text-lg font-semibold text-brand-text mb-3">Domains</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {DOMAINS.map(domain => (
            <DomainCard
              key={domain.id}
              id={domain.id}
              title={domain.title}
              emoji={domain.emoji}
              href={DOMAIN_ROUTES[domain.id] ?? `/${domain.id}`}
              score={domainScores[domain.id] ?? 0}
            />
          ))}
        </div>
      </section>
    </div>
  )
}
```

- [ ] **Step 5: Run all tests to confirm ~145 passing**

```bash
npm test -- --reporter=verbose
```
Expected: ~145 passed (143 + 2 new DueReviewCard tests; DashboardPage has no unit tests by design — it's integration tested via visual inspection).

- [ ] **Step 6: Commit**

```bash
git add src/features/dashboard/DueReviewCard.tsx src/pages/DashboardPage.tsx \
        src/features/dashboard/dashboard.test.tsx
git commit -m "feat: add DueReviewCard and full DashboardPage"
```

---

### Task 5: SR Review (`SrReviewRunner` + `SrReviewPage` + route)

**Files:**
- Create: `src/features/sr-review/SrReviewRunner.tsx`
- Create: `src/features/sr-review/SrReviewRunner.test.tsx`
- Create: `src/pages/SrReviewPage.tsx`
- Modify: `src/layout/AppShell.tsx`

**Interfaces:**
- Consumes:
  - `db` from `../../db`; `SpacedRepetitionItem` from `../../db/schema`
  - `getModule` from `../../content`; `QuizQuestion` from `../../content/types`
  - `scheduleDueDate`, `advanceRetryCount`, `shouldRetireItem` from `../../engine`
  - `useDueReviews` from `../../hooks/useDueReviews` (inside `SrReviewPage`)
  - `Link`, `useNavigate` from `react-router-dom`
- Produces:
  - `export interface SrReviewRunnerProps { items: SpacedRepetitionItem[]; onDone: (reviewed: number, retired: number) => void }`
  - `export function SrReviewRunner(props: SrReviewRunnerProps): JSX.Element`
  - `export default function SrReviewPage(): JSX.Element`

**SrReviewRunner behaviour:**
- Shows one question at a time from `items` (each item's question is looked up via `getModule(item.moduleId)` → `mod.quiz.find(q => q.id === item.questionId)`)
- Progress: "Review N of M"
- After answering: show feedback ("✓ Correct" / "✗ Incorrect") and explanation
- Correct answer: `advanceRetryCount(item.retryCount)` → if `shouldRetireItem(newRetryCount)`: `db.spacedRepetition.delete(item.id!)`, else `db.spacedRepetition.update(item.id!, { retryCount: newRetryCount, dueDate: scheduleDueDate(newRetryCount) })`
- Wrong answer: reset to retryCount=0, `db.spacedRepetition.update(item.id!, { retryCount: 0, dueDate: scheduleDueDate(0) })`
- Button labels: "Next" (not last), "Finish Review" (last)
- After last item's Next/Finish: render completion screen — "Review complete!", reviewed count, retired count, "Back to Dashboard" button that calls `onDone(reviewed, retired)`
- If a question is not found in content (defensive guard): render a Skip button that advances to next item

- [ ] **Step 1: Write the failing tests**

Create `src/features/sr-review/SrReviewRunner.test.tsx`:
```typescript
import { vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import 'fake-indexeddb/auto'
import { db } from '../../db'
import { SrReviewRunner } from './SrReviewRunner'
import type { SpacedRepetitionItem } from '../../db/schema'

// Mock content lookup so tests don't depend on seed data
vi.mock('../../content', () => ({
  getModule: (_id: string) => ({
    id: 'test-module',
    title: 'Test Module',
    quiz: [
      {
        id: 'q1',
        text: 'What is LogScale?',
        options: ['A log platform', 'B thing', 'C thing', 'D thing'],
        correctIndex: 0,
        explanation: 'LogScale is a log platform.',
        docTitle: 'Docs',
        docUrl: 'https://example.com',
      },
    ],
  }),
}))

// Mock engine SR functions so tests don't depend on timing
vi.mock('../../engine', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../../engine')>()
  return {
    ...actual,
    scheduleDueDate:   vi.fn(() => '2099-01-01T00:00:00.000Z'),
    advanceRetryCount: vi.fn((n: number) => n + 1),
    shouldRetireItem:  vi.fn(() => false),
  }
})

const makeItem = (id: number): SpacedRepetitionItem => ({
  id,
  questionId: 'q1',
  moduleId:   'test-module',
  dueDate:    '2026-01-01T00:00:00.000Z',
  retryCount: 0,
})

beforeEach(async () => {
  await db.delete()
  await db.open()
  // Pre-insert items so db.spacedRepetition.update/delete has a real row to target
  await db.spacedRepetition.add({ questionId: 'q1', moduleId: 'test-module', dueDate: '2026-01-01T00:00:00.000Z', retryCount: 0 })
})

describe('SrReviewRunner', () => {
  it('shows question text and progress indicator', () => {
    render(<SrReviewRunner items={[makeItem(1)]} onDone={vi.fn()} />)
    expect(screen.getByText('What is LogScale?')).toBeInTheDocument()
    expect(screen.getByText('Review 1 of 1')).toBeInTheDocument()
  })

  it('shows correct feedback after a correct answer', () => {
    render(<SrReviewRunner items={[makeItem(1)]} onDone={vi.fn()} />)
    fireEvent.click(screen.getAllByRole('button')[0])  // A = index 0 = correct
    expect(screen.getByText('✓ Correct')).toBeInTheDocument()
  })

  it('shows incorrect feedback after a wrong answer', () => {
    render(<SrReviewRunner items={[makeItem(1)]} onDone={vi.fn()} />)
    fireEvent.click(screen.getAllByRole('button')[1])  // B = index 1 = wrong
    expect(screen.getByText('✗ Incorrect')).toBeInTheDocument()
  })

  it('shows Finish Review on the last item', () => {
    render(<SrReviewRunner items={[makeItem(1)]} onDone={vi.fn()} />)
    fireEvent.click(screen.getAllByRole('button')[0])
    expect(screen.getByText('Finish Review')).toBeInTheDocument()
  })

  it('shows completion screen and calls onDone after finishing', async () => {
    const onDone = vi.fn()
    render(<SrReviewRunner items={[makeItem(1)]} onDone={onDone} />)
    fireEvent.click(screen.getAllByRole('button')[0])  // answer
    fireEvent.click(screen.getByText('Finish Review'))
    await waitFor(() => expect(screen.getByText(/Review complete/i)).toBeInTheDocument())
    fireEvent.click(screen.getByText('Back to Dashboard'))
    expect(onDone).toHaveBeenCalledOnce()
  })
})
```

- [ ] **Step 2: Run tests to confirm they fail**

```bash
npm test -- --reporter=verbose
```
Expected: FAIL — `SrReviewRunner` not found.

- [ ] **Step 3: Create `src/features/sr-review/SrReviewRunner.tsx`**

```tsx
import { useState } from 'react'
import { db } from '../../db'
import { getModule } from '../../content'
import { scheduleDueDate, advanceRetryCount, shouldRetireItem } from '../../engine'
import type { SpacedRepetitionItem } from '../../db/schema'
import type { QuizQuestion } from '../../content/types'

export interface SrReviewRunnerProps {
  items:  SpacedRepetitionItem[]
  onDone: (reviewed: number, retired: number) => void
}

export function SrReviewRunner({ items, onDone }: SrReviewRunnerProps) {
  const [index,    setIndex]    = useState(0)
  const [selected, setSelected] = useState<number | null>(null)
  const [revealed, setRevealed] = useState(false)
  const [stats,    setStats]    = useState({ reviewed: 0, retired: 0 })

  // ── Completion screen ────────────────────────────────────────────────────────
  if (index >= items.length) {
    return (
      <div className="space-y-4 text-center p-8">
        <p className="text-brand-text text-xl font-semibold">Review complete!</p>
        <p className="text-brand-muted">
          {stats.reviewed} reviewed · {stats.retired} retired
        </p>
        <button
          className="px-6 py-2 bg-brand-accent text-white rounded font-medium hover:opacity-90"
          onClick={() => onDone(stats.reviewed, stats.retired)}
        >
          Back to Dashboard
        </button>
      </div>
    )
  }

  const item = items[index]
  const mod  = getModule(item.moduleId)
  const question: QuizQuestion | undefined = mod?.quiz.find(q => q.id === item.questionId)

  // ── Defensive guard: question not found in content ───────────────────────────
  if (!question) {
    return (
      <div className="p-8 space-y-4">
        <p className="text-brand-muted">Question not found — skipping.</p>
        <button
          className="px-4 py-2 bg-brand-surface border border-brand-border text-brand-text rounded hover:border-brand-accent"
          onClick={() => setIndex(i => i + 1)}
        >
          Skip
        </button>
      </div>
    )
  }

  const isCorrect = revealed && selected === question.correctIndex

  async function handleAnswer(idx: number) {
    if (revealed) return
    setSelected(idx)
    setRevealed(true)

    const correct = idx === question!.correctIndex
    if (correct) {
      const newRetryCount = advanceRetryCount(item.retryCount)
      const retire        = shouldRetireItem(newRetryCount)
      if (retire) {
        await db.spacedRepetition.delete(item.id!)
        setStats(s => ({ reviewed: s.reviewed + 1, retired: s.retired + 1 }))
      } else {
        await db.spacedRepetition.update(item.id!, {
          retryCount: newRetryCount,
          dueDate:    scheduleDueDate(newRetryCount),
        })
        setStats(s => ({ ...s, reviewed: s.reviewed + 1 }))
      }
    } else {
      // Wrong — reset retry count to 0, reschedule for tomorrow
      await db.spacedRepetition.update(item.id!, {
        retryCount: 0,
        dueDate:    scheduleDueDate(0),
      })
      setStats(s => ({ ...s, reviewed: s.reviewed + 1 }))
    }
  }

  function handleNext() {
    setSelected(null)
    setRevealed(false)
    setIndex(i => i + 1)
  }

  const isLast = index + 1 >= items.length

  return (
    <div className="space-y-4">
      <p className="text-brand-muted text-sm">Review {index + 1} of {items.length}</p>
      <p className="text-brand-text font-medium text-lg">{question.text}</p>

      <div className="space-y-2">
        {question.options.map((opt, i) => {
          let cls = 'w-full text-left p-3 rounded border text-sm transition-colors '
          if (!revealed) {
            cls += 'border-brand-border bg-brand-surface hover:border-brand-accent text-brand-text cursor-pointer'
          } else if (i === question!.correctIndex) {
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
        </div>
      )}

      {revealed && (
        <button
          className="mt-2 px-6 py-2 bg-brand-accent text-white rounded font-medium hover:opacity-90"
          onClick={handleNext}
        >
          {isLast ? 'Finish Review' : 'Next'}
        </button>
      )}
    </div>
  )
}
```

- [ ] **Step 4: Create `src/pages/SrReviewPage.tsx`**

```tsx
import { useNavigate } from 'react-router-dom'
import { useDueReviews } from '../hooks/useDueReviews'
import { SrReviewRunner } from '../features/sr-review/SrReviewRunner'

export default function SrReviewPage() {
  const navigate = useNavigate()
  const { items, count, loading } = useDueReviews()

  if (loading) {
    return <div className="p-8 text-brand-muted">Loading review queue...</div>
  }

  if (count === 0) {
    return (
      <div className="p-8 space-y-4">
        <h2 className="text-2xl font-bold text-brand-text">Spaced Repetition Review</h2>
        <p className="text-brand-muted">No items due for review. Great job staying current!</p>
        <button
          className="px-6 py-2 bg-brand-surface border border-brand-border text-brand-text rounded hover:border-brand-accent transition-colors"
          onClick={() => navigate('/')}
        >
          ← Back to Dashboard
        </button>
      </div>
    )
  }

  return (
    <div className="p-8 max-w-2xl">
      <h2 className="text-2xl font-bold text-brand-text mb-6">Spaced Repetition Review</h2>
      <SrReviewRunner items={items} onDone={() => navigate('/')} />
    </div>
  )
}
```

- [ ] **Step 5: Add `/review` route to `src/layout/AppShell.tsx`**

Add the import at the top (with other page imports):
```tsx
import SrReviewPage from '../pages/SrReviewPage'
```

Add the route inside `<Routes>` (e.g., before `/tutor`):
```tsx
<Route path="/review" element={<SrReviewPage />} />
```

Final `<Routes>` block:
```tsx
<Routes>
  <Route path="/"            element={<DashboardPage />} />
  <Route path="/siem/*"      element={<SiemPage />} />
  <Route path="/soar/*"      element={<SoarPage />} />
  <Route path="/ltr/*"       element={<LtrPage />} />
  <Route path="/charlotte/*" element={<CharlotteAiPage />} />
  <Route path="/platform/*"  element={<PlatformPage />} />
  <Route path="/review"      element={<SrReviewPage />} />
  <Route path="/tutor"       element={<TutorPage />} />
  <Route path="/settings"    element={<SettingsPage />} />
</Routes>
```

- [ ] **Step 6: Run all tests to confirm ~150 passing**

```bash
npm test -- --reporter=verbose
```
Expected: ~150 passed (145 + 5 new SrReviewRunner tests).

- [ ] **Step 7: Commit**

```bash
git add src/features/sr-review/SrReviewRunner.tsx                \
        src/features/sr-review/SrReviewRunner.test.tsx           \
        src/pages/SrReviewPage.tsx                               \
        src/layout/AppShell.tsx
git commit -m "feat: add SrReviewRunner, SrReviewPage, and /review route"
```

---

### Task 6: Export/Import

**Files:**
- Create: `src/features/settings/ExportImport.tsx`
- Create: `src/features/settings/ExportImport.test.tsx`
- Modify: `src/pages/SettingsPage.tsx`

**Export format** (follows spec exactly):

```typescript
interface FalconLabExport {
  exportedAt:      string                   // ISO timestamp of export
  version:         '1.0'
  competency:      Record<string, string>   // moduleId → CompetencyLevel string value
  quizHistory:     Omit<QuizHistoryEntry, 'id'>[]
  scenarioHistory: Omit<ScenarioHistoryEntry, 'id'>[]
  spacedRepetition: Omit<SpacedRepetitionItem, 'id'>[]
  domainReadiness: Record<string, number>   // domainId → readiness score (for reference)
}
```

Note: `competency` exports only the `level` string per module (not full scores) to match the spec format.

**Import behaviour:**
1. Parse JSON; reject if `version !== '1.0'`
2. Clear all 4 tables (`competency`, `quizHistory`, `scenarioHistory`, `spacedRepetition`) — do NOT clear `appState`
3. Restore `competency`: for each `[moduleId, levelStr]` entry, `db.competency.put({ moduleId, level: levelStr as CompetencyLevel, quizScore: null, challengeScore: null, scenarioScore: null, updatedAt: now })`
4. Restore `quizHistory`, `scenarioHistory`, `spacedRepetition` via `bulkAdd` (IDs are auto-assigned)
5. Show success/failure message inline (no alert dialogs)

**Export behaviour:**
1. Read all tables in parallel with `Promise.all`
2. Build `FalconLabExport` object (compute `domainReadiness` using `moduleReadinessScore` + `domainReadinessScore` from engine)
3. Serialize to JSON, create a Blob, trigger download via a temporary `<a>` element
4. Filename: `falcon-lab-progress-YYYY-MM-DD.json`

- [ ] **Step 1: Write the failing tests**

Create `src/features/settings/ExportImport.test.tsx`:
```typescript
import { vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import 'fake-indexeddb/auto'
import { db } from '../../db'
import { CompetencyLevel } from '../../engine'
import { ExportImport } from './ExportImport'

// Mock URL.createObjectURL and URL.revokeObjectURL (not available in jsdom)
global.URL.createObjectURL = vi.fn(() => 'blob:mock')
global.URL.revokeObjectURL = vi.fn()

// Mock anchor click to prevent jsdom errors
const clickSpy = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {})

beforeEach(async () => {
  await db.delete()
  await db.open()
  clickSpy.mockClear()
})

describe('ExportImport', () => {
  it('renders Export and Import buttons', () => {
    render(<ExportImport />)
    expect(screen.getByRole('button', { name: /export/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /import/i })).toBeInTheDocument()
  })

  it('triggers a file download on Export click', async () => {
    render(<ExportImport />)
    fireEvent.click(screen.getByRole('button', { name: /export/i }))
    await waitFor(() => expect(clickSpy).toHaveBeenCalledOnce())
  })

  it('shows success message after valid import', async () => {
    const exportData = {
      exportedAt:      new Date().toISOString(),
      version:         '1.0',
      competency:      { 'siem-module-1': CompetencyLevel.Practitioner },
      quizHistory:     [],
      scenarioHistory: [],
      spacedRepetition: [],
      domainReadiness: { siem: 20, soar: 0, ltr: 0, 'charlotte-ai': 0, platform: 0 },
    }
    const file = new File([JSON.stringify(exportData)], 'test.json', { type: 'application/json' })
    const input = document.createElement('input')
    input.type = 'file'

    render(<ExportImport />)
    const importBtn = screen.getByRole('button', { name: /import/i })

    // Simulate file selection by directly calling the file handler
    // We find the hidden file input rendered by ExportImport and fire change event
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement
    Object.defineProperty(fileInput, 'files', { value: [file], writable: false })
    fireEvent.change(fileInput)

    await waitFor(() => expect(screen.getByText(/imported successfully/i)).toBeInTheDocument())
  })

  it('shows error message for invalid JSON', async () => {
    render(<ExportImport />)
    const file = new File(['not json'], 'bad.json', { type: 'application/json' })
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement
    Object.defineProperty(fileInput, 'files', { value: [file], writable: false })
    fireEvent.change(fileInput)

    await waitFor(() => expect(screen.getByText(/import failed/i)).toBeInTheDocument())
  })
})
```

- [ ] **Step 2: Run tests to confirm they fail**

```bash
npm test -- --reporter=verbose
```
Expected: FAIL — `ExportImport` not found.

- [ ] **Step 3: Create `src/features/settings/ExportImport.tsx`**

```tsx
import { useRef, useState } from 'react'
import { db } from '../../db'
import { CompetencyLevel } from '../../engine'
import { moduleReadinessScore, domainReadinessScore } from '../../engine'
import { DOMAINS, getDomainModules } from '../../content'
import type { QuizHistoryEntry, ScenarioHistoryEntry, SpacedRepetitionItem } from '../../db/schema'

interface FalconLabExport {
  exportedAt:       string
  version:          '1.0'
  competency:       Record<string, string>
  quizHistory:      Omit<QuizHistoryEntry, 'id'>[]
  scenarioHistory:  Omit<ScenarioHistoryEntry, 'id'>[]
  spacedRepetition: Omit<SpacedRepetitionItem, 'id'>[]
  domainReadiness:  Record<string, number>
}

export function ExportImport() {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [status, setStatus] = useState<string | null>(null)

  // ── Export ───────────────────────────────────────────────────────────────────
  async function handleExport() {
    const [competencyRecords, quizHistory, scenarioHistory, spacedRepetition] = await Promise.all([
      db.competency.toArray(),
      db.quizHistory.toArray(),
      db.scenarioHistory.toArray(),
      db.spacedRepetition.toArray(),
    ])

    // Competency: export level string only (per spec)
    const competency: Record<string, string> = {}
    for (const r of competencyRecords) competency[r.moduleId] = r.level

    // Domain readiness: compute from stored scores
    const domainReadiness: Record<string, number> = {}
    const byModule = new Map(competencyRecords.map(r => [r.moduleId, r]))
    for (const domain of DOMAINS) {
      const scores = getDomainModules(domain.id).map(mod => {
        const rec = byModule.get(mod.id)
        return moduleReadinessScore(rec?.quizScore ?? null, rec?.challengeScore ?? null, rec?.scenarioScore ?? null)
      })
      domainReadiness[domain.id] = domainReadinessScore(scores)
    }

    const data: FalconLabExport = {
      exportedAt:       new Date().toISOString(),
      version:          '1.0',
      competency,
      quizHistory:      quizHistory.map(({ id: _id, ...rest }) => rest),
      scenarioHistory:  scenarioHistory.map(({ id: _id, ...rest }) => rest),
      spacedRepetition: spacedRepetition.map(({ id: _id, ...rest }) => rest),
      domainReadiness,
    }

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement('a')
    a.href     = url
    a.download = `falcon-lab-progress-${new Date().toISOString().split('T')[0]}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  // ── Import ───────────────────────────────────────────────────────────────────
  function handleImportClick() {
    fileInputRef.current?.click()
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setStatus(null)

    try {
      const text = await file.text()
      const data: FalconLabExport = JSON.parse(text)

      if (data.version !== '1.0') {
        setStatus('Import failed: unsupported version.')
        return
      }

      const now = new Date().toISOString()

      // Clear existing data (leave appState intact)
      await Promise.all([
        db.competency.clear(),
        db.quizHistory.clear(),
        db.scenarioHistory.clear(),
        db.spacedRepetition.clear(),
      ])

      // Restore competency (minimal records — scores set to null)
      const competencyEntries = Object.entries(data.competency).map(([moduleId, levelStr]) => ({
        moduleId,
        level:          levelStr as CompetencyLevel,
        quizScore:      null,
        challengeScore: null,
        scenarioScore:  null,
        updatedAt:      now,
      }))
      if (competencyEntries.length > 0) await db.competency.bulkPut(competencyEntries)

      // Restore history tables
      if (data.quizHistory?.length)      await db.quizHistory.bulkAdd(data.quizHistory)
      if (data.scenarioHistory?.length)  await db.scenarioHistory.bulkAdd(data.scenarioHistory)
      if (data.spacedRepetition?.length) await db.spacedRepetition.bulkAdd(data.spacedRepetition)

      setStatus('Imported successfully. Reload the page to see updated progress.')
    } catch {
      setStatus('Import failed: invalid file format.')
    }

    // Reset input so the same file can be re-imported
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3">
        <button
          className="px-5 py-2 bg-brand-accent text-white rounded font-medium hover:opacity-90 transition-opacity"
          onClick={handleExport}
        >
          Export Progress
        </button>
        <button
          className="px-5 py-2 bg-brand-surface border border-brand-border text-brand-text rounded font-medium hover:border-brand-accent transition-colors"
          onClick={handleImportClick}
        >
          Import Progress
        </button>
        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="application/json,.json"
          className="hidden"
          onChange={handleFileChange}
        />
      </div>

      {status && (
        <p className={`text-sm ${status.startsWith('Import failed') ? 'text-red-400' : 'text-green-400'}`}>
          {status}
        </p>
      )}
    </div>
  )
}
```

- [ ] **Step 4: Replace the stub `src/pages/SettingsPage.tsx`**

```tsx
import { ExportImport } from '../features/settings/ExportImport'

export default function SettingsPage() {
  return (
    <div className="p-6 space-y-8 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-brand-text">Settings</h1>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-brand-text">Progress Data</h2>
        <p className="text-brand-muted text-sm">
          Export your progress to a JSON file and import it on another device (iPad, laptop) to keep your competency levels, quiz history, and spaced repetition queue in sync.
        </p>
        <ExportImport />
      </section>
    </div>
  )
}
```

- [ ] **Step 5: Run all tests to confirm ~154 passing**

```bash
npm test -- --reporter=verbose
```
Expected: ~154 passed (150 + 4 new ExportImport tests).

- [ ] **Step 6: Commit**

```bash
git add src/features/settings/ExportImport.tsx                \
        src/features/settings/ExportImport.test.tsx           \
        src/pages/SettingsPage.tsx
git commit -m "feat: add Export/Import feature and Settings page"
```

---

## Self-Review

### 1. Spec coverage

| Spec requirement | Task that implements it |
|---|---|
| Overall SME Readiness progress bar | Task 4 — `ReadinessBar` in DashboardPage |
| "Continue where you left off" card | Task 3 — `ContinueCard` + `useLastModule` |
| "Due for Review" spaced repetition card | Task 4 — `DueReviewCard` |
| Domain readiness bars for all five domains | Task 4 — `DomainCard` × 5 in DashboardPage |
| Export / Import progress buttons | Task 6 — `ExportImport` in SettingsPage |
| SR queue: 1 day / 3 days / 7 days / retire at 3rd correct | SR engine already built in Plan 2; consumed in Task 5 |
| SR review UI (due questions answered one at a time) | Task 5 — `SrReviewRunner` + `SrReviewPage` |
| Export JSON format matches spec (`competency`, `quizHistory`, `scenarioHistory`, `spacedRepetition`, `domainReadiness`) | Task 6 — `FalconLabExport` interface |
| Import fully restores competency levels + SR queue | Task 6 — import handler |

**Gap noted (deferred to Plan 5):** Claude Tutor module, Settings tutor-mode toggle, API key input — these are in scope for Plan 5 per the stub in `TutorPage.tsx` and `SettingsPage.tsx`.

### 2. Placeholder scan

No TBDs, TODOs, or "implement later" strings found. All code blocks are complete and self-contained.

### 3. Type consistency

- `ReadinessBar` props: `score: number, label?: string` — used consistently in Tasks 2 and 4 ✓
- `DomainCard` props: `id, title, emoji, href, score` — defined in Task 2, used in Task 4 with `domain.title` and `domain.emoji` (both from `ContentDomain`) ✓
- `SrReviewRunner` props: `items: SpacedRepetitionItem[], onDone: (reviewed: number, retired: number) => void` — defined in Task 5, used in Task 5 ✓
- `useAllProgress` returns `{ domainScores: Record<string, number>, overallScore: number, loading: boolean }` — defined in Task 1, consumed in Task 4 ✓
- `useDueReviews` returns `{ items: SpacedRepetitionItem[], count: number, loading: boolean }` — defined in Task 1, consumed in Task 4 (DueReviewCard) and Task 5 (SrReviewPage) ✓
- `useLastModule` returns `{ href: string, title: string } | null` — defined in Task 3, consumed in Task 3 (ContinueCard) ✓
- `mod.quiz` is `QuizQuestion[]` (not `mod.quiz.questions`) — verified against `src/content/types.ts` line 99; used correctly in Task 5 ✓
- `ContentDomain.title` (not `.name`) — verified against `src/content/types.ts` line 116 ✓
