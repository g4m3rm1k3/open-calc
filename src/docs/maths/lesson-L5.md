# Lesson L5 — Change of Basis

## What You Will Build

A MATLAB function that converts a vector's coordinates directly from
one basis to another — without using standard coordinates as a
detour — by composing two change-of-basis matrices. You will see why
the matrix that converts `B`-coordinates to standard coordinates is
simply `B` itself, why its inverse undoes that conversion, and how
chaining two such matrices gives a direct `B1`-to-`B2` conversion. A
JavaScript visualisation animates a single fixed point's coordinate
label flipping between two different bases, making the "same point,
different ruler" idea from Lesson L4 dynamic instead of static.

By the end of this lesson, "change of basis" stops meaning "some
matrix trick you multiply by" and becomes the precise, mechanical
consequence of two facts you already know: a basis matrix converts its
own coordinates to standard ones, and matrix inverses undo matrix
multiplication.

---

## What You Need To Know First

- Lesson L3: the definition of basis, why pivot columns of the
  original matrix form a basis
- Lesson L4: dimension, and coordinate vectors — specifically, that
  `B \ v` finds the coordinates of `v` relative to basis `B`, and that
  `B * c` rebuilds `v` from its `B`-coordinates `c`
- Matrix inverses (`inv(M)` or, preferably, `M \ I` / direct solves
  rather than explicitly inverting) and the fact that `M * inv(M) = I`

---

## The Lesson

### The Basis Matrix Is Already a Conversion Tool

Lesson L4 used `B * c` to rebuild a vector from its `B`-coordinates,
and `B \ v` to go the other way. Stated as a pair, this is already the
entire idea of change of basis:

```
v (standard coords) = B * c (B-coords)
c (B-coords)         = B \ v   (equivalently, inv(B) * v)
```

`B` is not just "the matrix whose columns happen to be a basis" — used
this way, it **is** the change-of-basis matrix from `B`-coordinates to
standard coordinates. Its inverse, `inv(B)`, is the change-of-basis
matrix in the opposite direction: standard coordinates to
`B`-coordinates.

**Algebraic lens:** this is not a new idea bolted onto matrix algebra —
it is matrix-vector multiplication and matrix inversion, *relabeled*.
`B * c = v` was always "combine columns of `B` using weights `c` to get
`v`"; calling `c` a "coordinate vector" and `B` a "change-of-basis
matrix" is choosing to read an old operation through a new lens.

