# Cleanup Plan — `clean` branch
**Branch:** `clean` | **Never merge to main until fully done**

---

## Context Reset Protocol
When context runs out, start a new chat and say:
> "Read src/docs/CLEANUP_PLAN.md and continue the cleanup plan from where we left off."

The plan is the source of truth. Update it as work progresses.

---

## The Three Content Systems

| System | Route | Player | Data location | Status |
|--------|-------|--------|---------------|--------|
| 1 (old, pre-package) | `/chapter/:id/:slug` | `LessonPage` + `MicroCycleLesson` | `src/content/{course}/index.js` | **mostly gone — see below** |
| 2 (course package) | `/chapter/:id/:slug` | `LessonPage` + `MicroCycleLesson` | `src/courses/{courseId}/{N}-{chapterSlug}/{NNN}-{lessonSlug}.js`, read via `courseLoader.js` | **THE CURRENT SYSTEM** |
| 3 (web-learn) | `/web-learn/:series/:id` | `WebLessonPlayer` | `src/content/{course}/{lesson}.js` | **FROZEN — do not touch** (`css-mastery`, `react-mastery`) |

**History correction (this section used to be wrong):** an earlier version of this
plan called System 2 an "autoLoader" format living at
`src/content/lessons/{course}/{chapter}/{NNN}-{slug}.js`, built in `12a0e73` /
`ff5cb02`. That system was **abandoned** — `a2b9cc2 "cleaned courses and
content"` deleted `src/content/autoLoader.js` and moved essentially all
lesson content into the `src/courses/<courseId>/` package format above
instead. That move is what actually happened and is what's live today.
`SectionRenderer.jsx` (built for the abandoned autoLoader system, zero
importers) was deleted as part of this cleanup pass.

**Goal now:** System 1 is functionally extinct — almost everything already
lives in `src/courses/`. What's left to resolve is content-quality inside
System 2 (schema inconsistency, naming chaos — see below), not a system
migration.

---

## Fields Actually Read by Renderers

### LessonPage.jsx reads:
`id`, `title`, `subtitle`, `order`, `tags`, `hook`, `quiz`, `crossRefs`, `grapher`
(re-verified live against current `src/pages/LessonPage.jsx` — still accurate)

### MicroCycleLesson.jsx (desktop) reads:
`id`, `intuition`, `math`, `mentalModel`, `applications`, `walkthroughs`, `discovery`, `story`,
`examples`, `challenges`, `triggers`, `homelab`, `openmat`, `openmatLab`, `python`, `pythonLab`,
`notebooks`, `spiral`, `assessment`, `supplementalVisualizations`, `tools`, `rigor`

### MobileLessonContent.jsx reads:
`id`, `intuition`, `math`, `mentalModel`, `discovery`, `story`, `walkthroughs`, `examples`,
`challenges`, `openmat`, `openmatLab`, `python`, `pythonLab`, `notebooks`, `assessment`, `rigor`

---

## Problems Found in Current Lesson Files (still real, unresolved)

### Schema problems:
- `chapter` field is 4 different types: number (`1`), float (`1.1`), string (`'dsa1'`), string (`'sim1'`)
- `order` missing from many lessons
- Random extra fields with no renderer: `aliases`, `timeToComplete`, `coreConcept`, `prerequisites`, `nextLesson`, `semantics`
- Duplicate fields: `openmat` / `openmatLab`, `python` / `pythonLab`, `notebooks.matlab` / `notebooks.python`
- `visualizations` in intuition vs `supplementalVisualizations` at top level — two different patterns

### Folder naming chaos (newly confirmed, concrete):
- `src/courses/c-plus-plus/4-c name here` and `5-c name here` — literal
  placeholder chapter-folder names left over from an automated migration,
  never renamed. Contains the `cpp3-*` and `cpp4-*` lesson files respectively.
- `src/courses/simulation/4-more stuff` — same issue, placeholder name.
- Not fixed in this pass — renaming a chapter folder changes its slug, which
  is part of the lesson route (`courseLoader.js` derives `chapterSlug` from
  the folder name), so it needs a redirect/URL-stability check before
  touching it. Tracked here so it doesn't get lost.

### Content problems:
- `css-mastery` and `react-mastery` are System 3 (frozen) — confirmed still
  routed through `WebLessonPlayer` via `App.jsx`'s `web-learn/*` routes. Not
  orphaned, don't touch.
- `src/content/proofs/` (algebra/series/limits/trig/integrals/derivatives/geometry)
  — **reclassified**: this is reference data consumed directly by
  `ReferencePage.jsx` (one importer), not a lesson sequence with its own
  route. Out of scope for "migration" — it was never System 1 lesson content,
  it's a different kind of artifact entirely.
- `cpp-3`/`cpp-4` — **resolved**, not orphaned. They're already inside
  `src/courses/c-plus-plus/` as the `4-c name here` / `5-c name here`
  chapters (see naming issue above).
- `math-1` — checked, zero references anywhere in `src/content` or
  `src/courses`. It no longer exists; no action needed.
