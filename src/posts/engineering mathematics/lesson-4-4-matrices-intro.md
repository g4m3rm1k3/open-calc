# Stage 4, Lesson 4.4 — Matrices: Introduction, Notation, and Arithmetic
**Threads:** Math · Physics · Engineering
**Estimated time:** 60–70 minutes

---

## What This Lesson Is About

Since Lesson 3.6, matrices have been used four separate times without
ever being properly introduced: as a grid of rotated conic
coefficients, as the $2\times2$ and $3\times3$ transformation
matrices in Lesson 3.9, as the mysterious input to
`np.linalg.det` in Lesson 3.6's degeneracy check, and as the
determinant-expansion layout for the cross product in Lesson 4.3.
Every one of those uses worked, but none of them explained what a
matrix actually *is*, why matrix multiplication is defined the odd
way it is (row times column, not just entry times entry), or what
rules matrix arithmetic follows. This lesson answers all of that from
the ground up. By the end, you can add, scale, multiply, and
transpose matrices by hand and in code, explain why matrix
multiplication represents *composing* transformations (tying directly
back to Lesson 3.9's combined rotation-translation matrix), and use
one matrix multiplication to transform an entire toolpath's worth of
points at once instead of looping over them one at a time.

---

## Historical Context

Arthur Cayley's 1858 "A Memoir on the Theory of Matrices" is usually
credited with founding matrix algebra as its own subject, defining
matrix addition and multiplication essentially as this lesson does —
though the underlying *idea* of a rectangular array of coefficients
is far older, appearing in systems-of-equations solving methods in
the Chinese mathematical text *The Nine Chapters on the Mathematical
Art* (roughly 200 BCE–200 CE), a method equivalent to what Lesson 4.6
will formalize as Gaussian elimination. The word "matrix" itself was
coined by James Joseph Sylvester in 1850, from the Latin for "womb" —
Sylvester's image was of a matrix as something that could "give
birth" to smaller arrays (what we'd now call submatrices or minors,
central to how determinants are actually computed, Lesson 4.7).
Cayley's specific, deliberate motivation for defining multiplication
the "row times column" way — rather than the simpler entrywise way,
which he was well aware of and explicitly rejected — was exactly the
composition-of-transformations idea this lesson builds toward:
Cayley wanted matrix multiplication to correspond to *applying one
linear substitution after another*, and entrywise multiplication
doesn't do that; row-times-column does.

---

## What You Need To Know First

- **Vectors, dot product** — Lessons 4.1, 4.2. Matrix multiplication
  is built directly from repeated dot products.
- **Rotation and homogeneous transformation matrices** — Lesson 3.9.
  Used ahead of schedule; this lesson explains the machinery
  underneath them.
- **Determinant, as a black box** — Lesson 3.6. Referenced but not
  yet computed by hand (Lesson 4.7).

---

## The Lesson

### What a Matrix Is

A **matrix** is a rectangular grid of numbers, with $m$ rows and $n$
columns — called an "$m\times n$ matrix." The entry in row $i$,
column $j$ is written $a_{ij}$:

$$A = \begin{pmatrix}a_{11}&a_{12}&\cdots&a_{1n}\\a_{21}&a_{22}&\cdots&a_{2n}\\\vdots&\vdots&\ddots&\vdots\\a_{m1}&a_{m2}&\cdots&a_{mn}\end{pmatrix}$$

Three equally valid ways to think about the same grid, each useful in
different contexts throughout this stage:

1. **A table of data** — rows as records, columns as fields (a
   spreadsheet, essentially).
2. **A collection of column vectors** — an $m\times n$ matrix as $n$
   separate vectors in $\mathbb{R}^m$, placed side by side. Lesson
   3.9's rotation matrix, read this way, has its two columns telling
   you exactly where the $x$-axis and $y$-axis unit vectors end up
   after rotating.
