# Junior to Senior — T7·L6 — Ray Casting and Picking

**Prerequisites:** T7·L5 (Quaternions). You understand 3D rotations. This lesson
covers ray casting — the algorithm that converts a mouse click on a 2D screen
into a 3D position in the scene, enabling object selection and point placement.

**What this lab adds:**
- A ray: origin point + direction vector
- Screen to world: 2D mouse position → 3D ray through the scene
- Ray-plane intersection: where a ray hits a flat plane (the construction plane)
- Ray-triangle intersection: picking arbitrary 3D geometry (Möller–Trumbore)
- Three.js `Raycaster`: the built-in helper

**Time:** 45–60 minutes

---

> **Quick Check — try to answer before reading:**
>
> 1. A ray has `origin = (0, 0, 0)` and `direction = (0, 0, -1)`. What does
>    the point `P(10)` = `origin + 10 * direction` equal?
> 2. A ray is parallel to a plane (the direction vector is perpendicular to the
>    plane's normal). How many intersection points are there?
> 3. For a CAD application, the construction plane is at Z = 5.0mm. The user
>    clicks the screen. What computation converts that 2D click to the 3D
>    position on the plane?
>
> *(Answers at the end of this lab)*

---

## What You Will Build

A `Ray` class and two intersection tests — against a plane and a triangle:

```ts
const ray = new Ray(new Vec3(0, 0, 10), new Vec3(0, 0, -1));

// Hit a flat plane at Z = 0:
const planeHit = ray.intersectPlane(Vec3.Z_AXIS, 0);
// planeHit → { t: 10, point: Vec3(0, 0, 0) }

// Hit a triangle:
const triHit = ray.intersectTriangle(
  new Vec3(-1, -1, 0),
  new Vec3( 1, -1, 0),
  new Vec3( 0,  1, 0),
);
// triHit → { t: 10, point: Vec3(0, 0, 0) }
```

---

### Concept: The Ray

**What it is:** A ray starts at an origin point and goes in a direction infinitely.
Every point on the ray is described by the parameter `t`:

`P(t) = origin + t * direction`

- `t = 0`: the origin point
- `t > 0`: in front of the origin (along the direction)
- `t < 0`: behind the origin

For intersection tests, we only accept `t > 0` (in front of the camera).

---

### Concept: Screen to World Ray

**The algorithm:**

1. Convert screen pixel `(px, py)` to NDC: `ndcX = (px / width) * 2 - 1`, `ndcY = 1 - (py / height) * 2`
2. Create a near plane point in clip space: `nearClip = (ndcX, ndcY, -1, 1)`
3. Create a far plane point in clip space: `farClip = (ndcX, ndcY, 1, 1)`
4. Unproject both through the inverse of `projection * view`
5. Ray origin = unprojected near point (in world space)
6. Ray direction = `normalise(far - near)`

In Three.js, `Raycaster.setFromCamera(new THREE.Vector2(ndcX, ndcY), camera)` does all of this.

---

### Concept: Ray-Plane Intersection

**Plane definition:** A plane is defined by a normal vector `n` and a distance `d`
from the origin. Any point `P` on the plane satisfies `P · n = d`.

**Intersection:**
Substitute the ray equation `P(t) = origin + t * direction` into the plane equation:

`(origin + t * direction) · n = d`
`t = (d - origin · n) / (direction · n)`

If `direction · n ≈ 0`, the ray is parallel to the plane — no intersection.

---

## Step 1 — Implement `Ray`

Create `src/math/Ray.ts`:

```ts
import { Vec3 } from './Vec3';

export interface RayHit {
  t:     number;   // parameter along the ray
  point: Vec3;     // world-space hit position
}

export class Ray {
  constructor(
    readonly origin:    Vec3,
    readonly direction: Vec3,  // should be normalised
  ) {}

  at(t: number): Vec3 {
    return this.origin.add(this.direction.scale(t));
  }

  /**
   * Intersects the ray with a plane defined by normal and distance from origin.
   * The plane equation: point · normal = distance.
   */
  intersectPlane(normal: Vec3, distance: number): RayHit | null {
    const denom = this.direction.dot(normal);

    if (Math.abs(denom) < 1e-10) {
      return null;  // ray is parallel to the plane
    }

    const t = (distance - this.origin.dot(normal)) / denom;

    if (t < 0) return null;  // intersection is behind the ray origin

    return { t, point: this.at(t) };
  }

  /**
   * Möller–Trumbore ray-triangle intersection.
   * Returns null if the ray misses or hits the back face (with back-face culling).
   */
  intersectTriangle(
    A: Vec3, B: Vec3, C: Vec3,
    backFaceCulling = true,
  ): RayHit | null {
    const EPSILON = 1e-10;

    const edge1 = B.sub(A);
    const edge2 = C.sub(A);

    const h = this.direction.cross(edge2);
    const a = edge1.dot(h);

    if (backFaceCulling && a < EPSILON) return null;  // back face or parallel
    if (Math.abs(a) < EPSILON)          return null;  // parallel

    const f = 1 / a;
    const s = this.origin.sub(A);
    const u = f * s.dot(h);

    if (u < 0 || u > 1) return null;

    const q = s.cross(edge1);
    const v = f * this.direction.dot(q);

    if (v < 0 || u + v > 1) return null;

    const t = f * edge2.dot(q);

    if (t < EPSILON) return null;  // triangle is behind the ray

    return { t, point: this.at(t) };
  }

  /**
   * Projects a screen position to a 3D ray in world space.
   * Used for mouse picking.
   */
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
    // Convert to NDC (-1 to 1):
    const ndcX = (screenX / viewportWidth)  * 2 - 1;
    const ndcY = 1 - (screenY / viewportHeight) * 2;  // Y is flipped

    // Camera basis vectors:
    const forward = cameraTarget.sub(cameraPos).normalise();
    const right   = forward.cross(cameraUp).normalise();
    const up      = right.cross(forward).normalise();

    // View plane dimensions at distance 1:
    const halfH = Math.tan(fovYRad / 2);
    const halfW = halfH * aspectRatio;

    // Ray direction in world space:
    const dir = forward
      .add(right.scale(ndcX * halfW))
      .add(up.scale(ndcY * halfH))
      .normalise();

    return new Ray(cameraPos, dir);
  }
}
```

---

## Step 2 — Write Tests

Create `src/math/Ray.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { Ray }   from './Ray';
import { Vec3 }  from './Vec3';

describe('Ray', () => {

  describe('at(t)', () => {
    it('at t=0 returns the origin', () => {
      const ray = new Ray(new Vec3(1, 2, 3), Vec3.Z_AXIS.negate());
      expect(ray.at(0).equals(new Vec3(1, 2, 3))).toBe(true);
    });

    it('at t=5 moves 5 units along direction', () => {
      const ray = new Ray(Vec3.ZERO, Vec3.X_AXIS);
      expect(ray.at(5).equals(new Vec3(5, 0, 0))).toBe(true);
    });
  });

  describe('intersectPlane', () => {
    it('hits the XY plane (Z=0) from above', () => {
      const ray  = new Ray(new Vec3(0, 0, 5), Vec3.Z_AXIS.negate());
      const hit  = ray.intersectPlane(Vec3.Z_AXIS, 0);
      expect(hit).not.toBeNull();
      expect(hit!.t).toBeCloseTo(5);
      expect(hit!.point.z).toBeCloseTo(0);
    });

    it('returns null when ray is parallel to the plane', () => {
      const ray = new Ray(Vec3.ZERO, Vec3.X_AXIS);  // moving along X
      const hit = ray.intersectPlane(Vec3.Z_AXIS, 1);  // Z=1 plane
      expect(hit).toBeNull();
    });

    it('returns null when plane is behind the ray', () => {
      const ray = new Ray(new Vec3(0, 0, 5), Vec3.Z_AXIS);  // moving away from Z=0
      const hit = ray.intersectPlane(Vec3.Z_AXIS, 0);
      expect(hit).toBeNull();  // t would be negative
    });

    it('hits a plane at Z=construction_depth for CAD use', () => {
      const constructionZ = -2.0;
      const ray = new Ray(new Vec3(0, 0, 10), Vec3.Z_AXIS.negate());
      const hit = ray.intersectPlane(Vec3.Z_AXIS, constructionZ);
      expect(hit).not.toBeNull();
      expect(hit!.point.z).toBeCloseTo(constructionZ);
    });
  });

  describe('intersectTriangle', () => {
    const A = new Vec3(-1, -1, 0);
    const B = new Vec3( 1, -1, 0);
    const C = new Vec3( 0,  1, 0);

    it('hits a triangle from the front', () => {
      const ray = new Ray(new Vec3(0, 0, 5), Vec3.Z_AXIS.negate());
      const hit = ray.intersectTriangle(A, B, C);
      expect(hit).not.toBeNull();
      expect(hit!.point.z).toBeCloseTo(0);
    });

    it('misses when the ray does not hit the triangle', () => {
      const ray = new Ray(new Vec3(10, 10, 5), Vec3.Z_AXIS.negate());  // far off
      const hit = ray.intersectTriangle(A, B, C);
      expect(hit).toBeNull();
    });

    it('misses the back face when back-face culling is enabled', () => {
      const ray = new Ray(new Vec3(0, 0, -5), Vec3.Z_AXIS);  // from behind
      const hit = ray.intersectTriangle(A, B, C, true);
      expect(hit).toBeNull();
    });

    it('hits the back face when back-face culling is disabled', () => {
      const ray = new Ray(new Vec3(0, 0, -5), Vec3.Z_AXIS);
      const hit = ray.intersectTriangle(A, B, C, false);
      expect(hit).not.toBeNull();
    });
  });

});
```

### SAVE AND TRY

```bash
npx vitest run
```

Expected: all tests pass.

---

## 🎯 Challenge: Find Closest Triangle Hit

**You know:** `intersectTriangle`, ray casting, `t` parameter ordering.

**Task:** Given a ray and a list of triangles (as vertex triples), return the
closest hit (smallest positive `t`):

```ts
function findClosestHit(
  ray: Ray,
  triangles: [Vec3, Vec3, Vec3][],
): RayHit & { triangleIndex: number } | null
```

Write 2 tests: one that returns the closest of two overlapping triangles,
one that returns null when no triangle is hit.

---

<details>
<summary>▶ Show Solution</summary>

```ts
function findClosestHit(
  ray: Ray,
  triangles: [Vec3, Vec3, Vec3][],
): (RayHit & { triangleIndex: number }) | null {
  let closest: (RayHit & { triangleIndex: number }) | null = null;

  for (let i = 0; i < triangles.length; i++) {
    const [A, B, C] = triangles[i];
    const hit = ray.intersectTriangle(A, B, C);
    if (hit && (!closest || hit.t < closest.t)) {
      closest = { ...hit, triangleIndex: i };
    }
  }

  return closest;
}
```

**Tests:**
```ts
it('returns the closer of two triangles', () => {
  const ray = new Ray(new Vec3(0, 0, 10), Vec3.Z_AXIS.negate());
  const near: [Vec3, Vec3, Vec3] = [new Vec3(-1,-1,5), new Vec3(1,-1,5), new Vec3(0,1,5)];
  const far:  [Vec3, Vec3, Vec3] = [new Vec3(-1,-1,0), new Vec3(1,-1,0), new Vec3(0,1,0)];

  const hit = findClosestHit(ray, [far, near]);
  expect(hit).not.toBeNull();
  expect(hit!.triangleIndex).toBe(1);  // near triangle is at index 1
});

it('returns null when no triangle is hit', () => {
  const ray = new Ray(new Vec3(100, 100, 10), Vec3.Z_AXIS.negate());
  const tri: [Vec3, Vec3, Vec3] = [new Vec3(-1,-1,0), new Vec3(1,-1,0), new Vec3(0,1,0)];
  expect(findClosestHit(ray, [tri])).toBeNull();
});
```

</details>

---

## Final Check

| Operation | Input | Output |
|---|---|---|
| `ray.at(t)` | scalar t | Point on ray |
| `intersectPlane(n, d)` | normal + distance | `{ t, point }` or null |
| `intersectTriangle(A, B, C)` | three vertices | `{ t, point }` or null |
| Screen to ray | screen (x,y), camera params | `Ray` in world space |

---

## Quick Check Answers

**1. `P(10) = origin + 10 * direction` where `direction = (0, 0, -1)`?**

`P(10) = (0,0,0) + 10*(0,0,-1) = (0, 0, -10)`. The point is 10 units along the
negative Z axis from the origin. This is what "10 units in front of the camera" looks
like when the camera faces -Z.

**2. Ray parallel to a plane — how many intersections?**

Zero (or infinitely many if the ray lies on the plane). When `direction · normal ≈ 0`,
the denominator in the intersection formula is near zero. Mathematically, the ray and
plane never intersect (or the ray lies entirely within the plane). In practice, we check
`abs(direction · normal) < epsilon` and return `null`.

**3. 2D click → 3D position on construction plane Z = 5.0:**

1. Convert mouse position to NDC: `(px/width * 2 - 1, 1 - py/height * 2)`.
2. Construct a ray from the camera position through that NDC point (unproject).
3. Intersect the ray with the plane `Z = 5.0` (normal = `(0,0,1)`, d = 5.0).
4. The intersection point is the 3D position on the construction plane. This is
   exactly how CAD systems place points when the user clicks in the 3D viewport.
