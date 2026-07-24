# Lesson 1 — One Source of Truth for Lab Metadata

## What You Will Build

By the end of this lesson, `src/labs/registry.js` — a 41-entry hand-typed
array that had to be kept in sync by hand with every lab folder it
described — is gone. In its place: one `meta.js` file living next to each
lab, and a tiny loader that globs all of them into the same `LABS` array
every other part of the app already expects. Adding a new lab's metadata
now means creating one file in one folder — nothing else, no central
registry to remember to update. This is the exact same problem, and the
exact same fix, this curriculum already solved once for lesson content
(`lesson-engine-autofind/02-...md`) — here it's applied to a sibling
registry that was still doing it the old, hand-synced way.

This lesson describes real code applied to the real, running app. Every
snippet below was actually typed and actually run this session — the
outputs shown are real, not paraphrased.

## What You Need to Know First

`lesson-engine-autofind/02-building-autofind-with-import-meta-glob.md` —
assumed fresh, not re-explained here:
- what `import.meta.glob(pattern, { eager: true })` returns and why the
  pattern must be a literal string (static analysis, not dynamic
  resolution);
- the eager-vs-lazy tradeoff, and this exact codebase's own precedent for
  choosing eager specifically for small, always-needed metadata;
- `Object.entries(...).map(([path, mod]) => ({...}))` turning a glob's
  `{path: module}` object into an array of structured records, and
  `.sort(...)` with a comparator function to control display order —
  both walked through against `seriesLoader.js` in that lesson's Step 2.

If any of that isn't fresh, reread that lesson before this one — nothing
below re-teaches it.

---

## The Lesson

### Where You're Working

Two files already existed and already worked, in a way worth being precise
about before changing anything:

`src/tools/toolLoader.js` (unchanged by this lesson — the pattern being
mirrored):
```js
const META = import.meta.glob('./*/meta.js', { eager: true })

export const TOOLS = Object.entries(META)
  .map(([path, mod]) => ({
    key: path.split('/')[1],
    ...mod.default,
  }))
  .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
```

`src/labs/registry.js` (deleted by this lesson): a 492-line file, one
hand-typed object literal per lab, 41 of them, each duplicating fields
(`label`, `emoji`, `desc`, `tags`, `cover`, ...) that a lab's own code
already half-knew about itself in ~26 cases (an inline
`export const meta = {...}` already sat in the lab's own `index.jsx`,
read separately by `labLoader.js` when that lab was actually opened).
Two places, two different subsets of the same facts, kept in sync by a
human remembering to edit both.

### Concept Unit: Nullish Coalescing (`??`)

#### The Problem

`toolLoader.js`'s sort line — `(a.order ?? 0) - (b.order ?? 0)` — needs to
do the same job in the new lab loader: some labs will have an explicit
`order` field, some won't, and the ones without one need to default to
some number rather than making the whole sort blow up on `undefined`.
The obvious-looking `a.order || 0` looks like it does the same thing.
It doesn't, and the difference is exactly the kind of thing that passes
code review and then breaks in production three months later.

#### Introduce the Concept in Isolation

```js
const order = 0
console.log('order || 100 :', order || 100)
console.log('order ?? 100 :', order ?? 100)
```

Run, real output:
```
order || 100 : 100
order ?? 100 : 0
```

**What this proves:** `||` (logical OR) substitutes its right-hand side
whenever the left side is *any* JavaScript falsy value — `0`, `''`,
`false`, `NaN`, `null`, or `undefined`. `??` (nullish coalescing)
substitutes its right-hand side *only* when the left side is specifically
`null` or `undefined`. Here, `order` is legitimately `0` — a real,
meaningful value (this lab really is first) — and `||` steamrolls right
over it, silently replacing a real `0` with `100`. `??` leaves it alone.

#### Discard the Throwaway Example

That two-line snippet doesn't appear in the project. It existed only to
show the difference; the real comparator is below.

#### Project Change

- **File:** `src/labs/labRegistryLoader.js` (new file, created by this
  lesson)
- **Change type:** add (new file, mirrors `toolLoader.js` exactly for this
  one line)
