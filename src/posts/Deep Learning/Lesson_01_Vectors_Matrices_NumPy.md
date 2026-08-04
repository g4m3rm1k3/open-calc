# Lesson 1 — Vectors, Matrices, and NumPy Foundations

**Track:** RL/Keras Class Prep — Week 1
**Depth:** Full treatment (new material — no prior assumed)
**Goal by end of lesson:** You can explain what a vector and matrix *are* (not just "arrays of numbers"), do the core operations by hand on paper, and read/write NumPy code that does the same thing, understanding *why* NumPy is used instead of plain Python loops.

---

## 0. Why this matters before you touch Keras or Gym

Every neural network you'll build in this class is, underneath the Keras API, a sequence of matrix multiplications. Every state Gym hands you (like CartPole's `[cart position, cart velocity, pole angle, pole angular velocity]`) is a vector. When you call `model.predict(state)`, Keras is running your vector through a chain of matrix multiplications. If matrix multiplication is a black box to you, Keras will always feel like magic instead of a tool. This lesson removes that black box.

---

## 1. Scalars, Vectors, and Matrices — what they actually are

- A **scalar** is just a single number. `5`, `-2.3`, `0`. Nothing new here.
- A **vector** is an ordered list of numbers. Order matters — `[1, 2]` is not the same vector as `[2, 1]`.
  - Think of a vector as **a point in space**, or **an arrow from the origin to that point**. Both views are useful.
  - `[3, 4]` in 2D means "go 3 right, 4 up." That's a point *and* an arrow — same thing, two ways of looking at it.
  - In ML, a vector is usually a **list of features describing one thing**. CartPole's state `[cart_position, cart_velocity, pole_angle, pole_angular_velocity]` is a 4-dimensional vector — a point in 4D space. You can't easily *picture* 4D, but the math works identically to 2D, just with more numbers.
- A **matrix** is a grid of numbers — rows and columns. You can think of a matrix as **a stack of vectors** (each row, or each column, is a vector).
  - A matrix with shape `(3, 4)` has 3 rows and 4 columns — read as "rows × columns," always in that order. This ordering convention trips people up constantly, so say it out loud: **rows first, columns second**.

**Notation you'll see:** lowercase letters for scalars (`x`), lowercase bold or arrow for vectors (`**v**` or `v⃗`), uppercase for matrices (`W`). In code we'll just use descriptive variable names instead of single letters — `state_vector`, not `v`.

---

## 2. Vector operations, by hand first

### 2.1 Addition
Add element-by-element. Vectors must be the same length.

```
[1, 2, 3] + [10, 20, 30] = [11, 22, 33]
```

Geometrically: place the second arrow's tail at the first arrow's tip. The sum is the arrow from the very start to the very end.

### 2.2 Scalar multiplication
Multiply every element by the scalar.

```
3 * [1, 2, 3] = [3, 6, 9]
```

Geometrically: this stretches (or shrinks, or flips if negative) the arrow without changing its direction (unless the scalar is negative, which flips it 180°).

### 2.3 Dot product — the one that actually matters most for neural nets
Multiply corresponding elements, then sum the results. Both vectors must be the same length. The result is a **single scalar**, not a vector.

```
[1, 2, 3] · [4, 5, 6]
= (1*4) + (2*5) + (3*6)
= 4 + 10 + 18
= 32
```

Why do you care? **Every single neuron in a neural network computes a dot product.** A neuron takes its inputs as a vector, has a vector of weights (one weight per input), and its output (before activation) is:

```
output = (inputs · weights) + bias
```

That's it. That's the entire "neuron" computation you built by hand in the earlier neuron-fundamentals lessons — a dot product plus a bias. Everything Keras does at scale is this operation repeated across thousands of neurons, which is exactly why it needs matrices (a neuron is a dot product; a whole *layer* of neurons is a matrix multiplication, covered next).

---

## 3. Matrix multiplication — the operation that runs every neural net

This is the one concept worth slowing down for, because the mechanics are easy to fumble and the intuition is everything.

### 3.1 The rule
To multiply matrix `A` (shape `m × n`) by matrix `B` (shape `n × p`):
- **The inner dimensions must match** (`A`'s columns = `B`'s rows). If they don't match, the multiplication is undefined — not "wrong," but literally not a valid operation.
- The result has shape `m × p` (outer dimensions).
- Each entry in the result is the **dot product of a row from A and a column from B**.

### 3.2 Worked example, fully by hand

```
A = [1, 2]        B = [5, 6]
    [3, 4]            [7, 8]
```

Both are 2×2, so inner dimensions match (2 = 2), result is 2×2.

- Result[0][0] = (row 0 of A) · (column 0 of B) = [1,2]·[5,7] = 1*5 + 2*7 = 5 + 14 = 19
- Result[0][1] = (row 0 of A) · (column 1 of B) = [1,2]·[6,8] = 1*6 + 2*8 = 6 + 16 = 22
- Result[1][0] = (row 1 of A) · (column 0 of B) = [3,4]·[5,7] = 3*5 + 4*7 = 15 + 28 = 43
- Result[1][1] = (row 1 of A) · (column 1 of B) = [3,4]·[6,8] = 3*6 + 4*8 = 18 + 32 = 50

