# Stage 4, Lesson 4.7 — Determinants: Definition, Properties, and Computation
**Threads:** Math · Physics · Engineering
**Estimated time:** 65–75 minutes

---

## What This Lesson Is About

`np.linalg.det` has been called three times in this curriculum as a
trusted black box: Lesson 3.6 used it to detect degenerate conics,
Lesson 4.3 used the $2\times2$ case as a mnemonic for the cross
product without deriving why it worked, and Lesson 4.6 used it to
detect singular (unsolvable-uniquely) systems. This lesson finally
opens that box: the **determinant** is a single number computed from
a square matrix that measures **how much the matrix's transformation
scales area (in 2D), volume (in 3D), or hypervolume (in higher
dimensions)** — with a sign that records whether the transformation
flips orientation. A determinant of zero means the transformation
crushes space down into a lower dimension (a plane into a line, a
cube into a flat sheet) — which is exactly why $\det(A)=0$ signals a
degenerate conic, an unsolvable system, and a lost dimension, all at
once: they're the same underlying fact viewed three ways. By the end
of this lesson you can compute a determinant by cofactor expansion
for any size matrix, state and use its key properties, and apply it
to a genuinely useful engineering check: computing a tetrahedral mesh
element's volume — and validating it isn't degenerate — a core
operation behind the Finite Element Method this curriculum reaches in
Stage 10.

---

## Historical Context

The determinant predates the matrix that "contains" it by nearly two
centuries: it was discovered independently by Seki Kowa in Japan
(1683) and Gottfried Leibniz in Germany (1693), both working on
methods for solving linear systems — exactly the use Lesson 4.6 made
of it, centuries before Cayley's 1858 matrix notation gave it a
container to live inside. Gabriel Cramer's 1750 rule for solving
$A\mathbf x=\mathbf b$ directly via ratios of determinants (a method
this lesson mentions but doesn't emphasize, since Gaussian
elimination is more efficient for anything beyond very small systems)
made the determinant briefly the *primary* tool for solving linear
systems, before elimination methods overtook it computationally. The
geometric meaning — area/volume scaling factor — was understood
early but not fully formalized until the 19th century, and it's this
geometric reading, more than Cramer's algebraic one, that turns out
to generalize most usefully into the higher-dimensional and
calculus-adjacent applications (changes of variables in multivariable
calculus, Jacobians) this curriculum will reach later.

---

## What You Need To Know First

- **$2\times2$ determinant, cross product** — Lesson 4.3, where
  $ad-bc$ was used as a computational mnemonic without derivation.
- **Matrix multiplication, matrices as transformations** — Lesson
  4.4.
- **Singular systems, $\det(A)=0$ signaling no-unique-solution** —
  Lesson 4.6.

---

## The Lesson

### The $2\times2$ Determinant, Geometrically

$$\det\begin{pmatrix}a&b\\c&d\end{pmatrix} = ad-bc$$

Lesson 4.3 used this formula without explaining what it *means*.
Here's the meaning: think of the matrix's two columns, $(a,c)$ and
$(b,d)$, as two vectors. The determinant is the **signed area** of
the parallelogram they span — exactly the same parallelogram-area
idea from Lesson 4.3's cross product, but computed directly from the
$2\times2$ grid rather than via a $\mathbb{R}^3$ cross product's
magnitude.

**Sign matters.** The area is positive if the second column is
counterclockwise from the first (matching the standard orientation),
negative if clockwise — the determinant's sign records **whether the
transformation preserves or flips orientation**, the 2D analogue of
the cross product's right-hand-rule direction from Lesson 4.3.

```python
import numpy as np

def det_2x2(M):
    return M[0,0]*M[1,1] - M[0,1]*M[1,0]

# The identity matrix's columns span a unit square: area 1
I = np.array([[1,0],[0,1]])
print(f"det(I) = {det_2x2(I)}")   # 1: no scaling

# A matrix that doubles both axes: area scales by 4 (2x2)
scale2 = np.array([[2,0],[0,2]])
print(f"det(scale by 2) = {det_2x2(scale2)}")   # 4

# A matrix with swapped columns: orientation flips, area magnitude same
swapped = np.array([[0,1],[1,0]])
print(f"det(column swap) = {det_2x2(swapped)}")   # -1
```

**Walkthrough.** Each example is chosen to make the geometric claim
checkable rather than asserted: scaling both axes by 2 should
quadruple area (matching $\det=4$), and swapping columns — which
reverses which vector is "first" — flips the sign without changing
magnitude, directly demonstrating the orientation claim.

---

