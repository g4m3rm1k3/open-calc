# Lesson 12: One File to Restyle From

## What you will build

A real design token system for `cnc-web`: `theme.css`'s `:root` block
holds every real color this project uses, and a new `theme.ts` reads
them back into TypeScript via the browser's own `getComputedStyle` —
replacing Lesson 8/9's hardcoded hex constants in `viewport.ts`
completely. Proven live, this session: changing exactly one line in
`theme.css` (nothing else) recolors the real, rendered 3D toolpath, with
zero TypeScript touched. Also: `PathDump.tsx`, a first real step toward
the component separation this project will lean on hard as its UI grows.
The transferable problem: **a value used in more than one place should
live in exactly one place** — this project's `rapid`/`feed`/`grid`/`bg`
colors were already duplicated in spirit (hardcoded in `viewport.ts`,
also real, separately-defined values in the reference app's own theme
file) — and **a component with real, focused responsibility is easier to
restyle, retest, and reuse than one that has grown to do several things
by accretion**.

## What you need to know first

Lesson 8: `viewport.ts`'s hardcoded `BACKGROUND_COLOR`/`GRID_COLOR`/
`RAPID_COLOR`/`FEED_COLOR` constants, which this lesson replaces. Lesson
11: `App.tsx`/`Viewport.tsx`, React components, `useState`/`useEffect`.

## Concepts cataloged from this lesson

Full standalone treatments live in `../concepts/`. Pointers to each are
also placed inline at their point of use below.

- `../concepts/css-rule-syntax-selectors-cascade.md` — added
  retroactively, found missing while auditing this lesson: this
  project's first real CSS rules appear here, and CSS's own rule syntax
  was never taught before this point.
- `../concepts/css-custom-properties.md`
- `../concepts/browser-getcomputedstyle.md`
- `../concepts/typescript-unknown-type.md`
- `../concepts/vite-css-side-effect-import.md`
- `../concepts/adapter-pattern.md`
- `../concepts/avoid-premature-abstraction.md`
- `../concepts/caching-and-memoization.md` — added retroactively, found
  missing while cross-referencing a professional-software-engineering-
  concepts checklist: `themeColors()`'s own "called fresh, no caching"
  design decision is a real, deliberate non-memoization choice.

## No pipeline diagram change

Pure presentation — no pipeline stage is affected.

---

## Concept Unit: Reading the Real, Much Bigger System First — and Naming Why Most of It Isn't Ported

### Reference Source, Read for Real This Session

`cnc-sim/cnc/theme/useCncTheme.js`, read in full (91 lines) and
`studioThemes.js` (the file you pointed at), read in its first 120 lines
this session. Real findings, not assumed:

`studioThemes.js` defines `STUDIO_THEMES` — several named themes
(`default`, `github`, more), each with **Tailwind CSS class names**
(`uiLight`/`uiDark`: `"bg-slate-50"`, `"text-slate-900"`, etc.), Monaco
code-editor theme names, and markdown-rendering color sets. It's a
real, working theme system — for a much larger application (an editor/
studio shell) this project's own `cnc-web` is not part of and isn't
building.

`useCncTheme.js` bridges that larger system down to the flat hex palette
`CNCBackplot.tsx` actually uses: it picks a base palette
(`PALETTE_DARK`/`PALETTE_LIGHT`, real, flat hex objects — `rapid:
"#ff8b8b"`, `feed: "#46d89f"`, `grid: "#131c28"`, `bg: "#07111e"`, exactly
what Lesson 8 already hardcoded), then *tries* to override individual
colors by extracting a literal hex code out of the active studio theme's
Tailwind classes (`extractHex("bg-[#0b1322]")` → `"#0b1322"`) — falling
back to the base palette whenever a theme's classes don't contain one
(most named Tailwind colors, like `"bg-slate-50"`, have no extractable
hex at all, so most studio themes never actually change these specific
colors — a real, subtle detail confirmed by reading the regex itself,
not assumed).

