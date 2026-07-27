# Lesson 24: Swapping a Whole Palette at Once

**What you will build:** a real, working multi-theme system for
`cnc-web` — an 18-entry catalog of real color palettes (ported from a
reference theming library), a live preview grid where every option shows
its own colors at once instead of one at a time, a generic settings modal
(navigation on the left, content on the right) opened from a new ribbon
button, and the actual switching mechanism wired all the way down to the
3D viewport. The transferable problems underneath that feature: how to
represent an entire swappable "look" as one small, named catalog instead
of scattered conditionals; how to push a value computed at runtime into
CSS that was already written and compiled; why some already-built
objects can have a property changed in place while others have to be
rebuilt from scratch; and a real, easy-to-miss fact about the order React
runs effects in, which silently broke this exact feature the first time
it was wired up.

**What you need to know first:** Lesson 9's `--color-*` custom properties
in `theme.css`; Lesson 22's `RibbonToolbar` groups/toggles shape; Lesson
23's `SidePanel` tabs/`activeTabId` pattern, its `ReactNode`-as-prop
convention, and its fixed-position `.canvas-layer`; and the Concept
Isolation Rule's now-familiar convention of a throwaway, run-for-real lab
before any new construct touches project code.

---

## Concept Unit: TypeScript Tuple Types

### The Problem

`themes.ts` needs a small function that splits a hex color string like
`"#63b8ff"` into its three separate numeric channels, so another function
can blend each channel toward white or black independently. Typing that
function's return value as `number[]` would compile — but it promises
nothing about *how many* numbers come back, which matters the moment a
caller immediately destructures the result into exactly three named
variables.

### The Concept, Isolated

First real use of a TypeScript tuple type in this project. The full
isolated lab — proving a same-length array literal is accepted by
`number[]` but rejected by a three-element tuple type, with the real
`tsc` error shown — lives in `concepts/typescript-tuple-types.md`. What
it proved: a tuple type's length is a real, checked guarantee, not just
documentation.

### Project Change

- **Reference Source:** No reference counterpart — `cnc-sim` has no color
  math of its own; this is a from-scratch utility built for this
  project's own theme catalog.
- **Files affected:** `cnc-web/src/themes.ts` (new file).
- **Change type:** add.
- **Location:** top of the new file, immediately after the `ThemeDefinition`
  interface and the `THEMES` catalog array.
- **Dependencies:** none beyond TypeScript itself, already configured
  since Lesson 7.

### The New Code

```typescript
function hexToRgb(hex: string): [number, number, number] {
  const clean = hex.replace("#", "");
  return [
    parseInt(clean.slice(0, 2), 16),
    parseInt(clean.slice(2, 4), 16),
    parseInt(clean.slice(4, 6), 16),
  ];
}
```

### The Updated Project

This is a new, freestanding function — nothing yet surrounds it. It's the
first of five small functions `themes.ts` defines below its `THEMES`
catalog, all building toward one exported `applyTheme`.

### Mechanical Walkthrough

- `function hexToRgb(hex: string): [number, number, number]` — **(a)
  first appearance** the tuple return type, per
  `typescript-tuple-types.md` — **(c) already basic** the `string`
  parameter annotation.
- `hex.replace("#", "")` — **(c) already basic** — a plain, non-regex
  string replace.
- `clean.slice(0, 2)`, `.slice(2, 4)`, `.slice(4, 6)` — **(a) first
  appearance** — `String.prototype.slice(start, end)`, splitting the
  6-character cleaned string into its three 2-character channel
  substrings by position.
- `parseInt(str, 16)` — **(a) first appearance** — parses a string as a
  base-16 integer; the reverse direction of `.toString(16)`
  (`javascript-hexadecimal-number-literal.md`).
- The returned array literal — **(b) reappearing** array literal syntax,
  now checked against the tuple type declared above it.

### CS Lens

Per `typescript-tuple-types.md`: a fixed-arity, position-meaningful
structure, the same idea as a `struct` or a typed multi-value return in
any statically-typed language.

### SE Lens

The real alternative — a named `{ r, g, b }` interface instead of a
tuple — was considered and rejected for the same reason
`typescript-tuple-types.md` names: these three numbers are always
produced and consumed together, immediately destructured, and never
stored or passed around on their own — the positional tuple reads exactly
as clearly at every real call site in this file, without a whole extra
type declaration for a value that never outlives one function call.

### Run It — Real Output

```
$ npx tsc --noEmit
(no output — compiles cleanly)
```

Verified live inside the real function by temporarily logging
`hexToRgb("#63b8ff")` from a scratch call: `[99, 184, 255]` — the real
channel values for this project's own current accent blue.

This function alone doesn't do anything visible yet — it's the first
building block `lightenHex` needs next.

---

## Concept Unit: Blending Hex Colors Toward White or Black

### The Problem

Every existing `--color-accent-blue-bright`, `--color-accent-green-bright`,
and `--color-border-strong` in `theme.css` is a hand-picked, slightly
lighter shade of its "base" counterpart — chosen once, by eye, for this
project's one and only theme. An 18-theme catalog can't hand-pick a
matching "bright" shade for every accent of every theme in advance —
each one has to be *computed* from whatever that theme's own base color
turns out to be.

### The Concept, Isolated

First real use of hex-color channel blending in this project. The full
isolated lab lives in `concepts/javascript-hex-color-blending.md` — run
for real this session, proving `lightenHex("#63b8ff", 0.3)` produces
`#92cdff`, and `lightenHex("#63b8ff", 1.0)` — the full remaining distance
to white — lands exactly on `#ffffff`.

### Project Change

- **Reference Source:** `ThemeEngine.js`'s `hexToRgbArray` (lines 44-58)
  and `rgbArrayToHex` (lines 127-134), for the real hex-to-channels and
  channels-to-hex conversion shape. **Not** a port of that same file's
  `generatePalette` (lines 146-165) — that function builds an entire
  11-shade Tailwind-style scale (`50` through `950`) toward both white
  *and* black from one base color, because Tailwind's utility classes
  need a full scale. This project's token set only ever needs *one*
  "brighter" variant per base color, never a whole scale — `lightenHex`/
  `darkenHex` below are a from-scratch, much smaller replacement built
  for that narrower, real need.
- **Files affected:** `cnc-web/src/themes.ts`.
- **Change type:** add.
- **Location:** immediately after `hexToRgb`.
- **Dependencies:** `hexToRgb`, just added above.

### The New Code

```typescript
function rgbToHex(r: number, g: number, b: number): string {
  const clamp = (n: number) => Math.round(Math.max(0, Math.min(255, n)));
  const toHex = (n: number) => clamp(n).toString(16).padStart(2, "0");
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

export function lightenHex(hex: string, amount: number): string {
  const [r, g, b] = hexToRgb(hex);
  return rgbToHex(r + (255 - r) * amount, g + (255 - g) * amount, b + (255 - b) * amount);
}

export function darkenHex(hex: string, amount: number): string {
  const [r, g, b] = hexToRgb(hex);
  return rgbToHex(r * (1 - amount), g * (1 - amount), b * (1 - amount));
}

export function hexToRgba(hex: string, alpha: number): string {
  const [r, g, b] = hexToRgb(hex);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}
```

### The Updated Project

`themes.ts` now has four small functions stacked directly under
`hexToRgb`, each one building on the last:

```typescript
function hexToRgb(hex: string): [number, number, number] {
  const clean = hex.replace("#", "");
  return [
    parseInt(clean.slice(0, 2), 16),
    parseInt(clean.slice(2, 4), 16),
    parseInt(clean.slice(4, 6), 16),
  ];
}

function rgbToHex(r: number, g: number, b: number): string {          // ← new
  const clamp = (n: number) => Math.round(Math.max(0, Math.min(255, n)));
  const toHex = (n: number) => clamp(n).toString(16).padStart(2, "0");
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

export function lightenHex(hex: string, amount: number): string {    // ← new
  const [r, g, b] = hexToRgb(hex);
  return rgbToHex(r + (255 - r) * amount, g + (255 - g) * amount, b + (255 - b) * amount);
}

export function darkenHex(hex: string, amount: number): string {     // ← new
  const [r, g, b] = hexToRgb(hex);
  return rgbToHex(r * (1 - amount), g * (1 - amount), b * (1 - amount));
}

export function hexToRgba(hex: string, alpha: number): string {      // ← new
  const [r, g, b] = hexToRgb(hex);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}
```

Together, these four functions turn one hex string into every derived
shade the rest of the file needs: a lighter variant, a darker variant, or
a translucent version for a background tint — each one a few lines, none
duplicating `hexToRgb`'s own conversion logic.

### Mechanical Walkthrough

- `const clamp = (n: number) => ...` — **(b) reappearing** — an arrow
  function assigned to a local `const`, already established since Lesson
  7.
- `Math.max(0, Math.min(255, n))` — **(b) reappearing** — `Math.min`/
  `Math.max` composed to clamp a number into a range, an already-basic
  combination of two already-taught methods.
- `.toString(16)` — **(b) reappearing**, per
  `javascript-hexadecimal-number-literal.md`.
- `.padStart(2, "0")` — **(b) reappearing** — this exact method already
  appears in this project's own `ToolCardList.tsx`/`ToolImportPanel.tsx`
  for tool numbers; here it guarantees every channel is exactly two hex
  digits, so a low channel value like `10` (hex `"a"`) becomes `"0a"`
  instead of producing a broken 5-character color.
- `` `#${toHex(r)}${toHex(g)}${toHex(b)}` `` — **(b) reappearing** —
  template literal string building, already established.
- `r + (255 - r) * amount` — **(a) first appearance** — linear
  interpolation toward `255`, per `javascript-hex-color-blending.md`.
- `r * (1 - amount)` — **(a) first appearance**, `darkenHex`'s mirror —
  interpolation toward `0` specifically: at `amount: 1`, `r * 0` is
  always `0`, landing exactly on black regardless of the starting value.
- `` `rgba(${r}, ${g}, ${b}, ${alpha})` `` — **(b) reappearing** —
  template literal, producing the exact CSS `rgba(...)` syntax this
  project's own `--color-amber-bg`/`--color-accent-green-bg` tokens
  already used as hand-written literals since Lesson 9 — now generated
  instead of hand-picked.

### CS Lens

Per `javascript-hex-color-blending.md`: linear interpolation, the same
technique behind any graphics engine's color or position blending.

### SE Lens

The real tradeoff, stated concretely for this project: a computed blend
can land on a shade a designer wouldn't have hand-picked for every one of
18 themes — a real, accepted cost — in exchange for never having to
hand-author 18 separate "bright" and "strong" variants (36 extra colors)
that a fixed palette approach would require.

### Run It — Real Output

```
$ node -e "
function hexToRgb(hex){const c=hex.replace('#','');return [parseInt(c.slice(0,2),16),parseInt(c.slice(2,4),16),parseInt(c.slice(4,6),16)];}
function rgbToHex(r,g,b){const toHex=(n)=>Math.round(n).toString(16).padStart(2,'0');return '#'+toHex(r)+toHex(g)+toHex(b);}
function lightenHex(hex,amount){const [r,g,b]=hexToRgb(hex);return rgbToHex(r+(255-r)*amount,g+(255-g)*amount,b+(255-b)*amount);}
console.log(lightenHex('#63b8ff', 0.3));
"
#92cdff
```

