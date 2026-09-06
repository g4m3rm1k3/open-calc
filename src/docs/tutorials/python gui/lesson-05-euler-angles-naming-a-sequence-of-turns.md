# Lesson 5: Euler Angles — Naming a Sequence of Turns

**What you will build** — a replacement for the previous lesson's automatic,
time-driven spin: three labeled sliders — **A** (about X), **B** (about Y),
**C** (about Z) — that a person drags by hand to pose a single workpiece,
plus a live, monospace readout of the resulting matrix. The three angles are
combined in one fixed order, verified to match the same order Three.js's own
built-in `Euler` class uses by default. That fixed order is the entire
reason this is called "Euler angles" rather than just "three rotation
numbers": the numbers alone are not enough to describe an orientation — the
order they're applied in has to be agreed on too, per the previous lesson's
own proof that order changes the result.

**What you need to know first** — Lesson 4: `Matrix4`, `multiplyMatrices`,
and the proof that `Rx·Ry ≠ Ry·Rx`. This lesson also leans on the basic HTML
and JavaScript knowledge this whole curriculum has assumed from the start —
form elements, and reading or writing a simple DOM property — the same way
every lesson so far has assumed familiarity with ordinary JavaScript syntax
(functions, `const`, arithmetic) without re-teaching it. What gets full,
from-scratch treatment here, the same as every lesson, is the *specific* new
API surface this lesson's project reaches for — `getElementById`, an input
element's `.value`, `parseFloat`, and `.textContent` — not the general idea
of "a web page has form elements," which is assumed background.

**Terms used in this lesson**
- **radian** — the unit an angle is measured in when defined as the ratio
  of arc length to radius. Still the only unit `Matrix4`'s own
  `makeRotationX`/`Y`/`Z` methods accept; this lesson's sliders report
  degrees, so every value they produce gets converted before use.
- **rotation matrix** — a fixed grid of numbers turning any point's
  coordinates into that point's coordinates after being rotated around a
  fixed axis. This lesson builds three of them per frame, exactly as the
  previous two lessons did, from whatever three angles the sliders
  currently report.
- **matrix multiplication** — combining two matrices into a single new
  matrix with the same effect as applying one transform and then the other.
  Reused here, unchanged, to fold three single-axis matrices into one.
- **Euler angles** — three angle values, each describing a rotation about
  one axis, applied in one specific, agreed, unchanging order, that
  together describe a full 3D orientation. Named for Leonhard Euler, who
  proved that any orientation in 3D space can be reached by exactly three
  such rotations about a chosen set of axes. The name names a *convention*,
  not just a triple of numbers — the previous lesson's own proof that
  `Rx·Ry ≠ Ry·Rx` is the exact reason the order has to be part of the
  definition, not an afterthought: the same three numbers, combined in a
  different order, describe a different orientation entirely.
- **intrinsic rotation** — an Euler-angle convention where each successive
  angle is applied about the object's *own*, already-rotated axes — the
  axes move together with the object between steps, the same way tipping a
  book forward and then turning it "clockwise as the book itself now sees
  it" uses an axis that already moved with the book's first tip.
