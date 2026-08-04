# Lesson 14 — Policy Gradients / REINFORCE

**Track:** RL/Keras Mastery Arc — Week 7 (opener)
**Depth:** Heavy — a genuinely different branch of RL from everything in Weeks 3-4 and Week 6
**Goal by end of lesson:** You understand why learning a policy directly is a different strategy from learning Q-values, can derive the REINFORCE gradient, and can build and train a working policy-gradient agent on CartPole.

---

## 0. The fork in the road — value-based vs. policy-based

Every RL method you've built so far (value iteration, Q-learning, SARSA, DQN and its variants) follows the same strategy: learn how good each action is (`V(s)` or `Q(s,a)`), then *derive* a policy from that by picking the best action (`argmax`, Lesson 2). The policy is never learned directly — it's a byproduct of the value estimates.

**Policy gradient methods flip this.** Instead of learning values and deriving a policy, you learn a policy *directly* — a network that takes a state and outputs action *probabilities*, trained to make good actions more likely and bad actions less likely, without ever explicitly estimating "how good" any state is along the way. This is a genuinely different strategy, not just a different network architecture wearing the same algorithm underneath.

---

## 1. The policy network — outputting probabilities, not scores

Recall Lesson 4's `Dense` output layer used `activation="linear"` for raw Q-value scores. A policy network instead uses **softmax**, which converts raw scores into a valid probability distribution — all values positive, summing to exactly `1`.

```python
from tensorflow import keras
from tensorflow.keras import layers

policy_network = keras.Sequential([
    layers.Dense(24, activation="relu", input_shape=(4,)),
    layers.Dense(24, activation="relu"),
    layers.Dense(2, activation="softmax")   # 2 actions -> 2 probabilities, summing to 1
])
```

```python
import numpy as np

def softmax(scores):
    exponentials = np.exp(scores - np.max(scores))   # subtracting max for numerical stability
    return exponentials / np.sum(exponentials)

raw_scores = np.array([2.0, 1.0])
print(softmax(raw_scores))   # e.g. [0.731, 0.269] - action 0 is preferred, but action 1 still has real probability
```

**Why probabilities instead of a hard `argmax` choice?** This gives you built-in, principled exploration — instead of the separate epsilon-greedy bolt-on from Lesson 7, the policy naturally samples less-favored actions some of the time, in proportion to how much worse they currently seem. As training improves the policy, the probability distribution naturally sharpens toward the better action(s) — exploration fades out organically as confidence grows, rather than through an externally-scheduled epsilon decay.

---

## 2. Choosing an action — sampling, not argmax

```python
def choose_action(policy_network, state):
    action_probabilities = policy_network.predict(state.reshape(1, -1), verbose=0)[0]
    action = np.random.choice(len(action_probabilities), p=action_probabilities)
    return action, action_probabilities[action]
```

`np.random.choice(..., p=action_probabilities)` samples an action according to the policy's probability distribution — not necessarily the highest-probability one. This is a direct callback to Lesson 13's `np.random.choice(..., p=sampling_probabilities)` for prioritized replay — same NumPy mechanism, entirely different purpose (there: which memory to train on; here: which action to take).

---

## 3. The REINFORCE gradient — the actual derivation

This is the core of the lesson. The goal: increase the probability of actions that led to good outcomes, decrease the probability of actions that led to bad outcomes.

### 3.1 The intuition first

Suppose an episode ends with a high total reward. REINFORCE's idea: **every action taken during that episode gets nudged to become more likely**, in proportion to how good the episode's outcome was. If the episode's total reward was low or negative, actions taken during it get nudged to become *less* likely instead.

### 3.2 The gradient, derived

The quantity you want to maximize is the *expected total reward* the policy achieves. Without walking through the full formal derivation (which involves the log-derivative trick — differentiating `log(π(a|s))` rather than `π(a|s)` directly, a standard calculus rewriting that avoids some intractable terms), the result is the **REINFORCE update rule**:

```
gradient = G_t × ∇(log(π(a_t | s_t)))
```