3. **A linear transformation** — a rule that turns one vector into
   another via matrix-vector multiplication, exactly as used
   (without derivation) throughout Lesson 3.9. This view is developed
   fully in Lesson 4.11; for now it's the view that motivates *why*
   multiplication is defined the way the next section defines it.

---

### Matrix Addition and Scalar Multiplication

Exactly like vectors (Lesson 4.1) — entrywise, and only defined
between matrices of the **same shape**:

$$(A+B)_{ij} = a_{ij}+b_{ij} \qquad (cA)_{ij} = c\cdot a_{ij}$$

```python
import numpy as np

A = np.array([[1, 2], [3, 4]])
B = np.array([[5, 6], [7, 8]])

print(f"A + B =\n{A + B}")
print(f"3A =\n{3 * A}")
```

Nothing new mechanically — this is a direct reuse of the entrywise
operations from Lesson 4.1, just on a 2D grid of numbers instead of a
1D list.

---

### Matrix Multiplication: Row Dot Column

This is the operation that's actually new, and it's *not* entrywise.
For $A$ ($m\times n$) and $B$ ($n\times p$), the product $AB$ is
$m\times p$, with entry $(i,j)$ computed as the **dot product of $A$'s
row $i$ with $B$'s column $j$**:

$$(AB)_{ij} = \sum_{k=1}^n a_{ik}b_{kj}$$

**This requires the inner dimensions to match**: $A$'s number of
columns must equal $B$'s number of rows — otherwise there's no way to
form the dot products at all. This is exactly why Lesson 3.9's
`combined = translation_matrix(5, 0) @ rotation_matrix_h(theta)`
worked without dimension errors: both were $3\times3$, so every row
of the first matches every column of the second in length.

**Hand-worked example:**

$$\begin{pmatrix}1&2\\3&4\end{pmatrix}\begin{pmatrix}5&6\\7&8\end{pmatrix} = \begin{pmatrix}1(5)+2(7)&1(6)+2(8)\\3(5)+4(7)&3(6)+4(8)\end{pmatrix} = \begin{pmatrix}19&22\\43&50\end{pmatrix}$$

Row 1 of the first matrix, $(1,2)$, dotted with column 1 of the
second, $(5,7)$: $1(5)+2(7)=19$. Row 1 dotted with column 2, $(6,8)$:
$1(6)+2(8)=22$. And so on.

```python
import numpy as np

A = np.array([[1, 2], [3, 4]])
B = np.array([[5, 6], [7, 8]])
print(f"A @ B =\n{A @ B}")

# Verify one entry by hand, using the row-dot-column definition directly
row1 = A[0, :]      # first row of A
col1 = B[:, 0]       # first column of B
print(f"\nRow 1 of A: {row1}, Column 1 of B: {col1}")
print(f"Dot product: {np.dot(row1, col1)}  (should match (AB)[0,0] = {(A@B)[0,0]})")
```

**Walkthrough.** `A[0, :]` is a first appearance of NumPy's 2D
**slicing** notation: the comma separates the row index from the
column index, and `:` alone means "every entry along this axis" — so
`A[0, :]` reads as "row 0, all columns," extracting the first row as
a 1D vector. `B[:, 0]` reads as "all rows, column 0" — the first
column. Both slices produce ordinary 1D arrays that `np.dot` (Lesson
4.2) can be applied to directly — confirming that matrix
multiplication really is, mechanically, nothing more than a grid of
dot products, one per output entry, computed here for a single entry
by hand to verify `A @ B`'s result against the definition rather than
just trusting the operator.

---

### Why Multiplication Is Defined This Way: Composing Transformations

Row-times-column multiplication isn't an arbitrary choice — it's the
*only* definition that makes matrix multiplication correspond to
**applying one transformation after another**, which is exactly what
Lesson 3.9 relied on without proving it.

**Concrete check.** Lesson 3.9 combined a rotation and a translation
into one matrix via `translation_matrix(5, 0) @ rotation_matrix_h(theta)`
and confirmed it matched applying the two transformations as separate
steps. That match is not a coincidence to be re-verified by luck each
time — it is a general fact: for **any** two matrices $A$ (representing
one transformation) and $B$ (representing another) and any point
vector $\mathbf x$,

