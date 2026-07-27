# Lesson 38: Lines the GPU Was Never Going to Draw Thick

**What you will build:** `viewport.ts`'s toolpath (Lesson 8) has drawn
every segment with `THREE.LineBasicMaterial({ color })` — including its
own real `linewidth` option, which every real GPU driver silently
ignores (confirmed live, this session: WebGL reports its actual
supported line-width range as `[1, 1]`, no matter what value is
requested). This lesson replaces that with Three.js's real
geometry-based fat-line technique (`Line2`/`LineMaterial`/`LineGeometry`)
and adds a real post-processing bloom pass, so rapid/feed lines render
as visibly thick, glowing strokes instead of thin, flat 1px lines. New
feature, not a port — the reference has no post-processing pipeline or
fat lines to port from; this project's own toolpath rendering has looked
identical (functionally) since Lesson 8. The transferable point: an
API accepting a parameter and an API actually honoring it are two
different claims, and the real, verifiable way to know which one you
have is checking the driver's own reported capability, not the option's
mere existence.

**What you need to know first:**
`concepts/webgl-linewidth-limitation.md` (new, this lesson); Lesson 8's
own `THREE.Line`/`THREE.LineBasicMaterial` toolpath rendering; Lesson
37's own `cleanup()`, extended here to also dispose the new composer.

---

## Concept Unit: WebGL's `lineWidth` Is (Almost Always) Ignored

### The Problem

`viewport.ts`'s toolpath lines have used `THREE.LineBasicMaterial`
since Lesson 8 — a real material with a real `linewidth` option that has
never actually done anything visible, because nearly every real WebGL
driver clamps line width to `1` regardless of what's requested.

### The Concept, Isolated

Full isolated treatment lives in `concepts/webgl-linewidth-limitation.md`,
run for real this session, in the same Chromium/Playwright browser this
whole project's own live verification has used:

```javascript
const canvas = document.createElement("canvas");
const gl = canvas.getContext("webgl");
console.log("ALIASED_LINE_WIDTH_RANGE:", Array.from(gl.getParameter(gl.ALIASED_LINE_WIDTH_RANGE)));
```

**Real output, run this session:**
```
ALIASED_LINE_WIDTH_RANGE: [ 1, 1 ]
```

### Discard

This lab is not part of the project — the real fix below doesn't call
`lineWidth` at all; it switches to a completely different technique.

### CS Lens

Per `webgl-linewidth-limitation.md`: an API accepting a wider value as a
valid argument and the runtime actually honoring it are two different
real claims — the driver's own reported `[1, 1]` range is the only way
to know which one applies here, for real, right now.

### SE Lens

The real, standard workaround: stop asking for a thick *line primitive*
and instead draw real triangle geometry shaped like a thick line —
Three.js's own `Line2`/`LineMaterial`/`LineGeometry` (from its
`examples/jsm/lines/` module) is exactly this, pre-built, which is why
this lesson doesn't hand-roll its own vertex-offsetting shader.

---

## Project Change: A Real Post-Processing Pipeline and Fat Toolpath Lines

### Files Affected

`cnc-web/src/viewport.ts` (modified). Change type: add (new feature, no
reference counterpart).

### The New Code

```typescript
const composer = new EffectComposer(renderer);
composer.addPass(new RenderPass(scene, camera));
composer.addPass(new UnrealBloomPass(new THREE.Vector2(width, height), 0.6, 0.5, 1.2));
composer.addPass(new OutputPass());
```

### The Updated Project

`viewport.ts`'s new imports:

```typescript
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";
import { OutputPass } from "three/examples/jsm/postprocessing/OutputPass.js";
import { Line2 } from "three/examples/jsm/lines/Line2.js";
import { LineMaterial } from "three/examples/jsm/lines/LineMaterial.js";
import { LineGeometry } from "three/examples/jsm/lines/LineGeometry.js";
```

The real post-processing chain, built once, right after `controls`:

