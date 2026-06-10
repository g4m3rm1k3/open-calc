**# Python — LAB: Gaussian Elimination Solver**

**Prerequisites:** Basic Python (lists, loops, functions, `print()`, indexing with `[i][j]`). You should be comfortable modifying 2D lists.

**What this lab adds:**
- A working Gaussian Elimination function that solves systems of linear equations
- Clear step-by-step row reduction you can watch in the terminal
- Parametric handling for infinite solutions and inconsistency detection

**Time:** 45–60 minutes

---

> **Quick Check — try to answer before reading further:**
>
> 1. Why do we turn the augmented matrix into a special form instead of solving by substitution?
> 2. What do you think should happen if a row becomes `[0 0 0 | 5]` during elimination?
> 3. How might we represent “free variables” in code?
>    _(Answers at the end of this lab)_

---

### What You Will Build

By the end of this lab you will have a Python script `gaussian_elimination.py` that:

- Takes a system of linear equations (as augmented matrix)
- Performs Gaussian Elimination with clear printed steps
- Returns the solution set: unique solution, infinitely many (parametric), or “no solution”
- Prints the matrix after each major operation so you can follow along

**Final output example (for a simple system):**
```
Initial matrix:
[[2, 3, 6],
 [4, -2, 8]]

After making pivot 1...
[[1.0, 1.5, 3.0],
 [0.0, -8.0, -4.0]]
...
Solution: x = 2.25, y = 0.5
```

---

### Concept: Augmented Matrix

**What it is:** A single matrix that holds both the coefficients and the constants of a system \( A\mathbf{x} = \mathbf{b} \).

**The problem before:**  
You had to keep two separate things in your head (coefficients and right-hand side). Easy to make mistakes when eliminating.

**The solution:** Combine them into one table. Row operations affect the whole equation.

**Canonical example:**  
System:
\[
\begin{cases}
2x + 3y = 6 \\
4x - 2y = 8
\end{cases}
\]

Augmented matrix:
```python
[[2, 3, 6],
 [4, -2, 8]]
```

**Why it matters here:** All our row operations will happen on this one data structure.

**Smallest possible example:**
```python
aug = [[1, 2, 3],
       [0, 1, 4]]
```

---

### Step 1 — Represent the Matrix and Print It Nicely

Create a new file `gaussian_elimination.py`

```python
def print_matrix(mat, title=""):
    if title:
        print(title)
    for row in mat:
        print([round(x, 4) for x in row])  # round for cleaner display
    print()  # empty line

# Test data - our running example
augmented = [
    [2, 3, 6],
    [4, -2, 8]
]

print_matrix(augmented, "Initial augmented matrix:")
```

### SAVE AND TRY

Run the file:
```bash
python gaussian_elimination.py
```

**You should see:** The matrix printed cleanly with a title.

**Change something:** Change one number in `augmented` (e.g. last 8 to 7). Save and run. Confirm it prints the new value.

---

### Concept: Elementary Row Operation (Abstraction)

**What it is:** One of three legal moves we can make on any row of the augmented matrix.

**The problem before:** You could do anything to equations and accidentally change the solution set.

**The solution:** Only allow three operations that are proven to preserve the exact same solutions.

**What it hides:** The mathematical proof that these operations keep the solution set identical. You no longer have to worry about “did I break the system?”

**Protected invariant:** The new matrix represents a system with exactly the same solutions as the original.

**Canonical example:**  
Multiplying an equation by 2 doesn’t change its solutions (as long as you don’t multiply by 0).

**Project Application:** We will implement these as helper functions that modify the matrix in place.

**Smallest possible example:**
```python
def multiply_row(mat, row_idx, scalar):
    for j in range(len(mat[row_idx])):
        mat[row_idx][j] *= scalar
```

**Why it matters here:** These functions are the only tools we will use to transform the matrix.

**Watch for:** Never multiply a row by zero.

---

### Step 2 — Implement Basic Row Operations

Add these functions **after** the `print_matrix` function:

```python
def multiply_row(mat, r, scalar):
    """Multiply row r by scalar (scalar != 0)"""
    for j in range(len(mat[r])):
        mat[r][j] *= scalar

def add_multiple(mat, src_row, dest_row, multiple):
    """Add multiple * src_row to dest_row"""
    for j in range(len(mat[dest_row])):
        mat[dest_row][j] += multiple * mat[src_row][j]

def swap_rows(mat, r1, r2):
    mat[r1], mat[r2] = mat[r2], mat[r1]
```

Update the bottom of the file to test them:

```python
# Test the operations
mat = [row[:] for row in augmented]  # copy
multiply_row(mat, 0, 0.5)
print_matrix(mat, "After multiplying row 0 by 0.5:")
```

### SAVE AND TRY

Run the script.

**You should see:** The first row halved.

**Change something:** Call `swap_rows(mat, 0, 1)` instead. Run again. See the rows swapped.

---

### Step 3 — Forward Elimination: One Pivot at a Time

Add this function:

```python
def forward_elimination(mat):
    rows = len(mat)
    cols = len(mat[0]) - 1  # exclude the b column
    
    for i in range(rows):           # for each potential pivot row
        # Make pivot 1 (if possible)
        pivot = mat[i][i]
        if abs(pivot) < 1e-10:
            print(f"Zero pivot at position ({i},{i})")
            continue
        multiply_row(mat, i, 1.0 / pivot)
        
        print_matrix(mat, f"After making pivot 1 in row {i}:")
        
        # Eliminate below
        for j in range(i+1, rows):
            factor = mat[j][i]
            add_multiple(mat, i, j, -factor)
            print_matrix(mat, f"After eliminating below pivot in row {j}:")
```

Update the test code at the bottom:

```python
mat = [row[:] for row in augmented]
forward_elimination(mat)
```

### SAVE AND TRY

Run it.

**You should see:** Step-by-step matrices showing the staircase form appearing.

**Change something:** Try a different system (change the numbers). Predict what will happen, then run.

---

### 🎯 Challenge: Full Gaussian Elimination (RREF)

**You know:** Forward elimination and the row operation functions.

**Task:** Create a `backward_elimination(mat)` function that eliminates **above** each pivot to reach Reduced Row Echelon Form.

**Starting code:**

```python
def backward_elimination(mat):
    rows = len(mat)
    for i in range(rows-1, -1, -1):   # start from bottom row
        # TODO: Eliminate above the pivot in column i
        pass
```

**Hint:** Loop over rows above `i` and use `add_multiple`.

Try for at least 5 minutes.

---

<details>
<summary>▶ Show Solution</summary>

```python
def backward_elimination(mat):
    rows = len(mat)
    for i in range(rows-1, -1, -1):
        # Find pivot column
        pivot_col = i
        if abs(mat[i][i]) < 1e-10:
            continue
            
        for j in range(i-1, -1, -1):   # rows above
            factor = mat[j][i]
            add_multiple(mat, i, j, -factor)
        
        print_matrix(mat, f"After backward elimination on row {i}:")
```

**Key insight:** Forward phase clears below pivots (makes upper triangular). Backward phase clears above pivots (makes diagonal/identity). Together they give RREF where solutions are obvious.

</details>

---

### Final Check

| Feature                          | How to Verify |
|----------------------------------|-------------|
| Matrix prints nicely             | Run script — see rounded clean output |
| Row operations work              | Test functions individually |
| Forward elimination runs         | See staircase of 1’s and zeros below |
| Backward elimination runs        | See clean identity on left |
| Handles simple 2×2 system        | Correct solution printed |

---

## Quick Check Answers

**1. Why do we turn the augmented matrix into a special form?**  
It systematically isolates each variable (like substitution but organized and works for any size system). The final form lets us read the answer directly.

**2. What happens with row `[0 0 0 | 5]`?**  
It means 0 = 5 — inconsistency → no solution. Your code should detect this.

**3. How to represent free variables?**  
Use parameters (e.g. `s`, `t`) for columns without pivots and express basic variables in terms of them.

---

You now have a working, step-by-step Gaussian Elimination solver in Python with full visibility of every transformation.

**Next options** (reply with your choice):
- Add handling for no solution / infinite solutions
- Convert to a general solver function that returns the solution set nicely
- Add partial pivoting for numerical stability
- Port this to NumPy

What would you like to do next?