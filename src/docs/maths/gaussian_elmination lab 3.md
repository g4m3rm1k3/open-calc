**# Python — LAB 3 — Gaussian Elimination Class + GUI Integration**

**Prerequisites:** Python — LAB 1 (Gaussian Elimination) and LAB 2 (Basic GUI).

**What this lab adds:**
- A clean, reusable `GaussianElimination` class
- Step logging that works both in console and GUI
- Proper handling of in-place vs copy issues
- Better integration between solver and interface

**Time:** 60–80 minutes

---

> **Quick Check — try to answer before reading further:**
>
> 1. What is the main problem with functions that modify a matrix "in place"?
> 2. Why might we want a *class* instead of separate functions for this solver?
> 3. What should happen if we want to show every step in a GUI without breaking the original matrix?
>    _(Answers at the end of this lab)_

---

### What You Will Build

A `GaussianElimination` class that:
- Takes an augmented matrix
- Can solve step-by-step while recording every operation
- Returns the solution type (unique / infinite / inconsistent)
- Works cleanly with both console and your GUI

---

### Concept: Class vs Standalone Functions

**What it is:** A class groups data (the matrix) and behavior (row operations, solving) together.

**The problem before:**  
Your functions modify the matrix directly (`in place`). Every time you call `forward_elimination(mat)`, the original matrix is destroyed. Hard to reuse and hard to show steps without side effects.

**The solution:** A class holds its own copy of the matrix and provides methods to operate on it safely.

**What it hides:** Memory management of copies and tracking of transformation steps.

**Protected invariant:** The original matrix passed in is never modified unless you explicitly ask.

**Canonical example:** Think of a `Car` class — it has its own speed, fuel, etc. You don’t pass the car’s engine around as separate functions.

**Why it matters here:** We can create multiple solvers, log every step, and safely display transformations in the GUI.

---

### Step 1 — Create the Class Skeleton

Create a new file `gaussian_eliminator.py` (we’ll build the full thing here first).

```python
class GaussianElimination:
    """Handles Gaussian elimination with step logging."""
    
    def __init__(self, augmented_matrix):
        """Make a copy so we don't destroy the original data."""
        self.original = [row[:] for row in augmented_matrix]
        self.matrix = [row[:] for row in augmented_matrix]  # working copy
        self.steps = []   # list of strings describing what we did

    def log(self, message):
        """Record a step so we can show it later."""
        self.steps.append(message)
        print(message)                    # still works in console
```

### SAVE AND RUN

```python
# At bottom of file
if __name__ == "__main__":
    test_mat = [[2, 3, 6], [4, -2, 8]]
    solver = GaussianElimination(test_mat)
    print("Class created successfully!")
    print("Original:", solver.original)
```

**You should see:** Class created and original matrix preserved.

---

### Step 2 — Add Row Operation Methods

Add these methods **inside the class** (indented under the class):

```python
    def multiply_row(self, r, scalar):
        """Multiply row r by scalar."""
        if abs(scalar) < 1e-10:
            return
        for j in range(len(self.matrix[r])):
            self.matrix[r][j] *= scalar
        self.log(f"Multiplied row {r} by {scalar}")

    def add_multiple(self, src, dest, multiple):
        """Add multiple * src_row to dest_row."""
        for j in range(len(self.matrix[dest])):
            self.matrix[dest][j] += multiple * self.matrix[src][j]
        self.log(f"Added {multiple} * Row {src} to Row {dest}")

    def swap_rows(self, r1, r2):
        """Swap two rows."""
        self.matrix[r1], self.matrix[r2] = self.matrix[r2], self.matrix[r1]
        self.log(f"Swapped rows {r1} and {r2}")
```

### SAVE AND RUN

Add to the test section:
```python
    solver.multiply_row(0, 0.5)
    print("After multiply:")
    for row in solver.matrix:
        print([round(x, 4) for x in row])
```

**You should see:** The first row halved and a log message.

---

### Step 3 — Forward Elimination (Inside the Class)

Add this method inside the class:

```python
    def forward_elimination(self):
        """Turn matrix into upper triangular form."""
        rows = len(self.matrix)
        
        for i in range(rows):
            # Make pivot = 1
            pivot = self.matrix[i][i]
            if abs(pivot) < 1e-10:
                self.log(f"Zero pivot at ({i}, {i}) - skipping")
                continue
                
            self.multiply_row(i, 1.0 / pivot)
            
            # Eliminate below
            for j in range(i + 1, rows):
                factor = self.matrix[j][i]
                if abs(factor) > 1e-10:
                    self.add_multiple(i, j, -factor)
```

Update your test:
```python
    solver = GaussianElimination(test_mat)
    solver.forward_elimination()
    print("\nFinal matrix after forward elimination:")
    for row in solver.matrix:
        print([round(x,4) for x in row])
```

---

### Step 4 — Integrate with GUI (Clean Connection)

Open your `gaussian_gui.py` from the previous lab.

Replace the old solver code with this clean version:

```python
from gaussian_eliminator import GaussianElimination   # add at top

def solve():
    output_text.delete(1.0, tk.END)
    try:
        n = len(entries)
        aug = [[float(entries[i][j].get()) for j in range(n+1)] for i in range(n)]
        
        solver = GaussianElimination(aug)
        output_text.insert(tk.END, "Initial matrix:\n")
        for row in solver.original:
            output_text.insert(tk.END, f"{[round(x,4) for x in row]}\n")
        output_text.insert(tk.END, "\n")
        
        solver.forward_elimination()
        
        output_text.insert(tk.END, "\n=== Steps ===\n")
        for step in solver.steps:
            output_text.insert(tk.END, step + "\n")
            
        output_text.insert(tk.END, "\nFinal matrix:\n")
        for row in solver.matrix:
            output_text.insert(tk.END, f"{[round(x,4) for x in row]}\n")
            
    except Exception as e:
        messagebox.showerror("Error", str(e))
```

### SAVE AND RUN (GUI)

Enter numbers → click **Solve Step by Step**.

**You should see:** Clean step-by-step log + final matrix.

---

### 🎯 Challenge: Add Backward Elimination + Solution Reader

**You know:** Classes, logging, and forward elimination.

**Task:** Add `backward_elimination(self)` to the class and a method `get_solution(self)` that returns a nice description.

Try it yourself first.

---

<details>
<summary>▶ Show Solution (Main Parts)</summary>

```python
    def backward_elimination(self):
        rows = len(self.matrix)
        for i in range(rows-1, -1, -1):
            if abs(self.matrix[i][i]) < 1e-10:
                continue
            for j in range(i-1, -1, -1):
                factor = self.matrix[j][i]
                if abs(factor) > 1e-10:
                    self.add_multiple(i, j, -factor)

    def get_solution(self):
        # Very simplified version for now
        return "Solution computed. (Full version in next lab)"
```

**Key insight:** The class now owns the matrix and the history. This makes GUI integration trivial and safe.

</details>

---

**You now have a professional, reusable solver class!**

Would you like the next lab to focus on:
1. Full solution interpretation (unique / infinite / inconsistent) with parametric form?
2. 2D line plotting visualization?
3. Both combined?

Reply with your choice and I’ll write the next full lesson following the same spec.