Where:
- `π(a_t | s_t)` — the policy network's probability of the action actually taken, at the state actually visited.
- `∇(log(π(...)))` — the gradient of the *log* of that probability, with respect to the network's weights. This is Lesson 10's chain rule again, just applied to a `log(softmax(...))` output instead of a mean-squared-error loss.
- `G_t` — the **return**: the total discounted future reward from timestep `t` onward, computed *after* the episode finishes (this is why REINFORCE trains on whole completed episodes, unlike DQN which trains on individual transitions as they happen).

```
G_t = r_t + γ×r_(t+1) + γ²×r_(t+2) + ... (all remaining rewards in the episode, discounted)
```

**Reading the gradient in plain language:** for each action taken during the episode, push the network's weights in whatever direction increases `log(π(a_t|s_t))` — i.e., makes that action more likely — scaled by how good `G_t` was. A large positive `G_t` means "push hard toward this action." A negative or small `G_t` means "push away from this action" (or barely push at all).

### 3.3 Turning this into a Keras loss function

Keras minimizes loss (Lesson 4); REINFORCE wants to *maximize* expected return. The standard trick: define the loss as the *negative* of what you're trying to maximize, so that "minimizing loss" and "maximizing expected return" become the same thing:

```python
loss = -G_t * log(π(a_t | s_t))
```

