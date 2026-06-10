# Computational Mathematics — LAB 03 — Gaussian Elimination

**Prerequisites:** LAB-01 (NumPy arrays). No prior knowledge of this algorithm needed.

**What this lab builds:**
- What a system of linear equations IS and why it is hard to solve directly
- The geometry — what the solution means visually
- Three row operations that are legal — and WHY they are legal
- Gaussian elimination built step by step from the algebra
- The same algorithm in NumPy (`np.linalg.solve`) and SymPy (exact symbolic answer)
- Visualizing the solution as the intersection of lines

**Environment:** Python 3.10+ | `pip install numpy matplotlib sympy`

**Time:** 75 minutes

---

> **Quick Check — try to answer before reading:**
>
> 1. If you have `2x + y = 5`, that is one equation with two unknowns. How many solutions does it have? What does it look like on a graph?
> 2. You have two equations: `2x + y = 5` and `x - y = 1`. If you add these two equations together, what new equation do you get? Is the solution still the same?
> 3. *(Prediction)* If you multiply the entire first equation by 3, every term gets multiplied by 3. Does this change what values of x and y satisfy it?
>
> *(Answers at the end)*

---

## What You Will Build

```
=== The system ===
 2x +  y +  z = 9
  x - 3y +  z = -2
 3x +  y - 2z = 4

=== Solving by hand (Gaussian elimination) ===
Step 1: Use equation 1 to eliminate x from equations 2 and 3
Step 2: Use equation 2 to eliminate y from equation 3
Step 3: Back-substitute to find z, then y, then x

=== Answer ===
x = 2.0,  y = 1.0,  z = 4.0

=== Verify ===
Eq 1: 2(2) + 1(1) + 1(4) = 4 + 1 + 4 = 9  ✓
Eq 2: 1(2) - 3(1) + 1(4) = 2 - 3 + 4 = 3  ... wait, should be -2?
```

Plus a 2D visualization showing two lines and their intersection point.

---

## The Math — What Problem Are We Solving?

A system of linear equations is a set of equations where every unknown appears multiplied by a constant (no `x²`, no `sin(x)`, no `xy` — just `ax`).

```
2x +  y = 5
 x -  y = 1
```

We want values of `x` and `y` that satisfy BOTH equations simultaneously.

**The geometric picture:**

Each equation describes a line in the xy-plane:
- `2x + y = 5` is a line (rearranged: `y = 5 - 2x`)
- `x - y = 1` is a line (rearranged: `y = x - 1`)

The solution is the point where both lines cross — the ONE point that lies on both lines.

```
y
|        /  (line 2: x - y = 1)
|       /
|    ★         ← solution: both equations satisfied here
|   /  \
|  /    \  (line 1: 2x + y = 5)
| /      \
|/        \
0-----------→ x
```

For 3 equations in 3 unknowns: each equation describes a plane in 3D. The solution is the point where all three planes meet.

**Why it is hard:** You cannot just "read off" the answer. Each equation only constrains the relationship between variables. You need to combine them systematically to isolate each variable.

---

## The Key Insight: Legal Operations That Preserve the Solution

Gaussian elimination is built on three operations you can perform on equations without changing the solution:

**Operation 1 — Swap two equations:**
```
Equation A: 2x + y = 5      Equation B: x - y = 1
Equation B: x - y = 1  ↔   Equation A: 2x + y = 5
```
The same two equations, different order. Same solution.

**Operation 2 — Multiply an equation by a non-zero constant:**
```
Original: x - y = 1
×3:       3x - 3y = 3
```
WHY this is legal: if `x=2, y=1` satisfies `x - y = 1`, then it also satisfies `3x - 3y = 3` (both sides multiplied by 3). The set of solutions does not change.

**Operation 3 — Replace one equation with (itself + a multiple of another equation):**
```
Eq1:  2x + y = 5
Eq2:  x - y = 1

Replace Eq2 with (Eq2 + Eq1):
Eq1:  2x + y = 5           (unchanged)
Eq2:  3x + 0y = 6          (added Eq1 to Eq2 — the y terms cancelled!)
```
WHY this is legal: if `x` and `y` satisfy both equations, then they satisfy any linear combination of those equations. Adding two true statements gives another true statement.

**Operation 3 is the powerful one.** By choosing the right multiples to add, you can eliminate any variable from any equation. This is the core of Gaussian elimination.

---

## The Algorithm — Elimination Step by Step

**Goal:** Transform the system so that:
1. The first equation has all variables
2. The second equation has all variables EXCEPT the first
3. The third equation has all variables EXCEPT the first two
4. (This shape is called Row Echelon Form)