- `src/content/templates/*` (7 lesson-type boilerplate files) — zero
  importers, deleted in this cleanup pass.
- Mobile rendering is still broken — `MobileLessonContent` is a
  stripped-down subset, not a real mobile experience. Unresolved.

---

## Proposed Unified Lesson Schema (aspirational — not yet implemented)

This schema was designed for the abandoned autoLoader system. It's kept here
as a reference for what a future schema cleanup *could* look like, but there
is no current effort to build a new loader — any schema unification now
would happen in place, inside the existing `src/courses/` package format and
`courseLoader.js`, not via a new pipeline.

```js
export default {
  // ── Identity (required) ───────────────────────────────────────────────
  id:       'course-chapter-slug',     // globally unique, kebab-case
  slug:     'lesson-slug',             // URL segment, kebab-case
  title:    'Lesson Title',
  subtitle: 'One sentence description',
  tags:     ['tag1', 'tag2'],

  // ── Type (required) ───────────────────────────────────────────────────
  // Tells the renderer which content blocks to expect
  type: 'concept' | 'coding' | 'simulation' | 'science' | 'visualization',

  // ── Hook (required) ───────────────────────────────────────────────────
  hook: {
    question: 'The driving question',
    realWorldContext: 'Why this matters in the real world',
    viz: 'VizComponentId',             // optional — replaces previewVisualizationId
  },

  // ── Core content (required) ───────────────────────────────────────────
  intuition: {
    prose: ['paragraph 1', 'paragraph 2'],
    callouts: [{ type: 'insight' | 'warning' | 'procedure' | 'important', title, body }],
  },

  // ── Type-specific blocks (optional, depends on type) ──────────────────
  // For type: 'coding' or 'science'
  code: {
    language: 'python' | 'javascript' | 'matlab',
    cells: [...],                      // replaces openmat/python/notebooks mess
  },

  // For type: 'concept' or 'visualization'
  visualizations: [
    { id: 'VizId', title, caption, props: {} }
  ],

  // ── Learning structure (optional) ─────────────────────────────────────
  examples:   [...],
  challenges: [...],
  quiz:       [{ question, options, answer, explanation }],

  // ── Metadata (optional) ───────────────────────────────────────────────
  definitions: [{ term, definition, symbol? }],   // auto-indexed by autoLoader
  crossRefs:   [{ lessonSlug, title, reason }],
}
```

### What this schema would remove, if ever revived:
- `chapter` / `order` — would be derived from folder structure instead of stored
- `aliases`, `timeToComplete`, `coreConcept`, `prerequisites`, `nextLesson` — not rendered, not needed
- `semantics` — merge into `intuition.callouts`
- `openmat`, `openmatLab`, `python`, `pythonLab`, `notebooks` — all replaced by `code`
- `homelab`, `spiral`, `triggers`, `rigor` — audit each course, decide per lesson type
- `supplementalVisualizations` — merge into `visualizations`
- `mentalModel`, `applications`, `walkthroughs`, `discovery`, `story` — audit needed

---

## Current Content Inventory

| Course | Location | Status |
|--------|----------|--------|
| All courses listed in `src/courses/` (calculus, physics, python, geometry, precalculus, linear-algebra, discrete-math, data-science, ai-engineering, web, git, nosql, c-plus-plus, chemistry, javascript, three-js, sql, cnc, electronics, digital-fundamentals, applied-statistics, data-structures-and-algorithms, dynamic-programming, design, logic, programmable-logic-controllers, command-line-interface, canvas, simulation, tetris) | `src/courses/<id>/` | **done** — package format, courseLoader-driven |
| `css-mastery` | `src/content/css-mastery/` | **frozen** — System 3, do not migrate |
| `react-mastery` | `src/content/react-mastery/` | **frozen** — System 3, do not migrate |
| `proofs` | `src/content/proofs/` | **reclassified** — reference data for `ReferencePage.jsx`, not lesson content |
| `cpp-3` / `cpp-4` | `src/courses/c-plus-plus/4-c name here`, `5-c name here` | **done**, but needs chapter-folder rename (see naming issue above) |
| `math-1` | — | **gone**, no longer exists, no action |
| `templates/*` | — | **deleted** (zero importers) |

---

## Remaining Work
- [ ] Rename `c-plus-plus/4-c name here` → a real slug (and `5-c name here`,
      `simulation/4-more stuff`) — needs a route-stability check first since
      chapter slugs are URL segments.
- [ ] Resolve schema problems listed above (field-type inconsistency, dead
      fields, duplicate fields) — in place, within the existing package
      format. No new loader/pipeline needed.
- [ ] Fix mobile rendering (`MobileLessonContent` stripped-subset problem).
- [ ] Decide if the aspirational unified schema above is worth adopting
      in-place, or if it should be dropped now that the loader it was
      designed for no longer exists.

---

## Future (after the above is resolved)
- Lesson editor UI — user can create/edit lessons in-browser
- Better mobile experience — redesign MobileLessonContent
- Fix viz files — audit all visualization components
