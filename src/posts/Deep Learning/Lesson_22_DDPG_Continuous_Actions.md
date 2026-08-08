# Lesson 22 — Continuous Action Spaces with DDPG

**Track:** RL/Keras Mastery Arc — Manufacturing Application Extension
**Depth:** Heavy — a genuinely new algorithm family, though every individual piece is a recombination of things you've already built
**Goal by end of lesson:** Understand why `argmax` breaks down for continuous actions, how DDPG's actor-critic structure solves that, and train an agent that chooses real continuous feed rate/spindle speed values instead of snapping to Lesson 18's 25 discrete presets.

---

## 0. Why discrete actions stop being good enough

Lesson 18 discretized feed rate and spindle speed into 5 options each, deliberately, so every DQN-family algorithm (which all rely on `argmax` over a *finite* list of Q-values) could be reused unmodified. But real CNC parameters aren't naturally 5 buckets wide — `feed_rate = 1.23` is a perfectly meaningful, and possibly optimal, choice that the discretized version simply cannot represent. Finer discretization (say, 50 buckets per parameter instead of 5) helps precision but reintroduces Lesson 8, Section 2.1's curse of dimensionality — `50 × 50 = 2500` actions for two parameters, and it only gets worse as you add more controllable parameters (depth of cut, coolant flow, etc.).

**The real problem, stated precisely:** `argmax` requires enumerating every possible action and comparing Q-values — computationally fine for a short discrete list, but impossible for a continuous range with infinitely many values. You cannot loop over "every possible feed rate between 0.5 and 1.5" to find the best one.

---

## 1. The DDPG idea — let the actor output the action directly

Instead of a network that scores a fixed list of actions (DQN's approach) and picking the best with `argmax`, DDPG uses an **actor** network that takes a state and outputs the continuous action values directly — no enumeration, no `argmax`, just a direct forward pass producing real numbers:

```python
from tensorflow import keras
from tensorflow.keras import layers

def build_actor(state_size, action_size, action_low, action_high):
    inputs = keras.Input(shape=(state_size,))
    hidden = layers.Dense(64, activation="relu")(inputs)
    hidden = layers.Dense(64, activation="relu")(hidden)
    raw_actions = layers.Dense(action_size, activation="tanh")(hidden)   # outputs in [-1, 1]

    # Rescale from [-1, 1] to the actual [action_low, action_high] range
    action_range = (action_high - action_low) / 2.0
    action_midpoint = (action_high + action_low) / 2.0
    scaled_actions = layers.Lambda(lambda a: a * action_range + action_midpoint)(raw_actions)

    return keras.Model(inputs=inputs, outputs=scaled_actions)
```

`activation="tanh"` squashes the raw output into `[-1, 1]` (similar role to sigmoid's `[0, 1]` squashing from Lesson 20, just symmetric around zero) — then a `Lambda` layer (Lesson 12, Section 2.3's pattern again) rescales that into whatever the actual action range is (e.g., feed rate multiplier between `0.5` and `1.5`).

**This actor is deterministic** — same state always produces the same action, unlike Lesson 14's stochastic policy that sampled from a probability distribution. This is the "Deterministic" in "Deep Deterministic Policy Gradient."

---

## 2. The critic — evaluating a specific continuous action

DQN's critic (the Q-network) took a state and output one Q-value *per possible action*. That doesn't work when actions are continuous — you can't have infinitely many outputs. DDPG's critic instead takes **both the state and a specific action** as input, and outputs a single Q-value for that exact state-action pair:

```python
def build_critic(state_size, action_size):
    state_input = keras.Input(shape=(state_size,))
    action_input = keras.Input(shape=(action_size,))

    combined = layers.Concatenate()([state_input, action_input])
    hidden = layers.Dense(64, activation="relu")(combined)
    hidden = layers.Dense(64, activation="relu")(hidden)
    q_value = layers.Dense(1, activation="linear")(hidden)

    return keras.Model(inputs=[state_input, action_input], outputs=q_value)
```

`layers.Concatenate()` joins the state and action vectors into one combined input — a new layer type, but a simple one: literally stacking two vectors end to end before feeding them into the shared `Dense` layers. This is a direct, natural extension of Lesson 1's vector concept — concatenation is just building a longer vector out of two shorter ones.

---

## 3. Training the critic — the familiar Bellman-style target, one new wrinkle

The critic trains almost exactly like DQN's Q-network (Lesson 9, Section 3), with one necessary change: computing `max(Q(s', all actions))` isn't possible for continuous actions (same problem as Section 0). DDPG's fix: use the **target actor** to *choose* the next action, then the **target critic** to *evaluate* it — genuinely the same select/evaluate separation idea as Double DQN (Lesson 12, Section 1.2), just adapted for the continuous-action setting where "select" now means "run the actor network" instead of "argmax over a list":

```python
target_next_action = target_actor.predict(next_states, verbose=0)
target_next_q_value = target_critic.predict([next_states, target_next_action], verbose=0)
critic_target = rewards + DISCOUNT_FACTOR * target_next_q_value * (1 - dones)
```

---

## 4. Training the actor — the deterministic policy gradient

The actor's training goal: adjust its weights to produce actions the critic scores highly. This uses the critic as a differentiable "judge" — push the actor's output in whatever direction the critic's gradient says would increase the predicted Q-value:

```python
with tf.GradientTape() as tape:
    actions = actor(states)
    q_values = critic([states, actions])
    actor_loss = -tf.reduce_mean(q_values)   # negative, because we MAXIMIZE Q (same trick as Lesson 14, Section 3.3)

