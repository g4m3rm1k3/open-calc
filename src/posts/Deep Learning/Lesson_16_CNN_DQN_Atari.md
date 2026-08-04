# Lesson 16 — CNN-DQN on a Real Pixel Environment

**Track:** RL/Keras Mastery Arc — Week 8 (opener)
**Depth:** Heavy on preprocessing and practical concerns; light on new algorithmic ideas (the DQN loop itself is unchanged from Lessons 9/12/13)
**Goal by end of lesson:** You can preprocess raw Atari-style frames into something a CNN can learn from, understand why a single frame isn't enough information (and how frame-stacking fixes that), and run a real CNN-DQN agent — with honest expectations about training time at this scale.

---

## 0. What's actually new here, and what isn't

The DQN algorithm itself — replay buffer, target network, epsilon-greedy, the Bellman-style target calculation — is **completely unchanged** from Lesson 9 (or Lesson 12/13, if you want to combine this with Double/Dueling/Prioritized replay, which is a natural extension exercise). What's new is entirely about the *input*: going from CartPole's clean 4-number vector to raw pixels, which requires real preprocessing before a network can use it usefully, plus one new problem — a single frame doesn't show motion.

---

## 1. Setup — installing an Atari environment

```
pip install "gymnasium[atari,accept-rom-license]"
```

```python
import gymnasium as gym

environment = gym.make("ALE/Breakout-v5")
print(environment.observation_space)   # Box(210, 160, 3) - a raw RGB image
print(environment.action_space)        # Discrete(4) - 4 possible actions
```

`Box(210, 160, 3)` — a 210×160 pixel image, 3 color channels (RGB). Compare to Lesson 8's CartPole `Box(4,)` — this is a dramatically higher-dimensional observation, exactly the kind of state Lesson 8, Section 2 argued a Q-*table* could never handle, and exactly what motivated Lesson 5's `Conv2D` material in the first place.

---

## 2. Preprocessing — turning a raw frame into something learnable

Raw Atari frames are larger and more detailed than needed, and color is rarely useful signal for gameplay. Standard preprocessing, in order:

### 2.1 Grayscale conversion

```python
import numpy as np

def to_grayscale(frame):
    # Standard luminance-weighted grayscale conversion (matches how human vision weights color)
    return np.dot(frame[..., :3], [0.299, 0.587, 0.114])
```

This collapses the 3 color channels into 1, cutting the data size by two-thirds with minimal loss of useful gameplay information for most Atari games.

### 2.2 Resizing to 84×84

```python
from PIL import Image

def resize_frame(frame, size=(84, 84)):
    image = Image.fromarray(frame.astype(np.uint8))
    resized = image.resize(size)
    return np.array(resized)
```

84×84 is the standard size used in the original DQN paper and most implementations since — small enough to keep the network fast to train, large enough to preserve the visual detail that matters for gameplay. This is exactly the `(84, 84, 1)` shape Lesson 5, Section 3 used in its example CNN, now finally connected to where that number actually came from.

### 2.3 Normalization

```python
def normalize_frame(frame):
    return frame / 255.0   # pixel values go from [0, 255] to [0.0, 1.0]
```

Same reasoning as Lesson 4's training stability discussion — neural networks generally train better on inputs in a small, consistent numeric range rather than raw `0-255` integers.

---

## 3. The motion problem — why one frame isn't enough

Look at a single static Breakout frame: a ball, a paddle, some bricks. **You cannot tell which direction the ball is moving from one frame alone** — and the ball's direction is critical information for choosing a good action. This is a direct violation of the Markov property from Lesson 6, Section 1: a single frame does *not* contain everything relevant for deciding what happens next, because velocity information is missing entirely.

### 3.1 The fix — stack the last 4 frames as channels

Instead of feeding the network one frame, stack the last 4 consecutive (preprocessed) frames together as separate channels: input shape becomes `(84, 84, 4)` instead of `(84, 84, 1)`. Comparing pixel positions across the 4 stacked frames gives the network implicit access to motion — the CNN's early convolutional layers can learn to detect "this pixel pattern shifted between frame 1 and frame 4" the same way they learn to detect edges, since a moving ball produces a distinctive different-across-channels pattern that a stationary background doesn't.

```python
from collections import deque
import numpy as np

class FrameStacker:
    """Maintains the last 4 preprocessed frames, stacked as channels."""
    def __init__(self, stack_size=4):
        self.stack_size = stack_size
        self.frames = deque(maxlen=stack_size)

    def reset(self, initial_frame):
        for _ in range(self.stack_size):
            self.frames.append(initial_frame)   # fill with copies of the first frame
        return self._get_stacked_state()

    def add_frame(self, new_frame):
        self.frames.append(new_frame)
        return self._get_stacked_state()

    def _get_stacked_state(self):
        return np.stack(self.frames, axis=-1)   # shape becomes (84, 84, 4)
```

This is Lesson 6's Markov-property discussion, made concrete: rather than redefining what "the state" fundamentally is, frame-stacking is an engineering fix that reconstructs enough history to approximately restore the Markov property that a single raw frame violates.

---

