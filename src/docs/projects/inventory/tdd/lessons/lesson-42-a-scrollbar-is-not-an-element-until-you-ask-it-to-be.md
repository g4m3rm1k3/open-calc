# Lesson 42: A Scrollbar Is Not an Element Until You Ask It to Be

**What you will build:** a visual pass over the Operations tab (Lesson
41) and the DRO/spindle-feed panel (Lesson 16): real icons per modal
block kind, a real collapse/expand animation on each Operation, a real
web font loaded from Google Fonts, a styled scrollbar, and a sticky
movement-table header — plus a matching glassmorphism refresh on both
panels reusing Lesson 40's own gradient/shadow/blur system. No
reference counterpart — `cnc-sim` has no equivalent styling pass on
either panel.

**What you need to know first:** Lesson 39's `AnimatePresence`/
`motion.div` (reused here, not re-taught); Lesson 40's `linear-
gradient()`/`box-shadow`/`color-mix()`/`backdrop-filter` glassmorphism
system (reused here, not re-taught); Lesson 41's `InfoBlock`/
`OperationBlock` components and their CSS.

---

## Concept Unit: Icons as Components, Looked Up by Kind

### The Problem

Each `InfoBlock` (Lesson 41) already carries a `kind` prop
(`"plane"`, `"coolant"`, `"tool"`, …) used only to pick a border color.
A real icon per kind — a droplet for coolant, a drill bit for tool,
a rotating arrow for spindle direction — makes each block recognizable
at a glance, not just by its text label.

### Introduce the Concept in Isolation

First appearance of an icon-components library in this project — full
standalone treatment: `concepts/icon-library-components.md`. Read that
first; the isolated example there (`<Droplet size={24} color="blue"
/>`, and a lookup-object-of-icons-by-key pattern) is exactly the
mechanism used below, just with this project's own seven kinds instead
of the concept file's two.

### Project Change

- **Reference Source** — none.
- **Files affected** — `cnc-web/package.json`/`package-lock.json` (new
  dependency), `cnc-web/src/BlockList.tsx` (modified — `InfoBlock`).
- **Change type** — add.
- **Location** — a new lookup table above `InfoBlock`'s own definition;
  `InfoBlock`'s label `<span>` gains the icon lookup.
- **Dependencies** — `npm install lucide-react`.

### The New Code

```ts
const INFO_ICONS: Record<string, React.ReactNode> = {
  plane: <Layers size={12} />,
  wcs: <MapIcon size={12} />,
  rotation: <RotateCw size={12} />,
  coolant: <Droplet size={12} />,
  tool: <Drill size={12} />,
  sfm: <Zap size={12} />,
  cpt: <FastForward size={12} />,
};
```

### The Updated Project

```tsx
function InfoBlock({ kind, label, value }: { kind: string; label: string; value: string }) {
  return (
    <div className={`block-info block-info-${kind}`}>
      <span className="block-info-label">
        {INFO_ICONS[kind] || <Settings size={12} />}
        {label}
      </span>
      <span className="block-info-value">{value}</span>
    </div>
  );
}
```

`InfoBlock` itself is unchanged in every other respect (Lesson 41's own
props, the `block-info-${kind}` class, the value `<span>`) — only the
label now renders an icon before its text, chosen by `kind`.

### Mechanical Walkthrough
- `Record<string, React.ReactNode>` — **reappearing** `Record<>` (first
- taught `App.tsx`'s `VIEW_LABELS: Record<ViewId, string>`, Lesson 27) —
  the only new wrinkle is the *value* type: `React.ReactNode` (anything
- React can render — an element, a string, `null`), not `string`, so
  this lookup's values are real JSX elements, not labels.
- `React.ReactNode` used with no `import React from "react"` anywhere
- in this file — **first appearance of this specific detail**: `@types/
  react`'s own type declarations include `export as namespace React;`,
  which makes the `React` namespace available as an ambient, global
  type reference project-wide the moment *any* file imports anything
- from `"react"` (this file already does, for `useEffect`/`useState`) —
  no separate import of `React` itself is required to reference
  `React.ReactNode` as a type.
- `{INFO_ICONS[kind] || <Settings size={12} />}` — **reappearing**
  bracket-lookup-with-`||`-fallback (the concept file's own isolated
- example already demonstrates this exact idiom) — `kind` values this
  project doesn't have a mapped icon for (there are none today; every
  real kind has an entry) would fall back to a generic gear icon rather
  than rendering nothing.

### CS Lens / SE Lens

Not repeated here — both fully covered in `concepts/icon-library-
components.md`; this unit is that concept's first real application.

### Commands

```
npm install lucide-react
```
Adds one new dependency; `package-lock.json` records its resolved
version and integrity hash.

### Run It

```pycon
# No Python analog. Verified via npx tsc --noEmit (clean) and lucide-
# react's real presence in node_modules/lucide-react (confirmed
# directly this session) -- not a live browser render.
```

---

## Concept Unit: A Real Web Font, Loaded Deliberately

### The Problem

`theme.css` has referenced `"JetBrains Mono"` by name since Lesson 12,
relying on whatever font happened to be installed (or a generic
monospace fallback) on whatever machine ran it. This pass adds
`"Inter"` as the app's real body font and `"Share Tech Mono"` as a
second, distinct monospace face for the DRO's own numeric readouts —
both loaded for real, for the first time, from Google Fonts.

### Introduce the Concept in Isolation

First appearance of loading a real web font in this project — full
standalone treatment: `concepts/web-font-loading-via-link.md`. Read
that first; its isolated example (`preconnect` + a `css2?family=...`
stylesheet link) is the exact mechanism added below.

### Project Change

- **Reference Source** — none.
- **Files affected** — `cnc-web/index.html`, modified;
  `cnc-web/src/theme.css` (`body`), modified.
- **Change type** — add.
- **Location** — inside `<head>`, after the existing `<title>`.
- **Dependencies** — none (a real network fetch to Google's font CDN,
  no npm package).

### The New Code

```html
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;700&family=Share+Tech+Mono&display=swap" rel="stylesheet">
```

### The Updated Project

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>cnc-web</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;700&family=Share+Tech+Mono&display=swap" rel="stylesheet">
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

`<meta name="viewport" ...>` — a small, standard, first-appearing tag
in this project: tells a mobile browser to render at the device's own
real width instead of a zoomed-out, desktop-assuming default. This
project has no mobile-specific layout yet, but every real page benefits
from this tag being present regardless, since its absence is what
causes mobile browsers to guess a desktop-width layout in the first
place.

```css
body {
  background-color: var(--color-bg);
  color: var(--color-text);
  font-family: "Inter", system-ui, sans-serif;
}
```

`font-family` now names the real, loaded `"Inter"` first, falling back
to `system-ui`/`sans-serif` (Lesson 12's original value) only if the
Google Fonts request ever fails — the fallback chain from Lesson 12 is
preserved, not replaced.

### Mechanical Walkthrough

Fully covered in `concepts/web-font-loading-via-link.md`'s own
Mechanical Walkthrough — this unit's code is that concept applied with
this project's real font choices (`Inter`, `JetBrains+Mono`,
`Share+Tech+Mono`) instead of the concept file's single example font.

### CS Lens / SE Lens

Not repeated — covered in the concept file.

### Commands

None — no package to install; the font itself is fetched at page-load
time, over the network, from `fonts.googleapis.com`/`fonts.gstatic.com`.

### Run It

```pycon
# No Python analog. Not verified live in a browser Network tab this
# session (named in Known Incomplete) -- the request URL and CSS
# fallback chain were confirmed correct by direct code review only.
```

---

## Concept Unit: A Table Header That Stays Put

### The Problem

Lesson 41's movement table (`MoveTableHead`/`MoveTableRow`) scrolls its
column headers away with the rest of the table the moment an operation
has enough rows to need scrolling — a real usability gap once a
program has any real length to it.

### Introduce the Concept in Isolation

First appearance of `position: sticky` in this project — full
standalone treatment: `concepts/css-position-sticky.md`. Read that
first.

### Project Change

- **Reference Source** — none.
- **Files affected** — `cnc-web/src/theme.css` (`.block-move-table th`).
- **Change type** — add.
- **Location** — inside the existing rule Lesson 41 already added.
- **Dependencies** — `concepts/css-fixed-positioning-and-stacking.md`
  (this concept's own prerequisite).

### The New Code

```css
position: sticky;
top: 0;
background: var(--color-bg);
z-index: 1;
```

### The Updated Project

```css
.block-move-table th {
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.5px;
  color: var(--color-muted);
  text-align: left;
  padding: 6px 12px;
  border-bottom: 1px solid var(--color-border-strong);
  position: sticky;
  top: 0;
  background: var(--color-bg);
  z-index: 1;
}
```

Every property above `position: sticky` is Lesson 41's own, unchanged
(font sizing, color, padding, border). `background: var(--color-bg)`
here is the same real, necessary companion the concept file's own
Mechanical Walkthrough names — without it, scrolled rows would show
through the "stuck" header. `z-index: 1` is **reappearing** (already
used elsewhere in this codebase's own stacking contexts) — ensures the
sticky header paints above the scrolling rows beneath it, not just at
the same layer.

### CS Lens / SE Lens

Not repeated — covered in `concepts/css-position-sticky.md`.

### Commands

None new.

### Run It

Not independently runnable outside a browser; not verified live this
session (Known Incomplete).

---

## Concept Unit: A Scrollbar You Can Actually Style

### The Problem

`.block-list` (Lesson 41) scrolls, but its scrollbar is whatever the
operating system draws by default — untouched by this app's own dark
theme, a visible seam.

### Introduce the Concept in Isolation

First appearance in this project — full standalone treatment:
`concepts/custom-scrollbar-styling.md`. Read that first.

### Project Change

- **Reference Source** — none.
- **Files affected** — `cnc-web/src/theme.css`, modified (global rule,
  not scoped to one component).
- **Change type** — add.
- **Location** — right after the `body` rule this lesson's font unit
  already touched.
- **Dependencies** — `--color-border-strong`/`--color-muted` (existing
  design tokens, Lesson 12/24).

### The New Code

```css
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}
::-webkit-scrollbar-track {
  background: transparent;
}
::-webkit-scrollbar-thumb {
  background: color-mix(in srgb, var(--color-border-strong) 50%, transparent);
  border-radius: 4px;
}
::-webkit-scrollbar-thumb:hover {
  background: var(--color-muted);
}
```

### Mechanical Walkthrough
The three base pseudo-elements are fully covered in `concepts/custom-
scrollbar-styling.md`. `:hover` chained onto `::-webkit-scrollbar-
thumb` is **reappearing** (`:hover` itself, already used throughout
this project's CSS) — the new detail is only that it's chained onto a
vendor-prefixed pseudo-element, which works exactly like chaining it
- onto any ordinary selector.
- `color-mix(in srgb, ...)` — **reappearing**
(Lesson 40).

### CS Lens / SE Lens

Not repeated — covered in the concept file.

### Commands

None new.

### Run It

Not independently runnable outside a browser; not verified live this
session (Known Incomplete).

---

## Concept Unit: Reusing Lesson 39's Collapse Animation for a New Purpose

### The Problem

Lesson 41's `OperationBlock` toggled its detail panel with a plain
`{expanded && (...)}` — correct, but an instant snap, not the smooth
open/close every other collapsible surface in this app (Lesson 39's
side panels) already has.

### Project Change

- **Reference Source** — none; reusing Lesson 39's own mechanism
  (`SidePanel.tsx`'s `AnimatePresence`/`motion.div`), not porting
  anything external.
- **Files affected** — `cnc-web/src/BlockList.tsx` (`OperationBlock`).
- **Change type** — replace (the plain conditional, with the same
  library's animated equivalent).
- **Location** — `OperationBlock`'s return, wrapping the existing
  `block-row-detail` div.
- **Dependencies** — `framer-motion` (already a dependency since Lesson
  39).

### The New Code

```tsx
<AnimatePresence initial={false}>
  {expanded && (
    <motion.div
      initial={{ height: 0, opacity: 0 }}
      animate={{ height: "auto", opacity: 1 }}
      exit={{ height: 0, opacity: 0 }}
      transition={{ duration: 0.2 }}
      style={{ overflow: "hidden" }}
    >
      <div className="block-row-detail">{/* unchanged contents */}</div>
    </motion.div>
  )}