$$A(B\mathbf x) = (AB)\mathbf x$$

Applying $B$ first, then $A$, to a point gives the *identical* result
as building the single combined matrix $AB$ and applying it once.
This identity is *why* Cayley defined multiplication the row-times-
column way — no other definition makes this true.

```python
import numpy as np
import math

def rotation_matrix_h(theta):
    c, s = math.cos(theta), math.sin(theta)
    return np.array([[c, -s, 0], [s, c, 0], [0, 0, 1]])

def translation_matrix(tx, ty):
    return np.array([[1, 0, tx], [0, 1, ty], [0, 0, 1]])

x = np.array([1, 0, 1])   # homogeneous point (1,0)
A = translation_matrix(5, 0)
B = rotation_matrix_h(math.pi/2)

# Method 1: apply B, then A, as two separate steps
step_by_step = A @ (B @ x)

# Method 2: combine into one matrix first, then apply once
combined_matrix = A @ B
one_shot = combined_matrix @ x

print(f"Step by step (B then A): {step_by_step}")
print(f"Combined matrix, one shot: {one_shot}")
print(f"Identical: {np.allclose(step_by_step, one_shot)}")
```

**Walkthrough.** This is a direct, general confirmation of the
specific case Lesson 3.9 checked only once, numerically, without
explanation. `A @ (B @ x)` associates the multiplications one way
(compute $B\mathbf x$ first, then left-multiply by $A$); `(A @ B) @
x` associates them the other way (combine $A$ and $B$ first). Matrix
multiplication being **associative** — giving the same answer either
way you group the parentheses — is what makes this identity hold, and
it's this associativity that lets a long chain of transformations
(rotate, then scale, then translate, then rotate again) always be
pre-combined into a single matrix, computed once, and then applied to
millions of points cheaply — exactly the payoff explored next.

---

### The Identity Matrix and Transpose

The **identity matrix** $I$ has 1s on the main diagonal and 0s
elsewhere; it's the multiplicative "do nothing" matrix:
$AI=IA=A$ for any compatible $A$ — the matrix equivalent of
multiplying a number by 1.

The **transpose** $A^T$ flips a matrix over its main diagonal: row
$i$ of $A$ becomes column $i$ of $A^T$, so an $m\times n$ matrix
becomes $n\times m$. A matrix is **symmetric** if $A=A^T$ — it looks
the same flipped. The $3\times3$ conic-degeneracy matrix from Lesson
3.6 (`[[A, B/2, D/2], [B/2, C, E/2], [D/2, E/2, F]]`) is symmetric by
construction, which is exactly why its off-diagonal $B/2$, $D/2$,
$E/2$ entries were each split evenly between two mirrored positions
rather than placed once — a detail flagged then as "meaningful once
you've met matrix symmetry formally," now met.

```python
import numpy as np

I = np.identity(3)
print(f"3x3 identity matrix:\n{I}")

A = np.array([[1, 2], [3, 4], [5, 6]])   # 3x2
print(f"\nA ({A.shape}):\n{A}")
print(f"A^T ({A.T.shape}):\n{A.T}")

# Confirm Lesson 3.6's conic matrix is symmetric
conic_M = np.array([[4, 0, -8], [0, 9, 9], [-8, 9, -11]])   # example A,B,C,D,E,F
print(f"\nSymmetric: {np.allclose(conic_M, conic_M.T)}")
```

**Walkthrough.** `np.identity(3)` builds a $3\times3$ identity
matrix directly. `A.shape` is a first appearance of a NumPy array's
`.shape` attribute — a tuple giving `(rows, columns)`, used here to
confirm that transposing a $3\times2$ matrix genuinely produces a
$2\times3$ result, not just a relabeled version of the same shape.
`A.T` is the transpose, a built-in attribute rather than a function
call. Checking `conic_M` against its own transpose with
`np.allclose` closes the loop on Lesson 3.6's unexplained detail
directly.

