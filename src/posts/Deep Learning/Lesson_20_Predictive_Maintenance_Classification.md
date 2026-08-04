# Lesson 20 — Predictive Maintenance via Supervised Learning

**Track:** RL/Keras Mastery Arc — Manufacturing Application
**Depth:** Heavy on framing (why this is a different problem needing a different tool), light on new mechanics (this is Lesson 4's `Dense` network, applied to new data)
**Goal by end of lesson:** Recognize when a manufacturing ML problem is *not* RL-shaped, build a simulated sensor dataset, and train a classifier to distinguish "healthy" from "trending toward tool failure" — a genuinely different, equally real use case from Lessons 18-19.

---

## 0. Why this isn't an RL problem — reasoning through it explicitly

This is worth working through carefully, since "which tool fits this problem" is a more transferable skill than any single algorithm. Recall RL's defining structure (Lesson 6): an *agent* takes *actions* that affect a *state*, and learns from a *reward signal* accumulated over a sequence of decisions.

Predictive maintenance doesn't have that shape. There's no agent choosing actions to influence tool wear here — sensors passively report vibration, spindle load, temperature, and the question is purely: **given this reading, is the tool healthy or not?** That's a **classification** problem — a direct input-to-label mapping, no sequential decision-making, no reward accumulation, no policy to learn. It's exactly Lesson 4's `Dense` network training paradigm (`inputs → model → prediction`, trained via supervised labels), just with different data than a toy regression example.

**The genuinely useful skill this lesson builds:** noticing this distinction *before* reaching for RL by habit just because the last several lessons were RL. Not every manufacturing ML problem is a control problem — plenty are "classify this reading" or "predict this number from these inputs," and those are supervised learning problems, full stop.

---

## 1. Defining the problem

**Inputs (features):** simulated sensor readings — vibration amplitude, spindle load, temperature, and cutting sound frequency (a stand-in for acoustic emission monitoring, a real technique in tool-wear detection).

**Output (label):** a binary classification — `0` (healthy) or `1` (trending toward failure) — though real predictive maintenance systems often use a continuous "remaining useful life" regression instead of a binary label; binary classification is used here as the simpler, foundational version.

**Why simulated data:** you don't have a labeled dataset of real sensor readings paired with confirmed failure outcomes sitting ready to use in this lesson, and that's completely normal — this is exactly the situation most people face when first exploring a new ML application at work. The simulation here is built to have a learnable, directionally sensible pattern (worsening readings correlate with the failure label), so you can validate the *pipeline* — data prep, model architecture, training, evaluation — before ever needing real data. Swapping in real logged sensor data later, once available, is a natural and valuable extension (Challenge 1).

---

## 2. Generating a simulated dataset

```python
import numpy as np

def generate_simulated_sensor_data(num_samples=2000, random_seed=42):
    """
    Simulates sensor readings with a learnable pattern: as a simulated 'wear progression'
    increases, vibration/load/temperature/sound tend to rise, with realistic noise added.
    Not real data - see Section 1's honest framing.
    """
    rng = np.random.default_rng(random_seed)

    wear_progression = rng.uniform(0, 1, size=num_samples)   # 0 = brand new tool, 1 = fully worn

    vibration = 0.5 + 2.0 * wear_progression + rng.normal(0, 0.3, size=num_samples)
    spindle_load = 0.4 + 1.5 * wear_progression + rng.normal(0, 0.25, size=num_samples)
    temperature = 20 + 40 * wear_progression + rng.normal(0, 5, size=num_samples)
    sound_frequency = 1000 + 500 * wear_progression + rng.normal(0, 80, size=num_samples)

    # Label: "trending toward failure" if wear progression is past a threshold,
    # with some label noise to simulate real-world ambiguity near the boundary
    labels = (wear_progression > 0.7).astype(int)
    label_noise_mask = rng.random(num_samples) < 0.05   # 5% of labels deliberately flipped
    labels[label_noise_mask] = 1 - labels[label_noise_mask]

    features = np.column_stack([vibration, spindle_load, temperature, sound_frequency])
    return features, labels
```

**The deliberate label noise** (5% flipped) matters: real sensor-based failure prediction is never perfectly clean — the actual moment a tool "starts trending toward failure" is fuzzy, not a sharp threshold. Training on unrealistically clean synthetic data would give you a false sense of how well a real system would perform; the noise keeps this exercise honest.

---

## 3. Preparing the data — normalization, and why it matters more here than in Lesson 4's examples

The four features here have wildly different natural scales — temperature ranges over tens of degrees, sound frequency over hundreds of Hz, vibration over a couple of units. Feeding these directly into a network can cause the larger-scale features (temperature, sound frequency) to dominate training simply due to their numeric magnitude, not because they're actually more informative. **Standardization** (subtracting the mean, dividing by the standard deviation — reusing Lesson 3's `np.mean`/`np.std`) puts every feature on a comparable scale:

```python
def standardize_features(features, mean=None, std=None):
    if mean is None:
        mean = np.mean(features, axis=0)
    if std is None:
        std = np.std(features, axis=0)
    standardized = (features - mean) / (std + 1e-8)
    return standardized, mean, std
```

**Important practical detail:** compute `mean`/`std` from the *training* data only, then apply those same values to standardize the test data — never recompute `mean`/`std` from the test set. Using test-set statistics to standardize test data would leak information about the test set into preprocessing, giving an overly optimistic (and dishonest) sense of how the model performs on genuinely unseen data.

---

## 4. The classifier — Lesson 4's `Dense` network, with one new piece: the output layer for binary classification

```python
from tensorflow import keras
from tensorflow.keras import layers

def build_classifier(num_features):
    model = keras.Sequential([
        layers.Dense(16, activation="relu", input_shape=(num_features,)),
        layers.Dense(8, activation="relu"),
        layers.Dense(1, activation="sigmoid")   # single output, squashed to [0, 1] - a probability
    ])
    model.compile(optimizer="adam", loss="binary_crossentropy", metrics=["accuracy"])
    return model
```

Two things different from Lesson 4's regression example:
- **`activation="sigmoid"` on the output** — squashes the raw output into `[0, 1]`, interpretable as "the model's estimated probability this reading indicates a tool trending toward failure." (This is the same sigmoid function whose derivative Lesson 10, Section 6 worked out by hand.)
- **`loss="binary_crossentropy"`** instead of `"mse"` — the standard loss for binary classification, measuring how well the predicted probability matches the true 0/1 label. Using MSE for classification is possible but generally trains less effectively than a loss actually designed around probabilities — a concrete instance of the "wrong loss for the problem" caution from the Refresher, Part 2.

---

## 5. Evaluation — why accuracy alone can be misleading here

If failures are relatively rare (a realistic assumption — most sensor readings during normal operation should be "healthy"), a model could achieve high *accuracy* just by always predicting "healthy," while being useless at its actual job of catching real failures. This is worth checking explicitly rather than trusting the headline accuracy number:

```python
def evaluate_with_confusion_matrix(model, test_features, test_labels):
    predicted_probabilities = model.predict(test_features, verbose=0)
    predicted_labels = (predicted_probabilities > 0.5).astype(int).flatten()

    true_positives = np.sum((predicted_labels == 1) & (test_labels == 1))
    false_positives = np.sum((predicted_labels == 1) & (test_labels == 0))
    true_negatives = np.sum((predicted_labels == 0) & (test_labels == 0))
    false_negatives = np.sum((predicted_labels == 0) & (test_labels == 1))

    print(f"True positives (correctly caught failures): {true_positives}")
    print(f"False negatives (MISSED failures - the costly kind): {false_negatives}")
    print(f"False positives (false alarms): {false_positives}")
    print(f"True negatives (correctly identified healthy): {true_negatives}")

    if (true_positives + false_negatives) > 0:
        recall = true_positives / (true_positives + false_negatives)
        print(f"Recall (fraction of real failures actually caught): {recall:.2%}")
```

**Why `false_negatives` deserves special attention, explicitly:** in a real predictive maintenance system, a missed failure (the model says "healthy" when the tool is actually about to break) is typically far more costly than a false alarm (the model flags a perfectly fine tool for inspection). This asymmetry is a genuine, real-world consideration — worth deliberately checking rather than only looking at overall accuracy, which treats both error types as equally bad by default.

---

## 6. Complete runnable file

Save as `lesson_20_practice.py` and run with `python lesson_20_practice.py`.

