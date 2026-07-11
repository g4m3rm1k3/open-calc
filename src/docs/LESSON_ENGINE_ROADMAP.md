# UpskillOS Lesson Engine — Roadmap & Vision

**Governing contracts:**
- `src/docs/LESSON_ENGINE_CONTRACT.md` — how every individual lesson must be written
- `src/docs/SERIES_CONTRACT.md` — what a series is responsible for teaching

This document captures what we are building, why, and how every part fits together.
It is the source of truth for prioritisation, curriculum scope, and architectural decisions.

---

## Vision

The lesson engine becomes the primary vehicle for teaching everything from "what is a variable"
to "how does a production backend work" — a single, coherent, contract-governed curriculum
that scales from absolute beginner to working software engineer.

A learner should be able to arrive knowing nothing and leave able to:
- Read, write, and debug code in at least one language
- Understand how the web works end-to-end
- Work with databases
- Build and deploy a backend API
- Version-control their work with Git
- Understand the codebase and contribute to it

---

## Curriculum Map

Series are ordered by intended learning sequence within each track.
A series marked **[exists]** has content already wired in the engine.
A series marked **[borrow]** has raw material in another lab that needs adapting.
A series marked **[new]** needs to be written from scratch.

### Track 0 — Foundation (Language-Agnostic Entry)

| Series | Levels | Status | Notes |
|---|---|---|---|
| Python Fundamentals | 37 | **[exists]** | Level 0 – absolute beginner |
| JavaScript Fundamentals | 10 | **[exists]** | Pure JS, no browser |
| HTML, DOM & JavaScript | 12 | **[exists]** | Browser programming |

### Track 0b — CSS (10-series dependency graph)

CSS is not one series. It is a dependency graph of 10 focused series.
Each series in this graph has its own folder, its own `series.ts` entry, and explicit prerequisites.
CSS challenges use `getComputedStyle` to test outcomes, not implementations.

```
css-fundamentals
      │
      ├──────────────┐
      ▼              ▼
css-selectors    css-box-model
      │              │
      └──────┬───────┘
             ▼
     css-layout
             │
     ┌───────┴───────┐
     ▼               ▼
css-flexbox       css-grid
     │               │
     └───────┬───────┘
             ▼
   css-responsive
             │
     ┌───────┴────────┐
     ▼                ▼
css-animation    css-visual-design
             └──────────┘
                   ▼
          css-professional
```

| Series ID | Levels | Status | Prerequisites |
|---|---|---|---|
| css-fundamentals | ~10 | **[new]** — build first | none |
| css-selectors | ~8 | **[borrow]** css-mastery lessons 21–24 | css-fundamentals |
| css-box-model | ~8 | **[borrow]** css-mastery lessons 02, 05 | css-fundamentals |
| css-layout | ~8 | **[borrow]** css-mastery lessons 01, 04 | css-selectors, css-box-model |
| css-flexbox | ~9 | **[borrow]** css-mastery lessons 06–11 | css-layout |
| css-grid | ~8 | **[borrow]** css-mastery lessons 09–11 | css-layout |
| css-responsive | ~8 | **[borrow]** css-mastery lessons 12–16 | css-flexbox, css-grid |
| css-animation | ~8 | **[borrow]** css-mastery lessons 17–20 | css-responsive |
| css-visual-design | ~8 | **[new]** | css-animation |
| css-professional | ~8 | **[borrow]** css-mastery lessons 22–28 | css-visual-design |

### Track 1 — Typed Languages

| Series | Levels | Status | Notes |
|---|---|---|---|
| C++ Fundamentals | 8 | **[exists]** | Level 0–7 done |
| C# Fundamentals | 4 | **[exists]** | Level 0–3 done |
| Java Fundamentals | 4 | **[exists]** | Level 0–3 done |
| TypeScript Fundamentals | ~8 | **[new]** | Builds on JavaScript Fundamentals |

### Track 2 — Data

| Series | Levels | Status | Notes |
|---|---|---|---|
| Data Structures & Algorithms in Python | 11 | **[exists]** | Level 0–10 done |
| SQL Fundamentals | ~10 | **[borrow]** | backend-lab has `SqlPanel.tsx` and lessons 13 + 10 reference SQL |

### Track 3 — Backend & APIs

| Series | Levels | Status | Notes |
|---|---|---|---|
| Backend Fundamentals | ~14 | **[borrow]** | Adapt `backend-lab/lessons/01–14.md` to contract format |
| Node.js & Express | ~8 | **[new]** | Builds on JS Fundamentals + Backend Fundamentals |
| REST API Design | ~6 | **[new]** | Builds on Backend Fundamentals |
| Authentication & Security | ~6 | **[new]** | Sessions, JWT, OAuth overview |