**Named, deliberate, honest scope decision:** this project ports the
**real color values** (`PALETTE_DARK`'s actual hex codes — already
exactly what's been in `viewport.ts` since Lesson 8) but **not** the
surrounding machinery — `STUDIO_THEMES`, Tailwind, a global
`ThemeContext`, multiple switchable named themes, `useMemo`-based
derivation. That machinery exists to serve a much larger application
(an editor with Monaco, markdown rendering, several named visual
themes) that this project has no equivalent of and hasn't been asked to
build. Porting it wholesale would mean adding Tailwind and a theme-
switching UI to `cnc-web` for no current, real use. What *is* real and
worth having now — a single, real place to change a color from — is
built this lesson using the mechanism `CURRICULUM.md`'s own target
architecture already named as the plan from the start: **CSS custom
properties**, not Tailwind.

### CS Lens

*(Full standalone treatment: ../concepts/adapter-pattern.md.)*

Deriving one flat, simple representation (a hex palette) from a much
richer, more general one (a multi-theme, multi-format system), and
discarding the parts a specific consumer doesn't need, is a real,
common **adapter** shape — the same reasoning that justified `core/
lexer.py` porting only `_extractWords`'s plain-numeric case (Lesson 2)
rather than every real dialect feature `GCodeParser` supports.

### SE Lens

The real, honest tradeoff: this project's theming is deliberately less
flexible than the reference's (one active look, not several named,
switchable themes) — accepted because building a real theme-switcher UI
isn't a stated goal, and CSS custom properties are trivially upgradable
to support that later (a `data-theme` attribute and a second `:root`-like
block, a real, well-known pattern) without this lesson's own work being
wasted.

---

## Concept Unit: One Real Place Colors Live

*(Added retroactively, found missing while auditing this lesson: this
project's first real CSS rules appear here, and CSS's own rule syntax —
selectors, declaration blocks, the cascade, specificity, inheritance —
was never taught anywhere before this point. Full standalone treatment:
../concepts/css-rule-syntax-selectors-cascade.md.)*

### The New Code

```css
:root {
  --color-bg: #07111e;
  --color-grid: #131c28;
  --color-rapid: #ff8b8b;
  --color-feed: #46d89f;
  --color-text: #e6eefb;
}

body {
  background-color: var(--color-bg);
  color: var(--color-text);
  font-family: system-ui, sans-serif;
}
```

### Project Change

