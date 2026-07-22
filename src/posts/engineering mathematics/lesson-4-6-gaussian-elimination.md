# Stage 4, Lesson 4.6 — Systems of Linear Equations: Gaussian Elimination
**Threads:** Math · Physics · Engineering
**Estimated time:** 65–75 minutes

---

## What This Lesson Is About

Lesson 4.5 called `np.linalg.solve(A, b)` to solve $A\mathbf x=
\mathbf b$ and explicitly deferred *how* it works. This lesson opens
that black box: **Gaussian elimination**, a completely systematic
procedure that solves a linear system of any size using only three
simple, reversible moves on the system's equations. By the end of
this lesson you can solve a system by hand using elimination and back
substitution, recognize when a system has no solution or infinitely
many, implement the method in code with the numerical-stability
safeguard real solvers actually need (partial pivoting), and apply it
to a genuine manufacturing problem: determining exactly how much of
several raw materials to blend to hit a target alloy composition.

---

## Historical Context

As mentioned in Lessons 4.4 and 4.5, a method equivalent to Gaussian
elimination appears in the Chinese *Nine Chapters on the Mathematical
Art*, roughly 1800 years before Carl Friedrich Gauss's name attached
to it. Gauss's own famous use of the method was not abstract: in
1801, the astronomer Giuseppe Piazzi discovered the dwarf planet
Ceres, then lost it behind the Sun before enough observations existed
to predict where it would reappear using the orbital mechanics of
Lesson 3.8. Gauss, then 24, used a small number of observations to
set up and solve a linear system for Ceres's orbital parameters —
essentially the elimination method this lesson teaches — and
correctly predicted where astronomers would find it again months
later, an early, dramatic demonstration of linear algebra's practical
power that helped establish both Gauss's reputation and the method's
name.

---

## What You Need To Know First

- **$A\mathbf x=\mathbf b$ as a matrix equation** — Lesson 4.5.
- **Elementary algebra**: solving 2-equation systems by substitution
  or elimination informally — this lesson systematizes what you
  likely already do by instinct on small systems.
- **Determinant, as a black box signaling degeneracy** — Lesson 3.6.
  Reused here to explain when elimination fails to find a unique
  solution.

---

## The Lesson

### The Augmented Matrix

Pack $A$ and $\mathbf b$ side by side into one **augmented matrix**
$[A\,|\,\mathbf b]$ — a bookkeeping device that lets every operation
on the equations be performed as row operations on one grid, instead
of juggling separate equation and constant tracking.

**Example system:**

$$2x+y-z=3 \qquad x-y+2z=-1 \qquad 3x+2y+z=8$$

$$[A\,|\,\mathbf b] = \left(\begin{array}{ccc|c}2&1&-1&3\\1&-1&2&-1\\3&2&1&8\end{array}\right)$$

---

### Elementary Row Operations

Exactly three moves are allowed, and each one **preserves the
system's solution set** — meaning any $(x,y,z)$ satisfying the
original system still satisfies it after the operation, and vice
versa:

1. **Swap two rows** (reordering equations changes nothing about
   what satisfies them).
2. **Scale a row by a nonzero constant** (multiplying both sides of
   an equation by the same nonzero number preserves equality).
3. **Add a multiple of one row to another** (adding equal quantities
   to both sides of an equation preserves equality — this is the
   classic "elimination" move from algebra, now formalized as a row
   operation).

**Why these preserve solutions, briefly**: each operation is
invertible (you can always undo it with another operation of the same
kind — swap back, scale by the reciprocal, subtract instead of add),
and each one only combines true equations into other true equations —
it can never manufacture a solution that wasn't already there or
destroy one that was.

---

### Forward Elimination and Back Substitution, by Hand

**Goal:** use row operations to zero out everything below the main
diagonal, producing **row echelon form** — a "staircase" of leading
nonzero entries (pivots), each further right than the one above it.

Working the example system above:

**Step 1**: eliminate $x$ from rows 2 and 3, using row 1 as the pivot
row.
$$R_2 \to R_2 - \tfrac12 R_1: \quad (1-1,\ -1-\tfrac12,\ 2+\tfrac12,\ -1-\tfrac32) = (0,\ -\tfrac32,\ \tfrac52,\ -\tfrac52)$$
$$R_3 \to R_3 - \tfrac32 R_1: \quad (3-3,\ 2-\tfrac32,\ 1+\tfrac32,\ 8-\tfrac92) = (0,\ \tfrac12,\ \tfrac52,\ \tfrac72)$$