### The $3\times3$ Determinant: Cofactor Expansion

Lesson 4.3's cross product mnemonic used exactly this procedure
without naming it:

$$\det\begin{pmatrix}a_{11}&a_{12}&a_{13}\\a_{21}&a_{22}&a_{23}\\a_{31}&a_{32}&a_{33}\end{pmatrix}
= a_{11}\det\begin{pmatrix}a_{22}&a_{23}\\a_{32}&a_{33}\end{pmatrix} - a_{12}\det\begin{pmatrix}a_{21}&a_{23}\\a_{31}&a_{33}\end{pmatrix} + a_{13}\det\begin{pmatrix}a_{21}&a_{22}\\a_{31}&a_{32}\end{pmatrix}$$

This is **cofactor expansion along the first row**: for each entry in
the row, multiply it by the determinant of the $2\times2$ **minor**
left after deleting that entry's row and column, with alternating
signs $+,-,+$ (the "checkerboard" sign pattern, $(-1)^{i+j}$ for
position $(i,j)$).

**Hand-worked example:**
$$\det\begin{pmatrix}2&0&1\\1&3&-1\\0&2&4\end{pmatrix} = 2\det\begin{pmatrix}3&-1\\2&4\end{pmatrix} - 0 + 1\det\begin{pmatrix}1&3\\0&2\end{pmatrix}$$
$$= 2(12-(-2)) - 0 + 1(2-0) = 2(14)+2=30$$

```python
import numpy as np

def minor(M, row, col):
    """Delete the given row and column, return the smaller matrix."""
    return np.delete(np.delete(M, row, axis=0), col, axis=1)

def det_3x3(M):
    """3x3 determinant via cofactor expansion along the first row."""
    total = 0
    for col in range(3):
        sign = (-1) ** col
        total += sign * M[0, col] * det_2x2(minor(M, 0, col))
    return total

M = np.array([[2,0,1],[1,3,-1],[0,2,4]])
print(f"By hand:  {det_3x3(M)}")
print(f"np.linalg.det: {np.linalg.det(M):.4f}")
```

**Walkthrough.** `np.delete(np.delete(M, row, axis=0), col, axis=1)`
is a first appearance of `np.delete`: the inner call removes the
given `row` along `axis=0` (rows), the outer call then removes `col`
along `axis=1` (columns) from the result — together implementing
"cross out this row and column" exactly as the by-hand minor
procedure describes. `(-1) ** col` generates the alternating
$+,-,+,-,\dots$ sign pattern directly from the column index — even
columns (0, 2, ...) get $+1$, odd columns get $-1$, matching the
checkerboard rule.

---

### The General $n\times n$ Case: Recursive Definition

The pattern generalizes completely: cofactor-expand along the first
row of an $n\times n$ matrix, and each term needs the determinant of
an $(n-1)\times(n-1)$ minor — which is computed by cofactor-expanding
*that* matrix, and so on, bottoming out at the $2\times2$ (or even
$1\times1$, trivially just the single entry) base case.

```python
import numpy as np

def determinant(M):
    """
    General n x n determinant via recursive cofactor expansion.
    """
    n = M.shape[0]
    if n == 1:
        return M[0, 0]
    if n == 2:
        return M[0,0]*M[1,1] - M[0,1]*M[1,0]

    total = 0
    for col in range(n):
        sign = (-1) ** col
        sub_minor = minor(M, 0, col)
        total += sign * M[0, col] * determinant(sub_minor)   # recursive call
    return total

# Test against a 4x4 matrix
M4 = np.array([[1,2,0,1],[0,3,1,2],[2,1,0,0],[1,0,2,3]])
print(f"4x4 by hand:  {determinant(M4)}")
print(f"np.linalg.det: {np.linalg.det(M4):.4f}")
```