```python
"""
Lesson 20 Practice: Predictive maintenance classification on simulated sensor data.
Run with: python lesson_20_practice.py
"""
import numpy as np
from tensorflow import keras
from tensorflow.keras import layers


def generate_simulated_sensor_data(num_samples=2000, random_seed=42):
    rng = np.random.default_rng(random_seed)
    wear_progression = rng.uniform(0, 1, size=num_samples)

    vibration = 0.5 + 2.0 * wear_progression + rng.normal(0, 0.3, size=num_samples)
    spindle_load = 0.4 + 1.5 * wear_progression + rng.normal(0, 0.25, size=num_samples)
    temperature = 20 + 40 * wear_progression + rng.normal(0, 5, size=num_samples)
    sound_frequency = 1000 + 500 * wear_progression + rng.normal(0, 80, size=num_samples)

    labels = (wear_progression > 0.7).astype(int)
    label_noise_mask = rng.random(num_samples) < 0.05
    labels[label_noise_mask] = 1 - labels[label_noise_mask]

    features = np.column_stack([vibration, spindle_load, temperature, sound_frequency])
    return features, labels


def standardize_features(features, mean=None, std=None):
    if mean is None:
        mean = np.mean(features, axis=0)
    if std is None:
        std = np.std(features, axis=0)
    standardized = (features - mean) / (std + 1e-8)
    return standardized, mean, std


def build_classifier(num_features):
    model = keras.Sequential([
        layers.Dense(16, activation="relu", input_shape=(num_features,)),
        layers.Dense(8, activation="relu"),
        layers.Dense(1, activation="sigmoid")
    ])
    model.compile(optimizer="adam", loss="binary_crossentropy", metrics=["accuracy"])
    return model


def evaluate_with_confusion_matrix(model, test_features, test_labels):
    predicted_probabilities = model.predict(test_features, verbose=0)
    predicted_labels = (predicted_probabilities > 0.5).astype(int).flatten()

    true_positives = np.sum((predicted_labels == 1) & (test_labels == 1))
    false_positives = np.sum((predicted_labels == 1) & (test_labels == 0))
    true_negatives = np.sum((predicted_labels == 0) & (test_labels == 0))
    false_negatives = np.sum((predicted_labels == 0) & (test_labels == 1))

    print(f"True positives (correctly caught failures): {true_positives}")
    print(f"False negatives (MISSED failures): {false_negatives}")
    print(f"False positives (false alarms): {false_positives}")
    print(f"True negatives (correctly healthy): {true_negatives}")

    if (true_positives + false_negatives) > 0:
        recall = true_positives / (true_positives + false_negatives)
        print(f"Recall (fraction of real failures caught): {recall:.2%}")


if __name__ == "__main__":
    print("--- Generating simulated sensor data ---")
    features, labels = generate_simulated_sensor_data(num_samples=2000)
    print("Features shape:", features.shape, "| Labels shape:", labels.shape)
    print("Failure rate in dataset:", f"{np.mean(labels):.1%}")
    print()

    split_index = int(0.8 * len(features))
    train_features, test_features = features[:split_index], features[split_index:]
    train_labels, test_labels = labels[:split_index], labels[split_index:]

    print("--- Standardizing (Section 3) ---")
    train_features_std, feature_mean, feature_std = standardize_features(train_features)
    test_features_std, _, _ = standardize_features(test_features, mean=feature_mean, std=feature_std)
    print()

    print("--- Training classifier ---")
    model = build_classifier(num_features=train_features.shape[1])
    history = model.fit(train_features_std, train_labels,
                         epochs=30, batch_size=32, validation_split=0.2, verbose=0)
    print("Final training accuracy:", f"{history.history['accuracy'][-1]:.2%}")
    print("Final validation accuracy:", f"{history.history['val_accuracy'][-1]:.2%}")
    print()

    print("--- Evaluating on held-out test set (Section 5) ---")
    test_loss, test_accuracy = model.evaluate(test_features_std, test_labels, verbose=0)
    print(f"Test accuracy: {test_accuracy:.2%}")
    evaluate_with_confusion_matrix(model, test_features_std, test_labels)
```

---

## 7. Challenges before Lesson 21

1. Change the failure threshold in `generate_simulated_sensor_data` from `wear_progression > 0.7` to `> 0.9` (a rarer failure event). Retrain, and check the confusion matrix — does the model's `false_negatives` count get relatively worse as the failure class becomes rarer? This is a genuine, common real-world pattern with imbalanced classification data.
2. Remove `standardize_features` entirely (train on raw, unscaled features) and compare training speed/final accuracy to the standardized version. Does skipping standardization visibly hurt here, given how different the four features' natural scales are (Section 3)?
3. If you have access to any real logged sensor data from actual CNC operation (even partial, even without confirmed failure labels), sketch — in words — what it would take to adapt this pipeline to it: what would need to become the label, what preprocessing steps might differ, and what you'd realistically be able to conclude versus not conclude from a first pass.
4. This lesson used a single sensor "reading" (one row of 4 features) as one input. Real vibration/acoustic data is often a time-series signal rather than a single snapshot. Referencing Lesson 16's CNN/frame-stacking material, sketch how you might restructure the input if you had, say, a rolling window of the last 50 sensor readings instead of just the current one — would this look more like the frame-stacking approach from Lesson 16, or something else?

---

## What's next

Lesson 21 closes the manufacturing arc: a live Dash dashboard (Lesson 17's skills) showing both this lesson's classifier output and Lesson 19's agent status side by side — a simulated "digital twin" monitoring view combining both use cases into one operational picture.
