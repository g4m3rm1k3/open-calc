# Capstone — A Fully Understood DQN Agent, End to End

**Track:** RL/Keras Class Prep — Capstone (Week 4, closing)
**Depth:** Consolidation — no new concepts, only new confidence that every line traces back to something you built
**Goal:** Run one complete DQN agent on CartPole where every single piece is labeled with which lesson it came from. Nothing here should be a surprise. If any line *does* feel unclear, that's the one worth re-reading in its source lesson before calling this series finished.

---

## 0. What this file is, and isn't

This isn't new material. Lesson 9's practice file already *was* a complete working DQN agent. This capstone is the same core algorithm, reorganized and heavily annotated so you can trace every function back to the lesson that taught it, plus a couple of small additions (saving the trained model, a cleaner final evaluation run) that round it out into something you'd actually be comfortable turning in or building on for your class.

---

## 1. The concept map — one line each, one lesson each

Before the code, the full dependency chain, compressed:

| Concept | Lesson |
|---|---|
| A vector is an ordered list of numbers; a state is a vector | Lesson 1 |
| `inputs @ weight_matrix + bias_vector` is what a layer computes | Lesson 1 |
| `reshape` for batching a single input; `argmax` for choosing the best action | Lesson 2 |
| Plotting raw + rolling-average reward curves | Lesson 3 |
| `Dense` layers, `compile`, `fit`, overfitting vs. underfitting | Lesson 4 |
| `Conv2D`/pooling for pixel-input environments (not needed for CartPole, but why it exists) | Lesson 5 |
| MDPs, the Bellman equation, value iteration | Lesson 6 |
| Q-learning's update rule, SARSA, epsilon-greedy exploration | Lesson 7 |
| Gym's `reset()`/`step()` interface; why tabular Q-learning can't scale to continuous states | Lesson 8 |
| Swapping the Q-table for a network; experience replay; target network | Lesson 9 |

If you can look at any row above and explain it out loud without checking back, that concept is solid. If not, that's exactly where to spend remaining prep time before class starts, rather than re-reading everything uniformly.

---

## 2. The complete, annotated capstone file

Save as `capstone_dqn_cartpole.py` and run with `python capstone_dqn_cartpole.py`. Requires `pip install gymnasium`.

