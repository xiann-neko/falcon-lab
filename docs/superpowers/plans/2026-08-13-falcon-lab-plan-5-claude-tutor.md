# Falcon Lab Plan 5: Claude Tutor

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the TutorPage stub with a fully functional Claude Tutor — Clipboard Mode (generate a self-contained 3-layer prompt to paste into Claude.ai) and API Key Mode (stream responses directly from the Anthropic API inline) — plus Settings panel additions to configure tutor mode, API key, and model.

**Architecture:** A `useTutorContext` hook reads current module, competency, and quiz history from Dexie to build a `StudentContext` object. A `useTutorSettings` hook reads/writes three `appState` keys (`tutorMode`, `tutorApiKey`, `tutorModel`). A pure `buildPrompt` function assembles the 3-layer prompt string from `StudentContext + question`. `ClipboardMode` renders question input + copy button + prompt preview. `ApiKeyMode` renders a conversational chat panel that streams responses from the Anthropic Messages API via the native `fetch` API. `TutorPage` dispatches to the active mode. `TutorSettings` is a new settings component embedded in `SettingsPage`.

**Tech Stack:** Vite 8 + React 19 + TypeScript + Dexie 4 + Tailwind CSS v3 + Vitest + fake-indexeddb + @testing-library/react + native `fetch` (no new npm dependencies)

## Global Constraints

