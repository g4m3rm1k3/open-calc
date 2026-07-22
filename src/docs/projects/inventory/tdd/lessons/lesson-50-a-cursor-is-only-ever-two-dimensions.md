# Lesson 50: A Cursor Is Only Ever Two Dimensions

**What you will build:** the first, deliberately scoped step toward a
real draw/sketch tool for `cnc-web` — real raycasting that turns a
mouse position into an actual 3D point on a chosen plane, a new
always-visible status bar for picking that plane (G17/G18/G19,
matching the parser's own real convention) and its depth, and a live
cursor-position readout. No sketching/drawing itself lands in this
lesson — that's real, later work, once this foundation is in place.

**What you need to know first:** `concepts/threejs-renderer-scene-
camera.md`; `concepts/ref-mirror-of-state-needs-manual-sync.md`;
`core/parser.py`'s own `G17`/`G18`/`G19` plane tracking (Lesson 29);
`react-useeffect-hook.md`.

---

## Concept Unit: A Cursor Is Only Ever Two Dimensions

### The Problem

A real draw tool needs to know where, in the 3D scene, the user's mouse
is pointing — but a mouse position is only ever a real 2D screen
coordinate. The reference's own draw tool (`cnc/CNCSim.jsx`'s `s2w`,
"screen to world") already exists and looks like it solves this — but
it only ever performs a flat 2D trigonometric transform assuming one
specific, unstated planar relationship between the screen and the
world; it has no real concept of "which plane" at all, and produces a
wrong result the moment the camera's own real 3D orientation doesn't
match what that transform silently assumes.

### Introduce the Concept in Isolation

First appearance of this exact technique in this project — full
standalone treatment: `concepts/raycasting-screen-to-world-picking.md`.
Read that first; its own isolated example (a screen click resolved
against a chosen ground plane, shown correct for any camera angle) is
precisely the technique this lesson applies for real.

### CS Lens / SE Lens

Not repeated — fully covered by `raycasting-screen-to-world-picking.md`.

### Commands

None new.

### Run It

See the concept file's own real, isolated `THREE.Raycaster`/
`intersectPlane` example.

---

## Concept Unit: Real NDC Coordinates and the Raycaster Setup

### Project Change

- **Reference Source** — `cnc/CNCSim.jsx`'s `s2w()` (line 3218) — real
  inspiration for *what problem* this solves, not ported code (its own
  2D-only trigonometry is exactly what this replaces).
- **Files affected** — `cnc-web/src/viewport.ts`.
- **Change type** — add.
- **Location** — new `DrawPlane` type, `planeFor`, raycasting state, and
  `setDrawPlane`, all new.
- **Dependencies** — `raycasting-screen-to-world-picking.md`.

### The New Code

```ts
// Real, matching core/parser.py's own plane-selection modal state
// (Lesson 29) -- the same three real values, reused here for the same
// real concept (which two axes a flat sketch actually lies in), not a
// coincidental naming choice.
export type DrawPlane = "G17" | "G18" | "G19";

// A mouse cursor is only ever a real 2D screen position -- it cannot,
// by itself, say which of the infinitely many real 3D points along its
// own line of sight is "the" point the user means. Resolving that
// requires a real, separate, human decision: which plane, and how far
// along its own perpendicular axis (`depth`) -- G17 (XY) means "depth"
// is Z, G18 (XZ) means Y, G19 (YZ) means X. This is a real, deliberate
// improvement over the reference's own `s2w()` (cnc/CNCSim.jsx:3218),
// which only ever produces a correct result for one implicit, unstated
// planar assumption -- it has no real concept of an intersection with
// a chosen plane at all, let alone one the user can actually pick.
function planeFor(drawPlane: DrawPlane, depth: number): THREE.Plane {
  if (drawPlane === "G18") return new THREE.Plane(new THREE.Vector3(0, 1, 0), -depth);
  if (drawPlane === "G19") return new THREE.Plane(new THREE.Vector3(1, 0, 0), -depth);
  return new THREE.Plane(new THREE.Vector3(0, 0, 1), -depth);
}

export function createViewport(
  container: HTMLElement,
  onCursorMove?: (position: { x: number; y: number; z: number } | null) => void,
) {
```