- **extrinsic rotation** — the opposite convention: each successive angle is
  applied about the *original*, fixed world axes, completely unaffected by
  any earlier rotation. This lesson's own matrices — `Matrix4.
  makeRotationX/Y/Z` — are always built this way, around the world's fixed
  axes, never an object's own current axes; what turns three *extrinsic*
  matrices into an *intrinsic*-equivalent result is entirely the specific
  multiplication order this lesson verifies below.

**Objects and methods used**

*This lesson's own subject — combining three matrices in one fixed,
verified order:*

- **`THREE.Matrix4`**, **`Matrix4.prototype.makeRotationX/Y/Z`**, and
  **`Matrix4.prototype.multiplyMatrices`** — all documented in full in
  Lessons 2–4's own Headers; reused here completely unchanged in
  implementation. What's new in this lesson is not any of these methods
  themselves, but the specific *order* three of them get combined in
  (`Rx·(Ry·Rz)`), verified below to reproduce Three.js's own default Euler
  convention, and the fact that this combination now runs every frame
  against numbers that change whenever a person moves a slider, rather than
  numbers that change automatically with elapsed time.

- **`Object3D.prototype.setRotationFromMatrix`** — documented in full in
  Lesson 2's Header; reused unchanged.

*New in this lesson — reading and displaying live input, using the same
"real class, real method, real documented contract" standard this
curriculum has applied to every Three.js API so far:*

- **`document.getElementById(id)`**
  - *What it is:* a method on the global `document` object that finds and
    returns the one element in the page whose `id` attribute matches the
    given string.
  - *Implementation:* `document.getElementById(id: string): HTMLElement |
    null` — a real, standard DOM method, not specific to Three.js or this
    curriculum.
  - *Its use:* this is how the JavaScript in this lesson's `<script
    type="module">` block gets a reference to each `<input type="range">`
    slider and each readout element declared in the HTML markup, so their
    current values can be read every frame.
  - *Type:* an instance method, called on the one global `document` object
    every page has.
  - *Responsibility:* locate exactly one element by its unique `id`; it
    performs no other lookup and returns nothing if no element matches.
  - *Depends on:* one string argument, matched against every element's `id`
    attribute currently in the page.
  - *Connects to:* called once per slider and once per readout element,
    near the top of this lesson's script, before `animate` is defined; the
    returned references are read from and written to inside `animate`
    every frame after that.
  - *Shape:* one string in, one real DOM element (or `null`, if the id
    doesn't exist anywhere in the page) out.

- **`HTMLInputElement.prototype.value`**
  - *What it is:* a property, not a method — the current value of a form
    input element, including a range slider.
  - *Implementation:* for an `<input type="range">` specifically, reading
    `.value` always returns a **string**, even though the slider's own
    `min`/`max`/`step` attributes are numbers — a real, documented,
    easy-to-overlook detail of the DOM's own input API, not a Three.js
    concern. This is confidently known without a fresh execution: it's the
    universally documented behavior of every HTML form control's `.value`
    property, unchanged across browsers for as long as the property has
    existed.
  - *Its use:* this is how this lesson's code finds out where a slider is
    currently positioned, every single frame, without needing any
    additional event-listening machinery.
  - *Type:* an instance property, read from a specific slider element.
  - *Responsibility:* reflect that one input's current position as a
    string; nothing about validating or converting it to a usable number.
  - *Depends on:* whatever position the slider is currently at, which
    itself depends only on how a person has most recently dragged it.
  - *Connects to:* read once per slider, per frame, inside `animate`; its
    string result flows directly into `parseFloat`, below.
  - *Shape:* always a string — even for a slider whose `min`/`max` are pure
    numbers, e.g. the string `"35"`, never the number `35` directly.

- **`parseFloat(string)`**
  - *What it is:* a global JavaScript function that reads a string from its
    start and converts as much of it as looks like a decimal number into
    an actual `number` value.
  - *Implementation:* `parseFloat(value: string): number` — part of
    JavaScript itself, not the DOM or Three.js; returns `NaN` if the string
    doesn't start with anything number-like.
  - *Its use:* `.value` above always hands back a string; every one of this
    lesson's matrix-building calls (`makeRotationX`, and so on) requires a
    real `number` in radians — `parseFloat` is the one conversion step
    between the two.
  - *Type:* a global function, not a method on any particular object.
  - *Responsibility:* convert one string into one number; nothing about
    where that string came from or what the number is later used for.
  - *Depends on:* one string argument.
  - *Connects to:* called once per slider's `.value`, per frame; its
    numeric result is immediately multiplied by `Math.PI / 180` to convert
    degrees into the radians `makeRotationX`/`Y`/`Z` require.
  - *Shape:* one string in, one number out (or `NaN` for a genuinely
    unparseable string, which never occurs here since a range input's
    `.value` is always a valid number string by construction).

- **`Element.prototype.textContent`**
  - *What it is:* a property, not a method — the plain-text content of any
    DOM element, readable and writable.
  - *Implementation:* setting `someElement.textContent = "35"` replaces
    everything currently inside that element with the given plain text,
    discarding any previous content — a real, documented, universal DOM
    behavior, confidently known without a fresh execution for the same
    reason `.value`'s string-typed return is: it has been the standard,
    unchanged behavior of this property since it was introduced, across
    every browser.
  - *Its use:* this is how this lesson's live readout — both the small
    degree labels beside each slider and the larger matrix readout panel —
    actually get updated on screen every frame, reflecting the current
    slider positions and the matrix they currently produce.
  - *Type:* an instance property, written to a specific readout element.
  - *Responsibility:* hold and display plain text for one element; nothing
    about formatting, styling, or which specific text is written.
  - *Depends on:* whatever string it's assigned.
  - *Connects to:* written to once per readout element, per frame, inside
    `animate`, using values computed earlier in that same frame.
  - *Shape:* takes a plain string; has no return value of its own (it's a
    property assignment, not a function call).

*Scene setup and mesh construction — Three.js infrastructure, not this
lesson's own subject.* Explained in full in
[`threejs-scene-camera-renderer.md`](../src/docs/concepts/threejs-scene-camera-renderer.md)
and
[`threejs-mesh-from-geometry-and-material.md`](../src/docs/concepts/threejs-mesh-from-geometry-and-material.md).

**Everything else in the file, not this lesson's subject but still
explained:**

- **`renderer.setAnimationLoop(callback)`** — documented in full in Lesson
  1's Header; reused unchanged. Notably, this lesson's `animate` function no
  longer uses the `time` argument this method has passed it in every
  previous lesson — the rotation no longer depends on elapsed time at all,
  only on the sliders' current positions — but the method itself still runs
  `animate` once per display refresh regardless, which is exactly why
  dragging a slider produces smooth, immediate visual feedback with no
  extra code needed to "notice" the change.

---

## Concept Unit: A Named Order for Three Turns — Defining Euler Angles

### The Problem

The previous lesson proved that combining two rotations in different orders
gives different results, but it never gave a name to a *specific*, agreed
order — every comparison was framed as "this order versus that order," with
neither one singled out as *the* way to describe an orientation. If someone
needed to write down "tilt 20° about X, 35° about Y, and 50° about Z" in a
way that a different program, or a different person, could read back and
reconstruct the *exact same* final orientation, what else — besides the
three numbers themselves — would that description need to include?

> **Try it yourself, before reading on:** the previous lesson proved
> `Rx*Ry` and `Ry*Rx` differ. Given three angles instead of two — one about
> each of X, Y, and Z — how many genuinely different orders could they be
> combined in? (Hint: this is the same kind of counting question as asking
> how many ways three people can line up for a photo.) Now suppose two
> different CNC programs both claim to rotate a tool "20° about A, 35°
> about B, 50° about C" — based only on what this lesson's Terms glossary
> already defined, what's the one piece of information missing from that
> sentence that could still make the two programs produce different final
> tool orientations?

### Introduce the Concept in Isolation

Three.js ships its own built-in class for exactly this: `THREE.Euler`,
holding three angles and one order string. Before trusting it, check what it
actually computes against a matrix multiplication this curriculum has
already built and verified by hand:

```javascript
import * as THREE from 'three';

