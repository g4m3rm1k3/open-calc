# Lesson 5 — CNN Basics: Why Images Need a Different Layer

**Track:** RL/Keras Class Prep — Week 2 (closing lesson)
**Depth:** Heavy (new concept, but the underlying math is the same dot-product idea you already know)
**Goal by end of lesson:** You understand *why* `Dense` layers are a bad fit for images, what a convolution actually computes (by hand, on paper), what pooling does and why, and you can read/build a simple Keras CNN. You'll also see exactly where this connects to your RL book — Atari-style environments hand you pixels, not a clean 4-number state vector like CartPole.

---

## 0. Why not just use `Dense` layers for images?

A `Dense` layer connects *every* input to *every* neuron (Lesson 4, Section 2). An image is a grid of pixels — even a small 84×84 grayscale image (a common size in Atari RL) has 7,056 pixel values. Two problems with feeding that straight into a `Dense` layer:

1. **Parameter explosion.** A `Dense(128)` layer on 7,056 inputs needs `7,056 × 128 = 903,168` weights for *one layer*. That's expensive and prone to overfitting — too many parameters for the data to constrain properly.
2. **No sense of spatial structure.** A `Dense` layer treats pixel #1 and pixel #5,000 as equally related, even though real images have *local* structure — nearby pixels are meaningfully related (an edge, a shape), while far-apart pixels usually aren't. Flattening an image into one long vector throws that structure away before the network even sees it.

Convolutional layers fix both problems: they reuse a small set of weights across the whole image (far fewer parameters) and they specifically look at small local neighborhoods of pixels at a time (preserving spatial structure).

---

## 1. Convolution, by hand first

A **convolution** slides a small grid of numbers (called a **kernel** or **filter**) across an image, computing a dot product at each position.

### 1.1 A tiny worked example

Take this 4×4 "image" (just numbers, to keep it simple):

```
Image =
[1, 2, 3, 0]
[4, 5, 6, 1]
[7, 8, 9, 2]
[1, 2, 1, 0]
```

And this 2×2 kernel:

```
Kernel =
[1, 0]
[0, -1]
```

Convolution slides the kernel over the image, and at each position, multiplies the overlapping numbers element-wise and sums them — **this is a dot product, exactly like Lesson 1, Section 2.3**, just laid out as a 2D grid instead of a flat list.

**Position (top-left corner of the image):**
```
Overlap:
[1, 2]
[4, 5]

Kernel:
[1,  0]
[0, -1]

Sum = (1*1) + (2*0) + (4*0) + (5*-1) = 1 + 0 + 0 - 5 = -4
```

Slide the kernel one step right and repeat:
```
Overlap:
[2, 3]
[5, 6]

Sum = (2*1) + (3*0) + (5*0) + (6*-1) = 2 - 6 = -4
```

Keep sliding across the whole image (right, then down one row, repeat). Each position produces one number, and together they form a smaller output grid called a **feature map**. For a 4×4 image and a 2×2 kernel sliding one step at a time, the output is 3×3 (fewer positions fit as the kernel gets near the edge).

**The core insight:** a convolution is nothing but a dot product (Lesson 1) computed repeatedly over small local patches of the image, using the *same* kernel weights every time. That weight-reuse is what keeps the parameter count small — you learn one small kernel, and it gets applied everywhere.

### 1.2 What a kernel actually detects

Different kernels detect different patterns. The one above (`[[1, 0], [0, -1]]`) responds strongly to diagonal brightness changes — a crude edge detector. In a real CNN, you don't hand-design kernels — the network *learns* the kernel values through gradient descent, the exact same training process from Lesson 4. Early layers tend to learn simple things like edges and color contrasts; deeper layers combine those into more complex shapes.

---

## 2. Pooling — shrinking the feature map on purpose

After a convolution, it's common to apply **pooling**, which reduces the size of the feature map by summarizing small regions.

**Max pooling** (the most common kind) slides a small window over the feature map and keeps only the *maximum* value in each window:

```
Feature map:
[1, 3, 2, 4]
[5, 6, 1, 0]
[2, 1, 8, 3]
[0, 4, 2, 1]

Max pooling with a 2x2 window, stride 2 (non-overlapping):

Top-left 2x2:    [1,3] / [5,6]  -> max = 6
Top-right 2x2:   [2,4] / [1,0]  -> max = 4
Bottom-left 2x2: [2,1] / [0,4]  -> max = 4
Bottom-right 2x2:[8,3] / [2,1]  -> max = 8

Result:
[6, 4]
[4, 8]
```

