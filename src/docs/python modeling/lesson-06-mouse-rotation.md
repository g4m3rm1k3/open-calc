# Lesson 6: Mouse-Driven Rotation

**What you will build:** real `mousedown`/`mousemove`/`mouseup`/`wheel`
event handlers, replacing Lesson 5's automatic `theta += 0.006` drift
with actual user input — the exact interaction your own `mesh_viewer.html`
already has, rebuilt here with every line understood. This is Phase
B's last lesson.

**What you need to know first:** Lesson 5 in full — spherical
coordinates, the verified conversion formula, `camera.lookAt()`, and
`updateCamera()` as a standalone, reusable function.

**Terms used in this lesson:**
- **drag state** — whether a mouse drag is currently in progress,
  tracked as a plain boolean variable (`dragging`) that a `mousedown`
  handler sets `true` and a `mouseup` handler sets back to `false`. It
  exists because a single `mousemove` event, on its own, carries no
  information about whether the mouse button is currently held down —
  something has to remember that across separate, independent event
  calls.
- **pixel delta** — how far the mouse moved since the *previous*
  `mousemove` event, in on-screen pixels — computed by subtracting a
  remembered previous position (`lastX`/`lastY`) from the event's
  current one, then updating that remembered position for next time.
- **sensitivity** — a small multiplier converting a pixel delta into an
  angle delta (radians) — a real, tunable design choice controlling how
  much rotation one pixel of mouse movement produces, not a physical
  constant with one single correct value.
- **`e.preventDefault()`** — a standard DOM method (not Three.js-
  specific) telling the browser not to perform whatever default
  behavior a given event would otherwise trigger. On a `wheel` event,
  the browser's own default behavior is scrolling the page — calling
  this stops that, so scrolling over the 3D view zooms the camera
  instead of scrolling the browser window underneath it.
- **multiplicative scaling** — changing a value by a *percentage* of
  its current size (`radius *= 1.1`, a 10% increase) rather than a
  fixed absolute amount (`radius += 1`, always exactly `1` unit, however
  large or small `radius` currently is). This lesson's own throwaway
  lab proves directly why zoom specifically benefits from this choice.

**Objects and methods used:**

- **the drag-tracking event handlers**
  - *What they are:* three DOM event listeners (`mousedown`, `mouseup`,
    `mousemove`) working together to maintain this lesson's own **drag
    state**.
  - *Implementation:*
    ```
    let dragging = false, lastX = 0, lastY = 0;

    renderer.domElement.addEventListener('mousedown', (e) => {
      dragging = true; lastX = e.clientX; lastY = e.clientY;
    });
    window.addEventListener('mouseup', () => { dragging = false; });
    window.addEventListener('mousemove', (e) => {
      if (!dragging) return;
      const dx = e.clientX - lastX, dy = e.clientY - lastY;
      lastX = e.clientX; lastY = e.clientY;
      theta -= dx * 0.006;
      phi -= dy * 0.006;
      phi = Math.max(0.05, Math.min(Math.PI - 0.05, phi));
      updateCamera();
    });
    ```
  - *Its use:* the exact three handlers already sitting in your own
    `mesh_viewer.html`.
  - *Type:* ordinary DOM event listeners, registered via
    `addEventListener` — general browser API, not Three.js.
  - *Responsibility:* together, to convert raw mouse movement — which
    happens continuously, on every pixel the cursor crosses, regardless
    of whether a button is held — into rotation only while a drag is
    genuinely in progress, and to do so incrementally, one small
    `theta`/`phi` change per event, rather than needing to know a
    drag's total distance all at once.
  - *Depends on:* the shared `dragging`/`lastX`/`lastY` variables,
    `theta`/`phi` (Lesson 5), and `updateCamera()` (Lesson 5).
  - *Connects to:* `mousemove` calls `updateCamera()` (Lesson 5) after
    updating `theta`/`phi`, the identical function this project's
    render loop already calls once per frame independently.
  - *Shape:* sits alongside, not inside, the render loop (Lesson 1) —
    these handlers run whenever the browser delivers a mouse event, at
    whatever rate that happens to be, completely independent of the
    render loop's own frame timing.

