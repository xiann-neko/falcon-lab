# Falcon Lab — Design Document
**Date:** 2026-08-12
**Status:** Approved for implementation

---

## Overview

Falcon Lab is a self-contained, browser-based learning platform that teaches and tests CrowdStrike SIEM and SOAR skills to intermediate-level engineers aiming for Subject Matter Expert (SME) certification readiness. It runs entirely in the browser with no backend server, no subscription fees, and no external API dependencies. All content is sourced from official CrowdStrike and LogScale documentation.

---

## Goals

- Teach CrowdStrike SIEM (LogScale), SOAR (Falcon Fusion), LTR & Data Tiers, Charlotte AI, and Platform Essentials from an intermediate baseline to SME level
- Test the learner through multiple assessment types (quiz, hands-on challenge, scenario simulation)
- Track competency per topic and domain readiness over time using spaced repetition
- Work on both desktop (Windows) and tablet (Apple iPad) via a responsive web UI
- Deploy for free on GitHub Pages with no server, domain purchase, or subscription required
- Include a Claude Tutor module that works via clipboard (claude.ai) today and API key later

---

## Tech Stack

| Layer | Choice | Reason |
|---|---|---|
| Framework | Vite + React | Fast, lightweight, no server required |
| Styling | Tailwind CSS | Responsive desktop/iPad breakpoints with minimal CSS |
| Storage | IndexedDB | Persistent browser database, survives cache clears, ~50–250MB |
| Hosting | GitHub Pages | Free forever, no credit card, auto-deploys via GitHub Actions |
| Content | TypeScript data files | Human-editable, no database needed, version-controlled |
| Cross-device sync | Manual JSON export/import | No external service needed |

---

## Architecture

```
┌─────────────────────────────────────────────┐
│           Vite + React SPA                  │
│                                             │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  │
│  │  Content │  │  Engine  │  │   UI     │  │
│  │  Layer   │  │  Layer   │  │  Layer   │  │
│  │          │  │          │  │          │  │
│  │ TS/JSON  │  │ Quiz     │  │ React    │  │
│  │ files    │  │ Scenario │  │ Tailwind │  │
│  │ (topics, │  │ Progress │  │ Responsive│  │
│  │ quizzes, │  │ Scoring  │  │ desktop+ │  │
│  │ scenarios│  │ Spaced   │  │ iPad     │  │
│  └──────────┘  │ Repetition│  └──────────┘  │
│                └──────────┘                 │
│                     │                       │
│              ┌──────▼──────┐                │
│              │  IndexedDB  │                │
│              │  (progress, │                │
│              │  scores,    │                │
│              │  history,   │                │
│              │  SR queue)  │                │
│              └─────────────┘                │
│                                             │
│  ┌──────────────────────────────────────┐   │
│  │  Export/Import (JSON file ↔ device)  │   │
│  └──────────────────────────────────────┘   │
│                                             │
│  ┌──────────────────────────────────────┐   │
│  │  Claude Tutor (clipboard / API key)  │   │
│  └──────────────────────────────────────┘   │
└─────────────────────────────────────────────┘
         │
         ▼ GitHub Actions (auto-deploy on push)
   GitHub Pages — https://[username].github.io/falcon-lab
```

### Key Principles

- **All content is data** — topics, quizzes, and scenarios are structured TypeScript files. Adding or updating content requires no component changes.
- **Engine is separate from UI** — quiz scoring, competency calculation, spaced repetition scheduling, and scenario state are pure functions, independently testable.
- **Claude Tutor is a plug-in** — a single `ClaudeTutor.tsx` component that activates in clipboard mode by default and upgrades to API mode when a key is provided in Settings.
- **No build-time secrets** — the app has zero server-side logic. All user data stays in the browser.

---

## Content Domains & Curriculum

Learning progresses through five domains in recommended order. Tracks within each domain unlock sequentially. Modules within a track unlock sequentially.

