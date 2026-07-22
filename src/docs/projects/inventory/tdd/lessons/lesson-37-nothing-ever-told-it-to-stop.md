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

`viewport.ts`'s relevant pieces, in order:

```typescript
export function createViewport(container: HTMLElement) {
  let isDisposed = false;
  let colors = themeColors();
  ...
```

```typescript
  function render() {
    if (isDisposed) return;
    controls.update();
    renderer.render(scene, camera);
    requestAnimationFrame(render);
  }
  render();
```

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