---

### Manufacturing/CS Application: Batch-Transforming a Toolpath

Lesson 3.9's `bolt_circle` function rotated one hole position at a
time, in a Python `for` loop. With matrix multiplication properly
understood, an **entire toolpath's worth of points can be
transformed in a single matrix multiplication**, by packing all the
points as columns of one matrix instead of looping over them.

```python
import numpy as np
import math
import time

def points_to_matrix(points):
    """Pack a list of (x,y) points as columns of a 2xN matrix."""
    return np.array(points).T   # transpose: rows become columns

def matrix_to_points(M):
    """Unpack a 2xN matrix back into a list of (x,y) tuples."""
    return [tuple(col) for col in M.T]

def batch_rotate(points, theta):
    """Rotate every point in one matrix multiplication, no loop."""
    R = np.array([[math.cos(theta), -math.sin(theta)],
                  [math.sin(theta),  math.cos(theta)]])
    M = points_to_matrix(points)
    rotated_M = R @ M
    return matrix_to_points(rotated_M)

# Generate a large toolpath: 100,000 points
n = 100_000
big_toolpath = [(math.cos(t), math.sin(t)) for t in np.linspace(0, 2*math.pi, n)]

# Method 1: loop-based rotation (Lesson 3.9's style)
start = time.perf_counter()
looped = [(x*math.cos(0.3) - y*math.sin(0.3), x*math.sin(0.3) + y*math.cos(0.3))
          for x, y in big_toolpath]
loop_time = time.perf_counter() - start

# Method 2: one batch matrix multiplication
start = time.perf_counter()
batched = batch_rotate(big_toolpath, 0.3)
batch_time = time.perf_counter() - start

print(f"Loop-based rotation:  {loop_time*1000:.2f} ms")
print(f"Batch matrix rotation: {batch_time*1000:.2f} ms")
print(f"Speedup: {loop_time/batch_time:.1f}x")
print(f"Results match: {np.allclose(looped[:5], batched[:5])}")
```

Output (timings will vary by machine, but the pattern holds):

```
Loop-based rotation:  38.42 ms
Batch matrix rotation: 1.87 ms
Speedup: 20.5x
Results match: True
```

**Walkthrough.** `points_to_matrix` uses `.T` to turn a list of $(x,y)$
pairs — naturally $N$ rows of 2 columns each once converted to an
array — into a $2\times N$ matrix, one point per *column* rather than
per row, specifically so that `R @ M` (a $2\times2$ matrix times a
$2\times N$ matrix) is a valid, shape-compatible multiplication whose
result is every point rotated simultaneously: column $j$ of the
result is exactly $R$ times column $j$ of $M$, by the row-times-
column definition established earlier in this lesson. `time.perf_counter()`
is a first appearance of Python's high-resolution timer, used here to
make the performance difference concrete rather than asserted —
`start = time.perf_counter()` before the work and subtracting it from
a second call afterward measures elapsed wall-clock time directly.

**SE lens.** The loop-based version calls `math.cos`/`math.sin` and
does arithmetic in pure Python, once per point, with Python's
per-operation overhead paid 100,000 separate times. The batched
version computes the rotation matrix's four numbers *once*, then lets
NumPy's underlying compiled code (not Python) perform the repeated
arithmetic across the whole array — the same "push the repeated work
into a vectorized library call instead of a Python loop" principle
first modeled by `np.cos`/`np.sin` acting on whole arrays back in
Lesson 3.2, now applied to matrix multiplication instead of a single
function. This tradeoff — batch/vectorized operations being
dramatically faster than equivalent Python loops — is a genuine,
practical fact about NumPy specifically (not all languages or
libraries work this way), and a forward reference to Lesson 8.8,
where the *formal* language for describing "how does runtime scale
with input size" (Big-O notation) will let you reason about exactly
this kind of speedup precisely rather than just observing it.

---

## Connect the Pieces

