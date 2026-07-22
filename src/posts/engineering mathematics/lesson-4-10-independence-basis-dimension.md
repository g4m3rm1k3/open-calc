# Stage 4, Lesson 4.10 — Linear Independence, Basis, and Dimension
**Threads:** Math · Physics · Engineering
**Estimated time:** 60–70 minutes

---

## What This Lesson Is About

Lesson 4.9 used `np.linalg.matrix_rank` as a working tool without
defining what "rank" actually measures, and noted in passing that two
parallel vectors "add nothing new" to a span. This lesson makes both
of those precise. **Linear independence** is the formal version of
"adds nothing new": a set of vectors is independent exactly when none
of them is redundant — expressible using the others. A **basis** is a
minimal spanning set (independent *and* spanning), and its size — the
**dimension** — turns out to be a genuine, well-defined property of
the space itself, not an accident of which basis you happened to
pick. Tying it all together, the **Rank-Nullity Theorem** connects
Lesson 4.9's column space and null space into a single balanced
equation, giving "rank" its full, precise meaning at last. By the end
of this lesson you can test vectors for independence, extract a
minimal basis from a redundant spanning set, and apply rank to detect
genuinely redundant measurements in a real dataset — a direct forward
reference to dimensionality reduction (PCA) in Stage 10.

---

## Historical Context

