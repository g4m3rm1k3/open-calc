# Lesson 12 — Double DQN and Dueling DQN

**Track:** RL/Keras Mastery Arc — Week 6 (opener)
**Depth:** Heavy on the "why," light on new code — these are small, precise deltas on Lesson 9's DQN, not new algorithms from scratch
**Goal by end of lesson:** You can name the exact weakness in vanilla DQN that each of these two variants fixes, derive why the fix works, and modify Lesson 9's capstone code to implement both.

---

## 0. The shape of this lesson

Unlike most lessons so far, this one isn't introducing a new mental model — it's taking vanilla DQN (Lesson 9), identifying two specific, well-documented flaws in it, and applying one targeted change each. If Lesson 9 is genuinely solid for you, this lesson should feel like "oh, that's a clever small fix" rather than "here's a wall of new material." That's intentional — this is what real progress in ML research usually looks like: incremental, motivated improvements on a working baseline, not wholesale reinvention.

---

## 1. Double DQN — fixing overestimation bias

### 1.1 The problem, precisely

Recall Lesson 9's target calculation:

```python
target = rewards[i] + DISCOUNT_FACTOR * np.max(next_q_values[i])
```

`next_q_values` comes from the target network. The `max` here does two jobs at once: it **selects** which action looks best at the next state, *and* it **evaluates** how good that action actually is — using the same network's own (possibly noisy/wrong) estimate for both jobs.

Here's the issue: Q-value estimates always have some error — sometimes the network overestimates a given action's value, sometimes it underestimates. Because `max` specifically picks out the *highest* value among several noisy estimates, and noise can push any one estimate up as easily as down, `max` systematically tends to pick out an inflated estimate more often than a deflated one — not because the action is actually best, but because *its noise happened to point up*. This is a well-documented, statistically real bias, not a hypothetical concern: vanilla DQN's Q-value estimates tend to run consistently higher than the true values.

### 1.2 The fix — decouple selection from evaluation

Double DQN's change: use the **online network** to *select* which action looks best at the next state, but use the **target network** to *evaluate* how good that specific action is.

```python
# Vanilla DQN (Lesson 9):
target = rewards[i] + DISCOUNT_FACTOR * np.max(next_q_values[i])   # target network does both jobs

# Double DQN:
best_next_action = np.argmax(online_next_q_values[i])               # ONLINE network selects
target = rewards[i] + DISCOUNT_FACTOR * target_next_q_values[i][best_next_action]  # TARGET network evaluates
```

