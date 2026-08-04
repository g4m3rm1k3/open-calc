# Lesson 19 — Training an Agent on the CNC Environment

**Track:** RL/Keras Mastery Arc — Manufacturing Application
**Depth:** Consolidation with a real analytical payoff — the algorithm is completely unchanged from Lesson 12; the value here is in what the trained agent reveals
**Goal by end of lesson:** Train Lesson 12's Double+Dueling DQN, completely unmodified, on Lesson 18's CNC environment, and analyze what parameter policy it actually learns — comparing it against your own real machining intuition.

---

## 0. The point of this lesson, stated directly

Every algorithmic piece here — the network architecture, the Double DQN target calculation, the Dueling value/advantage split, epsilon-greedy exploration, the replay buffer — is exactly Lesson 12's code. Nothing changes except which environment it's pointed at. This is deliberate, and it's the actual payoff of building things the way this series did: a correctly-implemented DQN doesn't need to know or care whether it's balancing a pole, landing a spacecraft, or choosing cutting parameters. If you find yourself wanting to modify the agent code to "make it work" on this environment, that's usually a sign the *environment* (Lesson 18) needs adjustment, not the agent — worth genuinely trying environment-side fixes first, and treating "let me just tweak the agent" as a step to be suspicious of.

---

## 1. Training script

Save as `lesson_19_train.py`, in the same directory as Lesson 18's `cnc_environment.py`.

```python
"""
Lesson 19 Practice: Double+Dueling DQN (Lesson 12, unmodified) trained on the CNC environment (Lesson 18).
Run with: python lesson_19_train.py
"""
import random
from collections import deque

import numpy as np
import matplotlib.pyplot as plt
from tensorflow import keras
from tensorflow.keras import layers

from cnc_environment import CNCCuttingEnv

DISCOUNT_FACTOR = 0.95
LEARNING_RATE = 0.001
REPLAY_BUFFER_SIZE = 10000
BATCH_SIZE = 32
TARGET_SYNC_EVERY_STEPS = 200
NUM_EPISODES = 300
STARTING_EPSILON = 1.0
MIN_EPSILON = 0.05
EPSILON_DECAY = 0.995


def build_dueling_q_network(state_size, num_actions):
    """Exactly Lesson 12, Section 2.3 - zero changes."""
    inputs = keras.Input(shape=(state_size,))
    shared = layers.Dense(64, activation="relu")(inputs)
    shared = layers.Dense(64, activation="relu")(shared)

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
    """Exactly Lesson 12, Section 1.2 - the Double DQN select/evaluate split, zero changes."""
    if len(replay_buffer) < BATCH_SIZE:
        return

    minibatch = random.sample(replay_buffer, BATCH_SIZE)
    states = np.array([t[0] for t in minibatch])
    actions = np.array([t[1] for t in minibatch])
    rewards = np.array([t[2] for t in minibatch])
    next_states = np.array([t[3] for t in minibatch])
    dones = np.array([t[4] for t in minibatch])

    current_q_values = online_network.predict(states, verbose=0)
    online_next_q_values = online_network.predict(next_states, verbose=0)
    target_next_q_values = target_network.predict(next_states, verbose=0)

    for i in range(BATCH_SIZE):
        if dones[i]:
            target = rewards[i]
        else:
            best_next_action = np.argmax(online_next_q_values[i])
            target = rewards[i] + DISCOUNT_FACTOR * target_next_q_values[i][best_next_action]
        current_q_values[i][actions[i]] = target

    online_network.fit(states, current_q_values, epochs=1, verbose=0)


def run_training():
    environment = CNCCuttingEnv()
    state_size = environment.observation_space.shape[0]
    num_actions = environment.action_space.n

    online_network = build_dueling_q_network(state_size, num_actions)
    target_network = build_dueling_q_network(state_size, num_actions)
    target_network.set_weights(online_network.get_weights())

    replay_buffer = deque(maxlen=REPLAY_BUFFER_SIZE)
    epsilon = STARTING_EPSILON
    total_steps = 0
    episode_rewards = []
    outcomes = {"tool_broke": 0, "pass_complete": 0, "timed_out": 0}

    for episode in range(NUM_EPISODES):
        state, info = environment.reset()
        episode_reward = 0
        done = False

        while not done:
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

        if info.get("tool_broke"):
            outcomes["tool_broke"] += 1
        elif info.get("pass_complete"):
            outcomes["pass_complete"] += 1
        else:
            outcomes["timed_out"] += 1

        epsilon = max(MIN_EPSILON, epsilon * EPSILON_DECAY)
        episode_rewards.append(episode_reward)

        if (episode + 1) % 20 == 0:
            recent_average = np.mean(episode_rewards[-20:])
            recent_outcomes = outcomes.copy()
            print(f"Episode {episode + 1}/{NUM_EPISODES} | "
                  f"reward: {episode_reward:.1f} | last-20 avg: {recent_average:.1f} | "
                  f"epsilon: {epsilon:.2f} | outcomes so far: {recent_outcomes}")

    environment.close() if hasattr(environment, "close") else None
    online_network.save("cnc_dqn_model.keras")
    print("\nFinal outcome distribution across all episodes:", outcomes)
    print("Model saved to cnc_dqn_model.keras")
    return online_network, episode_rewards


def plot_training_curve(episode_rewards):
    def rolling_average(values, window_size):
        result = []
        for i in range(len(values)):
            start_index = max(0, i - window_size + 1)
            result.append(np.mean(values[start_index:i + 1]))
        return result

    smoothed = rolling_average(episode_rewards, window_size=20)
    plt.plot(episode_rewards, label="Raw reward", alpha=0.4)
    plt.plot(smoothed, label="Rolling average (window=20)", linewidth=2)
    plt.xlabel("Episode")
    plt.ylabel("Total Reward")
    plt.title("Double+Dueling DQN on CNC Cutting Optimization")
    plt.legend()
    plt.show()


if __name__ == "__main__":
    trained_network, episode_rewards = run_training()
    plot_training_curve(episode_rewards)
```