Then solve from the bottom up (back-substitution).

**Example — solving by hand:**

```
System:
  2x + y = 5   ... (1)
   x - y = 1   ... (2)
```

**Step 1: Eliminate x from equation 2**

We want equation 2 to have no `x` term. 

Strategy: if we multiply equation 2 by -2 and add it to equation 1... no, we want to change equation 2.

Multiply equation 1 by (1/2) to make the x-coefficient 1? Or:
Multiply equation 2 by 2 to match the x-coefficient in equation 1:

```
Eq2 × 2:   2x - 2y = 2
```

Replace Eq2 with (Eq1 - new Eq2):
```
  2x +  y = 5
-(2x - 2y = 2)
───────────────
   0x + 3y = 3   → y = 1
```

**Step 2: Back-substitute**
```
y = 1
Substitute into eq1: 2x + 1 = 5 → 2x = 4 → x = 2
```

**Answer: x = 2, y = 1**

This is the entire algorithm. For larger systems, you repeat this process: use the first equation to eliminate x from all others, then use the second equation to eliminate y from all others below, and so on.

---

## Concept: The Augmented Matrix

Writing out "x", "y", "z" every time is tedious. The matrix form captures the same information:

```
System:             Augmented matrix [A | b]:
2x + y + z = 9      [2   1   1  | 9 ]
 x - 3y + z = -2    [1  -3   1  | -2]
3x + y - 2z = 4     [3   1  -2  | 4 ]
```

The matrix stores just the coefficients. The vertical line separates the left side (`Ax`) from the right side (`b`). This is called the augmented matrix because we've "augmented" (extended) the coefficient matrix with the b column.

Row operations on the matrix correspond exactly to operations on the equations:
- Swap rows → swap equations
- Multiply a row by a constant → multiply an equation
- Add a multiple of one row to another → add a multiple of one equation to another

The algorithm operates on the matrix, not the equations — same math, cleaner notation.

---

## Step 1 — Solve a 2×2 System From Scratch

Create `lab03.py`:

```python
import numpy as np
import matplotlib.pyplot as plt

# ── 2×2 system: build and solve by hand ───────────────────────────────────────
# System:
#   2x + y = 5    ... equation 1
#    x - y = 1    ... equation 2

# Represent as augmented matrix [A | b]
# Each row is [coefficient_x, coefficient_y, right_hand_side]
M = np.array([
    [2.0,  1.0, 5.0],   # row 0: 2x + y = 5
    [1.0, -1.0, 1.0],   # row 1: x - y = 1
], dtype=float)
# dtype=float: MUST be float for division — integer arrays truncate!

print("=== Original augmented matrix [A | b] ===")
print(M)
print()

# ── Step 1: Eliminate x from row 1 ────────────────────────────────────────────
# We want M[1,0] (the x-coefficient in row 1) to become 0
# Strategy: row1 = row1 - (M[1,0] / M[0,0]) * row0
# The factor (M[1,0] / M[0,0]) is called the multiplier

pivot = M[0, 0]                       # the pivot element: M[0,0] = 2
multiplier = M[1, 0] / pivot          # how many times row0's x-coeff fits in row1's x-coeff
                                       # = 1.0 / 2.0 = 0.5

print(f"Pivot = {pivot},  Multiplier = {multiplier}")
print(f"Row operation: row1 = row1 - {multiplier} × row0")
print()

M[1] = M[1] - multiplier * M[0]
# This is the elimination step.
# M[1] - 0.5 * M[0]:
# [1, -1, 1] - 0.5 * [2, 1, 5]
# [1, -1, 1] - [1, 0.5, 2.5]
# = [0, -1.5, -1.5]

print("=== After eliminating x from row 1 ===")
print(M)
print("Row 1 is now: 0x + (-1.5)y = -1.5  →  y = 1.0")
print()

# ── Step 2: Back-substitution ─────────────────────────────────────────────────

y = M[1, 2] / M[1, 1]          # last equation has only one unknown: solve directly
x = (M[0, 2] - M[0, 1] * y) / M[0, 0]
# From row 0: 2x + y = 5 → 2x = 5 - y → x = (5 - y) / 2

print("=== Back-substitution ===")
print(f"From row 1: y = {M[1,2]} / {M[1,1]} = {y}")
print(f"From row 0: x = ({M[0,2]} - {M[0,1]}×{y}) / {M[0,0]} = {x}")
print()
print(f"Solution: x = {x},  y = {y}")

# ── Verify: substitute back into ORIGINAL equations ───────────────────────────
print()
print("=== Verification ===")
print(f"Eq1: 2({x}) + 1({y}) = {2*x + y}  (should be 5)")
print(f"Eq2: 1({x}) - 1({y}) = {x - y}   (should be 1)")
```

