# Final Capstone — LunarLander, a Real Agent, Visualized Live

**Track:** RL/Keras Mastery Arc — Final Capstone
**Depth:** Consolidation — no new concepts, full integration of Weeks 1-8
**Goal:** One complete project: a Double+Dueling DQN agent (Lesson 12) trained on LunarLander-v2 — a genuinely harder environment than CartPole — with training visualized live through the Dash dashboard from Lesson 17. Every piece is something you built, from the vectors in Lesson 1 to the dashboard in Lesson 17.

---

## 0. Why LunarLander, and why this combination of techniques

**LunarLander-v2** is a natural step up from CartPole: instead of balancing a pole, you're controlling a lander's engines to touch down gently between two flags, with a continuous physics simulation and a richer, 8-dimensional state (`[x, y, x_velocity, y_velocity, angle, angular_velocity, left_leg_contact, right_leg_contact]`) and 4 discrete actions (do nothing, fire left engine, fire main engine, fire right engine). It's meaningfully harder than CartPole — sparser, more shaped rewards, and a genuinely non-trivial control problem — while still being small enough to train in a reasonable time without needing pixel input or a GPU.

**Why Double+Dueling DQN specifically:** LunarLander is exactly the kind of environment where Lesson 12's two fixes tend to matter more than they did on CartPole — states where the specific action barely matters (drifting mid-air) benefit from Dueling's value/advantage split, and the richer reward structure benefits from Double DQN's reduced overestimation bias. This is a good real test of whether Lesson 12's challenge #1 observation ("does this visibly help on CartPole specifically") lands differently on a harder environment — worth comparing honestly.

---

## 1. Setup

```
pip install "gymnasium[box2d]" dash
```

(`box2d` is the physics engine LunarLander is built on — a separate install extra from the Atari one in Lesson 16.)

---

## 2. The concept map, one final time

| Piece | Lesson | Role in this capstone |
|---|---|---|
| Vectors, matrices, `@` | 1 | The 8-dimensional LunarLander state; every `Dense` layer's computation |
| `reshape`, `argmax` | 2 | Batching single states; choosing actions from Q-values |
| Reward plotting | 3 | The dashboard's live reward chart (now via Dash instead of matplotlib) |
| `Dense`, `compile`, `fit` | 4 | The shared hidden layers of the Q-network |
| Bellman equation | 6 | The target calculation every training step |
| Q-learning, epsilon-greedy | 7 | The core update rule and exploration strategy |
| Gym's `reset`/`step` | 8 | The environment interface, now for `LunarLander-v2` |
| DQN, replay buffer, target network | 9 | The base training algorithm |
| Chain rule, backprop | 10 | What `model.fit()` is doing underneath, every call |
| Transpose | 11 | Why gradients can flow backward through `Dense` layers at all |
| Double DQN, Dueling DQN | 12 | The specific architecture and target-calculation used here |
| Dash, threading | 17 | The live dashboard this capstone trains inside of |

If you can explain every row without checking back, the series has done its job.

---

## 3. The agent — Double+Dueling DQN, adapted for LunarLander

This is Lesson 12's code, with two changes: the environment name, and slightly adjusted hyperparameters (LunarLander benefits from a somewhat larger network and more episodes than CartPole needed).

```python
from tensorflow import keras
from tensorflow.keras import layers

def build_dueling_q_network(state_size, num_actions):
    inputs = keras.Input(shape=(state_size,))

    shared = layers.Dense(128, activation="relu")(inputs)
    shared = layers.Dense(128, activation="relu")(shared)

    value_stream = layers.Dense(1, activation="linear")(shared)
    advantage_stream = layers.Dense(num_actions, activation="linear")(shared)

    mean_advantage = layers.Lambda(
        lambda a: a - keras.ops.mean(a, axis=1, keepdims=True)
    )(advantage_stream)

    q_values = layers.Add()([value_stream, mean_advantage])

    model = keras.Model(inputs=inputs, outputs=q_values)
    model.compile(optimizer=keras.optimizers.Adam(learning_rate=0.0005), loss="mse")
    return model
```

