# Computational Mathematics — LAB 01 — NumPy Arrays

**Prerequisites:** Python functions, loops, and lists.

**What this lab adds:**
- Why Python lists are the wrong tool for mathematics
- NumPy arrays: the right tool — what they are and how they work
- Creating, inspecting, and operating on arrays
- The core idea that makes NumPy fast: vectorized operations

**Environment:** Python 3.10+ | Run with `python lab01.py`
**Install:** `pip install numpy`

**Time:** 45 minutes

---

> **Quick Check — try to answer before reading:**
>
> 1. If you have two Python lists `a = [1, 2, 3]` and `b = [4, 5, 6]`, what does `a + b` produce? What would you expect it to produce mathematically?
> 2. A Python list can hold `[1, "hello", True, 3.14]`. Why might mixing types be a problem for mathematical operations?
> 3. *(Prediction)* If NumPy can add two arrays of a million numbers in one line, and Python does it in a loop — which do you think is faster, and by roughly how much?
>
> *(Answers at the end of this lab)*

---

## What You Will Build

A script that shows the three things that make NumPy essential:

```
=== Python list: vector addition ===
[1, 2, 3] + [4, 5, 6] = [1, 2, 3, 4, 5, 6]   ← concatenation, not math

=== NumPy array: vector addition ===
[1 2 3] + [4 5 6] = [5 7 9]                   ← element-wise, correct

=== Speed comparison: add 1,000,000 numbers ===
Python loop:  312.4 ms
NumPy:          1.2 ms
NumPy is 260x faster

=== Array properties ===
shape: (3,)    dtype: float64    ndim: 1

=== Slicing ===
First two elements:  [1. 2.]
Every other element: [1. 3. 5.]
```

---

## Concept: Why Python Lists Break for Mathematics

**What it is:** A Python list is a general-purpose container that stores references to objects of any type, anywhere in memory. A NumPy array is a contiguous block of memory holding values of a single fixed type.

**The problem — Python list arithmetic:**

```python
a = [1, 2, 3]
b = [4, 5, 6]

a + b        # → [1, 2, 3, 4, 5, 6]  concatenation — not what you want
a * 2        # → [1, 2, 3, 1, 2, 3]  repetition — not what you want

# To add element-wise you need a loop:
result = [a[i] + b[i] for i in range(len(a))]   # correct but verbose
```

This is not Python being wrong. Lists were never designed for math. The `+` operator on lists has a clear meaning (concatenation). The problem is using the wrong data structure.

**The deeper problem — speed:**
Each element of a Python list is a full Python object with a type tag, reference count, and value. Adding two lists means: unbox each element from its Python wrapper, add the numbers, box the result back. For 1,000,000 elements, that is 1,000,000 unbox-add-box cycles in Python's interpreter.

NumPy stores raw numbers directly in contiguous memory — no wrappers, no type checking per element. Adding two arrays calls a compiled C loop that processes all 1,000,000 numbers in microseconds.

**Canonical example:**
A Python list is like a filing cabinet where each drawer holds a labeled envelope that contains the number. To add two filing cabinets, you open 1,000,000 envelopes, extract the numbers, add them, seal 1,000,000 new envelopes. A NumPy array is like two calculators' memory registers laid side by side. The CPU adds them directly, no envelopes.

**Why it matters here:** Every matrix, vector, and dataset in this course is a NumPy array. Understanding what it is — contiguous, typed, C-speed — explains why NumPy operations look the way they do.

**Watch for:** NumPy arrays are homogeneous — every element must be the same type. If you create `np.array([1, 2, "three"])`, NumPy converts everything to strings. No error, but your math breaks silently. Always check `.dtype`.

---

## Step 1 — Create `lab01.py` and Compare Lists vs Arrays

Create `lab01.py`:

```python
import numpy as np        # np is the universal convention for NumPy
import time               # for measuring execution speed

# ── Python list arithmetic ─────────────────────────────────────────────────

list_a = [1, 2, 3]
list_b = [4, 5, 6]

print("=== Python list: vector addition ===")
print(f"list_a + list_b = {list_a + list_b}")
# + on lists means concatenation — this is NOT mathematical addition
print()

# ── NumPy array arithmetic ─────────────────────────────────────────────────

arr_a = np.array([1, 2, 3])   # np.array() converts a list to a NumPy array
arr_b = np.array([4, 5, 6])

print("=== NumPy array: vector addition ===")
print(f"arr_a + arr_b = {arr_a + arr_b}")
# + on NumPy arrays means element-wise addition — this IS vector addition
print()

# ── Speed comparison ────────────────────────────────────────────────────────

SIZE = 1_000_000   # one million elements — underscore is a Python readability convention

# Python loop approach
python_list = list(range(SIZE))


start = time.perf_counter()                            # high-resolution timer
python_result = [x * 2 for x in python_list]          # list comprehension: doubles each element
python_time = (time.perf_counter() - start) * 1000    # convert seconds to milliseconds

# NumPy approach
numpy_array = np.arange(SIZE)   # like range() but returns a NumPy array

start = time.perf_counter()
numpy_result = numpy_array * 2   # vectorized: doubles every element in one expression
numpy_time = (time.perf_counter() - start) * 1000

print("=== Speed comparison: double 1,000,000 numbers ===")
print(f"Python loop:  {python_time:.1f} ms")
print(f"NumPy:          {numpy_time:.1f} ms")
print(f"NumPy is {python_time / numpy_time:.0f}x faster")
print()
```

### SAVE AND TRY

Run: `python lab01.py`

**You should see:**
- `list_a + list_b` gives 6 elements — concatenation, not math
- `arr_a + arr_b` gives `[5 7 9]` — element-wise addition
- NumPy is faster — typically **10x–50x for integer arrays**, **100x–400x for float arrays**.
  The benchmark here uses integers (`np.arange` defaults to int64), so 15x–30x is normal.
  If you see ~19x, that is correct. The gap widens with floats because Python's float
  boxing/unboxing costs more than integer boxing.

**In the terminal:**
```bash
python -c "import numpy; print(numpy.__version__)"
```
Expected: a version string like `1.26.0`. If you get `ModuleNotFoundError`, run `pip install numpy` first.

**Change something:** Change `numpy_array * 2` to `numpy_array ** 2`. Save and run — now it squares every element instead of doubling. `**` is Python's exponent operator. Change it back to `* 2`.

---

time.perf_counter() returns the current value of a high-resolution timer as a float in seconds. It measures elapsed wall-clock time with the highest precision the OS provides — typically nanosecond resolution on modern hardware.


import time

start = time.perf_counter()
# ... do something ...
end = time.perf_counter()

elapsed = end - start   # seconds as a float, e.g. 0.000312849
The key point — it measures a duration, not a clock time. The number it returns on its own means nothing (it might be 123456.789 seconds since some arbitrary reference point). Only the difference between two calls is meaningful.

Why use it instead of time.time()?

time.time() returns the system clock in seconds since 1970. The OS can adjust this clock (NTP sync, daylight saving, manual change) mid-measurement, making your elapsed time wrong. perf_counter() uses a hardware counter that never jumps backward and is never adjusted. It is the right choice for benchmarking.


# What LAB-01 uses it for:
start = time.perf_counter()
result = [x * 2 for x in python_list]          # Python loop
python_time = (time.perf_counter() - start) * 1000   # convert to ms

start = time.perf_counter()
result = numpy_array * 2                        # NumPy vectorized
numpy_time = (time.perf_counter() - start) * 1000
The * 1000 converts from seconds to milliseconds so the numbers are easier to read (1.2 ms rather than 0.0012 s).

When to use timeit instead:
For serious benchmarking, timeit.timeit() runs the code thousands of times and averages the result, which removes noise from OS scheduling. perf_counter is fine for illustrating the difference between Python loops and NumPy — the gap is so large that noise doesn't matter.

## Concept: Array Properties — shape, dtype, ndim

