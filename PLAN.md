# UpSkillOS — App Consistency Plan

_Last updated: 2026-06-02_

---

## Current state (what we know)

### App architecture
- **Lesson rendering engine**: works correctly. `MicroCycleLesson.jsx` renders lessons.
- **6+ lesson types**: concept/math, Python coding, MATLAB/OpenMat, JavaScript/web, simulation, science/ScienceNotebook, CNC/G-code
- **Contributor docs**: HelpModal (`?` button) — 3400-line interactive contributor guide. This is the primary contributor interface.
- **Personal docs workspace**: `/docs` route (MarkdownHub) — Tutorials tab + Editor tab. User will fill with personal markdown lessons.
- **Lesson schema**: de facto schema exists in working lessons but was never formally written down. The "Lesson Anatomy" interactive section in HelpModal IS the schema — it shows Identity, Hook, Intuition, etc. with live examples.

### Lesson types and their notebook fields
| Type | Notebook field | Notebook component | Cell key format |
|------|---------------|-------------------|----------------|
| Concept/Math | `intuition.visualizations` | PythonNotebook / OpenMatNotebook | `{id, cellTitle, prose[], code}` |
| Python | `intuition.visualizations` | PythonNotebook | `{id, cellTitle, prose[], code}` — uses `props: {initialCells}` |
| MATLAB | `intuition.visualizations` | OpenMatNotebook | `{id, cellTitle, prose[], code}` — uses `initialProps: {initialCells}` |
| Science | top-level `cells[]` | ScienceNotebook | `{type: 'markdown'|'js'|'choice', instruction, ...}` |

### File naming — INCONSISTENT across courses
| Course | Pattern used | Example |
|--------|-------------|---------|
| python-1 (new) | `ch1-1.js` | ch1-1.js, ch2-3.js |
| python-1 (old) | `lesson1.js` | lesson1.js, lesson18.js |
| cli-0 | `cli0-001-slug.js` | cli0-001-what-is-the-terminal.js |
| linear-algebra | `la1-001-slug.js` | la1-001-vectors.js |
| chemistry-2 | `lesson2-0.js` | lesson2-0.js, lesson2-4.js |
| physics-1 | `p4-001-slug.js` | p4-001-newtons-first-law.js |

**Target convention**: `<course>-<chapter>-<order>-<slug>.js` (e.g. `py1-001-variables.js`)

---

## Bugs — CONFIRMED

### Bug 1: 46 duplicate lesson IDs (the "duplicate ID warnings")
Found by: `node -e` scan across all `src/content/` folders.

**Within-folder duplicates** (old + new files coexisting, never cleaned up):
| Folder | Count | Cause |
|--------|-------|-------|
| geometry-1 | 6 | Old: `angles-segments.js` / New: `geo-1-3-angles-segments.js` — same `id` field |
| geometry-2 | 7 | Same pattern |
| geometry-3 | 3 | Same pattern |
| geometry-4 | 2 | Same pattern |
| git-0 | 5 | Same pattern |
| design-1 | 3 | `lesson1-1.js` + `Lesson design 01.js` (spaces in filename!) |
| digital-fundamentals | 2 | `04-01-booleanalgebra.js` + `df l4 1 booleanalgebra.js` |
| chapter-0 | 1 | `00c-lines-mastery.js` + `00e-lines-mastery.js` |
| linear-algebra | 1 | `la-sandbox.js` shares ID with `la8-001-pca...js` |
| sim-2 | 1 | — |

**Cross-folder duplicates** (different courses with colliding IDs — naming convention failure):
| Collision | Count | Cause |
|-----------|-------|-------|
| chapter-3 (calculus) ↔ precalc-3 | 5 | precalc-3 used `ch3-001` etc., same pattern as calc chapter-3 |
| chapter-4 (calculus) ↔ precalc-4 | 5 | same |
| chapter-5 (calculus) ↔ precalc-5 | 4 | same |

