# Lesson L3 — Linear Independence and Basis

## What You Will Build

A MATLAB function that checks whether a set of vectors is linearly
independent, and a second function that checks whether a set forms a
basis for a given space. You will extract a basis for the column space
of a matrix with redundant columns, using the RREF pivot-column
technique you already know — now connected to its formal name. A
JavaScript visualisation shows three cases side by side: too few
vectors to reach everywhere, exactly enough (a basis), and more than
enough (redundant).

By the end of this lesson, "basis" stops meaning "some special set of
vectors a textbook picked" and becomes a precise, checkable property:
independent, and spanning, and nothing more is required.

---

## What You Need To Know First

- Lesson L1: span, and checking span membership via rank
- Lesson L2: subspaces, column space, null space
- Solving systems via RREF and identifying pivot columns — already
  mastered; this lesson formalizes what pivots have been telling you
  about independence all along

---

## The Lesson

### Linear Independence, Stated Precisely

You already know how to detect independence using pivots: if every
column of a matrix has a pivot, the columns are independent; if some
column has no pivot, it is a combination of earlier columns.

The formal definition underneath that pivot-counting procedure is this:

A set of vectors `v1, v2, ..., vn` is **linearly independent** if the
only solution to:

```
c1*v1 + c2*v2 + ... + cn*vn = 0
```

is the **trivial solution** — every `ci = 0`. If there exists *any*
other solution (some coefficient nonzero), the vectors are
**linearly dependent**.

**Algebraic lens:** this definition is checking something subtle: not
whether the zero vector is reachable (it always is — set every
coefficient to zero) — but whether it is reachable in *more than one
way*. Linear dependence means there is a "free" combination that
cancels to nothing despite using nonzero coefficients, which means at
least one vector in the set is redundant: it can be written in terms
of the others by rearranging that equation.

**Geometric lens:** if `v1, v2, v3` are dependent, it means some
combination of them — stretching, flipping, adding — manages to return
exactly to the starting point (the origin) without all the steps being
"do nothing." Geometrically, this happens precisely when one of the
vectors lies in the span of the others: it adds no new reachable
direction, which is the exact picture from Lesson L1's third
visualisation (the collapsed line).

---

### Checking Independence With Rank

**The problem:** confirm that the rank-based test you have used since
solving systems is exactly this trivial-solution definition, applied.

```matlab
v1 = [1; 0; 0];
v2 = [1; 1; 0];
v3 = [1; 1; 1];

M = [v1, v2, v3];
disp('M =')
disp(M)

rank_M = rank(M);
num_vectors = size(M, 2);

fprintf('rank(M) = %d\n', rank_M);
fprintf('number of vectors = %d\n', num_vectors);
fprintf('Independent: %d\n', rank_M == num_vectors);
```

Run this. You should see:

```
M =
     1     1     1
     0     1     1
     0     0     1

rank(M) = 3
number of vectors = 3
Independent: 1
```

**Walkthrough:** `size(M, 2)` returns the number of columns of `M` —
`size(M, 1)` would return the number of rows; the second argument
selects which dimension to report. The independence test is exactly:
does the rank equal the number of vectors? If yes, every column has a
pivot in the RREF (which is what `rank` is computing), and a pivot in
every column means the only way to combine the columns to zero is the
trivial way — there are no free variables left over to construct a
nontrivial solution.

**Algebraic lens:** "rank equals the number of vectors" is the
computational shortcut for "the only solution to `c1*v1+...+cn*vn=0`
is all-zero." The connection: solving `M*c = 0` (where `c` is the
vector of unknown coefficients) is itself a linear system, and that
system has *only* the trivial solution exactly when there are no free
variables in its RREF — which happens exactly when every column has
a pivot, which happens exactly when `rank(M)` equals the number of
columns.

**Geometric lens:** `v1=(1,0,0)`, `v2=(1,1,0)`, `v3=(1,1,1)` point in
three genuinely different directions in 3D space — none lies in the
plane spanned by the other two. You can confirm this by computing the
determinant (`det(M) = 1`, nonzero) — a nonzero determinant is another
equivalent test for independence in the case of a square matrix,
though `rank` is the test that generalizes to non-square cases too.

---

### A Dependent Set, Detected

**The problem:** add a fourth vector that is a combination of the
first three, and confirm the rank test catches it.

