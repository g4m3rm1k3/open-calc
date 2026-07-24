# Lesson 51: A Camera That Aligns But Doesn't Lock

**What you will build:** clicking a plane button in the status bar
(Lesson 50) now also snaps the camera to look straight along that
plane's own normal — a real, one-time alignment, not a mode. Orbiting
away afterward works exactly as before; nothing is constrained. Real
drawing/sketching entities are still separate, later work.

**What you need to know first:** Lesson 50's `viewport.ts`/
`StatusBar.tsx`/`DrawPlane`; `concepts/threejs-orbitcontrols.md`;
`react-useref-hook.md`.

---

## Concept Unit: Aligning a Camera With a Plane, Without Locking It

### The Problem

Drawing in 3D space (via Lesson 50's own raycasting) is possible from
any camera angle — but it's genuinely easier to judge a shape's real
position when looking straight along the plane it's being drawn on,
not at some arbitrary orbited angle. Per direct instruction: clicking a
plane button should *align* the view with that plane, not *lock* the
camera to it — orbiting away afterward has to keep working normally.

### Project Change

- **Reference Source** — none.
- **Files affected** — `cnc-web/src/viewport.ts`.
- **Change type** — add.
- **Location** — new `snapToPlaneView`, alongside `setDrawPlane`.
- **Dependencies** — `concepts/threejs-orbitcontrols.md`.

### The New Code

```ts
  // Real, per direct instruction: clicking a plane button *aligns* the
  // camera with that plane -- it doesn't lock orbiting to it. Nothing
  // here disables or constrains `controls` afterward; this is a one-time
  // repositioning, not a mode. The real distance from the current orbit
  // target is preserved, so the zoom level feels continuous rather than
  // resetting to some fixed value.
  function snapToPlaneView(drawPlane: DrawPlane, depth: number) {
    const distance = camera.position.distanceTo(controls.target);
    const target = controls.target.clone();
    if (drawPlane === "G18") {
      target.y = depth;
      camera.position.set(target.x, target.y - distance, target.z);
    } else if (drawPlane === "G19") {
      target.x = depth;
      camera.position.set(target.x - distance, target.y, target.z);
    } else {
      target.z = depth;
      // Shown in the next unit.
    }
    controls.target.copy(target);
    camera.lookAt(target);
    controls.update();
  }
```

### Mechanical Walkthrough
`distance` is read from the camera's *current* position before moving
anything — preserving it (rather than snapping to some fixed distance)
is what keeps the zoom level feeling continuous across the jump.
`target` starts as a *clone* of the current orbit target, with only the
real depth-axis coordinate overwritten (`target.y = depth` for `G18`,
- `target.x = depth` for `G19`) — the other two, in-plane coordinates are
left exactly where the user was already looking, so the snap re-centers
depth-wise without also recentering the view sideways. `camera.lookAt
- (target)` then `controls.update()` — the second call is real and
necessary: `OrbitControls` caches its own internal spherical
coordinates from the camera's position/target, and won't reflect a
manually-moved camera on the next render without being told to
resynchronize.

### CS Lens

Not a hard CS concept — a small, real coordinate-geometry operation:
holding two of three real coordinates fixed, moving the camera to a
fixed real distance along the one axis that changed.

### SE Lens

The real, deliberate design choice worth naming directly: nothing in
`snapToPlaneView` touches `controls.enabled`, `controls.minPolarAngle`,
or any other real constraint `OrbitControls` supports. A *lock* would
have used those; an *alignment* deliberately doesn't — the whole
function only ever moves the camera once and lets the user take over
immediately, matching the direct instruction exactly ("it doesn't lock
me to it, just aligns me with it").

### Commands

None new.

### Run It

```
Real, live-browser behavior confirmed this session: clicking G18 or
G19 snaps to a straight-on front/side view at the current zoom
distance; immediately orbiting afterward moves freely, with no
resistance or snapping back.
```

---

## Concept Unit: The Degenerate Case — When "Up" and "Forward" Agree

### The Problem

`G17`'s own plane (XY, normal Z) is the one real case where "look
straight along the normal" means looking straight down the *same* axis
this scene's own `camera.up` already points along (`(0, 0, 1)`,
Z-up — the identical convention every other view in this project
already relies on). A camera whose view direction is exactly parallel
to its own up vector has no well-defined roll — `camera.lookAt` and
`OrbitControls` both depend on up/forward being genuinely different
directions.

### Project Change

- **Reference Source** — none.
- **Files affected** — `cnc-web/src/viewport.ts`.
- **Change type** — add.
- **Location** — `snapToPlaneView`'s own `G17` branch.
- **Dependencies** — none.

### The New Code

```ts
      target.z = depth;
      // A true top-down view (camera directly above, looking straight
      // down -Z) is a real, known degenerate case here: `camera.up` is
      // (0,0,1) everywhere in this scene (the same real Z-up convention
      // every other view already relies on), and a view direction
      // exactly parallel to `up` leaves the camera's own roll undefined.
      // A tiny, real, visually unnoticeable tilt (not a special "up"
      // vector that would have to be un-done the moment the user orbits
      // away) avoids the degeneracy while still looking, in practice,
      // like a real top-down view.
      const epsilon = 0.001;
      camera.position.set(
        target.x + distance * Math.sin(epsilon),
        target.y,
        target.z + distance * Math.cos(epsilon),
      );
```

### Mechanical Walkthrough
- `Math.sin(0.001) ≈ 0.001`, `Math.cos(0.001) ≈ 0.99999950...` — the
camera ends up almost, but not exactly, directly above the target:
mostly displaced along `+z` (`distance * cos(epsilon)`, essentially the
full distance), with a real, tiny sideways nudge along `+x`
- (`distance * sin(epsilon)`, a fraction of a percent of the distance) —
visually indistinguishable from a true top-down view, but no longer
mathematically parallel to `camera.up`. The real alternative rejected
- here — temporarily setting `camera.up` to something like `(0, 1, 0)`
for this one view — was considered and deliberately not used: it would
have needed to be set back to `(0, 0, 1)` the moment the user orbits
away (to keep matching this project's own real, single Z-up convention
everywhere else), a real, extra piece of state to track for a problem
the epsilon tilt already solves without it.

### CS Lens

This is the same real category of problem as **gimbal lock** — a
configuration where two of a system's own degrees of freedom (here,
roll and yaw, once pitch reaches exactly ±90°) become indistinguishable
— solved here the same pragmatic way many real camera systems do:
never actually let the degenerate angle be reached exactly, staying an
imperceptible fraction away from it instead.

