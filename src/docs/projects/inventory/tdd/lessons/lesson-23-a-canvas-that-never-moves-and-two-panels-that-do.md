# Lesson 23: A Canvas That Never Moves, and Two Panels That Do

## What you will build

`cnc-web`'s real second step toward `CURRICULUM.md`'s Correction #5
shell: the 3D viewport becomes a genuine, fixed, full-screen background
layer — sized only by the real browser window, never by anything a
panel does — and two independent, resizable, tabbed side panels float
above it, left and right. Direct instruction, from a real, named prior
failure: a view (DRO, Tools) lives in *at most one* panel at a time;
clicking its ribbon button opens or moves it into whichever panel is
currently "selected," closes it if it's already the active tab there,
and dragging either panel's edge resizes it live — all verified this
session with real clicks and drags, zero console errors. The
transferable problem this lesson is really about: **a render surface
that shares a layout with the controls around it will always be at the
mercy of whatever those controls do** — the only real fix is removing it
from that layout entirely, not tuning the layout more carefully.

## What you need to know first

Lesson 22: `RibbonToolbar`'s groups/toggles shape, `avoid-premature-abstraction.md`.
Lesson 18: `react-lifting-state-up.md`, functional `setState` updates.
Lesson 8: `createViewport`'s original, one-time-only sizing
(`container.clientWidth || 700`) — the real, prior gap this lesson's
`ResizeObserver` unit finally closes.

## Concepts cataloged from this lesson

- `../concepts/css-fixed-positioning-and-stacking.md` — new.
- `../concepts/browser-resize-observer.md` — new.
- `../concepts/manual-mouse-drag-pattern.md` — new.
- `../concepts/javascript-array-find.md` — new.
- `../concepts/typescript-reactnode-type.md` — new.
- `../concepts/react-useref-hook.md` — reappearing; this project's first
  real use of its *mutable-value* half (Lesson 8's `containerRef` only
  ever used its DOM-ref half).
- `../concepts/react-lifting-state-up.md`,
  `../concepts/typescript-record-utility-type.md` — reappearing, no
  extension.

## No pipeline diagram change

UI shell/layout, not a stage of the G-code pipeline.

---

## Concept Unit: The Canvas Becomes a Real Background Layer

*(Full standalone treatment: `../concepts/css-fixed-positioning-and-stacking.md`.)*

### The Problem

Named directly, from a real prior failure with a different approach
entirely: a render surface that participates in the same layout as the
panels around it gets resized every time a panel does — for a Three.js
viewport, that means the renderer's real pixel dimensions and the
camera's aspect ratio change, so the rendered part visibly shifts and
rescales, even though nothing about the part or the camera actually
moved.

### The Concept, Isolated

Full standalone lab, run for real, in the concept file above. Not
repeated here.

### Project Change

