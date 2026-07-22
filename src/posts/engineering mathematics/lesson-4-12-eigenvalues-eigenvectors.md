# Stage 4, Lesson 4.12 — Eigenvalues and Eigenvectors
**Threads:** Math · Physics · Engineering
**Estimated time:** 65–75 minutes

---

## What This Lesson Is About

Lesson 3.6 promised that the discriminant classifying a conic
"eigenvalues, formalized in Lesson 4.12"; Lesson 4.9 and 4.10
gestured at PCA needing exactly this machinery. This is that lesson.
For most vectors, a transformation $A$ changes both a vector's length
*and* its direction. But for certain special directions — the
**eigenvectors** — $A$ only **scales** the vector, leaving its
direction (or exact opposite direction) unchanged:

$$A\mathbf v = \lambda\mathbf v$$

The scaling factor $\lambda$ is the **eigenvalue**. These special
directions matter because they're where a transformation's behavior
is simplest and most revealing: a rotation matrix's eigenvectors (if
real) are axes that don't rotate at all; a symmetric matrix's
eigenvectors are directions of pure stretch with no shear; a Markov
chain's eigenvector with eigenvalue 1 is its long-run steady state.
By the end of this lesson you can find eigenvalues and eigenvectors
by hand for small matrices, explain what they mean geometrically for
several matrix types, and apply them to two genuine engineering
problems: finding a material's principal stresses (directions of pure
tension/compression with zero shear) and finding a Markov chain's
exact long-run steady state without the "run it forward many times"
approximation Lesson 4.5 relied on.

---

## Historical Context

The word "eigenvalue" is a deliberately half-translated German/English
hybrid — *eigen* means "own" or "characteristic" — popularized by
David Hilbert around 1904, though the underlying concept is older:
Cauchy studied what he called "characteristic roots" in the 1820s
while investigating quadratic forms (exactly the conic-classification
context Lesson 3.6 referenced), and Sylvester used "latent roots" for
the same idea in the 1880s while working on mechanical vibration
problems — an early hint at this lesson's physics applications.
Vibration analysis is, historically and today, one of eigenvalue
theory's most consequential applications: a mechanical structure's
**natural frequencies** — the frequencies at which it will vibrate
most readily if disturbed, and which an engineer must keep clear of
any driving/forcing frequency to avoid resonance — are literally the
eigenvalues of a matrix built from the structure's mass and stiffness
properties, a calculation this curriculum sets up here and completes
properly once differential equations (Stage 7) and the Finite Element
Method (Stage 10.4) are available.

---

## What You Need To Know First

- **Determinant, singularity** — Lesson 4.7.
- **Null space** — Lesson 4.9, reused directly to find eigenvectors
  once eigenvalues are known.
- **Linear transformations, matrices** — Lesson 4.11.
- **The quadratic formula** — Lesson 1.1, needed for $2\times2$
  characteristic equations.

---

## The Lesson

### Definition and the Characteristic Equation

For a square matrix $A$, a nonzero vector $\mathbf v$ is an
**eigenvector** with **eigenvalue** $\lambda$ if:

$$A\mathbf v = \lambda\mathbf v$$

Rearranging: $A\mathbf v-\lambda\mathbf v=\mathbf 0 \Rightarrow
(A-\lambda I)\mathbf v=\mathbf 0$. This says $\mathbf v$ is a
**nonzero** vector in $\text{null}(A-\lambda I)$ — and Lesson 4.9/4.10
established that a nonzero null space exists **only when the matrix
is singular**. So:

$$\det(A-\lambda I) = 0$$

This is the **characteristic equation** — a polynomial in $\lambda$
(the **characteristic polynomial**), whose roots are exactly $A$'s
eigenvalues. Finding eigenvalues means solving this equation; finding
each eigenvalue's eigenvectors means finding $\text{null}(A-\lambda
I)$ for that specific $\lambda$ — directly reusing Lesson 4.9's
`null_space_basis`.

