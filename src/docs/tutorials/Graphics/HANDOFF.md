# Graphics Curriculum Build — Handoff

Read this file first when resuming this task in a new session. Then read
`LESSON SCHEMA.md` and, only if the current section's title list isn't
already captured below, the relevant slice of `graphcs.brd.md` — then
continue directly, no need to re-ask the user anything not covered
below. **Never open an old `Lesson-NN.md` file, for any reason** —
stated directly by the user; this file's own function inventory, house
style, and judgment-call record below are the complete carried-forward
context a new lesson needs. (An earlier version of this line said to
read the most recent lesson file to recalibrate voice/depth — that
instruction is retracted, not just superseded; see the "Next after
Lesson 47" section below and `feedback_stay_scoped_no_exploration.md` in
the memory system.)

**Note on this file's own size:** earlier versions of this handoff
tracked every completed lesson with its own paragraph. That's no longer
here on purpose — once a section is complete, its lesson-by-lesson detail
lives in the lesson files themselves (`Lesson-01.md` through
`Lesson-45.md`), not duplicated here. This file now only carries what a
fresh session actually needs before writing the *next* lesson: ground
rules, the reusable function/construct inventory, house style, and
open judgment calls. Keep it this size going forward — summarize a
section once it's done, don't append a paragraph per lesson forever.

## The task

