# Lesson 2: Geometry and Material, Not the Same Thing

**What you will build:** a triangle whose every vertex position you
type by hand — no `THREE.BoxGeometry`, no built-in primitive — proving
that a `BufferGeometry` is nothing more than plain numeric arrays with
a name, and that a `Mesh`'s appearance can change completely while its
shape data stays byte-for-byte identical, shared, not duplicated. The
transferable problem this lesson is actually about: your own pipeline
doesn't hand you a `THREE.BoxGeometry` — it hands you a `.obj` file
full of raw vertex numbers you already know from `save_vertex_colored_obj`
(`v x y z r g b`, one line per vertex). Before Module B can teach
parsing that file, you need to know, for certain, that whatever a
parser produces is *exactly* the same kind of raw array data this
lesson builds by hand — nothing more mysterious than that.

**What you need to know first:** Lesson 1 — specifically, what a
`THREE.Scene`, `THREE.Mesh`, `THREE.BufferGeometry`, and
`THREE.Material` each are, and the proof (Lesson 1's own Mesh unit)
that a `Mesh` holds live references to its geometry and material rather
than copies.

**Terms used in this lesson**

- **Typed array** — a JavaScript array-like object (`Float32Array`,
  `Uint16Array`, and others) that can only hold one specific numeric
  type, stored as raw contiguous bytes in memory, unlike a plain `[]`
  array which can hold anything and stores each element as a full,
  separately-allocated JavaScript value. It exists because a GPU needs
  to read vertex data as one uninterrupted block of raw bytes in a
  known format — handing it a plain JS array, where each number is
  secretly a separate boxed object with tag bits and could even be
  swapped for a string mid-array, would be far slower to translate and
  wouldn't match what the graphics hardware expects at all.
- **Vertex attribute** — one named channel of per-vertex data —
  `position`, `normal`, `color`, `uv` are the four this project will
  actually use — stored as its own typed array, one value-group per
  vertex, all the same length. It exists because a vertex isn't just a
  position: it's a position *plus* whatever else a shader needs to know
  about that exact point (which way it faces, what color it is), and
  keeping each kind of data in its own named array (rather than one
  giant undifferentiated blob) is what lets code ask for "just the
  positions" or "just the colors" independently.
- **Stride / itemSize** — how many numbers make up one vertex's worth
  of a given attribute — `3` for an (x, y, z) position or an (r, g, b)
  color, `2` for a (u, v) texture coordinate. It exists because a flat
  typed array (defined above) has no built-in sense of "where one
  vertex ends and the next begins" — itemSize is the one piece of
  information that turns a flat list of numbers back into a list of
  grouped vertices.

**Objects and methods used**

- **`Float32Array`**
  - *What it is:* a JavaScript built-in typed array (defined in Terms)
    holding 32-bit floating-point numbers specifically — not a
    Three.js class at all, a plain JavaScript language feature.
  - *Implementation:* `new Float32Array([n1, n2, n3, ...])` builds one
    from a plain array of numbers, copying each value in and coercing
    it to a 32-bit float; `new Float32Array(9)` (a bare number instead
    of an array) would instead build one pre-filled with nine zeros.
  - *Its use:* this lesson's own raw vertex position data is stored
    exactly this way — the same format a real `.obj` parser (Module B)
    will need to produce from your file's text.
  - *Type:* a built-in JavaScript class, part of the language itself
    (the ECMAScript "TypedArray" family), not something Three.js
    defines or could exist without.
  - *Responsibility:* holds a fixed-length, fixed-type block of raw
    numeric data efficiently, and refuses (silently coerces, rather
    than crashes — confirmed below) to hold anything that isn't
    numeric.
  - *Depends on:* nothing — constructible with no other objects
    involved.
  - *Connects to:* handed directly into `THREE.BufferAttribute`'s
    constructor, below — nothing sits between raw typed-array data and
    the Three.js object that wraps it for GPU use.
  - *Shape:* a flat, one-dimensional sequence of plain numbers with no
    internal grouping — `itemSize` (defined in Terms) is the only thing
    that later imposes grouping on it; the array itself has no concept
    of "vertex 1" versus "vertex 2," only index `0` through `length-1`.

- **`THREE.BufferAttribute(array, itemSize)`**
  - *What it is:* the Three.js wrapper that takes a raw typed array and
    says what it actually *means* — how many numbers belong to each
    vertex.
  - *Implementation:* a class; constructor takes the typed array itself
    and an `itemSize` integer — `new THREE.BufferAttribute(positions,
    3)` for (x, y, z) triples.
  - *Its use:* this is the object `BufferGeometry.setAttribute` (below)
    actually expects — a raw `Float32Array` alone isn't enough; Three.js
    needs to be told the itemSize before it can make sense of the flat
    data.
  - *Type:* a class, one instance per named attribute per geometry
    (this lesson builds exactly one, for `position`).
  - *Responsibility:* pairs one raw typed array with the one piece of
    grouping information (itemSize) needed to read it correctly as a
    list of same-sized value-groups, and exposes a derived `.count`
    (how many groups/vertices) computed from `array.length / itemSize`.
  - *Depends on:* a real typed array, handed in at construction.
  - *Connects to:* handed to `geometry.setAttribute('position', ...)`
    below; read by the renderer (Lesson 1's own subject) when actually
    drawing.
  - *Shape:* confirmed below — `.array` holds the exact same object
    reference passed in (not a copy), `.count` and `.itemSize` are
    plain numbers derived from it.

- **`THREE.BufferGeometry`** *(reappearing from Lesson 1 — where it
  only appeared as `BoxGeometry`'s parent class, inspected but never
  built directly; given its own full, direct treatment here per the
  Repetition Rule)*
  - *What it is:* a container for named vertex attributes — the same
    role `BoxGeometry` filled in Lesson 1, except this lesson builds
    one with no built-in shape logic at all, entirely by hand.
  - *Implementation:* `new THREE.BufferGeometry()` takes no arguments
    and starts with zero attributes — confirmed below.
  - *Its use:* this is the actual base class every specific shape
    (`BoxGeometry`, `SphereGeometry`, and — eventually — whatever your
    OBJ parser produces) is built from; using it bare, with no
    subclass, is what proves there's no hidden magic inside
    `BoxGeometry` beyond exactly this.
  - *Type:* a class; `BoxGeometry` (Lesson 1) is a subclass of this
    exact class, not a wholly separate mechanism.
  - *Responsibility:* holds a dictionary of named `BufferAttribute`
    objects (`.attributes`) plus an optional `.index`, and nothing
    else — genuinely no logic for what shape it represents; that
    meaning lives entirely in what attributes get set on it and what
    values they hold.
  - *Depends on:* nothing to construct; needs `.setAttribute(...)`
    calls to become useful.
  - *Connects to:* handed to `THREE.Mesh`'s constructor, same as
    Lesson 1's `BoxGeometry` was; `.computeVertexNormals()` (below)
    reads its own `position` attribute and writes a new `normal`
    attribute back onto itself.
  - *Shape:* confirmed below — genuinely empty (`Object.keys(...)`
    returns `[]`) immediately after construction, unlike `BoxGeometry`
    which arrives with `position`/`normal`/`uv` already filled in by
    its own internal constructor logic.

- **`BufferGeometry.setAttribute(name, attribute)`**
  - *What it is:* the method that actually installs one named
    `BufferAttribute` onto a geometry.
  - *Implementation:* an instance method; `geometry.setAttribute(
    'position', bufferAttributeInstance)` — the string name and the
    `BufferAttribute` object, in that order.
  - *Its use:* this is the one call that turns an empty
    `BufferGeometry` into one with real shape data — without it,
    `geometry.attributes` stays `{}` forever.
  - *Type:* an instance method on `BufferGeometry`.
  - *Responsibility:* stores the given attribute under the given name
    in the geometry's own `.attributes` dictionary, so later code
    (`.computeVertexNormals()`, the renderer) can find it by that exact
    name.
  - *Depends on:* being called on a real `BufferGeometry` instance,
    with a real `BufferAttribute` as its second argument.
  - *Connects to:* called directly on the `geometry` variable this
    lesson builds; read back via `geometry.attributes.position`
    immediately after, confirmed below to be the exact same object.
  - *Shape:* no return value used in this lesson; its effect is a
    mutation of `geometry.attributes` itself, confirmed below by
    reading `Object.keys(geometry.attributes)` before and after.

- **`BufferGeometry.computeVertexNormals()`**
  - *What it is:* a method that calculates a `normal` attribute (defined
    in Lesson 1's Terms) automatically, from the `position` attribute
    alone — the exact calculation `BoxGeometry`'s own constructor
    already did for you, silently, in Lesson 1.
  - *Implementation:* an instance method, no arguments; reads
    `geometry.attributes.position` and `geometry.index` if present, and
    writes a new `geometry.attributes.normal` attribute.
  - *Its use:* without this call, a hand-built geometry has no normal
    data at all — confirmed below, `geometry.attributes.normal` is
    `undefined` before this call — and `MeshNormalMaterial` (Lesson 1),
    which colors pixels *by* normal direction, would have nothing to
    read.
  - *Type:* an instance method on `BufferGeometry`.
  - *Responsibility:* for each triangle, computes the direction
    perpendicular to that triangle's face (via a cross product of two
    of its edges — the actual math is out of scope for this lesson,
    but the mechanism is real, not hidden) and writes it into a new
    `normal` attribute, one normal per vertex.
  - *Depends on:* a `position` attribute already being set — calling
    this before `setAttribute('position', ...)` would have nothing to
    compute from.
  - *Connects to:* called once, directly after `setAttribute`, in this
    lesson's own New Code; its output (`geometry.attributes.normal`) is
    exactly what `MeshNormalMaterial` (Lesson 1) reads at render time.
  - *Shape:* confirmed below — produces a `normal` attribute with the
    same `.count` as `position` (one normal per vertex, not one per
    triangle), and for a triangle lying flat in the XY plane facing the
    camera, a normal of almost exactly `(0, 0, 1)`.

---

## Concept Unit: Raw Vertex Data — `Float32Array` and `THREE.BufferAttribute`

### The Problem

Lesson 1's `BoxGeometry` arrived with its `position` attribute already
filled in — 24 numbers-worth of vertices you never typed yourself. That
hid an honest question: what does a vertex's position actually *look
like* in memory, before any built-in primitive class does the typing
for you? Your own pipeline's `.obj` files are going to hand you exactly
this — raw numbers, nothing pre-built — so this question isn't
academic.

> **Stop and think first:** if you had to store 3 vertices' worth of
> (x, y, z) positions using only a plain JavaScript array — `[]`, the
> kind you already know — what would that array actually contain? One
> nested array per vertex (`[[0,1,0], [-1,-1,0], [1,-1,0]]`), or one
> single flat list of 9 numbers in a row? What information would you
> lose, or need to track separately, with the flat version — could you
> tell, just by looking at index `4` of a flat 9-number array, which
> vertex it belongs to, without also knowing how many numbers make up
> one vertex?

### Isolating `Float32Array` and `THREE.BufferAttribute`

```js
// throwaway-typed-array.mjs
import * as THREE from 'three';

const raw = new Float32Array([0, 0, 0, 1, 0, 0, 0, 1, 0]);
console.log('raw instanceof Float32Array:', raw instanceof Float32Array);
console.log('raw.length:', raw.length);
console.log('raw[3], raw[4], raw[5] (second vertex):', raw[3], raw[4], raw[5]);
console.log('typeof raw[0]:', typeof raw[0]);

raw[0] = "9"; // try assigning a string
console.log('after raw[0] = "9" (a string):', raw[0], typeof raw[0]);

const attr = new THREE.BufferAttribute(raw, 3);
console.log('attr instanceof THREE.BufferAttribute:', attr instanceof THREE.BufferAttribute);
console.log('attr.count (vertices):', attr.count);
console.log('attr.itemSize:', attr.itemSize);
console.log('attr.array === raw:', attr.array === raw);
```

Actually run, this session, in plain Node:

```
raw instanceof Float32Array: true
raw.length: 9
raw[3], raw[4], raw[5] (second vertex): 1 0 0
typeof raw[0]: number
after raw[0] = "9" (a string): 9 number
attr instanceof THREE.BufferAttribute: true
attr.count (vertices): 3
attr.itemSize: 3
attr.array === raw: true
```

This is called **type coercion at the storage layer**. What it proves,
and why the string-assignment line is worth stopping on: assigning the
*string* `"9"` into a `Float32Array` did not throw an error and did not
store a string — it silently converted to the *number* `9`
(`typeof raw[0]` reads `"number"` afterward, not `"string"`) — this is
the plain JavaScript array's behavior have been completely different
(it would have genuinely stored the string, corrupting later math with
no warning). It also proves `attr.count` — 3 — is *derived*, not
separately stored: nine raw numbers, told they come in groups of 3
(`itemSize`), works out to 3 vertices, exactly matching the 3 (x, y, z)
triples in the literal array above. And `attr.array === raw` (strict
equality) proves `BufferAttribute` wraps the exact array given to it,
not a copy — the same "live reference, not a copy" pattern Lesson 1's
Mesh unit already proved for geometry and material references.

### Discarding the throwaway example

Deleted — this exact snippet never appears in the real project. What it
proved (typed arrays coerce rather than reject non-numeric assignment;
`BufferAttribute.count` is derived from length and itemSize; the
attribute wraps the array by reference) is what the real code below
relies on.

### Project Change

- **Reference Source:** No reference counterpart — from-scratch
  addition; this lesson doesn't extend Lesson 1's `main.js`, it starts
  a new file, because it's teaching a genuinely separate concern (how
  geometry data is built) rather than continuing the running cube app.
- **Files affected:** created —
  `lessons/lesson-02-geometry-and-material/index.html`,
  `lessons/lesson-02-geometry-and-material/main.js`.
- **Change type:** add.
- **Location:** top of the new `main.js`.
- **Dependencies:** the `three` package, imported the same way as
  Lesson 1.

### The New Code

```js
import * as THREE from 'three';

const positions = new Float32Array([
   0,  1, 0,   // top
  -1, -1, 0,   // bottom left
   1, -1, 0,   // bottom right
]);
const positionAttribute = new THREE.BufferAttribute(positions, 3);
```

### The Updated Project

Nothing exists yet for this to sit inside — a brand-new file, per
Project Change above.

```
1  import * as THREE from 'three';
2
3  const positions = new Float32Array([   // ← new
4     0,  1, 0,   // top                  // ← new
5    -1, -1, 0,   // bottom left          // ← new
6     1, -1, 0,   // bottom right         // ← new
7  ]);                                     // ← new
8  const positionAttribute = new THREE.BufferAttribute(positions, 3); // ← new
```

`main.js` now holds exactly the raw numeric ingredients for one
triangle's shape — nine numbers, grouped by three — with nothing yet
telling Three.js's scene/mesh machinery about them at all.

### Mechanical Walkthrough

- `new Float32Array([...])` — the constructor (Lesson 1's Terms)
  building a real typed array from the nine literal numbers, confirmed
  above to coerce and never silently accept non-numeric data.
- `0, 1, 0` / `-1, -1, 0` / `1, -1, 0` — three (x, y, z) triples, laid
  out as plain numeric literals in source, one triangle's three
  corners: top-center, bottom-left, bottom-right.
- `// top`, `// bottom left`, `// bottom right` — ordinary code
  comments; not a language feature this lesson is teaching, but worth
  naming why they're here at all: nothing in the flat array itself
  labels which three numbers are "which" vertex — the comment is the
  only thing doing that for a human reader, which is exactly the gap
  the Problem section above asked you to notice.
- `new THREE.BufferAttribute(positions, 3)` — the constructor (defined
  in this lesson's own Header), given the `positions` array from the
  line above and `3` as itemSize — confirmed above to produce
  `.count === 3`, matching the three vertices.
- `positionAttribute` — the variable now holding this wrapped
  attribute, ready to be installed onto a real geometry in the next
  unit.

### CS Lens

Separating raw data (`Float32Array`) from a thin wrapper that gives it
meaning (`BufferAttribute`, adding only `itemSize` — a count of how the
flat data groups) is an instance of **separating data from schema** —
the same split a CSV file (flat rows of text) has from a database
table's declared column types, or raw bytes on a network wire have
from a protocol specification that says how to parse them. Also
recognized in: JSON (flat text) versus a schema validator that gives it
structure meaning; a binary image file's raw pixel bytes versus its
header describing width/height/format; your own machining pipeline's
`.obj` file (flat text lines) versus this exact lesson's
`BufferAttribute` giving those numbers a shape once parsed.

### SE Lens

The alternative not chosen: storing vertex data as an array of
`{x, y, z}` plain objects, one per vertex — arguably more readable in
source code. The real cost of that readability: a GPU (and Three.js's
own internal WebGL calls) needs one contiguous block of raw numbers to
upload efficiently in a single operation; an array of small objects is
scattered across memory, each one boxed separately, and would need to
be flattened into exactly the `Float32Array` shape shown here before
any real rendering could happen anyway. This project accepts the flat,
less immediately readable shape from the very first line, rather than
writing the readable version and converting it later — because Module
B's real OBJ parser is going to produce flat data natively (a text file
is inherently a flat sequence, not nested objects), and learning to
read flat vertex data now avoids relearning it under real parsing
pressure later.

### One sentence connecting this unit to what came before

This attribute is just wrapped data, sitting in a variable, connected
to nothing yet — the next unit installs it onto a real
`BufferGeometry`, the same kind of object Lesson 1's `BoxGeometry`
turned out to be a subclass of.

---

## Concept Unit: A Geometry Built By Hand — `BufferGeometry`, `setAttribute`, `computeVertexNormals`

### The Problem

Lesson 1 proved `BoxGeometry` is a `BufferGeometry` subclass, and
inspected its resulting `position`/`normal`/`uv` attributes — but never
watched those attributes get *created*. `BoxGeometry`'s own constructor
did that work invisibly. Building the identical kind of object by hand,
one `setAttribute` call at a time, is the only way to actually see
what that invisible work consists of.

> **Stop and think first:** Lesson 1 showed that a brand-new
> `THREE.Scene()` starts with `.children.length === 0`. Given that
> `BufferGeometry` is the base class every specific shape (including
> `Scene`'s sibling concept, in a sense) extends, what would you guess
> `Object.keys(new THREE.BufferGeometry().attributes)` returns, before
> anything is set on it — an empty array, or something pre-filled the
> way `BoxGeometry` was? And once you call `.computeVertexNormals()`
> on a geometry that only has `position` set — what data could that
> method possibly be reading to produce a `normal`, if `position` is
> the only thing you gave it?

### Isolating `BufferGeometry`, `setAttribute`, and `computeVertexNormals`

```js
// throwaway-custom-geometry.mjs
import * as THREE from 'three';

const geometry = new THREE.BufferGeometry();
console.log('brand new BufferGeometry, attributes:', Object.keys(geometry.attributes));
console.log('geometry.index (before anything set):', geometry.index);

const positions = new Float32Array([
   0, 1, 0,
  -1,-1, 0,
   1,-1, 0,
]);
geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
console.log('after setAttribute, attributes:', Object.keys(geometry.attributes));
console.log('position.count (vertices):', geometry.attributes.position.count);
console.log('geometry.attributes.normal (before computeVertexNormals):', geometry.attributes.normal);

geometry.computeVertexNormals();
console.log('geometry.attributes.normal (after computeVertexNormals):', geometry.attributes.normal !== undefined);
console.log('normal.count:', geometry.attributes.normal.count);
console.log('first normal xyz (flat triangle facing +z, expect ~0,0,1):',
  geometry.attributes.normal.array[0].toFixed(3),
  geometry.attributes.normal.array[1].toFixed(3),
  geometry.attributes.normal.array[2].toFixed(3)
);
```

Actually run, this session, in plain Node:

```
brand new BufferGeometry, attributes: []
geometry.index (before anything set): null
after setAttribute, attributes: [ 'position' ]
position.count (vertices): 3
geometry.attributes.normal (before computeVertexNormals): undefined
geometry.attributes.normal (after computeVertexNormals): true
normal.count: 3
first normal xyz (flat triangle facing +z, expect ~0,0,1): 0.000 0.000 1.000
```

What this proves, directly answering both Socratic questions above: a
bare `BufferGeometry` really does start with zero attributes
(`[]`, not pre-filled the way `BoxGeometry` was) — confirming
`BoxGeometry`'s attributes came entirely from its own constructor code
choosing to call `setAttribute` itself, not from any base-class magic.
And `computeVertexNormals()`, given only `position`, produces a
`normal` of almost exactly `(0, 0, 1)` — because with only three points
defining a single flat triangle lying in the XY plane, there is only
one possible perpendicular direction, computed from those exact three
points' geometry, not looked up or guessed.

### Discarding the throwaway example

Deleted — never appears in the real project. What it proved (a bare
`BufferGeometry` starts genuinely empty; `computeVertexNormals` derives
real, correct data from `position` alone) is what the real code below
relies on.

### Project Change

- **Reference Source:** No reference counterpart — from-scratch
  addition.
- **Files affected:** modified — `main.js` (the same file from the
  previous unit).
- **Change type:** add.
- **Location:** directly below the `positionAttribute` line from the
  previous unit.
- **Dependencies:** the `positionAttribute` variable from the previous
  unit.

### The New Code

```js
const geometry = new THREE.BufferGeometry();
geometry.setAttribute('position', positionAttribute);
geometry.computeVertexNormals();
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
10 const geometry = new THREE.BufferGeometry();          // ← new
11 geometry.setAttribute('position', positionAttribute); // ← new
12 geometry.computeVertexNormals();                       // ← new
```

`main.js` now holds a genuinely complete, hand-built `BufferGeometry` —
real position data (lines 3–8), installed onto a real geometry (lines
10–11), with real computed normals (line 12) — the exact same shape of
object `BoxGeometry` was in Lesson 1, just built by hand instead of by
a primitive's constructor.

### Mechanical Walkthrough

- `new THREE.BufferGeometry()` — the constructor (defined in this
  lesson's Header), confirmed above to produce zero attributes.
- `geometry.setAttribute('position', positionAttribute)` — the method
  (defined in this lesson's Header), given the exact `positionAttribute`
  object built in the previous unit — installs it under the name
  `'position'`, confirmed above by reading `Object.keys(...)`
  immediately after in the isolated lab.
- `'position'` — a plain string literal, used purely as a lookup key —
  Three.js's own rendering code and `computeVertexNormals` both look
  for this exact string when they need position data; naming it
  anything else (`'pos'`, `'verts'`) would silently break both, since
  nothing enforces the name beyond convention.
- `geometry.computeVertexNormals()` — the method (defined in this
  lesson's Header), confirmed above to read the `position` attribute
  just installed and write a new `normal` attribute derived from it.

### CS Lens

Deriving one piece of data (`normal`) automatically from another
(`position`), rather than requiring it to be supplied separately, is an
instance of **computing derived state instead of storing it
redundantly** — keeping one source of truth (`position`) and generating
anything that logically follows from it, rather than risking the two
falling out of sync if `position` changes later but `normal` isn't
recomputed. Also recognized in: a spreadsheet formula cell recomputed
from its inputs rather than typed in by hand; a database view computed
from base tables instead of duplicated; a build system regenerating a
compiled file from source rather than trusting a stale copy; this
lesson's own second `Mesh` — coming in the next unit — sharing one
geometry object rather than each getting its own separate copy.

### SE Lens

The alternative not chosen: requiring every geometry-builder (including
a future OBJ parser) to compute and supply its own normals directly,
rather than offering `computeVertexNormals()` as a shared utility. The
real cost of *not* offering it: every future geometry-construction path
in this project would need to reimplement the same cross-product math,
with real risk of getting the winding order wrong and producing
inverted normals — while the real cost of the API as it exists: it's
only correct if `position` is already fully and correctly set before
it's called (confirmed above — calling it on an empty geometry would
have nothing to compute from), so call-ordering is a real constraint a
reader has to get right, not something the method itself protects
against.

### One sentence connecting this unit to what came before

This `geometry` variable is now, provably, the exact same *kind* of
object `BoxGeometry` produced in Lesson 1 — the next unit proves that
by pairing it with two different materials and showing both work,
exactly as they did with the box.

---

## Concept Unit: One Geometry, Two Materials — Proving the Split Is Real

### The Problem

Lesson 1's title claim — that geometry and material are genuinely
separate things Three.js deliberately keeps apart — was stated and
used, but never directly *tested*. Nothing in Lesson 1 proved that the
exact same shape data could survive being paired with a completely
different material, unchanged. Your own pipeline's real need (grey for
unmachined, green for machined, on the *same* physical surface) depends
entirely on this being true.

> **Stop and think first:** if `meshA` and `meshB` both hold a
> reference to the same `geometry` object (not two separate copies),
> and you mutate one of that geometry's vertex positions — say, move
> the triangle's top point higher — would you expect that change to
> show up when reading through `meshA`, through `meshB`, both, or
> neither? Reason from Lesson 1's own proof that `Mesh` holds a live
> reference (`===`), not a copy — what does that same fact imply here,
> with two meshes instead of one?

### Isolating the split — two materials, one shared geometry

```js
// throwaway-shared-geometry.mjs
import * as THREE from 'three';

const positions = new Float32Array([0, 1, 0, -1, -1, 0, 1, -1, 0]);
const geometry = new THREE.BufferGeometry();
geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
geometry.computeVertexNormals();

const matA = new THREE.MeshNormalMaterial();
const matB = new THREE.MeshBasicMaterial({ color: 0xff0000, wireframe: true });

const meshA = new THREE.Mesh(geometry, matA);
const meshB = new THREE.Mesh(geometry, matB);

console.log('meshA.geometry === meshB.geometry:', meshA.geometry === meshB.geometry);
console.log('meshA.material === meshB.material:', meshA.material === meshB.material);
console.log('matA.type:', matA.type, '| matB.type:', matB.type);
console.log('matB.wireframe:', matB.wireframe, '| matA.wireframe:', matA.wireframe);
console.log('matB.color (hex):', matB.color.getHexString());

geometry.attributes.position.array[1] = 5; // mutate ONE shared geometry
geometry.attributes.position.needsUpdate = true;
console.log('meshA sees updated position.y:', meshA.geometry.attributes.position.array[1]);
console.log('meshB sees updated position.y:', meshB.geometry.attributes.position.array[1]);
```

Actually run, this session, in plain Node:

```
meshA.geometry === meshB.geometry: true
meshA.material === meshB.material: false
matA.type: MeshNormalMaterial | matB.type: MeshBasicMaterial
matB.wireframe: true | matA.wireframe: false
matB.color (hex): ff0000
meshA sees updated position.y: 5
meshB sees updated position.y: 5
```

This is called **shared, mutable reference state**. What it proves,
directly: two `Mesh` objects really can hold the identical geometry
(`===`, strict identity — the same shape data, not two lookalike
copies) while holding two completely different materials (`===` is
`false` for the materials — genuinely different objects, one a
`MeshNormalMaterial`, one a wireframe red `MeshBasicMaterial`). And the
mutation test settles the Socratic question directly: moving the
shared geometry's vertex shows up through *both* mesh references
identically — because there is, in real memory, only one geometry
object; `meshA` and `meshB` are two different names for two different
`Mesh` wrappers that both happen to point at it.

### Discarding the throwaway example

Deleted — never appears in the real project. What it proved (shared
geometry references stay shared across multiple meshes; materials
paired with that same geometry remain fully independent of it and of
each other) is what your own future stock/fixture toggling (Module E)
and multi-stage machining sequence (Module F) both directly depend on:
many meshes, sharing geometry where it's genuinely identical, each
free to carry its own separate material or visibility state.

### Project Change

- **Reference Source:** No reference counterpart — from-scratch
  addition.
- **Files affected:** modified — `main.js`.
- **Change type:** add.
- **Location:** directly below the `computeVertexNormals()` call from
  the previous unit.
- **Dependencies:** the `geometry` variable from the previous unit.

### The New Code

```js
const matA = new THREE.MeshNormalMaterial();
const matB = new THREE.MeshBasicMaterial({ color: 0xff0000, wireframe: true });

const meshA = new THREE.Mesh(geometry, matA);
const meshB = new THREE.Mesh(geometry, matB);
meshA.position.x = -1.5;
meshB.position.x = 1.5;
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
14 const matA = new THREE.MeshNormalMaterial();                                  // ← new
15 const matB = new THREE.MeshBasicMaterial({ color: 0xff0000, wireframe: true }); // ← new
16
17 const meshA = new THREE.Mesh(geometry, matA); // ← new
18 const meshB = new THREE.Mesh(geometry, matB); // ← new
19 meshA.position.x = -1.5;                       // ← new
20 meshB.position.x = 1.5;                        // ← new
```

`main.js` now builds one triangle's worth of shape data exactly once
(lines 3–12), and reuses it to place two visually distinct triangles
side by side in the world (lines 14–20) — one shaded by normal
direction, one drawn as a red wireframe — proving the split this
lesson set out to prove, with real objects instead of an assertion.

### Mechanical Walkthrough

- `new THREE.MeshNormalMaterial()` — reappearing from Lesson 1, given
  full treatment again there and confirmed identical here.
- `new THREE.MeshBasicMaterial({ color: 0xff0000, wireframe: true })` —
  a new material class, constructed with an options object instead of
  no arguments: `color` (a hex integer — `0xff0000` is pure red,
  written in JavaScript's hexadecimal numeric literal syntax) and
  `wireframe` (a boolean — confirmed above to actually land on
  `matB.wireframe`, matching Lesson 1's own note that
  `MeshNormalMaterial` had this exact same property, just left at its
  default `false`). `MeshBasicMaterial`, unlike `MeshNormalMaterial`,
  ignores the geometry's normal data entirely — it colors every pixel
  the flat `color` given, which is *why* `wireframe: true` is used here
  to make it visually distinguishable at all from a plain flat-red
  triangle.
- `new THREE.Mesh(geometry, matA)` / `new THREE.Mesh(geometry, matB)` —
  the constructor (Lesson 1's Header, reappearing here), called twice,
  with the identical `geometry` variable both times — this exact
  repetition, of the same variable, is the whole point being taught:
  confirmed above by the isolated lab's own `meshA.geometry ===
  meshB.geometry` check.
- `meshA.position.x = -1.5` / `meshB.position.x = 1.5` — property
  assignment on `.position` (Lesson 1's own Camera unit already
  established `.position` as a real `Vector3`, given full treatment
  there and reused here) — moving the two meshes apart on the x-axis so
  both are visible at once instead of rendering on top of each other at
  the shared origin both would otherwise default to.

### CS Lens

Two independent objects (`meshA`, `meshB`) holding a shared reference to
one piece of common state (`geometry`) while each keeping their own
private state (`matA`/`matB`, `position`) is the general shape of the
**flyweight pattern** — sharing expensive, identical data across many
logical instances instead of duplicating it. Also recognized in: a text
editor rendering a thousand instances of the letter "e" from one shared
glyph bitmap instead of a thousand separate copies; a game rendering a
thousand identical trees from one shared mesh, each with its own
position; a browser's own `<img>` tag, where the same image file, once
downloaded, is drawn at many different points on a page without being
re-fetched or re-decoded per use.

### SE Lens

The alternative not chosen: giving each `Mesh` its own private, deep
copy of the geometry, so each is fully independent from the start. That
would remove the exact behavior this unit's mutation test just
demonstrated (a shared-geometry edit affecting every mesh that
references it) — which sounds safer in isolation, but at real cost:
your own project's future multi-stage machining sequence (Module F)
loads a *separate* geometry per stage anyway (they're genuinely
different shapes, stage to stage), so the case that actually matters
here is smaller-scale reuse — many fixtures built from one shared bolt
geometry, for instance — where deep-copying by default would silently
multiply real memory use for data that was never meant to diverge.
Three.js's actual choice — share by default, copy only if you
explicitly ask for it (`geometry.clone()`, not used in this lesson) —
puts the cost of accidental sharing on the reader to watch for, rather
than paying a real memory cost by default for a safety net most objects
in this project won't need.

### One sentence connecting this unit to what came before

Both triangles on screen right now trace back to the exact nine numbers
typed by hand in this lesson's first unit — everything since has been
about what gets *attached* to that one piece of data, never about
changing the data itself.

---

## Closing

### Connect the pieces

Start from the nine literal numbers on lines 3–7: `0, 1, 0, -1, -1, 0,
1, -1, 0`. Line 8 wraps them, unchanged, telling Three.js they come in
groups of 3. Line 10 creates an empty container; line 11 installs that
exact wrapped attribute into it under the name `'position'` — confirmed,
this unit's own isolated lab, to leave `Object.keys(geometry.attributes)`
reading `['position']` immediately after, where it had read `[]` the
instant before. Line 12 reads those same nine numbers back out to
compute a `normal` attribute nothing in the source code stated directly
— confirmed to come out `(0, 0, 1)`, the one mathematically correct
answer for these exact three points, not a guess or a default. Lines
14–15 build two materials that will never touch `geometry` directly at
all — `MeshNormalMaterial` reads whatever normal data whatever geometry
it's paired with happens to have; `MeshBasicMaterial` doesn't even do
that much, reading only its own `color`. Lines 17–18 are the one moment
the geometry and each material actually meet, in two separate `Mesh`
objects that — confirmed above — share the exact same geometry
reference while holding two genuinely different materials. Lines 19–20
give each mesh its own separate `position`, proving even that much is
per-mesh, not shared the way geometry was. Every one of Lesson 1's own
render-loop pieces — `scene`, `camera`, `renderer`, `animate()` — is
still exactly what would be needed to actually get these two triangles
on screen; this lesson deliberately built and inspected geometry and
material data in isolation, without repeating that render-loop
machinery, because nothing about *how a frame gets drawn* changed here
— only what, precisely, geometry and material each are, and are not,
changed.

## Commands needed

Identical to Lesson 1's own Commands section, reused here without
change — the same `npx serve .` command, from inside
`lessons/lesson-02-geometry-and-material/`, and the same importmap
pinning `three@0.185.1` in `index.html`. Nothing about how the page is
served or how Three.js is loaded is new in this lesson.

## Run it

The full assembled file (Lessons 2's own three units, plus Lesson 1's
own scene/camera/renderer/render-loop machinery, wired up so the two
triangles actually appear) is provided as a real, runnable project —
see `lessons/lesson-02-geometry-and-material/`. As with Lesson 1's
`WebGLRenderer` and `requestAnimationFrame`, actually seeing two
triangles rendered — one shaded by normal direction, one a red
wireframe, side by side — requires a real browser this sandbox doesn't
have. Run it, and you should see: a normal-shaded triangle on the left,
a red wireframe triangle (three thin red lines forming its outline, no
filled interior) on the right. Report back what you actually see so it
can be saved as this lesson's own real, reader-run verification.

## Next lesson

Lesson 3 covers light — specifically, why `MeshBasicMaterial` and
`MeshNormalMaterial`, both used in this lesson, are the two Three.js
materials that *don't* need a light to be visible at all, and why
`MeshStandardMaterial` — the material your real machining models will
eventually want, so that grey-vs-green vertex colors still read
correctly under realistic shading — goes fully black without one.
