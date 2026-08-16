# Lesson 48: Rotation Matrices

**What you will build:** `rotation_matrix_z`, `rotation_matrix_x`, and
`rotation_matrix_y` — the same three rotations Lesson 47 built as
formulas, now packaged as literal 3×3 matrices, reusing Lesson 14–16's
`dot3`, `apply_matrix`, `multiply_matrices`, and `get_column`
**completely unchanged**. Along the way, this lesson proves a fact about
`apply_matrix` that was true the entire time but never stated: a
matrix's own columns are exactly where it sends the standard basis
vectors. The transferable problem: composing two rotations by nesting
function calls, the way Lesson 47's closing did
(`rotate_z(rotate_x(p, 40), 40)`), works, but doesn't scale — there's no
way to store "rotate_x then rotate_z" as a single reusable value. This
lesson shows that `multiply_matrices` already *is* that storable,
reusable composition, and then proves something Lesson 47 never had a
way to show: composing two rotations about **different** axes does not
commute — order changes the result — which is the exact problem Lesson
49 (Euler Angles) has to manage on purpose and Lesson 50 (Gimbal Lock)
shows going wrong.

**What you need to know first:** Lesson 14's `dot3` and `apply_matrix`,
Lesson 15's `get_column` and `multiply_matrices`, Lesson 16's matrix
inverse via the transpose trick (not reused directly here, but the same
matrix representation). Lesson 47's `rotate_z`, `rotate_x`, `rotate_y`
and their own verified outputs, which this lesson checks its matrices
against directly. Lesson 17's `nearly_equal`.

**Assumed background (outside this curriculum):** unchanged from Lessons
1–47.

**Terms introduced in this lesson:**

- **rotation matrix** — a 3×3 matrix built so that applying it to a
  point produces exactly the same result as one of Lesson 47's rotation
  formulas. It exists because a formula (`rotate_z`) is a fixed piece of
  Python code you can only *call*, while a matrix is a plain value you
  can store, pass around, and — critically for this lesson — combine
  with another matrix using ordinary matrix multiplication, all before
  ever applying it to a point.
- **commutative operation** — an operation where swapping the order of
  its two operands doesn't change the result (`3 + 5` equals `5 + 3`).
  It exists as a term here because this lesson's own closing shows
  rotation composition is a real, common counterexample: an operation
  a reader might reasonably *assume* is commutative, by analogy with
  ordinary addition, and isn't — always in general, though this lesson
  also shows one specific case where it happens to hold.

**Objects and methods used:**

None new. `dot3`, `apply_matrix`, `get_column`, and `multiply_matrices`
are all real, external-to-this-lesson project code, already given full
first-appearance treatment in Lessons 14–15 — reused here completely
unchanged, per the Repetition Rule, with no new Objects/methods entry
owed. `math.radians`, `math.sin`, and `math.cos` reappear from Lesson 47
the same way.

---

## Concept Unit: A Matrix's Columns Are Where the Basis Vectors Land

### The Problem

Lesson 14 built `apply_matrix` to turn a hand-picked matrix — one
already containing a fixture's translation and rotation, worked out in
advance — into a transformed point. This lesson needs the reverse
direction: given a rotation `rotate_z` already computes correctly, *what
matrix, plugged into that same `apply_matrix`, produces the identical
result?* Answering that requires knowing something about `apply_matrix`
that was true all along but never had to be stated explicitly: what,
exactly, does a matrix's own internal layout mean, in terms of what it
does to a point?

### Project Change

- **Reference Source:** No reference counterpart — this is a from-scratch
  addition; the column-as-basis-image relationship follows directly from
  `apply_matrix`'s own already-shipped definition (Lesson 14), not from
  any new project file.
- **Files affected:** none yet — this unit's own code is throwaway,
  run directly against the existing `apply_matrix`.
- **Change type:** N/A (isolated lab only).
- **Location:** N/A.
- **Dependencies:** Lesson 14's `dot3`/`apply_matrix`, Lesson 15's
  `get_column`.

### The New Code