### Domain 1 — LogScale / Next-Gen SIEM

| Track | Modules |
|---|---|
| 1.1 Foundations | What is LogScale? Architecture & key concepts · Data ingestion — parsers, ingest tokens, sources · The LogScale data model (events, tags, fields) |
| 1.2 CQL (CrowdStrike Query Language) | Basic search & filtering · Aggregation functions (count, groupBy, timeslice) · Advanced functions (regex, format, join, lookup) · Writing production-grade queries |
| 1.3 Detection & Alerting | Saved searches & scheduled alerts · Alert actions & integrations · Threat detection patterns in CQL |
| 1.4 Dashboards & Reporting | Building dashboards · Sharing, permissions, and governance |

**CQL canonical reference:** https://library.humio.com/data-analysis/syntax.html

### Domain 2 — Falcon Fusion SOAR

| Track | Modules |
|---|---|
| 2.1 Foundations | What is Fusion? Architecture & concepts · Triggers — detections, incidents, schedules, manual |
| 2.2 Workflow Builder | Actions library — notifications, enrichment, response · Conditions, branching & loops · Variables, templates & data passing |
| 2.3 Playbook Design | Anatomy of a production playbook · Triage & escalation playbooks · Remediation & containment playbooks |
| 2.4 Integrations & Advanced | 3rd-party integrations (ITSM, email, Slack) · Testing, versioning & playbook governance |

### Domain 3 — LTR & Data Tiers

| Track | Modules |
|---|---|
| 3.1 Data Architecture | Hot / Warm / Cold tiers explained · Retention policies & data lifecycle · Long Term Repository (LTR) deep dive |
| 3.2 Optimization | Cost optimization strategies · Query performance across tiers · Compliance & data governance |

### Domain 4 — Charlotte AI

| Track | Modules |
|---|---|
| 4.1 Foundations | What is Charlotte AI? Capabilities & architecture · Charlotte AI vs. traditional detection workflows · How Charlotte AI uses your SIEM data |
| 4.2 Using Charlotte AI Effectively | Natural language investigation queries · AI-assisted alert triage & summarization · Threat hunting with Charlotte AI |
| 4.3 Charlotte AI + SOAR Integration | Triggering Fusion workflows from Charlotte AI insights · Limitations, trust boundaries & when NOT to rely on it |

### Domain 5 — Platform Essentials

| Track | Modules |
|---|---|
| 5.1 Falcon Data Replicator (FDR) | What FDR is & how it feeds SIEM · Schema, event types & field mapping |
| 5.2 CrowdStrike APIs & Automation | Falcon API fundamentals (OAuth2, scopes) · Key API endpoints for SIEM/SOAR engineers · Building automation scripts against the API |
| 5.3 Reporting & Governance | Scheduled reports & executive dashboards · Role-based access control for SIEM/SOAR |
| 5.4 Threat Intelligence Integration | Falcon Intelligence feeds in LogScale · IOC management & enrichment in playbooks |

### Content Standards (all modules)

Every module must include:
1. Concept explained in plain language from the learner's perspective
2. At least one practical example (CQL query, playbook snippet, or config)
3. A direct link to the official CrowdStrike/LogScale documentation page it is based on
4. The specific documentation excerpt it references (for currency verification)
5. A "Last reviewed" timestamp so staleness is visible

---

## Assessment System

Three assessment types appear at specific points in the learning flow.

### Type 1 — Multiple Choice Quiz
**Trigger:** End of every module

- 5–10 questions per module, randomised order on each attempt
- Every question (correct or incorrect) shows explanation + official doc reference
- Wrong answers enter the spaced repetition queue automatically
- Module quiz must be passed (≥40%) before the next module unlocks

### Type 2 — Hands-On Challenge
**Trigger:** Mid-track for SIEM (CQL writing) and SOAR (playbook design)

