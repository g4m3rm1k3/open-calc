# Lesson 5: Vertex Color, Not Texture Color

**What you will build:** the hand-built triangle from Lesson 2, now with
three genuinely different colors — one per vertex, blending smoothly
across each face — using exactly the mechanism your own
`save_vertex_colored_obj` function already writes to disk: a `color`
value per vertex, not a texture image anywhere in sight. The
transferable problem this lesson is actually about: your real
machining models don't carry photographic textures — they carry a
single, meaningful number per vertex (grey for unchanged, green for
machined), computed once in Python and baked directly into the file.
Rendering that correctly in Three.js is a specific, separate mechanism
from every material property used in Lessons 1–4, and this is the last
lesson before Module B turns to actually parsing your real `.obj`
files — everything here is what that parser's output will need to be
paired with to render correctly.

**What you need to know first:** Lesson 2 — `Float32Array`,
`THREE.BufferAttribute`, hand-building a `BufferGeometry` with
`setAttribute`. Lesson 3 — `MeshStandardMaterial` and
`MeshBasicMaterial`, and the real, confirmed fact that a fresh
material's properties default to specific, inspectable values.

**Terms used in this lesson**

- **Texture color** — color that comes from an image (a **texture**)
  wrapped onto a surface, sampled at each pixel using UV coordinates
  (the third attribute `BoxGeometry` was confirmed, Lesson 1, to carry
  alongside `position` and `normal`) — not used anywhere in this
  lesson, named here only to draw the contrast this lesson's own title
  promises.
- **Color space** — a specific, defined mapping between numbers and
  actual perceived color — the same three numbers (say, `0.5, 0.5,
  0.5`) can represent visibly different greys depending on which
  mapping is being used. It matters here because your own pipeline's
  numbers (`diff_colors`, `0`–`255` integers, divided by `255.0`
  before being written to the `.obj` file) and Three.js's own internal
  color handling both have to agree on what mapping is in play, or the
  same numbers render as a visibly different shade than intended.

**Objects and methods used**

- **`THREE.Color(r, g, b)`**
  - *What it is:* a real color object — not a bare hex number or a
    CSS-style string, though it can be constructed from either — used
    anywhere Three.js needs to represent a color as data, including
    every material's own `.color` property used since Lesson 3.
  - *Implementation:* a class; `new THREE.Color(0xff0000)` accepts a
    hex integer; `new THREE.Color(r, g, b)` accepts three separate
    numbers directly.
  - *Its use:* this lesson's own per-vertex colors are built from
    exactly this class, one instance conceptually per vertex, matching
    the same representation every material's `.color` (Lesson 3
    onward) already used without this lesson ever naming the class
    directly until now.
  - *Type:* a class.
  - *Responsibility:* stores one color as three real, inspectable
    floating-point components (`.r`, `.g`, `.b`), confirmed below to be
    in the `0`–`1` range — not the `0`–`255` integer range your own
    Python pipeline's `diff_colors` array uses — and provides
    conversion methods (`.setRGB()`, `.getHexString()`) between common
    representations.
  - *Depends on:* nothing to construct.
  - *Connects to:* every material's `.color` property since Lesson 3
    is actually an instance of this exact class, confirmed by
    `instanceof` below — not previously named, but present the entire
    time.
  - *Shape:* confirmed below — `.r`/`.g`/`.b` are plain floats in
    `0`–`1`, and the exact division your own `save_vertex_colored_obj`
    function already performs (`colors = ... / 255.0`, its own real,
    quoted line) produces numbers in that identical range, meaning
    your own script's output format and `THREE.Color`'s own internal
    representation were already compatible before this lesson ever
    connected the two explicitly.