**Why this helps:** the online and target networks have different weights (the target network's are a stale snapshot, Lesson 9 Section 2) and therefore somewhat different noise patterns. If the online network's selection is inflated due to its own noise, it's much less likely that the target network's independent estimate for that *same* action is *also* inflated in the same direction — decoupling the two roles breaks the systematic upward bias from Section 1.1. This is a small code change with real, measured impact on training stability in the RL literature.

---

## 2. Dueling DQN — decomposing Q into value and advantage

### 2.1 The problem, precisely

Vanilla DQN's network outputs `Q(s, a)` for each action directly, with a single shared set of hidden layers underneath. But think about what `Q(s, a)` actually represents: "how good is this state overall" (which doesn't depend on which action you're considering) combined with "how much better is this particular action than the others, from this state" (which does). Vanilla DQN's architecture doesn't separate these — it re-learns "how good is this state" redundantly, once per action, inside every single Q-value output, instead of learning it once and sharing it.

This matters most in states where the action barely matters (e.g., a CartPole state where the pole is nearly perfectly balanced — pushing left or right briefly makes little difference) — vanilla DQN still has to learn separate, nearly-identical Q-values for each action in that state, which is wasted capacity.

### 2.2 The fix — split into two streams, then recombine

Dueling DQN splits the network into two output streams after the shared hidden layers:

- **Value stream, `V(s)`** — one single number: how good is this state overall, regardless of action.
- **Advantage stream, `A(s, a)`** — one number per action: how much better (or worse) is this specific action than the average action, from this state.

Then recombine them into Q-values:

```
Q(s, a) = V(s) + (A(s, a) - mean(A(s, all actions)))
```

The `- mean(A(s, all actions))` term is a normalization trick — without it, the split into `V` and `A` would be mathematically ambiguous (infinitely many `V`/`A` combinations could produce the same `Q`, which makes training unstable). Subtracting the mean advantage forces a unique, well-behaved decomposition: it makes the *average* advantage across actions equal to zero, so `V(s)` is forced to actually mean "the state's baseline value," not some arbitrary shifted number entangled with the advantages.

### 2.3 Building this in Keras — the Functional API

Lesson 4 only used `Sequential`, which can't branch into two streams. This needs Keras's **Functional API**, which lets you explicitly wire layers together instead of just stacking them:

```python
from tensorflow import keras
from tensorflow.keras import layers

def build_dueling_q_network(state_size, num_actions):
    inputs = keras.Input(shape=(state_size,))

    shared = layers.Dense(24, activation="relu")(inputs)
    shared = layers.Dense(24, activation="relu")(shared)

    value_stream = layers.Dense(1, activation="linear")(shared)                  # V(s) - one number
    advantage_stream = layers.Dense(num_actions, activation="linear")(shared)    # A(s, a) - one per action

    mean_advantage = layers.Lambda(
        lambda a: a - keras.ops.mean(a, axis=1, keepdims=True)
    )(advantage_stream)

    q_values = layers.Add()([value_stream, mean_advantage])   # broadcasting V(s) across all actions

    model = keras.Model(inputs=inputs, outputs=q_values)
    model.compile(optimizer=keras.optimizers.Adam(learning_rate=0.001), loss="mse")
    return model
```

Reading the Functional API syntax: instead of `Sequential([...])` implicitly chaining layers, each layer is called directly on its input, like `layers.Dense(24, activation="relu")(inputs)` — this returns the *output tensor* of that layer, which you then feed into the next layer call. This is exactly what lets `shared` feed into *two separate* subsequent layers (`value_stream` and `advantage_stream`) instead of just one — something a `Sequential` stack structurally cannot do.

`layers.Add()([value_stream, mean_advantage])` adds `V(s)` (shape `(batch, 1)`) to `mean_advantage` (shape `(batch, num_actions)`) — this relies on the same broadcasting rule from Lesson 1, Section 5.6, stretching the single value across every action.

---

## 3. Both fixes are independent and combine cleanly

Nothing about Double DQN (Section 1) depends on Dueling DQN's architecture (Section 2), and vice versa — you can apply either alone, or both together, on top of Lesson 9's training loop. The full runnable file below does both, since the changes don't interact.

---

## 4. Complete runnable file — Double + Dueling DQN on CartPole

Save as `lesson_12_practice.py` and run with `python lesson_12_practice.py`. This modifies Lesson 9's capstone — the training loop (`run_dqn_training`, replay buffer, epsilon-greedy) is unchanged; only `build_q_network` and `train_on_minibatch` differ.

```python
"""
Lesson 12 Practice: Double DQN + Dueling DQN on CartPole - targeted fixes to Lesson 9's vanilla DQN.
Run with: python lesson_12_practice.py
(Requires: pip install gymnasium)
"""
import random
from collections import deque

import numpy as np
import gymnasium as gym
import matplotlib.pyplot as plt
from tensorflow import keras
from tensorflow.keras import layers

DISCOUNT_FACTOR = 0.95
LEARNING_RATE = 0.001
REPLAY_BUFFER_SIZE = 10000
BATCH_SIZE = 32
TARGET_SYNC_EVERY_STEPS = 200
NUM_EPISODES = 150
MAX_STEPS_PER_EPISODE = 200
STARTING_EPSILON = 1.0
MIN_EPSILON = 0.05
EPSILON_DECAY = 0.995


def build_dueling_q_network(state_size, num_actions):
    """Section 2.3 - the Functional API, splitting into value and advantage streams."""
    inputs = keras.Input(shape=(state_size,))

    shared = layers.Dense(24, activation="relu")(inputs)
    shared = layers.Dense(24, activation="relu")(shared)

    value_stream = layers.Dense(1, activation="linear")(shared)
    advantage_stream = layers.Dense(num_actions, activation="linear")(shared)

    mean_advantage = layers.Lambda(
        lambda a: a - keras.ops.mean(a, axis=1, keepdims=True)
    )(advantage_stream)

    q_values = layers.Add()([value_stream, mean_advantage])

    model = keras.Model(inputs=inputs, outputs=q_values)
    model.compile(optimizer=keras.optimizers.Adam(learning_rate=LEARNING_RATE), loss="mse")
    return model


def choose_epsilon_greedy_action(online_network, state, epsilon, num_actions):
    if random.random() < epsilon:
        return random.randrange(num_actions)
    q_values = online_network.predict(state.reshape(1, -1), verbose=0)[0]
    return int(np.argmax(q_values))


def train_on_minibatch(online_network, target_network, replay_buffer, num_actions):
    """Section 1.2 - Double DQN's select-with-online, evaluate-with-target split."""
    if len(replay_buffer) < BATCH_SIZE:
        return

    minibatch = random.sample(replay_buffer, BATCH_SIZE)
    states = np.array([transition[0] for transition in minibatch])
    actions = np.array([transition[1] for transition in minibatch])
    rewards = np.array([transition[2] for transition in minibatch])
    next_states = np.array([transition[3] for transition in minibatch])
    dones = np.array([transition[4] for transition in minibatch])

    current_q_values = online_network.predict(states, verbose=0)
    online_next_q_values = online_network.predict(next_states, verbose=0)     # for SELECTION
    target_next_q_values = target_network.predict(next_states, verbose=0)     # for EVALUATION

    for i in range(BATCH_SIZE):
        if dones[i]:
            target = rewards[i]
        else:
            best_next_action = np.argmax(online_next_q_values[i])                       # online selects
            target = rewards[i] + DISCOUNT_FACTOR * target_next_q_values[i][best_next_action]  # target evaluates
        current_q_values[i][actions[i]] = target

    online_network.fit(states, current_q_values, epochs=1, verbose=0)


def run_dqn_training():
    environment = gym.make("CartPole-v1")
    state_size = environment.observation_space.shape[0]
    num_actions = environment.action_space.n

    online_network = build_dueling_q_network(state_size, num_actions)
    target_network = build_dueling_q_network(state_size, num_actions)
    target_network.set_weights(online_network.get_weights())

    replay_buffer = deque(maxlen=REPLAY_BUFFER_SIZE)
    epsilon = STARTING_EPSILON
    total_steps = 0
    episode_rewards = []

    for episode in range(NUM_EPISODES):
        state, info = environment.reset()
        episode_reward = 0

        for step in range(MAX_STEPS_PER_EPISODE):
            action = choose_epsilon_greedy_action(online_network, state, epsilon, num_actions)
            next_state, reward, terminated, truncated, info = environment.step(action)
            done = terminated or truncated

            replay_buffer.append((state, action, reward, next_state, done))
            episode_reward += reward
            state = next_state
            total_steps += 1

            train_on_minibatch(online_network, target_network, replay_buffer, num_actions)

            if total_steps % TARGET_SYNC_EVERY_STEPS == 0:
                target_network.set_weights(online_network.get_weights())

            if done:
                break

        epsilon = max(MIN_EPSILON, epsilon * EPSILON_DECAY)
        episode_rewards.append(episode_reward)

        if (episode + 1) % 10 == 0:
            recent_average = np.mean(episode_rewards[-10:])
            print(f"Episode {episode + 1}/{NUM_EPISODES} | "
                  f"reward: {episode_reward:.0f} | "
                  f"last-10 avg: {recent_average:.1f} | "
                  f"epsilon: {epsilon:.2f}")

    environment.close()
    return online_network, episode_rewards


def plot_training_curve(episode_rewards):
    def rolling_average(values, window_size):
        result = []
        for i in range(len(values)):
            start_index = max(0, i - window_size + 1)
            result.append(np.mean(values[start_index:i + 1]))
        return result

    smoothed = rolling_average(episode_rewards, window_size=10)
    plt.plot(episode_rewards, label="Raw reward", alpha=0.4)
    plt.plot(smoothed, label="Rolling average (window=10)", linewidth=2)
    plt.xlabel("Episode")
    plt.ylabel("Total Reward")
    plt.title("Double + Dueling DQN on CartPole")
    plt.legend()
    plt.show()


if __name__ == "__main__":
    trained_network, episode_rewards = run_dqn_training()
    plot_training_curve(episode_rewards)
```

---

## 5. Challenges before Lesson 13

1. Revert just the Double DQN change — go back to `target = rewards[i] + DISCOUNT_FACTOR * np.max(target_next_q_values[i])` (target network doing both selection and evaluation, vanilla-style) while keeping the dueling architecture. Compare training curves. Does removing just this one piece noticeably change anything on CartPole specifically? (CartPole is small enough that overestimation bias may or may not show up dramatically — this is worth observing honestly rather than assuming the fix must visibly help on every environment.)
2. Print `value_stream`'s output and `advantage_stream`'s output separately for a few sample states (you'll need to build small helper models with `keras.Model(inputs=inputs, outputs=value_stream)` to inspect intermediate layers) — do the advantage values look small and centered near zero, consistent with Section 2.2's mean-subtraction reasoning?
3. Explain, in your own words, why `layers.Add()([value_stream, mean_advantage])` needs broadcasting to work — tie this explicitly back to Lesson 1, Section 5.6.
4. Try building the Dueling network using `Sequential` instead of the Functional API, to confirm for yourself that it's genuinely not possible with a linear stack — what specifically about `Sequential`'s structure blocks it?

---

## What's next

Lesson 13 closes Week 6, revisiting Lesson 9's replay buffer with **prioritized experience replay** — sampling important transitions more often instead of uniformly at random, the second spaced-repetition touch on that same concept.
