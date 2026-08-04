# Lesson 9 — Deep Q-Networks (DQN)

**Track:** RL/Keras Class Prep — Week 4
**Depth:** Heavy (the lesson everything else has been building toward)
**Goal by end of lesson:** You can explain exactly why naively swapping Lesson 7's Q-table for a Keras network is unstable, what experience replay and a target network each fix, and you can read/build a working DQN agent that trains on real CartPole.

---

## 0. The naive idea, and why it breaks

The obvious plan, given everything so far: take the Q-learning update from Lesson 7,

```
Q(s, a) = Q(s, a) + α × [ R + γ × max(Q(s', all actions)) − Q(s, a) ]
```

and instead of updating a table entry, train a Keras network (Lesson 4) so that `network(s)[a]` approaches `R + γ × max(network(s'))`. This is directionally correct — it's genuinely the core of DQN — but done *this* naively, training collapses. Two specific problems:

### 0.1 Correlated data breaks the usual training assumptions

Lesson 4's `model.fit()` assumed your training examples were roughly independent of each other — shuffled data from all over the dataset. But if you train the network on states *as they happen*, one step after another within a single episode, consecutive states are extremely similar (CartPole's state barely changes between one step and the next). Training on a long run of highly similar examples in a row tends to make the network overfit to whatever the agent happens to be doing *right now*, forgetting things it learned from earlier, different situations. This is sometimes called "catastrophic forgetting" of older experience.

### 0.2 The moving target problem

Look again at the target: `R + γ × max(network(s'))`. The same network you're currently updating is *also* used to compute the target you're updating toward. Every time you adjust the network's weights, the target itself shifts — you're chasing a target that moves every time you take a step toward it. This can cause the whole training process to oscillate or diverge instead of converging, the same way it'd be hard to hit a target that jumps every time you get closer.

Both of DQN's key tricks exist specifically to fix these two problems, one each.

---

## 1. Fix #1: Experience Replay (fixes Section 0.1)

Instead of training immediately on each new experience, store every `(state, action, reward, next_state, done)` transition in a **replay buffer** — just a large rolling list. When it's time to train, sample a **random minibatch** from this buffer, mixing old and recent experiences from many different points in training.

```python
from collections import deque
import random

replay_buffer = deque(maxlen=10000)   # automatically drops oldest entries once full

def store_transition(state, action, reward, next_state, done):
    replay_buffer.append((state, action, reward, next_state, done))

def sample_minibatch(batch_size):
    return random.sample(replay_buffer, batch_size)
```

This directly fixes Section 0.1: a random sample from a large buffer breaks up the "long run of nearly-identical consecutive states" problem, giving the network training data that behaves much more like the independent, shuffled data `model.fit()` was built to expect (Lesson 4, Section 4). It also has a second benefit: each individual transition can be reused for training many times as it sits in the buffer, instead of being seen once and discarded.

---

## 2. Fix #2: Target Network (fixes Section 0.2)

Keep **two copies** of the network:

- The **online network** — the one you're actively training, and the one used to *choose actions* (epsilon-greedy, Lesson 7 Section 5).
- The **target network** — a separate copy, used *only* to compute the `max(Q(s', ...))` term of the target. Its weights are **frozen** for a stretch of training, then periodically copied over from the online network (e.g., every few hundred training steps), rather than updating continuously.

```python
target_network.set_weights(online_network.get_weights())   # periodic sync, not every step
```

This directly fixes Section 0.2: since the target network's weights don't change on every single training step, the target you're training toward stays stable for a while — you get a fixed target to aim at for a batch of updates, instead of one that shifts underneath you on every step. Periodically syncing the target network keeps it from drifting too far out of date, while still giving training enough stability to actually converge.

---

## 3. Putting the target together — one concrete calculation

For a sampled transition `(state, action, reward, next_state, done)`:

```python
if done:
    target_q_value = reward
else:
    target_q_value = reward + DISCOUNT_FACTOR * max(target_network.predict(next_state))
```

Note the `if done` branch: if the episode ended on this transition, there *is* no next state to bootstrap from — the target is just the reward itself. This mirrors Lesson 6's terminal states never getting a Bellman update beyond their own reward, and Lesson 7's `step_environment` returning `done=True` at the goal/trap.

### 3.1 The implementation subtlety — only train on the action actually taken