- **the `wheel` event handler**
  - *What it is:* an event listener converting scroll-wheel input into
    a change in `radius` (Lesson 5).
  - *Implementation:*
    ```
    renderer.domElement.addEventListener('wheel', (e) => {
      e.preventDefault();
      radius *= (1 + e.deltaY * 0.001);
      radius = Math.max(1, Math.min(30, radius));
      updateCamera();
    }, { passive: false });
    ```
  - *Its use:* the exact handler already in your own `mesh_viewer.html`,
    letting scroll input zoom the camera in and out.
  - *Type:* an ordinary DOM event listener.
  - *Responsibility:* to scale `radius` up or down based on scroll
    direction and amount, using **multiplicative scaling** (this
    lesson's own term) so the felt zoom speed stays proportional
    regardless of how close or far the camera currently is, and to
    clamp the result to a sane range so scrolling can't zoom through
    the target entirely or fly off to an unusably large distance.
  - *Depends on:* `radius` (Lesson 5) and `updateCamera()` (Lesson 5).
  - *Connects to:* calls `updateCamera()` after changing `radius`, the
    identical function `mousemove`'s own handler calls.
  - *Shape:* an independent event handler, alongside the drag handlers
    above — neither depends on the other, though both ultimately call
    the same shared `updateCamera()`.

---

## Concept Unit: Tracking Whether a Drag Is Happening

### The Problem

A `mousemove` event fires constantly — every time the cursor moves at
all, button held or not. Rotating the camera only while the mouse
button is actually held down needs some way to remember "is a drag
currently happening," across separate, independent calls to different
event handlers — `mousedown` sets that fact, `mousemove` reads it,
`mouseup` clears it, and none of the three run inside one another; each
fires whenever the browser decides to fire it.

> **Before reading on, try this yourself:** if `mousedown` sets some
> shared variable to `true`, and `mouseup` sets that same variable back
> to `false`, what would `mousemove`'s own handler need to check, right
> at its very start, to correctly do nothing at all when the mouse
> isn't currently being dragged?

### Introduce the Concept in Isolation

```javascript
// Throwaway lab: a simple state machine tracking whether a drag is in progress
let dragging = false;
let lastX = 0;

function onMouseDown(x) {
    dragging = true;
    lastX = x;
    console.log("down at", x, "-> dragging:", dragging);
}

function onMouseMove(x) {
    if (!dragging) {
        console.log("move at", x, "-> ignored (not dragging)");
        return;
    }
    const dx = x - lastX;
    lastX = x;
    console.log("move at", x, "-> dx:", dx);
}

function onMouseUp() {
    dragging = false;
    console.log("up -> dragging:", dragging);
}

onMouseMove(50);
onMouseDown(100);
onMouseMove(130);
onMouseMove(115);
onMouseUp();
onMouseMove(200);
```

Real output:

```
move at 50 -> ignored (not dragging)
down at 100 -> dragging: true
move at 130 -> dx: 30
move at 115 -> dx: -15
up -> dragging: false
move at 200 -> ignored (not dragging)
```

The very first `onMouseMove(50)` — before any `onMouseDown` at all —
is correctly ignored, `dragging` still `false` from its initial
declaration. Once `onMouseDown(100)` runs, `dragging` becomes `true`
and every subsequent move is tracked: `dx: 30` (moved from `100` to
`130`), then `dx: -15` (moved back from `130` to `115`) — each `dx`
computed against the *previous* remembered position, not the original
starting one, and `lastX` updated every time so the next delta is
always measured from wherever the cursor most recently was. After
`onMouseUp()`, the final `onMouseMove(200)` is ignored again — directly
confirming this Concept Unit's own Socratic prompt's answer: checking
the shared `dragging` flag first, and returning immediately if it's
`false`, is exactly what makes the rest of the handler's logic only run
during a real drag.

### Discard the Throwaway Example

This scratch `onMouseDown`/`onMouseMove`/`onMouseUp` lab is discarded
now — the real project version, confirmed in this lesson's final
Concept Unit, uses real DOM events instead of plain function calls, but
the identical state-tracking logic.

### Project Change

- **Reference Source:** your own `mesh_viewer.html`, the
  `dragging`/`lastX`/`lastY` variables and the `mousedown`/`mouseup`/
  `mousemove` listeners attached to `renderer.domElement`/`window`.
- **Files affected:** none yet — the final Concept Unit builds the
  real, complete checkpoint.
- **Change type:** N/A.
- **Location:** N/A.
- **Dependencies:** N/A.

### The New Code

N/A for this Concept Unit — see this lesson's final Concept Unit for
the real project file.

### The Updated Project

N/A for this Concept Unit.

### Mechanical Walkthrough

- **`let dragging = false; let lastX = 0;`** — this lesson's own
  **drag state** (the term), two ordinary mutable variables, shared
  across all three handler functions by being declared outside any one
  of them.
- **`function onMouseDown(x) { dragging = true; lastX = x; ... }`** —
  setting the drag flag `true`, and remembering the *starting* position
  — the first `lastX` value any subsequent `dx` calculation will be
  measured against.
- **`function onMouseMove(x) { if (!dragging) return; ... }`** — the
  guard clause directly answering this Concept Unit's own Socratic
  prompt: exit immediately, doing nothing else, unless a drag is
  actually in progress.
- **`const dx = x - lastX; lastX = x;`** — computing this lesson's own
  **pixel delta** against the *previous* remembered position, then
  immediately updating that remembered position — so the *next* call's
  own `dx` measures from here, not from the original drag start.
- **`function onMouseUp() { dragging = false; ... }`** — clearing the
  flag, so any further `onMouseMove` calls go back to being ignored,
  exactly as they were before the drag began.

### CS Lens

This is a **finite state machine** (informally) — a system with a
small number of distinct states (here: "dragging" and "not dragging"),
transitioning between them only in response to specific events
(`mousedown` → dragging, `mouseup` → not dragging), with behavior
elsewhere (`mousemove`) depending on which state currently holds.

Also recognized in: a traffic light (red/yellow/green, transitioning on
a timer, not on mouse events, but the identical "current state
determines behavior, specific events transition between states" shape);
a text field's own focus state (whether keystrokes should be captured
by it at all depends on whether it's currently focused — set/cleared by
separate click and blur events, structurally identical to this
lesson's own drag/not-drag states); network protocol connection states
(connecting, connected, disconnecting, disconnected — each transition
triggered by a specific event, behavior gated by current state).

### SE Lens

The principle is **making implicit state explicit**, rather than trying
to infer "is a drag happening" from something indirect (like checking
whether *any* mouse buttons are currently reported pressed inside
`mousemove` itself, which real browser APIs do actually expose via
`e.buttons`, but which conflates "some button is down" with "a drag was
deliberately started on this element," a real, meaningful difference).
A dedicated `dragging` flag, set and cleared by the exact events that
should start and end a drag, states the intent directly rather than
reconstructing it from a more general signal.

The alternative not chosen: skip the `dragging` flag entirely, and
just always compute `dx`/`dy` from every `mousemove`, rotating the
camera on *any* mouse movement over the canvas, click or no click. That
would remove the need for `mousedown`/`mouseup` handlers at all — but
it would also mean simply moving the mouse across the viewer, with no
intention of rotating anything, would constantly spin the camera —
almost certainly not the behavior any real user of a 3D viewer
actually wants.

### Commands Needed

None — this Concept Unit's code is throwaway-lab-only.

### Run It

Already shown above — the throwaway lab is this Concept Unit's own
complete execution.

### Connect

Drag state is tracked correctly. The next Concept Unit looks at what
actually happens with a pixel delta once one is captured during a real
drag — turning it into an angle change, and handling the one hard limit
already built into your existing tool's own `phi` clamp.

---

## Concept Unit: Pixel Deltas to Angle Deltas, and the `phi` Clamp

### The Problem

A raw pixel delta (say, `30` pixels of horizontal mouse movement) isn't
itself a meaningful angle — nothing so far has translated "the mouse
moved this many pixels" into "the camera should rotate by this many
radians." And `phi` (Lesson 5's own polar angle) can't be allowed to
reach exactly `0` or exactly `180°` during that rotation — at those
exact values, this lesson's own Concept Unit later shows, the
horizontal circle `theta` moves around shrinks to a single point,
making further `theta` changes visually meaningless at exactly that
instant.

> **Before reading on, try this yourself:** if a pixel delta is just
> multiplied by a small constant to become a radian delta, what would
> you expect happens to the felt rotation speed if that constant were
> doubled? And separately: if `phi` needs to stay strictly between `0`
> and `Math.PI` (never touching either exact endpoint), what combination
> of `Math.max`/`Math.min` — both already familiar — would enforce
> that, given a lower bound and an upper bound both slightly inside the
> true `0`/`Math.PI` limits?

### Introduce the Concept in Isolation

```javascript
// Throwaway lab: turning a pixel-distance drag into a small angle change, then clamping phi
const sensitivity = 0.006;

function angleDelta(pixelDelta) {
    return pixelDelta * sensitivity;
}

console.log(angleDelta(100));
console.log(angleDelta(-50));

function clampPhi(phi) {
    return Math.max(0.05, Math.min(Math.PI - 0.05, phi));
}

console.log(clampPhi(-2));
console.log(clampPhi(0.02));
console.log(clampPhi(1.5));
console.log(clampPhi(Math.PI));
console.log(clampPhi(10));
```

Real output:

```
0.6
-0.3
0.05
0.05
1.5
3.0915926535897933
3.0915926535897933
```

`angleDelta(100)` gives `0.6` radians — `100 * 0.006` — this lesson's
own **sensitivity** (the term) converting a real pixel count into a
real, small angle change; `angleDelta(-50)` correctly gives a negative
angle, `-0.3`, for a drag in the opposite direction. `clampPhi`, tested
against five deliberately varied inputs — from `-2` (nonsense, mouse
dragged far past any real limit) through the two true limits and safely
past the upper one — never returns anything below `0.05` or above
`Math.PI - 0.05` (roughly `3.0916`), confirmed directly: even wildly
out-of-range inputs like `-2` or `10` land exactly on one of the two
clamped bounds, never anything more extreme.

### Discard the Throwaway Example

This `angleDelta`/`clampPhi` lab is discarded now — the real project
version, confirmed next, applies both directly inside a real
`mousemove` handler.

### Project Change

- **Reference Source:** your own `mesh_viewer.html`'s own `mousemove`
  handler — `theta -= dx * 0.006; phi -= dy * 0.006; phi = Math.max(0.05, Math.min(Math.PI - 0.05, phi));`.
- **Files affected:** none yet — the final Concept Unit builds the
  real, complete checkpoint.
- **Change type:** N/A.
- **Location:** N/A.
- **Dependencies:** N/A.

### The New Code

N/A for this Concept Unit — see this lesson's final Concept Unit.

### The Updated Project

N/A for this Concept Unit.

### Mechanical Walkthrough

- **`const sensitivity = 0.006;`** — a single named constant (this
  lesson's own term), the same numeric value your own tool already
  uses — a real, tunable design choice, not a value with any deeper
  mathematical meaning.
- **`function angleDelta(pixelDelta) { return pixelDelta * sensitivity; }`**
  — ordinary multiplication, converting a raw pixel count into a
  proportionally small angle.
- **`function clampPhi(phi) { return Math.max(0.05, Math.min(Math.PI - 0.05, phi)); }`**
  — `Math.min(Math.PI - 0.05, phi)` first caps `phi` from above (never
  more than `Math.PI - 0.05`); `Math.max(0.05, ...)` then caps the
  *result of that* from below (never less than `0.05`) — the two
  nested calls together implement "clamp to a range" using only
  `Math.max`/`Math.min`, each individually familiar, combined in this
  specific nested order to enforce both bounds at once.
- **`0.05` and `Math.PI - 0.05`** — deliberately *not* exactly `0` and
  `Math.PI` — a small safety margin, so `phi` never reaches the true
  mathematical poles where, as this lesson's own Problem section
  already previewed, the horizontal circle's own radius shrinks toward
  zero and further `theta` rotation becomes visually meaningless (a
  degenerate case worth naming now, even though its full consequences
  are next lesson's own dedicated subject).

### CS Lens

This is **input scaling and clamping** — two genuinely separate
operations, easy to blur together: scaling converts one unit (pixels)
into another (radians) at a chosen rate; clamping enforces a valid
range on the *result*, entirely independent of how that result was
produced. The identical two-step shape — convert, then constrain —
recurs any time raw input needs to drive a value that has real limits.

Also recognized in: audio volume controls (converting a UI slider's
raw pixel or percentage position into a decibel or amplitude value,
then clamping to the hardware's own safe range); game character
movement (converting joystick tilt into a movement speed, then
clamping to a maximum run speed); temperature control systems
(converting a dial's position into a target temperature, then clamping
to a safe operating range regardless of what the dial itself allows
mechanically).

### SE Lens

The principle is **defending against invalid state at the exact point
it could be introduced**, rather than hoping the input driving that
state stays reasonable on its own. A user can drag the mouse an
arbitrarily large distance in one motion, or scroll unpredictably fast
— nothing about raw pixel deltas guarantees a "reasonable" resulting
`phi`; the clamp is what actually guarantees it, unconditionally, no
matter how extreme the input.

The alternative not chosen: trust that real mouse movement will never
actually push `phi` all the way to a true pole in practice, and skip
the clamp entirely. For slow, careful dragging that might even mostly
hold — but a single fast, large mouse movement (entirely plausible,
real user behavior) could push `phi` straight past `0` or `Math.PI`
with nothing stopping it, and this lesson's own next Concept Unit
(and Lesson 7, in more depth) will show directly what actually goes
wrong once that happens.

### Commands Needed

None — this Concept Unit's code is throwaway-lab-only.

### Run It

Already shown above — the throwaway lab is this Concept Unit's own
complete execution.

### Connect

Pixel deltas now become real, safely-bounded angle changes. The final
Concept Unit wires all of this lesson's pieces — drag state, angle
conversion, the `phi` clamp, and a wheel-driven zoom — into your own
tool's actual, complete mouse-interaction behavior, replacing Lesson
5's automatic drift entirely.

---

## Concept Unit: Assembling Real Mouse and Wheel Control

### The Problem

Lesson 5's checkpoint orbits automatically, with no user input at all.
Nothing built so far in this curriculum responds to a real mouse drag
or scroll. This Concept Unit replaces the automatic `theta`/`phi`
drift with this lesson's own drag-state tracking and angle conversion,
and adds a wheel handler controlling `radius` — reaching full parity
with your own existing tool's actual interaction.

> **Before reading on, try this yourself:** Lesson 5's own SE Lens
> already predicted this moment: `updateCamera()` itself shouldn't need
> to change at all — only *what calls it, and why* changes, from an
> automatic per-frame increment to real event handlers. Given that,
> what do you expect to actually change in `step13_spherical_orbit.html`
> to produce this lesson's own checkpoint — more, or less, than you
> might have guessed?

### Introduce the Concept in Isolation

No new throwaway lab for this Concept Unit: drag-state tracking and
angle-delta conversion (including the `phi` clamp) were both already
fully isolated and proven in this lesson's own previous two Concept
Units. What's new here is only the combination — real DOM events,
calling the identical `updateCamera()` from Lesson 5, plus a new wheel
handler for zoom, verified below with its own real math before being
wired in.

### A Small Aside, Verified for Real: Why Zoom Uses Multiplication, Not Addition

```javascript
// Throwaway lab: multiplicative zoom feels consistent; additive zoom does not
function multiplicativeZoom(radius, wheelDelta) {
    return radius * (1 + wheelDelta * 0.001);
}
function additiveZoom(radius, wheelDelta) {
    return radius + wheelDelta * 0.01;
}

console.log("multiplicative, close:", multiplicativeZoom(2, 100));
console.log("multiplicative, far:  ", multiplicativeZoom(200, 100));
console.log("as % change, close:", (multiplicativeZoom(2, 100) - 2) / 2);
console.log("as % change, far:  ", (multiplicativeZoom(200, 100) - 200) / 200);

console.log("additive, close:", additiveZoom(2, 100));
console.log("additive, far:  ", additiveZoom(200, 100));
```

Real output:

```
multiplicative, close: 2.2
multiplicative, far:   220.00000000000003
as % change, close: 0.10000000000000009
as % change, far:   0.10000000000000014
additive, close: 3
additive, far:   201
```

The identical scroll amount (`wheelDelta = 100`), applied when close
(`radius = 2`) versus far (`radius = 200`): **multiplicative** scaling
produces the *same relative* change both times — `10%` either way,
confirmed directly (`0.10000000000000009` and `0.10000000000000014`
are the same `10%`, differing only by ordinary floating-point rounding
noise). **Additive** scaling, by contrast, adds a fixed `1` unit either
way — a `50%` jump when close (`2 → 3`) but a barely-noticeable
`0.5%` jump when far (`200 → 201`) — the exact inconsistency
`radius *= (1 + e.deltaY * 0.001)` in your own tool's real code avoids
by using multiplication instead of addition.

### Project Change

- **Reference Source:** your own `mesh_viewer.html`'s complete
  `dragging`/`lastX`/`lastY` state, `mousedown`/`mouseup`/`mousemove`/
  `wheel` handlers, alongside `updateCamera()` from Lesson 5 — this
  Concept Unit reproduces the entire interaction, faithfully.
- **Files affected:** create `src/step14_mouse_orbit.html`.
- **Change type:** add.
- **Location:** N/A — brand-new file.
- **Dependencies:** everything from Lesson 5 (spherical coordinates,
  `updateCamera`), plus this lesson's own first two Concept Units.

### The New Code

Type this into `src/step14_mouse_orbit.html` — Lesson 5's own scene and
`updateCamera()`, with the automatic drift removed from `animate()` and
real mouse/wheel handlers added instead:

```html
<!DOCTYPE html>
<html>
<head>
<style>body { margin: 0; }</style>
<script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>
</head>
<body>
<script>
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x16181c);

  const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);

  const renderer = new THREE.WebGLRenderer();
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);
  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  const ambient = new THREE.AmbientLight(0xffffff, 0.5);
  scene.add(ambient);
  const light = new THREE.DirectionalLight(0xffffff, 0.9);
  camera.add(light);
  scene.add(camera);

  function makeBox(sx, sy, sz, py, color) {
    const hx = sx / 2, hy = sy / 2, hz = sz / 2;
    const positions = [
      -hx, py - hy, -hz,  hx, py - hy, -hz,  hx, py + hy, -hz,  -hx, py + hy, -hz,
      -hx, py - hy,  hz,  hx, py - hy,  hz,  hx, py + hy,  hz,  -hx, py + hy,  hz,
    ];
    const colors = [];
    for (let i = 0; i < 8; i++) colors.push(...color);
    const indices = [
      0,1,2, 0,2,3,   4,6,5, 4,7,6,   0,4,5, 0,5,1,
      1,5,6, 1,6,2,   2,6,7, 2,7,3,   3,7,4, 3,4,0,
    ];
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    geometry.setIndex(indices);
    geometry.computeVertexNormals();
    const material = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.85, side: THREE.DoubleSide });
    return new THREE.Mesh(geometry, material);
  }

  scene.add(makeBox(3, 0.3, 3, 0,   [0.3, 0.4, 1]));
  scene.add(makeBox(0.6, 2, 0.6, 1, [1, 0.3, 0.3]));

  const target = new THREE.Vector3(0, 0.5, 0);
  let radius = 6, theta = 0, phi = Math.PI / 3;

  function updateCamera() {
    const sinPhi = Math.sin(phi);
    camera.position.set(
      target.x + radius * sinPhi * Math.sin(theta),
      target.y + radius * Math.cos(phi),
      target.z + radius * sinPhi * Math.cos(theta)
    );
    camera.lookAt(target);
  }
  updateCamera();

  let dragging = false, lastX = 0, lastY = 0;

  renderer.domElement.addEventListener('mousedown', (e) => {
    dragging = true;
    lastX = e.clientX;
    lastY = e.clientY;
  });
  window.addEventListener('mouseup', () => { dragging = false; });
  window.addEventListener('mousemove', (e) => {
    if (!dragging) return;
    const dx = e.clientX - lastX;
    const dy = e.clientY - lastY;
    lastX = e.clientX;
    lastY = e.clientY;

    theta -= dx * 0.006;
    phi -= dy * 0.006;
    phi = Math.max(0.05, Math.min(Math.PI - 0.05, phi));
    updateCamera();
  });

  renderer.domElement.addEventListener('wheel', (e) => {
    e.preventDefault();
    radius *= (1 + e.deltaY * 0.001);
    radius = Math.max(1, Math.min(30, radius));
    updateCamera();
  }, { passive: false });

  function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
  }
  animate();
</script>
</body>
</html>
```

### The Updated Project

The real, actual difference from Lesson 5's own `step13_spherical_orbit.html`
— directly answering this Concept Unit's own Socratic prompt — is
smaller than it might seem: `updateCamera()` (Lesson 5) is completely
unchanged, called once up front to set an initial view; `animate()`
loses its own `theta +=`/`phi =` lines entirely (nothing drives them
automatically anymore); and everything else in this file is new
event-handler code, added rather than modifying what Lesson 5 already
built.

### Mechanical Walkthrough

- **`updateCamera();`** (called once, right after being defined, before
  any event has fired) — establishing a real starting view immediately,
  rather than leaving the camera at Three.js's own default position
  until the first drag happens.
- **The `dragging`/`lastX`/`lastY` declarations and the three
  `mousedown`/`mouseup`/`mousemove` handlers** — the exact shape from
  this lesson's own first Concept Unit's throwaway lab, now attached to
  real DOM events (`renderer.domElement.addEventListener(...)` for
  `mousedown` — restricting drag-starting to clicks actually on the
  canvas — and `window.addEventListener(...)` for `mouseup`/`mousemove`
  — deliberately *not* restricted to the canvas, so a drag that moves
  the cursor outside the canvas mid-drag, or releases the mouse button
  there, still correctly updates/ends) rather than plain function
  calls.
- **`theta -= dx * 0.006; phi -= dy * 0.006; phi = Math.max(0.05, Math.min(Math.PI - 0.05, phi));`**
  — this lesson's own second Concept Unit's exact formula and clamp,
  now actually changing the real `theta`/`phi` variables `updateCamera()`
  reads.
- **`updateCamera();`** (inside `mousemove`) — calling the identical
  function from Lesson 5 again, immediately after `theta`/`phi` change
  — the camera's actual position only ever updates here, or inside the
  `wheel` handler below, or that one initial call — never inside
  `animate()` itself anymore.
- **The `wheel` handler** — `e.preventDefault()` (this lesson's own
  term, stopping the browser's own default page-scroll behavior);
  `radius *= (1 + e.deltaY * 0.001)` — this lesson's own verified
  multiplicative scaling; `radius = Math.max(1, Math.min(30, radius))`
  — the identical clamp *shape* as `clampPhi`, applied to a different
  variable with different bounds, preventing the camera from zooming
  through the target entirely or flying arbitrarily far away.
- **`function animate() { requestAnimationFrame(animate); renderer.render(scene, camera); }`**
  — Lesson 1's own render loop, now doing *only* rendering — no camera
  logic lives inside it at all anymore, exactly the separation Lesson
  5's own SE Lens predicted would make this exact change simple.

### CS Lens

This is **event-driven programming**, as opposed to the purely
**frame-driven** (polling) approach Lesson 5's own checkpoint used —
camera updates now happen only in direct response to real input events,
whenever the browser actually delivers them, rather than on a fixed,
continuous per-frame schedule regardless of whether anything changed.

Also recognized in: essentially every interactive GUI application ever
built — buttons, sliders, drag-and-drop interfaces all respond to
discrete events rather than continuously polling "has anything
changed"; reactive programming frameworks (a broader software pattern
built entirely around "recompute only when something relevant actually
changes," the same underlying idea applied far beyond mouse input);
real game engines commonly combine both models simultaneously, exactly
as this lesson's checkpoint now does — a continuous render loop
(Lesson 1) alongside event-driven input handling feeding state that
loop reads.

### SE Lens

The principle is **updating state only when it actually changes**,
rather than recomputing a camera position every single frame regardless
of whether any input occurred — a real, if today extremely minor,
efficiency difference from Lesson 5's own always-updating checkpoint,
and, more importantly, the *architecturally correct* place for this
logic to live: camera position is now a direct function of real user
intent (a drag, a scroll), not an independent animation running
alongside whatever the user does.

The alternative not chosen: keep calling `updateCamera()` unconditionally
inside `animate()`, every frame, regardless of whether `theta`/`phi`/
`radius` changed since the last frame — harmless for this specific
function (calling it twice with unchanged inputs just produces the
identical camera position twice), but a habit that doesn't generalize
well: for a more expensive per-frame operation than this one, needlessly
repeating work that produced no actual change would be a real,
avoidable cost.

### Commands Needed

None new.

### Run It — Yourself, in Your Own Browser

Open `src/step14_mouse_orbit.html`. Click and drag anywhere on the
canvas — the camera should rotate horizontally and vertically following
your drag, exactly like your own existing tool. Scroll to zoom in and
out — closer scrolling should feel proportionally similar to farther
scrolling, the real, felt consequence of this lesson's own verified
multiplicative-scaling math. Try dragging vertically as far as you can
in one direction — the camera should stop rotating further once `phi`
hits its clamp, rather than flipping past vertical or behaving
unpredictably.

### Connect

Phase B is complete. Every piece of your own existing tool's camera
system is now understood, end to end: the scene graph and render loop
(Lesson 1), geometry and materials (Lessons 2-3), the frustum and
perspective divide (Lesson 4), the spherical orbit formula (Lesson 5),
and now real mouse/wheel control, faithfully rebuilt. That `phi` clamp
you just felt firsthand — hitting a hard stop rather than rotating
freely past vertical — is exactly the real limitation Phase C exists to
overcome. The next lesson examines that limitation directly and
honestly, before building something genuinely better.

---

## Connect the Pieces

One drag, traced through every piece this lesson built: a `mousedown`
sets `dragging = true` and remembers the cursor's starting position
(first Concept Unit's own state machine, now real DOM events). Each
subsequent `mousemove`, while `dragging` stays `true`, computes a pixel
delta against the *previous* event's position, converts it into a small
angle change via this lesson's own verified `sensitivity` multiplication
(second Concept Unit), and clamps `phi` so it can never quite reach a
true pole. `updateCamera()` — Lesson 5's own verified spherical-to-
Cartesian formula, completely unmodified — runs again with the new
`theta`/`phi`, moving the real Three.js camera. A `wheel` event,
independently, scales `radius` multiplicatively (this lesson's own
verified choice over a fixed additive amount) and calls the identical
`updateCamera()` once more. `mouseup` ends the drag. Every piece —
event handling, angle conversion, clamping, the unchanged orbit
formula — working together, produces the real, interactive camera
control your own tool has had the whole time, now fully understood
rather than simply copied.

---

## Try It Yourself

Type `src/step14_mouse_orbit.html` yourself (not copy-pasted), and
confirm the `Run It` checkpoint above with real dragging and scrolling.
Then, once that's working, try changing `sensitivity` from `0.006` to
something much larger (say, `0.02`) and reload — feel directly how much
more rotation the same physical mouse movement now produces, connecting
what you feel back to this lesson's own `angleDelta` formula and its
real, executed numbers.
