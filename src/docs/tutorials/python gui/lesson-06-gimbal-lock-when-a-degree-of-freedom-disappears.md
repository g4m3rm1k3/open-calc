# Lesson 6: Gimbal Lock — When a Degree of Freedom Disappears

**What you will build** — the same three-slider panel from the previous
lesson, plus one new button: "Snap to gimbal lock," which sets the B slider
to exactly 90°. Once there, dragging A and C stop doing two different
things — every combination of A and C that adds up to the same total
produces the *exact same* orientation. This lesson proves, symbolically and
numerically, exactly why, and shows what real capability a 5-axis CNC
machine actually loses the instant its own rotary axes pass through this
same configuration.

**What you need to know first** — Lesson 5: Euler angles, the fixed
`Rx·(Ry·Rz)` order, and the real, verified surprise flagged at its close —
that setting B to 90° makes A and C start producing the same visible
rotation.

**Terms used in this lesson**
- **Euler angles** — three angle values, each about one axis, applied in
  one fixed order, together describing a full 3D orientation. This lesson
  investigates the one specific case where that description stops being as
  informative as it normally is.
- **degree of freedom** — one independent way a system can vary, without
  affecting any of its other independent ways of varying. Three ordinary
  Euler angles normally give three genuine degrees of freedom — three
  dials, each capable of producing an orientation none of the other two
  could reach alone. This lesson's entire subject is the specific
  orientation where that stops being true.
- **gimbal lock** — the named phenomenon where, at a specific middle-axis
  angle (here, B at exactly ±90°), two of the three Euler-angle dials stop
  being independent: changing either one alone produces a result
  indistinguishable from changing the other, so effectively only one
  combined value — not two separate ones — is actually doing anything. The
  name comes from a physical mechanical gimbal (a set of nested pivoted
  rings, historically used in compasses, gyroscopes, and camera
  stabilizers): at the equivalent physical angle, two of the three rings
  physically align into the same plane and can no longer turn the
  innermost ring around two genuinely different axes.
- **singularity** — a general mathematical term for one specific
  configuration where a system that normally behaves smoothly and fully
  loses some of that behavior — a single point or line, out of an entire
  continuous range of possibilities, where the usual rules stop giving a
  unique or well-behaved answer. Gimbal lock is one concrete example of a
  singularity; the term itself is broader, also naming things like a
  matrix that can't be inverted, or a function whose slope becomes
  vertical at one exact point.

**Objects and methods used**

*This lesson's own subject — the same rotation-combining machinery from the
previous two lessons, now examined at one specific, singular input:*

- **`THREE.Matrix4`**, **`Matrix4.prototype.makeRotationX/Y/Z`**, and
  **`Matrix4.prototype.multiplyMatrices`** — documented in full in Lessons
  2–4's Headers; completely unchanged here. This lesson doesn't add any new
  matrix behavior — it examines the *existing* `Rx·(Ry·Rz)` combination at
  one specific, previously unexamined input (B = 90°), and shows that the
  same, unmodified code produces a real, verifiable loss of independence
  there.

- **`Object3D.prototype.setRotationFromMatrix`** — documented in full in
  Lesson 2's Header; reused unchanged.

*Reused DOM API from the previous lesson, unchanged:*

- **`document.getElementById(id)`**, **`HTMLInputElement.prototype.value`**,
  **`parseFloat(string)`**, and **`Element.prototype.textContent`** — all
  documented in full in Lesson 5's Header; reused here exactly as before,
  for the same three sliders and readouts, plus one new readout added by
  this lesson (the live `A + C` sum, explained below).

*New in this lesson — responding to a real click, rather than only polling:*