In code, using **categorical cross-entropy** (Keras's standard loss for probability-distribution outputs) combined with sample weighting by `G_t`:

```python
policy_network.compile(optimizer=keras.optimizers.Adam(learning_rate=0.001), loss="categorical_crossentropy")

# During training, for each episode:
# states: shape (episode_length, state_size)
# actions_one_hot: shape (episode_length, num_actions) - a 1 at the action taken, 0 elsewhere
# returns: shape (episode_length,) - G_t for each timestep

policy_network.fit(states, actions_one_hot, sample_weight=returns, epochs=1, verbose=0)
```

`categorical_crossentropy` between the network's predicted probabilities and a one-hot vector of the action actually taken computes exactly `-log(π(a_t|s_t))` — and `sample_weight=returns` multiplies each example's loss contribution by that timestep's `G_t`, reproducing the `-G_t × log(π(a_t|s_t))` formula from above using Keras's existing machinery, rather than writing custom gradient code by hand.

---

## 4. A necessary preprocessing step — normalizing returns

`G_t` values can vary wildly in scale across episodes and timesteps, which makes training noisy and unstable. The standard fix: normalize the returns within each episode to have mean `0` and standard deviation `1`, using exactly Lesson 3's `np.mean` and `np.std`:

```python
def normalize_returns(returns):
    returns = np.array(returns)
    return (returns - np.mean(returns)) / (np.std(returns) + 1e-8)   # +epsilon avoids divide-by-zero
```

This normalization also has a nice side effect: after normalizing, roughly half the returns in a batch become negative and half positive — meaning below-average actions get actively pushed down, not just pushed up less strongly. This tends to produce more effective learning signal than using raw, unnormalized returns.

---

## 5. Complete runnable file — REINFORCE on CartPole

Save as `lesson_14_practice.py` and run with `python lesson_14_practice.py`.

```python
"""
Lesson 14 Practice: REINFORCE (policy gradient) on CartPole, trained end-to-end.
Run with: python lesson_14_practice.py
(Requires: pip install gymnasium)
"""
import numpy as np
import gymnasium as gym
import matplotlib.pyplot as plt
from tensorflow import keras
from tensorflow.keras import layers

DISCOUNT_FACTOR = 0.99
LEARNING_RATE = 0.001
NUM_EPISODES = 300
MAX_STEPS_PER_EPISODE = 500


def build_policy_network(state_size, num_actions):
    model = keras.Sequential([
        layers.Dense(24, activation="relu", input_shape=(state_size,)),
        layers.Dense(24, activation="relu"),
        layers.Dense(num_actions, activation="softmax")
    ])
    model.compile(optimizer=keras.optimizers.Adam(learning_rate=LEARNING_RATE),
                   loss="categorical_crossentropy")
    return model


def choose_action(policy_network, state):
    action_probabilities = policy_network.predict(state.reshape(1, -1), verbose=0)[0]
    action = np.random.choice(len(action_probabilities), p=action_probabilities)
    return action


def compute_discounted_returns(rewards):
    """Section 3.2: G_t for every timestep, computed backward through the episode."""
    returns = np.zeros(len(rewards))
    running_total = 0
    for t in reversed(range(len(rewards))):
        running_total = rewards[t] + DISCOUNT_FACTOR * running_total
        returns[t] = running_total
    return returns


def normalize_returns(returns):
    return (returns - np.mean(returns)) / (np.std(returns) + 1e-8)


def run_one_episode(environment, policy_network):
    states, actions, rewards = [], [], []
    state, info = environment.reset()

    for step in range(MAX_STEPS_PER_EPISODE):
        action = choose_action(policy_network, state)
        next_state, reward, terminated, truncated, info = environment.step(action)

        states.append(state)
        actions.append(action)
        rewards.append(reward)

        state = next_state
        if terminated or truncated:
            break

    return states, actions, rewards


def train_on_episode(policy_network, states, actions, rewards, num_actions):
    returns = compute_discounted_returns(rewards)
    normalized_returns = normalize_returns(returns)

    states_array = np.array(states)
    actions_one_hot = np.zeros((len(actions), num_actions))
    for i, action in enumerate(actions):
        actions_one_hot[i, action] = 1

    policy_network.fit(states_array, actions_one_hot,
                        sample_weight=normalized_returns, epochs=1, verbose=0)


def run_reinforce_training():
    environment = gym.make("CartPole-v1")
    state_size = environment.observation_space.shape[0]
    num_actions = environment.action_space.n

    policy_network = build_policy_network(state_size, num_actions)
    episode_rewards = []

    for episode in range(NUM_EPISODES):
        states, actions, rewards = run_one_episode(environment, policy_network)
        train_on_episode(policy_network, states, actions, rewards, num_actions)

        total_reward = sum(rewards)
        episode_rewards.append(total_reward)

        if (episode + 1) % 10 == 0:
            recent_average = np.mean(episode_rewards[-10:])
            print(f"Episode {episode + 1}/{NUM_EPISODES} | "
                  f"reward: {total_reward:.0f} | last-10 avg: {recent_average:.1f}")

    environment.close()
    return policy_network, episode_rewards


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
    plt.title("REINFORCE on CartPole")
    plt.legend()
    plt.show()


if __name__ == "__main__":
    trained_policy, episode_rewards = run_reinforce_training()
    plot_training_curve(episode_rewards)
```

**What to expect:** REINFORCE tends to be noisier and slower to converge than DQN on CartPole — this is a well-known, genuine characteristic of the algorithm (high variance in the gradient estimate, since a single episode's random outcome determines the whole update), not a bug in this implementation. The rolling average should still trend upward over 300 episodes, just with more visible noise in the raw curve than Lesson 9's DQN plot had.

---

## 6. Challenges before Lesson 15

1. Comment out `normalize_returns` (train on raw `returns` directly instead) and compare training stability. Does the noise Section 4 warned about get visibly worse?
2. `compute_discounted_returns` computes `G_t` by iterating *backward* through the episode's rewards. Explain why backward iteration is the natural approach here (hint: `G_t` at any timestep depends on all rewards *after* it — relate this to Lesson 6's Bellman equation being inherently recursive).
3. Print the policy network's action probabilities for the same fixed test state at episode 10, episode 100, and episode 300. Does the distribution visibly sharpen (become less uniform, more confident) as training progresses, consistent with Section 1's "exploration fades organically" claim?
4. REINFORCE as built here only updates weights once per *full episode*. What's one practical downside of waiting for a full episode before every single weight update, compared to DQN's per-step training in Lesson 9? (Hint: think about episodes that could in principle run for a very long time.)

---

## What's next

Lesson 15 closes Week 7 with Actor-Critic (A2C) — combining a policy network (this lesson) with a value network (Weeks 3-4) to fix exactly the downside you just reasoned through in Challenge 4, plus REINFORCE's high-variance gradient problem from Section 5's "expect more noise" observation.