Wider hidden layers (`128` instead of Lesson 12's `24`) give the network more capacity for LunarLander's richer 8-dimensional state and more complex dynamics — a reasonable, standard adjustment when moving to a harder environment, not a change in the underlying algorithm.

---

## 4. Complete runnable file — full capstone, training visualized live in Dash

Save as `final_capstone.py` and run with `python final_capstone.py`, then open `http://127.0.0.1:8050`. Training will take longer than CartPole's runs did — LunarLander is a genuinely harder problem — so watching it live in the dashboard, rather than waiting for a final static plot, is exactly the point of Lesson 17's addition.

```python
"""
Final Capstone: Double+Dueling DQN on LunarLander-v2, visualized live via Dash.
Run with: python final_capstone.py, then open http://127.0.0.1:8050
(Requires: pip install "gymnasium[box2d]" dash)
"""
import random
import threading
from collections import deque

import numpy as np
import gymnasium as gym
from tensorflow import keras
from tensorflow.keras import layers
from dash import Dash, html, dcc, Output, Input
import plotly.graph_objects as go

DISCOUNT_FACTOR = 0.99
LEARNING_RATE = 0.0005
REPLAY_BUFFER_SIZE = 50000
BATCH_SIZE = 64
TARGET_SYNC_EVERY_STEPS = 500
NUM_EPISODES = 400
MAX_STEPS_PER_EPISODE = 1000
STARTING_EPSILON = 1.0
MIN_EPSILON = 0.02
EPSILON_DECAY = 0.995

training_state = {
    "episode_rewards": [],
    "current_epsilon": STARTING_EPSILON,
    "current_episode": 0,
    "total_episodes": NUM_EPISODES
}
state_lock = threading.Lock()


def build_dueling_q_network(state_size, num_actions):
    """Lesson 12, Section 2.3 - unchanged architecture pattern, wider layers (Section 3)."""
    inputs = keras.Input(shape=(state_size,))
    shared = layers.Dense(128, activation="relu")(inputs)
    shared = layers.Dense(128, activation="relu")(shared)

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
    """Lesson 7 + Lesson 2."""
    if random.random() < epsilon:
        return random.randrange(num_actions)
    q_values = online_network.predict(state.reshape(1, -1), verbose=0)[0]
    return int(np.argmax(q_values))


def train_on_minibatch(online_network, target_network, replay_buffer, num_actions):
    """Lesson 12, Section 1.2 - Double DQN's select-with-online, evaluate-with-target split."""
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


def run_training_in_background():
    """Lesson 9's full training loop (Lesson 8's Gym interface), now sharing state with Dash (Lesson 17)."""
    environment = gym.make("LunarLander-v2")
    state_size = environment.observation_space.shape[0]
    num_actions = environment.action_space.n

    online_network = build_dueling_q_network(state_size, num_actions)
    target_network = build_dueling_q_network(state_size, num_actions)
    target_network.set_weights(online_network.get_weights())

    replay_buffer = deque(maxlen=REPLAY_BUFFER_SIZE)
    epsilon = STARTING_EPSILON
    total_steps = 0

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

        with state_lock:   # Lesson 17, Section 4
            training_state["episode_rewards"].append(episode_reward)
            training_state["current_epsilon"] = epsilon
            training_state["current_episode"] = episode + 1

    environment.close()
    online_network.save("lunarlander_dqn_model.keras")
    print("\nTraining complete. Model saved to lunarlander_dqn_model.keras")


# --- Dash dashboard (Lesson 17) ---
app = Dash(__name__)

app.layout = html.Div([
    html.H1("Final Capstone: Double+Dueling DQN on LunarLander"),
    html.Div(id="status-text"),
    dcc.Graph(id="reward-graph"),
    dcc.Interval(id="update-timer", interval=1000, n_intervals=0)
])


@app.callback(
    Output("status-text", "children"),
    Output("reward-graph", "figure"),
    Input("update-timer", "n_intervals")
)
def update_dashboard(n_intervals):
    with state_lock:
        rewards = list(training_state["episode_rewards"])
        epsilon = training_state["current_epsilon"]
        episode = training_state["current_episode"]
        total = training_state["total_episodes"]

    status_text = f"Episode {episode} / {total} | Current epsilon: {epsilon:.3f}"

    figure = go.Figure()
    figure.add_trace(go.Scatter(y=rewards, mode="lines", name="Reward", opacity=0.4))
    if len(rewards) >= 10:
        rolling_avg = [
            sum(rewards[max(0, i - 9):i + 1]) / len(rewards[max(0, i - 9):i + 1])
            for i in range(len(rewards))
        ]
        figure.add_trace(go.Scatter(y=rolling_avg, mode="lines", name="Rolling avg (10)",
                                      line=dict(width=3)))
    figure.update_layout(title="LunarLander Training Reward (live)",
                          xaxis_title="Episode", yaxis_title="Reward")

    return status_text, figure


if __name__ == "__main__":
    training_thread = threading.Thread(target=run_training_in_background, daemon=True)
    training_thread.start()

    app.run(debug=True, use_reloader=False)
```

**What to expect:** LunarLander's reward scale is different from CartPole's — a landing that's "solved" typically scores around 200+, crashes score negatively, and the reward curve tends to be noisier for longer before a clear upward trend emerges, since the problem is genuinely harder. Watching the rolling average in the live dashboard over the course of training (this will take a while — likely 20+ minutes depending on your machine) is the intended way to track this, exactly as Lesson 3's original rolling-average technique argued for, now applied live instead of after the fact.

---

## 5. Final challenges — genuinely open-ended

These aren't graded exercises so much as directions worth exploring on your own, using everything the series built:

1. Swap in Lesson 13's Prioritized Experience Replay in place of the uniform `random.sample` here. Does it help more visibly on LunarLander than it seemed to on CartPole?
2. Try Lesson 15's A2C instead of DQN on LunarLander. Which trains more smoothly on this specific environment, and can you explain why in terms of the variance/bootstrapping tradeoffs from Lesson 15, Section 0?
3. Add a second dashboard graph tracking landing success rate (episodes ending with a positive final reward) over a rolling window, alongside raw reward — a genuinely different, complementary way of measuring "is this working" than total reward alone.
4. Once trained, load the saved model (`keras.models.load_model("lunarlander_dqn_model.keras")`) and run a handful of evaluation episodes with `epsilon=0` and `render_mode="human"` in `gym.make(...)`, so you can actually *watch* the lander you trained.

---

## Series complete

Seventeen lessons plus two capstones, from "what is a vector" to a live-monitored Double+Dueling DQN agent landing a spacecraft. Every library call across the whole series traces back to math or code you built by hand somewhere along the way — that's the actual asset you're walking into your class with, not just a working final script.

Good luck with the class.
