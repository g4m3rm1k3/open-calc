# Compass — Your Personal Operating System

> *"You do not rise to the level of your goals. You fall to the level of your systems."* — James Clear, Atomic Habits

## What Is This?

**Compass** is a personal productivity tool that lives inside UpSkillOS. It combines notes, goals, habits, built-in tutorials, and an LLM coach into a single dashboard designed to help learners build the *systems* that make success automatic.

It's not a to-do list. It's not a notes app. It's a **life system builder** that uses science-backed protocols (Atomic Habits, Deep Work, GTD, Implementation Intentions) to help you design your days, track what matters, and get smarter over time — with an AI coach guiding you.

---

## Core Features

### 1. 📓 Smart Notes (Zettelkasten-lite)
- Quick-capture notes with markdown support
- Auto-tagged by context (what course you were studying, what goal it relates to)
- Linked notes — connect ideas across subjects
- Daily "Morning Page" and "Evening Review" prompts

### 2. 🎯 Goal System (Not Just Goals — Systems)
Inspired by **Atomic Habits** Chapter 1: *"Goals are about the results you want. Systems are about the processes that lead to those results."*

- **Identity Goals**: "I am a person who..." (identity-first framing from Atomic Habits Ch. 2)
- **System Design**: For each goal, define the daily/weekly *system* (specific actions)
- **Milestone Tracker**: Visual progress with % completion
- **Calendar Sync**: Goals automatically create recurring calendar events via `useCalendar`

### 3. 🔁 Habit Tracker (The Compound Effect)
Science-backed habit protocols:

| Protocol | Source | Implementation |
|----------|--------|----------------|
| **Habit Stacking** | Atomic Habits Ch. 5 | "After [CURRENT HABIT], I will [NEW HABIT]" templates |
| **2-Minute Rule** | Atomic Habits Ch. 13 | Habits auto-decompose into 2-minute starter versions |
| **Implementation Intentions** | Peter Gollwitzer (1999) | "I will [BEHAVIOR] at [TIME] in [LOCATION]" |
| **Don't Break the Chain** | Jerry Seinfeld | Visual streak calendar with heat map |
| **Minimum Viable Effort** | BJ Fogg, *Tiny Habits* | Celebrate micro-wins, scale up gradually |

### 4. 🧠 Built-in Tutorials (Learn the Science)
Interactive lesson cards embedded directly in the tool, teaching users *why* these systems work:

- **Atomic Habits Masterclass** — The 4 Laws of Behavior Change
- **Deep Work Protocol** — Cal Newport's rules for focused work
- **Getting Things Done (GTD)** — Capture → Clarify → Organize → Review → Engage
- **Systems Thinking 101** — Feedback loops, leverage points, second-order effects
- **The Pomodoro Technique** — Focused sprints with deliberate breaks
- **Spaced Repetition** — Why reviewing at increasing intervals beats cramming

Each tutorial is a compact, scrollable card with key principles, not a full course.

### 5. 🤖 Compass AI Coach
Uses the existing WebLLM integration (same `CreateMLCEngine` pattern as Lovelace/Hippocrates):

- **Weekly Review Generator**: "Here's what you accomplished this week, here's what fell off..."
- **Goal Decomposer**: Describe a vague goal → AI breaks it into systems, habits, and milestones
- **Habit Stack Suggester**: Based on your existing habits, suggests where to stack new ones
- **Accountability Check-ins**: Gentle nudges tied to your streak data
- **Study Planner**: Connects to `ProgressContext` to see which courses you're in and suggests study schedules

### 6. 📅 Calendar Integration
- Goals and habits automatically sync to the calendar as recurring events
- Morning/evening review blocks auto-scheduled
- Pomodoro sessions appear as time blocks
- Pulls in lesson completion data from `ProgressContext` to show learning streaks

---

## Architecture

### Where It Lives

**Two entry points:**

1. **Full Page** (`/compass`) — The main dashboard with all panels
2. **Nav Tool Button** — A quick-access overlay (like the calculator/grapher) for capturing notes and checking habits on-the-fly

### File Structure

```
src/features/compass/
├── CompassPage.tsx              # [NEW] Full-page dashboard
├── CompassQuickPanel.jsx        # [NEW] Overlay tool (quick capture)
├── useCompass.ts                # [NEW] Core hook — CRUD for goals, habits, notes
├── useCompassAI.js              # [NEW] LLM coach (follows useHippocratesAI pattern)
├── types.ts                     # [NEW] TypeScript interfaces
├── tutorials/                   # [NEW] Built-in tutorial content
│   ├── atomic-habits.js
│   ├── deep-work.js
│   ├── gtd.js
│   ├── systems-thinking.js
│   ├── pomodoro.js
│   └── spaced-repetition.js
└── components/
    ├── GoalCard.tsx             # [NEW] Single goal with system + milestones
    ├── HabitGrid.tsx            # [NEW] Streak calendar / heat map
    ├── NoteEditor.tsx           # [NEW] Markdown note with auto-tags
    ├── TutorialCard.tsx         # [NEW] Expandable tutorial lesson
    ├── WeeklyReview.tsx         # [NEW] AI-generated weekly summary
    └── PomodoroTimer.tsx        # [NEW] Focus timer with sessions
```