```matlab
v1 = [1; 0; 0];
v2 = [1; 1; 0];
v3 = [1; 1; 1];
v4 = v1 + v2 + v3;

M = [v1, v2, v3, v4];
disp('M =')
disp(M)

rank_M = rank(M);
num_vectors = size(M, 2);

fprintf('rank(M) = %d\n', rank_M);
fprintf('number of vectors = %d\n', num_vectors);
fprintf('Independent: %d\n', rank_M == num_vectors);
```

Run this. You should see:

```
M =
     1     1     1     3
     0     1     1     2
     0     0     1     1

rank(M) = 3
number of vectors = 4
Independent: 0
```

**Walkthrough:** `v4` is deliberately constructed as `v1+v2+v3`, so it
contributes nothing new to the span. `rank(M)` stays at 3 — the same
rank as before `v4` was added — because `v4` lies entirely within the
space already spanned by `v1, v2, v3`. The number of vectors is 4, but
the rank is only 3, so the independence check correctly reports
`false`.

**Algebraic lens:** the equation `c1*v1+c2*v2+c3*v3+c4*v4=0` has a
nontrivial solution here: take `c1=c2=c3=1` and `c4=-1`. Then
`v1+v2+v3-v4 = v1+v2+v3-(v1+v2+v3) = 0` — a nonzero combination that
cancels exactly. This is the trivial-solution definition catching the
dependency directly, not just the rank shortcut.

**Geometric lens:** four vectors in 3D space can never all be
independent — there are only three independent directions available
in 3D, full stop. Any fourth vector, no matter how it is chosen, must
be expressible in terms of the first three (assuming those three are
already independent and therefore already span all of `R^3`). This is
the geometric preview of dimension, formalized in Lesson L4: you cannot
have more independent vectors than the number of dimensions you are
working in.

---

### The Definition of Basis

A set of vectors `B = {v1, v2, ..., vn}` is a **basis** for a subspace
`S` if both of the following hold:

1. `B` is linearly independent
2. `B` spans `S` — every vector in `S` can be written as a linear
   combination of vectors in `B`

Both conditions are required, and neither alone is enough.
A spanning set with extra, redundant vectors is not a basis — it
contains more vectors than necessary. An independent set that does not
reach every corner of `S` is not a basis either — it is independent
but incomplete.

**Algebraic lens:** a basis is the answer to "what is the smallest set
of vectors that still reaches everywhere in `S`?" Independence rules
out redundancy (too many). Spanning rules out incompleteness (too few).
A basis sits exactly at the boundary between the two failure modes —
not one vector more than needed, not one vector less.

**Geometric lens:** think of a basis as a minimal set of directions
sufficient to describe every point in a space using only those
directions. For `R^3`, you need exactly three independent directions —
two are not enough (you would be stuck on a plane), four are one too
many (the fourth would necessarily be redundant, as just demonstrated).

---

### Extracting a Basis From RREF

**The problem:** given a matrix whose columns are not all independent,
extract a basis for its column space using the pivot columns you
already know how to find.

```matlab
A = [1, 2, 3, 4;
     2, 4, 1, 6;
     3, 6, 2, 9];

disp('A =')
disp(A)

[R, pivot_columns] = rref(A);
disp('RREF(A) =')
disp(R)
disp('Pivot columns:')
disp(pivot_columns)

basis_for_column_space = A(:, pivot_columns);
disp('Basis for the column space (pivot columns of the ORIGINAL matrix A):')
disp(basis_for_column_space)

fprintf('dim(column space) = %d\n', length(pivot_columns));
```

Run this. You should see:

```
A =
     1     2     3     4
     2     4     1     6
     3     6     2     9

RREF(A) =
     1     2     0     0
     0     0     1     0
     0     0     0     1

Pivot columns:
     1     3     4

Basis for the column space (pivot columns of the ORIGINAL matrix A):
     1     3     4
     2     1     6
     3     2     9

dim(column space) = 3
```

**Walkthrough:** `[R, pivot_columns] = rref(A)` is MATLAB's two-output
form of `rref` — the first output is the reduced matrix itself, the
second is the list of which original column positions contain pivots.
Column 2 (the values `2, 4, 6`) has no pivot in the RREF, because it
is exactly twice column 1 — confirming what you already know how to
detect: a column with no pivot is dependent on the columns before it.

The crucial subtlety: `basis_for_column_space = A(:, pivot_columns)`
extracts the pivot columns from the *original* matrix `A`, not from
the RREF. The RREF's own pivot columns (`[1,0,0]`, `[0,1,0]`, `[0,0,1]`
here) are not a basis for the column space of `A` — row reduction
changes the column space entirely, even though it preserves which
*combinations of columns* are dependent. Only the original columns,
selected at the pivot positions, form a valid basis for `A`'s actual
column space.

