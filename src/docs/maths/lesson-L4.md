# Lesson L4 — Dimension and Coordinate Vectors

## What You Will Build

A MATLAB function that confirms every basis for a given space has the
same number of vectors — no matter which basis you pick — and a second
function that converts a vector into its **coordinate vector** relative
to a chosen basis, then converts back. A JavaScript visualisation shows
the same point in `R^2` plotted against two different bases, side by
side, so you can see the *point* stay fixed while its *coordinates*
change depending on which basis is doing the describing.

By the end of this lesson, "dimension" stops meaning "how many numbers
it takes to write a vector down" (which only works for the standard
basis) and becomes "how many vectors are in *any* basis for the space" —
a property of the space itself, not of any particular description of it.

---

## What You Need To Know First

- Lesson L1: span, rank
- Lesson L2: subspaces, column space, null space
- Lesson L3: linear independence, the definition of basis, extracting a
  basis from RREF pivot columns, and why non-independent spanning sets
  give non-unique coordinates — this lesson is the direct continuation
  of that last point

---

## The Lesson

### Dimension, Stated Precisely

Lesson L3 ended by promising this fact: every basis for a given space
`S` contains the same number of vectors. That number is the
**dimension** of `S`, written `dim(S)`.

This is worth pausing on, because it is not obvious. A basis is *any*
independent, spanning set — there is no rule that says you must pick
the standard one, and a space generally has infinitely many valid
bases. The claim is that no matter which one you pick, you count the
same number of vectors every time.

**Algebraic lens:** the proof sketch (not the full formal proof, but
the intuition) goes like this: suppose `B1` has `m` vectors and `B2`
has `n` vectors, both bases for the same space `S`. Because `B1` spans
`S`, every vector in `B2` can be written as a combination of `B1`'s
vectors. Because `B2` is independent, you can show this forces `n <= m`.
Running the same argument with the roles swapped forces `m <= n`. Both
inequalities together force `m = n`. The independence of one basis and
the spanning property of the other are doing all the work — exactly
the two properties Lesson L3 defined a basis by.

**Geometric lens:** dimension is "how many genuinely different
directions does this space have room for." A plane through the origin
in `R^3` has dimension 2 no matter whether you describe it with the
two vectors `(1,0,0)` and `(0,1,0)`, or with `(1,1,0)` and `(1,-1,0)` —
different bases, same plane, same count.

---

### Confirming Two Different Bases Give the Same Count

**The problem:** take a subspace of `R^3` (a plane through the origin)
and find two genuinely different bases for it, then confirm both have
the same number of vectors.

```matlab
% A plane through the origin in R^3: all combinations of these two vectors
u1 = [1; 1; 0];
u2 = [1; -1; 0];

basis_A = [u1, u2];

% A different pair of vectors spanning the SAME plane
w1 = u1 + u2;       % = [2; 0; 0]
w2 = u1 - u2;       % = [0; 2; 0]

basis_B = [w1, w2];

fprintf('rank(basis_A) = %d (dimension via basis A)\n', rank(basis_A));
fprintf('rank(basis_B) = %d (dimension via basis B)\n', rank(basis_B));

% Confirm basis_B's vectors are actually IN the span of basis_A (same plane)
fprintf('rank([basis_A, w1]) = %d (should still be 2, w1 adds nothing new)\n', ...
    rank([basis_A, w1]));
fprintf('rank([basis_A, w2]) = %d (should still be 2, w2 adds nothing new)\n', ...
    rank([basis_A, w2]));
```

Run this. You should see:

```
rank(basis_A) = 2 (dimension via basis A)
rank(basis_B) = 2 (dimension via basis B)
rank([basis_A, w1]) = 2 (should still be 2, w1 adds nothing new)
rank([basis_A, w2]) = 2 (should still be 2, w2 adds nothing new)
```

**Walkthrough:** `basis_A` and `basis_B` are built from completely
different-looking vectors, but `w1` and `w2` are themselves combinations
of `u1` and `u2` — so they cannot point anywhere `u1, u2` could not
already reach. The last two checks confirm this directly: appending `w1`
or `w2` to `basis_A` does not raise the rank, meaning neither vector
contributes a new independent direction. Both bases describe the same
plane, and both report dimension 2.

**Algebraic lens:** `rank` is doing double duty across this whole
lesson series — it has measured "how many independent columns," "is
this set independent," and now "what is the dimension of the space
these vectors span." All three readings are the same fact viewed from
different angles: rank counts pivot columns, pivot columns are an
independent spanning set for the column space, and the size of that
set is the column space's dimension.