**Fix**: Do NOT delete files. Rename the `id:` field in the superseded/old files to be unique (add course prefix). Remove old files from `index.js` if they are truly superseded, but keep the `.js` files.

**Templates placeholder collision**:
- `template-concept.js` and `template-openmat.js` both use `id: 'COURSE-CHAPTER-ORDER-SLUG'`
- Fix: give each template a distinct example placeholder

### Bug 2: Python lesson index.js imports both old (lesson*.js) and new (ch*.js) files
`python-1/index.js` imports both generations of files — 42 total lessons, many overlapping in topic. This is not a duplicate ID bug (IDs are unique) but it means the course has two parallel lesson trees that may confuse students.

### Bug 3: Filenames with spaces
`design-1/Lesson design 01.js` — spaces in JS filenames cause issues on some systems and break import conventions.

### Bug 4: AssessmentBlock uses `key={q.id ?? i}` without lessonId scope
`src/components/lesson/AssessmentBlock.jsx:210` — if two assessment blocks render simultaneously (e.g. in a split view), React will warn about duplicate keys `q1`, `q2`, etc.
Fix: `key={`${lessonId ?? ''}-${q.id ?? i}`}` — need to pass lessonId down.

---

## What was done this session (contributor docs cleanup)

1. **`template-concept.js`** — fixed notebook sections: now uses top-level `python:` and `openmat:` fields with correct `{id, cellTitle, prose[], code}` cell format
2. **`template-python.js`** — fixed: `visualizations` moved inside `intuition`, cells converted to correct format
3. **`template-openmat.js`** — created new standalone MATLAB/OpenMat template
4. **`MarkdownHub.jsx`** — removed Templates tab (was wrong home for contributor templates; `/docs` is personal workspace)
5. **`HelpModal.jsx`** — DownloadCards now async-fetch actual template files via `import.meta.glob` instead of stale inline strings; added MATLAB and Simulation tabs; added DownloadCards to Science and Web sections
6. **Dead code**: `TPL_MATH` and `TPL_PYTHON` inline template strings still exist in HelpModal — they are now unused and should be removed

---

## Phase 1 — Fix bugs (DO THIS FIRST)

### 1a. Fix duplicate IDs in within-folder conflicts
For each folder with old + new files:
- Check if old file is genuinely superseded by the new one (same content, improved)
- If superseded: rename `id:` in old file to `<old-id>-legacy` so it's unique, remove old file from `index.js` (keep the `.js` file)
- If old file has unique content: merge into new file, then same as above

Folders: `geometry-1`, `geometry-2`, `geometry-3`, `geometry-4`, `git-0`, `design-1`, `digital-fundamentals`, `chapter-0`, `linear-algebra`, `sim-2`

### 1b. Fix cross-folder ID collisions (precalc vs calc)
Rename IDs in precalc files:
- `precalc-3`: change `ch3-001` → `p3c-001` (or `precalc3-001`)
- `precalc-4`: change `ch4-001` → `p4c-001`
- `precalc-5`: change `ch5-001` → `p5c-001`

### 1c. Fix template placeholder IDs
- `template-concept.js`: change `id: 'COURSE-CHAPTER-ORDER-SLUG'` to `id: 'COURSE-CH-ORDER-SLUG'` (cosmetic distinction but removes collision)
- `template-openmat.js`: change to `id: 'COURSE-CH-ORDER-SLUG-MATLAB'` or just a clearly different example

### 1d. Fix AssessmentBlock key scoping
`src/components/lesson/AssessmentBlock.jsx` line 210: add lessonId prop and use it in key.

### 1e. Remove dead TPL_* code from HelpModal
`TPL_MATH` and `TPL_PYTHON` constants are now unused — remove them.

### 1f. Fix filenames with spaces
`design-1/Lesson design 01.js` → `design-1/lesson1-1-visual-hierarchy.js` (rename file, update import in index.js)
Same for other space-named files in digital-fundamentals.

---

## Phase 2 — Establish schema as ground truth