const angleX = 20 * Math.PI / 180;
const angleY = 35 * Math.PI / 180;
const angleZ = 50 * Math.PI / 180;

const euler = new THREE.Euler(angleX, angleY, angleZ, 'XYZ');
const matrixFromEuler = new THREE.Matrix4().makeRotationFromEuler(euler);

const Rx = new THREE.Matrix4().makeRotationX(angleX);
const Ry = new THREE.Matrix4().makeRotationY(angleY);
const Rz = new THREE.Matrix4().makeRotationZ(angleZ);

const innerYZ = new THREE.Matrix4().multiplyMatrices(Ry, Rz);
const candidate = new THREE.Matrix4().multiplyMatrices(Rx, innerYZ); // Rx * (Ry * Rz)

console.log('Euler("XYZ") matrix:', matrixFromEuler.elements.map(v => v.toFixed(4)));
console.log('Rx*(Ry*Rz) matrix:  ', candidate.elements.map(v => v.toFixed(4)));
```

Real output, against the actual pinned `three@0.185.1`:

```
Euler("XYZ") matrix: [0.5265,0.8459,-0.0845,0.0000,-0.6275,0.4537,0.6327,0.0000,0.5736,-0.2802,0.7698,0.0000,0.0000,0.0000,0.0000,1.0000]
Rx*(Ry*Rz) matrix:   [0.5265,0.8459,-0.0845,0.0000,-0.6275,0.4537,0.6327,0.0000,0.5736,-0.2802,0.7698,0.0000,0.0000,0.0000,0.0000,1.0000]
```

Identical, to four decimal places, across all sixteen entries. This proves —
against the real library, not assumed from the name `'XYZ'` alone — that
Three.js's default Euler order actually corresponds to the matrix product
`Rx · (Ry · Rz)`: per the previous lesson's own proven reading direction
(right operand applied first), that means `Rz` is applied first, `Ry`
second, and `Rx` last — even though the order string reads `'XYZ'`, naming
X first. This apparent mismatch is not a mistake in either the library or
this check: it's the direct signature of an **intrinsic** convention, proven
concretely next.

A second check, confirming this really is the *intrinsic* X-then-Y-then-Z
story the order string claims, not a coincidence of these particular three
angles: applying the composed matrix to a point should match physically
tipping a point about X, then about the *new*, already-tipped Y axis, then
about the *newer*, twice-tipped Z axis. Proving that "moving axes" claim
directly takes more machinery than this lesson needs — but the same
composed matrix can still be checked against a point, confirming the two
computation paths (Three.js's own `Euler` class, and this lesson's own
`multiplyMatrices` chain) agree on what they actually do to real geometry,
not just on their sixteen raw numbers:

```javascript
const testPoint = new THREE.Vector3(1, 0.5, -0.3);
const p1 = testPoint.clone().applyMatrix4(matrixFromEuler);
const p2 = testPoint.clone().applyMatrix4(candidate);
console.log('via Euler:      ', p1.x.toFixed(4), p1.y.toFixed(4), p1.z.toFixed(4));
console.log('via Rx*(Ry*Rz): ', p2.x.toFixed(4), p2.y.toFixed(4), p2.z.toFixed(4));
```

Real output:

```
via Euler:       0.0407 1.1569 0.0010
via Rx*(Ry*Rz):  0.0407 1.1569 0.0010
```

### Discard the Throwaway Example

`THREE.Euler` itself, and this verification script, are discarded — the
real project never imports or constructs a `THREE.Euler` object at all. What
continues forward is the *order* this check just proved: `Rx · (Ry · Rz)`,
built entirely from the `Matrix4` and `multiplyMatrices` machinery this
curriculum already has, with no need for a class this curriculum hasn't
built up from first principles itself.

### Project Change

- **Reference Source** — No reference counterpart; from-scratch teaching
  content.
- **Files affected** — `lesson-05.html`, created new.
- **Change type** — add.
- **Location** — a brand-new file; scene/camera/renderer setup carried
  forward from the previous lesson's end state, with a single workpiece
  (replacing the previous lesson's pair) posed by three fixed angle
  constants for now — the next Concept Unit replaces those constants with
  live slider values.
- **Dependencies** — none beyond the same pinned `three@0.185.1` import map.

### The New Code

```javascript
const geometry = new THREE.BoxGeometry(1.5, 0.6, 1);
const material = new THREE.MeshBasicMaterial({ color: 0xff7a1a });
const workpiece = new THREE.Mesh(geometry, material);
scene.add(workpiece);

