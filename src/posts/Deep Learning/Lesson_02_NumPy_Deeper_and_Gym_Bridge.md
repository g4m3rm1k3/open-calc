# Lesson 2 — NumPy Deeper, and the Bridge into Gym

**Track:** RL/Keras Class Prep — Week 1
**Depth:** Full treatment (new material — no prior assumed beyond Lesson 1)
**Goal by end of lesson:** You're comfortable reshaping arrays, using `argmax` to pick "the best option" from a list of scores, and reading basic descriptive stats. You'll also see, concretely, why Gym describes environments the way it does — so when Week 3 introduces Gym for real, the vocabulary is already familiar instead of new.

---

## 0. Quick recap check

From Lesson 1 you should be able to answer, without looking back: what does `.shape` tell you, and why must the inner dimensions match for matrix multiplication? If either is fuzzy, it's worth a 5-minute re-read before continuing — everything below builds on shapes being solid.

---

## 1. Reshaping — changing an array's shape without changing its data

The same numbers can be arranged into different shapes. Reshaping doesn't move or change any values — it just relabels how they're grouped into rows/columns.

```python
import numpy as np

flat_data = np.array([1, 2, 3, 4, 5, 6])
print(flat_data.shape)   # (6,)

reshaped = flat_data.reshape(2, 3)
print(reshaped)
# [[1 2 3]
#  [4 5 6]]
print(reshaped.shape)    # (2, 3)

reshaped_again = flat_data.reshape(3, 2)
print(reshaped_again)
# [[1 2]
#  [3 4]
#  [5 6]]
```

**Rule:** the total number of elements must stay the same. `reshape(2, 3)` works on 6 elements (2×3=6). `reshape(4, 2)` would fail (4×2=8 ≠ 6) — try it and read the error once, so you recognize it later.

### Why this matters for RL specifically
Gym often hands you a state as a flat 1D array, but Keras models frequently expect input with an explicit "batch dimension" — even for a single example. You'll routinely see code like:

```python
single_state = np.array([0.1, -0.2, 0.05, 0.3])   # shape (4,)
model_input = single_state.reshape(1, 4)            # shape (1, 4) - "a batch of 1"
```

That `reshape(1, 4)` isn't decoration — Keras models are built to expect `(batch_size, features)`, so a single state has to be reshaped into a "batch of one" before you can feed it in. This exact line will show up constantly once you're calling `model.predict()` on Gym states.

---

## 2. `argmax` — picking the best option, in code

`argmax` returns the **index** of the largest value in an array — not the value itself, the *position*.

```python
scores = np.array([2.1, 5.7, 3.3, 5.7])
best_index = np.argmax(scores)
print(best_index)   # 1  (the first occurrence of the max value, 5.7)
```

### Why this is the single most-used function in your entire RL class

In RL, an agent typically has a neural network that outputs one score per possible action — "how good do I think each action is." To actually *act*, the agent needs to turn those scores into a decision: pick the action with the highest score.

```python
# Pretend a CartPole agent has 2 possible actions: 0 = push left, 1 = push right
action_scores = np.array([0.3, 0.8])   # the model's output: "right looks better"
chosen_action = np.argmax(action_scores)
print(chosen_action)   # 1 -> push right
```

That's it — that's how "the agent decides what to do" works mechanically, in nearly every value-based RL algorithm you'll meet in Week 3 and Week 4 (Q-learning, DQN). `argmax` is the line of code between "the network computed some numbers" and "the agent took an action."

### 2D case — argmax with an axis
When you have a batch of score-rows (multiple states at once), you specify `axis=1` to get the best action *per row*, instead of one single answer for the whole matrix.

```python
batch_of_scores = np.array([
    [0.3, 0.8],   # state 1: action 1 looks best
    [0.9, 0.1]    # state 2: action 0 looks best
])
best_actions = np.argmax(batch_of_scores, axis=1)
print(best_actions)   # [1 0]
```

`axis=1` means "look across columns, within each row" — i.e., compare the action-scores *within* each state, not across different states. This is worth testing with `axis=0` too, just to see the difference and make the rule stick.

---

## 3. Basic descriptive stats — reading how training is going

You won't need heavy statistics for this class, but these four functions show up constantly when checking how an RL agent is doing over many episodes.

```python
episode_rewards = np.array([12, 45, 8, 60, 33, 71, 15])

print("Mean:", np.mean(episode_rewards))     # average reward - is the agent improving on average?
print("Max:", np.max(episode_rewards))       # best episode so far
print("Min:", np.min(episode_rewards))       # worst episode so far
print("Std Dev:", np.std(episode_rewards))   # how much rewards vary episode-to-episode
```

**Why standard deviation matters here specifically:** a high std dev means the agent's performance is wildly inconsistent — sometimes great, sometimes terrible — which is normal early in training but should generally shrink as training progresses. It's one of the simplest signals for "is this actually learning or just noisy."

---

## 4. The bridge: why Gym looks the way it does

