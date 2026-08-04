# Lesson 11 — Linear Algebra, Round Two: Transpose and Why Backprop Needs It

**Track:** RL/Keras Mastery Arc — Week 5 (closing lesson)
**Depth:** Spaced repetition — same foundation as Lesson 1, deliberately revisited with one new operation and harder problems
**Goal by end of lesson:** You understand the matrix transpose cold, can explain precisely why backpropagation through a `Dense` layer requires `weight_matrix.T`, and can solve harder versions of Lesson 1's original problems without needing to re-read that lesson first.

---

## 0. Why revisit this now, deliberately

You learned vectors, matrices, and matrix multiplication in Lesson 1, weeks ago at this point. If some of it has quietly faded, that's normal and expected — it's also exactly why this lesson exists. Spaced repetition (revisiting material after a gap, not immediately after first learning it) is one of the most well-established tools for actually retaining material long-term, rather than just recognizing it for a week. This lesson deliberately reuses Lesson 1's exact numbers in the warm-up, then pushes into genuinely new territory.

### 0.1 Warm-up — before reading further, from memory

Try these without looking back at Lesson 1:
- What does `.shape` return for a matrix, and in what order (rows or columns first)?
- For `A × B` to be valid, what has to be true about their shapes?
- Compute `[1, 2, 3] · [4, 5, 6]` in your head or on paper.

If any of these felt shaky, that's useful information — it tells you Section 1 below is worth reading slowly rather than skimming. If they were easy, you'll move through Section 1 quickly and spend your real time in Section 2 (the new material).

---

## 1. Quick reconstruction of Lesson 1 (not a full re-teach — just enough to reload context)

- A **vector** is an ordered list of numbers; a **matrix** is a grid of numbers, `rows × columns`.
- **Matrix multiplication** `A × B`: inner dimensions must match (`A`'s columns = `B`'s rows); each output entry is a dot product of a row from `A` and a column from `B`.
- A neural network layer computes `inputs @ weight_matrix + bias_vector` — this *is* matrix multiplication, at scale.

If any of this is still unclear rather than just "a little rusty," it's worth actually re-reading Lesson 1 in full before continuing — this lesson builds on it rather than re-explaining it from scratch.

---

## 2. The transpose — a new operation

The **transpose** of a matrix, written `Aᵀ` (or `A.T` in NumPy), flips it over its diagonal: rows become columns, and columns become rows.

```
A =            Aᵀ =
[1, 2, 3]      [1, 4]
[4, 5, 6]      [2, 5]
               [3, 6]
```

If `A` has shape `(2, 3)`, `Aᵀ` has shape `(3, 2)` — the shape's dimensions swap. Notice: the *values* don't change, only their arrangement. `A[0][2]` (the value `3`) becomes `Aᵀ[2][0]` — same value, swapped position.

```python
import numpy as np

A = np.array([
    [1, 2, 3],
    [4, 5, 6]
])
print(A.shape)      # (2, 3)
print(A.T)
# [[1 4]
#  [2 5]
#  [3 6]]
print(A.T.shape)     # (3, 2)
```

### 2.1 Why the transpose exists — the intuition, before the RL/DL application

The transpose is what you need when you want to "flip the direction" a matrix relates two things. If `weight_matrix` (shape `(4, 16)`) describes how 4 inputs map *forward* onto 16 neuron outputs, then `weight_matrix.T` (shape `(16, 4)`) describes the same relationship *backward* — how something with 16 values maps back onto something with 4 values. That reversal is exactly what you need during backpropagation, covered next.

---

## 3. Why backpropagation needs `weight_matrix.T`

Recall Lesson 10: backpropagation computes gradients by working backward through the network, using the chain rule to pass a gradient signal from the output back toward the input, layer by layer.

Consider a layer with 4 inputs and 16 neurons — forward pass: `layer_output = inputs @ weight_matrix + bias_vector`, where `weight_matrix` has shape `(4, 16)`, `inputs` has shape `(1, 4)` (a batch of one, Lesson 2), and `layer_output` has shape `(1, 16)`.