- Dark mode only — brand Tailwind classes: `bg-brand-bg` (#0F1923), `bg-brand-surface` (#162230), `bg-brand-accent` (#E01B2D), `text-brand-text` (#FFFFFF), `text-brand-muted` (#8899AA), `border-brand-border` (#243446); no inline `style=` anywhere
- No new npm dependencies — streaming uses the native `fetch` + `ReadableStream` API
- All DB reads use `useState` + `useEffect` + cancellation flag pattern — no dexie-react-hooks, no liveQuery
- `CompetencyLevel` consumed only via `src/engine` barrel (NOT from `src/db/schema` directly)
- Vitest globals: `describe`, `it`, `expect`, `beforeEach`, `afterEach` available without import; `vi` must be imported: `import { vi } from 'vitest'`
- `render`, `screen`, `fireEvent`, `waitFor`, `renderHook`, `act` imported from `@testing-library/react`
- `fake-indexeddb/auto` MUST be the FIRST import (line 1) in every DB-touching test file
- `ContentModule.quiz` is `QuizQuestion[]` (a plain array, NOT `{ questions: QuizQuestion[] }`)
- `getModule`, `getTrack`, `getAllModules`, `getDomainModules`, `DOMAINS` imported from `../../content` (or `../content` depending on file depth)
- `moduleReadinessScore`, `domainReadinessScore`, `overallSmeReadiness` imported from `../../engine`
- appState keys: `'currentModuleId'`, `'tutorMode'` (`'clipboard' | 'apikey'`), `'tutorApiKey'` (string), `'tutorModel'` (string)
- Default tutor mode: `'clipboard'`; default model: `'claude-sonnet-5'`
- Anthropic API endpoint: `https://api.anthropic.com/v1/messages`
- Required Anthropic API headers: `x-api-key`, `anthropic-version: '2023-06-01'`, `anthropic-dangerous-direct-browser-access: 'true'`, `content-type: 'application/json'`
- Test counts are advisory ± 2; what matters is all meaningful behaviours are covered

---

## File Map

| Status | File | Role |
|---|---|---|
| **Create** | `src/hooks/useTutorContext.ts` | Reads DB, assembles `StudentContext` |
| **Create** | `src/hooks/useTutorContext.test.tsx` | Tests for useTutorContext |
| **Create** | `src/hooks/useTutorSettings.ts` | Reads/writes tutor settings from appState |
| **Create** | `src/hooks/useTutorSettings.test.tsx` | Tests for useTutorSettings |
| **Create** | `src/features/tutor/buildPrompt.ts` | Pure function: StudentContext + question → 3-layer prompt string |
| **Create** | `src/features/tutor/buildPrompt.test.ts` | Tests for buildPrompt |
| **Create** | `src/features/tutor/ClipboardMode.tsx` | Question textarea + "Copy prompt for Claude.ai" button + preview |
| **Create** | `src/features/tutor/ClipboardMode.test.tsx` | Tests for ClipboardMode |
| **Create** | `src/features/tutor/ApiKeyMode.tsx` | Streaming chat via fetch API |
| **Create** | `src/features/tutor/ApiKeyMode.test.tsx` | Tests for ApiKeyMode |
| **Modify** | `src/pages/TutorPage.tsx` | Replace 7-line stub with full Tutor page |
| **Create** | `src/features/settings/TutorSettings.tsx` | Mode toggle + API key input + model selector |
| **Create** | `src/features/settings/TutorSettings.test.tsx` | Tests for TutorSettings |
| **Modify** | `src/pages/SettingsPage.tsx` | Add "Claude Tutor" section above "Progress Data" |

---

### Task 1: `useTutorContext` hook

Reads current module + competency + quiz history from Dexie and assembles a `StudentContext` object. This is the data foundation that both `ClipboardMode` and `ApiKeyMode` consume.

**Files:**
- Create: `src/hooks/useTutorContext.ts`
- Create: `src/hooks/useTutorContext.test.tsx`

**Interfaces (defined in `useTutorContext.ts`, exported for consumers):**

```typescript
export interface WrongAnswer {
  questionText: string
  studentAnswer: string    // text of the wrong option selected
  correctAnswer: string    // text of the correct option
  docUrl: string
}

export interface StudentContext {
  moduleName: string
  trackTitle: string
  domainId: string
  competencyLevel: string        // CompetencyLevel value or 'No data'
  quizScore: number | null       // 0-100 or null
  quizCorrect: number            // count from most recent attempt
  quizTotal: number              // total questions in the module quiz
  recentWrongAnswers: WrongAnswer[]
  overallSmeReadiness: number    // 0-100, integer
  completedModuleTitles: string[]
}

export interface TutorContextState {
  context: StudentContext | null  // null = no currentModuleId set yet
  loading: boolean
}
```

**Produces:** `useTutorContext(): TutorContextState`

- [ ] **Step 1: Write the failing test**

Create `src/hooks/useTutorContext.test.tsx`:

```typescript
import 'fake-indexeddb/auto'
import { renderHook, waitFor } from '@testing-library/react'
import { db } from '../db'
import { getAllModules } from '../content'
import { useTutorContext } from './useTutorContext'

const MOD = getAllModules()[0]

beforeEach(async () => {
  await db.competency.clear()
  await db.quizHistory.clear()
  await db.appState.clear()
})

describe('useTutorContext', () => {
  it('returns null context when no currentModuleId is set', async () => {
    const { result } = renderHook(() => useTutorContext())
    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.context).toBeNull()
  })

  it('returns null context for an unknown moduleId', async () => {
    await db.appState.put({ key: 'currentModuleId', value: 'nonexistent-module' })
    const { result } = renderHook(() => useTutorContext())
    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.context).toBeNull()
  })

  it('returns context with module name and no quiz history', async () => {
    await db.appState.put({ key: 'currentModuleId', value: MOD.id })
    const { result } = renderHook(() => useTutorContext())
    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.context).not.toBeNull()
    expect(result.current.context!.moduleName).toBe(MOD.title)
  })

  it('returns competency level from DB record', async () => {
    await db.appState.put({ key: 'currentModuleId', value: MOD.id })
    await db.competency.put({
      moduleId: MOD.id,
      level: 'aware' as any,
      quizScore: 70,
      challengeScore: null,
      scenarioScore: null,
      updatedAt: '2026-08-13',
    })
    const { result } = renderHook(() => useTutorContext())
    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.context!.competencyLevel).toBe('aware')
    expect(result.current.context!.quizScore).toBe(70)
  })

  it('identifies wrong answers from most recent quiz attempt', async () => {
    await db.appState.put({ key: 'currentModuleId', value: MOD.id })
    const q = MOD.quiz[0]
    // Wrong answer — older attempt
    await db.quizHistory.add({
      moduleId: MOD.id,
      questionId: q.id,
      selectedAnswer: (q.correctIndex + 1) % 4,
      isCorrect: false,
      answeredAt: '2026-08-12T10:00:00.000Z',
    })
    // Correct answer — newer attempt
    await db.quizHistory.add({
      moduleId: MOD.id,
      questionId: q.id,
      selectedAnswer: q.correctIndex,
      isCorrect: true,
      answeredAt: '2026-08-13T10:00:00.000Z',
    })
    const { result } = renderHook(() => useTutorContext())
    await waitFor(() => expect(result.current.loading).toBe(false))
    // Most recent attempt was correct, so no wrong answers
    expect(result.current.context!.recentWrongAnswers).toHaveLength(0)
  })

  it('includes completed module titles from competency table', async () => {
    await db.appState.put({ key: 'currentModuleId', value: MOD.id })
    await db.competency.put({
      moduleId: MOD.id,
      level: 'novice' as any,
      quizScore: 50,
      challengeScore: null,
      scenarioScore: null,
      updatedAt: '2026-08-13',
    })
    const { result } = renderHook(() => useTutorContext())
    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.context!.completedModuleTitles).toContain(MOD.title)
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

```
npm test -- src/hooks/useTutorContext.test.tsx
```

Expected: FAIL — module not found.

- [ ] **Step 3: Implement `useTutorContext.ts`**

```typescript
import { useState, useEffect } from 'react'
import { db } from '../db'
import type { CompetencyRecord, QuizHistoryEntry } from '../db/schema'
import { getModule, getTrack, getModule as lookupModule, getDomainModules, DOMAINS } from '../content'
import { moduleReadinessScore, domainReadinessScore, overallSmeReadiness } from '../engine'

export interface WrongAnswer {
  questionText: string
  studentAnswer: string
  correctAnswer: string
  docUrl: string
}

export interface StudentContext {
  moduleName: string
  trackTitle: string
  domainId: string
  competencyLevel: string
  quizScore: number | null
  quizCorrect: number
  quizTotal: number
  recentWrongAnswers: WrongAnswer[]
  overallSmeReadiness: number
  completedModuleTitles: string[]
}

export interface TutorContextState {
  context: StudentContext | null
  loading: boolean
}

export function useTutorContext(): TutorContextState {
  const [state, setState] = useState<TutorContextState>({ context: null, loading: true })

  useEffect(() => {
    let cancelled = false

    async function load() {
      const appEntry = await db.appState.get('currentModuleId')
      if (!appEntry) {
        if (!cancelled) setState({ context: null, loading: false })
        return
      }

      const moduleId = appEntry.value
      const mod = getModule(moduleId)
      if (!mod) {
        if (!cancelled) setState({ context: null, loading: false })
        return
      }

      const track = getTrack(mod.trackId)

      const [competencyRec, quizHistoryEntries, allCompetency] = await Promise.all([
        db.competency.get(moduleId),
        db.quizHistory.where('moduleId').equals(moduleId).toArray(),
        db.competency.toArray(),
      ])

      if (cancelled) return

      // Group quiz history by questionId, take most recent entry per question
      const latestByQuestion = new Map<string, QuizHistoryEntry>()
      const sorted = [...quizHistoryEntries].sort((a, b) => b.answeredAt.localeCompare(a.answeredAt))
      for (const entry of sorted) {
        if (!latestByQuestion.has(entry.questionId)) {
          latestByQuestion.set(entry.questionId, entry)
        }
      }

      const recentEntries = Array.from(latestByQuestion.values())
      const quizCorrect = recentEntries.filter(e => e.isCorrect).length
      const quizTotal = recentEntries.length > 0 ? recentEntries.length : mod.quiz.length

      const wrongEntries = recentEntries.filter(e => !e.isCorrect)
      const recentWrongAnswers: WrongAnswer[] = wrongEntries.flatMap(entry => {
        const q = mod.quiz.find(q => q.id === entry.questionId)
        if (!q) return []
        return [{
          questionText: q.text,
          studentAnswer: q.options[entry.selectedAnswer] ?? 'Unknown',
          correctAnswer: q.options[q.correctIndex],
          docUrl: q.docUrl,
        }]
      })

      // Compute overall SME readiness from all competency records
      const byModule = new Map<string, CompetencyRecord>()
      for (const r of allCompetency) byModule.set(r.moduleId, r)

      const domainScores = DOMAINS.map(domain => {
        const modules = getDomainModules(domain.id)
        const moduleScores = modules.map(m => {
          const rec = byModule.get(m.id)
          return moduleReadinessScore(rec?.quizScore ?? null, rec?.challengeScore ?? null, rec?.scenarioScore ?? null)
        })
        return domainReadinessScore(moduleScores)
      })

      const smeReadiness = Math.round(overallSmeReadiness(domainScores))

      // Resolve completed module titles
      const completedModuleTitles = allCompetency.flatMap(r => {
        const m = lookupModule(r.moduleId)
        return m ? [m.title] : []
      })

      setState({
        context: {
          moduleName: mod.title,
          trackTitle: track?.title ?? mod.trackId,
          domainId: mod.domainId,
          competencyLevel: competencyRec?.level ?? 'No data',
          quizScore: competencyRec?.quizScore ?? null,
          quizCorrect,
          quizTotal,
          recentWrongAnswers,
          overallSmeReadiness: smeReadiness,
          completedModuleTitles,
        },
        loading: false,
      })
    }

    load()
    return () => { cancelled = true }
  }, [])

  return state
}
```

- [ ] **Step 4: Run tests to verify they pass**

```
npm test -- src/hooks/useTutorContext.test.tsx
```

Expected: 5 tests passing.

- [ ] **Step 5: Commit**

```
git add src/hooks/useTutorContext.ts src/hooks/useTutorContext.test.tsx
git commit -m "feat: add useTutorContext hook"
```

---

### Task 2: `useTutorSettings` hook + `TutorSettings` component + Settings page

Reads and writes three `appState` keys (`tutorMode`, `tutorApiKey`, `tutorModel`). Adds a "Claude Tutor" settings section to `SettingsPage`.

**Files:**
- Create: `src/hooks/useTutorSettings.ts`
- Create: `src/hooks/useTutorSettings.test.tsx`
- Create: `src/features/settings/TutorSettings.tsx`
- Create: `src/features/settings/TutorSettings.test.tsx`
- Modify: `src/pages/SettingsPage.tsx`

**Interfaces (in `useTutorSettings.ts`):**

```typescript
export interface TutorSettingsData {
  mode: 'clipboard' | 'apikey'
  apiKey: string
  model: string
}

export interface UseTutorSettingsReturn {
  settings: TutorSettingsData
  loading: boolean
  setMode: (mode: 'clipboard' | 'apikey') => Promise<void>
  setApiKey: (key: string) => Promise<void>
  setModel: (model: string) => Promise<void>
}
```

**Produces:** `useTutorSettings(): UseTutorSettingsReturn`

Each setter writes to `db.appState` immediately (no save button) and also updates local state.

- [ ] **Step 1: Write the failing tests**

Create `src/hooks/useTutorSettings.test.tsx`:

```typescript
import 'fake-indexeddb/auto'
import { renderHook, waitFor, act } from '@testing-library/react'
import { db } from '../db'
import { useTutorSettings } from './useTutorSettings'

beforeEach(async () => {
  await db.appState.clear()
})

describe('useTutorSettings', () => {
  it('returns defaults when no appState keys exist', async () => {
    const { result } = renderHook(() => useTutorSettings())
    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.settings.mode).toBe('clipboard')
    expect(result.current.settings.apiKey).toBe('')
    expect(result.current.settings.model).toBe('claude-sonnet-5')
  })

  it('reads persisted mode from appState', async () => {
    await db.appState.put({ key: 'tutorMode', value: 'apikey' })
    const { result } = renderHook(() => useTutorSettings())
    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.settings.mode).toBe('apikey')
  })

  it('setMode persists to DB and updates state', async () => {
    const { result } = renderHook(() => useTutorSettings())
    await waitFor(() => expect(result.current.loading).toBe(false))
    await act(async () => { await result.current.setMode('apikey') })
    expect(result.current.settings.mode).toBe('apikey')
    const stored = await db.appState.get('tutorMode')
    expect(stored?.value).toBe('apikey')
  })

  it('setApiKey persists to DB and updates state', async () => {
    const { result } = renderHook(() => useTutorSettings())
    await waitFor(() => expect(result.current.loading).toBe(false))
    await act(async () => { await result.current.setApiKey('sk-ant-test-key') })
    expect(result.current.settings.apiKey).toBe('sk-ant-test-key')
    const stored = await db.appState.get('tutorApiKey')
    expect(stored?.value).toBe('sk-ant-test-key')
  })

  it('setModel persists to DB and updates state', async () => {
    const { result } = renderHook(() => useTutorSettings())
    await waitFor(() => expect(result.current.loading).toBe(false))
    await act(async () => { await result.current.setModel('claude-haiku-4-5-20251001') })
    expect(result.current.settings.model).toBe('claude-haiku-4-5-20251001')
    const stored = await db.appState.get('tutorModel')
    expect(stored?.value).toBe('claude-haiku-4-5-20251001')
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

```
npm test -- src/hooks/useTutorSettings.test.tsx
```

Expected: FAIL — module not found.

- [ ] **Step 3: Implement `useTutorSettings.ts`**

```typescript
import { useState, useEffect } from 'react'
import { db } from '../db'

export interface TutorSettingsData {
  mode: 'clipboard' | 'apikey'
  apiKey: string
  model: string
}

export interface UseTutorSettingsReturn {
  settings: TutorSettingsData
  loading: boolean
  setMode: (mode: 'clipboard' | 'apikey') => Promise<void>
  setApiKey: (key: string) => Promise<void>
  setModel: (model: string) => Promise<void>
}

const DEFAULTS: TutorSettingsData = {
  mode: 'clipboard',
  apiKey: '',
  model: 'claude-sonnet-5',
}

export function useTutorSettings(): UseTutorSettingsReturn {
  const [settings, setSettings] = useState<TutorSettingsData>(DEFAULTS)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    async function load() {
      const [modeEntry, keyEntry, modelEntry] = await Promise.all([
        db.appState.get('tutorMode'),
        db.appState.get('tutorApiKey'),
        db.appState.get('tutorModel'),
      ])
      if (cancelled) return
      setSettings({
        mode: (modeEntry?.value as 'clipboard' | 'apikey') ?? DEFAULTS.mode,
        apiKey: keyEntry?.value ?? DEFAULTS.apiKey,
        model: modelEntry?.value ?? DEFAULTS.model,
      })
      setLoading(false)
    }
    load()
    return () => { cancelled = true }
  }, [])

  async function setMode(mode: 'clipboard' | 'apikey') {
    await db.appState.put({ key: 'tutorMode', value: mode })
    setSettings(prev => ({ ...prev, mode }))
  }

  async function setApiKey(apiKey: string) {
    await db.appState.put({ key: 'tutorApiKey', value: apiKey })
    setSettings(prev => ({ ...prev, apiKey }))
  }

  async function setModel(model: string) {
    await db.appState.put({ key: 'tutorModel', value: model })
    setSettings(prev => ({ ...prev, model }))
  }

  return { settings, loading, setMode, setApiKey, setModel }
}
```

- [ ] **Step 4: Run hook tests to verify they pass**

```
npm test -- src/hooks/useTutorSettings.test.tsx
```

Expected: 5 tests passing.

- [ ] **Step 5: Write failing component tests**

Create `src/features/settings/TutorSettings.test.tsx`:

```typescript
import 'fake-indexeddb/auto'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { db } from '../../db'
import { TutorSettings } from './TutorSettings'

beforeEach(async () => {
  await db.appState.clear()
})

describe('TutorSettings', () => {
  it('renders Clipboard Mode as selected by default', async () => {
    render(<TutorSettings />)
    await waitFor(() => {
      expect(screen.getByRole('radio', { name: /clipboard mode/i })).toBeChecked()
    })
  })

  it('does not show API key input in clipboard mode', async () => {
    render(<TutorSettings />)
    await waitFor(() => {
      expect(screen.queryByLabelText(/api key/i)).not.toBeInTheDocument()
    })
  })

  it('shows API key input and model selector when API Key mode is selected', async () => {
    render(<TutorSettings />)
    await waitFor(() => screen.getByRole('radio', { name: /api key mode/i }))
    fireEvent.click(screen.getByRole('radio', { name: /api key mode/i }))
    await waitFor(() => {
      expect(screen.getByLabelText(/api key/i)).toBeInTheDocument()
      expect(screen.getByRole('combobox', { name: /model/i })).toBeInTheDocument()
    })
  })

  it('persists mode change to DB', async () => {
    render(<TutorSettings />)
    await waitFor(() => screen.getByRole('radio', { name: /api key mode/i }))
    fireEvent.click(screen.getByRole('radio', { name: /api key mode/i }))
    await waitFor(async () => {
      const entry = await db.appState.get('tutorMode')
      expect(entry?.value).toBe('apikey')
    })
  })

  it('persists API key when typed', async () => {
    await db.appState.put({ key: 'tutorMode', value: 'apikey' })
    render(<TutorSettings />)
    await waitFor(() => screen.getByLabelText(/api key/i))
    fireEvent.change(screen.getByLabelText(/api key/i), { target: { value: 'sk-ant-test' } })
    await waitFor(async () => {
      const entry = await db.appState.get('tutorApiKey')
      expect(entry?.value).toBe('sk-ant-test')
    })
  })
})
```

- [ ] **Step 6: Run component tests to verify they fail**

```
npm test -- src/features/settings/TutorSettings.test.tsx
```

Expected: FAIL — module not found.

- [ ] **Step 7: Implement `TutorSettings.tsx`**

```tsx
import { useTutorSettings } from '../../hooks/useTutorSettings'

const MODEL_OPTIONS = [
  { value: 'claude-sonnet-5',          label: 'Claude Sonnet 5 (Recommended)' },
  { value: 'claude-haiku-4-5-20251001', label: 'Claude Haiku 4.5 (Fastest)' },
  { value: 'claude-opus-5',             label: 'Claude Opus 5 (Most Capable)' },
]

export function TutorSettings() {
  const { settings, loading, setMode, setApiKey, setModel } = useTutorSettings()

  if (loading) return <div className="text-brand-muted text-sm">Loading…</div>

  return (
    <div className="space-y-4">
      {/* Mode radio group */}
      <fieldset className="space-y-2">
        <legend className="text-sm font-medium text-brand-text">Tutor Mode</legend>
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="radio"
            name="tutorMode"
            value="clipboard"
            checked={settings.mode === 'clipboard'}
            onChange={() => setMode('clipboard')}
            className="accent-brand-accent"
            aria-label="Clipboard Mode"
          />
          <span className="text-brand-text text-sm">Clipboard Mode</span>
          <span className="text-brand-muted text-xs">— copies prompt for Claude.ai (no API key needed)</span>
        </label>
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="radio"
            name="tutorMode"
            value="apikey"
            checked={settings.mode === 'apikey'}
            onChange={() => setMode('apikey')}
            className="accent-brand-accent"
            aria-label="API Key Mode"
          />
          <span className="text-brand-text text-sm">API Key Mode</span>
          <span className="text-brand-muted text-xs">— streams responses inline from your Anthropic account</span>
        </label>
      </fieldset>

      {/* API key + model selector — shown only in apikey mode */}
      {settings.mode === 'apikey' && (
        <div className="space-y-3 pl-4 border-l border-brand-border">
          <div className="space-y-1">
            <label htmlFor="tutor-api-key" className="block text-sm text-brand-text">
              API Key
            </label>
            <input
              id="tutor-api-key"
              type="password"
              aria-label="API Key"
              value={settings.apiKey}
              onChange={e => setApiKey(e.target.value)}
              placeholder="sk-ant-api…"
              className="w-full px-3 py-2 bg-brand-bg border border-brand-border rounded text-brand-text text-sm placeholder:text-brand-muted focus:outline-none focus:border-brand-accent"
            />
            <p className="text-brand-muted text-xs">
              Your key is stored locally in IndexedDB and never sent anywhere except directly to api.anthropic.com.
            </p>
          </div>
          <div className="space-y-1">
            <label htmlFor="tutor-model" className="block text-sm text-brand-text">
              Model
            </label>
            <select
              id="tutor-model"
              aria-label="Model"
              value={settings.model}
              onChange={e => setModel(e.target.value)}
              className="w-full px-3 py-2 bg-brand-bg border border-brand-border rounded text-brand-text text-sm focus:outline-none focus:border-brand-accent"
            >
              {MODEL_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 8: Run component tests to verify they pass**

```
npm test -- src/features/settings/TutorSettings.test.tsx
```

Expected: 5 tests passing.

- [ ] **Step 9: Modify `SettingsPage.tsx` to add the Claude Tutor section**

Current file (`src/pages/SettingsPage.tsx`) renders only the "Progress Data" section. Add the "Claude Tutor" section above it. The final file:

```tsx
import { ExportImport } from '../features/settings/ExportImport'
import { TutorSettings } from '../features/settings/TutorSettings'

export default function SettingsPage() {
  return (
    <div className="p-6 space-y-8 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-brand-text">Settings</h1>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-brand-text">Claude Tutor</h2>
        <p className="text-brand-muted text-sm">
          Configure how the tutor generates responses to your questions.
          Clipboard Mode is the default and requires no API key — it builds a
          self-contained prompt you paste into Claude.ai.
        </p>
        <TutorSettings />
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-brand-text">Progress Data</h2>
        <p className="text-brand-muted text-sm">
          Export your progress to a JSON file and import it on another device …
        </p>
        <ExportImport />
      </section>
    </div>
  )
}
```

- [ ] **Step 10: Run full test suite to confirm no regressions**

```
npm test
```

Expected: all previously passing tests plus the 10 new tests still pass.

- [ ] **Step 11: Commit**

```
git add src/hooks/useTutorSettings.ts src/hooks/useTutorSettings.test.tsx \
        src/features/settings/TutorSettings.tsx src/features/settings/TutorSettings.test.tsx \
        src/pages/SettingsPage.tsx
git commit -m "feat: add useTutorSettings hook, TutorSettings component, and Settings page section"
```

---

### Task 3: `buildPrompt` + `ClipboardMode`

A pure function that produces the 3-layer prompt string verbatim from the spec, plus the Clipboard Mode UI component.

**Files:**
- Create: `src/features/tutor/buildPrompt.ts`
- Create: `src/features/tutor/buildPrompt.test.ts`
- Create: `src/features/tutor/ClipboardMode.tsx`
- Create: `src/features/tutor/ClipboardMode.test.tsx`

**Consumes (from Task 1):** `StudentContext`, `WrongAnswer` types imported from `../../hooks/useTutorContext`

**Produces:** `buildPrompt(context: StudentContext | null, question: string): string`

The 3-layer prompt format (use this verbatim — do not paraphrase):

```
Layer 1 — System instruction (always identical):
---
You are an expert CrowdStrike SIEM and SOAR tutor. The student
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
point to the docs.

Layer 2 — Student context (populated from StudentContext):
---
STUDENT CONTEXT:
- Currently studying: {moduleName} ({trackTitle}, Domain: {domainId})
- Competency level on this topic: {competencyLevel}{quizScoreStr}
- Recent quiz performance: {quizCorrect}/{quizTotal} correct
- Questions answered incorrectly:
    {wrongAnswersBlock}
- Overall SME readiness: {overallSmeReadiness}%
- Completed modules: {completedModuleTitles.join(', ') || 'None'}

Layer 3 — Student question:
---
STUDENT QUESTION:
"{question}"
```

When `context` is null:
```
STUDENT CONTEXT:
- No module selected yet. Student has not started a module.
```

For `quizScoreStr`: if `quizScore` is not null, append ` (${quizScore}%)`, else empty string.

For `wrongAnswersBlock`: each wrong answer on its own line group:
```
    Q: {questionText}
    Student answered: {studentAnswer}
    Correct answer: {correctAnswer}
    Doc reference: {docUrl}
```
If there are no wrong answers: `None`

- [ ] **Step 1: Write the failing tests**

Create `src/features/tutor/buildPrompt.test.ts`:

```typescript
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
```

- [ ] **Step 2: Run tests to verify they fail**

```
npm test -- src/features/tutor/buildPrompt.test.ts
```

Expected: FAIL — module not found.

- [ ] **Step 3: Implement `buildPrompt.ts`**

```typescript
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
```

- [ ] **Step 4: Run buildPrompt tests to verify they pass**

```
npm test -- src/features/tutor/buildPrompt.test.ts
```

Expected: 9 tests passing.

- [ ] **Step 5: Write the failing ClipboardMode tests**

Create `src/features/tutor/ClipboardMode.test.tsx`:

```typescript
import { vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { ClipboardMode } from './ClipboardMode'
import type { StudentContext } from '../../hooks/useTutorContext'

const CONTEXT: StudentContext = {
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

beforeEach(() => {
  Object.assign(navigator, {
    clipboard: { writeText: vi.fn().mockResolvedValue(undefined) },
  })
})

describe('ClipboardMode', () => {
  it('renders the question textarea', () => {
    render(<ClipboardMode context={CONTEXT} />)
    expect(screen.getByPlaceholderText(/type your question/i)).toBeInTheDocument()
  })

  it('renders the copy button', () => {
    render(<ClipboardMode context={CONTEXT} />)
    expect(screen.getByRole('button', { name: /copy prompt/i })).toBeInTheDocument()
  })

  it('copy button is disabled when question is empty', () => {
    render(<ClipboardMode context={CONTEXT} />)
    expect(screen.getByRole('button', { name: /copy prompt/i })).toBeDisabled()
  })

  it('copy button is enabled when question is not empty', async () => {
    render(<ClipboardMode context={CONTEXT} />)
    fireEvent.change(screen.getByPlaceholderText(/type your question/i), {
      target: { value: 'What is CQL?' },
    })
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /copy prompt/i })).not.toBeDisabled()
    })
  })

  it('copies generated prompt to clipboard on button click', async () => {
    render(<ClipboardMode context={CONTEXT} />)
    fireEvent.change(screen.getByPlaceholderText(/type your question/i), {
      target: { value: 'What is CQL?' },
    })
    fireEvent.click(screen.getByRole('button', { name: /copy prompt/i }))
    await waitFor(() => {
      expect(navigator.clipboard.writeText).toHaveBeenCalledOnce()
      const [calledWith] = (navigator.clipboard.writeText as ReturnType<typeof vi.fn>).mock.calls[0]
      expect(calledWith).toContain('What is CQL?')
      expect(calledWith).toContain('CrowdStrike SIEM and SOAR tutor')
    })
  })

  it('shows prompt preview after copying', async () => {
    render(<ClipboardMode context={CONTEXT} />)
    fireEvent.change(screen.getByPlaceholderText(/type your question/i), {
      target: { value: 'What is CQL?' },
    })
    fireEvent.click(screen.getByRole('button', { name: /copy prompt/i }))
    await waitFor(() => {
      expect(screen.getByRole('region', { name: /prompt preview/i })).toBeInTheDocument()
    })
  })

  it('works with null context', () => {
    render(<ClipboardMode context={null} />)
    expect(screen.getByPlaceholderText(/type your question/i)).toBeInTheDocument()
  })
})
```

- [ ] **Step 6: Run ClipboardMode tests to verify they fail**

```
npm test -- src/features/tutor/ClipboardMode.test.tsx
```

Expected: FAIL — module not found.

- [ ] **Step 7: Implement `ClipboardMode.tsx`**

```tsx
import { useState } from 'react'
import { buildPrompt } from './buildPrompt'
import type { StudentContext } from '../../hooks/useTutorContext'

