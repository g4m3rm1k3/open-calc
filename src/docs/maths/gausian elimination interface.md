**# Python — LAB 2 — Gaussian Elimination GUI**

**Prerequisites:** Python — LAB: Gaussian Elimination Solver (you have the row operation functions and elimination logic).

**What this lab adds:**
- A complete graphical interface for entering any system of linear equations
- Live step-by-step visualization of the row reduction process
- Clear display of the final solution (unique, infinite, or none)
- Visual feedback for 2-variable systems (lines + intersection)

**Time:** 60–75 minutes

---

> **Quick Check — try to answer before reading further:**
>
> 1. Why is it better to build the window and one widget first instead of writing all GUI code at once?
> 2. What do you think will happen visually when we perform row operations in the GUI?
> 3. How should the interface handle a system with infinitely many solutions?
>    _(Answers at the end of this lab)_

---

### What You Will Build

You will build `gaussian_gui.py` — a complete desktop application with:

- Controls to choose matrix size (2×2 or 3×3)
- Grid of input fields for the augmented matrix
- “Solve Step by Step” button
- Live updating text box showing every row operation
- Final solution display (values or parametric form)
- For 2-variable systems: a small canvas showing the original lines and their intersection

**End result:** A tool you can use to explore any small linear system visually.

---

### Step 1 — Create the Main Window

Create a new file `gaussian_gui.py`

```python
import tkinter as tk
from tkinter import ttk, messagebox

# === Basic Window ===
root = tk.Tk()
root.title("Gaussian Elimination Visualizer")
root.geometry("900x700")

# Title label
title = tk.Label(root, text="Gaussian Elimination Visualizer", font=("Helvetica", 16, "bold"))
title.pack(pady=10)

root.mainloop()
```

### SAVE AND RUN

Run the file:
```bash
python gaussian_gui.py
```

**You should see:** A window with the title at the top.

**Change something:** Change `geometry("900x700")` to `("1000x800")`. Save and run — window is bigger.

---

### Concept: Tkinter Widget Grid Layout

**What it is:** A way to arrange widgets (buttons, labels, entry fields) in rows and columns like a table.

**The problem before:** Widgets stack vertically or appear in hard-to-control positions.

**The solution:** Use `grid(row=..., column=...)` to place items precisely.

**Canonical example:**  
A login form with username above password, both neatly aligned.

**Why it matters here:** We need a clean grid for matrix input fields.

**Smallest possible example:**
```python
label = tk.Label(root, text="Enter matrix:")
label.grid(row=0, column=0)
```

**Watch for:** Forgetting to call `.grid()` — the widget exists but is invisible.

---

### Step 2 — Add Size Selector and Input Grid

Add this code **after** the title label and **before** `root.mainloop()`:

```python
# Size selector
size_frame = tk.Frame(root)
size_frame.pack(pady=5)

tk.Label(size_frame, text="Matrix size:").pack(side=tk.LEFT)
size_var = tk.StringVar(value="2")
size_combo = ttk.Combobox(size_frame, textvariable=size_var, 
                         values=["2", "3"], state="readonly", width=5)
size_combo.pack(side=tk.LEFT, padx=5)

# Frame for matrix inputs
input_frame = tk.Frame(root)
input_frame.pack(pady=10)

# We will populate this frame dynamically later
entries = []  # will hold all Entry widgets
```

### SAVE AND RUN

Run the file.

**You should see:** Size dropdown added below the title.

---

### Step 3 — Create Dynamic Input Grid

Add this function **before** `root.mainloop()`:

```python
def create_input_grid(n):
    """Create n x (n+1) entry grid for augmented matrix"""
    global entries
    # Clear old entries
    for widget in input_frame.winfo_children():
        widget.destroy()
    entries.clear()
    
    for i in range(n):
        row_entries = []
        for j in range(n + 1):
            entry = tk.Entry(input_frame, width=8, justify="center")
            entry.grid(row=i, column=j, padx=2, pady=2)
            # Default values for convenience
            if j == n:  # last column (b)
                entry.insert(0, str(5 + i))
            else:
                entry.insert(0, str(1 if i == j else 0))
            row_entries.append(entry)
        entries.append(row_entries)
        
    # Visual separator for augmented matrix
    tk.Label(input_frame, text=" | ", font=("Helvetica", 12)).grid(row=0, column=n, rowspan=n)

create_input_grid(2)  # start with 2x2
```

