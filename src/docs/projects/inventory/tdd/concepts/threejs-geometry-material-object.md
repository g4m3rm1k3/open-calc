# Concept: Geometry + Material — Shape Separated From Appearance

**What you'll understand by the end:** why 3D drawable objects are built from two separate pieces — raw shape data, and a description of how that shape should look — rather than one combined object.

**Prerequisites:** `threejs-renderer-scene-camera.md`, `javascript-array-map.md`.

## Setup

A browser, plus Three.js:
```
npm install three
```

## The Problem

Two entirely different questions describe any drawable 3D thing: *where are its points, in space* (its shape), and *what does its surface look like* (its color, whether it reacts to light, how shiny it is). Combining both into a single object would mean that changing an object's appearance without changing its shape — or reusing the same shape with two different looks — requires duplicating the shape data unnecessarily.

## The Isolated Example

```typescript
import * as THREE from "three";

const points = [
    { x: 0, y: 0, z: 0 },
    { x: 10, y: 20, z: 0 },
    { x: 30, y: 20, z: 0 },
];

const vectors = points.map((p) => new THREE.Vector3(p.x, p.y, p.z));
const geometry = new THREE.BufferGeometry().setFromPoints(vectors);

const greenMaterial = new THREE.LineBasicMaterial({ color: 0x46d89f });
const redMaterial = new THREE.LineBasicMaterial({ color: 0xff0000 });

const greenLine = new THREE.Line(geometry, greenMaterial);
const redLine = new THREE.Line(geometry, redMaterial);

console.log(greenLine.geometry === redLine.geometry);
console.log(greenLine.material === redLine.material);
```

**Real output:**
```
true
false
```

**What this proves:** the exact same `geometry` object (the same underlying vertex data, computed once) was reused, unmodified, to build two `Line` objects with completely different appearances — proof that shape and appearance are genuinely independent, not just conceptually described that way.

## Mechanical Walkthrough

- `THREE.Vector3(x, y, z)` is Three.js's own point/vector representation — plain `{x, y, z}` objects (this project's own real point data, or any similar external data shape) must be converted into this type before geometry APIs will accept them, typically via `.map()` (see `javascript-array-map.md`).
- `new THREE.BufferGeometry().setFromPoints(vectors)` builds a **geometry**: Three.js's real, GPU-friendly representation of raw shape data — an ordered list of vertex positions, and nothing about color or appearance at all.
- A **material** (here, `THREE.LineBasicMaterial`) describes *how* a shape's surface (or, for a line, its stroke) should be rendered — color, whether it responds to scene lighting, transparency, and other appearance properties, and nothing about the actual vertex positions.
- `new THREE.Line(geometry, material)` (or `THREE.Mesh(geometry, material)` for solid shapes) combines exactly one geometry and exactly one material into a single object that can be added to a scene — the same geometry/material pairing pattern applies to every drawable Three.js object type, only the specific combining class (`Line`, `Mesh`, `Points`) differs by what kind of shape is being drawn.

## Execution Trace

One `geometry`, built once, reused by two separately-constructed `Line`
objects — traced against the real output above:

```
vectors = points.map(...) → 3 real THREE.Vector3 objects
geometry = new THREE.BufferGeometry().setFromPoints(vectors)
  → one real geometry object, built once, holding 3 vertex positions

greenMaterial = new THREE.LineBasicMaterial({ color: 0x46d89f })
redMaterial = new THREE.LineBasicMaterial({ color: 0xff0000 })
  → two separate, independent material objects

greenLine = new THREE.Line(geometry, greenMaterial)
  → combines the ONE geometry object with greenMaterial
redLine = new THREE.Line(geometry, redMaterial)
  → combines the SAME geometry object (not a copy) with redMaterial

greenLine.geometry === redLine.geometry
  → both reference the identical object created once above → true

greenLine.material === redLine.material
  → greenMaterial and redMaterial are two different objects → false
```

`geometry` is only ever constructed once in this whole trace — both
`Line` objects hold a reference to that same object, not a copy of it,
which is exactly why `===` reports `true` for geometry but `false` for
material.

## CS Lens

This is another concrete instance of **separation of concerns** (see `threejs-renderer-scene-camera.md`'s renderer/scene/camera split for the same principle at a different level) — shape data and appearance data are independent axes of variation, and keeping them as separate objects lets either vary without touching the other, and lets identical shape data be reused across multiple different-looking objects with zero duplication of the actual vertex data.

Also recognized in: nearly every modern 3D graphics API's own vertex-buffer/shader split (the same geometry/material distinction, closer to the GPU), and, more broadly, any design separating *data* from *presentation* — the same instinct behind a web page's HTML (structure/data) staying separate from its CSS (appearance).

## SE Lens

Building geometry once and reusing it across multiple materials (or vice versa — one material applied to many different shapes) avoids real, unnecessary duplicated computation: recomputing the same vertex positions twice purely to render them in two different colors would waste real work for no benefit. This also makes a codebase's intent clearer to a reader — a function that only ever touches geometry and never material (or vice versa) is visibly scoped to one concern.

## Connection

Builds on `threejs-renderer-scene-camera.md` and `javascript-array-map.md`. `threejs-lighting-basics.md`'s two light types only visibly affect materials that are built to react to lighting (`MeshStandardMaterial`, for example) — a material like `LineBasicMaterial` used here deliberately ignores scene lighting entirely, rendering as one flat, solid color regardless of any lights present.

## Try It Yourself

1. Build one geometry and three materials of different colors, and create three separate `Line` objects sharing that one geometry — add all three to a scene at slightly different positions (`.position.set(...)` on each `Line`) and confirm all three render with the same shape but different colors.
2. Modify the shared `geometry`'s underlying points (by calling `.setFromPoints()` again with a new point array on the same geometry object) and confirm both `greenLine` and `redLine` visually update — since they reference the *same* geometry object, not independent copies.
3. Swap `LineBasicMaterial` for `MeshBasicMaterial` and `THREE.Line` for `THREE.Mesh`, using a solid geometry like `THREE.BoxGeometry` instead of a point-based one, and confirm the identical geometry/material pairing pattern applies — the only real difference is which combining class matches which category of shape.
