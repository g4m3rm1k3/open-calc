# Lesson 10 — Calculus & Backpropagation, Derived by Hand

**Track:** RL/Keras Mastery Arc — Week 5 (opener)
**Depth:** Heavy — this is genuinely new material Weeks 1-4 skipped over
**Goal by end of lesson:** You can derive, from the chain rule, exactly how gradients flow backward through a small network — the actual math `model.fit()` runs on every call. By the end, "backpropagation" stops being a word you've heard and becomes an algorithm you could re-derive.

---

## 0. The gap this lesson closes

Every lesson so far has used gradient descent — Lesson 4's `optimizer="adam"`, the from-scratch neuron work before this series even started — without ever deriving *how* the network knows which direction to adjust each weight. This lesson closes that gap. Nothing here changes how you use Keras; everything here changes whether you understand what Keras is doing when you call `.fit()`.

---

## 1. The derivative — the one idea everything else builds on

A derivative tells you: **if I nudge this input slightly, how much does the output change, and in which direction?**

```
derivative of f(x) = the slope of f at point x
```

For `f(x) = x²`, the derivative is `f'(x) = 2x`. At `x = 3`, the slope is `6` — meaning near `x = 3`, increasing `x` by a tiny amount increases `f(x)` by roughly 6 times that amount.

**Why this matters for training:** the "loss" from Lesson 4 (`mse`) is a function of the network's weights. The derivative of the loss *with respect to* a specific weight tells you exactly how to nudge that weight to make the loss go down. That's the entire mechanism gradient descent runs on — nothing more mysterious than "which way is downhill, from here."

```python
# The idea, made concrete with a tiny numerical check
def f(x):
    return x ** 2

def numerical_derivative(f, x, epsilon=1e-6):
    return (f(x + epsilon) - f(x)) / epsilon

print(numerical_derivative(f, 3))   # approx 6.0, matching f'(x) = 2x at x=3
```

---

## 2. The chain rule — derivatives through composed functions

A neural network is a **composition** of functions — the output of one layer feeds into the next. The chain rule tells you how to find the derivative of a composed function:

```
If y = f(g(x)), then dy/dx = f'(g(x)) × g'(x)
```

In words: **the derivative of the whole thing is the product of the derivatives of each piece.**

### 2.1 A concrete worked example

Let `g(x) = x + 2` and `f(g) = g²`. So `y = (x + 2)²`.

- `g'(x) = 1` (the derivative of `x + 2` with respect to `x`)
- `f'(g) = 2g` (the derivative of `g²` with respect to `g`)

By the chain rule: `dy/dx = f'(g(x)) × g'(x) = 2(x+2) × 1 = 2(x+2)`

Check at `x = 1`: `y = (1+2)² = 9`. The chain rule says `dy/dx = 2(1+2) = 6`. Verify numerically:

```python
def y(x):
    return (x + 2) ** 2

print(numerical_derivative(y, 1))   # approx 6.0 - matches the chain rule answer
```

**Why this is THE idea backpropagation runs on:** a neural network is exactly this kind of nested composition — input goes through layer 1's function, then layer 2's function, then the loss function. The chain rule is how you compute "how does the loss change if I nudge a weight buried deep inside layer 1" — you multiply derivatives backward through every function the weight's effect had to pass through to reach the loss.

---

## 3. A minimal one-neuron network, forward pass

Recall from Lesson 1/4: `output = (inputs · weights) + bias`, then an activation. Let's use the simplest possible case — one input, one weight, no activation function yet (added back in Section 6) — so every piece of the chain rule is visible.

```
input:  x = 2
weight: w = 3
bias:   b = 1

z = w * x + b = 3*2 + 1 = 7        (the neuron's raw output)

target: y_true = 10
loss = (z - y_true)²                (squared error, Lesson 4's mse idea for one example)
     = (7 - 10)² = 9
```

**The question backpropagation answers:** how should `w` and `b` change to make this loss smaller?

---

## 4. Backward pass — deriving the gradients by hand

This is a chain: `loss` depends on `z`, and `z` depends on `w` (and `b`, and `x`). By the chain rule:

```
d(loss)/dw = d(loss)/dz × dz/dw
```