The real accent blue, lightened by 30% toward white — this is the exact
value this project's theme switch now computes for `--color-accent-blue-bright`
instead of a hand-picked literal.

---

## Concept Unit: Browser `localStorage`

### The Problem

A chosen theme needs to survive a page reload — nothing about React state
does that on its own; a fresh page load starts every `useState` back at
whatever its initial value was.

### The Concept, Isolated

First real use of `localStorage` in this project (though the real
`cnc-sim` reference this project ports from already relies on it, for
tool libraries — `cnc-sim/cnc/CNCSim.jsx` lines 1788, 1836, 1923, 4273,
4289). The full isolated lab lives in `concepts/browser-local-storage.md`
— run for real this session (via Node's own experimental Web Storage
support), proving a value written with `setItem` reads back exactly as
given, and a never-set key returns `null` rather than throwing.

### Project Change

- **Reference Source:** `ThemeContext.jsx` lines 25 and 30 —
  `localStorage.getItem("studio_theme") || "default"` and
  `localStorage.setItem("studio_theme", newTheme)` — the same
  get-with-fallback / set-on-selection shape, ported directly; this
  project's own key name (`"cnc-theme"`) and fallback id (`"slate"`,
  this project's own current look) are its own, not copied.
- **Files affected:** `cnc-web/src/themes.ts`.
- **Change type:** add.
- **Location:** below the four color-math functions, above `applyTheme`.
- **Dependencies:** none.

### The New Code

```typescript
const STORAGE_KEY = "cnc-theme";

export function getStoredThemeId(): string {
  return localStorage.getItem(STORAGE_KEY) || "slate";
}
```

### The Updated Project

This sits directly above `applyTheme`, which is the other half of this
same round trip:

```typescript
const STORAGE_KEY = "cnc-theme";

export function getStoredThemeId(): string {                // ← new
  return localStorage.getItem(STORAGE_KEY) || "slate";       // ← new
}                                                             // ← new

export function findTheme(id: string): ThemeDefinition {
  return THEMES.find((t) => t.id === id) ?? THEMES.find((t) => t.id === "slate")!;
}

export function applyTheme(theme: ThemeDefinition) {
  // ... (shown in full in the next Concept Unit)
  localStorage.setItem(STORAGE_KEY, theme.id);               // ← new, at the very end
}
```

`getStoredThemeId` is what `App.tsx` calls once, at startup, to decide
which theme to show before the user has clicked anything;
`applyTheme`'s own `setItem` call is what makes the *next* visit
remember whatever gets chosen this time.

### Mechanical Walkthrough

- `const STORAGE_KEY = "cnc-theme"` — **(c) already basic** — a named
  constant, used so the same literal string isn't repeated at both the
  `getItem` and `setItem` call sites.
- `localStorage.getItem(STORAGE_KEY)` — **(a) first appearance**, per
  `browser-local-storage.md`.
- `|| "slate"` — **(b) reappearing** — `javascript-logical-or-default-fallback.md`'s
  own pattern, applied here to `getItem`'s real `null`-on-missing-key
  result specifically.
- `localStorage.setItem(STORAGE_KEY, theme.id)` — **(a) first
  appearance**, per `browser-local-storage.md`.

### Execution Trace

`getStoredThemeId()` against the two real cases `browser-local-
storage.md`'s own lab already proved: a key that was previously set,
and one that was never set at all:

```
Case 1 — a real prior visit already ran applyTheme(nordTheme), so
localStorage's own "cnc-theme" key holds "nord":
  localStorage.getItem("cnc-theme") → "nord"  (a real, non-null string)
  "nord" || "slate" → "nord" is truthy → "nord"
  return "nord"

Case 2 — a brand-new browser profile, "cnc-theme" was never set:
  localStorage.getItem("cnc-theme") → null
  null || "slate" → null is falsy → "slate"
  return "slate"
```

`|| "slate"` only ever matters in Case 2 — `getItem`'s real return value
is what decides which branch runs, the same fallback pattern already
established for other missing-value cases, just applied here to
`localStorage`'s own real `null`-for-missing-key behavior.

### CS Lens

Per `browser-local-storage.md`: a real, minimal key-value store, the same
fundamental interface as any `dict`-backed lookup table.

### SE Lens

The real alternative — a server-side "user preferences" record — is the
only option if this needed to follow a user across devices; `localStorage`
is the right, smaller tool specifically because a theme choice is a pure,
per-device UI preference with no reason to involve a server request at
all.

### Run It — Real Output

Verified live, in the running app, via the browser's own DevTools
console: after selecting "Nord" through the real UI,
`localStorage.getItem("cnc-theme")` returns `"nord"`; after a full page
reload, the app opens already showing Nord's colors, confirming the round
trip.

This is the last standalone piece `applyTheme` needs — the next unit
wires all of them together.

---

## Concept Unit: Writing a CSS Custom Property from JavaScript

### The Problem

Every color-math function above produces a real hex string — but a hex
string sitting in a JavaScript variable doesn't change anything on
screen. `theme.css`'s existing rules — all 26 of them, built up since
Lesson 9 — already reference `var(--color-bg)`, `var(--color-accent-blue)`,
and so on, everywhere they need a color. Something has to actually change
what those variable *names* resolve to, at runtime, without rewriting a
single one of those existing rules.

### The Concept, Isolated

First real use of writing (not just reading) a CSS custom property from
JavaScript. The full isolated lab lives in
`concepts/javascript-css-custom-property-write.md` — run for real this
session via `jsdom`, proving `root.style.setProperty("--color-bg", "#ff0000")`
makes `getComputedStyle(root).getPropertyValue("--color-bg")` immediately
return that new value.

### Project Change

- **Reference Source:** `ThemeContext.jsx` lines 74-80 — building a
  `<style>` element and setting its `innerHTML` to a generated CSS
  string. **Not** a port of that mechanism: that approach exists because
  the reference app's tokens are Tailwind utility-class custom properties
  scoped under `:root`/`.dark` selectors specifically — an entire
  generated stylesheet, rewritten wholesale on every theme change. This
  project's tokens already live directly on `:root` as plain custom
  properties with no `.dark`-class scoping at all, so setting each one
  individually via `.style.setProperty` is the simpler, real fit — no
  stylesheet generation needed for a fixed, already-known list of
  property names.
- **Files affected:** `cnc-web/src/themes.ts`.
- **Change type:** add.
- **Location:** below `findTheme`, as the file's main exported function.
- **Dependencies:** `lightenHex`, `darkenHex`, `hexToRgba`, `getStoredThemeId`'s
  sibling `STORAGE_KEY`, all added in the units above.

### The New Code

```typescript
function emphasize(hex: string, amount: number, isLight: boolean): string {
  return isLight ? darkenHex(hex, amount) : lightenHex(hex, amount);
}

export function applyTheme(theme: ThemeDefinition) {
  const isLight = theme.type === "light";
  const root = document.documentElement.style;
  root.setProperty("--color-bg", theme.bg0);
  root.setProperty("--color-panel", theme.bg1);
  root.setProperty("--color-grid", theme.txt2);
  root.setProperty("--color-border", theme.border);
  root.setProperty("--color-border-strong", emphasize(theme.border, 0.25, isLight));
  root.setProperty("--color-text", theme.txt1);
  root.setProperty("--color-text-dim", theme.txt2);
  root.setProperty("--color-muted", theme.txt2);
  root.setProperty("--color-accent-blue", theme.accentHex);
  root.setProperty("--color-accent-blue-bright", emphasize(theme.accentHex, 0.3, isLight));
  root.setProperty("--color-accent-green", theme.h3);
  root.setProperty("--color-accent-green-bright", emphasize(theme.h3, 0.3, isLight));
  root.setProperty("--color-accent-green-bg", hexToRgba(theme.h3, 0.1));
  localStorage.setItem(STORAGE_KEY, theme.id);
}
```

### The Updated Project

This is `themes.ts`'s complete, final exported function — everything
built in this lesson's earlier units feeds into it:

```typescript
export interface ThemeDefinition {
  id: string;
  name: string;
  emoji: string;
  group: string;
  type: "light" | "dark" | "dynamic";
  accentHex: string;
  bg0: string;
  bg1: string;
  border: string;
  txt1: string;
  txt2: string;
  h2: string;
  h3: string;
}

export const THEMES: ThemeDefinition[] = [ /* 18 real entries — see Design Tokens unit below */ ];

export const GROUP_ORDER = ["System", "Developer", "Pastel", "Framework", "Colorful", "Focus"];

function hexToRgb(hex: string): [number, number, number] { /* unchanged, above */ }
function rgbToHex(r: number, g: number, b: number): string { /* unchanged, above */ }
export function lightenHex(hex: string, amount: number): string { /* unchanged, above */ }
export function darkenHex(hex: string, amount: number): string { /* unchanged, above */ }
export function hexToRgba(hex: string, alpha: number): string { /* unchanged, above */ }

function emphasize(hex: string, amount: number, isLight: boolean): string {   // ← new
  return isLight ? darkenHex(hex, amount) : lightenHex(hex, amount);          // ← new
}                                                                              // ← new

const STORAGE_KEY = "cnc-theme";

export function getStoredThemeId(): string {
  return localStorage.getItem(STORAGE_KEY) || "slate";
}

export function findTheme(id: string): ThemeDefinition {
  return THEMES.find((t) => t.id === id) ?? THEMES.find((t) => t.id === "slate")!;
}

export function applyTheme(theme: ThemeDefinition) {                          // ← new
  const isLight = theme.type === "light";                                    // ← new
  const root = document.documentElement.style;                               // ← new
  root.setProperty("--color-bg", theme.bg0);                                 // ← new
  root.setProperty("--color-panel", theme.bg1);                              // ← new
  root.setProperty("--color-grid", theme.txt2);                              // ← new
  root.setProperty("--color-border", theme.border);                          // ← new
  root.setProperty("--color-border-strong", emphasize(theme.border, 0.25, isLight));       // ← new
  root.setProperty("--color-text", theme.txt1);                              // ← new
  root.setProperty("--color-text-dim", theme.txt2);                         // ← new
  root.setProperty("--color-muted", theme.txt2);                            // ← new
  root.setProperty("--color-accent-blue", theme.accentHex);                 // ← new
  root.setProperty("--color-accent-blue-bright", emphasize(theme.accentHex, 0.3, isLight)); // ← new
  root.setProperty("--color-accent-green", theme.h3);                       // ← new
  root.setProperty("--color-accent-green-bright", emphasize(theme.h3, 0.3, isLight));       // ← new
  root.setProperty("--color-accent-green-bg", hexToRgba(theme.h3, 0.1));    // ← new
  localStorage.setItem(STORAGE_KEY, theme.id);                              // ← new
}
```

`themes.ts` as a whole now does exactly one job end to end: given a
theme's id, look it up, compute every derived shade it doesn't store
directly, and push all thirteen resulting values onto the one element
every rule in `theme.css` already reads its colors from.

### Mechanical Walkthrough

- `emphasize(hex, amount, isLight)` — **(c) already basic** — a plain
  function; its own ternary body is **(b) reappearing**
  (`ternary-conditional-operator.md`).
- `theme.type === "light"` — **(b) reappearing** — strict equality on a
  union-typed field (`typescript-union-types.md`).
- `document.documentElement.style` — **(b) reappearing**, per
  `javascript-css-custom-property-write.md`.
