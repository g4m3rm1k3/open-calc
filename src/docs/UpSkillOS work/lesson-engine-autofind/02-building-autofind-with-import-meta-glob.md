# Lesson 2 — Autofind: One Source of Truth for Lesson Content

Today we study **static analysis** — a build tool reading your source code without
running it — via Vite's `import.meta.glob`. Our case study is collapsing the
three hand-synced copies from Lesson 1 into one: the lesson file's own frontmatter.

---

## What You Will Build

By the end of this lesson, adding a new lesson to any series will require creating
**one file**, with correct frontmatter, in the right folder — nothing else. No new
import statement. No new `series.ts` entry. No `LESSON_FILES` map edit. You will
prove it by adding a second practice lesson the *new* way and watching it appear in
the running app having touched exactly one file. You'll also see the Lesson 1 bug —
the mismatched-level "next lesson" bug — become structurally impossible, not just
fixed by being more careful.

This lesson describes real code for you to type into the real files. Nothing in
this document has been applied to the app for you — that's deliberate. Typing it
yourself, watching it compile, and fixing whatever you get wrong the first time is
the part that makes the design actually yours.

---

## What You Need to Know First

Lesson 1 in this set (`01-how-content-loading-works-today.md`): what `SeriesMeta`
and `LESSON_FILES` are, what `?raw` does, what `parseFrontmatter` and `parseLesson`
do, and the concrete "next lesson" bug that mismatched, hand-typed level numbers
cause. This lesson assumes all of that is fresh — it doesn't re-explain it.

---

## The Lesson

### Step 1 — Concept Lab: What `import.meta.glob` Actually Does

`import.meta.glob` is a Vite-specific feature — it doesn't exist in plain
JavaScript or in other bundlers under this name. Before touching the real app,
build a completely disposable example so you can see exactly what it returns,
with no lesson-engine complexity mixed in.

**1a.** Create a throwaway folder: `src/scratch-glob-lab/data/a.txt` containing
just the text `AAA`, `src/scratch-glob-lab/data/b.txt` containing `BBB`, and
`src/scratch-glob-lab/data/c.txt` containing `CCC`.

**1b.** Create `src/scratch-glob-lab/lab.ts`:

```typescript
const files = import.meta.glob('./data/*.txt', {
  query: '?raw',
  import: 'default',
  eager: true,
})

console.log(files)
```

**1c.** Temporarily import it so it actually runs. Open `src/main.jsx` (the app's
entry point — the first file Vite executes) and add one line near the top:

```javascript
import './scratch-glob-lab/lab.ts'
```

**1d.** Run `npm run dev`, open the app in a browser, open the browser's developer
console (F12 → Console tab — this is where `console.log` output appears; if you
haven't opened dev tools before, this is the panel every JavaScript error and log
message shows up in). You should see something like:

```text
{
  './data/a.txt': 'AAA',
  './data/b.txt': 'BBB',
  './data/c.txt': 'CCC',
}
```

**What this output proves:** `import.meta.glob(pattern, options)` returns a plain
JavaScript object. Its **keys** are the relative file paths that matched your glob
pattern (`./data/*.txt`, where `*` means "any characters except a path separator" —
the same wildcard convention as a shell `ls *.txt`). Its **values**, because you
passed `eager: true`, are the already-resolved contents of each file — here, raw
text strings, because `query: '?raw', import: 'default'` tells Vite the same thing
`?raw` told it in Lesson 1: skip normal file processing, hand back the raw text.

**1e. Vary the input, once, to see a second facet.** Rename `b.txt` to `b.md`.
Re-save `lab.ts` (even without changing it, to force Vite to reprocess), refresh
the browser. The logged object now has only two keys — `a.txt` and `c.txt`. `b.md`
disappeared, because it no longer matches the literal pattern `*.txt`.

```text
Before renaming: { a.txt: 'AAA', b.txt: 'BBB', c.txt: 'CCC' }
After renaming b.txt -> b.md: { a.txt: 'AAA', c.txt: 'CCC' }
```

**What that proves:** the glob pattern is a real filter, evaluated against actual
file paths on disk, not a fixed list decided when you wrote the code. Rename
`b.md` back to `b.txt` before continuing.

