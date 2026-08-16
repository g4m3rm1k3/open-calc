# Lesson 47: Rotations About a Principal Axis

**What you will build:** `rotate_z`, `rotate_x`, and `rotate_y` — functions
that turn a 3D point by some angle around one of the three coordinate
axes, using `math.radians`, `math.sin`, and `math.cos` for the first time
in this curriculum. Along the way, this lesson proves that Lesson 14's
`fixture_x_axis_in_table = (0, 1)` and `fixture_y_axis_in_table = (-1, 0)`
were never arbitrary numbers handed to you — they are exactly what
`rotate_z` produces when you turn the table's own standard basis by 90°.
The transferable problem: every rotation this curriculum has used *so
far* has been given to you as finished basis-vector components. This
lesson builds the tool that produces those components from an angle
instead — and, in its closing, shows exactly where that tool stops
working: the moment the axis you want to rotate around isn't one of the
three coordinate axes.

**What you need to know first:** Lesson 46's 3D points and vectors
(`add_vector_to_point_3d`, `subtract_points_3d`, `scale_vector_3d`) and
its own confirmed result that 2D is the `z = 0` special case of 3D.
Lesson 13's tilted-basis result (rotating `(3, 4)` by 90° gives `(-4,
3)`) and Lesson 14's fixture/table scenario
(`fixture_x_axis_in_table = (0, 1)`, `fixture_y_axis_in_table = (-1, 0)`,
`fixture_origin_in_table = (50, 20)`) — both get reproduced here from
first principles rather than handed components. Lesson 17's
`nearly_equal(a, b, tolerance)`.

**Assumed background (outside this curriculum):** unchanged from Lessons
1–46.

**Terms introduced in this lesson:**

- **radian** — the unit of angle that `math.sin`, `math.cos`, and every
  other trigonometric function in this curriculum's toolchain actually
  expect, defined so that one full turn equals `2π` radians instead of
  `360`. It exists because the trigonometric identities these functions
  are built from (their power-series definitions, their derivatives)
  only come out clean in this unit — `sin(x)` and `cos(x)` in *degrees*
  would need an extra conversion constant buried inside every identity.
  CAD/CAM input is naturally in degrees (a 90° table rotation is easier
  to say and dial in than 1.5708 radians), so this lesson needs a real
  conversion step between the unit a machinist thinks in and the unit
  the math actually runs in.
- **right-hand rule** — the sign convention that decides which direction
  counts as a *positive* rotation around a given axis: point your right
  thumb along the positive axis, and your curled fingers show the
  direction a positive angle turns. It exists because "rotate by +90°"
  is ambiguous without a fixed convention — the same 90° could sweep a
  point toward `+y` or toward `-y` depending on which way you decided to
  count. This lesson's own `rotate_z` is built to obey it, and that
  choice is checked directly against a known result below, not just
  asserted.

**Objects and methods used:**

- **`math.radians`**
  - *What it is:* a plain function in Python's standard `math` module —
    not a class, not a method on some object, callable directly once
    `math` is imported.
  - *Implementation:* `math.radians(x) -> float`. Implemented in C, as
    part of CPython's `math` module (a thin wrapper over the C standard
    library's `libm`) rather than as inspectable Python source — there
    is no Python-level function body to fetch and read the way there
    would be for project code. Its documented contract, per Python's own
    standard library reference (`docs.python.org/3/library/math.html`),
    is exactly `x * pi / 180`: multiply the degree value by π, divide by
    180.
  - *Its use:* every angle in this lesson's own functions arrives as
    degrees (matching how a CAD/CAM operator would actually specify a
    table rotation) and gets converted to radians exactly once, right
    before it reaches `math.sin`/`math.cos`.
- **`math.sin`**
  - *What it is:* the standard trigonometric sine function, part of the
    same `math` module.
  - *Implementation:* `math.sin(x) -> float`, `x` in radians, returning
    a value in the closed interval `[-1, 1]`. Same C-implemented,
    libm-wrapping nature as `math.radians` — no Python source body to
    show, so its contract is cited from the official documentation
    rather than reconstructed from memory.
  - *Its use:* one of the two functions this lesson's rotation formulas
    are built from — see the isolated lab and `rotate_z`'s own
    Mechanical Walkthrough below for exactly how.
- **`math.cos`**
  - *What it is:* the standard trigonometric cosine function, same
    module.
  - *Implementation:* `math.cos(x) -> float`, `x` in radians, also
    returning a value in `[-1, 1]`. Same C-implemented nature as the two
    entries above.
  - *Its use:* used alongside `math.sin` in every rotation formula this
    lesson builds — never one without the other.

---

## Concept Unit: Radians — the Unit Rotation Math Actually Runs In

### The Problem

Lesson 14 gave you `fixture_x_axis_in_table = (0, 1)` directly — two
numbers, already computed, standing in for "the fixture is turned 90°
relative to the table." That was fine for one fixed scenario, but a real
CAD/CAM program needs to compute a rotated basis for *any* angle an
operator types in — 15°, 33.7°, -90° — not just the one case someone
happened to work out by hand in advance. The natural unit for that input
is degrees, because that's what a machinist dials into a rotary table.
But Python's trigonometric functions don't take degrees.

### Project Change

- **Reference Source:** No reference counterpart — this is a from-scratch
  addition, because the conversion is a single documented standard-library
  call, not project-specific logic to design.
- **Files affected:** none yet — this unit's own code is throwaway,
  demonstrated in isolation before Concept Unit 2 puts it to real use.
- **Change type:** N/A (isolated lab only).
- **Location:** N/A.
- **Dependencies:** `import math` (the `import` statement itself received
  its own first-appearance treatment back in Lesson 9; reused silently
  here, per the Repetition Rule).

### The New Code

```python
import math

