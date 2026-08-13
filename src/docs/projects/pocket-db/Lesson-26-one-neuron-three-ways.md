# Lesson 26: One Neuron, Three Ways

**What you will build** — the same real, small learning problem —
predicting whether a student passes from how many hours they studied —
solved three real, honest ways, on real data this project's own engine
actually stored: `scikit-learn`'s own `LogisticRegression`; a real,
hand-built single neuron (`sigmoid`, gradient descent, no libraries at
all); and a real `Keras` `Sequential` model. All three learn the
identical real relationship; comparing them side by side is the entire
real point.

**What you need to know first:** Lesson 25 (real, stored data pulled
through `query()`), basic algebra (a weighted sum, a real derivative
isn't required to *use* this lesson's own gradient formula, only to
verify it, which this lesson does directly).

**Terms introduced in this lesson:** **sigmoid function** — a real,
standard function squashing any real number into the real range `(0,
1)`, used to turn a raw, unbounded weighted sum into something
interpretable as a real probability. **Gradient descent** — a real,
iterative method for finding weights that minimize a real error: at
each real step, move each weight a small amount in the real direction
that reduces error fastest, repeat.

**Objects and methods used**
- **`sklearn.linear_model.LogisticRegression`**
  - *What it is:* `scikit-learn`'s own real, professional
    implementation of the identical real model this lesson hand-builds
    — a single-neuron, sigmoid-based classifier — using a real,
    sophisticated optimizer (not plain gradient descent) under the
    hood.
  - *Implementation:* `model.fit(X, y)` trains it; `model.score(X, y)`
    returns real accuracy; `model.coef_`/`model.intercept_` expose the
    real, learned weight and bias directly.
  - *Its use:* this lesson's own real, first, professional-tool
    comparison point.
- **`keras.Sequential` / `keras.layers.Dense`**
  - *What they are:* `Keras`'s own real way of describing a neural
    network as a real, ordered stack of layers; `Dense(1,
    activation="sigmoid")` is a real, single layer containing exactly
    one real neuron — the identical real shape as this lesson's own
    hand-built one.
  - *Implementation:* `keras_model.compile(optimizer="sgd", loss=
    "binary_crossentropy", ...)`, then `keras_model.fit(X, y, epochs=
    200)` — real, standard training.
  - *Its use:* this lesson's own real, second, professional-tool
    comparison point — the actual, real subject
    `README.md`'s own S12 row names (*Deep Learning with Keras*).

---

## Concept Unit: One Neuron, One Real Step, By Hand

### The Problem

A single neuron's own real prediction is `sigmoid(weight * x + bias)`
— a real number between `0` and `1`, interpreted as "how likely is
`passed = 1`." Training means adjusting `weight`/`bias` so real
predictions get closer to real, actual outcomes. Before trusting any
library to do this, this lesson hand-derives exactly one real step.

### Introduce the Concept in Isolation

Save this as `sigmoid_check.py`:

```python
import math

def sigmoid(z):
    return 1 / (1 + math.exp(-z))

x = 8.0
y = 1.0
weight = 0.0
bias = 0.0
learning_rate = 0.01

z = weight * x + bias
prediction = sigmoid(z)
print(f"prediction before any training: {prediction}")

error = prediction - y
print(f"error (prediction - actual): {error}")

gradient_weight = error * x
gradient_bias = error
print(f"gradient w.r.t. weight: {gradient_weight}")
print(f"gradient w.r.t. bias: {gradient_bias}")

weight = weight - learning_rate * gradient_weight
bias = bias - learning_rate * gradient_bias
print(f"weight after one step: {weight}")
print(f"bias after one step: {bias}")

z2 = weight * x + bias
prediction2 = sigmoid(z2)
print(f"prediction after one step: {prediction2}")
```

Run with:

```bash
python sigmoid_check.py
```

Real output:

```text
prediction before any training: 0.5
error (prediction - actual): -0.5
gradient w.r.t. weight: -4.0
gradient w.r.t. bias: -0.5
weight after one step: 0.04
bias after one step: 0.005
prediction after one step: 0.5805423048206596
```