interface ClipboardModeProps {
  context: StudentContext | null
}

export function ClipboardMode({ context }: ClipboardModeProps) {
  const [question, setQuestion] = useState('')
  const [preview, setPreview] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  async function handleCopy() {
    const prompt = buildPrompt(context, question)
    await navigator.clipboard.writeText(prompt)
    setPreview(prompt)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <label htmlFor="tutor-question" className="block text-sm font-medium text-brand-text">
          Your Question
        </label>
        <textarea
          id="tutor-question"
          value={question}
          onChange={e => setQuestion(e.target.value)}
          placeholder="Type your question about CrowdStrike SIEM, SOAR, or related topics…"
          rows={4}
          className="w-full px-3 py-2 bg-brand-bg border border-brand-border rounded text-brand-text text-sm placeholder:text-brand-muted focus:outline-none focus:border-brand-accent resize-none"
        />
      </div>

      <button
        onClick={handleCopy}
        disabled={!question.trim()}
        className="px-5 py-2 bg-brand-accent text-white rounded font-medium text-sm hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition-opacity"
      >
        {copied ? '✓ Copied!' : 'Copy prompt for Claude.ai'}
      </button>

      {preview && (
        <section aria-label="Prompt Preview" className="space-y-2">
          <p className="text-brand-muted text-xs">Prompt preview — paste this into Claude.ai:</p>
          <textarea
            readOnly
            value={preview}
            rows={12}
            className="w-full px-3 py-2 bg-brand-bg border border-brand-border rounded text-brand-muted text-xs font-mono resize-none focus:outline-none"
            aria-label="Generated prompt"
          />
        </section>
      )}
    </div>
  )
}
```

- [ ] **Step 8: Run all new tests to verify they pass**

```
npm test -- src/features/tutor/buildPrompt.test.ts src/features/tutor/ClipboardMode.test.tsx
```

Expected: all passing.

- [ ] **Step 9: Commit**

```
git add src/features/tutor/buildPrompt.ts src/features/tutor/buildPrompt.test.ts \
        src/features/tutor/ClipboardMode.tsx src/features/tutor/ClipboardMode.test.tsx
