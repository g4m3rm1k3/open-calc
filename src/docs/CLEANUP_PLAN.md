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
| 1 (old) | `/chapter/:id/:slug` | `LessonPage` + `MicroCycleLesson` | `src/content/{course}/index.js` | **MIGRATE OUT** |
| 2 (autoLoader) | `/chapter/:id/:slug` | `LessonPage` + `MicroCycleLesson` | `src/content/lessons/{course}/{chapter}/{NNN}-{slug}.js` | **THE FUTURE** |
| 3 (web-learn) | `/web-learn/:series/:id` | `WebLessonPlayer` | `src/content/{course}/{lesson}.js` | **FROZEN — do not touch** |

**Goal:** All System 1 content migrates to System 2. System 1 dies when `content/index.js` is empty.

---

## Fields Actually Read by Renderers

### LessonPage.jsx reads:
`id`, `title`, `subtitle`, `order`, `tags`, `hook`, `quiz`, `crossRefs`, `grapher`

### MicroCycleLesson.jsx (desktop) reads:
`id`, `intuition`, `math`, `mentalModel`, `applications`, `walkthroughs`, `discovery`, `story`,
`examples`, `challenges`, `triggers`, `homelab`, `openmat`, `openmatLab`, `python`, `pythonLab`,
`notebooks`, `spiral`, `assessment`, `supplementalVisualizations`, `tools`, `rigor`

### MobileLessonContent.jsx reads:
`id`, `intuition`, `math`, `mentalModel`, `discovery`, `story`, `walkthroughs`, `examples`,
`challenges`, `openmat`, `openmatLab`, `python`, `pythonLab`, `notebooks`, `assessment`, `rigor`

---

## Problems Found in Current Lesson Files

### Schema problems:
- `chapter` field is 4 different types: number (`1`), float (`1.1`), string (`'dsa1'`), string (`'sim1'`)
- `order` missing from many lessons
- Random extra fields with no renderer: `aliases`, `timeToComplete`, `coreConcept`, `prerequisites`, `nextLesson`, `semantics`
- Duplicate fields: `openmat` / `openmatLab`, `python` / `pythonLab`, `notebooks.matlab` / `notebooks.python`
- `visualizations` in intuition vs `supplementalVisualizations` at top level — two different patterns

### File naming chaos (all different):
- `00-intro-limits.js`
- `ch1-1.js`
- `dsa1-001-arrays.js`
- `sim1-001-how-the-lab-works.js`
- Convention target: `001-intro-to-limits.js`

### Content problems:
- `css-mastery` and `react-mastery` flagged as "unregistered" — they're System 3, not orphaned
- `proofs`, `cpp-3`, `cpp-4`, `math-1`, `ocean-1` — genuinely unregistered (no route to them)
- Mobile rendering broken — `MobileLessonContent` is a stripped-down subset, not a real mobile experience

---

## Proposed Unified Lesson Schema (System 2)

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

### What gets removed from the schema:
- `chapter` — autoLoader derives this from folder structure, not the file
- `order` — autoLoader derives from filename number prefix
- `aliases` — not used by any renderer
- `timeToComplete`, `coreConcept`, `prerequisites`, `nextLesson` — not rendered, not needed
- `semantics` — merge into `intuition.callouts`
- `openmat`, `openmatLab`, `python`, `pythonLab`, `notebooks` — all replaced by `code`
- `homelab`, `spiral`, `triggers`, `rigor` — audit each course, decide per lesson type
- `supplementalVisualizations` — merge into `visualizations`
- `grapher` — keep for now, audit later
- `mentalModel`, `applications`, `walkthroughs`, `discovery`, `story` — **audit needed**

---

## Content Inventory

| Course | System | Files | Status | Notes |
|--------|--------|-------|--------|-------|
| chapter-0 to chapter-6 | 1 | ~80 | migrate | calc curriculum |
| python-1 | 1 | 16 | migrate | |
| dsa-1 | 1 | 19 | migrate | has ScienceNotebook cells |
| sim-1/2/3 | 1 | 24 | migrate | Three.js/Canvas sandbox |
| physics-1 | 1 | many | migrate | |
| chemistry-1/2/3/4 | 1 | many | migrate | |
| geometry-1 to 6 | 1 | many | migrate | |
| precalc 1-5 | 1 | many | migrate | |
| linear-algebra | 1 | many | migrate | |
| web-1 | 1 | many | migrate | |
| ai-engineering-0/1/2/11 | 1 | many | migrate | |
| three-js-1/2 | 1 | many | migrate | |
| canvas-1 | 1 | many | migrate | |
| dsa-1 | 1 | many | migrate | |
| cpp-0/1/2 | 1 | many | migrate | |
| sql-0/1 | 1 | many | migrate | |
| nosql-1 | 1 | many | migrate | |
| git-1 | 1 | many | migrate | |
| cnc-1 | 1 | many | migrate | |
| css-mastery | 3 | 29 | frozen | System 3 — do not migrate |
| react-mastery | 3 | 24 | frozen | System 3 — do not migrate |
| git-0 | 2 | 25 | done | already in autoLoader format |
| cli-0 | 2 | 10 | done | already in autoLoader format |
| proofs | ? | 7 | audit | no index.js, unregistered |
| cpp-3/4 | ? | 20 | audit | unregistered |
| math-1 | ? | 1 | audit | unregistered |
| sim-4 (was ocean-1) | 2 | 3 | **done** | migrated to lessons/sim-4/1-sim-4/ |

---

## Migration Order (one course at a time, fully done before next)

**Phase 1 — Fix the foundation**
- [x] Finalise unified schema (LESSON_EXAMPLE.md)
- [x] Write Family B migration script (scripts/migrate-family-b.mjs)
- [x] Fix autoLoader to read `mod?.lesson` named exports (autoLoader.js line 50)
- [x] Wire autoLoader into content/index.js → CURRICULUM spread
- [x] Build SectionRenderer component (src/components/lesson/SectionRenderer.jsx)
- [x] Wire SectionRenderer into LessonPage.jsx (`lesson.sections` branch)
- [ ] Update scanner to recognise System 3 courses (no false orphan warnings)
- [ ] Audit `git-0` and `cli-0` — they're in src/content/, NOT src/content/lessons/, still old format

**Phase 2 — Migrate small courses first (build confidence)**
- [x] `sim-4` (3 files, was ocean-1) → src/content/lessons/sim-4/1-sim-4/
- [ ] `math-1` (1 file)
- [ ] `proofs` (7 files)
- [ ] `discrete-math`
- [ ] `applied-statistics`

**Phase 3 — Medium courses**
- [ ] `dsa-1` (19 files — good template for coding lessons)
- [ ] `sim-1/2/3` (24 files — good template for simulation lessons)
- [ ] `python-1` (16 files)

**Phase 4 — Large courses**
- [ ] `chapter-0` through `chapter-6` (calc — largest, most complex)
- [ ] `physics-1`, `chemistry-1/2/3/4`
- [ ] All remaining

**Phase 5 — Cleanup**
- [ ] Delete `content/index.js` manual imports as each course migrates
- [ ] Remove dead fields from `MicroCycleLesson` and `MobileLessonContent`
- [ ] Fix mobile rendering properly

---

## Future (after migration is done)
- Lesson editor UI — user can create/edit lessons in-browser
- Better mobile experience — redesign MobileLessonContent
- Fix viz files — audit all visualization components
