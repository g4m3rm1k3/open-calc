# Lesson 2: BufferGeometry From Raw Arrays — Your First Real Triangle

**What you will build:** a real `THREE.BufferGeometry`, built directly
from a flat `positions` array and an `indices` array — no
`THREE.BoxGeometry` or other convenience shape involved anywhere — plus
a `THREE.Mesh` combining that geometry with a material, rendered for
real for the first time. This is deliberate: your own OBJ parser
already produces exactly this shape (a flat positions array, a flat
indices array), so this lesson is where you understand precisely what
those two arrays become once they're inside Three.js.

**What you need to know first:** Lesson 1 in full — `Scene`, `Camera`,
`Renderer`, the render loop, and `Object3D`/inheritance.

**Terms used in this lesson:**
- **`THREE.BufferGeometry`** — a raw data container holding one or more
  named **attributes** (this lesson's own term), each a flat array of
  numbers, plus an optional index array. It exists as the actual shape
  data lives in on the GPU: not as objects with `.x`/`.y`/`.z`
  properties, but as tightly packed arrays of plain numbers — the same
  representation your own `.obj` files use once parsed.
- **attribute** — one named flat array attached to a `BufferGeometry`
  (`position`, and — starting next lesson — `color`), plus an
  **item size** (this lesson's own term) saying how many consecutive
  numbers make up one logical value.
- **item size (`itemSize`)** — how many numbers in a flat array group
  together to form one value — `3` for a `position` attribute, since
  each point is an `(x, y, z)` triple. It exists because a flat array
  on its own is just numbers with no structure — `itemSize` is what
  tells `BufferGeometry` "every 3 numbers is one point," the same way
  your own OBJ parser's `v x y z` line format implicitly groups numbers
  in threes.
- **`THREE.Float32BufferAttribute`** — the specific class wrapping a
  flat JavaScript array (or typed array) together with its `itemSize`,
  stored internally as 32-bit floating point numbers (the precision
  GPUs work with natively) rather than JavaScript's own default 64-bit
  numbers.
- **index buffer** — a separate flat array of whole numbers, each one a
  position into the `position` attribute, describing which three
  vertices make up each triangle — letting a vertex that's shared by
  several triangles (a real corner where multiple faces meet) be stored
  *once* in the `position` array and simply referenced multiple times,
  rather than duplicated.
- **`THREE.Mesh`** — the actual scene-graph object (an `Object3D`,
  Lesson 1's own term) combining a `BufferGeometry` (the shape) with a
  `THREE.Material` (how it should look) into something that can
  actually be added to a scene and rendered. A `BufferGeometry` alone
  is just data — it has no color, no way to react to light, and can't
  be added to a `Scene` directly; a `Mesh` is what makes it a real,
  visible thing.

**Objects and methods used:**

- **`THREE.BufferGeometry`**
  - *What it is:* a container for a shape's raw numeric data.
  - *Implementation:* `new THREE.BufferGeometry()` creates an empty
    one; `.setAttribute(name, attribute)` attaches a named attribute
    (this lesson's own term); `.setIndex(array)` attaches the index
    buffer (this lesson's own term); `.getAttribute(name)`/`.getIndex()`
    read them back.
  - *Its use:* your own OBJ parser's `positions`/`indices` arrays are
    exactly what gets handed to `.setAttribute('position', ...)` and
    `.setIndex(...)` in your existing `mesh_viewer.html`.
  - *Type:* a class.
  - *Responsibility:* to hold a shape's raw vertex data, with no
    opinion about color, lighting, or appearance — identical in spirit
    to Lesson 1's own `Scene`/`Camera` distinction: data, not behavior.
  - *Depends on:* nothing at construction; attributes and an index are
    attached afterward.
  - *Connects to:* handed to `THREE.Mesh`'s constructor, alongside a
    material.
  - *Shape:* the data half of a `Mesh` — a `Mesh` is a `BufferGeometry`
    plus a `Material`, nothing more.

- **`THREE.Float32BufferAttribute`**
  - *What it is:* a flat array of numbers plus an item size, ready to
    attach to a `BufferGeometry`.
  - *Implementation:* `new THREE.Float32BufferAttribute(array, itemSize)`.
  - *Its use:* wraps your own parser's `parsed.positions` array (a flat
    JavaScript array) before it's usable as a `BufferGeometry`
    attribute.
  - *Type:* a class.
  - *Responsibility:* to interpret a flat array as a sequence of
    fixed-size groups (this lesson's own **item size**), and store it
    in the 32-bit float format the GPU actually consumes.
  - *Depends on:* a plain JavaScript array (or typed array) and an
    item size.
  - *Connects to:* passed to `BufferGeometry.setAttribute`.
  - *Shape:* the specific attribute type used for numeric per-vertex
    data — `position` and, next lesson, `color`, are both this same
    class, differing only in which name they're attached under.

- **`THREE.Mesh`**
  - *What it is:* a renderable scene-graph object combining geometry
    and material.
  - *Implementation:* `new THREE.Mesh(geometry, material)`.
  - *Its use:* the actual object added to a `Scene` (Lesson 1) via
    `scene.add(mesh)` — a `BufferGeometry` on its own can never be
    added directly.
  - *Type:* a class, an `Object3D` subclass (Lesson 1's own term) — the
    same inheritance relationship `PerspectiveCamera` has, meaning a
    `Mesh` also has its own `.position`, and can itself have children.
  - *Responsibility:* to pair a shape (`BufferGeometry`) with an
    appearance (`Material`) into one addable, positionable,
    renderable thing.
  - *Depends on:* a `BufferGeometry` and a `Material` (this lesson uses
    `THREE.MeshBasicMaterial`, the simplest kind — a flat, unlit color,
    with real vertex colors and lighting-aware materials starting next
    lesson).
  - *Connects to:* added to a `Scene` via `.add()`; drawn by the
    `Renderer`'s own `.render()` call, both from Lesson 1.
  - *Shape:* sits in the scene graph as a normal `Object3D`, wrapping a
    `BufferGeometry` (pure data) and a `Material` (pure appearance
    rules) together.

---

## Concept Unit: BufferGeometry — Raw Numbers, Not Shapes

### The Problem

Your own OBJ parser already produces exactly two flat arrays:
`positions` (every vertex's `x, y, z`, one after another) and `indices`
(which three positions make each triangle). Nothing in what you've
built so far in this curriculum has looked at what Three.js actually
does with arrays shaped like that — `BufferGeometry` is the answer, but
right now it's just a name.

> **Before reading on, try this yourself:** a flat array like
> `[0, 0, 0, 1, 0, 0, 0, 1, 0]` has no structure of its own — it's just
> nine numbers. If you were told "every 3 numbers is one point," what
> loop would turn that flat array back into three separate `(x, y, z)`
> groups?

### Introduce the Concept in Isolation

```javascript
// Throwaway lab: a flat array of numbers, grouped into chunks of 3
const flat = [0, 0, 0,  1, 0, 0,  0, 1, 0];  // three points, x,y,z each

function groupBy3(flat) {
    const points = [];
    for (let i = 0; i < flat.length; i += 3) {
        points.push([flat[i], flat[i + 1], flat[i + 2]]);
    }
    return points;
}

console.log(flat.length);
console.log(groupBy3(flat));
```

Real output:

```
9
[ [ 0, 0, 0 ], [ 1, 0, 0 ], [ 0, 1, 0 ] ]
```

Nine flat numbers, correctly regrouped into three separate points —
`groupBy3`'s loop steps by `3` each time (`i += 3`), directly answering
this Concept Unit's own Socratic prompt. This *is* what `itemSize: 3`
means to a `BufferGeometry`: "walk this flat array three numbers at a
time."

### Discard the Throwaway Example

This `groupBy3` function is discarded now — `BufferGeometry` (confirmed
next) does this grouping internally, without you ever writing the loop
yourself.

### Project Change

- **Reference Source:** your own `mesh_viewer.html`, the line
  `geometry.setAttribute('position', new THREE.Float32BufferAttribute(parsed.positions, 3));`.
- **Files affected:** create `src/step4_buffer_geometry.html`.
- **Change type:** add.
- **Location:** N/A — brand-new file.
- **Dependencies:** the Three.js library, loaded via CDN.

### The New Code

Type this into a new file, `src/step4_buffer_geometry.html`:

```html
<!DOCTYPE html>
<html>
<head>
<script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>
</head>
<body>
<script>
  const positions = [
    0, 0, 0,
    1, 0, 0,
    0, 1, 0
  ];

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));

  const attr = geometry.getAttribute('position');
  console.log(attr.count);
  console.log(attr.itemSize);
  console.log(attr.getX(1), attr.getY(1), attr.getZ(1));
</script>
</body>
</html>
```

### The Updated Project

This is the whole new file — nothing larger to return to yet:

```
 1  <!DOCTYPE html>
 2  <html>
 3  <head>
 4  <script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>
 5  </head>
 6  <body>
 7  <script>
 8    const positions = [
 9      0, 0, 0,
10      1, 0, 0,
11      0, 1, 0
12    ];
13
14    const geometry = new THREE.BufferGeometry();
15    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
16
17    const attr = geometry.getAttribute('position');
18    console.log(attr.count);
19    console.log(attr.itemSize);
20    console.log(attr.getX(1), attr.getY(1), attr.getZ(1));
21 </script>
22 </body>
23 </html>
```

### Mechanical Walkthrough

- **`const positions = [...]`** — nine flat numbers, the identical
  shape to this Concept Unit's own throwaway lab, and identical in
  spirit to your own parser's `positions` array (Lesson 1's Header
  already named it as the reference).
- **`new THREE.BufferGeometry()`** — constructing an empty geometry
  container (this lesson's own term).
- **`geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))`**
  — `new THREE.Float32BufferAttribute(positions, 3)` wraps the flat
  array with `itemSize: 3` (this lesson's own term); `.setAttribute('position', ...)`
  attaches it to the geometry under the name `'position'` — a string
  Three.js itself expects for standard vertex positions, not an
  arbitrary label.
- **`attr.count`** — the real attribute object's own `.count` — the
  number of *grouped* values (`3`, since 9 numbers ÷ `itemSize` 3 = 3
  points), not the raw array length.
- **`attr.itemSize`** — reading back the `3` passed at construction.
- **`attr.getX(1), attr.getY(1), attr.getZ(1)`** — `Float32BufferAttribute`'s
  own convenience methods for reading one grouped value's individual
  components by index — `getX(1)` reads the *second* point's `x`
  (index `1`, zero-based), doing internally exactly what this Concept
  Unit's own throwaway `groupBy3` did by hand.

### CS Lens

This is **structure-of-arrays** data layout — storing all `x`/`y`/`z`
values interleaved in one flat array (or, in more advanced setups,
in entirely separate arrays per component), rather than an
array-of-structures layout (a JavaScript array of `{x, y, z}` objects,
one per point). GPUs are built to process flat, tightly-packed numeric
buffers extremely fast; an array of individual objects, each with its
own memory layout and property lookups, is exactly what GPU-friendly
formats avoid.

Also recognized in: audio processing (interleaved stereo samples —
left, right, left, right — the identical flat-and-grouped shape);
database columnar storage engines, which sometimes deliberately choose
structure-of-arrays layouts for performance reasons close to this one;
any low-level graphics API (not just WebGL/Three.js) — OpenGL, Vulkan,
DirectX all expect vertex data in this same flat, tightly-packed shape.

### SE Lens

The principle is **matching your data's shape to what the consumer
(the GPU) actually needs**, even though it's less convenient to read or
write by hand than an array of `{x, y, z}` objects would be.

The alternative not chosen: Three.js *could* have offered an API taking
an array of `{x, y, z}` objects directly, converting to the flat format
internally. Some libraries do exactly this, trading a small performance
/ conversion cost for a friendlier API. Three.js's own `BufferGeometry`
API asks you to build the flat array yourself — more explicit, and, not
coincidentally, exactly the format your own OBJ parser already produces
naturally, since text files don't have JavaScript objects in them
either — a real reason this raw-array approach fits this particular use
case well, not just an arbitrary design choice.

### Commands Needed

None new.

### Run It — Yourself, in Your Own Browser

Open `src/step4_buffer_geometry.html` and check its console. You should
see:

```
3
3
1 0 0
```

`attr.count` is `3` (three points), `attr.itemSize` is `3` (confirmed
back exactly as passed in), and `attr.getX(1), attr.getY(1), attr.getZ(1)`
reads back `1 0 0` — the second point in the array, matching this
Concept Unit's own throwaway lab's second grouped value exactly.

### Connect

`BufferGeometry` can now hold real position data. Nothing yet describes
which points form which triangles — the next Concept Unit adds the
index buffer.

---

## Concept Unit: The Index Buffer — Reusing Vertices

### The Problem

A flat `position` array on its own doesn't say which points form a
triangle — three consecutive points could be assumed to form one
triangle, but that breaks down the moment two triangles share a corner:
storing that shared corner's `x, y, z` twice (once per triangle) wastes
space, and — more importantly for anything built on top of shared
vertex identity — gives you no way to say "these two triangles touch
at this exact point," since two duplicated copies of the same
coordinates are, as far as the raw array is concerned, just two
unrelated numbers that happen to match.

> **Before reading on, try this yourself:** a square is two triangles
> sharing one diagonal edge — meaning two of its four corners are each
> used by *both* triangles. If you had only 4 actual points stored (one
> per corner, no duplicates), what list of point-numbers, in order,
> would describe "triangle one, then triangle two," reusing shared
> corners by number rather than storing them again?

### Introduce the Concept in Isolation

```javascript
// Throwaway lab: reusing the same 4 points to build 2 triangles (a square), via indices
const positions = [
    0, 0, 0,   // point 0
    1, 0, 0,   // point 1
    1, 1, 0,   // point 2
    0, 1, 0,   // point 3
];
const indices = [0, 1, 2,  0, 2, 3];  // two triangles, sharing points 0 and 2

console.log("position numbers:", positions.length, "-> points:", positions.length / 3);
console.log("index count:", indices.length, "-> triangles:", indices.length / 3);

function pointAt(i) {
    return [positions[i * 3], positions[i * 3 + 1], positions[i * 3 + 2]];
}
console.log("triangle 1 points:", indices.slice(0, 3).map(pointAt));
console.log("triangle 2 points:", indices.slice(3, 6).map(pointAt));
```

Real output:

```
position numbers: 12 -> points: 4
index count: 6 -> triangles: 2
triangle 1 points: [ [ 0, 0, 0 ], [ 1, 0, 0 ], [ 1, 1, 0 ] ]
triangle 2 points: [ [ 0, 0, 0 ], [ 1, 1, 0 ], [ 0, 1, 0 ] ]
```

Only 4 real points are stored (`positions.length / 3` is `4`), yet 2
full triangles are described (`indices.length / 3` is `2`) — 6 total
triangle-corners, from only 4 stored points. `pointAt(0)` — point index
`0` — appears in *both* printed triangles, at position `[0, 0, 0]`
both times: real, direct proof the same stored point is being reused,
not duplicated, exactly answering this Concept Unit's own Socratic
prompt.

This is worth sitting with for a moment if you've built mesh code
before: it's the *opposite* choice from representing a mesh as a list
of self-contained triangles, each with its own three independent
corners. A representation like that never needs an index buffer at all
— but it also has no way to say "this corner and that corner are really
the same point," short of comparing coordinates after the fact. This
lesson's index-buffer approach makes shared identity a first-class,
structural fact from the start, rather than something recovered later
by checking whether two points merely happen to have equal coordinates.

### Discard the Throwaway Example

This scratch `pointAt`/lab code is discarded now — the real project
version, confirmed next, uses `BufferGeometry.setIndex` directly.

### Project Change

- **Reference Source:** your own `mesh_viewer.html`, the line
  `geometry.setIndex(parsed.indices);` — and the `f` lines your own OBJ
  parser reads, which are already exactly this: index references into
  an already-built position list, not repeated coordinates.
- **Files affected:** create `src/step5_indexed_geometry.html`.
- **Change type:** add.
- **Location:** N/A — brand-new file.
- **Dependencies:** `THREE.BufferGeometry`/`Float32BufferAttribute`
  (earlier in this lesson).

### The New Code

Type this into a new file, `src/step5_indexed_geometry.html`:

```html
<!DOCTYPE html>
<html>
<head>
<script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>
</head>
<body>
<script>
  const positions = [
    0, 0, 0,
    1, 0, 0,
    1, 1, 0,
    0, 1, 0
  ];
  const indices = [0, 1, 2, 0, 2, 3];

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geometry.setIndex(indices);

  console.log(geometry.getAttribute('position').count);
  console.log(geometry.getIndex().count);
  console.log(geometry.getIndex().count / 3);
</script>
</body>
</html>
```

### The Updated Project

This is the whole new file — nothing larger to return to yet:

```
 1  <!DOCTYPE html>
 2  <html>
 3  <head>
 4  <script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>
 5  </head>
 6  <body>
 7  <script>
 8    const positions = [
 9      0, 0, 0,
10      1, 0, 0,
11      1, 1, 0,
12      0, 1, 0
13    ];
14    const indices = [0, 1, 2, 0, 2, 3];
15
16    const geometry = new THREE.BufferGeometry();
17    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
18    geometry.setIndex(indices);
19
20    console.log(geometry.getAttribute('position').count);
21    console.log(geometry.getIndex().count);
22    console.log(geometry.getIndex().count / 3);
23 </script>
24 </body>
25 </html>
```

### Mechanical Walkthrough

- **`const indices = [0, 1, 2, 0, 2, 3];`** — the identical index list
  from this Concept Unit's own throwaway lab, unchanged.
- **`geometry.setIndex(indices);`** — attaching the index buffer (this
  lesson's own term) to the geometry — a plain array (or typed array)
  of whole numbers, each one a position into the `position` attribute
  already set above.
- **`geometry.getAttribute('position').count`** — still `4`, confirming
  only 4 real points are stored, exactly as in the throwaway lab.
- **`geometry.getIndex().count`** — `6`, the real length of the index
  array — `.getIndex()` returns a `BufferAttribute` too, the same kind
  of object `.getAttribute('position')` returns, just holding index
  values instead of coordinate values.
- **`geometry.getIndex().count / 3`** — `2`, the actual triangle count
  — every 3 consecutive index entries name one triangle's three
  corners, the identical grouping-by-3 idea this lesson's first
  Concept Unit already established for positions, now applied to
  indices instead.

### CS Lens

This is **indexed geometry** (also called **indexed drawing** in
graphics APIs generally) — separating "what points exist" from "how
they're connected into faces," so shared points are stored once and
referenced by number wherever they recur.

Also recognized in: graph data structures (a list of nodes, plus a
separate list of edges referencing nodes by index/ID, rather than each
edge embedding a full copy of both endpoints' data); relational
databases (a foreign key is exactly an index-buffer-style reference —
"this row relates to that row, by ID," rather than duplicating the
related row's data inline); every real-time 3D file format and GPU API
— OBJ's own `f` lines, exactly the ones your parser already reads, are
themselves an index buffer, in text form.

### SE Lens

The principle is **normalization** — storing each real, unique piece of
data exactly once, and referencing it by identity everywhere it's
needed, rather than duplicating it — the identical principle relational
database design calls by the same name, applied here to geometry
instead of database rows.

The alternative not chosen: skip the index buffer, and instead lay out
`position` as one independent triangle after another — 3 fresh points
per triangle, even where two triangles share a real corner, meaning a
shared corner's coordinates appear twice (or more) in the flat array.
This is a real, valid, simpler-to-generate format some tools use — no
index math required, and it's what an *unindexed* triangle soup looks
like. The cost, concretely: more memory for any mesh with real shared
structure (every shared corner duplicated once per triangle touching
it), and — the deeper cost — no structural way to know two duplicated
points are "the same" corner at all, without comparing their
coordinates after the fact and hoping floating-point rounding didn't
make two originally-identical corners compare as merely *close*, not
equal.

### Commands Needed

None new.

### Run It — Yourself, in Your Own Browser

Open `src/step5_indexed_geometry.html` and check its console. You
should see:

```
4
6
2
```

Four real stored points, six index entries, two triangles — exactly
matching this Concept Unit's own throwaway lab's real output.

### Connect

A `BufferGeometry` can now hold both positions and the index buffer
describing real triangles. It still isn't visible — nothing has been
added to a scene, and nothing has told Three.js what color or material
it should have. The final Concept Unit fixes both, and you'll see an
actual triangle rendered for the first time.

---

## Concept Unit: `THREE.Mesh` — Geometry Needs a Material to Be Visible

### The Problem

A `BufferGeometry`, however complete, is only data — Lesson 1 already
established that `Scene` and `Camera` are also just data/containers,
with the `Renderer` doing the only real work. A `BufferGeometry` can't
be added to a `Scene` directly at all; something has to combine it with
an appearance and turn it into a real, addable scene-graph object.

> **Before reading on, try this yourself:** Lesson 1 established that
> everything addable to a `Scene` is an `Object3D` — a `Camera` is one,
> with camera-specific extra data attached. If a "visible shape" needs
> to be an `Object3D` too, but also needs a `BufferGeometry` (the shape
> itself) and some notion of color/appearance, what would you guess a
> class combining exactly those two things, as one addable object,
> might be named?

### Introduce the Concept in Isolation

No new throwaway lab for this Concept Unit: both `BufferGeometry` and
the index buffer were already fully isolated and proven in this
lesson's own previous two Concept Units, and `Object3D`/inheritance
were already established in Lesson 1. What's new here is only the
combination — `BufferGeometry` plus a material, added to the `Scene`
and `Camera` pipeline Lesson 1 already built, and actually rendered.

### Discard the Throwaway Example

Not applicable to this Concept Unit, for the reason stated above.

### Project Change

- **Reference Source:** your own `mesh_viewer.html`'s `buildMesh`
  function — `const material = new THREE.MeshStandardMaterial({...}); mesh = new THREE.Mesh(geometry, material); scene.add(mesh);`
  — this Concept Unit uses `THREE.MeshBasicMaterial` instead (a flatter,
  simpler material — no lighting interaction), since real lighting and
  vertex colors are next lesson's own subject; the `Mesh`/`scene.add`
  shape itself is identical.
- **Files affected:** create `src/step6_first_triangle.html`.
- **Change type:** add.
- **Location:** N/A — brand-new file.
- **Dependencies:** everything from Lesson 1 (`Scene`, `Camera`,
  `Renderer`, the render loop) and this lesson's own `BufferGeometry`/
  index buffer.

### The New Code

Type this into a new file, `src/step6_first_triangle.html`:

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
  camera.position.set(0, 0, 3);

  const renderer = new THREE.WebGLRenderer();
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  const positions = [
    -0.8, -0.6, 0,
     0.8, -0.6, 0,
     0.0,  0.8, 0
  ];
  const indices = [0, 1, 2];

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geometry.setIndex(indices);

  const material = new THREE.MeshBasicMaterial({ color: 0x5ec98f });
  const mesh = new THREE.Mesh(geometry, material);
  scene.add(mesh);

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

This is the whole new file — nothing larger to return to yet:

```
 1  <!DOCTYPE html>
 2  <html>
 3  <head>
 4  <style>body { margin: 0; }</style>
 5  <script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>
 6  </head>
 7  <body>
 8  <script>
 9    const scene = new THREE.Scene();
10    scene.background = new THREE.Color(0x16181c);
11
12    const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
13    camera.position.set(0, 0, 3);
14
15    const renderer = new THREE.WebGLRenderer();
16    renderer.setSize(window.innerWidth, window.innerHeight);
17    document.body.appendChild(renderer.domElement);
18
19    const positions = [
20      -0.8, -0.6, 0,
21       0.8, -0.6, 0,
22       0.0,  0.8, 0
23    ];
24    const indices = [0, 1, 2];
25
26    const geometry = new THREE.BufferGeometry();
27    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
28    geometry.setIndex(indices);
29
30    const material = new THREE.MeshBasicMaterial({ color: 0x5ec98f });
31    const mesh = new THREE.Mesh(geometry, material);
32    scene.add(mesh);
33
34    function animate() {
35      requestAnimationFrame(animate);
36      renderer.render(scene, camera);
37    }
38    animate();
39 </script>
40 </body>
41 </html>
```

As a whole, this file combines every piece built so far — Lesson 1's
`Scene`/`Camera`/`Renderer`/render loop, and this lesson's own
`BufferGeometry`/index buffer — into the first fully real, rendered
result this curriculum has produced: an actual visible triangle.

### Mechanical Walkthrough

- **Lines 9-17** — unchanged from Lesson 1's own `step3_render_loop.html`,
  just a slightly different background color, and the camera moved
  closer (`z = 3` instead of `5`) since this scene's own triangle is
  small.
- **Lines 19-28** — this lesson's own `BufferGeometry`/index-buffer
  construction, now using three points sized and positioned to be
  clearly visible on screen (roughly `-0.8` to `0.8` on each axis,
  centered near the origin).
- **`const material = new THREE.MeshBasicMaterial({ color: 0x5ec98f });`**
  — constructing the simplest kind of `THREE.Material`: a single flat
  color, with no interaction with lights at all — deliberately, so this
  Concept Unit's own checkpoint doesn't yet need to introduce lighting.
- **`const mesh = new THREE.Mesh(geometry, material);`** — `THREE.Mesh`
  (this lesson's own term), combining the geometry and material built
  above into one real, addable `Object3D`.
- **`scene.add(mesh);`** — Lesson 1's own `Scene.add`, this time adding
  something with real, visible content — the first time this
  curriculum's render loop actually has something to draw.

### CS Lens

This is the same **composite pattern** Lesson 1's own CS Lens already
named for `Scene`, applied one more level down: `Mesh` composes a
`BufferGeometry` and a `Material` together, the same way `Scene`
composes whatever `Object3D`s are added to it — composition all the way
down, a recurring shape in how Three.js's own API is put together.

Also recognized in: nearly every real graphics/game engine's own
renderable-object concept (Unity's `MeshRenderer` component pairs a
mesh asset with a material asset the identical way; Unreal Engine's
`StaticMeshComponent` does too) — pairing "what shape" with "how it
looks" as two independent, swappable pieces is a near-universal pattern
in real-time 3D software, not a Three.js-specific quirk.

### SE Lens

The principle is **separating shape from appearance**, so either one
can change independently — the exact same `BufferGeometry` built in
this lesson could be given a completely different material (wireframe,
a different color, a textured material) with zero changes to the
geometry itself; conversely, the exact same material could be reused
across many different geometries.

The alternative not chosen: bake color and appearance directly into the
geometry data itself, with no separate material object at all — some
very simple, specialized rendering systems do this. The real cost: any
change in appearance (switching from flat color to lit shading, adding
transparency, changing to wireframe) would require rebuilding or
modifying the geometry data itself, rather than simply swapping in a
different, independent material object — a real design cost this
project's own upcoming `MeshStandardMaterial` switch (next lesson) will
demonstrate directly, changing only the material line and nothing about
the geometry at all.

### Commands Needed

None new.

### Run It — Yourself, in Your Own Browser

Open `src/step6_first_triangle.html`. You should see a green triangle,
roughly centered, against a dark charcoal background — the first real,
complete result this curriculum has produced: raw position numbers you
typed yourself, turned into an actual visible 3D shape, through every
piece built across both lessons so far.

### Connect

You now understand exactly how your own OBJ parser's `positions` and
`indices` arrays become a real, visible Three.js object —
`BufferGeometry` holds the raw data, an index buffer connects points
into triangles without duplicating shared ones, and `Mesh` pairs that
geometry with a material to make it addable and renderable. What's
still missing, deliberately deferred: real per-vertex color (this
triangle is one flat color, not the grey/green diff coloring your
actual tool needs) and any interaction with light. Both are next
lesson's subject.

---

## Connect the Pieces

One triangle, traced through every piece this lesson built: a flat
`positions` array (first Concept Unit) — nine numbers, no structure of
their own until `Float32BufferAttribute`'s `itemSize: 3` groups them
into three real points. An `indices` array (second Concept Unit) —
here just `[0, 1, 2]`, the simplest possible case (one triangle, no
actual sharing yet, though the mechanism is identical to the
four-point square that did share vertices) — names which three points
form the one triangle. `BufferGeometry` holds both; `THREE.MeshBasicMaterial`
(third Concept Unit) gives it a flat green appearance; `THREE.Mesh`
combines geometry and material into one real `Object3D`; `scene.add(mesh)`
places it in the scene graph Lesson 1 already built; and the render
loop, unchanged since Lesson 1, draws it, frame after frame, into the
canvas already attached to the page — a real, visible triangle, built
from nothing but two flat arrays of plain numbers.

---

## Try It Yourself

Type all three new HTML files into `src/` yourself (not copy-pasted),
and confirm all three `Run It` checkpoints. Then, once
`step6_first_triangle.html` shows its green triangle, try turning it
into a four-point square instead — reuse this lesson's own
`positions`/`indices` shape from `step5_indexed_geometry.html` (scaled
and centered so it's visible, the way `step6`'s own triangle was), and
confirm for yourself that a single shared-vertex index buffer really
does render as one connected shape, not two separate, disconnected
triangles.