Add this after the size combo:
```python
def on_size_change(*args):
    n = int(size_var.get())
    create_input_grid(n)

size_var.trace("w", on_size_change)
```

### SAVE AND RUN

**You should see:** A 2×3 grid of input boxes with default values and a vertical bar separating coefficients from constants.

**Change something:** Select 3 from the dropdown. The grid should update to 3×4.

---

### Concept: Reading Values from GUI Entries

**What it is:** Extracting user input from `tk.Entry` widgets into a 2D list (matrix).

**The problem before:** We had hardcoded matrices. Now users can enter anything.

**The solution:**
```python
matrix = [[float(entry.get()) for entry in row] for row in entries]
```

**Why it matters here:** This turns GUI input into the data structure our solver expects.

---

### Step 4 — Add Solve Button + Connect to Solver

First, paste your row operation functions (`print_matrix` is not needed, we’ll use a text widget) and elimination functions from the previous lab into this file (or import if you prefer).

Then add:

```python
# Output area
output_text = tk.Text(root, height=20, width=80)
output_text.pack(pady=10, padx=10)

def solve():
    output_text.delete(1.0, tk.END)
    try:
        n = len(entries)
        aug = [[float(entries[i][j].get()) for j in range(n+1)] for i in range(n)]
        
        output_text.insert(tk.END, "Initial augmented matrix:\n")
        for row in aug:
            output_text.insert(tk.END, f"{row}\n")
        output_text.insert(tk.END, "\n")
        
        # Use your forward + backward elimination here
        # For now, just placeholder
        output_text.insert(tk.END, "Solving... (connect your solver functions here)\n")
        
    except ValueError:
        messagebox.showerror("Input Error", "Please enter valid numbers")

solve_btn = tk.Button(root, text="Solve Step by Step", font=("Helvetica", 12, "bold"), 
                     bg="#4CAF50", fg="white", command=solve)
solve_btn.pack(pady=8)
```

### SAVE AND RUN

Click the Solve button.

**You should see:** The text widget shows the initial matrix and placeholder message.

---

### 🎯 Challenge: Integrate Your Gaussian Elimination Solver

**You know:** Row operations, forward/backward elimination, and reading from GUI.

**Task:** Replace the placeholder in `solve()` with your actual elimination code. Print every major step to `output_text`.

**Hint:** Modify your `forward_elimination` and `backward_elimination` to accept the text widget and insert messages instead of (or in addition to) printing.

Try for at least 5–7 minutes before revealing.

---

<details>
<summary>▶ Show Solution (Key Parts)</summary>

```python
def log(message):
    output_text.insert(tk.END, message + "\n")
    output_text.see(tk.END)   # auto-scroll

# Then in forward_elimination and similar:
log(f"After making pivot 1 in row {i}:")
# ... show current matrix
```

**Key insight:** The GUI is just a presentation layer. Your core solver logic stays clean and reusable.

</details>

---

### Final Check

| Feature                        | How to Verify |
|--------------------------------|---------------|
| Window opens with title        | Run the script |
| Size selector changes grid     | Switch between 2 and 3 |
| Input grid accepts numbers     | Type and see values |
| Solve button runs without crash| Click and see output |
| Step-by-step appears           | Every row operation logged |

---

## Quick Check Answers

**1. Why build window + one widget first?**  
You get immediate visual feedback and can test layout early instead of hunting bugs in hundreds of lines.

**2. What happens visually during row operations?**  
The output text updates live, showing the matrix transforming — you literally watch Gaussian elimination happen.

**3. How to handle infinitely many solutions?**  
Detect free variables (columns without pivots) and display parametric form like `x = 3 - 2s, y = s`.

---

**You now have a working visual interface for Gaussian Elimination!**

**Next steps — reply with your choice:**
1. Add 2D line plotting (matplotlib or Tkinter Canvas)
2. Improve solution display for infinite / inconsistent cases
3. Add matrix export / nice formatting
4. Partial pivoting + numerical stability warnings

What would you like to build next?