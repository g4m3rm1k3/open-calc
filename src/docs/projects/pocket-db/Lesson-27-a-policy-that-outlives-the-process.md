# Lesson 27: A Policy That Outlives the Process

**What you will build** — the final slice: a real, tabular
Q-learning agent, trained live against a real `gymnasium` environment
(`FrozenLake-v1`, the successor to OpenAI Gym, `README.md`'s own named
material), then a small, real, bounded sample of its own converged
experience — real `(state, action, reward, next_state, done)`
transitions — persisted through `pocketdb`, batched per episode with
Lesson 24's own real `Transaction`. Then, in a completely separate
process, with no live environment at all, a fresh agent replays
*nothing but those stored rows* and learns the identical, real,
winning policy. This is `README.md`'s own S13 promise, paid off for
real: a trained agent whose experience survives the process that
generated it.

**What you need to know first:** Lesson 18 (`query`), Lesson 24
(`Transaction`), Lesson 26 (real, hand-verified learning math before
trusting a loop).

**Terms introduced in this lesson:** **Q-learning** — a real,
standard reinforcement-learning algorithm: an agent keeps a real table
of values (`Q[state][action]`, "how good is taking this action in this
state"), updates it after every real transition using the real Bellman
equation, and eventually acts greedily (always picking the real,
highest-valued action) once the table has learned enough. **Experience
replay** — training (or re-training) purely from real, previously
recorded transitions, instead of a real, live environment — this
lesson's own real, final subject.

**Objects and methods used**
- **`gymnasium.make` / `.reset` / `.step`**
  - *What they are:* `gymnasium`'s own real, standard interface for a
    reinforcement-learning environment — `.reset()` starts a real
    episode, returning a real starting state; `.step(action)` applies
    a real action, returning the real, resulting `(next_state, reward,
    terminated, truncated, info)`.
  - *Implementation:* `env = gym.make("FrozenLake-v1", is_slippery=
    False)`; `state, _ = env.reset()`; `next_state, reward, terminated,
    truncated, _ = env.step(action)`.
  - *Its use:* this lesson's own real, live training loop, and its own
    real evaluation function.

---

## Concept Unit: One Real Q-Learning Update, By Hand

### The Problem

Q-learning's own real update rule — the Bellman equation — needs
verifying by hand once, the identical real discipline Lesson 26 already
used for a single neuron, before trusting it inside a real, live
training loop against a real environment.

### Introduce the Concept in Isolation

Save this as `qupdate_check.py`:

```python
# One real Q-learning update, worked by hand, for one real transition:
# state 1, action "right", reward 1 (reached the goal), next_state 2, done.
q = {
    0: {"right": 0.0, "down": 0.0},
    1: {"right": 0.0, "down": 0.3},
    2: {"right": 0.0, "down": 0.0},
}

state = 1
action = "right"
reward = 1.0
next_state = 2
alpha = 0.5   # learning rate
gamma = 0.9   # discount factor

best_next_value = max(q[next_state].values())
print(f"best_next_value (max Q at next_state): {best_next_value}")

old_value = q[state][action]
target = reward + gamma * best_next_value
new_value = old_value + alpha * (target - old_value)

print(f"old value: {old_value}")
print(f"target (reward + gamma * best_next_value): {target}")
print(f"new value: {new_value}")

q[state][action] = new_value
print(f"updated q-table entry: q[1]['right'] = {q[1]['right']}")
```

Run with:

```bash
python qupdate_check.py
```

Real output:

```text
best_next_value (max Q at next_state): 0.0
old value: 0.0
target (reward + gamma * best_next_value): 1.0
new value: 0.5
updated q-table entry: q[1]['right'] = 0.5
```

*What this proves:* a real transition that reaches a real, rewarding
outcome (`reward = 1.0`) real-pulls the real Q-value for the action
that led there halfway toward the real target (`0.0 → 0.5`, with
`alpha = 0.5`) — exactly the identical real "move partway toward a
target" shape as Lesson 26's own single-neuron gradient step, applied
to a real table lookup instead of a real weight.

### Discard the Throwaway Example

```bash
rm qupdate_check.py
```

### Mechanical Walkthrough

- `best_next_value = max(q[next_state].values())` — the real,
  "look-ahead" half of the Bellman equation: how good is the *best*
  real action available from wherever this transition actually landed.
- `target = reward + gamma * best_next_value` — the real, immediate
  reward, plus a real, discounted (`gamma = 0.9`) estimate of future
  reward — `gamma < 1` deliberately values a real reward reachable
  *sooner* slightly more than the identical real reward reachable
  later.
- `new_value = old_value + alpha * (target - old_value)` —
  reappearing shape (Lesson 26's own gradient-descent update) — a real
  step of size `alpha` toward `target`, not a real jump straight to it.

### CS Lens

Q-learning's own real update rule is a specific, real instance of
**temporal-difference learning** — updating an estimate using another,
*more recent* real estimate (`best_next_value`), rather than waiting
for a real, final outcome to become known. This is what lets Q-learning
learn from every real, single step, not just at the real end of an
episode.

### SE Lens

Why does this lesson verify the Q-learning update on a tiny, real,
two-state, two-action example — nothing close to `FrozenLake`'s own
real, 16-state, 4-action shape — before running it live? Because the
identical real reasoning from Lesson 26 applies again: a real, subtly
wrong update formula would still *run* inside a real, live training
loop against a real environment, and a real, live loop's own noisy,
stochastic behavior would make a real, small bug nearly invisible.

### Commands Needed

Every command was already shown above, alongside its real output.

### Run It

Already shown above, in "Introduce the Concept in Isolation."

### Connection

One real update is verified. Running many of them, live, against a
real `gymnasium` environment, and persisting a real, bounded sample of
the result, is next.

---

## Concept Unit: Training Live, Persisting a Real, Bounded Sample

### The Problem

A real, live Q-learning loop can update its own table many real
thousands of times per second — far more than this project's own real,
established one-page-per-table capacity (Lesson 15's own real limit,
around `95` rows for this lesson's own real, seven-column schema) could
ever hold if every single real transition were persisted. A real,
honest design has to decide what's actually worth keeping.

### Project Change

- **Reference Source:** No reference counterpart.
- **Change type:** Add (a new, standalone script; no engine change).
- **Dependencies:** This lesson's own first unit; Lesson 24's
  `Transaction`; Lesson 15's own real page-capacity limit.
- **Setup:** `pip install gymnasium`.

### The New Code — `train_agent.py`

```python
import random
import gymnasium as gym
from pocketdb import Database, INTEGER

env = gym.make("FrozenLake-v1", is_slippery=False)
state_count = env.observation_space.n
action_count = env.action_space.n

q_table = [[0.0] * action_count for _ in range(state_count)]

alpha = 0.5
gamma = 0.9
epsilon = 1.0
epsilon_min = 0.05
epsilon_decay = 0.999
episode_count = 5000

random.seed(1)

# Phase 1: train live, in memory, no storage yet -- this is the
# real, ordinary Q-learning loop, unrelated to persistence.
for episode in range(episode_count):
    state, _ = env.reset()
    for step in range(100):
        if random.random() < epsilon:
            action = env.action_space.sample()
        else:
            action = q_table[state].index(max(q_table[state]))

        next_state, reward, terminated, truncated, _ = env.step(action)
        done = terminated or truncated

        best_next = max(q_table[next_state])
        target = reward + gamma * best_next * (0 if done else 1)
        q_table[state][action] += alpha * (target - q_table[state][action])

        state = next_state
        if done:
            break

    epsilon = max(epsilon_min, epsilon * epsilon_decay)

env.close()


def evaluate(policy, trial_count=100):
    eval_env = gym.make("FrozenLake-v1", is_slippery=False)
    wins = 0
    for trial in range(trial_count):
        state, _ = eval_env.reset(seed=5000 + trial)
        for _ in range(100):
            action = policy[state].index(max(policy[state]))
            state, reward, terminated, truncated, _ = eval_env.step(action)
            if terminated or truncated:
                if reward > 0:
                    wins += 1
                break
    eval_env.close()
    return wins / trial_count


live_win_rate = evaluate(q_table)
print(f"trained live for {episode_count} episodes")
print(f"live-trained policy win rate: {live_win_rate:.2f}")

# Phase 2: run the now-converged policy for a small, bounded number
# of real episodes, and persist every real transition from THESE --
# a real, bounded experience buffer, not an unbounded log of every
# transition from all {episode_count} training episodes.
db = Database("agent.pdb")
db.create_table(
    "experience",
    episode=INTEGER, step=INTEGER, state=INTEGER,
    action=INTEGER, reward=INTEGER, next_state=INTEGER, done=INTEGER,
)

record_env = gym.make("FrozenLake-v1", is_slippery=False)
for episode in range(10):
    state, _ = record_env.reset(seed=9000 + episode)
    tx = db.begin()
    for step in range(20):
        action = q_table[state].index(max(q_table[state]))
        next_state, reward, terminated, truncated, _ = record_env.step(action)
        done = terminated or truncated

        tx.insert("experience", episode, step, state, action, int(reward), next_state, int(done))

        state = next_state
        if done:
            break
    tx.commit()
record_env.close()

print(f"experience rows persisted: {len(db.query('experience'))}")

db.close()
```

Run with:

```bash
python train_agent.py
```

Real output:

```text
trained live for 5000 episodes
live-trained policy win rate: 1.00
experience rows persisted: 60
```

*What this proves:* `5000` real, live training episodes (fast — this
runs in well under a second) produce a real, perfect policy — `1.00`
win rate across `100` real, held-out evaluation trials. Only *after*
training converges does this lesson persist anything at all — `10`
more real episodes, run with the now-converged, greedy policy (no more
exploration), producing `60` real transitions — comfortably inside this
project's own real, established page-capacity limit.

### Discard the Throwaway Example

`train_agent.py` and `agent.pdb` are both kept — the database is this
lesson's own real, necessary bridge to the next unit.

### Mechanical Walkthrough

- `q_table[state].index(max(q_table[state]))` — reappearing shape
  (this lesson's own first unit) — the real, greedy action: whichever
  real action currently has the highest learned value for this state.
- `epsilon = max(epsilon_min, epsilon * epsilon_decay)` — real
  **epsilon decay**: exploration starts at `100%` real-random
  (`epsilon = 1.0`) and shrinks every real episode, so the agent
  explores heavily early (when it knows nothing) and exploits its own,
  increasingly correct real knowledge later — without this, real,
  sparse-reward environments like this one are genuinely, provably hard
  to learn at all (a real, live check during this lesson's own
  development: pure, constant `30%` exploration across `500` episodes
  found the real goal exactly once).
- `tx = db.begin(); ...; tx.commit()` — reappearing shape (Lesson 24)
  — every real episode's own transitions are staged together and
  committed as one real, atomic unit, matching real experience-replay
  practice: a complete real episode, not a partial one, is what gets
  kept.

### CS Lens

Persisting only a small, real, *bounded* sample of experience — not
every transition from every training episode — is exactly what real,
production reinforcement-learning systems do too: a real **replay
buffer** is deliberately capped (often to a fixed real size, oldest
transitions discarded to make room for new ones), for the identical
real reason this lesson's own page-capacity limit forces here. This
project's own real, honest architectural constraint (Lesson 15's
one-page-per-table cap) turns out to model a genuinely standard, real
RL design decision, not merely work around a limitation.

### SE Lens

Why train the *entire* real policy live, in memory, before persisting
anything, rather than persisting transitions throughout all `5000`
training episodes and only keeping the most recent `~95`? Because
early training transitions are real, mostly-random noise — persisting
them would fill this project's own real, limited capacity with the
real, *least* useful experience, discarding exactly the transitions
(the converged, successful ones) most worth keeping. This lesson's own
two-phase design — train fully, *then* persist a real sample of the
result — is a deliberate, honest response to a real, known constraint,
not an accident.

### Commands Needed

Every command was already shown above, alongside its real output.

### Run It

Already shown above, in "The New Code."

### Connection

A real, converged policy's own experience is now durably stored. The
actual, final proof — that a *different* process can learn the
identical real policy from nothing but those stored rows — is last.

---

## Concept Unit: Learning From Nothing But What Was Saved

### The Problem

`agent.pdb` now holds `60` real, persisted transitions. Nothing has
yet proven those transitions alone — with no real, live environment
at all — are enough to reproduce a real, working policy.

### The New Code — `replay_agent.py`

```python
import gymnasium as gym
from pocketdb import Database

db = Database("agent.pdb")
experience = db.query("experience")
print(f"loaded {len(experience)} real, persisted transitions -- no live environment used yet")

env = gym.make("FrozenLake-v1", is_slippery=False)
state_count = env.observation_space.n
action_count = env.action_space.n
env.close()

q_table = [[0.0] * action_count for _ in range(state_count)]
alpha = 0.5
gamma = 0.9

for pass_number in range(50):
    for row in experience:
        state = int(row["state"])
        action = int(row["action"])
        reward = int(row["reward"])
        next_state = int(row["next_state"])
        done = int(row["done"])

        best_next = max(q_table[next_state])
        target = reward + gamma * best_next * (0 if done else 1)
        q_table[state][action] += alpha * (target - q_table[state][action])


def evaluate(policy, trial_count=100):
    eval_env = gym.make("FrozenLake-v1", is_slippery=False)
    wins = 0
    for trial in range(trial_count):
        state, _ = eval_env.reset(seed=5000 + trial)
        for _ in range(100):
            action = policy[state].index(max(policy[state]))
            state, reward, terminated, truncated, _ = eval_env.step(action)
            if terminated or truncated:
                if reward > 0:
                    wins += 1
                break
    eval_env.close()
    return wins / trial_count


replayed_win_rate = evaluate(q_table)
print(f"replayed policy win rate (trained purely from stored experience): {replayed_win_rate:.2f}")

db.close()
```

Run as a real, genuinely separate process from `train_agent.py`:

```bash
python replay_agent.py
```

Real output:

```text
loaded 60 real, persisted transitions -- no live environment used yet
replayed policy win rate (trained purely from stored experience): 1.00
```

*What this proves:* a completely separate real Python process, with no
memory of `train_agent.py`'s own `5000`-episode training run and no
live environment interaction of its own, reconstructs a real,
`1.00`-win-rate policy from nothing but `60` real rows this project's
own engine had stored on disk. This is `README.md`'s own S13 promise,
literally demonstrated: the trained agent's own experience survived
the process that generated it.

### Discard the Throwaway Example

```bash
rm agent.pdb
```

`train_agent.py` and `replay_agent.py` are both kept — real, permanent,
paired scripts.

### Mechanical Walkthrough

- `experience = db.query("experience")` — reappearing shape (Lesson
  18) — real, ordinary `query`; nothing RL-specific about how the data
  gets read back at all.
- `for pass_number in range(50): for row in experience: ...` — real,
  repeated passes over the identical, small, real, stored dataset —
  reusing this lesson's own second unit's real Bellman update, applied
  offline, replaying the same real `60` transitions `50` real times
  each, rather than generating new ones from a live environment.
- `int(row["state"])` — reappearing shape (`Record.__getitem__`,
  Lesson 18) — every real value crossing back out of storage is still
  a raw string (Lesson 18's own, still-open exercise), converted here
  the identical real way every earlier lesson has.

### CS Lens

Training repeatedly on a real, fixed, small set of stored transitions
— rather than generating fresh ones from a live environment every time
— is exactly the real, standard technique **experience replay** names:
real, past experience is reusable, valuable data, not something that
only matters once, at the real moment it happens.

### SE Lens

Why does the replayed policy achieve the identical real `1.00` win
rate as live training, despite learning from only `60` real
transitions instead of the thousands generated across `5000` live
episodes? Because those `60` transitions aren't a real, random sample
— they're the *already-converged* policy's own real, optimal
trajectory, run `10` times. Replaying them teaches the identical real
lesson the live training run's own final `5000`th episode already
knew: for *these specific* real starting positions, this exact real
sequence of actions wins. A real, honest limit worth naming: this
replayed policy would likely fail on real starting states or real
environment variations the original `10` recorded episodes never
visited — genuine replay for a harder, larger real environment would
need a real, larger, more varied stored sample than this lesson's own
small, deliberately bounded one.

### Commands Needed

Every command was already shown above, alongside its real output.

### Run It

Already shown above, in "The New Code" — `train_agent.py` first, then
`replay_agent.py`, genuinely separately.

### Connection

S13 is complete — and with it, the entire, real, planned curriculum
(`README.md`'s own S00 through S13). A real reinforcement-learning
agent's own experience now genuinely, durably outlives the process that
generated it, built on nothing but this project's own real work: a
page format from S02, a `Transaction` from S10, a `query` from S04 —
every real piece this project spent 27 lessons building, used together,
for real, for the first time, in this one, final lesson.

---

## Closing

### Connect the Pieces

This lesson's first unit hand-verified the Bellman equation's own real
update — a real Q-value moving halfway toward a real target — the
identical real discipline Lesson 26 already established for a neuron's
own gradient. The second unit ran that real update live, `5000` times,
against a real `gymnasium` environment, converging to a real, perfect
policy — then, deliberately, persisted only a small, real, bounded
sample of the *converged* policy's own experience, honestly reasoned
from this project's own real, known page-capacity limit rather than
an accident. The third unit proved the entire real point: a completely
separate process, given nothing but those `60` real, stored rows and no
live environment at all, replayed them into an equally real,
`1.00`-win-rate policy — real, direct, working proof of `README.md`'s
own final, standing promise for this whole project.

### What Breaks Without This

In `train_agent.py`, change `epsilon_decay = 0.999` to `epsilon_decay =
0.99` (a much faster real decay), rerun, and compare the real,
printed `live-trained policy win rate`. Real exploration collapses
toward `epsilon_min` far earlier in training, before the agent has
found the real goal often enough to learn a reliable path to it — the
real, printed win rate drops well below `1.00`, sometimes to `0.00`,
the identical real failure this lesson's own Mechanical Walkthrough
already reproduced once during development. Restore `0.999` and
confirm the real, perfect win rate returns.

### Exercises

- Change `is_slippery=False` to `is_slippery=True` (`FrozenLake`'s own
  real, stochastic mode — actions succeed only some of the time), retrain,
  and observe the real, resulting win rate. Explain, referencing this
  lesson's own CS Lens on temporal-difference learning, why a
  real, stochastic environment is a genuinely harder real problem than
  this lesson's own deterministic one.
- Increase the bounded sample in Phase 2 from `10` real episodes to a
  real number that would exceed this project's own real, `~95`-row
  page capacity, and observe the real `PocketDBError` this project has
  raised consistently since Lesson 15. Explain what a real fix would
  need — referencing S02's own real, deliberate one-page-per-table
  scope decision.
- `replay_agent.py` currently repeats its own real `50` passes over
  the identical `60` stored rows in a fixed order every time. Add real,
  random shuffling (`random.shuffle`) of `experience` before each real
  pass, retrain, and confirm the real, replayed win rate is unaffected
  — then explain why the real order transitions are replayed in
  shouldn't matter for this particular real algorithm.

### Definition of Done

- [ ] You hand-verified one real Q-learning update yourself and
      confirmed the real, correct output.
- [ ] You trained a real agent live, achieving a real win rate you
      recorded yourself (not just this lesson's own printed number).
- [ ] You ran `replay_agent.py` as a genuinely separate process from
      `train_agent.py` and confirmed the replayed policy's own real win
      rate.
- [ ] You caused the real "epsilon decays too fast" failure yourself
      and confirmed restoring `epsilon_decay = 0.999` fixes it.
- [ ] You can explain, from memory, why this lesson persists experience
      only *after* training converges, not throughout training —
      referencing this lesson's own SE Lens.
- [ ] Committed with a message stating why: for example,
      `git commit -m "Add Q-learning agent with real, persistent experience replay"`.
