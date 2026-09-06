# Lesson 7: Why Spherical Orbiting Has a Ceiling

**What you will build:** real, executed proof of the two actual
limitations built into every orbit camera using `theta`/`phi`/`radius`
— not assumed, not just felt during Lesson 6's own dragging, but
demonstrated with real numbers: what happens to the horizontal orbit
circle near the poles, and a mathematical proof that this camera
structure can *never* roll, no matter what `theta`/`phi` you choose.
This is the actual motivation the rest of this curriculum exists for.

**What you need to know first:** Lessons 5-6 in full — spherical
coordinates, the verified conversion formula, `camera.lookAt()`, the
`phi` clamp, and real mouse-driven rotation.

**Terms used in this lesson:**
- **degrees of freedom** — how many independent numbers are needed to
  fully describe a state. A full, unconstrained 3D orientation (which
  way something faces, including any amount of roll/tilt) needs three
  independent numbers — commonly described as pitch, yaw, and roll.
  This lesson's own orbit camera uses exactly two —`theta` and `phi` —
  by design, which is the real, structural reason a third kind of
  motion (roll) is simply never available, no matter how those two
  numbers are combined.
- **degenerate mapping** — a situation where meaningfully different
  input values produce nearly (or exactly) the same output — here,
  many different `theta` values, all evaluated at a `phi` very close to
  a pole, producing camera positions that are almost indistinguishable
  from one another.