**What it is:** Every NumPy array has three fundamental properties that describe its structure:
- `shape` — the dimensions, as a tuple
- `dtype` — the data type of every element
- `ndim` — the number of dimensions

**Why shape matters:**
```
shape (3,)       →  a 1D array of 3 elements         — a vector
shape (3, 4)     →  a 2D array of 3 rows, 4 columns  — a matrix
shape (2, 3, 4)  →  a 3D array                       — a cube of numbers
```

The shape tells you what mathematical object you are working with. A vector has one dimension. A matrix has two. A batch of matrices has three.

**Why dtype matters:**
```
dtype float64   →  64-bit floating point — standard for most math
dtype int32     →  32-bit integer — when you need whole numbers
dtype bool      →  True/False — for masks and conditions
dtype complex128 →  complex numbers — for signal processing and quantum
```

NumPy chooses a dtype automatically, but you can specify it. `np.array([1, 2, 3], dtype=float)` makes floats even though the input is integers.

**Canonical example:** A spreadsheet has rows and columns — that is `shape (rows, columns)`. Each cell holds one number — that is `dtype`. The number of dimensions (rows and columns = 2) is `ndim`. A single column of data is `shape (rows,)`, `ndim=1`.

**Why it matters here:** When you multiply two matrices, the shapes must be compatible. When you add a vector to a matrix, the shapes determine how NumPy broadcasts. `shape` is the first thing you check when a math operation produces an unexpected result.

---

## Step 2 — Explore Array Properties

Add to `lab01.py`:

```python
# ── Array properties ──────────────────────────────────────────────────────────

vector = np.array([1.0, 2.0, 3.0])   # ← add this block
# 1.0 instead of 1 — tells NumPy we want float64, not int64
# Float is the default for math; integers can cause division surprises

matrix = np.array([
    [1, 2, 3],
    [4, 5, 6]
])
# A 2D array: 2 rows, 3 columns

print("=== Array properties ===")
print(f"vector:  shape={vector.shape}  dtype={vector.dtype}  ndim={vector.ndim}")
print(f"matrix:  shape={matrix.shape}  dtype={matrix.dtype}  ndim={matrix.ndim}")
print()

# ── Creating arrays without typing every number ───────────────────────────────

zeros    = np.zeros((3, 3))           # 3×3 matrix of all zeros — the zero matrix
ones     = np.ones((2, 4))            # 2×4 matrix of all ones
identity = np.eye(3)                  # 3×3 identity matrix — ones on the diagonal
linspace = np.linspace(0, 1, 5)       # 5 evenly spaced values from 0 to 1 inclusive
arange   = np.arange(0, 10, 2)        # like range(0, 10, 2) but returns an array

print("=== Constructing arrays ===")
print(f"np.zeros((3,3)):\n{zeros}\n")
print(f"np.eye(3):\n{identity}\n")
print(f"np.linspace(0, 1, 5): {linspace}")
print(f"np.arange(0, 10, 2):  {arange}")
print()
```

### SAVE AND TRY

Run: `python lab01.py`

**You should see** the properties and constructed arrays. Note `np.eye(3)` — this is the identity matrix from your linear algebra class. Multiplying any matrix by the identity gives back the original matrix. NumPy named it `eye` because it represents the letter I (the standard notation for identity matrices).

**In the terminal — check dtype coercion:**
```python
python -c "import numpy as np; a = np.array([1, 2, 'three']); print(a, a.dtype)"
```
Expected: `['1' '2' 'three'] <U21` — NumPy converted everything to Unicode strings. The integers became strings. This is the silent type coercion warning from above.

**Change something:** Change `np.zeros((3, 3))` to `np.zeros((3, 3), dtype=int)`. The output changes from `0.` (float) to `0` (int). Change it back to the default (remove `dtype=int`).

---

## Concept: Vectorized Operations

**What it is:** A vectorized operation applies a mathematical function to every element of an array simultaneously, in compiled C code, without a Python loop.