- **Location:** the `.sort(...)` call, same position `toolLoader.js`
  already uses it
- **Dependencies:** none beyond what `import.meta.glob` already needs

#### The New Code

```js
.sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
```

#### The Updated Project

```js
// src/labs/labRegistryLoader.js
const META = import.meta.glob('./*/meta.js', { eager: true })

export const LABS = Object.entries(META)
  .map(([path, mod]) => ({
    key: path.split('/')[1],
    ...mod.default,
  }))
  .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))  // ← new
```

The whole file is six lines. `LABS` is now a fully-populated, correctly-
ordered array built entirely from disk contents — no line of it is
hand-typed data.

#### Mechanical Walkthrough
Enumerating the new line specifically, left to right: `a` and `b` are the
- two comparator parameters `.sort()` always passes — two elements of the
array being compared, already-established syntax from `toolLoader.js`'s
own `.sort()` (Repetition Rule: reminder only, not re-explained). `.order`
- is a plain property access.
- `??` is this unit's new concept — substitutes
`0` only if the left side is `null`/`undefined`. The subtraction `- `
between the two resulting numbers is the already-standard "sort
ascending by numeric field" comparator shape, same as
`seriesLoader.js`'s `a.slug.localeCompare(b.slug)` slot, just doing
subtraction instead of `localeCompare` because `order` is a number, not a
string.

#### CS Lens

This is default-value coalescing over an "absence" state — distinguishing
"no value provided" from "a real, present, falsy value." **Recognized
in:** Python's `dict.get(key, default)` (only substitutes on missing key,
not on a falsy stored value); Rust's `Option<T>::unwrap_or(default)`;
SQL's `COALESCE(column, default)`; C#'s own `??` operator (JavaScript
borrowed the syntax directly from it).

#### SE Lens