- `root.setProperty("--color-bg", theme.bg0)` and the twelve calls like it
  — **(a) first appearance** of the real project usage, per
  `javascript-css-custom-property-write.md`'s isolated lab — each call
  independent, one custom property at a time.
- `theme.txt2` used for **both** `--color-grid` and `--color-muted`/
  `--color-text-dim` — **(c) already basic** property access, but worth
  naming directly: this is not three unrelated tokens that happen to
  match, it's the same real value reused for three different roles that
  all need a legible-secondary-foreground color, decided in this
  lesson's own "What Breaks Without This" section below.

### CS Lens

Per `javascript-css-custom-property-write.md`: the cascade-and-recompute
model — every rule using `var(--color-bg)` anywhere in `theme.css`
recomputes automatically, with nothing here needing to know which rules
those are or how many of them exist.

### SE Lens

The real, size-based tradeoff named in the concept file applies exactly
here: thirteen `setProperty` calls is the right fit precisely because
every themeable difference in this project already funnels through this
fixed, small set of named tokens — the alternative (swapping an entire
generated stylesheet) would only earn its extra complexity if this
project's theming needed to change rules themselves, not just the values
those rules already reference.

### Commands

None new — this runs entirely inside the already-running Vite dev server.

### Run It — Real Output

Verified live in the browser: opening the Settings modal and clicking
"Nord" immediately repaints the ribbon, both side panels, and every
button — confirmed via DevTools' Elements panel, where `<html style="...">`
visibly gains all thirteen custom properties the instant the click
handler runs.

Every value this function pushes onto `documentElement` came from
somewhere built in this lesson — the next unit is what actually decides
*which* eighteen sets of values exist to choose from.

---

## Concept Unit: Design Tokens — a Swappable Catalog

### The Problem

Thirteen `setProperty` calls, on their own, only prove *one* theme's
worth of values can be pushed in. Supporting eighteen real, distinct
looks means having eighteen complete sets of those values sitting
somewhere, each addressable by a name, with nothing about `applyTheme`
itself needing to change as more get added.

### The Concept, Isolated

First real whole-unit architectural pattern of this kind in this
project. The full isolated lab — two tiny theme objects, swapped by one
`applyTheme(name)` lookup function, run for real — lives in
`concepts/design-tokens-theming-pattern.md`.

### Project Change

- **Reference Source:** `studioThemes.js`'s `STUDIO_THEMES` object (the
  whole file; the `dracula` entry specifically at lines 202-253, as one
  representative example) for the *real color values* of seventeen of
  this project's eighteen catalog entries — `bg0`/`bg1`/`border`/`txt1`/
  `txt2` extracted from each theme's `uiDark` Tailwind arbitrary-value
  classes (e.g. `"bg-[#282a36]"` → `"#282a36"`), and `h2`/`h3` from each
  theme's `mdDark`. The eighteenth entry, `"slate"`, is **not** ported
  from the reference at all — its values are this project's own existing
  `theme.css` `:root` block, transcribed exactly, so the very first paint
  before any theme is ever chosen looks identical to how it always has.
  `ThemePicker.jsx`'s own `buildThemeList` (lines 39-63) and
  `THEME_META` (lines 9-28) supplied the grouping (`System`/`Developer`/
  `Pastel`/`Framework`/`Colorful`/`Focus`) and per-theme emoji/type —
  organizational metadata, not colors, ported the same way Lesson 12
  ported *values*, never the mechanism generating them.
- **Files affected:** `cnc-web/src/themes.ts` (new file, this is its
  header).
- **Change type:** add.
- **Location:** top of the file.
- **Dependencies:** none.

### The New Code

```typescript
export interface ThemeDefinition {
  id: string;
  name: string;
  emoji: string;
  group: string;
  type: "light" | "dark" | "dynamic";
  accentHex: string;
  bg0: string;
  bg1: string;
  border: string;
  txt1: string;
  txt2: string;
  h2: string;
  h3: string;
}

export const THEMES: ThemeDefinition[] = [
  { id: "slate", name: "Slate", emoji: "🌑", group: "System", type: "dark",
    accentHex: "#63b8ff", bg0: "#07111e", bg1: "#1e293b", border: "#2b3a55",
    txt1: "#e6eefb", txt2: "#90a4c2", h2: "#63b8ff", h3: "#46d89f" },
  { id: "nord", name: "Nord", emoji: "🏔️", group: "Developer", type: "dark",
    accentHex: "#88c0d0", bg0: "#2e3440", bg1: "#3b4252", border: "#434c5e",
    txt1: "#d8dee9", txt2: "#4c566a", h2: "#81a1c1", h3: "#5e81ac" },
  // ...and sixteen more entries in the exact same shape.
];

export const GROUP_ORDER = ["System", "Developer", "Pastel", "Framework", "Colorful", "Focus"];
```

### The Updated Project

`THEMES` and `GROUP_ORDER` sit at the very top of `themes.ts`, above
every function this lesson's other units add — everything below reads
from this catalog, nothing writes to it at runtime. This is the file in
full, end to end, with only this unit's own two additions marked —
`hexToRgb` through `applyTheme` are unchanged, already shown in full in
this lesson's earlier units, and repeated here (not elided) so the whole
file is visible in one place:

```typescript
export interface ThemeDefinition {                          // ← new
  id: string;                                                // ← new
  name: string;                                              // ← new
  emoji: string;                                             // ← new
  group: string;                                             // ← new
  type: "light" | "dark" | "dynamic";                        // ← new
  accentHex: string;                                         // ← new
  bg0: string;                                               // ← new
  bg1: string;                                                // ← new
  border: string;                                            // ← new
  txt1: string;                                              // ← new
  txt2: string;                                              // ← new
  h2: string;                                                // ← new
  h3: string;                                                // ← new
}                                                             // ← new

export const THEMES: ThemeDefinition[] = [                                                              // ← new
  { id: "slate", name: "Slate", emoji: "🌑", group: "System", type: "dark",                              // ← new
    accentHex: "#63b8ff", bg0: "#07111e", bg1: "#1e293b", border: "#2b3a55",                             // ← new
    txt1: "#e6eefb", txt2: "#90a4c2", h2: "#63b8ff", h3: "#46d89f" },                                     // ← new
  { id: "light", name: "Light", emoji: "☀️", group: "System", type: "light",                             // ← new
    accentHex: "#f59e0b", bg0: "#ffffff", bg1: "#f8fafc", border: "#e2e8f0",                              // ← new
    txt1: "#0f172a", txt2: "#64748b", h2: "#2563eb", h3: "#059669" },                                     // ← new
  { id: "default", name: "Default", emoji: "🌑", group: "Developer", type: "dynamic",                    // ← new
    accentHex: "#0ea5e9", bg0: "#0b1322", bg1: "#07111e", border: "#1e293b",                              // ← new
    txt1: "#f1f5f9", txt2: "#94a3b8", h2: "#60a5fa", h3: "#34d399" },                                     // ← new
  { id: "github", name: "GitHub", emoji: "🐙", group: "Developer", type: "dynamic",                      // ← new
    accentHex: "#0969da", bg0: "#0d1117", bg1: "#161b22", border: "#30363d",                              // ← new
    txt1: "#c9d1d9", txt2: "#8b949e", h2: "#c9d1d9", h3: "#c9d1d9" },                                     // ← new
  { id: "dracula", name: "Dracula", emoji: "🧛", group: "Developer", type: "dark",                       // ← new
    accentHex: "#bd93f9", bg0: "#282a36", bg1: "#21222c", border: "#44475a",                              // ← new
    txt1: "#f8f8f2", txt2: "#6272a4", h2: "#ff79c6", h3: "#50fa7b" },                                     // ← new
  { id: "nord", name: "Nord", emoji: "🏔️", group: "Developer", type: "dark",                            // ← new
    accentHex: "#88c0d0", bg0: "#2e3440", bg1: "#3b4252", border: "#434c5e",                              // ← new
    txt1: "#d8dee9", txt2: "#4c566a", h2: "#81a1c1", h3: "#5e81ac" },                                     // ← new
  { id: "monokai", name: "Monokai", emoji: "🎨", group: "Developer", type: "dark",                       // ← new
    accentHex: "#a6e22e", bg0: "#272822", bg1: "#1e1f1c", border: "#49483e",                              // ← new
    txt1: "#f8f8f2", txt2: "#75715e", h2: "#a6e22e", h3: "#66d9ef" },                                     // ← new
  { id: "tokyo_night", name: "Tokyo Night", emoji: "🌃", group: "Developer", type: "dark",                // ← new
    accentHex: "#7aa2f7", bg0: "#1a1b26", bg1: "#16161e", border: "#292e42",                              // ← new
    txt1: "#c0caf5", txt2: "#565f89", h2: "#7aa2f7", h3: "#bb9af7" },                                     // ← new
  { id: "one_dark", name: "One Dark", emoji: "⚛️", group: "Developer", type: "dark",                     // ← new
    accentHex: "#61afef", bg0: "#282c34", bg1: "#21252b", border: "#3e4451",                              // ← new
    txt1: "#abb2bf", txt2: "#5c6370", h2: "#61afef", h3: "#c678dd" },                                     // ← new
  { id: "catppuccin", name: "Catppuccin", emoji: "🌸", group: "Pastel", type: "dark",                    // ← new
    accentHex: "#cba6f7", bg0: "#24273a", bg1: "#1e2030", border: "#363a4f",                              // ← new
    txt1: "#cad3f5", txt2: "#8087a2", h2: "#cba6f7", h3: "#8aadf4" },                                     // ← new
  { id: "catppuccin-latte", name: "Catppuccin Latte", emoji: "☕", group: "Pastel", type: "light",        // ← new
    accentHex: "#8839ef", bg0: "#eff1f5", bg1: "#e6e9ef", border: "#ccd0da",                              // ← new
    txt1: "#4c4f69", txt2: "#6c6f85", h2: "#8839ef", h3: "#1e66f5" },                                     // ← new
  { id: "vue-dark", name: "Vue Dark", emoji: "💚", group: "Framework", type: "dark",                     // ← new
    accentHex: "#41b883", bg0: "#0b1a12", bg1: "#081410", border: "#064e3b",                              // ← new
    txt1: "#f1f5f9", txt2: "#94a3b8", h2: "#34d399", h3: "#10b981" },                                     // ← new
  { id: "vue-light", name: "Vue Light", emoji: "🌿", group: "Framework", type: "light",                  // ← new
    accentHex: "#41b883", bg0: "#ffffff", bg1: "#ecfdf5", border: "#a7f3d0",                              // ← new
    txt1: "#0f172a", txt2: "#475569", h2: "#047857", h3: "#059669" },                                     // ← new
  { id: "synthwave", name: "SynthWave '84", emoji: "🕹️", group: "Colorful", type: "dark",                // ← new
    accentHex: "#ff7edb", bg0: "#262335", bg1: "#1e1c29", border: "#3f3c4c",                              // ← new
    txt1: "#f8f8f2", txt2: "#848bbd", h2: "#36f9f6", h3: "#f92aad" },                                     // ← new
  { id: "cyberFuchsia", name: "Cyber Fuchsia", emoji: "💜", group: "Colorful", type: "dynamic",           // ← new
    accentHex: "#d946ef", bg0: "#180024", bg1: "#240036", border: "#4c0070",                              // ← new
    txt1: "#fdf4ff", txt2: "#e8b5ff", h2: "#d946ef", h3: "#a855f7" },                                     // ← new
  { id: "electricBlue", name: "Electric Blue", emoji: "⚡", group: "Colorful", type: "dynamic",           // ← new
    accentHex: "#3b82f6", bg0: "#030b22", bg1: "#061536", border: "#133772",                              // ← new
    txt1: "#eff6ff", txt2: "#bfdbfe", h2: "#3b82f6", h3: "#60a5fa" },                                     // ← new
  { id: "cyberCyan", name: "Cyber Cyan", emoji: "🌊", group: "Colorful", type: "dynamic",                 // ← new
    accentHex: "#06b6d4", bg0: "#001924", bg1: "#002636", border: "#00577a",                              // ← new
    txt1: "#ecfeff", txt2: "#a5f3fc", h2: "#06b6d4", h3: "#22d3ee" },                                     // ← new
  { id: "paperTextbook", name: "Paper Textbook", emoji: "📄", group: "Focus", type: "light",              // ← new
    accentHex: "#475569", bg0: "#f9f9f6", bg1: "#f0f0eb", border: "#d4d4cd",                              // ← new
    txt1: "#2b2b29", txt2: "#52524e", h2: "#334155", h3: "#475569" },                                     // ← new
  { id: "sepiaTextbook", name: "Sepia Textbook", emoji: "📚", group: "Focus", type: "dark",               // ← new
    accentHex: "#f97316", bg0: "#2a2723", bg1: "#36322d", border: "#5c554d",                              // ← new
    txt1: "#e3dfd7", txt2: "#a8a195", h2: "#fb923c", h3: "#fdba74" },                                     // ← new
];                                                                                                          // ← new

export const GROUP_ORDER = ["System", "Developer", "Pastel", "Framework", "Colorful", "Focus"]; // ← new

function hexToRgb(hex: string): [number, number, number] {
  const clean = hex.replace("#", "");
  return [
    parseInt(clean.slice(0, 2), 16),
    parseInt(clean.slice(2, 4), 16),
    parseInt(clean.slice(4, 6), 16),
  ];
}

function rgbToHex(r: number, g: number, b: number): string {
  const clamp = (n: number) => Math.round(Math.max(0, Math.min(255, n)));
  const toHex = (n: number) => clamp(n).toString(16).padStart(2, "0");
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

export function lightenHex(hex: string, amount: number): string {
  const [r, g, b] = hexToRgb(hex);
  return rgbToHex(r + (255 - r) * amount, g + (255 - g) * amount, b + (255 - b) * amount);
}

export function darkenHex(hex: string, amount: number): string {
  const [r, g, b] = hexToRgb(hex);
  return rgbToHex(r * (1 - amount), g * (1 - amount), b * (1 - amount));
}

export function hexToRgba(hex: string, alpha: number): string {
  const [r, g, b] = hexToRgb(hex);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function emphasize(hex: string, amount: number, isLight: boolean): string {
  return isLight ? darkenHex(hex, amount) : lightenHex(hex, amount);
}

const STORAGE_KEY = "cnc-theme";

export function getStoredThemeId(): string {
  return localStorage.getItem(STORAGE_KEY) || "slate";
}

export function findTheme(id: string): ThemeDefinition {
  return THEMES.find((t) => t.id === id) ?? THEMES.find((t) => t.id === "slate")!;
}

export function applyTheme(theme: ThemeDefinition) {
  const isLight = theme.type === "light";
  const root = document.documentElement.style;
  root.setProperty("--color-bg", theme.bg0);
  root.setProperty("--color-panel", theme.bg1);
  root.setProperty("--color-grid", theme.txt2);
  root.setProperty("--color-border", theme.border);
  root.setProperty("--color-border-strong", emphasize(theme.border, 0.25, isLight));
  root.setProperty("--color-text", theme.txt1);
  root.setProperty("--color-text-dim", theme.txt2);
  root.setProperty("--color-muted", theme.txt2);
  root.setProperty("--color-accent-blue", theme.accentHex);
  root.setProperty("--color-accent-blue-bright", emphasize(theme.accentHex, 0.3, isLight));
  root.setProperty("--color-accent-green", theme.h3);
  root.setProperty("--color-accent-green-bright", emphasize(theme.h3, 0.3, isLight));
  root.setProperty("--color-accent-green-bg", hexToRgba(theme.h3, 0.1));
  localStorage.setItem(STORAGE_KEY, theme.id);
}
```