for deg in (0, 90, 180, 360):
    print(deg, "degrees ->", math.radians(deg), "radians")
```

### Run It — Real Output

Running the loop above prints:

```
0 degrees -> 0.0 radians
90 degrees -> 1.5707963267948966 radians
180 degrees -> 3.141592653589793 radians
360 degrees -> 6.283185307179586 radians
```

This is `math.radians`, a real standard-library function, run for the
first time in this curriculum. What the output proves: `0°` maps to `0`
exactly, `180°` maps to `3.141592653589793` — Python's own `float`
approximation of `π` — and `360°` maps to `2π` (`6.283185307179586`,
double the `180°` row, matching floating-point roundoff exactly). This
confirms the documented formula (`x * π / 180`) rather than just trusting
the name: a full turn is `2π` **radians**, the same way it's `360`
degrees — two different rulers measuring the identical rotation.

This throwaway loop is now discarded — it doesn't appear in the project
again. Its only purpose was proving `math.radians` does what its
documentation says before trusting it inside real project code.

---

## Concept Unit: Decomposing a Rotation with Sine and Cosine

### The Problem

Rotating a 2D point by an angle needs to turn one pair of coordinates
into a new pair, and the amount of turn has to depend smoothly on the
angle — a 1° rotation should barely move a point; a 90° rotation should
move it a quarter of the way around a circle centered on the rotation
axis. Some function has to convert "how far around a circle" into "how
much of each coordinate axis this point ends up using." That's exactly
what `math.sin` and `math.cos` are for, and neither one alone is enough:
building a full 2D rotation needs both, used together.

### Project Change

- **Reference Source:** No reference counterpart — this is a from-scratch
  addition. The rotation-about-an-axis formula below is standard
  textbook trigonometry, not ported from a specific reference
  implementation.
- **Files affected:**
  `src/docs/tutorials/Graphics/geometry_verified_library.py` (new
  section appended, `rotate_z` added).
- **Change type:** add.
- **Location:** new section after Lesson 46's 3D-extension functions.
- **Dependencies:** `math.radians` (Concept Unit 1, above), Lesson 46's
  3-tuple point representation.

### The New Code

```python
def rotate_z(point, theta_degrees):
    x, y, z = point
    theta = math.radians(theta_degrees)
    x_new = x * math.cos(theta) - y * math.sin(theta)
    y_new = x * math.sin(theta) + y * math.cos(theta)
    return (x_new, y_new, z)
```

### The Updated Project

This is a brand-new, freestanding function — nothing surrounding it yet
to show it placed inside (per the schema's own exception: "a brand-new
file or a freestanding new function"). `geometry_verified_library.py`
now has this function sitting directly after Lesson 46's
`from_components_3d`, ready for any later lesson to reuse unchanged.

### Isolated Example, Anchored to the Code Just Shown

Before trusting `rotate_z` on an arbitrary point, run `math.sin` and
`math.cos` alone — the two calls inside the `x_new`/`y_new` lines above —
against angles whose answers are already known from the unit circle:

```python
for deg in (0, 90, 180, 270):
    t = math.radians(deg)
    print(deg, "deg -> sin", math.sin(t), "cos", math.cos(t))