</AnimatePresence>
```

### Mechanical Walkthrough
`AnimatePresence`, `motion.div`, and its `initial`/`animate`/`exit`/
- `transition` props are all **reappearing** — the exact mechanism
Lesson 39 gave full first-time treatment (there, animating `x` for a
- slide; here, animating `height`/`opacity` for a collapse) — no new
construct, a different property being animated. Two real, small
wrinkles worth naming directly, per the Repetition Rule, rather than
silently treating the whole block as identical to Lesson 39's:

- `initial={false}` on `<AnimatePresence>` — **first appearance of this
  prop**: tells `AnimatePresence` not to play the `initial` animation on
  this component's *very first* render (an operation that starts
  `expanded`, Lesson 41's own default, would otherwise visibly animate
  open the instant the page loads, rather than simply appearing already
  open).
- `animate={{ height: "auto", ... }}` — **first appearance of animating
  to `"auto"`**: CSS itself cannot animate to/from `auto` (an animation
  needs two real numbers to interpolate between); framer-motion handles
  this specific case by measuring the element's real, natural height
  once `expanded` becomes `true`, then animating numerically to that
  measured value — a real capability CSS transitions alone don't have.
- `style={{ overflow: "hidden" }}` — **reappearing** inline style
  (already established); necessary here so the growing/shrinking
  content doesn't visibly overflow its own animated box mid-transition.

### CS Lens / SE Lens

Not repeated — both given full treatment in Lesson 39, where this exact
mechanism was first taught; nothing here changes the underlying
tradeoff already named there.

### Commands

None new.

### Run It

Not independently runnable outside a browser; not verified live this
session (Known Incomplete) — same standing, cost-driven scope cut as
Lesson 41.

---

## Concept Unit: Reused Glassmorphism, Applied Further

### The Problem

Lesson 40 gave the app shell, side panels, ribbon, and settings modal a
real glassmorphism treatment. `MachineStatus.tsx`'s DRO/spindle-feed
boxes and Lesson 41's Operations tab (`block-operation`, `block-info`,
`block-info-value`, `block-row-seq`) were built and left with Lesson
41's own plain, flat styling — this pass brings them into the same
visual system.

### Project Change

- **Reference Source** — none; reusing Lesson 40's own established
  system.
- **Files affected** — `cnc-web/src/theme.css` (`.dro`, `.dro-num`,
  `.sbox`, `.sbox-v`, `.block-operation`, `.block-row-seq`,
  `.block-info`, `.block-info-value`, `.block-move-table`,
  `.block-move-table th`).
- **Change type** — replace (flat backgrounds/borders → gradient +
  shadow, matching Lesson 40's own values).
- **Location** — the existing rules Lesson 16 (`.dro`/`.sbox`) and
  Lesson 41 (`.block-*`) already added.
- **Dependencies** — Lesson 40's design tokens and technique.

### The New Code

```css
background: linear-gradient(135deg,
  color-mix(in srgb, var(--color-panel) 80%, transparent),
  color-mix(in srgb, var(--color-bg) 60%, transparent));