The whole file now reads, top to bottom, as: the shape one theme takes
→ eighteen real theme values in that shape → the small set of pure
functions (all already built in this lesson's earlier units, unchanged
here) that turn any one of them into thirteen real CSS values.

### Mechanical Walkthrough

- `interface ThemeDefinition { ... }` — **(b) reappearing** — a plain TS
  interface (`typescript-interfaces.md`); `type: "light" | "dark" | "dynamic"`
  is **(b) reappearing** a union type (`typescript-union-types.md`),
  narrowed to exactly three real string values instead of a bare `string`.
- `const THEMES: ThemeDefinition[] = [ {...}, {...}, ... ]` — **(a) first
  appearance, at the whole-unit level** — the catalog itself, per
  `design-tokens-theming-pattern.md`: eighteen complete, self-contained
  value-sets, addressable by `id`. Each individual entry — **(c) already
  basic** — is just an object literal matching the interface above it;
  the concept being taught is the *array-of-complete-sets* shape, not any
  one entry's own syntax.
- `GROUP_ORDER` — **(c) already basic** — a plain string array, used
  later to control display order (`AppearanceSettings.tsx`'s group tabs),
  separate from the catalog's own storage order.

### CS Lens

Per `design-tokens-theming-pattern.md`: a Strategy-pattern-shaped lookup
table — the same structure as a compiler's target-backend selection or a
CLI's `--format` flag, just applied to color data instead of behavior.

### SE Lens

The real cost this project already paid, named honestly per the concept
file's own account: `--color-grid` was left *out* of this catalog's
reach at first (treated as a fixed value, not a per-theme field at all),
and only surfaced as a real bug — see this lesson's "What Breaks Without
This," below, for the second, related failure this exact gap caused.

### Run It — Real Output

```
$ npx tsc --noEmit
(no output — all 18 entries satisfy ThemeDefinition)
```

This catalog is now the real source every other unit in this lesson
reads from — `applyTheme`, above, is what actually turns one of these
eighteen entries into a visible theme switch.

---

## Project Change (no new concept): `ThemeCard.tsx`

- **Reference Source:** `ThemePicker.jsx`'s `ThemeCard` function, lines
  81-185 — the *idea* (a live miniature UI preview, built from the
  theme's own real colors, so every option is comparable at a glance
  without opening each one) is ported directly; the *mechanism* is not.
  The reference builds its preview with Tailwind utility classes,
  `framer-motion` hover/tap animations, and `lucide-react` icons for the
  active checkmark and type badge. None of those are dependencies of this
  project. This project's version uses plain inline styles for exactly
  the values that vary per theme (`theme.bg0`, `theme.accentHex`, etc. —
  the same pieces the reference also sets via inline `style={{ background: ... }}`,
  even inside its own Tailwind-based version) and a plain CSS class
  (`.theme-card` and its children, in `theme.css`) for everything
  structural, with a plain `"✓"` character standing in for the reference's
  `lucide-react` checkmark icon — the same plain-Unicode convention this
  project has used for icons since `SidePanel.tsx`'s own `"✕"` close
  button in Lesson 23.
- **Files affected:** `cnc-web/src/ThemeCard.tsx` (new file),
  `cnc-web/src/theme.css` (new `.theme-card` rule family).
- **Change type:** add.
- **Dependencies:** `ThemeDefinition` from `themes.ts`.

```typescript
import type { ThemeDefinition } from "./themes.ts";

interface ThemeCardProps {
  theme: ThemeDefinition;
  isActive: boolean;
  onClick: () => void;
}

const TYPE_LABEL: Record<ThemeDefinition["type"], string> = {
  light: "Light",
  dark: "Dark",
  dynamic: "Adaptive",
};

function ThemeCard({ theme, isActive, onClick }: ThemeCardProps) {
  return (
    <button
      className={`theme-card${isActive ? " active" : ""}`}
      style={isActive ? { borderColor: theme.accentHex } : undefined}
      onClick={onClick}
    >
      <div className="theme-card-preview" style={{ background: theme.bg0 }}>
        <div className="theme-card-sidebar" style={{ background: theme.bg1 }}>
          <span className="theme-card-dot" style={{ background: theme.accentHex }} />
          <span className="theme-card-dot" style={{ background: theme.h2 }} />
          <span className="theme-card-dot" style={{ background: theme.h3 }} />
        </div>
        <div className="theme-card-body">
          <div className="theme-card-heading" style={{ background: theme.h2 }} />
          <div className="theme-card-line" style={{ background: theme.txt1, width: "90%" }} />
          <div className="theme-card-line" style={{ background: theme.txt1, width: "65%" }} />
          <div className="theme-card-code" style={{ background: theme.border }}>
            <div className="theme-card-line" style={{ background: theme.h3, width: "50%" }} />
          </div>
          <div className="theme-card-button" style={{ background: theme.accentHex }} />
        </div>
        {isActive && (
          <div className="theme-card-check" style={{ background: `${theme.accentHex}33` }}>
            <span className="theme-card-check-badge" style={{ background: theme.accentHex }}>
              ✓
            </span>
          </div>
        )}
      </div>
      <div className="theme-card-info">
        <span className="theme-card-name">
          {theme.emoji} {theme.name}
        </span>
        <span className="theme-card-type">{TYPE_LABEL[theme.type]}</span>
      </div>
    </button>
  );
}

export default ThemeCard;
```

This is a new, freestanding file, so there is no larger enclosing
structure to return to.

### Reused, Not New

`Record<ThemeDefinition["type"], string>` —
`typescript-record-utility-type.md`, Lesson 23, this project's first use
already covered that ground; `` `theme-card${isActive ? " active" : ""}` ``
— the exact conditional-className template-literal shape
`RibbonToolbar.tsx` already established in Lesson 22; `` `${theme.accentHex}33` ``
— string concatenation appending a raw two-digit alpha suffix to a hex
color, a real but tiny reuse of already-taught template literals, not a
new color-math concept (it works because CSS accepts 8-digit
`#rrggbbaa` hex colors directly — no parsing or conversion happens here,
unlike `hexToRgba`'s function-call approach above); the `isActive &&`
conditional render — `event-driven-ui-callbacks.md`/JSX conditional
rendering, established since early lessons.

### SE Lens

The real, deliberate choice here is the same one Lesson 12
already made and named: port the *value* (a rich, at-a-glance visual
comparison of every option), never the *mechanism* (a specific animation
or icon library) that happened to produce it in someone else's app.

The real CSS every one of `ThemeCard.tsx`'s own `className` strings
depends on — shown in full, not elided, even though every individual
piece of selector syntax in it is already established:

```css
.theme-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  gap: 12px;
}
.theme-card {
  display: flex;
  flex-direction: column;
  text-align: left;
  background: var(--color-bg);
  border: 2px solid var(--color-border);
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
  padding: 0;
  transition: 0.15s;
}
.theme-card:hover {
  border-color: var(--color-border-strong);
}
.theme-card-preview {
  position: relative;
  height: 84px;
  display: flex;
}
.theme-card-sidebar {
  width: 20px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding-top: 6px;
}
.theme-card-dot {
  width: 8px;
  height: 8px;
  border-radius: 3px;
}
.theme-card-body {
  flex: 1;
  padding: 6px 8px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.theme-card-heading {
  height: 5px;
  width: 55%;
  border-radius: 2px;
  opacity: 0.9;
}
.theme-card-line {
  height: 3px;
  border-radius: 2px;
  opacity: 0.5;
}
.theme-card-code {
  border-radius: 3px;
  padding: 4px;
  margin-top: 2px;
}
.theme-card-button {
  margin-top: auto;
  align-self: flex-start;
  width: 28px;
  height: 8px;
  border-radius: 3px;
}
.theme-card-check {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}
.theme-card-check-badge {
  width: 22px;
  height: 22px;
  border-radius: 50%;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  font-weight: 700;
}
.theme-card-info {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 6px 8px;
  background: var(--color-panel);
  border-top: 1px solid var(--color-border);
}
.theme-card-name {
  font-size: 10px;
  font-weight: 700;
  color: var(--color-text);
}
.theme-card-type {
  font-size: 8px;
  font-weight: 700;
  color: var(--color-muted);
  text-transform: uppercase;
}
```

**Every selector here — (b) reappearing, nothing new:** `.theme-grid`'s
`grid-template-columns: repeat(auto-fill, minmax(160px, 1fr))` is the
same real `css-grid-layout.md` mechanism already covering this project's
grid-based layouts; `.theme-card:hover` is the same pseudo-class syntax
established since Lesson 17/18's own `.btn:hover`; every other selector
here is a plain class selector, `css-rule-syntax-selectors-cascade.md`'s
own baseline. Citing "reappearing" here means the *selector syntax*
needs no new lab — it never means the real rule bodies themselves get
skipped; `transition: 0.15s` (the card's own hover-scale timing) and the
absolutely-positioned `.theme-card-check` overlay are real, working CSS a
reader needs in front of them to reproduce this component at all.

---

## Project Change (no new concept): `ConfigModal.tsx` and `AppearanceSettings.tsx`

- **Reference Source:** `ThemePicker.jsx`'s `ThemeModal` function, lines
  188-370, for the real *interaction* shape — group tabs across the top,
  a card grid below, Escape-to-close, click-outside-to-close. **Not** a
  port of that function's actual JSX or its `createPortal`/`framer-motion`
  mechanics — this project has no portal or animation library and didn't
  need one: a plain `position: fixed` element, placed as the last child
  inside `.app-shell`, already escapes every ancestor's layout the same
  way Lesson 23's `.canvas-layer` does, with no portal required.
- **Files affected:** `cnc-web/src/ConfigModal.tsx` (new),
  `cnc-web/src/AppearanceSettings.tsx` (new), `cnc-web/src/theme.css`
  (new `.config-*`/`.appearance-*` rule families).
- **Change type:** add.
- **Dependencies:** `ThemeCard.tsx`, `themes.ts`.

```typescript
import { useEffect, useState, type ReactNode } from "react";

interface ConfigSection {
  id: string;
  label: string;
  content: ReactNode;
}

interface ConfigModalProps {
  sections: ConfigSection[];
  onClose: () => void;
}

function ConfigModal({ sections, onClose }: ConfigModalProps) {
  const [activeSectionId, setActiveSectionId] = useState(sections[0]?.id);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  const activeSection = sections.find((s) => s.id === activeSectionId) ?? sections[0];

  return (
    <div className="config-backdrop" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="config-modal">
        <div className="config-header">
          <span className="config-title">Configuration</span>
          <button className="config-close" onClick={onClose}>✕</button>
        </div>
        <div className="config-body">
          <div className="config-tree">
            {sections.map((section) => (
              <button
                key={section.id}
                className={`config-tree-item${section.id === activeSection?.id ? " active" : ""}`}
                onClick={() => setActiveSectionId(section.id)}
              >
                {section.label}
              </button>
            ))}
          </div>
          <div className="config-content">{activeSection?.content}</div>
        </div>
      </div>
    </div>
  );
}

export default ConfigModal;
```

**What's reused, not new — and worth naming directly, per the 100%-match
rule's one exemption for a project reusing its own prior work:**
`activeSectionId`/`sections.find(...)`/rendering whichever entry matches
is *structurally the identical shape* `SidePanel.tsx` already built in
Lesson 23 for `activeTabId`/tabs — an array of `{ id, label, content }`
entries, one tracked "active" id, the matching entry's `content` rendered.
`ConfigModal` didn't invent a new "pick one of several named things and
show its content" pattern; it's the second real place this project has
needed exactly that shape, this time for whole settings sections instead
of panel tabs. `content: ReactNode` is the same typed prop shape
Lesson 23's `typescript-reactnode-type.md` already covered — `App.tsx`
builds each section's JSX once and hands it down, exactly as it already
does for `SidePanel`'s own tabs. The `useEffect` + `addEventListener` +
cleanup-function-removing-the-same-listener shape is
`manual-mouse-drag-pattern.md`'s own established convention
(Lesson 23), here listening for `"keydown"` instead of `"mousemove"`.
`sections.find(...) ?? sections[0]` is `javascript-array-find.md`,
Lesson 23, reused a second time.

`AppearanceSettings.tsx` is the modal's one real section so far:

```typescript
import { useState } from "react";
import ThemeCard from "./ThemeCard.tsx";
import { GROUP_ORDER, THEMES } from "./themes.ts";

interface AppearanceSettingsProps {
  currentThemeId: string;
  onSelectTheme: (id: string) => void;
}

function AppearanceSettings({ currentThemeId, onSelectTheme }: AppearanceSettingsProps) {
  const currentGroup = THEMES.find((t) => t.id === currentThemeId)?.group ?? GROUP_ORDER[0];
  const [activeGroup, setActiveGroup] = useState(currentGroup);

  const groupThemes = THEMES.filter((t) => t.group === activeGroup);

  return (
    <div className="appearance-settings">
      <div className="appearance-groups">
        {GROUP_ORDER.map((group) => (
          <button
            key={group}
            className={`appearance-group-tab${group === activeGroup ? " active" : ""}`}
            onClick={() => setActiveGroup(group)}
          >
            {group}
          </button>
        ))}
      </div>
      <div className="theme-grid">
        {groupThemes.map((theme) => (
          <ThemeCard
            key={theme.id}
            theme={theme}
            isActive={theme.id === currentThemeId}
            onClick={() => onSelectTheme(theme.id)}
          />
        ))}
      </div>
    </div>
  );
}

export default AppearanceSettings;
```

`THEMES.filter((t) => t.group === activeGroup)` — `.filter` already
appears in this project's own `ToolCardList.tsx` and `App.tsx`
(`panel.tabs.filter(...)`, Lesson 23) and was already named directly
alongside `.find` in `javascript-array-find.md`'s own mechanical
walkthrough — reused a second time here, not new. `?.group` — optional
chaining, already established (`javascript-optional-chaining.md`).

The real CSS behind both components' own `className` strings — the
generic tree-left/content-right shell and its one real section:

```css
.config-backdrop {
  position: fixed;
  inset: 0;
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.5);
}
.config-modal {
  width: min(900px, 92vw);
  height: min(600px, 86vh);
  display: flex;
  flex-direction: column;
  background: var(--color-panel);
  border: 1px solid var(--color-border-strong);
  border-radius: 8px;
  overflow: hidden;
}
.config-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  border-bottom: 1px solid var(--color-border);
  flex-shrink: 0;
}
.config-title {
  font-size: 13px;
  font-weight: 700;
  color: var(--color-text);
}
.config-close {
  background: none;
  border: none;
  color: var(--color-muted);
  font-size: 14px;
  cursor: pointer;
}
.config-close:hover {
  color: var(--color-rapid);
}
.config-body {
  flex: 1;
  display: flex;
  min-height: 0;
}
.config-tree {
  width: 180px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 10px;
  border-right: 1px solid var(--color-border);
  overflow-y: auto;
}
.config-tree-item {
  text-align: left;
  background: none;
  border: none;
  border-radius: 4px;
  padding: 7px 10px;
  font-size: 11px;
  font-weight: 600;
  color: var(--color-muted);
  cursor: pointer;
}
.config-tree-item:hover {
  color: var(--color-text);
  background: var(--color-bg);
}
.config-tree-item.active {
  color: var(--color-text);
  background: var(--color-bg);
  box-shadow: inset 2px 0 0 var(--color-accent-blue);
}
.config-content {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
}

.appearance-settings {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.appearance-groups {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}
.appearance-group-tab {
  background: var(--color-bg);
  border: 1px solid var(--color-border);
  color: var(--color-muted);
  border-radius: 6px;
  padding: 5px 12px;
  font-size: 10px;
  font-weight: 700;
  cursor: pointer;
}
.appearance-group-tab:hover {
  color: var(--color-text);
}
.appearance-group-tab.active {
  color: var(--color-text);
  border-color: var(--color-accent-blue);
}
```

**(b) reappearing, all of it:** `position: fixed`/`inset: 0`/`z-index: 100`
on `.config-backdrop` is the exact same full-screen-overlay mechanism
`css-fixed-positioning-and-stacking.md` already covers (Lesson 23's own
`.canvas-layer`), here layering a modal above the app instead of a
canvas beneath it; `min(900px, 92vw)`/`min(600px, 86vh)` is a plain CSS
function call, already-basic syntax, picking whichever of the two
lengths is smaller so the modal never exceeds the real viewport on a
small window; `:hover`/`.active` compound selectors are the same syntax
already covered above for `.theme-card`. Nothing new to teach — but the
real declarations still have to be here for this component to actually
render as shown, not just described.

---

## Concept Unit: Default Parameter Values

### The Problem

`RibbonToolbar` gained a genuinely new kind of button in this lesson — a
plain action, opening the settings modal, with no on/off state at all
(see the next Project Change for why that's a new interface, not a reuse
of `PanelToggle`). Every existing call site that renders a ribbon with no
actions at all — which, before this lesson, was every call site — needs
to keep working with zero changes.

### The Concept, Isolated

First real use of a default value attached to a destructured function
parameter in this project's JavaScript/TypeScript code. (`python-default-parameter-values.md`
already covers this same *idea* in Python — the 100%-match rule requires
the exact same construct in the exact same language, and JavaScript's
own default-parameter mechanics — specifically, only `undefined` ever
triggers the default — genuinely differ, so this is a new concept file,
not a duplicate.) The full isolated lab lives in
`concepts/javascript-default-parameter-values.md` — run for real this
session, proving a call with `actions` omitted entirely produces a real,
usable empty array.

### Project Change

- **Reference Source:** No reference counterpart — `cnc-sim` has no
  ribbon or settings modal of its own; this button and its plumbing are a
  from-scratch addition.
- **Files affected:** `cnc-web/src/RibbonToolbar.tsx`.
- **Change type:** add (new interface, new prop, new default).
- **Location:** new `RibbonAction` interface next to the existing
  `PanelToggle`/`RibbonGroup`; new `actions` prop on `RibbonToolbarProps`;
  the component's own parameter list.
- **Dependencies:** none new.

### The New Code

```typescript
interface RibbonAction {
  id: string;
  label: string;
  onClick: () => void;
}

interface RibbonToolbarProps {
  groups: RibbonGroup[];
  actions?: RibbonAction[];
}

function RibbonToolbar({ groups, actions = [] }: RibbonToolbarProps) {
```

### The Updated Project

`RibbonToolbar.tsx` in full, with the new interface, prop, and rendering
branch marked:

```typescript
interface PanelToggle {
  id: string;
  label: string;
  visible: boolean;
  onToggle: () => void;
}

interface RibbonGroup {
  label: string;
  toggles: PanelToggle[];
}

interface RibbonAction {                                    // ← new
  id: string;                                                // ← new
  label: string;                                             // ← new
  onClick: () => void;                                       // ← new
}                                                             // ← new

interface RibbonToolbarProps {
  groups: RibbonGroup[];
  actions?: RibbonAction[];                                  // ← new
}

function RibbonToolbar({ groups, actions = [] }: RibbonToolbarProps) {  // ← changed
  return (
    <div className="ribbon">
      {groups.map((group) => (
        <div key={group.label} className="ribbon-group">
          <div className="ribbon-buttons">
            {group.toggles.map((toggle) => (
              <button
                key={toggle.id}
                className={`btn ribbon-btn${toggle.visible ? " on" : ""}`}
                onClick={toggle.onToggle}
              >
                {toggle.label}
              </button>
            ))}
          </div>
          <div className="ribbon-group-label">{group.label}</div>
        </div>
      ))}
      {actions.length > 0 && (                                // ← new
        <div className="ribbon-actions">                      // ← new
          {actions.map((action) => (                          // ← new
            <button key={action.id} className="btn ribbon-btn" onClick={action.onClick}>  {/* ← new */}
              {action.label}                                  // ← new
            </button>                                          // ← new
          ))}                                                  // ← new
        </div>                                                 // ← new
      )}
      </div>
  );
}

export default RibbonToolbar;
```

`RibbonToolbar` now renders two independent things: the existing
per-group panel toggles, unchanged, and — only when actually supplied —
a separate cluster of plain action buttons, visually set apart by
`.ribbon-actions`'s own `margin-left: auto`, which pushes it to the far
right of the bar. The real rule itself, added to `theme.css` alongside
the ribbon's existing rules:

```css
.ribbon-actions {
  margin-left: auto;
  display: flex;
  align-items: center;
}
```

`margin-left: auto` — **(b) reappearing** — the same real
flexbox-auto-margin mechanism `css-flexbox-layout.md` already covers:
inside a flex container (`.ribbon` itself), an automatic left margin
consumes every pixel of remaining free space up to this element, which
is what actually pushes it to the bar's far right rather than needing an
explicit width calculation.

### Mechanical Walkthrough

- `interface RibbonAction { ... }` — **(c) already basic** — a plain TS
  interface, same shape as the already-existing `PanelToggle`, minus
  `visible`.
- `actions?: RibbonAction[]` — **(b) reappearing** — the optional-property
  `?` syntax, already established in this project's own `ToolCardList.tsx`/
  `ToolImportPanel.tsx` props (`refreshKey?`, `tools?`, `error?`, and
  others, since Lesson 17/18).
- `{ groups, actions = [] }` — **(a) first appearance** of the default
  value itself, per `javascript-default-parameter-values.md`.
- `actions.length > 0 && (...)` — **(b) reappearing** — the
  `&&`-conditional-render shape, already established.
- `actions.map((action) => (...))` — **(b) reappearing** —
  `javascript-array-map.md`, rendering one button per action, the same
  pattern already used one line above for `group.toggles.map`.

### Execution Trace

Two real call sites — `App.tsx`'s pre-lesson call (no `actions` prop at
all) and this lesson's own new one (a real Settings action):

```
<RibbonToolbar groups={...} />
  Destructuring { groups, actions = [] } against { groups: [...] }
  → actions property is undefined (never passed) → default applies
  → actions = []
  actions.length > 0?  → 0 > 0 → False → the whole {actions.length > 0 && (...)}
    expression evaluates to false → nothing rendered for actions at all
    (no <div className="ribbon-actions">, no wasted empty <div>)

<RibbonToolbar groups={...} actions={[{id:"settings", label:"⚙", onClick:openSettingsModal}]} />
  Destructuring against { groups: [...], actions: [{...}] }
  → actions property IS present → default does NOT apply
  → actions = [{id:"settings", label:"⚙", onClick:openSettingsModal}]
  actions.length > 0?  → 1 > 0 → True → renders <div className="ribbon-actions">
    actions.map(...):
      action={id:"settings", label:"⚙", ...}:
        → <button key="settings" className="btn ribbon-btn" onClick={openSettingsModal}>⚙</button>
    → 1 real button rendered
```

Every pre-existing `<RibbonToolbar groups={...} />` call site in the
app keeps working with no changes at all — the default's whole point is
that `actions.length > 0` evaluates to `false` for them without any of
those call sites needing to know `actions` exists.

### CS Lens

Per `javascript-default-parameter-values.md`: an optional parameter with
a built-in fallback, the same idea as any language's default/optional
argument mechanism.

### SE Lens

The real, concrete payoff: every one of this project's existing
`<RibbonToolbar groups={...} />` call sites — there was exactly one,
`App.tsx`'s own — needed zero changes to keep compiling and rendering
correctly after this prop was added, specifically because the default
means "no `actions` provided" is a fully valid, already-handled case, not
a new required argument every caller would otherwise need to be updated
to pass.

### Run It — Real Output

```
$ npx tsc --noEmit
(no output — compiles cleanly with the existing App.tsx call site, unmodified at this point)
```

`App.tsx` is what actually supplies a real `actions` array next, wiring
this new button to open the modal this lesson has been building toward.

---

## Concept Unit: `useState`'s Lazy Initializer Function

### The Problem

`App.tsx` needs to apply whichever theme was last chosen — read from
`localStorage` — the moment the app starts, before the very first paint,
so a returning visitor never sees a flash of the wrong theme. That read,
and the `applyTheme` call using it, are real work with a real side
effect; doing them as a plain expression handed to `useState` would
repeat that work on every single re-render of `App`, forever, for no
reason after the very first one.

### The Concept, Isolated

First real use of `useState`'s lazy initializer form in this project.
The full isolated lab lives in
`concepts/react-usestate-lazy-initializer.md` — run for real this
session (via `jsdom` + `react-dom/client`), proving a plain-expression
default was called once per render across four forced re-renders, while
the lazy form was called exactly once, ever.

### Project Change

- **Reference Source:** No reference counterpart — `cnc-sim` has no
  theme system of its own to restore on load.
- **Files affected:** `cnc-web/src/App.tsx`.
- **Change type:** add.
- **Location:** inside `App`, alongside its other `useState` calls.
- **Dependencies:** `getStoredThemeId`, `findTheme`, `applyTheme` from
  `themes.ts`.

### The New Code

```typescript
const [themeId, setThemeId] = useState(() => {
  const id = getStoredThemeId();
  applyTheme(findTheme(id));
  return id;
});
```

### The Updated Project

`App`'s existing block of `useState` calls, with the new one added
alongside them:

```typescript
function App() {
  const [points, setPoints] = useState<PathPoint[]>([]);
  const [toolsRefreshKey, setToolsRefreshKey] = useState(0);

  const [leftWidth, setLeftWidth] = useState(220);
  const [rightWidth, setRightWidth] = useState(260);
  const [selectedPanel, setSelectedPanel] = useState<Side>("right");
  const [leftPanel, setLeftPanel] = useState<PanelState>({ tabs: [], activeTab: null });
  const [rightPanel, setRightPanel] = useState<PanelState>({ tabs: ["dro", "tools"], activeTab: "dro" });
  const [themeId, setThemeId] = useState(() => {          // ← new
    const id = getStoredThemeId();                        // ← new
    applyTheme(findTheme(id));                             // ← new
    return id;                                             // ← new
  });                                                       // ← new
  const [isConfigOpen, setIsConfigOpen] = useState(false); // ← new

  useEffect(() => {
    fetchPath(PROGRAM).then(setPoints);
  }, []);
  // ...rest of App unchanged at this point
```

`App` now has one more piece of real state, `themeId` — but unlike every
other `useState` above it, this one's very first value is never a plain
literal; it's the result of a real lookup and a real DOM mutation,
guaranteed to happen exactly once no matter how many times `App` itself
re-renders afterward.

### Mechanical Walkthrough

- `useState(() => { ... })` — **(a) first appearance**, per
  `react-usestate-lazy-initializer.md` — a function passed directly,
  not called.
- `const id = getStoredThemeId()` — **(b) reappearing**, per
  `browser-local-storage.md`'s own unit above.
- `applyTheme(findTheme(id))` — **(b) reappearing** — both functions
  built in earlier units this lesson; `findTheme`'s own `??` fallback
  (already-established nullish coalescing) guarantees this never receives
  `undefined`.
- `return id` — **(c) already basic** — the initializer's return value
  becomes `themeId`'s actual first state value, same as any other
  `useState` initial value.

### CS Lens

Per `react-usestate-lazy-initializer.md`: lazy evaluation, deferring (and
here, permanently memoizing) a computation until it's genuinely needed.

### SE Lens

The real reason this project specifically needed the lazy form, not just
"it's slightly more efficient": the plain-expression form would still
have been *correct* — just wasteful. The next Concept Unit is why a
second, sharper problem — not just waste, but a real, live bug — pushed
this project toward writing `applyTheme` calls synchronously rather than
inside any `useEffect` at all, initializer included.

### Run It — Real Output

Verified live: reloading the running app with a theme other than
`"slate"` already stored in `localStorage` shows that theme's colors
immediately on the very first paint — no flash of the default look
first, confirming the initializer runs before anything renders.

---

## Project Change (no new concept): two new, fixed light-color tokens

Before any of the Three.js mutation work below could exist, the two
lights `createViewport` builds needed a real token to read, instead of
the bare `0xffffff` number literals they'd used since Lesson 8. These are
deliberately **not** part of any theme's own varying fields — light color
is a rendering choice, fixed at pure white in every theme, the same
category as the axis and motion colors this project has kept fixed since
Lesson 9 — so they're declared once in `theme.css`'s `:root` block, never
touched by `applyTheme`.

- **Reference Source:** No reference counterpart — `cnc-sim`'s own
  lighting is likewise two fixed white lights, never tokenized at all.
- **Files affected:** `cnc-web/src/theme.css`, `cnc-web/src/theme.ts`.
- **Change type:** add.
- **Location:** `theme.css`'s `:root` block, after the existing
  `--color-accent-green-bg` line; `theme.ts`'s `ThemeColors` interface and
  `themeColors()` function.
- **Dependencies:** none.

```css
:root {
  /* ...23 existing tokens, unchanged... */
  --color-accent-green-bg: rgba(70, 216, 159, 0.1);

  --color-light-ambient: #ffffff;
  --color-light-directional: #ffffff;
}
```

```typescript
export interface ThemeColors {
  background: string;
  grid: string;
  rapid: string;
  feed: string;
  lightAmbient: string;
  lightDirectional: string;
}

export function themeColors(): ThemeColors {
  return {
    background: cssVar("--color-bg"),
    grid: cssVar("--color-grid"),
    rapid: cssVar("--color-rapid"),
    feed: cssVar("--color-feed"),
    lightAmbient: cssVar("--color-light-ambient"),
    lightDirectional: cssVar("--color-light-directional"),
  };
}
```

Both additions are **(b) reappearing** syntax throughout — a `:root`
custom-property declaration (`css-custom-properties.md`) and an
interface/return-object field addition (`typescript-interfaces.md`) —
nothing new here beyond two more names added to two already-established
shapes. What's real and worth stating plainly: this is the fix for a
genuine hardcoded-color bug that predates this lesson — the two lights
were passed a bare `0xffffff` literal directly, with zero token behind
them, since the very first version of `createViewport`. Verified live via
`npx tsc --noEmit`, and confirmed the two new custom properties resolve
correctly through `getComputedStyle` exactly like every existing token
already does.

---

## Concept Unit: Three.js — Mutating a Scene After Creation

### The Problem

`viewport.ts`'s `createViewport` builds its ambient light, directional
light, and grid once, using whatever `themeColors()` returned at that
exact moment — and never touches any of them again. A theme switch, from
this point on, needs some way to make the *already-running* 3D scene
show new colors, without tearing down and rebuilding the whole renderer,
camera, and controls just to change a light's tint.

### The Concept, Isolated

First real case in this project of changing a Three.js object's own
color after it was already built. The full isolated lab lives in
`concepts/threejs-mutating-scene-after-creation.md` — run for real this
session, proving a light's `.color.set()` genuinely changes what
renders, while the exact same call on a `GridHelper`'s material has zero
visible effect, because that helper's real color data is baked into its
geometry at construction, not read from the material at all.

### Project Change

- **Reference Source:** No reference counterpart — `cnc-sim`'s own
  Three.js viewport code, ported in earlier lessons, never changes any
  scene color after setup; this is a from-scratch addition this feature
  specifically requires.
- **Files affected:** `cnc-web/src/viewport.ts`.
- **Change type:** refactor (`colors`/`grid` from `const` to `let`, light
  variables now named and held onto) plus add (`updateColors`,
  `lastPoints`).
- **Location:** throughout `createViewport`, and a new function added
  after `drawPath`.
- **Dependencies:** `theme.ts`'s `themeColors()`, already extended (see
  below) to include the two new light-color tokens this lesson also adds.