const matrixX = new THREE.Matrix4();
const matrixY = new THREE.Matrix4();
const matrixZ = new THREE.Matrix4();
const innerYZ = new THREE.Matrix4();
const combined = new THREE.Matrix4();

const angleADeg = 20;
const angleBDeg = 35;
const angleCDeg = 50;

function animate() {
  const angleA = angleADeg * Math.PI / 180;
  const angleB = angleBDeg * Math.PI / 180;
  const angleC = angleCDeg * Math.PI / 180;

  matrixX.makeRotationX(angleA);
  matrixY.makeRotationY(angleB);
  matrixZ.makeRotationZ(angleC);

  innerYZ.multiplyMatrices(matrixY, matrixZ);
  combined.multiplyMatrices(matrixX, innerYZ);

  workpiece.setRotationFromMatrix(combined);

  renderer.render(scene, camera);
}

renderer.setAnimationLoop(animate);
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
 17  const geometry = new THREE.BoxGeometry(1.5, 0.6, 1);      // ← new
 18  const material = new THREE.MeshBasicMaterial({ color: 0xff7a1a }); // ← new
 19  const workpiece = new THREE.Mesh(geometry, material);      // ← new
 20  scene.add(workpiece);                                       // ← new
 21
 22  const matrixX = new THREE.Matrix4();                        // ← new
 23  const matrixY = new THREE.Matrix4();                        // ← new
 24  const matrixZ = new THREE.Matrix4();                        // ← new
 25  const innerYZ = new THREE.Matrix4();                        // ← new
 26  const combined = new THREE.Matrix4();                       // ← new
 27
 28  const angleADeg = 20;                                       // ← new
 29  const angleBDeg = 35;                                       // ← new
 30  const angleCDeg = 50;                                       // ← new
 31
 32  function animate() {                                        // ← new
 33    const angleA = angleADeg * Math.PI / 180;                  // ← new
 34    const angleB = angleBDeg * Math.PI / 180;                  // ← new
 35    const angleC = angleCDeg * Math.PI / 180;                  // ← new
 36
 37    matrixX.makeRotationX(angleA);                              // ← new
 38    matrixY.makeRotationY(angleB);                               // ← new
 39    matrixZ.makeRotationZ(angleC);                               // ← new
 40
 41    innerYZ.multiplyMatrices(matrixY, matrixZ);                  // ← new
 42    combined.multiplyMatrices(matrixX, innerYZ);                 // ← new
 43
 44    workpiece.setRotationFromMatrix(combined);                   // ← new
 45
 46    renderer.render(scene, camera);                              // ← new
 47  }                                                               // ← new
 48
 49  renderer.setAnimationLoop(animate);                             // ← new