git commit -m "feat: add buildPrompt and ClipboardMode"
```

---

### Task 4: `ApiKeyMode`

A conversational chat panel that sends the 3-layer prompt to the Anthropic Messages API and streams the response inline using the native `fetch` + `ReadableStream` API.

**Files:**
- Create: `src/features/tutor/ApiKeyMode.tsx`
- Create: `src/features/tutor/ApiKeyMode.test.tsx`

**Consumes:**
- `buildPrompt` from `./buildPrompt`
- `StudentContext` from `../../hooks/useTutorContext`

**Component signature:**
```typescript
interface ApiKeyModeProps {
  context: StudentContext | null
  apiKey: string
  model: string
}
export function ApiKeyMode({ context, apiKey, model }: ApiKeyModeProps): JSX.Element
```

**Message type (local to the file):**
```typescript
interface Message {
  role: 'user' | 'assistant'
  content: string
}
```

**Implementation notes:**
- Hold `messages: Message[]` in state — the conversation history (not including the system prompt, which is re-extracted from `buildPrompt`)
- The first user message is the full 3-layer prompt; follow-up messages are the plain question text only (system prompt + student context are sent via the `system` field in the API request)
- On first send: extract the system instruction from the prompt as the `system` field and add the student context + question as the first user message body. For follow-ups: only the new question as user message. 
  - **Simplification:** always re-send the full 3-layer prompt as a new user message each time (session follow-ups retain context via the `messages` array). This avoids splitting the prompt — send the full `buildPrompt` output as the first message, then subsequent user messages as plain text.
- SSE stream parsing: read `response.body.getReader()`, decode with `TextDecoder`, split on `\n\n`, parse each `data: {...}` line, extract `delta.text` from `content_block_delta` events, accumulate in `streamedContent` state. On `message_stop`, finalise and append to `messages`.
- Required headers: `x-api-key`, `anthropic-version: '2023-06-01'`, `anthropic-dangerous-direct-browser-access: 'true'`, `content-type: 'application/json'`
- API request body shape:
  ```json
  {
    "model": "<model>",
    "max_tokens": 2048,
    "stream": true,
    "messages": [{ "role": "user", "content": "<prompt>" }, ...prior messages...]
  }
  ```
- Show error message if `response.ok` is false: `"API error: ${response.status} — check your API key in Settings."`
- Show "Thinking…" indicator while streaming
- Follow-up question input appears after the first response has been received; the first question field is replaced by the follow-up field (or you can use one persistent input that clears after send — your choice)
- "Clear conversation" button resets `messages` to `[]`

- [ ] **Step 1: Write the failing tests**

Create `src/features/tutor/ApiKeyMode.test.tsx`:

```typescript
import { vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { ApiKeyMode } from './ApiKeyMode'
import type { StudentContext } from '../../hooks/useTutorContext'

const CONTEXT: StudentContext = {
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

function makeStreamMock(text: string) {
  const encoder = new TextEncoder()
  const chunks = [
    encoder.encode(`data: {"type":"content_block_delta","delta":{"type":"text_delta","text":"${text}"}}\n\n`),
    encoder.encode('data: {"type":"message_stop"}\n\n'),
  ]
  let idx = 0
  const reader = {
    read: vi.fn(() => {
      if (idx < chunks.length) return Promise.resolve({ done: false, value: chunks[idx++] })
      return Promise.resolve({ done: true, value: undefined })
    }),
    cancel: vi.fn(),
    releaseLock: vi.fn(),
  }
  return {
    ok: true,
    body: { getReader: () => reader },
  }
}

beforeEach(() => {
  vi.restoreAllMocks()
})

describe('ApiKeyMode', () => {
  it('renders the question textarea and send button', () => {
    render(<ApiKeyMode context={CONTEXT} apiKey="sk-ant-test" model="claude-sonnet-5" />)
    expect(screen.getByPlaceholderText(/type your question/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /send/i })).toBeInTheDocument()
  })

  it('send button is disabled when question is empty', () => {
    render(<ApiKeyMode context={CONTEXT} apiKey="sk-ant-test" model="claude-sonnet-5" />)
    expect(screen.getByRole('button', { name: /send/i })).toBeDisabled()
  })

  it('shows user message in conversation after send', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(makeStreamMock('Hello from Claude!')))
    render(<ApiKeyMode context={CONTEXT} apiKey="sk-ant-test" model="claude-sonnet-5" />)
    fireEvent.change(screen.getByPlaceholderText(/type your question/i), {
      target: { value: 'What is CQL?' },
    })
    fireEvent.click(screen.getByRole('button', { name: /send/i }))
    await waitFor(() => {
      expect(screen.getByText('What is CQL?')).toBeInTheDocument()
    })
  })

  it('shows streamed assistant response', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(makeStreamMock('CQL is great!')))
    render(<ApiKeyMode context={CONTEXT} apiKey="sk-ant-test" model="claude-sonnet-5" />)
    fireEvent.change(screen.getByPlaceholderText(/type your question/i), {
      target: { value: 'What is CQL?' },
    })
    fireEvent.click(screen.getByRole('button', { name: /send/i }))
    await waitFor(() => {
      expect(screen.getByText(/CQL is great!/)).toBeInTheDocument()
    })
  })

  it('sends correct headers to Anthropic API', async () => {
    const mockFetch = vi.fn().mockResolvedValue(makeStreamMock('OK'))
    vi.stubGlobal('fetch', mockFetch)
    render(<ApiKeyMode context={CONTEXT} apiKey="sk-ant-mykey" model="claude-sonnet-5" />)
    fireEvent.change(screen.getByPlaceholderText(/type your question/i), {
      target: { value: 'Hello?' },
    })
    fireEvent.click(screen.getByRole('button', { name: /send/i }))
    await waitFor(() => expect(mockFetch).toHaveBeenCalled())
    const [url, options] = mockFetch.mock.calls[0]
    expect(url).toBe('https://api.anthropic.com/v1/messages')
    expect(options.headers['x-api-key']).toBe('sk-ant-mykey')
    expect(options.headers['anthropic-version']).toBe('2023-06-01')
    expect(options.headers['anthropic-dangerous-direct-browser-access']).toBe('true')
  })

  it('shows error message when API responds with non-ok status', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, status: 401, body: null }))
    render(<ApiKeyMode context={CONTEXT} apiKey="sk-ant-bad" model="claude-sonnet-5" />)
    fireEvent.change(screen.getByPlaceholderText(/type your question/i), {
      target: { value: 'Hello?' },
    })
    fireEvent.click(screen.getByRole('button', { name: /send/i }))
    await waitFor(() => {
      expect(screen.getByText(/API error: 401/i)).toBeInTheDocument()
    })
  })

  it('shows clear conversation button after first exchange', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(makeStreamMock('Done!')))
    render(<ApiKeyMode context={CONTEXT} apiKey="sk-ant-test" model="claude-sonnet-5" />)
    fireEvent.change(screen.getByPlaceholderText(/type your question/i), {
      target: { value: 'Hello?' },
    })
    fireEvent.click(screen.getByRole('button', { name: /send/i }))
    await waitFor(() => screen.getByText(/Done!/))
    expect(screen.getByRole('button', { name: /clear/i })).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