- **Reference Source** — none. `cnc-sim` has no fixed, layered shell of
  its own (Correction #5 already named this) — new UI architecture,
  not a port.
- **Files affected** — `cnc-web/src/theme.css`, `cnc-web/src/Viewport.tsx`.
- **Change type** — add (new rules); replace (`Viewport`'s own inline
  size).

### The New Code

```css
html, body, #root {
  height: 100%;
  margin: 0;
}
.app-shell {
  position: fixed;
  inset: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
.app-body {
  position: relative;
  flex: 1;
  min-height: 0;
}
.canvas-layer {
  position: absolute;
  inset: 0;
  z-index: 0;
}
```

### The Updated Project

`Viewport.tsx`'s own render, the one line this unit changes:
```typescript
return <div ref={containerRef} style={{ width: "100%", height: "100%" }} />;
```
Was previously a hardcoded `{ width: 700, height: 400 }` — now fills
whatever real container it's placed inside, which the next unit's
`.canvas-layer` wrapper (in `App.tsx`) makes the entire real app body.

### Mechanical Walkthrough

- `html, body, #root { height: 100%; margin: 0; }` — **(a) first
  appearance** of sizing the real page root elements explicitly — every
  earlier lesson let the page's height be whatever its content needed;
  `.app-shell`'s own `position: fixed` (below) needs a real, full-height
  ancestor chain to size itself against.
- `.app-shell`, `.app-body`, `.canvas-layer` — **(b) reappearing**
  `position: fixed`/`relative`/`absolute`, `inset`, `z-index`, full
  treatment in the concept file — three real, nested layers: the shell
  (fixed to the viewport), its body (a normal flex child, sized by the
  shell), and the canvas layer (absolutely filling the body, `z-index: 0`
  so anything added later draws on top of it by default).
- `style={{ width: "100%", height: "100%" }}` — **(c) already
  established** inline styles, now filling a real parent rather than a
  fixed pixel size.

### CS Lens / SE Lens

Both fully covered in the concept file — nothing new to re-derive; this
unit is that file's own mechanism, applied for real, to close a real,
named failure.

---

## Concept Unit: A Canvas That Actually Resizes

*(Full standalone treatment: `../concepts/browser-resize-observer.md`.)*

### The Problem

`createViewport` (Lesson 8) reads `container.clientWidth`/`clientHeight`
exactly once, at creation — a real, pre-existing gap, not introduced by
this lesson: the renderer and camera have never once updated after the
browser window itself actually resizes.

### The Concept, Isolated

Full standalone lab, run for real, in the concept file above. Not
repeated here.

### Project Change

- **Reference Source** — none (`createViewport` itself has no live
  resize logic in the reference either — a from-scratch addition).
- **Files affected** — `cnc-web/src/viewport.ts`.
- **Change type** — add.
- **Location** — end of `createViewport`, after `render()` starts.

### The New Code

```typescript
const resizeObserver = new ResizeObserver(() => {
  const newWidth = container.clientWidth;
  const newHeight = container.clientHeight;
  if (newWidth === 0 || newHeight === 0) return;
  renderer.setSize(newWidth, newHeight);
  camera.aspect = newWidth / newHeight;
  camera.updateProjectionMatrix();
});
resizeObserver.observe(container);
```

### The Updated Project

The end of `createViewport`, in full:
```typescript
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

  return { drawPath };
}
```
`createViewport` now keeps the renderer and camera correct for as long
as the app runs, not just at the exact moment it was first created.

### Mechanical Walkthrough
- `new ResizeObserver(() => {...})` / `.observe(container)` — **(b)
  reappearing**, full treatment in the concept file, watching this
  project's own real viewport container instead of the lab's plain
  `div`.
- `if (newWidth === 0 || newHeight === 0) return;` — **(a) first
  appearance** of a real, defensive guard this project's own container
  specifically needs: a `.canvas-layer` briefly at zero size during
  initial mount (before layout settles) would otherwise divide by zero
- computing `camera.aspect`, producing `NaN` and a real, broken render —
  never observed in the concept file's own simpler lab, genuinely new
  here.
- `renderer.setSize(newWidth, newHeight)` — **(b) reappearing** the
  identical call already made once, at creation, in `createViewport`'s
  own earlier lines — now called again, live, instead of never again.
- `camera.aspect = ...` / `camera.updateProjectionMatrix()` — **(a)
- first appearance** — a `PerspectiveCamera`'s `aspect` ratio is read
  once when its internal projection matrix is built and never
- recomputed automatically after — `updateProjectionMatrix()` is the
  real, required call telling Three.js to rebuild it from the new
  `aspect` value; skipping it would leave the camera's own math stale
  even though `aspect` itself changed.

### CS Lens / SE Lens

Both fully covered in the concept file.

### Verified, Run for Real

```
window resized to 900x700 -> canvas size: { w: 900, h: 638 }
```
Real output, this session, via headless-browser automation: the real
`<canvas>` element's own pixel dimensions matched the new window size
(638, not 700, since the ribbon bar above `.app-body` takes real space)
— confirmed correct, not just unchanged.

---

## Concept Unit: A Reusable Side Panel

*(New: `../concepts/javascript-array-find.md`,
`../concepts/typescript-reactnode-type.md`.)*

### The Problem

Nothing yet renders a real, independent panel that can hold more than
one thing at once, switch between them, or say which one is "selected."

### The Concept, Isolated

Full standalone labs, run for real, in the two concept files above. Not
repeated here.

### Project Change

- **Reference Source** — none.
- **Files affected** — new `cnc-web/src/SidePanel.tsx`,
  `cnc-web/src/theme.css` (new rules).
- **Change type** — add.

### The New Code

```typescript
export interface OpenTab {
  id: string;
  label: string;
  content: ReactNode;
}
```
```typescript
const activeTab = tabs.find((tab) => tab.id === activeTabId);
```

### The Updated Project

The complete, new `cnc-web/src/SidePanel.tsx` (its resize-handle logic
is the next unit's own subject, shown there):
```typescript
import { useRef } from "react";
import type { ReactNode } from "react";

export interface OpenTab {
  id: string;
  label: string;
  content: ReactNode;
}

interface SidePanelProps {
  side: "left" | "right";
  width: number;
  onResize: (width: number) => void;
  tabs: OpenTab[];
  activeTabId: string | null;
  onSelectTab: (id: string) => void;
  onCloseTab: (id: string) => void;
  isSelected: boolean;
  onSelect: () => void;
}

function SidePanel({
  side,
  width,
  onResize,
  tabs,
  activeTabId,
  onSelectTab,
  onCloseTab,
  isSelected,
  onSelect,
}: SidePanelProps) {
  const dragState = useRef<{ startX: number; startWidth: number } | null>(null);

  const handlePointerDown = (event: React.MouseEvent) => {
    dragState.current = { startX: event.clientX, startWidth: width };

    const handleMouseMove = (moveEvent: MouseEvent) => {
      if (!dragState.current) return;
      const deltaX = moveEvent.clientX - dragState.current.startX;
      const signedDelta = side === "left" ? deltaX : -deltaX;
      onResize(Math.max(120, dragState.current.startWidth + signedDelta));
    };

    const handleMouseUp = () => {
      dragState.current = null;
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
  };

  const activeTab = tabs.find((tab) => tab.id === activeTabId);

  return (
    <div
      className={`side-panel ${side}${isSelected ? " selected" : ""}`}
      style={{ width }}
      onMouseDown={onSelect}
    >
      <div className="side-panel-resize-handle" onMouseDown={handlePointerDown} />
      <div className="side-panel-tabs">
        {tabs.map((tab) => (
          <div
            key={tab.id}
            className={`side-panel-tab${tab.id === activeTabId ? " active" : ""}`}
            onClick={() => onSelectTab(tab.id)}
          >
            {tab.label}
            <span
              className="side-panel-tab-close"
              onClick={(event) => {
                event.stopPropagation();
                onCloseTab(tab.id);
              }}
            >
              ✕
            </span>
          </div>
        ))}
      </div>
      <div className="side-panel-body">
        {activeTab ? activeTab.content : <div className="side-panel-empty">No panels open.</div>}
      </div>
    </div>
  );
}

export default SidePanel;
```

### Mechanical Walkthrough
- `content: ReactNode` — **(b) reappearing**, full treatment in the
  concept file — a tab carries its already-built content, not raw data
  `SidePanel` would have to know how to render itself.
- `tabs.find((tab) => tab.id === activeTabId)` — **(b) reappearing**,
  full treatment in the concept file — the one real place this
  component needs a single specific tab, not a filtered list of them.
- `onMouseDown={onSelect}` on the outer `div` — **(b) reappearing**
  callback props (established since Lesson 16); clicking *anywhere* in
  the panel — not just its tab bar — marks it selected, so an empty
  panel (no tabs yet) can still be chosen as a real target.
- `event.stopPropagation()` on the tab's close button — **(b)
  reappearing**, the identical call `ToolCardList.tsx` already used
  (Lesson 17) for the same reason: without it, closing a tab would also
  fire the tab's own `onClick` (selecting a tab about to be removed) and
- the panel's `onMouseDown` (redundant, but not itself harmful here) —
  named because a reader seeing three nested click handlers on one
  element needs to know which ones are meant to fire together and which
  aren't.
- `` `side-panel ${side}${isSelected ? " selected" : ""}` `` /
- `` `side-panel-tab${tab.id === activeTabId ? " active" : ""}` `` —
  **(b) reappearing**, the exact conditional-class shape established
  since Lesson 17.

### CS Lens

`SidePanel` knows nothing about DRO, Tools, or any specific view — it
only knows "some tabs, one active, a side, a width," the same
**data-driven component** shape `RibbonToolbar` (Lesson 22) already is,
one real level more complex (tabs *and* an active selection, not just a
flat list of independent toggles).

### SE Lens

Real prior failure, restated concretely here: a docking library that
assumed its entire container was always tiled by real panels — no true
empty space — is exactly why this component's own empty state
(`tabs.length === 0` → "No panels open.") is real, first-class behavior,
not an edge case skipped and hoped never to happen. A panel with zero
tabs still renders, still has a real width, and is still a valid,
selectable target — the actual requirement a tiling-only model could
not satisfy.

---

## Concept Unit: Styling by Ancestry — the Descendant Combinator

### The Problem

`.side-panel-resize-handle` is one class, shared by both panels — but the
handle has to sit on a *different* edge depending on which side its
panel is on: the left panel's handle belongs on its right edge (so
dragging it grows the panel toward the window's center); the right
panel's handle belongs on its left edge, for the same reason mirrored.
One shared class can't say "position yourself differently depending on
which panel you're inside" by itself — something has to let a rule
target "a `.side-panel-resize-handle`, but only the one that lives
inside a `.side-panel.left`."

### Introduce the Concept in Isolation

```css
.box.left .handle { background: red; color: white; }
.box.right .handle { background: blue; color: white; }
/* Contrast case: a compound selector (no space) requires all three
   classes on ONE element -- nothing here has all three, so this rule
   never matches anything at all. */
.box.left.handle { background: lime; }
```
```html
<div class="box left">
  <span class="handle">A (inside box left)</span>
</div>
<div class="box right">
  <span class="handle">B (inside box right)</span>
</div>
```

**Real output, run this session** (Playwright, headless Chromium,
reading each `.handle`'s real computed `background-color`):
```json
[
  { "text": "A (inside box left)", "bg": "rgb(255, 0, 0)" },
  { "text": "B (inside box right)", "bg": "rgb(0, 0, 255)" }
]
```

**What this proves:** a *space* between two selectors (`.box.left
.handle`) means "a `.handle`, anywhere inside a `.box.left`" — handle A
really did render red, handle B really did render blue, each picking up
the rule that matches its own real ancestor. The third rule,
`.box.left.handle` (no space — a **compound** selector, already
established, requiring every listed class on *one* element), never
matched anything at all: neither handle carries all three classes on
itself, so `lime` never appears anywhere in the real output above — the
single space is the entire, real difference between "scoped by an
ancestor" and "matches nothing."

### Discard

This lab is thrown away — nothing from it becomes part of the project.

### Project Change

- **Reference Source** — none; `cnc-sim` has no independently-draggable,
  side-dependent panels of its own for this to be ported from.
- **Files affected** — `cnc-web/src/theme.css`.
- **Change type** — add.
- **Location** — inside the new `.side-panel` rule family this lesson's
  previous unit already named as in scope.
- **Dependencies** — `css-rule-syntax-selectors-cascade.md` (reappearing
  — the same selector-and-cascade mechanism that file already covers,
  combined here into a new shape, per the same "(b) reappearing" citation
  Lesson 18 already established for this project's own compound
  selectors and `:hover`).

### The New Code

```css
.side-panel.left .side-panel-resize-handle {
  right: -3px;
}
.side-panel.right .side-panel-resize-handle {
  left: -3px;
}
```

### The Updated Project

The complete, real `.side-panel` rule family in `theme.css` — every rule
`SidePanel.tsx`'s own `className` strings, shown in the previous unit,
actually depend on, none elided:

```css
.side-panel {
  position: absolute;
  top: 0;
  bottom: 0;
  z-index: 1;
  display: flex;
  flex-direction: column;
  background: var(--color-panel);
  min-width: 120px;
}
.side-panel.left {
  left: 0;
  border-right: 1px solid var(--color-border-strong);
}
.side-panel.right {
  right: 0;
  border-left: 1px solid var(--color-border-strong);
}
.side-panel.selected {
  box-shadow: inset 0 0 0 1px var(--color-accent-blue);
}
.side-panel-resize-handle {
  position: absolute;
  top: 0;
  bottom: 0;
  width: 6px;
  cursor: col-resize;
  z-index: 2;
}
.side-panel.left .side-panel-resize-handle {         /* ← new */
  right: -3px;                                        /* ← new */
}                                                      /* ← new */
.side-panel.right .side-panel-resize-handle {         /* ← new */
  left: -3px;                                          /* ← new */
}                                                      /* ← new */
.side-panel-tabs {
  display: flex;
  border-bottom: 1px solid var(--color-border);
  flex-shrink: 0;
}
.side-panel-tab {
  padding: 6px 10px;
  font-size: 10px;
  font-weight: 600;
  color: var(--color-muted);
  cursor: pointer;
  border-bottom: 2px solid transparent;
  display: flex;
  align-items: center;
  gap: 6px;
}
.side-panel-tab.active {
  color: var(--color-text);
  border-bottom-color: var(--color-accent-blue);
}
.side-panel-tab-close {
  color: var(--color-muted);
  font-size: 9px;
}
.side-panel-tab-close:hover {
  color: var(--color-rapid);
}
.side-panel-body {
  flex: 1;
  overflow: auto;
  padding: 8px;
}
.side-panel-empty {
  padding: 8px;
  font-size: 9px;
  color: var(--color-muted);
}
```

Every one of `SidePanel.tsx`'s own class strings now has a real rule
behind it: the panel's own position/background/minimum width, its
left/right/selected variants, the resize handle's own hit-target and
cursor plus the two new side-dependent placement rules above, the tab
bar, each tab's own active/inactive and hover-to-close states, and the
empty-state message.

### Mechanical Walkthrough
- `.side-panel.left .side-panel-resize-handle` / `.side-panel.right
- .side-panel-resize-handle` — **(a) first appearance** of the descendant
  combinator in this project, per the isolated lab above: `right: -3px`
  only applies to a resize handle that's really nested inside a
  `.side-panel.left`, letting one shared class (`.side-panel-resize-handle`)
  read two different real positions depending on which real panel
  contains it — exactly the problem a single, unscoped rule couldn't
  solve.
- `.side-panel`, `.side-panel-tabs`, `.side-panel-tab`, `.side-panel-tab-close`,
- `.side-panel-body`, `.side-panel-empty`, `.side-panel-resize-handle` —
  **(c) already basic** — plain class selectors, the same syntax
  established since `css-rule-syntax-selectors-cascade.md`.
- `.side-panel.left`, `.side-panel.right`, `.side-panel.selected`,
- `.side-panel-tab.active` — **(b) reappearing** — compound class
  selectors (two classes required on one element), the same shape
  Lesson 18's own `.btn.full`/`.btn-gr` combination already established,
  cited there back to `css-rule-syntax-selectors-cascade.md`.
- `.side-panel-tab-close:hover` — **(b) reappearing** — the same
  pseudo-class syntax first used in this project as far back as Lesson
  17/18's own `.btn:hover`.
- `position: absolute`/`z-index` — **(b) reappearing** —
  `css-fixed-positioning-and-stacking.md`, already covered earlier in
  this very lesson for `.canvas-layer`.

### CS Lens

A descendant combinator is a real, **contextual/ancestry-based match** —
not "does this element have property X," but "does this element have
property X *and* sit inside something with property Y." The same shape
recurs constantly outside CSS: a file's real permissions inherited from
its containing directory, a variable's scope determined by which block
it's lexically nested inside, an XML/XPath query matching a node by its
position in a containing tree, not the node's own attributes alone.

Also recognized in: nested CSS-in-JS scoping (styled-components,
CSS Modules), any DOM tree query using `.closest()`/`.contains()`,
directory-inherited file permissions, block-scoped variable lookup in
any programming language with lexical scoping.

### SE Lens

The real alternative — two distinct classes,
`.side-panel-resize-handle-left`/`.side-panel-resize-handle-right`,
applied directly by `SidePanel.tsx` based on its own `side` prop — would
work identically and avoids the descendant combinator entirely. It was
not chosen here because the component *already* renders
`.side-panel.left`/`.side-panel.right` on its outer element (needed
regardless, for the panel's own background/border), so the handle's real
position is already fully determined by an ancestor that exists either
way — adding a second, side-specific class to the handle itself would be
real, avoidable duplication of information the DOM already carries.

### Commands

None new.

### Run It

Already shown above — the isolated lab's own real, Playwright-verified
output. The real project rules follow the identical mechanism; verified
live in the browser (not just typechecked): dragging the left panel's
handle (its own right edge) grows it toward center, and the right
panel's handle (its own left edge) does the same, mirrored, exactly as
the resize logic from the next unit expects.

This is the last piece `SidePanel.tsx`'s own rendering depends on — every
class string it sets now has real, complete CSS behind it, ready for the
next unit's own subject: how the handle actually gets dragged.

---

## Concept Unit: Resizing a Panel by Hand

*(Full standalone treatment: `../concepts/manual-mouse-drag-pattern.md`.
Reappearing, first real use of its mutable-value half:
`../concepts/react-useref-hook.md`.)*

### The Problem

A panel needs to resize by dragging its edge — a real, hand-built drag
interaction, not something CSS alone can do.

### The Concept, Isolated

Full standalone lab, run for real, in the concept file above. Not
repeated here.

### Mechanical Walkthrough
- `const dragState = useRef<{ startX: number; startWidth: number } | null>(null);`
- — **(b) reappearing** `useRef`, but genuinely new *for this project's
  own code*: every earlier use (`Viewport.tsx`'s `containerRef`, Lesson
  8) held a real DOM node; this one holds a plain mutable value — the
  exact second half `react-useref-hook.md`'s own isolated lab already
  covers (its `RenderCounter` example), now actually used that way here
  for the first time.
- `handlePointerDown` — **(b) reappearing**, full treatment in the drag
- concept file — `dragState.current` (not a `useState` value) captures
  the drag's starting point specifically *because* recording it should
  never itself trigger a re-render; only `onResize`'s own `setState`
  call, further down, should.
- `side === "left" ? deltaX : -deltaX` — **(a) first appearance** of
  this project's own real reason to flip a drag delta's sign: the left
  panel's handle sits on its *right* edge (dragging right grows it,
  toward the window's center); the right panel's handle sits on its
  *left* edge (dragging right shrinks it, since it grows toward the
  center from the *other* direction) — the identical rightward mouse
  motion means opposite real effects depending on which panel it's
  resizing.
- `Math.max(120, ...)` — **(b) reappearing** already-established
  `Math.max`; `120` matches `theme.css`'s own `.side-panel { min-width:
  120px; }`, named here as a real, intentional duplication (the JS clamp
  prevents a panel from being dragged smaller than the width the CSS
  itself already guarantees) rather than a coincidence.

### Verified, Run for Real

```
left panel width after dragging +80px: 301
```
Real output, this session: a real mouse-down on the resize handle,
moved 80px right in five real steps, then released — the panel's own
rendered width grew from its starting `220` to `301` (the small excess
over exactly `300` is the real cumulative effect of the drag's own
intermediate steps, not an error).

---

## Concept Unit: One View, One Home

### The Problem

`RibbonToolbar`'s toggles (Lesson 22) only knew how to show or hide one
fixed section each. Nothing yet knows about two panels, which one is
selected, or what "clicking DRO" should actually do when there's a real
choice of where it could go.

### Project Change

- **Files affected** — `cnc-web/src/App.tsx`.
- **Change type** — replace (the whole file's state and render, built
  on Lesson 22's same `RibbonToolbar` import).

### The New Code

```typescript
function toggleView(viewId: ViewId) {
  const selected = selectedPanel === "left" ? leftPanel : rightPanel;
  const otherSide: Side = selectedPanel === "left" ? "right" : "left";

  if (selected.tabs.includes(viewId) && selected.activeTab === viewId) {
    setPanel(selectedPanel, (panel) => removeFromPanel(panel, viewId));
    return;
  }

  setPanel(otherSide, (panel) => removeFromPanel(panel, viewId));
  setPanel(selectedPanel, (panel) => ({
    tabs: panel.tabs.includes(viewId) ? panel.tabs : [...panel.tabs, viewId],
    activeTab: viewId,
  }));
}
```

### The Updated Project

`App.tsx`, in full:
```typescript
import { useEffect, useState } from "react";
import Viewport from "./Viewport.tsx";
import ToolCardList from "./ToolCardList.tsx";
import ToolImportPanel from "./ToolImportPanel.tsx";
import MachineStatus from "./MachineStatus.tsx";
import RibbonToolbar from "./RibbonToolbar.tsx";
import SidePanel from "./SidePanel.tsx";
import type { PathPoint } from "./segments.ts";

interface PathResponse {
  points: PathPoint[];
}

async function fetchPath(program: string): Promise<PathPoint[]> {
  const response = await fetch("http://127.0.0.1:5000/api/path", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ program }),
  });
  const data: PathResponse = await response.json();
  return data.points;
}