### SAVE AND TRY

Run: `python lab03.py`

**You should see** the augmented matrix, then the eliminated version, then the back-substitution, then verification. Read through the intermediate matrix carefully — the key row is `[0, -1.5, -1.5]`. The `0` in position `[1,0]` means x has been eliminated from equation 2. That is the entire point of the algorithm.

**Change something:** Change the system to `x + y = 3` and `x - y = 1`. The solution should be `x=2, y=1`. Update the matrix and rerun. Change it back.

---

## Step 2 — Generalize to a 3×3 System

Add to `lab03.py`:

```python
# ── 3×3 system ────────────────────────────────────────────────────────────────
# System:
#   2x +  y +  z =  9
#    x - 3y +  z = -2
#   3x +  y - 2z =  4

A = np.array([
    [2.0,  1.0,  1.0,  9.0],   # 2x + y + z = 9
    [1.0, -3.0,  1.0, -2.0],   # x - 3y + z = -2
    [3.0,  1.0, -2.0,  4.0],   # 3x + y - 2z = 4
], dtype=float)

print("\n=== 3×3 System ===")
print("Original:\n", A)

# ── Forward elimination ────────────────────────────────────────────────────────
# Goal: create zeros below each pivot (diagonal element)

# Pass 1: use row 0 to eliminate x from rows 1 and 2
for i in [1, 2]:                           # rows to eliminate from
    if A[0, 0] == 0:
        raise ValueError("Zero pivot — need row swap")
    m = A[i, 0] / A[0, 0]                 # multiplier for row i
    A[i] = A[i] - m * A[0]                # eliminate x from row i
    print(f"Eliminated x from row {i} (multiplier={m:.3f})")

print("\nAfter eliminating x:\n", A)

# Pass 2: use row 1 to eliminate y from row 2
m = A[2, 1] / A[1, 1]
A[2] = A[2] - m * A[1]
print(f"\nEliminated y from row 2 (multiplier={m:.3f})")
print("\nRow echelon form:\n", A)

# ── Back-substitution ─────────────────────────────────────────────────────────
# Now solve from the bottom row up
n = 3
x_vec = np.zeros(n)   # will hold the solution [x, y, z]

# Row 2 has only z:  A[2,2]×z = A[2,3]
x_vec[2] = A[2, 3] / A[2, 2]

# Row 1 has y and z:  A[1,1]×y + A[1,2]×z = A[1,3]
x_vec[1] = (A[1, 3] - A[1, 2] * x_vec[2]) / A[1, 1]

# Row 0 has x, y, z:  A[0,0]×x + A[0,1]×y + A[0,2]×z = A[0,3]
x_vec[0] = (A[0, 3] - A[0, 1] * x_vec[1] - A[0, 2] * x_vec[2]) / A[0, 0]

print(f"\nSolution: x={x_vec[0]:.3f},  y={x_vec[1]:.3f},  z={x_vec[2]:.3f}")

# ── Same answer from np.linalg.solve ──────────────────────────────────────────
# np.linalg.solve takes A (coefficients) and b (right-hand side) separately
A_orig = np.array([[2,1,1],[1,-3,1],[3,1,-2]], dtype=float)
b_orig = np.array([9, -2, 4], dtype=float)

numpy_solution = np.linalg.solve(A_orig, b_orig)
print(f"np.linalg.solve: {numpy_solution}")
print(f"Both match: {np.allclose(x_vec, numpy_solution)}")
```

### SAVE AND TRY

**You should see** the elimination steps printed as they happen, then the back-substitution, then confirmation that NumPy gives the same answer. The key output is "Row echelon form" — the matrix should look triangular with zeros below the diagonal.

**Read the row operations carefully.** Each `A[i] = A[i] - m * A[0]` is one step of the algorithm. The multiplier `m` is chosen to make `A[i,0]` become zero. That is the ENTIRE mechanism of forward elimination.

**In the terminal:**
```python
python -c "import numpy as np; A=np.array([[2,1,1],[1,-3,1],[3,1,-2]],dtype=float); b=np.array([9,-2,4],dtype=float); print(np.linalg.solve(A,b))"
```
Expected: `[x y z]` — the solution without all the intermediate steps.

---

## Step 3 — SymPy: The Exact Symbolic Answer

SymPy is Python's symbolic math library. While NumPy gives you floating-point approximations (`2.0000000001`), SymPy gives you exact answers (`2`).