```python
M = ((1, 2, 3), (4, 5, 6), (7, 8, 9))
ex = (1, 0, 0)
ey = (0, 1, 0)
ez = (0, 0, 1)
print("apply_matrix(M, ex) =", apply_matrix(M, ex), " vs column 0 =", get_column(M, 0))
print("apply_matrix(M, ey) =", apply_matrix(M, ey), " vs column 1 =", get_column(M, 1))
print("apply_matrix(M, ez) =", apply_matrix(M, ez), " vs column 2 =", get_column(M, 2))
```

### Real Output

Running the three prints above gives:

```
apply_matrix(M, ex) = (1, 4, 7)  vs column 0 = (1, 4, 7)
apply_matrix(M, ey) = (2, 5, 8)  vs column 1 = (2, 5, 8)
apply_matrix(M, ez) = (3, 6, 9)  vs column 2 = (3, 6, 9)
```

What this proves, for an arbitrary matrix `M` with no special structure
at all: `apply_matrix(M, ex)` — feeding in the standard `x`-basis vector
`(1, 0, 0)` — comes back identical to `get_column(M, 0)`, `M`'s own
first column read top to bottom. The same holds for `ey`/column 1 and
`ez`/column 2. This isn't a coincidence of the specific numbers chosen;
it follows directly from `dot3`'s own definition: `dot3(row, (1, 0,
0))` picks out only `row[0]` (everything else multiplies by `0`), so
`apply_matrix(M, ex)` returns `(M[0][0], M[1][0], M[2][0])` — precisely
`M`'s column `0`, by definition of what a column *is* in a row-major
nested tuple. This throwaway example is now discarded; the real
consequence — that a matrix's columns are a complete, readable record of
where it sends each basis vector — is what the next unit builds
`rotation_matrix_z` from.

### CS Lens

Any matrix, read this way, is fully determined by three vectors: where
it sends `(1, 0, 0)`, where it sends `(0, 1, 0)`, and where it sends
`(0, 0, 1)`. This is the same **basis-vector idea Lesson 6 already
taught for coordinate frames** (a frame is fully determined by its
origin and its axis vectors) — reappearing here in a new, related shape:
a matrix's columns *are* a coordinate frame's axis vectors, with no
separate origin, because a plain (non-homogeneous) matrix can only
rotate and scale, never translate.

### Connecting Sentence

Knowing that a matrix's columns are literally "where do the basis
vectors go" turns building `rotation_matrix_z` from a guess into a
direct lookup: run `rotate_z` on each of the three standard basis
vectors, and those three results *are* the matrix's three columns.

---

## Concept Unit: Building `rotation_matrix_z` From What `rotate_z` Already Proved

### The Problem

Lesson 47 already computed, and verified, exactly where `rotate_z`
sends each standard basis vector — that work doesn't need to be redone,
only repackaged. `rotate_z((1, 0, 0), theta)` returns `(cos θ, sin θ,
0)`; `rotate_z((0, 1, 0), theta)` returns `(-sin θ, cos θ, 0)`;
`rotate_z((0, 0, 1), theta)` returns `(0, 0, 1)` unchanged (Lesson 47's
own closing already showed `z` never moves under `rotate_z`). Per the
previous unit, those three results are supposed to become the matrix's
three columns.

### Project Change

- **Reference Source:** No reference counterpart — from-scratch, derived
  directly from Lesson 47's own already-verified `rotate_z` outputs.
- **Files affected:**
  `src/docs/tutorials/Graphics/geometry_verified_library.py` (new
  section appended after Lesson 47's rotation functions).
- **Change type:** add.
- **Location:** new section, `# ── L48: rotation matrices ──`.
- **Dependencies:** `math.radians`, `math.sin`, `math.cos` (Lesson 47),
  `apply_matrix` (Lesson 14).

### The New Code

```python
def rotation_matrix_z(theta_degrees):
    theta = math.radians(theta_degrees)
    c = math.cos(theta)
    s = math.sin(theta)
    return ((c, -s, 0), (s, c, 0), (0, 0, 1))
```

### The Updated Project

A brand-new, freestanding function — nothing surrounding it yet to show
it placed inside, per the schema's own stated exception.
`geometry_verified_library.py` now carries `rotation_matrix_z` directly
after Lesson 47's `rotate_y`.