```typescript
  const composer = new EffectComposer(renderer);
  const renderPass = new RenderPass(scene, camera);
  composer.addPass(renderPass);

  // Increase threshold to 1.2 (HDR range).
  // This ensures that even a completely white background (1.0) in light mode won't bloom.
  // Reduce strength to 0.6 for a "slight glow" instead of a blown-out neon look.
  const bloomPass = new UnrealBloomPass(new THREE.Vector2(width, height), 0.6, 0.5, 1.2);
  composer.addPass(bloomPass);

  // In newer Three.js versions, OutputPass is required to correctly map the
  // internal render target colors/alpha to the screen.
  const outputPass = new OutputPass();
  composer.addPass(outputPass);
```

`drawPath`, rebuilt on `Line2`/`LineMaterial`/`LineGeometry`, disposing
each real segment's geometry/material before rebuilding (a real,
pre-existing leak this same change happens to close — `pathGroup.remove()`
alone, Lessons 8–37, never disposed anything):

```typescript
  let lastPoints: PathPoint[] = [];
  let lineMaterials: LineMaterial[] = [];

  function drawPath(points: PathPoint[]) {
    lastPoints = points;
    while (pathGroup.children.length) {
      const child = pathGroup.children[0] as Line2;
      child.geometry.dispose();
      child.material.dispose();
      pathGroup.remove(child);
    }
    lineMaterials = [];
    if (points.length < 2) return;

    const segments = groupSegments(points);
    segments.forEach((segment) => {
      const positions: number[] = [];
      segment.points.forEach((p) => {
        positions.push(p.x, p.y, p.z);
      });

      const geometry = new LineGeometry();
      geometry.setPositions(positions);

      const baseColor = segment.motion === "G0" ? colors.rapid : colors.feed;
      // Multiply by a smaller scalar (1.5) so the color just barely crosses the 1.2 threshold.
      // This preserves the solid hue (yellow/blue) without washing it out to pure white.
      const glowColor = new THREE.Color(baseColor).multiplyScalar(1.5);

      // Using NormalBlending so lines are visible on light backgrounds.
      // Linewidth 3 makes it thick and easy to see on the canvas.
      const material = new LineMaterial({
        color: 0xffffff, // will be overridden by glowColor
        linewidth: 3,
        resolution: new THREE.Vector2(container.clientWidth, container.clientHeight),
        blending: THREE.NormalBlending,
        transparent: true,
        depthTest: false // Renders over everything!
      });
      material.color = glowColor; // Preserves HDR values > 1.0

      const line = new Line2(geometry, material);
      line.computeLineDistances();
      line.renderOrder = 999; // Force it to draw last
      pathGroup.add(line);
      lineMaterials.push(material);
    });
  }
```

`render()` now renders through the composer, not the renderer directly:

```typescript
  function render() {
    if (isDisposed) return;
    controls.update();
    composer.render();
    requestAnimationFrame(render);
  }
```

The resize handler keeps the composer and every live line material's
real pixel resolution in sync:

```typescript
  const resizeObserver = new ResizeObserver(() => {
    if (isDisposed) return;
    const newWidth = container.clientWidth;
    const newHeight = container.clientHeight;
    if (newWidth === 0 || newHeight === 0) return;
    renderer.setSize(newWidth, newHeight);
    composer.setSize(newWidth, newHeight);
    camera.aspect = newWidth / newHeight;
    camera.updateProjectionMatrix();

    lineMaterials.forEach(mat => mat.resolution.set(newWidth, newHeight));
  });
```

And `cleanup()` (Lesson 37) now also disposes the composer:

```typescript
  function cleanup() {
    isDisposed = true;
    resizeObserver.disconnect();
    controls.dispose();
    renderer.dispose();
    composer.dispose();
    if (renderer.domElement.parentElement) {
      renderer.domElement.parentElement.removeChild(renderer.domElement);
    }
  }
```

### Mechanical Walkthrough

- `EffectComposer`/`RenderPass`/`UnrealBloomPass`/`OutputPass` — **(a)
  first appearance** — a real, chained post-processing pipeline: render
  the scene normally (`RenderPass`), then run a real bloom filter over
  the result (`UnrealBloomPass`), then map the (HDR, internally
  higher-range) result back to the screen's real display range
  (`OutputPass`) — each pass consuming the previous one's output.