`||` predates `??` in JavaScript by decades and is still the right tool
when you genuinely want *any* falsy value replaced (a common one:
`options.label || 'Untitled'`, where an empty string title should fall
back just as much as a missing one). `??` is the right tool specifically
when zero, empty string, or `false` are legitimate, meaningful values that
must survive. Reaching for the familiar `||` out of habit, on a field
where `0` is a real answer, is exactly the kind of bug that looks correct
in every manual test (nobody tests "what if the first lab's order is
literally 0") and then quietly misorders one specific item in production.

#### Connect to What Came Before

`toolLoader.js` already made this exact choice, for this exact reason, for
tools. This unit is that same decision, verified from scratch and applied
to labs.

---

### Concept Unit: `Array.prototype.find()`

#### The Problem

`src/labs/labLoader.js` opens a lab's actual component on demand:

```js
// src/labs/labLoader.js (before this lesson)
const LOADERS = import.meta.glob('./**/index.{jsx,tsx}')

export async function getLabEntry(key) {
  const loader = LOADERS[`./${key}/index.tsx`] ?? LOADERS[`./${key}/index.jsx`]
  if (!loader) return null
  const mod = await loader()
  return {
    key,
    ...mod.meta,                          // ← reads meta off the SAME lazily-loaded module
    path: mod.meta?.path ?? `/lab/${key}`,
    component: mod.default,
  }
}
```

`mod.meta` worked because, until this lesson, a lab's metadata and its
component lived in the *same* file, so lazily loading the component also
happened to lazily load its metadata. Now that metadata lives in
`meta.js` and gets loaded *eagerly* by `labRegistryLoader.js` — a
completely separate module, already fully loaded by the time
`getLabEntry` runs — `mod.meta` no longer exists at all (nothing sets it).
This function needs a different way to find the metadata that matches
`key`.

#### Introduce the Concept in Isolation

```js
const labs = [
  { key: 'css-mastery', label: 'CSS 0 to Mastery' },
  { key: 'svg-studio', label: 'SVG Studio' },
]
console.log(labs.find((l) => l.key === 'svg-studio'))
console.log(labs.find((l) => l.key === 'does-not-exist'))
```

Run, real output:
```
{ key: 'svg-studio', label: 'SVG Studio' }
undefined
```

**What this proves:** `.find(predicate)` scans an array in order and
returns the *first* element for which `predicate` returns something
truthy — a single object, not an array (that's `.filter()`, a different
method for a different job). If nothing matches, it returns `undefined`
rather than throwing — the caller has to handle that case, which is
exactly what `meta?.path ?? ...` below already does with `?.`.

#### Discard the Throwaway Example

#### Project Change

- **File:** `src/labs/labLoader.js`
- **Change type:** replace
- **Location:** inside `getLabEntry`, the `...mod.meta` line and the two
  places that read `mod.meta`
- **Dependencies:** `LABS` from the new `src/labs/labRegistryLoader.js`
  (Concept Unit above)

#### The New Code

```js
const meta = LABS.find((l) => l.key === key)
```

#### The Updated Project

```js
// src/labs/labLoader.js
import { LABS } from './labRegistryLoader.js'          // ← new

const LOADERS = import.meta.glob('./**/index.{jsx,tsx}')

export async function getLabEntry(key) {
  const loader = LOADERS[`./${key}/index.tsx`] ?? LOADERS[`./${key}/index.jsx`]
  if (!loader) return null
  const mod = await loader()
  const meta = LABS.find((l) => l.key === key)         // ← new
  return {
    key,
    ...meta,                                            // ← changed: was ...mod.meta
    path: meta?.path ?? `/lab/${key}`,                  // ← changed: was mod.meta?.path
    component: mod.default,
  }
}
```

Everything else in this function — the `LOADERS` glob itself, the
early-return `if (!loader)`, awaiting the lazy `loader()` call, building
the final `{key, ..., component}` object shape — is unchanged, because
none of it depended on *where* metadata came from, only that some
metadata object existed to spread.

#### Mechanical Walkthrough
- `LABS.find(...)` — this unit's new concept, just introduced.
- `(l) => l.key === key` —
an arrow function (already-established syntax throughout this codebase)
- comparing with `===` (already-established).
- `meta?.path` — optional
chaining, already used one line below it in the original code
(`mod.meta?.path`), so not new here, just carried over onto the new
- variable name.
- `?? \`/lab/${key}\`` — this lesson's *other* new concept
(nullish coalescing, Concept Unit above), reappearing — brief reminder
only, not re-explained.

#### CS Lens

- `.find()` is a **linear search** — worst case, it inspects every element
before concluding nothing matches. **Recognized in:** a database doing a
full table scan when no index exists on the searched column; a browser's
`document.querySelector` walking the DOM when no ID/class index applies;
grep scanning a file line by line.

#### SE Lens

For 41 labs, a linear scan on every lab-open is irrelevant — it's a few
dozen comparisons, effectively instant. The alternative that *would*
matter at larger scale is a `Map` keyed by `key` (O(1) lookup instead of
- O(n)) — exactly the same `Map`-over-plain-object tradeoff already named in
`lesson-engine-autofind/02-...md`'s walkthrough of `levelsBySeriesId`.
Reaching for `.find()` here instead of building a `Map` is a deliberate
"don't solve a performance problem that doesn't exist yet" call, not an
oversight — if this list ever grows into the thousands, that's the
concrete signal to revisit it, not a reason to add the complexity now.

#### Connect to What Came Before

The previous unit fixed *how labs are ordered*; this one fixes *how a
specific lab's metadata is found* once ordering and eager-loading moved
to a different file than the component itself.

---

### Concept Unit: Splitting "What Describes It" from "Where It Lives"

#### The Problem, in Prose

Before this lesson, a lab's display metadata (label, emoji, description,
tags — small, and every lab's needed *all the time*, to render the
gallery/search grid before anyone opens anything) and its actual
component code (large — a whole React tree, only ever needed for the one
lab someone actually opens) were tangled in two inconsistent ways at
once: `registry.js` hand-duplicated the small facts centrally, while
~26 labs *also* kept a second, redundant copy of some of those same facts
inline in `index.jsx`, right next to the large component those facts had
nothing structurally to do with.

#### Introduce the Concept in Isolation