*What this proves:* starting from `weight = 0`, `bias = 0`, the real
model's own first, uninformed prediction is exactly `0.5` — real,
maximum uncertainty, since `sigmoid(0) = 0.5` always. One real
gradient-descent step, computed from a single real example (`8` hours
studied, really passed), moves the real prediction from `0.5` to
`~0.58` — genuinely, correctly closer to the real, actual answer
(`1.0`), using nothing but the real formula every neuron in this
lesson ultimately runs.

### Discard the Throwaway Example

```bash
rm sigmoid_check.py
```

### Mechanical Walkthrough

- `sigmoid(z) = 1 / (1 + math.exp(-z))` — covered fully in Objects and
  methods used, above (Terms) — a large positive `z` pushes the real
  result toward `1`; a large negative `z` pushes it toward `0`; `z = 0`
  gives exactly `0.5`.
- `error = prediction - y` — a real, signed difference: positive means
  the real model over-predicted, negative means it under-predicted;
  here, `0.5 - 1.0 = -0.5`, a real, correct signal to push the
  prediction *up*.
- `gradient_weight = error * x` — the real, standard logistic-
  regression gradient formula; multiplying the real error by `x`
  scales the real update by how much that particular real feature
  actually contributed.
- `weight = weight - learning_rate * gradient_weight` — reappearing
  shape (S06/S07's own real hash/B-tree lookups moved *toward* an
  answer directly; this moves *toward* a better weight the identical
  real, iterative way) — a real, negative gradient step (subtracting)
  moves `weight` in the real direction that reduces error.

### CS Lens

Gradient descent's own real strategy — take many real, small steps,
each one strictly reducing error, rather than solving for the real,
exact best weight in one real shot — is a genuinely general, real
technique used far beyond logistic regression: every real neural
network, of any real size, trains this identical real way, just with
real, many more weights and a real, more complex error surface to
descend.

### SE Lens

Why does this lesson hand-verify *one* real step by hand, rather than
just trusting the formula and moving straight to real, full training?
Because a real, wrong gradient formula would still *run* — it just
wouldn't actually reduce error, and that real bug is nearly invisible
in a real, full training loop's own aggregate output (accuracy might
still improve *some*, by real accident, hiding a real, broken
gradient). Verifying one real, hand-traceable step first is the same
real discipline this project has used since Lesson 0's own real
`objdump` proof: trust nothing that hasn't been checked directly.

### Commands Needed

Every command was already shown above, alongside its real output.

### Run It

Already shown above, in "Introduce the Concept in Isolation."

### Connection

One real step is verified correct. Running many of them — a real,
full training loop — against real, stored PocketDB data, and comparing
the result against two real, professional tools solving the identical
real problem, is next.

---

## Concept Unit: The Same Real Problem, Three Real Ways

### The Problem

A single, verified gradient step doesn't yet solve anything on its
own. A real, full training loop, real, stored data, and a real,
honest comparison against `scikit-learn` and `Keras` — the actual real
subject `README.md`'s own S12 row names — are still needed.

### Project Change

- **Reference Source:** No reference counterpart.
- **Change type:** Add (a new, standalone script; no engine change).
- **Dependencies:** This lesson's own first unit; Lesson 18's `query`.
- **Setup:** `pip install scikit-learn keras tensorflow` (`Keras` needs
  a real backend; `tensorflow` provides one).

### The New Code — `train_models.py`

