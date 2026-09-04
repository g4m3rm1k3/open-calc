# Lesson 5: Orbit Cameras — Spherical Coordinates

**What you will build:** the exact `theta`/`phi`/`radius` → camera-position
formula already sitting in your own `mesh_viewer.html`'s `updateCamera()`
function — derived from scratch, verified with real, executed math
against known reference points, and confirmed visually in your own
browser. This is the first lesson in this curriculum that explains
*your own existing code*, not just Three.js concepts in the abstract.

**What you need to know first:** Lessons 1-4 in full — `Object3D`/
`.position` (Lesson 1), `BufferGeometry`/materials (Lessons 2-3), and
the frustum/perspective divide (Lesson 4).

**Terms used in this lesson:**
- **spherical coordinates** — describing a position using an angle-and-
  distance system (radius, and two angles) instead of a direct `x, y,
  z` offset. It exists because "orbit around a fixed point, always at
  the same distance" is an extremely natural thing to want a camera to
  do, and spherical coordinates make that constraint automatic —
  changing an angle can never accidentally change the distance, the way
  directly editing `x`/`y`/`z` by hand easily could.
- **radius** — the distance from the orbit's own center (this lesson's
  own **target**) to the camera — one of the three spherical
  coordinates.
- **theta (azimuthal angle)** — the angle of rotation *around* the
  vertical axis — like spinning around a maypole while staying the same
  distance from it. Increasing `theta` orbits the camera horizontally.
- **phi (polar angle)** — the angle measured *down* from the vertical
  axis's own "north pole" — `phi = 0` sits directly above the target,
  `phi = 90°` sits level with it (on the "equator"), `phi = 180°` sits
  directly below.
- **target** — the fixed point the camera orbits around — not
  necessarily the origin; your own tool sets it to a loaded mesh's own
  bounding-box center.
- **`camera.lookAt(point)`** — an `Object3D` method (inherited by every
  camera, mesh, or other scene-graph object) that automatically
  computes and applies whatever rotation makes that object's own
  forward direction point exactly at `point`. It exists so you never
  have to compute a rotation by hand just to make something face a
  specific target — a real, common need this method solves once, for
  any object.

**Objects and methods used:**

- **the spherical-to-Cartesian conversion**
  - *What it is:* the actual formula turning `(radius, theta, phi)`
    into an `(x, y, z)` position.
  - *Implementation:*
    ```
    const sinPhi = Math.sin(phi);
    const x = radius * sinPhi * Math.sin(theta);
    const y = radius * Math.cos(phi);
    const z = radius * sinPhi * Math.cos(theta);
    ```
    — three ordinary numbers in, three ordinary numbers out; no
    Three.js class involved in the computation itself.
  - *Its use:* the exact formula your own `mesh_viewer.html`'s
    `updateCamera()` function already uses, offset by `target`'s own
    position.
  - *Type:* plain arithmetic — this lesson's own point is that there's
    no hidden magic here, just trigonometry.
  - *Responsibility:* to guarantee the resulting point is always
    exactly `radius` away from the origin, for *any* `theta`/`phi` —
    verified directly, for real, later in this lesson.
  - *Depends on:* `Math.sin`/`Math.cos` (standard JavaScript, already
    familiar).
  - *Connects to:* the result is assigned to `camera.position` (Lesson
    1's own `Object3D.position`) before `camera.lookAt(target)` is
    called.
  - *Shape:* pure math, sitting entirely outside Three.js's own
    classes — the actual "camera orbiting" behavior your tool has is
    not a Three.js feature at all; it's this formula, called every
    frame, moving an ordinary `Object3D.position`.

- **`camera.lookAt(target)`**
  - *What it is:* an `Object3D` method that orients an object to face a
    given point.
  - *Implementation:* `camera.lookAt(x, y, z)` or `camera.lookAt(vector3)`
    — computes the direction from the camera's *current* position to
    the target, and sets the camera's own rotation so its forward
    direction matches that.
  - *Its use:* called every time `updateCamera()` runs, immediately
    after setting `camera.position` — without it, the camera would
    move to the correct orbiting position but keep facing whatever
    direction it faced before, not the target at all.
  - *Type:* an inherited `Object3D` method — available on any
    scene-graph object, not just cameras (a mesh can `lookAt()` a point
    too, useful for things like billboarded sprites or turret-style
    aiming).
  - *Responsibility:* to handle the actual rotation math needed to
    face a point, so calling code never has to compute a rotation by
    hand.
  - *Depends on:* the object's own *current* `.position` (it must
    already be set correctly — `lookAt` computes a direction *from*
    wherever the object currently is *to* the target) and the target
    point.
  - *Connects to:* called after `camera.position` is set, every frame,
    in this lesson's own `updateCamera()`.
  - *Shape:* the one piece of this lesson's whole orbit mechanism that
    *is* built into Three.js, rather than plain arithmetic you write
    yourself — everything else (theta, phi, radius, the conversion
    formula) is ordinary numbers and math with no Three.js involvement
    at all until the very last step.