```

Real output:

```
0 deg -> sin 0.0 cos 1.0
90 deg -> sin 1.0 cos 6.123233995736766e-17
180 deg -> sin 1.2246467991473532e-16 cos -1.0
270 deg -> sin -1.0 cos -1.8369701987210297e-16
```

This is exactly what `x_new = x * math.cos(theta) - y * math.sin(theta)`
and `y_new = x * math.sin(theta) + y * math.cos(theta)` above are built
from. What the output proves: at `0°`, `cos = 1` and `sin = 0`, so
`rotate_z` would leave `x` and `y` completely unchanged — no rotation,
correct for a zero angle. At `90°`, `cos` collapses to
`6.123233995736766e-17` — not exactly `0`, because `π/2` itself is only
a `float` approximation of the true irrational value, and `cos` of that
approximation is not exactly zero either; this is the same category of
floating-point noise Lesson 17 already gave a name and a tool
(`nearly_equal`) for, reappearing here in a new context. `sin` at `90°`
is exactly `1.0`, meaning a `90°` rotation should swap almost all of
`x`'s contribution into `y`. This throwaway loop is now discarded; it
proved the two raw ingredients behave as expected before trusting the
combined formula above.

### Mechanical Walkthrough

Enumerating every distinct syntactic element of `rotate_z`'s body, in
order:

- `x, y, z = point` — **(c) already basic.** Tuple unpacking, established
  since Lesson 46's own 3-component functions.
- `math.radians(theta_degrees)` — **(a) first appearance**, given full
  treatment in Concept Unit 1 and the Header above: converts the
  caller's degree input into the radians `math.sin`/`math.cos` require.
- `math.cos(theta)` (in the `x_new` line) — **(a) first appearance**,
  given full treatment in this unit's Header entry and isolated example.
  Returns how much of the *original* `x` survives into the new `x`,
  shrinking toward `0` as `theta` approaches `90°`.
- `x * math.cos(theta)` — **(c) already basic.** Ordinary multiplication,
  used throughout this curriculum since Lesson 3.
- `math.sin(theta)` (in the `x_new` line) — **(a) first appearance**,
  same Header entry as `math.cos` above. Returns how much of `y` needs
  to be *subtracted* out of the new `x` — this is the term responsible
  for `x` "losing ground" to `y` as the rotation increases.
- `y * math.sin(theta)` — **(c) already basic**, ordinary multiplication.
- `x * math.cos(theta) - y * math.sin(theta)` — **(a) first appearance**
  as a *pattern*, even though each piece was just covered individually:
  this specific combination — cosine term minus sine term — is the
  standard 2D rotation formula for one output coordinate, and it's worth
  naming as its own recognizable shape, not just two multiplications and
  a subtraction. The mirror-image line below (`x_new`'s sine term
  *added*, not subtracted) is what actually encodes the right-hand-rule
  sign convention from the Header's Terms Introduced: swapping that sign
  would rotate points the opposite direction around `z`, which the
  verification immediately below rules out.
- `x * math.sin(theta) + y * math.cos(theta)` — **(b) hard concept
  reappearing.** The same rotation-formula pattern as the `x_new` line,
  with sine and cosine's roles swapped and the sign flipped from minus to
  plus — this is not a coincidence or a typo risk to memorize separately;
  it's the general two-output-coordinate shape of a 2D rotation, applied
  to `y` the same way the line above applied it to `x`.
- `return (x_new, y_new, z)` — **(c) already basic.** Tuple construction,
  reused since Lesson 1. The genuinely new part isn't the syntax, it's
  what's *in* the third slot: `z`, completely untouched by any of the
  math above — proof that rotating around the `z`-axis, by definition,
  never moves anything along `z`.

### Real Verification

```python
print(rotate_z((1, 0, 0), 90))
print(rotate_z((0, 1, 0), 90))
print(rotate_z((3, 4, 5), 0))
```

Real output:

```
(6.123233995736766e-17, 1.0, 0)
(-1.0, 6.123233995736766e-17, 0)
(3.0, 4.0, 5)
```

`rotate_z((1, 0, 0), 90)` comes back `(≈0, 1, 0)` — the point that was
sitting on `+x` is now sitting on `+y`, confirming the right-hand-rule
convention from the Header: looking down the `+z` axis toward the
origin, a positive rotation sweeps `+x` toward `+y`, not toward `-y`.
`rotate_z((0, 1, 0), 90)` comes back `(-1, ≈0, 0)`, continuing that same
sweep one more quarter-turn. `rotate_z((3, 4, 5), 0)` returns `(3, 4,
5)` completely unchanged — a `0°` rotation is the identity, exactly as
the isolated `sin`/`cos` lab above predicted.

Now the callback promised in this lesson's own "What you will build":
Lesson 14 handed you `fixture_x_axis_in_table = (0, 1)` and
`fixture_y_axis_in_table = (-1, 0)` as given numbers. Compute them
instead, from the table's own plain standard basis, using nothing but
`rotate_z`:

```python
print(rotate_z((1, 0, 0), 90))
print(rotate_z((0, 1, 0), 90))
```

Real output (rerun of the same two calls above, read against Lesson
14's specific numbers this time):

```
(6.123233995736766e-17, 1.0, 0)   vs fixture_x_axis_in_table = (0, 1)
(-1.0, 6.123233995736766e-17, 0)  vs fixture_y_axis_in_table = (-1, 0)
```

Dropping each result's `z = 0` (Lesson 46's own confirmed 2D-is-`z=0`
collapse) and rounding away the `6.1e-17` floating-point noise
(`nearly_equal`-scale, not a real discrepancy) leaves exactly `(0, 1)`
and `(-1, 0)` — Lesson 14's fixture basis was a 90° rotation the entire
time. That lesson simply started you with the answer already computed;
this lesson builds the machine that computes it for any angle, not just
90°.

### CS Lens

A rotation is a **rigid transformation** (also called an *isometry*): a
transformation that preserves distance between every pair of points it's
applied to, and preserves angles between vectors. `rotate_z` never
stretches, shrinks, or skews anything — it only repositions. This is a
hard concept worth recognizing outside this one function:

```
Also recognized in: robot-arm joint kinematics, 3D graphics camera
orbiting, spacecraft attitude control, molecular-structure viewers,
CNC 4th/5th-axis rotary tables
```

That last one is the direct CAD/CAM instance: a rotary table on a
5-axis mill is a physical `rotate_z` (or `rotate_x`/`rotate_y`) — the
workpiece's shape and every distance within it stays fixed; only its
orientation relative to the cutting tool changes.

### SE Lens

The alternative not chosen here: hand-write a lookup table of
precomputed rotated-basis pairs for a handful of "common" angles
(0°, 90°, 180°, 270°) the way Lesson 14 effectively did for one specific
case, and fall back to something else for anything in between. That
avoids `math.sin`/`math.cos` entirely for the common cases, but breaks
the moment a real angle — 33.7°, say — shows up, which any real CAD/CAM
input eventually will. `rotate_z`'s formula costs two trig calls and a
few multiplications per point, working identically for *every* angle,
common or not — the real engineering tradeoff is a small, constant
per-call cost against never having to special-case an input again. The
debt this project is currently carrying: Lesson 46 already showed that
scaling a 3D point with the old 2D `scale_vector` silently drops the `z`
component instead of erroring; `rotate_z` has the same shape of risk —
nothing stops a caller from passing a point with a `z` value they
*meant* to rotate too, using the wrong function, and getting a
plausible-looking but wrong answer back. This isn't fixed here; it's the
same category of honestly disclosed limitation Lesson 46 closed on, not
a bug being introduced silently.

### Connecting Sentence

`rotate_z` turns any 3D point around the vertical axis by any angle in
degrees, and just proved that Lesson 14's specific fixture numbers were
always a special case of it — the next step is finding out whether the
same formula, permuted onto the other two axes, is as free an extension
as Lesson 46's translation functions were.

---

## Extending the Pattern: `rotate_x` and `rotate_y`

**A note on method:** this section introduces no new *concept* — the
Concept Isolation Rule's own lab requirement is explicitly skipped here,
per the Repetition Rule, because `math.radians`, `math.sin`, and
`math.cos` all already received full first-appearance treatment in the
two Concept Units above. What's new is not a construct but a pattern:
the same rotation formula, applied to a different pair of coordinates.

### Project Change

- **Reference Source:** No reference counterpart — from-scratch,
  following the same cyclic pattern as `rotate_z` above.
- **Files affected:**
  `src/docs/tutorials/Graphics/geometry_verified_library.py`.
- **Change type:** add.
- **Location:** directly after `rotate_z` in the same new section.
- **Dependencies:** `rotate_z`'s own already-verified formula shape.

### The New Code

```python
def rotate_x(point, theta_degrees):
    x, y, z = point
    theta = math.radians(theta_degrees)
    y_new = y * math.cos(theta) - z * math.sin(theta)
    z_new = y * math.sin(theta) + z * math.cos(theta)
    return (x, y_new, z_new)