backdrop-filter: blur(8px);
-webkit-backdrop-filter: blur(8px);
box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15), inset 0 1px 1px rgba(255, 255, 255, 0.05);
```

### The Updated Project

```css
.dro {
  display: flex;
  align-items: center;
  background: linear-gradient(135deg, color-mix(in srgb, var(--color-panel) 80%, transparent), color-mix(in srgb, var(--color-bg) 60%, transparent));
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  border: 1px solid var(--color-border);
  border-radius: 6px;
  padding: 8px 12px;
  margin-bottom: 6px;
  gap: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15), inset 0 1px 1px rgba(255, 255, 255, 0.05);
}
.dro-num {
  font-family: "Share Tech Mono", monospace;
  font-size: 26px;
  font-weight: 400;
  flex: 1;
  text-align: right;
  letter-spacing: 1px;
  text-shadow: 0 0 12px currentColor;
}
```

`display`/`align-items`/`border`/`padding`/`margin-bottom`/`gap` are
Lesson 16's own, unchanged. `background`/`backdrop-filter`/`-webkit-
backdrop-filter`/`box-shadow` replace Lesson 16's flat `background:
var(--color-bg)` with Lesson 40's exact glassmorphism technique.
`.dro-num`'s font swaps from Lesson 41's `"JetBrains Mono"` to this
lesson's own newly-loaded `"Share Tech Mono"`; `text-shadow: 0 0 12px
currentColor` is **first appearance of `currentColor`** as a
`text-shadow` value — a real, small CSS keyword meaning "whatever this
element's own resolved `color` is," so the glow always matches the
number's own axis-specific color (Lesson 16's `AXIS_LABEL_COLOR`)
without needing a second, separately-maintained color value.

```css
.block-operation {
  margin: 6px 8px;
  background: linear-gradient(135deg, color-mix(in srgb, var(--color-panel) 80%, transparent), color-mix(in srgb, var(--color-bg) 50%, transparent));
  border: 1px solid var(--color-border);
  border-radius: 6px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}