```python
import math
import random
from pocketdb import Database, INTEGER

db = Database("students.pdb")
db.create_table("students", hours_studied=INTEGER, passed=INTEGER)

random.seed(3)
for _ in range(150):
    hours = random.randint(0, 12)
    probability_of_passing = 1 / (1 + math.exp(-(hours - 6)))
    passed = 1 if random.random() < probability_of_passing else 0
    db.insert("students", hours, passed)

records = db.query("students")
X = [[int(r["hours_studied"])] for r in records]
y = [int(r["passed"]) for r in records]
print(f"rows: {len(X)}")

# --- scikit-learn ---
from sklearn.linear_model import LogisticRegression

sk_model = LogisticRegression()
sk_model.fit(X, y)
sk_accuracy = sk_model.score(X, y)
print(f"scikit-learn accuracy: {sk_accuracy:.3f}")
print(f"scikit-learn weight/bias: {sk_model.coef_[0][0]:.4f}, {sk_model.intercept_[0]:.4f}")


# --- hand-built single-neuron logistic regression ---
def sigmoid(z):
    return 1 / (1 + math.exp(-z))


weight = 0.0
bias = 0.0
learning_rate = 0.01
epochs = 2000

xs = [row[0] for row in X]

for epoch in range(epochs):
    weight_gradient_sum = 0.0
    bias_gradient_sum = 0.0
    for x, actual in zip(xs, y):
        prediction = sigmoid(weight * x + bias)
        error = prediction - actual
        weight_gradient_sum += error * x
        bias_gradient_sum += error
    weight -= learning_rate * (weight_gradient_sum / len(xs))
    bias -= learning_rate * (bias_gradient_sum / len(xs))

correct = 0
for x, actual in zip(xs, y):
    prediction = 1 if sigmoid(weight * x + bias) >= 0.5 else 0
    if prediction == actual:
        correct += 1
hand_built_accuracy = correct / len(xs)
print(f"hand-built accuracy:   {hand_built_accuracy:.3f}")
print(f"hand-built weight/bias: {weight:.4f}, {bias:.4f}")


# --- Keras ---
import numpy as np
import keras
from keras import layers

keras.utils.set_random_seed(3)

X_arr = np.array(X, dtype="float32")
y_arr = np.array(y, dtype="float32")

keras_model = keras.Sequential([
    keras.Input(shape=(1,)),
    layers.Dense(1, activation="sigmoid"),
])
keras_model.compile(optimizer="sgd", loss="binary_crossentropy", metrics=["accuracy"])
keras_model.fit(X_arr, y_arr, epochs=200, verbose=0)

keras_loss, keras_accuracy = keras_model.evaluate(X_arr, y_arr, verbose=0)
print(f"Keras accuracy:        {keras_accuracy:.3f}")

db.close()
```

Run with:

```bash
python train_models.py
```

Real output:

```text
rows: 150
scikit-learn accuracy: 0.927
scikit-learn weight/bias: 1.0494, -7.0956
hand-built accuracy:   0.880
hand-built weight/bias: 0.4077, -2.3139
Keras accuracy:        0.880
```

*What this proves:* all three real approaches learn the identical real
relationship — a real, positive weight on `hours_studied` (more hours,
more likely to pass) and a real, negative bias — from the exact same
`150` real rows this project's own engine actually stored.
`scikit-learn`'s own real accuracy is meaningfully higher, for a real,
specific, explainable reason (this lesson's own SE Lens); the
hand-built version and `Keras` land at nearly the identical real
accuracy, because they're running the identical real algorithm
(plain gradient descent, `"sgd"`) for the identical real number of
passes over the data.

### Discard the Throwaway Example

```bash
rm train_models.py students.pdb
```

### Mechanical Walkthrough

- `X = [[int(r["hours_studied"])] for r in records]` — reappearing
  shape (list comprehension, Lesson 22) — `scikit-learn`/`Keras` both
  real-expect a real, 2D input shape (a list of real, per-sample
  feature lists, even with only one real feature) — a real, standard
  convention this project's own `Record` never needed before.
- The hand-built loop's own inner `for x, actual in zip(xs, y):` —
  reappearing shape (`zip`, first real use here) — pairs each real
  feature with its own real, matching label; the outer `for epoch in
  range(epochs):` repeats this lesson's own first unit's real, single
  step `2000` real times.
- `weight -= learning_rate * (weight_gradient_sum / len(xs))` — the
  real, only difference from this lesson's own first unit: the real
  gradient is *averaged* across every real training example before
  updating, rather than computed from just one — real, standard
  **batch gradient descent**.
- `keras_model.compile(optimizer="sgd", ...)` — `"sgd"` real-selects
  the identical real algorithm (gradient descent) the hand-built
  version runs explicitly; `Keras` computes the identical real
  gradients internally, using real, automatic differentiation instead
  of this lesson's own hand-derived formula.

### CS Lens

The hand-built version and `Keras` converging to nearly the identical
real accuracy, while `scikit-learn` does meaningfully better, is real,
direct evidence that a "neural network" and "logistic regression" are,
at this real, minimal scale (one neuron, one feature), the identical
real model — `Keras`'s own real power shows up at real *scale* (many
neurons, many layers), not on a problem this small; this lesson
deliberately picks a problem small enough that the real, underlying
math stays fully visible.