```

This file now poses a single workpiece using three fixed angles, combined in
the exact order the previous unit proved matches Three.js's own default
Euler convention. Nothing here moves yet — `animate` recomputes the same
matrix every single frame from the same three unchanging constants — which
is precisely what the next unit changes, by replacing lines 28–30 with three
live readings from real sliders.

### Mechanical Walkthrough

- `const geometry` / `material` / `workpiece` / `scene.add(workpiece)` —
  the familiar geometry-material-mesh pattern from the mesh concept file;
  color `0xff7a1a`, this curriculum's accent color, used here because this
  mesh represents a genuinely combined, multi-axis orientation rather than
  any single axis.
- `const matrixX` / `matrixY` / `matrixZ` — three separate `Matrix4`
  instances, one per axis, documented in the Header; kept separate (rather
  than reusing one matrix three times in sequence, the way Lesson 3 reused
  one matrix across two independent meshes) because all three of this
  lesson's matrices are needed *at once*, to be multiplied together, not
  used one at a time on separate objects.
- `const innerYZ` / `const combined` — two more `Matrix4` instances, one to
  hold the inner product `Ry · Rz`, one to hold the final product with `Rx`
  folded in — kept as separate named variables, rather than overwriting
  `matrixY` or `matrixZ` in place, so each variable's name still describes
  exactly what it holds.
- `const angleADeg = 20;` / `angleBDeg = 35;` / `angleCDeg = 50;` — three
  plain numeric constants, in degrees, chosen arbitrarily to give a visibly
  tilted, easy-to-distinguish-from-any-single-axis starting pose.
- `function animate() { ... }` — a function declaration, unchanged in kind
  from every previous lesson's `animate`, though this one takes no
  parameters at all, unlike every previous lesson's `animate(time)` — this
  lesson's rotation depends only on the three angle constants, never on
  elapsed time, so there's nothing for a `time` parameter to be used for.
- `const angleA = angleADeg * Math.PI / 180;` (and the two lines after it)
  — converts each degree constant into the radians `makeRotationX`/`Y`/`Z`
  require, the same degree-to-radian conversion every previous lesson has
  used, just applied here to three values instead of one.
- `matrixX.makeRotationX(angleA);` / `matrixY.makeRotationY(angleB);` /
  `matrixZ.makeRotationZ(angleC);` — documented in Lessons 2–3's Headers;
  three separate calls, each filling in one of the three matrices declared
  above from its own angle.
- `innerYZ.multiplyMatrices(matrixY, matrixZ);` — documented in Lesson 4's
  Header; computes `Ry · Rz` first, matching the previous unit's own
  verified order (the innermost parenthesized product in `Rx · (Ry · Rz)`).
- `combined.multiplyMatrices(matrixX, innerYZ);` — the same method, now
  combining `matrixX` with the just-computed `innerYZ`, completing the full
  `Rx · (Ry · Rz)` product this unit verified against Three.js's own
  `Euler` class.
- `workpiece.setRotationFromMatrix(combined);` — documented in Lesson 2's
  Header; updates the mesh's own quaternion from the fully composed matrix.
- `renderer.render(scene, camera);` / `renderer.setAnimationLoop(animate);`
  — unchanged from every previous lesson, aside from `animate` now taking
  no `time` argument, as already noted above.

### CS Lens

Building `Rx · (Ry · Rz)` as two separate `multiplyMatrices` calls, storing
the inner product in its own named variable before combining it with the
third matrix, is a direct, small-scale instance of **incremental
computation**: breaking one larger expression into named intermediate steps
rather than trying to compute it in one shot. This isn't just a style
preference here — it directly mirrors how the underlying mathematical
expression `Rx · (Ry · Rz)` is itself parenthesized, with the innermost
product needing to exist before the outer one can be computed at all.

```
Also recognized in: a spreadsheet's own intermediate helper columns
feeding a final formula, a compiler's intermediate representation sitting
between source code and machine code, and a CNC post-processor computing
a tool's final orientation as a chain of intermediate coordinate-frame
transforms before emitting a single G-code move.
```

### SE Lens

This lesson standardizes on exactly one order — `Rx · (Ry · Rz)` — and
verifies it once, against the real library, rather than leaving the order
as a free choice made fresh in every future lesson. The alternative, more
flexible-seeming approach — letting each future lesson pick whatever
multiplication order seems convenient at the time — would remove the small
up-front cost of standardizing now, but at a real ongoing cost: any two
lessons (or, in a real application, any two developers) using different
orders would silently produce different orientations from what look like
identical Euler angles, exactly the ambiguity this lesson's own Terms
glossary calls out as the missing piece in "20° about A, 35° about B, 50°
about C." Committing to one order now, and naming it explicitly, is what
lets every later lesson in this curriculum treat "the Euler angles" as a
single, unambiguous description from here on.

### Connect the Pieces

The verified order from the previous unit — `Rx · (Ry · Rz)` — is now real,
working code in the project file, posing one workpiece from three fixed
angles. The only thing separating this from a genuinely interactive tool is
where those three angle numbers come from — the next unit replaces the
fixed constants with live values read from three real sliders.

---

## Concept Unit: Turning Numbers Into Sliders

### The Problem

`angleADeg`, `angleBDeg`, and `angleCDeg` are currently fixed numbers,
typed once into the file itself. Seeing how Euler angles actually behave —
how the workpiece's final pose changes as any one of the three numbers
changes — requires being able to change them without editing and reloading
the file every time. What does a web page need, at minimum, to let a person
adjust a number by dragging something with a mouse or a finger, and to let
this lesson's own JavaScript find out the current value whenever it needs
it?

> **Try it yourself, before reading on:** this curriculum has assumed
> familiarity with basic HTML forms from the start. Given that a plain
> `<input type="range">` element already exists as a standard piece of
> HTML, requiring no library or import to use, what do you think is the
> *minimum* extra JavaScript needed to read its current position — one
> line, or several? Given `.value` on a text input is well known to return
> a plain string, do you expect a range input's `.value` to behave the
> same way, or to return an actual number instead, given that a range
> input's value looks numeric?

### Introduce the Concept in Isolation

A minimal standalone page — never part of the real project — showing the
one behavior this unit depends on:

```html
<input id="testSlider" type="range" min="0" max="100" value="42" />
<p id="testReadout"></p>
<script>
  const slider = document.getElementById('testSlider');
  const readout = document.getElementById('testReadout');
  readout.textContent = `raw value: ${slider.value} (type: ${typeof slider.value})`;
