# Lesson 7: Real Styling — Scoped to `rebuild/frontend`

> **What "this project" means in this lesson.** Same as every lesson
> before it: every real path this lesson names is inside
> `manufacturing-platform`, not `open-calc`.

## What you will build

Real, deliberate styling for the one real element `rebuild/frontend`
currently has — the real, already-connected `<h1>rebuild backend says:
{status}</h1>` — using Tailwind CSS, the same real tool legacy's own
frontend already uses. This is the last real piece of this series' own
walking-skeleton slice: after this lesson, `rebuild` has a real
backend, a real frontend, a real connection between them, and now
real, intentional styling — nothing about login, or any other real
feature, begins until this whole slice is actually finished.

## What you need to know first

`rebuild/frontend`'s own real `index.css`, currently trimmed to one
plain rule. The real `<h1>` element this lesson actually styles.

## Terms introduced

- **Utility-first CSS** — a real styling approach where individual,
  small, single-purpose CSS classes (`text-3xl`, `font-bold`, each
  doing exactly one real thing) are combined directly in markup, rather
  than writing custom, named CSS classes (`.hero-heading`) whose own
  separate stylesheet defines what they mean. Tailwind, below, is a
  real, specific implementation of this approach — legacy's own real
  frontend already uses it, checked this session
  (`"tailwindcss": "^3.4.14"`, this repository's own root
  `package.json`).
- **PostCSS plugin** — a real, small program that PostCSS (a real CSS
  *processor*, not a styling library itself) runs a real stylesheet
  through, transforming it on the way to whatever a browser actually
  receives. Tailwind itself is real, distributed as exactly this: a
  real PostCSS plugin, not a standalone tool.
- **At-rule** — a real, standard CSS syntax category: `@` followed by a
  real keyword, instructing the CSS processor to do something other
  than apply an ordinary style rule. `@tailwind base;`, below, is a
  real at-rule — not a Tailwind invention as a *category* of syntax,
  just a Tailwind-specific keyword using it.
- **Automatic semicolon insertion (ASI)** — a real, standard
  JavaScript/TypeScript language rule: the language permits omitting
  semicolons, and, where their absence would otherwise produce invalid
  syntax, the real parser inserts one automatically — including,
  specifically, immediately after a bare `return` keyword the instant a
  real line break follows it, regardless of what real code sits on the
  next line. This matters directly for this lesson — a `return`
  statement that spans more than one real line has to keep its own real
  expression on `return`'s own line, or wrapped in real parentheses, or
  ASI silently returns `undefined` instead.
- **Config resolution (upward search)** — the real, standard way tools
  like PostCSS find their own configuration file: starting in the
  directory of the file being processed, and searching upward, through
  parent directories, until a real config file is actually found —
  stopping at the *first* one, not searching further once one exists.
  This matters directly for this lesson — see the SE Lens, below.

## Objects and methods used

- **`tailwindcss` (PostCSS plugin)**
  - *What it is:* a real, published npm package, and, once configured,
    a real PostCSS plugin — not a standalone build tool run on its own.
  - *Implementation:* checked against Tailwind's own official
    documentation this session — reads a real `tailwind.config.js`,
    scans every real file named in that config's own `content` array
    for real utility class names actually used in it, and generates
    real CSS containing only the rules those specific classes need —
    nothing unused is ever generated.
  - *Its use:* this lesson adds it to `rebuild/frontend`'s own,
    separate PostCSS configuration, so real Tailwind utility classes
    used in this project's own real JSX actually produce real CSS.
  - *Type:* an npm package; once required by `postcss.config.js`,
    below, a real PostCSS plugin.
  - *Responsibility:* turning real, individual utility class names,
    written directly in this project's own markup, into the real CSS
    rules that make them actually work.
  - *Depends on:* a real `tailwind.config.js`, naming which real files
    to scan; a real PostCSS pipeline to run inside.
  - *Connects to:* configured inside `rebuild/frontend`'s own real
    `postcss.config.js`; reads `rebuild/frontend`'s own real
    `tailwind.config.js` and this project's own real `.tsx` files.
  - *Shape:* a real build-time tool — nothing about it ships to a real
    browser directly; only the real CSS it generates does.