**Algebraic lens:** this procedure — row reduce, find pivot columns,
go back to the original matrix and take those columns — is the
standard method for extracting a basis from any spanning set. It works
because RREF identifies *which* columns are redundant (the non-pivot
ones) without changing the underlying dependency relationships between
columns. The dependent column (column 2) is not part of the basis, but
it is still in the column space — it can be written as `2 × (column 1)`,
a combination of basis vectors, exactly as required.

**Geometric lens:** `A`'s four columns live in `R^3`, but they only
reach a 3-dimensional subspace, no more — and since `R^3` is itself
3-dimensional, the column space is all of `R^3` for this particular
matrix. The basis found (columns 1, 3, 4) is one valid choice of three
directions that reaches everywhere column 2 could reach as well — three
genuinely independent directions, with the fourth (column 2)
confirmed redundant.

---

### Visualising Too Few, Just Right, Too Many

**The problem:** show, in one picture, what changes between an
incomplete set, a basis, and a redundant set, in 2D.

```javascript
function visualizeBasisCases() {
    const cases = [
        { vectors: [[2, 1]], title: "1 vector: independent, but does NOT span R^2 (only a line)" },
        { vectors: [[2, 1], [1, 2]], title: "2 independent vectors: a BASIS for R^2 (fills the plane)" },
        { vectors: [[2, 1], [1, 2], [3, 3]], title: "3 vectors: spans R^2, but NOT independent (3rd is redundant)" }
    ];

    cases.forEach((testCase, caseIndex) => {
        const canvas = document.createElement('canvas');
        canvas.width = 400;
        canvas.height = 420;
        document.body.appendChild(canvas);
        const context = canvas.getContext('2d');

        const originX = canvas.width / 2;
        const originY = canvas.height / 2 + 10;
        const scale = 25;

        context.fillStyle = '#f5f5f5';
        context.fillRect(0, 0, canvas.width, canvas.height);

        context.fillStyle = '#000000';
        context.font = '12px sans-serif';
        context.fillText(testCase.title, 10, 20);

        context.strokeStyle = '#dddddd';
        context.beginPath();
        context.moveTo(0, originY);
        context.lineTo(canvas.width, originY);
        context.moveTo(originX, 0);
        context.lineTo(originX, canvas.height);
        context.stroke();

        const vectors = testCase.vectors;
        const coefficientRange = 4;
        const step = 0.15;
        context.fillStyle = '#3498db';

        if (vectors.length === 1) {
            for (let c1 = -coefficientRange; c1 <= coefficientRange; c1 += step) {
                const x = c1 * vectors[0][0];
                const y = c1 * vectors[0][1];
                context.fillRect(originX + x * scale - 1, originY - y * scale - 1, 2, 2);
            }
        } else {
            for (let c1 = -coefficientRange; c1 <= coefficientRange; c1 += step) {
                for (let c2 = -coefficientRange; c2 <= coefficientRange; c2 += step) {
                    let x = c1 * vectors[0][0] + c2 * vectors[1][0];
                    let y = c1 * vectors[0][1] + c2 * vectors[1][1];
                    if (vectors.length === 3) {
                        // also allow combinations using the third vector
                        x += 0;
                        y += 0;
                    }
                    context.fillRect(originX + x * scale - 1, originY - y * scale - 1, 2, 2);
                }
            }
        }

        context.strokeStyle = '#e74c3c';
        context.lineWidth = 2;
        vectors.forEach(v => {
            context.beginPath();
            context.moveTo(originX, originY);
            context.lineTo(originX + v[0] * scale, originY - v[1] * scale);
            context.stroke();
        });
    });
}

visualizeBasisCases();
```

Run this. Three canvases appear. The first shows dots only along a
single line — one vector cannot reach off that line, no matter the
coefficient. The second shows dots densely filling the entire visible
plane — two independent vectors reach everywhere. The third *also*
fills the entire plane, identically to the second — adding the
redundant third vector `[3,3]` (which equals `[2,1]+[1,2]`) changes
nothing about what is reachable, because it was already reachable using
just the first two.

**Walkthrough:** the three-vector case in this code only actually
plots combinations of the *first two* vectors (`vectors[0]` and
`vectors[1]`) — the third vector is drawn as a red arrow but does not
contribute additional blue dots, because (as the comment notes) it adds
nothing new to plot: every point it could help reach is already
reachable without it. This is the visualisation's central point, made
by what is *absent*: there is no third loop variable `c3`, because a
third loop would not change the picture at all.