## 4. The CNN architecture — Lesson 5's material, finally used for real

```python
from tensorflow import keras
from tensorflow.keras import layers

def build_cnn_q_network(num_actions):
    model = keras.Sequential([
        layers.Conv2D(32, kernel_size=(8, 8), strides=4, activation="relu", input_shape=(84, 84, 4)),
        layers.Conv2D(64, kernel_size=(4, 4), strides=2, activation="relu"),
        layers.Conv2D(64, kernel_size=(3, 3), strides=1, activation="relu"),
        layers.Flatten(),
        layers.Dense(512, activation="relu"),
        layers.Dense(num_actions, activation="linear")
    ])
    model.compile(optimizer=keras.optimizers.Adam(learning_rate=0.00025), loss="mse")
    return model
```

Compare to Lesson 5, Section 3's toy example — same structural pattern (`Conv2D` stack → `Flatten` → `Dense` stack), but with `strides` now specified explicitly. **Stride** controls how far the kernel jumps between positions (Lesson 5, Section 1 implicitly used stride 1 — sliding one pixel at a time). A stride of `4` on the first layer means the kernel jumps 4 pixels at a time instead of 1, which shrinks the output faster than pooling would and is a standard choice in real Atari-DQN architectures for keeping computation manageable on a genuinely large input.

`input_shape=(84, 84, 4)` — the `4` is the stacked-frames channel dimension from Section 3.1, not color channels (grayscale already collapsed color to 1, then frame-stacking replaced that dimension with 4 stacked timesteps instead).

---

## 5. Honest expectations about training time

This is worth stating plainly rather than glossing over: a CartPole DQN agent (Lesson 9) trains to reasonable performance in minutes on an ordinary laptop CPU. **A real Atari DQN agent typically takes many hours to days of training, often benefiting significantly from a GPU**, to reach strong performance — the original DQN paper trained for millions of frames per game. The code below is fully correct and will genuinely learn, but running it for only a few dozen episodes (as is practical to actually do while working through this lesson) will show the *mechanism* working — preprocessing, frame-stacking, the CNN processing real pixel input, replay buffer filling with image data — without necessarily producing a strong player in that short a run. That's a completely reasonable, expected outcome at this stage; treat a short run as confirming the pipeline works correctly, not as a performance benchmark.

---

## 6. Complete runnable file — CNN-DQN on Breakout (short demonstration run)

Save as `lesson_16_practice.py` and run with `python lesson_16_practice.py`. Requires `pip install "gymnasium[atari,accept-rom-license]" pillow`. This uses a deliberately small `NUM_EPISODES` to keep the demonstration run practical — see Section 5.