**Why do this on purpose?** Two reasons:
1. It shrinks the data (4×4 → 2×2 here), which reduces computation in every layer after it.
2. It keeps the *strongest* signal in each region while discarding exact position — meaning the network becomes somewhat tolerant to small shifts in where a feature appears in the image. For Atari-style RL, this matters: a ball or paddle a few pixels to the left shouldn't confuse the network into thinking it's a totally different situation.

---

## 3. Building a simple CNN in Keras

```python
from tensorflow import keras
from tensorflow.keras import layers

model = keras.Sequential([
    layers.Conv2D(32, kernel_size=(3, 3), activation="relu", input_shape=(84, 84, 1)),
    layers.MaxPooling2D(pool_size=(2, 2)),
    layers.Conv2D(64, kernel_size=(3, 3), activation="relu"),
    layers.MaxPooling2D(pool_size=(2, 2)),
    layers.Flatten(),
    layers.Dense(128, activation="relu"),
    layers.Dense(4, activation="linear")   # e.g. 4 possible actions
])

model.summary()
```

Mapping each line to what you now know:

- **`input_shape=(84, 84, 1)`** — height 84, width 84, 1 channel (grayscale; a color image would be 3 channels for RGB). This is the standard preprocessed size for Atari frames in many RL textbooks, including yours.
- **`Conv2D(32, kernel_size=(3, 3), ...)`** — 32 different kernels, each 3×3, each learned independently (Section 1). "32" means the layer produces 32 separate feature maps, each detecting something different, all from the same input.
- **`MaxPooling2D(pool_size=(2, 2))`** — shrinks each feature map by taking the max over non-overlapping 2×2 windows (Section 2).
- Stacking `Conv2D` → `MaxPooling2D` → `Conv2D` → `MaxPooling2D` — repeats the pattern, letting deeper layers combine simple features (edges) from earlier layers into more complex ones (shapes, then eventually recognizable objects like "the paddle" or "the ball").
- **`layers.Flatten()`** — after the convolutional layers, the data is still a 3D grid of numbers (height × width × feature-maps). `Flatten()` reshapes it into a single 1D vector (exactly the `.reshape()` operation from Lesson 2, just automated) — because the final `Dense` layers expect a flat vector input, not a grid.
- **`Dense(128, ...)` then `Dense(4, ...)`** — this is exactly Lesson 4's `Dense` stack. The convolutional layers extracted meaningful features from raw pixels; the `Dense` layers at the end do the same job they always do — combine those features into final output scores (here, 4 action scores, same role as Lesson 2's `action_scores`).

**The big picture:** a CNN for RL is just "convolutional layers to turn pixels into meaningful features" + "the same `Dense` network from Lesson 4 to turn those features into action scores." Nothing after `Flatten()` is new to you.

---

## 4. When do you actually need this?

Not every RL problem needs a CNN. CartPole's state is already a clean 4-number vector — a plain `Dense` network (Lesson 4) handles it fine, no convolution needed. CNNs matter specifically when the environment's observation *is* an image — classic Atari environments in Gym (Breakout, Pong, etc.) hand you raw pixel frames, and that's when the `Conv2D` approach above becomes necessary instead of optional. Your "Applied RL" book almost certainly introduces both cases — expect it to start with vector-state environments (simpler) before moving to pixel-based ones (where this lesson's material applies).

---

## 5. Complete runnable file

Save as `lesson_05_practice.py` and run with `python lesson_05_practice.py`.