**For SIEM (CQL challenges):**
- Learner writes a CQL query in a text editor panel
- Answer is checked against a set of required components (not exact string match)
- Pass threshold: ≥70% of required components present (Practitioner); ≥90% for SME credit
- Feedback shows which components were present, which were missing
- Model answer with explanation shown after submission

**For SOAR (playbook design challenges):**
- Learner arranges Fusion actions into the correct sequence via drag-and-drop
- Feedback shows correct ordering with explanation of why each step comes where it does

### Type 3 — Scenario Simulation
**Trigger:** End of every track; cumulative scenario at end of every domain

- Real-world SOC incident presented with narrative context
- 5–8 decision points per scenario, each branching based on the learner's choice
- Wrong choices show consequences and correct reasoning before continuing
- Final score based on: decisions made correctly, critical steps not missed
- Every decision references the official doc supporting the correct action
- Domain-end scenarios cross multiple tracks (e.g., SOAR scenario requires writing a CQL query first)

### Assessment Placement Summary

| Point in curriculum | Assessment type |
|---|---|
| End of every module | Multiple choice quiz |
| Mid-track (SIEM, SOAR) | Hands-on challenge |
| End of every track | Scenario simulation |
| End of every domain | Cumulative cross-track scenario |

---

## Progress & Competency Tracking

### Competency Levels (per module topic)

| Level | Threshold | How earned |
|---|---|---|
| Novice | Default | Not yet attempted |
| Aware | 40–69% | Completed module + quiz score in range |
| Practitioner | 70–89% | Quiz score ≥70% + hands-on challenge ≥70% of required components correct |
| SME | 90%+ | Quiz ≥90% + challenge ≥90% of components correct + scenario simulation passed |

**For modules without a hands-on challenge** (e.g. LTR, Charlotte AI modules): Practitioner = quiz ≥70%; SME = quiz ≥90% + track scenario simulation passed. The competency engine checks whether a challenge exists for a module before requiring it.

Levels can decrease on retry — the competency reflects consistent performance, not a one-time peak score.

### Domain Readiness Score

Weighted average across all modules in a domain:

| Activity | Weight |
|---|---|
| Module quiz completed | 20% |
| Hands-on challenge passed | 35% |
| Scenario simulation passed | 45% |

### Overall SME Readiness

Unweighted average across all five domain readiness scores, displayed as a percentage on the dashboard.

### Spaced Repetition

Questions answered incorrectly are scheduled to reappear:
- 1 day after the mistake
- 3 days after first correct retry
- 7 days after second correct retry
- Retired from queue after third correct retry

A "Due for Review" card on the dashboard shows pending repetition questions each session.

### Export / Import Format

```json
{
  "exportedAt": "2026-08-12T10:30:00Z",
  "version": "1.0",
  "competency": {
    "siem-logscale-foundations": "practitioner",
    "siem-cql-basic": "practitioner",
    "siem-cql-aggregations": "aware"
  },
  "quizHistory": [],
  "scenarioHistory": [],
  "spacedRepetition": [],
  "domainReadiness": {
    "siem": 67,
    "soar": 38,
    "ltr": 18,
    "charlotteAi": 0,
    "platformEssentials": 0
  }
}
```

Import on any device (laptop, iPad) fully restores competency levels, spaced repetition queue, and readiness scores.

---

## UI Layout

### Visual Identity

| Property | Value |
|---|---|
| App name | Falcon Lab |
| Background | `#0F1923` (dark navy, matches Falcon console) |
| Accent | `#E01B2D` (CrowdStrike red) |
| Text | `#FFFFFF` |
| Theme | Dark mode only |
| CSS framework | Tailwind CSS |

### Navigation

**Desktop:** Persistent left sidebar + main content area
**iPad:** Sidebar collapses to bottom tab bar — same pages, larger touch targets

Sidebar / tab items:
- 📊 Dashboard
- 📡 SIEM
- ⚡ SOAR
- 🗄️ LTR
- 🤖 Charlotte AI
- 🔧 Platform
- 🧠 Tutor