**Walkthrough.** `determinant(sub_minor)` — the function calling
*itself* on a smaller matrix — is a second appearance of recursion in
this curriculum (the first was Lesson 3.10's adaptive curve
sampling), and this one is the textbook example the technique is
usually taught with: the **base case** (`n==1` or `n==2`, computed
directly with no further recursion) stops the recursive descent, and
each recursive call operates on a strictly smaller matrix, guaranteeing
the recursion eventually reaches the base case rather than looping
forever — the same "guaranteed progress toward a stopping point"
requirement flagged informally for the curve-subdivision recursion in
Lesson 3.10, here made load-bearing rather than incidental. This
recursive definition is elegant but **computationally expensive** —
its cost roughly doubles with each additional dimension (formally,
$O(n!)$, a forward reference to Lesson 8.8) — which is exactly why
`np.linalg.det` internally uses a different, much faster method (row
reduction, closely related to Lesson 4.6's Gaussian elimination) for
anything beyond tiny matrices, even though this recursive definition
is the one that's mathematically primary and easiest to prove
properties from.

---

### Key Properties

- **$\det(A^T)=\det(A)$** — transposing doesn't change the
  determinant (expanding along a row versus the corresponding column
  gives the same answer, a fact this lesson states rather than proves
  in full).
- **Row swap flips the sign**: $\det$ of a matrix with two rows
  swapped is $-\det(A)$. This is *why* Lesson 4.6's partial pivoting
  is safe for determining singularity specifically: a swap can flip
  the sign but can never turn a nonzero determinant into zero or vice
  versa, so checking "is $\det=0$?" after pivoting still correctly
  answers "was the original system singular?"
- **A repeated (or all-zero) row makes $\det=0$**: geometrically, if
  two of the vectors spanning the parallelepiped are identical (or
  one is entirely zero), the shape collapses to zero volume.
- **$\det(AB)=\det(A)\det(B)$**: scaling factors multiply when
  transformations compose — apply transformation $B$ (scaling volume
  by $\det(B)$), then $A$ (scaling by $\det(A)$), and the combined
  effect scales by the product, matching Lesson 4.4's composition
  identity exactly, now for volume-scaling instead of point position.

```python
import numpy as np

A = np.array([[2,1],[0,3]])
B = np.array([[1,-1],[2,0]])

print(f"det(A)det(B) = {np.linalg.det(A) * np.linalg.det(B):.4f}")
print(f"det(AB)      = {np.linalg.det(A @ B):.4f}")

# Row swap flips sign
A_swapped = A[[1,0], :]   # swap the two rows
print(f"\ndet(A)         = {np.linalg.det(A):.4f}")
print(f"det(A, swapped) = {np.linalg.det(A_swapped):.4f}")

# Repeated row -> zero determinant
A_repeated = np.array([[1,2],[1,2]])
print(f"\ndet(repeated row) = {np.linalg.det(A_repeated):.4f}")
```

---

### Geometric Meaning in 3D: Volume, and $\det=0$ as Degeneracy

In $\mathbb{R}^3$, $|\det(M)|$ for a matrix whose three columns are
vectors $\mathbf u,\mathbf v,\mathbf w$ gives the volume of the
**parallelepiped** (a skewed 3D box) those three vectors span — the
direct 3D generalization of the $2\times2$ parallelogram-area
reading. $\det=0$ means the three vectors are **coplanar** (they all
lie flat in some 2D plane, with no genuine third dimension between
them) — the shape has collapsed to zero volume, exactly analogous to
Lesson 3.6's degenerate conic and Lesson 4.6's singular system: in
every case, $\det=0$ signals "a dimension has been lost."

```python
import numpy as np

def parallelepiped_volume(u, v, w):
    """Volume of the parallelepiped spanned by three 3D vectors."""
    M = np.column_stack([u, v, w])
    return abs(np.linalg.det(M))

u = np.array([1,0,0])
v = np.array([0,1,0])
w = np.array([0,0,1])
print(f"Unit cube volume: {parallelepiped_volume(u,v,w)}")   # 1

# Coplanar vectors -- should give zero volume
w_coplanar = np.array([1,1,0])   # lies in the u-v plane
print(f"Coplanar volume:  {parallelepiped_volume(u,v,w_coplanar)}")   # 0
```

---

### Manufacturing/CAD Application: Tetrahedral Mesh Validation

Finite Element Analysis (Stage 10.4) breaks a solid part into small
tetrahedra (4-vertex 3D elements) and solves physics equations
(stress, heat flow) over that mesh. Every tetrahedron's **volume must
be positive and non-negligible** for the analysis to be valid — a
degenerate (near-zero-volume) or **inverted** (negative-volume, from
vertices listed in an inconsistent order — recall Lesson 4.3's
winding-order sensitivity for triangle normals, the exact same issue
one dimension up) element will corrupt or crash the solver.

A tetrahedron's volume, given four vertices $P_0,P_1,P_2,P_3$, uses
three edge vectors from one shared vertex and the determinant
directly:

$$V = \frac{1}{6}\left|\det\begin{pmatrix}P_1-P_0\\P_2-P_0\\P_3-P_0\end{pmatrix}\right|$$

```python
import numpy as np

def tetrahedron_volume(p0, p1, p2, p3):
    """Volume of a tetrahedron given its 4 vertices."""
    edge1 = np.array(p1) - np.array(p0)
    edge2 = np.array(p2) - np.array(p0)
    edge3 = np.array(p3) - np.array(p0)
    M = np.column_stack([edge1, edge2, edge3])
    return abs(np.linalg.det(M)) / 6

def validate_mesh_element(p0, p1, p2, p3, min_volume=1e-6):
    """
    Check a tetrahedral mesh element for FEM validity: nonzero,
    non-negligible volume. Returns (is_valid, volume).
    """
    vol = tetrahedron_volume(p0, p1, p2, p3)
    return vol >= min_volume, vol

# A well-formed tetrahedron
tet1 = [(0,0,0), (1,0,0), (0,1,0), (0,0,1)]
valid, vol = validate_mesh_element(*tet1)
print(f"Regular tetrahedron: volume={vol:.4f}, valid={valid}")

# A degenerate element -- all 4 points nearly coplanar (a "sliver" element)
tet2 = [(0,0,0), (1,0,0), (0,1,0), (0.3, 0.3, 1e-8)]
valid2, vol2 = validate_mesh_element(*tet2)
print(f"Sliver element: volume={vol2:.8f}, valid={valid2}")

# Batch-check an entire mesh
mesh = [tet1, tet2, [(0,0,0),(2,0,0),(0,2,0),(0,0,2)]]
print(f"\nMesh validation:")
for i, tet in enumerate(mesh):
    valid, vol = validate_mesh_element(*tet)
    status = "OK" if valid else "DEGENERATE -- reject"
    print(f"  Element {i}: volume={vol:.6f}  {status}")
```

**Walkthrough.** `np.column_stack([edge1, edge2, edge3])` reuses the
design-matrix-building pattern first named in Lesson 3.6's conic
fitting, here assembling three edge vectors as the columns of a
$3\times3$ matrix specifically because the volume formula needs
$\det$ of exactly that column arrangement. The **sliver element**
test case is deliberately constructed with a genuinely tiny but
nonzero volume (`1e-8` in the last coordinate) rather than exactly
zero — real meshes rarely produce *exactly* degenerate elements
(floating-point and mesh-generation noise sees to that), but they
frequently produce *nearly* degenerate ones, which is precisely why
`validate_mesh_element` checks against a `min_volume` threshold
rather than checking for exact equality to zero — the same
tolerance-based thinking used for every floating-point comparison
since Lesson 3.2.

---

## Connect the Pieces

Concrete trace: validating three tetrahedral mesh elements before an
FEA solve.

1. **Edge vectors**: three displacement vectors from each
   tetrahedron's first vertex (Lesson 4.1's displacement reading of
   subtraction).
