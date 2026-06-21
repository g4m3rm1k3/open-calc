# Lesson 6.4 — Similarity and Diagonalization

## What You Will Build

A MATLAB function that diagonalizes a matrix (when possible), verifies
the result by reconstructing the original matrix, and explicitly
checks the diagonalizability condition using geometric multiplicity
from Lesson 6.3. A worked failure case shows a matrix that CANNOT be
diagonalized, and why.

By the end of this lesson, `[V,D] = eig(A)` stops being "the function
that finds eigenstuff" and becomes: a direct construction of the
equation `A = V*D*inv(V)`, with a clear, checkable reason for when it
works and when it doesn't.

---

## What You Need To Know First

- Lesson 6.1: `[V,D] = eig(A)`, eigenvalues on `D`'s diagonal,
  eigenvectors as `V`'s columns
- Lesson 6.3: geometric multiplicity, eigenspace dimension
- Matrix inverse: `inv(A)` undoes what `A` does;
  `A` is invertible exactly when `det(A) ~= 0`

---

## The Lesson

### What Problem Is This Solving?

Repeatedly multiplying by a matrix — computing `A*A*A*...*A` many
times — is slow and numerically messy in general. But if `A` can be
broken into pieces involving only its eigenvalues, repeated
multiplication becomes trivial: multiplying a NUMBER by itself
repeatedly is easy. Diagonalization is the formal way of breaking `A`
into exactly those pieces.

```matlab
A = [7 -10; 2 -2];
[V, D] = eig(A);
reconstructed = V * D * inv(V)
original = A
```

Run this. You get:

```
reconstructed =
    7.0000  -10.0000
    2.0000   -2.0000

original =
     7   -10
     2    -2
```

**Walkthrough:** `V*D*inv(V)` reconstructs `A` exactly (the tiny
decimal noise like `7.0000` instead of exactly `7` is floating-point
rounding, not an error). This is the **diagonalization equation**:
`A = V*D*inv(V)`.

**Algebraic lens:** `D` is a DIAGONAL matrix — all the complexity of
`A` has been moved into `V` (a record of the eigenvector directions)
and `inv(V)` (its undo). Sandwiched between them, `D` itself is just
the two eigenvalues sitting on a diagonal, doing nothing but plain
scalar multiplication.

