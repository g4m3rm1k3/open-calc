# Lesson 8 — Gym, For Real, and Why Tables Break Down

**Track:** RL/Keras Class Prep — Week 4 (opener)
**Depth:** Heavy on the "why" (the API itself will feel almost familiar — you've been hand-rolling a version of it since Lesson 6)
**Goal by end of lesson:** You can run a real Gym environment, understand exactly how `reset()`/`step()` map to the `step_environment` function you wrote by hand in Lesson 7, and — critically — understand precisely *why* the Q-table approach from Lesson 7 cannot work on CartPole or anything bigger, which is the entire motivation for Lesson 9's DQN.

---

## 0. A naming note before you install anything

The original `OpenAI Gym` library was succeeded by a maintained fork called **Gymnasium**, which uses the same interface and is what your textbook's code will likely run on even if the book says "Gym" (many RL books/tutorials use `gym` and `gymnasium` somewhat interchangeably in casual text, since Gymnasium is a near-drop-in replacement). Install with:

```
pip install gymnasium
```

And import it as:

```python
import gymnasium as gym
```

If your specific textbook's code uses `import gym` and errors out, the fix is almost always either `pip install gym` (the older package, if the book genuinely depends on old-style behavior) or renaming the import to `gymnasium` — check which one your book's setup instructions specify before assuming something is broken.

---

## 1. The environment interface — mapped directly to what you already built

Recall `step_environment` from Lesson 7 — it took a position and action, and returned `(next_position, reward, done)`. Gym's real interface is the same idea, standardized across every environment in the library:

```python
import gymnasium as gym

environment = gym.make("CartPole-v1")

state, info = environment.reset()          # start of an episode
next_state, reward, terminated, truncated, info = environment.step(action)
```

- **`environment.reset()`** — starts a new episode, returns the initial state. This is exactly your Lesson 6/7 grid resetting the agent to `START_POSITION` — except now `state` isn't a `(row, col)` tuple, it's the 4-number CartPole vector from Lesson 2.
- **`environment.step(action)`** — exactly `step_environment(position, action)` from Lesson 7, just implemented by the library instead of by you. It returns:
  - `next_state` — the resulting state (Lesson 7's `next_position`)
  - `reward` — the reward for that step (Lesson 7's `reward`)
  - `terminated` — `True` if the episode ended because of a "real" ending condition (pole fell over, or the goal was reached) — this is Lesson 7's `done`
  - `truncated` — `True` if the episode was cut off for an external reason (e.g., hit a max step limit) rather than a natural ending — this distinction didn't exist in your hand-built grid, but matters for CartPole, which can in principle run "forever" if balanced well, so Gym caps episode length
  - `info` — a dictionary of extra debugging info, usually not needed for basic training

### 1.1 What CartPole's state and action actually are

```python
print(environment.observation_space)   # Box(4,) - a 4-dimensional continuous vector
print(environment.action_space)        # Discrete(2) - 2 possible actions
```

- `observation_space` — describes the *shape and type* of states this environment produces. `Box(4,)` means "a 4-number vector, each number a continuous real value within some range" — this is precisely the `[cart_position, cart_velocity, pole_angle, pole_angular_velocity]` vector from Lesson 2, Section 4.
- `action_space` — `Discrete(2)` means "exactly 2 possible actions, labeled `0` and `1`" (push left / push right). This maps directly onto the `action_scores` array and `argmax` pattern from Lesson 2.

### 1.2 A full random-action episode

```python
import gymnasium as gym

environment = gym.make("CartPole-v1")
state, info = environment.reset()

total_reward = 0
done = False

while not done:
    action = environment.action_space.sample()   # random action - no learning yet, just running the loop
    next_state, reward, terminated, truncated, info = environment.step(action)
    total_reward += reward
    done = terminated or truncated
    state = next_state

print("Episode finished. Total reward:", total_reward)
environment.close()
```

`environment.action_space.sample()` picks a uniformly random valid action — the Gym-provided equivalent of `random.choice(ACTIONS)` from Lesson 7's epsilon-greedy exploration. With fully random actions, CartPole typically only survives for a very short number of steps (the pole falls quickly) — that low `total_reward` is your baseline to beat once real learning is introduced in Lesson 9.

---

## 2. Why the Lesson 7 Q-table approach cannot work here

This is the conceptual core of this lesson, so slow down here even though the code above looked easy.

Lesson 7's Q-table was a dictionary keyed by `(row, col)` — a finite, small, exactly-countable set of states (9 grid cells). CartPole's state is **4 continuous numbers**. "Continuous" means there are infinitely many possible values for `cart_position` alone (`0.1`, `0.10001`, `0.100001`, ...) — you cannot build a dictionary with one entry per possible state, because there isn't a finite list of states to enumerate.

### 2.1 The tempting fix — discretization — and why it doesn't actually scale

You could try to force continuous values into buckets — e.g., round `cart_position` to the nearest `0.1`, and do the same for the other 3 values, then build a Q-table keyed by the bucketed tuple. This is called **discretization**, and it does technically work for small problems. But watch what happens to the table size as you add buckets:

- If each of the 4 state values gets discretized into just 10 buckets, the total number of distinct states is `10 × 10 × 10 × 10 = 10,000` table entries — and that's for a genuinely tiny bucket count that would likely be too coarse to control the pole well.
- Now consider an Atari game (Lesson 5) with an 84×84 pixel image as the state — even at a crude 2 brightness levels per pixel, that's `2^(84×84)` possible states, a number so large it's meaningless to even write out. No table, however cleverly bucketed, can cover this.

This exponential blowup as the number of state dimensions grows is called the **curse of dimensionality**, and it's the actual, precise reason tabular methods stop being viable — not "tables are old-fashioned," but a genuine, provable scaling wall.

### 2.2 The real fix — function approximation

Instead of a table with one entry per exact state, use a **function** that takes a state as input and *estimates* `Q(s, a)` for every action — even for states it has never seen exactly before, by generalizing from similar states it has seen. This is precisely what a neural network is good at: Lesson 4's `Dense` network already does exactly this kind of generalization for supervised learning, and Lesson 9 (DQN) applies the same idea to Q-values.

**The reframe to hold onto:** a Q-table is a lookup — exact match only. A Q-network is an approximation — it can produce a reasonable answer for states it's never exactly seen, by having learned the *general shape* of the Q-function from related states it trained on. This generalization ability is the entire reason DQN can handle CartPole (4 continuous numbers) or Atari (thousands of pixels), where a table provably cannot.

---

## 3. Complete runnable file

Save as `lesson_08_practice.py` and run with `python lesson_08_practice.py`. Requires `pip install gymnasium` first.

```python
"""
Lesson 8 Practice: Running real Gym episodes, and demonstrating discretization's scaling wall.
Run with: python lesson_08_practice.py
(Requires: pip install gymnasium)
"""
import gymnasium as gym


def run_random_episode(environment):
    state, info = environment.reset()
    total_reward = 0
    step_count = 0
    done = False

    while not done:
        action = environment.action_space.sample()
        next_state, reward, terminated, truncated, info = environment.step(action)
        total_reward += reward
        step_count += 1
        done = terminated or truncated
        state = next_state

    return total_reward, step_count


def inspect_environment(environment):
    print("--- Environment inspection (Section 1.1) ---")
    print("Observation space:", environment.observation_space)
    print("Action space:", environment.action_space)
    print("Sample state shape after reset:", environment.reset()[0].shape)
    print()


def run_several_random_episodes(environment, num_episodes=5):
    print(f"--- Running {num_episodes} random-action episodes (Section 1.2) ---")
    for episode in range(num_episodes):
        total_reward, step_count = run_random_episode(environment)
        print(f"Episode {episode + 1}: reward = {total_reward}, steps survived = {step_count}")
    print()


def demonstrate_discretization_blowup():
    print("--- Discretization state-count blowup (Section 2.1) ---")
    state_dimensions = 4      # CartPole has 4 state values
    for buckets_per_dimension in [2, 5, 10, 20]:
        total_states = buckets_per_dimension ** state_dimensions
        print(f"{buckets_per_dimension} buckets per dimension -> {total_states:,} total table entries needed")
    print()


if __name__ == "__main__":
    environment = gym.make("CartPole-v1")

    inspect_environment(environment)
    run_several_random_episodes(environment, num_episodes=5)
    demonstrate_discretization_blowup()

    environment.close()
```

**What to expect:** random-action episodes on CartPole typically last somewhere in the range of 10-30 steps before the pole falls too far (exact numbers vary run to run, since actions are random). The discretization printout should make the exponential blowup viscerally obvious — going from 10 to 20 buckets per dimension doesn't double the table size, it multiplies it by `2^4 = 16`.

---

## 4. Challenges before Lesson 9

1. Modify `run_random_episode` to also track the *minimum* and *maximum* value seen for `cart_position` across an episode (index `0` of the state array). Run it a few times — does the range stay within roughly `[-2.4, 2.4]`? (That's CartPole's actual defined boundary, after which the episode ends.)
2. Extend `demonstrate_discretization_blowup()` to also compute the total table size for an Atari-style problem with, hypothetically, just 2 state "dimensions" but 1,000 buckets each (nowhere near a real image, but illustrates the same exponential idea with different numbers). Compare the growth pattern to the 4-dimension CartPole case.
3. Try `gym.make("MountainCar-v0")` instead of CartPole — print its `observation_space` and `action_space`, and compare the shapes to CartPole's. Are they the same kind of object (`Box`, `Discrete`), just different sizes?
4. In your own words (2-3 sentences), explain why a Q-*table* and a Q-*network* would give different answers for a brand-new state the agent has never visited before. What does the table do (or fail to do), and what does the network do instead?

---

## What's next

Lesson 9 — Deep Q-Networks (DQN) — replaces the Q-table with a Keras network that outputs `Q(s, a)` for every action given a state, and introduces the two tricks (experience replay and a target network) that keep this combination stable during training, since naively swapping a table for a network turns out to be surprisingly unstable without them.