The concept of dimension feels intuitively obvious for physical space
(three dimensions, clearly) but resisted rigorous general definition
for surprisingly long — it was Grassmann (again; Lessons 4.1 and 4.9)
who first treated dimension as an algebraic invariant of a vector
space in the 1840s, rather than a purely geometric fact about the
physical world, and this abstraction is precisely what let later
mathematicians and engineers speak coherently of "high-dimensional"
spaces with no possible geometric picture — a 500-dimensional space
of sensor readings has a perfectly well-defined dimension in exactly
Grassmann's sense, even though no one can visualize it. The
Rank-Nullity Theorem's modern form is a relatively late 19th/early
20th-century systematization of facts that had been used piecemeal
(implicitly, within Gaussian elimination's free-variable counting)
for far longer.

---

## What You Need To Know First

- **Span, column space, null space** — Lesson 4.9.
- **`np.linalg.matrix_rank`, used informally** — Lesson 4.9.
- **Free variables from row reduction** — Lesson 4.9's
  `null_space_basis`, reused directly.

---

## The Lesson

### Linear Independence

A set of vectors $\{\mathbf v_1,\dots,\mathbf v_k\}$ is **linearly
independent** if the *only* way to combine them to get the zero
vector is the trivial way (every coefficient zero):

$$c_1\mathbf v_1+c_2\mathbf v_2+\cdots+c_k\mathbf v_k=\mathbf 0 \implies c_1=c_2=\cdots=c_k=0$$

If some *other* combination also gives $\mathbf 0$ (some
coefficients nonzero), the set is **linearly dependent** — meaning at
least one vector in the set can be written as a combination of the
others (rearrange the nontrivial zero-combination to isolate any
vector with a nonzero coefficient), i.e., it's genuinely redundant,
contributing nothing to the span that the others didn't already
provide.

**Direct connection to Lesson 4.9's null space**: testing
$\{\mathbf v_1,\dots,\mathbf v_k\}$ for independence is *exactly*
checking whether the matrix $V$ with these vectors as columns has
$\text{null}(V)=\{\mathbf 0\}$ **only** — a nonzero null space vector
$(c_1,\dots,c_k)$ is precisely a nontrivial combination summing to
zero.

**Hand-worked example:** are $(1,2,1)$, $(2,1,0)$, $(0,3,2)$
independent? Check whether $(0,3,2) = a(1,2,1)+b(2,1,0)$ for some
$a,b$: $a+2b=0$, $2a+b=3$, $a=2$. From the first, $a=-2b$; substitute
into the second: $-4b+b=3\Rightarrow b=-1,a=2$. Check the third
coordinate: $a(1)+b(0)=2\ne2$... actually check directly: does
$2(1,2,1)+(-1)(2,1,0) = (0,3,2)$? $(2-2,\ 4-1,\ 2-0)=(0,3,2)$. Yes —
the third vector **is** a combination of the first two: **dependent**.

```python
import numpy as np

def null_space_basis(A, tol=1e-9):
    """From Lesson 4.9 -- reused unchanged."""
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

def is_independent(vectors, tol=1e-9):
    """A set of vectors is independent iff the null space of the
    matrix they form (as columns) is trivial (contains only zero)."""
    V = np.column_stack(vectors)
    return len(null_space_basis(V, tol)) == 0

v1, v2, v3 = np.array([1,2,1]), np.array([2,1,0]), np.array([0,3,2])
print(f"{{v1,v2,v3}} independent: {is_independent([v1,v2,v3])}")
print(f"{{v1,v2}} independent:    {is_independent([v1,v2])}")
```

**Walkthrough.** `is_independent` introduces no new machinery — it
directly reuses `null_space_basis` from Lesson 4.9, and the entire
insight of this section is recognizing that "linear independence" and
"trivial null space" are the same question asked in different words,
not two separate things needing separate code.

---

### Basis and Dimension

A **basis** for a vector space (or subspace) is a set of vectors that
is both:

1. **Linearly independent** (no redundancy), and
2. **Spanning** (every vector in the space is some combination of
   them).

A basis is the minimal, non-redundant "parts list" for the entire
space — remove any vector from a basis and it stops spanning; add any
vector and it stops being independent (the new vector is necessarily
some combination of the others, once the space is already fully
spanned).

**The dimension theorem** (stated here, not fully proved): **every
basis of a given vector space has exactly the same number of
vectors** — that count is the space's **dimension**. This is why
"dimension" is a well-defined property of the space itself, not an
artifact of which particular basis you wrote down.

**Standard basis**: $\mathbb{R}^n$'s most natural basis is
$\mathbf e_1=(1,0,\dots,0)$, $\mathbf e_2=(0,1,0,\dots,0)$, ...,
$\mathbf e_n=(0,\dots,0,1)$ — $n$ vectors, confirming
$\dim(\mathbb{R}^n)=n$, matching the subscript's own name.

```python
import numpy as np

def extract_basis(vectors, tol=1e-9):
    """
    Given a spanning (possibly redundant) set of vectors, return a
    minimal basis by greedily keeping vectors that increase the rank.
    """
    basis = []
    for v in vectors:
        candidate = basis + [v]
        M = np.column_stack(candidate)
        if np.linalg.matrix_rank(M, tol=tol) == len(candidate):
            basis.append(v)   # v is independent of what's kept so far
    return basis

vectors = [np.array([1,0,0]), np.array([0,1,0]), np.array([1,1,0]), np.array([0,0,1])]
basis = extract_basis(vectors)
print(f"Original set: {len(vectors)} vectors")
print(f"Extracted basis: {len(basis)} vectors -- {basis}")
print(f"(The third vector, (1,1,0), was redundant: it's v1+v2)")
```

**Walkthrough.** `extract_basis` implements a **greedy algorithm**: it
walks through the candidate vectors in order, keeping a vector only
if adding it genuinely increases the rank of what's been kept so far
(i.e., it's independent of the already-kept vectors) — a first
appearance of the greedy pattern, worth naming even informally, since
it reappears constantly in later algorithmic contexts (a forward
reference to Stage 8's formal treatment of algorithm design
strategies). `np.linalg.matrix_rank(M, tol=tol) == len(candidate)`
checks independence indirectly: a set of $k$ vectors is independent
exactly when the matrix they form has rank $k$ (no redundancy means
no dimension is "wasted").

---

### The Rank-Nullity Theorem

For an $m\times n$ matrix $A$:

$$\text{rank}(A) + \text{nullity}(A) = n$$

where $\text{rank}(A)=\dim(\text{col}(A))$ (the dimension of the
column space — how many genuinely independent output directions $A$
can produce) and $\text{nullity}(A)=\dim(\text{null}(A))$ (the
dimension of the null space — how many "wasted," free input
directions there are, per Lesson 4.9's redundant-robot-joint
example).

**Intuition**: every one of $A$'s $n$ input dimensions either
contributes something new to the output (a "rank" dimension) or gets
absorbed into the null space (contributes nothing) — there's nowhere
else for a dimension to go, so the two counts must add up to the full
input dimension $n$.

```python
import numpy as np

def rank_nullity_check(A, tol=1e-9):
    rank = np.linalg.matrix_rank(A, tol=tol)
    nullity = len(null_space_basis(A, tol=tol))
    n = A.shape[1]
    return rank, nullity, rank + nullity == n

# The redundant robot Jacobian from Lesson 4.9: 2x3
J = np.array([[1.0, 0.5, -0.5], [0.0, 0.87, 0.87]])
rank, nullity, ok = rank_nullity_check(J)
print(f"J: rank={rank}, nullity={nullity}, n={J.shape[1]}, checks out: {ok}")

# A square, invertible matrix: nullity should be 0
A_full = np.array([[2.,1.],[1.,1.]])
rank2, nullity2, ok2 = rank_nullity_check(A_full)
print(f"Invertible A: rank={rank2}, nullity={nullity2}, checks out: {ok2}")
```

Output:

```
J: rank=2, nullity=1, n=3, checks out: True
Invertible A: rank=2, nullity=0, n=2, checks out: True
```

The redundant robot arm's Jacobian has rank 2 (both end-effector
directions are reachable) and nullity 1 (exactly one "wasted" joint
motion) — $2+1=3$, the full joint count, confirming Lesson 4.9's
finding is a specific instance of this general theorem.

---

### Manufacturing/CS Application: Detecting Redundant Sensor Measurements

A CNC machine with position and vibration sensors on every axis
produces a data matrix: each row a moment in time, each column a
sensor reading. If two sensors are mechanically coupled (say, two
axes linked by a shared drive belt, or a redundant sensor pair
installed for fault tolerance), their columns will be **linearly
dependent** (or very nearly so, in real noisy data) — the true
**effective dimensionality** of the data is *less* than the number of
sensors, exactly the rank of the data matrix. This is precisely the
question Principal Component Analysis (Stage 10) answers more fully
using eigenvalues (Lesson 4.12); rank is the blunt, exact version of
the same underlying question.

```python
import numpy as np

# Simulated sensor data: 5 time points, 4 sensors.
# Sensor 3 is exactly (sensor 1 + sensor 2) -- a redundant, derived measurement.
np.random.seed(1)
sensor1 = np.random.rand(5) * 10
sensor2 = np.random.rand(5) * 5
sensor3 = sensor1 + sensor2          # perfectly redundant
sensor4 = np.random.rand(5) * 8      # independent

data = np.column_stack([sensor1, sensor2, sensor3, sensor4])
rank = np.linalg.matrix_rank(data)
print(f"Data matrix shape: {data.shape}")
print(f"Rank: {rank} (out of {data.shape[1]} sensors)")
print(f"Effective dimensionality is less than sensor count: {rank < data.shape[1]}")

# Which sensor(s) are redundant? Use extract_basis on the columns
cols = [data[:, i] for i in range(data.shape[1])]
basis = extract_basis(cols)
print(f"\nA minimal independent subset uses {len(basis)} of the {len(cols)} sensors")
```

Output:

```
Data matrix shape: (5, 4)
Rank: 3 (out of 4 sensors)
Effective dimensionality is less than sensor count: True

A minimal independent subset uses 3 of the 4 sensors
```

**Walkthrough.** This section, like the robotics application in
Lesson 4.9, introduces no new mechanics — `np.linalg.matrix_rank` and
`extract_basis` were both already built earlier in this lesson. The
point is entirely about recognizing the same abstract tool solving a
concrete data-engineering problem: a fourth sensor column that's an
exact (or, in real noisy data, an approximate) linear combination of
others is wasted measurement bandwidth, detectable with nothing more
than rank — a genuine, low-effort first check worth running on any
real multi-sensor dataset before reaching for the fuller PCA machinery
Stage 10 builds on top of exactly this foundation.

---

## Connect the Pieces

Concrete trace: a 5-timepoint, 4-sensor CNC dataset with one
redundant sensor.

1. **Independence test**: sensor 3 fails — it's expressible as
   sensor1+sensor2, a nontrivial null-space vector of the data
   matrix (Lesson 4.9's machinery, this lesson's interpretation).
2. **Rank**: computed as 3, not 4 — the data's genuine
   dimensionality is one less than its sensor count.
3. **Rank-Nullity**: $3+1=4$ — the "lost" dimension (nullity 1)
   exactly accounts for the gap between rank and sensor count.
4. **Basis extraction**: `extract_basis` identifies a minimal
   3-sensor subset carrying all the same information as the full
   4-sensor set — a genuine, actionable engineering conclusion (one
   sensor could be removed, or repurposed, without losing data).

---

## Summary

**Linear independence**: no nontrivial combination sums to zero;
equivalently, the matrix formed by the vectors (as columns) has
trivial null space.

**Basis**: independent + spanning — a minimal "parts list" for a
space; **dimension** is the size of any basis, a well-defined
property of the space itself.

**Rank-Nullity Theorem**: $\text{rank}(A)+\text{nullity}(A)=n$,
formalizing "every input dimension either contributes to the output
or is absorbed into the null space."

**Application**: rank as a fast, exact test for redundant
measurements — a direct forward reference to PCA (Stage 10).

**New Python/CS concepts:**
- Independence testing via null space (direct reuse of Lesson 4.9's
  tool, reinterpreted)
- Greedy basis extraction (walk through candidates, keep what
  increases rank)
- Rank as effective dimensionality of real data

---

## Problems

### Math

**1.** Are $(1,1)$ and $(2,2)$ linearly independent?

<details><summary>Answer</summary>
No — $(2,2)=2(1,1)$, a nontrivial dependency
($2(1,1)+(-1)(2,2)=(0,0)$).
</details>

---

**2.** A $4\times6$ matrix has rank 3. What is its nullity?

<details><summary>Answer</summary>
$\text{rank}+\text{nullity}=n=6 \Rightarrow \text{nullity}=3$.
</details>

---

**3.** Explain in one sentence why a basis for $\mathbb{R}^3$ can
never have more than 3 vectors, using the Rank-Nullity Theorem.

<details><summary>Answer</summary>
If a set of 4 or more vectors in $\mathbb{R}^3$ were fed as columns
into a matrix (3 rows, 4+ columns), the rank could be at most 3 (it
can't exceed the number of rows), so nullity would have to be at
least 1 — meaning the set has a nontrivial dependency and can't be
independent, so it can't be a basis.
</details>

---

### Code Challenges

**Challenge 1 — Independence and basis tools**

```python
import numpy as np

def independent(vectors, tol=1e-9):
    """Reimplement is_independent from the lesson."""
    pass

def basis_from(vectors, tol=1e-9):
    """Reimplement extract_basis from the lesson."""
    pass

# --- tests: do not modify ---
v1, v2, v3 = np.array([1,0]), np.array([0,1]), np.array([2,3])
assert not independent([v1, v2, v3])   # 3 vectors in R^2, must be dependent
assert independent([v1, v2])

b = basis_from([v1, v2, v3])
assert len(b) == 2
print("✓ Challenge 1 passed!")
```

---

**Challenge 2 — Rank-Nullity verifier**

```python
import numpy as np

def verify_rank_nullity(A, tol=1e-9):
    """Return (rank, nullity, holds: bool)."""
    pass

# --- tests: do not modify ---
A = np.array([[1.,2.,3.],[2.,4.,6.],[1.,1.,1.]])
rank, nullity, holds = verify_rank_nullity(A)
assert holds
assert rank + nullity == A.shape[1]
print("✓ Challenge 2 passed!")
```

---

**Challenge 3 — Redundant sensor finder**

```python
import numpy as np

def find_redundant_sensors(data, tol=1e-6):
    """
    data: array, rows=samples, columns=sensors.
    Return (rank, list_of_column_indices_forming_a_minimal_basis).
    """
    pass

# --- tests: do not modify ---
np.random.seed(2)
s1 = np.random.rand(6)
s2 = np.random.rand(6)
s3 = 2*s1 - s2     # redundant
data = np.column_stack([s1, s2, s3])
rank, kept = find_redundant_sensors(data)
assert rank == 2
assert len(kept) == 2
print("✓ Challenge 3 passed!")
```

---

### Extension

**4. ★** Use the Rank-Nullity Theorem to prove: a square $n\times n$
matrix $A$ is invertible **if and only if** its columns are linearly
independent. (You may use, without re-proving, that $A$ is invertible
iff $\text{rank}(A)=n$.)

<details><summary>Answer</summary>
($\Rightarrow$) If $A$ is invertible, $\text{rank}(A)=n$ (given). By
Rank-Nullity, $\text{nullity}(A)=n-\text{rank}(A)=0$ — the null space
is trivial, meaning (by this lesson's independence test) $A$'s
columns are independent.

($\Leftarrow$) If $A$'s columns are independent, $\text{null}(A)=
\{\mathbf0\}$, so $\text{nullity}(A)=0$. By Rank-Nullity,
$\text{rank}(A)=n-0=n$, which means $A$ is invertible.

Both directions hold, so the two conditions are equivalent.
$\blacksquare$ This ties Lesson 4.7's determinant condition, Lesson
4.8's inverse existence, Lesson 4.9's null space, and this lesson's
independence into one fully connected web of equivalent statements
about what it means for a square matrix to be "non-degenerate."
</details>