**Geometric lens:** `u1=(1,1,0)` and `u2=(1,-1,0)` point along the two
diagonals of the `xy`-plane; `w1=(2,0,0)` and `w2=(0,2,0)` point along
the `x`- and `y`-axes. Visually these are four different arrows, but
they all lie flat in the same plane — and any two of them that are
independent are enough to reach every point in that plane.

---

### Coordinate Vectors: The Same Point, Two Descriptions

**The problem:** given a basis `B` for a space, write any vector in
that space as a unique combination of `B`'s vectors, and call the
coefficients its **coordinate vector relative to B**.

```matlab
% Basis for R^2 (not the standard one)
b1 = [2; 1];
b2 = [1; 2];
B = [b1, b2];

% A vector we want to describe using THIS basis instead of standard coordinates
v = [5; 4];

% Solve B*c = v for the coordinate vector c
c = B \ v;
disp('Coordinate vector of v relative to basis B:')
disp(c)

% Verify: rebuilding v from c and B should give back the original v exactly
v_rebuilt = B * c;
disp('Rebuilt v (should match original):')
disp(v_rebuilt)
```

Run this. You should see:

```
Coordinate vector of v relative to basis B:
    2.0000
    1.0000

Rebuilt v (should match original):
     5
     4
```

**Walkthrough:** `B \ v` solves `B*c = v` for `c` — the same backslash
operation used throughout this series to solve linear systems, now
interpreted as "find the coefficients that combine basis vectors into
this target." The result `c = [2; 1]` means `v = 2*b1 + 1*b2`, which
you can check by hand: `2*[2;1] + 1*[1;2] = [4;2]+[1;2] = [5;4]` — `v`
exactly. The vector `[5;4]` is `v`'s description in **standard**
coordinates; `[2;1]` is the *same point in space*, described in **B's**
coordinates.

**Algebraic lens:** Lesson L3 proved that a basis guarantees unique
coordinates — exactly because `B` is independent, `B*c = v` has at most
one solution, and because `B` spans the space, it has at least one. A
basis is precisely the condition under which `B \ v` is guaranteed to
return *the one and only* correct coordinate vector, rather than one
arbitrary solution among many (which is what happened with the
redundant set at the end of Lesson L3).

**Geometric lens:** picture two different grids overlaid on the same
plane: the standard grid (unit steps along the `x`- and `y`-axes) and a
skewed grid (unit steps along `b1` and `b2`). The point `v` sits at one
fixed location in space. Read off its position using the standard grid
and you get `(5,4)`. Read off its position using the skewed grid and
you get `(2,1)`. Same point, same plane — different rulers.

---

### Going the Other Direction: From Coordinates Back to the Vector

**The problem:** confirm the round trip works both ways — coordinates
relative to `B`, converted back, reproduce the original vector exactly,
for several vectors at once.

```matlab
b1 = [2; 1];
b2 = [1; 2];
B = [b1, b2];

% Several target vectors, as columns
V = [5, 0, 3;
     4, 3, -1];

% Solve for ALL coordinate vectors in one shot (columns of C correspond to columns of V)
C = B \ V;
disp('Coordinate vectors (each column is one vector''s coords relative to B):')
disp(C)

V_rebuilt = B * C;
disp('Rebuilt original vectors:')
disp(V_rebuilt)

fprintf('Round trip exact? %d\n', isequal(round(V_rebuilt, 8), V));
```

Run this. You should see:

```
Coordinate vectors (each column is one vector's coords relative to B):
    2.0000    1.0000    2.3333
    1.0000   -1.0000   -1.6667

Rebuilt original vectors:
    5.0000    0.0000    3.0000
    4.0000    3.0000   -1.0000

Round trip exact? 1
```

**Walkthrough:** `B \ V` solves `B*C = V` for every column of `V` at
once, because matrix-matrix solving is just matrix-vector solving
applied column by column. Each column of `C` is the coordinate vector
for the matching column of `V`, relative to the same basis `B`. The
round trip — go to `B`-coordinates, then back — reproduces `V` exactly,
confirming the conversion loses no information; it is purely a change
of description, not a change of the underlying vectors.