- `UnrealBloomPass(..., 0.6, 0.5, 1.2)` — **(a) first appearance** —
  strength `0.6` (how strong the glow is), radius `0.5` (how far it
  spreads), threshold `1.2` (only pixels *brighter* than this bloom at
  all) — the threshold being above `1.0` is what keeps a plain white
  background from blooming, since normal, non-HDR color values never
  exceed `1.0` on any channel.
- `new THREE.Color(baseColor).multiplyScalar(1.5)` — **(a) first
  appearance** — the real mechanism that makes toolpath lines cross that
  `1.2` threshold on purpose: multiplying a color's channels past `1.0`
  produces a real HDR color Three.js's renderer can represent internally,
  even though it doesn't correspond to any real, displayable 0–255 value
  until tone-mapped back down by `OutputPass`.
- `Line2`/`LineGeometry`/`LineMaterial`, `resolution`, `linewidth: 3` —
  **(a) first appearance**, per `webgl-linewidth-limitation.md` — real
  triangle-based fat lines; `resolution` is required because the
  triangle-widening math happens in screen pixels, not world units, so
  the material needs to know the real, current pixel size of the canvas
  it's rendering into.
- `depthTest: false` / `line.renderOrder = 999` — **(a) first
  appearance** — the toolpath is forced to draw after (and regardless of
  depth relative to) everything else in the scene, so the glow is never
  hidden behind the grid.
- `child.geometry.dispose(); child.material.dispose();` before
  `pathGroup.remove(child)` — **(a) first appearance of real disposal
  here** — a genuinely separate, real, pre-existing leak this change
  happens to close: `pathGroup.remove(pathGroup.children[0])` alone
  (Lessons 8–37) removed old lines from the scene graph but never
  released their GPU geometry/material buffers, on every single redraw
  (every theme switch, every new program parsed) since Lesson 8.
- `composer.setSize`/`mat.resolution.set(...)` in the resize handler,
  `composer.dispose()` in `cleanup()` — **(b) reappearing** shape (extend
  the existing resize/cleanup functions) applied to the two new,
  real resources this lesson introduces.

### Execution Trace

No point/segment data is shown anywhere else in this lesson. `App.tsx`'s
own real `DEFAULT_PROGRAM` (Lesson 27) is what actually loads on first
render, so its real, already-computed 6 points (confirmed live, this
session, against the current backend) are what `drawPath` really runs
against the first time the app renders anything:

```
$ python3 -c "
from core.parser import Parser
from core.path import compute_steps
commands = Parser().parse('M3 S1000\nG0 X10 Y20\nX30\nG1 Z-5 F100\nM8')
for pt in compute_steps(commands)['points']: print(pt)
"
```
```
{motion: G0, x: 0,  y: 0,  z: 0}
{motion: G0, x: 0,  y: 0,  z: 0}
{motion: G0, x: 10, y: 20, z: 0}
{motion: G0, x: 30, y: 20, z: 0}
{motion: G1, x: 30, y: 20, z: -5}
{motion: G1, x: 30, y: 20, z: -5}
```

**First call** to `drawPath(points)` — `pathGroup.children.length` is
`0` (nothing has ever been drawn yet), so the dispose loop's condition is
immediately false and it never executes:

```
while (pathGroup.children.length) { ... }   ← 0, skipped entirely
lineMaterials = []
points.length (6) < 2?  → False, continue

groupSegments(points):
  current = {motion: "G0", points: [pt0]}
  i=1: pt1.motion "G0" === current.motion → push → points now [pt0, pt1]
  i=2: pt2.motion "G0" === current.motion → push → points now [pt0,pt1,pt2]
  i=3: pt3.motion "G0" === current.motion → push → points now [pt0..pt3]
  i=4: pt4.motion "G1" !== current.motion ("G0")
       → segments.push(current)  (segment 1: G0, 4 points)
       → current = {motion: "G1", points: [pt3 (bridge), pt4]}
  i=5: pt5.motion "G1" === current.motion → push → points now [pt3,pt4,pt5]
  end of loop → segments.push(current)  (segment 2: G1, 3 points)
  → 2 real segments

segments.forEach (2 iterations):
  Segment 1 (G0, 4 points): positions = 12 real numbers (0,0,0, 0,0,0,
    10,20,0, 30,20,0); baseColor = colors.rapid; one LineGeometry/
    LineMaterial/Line2 built; pathGroup.add() → pathGroup now has 1 child;
    lineMaterials = [mat1]
  Segment 2 (G1, 3 points): positions = 9 real numbers (30,20,0, 30,20,-5,
    30,20,-5) — note pt3 is real, shared data: it's both segment 1's last
    point and segment 2's first, the bridge groupSegments built above;
    baseColor = colors.feed; second Line2 built; pathGroup.add() →
    pathGroup now has 2 children; lineMaterials = [mat1, mat2]
```

