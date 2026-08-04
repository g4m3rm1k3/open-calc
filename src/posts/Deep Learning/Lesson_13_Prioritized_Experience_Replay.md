# Lesson 13 — Prioritized Experience Replay

**Track:** RL/Keras Mastery Arc — Week 6 (closing lesson)
**Depth:** Spaced repetition, one layer deeper — second touch on Lesson 9's replay buffer concept
**Goal by end of lesson:** You understand why sampling transitions uniformly at random (Lesson 9) leaves useful information on the table, how to prioritize "surprising" transitions instead, and why naive prioritization introduces a bias that has to be corrected — and how importance sampling corrects it.

---

## 0. Reconstructing Lesson 9's replay buffer, from memory first

Before reading on: what problem did the replay buffer solve (Lesson 9, Section 0.1 and Section 1)? What does `random.sample(replay_buffer, BATCH_SIZE)` do? If the answer is "breaks correlation between consecutive states, lets old and new experiences mix" — that's solid, and this lesson builds directly on it. If that's fuzzy, worth a quick look back at Lesson 9 Section 1 before continuing.

---

## 1. The problem with uniform sampling

Lesson 9's `sample_minibatch` treats every stored transition as equally worth training on:

```python
minibatch = random.sample(replay_buffer, BATCH_SIZE)
```

But not every transition is equally *informative*. Consider two kinds of transitions sitting in the buffer:

- A transition where the network's prediction was already very close to the computed target — the network already "understands" this situation well. Training on it again barely changes the weights.
- A transition where the network's prediction was way off from the target — the network is clearly wrong about this situation. Training on it has much more to teach the network.

Uniform sampling gives both kinds equal probability of being picked, which means a lot of training time gets spent re-training on transitions the network has already mostly mastered, while transitions carrying more learning signal get sampled no more often than anything else. **Prioritized Experience Replay (PER)** fixes this by sampling transitions with probability proportional to how "surprising" (wrong) the network currently is about them.

---

## 2. TD error — measuring "how surprising was this transition"

Recall the target calculation from Lesson 9, Section 3:

```python
target = reward + DISCOUNT_FACTOR * max(target_network.predict(next_state))
current_estimate = online_network.predict(state)[action]
```

The **TD error** (temporal difference error) is simply:

```
td_error = target - current_estimate
```