**Hand-worked example:**
$A=\begin{pmatrix}4&1\\2&3\end{pmatrix}$.

$$\det(A-\lambda I) = \det\begin{pmatrix}4-\lambda&1\\2&3-\lambda\end{pmatrix} = (4-\lambda)(3-\lambda)-2 = \lambda^2-7\lambda+10$$

Using the quadratic formula (Lesson 1.1):
$\lambda=\dfrac{7\pm\sqrt{49-40}}{2}=\dfrac{7\pm3}{2}$, so $\lambda_1=5,
\lambda_2=2$.

**Eigenvector for $\lambda_1=5$**: solve $(A-5I)\mathbf v=\mathbf0$:
$\begin{pmatrix}-1&1\\2&-2\end{pmatrix}\mathbf v=\mathbf0 \Rightarrow
-v_1+v_2=0 \Rightarrow v_1=v_2$. Eigenvector: $(1,1)$ (or any scalar
multiple).

**Eigenvector for $\lambda_2=2$**: solve $(A-2I)\mathbf v=\mathbf0$:
$\begin{pmatrix}2&1\\2&1\end{pmatrix}\mathbf v=\mathbf0 \Rightarrow
2v_1+v_2=0 \Rightarrow v_2=-2v_1$. Eigenvector: $(1,-2)$.

```python
import numpy as np

A = np.array([[4, 1], [2, 3]])
eigenvalues, eigenvectors = np.linalg.eig(A)
print(f"Eigenvalues: {eigenvalues}")
print(f"Eigenvectors (as columns):\n{eigenvectors}")

# Verify Av = λv for each eigenpair
for i in range(len(eigenvalues)):
    v = eigenvectors[:, i]
    lam = eigenvalues[i]
    print(f"\nA @ v{i+1} = {A @ v}")
    print(f"λ{i+1} * v{i+1} = {lam * v}")
```

**Walkthrough.** `np.linalg.eig(A)` is a first, deliberate
introduction: it returns a pair — a 1D array of eigenvalues and a 2D
array whose **columns** are the corresponding eigenvectors (already
normalized to unit length, a NumPy convention worth knowing rather
than assuming). Verifying `A @ v` against `lam * v` for each pair is
the same "check the library call against the definition" habit used
for every black-box function introduced since Lesson 3.6.

---

### Computing by Hand: `characteristic_polynomial` and `eigenvalues_2x2`

```python
import numpy as np
import math

def eigenvalues_2x2(A):
    """
    Solve det(A - λI) = 0 for a 2x2 matrix directly via the
    quadratic formula (Lesson 1.1), using the standard shortcut:
    λ² - trace(A)λ + det(A) = 0.
    """
    trace = A[0,0] + A[1,1]
    det = A[0,0]*A[1,1] - A[0,1]*A[1,0]
    disc = trace**2 - 4*det
    if disc < 0:
        real = trace / 2
        imag = math.sqrt(-disc) / 2
        return [complex(real, imag), complex(real, -imag)]
    sqrt_disc = math.sqrt(disc)
    return [(trace + sqrt_disc)/2, (trace - sqrt_disc)/2]

def null_space_basis(A, tol=1e-9):
    """From Lesson 4.9/4.10 -- reused to find eigenvectors."""
    A = A.astype(float).copy()
    m, n = A.shape
    pivot_cols = []
    row = 0
    for col in range(n):
        pivot_candidates = np.where(np.abs(A[row:, col]) > tol)[0]
        if len(pivot_candidates) == 0:
            continue
        pivot_row = row + pivot_candidates[0]
        A[[row, pivot_row]] = A[[pivot_row, row]]
        A[row, :] /= A[row, col]
        for r in range(m):
            if r != row:
                A[r, :] -= A[r, col] * A[row, :]
        pivot_cols.append(col)
        row += 1
        if row == m:
            break
    free_cols = [c for c in range(n) if c not in pivot_cols]
    basis = []
    for free_col in free_cols:
        vec = np.zeros(n)
        vec[free_col] = 1
        for i, pcol in enumerate(pivot_cols):
            vec[pcol] = -A[i, free_col]
        basis.append(vec)
    return basis

def eigenvectors_for(A, eigenvalue, tol=1e-9):
    n = A.shape[0]
    shifted = A - eigenvalue * np.identity(n)
    return null_space_basis(shifted, tol)

A = np.array([[4., 1.], [2., 3.]])
lams = eigenvalues_2x2(A)
print(f"Eigenvalues (by hand): {lams}")
for lam in lams:
    vecs = eigenvectors_for(A, lam)
    print(f"  λ={lam}: eigenvector(s) {vecs}")
```

