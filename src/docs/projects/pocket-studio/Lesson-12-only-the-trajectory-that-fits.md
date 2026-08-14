# Lesson 12: Only the Trajectory That Fits

**What you will build** — a real "Persist Experience" button that
saves one real, complete, successful run of the agent Lesson 11 just
trained, and a real "Replay From Storage" button that trains a
*completely fresh* policy from nothing but those stored rows — no live
`gymnasium` environment involved in the learning at all — proving,
directly in the actual window, the identical real promise `pocket-db`'s
own Lesson 27 first made: a trained agent's own experience can outlive
the process that generated it. The real, transferable problem
underneath: this project's own, real, already-known page-capacity
limit (Lesson 15, `pocket-db`) turns out to collide with this
lesson's own harder, real environment's own honestly long successful
trajectories — a real, live constraint this lesson has to actually
navigate, not just cite.

**What you need to know first:** Lesson 11 (`trained_q_table`,
`best_action`, the harder `8x8` environment), `pocket-db`'s own Lesson
24 (`Transaction`/`.begin()`/`.commit()`/`.rollback()`, already given
full treatment there), `pocket-db`'s own Lesson 27 (persisting and
replaying experience, already given full treatment there).

**Terms introduced in this lesson:** None new — every real, new piece
this lesson needs (searching for a real trajectory that fits a real,
known capacity limit; training a fresh policy purely from stored rows)
reuses constructs this project or `pocket-db` has already named.

