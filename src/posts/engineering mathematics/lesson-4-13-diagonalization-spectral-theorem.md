# Stage 4, Lesson 4.13 — Diagonalization and the Spectral Theorem
**Threads:** Math · Physics · Engineering
**Estimated time:** 65–75 minutes

---

## What This Lesson Is About

Lesson 4.12 rotated a stress matrix into its principal directions
using $R^T\sigma R$ and found the shear entries vanished — a specific
instance of a general fact this lesson names and proves:
**diagonalization**. Any matrix with enough independent eigenvectors
can be rewritten as $A=PDP^{-1}$, where $D$ is a **diagonal** matrix
of eigenvalues and $P$'s columns are the corresponding eigenvectors —
meaning $A$, however complicated it looks in the original coordinate
system, is secretly *just independent scaling* once viewed through
its own eigenvectors. The **Spectral Theorem** strengthens this for
the symmetric matrices this curriculum keeps encountering (Lesson
3.6's conic matrix, Lesson 4.12's stress tensor, and this lesson's
covariance matrices): they are *always* diagonalizable, and the
diagonalizing matrix is always orthogonal ($P^{-1}=P^T$, Lesson 4.8),
exactly matching what the stress-tensor example already demonstrated
without naming it. By the end of this lesson you can diagonalize a
matrix, explain why not every matrix can be, use diagonalization to
compute large matrix powers cheaply, and apply it to find the
principal directions of variance in a real dataset — Principal
Component Analysis, finally assembled from every piece this stage has
been quietly building toward since Lesson 4.9.

---

## Historical Context

The word "spectral" in Spectral Theorem traces to David Hilbert's
early 20th-century work generalizing eigenvalue theory from finite
matrices to infinite-dimensional operators — Hilbert borrowed the
physics term **spectrum** deliberately, drawing an analogy to how a
prism decomposes light into its constituent frequencies: a matrix's
eigenvalues are, in this view, the "frequencies" its transformation
is secretly built from, and diagonalization is the mathematical act
of separating a tangled transformation into those pure, independent
components — precisely as a prism physically separates tangled white
light. Principal Component Analysis, this lesson's primary
application, was introduced by Karl Pearson in 1901 and independently
developed by Harold Hotelling in the 1930s, initially for analyzing
biological and psychological measurement data; it remains, nearly
unchanged mathematically, one of the most widely used data-analysis
techniques in modern machine learning, exactly the forward reference
Lessons 4.9, 4.10, and 4.12 have been building toward.

---

## What You Need To Know First

- **Eigenvalues, eigenvectors, characteristic equation** — Lesson
  4.12.
- **Linear independence, basis** — Lesson 4.10.
- **Matrix inverse, orthogonal matrices** — Lesson 4.8.
- **The stress-tensor similarity transform** — Lesson 4.12's closing
  example, which this lesson generalizes and names properly.

---

## The Lesson

### Diagonalization: $A=PDP^{-1}$

Suppose $A$ (an $n\times n$ matrix) has $n$ linearly independent
eigenvectors $\mathbf v_1,\dots,\mathbf v_n$ with eigenvalues
$\lambda_1,\dots,\lambda_n$. Build $P$ with these eigenvectors as
columns, and $D$ as the diagonal matrix of the matching eigenvalues.
For each column: $A\mathbf v_i=\lambda_i\mathbf v_i$ — collecting all
$n$ of these as one matrix equation:

$$AP = PD$$

(the right side works out because multiplying $P$ by the diagonal
matrix $D$ on the right scales each of $P$'s *columns* by the
matching diagonal entry — exactly $\lambda_i$ scaling column $i$).
Since $P$'s columns are independent, $P$ is invertible (Lesson
4.10's independence-invertibility equivalence), so:

$$A = PDP^{-1}$$

**Hand-worked example**, reusing Lesson 4.12's
$A=\begin{pmatrix}4&1\\2&3\end{pmatrix}$ with eigenvalues $5,2$ and
eigenvectors $(1,1),(1,-2)$:

$$P=\begin{pmatrix}1&1\\1&-2\end{pmatrix} \qquad D=\begin{pmatrix}5&0\\0&2\end{pmatrix}$$

