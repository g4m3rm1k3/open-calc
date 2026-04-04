// Chapter 2.1 — Arrays & Vectorization
//
// PHASE 2 — NUMERICAL COMPUTING (NUMPY-FIRST)
//
// TEACHES:
//   Math:    Vectors as ordered tuples of numbers, element-wise operations,
//            scalar multiplication, dot products, broadcasting rules,
//            aggregate statistics (mean, std, sum), cumulative operations
//
//   Python:  numpy arrays vs Python lists, array creation (np.array,
//            np.linspace, np.arange, np.zeros, np.ones), vectorized
//            arithmetic, boolean indexing, fancy indexing, array slicing,
//            2D arrays, shape/reshape, timeit for performance comparison
//
//   Library: opencalc accepts numpy arrays natively in fig.plot() and
//            fig.scatter(); np.linspace() is the idiomatic way to generate
//            smooth x-values for any opencalc curve

export default {
  id: 'py-2-1-arrays-vectorization',
  slug: 'arrays-and-vectorization',
  chapter: 2.1,
  order: 0,
  title: 'Arrays & Vectorization',
  subtitle: 'Why numpy exists, how arrays think, and what vectorized computation unlocks',
  tags: [
    'numpy', 'array', 'vectorization', 'broadcasting', 'linspace', 'boolean indexing',
    'performance', 'dot product', 'reshape', 'aggregate', 'opencalc',
  ],

  hook: {
    question: 'A weather model updates a grid of 10 million temperature values every second. A neural network multiplies millions of weight matrices in milliseconds. How?',
    realWorldContext:
      'Python loops are powerful but slow — they execute roughly 50 million simple operations per second. ' +
      'NumPy arrays bypass Python\'s interpreter and call pre-compiled C and Fortran routines directly, ' +
      'reaching billions of operations per second. ' +
      'Every major scientific computing library — SciPy, pandas, scikit-learn, TensorFlow, PyTorch — ' +
      'is built on top of numpy arrays. ' +
      'Understanding how arrays think (element-wise, broadcast, aggregate) ' +
      'is the single most important skill for numerical Python.',
    previewVisualizationId: 'PythonNotebook',
  },

  intuition: {
    prose: [
      'A **numpy array** is a fixed-type, contiguous block of numbers stored in memory. ' +
      'Unlike a Python list (which stores references to objects scattered across memory), ' +
      'an array stores the raw numbers back-to-back. ' +
      'That layout lets the CPU\'s SIMD (single-instruction, multiple-data) units ' +
      'operate on 4, 8, or 16 numbers simultaneously — which is why numpy feels magical.',
      'The mental model shift: stop thinking about **one number at a time**, and start thinking about ' +
      '**the whole array at once**. `a * 2` does not mean "loop and multiply each element" — ' +
      'it means "double the array". The loop still happens, but it happens inside compiled code, not Python.',
    ],
    callouts: [
      {
        type: 'definition',
        title: 'Vector (math definition)',
        body: 'An ordered tuple of n real numbers: \\mathbf{v} = (v_1, v_2, \\ldots, v_n) \\in \\mathbb{R}^n. Addition is element-wise: (a_i) + (b_i) = (a_i + b_i). Scalar multiplication: c \\cdot (v_i) = (c v_i).',
      },
      {
        type: 'insight',
        title: 'Vectorization = same op applied to every element',
        body: 'np.sin(x) computes sin of every element in x in one call. No Python loop needed. The operation is "vectorized" — broadcast across the array by compiled code.',
      },
    ],
    visualizations: [
      {
        id: 'PythonNotebook',
        title: 'Arrays & Vectorization',
        mathBridge: 'Element-wise: (a + b)_i = a_i + b_i. Dot product: a · b = Σ aᵢbᵢ. Broadcasting: scalar s applied to array a gives (s · aᵢ).',
        caption: 'Work through every cell. The final cells reveal how numpy powers smooth opencalc visualizations.',
        props: {
          initialCells: [

            // ── THE LOOP PROBLEM ─────────────────────────────────────────────
            {
              id: 1,
              cellTitle: 'The loop performance problem',
              prose: [
                'Before numpy, numerical Python meant writing loops. This cell shows exactly what that costs — and why the scientific Python ecosystem exists.',
                '## What a Python loop actually does',
                '- Each iteration: the interpreter fetches the next object reference from the list\n- It checks the object\'s type (is this an int? a float? a string?)\n- It calls the appropriate C function for the operation\n- It creates a new Python object for the result\n- All this overhead repeats **once per element**',
                '## The numpy alternative',
                'NumPy calls a single compiled routine that processes the entire array in one shot. The type is known up front (it\'s declared when the array is created), so there\'s no per-element type checking. The numbers sit contiguously in memory, so the CPU can prefetch and pipeline efficiently.',
                'The speedup is typically **100× to 1000×** for numerical operations on arrays of a thousand or more elements.',
              ],
              code: `import time

# Python loop approach — squaring 1 million numbers
n = 1_000_000
data = list(range(n))

t0 = time.perf_counter()
result_loop = [x * x for x in data]
t_loop = time.perf_counter() - t0

# NumPy approach — same operation
import numpy as np
arr = np.arange(n)

t0 = time.perf_counter()
result_np = arr * arr
t_np = time.perf_counter() - t0

print(f"List comprehension: {t_loop*1000:.1f} ms")
print(f"NumPy vectorized:   {t_np*1000:.1f} ms")
print(f"Speedup:            {t_loop/t_np:.0f}×")
print()
print(f"Same result? {result_loop[:5]} vs {result_np[:5].tolist()}")`,
              output: '', status: 'idle', figureJson: null,
            },

            // ── JIT: NUMPY ───────────────────────────────────────────────────
            {
              id: 'oc-numpy',
              cellTitle: 'Library: numpy — the numerical Python foundation',
              prose: [
                '**numpy** (`import numpy as np`) is the foundation of scientific Python. It provides a fixed-type, C-backed array type called `ndarray`, plus hundreds of mathematical functions that operate on arrays without Python loops.',
                '## Core array creation functions',
                '- `np.array([1, 2, 3])` — create from a Python list\n- `np.zeros(n)` — n zeros (float64 by default)\n- `np.ones(n)` — n ones\n- `np.arange(start, stop, step)` — like `range()` but returns an array; works with floats\n- `np.linspace(start, stop, num)` — **num evenly-spaced points** including both endpoints',
                '## The dtype system',
                'Every numpy array has a **dtype** — the type of its elements. Common dtypes:\n- `float64` — 64-bit float (default for most ops)\n- `int64` — 64-bit integer\n- `bool` — True/False (used for boolean indexing)\n- Check with `arr.dtype`; convert with `arr.astype(np.float32)`',
                '## Why `np.linspace` is your default x-axis generator',
                '`np.linspace(0, 2*np.pi, 500)` gives 500 equally-spaced x values from 0 to 2π — enough points that any curve plotted against them will look smooth. Use `np.arange` when you need integer steps or a specific step size; use `np.linspace` when you need a fixed number of points over a range.',
              ],
              code: `import numpy as np

# The four main creators — know these cold
a1 = np.array([3, 1, 4, 1, 5, 9])    # from list
a2 = np.zeros(5)                       # all zeros
a3 = np.ones(4)                        # all ones
a4 = np.arange(0, 10, 2)              # [0 2 4 6 8]
a5 = np.linspace(0, 1, 6)             # 6 points 0..1 inclusive

print("np.array:   ", a1)
print("np.zeros:   ", a2)
print("np.ones:    ", a3)
print("np.arange:  ", a4)
print("np.linspace:", a5)
print()

# dtype — every array knows its element type
print(f"a1 dtype: {a1.dtype}")        # int64
print(f"a2 dtype: {a2.dtype}")        # float64
print(f"a5 dtype: {a5.dtype}")        # float64

# Shape — arrays know their dimensions
print(f"a1 shape: {a1.shape}")        # (6,)
print(f"a1 size:  {a1.size}")         # 6 (total elements)`,
              output: '', status: 'idle', figureJson: null,
            },

            // ── ELEMENT-WISE ARITHMETIC ──────────────────────────────────────
            {
              id: 3,
              cellTitle: 'Element-wise arithmetic — the array mindset',
              prose: [
                'The core difference between numpy arrays and Python lists: **arithmetic operators work element-wise on arrays**. `a + b` adds corresponding elements; `a * b` multiplies corresponding elements. This is the mathematical definition of vector addition and scalar multiplication.',
                '## Python list vs numpy array',
                '- `[1, 2] + [3, 4]` → `[1, 2, 3, 4]` (concatenation — NOT math)\n- `np.array([1, 2]) + np.array([3, 4])` → `array([4, 6])` (element-wise add)\n- `[1, 2] * 3` → `[1, 2, 1, 2, 1, 2]` (repetition)\n- `np.array([1, 2]) * 3` → `array([3, 6])` (scalar multiply)',
                '## Operator translation table',
                '- `a + b` → element-wise addition (a_i + b_i)\n- `a - b` → element-wise subtraction\n- `a * b` → element-wise multiplication (NOT dot product!)\n- `a / b` → element-wise division\n- `a ** 2` → element-wise squaring\n- `a @ b` → dot product / matrix multiply',
              ],
              code: `import numpy as np

a = np.array([1, 2, 3, 4, 5], dtype=float)
b = np.array([10, 20, 30, 40, 50], dtype=float)

print("a:      ", a)
print("b:      ", b)
print()
print("a + b:  ", a + b)       # [11, 22, 33, 44, 55]
print("b - a:  ", b - a)       # [9, 18, 27, 36, 45]
print("a * b:  ", a * b)       # [10, 40, 90, 160, 250]
print("b / a:  ", b / a)       # [10, 10, 10, 10, 10]
print("a ** 2: ", a ** 2)      # [1, 4, 9, 16, 25]
print()

# Scalar operations — the scalar broadcasts to every element
print("a * 3:  ", a * 3)       # [3, 6, 9, 12, 15]
print("a + 100:", a + 100)     # [101, 102, 103, 104, 105]

# Dot product
dot = a @ b
print(f"\\na · b = {dot}")    # 1*10 + 2*20 + 3*30 + 4*40 + 5*50 = 550`,
              output: '', status: 'idle', figureJson: null,
            },

            // ── VECTORIZED MATH FUNCTIONS ────────────────────────────────────
            {
              id: 4,
              cellTitle: 'Vectorized math — np.sin, np.exp, np.log and friends',
              prose: [
                'The `math` module works on **scalars** — one number at a time. `numpy` provides equivalent functions that work on **entire arrays** at once. When building opencalc visualizations you will almost always use numpy\'s versions.',
                '## math module vs numpy — use numpy for arrays',
                '- `math.sin(x)` accepts a single float, raises TypeError on an array\n- `np.sin(arr)` applies sin to every element, returns an array of the same shape\n- Same pattern for: `np.cos`, `np.tan`, `np.exp`, `np.log`, `np.log10`, `np.sqrt`, `np.abs`',
                '## Constants in numpy',
                '- `np.pi` — π (same as `math.pi`)\n- `np.e` — Euler\'s number e\n- `np.inf` — infinity\n- `np.nan` — Not-a-Number',
                '## Chaining vectorized ops',
                'Because every numpy function returns an array, you can chain operations: `np.sin(np.linspace(0, 2*np.pi, 100)) ** 2` computes sin²(x) for 100 x-values in one expression — no loop, no intermediate list.',
              ],
              code: `import numpy as np

x = np.linspace(0, 2 * np.pi, 8)   # 8 points across one cycle
print("x:         ", np.round(x, 3))
print("np.sin(x): ", np.round(np.sin(x), 3))
print("np.cos(x): ", np.round(np.cos(x), 3))
print()

# Exponential and logarithm
t = np.array([0.0, 0.5, 1.0, 1.5, 2.0])
print("np.exp(t): ", np.round(np.exp(t), 4))
print("np.log(e^t):", np.round(np.log(np.exp(t)), 4))  # recovers t

# Combining operations — this is the numpy style
freqs = np.array([1, 2, 3])        # three frequencies
x_dense = np.linspace(0, 1, 6)
# outer product via reshape: (6,1) broadcast with (1,3) → (6,3)
waves = np.sin(2 * np.pi * freqs * x_dense.reshape(-1, 1))
print("\\nMulti-frequency matrix (6 x-values × 3 frequencies):")
print(np.round(waves, 2))`,
              output: '', status: 'idle', figureJson: null,
            },

            // ── SMOOTH PLOTTING WITH NUMPY ───────────────────────────────────
            {
              id: 5,
              cellTitle: 'Smooth curves — numpy + opencalc',
              prose: [
                'opencalc\'s `fig.plot(xs, ys)` accepts numpy arrays directly. The idiomatic pattern is: generate x-values with `np.linspace`, compute y-values with a vectorized expression, pass both to `fig.plot()`. The denser the x-array, the smoother the curve.',
                '## The smooth plotting recipe',
                '1. `x = np.linspace(start, stop, 500)` — 500 points is smooth for almost any function\n2. `y = some_vectorized_expression(x)` — one line, no loop\n3. `fig.plot(x, y)` — opencalc renders it\n- Compare: the old way needed `[f(xi) for xi in xs]` — a Python loop\n- The numpy way: `f(x)` — the array IS the loop',
                '## Plotting multiple curves',
                'Call `fig.plot()` multiple times before `fig.show()`. Each call adds a layer. Use the `color=` parameter (BLUE, RED, AMBER, GREEN, GRAY, PURPLE from opencalc) to distinguish them.',
              ],
              code: `import numpy as np
from opencalc import Figure, BLUE, RED, AMBER, GREEN, GRAY

x = np.linspace(-2 * np.pi, 2 * np.pi, 600)

fig = Figure(xmin=-6.5, xmax=6.5, ymin=-1.4, ymax=1.4,
             title="sin(x), cos(x), and sin(x)·cos(x)")
fig.grid().axes()

fig.plot(x, np.sin(x),          color=BLUE)
fig.plot(x, np.cos(x),          color=RED)
fig.plot(x, np.sin(x)*np.cos(x), color=AMBER)  # = sin(2x)/2

fig.text([-5,  0.9], "sin(x)",       color='blue',   size=11, bold=True)
fig.text([ 1,  1.15], "cos(x)",      color='red',    size=11, bold=True)
fig.text([ 3.5, 0.55], "sin·cos",    color='#b8860b', size=11, bold=True)
fig.show()`,
              output: '', status: 'idle', figureJson: null,
            },

            // ── ARRAY SLICING ────────────────────────────────────────────────
            {
              id: 6,
              cellTitle: 'Array slicing — reading parts of an array',
              prose: [
                'NumPy extends Python\'s slice syntax with powerful shortcuts. The key concept: **numpy slices return views, not copies**. Modifying a slice modifies the original array. This is intentional — it avoids copying large data — but can surprise you if you forget it.',
                '## Slice syntax: `arr[start:stop:step]`',
                '- `arr[2:5]` — elements at index 2, 3, 4\n- `arr[:3]` — first 3 elements (indices 0, 1, 2)\n- `arr[-3:]` — last 3 elements\n- `arr[::2]` — every other element (step 2)\n- `arr[::-1]` — reversed array\n- `arr[1::3]` — start at index 1, every 3rd element',
                '## Views vs copies',
                'A **view** shares memory with the original. Changing `view[0] = 99` changes `original[0]` too. To get an independent copy: `arr[2:5].copy()`. In practice: use slices freely for reading; call `.copy()` if you need to modify without affecting the original.',
              ],
              code: `import numpy as np

arr = np.arange(10)          # [0 1 2 3 4 5 6 7 8 9]
print("arr:        ", arr)

print("arr[2:5]:   ", arr[2:5])    # [2 3 4]
print("arr[:4]:    ", arr[:4])     # [0 1 2 3]
print("arr[-3:]:   ", arr[-3:])    # [7 8 9]
print("arr[::2]:   ", arr[::2])    # [0 2 4 6 8]
print("arr[::-1]:  ", arr[::-1])   # [9 8 7 6 5 4 3 2 1 0]
print("arr[1:8:3]: ", arr[1:8:3])  # [1 4 7]
print()

# Views — the slice shares memory
view = arr[2:5]
print("Before — view:", view, " arr[2]:", arr[2])
view[0] = 99
print("After  — view:", view, " arr[2]:", arr[2])  # arr[2] changed!
print()

# Copy — independent
arr2 = np.arange(10)
copy = arr2[2:5].copy()
copy[0] = 99
print("Original arr2[2] after modifying copy:", arr2[2])  # still 2`,
              output: '', status: 'idle', figureJson: null,
            },

            // ── AGGREGATE FUNCTIONS ──────────────────────────────────────────
            {
              id: 7,
              cellTitle: 'Aggregate functions — collapsing arrays to numbers',
              prose: [
                'Aggregate functions reduce an entire array to a single value (or, for 2D arrays, to a row or column). They are the numpy equivalents of `sum()`, `max()`, `min()` — but far faster, and with additional functions like `std()` and `cumsum()` that have no Python built-in equivalent.',
                '## The core aggregates',
                '- `np.sum(a)` or `a.sum()` — sum of all elements\n- `np.mean(a)` or `a.mean()` — arithmetic mean\n- `np.std(a)` or `a.std()` — standard deviation (population, ddof=0)\n- `np.var(a)` — variance\n- `np.min(a)`, `np.max(a)` — smallest / largest element\n- `np.argmin(a)`, `np.argmax(a)` — **index** of min / max\n- `np.cumsum(a)` — running total (returns array same size)\n- `np.diff(a)` — first differences: `diff[i] = a[i+1] - a[i]` (returns n-1 elements)',
                '## Method vs function — both work',
                '`np.mean(arr)` and `arr.mean()` are identical. The method form is more concise; the function form works with any array-like input including Python lists.',
              ],
              code: `import numpy as np

scores = np.array([72, 85, 91, 68, 79, 95, 83, 77, 88, 64])
print("scores:", scores)
print()
print(f"sum:    {scores.sum()}")
print(f"mean:   {scores.mean():.1f}")
print(f"std:    {scores.std():.2f}")
print(f"min:    {scores.min()}  at index {scores.argmin()}")
print(f"max:    {scores.max()}  at index {scores.argmax()}")
print()

# cumsum — running total
print("cumsum:", scores.cumsum())

# diff — first differences (how much did each score change?)
diff = np.diff(scores)
print("diff:  ", diff)
print(f"Biggest jump: {diff.max():+d} (from exam {diff.argmax()+1} to {diff.argmax()+2})")
print(f"Biggest drop: {diff.min():+d} (from exam {diff.argmin()+1} to {diff.argmin()+2})")`,
              output: '', status: 'idle', figureJson: null,
            },

            // ── BOOLEAN INDEXING ─────────────────────────────────────────────
            {
              id: 8,
              cellTitle: 'Boolean indexing — filtering arrays with conditions',
              prose: [
                'A comparison on a numpy array (e.g. `arr > 5`) returns a **boolean array** of the same shape — True where the condition holds, False elsewhere. When you use that boolean array as an index (`arr[mask]`), you get back only the elements where the mask is True. This is called **boolean indexing** or **masking**.',
                '## The pattern',
                '1. `mask = arr > threshold` — creates a bool array\n2. `arr[mask]` — selects elements where mask is True\n3. These two steps are usually combined: `arr[arr > threshold]`',
                '## Combining conditions',
                '- AND: `(a > 0) & (a < 10)` — use `&` not `and`\n- OR: `(a < 0) | (a > 10)` — use `|` not `or`\n- NOT: `~mask` — use `~` not `not`\n- Wrap each condition in parentheses — operator precedence bites if you forget',
                '## np.where — conditional selection',
                '`np.where(condition, x, y)` returns an array: where condition is True take x, else take y. Great for element-wise if/else without a Python loop.',
              ],
              code: `import numpy as np
from opencalc import Figure, BLUE, RED, GRAY

data = np.array([15, -3, 42, 7, -11, 28, 0, 33, -7, 19])
print("data:      ", data)

# Boolean mask
positive = data > 0
print("mask:      ", positive)
print("positives: ", data[positive])
print("negatives: ", data[data < 0])

# Combining conditions
mid_range = data[(data >= 10) & (data <= 35)]
print("10–35 range:", mid_range)

# np.where — clip negatives to 0 (like ReLU in neural networks)
relu = np.where(data > 0, data, 0)
print("ReLU:      ", relu)

# Count how many satisfy a condition — True == 1 in arithmetic
print(f"\\nPositive count: {positive.sum()}")
print(f"Positive mean:  {data[positive].mean():.1f}")

# Visualise: colour-code positive vs negative bars
xs = np.arange(len(data))
colors = ['blue' if v > 0 else 'red' for v in data]
fig = Figure(xmin=-1, xmax=10, ymin=-15, ymax=50,
             title="Positive (blue) vs negative (red) values")
fig.grid().axes()
fig.bars(xs.tolist(), data.tolist(), color=BLUE, alpha=0.5)
fig.hline(0, color=GRAY)
fig.show()`,
              output: '', status: 'idle', figureJson: null,
            },

            // ── BROADCASTING ─────────────────────────────────────────────────
            {
              id: 9,
              cellTitle: 'Broadcasting — how numpy handles different shapes',
              prose: [
                '**Broadcasting** is numpy\'s set of rules for applying operations between arrays of different shapes. The simplest case is scalar-array: `arr * 3` broadcasts the scalar 3 to match the shape of `arr`. The general rules extend this to pairs of arrays.',
                '## Broadcasting rules (applied left to right)',
                '1. If the arrays have different numbers of dimensions, prepend 1s to the shape of the smaller one\n2. Arrays with size 1 along a dimension are stretched to match the other array\n3. If sizes still don\'t match and neither is 1, numpy raises a ValueError',
                '## Common broadcasting patterns',
                '- `(n,) + scalar` → works: scalar stretches to (n,)\n- `(m, n) + (n,)` → works: (n,) becomes (1, n) then stretches to (m, n) — adds a row vector to every row\n- `(m, n) + (m, 1)` → works: (m, 1) stretches to (m, n) — adds a column vector to every column\n- `(m, n) + (k,)` where k ≠ n → ValueError',
                '**Key use case:** normalizing data — subtract the column mean and divide by column std in one line, using broadcasting across rows.',
              ],
              code: `import numpy as np

# 1D broadcasting — scalar to array
a = np.array([1.0, 2.0, 3.0, 4.0])
print("a * 10:     ", a * 10)
print("a + 100:    ", a + 100)

# 2D broadcasting — (4,3) + (3,) adds row vector to every row
matrix = np.array([[1, 2, 3],
                   [4, 5, 6],
                   [7, 8, 9],
                   [10,11,12]], dtype=float)
row_offset = np.array([100, 200, 300])   # shape (3,)
print("\\nmatrix + row_offset:")
print(matrix + row_offset)               # offset applied to every row

# Column broadcast — (4,3) + (4,1)
col_offset = np.array([[10], [20], [30], [40]])  # shape (4,1)
print("\\nmatrix + col_offset:")
print(matrix + col_offset)              # different offset per row

# Practical: Z-score normalisation (subtract mean, divide by std)
data = np.array([[2.0, 8.0, 3.0],
                 [5.0, 7.0, 1.0],
                 [3.0, 9.0, 4.0]])
col_means = data.mean(axis=0)   # shape (3,) — mean of each column
col_stds  = data.std(axis=0)    # shape (3,)
z = (data - col_means) / col_stds
print("\\nZ-scores:")
print(np.round(z, 3))
print("Column means of z:", np.round(z.mean(axis=0), 10))  # ~0`,
              output: '', status: 'idle', figureJson: null,
            },

            // ── 2D ARRAYS ────────────────────────────────────────────────────
            {
              id: 10,
              cellTitle: '2D arrays — shape, indexing, and the axis concept',
              prose: [
                'A 2D numpy array is a **matrix** — a grid of numbers with rows and columns. It has a shape `(rows, cols)`. Understanding 2D arrays is essential for data science: a dataset with n observations and p features is naturally an (n, p) array.',
                '## Creating 2D arrays',
                '- `np.array([[1,2,3],[4,5,6]])` — from nested lists, shape (2,3)\n- `np.zeros((m, n))` — m×n grid of zeros\n- `np.ones((m, n))` — m×n grid of ones\n- `np.eye(n)` — n×n identity matrix (1s on diagonal)\n- `arr.reshape(m, n)` — reshape a 1D array into 2D',
                '## Indexing 2D arrays',
                '- `a[i, j]` — element at row i, column j (prefer over `a[i][j]`)\n- `a[i, :]` or `a[i]` — entire row i (returns 1D array)\n- `a[:, j]` — entire column j (returns 1D array)\n- `a[1:3, 0:2]` — sub-matrix (rows 1-2, cols 0-1)',
                '## The axis parameter',
                '`axis=0` operates **down the rows** (collapses rows → one value per column). `axis=1` operates **across the columns** (collapses columns → one value per row). This trips up beginners constantly — remember: axis=0 gives column summaries.',
              ],
              code: `import numpy as np

# Build a 4×5 matrix from np.arange
m = np.arange(20).reshape(4, 5)
print("m (shape", m.shape, "):")
print(m)
print()

# Indexing
print("m[1, 3]:  ", m[1, 3])       # row 1, col 3 → 8
print("m[2]:     ", m[2])           # row 2 → [10 11 12 13 14]
print("m[:, 1]:  ", m[:, 1])        # column 1 → [1 6 11 16]
print("m[1:3, 2:4]:")               # 2×2 sub-matrix
print(m[1:3, 2:4])
print()

# Axis — axis=0 collapses rows, axis=1 collapses columns
print("Sum axis=0 (per column):", m.sum(axis=0))
print("Sum axis=1 (per row):   ", m.sum(axis=1))
print()

# Identity matrix
I = np.eye(4)
print("Identity matrix I:")
print(I)

# Matrix multiply
A = np.array([[1, 2], [3, 4]], dtype=float)
b = np.array([5, 6], dtype=float)
print("\\nA @ b =", A @ b)          # matrix-vector product`,
              output: '', status: 'idle', figureJson: null,
            },

            // ── PERFORMANCE DEEP DIVE ────────────────────────────────────────
            {
              id: 11,
              cellTitle: 'Performance — measuring the numpy advantage',
              prose: [
                'Understanding *when* numpy is fast (and when it isn\'t) prevents a common beginner mistake: vectorizing everything, including operations where the overhead of array creation outweighs the benefit.',
                '## When numpy dominates',
                '- Large arrays (1 000+ elements): 100–1000× faster than Python loops\n- Chained math operations: numpy avoids creating temporary Python objects\n- Operations that map directly to BLAS/LAPACK: matrix multiply, dot product, linear solve',
                '## When numpy is not faster',
                '- Tiny arrays (< ~50 elements): the array creation overhead dominates\n- Logic-heavy loops: numpy can\'t vectorize arbitrary Python control flow\n- Operations with data-dependent branching: must use loops or np.vectorize (which is just a loop with a prettier API)',
                '## `time.perf_counter` pattern',
                'For rough timing: `t0 = time.perf_counter(); do_work(); elapsed = time.perf_counter() - t0`. For reliable micro-benchmarks use `timeit.timeit()` — it runs the code many times and averages, avoiding noise from OS scheduling.',
              ],
              code: `import numpy as np
import time

def time_it(label, fn, reps=5):
    times = []
    for _ in range(reps):
        t0 = time.perf_counter()
        fn()
        times.append(time.perf_counter() - t0)
    avg = sum(times) / reps
    print(f"{label:<35} {avg*1000:8.2f} ms")

n = 500_000

# 1. Sum
py_list = list(range(n))
np_arr  = np.arange(n, dtype=float)

time_it("Python sum(list)",       lambda: sum(py_list))
time_it("numpy arr.sum()",        lambda: np_arr.sum())
print()

# 2. Square root of every element
time_it("math.sqrt via loop",     lambda: [1/x**0.5 for x in range(1, n+1)])
time_it("np.sqrt vectorized",     lambda: np.sqrt(np_arr + 1))
print()

# 3. Dot product
a = np.random.rand(n)
b = np.random.rand(n)
time_it("Python loop dot",        lambda: sum(x*y for x,y in zip(a, b)))
time_it("numpy a @ b",            lambda: a @ b)`,
              output: '', status: 'idle', figureJson: null,
            },

            // ── PUTTING IT TOGETHER ──────────────────────────────────────────
            {
              id: 12,
              cellTitle: 'Putting it together — vector field visualization',
              prose: [
                'This cell applies everything from the chapter — linspace, vectorized trig, 2D arrays, boolean indexing, and opencalc — to visualize how the Lissajous family of curves behaves as the frequency ratio changes. It\'s also a template for any "parameter sweep" visualization.',
                '## The workflow pattern',
                '1. **Define the parameter space** with `np.linspace`\n2. **Compute outputs** with vectorized operations (no loops over values)\n3. **Select subsets** with boolean indexing or slicing\n4. **Visualize** by passing numpy arrays directly to opencalc\n- This Model → Compute → Visualize loop is the template for every numerical result in Phase 2+',
              ],
              code: `import numpy as np
from opencalc import Figure, BLUE, RED, AMBER, GREEN, PURPLE, GRAY

t = np.linspace(0, 2 * np.pi, 800)

# Frequency ratios to compare
ratios = [(1, 1), (2, 1), (3, 2), (3, 1)]
colors = [BLUE, RED, AMBER, GREEN]
labels = ["1:1 (diagonal)", "2:1", "3:2", "3:1"]

fig = Figure(xmin=-1.3, xmax=1.3, ymin=-1.3, ymax=1.3,
             title="Lissajous figures — numpy vectorized", square=True)
fig.grid().axes()

for (fx, fy), color, label in zip(ratios, colors, labels):
    x = np.sin(fx * t)           # vectorized — no loop
    y = np.sin(fy * t + np.pi/4) # phase offset of π/4
    # Downsample to ~200 points so scatter looks clean
    step = max(1, len(t) // 200)
    fig.scatter(x[::step].tolist(), y[::step].tolist(),
                color=color, radius=2)

# Add legend labels
positions = [(-1.1, 1.1), (-1.1, 0.95), (-1.1, 0.80), (-1.1, 0.65)]
for (lx, ly), color, label in zip(positions, colors, labels):
    fig.text([lx, ly], label, color=color, size=10, bold=True)

fig.show()`,
              output: '', status: 'idle', figureJson: null,
            },

          ], // end initialCells

          challenges: [

            // ── CHALLENGE 1: fill/easy ────────────────────────────────────────
            {
              id: 'c1',
              challengeType: 'fill',
              challengeNumber: 1,
              challengeTitle: 'Array creation and element-wise ops',
              difficulty: 'easy',
              prompt: 'Fill in the blanks to create arrays and perform vectorized operations.',
              starterBlock: `import numpy as np

# 1. Create an array of 10 evenly-spaced values from 0 to 1 (inclusive)
x = np._____(0, 1, 10)

# 2. Compute y = x squared minus 2x (vectorized — no loop)
y = x**2 - _____

# 3. Find the index of the minimum value of y
idx_min = np._____(y)

# 4. Extract every other element of y starting from index 0
every_other = y[_____]

print("x:         ", np.round(x, 3))
print("y:         ", np.round(y, 3))
print("min index: ", idx_min)
print("every other:", np.round(every_other, 3))`,
              code: `import numpy as np

x = np.linspace(0, 1, 10)
y = x**2 - 2*x
idx_min = np.argmin(y)
every_other = y[::2]

print("x:         ", np.round(x, 3))
print("y:         ", np.round(y, 3))
print("min index: ", idx_min)
print("every other:", np.round(every_other, 3))`,
              output: '', status: 'idle', figureJson: null,
              testCode: `
import numpy as np
if 'x' not in dir() or 'y' not in dir():
    res = "ERROR: x or y not defined."
else:
    expected_x = np.linspace(0, 1, 10)
    expected_y = expected_x**2 - 2*expected_x
    if not np.allclose(x, expected_x):
        res = "ERROR: x should be np.linspace(0, 1, 10)."
    elif not np.allclose(y, expected_y):
        res = "ERROR: y should be x**2 - 2*x."
    elif idx_min != np.argmin(expected_y):
        res = f"ERROR: idx_min should be {np.argmin(expected_y)}, got {idx_min}."
    elif not np.allclose(every_other, expected_y[::2]):
        res = "ERROR: every_other should be y[::2]."
    else:
        res = f"SUCCESS: x has {len(x)} pts, min of y at index {idx_min} (value={y[idx_min]:.3f})."
res
`,
              hint: 'np.linspace(start, stop, num). y = x**2 - 2*x. np.argmin(y). y[::2] for step-2 slice.',
            },

            // ── CHALLENGE 2: write/easy ────────────────────────────────────────
            {
              id: 'c2',
              challengeType: 'write',
              challengeNumber: 2,
              challengeTitle: 'Vectorize a function',
              difficulty: 'easy',
              prompt: 'Write `sigmoid(x)` that accepts a numpy array and returns σ(x) = 1 / (1 + e^(−x)) **without any Python loops**. Then plot σ(x) and its derivative σ(x)·(1 − σ(x)) on the same figure over x ∈ [−6, 6].',
              code: `import numpy as np
from opencalc import Figure, BLUE, RED, GRAY

def sigmoid(x):
    """Vectorized sigmoid. Must work on numpy arrays without loops."""
    pass

x = np.linspace(-6, 6, 400)
s = sigmoid(x)
ds = s * (1 - s)    # derivative of sigmoid

print(f"sigmoid(0) = {sigmoid(np.array([0.0]))[0]:.4f}  (should be 0.5)")
print(f"sigmoid(6) ≈ {sigmoid(np.array([6.0]))[0]:.4f}  (should be near 1)")
print(f"Max derivative at x=0: {ds.max():.4f}  (should be 0.25)")

fig = Figure(xmin=-6.5, xmax=6.5, ymin=-0.05, ymax=1.1,
             title="Sigmoid σ(x) and its derivative")
fig.grid().axes()
fig.plot(x, s,  color=BLUE)
fig.plot(x, ds, color=RED)
fig.hline(0.5, color=GRAY)
fig.text([-5.5, 0.92], "σ(x)",    color='blue', size=12, bold=True)
fig.text([-5.5, 0.30], "σ'(x)",   color='red',  size=12, bold=True)
fig.show()`,
              output: '', status: 'idle', figureJson: null,
              testCode: `
import numpy as np
if 'sigmoid' not in dir():
    res = "ERROR: sigmoid not defined."
else:
    x = np.array([-10.0, -1.0, 0.0, 1.0, 10.0])
    s = sigmoid(x)
    if s is None:
        res = "ERROR: returned None — fill in the function."
    elif not isinstance(s, np.ndarray):
        res = "ERROR: sigmoid must return a numpy array."
    elif not np.isclose(s[2], 0.5, atol=1e-8):
        res = f"ERROR: sigmoid(0) should be 0.5, got {s[2]:.6f}."
    elif not np.isclose(s[4], 1/(1+np.exp(-10)), atol=1e-8):
        res = f"ERROR: sigmoid(10) wrong — got {s[4]:.6f}."
    elif not np.all(np.diff(s) > 0):
        res = "ERROR: sigmoid should be strictly increasing."
    else:
        res = f"SUCCESS: sigmoid correct — σ(0)={s[2]:.4f}, σ(-10)={s[0]:.6f}, σ(10)={s[4]:.6f}."
res
`,
              hint: '`1 / (1 + np.exp(-x))` — np.exp works on arrays element-wise. No loop needed.',
            },

            // ── CHALLENGE 3: write/medium ─────────────────────────────────────
            {
              id: 'c3',
              challengeType: 'write',
              challengeNumber: 3,
              challengeTitle: 'Boolean indexing — data analysis',
              difficulty: 'medium',
              prompt: 'A sensor logs temperature readings every hour for 30 days (720 readings). Using only numpy operations (no Python loops): (1) Find the mean, std, min, and max. (2) Count readings above 25°C. (3) Find the mean of readings in the range [18, 25] (the "comfortable zone"). (4) Find the index of the maximum reading. (5) Plot the full dataset, with comfortable-zone readings highlighted in green and readings above 25°C highlighted in red.',
              code: `import numpy as np
from opencalc import Figure, BLUE, RED, GREEN, GRAY

# Reproducible fake sensor data (do not change the seed)
rng = np.random.default_rng(42)
temps = 20 + 6 * np.sin(np.linspace(0, 4 * np.pi, 720)) + rng.normal(0, 1.5, 720)

# Your analysis here
mean_temp = None   # replace
std_temp  = None
min_temp  = None
max_temp  = None
n_hot     = None   # count of readings > 25
mean_comfortable = None  # mean of readings in [18, 25]
idx_max   = None   # index of the maximum reading

print(f"Mean:          {mean_temp:.2f} °C")
print(f"Std dev:       {std_temp:.2f} °C")
print(f"Min:           {min_temp:.2f} °C")
print(f"Max:           {max_temp:.2f} °C  (at index {idx_max})")
print(f"Hot readings:  {n_hot} / {len(temps)}")
print(f"Comfortable mean: {mean_comfortable:.2f} °C")

# Plot
hours = np.arange(len(temps))
hot_mask = temps > 25
comfortable_mask = (temps >= 18) & (temps <= 25)
cold_mask = temps < 18

fig = Figure(xmin=0, xmax=720, ymin=10, ymax=35,
             title="Temperature log — cold/comfortable/hot highlighted")
fig.grid().axes()
fig.scatter(hours[cold_mask].tolist(),        temps[cold_mask].tolist(),        color=BLUE,  radius=2)
fig.scatter(hours[comfortable_mask].tolist(), temps[comfortable_mask].tolist(), color=GREEN, radius=2)
fig.scatter(hours[hot_mask].tolist(),         temps[hot_mask].tolist(),         color=RED,   radius=2)
fig.hline(25, color='red')
fig.hline(18, color='blue')
fig.show()`,
              output: '', status: 'idle', figureJson: null,
              testCode: `
import numpy as np
rng = np.random.default_rng(42)
temps = 20 + 6 * np.sin(np.linspace(0, 4 * np.pi, 720)) + rng.normal(0, 1.5, 720)

if mean_temp is None:
    res = "ERROR: mean_temp is None — fill in the analysis."
elif not np.isclose(mean_temp, temps.mean(), rtol=1e-6):
    res = f"ERROR: mean_temp should be {temps.mean():.4f}, got {mean_temp:.4f}."
elif not np.isclose(std_temp, temps.std(), rtol=1e-6):
    res = f"ERROR: std_temp should be {temps.std():.4f}, got {std_temp:.4f}."
elif n_hot != int((temps > 25).sum()):
    res = f"ERROR: n_hot should be {int((temps>25).sum())}, got {n_hot}."
elif idx_max != int(temps.argmax()):
    res = f"ERROR: idx_max should be {int(temps.argmax())}, got {idx_max}."
else:
    expected_cm = temps[(temps >= 18) & (temps <= 25)].mean()
    if not np.isclose(mean_comfortable, expected_cm, rtol=1e-4):
        res = f"ERROR: mean_comfortable should be {expected_cm:.4f}, got {mean_comfortable:.4f}."
    else:
        res = f"SUCCESS: mean={mean_temp:.2f}, std={std_temp:.2f}, hot={n_hot}, comfortable mean={mean_comfortable:.2f}."
res
`,
              hint: 'temps.mean(), temps.std(), temps.min(), temps.max(), temps.argmax(). n_hot = (temps > 25).sum(). comfortable = temps[(temps>=18)&(temps<=25)]; comfortable.mean().',
            },

            // ── CHALLENGE 4: write/medium ─────────────────────────────────────
            {
              id: 'c4',
              challengeType: 'write',
              challengeNumber: 4,
              challengeTitle: 'Broadcasting — distance matrix',
              difficulty: 'medium',
              prompt: 'Write `distance_matrix(points)` where `points` is an (n, 2) numpy array of (x, y) coordinates. Return the (n, n) matrix D where `D[i, j]` is the Euclidean distance between point i and point j. Use **broadcasting** — no Python loops allowed. Then: (1) print the matrix for 5 points, (2) find the closest pair of distinct points, (3) find the point with the smallest average distance to all others.',
              code: `import numpy as np
from opencalc import Figure, BLUE, RED, AMBER, GRAY

def distance_matrix(points):
    """
    points: (n, 2) numpy array.
    Returns (n, n) distance matrix using broadcasting only.
    Hint: diff[i,j] = points[i] - points[j]
          shape trick: points[:,np.newaxis,:] - points[np.newaxis,:,:]
    """
    pass

# Test with 5 points
pts = np.array([[0, 0], [3, 4], [1, 1], [6, 0], [3, 3]], dtype=float)
D = distance_matrix(pts)

print("Distance matrix:")
print(np.round(D, 2))

# Closest pair (excluding diagonal — distance from point to itself)
np.fill_diagonal(D, np.inf)
i, j = np.unravel_index(D.argmin(), D.shape)
print(f"\\nClosest pair: point {i} {pts[i]} and point {j} {pts[j]}")
print(f"Distance: {D[i,j]:.4f}")

# Point with smallest mean distance to others (restore diagonal to 0)
np.fill_diagonal(D, 0)
mean_dists = D.sum(axis=1) / (len(pts) - 1)
hub = mean_dists.argmin()
print(f"\\nHub point (min avg distance): point {hub} {pts[hub]}")
print(f"Its average distance to all others: {mean_dists[hub]:.4f}")

# Visualize
fig = Figure(xmin=-1, xmax=8, ymin=-1, ymax=6,
             title="Points and closest pair (red line)")
fig.grid().axes()
for k, (px, py) in enumerate(pts):
    fig.point([px, py], color=BLUE, radius=8)
    fig.text([px + 0.15, py + 0.15], str(k), color='blue', size=11, bold=True)
# Restore closest pair info (D was modified)
D2 = distance_matrix(pts)
np.fill_diagonal(D2, np.inf)
i2, j2 = np.unravel_index(D2.argmin(), D2.shape)
fig.line([pts[i2, 0], pts[i2, 1]], [pts[j2, 0], pts[j2, 1]], color=RED)
fig.point(pts[hub].tolist(), color=AMBER, radius=12)
fig.show()`,
              output: '', status: 'idle', figureJson: null,
              testCode: `
import numpy as np
if 'distance_matrix' not in dir():
    res = "ERROR: distance_matrix not defined."
else:
    pts = np.array([[0,0],[3,4],[1,1],[6,0],[3,3]], dtype=float)
    D = distance_matrix(pts)
    if D is None:
        res = "ERROR: returned None — fill in the function."
    elif D.shape != (5, 5):
        res = f"ERROR: shape should be (5,5), got {D.shape}."
    elif not np.allclose(np.diag(D), 0):
        res = "ERROR: diagonal should be 0 (distance from point to itself)."
    elif not np.allclose(D, D.T):
        res = "ERROR: matrix should be symmetric (D[i,j] == D[j,i])."
    elif not np.isclose(D[0,1], 5.0, atol=1e-6):
        res = f"ERROR: D[0,1] should be 5.0 (3-4-5 triangle), got {D[0,1]:.4f}."
    else:
        np.fill_diagonal(D, np.inf)
        i, j = np.unravel_index(D.argmin(), D.shape)
        res = f"SUCCESS: distance_matrix correct. Closest pair: {i} and {j}, distance={D[i,j]:.4f}."
res
`,
              hint: 'diff = points[:, np.newaxis, :] - points[np.newaxis, :, :] gives shape (n, n, 2). Then np.sqrt((diff**2).sum(axis=2)) gives the (n, n) distance matrix.',
            },

            // ── CHALLENGE 5: write/hard ───────────────────────────────────────
            {
              id: 'c5',
              challengeType: 'write',
              challengeNumber: 5,
              challengeTitle: 'Image processing — grayscale convolution',
              difficulty: 'hard',
              prompt: 'A **convolution** slides a small matrix (kernel) over a larger matrix (image), computing a weighted sum at each position. It is the core operation in convolutional neural networks. Write `convolve2d(image, kernel)` using only numpy (no scipy, no loops over pixels). The function should return the convolved image with "valid" padding (output is smaller than input by kernel_size - 1 in each dimension). Then apply a **Gaussian blur** kernel and a **Sobel edge-detection** kernel to a synthetic test image and visualize the results.',
              code: `import numpy as np
from opencalc import Figure, GRAY, BLUE

def convolve2d(image, kernel):
    """
    Convolve image (H, W) with kernel (kH, kW) — valid padding only.
    Output shape: (H - kH + 1, W - kW + 1).
    Use array slicing and broadcasting — no pixel-level Python loop.
    Hint: build output row by row using vectorized row operations,
          OR use np.lib.stride_tricks for a fully vectorized approach.
    """
    pass

# Synthetic test image — concentric rings
H, W = 60, 60
cx, cy = W // 2, H // 2
ys, xs = np.mgrid[0:H, 0:W]
dist = np.sqrt((xs - cx)**2 + (ys - cy)**2)
image = (np.sin(dist * 0.8) + 1) / 2   # values in [0, 1]

# 3×3 Gaussian blur kernel
k_blur = np.array([[1, 2, 1],
                   [2, 4, 2],
                   [1, 2, 1]], dtype=float) / 16

# 3×3 Sobel horizontal edge detector
k_sobel = np.array([[-1, 0, 1],
                    [-2, 0, 2],
                    [-1, 0, 1]], dtype=float)

blurred = convolve2d(image, k_blur)
edges   = convolve2d(image, k_sobel)

print(f"Original shape: {image.shape}")
print(f"Blurred shape:  {blurred.shape}")
print(f"Edge map shape: {edges.shape}")
print(f"Blurred range:  [{blurred.min():.3f}, {blurred.max():.3f}]")
print(f"Edge range:     [{edges.min():.3f}, {edges.max():.3f}]")

# Visualize as scatter (one point per pixel — sparse sample)
step = 3
ys_s, xs_s = np.mgrid[0:blurred.shape[0]:step, 0:blurred.shape[1]:step]
vals = blurred[::step, ::step].ravel()
# Normalize edges for display
e_vals = np.abs(edges[::step, ::step].ravel())
e_norm = e_vals / e_vals.max()

fig = Figure(xmin=0, xmax=W, ymin=0, ymax=H,
             title="Gaussian blur (blue scale by intensity)", square=True)
fig.grid()
for xi, yi, v in zip(xs_s.ravel(), ys_s.ravel(), vals):
    fig.point([float(xi), float(H - yi)], color=BLUE, radius=max(1, int(v*6)), alpha=float(v))
fig.show()`,
              output: '', status: 'idle', figureJson: null,
              testCode: `
import numpy as np
if 'convolve2d' not in dir():
    res = "ERROR: convolve2d not defined."
else:
    img = np.array([[1,2,3,4],[5,6,7,8],[9,10,11,12],[13,14,15,16]], dtype=float)
    kern = np.array([[1,0],[0,-1]], dtype=float)
    out = convolve2d(img, kern)
    if out is None:
        res = "ERROR: returned None — fill in the function."
    elif out.shape != (3, 3):
        res = f"ERROR: output shape should be (3,3) for (4,4) image and (2,2) kernel, got {out.shape}."
    elif not np.isclose(out[0,0], img[0,0]*1 + img[0,1]*0 + img[1,0]*0 + img[1,1]*(-1)):
        expected = img[0,0] - img[1,1]
        res = f"ERROR: out[0,0] should be {expected:.1f}, got {out[0,0]:.1f}."
    else:
        # Check a few more values
        expected_full = np.array([[1-6, 2-7, 3-8],[5-10, 6-11, 7-12],[9-14, 10-15, 11-16]], dtype=float)
        if np.allclose(out, expected_full):
            res = f"SUCCESS: convolve2d correct — output shape {out.shape}, values match expected."
        else:
            res = f"ERROR: output values wrong. Got {out}, expected {expected_full}."
res
`,
              hint: 'Loop over output positions (i, j) with a Python loop over the output rows/cols, but use vectorized slice multiplication: out[i,j] = (image[i:i+kH, j:j+kW] * kernel).sum(). For the fully numpy approach: use np.lib.stride_tricks.as_strided to create a view of shape (out_H, out_W, kH, kW), then multiply by kernel and sum over last two axes.',
            },

          ], // end challenges
        }, // end props
      }, // end visualization
    ], // end visualizations
  }, // end intuition
}