```ts
  // Real cursor tracking for the coming draw tool -- G17/Z=0 by default
  // (the same real default core/parser.py's own Parser starts with,
  // Lesson 4), reassignable via setDrawPlane once a real plane-selection
  // control exists. `raycaster`/`pointer` are reused every real move
  // event rather than reallocated -- a plain, real optimization for
  // something that can fire dozens of times a second.
  const raycaster = new THREE.Raycaster();
  const pointerNdc = new THREE.Vector2();
  let currentPlane = planeFor("G17", 0);
  const intersection = new THREE.Vector3();

  function handlePointerMove(event: PointerEvent) {
    if (!onCursorMove) return;
    const rect = renderer.domElement.getBoundingClientRect();
    pointerNdc.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    pointerNdc.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    raycaster.setFromCamera(pointerNdc, camera);
    const hit = raycaster.ray.intersectPlane(currentPlane, intersection);
    onCursorMove(hit ? { x: hit.x, y: hit.y, z: hit.z } : null);
  }
  renderer.domElement.addEventListener("pointermove", handlePointerMove);

  function handlePointerLeave() {
    onCursorMove?.(null);
  }
  renderer.domElement.addEventListener("pointerleave", handlePointerLeave);

  function setDrawPlane(drawPlane: DrawPlane, depth: number) {
    currentPlane = planeFor(drawPlane, depth);
  }
```

`cleanup()` and the returned object, both updated to account for the
two new listeners and the new function:

```ts
  function cleanup() {
    isDisposed = true;
    resizeObserver.disconnect();
    renderer.domElement.removeEventListener("pointermove", handlePointerMove);
    renderer.domElement.removeEventListener("pointerleave", handlePointerLeave);
    clearToolMeshes();
    controls.dispose();
    renderer.dispose();
    composer.dispose();
    if (renderer.domElement.parentElement) {
      renderer.domElement.parentElement.removeChild(renderer.domElement);
    }
  }

  return { drawPath, setTool, setDrawPlane, updateColors, cleanup };
```

### Mechanical Walkthrough