**1f. Delete the lab now.** Remove `src/scratch-glob-lab/` entirely, and remove the
`import './scratch-glob-lab/lab.ts'` line from `src/main.jsx`. This code's job is
done; it never enters the project, exactly like the `Dog`/`MathHelper` labs in the
main curriculum contract. Confirm `npm run dev` still runs cleanly with it gone.

**CS lens — static analysis vs. dynamic resolution:** In Lesson 1 you learned that
`import` statements must name their source as a **literal string** — you can't hand
`import` a variable. `import.meta.glob('./data/*.txt', ...)` obeys the exact same
rule: the pattern argument must be written as a literal string directly in the
source code, not built from a variable at runtime. This is because Vite finds every
`import.meta.glob(...)` call by reading your source file's text — technically, by
parsing it into an **AST (Abstract Syntax Tree)**, the structured, tree-shaped
representation of your code's grammar that every compiler and bundler builds before
doing anything else — and rewriting that call into a real block of ordinary ES
imports, *before your code ever runs in a browser*. If the pattern were a variable,
Vite would have no way to know at build time which files you meant; your code
hasn't executed yet, so the variable has no value yet. This is **static analysis**:
extracting facts from code by reading its text/structure, not by running it.
Contrast Node.js's `require(someVariablePath)`, which resolves the file at runtime,
while your program is already executing — **dynamic resolution**. Vite's glob
import is static; a hand-rolled `fs.readdirSync()` loop would be dynamic. Neither
is universally better — static analysis lets a bundler pre-compute and optimize
everything up front (and catch a typo'd path before your users ever see it);
dynamic resolution is more flexible but that flexibility only resolves at runtime.

**Recognition — static analysis vs. dynamic resolution recurs in:** TypeScript's
type checker (reads your code's structure without executing it); webpack's and
Vite's tree-shaking (deciding what to delete from the final bundle by reading which
exports are actually imported, not by running the program); Python type checkers
like `mypy`; a SQL database's query planner choosing which index to use before a
query actually runs; and a browser parsing `<link rel="preload">` tags out of raw
HTML before any JavaScript has executed.

**SE lens — eager vs. lazy, a real trade-off:** You passed `eager: true` in the lab.
Leaving it off is the default, and produces a very different object: instead of
`{ './data/a.txt': 'AAA' }`, you'd get
`{ './data/a.txt': () => Promise<string> }` — a **function that returns a promise**,
which only actually reads and loads the file the first time you call it. This
matters because `eager: true` bundles every matched file's content directly into
whatever chunk of JavaScript contains this code — all of it downloaded by every
user, immediately, whether they ever open that content or not. The lazy default
instead gives Vite permission to **code-split**: put each matched file in its own
small downloadable chunk, fetched only when your code actually calls that file's
loader function. This exact trade-off already exists, deliberately, in this
codebase's `src/courses/courseLoader.js` — go read lines 13–28 of that file. It
uses a **lazy** glob (no `eager`) for full lesson bodies, because there can be
hundreds of them and a user only ever opens a few — but an **eager** glob for
`meta.json` files, because every course's small metadata is needed immediately, for
every card on the courses page, the moment it loads. You will make the same
deliberate choice for the lesson engine in Step 3.

### Step 2 — Prior Art: This Codebase Has Already Solved This Exact Problem

Before designing anything new, read `src/labs/vue-studio/series/spreadsheet/seriesLoader.js`
in full — it's short:

```javascript
const LESSON_MODULES = import.meta.glob('./markdown/*.md', {
  query: '?raw',
  import: 'default',
  eager: true,
})

function slugFromPath(path) {
  return path.replace('./markdown/', '').replace('.md', '')
}

function titleFromContent(raw, slug) {
  const match = raw.match(/^#\s+(.+)$/m)
  return match ? match[1].trim() : slug
}

export const SPREADSHEET_LESSONS = Object.entries(LESSON_MODULES)
  .map(([path, raw]) => {
    const slug = slugFromPath(path)
    return { slug, title: titleFromContent(raw, slug), content: raw }
  })
  .sort((a, b) => a.slug.localeCompare(b.slug))
```

**Walkthrough:** `LESSON_MODULES` is exactly your Lab from Step 1, applied to real
lesson Markdown files — an eager, raw-text glob over `./markdown/*.md`.
`Object.entries(LESSON_MODULES)` turns the `{path: content}` object into an array
of `[path, content]` pairs, because arrays support `.map()` and `.sort()` and plain
objects don't have a guaranteed iteration order you should rely on for display.
`.map(...)` transforms each pair into a `{slug, title, content}` object — `slug`
extracted from the path with plain string replacement, `title` extracted by
regex-matching the file's first Markdown `# Heading` line. `.sort(...)` orders the
result alphabetically by slug, using `localeCompare` — the correct way to compare
strings for sorting, because it handles locale-specific ordering rules (accents,
case) that plain `<` comparison gets wrong for non-ASCII text.

This is the same problem as `series.ts`'s `levels` array, solved already, in this
same repository, in about a dozen lines. `series.ts` doesn't need `titleFromContent`
(your lesson files already put `title` in the frontmatter, not in a `# Heading` this
loader has to guess from), but the shape of the solution — glob, transform paths
into structured data, derive display fields from file content instead of typing
them by hand, sort, export — is exactly what you're about to build.

**SE lens:** Good engineering practice is to follow the convention your own
codebase has already established, rather than invent a third pattern for the same
problem. `courseLoader.js`, `labLoader.js`, and `seriesLoader.js` are all doing
variations of "glob a folder, derive structured data from what's found." Your
lesson-engine loader should read as a sibling to these three, not as something
novel.

### Step 3 — Design: `contentLoader.ts` for the Lesson Engine

There's one difference from `seriesLoader.js` worth naming before writing code:
your lesson files already carry precise, structured metadata in frontmatter
(`series`, `level`, `title`, `lang`) — parsed today by the private
`parseFrontmatter` function inside `src/engine/lesson/parser.ts`. Re-deriving title
from a `# Heading` guess, the way `seriesLoader.js` does, would be a step backward.
Reuse what already exists instead of writing a second, competing parser.

**3a. Export the function that's already correct.** Open
`src/engine/lesson/parser.ts` and add one word:

```typescript
export function parseFrontmatter(md: string): { meta: Record<string, string>; body: string } {
  // ... body unchanged
}
```

That's the entire change to this file. `parseFrontmatter` was always capable of
this; it just wasn't reachable from outside the module. **SE lens:** minimizing a
file's public surface (only exporting what other modules actually need) is good
practice *until* another module has a legitimate need — at which point widening the
export is the correct fix, not duplicating the logic elsewhere. Note the deliberate
choice *not* to reuse the heavier `parseLesson` (the function already exported and
already used to open a single lesson) for this job: `parseLesson` walks the entire
lesson body — every step, every code fence, every CS/SE lens — to build a full
`ParsedLesson`. Building a picker menu only needs four frontmatter fields. Calling
the heavy parser on every lesson file just to read a title would mean fully
parsing content nobody's about to look at — wasted work on every app load. Use the
cheap function for the cheap job.

**3b. Create `src/labs/lesson-engine/contentLoader.ts`:**

```typescript
import { parseFrontmatter } from '../../engine/lesson/parser'

const RAW_FILES = import.meta.glob('./content/**/*.md', {
  query: '?raw',
  import: 'default',
  eager: true,
})
```

**Walkthrough:** `'./content/**/*.md'` — `**` is a glob convention meaning "any
number of nested folders, including zero." This matches
`./content/python-fundamentals/level-4.md` (one folder deep) exactly the same way
it would match a file two or three folders deep, should the content structure ever
grow that way. `eager: true` is the deliberate choice from Step 1: every lesson
file's raw text loads immediately, in one bundle, rather than being split into 55+
separate lazy chunks. That's the right call here specifically because
`LessonEngineLab.tsx` already does this today (55+ hand-written eager `?raw`
imports) — you are matching existing behavior, not introducing a new performance
trade-off. If the lesson library eventually grows to hundreds of files and initial
load time becomes a measured problem, switching this one line to lazy is a future,
separate decision — don't solve a performance problem that doesn't exist yet.

**3c. Build the two things `LessonEngineLab.tsx` actually needs — a lookup table by
path, exactly like today's `LESSON_FILES`, plus a per-series list of levels:**

```typescript
export const LESSON_FILES: Record<string, string> = {}

interface DiscoveredLevel {
  level: number
  title: string
  file: string
}

const levelsBySeriesId = new Map<string, DiscoveredLevel[]>()

for (const [path, raw] of Object.entries(RAW_FILES)) {
  const relativePath = path.replace(/^\.\/content\//, '')
  LESSON_FILES[relativePath] = raw

  const { meta } = parseFrontmatter(raw)
  if (!meta.series || !meta.level || !meta.title) continue

  const level: DiscoveredLevel = {
    level: parseInt(meta.level, 10),
    title: meta.title,
    file: relativePath,
  }

  const existing = levelsBySeriesId.get(meta.series) ?? []
  existing.push(level)
  levelsBySeriesId.set(meta.series, existing)
}

for (const levels of levelsBySeriesId.values()) {
  levels.sort((a, b) => a.level - b.level)
}

export function getLevelsForSeries(seriesId: string): DiscoveredLevel[] {
  return levelsBySeriesId.get(seriesId) ?? []
}
```

**Walkthrough, piece by piece:**

`path.replace(/^\.\/content\//, '')` strips the glob's `./content/` prefix so
`'./content/python-fundamentals/level-4.md'` becomes
`'python-fundamentals/level-4.md'` — the exact same key format `series.ts`'s `file`
field and today's hand-typed `LESSON_FILES` both already use. Matching the existing
key format means `LessonEngineLab.tsx`'s `LESSON_FILES[file]` lookup keeps working
unchanged.

`levelsBySeriesId` is a **`Map`**, not a plain object. A `Map` is a built-in
JavaScript collection, purpose-built for exactly this: keys of any type (here,
strings), guaranteed insertion order, and a cleaner API for "get this key's value,
or a sensible default if it isn't there yet" (`.get(key) ?? []`) than a plain
object's occasionally-surprising prototype-chain lookups. **SE lens:** reach for
`Map` over a plain object specifically when you're building a lookup table
dynamically, key by key, at runtime — which is exactly what this loop does.

The loop's `if (!meta.series || !meta.level || !meta.title) continue` line is a
**guard clause** — skip this file entirely if it's missing frontmatter fields the
rest of the code needs. `continue` jumps straight to the next iteration of the
`for` loop, skipping everything below it for this one file. Without this line, a
lesson file with a typo'd or missing frontmatter field would silently produce a
`DiscoveredLevel` with `level: NaN` or `title: undefined`, which would then sort
unpredictably and render as a broken card — better to skip a malformed file
entirely than display it broken. This is new behavior that didn't exist before:
today's hand-typed `series.ts` has no equivalent safety net at all, because a human
typed the numbers directly and TypeScript's `SeriesMeta` interface only checks that
*something* of the right type is there, not that it's correct.

`levels.sort((a, b) => a.level - b.level)` sorts each series's discovered levels by
their **numeric** level field — not by file name, not alphabetically. This avoids a
classic bug: sorting strings like `'level-10.md'` and `'level-2.md'`
*alphabetically* would put `level-10` before `level-2`, because the string
comparison looks at the character `'1'` before ever reaching `'2'`. Sorting by the
already-parsed numeric `level` field sidesteps that trap entirely — contrast this
with `courseLoader.js`, which has to regex-extract an order number out of its
filenames (`{N}-{lessonSlug}.js`) because those files have no frontmatter to read a
number from directly. Your lesson files are better-equipped for this than
`courseLoader.js`'s files are, and the code reflects that — always let the data you
actually have shape the code, rather than copying a pattern that solved a slightly
different problem.

`getLevelsForSeries` is the module's one meaningful export beyond `LESSON_FILES` —
a small, named function, not a raw `Map` exposed to every caller. **SE lens:**
exposing a function instead of the `Map` itself means nothing outside this file can
accidentally mutate `levelsBySeriesId` — the module controls how its own internal
state can be read, a basic form of encapsulation.

**3d. Update `series.ts` to stop hand-typing what's now discovered.** The series-
level fields — `label`, `emoji`, `description` — have no home in per-lesson
frontmatter (a lesson file has no reason to repeat its whole series' marketing
description), so they legitimately stay hand-authored here. Only the `levels`
array, which is fully derivable, goes away:

```typescript
import { getLevelsForSeries } from './contentLoader'

export interface SeriesMeta {
  id: string
  label: string
  lang: string
  emoji: string
  description: string
  levels: { level: number; title: string; file: string }[]
}

const SERIES_METADATA: Omit<SeriesMeta, 'levels'>[] = [
  {
    id: 'python-fundamentals',
    label: 'Python Fundamentals',
    lang: 'python',
    emoji: '🐍',
    description: 'Learn Python the way professionals think about it...',
  },
  // ... the other five series, same fields, no `levels` array anymore
]

export const SERIES: SeriesMeta[] = SERIES_METADATA.map(series => ({
  ...series,
  levels: getLevelsForSeries(series.id),
}))

export function getSeries(id: string): SeriesMeta | undefined {
  return SERIES.find(s => s.id === id)
}
```

**Walkthrough:** `Omit<SeriesMeta, 'levels'>` is a TypeScript utility type meaning
"every field of `SeriesMeta` except `levels`" — exactly the shape of the data a
human should still be typing by hand, now that `levels` is computed. `SERIES_METADATA.map(series => ({ ...series, levels: getLevelsForSeries(series.id) }))`
takes each hand-authored series entry and **spreads** it (`...series` copies every
existing field into a new object) while adding one computed field, `levels`, from
the loader you just wrote. `getSeries` and every consumer of `SERIES` — including
`SeriesListView` and `LevelListView` in `LessonEngineLab.tsx` — needs **no changes
at all**, because `SeriesMeta`'s shape, and `SERIES`'s shape as an array of them,
are unchanged. Only *how* `levels` gets filled in changed. **SE lens:** this is a
deliberately narrow refactor — it changes where data comes from without changing
the type or shape anything downstream depends on, which is what keeps the blast
radius of this change small and the risk of breaking unrelated code low.

**3e. Update `LessonEngineLab.tsx`.** Delete the entire block of 55+ `?raw` imports
and the entire hand-typed `LESSON_FILES` object literal. Replace both with:

```typescript
import { LESSON_FILES } from './contentLoader'
```

Everything else in `LessonEngineLab.tsx` — `openLesson`, `LevelListView`,
`SeriesListView`, the `View` discriminated union, `markComplete` — is unchanged,
because they only ever depended on `LESSON_FILES` being "some object mapping a file
path to that file's raw text," and it still is exactly that.

### Step 4 — Verify Nothing Regressed

Run `npm run dev`. Click through every series — Python Fundamentals, DSA, C++, C#,
Java, HTML/DOM. Every level that worked before this change must still open and
render identically. Complete a lesson and confirm "next lesson" still advances
correctly, and that your `oc-lesson-progress` entries in `localStorage` (unaffected
by this change — they're keyed by `${series.id}:${level}`, and both of those still
come from the same places) still mark levels as done. If TypeScript complains
anywhere (`npm run typecheck`), read the error — it's telling you a real mismatch,
not a formality to silence.

### Step 5 — Prove Autofind Actually Works

Create `src/labs/lesson-engine/content/html-dom/level-2.md`:

```markdown
---
series: html-dom
level: 2
title: Event Listeners
lang: html
---

# Event Listeners

This is a second practice lesson, added the new way — one file, nothing else.

## addEventListener

`element.addEventListener('click', handler)` registers `handler` to run every
time `element` is clicked.
```

Do not touch `series.ts`. Do not touch `LessonEngineLab.tsx`. Do not write any
import statement. Refresh the running app and open HTML, DOM, and JavaScript.
"Event Listeners" appears as level 2, in the correct order, with the correct title
— read entirely from the file you just created.

Now revisit the Lesson 1 bug directly. Open `html-dom/level-1.md` and change its
`level: 1` to `level: 5` — the same kind of typo that caused the silent "next
lesson" bug in Lesson 1. Refresh. Notice what's different this time: there is now
only **one** number for this file's level, because `contentLoader.ts` reads it
fresh from the frontmatter every time the app loads, and `series.ts` no longer
holds a second, independently-typed copy to disagree with it. The level ordering
and "next lesson" logic simply follow whatever the frontmatter says — correctly,
automatically, because there's nothing left for it to disagree with. Change it back
to `level: 1` afterward for a clean, sensible practice series (0, 1, 2).

---

## Connect the Pieces

Before this lesson: a lesson file's frontmatter was one of *three* places a fact
about that lesson lived, and the other two (`series.ts`'s `levels` array,
`LessonEngineLab.tsx`'s import list and `LESSON_FILES` map) had to be updated by
hand, in sync, forever. After this lesson: the frontmatter is the *only* place that
fact lives. `contentLoader.ts` reads every lesson file once, at load time, using
the exact same static-analysis glob mechanism this codebase already trusts in
`courseLoader.js`, `labLoader.js`, and `seriesLoader.js`, and the exact same
frontmatter parser (`parseFrontmatter`) `parseLesson` already relied on to open a
single lesson correctly. Nothing new was invented — existing, working, already-
trusted pieces were connected differently. `series.ts` keeps exactly the
information that doesn't belong in a lesson file (series-wide label, emoji,
description) and loses exactly the information that was always redundant.

---

## What Breaks Without This

Without `?raw` and `query`/`import` options passed correctly to `import.meta.glob`,
`RAW_FILES`'s values would be resolved as actual JavaScript/TypeScript modules
(Vite's default behavior for `.md`... except Vite has no default transform for
`.md` at all, so the import would fail outright) rather than plain text —
`parseFrontmatter(raw)` would receive something that isn't a string and throw.
Without the guard clause in Step 3c (`if (!meta.series || ...) continue`), one
lesson file with a typo'd frontmatter field would inject a broken, half-populated
card into a series' level list with no warning, harder to notice than the old
system's TypeScript-checked (if redundant) hand-typed array. Without sorting by
the numeric `level` field specifically — sorting by file path string instead —
`level-10.md` would be ordered before `level-2.md` the moment any series grows past
nine levels, exactly the classic alphabetical-vs-numeric sorting bug named in
Step 3.

---

## Definition of Done

- [ ] `parseFrontmatter` is exported from `src/engine/lesson/parser.ts` — no other
      change to that file
- [ ] `src/labs/lesson-engine/contentLoader.ts` exists, exports `LESSON_FILES` and
      `getLevelsForSeries`, and uses an eager `import.meta.glob` over
      `./content/**/*.md`
- [ ] `series.ts`'s hand-typed `levels` arrays are gone; `SERIES` is built by
      mapping `SERIES_METADATA` through `getLevelsForSeries`
- [ ] `LessonEngineLab.tsx` no longer contains any `?raw` import or hand-typed
      `LESSON_FILES` literal — it imports `LESSON_FILES` from `contentLoader.ts`
- [ ] Every series and every previously-working level still opens and renders
      correctly in `npm run dev` (Step 4)
- [ ] `html-dom/level-2.md` was added with zero edits to any other file, and
      appeared correctly in the running app (Step 5)
- [ ] You reproduced the Lesson 1 "mismatched level" scenario against the new
      system and can explain, concretely, why the old bug can no longer occur
- [ ] `npm run typecheck` passes with no new errors
- [ ] You can explain, without notes, the difference between `eager: true` and the
      default lazy glob, and name the real place in this codebase
      (`courseLoader.js`) that deliberately uses both in the same file
- [ ] `git commit` with a message explaining why — for example: "Replace hand-typed
      lesson registry with autofind via import.meta.glob — adding a lesson now
      requires only a correctly-frontmattered file, closing the class of bug where
      a lesson file's level disagreed with series.ts's copy of it"

---

## Leftover Cleanup Worth Doing (Not Required Above)

While reading this system end-to-end, two things turned up that are worth knowing
about even though fixing them isn't part of this lesson's Definition of Done:

**Dead code:** `src/labs/lesson-engine/LessonEngineDemo.tsx` and its companion
`demoLesson.md` are not imported anywhere in the app anymore — `LessonEngineLab.tsx`
is what actually ships. A quick check (`grep -rn "LessonEngineDemo" src`) turns up
only the file's own definition. It was very likely an early prototype of this same
screen, left behind after `LessonEngineLab.tsx` replaced it. Worth deleting once
you're confident nothing references it — but do that as its own deliberate, small
commit, not folded into this lesson's autofind work.

**No duplicate-level protection:** `contentLoader.ts` as designed here will
silently let two files in the same series both claim `level: 3` — whichever one
`Object.entries` happens to iterate last simply overwrites the first in
`levelsBySeriesId`. A small, natural follow-up (not attempted here, to keep this
lesson's scope to autofind itself) would be a `console.warn` in the loop when
`existing.some(l => l.level === level.level)` is true before pushing — cheap
insurance against the next typo, now that there's exactly one place left to type
a level number correctly.