---

## Concept Unit: Describing a Position by Angle, Not Offset

### The Problem

Nothing built so far in this curriculum has ever moved a camera except
by directly setting `.position` to a fixed `(x, y, z)`. An orbiting
camera needs something different: a way to move *around* a fixed point,
always at the same distance, changeable by simple, independent
controls (rotate horizontally, rotate vertically, zoom) — none of which
map cleanly onto directly editing `x`, `y`, `z` by hand.

> **Before reading on, try this yourself:** if you wanted a camera to
> always stay exactly `6` units from a fixed target, no matter which
> direction it's currently facing that target from, would directly
> setting `camera.position.x += 0.1` (say, to "rotate" a little) keep
> that guarantee true? What property would a *different* way of
> describing "where the camera is" need to have, so that changing "which
> direction" never accidentally also changes "how far"?

### Introduce the Concept in Isolation

```javascript
// Throwaway lab: describing a position by angle-and-distance instead of x/y/z offsets
function sphericalToCartesian(radius, theta, phi) {
    const sinPhi = Math.sin(phi);
    return {
        x: radius * sinPhi * Math.sin(theta),
        y: radius * Math.cos(phi),
        z: radius * sinPhi * Math.cos(theta),
    };
}

console.log(sphericalToCartesian(5, 0, Math.PI / 2));
console.log(sphericalToCartesian(5, 0, 0));
console.log(sphericalToCartesian(5, 0, Math.PI));
```

Real output:

```
{ x: 0, y: 3.061616997868383e-16, z: 5 }
{ x: 0, y: 5, z: 0 }
{ x: 0, y: -5, z: 6.123233995736766e-16 }
```