```
A × B = [19, 22]
        [43, 50]
```

**Important, non-obvious fact:** matrix multiplication is **not commutative**. `A × B ≠ B × A` in general (try it — you'll get a different answer, and often the shapes won't even both be valid). This is different from regular number multiplication, where `3 × 5 = 5 × 3`. Order matters, always.

### 3.3 The neural network connection (the actual point of this section)

A single neuron: `output = inputs · weights + bias` (a dot product — one row times one column, essentially).

A **layer** of neurons, all fed the same inputs, is what you get when you stack many weight-vectors into a weight *matrix* and do one matrix multiplication instead of many separate dot products:

```
layer_output = inputs × weight_matrix + bias_vector
```

If `inputs` is a 4-dimensional state vector (like CartPole) and the layer has 16 neurons, `weight_matrix` has shape `(4, 16)` — one column of weights per neuron. The matrix multiplication computes all 16 neurons' outputs **in one operation**. This is *why* `model.summary()` in Keras will show you shapes like `(None, 16)` — that's the matrix math you just did by hand, happening automatically.

---

## 4. Why NumPy exists (and why plain Python loops won't cut it)

You *could* write vector/matrix operations with nested Python `for` loops. Let's see why nobody does this for real ML work.

```python
# Pure Python dot product - works, but slow at scale
def dot_product_pure_python(vector_a, vector_b):
    total = 0
    for i in range(len(vector_a)):
        total += vector_a[i] * vector_b[i]
    return total

print(dot_product_pure_python([1, 2, 3], [4, 5, 6]))  # 32
```

This works fine for 3 numbers. But a real neural network layer might involve a matrix multiplication between a `(1, 128)` input and a `(128, 256)` weight matrix — that's 128 × 256 = 32,768 individual multiplications, for *one* layer, for *one* forward pass. Python's `for` loops are interpreted one instruction at a time and are slow for this. NumPy solves this by pushing the loop down into pre-compiled C code and using **vectorization** — operating on entire arrays at once instead of element-by-element in Python.

```python
import numpy as np

vector_a = np.array([1, 2, 3])
vector_b = np.array([4, 5, 6])

dot_result = np.dot(vector_a, vector_b)
print(dot_result)  # 32 - same answer, dramatically faster at scale
```

---

## 5. NumPy fundamentals, from zero

### 5.1 Creating arrays

```python
import numpy as np

# From a Python list
state_vector = np.array([0.1, -0.5, 0.02, 0.3])
print(state_vector)
print(type(state_vector))   # numpy.ndarray - NumPy's core data type

# A matrix - a list of lists becomes a 2D array
weight_matrix = np.array([
    [0.1, 0.2, 0.3],
    [0.4, 0.5, 0.6]
])
print(weight_matrix)
```

### 5.2 Shape — the property you will check constantly

```python
print(state_vector.shape)   # (4,)   - a 1D array with 4 elements
print(weight_matrix.shape)  # (2, 3) - 2 rows, 3 columns
```

Reading `.shape` before and after every operation is the single most useful debugging habit in NumPy/Keras work. Almost every confusing error you'll hit later ("shapes not aligned," "incompatible dimensions") is solved by printing `.shape` and re-checking the matrix multiplication rule from Section 3.1.

### 5.3 Indexing and slicing

```python
matrix = np.array([
    [1, 2, 3],
    [4, 5, 6],
    [7, 8, 9]
])

print(matrix[0])       # [1 2 3]  - first row
print(matrix[0, 0])    # 1        - row 0, column 0
print(matrix[:, 0])    # [1 4 7]  - the ':' means "all rows"; this grabs column 0
print(matrix[1, :])    # [4 5 6]  - all columns of row 1 (same as matrix[1])
```

### 5.4 Element-wise operations (no loop needed)

```python
prices = np.array([10, 20, 30])
discounted_prices = prices * 0.9   # every element multiplied by 0.9, no loop
print(discounted_prices)            # [9. 18. 27.]

a = np.array([1, 2, 3])
b = np.array([10, 20, 30])
print(a + b)   # [11 22 33] - same as our by-hand vector addition in Section 2.1
```

### 5.5 The dot product and matrix multiplication in NumPy

```python
vector_a = np.array([1, 2, 3])
vector_b = np.array([4, 5, 6])
print(np.dot(vector_a, vector_b))   # 32 - matches Section 2.3 by hand

A = np.array([[1, 2], [3, 4]])
B = np.array([[5, 6], [7, 8]])

print(np.dot(A, B))
# [[19 22]
#  [43 50]]  - matches Section 3.2 by hand, exactly

# The '@' operator is shorthand for matrix multiplication - you'll see this a lot
print(A @ B)   # identical result to np.dot(A, B)
```

### 5.6 Broadcasting — NumPy's shape-stretching rule