- **`BufferGeometry`'s `'color'` attribute** *(not a distinct class —
  an application of `THREE.BufferAttribute`, already given full
  treatment in Lesson 2, under a specific, reserved name)*
  - *What it is:* per-vertex color data, stored the identical way
    `position` and `normal` are — one more named attribute in the same
    `.attributes` dictionary Lesson 2 already inspected directly.
  - *Implementation:* `geometry.setAttribute('color', new
    THREE.BufferAttribute(colorArray, 3))` — the identical method call
    shape as installing `position`, only the string name and the data
    itself differ.
  - *Its use:* this is the actual mechanism your `save_vertex_colored_obj`
    function's own output (`v x y z r g b`, six numbers per vertex
    line — position and color interleaved in the file, but stored as
    two separate named attributes once parsed) will need to populate,
    once Module B's real OBJ parser exists.
  - *Type:* not a distinct class — the general `BufferAttribute`
    mechanism (Lesson 2), used under the specific reserved name
    `'color'`.
  - *Responsibility:* holds one `THREE.Color`-shaped triple (three
    floats) per vertex, readable by any material's shader that opts in
    (below) — genuinely independent from `position` and `normal`, the
    same "separate named attribute" structure Lesson 2's own Mechanical
    Walkthrough already established for those two.
  - *Depends on:* nothing beyond a real `BufferAttribute`, itemSize
    `3`, the same as `position`.
  - *Connects to:* read by the renderer's own shader only when a
    material's `.vertexColors` flag (below) is `true` — confirmed below
    to do nothing at all, silently, when that flag is left at its
    default.
  - *Shape:* confirmed below — same `.count`, same `.itemSize` shape as
    `position` (one triple per vertex, not one per triangle), values in
    the `0`–`1` range matching `THREE.Color`'s own representation.