### Track 4 — Tools & Practice

| Series | Levels | Status | Notes |
|---|---|---|---|
| Git & Version Control | ~8 | **[borrow]** | Adapt `docs/git-masterclass/GIT-LAB-01–06.md` to contract format |
| Software Engineering Practices | ~8 | **[new]** | Testing, refactoring, code review, docs, naming |

### Track 5 — Computer Science Fundamentals

| Series | Levels | Status | Notes |
|---|---|---|---|
| How Computers Work | ~6 | **[new]** | Binary, memory, CPU, OS basics |
| Computer Networking | ~8 | **[new]** | HTTP, DNS, TCP/IP, TLS, sockets |
| Operating Systems | ~8 | **[new]** | Processes, threads, file systems, scheduling |

### Track 6 — React & Modern Frontend

| Series | Levels | Status | Notes |
|---|---|---|---|
| React Fundamentals | ~10 | **[borrow]** | `react-mastery` lab exists; adapt lessons to contract |
| State Management | ~6 | **[new]** | Context, Zustand/Redux patterns |

### Track 7 — Contributor Series (Special)

| Series | Levels | Status | Notes |
|---|---|---|---|
| Contribute to UpskillOS | ~8 | **[new]** | See section below |

---

## The Contributor Series

**Goal:** A new developer with basic JavaScript/React knowledge can finish this series
and immediately submit a lesson, a series, or a lab component.

**Audience:** Exactly the people who ask "how can I help?" — eager developers who are
learning, not yet senior, who need a guided on-ramp to the codebase.

### Proposed level outline

| Level | Title | What It Teaches |
|---|---|---|
| 0 | How UpskillOS Is Structured | Repo layout, what each `src/labs/` folder is, the registry |
| 1 | Reading a Lesson File | Frontmatter, step structure, fence types, the contracts |
| 2 | Writing Your First Lesson | Applying the Lesson Engine Contract: concept step + challenge + test |
| 3 | Wiring a Series | `series.ts` entries, `LESSON_FILES` imports in `LessonEngineLab.tsx` |
| 4 | Understanding the Lesson Engine | `parser.ts`, `executor.ts`, `LessonView.tsx` — how a lesson becomes UI |
| 5 | Building a Lab Component | Lab anatomy, `registry.js`, `AppShell` routing, `onBack` prop |
| 6 | The Shared Component Layer | What lives in `src/engine/`, what is shared, how not to duplicate |
| 7 | Submitting a Contribution | Git workflow, PR checklist, what reviewers look for |

The series itself is a lesson in the engine — written to the contract, runnable examples
where applicable, reading exercises where not.

---

## Tool Integration — "Open With"

Every lesson step that involves a specific tool should offer a button to open that
tool pre-loaded with the lesson's code. This turns the lesson engine from a text+runner
into a launchpad for the whole platform.

### Which tool opens for which content

| Trigger | Opens | Condition |
|---|---|---|
| JavaScript / TypeScript with named functions | **CodeLens** | Step has JS/TS code with ≥1 function declaration |
| HTML + CSS + JavaScript together | **HTML Lab** | Step has `html` or combined fences |
| Data structure operations (array, tree, graph) | **Abstraction Visualiser** | Step has DSA code (`dsa-python` series, or Arrays/Pointers/Structs lessons) |
| SQL queries | **SQL Panel** (from backend-lab) | Step has `` ```sql `` fence |
| HTTP / API content | **Backend Lab** | Step is in Backend Fundamentals series |
| CSS layout / specificity | **CSS Mastery** | Step has CSS code |
| Git commands | *(terminal-style display for now)* | Step is in Git series |

### How it works in the lesson file

A step declares `open_with` in a comment or a new frontmatter-style block:

```md
## querySelector & the DOM Tree

<!-- open_with: html-lab -->

```html
<div id="container">...</div>
```