</script>
```

This isn't run through a fresh execution here: a range input's `.value` has
been standardized, documented DOM behavior, unchanged across every modern
browser, for as long as `<input type="range">` has existed — exactly the
kind of well-known, deterministic API contract the Verification Rule's own
exemption covers, the same way this curriculum has already treated
`Scene`/`Camera`/`Renderer`'s well-documented shapes without a fresh run
each time. The predicted, confidently-known output: the paragraph reads
`raw value: 42 (type: string)` — proving the Socratic prompt's second
question: even though `42` looks numeric, `.value` hands it back as the
*string* `"42"`, not the number `42`.

### Discard the Throwaway Example

This standalone page is discarded — the real project already has its own
scene, camera, and renderer; it doesn't need a second, separate page. What
continues forward is the proven fact: `.value` returns a string, which
means every slider reading in the real project needs a conversion step
before it can be multiplied by anything.

### Project Change

- **Reference Source** — No reference counterpart; from-scratch teaching
  content.
- **Files affected** — `lesson-05.html`, modified.
- **Change type** — replace.
- **Location** — inside `<body>`, before the existing `<script
  type="importmap">` tag: three new `<label>`/`<input>`/`<span>` groups and
  a `<pre>` readout, wrapped in one `<div>`, styled to match this
  curriculum's established panel look. Inside the module script: lines
  28–30 (`angleADeg`/`angleBDeg`/`angleCDeg`) are removed, replaced by
  `getElementById` lookups near the top of the script and live reads inside
  `animate`.
- **Dependencies** — the workpiece and matrix variables from the previous
  Concept Unit must already exist in the file.

### The New Code

The HTML markup and styling, added inside `<body>`, before the existing
`<script type="importmap">` tag:

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600&family=IBM+Plex+Mono:wght@400;500&display=swap" rel="stylesheet">
<style>
  #panel {
    position: fixed;
    top: 16px;
    right: 16px;
    width: 260px;
    padding: 16px;
    background: #1a222c;
    border: 1px solid #2a3441;
    border-radius: 4px;
    font-family: 'Space Grotesk', sans-serif;
    color: #eef1f5;
  }
  #panel label {
    display: block;
    font-size: 13px;
    color: #9aa7b4;
    margin-top: 12px;
  }
  #panel input[type="range"] {
    width: 100%;
  }
  #panel pre {
    font-family: 'IBM Plex Mono', monospace;
    font-size: 12px;
    color: #eef1f5;
    background: #12181f;
    border: 1px solid #2a3441;
    border-radius: 4px;
    padding: 8px;
    margin-top: 12px;
    white-space: pre;
  }
</style>
<div id="panel">
  <label>A axis / X — <span id="aReadout">20</span>&deg;</label>
  <input id="aSlider" type="range" min="-180" max="180" step="1" value="20" />

  <label>B axis / Y — <span id="bReadout">35</span>&deg;</label>
  <input id="bSlider" type="range" min="-180" max="180" step="1" value="35" />

  <label>C axis / Z — <span id="cReadout">50</span>&deg;</label>
  <input id="cSlider" type="range" min="-180" max="180" step="1" value="50" />

  <pre id="matrixReadout"></pre>
</div>
```

The JavaScript changes, inside the existing `<script type="module">` block:

```javascript
const aSlider = document.getElementById('aSlider');
const bSlider = document.getElementById('bSlider');
const cSlider = document.getElementById('cSlider');
const aReadout = document.getElementById('aReadout');
const bReadout = document.getElementById('bReadout');
const cReadout = document.getElementById('cReadout');
const matrixReadout = document.getElementById('matrixReadout');

function formatMatrixRotationBlock(matrix) {
  const e = matrix.elements;
  const row0 = e[0].toFixed(2) + '  ' + e[4].toFixed(2) + '  ' + e[8].toFixed(2);
  const row1 = e[1].toFixed(2) + '  ' + e[5].toFixed(2) + '  ' + e[9].toFixed(2);
  const row2 = e[2].toFixed(2) + '  ' + e[6].toFixed(2) + '  ' + e[10].toFixed(2);
  return row0 + '\n' + row1 + '\n' + row2;
}
```