**Algebraic lens:** this generalizes the previous example from "one
vector" to "a whole batch," and previews the next lesson directly:
converting many vectors between coordinate systems at once, using
matrix multiplication, is exactly what a **change of basis** matrix
does. `B` itself, used this way, already *is* a change-of-basis matrix
— from `B`-coordinates back to standard coordinates.

**Geometric lens:** the three columns of `V` are three different points
in the plane. Each gets its own pair of `B`-coordinates, because each
point sits at its own location relative to the skewed grid. There is
nothing special about doing this one vector at a time — the whole
batch is just three independent applications of the same grid-reading
operation.

---

### Visualising One Point, Two Grids

**The problem:** show, in one picture, the standard grid and a skewed
basis grid overlaid, with a single point's coordinates labeled in both
systems.

```javascript
function visualizeCoordinateGrids() {
    const canvas = document.createElement('canvas');
    canvas.width = 420;
    canvas.height = 420;
    document.body.appendChild(canvas);
    const context = canvas.getContext('2d');

    const originX = canvas.width / 2;
    const originY = canvas.height / 2;
    const scale = 30;

    context.fillStyle = '#f5f5f5';
    context.fillRect(0, 0, canvas.width, canvas.height);

    // Standard grid (light gray)
    context.strokeStyle = '#dddddd';
    for (let i = -6; i <= 6; i++) {
        context.beginPath();
        context.moveTo(originX + i * scale, 0);
        context.lineTo(originX + i * scale, canvas.height);
        context.moveTo(0, originY + i * scale);
        context.lineTo(canvas.width, originY + i * scale);
        context.stroke();
    }

    // Basis vectors for the skewed grid
    const b1 = [2, 1];
    const b2 = [1, 2];

    // Skewed grid lines (orange), drawn as combinations of b1 and b2
    context.strokeStyle = '#e67e22';
    for (let k = -4; k <= 4; k++) {
        // lines of constant c1 (varying c2)
        context.beginPath();
        let x0 = k * b1[0] - 6 * b2[0], y0 = k * b1[1] - 6 * b2[1];
        let x1 = k * b1[0] + 6 * b2[0], y1 = k * b1[1] + 6 * b2[1];
        context.moveTo(originX + x0 * scale, originY - y0 * scale);
        context.lineTo(originX + x1 * scale, originY - y1 * scale);
        context.stroke();

        // lines of constant c2 (varying c1)
        context.beginPath();
        x0 = -6 * b1[0] + k * b2[0]; y0 = -6 * b1[1] + k * b2[1];
        x1 = 6 * b1[0] + k * b2[0]; y1 = 6 * b1[1] + k * b2[1];
        context.moveTo(originX + x0 * scale, originY - y0 * scale);
        context.lineTo(originX + x1 * scale, originY - y1 * scale);
        context.stroke();
    }

    // The point v = [5, 4], standard coordinates
    const v = [5, 4];
    context.fillStyle = '#c0392b';
    context.beginPath();
    context.arc(originX + v[0] * scale, originY - v[1] * scale, 5, 0, 2 * Math.PI);
    context.fill();

    context.fillStyle = '#000000';
    context.font = '13px sans-serif';
    context.fillText('Standard coords: (5, 4)', 10, 20);
    context.fillText('B-coords (orange grid): (2, 1)', 10, 38);
}

visualizeCoordinateGrids();
```

Run this. One canvas appears: a fine gray grid (the standard axes), an
orange skewed grid built from `b1=(2,1)` and `b2=(1,2)`, and a single
red dot marking the point `v`. The dot sits at grid intersection `(5,4)`
on the gray grid and *also* sits exactly at intersection `(2,1)` on the
orange grid — because that orange intersection is, by construction,
`2*b1 + 1*b2 = (5,4)`.

**Walkthrough:** the orange grid lines are drawn as combinations of
`b1` and `b2` with integer coefficients `k`, exactly the way the
standard grid lines are combinations of `(1,0)` and `(0,1)` with
integer coefficients. The red dot is plotted once, at its one true
location in the plane — it does not move between the two coordinate
readings, because coordinates are a description of the point, not a
property of the point itself.

**Algebraic lens:** this is the geometric meaning of `B \ v` made
visible: solving for the coordinate vector is asking "which orange
grid intersection does this point sit on?" — and the unique-coordinates
guarantee from Lesson L3 is exactly the guarantee that the point sits
on *exactly one* orange intersection, never zero, never more than one.