const PROGRAM = "M3 S1000\nG0 X10 Y20\nX30\nG1 Z-5 F100\nM8";

type ViewId = "dro" | "tools";
type Side = "left" | "right";

interface PanelState {
  tabs: ViewId[];
  activeTab: ViewId | null;
}

const VIEW_LABELS: Record<ViewId, string> = {
  dro: "DRO",
  tools: "Tools",
};

function App() {
  const [points, setPoints] = useState<PathPoint[]>([]);
  const [toolsRefreshKey, setToolsRefreshKey] = useState(0);

  const [leftWidth, setLeftWidth] = useState(220);
  const [rightWidth, setRightWidth] = useState(260);
  const [selectedPanel, setSelectedPanel] = useState<Side>("right");
  const [leftPanel, setLeftPanel] = useState<PanelState>({ tabs: [], activeTab: null });
  const [rightPanel, setRightPanel] = useState<PanelState>({ tabs: ["dro", "tools"], activeTab: "dro" });

  useEffect(() => {
    fetchPath(PROGRAM).then(setPoints);
  }, []);

  function renderViewContent(id: ViewId) {
    if (id === "dro") return <MachineStatus program={PROGRAM} />;
    return (
      <>
        <ToolCardList refreshKey={toolsRefreshKey} />
        <ToolImportPanel onImported={() => setToolsRefreshKey((k) => k + 1)} />
      </>
    );
  }

  function setPanel(side: Side, updater: (panel: PanelState) => PanelState) {
    (side === "left" ? setLeftPanel : setRightPanel)(updater);
  }

  function removeFromPanel(panel: PanelState, viewId: ViewId): PanelState {
    if (!panel.tabs.includes(viewId)) return panel;
    const tabs = panel.tabs.filter((id) => id !== viewId);
    const activeTab = panel.activeTab === viewId ? tabs[0] ?? null : panel.activeTab;
    return { tabs, activeTab };
  }

  function toggleView(viewId: ViewId) {
    const selected = selectedPanel === "left" ? leftPanel : rightPanel;
    const otherSide: Side = selectedPanel === "left" ? "right" : "left";

    if (selected.tabs.includes(viewId) && selected.activeTab === viewId) {
      setPanel(selectedPanel, (panel) => removeFromPanel(panel, viewId));
      return;
    }

    setPanel(otherSide, (panel) => removeFromPanel(panel, viewId));
    setPanel(selectedPanel, (panel) => ({
      tabs: panel.tabs.includes(viewId) ? panel.tabs : [...panel.tabs, viewId],
      activeTab: viewId,
    }));
  }

  const isViewActive = (viewId: ViewId) =>
    leftPanel.activeTab === viewId || rightPanel.activeTab === viewId;

  return (
    <div className="app-shell">
      <RibbonToolbar
        groups={[
          {
            label: "Panels",
            toggles: (Object.keys(VIEW_LABELS) as ViewId[]).map((id) => ({
              id,
              label: VIEW_LABELS[id],
              visible: isViewActive(id),
              onToggle: () => toggleView(id),
            })),
          },
        ]}
      />
      <div className="app-body">
        <div className="canvas-layer">
          <Viewport points={points} />
        </div>
        <SidePanel
          side="left"
          width={leftWidth}
          onResize={setLeftWidth}
          tabs={leftPanel.tabs.map((id) => ({ id, label: VIEW_LABELS[id], content: renderViewContent(id) }))}
          activeTabId={leftPanel.activeTab}
          onSelectTab={(id) => setLeftPanel((panel) => ({ ...panel, activeTab: id as ViewId }))}
          onCloseTab={(id) => setLeftPanel((panel) => removeFromPanel(panel, id as ViewId))}
          isSelected={selectedPanel === "left"}
          onSelect={() => setSelectedPanel("left")}
        />
        <SidePanel
          side="right"
          width={rightWidth}
          onResize={setRightWidth}
          tabs={rightPanel.tabs.map((id) => ({ id, label: VIEW_LABELS[id], content: renderViewContent(id) }))}
          activeTabId={rightPanel.activeTab}
          onSelectTab={(id) => setRightPanel((panel) => ({ ...panel, activeTab: id as ViewId }))}
          onCloseTab={(id) => setRightPanel((panel) => removeFromPanel(panel, id as ViewId))}
          isSelected={selectedPanel === "right"}
          onSelect={() => setSelectedPanel("right")}
        />
      </div>
    </div>
  );
}

