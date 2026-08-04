# Lesson 6 — MDPs and the Bellman Equation

**Track:** RL/Keras Class Prep — Week 3 (opener)
**Depth:** Heavy (core RL foundations — entirely new, no library involved yet on purpose)
**Goal by end of lesson:** You can define a Markov Decision Process precisely (states, actions, rewards, transitions, policy), explain what a value function actually means, and derive/apply the Bellman equation by hand on a tiny grid world. Gym and Keras are deliberately absent from this lesson — the goal is to understand the problem RL solves before any library shows up to solve it for you.

---

## 0. Why build this by hand, in plain Python, before Gym?

Gym is going to hand you an environment where `reset()` and `step()` just... work, and it'll be tempting to treat the whole RL problem as "call these functions, feed the numbers to Keras." That works for passing an assignment, but it means you won't understand *why* an agent's behavior sometimes doesn't converge, or why a bug in your reward function silently breaks everything. This lesson builds the actual math the library is hiding, on a world small enough to compute by hand and check by eye.

---

## 1. What is a Markov Decision Process (MDP)?

An MDP is the formal framework RL is built on. It has five parts:

- **States (S)** — every possible situation the agent could be in. For CartPole this was a 4-number vector (Lesson 2); here, we'll use a tiny grid where a state is just "which cell am I in."
- **Actions (A)** — the choices available to the agent in a given state. For our grid: up, down, left, right.
- **Transition function** — given a state and an action, what state do you end up in? Sometimes this is deterministic (moving up always moves you up); sometimes it's probabilistic (moving up succeeds 90% of the time, but 10% of the time you slip sideways). We'll start deterministic to keep the math clean.
- **Reward function** — a number the environment gives the agent after each action, telling it how good that action was. This is the *only* signal the agent gets about what's "good" — there's no other source of guidance.
- **Discount factor (γ, gamma)** — a number between 0 and 1 that controls how much the agent cares about future rewards versus immediate ones. More on this in Section 3.