actor_gradients = tape.gradient(actor_loss, actor.trainable_variables)
actor_optimizer.apply_gradients(zip(actor_gradients, actor.trainable_variables))
```

`tf.GradientTape()` is TensorFlow's mechanism for manually recording operations so gradients can be computed with respect to them — this is Lesson 10's chain rule and Lesson 11's backpropagation, made directly visible in code rather than hidden inside `model.fit()`. This is genuinely necessary here because the actor's loss depends on the *critic's* output evaluated on the *actor's* output — a chained computation `model.fit()` isn't set up to handle directly, unlike every previous lesson's simpler input-to-label training.

---

## 5. Target networks — now for both actor and critic, updated softly

Recall Lesson 9's target network: a periodically-synced copy, updated by fully overwriting weights every N steps. DDPG typically uses a gentler approach called a **soft update** (also called Polyak averaging), applied after *every* training step, to both a target actor and a target critic:

```python
def soft_update(target_network, online_network, tau=0.005):
    target_weights = target_network.get_weights()
    online_weights = online_network.get_weights()
    new_weights = [tau * online_w + (1 - tau) * target_w
                   for online_w, target_w in zip(online_weights, target_weights)]
    target_network.set_weights(new_weights)
```

Instead of "copy everything every 200 steps" (Lesson 9's hard sync), this nudges the target weights slightly toward the online weights every single step, controlled by `tau` (typically small, like `0.005`). **Why this fits DDPG specifically:** the actor is deterministic and continuous, so small target changes translate to small, smooth shifts in the target action/value — a hard, infrequent sync (like DQN's) would be more likely to cause the kind of destabilizing jumps DDPG's continuous, differentiable structure is more sensitive to than DQN's discrete, `argmax`-based one.

---

## 6. Exploration — adding noise to a deterministic policy

Since the actor is deterministic (Section 1), it needs an explicit exploration mechanism bolted on (unlike Lesson 14's naturally-exploring stochastic policy). The standard approach: add noise to the chosen action during training.

```python
def choose_action_with_exploration_noise(actor, state, noise_scale, action_low, action_high):
    action = actor.predict(state.reshape(1, -1), verbose=0)[0]
    noise = np.random.normal(0, noise_scale, size=action.shape)
    noisy_action = action + noise
    return np.clip(noisy_action, action_low, action_high)   # keep within valid range