.block-row-seq {
  color: var(--color-bg);
  background: var(--color-accent-blue);
  font-weight: 700;
  font-size: 10px;
  padding: 2px 6px;
  border-radius: 4px;
  min-width: 32px;
  text-align: center;
  flex-shrink: 0;
  box-shadow: 0 0 8px var(--color-accent-blue);
}
```

`.block-operation` replaces Lesson 41's flat `border-bottom`/`border-
left` accent entirely with a real card: margin between operations,
full border + rounded corners + the same gradient/shadow system, and
`overflow: hidden` (**reappearing**, needed so the rounded corners
actually clip the animated `motion.div` from the previous unit).
`.block-row-seq` — the operation's own `N{displayNumber}` badge — moves
from a plain colored text label to a solid, colored, rounded badge
(background instead of just text color) with its own `box-shadow: 0 0
8px var(--color-accent-blue)` glow, the same glow technique Lesson 38
first established for the toolpath itself.

One more real, small addition in this same pass — a hover state on the
movement table's own rows:

```css
.block-move-row {
  transition: background 0.15s;
}
.block-move-row:hover {
  background: color-mix(in srgb, var(--color-accent-blue) 15%, transparent);
  cursor: default;
}
```

`transition: background 0.15s` and `:hover` are both **reappearing**
(already established CSS mechanisms); `cursor: default` is a small,
deliberate detail — without it, a hovered row would show the browser's
default text-selection I-beam cursor, misleadingly implying the row is
directly editable text, which it isn't (yet — see Lesson 41's own
"Known Incomplete").

### Mechanical Walkthrough
- Every property in this unit is **reappearing** — `linear-gradient()`,
`color-mix()`, `backdrop-filter`/`-webkit-backdrop-filter`, and
`box-shadow` (including the `inset` variant) were all given full,
first-time treatment in Lesson 40; `currentColor` (named above) and
`.block-row-seq`'s glow (Lesson 38's technique) are the only two
genuinely new details in this entire unit, both already called out
directly above rather than left silent.

### CS Lens / SE Lens

Not repeated — this unit is pure visual-system consistency (applying
Lesson 40's own established tradeoffs to two panels it hadn't reached
yet), not a new engineering decision.

### Commands

None new.

### Run It

Not independently runnable outside a browser; not verified live this
session (Known Incomplete).

---

## Connect the Pieces

One operation, rendered: its header shows a solid, glowing `N{seq}`
badge (glassmorphism unit) inside a real gradient card (`.block-
operation`, same unit) that expands smoothly (`motion.div`/
`AnimatePresence` unit) to reveal `InfoBlock`s each carrying a real icon
(icon unit) next to their value, above a movement table whose header
stays pinned while scrolling (sticky unit) — all inside a panel with a
themed scrollbar (scrollbar unit) and rendered in a real, deliberately
loaded font (font unit) instead of whatever happened to be installed.

## What Breaks Without This

Reverting the `INFO_ICONS` lookup back to a plain `<span
className="block-info-label">{label}</span>` (Lesson 41's original)
removes every icon with zero errors — proof this pass is additive
polish, not a structural dependency: every field this lesson didn't
touch (grouping, modal-state logic, the SFM/CPT formulas) is completely
unaffected by any change in this lesson.

## Exercises

1. Add an eighth `InfoBlock` kind this project doesn't have an icon for
   yet, and confirm it falls back to the generic `Settings` icon rather
   than rendering nothing.
2. Remove `initial={false}` from `<AnimatePresence>` and reload with an
   operation that starts expanded — observe the now-visible "animate
   open on first render" effect this prop was added specifically to
   suppress.
3. Change `.block-move-table th`'s `position: sticky` to `position:
   fixed` and observe it break — the header now pins to the *viewport*,
   not the scrolling table container, ending up in the wrong place
   entirely the moment the page has any other content above it.

## Known Incomplete — Named Directly

- **Nothing in this lesson was verified in a live browser this
  session** — same standing, cost-driven scope cut as Lesson 41. Every
  "Run It" above says so directly rather than silently.
- **Firefox scrollbar styling is real, separate, unstarted scope** —
  `concepts/custom-scrollbar-styling.md`'s own SE Lens names why
  (`scrollbar-width`/`scrollbar-color` needed alongside the `-webkit-`
  rules); this project has the `-webkit-` rules only.
- **The font's real network behavior (preconnect timing, `swap`
  fallback flash) wasn't measured this session** — confirmed correct by
  code review against `concepts/web-font-loading-via-link.md`'s own
  mechanism, not by a real Network-tab trace.

## Definition of Done

- [x] `lucide-react` installed, `INFO_ICONS` lookup wired into
      `InfoBlock`, verified via `tsc --noEmit`.
- [x] Google Fonts loaded (`Inter`/`JetBrains Mono`/`Share Tech Mono`),
      viewport meta tag added.
- [x] `.block-move-table th` sticky, scrollbar styled globally.
- [x] `OperationBlock`'s collapse reuses Lesson 39's real
      `AnimatePresence`/`motion.div` mechanism.
- [x] `.dro`/`.sbox`/`.block-operation`/`.block-row-seq` brought into
      Lesson 40's glassmorphism system.
- [x] Four new concept files added (`icon-library-components.md`,
      `web-font-loading-via-link.md`, `css-position-sticky.md`,
      `custom-scrollbar-styling.md`), each project-independent.
- [x] `npx tsc --noEmit` clean.
- [ ] Live-browser verification — explicitly deferred, named above.

```
git commit -m "Lesson 42: a scrollbar is not an element until you ask it to be"
```