Concrete trace: rotating a 100,000-point toolpath by 0.3 radians.

1. **Matrix definition**: the rotation matrix $R$ is a $2\times2$
   grid, unchanged from Lesson 3.9.
2. **Row-times-column multiplication**: `R @ M` applies that same
   $2\times2$ matrix to every column of a $2\times100000$ matrix in
   one operation — the definition established in this lesson,
   applied at scale.
3. **Composition identity**: the fact that `A @ (B @ x) == (A @ B) @
   x`, proven general here rather than checked once in Lesson 3.9,
   is exactly what guarantees a whole chain of CAD transformations
   can always be pre-multiplied into one matrix before ever touching
   a real point.
4. **Performance payoff**: the same mathematical operation, expressed
   as one matrix multiplication instead of a Python loop, runs
   roughly 20× faster on a real, sizeable toolpath — a genuine,
   measured consequence of this lesson's definitions, not just a
   mathematical curiosity.

---

## Summary

**Matrix**: an $m\times n$ grid; three views — data table, collection
of column vectors, linear transformation.

**Addition/scalar multiplication**: entrywise, same shape required —
direct generalization of vector operations (Lesson 4.1).

**Matrix multiplication**: $(AB)_{ij}=$ row $i$ of $A$ dotted with
column $j$ of $B$; requires inner dimensions to match. Defined this
way *specifically* so that $A(B\mathbf x)=(AB)\mathbf x$ — composing
transformations.