**What to expect:** early episodes should show a high `tool_broke` rate (epsilon starts at 1.0 — nearly random parameter choices, same as Lesson 18's random-action sanity check). As epsilon decays and the network trains, `pass_complete` should become increasingly common, and the reward curve's rolling average should trend upward — the same shape of evidence you used to judge every DQN run since Lesson 9, now applied to a problem with a genuine real-world analog instead of a game.

---

## 2. Analyzing what the agent actually learned

This is the step generic RL tutorials usually skip, and it's the most valuable part of this lesson specifically because of your background. Once training finishes:

```python
"""
Lesson 19 Analysis: inspecting the trained agent's learned parameter policy.
Run with: python lesson_19_analyze.py (after lesson_19_train.py has produced cnc_dqn_model.keras)
"""
import numpy as np
from tensorflow import keras

from cnc_environment import CNCCuttingEnv, FEED_RATE_OPTIONS, SPINDLE_SPEED_OPTIONS


def run_evaluation_episode(environment, trained_network):
    state, info = environment.reset()
    chosen_parameters = []
    done = False

    while not done:
        q_values = trained_network.predict(state.reshape(1, -1), verbose=0)[0]
        action = int(np.argmax(q_values))   # pure exploitation, epsilon=0

        feed_index = action // len(SPINDLE_SPEED_OPTIONS)
        speed_index = action % len(SPINDLE_SPEED_OPTIONS)
        chosen_parameters.append((FEED_RATE_OPTIONS[feed_index], SPINDLE_SPEED_OPTIONS[speed_index]))

        state, reward, terminated, truncated, info = environment.step(action)
        done = terminated or truncated

    return chosen_parameters, info


if __name__ == "__main__":
    environment = CNCCuttingEnv()
    trained_network = keras.models.load_model("cnc_dqn_model.keras")

    print("--- Running 5 evaluation episodes (no exploration) ---")
    for episode in range(5):
        chosen_parameters, info = run_evaluation_episode(environment, trained_network)
        outcome = "tool_broke" if info.get("tool_broke") else "pass_complete"

        feed_rates = [p[0] for p in chosen_parameters]
        spindle_speeds = [p[1] for p in chosen_parameters]

        print(f"\nEpisode {episode + 1}: outcome = {outcome}, steps = {len(chosen_parameters)}")
        print(f"  Feed rate choices over time:     {feed_rates}")
        print(f"  Spindle speed choices over time: {spindle_speeds}")
        print(f"  Average feed rate: {np.mean(feed_rates):.2f}, average spindle speed: {np.mean(spindle_speeds):.2f}")
```

**What to look for, specifically:**
- Does the agent settle into a *consistent* strategy (similar parameter choices episode to episode), or does it look erratic? A well-trained agent should be fairly consistent.
- Does it ramp parameters *up* over the course of a pass, stay flat, or ramp *down*? Given the environment's reward structure (Lesson 18, Section 5), what would you predict *before* looking at the output — and does the actual behavior match your prediction?
- **Most importantly:** does the learned average feed rate/spindle speed combination look like something a real, experienced machinist would consider a reasonable — even if conservative — strategy for balancing speed against tool life? This is the genuine test of whether Lesson 18's simplified process model produced a sensible-enough problem for the agent to learn something real, versus an artifact of the specific (simplified) reward/physics functions.

---

## 3. Challenges before Lesson 20

1. Run the analysis script and write down, in your own words, what strategy the agent converged on — does it front-load aggressive parameters early (when tool wear is low) and ease off later, or the reverse? Explain why that pattern would or wouldn't make sense given `compute_wear_increment`'s formula (Lesson 18, Section 4).
2. Go back to Lesson 18's reward function and change the tool-breakage penalty from `-50` to `-10` (a much lighter penalty). Retrain, and compare the outcome distribution and learned parameter averages. Does the agent become visibly more aggressive, consistent with Lesson 18 Section 5's reasoning about relative reward magnitudes?
3. Using your own machining knowledge from Challenge 3 in Lesson 18, pick one specific improvement to the process model (e.g., adding a material-hardness parameter to the state, or a more realistic wear-accumulation curve) and describe what would need to change in `cnc_environment.py`'s state, action, or process-model functions to support it — you don't need to fully implement it, just map out the change.
4. Compare this training run's reward curve shape to Lesson 9's CartPole curve and Lesson 12's LunarLander-adjacent runs. Is this environment's learning curve smoother, noisier, or similar? Reason about what aspects of the reward function or state space (dense vs. sparse rewards, continuous vs. discrete-feeling dynamics) might explain any difference you observe.

---

## What's next

Lesson 20 shifts from RL to a different, equally real manufacturing ML use case: predictive maintenance via supervised learning — using Lesson 4/5's `Dense`/`Conv2D` skills to classify sensor data as healthy or trending toward tool failure, a genuinely different tool for a genuinely different kind of problem than the RL work in Lessons 18-19.