### The New Code

```typescript
const ambientLight = new THREE.AmbientLight(colors.lightAmbient, 0.7);
scene.add(ambientLight);
const directionalLight = new THREE.DirectionalLight(colors.lightDirectional, 0.8);
directionalLight.position.set(100, 100, 300);
scene.add(directionalLight);

let grid = new THREE.GridHelper(500, 50, colors.grid, colors.grid);

// ...later, a new function:
function updateColors() {
  colors = themeColors();
  renderer.setClearColor(colors.background, 1);
  ambientLight.color.set(colors.lightAmbient);
  directionalLight.color.set(colors.lightDirectional);
  scene.remove(grid);
  grid = new THREE.GridHelper(500, 50, colors.grid, colors.grid);
  grid.rotation.x = Math.PI / 2;
  scene.add(grid);
  drawPath(lastPoints);
}
```

### The Updated Project

`createViewport` in full, with every changed and added line marked:

```typescript
export function createViewport(container: HTMLElement) {
  let colors = themeColors();                                          // ← changed (was const)
  const width = container.clientWidth || 700;
  const height = container.clientHeight || 400;

  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(width, height);
  renderer.setClearColor(colors.background, 1);
  container.appendChild(renderer.domElement);

  const scene = new THREE.Scene();

  const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 10000);
  camera.up.set(0, 0, 1);
  camera.position.set(300, -300, 400);

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.08;
  controls.target.set(0, 0, 0);

  const ambientLight = new THREE.AmbientLight(colors.lightAmbient, 0.7);  // ← changed (now named)
  scene.add(ambientLight);                                                // ← changed
  const directionalLight = new THREE.DirectionalLight(colors.lightDirectional, 0.8);
  directionalLight.position.set(100, 100, 300);
  scene.add(directionalLight);

  let grid = new THREE.GridHelper(500, 50, colors.grid, colors.grid);    // ← changed (was const)
  grid.rotation.x = Math.PI / 2;
  scene.add(grid);

  const pathGroup = new THREE.Group();
  scene.add(pathGroup);

  let lastPoints: PathPoint[] = [];                                      // ← new

  function drawPath(points: PathPoint[]) {
    lastPoints = points;                                                 // ← new
    while (pathGroup.children.length) {
      pathGroup.remove(pathGroup.children[0]);
    }
    if (points.length < 2) return;
    const segments = groupSegments(points);
    segments.forEach((segment) => {
      const vectors = segment.points.map((p) => new THREE.Vector3(p.x, p.y, p.z));
      const geometry = new THREE.BufferGeometry().setFromPoints(vectors);
      const color = segment.motion === "G0" ? colors.rapid : colors.feed;
      const material = new THREE.LineBasicMaterial({ color });
      const line = new THREE.Line(geometry, material);
      pathGroup.add(line);
    });
  }

  function updateColors() {                                             // ← new
    colors = themeColors();                                             // ← new
    renderer.setClearColor(colors.background, 1);                       // ← new
    ambientLight.color.set(colors.lightAmbient);                        // ← new
    directionalLight.color.set(colors.lightDirectional);                // ← new
    scene.remove(grid);                                                 // ← new
    grid = new THREE.GridHelper(500, 50, colors.grid, colors.grid);     // ← new
    grid.rotation.x = Math.PI / 2;                                      // ← new
    scene.add(grid);                                                    // ← new
    drawPath(lastPoints);                                               // ← new
  }                                                                      // ← new

  function render() {
    controls.update();
    renderer.render(scene, camera);
    requestAnimationFrame(render);
  }
  render();

  const resizeObserver = new ResizeObserver(() => {
    const newWidth = container.clientWidth;
    const newHeight = container.clientHeight;
    if (newWidth === 0 || newHeight === 0) return;
    renderer.setSize(newWidth, newHeight);
    camera.aspect = newWidth / newHeight;
    camera.updateProjectionMatrix();
  });
  resizeObserver.observe(container);

  return { drawPath, updateColors };                                    // ← changed
}
```