```

This is structurally the same idea as epsilon-greedy (Lesson 7, Section 5) — inject randomness during training to avoid getting stuck exploiting a mediocre early policy — just implemented as additive noise on a continuous output instead of an occasional fully-random discrete choice. `noise_scale` typically decays over training, the same shape as epsilon-decay.

---

## 7. Rebuilding the CNC environment with continuous actions

```python
import gymnasium as gym
from gymnasium import spaces
import numpy as np

class ContinuousCNCCuttingEnv(gym.Env):
    """Same process model as Lesson 18's CNCCuttingEnv, but Box action space instead of Discrete."""

    def __init__(self):
        super().__init__()
        # action = [feed_rate_multiplier, spindle_speed_multiplier], continuous in [0.5, 1.5]
        self.action_space = spaces.Box(low=0.5, high=1.5, shape=(2,), dtype=np.float32)
        self.observation_space = spaces.Box(low=0.0, high=2.0, shape=(5,), dtype=np.float32)

        self.remaining_length = None
        self.accumulated_tool_wear = None
        self.current_feed_rate = None
        self.current_spindle_speed = None
        self.current_cutting_force = None
        self.step_count = None

    def _get_observation(self):
        return np.array([
            self.remaining_length, self.current_feed_rate, self.current_spindle_speed,
            self.accumulated_tool_wear, self.current_cutting_force
        ], dtype=np.float32)

    def reset(self, seed=None, options=None):
        super().reset(seed=seed)
        self.remaining_length = 1.0
        self.accumulated_tool_wear = 0.0
        self.current_feed_rate = 1.0
        self.current_spindle_speed = 1.0
        self.current_cutting_force = compute_cutting_force(1.0, 1.0)
        self.step_count = 0
        return self._get_observation(), {}

    def step(self, action):
        self.step_count += 1
        feed_rate_multiplier, spindle_speed_multiplier = float(action[0]), float(action[1])
        self.current_feed_rate = feed_rate_multiplier
        self.current_spindle_speed = spindle_speed_multiplier

        cutting_force = compute_cutting_force(feed_rate_multiplier, spindle_speed_multiplier)
        self.current_cutting_force = cutting_force
        self.accumulated_tool_wear += compute_wear_increment(cutting_force, spindle_speed_multiplier)

        material_removed = compute_material_removed(feed_rate_multiplier, spindle_speed_multiplier)
        self.remaining_length = max(0.0, self.remaining_length - material_removed)

        tool_broke = (cutting_force > 1.8 or self.accumulated_tool_wear >= 1.0)
        pass_complete = self.remaining_length <= 0.0

        reward = material_removed * 10
        if tool_broke:
            reward -= 50
        if pass_complete:
            reward += 20

        terminated = tool_broke or pass_complete
        truncated = self.step_count >= 200

        return self._get_observation(), reward, terminated, truncated, {
            "tool_broke": tool_broke, "pass_complete": pass_complete
        }


def compute_cutting_force(feed_rate_multiplier, spindle_speed_multiplier):
    base_force = feed_rate_multiplier * 1.0
    speed_effect = 1.0 + 0.3 * (spindle_speed_multiplier - 1.0) ** 2
    return base_force * speed_effect

def compute_wear_increment(cutting_force, spindle_speed_multiplier):
    return 0.01 * cutting_force * spindle_speed_multiplier

def compute_material_removed(feed_rate_multiplier, spindle_speed_multiplier):
    return 0.02 * feed_rate_multiplier * spindle_speed_multiplier
```

Notice how little changed from Lesson 18's environment — `action_space` is now `Box` instead of `Discrete`, `step()` reads `action[0]`/`action[1]` directly instead of decoding an integer through `_action_to_parameters`, and the process model functions are completely untouched. This is the same "the environment's internals barely change, only the interface" pattern Lesson 18, Section 4 flagged as a benefit of clean separation.

---

## 8. Complete runnable file — DDPG on the continuous CNC environment

Save as `lesson_22_practice.py`, alongside a `continuous_cnc_environment.py` containing Section 7's class.

```python
"""
Lesson 22 Practice: DDPG on continuous-action CNC cutting optimization.
Run with: python lesson_22_practice.py
"""
import numpy as np
import tensorflow as tf
from tensorflow import keras
from tensorflow.keras import layers
from collections import deque
import random
import matplotlib.pyplot as plt