**The "Markov" part specifically:** the key assumption is that the *current state* contains everything relevant to decide what happens next — the transition and reward only depend on the current state and action, not on the full history of how you got there. This is why a state has to be chosen carefully — CartPole's state includes velocity, not just position, precisely because "am I moving left or right" matters for what happens next, and position alone wouldn't be Markov (it wouldn't be enough information).

---

## 2. A tiny grid world, defined precisely

```
[ S ][   ][   ]
[   ][ X ][   ]
[   ][   ][ G ]
```

- `S` = start (top-left)
- `G` = goal (bottom-right), reward `+10`, ends the episode
- `X` = a "trap" cell, reward `-10`, ends the episode
- Every other move costs `-1` (a small penalty per step, so the agent is encouraged to reach the goal quickly rather than wander)
- Actions: up, down, left, right. Moving into a wall just keeps you in place (no penalty beyond the normal `-1` step cost).
- Transitions are deterministic here — moving "right" always moves you right (if not blocked by a wall).

This is small enough that you could, in principle, work out the best move from every cell by staring at the grid. That's exactly why it's a good first example — you can sanity-check the math against your own intuition.

---

## 3. The discount factor — why future rewards get discounted

If the agent only cared about the *next* single reward, it might take a shortsighted action that leads to disaster one step later. The discount factor `γ` (gamma) controls how much a reward *n* steps in the future is worth *right now*:

```
value_of_future_reward = reward × (γ ^ number_of_steps_away)
```

With `γ = 0.9`, a reward of `10` that's 3 steps away is worth `10 × 0.9³ = 10 × 0.729 = 7.29` right now — still valuable, but discounted, since the agent has to survive those 3 steps to actually get it (and the world might be uncertain). `γ` close to `1` means "care almost as much about the distant future as the present." `γ` close to `0` means "only care about immediate reward, ignore the future almost entirely." Most RL problems use something like `γ = 0.9` to `γ = 0.99`.

---

## 4. The value function — "how good is this state, really?"

The **value** of a state, `V(s)`, is the total discounted reward the agent expects to collect from that state onward, if it follows a given policy (a policy is just "the rule the agent uses to pick actions" — could be as simple as "always move toward the goal," or something learned).

This is the central idea of Sections 4-5, so sit with it: `V(s)` isn't "the reward for being in state `s`" — it's "the sum of *all future* rewards, discounted, that you'd expect to collect starting from `s` and playing well from there on."

---

## 5. The Bellman equation — the recursive heart of RL

The Bellman equation expresses `V(s)` recursively — in terms of the value of the *next* state:

```
V(s) = R(s, a) + γ × V(next_state)
```

In words: **the value of being in a state equals the immediate reward for the action you take, plus the discounted value of wherever you land next.**

This recursive structure — "the answer for this state depends on the answer for the next state" — is what makes RL solvable algorithmically at all. You don't have to imagine every possible full sequence of future moves; you just need to know the value of the *next* state, and the equation handles the rest.

### 5.1 Value iteration — solving the Bellman equation by hand

**Value iteration** is a simple algorithm: start with all state values at `0`, then repeatedly update every state's value using the Bellman equation, using your current best estimate of neighboring states' values. Repeat until the values stop changing much (this is called **convergence**).

For a state `s`, the update picks the *best* action available — the one that maximizes reward-plus-discounted-future-value:

```
V(s) = max over all actions a of [ R(s, a) + γ × V(next_state after taking a) ]
```

This "max over actions" is the same `argmax` idea from Lesson 2, applied to *values* instead of raw network outputs — you're always asking "which action leads to the best outcome from here?"

### 5.2 Worked example — one full update, by hand

Let's compute one value-iteration update for a couple of cells in our grid, with `γ = 0.9`, starting from all values at `0`.

Label the grid positions `(row, col)`, `(0,0)` = start, `(2,2)` = goal.

**Cell `(2,1)`** (directly left of the goal). From here:
- Move right → lands on goal `(2,2)`, reward `+10`. Since all values currently start at `0`: `V = 10 + 0.9 × 0 = 10`
- Move up → lands on `(1,1)` (the trap), reward `-10`. `V = -10 + 0.9 × 0 = -10`
- Move down/left → hits a wall or moves further away, reward `-1`. `V = -1 + 0.9 × 0 = -1`

Best action from `(2,1)`: move right, value `10`. So after this update, `V(2,1) = 10`.

**Cell `(1,2)`** (directly above the goal). Same logic:
- Move down → goal, reward `+10` → `V = 10`
- Move left → trap `(1,1)`, reward `-10` → `V = -10`
- Other moves → `-1`

Best action: move down, `V(1,2) = 10`.

**Cell `(0,0)`** (the start). On this *first* update, every neighboring cell still has value `0` (we haven't propagated anything yet), so every move from the start just gives `-1 + 0.9 × 0 = -1` — the start doesn't yet "know" the goal is nearby. This is the key thing to understand about value iteration: **information propagates outward from the goal, one update at a time.** On the *next* full pass, `(1,2)` and `(2,1)` will already have their updated values (`10`), so cells adjacent to *them* will start seeing higher values too. Run enough passes, and the values ripple all the way back to the start, at which point the agent can read off the best path just by always moving toward the higher-value neighbor.

This is worth re-reading once — the fact that the start cell learns nothing useful on pass 1, but the goal-adjacent cells do, and that knowledge spreads backward over successive passes, is the entire mechanism by which value iteration solves the problem.

---

## 6. Complete runnable file — value iteration on the grid, from scratch

Save as `lesson_06_practice.py` and run with `python lesson_06_practice.py`. This is plain Python and NumPy only — no Gym, no Keras. That's deliberate.

```python
"""
Lesson 6 Practice: MDP value iteration on a tiny grid world, entirely by hand.
Run with: python lesson_06_practice.py
"""
import numpy as np

GRID_SIZE = 3
GOAL_POSITION = (2, 2)
TRAP_POSITION = (1, 1)
DISCOUNT_FACTOR = 0.9
STEP_PENALTY = -1
GOAL_REWARD = 10
TRAP_REWARD = -10

ACTIONS = {
    "up": (-1, 0),
    "down": (1, 0),
    "left": (0, -1),
    "right": (0, 1)
}


def is_valid_position(position):
    row, col = position
    return 0 <= row < GRID_SIZE and 0 <= col < GRID_SIZE


def get_next_position(position, action):
    """Deterministic move; walls just keep you in place."""
    row_delta, col_delta = ACTIONS[action]
    next_position = (position[0] + row_delta, position[1] + col_delta)
    if not is_valid_position(next_position):
        return position
    return next_position


def get_reward(next_position):
    if next_position == GOAL_POSITION:
        return GOAL_REWARD
    if next_position == TRAP_POSITION:
        return TRAP_REWARD
    return STEP_PENALTY


def is_terminal(position):
    return position == GOAL_POSITION or position == TRAP_POSITION


def value_iteration(num_passes=20):
    values = np.zeros((GRID_SIZE, GRID_SIZE))

    for pass_number in range(num_passes):
        new_values = np.copy(values)

        for row in range(GRID_SIZE):
            for col in range(GRID_SIZE):
                position = (row, col)
                if is_terminal(position):
                    continue  # terminal states don't get updated further

                action_values = []
                for action in ACTIONS:
                    next_position = get_next_position(position, action)
                    reward = get_reward(next_position)
                    future_value = values[next_position]  # using LAST pass's values
                    action_values.append(reward + DISCOUNT_FACTOR * future_value)

                new_values[row, col] = max(action_values)  # the "max over actions" from Section 5.1

        values = new_values

    return values


def print_grid_values(values):
    for row in range(GRID_SIZE):
        row_strings = []
        for col in range(GRID_SIZE):
            row_strings.append(f"{values[row, col]:6.2f}")
        print(" | ".join(row_strings))


def extract_best_action(position, values):
    """Once values have converged, read off the best move from any cell."""
    best_action = None
    best_value = float("-inf")
    for action in ACTIONS:
        next_position = get_next_position(position, action)
        reward = get_reward(next_position)
        candidate_value = reward + DISCOUNT_FACTOR * values[next_position]
        if candidate_value > best_value:
            best_value = candidate_value
            best_action = action
    return best_action


if __name__ == "__main__":
    print("--- Value iteration on the grid (Section 5) ---")
    final_values = value_iteration(num_passes=20)
    print("Converged state values:")
    print_grid_values(final_values)
    print()

    print("--- Best action from every non-terminal cell ---")
    for row in range(GRID_SIZE):
        for col in range(GRID_SIZE):
            position = (row, col)
            if is_terminal(position):
                continue
            best_action = extract_best_action(position, final_values)
            print(f"From {position}: best action = {best_action}")
```

**What to expect when you run it:** the printed value grid should be highest near the goal and lowest (or negative) near the trap, decreasing smoothly as you move away from the goal — and the "best action" printout should trace out a sensible path from the start toward the goal that avoids the trap. If your intuition from just looking at the grid in Section 2 disagrees with what the code prints, that mismatch is worth chasing down — it usually means a sign error somewhere (reward, discount, or comparison direction) rather than a flaw in the algorithm itself.

---

## 7. Challenges before Lesson 7

1. Change `num_passes` from 20 down to 2. Print the values and compare to the 20-pass version — this is the "information hasn't propagated to the start yet" effect from Section 5.2, made visible.
2. Change `DISCOUNT_FACTOR` to `0.1` and re-run. How does the value grid change near the start compared to near the goal? Explain why, using Section 3's reasoning about what a low gamma means.
3. Move the trap to a different cell (e.g., `(0, 1)`, right next to the start) and re-run. Does the "best action" path still successfully avoid it?
4. By hand, using the *converged* values your code prints, verify the Bellman equation holds for one specific non-terminal cell of your choosing — i.e., confirm that `V(s)` really does equal `R(s, best_action) + γ × V(next_state)` for the best action from that cell.

---

## What's next

Lesson 7 introduces **model-free** methods — Q-learning and SARSA — which solve essentially the same problem as value iteration, but *without* requiring the agent to know the transition function or reward function ahead of time (value iteration above assumed you already knew exactly how the grid worked; real environments usually don't hand you that). This is the last stop before Gym is introduced in Lesson 8.
