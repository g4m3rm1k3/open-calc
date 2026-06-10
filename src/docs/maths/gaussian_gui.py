import tkinter as tk
from tkinter import ttk, messagebox

# -------------------
# Main window setup
# -------------------
root = tk.Tk()
root.title("Gaussian Elimination Visualizer")
root.geometry("900x700")

# Title label at the top
title = tk.Label(
    root,
    text="Gaussian Elimination Visualizer",
    font=("Helvetica", 16, "bold")
)
title.pack(pady=10)

# -------------------
# Matrix size selector
# -------------------
size_frame = tk.Frame(root)
size_frame.pack(pady=5)

tk.Label(size_frame, text="Matrix size:").pack(side=tk.LEFT)

# Stores selected matrix size as a string ("2" or "3")
size_var = tk.StringVar(value="2")

size_combo = ttk.Combobox(
    size_frame,
    textvariable=size_var,
    values=["2", "3"],
    state="readonly",
    width=5
)

# Whenever size_var changes, rebuild the input grid
def on_size_change(*args):
    n = int(size_var.get())
    create_input_grid(n)

size_var.trace("w", on_size_change)
size_combo.pack(side=tk.LEFT, padx=5)

# -------------------
# Frame to hold matrix Entry widgets
# -------------------
input_frame = tk.Frame(root)
input_frame.pack(pady=10)

# This will store Entry widgets as:
# entries[row][column]
entries = []

def create_input_grid(n):
    """
    Create an n x (n+1) grid of Entry widgets
    This represents an augmented matrix [A | b]
    """
    global entries

    # Remove old widgets when resizing
    for widget in input_frame.winfo_children():
        widget.destroy()

    entries.clear()

    # Create Entry widgets
    for i in range(n):              # rows
        row_entries = []
        for j in range(n + 1):      # columns (n + 1 for augmented matrix)

            entry = tk.Entry(
                input_frame,
                width=8,
                justify="center"
            )
            entry.grid(row=i, column=j, padx=2, pady=2)

            # Insert default values for convenience
            if j == n:
                # Last column = right-hand side vector (b)
                entry.insert(0, str(5 + i))
            else:
                # Identity matrix on the left
                entry.insert(0, str(1 if i == j else 0))

            row_entries.append(entry)

        entries.append(row_entries)

    # --------------------------------
    # Visual separator (THIS IS THE CONFUSING PART)
    # --------------------------------
    # This Label is placed in the SAME column as the last Entry widgets
    # which causes it to overlap visually.
    # It spans all rows vertically (rowspan=n).
    tk.Label(
        input_frame,
        text=" | ",
        font=("Helvetica", 12)
    ).grid(row=0, column=n, rowspan=n)


def create_input_grid(n):
    """Create n x (n+1) entry grid for augmented matrix"""
    global entries

    # Clear old widgets
    for widget in input_frame.winfo_children():
        widget.destroy()

    entries.clear()

    for i in range(n):
        row_entries = []
        for j in range(n + 1):
            entry = tk.Entry(input_frame, width=8, justify="center")

            # Shift RHS (b column) one column right
            col = j if j < n else j + 1
            entry.grid(row=i, column=col, padx=2, pady=2)

            # Default values
            if j == n:  # RHS column
                entry.insert(0, str(5 + i))
            else:
                entry.insert(0, str(1 if i == j else 0))

            row_entries.append(entry)

        entries.append(row_entries)

    # Separator column (1 × n, centered vertically)
    tk.Label(
        input_frame,
        text="|",
        font=("Helvetica", 12, "bold")
    ).grid(row=0, column=n, columnspan=i, rowspan=n*2, padx=6)



# Create initial 2x2 augmented matrix
create_input_grid(2)

#Output area
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

        output_text.insert(tk.END, "Solving... (connect your solver functions here)\n")

    except ValueError:
        messagebox.showerror("Input Error", "Please enter valid numbers")

solve_btn = tk.Button(root, text="Solve Step by Step", font=("Helvetica", 12, "bold"), bg="#4CAF50", fg="white", command=solve)
solve_btn.pack(pady=8)



root.mainloop()