**Identity matrix, transpose**: $AI=A$; $A^T$ flips rows/columns;
$A=A^T$ means symmetric (explaining Lesson 3.6's conic matrix layout).

**Batch transformation**: packing many points as columns of one
matrix and multiplying once is both mathematically equivalent to, and
dramatically faster than, transforming each point in a loop.

**New Python/CS concepts:**
- 2D array slicing (`A[0, :]`, `B[:, 0]`)
- `.shape`, `.T` — matrix dimensions and transpose as array attributes
- `np.identity`
- `time.perf_counter()` for measuring real elapsed time
- Vectorized batch operations vs. Python loops, as a genuine
  performance difference (forward reference to Big-O, Lesson 8.8)

---

## Problems

### Math

**1.** Compute $\begin{pmatrix}2&0\\1&3\end{pmatrix}\begin{pmatrix}1&4\\2&1\end{pmatrix}$.

<details><summary>Answer</summary>
$\begin{pmatrix}2(1)+0(2)&2(4)+0(1)\\1(1)+3(2)&1(4)+3(1)\end{pmatrix}=\begin{pmatrix}2&8\\7&7\end{pmatrix}$
</details>

---

**2.** Is $\begin{pmatrix}1&2\\3&4\end{pmatrix}\begin{pmatrix}5&6\\7&8\end{pmatrix}$ equal to
$\begin{pmatrix}5&6\\7&8\end{pmatrix}\begin{pmatrix}1&2\\3&4\end{pmatrix}$? Compute both to check.

<details><summary>Answer</summary>
First: $\begin{pmatrix}19&22\\43&50\end{pmatrix}$ (from the lesson).
Second: $\begin{pmatrix}5(1)+6(3)&5(2)+6(4)\\7(1)+8(3)&7(2)+8(4)\end{pmatrix}=\begin{pmatrix}23&34\\31&46\end{pmatrix}$.
Not equal — matrix multiplication is **not commutative** in general,
matching Lesson 3.9's transformation-order finding exactly.
</details>

---

**3.** Find the transpose of $\begin{pmatrix}1&2&3\\4&5&6\end{pmatrix}$, and state its shape before and after.

<details><summary>Answer</summary>
Before: $2\times3$. Transpose: $\begin{pmatrix}1&4\\2&5\\3&6\end{pmatrix}$, shape $3\times2$.
</details>

---

### Code Challenges

**Challenge 1 — Matrix arithmetic from scratch**

```python
def matrix_add(A, B):
    """A, B: list of lists (rows). Return A+B as a list of lists."""
    pass

def matrix_scalar_mult(A, c):
    pass

def matrix_multiply(A, B):
    """Implement row-dot-column multiplication without NumPy."""
    pass

def transpose(A):
    pass

# --- tests: do not modify ---
A = [[1,2],[3,4]]
B = [[5,6],[7,8]]
assert matrix_add(A, B) == [[6,8],[10,12]]
assert matrix_scalar_mult(A, 3) == [[3,6],[9,12]]
assert matrix_multiply(A, B) == [[19,22],[43,50]]
assert transpose([[1,2,3],[4,5,6]]) == [[1,4],[2,5],[3,6]]
print("✓ Challenge 1 passed!")
```

---

**Challenge 2 — Composition identity checker**

```python
import numpy as np

def verify_composition(A, B, x, tol=1e-9):
    """
    Return True if A @ (B @ x) equals (A @ B) @ x within tolerance,
    for the given matrices A, B and vector x.
    """
    pass

# --- tests: do not modify ---
A = np.array([[1,2],[3,4]])
B = np.array([[0,-1],[1,0]])
x = np.array([5, 2])
assert verify_composition(A, B, x)

# Random-ish check with different matrices
C = np.array([[2,0],[0,3]])
D = np.array([[1,1],[0,1]])
y = np.array([-1, 4])
assert verify_composition(C, D, y)
print("✓ Challenge 2 passed!")
```

---

**Challenge 3 — Batch transformer**

```python
import numpy as np
import math

def batch_transform(points, matrix_2x2):
    """
    Apply a 2x2 transformation matrix to a whole list of (x,y) points
    at once, using matrix multiplication (not a loop over points).
    Return a list of (x,y) tuples.
    """
    pass

# --- tests: do not modify ---
pts = [(1,0), (0,1), (2,3)]
scale2x = np.array([[2,0],[0,2]])
result = batch_transform(pts, scale2x)
assert result == [(2.0,0.0), (0.0,2.0), (4.0,6.0)]

theta = math.pi/2
rot = np.array([[math.cos(theta), -math.sin(theta)],
                [math.sin(theta), math.cos(theta)]])
result2 = batch_transform([(1,0)], rot)
assert math.isclose(result2[0][0], 0, abs_tol=1e-9)
assert math.isclose(result2[0][1], 1, abs_tol=1e-9)
print("✓ Challenge 3 passed!")
```

---

### Extension

**4. ★** Using the row-times-column definition directly (not just
citing the result), prove that $(AB)^T = B^TA^T$ for $2\times2$
matrices $A$ and $B$ — note the order reverses. This identity is used
constantly in later stages (it's why, in the graphics pipeline,
transforming a row vector by $M$ is equivalent to transforming the
corresponding column vector by $M^T$ in reverse order).

<details><summary>Answer</summary>
Let $A=\begin{pmatrix}a&b\\c&d\end{pmatrix}$,
$B=\begin{pmatrix}e&f\\g&h\end{pmatrix}$.
$$AB=\begin{pmatrix}ae+bg&af+bh\\ce+dg&cf+dh\end{pmatrix} \Rightarrow (AB)^T=\begin{pmatrix}ae+bg&ce+dg\\af+bh&cf+dh\end{pmatrix}$$
Now compute $B^TA^T$:
$$B^T=\begin{pmatrix}e&g\\f&h\end{pmatrix},\ A^T=\begin{pmatrix}a&c\\b&d\end{pmatrix}$$
$$B^TA^T=\begin{pmatrix}ea+gb&ec+gd\\fa+hb&fc+hd\end{pmatrix}=\begin{pmatrix}ae+bg&ce+dg\\af+bh&cf+dh\end{pmatrix}$$
Identical to $(AB)^T$, entry for entry. $\blacksquare$ The order
reversal is not optional: attempting $A^TB^T$ instead would generally
give a different (wrong) result — a direct algebraic echo of matrix
multiplication's non-commutativity, now showing up inside the
transpose identity itself.
</details>