Write out the full ~500-lesson graphics/geometry/CAD-CAM curriculum
described in `src/docs/tutorials/Graphics/graphcs.brd.md` ("another
cadcam" — the file was renamed; the misspelling in the filename is
original and correct, don't "fix" it), one markdown file per lesson,
following `src/docs/reference/LESSON SCHEMA.md` mechanically and at full
depth — not an abbreviated or summarized version of the schema.

## Ground rules the user has stated directly (do not relitigate these)

- **Only touch files the user explicitly points at.** Do not explore
  other parts of the repo "to check something," verify a precedent, or
  follow a cross-reference — even when something looks plausibly
  relevant (e.g. a file the user happens to have open in their IDE).
  Stated three times in an early session, with real frustration by the
  third. Stay strictly scoped to `LESSON SCHEMA.md` and the Graphics
  folder.
- The markdown lessons here are **not** the same system as the app's
  real interactive lessons (`src/courses/*.js`). Intentional and
  confirmed — don't raise it again or attempt to convert anything.
- **Keep going lesson-by-lesson with no check-in questions between
  lessons.** A "session" is a time-based usage window, not a chat and
  not a lesson count — stated explicitly by the user, correcting an
  earlier misreading where a prior run stopped after only 2–3 lessons
  and called that a session's worth of work. Keep writing continuously
  within the current chat; only a genuinely new chat, started after the
  time-based session actually ends, needs this handoff read fresh.
- **The single goal is the best possible lessons, faithful to the
  schema** — stated directly by the user: this curriculum is how they
  intend to learn to build software with Claude going forward. Quality
  and fidelity to `LESSON SCHEMA.md` are the point, not pacing or
  volume for their own sake.
- **Assumed reader background** (stated explicitly by the user) is
  *only*: Python data types (`int`/`float`/`str`/`bool`/tuple/list),
  loops (`for`/`while`), function definitions (`def`/params/`return`),
  and baseline `print()`. **Not** assumed at the start: `if`/`else`,
  comprehensions, classes, `import`. See "Python constructs" below for
  which of these have since been taught, and where.

## Source-of-truth files

- `src/docs/reference/LESSON SCHEMA.md` — the mechanical production
  template. Follow it literally: Concept Unit step order, the Header's
  Terms-Introduced/Objects-and-methods format, the Repetition Rule, the
  self-check list at the bottom. Per the schema's own "for lessons
  written from this point forward" note (adopted starting Lesson 14): an
  isolated lab, when one is needed, is placed *after* Project
  Change/New Code/Updated Project, not before, and names the concept in
  bold right after the real output.
- `src/docs/tutorials/Graphics/graphcs.brd.md` — the master 500-lesson
  table of contents.
  - **Section I, "Geometric Thinking" (Lessons 1–20): complete.**
  - **Section II, "2D Computational Geometry" (Lessons 21–45): complete.**
    Full title list: 21 Lines and Line Segments, 22 Rays, 23 Parametric
    Geometry, 24 Line-Line Intersection, 25 Segment Intersection, 26
    Orientation Tests, 27 Collinearity, 28 Distance to a Line, 29
    Distance to a Segment, 30 Circles, 31 Circle-Line Intersection, 32
    Circle-Circle Intersection, 33 Polygons, 34 Polygon Orientation, 35
    Point-in-Polygon, 36 Polygon-Polygon Intersection, 37 Convexity, 38
    Convex Hulls, 39 Sweep-Line Algorithms, 40 Voronoi Diagrams, 41
    Delaunay Triangulation, 42 Polygon Triangulation, 43 Spatial
    Partitioning in 2D, 44 Robust 2D Geometry, 45 2D Geometry Workshop.
  - **Section III, "3D Geometry and Transformations" (Lessons 46–75):**
    confirmed title list, read directly from `graphcs.brd.md` this
    session (lines ~579–701): 46 3D Coordinate Frames, 47 Rotations in
    3D, 48 Rotation Matrices, 49 Euler Angles, 50 Gimbal Lock, 51
    Axis-Angle Representation, 52 Quaternions, 53 Quaternion
    Composition, 54 Quaternion Interpolation, 55 Rigid Transformations,
    56 SE(2) and SE(3), 57 Transformation Hierarchies, 58 Cameras as
    Coordinate Transformations, 59 Perspective Projection, 60
    Orthographic Projection, 61 View Frustums, 62 Clipping Planes, 63 3D
    Lines and Planes, 64 Ray-Plane Intersection, 65 Ray-Triangle
    Intersection, 66 Sphere Geometry, 67 Box Geometry, 68 Bounding
    Volumes, 69 Closest-Point Problems, 70 Distance Between Geometric
    Objects, 71 Geometric Transform Pipelines, 72 Numerical Rotation
    Problems, 73 Geometric Robustness in 3D, 74 Coordinate Frames in
    Robotics, CAD, and Games, 75 3D Geometry Workshop. Section IV,
    "Curves," starts at Lesson 76 — titles not yet read/confirmed.

**Verification-caching rule:** the section title lists above (all of
Section I, II, and III) were each captured with exactly one `Grep`/`Read`
pass into this file, the first time that section was reached — not
re-derived per lesson. This file *is* the verification document; when a
new section starts, read its whole TOC slice from `graphcs.brd.md` once,
paste the confirmed titles into the relevant bullet above, and every
later lesson in that section just reads them from here. Don't re-grep
`graphcs.brd.md` for a title already captured above.

## File convention

`src/docs/tutorials/Graphics/Lesson-01.md`, `Lesson-02.md`, ...
`Lesson-NN.md` — two-digit zero-padded, one file per lesson.
`geometry_lesson_NN.py` is a scratch verification file per lesson,
written to the session's own temp/scratchpad directory and run via Bash
— it is never committed to the repo; only its real, run output gets
pasted into the lesson markdown.

**`src/docs/tutorials/Graphics/geometry_verified_library.py`** — note
this lives *in the project*, not the session scratchpad (the scratchpad
is tied to one session's own random ID and isn't reachable from a future
session at all, which defeats the point of a cross-session library). It
is a standing, accumulated copy of every reusable function from Lessons
1–46, organized by originating lesson, with a self-check block at the
bottom that re-confirms ~15 known-correct values (`python
geometry_verified_library.py` — last run: all passed). This exists so a
new lesson's own scratch script can copy already-correct code from one
trusted source instead of retyping 15–20 functions from memory each
time. **This does not replace per-lesson verification** — the schema's
own rule still holds: a lesson's actual new code, and its real
interaction with anything it reuses, still has to be run via Bash this
session before going into that lesson's markdown. What it removes is the
transcription risk and effort of rebuilding the "already proven" half of
each scratch script from memory or from prose summaries. Append each new
lesson's own reusable functions to this file as it's written, plus one
new self-check line confirming a known value from that lesson. It's a
working tool for building the curriculum, not a lesson and not something
a learner needs — don't reference it from lesson content.

## Progress: Lessons 1–67 of 500 complete

**Section I (1–20):** the full 2D affine-geometry foundation — points,
vectors, dot/cross products, coordinate systems, basis vectors,
orientation, matrices, homogeneous coordinates, transformation
composition and inversion, numerical error, tolerant predicates —
closing with Lesson 20's pure-synthesis CAD/CAM workshop.

**Section II (21–45):** 2D computational geometry — parametric lines,
rays, segments and their intersections; circles and circle intersection
(the quadratic formula, first real `ValueError`); polygons (winding,
point-in-polygon via ray casting, polygon-polygon intersection,
convexity, convex hulls via gift wrapping, ear-clipping triangulation);
Voronoi diagrams and their Delaunay dual; sweep-line and uniform-grid
spatial pruning; closing with Lesson 44 (a real, resolved robustness fix
for Lesson 35's own disclosed ray-casting bug) and Lesson 45's
pure-synthesis workshop.

For what any specific lesson actually built, read that lesson's own file
— this handoff doesn't duplicate it. What follows is what's still
load-bearing for lessons not yet written.

## Python constructs — full first-appearance treatment, in order

The curriculum's own ground rule is that `if`/`else`, comprehensions,
classes, and `import` are *not* assumed at Lesson 1, and each needs a
real first-appearance treatment (often an isolated lab) the first time a
lesson's own problem genuinely needs it — not before. So far:

| Construct | Lesson | Notes |
| --- | --- | --- |
| `import` / `math.sqrt` | 9 | first isolated lab in the curriculum |
| `if`/`elif`/`else` | 19 | first genuine 3-way branch (`classify_turn`) |
| `for` loop (real use) | 27 | first arbitrary-length input (`are_points_collinear`) |
| `len`, `range`, `%` (modulo) | 33 | wraparound polygon indexing |
| `list.append`, `while` loop | 38 | convex hull, result size unknown in advance |
| `sorted`, `break` | 39 | sweep-line pruning |
| `//` (floor division) | 43 | grid-cell bucketing |
| `math.radians`, `math.sin`, `math.cos` | 47 | principal-axis rotation |
| `math.acos`, `max`, `min` | 54 | slerp angle recovery + domain clamping |
| `math.tan` | 61 | view-frustum field-of-view boundary |

`for`/`while` loops were always *assumed* background per the ground
rules (the user's own stated list) — the lessons above are where each
first became *well-motivated* in real project code, not where it was
first legal to use. Comparison operators (`==`, `<`, `>`, `!=`, `>=`,
`<=`) have been used freely since ~Lesson 5 without their own dedicated
treatment — judged adjacent to assumed background since `bool` is
assumed and every comparison's whole observable behavior is "produces a
`bool`." Classes have still never been used — no lesson so far has
needed one.

## Running function cast — reused verbatim, no re-explanation owed

Per the Repetition Rule, every function below is retyped unchanged
wherever a later lesson needs it, with no re-explanation owed:

- **Vectors/points (L1–3):** `distance` (1D), `add_vector_to_point`,
  `subtract_points`, `scale_vector`.
- **Products (L7–8):** `dot_product`, `cross_product`.
- **Length (L9–10):** `norm`, 2D `distance`, `normalize`.
- **Transforms (L6, L12):** `from_components`, `transform_to_global`.
- **Matrices (L14–16):** `dot3`/`apply_matrix` (3-component/homogeneous),
  `get_column`/`multiply_matrices`, matrix inverse via the transpose
  trick.
- **Tolerance (L17):** `nearly_equal(a, b, tolerance)` — the default way
  to compare any computed float from Lesson 17 forward; build predicates
  tolerant from their first version now, no need to re-demonstrate
  strict-then-fixed each time.
- **Predicates (L18–19, L26):** `is_point_on_line`/`_tolerant`,
  `classify_turn`/`_tolerant` (returns `"left"`/`"right"`/`"straight"`),
  `orientation(a,b,c)` (numeric `1`/`-1`/`0` twin of `classify_turn`,
  usable arithmetically — e.g. same-side tests via multiplication).
- **Lines/rays/segments (L21–22, L24–25):** `point_on_line(line_point,
  line_direction, t)` (the parametric-line base every later primitive
  builds on), `is_t_on_segment`/`is_t_on_ray` (swappable bounds checks),
  `find_t_for_point`, `is_point_on_segment`/`is_point_on_ray`,
  `line_intersection`, `segment_intersection` (guard-clause version,
  handles parallel input without crashing).
- **Distance (L28–29):** `distance_to_line`, `distance_to_segment`.
- **Circles (L30–32):** `(center, radius)` representation,
  `classify_point_vs_circle`, `circle_line_intersection` (quadratic
  formula), `circle_circle_intersection` (radical line via
  `perpendicular(v) = (-v[1], v[0])`).
- **Polygons (L33–38, L42):** `polygon` = `list` of vertex tuples,
  `get_edge`/`get_vertex` (wraparound), `polygon_perimeter`
  (accumulator-loop template), `polygon_signed_area`/
  `polygon_orientation` (shoelace formula), `is_polygon_convex`/
  `is_convex_vertex`, `convex_hull` (gift wrapping), `triangulate`
  (ear clipping via `is_ear`).
- **Point-in-polygon (L35, superseded by L44):** use
  `count_ray_crossings_robust`/`is_point_in_polygon_robust` (L44) for
  any new work — the half-open-interval fix for the shared-vertex
  double-count bug. Not `is_point_in_polygon` (L35's original), which is
  still genuinely buggy on that one case.
- **Polygon-polygon (L36):** `count_boundary_intersections`,
  `polygons_intersect` (nested-loop template; resolves the "zero
  crossings" ambiguity — separate vs. fully-nested — via a containment
  fallback).
- **Sweep/grid (L39, L43):** sort-and-`break` pruning template;
  `cell_of`/`cells_adjacent` (uniform-grid pruning; cell size must be
  chosen relative to the search threshold or it silently misses close
  pairs).
- **Voronoi/Delaunay (L40–41):** `closest_seed` (running-best-distance
  search), `bisector`, `circumcenter`, `is_delaunay_triangle`
  (empty-circumcircle property).
- **3D extension (L46):** `add_vector_to_point_3d`, `subtract_points_3d`,
  `scale_vector_3d`, `from_components_3d`.
- **Principal-axis rotation (L47):** `rotate_z`, `rotate_x`, `rotate_y` —
  matched cyclic set (each fixes one axis, rotates the next pair in the
  `x → y → z → x` cycle), built from `math.radians`/`math.sin`/`math.cos`.
  Rotation around an arbitrary (non-principal) axis is a real, disclosed
  gap — not yet possible with these three alone; naive composition of two
  of them does not equal true rotation about the diagonal axis their
  composition might suggest (verified in L47's own closing). Lesson 51
  (Axis-Angle Representation) is where that gets solved directly.
- **Rotation matrices (L48):** `rotation_matrix_z`, `rotation_matrix_x`,
  `rotation_matrix_y` — 3×3 matrices, each verified to reproduce its L47
  formula counterpart exactly via the unchanged `apply_matrix`. Compose
  with `multiply_matrices` (Repetition-Rule reuse, unchanged since L15);
  the multiplication order `multiply_matrices(A, B)` applies `B` first,
  matching nested-call order `A(B(p))`. Same-axis rotations commute;
  different-axis rotations do not (verified both ways in L48's closing)
  — this non-commutativity is the real reason Lesson 49 (Euler Angles)
  has to fix a specific rotation order on purpose.
- **Euler angles (L49):** `euler_to_matrix(yaw_z, pitch_y, roll_x)` —
  composes L48's three rotation matrices via `multiply_matrices`, twice
  nested, in a fixed **ZYX convention** (roll applied first, then pitch,
  then yaw — right to left in the code, matching L48's confirmed
  right-argument-applies-first rule). Verified against nested
  `rotate_z(rotate_y(rotate_x(...)))` calls across 6 angle triples, and
  confirmed to collapse to a single L47 formula call whenever the other
  two angles are zero. Closing proved the identical `(30, 20, 10)` angle
  triple gives a genuinely different result under ZYX vs. XYZ order —
  three bare numbers are not a complete rotation spec without also
  stating the convention. Gimbal lock (loss of a degree of freedom at a
  specific pitch angle, even under one fixed convention) is explicitly
  *not* covered here — that is Lesson 50's own dedicated subject.
- **Gimbal lock (L50):** `is_near_gimbal_lock(pitch_degrees,
  tolerance_degrees)` — real verified proof that L49's ZYX
  `euler_to_matrix` loses one degree of freedom at `pitch = ±90°`: any
  `(yaw, roll)` pair sharing the same `yaw - roll` produces the
  identical matrix at `pitch = 90°` (confirmed across 5 pairs; the same
  shifts at `pitch = 45°` produce genuinely different matrices, isolating
  the effect to `±90°` specifically). Mechanism, proved via L48's
  columns-are-basis-images result: `rotation_matrix_y(90)` sends the
  original `x`-axis onto the `z`-axis, so roll (about `x`, applied
  first) and yaw (about `z`, applied last) end up rotating around the
  same physical axis. Honestly disclosed, deliberately unfixed — no
  3-angle Euler scheme avoids this entirely (only the locked pitch value
  moves under a different convention). Lesson 51 (Axis-Angle) and 52–54
  (Quaternions) are the forward-referenced real fix; that promise must
  be kept under those exact names.
- **Axis-angle rotation (L51):** `cross_product_3d` (genuine 3D
  first-appearance, per the Repetition Rule's own exception — vector-
  valued and anti-commutative, not the 2D scalar `cross_product`),
  `norm_3d`/`normalize_3d` (Repetition-Rule 3D extension of L9/10,
  reusing `dot3` unchanged as the 3D dot product — same "already fits"
  reuse L48 found for `apply_matrix`), and `rotate_by_axis_angle(point,
  axis, theta_degrees)` — Rodrigues' rotation formula. Verified to
  reproduce `rotate_x`/`rotate_y`/`rotate_z` exactly when `axis` is a
  standard basis vector. **Closes L47's own disclosed gap by name:**
  re-ran L47's exact diagonal axis `(1, 1, 0)` and its fixed-point test
  — `rotate_by_axis_angle` now leaves a point on that axis completely
  unmoved, where L47's naive `rotate_z(rotate_x(...))` composition did
  not. Internally normalizes its own `axis` argument; closing proved
  skipping that step silently distorts the result's norm (5 → 30 on a
  length-`2√2` axis) with no error raised.
- **Quaternions (L52):** `quaternion_from_axis_angle`,
  `quaternion_norm`, `quaternion_multiply` (Hamilton product),
  `quaternion_conjugate`, `rotate_by_quaternion` (sandwich product
  `q * p * conjugate(q)`, point wrapped as a pure quaternion
  `(0,x,y,z)`). Built from **half** the requested angle — verified
  load-bearing directly: building from the full angle instead doubles
  the effective rotation (`90°` request → an actual `180°` result).
  Cross-validated against L51's `rotate_by_axis_angle` on a
  non-principal axis `(1,1,1)`, and re-ran L47's own diagonal-axis
  `(1,1,0)` fixed-point test a third independent way — still passes.
  Closing: a non-unit quaternion (norm `2`) doesn't rotate at all, it
  scales by norm² (a length-5 point came back length-`≈29.4`, i.e. ×4)
  — same silent-wrong-input risk pattern as L46/L48/L51.
- **Quaternion composition (L53):** no new function — proved
  `quaternion_multiply` (L52) already *is* rotation composition
  (matches nested `rotate_by_quaternion` calls; same
  right-argument-applies-first order as `multiply_matrices`); proved it
  **associative** (new term — grouping-independent, distinct from
  commutative) across three quaternions, both as bare quaternions and
  applied to a real point; reconfirmed L48's commute-on-same-axis /
  don't-commute-on-different-axis finding in quaternion form; proved the
  product of two unit quaternions is always unit length. Closing: naive
  component-wise quaternion *addition* (then renormalizing to unit
  length) produces a plausible-looking but completely wrong composed
  rotation — quaternions are not a vector space for this purpose.
- **Quaternion interpolation (L54):** `quaternion_dot`/`quaternion_scale`/
  `quaternion_add` (plain Repetition-Rule 4-tuple extensions) and
  `slerp(q1, q2, t)` — spherical linear interpolation, using `math.acos`
  (new) and `max`/`min` (new, clamp the dot product into `[-1,1]` before
  `math.acos`, which really does crash on `1.0000000000000002` —
  triggered and shown for real). Verified: exact endpoints, exact
  same-axis midpoint match against direct construction, and provably
  **constant angular velocity** (new term) across 5 even `t` steps on
  both a principal and non-principal axis. SE Lens: contrasted against
  `nlerp` (cheaper, real technique, but not constant-velocity — real
  numbers shown: 33.02°/41.98° steps vs slerp's even 37.5°). Closing:
  the **double cover** fact (`q` and `-q` are the same rotation, new
  term) — `slerp` checks `quaternion_dot < 0` and negates `q2` to take
  the short path; removing that check sends a `20°` interpolation the
  *long way* around (measured `170°` instead of `10°` at the midpoint),
  the most dramatic instance yet of this curriculum's recurring
  silent-wrong-input pattern (L46/48/50/51/52/53). **Closes the L47–54
  rotation-representation block** — Lesson 55 moves to rigid
  transformations (rotation + translation together).
- **Rigid transformations (L55):** `dot4`/`apply_matrix4`/
  `to_homogeneous_3d`/`build_rigid_transform`/`get_column4`/
  `multiply_matrices4` — 4×4 homogeneous matrices, direct 3D extension
  of L14–16's own 2D pattern. **Opens with the opposite finding from
  L48:** the existing 3-component `apply_matrix`/`dot3` does *not* fit a
  4×4 rigid transform for free — it silently drops the translation
  entirely (a 90°-rotate-then-translate call returned the rotation-only
  answer, no error). New 4-component functions fix it, verified exact.
  `build_rigid_transform`'s two special cases (zero rotation → pure
  translation; zero translation → matches L48's `rotation_matrix_z`
  exactly) both confirmed. Closing extends L14's own fixture scenario
  into genuine 3D (`fixture_origin_in_table` at height `15`) and
  reproduces L12/L14's own `(46, 23)` result exactly in `x`/`y` — the
  2D scenario really was the `z=0` special case, five sections later.
  Second closing failure (a real crash, not silent): `apply_matrix4` on
  a bare 3-tuple (missing the homogeneous `1`) raises `IndexError`.
- **SE(2)/SE(3) (L56):** `transpose3` (Lesson 16's transpose-inverse
  trick, first time persisted to the library) and
  `invert_rigid_transform`. Named the **group** concept (closure,
  associativity, identity, inverse) and verified all four for rigid
  transforms with real numbers: closure (composed transform keeps the
  `(0,0,0,1)` bottom row *and* preserves distance between two points),
  identity (zero-rotation/zero-translation transform leaves a point
  unchanged), associativity (cited from L53, not re-derived), inverse
  (a real round trip: `T` then `T⁻¹` returns the exact original point;
  `T⁻¹ * T` is the identity matrix). **Key subtlety, verified not just
  stated:** the inverse translation is `−R⁻¹·t`, *not* `−t` alone —
  closing showed the naive `−t` version produces a plausible-looking
  but wrong "inverse" (fails the round trip completely, off by more
  than 5 units) despite still satisfying closure.
- **Transformation hierarchies (L57):** `find_node`, `get_world_transform`
  — a hierarchy is a plain `list` of `(name, local_transform,
  parent_name)` node tuples (no class — checked against this
  curriculum's own tracked judgment call and found unnecessary),
  `parent_name` chained by string match, `None` marking the root. Walks
  the chain with a `while` loop (depth unknown in advance), composes
  root-to-child using L56's confirmed `multiply_matrices4` order.
  Verified two ways: reproduces L55's own already-known
  tool/fixture/table result exactly via a general chain-walk instead of
  one hand-written call, then extends to a real 4th level (**machine**,
  the level this handoff's own conventions have named since L14–16
  without building until now) with zero changes to the function itself.
  Closing: composing in the wrong order gives a *close-but-wrong*
  result (`51` vs correct `49`, with two of three components matching
  by coincidence) — flagged explicitly as more dangerous than an
  obviously-wrong result, since it could pass a loose test.
- **Cameras (L58):** `world_to_camera(camera_world_transform,
  point_world)` — no new representation (a camera **is** a rigid
  transform, Repetition Rule, matching L55). The real content: **view
  transform = the camera's own world transform, inverted** (L56's
  `invert_rigid_transform` reused for a brand-new purpose). Verified
  the camera's own position always maps to `(0,0,0)` in its own camera
  space; verified a tilted-camera result matches raw trigonometry
  (`20·sin(30°)=10`, `20·cos(30°)≈17.32`). Closing: using the camera's
  *forward* transform instead of its inverse is flagged explicitly as
  one of the most common real mistakes in actual graphics programming,
  not a contrived error — gives a plausible-looking but completely
  wrong point (the camera's own world position, not the target's
  camera-relative position).
- **Perspective projection (L59):** `build_perspective_matrix`,
  `perspective_divide`, `project_point`. First 4×4 matrix in this
  curriculum to produce `w ≠ 1` (`w = -z`, positive for anything in
  front of the camera per L58's own sign convention). **Perspective
  division** (new term) — dividing `x,y,z` by that `w` — is the first
  genuinely non-linear step in the whole pipeline (no matrix can divide
  one output by another). Verified exactly: a point twice as far
  projects to exactly half the screen-`x` (ratio `2.0`, not
  approximate). Closing: skipping the divide doesn't error, it silently
  produces an accidental (named, legitimate-elsewhere) *orthographic*
  projection — both points land at identical screen coords regardless
  of depth. Second failure: a point at camera-space `z=0` gives `w=0`,
  a real triggered `ZeroDivisionError`.
- **Orthographic projection (L60):** `build_orthographic_matrix`,
  `project_point_orthographic` — deliberately the exact matrix shape
  L59's own closing produced *by accident* (`w` fixed at `1`, no depth
  tracking); reuses `perspective_divide` unchanged (inert when `w=1`,
  not rewritten). Verified: near/far ratio is exactly `1.0` (vs L59's
  `2.0`) and equal real-world sizes at different depths project to
  identical measured spans (`10.0 == 10.0`) — the actual reason CAD
  drawings use this on purpose. Named honestly as a real tradeoff, not
  fixed: no depth can be recovered from projected size under this
  projection, unlike L59's own perspective ratio trick.
- **View frustums (L61):** `is_in_frustum(point_camera, near, far,
  vertical_half_fov_degrees, aspect_ratio)`, new `math.tan`. Near/far
  bound depth (`depth = -z`, L58's convention); side bounds compare
  `abs(x_or_y / depth)` against `tan(half_fov)` (vertical) and
  `tan(half_fov) * aspect_ratio` (horizontal) — reuses L59's own
  ratio-of-depth idea as a boundary test instead of a scale factor.
  Verified each of the 4 boundaries independently, plus an exact
  cutoff (`±0.01` flips the result). Closing: dropping just the
  near-plane check doesn't merely admit "too close" points — it admits
  a point genuinely *behind* the camera (negative depth passes every
  other check), a real, well-known class of rendering bug, not a minor
  edge case.
- **Clipping planes (L62):** `point_on_segment_3d` (Lesson 21's
  `point_on_line` rebuilt from L46's 3D pieces — the 2D original
  silently drops the 3rd component on a 3D input, verified: returns a
  2-tuple, no crash) and `clip_segment_to_near(p1, p2, near)`. Verified:
  new endpoint lands at exactly `depth = near`, on-axis and off-axis;
  both "nothing to clip" cases (fully inside → unchanged, fully
  outside → `None`) confirmed. Explicitly scoped to the near plane
  only — closing ran a segment that's near/far-valid but outside the
  horizontal FOV and showed `clip_segment_to_near` correctly reports
  nothing to do, since it only ever looks at depth (honest boundary,
  not a bug: 5 more boundary-specific clip functions would be needed
  for a complete system, none built here).
- **3D lines and planes (L63):** `point_on_line_3d` (L21's own
  point+direction formula, rebuilt from L46's 3D pieces — the direct
  counterpart to L62's two-point `point_on_segment_3d`, confirmed to
  agree exactly), `is_point_on_plane`, `signed_distance_to_plane`.
  **Plane** representation: `(point_on_plane, normal)`, a real new
  concept — tested via `dot3(normal, offset)` (perpendicularity),
  distance via dividing by `norm_3d(normal)` (correctly independent of
  the normal's own length — verified, not just claimed). **Key
  connecting proof:** L61/62's own ad-hoc near-plane depth check is
  exactly one instance of this general representation —
  `signed_distance_to_plane` on a plane built from `((0,0,-near),
  (0,0,1))` lands at precisely `0.0` at the boundary, confirming
  `near - depth` was the same quantity both ways. Closing: a plane
  built with an anchor point that isn't actually on the intended
  surface gives consistently, silently wrong results, off by exactly
  the anchor's own error (`-5.0` for a `z=5` anchor on the true `z=0`
  surface) — nothing checks the anchor is valid.
- **Ray-plane intersection (L64):** `ray_plane_intersection(ray_origin,
  ray_direction, plane)` — solves L22's ray equation against L63's
  plane test for `t` (`t = dot3(normal, point_on_plane − ray_origin) /
  dot3(normal, ray_direction)`); two guard clauses, same pattern as
  L25's `segment_intersection` (parallel-ray denominator≈0 →
  `"no intersection"`; `is_t_on_ray(t)==False` → plane sits behind the
  ray's own origin). **Key connecting proof:** re-derived L62's own
  near-plane crossing through this general formula (on-axis and
  off-axis) and got the exact same point both ways — the general
  formula subsumes L62's hand-derived arithmetic, not merely resembles
  it. Both guards triggered on real inputs, not just described.
- **Ray-triangle intersection (L65):** `is_point_in_triangle_3d(point,
  v0, v1, v2, normal)` (same-side test: `dot3(cross_product_3d(edge,
  to_point), normal) < 0` rejects, checked per edge — reuses L51
  `cross_product_3d` + L63 `dot3`) and `ray_triangle_intersection`
  (computes the triangle's own normal from `v1-v0` × `v2-v0`, reuses
  L64's `ray_plane_intersection` unchanged, then the same-side test).
  Verified all 3 outcomes (hits inside / hits plane but misses triangle
  / misses plane entirely) plus edge-boundary and near-vertex cases.
  Closing: computing the normal with reversed vertex winding flips
  `True`→`False` for the *identical* point — a real, silent mismatch
  risk; `ray_triangle_intersection` avoids it by always deriving the
  normal from the same two edges itself, never accepting it as a
  separate argument that could disagree.
- **Sphere geometry (L66):** `classify_point_vs_sphere`,
  `sphere_line_intersection` — direct 3D extension of L30–31's own
  circle work, same quadratic-formula shape rebuilt from L63's 3D
  `dot3`/`norm_3d`/`point_on_line_3d`. Opening found the 2D
  `circle_line_intersection` fails 3D input *two different ways*
  depending on the specific direction: a z-only direction gives
  `a=0` → real `ZeroDivisionError`; a `(1,1,1)` direction gives a
  plausible-looking but numerically wrong 2-tuple (solves for the
  wrong implicit circle in the xy-plane, not the true sphere) — both
  triggered and shown, not just described. Verified tangent/miss/
  through-center/off-axis cases; off-axis result independently
  confirmed at exactly `radius` distance from center.

## Conventions established — maintain these exactly

- **Verify everything for real.** Every code block and every output
  shown in every lesson has actually been executed via the Bash tool
  this session before being written into the markdown — never written
  from memory. This includes tracebacks (real crash output, not a
  guessed one) and includes re-verifying a fix's own before/after
  numbers, not just the fix itself.
- **CAD/CAM-flavored examples**, not generic math — matches the BRD's
  own stated purpose. The fixture→table(→machine) scenario from Lessons
  14–16 (`fixture_x_axis_in_table = (0, 1)`, `fixture_y_axis_in_table =
  (-1, 0)`, `fixture_origin_in_table = (50, 20)`, `feature_in_fixture =
  (3, 4)`) and the `(3, 4)`/`(0, 0)` running direction/point recur
  throughout — reuse exact numbers when extending an existing scenario
  so results stay directly comparable without re-deriving.
- **Isolated throwaway labs** (Concept Isolation Rule) are given in full
  only for a genuinely new *Python construct* (see table above). Most
  lessons' new material is conceptual/mathematical, built from
  already-covered syntax — in that case the schema's isolation step is
  explicitly *noted* as skipped ("a note on method"), never silently
  omitted.
- **"Objects and methods used" is often "None."** This field is
  reserved for *real external* classes/methods (`math.sqrt`, `len`,
  `range`, `sorted`, `list.append`) — this curriculum's own hand-authored
  functions are never listed here; they get Repetition-Rule treatment in
  each Concept Unit's own Mechanical Walkthrough instead.
- **"What Breaks Without This" always uses a real, verified failure**,
  deliberately varied in kind: silent wrong values, real crashes with
  full tracebacks (`ZeroDivisionError`, `IndexError`, `ValueError`),
  silently wrong geometric results, and — since Lesson 16 — several
  *honestly disclosed, deliberately unfixed* limitations (documented as
  real scope boundaries, not bugs) alongside lessons that *do* fix a
  previously-disclosed limitation outright (Lesson 44 fixing Lesson 35).
  Both are legitimate closings; don't feel obligated to fix everything
  immediately just because a gap was found.
- **Forward references** always cite the exact lesson number *and*
  title from `graphcs.brd.md`'s own TOC — never guessed.
- **Workshop lessons** (Lesson 20, Lesson 45, and presumably later
  section closers) introduce **zero new terms/concepts** — pure
  synthesis, entirely reused functions, tied into one or more worked
  problems. Don't treat a workshop lesson as incomplete for lacking new
  Terms; that's the intended shape.

## Judgment calls made so far (for consistency, not re-litigation)

- Kept the whole curriculum in 2D throughout Sections I and II, even
  though the BRD doesn't explicitly say so for Section I — 3D doesn't
  start until Section III (Lesson 46). Consistent throughout; changes
  starting Lesson 46.
- Matrices are plain nested tuples of numbers (row-major: `matrix[i]` is
  a whole row), never a dedicated matrix type or library (no NumPy) —
  matches the whole-program pattern of building every operation from
  scratch on plain tuples.
- Unrolling a small, fixed-size operation by hand (e.g. `dot3` called 3
  or 9 times) vs. reaching for a loop is a **deliberate per-lesson style
  choice**, not a hard rule — used for genuinely small, fixed counts
  (a 3×3 matrix, 3 fixed corners) even after loops became well-motivated
  elsewhere (L27+). A loop is the right call once a count is genuinely
  unknown in advance or large.
- Boolean operators `and`/`or`/`not` have never been used — every
  multi-condition check so far has been restructured as nested `if`s or
  separate guard clauses instead. Continue this pattern rather than
  introducing `and`/`or` casually; if a lesson genuinely needs them,
  give them the same first-appearance treatment as any other new
  construct.
- Concept file reuse (`src/docs/concepts/`) has not yet come up in
  practice — no lesson so far has factored a term out to a shared
  concept file. Keep checking the self-check's own prompt about this
  each lesson; it just hasn't been triggered yet.

## Next after Lesson 66 — Section III underway

Lesson 67, "Box Geometry," is next (full Section III title list already
captured above — no need to re-grep `graphcs.brd.md`). No lesson is
currently in-flight; Lesson 66 is fully written and verified.

Lesson 66 ("Sphere Geometry") built `classify_point_vs_sphere` and
`sphere_line_intersection` as a direct 3D extension of Lesson 30–31's
own circle work, rebuilt from Lesson 63's 3D `dot3`/`norm_3d`/
`point_on_line_3d`. Opening found the 2D `circle_line_intersection`
fails on 3D input two genuinely different ways depending on the
specific direction vector: a `z`-only direction makes the 2D dot
product's own `a` term exactly `0`, triggering a real
`ZeroDivisionError`; a `(1, 1, 1)` direction instead returns a
plausible-looking but numerically wrong 2-tuple, having silently solved
for the wrong implicit circle in the `x`/`y` plane rather than the true
3D sphere — both triggered and shown with real output, not just
described as a risk. Verified tangent, miss, straight-through, and
off-axis cases; the off-axis result was independently confirmed to sit
at exactly `radius` distance from the sphere's own center.

Lesson 67 should build box geometry (likely an axis-aligned bounding
box, min/max corners per axis — a natural, minimal representation,
matching this curriculum's own "plain tuples" house style) — check
whether point-in-box and box-line/box-ray intersection reuse existing
per-axis range-check patterns (similar in spirit to Lesson 61's own
near/far depth bounds) rather than needing a fundamentally new
technique, and whether Lesson 68 ("Bounding Volumes") immediately after
is where boxes and spheres get unified under one shared purpose
(bounding a more complex shape cheaply) rather than that synthesis
belonging here.

**Note to self, stated directly by the user 2026-08-16: do not narrate
progress in chat between lessons — no recaps, no batch summaries, no
"here's what I built" text. Just keep writing lessons back-to-back.**
This handoff file is still updated every lesson as the real safety
checkpoint; the chat itself should carry no narration beyond genuine
blockers.

**Self-correction, 2026-08-16:** an earlier edit pass in this same
session accidentally duplicated the L55/L56/L57 entries in the "Running
function cast" list above (inserted once in the correct chronological
position, once more by mistake right after L46). Found and fixed by
re-reading this file's own actual current content before editing it
further — a reminder to verify the exact surrounding text of a match
rather than assuming an anchor phrase is unique, especially in a file
this long. The list above is now L46 → L47…L60, single copy each,
correct order.

Lesson 60 ("Orthographic Projection") built the deliberate version of
the projection Lesson 59's own closing had already produced by
accident — same matrix shape, `w` fixed at `1` instead of tracking
depth, `perspective_divide` reused unchanged (inert on `w=1`, not
rewritten). Verified near/far ratio is exactly `1.0` (vs. Lesson 59's
`2.0`), and that equal real-world sizes at different depths project to
identical measured spans — the actual, honest reason CAD/engineering
drawings use this deliberately. Named the real tradeoff directly: no
depth is recoverable from projected size under this projection, unlike
Lesson 59's own perspective-ratio trick.

Lesson 61 should build the **view frustum** — the truncated-pyramid
volume of space a camera can actually see, bounded by near/far planes
and the field of view. Likely ties Lesson 58's camera transform and
Lesson 59's perspective matrix together into one bounded volume, and
probably needs a genuinely new idea: a point can now be *outside* what
the camera sees entirely (behind the near plane, beyond the far plane,
or outside the side planes), which nothing built through Lesson 60 has
had a way to detect — check whether this connects back to Lesson 62,
"Clipping Planes," immediately next, rather than front-loading clipping
logic into Lesson 61 itself.

**Ground-rule addition, stated directly by the user in the session that
produced Lesson 47:** never open an old `Lesson-NN.md` file for any
reason — not to recalibrate voice, not to spot-check quality, not to
verify a prior session's work happened. This overrides this file's own
former instruction (removed) to read the most recent lesson file at the
start of a session. Build every lesson directly from `LESSON SCHEMA.md`
plus this handoff's own carried-forward conventions (the function
inventory, house style, and judgment calls already recorded here are
sufficient) — see `feedback_stay_scoped_no_exploration.md` in the memory
system for the full rationale.

Expect the rest of Section III to revisit a lot of Section I's own 2D groundwork
(coordinate systems, basis vectors, transformations, matrices) in 3D —
watch for genuine new content (a third basis vector, cross product's
real 3D vector form vs. Section I's 2D scalar shortcut, homogeneous
coordinates as 4×4 instead of 3×3) versus material that's a
straightforward dimensional extension of what Lessons 4–16 already
proved. The Repetition Rule's own exception clause matters here: 2D
versions of ideas that get a genuinely different 3D treatment (e.g.
cross product) are a real first appearance in 3D, not just a reappearance
to cite. Lesson 49 ("Euler Angles") should compose all three principal
rotations (via `multiply_matrices`, now that L48 built it) in one fixed
order to represent an arbitrary orientation — frame it as directly
building on L48's own closing (order is not free to ignore) rather than
re-deriving that point from scratch. Lesson 50 (Gimbal Lock) is where a
real failure of that fixed-order scheme gets demonstrated.
