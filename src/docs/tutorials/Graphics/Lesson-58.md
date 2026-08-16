# Lesson 58: Cameras as Coordinate Transformations

**What you will build:** `world_to_camera` — a function that converts
any point from world space into a camera's own local coordinate space,
built entirely from functions this curriculum already has:
`build_rigid_transform` (Lesson 55), `invert_rigid_transform` (Lesson
56), and `apply_matrix4` (Lesson 55). The transferable problem: a
"camera" needs no new representation at all — it's exactly the same
thing as any other object this curriculum has positioned in 3D space
since Lesson 55, a rigid transform describing where it sits and which
way it's turned. What's genuinely new is a specific, non-obvious fact
about how to *use* that transform: converting the world into a camera's
own point of view needs the camera's transform run *backward* — its
own inverse — not the transform itself. Getting that backward is one of
the most common real mistakes in graphics programming, and this
lesson's own closing demonstrates exactly what it looks like when it
happens.

**What you need to know first:** Lesson 55's `build_rigid_transform`
and `apply_matrix4`. Lesson 56's `invert_rigid_transform` and its own
already-verified round-trip property (a transform composed with its own
inverse returns any point to where it started). Lesson 48's
`rotation_matrix_x`.

**Assumed background (outside this curriculum):** unchanged from Lessons
1–57.

**Terms introduced in this lesson:**

- **world space** and **camera space** — **world space** is the one
  shared coordinate frame every other position in a scene is ultimately
  measured against (the same root Lesson 57's own `get_world_transform`
  resolved every node to). **Camera space** is a *different* coordinate
  frame — one centered on the camera itself, where the camera always
  sits at the exact origin `(0, 0, 0)`, regardless of where that same
  camera happens to sit in world space. They exist as two separate
  terms because a real scene needs both: world space is where objects
  are naturally described and positioned relative to each other, while
  camera space is what's actually needed to answer "what does the
  camera see" — the same object can have two completely different sets
  of coordinates depending on which of the two frames it's measured in.
- **view transform** — the specific rigid transform that converts a
  point from world space into camera space. It exists as its own named
  term, distinct from the camera's own world transform, because the two
  are not the same transform — this lesson's own closing proves
  directly that using one in place of the other produces a real,
  dramatically wrong result.

**Objects and methods used:**

None new.

---

## Concept Unit: A Camera Is Just a Coordinate Frame

### The Problem

Nothing in this curriculum so far has a concept of "a camera." Before
building anything new, the real question is whether one is even needed
— or whether a camera is already something this curriculum knows how to
represent.

### Project Change

- **Reference Source:** No reference counterpart — this unit applies
  already-existing project code (`build_rigid_transform`, Lesson 55) to
  a new use, rather than adding new representational machinery.
- **Files affected:** none — this unit's own code is a plain example,
  reused directly in the next unit.
- **Change type:** N/A.
- **Location:** N/A.
- **Dependencies:** `build_rigid_transform` (Lesson 55),
  `rotation_matrix_x` (Lesson 48).

### The New Code

```python
camera_world = build_rigid_transform(rotation_matrix_x(30), (0, 0, 20))
```

### Mechanical Walkthrough

- `rotation_matrix_x(30)` — **(b) hard concept reappearing** (Lesson
  48) — the camera is tilted `30°` about `x`, angled down toward
  whatever it's observing rather than pointed straight along one axis.
- `(0, 0, 20)` — **(b) hard concept reappearing** (Lesson 46) — the
  camera's own translation: it sits `20` units up along `z` in world
  space.
- `build_rigid_transform(rotation_matrix_x(30), (0, 0, 20))` — **(b)
  hard concept reappearing** (Lesson 55). This one call is the entire
  representation this lesson needs for "a camera" — its position and
  orientation, in world space, exactly like any other rigid transform
  this curriculum has built since Lesson 55. Nothing about it is
  camera-specific; the same function that positions a fixture or a
  tool positions a camera equally well.

### CS Lens

Reusing one existing representation (a rigid transform) for a
conceptually different *role* (a camera, rather than a fixture or a
tool) instead of inventing a dedicated `Camera` type is an instance of
**representing distinct roles with a shared underlying type**:

```
Also recognized in: a `File` object representing both a regular file
and a symlink in many operating systems' own APIs, a single `Person`
database row playing the role of "customer" in one query and
"employee" in another, this curriculum's own polygon representation
(Lesson 33) serving as both a convex hull's own output (Lesson 38) and
an ear-clipping triangulator's own input (Lesson 42) with no separate
type for either
```

