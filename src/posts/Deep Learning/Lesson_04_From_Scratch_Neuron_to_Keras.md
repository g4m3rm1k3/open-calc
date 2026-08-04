# Lesson 4 — From Your From-Scratch Neuron to Keras

**Track:** RL/Keras Class Prep — Week 2 (opener)
**Depth:** Heavy (new API, but built entirely on math you already have)
**Goal by end of lesson:** You can look at a Keras model definition and know exactly what raw math each line is doing, because you already built that math by hand. Keras stops being a black box starting here.

---

## 0. Quick recap — what you already know

From your earlier from-scratch neuron work and Lessons 1-3, you already have:

- A single neuron computes `output = (inputs · weights) + bias`, then passes that through an **activation function**.
- A layer of neurons is `layer_output = inputs @ weight_matrix + bias_vector` (Lesson 1, Section 3.3).
- Training adjusts weights and biases using **gradient descent** — nudging each weight in the direction that reduces error.

Everything in this lesson is Keras doing those exact same operations, just with a library handling the bookkeeping (matrix shapes, gradient computation, weight updates) instead of you writing it by hand every time.

---

## 1. Why use a library at all, if you already built this?

You built one neuron, and maybe a small network, entirely by hand — writing the forward pass and the gradient descent update yourself. That was worth doing because it removes the mystery. But by-hand implementations don't scale:

- A real network might have millions of weights. Computing gradients by hand for each one is impractical.
- Keras uses **automatic differentiation** (via TensorFlow) — it computes gradients for you, exactly, no matter how complex the network gets. You'll never hand-derive a gradient for a 10-layer network; the library does it in one line.
- Keras also handles batching, GPU acceleration, and numerically stable implementations of activation functions — details that matter for real training but aren't the conceptual core.

**The mental model to keep:** Keras is not doing anything different from what you did by hand. It's doing the same operations, faster, at scale, with less code — and once you can map every Keras call back to the math you already know, you'll debug it far better than someone who only ever learned the API.

---

## 2. The `Sequential` model — stacking layers

```python
from tensorflow import keras
from tensorflow.keras import layers

model = keras.Sequential([
    layers.Dense(16, activation="relu", input_shape=(4,)),
    layers.Dense(8, activation="relu"),
    layers.Dense(2, activation="linear")
])
```

Let's map every piece of this to math you already know:

- `keras.Sequential([...])` — a network where data flows straight through each layer in order, no branching. "Sequential" just means "one after another," which matches every network you've built by hand so far.
- `layers.Dense(16, ...)` — a **fully connected layer** of 16 neurons. "Dense" means every input connects to every neuron in this layer — exactly the `inputs @ weight_matrix + bias_vector` operation from Lesson 1, Section 3.3, done 16 times (once per neuron, all in one matrix multiplication).
- `input_shape=(4,)` — tells the first layer to expect a 4-dimensional input vector. This is why: `weight_matrix` for this layer will automatically be shaped `(4, 16)` — 4 inputs, 16 neurons — matching the rule from Lesson 1, Section 3.1 (inner dimensions must match). You only specify `input_shape` on the *first* layer; every layer after it infers its input size from the layer before.
- `activation="relu"` — the activation function applied after the dot product + bias, same role as whatever activation you used by hand. ReLU specifically is `max(0, x)` — it just zeroes out negative values and passes positive values through unchanged. It's popular because it's cheap to compute and avoids some gradient problems that older activations (like sigmoid) have in deep networks.
- The last layer, `layers.Dense(2, activation="linear")` — 2 output neurons (e.g., one score per action, matching Lesson 2's `action_scores` example), with a **linear** activation, meaning no transformation is applied — the raw dot-product-plus-bias value passes through as-is. This is the standard choice for a layer producing raw Q-values or scores, rather than probabilities.

### 2.1 Verifying your understanding — `model.summary()`

```python
model.summary()
```

This prints every layer, its output shape, and its parameter count. For the model above, the first `Dense(16, ...)` layer has `(4 × 16) + 16 = 80` parameters — 4×16 weights plus 16 biases (one bias per neuron). Compute this yourself for each layer before running `.summary()` and check your answer against the output. If your number doesn't match, that's a sign your understanding of the weight matrix shape is off somewhere — worth chasing down immediately rather than moving on.

---

## 3. Compiling the model — telling it how to learn

```python
model.compile(
    optimizer="adam",
    loss="mse",
    metrics=["mae"]
)
```

- **`optimizer`** — the algorithm that performs the weight updates. You already know the core idea from gradient descent: adjust each weight in the direction that reduces error, scaled by a learning rate. `"adam"` is a more sophisticated version of plain gradient descent — it adapts the learning rate per-parameter automatically, which usually trains faster and more reliably than the basic version you likely implemented by hand. Under the hood, it's still doing gradient descent; it's just smarter about step sizes.
- **`loss`** — the function measuring "how wrong is the model's output." `"mse"` is **mean squared error**: `average((predicted - actual)^2)`. If you computed error by hand while building your neuron, this is very likely the exact formula you used, or something close to it.
- **`metrics`** — extra numbers to track and print during training, purely for your own monitoring — they don't affect how the model learns. `"mae"` is **mean absolute error**, a more human-readable version of "how far off are we on average" (no squaring, so it's in the same units as your actual values).

---

## 4. Training — `model.fit()`

```python
import numpy as np

# Fake training data: 100 examples, each a 4-dimensional input, with 2-dimensional targets
training_inputs = np.random.rand(100, 4)
training_targets = np.random.rand(100, 2)

history = model.fit(
    training_inputs,
    training_targets,
    epochs=10,
    batch_size=16,
    validation_split=0.2
)
```