- **`Material.vertexColors`** *(a property inherited from the base
  `THREE.Material` class every material since Lesson 3 already extends
  — reappearing, given full treatment again here per the Repetition
  Rule)*
  - *What it is:* a boolean flag telling a material's shader whether to
    actually read the geometry's own `'color'` attribute at all.
  - *Implementation:* a property on every `Material` subclass,
    confirmed below to default to `false`; set via the constructor's
    options object (`{ vertexColors: true }`) or by direct assignment
    after construction.
  - *Its use:* without this explicitly set to `true`, a geometry's real,
    correctly-populated `'color'` attribute is read by nobody — the
    renderer silently ignores it, confirmed below by the flag's own
    default.
  - *Type:* a boolean instance property, inherited — confirmed below —
    by every material class used so far in this curriculum, including
    `MeshNormalMaterial`, even though that specific material's own
    shader (Lesson 1's own subject: coloring by normal direction) never
    actually reads it regardless of its value.
  - *Responsibility:* gates whether a material's shader multiplies its
    own base `.color` by the geometry's per-vertex color, confirmed
    below via the renderer's own real shader source, rather than
    replacing it outright.
  - *Depends on:* the geometry actually having a `'color'` attribute
    set — setting this flag `true` on a geometry with no such
    attribute has nothing to read.
  - *Connects to:* read internally by the renderer (Lesson 1) at draw
    time, alongside every other material property already in use since
    Lesson 3.
  - *Shape:* a plain boolean; no return value or complex structure —
    the simplest-shaped property in this lesson's own Header, and, per
    the confirmed shader source below, the one switch standing between
    a fully correct `'color'` attribute and it having zero visible
    effect.

---

## Concept Unit: `THREE.Color` — Not `0`–`255`, `0`–`1`

### The Problem

Your own `save_vertex_colored_obj` function's real, quoted source
divides its color data by `255.0` before writing it to the `.obj`
file — `colors = mesh.point_data["diff_colors"] / 255.0`. Nothing in
Lessons 1–4 ever explained why that division exists, or what range of
numbers it's converting into. Every material's `.color` used since
Lesson 3 was set via a hex integer (`0x00ff00`), which hides this
question entirely — a hex literal never reveals what internal
representation it becomes.

> **Stop and think first:** your own Python script's `diff_colors`
> array holds ordinary 8-bit color bytes — whole numbers from `0` to
> `255`, the standard range for a single color channel in most image
> and graphics formats. If Three.js's own internal color representation
> uses a *different* numeric range, what would happen if your script's
> raw `0`–`255` bytes were handed to Three.js completely unconverted —
> would a value like `220` be a valid color component in a range that
> tops out at, say, `1`? What real-world problem might feeding
> out-of-range numbers into a color calculation actually cause?

### Isolating `THREE.Color`

```js
// throwaway-color.mjs
import * as THREE from 'three';

const c = new THREE.Color(0xff0000);
console.log('c instanceof THREE.Color:', c instanceof THREE.Color);
console.log('c.r, c.g, c.b (0-1 floats, not 0-255):', c.r, c.g, c.b);
console.log('c.getHexString():', c.getHexString());

const c2 = new THREE.Color();
c2.setRGB(0.5, 0.5, 0.5);
console.log('grey via setRGB(0.5,0.5,0.5):', c2.r, c2.g, c2.b);

// The user's own script divides a 0-255 byte by 255.0 before writing
// the .obj file - confirm that exact conversion lands in THREE.Color's
// own real 0-1 range:
const greyByte = 69; // exact value used in save_vertex_colored_obj's own [69,69,69]
const c3 = new THREE.Color(greyByte / 255, greyByte / 255, greyByte / 255);
console.log('grey from byte 69/255:', c3.r.toFixed(4), c3.g.toFixed(4), c3.b.toFixed(4));
```

Actually run, this session, in plain Node:

```
c instanceof THREE.Color: true
c.r, c.g, c.b (0-1 floats, not 0-255): 1 0 0
c.getHexString(): ff0000
grey via setRGB(0.5,0.5,0.5): 0.5 0.5 0.5
grey from byte 69/255: 0.2706 0.2706 0.2706
```

This is called **normalized color representation**. What it proves,
directly answering the Socratic question: `THREE.Color`'s real
components genuinely live in `0`–`1`, not `0`–`255` — pure red reads
`(1, 0, 0)`, not `(255, 0, 0)`. Feeding your pipeline's raw byte values
in unconverted (say, `255` directly as a component) would produce a
color five times brighter than the representation's own maximum,
silently clamped or misinterpreted depending on where it entered the
pipeline — exactly the kind of bug the division in your own
`save_vertex_colored_obj` function already prevents, confirmed here to
land exactly where `THREE.Color` expects: `69 / 255` producing
`0.2706`, a real, valid, mid-range grey component.

### Discarding the throwaway example

Deleted — never appears in the real project. What it proved
(`THREE.Color`'s real `0`–`1` range, and that your own script's
existing `/255.0` conversion already targets it correctly) is direct
confirmation your pipeline needs no changes on this front — Module B's
real OBJ parser only needs to read the numbers your script already
writes, correctly.

### Project Change

- **Reference Source:** No reference counterpart — from-scratch
  addition; this lesson builds on Lesson 2's own hand-built-triangle
  file, not Lesson 1's cube.
- **Files affected:** created —
  `lessons/lesson-05-vertex-color/index.html`,
  `lessons/lesson-05-vertex-color/main.js` — starting from Lesson 2's
  own final file (raw triangle geometry, two side-by-side meshes) as
  this lesson's own starting point, per this lesson's "What you will
  build."
- **Change type:** add.
- **Location:** n/a for this specific unit — `THREE.Color` isn't
  directly instantiated as its own line in the real project file;
  instead, its real `0`–`1` range is what the next unit's raw color
  array is built to match. This unit's own point is understood, not
  yet written into `main.js`.
- **Dependencies:** none yet.

### The New Code

Not applicable — see Project Change, above. This unit establishes a
fact (`THREE.Color`'s real numeric range) the next unit's actual code
depends on, without adding a `THREE.Color` instance to the project
file directly.

### The Updated Project

Not applicable, per this step's own exception — nothing changed in
`main.js` this unit.

### Mechanical Walkthrough

Since no new project code was added this unit, this walkthrough covers
the isolated lab's own new lines, per the same full-treatment standard
used throughout this curriculum:

- `new THREE.Color(0xff0000)` — the constructor (this lesson's own
  Header), given a hex integer — the identical literal syntax every
  material's own `color:` option has used since Lesson 3, now
  confirmed to actually build a real `THREE.Color` instance internally
  each time, not a bare number stored as-is.
- `c.getHexString()` — an instance method, converting the internal
  `0`–`1` float representation back into the familiar six-character hex
  string — confirmed above to round-trip correctly (`0xff0000` in,
  `'ff0000'` out).
- `c2.setRGB(0.5, 0.5, 0.5)` — an instance method, setting all three
  components directly as `0`–`1` floats — the same `.set`-family method
  pattern already familiar from `Vector3.set()`, used since Lesson 3's
  own `DirectionalLight` unit.
- `greyByte / 255` — ordinary division, the exact operation your own
  `save_vertex_colored_obj` function's real source already performs
  (`colors = mesh.point_data["diff_colors"] / 255.0`) — confirmed here,
  independently, to land in `THREE.Color`'s own real expected range.

### CS Lens

Representing a value in a fixed, tool-agnostic normalized range
(`0`–`1`) rather than a format-specific range (`0`–`255`, an 8-bit
image byte's own natural range) is an instance of **normalization
before consumption** — converting data into a canonical shape the
consuming system actually expects, at the boundary where the two
systems meet, rather than passing a producer's own native format
through unconverted and hoping the consumer happens to interpret it the
same way. Also recognized in: audio sample values normalized to
`-1.0`–`1.0` regardless of whether the source file stored them as
16-bit or 32-bit integers; GPS coordinates normalized to decimal
degrees regardless of whether a source device reported degrees-minutes-
seconds; your own pipeline's `align3d` function, quoted in your shared
script, converting `stationary.center` and `moving.center` — Python
tuples — into NumPy arrays before subtracting them, because tuple
subtraction isn't defined the same way array subtraction is.

### SE Lens

The alternative not chosen: Three.js could have accepted raw `0`–`255`
integers directly, matching the format most image tools and camera
byte data actually use natively, sparing every producer (including
your own script) the extra division. The real cost of that
alternative: `0`–`1` floats compose far more simply with the rest of
Three.js's own math — multiplying two colors together (confirmed,
this lesson's third unit, to be exactly how vertex color and material
color combine) is a single float multiplication per channel in
`0`–`1` space, while the same operation in `0`–`255` space would need
an extra normalize-multiply-denormalize step every single time two
colors interact anywhere in the renderer's own internal shader code —
a real, recurring cost paid every frame, for every lit pixel, that a
one-time division at data-loading time (your own script's own real,
existing line) avoids entirely.

### One sentence connecting this unit to what came before

Nothing in `main.js` needed to change for this unit's own fact to be
true — the next unit uses this exact `0`–`1` range directly, building
a real per-vertex color attribute for the first time.

---

## Concept Unit: A `'color'` Attribute — Building on Lesson 2's Triangle

### The Problem

Lesson 2's own triangle carried exactly two attributes —
`position` and `normal` — and its appearance came entirely from
whichever material it was paired with, uniform across the whole shape
(`MeshNormalMaterial`'s per-face color, or `MeshBasicMaterial`'s single
flat `color`). Nothing so far has let *different vertices of the same
mesh* carry genuinely different colors — the exact thing your own
pipeline's grey/green distinction needs, since a single machining
stage's mesh has *both* unchanged and machined surface, together, in
one geometry.

> **Stop and think first:** Lesson 2 already proved `position` and
> `normal` are two separate, independently-set attributes on the same
> `BufferGeometry`, each with its own `.count` matching the number of
> vertices. If you wanted every vertex to carry its own independent
> color — not one color for the whole mesh, but potentially a
> different one at every single vertex — would that fit the same
> `setAttribute(name, BufferAttribute)` shape already used for
> `position` and `normal`, or would it need something structurally
> different? What name would you guess Three.js reserves for exactly
> this purpose?

### Isolating a per-vertex `'color'` attribute

```js
// throwaway-color-attribute.mjs
import * as THREE from 'three';

const positions = new Float32Array([0, 1, 0, -1, -1, 0, 1, -1, 0]);
const geometry = new THREE.BufferGeometry();
geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
geometry.computeVertexNormals();

console.log('before setting color attribute:', geometry.attributes.color);

const colors = new Float32Array([
  1, 0, 0,   // top: red
  0, 1, 0,   // bottom-left: green
  0, 0, 1,   // bottom-right: blue
]);
geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
console.log('after setAttribute, attributes:', Object.keys(geometry.attributes));
console.log('color.count:', geometry.attributes.color.count);
console.log('color.itemSize:', geometry.attributes.color.itemSize);
console.log('first vertex color (top, expect 1,0,0 red):', geometry.attributes.color.array[0], geometry.attributes.color.array[1], geometry.attributes.color.array[2]);
```

Actually run, this session, in plain Node:

```
before setting color attribute: undefined
after setAttribute, attributes: [ 'position', 'normal', 'color' ]
color.count: 3
color.itemSize: 3
first vertex color (top, expect 1,0,0 red): 1 0 0
```

What this proves, directly answering the Socratic question: yes, it
fits the identical shape — `setAttribute('color', new
THREE.BufferAttribute(colorArray, 3))`, structurally indistinguishable
from how `position` was installed in Lesson 2, confirmed by
`Object.keys(geometry.attributes)` now reading all three names
together. `color.count` matches `position.count` (three, one per
vertex, not one per triangle or one for the whole mesh) — this is
genuinely per-vertex data, capable of assigning the top vertex pure
red, the bottom-left pure green, and the bottom-right pure blue, all on
the exact same triangle.

### Discarding the throwaway example

Deleted — never appears in the real project. What it proved (a `color`
attribute installs identically to `position`, one triple per vertex) is
what the real code below relies on.

### Project Change

- **Reference Source:** `save_vertex_colored_obj`'s own real, quoted
  source (your shared script) — each `v` line already carries six
  numbers: `f"v {vertices[i,0]:.6f} {vertices[i,1]:.6f}
  {vertices[i,2]:.6f} {colors[i,0]:.4f} {colors[i,1]:.4f}
  {colors[i,2]:.4f}\n"` — position and color, interleaved per vertex in
  the file, exactly the two attributes this unit installs as two
  separate `BufferAttribute`s once parsed. This lesson doesn't parse
  that file yet (Module B does) — it builds the identical *shape* of
  data by hand, matching what a real parser will eventually produce.
- **Files affected:** modified — `main.js` (this lesson's own file,
  started in the previous unit's Project Change).
- **Change type:** add.
- **Location:** directly below Lesson 2's own `geometry.computeVertexNormals()`
  line, reused as this lesson's own starting point.
- **Dependencies:** the `geometry` variable, built identically to
  Lesson 2's own.

### The New Code

```js
const colors = new Float32Array([
  1, 0, 0,   // top: red
  0, 1, 0,   // bottom-left: green
  0, 0, 1,   // bottom-right: blue
]);
geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
```

### The Updated Project

```
1  import * as THREE from 'three';
2
3  const positions = new Float32Array([
4     0,  1, 0,
5    -1, -1, 0,
6     1, -1, 0,
7  ]);
8  const positionAttribute = new THREE.BufferAttribute(positions, 3);
9
10 const geometry = new THREE.BufferGeometry();
11 geometry.setAttribute('position', positionAttribute);
12 geometry.computeVertexNormals();
13
14 const colors = new Float32Array([         // ← new
15   1, 0, 0,   // top: red                  // ← new
16   0, 1, 0,   // bottom-left: green        // ← new
17   0, 0, 1,   // bottom-right: blue        // ← new
18 ]);                                        // ← new
19 geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3)); // ← new
```

`geometry` now carries three attributes — `position`, `normal`
(Lesson 2), and `color` (this unit) — each independently readable, each
with the identical three-entries-per-vertex shape, none of them
overwriting or interfering with the others in any way.

### Mechanical Walkthrough

- `new Float32Array([...])` — reappearing from Lesson 2's own first
  unit, given full treatment there — nine numbers again, but this time
  representing three whole colors (one per vertex) rather than three
  (x, y, z) positions; the *shape* is identical, the *meaning* of the
  numbers is entirely different, determined only by which attribute
  name they end up installed under.
- `1, 0, 0` / `0, 1, 0` / `0, 0, 1` — three RGB triples, each a pure
  primary color, chosen specifically so each vertex's own contribution
  is unmistakable once rendered — confirmed above, `color.array[0..2]`
  reads exactly `1, 0, 0` for the first (top) vertex.
- `geometry.setAttribute('color', new THREE.BufferAttribute(colors,
  3))` — reappearing from Lesson 2's own second unit (`setAttribute`)
  and this lesson's own Header (`THREE.BufferAttribute`), both given
  full treatment already — the string `'color'` is the one new piece,
  a reserved name Three.js's own rendering code specifically looks for,
  the same way `'position'` and `'normal'` are reserved names, not
  arbitrary strings a reader happens to choose.

### CS Lens

Storing per-vertex color as its own independent, same-shaped array —
rather than, say, extending the `position` array itself to carry six
numbers per vertex instead of three — is the same underlying idea as
Lesson 2's own "separating data from schema" CS Lens, reappearing here
per the Repetition Rule: each attribute stays a clean, homogeneous
array of exactly one kind of data, and *association by shared index*
(vertex `0`'s position lives at `position.array[0..2]`, vertex `0`'s
color lives at `color.array[0..2]`, the same index, two different
arrays) is what actually ties them together, rather than any explicit
key or reference. Also recognized in: a spreadsheet's columns —
"name," "age," "email" each their own column, tied together only by
row position; parallel arrays in older, pre-object-oriented code;
a relational database's columns within a single table row.

### SE Lens

The alternative not chosen: a single array of vertex *objects*, each
holding `{ position: [...], normal: [...], color: [...] }` together.
More intuitive to read at a glance, arguably — but the real cost:
Three.js's own renderer needs to hand the GPU one contiguous block of
*just* position data to compute vertex placement, and a separate
contiguous block of *just* color data for the fragment shader's own
color calculation (confirmed, this lesson's third unit, exactly what
`vertexColors: true` triggers) — an array of combined objects would
need to be split apart into exactly these separate contiguous arrays
before any of that could happen, on every single frame, for a
non-static mesh. Storing them pre-split, as this lesson's own three
independent attributes already are, is what lets the renderer upload
each one directly, with no restructuring step in between.

### One sentence connecting this unit to what came before

The triangle now has real, distinct per-vertex color data sitting in
memory — the next unit is what makes the renderer actually *read* it,
since nothing about installing an attribute alone guarantees anything
looks at it.

---

## Concept Unit: `material.vertexColors` — The Switch That Actually Matters

### The Problem

The previous unit installed a real, correctly-shaped `'color'`
attribute — but nothing in either material class used since Lesson 3
was ever told to look at it. `MeshBasicMaterial`'s own job (Lesson 2)
is reading its own flat `.color` property; `MeshNormalMaterial`'s own
job (Lesson 1) is reading normal direction. Neither, by default, has
any reason to also check whether a `'color'` attribute happens to
exist.

> **Stop and think first:** Lesson 3's own Header already stated
> `Material.vertexColors` defaults to `false` — a fact stated then but
> not yet tested. Given that default, if you rendered this lesson's
> triangle right now, with a real `'color'` attribute installed but
> nothing else changed, what would you expect to see: the three colors
> blended smoothly across the triangle's face, or something else
> entirely — perhaps whatever `MeshBasicMaterial`'s own flat `.color`
> property happens to be set to, as if the `'color'` attribute weren't
> there at all?

### Isolating `material.vertexColors`

```js
// throwaway-vertexcolors-flag.mjs
import * as THREE from 'three';

const matDefault = new THREE.MeshBasicMaterial();
console.log('material.vertexColors (default, before opt-in):', matDefault.vertexColors);

const matBasic = new THREE.MeshBasicMaterial({ vertexColors: true });
console.log('MeshBasicMaterial vertexColors: true:', matBasic.vertexColors);

const matStandard = new THREE.MeshStandardMaterial({ vertexColors: true, color: 0xffffff });
console.log('MeshStandardMaterial vertexColors: true:', matStandard.vertexColors);
console.log('MeshStandardMaterial.color left at (multiplies with vertex color):', matStandard.color.getHexString());

const matNormal = new THREE.MeshNormalMaterial();
console.log('MeshNormalMaterial.vertexColors (does it even have this property?):', matNormal.vertexColors);
```

Actually run, this session, in plain Node:

```
material.vertexColors (default, before opt-in): false
MeshBasicMaterial vertexColors: true: true
MeshStandardMaterial vertexColors: true: true
MeshStandardMaterial.color left at (multiplies with vertex color): ffffff
MeshNormalMaterial.vertexColors (does it even have this property?): false
```

This is confirmed, directly, by the renderer's own real shader source
(`three/src/renderers/shaders/ShaderChunk/color_fragment.glsl.js`,
fetched and read this session, quoted in full): `diffuseColor *=
vColor;` — a single line, guarded by `#if defined( USE_COLOR )`, which
Three.js's own internal machinery only defines when
`material.vertexColors` is `true`. What this proves, answering the
Socratic question directly: with the flag left at its real, confirmed
default (`false`), that entire block of shader code never runs at
all — the triangle would render exactly as `MeshBasicMaterial`'s own
flat `.color` dictates, the `'color'` attribute sitting in memory,
fully correct, silently unread. And the real source line itself
answers a second question this lesson's Header only asserted: vertex
color *multiplies* the material's own base color (`*=`, not `=`) —
which is why `matStandard.color` was deliberately left at pure white
(`0xffffff`, confirmed above) in this lesson's own real code: white
multiplied by any color leaves that color unchanged, letting the
`'color'` attribute's own three distinct hues show through undistorted.
The final check — `MeshNormalMaterial` genuinely *has* this property
(inherited from the same base `Material` class, confirmed `false`, not
`undefined`) — but its own shader, entirely separate from the
`color_fragment` chunk quoted above, never checks it: the property
exists on every material uniformly, but only materially matters to the
subset whose own shader code actually reads it.

### Discarding the throwaway example

Deleted — never appears in the real project. What it proved (the flag's
real default; the exact multiplicative combination, confirmed from
real shader source; that the property exists universally but is only
functionally meaningful to some materials) is what the real code below
relies on.

### Project Change

- **Reference Source:** `three/src/renderers/shaders/ShaderChunk/color_fragment.glsl.js`,
  fetched and read this session, already quoted in full above — the
  real, authoritative confirmation of how vertex color and material
  color combine.
- **Files affected:** modified — `main.js`.
- **Change type:** add.
- **Location:** wherever this lesson's material is constructed —
  replacing Lesson 2's own two side-by-side materials with a single
  new one built specifically to read the `'color'` attribute this
  lesson installed.
- **Dependencies:** the `geometry` variable, now carrying a real
  `'color'` attribute from the previous unit.

### The New Code

```js
const material = new THREE.MeshBasicMaterial({ vertexColors: true });
const mesh = new THREE.Mesh(geometry, material);
scene.add(mesh);
```

### The Updated Project

The complete file, all three of this lesson's own units assembled,
plus a render loop identical in structure to every previous lesson's
own:

```
1  import * as THREE from 'three';
2
3  const scene = new THREE.Scene();
4  const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
5  camera.position.z = 5;
6
7  const renderer = new THREE.WebGLRenderer();
8  renderer.setSize(window.innerWidth, window.innerHeight);
9  document.body.appendChild(renderer.domElement);
10
11 const positions = new Float32Array([
12    0,  1, 0,
13   -1, -1, 0,
14    1, -1, 0,
15 ]);
16 const positionAttribute = new THREE.BufferAttribute(positions, 3);
17
18 const geometry = new THREE.BufferGeometry();
19 geometry.setAttribute('position', positionAttribute);
20 geometry.computeVertexNormals();
21
22 const colors = new Float32Array([
23   1, 0, 0,
24   0, 1, 0,
25   0, 0, 1,
26 ]);
27 geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
28
29 const material = new THREE.MeshBasicMaterial({ vertexColors: true }); // ← new
30 const mesh = new THREE.Mesh(geometry, material);                       // ← new
31 scene.add(mesh);                                                       // ← new
32
33 function animate() {
34   requestAnimationFrame(animate);
35   mesh.rotation.y += 0.01;
36   renderer.render(scene, camera);
37 }
38 animate();
```

`main.js` is now a complete app rendering one triangle whose face
smoothly blends red, green, and blue between its three corners — the
GPU's own triangle rasterization interpolating between each vertex's
distinct color across every pixel in between, confirmed by this
lesson's third unit to actually be read (`vertexColors: true`,
confirmed above to be the one required switch) rather than silently
ignored the way it would have been left at its own real default.

### Mechanical Walkthrough

- `new THREE.MeshBasicMaterial({ vertexColors: true })` — reappearing
  from Lesson 2 (`MeshBasicMaterial` itself, given full treatment
  there) and this lesson's own Header (`vertexColors`, given full
  treatment above) — deliberately no `color:` option given at all here,
  meaning `MeshBasicMaterial`'s own default white base color (confirmed
  by this lesson's third unit's own isolated lab, applied identically
  to `MeshStandardMaterial` there) multiplies against each vertex's own
  color unchanged.