```
npm test -- src/features/tutor/ApiKeyMode.test.tsx
```

Expected: FAIL — module not found.

- [ ] **Step 3: Implement `ApiKeyMode.tsx`**

```tsx
import { useState } from 'react'
import { buildPrompt } from './buildPrompt'
import type { StudentContext } from '../../hooks/useTutorContext'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

interface ApiKeyModeProps {
  context: StudentContext | null
  apiKey: string
  model: string
}

export function ApiKeyMode({ context, apiKey, model }: ApiKeyModeProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [question, setQuestion] = useState('')
  const [streaming, setStreaming] = useState(false)
  const [streamedContent, setStreamedContent] = useState('')
  const [error, setError] = useState<string | null>(null)

  async function handleSend() {
    if (!question.trim() || streaming) return

    const userContent = messages.length === 0
      ? buildPrompt(context, question)  // first message: full 3-layer prompt
      : question                        // follow-ups: plain question

    const userMessage: Message = { role: 'user', content: question }  // display the plain question
    const newMessages = [...messages, userMessage]
    setMessages(newMessages)
    setQuestion('')
    setStreaming(true)
    setStreamedContent('')
    setError(null)

    // Build API messages array: first call sends full prompt, follow-ups send plain questions
    const apiMessages = newMessages.map((m, i) => ({
      role: m.role,
      content: i === 0 && messages.length === 0 ? userContent : m.content,
    }))
    // Correct: rebuild — first user message should be the full prompt
    const apiMessageHistory = messages.length === 0
      ? [{ role: 'user', content: userContent }]
      : [
          { role: 'user', content: buildPrompt(context, messages[0].content) },
          ...messages.slice(1).map(m => ({ role: m.role, content: m.content })),
          { role: 'user', content: question },
        ]

    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
          'anthropic-dangerous-direct-browser-access': 'true',
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          model,
          max_tokens: 2048,
          stream: true,
          messages: apiMessageHistory,
        }),
      })

      if (!response.ok) {
        setError(`API error: ${response.status} — check your API key in Settings.`)
        setStreaming(false)
        return
      }

      const reader = response.body!.getReader()
      const decoder = new TextDecoder()
      let buffer = ''
      let accumulated = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n\n')
        buffer = lines.pop() ?? ''

        for (const line of lines) {
          const trimmed = line.trim()
          if (!trimmed.startsWith('data: ')) continue
          const data = trimmed.slice(6)
          try {
            const parsed = JSON.parse(data)
            if (parsed.type === 'content_block_delta' && parsed.delta?.type === 'text_delta') {
              accumulated += parsed.delta.text
              setStreamedContent(accumulated)
            }
          } catch {
            // malformed JSON — skip
          }
        }
      }

      setMessages(prev => [...prev, { role: 'assistant', content: accumulated }])
    } catch (err) {
      setError(`Network error — ${String(err)}`)
    } finally {
      setStreaming(false)
      setStreamedContent('')
    }
  }

  function handleClear() {
    setMessages([])
    setQuestion('')
    setStreamedContent('')
    setError(null)
  }

  return (
    <div className="space-y-4">
      {/* Conversation history */}
      {messages.length > 0 && (
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`rounded p-3 text-sm ${
                msg.role === 'user'
                  ? 'bg-brand-surface border border-brand-border text-brand-text ml-8'
                  : 'bg-brand-bg border border-brand-border text-brand-text mr-8'
              }`}
            >
              <p className="text-brand-muted text-xs mb-1">{msg.role === 'user' ? 'You' : 'Claude'}</p>
              <p className="whitespace-pre-wrap">{msg.content}</p>
            </div>
          ))}

          {/* Streaming response */}
          {streaming && streamedContent && (
            <div className="bg-brand-bg border border-brand-border rounded p-3 text-sm text-brand-text mr-8">
              <p className="text-brand-muted text-xs mb-1">Claude</p>
              <p className="whitespace-pre-wrap">{streamedContent}</p>
            </div>
          )}
          {streaming && !streamedContent && (
            <div className="bg-brand-bg border border-brand-border rounded p-3 text-sm text-brand-muted mr-8">
              Thinking…
            </div>
          )}
        </div>
      )}

      {/* Error message */}
      {error && (
        <p className="text-sm text-brand-accent border border-brand-accent rounded px-3 py-2">{error}</p>
      )}

      {/* Question input */}
      <div className="space-y-2">
        <textarea
          value={question}
          onChange={e => setQuestion(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleSend() }}
          placeholder="Type your question about CrowdStrike SIEM, SOAR, or related topics…"
          rows={3}
          disabled={streaming}
          className="w-full px-3 py-2 bg-brand-bg border border-brand-border rounded text-brand-text text-sm placeholder:text-brand-muted focus:outline-none focus:border-brand-accent resize-none disabled:opacity-60"
        />
        <div className="flex gap-2">
          <button
            onClick={handleSend}
            disabled={!question.trim() || streaming}
            className="px-5 py-2 bg-brand-accent text-white rounded font-medium text-sm hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition-opacity"
          >
            {streaming ? 'Sending…' : 'Send'}
          </button>
          {messages.length > 0 && (
            <button
              onClick={handleClear}
              disabled={streaming}
              className="px-4 py-2 bg-brand-surface border border-brand-border text-brand-text rounded text-sm hover:border-brand-accent transition-colors disabled:opacity-40"
            >
              Clear conversation
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 4: Run ApiKeyMode tests to verify they pass**

```
npm test -- src/features/tutor/ApiKeyMode.test.tsx
```

Expected: all passing (6 tests).

- [ ] **Step 5: Commit**

```
git add src/features/tutor/ApiKeyMode.tsx src/features/tutor/ApiKeyMode.test.tsx
git commit -m "feat: add ApiKeyMode with Anthropic streaming"
```

---

### Task 5: `TutorPage` assembly

Replace the 7-line stub with the full Tutor page. Wires `useTutorContext` + `useTutorSettings` together, renders a context panel, then dispatches to `ClipboardMode` or `ApiKeyMode` based on current settings.

**Files:**
- Modify: `src/pages/TutorPage.tsx`

**No new test file needed** — the route is already wired in `AppShell.tsx` and the component tests for `ClipboardMode`/`ApiKeyMode` cover the sub-components. The AppShell integration test verifies the route renders.

- [ ] **Step 1: Read the current stub**

Current `src/pages/TutorPage.tsx`:
```tsx
export default function TutorPage() {
  return (
    <div className="p-8">
      <h2 className="text-2xl font-bold">🧠 Claude Tutor</h2>
      <p className="text-brand-muted mt-2">Tutor module — coming in Plan 5.</p>
    </div>
  )
}
```

- [ ] **Step 2: Replace with the full implementation**

```tsx
import { useTutorContext } from '../hooks/useTutorContext'
import { useTutorSettings } from '../hooks/useTutorSettings'
import { ClipboardMode } from '../features/tutor/ClipboardMode'
import { ApiKeyMode } from '../features/tutor/ApiKeyMode'