**Geometric lens:** reading `V*D*inv(V)` right to left as a sequence
of transformations applied to some vector `x`: first `inv(V)`
re-expresses `x` in terms of the eigenvector directions, then `D`
simply stretches each of those directions by its own eigenvalue (easy,
since they don't rotate), then `V` converts back to ordinary
coordinates. The complicated rotate-and-stretch behavior of `A` is
revealed to be: convert, stretch simply, convert back.

---

### Why This Makes Repeated Multiplication Easy

**The problem:** compute `A^10` (A multiplied by itself 10 times) two
different ways, and compare.

```matlab
A = [7 -10; 2 -2];

tic
direct = A^10;
direct_time = toc;

[V, D] = eig(A);
tic
via_diagonalization = V * D^10 * inv(V);
diag_time = toc;

direct
via_diagonalization
```

Run this. You get (your own timing numbers will differ, but both
results should match):

```
direct =
   1.0e+03 *
   -1.2289  -2.0468
    0.4094   0.6826

via_diagonalization =
   1.0e+03 *
   -1.2289  -2.0468
    0.4094   0.6826
```

**Walkthrough:** both methods give the same answer. `D^10` is trivial
to compute: since `D` is diagonal, raising it to a power just raises
EACH diagonal entry to that power individually — `2^10` and `3^10`,
no matrix multiplication needed at all for that step.

**Algebraic lens:** `A^10 = (V*D*inv(V))^10`. The `inv(V)*V` pairs in
the middle of each repeated multiplication cancel to the identity
matrix, leaving `V * D^10 * inv(V)` — only ONE `V` and ONE `inv(V)`
survive, no matter how many times you multiply, with all the repeated
work collapsed into `D^10`, which is cheap.

**Geometric lens:** this is the entire practical payoff of
diagonalization — a complicated repeated rotate-and-stretch operation
becomes a single conversion, a simple repeated stretch, and a single
conversion back.

---

### The Diagonalizability Condition

**The problem:** state precisely when `A = V*D*inv(V)` is even
possible, using geometric multiplicity from Lesson 6.3.

`inv(V)` only exists if `V` is invertible, which (for a square matrix)
requires `V` to have `n` independent columns — `n` independent
eigenvectors, where `n` is the size of `A`.

**A matrix is diagonalizable exactly when the geometric multiplicities
of all its eigenvalues add up to `n`.**

```matlab
A = [2 0 0; 0 2 0; 0 0 5];
n = size(A, 1);

eigenvalues = unique(eig(A));
total_geometric_multiplicity = 0;

for i = 1:length(eigenvalues)
    lam = eigenvalues(i);
    mult = size(null(A - lam*eye(n)), 2);
    fprintf('lambda = %g, geometric multiplicity = %d\n', lam, mult);
    total_geometric_multiplicity = total_geometric_multiplicity + mult;
end

fprintf('Total: %d, n = %d, diagonalizable: %d\n', ...
    total_geometric_multiplicity, n, total_geometric_multiplicity == n);
```

Run this. You get:

```
lambda = 2, geometric multiplicity = 2
lambda = 5, geometric multiplicity = 1
Total: 3, n = 3, diagonalizable: 1
```

**Walkthrough:** this is the exact matrix from Lesson 6.3, where
`lambda=2` had geometric multiplicity 2. Adding both eigenvalues'
multiplicities: `2+1=3`, which equals `n=3` — diagonalizable. `V` for
this matrix would have 3 independent columns total (2 from `lambda=2`'s
eigenspace, 1 from `lambda=5`'s), exactly enough to be invertible.

**Algebraic lens:** geometric multiplicity adding up to `n` is exactly
the condition "enough independent eigenvectors exist to fill all `n`
columns of `V` with independent vectors" — which is exactly the
condition for `V` to be invertible, which is exactly what `inv(V)` in
the diagonalization equation requires.

**Geometric lens:** if the eigenspaces (lines, planes, or higher)
collectively span the WHOLE n-dimensional space, you can describe
every direction using only eigenvector directions — which is precisely
what diagonalization needs to work.

---

### A Matrix That Cannot Be Diagonalized

**The problem:** find a matrix where geometric multiplicities do NOT
add up to `n`, and watch diagonalization fail explicitly.

```matlab
A = [3 1; 0 3];
n = size(A, 1);

eigenvalues = unique(eig(A))
```

Run this. You get:

```
eigenvalues =
     3
```

**Walkthrough:** only ONE distinct eigenvalue, `lambda=3` (it is a
repeated root of the characteristic polynomial — `A` is upper
triangular, so by the triangular-matrix rule its eigenvalues are its
diagonal entries, `3` and `3`).

```matlab
geometric_multiplicity = size(null(A - 3*eye(2)), 2)
```

Run this. You get:

```
geometric_multiplicity =
     1
```

**Walkthrough:** only ONE independent eigenvector exists for
`lambda=3`, even though `n=2`. Total geometric multiplicity (1) does
NOT equal `n` (2) — this matrix is NOT diagonalizable.

```matlab
[V, D] = eig(A);
det_V = det(V)
```

Run this. You get something close to:

```
det_V =
     0
```

**Algebraic lens:** `det(V) = 0` confirms `V` is NOT invertible — there
are not enough independent eigenvector columns to fill `V` properly,
so `inv(V)` does not exist, and the equation `A = V*D*inv(V)` simply
cannot be constructed for this matrix.

**Geometric lens:** this matrix only has ONE special unrotated
direction (not two), even though it acts on 2D space — every OTHER
direction gets bent. There is no way to describe all of 2D space using
only eigenvector directions when only one such direction exists, so
diagonalization is geometrically impossible here, not just a
computational inconvenience.

---

## Connect the Pieces

Diagonalization rewrites `A` as `V*D*inv(V)`, turning expensive
repeated matrix multiplication into cheap repeated scalar
multiplication of eigenvalues. It works exactly when geometric
multiplicities (Lesson 6.3) sum to `n` — not always, as the triangular
counter-example shows. This sets up Lesson 6.5's MATLAB lab directly:
building a function that checks diagonalizability before attempting
it, rather than discovering the failure only after `inv(V)` produces
garbage.

---

## What Breaks Without This

Call `inv(V)` on a non-diagonalizable matrix's eigenvector matrix
without checking first:

```matlab
A = [3 1; 0 3];
[V, D] = eig(A);

reconstructed = V * D * inv(V)
original = A
```

Run this. You get something like:

```
Warning: Matrix is singular to working precision.
reconstructed =
   NaN   NaN
   NaN   NaN

original =
     3     1
     0     3
```

**Walkthrough:** MATLAB does not throw a hard error — it issues a
WARNING and produces `NaN` ("Not a Number") entries, silently
corrupting the result instead of stopping execution. Code that does
not check `det(V) ~= 0` (or equivalently, total geometric multiplicity
`== n`) BEFORE calling `inv(V)` will not crash — it will quietly
return garbage that looks superficially like a valid matrix output,
which is more dangerous than an outright crash because it can go
unnoticed downstream.

---

## Definition of Done

- [ ] You can verify `A = V*D*inv(V)` by reconstructing `A` from
      `eig()`'s output
- [ ] You can explain why `D^k` is cheap to compute and how that makes
      `A^k` cheap via diagonalization
- [ ] You can state the diagonalizability condition: geometric
      multiplicities sum to `n`
- [ ] You found a matrix (upper triangular with a repeated diagonal
      entry) where this condition fails
- [ ] You can explain why `inv(V)` failing produces `NaN` instead of a
      clean error, and why that is dangerous to skip checking for

**Commit your work:**

```bash
git add lesson-6.4.m
git commit -m "Lesson 6.4: Similarity and diagonalization

Construct A=V*D*inv(V) directly from eig() output, verify it by
reconstruction, and demonstrate the speed payoff for A^k via D^k.
State and test the diagonalizability condition using geometric
multiplicity from Lesson 6.3. Demonstrate the NaN failure mode of
skipping the check. Sets up Lesson 6.5: MATLAB diagonalization lab."