```python
"""
Lesson 16 Practice: CNN-DQN on a real Atari-style environment (Breakout).
Run with: python lesson_16_practice.py
(Requires: pip install "gymnasium[atari,accept-rom-license]" pillow)
NOTE: this is a short demonstration run (Section 5) - it confirms the pipeline
works correctly, not a claim of strong gameplay performance in this few episodes.
"""
import random
from collections import deque

import numpy as np
import gymnasium as gym
from PIL import Image
from tensorflow import keras
from tensorflow.keras import layers

DISCOUNT_FACTOR = 0.99
LEARNING_RATE = 0.00025
REPLAY_BUFFER_SIZE = 2000     # kept small deliberately - image states use much more memory than CartPole's vectors
BATCH_SIZE = 32
TARGET_SYNC_EVERY_STEPS = 500
NUM_EPISODES = 20             # Section 5 - a short demonstration run, not a full training regimen
MAX_STEPS_PER_EPISODE = 1000
STARTING_EPSILON = 1.0
MIN_EPSILON = 0.1
EPSILON_DECAY = 0.98


def preprocess_frame(frame):
    """Section 2: grayscale, resize, normalize."""
    grayscale = np.dot(frame[..., :3], [0.299, 0.587, 0.114])
    image = Image.fromarray(grayscale.astype(np.uint8))
    resized = np.array(image.resize((84, 84)))
    normalized = resized / 255.0
    return normalized


class FrameStacker:
    """Section 3.1: maintains the last 4 frames, stacked as channels."""
    def __init__(self, stack_size=4):
        self.stack_size = stack_size
        self.frames = deque(maxlen=stack_size)

    def reset(self, initial_frame):
        for _ in range(self.stack_size):
            self.frames.append(initial_frame)
        return self._get_stacked_state()

    def add_frame(self, new_frame):
        self.frames.append(new_frame)
        return self._get_stacked_state()

    def _get_stacked_state(self):
        return np.stack(self.frames, axis=-1)


def build_cnn_q_network(num_actions):
    """Section 4."""
    model = keras.Sequential([
        layers.Conv2D(32, kernel_size=(8, 8), strides=4, activation="relu", input_shape=(84, 84, 4)),
        layers.Conv2D(64, kernel_size=(4, 4), strides=2, activation="relu"),
        layers.Conv2D(64, kernel_size=(3, 3), strides=1, activation="relu"),
        layers.Flatten(),
        layers.Dense(512, activation="relu"),
        layers.Dense(num_actions, activation="linear")
    ])
    model.compile(optimizer=keras.optimizers.Adam(learning_rate=LEARNING_RATE), loss="mse")
    return model


def choose_epsilon_greedy_action(online_network, stacked_state, epsilon, num_actions):
    if random.random() < epsilon:
        return random.randrange(num_actions)
    q_values = online_network.predict(stacked_state[np.newaxis, ...], verbose=0)[0]
    return int(np.argmax(q_values))


def train_on_minibatch(online_network, target_network, replay_buffer):
    """Same Lesson 9 DQN update - unchanged algorithmically, just image-shaped inputs now."""
    if len(replay_buffer) < BATCH_SIZE:
        return

    minibatch = random.sample(replay_buffer, BATCH_SIZE)
    states = np.array([t[0] for t in minibatch])
    actions = np.array([t[1] for t in minibatch])
    rewards = np.array([t[2] for t in minibatch])
    next_states = np.array([t[3] for t in minibatch])
    dones = np.array([t[4] for t in minibatch])

    current_q_values = online_network.predict(states, verbose=0)
    next_q_values = target_network.predict(next_states, verbose=0)

    for i in range(BATCH_SIZE):
        if dones[i]:
            target = rewards[i]
        else:
            target = rewards[i] + DISCOUNT_FACTOR * np.max(next_q_values[i])
        current_q_values[i][actions[i]] = target

    online_network.fit(states, current_q_values, epochs=1, verbose=0)


def run_cnn_dqn_training():
    environment = gym.make("ALE/Breakout-v5")
    num_actions = environment.action_space.n

    online_network = build_cnn_q_network(num_actions)
    target_network = build_cnn_q_network(num_actions)
    target_network.set_weights(online_network.get_weights())

    replay_buffer = deque(maxlen=REPLAY_BUFFER_SIZE)
    frame_stacker = FrameStacker(stack_size=4)
    epsilon = STARTING_EPSILON
    total_steps = 0
    episode_rewards = []

    for episode in range(NUM_EPISODES):
        raw_frame, info = environment.reset()
        state = frame_stacker.reset(preprocess_frame(raw_frame))
        episode_reward = 0

        for step in range(MAX_STEPS_PER_EPISODE):
            action = choose_epsilon_greedy_action(online_network, state, epsilon, num_actions)
            raw_next_frame, reward, terminated, truncated, info = environment.step(action)
            done = terminated or truncated

            next_state = frame_stacker.add_frame(preprocess_frame(raw_next_frame))
            replay_buffer.append((state, action, reward, next_state, done))

            episode_reward += reward
            state = next_state
            total_steps += 1

            train_on_minibatch(online_network, target_network, replay_buffer)

            if total_steps % TARGET_SYNC_EVERY_STEPS == 0:
                target_network.set_weights(online_network.get_weights())

            if done:
                break

        epsilon = max(MIN_EPSILON, epsilon * EPSILON_DECAY)
        episode_rewards.append(episode_reward)
        print(f"Episode {episode + 1}/{NUM_EPISODES} | reward: {episode_reward:.0f} | epsilon: {epsilon:.2f}")

    environment.close()
    return online_network, episode_rewards


if __name__ == "__main__":
    print("--- Preprocessing pipeline check (Section 2) ---")
    dummy_frame = np.random.randint(0, 255, size=(210, 160, 3), dtype=np.uint8)
    processed = preprocess_frame(dummy_frame)
    print("Raw frame shape:", dummy_frame.shape, "-> Processed shape:", processed.shape,
          "-> Value range:", processed.min(), "to", processed.max())
    print()

    print("--- Running short CNN-DQN demonstration on Breakout (Section 5) ---")
    trained_network, episode_rewards = run_cnn_dqn_training()
    print("\nEpisode rewards:", episode_rewards)
    print("(A short run like this demonstrates the pipeline works - real Atari performance needs far more training.)")
```

---

## 7. Challenges before Lesson 17

1. Run the preprocessing check at the top of the file on a real frame captured from `environment.reset()` instead of a random dummy array — confirm the shape and value range match expectations.
2. `REPLAY_BUFFER_SIZE` is set to `2000` here, dramatically smaller than Lesson 9's `10000` for CartPole. Compute roughly how much memory one stacked state takes (`84 × 84 × 4` numbers, each a Python float) versus one CartPole state (`4` numbers), and explain why this buffer size difference is a deliberate, necessary tradeoff rather than an oversight.
3. Try `stack_size=2` instead of `4` in `FrameStacker`. Does 2 frames still meaningfully capture motion, or does this feel like a meaningfully worse approximation of velocity than 4? Reason about this before running anything, then reflect on whether your intuition matches once you do.
4. In your own words: why does frame-stacking address the Markov-property violation from Section 3, while simply making the CNN bigger or deeper (without stacking frames) would not fix the same problem? (Hint: think about what information is actually *present* in the input in each case, not just about network capacity.)

---

## What's next

Lesson 17 closes the series's technical content: Dash, for building a live-updating dashboard that visualizes an agent training in real time — the first lesson in this whole series focused on presenting your work rather than building the agent itself.