export default function TutorPage() {
  const { context, loading: ctxLoading } = useTutorContext()
  const { settings, loading: settingsLoading } = useTutorSettings()

  if (ctxLoading || settingsLoading) {
    return <div className="p-8 text-brand-muted">Loading…</div>
  }

  return (
    <div className="p-6 space-y-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-brand-text">🧠 Claude Tutor</h1>

      {/* Context panel */}
      {context ? (
        <div className="bg-brand-surface border border-brand-border rounded p-4 space-y-1 text-sm">
          <p className="text-brand-muted">
            Currently studying:{' '}
            <span className="text-brand-text font-medium">{context.moduleName}</span>
          </p>
          <p className="text-brand-muted">
            Competency:{' '}
            <span className="text-brand-text">{context.competencyLevel}</span>
            {context.quizScore !== null && (
              <span className="text-brand-muted"> ({context.quizScore}%)</span>
            )}
          </p>
          <p className="text-brand-muted">
            SME readiness:{' '}
            <span className="text-brand-text">{context.overallSmeReadiness}%</span>
          </p>
          {context.recentWrongAnswers.length > 0 && (
            <p className="text-brand-muted">
              Recent mistakes:{' '}
              <span className="text-brand-text">{context.recentWrongAnswers.length} question{context.recentWrongAnswers.length !== 1 ? 's' : ''}</span>
              {' '}included in context
            </p>
          )}
        </div>
      ) : (
        <div className="bg-brand-surface border border-brand-border rounded p-4 text-sm text-brand-muted">
          No module selected yet — start a module to auto-populate your context.
          You can still ask general questions below.
        </div>
      )}

      {/* Mode dispatch */}
      {settings.mode === 'apikey' && settings.apiKey ? (
        <ApiKeyMode context={context} apiKey={settings.apiKey} model={settings.model} />
      ) : (
        <ClipboardMode context={context} />
      )}

      {settings.mode === 'apikey' && !settings.apiKey && (
        <p className="text-sm text-brand-muted border border-brand-border rounded px-3 py-2">
          API Key Mode is active but no key is set.{' '}
          <a href="/settings" className="text-brand-accent underline hover:no-underline">
            Add your key in Settings →
          </a>
        </p>
      )}
    </div>
  )
}
```

- [ ] **Step 3: Run the full test suite**

```
npm test
```

Expected: all tests pass. The stub replacement is pure composition — no new logic paths.

- [ ] **Step 4: Commit**

```
git add src/pages/TutorPage.tsx
git commit -m "feat: replace TutorPage stub with full Claude Tutor implementation"
```

---

## Self-Review Checklist

After writing this plan, I verified:

1. **Spec coverage:**
   - ✅ Clipboard Mode: question input, 3-layer prompt generation, copy to clipboard, inline preview
   - ✅ API Key Mode: streaming fetch, conversational history, clear conversation
   - ✅ Settings: mode toggle, API key input, model selector
   - ✅ Student context auto-populated: current module, competency, recent wrong answers, SME readiness, completed modules
   - ✅ No new npm dependencies

2. **Placeholder scan:**
   - No TBD or TODO in task steps
   - All code blocks are complete implementations
   - All type signatures are defined before they're consumed

3. **Type consistency:**
   - `StudentContext` defined in Task 1, imported verbatim in Tasks 3, 4, 5
   - `TutorSettingsData` defined in Task 2, used in Task 5 via `useTutorSettings()`
   - `buildPrompt(context: StudentContext | null, question: string): string` — same signature in Task 3 definition and Task 4 consumer
   - `WrongAnswer` defined in Task 1, used inside `StudentContext`
   - `ClipboardMode` props: `{ context: StudentContext | null }` — matches Task 5 usage
   - `ApiKeyMode` props: `{ context: StudentContext | null, apiKey: string, model: string }` — matches Task 5 usage