### Integration Points

| Integration | How | File to Modify |
|-------------|-----|----------------|
| **Route** | Add `/compass` route | `App.jsx` — add lazy import + `<Route>` |
| **Start Menu** | Add to `NAV_LINKS` | `StartMenu.jsx` — add entry |
| **Top Bar Tool** | Register as overlay tool | `src/tools/compass/index.jsx` — auto-discovered |
| **Data Persistence** | localStorage key `oc-compass` | New key, add to `SYNC_KEYS` in `AuthContext.jsx` |
| **Calendar Sync** | Import `useCalendar` hook | Read/write via existing calendar API |
| **Progress Data** | Import `ProgressContext` | Read-only, for learning streak display |
| **LLM** | New `useCompassAI.js` hook | Follows `useHippocratesAI.js` singleton pattern |

### Data Model

```typescript
interface CompassStore {
  goals: Goal[]
  habits: Habit[]
  notes: Note[]
  reviews: WeeklyReview[]
  settings: CompassSettings
}

interface Goal {
  id: string
  identity: string          // "I am a person who..."
  title: string             // "Learn Linear Algebra"  
  system: string            // "Study 30 min daily, do 5 practice problems"
  milestones: Milestone[]
  calendarEventIds: string[] // linked calendar events
  createdAt: string
  status: 'active' | 'paused' | 'completed'
}

interface Habit {
  id: string
  cue: string               // "After I pour my morning coffee"
  routine: string            // "I will open UpSkillOS and study for 2 minutes"
  reward: string             // "I mark it on my streak calendar"
  twoMinVersion: string      // "Open the app and read 1 paragraph"
  streak: string[]           // ISO dates completed
  goalId?: string            // optional link to parent goal
}

interface Note {
  id: string
  content: string            // markdown
  tags: string[]
  linkedNoteIds: string[]
  courseRef?: string          // auto-tagged from current course
  goalRef?: string
  createdAt: string
  updatedAt: string
}
```

---

## UI Design

The Compass page will be a **4-panel responsive dashboard**:

```
┌─────────────────────────────────────────────────────┐
│  🧭 Compass                        [AI Coach] [⚙️]  │
├──────────────┬──────────────────────┬───────────────┤
│              │                      │               │
│  📓 Notes    │   🎯 Goals &         │  📅 Today     │
│  Quick       │   Systems            │  Calendar     │
│  Capture     │                      │  Events       │
│              │   ┌────────────┐     │               │
│  ────────    │   │ Goal Card  │     │  Habits       │
│  Linked      │   │ ▸ System   │     │  Streak       │
│  Notes       │   │ ▸ Progress │     │  Grid         │
│  List        │   └────────────┘     │               │
│              │                      │  ⏱ Pomodoro   │
│              │   📚 Tutorials       │               │
│              │                      │               │
├──────────────┴──────────────────────┴───────────────┤
│  🤖 AI Coach: "You've completed 3/5 habits today.   │
│     Your Linear Algebra streak is at 7 days!"       │
└─────────────────────────────────────────────────────┘
```

On mobile, the panels stack vertically with tabs.

---

## Open Questions

> [!IMPORTANT]
> **Name**: I'm proposing **"Compass"** — as in guiding your direction. Other options: "Mission Control", "LifeOS", "Forge", "Launchpad". Preference?

> [!IMPORTANT]
> **Scope for V1**: This is a big feature. I recommend building it in phases:
> - **Phase 1**: Core dashboard + Goals + Habits + Notes + Calendar sync
> - **Phase 2**: AI Coach integration + Weekly Reviews
> - **Phase 3**: Built-in tutorials + Pomodoro timer
>
> Should I build Phase 1 first and let you test it, or do you want the full thing in one go?

> [!IMPORTANT]
> **Tutorial Depth**: Should the built-in tutorials (Atomic Habits, Deep Work, etc.) be full interactive lessons like the courses, or compact reference cards (key principles + actionable steps)?

## Verification Plan

### Phase 1 Verification
1. Navigate to `/compass` — dashboard renders with all panels
2. Create a goal with identity statement, system, and milestones
3. Add a habit with cue/routine/reward — verify streak tracking works
4. Write a note — verify auto-tagging and linking
5. Verify calendar events are created for goals/habits
6. Verify data persists in `oc-compass` localStorage key
7. Check the quick-access tool button in the top bar opens the overlay
8. Run `npm run check` — clean build with no errors