### Mechanical Walkthrough

- `math.radians(theta_degrees)`, `math.cos(theta)`, `math.sin(theta)` —
  **(b) hard concept reappearing.** Full first-appearance treatment
  already given in Lesson 47; this is the same conversion-and-decompose
  pattern applied again, not new syntax.
- `c`, `s` — **(c) already basic.** Plain variable assignment, used to
  avoid repeating the same `math.cos`/`math.sin` call three times
  across the matrix's rows.
- `((c, -s, 0), (s, c, 0), (0, 0, 1))` — **(a) first appearance.** This
  is a literal 3×3 matrix, written directly as a tuple of three
  row-tuples — the same row-major shape Lesson 14 established, but this
  is the first time this curriculum has *constructed* one from a
  formula rather than being handed its numbers already worked out.
  Reading it by column, per this lesson's first Concept Unit: column 0
  is `(c, s, 0)` — exactly `rotate_z((1, 0, 0), theta)`'s own output.
  Column 1 is `(-s, c, 0)` — exactly `rotate_z((0, 1, 0), theta)`.
  Column 2 is `(0, 0, 1)` — exactly `rotate_z((0, 0, 1), theta)`,
  confirming `z` stays fixed here too.

### Real Verification

Confirm `apply_matrix(rotation_matrix_z(theta), point)` reproduces
`rotate_z(point, theta)` exactly — not for one convenient case, but
across several distinct points and angles, including one on each axis
and two off-axis points, at angles including one full 271° turn:

```python
test_points = [(1, 0, 0), (0, 1, 0), (3, 4, 5), (2, -1, 7)]
test_angles = [0, 30, 90, 180, 271]
for p in test_points:
    for a in test_angles:
        via_matrix = apply_matrix(rotation_matrix_z(a), p)
        via_formula = rotate_z(p, a)
        print(p, a, "->", via_matrix, "vs", via_formula)
```

Real output (20 point/angle combinations; four shown, the rest matched
identically):

```
(1, 0, 0) 90 -> (6.123233995736766e-17, 1.0, 0) vs (6.123233995736766e-17, 1.0, 0)
(3, 4, 5) 90 -> (-4.0, 3.0000000000000004, 5) vs (-4.0, 3.0000000000000004, 5)
(2, -1, 7) 30 -> (2.232050807568877, 0.13397459621556118, 7) vs (2.232050807568877, 0.13397459621556118, 7)
(2, -1, 7) 271 -> (-0.964942882281825, -2.0171477967500655, 7) vs (-0.964942882281825, -2.0171477967500655, 7)
```

All 20 combinations came back identical between the matrix route and
Lesson 47's own formula, down to the same floating-point digits — this
isn't an approximation of `rotate_z`, it's the identical arithmetic,
just reached by `apply_matrix`'s general dot-product machinery instead
of `rotate_z`'s own hand-written `x_new`/`y_new` lines. That machinery
was never written with rotation in mind at all — Lesson 14 built it for
homogeneous 2D transforms — and it reproduces a completely different
kind of transform correctly anyway, for the exact reason the CS Lens
above already named: any matrix is fully determined by its columns, and
`rotation_matrix_z` supplies the right ones.

### Connecting Sentence

`rotation_matrix_z` is a matrix that behaves exactly like `rotate_z`;
the same construction, cycled onto the other two axes, gives the whole
principal-axis set as matrices.

---

## Extending the Pattern: `rotation_matrix_x` and `rotation_matrix_y`

**A note on method:** no new concept here, same as Lesson 47's own
`rotate_x`/`rotate_y` extension — `math.radians`/`sin`/`cos` and the
column-reading approach both already received full treatment above. The
Concept Isolation Rule's lab is skipped per the Repetition Rule.

### Project Change

- **Reference Source:** No reference counterpart — from-scratch, same
  cyclic derivation as `rotation_matrix_z` above, read off of Lesson
  47's already-verified `rotate_x`/`rotate_y` outputs.
- **Files affected:**
  `src/docs/tutorials/Graphics/geometry_verified_library.py`.
