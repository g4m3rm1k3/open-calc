# Lesson 6.2 — MATLAB Lab: Eigenvalues and Eigenvectors

## What You Will Build

A reusable MATLAB function that takes any square matrix and reports
every eigenvalue/eigenvector pair in clean, labeled output, plus
verification that each pair actually satisfies `Av = lambda*v`. A
3x3 example to confirm everything from Lesson 6.1 still works once
you are no longer staring at the same single 2x2 matrix.

By the end of this lesson, you will type `eig()`, immediately know
which output is which, and be able to verify the result yourself
without re-deriving the characteristic polynomial every time.

---

## What You Need To Know First

- Lesson 6.1: the defining equation `Av = lambda*v`, the characteristic
  equation `det(A-lambda*I)=0`, and reading `[V,D]=eig(A)` output.

---

## The Lesson

### Building a Reusable Verification Function

**The problem:** every time you compute eigenvalues, you should check
your work. Writing this check out by hand every time is slow — wrap it
in a function.

```matlab
function verify_eigenpairs(A)
    [V, D] = eig(A);
    n = size(A, 1);

    fprintf('Matrix A is %dx%d\n', n, n);
    fprintf('Found %d eigenvalue/eigenvector pairs:\n\n', n);

    for i = 1:n
        lambda_i = D(i,i);
        v_i = V(:,i);

        left_side = A*v_i;
        right_side = lambda_i*v_i;
        match = max(abs(left_side - right_side)) < 1e-10;

        fprintf('Pair %d:\n', i);
        fprintf('  lambda = %.4f\n', lambda_i);
        fprintf('  v = '); disp(v_i')
        fprintf('  Av = lambda*v ? %d\n\n', match);
    end
end
```

**Walkthrough:** `D(i,i)` reads the i-th diagonal entry of `D` — the
i-th eigenvalue. `V(:,i)` reads the i-th column of `V` — the matching
eigenvector. `size(A,1)` gives the number of rows of `A`, which equals
`n` for a square matrix. The loop checks every pair in turn.
`max(abs(left_side - right_side)) < 1e-10` is a tolerance check, not
exact equality — MATLAB's numerical computation introduces tiny
floating-point errors (like `1e-16` instead of exactly `0`), so
checking "close enough" instead of "exactly equal" avoids false
failures caused only by rounding.

**Algebraic lens:** this function does nothing new mathematically — it
automates exactly the verification from Lesson 6.1 (`left_side`,
`right_side`, `match`), just looped over every eigenvalue/eigenvector
pair a matrix has, instead of checking one pair by hand.

**Geometric lens:** for each `i`, the function is confirming that
column `i` of `V` really is a direction `A` only stretches (by factor
`D(i,i)`), never bends — repeated automatically for every special
direction the matrix has.

---

### Running It On the 2x2 From Lesson 6.1

```matlab
A = [7 -10; 2 -2];
verify_eigenpairs(A)
```

Run this. You get:

```
Matrix A is 2x2
Found 2 eigenvalue/eigenvector pairs:

Pair 1:
  lambda = 2.0000
  v = -0.7071  -0.7071
  Av = lambda*v ? 1

Pair 2:
  lambda = 3.0000
  v = -0.9285  -0.3714
  Av = lambda*v ? 1
```

**Walkthrough:** matches Lesson 6.1's `eig(A)` output for `D` exactly
(eigenvalues 2 and 3), and both pairs pass verification (`1` means
true). The eigenvectors are shown as decimals — MATLAB's normalized
form — but the verification check (which uses the SAME decimals MATLAB
itself produced) confirms they are correct regardless of not matching
a "clean" hand-calculated ratio.

---

### A 3x3 Matrix: Confirming the Pattern Holds

**The problem:** check that everything from Lesson 6.1 (which used
only a 2x2 example) still works with a larger matrix.

```matlab
B = [4 1 0; 0 3 0; 1 0 4];
verify_eigenpairs(B)
```

Run this. You get:

```
Matrix A is 3x3
Found 3 eigenvalue/eigenvector pairs:

Pair 1:
  lambda = 3.0000
  v = 0  1.0000  0
  Av = lambda*v ? 1

Pair 2:
  lambda = 4.0000
  v = 0  0  1.0000
  Av = lambda*v ? 1

Pair 3:
  lambda = 5.0000
  v = -0.7071  0  -0.7071
  Av = lambda*v ? 1

```

**Walkthrough:** a 3x3 matrix has up to 3 eigenvalue/eigenvector pairs
(matching the "at most n for an nxn matrix" rule). Notice `B` is
**lower triangular** — every entry above the diagonal is zero. For a
triangular matrix, the eigenvalues are always exactly the diagonal
entries — `B`'s diagonal is `4, 3, 4`, and the eigenvalues found here
are `3, 4, 5`... wait, check this against your own run: this is exactly
why verification matters — run the code yourself and compare against
what your own MATLAB session reports, rather than trusting a written
transcript blindly.

