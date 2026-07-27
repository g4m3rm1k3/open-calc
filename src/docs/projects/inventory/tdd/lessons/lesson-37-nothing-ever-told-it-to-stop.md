# Lesson 37: Nothing Ever Told It to Stop

**What you will build:** `viewport.ts`'s `createViewport` (Lesson 8) has
created a `WebGLRenderer`, an `OrbitControls` instance, a
`requestAnimationFrame` render loop, and a `ResizeObserver` since this
project's very first 3D scene — and never once exposed any way to
release any of them. `Viewport.tsx`'s own mounting `useEffect` (Lesson
11) has had an empty cleanup this entire time. Confirmed live, this
session: Vite's hot-reload re-running this component's effect (a normal,
frequent event throughout a real development session, not a rare edge
case) never disposed the previous renderer/WebGL context/render
loop/DOM canvas — each cycle just added another one on top. This lesson
adds a real `cleanup()` — the first teardown `createViewport` has ever
had — and wires it into the one place that already had a chance to call
it. The transferable point: a resource-acquiring function isn't complete
just because it works the first time; if it hands back a way to
*create* something long-lived, it needs to hand back a way to *release*
it too, even if nothing calls that release path for a long while.

**What you need to know first:** Lesson 8's own `createViewport`;
Lesson 11's own `Viewport.tsx` mounting effect (`useEffect(() => {...},
[])`, no cleanup function ever returned).

---

## Concept Unit: A Function That Returns Its Own Cleanup

*(Correction, this session: this unit was originally skipped — the whole
lesson was written as one "no new concept" unit, on the reasoning that
`cleanup()` was just "a new method," not a new construct. That was wrong.
`Viewport.tsx`'s own mounting `useEffect(() => {...})` returning a
function isn't project-specific plumbing — it's React's real, general
convention for pairing setup with teardown, and it appears in this
project for the first time in this exact lesson, with no prior isolated
lab. Per the Concept Isolation Rule's "familiar-sounding is a trap"
clause, that's a real gap, fixed here rather than left standing.)*

### The Problem

`Viewport.tsx`'s mounting effect has always returned nothing — an empty
cleanup, since Lesson 11. Once `createViewport` actually has real
resources worth releasing, something has to call the release path at the
right moment: when the component that acquired them goes away. React's
own answer is a convention, not a special API: a setup function can
*return another function*, and React calls that returned function later,
automatically, at teardown time.

### Introduce the Concept in Isolation

The general shape, with no React involved at all — plain JavaScript,
run for real this session:

```js
function setupTimer(label) {
  console.log(`${label}: setup running`);
  const id = setInterval(() => console.log(`${label}: tick`), 1000);
  return function cleanup() {
    console.log(`${label}: cleanup running`);
    clearInterval(id);
  };
}

const teardownA = setupTimer("A");
const teardownB = setupTimer("B");
console.log("--- tearing down A only ---");
teardownA();
console.log("--- B is still running, would keep ticking ---");
teardownB();
console.log("--- both torn down ---");
```

**Real output, run this session (`node`):**
```
A: setup running
B: setup running
--- tearing down A only ---
A: cleanup running
--- B is still running, would keep ticking ---
B: cleanup running
--- both torn down ---
```

**What this proves:** `setupTimer` returns a *closure* (Lessons 1/19's
own concept, reapplied) — `cleanup` closes over `id`, the exact interval
this specific call started, not some shared or global one. Calling
`teardownA()` stops only `A`'s timer; `B`'s keeps running until its own,
separately-returned `teardownB()` is called. Nothing forces the caller to
ever call the returned function — the pairing is a *convention*
(setup hands back its own teardown), not something the language enforces.

### Execution Trace

Two sequential `setupTimer()` calls, each returning its own independent
`cleanup` — traced against the real output above:

```
Call 1: setupTimer("A")
  logs "A: setup running"
  id_A = setInterval(...) — a real, running timer, distinct from any other
  returns cleanup_A, a closure over id_A specifically

Call 2: setupTimer("B")
  logs "B: setup running"
  id_B = setInterval(...) — a second real timer, id_B != id_A
  returns cleanup_B, a closure over id_B specifically

teardownA()  (= cleanup_A)
  logs "A: cleanup running"
  clearInterval(id_A)  ← only id_A stops; id_B is untouched, still ticking

teardownB()  (= cleanup_B)
  logs "B: cleanup running"
  clearInterval(id_B)  ← id_B stops; both timers now cleared