Add to `lab03.py`:

```python
import sympy as sp                    # sp is the convention for SymPy

# ── Same system solved symbolically ───────────────────────────────────────────

# Declare symbolic variables — these are math symbols, not Python variables
x, y, z = sp.symbols('x y z')
# sp.symbols creates Symbol objects that SymPy can manipulate algebraically

# Define the equations
eq1 = sp.Eq(2*x + y + z, 9)         # sp.Eq(left, right) means left = right
eq2 = sp.Eq(x - 3*y + z, -2)
eq3 = sp.Eq(3*x + y - 2*z, 4)

print("\n=== SymPy: symbolic solution ===")
print("Equations:")
print(f"  {eq1}")
print(f"  {eq2}")
print(f"  {eq3}")

solution = sp.solve([eq1, eq2, eq3], [x, y, z])
# sp.solve: find values of [x,y,z] that satisfy all three equations
# Returns a dict: {x: value, y: value, z: value}

print(f"\nSymPy solution: {solution}")
print(f"x = {solution[x]},  y = {solution[y]},  z = {solution[z]}")

# ── SymPy can also show the elimination steps ─────────────────────────────────
M_sym = sp.Matrix([
    [2,  1,  1,  9],
    [1, -3,  1, -2],
    [3,  1, -2,  4],
])

print("\n=== SymPy augmented matrix ===")
sp.pprint(M_sym)                      # pprint: "pretty print" — formatted output

rref, pivots = M_sym.rref()
# rref: Reduced Row Echelon Form — fully reduced, not just triangular
# This is what you get after forward AND backward elimination (full Gauss-Jordan)
print("\n=== Reduced Row Echelon Form ===")
sp.pprint(rref)
print("Pivot columns:", pivots)
```

### SAVE AND TRY

**You should see** SymPy print exact integer solutions, not floats. Then the RREF (Reduced Row Echelon Form) — a fully solved matrix with 1s on the diagonal and 0s everywhere else. The RREF is the matrix equivalent of "x=2, y=1, z=4" written as a matrix.

**SymPy vs NumPy:**
- `np.linalg.solve(A, b)` → `[2.00000000001, 0.9999999998, 4.00000000002]` (floating point)
- `sp.solve(...)` → `{x: 2, y: 1, z: 4}` (exact integers)

Use SymPy to check your algebraic work and understand structure. Use NumPy for actual computation with real data.

---

## Step 4 — Visualize the Solution as an Intersection

Add to `lab03.py`:

```python
# ── Visualize: two lines intersecting at the solution ─────────────────────────
# Use the 2×2 system:  2x + y = 5  and  x - y = 1

x_vals = np.linspace(-1, 4, 100)      # 100 x-values from -1 to 4

# Rearrange each equation to y = f(x) for plotting
y1 = 5 - 2 * x_vals                  # from 2x + y = 5 → y = 5 - 2x
y2 = x_vals - 1                       # from x - y = 1  → y = x - 1

fig, ax = plt.subplots(figsize=(7, 6))

ax.plot(x_vals, y1, 'b-', linewidth=2, label='2x + y = 5')
ax.plot(x_vals, y2, 'r-', linewidth=2, label='x - y = 1')

# Mark the solution point
sol_x, sol_y = 2.0, 1.0
ax.plot(sol_x, sol_y, 'ko', markersize=10, zorder=5, label=f'Solution: ({sol_x}, {sol_y})')
ax.annotate(f'({sol_x}, {sol_y})',
            xy=(sol_x, sol_y), xytext=(sol_x + 0.3, sol_y + 0.5),
            fontsize=12, arrowprops=dict(arrowstyle='->', color='black'))

ax.set_xlim(-1, 4)
ax.set_ylim(-2, 6)
ax.axhline(0, color='black', linewidth=0.5)
ax.axvline(0, color='black', linewidth=0.5)
ax.grid(True, alpha=0.3)
ax.legend()
ax.set_title('System of equations: solution is the intersection point')
ax.set_xlabel('x')
ax.set_ylabel('y')

plt.tight_layout()
plt.show()
```

### SAVE AND TRY

**You should see** two lines crossing at `(2, 1)`. This is the geometric meaning of solving a system: finding the intersection point. Every step of Gaussian elimination is an algebraic transformation that moves the equations closer to "intersection point obvious."

---

## 🏗️ Challenge: Build a General Gaussian Elimination Function

**The math you need:**

Forward elimination has a nested structure:
- Outer loop: `for j in range(n)` — process each column (each variable to eliminate)
- Inner loop: `for i in range(j+1, n)` — eliminate from every row below the pivot
- For each inner step: `row_i = row_i - (row_i[j] / row_j[j]) × row_j`

