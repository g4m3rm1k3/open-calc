**# Python — LAB 4 — Deep Dive: Clean Gaussian Elimination Class**

**Prerequisites:** Python — LAB 3 (Gaussian Elimination Class)

**What this lab adds:**
- A much more readable version with **descriptive variable names**
- Deep, line-by-line explanation of every loop
- Better comments and structure so you can truly understand (not just run) the code
- Fixed typos and improved clarity

**Time:** 50–70 minutes

---

> **Quick Check — try to answer before reading further:**
>
> 1. Why is `current_row` better than just `i` in a loop?
> 2. What is the purpose of the inner loop in `forward_elimination`?
> 3. Why do we make a copy of the matrix in `__init__`?
>    _(Answers at the end of this lab)_

---

### What You Will Build

A clean, readable, well-explained `GaussianElimination` class that you can actually understand when you read it.

---

### Concept: Descriptive Variable Names

**What it is:** Using names that clearly say *what* the variable represents instead of single letters.

**The problem before:** `for i in range(rows):` — you have to keep remembering what `i` means.

**The solution:** Use `for current_row in range(number_of_rows):`

**Why it matters here:** Linear algebra code has many nested loops. Clear names make the logic obvious.

---

### Step 1 — Create the Improved Class

Create a new file called `gaussian_elimination_clean.py`

```python
class GaussianElimination:
    """A clean, readable solver for systems of linear equations using Gaussian Elimination."""
    
    def __init__(self, augmented_matrix):
        """
        Initialize the solver with a copy of the input matrix.
        We never modify the original data the user gave us.
        """
        # Make deep copies so original data is safe
        self.original_matrix = [row[:] for row in augmented_matrix]
        self.current_matrix = [row[:] for row in augmented_matrix]   # working copy
        self.step_log = []   # Stores messages about every operation we perform
```

### SAVE AND RUN

```python
if __name__ == "__main__":
    test_system = [
        [2, 3, 6],
        [4, -2, 8]
    ]
    solver = GaussianElimination(test_system)
    print("Solver created successfully!")
    print("Original matrix preserved.")
```

---

### Step 2 — Row Operations with Full Explanations

Add these methods inside the class:

```python
    def log_step(self, message):
        """Record what we did so we (or the GUI) can show the steps later."""
        self.step_log.append(message)
        print(message)

    def multiply_row(self, row_index, scalar):
        """Multiply every element in a specific row by a number."""
        if abs(scalar) < 1e-10:
            return
            
        for column in range(len(self.current_matrix[row_index])):
            self.current_matrix[row_index][column] *= scalar
            
        self.log_step(f"Multiplied row {row_index} by {scalar}")

    def add_multiple_of_row(self, source_row, target_row, multiplier):
        """
        Add (multiplier × source_row) to target_row.
        This is the key operation for eliminating variables.
        """
        for column in range(len(self.current_matrix[target_row])):
            self.current_matrix[target_row][column] += \
                multiplier * self.current_matrix[source_row][column]
        
        self.log_step(f"Added {multiplier} × Row {source_row} to Row {target_row}")

    def swap_two_rows(self, row_a, row_b):
        """Swap the position of two rows."""
        self.current_matrix[row_a], self.current_matrix[row_b] = \
            self.current_matrix[row_b], self.current_matrix[row_a]
        self.log_step(f"Swapped Row {row_a} with Row {row_b}")
```

---

### Step 3 — Deep Dive into Forward Elimination

This is the most important part. Let's understand the loops clearly.

Add this method:

```python
    def forward_elimination(self):
        """
        Main forward phase of Gaussian Elimination.
        Goal: Create zeros below each pivot (upper triangular form).
        """
        number_of_rows = len(self.current_matrix)
        
        # Outer loop: Process one row at a time from top to bottom
        for current_row in range(number_of_rows):
            
            # Get the pivot (the number on the diagonal)
            pivot_value = self.current_matrix[current_row][current_row]
            
            if abs(pivot_value) < 1e-10:
                self.log_step(f"Zero pivot found in row {current_row}. Skipping.")
                continue
                
            # Make the pivot equal to 1
            self.multiply_row(current_row, 1.0 / pivot_value)
            
            # Inner loop: Eliminate this variable from all rows BELOW current_row
            for row_below in range(current_row + 1, number_of_rows):
                
                factor = self.current_matrix[row_below][current_row]
                
                if abs(factor) > 1e-10:
                    # Use row current_row to cancel out the value in row_below
                    self.add_multiple_of_row(
                        source_row=current_row,
                        target_row=row_below,
                        multiplier=-factor
                    )
```

**Why two nested loops?**

- Outer loop (`current_row`): Chooses which variable we are trying to isolate right now.
- Inner loop (`row_below`): Uses the current equation to remove that variable from all equations below it.

This is exactly the "elimination" step you do by hand.

---

### Step 4 — Test the Clean Version

Add this at the bottom (outside the class):

```python
if __name__ == "__main__":
    test_system = [
        [2, 3, 6],
        [4, -2, 8]
    ]
    
    solver = GaussianElimination(test_system)
    
    print("=== Starting Forward Elimination ===\n")
    solver.forward_elimination()
    
    print("\n=== Final Matrix After Forward Elimination ===")
    for row in solver.current_matrix:
        print([round(x, 4) for x in row])
        
    print("\n=== All Steps Recorded ===")
    for step in solver.step_log:
        print(step)
```

### SAVE AND RUN

Run the file and read the output carefully. You should now understand **why** each line appears.

---

### 🎯 Challenge: Improve Readability Even More

**Task:** Add `backward_elimination` using the same descriptive style (`current_row`, `row_above`, etc.).

Use the same pattern as `forward_elimination` but go from bottom to top.

Try writing it yourself first, then compare with the solution.

---

<details>
<summary>▶ Show Solution</summary>

```python
    def backward_elimination(self):
        """Eliminate entries above each pivot to reach Reduced Row Echelon Form."""
        number_of_rows = len(self.current_matrix)
        
        for current_row in range(number_of_rows - 1, -1, -1):   # bottom to top
            if abs(self.current_matrix[current_row][current_row]) < 1e-10:
                continue
                
            for row_above in range(current_row - 1, -1, -1):
                factor = self.current_matrix[row_above][current_row]
                if abs(factor) > 1e-10:
                    self.add_multiple_of_row(
                        source_row=current_row,
                        target_row=row_above,
                        multiplier=-factor
                    )
```

**Key insight:** Forward elimination clears below the diagonal. Backward elimination clears above it.

</details>

---

## Quick Check Answers

**1. Why is `current_row` better than `i`?**  
It immediately tells you the purpose of the variable when you read the code later.

**2. Purpose of the inner loop?**  
To eliminate the current variable from all equations below the current one.

**3. Why copy the matrix?**  
So we don't destroy the user's original data. Good programming practice.

---

**Now the code should feel much clearer.**  

Would you like the next lesson to:
1. Add full solution interpretation (unique / infinite / no solution)?
2. Connect this clean class to the GUI with better step visualization?
3. Add matrix printing with nice formatting?

Reply with your choice!