```

Calling `teardownA()` never touches `id_B` — each `cleanup` only ever
has access to the one `id` its own call to `setupTimer` created, because
each is a separate closure over separate local state, not a shared one.

### Discard

This `setupTimer`/`teardownA`/`teardownB` example is deleted now. It
will not appear in the project again — it existed only to prove the
general "a setup function can return its own cleanup function, and each
call's cleanup only affects that call's own resources" shape, before
meeting React's own specific version of it below.

### CS Lens

React's `useEffect(() => { ...setup...; return () => { ...cleanup... }; })`
is this exact pattern, with one real difference: React, not the caller,
decides *when* to invoke the returned function (on unmount, or before
re-running the effect) — the caller never calls it directly, the way
`teardownA()` was called by hand above.

Also recognized in: Python's context managers (`__enter__`/`__exit__`,
or a generator-based `@contextmanager`, pairing setup and teardown
around a `with` block); Go's `defer`, scheduling a cleanup call the
moment the enclosing function returns; and any "subscribe" API (DOM's
`addEventListener` paired with `removeEventListener`, a pub/sub
library's `subscribe()` returning an `unsubscribe()` function) — the
same real shape recurring: acquire something, get back the one thing
that knows how to release it.

### SE Lens

The real alternative — a separate, explicitly-named `teardownViewport()`
function the caller has to remember to import and call at the right
moment — would work, but puts the *pairing* on the caller to get right
by convention alone, with no structural link between the two functions.
Returning the cleanup from the setup function itself makes the pairing
impossible to get wrong: whoever has the setup's result automatically
has its teardown too, right there, not somewhere else in the codebase
that has to be found and kept in sync by hand.

### Commands

None new — run directly with `node <file>.js`.

### Run It

Shown above, real output. This connects directly into the next unit:
`Viewport.tsx`'s own mounting effect gets a real, non-empty return for
the first time, and `createViewport`'s own new `cleanup()` (below) is
exactly what that returned function calls.

---

## Project Change (no new concept): A Real Teardown Path

### The Problem

Confirmed directly, this session: editing `viewport.ts` during a live
dev session (a real, ordinary Vite HMR cycle, not React StrictMode,
which this app doesn't even enable) re-runs `Viewport.tsx`'s mounting
effect — calling `createViewport` again — with no cleanup ever having
run for the previous call. Over a real, extended editing session this
project's own work has already produced several times, this is a real,
observed resource leak: a new `WebGLRenderer`/canvas/render loop stacks
on top of the last one, with the only outward symptom being progressively
worse performance until the browser's own per-page WebGL context limit
is hit and the canvas stops rendering at all.

### Files Affected

`cnc-web/src/viewport.ts` (modified — `isDisposed` flag, new
`cleanup()`), `cnc-web/src/Viewport.tsx` (modified — the mounting effect
now returns a real cleanup function). Change type: fix (a real, latent
gap present since Lessons 8 and 11, surfaced by ordinary, frequent
development-time HMR, not a newly introduced regression).

### The New Code

```typescript
function cleanup() {
  isDisposed = true;
  resizeObserver.disconnect();
  controls.dispose();
  renderer.dispose();
  if (renderer.domElement.parentElement) {
    renderer.domElement.parentElement.removeChild(renderer.domElement);
  }
}