`createViewport` now returns two functions instead of one:
`drawPath`, unchanged in what it does, and the new `updateColors`, which
refreshes every color this function set up — by mutating what can be
mutated (the two lights) and rebuilding what can't (the grid) — then
replays the last-drawn toolpath so its rapid/feed colors catch up too.

### Mechanical Walkthrough

- `let colors = themeColors()` — **(b) reappearing** `themeColors()`
  itself (Lesson 8); **(a) first appearance** of `let` instead of `const`
  here specifically — needed because `updateColors` below reassigns this
  same variable, and a `const` binding cannot be reassigned.
- `const ambientLight = new THREE.AmbientLight(...); scene.add(ambientLight)`
  — **(b) reappearing** the constructor call itself
  (`threejs-lighting-basics.md`); **(a) first appearance** of holding the
  *result* in a named variable instead of adding it inline — required so
  `updateColors` has something to call `.color.set()` on later.
- `let grid = new THREE.GridHelper(...)` — same reasoning as `colors`:
  `let`, not `const`, because `updateColors` reassigns it to a whole new
  `GridHelper` instance.
- `let lastPoints: PathPoint[] = []` — **(c) already basic** — a plain
  typed array variable, initialized empty.
- `lastPoints = points` inside `drawPath` — **(c) already basic** —
  ordinary assignment, capturing whatever was most recently drawn so
  `updateColors` can redraw it later with fresh colors.