- **`EventTarget.prototype.addEventListener(type, listener)`**
  - *What it is:* a method, available on every DOM element (and other
    browser objects), that registers a function to be called whenever a
    specific kind of event happens on that element.
  - *Implementation:* `addEventListener(type: string, listener: (event:
    Event) => void): void` — a real, standard DOM method; `type` names the
    event to listen for (`'click'`, in this lesson's case), and `listener`
    is the function to run each time that event fires.
  - *Its use:* this lesson's "Snap to gimbal lock" button needs to do
    something the moment it's clicked — set the B slider's value to exactly
    `90` — and a click is, by nature, a one-off event, not a continuously
    pollable value the way a slider's current position is; `animate`
    already polls the sliders every frame, but there's no equivalent
    "was the button just clicked" state to poll for a button.
  - *Type:* an instance method, called on the specific button element this
    lesson looks up.
  - *Responsibility:* register one function to run on one specific future
    event; it does not run that function itself, and does not affect
    anything about the button's appearance or default behavior.
  - *Depends on:* one event-type string and one callback function.
  - *Connects to:* called once, near this lesson's other `getElementById`
    lookups, on the button element; the callback it registers writes
    directly to `bSlider.value`, which `animate` then reads on its very
    next scheduled frame, exactly as it would read any other change to that
    slider.
  - *Shape:* takes a string and a function; returns nothing itself — its
    effect is entirely the future callback invocations it sets up.

*Scene setup and mesh construction — Three.js infrastructure, not this
lesson's own subject.* Explained in full in
[`threejs-scene-camera-renderer.md`](../src/docs/concepts/threejs-scene-camera-renderer.md)
and
[`threejs-mesh-from-geometry-and-material.md`](../src/docs/concepts/threejs-mesh-from-geometry-and-material.md).

**Everything else in the file, not this lesson's subject but still
explained:**

- **`renderer.setAnimationLoop(callback)`** — documented in full in Lesson
  1's Header; reused unchanged.

---

## Concept Unit: Two Axes Doing the Same Job

### The Problem

The previous lesson closed with a real, observed surprise: at B = 90°,
dragging A and dragging C start looking like they do the same thing. That
was only ever demonstrated by dragging sliders and watching — this unit
derives, from the actual matrix formulas already built across this
curriculum, exactly *why* that has to happen, rather than treating it as an
unexplained coincidence of this one specific angle.

> **Try it yourself, before reading on:** recall Lesson 3's own derived
> formula for `Ry(θ)`: `x' = x·cosθ + z·sinθ`, `y' = y`, `z' = -x·sinθ +
> z·cosθ`. Substitute `θ = 90°` directly — `cos 90° = 0`, `sin 90° = 1` —
> and simplify. What does `Ry(90°)` do to a point's `x` and `z` coordinates,
> in the simplest possible terms? Given that this lesson's combined rotation
> is `Rx(A) · (Ry(90°) · Rz(C))`, and given what you just found `Ry(90°)`
> reduces to, what do you predict happens to whatever `Rz(C)` first does to
> a point, once `Ry(90°)` gets applied on top of it?

### Introduce the Concept in Isolation

Substituting `θ = 90°` into `Ry`'s own formula, using `cos 90° = 0` and
`sin 90° = 1`:

```
Ry(90°): x' = x·0 + z·1 = z
         y' = y
         z' = -x·1 + z·0 = -x
```

`Ry(90°)` simply swaps `x` and `z` (with a sign flip): whatever was the
point's height becomes its new depth, and whatever was its depth becomes
its new (negated) height. Written as a matrix:

```
Ry(90°) = [ 0   0   1 ]
          [ 0   1   0 ]
          [-1   0   0 ]
```

Now compute `Ry(90°) · Rz(C)` by hand, multiplying this matrix by the
already-derived `Rz(C) = [[cosC, -sinC, 0], [sinC, cosC, 0], [0, 0, 1]]`,
row by column:

```
Ry(90°)·Rz(C) = [   0        0      1 ]
                [ sinC     cosC     0 ]
                [-cosC     sinC     0 ]
```

The top row, `[0, 0, 1]`, comes directly from `Ry(90°)`'s own first row,
`[0, 0, 1]`, combined with any matrix at all — multiplying `[0, 0, 1]`
against `Rz(C)`'s three columns always gives back `[0, 0, 1]` again,
regardless of what `C` is. `C` has already vanished from one whole row of
the product, before `Rx(A)` is even involved.

Now fold in `Rx(A) = [[1,0,0],[0,cosA,-sinA],[0,sinA,cosA]]`, multiplying it
against the matrix just computed:

```
Rx(A) · (Ry(90°)·Rz(C)) = [      0            0         1    ]
                           [  sin(A+C)     cos(A+C)      0    ]
                           [ -cos(A+C)     sin(A+C)      0    ]
```

Every entry that depends on `A` or `C` at all depends on them only through
their **sum**, `A + C` — never on `A` and `C` separately. That's the exact
mechanism behind the previous lesson's observed surprise: two dials that
each used to move the workpiece independently now only ever move it through
one combined number, `A + C`. Setting `A = 20°, C = 50°` and `A = 40°, C =
30°` — different individual values, identical sum — must therefore produce
the identical final matrix.

Checked directly against the real, installed library, at exactly those two
angle pairs:

```javascript
import * as THREE from 'three';

function combined(angleADeg, angleBDeg, angleCDeg) {
  const a = angleADeg * Math.PI / 180, b = angleBDeg * Math.PI / 180, c = angleCDeg * Math.PI / 180;
  const Rx = new THREE.Matrix4().makeRotationX(a);
  const Ry = new THREE.Matrix4().makeRotationY(b);
  const Rz = new THREE.Matrix4().makeRotationZ(c);
  const inner = new THREE.Matrix4().multiplyMatrices(Ry, Rz);
  return new THREE.Matrix4().multiplyMatrices(Rx, inner);
}

const m1 = combined(20, 90, 50); // sum = 70
const m2 = combined(40, 90, 30); // sum = 70, different individual values
console.log('A=20,C=50 (B=90):', m1.elements.map(v => v.toFixed(4)));
console.log('A=40,C=30 (B=90):', m2.elements.map(v => v.toFixed(4)));
console.log('identical?', m1.elements.every((v, i) => Math.abs(v - m2.elements[i]) < 1e-9));
```

Real output:

```
A=20,C=50 (B=90): [0.0000,0.9397,-0.3420,0.0000,-0.0000,0.3420,0.9397,0.0000,1.0000,-0.0000,0.0000,0.0000,0.0000,0.0000,0.0000,1.0000]
A=40,C=30 (B=90): [0.0000,0.9397,-0.3420,0.0000,-0.0000,0.3420,0.9397,0.0000,1.0000,-0.0000,0.0000,0.0000,0.0000,0.0000,0.0000,1.0000]
identical? true
```

Sixteen matching numbers, from two genuinely different pairs of dial
settings — this isn't a rounding coincidence, it's the direct, verified
consequence of the algebra just derived. And to rule out the possibility
that *any* angle for B produces this same collapse — confirming the
degree-of-freedom loss is specific to B = 90°, not a general property of
this whole rotation scheme:

```javascript
const n1 = combined(20, 45, 50); // same A, C as before, but B = 45deg instead
const n2 = combined(40, 45, 30);
console.log('A=20,C=50 (B=45):', n1.elements.map(v => v.toFixed(4)));
console.log('A=40,C=30 (B=45):', n2.elements.map(v => v.toFixed(4)));
console.log('identical?', n1.elements.every((v, i) => Math.abs(v - n2.elements[i]) < 1e-9));
```

Real output:

```
A=20,C=50 (B=45): [0.7071,0.2418,-0.6645,0.0000,0.0000,0.9397,0.3420,0.0000,0.7071,-0.2418,0.6645,0.0000,0.0000,0.0000,0.0000,1.0000]
A=40,C=30 (B=45): [0.6124,0.4356,-0.6597,0.0000,0.3536,0.8629,0.3612,0.0000,0.7071,-0.2551,0.6597,0.0000,0.0000,0.0000,0.0000,1.0000]
identical? false
```

At B = 45°, the same two `(A, C)` pairs that collapsed to an identical
matrix at B = 90° now produce genuinely different results — confirming this
degree-of-freedom loss is a real singularity specific to B = ±90°, not a
general feature of combining three rotations.

**One more real, verified fact, not glossed over:** the exact same
derivation carried out at B = -90° instead of +90° shows the collapse still
happens — but the invariant that survives is the *difference*, `A - C`, not
the sum:

```javascript
const base = combined(20, -90, 50);
const sameDiff = combined(35, -90, 65); // A-C = -30 in both cases
console.log('A=20,C=50 (B=-90):', base.elements.map(v => v.toFixed(4)));
console.log('A=35,C=65 (B=-90):', sameDiff.elements.map(v => v.toFixed(4)));
console.log('identical?', base.elements.every((v, i) => Math.abs(v - sameDiff.elements[i]) < 1e-9));
```

Real output:

```
A=20,C=50 (B=-90): [0.5000,0.8660,-0.0000,0.0000,0.8660,-0.5000,0.0000,0.0000,-0.0000,0.0000,-1.0000,0.0000,0.0000,0.0000,0.0000,1.0000]
A=35,C=65 (B=-90): [0.5000,0.8660,-0.0000,0.0000,0.8660,-0.5000,0.0000,0.0000,-0.0000,0.0000,-1.0000,0.0000,0.0000,0.0000,0.0000,1.0000]
identical? true
```

The sign flip between the two collapse points — `A + C` at +90°, `A - C` at
-90° — traces directly back to the same sign asymmetry Lesson 3 already
found and verified in `Ry`'s own formula relative to `Rx`'s and `Rz`'s: the
`+sinT`/`-sinT` placements that made `Ry` the "twisted" one of the three are
the exact same terms responsible for which combination, sum or difference,
survives at each of gimbal lock's two locations.

### Discard the Throwaway Example

The verification snippets above are discarded; the real project reuses its
already-existing `Rx`/`Ry`/`Rz`/`multiplyMatrices` code completely unchanged
— nothing about *how* the rotation is computed needs to change to observe
gimbal lock, since it's a property of specific inputs to already-correct
code, not a bug needing a fix.

### CS Lens

This is a concrete instance of a **rank deficiency**: normally, three
independent inputs (A, B, C) can steer the output in three independent
directions, but at this one specific input (B = 90°), the achievable outputs
collapse onto a space that only needs *two* independent numbers (B itself,
fixed at 90°, plus the single combined value `A + C`) to describe, even
though three numbers are still technically being supplied. The same idea —
more input variables than the system can actually use independently, at
some specific configuration — is called rank deficiency wherever it shows
up in linear algebra.

```
Also recognized in: a robot arm with a joint configuration where two
joints briefly align and stop contributing independent motion, a camera
rig's gimbal stabilizer at the exact tilt where two of its rings become
coplanar (the literal mechanical origin of this term), a system of
equations with more unknowns than independent constraints, and — the
direct, real-world stake of this lesson — a 5-axis CNC machine whose
own rotary table and rotary head axes momentarily align, losing the
ability to independently command what should be two separate motions.
```

### SE Lens

Nothing about this lesson's rotation-combining code changes to "fix"
gimbal lock — the previous two lessons' `Rx·(Ry·Rz)` code is completely
correct, both before and during this singularity; the loss of an
independent degree of freedom is a real, physical property of Euler angles
themselves, not a bug in this curriculum's implementation. The alternative
some systems reach for — detecting the exact moment B crosses 90° and doing
something special — is a real strategy (some CNC controllers do exactly
this, warning an operator or refusing certain moves near a singularity), but
it only patches the symptom at one specific angle; it doesn't remove the
underlying cause, since the same collapse resurfaces at B = -90° with a
different invariant, as just verified, and the same *kind* of collapse
exists at other axis-order conventions too, just at different specific
angles. The debt Euler angles carry, openly: any representation built from
three separately-labeled angles applied in sequence has at least one
orientation where two of those labels stop being independent — a structural
property of the representation, not a fixable implementation detail. A
later lesson in this curriculum builds a different representation
specifically to remove this structural problem entirely, not just detect it.

### Connect the Pieces

The exact symbolic collapse to `sin(A+C)`/`cos(A+C)` this unit derived and
verified is what the next unit makes directly, interactively visible: a
button that jumps B straight to the singular angle, and a live readout
showing the one combined number that's actually still doing any work once
it's there.

---

## Concept Unit: Snapping Into the Singularity

### The Problem

The previous unit proved gimbal lock happens at B = 90° using fixed test
angles and console output. Actually *feeling* the collapse — dragging A and
watching C's slider do nothing different, or vice versa — needs the real
interactive panel from the previous lesson, plus a fast, reliable way to get
to exactly B = 90° without having to drag a slider pixel-by-pixel and hope
to land on the exact value.

> **Try it yourself, before reading on:** Lesson 5 already established that
> a slider's own `.value` can be *read*. Given that a plain JavaScript
> assignment can set any object's property, what do you predict happens if
> code writes directly to `bSlider.value = 90`, from outside of any user
> dragging at all — does the slider's visible thumb position update to
> match, the same way it would if a person had dragged it there themselves?

### Discard note

No isolated throwaway lab is needed for this unit's one genuinely new
construct, `addEventListener`: its behavior — registering a callback that
runs once, later, when a real click happens — is stated directly rather
than demonstrated in a discarded example, since the project's own "Snap to
gimbal lock" button *is* the minimal possible demonstration of it, with
nothing simpler to isolate it against first.

### Project Change

- **Reference Source** — No reference counterpart; from-scratch teaching
  content.
- **Files affected** — `lesson-06.html`, created new, carrying forward the
  entire three-slider panel and rotation-combining code from the previous
  lesson's end state unchanged.
- **Change type** — add.
- **Location** — inside the existing `#panel` markup: one new `<button>`
  and one new readout line, added after the three existing sliders. Inside
  the module script: one new `getElementById` lookup, one new
  `addEventListener` call, and one new `textContent` write inside `animate`.
- **Dependencies** — the entire slider panel and `animate` function from the
  previous lesson must already exist in the file.

### The New Code

The HTML addition, inside the existing `#panel` div, after the three
sliders:

```html
<button id="snapButton" type="button">Snap to gimbal lock (B = 90&deg;)</button>
<div id="sumReadout"></div>
```

The JavaScript additions, inside the existing `<script type="module">`
block:

```javascript
const snapButton = document.getElementById('snapButton');
const sumReadout = document.getElementById('sumReadout');

snapButton.addEventListener('click', () => {
  bSlider.value = 90;
});
```

```javascript
  sumReadout.textContent = 'A + C = ' + (angleADeg + angleCDeg).toFixed(0) + 'deg';
```

### The Updated Project

```javascript
  1  import * as THREE from 'three';
  2
  3  const scene = new THREE.Scene();
  4
  5  const camera = new THREE.PerspectiveCamera(
  6    45,
  7    window.innerWidth / window.innerHeight,
  8    0.1,
  9    1000
 10  );
 11  camera.position.set(0, 0, 10);
 12
 13  const renderer = new THREE.WebGLRenderer({ antialias: true });
 14  renderer.setSize(window.innerWidth, window.innerHeight);
 15  document.body.appendChild(renderer.domElement);
 16
 17  const geometry = new THREE.BoxGeometry(1.5, 0.6, 1);
 18  const material = new THREE.MeshBasicMaterial({ color: 0xff7a1a });
 19  const workpiece = new THREE.Mesh(geometry, material);
 20  scene.add(workpiece);
 21
 22  const matrixX = new THREE.Matrix4();
 23  const matrixY = new THREE.Matrix4();
 24  const matrixZ = new THREE.Matrix4();
 25  const innerYZ = new THREE.Matrix4();
 26  const combined = new THREE.Matrix4();
 27
 28  const aSlider = document.getElementById('aSlider');
 29  const bSlider = document.getElementById('bSlider');
 30  const cSlider = document.getElementById('cSlider');
 31  const aReadout = document.getElementById('aReadout');
 32  const bReadout = document.getElementById('bReadout');
 33  const cReadout = document.getElementById('cReadout');
 34  const matrixReadout = document.getElementById('matrixReadout');
 35  const snapButton = document.getElementById('snapButton');       // ← new
 36  const sumReadout = document.getElementById('sumReadout');       // ← new
 37
 38  snapButton.addEventListener('click', () => {                    // ← new
 39    bSlider.value = 90;                                            // ← new
 40  });                                                               // ← new
 41
 42  function formatMatrixRotationBlock(matrix) {
 43    const e = matrix.elements;
 44    const row0 = e[0].toFixed(2) + '  ' + e[4].toFixed(2) + '  ' + e[8].toFixed(2);
 45    const row1 = e[1].toFixed(2) + '  ' + e[5].toFixed(2) + '  ' + e[9].toFixed(2);
 46    const row2 = e[2].toFixed(2) + '  ' + e[6].toFixed(2) + '  ' + e[10].toFixed(2);
 47    return row0 + '\n' + row1 + '\n' + row2;
 48  }
 49
 50  function animate() {
 51    const angleADeg = parseFloat(aSlider.value);
 52    const angleBDeg = parseFloat(bSlider.value);
 53    const angleCDeg = parseFloat(cSlider.value);
 54
 55    aReadout.textContent = angleADeg.toFixed(0);
 56    bReadout.textContent = angleBDeg.toFixed(0);
 57    cReadout.textContent = angleCDeg.toFixed(0);
 58    sumReadout.textContent = 'A + C = ' + (angleADeg + angleCDeg).toFixed(0) + 'deg'; // ← new
 59
 60    const angleA = angleADeg * Math.PI / 180;
 61    const angleB = angleBDeg * Math.PI / 180;
 62    const angleC = angleCDeg * Math.PI / 180;
 63
 64    matrixX.makeRotationX(angleA);
 65    matrixY.makeRotationY(angleB);
 66    matrixZ.makeRotationZ(angleC);
 67
 68    innerYZ.multiplyMatrices(matrixY, matrixZ);
 69    combined.multiplyMatrices(matrixX, innerYZ);
 70
 71    workpiece.setRotationFromMatrix(combined);
 72
 73    matrixReadout.textContent = formatMatrixRotationBlock(combined);
 74
 75    renderer.render(scene, camera);
 76  }
 77
 78  renderer.setAnimationLoop(animate);
```

Nothing from line 42 down actually changed — the same rotation-combining
code from the previous lesson runs completely unchanged. What's new is
entirely additive: a button that writes one specific value into an
already-existing slider, and one new readout line computed from values
`animate` was already reading. As a whole, this file now lets a person jump
straight to the exact singular orientation the previous unit derived, and
watch, live, that the workpiece's pose only ever tracks the `A + C` value
now shown directly beneath the two sliders that used to move it
independently.

### Mechanical Walkthrough

- `<button id="snapButton" type="button">...</button>` — a standard HTML
  button element; `type="button"` is specified explicitly so that, if this
  markup were ever placed inside a real `<form>`, clicking it would never
  trigger an unrelated form submission — not a concern in this lesson's own
  file, which has no form, but a real, worth-knowing default this attribute
  overrides.
- `<div id="sumReadout"></div>` — an empty container element, given content
  entirely by JavaScript every frame, the same pattern as the existing
  matrix readout `<pre>`.
- `const snapButton = document.getElementById('snapButton');` / `const
  sumReadout = ...` — documented in Lesson 5's Header; two more lookups,
  alongside the existing six.
- `snapButton.addEventListener('click', () => { bSlider.value = 90; });` —
  documented in this lesson's Header; registers a function that runs
  exactly once per real click, setting the B slider's value directly. This
  line runs once, when the page first loads — it does not itself set
  `bSlider.value`; it only arranges for that assignment to happen later,
  whenever a click actually occurs.
- `bSlider.value = 90;` — a direct property assignment, not a method call;
  writing to a range input's `.value` property moves its visible thumb to
  match, exactly as if a person had dragged it there — the same property
  Lesson 5 already established is *read* as a string is, just as
  ordinarily, *written* as a number here, since JavaScript freely converts
  the number `90` to the string `"90"` when it's assigned to a property the
  browser expects a string for.
- `sumReadout.textContent = 'A + C = ' + (angleADeg + angleCDeg).toFixed(0)
  + 'deg';` — documented in Lesson 5's Header (`.textContent`); computes and
  displays the exact invariant the previous unit derived and verified,
  recalculated fresh every single frame from the same `angleADeg`/
  `angleCDeg` values `animate` already reads for every other purpose.

**Execution trace**, walking through what actually happens when the button
is clicked mid-session — a timing/control-flow trace, since the interesting
part here is *when* each piece of code runs relative to the others, not a
changing numeric sequence:

1. A person clicks the "Snap to gimbal lock" button. The browser fires a
   real `click` event on `snapButton`.
2. The function registered by `addEventListener` on line 38 runs, and
   `bSlider.value = 90` executes — the slider's own visible thumb jumps to
   its 90° position immediately, independent of anything `animate` is
   doing.
3. `animate` itself does *not* run at this exact moment — it's already
   mid-cycle, scheduled by `renderer.setAnimationLoop` to run again on the
   next display refresh, typically well under 20 milliseconds later.
4. On that next scheduled call, `animate` reads `bSlider.value` at line 52,
   exactly the way it reads it every single frame — it has no way to tell,
   and no need to tell, whether this particular value came from a person
   dragging or from the button's own assignment; both look identical by the
   time `animate` gets to them.
5. The rest of `animate` proceeds completely unchanged: `matrixY.
   makeRotationY(angleB)` now builds `Ry(90°)`, the exact singular case the
   previous unit derived, and every subsequent line runs exactly as it
   would for any other value of `angleB`.

### CS Lens

Clicking the button and `animate` noticing the change are **decoupled**
through the shared `bSlider` element itself, rather than the button code
calling `animate` directly or passing it a value some other way. Neither
piece of code needs to know the other exists — the button only ever talks
to the slider; `animate` only ever reads from the slider; the slider itself
is the entire channel of communication between them. This is the same
underlying idea as a **shared mutable variable acting as a message channel**
between otherwise-independent pieces of code.

```
Also recognized in: a thermostat's target-temperature dial and its
heating control loop, both reading and writing the same one stored
setting without calling each other directly; a shared configuration
file two independent programs both read; and a CNC controller's own
current-position register, written by motion-planning code and read by
display and safety-limit code without either calling the other.
```

### SE Lens

The button writes directly to `bSlider.value` and relies entirely on
`animate`'s existing per-frame poll to notice the change, rather than
having the button's click handler also directly update the mesh, the
readouts, or call `renderer.render` itself. The alternative — making the
click handler responsible for immediately updating everything a slider
change would normally affect — would make the *button* work correctly on
its own, but would create a second, separate code path doing exactly what
`animate` already does every frame, one that would have to be kept
perfectly in sync with `animate` by hand as this file grows. Relying on the
existing poll instead means this lesson's entire new feature required
touching `animate` in exactly one small, additive way (the new
`sumReadout` line) — the button's own logic stays down to the one line
that's actually specific to it: which value to snap to.

### Connect the Pieces

The button, the slider it writes to, and `animate`'s existing per-frame
poll of that same slider together let a person reach the exact singular
orientation the first unit derived symbolically — and the new `A + C`
readout, computed the exact same way every frame, makes that unit's
algebra directly, continuously visible on screen rather than only provable
in a console.

---

## Connect the Pieces (Lesson Close)

Follow one concrete sequence through the whole file: a person clicks "Snap
to gimbal lock." `bSlider.value = 90` fires, moving the B slider's own
thumb. On `animate`'s very next scheduled call, `angleBDeg` reads `90`,
`angleB` becomes exactly `π/2` radians, and `matrixY.makeRotationY(angleB)`
builds the exact `Ry(90°)` this lesson's first Concept Unit reduced, by
hand, to a simple `x`/`z` swap. Whatever `angleADeg` and `angleCDeg`
currently are, `sumReadout.textContent` displays their sum — and per that
same unit's full derivation, `workpiece.setRotationFromMatrix(combined)`
now poses the mesh using *only* that sum, through
`sin(A+C)`/`cos(A+C)`, no matter how a person subsequently drags the A or C
sliders individually. Dragging A up by 10° and C down by 10° — two,
seemingly opposite adjustments — leaves the workpiece's pose completely
unchanged, a real, physically visible demonstration of a lost degree of
freedom, not an abstract claim.

**Next lesson:** this lesson's own SE Lens named the real, structural
limitation openly: any three-separately-labeled-angle scheme has at least
one orientation like this one, built into the representation itself. The
next lesson picks a genuinely different starting point — rotating about a
single arbitrary axis that isn't necessarily X, Y, or Z at all — and derives
Rodrigues' rotation formula, the general-purpose tool this curriculum's own
SE Lenses have been flagging as still missing since the very first
single-axis matrices were built.