- **Change type:** add.
- **Location:** directly after `rotation_matrix_z` in the same section.
- **Dependencies:** `rotation_matrix_z`'s own already-verified shape.

### The New Code

```python
def rotation_matrix_x(theta_degrees):
    theta = math.radians(theta_degrees)
    c = math.cos(theta)
    s = math.sin(theta)
    return ((1, 0, 0), (0, c, -s), (0, s, c))


def rotation_matrix_y(theta_degrees):
    theta = math.radians(theta_degrees)
    c = math.cos(theta)
    s = math.sin(theta)
    return ((c, 0, s), (0, 1, 0), (-s, 0, c))
```

### The Updated Project

Both brand-new, freestanding functions, same exception as
`rotation_matrix_z` above. `geometry_verified_library.py`'s
"L48: rotation matrices" section now carries all three as a matched set,
directly beneath Lesson 47's matching `rotate_x`/`rotate_y`/`rotate_z`.

### Mechanical Walkthrough

Same enumeration shape as `rotation_matrix_z` above — **(c)** the
variable assignments, **(b)** the reappearing `math.radians`/`sin`/`cos`
calls, **(a)** each matrix literal as a first-appearing construction.
The one thing worth checking explicitly, since Lesson 47 already flagged
it as easy to get backwards: `rotation_matrix_x`'s column 0 is `(1, 0,
0)` — the identity, `x` untouched, matching `rotate_x`'s own promise to
leave `x` fixed — and its non-identity block sits in the `(y, z)`
rows/columns, not `(x, y)`. `rotation_matrix_y`'s non-identity block
lands in `(z, x)` — column 0 is `(c, 0, -s)`, column 2 is `(s, 0, c)` —
the same `z`-before-`x` cyclic ordering Lesson 47 already established
for `rotate_y`, not the more intuitive-looking `(x, z)`.

### Real Verification

The same point/angle sweep from `rotation_matrix_z`'s own verification,
run again for both new matrices against `rotate_x`/`rotate_y`:

```python
all_match_xy = True
for p in test_points:
    for a in test_angles:
        vx_m = apply_matrix(rotation_matrix_x(a), p)
        vx_f = rotate_x(p, a)
        vy_m = apply_matrix(rotation_matrix_y(a), p)
        vy_f = rotate_y(p, a)
        ok_x = all(nearly_equal(vx_m[i], vx_f[i], 1e-9) for i in range(3))
        ok_y = all(nearly_equal(vy_m[i], vy_f[i], 1e-9) for i in range(3))
        if not (ok_x and ok_y):
            all_match_xy = False