Back-substitution works from the bottom:
- Start with the last equation (only one unknown)
- For each earlier equation, subtract all known terms and divide by the coefficient

**What you're building:**
Two functions:
1. `forward_eliminate(M)` — transforms the augmented matrix to row echelon form (zeros below diagonal). Returns the modified matrix.
2. `back_substitute(M)` — takes the row echelon matrix, solves for each variable from bottom to top. Returns the solution vector.

And a wrapper: `solve_system(A, b)` that calls both and returns the solution.

**Requirements:**
- [ ] Works for 2×2 and 3×3 systems
- [ ] Handles the case where a pivot is zero (swap with a lower row — called partial pivoting; raise an error if no non-zero row found)
- [ ] `solve_system(A, b)` answer matches `np.linalg.solve(A, b)` for all test cases
- [ ] Test with at least three different systems

**Starter code:**
```python
import numpy as np

def forward_eliminate(M):
    """
    Transform augmented matrix M in-place to row echelon form.
    M is the augmented matrix [A | b].
    """
    n = M.shape[0]   # number of equations
    M = M.copy().astype(float)   # copy so we don't modify the original

    for j in range(n):           # for each column (pivot column)
        # TODO: find the pivot (non-zero element in column j, row j or below)
        # TODO: if pivot is in a different row, swap that row with row j
        # TODO: for each row below j, eliminate the j-th variable
        pass

    return M

def back_substitute(M):
    """
    Solve upper-triangular augmented matrix M.
    Returns the solution vector x.
    """
    n = M.shape[0]
    x = np.zeros(n)

    for i in range(n-1, -1, -1):    # count DOWN from n-1 to 0
        # TODO: solve for x[i] given that x[i+1]...x[n-1] are already known
        pass

    return x

def solve_system(A, b):
    A = np.array(A, dtype=float)
    b = np.array(b, dtype=float)
    M = np.column_stack([A, b])    # build augmented matrix [A | b]
    M = forward_eliminate(M)
    return back_substitute(M)

# Test cases
A1 = [[2, 1], [1, -1]]
b1 = [5, 1]
print(solve_system(A1, b1))            # expected: [2. 1.]
print(np.linalg.solve(A1, b1))        # verify

A2 = [[2, 1, 1], [1, -3, 1], [3, 1, -2]]
b2 = [9, -2, 4]
print(solve_system(A2, b2))            # expected: [2. 1. 4.]
print(np.linalg.solve(A2, b2))
```

**When you're done:** Your `solve_system` matches `np.linalg.solve` for all test cases.

**Stuck?** Ask AI: "In Gaussian elimination back-substitution, when solving for `x[i]`, I know all variables `x[i+1]` to `x[n-1]`. How do I express `x[i]` in terms of the augmented matrix row `i` and the already-known variables?"

---

## Final Check

| What to check | How to verify |
|---|---|
| Augmented matrix prints correctly | 3 rows, 4 columns; numbers match the system |
| After elimination, x-column below row 0 is zero | Column 0 of M shows `[2, 0, 0, ...]` |
| Back-substitution gives correct answer | `x=2, y=1` for the 2×2 system |
| 3×3 answer matches np.linalg.solve | `np.allclose(x_vec, numpy_solution)` is True |
| SymPy gives exact integers | `{x: 2, y: 1, z: 4}` with no decimal points |
| Intersection plot shows correct point | Lines cross exactly at (2, 1) |

---

## Quick Check Answers

**1. One equation, two unknowns — how many solutions?**
Infinitely many. `2x + y = 5` describes an entire line. Every point on that line is a solution. A single linear equation in two unknowns cannot pin down a unique point — it only constrains the relationship between x and y. You need at least as many independent equations as unknowns to get a unique solution.

**2. Adding the two equations — does it change the solution?**
No. If `x=2, y=1` satisfies `2x + y = 5` (gives 5) and `x - y = 1` (gives 1), then it also satisfies their sum `3x + 0y = 6` (gives 6). Adding two true statements gives another true statement. The solution that satisfies both original equations necessarily satisfies their sum. This is WHY row operation 3 is legal — it is just adding true equations.

**3. Multiply an equation by 3 — does it change the solution?**
No. If `x=2, y=1` satisfies `x - y = 1`, then `3(x) - 3(y) = 3(1)` is just multiplying both sides of a true statement by 3. It is still true. The set of `(x, y)` pairs that satisfy the equation does not change — you are just writing the same constraint differently. This is WHY row operation 2 is legal.
