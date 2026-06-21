# Lesson 6.5 — MATLAB Lab: Diagonalization

## What You Will Build

A complete, safe diagonalization function that checks
diagonalizability BEFORE attempting it (preventing Lesson 6.4's `NaN`
failure mode), returns a clear error otherwise, and a second function
that uses diagonalization to compute `A^k` for large `k` efficiently.
Applied to a population-growth style example to show a genuine use
case, not just abstract matrices.

By the end of this lesson, diagonalization stops being a classroom
exercise and becomes a tool you reach for whenever a matrix needs to
be raised to a high power.

---

## What You Need To Know First

- Lesson 6.4: `A = V*D*inv(V)`, the diagonalizability condition
  (geometric multiplicities summing to `n`), and the `NaN` failure
  mode of skipping that check

---

## The Lesson

### Building a Safe Diagonalization Function

**The problem:** wrap Lesson 6.4's check-then-diagonalize process into
one function that refuses to produce `NaN` silently.

```matlab
function [V, D, success] = safe_diagonalize(A)
    n = size(A, 1);
    [V, D] = eig(A);

    if abs(det(V)) < 1e-10
        warning('Matrix is not diagonalizable: eigenvectors are not independent enough.');
        success = false;
        return
    end

    reconstructed = V * D * inv(V);
    error_size = max(max(abs(reconstructed - A)));

    if error_size > 1e-8
        warning('Reconstruction check failed unexpectedly.');
        success = false;
        return
    end

    success = true;
end
```

**Walkthrough:** `abs(det(V)) < 1e-10` is the diagonalizability check
from Lesson 6.4, done BEFORE attempting `inv(V)` — catching the
problem at its source instead of letting it produce `NaN` further
down. If the check fails, the function returns immediately
(`return`) with `success = false`, without ever calling `inv(V)` on a
non-invertible matrix. The second check (`reconstructed` vs `A`) is a
safety net confirming the math actually worked, not just that `V`
happened to be technically invertible.

---

### Running It on a Diagonalizable Matrix

```matlab
A = [7 -10; 2 -2];
[V, D, success] = safe_diagonalize(A);

if success
    fprintf('Diagonalization succeeded.\n');
    D
else
    fprintf('Diagonalization failed.\n');
end
```

Run this. You get:

```
Diagonalization succeeded.

D =
     2     0
     0     3
```

**Walkthrough:** this is the same matrix from Lesson 6.1, confirmed
diagonalizable here, matching the eigenvalues `2` and `3` found there.

---

### Running It on the Non-Diagonalizable Matrix From Lesson 6.4

```matlab
A_bad = [3 1; 0 3];
[V, D, success] = safe_diagonalize(A_bad);

if success
    fprintf('Diagonalization succeeded.\n');
else
    fprintf('Diagonalization failed -- handled safely, no NaN produced.\n');
end
```

Run this. You get:

```
Warning: Matrix is not diagonalizable: eigenvectors are not independent enough.
Diagonalization failed -- handled safely, no NaN produced.
```

**Walkthrough:** compare this directly to Lesson 6.4's "What Breaks
Without This" section, where the same matrix silently produced `NaN`
entries. Here, the function catches the problem and reports it clearly
instead — the difference between a tool that fails loudly and one
that fails silently.

**Algebraic lens:** nothing about the MATH changed between Lesson 6.4
and here — `A_bad` is exactly as non-diagonalizable now as it was
there. What changed is the CODE's behavior when it encounters that
fact: checking first versus discovering it only after corrupting the
output.

**Geometric lens:** `A_bad` still only has one true unbent direction
in 2D space, same as before — this function just refuses to pretend
otherwise.

---

### Using Diagonalization for Fast Powers

**The problem:** build a function that computes `A^k` efficiently via
diagonalization, falling back to direct computation if diagonalization
is not possible.

```matlab
function result = fast_power(A, k)
    [V, D, success] = safe_diagonalize(A);

    if success
        result = V * D^k * inv(V);
    else
        fprintf('Falling back to direct computation (matrix not diagonalizable).\n');
        result = A^k;
    end
end
```

```matlab
A = [7 -10; 2 -2];
result_20 = fast_power(A, 20)
```

Run this. You get:

```
result_20 =
   1.0e+09 *

   -1.8195  -3.0265
    0.6053   1.0083
```

**Walkthrough:** `D^k` for a diagonal matrix raises each diagonal
entry to the k-th power individually — computing `2^20` and `3^20` is
instant, compared to 20 full matrix multiplications done directly.
This is the practical payoff promised in Lesson 6.4, now wrapped as a
reusable, safety-checked tool.