This is exactly the quantity gradient descent already uses (Lesson 10's `d(loss)/dz` is directly built from this same target-minus-estimate gap) — PER's whole idea is to *reuse* this existing, already-computed number as a priority score, rather than introduce something new. A large `|td_error|` means the network's current guess was way off — a high-priority, informative transition. A small `|td_error|` means the network already had it about right — lower priority.

---

## 3. Converting TD error into a sampling priority

```
priority = (|td_error| + small_constant) ^ alpha
```

- `|td_error|` — the absolute value, since being wrong in either direction (overestimate or underestimate) is equally informative.
- `small_constant` — a tiny positive number (e.g., `0.01`) added so that transitions with a TD error of exactly `0` still have *some* nonzero chance of being sampled, rather than being permanently excluded.
- `alpha` (a number between 0 and 1) — controls how strongly priority influences sampling. `alpha = 0` makes this identical to Lesson 9's uniform sampling (every priority becomes `1`, regardless of TD error) — a useful sanity check to hold onto. `alpha = 1` uses the priority at full strength. Values like `0.6` are common in practice — strong prioritization without going fully greedy toward only ever sampling the highest-error transitions.

Sampling probability for a given transition `i` becomes:

```
P(i) = priority_i / sum(all priorities in the buffer)
```

This is a weighted random sample — NumPy's `np.random.choice` supports this directly via its `p=` argument.

---

## 4. The bias this introduces, and importance sampling as the fix

Here's the subtlety that makes this lesson more than "just weight the sampling": by deliberately oversampling high-TD-error transitions, you've changed the training data's distribution away from what actually occurs during play. This is a real statistical bias — training disproportionately on "surprising" transitions can skew the network's learned values, since it's no longer seeing an honest reflection of how often each transition actually happens.

**Importance sampling (IS) weights** correct this: transitions that were sampled *more* often than they'd naturally occur get their gradient contribution scaled *down* during training, and rare-but-sampled transitions get scaled less. The weight for a sampled transition `i` is:

```
importance_weight_i = (1 / (buffer_size × P(i))) ^ beta
```

- `beta` (also between 0 and 1) controls how fully this correction is applied. `beta = 0` applies no correction at all (fully biased, prioritization runs unchecked). `beta = 1` applies the full statistical correction.
- **A standard practice**: start `beta` low (e.g., `0.4`) and anneal it up toward `1.0` over the course of training. The reasoning: early in training, the network's Q-values are mostly noise anyway, so the *unbiased-ness* of the updates matters less than just learning fast from whatever's most informative; later in training, as the network approaches convergence, correcting the bias matters more, so `beta` is increased toward full correction.

**The pattern to notice:** this beta-annealing schedule is structurally the same idea as epsilon-decay from Lesson 7, Section 5 — start biased toward one extreme (full exploration; or here, no bias-correction) and gradually shift toward the other (mostly exploitation; or here, full bias-correction) as training progresses. Different number, same underlying "start rough, refine over time" shape.

These `importance_weight` values get multiplied into the loss during training — in Keras, this is done via `model.fit(..., sample_weight=importance_weights)`, a parameter Lesson 4 and Lesson 9 never needed since every prior lesson trained with uniform weighting.

---

## 5. Complete runnable file — Prioritized Experience Replay on CartPole

Save as `lesson_13_practice.py` and run with `python lesson_13_practice.py`. This modifies Lesson 9's capstone — the network architecture and training loop structure are unchanged; the replay buffer and sampling/training step are what's new.

```python
"""
Lesson 13 Practice: Prioritized Experience Replay on CartPole, extending Lesson 9's DQN.
Run with: python lesson_13_practice.py
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

PRIORITY_ALPHA = 0.6          # Section 3 - how strongly TD error influences sampling
PRIORITY_EPSILON = 0.01       # Section 3 - small_constant, keeps all priorities nonzero
IS_BETA_START = 0.4           # Section 4 - importance sampling correction, annealed over training
IS_BETA_END = 1.0
IS_BETA_ANNEAL_STEPS = 10000


class PrioritizedReplayBuffer:
    """
    Section 3-4: stores transitions alongside a priority score, samples proportionally
    to priority, and computes importance-sampling weights to correct the resulting bias.
    """
    def __init__(self, max_size):
        self.buffer = deque(maxlen=max_size)
        self.priorities = deque(maxlen=max_size)

    def add(self, transition, td_error):
        priority = (abs(td_error) + PRIORITY_EPSILON) ** PRIORITY_ALPHA
        self.buffer.append(transition)
        self.priorities.append(priority)

    def sample(self, batch_size, beta):
        priorities_array = np.array(self.priorities)
        sampling_probabilities = priorities_array / np.sum(priorities_array)   # Section 3, P(i)

        indices = np.random.choice(len(self.buffer), size=batch_size, p=sampling_probabilities)
        transitions = [self.buffer[i] for i in indices]

        buffer_size = len(self.buffer)
        importance_weights = (buffer_size * sampling_probabilities[indices]) ** (-beta)  # Section 4
        importance_weights = importance_weights / np.max(importance_weights)   # normalize for stability

        return transitions, indices, importance_weights

    def update_priorities(self, indices, td_errors):
        for index, td_error in zip(indices, td_errors):
            self.priorities[index] = (abs(td_error) + PRIORITY_EPSILON) ** PRIORITY_ALPHA

    def __len__(self):
        return len(self.buffer)


def build_q_network(state_size, num_actions):
    model = keras.Sequential([
        layers.Dense(24, activation="relu", input_shape=(state_size,)),
        layers.Dense(24, activation="relu"),
        layers.Dense(num_actions, activation="linear")
    ])
    model.compile(optimizer=keras.optimizers.Adam(learning_rate=LEARNING_RATE), loss="mse")
    return model


def choose_epsilon_greedy_action(online_network, state, epsilon, num_actions):
    if random.random() < epsilon:
        return random.randrange(num_actions)
    q_values = online_network.predict(state.reshape(1, -1), verbose=0)[0]
    return int(np.argmax(q_values))


def compute_beta(total_steps):
    """Anneal beta from IS_BETA_START toward IS_BETA_END over IS_BETA_ANNEAL_STEPS (Section 4)."""
    fraction = min(1.0, total_steps / IS_BETA_ANNEAL_STEPS)
    return IS_BETA_START + fraction * (IS_BETA_END - IS_BETA_START)


def train_on_minibatch(online_network, target_network, replay_buffer, num_actions, total_steps):
    if len(replay_buffer) < BATCH_SIZE:
        return

    beta = compute_beta(total_steps)
    transitions, indices, importance_weights = replay_buffer.sample(BATCH_SIZE, beta)

    states = np.array([t[0] for t in transitions])
    actions = np.array([t[1] for t in transitions])
    rewards = np.array([t[2] for t in transitions])
    next_states = np.array([t[3] for t in transitions])
    dones = np.array([t[4] for t in transitions])

    current_q_values = online_network.predict(states, verbose=0)
    next_q_values = target_network.predict(next_states, verbose=0)

    new_td_errors = np.zeros(BATCH_SIZE)
    for i in range(BATCH_SIZE):
        if dones[i]:
            target = rewards[i]
        else:
            target = rewards[i] + DISCOUNT_FACTOR * np.max(next_q_values[i])

        old_estimate = current_q_values[i][actions[i]]
        new_td_errors[i] = target - old_estimate      # Section 2 - the TD error itself
        current_q_values[i][actions[i]] = target

    online_network.fit(states, current_q_values, epochs=1, verbose=0,
                        sample_weight=importance_weights)   # Section 4's correction, applied here

    replay_buffer.update_priorities(indices, new_td_errors)   # refresh priorities with the NEW error


def run_dqn_training():
    environment = gym.make("CartPole-v1")
    state_size = environment.observation_space.shape[0]
    num_actions = environment.action_space.n

    online_network = build_q_network(state_size, num_actions)
    target_network = build_q_network(state_size, num_actions)
    target_network.set_weights(online_network.get_weights())

    replay_buffer = PrioritizedReplayBuffer(REPLAY_BUFFER_SIZE)
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

            # New transitions are added with a high initial priority (max TD error is unknown yet,
            # so use a large placeholder to guarantee they get sampled at least once soon)
            initial_td_error = 1.0
            replay_buffer.add((state, action, reward, next_state, done), initial_td_error)

            episode_reward += reward
            state = next_state
            total_steps += 1

            train_on_minibatch(online_network, target_network, replay_buffer, num_actions, total_steps)

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
                  f"epsilon: {epsilon:.2f} | "
                  f"beta: {compute_beta(total_steps):.2f}")

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
    plt.title("Prioritized Experience Replay DQN on CartPole")
    plt.legend()
    plt.show()


if __name__ == "__main__":
    trained_network, episode_rewards = run_dqn_training()
    plot_training_curve(episode_rewards)
```

---

## 6. Challenges before Week 7

1. Set `PRIORITY_ALPHA = 0` and re-run. Per Section 3, this should make sampling behave identically to Lesson 9's uniform sampling. Verify this makes sense by checking what `(|td_error| + PRIORITY_EPSILON) ** 0` equals for any `td_error` value — why does that specific math guarantee uniform priorities?
2. Set `IS_BETA_START = IS_BETA_END = 0` (no importance sampling correction, ever) and compare training stability to the full version. Does removing the bias correction visibly hurt on CartPole, or is the effect subtle at this scale?
3. `update_priorities` refreshes a transition's priority using the *newly computed* TD error right after training on it. Explain in your own words why this matters — what would happen to a transition's priority over time if it were *never* updated after being added to the buffer, even as the network got better at predicting it?
4. The code uses a fixed `initial_td_error = 1.0` for brand-new transitions rather than computing a real TD error immediately. Why might giving new transitions a deliberately high initial priority be a reasonable design choice, rather than a shortcut being taken for convenience?

---

## Week 6 complete

You've now seen the same replay buffer concept from Lesson 9 revisited twice, each time one layer deeper — first as "why random sampling helps at all," now as "how to make sampling smarter without introducing bias." This progression (learn a mechanism, then learn a targeted refinement to that same mechanism) is the shape most of real RL research actually takes, and you can now recognize it as a pattern rather than memorizing each technique as an isolated fact.

## What's next

Week 7 shifts to the other major branch of RL — policy-based methods. Lesson 14 introduces Policy Gradients / REINFORCE, derived fully, and contrasted directly against everything value-based you've built in Weeks 3-4 and this week.
