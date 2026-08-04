# Lesson 7 — Q-Learning and SARSA (Model-Free Learning)

**Track:** RL/Keras Class Prep — Week 3 (closing lesson)
**Depth:** Heavy (new algorithms, but built directly on Lesson 6's Bellman equation)
**Goal by end of lesson:** You understand the difference between "model-based" (Lesson 6) and "model-free" learning, what a Q-function is and why it's more directly useful than a state-value function, and you can implement Q-learning and SARSA by hand, from scratch, on the same grid world — no library involved yet.

---

## 0. The problem with Lesson 6's approach

Value iteration (Lesson 6) required knowing, in advance, exactly what happens for every state-action pair: the transition function and reward function were both fully known and hard-coded into `get_next_position` and `get_reward`. That's called **model-based** RL — you have a "model" of how the world works, and you can compute the optimal answer directly.

Real environments usually don't hand you that. Gym environments are typically treated as a black box: you take an action, and the environment tells you the resulting state and reward — but you don't get to inspect the rules ahead of time and compute everything by hand. **Model-free** methods, like Q-learning and SARSA, learn good behavior purely from experience — by actually taking actions, observing what happens, and gradually updating estimates — without ever needing an explicit model of the environment's rules.

---

## 1. From `V(s)` to `Q(s, a)` — why action-values are more directly useful

Lesson 6's `V(s)` tells you "how good is this state," assuming you play optimally from here on. But to actually *act*, Lesson 6 had to separately loop over every action, simulate the next state, and pick the best one (`extract_best_action`) — which required knowing the transition function.

A **Q-function**, `Q(s, a)`, sidesteps that: it directly answers "how good is it to take action `a` while in state `s`, assuming I play well after that." If you have `Q(s, a)` for every action in a state, choosing the best action is just `argmax` over the Q-values for that state — the exact same `argmax` idea from Lesson 2, no model of the environment required at decision time.

This is *why* Q-values are what your Keras network will eventually be trained to predict, starting in Lesson 9 (DQN) — a neural net that outputs `Q(s, a)` for every action, given a state, is a direct, scalable replacement for the little Q-table you're about to build by hand.

---

## 2. Temporal Difference (TD) learning — updating estimates from experience

Both Q-learning and SARSA are **TD learning** methods. The core idea: instead of waiting until an entire episode finishes to know how good an action really was, update your estimate after every single step, using your *current* estimate of the next state's value as a stand-in for "the rest of the future." This is the same recursive idea as the Bellman equation (Lesson 6, Section 5) — just applied incrementally, from real experience, instead of computed all at once from a known model.

The general TD update pattern:

```
new_estimate = old_estimate + learning_rate × (target - old_estimate)
```

- **`target`** — what you now think the true value should be, based on the reward you just observed plus your current estimate of what comes next.
- **`old_estimate`** — what you previously believed.
- **`learning_rate` (α, alpha)** — how much to trust this one new piece of experience versus your prior estimate. A high alpha learns fast but is noisy; a low alpha learns slowly but more stably. This plays a very similar role to the learning rate inside Keras's optimizer from Lesson 4 — same underlying idea, different algorithm.

---

## 3. Q-learning — the update rule

```
Q(s, a) = Q(s, a) + α × [ R + γ × max(Q(s', all actions)) − Q(s, a) ]
```

- `s, a` — the state and action you just took.
- `R` — the reward you actually observed.
- `s'` — the state you actually landed in.
- `max(Q(s', all actions))` — the **best possible** Q-value from the next state, regardless of what action you'll actually take next. This is the key detail: Q-learning always assumes you'll act optimally from `s'` onward, even while you're still exploring and might not.

**This "assumes optimal future behavior regardless of actual future behavior" property makes Q-learning "off-policy"** — the update doesn't care what policy you're actually following (which might include random exploration moves); it always learns toward the best possible outcome.

---

## 4. SARSA — the update rule, and the one-word difference that matters

SARSA's name comes from the five things it needs: **S**tate, **A**ction, **R**eward, next **S**tate, next **A**ction.

```
Q(s, a) = Q(s, a) + α × [ R + γ × Q(s', a') − Q(s, a) ]
```

Compare this closely to Q-learning above. The *only* difference: instead of `max(Q(s', all actions))`, SARSA uses `Q(s', a')` — the Q-value of the action you **actually take next**, whatever that turns out to be (including a random exploration move).

**This makes SARSA "on-policy"** — it learns the value of the policy you're actually following, exploration mistakes included, rather than always assuming optimal play. In practice, this tends to make SARSA more "cautious" — if your exploration strategy sometimes risks walking near the trap, SARSA's learned values will reflect that real risk, while Q-learning's won't (since Q-learning always assumes you'd play optimally afterward, even if you actually wouldn't).

---

## 5. Exploration — the epsilon-greedy strategy

If the agent always picks the action with the highest current Q-value, it can get stuck exploiting a mediocre strategy it found early on, never discovering a better one. **Epsilon-greedy** balances this:

```
with probability ε (epsilon):  take a completely random action (explore)
with probability 1 − ε:        take the action with the highest known Q-value (exploit)
```

A common pattern is to start with a high epsilon (e.g., `1.0` — always explore at first, since your Q-values are all zero and meaningless anyway) and gradually **decay** it toward a small value (e.g., `0.05`) over training, shifting from "mostly random exploration" early on to "mostly exploit what's been learned" later. You'll see this exact pattern again in Lesson 9's DQN.

---

## 6. Complete runnable file — Q-learning and SARSA on Lesson 6's grid

Save as `lesson_07_practice.py` and run with `python lesson_07_practice.py`. Same grid, same rewards, same discount factor as Lesson 6 — but this time the agent doesn't get to peek at `get_next_position`/`get_reward` to plan ahead; it only learns from actually taking steps.

```python
"""
Lesson 7 Practice: Q-learning and SARSA, from scratch, on the Lesson 6 grid world.
Run with: python lesson_07_practice.py
"""
import numpy as np
import random

GRID_SIZE = 3
GOAL_POSITION = (2, 2)
TRAP_POSITION = (1, 1)
START_POSITION = (0, 0)
DISCOUNT_FACTOR = 0.9
LEARNING_RATE = 0.1
STEP_PENALTY = -1
GOAL_REWARD = 10
TRAP_REWARD = -10
NUM_EPISODES = 500
MAX_STEPS_PER_EPISODE = 50

ACTIONS = ["up", "down", "left", "right"]
ACTION_DELTAS = {
    "up": (-1, 0),
    "down": (1, 0),
    "left": (0, -1),
    "right": (0, 1)
}


def is_valid_position(position):
    row, col = position
    return 0 <= row < GRID_SIZE and 0 <= col < GRID_SIZE


def step_environment(position, action):
    """This simulates 'the environment' - the agent does NOT get to inspect this function's logic."""
    row_delta, col_delta = ACTION_DELTAS[action]
    next_position = (position[0] + row_delta, position[1] + col_delta)
    if not is_valid_position(next_position):
        next_position = position  # wall - stay in place

    if next_position == GOAL_POSITION:
        return next_position, GOAL_REWARD, True
    if next_position == TRAP_POSITION:
        return next_position, TRAP_REWARD, True
    return next_position, STEP_PENALTY, False


def create_empty_q_table():
    # Q[row][col][action] = estimated value of taking that action from that cell
    return {
        (row, col): {action: 0.0 for action in ACTIONS}
        for row in range(GRID_SIZE)
        for col in range(GRID_SIZE)
    }


def choose_epsilon_greedy_action(q_table, position, epsilon):
    if random.random() < epsilon:
        return random.choice(ACTIONS)
    action_values = q_table[position]
    return max(action_values, key=action_values.get)   # argmax over a dict, Lesson 2's idea


def train_q_learning(num_episodes=NUM_EPISODES):
    q_table = create_empty_q_table()
    epsilon = 1.0
    epsilon_decay = 0.995
    min_epsilon = 0.05

    for episode in range(num_episodes):
        position = START_POSITION
        for step in range(MAX_STEPS_PER_EPISODE):
            action = choose_epsilon_greedy_action(q_table, position, epsilon)
            next_position, reward, done = step_environment(position, action)

            best_next_value = max(q_table[next_position].values())  # Q-learning: max over next actions
            old_estimate = q_table[position][action]
            target = reward + DISCOUNT_FACTOR * best_next_value
            q_table[position][action] = old_estimate + LEARNING_RATE * (target - old_estimate)

            position = next_position
            if done:
                break

        epsilon = max(min_epsilon, epsilon * epsilon_decay)

    return q_table


def train_sarsa(num_episodes=NUM_EPISODES):
    q_table = create_empty_q_table()
    epsilon = 1.0
    epsilon_decay = 0.995
    min_epsilon = 0.05

    for episode in range(num_episodes):
        position = START_POSITION
        action = choose_epsilon_greedy_action(q_table, position, epsilon)

        for step in range(MAX_STEPS_PER_EPISODE):
            next_position, reward, done = step_environment(position, action)
            next_action = choose_epsilon_greedy_action(q_table, next_position, epsilon)

            next_value = q_table[next_position][next_action]  # SARSA: the action ACTUALLY taken next
            old_estimate = q_table[position][action]
            target = reward + DISCOUNT_FACTOR * next_value
            q_table[position][action] = old_estimate + LEARNING_RATE * (target - old_estimate)

            position = next_position
            action = next_action
            if done:
                break

        epsilon = max(min_epsilon, epsilon * epsilon_decay)

    return q_table


def print_best_actions(q_table, label):
    print(f"--- Best action per cell ({label}) ---")
    for row in range(GRID_SIZE):
        for col in range(GRID_SIZE):
            position = (row, col)
            if position in (GOAL_POSITION, TRAP_POSITION):
                continue
            action_values = q_table[position]
            best_action = max(action_values, key=action_values.get)
            print(f"From {position}: best action = {best_action}  (Q-values: "
                  f"{ {a: round(v, 2) for a, v in action_values.items()} })")
    print()


if __name__ == "__main__":
    print("--- Training Q-learning ---")
    q_learning_table = train_q_learning()
    print_best_actions(q_learning_table, "Q-learning")

    print("--- Training SARSA ---")
    sarsa_table = train_sarsa()
    print_best_actions(sarsa_table, "SARSA")
```

**What to expect:** after 500 episodes, both algorithms should converge on best-action paths from every cell that route toward the goal `(2,2)` while avoiding the trap `(1,1)` — broadly matching what value iteration found in Lesson 6, but learned purely from trial-and-error experience this time, with no access to `step_environment`'s internal logic during decision-making (only its return values, exactly like a real Gym environment will provide).

---

## 7. Challenges before Lesson 8

1. Run the file and compare the final Q-learning and SARSA best-action grids. Are they identical? If any cells differ, especially ones near the trap, that's Section 4's on-policy/off-policy distinction showing up concretely.
2. Reduce `NUM_EPISODES` from 500 to 20 and re-run. Do the learned Q-values look reasonable, or clearly under-trained? Relate this to Lesson 6's "information propagates outward over passes" idea — the same kind of propagation is happening here, just via random exploration instead of exhaustive sweeps.
3. Change `epsilon_decay` from `0.995` to `0.9` (much faster decay — the agent stops exploring much sooner) and re-run with `NUM_EPISODES = 500`. Does performance get better or worse? Why might exploring for less time hurt here?
4. Add a print statement inside `train_q_learning` that tracks total reward per episode into a list, then plot it with Matplotlib (Lesson 3's rolling-average technique). Does the reward trend upward as training progresses?

---

## Week 3 complete

You've now built both the model-based approach (value iteration, Lesson 6) and two model-free approaches (Q-learning and SARSA, this lesson) entirely by hand, with a clear picture of what problem each one solves and what "learning from experience without knowing the rules" actually looks like in code.

## What's next

Week 4 — the final week — introduces Gym for real (finally putting a name to the `step_environment`-style interface you've been hand-rolling), then Deep Q-Networks (DQN): replacing the Q-*table* you just built with a Keras neural network, for environments too large to tabulate every state by hand.
