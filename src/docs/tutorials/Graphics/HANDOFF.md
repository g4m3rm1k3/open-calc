# Graphics Curriculum Build — Handoff

Read this file first when resuming this task in a new session. Then read
`LESSON SCHEMA.md`, `graphcs.brd.md`, and the most recent `Lesson-NN.md` to
recalibrate voice/depth, then continue directly — no need to re-ask the
user anything not covered below.

## The task

Write out the full ~500-lesson graphics/geometry/CAD-CAM curriculum
described in `src/docs/tutorials/Graphics/graphcs.brd.md` ("another
cadcam" — the file was renamed; the misspelling in the filename is
original and correct, don't "fix" it), one markdown file per lesson,
following `src/docs/reference/LESSON SCHEMA.md` mechanically and at full
depth — not an abbreviated or summarized version of the schema.

## Ground rules the user has stated directly (do not relitigate these)

- **Only touch files the user explicitly points at.** Do not explore other
  parts of the repo "to check something," verify a precedent, or follow a
  cross-reference — even when something looks plausibly relevant (e.g. a
  file the user happens to have open in their IDE). This was stated three
  times in an early session, with real frustration by the third time.
  Stay strictly scoped to `LESSON SCHEMA.md` and the Graphics folder.
- The markdown lessons here are **not** the same system as the app's real
  interactive lessons (`src/courses/*.js` — a totally different,
  React-component-driven format). This is intentional and already
  confirmed by the user: the JS format would take a month per lesson; this
  markdown textbook series is the fast path. Don't raise this as a problem
  again or attempt to convert anything.
- **Keep going lesson-by-lesson with no check-in questions between
  lessons.** The user explicitly chose this pacing. Only stop for a
  genuine blocker (see "judgment calls" below for how those have been
  handled so far).
- **Minimize stopping/turns.** The user is watching session cost and
  length directly and wants long, uninterrupted forward progress within a
  session, then a clean handoff (like this file) to a fresh session rather
  than one very long-running chat.
- **Assumed reader background** (stated explicitly by the user) is *only*:
  Python data types (`int`/`float`/`str`/`bool`/tuple/list), loops
  (`for`/`while`), function definitions (`def`/params/`return`), and
  baseline `print()` familiarity (justified in Lesson 1 as "what every
  intro exercise uses before reaching those three topics"). **Not**
  assumed: `if`/`else`, comprehensions, classes, `import`. Each of those
  needs full first-appearance treatment (often an isolated throwaway lab)
  the first time a lesson actually needs it. Loops being assumed has not
  yet actually been used in any lesson's real project code through Lesson
  16 — every multi-step computation so far (dot products, matrix
  multiplication) has instead used small, explicitly unrolled helper
  functions, matching the established style; this was a deliberate choice
  each time, not an oversight, and loops remain available (already
  assumed, no lab owed) whenever a future lesson's real input size makes
  unrolling impractical.

## Source-of-truth files

- `src/docs/reference/LESSON SCHEMA.md` — the mechanical production
  template. Follow it literally, including the Concept Unit step order,
  the Header's Terms-Introduced/Objects-and-methods format, the
  Repetition Rule, and the self-check list at the bottom.
- `src/docs/tutorials/Graphics/graphcs.brd.md` — the master 500-lesson
  table of contents. Section I, "Geometric Thinking," is Lessons 1–20
  (now complete). Section II, "2D Computational Geometry," is Lessons
  21–45 (confirmed titles read directly from this file this session,
  lines ~473–576): 21 Lines and Line Segments, 22 Rays, 23 Parametric
  Geometry, 24 Line-Line Intersection, 25 Segment Intersection, 26
  Orientation Tests, 27 Collinearity, 28 Distance to a Line, 29 Distance
  to a Segment, 30 Circles, 31 Circle-Line Intersection, 32
  Circle-Circle Intersection, 33 Polygons, 34 Polygon Orientation, 35
  Point-in-Polygon, 36 Polygon-Polygon Intersection, 37 Convexity, 38
  Convex Hulls, 39 Sweep-Line Algorithms, 40 Voronoi Diagrams, 41
  Delaunay Triangulation, 42 Polygon Triangulation, 43 Spatial
  Partitioning in 2D, 44 Robust 2D Geometry, 45 2D Geometry Workshop.
  Section III, "3D Geometry and Transformations," starts at Lesson 46 —
  titles not yet read/confirmed, do not guess them. Note: Lessons 26
  (Orientation Tests) and 27 (Collinearity) will revisit ground Lessons
  18–19 already broke (predicates, collinearity, tolerance) — expected,
  intentional depth progression, not a duplicate to avoid.

## File convention

`src/docs/tutorials/Graphics/Lesson-01.md`, `Lesson-02.md`, ...
`Lesson-NN.md` — two-digit zero-padded, one file per lesson.

## Progress: Lessons 1–38 of 500 complete — Section I finished, Section II underway

1. What Is a Geometric Problem? — the 6-word taxonomy (object,
   relationship, measurement, query, constraint, transformation);
   `distance` (1D).
2. Points, Vectors, and Directions — affine-space rules; tuple `+`
   silently concatenates instead of adding (verified gotcha);
   `add_vector_to_point`, `subtract_points`.
3. Scalars and Geometric Quantities — `scale_vector`; tuple `*` silently
   repeats/empties instead of scaling (verified gotcha, including the
   `()` empty-tuple case from a negative repeat count).
4. Coordinate Systems — machine vs. work origin; translation invariance
   of vectors under origin change (proved).
5. Local and Global Coordinates — chained (3-level) coordinate
   conversion; proved link-by-link walking equals combining offsets
   first.
6. Basis Vectors — `from_components`; same numeric components through a
   different basis land on a different point (verified); screen-space
   Y-flip gotcha.
7. Dot Products — `dot_product`; sign meaning (positive/negative/zero =
   aligned/opposed/perpendicular); projection onto a unit vector recovers
   a component (ties to Lesson 6).
8. Cross Products (2D scalar form) — `cross_product`; anticommutativity
   proved; turn-direction (winding) sign reading.
9. Norms and Distance — first `import math`/`math.sqrt` (full isolated
   lab); `norm`, general 2D `distance`; closes the loop on why Lesson 7's
   stretched-axis projection came out wrong (norm ≠ 1).
10. Normalization — `normalize`; real floating-point rounding shown
    honestly (`0.6000000000000001`, not clean `0.6`, forward-refs Lesson
    17); real `ZeroDivisionError` crash on the zero vector (actually run,
    real traceback).
11. Orientation — orientation of a whole basis (handedness) vs. Lesson 8's
    per-corner winding; reflected basis produces a genuinely mirrored
    point (verified CAD-mistake scenario).
12. Coordinate Transformations — `transform_to_global` unifies Lessons
    4/5 (origin) and 6 (basis) into one function; proved it collapses to
    each earlier lesson's own answer under the right inputs.
13. Affine Transformations — same `transform_to_global`, four different
    inputs = translation/rotation/scaling (all reused, zero new code) plus
    shear (genuinely new); shear preserves orientation but not distance
    (verified against Lesson 5's invariance claim).
14. Homogeneous Coordinates — bundles Lesson 12's origin+basis into a 3×3
    `transform_matrix` (nested-tuple lab); pads a 2D point to `(x, y, 1)`;
    `dot3`/`apply_matrix` reproduce `transform_to_global`'s own `(46,
    23)` exactly; padding with `0` instead of `1` turns a point into a
    direction (translation ignored) — ties directly to Lesson 2's
    point-vs-vector distinction.
15. Transformation Composition — two chained frames (fixture→table→
    machine), applied link-by-link two different ways; `get_column`
    (reading a row-major matrix the other way) and `multiply_matrices`
    (new); one combined matrix reproduces the two-call chain's result
    exactly; matrix multiplication proved non-commutative (swapped
    argument order silently gives a different, wrong point).
16. Inverse Transformations — confirms Lesson 6's fixture basis is
    orthonormal (unit length + perpendicular, via `norm`/`dot_product`);
    builds `table_to_fixture_matrix` via the transpose trick; proved
    correct two ways (product is the identity matrix; a point round-trips
    exactly); the same trick applied to a non-orthonormal (scaled) basis
    silently produces a wrong "identity" (`((4,0,0),(0,4,0),(0,0,1))`,
    not `1`s) — real limitation, not a bug.
17. Numerical Error in Geometry — delivers on Lesson 10's forward-reference
    debt: `3 / 5.0` prints `0.6` but `3 * (1 / 5.0)` prints
    `0.6000000000000001` (two roundings vs. one, real mechanism, not
    hand-waved); explains why Lesson 16's `math.sqrt(1)` was guaranteed
    exact (correctly-rounded, perfect-square input) while `math.sqrt(2)`
    never can be; builds `nearly_equal(a, b, tolerance)` (new, reusable);
    proves `norm(normalize((1, 2))) == 1.0` is `False`
    (`0.9999999999999999`) even though the vector is a genuinely correct
    unit vector.
18. Exact vs. Approximate Geometry — builds `is_point_on_line` from
    `subtract_points`/`cross_product`; a point built via
    `normalize`/`scale_vector` that is mathematically on the line (the
    curriculum's own `(3, 4)` direction) gets a **false negative** from
    plain `==`; fixed with a tolerant version using `nearly_equal`; closing
    proves the flip side too — too loose a tolerance (`1.0`) produces a
    **false positive** on a genuinely off-line point.
19. Geometric Predicates — **`if`/`elif`/`else` introduced here, full
    first-appearance treatment** (previously not-assumed per the ground
    rules; this is the first lesson that genuinely needed 3-way branching
    instead of a single boolean expression); builds `classify_turn`
    (left/right/straight, reusing `cross_product`); names the general
    pattern **geometric predicate**, tying together Lessons 8, 11, and
    18's own sign-reading tests; `classify_turn_tolerant` reuses
    `nearly_equal`, checked *before* either sign — closing proves checking
    order matters (a tolerance check placed after a strict sign check
    never runs, using a one-line `if/else` *expression* only inside the
    counter-example, not taught as new material).
20. Geometric Problem-Solving — Section I's closing workshop, **zero new
    terms/concepts**, entirely reuse: transforms a 3-corner pocket
    (fixture→table via `apply_matrix`), verifies orientation survived
    with `classify_turn`, verifies non-degenerate area via
    `cross_product`/2 + `nearly_equal`; closing shows a genuinely
    collinear "pocket" (data-entry-mistake shaped, not float noise)
    correctly caught by the area check.
21. Lines and Line Segments — `point_on_line(line_point, line_direction,
    t)`, the parametric-line formula (reused L2/L3, zero new arithmetic);
    `is_t_on_segment(t)` = `0 <= t <= 1` (chained comparison); proves a
    point genuinely on the *infinite* line (Lesson 18's own predicate)
    can still fail a *segment* bounds check — a distinction nothing
    before this lesson could make; `find_t_for_point` (projection, via
    `dot_product`) recovers `t` from a plain point; combined
    `is_point_on_segment` checks collinearity before computing `t`
    (order matters — closing proves a wrong-order version silently
    accepts a point that's merely *near* the line).
22. Rays — `is_t_on_ray(t)` = `t >= 0` (one-sided, vs. L21's two-sided
    `is_t_on_segment`); `is_point_on_ray` mirrors L21's
    `is_point_on_segment` exactly except for that one bounds-check
    function; closing swaps in the wrong bounds check on purpose to prove
    the swap is the entire difference between the two primitives.
23. Parametric Geometry — names "parameter"/"parametric function"
    formally (L21/22 already used the pattern without naming it); proves
    it's not secretly "straight line only" by building
    `parabola_point(t) = (t, t*t)` and *measuring* that equal `t` steps
    give constant spacing on a line (`5.0` three times) but growing
    spacing on the parabola (`1.41`, `3.16`, `5.10`) — real, run, not
    asserted.
24. Line-Line Intersection — derives `line_intersection` from
    `cross_product` by crossing both sides of `t*dir1 - s*dir2 = diff`
    with `dir2` (using `cross_product(v,v)=0`) to isolate `t`; verifies
    against an independently-solved `s` on the *other* line, using
    `nearly_equal` since the two results differ in the last float digit;
    proves parallel directions always zero the denominator
    algebraically, then reproduces a real `ZeroDivisionError` in the
    closing (not hedged/caught — deliberately shown as a real, understood
    crash, matching this curriculum's established `ZeroDivisionError`
    pattern from L10).
25. Segment Intersection — reuses L24's `t`/`s` cross-product derivation
    unchanged, wrapped in three **guard clauses** (new term/pattern):
    parallel (`denominator == 0`, handled with `"no intersection"`
    instead of L24's deliberate crash — segments hit this constantly as
    normal input, lines don't), `t` out of `is_t_on_segment` bounds, `s`
    out of bounds. Closing proves both bound checks are independently
    required — removing just the `s` check produces a real, silent false
    positive (`(2.0, 2.0)` returned as "intersecting" for two segments
    that don't actually meet).
26. Orientation Tests — names **signed area** formally (L20 computed it
    without naming it); builds numeric `orientation(a,b,c)` returning
    `1`/`-1`/`0`, a twin of L19's `classify_turn` that returns a number
    instead of a string, specifically so it can be used arithmetically;
    closing proves the point — multiplying two `orientation` results
    tests whether two points are on the same side of a line, something
    `classify_turn`'s strings structurally cannot do.
27. Collinearity — **this curriculum's first real `for` loop in project
    code** (loops were always assumed background per the ground rules,
    just never yet well-motivated — an arbitrary-length batch of points
    finally is); `are_points_collinear(points)` loops with a guard-clause
    early return, reusing L18's `is_point_on_line` unchanged; a tolerant
    version inherits L18's own floating-point weakness "for free" by
    construction; closing shows a 1-point batch crashing with a real
    `IndexError` on `points[1]` (`len(points) >= 2` was never checked).
28. Distance to a Line — `distance_to_line` reuses L21's
    `find_t_for_point` + `point_on_line` + L9's `norm` with zero new
    arithmetic; second unit *proves* (doesn't just assert) the closest
    point is perpendicular via `dot_product`, and the check itself needs
    `nearly_equal` — the "obviously exactly zero" dot product actually
    computes to `-1.776e-15`, a fresh, real instance of L17's whole
    lesson showing up in a place that looks like it shouldn't need it.
29. Distance to a Segment — `distance_to_segment` reuses L28 unchanged
    when `find_t_for_point`'s `t` is in `is_t_on_segment` bounds;
    otherwise clamps to whichever endpoint is nearer (compares both
    distances explicitly, never assumes which one wins); closing proves
    both comparisons are required with a point where `segment_start`,
    not `segment_end`, is the correct answer.
30. Circles — first shape represented by a *rule* instead of named
    points: `circle = (center, radius)`. `distance_from_center` (reuses
    L2/L9 unchanged) + `classify_point_vs_circle` (3-way "inside"/"on"/
    "outside", **built tolerant from its first version** — deliberately
    not "strict first, then fix it" like L18/19, since that lesson (and
    reason) is already taught; closing still proves the tolerance is
    load-bearing with a real computed boundary point,
    `norm(normalize((1,1))*4)` = `3.9999999999999996` ≠ `4`).
31. Circle-Line Intersection — substitutes `point_on_line` into the
    circle condition to get a quadratic `a*t²+b*t+c=0`
    (`a=dot(dir,dir)`, `b=2*dot(d,dir)`, `c=dot(d,d)-r²`); **this
    curriculum's first quadratic formula and first `ValueError`**
    (`math.sqrt` of a negative discriminant, guarded against);
    discriminant's 3 cases (two hits/tangent/miss) branch with the
    **tolerant (`nearly_equal`) check first**, strict `< 0` second —
    proven necessary, not just tidy: a genuinely-tangent discriminant can
    round to a tiny *negative* float, which a `< 0`-first check would
    misclassify as a miss.
32. Circle-Circle Intersection — derives the **radical line** (subtract
    one circle's condition from the other's, quadratic terms cancel
    exactly, leaves a plain line) via a new `perpendicular(v) =
    (-v[1],v[0])` function (secretly the same rotation as
    `fixture_y_axis_in_table` since L14, named explicitly here for the
    first time); the actual intersection is found by hand-off to L31's
    `circle_line_intersection` **completely unchanged** — every classic
    case (2 hits, tangent, too-far, nested) falls out of L31's own
    discriminant logic for free; only 1 new guard clause needed
    (concentric centers, `d==0`, real `ZeroDivisionError` if skipped).
33. Polygons — polygon = `list` of vertices (first real polygon
    representation); **`len`, `range`, and `%` (modulo) all get full
    first-appearance treatment here** (none used before in this
    curriculum, `len`/`range` given proper "Objects and methods used"
    entries), combined in `get_edge(polygon, i)` = `polygon[i]`,
    `polygon[(i+1) % len(polygon)]` for wraparound closing the shape;
    `polygon_perimeter` introduces the **accumulator loop pattern**
    (`total = total + x`), this curriculum's first loop shape other than
    L27's early-exit search; closing shows a real `IndexError` from
    `polygon[i+1]` without the modulo on the last edge.
34. Polygon Orientation — **shoelace formula** (new term): sum
    `cross_product(v1,v2)` over every edge via `get_edge` +
    accumulator, halved = `polygon_signed_area` — direct generalization
    of L26's 3-point `signed_area`, verified to reduce to it for a
    triangle; `polygon_orientation` reuses the L19/26 sign-reading
    if/elif/else pattern (restated as hard-concept-reappearing, not
    re-derived); closing shows a real, honest limitation — a
    self-intersecting "bowtie" ordering of the *same 4 corners* reports
    `"degenerate"` (signed contributions of the two crossed lobes cancel
    exactly), not a bug, a real property of the shoelace formula assuming
    a simple (non-self-intersecting) polygon.
35. Point-in-Polygon — **ray casting** (new term): reuses L25's
    `segment_intersection` **completely unchanged**, treating a "ray" as
    an ordinary long segment (`point` to `point + (1000, 0)`ish) —
    counts crossings against every edge via `get_edge`, then
    **crossing-number parity** (`crossings % 2 == 1`) decides
    inside/outside. Closing is an honestly-disclosed, deliberately
    unfixed limitation (matching L16's "orthonormal-only" pattern): a
    ray passing exactly through a polygon vertex where two edges meet
    gets double-counted by `segment_intersection`'s own inclusive
    `0<=t<=1` bounds, verified with a concrete notch-polygon case where a
    genuinely-inside point (`(1,2)`) gets reported `False` (2 crossings,
    even) — explicitly deferred to L44 Robust 2D Geometry, not fixed
    here.
36. Polygon-Polygon Intersection — **this curriculum's first nested `for`
    loop** (both loops already fully taught individually, only their
    combination is new — no isolated lab needed, just an execution trace
    showing iteration order); `count_boundary_intersections` checks every
    edge of A against every edge of B via `segment_intersection`
    unchanged; discovers `0` crossings is genuinely **ambiguous**
    (separate shapes vs. one fully nested inside the other with room to
    spare) and resolves it with `is_point_in_polygon` (L35) as a fallback
    on one vertex from each polygon; closing proves a
    boundary-crossings-only version silently returns `False` for the
    nested case, which is unmistakably, visibly overlapping.
37. Convexity — `get_vertex(polygon, i) = polygon[i % len(polygon)]`
    (wraparound in *either* direction via `%`'s negative-index behavior,
    e.g. `-1 % 4 == 3` — proven, not just asserted); `is_polygon_convex`
    compares every vertex's local `classify_turn` (L19) against the
    polygon's own overall `polygon_orientation` (L34) — **derived, not
    assumed** — a fixed-assumption version ("any right turn = non-convex")
    is proven wrong in the closing on a genuinely convex but
    clockwise-wound square. No `list.append()` needed — turns are
    checked one at a time with early-exit guard clauses, not collected.
38. Convex Hulls — **`list.append` and a real `while` loop, both full
    first-appearance treatment here for the first time** (`while` was
    always assumed background per the ground rules, like `for` before
    L27, just never yet well-motivated — building a result whose final
    size isn't known in advance finally is). Gift-wrapping algorithm:
    `find_leftmost_point` (new "running-best" accumulator sub-pattern,
    distinct from L33's running-sum), `find_next_hull_point` (reuses
    L26's `orientation` unchanged as the entire comparison rule),
    `convex_hull` collects vertices via `hull.append(...)` inside
    `while next_point != start`. Verified two ways: against L37's
    `is_polygon_convex` (independent check, both hulls pass), and a
    closing that swaps the `while` for a plausible `for i in
    range(len(points))` — produces a *silently corrupted* hull with
    duplicated vertices (not a crash), because a hull's vertex count has
    no fixed relationship to the input point count.

## Conventions established — maintain these exactly

- **Verify everything for real.** Every code block and every output shown
  in every lesson has been actually executed via the Bash tool this
  session before being written into the markdown — never written from
  memory or assumed. Continue this without exception, including for
  tracebacks (real crash output, not a guessed one).
- **File-per-lesson code convention:** each lesson's Python code lives in
  its own fresh scratch file (`geometry_lesson_NN.py`) used only for
  verification — it is never actually committed to the repo, only its
  real, run output gets pasted into the lesson markdown. Within one
  lesson, later Concept Units *modify* that same file (Project Change:
  "modified"); only a new *lesson* starts a new file (Project Change:
  "created"). Scratch verification files are written under the session's
  own temp/scratchpad directory, never inside the repo.
- **Running function cast**, reused verbatim (per the Repetition Rule —
  "retyped unchanged, no re-explanation owed") across later lessons as
  needed: `distance` (1D, L1), `add_vector_to_point`/`subtract_points`
  (L2), `scale_vector` (L3), `dot_product` (L7, 2D), `cross_product` (L8),
  `norm`/2D `distance` (L9), `normalize` (L10), `from_components` (L6),
  `transform_to_global` (L12), `dot3`/`apply_matrix` (L14, 3-component/
  homogeneous versions), `get_column`/`multiply_matrices` (L15),
  `nearly_equal(a, b, tolerance)` (L17 — the standard tolerance-comparison
  helper, expect this to be needed constantly through Section II),
  `is_point_on_line`/`is_point_on_line_tolerant` (L18),
  `classify_turn`/`classify_turn_tolerant` (L19, returns `"left"`/
  `"right"`/`"straight"` — the first function in the curriculum to use
  `if`/`elif`/`else`), `point_on_line(line_point, line_direction, t)`
  (L21 — the parametric-line formula, expect this to be the base every
  future line/ray/curve-shaped primitive builds on), `is_t_on_segment(t)`
  = `0<=t<=1` / `is_t_on_ray(t)` = `t>=0` (L21/22, swappable bounds
  checks), `find_t_for_point`/`is_point_on_segment`/`is_point_on_ray`
  (L21/22), `line_intersection(point1, dir1, point2, dir2)` (L24 — raises
  a real `ZeroDivisionError` on parallel input, deliberately not
  caught/hedged there), `segment_intersection` (L25, guard-clause version
  of L24), `signed_area(a,b,c)`/`orientation(a,b,c)` (L26, numeric
  `1`/`-1`/`0` twin of `classify_turn`), `are_points_collinear(points)`/
  `are_points_collinear_tolerant(points, tolerance)` (L27, first real
  `for` loop), `distance_to_line`/`distance_to_segment` (L28/29).
- **Running example universe is CAD/CAM-flavored** (robot positions, CNC
  machine/work coordinates, cutting tools, rotary-table fixtures), not
  generic math — matches the BRD's actual stated purpose (learner wants to
  build a CAD/CAM system). Keep using this flavor for new examples. Since
  Lesson 14, a running fixture→table(→machine) scenario with concrete
  fixed numbers has recurred across Lessons 14–16 specifically
  (`fixture_x_axis_in_table = (0, 1)`, `fixture_y_axis_in_table = (-1,
  0)`, `fixture_origin_in_table = (50, 20)`, `feature_in_fixture(_h) =
  (3, 4[, 1])`, with a second level `table_to_machine_matrix` from Lesson
  15 using origin `(100, 200)`, no rotation) — reuse these exact numbers
  again in any lesson that naturally extends this same chain (e.g. a
  future lesson revisiting numerical error or a third chained frame), so
  results stay directly comparable across lessons without re-deriving.
- **Isolated throwaway labs** (Concept Isolation Rule) are given in full
  only when a lesson introduces a genuinely new *Python construct* —
  `abs()` (L1), `import`/`math.sqrt()` (L9), nested-tuple indexing (L14).
  Most lessons' new material is conceptual/mathematical (built entirely
  from already-covered syntax), in which case the schema's isolation step
  is explicitly and explicitly *noted* as skipped (a one-line "note on
  method" callout), never silently omitted.
- **"Objects and methods used" is often "None."** Most lessons build
  purely from earlier lessons' own functions plus already-covered basic
  syntax — that's expected and correctly documented as "None" each time,
  not a gap. Clarified explicitly starting Lesson 14: this field is
  reserved for *real external* classes/methods (like `math.sqrt`, given
  full treatment in L9) — this curriculum's own hand-authored functions
  (`dot3`, `apply_matrix`, `get_column`, `multiply_matrices`, etc.) are
  never listed here; they get full/reuse treatment in each Concept Unit's
  own Mechanical Walkthrough instead, per the Repetition Rule.
- **Every lesson's "What Breaks Without This" closing uses a real, verified
  failure**, deliberately varied in kind across lessons so far: silent
  wrong tuple (several), a real crash with full traceback
  (`ZeroDivisionError`), a silently mirrored/wrong geometric result, a
  negated/backwards vector, an empty-tuple disaster from negative
  sequence-repetition, a homogeneous-`0` direction vs. a homogeneous-`1`
  point (L14), a silently wrong matrix-multiplication order (L15), and a
  silently wrong "identity" from applying an inverse-building shortcut
  outside the property it depends on (L16).
- **Forward references** always cite the exact lesson number *and* title
  from `graphcs.brd.md`'s own TOC — never a guessed or approximate one.
- **Step ordering within a Concept Unit, starting Lesson 14**: per
  `LESSON SCHEMA.md`'s own "for lessons written from this point forward"
  guidance, the isolated lab (when one is needed) is now placed *after*
  Project Change/New Code/Updated Project, not before — see the real
  project code first, then relate the isolated lab back to it explicitly
  ("this is exactly what `X` above is doing, isolated"). When a lab is
  given, the concept's name is stated in bold plainly, right after the
  real output. Lessons 1–13 used the older isolate-before-build order and
  are correctly left as-is (the schema explicitly says not to revise
  them). Apply the new order to every lesson from here forward.

## Next after Lesson 38

Lesson 39, Sweep-Line Algorithms, is next (confirmed title from
`graphcs.brd.md`, see Section II list above). No lesson is currently
in-flight — Lesson 38 is fully written and verified, and Lesson 39 has
not been started or designed yet.

Lesson 39 is likely a real inflection point in this curriculum's own
style: every algorithm since Lesson 24 has been either a closed-form
formula or an exhaustive "check every pairing" approach (L36's nested
loop is the clearest example, `O(edges_a × edges_b)`). A genuine
sweep-line algorithm processes events in *sorted* order — which means
this is a very plausible place for `sorted()` or `list.sort()` to need
first-appearance treatment (neither used yet), the same way `.append`
and `while` got real treatment in L38. Don't assume this without
confirming against `graphcs.brd.md`'s own one-line description for L39
first. Reuse candidates once sorting exists: `segment_intersection`
(L25) is still the right per-pair test; the new material is *which
pairs* get checked (only ones currently active in the sweep), not the
geometry itself.

Full running polygon/hull toolkit, all reusable verbatim: `polygon` =
`list` of vertex tuples; `get_edge`/`get_vertex` (wraparound, via
`%`/`len`, L33/37); `polygon_perimeter` (accumulator-loop template);
`polygon_signed_area`/`polygon_orientation` (L34, shoelace formula);
`count_ray_crossings`/`is_point_in_polygon` (L35);
`count_boundary_intersections`/`polygons_intersect` (L36, nested-loop
template); `is_polygon_convex` (L37); `find_leftmost_point`/
`find_next_hull_point`/`convex_hull` (L38, gift wrapping, `.append`/
`while` now fully taught and reusable without re-explanation).

## Judgment calls made so far (for consistency, not re-litigation)

- Kept the whole curriculum in 2D throughout Section I even though the BRD
  doesn't explicitly say so — 3D doesn't start until Section III (Lesson
  46, "3D Coordinate Frames"). This has been consistent and shouldn't
  change until Lesson 46 actually arrives.
- When a Concept Unit's new material is a modeling idea rather than a
  language construct, the Concept Isolation Rule's throwaway-lab step is
  explicitly noted as not applicable (a one-line callout), rather than a
  lab being invented just to satisfy the letter of the rule.
- Deliberately avoided `if`/`else`, comprehensions, and classes throughout
  Lessons 1–16, treating them as still "not yet assumed" — if a lesson
  ahead genuinely needs one of these, it must get full first-appearance
  treatment (possibly its own Concept Unit) the way `import` did in
  Lesson 9, not a silent shortcut.
- Matrices are represented throughout as plain nested tuples of ints (row-
  major: `matrix[i]` is a whole row), never any dedicated matrix type or
  library (no NumPy) — matches the curriculum's whole-program pattern of
  building every operation from scratch on plain tuples, and keeps
  `apply_matrix`'s row-based indexing and `get_column`'s cross-row
  reading both teachable as plain tuple mechanics.
- Lessons 14–16 chose small, explicit, unrolled helper functions
  (`dot3` called 3 or 9 times by hand) over `for` loops for matrix
  operations, even though loops are assumed background — a style choice
  for consistency with Lessons 1–13's own established pattern, not a
  claim that loops are unavailable. A future lesson facing a genuinely
  large or variable-sized input (unlike this fixed 3×3 case) is free to
  introduce a `for` loop in real project code without owing it a lab
  (already assumed) — just enumerate it in that lesson's Mechanical
  Walkthrough and sort it as (c), same as any other assumed construct.
  Lesson 20 stayed with unrolled explicit calls again (3 fixed corners),
  same reasoning; Section II will likely have its actual first
  well-motivated loop case once a lesson handles a variable-length
  polygon (Lesson 33 onward) rather than a fixed small count.
- Comparison operators (`==`, `<`, `>`) have been used freely since
  roughly Lesson 5 without ever being given their own dedicated
  first-appearance Concept Unit, and this session continued that
  practice through Lessons 14–20 rather than retroactively "fixing" it.
  Reasoning: `bool` is explicitly assumed background, and a comparison
  operator's entire observable behavior is "produces a `bool`" — treated
  as adjacent to assumed baseline knowledge, not a missed concept under
  the Repetition Rule's stricter reading. `if`/`elif`/`else` itself is
  different and *was* explicitly not-assumed, so it received full
  treatment at its first real use, Lesson 19 — see that lesson's own
  Concept Unit 1.
- `if`/`elif`/`else` first appears in real project code in Lesson 19
  (`classify_turn`), the first lesson whose job genuinely couldn't be
  done with a single boolean expression (a 3-way classification, not a
  yes/no). Full first-appearance treatment given there, including an
  isolated lab run three separate times (once per branch) to prove each
  one actually fires and the others don't. Lessons 1–18 all managed
  without it on purpose, not by accident — don't read that as evidence
  branching should keep being avoided now that it's taught; use it
  whenever a lesson's own logic genuinely calls for more than two
  outcomes from one expression.
- Lesson 20, as a closing "workshop" lesson, deliberately introduced zero
  new terms/concepts and zero new Objects/methods — every Concept Unit
  used the schema's "no new construct, note on method" skip and was built
  entirely from reused functions across five earlier lessons, tied
  together into one worked CAD/CAM problem (transform a pocket, verify
  orientation, verify area). If future section-closing "Workshop" lessons
  in the BRD (Lesson 45, 2D Geometry Workshop; likely others) follow the
  same shape, treat pure-synthesis-no-new-concept as the correct,
  intentional pattern for those specifically — not a lesson that's
  somehow incomplete for lacking new Terms.