You haven't installed or used Gym yet (that's Week 3), but here's the piece worth previewing now, because it's *entirely* built from what you just learned.

Every Gym environment defines two things:

- **`observation_space`** — describes the shape/type of the state vector the environment will hand you. For CartPole, this is a 4-dimensional vector: `[cart position, cart velocity, pole angle, pole angular velocity]`. That's exactly the kind of vector from Lesson 1, Section 1.
- **`action_space`** — describes what actions are available. For CartPole, there are 2 discrete actions (push left / push right) — exactly the kind of "array of action scores" you just ran `argmax` on in Section 2.

So the entire agent loop you'll write in Week 4 is, mechanically, nothing more than:

1. Get a state vector from the environment (a NumPy array, shape like `(4,)`).
2. Reshape it into a batch of one (Section 1) and feed it to a Keras model.
3. Get back an array of action scores.
4. `np.argmax` the scores to choose an action (Section 2).
5. Track `episode_rewards` over time to see if it's learning (Section 3).

Nothing in that list is new to you anymore — you now have all five pieces. Week 3 just introduces the environment object that produces step 1 and consumes step 4's chosen action.

---

## 5. Complete runnable file

Save as `lesson_02_practice.py` and run with `python lesson_02_practice.py`.

```python
"""
Lesson 2 Practice: Reshaping, argmax, basic stats, and a simulated Gym-style loop
Run with: python lesson_02_practice.py
"""
import numpy as np


def demonstrate_reshape():
    print("--- Reshaping (Section 1) ---")
    flat_data = np.array([1, 2, 3, 4, 5, 6])
    print("Original shape:", flat_data.shape)

    as_two_by_three = flat_data.reshape(2, 3)
    print("Reshaped to (2, 3):\n", as_two_by_three)

    single_state = np.array([0.1, -0.2, 0.05, 0.3])
    batch_of_one = single_state.reshape(1, 4)
    print("Single state shape:", single_state.shape, "-> batched shape:", batch_of_one.shape)
    print()


def demonstrate_argmax():
    print("--- argmax (Section 2) ---")
    action_scores = np.array([0.3, 0.8])
    chosen_action = np.argmax(action_scores)
    print("Action scores:", action_scores, "-> chosen action index:", chosen_action)

    batch_of_scores = np.array([
        [0.3, 0.8],
        [0.9, 0.1]
    ])
    best_actions_per_state = np.argmax(batch_of_scores, axis=1)
    print("Batch of scores:\n", batch_of_scores)
    print("Best action per state (axis=1):", best_actions_per_state)
    print()


def demonstrate_stats():
    print("--- Basic stats (Section 3) ---")
    episode_rewards = np.array([12, 45, 8, 60, 33, 71, 15])
    print("Rewards:", episode_rewards)
    print("Mean:", np.mean(episode_rewards))
    print("Max:", np.max(episode_rewards))
    print("Min:", np.min(episode_rewards))
    print("Std Dev:", round(float(np.std(episode_rewards)), 2))
    print()


def simulate_gym_style_decision_loop():
    print("--- Simulated Gym-style decision loop (Section 4) ---")
    # Fake "environment" state - stands in for what Gym will hand you in Week 3
    current_state = np.array([0.02, -0.1, 0.01, 0.05])

    # Fake "model output" - stands in for what a Keras model.predict() will hand you
    def fake_model_predict(state_batch):
        # Pretend the model always slightly favors action 1 for demonstration purposes
        return np.array([[0.4, 0.6]])

    state_batch = current_state.reshape(1, 4)
    action_scores = fake_model_predict(state_batch)
    chosen_action = np.argmax(action_scores, axis=1)[0]

    print("Current state:", current_state)
    print("Batched for model:", state_batch, "shape:", state_batch.shape)
    print("Model's action scores:", action_scores)
    print("Chosen action:", chosen_action)
    print()


if __name__ == "__main__":
    demonstrate_reshape()
    demonstrate_argmax()
    demonstrate_stats()
    simulate_gym_style_decision_loop()
```

---

## 6. Challenges before moving on

1. Take `np.array([1, 2, 3, 4, 5, 6, 7, 8, 9])` and reshape it into `(3, 3)`. Then try `(2, 5)` on purpose and read the error message it gives you.
2. Given `scores = np.array([1.2, 9.4, 3.3, 9.4, 0.1])`, predict on paper which index `np.argmax` will return before running it. (Hint: what happens with ties?)
3. Build a fake `batch_of_scores` for 3 states and 4 possible actions (shape `(3, 4)`), and get the best action per state using `argmax` with the correct axis.
4. In `simulate_gym_style_decision_loop()`, change `fake_model_predict` so it favors action 0 instead, and confirm `chosen_action` changes accordingly.

---

## What's next

Week 1 wraps up with Lesson 3: Pandas basics (only the slice you'll actually need — loading/inspecting tabular data) and Matplotlib (plotting `episode_rewards` over time, since "does the reward curve trend upward" is the single most common chart you'll produce this entire class). Then Week 2 begins the heavy dive into Keras itself.
