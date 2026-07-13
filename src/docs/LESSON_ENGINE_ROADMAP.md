# UpskillOS Lesson Engine — Roadmap & Vision

**Governing contract:**
- `src/docs/UPSKILLOS_CURRICULUM_CONTRACT.md` — how a topic becomes a series becomes a
  lesson, and what the engine can currently grade. This roadmap is project status and
  build order, not pedagogy — it changes as work ships; the contract does not.

This document captures what we are building, why, and how every part fits together.
It is the source of truth for prioritisation, curriculum scope, and architectural decisions.

**Curriculum Map accuracy:** the table below is generated from `series.ts` — as of this
update, 44 series / 338 lesson levels exist. Regenerate it whenever series.ts changes
significantly; a stale curriculum map here previously caused ~19 shipped series to go
unlisted for an extended period.

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

Generated from `series.ts` (44 series, 338 lesson levels, all **[shipped]** — wired into
`series.ts` and imported in `LessonEngineLab.tsx`). Series are grouped by track for
readability; the grouping is informational, not a build dependency beyond what each
series' own description states as a prerequisite.

**Known issue:** `content/vue-fundamentals/` has 4 lessons written but is **not**
registered in `series.ts` — unreachable in the running app. The JSX/Vue test harness
(`runJSXTests` in `testRunner.ts`) already supports it; wiring it up is a queued fix.

### Track 0 — Foundation (Language-Agnostic Entry)

| Series | Levels | Notes |
|---|---|---|
| Python Fundamentals | 37 | Level 0 – absolute beginner |
| JavaScript Fundamentals | 10 | Pure JS, no browser |
| HTML, DOM & JavaScript | 12 | Browser programming |

### Track 0b — CSS (10-series dependency graph)

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

| Series | Levels |
|---|---|
| css-fundamentals | 10 |
| css-selectors | 8 |
| css-box-model | 8 |
| css-layout | 8 |
| css-flexbox | 9 |
| css-grid | 8 |
| css-responsive | 8 |
| css-animation | 7 |
| css-visual-design | 8 |
| css-professional | 8 |

### Track 1 — Typed Languages

| Series | Levels |
|---|---|
| C++ Fundamentals | 8 |
| C# Fundamentals | 4 |
| Java Fundamentals | 4 |
| TypeScript Fundamentals | 8 |
| Rust Fundamentals | 5 — taught by simulating ownership/borrowing in JavaScript, not a real Rust runtime |
| Go Fundamentals | 5 — taught by simulating goroutines/channels in JavaScript, not a real Go runtime |

### Track 2 — Data

| Series | Levels |
|---|---|
| Data Structures & Algorithms in Python | 11 |
| SQL Fundamentals | 8 |
| Database Design | 6 |

### Track 3 — Backend & APIs

| Series | Levels |
|---|---|
| Backend Fundamentals | 8 |
| REST APIs | 5 |

### Track 4 — Tools & Practice

| Series | Levels |
|---|---|
| Git & Version Control | 8 |
| Git Advanced | 8 |
| Software Construction | 15 |
| Clean Code | 6 |
| Testing Fundamentals | 5 |
| Debugging Fundamentals | 8 |
| DevOps Concepts | 6 |
| How to Contribute | 8 |

### Track 5 — Computer Science & Software Design

| Series | Levels |
|---|---|
| CS Foundations | 9 |
| Async Programming | 5 |
| Functional Programming | 6 |
| OOP Design | 5 |
| Design Patterns | 5 |
| Software Architecture | 4 |
| Performance Engineering | 4 |

### Track 6 — Frontend & Frameworks

| Series | Levels |
|---|---|
| React Fundamentals | 5 |
| Browser APIs | 5 |
| Frontend Engineering | 4 |

### Track 7 — Professional Practice

| Series | Levels |
|---|---|
| Web Security | 4 |
| Professional Engineering | 5 |

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

### Phase 1 — Core languages + CSS root — done
All of Track 0, 0b, and 1 shipped (see Curriculum Map above): Python, JavaScript,
HTML/DOM, the full 10-series CSS dependency graph, C++, C#, Java, TypeScript, DSA in
Python, Rust and Go (both taught via JS simulation, not a real runtime).

### Phase 2 — Data and Backend — done
SQL Fundamentals, Database Design, Backend Fundamentals, REST APIs, Git & Version
Control, and Git Advanced all shipped.

### Phase 3 — Tool integrations — not started
- [ ] `open_with` metadata support in parser
- [ ] HTML Lab launch button in LessonView
- [ ] CodeLens launch button in LessonView
- [ ] Abstraction Visualiser launch button in LessonView
- [ ] SQL Panel launch button in LessonView

### Phase 4 — Shared component layer — not verified
- [ ] Audit duplication across lesson engine and labs
- [ ] Extract shared pieces to `src/engine/shared/`
- [ ] Update all importers

### Phase 5 — Advanced series — done
Software Construction, CS Foundations, Debugging Fundamentals, Functional Programming,
DevOps Concepts, Clean Code, OOP Design, Testing Fundamentals, Async Programming,
Performance Engineering, Frontend Engineering, Web Security, Design Patterns, REST
APIs, React Fundamentals, Software Architecture, and Professional Engineering all
shipped — a broader set than originally scoped here.

### Phase 6 — Contributor Series — done
All 8 levels written and wired.

### Phase 7 — Content correctness (current focus)
Structural bugs found by `src/labs/lesson-engine/content/lessonCorpus.test.ts` — run
`npm test` for current numbers:
- [x] Explicit challenge-language tag support in the parser (`UPSKILLOS_CURRICULUM_CONTRACT.md` Part 3)
- [x] Retag scenario-quiz challenges mis-inferred as bash/sql (git-advanced, git-version-control, contributor-series, database-design)
- [x] Fix wrong-fence-tag bug (sql-fundamentals, typescript-fundamentals, css-professional, css-visual-design)
- [ ] Real test harnesses for SQL (raw-text assertion binding), C++, C#, Java (`UPSKILLOS_CURRICULUM_CONTRACT.md` Part 4)
- [ ] Assertion-count cleanup (outside the 4–6 range)
- [ ] `database-design` level-1/level-4 prose/artifact mismatch and step-mixing
- [ ] Wire `vue-fundamentals` into `series.ts` (content exists, harness exists, never registered)

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
| `src/docs/UPSKILLOS_CURRICULUM_CONTRACT.md` | Decomposition, series, and per-lesson writing rules; engine capability reference |
| `src/docs/LESSON_ENGINE_ROADMAP.md` | This file — curriculum plan and architecture |
| `src/labs/lesson-engine/series.ts` | Series registry |
| `src/labs/lesson-engine/LessonEngineLab.tsx` | Import map + lesson file registry |
| `src/labs/lesson-engine/content/lessonCorpus.test.ts` | Automated corpus checks — run via `npm test` |
| `src/engine/lesson/parser.test.ts` | Parser unit tests |
| `src/engine/lesson/LessonView.tsx` | Lesson renderer, tab system, tool integration hooks |
| `src/engine/lesson/parser.ts` | Markdown → ParsedLesson |
| `src/engine/lesson/executor.ts` | Code runner dispatch |
| `src/engine/lesson/testRunner.ts` | Per-language test harness builders |
| `src/labs/backend-lab/SqlPanel.tsx` | SQL runner — candidate for shared extraction |
| `src/labs/backend-lab/PostmanPanel.tsx` | HTTP client — candidate for shared extraction |