- **roll** — rotation around the direction you're currently looking —
  tilting your head sideways while keeping your eyes on the same point,
  as opposed to turning to look somewhere else entirely (yaw) or
  looking up/down (pitch, roughly this lesson's own `phi`). This
  lesson's own orbit camera has no way to produce this kind of motion
  at all.

**Objects and methods used:**

This lesson builds no new project code and adds no new files —
deliberately: it exists entirely to examine, with real executed proof,
the actual limitations of code already fully built and understood
(Lessons 5-6), before Phase C spends real effort building something
better. There is nothing new to summarize in a Header table this time;
every function referenced below (`sphericalToCartesian`, `cross`,
`normalize`) already appeared, in identical or near-identical form, in
earlier lessons.

---

## Concept Unit: The Vanishing Circle Near the Poles

### The Problem

Lesson 5's own Mechanical Walkthrough already noted, in passing, that
`radius * sinPhi` is the radius of the *horizontal* circle `theta`
moves around — smaller near the poles, largest at the equator. That
was stated as a fact about the formula's own structure. This Concept
Unit checks what it actually *means* for the camera's real, observable
behavior, with real numbers.

> **Before reading on, try this yourself:** if the horizontal circle's
> own radius shrinks toward `0` as `phi` approaches a pole, what would
> you expect to happen to the *distance* between two camera positions
> computed at very different `theta` values (say, `theta = 0` and
> `theta = 90°`), if both are evaluated at a `phi` extremely close to a
> pole, compared to the same two `theta` values evaluated at the
> equator (`phi = 90°`)?

### Introduce the Concept in Isolation

```javascript
// Throwaway lab: what happens to the horizontal orbit circle as phi approaches a pole
function sphericalToCartesian(radius, theta, phi) {
    const sinPhi = Math.sin(phi);
    return {
        x: radius * sinPhi * Math.sin(theta),
        y: radius * Math.cos(phi),
        z: radius * sinPhi * Math.cos(theta),
    };
}

function distanceBetween(a, b) {
    return Math.sqrt((a.x-b.x)**2 + (a.y-b.y)**2 + (a.z-b.z)**2);
}

const radius = 6;

const phiMid = Math.PI / 2;
const pA = sphericalToCartesian(radius, 0, phiMid);
const pB = sphericalToCartesian(radius, Math.PI / 2, phiMid);
console.log("mid-latitude separation:", distanceBetween(pA, pB).toFixed(4));

const phiNearPole = 0.01;
const pC = sphericalToCartesian(radius, 0, phiNearPole);
const pD = sphericalToCartesian(radius, Math.PI / 2, phiNearPole);
console.log("near-pole separation:   ", distanceBetween(pC, pD).toFixed(4));

console.log("horizontal radius at mid-latitude:", (radius * Math.sin(phiMid)).toFixed(4));
console.log("horizontal radius near pole:      ", (radius * Math.sin(phiNearPole)).toFixed(4));
```

Real output:

```
mid-latitude separation: 8.4853
near-pole separation:    0.0849
horizontal radius at mid-latitude: 6.0000
horizontal radius near pole:       0.0600
```

At the equator (`phi = 90°`), two genuinely different `theta` values —
a full quarter-turn apart — land `8.49` units apart: a real,
substantial difference, exactly what you'd expect from turning the
camera a meaningful amount. At `phi = 0.01` — barely off the true pole,
well outside the actual clamped range Lesson 6's own code enforces, but
close enough to make the effect obvious — the *identical* quarter-turn
in `theta` moves the camera only `0.0849` units: over 100 times less
separation for the exact same angular change. The horizontal circle's
own radius directly explains why: `6.0000` at the equator, but only
`0.0600` near the pole — confirmed, real numbers, not just the formula's
own structure asserted abstractly. This is a **degenerate mapping**
(this lesson's own term): near a pole, `theta` still technically
changes, but the actual, physical camera position it produces barely
does.

### Discard the Throwaway Example

This scratch verification is discarded now — but the conclusion isn't:
it's exactly why Lesson 6's own `phi` clamp exists at all, and exactly
why it stops short of the true `0`/`Math.PI` limits rather than
allowing them.

### Project Change

- **Reference Source:** your own `mesh_viewer.html`'s `phi = Math.max(0.05, Math.min(Math.PI - 0.05, phi))`
  clamp, from Lesson 6 — this Concept Unit is the real, mechanical
  reason that specific clamp exists, rather than allowing `phi` to
  reach `0` or `Math.PI` directly.
- **Files affected:** none — this lesson is analysis of already-built
  code, not new project code.
- **Change type:** N/A.
- **Location:** N/A.
- **Dependencies:** N/A.

### The New Code

N/A — this Concept Unit's own throwaway lab is its complete content;
nothing is added to the project.

### The Updated Project

N/A, for the same reason.

### Mechanical Walkthrough

- **`const phiMid = Math.PI / 2;` / `const phiNearPole = 0.01;`** — two
  deliberately chosen test latitudes: the equator (as far from either
  pole as possible) and a value extremely close to true north
  (`phi = 0`), chosen to make the contrast as stark as possible.
- **`distanceBetween(pA, pB)` / `distanceBetween(pC, pD)`** — ordinary
  3D distance (already familiar from earlier lessons), applied to two
  pairs of positions that differ only in `theta`, at two different
  fixed `phi` values — isolating `phi`'s own effect on "how much does
  changing theta actually matter" as the one variable under test.
- **`radius * Math.sin(phiMid)` / `radius * Math.sin(phiNearPole)`** —
  the horizontal circle's own radius at each latitude, directly
  confirming the mechanical cause behind the distance numbers above.

### CS Lens

This is a **coordinate singularity** — a point (or, here, a
neighborhood close to a point) where a coordinate system's own
mathematical structure breaks down or becomes degenerate, even though
the underlying space being described has no actual physical problem
there. The true north and south poles of a sphere are the textbook
example: longitude (this lesson's own `theta`) is a perfectly
meaningful concept everywhere else on the globe, but becomes
undefined-in-practice exactly at the poles themselves, where every
line of longitude meets at a single point.

Also recognized in: real-world map projections (any flat map of the
Earth has to distort something near the poles, precisely because of
this same coordinate singularity — the Mercator projection's infamous
extreme size distortion near the poles is a direct, visible consequence
of it); robotics and aerospace (gimbal lock in physical, mechanical
gimbal systems — three nested rotating rings — is a related, though
mechanically distinct, phenomenon where two rotation axes become
aligned and a degree of freedom is temporarily lost); any Euler-angle-based
rotation representation in 3D software, which is exactly why quaternions
(Lesson 8) are preferred for free rotation specifically to avoid this
entire category of problem.

### SE Lens

The principle is **a real, structural cost being deliberately accepted
for a real, structural benefit** — Lesson 5's own SE Lens already named
the benefit (radius is automatically, always constant); this Concept
Unit names the cost honestly, with real numbers, rather than leaving it
implicit: this exact coordinate system becomes unreliable near its own
poles, and the clamp built in Lesson 6 is a deliberate, narrow
workaround (stay away from the bad neighborhood entirely) rather than
a fix for the underlying issue.

The alternative not chosen: don't clamp `phi` at all, and let the
camera reach the true poles directly. Concretely, what would go wrong:
at exactly `phi = 0`, `sinPhi` is exactly `0`, meaning `radius * sinPhi
* sin(theta)` and `radius * sinPhi * cos(theta)` are both exactly `0`
regardless of `theta` — the camera would sit at exactly the same single
point, `(target.x, target.y + radius, target.z)`, for *every* possible
`theta`. Combined with `camera.lookAt(target)`, a small amount of
further mouse drag right at that exact point could cause the camera's
own orientation to spin unpredictably, since `theta` would still be
changing internally with no corresponding change in position to make
that change visually coherent — the clamp exists specifically to keep
`phi` far enough from that singular point that this never actually
happens.

### Commands Needed

None — this Concept Unit's code is throwaway-lab-only.

### Run It

Already shown above — the throwaway lab is this Concept Unit's own
complete execution. You can also feel a milder version of this same
effect directly: open `src/step15_near_pole.html` (built at the end of
this lesson) or drag Lesson 6's own `step14_mouse_orbit.html` close to
its own `phi` clamp boundary, and notice how large a horizontal drag is
needed to produce the same amount of visible rotation you'd get from a
much smaller drag near the middle of the range.

### Connect

Near the poles, this camera's own coordinate system degrades badly —
`theta` still exists as a number, but stops meaningfully controlling
anything. The next Concept Unit examines a second, entirely separate
limitation — one that holds true *everywhere*, not just near the poles,
and can't be fixed by any clamp at all.

---

## Concept Unit: Only Two Angles — Why This Camera Can Never Roll

### The Problem

Even far from any pole, comfortably in the middle of Lesson 6's own
clamped range, this camera can do exactly two things: orbit
horizontally (`theta`) and tilt up/down (`phi`). It has never, in any
lesson so far, tilted its own horizon — rolled sideways, the way tilting
your head sideways while still looking at the same point would. This
Concept Unit proves that isn't a missing feature that just hasn't come
up yet — it's structurally, mathematically impossible for this specific
camera model, everywhere, not just near poles.

> **Before reading on, try this yourself:** `camera.lookAt(target)`
> (Lesson 5) works by computing a forward direction (from the camera's
> position toward the target) and a "right" direction, derived from
> that forward direction combined with a fixed **world up** reference
> (`(0, 1, 0)`, unless told otherwise) — via a cross product, the exact
> operation your Python curriculum's own `Triangle.normal()` used for a
> completely different purpose. If that "right" direction is always
> computed the same way, from the same fixed world-up reference, no
> matter what `theta`/`phi` currently are — what would you expect its
> own vertical component (its own `y` value) to always equal?

### Introduce the Concept in Isolation

```javascript
// Throwaway lab: proving this camera's "right" direction is always perfectly horizontal -- it can never roll
function sub(a, b) { return { x: a.x-b.x, y: a.y-b.y, z: a.z-b.z }; }
function length(v) { return Math.sqrt(v.x*v.x + v.y*v.y + v.z*v.z); }
function normalize(v) { const n = length(v); return { x: v.x/n, y: v.y/n, z: v.z/n }; }
function cross(a, b) {
    return {
        x: a.y*b.z - a.z*b.y,
        y: a.z*b.x - a.x*b.z,
        z: a.x*b.y - a.y*b.x,
    };
}

function sphericalToCartesian(radius, theta, phi) {
    const sinPhi = Math.sin(phi);
    return {
        x: radius * sinPhi * Math.sin(theta),
        y: radius * Math.cos(phi),
        z: radius * sinPhi * Math.cos(theta),
    };
}

const target = { x: 0, y: 0, z: 0 };
const worldUp = { x: 0, y: 1, z: 0 };

function impliedRight(radius, theta, phi) {
    const camPos = sphericalToCartesian(radius, theta, phi);
    const forward = normalize(sub(target, camPos));
    return normalize(cross(forward, worldUp));
}

for (const [theta, phi] of [[0, 1.0], [1.3, 0.7], [2.8, 2.1], [5.5, 1.9]]) {
    const right = impliedRight(6, theta, phi);
    console.log("theta", theta.toFixed(1), "phi", phi.toFixed(1), "-> right.y =", right.y.toFixed(10));
}
```

Real output:

```
theta 0.0 phi 1.0 -> right.y = 0.0000000000
theta 1.3 phi 0.7 -> right.y = 0.0000000000
theta 2.8 phi 2.1 -> right.y = 0.0000000000
theta 5.5 phi 1.9 -> right.y = 0.0000000000
```

Four genuinely different, essentially arbitrary `theta`/`phi`
combinations — not special cases, not near any pole — and every single
one produces a "right" direction with *exactly* zero vertical
component. This isn't a coincidence of these four particular choices:
it's a mathematical guarantee, directly confirming this Concept Unit's
own Socratic prompt. Because `worldUp` never changes, and the "right"
direction is always computed as (forward × worldUp), that result is
always perpendicular to `worldUp` itself — meaning it can never point
even slightly upward or downward. The camera's own horizon — the line
between "up" and "right" — is therefore always perfectly level. **Roll**
(this lesson's own term) would require that "right" direction to tilt
away from perfectly horizontal, and nothing in this formula, for any
`theta`/`phi` at all, can ever produce that.

### Discard the Throwaway Example

This scratch verification is discarded now — the conclusion is
permanent: this specific camera model has exactly two **degrees of
freedom** (this lesson's own term), not three, by its own mathematical
construction, not by any missing feature or oversight.

### Project Change

- **Reference Source:** your own `mesh_viewer.html`'s `updateCamera()`,
  specifically its final `camera.lookAt(target);` call — Three.js's own
  internal implementation of `lookAt` performs exactly this
  forward/worldUp cross-product computation, using its own default
  `camera.up` (which starts as `(0,1,0)` and is never changed anywhere
  in your existing tool) as the `worldUp` this lab used explicitly.
- **Files affected:** none — this lesson is analysis, not new project
  code.
- **Change type:** N/A.
- **Location:** N/A.
- **Dependencies:** N/A.

### The New Code

N/A — this Concept Unit's own throwaway lab is its complete content.

### The Updated Project

N/A, for the same reason.

### Mechanical Walkthrough

- **`function impliedRight(radius, theta, phi) { ... }`** — a
  deliberately-named function reconstructing, in plain JavaScript with
  no Three.js involved at all, the exact internal computation
  `camera.lookAt()` performs, so its result can be inspected and tested
  directly rather than trusted as an opaque library behavior.
- **`const forward = normalize(sub(target, camPos));`** — the direction
  from the camera's current position toward the target — exactly what
  `lookAt` itself needs to know to orient anything at all.
- **`normalize(cross(forward, worldUp))`** — the cross product of
  `forward` and the fixed `worldUp`, normalized to unit length — a
  direction guaranteed, by the mathematical definition of a cross
  product, to be perpendicular to *both* of its inputs — including
  `worldUp` itself, which is exactly why its own vertical component can
  never be anything but zero.
- **the four `[theta, phi]` test pairs** — chosen with no particular
  pattern or significance, specifically to demonstrate the result holds
  generally, not just for convenient special cases.

### CS Lens

This is a **constrained degrees-of-freedom system** — a design where a
system's state is deliberately described with fewer independent
parameters than the full space it lives in would allow (two angles,
`theta`/`phi`, instead of the three a fully free 3D orientation
actually has), trading full generality for simplicity and a guaranteed
invariant (Lesson 5's own always-constant radius, and, implicitly,
this lesson's own always-level horizon).

Also recognized in: a car's steering wheel (constrained to roughly two
useful degrees of freedom — forward/backward speed and turning angle —
rather than the full six degrees of freedom a real rigid body moving
through 3D space actually has, because full freedom isn't what driving
needs); a desk lamp with a hinged arm (each joint constrains motion to
a single rotational axis, deliberately, rather than allowing free 3D
rotation at every joint); most 3D CAD software's own default "orbit"
tool, which behaves exactly like this lesson's own camera — constrained,
predictable, and, for the vast majority of everyday use, exactly
enough freedom — with a separate "free rotate" or "roll" tool offered
separately for the cases (like yours) that need the third degree of
freedom this default doesn't provide.

### SE Lens

The principle is **naming a design's real boundary precisely**, rather
than either overselling it ("this camera can look at things from any
angle") or dismissing the limitation vaguely ("it's a bit limited
sometimes"). This lesson's own two Concept Units together give a
precise, mechanically-grounded answer to "what exactly can't this
camera do, and why": it degrades badly near its own poles (first
Concept Unit), and it can never roll, anywhere, by mathematical
necessity (this Concept Unit) — not "sometimes buggy," but two specific,
provable, permanent properties of this exact design.

The alternative not chosen, and the actual reason the rest of this
curriculum exists: represent camera orientation with a full three-
degree-of-freedom system from the start — a rotation matrix or a
**quaternion** (Lesson 8's own subject) — capable of representing
*any* orientation, including roll, with no coordinate singularity at
any point at all. That system is genuinely more complex to reason about
than two plain angle variables — which is exactly why Lesson 5 chose
the simpler system for this curriculum's own first working camera, and
exactly why understanding *this* system's real limits, precisely,
rather than vaguely, is what makes reaching for something more capable
a deliberate choice instead of a mysterious necessity.

### Commands Needed

None new — the final checkpoint below reuses Lesson 6's own file with
one changed starting value.

### Run It — Yourself, in Your Own Browser

Open `src/step15_near_pole.html` — the identical interactive camera
from Lesson 6, starting at `phi = 0.1` (deliberately close to the
clamp's own lower bound) instead of the middle of the range. Drag
horizontally and notice how much farther you have to drag to produce
the same amount of visible rotation you felt in Lesson 6's own
mid-range checkpoint — a real, felt version of this lesson's own first
Concept Unit's "near-pole separation: 0.0849" result. Then notice
something you *can't* do at all, no matter how you drag: tilt the
horizon itself. The blue base always stays level in the frame — never
rotates to a diagonal — confirming this Concept Unit's own "right.y is
always exactly zero" result, directly, with your own eyes.

### Connect

Both of this camera's real limitations are now proven, not just
described: a coordinate singularity near the poles, and a permanent,
mathematically-guaranteed inability to roll. Phase C starts here:
quaternions, the standard tool for representing a full, three-degree-
of-freedom orientation with no singularity anywhere — the actual fix
for both limitations demonstrated in this lesson, and the reason this
whole curriculum began.

---

## Connect the Pieces

Two separate, real limitations, both proven with executed code in this
lesson: near a pole, this camera's own coordinate system becomes
degenerate — the first Concept Unit's real numbers showed a full
quarter-turn of `theta` moving the camera over 100 times less than the
identical turn produces at the equator, traced directly to the
horizontal circle's own radius shrinking toward zero. Separately,
*everywhere*, not just near poles, the second Concept Unit's own real
cross-product computation proved this camera's implied "right"
direction always has exactly zero vertical component — a mathematical
guarantee, not an observed tendency, that this camera can never roll.
Together, these are the precise, demonstrated reasons a two-angle
orbit camera — however well understood, however faithfully rebuilt
across Lessons 5-6 — has a real ceiling. Quaternions, starting next
lesson, are how to get past it.

---

## Try It Yourself

Open `src/step15_near_pole.html` yourself and confirm what's described
above. Then, using Lesson 6's own `step14_mouse_orbit.html`, try
dragging `phi` as close to its own clamp boundary as you can get it,
and watch the console (add a `console.log(phi)` inside the `mousemove`
handler if you'd like a precise readout) — see how close to the true
`0.05` boundary you can actually get, and how the felt rotation speed
changes as you approach it, connecting what you observe back to this
lesson's own real, executed "horizontal radius near pole: 0.0600"
result.