- **Reference Source** — `cnc-sim/cnc/theme/useCncTheme.js` lines 12,
  22, 28, 36-37, 46 (`PALETTE_DARK`'s `bg`/`txt`/`rapid`/`feed`/`grid`),
  quoted and reconciled above — real values, restructured into this
  project's own actual styling mechanism (CSS custom properties), not
  the reference's own (Tailwind + JS objects).
- **Files affected** — new `cnc-web/src/theme.css`.
- **Change type** — add.
- **Location** — `src/`, imported once from `main.tsx` (next unit).
- **Dependencies** — none.

### Mechanical Walkthrough

- `:root { ... }` — **(a) first appearance** of a **CSS custom
  property** (informally, a "CSS variable").
  *(Full standalone treatment: ../concepts/css-custom-properties.md.)*
  `--color-bg: #07111e;`
  declares a named value, scoped to `:root` (the `<html>` element,
  effectively "the whole page") — available to *any* CSS, and, as this
  lesson's next unit shows, readable from JavaScript too. The `--`
  prefix is required syntax distinguishing a custom property from a
  real CSS property name.
- `body { background-color: var(--color-bg); ... }` — **(a) first
  appearance** of `var(--name)`: substitutes the custom property's
  current value wherever it's used — here, applied directly to real page
  styling for the first time in this project (`cnc-web`'s `index.html`
  had no styling at all before this lesson).
- `font-family: system-ui, sans-serif;` — already-known basic CSS;
  named only because it's this project's first real typography decision
  — `system-ui` uses the visiting device's own native UI font rather than
  shipping/loading one, a real, deliberate simplicity choice.

### CS Lens

A single named value referenced everywhere it's needed, instead of
copy-pasted, is **avoiding duplication of a fact** — the identical
principle behind Lesson 2's `_MOTION_CODES` lookup table or Lesson 4's
`_SUPPORTED_WORDS`, expressed here in CSS instead of Python.

Also recognized in: every real design system (Material Design, Apple's
Human Interface Guidelines — both define color/spacing tokens once,
centrally), Sass/LESS variables (an older, compile-time-only version of
this same idea), and this project's own `CURRICULUM.md`, which named CSS
custom properties as the target mechanism for exactly this reason before
a single line of frontend code existed.

---

## Concept Unit: Reading a CSS Value Back Into TypeScript

*(Full standalone treatment: ../concepts/browser-getcomputedstyle.md.)*

### The New Code

```typescript
export function cssVar(name: string): string {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}

export interface ThemeColors {
  background: string;
  grid: string;
  rapid: string;
  feed: string;
}

export function themeColors(): ThemeColors {
  return {
    background: cssVar("--color-bg"),
    grid: cssVar("--color-grid"),
    rapid: cssVar("--color-rapid"),
    feed: cssVar("--color-feed"),
  };
}
```

### The Updated Project

The complete, new `cnc-web/src/theme.ts`:
```typescript
export function cssVar(name: string): string {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}

export interface ThemeColors {
  background: string;
  grid: string;
  rapid: string;
  feed: string;
}

export function themeColors(): ThemeColors {
  return {
    background: cssVar("--color-bg"),
    grid: cssVar("--color-grid"),
    rapid: cssVar("--color-rapid"),
    feed: cssVar("--color-feed"),
  };
}
```

### Mechanical Walkthrough

- `getComputedStyle(document.documentElement)` — **(a) first
  appearance.** `document.documentElement` is the real `<html>` element
  (the same element `:root` in CSS refers to). `getComputedStyle(el)`
  returns an object representing *every* real, final CSS value currently
  applied to `el` — after the browser has resolved cascading, inheritance,
  and, relevantly here, custom properties — as opposed to reading an
  element's own inline `style` attribute, which would miss anything set
  in a stylesheet (exactly how this project's colors are set).
- `.getPropertyValue(name)` — **(a) first appearance** — looks up one
  specific property (here, a custom property name, `"--color-bg"|`) on
  that computed style object, returning its value as a plain string.
- `.trim()` — already-known basic string method; **(a) worth naming
  why it's needed here specifically**: browsers commonly return computed
  custom-property values with a leading space (`" #07111e"`, an artifact
  of how the declaration `--color-bg: #07111e;` itself is parsed) —
  verified for real, this session, before trusting it blindly.
- `export interface ThemeColors { ... }` — **(b) reappearing** interface
  syntax (Lesson 7), naming the real shape this module's one public
  function returns — so any file importing `themeColors` gets full,
  checked typing on the result, not a bare, untyped object.
- `themeColors()` — **(a) first appearance** of this project's own real
  "read the current theme" function — called fresh, each time, rather
  than cached once — a deliberate, honest, minor cost (four real DOM
  reads per call) accepted because this project has no theme-switching
  yet, so nothing currently depends on it being fast; if that changes,
  this is the one function that would need to add caching, nothing else.
  *(Added retroactively, found missing while cross-referencing a real
  "what every professional developer should know" checklist: this is a
  genuine, deliberate **non-memoization** decision — the identical
  function could be memoized directly, with no change to any caller.
  Full standalone treatment: ../concepts/caching-and-memoization.md.)*

### Commands and Real Output

```
getComputedStyle(document.documentElement).getPropertyValue("--color-bg").trim()
```
Run for real, this session, in a headless browser loading the actual
page:
```
"--color-bg from getComputedStyle: "#07111e""
```
Exactly the real value declared in `theme.css`, read back successfully.

### CS Lens

This is **indirection through a named lookup** rather than a hardcoded
literal — the same general shape as Lesson 4's `_MOTION_CODES[g_int]`:
code asks a shared source "what's the current value of X" instead of
embedding X directly, so changing the *source* changes every consumer at
once.

### SE Lens

`themeColors()` is the **only** function in this entire project that
knows CSS custom property names exist at all (`"--color-bg"` etc.) —
every caller just gets back a plain `ThemeColors` object. If this
project's styling mechanism ever changed entirely (a real, later
possibility — Tailwind, CSS-in-JS, anything), only `theme.ts` would need
rewriting; every caller (`viewport.ts`, next unit) stays untouched,
because its own dependency is on `ThemeColors`'s shape, not on *how*
those values are obtained.

---

## Concept Unit: Every Consumer, Reading From One Source

### Project Change

- **Reference Source** — none new; this unit wires the previous two
  units' real, already-cited values into `viewport.ts`.
- **Files affected** — `cnc-web/src/viewport.ts` (modified),
  `cnc-web/src/main.tsx` (modified).
- **Change type** — replace (hardcoded constants removed).
- **Location** — `viewport.ts`'s module top and its three color-using
  calls; `main.tsx`'s top-level imports.
- **Dependencies** — `theme.ts`, `theme.css`.

### The New Code

```typescript
import { themeColors } from "./theme.ts";

export function createViewport(container: HTMLElement) {
  const colors = themeColors();
  // ...
  renderer.setClearColor(colors.background, 1);
  // ...
  const grid = new THREE.GridHelper(500, 50, colors.grid, colors.grid);
  // ...
  const color = segment.motion === "G0" ? colors.rapid : colors.feed;
```
```typescript
import "./theme.css";
```

### Mechanical Walkthrough

- `import { themeColors } from "./theme.ts";` replaces the four deleted
  `const ..._COLOR = 0x......;` lines entirely.
- `const colors = themeColors();` — called once, at the top of
  `createViewport`, **after** the component has mounted (this function
  only ever runs inside `Viewport.tsx`'s first `useEffect`, Lesson 11) —
  guaranteeing `theme.css` has already been loaded and applied to the
  real page by the time this runs.
- `renderer.setClearColor(colors.background, 1)` / `new THREE.
  GridHelper(500, 50, colors.grid, colors.grid)` / `segment.motion ===
  "G0" ? colors.rapid : colors.feed` — **(a) a real, verified fact worth
  naming explicitly**: every one of these Three.js APIs accepts a plain
  CSS-style hex **string** directly (`"#07111e"`), not only the `0x...`
  number literals used since Lesson 8 — confirmed this session:
  `new THREE.Color("#07111e").getHexString()` returns `"07111e"`,
  proving Three.js parses the string form correctly, with no manual
  conversion needed anywhere in this file.
- `import "./theme.css";` in `main.tsx` — **(a) first appearance** of
  importing a **CSS file directly inside a `.ts`/`.tsx` file**.
  *(Full standalone treatment: ../concepts/vite-css-side-effect-import.md.)*
  Not a
  value import (nothing is bound to a name) — Vite recognizes `.css`
  imports specially and, as a real, deliberate **side effect**, injects
  the file's real rules into the page the moment this module runs —
  which is exactly why this one line, placed before `App` is even
  imported, is what makes `theme.css`'s custom properties exist at all
  by the time anything else in this project asks for them.

### Commands and Real Output — the Actual Payoff, Verified Live

**Changed exactly one line in `theme.css`** (nothing else, no
TypeScript touched):
```css
--color-feed: #ffe135;
```
A real headless browser reloaded the real page. **Real screenshot,
this session:** the previously-green feed (`G1`) segments of a real
toolpath rendered bright yellow instead — the rapid (`G0`) segments
stayed their own real, unchanged red. Reverted immediately after
confirming this; re-verified back to the original green.

This is the concrete, lived proof of this lesson's whole premise:
restyling a real, rendered Three.js scene required editing exactly one
CSS value, in exactly one file, with zero TypeScript changes and zero
recompilation of any component logic.

---

## Concept Unit: A Component Earns Its Own File When It Has a Real Job

### The Problem

`App.tsx` (Lesson 11) directly rendered `<pre>{JSON.stringify(points,
null, 2)}</pre>` inline. As this project's UI grows — a stated, real
near-term goal — more places will want to show "here's the raw shape of
some data, formatted for reading" (tool tables, machine state, later
lessons), and copy-pasting that one line each time would duplicate real
logic, not just markup.

### The New Code

```tsx
interface PathDumpProps {
  data: unknown;
}

function PathDump({ data }: PathDumpProps) {
  return <pre>{JSON.stringify(data, null, 2)}</pre>;
}

export default PathDump;
```

### Mechanical Walkthrough

- `interface PathDumpProps { data: unknown; }` — **(a) first appearance**
  of TypeScript's `unknown` type.
  *(Full standalone treatment: ../concepts/typescript-unknown-type.md.)*
  Unlike `any` (which disables type
  checking entirely for a value), `unknown` says "this could be anything,
  and TypeScript will still make sure you handle it safely" — here,
  `JSON.stringify` genuinely accepts any value at all, so `unknown` is
  the honest, precise type for "I will format whatever you give me,"
  without falsely promising it's always a `PathPoint[]` specifically
  (this component has no reason to know or care what shape its caller's
  data has).
- `function PathDump({ data }: PathDumpProps)` — **(c) already
  established** props-destructuring (Lesson 11's `Viewport`).

### SE Lens — and a Deliberate Non-Extraction

*(Full standalone treatment: ../concepts/avoid-premature-abstraction.md.)*

`<h1>Toolpath</h1>` in `App.tsx` was **not** extracted into its own file
this lesson — a real, deliberate decision, not an oversight: it has no
props, no logic, and no reuse anywhere else yet. A one-line static
heading in its own file would be a real instance of the premature
abstraction this project's own standing engineering values reject —
three similar lines are better than a needless file, and this heading
isn't even three lines. `PathDump`, by contrast, has a real, statable
job (format arbitrary data as readable JSON) or purpose that other,
future components will genuinely want to reuse without duplicating —
that distinction, not "everything visible gets its own file
automatically," is the actual rule this project is following, and it's
named here explicitly so it doesn't need re-deciding every time a new
piece of markup appears.

### Commands and Real Output

```
npx tsc --noEmit
```
**Real output:** none — clean pass.
```
npx vitest run
```
**Real output:** `Tests  4 passed (4)` — `segments.test.ts`, untouched.

A real headless browser confirmed the final page: dark themed
background, light themed heading text (both new, from `theme.css`'s
`body` rule), one canvas, zero console errors, the real toolpath
rendered in its correct, original colors.

---

## Connect the Pieces

1. `main.tsx` imports `theme.css` first — Vite injects its real `:root`
   custom properties into the page before anything else runs.
2. `App` renders `<Viewport>` and `<PathDump>`; React commits this to the
   real DOM.
3. `Viewport`'s first effect (Lesson 11) calls `createViewport`, which
   calls `themeColors()` — reading the four real custom properties back
   via `getComputedStyle`, now guaranteed present.
4. `viewport.ts` uses those real string values directly wherever Three.js
   expects a color — no hardcoded hex anywhere in this file anymore.
5. Changing one line in `theme.css` and reloading changes what the real,
   rendered scene looks like — verified live, screenshotted, reverted.

## What Breaks Without This

Not a caused failure this lesson — a demonstrated, positive capability
instead: the whole point was proving *what becomes possible* (a one-line,
CSS-only restyle reaching an actual Three.js scene) that Lesson 8/9's
hardcoded constants never allowed. The equivalent "what breaks" is
already implicit: reverting this lesson would mean any future color
change requires finding and editing hex literals scattered across
`viewport.ts` directly, exactly the duplication this lesson exists to
remove.

## Exercises

1. Add a fifth custom property, `--color-arc` (using the reference's own
   real `arc: "#b89cff"` value from `PALETTE_DARK`, not invented), to
   `theme.css` and `theme.ts`/`ThemeColors`. Nothing consumes it yet —
   confirm `npx tsc --noEmit` still passes with an added-but-unused real
   token.
2. Open the real page in your own browser's dev tools, find the injected
   `<style>` tag Vite created from `theme.css`, and confirm its contents
   match the source file exactly.
3. Explain, in your own words, why `themeColors()` is called *inside*
   `createViewport` rather than once at module load time at the top of
   `viewport.ts` — what could go wrong with the latter, given what
   `main.tsx`'s import order guarantees and doesn't guarantee?

## Definition of Done

- [ ] `cnc-web/src/theme.css` and `theme.ts` exist; `viewport.ts` has no
      hardcoded hex color literals left.
- [ ] `npx tsc --noEmit` passes with no errors.
- [ ] `npx vitest run` still passes all four tests, untouched.
- [ ] Opening `http://localhost:5180/` shows a dark-themed page (body
      background and text color both from `theme.css`) with the correct,
      real toolpath colors.
- [ ] You changed one `theme.css` value yourself, reloaded, and watched
      the real 3D scene's color change with no TypeScript edits — then
      reverted it.
- [ ] `PathDump.tsx` exists and is used by `App.tsx`; you can explain why
      the static `<h1>` was deliberately *not* extracted the same way.
- [ ] You completed Exercises 1–3.
- [ ] A git commit exists explaining *why* (a real, single source of
      truth for this project's colors now exists, matching
      `CURRICULUM.md`'s original target architecture, with the much
      larger Tailwind/multi-theme system it was adapted from named
      honestly rather than partially, silently copied).