```python
"""
Capstone: A complete, fully-understood DQN agent on CartPole.
Every function is labeled with the lesson its core idea came from.
Run with: python capstone_dqn_cartpole.py
"""
import random
from collections import deque

import numpy as np
import gymnasium as gym
import matplotlib.pyplot as plt
from tensorflow import keras
from tensorflow.keras import layers

# --- Hyperparameters ---
DISCOUNT_FACTOR = 0.95        # gamma - Lesson 6, Section 3
LEARNING_RATE = 0.001         # Lesson 4, Section 3 (the optimizer's step size)
REPLAY_BUFFER_SIZE = 10000    # Lesson 9, Section 1
BATCH_SIZE = 32               # Lesson 4, Section 4 - same batching concept, applied to replay samples
TARGET_SYNC_EVERY_STEPS = 200 # Lesson 9, Section 2
NUM_EPISODES = 150
MAX_STEPS_PER_EPISODE = 200
STARTING_EPSILON = 1.0        # Lesson 7, Section 5
MIN_EPSILON = 0.05
EPSILON_DECAY = 0.995


def build_q_network(state_size, num_actions):
    """
    Lesson 4: a Dense network, structurally identical to your from-scratch neuron,
    just stacked and trained by Keras instead of by hand.
    Output layer has one value per action (Lesson 2's action_scores idea) -
    this network approximates Q(s, a) for every action a, given state s (Lesson 9, Section 0).
    """
    model = keras.Sequential([
        layers.Dense(24, activation="relu", input_shape=(state_size,)),
        layers.Dense(24, activation="relu"),
        layers.Dense(num_actions, activation="linear")
    ])
    model.compile(optimizer=keras.optimizers.Adam(learning_rate=LEARNING_RATE), loss="mse")
    return model


def choose_epsilon_greedy_action(online_network, state, epsilon, num_actions):
    """
    Lesson 7, Section 5: explore randomly with probability epsilon, otherwise
    exploit the network's current best guess.
    Lesson 2: reshape into a batch-of-one before predicting; argmax to pick the best action.
    """
    if random.random() < epsilon:
        return random.randrange(num_actions)
    q_values = online_network.predict(state.reshape(1, -1), verbose=0)[0]
    return int(np.argmax(q_values))


def train_on_minibatch(online_network, target_network, replay_buffer, num_actions):
    """
    Lesson 9, Sections 1-3: sample a random minibatch (breaks correlated-data problem),
    compute targets using the FROZEN target network (breaks moving-target problem),
    and update only the Q-value entry for the action actually taken.
    This is Lesson 7's Q-learning update rule, generalized from a table to a network:
        Q(s,a) <- Q(s,a) + alpha * [R + gamma * max(Q(s', .)) - Q(s,a)]
    Here, model.fit()'s gradient descent plays the role of the "alpha * [...]" adjustment.
    """
    if len(replay_buffer) < BATCH_SIZE:
        return

    minibatch = random.sample(replay_buffer, BATCH_SIZE)
    states = np.array([transition[0] for transition in minibatch])
    actions = np.array([transition[1] for transition in minibatch])
    rewards = np.array([transition[2] for transition in minibatch])
    next_states = np.array([transition[3] for transition in minibatch])
    dones = np.array([transition[4] for transition in minibatch])

    current_q_values = online_network.predict(states, verbose=0)
    next_q_values = target_network.predict(next_states, verbose=0)

    for i in range(BATCH_SIZE):
        if dones[i]:
            # Lesson 6: terminal states have no future to bootstrap from - reward is the whole answer.
            target = rewards[i]
        else:
            # Lesson 6's Bellman equation, Lesson 7's "max over next actions" (off-policy, Q-learning-style)
            target = rewards[i] + DISCOUNT_FACTOR * np.max(next_q_values[i])
        current_q_values[i][actions[i]] = target

    online_network.fit(states, current_q_values, epochs=1, verbose=0)


def run_dqn_training():
    """
    The full loop from Lesson 9, Section 4, using Lesson 8's real Gym environment.
    """
    environment = gym.make("CartPole-v1")
    state_size = environment.observation_space.shape[0]   # Lesson 8, Section 1.1
    num_actions = environment.action_space.n

    online_network = build_q_network(state_size, num_actions)
    target_network = build_q_network(state_size, num_actions)
    target_network.set_weights(online_network.get_weights())

    replay_buffer = deque(maxlen=REPLAY_BUFFER_SIZE)
    epsilon = STARTING_EPSILON
    total_steps = 0
    episode_rewards = []

    for episode in range(NUM_EPISODES):
        state, info = environment.reset()   # Lesson 8, Section 1
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
    """Lesson 3: raw + rolling-average reward plotting."""
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
    plt.title("Capstone DQN on CartPole")
    plt.legend()
    plt.show()


def evaluate_trained_agent(online_network, num_episodes=5):
    """
    A final check with epsilon=0 (pure exploitation, no exploration) -
    this shows what the agent actually learned, without random noise mixed in.
    """
    print("\n--- Evaluating trained agent (epsilon = 0, no exploration) ---")
    environment = gym.make("CartPole-v1")
    num_actions = environment.action_space.n

    for episode in range(num_episodes):
        state, info = environment.reset()
        total_reward = 0
        done = False
        while not done:
            action = choose_epsilon_greedy_action(online_network, state, epsilon=0.0, num_actions=num_actions)
            state, reward, terminated, truncated, info = environment.step(action)
            total_reward += reward
            done = terminated or truncated
        print(f"Evaluation episode {episode + 1}: reward = {total_reward:.0f}")

    environment.close()


if __name__ == "__main__":
    trained_network, episode_rewards = run_dqn_training()
    plot_training_curve(episode_rewards)
    evaluate_trained_agent(trained_network)

    trained_network.save("cartpole_dqn_model.keras")
    print("\nModel saved to cartpole_dqn_model.keras")
```

---

## 3. Reading the results honestly

When you run this, pay attention to three things, in order:

1. **The training curve.** Rolling-average reward should trend upward over the 150 episodes, even though the raw (unsmoothed) line stays noisy throughout — that noise is normal (Lesson 3's whole point in introducing rolling averages).
2. **The evaluation episodes** (epsilon = 0). These show what the agent *actually learned*, with no random exploration mixed in. If evaluation rewards are meaningfully higher and more consistent than early training rewards, that's real evidence of learning, not just noise.
3. **If it doesn't work well** — and DQN training is genuinely somewhat run-dependent — that's not a sign something is conceptually wrong with the code. It's an invitation to use the Lesson 9 challenges (disable the target network, shrink the replay buffer, change the sync frequency) as actual debugging tools, not just exercises. Being able to reason about *why* a run trained poorly, using the mechanisms from Lesson 9 Sections 0-2, is a more valuable skill for your class than any single successful run.

---

## 4. Where to go from here

This capstone deliberately stops at DQN on CartPole with a `Dense` network, because that's the direct endpoint of the four-week prep window. Your actual class and textbooks will likely extend in a few directions you're now well-positioned for, since each one is a small, well-motivated step from what you already have:

- **Policy gradient methods (REINFORCE, and beyond)** — instead of learning Q-values and picking the best one, learn a policy directly (a network that outputs action *probabilities*, not scores). This is the other major branch of RL alongside value-based methods like DQN, and your book will likely introduce it as a contrast to everything in Weeks 3-4.
- **CNN-based DQN for pixel environments** — swap this capstone's `Dense`-only network for the `Conv2D` stack from Lesson 5, feeding in Atari-style frames instead of CartPole's 4-number vector. Everything else (replay buffer, target network, epsilon-greedy) stays identical.
- **More advanced variants** (Double DQN, Dueling DQN) — small, specific tweaks to the target calculation or network architecture, each fixing one particular remaining weakness in vanilla DQN. Having genuinely understood *this* version first is exactly what makes those tweaks readable as "one specific change to a thing I already understand," instead of new material from scratch.

You've spent four weeks building every piece of this from the ground up rather than only learning the API surface — that's the actual advantage you're walking into class with.