```

The lesson parser reads `open_with` and passes it to `LessonView`. The step renders
an "Open in HTML Lab →" button beneath the code block. Clicking it:
1. Serialises the step's code into the target lab's expected format
2. Navigates to the lab (or opens it in a side panel)
3. Pre-loads the code so the learner can experiment without copying

**Important:** The button never breaks the lesson. If the lab is unavailable, the
button is hidden. The lesson works standalone in all cases.

---

## Shared Component Strategy

The lesson engine and the standalone labs currently duplicate several things:
Monaco editor wrappers, code runner hooks, syntax highlighters, output panels.
As the lesson engine grows to cover all subjects, this duplication multiplies.

**Rule:** If two labs need the same thing, it moves to `src/engine/shared/` and
both import from there. Neither lab owns shared code.

### Candidates for shared extraction

| Component / Hook | Currently In | Needed By |
|---|---|---|
| Monaco editor wrapper (language, theme, resize) | backend-lab, lesson engine | lesson engine, contributor series, codelens |
| Python / JS / C++ runner | lesson engine executor | dsa-arrays-lab, dsa-linked-lists-lab |
| SQL runner / panel | backend-lab `SqlPanel.tsx` | lesson engine (SQL series), backend-lab |
| Output / console panel | lesson engine | backend-lab, codelens |
| DOM tree renderer | `engine/lesson/DomTreePanel.tsx` | html-lab (reuse) |
| CSS specificity panel | `engine/lesson/CssSpecificityPanel.tsx` | css-mastery (reuse) |
| Syntax highlighter | various | all series |

**Process:** When building a new series that needs a component another lab already has,
check whether it belongs in `src/engine/shared/`. If yes: move it there, update both
importers, and document the move in this file.

---

## Build Order

This is the recommended sequence, designed to ship value at each step rather than
building everything before anything works.

### Phase 1 — Core languages + CSS root (in progress)
- [x] Python Fundamentals — 37 levels done
- [x] JavaScript Fundamentals — 10 levels done
- [x] HTML, DOM & JavaScript — 12 levels done
- [x] C++ Fundamentals — 8 levels done
- [x] C# Fundamentals — 4 levels done
- [x] Java Fundamentals — 4 levels done
- [x] DSA in Python — 11 levels done
- [ ] **css-fundamentals** — 10 levels, write from scratch (no prerequisites)
- [ ] css-selectors — adapt css-mastery 21–24 after css-fundamentals done
- [ ] css-box-model — adapt css-mastery 02, 05
- [ ] css-layout — adapt css-mastery 01, 04
- [ ] css-flexbox — adapt css-mastery 06–11
- [ ] css-grid — adapt css-mastery 09–11
- [ ] css-responsive — adapt css-mastery 12–16
- [ ] css-animation — adapt css-mastery 17–20
- [ ] css-visual-design — write from scratch
- [ ] css-professional — adapt css-mastery 22–28
- [ ] TypeScript Fundamentals — new

### Phase 2 — Data and Backend
- [ ] SQL Fundamentals — borrow SqlPanel + backend-lab lesson 13
- [ ] Backend Fundamentals — adapt backend-lab lessons 01–14
- [ ] Git & Version Control — adapt git-masterclass lessons

### Phase 3 — Tool integrations
- [ ] `open_with` metadata support in parser
- [ ] HTML Lab launch button in LessonView
- [ ] CodeLens launch button in LessonView
- [ ] Abstraction Visualiser launch button in LessonView
- [ ] SQL Panel launch button in LessonView

### Phase 4 — Shared component layer
- [ ] Audit duplication across lesson engine and labs
- [ ] Extract shared pieces to `src/engine/shared/`
- [ ] Update all importers

### Phase 5 — Advanced series
- [ ] Node.js & Express
- [ ] REST API Design
- [ ] Authentication & Security
- [ ] Software Engineering Practices
- [ ] Computer Networking
- [ ] How Computers Work / OS basics
- [ ] React Fundamentals (from react-mastery)

### Phase 6 — Contributor Series
- [ ] Write all 8 levels
- [ ] Wire as a series in the engine
- [ ] Add to series list with a distinct visual treatment (different from "learn to code")

---

## CSS Series — Specific Plan

### Challenge verification

CSS challenges must test **outcomes**, not implementations. The approach:
- Each challenge step has a read-only `html` fence (the structure to style)
- The editable area is `lang: css` (the student writes CSS rules)
- The `test` fence contains JavaScript using `getComputedStyle(element).property`
- A hidden iframe injects the student's CSS + the HTML, runs the assertions, returns results via `postMessage`

This means the student can make `#box` red using `#box {}`, `.container {}`, `body * {}`, or any other valid selector — the test only cares that `getComputedStyle(document.querySelector('#box')).backgroundColor === 'rgb(255, 0, 0)'`.

### Source material

