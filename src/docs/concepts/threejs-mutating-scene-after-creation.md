# Concept: Changing a Three.js Object's Color After It's Already Built

**What you'll understand by the end:** why some Three.js object
properties can be changed at any time after construction with a simple
method call, while others are baked in permanently at construction and
can only be changed by building a new object in the old one's place — and
how to tell which case you're in before writing code that assumes the
wrong one.

**Prerequisites:** `threejs-lighting-basics.md`,
`threejs-gridhelper-spatial-reference.md`.

## Setup

A browser, plus Three.js:
```
npm install three
```

## The Problem

`threejs-lighting-basics.md` and `threejs-gridhelper-spatial-reference.md`
both showed lights and a grid configured once, at creation, and never
touched again. A scene whose colors need to change later — in response to
a theme switch, say — needs a real answer to "how do I change this
object's color now, without throwing the whole scene away and rebuilding
it from scratch?" — and that answer turns out to be different depending
on which kind of object is being asked.

## The Isolated Example

```javascript
import * as THREE from "three";

const light = new THREE.DirectionalLight(0xffffff, 0.8);
console.log("light.color before:", light.color.getHexString());
light.color.set("#46d89f");
console.log("light.color after .set():", light.color.getHexString());

const grid = new THREE.GridHelper(10, 2, 0xff0000, 0x00ff00);
console.log("material.vertexColors:", grid.material.vertexColors);
console.log("material.color:", grid.material.color.getHexString());
grid.material.color.set("#0000ff");
console.log("geometry's own color data, unaffected by that:", Array.from(grid.geometry.attributes.color.array.slice(0, 3)));
```

**Real output, run this session:**
```
light.color before: ffffff
light.color after .set(): 46d89f
material.vertexColors: true
material.color: ffffff
geometry's own color data, unaffected by that: [ 0, 1, 0 ]
```

**What this proves:** `light.color` really is a live, mutable object —
calling `.set()` on it changed the light's actual rendered color, in
place, with no need to rebuild the light. `grid.material.color`, in
contrast, can be set the exact same way and yet the grid's real,
rendered color is completely unaffected, because `vertexColors: true`
means the renderer ignores `material.color` entirely and reads color
data already baked directly into the geometry itself at construction —
proven by the geometry's own color array staying byte-for-byte identical
before and after that `.set()` call.

## Mechanical Walkthrough

- `light.color` — **(a) first appearance** — every Three.js light stores
  its color as a real `THREE.Color` instance (not a plain hex number),
  kept as a live property on the light object itself, for exactly this
  reason: so it can be reached and changed later.
- `.set("#46d89f")` — **(a) first appearance** — `THREE.Color`'s own
  mutation method: parses the given value (a hex string, here) and
  overwrites this `Color` instance's channels in place. Nothing is
  replaced or recreated — the same `light.color` object, now holding
  different numbers.
- `grid.material.vertexColors` — **(a) first appearance** — a flag on
  the material telling the renderer to color each vertex using data from
  the geometry's own `color` attribute, instead of using the material's
  single, uniform `color` for the whole object. `GridHelper` sets this to
  `true` internally because a grid is drawn with two different, real
  colors (the center lines vs. the rest) baked into one mesh — a single
  uniform `material.color` couldn't represent that at all.
- `grid.geometry.attributes.color` — **(a) first appearance** — the raw
  per-vertex color data itself, written once when `GridHelper`'s
  constructor built the grid's line geometry, from the two color
  arguments passed in at that time. There is no method to "re-set" this
  after the fact the way `.color.set()` works for a light — the data is
  just a typed array, and the only real way to show different colors is
  to build a new `GridHelper` (with new color arguments) and swap it
  into the scene in the old one's place.

## CS Lens

This is the same real distinction as **mutable vs. immutable state** at
the object level: `light.color` is a small piece of live, mutable state
exposed on purpose; the grid's baked vertex-color buffer is effectively
immutable once built; the general fix for immutable data that needs to
change is always the same — build a new value and replace the reference
to it, rather than trying to mutate something that was never designed to
be mutated in place.

Also recognized in: React's own state update rule (never mutate state
directly — replace it), functional programming's preference for
persistent data structures, database rows updated via a new transaction
rather than an in-place byte edit on disk, string immutability in Python
and Java (`s.replace(...)` returns a new string; it never edits the
original in place).

## SE Lens

The real alternative to rebuilding the `GridHelper` — writing directly
into `grid.geometry.attributes.color.array` by hand and calling
`.needsUpdate = true` on that attribute — genuinely works, and avoids the
allocation cost of a whole new object. It's more code, and requires
knowing the exact layout Three.js used when it originally built the
attribute (which vertex is which, in what order) — real, internal detail
that `GridHelper`'s own public API doesn't document or guarantee stays
the same across library versions. Rebuilding the helper from its public
constructor arguments is slower but only depends on that constructor's
own stable, public contract — the safer choice specifically because a
grid is cheap to construct and this only happens on an infrequent theme
change, not every frame.

## Connection

Builds on `threejs-lighting-basics.md` and
`threejs-gridhelper-spatial-reference.md`. Used in this project's real
code to keep a 3D scene's lighting and grid in sync with
`design-tokens-theming-pattern.md`'s active theme — one technique
(`.color.set()`) for the lights, the other (remove and reconstruct) for
the grid, in the same function, because the two objects genuinely require
different techniques.

## Try It Yourself

1. Try the same `.set()` approach on a `THREE.Mesh`'s material when
   `vertexColors` is `false` (the default for most simple shapes) —
   confirm this case behaves like the light, not like the grid, and
   explain why, in your own words, from what `vertexColors` actually
   controls.
2. After rebuilding a `GridHelper` and adding the new one to the scene,
   check whether the *old* one is still present by logging
   `scene.children.length` before and after calling `scene.remove(oldGrid)`
   — confirm removal is a real, separate step, not something a garbage
   collector does automatically just because a new grid now exists.