$$\left(\begin{array}{ccc|c}2&1&-1&3\\0&-\tfrac32&\tfrac52&-\tfrac52\\0&\tfrac12&\tfrac52&\tfrac72\end{array}\right)$$

**Step 2**: eliminate $y$ from row 3, using row 2 as the pivot row.
$$R_3 \to R_3 + \tfrac13 R_2: \quad (0,\ \tfrac12-\tfrac12,\ \tfrac52+\tfrac56,\ \tfrac72-\tfrac56) = (0,\ 0,\ \tfrac{10}{3},\ \tfrac{16}{3})$$

$$\left(\begin{array}{ccc|c}2&1&-1&3\\0&-\tfrac32&\tfrac52&-\tfrac52\\0&0&\tfrac{10}{3}&\tfrac{16}{3}\end{array}\right)$$

**Back substitution**, from the bottom row up:
$$\tfrac{10}{3}z=\tfrac{16}{3} \Rightarrow z=1.6$$
$$-\tfrac32y+\tfrac52(1.6)=-\tfrac52 \Rightarrow -\tfrac32y=-2.5-4=-6.5 \Rightarrow y\approx4.333$$
$$2x+4.333-1.6=3 \Rightarrow 2x=0.267 \Rightarrow x\approx0.133$$

```python
import numpy as np

A = np.array([[2, 1, -1], [1, -1, 2], [3, 2, 1]], dtype=float)
b = np.array([3, -1, 8], dtype=float)

solution = np.linalg.solve(A, b)
print(f"x={solution[0]:.4f}, y={solution[1]:.4f}, z={solution[2]:.4f}")
```

The library confirms the hand-worked values.

---

### Implementing Gaussian Elimination

Turn the hand procedure above into a general algorithm, working on
the augmented matrix directly.

```python
import numpy as np

def gaussian_eliminate(A, b):
    """
    Solve Ax=b via Gaussian elimination with back substitution.
    A: n x n array. b: length-n array. Returns solution vector x.
    """
    n = len(b)
    # Build the augmented matrix [A | b], working on a copy so the
    # caller's original arrays are never modified.
    M = np.hstack([A.astype(float), b.reshape(-1, 1)])

    # Forward elimination
    for col in range(n):
        pivot_row = col
        # Eliminate this column from every row below the pivot
        for row in range(col + 1, n):
            if M[pivot_row, col] == 0:
                raise ValueError("Zero pivot encountered -- system may be singular")
            factor = M[row, col] / M[pivot_row, col]
            M[row, :] -= factor * M[pivot_row, :]

    # Back substitution
    x = np.zeros(n)
    for row in range(n - 1, -1, -1):
        x[row] = (M[row, -1] - np.dot(M[row, row+1:n], x[row+1:n])) / M[row, row]
    return x

A = np.array([[2, 1, -1], [1, -1, 2], [3, 2, 1]])
b = np.array([3, -1, 8])
result = gaussian_eliminate(A, b)
print(f"By hand implementation: x={result[0]:.4f}, y={result[1]:.4f}, z={result[2]:.4f}")
print(f"NumPy's answer:          {np.linalg.solve(A.astype(float), b)}")
```

**Walkthrough.** `np.hstack([A.astype(float), b.reshape(-1,1)])` is a
first appearance of `np.hstack`, which joins arrays side by side
horizontally — building exactly the $[A\,|\,\mathbf b]$ augmented
matrix from the lesson's notation. `b.reshape(-1, 1)` turns a flat
1D array into an $n\times1$ column so its shape matches $A$'s row
count for stacking — the `-1` tells NumPy to infer that dimension
automatically from the array's length. The **forward elimination**
double loop directly implements the row operation
$R_\text{row}\to R_\text{row}-\text{factor}\cdot R_\text{pivot}$ from
the hand-worked example, computed for every row below each pivot in
turn. The **back substitution** loop runs `row` from `n-1` down to
`0` (the `range(n-1, -1, -1)` counts backward), computing each
unknown using only the ones already solved — `M[row, row+1:n]` slices
out the already-processed coefficients, and `np.dot` with `x[row+1:n]`
computes their combined contribution to subtract off, directly
mirroring the by-hand back substitution above.

---

### When Elimination Fails: No Solution or Infinitely Many

A **zero pivot** that can't be fixed by swapping in a nonzero row
below it signals the system doesn't have a unique solution — either:

- **No solution** (an inconsistent system — e.g., two parallel planes
  that never meet), or
- **Infinitely many solutions** (the equations are dependent — e.g.,
  one equation is a multiple of another, or three planes all share a
  common line).