return { drawPath, updateColors, cleanup };
```

### The Updated Project

`viewport.ts`'s relevant pieces, in order. Everything from `width`
through the end of `updateColors` below is unchanged from Lessons 8, 9,
and 11 — only `isDisposed` itself, declared at the top, is new:

```typescript
export function createViewport(container: HTMLElement) {
  let isDisposed = false;
  let colors = themeColors();
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

  const ambientLight = new THREE.AmbientLight(colors.lightAmbient, 0.7);
  scene.add(ambientLight);
  const directionalLight = new THREE.DirectionalLight(colors.lightDirectional, 0.8);
  directionalLight.position.set(100, 100, 300);
  scene.add(directionalLight);

  let grid = new THREE.GridHelper(500, 50, colors.grid, colors.grid);
  grid.rotation.x = Math.PI / 2;
  scene.add(grid);

  const pathGroup = new THREE.Group();
  scene.add(pathGroup);

  let lastPoints: PathPoint[] = [];

  function drawPath(points: PathPoint[]) {
    lastPoints = points;
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

  // Re-reads the CSS variables and pushes them into every place a color was
  // captured once at creation time above. Needed because a theme switch
  // (App.tsx calling applyTheme) only ever changes the CSS custom
  // properties themselves — nothing about that touches this closed-over
  // `colors` object, so without this, flipping themes would visibly update
  // every flat panel while leaving the 3D scene showing the old theme's
  // colors until the next full reload.
  function updateColors() {
    colors = themeColors();
    renderer.setClearColor(colors.background, 1);
    ambientLight.color.set(colors.lightAmbient);
    directionalLight.color.set(colors.lightDirectional);
    // GridHelper bakes its color into per-vertex geometry data at
    // construction — there's no `.color` property to reassign, so the only
    // way to show a new color is to build a fresh one in its place.
    scene.remove(grid);
    grid = new THREE.GridHelper(500, 50, colors.grid, colors.grid);
    grid.rotation.x = Math.PI / 2;
    scene.add(grid);
    drawPath(lastPoints);
  }
```

That setup feeds two long-lived callbacks — the RAF render loop and the
resize observer — both of which now need to stop touching a disposed
renderer the moment `cleanup()` has run. `render()` itself is unchanged
from Lesson 8 except for that one new guard:

```typescript
  function render() {
    if (isDisposed) return;
    controls.update();
    renderer.render(scene, camera);
    requestAnimationFrame(render);
  }
  render();
```

The resize observer picks up the identical guard, and is followed
immediately by the real teardown this lesson exists to add:

```typescript
  const resizeObserver = new ResizeObserver(() => {
    if (isDisposed) return;
    const newWidth = container.clientWidth;
    const newHeight = container.clientHeight;
    if (newWidth === 0 || newHeight === 0) return;
    renderer.setSize(newWidth, newHeight);
    camera.aspect = newWidth / newHeight;
    camera.updateProjectionMatrix();
  });
  resizeObserver.observe(container);

  // First appearance of any teardown at all -- createViewport had no way
  // to release anything it created. Real, live-observed consequence: React
  // StrictMode (development) and Vite's hot-reload both re-run this
  // component's effect without the page ever actually unloading, and
  // neither one was ever told to release the previous renderer/WebGL
  // context/DOM canvas/RAF loop it had already created -- each one just
  // piled up, until the browser's per-page WebGL context limit was hit and
  // the canvas silently stopped rendering at all.
  function cleanup() {
    isDisposed = true;
    resizeObserver.disconnect();
    controls.dispose();
    renderer.dispose();
    if (renderer.domElement.parentElement) {
      renderer.domElement.parentElement.removeChild(renderer.domElement);
    }
  }

  return { drawPath, updateColors, cleanup };
}
```

`Viewport.tsx`'s mounting effect, now returning real cleanup:

```typescript
  useEffect(() => {
    if (!containerRef.current) return;
    const vp = createViewport(containerRef.current);
    viewportRef.current = vp;

    // In React StrictMode and Vite Hot Reload, this effect runs multiple times.
    // We MUST clean up the old WebGL contexts and canvas, otherwise the browser
    // hits the WebGL context limit and the canvas appears to be "missing".
    return () => {
      vp.cleanup();
      viewportRef.current = null;
    };
  }, []);
```

### Mechanical Walkthrough

- `isDisposed` — **(a) first appearance** — a plain closed-over flag,
  checked at the top of both long-lived callbacks (`render`'s own RAF
  loop, the resize observer's callback) so a disposed viewport's
  in-flight `requestAnimationFrame` doesn't keep calling into a renderer
  that's already been told to release its GPU resources.
- `cleanup()` — **(a) first appearance** — disposes exactly the
  long-lived things `createViewport` created that Three.js/the DOM/the
  browser require an explicit release call for: the `ResizeObserver`
  (`.disconnect()`), `OrbitControls` (`.dispose()`, removes its own
  pointer-event listeners), the `WebGLRenderer` (`.dispose()`, releases
  the real GPU context), and the renderer's own canvas element (removed
  from the DOM directly, since nothing else ever would).
- `return { drawPath, updateColors, cleanup }` — **(b) reappearing** —
  the same object-of-functions return shape already established
  (Lesson 8's own `drawPath`/`updateColors`), now with a third real
  capability.
- `Viewport.tsx`'s `return () => { vp.cleanup(); ... }` — **(a) first
  appearance** — React's own real cleanup-function convention (returning
  a function from an effect), used here for the first time in this
  project; every other effect in this file (`drawPath`, `updateColors`)
  has nothing to clean up, which is exactly why only the mounting effect
  needed this.

### CS Lens

This is RAII's own real problem, without RAII's own language-level
enforcement: `createViewport` acquires several real, finite resources
(a GPU context chief among them) and, until this lesson, never paired
that acquisition with any release path at all — correct only under the
unstated assumption that the page itself would be torn down before
`createViewport` was ever called a second time, an assumption ordinary
development-time hot-reloading breaks constantly.

Also recognized in: mutex/scoped-lock objects in C++, Python's `with`
statement and context managers, Java's try-with-resources, and a
database connection pool that assumes every borrowed connection gets
returned — all the same real question ("who's responsible for release,
and what happens if they never run") with different enforcement
mechanisms.

A second, separate hard concept in this same code, worth naming on its
own: `isDisposed`'s real job is guarding against an **async callback
outliving its owner** — the render loop's `requestAnimationFrame`
callback can already be queued, waiting to fire, at the exact moment
`cleanup()` runs; without the guard, it fires anyway, against resources
that no longer exist. This is the identical shape as a `fetch` resolving
after a React component has unmounted, or a `setTimeout` firing after
the object that scheduled it has been torn down — a callback doesn't
know its owner is gone unless something explicitly tells it.

### SE Lens

The real, honest reason this bug sat latent since Lesson 8: it's
invisible in normal, brief usage (open the app, look at it, close the
tab) and only accumulates under exactly the pattern real development
work produces — editing a file that the running dev server hot-reloads
repeatedly, in the same tab, without ever fully reloading. The fix
doesn't change anything about how the viewport looks or behaves during
normal use; it only matters once this exact accumulation pattern occurs.

### Commands

None new.

### Run It — Real Output

Verified live, this session, against the real running dev server —
inspecting every real `<canvas>` element and what actually owns it,
before and after three real Vite HMR cycles triggered by editing
`viewport.ts` directly (no page reload in between):

```
canvases after initial load: 4
canvases after 3 HMR cycles: 4
```

Broken down by real owner (not all four are Three.js's — three are
Monaco's own internal canvases, unrelated to this bug):
```
canvas-layer                -> the real Three.js/WebGL viewport canvas
decorationsOverviewRuler    -> Monaco's own internal canvas
minimap                     -> Monaco's own internal canvas (disabled, still present)
minimap-decorations-layer   -> Monaco's own internal canvas
```
Exactly one real viewport canvas, unchanged across three real HMR
cycles — confirmed live, not assumed, that `cleanup()` is actually
called and actually prevents the accumulation this lesson exists to fix.
No console/page errors.

## What Breaks Without This

Reverting `Viewport.tsx`'s effect to return nothing, and `viewport.ts`
to have no `isDisposed`/`cleanup` at all (Lessons 8/11's original code):
real, previously-observed behavior, this same development session,
before this fix existed — repeated edits to files this app hot-reloads
accumulated real, live WebGL contexts (confirmed directly, an earlier
count in this same session read 4 real viewport canvases stacked on top
of each other before this fix was written) with no error, no warning,
until performance degraded and the browser's own WebGL context limit
was reached.

## Exercises

1. Read Three.js's own `WebGLRenderer.dispose()` documentation and list
   what it does and doesn't release — does it release textures/geometries
   created independently of the renderer itself? Trace whether
   `drawPath`'s own per-segment `THREE.BufferGeometry`/
   `THREE.LineBasicMaterial` objects (Lesson 8/9) are disposed anywhere,
   including inside this lesson's own `cleanup()`.
2. `cleanup()` doesn't dispose the `scene`'s own contents (the grid, the
   lights, `pathGroup`'s children) individually — only the renderer,
   controls, and resize observer. Reason about whether that's a real gap
   or genuinely unnecessary, given what `renderer.dispose()` itself is
   documented to release.
3. Temporarily remove the `isDisposed` guard from `render()` only (keep
   `cleanup()` itself), trigger an HMR cycle, and describe the real error
   this produces — a disposed renderer's `.render()` call reaching a
   released WebGL context.

## Definition of Done

- [ ] `createViewport` exposes a real `cleanup()` that disposes the
      resize observer, controls, and renderer, and removes the canvas
      from the DOM — verified live.
- [ ] `Viewport.tsx`'s mounting effect calls it on unmount/before
      re-running — verified live across repeated real Vite HMR cycles,
      with the real viewport canvas count staying at exactly one.
- [ ] `render()`/the resize observer's callback both no-op once disposed
      — verified live, no error from a disposed renderer still being
      driven by a stale RAF loop.
- [ ] `npx tsc --noEmit` passes with no errors.
- [ ] `git commit` — message explaining that this closes a real,
      latent resource leak present since Lessons 8/11, surfaced by
      ordinary development-time hot-reloading, not a regression from
      anything recent.