During the backward pass, you receive a gradient *with respect to this layer's output* — shape `(1, 16)`, since the output had 16 values. But you need to produce a gradient *with respect to this layer's input* — shape `(1, 4)`, to keep passing the signal backward to whatever layer came before this one. You have a `(1, 16)` gradient and need a `(1, 4)` gradient — you need to go from 16-wide back to 4-wide. That's precisely the "flip the direction" role of the transpose from Section 2.1:

```
gradient_wrt_input = gradient_wrt_output @ weight_matrix.T
```

Check the shapes: `gradient_wrt_output` is `(1, 16)`, `weight_matrix.T` is `(16, 4)` — inner dimensions match (`16 = 16`, Lesson 1's matrix multiplication rule), and the result is `(1, 4)` — exactly the shape needed to keep propagating backward into the previous layer. **Without the transpose, this multiplication wouldn't even be shape-valid** — `weight_matrix` itself is `(4, 16)`, and `(1, 16) @ (4, 16)` fails the inner-dimension rule outright (`16 ≠ 4`). The transpose isn't a stylistic choice; it's the only way the shapes work out for gradients to flow backward through a `Dense` layer at all.

This is the direct matrix-level generalization of Lesson 10's `dz/dw = x` — there, with one input and one weight, "propagating backward" was simple scalar multiplication. Here, with a whole matrix of weights, propagating backward requires this transposed matrix multiplication instead — same underlying idea (chain rule, backward through the layer), scaled up from a single number to a full matrix.

---

## 4. `A.T @ A` and why you'll see this pattern

A specific transpose pattern that comes up constantly in ML code (including inside Keras/TensorFlow, hidden from you): multiplying a matrix by its own transpose.

```python
A = np.array([
    [1, 2],
    [3, 4],
    [5, 6]
])
print(A.shape)        # (3, 2)
print((A.T @ A).shape)  # (2, 2) - always square, regardless of A's original shape
```

`A.T @ A` always produces a **square** matrix (same number of rows as columns), regardless of `A`'s original shape — worth noticing, since "why is this suddenly square" is a common point of confusion when this pattern shows up in gradient computations or covariance-style calculations later in more advanced material.

---

## 5. Harder, interleaved problems — reusing Lesson 1's exact numbers

These deliberately reuse matrices from Lesson 1, Section 3.2, but push into new territory the original lesson didn't ask about.

### 5.1
Recall from Lesson 1: `A = [[1, 2], [3, 4]]`, `B = [[5, 6], [7, 8]]`, and you computed `A × B = [[19, 22], [43, 50]]` by hand.

**New question:** compute `Aᵀ × Bᵀ` by hand. Is it equal to `(A × B)ᵀ`? (This is worth actually doing by hand before checking with NumPy — the answer is a genuine, useful linear algebra identity: `(AB)ᵀ = BᵀAᵀ`, note the *order flips* — not `AᵀBᵀ`. Confirming this yourself, and specifically noticing your naive guess was probably wrong, is the point of the exercise.)

### 5.2
Take the 4-input, 16-neuron layer from Section 3. If a gradient arriving at this layer's output has shape `(1, 16)`, and you need to produce a gradient with respect to the layer's *bias* (not the weights) — recall `layer_output = inputs @ weight_matrix + bias_vector` — what shape should `gradient_wrt_bias` have, and does it need a transpose at all? (Hint: think about which term in the forward equation the bias directly corresponds to, and revisit Lesson 10 Section 4's `dz/db = 1` — the matrix-level version of that same idea.)

### 5.3
Using Lesson 1's neural-net-style layer example (Section 3.3 there): `input_state` shape `(4,)`, `weight_matrix` shape `(4, 3)`. If you're told the gradient with respect to this layer's output is `[0.1, -0.2, 0.3]` (shape `(3,)`, reshaped to `(1, 3)` for the batch dimension), compute the shape of `gradient_wrt_input` using the Section 3 formula, and identify exactly which matrix needs transposing to make the multiplication valid.

---

## 6. Complete runnable file

Save as `lesson_11_practice.py` and run with `python lesson_11_practice.py`.

```python
"""
Lesson 11 Practice: The transpose, and why backprop needs it, verified in code.
Run with: python lesson_11_practice.py
"""
import numpy as np


def demonstrate_transpose():
    print("--- Transpose basics (Section 2) ---")
    A = np.array([
        [1, 2, 3],
        [4, 5, 6]
    ])
    print("A shape:", A.shape)
    print("A:\n", A)
    print("A.T shape:", A.T.shape)
    print("A.T:\n", A.T)
    print()


def demonstrate_transpose_product_identity():
    print("--- (AB)^T = B^T A^T, not A^T B^T (Section 5.1) ---")
    A = np.array([[1, 2], [3, 4]])
    B = np.array([[5, 6], [7, 8]])

    AB = A @ B
    AB_transposed = AB.T

    BT_AT = B.T @ A.T
    AT_BT = A.T @ B.T

    print("(A @ B).T:\n", AB_transposed)
    print("B.T @ A.T:\n", BT_AT)
    print("Are they equal?", np.array_equal(AB_transposed, BT_AT))
    print()
    print("A.T @ B.T (the naive guess):\n", AT_BT)
    print("Equal to (A@B).T?", np.array_equal(AB_transposed, AT_BT), "(should be False)")
    print()


def demonstrate_backward_pass_shapes():
    print("--- Backprop through a Dense layer, shapes verified (Section 3) ---")
    batch_size = 1
    num_inputs = 4
    num_neurons = 16

    inputs = np.random.rand(batch_size, num_inputs)
    weight_matrix = np.random.rand(num_inputs, num_neurons)
    bias_vector = np.random.rand(num_neurons)

    layer_output = inputs @ weight_matrix + bias_vector
    print("Forward pass - inputs shape:", inputs.shape,
          "weight_matrix shape:", weight_matrix.shape,
          "-> layer_output shape:", layer_output.shape)

    # Pretend this arrived from the next layer during backprop
    gradient_wrt_output = np.random.rand(batch_size, num_neurons)

    gradient_wrt_input = gradient_wrt_output @ weight_matrix.T
    print("Backward pass - gradient_wrt_output shape:", gradient_wrt_output.shape,
          "weight_matrix.T shape:", weight_matrix.T.shape,
          "-> gradient_wrt_input shape:", gradient_wrt_input.shape)
    print("Matches original inputs shape?", gradient_wrt_input.shape == inputs.shape)
    print()


def demonstrate_square_matrix_pattern():
    print("--- A.T @ A is always square (Section 4) ---")
    A = np.array([
        [1, 2],
        [3, 4],
        [5, 6]
    ])
    result = A.T @ A
    print("A shape:", A.shape)
    print("A.T @ A shape:", result.shape, "(always square, regardless of A's shape)")
    print()


if __name__ == "__main__":
    demonstrate_transpose()
    demonstrate_transpose_product_identity()
    demonstrate_backward_pass_shapes()
    demonstrate_square_matrix_pattern()
```

---

## 7. Answers to check your work against (after attempting Section 5 yourself)

Run the practice file's `demonstrate_transpose_product_identity()` function — it directly verifies Section 5.1's identity in code (`(A@B).T == B.T @ A.T`, and confirms `A.T @ B.T` is generally *not* equal). Don't peek at this until you've attempted the by-hand version — the value is in noticing your own naive-order guess is wrong, not in reading that it's wrong.

For 5.2 and 5.3, use `demonstrate_backward_pass_shapes()` as a template — plug in the specific numbers from each problem and check that your by-hand shape reasoning matches what the code produces.

---

## Week 5 complete

Between Lesson 10 and this lesson, you now have the actual mechanics — chain rule, gradients, and the matrix operations (specifically the transpose) required to propagate them backward through a real `Dense` layer. This is graduate-adjacent territory for a from-scratch understanding, and it's built entirely on Lesson 1 and Lesson 4 material you already had.

## What's next

Week 6 moves back into RL specifically: Double DQN and Dueling DQN (Lesson 12) — two small, well-motivated fixes to vanilla DQN, each addressing one specific weakness you can now understand precisely because of how solid Weeks 3-4's foundations are.