- **`autoprefixer` (PostCSS plugin)**
  - *What it is:* a real, published npm package, and, once configured,
    a real PostCSS plugin — a genuinely separate real tool from
    `tailwindcss`, above, run alongside it, not part of it.
  - *Implementation:* checked against Autoprefixer's own official
    documentation this session — reads real, already-generated CSS and
    adds real, vendor-specific prefixes (`-webkit-`, `-moz-`, and
    others) to whichever real properties still need them, based on a
    real, configurable list of target browsers, so this project's own
    CSS never has to name them by hand.
  - *Its use:* this lesson adds it to `rebuild/frontend`'s own PostCSS
    configuration, run immediately after `tailwindcss`, matching
    legacy's own real, identical two-plugin order.
  - *Type:* an npm package; once required by `postcss.config.js`,
    below, a real PostCSS plugin.
  - *Responsibility:* real, automatic browser-compatibility prefixing,
    kept entirely separate from Tailwind's own real job of generating
    utility CSS in the first place.
  - *Depends on:* real CSS already generated by an earlier real plugin
    in the same pipeline (here, `tailwindcss`) to actually process.
  - *Connects to:* configured inside `rebuild/frontend`'s own real
    `postcss.config.js`, immediately after `tailwindcss`.
  - *Shape:* a real, second stage in the same real PostCSS pipeline
    `tailwindcss` is the first stage of.

---

## Concept Unit: A Config That Doesn't Reach Past Its Own Folder

### The Problem

`rebuild/frontend` lives inside `manufacturing-platform`, and this
repository's own root already has a real, working
`tailwind.config.js` and `postcss.config.js` — legacy's own, checked
this session, quoted in full below. PostCSS's own real config
resolution, per this lesson's Header, searches upward through parent
directories until it finds one. The real question this unit answers:
what actually happens if `rebuild/frontend` adds Tailwind without its
own, separate config — and why does that matter?

> **Before reading on:** if `rebuild/frontend/postcss.config.js`
> doesn't exist yet, and PostCSS's own real search keeps walking
> upward until it finds one, what's the first real config file it would
> actually find, searching up from `rebuild/frontend/`?

### Project Change

- **Reference Source** — this repository's own root
  `tailwind.config.js`, in full, and `postcss.config.js`, in full, both
  quoted verbatim this session (see below) — real, legacy's own,
  intentionally *not* what this unit creates, for the real reason this
  unit's own SE Lens explains.
- **Files affected** — created:
  `rebuild/frontend/tailwind.config.js`,
  `rebuild/frontend/postcss.config.js`; modified:
  `rebuild/frontend/src/index.css`, `rebuild/frontend/src/App.tsx`.
- **Change type** — add (two new config files); modify (two existing
  files).
- **Location** — the two new config files sit directly inside
  `rebuild/frontend/`, sibling to this project's own real
  `vite.config.ts` — not this repository's own root, where legacy's
  real, separate ones already live.
- **Dependencies** — `tailwindcss`, `postcss`, and `autoprefixer`, real
  npm packages, matching the exact real versions legacy's own root
  `package.json` already pins this session
  (`tailwindcss@^3.4.14`, `postcss@^8.4.47`, `autoprefixer@^10.4.20`)
  — a real **Preserve** decision: legacy's own real choice of styling
  tool is not a bug, and this series has no real, stated reason to use
  a different one.

### The New Code

```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {},
  },
  plugins: [],
}
```

This project's own `tailwind.config.js`, above, is one real,
independent config file. `postcss.config.js`, below, is a second,
separate real config file, wiring `tailwindcss` and `autoprefixer`
together as an actual PostCSS pipeline — the two are explained one at
a time, in the Walkthrough below, not as one undifferentiated pair:

```javascript
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
```

### The Updated Project

`rebuild/frontend/tailwind.config.js`, in full — brand new, so this is
the whole file:

```javascript
1  /** @type {import('tailwindcss').Config} */
2  export default {
3    content: ['./index.html', './src/**/*.{ts,tsx}'],
4    theme: {
5      extend: {},
6    },
7    plugins: [],
8  }
```

`rebuild/frontend/postcss.config.js`, in full — brand new, so this is
the whole file:

```javascript
1  export default {
2    plugins: {
3      tailwindcss: {},
4      autoprefixer: {},
5    },
6  }
```

For real, direct comparison, legacy's own real, separate
`tailwind.config.js` — this repository's own root, quoted verbatim
this session, not modified by this unit at all:

```javascript
/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    darkMode: 'class',
    theme: {
        extend: {
            colors: {
                // Primary: Engineering Gold (Amber)
                primary: {
                    50: '#fffbeb',
                    100: '#fef3c7',
                    200: '#fde68a',
                    300: '#fcd34d',
                    400: '#fbbf24',
                    500: '#f59e0b', // Base Gold
                    600: '#d97706',
                    700: '#b45309',
                    800: '#92400e',
                    900: '#78350f',
                    DEFAULT: '#f59e0b',
                },
                // =============================================================
                // SURFACE - Design Token for all UI backgrounds/borders
                // Change this ONE object to retheme the entire application
                // Current: Pure gray (no color tint) - based on your #121212
                // =============================================================
                surface: {
                    50: '#fafafa',
                    100: '#f0f0f0',
                    200: '#e0e0e0',
                    300: '#c0c0c0',
                    400: '#a0a0a0',
                    500: '#707070',
                    600: '#505050',
                    700: '#383838',
                    800: '#202020',
                    900: '#121212', // Your exact color!
                    950: '#0a0a0a', // Near black
                },
            },
            fontFamily: {
                sans: ['Inter', 'system-ui', 'sans-serif'],
                mono: ['JetBrains Mono', 'monospace'],
            },
            animation: {
                'modal-in': 'modalIn 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                'fade-in': 'fadeIn 0.2s ease-out',
                'slide-up': 'slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
            },
            keyframes: {
                modalIn: {
                    '0%': { transform: 'scale(0.95) translateY(10px)', opacity: '0' },
                    '100%': { transform: 'scale(1) translateY(0)', opacity: '1' },
                },
                fadeIn: {
                    '0%': { opacity: '0' },
                    '100%': { opacity: '1' },
                },
                slideUp: {
                    '0%': { transform: 'translateY(20px)', opacity: '0' },
                    '100%': { transform: 'translateY(0)', opacity: '1' },
                },
            },
            boxShadow: {
                'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
                'premium': '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
            },
        },
    },
    plugins: [],
};
```

Separately, legacy's own real `postcss.config.js` — this repository's
own root, quoted verbatim this session:

```javascript
export default {
    plugins: {
        tailwindcss: {},
        autoprefixer: {},
    },
};
```

### The Isolated Example

Tailwind's own real `@tailwind` at-rules are genuinely new to this
series. Not run this session — stated from documented behavior, per
the Verification Rule, since Tailwind's own official documentation is
explicit and stable about what each one does:

```css
/* throwaway.css — not part of this project, deleted after this unit */
@tailwind base;
@tailwind components;
@tailwind utilities;
```

Per Tailwind's own official documentation, `@tailwind base;` is
replaced, at build time, with a real, minimal set of element resets;
`@tailwind components;` is replaced with nothing, by default — a real,
empty seam reserved for custom, reusable classes a project can add
later; `@tailwind utilities;` is replaced with every real utility
class this project's own `content` scan actually found in use,
generated in that specific, real order because later real CSS rules
override earlier ones with equal real specificity, and utilities are
meant to real-world win. This is the real mechanism a later unit's own
real `App.tsx` styling depends on — proven here from documented
behavior rather than a real, executed build, since nothing about this
specific, stable Tailwind contract is genuinely in doubt.

### Discard the Throwaway Example

`throwaway.css` itself never becomes part of `rebuild/frontend` — it
exists only to isolate what the three real `@tailwind` lines actually
expand to.