print("ALL MATCH (x,y):", all_match_xy)
```

Real output:

```
ALL MATCH (x,y): True
```

Every one of the 20 point/angle combinations matched, within
`nearly_equal`'s tolerance, for both `rotation_matrix_x` against
`rotate_x` and `rotation_matrix_y` against `rotate_y` — this loop
mirrors `rotation_matrix_z`'s own individually-printed verification
above, collapsed into one pass/fail check rather than printing all 20
lines a second time, now that the individual-line format has already
been shown once. Three formulas from Lesson 47 now have three matrix
equivalents, independently verified, not merely assumed to follow the
same pattern.

### Connecting Sentence

Three rotation matrices now exist, each interchangeable with its Lesson
47 formula counterpart — the next question is what happens when two of
them need to apply to the same point, one after the other.

---

## Concept Unit: Composing Rotations With `multiply_matrices`

### The Problem

Lesson 47's closing composed two rotations by nesting function calls —
`rotate_z(rotate_x(p, 40), 40)` — which works, but produces only a
single transformed point. There's no way to hand that composed
*rotation itself* to something else, store it, or inspect it, without
re-running both functions on a new point every time. `multiply_matrices`
already exists (Lesson 15) and multiplies two matrices into one new
matrix — the question is whether multiplying two rotation matrices
produces a matrix equivalent to the nested function calls, and if so, in
which order.

### Project Change

- **Reference Source:** No reference counterpart — this unit verifies an
  existing function (`multiply_matrices`) against a new kind of input
  (rotation matrices) rather than adding new project code of its own.
- **Files affected:** none — this unit is a verification, not a new
  function.
- **Change type:** N/A.
- **Location:** N/A.
- **Dependencies:** `multiply_matrices` (Lesson 15), `rotation_matrix_z`/
  `rotation_matrix_x` (this lesson), `rotate_z`/`rotate_x` (Lesson 47).

### The New Code

```python
p = (2, -1, 7)
nested_zx = rotate_z(rotate_x(p, 40), 40)
via_mult_zx = apply_matrix(multiply_matrices(rotation_matrix_z(40), rotation_matrix_x(40)), p)
via_mult_xz = apply_matrix(multiply_matrices(rotation_matrix_x(40), rotation_matrix_z(40)), p)
print("nested rotate_z(rotate_x(p,40),40)             =", nested_zx)
print("multiply_matrices(Rz(40), Rx(40)) applied to p  =", via_mult_zx)
print("multiply_matrices(Rx(40), Rz(40)) applied to p  =", via_mult_xz)
```

### Real Output

Running the three prints above gives:

```
nested rotate_z(rotate_x(p,40),40)             = (4.916724140909802, -2.7480760050031137, 4.7195234921463065)
multiply_matrices(Rz(40), Rx(40)) applied to p  = (4.916724140909803, -2.748076005003114, 4.7195234921463065)
multiply_matrices(Rx(40), Rz(40)) applied to p  = (2.1748764959244955, -4.101529603627031, 5.696259047659812)
```

The nested call — apply `rotate_x` first, then `rotate_z` — matches
`multiply_matrices(rotation_matrix_z(40), rotation_matrix_x(40))`
applied once, down to floating-point noise (`nearly_equal`-scale, not a
real discrepancy). The **order in the multiplication reads
right-to-left against the order of application**: `rotation_matrix_x`
runs first on the point, and it's the *second* (rightmost) argument to
`multiply_matrices`. This isn't a convention chosen for this lesson —
it falls directly out of function composition:
`rotate_z(rotate_x(p, 40), 40)` means "take `rotate_x`'s output and feed
it into `rotate_z`," and `multiply_matrices(A, B)` applied to a point
means exactly the same nesting, `A` applied to `B`'s own result,
because that's what `multiply_matrices`' own row/column dot-products
compute. Swap the multiplication order — `multiply_matrices(Rx(40),
Rz(40))` — and the result changes completely: `(2.17…, -4.10…, 5.70…)`
instead of `(4.92…, -2.75…, 4.72…)`, not a small numerical drift but a
different point entirely.

### CS Lens

Matrix multiplication being **non-commutative** — `AB ≠ BA` in general —
is a hard concept worth recognizing outside this one calculation:

```
Also recognized in: robot-arm joint ordering (shoulder-then-elbow
differs from elbow-then-shoulder), camera-then-object transform order
in a 3D engine's render pipeline, function composition in any
language (f(g(x)) generally isn't g(f(x))), quantum mechanics'
non-commuting operators
```

### SE Lens

The alternative not chosen: keep composing rotations only by nesting
function calls, the way Lesson 47's closing did. That's not wrong, but
it means every composed rotation has to be re-derived by re-calling both
functions every time it's needed, and there's no single value to pass
to code that expects "one rotation," the way a CAD/CAM pipeline stage
might expect one matrix per tool move. `multiply_matrices` costs one
matrix-multiply's worth of extra arithmetic up front, in exchange for a
composed rotation that's now a plain, storable, reusable value — the
same benefit homogeneous transform composition already delivered back in
Lesson 15, applied here to pure rotation instead of translation+rotation
together. The debt worth naming honestly: nothing about `multiply_matrices`
itself stops a caller from passing the two rotation matrices in the
wrong order for what they actually intended, and — as just demonstrated
— getting a plausible-looking but different rotation back with no error
raised.

### Connecting Sentence

Different-axis rotations compose in a specific, order-sensitive way —
the next check is whether that same sensitivity holds for two rotations
about the *same* axis, or whether it's specific to mixing axes.

---

## Closing

### Connect the Pieces

Trace `(2, -1, 7)` through the full chain this lesson built: first
confirm two rotations about the **same** axis behave the way ordinary
addition would suggest — angles just add, order doesn't matter — then
confirm that guess fails the moment the two axes differ.

```python
p = (2, -1, 7)
same_axis_ab = rotate_z(rotate_z(p, 15), 50)
same_axis_ba = rotate_z(rotate_z(p, 50), 15)
print("rotate_z(rotate_z(p,15),50) =", same_axis_ab)
print("rotate_z(rotate_z(p,50),15) =", same_axis_ba)
```

Real output:

```
rotate_z(rotate_z(p,15),50) = (1.751544310518049, 1.3899973123326002, 7)
rotate_z(rotate_z(p,50),15) = (1.751544310518049, 1.3899973123326004, 7)
```

Both orders return the same point, down to the last few bits of
floating-point noise — rotating `15°` then `50°` about `z` is the same
as `50°` then `15°`, because both are really just "rotate by `65°`
about `z`," and ordinary addition (`15 + 50 = 50 + 15`) *is*
commutative. This one case genuinely does commute. It is the specific
case, not the general rule — the very next section shows the general
rule directly.

### What Breaks Without This

Assume, by analogy with the same-axis case just confirmed, that rotation
order never matters — a reasonable-looking guess after seeing `15°` then
`50°` equal `50°` then `15°`. Test it on two *different* axes instead of
the same one:

```python
diff_axis_zx = rotate_z(rotate_x(p, 40), 40)
diff_axis_xz = rotate_x(rotate_z(p, 40), 40)
print("rotate_z(rotate_x(p,40),40) =", diff_axis_zx)
print("rotate_x(rotate_z(p,40),40) =", diff_axis_xz)
```

Real output:

```
rotate_z(rotate_x(p,40),40) = (4.916724140909802, -2.7480760050031137, 4.7195234921463065)
rotate_x(rotate_z(p,40),40) = (2.1748764959244955, -4.101529603627031, 5.696259047659812)
```

Not close — different `x`, different `y`, different `z`, none of it
floating-point noise. Rotating about `x` first and `z` second lands the
point somewhere genuinely different than `z` first and `x` second. This
is a real, verified, silently wrong assumption if left unchecked: code
that composes two rotation matrices (or two nested rotation calls) in
"whichever order felt natural" will run without error and produce a
plausible-looking point every time — nothing about the output alone
reveals that a different order was intended. Lesson 49 (Euler Angles)
is built entirely around choosing and fixing one specific rotation
order on purpose, precisely because this lesson just proved the order
is never free to ignore once more than one axis is involved.

### Exercises

- Verify `rotation_matrix_x(theta)`'s column 0 is always `(1, 0, 0)`
  regardless of `theta` — confirming `x` truly never moves under it, the
  matrix version of the same fixed-axis property Lesson 47 demonstrated
  for `rotate_x`.
- Pick your own two distinct angles and confirm, using `rotate_y` twice
  in both orders, that same-axis composition commutes for `y` too, not
  just `z`.
- Using `multiply_matrices`, build the composed matrix for "`rotate_y`
  then `rotate_z`" and confirm, via `apply_matrix`, that it matches
  `rotate_z(rotate_y(p, angle1), angle2)` for a point and two angles of
  your own choosing.

### Definition of Done

- [ ] `rotation_matrix_z`, `rotation_matrix_x`, `rotation_matrix_y` all
      exist in `geometry_verified_library.py`, each verified against its
      Lesson 47 formula counterpart across multiple points and angles,
      not just one convenient case.
- [ ] The columns-are-basis-images relationship was run and confirmed
      for real, not just asserted from the shape of `dot3`.
- [ ] `multiply_matrices(rotation_matrix_z(40), rotation_matrix_x(40))`
      applied to a point matches `rotate_z(rotate_x(p, 40), 40)`, and
      the reversed multiplication order was run and confirmed to
      produce a genuinely different result, not assumed from theory.
- [ ] Same-axis commutativity and different-axis non-commutativity were
      both run and confirmed, not just one of the two.
- [ ] Commit with a message stating *why*: rotations are now storable,
      composable matrix values instead of only nested function calls —
      and the commit message should note the real constraint this
      lesson surfaced (composition order matters across axes) so Lesson
      49's own starting point is honest about it.