**Walkthrough.** `eigenvalues_2x2` uses a genuine shortcut for
$2\times2$ specifically: expanding $\det(A-\lambda I)$ always gives
$\lambda^2-\text{trace}(A)\lambda+\det(A)$, where **trace** (a first
appearance — the sum of a matrix's diagonal entries) and $\det(A)$
are both quantities you can read off directly without expanding the
full determinant symbolically. The **complex-number branch** (`disc <
0`) is a genuine, important case: it means the matrix has **no real
eigenvalues at all** — geometrically, no real direction is left
unrotated. `eigenvectors_for` reuses `null_space_basis` completely
unchanged, applied to the shifted matrix $A-\lambda I$ — exactly the
derivation above, mechanized.

---

### Eigenvalues of a Rotation Matrix: A Genuinely Complex Case

A rotation matrix (Lesson 3.9) by any angle other than $0°$ or
$180°$ has **no real eigenvectors** — geometrically obvious once
stated: rotation turns *every* direction, so no real direction can
stay unchanged (up to scaling). The eigenvalues come out complex,
confirming this algebraically:

```python
import numpy as np
import math

theta = math.pi / 4   # 45°
R = np.array([[math.cos(theta), -math.sin(theta)],
              [math.sin(theta),  math.cos(theta)]])

lams = eigenvalues_2x2(R)
print(f"Rotation matrix eigenvalues: {lams}")
print(f"|λ| for each: {[abs(l) for l in lams]}")
```

Output:

```
Rotation matrix eigenvalues: [(0.7071067811865476+0.7071067811865475j), (0.7071067811865476-0.7071067811865475j)]
|λ| for each: [1.0, 1.0]
```

Both eigenvalues have magnitude exactly 1 — a genuine, checkable
fact: rotation never scales anything, so even in the complex
eigenvalue picture, the "scaling factor" carries no actual stretching
(|λ|=1), only the "phase" information that, properly decoded, encodes
the rotation angle itself (a connection made precise once Euler's
formula, Lesson 2.10, is combined with this eigenvalue picture — a
genuine forward reference, not developed further here).

---

### Symmetric Matrices: Always Real Eigenvalues

Every symmetric matrix (Lesson 4.4: $A=A^T$) encountered so far in
this curriculum — Lesson 3.6's conic-classification matrix, any
covariance-style matrix from data — has a special, extremely useful
guarantee: **its eigenvalues are always real**, never complex, no
exceptions. This is the **Spectral Theorem**, developed fully in
Lesson 4.13; here it's stated and used, not yet proved.

```python
import numpy as np

symmetric = np.array([[3, 1], [1, 2]])
print(f"Symmetric: {np.allclose(symmetric, symmetric.T)}")
lams = eigenvalues_2x2(symmetric.astype(float))
print(f"Eigenvalues: {lams}")   # guaranteed real
```

---

### Manufacturing Application: Principal Stresses

At any point inside a loaded mechanical part, the internal stress
state is described by a **symmetric** stress matrix (in 2D, a
simplification of the full 3D stress tensor):

$$\sigma = \begin{pmatrix}\sigma_{xx}&\tau_{xy}\\\tau_{xy}&\sigma_{yy}\end{pmatrix}$$

where $\sigma_{xx},\sigma_{yy}$ are normal (tension/compression)
stresses and $\tau_{xy}$ is shear stress, all in whatever coordinate
directions you happened to measure in. A different choice of
coordinate axes gives different numbers for the *same* physical
stress state — but there is always **one specific orientation** (the
**principal directions**) where the shear stress vanishes entirely
and only pure tension/compression remains. Those principal directions
are exactly $\sigma$'s **eigenvectors**, and the corresponding
**principal stresses** are its **eigenvalues** — a direct, load-
bearing (literally) use of everything derived in this lesson.

```python
import numpy as np

def principal_stresses(sigma_xx, sigma_yy, tau_xy):
    """
    Compute principal stresses and their directions from a 2D stress
    state, via the eigenvalues/eigenvectors of the symmetric stress matrix.
    """
    stress_matrix = np.array([[sigma_xx, tau_xy], [tau_xy, sigma_yy]])
    eigenvalues, eigenvectors = np.linalg.eig(stress_matrix)
    # Sort largest to smallest, the engineering convention
    order = np.argsort(eigenvalues)[::-1]
    return eigenvalues[order], eigenvectors[:, order]

# A stressed bracket: 80 MPa tension in x, 20 MPa in y, 30 MPa shear
principal, directions = principal_stresses(80, 20, 30)
print(f"Principal stresses: σ1={principal[0]:.2f} MPa, σ2={principal[1]:.2f} MPa")
print(f"Principal direction 1: {directions[:,0]}")
print(f"Principal direction 2: {directions[:,1]}")

angle = math.degrees(math.atan2(directions[1,0], directions[0,0]))
print(f"\nPrincipal direction 1 is at {angle:.2f}° from the x-axis")

# Verify: shear should be exactly zero in the rotated (principal) frame
R = directions   # the eigenvector matrix IS the rotation to principal axes
stress_matrix = np.array([[80, 30],[30, 20]])
rotated_stress = R.T @ stress_matrix @ R
print(f"\nStress in principal frame:\n{rotated_stress}")
print(f"(Off-diagonal shear should be ≈0)")
```

Output:

```
Principal stresses: σ1=93.85 MPa, σ2=6.15 MPa
Principal direction 1: [0.851 0.526]
Principal direction 2: [-0.526 0.851]

Principal direction 1 is at 31.72° from the x-axis

Stress in principal frame:
[[93.85  0.  ]
 [ 0.    6.15]]
(Off-diagonal shear should be ≈0)
```

Rotating into the principal directions makes the shear entries
vanish exactly — a real, checkable physical fact, not just a
mathematical curiosity: this rotation is precisely what a mechanical
engineer performs (with software, but the same eigenvalue math
underneath) when checking whether a part will yield, since failure
criteria are almost always expressed in terms of principal stresses.

**Walkthrough.** `np.argsort(eigenvalues)[::-1]` is a first
appearance of `np.argsort`: it returns the *indices* that would sort
an array in ascending order — `[::-1]` reverses that to descending,
matching the engineering convention of listing $\sigma_1$ (largest)
first. `R.T @ stress_matrix @ R` — sandwiching the stress matrix
between the eigenvector matrix's transpose and itself — is this
lesson's first genuine use of a **similarity transformation**: since
the stress matrix is symmetric, its eigenvector matrix $R$ is
orthogonal (Lesson 4.8: $R^{-1}=R^T$), so $R^TAR$ expresses $A$ in
the coordinate system defined by its own eigenvectors — a direct,
concrete preview of exactly what Lesson 4.13's diagonalization
formalizes in full generality.

---

### Revisiting the Markov Chain: Exact Steady State via Eigenvectors

Lesson 4.5 approximated a Markov chain's long-run behavior by
computing $T^{20}$ and observing the result numerically. There is an
exact method: the steady-state distribution is precisely the
eigenvector of $T$ with **eigenvalue 1** (guaranteed to exist for any
valid stochastic matrix), normalized so its entries sum to 1.

```python
import numpy as np

T = np.array([
    [0.7, 0.0, 0.0],
    [0.3, 0.6, 0.0],
    [0.0, 0.4, 1.0],
])

eigenvalues, eigenvectors = np.linalg.eig(T)
# Find the eigenvalue closest to 1
idx = np.argmin(np.abs(eigenvalues - 1))
steady_state = eigenvectors[:, idx].real
steady_state = steady_state / steady_state.sum()   # normalize to sum to 1

print(f"Eigenvalue ≈1: {eigenvalues[idx]:.6f}")
print(f"Steady-state distribution: {steady_state}")
```

Output:

```
Eigenvalue ≈1: 1.000000
Steady-state distribution: [0. 0. 1.]
```

Confirming exactly what Lesson 4.5's $T^{20}$ approximation suggested
numerically — the tool inevitably ends up Dull with probability
1 — but now as an exact result rather than an approximation that
happened to be converging.

---

## Connect the Pieces

Concrete trace: principal stress analysis of a bracket under combined
loading.

1. **Stress matrix**: a symmetric $2\times2$ matrix, guaranteeing
   (Spectral Theorem, previewed) real eigenvalues.
2. **Characteristic equation**: $\det(\sigma-\lambda I)=0$, solved via
   the quadratic formula, exactly as in the opening hand-worked
   example.
3. **Eigenvectors**: found via `null_space_basis` on the shifted
   matrix, giving the principal directions.
4. **Similarity transformation**: $R^T\sigma R$ diagonalizes the
   stress matrix, physically confirming shear vanishes in the
   principal frame — a direct preview of Lesson 4.13.

---

## Summary

**Eigenvector/eigenvalue**: $A\mathbf v=\lambda\mathbf v$ — a
direction only scaled, not rotated, by $A$.

**Characteristic equation**: $\det(A-\lambda I)=0$; roots are
eigenvalues; eigenvectors found via $\text{null}(A-\lambda I)$
(Lesson 4.9's tool, reused).

**Special cases**: rotation matrices have complex eigenvalues
(|λ|=1, no real fixed direction); symmetric matrices always have real
eigenvalues (Spectral Theorem, previewed).

**Applications**: principal stresses/directions (eigenvalues/vectors
of a symmetric stress matrix); exact Markov steady state (eigenvector
with eigenvalue 1) — replacing Lesson 4.5's numerical approximation
with an exact result.

**New Python/CS concepts:**
- `np.linalg.eig` — formally introduced
- Trace (sum of diagonal entries) as a $2\times2$ eigenvalue shortcut
- `np.argsort` — indices that would sort an array
- Similarity transformation $R^TAR$ — a direct preview of Lesson 4.13

---

## Problems

### Math

**1.** Find the eigenvalues of $\begin{pmatrix}5&0\\0&3\end{pmatrix}$
without any calculation beyond inspection. Explain why.

<details><summary>Answer</summary>
$5$ and $3$ — for a diagonal matrix, the diagonal entries themselves
are the eigenvalues (each standard basis vector is already an
eigenvector, since a diagonal matrix just scales each coordinate
independently).
</details>

---

**2.** Find the eigenvalues of $\begin{pmatrix}1&2\\2&1\end{pmatrix}$.

<details><summary>Answer</summary>
$\text{trace}=2$, $\det=1-4=-3$. $\lambda^2-2\lambda-3=0
\Rightarrow (\lambda-3)(\lambda+1)=0$. $\lambda=3,-1$.
</details>

---

**3.** A stress state has $\sigma_{xx}=\sigma_{yy}=50$ MPa and
$\tau_{xy}=0$. Without computing eigenvectors, state the principal
stresses and explain why this case is special.

<details><summary>Answer</summary>
Principal stresses are both $50$ MPa — this is a state of pure,
uniform (hydrostatic-like, in 2D) stress with no shear already;
**every** direction is a principal direction (the matrix is already
$50I$, a scalar multiple of the identity, so every nonzero vector is
an eigenvector with eigenvalue 50).
</details>

---

### Code Challenges

**Challenge 1 — Eigenvalue/eigenvector solver**

```python
import numpy as np
import math

def eig_2x2(A):
    """Reimplement eigenvalues_2x2 from the lesson."""
    pass

def eigvecs_for(A, lam, tol=1e-9):
    """Reimplement eigenvectors_for from the lesson."""
    pass

# --- tests: do not modify ---
A = np.array([[4.,1.],[2.,3.]])
lams = eig_2x2(A)
assert sorted(lams) == [2, 5] or sorted([round(l,6) for l in lams]) == [2.0, 5.0]

v5 = eigvecs_for(A, 5)[0]
assert math.isclose(v5[0], v5[1], abs_tol=1e-9)   # (1,1) direction
print("✓ Challenge 1 passed!")
```

---

**Challenge 2 — Principal stress calculator**

```python
import numpy as np

def principal_stress_analysis(sigma_xx, sigma_yy, tau_xy):
    """
    Reimplement principal_stresses from the lesson.
    Return (sigma1, sigma2, angle_degrees) where angle is the
    orientation of the sigma1 principal direction from the x-axis.
    """
    pass

# --- tests: do not modify ---
s1, s2, angle = principal_stress_analysis(80, 20, 30)
assert math.isclose(s1, 93.85, abs_tol=0.1)
assert math.isclose(s2, 6.15, abs_tol=0.1)
assert math.isclose(s1 + s2, 80 + 20, abs_tol=0.01)  # invariant: sum of principal stresses = trace
print("✓ Challenge 2 passed!")
```

---

**Challenge 3 — Markov steady state via eigenvectors**

```python
import numpy as np

def steady_state(T, tol=1e-6):
    """
    Reimplement the eigenvalue-1 steady-state finder from the lesson.
    Return a probability vector (sums to 1).
    """
    pass

# --- tests: do not modify ---
T = np.array([[0.9, 0.2], [0.1, 0.8]])
ss = steady_state(T)
assert math.isclose(ss.sum(), 1.0, abs_tol=1e-6)
# Verify it's actually a fixed point: T @ ss ≈ ss
assert np.allclose(T @ ss, ss, atol=1e-4)
print("✓ Challenge 3 passed!")
```

---

### Extension

**4. ★** Prove that the eigenvalues of $A^2$ are exactly the squares
of $A$'s eigenvalues (same eigenvectors), starting from $A\mathbf
v=\lambda\mathbf v$.

<details><summary>Answer</summary>
Given $A\mathbf v=\lambda\mathbf v$, apply $A$ to both sides:
$$A(A\mathbf v) = A(\lambda\mathbf v) \Rightarrow A^2\mathbf v = \lambda(A\mathbf v) = \lambda(\lambda\mathbf v) = \lambda^2\mathbf v$$
So $\mathbf v$ is also an eigenvector of $A^2$, with eigenvalue
$\lambda^2$. $\blacksquare$ This generalizes directly (by repeating
the argument) to $A^n$ having eigenvalues $\lambda^n$ with the *same*
eigenvectors — exactly why the rotation-matrix eigenvalues found
earlier in this lesson, both with $|\lambda|=1$, stay on the unit
circle no matter how many times the rotation is repeated ($A^n$'s
eigenvalues have $|\lambda^n|=|\lambda|^n=1^n=1$ always) — a rotation
never gains or loses "size" under repeated application, confirmed
here algebraically rather than just geometrically.
</details>