```js
// Metadata: tiny, worth having on hand for every book, always.
const bookMeta = { title: 'Dune', pages: 412 }

// Full text: huge, only worth loading for a book someone actually opens.
async function loadFullText() {
  const { default: text } = await import('./dune-text.mjs')
  return text
}

console.log('Metadata (instant, no await needed):', bookMeta)
console.log('Full text (only loaded on demand)...')
const text = await loadFullText()
console.log('Full text:', text)
```

Run, real output:
```
Metadata (instant, no await needed): { title: 'Dune', pages: 412 }
Full text (only loaded on demand)...
Full text: The spice must flow.
```

**What this proves:** the metadata line printed immediately, synchronously
— nothing to `await`, because it's just a small plain object sitting in
memory. The full text needed an `await` and a separate `import()` call —
it only exists on disk until something specifically asks to load it. Two
different loading strategies, chosen deliberately per how big the thing
is and how often it's needed, are exactly what `labRegistryLoader.js`
(eager, small, always) and `labLoader.js` (lazy, large, on-demand) already
do for labs — this toy version is the same shape with the specifics
stripped away.

#### Discard the Throwaway Example

#### Project Change

- **Files:** `src/labs/labRegistryLoader.js` (new — Concept Unit 1 above),
  `src/labs/labLoader.js` (modified — Concept Unit 2 above), and one
  `src/labs/<key>/meta.js` created per lab (41 new files; two shown in
  full below as worked examples, the rest mechanically identical)
- **Change type:** add + refactor
- **Dependencies:** none new beyond what's already in this lesson

#### The New Code — Worked Example A: Relocating an Existing Inline Meta

`src/labs/css-mastery/index.jsx` had this sitting at the top, before this
lesson, next to its full component:

```js
export const meta = {
  label: 'CSS 0 to Mastery',
  emoji: '🎨',
  color: 'fuchsia',
  path: '/web-learn/css-mastery',
  tags: ['CSS', 'Web', 'Interactive'],
  cover: { grad: 'from-fuchsia-600 via-pink-700 to-rose-950', mark: 'CSS', sub: 'Flex · Grid · Layout' },
}
```

It becomes `src/labs/css-mastery/meta.js` — a new, standalone file — with
the fields `registry.js` used to hand-duplicate merged in (`kind`,
`subject`, full `desc`, and the `order` field this lesson's first Concept
Unit exists to support):

```js
export default {
  label: "CSS 0 to Mastery",
  emoji: "🎨",
  color: "fuchsia",
  kind: "lesson",
  subject: "Web Dev",
  desc: "Deep-dive into the browser's layout engine. Learn the Box Model, Centering, Flexbox, Grid, Stacking Contexts, and more through interactive multi-tab challenges.",
  path: "/web-learn/css-mastery",
  tags: ["CSS", "Web", "Interactive", "Design", "Frontend"],
  cover: {
    grad: "from-fuchsia-600 via-pink-700 to-rose-950",
    mark: "CSS",
    sub: "Flex · Grid · Layout"
  },
  order: 9,
}
```

The old `export const meta = {...}` block still sits, unused, inside
`index.jsx` — nothing reads it anymore once `labLoader.js` switched to
`LABS.find(...)` (Concept Unit 2), but it isn't deleted by this lesson.
See **Leftover Cleanup Worth Doing** at the end.

#### The New Code — Worked Example B: Creating From Scratch

`src/labs/chemistry/` had no `index.jsx` at all before this lesson — it's
opened as an overlay panel via an `event` field, not a component file, so
its only home for metadata was `registry.js`. `src/labs/chemistry/meta.js`
(a brand-new folder and file):

```js
export default {
  label: "Chemistry Lab",
  emoji: "🧪",
  color: "cyan",
  desc: "Explore chemical reactions, periodic table data, and molecular structures interactively.",
  event: "chemistry",
  kind: "lab",
  subject: "Science",
  tags: ["Chemistry", "Lab", "Reactions", "Molecules", "Stoichiometry", "Elements"],
  cover: {
    grad: "from-cyan-700 via-teal-800 to-blue-950",
    mark: "⚗",
    sub: "Reactions · Molecules"
  },
  order: 25,
}
```

