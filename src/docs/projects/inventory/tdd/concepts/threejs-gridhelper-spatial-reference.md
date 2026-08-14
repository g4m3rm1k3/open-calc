# Concept: A Grid as a Spatial Reference Frame

**What you'll understand by the end:** why 3D scenes commonly include a visible grid, and how to build and correctly orient one using a library-provided helper.

**Prerequisites:** `threejs-renderer-scene-camera.md`, `radians-rotation-unit.md`.

## Setup

A browser, plus Three.js:
```
npm install three
```

## The Problem

Without any fixed, known reference in a scene, there is no way to visually judge scale or orientation — is an object 5 units away or 500? Is the camera looking down slightly, or nearly level? A single floating object gives no answer to either question on its own.

## The Isolated Example

```typescript
import * as THREE from "three";

const scene = new THREE.Scene();

const grid = new THREE.GridHelper(500, 50, 0x131c28, 0x131c28);
scene.add(grid);

console.log(grid.geometry.attributes.position.count / 2);
```

**Real output:**
```
102
```

**What this proves:** `GridHelper(500, 50, ...)` isn't a single flat plane texture — it built 102 real individual line segments (51 lines running one direction, 51 running the other, forming a 50-division grid) as actual scene geometry, confirmed by directly inspecting the vertex count it generated.

**Now, a real, visible-only difference — its default orientation:**
```typescript
const gridDefault = new THREE.GridHelper(500, 50);
scene.add(gridDefault);
// Real result: this grid lies flat on the X/Z plane (Three.js's own
// default "Y is up" convention).

const gridRotated = new THREE.GridHelper(500, 50);
gridRotated.rotation.x = Math.PI / 2;
scene.add(gridRotated);
// Real result: rotated a quarter-turn around the X axis, this grid now
// lies flat on the X/Y plane instead — "floor" for a scene using a
// Z-up convention.
```

## Mechanical Walkthrough

- `new THREE.GridHelper(size, divisions, colorCenterLine, colorGrid)` is a real, built-in Three.js utility object — not a fundamental primitive, but a convenience constructor that internally builds ordinary line geometry, the same category of object `threejs-geometry-material-object.md` describes being built by hand.
- `size` is the grid's total real-world width (in whatever units the rest of the scene uses); `divisions` is how many cells it's split into along each axis.
- Three.js's built-in helper objects (including `GridHelper`) are constructed flat on the X/Z plane by default, matching the library's own default assumption that Y is the "up" axis — a scene using a different up-axis convention (see the coordinate convention this same lesson names for its camera) must explicitly rotate the grid to match, using ordinary rotation properties exactly as any other object would be rotated (see `radians-rotation-unit.md`).
- A grid, once added to a scene, is an ordinary scene member like any other — it can be repositioned, hidden, or removed exactly like any mesh or line, despite being provided as a convenience rather than hand-built.

## Execution Trace

Two separately-constructed grids, same size/divisions, traced against
their real, different orientations:

- grid = new THREE.GridHelper(500, 50, 0x131c28, 0x131c28)
  → internally builds 51 lines one direction + 51 the other = 102
    real line segments, as real vertex geometry
  → grid.geometry.attributes.position.count → 204 (2 vertices per
    segment) → 204 / 2 = 102
  → print(102)
  → default orientation: flat on the X/Z plane (Y-up convention)

- gridDefault = new THREE.GridHelper(500, 50)  → same construction,
  no rotation applied → stays flat on X/Z, identical to `grid` above

- gridRotated = new THREE.GridHelper(500, 50)  → identical construction
- gridRotated.rotation.x = Math.PI / 2
  → this ONE property write reorients the whole object: what was
    flat on X/Z now lies flat on X/Y instead — the underlying
    geometry (which vertices, how many) is completely unchanged;
    only the object's own transform changed

`gridDefault` and `gridRotated` are built from the identical
constructor call — the only difference in this entire trace is the one
line setting `.rotation.x`, which is why the vertex *count* (102) would
be identical for both, even though where those vertices end up in the
scene is not.

## CS Lens

A grid is a **spatial reference frame** — a fixed, known structure against which everything else's position, scale, and orientation can be visually judged. This is the identical role a coordinate axis, a ruler, or graph paper plays in any 2D or 3D context, made concrete and visible rather than left implicit.

Also recognized in: CAD software's near-universal default background grid, level design tools in game engines (a visible grid snapping objects to regular intervals), and graph paper itself — the same underlying need (a fixed scale reference), addressed identically whether the medium is physical paper or a rendered 3D scene.

## SE Lens

Using a library-provided helper (`GridHelper`) instead of hand-building the same line geometry is the same "don't reimplement a solved, common need" judgment `threejs-orbitcontrols.md` names for camera interaction — a grid is common enough, and simple enough to get subtly wrong (off-by-one division counts, inconsistent line spacing), that most 3D libraries ship one as a built-in debugging/reference utility rather than expecting every project to build its own.

## Connection

Builds on `threejs-renderer-scene-camera.md` (a grid is just another scene member, added the same way as any other object) and `radians-rotation-unit.md` (correctly orienting it to match a scene's chosen up-axis convention requires exactly the same rotation math any other rotated object would use).

## Try It Yourself

1. Change `divisions` from `50` to `10` while keeping `size` at `500` and observe the grid cells become visibly larger — reason about the real tradeoff between a fine grid (precise but visually busy) and a coarse one (clean but less precise) for judging scale.
2. Pass two different colors for `colorCenterLine` and `colorGrid` (e.g. `0xff0000` and `0x131c28`) and observe the grid's center lines render distinctly from the rest — useful for making the origin immediately visually identifiable.
3. Rotate a grid around the Y axis instead of X (`grid.rotation.y = Math.PI / 2`) and observe it now stands vertically, like a wall, rather than lying flat — confirming rotation is applied per-axis independently, and reasoning about what real scene would want a vertical reference grid instead of a horizontal one.