Three checkable reference points, each with `theta = 0` and a different
`phi`: `phi = 90°` (`Math.PI/2`) lands at `(0, ~0, 5)` — on the
"equator," height essentially zero (this lesson's own **phi** term),
`z` equal to the full `radius`; `phi = 0` lands at `(0, 5, 0)` — the
"north pole," directly above, height equal to the full radius; `phi =
180°` lands at `(0, -5, ~0)` — the "south pole," directly below. The
tiny non-zero values (`3.06e-16`, `6.12e-16`) aren't bugs — they're
ordinary floating-point rounding, because `Math.PI` itself is only an
approximation of the true, irrational value of π, so `Math.sin`/`Math.cos`
evaluated at `Math.PI/2` don't land on *exactly* `0`/`1` the way true
mathematical sine/cosine would — a real, harmless artifact worth
recognizing rather than being confused by, the same category of
floating-point imprecision your Python curriculum's own `__eq__` SE
Lens already flagged in a completely different context.

### Discard the Throwaway Example

This `sphericalToCartesian` function is discarded now, in name only —
the next Concept Unit verifies the real property (constant radius,
regardless of angle) that makes this whole approach worth using in the
first place, using the identical formula.

### Project Change

- **Reference Source:** your own `mesh_viewer.html`'s `updateCamera`
  function, in full — the entire body of this lesson's own
  Header-listed "spherical-to-Cartesian conversion."
- **Files affected:** none yet — this Concept Unit's own idea is
  conceptual, confirmed with the throwaway lab; the next Concept Unit
  verifies the actual property that matters, and the final Concept
  Unit builds the real, rendered checkpoint.
- **Change type:** N/A.
- **Location:** N/A.
- **Dependencies:** N/A.

### The New Code

N/A for this Concept Unit — see the next Concept Unit for the real
verification, and the final one for the real project file.

### The Updated Project

N/A for this Concept Unit, for the same reason.

### Mechanical Walkthrough

- **`const sinPhi = Math.sin(phi);`** — computed once and reused twice
  below (for both `x` and `z`) rather than calling `Math.sin(phi)`
  twice — a small, real efficiency choice, not a new concept.
- **`x: radius * sinPhi * Math.sin(theta)`** and
  **`z: radius * sinPhi * Math.cos(theta)`** — together, these two
  lines place the point on a horizontal circle of radius
  `radius * sinPhi` (smaller near the poles, where `sinPhi` approaches
  `0`; largest at the equator, `phi = 90°`, where `sinPhi = 1`) — the
  actual reason `phi` near `0` or `180°` (the poles) makes `theta`
  matter less and less: the horizontal circle you're spinning around at
  those angles shrinks toward a single point.
- **`y: radius * Math.cos(phi)`** — the height above (or below) the
  target's own horizontal plane — maximal (`+radius`) at `phi = 0`
  (this lesson's own "north pole"), zero at `phi = 90°`, minimal
  (`-radius`) at `phi = 180°`.

### CS Lens

This is the **spherical coordinate system** (this lesson's own term,
in full) — one of several standard ways (alongside Cartesian and
cylindrical) to describe a position in 3D space, chosen here
specifically because it makes "constant distance from a point" a
structural guarantee rather than something that has to be separately
enforced.

Also recognized in: GPS and geographic coordinates (latitude and
longitude are literally spherical coordinates on the surface of the
Earth, with the Earth's own radius playing the role of this lesson's
`radius`); astronomy (a star's position is commonly described by right
ascension and declination — spherical coordinates centered on Earth);
any "arcball" or "trackball" 3D interface — not just cameras — where an
object needs to be rotated freely around a fixed center.

### SE Lens

The principle is **choosing a representation that makes the invariant
you care about automatic**, rather than one that technically allows
the same states but requires extra care to keep a constraint true.
Cartesian `x`/`y`/`z` *can* represent every point spherical coordinates
can — but nothing about three independent numbers naturally keeps their
combined distance from a center point fixed; spherical coordinates make
that the *default*, not something you have to remember to check.

The alternative not chosen: keep the camera's position in ordinary
`x`/`y`/`z`, and implement "orbit" as a rotation applied to that
Cartesian position each frame (multiplying by a rotation matrix, or
using a quaternion — Phase C's own eventual subject). That approach is
real and, as Phase C will show, actually necessary for true free
rotation — but for a constrained orbit (always looking at one fixed
target, moving only in the two directions `theta`/`phi` allow),
spherical coordinates are simpler to reason about and implement
directly, which is exactly why your own existing tool uses them.

### Commands Needed

None — this Concept Unit's code is throwaway-lab-only.

### Run It

Already shown above — the throwaway lab is this Concept Unit's own
complete execution.

### Connect

Three reference points are confirmed correct. The next Concept Unit
verifies the actual property that makes this whole approach worth
using: that *every* `theta`/`phi` combination, not just these three
special cases, produces a point exactly `radius` away.

---

## Concept Unit: Verifying the Invariant — Radius Never Changes

### The Problem

Three special-case reference points (poles and equator) aren't enough
to trust a formula for *every* angle a real, freely-orbiting camera
will actually use. The whole reason spherical coordinates were chosen
over direct `x`/`y`/`z` editing (this lesson's own first Concept Unit)
was the promise that radius stays constant automatically — that claim
deserves real, direct verification, not just trust.

> **Before reading on, try this yourself:** if you computed
> `x*x + y*y + z*z` for a point produced by this lesson's own
> `sphericalToCartesian` formula, and then took the square root, what
> value would you expect back — for *any* `theta`/`phi` at all, not
> just the three special cases already checked?

### Introduce the Concept in Isolation

```javascript
// Throwaway lab: proving radius stays constant no matter what theta/phi are
function sphericalToCartesian(radius, theta, phi) {
    const sinPhi = Math.sin(phi);
    return {
        x: radius * sinPhi * Math.sin(theta),
        y: radius * Math.cos(phi),
        z: radius * sinPhi * Math.cos(theta),
    };
}

function length(p) {
    return Math.sqrt(p.x * p.x + p.y * p.y + p.z * p.z);
}

const radius = 7;
for (const theta of [0, 1, 2.5, 4]) {
    for (const phi of [0.3, 1.2, 2.0]) {
        const p = sphericalToCartesian(radius, theta, phi);
        console.log(theta.toFixed(1), phi.toFixed(1), "->", length(p).toFixed(6));
    }
}
```

Real output:

```
0.0 0.3 -> 7.000000
0.0 1.2 -> 7.000000
0.0 2.0 -> 7.000000
1.0 0.3 -> 7.000000
1.0 1.2 -> 7.000000
1.0 2.0 -> 7.000000
2.5 0.3 -> 7.000000
2.5 1.2 -> 7.000000
2.5 2.0 -> 7.000000
4.0 0.3 -> 7.000000
4.0 1.2 -> 7.000000
4.0 2.0 -> 7.000000
```

Twelve different `theta`/`phi` combinations, chosen with no particular
pattern, every single one producing a distance of exactly `7.000000` —
real, direct, repeated confirmation of exactly the property this
lesson's own first Concept Unit claimed: changing either angle can
never change the radius, because the formula's own structure makes
that geometrically impossible, not just empirically unlikely.

### Discard the Throwaway Example

This `length`/verification lab is discarded now — you now trust the
formula for real, executed reasons, not just because it was asserted.

### Project Change

- **Reference Source:** the same as this lesson's first Concept Unit —
  your own `mesh_viewer.html`'s `updateCamera` function.
- **Files affected:** none yet — the final Concept Unit builds the real
  project file.
- **Change type:** N/A.
- **Location:** N/A.
- **Dependencies:** N/A.

### The New Code

N/A for this Concept Unit, for the same reason as the previous one.

### The Updated Project

N/A for this Concept Unit.

### Mechanical Walkthrough

- **`function length(p) { return Math.sqrt(p.x * p.x + p.y * p.y + p.z * p.z); }`**
  — ordinary 3D vector length (the Pythagorean theorem extended to
  three dimensions) — the same underlying idea your Python curriculum's
  own vector work already covers in a different language, re-derived
  here fresh, in JavaScript, for this curriculum's own use.
- **the nested loops over `theta`/`phi`** — ordinary JavaScript `for...of`
  loops (already familiar), testing every combination of four `theta`
  values and three `phi` values — twelve total cases, chosen simply to
  cover a spread of angles rather than any special-case values.
- **`.toFixed(6)`** — ordinary JavaScript number formatting (already
  familiar), rounding the printed length to six decimal places purely
  so any genuine discrepancy (as opposed to harmless floating-point
  noise far smaller than that) would actually be visible in the output.

### CS Lens

This is a **mathematical invariant**, checked empirically — a property
that's true *by construction* (provable directly from the formula's own
algebra, using the trigonometric identity `sin²+cos² = 1`), here
confirmed the same way a test suite confirms code behaves as claimed:
not as a substitute for the proof, but as real, concrete evidence
alongside it.

Also recognized in: unit testing generally (asserting a function's
output satisfies some property across many inputs, not just one);
physics simulations (conservation laws — energy, momentum — are
invariants a correct simulation should never violate, and checking them
periodically is a standard way to catch a subtly broken simulation);
any geometric algorithm where "this operation shouldn't change X" is a
claimed guarantee worth spot-checking against real numbers, not just
trusting.

### SE Lens

The principle is **verifying a claimed guarantee directly**, rather
than trusting a formula purely because it was copied correctly from
somewhere. This Concept Unit's own real, executed test — twelve
different angle combinations, all producing exactly the same
radius — is meaningfully stronger evidence than the three special-case
points the previous Concept Unit checked, precisely because it wasn't
cherry-picked to already be likely to work.

The alternative not chosen: trust the formula because it visually
matches what's already sitting in `mesh_viewer.html`, without any
independent verification at all. That's a reasonable, common thing to
do when adapting known-working code — but this curriculum's whole
purpose is understanding *why* code works, not just confirming it was
transcribed correctly, which is exactly what real, executed
verification (here, and throughout both of your curricula) is for.

### Commands Needed

None — this Concept Unit's code is throwaway-lab-only.

### Run It

Already shown above — the throwaway lab is this Concept Unit's own
complete execution.

### Connect

The spherical-to-Cartesian formula is now verified, not just trusted —
real math, checked against real numbers, twice. The final Concept Unit
puts it to work for real: a camera that actually orbits a real target,
confirmed by watching it happen in your own browser.

---

## Concept Unit: Assembling a Real Orbiting Camera

### The Problem

Nothing built so far in this curriculum has moved a camera continuously,
based on changing angles, while always facing a fixed point. This
Concept Unit combines this lesson's own verified formula with
`camera.lookAt()` (this lesson's own Header term) into exactly that —
the real mechanism your own tool's mouse-drag interaction (next lesson)
will eventually drive.

> **Before reading on, try this yourself:** if `camera.position` is set
> using this lesson's own spherical-to-Cartesian formula, offset by a
> `target` point, what's the one additional call needed so the camera
> actually *faces* that target, rather than sitting at the right
> position but pointed in some unrelated direction?

### Introduce the Concept in Isolation

No new throwaway lab for this Concept Unit: the spherical-to-Cartesian
formula was already fully isolated and verified twice, in this lesson's
own previous two Concept Units. What's new here is only the
combination — a real Three.js camera, positioned by that formula, and
`camera.lookAt()` applied on top of it, animated continuously.

### Discard the Throwaway Example

Not applicable to this Concept Unit, for the reason stated above.

### Project Change

- **Reference Source:** your own `mesh_viewer.html`'s `updateCamera`
  function, called in full now, for real, for the first time in this
  curriculum.
- **Files affected:** create `src/step13_spherical_orbit.html`.
- **Change type:** add.
- **Location:** N/A — brand-new file.
- **Dependencies:** everything from Lessons 1-4 and this lesson's own
  verified formula.

### The New Code

Type this into `src/step13_spherical_orbit.html` — two simple shapes
(a flat base and an off-center tower, deliberately *not* symmetric, so
orbiting motion is actually visible rather than looking identical from
every angle) and a camera that continuously orbits them, animating
`theta` every frame and drifting `phi` up and down slowly:

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

  function animate() {
    requestAnimationFrame(animate);
    theta += 0.006;
    phi = Math.PI / 3 + Math.sin(theta * 0.5) * 0.4;
    updateCamera();
    renderer.render(scene, camera);
  }
  animate();
</script>
</body>
</html>
```

(a `side: THREE.DoubleSide` is included on the box material as a
defensive choice, since without a browser to actually check the box's
own triangle winding, this guarantees every face stays visible
regardless — worth knowing you have this option, even once winding is
understood.)

### The Updated Project

This is the whole new file — nothing larger to return to yet (full
content shown in The New Code above).

### Mechanical Walkthrough

- **`camera.add(light); scene.add(camera);`** — attaching the
  directional light as a *child* of the camera (Lesson 1's own scene
  graph term — anything can have children, not just `Scene` itself),
  so the light always shines from the camera's own current direction,
  regardless of where the camera has orbited to — without this, the
  light would stay fixed in world space while the camera moved around
  it, leaving some orbit angles unlit.
- **`const target = new THREE.Vector3(0, 0.5, 0);`** — this lesson's
  own **target** term, made real: a fixed point (not the world origin —
  slightly raised, roughly the tower's own midpoint) the camera will
  orbit around and always face.
- **`let radius = 6, theta = 0, phi = Math.PI / 3;`** — the three
  spherical coordinates (this lesson's own terms) as ordinary mutable
  variables — plain numbers, nothing Three.js-specific about any of
  them.
- **`function updateCamera() { ... }`** — this lesson's own verified
  formula, applied via `camera.position.set(...)` (the same method from
  Lesson 1), followed immediately by `camera.lookAt(target)` (this
  lesson's own term) — directly answering this Concept Unit's own
  Socratic prompt.
- **`theta += 0.006;`** — incrementing `theta` a small amount every
  single frame — since the render loop (Lesson 1) runs roughly 60
  times a second, this produces smooth, continuous horizontal orbiting
  rather than an instant jump.
- **`phi = Math.PI / 3 + Math.sin(theta * 0.5) * 0.4;`** — `phi`
  oscillating smoothly between two bounds over time (`Math.sin` of a
  slowly-changing value, scaled and offset) — purely so this
  checkpoint's own vertical angle changes too, not just the horizontal
  one, without needing any mouse interaction yet.

### CS Lens

This is **procedural camera animation** — driving a camera's position
entirely from a formula evaluated fresh every frame, rather than
pre-recorded keyframes or direct manual control — the identical
underlying idea any orbiting, circling, or programmatically-driven
camera motion in games or visualization tools uses, whether the actual
motion is this simple sine-wave drift or something far more elaborate.

Also recognized in: planetarium and orbital simulation software
(literally animating positions via the same kind of periodic,
angle-based formulas); any "auto-rotate" feature in a 3D product viewer
(many e-commerce product pages use exactly this technique — a slowly
incrementing `theta`, no user input needed — before a user's own mouse
interaction takes over, exactly the handoff Lesson 6 will build);
procedural animation in games more broadly (a patrolling enemy's
back-and-forth movement, a bobbing collectible item — all driven by
formulas evaluated per frame, the same shape as this checkpoint's own
`animate()`).

### SE Lens

The principle is **separating "what state changes" from "how state
becomes a camera position."** `theta`/`phi`/`radius` are the actual
state this checkpoint changes over time; `updateCamera()` is a pure
translation from that state into a real camera position, called
identically whether `theta` changed because of this lesson's own
automatic drift or — starting next lesson — real mouse input. This
separation is exactly what makes Lesson 6's own upcoming work
straightforward: only the *thing that changes* `theta`/`phi` needs to
change from an automatic increment to a mouse handler; `updateCamera()`
itself won't need to change at all.

The alternative not chosen: compute a camera position and rotation
directly inside the render loop itself, with no separate
`updateCamera()` function at all — inlining everything into `animate()`.
That would work for this one checkpoint, but would make Lesson 6's own
job harder: reusing the identical position-update logic from a mouse
event handler (which doesn't run inside the render loop at all, and
runs at a different, unpredictable rate — whenever the mouse actually
moves, not once per frame) is exactly why keeping `updateCamera()` as
its own separate, callable function — already the shape your existing
tool uses — matters.

### Commands Needed

None new.

### Run It — Yourself, in Your Own Browser

Open `src/step13_spherical_orbit.html`. You should see the blue base
and red tower continuously, smoothly orbited around by the camera —
horizontally circling (driven by `theta`) while also slowly rising and
dipping (driven by the oscillating `phi`) — and, throughout the entire
motion, always facing the same fixed point near the tower's own base,
confirmed by the tower always staying roughly centered in view rather
than drifting off to one side as the camera moves. This is your own
tool's actual `updateCamera()` function, running for real, driven by an
automatic angle increment instead of mouse input — Lesson 6's own
subject.

### Connect

You now understand every piece of your own tool's orbit camera:
spherical coordinates as a natural way to describe "orbiting around a
fixed point," the actual formula converting those angles into a real
position (verified twice, with real numbers, not just trusted), and
`camera.lookAt()` handling the "always face the target" half of the
job. What's still missing is the *input* driving `theta`/`phi`/`radius`
— right now, an automatic formula; next lesson, real mouse drag and
scroll, the actual interaction your tool's users experience.

---

## Connect the Pieces

One camera position, traced through every Concept Unit in this lesson:
`theta = 0, phi = Math.PI/3, radius = 6` (this lesson's own three
spherical coordinates) feed into the verified spherical-to-Cartesian
formula (first and second Concept Units — checked against three
special-case reference points, then against twelve arbitrary
angle combinations, always producing exactly `radius`) to produce a
real `(x, y, z)` — offset by `target`, a fixed point near the tower's
own base (third Concept Unit). `camera.position.set(...)` places the
camera there; `camera.lookAt(target)` orients it to actually face that
point, regardless of where the formula just moved it to. Every single
frame, `theta` increments and `phi` drifts, the identical formula runs
again with new inputs, and the camera lands at a new position — always
exactly `radius` away, always facing `target` — producing the smooth,
continuous orbiting motion you can watch happen for real in your own
browser.

---

## Try It Yourself

Type `src/step13_spherical_orbit.html` yourself (not copy-pasted), and
confirm the `Run It` checkpoint above. Then, once that's working, try
changing the fixed `radius` value (say, from `6` to `3`, or to `12`)
and reload — confirm for yourself, visually, that the camera really
does stay at a constant *new* distance throughout the whole orbit, not
just at the moment you changed it — the same invariant this lesson's
own second Concept Unit already proved with real numbers, now visible
directly.
