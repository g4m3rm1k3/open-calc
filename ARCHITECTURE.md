# open-calc Architecture Map

> A complete reference document for contributors. Covers every layer of the app — routing, layout, content formats, viz system, reference system, progress system, known inconsistencies, and a tiered contribution guide.

---

## Table of Contents

1. [Tech Stack](#1-tech-stack)
2. [App Entry + Routing](#2-app-entry--routing)
3. [Layout + Shell](#3-layout--shell)
4. [Content System](#4-content-system)
5. [Lesson Schemas (4 variants)](#5-lesson-schemas-4-variants)
6. [Chapter Index Formats (3 variants)](#6-chapter-index-formats-3-variants)
7. [Lesson Renderer Pipeline](#7-lesson-renderer-pipeline)
8. [Viz System](#8-viz-system)
9. [Reference System](#9-reference-system)
10. [Progress System](#10-progress-system)
11. [Interactive Runtimes](#11-interactive-runtimes)
12. [Tools Panel System](#12-tools-panel-system)
13. [Video System](#13-video-system)
14. [Lesson Enhancer](#14-lesson-enhancer)
15. [Known Issues](#15-known-issues)
16. [Contribution Guide (Tiered)](#16-contribution-guide-tiered)
17. [Full File Map](#17-full-file-map)

---

## 1. Tech Stack

| Layer | Technology |
|---|---|
| Build | Vite |
| UI | React 18 |
| Routing | React Router v6 (HashRouter) |
| Styling | Tailwind CSS (dark mode via `.dark` class on `<html>`) |
| Math rendering | KaTeX (via `KatexBlock` / `KatexInline` components) |
| Python runtime | Pyodide WASM (loaded in `PythonNotebook.jsx`) |
| JS sandbox | Monaco Editor + sandboxed `<iframe>` (in `JSNotebook.jsx`) |
| Physics sim | Matter.js (in `matter/` viz subfolder) |
| 3D | Three.js (in `three/` viz subfolder) |
| Charts / animated graphs | D3.js (in `d3/` viz subfolder) |
| Math evaluation (quizzes) | mathjs (`evaluate`, `simplify`) |

Design tokens live in `tailwind.config.js`:
- **Colors**: Custom `brand` scale (indigo-family, 50–950). Use `brand-*` for primary actions.
- **Fonts**: Inter (prose), JetBrains Mono (code / monospace)
- **Dark mode**: CSS variables `--color-bg-primary`, `--color-text-primary`, `--color-surface`, `--color-border` toggled on the `.dark` class

---

## 2. App Entry + Routing

```
src/main.jsx   → mounts <App />
src/App.jsx    → HashRouter + all top-level routes
```

### Route table

| URL hash | Page component | Notes |
|---|---|---|
| `#/` | `HomePage.jsx` | Course card grid (one card per course) |
| `#/course/:courseKey` | `CoursePage.jsx` | **All chapters for a course** — the course overview |
| `#/chapter/:chapterId` | `ChapterPage.jsx` | Lesson list for one chapter |
| `#/chapter/:chapterId/:lessonSlug` | `LessonPage.jsx` | **Main lesson renderer — used by ALL courses** |
| `#/reference` | `ReferencePage.jsx` | Formula cards + proof modals |
| `#/search` | search modal (in AppShell) | Opens search overlay |
| `#/paths` | `LearningPathsPage.jsx` | Curated learning paths |
| `#/about` | `AboutPage.jsx` | |
| `#/chemistry` | `ChemistryPage.jsx` | **Tools page only** — Periodic Table + Molecule Builder |
| `#/logic-sim` | `LogicSimPage.jsx` | **Tools page only** — digital logic circuit simulator |
| `#/universal-calc` | `UniversalCalcPage.jsx` | **Tools page only** — calculator tools |

**How lesson routing works internally:**

`LessonPage` calls `LESSON_MAP[chapterId + '/' + lessonSlug]` (from `content/index.js`). That flat map is built at startup by assembling every lesson from every course's index file. A lesson must have both a correct `chapter` field AND a matching mapping in its chapter's index, or it will 404.

### ⚠ Tools pages vs lesson pages

`ChemistryPage`, `LogicSimPage`, and `UniversalCalcPage` are **tools pages** — they contain interactive tools (periodic table, circuit simulator, calculator). They do **not** render lessons and must never be modified to do so. All lessons for all courses — including chemistry and digital fundamentals — go through `LessonPage` via `#/chapter/:chapterId/:lessonSlug`.

---

## 3. Layout + Shell

```
src/components/layout/AppShell.jsx    ← the single layout wrapper for the whole app
  ├── TopBar (CoursesDropdown, Reference, Universal Calc links, dark mode toggle, tool icon buttons)
  ├── CoursesDropdown (inside TopBar) — "Courses ▾" button; 2-col grid of all courses; z-[400]
  ├── Sidebar (desktop — collapsible/pinnable, shows full course tree for active course)
  ├── MobileBottomNav (mobile — 4 tabs: Home, Courses, Reference, About)
  └── Tool panels (floating overlays, toggled via local state):
        GlobalGrapher           — 2D function grapher    (key: G)
        GlobalGrapher3D         — 3D surface grapher     (key: 3)
        GlobalGrapherJSX        — JSXGraph Pro           (key: X)
        TICalc                  — TI-style calculator    (key: C)
        Scratchpad              — free-form notes panel  (key: S)
        GlobalPythonNotebook    — Python REPL (Pyodide)  (key: P)
        GlobalJSPlayground      — JS playground          (key: J)
        FloatingVideoPlayer     — curated video player   (key: V)
        PinsPanel               — saved viz pins (PinsContext)
        SearchModal             — full-text search (Cmd+K)
        WelcomeModal            — first-visit onboarding
```

**Tool mount behavior**: `GlobalGrapher`, `GlobalGrapher3D`, and `GlobalGrapherJSX` are always mounted and receive an `isOpen` prop (so the grapher preserves its graph state when minimized). `TICalc` is only mounted while `calcOpen` is true. `FloatingVideoPlayer` is always mounted but returns `null` when closed/minimized. All others use conditional rendering.

**Z-index stack** (highest wins):
- `z-[400]` — `CoursesDropdown` panel
- `z-[300]` — Tool panel modals (SearchModal, welcome overlay)
- `z-[200]` — Other floating panels
- `z-[60]` — TopBar `<header>` (must be above sidebar so dropdown renders on top)
- `z-50` — Sidebar
- `z-[10001]` — Scroll progress bar in `LessonPage`

---

## 4. Content System

```
src/content/index.js      ← assembles everything
src/content/courses.js    ← course registry (metadata only, no lessons)
```

### How `content/index.js` works

```js
// For each course it does:
import ch1 from './chapter-1'    // could be a single object OR an array
const CURRICULUM = [ch1, ch2, ...]

// Then builds the flat lookup map:
LESSON_MAP['chapter-1/introduction'] = lessonObject
```

Courses are imported from their `index.js` file, which either exports a **single chapter object** or an **array of chapter objects** (see Section 6 for details). `content/index.js` handles both by normalizing them into a flat array.

### Course inventory

| Course folder | Curriculum subject | Chapter format | Lesson schema |
|---|---|---|---|
| `chapter-0/` | Pre-calculus review | Single object | Schema A |
| `chapter-1/` through `chapter-6/` | Calculus Vol. 1 | Single object each | Schema A |
| `discrete-math/` | Discrete Mathematics | Single object | Schema A |
| `geometry-1/` through `geometry-6/` | Geometry (Books 1–6) | Single object each | Schema A |
| `linear-algebra/` | Linear Algebra | Single object | Schema A |
| `physics-1/` | Physics: Vectors & Kinematics | Single object | Schema A |
| `precalc/` through `precalc-5/` | Pre-Calculus series | Single object each | Schema A |
| `python-1/` | Python Programming | Array of chapters | Schema B |
| `web-1/` | Web Development | Array of chapters | Schema C |
| `javascript-1/` | JavaScript Core | Array of chapters | Schema D |
| `tetris-1/` | Build Tetris (JS/Web curriculum) | Array of chapters | Schema D |
| `data-science/` | Data Science | Single object | Schema A |
| `math-1/` | Math 1 | Single object | Schema A |
| `chemistry-1/` | Chemistry | Array of chapters | **Schema E** |
| `digital-fundamentals/` | Digital Fundamentals | Array of chapters | **Schema E** |
| `proofs/` | (Proof data, not a course — used by Reference) | n/a | n/a |

**Chapter number convention:**
- Calculus (`chapter-0` through `chapter-6`): integer `number` fields (`0`, `1`, … `6`)
- All other courses: string `number` fields matching `'coursekey.N'` pattern, e.g. `'chem.1'`, `'df.1'`, `'geo.1'`, `'py.1'`

---

## 5. Lesson Schemas (4 variants)

Every lesson is a JS file that `export default`s an object. There are **four distinct schemas** in use. When contributing, pick the schema that matches the course you're adding to.

---

### Schema A — Full MicroCycle (Calc, Discrete, Geometry, Physics, Linear Algebra, Precalc)

The richest schema. Supports all sections the renderer knows about.

```js
export default {
  // ── Identity ──────────────────────────────────────────────
  id:       'ch1-limits-intro',     // unique, no spaces
  slug:     'introduction',         // URL segment (must match chapter index)
  chapter:  'chapter-1',            // must match chapter's id field
  order:    1,                      // position in chapter
  title:    'Introduction to Limits',
  subtitle: 'What does "approaching" mean?',
  tags:     ['limits', 'calculus'],
  aliases:  ['limits intro'],       // for search

  // ── Semantics (optional cheat-sheet for this lesson) ──────
  semantics: {
    core: [{ symbol: 'lim', meaning: 'the value a function approaches' }],
    rulesOfThumb: ['Never substitute 0/0 directly'],
  },

  // ── Hook (attention-grabber section) ──────────────────────
  hook: {
    question: 'Can you get infinitely close without arriving?',
    realWorldContext: 'Think about GPS approaching a location...',
    previewVisualizationId: 'LimitApproach',  // viz shown in banner
    visualizations: [
      { id: 'LimitApproach', title: '...', props: {} }
    ],
  },

  // ── Intuition (main conceptual section) ───────────────────
  intuition: {
    prose: ['Paragraph text. Use $inline math$ and **bold**.'],
    callouts: [{ type: 'insight', title: 'Key idea', body: '...' }],
    visualizations: [
      { id: 'LimitApproach', title: '...', props: {} }
    ],
    // OR use blocks format (newer):
    blocks: [
      { type: 'prose', content: '...' },
      { type: 'callout', calloutType: 'insight', title: '...', body: '...' },
      { type: 'viz', id: 'LimitApproach', title: '...', props: {} },
    ],
    perspectives: [],     // alternate mental models
    failureModes: [],     // common wrong intuitions
    semantics: {},        // inline semantics callout
    localLinearity: null, // special calculus concept block
    alternate: null,
  },

  // ── Math (formal mechanics section) ───────────────────────
  math: {
    prose: [],
    callouts: [],
    visualizations: [],
    processDefinition: [],  // step-by-step procedure
    blocks: [],
  },

  // ── Rigor (proof section) ─────────────────────────────────
  rigor: {
    prose: [],
    callouts: [],
    proofSteps: [],        // [{id, tag, instruction, math, note, why:{...}}]
    visualizationId: 'EpsilonDelta',
    visualizationProps: {},
  },

  // ── Practice (examples + challenges) ──────────────────────
  practice: {
    examples: [
      { id: 'ex1', title: '...', problem: '...', steps: [], answer: '...' }
    ],
    challenges: [
      { id: 'c1', title: '...', problem: '...', answer: '...' }
    ],
  },

  // ── Spiral (forward/backward links) ───────────────────────
  spiral: {
    recoveryPoints: ['limits-review'],
    futureLinks: ['derivatives'],
  },

  // ── Assessment (mastery check — inline with lesson) ───────
  assessment: {
    questions: [
      { id: 'q1', type: 'choice', question: '...', choices: [], answer: 'B', hints: [] },
      { id: 'q2', type: 'input',  question: '...', answer: '3/2', hints: [] },
    ],
  },

  // ── Top-level shortcuts (flat alternatives to practice{}) ─
  examples: [],
  challenges: [],
  triggers: [],

  // ── Cross-references ──────────────────────────────────────
  crossRefs: ['related-lesson-slug'],

  // ── Mental model callouts ─────────────────────────────────
  mentalModel: ['Think of limits as zoom-and-measure'],

  // ── Quiz (end-of-lesson — shown by LessonQuizBlock) ───────
  checkpoints: ['read-intuition'],  // IDs that count toward "lesson complete"
  quiz: [
    { type: 'choice', question: '...', choices: [], answer: 'A', hints: [] },
    { type: 'input',  question: '...', answer: '4', hints: [] },
  ],
}
```

**callout types**: `insight` | `warning` | `definition` | `example` | `bridge` | `proof` | `formula`

---

### Schema B — Python Notebook (python-1 course)

Simpler. Just a hook + an intuition section with a single `PythonNotebook` viz.

```js
export default {
  id:       'py1-variables',
  slug:     'variables-and-types',
  chapter:  'python-1-chapter-1',  // matches chapter id in python-1/index.js
  order:    1,
  title:    'Variables and Types',
  subtitle: 'How Python stores information',
  tags:     ['python', 'variables'],

  hook: {
    question: 'What is a variable really?',
    realWorldContext: '...',
    previewVisualizationId: 'PythonNotebook',
  },

  intuition: {
    prose: ['...'],
    callouts: [],
    visualizations: [
      {
        id: 'PythonNotebook',
        title: 'Interactive Python Lesson',
        mathBridge: '...',
        caption: '...',
        props: {
          initialCells: [
            {
              id: 'cell-1',
              cellTitle: 'What is a variable?',
              prose: 'Explanation text shown above the code.',
              code: 'x = 5\nprint(x)',
              output: '',
              status: 'idle',
              figureJson: null,       // optional: { type, data, layout } for Plotly
            },
          ],
        },
      },
    ],
  },

  checkpoints: ['read-intuition'],
  quiz: [],
}
```

---

### Schema C — Web Development (web-1 course)

Uses one or more named viz components + optionally a `JSNotebook` at the end.

```js
export default {
  id:       'w1-dom-intro',
  slug:     'dom-introduction',
  chapter:  'web-1-ch1',
  order:    1,
  title:    'The DOM',
  subtitle: 'How browsers think about your page',
  tags:     ['web', 'html', 'dom'],

  hook: {
    question: 'What does a browser see when it reads HTML?',
    realWorldContext: '...',
    previewVisualizationId: 'WebLesson01_DOMTree',
  },

  intuition: {
    prose: [],
    callouts: [],
    visualizations: [
      { id: 'WebLesson01_DOMTree', title: 'DOM Tree Explorer', caption: '...', mathBridge: '...' },
      {
        id: 'JSNotebook',
        title: 'Build It Yourself',
        caption: '...',
        props: {
          lesson: {
            title: 'DOM Basics',
            subtitle: '...',
            sequential: true,
            cells: [
              { type: 'markdown', instruction: 'Read this...', html: '<p>...</p>', css: '', startCode: '', outputHeight: 200 },
              { type: 'js',       instruction: 'Try it...',    html: '<div id="app"></div>', css: '', startCode: 'document.getElementById("app").textContent = "Hello"', outputHeight: 100 },
              { type: 'challenge', check: (doc) => !!doc.querySelector('h1'), solutionCode: '...', successMessage: 'Great!', failMessage: 'Not yet...' },
            ],
          },
        },
      },
    ],
  },

  checkpoints: ['read-intuition'],
  quiz: [],
}
```

---

### Schema E — ScienceNotebook (chemistry-1, digital-fundamentals)

Used for concept-first, no-math courses where every lesson is a sequential visual notebook — no symbolic math entry, no proof steps, no quiz with mathjs grading. The lesson data is a flat `cells` array.

Each lesson file has **two exports**:
- A named `export const LESSON_XY_N_N` — the notebook data object, imported by the lesson's wrapper viz component
- A default export — the metadata object used by the chapter index and `LESSON_MAP`

```js
// Part 1 — notebook data (named export)
export const LESSON_CHEM_1_0 = {
  title:     'Why Chemistry?',
  subtitle:  'Every question about the physical world is a chemistry question.',
  sequential: true,   // each cell unlocks after the previous one is completed
  cells: [
    // markdown cell — prose only
    { type: 'markdown', instruction: 'Text here. Supports **bold** and _italic_.' },

    // visual cell — canvas/HTML demo, auto-runs on mount in a sandboxed iframe
    { type: 'js', instruction: 'Prose above the demo.', html: '<div id="app"></div>', css: '', startCode: '/* vanilla JS */', outputHeight: 320 },

    // challenge cell — multiple choice, no code evaluation
    {
      type: 'challenge',
      instruction: 'The question.',
      options: [
        { label: 'A', text: 'First choice' },
        { label: 'B', text: 'Correct choice' },
      ],
      check: (label) => label === 'B',
      successMessage: 'Correct! Because...',
      failMessage: 'Not quite. Think about...',
    },
  ],
}

// Part 2 — metadata (default export, used by chapter index)
export default {
  id:    'chem-1-0-why-chemistry',
  slug:  'why-chemistry',
  chapter: 'chem.1',          // string, not a number
  order: 0,
  title: 'Why Chemistry?',
  subtitle: 'Every question about the physical world is a chemistry question.',
  previewVisualizationId: 'WhyChemistry',  // the wrapper viz ID
  intuition: {
    visualizations: [{ id: 'WhyChemistry', title: 'Why Chemistry?' }],
  },
}
```

**Wrapper viz component** — required for each lesson:

Because `VizFrame` passes `params` (not a `lesson` object) to viz components, each ScienceNotebook lesson needs a thin wrapper that self-imports its own data:

```js
// src/components/viz/react/WhyChemistry.jsx
import ScienceNotebook from './ScienceNotebook.jsx'
import { LESSON_CHEM_1_0 } from '../../../content/chemistry-1/lesson1-0.js'

export default function WhyChemistry({ params }) {
  return <ScienceNotebook lesson={LESSON_CHEM_1_0} params={params} />
}
```

Registered in `VizFrame.jsx`:
```js
WhyChemistry: lazy(() => import('./react/WhyChemistry.jsx')),
```

**Never point two different lessons at the same wrapper ID.** Each lesson must have its own wrapper file and its own unique `VIZ_REGISTRY` key.

**Current Schema E lessons and their wrapper IDs:**

| Lesson file | Named export | Wrapper component | VIZ_REGISTRY key |
|---|---|---|---|
| `chemistry-1/lesson1-0.js` | `LESSON_CHEM_1_0` | `WhyChemistry.jsx` | `WhyChemistry` |
| `chemistry-1/lesson1-1.js` | `LESSON_CHEM_1_1` | `WhatIsAnAtom.jsx` | `WhatIsAnAtom` |
| `digital-fundamentals/lesson1-0.js` | `LESSON_DF_1_0` | `AnalogVsDigital.jsx` | `AnalogVsDigital` |
| `digital-fundamentals/lesson1-1.js` | `LESSON_DF_1_1` | `BinaryAndWaveforms.jsx` | `BinaryAndWaveforms` |

---

### Schema D — JavaScript-1 (two-part file)

Split into a `LESSON_DATA` constant + a metadata `export default`. This keeps the notebook data readable without nesting it inside a deeply indented object.

```js
// Part 1 — the notebook data
const LESSON_JS_CORE_1_1 = {
  title:      'Expressions vs Statements',
  subtitle:   '...',
  sequential: true,    // cells must be completed in order
  cells: [
    // markdown cell — explanation only (not runnable)
    { type: 'markdown', instruction: 'In JS, everything is either an expression or a statement...', html: '', css: '', startCode: '', outputHeight: 0 },
    // js cell — editable code, runs in sandboxed iframe
    { type: 'js', instruction: 'Evaluate an expression:', html: '', css: '', startCode: 'console.log(2 + 2)', outputHeight: 60 },
    // challenge cell — user must satisfy check function
    {
      type: 'challenge',
      instruction: 'Create a variable called x that holds 42.',
      check: (iframe) => iframe.contentWindow.x === 42,
      solutionCode: 'const x = 42',
      successMessage: 'Exactly right!',
      failMessage: 'Try again — x should be 42.',
    },
  ],
}

// Part 2 — metadata wrapper
export default {
  id:          'j1-expressions-statements',
  slug:        'expressions-statements',
  number:      '1.1',
  chapter:     'JavaScript 1',
  title:       'Expressions vs Statements',
  description: '...',
  tags:        ['javascript', 'expressions'],
  intuition: {
    prose: ['...'],
    callouts: [],
    visualizations: [
      { id: 'JSNotebook', props: { lesson: LESSON_JS_CORE_1_1 } }
    ],
  },
  mentalModel: ['...'],
  checkpoints:  ['read-intuition'],
  quiz: [],
}
```

---

## 6. Chapter Index Formats (3 variants)

Always check which format the course you're adding to uses before writing a new chapter index.

### Format 1 — Single chapter object (most courses)

```js
// src/content/chapter-1/index.js
import intro from './00-intro-limits.js'
import limits from './01-limit-laws.js'

export default {
  id:          'chapter-1',
  number:      '1',
  title:       'Limits & Continuity',
  slug:        'chapter-1',
  description: '...',
  color:       'cyan',    // Tailwind color name, used for chapter card accent
  lessons:     [intro, limits],
}
```

### Format 2 — Array of chapter objects (python-1, web-1)

```js
// src/content/python-1/index.js
import lesson1 from './lesson1.js'

const CHAPTER_1 = {
  id:      'python-1-chapter-1',
  number:  1,
  title:   'Python Foundations',
  course:  'python-1',
  lessons: [lesson1],
}

export default [CHAPTER_1, CHAPTER_2, ...]
```

### Format 3 — Array with string `number` (javascript-1)

Same as Format 2 but `number` is a string like `'js0.1'`:

```js
const J1 = { id: 'js1', number: 'js0.1', title: 'JavaScript Core 1', lessons: [...] }
export default [J1, J2]
```

---

## 7. Lesson Renderer Pipeline

```
URL: #/chapter/chapter-1/introduction
         │
         ▼
   LessonPage.jsx
         │
         ├── looks up: LESSON_MAP['chapter-1/introduction']
         ├── calls: enhanceLessonForUnifiedLearning(rawLesson)
         │     └── unifiedLessonEnhancer.js:
         │           • injects realWorldContext callout (if lesson has hook.realWorldContext)
         │           • injects topicMissionPack (challenge callouts per topic)
         │           • injects connectorCallouts (cross-lesson bridges)
         │           • filters out legacy video embed blocks
         │
         ├── renders: HookBanner (hook.question + hook.realWorldContext)
         │
         ├── renders: MicroCycleLesson (all sections in fixed order)
         │     ├── IntuitionBlock       → lesson.intuition
         │     ├── mentalModel box      → lesson.mentalModel[]
         │     ├── MathBlock            → lesson.math    (collapsible, STARTS OPEN)
         │     ├── RigorBlock           → lesson.rigor   (collapsible, starts closed)
         │     ├── UnifiedLearningDock  → only when lesson.showLearningDock === true OR lesson has structured examples
         │     ├── PracticeBlock        → lesson.examples / lesson.challenges / lesson.triggers
         │     ├── SpiralBlock          → lesson.spiral  (after Practice, capstone position)
         │     ├── AssessmentBlock      → lesson.assessment  (ungraded "Understanding Check")
         │     └── supplementalVisualizations → lesson.supplementalVisualizations[]
         │
         ├── renders: LessonQuizBlock (lesson.quiz — end-of-lesson quiz, mathjs eval)
         │
         ├── renders: CrossRef (lesson.crossRefs)
         │
         └── renders: prev/next navigation
```

### Two content formats inside sections

Sections like `intuition` and `math` accept two formats:

**Blocks format (recommended)**:
```js
intuition: {
  blocks: [
    { type: 'prose',   content: 'text with $math$ and **bold**' },
    { type: 'callout', calloutType: 'insight', title: '...', body: '...' },
    { type: 'viz',     id: 'LimitApproach', title: '...', props: {} },
  ],
}
```

**Legacy flat format (still works)**:
```js
intuition: {
  prose:          ['paragraph 1', 'paragraph 2'],
  callouts:       [{ type: 'insight', title: '...', body: '...' }],
  visualizations: [{ id: 'LimitApproach', title: '...', props: {} }],
}
```

Both formats render identically. New contributions should prefer `blocks`.

---

## 8. Viz System

### VizFrame.jsx — the single dispatch point

Every visualization in a lesson goes through `VizFrame`:

```jsx
<VizFrame id="LimitApproach" initialProps={{ showGrid: true }} title="..." />
```

`VizFrame` looks up `id` in `VIZ_REGISTRY` (a plain key→`lazy()` object at the top of the file). If found, it wraps the component in `<Suspense>` with a skeleton fallback. If not found, it renders a "visualization not found" message. Components are pinnable (saved to PinsContext for floating popout).

### VIZ_REGISTRY — the full menu

The registry lives entirely in `src/components/viz/VizFrame.jsx`. To add a new viz component, you add one line to this file:

```js
MyNewViz: lazy(() => import('./react/MyNewViz.jsx')),
```

Then reference `'MyNewViz'` in any lesson's `visualizations` or `blocks` array.

### Viz subdirectories

| Folder | Technology | Best for |
|---|---|---|
| `viz/react/` | React + inline SVG/CSS | UI-heavy labs, step-by-step proofs, interactive panels |
| `viz/d3/` | D3.js + SVG | Animated graphs, function plotters, geometry |
| `viz/three/` | Three.js | 3D surfaces, graph networks |
| `viz/matter/` | Matter.js | Physics simulations (blocks, springs, pendulums) |
| `viz/geometry/` | React | Geometry Book viz components (G1_*, G2_*, etc.) |
| `viz/ch2/` | React | Physics Chapter 2 kinematics viz |

### Viz component contract

Every viz component receives `props` (the `initialProps` from the lesson data) and should:

1. Import `useState` / `useEffect` from React (don't import from anywhere else)
2. Implement `useColors()` locally — a standard 15-line hook that watches for dark mode changes via `MutationObserver`. Copy it verbatim from `incomplete ideas/vizTutorial/TEMPLATE_canvas.jsx`.
3. Accept a `params` prop (the lesson's `props` field) to allow lessons to configure the component
4. Not import from `src/context/` — viz components are self-contained

**Minimal viz shell**:

```jsx
import { useState, useEffect } from 'react'

function useColors() {
  const isDark = () =>
    typeof document !== 'undefined' &&
    document.documentElement.classList.contains('dark')
  const [dark, setDark] = useState(isDark)
  useEffect(() => {
    const obs = new MutationObserver(() => setDark(isDark()))
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })
    return () => obs.disconnect()
  }, [])
  return {
    bg: dark ? '#0f172a' : '#f8fafc',
    surface: dark ? '#1e293b' : '#ffffff',
    text: dark ? '#e2e8f0' : '#1e293b',
    muted: dark ? '#94a3b8' : '#64748b',
    // ... (see full list in TEMPLATE_canvas.jsx)
  }
}

export default function MyNewViz({ params = {} }) {
  const C = useColors()
  return (
    <div style={{ maxWidth: 740, padding: '0.5rem 0' }}>
      <p style={{ color: C.text }}>Your viz here</p>
    </div>
  )
}
```

Register it: add `MyNewViz: lazy(() => import('./react/MyNewViz.jsx'))` to `VizFrame.jsx`.  
Reference it: use `{ id: 'MyNewViz', title: '...', props: {} }` in a lesson file.

---

## 9. Reference System

The reference page at `#/reference` has **three independent data layers**:

### Layer 1 — Formula cards (`src/content/reference-data.js`)

The simplest data format in the whole codebase. Just plain objects:

```js
// src/content/reference-data.js
export const REFERENCE_CATEGORIES = [
  {
    id: 'algebra',
    label: 'Algebra',
    color: 'blue',    // maps to COLOR_CLASSES in ReferencePage.jsx
    entries: [
      {
        id: 'quadratic-formula',    // must be unique across all categories
        name: 'Quadratic Formula',
        latex: 'x = \\dfrac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}',
        note: 'Use when factoring fails.',   // optional one-liner
      },
    ],
  },
]
```

Available categories (in order): `algebra`, `geometry`, `trig`, `limits`, `derivatives`, `integrals`, `series`  
Available colors for categories: `blue`, `violet`, `rose`, `cyan`, `orange`, `emerald`, `rose`

Adding a formula = add one object to the correct `entries` array. No other files need changing.

### Layer 2 — Proofs (`src/content/proofs/`)

Each proof is keyed by the same `id` as the reference entry. If a proof exists, the formula card gets a highlighted border and opens a `ProofModal` on click.

```
src/content/proofs/
  index.js         ← merges all PROOFS into one export
  derivatives.js   ← DERIVATIVE_PROOFS
  limits.js        ← LIMIT_PROOFS
  integrals.js     ← INTEGRAL_PROOFS
  algebra.js       ← ALGEBRA_PROOFS
  geometry.js      ← GEOMETRY_PROOFS
  trig.js          ← TRIG_PROOFS
  series.js        ← SERIES_PROOFS
```

Proof schema:

```js
export const MY_PROOFS = {
  'quadratic-formula': {
    title:    'The Quadratic Formula',
    subtitle: 'Why does it work?',
    category: 'Algebra',
    problem:  'ax^2 + bx + c = 0 \\implies x = \\dfrac{-b \\pm \\sqrt{b^2-4ac}}{2a}',
    preamble: 'We derive it by completing the square...',
    steps: [
      {
        id: 1,
        tag: 'Setup',
        tagStyle: { bg: '#f0fdf4', text: '#166534', border: '#bbf7d0' },
        instruction: 'Divide everything by a.',
        math: 'x^2 + \\frac{b}{a}x + \\frac{c}{a} = 0',
        note: 'Assuming a ≠ 0.',
        why: {               // optional — recursive drill-down panel
          tag: 'Why divide by a?',
          explanation: '...',
          steps: [{ text: '...' }],
          why: null,         // can nest infinitely
        },
      },
    ],
  },
}
```

To add a proof:
1. Add the entry to the correct proof file (e.g., `algebra.js`)
2. The entry key must match the `id` in `reference-data.js`
3. The proof auto-appears — no other file changes needed

### Layer 3 — Algebra cheat-sheet (`src/content/algebraRegistry.js`)

A flat dictionary of algebra prerequisite topics used as **inline popover tooltips** inside lesson prose. Currently used in: `chapter-0/01b-algebraic-techniques.js`, `chapter-1/03-epsilon-delta.js`, `chapter-1/04a-visual-epsilon-delta.js`, `chapter-2/02-chain-rule.js`.

**Entry shape:**
```js
'topic-id': {
  name: 'Human-Readable Name',
  formula: 'a^2 - b^2 = (a-b)(a+b)',  // KaTeX — escape backslashes in JS: \\frac
  example: 'x^2 - 9 = (x-3)(x+3)',    // KaTeX
  description: 'Plain English explanation.',
  chapterZeroSlug: 'algebraic-techniques',  // slug for "review it" deep-link
}
```

**Trigger syntax in prose strings:**
```js
"Use {{algebra:difference-of-squares|difference of squares}} to factor."
```
`parseProse.jsx` detects `{{algebra:topicId|link text}}` and renders `<AlgebraMicroLesson topicId="...">`. The component looks up the ID in `ALGEBRA_REGISTRY` and shows a popover card with formula, example, description, and a Chapter 0 deep-link. The link text is rendered as KaTeX. If the ID is missing from the registry, it renders as a plain underlined span (no crash).

**Not connected to the Reference page** — this is separate from formula cards and proofs.

---

## 10. Progress System

Progress is stored in `localStorage` under the key `oc-progress`.

**Data shape**:
```js
{
  "chapter-1/introduction": {
    completedCheckpoints: ["read-intuition"],
    activeTab: "intuition",
    readingProgress: 87,    // percent scrolled
    quiz: {
      score: 3,
      total: 4,
      answers: { 0: true, 1: false, ... }
    }
  }
}
```

**How "lesson complete" works**:
- A lesson is complete when `completedCheckpoints.length >= lesson.checkpoints.length`
- Most lessons have only `checkpoints: ['read-intuition']`
- `markCheckpoint(lessonId, 'read-intuition')` fires in `LessonPage` once the user has scrolled ≥ 60% of the page — it does **not** fire on mount
- Lessons with a quiz can add `checkpoints: ['read-intuition', 'quiz-passed']` to require quiz completion; `LessonQuizBlock` would need to call `markCheckpoint` on pass (not yet wired)
- Progress is shown in the sidebar, chapter page, and lesson prev/next nav
- The `checkpoints?.length ?? 1` fallback in `HomePage` means lessons without an explicit `checkpoints` array need only 1 completion to show as complete on the home page

**`useProgress()` hook** (from `hooks/useProgress.js`) exposes:
- `markCheckpoint(lessonId, checkpointId)` — call when a section is reached
- `saveQuizResult(lessonId, score, total, answers)`
- `getProgress(lessonId)` → `{ completedCheckpoints, quiz, ... }`
- `isComplete(lessonId)` → boolean

---

## 11. Interactive Runtimes

### JSNotebook (`src/components/viz/react/JSNotebook.jsx`)

- **Input**: `props.lesson` — a `{ title, subtitle, sequential, cells[] }` object
- **Runtime**: Monaco editor + sandboxed `<iframe>` (no external network access)
- **Cell types**:
  - `'markdown'` — raw HTML description, not runnable
  - `'js'` — editable JS code, runs in the iframe, can manipulate DOM (via `html`/`css` fields)
  - `'challenge'` — code cell with a `check(iframeDoc)` function; user passes when `check` returns truthy
- **Sequential mode**: cells unlock one at a time; user must pass each before moving on
- The iframe has a small built-in console that captures `console.log` output

### PythonNotebook (`src/components/viz/react/PythonNotebook.jsx`)

- **Input**: `props.initialCells` array
- **Runtime**: Pyodide WASM (runs full CPython in the browser, no server)
- **Cell type**: each cell has `prose` (shown above), `code` (editable), `output` (shown below)
- **`opencalc` library**: a custom mini-library embedded as a string constant in `PythonNotebook.jsx`. Provides `opencalc.figure(type, data, layout)` for Plotly-style figure output, saved as `figureJson` on the cell
- Cells are independent — each can be re-run without affecting others
- `figureJson` is persisted to reduce re-computation; clicking "Run" re-evaluates and updates it

---

## 12. Tools Panel System

All tools are accessible from the top bar on any page. Each is a floating panel that can be moved (drag) and resized.

| Tool | Kbd | Component | What it does |
|---|---|---|---|
| 2D Grapher | G | `GlobalGrapher.jsx` | 2D function plotter (Desmos-style, no external API) |
| 3D Grapher | 3 | `GlobalGrapher3D.jsx` | 3D surface + parametric plotter |
| JSXGraph Pro | X | `GlobalGrapherJSX.jsx` | Custom expression + construction grapher |
| TI Calc | C | `TICalc.jsx` | TI-84-style calculator: arithmetic, trig, log, memory |
| Scratchpad | S | `ScratchPad.jsx` | Free-text notes, persisted in localStorage |
| Python | P | `GlobalPythonNotebook.jsx` | Full REPL, same Pyodide runtime as lesson notebooks |
| JS Playground | J | `GlobalJSPlayground.jsx` | Monaco + sandboxed iframe, no lesson structure |
| Video Player | V | `FloatingVideoPlayer.jsx` | Curated per-lesson YouTube playlist, drag+resize, always mounted |

---

## 13. Video System

The video system uses a three-tier priority chain to associate videos with lessons. No manual curation is required for new courses — tag matching handles discovery automatically.

### File Inventory

| File | Role |
|---|---|
| `src/content/videos/videoDatabase.js` | Flat dictionary of all known videos, keyed by slug |
| `src/content/videos/videoPlacementMap.js` | Manual override map: `lessonId → {section: [videoSlugs]}` |
| `src/content/videos/videoLibrary.generated.js` | Auto-generated metadata: each video entry has `tags[]` and `keywords[]` |
| `src/content/videos/videoSelector.js` | Scoring function `selectVideosByKeywords(keywords, {limit})` |
| `src/context/VideoPlayerContext.jsx` | React context holding all player state and current video selection |
| `src/components/videos/FloatingVideoPlayer.jsx` | Floating drag/resize panel; playlist browser + playback UI |

### Priority Chain

Both `VideoPlayerContext` and `FloatingVideoPlayer` resolve videos for a lesson using the same three-tier chain:

1. **Custom videos** — user-added YouTube URLs stored in localStorage (`open-calc-custom-videos`). Always shown first.
2. **Placement map** — if the lesson ID appears in `VIDEO_PLACEMENT_MAP`, those curated slugs are used. This is the hand-picked path for calc/physics lessons.
3. **Tag-based fallback** — `selectVideosByKeywords(lesson.tags, {limit})` scores every video in `videoLibrary.generated.js` by keyword overlap and returns the top N. This runs for any lesson that has a `tags[]` array and is not in the placement map. Panel section label: **"Related"**.

If none of the three tiers yields a result, `currentVideo` is `null` and the player shows an empty state.

### `videoSelector.js` Scoring

```js
// Each video in videoLibrary.generated.js is scored:
// +3  exact keyword match in video's keywords[], tags[], title, or source
// +1  partial match
// Returns top-N by descending score
export function selectVideosByKeywords(keywords, { limit = 5 } = {}) { ... }
```

To make tag-matching work for a new course, ensure `videoLibrary.generated.js` has entries with relevant `tags`/`keywords`. The lesson's own `tags: [...]` array drives discovery — no changes to `videoPlacementMap.js` needed.

### `videoDatabase.js`

A flat dictionary of all known videos:
```js
export const VIDEO_DATABASE = {
  '3b1b-essence-limits': {
    title: 'The Essence of Calculus, Chapter 1',
    url: 'https://www.youtube.com/embed/WUvTyaaNkzM',
    source: '3Blue1Brown',
  },
  // ... hundreds more
}
```
Videos are keyed by a short slug. Adding a video = one entry here, plus a matching entry in `videoLibrary.generated.js` with `tags` and `keywords`.

### `FloatingVideoPlayer.jsx`

A large floating panel built with `framer-motion` (drag + resize). Features:
- Playlist browser: navigable by course → chapter → lesson
- Per-lesson video list resolved via the three-tier priority chain above
- Custom video add (converts YouTube watch URLs to embed URLs)
- Pin tracking (saved to localStorage `open-calc-pinned-videos`)
- Video progress tracking via YouTube's postMessage API (percentage stored in `open-calc-video-progress`)
- Sidebar toggle (playlist vs. player only mode)
- Mobile responsive (sidebar collapses)

**`dynamicCourses` filter**: the playlist sidebar shows a course in the browser if any of its lessons appear in `VIDEO_PLACEMENT_MAP` OR if any lesson has a `tags[]` array (enabling tag-based discovery). Both paths qualify.

**How it is opened**: Open via the `PlayCircle` button in the TopBar or press `V`. `LessonPage` calls `setLessonId(lesson.id)` on mount so the context pre-selects the first available video for that lesson.

**`formatAsVisualization` is hardcoded to return `null`**:
```js
export function formatAsVisualization(videos, lessonId) {
  return null;   // ← early return, rest of function is dead code
}
```
Videos are never injected inline into lesson content. They are only accessible through the floating player.

### `VideoPlayerContext.jsx`

Provides: `isOpen`, `isMinimized`, `currentVideo`, `lessonId`, `searchQuery`, `openPlayer`, `closePlayer`, `toggleMinimize`, `selectVideo`, `setLessonId`, `addCustomVideo`, `pinnedVideos`, `togglePin`, `customVideos`.

State is fully in-memory (no React Reducer). `pinnedVideos` and `customVideos` are synced to localStorage on every change.

**Sync effect**: fires unconditionally on every `lessonId` change. Sets `selectedCourse` and `selectedChapter` in the floating player to match the current lesson's location. Previously had a `!selectedCourse` guard that prevented re-syncing after initial load — removed.

---

## 14. Lesson Enhancer

`src/content/enhancers/unifiedLessonEnhancer.js` runs on **every lesson load** inside `LessonPage`. It does five things:

### 1. `ensureHook` — fills in missing hook fields
If `lesson.hook.question` or `lesson.hook.realWorldContext` is empty, it fills them from `REAL_WORLD_LIBRARY` keyed by a fuzzy topic match on `lesson.title + tags`. Lessons that DO have their own hook get their fields preserved.

### 2. `addConnectorCallouts` — injects bridge callouts
Adds up to three callouts (deduplication by title):
- Into `intuition.callouts`: `"Bridge: Visual -> Formula"` (type: `insight`)
- Into `math.callouts`: `"Bridge: Formula -> Proof Logic"` (type: `strategy`)
- Into `rigor.callouts`: `"Bridge: Proof -> Real World"` (type: `real-world`)

**Guard**: each callout is only injected if the target section already has content (`sectionHasContent` checks for non-empty prose, blocks, or visualizations). Sections with no real content are skipped — this prevents phantom expandable MathBlock/RigorBlock panels from appearing on thin lessons.

### 3. `enhanceExamples` — injects strategy annotations into example steps
For every example step that has `expression` but no `strategy`, it injects:
```js
strategyTitle: 'Intent',
strategy: step.annotation ?? 'Identify the structural purpose...',
checkpoint: 'State why this move is valid before continuing.',
```
This is how the ScrubbableExample component gets its "Intent" labels.

### 4. `pickTopicMissionPack` — topic-keyed 4-card grid content
Matches lesson title/tags to one of 11 topic entries in `PLAYBOOK`. Always returns something (has `DEFAULT_PACK` fallback). The result is stored as `lesson.unifiedMissionPack` on every enhanced lesson.

**`UnifiedLearningDock` is now opt-in**: the dock only renders its 4-card mission grid when `lesson.showLearningDock === true`. The interactive annotation game (built from structured `examples[].steps[]`) still renders whenever valid examples exist, regardless of the flag. Set `showLearningDock: true` on lessons that have been written with the mission pack in mind.

### 5. `filterLegacyVideos` — strips VideoEmbed and VideoCarousel
Recursively walks the lesson object and removes any viz with id `'VideoEmbed'` or `'VideoCarousel'`. This is a cleanup step so old lessons don't render video embeds inline.

### Root cause of the **"first viz shown 2x"** bug (fixed)

`LessonPage` previously rendered `lesson.hook.previewVisualizationId` as a standalone `VizFrame` AND then also rendered `lesson.hook.visualizations[]` separately — most lessons set both to the same component. Fixed: `visualizations[]` is rendered if non-empty, otherwise fall through to `previewVisualizationId`. Never both.

Same issue existed in `IntuitionBlock`: `SectionContent` rendered viz blocks inline from `data.blocks`, and then `getSectionVizzes` re-read from `data.visualizations[]` and rendered them again. Fixed: `primaryVizzes = isBlocksFormat ? [] : getSectionVizzes(data)` — blocks-format sections skip the second pass.

---

## 15. Known Issues

Status legend: ✅ Fixed | ⚠️ Partially fixed | 🔴 Open | 🟡 Deferred / won't fix

---

### ✅ A — Hook viz double-render
`previewVisualizationId` and `hook.visualizations[0]` were often the same component. Now renders `visualizations[]` if set, otherwise `previewVisualizationId`. Never both.

### ✅ B — Intuition viz double-render
Blocks-format lessons had vizzes rendered by both `SectionContent` (from `blocks`) and `getSectionVizzes` (from `visualizations[]`). Now: if `isBlocksFormat`, `primaryVizzes = []` — the second pass is skipped.

### ✅ C — Phantom MathBlock / RigorBlock from bridge callouts
Enhancer was injecting bridge callouts into every section, even empty ones, causing those collapsible panels to appear on thin lessons containing only a single generic callout. Now guarded by `sectionHasContent()` — only injects if the section already has prose, blocks, or vizzes.

### ✅ D — UnifiedLearningDock always-on with recycled per-topic content
The dock's 4-card mission grid rendered for every lesson with the same Derivatives/Limits/etc. copy. Now opt-in: set `lesson.showLearningDock: true` to enable the mission grid. The inline annotation game still auto-renders when structured examples exist.

### ✅ E — Lesson marked complete on mount
`markCheckpoint` previously fired in a `useEffect` with no scroll guard — the lesson was "complete" before the user read a word. Now requires ≥ 60% page scroll before the checkpoint is recorded.

### ✅ F — FloatingVideoPlayer never rendered
The component existed and was fully wired to `VideoPlayerContext`, but was never imported in `AppShell`. Now always mounted. Accessible via the `PlayCircle` button in the TopBar or pressing `V`.

### ✅ G — Homepage progress `?? 3` fallback inconsistency
Lessons without a `checkpoints` field defaulted to needing 3 completions on the home page but only 1 in `LessonPage`. Changed to `?? 1` everywhere.

### ✅ H — Search silent-fails when index not built
If `public/search-index.json` is missing or fails to load, `useSearch` now builds an in-memory Fuse index from `ALL_LESSONS` as a fallback. Search always works; the fallback just lacks `content`/`assignment` weight.

---

### ✅ I — `formatAsVisualization` dead code
Function kept as a named export (imported by `unifiedLessonEnhancer.js`) but now has a top-of-file comment marking it explicitly disabled. The body still returns `null` on the first line. Decision: floating-player-only model is the current design. Restoring inline video blocks is left as future work.

### ✅ J — Two-tier quiz system (resolved)
Two distinct components now handle the two distinct purposes:

| Component | Field | Purpose | Points? |
|---|---|---|---|
| `AssessmentBlock.jsx` | `lesson.assessment` | Ungraded mid-lesson mastery check | No |
| `LessonQuizBlock.jsx` | `lesson.quiz` | Graded end-of-lesson quiz (score, mastery %) | Yes |

**Schema difference:**
- `assessment.questions[]` uses `hint: 'string'` (singular)
- `quiz[]` uses `hints: ['string', ...]` (array), mathjs-evaluated answers, star points, `markCheckpoint`

`AssessmentBlock` shows a teal "Understanding Check" header — no score tracking, no `markCheckpoint`.  
`LessonQuizBlock` shows a blue "Lesson Quiz" header — tracks correct/attempted, fires `setQuizScore`, marks `quiz-passed` checkpoint at ≥ 80%.

The `python-1` assessment questions were migrated from `correct: N` (index) to `answer: 'string'` format.  
**Answer reveal removed**: wrong answers show "Not quite — try again" / "Incorrect — try again" with a retry button.

Fixed render order: `Intuition → mentalModel → Math → Rigor → Dock → Practice → Spiral → Assessment → (end-of-lesson Quiz in LessonPage)`. Spiral now appears after Practice as a capstone, not mid-flow.

### ✅ L — Viz silent 404
In dev mode (`import.meta.env.DEV`), `VizFrame` now renders a visible amber dashed-border placeholder showing the unknown `id` and the instruction to register it in `VIZ_REGISTRY`. In production it still returns `null` silently.

### 🟡 M — Three chapter index formats
Some courses export a single chapter object, others export an array. `content/index.js` handles both, but new contributors frequently get this wrong. Standardizing to array format for all courses would eliminate the confusion (one-line wrap per course).

### ✅ P — FloatingVideoPlayer not syncing to current lesson on navigation
The `lessonId` sync effect in `FloatingVideoPlayer` had a `!selectedCourse` guard — it ran once on first load, then never again. Navigation to a new lesson left `selectedCourse`/`selectedChapter` pointing at the original lesson. A secondary `navStack` check also blocked the update when the playlist sidebar was open. Both guards removed; the effect now fires unconditionally on every `lessonId` change.

---

### ✅ N — `MobileLocationBadge` doesn't work for non-numeric chapter IDs
Fixed. For numeric chapter numbers (0–6) the badge still shows `Ch. N`. For string-based chapter numbers (`geometry-1`, `tetris.1`, etc.) it now shows the chapter title instead, using `/^\d+$/.test(String(chapter.number))`.

### ✅ O — Search index auto-rebuilds on every build
`package.json` `build` and `dev` scripts both run `node src/scripts/build-search-index.js` before Vite starts. New lessons appear in search immediately on the next `npm run dev` or `npm run build` — no manual step needed.

---

## Dev Mode (Shift+D)

Press **`Shift+D`** anywhere in the app to toggle Developer Mode on/off.

**What it does:**
- Shows an amber **VIZ** badge in the top-left corner of every visualization, displaying its exact registry ID (e.g. `RiemannSum`, `WebLesson04_Layout`)
- Outlines every viz frame with a dashed amber border so you can see where one component ends and another begins
- State persists across page refreshes (stored in `localStorage` as `oc-dev-mode`)
- Press `Shift+D` again to turn it off

**Why this exists:**  
Viz components use hardcoded inline styles and are sandboxed — you can't inspect their name from the DOM without Dev Mode. This shortcut lets you identify any component in the app without opening browser devtools, so you can look up or fix the correct file in `VizFrame.jsx`.

**Implementation:**  
- The toggle adds/removes `.dev-mode` class on `<html>` (same pattern as `.dark`)
- The badge is rendered in `VizFrame.jsx` and hidden by default via `.dev-viz-label { display: none }`
- `.dev-mode .dev-viz-label { display: flex }` makes it visible

---

## 16. Contribution Guide (Tiered)

Contributions are roughly ordered by complexity. Start at Tier 1, build up.

---

### Tier 1 — Add a reference formula (10 minutes)

**File to edit**: `src/content/reference-data.js`  
**No other files needed**

1. Find the right category array (`algebra`, `trig`, etc.)
2. Add one object:
   ```js
   { id: 'my-formula', name: 'My Formula Name', latex: 'f(x) = x^2', note: 'Optional hint.' }
   ```
3. The id must be unique across all entries (search the file for it first)
4. Done — it appears on the Reference page

---

### Tier 2 — Add a proof for an existing formula (30–60 minutes)

**File to edit**: `src/content/proofs/{category}.js`  
**`id` must match an existing entry in `reference-data.js`**

1. Write a `steps[]` array where each step has `{ id, tag, tagStyle, instruction, math, note, why? }`
2. `why` is optional but powerful — it's a recursive drill-down panel
3. Export it and merge into `PROOFS` in `proofs/index.js`
4. The formula card on the Reference page will automatically gain a highlighted border and click-to-open proof modal

See `src/content/proofs/derivatives.js` (the `deriv-def` proof) for a complete example.

---

### Tier 3 — Add content to an existing lesson (30 minutes)

**File to edit**: `src/content/{course}/{lesson}.js`

1. Find the lesson file via the chapter index
2. Add prose, a callout, or a viz to the `intuition.blocks` or `intuition.prose`/`intuition.visualizations` arrays
3. For callouts: `{ type: 'callout', calloutType: 'insight', title: '...', body: '...' }`
4. For viz: `{ type: 'viz', id: 'ExistingVizName', title: '...', props: {} }`
5. Check that the viz id exists in `VizFrame.jsx` before using it

---

### Tier 4 — Add a quiz to an existing lesson (15 minutes)

**File to edit**: `src/content/{course}/{lesson}.js`

1. Add a `quiz` array:
   ```js
   quiz: [
     { type: 'choice', question: 'What is 2+2?', choices: ['2', '4', '6', '8'], answer: '4', hints: ['Think addition.'] },
     { type: 'input',  question: 'Simplify: x²·x³', answer: 'x^5', hints: ['Add the exponents.'] },
   ]
   ```
2. `type: 'input'` uses mathjs to evaluate, so `x^5` will match `x**5`, `x^(2+3)`, etc.
3. `type: 'choice'` requires the answer to exactly match one of the `choices` strings

---

### Tier 5 — Write a new lesson (1–4 hours)

1. Identify which course and chapter this lesson belongs to
2. Check which schema the course uses (Section 5)
3. Create `src/content/{course}/{your-lesson-slug}.js` with the correct `export default {}`
4. `id` and `slug` are different: `id` is globally unique (`'ch1-my-lesson'`), `slug` is the URL segment (`'my-lesson'`)
5. `chapter` must match the `id` of the chapter in that course's `index.js`
6. Add the import + entry to the chapter's `index.js` lessons array
7. Run `npm run dev` and navigate to `#/chapter/{chapterId}/{slug}` to see it

**Validate with node before adding to the index**:
```
node --check src/content/{course}/{your-lesson-slug}.js
```

Common errors:
- Template literal with `${}` inside instruction strings — escape with `\${}` or use string concatenation
- `chapter` field doesn't match the chapter's `id` — the lesson won't appear
- Missing `export default` — the chapter index import will be `undefined`

---

### Tier 6 — Create a new React viz (2–8 hours)

1. Copy `src/components/viz/react/` any small existing component as a starting point
2. Or copy the template from `incomplete ideas/vizTutorial/TEMPLATE_canvas.jsx` (for canvas/d3-style) or `TEMPLATE_prose_only.jsx` (for UI panels)
3. Always include the standard `useColors()` hook (copy it verbatim — it watches for dark mode)
4. The component receives `params` prop (the lesson's `props` object) — use that for configuration
5. Keep all state local with `useState` / `useReducer`
6. Register in `VizFrame.jsx`: `MyNewViz: lazy(() => import('./react/MyNewViz.jsx'))`
7. Reference in a lesson: `{ id: 'MyNewViz', title: '...', props: { myParam: true } }`

**The viz is self-contained — it doesn't use app contexts, doesn't import from `content/`, doesn't use Tailwind classes.** Use inline styles with `useColors()` values.

---

### Tier 7 — Create a new course (full day+)

1. Create `src/content/{course-name}/` directory
2. Write all lesson files (Schema A, B, C, or D — pick one and be consistent)
3. Write `index.js` (Format 1 or 2 — pick one based on whether you have multiple sub-chapters)
4. Import and add to `src/content/index.js` in the `CURRICULUM` array
5. Add course metadata to `src/content/courses.js` for the home page card
6. If using new viz IDs, create the viz files and register them in `VizFrame.jsx`

---

## 17. Full File Map

```
src/
├── main.jsx                     — app entry
├── App.jsx                      — HashRouter + route table
│
├── pages/
│   ├── HomePage.jsx             — course grid
│   ├── CoursePage.jsx           — chapter list for one course
│   ├── ChapterPage.jsx          — lesson list for one chapter
│   ├── LessonPage.jsx           — main lesson renderer + prev/next
│   ├── ReferencePage.jsx        — formula cards + proof modal
│   ├── LearningPathsPage.jsx    — curated playlists
│   └── AboutPage.jsx
│
├── components/
│   ├── layout/
│   │   ├── AppShell.jsx         — top bar + sidebar + mobile nav + tool panels
│   │   ├── Sidebar.jsx
│   │   └── MobileBottomNav.jsx
│   │
│   ├── lesson/
│   │   ├── MicroCycleLesson.jsx — renders all lesson sections
│   │   ├── LessonQuizBlock.jsx  — graded end-of-lesson quiz (lesson.quiz[])
│   │   ├── AssessmentBlock.jsx  — ungraded mastery check (lesson.assessment{})
│   │   ├── ChallengeBlock.jsx
│   │   ├── UnifiedLearningDock.jsx
│   │   ├── IntuitionBlock.jsx
│   │   ├── MathBlock.jsx
│   │   ├── RigorBlock.jsx
│   │   ├── PracticeBlock.jsx
│   │   └── SpiralBlock.jsx
│   │
│   ├── viz/
│   │   ├── VizFrame.jsx         — VIZ_REGISTRY + lazy dispatch
│   │   ├── react/               — 200+ React viz components
│   │   ├── d3/                  — D3.js viz components
│   │   ├── three/               — Three.js viz components
│   │   ├── matter/              — Matter.js physics simulations
│   │   ├── geometry/            — Geometry book viz (G1-G4)
│   │   └── ch2/                 — Physics Ch2 kinematics viz
│   │
│   ├── math/
│   │   ├── parseProse.jsx       — parses $math$, **bold**, `code` in strings
│   │   ├── KatexBlock.jsx
│   │   └── KatexInline.jsx
│   │
│   ├── calculator/
│   │   └── TICalc.jsx           — TI-84-style calculator
│   │
│   ├── search/
│   │   └── SearchModal.jsx
│   │
│   ├── tools/
│   │   ├── GlobalGrapher.jsx
│   │   ├── GlobalGrapher3D.jsx
│   │   └── Scratchpad.jsx
│   │
│   ├── ui/                      — shared button, card, badge components
│   └── videos/                  — video embed + carousel
│
├── content/
│   ├── index.js                 — CURRICULUM, LESSON_MAP, ALL_LESSONS
│   ├── courses.js               — course metadata for home page
│   ├── learningPaths.js         — LEARNING_PATHS (curated playlists)
│   ├── reference-data.js        — REFERENCE_CATEGORIES, ALL_ENTRIES
│   ├── algebraRegistry.js       — algebra cheat-sheet (chapter-0 only)
│   │
│   ├── proofs/
│   │   ├── index.js             — merges all PROOFS
│   │   ├── derivatives.js
│   │   ├── limits.js
│   │   ├── integrals.js
│   │   ├── algebra.js
│   │   ├── geometry.js
│   │   ├── trig.js
│   │   └── series.js
│   │
│   ├── enhancers/
│   │   └── unifiedLessonEnhancer.js  — auto-injects context + callouts
│   │
│   ├── chapter-0/ through chapter-6/ — Calculus lessons
│   ├── geometry-1/ through geometry-6/
│   ├── precalc/ through precalc-5/
│   ├── discrete-math/
│   ├── linear-algebra/
│   ├── physics-1/
│   ├── python-1/
│   ├── web-1/
│   ├── javascript-1/
│   ├── data-science/
│   └── math-1/
│
├── context/
│   ├── ProgressContext.jsx      — lesson completion (localStorage)
│   ├── SearchContext.jsx        — search index + query state
│   ├── PinsContext.jsx          — saved pinned visualizations
│   └── VideoPlayerContext.jsx   — floating video player
│
├── hooks/
│   ├── useProgress.js
│   ├── useSearch.js
│   └── useLocalStorage.js
│
└── styles/
    └── index.css                — Tailwind base + CSS variables

incomplete ideas/
├── vizTutorial/
│   ├── buildAVizTutorial.md     — step-by-step: build the balloon viz from scratch
│   ├── TEMPLATE_canvas.jsx      — copy-paste starting point (canvas/D3 viz)
│   ├── TEMPLATE_prose_only.jsx  — copy-paste starting point (UI/info viz)
│   └── TEMPLATE_errors_and_rules.md
├── Relatedratesballoon.jsx      — example finished viz (balloon inflation)
├── JS1_Domintro.jsx             — example: DOM lesson viz
├── JSNotebook.jsx               — prototype notebook (now merged into viz/react/)
├── PythonNotebook.jsx           — prototype Python notebook
└── pythonViz/
    └── PythonNotebook.jsx       — another prototype version
```

---

*Last updated April 4, 2026. Recent changes: Tetris course; CoursesDropdown nav; course card homepage; sidebar color fallback; header z-index fix; video tag-based discovery; FloatingVideoPlayer sync fix; VizFrame dev placeholder (L); SpiralBlock reorder (K); MobileLocationBadge fix (N); formatAsVisualization annotated (I); two-tier quiz system restored — `AssessmentBlock` (ungraded) + `LessonQuizBlock` (graded), python-1 schema fixed (J ✅); mobile tools full-viewport + close buttons; TICalc/ScratchPad mobile fix; Home link in desktop nav; **CoursePage added** — all course cards now link to `/course/:key` overview showing all chapters; LessonPage breadcrumbs now show course → chapter → lesson with working links; Sidebar course detection updated for `/course/` URLs.*