- `function updateColors() { ... }` — **(a) first appearance** of the
  function itself; its body's individual pieces:
  - `colors = themeColors()` — **(c) already basic** reassignment, now
    legal because of the `let` change above.
  - `renderer.setClearColor(colors.background, 1)` — **(b) reappearing**
    — the exact same call `createViewport` already made once, at setup.
  - `ambientLight.color.set(colors.lightAmbient)` /
    `directionalLight.color.set(colors.lightDirectional)` — **(a) first
    appearance**, per `threejs-mutating-scene-after-creation.md` — the
    mutate-in-place technique.
  - `scene.remove(grid)` — **(a) first appearance** — removes an object
    from the scene graph; necessary before adding its replacement, or both
    would render at once.
  - `grid = new THREE.GridHelper(...)` — **(a) first appearance**, per
    `threejs-mutating-scene-after-creation.md` — the rebuild-in-place
    technique, for the one property that genuinely can't be mutated.
  - `drawPath(lastPoints)` — **(b) reappearing** — the existing function,
    called again with the value `lastPoints` was set to save specifically
    for this purpose.
- `return { drawPath, updateColors }` — **(b) reappearing** — object
  shorthand property syntax (`javascript-object-shorthand-property.md`),
  now returning two functions instead of one.

### Execution Trace