2. **Determinant**: `np.linalg.det`, no longer a black box — computed
   here (conceptually) via the same cofactor-expansion recursion
   built by hand earlier in this lesson, applied to the
   edge-vector matrix.
3. **Geometric meaning**: $|\det|/6$ is the tetrahedron's actual
   volume, the direct 3D generalization of the $2\times2$
   parallelogram-area and $3\times3$ parallelepiped-volume readings
   established earlier.
4. **Validity check**: a near-zero determinant means near-zero
   volume means a degenerate, unusable mesh element — the third
   distinct engineering context (after Lesson 3.6's conics and
   Lesson 4.6's singular systems) where "$\det\approx0$" means
   exactly "a dimension has collapsed."

---

## Summary

**$2\times2$ determinant** $ad-bc$: signed area of the parallelogram
spanned by the matrix's columns.

**$3\times3$ and general $n\times n$**: cofactor expansion, a
recursive procedure reducing to smaller minors, bottoming out at the
$2\times2$/$1\times1$ base case.

**Properties**: $\det(A^T)=\det(A)$; row swap flips sign; a repeated
or zero row forces $\det=0$; $\det(AB)=\det(A)\det(B)$.

**Geometric meaning, generalized**: $|\det|$ = volume (or hypervolume)
scaling factor / spanned-shape volume; $\det=0$ means a lost
dimension — unifying Lesson 3.6's degenerate conics, Lesson 4.6's
singular systems, and this lesson's degenerate mesh elements as the
same underlying fact.

**New Python/CS concepts:**
- `np.delete` — removing a row/column to build a minor
- Recursion with a base case and guaranteed-smaller recursive calls
  (second appearance, after Lesson 3.10)
- Determinant's factorial-scaling computational cost as a forward
  reference to Big-O (Lesson 8.8)

---

## Problems

### Math

**1.** Compute $\det\begin{pmatrix}3&1\\2&4\end{pmatrix}$ and
interpret its sign.

<details><summary>Answer</summary>
$3(4)-1(2)=10$. Positive: the columns $(3,2)$ and $(1,4)$ are
arranged counterclockwise (standard orientation preserved).
</details>

---

**2.** Compute $\det\begin{pmatrix}1&2&3\\0&1&4\\5&6&0\end{pmatrix}$
by cofactor expansion along the first row.

<details><summary>Answer</summary>
$1\det\begin{pmatrix}1&4\\6&0\end{pmatrix} - 2\det\begin{pmatrix}0&4\\5&0\end{pmatrix} + 3\det\begin{pmatrix}0&1\\5&6\end{pmatrix}$
$=1(0-24) - 2(0-20) + 3(0-5) = -24+40-15=1$.
</details>

---

**3.** Without computing fully, explain why
$\det\begin{pmatrix}2&4\\1&2\end{pmatrix}=0$.

<details><summary>Answer</summary>
Row 2 scaled by 2 equals row 1 — the rows are proportional (a
dependent system, echoing Lesson 4.6), so the two column vectors
$(2,1)$ and $(4,2)$ are actually parallel (one is a scalar multiple
of the other), spanning zero area rather than a genuine
parallelogram.
</details>

---

### Code Challenges

**Challenge 1 — Determinant from scratch**

```python
import numpy as np

def my_det(M):
    """Reimplement the recursive cofactor-expansion determinant."""
    pass

# --- tests: do not modify ---
M2 = np.array([[3,1],[2,4]])
assert my_det(M2) == 10

M3 = np.array([[2,0,1],[1,3,-1],[0,2,4]])
assert my_det(M3) == 30

M4 = np.array([[1,2,0,1],[0,3,1,2],[2,1,0,0],[1,0,2,3]])
assert math.isclose(my_det(M4), np.linalg.det(M4), abs_tol=1e-6)
print("✓ Challenge 1 passed!")
```

---

**Challenge 2 — Property verifier**

```python
import numpy as np

def verify_det_properties(A, B):
    """
    Return a dict of booleans checking:
    'transpose_invariant': det(A) == det(A.T)
    'multiplicative': det(A@B) == det(A)*det(B)
    'swap_flips_sign': det with rows 0,1 swapped == -det(A)  (assumes A is at least 2x2)
    """
    pass

# --- tests: do not modify ---
A = np.array([[2,1],[0,3]], dtype=float)
B = np.array([[1,-1],[2,0]], dtype=float)
results = verify_det_properties(A, B)
assert results['transpose_invariant']
assert results['multiplicative']
assert results['swap_flips_sign']
print("✓ Challenge 2 passed!")
```

---

**Challenge 3 — Mesh validator**

```python
import numpy as np

def tet_volume(p0, p1, p2, p3):
    """Reimplement tetrahedron_volume from the lesson."""
    pass

def validate_mesh(tetrahedra, min_volume=1e-6):
    """
    tetrahedra: list of 4-vertex tuples.
    Return a list of (index, volume, is_valid) for every element.
    """
    pass

# --- tests: do not modify ---
mesh = [
    [(0,0,0),(1,0,0),(0,1,0),(0,0,1)],           # valid
    [(0,0,0),(1,0,0),(2,0,0),(0,1,0)],           # degenerate: first 3 collinear-ish, check volume
]
results = validate_mesh(mesh)
assert results[0][2] == True
assert math.isclose(results[0][1], 1/6, abs_tol=1e-9)
assert results[1][2] == False
print("✓ Challenge 3 passed!")
```

---

### Extension

**4. ★** Using the property $\det(AB)=\det(A)\det(B)$, prove that if
$A$ is **singular** ($\det(A)=0$), then $AB$ is singular for *any*
matrix $B$ — i.e., a degenerate transformation stays degenerate no
matter what you compose it with afterward or before.

<details><summary>Answer</summary>
$\det(AB)=\det(A)\det(B)=0\cdot\det(B)=0$, for any $B$ whatsoever,
regardless of $\det(B)$'s value. So $AB$ is always singular whenever
$A$ is. Geometrically: if $A$ already crushes some direction down to
zero volume (a lost dimension), then applying $B$ before or after $A$
can't restore the dimension $A$ destroyed — a transformation that has
already lost information can't have that information un-lost by
composing with something else. This is exactly why Lesson 4.6's
partial pivoting swaps (which have $\det=\pm1$, never $0$) can never
turn a singular system non-singular, or vice versa — multiplying by a
nonzero-determinant permutation can't repair or introduce a lost
dimension.
</details>