export default App;
```
Real, deliberate, named gap: `PathDump` (Lesson 12) is not rendered
anywhere in this file anymore — it doesn't fit the panel model yet (a
"concern" nobody has placed), left un-wired rather than force-fit into a
third toggle no one asked for. The component itself is untouched.

### Mechanical Walkthrough
- `type PanelState = { tabs: ViewId[]; activeTab: ViewId | null }` —
  **(b) reappearing** TypeScript object/union types, applied to a new,
  real shape.
- `Record<ViewId, string>` — **(b) reappearing**
  `typescript-record-utility-type.md` (Lesson 17).
- `removeFromPanel` — **(b) reappearing** `.filter()` (already
  established, `ToolCardList.tsx`) and the `?? null` fallback
  (`javascript-logical-or-default-fallback.md`'s nullish sibling,
  already established) — real, new logic: closing whichever tab happens
  to be active falls back to the *first remaining* tab, not to `null`
  unconditionally, so a panel with other real tabs left open doesn't go
  blank for no reason.
- `toggleView` — the real decision this whole lesson is named for: three
  branches, in order — already-active-in-the-selected-panel (close it),
  otherwise remove it from *the other* panel first (a view lives in at
  most one place), then add/activate it in the selected panel. **(b)
  reappearing** every individual piece (`.includes()`, functional
  `setState`, spread); **(a) first appearance** of this specific,
  real three-branch decision as a whole.
- `(Object.keys(VIEW_LABELS) as ViewId[]).map(...)` — **(a) first
- appearance** of `Object.keys()` in this project — returns a real
  array of an object's own keys, cast back to `ViewId[]` since
  `Object.keys` itself only ever returns `string[]`, with no way for
  TypeScript to know the specific literal keys `VIEW_LABELS` actually
- has — this is what lets `RibbonToolbar`'s groups be built directly
  from `VIEW_LABELS` rather than a second, separately-maintained list of
  view ids that could drift out of sync with it.

### CS Lens

The real invariant this unit maintains — **a view exists in at most one
panel** — is the same **mutual exclusion** idea a real system enforces
around any resource only one consumer should hold at a time, applied
here to UI real estate rather than a lock or a file handle.

### SE Lens

The real alternative — letting a view be open in both panels
simultaneously — was deliberately not built: it would mean two live
instances of the same component (`MachineStatus`, say) rendering
independently, each with its own real subscriptions/fetches, for a
single underlying concern that only ever needs one. Enforcing "at most
one home" in `toggleView` itself, rather than trusting every future
caller to remember not to violate it, is the same discipline a real
invariant enforced at one boundary (`input-validation-at-boundary.md`'s
own point) always is — cheaper to guarantee centrally than to hope
every caller respects by convention.

### Verified, Run for Real

```
initial: right panel tabs: [ 'DRO', 'Tools' ], left panel: "No panels open."
selected left panel -> clicked "Tools" in ribbon:
  left panel tabs:  [ 'Tools' ]
  right panel tabs: [ 'DRO' ]