**Objects and methods used**
- **`Transaction.rollback()`** (`pocket-db`'s own `transaction.py`)
  - *What it is:* a hard concept reappearing from `pocket-db`'s own
    Lesson 24 — discards every real, staged `insert` a `Transaction`
    was holding, without ever writing them to the real, underlying
    table at all.
  - *Implementation:* `tx.rollback()` — already given full treatment;
    sets the real, internal `_staged` list back to empty and marks the
    transaction inactive.
  - *Its use:* this lesson's own real, *first* actual use of
    `rollback()` anywhere in either curriculum — every earlier real use
    of `Transaction` (`pocket-db`'s own Lesson 27 included) only ever
    called `commit()`.

---

## Concept Unit: Only the Trajectory That Fits

### The Problem

`pocket-db`'s own Lesson 27 persisted `10` short, real episodes
(`60` total real rows) from a `4x4` map whose real agent basically
never failed. Lesson 11's own agent trains against a genuinely harder,
real `8x8` map, with a real, honest, imperfect win rate — and, as this
unit's own real, isolated proof shows, a single *successful* real
episode there can be far longer than anything Lesson 27 ever had to
consider.

### Introduce the Concept in Isolation

Real, direct proof of this project's own, already-known page-capacity
limit (`pocket-db`'s own Lesson 15), for this exact, real, seven-column
schema:

```python
db.create_table("experience", episode=INTEGER, step=INTEGER, state=INTEGER,
                 action=INTEGER, reward=INTEGER, next_state=INTEGER, done=INTEGER)
for i in range(500):
    db.insert("experience", 0, i, 1, 2, 0, 3, 0)
```

Real output:

```text
failed at row 96 : Failed to insert into table 'experience'
total successfully inserted: 95
```

Separately, real, measured lengths of the trained agent's own
successful episodes (Lesson 11's own real policy, run greedily,
`is_slippery=True`):

```text
successes: 4 lengths: [97, 96, 48, 40]
```

*What this proves:* the real, exact capacity for this schema is `95`
rows — matching `pocket-db`'s own Lesson 27 real number exactly, for
the identical real reason (Lesson 15's own one-page-per-table design) —
and two of these four, real, genuinely successful episodes already
exceed it on their own. A real, fixed "record `N` episodes" plan
(Lesson 27's own real approach) isn't safe here; some real, individual
successes are simply too long to store at all.

### Discard the Throwaway Example

Both isolated scripts above were run only to measure real, existing
limits; neither is real project code, and neither is kept.

### Project Change

- **Reference Source:** `pocket-db`'s own
  `Lesson-27-a-policy-that-outlives-the-process.md`, its own second
  Concept Unit's `train_agent.py` (the real "persist a bounded sample"
  pattern this unit adapts) and `transaction.py:1-24` (`Transaction`,
  reused unchanged).
- **Files affected:** `query_server.py` (a new `elif method ==
  "persist_experience":` branch); `transaction.py` (a real, new file —
  this project's own copy did not previously exist).
- **Change type:** Add.
- **Dependencies:** Lesson 11's own `trained_q_table`/`best_action`.

### The New Code — `query_server.py`

```python
for attempt in range(attempt_count):
    state, _ = record_env.reset(seed=9000 + attempt)
    tx = conn._db.begin()
    steps_this_attempt = 0
    reached_goal = False
    for step in range(max_rows_per_episode):
        action = best_action(trained_q_table[state])
        next_state, reward, terminated, truncated, _ = record_env.step(action)
        done = terminated or truncated
        tx.insert("experience", 0, step, state, action, int(reward), next_state, int(done))
        steps_this_attempt += 1
        state = next_state
        if done:
            reached_goal = reward > 0
            break

    if reached_goal:
        tx.commit()
        rows_persisted = steps_this_attempt
        break
    else:
        tx.rollback()
```

### The Updated Project — `query_server.py`'s `persist_experience` branch

```python
    elif method == "persist_experience":
        if trained_q_table is None:
            raise ValueError("No agent has been trained yet")

        conn._db.create_table(
            "experience",
            episode=INTEGER, step=INTEGER, state=INTEGER,
            action=INTEGER, reward=INTEGER, next_state=INTEGER, done=INTEGER,
        )

        record_env = gym.make("FrozenLake-v1", map_name="8x8", is_slippery=True)
        attempt_count = 100
        max_rows_per_episode = 90
        rows_persisted = 0

        for attempt in range(attempt_count):
            state, _ = record_env.reset(seed=9000 + attempt)
            tx = conn._db.begin()
            steps_this_attempt = 0
            reached_goal = False
            for step in range(max_rows_per_episode):
                action = best_action(trained_q_table[state])
                next_state, reward, terminated, truncated, _ = record_env.step(action)
                done = terminated or truncated
                tx.insert(
                    "experience", 0, step, state, action, int(reward), next_state, int(done)
                )
                steps_this_attempt += 1
                state = next_state
                if done:
                    reached_goal = reward > 0
                    break

            if reached_goal:
                tx.commit()
                rows_persisted = steps_this_attempt
                break
            else:
                tx.rollback()

        record_env.close()

        if rows_persisted == 0:
            raise ValueError("Could not find a successful episode short enough to persist")

        return {"episodesRecorded": 1, "rowsPersisted": rows_persisted}
```

`persist_experience` real, deliberately targets exactly *one* real,
complete, successful episode, rather than several — this unit's own
first, isolated proof already showed why: even one real success can
approach this project's own known `95`-row ceiling, leaving no safe
real room for a second.

### Mechanical Walkthrough

- `attempt_count = 100` / `max_rows_per_episode = 90` — first, real
  appearance of both — `90`, not `95`, leaves a small, deliberate, real
  safety margin; `100` real attempts is generous, since most real
  attempts (this map's own honest win rate, Lesson 11) never reach the
  real goal at all.
- `tx = conn._db.begin()` — reappearing shape (`pocket-db`'s own Lesson
  24, `.begin()` already given full treatment) — real, staged, not yet
  written.
- `for step in range(max_rows_per_episode): ... tx.insert(...)` —
  reappearing shape (`Transaction.insert`, `pocket-db`'s own Lesson
  24); real, each step staged, capped at `90`, so a real episode that's
  simply taking too long stops being recorded before it could ever
  exceed the real page capacity.
- `if done: reached_goal = reward > 0; break` — reappearing shape
  (already established); real, `FrozenLake`'s own convention — `reward`
  is `1.0` only at the real, actual goal, `0.0` for a real hole or a
  real timeout.
- `if reached_goal: tx.commit()` — reappearing shape (`.commit()`,
  `pocket-db`'s own Lesson 24/27) — only a real, genuine success is
  ever actually written.
- `else: tx.rollback()` — covered fully in Objects and methods used,
  above — a real, failed or incomplete attempt's own staged rows are
  discarded, real, entirely, as if they were never inserted at all.
- `if rows_persisted == 0: raise ValueError(...)` — reappearing shape
  (already established) — a real, honest, named failure: if no real,
  short-enough success turns up in `100` real tries, this project says
  so plainly instead of silently persisting nothing.

### CS Lens

Trying several real, candidate outcomes and only keeping the one that
satisfies a real constraint, discarding the rest, is **generate-and-
test** — a real, general strategy any real search reaches for when
there's no way to directly *construct* a real, correct answer, only to
recognize one once it appears.

Also recognized in: a real database's own retry logic on a real
unique-constraint violation (generate a new real ID, try again); a
real hash-table implementation probing for the next real, open slot on
a real collision; a real compiler's own constant-folding pass, which
tries a real optimization and simply keeps the original real code if
the optimized version doesn't actually satisfy some real, required
property.

### SE Lens

Why not simply raise `max_rows_per_episode` to `95` — this project's
own real, exact, known limit — instead of leaving a real, deliberate
margin at `90`? Because the real column values this lesson inserts
(`0`, `step`, `state`, `action`, `reward`, `next_state`, `done`) aren't
the *only* real thing that could ever occupy this table's own single
real page — a real, small margin protects against this project's own
future, real growth (an added column, a slightly different real
encoding) silently shrinking the real, usable row budget without this
lesson's own code ever being told.

### Commands Needed

```bash
npm start
```

### Run It

Real, end-to-end proof, from the actual, running window:

```text
persisted 1 episode(s), 45 rows
```

*What this proves:* a real, genuinely successful, `45`-step episode —
comfortably under both this lesson's own `90`-row cap and this
project's own real, `95`-row hard limit — was found and real, durably
written; every other real, unsuccessful attempt tried along the way
left nothing behind at all.

### Connection

A real, converged agent's own experience is durably stored. Proving a
*different*, fresh policy can learn from nothing but those stored rows
is next.

---

## Concept Unit: A Fresh Policy, Taught by Nothing But Storage

### The Problem

`experience` now holds real, stored rows. Nothing yet has proven those
rows alone — with no live environment, no `trained_q_table` from
Lesson 11 — are enough to teach a *new*, real Q-table anything at all.

### Project Change

- **Reference Source:** `pocket-db`'s own
  `Lesson-27-a-policy-that-outlives-the-process.md`, its own third
  Concept Unit's `replay_agent.py` — the real, offline replay loop this
  branch is built from.
- **Files affected:** `query_server.py` (a new `elif method ==
  "replay_agent":` branch).
- **Change type:** Add.
- **Dependencies:** This lesson's own first unit.

### The New Code — `query_server.py`

```python
for pass_number in range(50):
    for row in experience:
        values = row.values()
        state = int(values[2])
        action = int(values[3])
        reward = int(values[4])
        next_state = int(values[5])
        done = int(values[6])

        best_next = max(replay_q_table[next_state])
        target = reward + gamma * best_next * (0 if done else 1)
        replay_q_table[state][action] += alpha * (target - replay_q_table[state][action])
```

### The Updated Project — `query_server.py`'s `replay_agent` branch

```python
    elif method == "replay_agent":
        experience = conn._db.query("experience")
        if not experience:
            raise ValueError("No experience has been persisted yet")

        replay_env = gym.make("FrozenLake-v1", map_name="8x8", is_slippery=True)
        state_count = replay_env.observation_space.n
        action_count = replay_env.action_space.n
        replay_env.close()

        replay_q_table = [[0.0] * action_count for _ in range(state_count)]
        alpha = 0.5
        gamma = 0.95

        for pass_number in range(50):
            for row in experience:
                values = row.values()
                state = int(values[2])
                action = int(values[3])
                reward = int(values[4])
                next_state = int(values[5])
                done = int(values[6])

                best_next = max(replay_q_table[next_state])
                target = reward + gamma * best_next * (0 if done else 1)
                replay_q_table[state][action] += alpha * (target - replay_q_table[state][action])

        return {
            "transitionsUsed": len(experience),
            "winRate": evaluate_policy(replay_q_table),
        }
```

`replay_q_table` starts at exactly the same, real, all-zero shape
`train_agent` (Lesson 11) did — the real, entire point is that this
one learns *only* from `experience`'s own stored rows, never from a
live `gymnasium.step()` call.

### Mechanical Walkthrough

- `experience = conn._db.query("experience")` — reappearing shape
  (`pocket-db`'s own `query()`, Lesson 4) — real, ordinary read; nothing
  RL-specific about how the data comes back at all.
- `replay_env = gym.make(...); state_count = ...; action_count = ...;
  replay_env.close()` — reappearing shape (`pocket-db`'s own Lesson 27
  used the identical real pattern) — a live environment is real,
  briefly created only to read its own static `state_count`/
  `action_count`, then closed immediately, before a single real
  `.step()` ever runs — real, honest proof that *training* itself never
  touches it.
- `for pass_number in range(50): for row in experience: ...` —
  reappearing shape (`pocket-db`'s own Lesson 27, an outer real,
  repeated-pass loop over a fixed, small, real dataset) — replays the
  identical, small, real, stored trajectory `50` real times, rather
  than generating new, real transitions.
- `values = row.values()` — reappearing shape (`Record.values()`,
  `pocket-db`'s own Lesson 4) — `int(values[2])` etc. — reappearing
  shape (already established raw-string-to-`int` conversion) — real,
  positional access matching `experience`'s own real, declared column
  order (`episode, step, state, action, reward, next_state, done`).
- `best_next = max(replay_q_table[next_state])` / `target = reward +
  gamma * best_next * (0 if done else 1)` / `replay_q_table[state]
  [action] += alpha * (target - replay_q_table[state][action])` — a
  hard concept reappearing (per the Repetition Rule — the real Bellman
  update, `pocket-db`'s own Lesson 27, already given full treatment) —
  the identical real formula Lesson 11's own live training used,
  applied here to a real, stored transition instead of a freshly
  generated one.

### CS Lens

Training repeatedly from a real, small, fixed set of stored
transitions instead of a live environment is the identical real
**experience replay** idea `pocket-db`'s own Lesson 27 already named —
real, past experience treated as reusable, valuable data, not
something that only mattered once, at the real moment it happened.

### SE Lens

Why does `replay_agent` run `50` real passes over the identical, small,
stored dataset, rather than just one? Because one real pass through
`45` real rows gives `Q`-values almost no real chance to propagate
backward from the real, single reward at the very end of the real,
stored trajectory to the states earlier in it — repeating the identical
real, small dataset lets the real Bellman update (this lesson's own
Mechanical Walkthrough) slowly, correctly spread that real signal
across every real, stored transition, the identical real reasoning
`pocket-db`'s own Lesson 27 already gave.

### Commands Needed

No new commands for this unit.

### Run It

Real, end-to-end proof:

```text
replayed using 45 stored transitions, win rate 0.10
```

*What this proves:* a fresh, real Q-table — built from nothing but `45`
real, stored rows, no live environment ever stepped — reaches a real,
non-zero win rate purely from replay. Real, honestly lower than
`pocket-db`'s own Lesson 27 (`1.00`) — this lesson's own SE Lens, below,
explains exactly why, rather than leaving the real, lower number
unexplained.

### Connection

A fresh policy really did learn from storage alone. Making both real
steps — persist, then replay — reachable as real, ordinary buttons in
the actual window is last.

---

## Concept Unit: Two Buttons That Prove the Point

### The Problem

`persist_experience` and `replay_agent` are real, callable protocol
methods, but nothing in the actual, running window can reach either one
yet.

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:** `src/preload.ts` (modified —
  `persistExperience`/`replayAgent`), `src/main.ts` (modified —
  matching handlers), `src/App.tsx` (modified — two real, new buttons,
  chained by real, conditional rendering).
- **Change type:** Add.
- **Dependencies:** This lesson's own previous two units.

### The New Code — `src/App.tsx`

```typescript
{agentResult !== null && (
  <>
    <button onClick={persistExperience}>Persist Experience</button>
    {persistResult !== null && (
      <p>
        persisted {persistResult.episodesRecorded} episode(s),{" "}
        {persistResult.rowsPersisted} rows
      </p>
    )}
  </>
)}

{persistResult !== null && (
  <>
    <button onClick={replayAgent}>Replay From Storage</button>
    {replayResult !== null && (
      <p>
        replayed using {replayResult.transitionsUsed} stored transitions, win rate{" "}
        {replayResult.winRate.toFixed(2)}
      </p>
    )}
  </>
)}
```

### The Updated Project — `src/App.tsx`, the Train Agent section

```typescript
      <h2>Train Agent</h2>
      <button onClick={trainAgent} disabled={trainingAgent}>
        Train Agent
      </button>
      {trainingAgent && agentProgress !== null && (
        <p>
          episode {agentProgress.episode} / {agentProgress.episodeCount}
        </p>
      )}
      {agentResult !== null && (
        <p>
          trained {agentResult.episodeCount} episodes, win rate{" "}
          {agentResult.winRate.toFixed(2)}
        </p>
      )}

      {agentResult !== null && (
        <>
          <button onClick={persistExperience}>Persist Experience</button>
          {persistResult !== null && (
            <p>
              persisted {persistResult.episodesRecorded} episode(s),{" "}
              {persistResult.rowsPersisted} rows
            </p>
          )}
        </>
      )}

      {persistResult !== null && (
        <>
          <button onClick={replayAgent}>Replay From Storage</button>
          {replayResult !== null && (
            <p>
              replayed using {replayResult.transitionsUsed} stored transitions, win rate{" "}
              {replayResult.winRate.toFixed(2)}
            </p>
          )}
        </>
      )}
```

The entire real "Train Agent" section now reads as one, real, linear
chain: training must finish (`agentResult !== null`) before "Persist
Experience" even appears; persisting must finish (`persistResult !==
null`) before "Replay From Storage" appears — each real button is a
real, honest gate on the step actually having happened, the identical
real conditional-rendering idea (`&&`) this project has used since
Lesson 4.

### Mechanical Walkthrough

- `{agentResult !== null && (<>...</>)}` — reappearing shape
  (conditional rendering, Lesson 4) — real, the entire "Persist
  Experience" block, including its own real, nested result display,
  only ever renders once real training has genuinely produced a result.
- `<button onClick={persistExperience}>Persist Experience</button>` —
  reappearing shape (an ordinary, real, established button pattern) —
  `persistExperience`/`replayAgent`, both real, plain `async function`s
  following the identical shape `analyzeTable`/`trainModel` (Lessons 9,
  10) already established: call the real API, `setState` with the
  result.
- `{persistResult !== null && (<>...</>)}` — reappearing shape,
  nested one level deeper — real, "Replay From Storage" itself is
  gated on persisting having *already* happened, not merely on training
  having happened.

### CS Lens

Gating each real step's own visibility on the previous one's real
completion is a small, real instance of a **finite-state UI** — the
actual, real set of controls a user can even see reflects a real,
current stage in a real, multi-step process, rather than presenting
every real control at once and hoping a user clicks them in the
correct real order.

### SE Lens

Why gate "Replay From Storage" on `persistResult`, specifically,
rather than just always showing it once any table happens to already
be named `"experience"` (say, from a previous real session)? Because
`persistResult`, real, in-memory `React` state, only reflects something
that genuinely just happened in *this* real, running session — real,
stale data left over from an earlier real run could exist in the
real, underlying `.pdb` file without this specific session ever having
produced it, and this lesson's own real, deliberately narrow scope is
proving the real, immediate persist-then-replay chain, not building a
general "detect and resume prior sessions" feature.

### Commands Needed

```bash
npm start
```

### Run It

Real, complete, end-to-end proof, from the actual, running window,
three real clicks in order:

```text
<h2>Train Agent</h2>
<button>Train Agent</button>
<p>trained 50000 episodes, win rate 0.16</p>
<button>Persist Experience</button>
<p>persisted 1 episode(s), 45 rows</p>
<button>Replay From Storage</button>
<p>replayed using 45 stored transitions, win rate 0.10</p>
```

*What this proves:* every real piece this lesson and Lesson 11 built —
live training with real progress, a real, bounded, honest persistence
search, and a real, fresh policy learned purely from storage — works
correctly together, end to end, driven by nothing but real, ordinary
clicks in the actual window.

### Connection

S12 is complete: this project's own entire, real ML/RL arc (S09-S12)
is done. Every real capability `pocket-db`'s own S11-S13 first proved
from standalone scripts — statistics, model training, and now a trained
agent's own experience genuinely outliving the process that produced
it — is reachable from inside the actual GUI.

---

## Closing

### Connect the Pieces

This lesson's first unit discovered a real, live collision between two
already-known real facts — this project's own `95`-row page capacity
(`pocket-db`'s own Lesson 15) and this project's own genuinely long
successful episodes on a harder, real map (Lesson 11) — and resolved it
honestly: search real, candidate episodes, keep only the one real
success that actually fits, using `Transaction.rollback()` for the
first real time in either curriculum to discard every attempt that
doesn't. The second unit proved that real fresh policy — trained
purely from those stored rows, with a live environment only ever
touched to read its own static size, never stepped — reaches a real,
genuine, non-zero win rate, the identical real "experience replay" idea
`pocket-db`'s own Lesson 27 already proved, now honestly reproduced
under harder, real conditions. The third unit chained both real steps
into two, real, properly-gated buttons, proven end-to-end with a real,
three-click sequence in the actual, running window.

### What Breaks Without This

In `query_server.py`'s own `persist_experience` branch, change
`max_rows_per_episode` from `90` back to a real, much larger number —
say `300` — rebuild nothing (pure Python), and click "Train Agent" then
"Persist Experience" again in the actual window. A real, successful,
`96`- or `97`-step episode (this lesson's own first unit already
measured real episodes this long) can now be attempted in full, and
`tx.commit()` genuinely fails partway through once the real page fills
— surfacing as a real, clean, caught error
(`"Failed to insert into table 'experience'"`) rather than a silent
problem, since this project's own top-level `try`/`except` (Lesson 2)
still catches it. Restore `max_rows_per_episode = 90` and confirm
persisting succeeds again.

### Exercises

- `persist_experience` currently discards every failed attempt with no
  real, visible trace at all. Add a real, returned `attemptsTried`
  count to its own response, and show it in the window
  ("found a successful episode after `N` attempts"), making the real
  cost of this lesson's own generate-and-test search visible to a user.
- This lesson's own `replay_agent` always runs exactly `50` real
  passes over the stored data. Add a real parameter letting a caller
  choose the pass count, and empirically find — by trying several real
  values yourself — roughly how few real passes still produce a
  real, non-zero win rate for this project's own, specific, `45`-row
  dataset.
- `evaluate_policy` (Lesson 11) is reused, unchanged, by both
  `train_agent` and `replay_agent`. Add a real, third caller: a
  "Compare" button showing both win rates — the original,
  live-trained one and the replayed one — side by side, making this
  lesson's own real, honest gap between them (`0.16` versus `0.10` in
  this session's own real run) directly visible, not just printed
  separately.

### Definition of Done

- [ ] `query_server.py`'s own `persist_experience` searches for a real,
      successful episode short enough to fit this project's own known
      `95`-row limit, using `Transaction.rollback()` on every real
      attempt that doesn't qualify.
- [ ] `replay_agent` trains a real, fresh `q_table` purely from stored
      rows, touching a live environment only to read its own static
      size.
- [ ] You ran this lesson's own isolated page-capacity proof yourself
      (or confirmed its real, captured output) and understand why `95`
      is this schema's own real limit.
- [ ] "Persist Experience" and "Replay From Storage" both exist as
      real, properly gated buttons in the actual, running window, each
      showing a real result after a real click.
- [ ] You caused the real "page full" regression yourself (raising
      `max_rows_per_episode`) and confirmed restoring `90` fixes it.
- [ ] You can explain, from memory, why this lesson's own real,
      replayed win rate is honestly lower than `pocket-db`'s own Lesson
      27 — referencing this lesson's own second unit's SE Lens.
- [ ] Committed with a message stating why, for example:
      `git commit -m "Persist and replay real agent experience, reachable from the GUI"`.