**Geometric lens:** if `b1` and `b2` were *not* independent, the orange
grid would collapse onto a single line (echoing Lesson L3's dependent
case) and most points in the plane — including `v` — would have no
orange-grid intersection at all to sit on. The grid only fully tiles
the plane, with every point landing on exactly one intersection,
because `{b1, b2}` is a genuine basis.

---

## Connect the Pieces

Dimension is a property of the *space*, not of any one basis you
happen to choose to describe it — every valid basis for a space has the
same number of vectors, and that shared number is the space's
dimension. Coordinate vectors are what a basis is *for*: once you fix a
basis, every vector in the space gets exactly one set of coordinates
relative to it, and converting between standard coordinates and
`B`-coordinates is solving (or applying) `B*c = v`.

This sets up the next question directly: if a vector can be described
in standard coordinates *or* in `B`-coordinates, what is the direct
recipe for converting from one basis's coordinates to a *different*
basis's coordinates, without going back through standard coordinates as
a detour each time? Lesson L5 builds that recipe — the **change of
basis matrix**.

---

## What Breaks Without This

Treat "dimension" as if it were a property of *how the vectors are
written* rather than of the space, by counting entries instead of
basis size:

```matlab
% WRONG instinct: "this vector has 3 entries, so it lives in a 3D space, so dim = 3"
v = [1; 1; 1];   % a single vector, written with 3 entries

% This tells you NOTHING about the dimension of any particular SPACE.
% Dimension is a property of a SPACE (like a subspace spanned by some vectors),
% not of a single vector's entry count.
```

A cleaner demonstration of the actual failure: pick a basis that looks
fine but is not actually independent, and watch coordinate extraction
produce a misleading result instead of a clean error.

```matlab
b1 = [1; 1];
b2 = [2; 2];   % NOT independent: b2 = 2*b1, so {b1,b2} is NOT a basis for R^2

B = [b1, b2];
v = [3; 3];    % happens to lie on the same line as b1, b2

c = B \ v;
disp('"Coordinate vector" produced anyway:')
disp(c)

v_rebuilt = B * c;
fprintf('Rebuilt matches v? %d\n', isequal(round(v_rebuilt, 8), v));

% Now try a target NOT on that line -- the wheels come off
v2 = [3; 1];
c2 = B \ v2;
v2_rebuilt = B * c2;
disp('Attempted coordinate vector for an unreachable target:')
disp(c2)
disp('Rebuilt (will NOT match v2):')
disp(v2_rebuilt)
```

Run this. For `v = [3;3]`, MATLAB's backslash silently returns *some*
coefficients that happen to rebuild `v` correctly — but they are not
*unique* (any combination of the form `c1 + 2*c2 = 3` works, an
infinite family), and MATLAB picked one without warning. For `v2 =
[3;1]`, which lies off the line `{b1,b2}` can reach, backslash still
returns numbers, but `B * c2` does **not** reconstruct `v2` — because
`{b1,b2}` only spans a line, not all of `R^2`, and `v2` is simply
unreachable with this set. Treating a non-basis as if it were a basis
produces silently wrong or silently ambiguous coordinates instead of an
honest error — exactly the failure mode Lesson L3 warned about, now
shown corrupting the dimension and coordinate machinery this lesson
depends on.

---

## Definition of Done

- [ ] Two different bases for the same plane both report `rank = 2`
- [ ] Appending either alternate basis vector to the first basis does
      not raise the rank (confirms same span)
- [ ] `B \ v` produces a coordinate vector that reconstructs `v` exactly
      when multiplied back by `B`
- [ ] The batch version (`B \ V` for multiple columns) round-trips
      correctly for every column at once
- [ ] The JavaScript visualisation shows one fixed point sitting at the
      correct intersection on both the standard grid and a skewed
      basis grid
- [ ] You can state, in one sentence, why dimension is a property of a
      space rather than of any single basis
- [ ] You can explain why a non-independent set produces ambiguous or
      wrong coordinate vectors instead of a clean error

**Commit your work:**

```bash
git add lesson-L4.m lesson-L4.js
git commit -m "Lesson L4: Dimension and coordinate vectors

Prove (by demonstration) that every basis for a space has the same
vector count, defined as dimension. Introduce coordinate vectors:
solving B*c=v gives the unique coefficients of v relative to basis B.
Show batch conversion across multiple vectors. Visualisation overlays
standard and skewed coordinate grids on one fixed point. Demonstrates
that non-independent sets break unique-coordinate extraction silently.
Sets up Lesson L5: change of basis matrices."