**The mechanism:**
When you write `arr * 2`, NumPy does not call your Python code once per element. It calls a C function that loops over the raw memory block at CPU speed. The Python interpreter runs once to trigger the operation. The C code runs once per element — but C loops are roughly 100x faster than Python loops.

**The pattern:**
```python
# Python thinking — write a loop:
result = []
for x in data:
    result.append(x ** 2 + 2 * x + 1)

# NumPy thinking — operate on the whole array:
result = data ** 2 + 2 * data + 1
```

The NumPy version looks exactly like the mathematical expression. `data ** 2 + 2 * data + 1` computes `x² + 2x + 1` for every element simultaneously.

**Python idiom — avoid loops on arrays:**
Any time you find yourself writing `for x in numpy_array`, ask: can this be written as a vectorized expression? NumPy operations (arithmetic, comparison, math functions like `np.sin`, `np.sqrt`) all work element-wise. Loops on large arrays are almost always unnecessary and always slower.

**Canonical example:** Evaluating a polynomial at 1000 points. The loop version visits each point one at a time. The vectorized version passes all 1000 points to one C function call.

**Watch for:** `np.dot(a, b)` is NOT element-wise. It is the dot product (a specific mathematical operation). `a * b` IS element-wise multiplication. These are different operations. The `@` operator (Python 3.5+) is matrix multiply: `A @ B`.

---

## Step 3 — Vectorized Math

Add to `lab01.py`:

```python
# ── Vectorized operations ──────────────────────────────────────────────────────

x = np.linspace(0, 2 * np.pi, 6)    # ← add this block
# np.pi is π (3.14159...)
# 6 evenly spaced values from 0 to 2π — one full rotation in radians

print("=== Vectorized math ===")
print(f"x:       {x.round(2)}")             # .round(2) rounds to 2 decimal places for display
print(f"sin(x):  {np.sin(x).round(2)}")     # sine of every element — no loop
print(f"x²:      {(x**2).round(2)}")        # square every element — no loop
print()

# Polynomial: evaluate f(x) = x² + 2x + 1 at every point in x
# This is (x+1)² — you can verify the values
fx = x**2 + 2*x + 1
print(f"f(x) = x² + 2x + 1:")
for xi, fxi in zip(x, fx):              # zip() pairs elements from two iterables
    print(f"  f({xi:.2f}) = {fxi:.2f}")  # :.2f means format as float with 2 decimal places
print()

# ── Indexing and slicing ────────────────────────────────────────────────────────

data = np.array([10.0, 20.0, 30.0, 40.0, 50.0, 60.0])

print("=== Slicing ===")
print(f"data:               {data}")
print(f"data[0]:            {data[0]}")        # first element
print(f"data[-1]:           {data[-1]}")       # last element (-1 = count from end)
print(f"data[1:4]:          {data[1:4]}")      # elements at index 1, 2, 3 (4 not included)
print(f"data[::2]:          {data[::2]}")      # every other element (step=2)
print(f"data > 30:          {data > 30}")      # boolean mask — True where condition holds
print(f"data[data > 30]:    {data[data > 30]}") # boolean indexing — keeps only True elements
```

### SAVE AND TRY

Run: `python lab01.py`

**You should see** the vectorized math results. Note `np.sin(x)` — sine of every element in one call, no loop. The values at 0 and 2π should be 0 (or very close — floating point rounding).

`data[data > 30]` is **boolean indexing** — a NumPy-specific pattern. `data > 30` creates a boolean array `[False, False, False, True, True, True]`. Using that as an index keeps only the elements where it is `True`. You will use this constantly in data analysis.

**In the terminal:**
```python
python -c "import numpy as np; a = np.array([1,2,3,4,5]); print(a[a % 2 == 0])"
```
Expected: `[2 4]` — only the even numbers. `%` is modulo (remainder), `== 0` checks divisibility.

**Change something:** Change `np.linspace(0, 2 * np.pi, 6)` to `np.linspace(0, np.pi, 6)`. Now x covers half a rotation. The sine values change. Change it back.

---

## 🏗️ Challenge: Normalize a Vector