- **`epochs=10`** — the model sees the *entire* training set 10 times over. One epoch = one full pass through all the data.
- **`batch_size=16`** — instead of updating weights after every single example (slow) or after the entire dataset at once (memory-heavy, less stable), the model updates weights after every 16 examples. This is a middle ground, and it's also *why* the "batch dimension" from Lesson 2's `reshape(1, 4)` exists — even a single prediction is treated as "a batch of 1."
- **`validation_split=0.2`** — holds back 20% of the training data, untouched by weight updates, purely to check performance on data the model hasn't directly learned from. This is your early warning system for **overfitting** (Section 5).
- **`history`** — an object storing the loss (and metrics) at every epoch. Plotting `history.history["loss"]` is the training-curve plot from Lesson 3, applied to supervised learning instead of RL rewards — same exact plotting skill, new context.

---

## 5. Overfitting and underfitting — what you're watching for

- **Underfitting**: the model's training loss stays high and never improves much. It hasn't learned the pattern in the data at all — often means the model is too small, hasn't trained long enough, or the learning rate is badly tuned.
- **Overfitting**: training loss keeps dropping, but validation loss stops improving or starts *rising*. The model has started memorizing quirks of the training data instead of learning the general pattern — it'll perform worse on new data than the training numbers suggest.

The standard diagnostic is plotting both curves together:

```python
import matplotlib.pyplot as plt

plt.plot(history.history["loss"], label="Training loss")
plt.plot(history.history["val_loss"], label="Validation loss")
plt.xlabel("Epoch")
plt.ylabel("Loss")
plt.title("Training vs. Validation Loss")
plt.legend()
plt.show()
```

If the two lines track closely together and both decrease, that's healthy. If validation loss flattens or rises while training loss keeps falling, that gap **is** overfitting, visually. This exact plot pattern will be one of the most useful diagnostic habits from this entire class.

---

## 6. Complete runnable file

Save as `lesson_04_practice.py` and run with `python lesson_04_practice.py`. (First run: TensorFlow may print some informational/warning messages on startup — that's normal, not an error, as long as training actually proceeds.)

```python
"""
Lesson 4 Practice: Mapping the from-scratch neuron onto Keras's Sequential/Dense API
Run with: python lesson_04_practice.py
"""
import numpy as np
import matplotlib.pyplot as plt
from tensorflow import keras
from tensorflow.keras import layers


def build_model():
    print("--- Building the model (Section 2) ---")
    model = keras.Sequential([
        layers.Dense(16, activation="relu", input_shape=(4,)),
        layers.Dense(8, activation="relu"),
        layers.Dense(2, activation="linear")
    ])
    model.summary()
    print()
    return model


def compile_model(model):
    print("--- Compiling (Section 3) ---")
    model.compile(
        optimizer="adam",
        loss="mse",
        metrics=["mae"]
    )
    print("Model compiled with adam optimizer and mse loss.")
    print()


def generate_fake_training_data():
    # Deterministic seed so results are repeatable across runs
    np.random.seed(42)
    training_inputs = np.random.rand(200, 4)
    # Targets loosely derived from inputs, so there's an actual pattern to learn
    training_targets = np.column_stack([
        training_inputs[:, 0] + training_inputs[:, 1],
        training_inputs[:, 2] - training_inputs[:, 3]
    ])
    return training_inputs, training_targets


def train_model(model, training_inputs, training_targets):
    print("--- Training (Section 4) ---")
    history = model.fit(
        training_inputs,
        training_targets,
        epochs=30,
        batch_size=16,
        validation_split=0.2,
        verbose=0
    )
    print("Final training loss:", history.history["loss"][-1])
    print("Final validation loss:", history.history["val_loss"][-1])
    print()
    return history


def plot_training_history(history):
    print("--- Plotting training vs. validation loss (Section 5) ---")
    plt.plot(history.history["loss"], label="Training loss")
    plt.plot(history.history["val_loss"], label="Validation loss")
    plt.xlabel("Epoch")
    plt.ylabel("Loss (MSE)")
    plt.title("Training vs. Validation Loss")
    plt.legend()
    plt.show()


def make_a_prediction(model):
    print("--- One prediction, tying back to Lesson 2's reshape/argmax (Section 4) ---")
    single_input = np.array([0.5, 0.2, 0.8, 0.1])
    batched_input = single_input.reshape(1, 4)   # same "batch of 1" pattern from Lesson 2
    prediction = model.predict(batched_input, verbose=0)
    print("Input:", single_input)
    print("Predicted output:", prediction)


if __name__ == "__main__":
    model = build_model()
    compile_model(model)
    training_inputs, training_targets = generate_fake_training_data()
    history = train_model(model, training_inputs, training_targets)
    plot_training_history(history)
    make_a_prediction(model)
```

---

## 7. Challenges before Lesson 5

1. Before running `.summary()`, compute by hand how many parameters each `Dense` layer in Section 2's model should have. Confirm your numbers against the actual output.
2. Change the first layer from 16 neurons to 32. Recompute the parameter count for that layer by hand, then verify.
3. Run the practice file and look at the training/validation loss plot. Is it overfitting, underfitting, or healthy? (With only 200 fake, loosely-patterned data points and 30 epochs, it's worth reasoning about which you'd expect before looking.)
4. Change `optimizer="adam"` to `optimizer="sgd"` (plain stochastic gradient descent — the version closest to what you likely built by hand) and compare the resulting loss curve. Which trains faster in this example?

---

## What's next

Lesson 5 stays in Week 2: CNN basics (why images need a different layer type than `Dense`, what convolution and pooling actually do, and when RL problems need this — think Atari-style pixel-input environments from your "Applied RL" book, as opposed to CartPole's simple state vector).