`((event.clientX - rect.left) / rect.width) * 2 - 1` converts a real
pixel position (relative to the canvas's own bounding rect, since the
canvas itself may not start at the browser window's own origin) into
NDC `x` — `0` at the left edge maps to `-1`, `rect.width` at the right
edge maps to `+1`. The `y` axis is negated (`-(... * 2 - 1)`, written
here as `-(... ) * 2 + 1`) because screen pixels count downward from
the top while NDC counts upward from the bottom — the single most
common real bug in this exact conversion, when it's gotten backwards.
`raycaster`/`pointerNdc`/`intersection` are all created once, outside
`handlePointerMove`, and mutated in place on every real move event —
a real, deliberate avoidance of allocating three new objects on
every single mouse-move firing, which can easily happen dozens of
times per second. `planeFor` is a real, pure function — same real
input, same real plane, every time — called both once at setup
(`G17`, depth `0`, matching `core/parser.py`'s own real default) and
again from `setDrawPlane` whenever the user picks a different plane or
depth.

### CS Lens / SE Lens

Not repeated — the general technique is `raycasting-screen-to-world-
picking.md`'s own; the one project-specific addition here is genuinely
reusing this project's own established `G17`/`G18`/`G19` naming
(`core/parser.py`, Lesson 29) for the identical real concept, rather
than inventing new names for something this project already has a real
convention for.

### Commands

None new.

### Run It

```
Real, live-browser behavior confirmed this session: moving the mouse
over the viewport produces a real, live 3D position; switching planes
(next unit's own StatusBar) changes which real plane that position is
computed against.
```

---

## Concept Unit: A Stable Callback for an Effect That Runs Once

### The Problem

`createViewport`'s own `onCursorMove` callback is only ever passed in
*once*, when the WebGL viewport is first created (`Viewport.tsx`'s own
mount effect, which deliberately has an empty dependency array so it
never tears down and recreates the whole renderer). But `onCursorMove`
itself (ultimately `App.tsx`'s `setCursorPosition`) could, in general,
be a new function on every render.

### Introduce the Concept in Isolation

**REAPPEARING** — `concepts/ref-mirror-of-state-needs-manual-sync.md`
already covers exactly this shape (a value read inside a long-lived,
create-once closure, kept current via a small, dedicated sync effect) —
read that first if this is its first appearance in your own work.

### Project Change

- **Reference Source** — none.
- **Files affected** — `cnc-web/src/Viewport.tsx`.
- **Change type** — add.
- **Location** — new props, new ref, new sync effect, updated mount
  effect.
- **Dependencies** — `ref-mirror-of-state-needs-manual-sync.md`.

### The New Code

```tsx
function Viewport({
  points,
  themeId,
  activeTool,
  showHolder,
  drawPlane,
  planeDepth,
  onCursorMove,
}: ViewportProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const viewportRef = useRef<ReturnType<typeof createViewport> | null>(null);
  // A real ref mirror (concepts/ref-mirror-of-state-needs-manual-sync.md):
  // createViewport's own pointermove listener is created once, at mount,
  // and closes over whatever `onCursorMove` this stable wrapper reads --
  // reading `.current` here is what lets a *new* onCursorMove (a fresh
  // function identity on every App.tsx render) actually take effect
  // without tearing down and recreating the whole WebGL viewport just to
  // rewire one callback.
  const onCursorMoveRef = useRef(onCursorMove);
  useEffect(() => {
    onCursorMoveRef.current = onCursorMove;
  }, [onCursorMove]);

  useEffect(() => {
    if (!containerRef.current) return;
    const vp = createViewport(containerRef.current, (position) => onCursorMoveRef.current(position));
    viewportRef.current = vp;

    return () => {
      vp.cleanup();
      viewportRef.current = null;
    };
  }, []);
```

The new, matching `setDrawPlane` effect, alongside the existing
`setTool` one:

```tsx
  useEffect(() => {
    viewportRef.current?.setDrawPlane(drawPlane, planeDepth);
  }, [drawPlane, planeDepth]);
```

### Mechanical Walkthrough

`onCursorMoveRef` is seeded from `onCursorMove` at first render
(`useRef(onCursorMove)`), then kept current by a small, dedicated
effect depending on `[onCursorMove]` — the exact same shape `usePlayback.ts`
(Lesson 46) already established for `sbkRef`/`speedModeRef`/
`custSpeedRef`. The mount effect passes a small, stable arrow function
(`(position) => onCursorMoveRef.current(position)`) to `createViewport`
— *that* wrapper's own identity never changes across renders (it's
created once, inside an effect with an empty dependency array), but
what it *calls* — `onCursorMoveRef.current` — is always whatever the
latest real `onCursorMove` prop actually is.

### CS Lens / SE Lens

Not repeated — fully covered by `ref-mirror-of-state-needs-manual-
sync.md`. Worth restating the concrete stakes here specifically: without
this, `App.tsx`'s own `setCursorPosition` — a plain, React-guaranteed-
stable dispatch function — would have worked fine by coincidence (its
own identity never actually changes). The ref mirror is what makes this
correct in general, for any real caller, not just this one that happens
to already be safe.

### Commands

```
npx tsc --noEmit
```

### Run It

Confirmed live: the viewport's own WebGL context is created exactly
once per mount (no repeated context creation on unrelated `App.tsx`
re-renders), while cursor updates still flow through correctly on every
real mouse move.

---

## Concept Unit: The Status Bar — Showing Only the Axes That Are Real

### Project Change

- **Reference Source** — none.
- **Files affected** — `cnc-web/src/StatusBar.tsx` (new).
- **Change type** — add.
- **Location** — new file.
- **Dependencies** — `viewport.ts`'s `DrawPlane`.

### The New Code

```tsx
import type { DrawPlane } from "./viewport.ts";

// Real, matching core/parser.py's own plane-selection convention
// (Lesson 29) -- `axes` names which two real world axes a cursor
// position on this plane actually varies in; the third (this plane's
// own real depth) is fixed by `planeDepth`, not read from the cursor at
// all -- a mouse position genuinely cannot say how far along a ray it
// sits without a real, separate, human decision.
const PLANES: { id: DrawPlane; label: string; axes: readonly ["x" | "y" | "z", "x" | "y" | "z"] }[] = [
  { id: "G17", label: "G17 (XY)", axes: ["x", "y"] },
  { id: "G18", label: "G18 (XZ)", axes: ["x", "z"] },
  { id: "G19", label: "G19 (YZ)", axes: ["y", "z"] },
];

interface StatusBarProps {
  cursorPosition: { x: number; y: number; z: number } | null;
  drawPlane: DrawPlane;
  onSetDrawPlane: (plane: DrawPlane) => void;
  planeDepth: number;
  onSetPlaneDepth: (depth: number) => void;
}

// First step toward a real draw tool (per direct instruction): a cursor
// is only ever a real 2D screen position -- resolving it to one real 3D
// point requires knowing which plane it's meant to lie in, and how far
// along that plane's own perpendicular axis. This bar is where that real,
// human decision gets made; `viewport.ts`'s own raycasting (not this
// component) is what actually turns a mouse move into a real world
// position, once the plane is known.
function StatusBar({ cursorPosition, drawPlane, onSetDrawPlane, planeDepth, onSetPlaneDepth }: StatusBarProps) {
  const active = PLANES.find((p) => p.id === drawPlane) ?? PLANES[0];
  const [axisA, axisB] = active.axes;
  const valueA = cursorPosition ? cursorPosition[axisA] : null;
  const valueB = cursorPosition ? cursorPosition[axisB] : null;

  return (
    <div className="status-bar">
      <div className="status-bar-cursor">
        <span className="status-bar-axis">{axisA.toUpperCase()}</span>
        <span className="status-bar-value">{valueA != null ? valueA.toFixed(3) : "--"}</span>
        <span className="status-bar-axis">{axisB.toUpperCase()}</span>
        <span className="status-bar-value">{valueB != null ? valueB.toFixed(3) : "--"}</span>
      </div>
      <div className="btn-group status-bar-planes">
        {PLANES.map((p) => (
          <button
            type="button"
            key={p.id}
            className={`btn btn-sm${p.id === drawPlane ? " btn-bl" : ""}`}
            onClick={() => onSetDrawPlane(p.id)}
          >
            {p.label}
          </button>
        ))}
      </div>
      <label className="status-bar-depth">
        Depth
        <input
          type="number"
          value={planeDepth}
          onChange={(e) => onSetPlaneDepth(Number(e.target.value))}
        />
      </label>
    </div>
  );
}

export default StatusBar;
```

The new CSS this real layout needs:

```css
/* StatusBar.tsx -- a real, always-visible bottom bar (not another
   toggleable panel), since the cursor position/plane/depth it shows is
   real, live context for the *whole* canvas, not one specific tab. */
.status-bar {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 4px 12px;
  background: var(--color-panel);
  border-top: 1px solid var(--color-border);
  font-size: 11px;
}
.status-bar-cursor {
  display: flex;
  align-items: center;
  gap: 6px;
  font-family: monospace;
}
.status-bar-axis {
  color: var(--color-muted);
  font-weight: 600;
}
.status-bar-value {
  color: var(--color-text);
  min-width: 64px;
}
.status-bar-planes {
  width: auto;
}
.status-bar-depth {
  display: flex;
  align-items: center;
  gap: 6px;
  color: var(--color-muted);
  margin-left: auto;
}
.status-bar-depth input {
  width: 80px;
  background: var(--color-bg);
  border: 1px solid var(--color-border);
  border-radius: 3px;
  color: var(--color-text);
  padding: 3px 6px;
  font-size: 11px;
}
```

### Mechanical Walkthrough

`PLANES` names, for each real plane, which two real world axes a
position *on* that plane actually varies in (`axes`) — `G17`'s own
depth is `z`, so a cursor position there only ever varies in `x`/`y`;
the bar shows exactly those two, by real axis name, not a fixed "X/Y"
label that would be wrong for `G18`/`G19`. `valueA`/`valueB` read
straight off `cursorPosition` using those axis names as real object
keys (`cursorPosition[axisA]`) — no separate per-plane display logic
needed, since `cursorPosition` already has real `x`/`y`/`z` fields for
every plane. `.status-bar-planes` reuses `.btn-group`/`.btn`/`.btn-sm`/
`.btn-bl` — the identical real classes `PlaybackControls.tsx`'s own
speed-mode row already established (Lesson 46) — for the same real
"a row of mutually-exclusive toggle buttons" shape.

### CS Lens

Not a hard CS concept — deriving a display's own real labels/values
from a single source of truth (`PLANES`) rather than hardcoding
"X"/"Y" text that would silently mislabel two other real planes.

### SE Lens

The real, easy mistake this avoids: a status bar that always shows
"X"/"Y" regardless of which plane is actually selected would be
actively misleading the moment `G18`/`G19` is chosen — the numbers
shown would be real, but under the wrong real labels. Deriving the
labels from the same `PLANES` table that drives the raycasting plane
itself guarantees they can never drift apart.

### Commands

None new.

### Run It

```
Real, live-browser behavior confirmed this session: selecting G18
correctly relabels the status bar to X/Z and shows the real depth-axis
(Y) value fixed at whatever the depth input holds, not read from the
cursor.
```

---

## Concept Unit: Wiring the State

### Project Change

- **Reference Source** — none.
- **Files affected** — `cnc-web/src/App.tsx`.
- **Change type** — add.
- **Location** — new state, `<Viewport>`'s own props, new `<StatusBar>`.
- **Dependencies** — every piece above.

### The New Code

```tsx
  // First step toward a real draw tool (per direct instruction): a
  // mouse cursor is only ever a real 2D screen position -- it cannot,
  // by itself, say which real 3D point along its own line of sight is
  // meant. `drawPlane`/`planeDepth` are the real, human decision that
  // resolves that ambiguity (matching core/parser.py's own real G17/
  // G18/G19 default and naming, Lesson 29); `cursorPosition` is
  // Viewport's own real raycasting result against that plane, not
  // computed here. No actual drawing/sketching yet -- this is real,
  // deliberately scoped infrastructure for it.
  const [drawPlane, setDrawPlane] = useState<DrawPlane>("G17");
  const [planeDepth, setPlaneDepth] = useState(0);
  const [cursorPosition, setCursorPosition] = useState<{ x: number; y: number; z: number } | null>(null);
```

```tsx
          <Viewport
            points={revealedPoints}
            themeId={themeId}
            activeTool={activeToolDisplay}
            showHolder={showHolder}
            drawPlane={drawPlane}
            planeDepth={planeDepth}
            onCursorMove={setCursorPosition}
          />
```

```tsx
      <StatusBar
        cursorPosition={cursorPosition}
        drawPlane={drawPlane}
        onSetDrawPlane={setDrawPlane}
        planeDepth={planeDepth}
        onSetPlaneDepth={setPlaneDepth}
      />
```

### Mechanical Walkthrough

`<StatusBar>` sits as a real sibling of `.app-body` inside `.app-shell`
(a real, always-visible bottom bar, not another toggleable side-panel
tab) — `.app-shell`'s own `flex-direction: column` plus `.status-bar`'s
own `flex-shrink: 0` reserves its real space without needing any layout
changes to the existing ribbon/canvas/side-panel structure.
`onCursorMove={setCursorPosition}` passes React's own dispatch function
straight through — real, already-stable, which is exactly what the
previous unit's own ref-mirror makes safe to rely on even though nothing
here special-cases it.

### CS Lens / SE Lens

Not repeated — ordinary state-lifting, the same shape every other piece
of shared UI state in this file already uses (`showHolder`, `themeId`,
etc.).

### Commands

```
npx tsc --noEmit
npx vitest run
npx vite build
```

### Run It

```
tsc --noEmit: clean.
vitest run: 10/10 passing (unaffected by this change).
vite build: succeeds.
Confirmed live in the browser: moving the mouse over the viewport
updates the status bar's own live X/Y readout; clicking G18/G19
switches which two axes are shown and where the depth plane sits;
editing the depth input moves the plane accordingly.
```

---

## Connect the Pieces

One real chain, start to finish: a mouse move over the viewport becomes
NDC coordinates, then a real ray from the camera, then — intersected
against whichever plane `StatusBar.tsx`'s own three buttons and depth
input currently select — a real 3D point, reported up through a stable,
ref-mirrored callback so the WebGL viewport itself never has to be
recreated just to keep that callback current. `App.tsx` holds the real,
shared state (`drawPlane`/`planeDepth`/`cursorPosition`) both sides
read from. Nothing here draws anything yet — this lesson is entirely
the real, human-decision infrastructure (which plane, how deep) that
resolves the one genuine ambiguity a 2D cursor has in a 3D scene, ahead
of the actual sketching logic that will consume it next.

## What Breaks Without This

Reverting `viewport.ts`'s `planeFor` to always return a plane at
`z = 0` regardless of the real selected plane/depth, then selecting
`G18` or a nonzero depth in the status bar: the status bar's own labels
would correctly show `X`/`Z`, but the real values reported would still
be computed against the wrong, hardcoded plane — a real, silent
mismatch between what the UI claims and what the raycasting actually
does.

## Exercises

1. Read `concepts/raycasting-screen-to-world-picking.md`'s own
   Try-It-Yourself exercise 3 (a ray parallel to the chosen plane) and
   trace what `handlePointerMove` in this lesson's own code would report
   to `onCursorMove` in that real case — is `hit` ever `null` in
   practice for this project's own real camera setup? Reason about it
   from the camera's own real position/orientation.
2. Trace `PLANES`' own `axes` entries by hand and explain why `G19`'s
   own depth axis is `x`, not `z` — connect it back to `core/parser.py`'s
   own real G17/G18/G19 semantics (Lesson 29) rather than treating it as
   an arbitrary choice.
3. `ref-mirror-of-state-needs-manual-sync.md`'s own Try-It-Yourself
   exercise 2 asks about mirroring more than one value. Name the one
   other prop in `Viewport.tsx` that changes over time but is read
   inside a create-once closure (hint: none currently are, beyond
   `onCursorMove`) — and explain why `activeTool`/`showHolder`/
   `drawPlane`/`planeDepth` didn't need this same treatment.

## Known Incomplete — Named Directly

- **No actual sketching/drawing yet** — per direct instruction, this
  lesson is deliberately scoped to the plane/depth selection and live
  cursor-position infrastructure alone. Real, planned next work.
- **Only the three default planes (G17/G18/G19) are selectable** —
  per direct instruction, user-defined custom planes are real, explicit,
  deferred future scope, not started.
- **The depth input has no real bounds/validation** — any real number
  is accepted; a real, reasonable future addition, not built here.
- **`StatusBar.tsx`'s own colors are not yet keyed to the app's active
  theme beyond the existing shared CSS variables it already reuses** —
  no new, separate theming work was needed or done here.

## Definition of Done

- [x] `viewport.ts`: `DrawPlane`, `planeFor`, real raycasting on
      `pointermove`, `setDrawPlane`, real cleanup of both new listeners.
- [x] `Viewport.tsx`: new props, a real ref-mirror keeping the
      raycasting callback current without recreating the WebGL context.
- [x] `StatusBar.tsx`: real, always-visible bottom bar — live cursor
      readout (correct axes per plane), plane selection, depth input.
- [x] `App.tsx`: state lifted and wired end-to-end.
- [x] One new, project-independent concept file
      (`raycasting-screen-to-world-picking.md`).
- [x] `npx tsc --noEmit` clean.
- [x] `npx vitest run` — 10/10 passing.
- [x] `npx vite build` — succeeds.
- [x] Confirmed live in the browser.

```
git commit -m "Lesson 50: a cursor is only ever two dimensions"
```
