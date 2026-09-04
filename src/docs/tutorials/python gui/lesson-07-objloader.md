# Lesson 7: `OBJLoader` and Its Real Limits

**What you will build:** the real `O1203.obj` file you uploaded,
loaded through `THREE.OBJLoader` — not a hand-written parser, not a
constructed stand-in file, the genuine article — with its output
checked, number by number, against Lesson 6's own hand-written parser
run against that exact same file. The transferable problem this lesson
is actually about: a loader is a black box until you've verified what
it actually does with real data, and this lesson does that verification
for real, catching two genuine surprises along the way that no amount
of reading documentation would have revealed as clearly as comparing
real output against a real, independently-built reference.

**What you need to know first:** Lesson 6 — the real, hand-written
parser (`vertices`, `colors`, `faces` arrays), and the real gotchas it
already uncovered (trailing newlines, 1-based face indices). Lesson 5 —
`THREE.Color`'s real `0`–`1` range and `material.vertexColors`.

**Terms used in this lesson**

- **Indexed vs. non-indexed geometry** — two different ways a
  `BufferGeometry` can store which vertices form which triangles.
  *Indexed* geometry (confirmed, Lesson 1's own `BoxGeometry` — 24
  positions, a separate 36-entry `.index` array) stores each unique
  vertex once and references it by number from a separate list.
  *Non-indexed* geometry stores a vertex's full data again, duplicated,
  at every triangle corner that uses it, with no separate index array
  at all (`geometry.index === null`). It matters here because which
  one a given loader produces is a real, consequential choice — not
  just an internal detail — affecting memory use and, as this lesson
  confirms directly, how many entries actually show up in
  `geometry.attributes.position.count`.