### SE Lens

Why is `scikit-learn`'s own real accuracy higher than both the
hand-built version and `Keras`, when all three are learning the
identical real relationship? Because `LogisticRegression`'s own real,
default solver isn't plain gradient descent at all — it's a real, more
sophisticated optimizer (L-BFGS, by default) that converges faster and
more precisely than `2000` real, plain gradient-descent steps do. This
is real, honest, useful information: a professional tool's own real
advantage isn't only convenience — sometimes it's a genuinely better
real algorithm underneath, one this lesson's own hand-built version
deliberately doesn't implement, so the real difference stays visible
instead of hidden.

### Commands Needed

Every command was already shown above, alongside its real output.

### Run It

Already shown above, in "The New Code."

### Connection

S12 is complete: the identical real learning problem, solved three
real, honestly-compared ways, on data this project's own engine
genuinely stored — not a textbook's own pre-packaged dataset.
`README.md`'s own S13 row, next, is the last engine-adjacent slice:
an interface letting a real reinforcement-learning agent persist its
own experience through this project's own real, durable storage,
rather than an in-memory list that vanishes when the process ends.

---

## Closing

### Connect the Pieces

This lesson's first unit hand-verified the single, real mathematical
step every neuron in this lesson ultimately runs — a `sigmoid`
prediction, a real error, a real gradient, one real update — confirming
by hand that it moves a prediction in the correct real direction before
trusting it inside any real loop. The second unit ran that identical
real step `2000` times, batched across `150` real rows this project's
own engine actually stored, and compared the result against
`scikit-learn`'s own real, professional implementation and a real
`Keras` model built from the identical real architecture (one neuron,
sigmoid activation). All three learned the same real relationship;
`scikit-learn`'s own real, higher accuracy came from a genuinely better
real optimizer, not a different real model — an honest, specific reason
this lesson's own SE Lens names directly, not a vague "professional
tools are better."

### What Breaks Without This

In `train_models.py`'s own hand-built loop, change
`weight -= learning_rate * (weight_gradient_sum / len(xs))` to drop the
real `/ len(xs)` (removing the averaging), rebuild nothing (pure
Python), and rerun. The real, printed `hand-built accuracy` becomes
markedly worse, or the real weight/bias values become huge or `nan` —
without averaging, the real gradient's own magnitude scales with
`150` (the real dataset size) instead of staying real, comparable
across different dataset sizes, causing real, wildly oversized weight
updates. Restore the averaging and confirm the real, correct `~0.88`
accuracy returns.

### Exercises

- Change `learning_rate` in the hand-built loop to `0.1` and to
  `0.0001`, rerun, and record the real, resulting accuracy at each.
  Explain, referencing this lesson's own CS Lens on gradient descent,
  why a learning rate that's too large or too small both real-hurt
  final accuracy, for different real reasons.
- Add a second real feature to the stored dataset (say,
  `sleep_hours`), retrain all three real models with two real input
  features instead of one, and compare each one's real accuracy against
  this lesson's own single-feature result.
- `scikit-learn`'s own `LogisticRegression` accepts a real `solver`
  parameter — try `solver="sag"` (a real, literal gradient-descent-
  based solver, unlike the real default) and compare its real accuracy
  against this lesson's own hand-built version. Explain, referencing
  this lesson's own SE Lens, why the two should now be far closer.

### Definition of Done

- [ ] You hand-verified one real gradient-descent step yourself and
      confirmed the real, correct output.
- [ ] You trained all three real models — `scikit-learn`, hand-built,
      `Keras` — on the identical real, stored dataset, and recorded
      your own real accuracy numbers for each.
- [ ] You caused the real "un-averaged gradient" failure yourself and
      confirmed restoring the averaging fixes it.
- [ ] You can explain, from memory, why `scikit-learn`'s own real
      accuracy differs from the hand-built/`Keras` results even though
      all three learn the same real model — referencing this lesson's
      own SE Lens.
- [ ] Committed with a message stating why: for example,
      `git commit -m "Train scikit-learn, a hand-built neuron, and Keras on real, stored data"`.