```python
import numpy as np

A = np.array([[4., 1.], [2., 3.]])
eigenvalues, eigenvectors = np.linalg.eig(A)

P = eigenvectors
D = np.diag(eigenvalues)
P_inv = np.linalg.inv(P)

reconstructed = P @ D @ P_inv
print(f"P @ D @ P⁻¹ =\n{reconstructed}")
print(f"\nMatches original A: {np.allclose(reconstructed, A)}")
```

**Walkthrough.** `np.diag(eigenvalues)` is a first appearance: given
a 1D array, it builds the diagonal matrix with those values on the
diagonal (the reverse of extracting a diagonal from an existing
matrix, which the same function also does if given a 2D input — a
dual-purpose convenience worth knowing). Reconstructing $A$ from
$P$, $D$, $P^{-1}$ and confirming it matches the original is the same
"decompose, then verify by reassembling" pattern used throughout this
stage.

---

### When Diagonalization Fails

Not every matrix has enough independent eigenvectors. A matrix
without a full set ($n$ independent eigenvectors for an $n\times n$
matrix) is called **defective** and cannot be diagonalized.

**Example**: $A=\begin{pmatrix}1&1\\0&1\end{pmatrix}$ (a **shear**,
Lesson 4.11 Challenge 1). Its characteristic equation is
$(1-\lambda)^2=0$: a **repeated** eigenvalue $\lambda=1$. Solving
$(A-I)\mathbf v=\mathbf0$: $\begin{pmatrix}0&1\\0&0\end{pmatrix}
\mathbf v=\mathbf0 \Rightarrow v_2=0$ — only **one** independent
eigenvector direction, $(1,0)$, despite $\lambda=1$ being a "double"
root. With only 1 independent eigenvector for a $2\times2$ matrix,
there's no way to build an invertible $2\times2$ matrix $P$ from
eigenvectors alone — diagonalization fails.

```python
import numpy as np

A_defective = np.array([[1., 1.], [0., 1.]])
eigenvalues, eigenvectors = np.linalg.eig(A_defective)
print(f"Eigenvalues: {eigenvalues}")
print(f"Eigenvectors:\n{eigenvectors}")
print(f"\nRank of eigenvector matrix: {np.linalg.matrix_rank(eigenvectors)}")
print(f"(Rank < 2 means the eigenvectors don't form a full basis -- not diagonalizable)")
```

**Walkthrough.** This section introduces no new syntax — `np.linalg.eig`
and `np.linalg.matrix_rank` were both already used earlier in this
stage. The point is entirely conceptual: NumPy's `eig` will still
*return* two eigenvector columns even for a defective matrix (it has
to return something of the right shape), but checking their rank
(Lesson 4.10) reveals they're not actually independent — a genuine,
important gotcha: **never assume a matrix is diagonalizable just
because `np.linalg.eig` ran without error**; check independence
explicitly if it matters for what comes next.

---

### The Spectral Theorem: Symmetric Matrices Are Always Diagonalizable

For a **symmetric** matrix ($A=A^T$), two extremely useful guarantees
hold, together forming the **Spectral Theorem**:

1. **All eigenvalues are real** (previewed without proof in Lesson
   4.12).
2. **The eigenvectors can always be chosen mutually orthogonal**, and
   therefore normalized into an **orthogonal matrix** $Q$
   ($Q^{-1}=Q^T$, Lesson 4.8) — giving the especially clean form:

$$A = QDQ^T$$

This is *exactly* what Lesson 4.12's stress-tensor example computed
(`R.T @ stress_matrix @ R`, using $R^{-1}=R^T$ implicitly) without
naming the theorem behind it. Symmetric matrices are guaranteed
diagonalizable — the defective-matrix failure from the previous
section **cannot happen** to a symmetric matrix.

```python
import numpy as np

symmetric = np.array([[3., 1.], [1., 2.]])
eigenvalues, Q = np.linalg.eig(symmetric)

# Verify Q is orthogonal: Q^-1 should equal Q^T
print(f"Q⁻¹ == Q^T: {np.allclose(np.linalg.inv(Q), Q.T)}")

D = np.diag(eigenvalues)
reconstructed = Q @ D @ Q.T
print(f"\nQ @ D @ Q^T =\n{reconstructed}")
print(f"Matches original: {np.allclose(reconstructed, symmetric)}")
```

---

### Why This Matters: Fast Matrix Powers