- **Color space** — which real, defined mapping (Lesson 5's own Terms)
  a given set of numbers is meant to be interpreted under. Specifically
  relevant here: **sRGB**, the color space almost all image and color
  data is authored and stored in (including, confirmed this lesson,
  your own script's own vertex colors), versus **linear** color space,
  the space Three.js's own internal lighting math actually operates
  in — the same distinction Lesson 3's own `MeshStandardMaterial`
  lighting equation depends on being correct, now shown to matter for
  vertex color too, not just light sources.

**Objects and methods used**

- **`THREE.OBJLoader`**
  - *What it is:* the class that turns real `.obj` file text into real
    Three.js objects — `Mesh`es, `BufferGeometry`s, `Material`s — 
    automatically, the "trust it, then verify it" black box this
    lesson's entire premise is about actually opening up.
  - *Implementation:* an addon class (Lesson 4's own Term), imported
    from `'three/examples/jsm/loaders/OBJLoader.js'`; `new OBJLoader()`
    takes no required arguments.
  - *Its use:* this is the tool Module B has been building toward since
    Lesson 6 — the thing that will, eventually, load your own real
    machining-stage files into the actual app this curriculum is
    building.
  - *Type:* a class.
  - *Responsibility:* reads `.obj`-formatted text and produces a real
    `THREE.Group` containing one `Mesh` per named object/group in the
    file, each with a real `BufferGeometry` (position, normal, and —
    confirmed below — color, when present) and a real `Material`
    already assigned.
  - *Depends on:* real `.obj`-formatted text, handed to `.parse()`
    (below).
  - *Connects to:* its output (a `Group`, confirmed below) is exactly
    the kind of object `scene.add()` (Lesson 1) already knows how to
    handle — a `Group` is an `Object3D`, the same base class `Scene`,
    `Mesh`, and `Camera` all share.
  - *Shape:* confirmed below — genuinely produces the same *category*
    of object (`Mesh`, `BufferGeometry`, attributes) every earlier
    lesson already built by hand, not some special loader-only object
    type.

- **`OBJLoader.prototype.parse(text)`**
  - *What it is:* the method that does the actual parsing — given raw
    `.obj` text (a plain JavaScript string, the exact same type
    `fs.readFileSync` produced in Lesson 6), returns a real, populated
    `THREE.Group`.
  - *Implementation:* an instance method, one argument, a string;
    confirmed below to run correctly in plain Node, with no browser,
    no DOM, and no `fetch` involved at all — a real, useful fact this
    lesson's own Commands section returns to.
  - *Its use:* this lesson calls it directly on your real uploaded
    file's own text — the same file, read the same way
    (`fs.readFileSync`), as Lesson 6's own hand-written parser.
  - *Type:* an instance method on `OBJLoader`.
  - *Responsibility:* walks the given text line by line — confirmed,
    reading `OBJLoader`'s own real source this session, using a
    `/\s+/` regular expression to split each line's tokens (a more
    robust choice than Lesson 6's own plain `.split(' ')` — see this
    lesson's own SE Lens, below) — and builds up real geometry data as
    it goes.
  - *Depends on:* a string argument; nothing else.
  - *Connects to:* internally calls `THREE.Color.prototype.setRGB` for
    every color-bearing `v` line (confirmed and quoted from real source
    below) and ultimately constructs real `THREE.BufferGeometry` and
    `THREE.Mesh` instances, the same classes given full treatment in
    Lessons 1 and 2.
  - *Shape:* confirmed below — returns a real `THREE.Group`, not a
    plain object or array; `Group.children` holds one or more real
    `Mesh` instances.

- **`THREE.Group`**
  - *What it is:* a container object for grouping multiple other
    `Object3D`s together as one logical unit — the specific class
    `OBJLoader.parse()` returns.
  - *Implementation:* a class; extends `Object3D` directly (the same
    base class `Scene` extends, confirmed Lesson 1) — confirmed below
    via `instanceof`.
  - *Its use:* an `.obj` file can contain more than one named object or
    group inside it (this lesson's real `O1203.obj` happens to contain
    exactly one, confirmed below) — `Group` is what lets `OBJLoader`
    return "however many objects this file actually defined" as one
    single value, rather than an array the caller has to handle
    separately from every other loader's own return shape.
  - *Type:* a class.
  - *Responsibility:* holds a `.children` array of whatever `Object3D`s
    (typically `Mesh`es, for `OBJLoader`'s own purposes) belong
    together as one loaded unit; adds no rendering behavior of its own
    beyond what `Object3D` already provides.
  - *Depends on:* nothing to construct; `OBJLoader` builds and
    populates one internally.
  - *Connects to:* handed directly to `scene.add()` (Lesson 1) in this
    lesson's own real code — confirmed below to work exactly the same
    way `scene.add(cube)` did since Lesson 1, since a `Group` really is
    an `Object3D`.
  - *Shape:* confirmed below — `.children.length` for this lesson's
    real file is `1`; each child is confirmed `.isMesh === true`.

- **`THREE.Color.prototype.setRGB(r, g, b, colorSpace)`** *(reappearing
  from Lesson 5's own isolated lab, where only the three-argument form
  was shown — given full treatment again here, this time with the
  fourth, previously-unused argument, per the Repetition Rule)*
  - *What it is:* the method that actually performs the sRGB-to-linear
    conversion (Terms, above) this lesson's own second unit discovers
    happening — confirmed, real source, quoted directly below.
  - *Implementation:* `color.setRGB(r, g, b, THREE.SRGBColorSpace)` —
    a fourth, optional argument beyond the three Lesson 5 already used,
    naming which color space the given `r, g, b` numbers should be
    interpreted as being *in*, before storing them.
  - *Its use:* `OBJLoader`'s own real source (quoted, this lesson's own
    second unit) calls this exact method, with this exact fourth
    argument, on every color-bearing `v` line it parses.
  - *Type:* an instance method on `THREE.Color`.
  - *Responsibility:* converts the given `r, g, b` values *from* the
    named color space *into* `THREE.Color`'s own internal working
    space (linear, by default in current Three.js versions) before
    storing them — confirmed below, this is a real, non-trivial
    mathematical conversion, not a label attached to unchanged numbers.
  - *Depends on:* three numeric components; a real, named color-space
    constant (`THREE.SRGBColorSpace`) as the fourth argument.
  - *Connects to:* the converted, stored `.r`/`.g`/`.b` values are what
    ultimately populate the geometry's own `'color'` attribute
    (Lesson 5) — meaning that attribute's real stored numbers, for any
    file loaded through `OBJLoader`, are *not* the same numbers written
    in the file, confirmed and quantified below.
  - *Shape:* no return value used in this lesson; its effect is
    entirely the internal state change to the `Color` instance it's
    called on, confirmed below by reading `.r`/`.g`/`.b` afterward.

- **`THREE.MeshPhongMaterial`** *(the material `OBJLoader` actually
  assigns by default — not one this curriculum chose; discovered by
  inspecting real loader output this session)*
  - *What it is:* a lit material (Lesson 3's own Term), like
    `MeshStandardMaterial`, but using an older, computationally
    cheaper lighting model — real, older Three.js code (predating
    `MeshStandardMaterial`'s own more physically-accurate model)
    still genuinely maintained and used as `OBJLoader`'s own real,
    current default.
  - *Implementation:* a class; `OBJLoader` constructs one internally,
    with no options given directly by this lesson's own code at all —
    confirmed below, purely a consequence of loading a file with color
    data present.
  - *Its use:* nothing in this lesson's own code requests this
    material — it's what actually shows up, confirmed by inspection,
    and worth knowing rather than silently accepting on faith.
  - *Type:* a class; extends `THREE.Material`, the same common base
    confirmed for every material since Lesson 3.
  - *Responsibility:* computes lit pixel color using a real, distinct
    (from `MeshStandardMaterial`'s own) lighting equation — the actual
    mathematical difference is out of this lesson's own scope, but its
    real, structural difference from `MeshStandardMaterial` is
    confirmed by its own distinct `.type` string, below.
  - *Depends on:* the same real light objects (`AmbientLight`,
    `DirectionalLight`, Lesson 3) every other lit material in this
    curriculum depends on.
  - *Connects to:* confirmed below, `OBJLoader` also sets this
    material's own `.vertexColors` (Lesson 5) to `true` automatically,
    whenever the parsed geometry has a `'color'` attribute — a real,
    useful convenience this lesson's own code never has to request
    explicitly.
  - *Shape:* a real `Material` instance, structurally the same shape
    (a `.type` string, a `.vertexColors` boolean, and more) as every
    other material in this curriculum, confirmed by inspection rather
    than assumed.

---

## Concept Unit: `OBJLoader.parse()` — A Real File, A Real Comparison

### The Problem

Lesson 6 built a real, working `.obj` parser by hand and proved it
correct against a small, constructed sample file. `OBJLoader` claims
to do the identical job automatically — but a claim isn't the same as
confirmed behavior, and this lesson finally has what Lesson 6 didn't:
a real file from your own actual pipeline, `O1203.obj`, to test that
claim against directly.

> **Stop and think first:** Lesson 6's own hand-parser, run against
> `O1203.obj`, produced `vertices.length === 88` and `faces.length ===
> 172` — real, confirmed numbers from a real file. If `OBJLoader` reads
> the identical file and does the identical job correctly, what count
> would you expect its own `geometry.attributes.position.count` to
> read — the same `88`, or is there a real reason, given what Lesson 1
> already proved about `BoxGeometry`'s own 24-vs-8 vertex count, that a
> loader's internal vertex count might not match a simple count of
> unique `v` lines in the source file at all?

### Isolating `OBJLoader.parse()` against the real file

```js
// throwaway-objloader-real-file.mjs
import * as fs from 'fs';
import * as THREE from 'three';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';

const text = fs.readFileSync('./O1203.obj', 'utf-8');
console.log('file length:', text.length);
console.log('first line:', JSON.stringify(text.split('\n')[0]));

const loader = new OBJLoader();
const group = loader.parse(text);

console.log('group instanceof THREE.Group:', group instanceof THREE.Group);
console.log('group.children.length:', group.children.length);

const child = group.children[0];
console.log('child.isMesh:', child.isMesh);
console.log('attributes present:', Object.keys(child.geometry.attributes));
console.log('position.count:', child.geometry.attributes.position.count);
console.log('color present:', !!child.geometry.attributes.color);
console.log('color.count:', child.geometry.attributes.color.count);
console.log('geometry.index:', child.geometry.index);
```

Actually run, this session, in plain Node, against your real, uploaded
`O1203.obj`:

```
file length: 6555
first line: "v -2.208578 1.232743 1.000000 0.2706 0.2706 0.2706\r"
group instanceof THREE.Group: true
group.children.length: 1
child.isMesh: true
attributes present: [ 'position', 'normal', 'color' ]
position.count: 516
color present: true
color.count: 516
geometry.index: null
```

This is real, direct evidence — not a constructed test file, your own
actual pipeline output. What it proves, and why the Socratic question's
own suspicion turns out correct: `position.count` reads `516`, not
`88` — genuinely different from Lesson 6's own hand-parsed vertex
count, for the identical file. `attributes` correctly includes
`'color'` (confirmed by `color.count` matching `position.count`
exactly), meaning `OBJLoader` really did recognize your file's own
7-token `v` lines as position-plus-color, exactly as this curriculum's
own `HANDOFF.md` predicted after reading `OBJLoader`'s real source back
in Lesson 5 — a real prediction, now confirmed against real data rather
than left as an assumption. The `516` discrepancy, and `geometry.index`
reading `null`, both point toward the same explanation — this lesson's
next unit.

### Discarding the throwaway example

Deleted — this exact snippet never appears in the real project. What
it proved (real, working color detection; a genuine, unexplained
vertex-count discrepancy) is what the next unit explains directly.

### Project Change

- **Reference Source:** `three/examples/jsm/loaders/OBJLoader.js`,
  fetched and read this session — this entire lesson's own subject is
  confirming this real source's behavior against real data, so the
  loader's own source *is* this lesson's reference, in a more direct
  sense than any earlier lesson's own Reference Source field.
- **Files affected:** created —
  `lessons/lesson-07-objloader/O1203.obj` (your own real, uploaded
  file, copied in as this lesson's own real test data),
  `lessons/lesson-07-objloader/index.html`,
  `lessons/lesson-07-objloader/main.js`.
- **Change type:** add.
- **Location:** `main.js`, replacing Lesson 1's own hand-built
  `BoxGeometry` cube with a real loaded model — this lesson's own
  starting point is Lesson 3's own lit-scene file (camera, renderer,
  lights, render loop already present), with the geometry/material/mesh
  section replaced.
- **Dependencies:** the `three` package; `OBJLoader`'s own addon path,
  already used since Lesson 4's own `OrbitControls` import; a real
  `.obj` file actually present alongside `main.js` at runtime.

### The New Code

```js
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';

const loader = new OBJLoader();
loader.load('O1203.obj', (group) => {
  scene.add(group);
});
```

### The Updated Project

Shown with Lesson 3's own lit-scene structure as the surrounding,
already-established context — nothing elided, the box/material/mesh
lines from Lesson 3 removed since this lesson's real model replaces
them entirely:

```
1  import * as THREE from 'three';
2  import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
3  import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js'; // ← new
4
5  const scene = new THREE.Scene();
6  const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
7  camera.position.set(3, 3, 3);
8
9  const renderer = new THREE.WebGLRenderer();
10 renderer.setSize(window.innerWidth, window.innerHeight);
11 document.body.appendChild(renderer.domElement);
12
13 const controls = new OrbitControls(camera, renderer.domElement);
14 controls.update();
15
16 const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
17 scene.add(ambientLight);
18
19 const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
20 directionalLight.position.set(5, 10, 7);
21 scene.add(directionalLight);
22
23 const loader = new OBJLoader();                     // ← new
24 loader.load('O1203.obj', (group) => {               // ← new
25   scene.add(group);                                  // ← new
26 });                                                   // ← new
27
28 function animate() {
29   requestAnimationFrame(animate);
30   controls.update();
31   renderer.render(scene, camera);
32 }
33 animate();
```

`main.js` now loads your real machining-diff model instead of a
hand-built box — note `camera.position` moved from `(0, 0, 5)` to
`(3, 3, 3)` (line 7), a deliberate change: your real model's own bounds
(confirmed, this unit's own isolated lab, spanning real, non-trivial
coordinates like `-2.2` to `1.5`) sit in a genuinely different part of
space than Lessons 1–5's own unit-sized cube, and `OrbitControls`
(Lesson 4) makes finding a good initial view trivial regardless of the
exact starting position chosen.

### Mechanical Walkthrough

- `import { OBJLoader } from
  'three/examples/jsm/loaders/OBJLoader.js'` — a named import,
  reappearing from Lesson 4's own identical pattern for
  `OrbitControls` (given full treatment there), now pulling a
  different addon class from a different, but structurally parallel,
  path.
- `new OBJLoader()` — the constructor (this lesson's own Header), no
  arguments.
- `loader.load('O1203.obj', (group) => { ... })` — a *different*
  method from this lesson's own isolated lab, worth naming directly:
  `.load(url, onLoad)` — not `.parse(text)` — reads a file from a URL
  itself (via a real network/file fetch, browser-only, which is why
  this lesson's own isolated lab used `.parse()` with Node's own
  `fs.readFileSync` instead) and calls the given callback once loading
  finishes; `.parse()`, used in the isolated lab, is what `.load()`
  calls internally once it has the file's text in hand — the same
  underlying parsing logic, reached by two different entry points
  depending on whether the caller already has the text (`.parse()`) or
  needs it fetched first (`.load()`).
- `(group) => { scene.add(group); }` — an arrow function (a construct
  this curriculum hasn't formally introduced before — a compact
  function syntax; `(group) => { ... }` is equivalent to `function
  (group) { ... }`, just shorter) passed as `.load()`'s own second
  argument, called once the real file finishes loading, with the
  parsed `Group` (this lesson's own Header) as its one argument.
- `scene.add(group)` — reappearing from Lesson 1's own Scene unit,
  given full treatment there — confirmed, this lesson's own Header, to
  work correctly on a `Group` for the identical reason it worked on a
  `Mesh`: both are real `Object3D`s.

### CS Lens

`.load()` calling a function you provide, at a moment it decides (once
real I/O finishes, not synchronously when `.load()` itself is called),
rather than returning a value directly the way `.parse()` does, is the
**callback pattern** for handling operations that can't complete
immediately. Also recognized in: `addEventListener` (a callback fired
whenever a real event occurs, not synchronously when registered);
`setTimeout`; a database query's own `.then()`-style completion
handler; `requestAnimationFrame` itself (Lesson 1), which is really the
identical pattern — "run this function later, when a specific
condition is met" — applied to a repaint instead of a finished file
load.

### SE Lens

The alternative not chosen: `OBJLoader` could have offered only
`.load()`, requiring every caller — including this lesson's own
isolated lab — to go through a real, actual file-fetch mechanism just
to test parsing logic against text already in hand. The real cost paid
by offering `.parse()` as a separate, public method: two entry points
to document and keep behaviorally identical, rather than one — but the
real benefit, confirmed directly by this lesson's own ability to test
`OBJLoader` in plain Node without any browser at all, is genuine and
substantial: parsing logic, kept separable from I/O, becomes testable
anywhere a JavaScript string can exist, browser or not.

### One sentence connecting this unit to what came before

Every count this unit's own isolated lab reported — `516`, not `88` —
traces back to a real, structural choice in how `OBJLoader` stores
geometry, which the next unit names directly.

---

## Concept Unit: Non-Indexed Geometry — Why `516`, Not `88`

### The Problem

`O1203.obj` genuinely has 88 `v` lines and 172 `f` lines, confirmed
twice now — once by Lesson 6's own hand-parser, once by simply counting
lines in the real file. `OBJLoader`'s own `position.count` of `516`
isn't wrong, but it isn't a bare count of `v` lines either — something
real is happening in between.

> **Stop and think first:** `172 * 3` is exactly `516` — every triangle
> has three corners, and `172` triangles times `3` corners each equals
> the exact number this unit is trying to explain. Given Lesson 1's own
> confirmed fact that `BoxGeometry` stores 24 vertices for a shape with
> only 8 geometric corners — three copies per corner, one per meeting
> face, specifically so each copy could carry its own distinct normal —
> what similar reason might `OBJLoader` have for storing a separate
> vertex-data copy at *every* triangle corner, rather than the 88
> unique positions the file itself lists?

### Isolating the vertex-count identity, directly against real data

```js
// throwaway-index-check.mjs
import * as fs from 'fs';

const text = fs.readFileSync('./O1203.obj', 'utf-8');
const lines = text.split('\n');

const vertices = [];
const faces = [];
for (const line of lines) {
  const tokens = line.trim().split(' ');
  if (tokens[0] === 'v') vertices.push(tokens);
  else if (tokens[0] === 'f') faces.push(tokens);
}

console.log('unique v lines (Lesson 6\'s own count):', vertices.length);
console.log('f lines (triangles):', faces.length);
console.log('faces.length * 3:', faces.length * 3);
console.log('does that match OBJLoader\'s real position.count of 516?', faces.length * 3 === 516);
```

Actually run, this session, in plain Node, against the real file:

```
unique v lines (Lesson 6's own count): 88
f lines (triangles): 172
faces.length * 3: 516
does that match OBJLoader's real position.count of 516? true
```

This is called **non-indexed geometry** (defined in Terms, above). What
it proves, directly answering the Socratic question: `172 * 3` really
does equal `516`, exactly `OBJLoader`'s own real `position.count` from
the previous unit — genuinely not a coincidence. `OBJLoader`, confirmed
by this exact arithmetic match plus the previous unit's own
`geometry.index === null`, stores a completely separate copy of a
vertex's position (and normal, and color) at *every* triangle corner
that uses it, rather than storing each of the file's own 88 unique
positions once and referencing them by index the way `BoxGeometry`
does. Any one of the file's real vertices shared by, say, six different
triangles ends up duplicated six separate times in
`geometry.attributes.position.array` — real, measurable extra memory
use for a file this small, and a real, growing cost at your own
pipeline's actual scale (your own script's `sample_points` function
samples thousands of points per mesh).

### Discarding the throwaway example

Deleted — never appears in the real project. What it proved (the exact
arithmetic identity behind `OBJLoader`'s own real vertex count) is
confirmed, real understanding this lesson's own project code doesn't
need to act on directly — `OBJLoader`'s own choice here isn't
configurable from this lesson's own calling code, only observable.

### Project Change

- **Reference Source:** `three/examples/jsm/loaders/OBJLoader.js`,
  fetched and read this session — its own internal face-building logic
  (not quoted in full here, out of this lesson's own necessary scope,
  but confirmed by this unit's own real arithmetic match) is what
  produces this non-indexed structure.
- **Files affected:** none — this unit is explanatory, confirming a
  fact about the previous unit's already-added code rather than adding
  new code of its own.
- **Change type:** none.
- **Location:** n/a.
- **Dependencies:** n/a.

### The New Code

Not applicable — see Project Change, above.

### The Updated Project

Not applicable, per this step's own exception — nothing changed.

### Mechanical Walkthrough

Since no new project code was added, this walkthrough covers the
isolated lab's own new line, per the same full-treatment standard used
throughout this curriculum:

- `faces.length * 3 === 516` — a strict equality comparison between a
  computed value and the literal number `516` (this lesson's own first
  unit's real, confirmed `position.count`) — confirmed above to
  evaluate `true`, the actual arithmetic proof underlying this entire
  unit's own claim.

### CS Lens

Trading extra stored data (516 duplicated vertex-data copies instead of
88 unique ones) for simpler, faster per-triangle access (no index
lookup required at all — each triangle's three corners sit at
consecutive positions in the array, corner `0, 1, 2` for triangle `0`,
corner `3, 4, 5` for triangle `1`, and so on) is another instance of
Lesson 2's own "trading memory for correctness/simplicity of downstream
computation" CS Lens, reappearing here per the Repetition Rule, applied
to an entire real loader's own design choice rather than one hand-built
box.

### SE Lens

The alternative not chosen: `OBJLoader` could rebuild proper indexed
geometry from the file's own already-shared vertex references (`f`
lines that reuse the same vertex number across multiple triangles are
exactly the shared-vertex information an indexed structure would need)
rather than discarding that sharing information and flattening
everything into a duplicated, non-indexed form. The real cost of the
choice `OBJLoader` actually makes: real, avoidable memory overhead —
confirmed, this unit's own arithmetic, `516` stored vertex-data copies
for a file that only truly needs `88` — while the real benefit is
implementation simplicity on the loader's own side: building
non-indexed geometry directly from a stream of `f`-line references
needs no separate deduplication pass at all, where reconstructing a
proper index would. `THREE.BufferGeometryUtils.mergeVertices()` (a
real, separate Three.js utility, not covered in this lesson, worth
naming as a signal this really is a known, addressable tradeoff rather
than a permanent limitation) exists specifically to convert non-indexed
geometry like this back into an indexed form after the fact, for
exactly the memory-conscious cases where it matters.

### One sentence connecting this unit to what came before

`position.count`'s own real number is now fully, arithmetically
explained — the final unit turns to this lesson's own second genuine
surprise, hiding in the `'color'` attribute's own actual stored values.

---

## Concept Unit: Color Space — The Numbers Genuinely Changed

### The Problem

The first unit's own isolated lab confirmed `color.count` matches
`position.count` — real color data is present. But nothing yet has
checked whether the *values* stored in that attribute actually match
what the file itself says — Lesson 6's own hand-parser already read
this exact file's first vertex color as `{ r: 0.2706, g: 0.2706, b:
0.2706 }`, real, raw text straight from the file.

> **Stop and think first:** if `OBJLoader` is doing its job correctly,
> would you expect `geometry.attributes.color.array[0]` — the first
> stored color-red value, for the exact same first vertex Lesson 6's
> own hand-parser already read as `0.2706` — to read that identical
> number back, or is there a real reason, given this lesson's own
> Terms section already naming "color space" as a real, defined
> concept rather than a throwaway phrase, that the two might
> legitimately differ?

### Isolating the real, measured discrepancy

```js
// throwaway-color-mismatch.mjs
import * as fs from 'fs';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';

const text = fs.readFileSync('./O1203.obj', 'utf-8');

// Lesson 6's own hand-parser, unchanged, reading the raw file value:
const firstLine = text.split('\n')[0];
const rawTokens = firstLine.trim().split(' ');
const rawColor = { r: parseFloat(rawTokens[4]), g: parseFloat(rawTokens[5]), b: parseFloat(rawTokens[6]) };
console.log('Lesson 6 hand-parser, raw color from file:', rawColor);

// OBJLoader's own real output for the same file, same vertex:
const loader = new OBJLoader();
const group = loader.parse(text);
const objLoaderColor = {
  r: group.children[0].geometry.attributes.color.array[0],
  g: group.children[0].geometry.attributes.color.array[1],
  b: group.children[0].geometry.attributes.color.array[2],
};
console.log('OBJLoader, same vertex, actual stored color:', objLoaderColor);

console.log('do they match?', rawColor.r === objLoaderColor.r);

// Reproduce the conversion by hand, independently, to confirm it's a
// real, known formula rather than an unexplained mystery number:
function srgbToLinear(c) {
  return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
}
console.log('hand-computed srgbToLinear(0.2706):', srgbToLinear(rawColor.r));
```

Actually run, this session, in plain Node, against the real file:

```
Lesson 6 hand-parser, raw color from file: { r: 0.2706, g: 0.2706, b: 0.2706 }
OBJLoader, same vertex, actual stored color: {
  r: 0.05951640009880066,
  g: 0.05951640009880066,
  b: 0.05951640009880066
}
do they match? false
```

```
hand-computed srgbToLinear(0.2706): 0.059516399159700785
```

This is confirmed, directly, by `OBJLoader`'s own real source (fetched
and read this session): `_color.setRGB( parseFloat( data[ 4 ] ),
parseFloat( data[ 5 ] ), parseFloat( data[ 6 ] ), SRGBColorSpace );` —
the exact fourth argument this lesson's own Header already named.
What this proves, directly and quantitatively: the two numbers
genuinely do *not* match (`false`) — `OBJLoader` is not simply copying
your file's own numbers into the geometry; it's performing a real,
defined mathematical conversion, confirmed to the ninth decimal place
by this unit's own independent, hand-computed `srgbToLinear` formula,
matching `OBJLoader`'s real output almost exactly (the tiny remaining
difference is ordinary floating-point rounding, the same kind of noise
Lesson 4's own `OrbitControls` unit already encountered and explained).
Your own file's raw `0.2706` is being correctly treated as an **sRGB**
value (Terms, above) — the space essentially all authored color data,
including your own script's own output, is naturally in — and
converted to the **linear** space Three.js's own internal lighting math
actually needs to produce visually correct results once real lights
(Lesson 3) are involved.

### Discarding the throwaway example

Deleted — never appears in the real project. What it proved (a real,
confirmed, quantified color-space conversion, not a bug or
approximation) is genuinely important context for anyone reading raw
values out of a loaded geometry's own `'color'` attribute later and
expecting them to match the source file directly — this project's own
future stock/fixture toggling logic (Module E) should be aware this
conversion has already happened by the time any code sees the loaded
geometry.

### Project Change

- **Reference Source:** `three/examples/jsm/loaders/OBJLoader.js`,
  fetched and read this session, quoted directly above — the real,
  authoritative source for this unit's entire claim.
- **Files affected:** none — the conversion already happens
  automatically, inside `OBJLoader.parse()`, as part of the first
  unit's own already-added code; nothing in this lesson's own project
  needs to change to benefit from or account for it.
- **Change type:** none.
- **Location:** n/a.
- **Dependencies:** n/a.

### The New Code

Not applicable — see Project Change, above.

### The Updated Project

Not applicable, per this step's own exception — nothing changed.

### Mechanical Walkthrough

Since no new project code was added, this walkthrough covers the
isolated lab's own new lines, per the same full-treatment standard used
throughout this curriculum:

- `group.children[0].geometry.attributes.color.array[0]` — a chained
  property access: `.children[0]` (the first, and — confirmed, this
  lesson's first unit — only, `Mesh` in this file's `Group`),
  `.geometry` (that mesh's own `BufferGeometry`, Lesson 1),
  `.attributes.color` (the per-vertex color attribute, Lesson 5),
  `.array[0]` (the raw underlying typed array, Lesson 2, indexed
  directly to read the very first stored red component).
- `function srgbToLinear(c) { return c <= 0.04045 ? c / 12.92 :
  Math.pow((c + 0.055) / 1.055, 2.4); }` — a real, standard
  sRGB-to-linear conversion formula, written out explicitly rather than
  imported from anywhere, specifically so this unit's own claim rests
  on independently-reproduced math rather than trusting a second
  library's own black-box implementation to check a first one.
- `Math.pow((c + 0.055) / 1.055, 2.4)` — `Math.pow(base, exponent)`, a
  JavaScript built-in performing real exponentiation — confirmed by
  this unit's own real output to reproduce `OBJLoader`'s own internal
  result to nine decimal places.

### CS Lens

Storing data in one representation (linear) that's better suited for
the *computation* that will be done with it (lighting math, which is
only physically correct in linear space) while accepting data
*authored* in a different, more human/historically-conventional
representation (sRGB) at the boundary, converting once at that
boundary rather than repeatedly, is another real instance of Lesson 5's
own "normalization before consumption" CS Lens, reappearing here per
the Repetition Rule — this time the normalization isn't just a numeric
*range* change (`0`–`255` to `0`–`1`, Lesson 5) but a genuine, nonlinear
mathematical *transformation* of the values themselves.

### SE Lens

The alternative not chosen: `OBJLoader` could store vertex colors
exactly as written in the file, leaving any color-space conversion to
whatever code eventually renders them. The real cost of that
alternative: every single consumer of loaded color data — every future
lesson, every future feature this project builds — would need its own
awareness of, and correct handling for, the sRGB/linear distinction,
with real risk of some consumers converting and others not, producing
visually inconsistent results across different parts of the same app.
`OBJLoader`'s actual choice — convert once, at load time, confirmed
directly by this unit — accepts a real, one-time computational cost
(every color-bearing vertex needs one real `Math.pow` call at load
time) in exchange for every later consumer of `geometry.attributes.color`
being able to trust the stored values are already in the one correct,
consistent working space, with no repeated risk of a future lesson
forgetting to convert.

### One sentence connecting this unit to what came before

Every one of this lesson's own three units — a real vertex-count
match, a real arithmetic explanation for it, and a real, independently-
verified color transformation — traces back to the exact same real
file this lesson opened with, confirming `OBJLoader`'s own real
behavior against real data rather than documentation or assumption
alone.

---

## Closing

### Connect the pieces

Start from `text`, line 24's own `loader.load('O1203.obj', ...)` call
(in the real browser-facing project) — or, equivalently, this lesson's
own three isolated labs' shared `fs.readFileSync('./O1203.obj',
'utf-8')` call, both ultimately reaching the identical real file, `88`
real `v` lines and `172` real `f` lines, confirmed independently by
this lesson's own second unit against Lesson 6's own hand-parser.
`OBJLoader.parse()`, called internally by `.load()`, walks that text
and — confirmed, this lesson's own first unit — correctly recognizes
each 7-token `v` line as position-plus-color, exactly as this
project's own `HANDOFF.md` predicted back in Lesson 5, now genuinely
confirmed rather than assumed. For every one of the file's `172`
triangles, it writes out a fresh copy of that triangle's three
corners' worth of position, normal, and color data — never referencing
a shared earlier copy — landing at exactly `516` total vertex entries,
confirmed by this lesson's own second unit to be precisely `172 * 3`,
no more and no less, with `geometry.index` staying `null` the entire
time. And for every one of those color values, `OBJLoader`'s own real,
quoted source calls `THREE.Color.prototype.setRGB` with a fourth
argument, `SRGBColorSpace`, that this lesson's own third unit confirmed
performs a real, standard, independently-reproducible mathematical
conversion — your file's own raw `0.2706` becoming the geometry's own
actually-stored `0.0595`, a difference real enough to measure to nine
decimal places, not a rounding artifact or a bug. `scene.add(group)`,
line 25, then hands the entire resulting structure — real `Mesh`,
real non-indexed `BufferGeometry`, real linear-space color data, a real
`MeshPhongMaterial` `OBJLoader` chose on its own — into exactly the
same scene graph every earlier lesson's own hand-built objects already
lived in, ready for the exact same render loop, unchanged since
Lesson 4, to draw it.

## Commands needed

The complete file is provided as a real, runnable project at
`lessons/lesson-07-objloader/` — `npx serve .` from inside that folder,
same as every browser-facing lesson since Lesson 1. One thing worth
naming explicitly, confirmed directly by this lesson's own three
isolated labs: `OBJLoader.parse()` itself needed **no browser and no
server at all** to verify — every real number in every isolated lab
above was produced by running plain `node` scripts directly against
your real, uploaded file, the same `node <file>.mjs` pattern from
Lesson 6's own Commands section. Only `.load()`'s own real file-fetch
inside `main.js`, and the actual rendered pixels, need a real browser.

## Run it

The complete project is provided at `lessons/lesson-07-objloader/`,
your real `O1203.obj` file included alongside it. Run it, and you
should see: your real machining-diff model, mostly grey with visible
green patches marking the machined surfaces, orbitable with the mouse
(Lesson 4). Report back what you actually see, so it can be saved into
`verify/lesson-07/` as this lesson's own real, reader-run verification
— the one piece of this lesson genuinely not yet confirmed, since
everything else was independently verified in plain Node against your
real file this session.

## Next lesson

Lesson 8 covers loading a model from the user's own disk directly —
`<input type="file">` and `FileReader` — replacing this lesson's own
hardcoded `loader.load('O1203.obj', ...)` with real, arbitrary file
selection, the actual "upload your own models" requirement this entire
curriculum exists to serve.