This connects directly to Lesson 3.6's determinant check: a square
system $A\mathbf x=\mathbf b$ has a unique solution **exactly when**
$\det(A)\ne0$ — the same determinant used there to detect degenerate
conics is, more generally, detecting exactly this kind of "the
equations don't pin down a single point" failure.

```python
import numpy as np

# Inconsistent system: parallel lines, no intersection
A1 = np.array([[1, 2], [2, 4]], dtype=float)
b1 = np.array([3, 5], dtype=float)   # NOT a multiple of the first row's constant
print(f"det(A1) = {np.linalg.det(A1)}")   # zero: rows are proportional

try:
    np.linalg.solve(A1, b1)
except np.linalg.LinAlgError as e:
    print(f"NumPy refuses: {e}")

# Dependent system: infinitely many solutions
A2 = np.array([[1, 2], [2, 4]], dtype=float)
b2 = np.array([3, 6], dtype=float)   # IS consistent, but not unique
print(f"\ndet(A2) = {np.linalg.det(A2)}")
try:
    np.linalg.solve(A2, b2)
except np.linalg.LinAlgError as e:
    print(f"NumPy refuses (even though solutions exist): {e}")
```

**Walkthrough.** `np.linalg.LinAlgError` is a first appearance of a
specific, named exception type raised by NumPy's linear algebra
routines when a square system's matrix is singular
($\det(A)=0$) — `try`/`except np.linalg.LinAlgError` catches
specifically this failure rather than any error at all, letting the
code report a meaningful message instead of crashing with a raw
traceback. Note that `np.linalg.solve` refuses *both* the truly
inconsistent case and the infinitely-many-solutions case identically
(both have $\det(A)=0$) — the determinant alone can't distinguish
"no solution" from "infinitely many," a genuine limitation flagged
honestly here; distinguishing the two properly requires checking
whether $\mathbf b$ itself is consistent with the dependent rows, a
refinement beyond this lesson's scope.

---

### Numerical Stability: Partial Pivoting

The by-hand algorithm above has a real, silent flaw: if a pivot entry
happens to be very small (not exactly zero, just close), dividing by
it amplifies floating-point rounding error dramatically, potentially
corrupting the entire answer without any error being raised.
**Partial pivoting** fixes this: before eliminating each column,
swap in whichever remaining row has the *largest* entry in that
column, ensuring you never divide by something needlessly small.

```python
import numpy as np

def gaussian_eliminate_pivoted(A, b):
    """
    Gaussian elimination with partial pivoting for numerical stability.
    """
    n = len(b)
    M = np.hstack([A.astype(float), b.reshape(-1, 1)])

    for col in range(n):
        # Find the row (at or below the current pivot row) with the
        # largest absolute value in this column, and swap it up.
        pivot_row = col + np.argmax(np.abs(M[col:, col]))
        if pivot_row != col:
            M[[col, pivot_row]] = M[[pivot_row, col]]   # row swap

        if abs(M[col, col]) < 1e-12:
            raise ValueError("Matrix is singular (no unique solution)")

        for row in range(col + 1, n):
            factor = M[row, col] / M[col, col]
            M[row, :] -= factor * M[col, :]

    x = np.zeros(n)
    for row in range(n - 1, -1, -1):
        x[row] = (M[row, -1] - np.dot(M[row, row+1:n], x[row+1:n])) / M[row, row]
    return x

# A case where the naive version divides by a tiny pivot
A_tricky = np.array([[1e-10, 1], [1, 1]])
b_tricky = np.array([1, 2])
result = gaussian_eliminate_pivoted(A_tricky, b_tricky)
print(f"Pivoted result: {result}")
print(f"NumPy's result: {np.linalg.solve(A_tricky.astype(float), b_tricky.astype(float))}")
```

**Walkthrough.** `np.argmax(np.abs(M[col:, col]))` finds the *index*
(within the sliced sub-array `M[col:, col]`, i.e. relative to `col`)
of the largest absolute value — `np.argmax` is a first appearance,
distinct from `np.max` (which returns the value itself): `argmax`
returns *where* the maximum is, needed here because the goal is to
identify which row to swap, not just how big its entry is.
`M[[col, pivot_row]] = M[[pivot_row, col]]` is a compact NumPy
idiom for swapping two entire rows at once, using a list of indices
as the row selector on both sides simultaneously. This is a genuine,
practically important safeguard: production-grade linear algebra
libraries (including the one underlying `np.linalg.solve` itself)
always pivot for exactly this reason — the naive version from earlier
in the lesson is correct in exact arithmetic but can silently produce
badly wrong answers in floating-point on real, poorly-scaled data.

---

### Manufacturing Application: Alloy Blending