### SE Lens

The real, easy trap avoided here: reaching for a special-cased "up"
vector that solves the immediate visual problem while quietly
introducing a *second*, later problem (remembering to restore the
normal convention afterward, in every real place the camera might next
be touched). A tiny numeric epsilon is a real, self-contained fix that
never needs undoing.

### Commands

None new.

### Run It

```pycon
>>> import math
>>> epsilon = 0.001
>>> math.sin(epsilon), math.cos(epsilon)
(0.0009999998333333417, 0.9999995000000417)
```

Confirms the real, near-total displacement along `z` with only a
fractional real nudge along `x` — visually a top-down view, never
exactly parallel to `camera.up`.

---

## Concept Unit: A Command, Not a Description of State

### The Problem

`App.tsx` needs to trigger `snapToPlaneView` on the *specific* WebGL
viewport instance `Viewport.tsx` owns internally — but `Viewport.tsx`
had no way to expose anything to its own parent beyond plain props, and
a plain prop wouldn't correctly handle re-clicking the *same*
already-selected plane after orbiting away from it (nothing about that
click would look like a prop "changing").

### Introduce the Concept in Isolation

First appearance of this exact pattern in this project — full
standalone treatment: `concepts/react-useimperativehandle-command-not-
state.md`. Read that first; its own isolated example (a `Flasher`
component whose `flash()` fires identically no matter how many times
in a row it's called) is precisely the real shape this project needed.

### Project Change

- **Reference Source** — none.
- **Files affected** — `cnc-web/src/Viewport.tsx`, `cnc-web/src/App.tsx`,
  `cnc-web/src/StatusBar.tsx`.
- **Change type** — replace.
- **Location** — `Viewport.tsx`'s own export; `App.tsx`'s new
  `handleSelectPlane`; `StatusBar.tsx`'s renamed prop.
- **Dependencies** — `react-useimperativehandle-command-not-state.md`.

### The New Code

```tsx
// Real, imperative on purpose: aligning the camera with a plane is a
// one-shot action (per direct instruction, it aligns, it doesn't lock),
// triggered by a real, discrete user action (clicking a plane button) --
// not real, continuous state anything should re-render in response to.
// A plain prop (e.g. a "requested view" value) would need its own
// separate "did this actually change" bookkeeping to fire exactly once
// per click, including re-clicking the *same* plane after orbiting away
// from it -- `useImperativeHandle` says directly what this really is:
// a command sent to the viewport, not a description of its state.
export interface ViewportHandle {
  snapToPlaneView: (plane: DrawPlane, depth: number) => void;
}

const Viewport = forwardRef<ViewportHandle, ViewportProps>(function Viewport(
  { points, themeId, activeTool, showHolder, drawPlane, planeDepth, onCursorMove },
  ref,
) {
```

```tsx
  useImperativeHandle(
    ref,
    () => ({
      snapToPlaneView: (plane, depth) => viewportRef.current?.snapToPlaneView(plane, depth),
    }),
    [],
  );

  return <div ref={containerRef} style={{ width: "100%", height: "100%" }} />;
});
```

`App.tsx`'s own real trigger, doing both real jobs (selecting the
raycasting plane *and* aligning the camera) in one place:

```tsx
  const viewportHandleRef = useRef<ViewportHandle>(null);

  // Real, per direct instruction: clicking a plane button in the status
  // bar both selects it (for raycasting) *and* aligns the camera with
  // it -- a one-time repositioning, not a lock; `OrbitControls` stays
  // fully free to orbit away afterward. Kept as an explicit, imperative
  // call (`viewportHandleRef`), not a plain prop Viewport reacts to,
  // since re-clicking the *same* already-selected plane (after orbiting
  // away from it) still needs to trigger a fresh alignment -- something
  // a plain "did drawPlane change" effect would miss.
  function handleSelectPlane(plane: DrawPlane) {
    setDrawPlane(plane);
    viewportHandleRef.current?.snapToPlaneView(plane, planeDepth);
  }
```

`StatusBar.tsx`'s own renamed prop, making the real, dual purpose of
selecting a plane explicit at the call site:

```tsx
  // Real, per direct instruction: selecting a plane both picks it (for
  // raycasting) *and* aligns the camera with it -- App.tsx's own
  // handleSelectPlane does both, not just a plain state setter, since
  // aligning the view is a real, one-time action, not a value this
  // component's own state describes.
  onSelectPlane: (plane: DrawPlane) => void;
```

```tsx
            className={`btn btn-sm${p.id === drawPlane ? " btn-bl" : ""}`}
            onClick={() => onSelectPlane(p.id)}
```

### Mechanical Walkthrough
`ViewportHandle` deliberately exposes exactly one real method
- (`snapToPlaneView`) — not the internal `viewportRef` itself, not
`drawPath`/`setTool`/`setDrawPlane`, none of which any parent has ever
needed to call directly (they're all already driven by plain, ordinary
props). `App.tsx`'s `handleSelectPlane` is a plain function, recreated
fresh on every render (not wrapped in `useCallback`, not stored in a
ref) — it doesn't need to be stable, since it's only ever called
directly from a JSX event handler, never captured inside a separate,
long-lived closure the way `onCursorMove` was in Lesson 50.

### CS Lens / SE Lens

Not repeated — fully covered by `react-useimperativehandle-command-
not-state.md`.

### Commands

