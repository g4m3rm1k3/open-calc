# Lesson 3: Vertex Colors and Materials

**What you will build:** a second attribute — `color` — on the same
`BufferGeometry` shape Lesson 2 already built, and the real material
your own `mesh_viewer.html` actually uses, `MeshStandardMaterial`,
which needs one thing `MeshBasicMaterial` never asked for: computed
surface normals. By the end, you'll understand exactly why your
existing tool calls `geometry.computeVertexNormals()` before building
its material, not just that it does.

**What you need to know first:** Lesson 1 (`Scene`/`Camera`/`Renderer`,
the render loop) and Lesson 2 in full (`BufferGeometry`,
`Float32BufferAttribute`, `itemSize`, the index buffer, `THREE.Mesh`).

**Terms used in this lesson:**
- **unlit material** — a material that paints exactly the color it's
  given, with no calculation involving light at all. `THREE.MeshBasicMaterial`
  (Lesson 2) is unlit — a triangle rendered with it looks identically
  bright no matter where a light is placed, or whether one exists in
  the scene at all.
- **lit material** — a material whose final on-screen color depends on
  both its own base color *and* the lights in the scene — the surface
  appears brighter where it faces a light more directly, darker where
  it faces away. `THREE.MeshStandardMaterial` is lit.
- **surface normal** — a direction pointing straight out of a surface,
  perpendicular to it. A lit material needs to know this for every
  point it's shading, because the core lighting calculation this
  lesson's own throwaway lab demonstrates directly depends on the angle
  between a surface's own facing direction and the direction light is
  coming from — without a normal, that angle is undefined, and a lit
  material has nothing to calculate with.
- **Lambertian reflectance** — the specific, simple lighting model this
  lesson's own lab computes: a surface's brightness from a given light
  is proportional to the dot product of its normal and the direction
  toward that light, clamped to never go below zero (a surface facing
  fully away from a light gets no light *from* it, never "negative"
  light). It's the foundational model most real-time lighting builds on
  top of, including the more sophisticated model `MeshStandardMaterial`
  actually uses internally.
- **`geometry.computeVertexNormals()`** — a `BufferGeometry` method
  that calculates a `normal` attribute automatically, from the geometry's
  own existing `position` and index data — by computing each triangle's
  own flat facing direction, then averaging every triangle's
  contribution at each shared vertex into one smoothed direction per
  vertex, the identical general idea a normal calculation needs
  regardless of which language or library computes it.
- **`THREE.AmbientLight`** / **`THREE.DirectionalLight`** — two of
  Three.js's own light types. An `AmbientLight` adds a flat amount of
  brightness to everything in the scene equally, regardless of
  direction or surface facing — a rough stand-in for indirect,
  bounced light that would otherwise leave unlit surfaces pure black. A
  `DirectionalLight` shines uniformly from one direction, as if from an
  infinitely distant source (like real sunlight) — the light this
  lesson's own Lambertian lab computes brightness against.

**Objects and methods used:**