### Connecting Sentence

`camera_world` fully describes where the camera sits and which way it
faces — the next unit is where the actual, non-obvious work happens:
turning that description into something usable for "what does the
camera see."

---

## Concept Unit: The View Transform — Why It's the Camera's Own Inverse

### The Problem

`camera_world` converts a point *from* the camera's own local space
*into* world space — the same direction every rigid transform this
curriculum has built so far already works in (Lesson 55's own
`tool_to_fixture` converts a tool-local point into fixture space, not
the reverse). Answering "where does this world point appear, relative
to the camera" needs the *opposite* direction: world space converted
into camera space. Nothing built so far runs a rigid transform
backward — except Lesson 56's own `invert_rigid_transform`, built for
an entirely different reason at the time (confirming SE(3)'s own group
axioms), never yet applied to this specific problem.

### Project Change

- **Reference Source:** No reference counterpart — this is a direct
  application of Lesson 56's own already-general `invert_rigid_transform`
  to a new problem, not new inversion logic.
- **Files affected:**
  `src/docs/tutorials/Graphics/geometry_verified_library.py` (new
  section appended after Lesson 57's `get_world_transform`).
- **Change type:** add.
- **Location:** new section, `# ── L58: cameras as coordinate
  transformations ──`.
- **Dependencies:** `invert_rigid_transform` (Lesson 56), `apply_matrix4`,
  `to_homogeneous_3d` (Lesson 55).

### The New Code

```python
def world_to_camera(camera_world_transform, point_world):
    view_transform = invert_rigid_transform(camera_world_transform)
    return apply_matrix4(view_transform, to_homogeneous_3d(point_world))
```

### The Updated Project

A brand-new, freestanding function — nothing surrounding it yet to show
it placed inside, per the schema's own stated exception.
`geometry_verified_library.py` now carries `world_to_camera` as the
first function in its new "L58: cameras as coordinate transformations"
section.

### Mechanical Walkthrough

- `invert_rigid_transform(camera_world_transform)` — **(b) hard concept
  reappearing** (Lesson 56). This is the **view transform**, this
  lesson's own Header term: the camera's own world-describing transform,
  run backward.
- `apply_matrix4(view_transform, to_homogeneous_3d(point_world))` —
  **(b) hard concept reappearing** (Lesson 55) — applies that inverted
  transform to convert one world point into camera space.

### Real Verification

The clearest possible test of a view transform: apply it to the
camera's *own* position. Per this lesson's own Header definition of
**camera space**, the camera always sits at the exact origin of its own
space — no matter where it happens to be in world space:

```python
cam_pos_in_camera_space = world_to_camera(camera_world, (0, 0, 20))
print("camera position in camera space =", cam_pos_in_camera_space)
```

Real output:

```
camera position in camera space = (0, 0.0, 0.0, 1)
```

Exactly `(0, 0, 0)` — confirming `world_to_camera` genuinely produces
camera-relative coordinates, not merely *some* transformed point. Now
check a real scene point — the world origin `(0, 0, 0)`, where a
workpiece might actually sit — first with no camera tilt at all, to
build intuition before adding the rotation:

```python
identity_r = ((1, 0, 0), (0, 1, 0), (0, 0, 1))
camera_world_notilt = build_rigid_transform(identity_r, (0, 0, 20))
part_origin_cam = world_to_camera(camera_world_notilt, (0, 0, 0))
print("part origin, camera with no tilt =", part_origin_cam)
```

Real output:

```
part origin, camera with no tilt = (0, 0, -20, 1)
```

The camera sits at world `z = 20`; the part sits at world `z = 0` —
`20` units away. In camera space, that same distance shows up as `-20`
along the camera's own `z` axis: the sign records *which direction*
relative to the camera, exactly the extra information "20 units away"
alone doesn't carry. Now the real, tilted camera:

```python
part_origin_cam_tilt = world_to_camera(camera_world, (0, 0, 0))
print("part origin, camera tilted 30 deg =", part_origin_cam_tilt)
```

Real output:

```
part origin, camera tilted 30 deg = (0, -9.999999999999998, -17.320508075688775, 1)
```

Tilting the camera `30°` redistributes that same `20`-unit distance
across the camera's own `y` and `z` axes instead of sitting purely on
`z` — `-10` and `-17.32` respectively, matching `20 · sin(30°) = 10` and
`20 · cos(30°) ≈ 17.32`, Lesson 47's own trigonometric decomposition
showing up again here, in a genuinely new context.

### Connecting Sentence

`world_to_camera` correctly places both the camera itself and a real
scene point into camera space — the closing below runs a full round
trip and then shows exactly what breaks when the inversion step gets
skipped.

---

## Closing

### Connect the Pieces

Confirm the whole pipeline is reversible: take a world point, convert it
into camera space, then convert straight back using `camera_world`
directly (the *forward* direction this lesson's own opening unit
already established `camera_world` performs) — the result should match
the original point exactly:

```python
world_point = (5, 3, 0)
cam_point = world_to_camera(camera_world, world_point)
back_to_world = apply_matrix4(camera_world, cam_point)
print("world_point =", world_point)
print("cam_point =", cam_point)
print("back_to_world =", back_to_world)
```

Real output:

```
world_point = (5, 3, 0)
cam_point = (5, -7.401923788646682, -18.820508075688775, 1)
back_to_world = (5.0, 3.0, -3.552713678800501e-15, 1.0)
```

`back_to_world` matches `world_point` down to floating-point noise (the
`z` component's own `-3.55e-15` is `nearly_equal`-scale zero, not a real
discrepancy). Converting to camera space and back is a genuine round
trip, the same property Lesson 56 already proved for
`invert_rigid_transform` in general, now confirmed in this specific,
new context.

### What Breaks Without This

`world_to_camera`'s own single most important line is
`invert_rigid_transform(camera_world_transform)` — not
`camera_world_transform` used directly. Skipping that one call is one
of the most common real mistakes in actual graphics programming, not a
contrived error invented for this lesson. Try it:

```python
wrong = apply_matrix4(camera_world, to_homogeneous_3d((0, 0, 0)))
print("WRONG (camera's own transform, not inverted) =", wrong)
print("correct (view transform) =", part_origin_cam_tilt)
```

Real output:

```
WRONG (camera's own transform, not inverted) = (0, 0.0, 20.0, 1)
correct (view transform) = (0, -9.999999999999998, -17.320508075688775, 1)
```

`(0, 0, 20)` — the camera's own world *position*, not the part's
position relative to the camera at all. This isn't a coincidence:
`apply_matrix4(camera_world, ...)` applied to the *local* origin
`(0, 0, 0)` always returns exactly wherever the camera itself sits in
world space, by `build_rigid_transform`'s own definition — using the
forward transform on a world point computes something that looks
superficially plausible (a real 3D point, no crash) but answers a
question nobody asked. In a real rendering or vision system, this
specific mistake shows up as objects appearing to orbit around the
camera incorrectly, or a scene inverting itself, precisely because
"camera space" and "the space camera_world itself operates in" are two
different, easily confused things — the exact distinction this lesson's
own Header names as **view transform** versus a camera's own world
transform.

### Exercises

- Confirm `world_to_camera` applied to a point that's *behind* the
  camera (on the opposite side from where it's tilted) produces a
  positive `z` in camera space instead of negative — pick a point of
  your own choosing and check the sign.
- Build a second camera at a different world position and orientation,
  and confirm the *same* world point produces two different sets of
  camera-space coordinates — one per camera — since camera space is
  always relative to whichever camera is doing the converting.
- Using Lesson 57's own `get_world_transform`, place a camera as a node
  inside a transformation hierarchy (parented to some other node of your
  choosing) instead of giving it a standalone world transform directly,
  and confirm `world_to_camera` still works correctly once fed that
  node's own resolved world transform.

### Definition of Done

- [ ] `world_to_camera` exists in `geometry_verified_library.py`.
- [ ] The camera's own position was verified to transform to exactly
      `(0, 0, 0)` in its own camera space — not assumed from the
      formula's shape.
- [ ] A real scene point was checked both with and without camera tilt,
      confirming the tilted result matches the untilted one redistributed
      by real trigonometry (Lesson 47's own `sin`/`cos` decomposition),
      not just checked for "a plausible-looking number."
- [ ] The round trip (world → camera → world) was actually run and
      compared against the original point, not assumed from Lesson 56's
      general inverse property alone.
- [ ] The forgot-to-invert failure was actually run and its wrong output
      compared directly against the correct view-transform result, with
      the real-world consequence (this is a genuinely common mistake,
      not a contrived one) stated explicitly.
- [ ] Commit with a message stating *why*: a camera now has a working
      way to convert world points into its own point of view, built
      entirely from already-existing rigid-transform machinery — no new
      representation was needed, only the correct *use* of what already
      existed.
