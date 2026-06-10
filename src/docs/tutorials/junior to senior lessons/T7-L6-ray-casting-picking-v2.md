# Junior to Senior — T7·L6 — Ray Casting and Picking

**Prerequisites:** T7·L5 (Quaternions). You have Vec3, Mat4, and Quaternion.
This lesson builds ray casting — converting a 2D mouse click into a 3D position —
by explaining WHY the math works, not just showing the formula.

**What this lab adds:**
- What a ray is and how `P(t) = origin + t * direction` traces every point on it
- WHY the screen-to-ray algorithm works — unprojecting through the camera transforms
- The ray-plane intersection derivation — from the plane equation, step by step
- The Möller–Trumbore algorithm — what each line tests and why
- Testing that click position translates to correct 3D location

**Time:** 45–60 minutes

---

> **Quick Check — try to answer before reading:**
>
> 1. Ray: `origin=(0,0,0)`, `direction=(0,0,-1)`. What is `P(t=5)`?
>    What is `P(t=-3)`? What does a negative `t` mean physically?
> 2. A ray is fired at a horizontal plane (the floor). The direction vector is
>    `(0, -1, 0)` (straight down). What is `t` at the intersection?
>    What if the direction is `(0, 1, 0)` (straight up)?
> 3. Screen position (400, 300) on an 800×600 viewport. What are the NDC coordinates?
>    (NDC x goes from -1 at left to +1 at right; NDC y goes from -1 at bottom to +1 at top)
>
> *(Answers at the end of this lab)*

---

## What a Ray Is

A ray is a line with a starting point (origin) and a direction. Every point ON the ray
can be described as:

```
P(t) = origin + t * direction
```