```python
"""
Lesson 5 Practice: Convolution by hand, then a Keras CNN, mapped to RL pixel-input use cases
Run with: python lesson_05_practice.py
"""
import numpy as np
from tensorflow import keras
from tensorflow.keras import layers


def convolve_by_hand(image, kernel):
    """A plain-Python convolution, matching Section 1's by-hand walkthrough."""
    image_height, image_width = image.shape
    kernel_height, kernel_width = kernel.shape
    output_height = image_height - kernel_height + 1
    output_width = image_width - kernel_width + 1

    output = np.zeros((output_height, output_width))
    for row in range(output_height):
        for col in range(output_width):
            patch = image[row:row + kernel_height, col:col + kernel_width]
            output[row, col] = np.sum(patch * kernel)  # element-wise multiply, then sum = dot product
    return output


def demonstrate_convolution():
    print("--- Convolution by hand (Section 1) ---")
    image = np.array([
        [1, 2, 3, 0],
        [4, 5, 6, 1],
        [7, 8, 9, 2],
        [1, 2, 1, 0]
    ])
    kernel = np.array([
        [1, 0],
        [0, -1]
    ])
    feature_map = convolve_by_hand(image, kernel)
    print("Image:\n", image)
    print("Kernel:\n", kernel)
    print("Resulting feature map:\n", feature_map)
    print()
    return feature_map


def max_pool_by_hand(feature_map, pool_size=2):
    """Non-overlapping max pooling, matching Section 2."""
    height, width = feature_map.shape
    output_height = height // pool_size
    output_width = width // pool_size

    output = np.zeros((output_height, output_width))
    for row in range(output_height):
        for col in range(output_width):
            window = feature_map[
                row * pool_size:(row + 1) * pool_size,
                col * pool_size:(col + 1) * pool_size
            ]
            output[row, col] = np.max(window)
    return output


def demonstrate_pooling():
    print("--- Max pooling by hand (Section 2) ---")
    feature_map = np.array([
        [1, 3, 2, 4],
        [5, 6, 1, 0],
        [2, 1, 8, 3],
        [0, 4, 2, 1]
    ])
    pooled = max_pool_by_hand(feature_map, pool_size=2)
    print("Feature map:\n", feature_map)
    print("Pooled (2x2, stride 2):\n", pooled)
    print()


def build_cnn_for_atari_style_input():
    print("--- Building a Keras CNN (Section 3) ---")
    model = keras.Sequential([
        layers.Conv2D(32, kernel_size=(3, 3), activation="relu", input_shape=(84, 84, 1)),
        layers.MaxPooling2D(pool_size=(2, 2)),
        layers.Conv2D(64, kernel_size=(3, 3), activation="relu"),
        layers.MaxPooling2D(pool_size=(2, 2)),
        layers.Flatten(),
        layers.Dense(128, activation="relu"),
        layers.Dense(4, activation="linear")
    ])
    model.summary()
    print()
    return model


def run_one_fake_prediction(model):
    print("--- One prediction through the CNN ---")
    fake_frame = np.random.rand(1, 84, 84, 1)   # "batch of 1" - same pattern as Lesson 2/4
    action_scores = model.predict(fake_frame, verbose=0)
    print("Fake frame shape:", fake_frame.shape)
    print("Action scores:", action_scores)
    print("Chosen action (argmax, Lesson 2):", np.argmax(action_scores, axis=1)[0])


if __name__ == "__main__":
    demonstrate_convolution()
    demonstrate_pooling()
    model = build_cnn_for_atari_style_input()
    run_one_fake_prediction(model)
```

---

## 6. Challenges before Week 3

1. By hand, convolve this 3×3 image with a 2×2 kernel `[[0, 1], [1, 0]]`:
   ```
   [2, 1, 0]
   [3, 2, 1]
   [1, 0, 2]
   ```
   Then verify your answer with `convolve_by_hand`.
2. In `build_cnn_for_atari_style_input()`, work out by hand what shape the data has right *before* `Flatten()` is applied (hint: `model.summary()` shows you the output shape of every layer — use it to check your reasoning, not to skip the reasoning).
3. Change the input from grayscale `(84, 84, 1)` to color `(84, 84, 3)` and re-run `.summary()`. Which layer's parameter count changes, and why does it make sense that it's that one specifically?
4. Explain in your own words (one or two sentences) why pooling makes a CNN somewhat tolerant to a game object shifting a few pixels left or right — tie it back to what pooling actually keeps and what it throws away.

---

## Week 2 complete

You now understand what every layer in a Keras model — `Dense`, `Conv2D`, `MaxPooling2D`, `Flatten` — actually computes underneath the API, and when you need convolutions (pixel-input environments) versus when a plain `Dense` network is enough (clean state-vector environments like CartPole). Nothing here was API memorization without the math behind it.

## What's next

Week 3 shifts from deep learning to reinforcement learning itself: MDPs, the Bellman equation, and model-free methods (Q-learning, SARSA) built by hand in plain Python — before Gym or Keras enter the picture at all. This is deliberately the same "understand it by hand first" approach as Lessons 1 and 4.