### Key Screens

**Dashboard (Home)**
- Overall SME Readiness progress bar
- "Continue where you left off" card
- "Due for Review" spaced repetition card
- Domain readiness bars for all five domains
- Export / Import progress buttons

**Domain View**
- Domain name + readiness percentage
- Track list with completion status
- Module list within each track with competency badge (Novice / Aware / Practitioner / SME)
- Locked modules shown with lock icon

**Module (Learning Content)**
- Step progress indicator
- Concept explanation
- Code examples (CQL queries, playbook snippets)
- Official reference section with doc title, URL, and "Open Docs ↗" link
- Previous / Next navigation

**Assessment Screens**
- Quiz: question + 4 options + submit → immediate feedback + doc reference
- Challenge: text editor (CQL) or drag-and-drop (playbook) + component-level feedback
- Scenario: narrative + decision options + branching outcomes + end score

**Claude Tutor**
- Auto-populated context panel (current module, competency, recent mistakes)
- Free-text question input
- "Copy prompt for Claude.ai" button (clipboard mode)
- "I have an API key" toggle
- Copied prompt preview shown inline

**Settings**
- Claude Tutor Mode: Clipboard vs. API Key
- API Key input field + model selector (when API key mode active)
- Export Progress / Import Progress

---

## Claude Tutor Module

### Clipboard Mode (Default — No API Key Required)

The tutor generates a fully self-contained prompt requiring zero access to the app. Claude.ai receives everything it needs to respond accurately.

**Prompt structure (three layers):**

**Layer 1 — System instruction:**
```
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
```

**Layer 2 — Auto-generated student context:**
```
STUDENT CONTEXT:
- Currently studying: [module name] ([track], Domain: [domain])
- Competency level on this topic: [level] ([score]%)
- Recent quiz performance: [X]/[Y] correct
- Questions answered incorrectly:
    Q: [question text]
    Student answered: [wrong answer]
    Correct answer: [correct answer]
    Doc reference: [url]
- Overall SME readiness: [X]%
- Completed modules: [list]
```

**Layer 3 — Student question:**
```
STUDENT QUESTION:
"[verbatim question typed by learner]"
```

### API Key Mode (Future Upgrade)

When an API key is provided in Settings:
- Same prompt structure used as the request body
- Responses stream inline in the Tutor panel
- Conversational — follow-up questions retain context within the session
- Recommended model: Claude Sonnet 5

---

## GitHub Pages Deployment

### One-Time Setup (No Terminal Required)

1. Create a free GitHub account at github.com
2. Create a new public repository named `falcon-lab`
3. Install GitHub Desktop (free, visual interface)
4. The project includes a pre-configured `.github/workflows/deploy.yml`
5. In the repository Settings → Pages → Source: GitHub Actions
6. App is live at: `https://[username].github.io/falcon-lab`

### Content Update Flow

1. Edit a content TypeScript file (topic, quiz question, or scenario)
2. In GitHub Desktop: write a commit message → Push
3. GitHub Actions rebuilds automatically (~2 minutes)
4. Site updates — no server, no terminal, no manual deploy step

---

## Content Update Strategy

- Each content file has a `lastReviewed` field (ISO date string)
- The module UI shows "Last reviewed: [date]" so staleness is immediately visible
- When CrowdStrike updates documentation, the relevant content file is updated and `lastReviewed` is refreshed
- Adding a new module = adding one TypeScript data file and registering it in the domain index — no component code changes needed

---

## Out of Scope (Not in This Version)

- User accounts or authentication
- Cross-device sync (manual export/import is sufficient)
- Community features (leaderboards, shared scenarios)
- Mobile app (PWA can be added later as an enhancement)
- Automated content updates from CrowdStrike docs (manual curation only)

---

## Open Questions

None — all design decisions resolved during brainstorming session.

---

*Design approved and ready for implementation planning.*
