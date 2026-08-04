# Lesson 3 — Pandas Basics and Plotting Training Curves

**Track:** RL/Keras Class Prep — Week 1 (final lesson of the week)
**Depth:** Light-to-medium (Pandas: only the slice you'll actually use; Matplotlib: full treatment since you'll use it every single week from here on)
**Goal by end of lesson:** You can load and glance at tabular data with Pandas when a dataset shows up, and — more importantly — you can plot an RL training curve (reward vs. episode) and actually read what it's telling you.

---

## 0. Why Pandas gets the light treatment here

Pandas is a huge library built for tabular data analysis — spreadsheets, CSVs, database-style data. Your RL/Keras class will barely touch it; most of what you'll load is either raw arrays (states, rewards) or image-like data (for CNNs), not spreadsheets. So this lesson covers the 20% of Pandas you'll realistically need, not the full library. If a future project needs more, that's its own lesson.

---

## 1. Pandas — the essential slice

### 1.1 The core object: a DataFrame

A **DataFrame** is a table — rows and columns, with labeled column names (unlike a NumPy array, which has no built-in column labels).

```python
import pandas as pd

data = {
    "episode": [1, 2, 3, 4],
    "reward": [12, 45, 8, 60],
    "steps_taken": [20, 55, 15, 70]
}
training_log = pd.DataFrame(data)
print(training_log)
#    episode  reward  steps_taken
# 0        1      12           20
# 1        2      45           55
# 2        3       8           15
# 3        4      60           70
```

### 1.2 Loading from a CSV

If you're handed a dataset file (common for the intro chapters of "Applied RL" books, before they switch to Gym-generated data):

```python
# training_log = pd.read_csv("training_results.csv")
```

(Commented out here since there's no file yet — this is the line you'll actually use when one exists.)

### 1.3 Quick inspection — the three commands you'll use constantly

```python
print(training_log.head())    # first 5 rows - "what does this data look like"
print(training_log.shape)     # (rows, columns) - same concept as NumPy's .shape
print(training_log.describe())  # count, mean, std, min, max, etc. per column - instant stats
```

### 1.4 Selecting a column

```python
reward_column = training_log["reward"]
print(reward_column)
print(type(reward_column))   # pandas.Series - a single labeled column, 1D
```

### 1.5 Converting to NumPy when you need to

Since your RL/Keras code will mostly want NumPy arrays, not DataFrames, this conversion is the actual bridge between "loaded some data" and "fed it into a model":

```python
rewards_as_array = training_log["reward"].to_numpy()
print(rewards_as_array)       # [12 45  8 60]
print(type(rewards_as_array)) # numpy.ndarray
```

That's genuinely most of what you'll need from Pandas for this class. If it comes up more, it'll get its own lesson later.

---

## 2. Matplotlib — full treatment, because you'll use this every week

Unlike Pandas, plotting is something you'll do constantly: "is my agent's reward trending up?" is the single most common question in RL, and the answer comes from a chart, not a printed number.

### 2.1 The simplest possible plot

```python
import matplotlib.pyplot as plt

episode_rewards = [12, 45, 8, 60, 33, 71, 15, 80, 42, 90]

plt.plot(episode_rewards)
plt.xlabel("Episode")
plt.ylabel("Reward")
plt.title("Reward per Episode")
plt.show()
```

- `plt.plot(...)` draws the line. By default, it plots your values against their index (0, 1, 2, ...) on the x-axis — which is exactly "episode number" if your list is in order.
- `plt.xlabel` / `plt.ylabel` / `plt.title` are just labels — always add them. An unlabeled chart is nearly useless once you have more than one on screen.
- `plt.show()` actually renders the window. Forgetting this line is the #1 reason people think "my plot did nothing."

### 2.2 Reading a noisy RL reward curve

Real RL training curves are noisy — they jump around episode-to-episode even while genuinely improving. This is normal, not a bug. A common trick is plotting a **rolling average** alongside the raw data so the trend is visible through the noise:

```python
import numpy as np
import matplotlib.pyplot as plt

episode_rewards = np.array([12, 45, 8, 60, 33, 71, 15, 80, 42, 90, 55, 95, 60, 100, 70])

def rolling_average(values, window_size):
    """Average of the last `window_size` values, for each point."""
    result = []
    for i in range(len(values)):
        start_index = max(0, i - window_size + 1)
        window = values[start_index:i + 1]
        result.append(np.mean(window))
    return np.array(result)

smoothed_rewards = rolling_average(episode_rewards, window_size=3)

plt.plot(episode_rewards, label="Raw reward", alpha=0.4)   # alpha = transparency, so it doesn't dominate
plt.plot(smoothed_rewards, label="Rolling average (window=3)", linewidth=2)
plt.xlabel("Episode")
plt.ylabel("Reward")
plt.title("Reward per Episode (raw vs. smoothed)")
plt.legend()
plt.show()
```

**Why this matters mechanically, not just cosmetically:** the raw line bounces around too much to tell "is this actually improving" at a glance. The smoothed line is what you'll actually look at and report — this exact pattern (raw + rolling average, on one chart) is close to a standard in every RL training script you'll encounter this class, including likely ones straight out of your textbook.

### 2.3 Multiple subplots — comparing things side by side

Sometimes you want reward and steps-per-episode on separate charts, stacked:

```python
import matplotlib.pyplot as plt

episode_rewards = [12, 45, 8, 60, 33, 71]
steps_per_episode = [20, 55, 15, 70, 40, 85]

figure, (reward_axis, steps_axis) = plt.subplots(2, 1, figsize=(8, 6))

reward_axis.plot(episode_rewards)
reward_axis.set_title("Reward per Episode")
reward_axis.set_ylabel("Reward")

steps_axis.plot(steps_per_episode, color="orange")
steps_axis.set_title("Steps per Episode")
steps_axis.set_xlabel("Episode")
steps_axis.set_ylabel("Steps")

plt.tight_layout()   # prevents titles/labels from overlapping between subplots
plt.show()
```

`plt.subplots(2, 1, ...)` means "2 rows, 1 column" of charts. `figsize=(8, 6)` sets the overall image size in inches (width, height) — worth knowing so charts don't come out tiny or absurdly stretched.

---

## 3. Complete runnable file

Save as `lesson_03_practice.py` and run with `python lesson_03_practice.py`. This will open plot windows — close each one to let the script continue to the next.

```python
"""
Lesson 3 Practice: Pandas basics + Matplotlib training-curve plotting
Run with: python lesson_03_practice.py
"""
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt


def demonstrate_pandas_basics():
    print("--- Pandas basics (Section 1) ---")
    data = {
        "episode": [1, 2, 3, 4, 5],
        "reward": [12, 45, 8, 60, 33],
        "steps_taken": [20, 55, 15, 70, 40]
    }
    training_log = pd.DataFrame(data)

    print(training_log.head())
    print("Shape:", training_log.shape)
    print(training_log.describe())

    rewards_as_array = training_log["reward"].to_numpy()
    print("Rewards as NumPy array:", rewards_as_array, type(rewards_as_array))
    print()
    return rewards_as_array


def rolling_average(values, window_size):
    result = []
    for i in range(len(values)):
        start_index = max(0, i - window_size + 1)
        window = values[start_index:i + 1]
        result.append(np.mean(window))
    return np.array(result)


def plot_simple_reward_curve(episode_rewards):
    print("--- Simple plot (Section 2.1) ---")
    plt.plot(episode_rewards)
    plt.xlabel("Episode")
    plt.ylabel("Reward")
    plt.title("Reward per Episode")
    plt.show()


def plot_smoothed_reward_curve(episode_rewards):
    print("--- Raw vs. smoothed (Section 2.2) ---")
    smoothed_rewards = rolling_average(episode_rewards, window_size=3)

    plt.plot(episode_rewards, label="Raw reward", alpha=0.4)
    plt.plot(smoothed_rewards, label="Rolling average (window=3)", linewidth=2)
    plt.xlabel("Episode")
    plt.ylabel("Reward")
    plt.title("Reward per Episode (raw vs. smoothed)")
    plt.legend()
    plt.show()


def plot_subplots_example():
    print("--- Subplots (Section 2.3) ---")
    episode_rewards = [12, 45, 8, 60, 33, 71]
    steps_per_episode = [20, 55, 15, 70, 40, 85]

    figure, (reward_axis, steps_axis) = plt.subplots(2, 1, figsize=(8, 6))

    reward_axis.plot(episode_rewards)
    reward_axis.set_title("Reward per Episode")
    reward_axis.set_ylabel("Reward")

    steps_axis.plot(steps_per_episode, color="orange")
    steps_axis.set_title("Steps per Episode")
    steps_axis.set_xlabel("Episode")
    steps_axis.set_ylabel("Steps")

    plt.tight_layout()
    plt.show()


if __name__ == "__main__":
    rewards_from_pandas = demonstrate_pandas_basics()

    # A longer, noisier reward series for the plotting demos
    episode_rewards = np.array([12, 45, 8, 60, 33, 71, 15, 80, 42, 90, 55, 95, 60, 100, 70])

    plot_simple_reward_curve(episode_rewards)
    plot_smoothed_reward_curve(episode_rewards)
    plot_subplots_example()
```

---

## 4. Challenges before Week 2

1. Build a `DataFrame` with columns `episode`, `reward`, and `loss` for 6 made-up episodes. Print `.describe()` and identify which episode had the highest reward using what you know from Lesson 2 (`argmax` works on a Pandas `to_numpy()` array too).
2. Take the `episode_rewards` array from the practice file and plot it with `window_size=1` (no real smoothing) vs. `window_size=10` (heavy smoothing). Describe in one sentence what changes visually.
3. Add a third subplot to `plot_subplots_example()` showing a rolling average of `episode_rewards` (reuse `rolling_average` from Section 2.2). You'll need `plt.subplots(3, 1, ...)` instead of `(2, 1, ...)`.

---

## Week 1 complete

You now have: vectors/matrices by hand and in NumPy, matrix multiplication tied directly to what a neural network layer computes, reshaping/argmax/stats (the exact operations an RL decision loop runs), and the ability to load and plot training data. Every one of these pieces is something Week 2, 3, and 4 will assume you already have — nothing above was tangential.

## What's next

Week 2 begins the heavy dive into Keras itself: the bridge lesson mapping your from-scratch neuron directly onto Keras's `Sequential`/`Dense` API, then training loop mechanics (epochs, batches, overfitting), building toward CNNs by the end of the week.
