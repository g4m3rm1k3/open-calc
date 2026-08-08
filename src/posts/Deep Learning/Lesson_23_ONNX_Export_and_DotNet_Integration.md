# Lesson 23 — Exporting to ONNX and Calling from .NET

**Track:** RL/Keras Mastery Arc — Final Lesson
**Depth:** Heavy on the integration mechanics and the gotchas — this is genuinely new territory (crossing from Python into C#), though the model itself is unchanged
**Goal by end of lesson:** Export any trained Keras model from this series to ONNX format, and call it from a C# console application using `Microsoft.ML.OnnxRuntime` — the concrete, working bridge between everything you've built in Python and something callable from an actual .NET Mastercam add-in.

---

## 0. What ONNX is, and why this is the right bridge

**ONNX** (Open Neural Network Exchange) is a standardized file format for trained neural networks — designed specifically so a model trained in one framework (Keras/TensorFlow here) can be loaded and run in a completely different environment (.NET/C# here), without needing Python installed at all on the consuming side. This matters directly for your situation: a Mastercam add-in is a .NET application, and it has no reasonable way to run Python or TensorFlow directly — ONNX is what lets the *trained result* of all this work cross that boundary, even though the training itself stays in Python.

**What ONNX does and does not carry across:** it exports the network's architecture and learned weights faithfully. It does **not** automatically carry over any preprocessing code you wrote separately in Python — Lesson 20's `standardize_features`, for instance, is plain NumPy code, not part of the Keras model's computational graph, so it will *not* be included in the exported file unless you explicitly build it into the model itself (Section 4 covers this). This is the single most common source of real bugs when deploying models this way, and it's worth internalizing now rather than discovering it the hard way later.

---

## 1. Exporting a Keras model to ONNX

```
pip install tf2onnx
```

```python
import tf2onnx
import tensorflow as tf
from tensorflow import keras

# Load any trained model from this series - example uses Lesson 19's CNC DQN
model = keras.models.load_model("cnc_dqn_model.keras")

# Define the expected input shape explicitly - required for a clean, unambiguous export
input_signature = [tf.TensorSpec([None, 5], tf.float32, name="state_input")]

onnx_model, _ = tf2onnx.convert.from_keras(model, input_signature=input_signature, opset=13)

with open("cnc_dqn_model.onnx", "wb") as f:
    f.write(onnx_model.SerializeToString())

print("Exported to cnc_dqn_model.onnx")
```

- **`tf.TensorSpec([None, 5], tf.float32, name="state_input")`** — `None` in the first position means "any batch size" (the same batch-dimension flexibility from Lesson 2's `reshape(1, 4)` pattern, now made explicit in the export), and `5` is the number of features — Lesson 18's 5-value CNC state. `name="state_input"` matters: this is the exact string identifier the C# side will need to reference when passing data in.
- **`opset=13`** — ONNX's format has versioned "operator sets," similar in spirit to a library version number. `13` is a broadly compatible, stable choice as of this series; specific version needs can shift over time, so checking `Microsoft.ML.OnnxRuntime`'s current documentation for supported opset versions before a real deployment is worth doing rather than assuming this number stays universally correct indefinitely.

---

## 2. Inspecting the exported model before writing any C#

Before touching .NET at all, verify the export produced what you expect — this rules out a whole category of confusing bugs later:

```python
import onnx

model = onnx.load("cnc_dqn_model.onnx")

print("--- Inputs ---")
for input_tensor in model.graph.input:
    print(f"  name: {input_tensor.name}")
    shape = [dim.dim_value if dim.dim_value > 0 else "batch" for dim in input_tensor.type.tensor_type.shape.dim]
    print(f"  shape: {shape}")

print("--- Outputs ---")
for output_tensor in model.graph.output:
    print(f"  name: {output_tensor.name}")
    shape = [dim.dim_value if dim.dim_value > 0 else "batch" for dim in output_tensor.type.tensor_type.shape.dim]
    print(f"  shape: {shape}")
```

Run this and note down the exact input/output names and shapes it prints — you'll need to match these *exactly* on the C# side; a mismatched name is a common, easy-to-make error that produces a runtime exception rather than a silent wrong answer, which is at least the more forgiving failure mode of the two.

---

## 3. The C# side — loading and running the model

Create a new .NET console project and add the ONNX Runtime package:

```
dotnet new console -n CncModelInference
cd CncModelInference
dotnet add package Microsoft.ML.OnnxRuntime
```

```csharp
using System;
using Microsoft.ML.OnnxRuntime;
using Microsoft.ML.OnnxRuntime.Tensors;

class Program
{
    static void Main()
    {
        // Load the ONNX model - path relative to wherever you place the .onnx file
        using var session = new InferenceSession("cnc_dqn_model.onnx");

        // Build the input tensor - MUST match the exported shape and dtype exactly (Section 1-2)
        // Example state: [remaining_length, feed_rate, spindle_speed, tool_wear, cutting_force]
        float[] stateValues = { 0.8f, 1.0f, 1.0f, 0.15f, 1.05f };
        var inputTensor = new DenseTensor<float>(stateValues, new[] { 1, 5 });  // batch size 1, 5 features

        var inputs = new List<NamedOnnxValue>
        {
            NamedOnnxValue.CreateFromTensor("state_input", inputTensor)  // name MUST match Section 1's export
        };

        using var results = session.Run(inputs);

        var outputTensor = results.First().AsTensor<float>();
        float[] qValues = outputTensor.ToArray();

        Console.WriteLine("Q-values for each action:");
        for (int i = 0; i < qValues.Length; i++)
        {
            Console.WriteLine($"  Action {i}: {qValues[i]:F4}");
        }

        int bestAction = Array.IndexOf(qValues, qValues.Max());
        Console.WriteLine($"\nBest action (argmax): {bestAction}");
    }
}
```

Reading the pieces, mapped to what you already know:
- **`new InferenceSession("cnc_dqn_model.onnx")`** — loads the exported model. This is C#'s equivalent of Python's `keras.models.load_model(...)`.
- **`DenseTensor<float>(stateValues, new[] { 1, 5 })`** — building the input tensor with an explicit shape `[1, 5]`: batch size 1, 5 features — exactly Lesson 2's `reshape(1, 4)` pattern, just expressed in C#'s type system instead of NumPy.
- **`NamedOnnxValue.CreateFromTensor("state_input", inputTensor)`** — the string `"state_input"` here has to match Section 1's `name="state_input"` *exactly*. This is the single most common integration bug: a typo or mismatch here produces a runtime error, not a wrong-but-silent answer — annoying when it happens, but at least it fails loudly rather than quietly.
- **`Array.IndexOf(qValues, qValues.Max())`** — this is C#'s version of `np.argmax` (Lesson 2, Section 2). Same operation, same purpose — find the index of the largest value — different language's standard library providing it.

---

## 4. The preprocessing gotcha, solved properly

Section 0 flagged this: Python-side preprocessing (like Lesson 20's `standardize_features`) doesn't automatically travel with the exported model. Two real options, and the second is generally the better long-term choice:

**Option A — replicate the exact preprocessing math in C#.** Store the `feature_mean` and `feature_std` values computed during training (Lesson 20, Section 3), and reimplement the same standardization formula in C#:

```csharp
float[] mean = { /* the exact values from training */ };
float[] std = { /* the exact values from training */ };

float[] standardizedInput = new float[rawInput.Length];
for (int i = 0; i < rawInput.Length; i++)
{
    standardizedInput[i] = (rawInput[i] - mean[i]) / (std[i] + 1e-8f);
}
```

This works, but it's fragile — if the Python training pipeline changes its preprocessing later, the C# copy has to be manually updated too, and nothing will warn you if they drift out of sync.

**Option B — bake preprocessing into the exported model itself**, so there's only one source of truth. This is done by adding a normalization layer directly into the Keras model *before* exporting, so standardization becomes part of the ONNX graph and travels with it automatically:

```python
from tensorflow.keras import layers

normalization_layer = layers.Normalization(axis=-1)
normalization_layer.adapt(train_features)   # computes and stores mean/std internally, from training data

model_with_preprocessing = keras.Sequential([
    normalization_layer,
    original_trained_model
])
```

Exporting `model_with_preprocessing` instead of the raw model means the C# side just passes in raw sensor values directly — no manual reimplementation, no drift risk. **This is worth treating as the standard approach going forward**, rather than Option A's manual duplication — it's a small amount of extra Python-side work in exchange for removing an entire category of future bugs.

---

## 5. Where this actually goes next — the Mastercam add-in path

This lesson stops at a standalone C# console app deliberately — that's the right scope for learning the ONNX/.NET mechanics cleanly, without also debugging Mastercam's specific API surface at the same time. The path from here into an actual add-in is mostly integration work rather than new ML concepts:

- A Mastercam add-in would pull current operation parameters (feed rate, spindle speed, material, tool data) from Mastercam's own API instead of a hardcoded `stateValues` array.
- The `InferenceSession` and inference call (Section 3) would live inside whatever event handler or menu command triggers the "recommend parameters" or "check tool health" feature you're building.
- The ONNX Runtime NuGet package works the same way inside a Mastercam add-in project as it does in this standalone console app — there's nothing Mastercam-specific about loading and running an ONNX model, it's ordinary .NET code either way.

This is genuinely a reasonable next real project once you're ready — using your existing add-in development experience to wire a trained model from this series into an actual tool inside Mastercam, rather than a from-scratch new thing to learn.

---

## 6. Final challenges

1. Export Lesson 20's predictive maintenance classifier (not the DQN) to ONNX, following Section 1's pattern, and write a small C# console app that loads it and prints the failure probability for a hardcoded sensor reading.
2. Implement Option B from Section 4 — add a `Normalization` layer, `.adapt()` it on your training features, and re-export. Confirm the C# side no longer needs any manual standardization code, and that raw (unstandardized) sensor values passed in directly still produce a sensible result.
3. Deliberately mismatch the input tensor shape in the C# code (e.g., pass `new[] { 1, 4 }` instead of `{ 1, 5 }` for the CNC DQN model) and read the resulting error message. Recognizing this specific class of error will save real debugging time later.
4. In your own words: why does Section 4 recommend baking preprocessing into the model (Option B) as the *default* going forward, rather than treating Option A's manual duplication as an acceptable normal practice? Tie this to the same "single source of truth" reasoning that made Lesson 18's clean separation between environment control-flow and process-model functions valuable.

---

## Series complete — for real this time

Twenty-three lessons: from "what is a vector" through Double DQN, Actor-Critic, continuous control with DDPG, two real manufacturing use cases built on your own domain knowledge, and now a working bridge from trained Python model to callable .NET code. Every step traced back to something built by hand — including, in this final lesson, watching that same trained intelligence cross a language boundary into the exact ecosystem your actual add-in work lives in.

That last part is worth sitting with: this isn't a hypothetical capstone anymore. The ONNX file this lesson produces is a real artifact you could genuinely wire into a real add-in, using skills you already had going into this series. That gap — from "learned the theory" to "here's something pluggable into my actual toolchain" — is the entire point of the manufacturing arc, and it's now closed.

Good luck with the class, and with wherever this goes in your own CAM work from here.