selected right panel -> clicked "DRO" (already active there):
  right panel tabs: [] (closed)
clicked "DRO" again:
  right panel tabs: [ 'DRO' ] (reopened)
console errors: []
```
Real output, this session, via headless-browser clicks — every branch
of `toggleView` exercised for real: move-between-panels, close-when-
already-active, and reopen-when-closed, each producing exactly the
tab lists this unit's own walkthrough predicts.

---

## Connect the Pieces

`App` renders `.app-shell` → `RibbonToolbar` (built from `VIEW_LABELS`,
so its buttons and this project's two real views can never drift apart)
→ `.app-body`, holding the real `.canvas-layer` (Viewport, now a true
fixed-size-only-by-the-window background, `ResizeObserver`-aware) and
two `SidePanel`s. Clicking a panel calls `onSelect`, recording it as the
target for the next ribbon click; clicking a ribbon toggle calls
`toggleView`, which — using nothing but each panel's own `tabs`/`activeTab`
state and `selectedPanel` — decides whether to close, move, or newly
open that view, with `SidePanel` itself completely unaware any of that
decision-making happened, only ever receiving a final, resolved list of
tabs to render. Dragging either panel's own resize handle calls `onResize`
directly, `useRef`-tracked, entirely independent of the canvas
underneath, which never once changes size because of it — the real
point of this entire lesson, confirmed live.

## What Breaks Without This

Caused for real, this session, before the first unit's CSS existed: the
viewport rendered as a normal, in-flow block element sized by its own
inline `700`/`400` pixels — any layout change anywhere on the page
(exactly what a panel resizing or toggling produces) would have shifted
where that fixed-size box sat, or required it to participate in
reflow, reproducing the real prior failure this lesson exists to close.
Restoring the fixed-shell CSS and rerunning the same panel operations:
confirmed the canvas's own real pixel size never changes in response to
any panel action, only to the actual browser window resizing.

## Exercises

1. Open Tools in the left panel and DRO in the right, then click the
   ribbon's "Tools" button while the *right* panel is selected — confirm
   Tools moves to the right (now holding both tabs) and the left panel
   correctly returns to its real empty state.
2. Add a `console.log` inside `removeFromPanel` printing its own
   `panel`/`viewId` arguments, then trigger the "close already-active"
   branch and the "move from the other panel" branch separately —
   confirm from the real log output which real call path each one
   actually takes through `toggleView`.
3. Resize the right panel down to its real minimum (drag it far left)
   and confirm it stops shrinking at exactly `120`px, matching both the
   CSS `min-width` and the `Math.max(120, ...)` clamp — then remove only
   the JS clamp and explain, from what you know about how the two are
   enforced differently, why the panel still doesn't shrink below it.

## Definition of Done

- [ ] The viewport fills the whole window behind both panels, and
      neither opening/closing a panel nor dragging one's width ever
      visibly moves or rescales the rendered part.
- [ ] Resizing the actual browser window resizes the canvas correctly,
      confirmed yourself, not just described.
- [ ] Selecting a panel, then clicking a ribbon toggle, opens/moves the
      view into the panel you selected — confirmed for both panels, both
      directions.
- [ ] Clicking a ribbon toggle for a view that's already active in the
      selected panel closes it; clicking it again reopens it.
- [ ] `npx tsc --noEmit` is clean.
- [ ] A git commit exists explaining *why* (the real prior failure this
      architecture fixes, and the real "one view, one home" rule) — not
      just a list of files changed.