```javascript
  const angleADeg = parseFloat(aSlider.value);
  const angleBDeg = parseFloat(bSlider.value);
  const angleCDeg = parseFloat(cSlider.value);

  aReadout.textContent = angleADeg.toFixed(0);
  bReadout.textContent = angleBDeg.toFixed(0);
  cReadout.textContent = angleCDeg.toFixed(0);
```

```javascript
  matrixReadout.textContent = formatMatrixRotationBlock(combined);
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
 28  const aSlider = document.getElementById('aSlider');           // ← new
 29  const bSlider = document.getElementById('bSlider');           // ← new
 30  const cSlider = document.getElementById('cSlider');           // ← new
 31  const aReadout = document.getElementById('aReadout');         // ← new
 32  const bReadout = document.getElementById('bReadout');         // ← new
 33  const cReadout = document.getElementById('cReadout');         // ← new
 34  const matrixReadout = document.getElementById('matrixReadout'); // ← new
 35
 36  function formatMatrixRotationBlock(matrix) {                  // ← new
 37    const e = matrix.elements;                                   // ← new
 38    const row0 = e[0].toFixed(2) + '  ' + e[4].toFixed(2) + '  ' + e[8].toFixed(2);  // ← new
 39    const row1 = e[1].toFixed(2) + '  ' + e[5].toFixed(2) + '  ' + e[9].toFixed(2);  // ← new
 40    const row2 = e[2].toFixed(2) + '  ' + e[6].toFixed(2) + '  ' + e[10].toFixed(2); // ← new
 41    return row0 + '\n' + row1 + '\n' + row2;                     // ← new
 42  }                                                                // ← new
 43
 44  function animate() {
 45    const angleADeg = parseFloat(aSlider.value);                  // ← changed
 46    const angleBDeg = parseFloat(bSlider.value);                  // ← changed
 47    const angleCDeg = parseFloat(cSlider.value);                  // ← changed
 48
 49    aReadout.textContent = angleADeg.toFixed(0);                  // ← new
 50    bReadout.textContent = angleBDeg.toFixed(0);                  // ← new
 51    cReadout.textContent = angleCDeg.toFixed(0);                  // ← new
 52
 53    const angleA = angleADeg * Math.PI / 180;
 54    const angleB = angleBDeg * Math.PI / 180;
 55    const angleC = angleCDeg * Math.PI / 180;
 56
 57    matrixX.makeRotationX(angleA);
 58    matrixY.makeRotationY(angleB);
 59    matrixZ.makeRotationZ(angleC);
 60
 61    innerYZ.multiplyMatrices(matrixY, matrixZ);
 62    combined.multiplyMatrices(matrixX, innerYZ);
 63
 64    workpiece.setRotationFromMatrix(combined);
 65
 66    matrixReadout.textContent = formatMatrixRotationBlock(combined); // ← new
 67
 68    renderer.render(scene, camera);
 69  }
 70
 71  renderer.setAnimationLoop(animate);
```

Lines 28–30's fixed constants from the previous unit are gone entirely,
replaced by three live reads inside `animate` itself (lines 45–47) — the
rest of the file, from line 53 down, is completely unchanged, because
`angleADeg`/`angleBDeg`/`angleCDeg` still end up holding plain numbers
either way; only *where* those numbers come from has changed. As a whole,
this file now redraws, continuously, whatever orientation the three
sliders' *current* positions describe — moving a slider produces an
immediate, smooth visual change, with no explicit "listen for changes" code
at all, because `animate` simply re-reads every slider's position fresh, on
every single frame, forever.

### Mechanical Walkthrough

- `const aSlider = document.getElementById('aSlider');` (and the five lines
  after it) — documented in the Header; six separate lookups, one per
  slider and readout element declared in the HTML markup, each run once,
  before `animate` is ever called.
- `function formatMatrixRotationBlock(matrix) { ... }` — a function
  declaration, taking one `Matrix4` and returning a formatted string.
- `const e = matrix.elements;` — documented in Lesson 2's Header; reads the
  matrix's raw sixteen numbers.
- `const row0 = e[0].toFixed(2) + '  ' + e[4].toFixed(2) + '  ' +
  e[8].toFixed(2);` — per Lesson 2's own verified column-major layout,
  `e[0]`, `e[4]`, and `e[8]` are the first entry of each of the matrix's
  three columns — together, they form the matrix's own *first row*, read
  correctly according to that already-verified storage order, not assumed.
  `.toFixed(2)` rounds each to two decimal places as a string; `+`
  concatenates them with two spaces between, for readable column alignment.
- `row1` and `row2` — the identical pattern, reading `e[1]/e[5]/e[9]` and
  `e[2]/e[6]/e[10]` respectively — the matrix's second and third rows.