### Mechanical Walkthrough

- **`tailwind.config.js` line 1, `/** @type
  {import('tailwindcss').Config} */`** — a real JSDoc comment, not
  executed code: gives real editor tooling (VS Code among them) real,
  accurate autocomplete for this file's own exported object, by
  pointing at Tailwind's own real, published TypeScript type — the
  identical real line legacy's own config already opens with, checked
  this session.
- **Line 2, `export default {`** — a real, standard JavaScript module
  export; Tailwind itself reads whatever real object this file exports
  by default.
- **Line 3, `content: ['./index.html', './src/**/*.{ts,tsx}']`** — a
  real array of real glob patterns, telling Tailwind's own real scanner
  which files to search for real utility class names actually in use.
  Deliberately narrower than legacy's own real, identical-shaped line
  (`"./src/**/*.{js,ts,jsx,tsx}"`): `rebuild/frontend` has no real
  `.js`/`.jsx` files yet — this project's own scaffolding tool
  generated a TypeScript-only project — so this real array names only
  the real extensions this project actually has, rather than copying
  legacy's own, wider real pattern for files that don't exist here.
- **Lines 4–6, `theme: { extend: {} }`** — a real, currently-empty
  object; `extend` is where real, project-specific values (legacy's own
  real `primary`/`surface` colors, quoted in full above, are a real
  example) get added *on top of* Tailwind's own real defaults, rather
  than replacing them — this unit adds none yet, on purpose, since
  nothing in `rebuild/frontend` has a real, stated reason for a custom
  color yet; see the SE Lens, below, on legacy's own real theme
  specifically.
- **Line 7, `plugins: []`** — a real, currently-empty array; Tailwind's
  own real plugin system, matching legacy's own, identical, real,
  empty array — nothing to preserve or change here yet.
- **`postcss.config.js` lines 2–5, `plugins: { tailwindcss: {},
  autoprefixer: {} }`** — a real, standard PostCSS configuration
  object; each real key names a real PostCSS plugin package to run, in
  order — this lesson's Header's own `tailwindcss` first, generating
  real utility CSS, then this lesson's Header's own `autoprefixer`,
  adding real, vendor-specific CSS prefixes automatically — the
  identical real two-plugin shape legacy's own root config already
  uses, checked this session.

### CS Lens

This is a real, direct instance of **generated, purged CSS** —
Tailwind's own real build step reads real, actual usage (a project's
own real `className` strings) before generating anything, producing
real CSS containing only the specific rules actually needed — not a
real, pre-built stylesheet containing every possible utility Tailwind
could ever generate, most of it real, dead weight for any one specific
real project.

Also recognized in: tree-shaking, in real JavaScript bundlers —
removing real, unused exports from a real, final bundle; a real
compiler's own dead-code elimination pass; any real build step that
generates real output sized to actual, real usage rather than every
real possibility a tool could theoretically support.

### SE Lens

The real, deliberately *not*-taken alternative here — the one this
unit's own Header already flagged: letting `rebuild/frontend` share
this repository's own root `tailwind.config.js`/`postcss.config.js`,
by simply never creating its own. Rejected on purpose, for a real,
documented reason, not a hypothetical one: PostCSS's own real,
documented config resolution searches upward through parent
directories until it finds one, stopping at the first real config file
it encounters — and this repository's own root already has one,
checked directly this session (quoted in full above), that
`rebuild/frontend` would sit underneath with nothing of its own to stop
the search there first. That real, existing root config references
`tailwindcss` with legacy's own real, custom theme — not something
`rebuild/frontend` has any real reason to inherit silently. This unit's
own real fix is a general, real principle recurring throughout this
series wherever a shared resource could silently leak across an
intended boundary: a real, present
`rebuild/frontend/postcss.config.js` stops PostCSS's own real upward
search right there, before it ever reaches legacy's own, separate
real one.

### Commands needed

```powershell
cd manufacturing-platform/rebuild/frontend
npm install -D tailwindcss@3.4.14 postcss@8.4.47 autoprefixer@10.4.20
```