Broadcasting lets NumPy apply an operation between arrays of *different* shapes by automatically "stretching" the smaller one, when the shapes are compatible.

```python
matrix = np.array([
    [1, 2, 3],
    [4, 5, 6]
])
bias_vector = np.array([10, 20, 30])

print(matrix + bias_vector)
# [[11 22 33]
#  [14 25 36]]
# bias_vector (shape (3,)) got added to EACH row of matrix (shape (2,3))
```

This is exactly `layer_output = inputs × weight_matrix + bias_vector` from Section 3.3 — the `+ bias_vector` step relies on broadcasting to add one bias vector across every row of results. Keras does this invisibly every time a layer processes a batch of inputs instead of just one.

---

## 6. Put it together — one complete runnable file

Save this as `lesson_01_practice.py` and run it with `python lesson_01_practice.py`. Nothing here should be mysterious — every function mirrors a section above.

```python
"""
Lesson 1 Practice: Vectors, Matrices, and NumPy Foundations
Run with: python lesson_01_practice.py
"""
import numpy as np


def dot_product_pure_python(vector_a, vector_b):
    """The by-hand version, for comparison. See Section 2.3 / 4."""
    total = 0
    for i in range(len(vector_a)):
        total += vector_a[i] * vector_b[i]
    return total


def demonstrate_vector_operations():
    print("--- Vector Operations (Section 2) ---")
    vector_one = np.array([1, 2, 3])
    vector_two = np.array([10, 20, 30])

    print("Addition:", vector_one + vector_two)
    print("Scalar multiplication (x3):", 3 * vector_one)
    print("Dot product (pure Python):", dot_product_pure_python(vector_one, vector_two))
    print("Dot product (NumPy):", np.dot(vector_one, vector_two))
    print()


def demonstrate_matrix_multiplication():
    print("--- Matrix Multiplication (Section 3) ---")
    matrix_a = np.array([[1, 2], [3, 4]])
    matrix_b = np.array([[5, 6], [7, 8]])

    print("Matrix A shape:", matrix_a.shape)
    print("Matrix B shape:", matrix_b.shape)
    print("A x B:\n", matrix_a @ matrix_b)
    print()


def demonstrate_neural_net_style_layer():
    print("--- One Neural Network Layer, By Hand With NumPy (Section 3.3) ---")
    # Pretend this is a 4-value CartPole-style state
    input_state = np.array([0.1, -0.2, 0.05, 0.3])

    # A layer of 3 neurons, each with 4 weights (one per input) -> shape (4, 3)
    weight_matrix = np.array([
        [0.2, 0.1, -0.3],
        [0.4, -0.5, 0.2],
        [0.1, 0.3, 0.1],
        [-0.2, 0.2, 0.4]
    ])
    bias_vector = np.array([0.01, -0.02, 0.03])

    layer_output = input_state @ weight_matrix + bias_vector
    print("Input state shape:", input_state.shape)
    print("Weight matrix shape:", weight_matrix.shape)
    print("Layer output (3 neurons' raw outputs):", layer_output)
    print()


def demonstrate_broadcasting():
    print("--- Broadcasting (Section 5.6) ---")
    batch_of_states = np.array([
        [0.1, 0.2, 0.3],
        [0.4, 0.5, 0.6]
    ])
    bias_vector = np.array([10, 20, 30])
    print("Batch + bias (broadcast across every row):\n", batch_of_states + bias_vector)
    print()


if __name__ == "__main__":
    demonstrate_vector_operations()
    demonstrate_matrix_multiplication()
    demonstrate_neural_net_style_layer()
    demonstrate_broadcasting()
```

**Expected behavior when you run it:** four labeled sections print to your terminal. Nothing should error. If you change a shape (e.g., make `weight_matrix` `(3, 3)` instead of `(4, 3)`) and re-run, you'll get a real `ValueError` about shapes not aligning — that's a good exercise, do it on purpose once so you recognize the error message later in Keras.

---

## 7. Challenges before moving to Lesson 2

Do these by hand first, then check with NumPy — the by-hand step is what builds the intuition Keras will later hide from you.

1. By hand: compute `[2, -1, 4] · [1, 3, -2]`. Then verify with `np.dot`.
2. By hand: multiply matrix `[[2, 0], [1, 3]]` by matrix `[[1, 2], [3, 4]]`. Then verify with `A @ B`.
3. Why is `A @ B` not always equal to `B @ A`? Try swapping the matrices from Challenge 2 and see what happens (try it even where shapes are technically valid both ways).
4. Modify `demonstrate_neural_net_style_layer()` so the layer has 5 neurons instead of 3. What shape does `weight_matrix` need to be now? What shape does `bias_vector` need to be? Get it running without errors.

---

## What's next

Lesson 2 stays in Week 1: more NumPy (reshaping, `argmax` — which you'll use constantly for picking the best action in RL — and basic stats functions), then a short bridge into why these shapes are exactly what Gym's `observation_space` and `action_space` will hand you.