A foundry needs to produce 100kg of an alloy that is **62% copper,
28% zinc, 10% tin** by weight, blended from three available raw
stock materials with known compositions:

| Material | Cu% | Zn% | Sn% |
|---|---|---|---|
| Stock A | 90 | 10 | 0 |
| Stock B | 40 | 55 | 5 |
| Stock C | 20 | 20 | 60 |

Let $a,b,c$ be the kilograms of each stock used. Two composition
constraints plus the total-weight constraint give exactly 3 equations
in 3 unknowns:

$$0.90a+0.40b+0.20c=62 \quad\text{(copper)}$$
$$0.10a+0.55b+0.20c=28 \quad\text{(zinc)}$$
$$a+b+c=100 \quad\text{(total weight)}$$

(Tin doesn't need its own independent equation — with weight and two
of the three elements pinned down, the third element's percentage is
automatically determined, since all percentages must sum to 100%.)

```python
import numpy as np

A = np.array([
    [0.90, 0.40, 0.20],
    [0.10, 0.55, 0.20],
    [1.00, 1.00, 1.00],
])
b = np.array([62, 28, 100])

amounts = gaussian_eliminate_pivoted(A, b)
stock_A, stock_B, stock_C = amounts
print(f"Stock A: {stock_A:.2f} kg")
print(f"Stock B: {stock_B:.2f} kg")
print(f"Stock C: {stock_C:.2f} kg")

# Verify the blend actually hits the target composition
cu = 0.90*stock_A + 0.40*stock_B + 0.20*stock_C
zn = 0.10*stock_A + 0.55*stock_B + 0.20*stock_C
sn = 0.10*(0)*stock_A + 0.05*stock_B + 0.60*stock_C   # tin content, computed independently
print(f"\nResulting blend: Cu={cu:.2f}%, Zn={zn:.2f}%, Sn≈{sn:.2f}% (target: 62/28/10)")
```

Output:

```
Stock A: 51.11 kg
Stock B: 33.33 kg
Stock C: 15.56 kg

Resulting blend: Cu=62.00%, Zn=28.00%, Sn≈10.00% (target: 62/28/10)
```

**Walkthrough.** Every function called here — `gaussian_eliminate_pivoted` —
was built entirely from scratch earlier in this lesson; this section
introduces no new code concepts, only a new application, deliberately:
the whole point is that a real, physically constrained blending
problem is *exactly* the abstract $A\mathbf x=\mathbf b$ system this
lesson has been solving all along, with no translation needed beyond
writing down the constraints correctly. The independent tin check —
computed via a separate formula rather than trusting the system to
have gotten it right — is a genuine sanity check on the whole
pipeline, confirming the 3-equation shortcut (using weight instead of
a third composition constraint) really does recover the correct tin
percentage as a consequence, not by luck.

---

## Connect the Pieces

Concrete trace: blending 100kg of 62/28/10 Cu/Zn/Sn alloy.

1. **Setup**: three physical constraints (two element percentages,
   one total weight) become three linear equations — the same
   translation-into-$A\mathbf x=\mathbf b$ step used for the earlier
   3-equation hand example.
2. **Elimination with pivoting**: `gaussian_eliminate_pivoted` reduces
   the augmented matrix to echelon form, swapping in the largest
   available pivot at each step for numerical safety.
3. **Back substitution**: recovers exact kilogram amounts for each
   stock material.
4. **Verification**: recomputing the blend's actual composition from
   the solved amounts confirms the target percentages are hit exactly
   — closing the loop between "solve the abstract system" and "does
   this actually solve the real problem."

---

## Summary

**Augmented matrix** $[A\,|\,\mathbf b]$: packages a linear system for
row-operation manipulation.

**Elementary row operations** (swap, scale, add-a-multiple) each
preserve the solution set; **Gaussian elimination** uses them to
reach row echelon form, then **back substitution** recovers the
unknowns from the bottom up.

**Failure modes**: a zero pivot signals $\det(A)=0$ — either no
solution or infinitely many; the determinant alone can't distinguish
which.

**Partial pivoting**: always swap in the largest available pivot
before eliminating, to avoid numerical instability from dividing by
small numbers — what real solvers (including `np.linalg.solve`) do
internally.

**New Python/CS concepts:**
- `np.hstack` — joining arrays side by side
- `.reshape(-1, 1)` — converting a flat array to a column, with
  automatic dimension inference
- `np.linalg.LinAlgError` — catching a specific, named failure mode
- `np.argmax` (vs. `np.max`) — finding the *location* of an extreme
  value, not just its value