Same shape, same rules, no component file involved — `event` carries
over exactly as `registry.js` had it, `path` is simply absent because
this lab was never route-based.

The remaining ~39 labs (~24 more relocations from an existing `index.jsx`,
~9 more created fresh) are the same two mechanical moves repeated — not
narrated individually here, per this lesson's own scope.

#### The Updated Project

`labRegistryLoader.js` (Concept Unit 1, shown whole there) now globs all
41 of these `meta.js` files and produces one `LABS` array with every fact
`registry.js` used to hand-type, read from exactly one place per lab.
`labLoader.js` (Concept Unit 2, shown whole there) reads that same `LABS`
array to resolve a specific lab's metadata when it's actually opened.

#### Mechanical Walkthrough
- Nothing new syntactically in the `meta.js` files themselves — they're
plain object literals, `export default {...}`, no new language construct
over what registry.js's entries already were.

#### CS Lens

Separating a thing's *description* from its *payload* is the same idea
behind an HTTP `HEAD` request (fetch only the headers/metadata, skip the
body) versus a full `GET`; a library's card-catalog entry versus the
book on the shelf; a video platform's thumbnail-and-title (loaded for
every video in a feed) versus the video stream itself (loaded only for
the one clicked). **Also recognized in:** a package registry's manifest
(`package.json`) versus the package's actual source; an email inbox's
subject-line list versus each message body; a filesystem's directory
inode versus the file's actual data blocks.

#### SE Lens

- The alternative this lesson removes — `registry.js` hand-duplicating
facts a lab's own code also knew — is a **single source of truth**
violation: exactly the "three hand-synced copies" bug class
`lesson-engine-autofind/02-...md` already named for lesson content,
here recurring for a completely different registry in the same app. The
honest cost of the fix: what used to be one 492-line file a human could
skim top-to-bottom to get a sense of "every lab that exists" is now 41
small files spread across 41 folders — genuinely harder to eyeball-scan
by hand. `labRegistryLoader.js` exists specifically to pay that cost back:
it reconstructs the exact same single-array overview, automatically, at
load time, so nothing about the *consuming* code (`TopicTable.jsx`,
- `StartMenu.jsx`, `topicGroups.js`) had to change at all — only where the
array's contents originate from.

#### Connect to What Came Before

Concept Unit 1 made the array's *order* correct without hand-typing it.
Concept Unit 2 made *finding one lab's metadata* work once metadata
stopped living next to its component. This unit is why both of those
were necessary in the first place — metadata moved to its own eagerly-
loaded home, separate from each lab's lazily-loaded component.

---

## Connect the Pieces

Trace one lab end to end, `css-mastery`, through everything built in this
lesson: its `meta.js` (Concept Unit 3) is read by `import.meta.glob`
inside `labRegistryLoader.js` at app load, alongside all 40 others;
`Object.entries(...).map(...)` turns it into a record with a `key`
- derived from its folder name; `.sort((a,b) => (a.order ?? 0) - ...)`
(Concept Unit 1) places it at position 9, exactly where `registry.js`'s
- array used to put it, without a human retyping that position.
- `LABS` — the finished array — is imported by `TopicTable.jsx`, `StartMenu.jsx`,

and `topicGroups.js`, which render its card from `label`/`emoji`/`desc`/
`tags`/`cover` with no changes to any of those three files' own code.
When a user actually clicks the card, `labLoader.js`'s `getLabEntry('css-mastery')`
runs: it lazily imports the *real* `index.jsx` for its component, and
separately (Concept Unit 2) looks up the same `css-mastery` entry in the
already-loaded `LABS` array for its metadata, merging both into the one
object `EntryShell` needs to open the floating window.

## What Breaks Without This

Removing the `?? 0` fallback from Concept Unit 1's comparator and giving
- one lab no `order` field reproduces a real, verified sorting bug —
run for real, this session:

```js
const labs = [
  { key: 'zebra', order: 5 },
  { key: 'yak', order: undefined },
  { key: 'apple', order: 1 },
  { key: 'mango', order: 3 },
  { key: 'banana', order: 2 },
]
const broken = [...labs].sort((x, y) => x.order - y.order)
console.log('Without ?? fallback:', broken.map(l => l.key + ':' + l.order).join(', '))
const fixed = [...labs].sort((x, y) => (x.order ?? 0) - (y.order ?? 0))
console.log('With ?? fallback:   ', fixed.map(l => l.key + ':' + l.order).join(', '))
```

```
Without ?? fallback: zebra:5, yak:undefined, apple:1, banana:2, mango:3
With ?? fallback:    yak:undefined, apple:1, banana:2, mango:3, zebra:5
```

- Without the fallback, `x.order - y.order` becomes `undefined - 5`, which is `NaN` — and a comparator that returns `NaN` doesn't throw, it just

leaves that pair's relative order effectively arbitrary. `yak` lands
- stuck between `apple` and `banana` for no principled reason — not sorted
first (its intended default), not sorted by its real position (it has
- none) — genuinely wrong, and silent. With the fallback, a missing `order`
correctly defaults to the front of the list, every time.

Without Concept Unit 2's `LABS.find(...)`, `labLoader.js` would still
- compile and run — `...meta` would just silently spread `undefined`
(since nothing sets a `meta` variable), producing a lab entry with no
label, no emoji, no tags at all, and `path: mod.meta?.path ?? ...` would
always fall through to the `/lab/${key}` default, harmless for labs
already on that pattern but silently wrong for the handful with a real
custom `path`.

## Definition of Done

- [ ] `src/labs/labRegistryLoader.js` exists, exports `LABS`, uses an eager
- `import.meta.glob('./*/meta.js')`, and sorts with `(a.order ?? 0) - (b.order ?? 0)`
- [ ] All 41 labs from the old `registry.js` have a `src/labs/<key>/meta.js`
      with every field the old registry entry had, plus `order` matching
      that entry's original array position
- [ ] `src/labs/labLoader.js` resolves metadata via `LABS.find((l) => l.key === key)`,
      not `mod.meta`
- [ ] `TopicTable.jsx`, `StartMenu.jsx`, `topicGroups.js` import `LABS` from
      `labRegistryLoader.js`, not `registry.js`
- [ ] `src/labs/registry.js` is deleted; `grep -rn "labs/registry" src` finds
      no real imports (only, if anything, a comment or an unrelated generated
      graph node)
- [ ] The home page's search finds labs from every category tested: an
      inline-meta relocation (`CSS 0 to Mastery`), a fabric.js precedent lab
      (`SVG Studio`), an `event`-based no-route lab (`Chemistry Lab`), a
      no-folder-before lab (`Notebook Lab`), and a plain lab (`Backend Lab`)
      — verified live, this session, with zero console errors
- [ ] Opening a lab (tested: SVG Studio) still works end to end through the
- updated `labLoader.js` — verified live, this session
- [ ] `npm run build` succeeds with `registry.js` fully removed — verified
      this session
- [ ] You reproduced the missing-`order` sorting bug against real data and
      can explain, without notes, why a comparator returning `NaN` doesn't
      throw but silently corrupts sort position
- [ ] You can explain the difference between `||` and `??` using the `0`
      example, without looking it up
- [ ] `git commit` with a message explaining why — for example: "Replace
      hand-typed lab registry with autofind via import.meta.glob — adding a
      lab's metadata now requires only a correctly-shaped meta.js file,
      closing the class of bug where registry.js's copy of a lab's facts
      could drift from the lab's own code"

## Leftover Cleanup Worth Doing (Not Required Above)

The ~26 labs relocated from an inline `index.jsx` meta (Worked Example A)
still have their old `export const meta = {...}` block physically present
- in `index.jsx` — dead code once `labLoader.js` switched to reading
`LABS.find(...)` instead of `mod.meta`. It was deliberately left in place
rather than stripped by a scripted bulk edit across ~26 existing source
files with no per-file review. Removing it is a good, small, separate
follow-up — one file at a time, confirming each lab still opens correctly
after its block is removed — not folded into this lesson's scope.