from continuous_cnc_environment import ContinuousCNCCuttingEnv

DISCOUNT_FACTOR = 0.95
ACTOR_LEARNING_RATE = 0.0005
CRITIC_LEARNING_RATE = 0.001
TAU = 0.005
REPLAY_BUFFER_SIZE = 10000
BATCH_SIZE = 64
NUM_EPISODES = 300
NOISE_SCALE_START = 0.3
NOISE_SCALE_END = 0.02
NOISE_DECAY = 0.995


def build_actor(state_size, action_size, action_low, action_high):
    inputs = keras.Input(shape=(state_size,))
    hidden = layers.Dense(64, activation="relu")(inputs)
    hidden = layers.Dense(64, activation="relu")(hidden)
    raw_actions = layers.Dense(action_size, activation="tanh")(hidden)

    action_range = (action_high - action_low) / 2.0
    action_midpoint = (action_high + action_low) / 2.0
    scaled_actions = layers.Lambda(lambda a: a * action_range + action_midpoint)(raw_actions)
    return keras.Model(inputs=inputs, outputs=scaled_actions)


def build_critic(state_size, action_size):
    state_input = keras.Input(shape=(state_size,))
    action_input = keras.Input(shape=(action_size,))
    combined = layers.Concatenate()([state_input, action_input])
    hidden = layers.Dense(64, activation="relu")(combined)
    hidden = layers.Dense(64, activation="relu")(hidden)
    q_value = layers.Dense(1, activation="linear")(hidden)
    return keras.Model(inputs=[state_input, action_input], outputs=q_value)


def soft_update(target_network, online_network, tau=TAU):
    target_weights = target_network.get_weights()
    online_weights = online_network.get_weights()
    new_weights = [tau * ow + (1 - tau) * tw for ow, tw in zip(online_weights, target_weights)]
    target_network.set_weights(new_weights)


def choose_action_with_noise(actor, state, noise_scale, action_low, action_high):
    action = actor.predict(state.reshape(1, -1), verbose=0)[0]
    noise = np.random.normal(0, noise_scale, size=action.shape)
    return np.clip(action + noise, action_low, action_high)


def train_step(actor, critic, target_actor, target_critic, actor_optimizer, critic_optimizer, minibatch):
    states = np.array([t[0] for t in minibatch])
    actions = np.array([t[1] for t in minibatch])
    rewards = np.array([t[2] for t in minibatch], dtype=np.float32)
    next_states = np.array([t[3] for t in minibatch])
    dones = np.array([t[4] for t in minibatch], dtype=np.float32)

    # Critic update (Section 3)
    target_next_actions = target_actor.predict(next_states, verbose=0)
    target_next_q = target_critic.predict([next_states, target_next_actions], verbose=0).flatten()
    critic_targets = rewards + DISCOUNT_FACTOR * target_next_q * (1 - dones)

    with tf.GradientTape() as tape:
        predicted_q = critic([states, actions])
        critic_loss = tf.reduce_mean(tf.square(critic_targets.reshape(-1, 1) - predicted_q))
    critic_gradients = tape.gradient(critic_loss, critic.trainable_variables)
    critic_optimizer.apply_gradients(zip(critic_gradients, critic.trainable_variables))

    # Actor update (Section 4)
    with tf.GradientTape() as tape:
        actor_actions = actor(states)
        q_values = critic([states, actor_actions])
        actor_loss = -tf.reduce_mean(q_values)
    actor_gradients = tape.gradient(actor_loss, actor.trainable_variables)
    actor_optimizer.apply_gradients(zip(actor_gradients, actor.trainable_variables))

    # Soft target updates (Section 5)
    soft_update(target_actor, actor)
    soft_update(target_critic, critic)