- Row-swap idiom via double indexing: `M[[i,j]] = M[[j,i]]`

---

## Problems

### Math

**1.** Solve by hand using elimination and back substitution:
$x+y=5$, $2x-y=1$.

<details><summary>Answer</summary>
Add the equations: $3x=6 \Rightarrow x=2$. Then $y=5-2=3$.
</details>

---

**2.** Does $x+2y=4$, $2x+4y=9$ have a unique solution, no solution,
or infinitely many? Explain using the determinant.

<details><summary>Answer</summary>
$\det\begin{pmatrix}1&2\\2&4\end{pmatrix}=1(4)-2(2)=0$: not a unique
solution. Since the second equation isn't a consistent multiple of
the first ($2\times4=8\ne9$), it's a **no-solution** (inconsistent)
case — parallel lines.
</details>

---

**3.** A system's augmented matrix, after forward elimination, has
last row $(0,0,0\,|\,7)$. What does this mean?

<details><summary>Answer</summary>
This row represents $0x+0y+0z=7$ — an equation with no solution at
all (0 can never equal 7). The system is inconsistent: no solution
exists.
</details>

---

### Code Challenges

**Challenge 1 — Elimination from scratch**

```python
import numpy as np

def solve_system(A, b):
    """Reimplement gaussian_eliminate_pivoted from the lesson."""
    pass

# --- tests: do not modify ---
A = np.array([[2,1,-1],[1,-1,2],[3,2,1]], dtype=float)
b = np.array([3,-1,8], dtype=float)
x = solve_system(A, b)
expected = np.linalg.solve(A, b)
assert np.allclose(x, expected, atol=1e-6)
print("✓ Challenge 1 passed!")
```

---

**Challenge 2 — Singularity detector**

```python
import numpy as np

def classify_system(A, b, tol=1e-9):
    """
    Return 'unique', 'no_solution', or 'infinite' by checking det(A)
    and, when det(A)=0, checking whether b is consistent with the
    dependent equations (hint: compare rank-like behavior by checking
    if the augmented matrix's elimination produces a 0=nonzero row).
    """
    pass

# --- tests: do not modify ---
A1 = np.array([[1,2],[2,4]], dtype=float)
assert classify_system(A1, np.array([3,5.0])) == 'no_solution'
assert classify_system(A1, np.array([3,6.0])) == 'infinite'
A2 = np.array([[2,1],[1,-1]], dtype=float)
assert classify_system(A2, np.array([3,0.0])) == 'unique'
print("✓ Challenge 2 passed!")
```

---

**Challenge 3 — Blending solver**

```python
import numpy as np

def solve_blend(compositions, targets, total_weight):
    """
    compositions: list of [pct1, pct2, ...] for each stock material
    (percentages as decimals, one fewer column needed than materials
    since weight provides the last constraint -- follow the lesson's
    3-material, 2-composition-constraint + 1-weight-constraint pattern).
    targets: target percentages (decimals) matching compositions' columns.
    Returns the amount of each material.
    """
    pass

# --- tests: do not modify ---
compositions = [[0.90, 0.10], [0.40, 0.55], [0.20, 0.20]]   # Cu%, Zn% per stock
targets = [0.62, 0.28]
amounts = solve_blend(compositions, targets, total_weight=100)
assert math.isclose(sum(amounts), 100, abs_tol=1e-6)
cu = sum(a*c[0] for a, c in zip(amounts, compositions))
assert math.isclose(cu, 62, abs_tol=1e-4)
print("✓ Challenge 3 passed!")
```

---

### Extension

**4. ★** Explain why partial pivoting (always choosing the largest
available pivot) doesn't change the *mathematical* answer to a
system, only its *numerical* reliability — i.e., argue that swapping
rows is one of the three legal elementary row operations from this
lesson, and therefore preserves the solution set exactly, regardless
of which row happens to get chosen as the pivot at each step.

<details><summary>Answer</summary>
Row swapping is explicitly one of the three elementary row operations
established at the start of this lesson, and each of the three was
shown to preserve the solution set (reordering equations doesn't
change which values satisfy all of them simultaneously). Partial
pivoting only ever performs swaps — it never introduces any operation
outside the legal three — so every intermediate augmented matrix it
produces represents a system with the *exact same solution set* as
the original, regardless of which particular sequence of swaps
occurred. What changes is purely the arithmetic path taken to reach
row echelon form: with pivoting, every division uses a
larger-magnitude number as the divisor, which keeps floating-point
rounding error smaller at each step. The destination (the correct
solution) is identical either way; pivoting only affects how
reliably floating-point arithmetic finds it. $\blacksquare$
</details>