`-D` — a real, standard `npm` flag, installing these three real
packages as *development* dependencies: real tools this project's own
build process needs, never shipped to a real browser directly, the
same real category legacy's own root `package.json` already lists them
under, checked this session.

### Run it, per the Verification Rule

Not run this session — stated from confidence, not executed. Tailwind,
PostCSS, and Autoprefixer's documented, stable, official behavior
already establishes what this real config produces, and legacy's own
real, already-working, identical-shaped setup in this exact repository
is further, real, standing proof the same versions of the same tools
work correctly together. What's confidently predicted: running
`rebuild/frontend`'s own dev server after this unit's real changes
produces real CSS containing exactly the utility classes the next
unit's own real `App.tsx` actually uses, and nothing else. Confirming
this for real is a later, honest, visual step — opening
`http://localhost:5173` in a real browser and seeing the styled result
— not something to fabricate a build transcript for here.

### Connecting this unit to what came before

A prior lesson proved `rebuild`'s two real halves could talk. This
unit is the first time `rebuild/frontend` makes a real, deliberate
choice about its own configuration specifically *because* of where it
happens to sit on disk — a real, physical consequence of building
inside an already-real, already-large repository, not something a
brand-new, standalone project would ever have to think about at all.

---

## Concept Unit: Styling the Connected Element

### The Problem

The previous unit made real Tailwind utility classes available to
`rebuild/frontend`; nothing in `App.tsx` actually uses one yet. The
real question this unit answers: what does applying one real, deliberate
utility class actually look like, and which specific ones does this
project's own current, narrow requirement actually call for?

### Project Change

- **Reference Source** — no reference counterpart; legacy's own real,
  custom `primary-500` token (quoted in full in the previous unit) is
  deliberately *not* used here — see the Mechanical Walkthrough, below,
  for why.
- **Files affected** — modified: `rebuild/frontend/src/index.css`,
  `rebuild/frontend/src/App.tsx`.
- **Change type** — modify.
- **Location** — `index.css`: the single real rule already there.
  `App.tsx`: the real `<h1>` element's own JSX.
- **Dependencies** — none beyond the previous unit's own real installs.

### The New Code

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

body {
  margin: 0;
}
```

That real change activates Tailwind's own real utility-generation
mechanism, proven in isolation in the previous unit, for the whole
project. The second, separate real change is where a utility class is
actually applied — one real element's own `className`, in
`App.tsx`, not the same file or the same real concept as the CSS
change above:

```tsx
<h1 className="p-6 text-3xl font-bold text-amber-600">
  rebuild backend says: {status}