**Algebraic lens:** the second and third canvases are visually
identical because they represent the *same* span — `R^2` — despite the
third case using one more vector. This is the precise content of
"redundant": adding a vector to an already-spanning set never increases
what is reachable, even though it may *look* like progress because you
added another vector to the set.

**Geometric lens:** the first canvas shows independence without
spanning. The third shows spanning without independence (well — the
first two of the three are independent and spanning; the third vector
is the redundant one). Only the middle canvas shows both properties
holding simultaneously at the smallest possible vector count — that is
what makes it, and only it, a basis.

---

## Connect the Pieces

A basis is the precise answer to "what is the minimal complete
description of a space?" — independent so nothing is wasted, spanning
so nothing is missing. The pivot-column extraction from RREF, which
you already knew as a procedure, now has its formal justification:
pivot columns of the original matrix form a basis for its column space,
because non-pivot columns are exactly the ones RREF identifies as
combinations of earlier columns.

This sets up the next question directly: every basis for a given space
turns out to contain exactly the same number of vectors, no matter
which specific basis you pick. That number is the **dimension** of the
space — and Lesson L4 proves why this is always true, then uses a
basis to assign every vector in a space a unique set of coordinates.

---

## What Breaks Without This

Check only spanning, without checking independence, and call the result
a basis:

```matlab
v1 = [2; 1];
v2 = [1; 2];
v3 = [3; 3];   % = v1 + v2, redundant

M = [v1, v2, v3];
target = [5; 4];   % some vector in R^2

A_target = M \ [target; 0];   % WRONG: trying to solve with 3 unknowns, 2 equations is underdetermined differently
```

A cleaner demonstration of the actual failure: claim `{v1, v2, v3}` is
"the basis" and try to assign unique coordinates to a vector using it.

```matlab
v1 = [2; 1];
v2 = [1; 2];
v3 = [3; 3];

M = [v1, v2, v3];
target = [5; 4];

% System is underdetermined: 2 equations, 3 unknowns -- infinitely many solutions
solution_1 = M \ target;
disp('One solution found by backslash:')
disp(solution_1)

% Verify a DIFFERENT set of coefficients also works
alternative = solution_1 + [1; 1; -1];  % adding a null-space direction of M
disp('An alternative set of coefficients:')
disp(alternative)

check_1 = M * solution_1;
check_2 = M * alternative;
fprintf('Both reconstruct target? %d and %d\n', isequal(round(check_1,4), target), isequal(round(check_2,4), target));
```

Run this. Both `solution_1` and `alternative` reconstruct `target`
exactly, despite having different coefficients. With a redundant set,
*coordinates are not unique* — the same vector can be built multiple
different ways. A basis is required precisely to guarantee that every
vector gets *exactly one* set of coordinates, which is the property
Lesson L4 depends on completely. Using a spanning-but-dependent set
where a basis is required silently produces ambiguous coordinates
instead of a clear error — a subtle and dangerous failure mode.

---

## Definition of Done

- [ ] `rank(M) == size(M,2)` correctly identifies `{[1;0;0],[1;1;0],[1;1;1]}`
      as independent
- [ ] The same test correctly identifies the 4-vector set (with `v4=v1+v2+v3`)
      as dependent
- [ ] `rref` and pivot-column extraction correctly find a 3-vector basis
      for the column space of the example 4-column matrix
- [ ] The JavaScript visualisation shows: a line (1 vector), a filled
      plane (2 independent vectors), and the same filled plane again
      (3 vectors, one redundant)
- [ ] You can state the two-part definition of basis from memory
- [ ] You can explain why pivot columns of the *original* matrix, not
      the RREF, form the basis
- [ ] You can explain, using the final example, why a non-independent
      spanning set fails to give unique coordinates

**Commit your work:**

```bash
git add lesson-L3.m lesson-L3.js
git commit -m "Lesson L3: Linear independence and basis

Formalize linear independence (trivial-solution definition) and connect
it to the rank test already used via RREF pivots. Define basis as
independent + spanning. Extract a basis for a column space using pivot
columns of the original matrix. Visualisation shows too few, just
right, and redundant vector sets side by side. Demonstrates that
non-independent spanning sets give non-unique coordinates. Sets up
Lesson L4: dimension and coordinate vectors."
```