def rotate_y(point, theta_degrees):
    x, y, z = point
    theta = math.radians(theta_degrees)
    z_new = z * math.cos(theta) - x * math.sin(theta)
    x_new = z * math.sin(theta) + x * math.cos(theta)
    return (x_new, y, z_new)
```

### The Updated Project

Both are brand-new, freestanding functions, same exception as
`rotate_z` above. `geometry_verified_library.py` now carries all three
— `rotate_z`, `rotate_x`, `rotate_y` — as a matched set in its
"L47: rotation about a principal axis" section.

### Mechanical Walkthrough

Every line in both functions is either **(c) already basic** (the tuple
unpacking, the `math.radians` call, the multiplications, the final
`return`) or a repeat of the exact **(b) hard concept** already named
above — the cosine-minus-sine / sine-plus-cosine rotation-formula shape.
The only genuinely new thing to check is *which* two coordinates each
function touches, and in what order:

- `rotate_z` leaves `z` fixed, rotates `(x, y)`.
- `rotate_x` leaves `x` fixed, rotates `(y, z)`.
- `rotate_y` leaves `y` fixed, rotates `(z, x)` — note the order:
  `z` first, then `x`, not `x` then `z`.

That ordering is not arbitrary. Writing the three axes in a fixed cycle
— `x → y → z → x` — each function rotates the pair that comes
*immediately after* its own fixed axis in that cycle: `rotate_x` fixes
`x`, rotates the next pair `(y, z)`; `rotate_y` fixes `y`, rotates the
next pair `(z, x)`; `rotate_z` fixes `z`, rotates the next pair `(x,
y)`, back around to the start. Breaking that cycle — writing `rotate_y`
as rotating `(x, z)` instead of `(z, x)` — would flip the sign of every
rotation around `y`, silently violating the right-hand-rule convention
`rotate_z` was already checked against.

### Real Verification

```python
print(rotate_x((0, 1, 0), 90))
print(rotate_y((0, 0, 1), 90))
```

Real output:

```
(0, 6.123233995736766e-17, 1.0)
(1.0, 0, 6.123233995736766e-17)
```

`rotate_x((0, 1, 0), 90)` carries the point sitting on `+y` around to
`+z` — the same cyclic step `rotate_z` took from `+x` to `+y`, now one
axis further around. `rotate_y((0, 0, 1), 90)` closes the cycle,
carrying `+z` back around to `+x`. Three functions, one shared formula,
each one confirming the same right-hand-rule direction on a different
pair of axes.

### Connecting Sentence

Three principal-axis rotations now exist, each a straightforward
permutation of the same formula — extending `rotate_z` to `rotate_x` and
`rotate_y` cost nothing but relabeling which coordinates play which
role, the same "extension is free" result Lesson 46 already proved for
plain point/vector arithmetic. The next question is whether that same
freedom holds for an axis that isn't `x`, `y`, or `z`.

---

## Closing

### Connect the Pieces

Trace `(3, 4, 0)` — the exact fixture-feature vector Lessons 14–16 used
repeatedly — through a single `rotate_z` call:

```python
print(rotate_z((3, 4, 0), 90))
```

Real output:

```
(-4.0, 3.0000000000000004, 0)
```

Rounding away the trailing floating-point noise, this is `(-4, 3, 0)` —
which, dropping the `z = 0`, is exactly `(-4, 3)`: Lesson 13's own
tilted-basis result for the identical `(3, 4)` vector. Lesson 13 built
that number by projecting onto a hand-specified tilted basis
(`fixture_x_axis_in_table = (0, 1)`, `fixture_y_axis_in_table = (-1,
0)`); this lesson reaches the same number by rotating the plain vector
directly by the one angle (`90°`) that basis represents. Two different
routes, proven to land on the same answer — which is only possible
because that basis genuinely *was* a 90° rotation, not a coincidence of
matching numbers.

### What Breaks Without This

`rotate_x`, `rotate_y`, and `rotate_z` only ever rotate around one of
the three coordinate axes. A real rotation axis chosen by a CAD/CAM
operator — the long edge of an angled fixture, say — is essentially
never conveniently aligned with `x`, `y`, or `z`. It's tempting to fake
an arbitrary axis by composing two of these functions in sequence. Try
it against the diagonal axis running through `(1/√2, 1/√2, 0)`
(normalized `(1, 1, 0)`) — a genuine rotation around that specific axis
must leave any point that already sits *on* the axis completely fixed,
the same way `rotate_z` left `(0, 0, 5)` untouched at every angle:

```python
axis_point = (1 / math.sqrt(2), 1 / math.sqrt(2), 0)
print("axis_point =", axis_point)
faked = rotate_z(rotate_x(axis_point, 40), 40)
print("rotate_z(rotate_x(axis_point, 40), 40) =", faked)
```

Real output:

```
axis_point = (0.7071067811865475, 0.7071067811865475, 0)
rotate_z(rotate_x(axis_point, 40), 40) = (0.1934931002596924, 0.8694667702498038, 0.4545194776720436)
```

If `rotate_x` then `rotate_z` were secretly equivalent to one true
rotation around `axis_point`'s own diagonal axis, feeding that exact
point back in would have to return it unchanged — a point sitting on a
rotation axis never moves. Instead it lands at `(0.19…, 0.87…,
0.45…)` — not close to `axis_point` by any margin `nearly_equal` would
forgive, and it even picked up a nonzero `z`, which no combination of
`z`-fixing and `x`-fixing rotations should ever be able to produce from
a point that started with `z = 0`. This is a real, verified, silently
wrong geometric result: the composition runs without error and returns
a plausible-looking 3D point, and nothing about the output alone reveals
that it isn't the rotation it appears to represent. Composing
principal-axis rotations is a genuinely useful tool — Lesson 49 (Euler
Angles) builds directly on exactly this composition — but it is not the
same operation as rotating around one arbitrary chosen axis directly,
and this lesson's own three functions have no way to do that. Lesson 51
(Axis-Angle Representation) is where a function that takes an arbitrary
axis directly gets built.

### Exercises

- Confirm `rotate_x` is its own reverse at `-90°`: run
  `rotate_x((0, 0, 1), -90)` and check it returns `(0, 1, 0)`, undoing
  what `rotate_x((0, 1, 0), 90)` did above (real output:
  `(0, 1.0, 6.123233995736766e-17)` — round the noise term away and
  confirm it against `(0, 1, 0)` yourself).
- Confirm four `90°` rotations return a point to its start: apply
  `rotate_z(..., 90)` to `(3, 4, 0)` four times in a row and check the
  fourth result matches the original point (allow for the same kind of
  floating-point noise seen throughout this lesson — use
  `nearly_equal`, not `==`, the same way Lesson 17 already established).
- Pick any point with a nonzero `z`, run it through `rotate_z` at any
  angle, and confirm its `z` component never changes — the same
  fixed-axis property demonstrated on `(3, 4, 5)` above, on a value of
  your own choosing.

### Definition of Done

- [ ] `rotate_z`, `rotate_x`, and `rotate_y` all exist in
      `geometry_verified_library.py`, each verified against a
      known-correct rotation of a standard basis point.
- [ ] `rotate_z((1, 0, 0), 90)` reproduces `fixture_x_axis_in_table`
      and `rotate_z((0, 1, 0), 90)` reproduces `fixture_y_axis_in_table`
      from Lesson 14, confirming that basis was a 90° rotation.
- [ ] `rotate_z((3, 4, 0), 90)` reproduces Lesson 13's `(-4, 3)` result.
- [ ] The arbitrary-axis composition failure above has been run and its
      real output confirmed non-matching, not just asserted.
- [ ] Commit with a message stating *why*: principal-axis rotation is
      now available for any angle, not just the one 90° case earlier
      lessons had to work with directly — and the same commit message
      should note what still can't be done yet (arbitrary-axis rotation)
      so the next lesson's starting point is honest about the gap.