The network outputs a Q-value for *every* action (Lesson 4's final `Dense(num_actions)` layer), but a given transition only tells you the true outcome of the *one* action that was actually taken. The standard trick: get the network's current full prediction, then only replace the entry for the action that was taken with the computed target — leaving every other action's value exactly as the network already predicted. Training with MSE loss (Lesson 4, Section 3) against this modified vector produces zero error (and thus zero gradient) for the untouched actions, so only the taken action's estimate actually gets updated.

```python
current_q_values = online_network.predict(state)      # shape: (num_actions,)
current_q_values[action] = target_q_value              # only touch the action that was actually taken
# train online_network on (state -> current_q_values) with MSE loss
```

---

## 4. The full DQN training loop, in words

1. Epsilon-greedy: with probability ε, pick a random action; otherwise pick `argmax(online_network.predict(state))` (Lesson 2's `argmax`, Lesson 7's exploration strategy).
2. Take that action in the real Gym environment (Lesson 8's `environment.step(action)`).
3. Store the resulting transition in the replay buffer (Section 1).
4. Sample a random minibatch from the buffer, compute targets using the target network (Section 2-3), and train the online network one step on that batch.
5. Every N steps, sync the target network's weights from the online network (Section 2).
6. Decay epsilon gradually (Lesson 7, Section 5).
7. Repeat for many episodes.

Every single piece of this list is something from an earlier lesson, recombined. That's deliberate — DQN isn't new math, it's the Bellman equation (Lesson 6) plus Q-learning's update rule (Lesson 7) plus a Keras network standing in for the table (Lesson 4) plus two specific engineering fixes for the instability that combination introduces (Sections 1-2 above).

---

## 5. Complete runnable file — DQN on CartPole

Save as `lesson_09_practice.py` and run with `python lesson_09_practice.py`. This will take a few minutes to run for meaningful results — CartPole DQN training is genuinely doing real work here, not a toy instant-convergence example.

```python
"""
Lesson 9 Practice: A full DQN agent training on CartPole.
Run with: python lesson_09_practice.py
(Requires: pip install gymnasium)
"""
import random
from collections import deque

import numpy as np
import gymnasium as gym
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
    q_values = online_network.predict(state.reshape(1, -1), verbose=0)[0]   # Lesson 2's reshape + argmax
    return int(np.argmax(q_values))


def train_on_minibatch(online_network, target_network, replay_buffer, num_actions):
    if len(replay_buffer) < BATCH_SIZE:
        return   # not enough experience yet to train

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
            target = rewards[i]
        else:
            target = rewards[i] + DISCOUNT_FACTOR * np.max(next_q_values[i])
        current_q_values[i][actions[i]] = target   # Section 3.1 - only touch the taken action

    online_network.fit(states, current_q_values, epochs=1, verbose=0)


def run_dqn_training():
    environment = gym.make("CartPole-v1")
    state_size = environment.observation_space.shape[0]
    num_actions = environment.action_space.n

    online_network = build_q_network(state_size, num_actions)
    target_network = build_q_network(state_size, num_actions)
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
                target_network.set_weights(online_network.get_weights())   # Section 2

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
    return episode_rewards


def plot_results(episode_rewards):
    import matplotlib.pyplot as plt

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
    plt.title("DQN on CartPole")
    plt.legend()
    plt.show()


if __name__ == "__main__":
    episode_rewards = run_dqn_training()
    plot_results(episode_rewards)
```

**What to expect:** early episodes will have low, noisy rewards (random-ish behavior while epsilon is high and the network hasn't learned much). Over 150 episodes, the last-10-episode average should trend upward — CartPole's maximum possible reward per episode is 200 (the step cap), and a working DQN typically starts reliably hitting rewards well above the random baseline from Lesson 8 by the later episodes, though exact numbers vary run to run since training is stochastic.

---

## 6. Challenges before the capstone

1. Comment out the target network entirely — pass `online_network` in place of `target_network` everywhere in `train_on_minibatch`, and re-run. Does training become visibly more unstable (compare the reward plot to the original run)? This makes Section 0.2's "moving target" problem directly visible.
2. Reduce `REPLAY_BUFFER_SIZE` to something tiny, like `200`. Does performance suffer? Relate this to Section 0.1 — a small buffer means training samples are drawn from a much narrower, more recent (and thus more correlated) slice of experience.
3. Change `TARGET_SYNC_EVERY_STEPS` from `200` to `20` (much more frequent syncing) and separately to `2000` (much less frequent). What tradeoff do you observe?
4. In your own words: explain why `current_q_values[i][actions[i]] = target` — leaving every other action's entry untouched — is necessary, rather than just training the network on `(state, target)` directly. (Tie this back to Section 3.1 and the fact that the network outputs one value *per action*, not one single number.)

---

## What's next — the capstone

The final lesson pulls everything from Weeks 1-4 together: your own DQN agent, trained end-to-end on CartPole, with your own code, fully understood end to end — no unexplained lines, no library calls you can't map back to math you built by hand somewhere in this series. Say the word when you're ready for it.