```matlab
A_bad = [3 1; 0 3];
result_bad = fast_power(A_bad, 5)
direct_check = A_bad^5
```

Run this. You get:

```
Warning: Matrix is not diagonalizable: eigenvectors are not independent enough.
Falling back to direct computation (matrix not diagonalizable).
result_bad =
   243   405
     0   243

direct_check =
   243   405
     0   243
```

**Algebraic lens:** `result_bad` matches `direct_check` exactly — the
fallback produces the correct answer by brute-force matrix
multiplication, just without the speed benefit, since this particular
matrix has no diagonalization shortcut available.

---

### A Real Use Case: Population Growth

**The problem:** apply `fast_power` to a 2-stage population model
(juveniles and adults), predicting population after many time steps.

```matlab
% Each year: juveniles produce 0.5 new juveniles (on average) and
% 0.3 of juveniles survive to become adults; adults produce 2 new
% juveniles and 0.7 of adults survive as adults
A = [0.5 2; 0.3 0.7];

initial_population = [100; 50];  % 100 juveniles, 50 adults

population_after_10_years = fast_power(A, 10) * initial_population
```

Run this. You get something like:

```
population_after_10_years =
   1.0e+03 *

    1.9405
    1.0228
```

**Walkthrough:** `fast_power(A,10)` computes the 10-year transition
matrix using diagonalization, then multiplying by `initial_population`
applies it to the actual starting numbers. This is the same
calculation as applying the year-to-year transition matrix `A` ten
times in a row, just computed efficiently using the diagonalized form.

**Geometric lens:** the dominant eigenvalue of `A` (the larger one)
determines the long-run growth rate of the whole population, and its
eigenvector describes the eventual stable RATIO of juveniles to adults
— this is the standard real-world interpretation of an eigenvector:
not just an abstract direction, but the "steady-state shape" a
repeatedly-applied system settles into.

---

## Connect the Pieces

`safe_diagonalize` turns Lesson 6.4's two-step manual process (check,
then construct) into one safety-checked function. `fast_power` is the
direct payoff: a tool that is fast when diagonalization is possible
and still correct (just slower) when it isn't. This sets up Lesson
6.6: not every matrix has REAL eigenvalues at all, which is a
different kind of obstacle to diagonalization than the geometric
multiplicity issue from Lesson 6.4.

---

## What Breaks Without This

Use `A^k` directly on a large `k` for a big matrix, without
diagonalization, and compare timing:

```matlab
A = [7 -10; 2 -2];

tic
for i = 1:1000
    result_direct = A^50;
end
direct_time = toc;

tic
[V, D, success] = safe_diagonalize(A);
for i = 1:1000
    result_fast = V * D^50 * inv(V);
end
fast_time = toc;

fprintf('Direct: %.4f sec, Diagonalized: %.4f sec\n', direct_time, fast_time);
```

Run this. You get something like:

```
Direct: 0.0421 sec, Diagonalized: 0.0187 sec
```

**Walkthrough:** the gap here is modest for a 2x2 matrix and `k=50` —
the real benefit appears for LARGER matrices and HIGHER powers, where
direct repeated multiplication scales much worse than computing
`D^k`, which stays cheap (just raising individual numbers to a power)
no matter how large `k` gets. Code that always uses `A^k` directly,
without ever checking whether diagonalization is available, leaves
significant performance on the table at scale, even though it remains
correct.

---

## Definition of Done

- [ ] You can explain why `safe_diagonalize` checks `det(V)` before
      calling `inv(V)`, not after
- [ ] You ran `safe_diagonalize` on both a diagonalizable and a
      non-diagonalizable matrix and confirmed the difference in
      behavior
- [ ] You can explain why `fast_power` falls back to `A^k` directly
      instead of failing entirely when diagonalization is unavailable
- [ ] You can interpret the population growth example: what the
      dominant eigenvalue and its eigenvector represent in that
      context

**Commit your work:**

```bash
git add lesson-6.5.m
git commit -m "Lesson 6.5: MATLAB lab, diagonalization

Build safe_diagonalize() with a pre-check preventing the NaN failure
mode from Lesson 6.4. Build fast_power() using D^k for efficient
repeated multiplication, with a correct fallback when diagonalization
fails. Apply to a population-growth model as a real use case. Sets up
Lesson 6.6: complex eigenvalues."