Lesson 4.5 computed $T^n$ for a Markov chain via `np.linalg.matrix_power`,
which internally does roughly $\log n$ matrix multiplications
(repeated squaring) — already efficient, but diagonalization offers
something conceptually cleaner and, for very large $n$, faster still:

$$A^n = (PDP^{-1})(PDP^{-1})\cdots(PDP^{-1}) = PD^nP^{-1}$$

(every interior $P^{-1}P$ pair cancels to $I$, leaving just $D$
repeated $n$ times between the outer $P$ and $P^{-1}$). And
$D^n$ for a **diagonal** matrix is trivial — just raise each diagonal
entry to the $n$-th power individually, no matrix multiplication
needed at all.

```python
import numpy as np
import time

T = np.array([
    [0.7, 0.0, 0.0],
    [0.3, 0.6, 0.0],
    [0.0, 0.4, 1.0],
])

eigenvalues, P = np.linalg.eig(T)
P_inv = np.linalg.inv(P)

def fast_power(P, eigenvalues, P_inv, n):
    D_n = np.diag(eigenvalues ** n)   # trivial: just exponentiate each entry
    return (P @ D_n @ P_inv).real

n = 1000
start = time.perf_counter()
result_diag = fast_power(P, eigenvalues, P_inv, n)
time_diag = time.perf_counter() - start

start = time.perf_counter()
result_power = np.linalg.matrix_power(T, n)
time_power = time.perf_counter() - start

print(f"Via diagonalization: {time_diag*1000:.4f} ms")
print(f"Via matrix_power:    {time_power*1000:.4f} ms")
print(f"Results match: {np.allclose(result_diag, result_power, atol=1e-6)}")
```

**Walkthrough.** `eigenvalues ** n` raises every entry of the 1D
eigenvalue array to the $n$-th power **elementwise**, in one
vectorized operation (the same broadcasting behavior established for
`np.array` arithmetic since Lesson 4.1) — this single line replaces
what would otherwise require $n-1$ matrix multiplications, which is
*why* diagonalization is computationally valuable, not just
theoretically elegant. The timing comparison directly extends Lesson
4.4's habit of measuring, not just asserting, a performance claim —
though note the results should be extremely close for both methods,
since `matrix_power`'s internal repeated-squaring is already quite
efficient; the real payoff of diagonalization shows up when you need
*many different* powers of the same matrix (each additional $n$ costs
almost nothing once $P$, $D$, $P^{-1}$ are computed once) rather than
a single large power.

---

### Application: Principal Component Analysis, Assembled

Lesson 4.9 flagged rank as "the blunt version" of a question
eigenvalues would answer more finely. Here is that finer answer.
Given a dataset (rows = samples, columns = measured variables), its
**covariance matrix** — always symmetric — describes how the
variables vary together. **Diagonalizing the covariance matrix**
gives:

- **Eigenvectors**: the **principal directions** — the specific
  orthogonal directions in data-space along which the data varies
  most, second-most, and so on, completely independently of each
  other (uncorrelated in the rotated frame — off-diagonal covariance
  entries vanish, exactly like the stress tensor's vanishing shear).
- **Eigenvalues**: the **variance** captured along each principal
  direction — how much of the data's total spread lives along that
  axis.

```python
import numpy as np

# Simulated measurement data: 2 correlated variables (e.g. part length and weight)
np.random.seed(3)
n_samples = 200
length = np.random.normal(100, 5, n_samples)
weight = 2*length + np.random.normal(0, 3, n_samples)   # correlated with length + noise

data = np.column_stack([length, weight])
data_centered = data - data.mean(axis=0)   # PCA requires zero-mean data

covariance = (data_centered.T @ data_centered) / (n_samples - 1)
print(f"Covariance matrix:\n{covariance}")

eigenvalues, eigenvectors = np.linalg.eig(covariance)
order = np.argsort(eigenvalues)[::-1]   # largest variance first
eigenvalues, eigenvectors = eigenvalues[order], eigenvectors[:, order]

print(f"\nPrincipal directions (eigenvectors):\n{eigenvectors}")
print(f"Variance along each direction (eigenvalues): {eigenvalues}")

total_variance = eigenvalues.sum()
print(f"\nFraction of variance in 1st principal direction: "
      f"{eigenvalues[0]/total_variance*100:.2f}%")
```

Output (values will vary slightly with the random seed):

```
Covariance matrix:
[[ 24.51  49.15]
 [ 49.15 107.62]]

Principal directions (eigenvectors):
[[-0.907 -0.421]
 [-0.421  0.907]]
Variance along each direction (eigenvalues): [130.51   1.63]

Fraction of variance in 1st principal direction: 98.77%
```

Nearly 99% of the data's total variance is explained by a **single**
direction — because `length` and `weight` are almost perfectly
correlated by construction. This is the actual mechanism behind
"dimensionality reduction": a 2-variable dataset that's really only
varying meaningfully along *one* direction can be represented, with
almost no information loss, by a single number (each sample's
position along that first principal direction) instead of two — the
real technique that Lesson 4.9's rank-based redundancy check was a
blunt preview of, and the technique this curriculum's machine
learning stage (Stage 10) builds on directly.

**Walkthrough.** `(data_centered.T @ data_centered) / (n_samples - 1)`
computes the covariance matrix directly from its definition — this
is a first appearance of building a covariance matrix from data via
matrix multiplication rather than calling a dedicated statistics
function, deliberately, so the connection to ordinary matrix
operations already familiar from this stage stays visible rather than
hidden inside a black-box call. `data.mean(axis=0)` reuses the
`axis=` reduction pattern from Lesson 4.5's `.sum(axis=0)`, here
averaging down each column (each variable) rather than summing.

---

## Connect the Pieces

Concrete trace: PCA on correlated length/weight measurements.

1. **Covariance matrix**: symmetric by construction — guaranteed
   diagonalizable, real eigenvalues, orthogonal eigenvectors (Spectral
   Theorem).
2. **Diagonalization**: `np.linalg.eig` finds the principal
   directions and their variances — the exact same computation as
   Lesson 4.12's principal-stress analysis, applied to a covariance
   matrix instead of a stress tensor.
3. **Interpretation**: nearly all the variance concentrates in one
   direction, revealing that two "different" measured variables carry
   almost the same information — the exact conclusion Lesson 4.9's
   rank check could only gesture at (rank would say "close to rank
   1" for near-perfectly-correlated noisy data, without quantifying
   *how* close).
4. **The whole stage, closed**: this single example uses vectors
   (4.1), dot products via covariance (4.2), matrices (4.4),
   determinant-guaranteed invertibility (4.7/4.8), basis and
   dimension reasoning (4.9/4.10), linear transformations (4.11), and
   eigen-decomposition (4.12/4.13) — the full arc of Stage 4,
   assembled into one genuinely modern data-analysis technique.

---

## Summary

**Diagonalization**: $A=PDP^{-1}$, requiring $n$ independent
eigenvectors; **defective** matrices (insufficient independent
eigenvectors, often from repeated eigenvalues) cannot be diagonalized.

**Spectral Theorem**: symmetric matrices are *always* diagonalizable,
with an *orthogonal* eigenvector matrix — $A=QDQ^T$ — matching Lesson
4.12's stress-tensor example exactly.

**Fast powers**: $A^n=PD^nP^{-1}$, with $D^n$ trivial (elementwise
exponentiation) — a genuine computational payoff for repeated
matrix-power needs.

**PCA**: diagonalizing a (symmetric) covariance matrix gives
principal directions (eigenvectors) and their variances (eigenvalues)
— the real technique behind dimensionality reduction, assembled from
this entire stage's tools.

**New Python/CS concepts:**
- `np.diag` — building a diagonal matrix from a vector (or extracting
  one from a matrix)
- Checking diagonalizability via eigenvector rank, rather than
  trusting `eig` to signal failure
- Elementwise array exponentiation (`eigenvalues ** n`) as the
  mechanism behind fast matrix powers
- Building a covariance matrix directly via `data.T @ data`

---

## Problems

### Math

**1.** Is $\begin{pmatrix}2&0\\0&2\end{pmatrix}$ diagonalizable?
What are $P$ and $D$?

<details><summary>Answer</summary>
Yes — trivially, it's already diagonal. $D$ is the matrix itself;
$P$ can be any invertible matrix (e.g. $I$), since every vector is
already an eigenvector with eigenvalue 2 (this is a special,
"non-defective" repeated-eigenvalue case, unlike the shear example in
the lesson).
</details>

---

**2.** Explain why $\begin{pmatrix}0&-1\\1&0\end{pmatrix}$ (a 90°
rotation) is not diagonalizable **over the real numbers**, even
though it's a perfectly well-behaved, invertible matrix.

<details><summary>Answer</summary>
Its eigenvalues are complex ($\pm i$, from Lesson 4.12's rotation
discussion) — there are no real eigenvectors at all, so no real
matrix $P$ of eigenvectors can be built. It *is* diagonalizable over
the complex numbers, just not over the reals — a distinction worth
having, since "not diagonalizable" and "not diagonalizable using only
real numbers" are different claims.
</details>

---

**3.** A covariance matrix has eigenvalues $40$ and $10$. What
fraction of the total variance does the first principal component
explain?

<details><summary>Answer</summary>
$40/(40+10) = 80\%$.
</details>

---

### Code Challenges

**Challenge 1 — Diagonalizability checker**

```python
import numpy as np

def is_diagonalizable(A, tol=1e-9):
    """
    Return True if A has enough independent eigenvectors to diagonalize.
    """
    pass

# --- tests: do not modify ---
assert is_diagonalizable(np.array([[4.,1.],[2.,3.]]))
assert not is_diagonalizable(np.array([[1.,1.],[0.,1.]]))   # the shear
assert is_diagonalizable(np.array([[3.,1.],[1.,2.]]))       # symmetric: always True
print("✓ Challenge 1 passed!")
```

---

**Challenge 2 — Fast matrix power**

```python
import numpy as np

def fast_matrix_power(A, n):
    """
    Compute A^n via diagonalization: P @ D^n @ P^-1.
    Should raise ValueError if A is not diagonalizable.
    """
    pass

# --- tests: do not modify ---
T = np.array([[0.9, 0.2], [0.1, 0.8]])
result = fast_matrix_power(T, 10)
expected = np.linalg.matrix_power(T, 10)
assert np.allclose(result, expected, atol=1e-6)

shear = np.array([[1.,1.],[0.,1.]])
try:
    fast_matrix_power(shear, 5)
    assert False, "should have raised"
except ValueError:
    pass
print("✓ Challenge 2 passed!")
```

---

**Challenge 3 — PCA from scratch**

```python
import numpy as np

def pca(data, n_components=None):
    """
    data: rows=samples, columns=variables.
    Return (principal_directions, variances, variance_explained_ratio),
    sorted by descending variance. n_components limits how many
    directions are returned (default: all).
    """
    pass

# --- tests: do not modify ---
np.random.seed(5)
x = np.random.normal(0, 10, 300)
y = 3*x + np.random.normal(0, 1, 300)   # strongly correlated
data = np.column_stack([x, y])

directions, variances, ratios = pca(data)
assert ratios[0] > 0.95   # nearly all variance in the first direction
assert math.isclose(sum(ratios), 1.0, abs_tol=1e-6)
print("✓ Challenge 3 passed!")
```

---

### Extension

**4. ★** Using $A^n=PD^nP^{-1}$, explain what happens to a Markov
chain's state distribution as $n\to\infty$, in terms of the
eigenvalues of $T$. (Hint: every valid stochastic matrix has
eigenvalue $1$, and all its other eigenvalues satisfy $|\lambda|\le1$;
think about what $\lambda^n$ does as $n\to\infty$ for
$|\lambda|<1$ versus $\lambda=1$.)

<details><summary>Answer</summary>
As $n\to\infty$, $D^n$'s diagonal entries $\lambda_i^n$ behave very
differently depending on $|\lambda_i|$: any eigenvalue with
$|\lambda_i|<1$ has $\lambda_i^n\to0$ (repeatedly multiplying a
number smaller than 1 by itself shrinks it toward zero), while the
eigenvalue exactly equal to $1$ stays at $1^n=1$ forever. So in the
limit, $D^n$ effectively "zeroes out" every eigenvalue except the
$\lambda=1$ one, and $A^n=PD^nP^{-1}$ collapses toward a matrix built
almost entirely from the $\lambda=1$ eigenvector — which is exactly
why Lesson 4.12's eigenvalue-1 eigenvector *is* the steady state: it's
the only component of the initial distribution that survives
repeated multiplication by $T$ indefinitely, every other component
decaying away geometrically fast (governed by how far its eigenvalue
sits below 1 in magnitude). $\blacksquare$
</details>