**Step 1 — `d(loss)/dz`:** loss is `(z - y_true)²`. Using the power rule (a specific case of the chain rule): `d(loss)/dz = 2 × (z - y_true)`.

```
d(loss)/dz = 2 × (7 - 10) = 2 × (-3) = -6
```

**Step 2 — `dz/dw`:** `z = w*x + b`, so with respect to `w`, this is just `x` (basic differentiation — the derivative of `w*x` with respect to `w` is `x`, since `x` is held constant).

```
dz/dw = x = 2
```

**Step 3 — combine via the chain rule:**

```
d(loss)/dw = d(loss)/dz × dz/dw = -6 × 2 = -12
```

This number, `-12`, is the **gradient** with respect to `w` — it tells you the loss would increase by about 12 units per unit increase in `w`, *right now*, at this specific point. Since we want the loss to go *down*, we move `w` in the *opposite* direction of the gradient:

```
new_w = w - learning_rate × gradient
      = 3 - 0.01 × (-12)
      = 3 + 0.12
      = 3.12
```

That `w - learning_rate × gradient` line is gradient descent's actual update rule — the same rule your from-scratch neuron implemented, and the same rule Keras's `Adam` optimizer runs (with extra refinements) on every one of potentially millions of weights, every training step.

**`d(loss)/db` follows the identical pattern** — `dz/db = 1` (since `z = w*x + b`, the derivative with respect to `b` is just `1`), so `d(loss)/db = d(loss)/dz × 1 = -6`, and `b` updates the same way.

---

## 5. Why it's called "back"-propagation

Notice the order of the calculation: you computed `d(loss)/dz` *first* (closest to the loss), then used it to get `d(loss)/dw` (further back toward the input). For a network with many layers, this pattern continues: you compute the gradient at the output, then use the chain rule to propagate it backward, layer by layer, toward the input — each layer's gradient calculation reuses the gradient computed at the layer just after it. This backward flow of gradients, layer by layer, via repeated chain-rule multiplication, is precisely why the algorithm is named backpropagation. It's not a different algorithm from what you just did by hand in Section 4 — it's that same calculation, repeated once per layer, propagating backward.

---

## 6. Adding the activation function back in

Real neurons apply an activation after `z`. With a sigmoid activation `a = sigmoid(z)`, the chain gets one link longer:

```
loss depends on a
a depends on z
z depends on w
```

```
d(loss)/dw = d(loss)/da × da/dz × dz/dw
```

Each additional layer or function just adds another multiplied term to this chain — this is the entire generalization from "one neuron" to "a 50-layer network." The chain gets longer, but every individual link is the same kind of local derivative you already computed by hand in Section 4.

**Sigmoid's derivative**, for reference, since you'll see it by name: `sigmoid'(z) = sigmoid(z) × (1 - sigmoid(z))` — a convenient property that makes it cheap to compute once you already have `sigmoid(z)` from the forward pass.

---

## 7. Complete runnable file — manual backprop, verified against a numerical check

Save as `lesson_10_practice.py` and run with `python lesson_10_practice.py`. No Keras here — deliberately plain Python and math, so nothing is hidden.