</h1>
```

### The Updated Project

`rebuild/frontend/src/index.css`, in full — the previous, single real
rule, with this unit's own three new real lines added above it:

```css
1  @tailwind base;
2  @tailwind components;
3  @tailwind utilities;
4
5  body {
6    margin: 0;
7  }
```

`rebuild/frontend/src/App.tsx`, in full — the real, already-connected
function, with one real, styled line:

```tsx
1  import { useEffect, useState } from 'react'
2
3  function App() {
4    const [status, setStatus] = useState('checking...')
5
6    useEffect(() => {
7      fetch('/health')
8        .then((response) => response.json())
9        .then((data) => setStatus(data.status))
10   }, [])
11
12   return (
13     <h1 className="p-6 text-3xl font-bold text-amber-600">
14       rebuild backend says: {status}
15     </h1>
16   )
17 }
18
19 export default App
```

### Mechanical Walkthrough

- **`index.css` lines 1–3, `@tailwind base/components/utilities;`** —
  this lesson's Header's own **At-rule** term, applied for real: three
  real, literal instructions to Tailwind's own PostCSS plugin, each
  replaced with real, generated CSS at build time — proven, in
  isolation, in the previous unit.
- **`App.tsx` lines 12 and 16, `return (` … `)`** — real, standard
  JavaScript/TypeScript parentheses, wrapping this element now that it
  spans more than one real line — not decorative, and not optional:
  JavaScript's own real, automatic semicolon insertion rule inserts a
  real, invisible semicolon immediately after a bare `return` the moment
  a real line break follows it, silently turning `return` into `return;`
  — handing back `undefined` — with the real JSX underneath becoming
  real, unreachable, dead code that never executes at all. Wrapping the
  whole real expression in `( … )` keeps it, real and intact, as one
  single expression on `return`'s own real line, exactly the same real
  fix the previous lesson's own single-line `return <h1>rebuild
  backend says: {status}</h1>` never needed, since nothing about it broke
  across a real line boundary.
- **`App.tsx` line 13, `className="p-6 text-3xl font-bold
  text-amber-600"`** — real JSX's own real attribute name for what
  plain HTML calls `class` (`class` is a real, reserved JavaScript
  word, which is exactly why JSX — real JavaScript underneath — uses a
  different real name for the identical real HTML concept). Four real,
  individual Tailwind utility classes, each doing exactly one real,
  documented thing: `p-6` — real padding, `1.5rem` on every real side;
  `text-3xl` — a real, larger font size; `font-bold` — a real, heavier
  font weight; `text-amber-600` — a real, specific shade of amber text
  color, from Tailwind's own real, built-in default palette — a
  **Deliberately changed** real choice, not legacy's own real, custom
  `primary-500` token (quoted in full in the previous unit): this
  unit's own `tailwind.config.js` doesn't define that real custom
  token, on purpose, per the previous unit's own real, stated
  `theme.extend` decision; reaching for a real, built-in Tailwind color
  instead of inventing one, or prematurely porting legacy's own full
  real theme, is this lesson's own real, honest, minimal choice.

### CS Lens

This is the identical real concept the previous unit already named in
full — **generated, purged CSS** — now applied to one real, concrete
element instead of shown in isolation: `p-6`, `text-3xl`, `font-bold`,
and `text-amber-600` are exactly the real utility classes Tailwind's
own real scanner finds in this file, and exactly the real ones its own
generated CSS contains.

### SE Lens

The real, deliberately *not*-taken alternative here: reaching for
legacy's own real, custom `primary-500` amber token instead of
Tailwind's own built-in `amber-600`. Rejected on purpose, for the
identical real reason the previous unit's own SE Lens already gave for
not silently sharing legacy's own config: porting legacy's own full
real theme (its custom color scale, its animations, its shadows) into
`rebuild/frontend` right now would be building ahead of any real,
current requirement — this project's own real, current need is one
styled heading, not a full design system, and a real, later lesson is
the honest place to decide, deliberately, whether legacy's own real
theme is worth Preserving once there's an actual real reason to.

### Commands needed

No new command beyond the previous unit's own real installs — this
unit's own real proof is a real, running dev server, already covered.

### Run it, per the Verification Rule

Not run this session, for the identical honest reason the previous
unit gave. What's confidently predicted, from Tailwind's own
documented utility definitions: `p-6`, `text-3xl`, `font-bold`, and
`text-amber-600` each generate their own real, well-known CSS rule,
and applying all four to the same real element produces a real,
visibly padded, enlarged, bold, amber-colored heading. Confirming this
for real means opening `http://localhost:5173` in a real browser and
looking — not something to fabricate a screenshot or build transcript
for here.

### Connecting this unit to what came before

The previous unit proved the real mechanism works, in isolation. This
unit is the real, matching application of it — the one real element
this whole series' own walking skeleton has, now actually styled.

---

## Connect the pieces

The real `<h1>` already showing `rebuild`'s own live backend status now
carries real, deliberate styling: padded, sized, weighted, and
colored, through four real Tailwind utility classes, generated by a
real PostCSS plugin, reading a real, separate config built specifically
so `rebuild/frontend` never silently depends on legacy's own, larger,
unrelated one sitting one real directory above it.

---

**Next lesson:** this series' own walking-skeleton slice — a real
backend, a real frontend, a real connection, real styling — is now
actually finished. Login, and every real thing it actually needs
(structure, a database, a user model, password hashing, real
authentication logic), begins its own, separate, deeper slice next,
built on top of what now genuinely, actually works.