**Concept tested:** NumPy array operations, vectorized math, the mathematical concept of vector normalization

**What you're building:**
A function `normalize(v)` that takes a NumPy array representing a vector and returns a new array — the same direction, but with magnitude 1 (a unit vector).

**The math:**
A vector's magnitude is the square root of the sum of its squared components:

```
|v| = √(v₁² + v₂² + v₃²)
```

A normalized vector is the original divided by its magnitude:

```
v̂ = v / |v|
```

After normalization, `|v̂|` must equal 1.0.

**Requirements:**
- [ ] `normalize([3, 4])` returns `[0.6, 0.8]` (verify: √(0.6²+0.8²) = √(0.36+0.64) = √1 = 1)
- [ ] Works for vectors of any length (2D, 3D, 100D)
- [ ] Uses NumPy operations only — no Python loops
- [ ] After normalization, `np.linalg.norm(result)` returns `1.0`

**Starter code:**

```python
import numpy as np

def normalize(v):
    v = np.array(v, dtype=float)   # ensure float — integer division would truncate
    # TODO: compute the magnitude (hint: np.sqrt and np.sum, or look up np.linalg.norm)
    # TODO: return v divided by its magnitude
    pass

# Test cases
print(normalize([3, 4]))          # expected: [0.6, 0.8]
print(normalize([1, 0, 0]))       # expected: [1. 0. 0.]  (already normalized)
print(normalize([1, 1, 1]))       # expected: [0.577, 0.577, 0.577] (≈ 1/√3)

# Verify: the magnitude of a normalized vector must be 1.0
v = [5, 12, -3, 7]
normalized = normalize(v)
print(f"Magnitude after normalization: {np.linalg.norm(normalized):.6f}")  # should be 1.000000
```

**When you're done:** All four print statements show the expected values. The magnitude check prints exactly `1.000000`.

**Stuck?** Ask AI: "In NumPy, how do I compute the Euclidean magnitude (L2 norm) of a vector using np.sqrt and np.sum, and how is this different from np.linalg.norm?"

---

## Final Check

| What to check | How to verify |
|---|---|
| `list + list` = concatenation | Output shows 6 elements, not element-wise addition |
| `array + array` = element-wise | `[1,2,3] + [4,5,6]` gives `[5,7,9]` |
| NumPy is >100x faster | Speed comparison shows large ratio |
| `vector.shape` prints `(3,)` | Shape of a 1D array of 3 elements |
| `matrix.shape` prints `(2, 3)` | 2 rows, 3 columns |
| `np.eye(3)` shows 1s on diagonal | Identity matrix printed correctly |
| `np.sin(x)` evaluates without a loop | Sine of all elements in one expression |
| Boolean indexing works | `data[data > 30]` returns only elements above 30 |

---

## Quick Check Answers

**1. What does `a + b` produce for two Python lists?**
Concatenation: `[1, 2, 3, 4, 5, 6]`. Python's `+` operator on lists means "join them end to end." This is the correct behavior for lists — they are general containers, not math objects. To add lists element-wise in plain Python you need a loop or a list comprehension. NumPy arrays override `+` to mean element-wise addition because that is what mathematical vectors require.

**2. Why is mixing types a problem for math?**
Because arithmetic between incompatible types either fails or produces surprising results. `"hello" + 3` raises a `TypeError`. `True + 2` gives `3` (True is treated as 1 in Python arithmetic). NumPy solves this by enforcing a single dtype — every element is the same type, so every operation is well-defined. If you create an array with mixed types, NumPy picks one type that can represent all of them (usually string), and your math silently breaks.

**3. How much faster is NumPy vs a Python loop?**
Typically 100x–500x for simple arithmetic on large arrays. The reason is not a clever algorithm — both approaches do the same math. The difference is where the loop runs: Python's interpreter (slow, interpreted, type-checked per step) vs compiled C code (fast, direct memory access, no type overhead). NumPy's vectorized operations eliminate Python's overhead almost entirely for the per-element work.