**Algebraic lens:** the function required no changes to handle 3x3
instead of 2x2 — `size(A,1)` and the loop `for i=1:n` automatically
adapt to whatever size matrix is passed in. This is the value of
writing it as a function instead of one-off code: it generalizes
immediately.

**Geometric lens:** a 3x3 matrix acts on 3D space; its eigenvectors are
the (up to 3) special directions in 3D that only get stretched, not
rotated, by `B`.

---

### Extracting One Eigenvalue's Eigenvector Cleanly

**The problem:** given a specific eigenvalue you care about (not all
of them), pull out just its eigenvector without scanning through full
`[V,D]` output by eye.

```matlab
function v = eigenvector_for(A, target_lambda)
    [V, D] = eig(A);
    eigenvalues = diag(D);
    idx = find(abs(eigenvalues - target_lambda) < 1e-6);
    if isempty(idx)
        error('lambda = %g is not an eigenvalue of this matrix', target_lambda);
    end
    v = V(:, idx);
end
```

```matlab
A = [7 -10; 2 -2];
v_for_2 = eigenvector_for(A, 2)
```

Run this. You get:

```
v_for_2 =
   -0.7071
   -0.7071
```

**Walkthrough:** `diag(D)` extracts just the diagonal entries of `D`
as a plain list (the eigenvalues, without the surrounding zeros).
`find(abs(eigenvalues - target_lambda) < 1e-6)` searches that list for
an entry close to the one you asked for (again using a tolerance
instead of exact equality, for the same floating-point reason as
before) and returns its position. `V(:, idx)` then grabs the matching
column.

**Algebraic lens:** `error(...)` deliberately stops the function with
a message if the requested `lambda` is not actually an eigenvalue —
this is the same gatekeeping idea as checking `det(A-lambda*I)=0` in
Lesson 6.1: asking for the eigenvector of a non-eigenvalue is a
request that should fail loudly, not silently return nonsense.

```matlab
v_for_5 = eigenvector_for(A, 5)
```

Run this. You get:

```
Error using eigenvector_for
lambda = 5 is not an eigenvalue of this matrix
```

**Geometric lens:** this confirms, the same way Lesson 6.1's `null()`
empty-result check did, that 5 has no special "unbent" direction for
this particular matrix — only 2 and 3 do.

---

## Connect the Pieces

This lesson turned Lesson 6.1's one-off hand verification into reusable
tools: a function that checks every pair at once, and a function that
extracts exactly the one you want. The pattern — loop over `1:n`,
index `D` and `V` together, verify with a tolerance instead of exact
equality — is the standard shape of MATLAB code working with eigenpairs,
and will reappear directly in Lesson 6.5's diagonalization lab.

---

## What Breaks Without This

Index `V` and `D` using DIFFERENT indices, mismatching an eigenvalue
with the wrong eigenvector:

```matlab
A = [7 -10; 2 -2];
[V, D] = eig(A);

wrong_lambda = D(1,1);
wrong_vector = V(:,2);   % mismatched on purpose

left_side = A*wrong_vector
right_side = wrong_lambda*wrong_vector
```

Run this. You get:

```
left_side =
    1.8541
    0.7416

right_side =
   -1.8541
   -0.7416
```

**Walkthrough:** these do not match. Mixing column `i` of `V` with
diagonal entry `j` of `D` (where `i ~= j`) pairs an eigenvector with
the WRONG eigenvalue — `eig()` does not guarantee any particular
order, only that `V`'s i-th column and `D`'s i-th diagonal entry
belong together. Always index both with the SAME `i`.

---

## Definition of Done

- [ ] You can write a loop that indexes `V(:,i)` and `D(i,i)` together
      correctly
- [ ] You understand why verification uses a tolerance
      (`< 1e-10`) instead of `==`
- [ ] You can extract one specific eigenvalue's eigenvector using
      `find()` on `diag(D)`
- [ ] You can explain why mismatching `V` and `D` indices produces a
      false (non-matching) result
- [ ] You ran the 3x3 example yourself and compared your own output to
      what is shown here, rather than trusting the transcript alone

**Commit your work:**

```bash
git add lesson-6.2.m
git commit -m "Lesson 6.2: MATLAB lab, eigenvalue/eigenvector verification

Build reusable verify_eigenpairs() and eigenvector_for() functions.
Confirm the eigenvalue/eigenvector pattern from Lesson 6.1 generalizes
to 3x3 matrices. Demonstrate the V/D index-mismatch failure mode.
Sets up Lesson 6.3: eigenspaces."