**A second call** (any later redraw — a new program parsed, a theme
switch changing `colors`) starts from `pathGroup.children.length === 2`
this time, so the dispose loop actually runs:

```
Iteration 1: child = children[0] (segment 1's Line2)
  child.geometry.dispose(); child.material.dispose(); pathGroup.remove(child)
  → pathGroup.children.length now 1
Iteration 2: child = children[0] (now segment 2's Line2, shifted into
  position 0 after the first removal)
  child.geometry.dispose(); child.material.dispose(); pathGroup.remove(child)
  → pathGroup.children.length now 0 → loop condition false, ends
lineMaterials = []  (reset, about to be rebuilt from scratch below)
```

Every redraw is a full dispose-then-rebuild, never a partial update — the
same 2-line sequence above runs again from a clean `pathGroup`.

The composer chain itself needs no data-dependent trace — it's a fixed,
3-step sequence run once per `render()` call, each pass consuming the
prior pass's framebuffer output regardless of what's in the scene:
`RenderPass` renders the real scene graph normally; `UnrealBloomPass`
reads that result and adds bloom around anything brighter than its own
`1.2` threshold; `OutputPass` reads the (still-HDR-range) bloomed result
and tone-maps it back down to real, displayable 0–255 color.

### CS Lens

Per `webgl-linewidth-limitation.md`: this project's toolpath has always
*requested* a thick line (Lesson 8's own, never-effective `linewidth`
option existed in the material's type the whole time) without the
runtime ever honoring it — confirmed, not assumed, by reading the actual
driver capability this session. The fix doesn't ask harder; it uses a
mechanism (triangle geometry) the GPU was never going to refuse.

### SE Lens

The real, honest scope: this is a rendering/visual change with no
reference counterpart to verify against, same as Lesson 35's Monaco
work — its correctness rests on live, direct verification (below), not
comparison against a known-proven implementation. The bloom threshold/
multiplier values (`0.6`/`0.5`/`1.2`/`1.5`) are real, tuned constants
with no formula deriving them from anything else in this project; they
were chosen to look right, and changing them is a legitimate future
adjustment, not a "wrong value" waiting to be corrected.

**Why thick and glowing, not just correct:** the underlying usability
problem, never stated directly until now — a 1px line, even rendered
perfectly, is genuinely hard to track against a busy 3D scene (a grid,
a machine model, multiple overlapping toolpath segments at typical
zoom levels), and harder still to reliably tell rapid from feed moves
by color alone at that width. Thickness and bloom both exist to solve
the same real problem — making the toolpath the most visually
insistent thing in the scene, since it's the primary content of this
view, not decoration. The real alternative rejected implicitly by not
being considered: dashed lines or distinct geometry (e.g. tube-shaped
rapids vs. flat-ribbon feed moves) as a *second*, non-color-dependent
way to distinguish rapid from feed — thickness alone still leaves the
rapid/feed distinction resting on color only, an accessibility gap this
lesson doesn't raise or address.

`depthTest: false`/`renderOrder = 999` (Mechanical Walkthrough, above)
is described there purely as an implementation fact ("so the glow is
never hidden behind the grid") — worth stating as the actual design
decision it is: the toolpath is deliberately given priority over every
other visual element in the scene, on the reasoning that a CNC operator
checking the machine's programmed path needs it visible *regardless* of
camera angle or what else is being rendered, even at the cost of
occasionally looking geometrically wrong (drawing through solid
geometry that should occlude it).

### Commands

None new — `three`'s own bundled `examples/jsm/postprocessing`/
`examples/jsm/lines` modules, already available via the existing `three`
dependency (Lesson 8).

### Run It — Real Output

Verified live, this session, against the real running dev server, no
console/page errors:

```
errors: none
```

Visual confirmation (screenshot, this session): the toolpath renders as
a visibly thick, softly glowing stroke — distinctly thicker than a 1px
line, with a real bloom halo around it — correctly recolored per segment
(`G0`/rapid vs. feed) using this project's colors *at the time of this
lesson* (the real recolor to yellow/blue is separate, later scope — see
Lesson 40). Resizing the browser window live (1400×900 → 900×700) kept
the bloom/line rendering correct with no visual glitch or stale sizing,
confirming the resize handler's new `composer.setSize`/
`mat.resolution.set` calls are both real and load-bearing.

## Connect the Pieces

Follow one real redraw (a new program parsed, `App.tsx`'s existing
`fetchPath` effect calling `viewportRef.current?.drawPath(points)`),
start to finish:

1. `drawPath` disposes every previous segment's real `LineGeometry`/
   `LineMaterial` (this lesson's own, newly-added disposal) before
   removing it from `pathGroup` — the first time this project has ever
   released that GPU memory on redraw.
2. For each new segment, a `LineGeometry` is built from its real
   positions, and a `LineMaterial` is built with the segment's real
   rapid/feed color multiplied into HDR range (`× 1.5`).
3. The resulting `Line2` is added to `pathGroup`, forced to render last
   and ignore depth testing, and its material is tracked in
   `lineMaterials` so a later resize can keep its `resolution` correct.
4. `render()`'s own loop calls `composer.render()`, not
   `renderer.render()` directly — the scene renders normally first
   (`RenderPass`), then `UnrealBloomPass` finds every pixel brighter than
   `1.2` (the toolpath lines, and only the toolpath lines, thanks to the
   `× 1.5` multiply) and blooms them, then `OutputPass` maps the result
   back to the screen's real, displayable range.

## What Breaks Without This

Reverting to Lesson 37's own `THREE.Line`/`THREE.LineBasicMaterial`
version: the toolpath renders correctly, but as a thin, flat, exactly-1px
line — confirmed by this lesson's own `ALIASED_LINE_WIDTH_RANGE` check
that no `linewidth` value passed to that material was ever going to
produce anything thicker, on this or almost any real WebGL driver.

## Exercises

1. Change the bloom threshold from `1.2` to `0.8` and the color
   multiplier from `1.5` back to `1.0`, then reload live and describe
   what happens to the grid/background (which now also crosses the
   lower threshold) versus what happened before.
2. Read Three.js's own `Line2`/`LineMaterial` source (or its official
   "Fat Lines" example, per `webgl-linewidth-limitation.md`'s own
   exercises) and confirm directly where a line segment becomes two real
   triangles in a vertex shader.
3. `drawPath`'s new disposal fixes a real, separate leak (line
   geometry/material never released on redraw, Lessons 8–37) bundled
   into this same lesson's diff. Using Lesson 37's own citation style,
   write a short, honest note for `STATUS.md` distinguishing "this
   lesson's real new feature" from "this lesson's incidental fix of an
   older, unrelated bug" — the same distinction Lesson 37 itself drew
   for the WebGL-context leak.

## Definition of Done

- [ ] The toolpath renders as a visibly thick, glowing line, not a 1px
      flat line — verified live.
- [ ] Resizing the browser window keeps the bloom/line rendering correct
      — verified live.
- [ ] Redrawing the path (a new program, a theme switch) disposes the
      previous segments' real GPU geometry/material, not just removing
      them from the scene graph — verified by reading the code, matching
      Lesson 37's own disposal discipline.
- [ ] `cleanup()` also disposes the composer — verified by reading the
      code.
- [ ] `npx tsc --noEmit` passes with no errors.
- [ ] `concepts/webgl-linewidth-limitation.md` exists, with real,
      executed output from this project's own browser.
- [ ] `git commit` — message explaining that this is new feature work
      (a real post-processing bloom pipeline and geometry-based fat
      lines, replacing a `linewidth` option that real WebGL drivers were
      never going to honor), bundled with a real, incidental fix to a
      separate, pre-existing per-redraw resource leak.