- **the `color` attribute**
  - *What it is:* a second `Float32BufferAttribute` (Lesson 2),
    attached under the name `'color'` instead of `'position'`, giving
    every vertex an RGB color instead of (or alongside) a position.
  - *Implementation:* `geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3))`
    — structurally identical to the `position` attribute from Lesson 2,
    `itemSize: 3` for the same reason (three numbers per vertex — here
    red/green/blue instead of x/y/z).
  - *Its use:* your own OBJ parser's `colors` array — the `r g b`
    values your `save_vertex_colored_obj` writer encodes per vertex —
    becomes exactly this attribute.
  - *Type:* the same `Float32BufferAttribute` class from Lesson 2, used
    a second time under a different name.
  - *Responsibility:* to hold one RGB triple per vertex, in the exact
    same vertex order as the `position` attribute — this parallel
    ordering (this lesson's own point) is what lets Three.js know which
    color belongs to which position.
  - *Depends on:* nothing beyond the same `Float32BufferAttribute`
    mechanism Lesson 2 already built.
  - *Connects to:* only actually used by a material constructed with
    `vertexColors: true` (this lesson's own term) — attaching the
    attribute alone does nothing visible unless the material is told to
    read it.
  - *Shape:* `BufferGeometry`'s own layer, alongside `position` and the
    index buffer — a geometry can hold several named attributes at
    once, all describing the same underlying vertices from different
    angles.

- **`THREE.MeshStandardMaterial`**
  - *What it is:* a lit material (this lesson's own term) implementing
    a physically-inspired lighting model — the material your own
    `mesh_viewer.html` actually uses.
  - *Implementation:* `new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.85, ... })`.
  - *Its use:* the real material your existing tool builds, so the
    rendered mesh visually reads as a real, lit 3D object rather than a
    flat, shadeless shape.
  - *Type:* a `THREE.Material` subclass, like `MeshBasicMaterial`
    (Lesson 2), but implementing real lighting response instead of
    ignoring lights entirely.
  - *Responsibility:* to compute, for every point on a surface, a final
    color based on that point's own base color (from `vertexColors` or
    a fixed `color`), the scene's lights, and — critically — that
    point's surface normal, without which the lighting calculation has
    no angle to work with at all.
  - *Depends on:* a `normal` attribute existing on the geometry it's
    applied to, and at least one light in the scene to produce any
    visible brightness variation at all.
  - *Connects to:* reads `geometry`'s `normal` attribute (built by
    `computeVertexNormals`, later in this lesson) and every light
    object added to the `Scene`.
  - *Shape:* `Mesh`'s own appearance half (Lesson 2), a more complex
    sibling of `MeshBasicMaterial` with a real dependency
    (`MeshBasicMaterial` didn't need one) on geometry data beyond
    position/color: normals.

---

## Concept Unit: A Second Attribute — Per-Vertex Color

### The Problem

Lesson 2's triangle was one flat color, set on the *material*, not the
geometry — every point on its surface was identical. Your own diff
tool needs the *opposite*: each vertex individually colored grey or
green, with the GPU blending between them smoothly across a triangle's
face. Nothing built so far attaches more than one attribute to a single
`BufferGeometry`.

> **Before reading on, try this yourself:** Lesson 2's `position`
> attribute is a flat array, grouped by `itemSize: 3`, one group per
> vertex, in order. If a *second* flat array, also grouped by 3, held
> an RGB color for each vertex — in the exact same order as `position`
> — what would vertex `1`'s color be, if you already know how to find
> vertex `1`'s position in the first array?

### Introduce the Concept in Isolation

```javascript
// Throwaway lab: two flat arrays, grouped in parallel by the same itemSize
const positions = [
    0, 0, 0,
    1, 0, 0,
    0, 1, 0
];
const colors = [
    1, 0, 0,   // vertex 0: red
    0, 1, 0,   // vertex 1: green
    0, 0, 1    // vertex 2: blue
];

function groupBy3(flat) {
    const groups = [];
    for (let i = 0; i < flat.length; i += 3) {
        groups.push([flat[i], flat[i + 1], flat[i + 2]]);
    }
    return groups;
}

const points = groupBy3(positions);
const cols = groupBy3(colors);

for (let i = 0; i < points.length; i++) {
    console.log("vertex", i, "at", points[i], "colored", cols[i]);
}
```

Real output:

```
vertex 0 at [ 0, 0, 0 ] colored [ 1, 0, 0 ]
vertex 1 at [ 1, 0, 0 ] colored [ 0, 1, 0 ]
vertex 2 at [ 0, 1, 0 ] colored [ 0, 0, 1 ]
```

The identical `groupBy3` function from Lesson 2, applied to *two*
parallel arrays — `positions[i]` and `colors[i]` describe the same
vertex `i`, purely by both arrays sharing the same grouping and the
same order, with nothing else tying them together. Vertex `1` is
correctly reported at `(1, 0, 0)`, colored green — directly answering
this Concept Unit's own Socratic prompt.

### Discard the Throwaway Example

This scratch `groupBy3` lab is discarded now — the real project
version, confirmed next, uses `BufferGeometry.setAttribute('color', ...)`
directly.

### Project Change

- **Reference Source:** your own `mesh_viewer.html`'s `buildMesh`
  function: `geometry.setAttribute('color', new THREE.Float32BufferAttribute(parsed.colors, 3));`.
- **Files affected:** create `src/step7_vertex_colors.html`.
- **Change type:** add.
- **Location:** N/A — brand-new file.
- **Dependencies:** `BufferGeometry`/`Float32BufferAttribute`/`Mesh`
  (Lesson 2).

### The New Code

Type this into a new file, `src/step7_vertex_colors.html`:

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
  const colors = [
    1, 0, 0,
    0, 1, 0,
    0, 0, 1
  ];
  const indices = [0, 1, 2];

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
  geometry.setIndex(indices);

  const material = new THREE.MeshBasicMaterial({ vertexColors: true });
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

New/changed lines relative to Lesson 2's own `step6_first_triangle.html`,
marked:

```
    const colors = [                                                     # ← new
      1, 0, 0,                                                           # ← new
      0, 1, 0,                                                           # ← new
      0, 0, 1                                                            # ← new
    ];                                                                   # ← new
    const indices = [0, 1, 2];

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));         # ← new
    geometry.setIndex(indices);

    const material = new THREE.MeshBasicMaterial({ vertexColors: true });                # ← changed (was: { color: 0x5ec98f })
```

As a whole, this checkpoint takes Lesson 2's own triangle and gives each
of its three corners an independent color, with `vertexColors: true`
(this lesson's own term) telling the material to actually read the
`color` attribute rather than ignore it.

### Mechanical Walkthrough

- **`const colors = [1, 0, 0, 0, 1, 0, 0, 0, 1];`** — the identical
  three colors from this Concept Unit's own throwaway lab: pure red,
  green, blue, one triple per vertex, in the same order as `positions`.
- **`geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));`**
  — the same `Float32BufferAttribute` construction from Lesson 2,
  reused under the name `'color'` — a second, independent attribute on
  the same geometry object.
- **`new THREE.MeshBasicMaterial({ vertexColors: true })`** — the same
  material class from Lesson 2, this time constructed with
  `vertexColors: true` (this lesson's own term) instead of a fixed
  `color` — telling the material "read the `color` attribute per
  vertex, rather than painting everything one uniform color."

### CS Lens

This is **vertex attribute interpolation** — the GPU doesn't just use
each vertex's own color at that exact point; for every pixel *between*
three vertices, it blends their values proportionally to how close that
pixel is to each one (the same barycentric-style blending idea behind
"a point inside a triangle is some weighted mix of its three corners").
This is why a triangle with three different vertex colors doesn't
render as three flat-colored wedges — it renders as a smooth gradient.

Also recognized in: texture coordinate interpolation (the same
mechanism, applied to UV coordinates instead of colors, is what lets a
single texture image stretch smoothly across a triangle); any
GPU-rendered gradient or smooth-shaded surface; CSS `linear-gradient`
and `radial-gradient` (a different rendering pipeline entirely, but
conceptually the same "blend between defined points" idea).

### SE Lens

The principle is **reusing one mechanism (attributes) for structurally
different data** — `BufferGeometry` doesn't have a special, separate
system for "color data" versus "position data"; both are just named
flat arrays with an item size, and any consumer (a material) decides
what a given attribute name *means*.

The alternative not chosen: a `BufferGeometry` API with dedicated,
built-in `setColors(...)`/`setPositions(...)` methods, each with its own
special-cased internal storage, rather than one generic
`setAttribute(name, attribute)` mechanism used for everything. The
generic approach costs a small amount of clarity (`'color'` is just a
string, not a dedicated method — nothing stops you from misspelling it)
but pays for itself the moment a use case needs data Three.js's own
authors never anticipated (a custom per-vertex value for a custom
shader, for instance) — the same generic mechanism handles it with no
API changes needed at all.

### Commands Needed

None new.

### Run It — Yourself, in Your Own Browser

Open `src/step7_vertex_colors.html`. You should see the same triangle
shape from Lesson 2, now showing a smooth red-green-blue gradient
across its face — each corner solidly the color you assigned it, with
the interior blending continuously between all three, confirming this
Concept Unit's own CS Lens directly: the color at any point inside the
triangle is a real blend, not a flat pick from the nearest corner.

### Connect

Vertex colors work — but only because `MeshBasicMaterial` was told to
read them directly, with zero lighting involved. Your actual tool uses
`MeshStandardMaterial` instead, which shades based on light. The next
Concept Unit explains why that material needs something
`MeshBasicMaterial` never asked for.

---

## Concept Unit: Unlit vs. Lit — Why Some Materials Need Normals

### The Problem

`MeshBasicMaterial` (Lesson 2, and this lesson's first Concept Unit)
paints exactly the color it's given — full stop. `MeshStandardMaterial`,
the material your own tool actually uses, doesn't work that way: it
computes how *bright* a surface should appear based on the scene's own
lights and the angle that surface faces relative to them. Nothing built
so far in this curriculum has touched what "the angle a surface faces"
even means computationally, or why a material would need it.

> **Before reading on, try this yourself:** imagine a flat card, lit by
> a flashlight. Held facing the flashlight directly, it looks bright.
> Tilted more and more away, it looks dimmer, until — facing directly
> away — it gets none of that light at all. If "facing the light
> directly" and "facing directly away" are the two extremes, and a
> **surface normal** (this lesson's own term — a direction pointing
> straight out of the surface) together with the direction toward the
> light are both just directions (vectors), what single number,
> computed from those two directions, would naturally be largest when
> they point the same way, zero when they're perpendicular, and
> negative when they point opposite ways?

### Introduce the Concept in Isolation

```javascript
// Throwaway lab: how much a surface should brighten, based on the angle to a light
function dot(a, b) {
    return a.x * b.x + a.y * b.y + a.z * b.z;
}

function brightness(normal, lightDir) {
    return Math.max(0, dot(normal, lightDir));
}

const lightDir = { x: 0, y: 0, z: 1 };  // light shining straight at the viewer

console.log(brightness({ x: 0, y: 0, z: 1 }, lightDir));   // facing the light directly
console.log(brightness({ x: 1, y: 0, z: 0 }, lightDir));   // facing sideways, perpendicular
console.log(brightness({ x: 0, y: 0, z: -1 }, lightDir));  // facing away from the light
```

Real output:

```
1
0
0
```

A surface whose normal points directly at the light (`z: 1`, matching
`lightDir` exactly) gets full brightness, `1` — the dot product of two
identical unit directions is always `1`. A surface facing sideways,
perpendicular to the light, gets exactly `0` — the dot product of two
perpendicular directions is always `0`, directly answering this Concept
Unit's own Socratic prompt. A surface facing directly *away* from the
light would mathematically produce `-1` (the dot product of two
opposite directions), but `Math.max(0, ...)` clamps it to `0` instead —
real light can't subtract brightness from a surface it isn't even
reaching. This is **Lambertian reflectance** (this lesson's own term),
and it's the foundational calculation `MeshStandardMaterial` performs
internally (in a more refined form) for every lit pixel it draws.

### Discard the Throwaway Example

This `dot`/`brightness` lab is discarded now — `MeshStandardMaterial`
(confirmed in this lesson's final Concept Unit) performs this same
calculation internally, on the GPU, for every pixel, without you ever
calling `brightness()` yourself.

### Project Change

- **Reference Source:** your own `mesh_viewer.html`'s
  `new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.85, metalness: 0.0, side: THREE.DoubleSide })`
  — and, more specifically, the general Lambertian/physically-based
  lighting model that material implements internally. This is a real,
  well-established computer graphics technique, not something specific
  to Three.js — stated here from established knowledge, the same
  honesty standard your Python curriculum used for its own established
  algorithms.
- **Files affected:** none yet — this Concept Unit's own idea is
  conceptual, proven only in the throwaway lab; the next Concept Unit
  is where it becomes a real, rendered checkpoint.
- **Change type:** N/A for this Concept Unit.
- **Location:** N/A.
- **Dependencies:** N/A.

### The New Code

N/A for this Concept Unit — the lighting math itself is proven in the
throwaway lab above; the next Concept Unit is where a real geometry
actually gets normals and gets lit for real.

### The Updated Project

N/A for this Concept Unit, for the same reason.

### Mechanical Walkthrough

- **`function dot(a, b) { return a.x * b.x + a.y * b.y + a.z * b.z; }`**
  — the dot product of two 3D directions, computed directly from their
  components — the same operation underlying this whole calculation,
  regardless of what language or library performs it.
- **`function brightness(normal, lightDir) { return Math.max(0, dot(normal, lightDir)); }`**
  — `dot(normal, lightDir)` computes the raw alignment between the two
  directions; `Math.max(0, ...)` (already-familiar JavaScript) clamps
  any negative result up to `0`, implementing the "can't have negative
  light" rule directly answered in this Concept Unit's own real output.
- **`const lightDir = { x: 0, y: 0, z: 1 };`** and the three
  `brightness(...)` calls — three specific, hand-chosen test cases
  (directly facing, perpendicular, directly away), covering the three
  meaningfully different regions of this formula's own behavior.

### CS Lens

This is the **Lambertian reflectance model** (this lesson's own term,
named directly here), one of the oldest and most foundational lighting
models in all of computer graphics — dating to Johann Heinrich Lambert's
18th-century work on how matte (non-shiny) surfaces reflect light, long
before computers existed to calculate it.

Also recognized in: essentially every 3D rendering system ever built,
in some form — video games, CAD software, film visual effects, all
build on this same core dot-product idea, even when using far more
sophisticated models on top of it (`MeshStandardMaterial`'s own
"physically based rendering" approach adds real refinements — roughness,
metalness, specular highlights — but the basic normal-versus-light-direction
relationship this lab computes sits underneath all of them); photography
and cinematography (photographers intuitively use this exact
relationship — "the angle of light matters more than raw brightness" —
without necessarily knowing the underlying dot-product math).

### SE Lens

The principle is **only paying for what you need** — `MeshBasicMaterial`
exists precisely because not every use case needs real lighting (a
flat-colored UI element in a 3D scene, a debug visualization, or —
this curriculum's own earlier checkpoints — a first proof that a
pipeline works at all); computing Lambertian lighting for something
that will always look the same regardless of light would be wasted GPU
work.

The alternative not chosen: give every material lighting support,
always on, with no unlit option at all. That would remove the need to
choose between materials, but would force every single draw call to pay
the (real, if today extremely small) cost of a lighting calculation, and
would remove the genuinely useful "ignore lighting entirely, always
show this exact color" behavior `MeshBasicMaterial` provides on
purpose — real use cases (outline rendering, certain debug overlays,
UI elements meant to always read the same regardless of scene lighting)
actually want that.

### Commands Needed

None — this Concept Unit's code is throwaway-lab-only.

### Run It

Already shown above — the throwaway lab is this Concept Unit's own
complete execution.

### Connect

The math behind lit materials is now understood, verified with real
numbers on three clear test cases. The final Concept Unit applies it
for real: adding actual lights to the scene, computing real surface
normals, and switching to `MeshStandardMaterial` — the material your
own tool has been using the whole time.

---

## Concept Unit: Computing Normals and Adding Light

### The Problem

`MeshStandardMaterial`'s own lighting calculation (previous Concept
Unit) needs a surface normal for every point it shades — and nothing
built so far in this lesson has given any geometry a `normal` attribute
at all. `Float32BufferAttribute` and `setAttribute` (Lesson 2, and
this lesson's own first Concept Unit) could, in principle, be used to
set normals by hand, the same way `position`/`color` were — but for any
real mesh, that would mean computing a facing direction for every
vertex yourself, by hand, for every single mesh you ever load.

> **Before reading on, try this yourself:** if a normal needs to point
> "straight out of the surface," and a flat triangle has an obvious,
> single facing direction determined entirely by its three corners' own
> positions, what would you guess `computeVertexNormals()` (this
> lesson's own term) actually does internally, given only a geometry's
> existing `position` and index data and nothing else — no separate
> normal data supplied by you at all?

### Introduce the Concept in Isolation

No new throwaway lab for this Concept Unit: the actual normal-from-
triangle-edges computation is a real geometric algorithm (computing two
edge directions from a triangle's three corners and combining them into
a perpendicular direction) that would need its own from-scratch
derivation to isolate properly — exactly the kind of thing this
curriculum's own companion track already builds by hand, in a different
language, for a different reason. Rather than re-deriving that same
geometry here from first principles, this Concept Unit trusts
`computeVertexNormals()` as a real, well-established library operation
(the same honesty standard already used for the Lambertian model above)
and confirms its *result*, directly, in the browser checkpoint below.

### Discard the Throwaway Example

Not applicable to this Concept Unit, for the reason stated above.

### Project Change

- **Reference Source:** your own `mesh_viewer.html`'s `buildMesh`
  function, in full: the `color` attribute, `geometry.computeVertexNormals();`,
  and `new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.85, metalness: 0.0, side: THREE.DoubleSide })`.
- **Files affected:** create `src/step8_no_normals.html` (deliberately
  broken, to observe what happens) and `src/step9_shaded_colors.html`
  (the real, working version).
- **Change type:** add.
- **Location:** N/A — brand-new files.
- **Dependencies:** everything built so far in this lesson, plus
  `THREE.AmbientLight`/`THREE.DirectionalLight` (this lesson's own
  Header terms).

### The New Code

First, type this into `src/step8_no_normals.html` — the same triangle,
switched to `MeshStandardMaterial` with real lights added, but
*deliberately* skipping `computeVertexNormals()`:

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

  const ambient = new THREE.AmbientLight(0xffffff, 0.4);
  scene.add(ambient);
  const light = new THREE.DirectionalLight(0xffffff, 1.0);
  light.position.set(0, 0, 1);
  scene.add(light);

  const positions = [-0.8, -0.6, 0,  0.8, -0.6, 0,  0.0, 0.8, 0];
  const colors = [1, 0, 0,  0, 1, 0,  0, 0, 1];
  const indices = [0, 1, 2];

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
  geometry.setIndex(indices);
  // deliberately NOT calling geometry.computeVertexNormals() here

  const material = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.85 });
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

Then, type the fixed version into `src/step9_shaded_colors.html` —
identical, except for one added line:

```html
  geometry.setIndex(indices);
  geometry.computeVertexNormals();

  const material = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.85 });
  const mesh = new THREE.Mesh(geometry, material);
  scene.add(mesh);

  console.log(geometry.getAttribute('normal').getX(0),
              geometry.getAttribute('normal').getY(0),
              geometry.getAttribute('normal').getZ(0));
```

(everything else in the file identical to `step8_no_normals.html`,
including the ambient/directional light setup above it).

### The Updated Project

`src/step9_shaded_colors.html` in full, new/changed lines relative to
`step8_no_normals.html` marked:

```
    geometry.setIndex(indices);
    geometry.computeVertexNormals();                                     # ← new

    const material = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.85 });
    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    console.log(geometry.getAttribute('normal').getX(0),                # ← new
                geometry.getAttribute('normal').getY(0),                 # ← new
                geometry.getAttribute('normal').getZ(0));                # ← new
```

As a whole, this checkpoint takes this lesson's own vertex-colored
triangle, adds it to a scene with real lights, computes real normals
for it, and renders it with the actual material class your own tool
uses.

### Mechanical Walkthrough

- **`const ambient = new THREE.AmbientLight(0xffffff, 0.4);`** —
  `THREE.AmbientLight` (this lesson's own term), constructed with a
  color (white) and an intensity (`0.4` — moderate, not full); added to
  the scene the same way any `Object3D` is (Lesson 1).
- **`const light = new THREE.DirectionalLight(0xffffff, 1.0); light.position.set(0, 0, 1);`**
  — `THREE.DirectionalLight` (this lesson's own term); its `.position`
  (inherited from `Object3D`, Lesson 1) sets the direction it shines
  *from* — a directional light's actual scene position doesn't matter,
  only the direction from that position toward the origin, since it's
  meant to model an infinitely distant source.
- **`geometry.computeVertexNormals();`** — the one added line
  separating the "broken" and "fixed" checkpoints — calling this
  lesson's own term, computing a real `normal` attribute from the
  geometry's existing `position` and index data.
- **`geometry.getAttribute('normal').getX(0), ...`** — the same
  `Float32BufferAttribute` reading pattern from Lesson 2's own
  `attr.getX(1)`, this time reading the computed normal at vertex `0`
  directly, so you can see the actual numbers `computeVertexNormals()`
  produced, not just the rendered result.

### CS Lens

This is **derived data** — `normal` isn't information you supplied;
it's computed entirely from data that already existed (`position` plus
the index buffer), the same category of idea as a database "computed
column" or a spreadsheet formula cell: a value that stays correct
automatically as long as it's recalculated whenever its inputs change,
rather than being manually maintained and risking drifting out of sync.

Also recognized in: any build system that regenerates derived files
from source files automatically, rather than requiring the derived
files to be hand-edited to match; CAD software recalculating a part's
mass or center of gravity from its geometry, rather than storing those
as separately-editable fields; every mesh-processing pipeline that
computes normals as a standard step after loading raw geometry, in
essentially any 3D software, for exactly this same reason — geometry
almost always arrives with positions and connectivity, rarely with
correct normals already attached.

### SE Lens

The principle is **making a real dependency explicit and impossible to
silently skip incorrectly** — well, in principle: this Concept Unit's
"broken" checkpoint is included specifically to test that principle
honestly, not just assert it. What actually happens when
`MeshStandardMaterial` is applied to a geometry with no `normal`
attribute is a genuine, real question this lesson can't answer for you
without executing it — I don't have a browser here. Open both
`step8_no_normals.html` and `step9_shaded_colors.html` side by side and
compare: does the triangle in `step8` render solid black, unlit-looking,
visually broken in some other way, or does something about Three.js's
own defaults compensate for the missing attribute? Whatever you
observe is the real, honest answer — worth noting down, since it's a
genuine data point about how forgiving (or not) this specific material
is about a missing dependency, not something asserted here without
having actually seen it.

### Commands Needed

None new.

### Run It — Yourself, in Your Own Browser

Open `src/step9_shaded_colors.html` (the fixed version) first. You
should see the same red-green-blue triangle from this lesson's first
Concept Unit, now visibly shaded — noticeably less uniformly bright
across its face than the unlit `MeshBasicMaterial` version, since real
directional light is now interacting with (approximately, given the
flat triangle's simple geometry) its surface. The console should print
three numbers — the computed normal's `x`, `y`, `z` at vertex `0` — and
for this flat, forward-facing triangle (all three corners at `z = 0`),
you should be able to predict, before even looking, roughly which axis
that normal should point along, given every point on this triangle
lies in the same flat plane.

Then open `src/step8_no_normals.html` (the deliberately broken version)
and compare — see this Concept Unit's own SE Lens above for what to
actually look for and think about.

### Connect

You now understand every piece your own `mesh_viewer.html` uses to
build its rendered mesh: `BufferGeometry` with `position`/`color`
attributes and an index buffer (Lesson 2 and this lesson's first
Concept Unit), and `MeshStandardMaterial` with computed normals and
real lights (this lesson's final two Concept Units) — nothing left
in that file's `buildMesh` function is unfamiliar API surface anymore.
The next phase of this curriculum turns to the camera itself: what a
"perspective projection" actually does, and — the whole reason this
curriculum exists — how the orbit camera in your existing tool actually
works, and where its own real limitations come from.

---

## Connect the Pieces

One triangle, traced through every Concept Unit in this lesson: a
`color` attribute (first Concept Unit), parallel to `position` in
exactly the shape this lesson's own throwaway lab proved, gives each of
the three corners an independent RGB value — rendered as a smooth
gradient once `vertexColors: true` tells a material to actually read
it. Understanding *why* a different material — `MeshStandardMaterial`
— needs more than that required this lesson's second Concept Unit's own
real, executed Lambertian math: a surface's brightness depends on the
dot product between its normal and the light's direction, clamped to
never go negative. The final Concept Unit supplied that missing
ingredient for real, via `computeVertexNormals()` — derived directly
from the same `position`/index data already present, needing nothing
new from you — and added actual `AmbientLight`/`DirectionalLight`
objects so that calculation would have real light to work with,
producing, for the first time in this curriculum, a triangle that's
both colored *and* genuinely lit.

---

## Try It Yourself

Type all three new HTML files into `src/` yourself (not copy-pasted).
Confirm `step9_shaded_colors.html` renders a shaded, colored triangle,
and note what you actually observe comparing it against
`step8_no_normals.html`. Then, once that's done, try moving the
directional light to shine from a different direction (say,
`light.position.set(1, 1, 1)` instead of `(0, 0, 1)`) and reload
`step9_shaded_colors.html` — watch how the shading across the triangle's
face changes, and connect what you see back to this lesson's own
`brightness(normal, lightDir)` formula: you're watching that exact dot
product change in real time, as the angle between a fixed normal and a
now-different light direction changes.
