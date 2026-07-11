# Lesson 1 — How the Lesson Engine Finds Its Content

Today we study **single source of truth** and **data duplication as a bug source**.
Our case study is UpSkillOS's own Lesson Engine — the real code at
`src/labs/lesson-engine/` — and the exact mechanism it uses today to know which
lessons exist and where their content lives.

This is not the fictional "full stack education platform" case study elsewhere in
`src/docs/`. Every file path, every line of code, and every bug described in this
lesson is real, live code in this repository, right now. You are not learning a
simulation of your app. You are learning your app.

By the end of this two-lesson set you will understand every piece well enough to
design and build **autofind** — a change that lets you drop a new lesson file into
a folder and have it appear in the running app with zero code edits, instead of the
three hand-edits the system requires today. This lesson (Lesson 1) is purely about
understanding the current system, in enough depth that the problem becomes obvious
in your own hands, not just asserted to you. Lesson 2 builds the fix.

---

## What You Will Build

You will hand-add one new, trivial lesson level to the running app, following the
*exact* process the codebase requires today — no shortcuts. You will edit three
separate files to make one new fact ("a level 1 lesson exists in the html-dom
series") show up. You'll run the app, click into your new lesson, and see it work.
Then you will deliberately reproduce a real bug this process causes — a lesson that
silently refuses to advance to "next lesson" — and explain exactly why it happens.
That bug is not hypothetical; it's sitting in the code you're about to read.

---

## What You Need to Know First

Nothing from a prior lesson — this is the first lesson in this set. You should be
comfortable running `npm run dev` and opening the app in a browser; that part isn't
re-taught here. Everything specific to *this app's* architecture — how it decides
what a "series" and a "level" are, how it loads Markdown files, how the TypeScript
types are shaped — is taught from scratch below.

---

## The Lesson

### Step 1 — The Three Files That Define One Lesson

Open the app (`npm run dev`), go to **Labs → Learn to Code**, and pick any series —
say, Python Fundamentals. You see a list of levels: "What Programming Is," "print(),"
"Variables," and so on, each a clickable card. That list, and the ability to click
into any one of them and see real lesson content, is built from exactly three
places in the codebase, and all three currently have to agree by hand:

**1. The content file itself** — e.g.
`src/labs/lesson-engine/content/python-fundamentals/level-4.md`:

```markdown
---
series: python-fundamentals
level: 4
title: print()
lang: python
---

# print()

`print()` appeared in every lesson so far, but it has been used without
explanation...
```

**2. The series registry** — `src/labs/lesson-engine/series.ts`:

```typescript
export interface SeriesMeta {
  id: string
  label: string
  lang: string
  emoji: string
  description: string
  levels: { level: number; title: string; file: string }[]
}

export const SERIES: SeriesMeta[] = [
  {
    id: 'python-fundamentals',
    label: 'Python Fundamentals',
    lang: 'python',
    emoji: '🐍',
    description: 'Learn Python the way professionals think about it...',
    levels: [
      // ...
      { level: 4,  title: 'print()',                      file: 'python-fundamentals/level-4.md'  },
      // ...
    ],
  },
  // ... five more series
]
```

**3. The component that loads the file into memory** —
`src/labs/lesson-engine/LessonEngineLab.tsx`:

```typescript
import pfLevel4  from './content/python-fundamentals/level-4.md?raw'
// ... 54 more lines exactly like this one, one per lesson file in the whole app

const LESSON_FILES: Record<string, string> = {
  // ...
  'python-fundamentals/level-4.md':  pfLevel4,
  // ... 54 more lines exactly like this one
}
```

Notice what just happened: the string `'print()'` was typed by hand in two places
(the file's own frontmatter, and `series.ts`). The number `4` was typed by hand in
two places (the frontmatter, and `series.ts`). The path
`'python-fundamentals/level-4.md'` was typed by hand in *three* places (the
frontmatter says which series/level it belongs to; `series.ts`'s `file` field
repeats the path; `LessonEngineLab.tsx`'s import statement and map key repeat it
again). Nothing enforces that these three copies stay in agreement. A human has to
remember to update all three, every time, forever.

**CS lens:** This is **data duplication** — the same fact represented in more than
one place with no mechanism keeping the copies consistent. In database design this
exact problem has a name — a failure of *normalization* — and the fix is always the
same: store the fact once, in the place that's authoritative for it, and derive
every other view of it from that one place.

**SE lens:** This is a **single source of truth** violation. The frontmatter block
in the `.md` file is *already* authoritative — it's the thing a human edits when
they want to change a lesson's title or level. `series.ts` and the import list in
`LessonEngineLab.tsx` are not additional facts; they're stale photocopies of facts
that live elsewhere. Every additional photocopy is one more place a typo can live
undetected.

### Step 2 — Reading `series.ts` Precisely

`SeriesMeta` is a TypeScript `interface` — a named shape that any object claiming to
be a `SeriesMeta` must match. TypeScript checks this at compile time (when you run
`tsc` or when Vite transforms the file); it is not checked while your code is
running, because interfaces don't exist anymore once the code is compiled to plain
JavaScript. They're a tool for catching mistakes *before* the code ever runs, not a
runtime validation mechanism.

`levels: { level: number; title: string; file: string }[]` is an **inline object
type** followed by `[]` — an array of objects, where TypeScript checks that every
element of the array has exactly a numeric `level`, a string `title`, and a string
`file`. This inline shape isn't reused anywhere else, so it wasn't worth giving its
own named interface — a small, deliberate design choice: name a type when it's
reused or when the name adds clarity; leave it inline when it's used exactly once
and the shape is self-explanatory next to its field.

`export const SERIES: SeriesMeta[] = [ ... ]` is a **module-level constant** — an
array literal, typed as `SeriesMeta[]`, computed once when this file is first
imported, and shared by reference by every component that imports `SERIES`. There
is exactly one `SERIES` array in the whole running app; `SeriesListView` and
`LevelListView` in `LessonEngineLab.tsx` both read from this same object.

`getSeries(id: string): SeriesMeta | undefined` at the bottom of the file does a
linear search: `SERIES.find(s => s.id === id)`. `Array.prototype.find` walks the
array from index 0, returns the first element for which the callback returns
`true`, and returns `undefined` if nothing matches — hence the `| undefined` in the
return type. TypeScript forces you to acknowledge the possibility that no series
with that `id` exists, rather than letting you silently assume it always will.

### Step 3 — Reading the Import List and `LESSON_FILES`

`import pfLevel4 from './content/python-fundamentals/level-4.md?raw'` is an **ES
module static import**. In plain JavaScript/TypeScript, `import` statements must
name their source as a literal string, written at the top of the file, and the
JavaScript engine (or in this case, Vite, which processes the file before the
browser ever sees it) resolves every import *before* any of your code runs. This is
different from calling a function — you cannot compute an import path with a
variable and hand it to `import`. That constraint matters a lot in Lesson 2, so hold
onto it.

The `?raw` on the end of the path is not part of the file's actual name. It's a
**query suffix** that Vite's plugin pipeline recognizes and intercepts. Normally,
importing a file hands it to whatever transform pipeline matches its extension —
`.tsx` goes through the TypeScript/JSX compiler, `.css` goes through the CSS
pipeline, and so on. A `.md` file has no such pipeline; Markdown isn't executable
code. `?raw` tells Vite: skip all of that, and just hand me this file's exact bytes
as a JavaScript string. That's why `pfLevel4` ends up holding the literal text
`"---\nseries: python-fundamentals\n..."` rather than some parsed object — `?raw`
performs no parsing at all. Parsing that string into something usable is a
completely separate step, done later, by a different piece of code (Step 4, below).

`const LESSON_FILES: Record<string, string> = { ... }` — `Record<K, V>` is a
TypeScript **utility type** meaning "an object whose keys are all of type `K` and
whose values are all of type `V`." `Record<string, string>` says: this is a plain
object, every key is a string, every value is a string. It's exactly the map you'd
reach for to answer the question "given this file path, give me that file's raw
text" — and that's precisely how it's used a few lines later:

```typescript
function openLesson(file: string, series: SeriesMeta) {
  const raw = LESSON_FILES[file]
  if (!raw) return
  setView({ kind: 'lesson', lesson: parseLesson(raw), series })
}
```

`LESSON_FILES[file]` is an **object property lookup by computed key** — `file` is a
runtime string value (it came from clicking a level card), and JavaScript looks up
whichever key in the object matches that string. This works *only* because every
path string in `series.ts`'s `levels[].file` field was typed to match, character
for character, one of the keys hand-typed into `LESSON_FILES`. That's a fourth
place the same string has to agree.

**A discriminated union, while we're here:** a few lines above, `LessonEngineLab.tsx`
declares:

```typescript
type View =
  | { kind: 'series-list' }
  | { kind: 'level-list'; series: SeriesMeta }
  | { kind: 'lesson'; lesson: ParsedLesson; series: SeriesMeta }
```

**CS lens:** This is a **tagged union** (also called a discriminated union or sum
type) — a type that can be exactly one of several distinct shapes, distinguished by
a common field (`kind`) whose value is a fixed string literal per shape. It is a
compile-time-checked, three-state **finite state machine**: the UI is always in
exactly one of `series-list`, `level-list`, or `lesson`, and TypeScript will not let
code read `view.lesson` unless it has first confirmed `view.kind === 'lesson'`
(look at how the `{view.kind === 'lesson' && (() => { ... })()}` block works — that
`&&` check is what TypeScript uses to *narrow* the type inside the block). This
recurs constantly in real software: Redux action types, HTTP response types
(`{ status: 'ok', data } | { status: 'error', message }`), React Router's loader
states, and Rust's `enum` (where this pattern is a first-class language feature
rather than a TypeScript convention) all use exactly this shape.

**SE lens:** This makes invalid states **unrepresentable**. There is no way to
construct a `View` that claims to be showing a lesson without also providing that
lesson's data — the type system physically will not allow it. Compare that to a
looser design like `{ screen: string; lesson?: ParsedLesson; series?: SeriesMeta }`,
where you could accidentally set `screen = 'lesson'` while `lesson` is still
`undefined`, and nothing would catch it until the app crashed at runtime.

### Step 4 — Where the Frontmatter Actually Gets Parsed

`LESSON_FILES[file]` gives you the *raw text* of a lesson — frontmatter, Markdown,
code fences, all of it, still one big string. Turning that string into something
the UI can render (a title, a list of steps, runnable code blocks) is the job of
`parseLesson`, in `src/engine/lesson/parser.ts`:

```typescript
function parseFrontmatter(md: string): { meta: Record<string, string>; body: string } {
  const m = md.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/)
  if (!m) return { meta: {}, body: md }
  const meta: Record<string, string> = {}
  for (const line of m[1].split('\n')) {
    const i = line.indexOf(':')
    if (i === -1) continue
    meta[line.slice(0, i).trim()] = line.slice(i + 1).trim()
  }
  return { meta, body: m[2] }
}
```

**Walkthrough:** `md.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/)` runs a regular
expression against the whole file text. `^---\n` requires the file to start with
three dashes and a newline — the frontmatter fence. `([\s\S]*?)` is a **capture
group** matching any character *including newlines* (`.` in JavaScript regex does
not match `\n` by default; `[\s\S]` — "whitespace or non-whitespace" — is a common
trick meaning "literally any character," used here because the frontmatter block
spans multiple lines). The `?` after `*` makes it **non-greedy**: match as few
characters as possible, so it stops at the *first* closing `---` rather than
swallowing the rest of the file looking for the last one. `\n---\n?` matches the
closing fence. The second `([\s\S]*)` captures everything after it — the lesson
body. If the regex doesn't match at all (`m` is `null`), the function assumes there
was no frontmatter and returns the whole input as `body` with empty `meta` — a
graceful fallback rather than a thrown error.

The `for` loop then walks each line inside the captured frontmatter block. For a
line like `series: python-fundamentals`, `line.indexOf(':')` finds the position of
the first colon, `line.slice(0, i).trim()` gives `'series'`, and
`line.slice(i + 1).trim()` gives `'python-fundamentals'`. This is a hand-rolled,
minimal YAML-like parser — it does not handle nested structures, lists, or quoted
strings, because the lesson engine's frontmatter never needs them. It handles
exactly the four flat `key: value` pairs every lesson file uses:
`series`, `level`, `title`, `lang`.

A few lines later, inside `parseLesson` (the function actually exported and used by
`LessonEngineLab.tsx`):

```typescript
export function parseLesson(markdown: string): ParsedLesson {
  const { meta, body } = parseFrontmatter(markdown)
  // ...
  return {
    title,
    series: meta.series ?? 'unknown',
    level: parseInt(meta.level ?? '0', 10),
    // ...
  }
}
```

**This is the part that matters most for this lesson:** `meta.series` and
`meta.level` — the *exact same* series id and level number that a human also typed
by hand into `series.ts` — are already being read out of the file, correctly,
every single time a lesson is opened. The code that could answer "what series and
level is this file?" without any help from `series.ts` already exists. `series.ts`
is not filling a gap. It's re-answering a question the codebase can already answer
itself, using a second, unconnected, hand-maintained copy of the answer.

`??` is the **nullish coalescing operator**: `meta.series ?? 'unknown'` evaluates to
`meta.series` unless it is `null` or `undefined`, in which case it evaluates to
`'unknown'`. `parseInt(meta.level ?? '0', 10)` converts the string `'4'` to the
number `4` — `10` is the **radix** (base), explicitly passed because `parseInt`
without a radix can, in rare cases with leading zeros, guess base-8 instead of
base-10; always pass `10` when you mean decimal.

### Step 5 — Feel the Pain: Add a Lesson the Current Way

Now do it yourself, exactly as the codebase requires today. This is deliberately
tedious — the tedium is the point.

**5a.** Create `src/labs/lesson-engine/content/html-dom/level-1.md`:

```markdown
---
series: html-dom
level: 1
title: The DOM Tree
lang: html
---

# The DOM Tree

Every HTML element becomes a node in the browser's in-memory tree — the DOM
(Document Object Model). This is a practice lesson stub; it exists only to
demonstrate the current lesson-registration process.

## Why This Matters

`document.getElementById('x')` walks this tree looking for a matching `id`.
```

**5b.** Open `src/labs/lesson-engine/series.ts`. Find the `html-dom` series entry,
and add a second level to its `levels` array:

```typescript
{
  id: 'html-dom',
  label: 'HTML, DOM, and JavaScript',
  lang: 'html',
  emoji: 'DOM',
  description: 'Teach browser programming with separate HTML, CSS, and JavaScript tabs plus a live preview for DOM manipulation lessons.',
  levels: [
    { level: 0, title: 'Change the Page with JavaScript', file: 'html-dom/level-0.md' },
    { level: 1, title: 'The DOM Tree',                     file: 'html-dom/level-1.md' },  // ← you add this line
  ],
},
```

**5c.** Open `src/labs/lesson-engine/LessonEngineLab.tsx`. Add an import near the
other `htmlDomLevel0` import:

```typescript
import htmlDomLevel0 from './content/html-dom/level-0.md?raw'
import htmlDomLevel1 from './content/html-dom/level-1.md?raw'  // ← you add this line
```

And add it to the `LESSON_FILES` map:

```typescript
'html-dom/level-0.md': htmlDomLevel0,
'html-dom/level-1.md': htmlDomLevel1,  // ← you add this line
```

**5d.** Run `npm run dev` (if it wasn't already running). `npm` is the Node Package
Manager CLI, installed alongside Node.js; `run dev` tells it to execute the script
named `"dev"` in `package.json`, which (per this repo's `package.json`) runs a few
build-prep scripts and then starts `vite` — Vite's development server. That server
listens on `localhost` (a special network address meaning "this same machine" — no
data leaves your computer) on a port (commonly `5173` for Vite; check the terminal
output for the exact one), compiles files on request, and pushes updates to your
browser automatically when files change, a feature called **Hot Module Replacement
(HMR)**. Note: HMR reliably picks up *edits* to files it already knows about, but
brand-new files matching a pattern it hasn't scanned yet sometimes need a full
browser refresh (or a dev-server restart) to be noticed — if your new level doesn't
show up, refresh the page before assuming something's broken.

Navigate to **Labs → Learn to Code → HTML, DOM, and JavaScript**. You should now see
two levels: "Change the Page with JavaScript" and "The DOM Tree." Click into "The
DOM Tree" — it renders.

**You just made one true fact — "a level 1 lesson exists in html-dom" — and typed it
by hand in three different files, in three different formats (a frontmatter block,
an object literal, and an import statement).** That is the system working exactly
as designed. Lesson 2 replaces this design.

### Step 6 — Reproduce a Real Bug Caused By This Duplication

Look again at how `LessonEngineLab.tsx` decides what "next lesson" to open after you
complete one:

```typescript
{view.kind === 'lesson' && (() => {
  const currentIdx = view.series.levels.findIndex(l => l.level === view.lesson.level)
  const nextLevel = view.series.levels[currentIdx + 1]
  return (
    <LessonView
      // ...
      onComplete={() => {
        markComplete(view.series.id, view.lesson.level)
        if (nextLevel) openLesson(nextLevel.file, view.series)
        else setView({ kind: 'level-list', series: view.series })
      }}
    />
  )
})()}
```

**Walkthrough:** `view.lesson.level` is the level number *as parsed from the
file's own frontmatter* by `parseLesson` (Step 4). `view.series.levels` is the
hand-typed array from `series.ts` (Step 2). `findIndex` searches that hand-typed
array for an entry whose `level` field equals the frontmatter's level number, and
`nextLevel` is whatever comes immediately after it in the array.

Now deliberately break it. In your `html-dom/level-1.md` frontmatter, change
`level: 1` to `level: 2` — a realistic typo; nothing stops the frontmatter number
from disagreeing with the number you already typed in `series.ts`. Save, refresh,
open "Change the Page with JavaScript" (level 0), and click through to completion.

**What happens:** `view.lesson.level` for the file you're completing is `0`
(correct — it's still `level: 0` in *its* frontmatter). `findIndex` looks for
`0` in `series.ts`'s `levels` array, finds it at index `0`. `nextLevel` is
`series.levels[1]`, which is your "The DOM Tree" entry — `series.ts` still says its
`level` is `1`, because you only edited the `.md` file's frontmatter, not
`series.ts`. `openLesson(nextLevel.file, ...)` opens `html-dom/level-1.md` by
*path* — paths still match, so it opens fine. But now `view.lesson.level` (freshly
parsed from that file) is `2`, while `series.ts` still lists it under `level: 1`.

Complete *that* lesson too, and watch `findIndex` search for `2` in a `levels`
array that only contains `0` and `1`. It finds nothing, returns `-1`.
`series.levels[-1 + 1]` is `series.levels[0]` — **it silently loops back to level 0**
instead of advancing or finishing the series. No error. No warning. The student
just gets sent to the wrong lesson, and nothing in the running app tells anyone why.

Revert your typo (`level: 2` back to `level: 1`) before moving on.

**This is the concrete cost of three hand-synced copies of the same fact:** not a
crash, not a compile error — a silent, wrong navigation that only reveals itself as
a confusing user experience, caused by a single-character edit in a file that
looked unrelated to the bug it produced.

---

## Connect the Pieces

The full path a click takes today: a level card in `LevelListView` is rendered from
`series.ts`'s hand-typed `levels` array → clicking it calls `onSelectLevel(file)`
with the hand-typed `file` string → `openLesson` looks that string up in the
hand-typed `LESSON_FILES` map (built from 55+ hand-typed `?raw` imports) → the raw
text found there is handed to `parseLesson`, which *re-derives* the series id and
level number from the file's own frontmatter — the same series id and level number
already sitting, hand-typed, in the `series.ts` entry that got you here in the
first place.

Three files, three formats, one fact, and — as Step 6 showed — no guarantee they
agree. `series.ts`'s `levels` array and `LessonEngineLab.tsx`'s `LESSON_FILES` map
aren't new information. They're an index over information the frontmatter already
contains. Lesson 2 is about building that index automatically, from the files
themselves, instead of typing it by hand — the general technique is called
**autofind** or **auto-discovery**, and (spoiler, for Lesson 2) this exact codebase
already uses it successfully in three other places: `src/courses/courseLoader.js`,
`src/labs/labLoader.js`, and — closest of all to what we need —
`src/labs/vue-studio/series/spreadsheet/seriesLoader.js`.

---

## What Breaks Without This

Demonstrated concretely in Step 6: a level number that disagrees between a lesson
file's frontmatter and `series.ts`'s hand-typed copy causes `findIndex` to return
`-1` inside `LessonEngineLab.tsx`'s "next lesson" logic, silently sending the
learner back to the first level of the series instead of advancing — with zero
error message anywhere. There's a second, quieter failure mode too: add a `?raw`
import and a `LESSON_FILES` entry for a file, but forget the corresponding
`series.ts` entry, and the file's full text is bundled into the app (it costs
download size for every user) but is permanently unreachable — no card ever points
to it. Forget it the other way (add to `series.ts` but not `LESSON_FILES`), and
`LevelListView`'s `isReady = !!available[lvl.file]` check is `false`, so the card
renders permanently disabled with a "Coming soon" label, even though the file
exists right there in the `content/` folder.

---

## Definition of Done

- [ ] `src/labs/lesson-engine/content/html-dom/level-1.md` exists and is a valid
      practice lesson with correct frontmatter (`level: 1`, matching `series.ts`)
- [ ] It appears as a clickable, working level under HTML, DOM, and JavaScript in
      the running app (`npm run dev`)
- [ ] You can name, without looking back at this lesson, the three files that had
      to change to make one new lesson appear, and what role each one plays
- [ ] You can explain what `?raw` does to an import, and why `.md` files need it
- [ ] You can explain what `parseFrontmatter` does and point to the exact regex
      capture group that grabs the frontmatter block
- [ ] You reproduced the mismatched-level "next lesson" bug from Step 6 and can
      explain, in your own words, why `findIndex` returning `-1` sends the learner
      to the wrong lesson instead of throwing an error
- [ ] `git commit` with a message explaining *why*, not just what — for example:
      "Add html-dom level 1 as a practice lesson to trace the current three-file
      lesson-registration process before replacing it with autofind in the next
      lesson"