### 2a. Verify Lesson Anatomy section in HelpModal is accurate
Read the `SectionLessonAnatomy` component and check every field shown against 3 working lessons:
- `la1-001-vectors.js` (concept/LA)
- `p4-001-newtons-first-law.js` (physics/concept)
- `ch1-1.js` python-1 (Python coding)

Fix any field names in HelpModal that don't match actual working lessons.

### 2b. Remove dead TPL_* inline strings
After 1e — also check all other HelpModal code examples (LESSON_ZONES section, "Your First Lesson" wizard) against actual lesson schema.

### 2c. Standardize template placeholder IDs
Each of the 6 template files in `src/content/templates/` should have an example `id` that follows the real convention, e.g.:
- `template-concept.js`: `id: 'course-ch-000-your-topic'`
- `template-python.js`: `id: 'py-0-000-your-topic'`
- `template-openmat.js`: `id: 'course-ch-000-your-topic-matlab'`

---

## Phase 3 — Convention over configuration

### 3a. File naming convention
Adopt `<course>-<chapter>-<order>-<slug>.js` everywhere.
- Rename old-pattern files (`lesson1.js` → `py0-002-values.js`, `lesson2-0.js` → `chem2-000-intro.js`)
- This enables auto-deriving course/chapter/order from filename without reading file content

### 3b. Auto-derive course structure from filesystem
Replace `index.js` per folder with a build-time glob:
- `import.meta.glob('../python-1/*.js')` sorted by filename = lessons in order
- Chapter number derived from filename pattern
- Chapter title still needs one declaration per course (could be a `course.js` metadata file)

### 3c. Viz component auto-registration
Instead of manually registering each viz in `VizFrame.jsx`:
- Naming convention: `src/components/viz/react/MyViz.jsx` → ID is `MyViz`
- One-liner glob in VizFrame replaces the 365+ manual entries
- Viz file exports a `description` or `meta` object for the viz browser

### 3d. Video folder structure
Replace `reports/video-library-seed.json` append-only pattern with:
```
src/content/videos/
  calc-derivatives/
    overview.json   { url, title, timestamps }
  python-loops/
    overview.json
```
Auto-detected at build time. Contributor adds a folder, not edits a file.

### 3e. Validation script
`npm run validate` — Node script that:
- Reads all lesson files via glob
- Checks: required fields present, quiz `answer` matches an `options` entry, no duplicate IDs, viz IDs exist in VizFrame registry
- Reports errors with file + line context
- Run in CI on PR

---

## Contributor path (end state)

**Non-developer:**
1. Open the `?` Contributor Docs in the app
2. Pick lesson type → Download template
3. Fill in UPPER_CASE placeholders
4. Email to m1k3ymcl34n@gmail.com

**Developer:**
1. Open the `?` Contributor Docs in the app
2. Pick lesson type → Download template
3. Name the file: `<course>-<chapter>-<order>-<slug>.js`
4. Drop it in the right `src/content/<course>/` folder
5. It auto-registers — no index.js edit needed (Phase 3)
6. `npm run validate` confirms it's clean
7. Open PR

---

## Files touched this session
- `src/content/templates/template-concept.js` — fixed notebook format
- `src/content/templates/template-python.js` — fixed notebook format
- `src/content/templates/template-openmat.js` — created
- `src/components/docs/MarkdownHub.jsx` — removed Templates tab + all supporting code
- `src/components/ui/HelpModal.jsx` — wired DownloadCards to actual files, added MATLAB/Simulation/Science/Web cards

## Files still needing work (from this session)
- `src/components/ui/HelpModal.jsx` — remove dead `TPL_MATH`, `TPL_PYTHON`, `TPL_PROOF` inline strings; audit LESSON_ZONES and wizard code examples against real schema
- `src/components/lesson/AssessmentBlock.jsx` — add lessonId to key scoping
- `src/content/precalc-3/`, `precalc-4/`, `precalc-5/` — rename IDs to avoid calc chapter collision
- `geometry-1/2/3/4/`, `git-0/`, `design-1/`, `digital-fundamentals/` — resolve within-folder ID duplicates