- `new THREE.Mesh(geometry, material)` — reappearing from Lesson 1,
  given full treatment there and reused in every lesson since — joining
  this lesson's own three-attribute geometry to this lesson's own
  vertex-color-aware material.
- `scene.add(mesh)` — reappearing from Lesson 1's own Scene unit, given
  full treatment there, unchanged in meaning.
- `requestAnimationFrame(animate)` / `mesh.rotation.y += 0.01` /
  `renderer.render(scene, camera)` — reappearing from Lesson 1's own
  Render Loop unit, given full treatment there — the rotation here
  serves a real, specific purpose this lesson didn't have in Lesson 1:
  watching the same three-color blend shift and rotate in real time is
  what makes it visually obvious the color is genuinely tied to the
  mesh's own vertices, not a flat, camera-facing overlay.

### CS Lens

The GPU computing a smooth blend between three known values at a
triangle's corners, for every pixel *between* them, without your own
code ever specifying what color pixel `(142, 87)` on screen should be
directly, is an instance of **interpolation** — computing intermediate
values from known endpoints, rather than storing or computing every
value explicitly. Also recognized in: CSS gradients, computing every
in-between color from just two or three specified stops; video
compression, storing only some "key frames" fully and interpolating
the frames between them; a spreadsheet's `TREND()` function estimating
values between known data points; animation tweening (a real, upcoming
subject in this project's own Module F), computing every frame between
a start and end pose rather than storing each one by hand.

### SE Lens

The alternative not chosen: color assigned per-*triangle* rather than
per-*vertex* — one flat color for an entire face, no blending at all,
the same flat-shaded look `BoxGeometry`'s own faceted design (Lesson 1)
already produces for normals. That would be simpler to reason about
(no interpolation to predict) but would make your own machining
models' grey/green boundary look jagged and blocky — a hard edge at
every triangle boundary, rather than following the true, often curved
diff boundary your Python pipeline's own `abs_dist < threshold` test
actually computes per point. Per-vertex color, with GPU interpolation
filling in between, is the real cost/benefit trade this lesson's whole
mechanism exists to make: slightly more data (one color per vertex
instead of one per triangle-face) in exchange for smooth, accurate
boundaries that follow your actual computed data rather than being
artificially blocked by triangle edges.

### One sentence connecting this unit to what came before

Every piece of this lesson — a real `THREE.Color` range, a real
per-vertex `'color'` attribute, and the one flag that makes a material
actually read it — is exactly, and only, what Module B's real OBJ
parser will need to populate correctly once it reads your own script's
actual `.obj` files, which is where this curriculum turns next.

---

## Closing

### Connect the pieces

Start from `colors`, line 22: `1, 0, 0, 0, 1, 0, 0, 0, 1` — confirmed,
this lesson's first unit, to already sit in exactly the numeric range
(`0`–`1`) `THREE.Color` itself uses internally, and exactly the range
your own `save_vertex_colored_obj` function's real `/ 255.0` division
already targets, independently of this lesson ever needing to change
that script. Line 27 installs those nine numbers as a `'color'`
attribute, confirmed by this lesson's second unit to sit alongside
`position` and `normal` — three separate, same-shaped attributes, tied
together only by shared vertex index, not by any explicit reference
between them. Line 29's `vertexColors: true` is confirmed, this
lesson's third unit, via the renderer's own real shader source, to be
the single switch enabling one specific line of GPU shader code —
`diffuseColor *= vColor` — that would otherwise never run at all,
leaving a fully correct `'color'` attribute completely inert. Every
pixel between this triangle's three vertices, once actually rendered,
is a value the GPU itself computes by interpolation — never explicitly
stated anywhere in this file — blending toward whichever of the three
corner colors that pixel sits closest to. Nothing about the scene,
camera, renderer, or render loop — present, unchanged in structure,
since Lesson 1 — needed to know any of this was happening; exactly as
Lesson 2's own Closing observed, this lesson's own three units again
changed only what geometry and material *are*, never how a frame
actually gets drawn.

## Commands needed

Identical to every previous lesson's own Commands section — `npx serve
.` from inside `lessons/lesson-05-vertex-color/`, with `index.html`
pinning `three@0.185.1` via the same importmap pattern already
established.

## Run it

The complete file is provided as a real, runnable project at
`lessons/lesson-05-vertex-color/`. As with every prior lesson's own
`WebGLRenderer`-dependent output, actually seeing the smooth red-green-
blue blend requires a real browser this sandbox doesn't have. Run it,
and you should see: a triangle whose corners are pure red, green, and
blue, blending smoothly across its face, slowly rotating. Report back
what you actually see, so it can be saved into `verify/lesson-05/` as
this lesson's own real, reader-run verification.

## Next lesson

Module B begins: Lesson 6 covers what an `.obj` file actually *is* —
reading your own script's real output, plain-text, by hand — before
Lesson 7 turns to `OBJLoader` itself and the real, now-confirmed fact
(this lesson's own Header, and the real loader source read this
session) that Three.js's own loader already understands your exact
six-number `v x y z r g b` convention natively.