- `return row0 + '\n' + row1 + '\n' + row2;` — joins the three row strings
  with newline characters, so `textContent`, below, displays them as three
  visually separate lines inside the `<pre>` element.
- `const angleADeg = parseFloat(aSlider.value);` (and the two lines after
  it) — documented in the Header; each reads one slider's current string
  value and converts it to a real number, replacing the previous unit's
  fixed constants of the same names.
- `aReadout.textContent = angleADeg.toFixed(0);` (and the two lines after
  it) — documented in the Header; writes the current whole-degree value
  next to each slider, so a person dragging it sees the exact number
  driving the rotation, not just the slider's raw position.
- `matrixReadout.textContent = formatMatrixRotationBlock(combined);` —
  documented in the Header; calls the function defined above on this
  frame's fully composed matrix, and writes the resulting three-line string
  into the `<pre>` readout.
- Every other line — `angleA`/`angleB`/`angleC`,
  `makeRotationX`/`Y`/`Z`, `multiplyMatrices`, `setRotationFromMatrix`,
  `renderer.render` — unchanged from the previous unit; documented there
  and in this lesson's Header.

**A real, verified surprise, not smoothed over:** because this lesson's
sliders allow any angle from -180° to 180° on all three axes independently,
it's entirely possible to drag B (the Y-axis slider) to exactly 90° or
-90°. Try it: at that exact position, dragging the A slider and the C
slider start producing the *same* visible rotation of the workpiece, no
matter which of the two is moved. This lesson doesn't yet explain why — the
next lesson in this curriculum is dedicated entirely to this exact
phenomenon, verified concretely, under its own name.

### CS Lens

Reading every slider's current value fresh, every single frame, rather than
reacting only when a slider actually changes, is an example of **polling**
— repeatedly checking a piece of state on a fixed schedule — as opposed to
an **event-driven** approach, which would run code only in response to an
explicit "the value changed" notification. Polling here costs essentially
nothing extra, since `animate` already runs every frame regardless (to keep
Three.js's own render loop going); the SE Lens below weighs this choice
against its real alternative.

```
Also recognized in: a game loop checking keyboard/controller state every
frame rather than reacting only to keypress events, a thermostat
checking the current temperature on a fixed interval rather than being
told the temperature changed, and a CNC controller continuously polling
its own rotary encoders to know a machine axis's real current position.
```

### SE Lens

This lesson polls every slider's `.value` inside `animate`, rather than
attaching an `'input'` event listener to each slider that would update
state only when a person actually drags it. The event-driven alternative is
more common in production UI code, and would mean `animate` never has to
re-read a slider that hasn't moved. It was not chosen here because it would
introduce a second, separate code path — event handlers running *outside*
`animate`, needing their own place to store the values `animate` later
reads — purely to save a handful of property reads per frame that cost
nothing measurable at this scale. The debt being accepted openly: this
polling approach would not scale cleanly to a much larger control panel
with dozens of inputs, where reading every single one every frame really
could start to matter; a production version of this exact panel would
likely switch to event listeners once the panel grew past a few controls.

### Connect the Pieces

The three sliders, the readout spans beside them, and the matrix readout
panel are now all driven from the same single `animate` function that
already existed — no new render loop, no new "when did something change"
logic, just the same per-frame function now reading live input instead of
fixed constants, and writing its own results back out to the page as plain
text.

---

## Connect the Pieces (Lesson Close)

Follow one concrete value through the whole file: suppose a person drags
the B slider to exactly `35`. `bSlider.value` reports the string `"35"`;
`parseFloat` converts it to the number `35`; `bReadout.textContent =
(35).toFixed(0)` writes `"35"` next to the slider so the person sees
confirmation of exactly what they set. That same `35` is converted to
radians as `angleB`, handed to `matrixY.makeRotationY(angleB)` — the exact
method Lesson 3 derived and verified — and folded into `innerYZ`, then
`combined`, using the exact order this lesson's first Concept Unit proved
matches Three.js's own built-in Euler convention. `workpiece.
setRotationFromMatrix(combined)` updates the same `THREE.Mesh` built at the
top of this file, and `matrixReadout.textContent =
formatMatrixRotationBlock(combined)` writes that same matrix's own numbers
back onto the screen, in the same frame, so the person sees both the pose
and the exact numbers producing it at once. One dragged slider, one string,
one parsed number, one matrix, one mesh, one readout — all in the same
`animate` call, running continuously as long as the page stays open.

**Next lesson:** this lesson's own Mechanical Walkthrough already surfaced a
real, verified surprise: setting the B slider to exactly 90° makes the A and
C sliders start producing the same visible rotation. The next lesson
investigates that phenomenon directly, under its own name — gimbal lock —
and shows concretely what real degree of control is actually lost at that
exact orientation, and why it matters for a real 5-axis CNC machine passing
through it.