```python
"""
Lesson 10 Practice: Deriving and verifying backpropagation by hand for one neuron.
Run with: python lesson_10_practice.py
"""
import math


def forward_pass(x, w, b):
    z = w * x + b
    return z


def compute_loss(z, y_true):
    return (z - y_true) ** 2


def manual_backward_pass(x, w, b, y_true):
    """Exactly Section 4's by-hand derivation, generalized into code."""
    z = forward_pass(x, w, b)

    d_loss_d_z = 2 * (z - y_true)     # Step 1
    dz_dw = x                          # Step 2
    dz_db = 1

    d_loss_d_w = d_loss_d_z * dz_dw    # Step 3, chain rule
    d_loss_d_b = d_loss_d_z * dz_db

    return d_loss_d_w, d_loss_d_b


def numerical_gradient_check(x, w, b, y_true, epsilon=1e-6):
    """
    An independent check: nudge w (and b) by a tiny amount, see how much the loss
    changes, and divide - this SHOULD closely match the analytical (chain rule) gradient.
    This numerical-check technique is a genuinely standard way to debug backprop code.
    """
    def loss_given_w(w_value):
        return compute_loss(forward_pass(x, w_value, b), y_true)

    def loss_given_b(b_value):
        return compute_loss(forward_pass(x, w, b_value), y_true)

    numerical_d_w = (loss_given_w(w + epsilon) - loss_given_w(w - epsilon)) / (2 * epsilon)
    numerical_d_b = (loss_given_b(b + epsilon) - loss_given_b(b - epsilon)) / (2 * epsilon)

    return numerical_d_w, numerical_d_b


def train_one_neuron(x, y_true, initial_w, initial_b, learning_rate, num_steps):
    w, b = initial_w, initial_b
    for step in range(num_steps):
        z = forward_pass(x, w, b)
        loss = compute_loss(z, y_true)
        d_w, d_b = manual_backward_pass(x, w, b, y_true)

        w = w - learning_rate * d_w    # gradient descent update, Section 4
        b = b - learning_rate * d_b

        if step % 20 == 0 or step == num_steps - 1:
            print(f"Step {step:3d} | z={z:.4f} | loss={loss:.4f} | w={w:.4f} | b={b:.4f}")

    return w, b


if __name__ == "__main__":
    x = 2
    w = 3
    b = 1
    y_true = 10

    print("--- Section 4: one manual backward pass ---")
    d_w, d_b = manual_backward_pass(x, w, b, y_true)
    print(f"Analytical gradients -> d_loss/dw = {d_w}, d_loss/db = {d_b}")

    numerical_d_w, numerical_d_b = numerical_gradient_check(x, w, b, y_true)
    print(f"Numerical check      -> d_loss/dw ≈ {numerical_d_w:.4f}, d_loss/db ≈ {numerical_d_b:.4f}")
    print("(These two rows should closely match - that's your derivation confirmed correct.)\n")

    print("--- Section 4 continued: training this one neuron to reduce loss over time ---")
    final_w, final_b = train_one_neuron(x, y_true, initial_w=3, initial_b=1,
                                          learning_rate=0.01, num_steps=100)
    final_z = forward_pass(x, final_w, final_b)
    print(f"\nFinal output z = {final_z:.4f} (target was {y_true}) - should be much closer than the starting z=7")
```

**What to expect:** the analytical gradient (from your by-hand chain-rule derivation) and the numerical gradient (from directly nudging the weight and measuring the effect) should match closely — this cross-check is exactly how real ML engineers verify a backprop implementation is correct, and it's worth trusting this pattern going forward. The training loop should show `z` converging toward `10` (the target) as `loss` shrinks toward `0` over the 100 steps.

---

## 8. Challenges before Lesson 11

1. By hand, redo Section 4's derivation but with `x = 5, w = 1, b = 0, y_true = 3`. Compute `d(loss)/dw` and `d(loss)/db` on paper, then verify with `manual_backward_pass`.
2. Add a second input to `forward_pass` — i.e., `z = w1*x1 + w2*x2 + b` — and derive `d(loss)/dw1` and `d(loss)/dw2` by hand. (Hint: the chain rule step is identical for each weight; only `dz/dw` changes, to `x1` or `x2` respectively.) Extend the code to match.
3. In `train_one_neuron`, change `learning_rate` from `0.01` to `0.5` and re-run. What happens to the loss curve? Relate this to Lesson 4's discussion of learning rate as a hyperparameter — you're now seeing the exact mechanism (an overshoot in the gradient descent update) that makes a too-large learning rate destabilize training.
4. Work through Section 6's sigmoid chain (`loss` → `a` → `z` → `w`) numerically for one specific set of values of your choosing, computing all three derivative terms and multiplying them together, then confirm against `numerical_gradient_check`-style verification (you'll need to add a `sigmoid` function and adjust `forward_pass`/`compute_loss` accordingly — this is genuinely good practice for extending code you understand rather than code you're copying).

---

## What's next

Lesson 11 stays in Week 5, revisiting Lesson 1's linear algebra — but this time introducing the matrix transpose and explaining precisely why backpropagation, at the matrix level (not just the one-neuron level from this lesson), needs `weight_matrix.T`. It closes with a harder, interleaved problem set reusing Lesson 1's original vectors and matrices in new combinations — the deliberate spaced-repetition lesson of the Mastery Arc.
