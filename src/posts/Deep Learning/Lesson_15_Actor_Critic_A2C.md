# Lesson 15 — Actor-Critic (A2C)

**Track:** RL/Keras Mastery Arc — Week 7 (closing lesson)
**Depth:** Heavy — the synthesis of everything in Weeks 3-4, 6, and Lesson 14
**Goal by end of lesson:** You understand exactly what REINFORCE's high variance and per-episode-only training cost you, how introducing a value network ("the critic") fixes both, and you can build a working A2C agent on CartPole.

---

## 0. The two problems Actor-Critic fixes, named precisely

Lesson 14's challenges ended by pointing at two real weaknesses in REINFORCE:

1. **High variance.** `G_t` is the *actual* total return from one specific, randomly-played-out episode. Two episodes starting from similar states can end with wildly different `G_t` values just from randomness in later actions and (in stochastic environments) the environment itself — even when the early actions were equally good. REINFORCE's gradient uses this noisy `G_t` directly, so training is noisier than it needs to be.

2. **Must wait for full episodes.** REINFORCE can only update weights after an episode completes, because `G_t` requires knowing *all* future rewards. For environments with long or unbounded episodes, this means long waits between learning updates.

Actor-Critic fixes both with one addition: a second network that estimates `V(s)`, used to make the training signal more stable and available at every single step instead of only at episode's end.

---

## 1. The "actor" and the "critic" — naming the two roles

- **The actor** is the policy network from Lesson 14 — outputs action probabilities, decides what to do. Nothing new here.
- **The critic** is a value network — Lesson 4/6's `V(s)` idea, but predicted by a neural network instead of computed by value iteration or looked up in a table. Its job is to estimate how good a state is, so the actor's decisions can be judged against that baseline.

The names come from the roles' relationship: the critic doesn't act — it watches the actor's chosen actions and evaluates whether things turned out better or worse than the critic expected, and that evaluation is what shapes the actor's training signal.

---

## 2. The advantage — replacing raw `G_t` with something less noisy

Lesson 14 trained the actor using raw return `G_t` as the strength/direction of the gradient push. Actor-Critic replaces this with the **advantage**:

```
Advantage(s_t, a_t) = G_t - V(s_t)
```

Or, using a one-step version that doesn't require waiting for the full episode (this is the version that fixes Problem 2 from Section 0):

```
Advantage(s_t, a_t) ≈ r_t + γ × V(s_(t+1)) - V(s_t)
```

**Read this as:** "how much better did this action actually turn out, compared to what the critic already expected from this state?" If the critic predicted a state was worth `5`, and the action taken led to an actual (one-step-bootstrapped) outcome of `8`, the advantage is `+3` — this action did meaningfully better than baseline expectation, so push it to become more likely. If the outcome was only `4`, the advantage is `-1` — worse than expected, push it to become less likely, even though the raw return was still positive.

**Why this reduces variance (fixing Problem 1):** raw `G_t` mixes together "how good was this state to begin with" and "how good was this specific action, relative to that." Subtracting `V(s_t)` removes the first part, isolating just the part that's actually informative about *this action's* quality — a much less noisy signal, since state-to-state variation in baseline difficulty no longer swamps the action-specific signal.

This is precisely the same normalization instinct as Lesson 14, Section 4 (normalizing returns to reduce variance) — but here it's done with a principled, learned baseline (`V(s)`) instead of a batch-level statistical trick.

---

## 3. Training the critic — ordinary supervised learning, again

The critic is trained to make `V(s_t)` match the actual bootstrapped target, using plain MSE — this is exactly Lesson 4/9's supervised training loop, nothing new:

```
critic_target = r_t + γ × V(s_(t+1))
critic_loss = (critic_target - V(s_t))²
```

Notice: this is precisely the Bellman-equation-flavored target from Lesson 6/9, just predicting `V(s)` (one number) instead of `Q(s,a)` (one number per action).

---

## 4. Training the actor — same REINFORCE update, advantage instead of return

```
actor_loss = -advantage × log(π(a_t | s_t))
```

Structurally identical to Lesson 14, Section 3.3 — only the scaling term changed, from raw `G_t` to the advantage.

---

## 5. Building both networks in Keras

You can implement the actor and critic as two entirely separate `Sequential` models (simple, and what the code below uses), or as one model with two output heads sharing early layers, using the Functional API from Lesson 12, Section 2.3 (more parameter-efficient, since early feature-extraction layers can be shared — a natural extension exercise once the simple version is solid).

```python
def build_actor(state_size, num_actions):
    model = keras.Sequential([
        layers.Dense(24, activation="relu", input_shape=(state_size,)),
        layers.Dense(24, activation="relu"),
        layers.Dense(num_actions, activation="softmax")
    ])
    model.compile(optimizer=keras.optimizers.Adam(learning_rate=0.001), loss="categorical_crossentropy")
    return model


def build_critic(state_size):
    model = keras.Sequential([
        layers.Dense(24, activation="relu", input_shape=(state_size,)),
        layers.Dense(24, activation="relu"),
        layers.Dense(1, activation="linear")   # one number: V(s)
    ])
    model.compile(optimizer=keras.optimizers.Adam(learning_rate=0.001), loss="mse")
    return model
```

---

## 6. Complete runnable file — A2C on CartPole, trained every step

Save as `lesson_15_practice.py` and run with `python lesson_15_practice.py`. Notice the training loop now updates both networks **every step**, not just at episode end — Problem 2 from Section 0, resolved directly.