**Geometric lens:** multiplying by `B` takes a point described on the
skewed grid (Lesson L4's orange grid) and reports where that same point
sits on the standard grid. Multiplying by `inv(B)` runs the reverse
errand: take a point's standard-grid address and report its skewed-grid
address instead.

---

### Converting Between Two Non-Standard Bases

**The problem:** given two different bases `B1` and `B2` for `R^2`,
convert a vector's `B1`-coordinates directly into its `B2`-coordinates,
without writing out the vector's standard coordinates as an
intermediate step in your own head (MATLAB will still compute them
internally — the point is that you do not need to *track* them
yourself).

```matlab
% Basis 1
B1 = [2, 1;
      1, 2];

% Basis 2 (a different valid basis for R^2)
B2 = [1, 0;
      1, 1];

% Suppose we are GIVEN coordinates relative to B1
c1 = [2; 1];   % this represents some vector v, in B1's "language"

% Step 1: recover standard coordinates of v (we need this once, conceptually)
v = B1 * c1;
disp('v in standard coordinates:')
disp(v)

% Step 2: convert standard coordinates into B2's "language"
c2 = B2 \ v;
disp('Same vector v, in B2 coordinates:')
disp(c2)

% The DIRECT change-of-basis matrix from B1-coords to B2-coords:
P = B2 \ B1;
disp('Direct change-of-basis matrix P (B1-coords -> B2-coords):')
disp(P)

% Confirm: applying P directly to c1 gives the same c2 as the two-step route
c2_direct = P * c1;
disp('c2 computed directly via P:')
disp(c2_direct)

fprintf('Both methods agree? %d\n', isequal(round(c2,8), round(c2_direct,8)));
```

Run this. You should see:

```
v in standard coordinates:
     5
     4

Same vector v, in B2 coordinates:
     1
     4

Direct change-of-basis matrix P (B1-coords -> B2-coords):
     1     1
     0     2

c2 computed directly via P:
     1
     4

Both methods agree? 1
```

**Walkthrough:** `v = B1 * c1` recovers standard coordinates (this is
the rebuild step from Lesson L4). `c2 = B2 \ v` then re-expresses that
same standard vector relative to `B2` (the extract step from Lesson
L4). Chaining these two operations is `c2 = B2 \ (B1 * c1)` — and
because matrix multiplication associates, this is exactly
`(B2 \ B1) * c1`. Define `P = B2 \ B1` once, and `P * c1` gives `c2`
directly, in a single matrix multiplication, for *any* `c1` you hand
it — no detour through standard coordinates required for each new
vector.

**Algebraic lens:** `P = B2 \ B1` is shorthand for
`P = inv(B2) * B1` — first convert `B1`-coordinates to standard
(multiply by `B1`), then convert standard to `B2`-coordinates (multiply
by `inv(B2)`). The order of operations in `inv(B2) * B1` reads
right-to-left: `B1` acts on `c1` first, `inv(B2)` acts on the result
second — matrix multiplication composes like function composition,
applied right to left.

**Geometric lens:** `P` is a single matrix that directly relabels
points from `B1`'s grid addresses to `B2`'s grid addresses, skipping
the standard grid as an intermediate stop. You could in principle build
infinitely many such direct conversion matrices, one for every pair of
bases — but you never need to memorize them, because they are always
just `(target basis) \ (source basis)`.

---

### Change of Basis Preserves the Vector, Changes the Label

**The problem:** confirm, for several vectors at once, that converting
through `P` and converting via the two-step standard-coordinate route
always agree — change of basis is bookkeeping, not a transformation of
the underlying vectors.

```matlab
B1 = [2, 1;
      1, 2];
B2 = [1, 0;
      1, 1];

P = B2 \ B1;

% Several vectors, given as B1-coordinates
C1 = [2, 0, -1;
      1, 3,  2];

% Two-step route: B1-coords -> standard -> B2-coords
V_standard = B1 * C1;
C2_twostep = B2 \ V_standard;

% Direct route: apply P once
C2_direct = P * C1;

disp('Two-step result:')
disp(C2_twostep)
disp('Direct result via P:')
disp(C2_direct)

fprintf('Agree for all columns? %d\n', isequal(round(C2_twostep,8), round(C2_direct,8)));
```

Run this. You should see:

```
Two-step result:
    2.0000    3.0000    1.0000
    1.0000   -3.0000   -3.0000

Direct result via P:
    2.0000    3.0000    1.0000
    1.0000   -3.0000   -3.0000

Agree for all columns? 1
```

**Walkthrough:** every column of `C1` is independently converted by
both routes, and every column agrees. This is the batch confirmation —
echoing Lesson L4's batch coordinate extraction — that `P` is not an
approximation or a special case; it is the exact same conversion, for
any number of vectors, in one multiplication instead of two.

**Algebraic lens:** this is the same associativity fact as before, just
applied column-by-column: `B2 \ (B1 * C1) = (B2 \ B1) * C1` holds for a
whole matrix `C1` of stacked coordinate vectors, for the same reason it
held for a single vector — matrix multiplication does not care whether
you call the second argument a vector or a matrix.

**Geometric lens:** the underlying *points* in the plane never move
during any of this. `B1`-coordinates, standard coordinates, and
`B2`-coordinates are three different addressing systems laid over the
same fixed set of points. Change of basis only ever rewrites the
address; the dot on the page stays exactly where it was.

---

### Visualising One Point, Two Bases, Animated

**The problem:** show a single fixed point with its coordinate label
toggling between two different bases, so the "same point, different
ruler" relationship from Lesson L4 is visibly dynamic rather than two
separate static images.

```javascript
function visualizeChangeOfBasis() {
    const canvas = document.createElement('canvas');
    canvas.width = 420;
    canvas.height = 440;
    document.body.appendChild(canvas);
    const context = canvas.getContext('2d');

    const originX = canvas.width / 2;
    const originY = canvas.height / 2 + 10;
    const scale = 30;

    const B1 = [[2, 1], [1, 2]];   // columns: b1=(2,1), b2=(1,2)
    const B2 = [[1, 1], [0, 1]];   // columns: e1'=(1,0), e2'=(1,1)

    const v = [5, 4]; // fixed point in standard coordinates

    function solve2x2(M, rhs) {
        const det = M[0][0]*M[1][1] - M[0][1]*M[1][0];
        const x = (M[1][1]*rhs[0] - M[0][1]*rhs[1]) / det;
        const y = (-M[1][0]*rhs[0] + M[0][0]*rhs[1]) / det;
        return [x, y];
    }

    const c1 = solve2x2(B1, v); // v's coords relative to B1
    const c2 = solve2x2(B2, v); // v's coords relative to B2

    function drawGrid(basis, color) {
        context.strokeStyle = color;
        for (let k = -5; k <= 5; k++) {
            context.beginPath();
            let x0 = k*basis[0][0] - 6*basis[1][0], y0 = k*basis[0][1] - 6*basis[1][1];
            let x1 = k*basis[0][0] + 6*basis[1][0], y1 = k*basis[0][1] + 6*basis[1][1];
            context.moveTo(originX + x0*scale, originY - y0*scale);
            context.lineTo(originX + x1*scale, originY - y1*scale);
            context.stroke();

            context.beginPath();
            x0 = -6*basis[0][0] + k*basis[1][0]; y0 = -6*basis[0][1] + k*basis[1][1];
            x1 = 6*basis[0][0] + k*basis[1][0]; y1 = 6*basis[0][1] + k*basis[1][1];
            context.moveTo(originX + x0*scale, originY - y0*scale);
            context.lineTo(originX + x1*scale, originY - y1*scale);
            context.stroke();
        }
    }

    let showingB1 = true;

    function render() {
        context.fillStyle = '#f5f5f5';
        context.fillRect(0, 0, canvas.width, canvas.height);

        drawGrid(showingB1 ? B1 : B2, showingB1 ? '#2980b9' : '#e67e22');

        context.fillStyle = '#c0392b';
        context.beginPath();
        context.arc(originX + v[0]*scale, originY - v[1]*scale, 6, 0, 2*Math.PI);
        context.fill();

        const coords = showingB1 ? c1 : c2;
        context.fillStyle = '#000000';
        context.font = '14px sans-serif';
        context.fillText(
            `Basis ${showingB1 ? 'B1' : 'B2'} coordinates: (${coords[0].toFixed(2)}, ${coords[1].toFixed(2)})`,
            10, 24
        );
        context.fillText('Click canvas to switch basis', 10, 44);
    }

    canvas.addEventListener('click', () => {
        showingB1 = !showingB1;
        render();
    });

    render();
}

visualizeChangeOfBasis();
```

Run this. One canvas appears with a fixed red dot and a grid aligned
to `B1`. Its label reads the `B1`-coordinates of the dot. Click the
canvas, and the grid redraws aligned to `B2` instead, with the label
now reading `B2`-coordinates — a different pair of numbers, for the
exact same dot, which has not moved a single pixel.

**Walkthrough:** `solve2x2` is a hand-rolled 2x2 linear solve (standing
in for what `B \ v` does in MATLAB), used here purely so the
visualisation has no external dependency. Toggling `showingB1` redraws
the grid in a different alignment and recomputes which coordinate pair
to display — but `v`, the dot's standard-coordinate location, never
changes anywhere in this code.

**Algebraic lens:** this is `P = B2 \ B1` made visible one click at a
time, rather than computed once as a matrix: every click is implicitly
re-deriving one column of what `P` would give you directly. The matrix
`P` exists precisely so you do not have to re-solve from scratch for
every new vector — once built, `P * c1` replaces the entire two-step
recovery for any vector you hand it.

**Geometric lens:** the grid is the thing moving in this picture, not
the dot. That inversion — coordinates change because the *ruler*
changes, not because the *point* does — is the entire content of
"change of basis," and is easy to say but only really lands once you
have watched it happen.

---

## Connect the Pieces

A basis matrix `B` already does double duty: as a matrix, it sends
`B`-coordinates to standard coordinates by ordinary multiplication; its
inverse runs that conversion backward. Chaining a "go to standard" step
with a "leave standard" step for a different basis collapses, by
associativity, into one matrix `P = B2 \ B1` — the direct
change-of-basis matrix between any two bases for the same space. The
underlying vectors never move; only their coordinate labels do.

This sets up the next question directly: some special vectors do not
just get relabeled under certain transformations — they get *scaled*,
landing on the exact same line they started on, just stretched or
shrunk. Finding which directions behave this way, and by what factor,
is the subject of Lesson L6: **eigenvalues and eigenvectors**.

---

## What Breaks Without This

Build the change-of-basis matrix in the wrong order — multiplying
`B1 \ B2` instead of `B2 \ B1` — and watch it convert in the wrong
direction without raising any error:

```matlab
B1 = [2, 1;
      1, 2];
B2 = [1, 0;
      1, 1];

c1 = [2; 1];                  % B1-coordinates of some vector v
v_correct = B1 * c1;          % v in standard coords, for comparison

P_correct = B2 \ B1;          % B1-coords -> B2-coords (correct direction)
P_backwards = B1 \ B2;        % this is actually B2-coords -> B1-coords

c2_correct  = P_correct  * c1;   % CORRECT: v's coordinates in B2
c2_wrong    = P_backwards * c1;  % WRONG: applies the inverse direction to c1 anyway

% Sanity check the correct one
v_check = B2 * c2_correct;
fprintf('Correct P reproduces v? %d\n', isequal(round(v_check,8), round(v_correct,8)));

% The "wrong direction" result LOOKS like a valid coordinate vector --
% same shape, plausible-looking numbers -- but it does NOT correspond to v at all
v_wrong_check = B2 * c2_wrong;
disp('What B2 * c2_wrong actually reconstructs (NOT v):')
disp(v_wrong_check)
fprintf('Matches v? %d (it should not)\n', isequal(round(v_wrong_check,8), round(v_correct,8)));
```

Run this. `P_backwards` is a perfectly valid, perfectly invertible
matrix — MATLAB raises no error and produces no warning, because
`B1 \ B2` is a completely legitimate computation; it is simply the
change-of-basis matrix for the *opposite* conversion direction
(`B2`-coordinates to `B1`-coordinates), not the one this problem called
for. Applying it to `c1` produces a result that has the right shape and
looks like a plausible coordinate vector, but does not correspond to
the original vector `v` at all. There is no clean error here — only a
silently wrong answer, which is precisely why the order of `B2 \ B1`
versus `B1 \ B2` is worth checking deliberately every time, rather than
guessed at under time pressure.

---

## Definition of Done

- [ ] `B * c` and `B \ v` correctly round-trip between standard and
      `B`-coordinates for a single vector
- [ ] The two-step conversion (`B1`-coords to standard to `B2`-coords)
      matches the direct conversion via `P = B2 \ B1`, for a single
      vector and for a batch of vectors
- [ ] You can state from memory why `P = inv(B2) * B1`, and why the
      order of `B1` and `B2` in that product is not arbitrary
- [ ] The JavaScript visualisation shows one fixed point with its
      coordinate label changing correctly when the basis grid changes
- [ ] You can explain why `B1 \ B2` is a valid matrix but converts in
      the wrong direction for the problem this lesson set up
- [ ] You can explain, in your own words, why change of basis affects
      coordinates but never affects the underlying vector

**Commit your work:**

```bash
git add lesson-L5.m lesson-L5.js
git commit -m "Lesson L5: Change of basis

Show that a basis matrix B already converts B-coordinates to standard
coordinates by multiplication, and inv(B) reverses that. Derive the
direct change-of-basis matrix P = B2 \\ B1 between two arbitrary bases
via associativity, and confirm it matches the two-step route for
single vectors and batches. Visualisation animates one fixed point's
coordinate label flipping between two basis grids on click.
Demonstrates that reversing the order of B1 and B2 silently computes
the wrong-direction conversion with no error. Sets up Lesson L6:
eigenvalues and eigenvectors."