- `t = 0`: the origin point itself
- `t = 1`: one unit along the direction
- `t = 5`: five units along the direction
- `t < 0`: behind the origin (the ray doesn't go backward — we discard negative t)

For picking, we fire a ray from the camera through a screen pixel. The ray travels
forward until it hits something. The first hit with positive `t` is what the user clicked.

---

## Step 1 — Build the Ray Class

Create `src/math/Ray.ts`:

```ts
// src/math/Ray.ts
import { Vec3 } from './Vec3';

export interface RayHit {
  t:     number;   // distance along the ray (always > 0 for forward hits)
  point: Vec3;     // world-space position of the hit
}

export class Ray {
  constructor(
    readonly origin:    Vec3,
    readonly direction: Vec3,   // should be normalised for correct t distances
  ) {}

  // P(t) = origin + t * direction:
  at(t: number): Vec3 {
    return this.origin.add(this.direction.scale(t));
  }
}
```

Create the test file `src/math/Ray.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { Ray }  from './Ray';
import { Vec3 } from './Vec3';

describe('Ray', () => {

  it('at(0) returns the origin', () => {
    const ray = new Ray(new Vec3(1, 2, 3), Vec3.Z_AXIS.negate());
    const p   = ray.at(0);
    expect(p.x).toBe(1);
    expect(p.y).toBe(2);
    expect(p.z).toBe(3);
  });

  it('at(5) is 5 units along the direction from origin', () => {
    const ray = new Ray(Vec3.ZERO, Vec3.X_AXIS);   // at origin, pointing +X
    const p   = ray.at(5);
    expect(p.x).toBe(5);   // 5 units along +X
    expect(p.y).toBe(0);
    expect(p.z).toBe(0);
  });

});
```

### SAVE AND TRY

```bash
npx vitest run src/math/Ray.test.ts
```

Expected: `Tests 2 passed`.

---

### Concept: Ray-Plane Intersection — Derived From the Plane Equation

**What it is:** A plane in 3D can be written as: "all points P where `P · normal = d`"
where `normal` is the plane's orientation vector and `d` is its distance from the origin.

**Deriving the intersection:**

Substitute the ray equation `P(t) = origin + t * direction` into the plane equation:

```
(origin + t * direction) · normal = d

Expanding the dot product:
origin · normal + t * (direction · normal) = d

Solving for t:
t = (d - origin · normal) / (direction · normal)
```

**When does this fail?** When `direction · normal = 0`. That means the ray is parallel
to the plane — no intersection (or the ray lies IN the plane, infinite intersections).

**What does `t` tell you?** Substitute back into `P(t) = origin + t * direction` to
get the intersection point. `t > 0` means the plane is in front of the ray's origin.

Add to `Ray.ts`:

```ts
/**
 * Intersects the ray with a plane.
 * plane equation: P · normal = distance
 */
intersectPlane(normal: Vec3, distance: number): RayHit | null {
  // denominator = direction · normal (how much the ray moves "toward" the plane per unit t)
  const denom = this.direction.dot(normal);

  if (Math.abs(denom) < 1e-10) {
    // Ray is parallel to the plane — no intersection:
    return null;
  }

  // t = (distance - origin · normal) / (direction · normal)
  // Derived from substituting the ray equation into the plane equation:
  const t = (distance - this.origin.dot(normal)) / denom;

  if (t < 0) {
    // Intersection is behind the ray's origin — not visible:
    return null;
  }

  return { t, point: this.at(t) };
}
```

Add the tests — verify the formula produces the right `t`:

```ts
it('ray pointing straight down hits the floor (Y=0 plane) at t = origin.y', () => {
  // Ray at height 10, pointing straight down (-Y):
  const ray = new Ray(new Vec3(0, 10, 0), new Vec3(0, -1, 0));
  // Floor plane: Y=0 → normal=(0,1,0), distance=0
  const hit = ray.intersectPlane(Vec3.Y_AXIS, 0);

  expect(hit).not.toBeNull();
  // Ray travels 10 units to reach Y=0:
  expect(hit!.t).toBeCloseTo(10);
  expect(hit!.point.y).toBeCloseTo(0);
});

it('ray parallel to the floor returns null', () => {
  // Ray at height 5, pointing horizontally (+X):
  const ray = new Ray(new Vec3(0, 5, 0), Vec3.X_AXIS);
  const hit = ray.intersectPlane(Vec3.Y_AXIS, 0);
  expect(hit).toBeNull();   // parallel — never hits the floor
});

it('ray pointing away from the plane (behind the origin) returns null', () => {
  // Ray at Y=10, pointing UP — moving away from Y=0 plane:
  const ray = new Ray(new Vec3(0, 10, 0), Vec3.Y_AXIS);
  const hit = ray.intersectPlane(Vec3.Y_AXIS, 0);
  expect(hit).toBeNull();   // t would be negative — plane is behind the ray
});
```

### SAVE AND TRY

```bash
npx vitest run src/math/Ray.test.ts
```

Expected: all 5 tests pass.

---

### Concept: Screen to World — Unprojecting Through the Camera

**The problem:** The user clicks pixel (400, 300) on an 800×600 screen. We need the
ray in 3D world space that passes through that pixel.

**The mechanism — reverse the pipeline:**

```
Forward pipeline: local → world → camera → clip → NDC → screen
Reverse pipeline: screen → NDC → clip → camera → world
```

Step by step:
1. Convert screen → NDC: `ndcX = (px/width)*2-1`, `ndcY = 1-(py/height)*2` (flip Y)
2. Create a point in NDC at the near plane: `(ndcX, ndcY, -1, 1)` (z=-1 = near)
3. Unproject through the inverse projection matrix → point in camera space
4. Unproject through the inverse view matrix → point in world space
5. Ray origin = camera position in world. Ray direction = normalise(worldPoint - origin)

```ts
static fromScreenPosition(
  screenX:       number,
  screenY:       number,
  viewportWidth: number,
  viewportHeight: number,
  cameraPos:     Vec3,
  cameraTarget:  Vec3,
  cameraUp:      Vec3,
  fovYRad:       number,
  aspectRatio:   number,
): Ray {
  // Step 1: screen pixels → NDC coordinates (Y is flipped):
  const ndcX = (screenX / viewportWidth)  * 2 - 1;
  const ndcY = 1 - (screenY / viewportHeight) * 2;  // Y flip: pixels go down, NDC goes up

  // Step 2: camera basis vectors:
  const forward = cameraTarget.sub(cameraPos).normalise();
  const right   = forward.cross(cameraUp).normalise();
  const up      = right.cross(forward).normalise();

  // Step 3: the half-heights of the view plane at distance 1 from the camera:
  const halfH = Math.tan(fovYRad / 2);    // how much vertical range at distance 1
  const halfW = halfH * aspectRatio;      // how much horizontal range at distance 1

  // Step 4: build the ray direction in world space:
  // forward: go 1 unit in front of the camera
  // right * ndcX * halfW: shift horizontally by the NDC x position
  // up * ndcY * halfH: shift vertically by the NDC y position
  const dir = forward
    .add(right.scale(ndcX * halfW))
    .add(up.scale(ndcY * halfH))
    .normalise();

  return new Ray(cameraPos, dir);
}
```

Add the test that verifies the screen centre → forward ray:

```ts
it('screen centre maps to a ray pointing straight forward from the camera', () => {
  const cameraPos    = new Vec3(0, 0, 10);
  const cameraTarget = Vec3.ZERO;

  const ray = Ray.fromScreenPosition(
    400, 300,           // screen centre
    800, 600,
    cameraPos, cameraTarget, Vec3.Y_AXIS,
    Math.PI / 3,        // 60° FOV
    800 / 600,
  );

  // The centre of the screen should produce a ray pointing toward the target:
  const forwardDir = cameraTarget.sub(cameraPos).normalise();
  // The ray direction should be approximately the camera's forward direction:
  expect(ray.direction.dot(forwardDir)).toBeCloseTo(1, 2);
});
```

### SAVE AND TRY

```bash
npx vitest run src/math/Ray.test.ts
```

Expected: all 6 tests pass.

---

## Step 3 — Apply to CAD Construction Plane

The CAD/CAM application needs this for placing geometry: user clicks on the viewport,
the click maps to a position on the construction plane (e.g., the Z=0 plane).

```ts
it('clicking the screen maps to a position on the construction plane', () => {
  const cameraPos    = new Vec3(0, 0, 10);
  const cameraTarget = Vec3.ZERO;

  // Fire a ray through the centre of the screen:
  const ray = Ray.fromScreenPosition(
    400, 300,           // screen centre
    800, 600,
    cameraPos, cameraTarget, Vec3.Y_AXIS,
    Math.PI / 3, 800 / 600,
  );

  // Intersect with the Z=0 construction plane:
  // Plane equation: P · (0,0,1) = 0 → all points with Z=0
  const hit = ray.intersectPlane(Vec3.Z_AXIS, 0);

  expect(hit).not.toBeNull();
  // Centre of screen looking straight at origin → should hit near (0, 0, 0):
  expect(hit!.point.x).toBeCloseTo(0, 1);
  expect(hit!.point.y).toBeCloseTo(0, 1);
  expect(hit!.point.z).toBeCloseTo(0, 4);
});
```

### SAVE AND TRY

```bash
npx vitest run src/math/Ray.test.ts
```

Expected: all 7 tests pass.

---

## 🎯 Challenge: Find the Closest Hit Among Multiple Planes

**You know:** `intersectPlane`, `at(t)`, sorting by t.

**Task:** Given a ray and an array of plane definitions, return the CLOSEST intersection
(smallest positive t). This is used when the scene has multiple construction planes
(floor, walls, ceiling) and you want the first one the user "points at."

```ts
function findClosestPlaneHit(
  ray: Ray,
  planes: Array<{ normal: Vec3; distance: number }>,
): RayHit | null
```

Write 2 tests: one with two planes where the nearer one wins, one where no planes are hit.

---

<details>
<summary>▶ Show Solution</summary>

```ts
function findClosestPlaneHit(
  ray: Ray,
  planes: Array<{ normal: Vec3; distance: number }>,
): RayHit | null {
  let closest: RayHit | null = null;

  for (const plane of planes) {
    const hit = ray.intersectPlane(plane.normal, plane.distance);
    if (hit && (!closest || hit.t < closest.t)) {
      closest = hit;
    }
  }

  return closest;
}
```

**Tests:**
```ts
it('returns the closer of two hit planes', () => {
  const ray = new Ray(new Vec3(0, 0, 10), new Vec3(0, 0, -1));
  const planes = [
    { normal: Vec3.Z_AXIS, distance: 0 },   // Z=0 plane — 10 units away
    { normal: Vec3.Z_AXIS, distance: 5 },   // Z=5 plane — 5 units away (closer)
  ];
  const hit = findClosestPlaneHit(ray, planes);
  expect(hit?.point.z).toBeCloseTo(5);   // hit the Z=5 plane first
});

it('returns null when no plane is hit', () => {
  const ray = new Ray(Vec3.ZERO, Vec3.X_AXIS);  // horizontal ray
  const planes = [
    { normal: Vec3.Y_AXIS, distance: 5 },  // floor parallel to X direction
  ];
  expect(findClosestPlaneHit(ray, planes)).toBeNull();
});
```

</details>

---

## Final Check

| Concept | How to verify |
|---|---|
| `at(t)` traces the ray | `at(0)` = origin; `at(5)` = 5 units along direction |
| Parallel ray returns null | Ray direction perpendicular to plane normal → null |
| Behind-origin returns null | Ray pointing away from plane → negative t → null |
| Screen centre hits scene centre | Screen (400,300) on 800×600 → ray hits (0,0,0) |

---

## Quick Check Answers

**1. `P(t=5)` and `P(t=-3)` for ray at origin pointing `(0,0,-1)`?**

`P(5) = (0,0,0) + 5*(0,0,-1) = (0, 0, -5)` — 5 units in the -Z direction.
`P(-3) = (0,0,0) + (-3)*(0,0,-1) = (0, 0, 3)` — 3 units in the +Z direction.
Negative `t` means behind the ray's origin — the intersection would be in the opposite
direction from where the ray is pointing. We discard negative `t` values because they
represent things the user cannot see (behind the camera).

**2. Ray straight down hits Y=0 at what t? Ray straight up?**

Straight down `direction=(0,-1,0)`, `origin=(0,10,0)`, plane Y=0:
`t = (0 - 10) / (direction · normal) = -10 / ((0,-1,0)·(0,1,0)) = -10 / -1 = 10`.
The ray travels 10 units down before hitting the floor. ✓

Straight up `direction=(0,1,0)`: `t = (0-10)/((0,1,0)·(0,1,0)) = -10/1 = -10`.
Negative `t` → return null. The floor is behind the upward-pointing ray.

**3. Screen (400,300) on 800×600 → NDC coordinates?**

`ndcX = (400/800)*2 - 1 = 0.5*2 - 1 = 1 - 1 = 0`.
`ndcY = 1 - (300/600)*2 = 1 - 0.5*2 = 1 - 1 = 0`.
Centre of the screen is `(0, 0)` in NDC — the centre of the viewport. This makes sense:
the exact centre in pixels maps to the exact centre in NDC space.