def run_ddpg_training():
    environment = ContinuousCNCCuttingEnv()
    state_size = environment.observation_space.shape[0]
    action_size = environment.action_space.shape[0]
    action_low, action_high = 0.5, 1.5

    actor = build_actor(state_size, action_size, action_low, action_high)
    critic = build_critic(state_size, action_size)
    target_actor = build_actor(state_size, action_size, action_low, action_high)
    target_critic = build_critic(state_size, action_size)
    target_actor.set_weights(actor.get_weights())
    target_critic.set_weights(critic.get_weights())

    actor_optimizer = keras.optimizers.Adam(learning_rate=ACTOR_LEARNING_RATE)
    critic_optimizer = keras.optimizers.Adam(learning_rate=CRITIC_LEARNING_RATE)

    replay_buffer = deque(maxlen=REPLAY_BUFFER_SIZE)
    noise_scale = NOISE_SCALE_START
    episode_rewards = []

    for episode in range(NUM_EPISODES):
        state, info = environment.reset()
        episode_reward = 0
        done = False

        while not done:
            action = choose_action_with_noise(actor, state, noise_scale, action_low, action_high)
            next_state, reward, terminated, truncated, info = environment.step(action)
            done = terminated or truncated

            replay_buffer.append((state, action, reward, next_state, float(done)))
            episode_reward += reward
            state = next_state

            if len(replay_buffer) >= BATCH_SIZE:
                minibatch = random.sample(replay_buffer, BATCH_SIZE)
                train_step(actor, critic, target_actor, target_critic,
                           actor_optimizer, critic_optimizer, minibatch)

        noise_scale = max(NOISE_SCALE_END, noise_scale * NOISE_DECAY)
        episode_rewards.append(episode_reward)

        if (episode + 1) % 20 == 0:
            recent_average = np.mean(episode_rewards[-20:])
            print(f"Episode {episode + 1}/{NUM_EPISODES} | reward: {episode_reward:.1f} | "
                  f"last-20 avg: {recent_average:.1f} | noise: {noise_scale:.3f}")

    actor.save("cnc_ddpg_actor.keras")
    print("\nActor saved to cnc_ddpg_actor.keras")
    return actor, episode_rewards


if __name__ == "__main__":
    trained_actor, episode_rewards = run_ddpg_training()

    plt.plot(episode_rewards, alpha=0.4, label="Raw reward")
    smoothed = [np.mean(episode_rewards[max(0, i-19):i+1]) for i in range(len(episode_rewards))]
    plt.plot(smoothed, linewidth=2, label="Rolling avg (20)")
    plt.xlabel("Episode")
    plt.ylabel("Total Reward")
    plt.title("DDPG on Continuous CNC Cutting Optimization")
    plt.legend()
    plt.show()
```

---

## 9. Challenges

1. Run the trained actor on a handful of states and print its raw continuous outputs (e.g., `feed_rate = 1.14`, not one of Lesson 18's 5 presets). Compare against Lesson 19's discretized agent's typical choices — does the continuous agent settle near one of the old discrete presets, or somewhere genuinely in between them?
2. Change `TAU` from `0.005` to `0.5` (a much less "soft" update) and compare training stability. Does this confirm Section 5's reasoning about why DDPG prefers gentle target updates?
3. `tf.GradientTape()` appears here for the first time in the whole series, after 21 lessons of `model.fit()` handling gradients invisibly. Explain, in your own words, why the actor's loss specifically required dropping down to this more manual level, referencing Section 4.

---

## What's next

Lesson 23 — the final lesson — takes a trained model from anywhere in this series (this DDPG actor, the CNC DQN, or the predictive maintenance classifier) and exports it to ONNX, then shows the C# side: loading and calling it from .NET, the concrete bridge toward your Mastercam add-in work. Say the word when you're ready.