```
npx tsc --noEmit
npx vitest run
npx vite build
```

### Run It

```
tsc --noEmit: clean.
vitest run: 10/10 passing (unaffected).
vite build: succeeds.
Confirmed live in the browser: re-clicking the same, already-selected
plane button after orbiting away from it correctly re-aligns the
camera every time.
```

---

## Connect the Pieces

One real chain, start to finish: clicking a plane button in
`StatusBar.tsx` calls `onSelectPlane`, which `App.tsx`'s own
`handleSelectPlane` turns into two real actions — updating the
raycasting plane (a plain prop, exactly as Lesson 50 already built) and
calling `viewportHandleRef.current.snapToPlaneView(...)` (a real,
imperative command, exposed through `Viewport.tsx`'s own
`useImperativeHandle`, reaching all the way down into `viewport.ts`'s
own camera/controls). The camera moves once, to a real, correctly
oriented straight-on view — handling the one real degenerate case
(top-down, where up and forward would otherwise coincide) with a tiny,
self-contained numeric tilt rather than a special-cased "up" vector
that would need undoing later — and then gets completely out of the
way: `OrbitControls` is never touched, so the very next mouse drag
orbits exactly as it always has.

## What Breaks Without This

Removing the `epsilon` tilt from `snapToPlaneView`'s own `G17` branch
(setting the camera exactly above the target, at `θ = 0`) and clicking
`G17`: the camera's own resulting orientation becomes undefined —
`OrbitControls`' own next orbit interaction would behave unpredictably
(a real, classic gimbal-lock symptom), since `camera.up` and the view
direction are now exactly parallel.

## Exercises

1. Read `concepts/react-useimperativehandle-command-not-state.md`'s own
   Try-It-Yourself exercise 1 and, in your own words, explain why
   `drawPlane`/`planeDepth`/`showHolder` (this project's own existing
   `Viewport` props) are correctly modeled as plain props, while
   `snapToPlaneView` genuinely isn't — what's the real, distinguishing
   test?
2. Trace `snapToPlaneView`'s own `G18` branch by hand for a real
   `controls.target` of `(10, 5, 3)`, a real camera `distance` of `20`,
   and a real `depth` of `7` — compute the exact real camera position
   and target `snapToPlaneView` would set.
3. `react-useimperativehandle-command-not-state.md`'s own Try-It-
   Yourself exercise 2 asks about exposing a second real method. Name
   one other real, one-shot action in this project (not necessarily in
   `Viewport.tsx`) that might be a legitimate candidate for the same
   pattern, and explain why, using the same "does it need to fire
   identically even when nothing else changed" test.

## Known Incomplete — Named Directly

- **No real sketching/drawing entities yet** — this lesson, like Lesson
  50, is real, deliberately scoped infrastructure; the actual draw
  tools (lines, rectangles, circles) are separate, later work, per
  direct instruction to keep this broken into small pieces.
- **The epsilon tilt is a real, fixed constant (`0.001`)**, not derived
  from anything about the scene's own real scale — a reasonable,
  visually unnoticeable choice for this project's own real camera
  distances, not a universally "correct" value for every possible scale.

## Definition of Done

- [x] `viewport.ts`: `snapToPlaneView`, all three real planes, the real
      top-down degenerate case handled with a tiny epsilon tilt.
- [x] `Viewport.tsx`: `forwardRef`/`useImperativeHandle` exposing
      exactly one real method.
- [x] `App.tsx`/`StatusBar.tsx`: wired end-to-end, selecting a plane
      both updates raycasting and aligns the camera.
- [x] One new, project-independent concept file
      (`react-useimperativehandle-command-not-state.md`).
- [x] `npx tsc --noEmit` clean.
- [x] `npx vitest run` — 10/10 passing (unaffected).
- [x] `npx vite build` — succeeds.
- [x] Confirmed live in the browser, including re-clicking the same
      plane and orbiting freely afterward.

```
git commit -m "Lesson 51: a camera that aligns but doesn't lock"
```