```python
"""
Lesson 15 Practice: Actor-Critic (A2C) on CartPole, trained every step.
Run with: python lesson_15_practice.py
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


def build_actor(state_size, num_actions):
    model = keras.Sequential([
        layers.Dense(24, activation="relu", input_shape=(state_size,)),
        layers.Dense(24, activation="relu"),
        layers.Dense(num_actions, activation="softmax")
    ])
    model.compile(optimizer=keras.optimizers.Adam(learning_rate=LEARNING_RATE),
                   loss="categorical_crossentropy")
    return model


def build_critic(state_size):
    model = keras.Sequential([
        layers.Dense(24, activation="relu", input_shape=(state_size,)),
        layers.Dense(24, activation="relu"),
        layers.Dense(1, activation="linear")
    ])
    model.compile(optimizer=keras.optimizers.Adam(learning_rate=LEARNING_RATE), loss="mse")
    return model


def choose_action(actor, state):
    action_probabilities = actor.predict(state.reshape(1, -1), verbose=0)[0]
    action = np.random.choice(len(action_probabilities), p=action_probabilities)
    return action


def train_step(actor, critic, state, action, reward, next_state, done, num_actions):
    """
    Section 2-4: one full A2C update, using the one-step bootstrapped advantage.
    This entire function runs after EVERY environment step - contrast with Lesson 14,
    where training only happened once per full episode.
    """
    state_batch = state.reshape(1, -1)
    next_state_batch = next_state.reshape(1, -1)

    current_value = critic.predict(state_batch, verbose=0)[0][0]
    next_value = 0.0 if done else critic.predict(next_state_batch, verbose=0)[0][0]

    critic_target = reward + DISCOUNT_FACTOR * next_value        # Section 3
    advantage = critic_target - current_value                     # Section 2

    critic.fit(state_batch, np.array([[critic_target]]), epochs=1, verbose=0)

    action_one_hot = np.zeros((1, num_actions))
    action_one_hot[0, action] = 1
    actor.fit(state_batch, action_one_hot, sample_weight=np.array([advantage]),
              epochs=1, verbose=0)                                 # Section 4

    return advantage


def run_a2c_training():
    environment = gym.make("CartPole-v1")
    state_size = environment.observation_space.shape[0]
    num_actions = environment.action_space.n

    actor = build_actor(state_size, num_actions)
    critic = build_critic(state_size)
    episode_rewards = []

    for episode in range(NUM_EPISODES):
        state, info = environment.reset()
        total_reward = 0

        for step in range(MAX_STEPS_PER_EPISODE):
            action = choose_action(actor, state)
            next_state, reward, terminated, truncated, info = environment.step(action)
            done = terminated or truncated

            train_step(actor, critic, state, action, reward, next_state, done, num_actions)

            total_reward += reward
            state = next_state
            if done:
                break

        episode_rewards.append(total_reward)

        if (episode + 1) % 10 == 0:
            recent_average = np.mean(episode_rewards[-10:])
            print(f"Episode {episode + 1}/{NUM_EPISODES} | "
                  f"reward: {total_reward:.0f} | last-10 avg: {recent_average:.1f}")

    environment.close()
    return actor, critic, episode_rewards


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
    plt.title("A2C on CartPole")
    plt.legend()
    plt.show()


if __name__ == "__main__":
    trained_actor, trained_critic, episode_rewards = run_a2c_training()
    plot_training_curve(episode_rewards)
```

**What to expect:** compare this reward curve to Lesson 14's directly (same environment, same episode count). A2C's curve should generally look smoother/less noisy episode-to-episode, since the advantage-based signal has lower variance than REINFORCE's raw-return signal — though CartPole is simple enough that the difference may be modest rather than dramatic. The real difference is more visible on environments with longer or more variable episodes than CartPole's relatively short, capped ones.

---

## 7. Challenges before Week 8

1. Run both Lesson 14's REINFORCE and this lesson's A2C for the same `NUM_EPISODES`, plot both reward curves on the same axes, and compare noise levels directly rather than from memory of two separately-viewed plots.
2. `train_step` calls `critic.predict` twice per step (once for `current_value`, once for `next_value`) and trains twice (`critic.fit`, `actor.fit`) — four separate network calls, every single environment step. This is computationally heavier than Lesson 14's once-per-episode training. Is this tradeoff (heavier per-step cost, lower variance, no episode-end wait) worth it on CartPole specifically? What kind of environment would make this tradeoff more clearly favorable?
3. Modify `build_actor` and `build_critic` to share their first two `Dense` layers using the Functional API (Lesson 12, Section 2.3) with two output heads instead of two fully separate models. Confirm it still trains successfully.
4. Explain, in your own words, why `next_value` is set to `0.0` when `done=True` in `train_step`, rather than calling `critic.predict` on the terminal `next_state`. (Tie this back to Lesson 6's terminal-state handling in value iteration.)

---

## Week 7 complete

Between Lessons 14 and 15, you now have both major branches of RL — value-based (Weeks 3-4, 6) and policy-based (this week) — plus the synthesis that combines them. This is genuinely close to a complete picture of the field's core toolkit, built entirely from first principles rather than API-level pattern matching.

## What's next

Week 8 — the final week — is the build week: Lesson 16 revisits Lesson 5's CNN material on a real Atari-style pixel environment (rather than a toy shape example), Lesson 17 introduces Dash for a live-updating training dashboard, and the whole arc closes with a second capstone: a harder environment, trained and visualized end to end.