`updateColors()` called for real, switching from `"slate"` to
`"nord"` (real token values, from this lesson's own `THEMES` catalog):

```
Before: colors = {background:"#07111e", grid:"#90a4c2", ...,
  lightAmbient:"#ffffff", lightDirectional:"#ffffff"}  (slate's values —
  background from slate.bg0, grid from slate.txt2, per applyTheme's own
  root.setProperty("--color-grid", theme.txt2) — read from the CSS custom
  properties applyTheme just wrote)
ambientLight.color is currently white; directionalLight.color is
  currently white; grid is the original GridHelper instance, call it G1

updateColors() runs:
  colors = themeColors()
    → reads the CURRENT custom-property values (nord's, since
      applyTheme(nordTheme) already ran and wrote them to :root)
    → colors = {background:"#2e3440", grid:"#4c566a", ...,
      lightAmbient:"#ffffff", lightDirectional:"#ffffff"}
      (background from nord.bg0, grid from nord.txt2 — nord doesn't
      change the light tokens themselves in this lesson's own catalog —
      both remain white — but background/grid do change)

  renderer.setClearColor("#2e3440", 1)
    → the canvas's own background is now nord's dark blue-gray, not slate's

  ambientLight.color.set("#ffffff")
    → mutates the SAME AmbientLight object in place — no new object,
      no scene.remove/add needed for this one (a Light's own color IS
      mutable, per the concept file's own isolated proof)

  directionalLight.color.set("#ffffff")
    → same in-place mutation on the same DirectionalLight object

  scene.remove(grid)  → removes G1 from the scene graph
  grid = new THREE.GridHelper(500, 50, "#4c566a", "#4c566a")
    → a genuinely NEW GridHelper instance, call it G2 — G1's own color
      is baked into its geometry at construction and can't be mutated,
      per the concept file's own proof
  grid.rotation.x = Math.PI / 2  → G2 re-oriented, matching G1's own setup
  scene.add(grid)  → G2 (nord-colored) now in the scene; G1 is gone

  drawPath(lastPoints)
    → redraws the existing toolpath data using the CURRENT rapid/feed
      colors from the just-updated `colors` — same points, refreshed colors
```

Lights and grid take genuinely different paths through the identical
function: lights are mutated (`.color.set()`, same object, same
reference); the grid is discarded and rebuilt (`remove`/`new`/`add`,
a different object entirely) — exactly the real Three.js limitation
`threejs-mutating-scene-after-creation.md` proves in isolation, now
applied to two real, different object types in the same real function.

### CS Lens

Per `threejs-mutating-scene-after-creation.md`: mutable vs. immutable
state at the object level, resolved the same general way immutable data
always is — replace the reference, don't fight the object.

### SE Lens

The real, load-bearing detail this unit depends on, stated precisely:
`theme.ts`'s `ThemeColors` interface and `themeColors()` function had to
grow two new fields (`lightAmbient`, `lightDirectional`) and `theme.css`
had to grow two new tokens (`--color-light-ambient`, `--color-light-directional`,
both fixed at `#ffffff` in every theme — light color is a rendering
choice, not something this project's own catalog varies per theme) before
this unit could exist at all — the two lights were originally
constructed with bare `0xffffff` number literals, hardcoded, with no
token backing them whatsoever. Making them real tokens first is what
made `updateColors` able to read a real, current value for them, instead
of having nothing to re-read.

### Run It — Real Output

Verified live in the browser: switching themes now visibly changes the
3D scene's background and grid immediately, confirmed via the actual
screenshots captured during this session — the very next unit is the
real, live bug that had to be fixed before that was true.

---

## Concept Unit: React Runs a Child's Effects Before Its Parent's

### The Problem

Wiring `updateColors` into the running app looks straightforward:
`Viewport.tsx` already re-runs `drawPath` inside a `useEffect` whenever
its `points` prop changes (Lesson 8); the obvious next step is a second
`useEffect`, keyed on a new `themeId` prop, calling `updateColors` the
same way. The first real attempt at wiring this up did exactly that —
and `App.tsx` applied the new theme's colors inside its *own*
`useEffect`, keyed on the same `themeId` state. That version compiled,
typechecked, and looked correct on paper. Live in the browser, it wasn't:
switching themes updated every flat panel immediately, but the 3D canvas
stayed on the *previous* theme's colors — visible directly in a real
screenshot captured during this session, comparing a light-themed ribbon
and panels against a canvas still rendering the old dark background and
grid.

### The Concept, Isolated

First real, project-caused encounter with React's effect commit order in
this project. The full isolated lab — a parent and child, each with their
own mount-time `useEffect`, run for real via `jsdom` — lives in
`concepts/react-effect-commit-order.md`, proving the child's effect logs
before the parent's, every time.

### Project Change

- **Reference Source:** No reference counterpart — this is a React
  scheduling fact, not a feature ported from anywhere.
- **Files affected:** `cnc-web/src/App.tsx`.
- **Change type:** refactor — moving `applyTheme`'s call sites out of any
  `useEffect` entirely.
- **Location:** the `themeId` state declaration (now a lazy initializer,
  covered in its own unit above) and a new `selectTheme` function,
  replacing what had been a direct `setThemeId` call.
- **Dependencies:** the lazy initializer unit above; `Viewport.tsx`'s own
  `useEffect` on `themeId`, which is what actually exposed this bug.

### The New Code

```typescript
function selectTheme(id: string) {
  applyTheme(findTheme(id));
  setThemeId(id);
}
```

### The Updated Project

`App.tsx`'s relevant slice, showing both the lazy initializer from the
earlier unit and this new function together — this is the real reason
both exist:

```typescript
const [themeId, setThemeId] = useState(() => {
  const id = getStoredThemeId();
  applyTheme(findTheme(id));
  return id;
});
const [isConfigOpen, setIsConfigOpen] = useState(false);

useEffect(() => {
  fetchPath(PROGRAM).then(setPoints);
}, []);

function selectTheme(id: string) {          // ← new
  applyTheme(findTheme(id));                 // ← new
  setThemeId(id);                             // ← new
}                                              // ← new
```

And the one call site that uses it, inside the JSX handed to
`AppearanceSettings`:

```typescript
content: <AppearanceSettings currentThemeId={themeId} onSelectTheme={selectTheme} />,
```

Every path that changes `themeId` — the very first render, and every
later click — now calls `applyTheme` as a plain, synchronous function
call *before* `setThemeId` ever runs, not inside a `useEffect` reacting
to `themeId` after the fact. `Viewport.tsx`'s own `useEffect` (added in
the previous unit) is now guaranteed to fire after the CSS variables it
reads are already correct, regardless of whether React fires `Viewport`'s
effect before or after `App`'s — because `App` no longer has a
theme-related effect competing for that same commit at all.

### Mechanical Walkthrough

- `function selectTheme(id: string) { ... }` — **(c) already basic** — a
  plain function declaration.
- `applyTheme(findTheme(id))` — **(b) reappearing** — the exact same
  call the lazy initializer already makes, now also made on every
  user-driven selection, not just at mount.
- `setThemeId(id)` — **(b) reappearing** — the existing state setter,
  called *after* the DOM mutation above it, once the new colors are
  already live.

### CS Lens

Per `react-effect-commit-order.md`: post-order tree traversal — a
child's own "finished mounting" signal fires before its parent's, the
same ordering RAII destructors and reference-counted garbage collection
both rely on.

### SE Lens

The real, more robust fix — stated in the concept file and worth
repeating here in this project's own terms — was never "figure out the
right order to put two competing effects in." It was removing the race
entirely: do the DOM mutation as a direct, synchronous call at the exact
moment it's needed (on selection, and once at mount via the lazy
initializer), so no effect anywhere is ever relying on another effect
having already run first. The bug this project actually shipped and
caught live is the honest, permanent argument for why that's the right
call, not a hypothetical one.

### Commands

None new.

### Run It — Real Output

Verified live, twice: first the broken version, reproduced exactly as
described above (flat UI updates immediately, 3D canvas stays one theme
behind — the real symptom reported live during this session); then,
after this fix, switching themes updates the ribbon, both panels, and
the 3D canvas's background, grid, and lights together, in the same
click, with no lag.

---

## Project Change (no new concept): the grid's real color, chosen twice

The very first version of `--color-grid`'s per-theme value computed a
color halfway between `theme.bg0` and `theme.bg1` — reasoning that the
grid, like the panel background, is a "background-tier" shade. Live in
the browser, that version was reported, with a real screenshot, as "very
dark in dark modes still" — because a value deliberately chosen for *low*
contrast against the background (which is exactly what a background-tier
shade is for) is exactly the wrong property for something that has to
stay visible sitting on top of that same background. The fix, already
shown in the `applyTheme` unit above, uses `theme.txt2` instead — the
same value already used for `--color-muted`, a real foreground color
calibrated for legibility against `bg0` by design, not a background
shade improvised into a role it was never suited for. No new concept
here — the lesson is a pure SE one, already named in
`design-tokens-theming-pattern.md`'s own SE Lens: a token's calibrated
purpose doesn't transfer automatically just because a new use for it
looks superficially similar.

---

## Connect the Pieces

Follow one real click — selecting "Nord" from the Appearance grid — all
the way through:

1. `ThemeCard`'s `onClick` fires `AppearanceSettings`'s
   `onSelectTheme("nord")`, which is `App.tsx`'s `selectTheme`.
2. `selectTheme` calls `findTheme("nord")` — a lookup into the `THEMES`
   catalog built in the Design Tokens unit, returning Nord's real
   thirteen-field object.
3. `applyTheme` receives that object: `hexToRgb`/`lightenHex`/`darkenHex`/
   `hexToRgba` compute Nord's derived "bright"/"strong"/translucent
   shades; thirteen `root.style.setProperty` calls push Nord's base and
   derived values onto `document.documentElement`; `localStorage.setItem`
   remembers `"nord"` for next time.
4. `selectTheme` then calls `setThemeId("nord")`, triggering a React
   re-render.
5. Every flat CSS rule reading `var(--color-*)` — the ribbon, both side
   panels, the new config modal itself — repaints immediately; no code
   anywhere had to know these rules existed.
6. `Viewport`'s own `useEffect`, keyed on the now-changed `themeId` prop,
   fires and calls `updateColors()`.
7. `updateColors` re-reads the same CSS variables `applyTheme` just set
   (via `themeColors()`), mutates both lights' `.color` in place, removes
   and rebuilds the grid with Nord's grid color, and redraws the last
   toolpath with Nord's rapid/feed colors.

One click, one catalog lookup, thirteen CSS variables, and both a
declarative stylesheet and an imperative 3D scene end up showing the same
theme — because step 3 finished, completely, before step 4 ever started.

## What Breaks Without This

Reverting just the previous Concept Unit's fix — moving `applyTheme`'s
call back inside a `useEffect` keyed on `themeId`, exactly as the first
real attempt had it:

```typescript
const [themeId, setThemeId] = useState(getStoredThemeId());
// ...
useEffect(() => {
  applyTheme(findTheme(themeId));
}, [themeId]);
```

Real, observed behavior with this version running: select any theme
other than the current one. The ribbon, both side panels, and the config
modal itself repaint correctly and immediately. The 3D canvas's
background, grid, and toolpath colors do not change at all, on that
click — they update one theme switch *later*, always one step behind
whatever was just selected. The cause, exactly as
`react-effect-commit-order.md` proves in isolation: `Viewport`, a child
of `App` in the component tree, gets its own `useEffect` (the one
calling `updateColors`) run *before* `App`'s effect (the one calling
`applyTheme`) for the same commit — so `updateColors` reads the CSS
variables `applyTheme` hasn't written yet, every single time.

Restoring the fix — `applyTheme` called synchronously, inside
`selectTheme` and the lazy initializer, never inside a `useEffect` at
all — removes the race by removing the second effect entirely; there is
no longer any ordering between two effects to get wrong.

## Exercises

1. Add a nineteenth theme to `THEMES` using any real color values you
   choose, give it a new or existing `group`, and confirm it appears in
   the Appearance grid with zero other code changes.
2. `applyTheme` currently derives `--color-accent-green` from each
   theme's `h3` field. Pick two or three real themes from the catalog and
   check, by eye, whether `h3` actually reads as "green" for each one —
   then decide, and justify in a sentence, whether renaming
   `--color-accent-green`/`--color-accent-blue` to role-based names
   (`--color-accent-primary`/`--color-accent-secondary`) would be a real
   improvement or unnecessary churn, given every existing CSS rule
   already references the current names.
3. `updateColors` rebuilds the grid on every single theme switch, even
   though most switches don't actually change `--color-grid`'s value.
   Add a check that skips the `scene.remove`/`new THREE.GridHelper`
   rebuild when the new grid color is identical to the previous one, and
   verify (by adding a temporary `console.log` inside the `if`) that a
   theme switch between two themes with the same `txt2` value skips it.
4. Open DevTools' Application/Storage panel, delete the `cnc-theme` key
   from `localStorage` by hand, and reload — confirm the app falls back
   to `"slate"`, exactly as `getStoredThemeId`'s own fallback promises,
   with no error.

## Definition of Done

- [ ] `themes.ts` exports a real, 18-entry `THEMES` catalog and a working
      `applyTheme`, verified live to repaint every existing CSS rule.
- [ ] The 3D viewport's background, grid, lights, and toolpath colors all
      update in the same click as the flat UI, with no lag — verified
      live, not just typechecked.
- [ ] A chosen theme survives a full page reload.
- [ ] `npx tsc --noEmit` passes with no errors.
- [ ] All nine new concept files exist in `concepts/`, each with real,
      executed output.
- [ ] `git commit` — message explaining that this feature exists to get
      the styling system ready ahead of porting the rest of `cnc-sim`,
      and that its two real fixes (effect ordering, grid contrast) were
      both caught live rather than designed correctly on the first try.