`css-mastery/lessons/` has 29 lesson objects (`css-01-normal-flow.js` through `css-29-scroll-observers.js`) in an old format. `css-fundamentals` will be written fresh (the mastery material skips fundamentals). Subsequent series adapt the mastery material to contract format.

**Keep `css-mastery` lab intact** — do not modify or delete it during adaptation.

---

## SQL Series — Specific Plan

The backend-lab already has:
- `SqlPanel.tsx` — an interactive SQL runner
- Lessons 10, 13 that cover SQL queries

The SQL Fundamentals series will be written from scratch in the lesson engine contract
format, and will render a SQL editor/runner in the lesson view when a `` ```sql `` fence
is present. The `SqlPanel` component gets extracted to `src/engine/shared/SqlRunner.tsx`
so both the backend-lab and the lesson engine use the same implementation.

Proposed SQL series levels:

| Level | Title |
|---|---|
| 0 | What is a Database? |
| 1 | SELECT and FROM |
| 2 | WHERE — Filtering Rows |
| 3 | ORDER BY and LIMIT |
| 4 | Aggregate Functions |
| 5 | GROUP BY and HAVING |
| 6 | JOINs |
| 7 | Subqueries |
| 8 | INSERT, UPDATE, DELETE |
| 9 | Schema Design — Tables, Types, Constraints |

---

## Backend Series — Specific Plan

`backend-lab/lessons/` has 14 lessons already in markdown format, written to a different
structure than the lesson engine contract. These need reformatting, not rewriting from
scratch — the conceptual content is solid.

The backend series uses the lesson engine's existing JS runner for Node.js/Express
examples. HTTP request/response demonstrations use the backend-lab's `PostmanPanel`
component, which gets extracted to `src/engine/shared/HttpClient.tsx`.

---

## Git Series — Specific Plan

`docs/git-masterclass/GIT-LAB-01–06.md` has 6 sessions covering:
What Git Is, Three Zones, Branches, Remotes, Fixing Mistakes, Team Workflows.

These are narrative-style lab sessions. Adaptation to contract format requires:
1. Breaking each session into discrete concept steps
2. Replacing narrative text with the contract's 7-point taught-means structure
3. Writing a challenge per step (Git challenges will be scenario-based: "describe
   what you would type to..." rather than runnable code)

---

## Contributor Series — CSS Integration

CSS belongs in both the main CSS series AND the contributor series, but for different reasons:

- **CSS Fundamentals series** — teaches CSS as a language skill (layout, specificity, animation)
- **Contributor series Level 5** — teaches how to build a lab component *using* CSS/Tailwind,
  how theming works in the codebase, and how to apply `ui.bg0`, `ui.txt1` etc.

These are separate lessons. The contributor series does not duplicate the CSS series
but references it: "If you haven't done CSS Fundamentals, do that first."

---

## What Not to Do

- **Do not duplicate** a working lab component to put it in the lesson engine.
  Extract it to shared, import it in both places.
- **Do not break** existing lab routes when adapting their lessons.
  The lesson engine gets the adapted content; the original lab stays untouched.
- **Do not write** a series that relies on knowledge from an undeclared prerequisite.
  Every cross-series dependency must be explicit in the series description.
- **Do not start** a new series before the previous phase is verified and wired.
- **Do not merge** to main until the series is verified end-to-end in the engine.

---

## Files Referenced

| File | Purpose |
|---|---|
| `src/docs/LESSON_ENGINE_CONTRACT.md` | Per-lesson writing rules |
| `src/docs/SERIES_CONTRACT.md` | Per-series completeness rules |
| `src/docs/LESSON_ENGINE_ROADMAP.md` | This file — curriculum plan and architecture |
| `src/labs/lesson-engine/series.ts` | Series registry |
| `src/labs/lesson-engine/LessonEngineLab.tsx` | Import map + lesson file registry |
| `src/engine/lesson/LessonView.tsx` | Lesson renderer, tab system, tool integration hooks |
| `src/engine/lesson/parser.ts` | Markdown → ParsedLesson |
| `src/engine/lesson/executor.ts` | Code runner dispatch |
| `src/labs/backend-lab/SqlPanel.tsx` | SQL runner — candidate for shared extraction |
| `src/labs/backend-lab/PostmanPanel.tsx` | HTTP client — candidate for shared extraction |
| `src/labs/css-mastery/lessons/` | Raw CSS lesson content — adapt to contract |
| `src/labs/backend-lab/lessons/` | Raw backend lesson content — adapt to contract |
| `src/docs/git-masterclass/` | Raw Git lesson content — adapt to contract |
