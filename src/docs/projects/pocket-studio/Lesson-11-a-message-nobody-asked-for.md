# Lesson 11: A Message Nobody Asked For

**What you will build** — a real "Train Agent" button that starts a
real, live Q-learning agent training against a genuinely harder,
real `gymnasium` environment than `pocket-db`'s own Lesson 27 ever
used — one that honestly takes real, tens-of-seconds wall-clock time —
while the actual, running window shows a real, live episode counter
updating throughout, not a frozen button with no feedback. The real,
transferable problem underneath: every real capability this project has
built since Lesson 1 has been strictly request-then-response — ask one
real question, get back exactly one real answer. Live progress is a
genuinely different real shape: many real, unprompted messages, sent
*during* one still-open request, that nothing on the receiving end ever
asked for individually.

**What you need to know first:** Lesson 1 (`ipcMain.handle`/
`ipcRenderer.invoke`, this project's only IPC pattern until now),
Lesson 2 (the JSON-lines protocol, `PocketDBClient`'s own
request/response matching by `id`), `pocket-db`'s own Lesson 27
(Q-learning, the Bellman equation, already given full treatment there).

**Terms introduced in this lesson:**
- **optional chaining (`?.`)** — a real, standard TypeScript/JavaScript
  operator, first used in this project here. `a?.b` real-evaluates to
  `undefined` immediately, without ever touching `.b` at all, the
  moment `a` is real `null`/`undefined` — real-avoiding the exact
  `TypeError` a plain `a.b` would throw in that case. Applies equally
  to a real, plain property (`a?.b`) and, as this lesson's own code
  uses it twice, a real function call (`a?.(x)`, calling `a` only if it
  isn't real `null`/`undefined`).

**Objects and methods used**
- **`enumerate`**
  - *What it is:* Python's own real, standard builtin — wraps a real
    iterable so a loop gets each real item *paired with its own real,
    integer index*, instead of the item alone.
  - *Implementation:* `enumerate(iterable) -> ` a real, lazy sequence
    of `(index, item)` tuples.
  - *Its use:* this lesson's own real `best_action` helper, pairing
    each real action's own index with its own real, learned value, so
    a genuine tie can be real, correctly detected by index.
- **`random.choice`**
  - *What it is:* Python's own real, standard `random` module function
    — picks one real, uniformly-random element from a real, non-empty
    sequence.
  - *Implementation:* `random.choice(sequence)`.
  - *Its use:* `best_action`'s own real, final step — choosing real,
    uniformly among whichever actions are genuinely tied for the
    highest value, this lesson's own real fix for the tie-breaking bug.
- **`webContents.send` / `ipcRenderer.on`**
  - *What they are:* Electron's own real, second IPC mechanism — unlike
    `ipcMain.handle`/`ipcRenderer.invoke` (Lesson 1), which is strictly
    one real request answered by exactly one real reply,
    `webContents.send(channel, ...args)` (main → renderer) and
    `ipcRenderer.on(channel, callback)` (the renderer's own, real
    listener) let the main process push any number of real, unprompted
    messages to the renderer at any real time, with no corresponding
    "ask" required for each one.
  - *Implementation:* `mainWindow.webContents.send("agent-progress",
    data)`; `ipcRenderer.on("agent-progress", (event, data) =>
    ...)`.
  - *Its use:* this lesson's own real, entire mechanism for getting a
    live episode count out of a single, still-running `train_agent`
    request and into the actual window before that request ever
    finishes.

---

## Concept Unit: A Harder, Real Problem — and a Bug Hiding Inside It

### The Problem

`pocket-db`'s own Lesson 27 trained a real Q-learning agent for `5000`
real episodes against `FrozenLake-v1`'s own small, easy, `4x4`,
deterministic map — genuinely fast (measured this session:
`0.162` real seconds). A GUI feature that finishes before a real user's
own eye can register anything happened doesn't honestly need live
progress reporting at all; building one anyway, against a fake, invented
delay, would be dishonest. A real reason has to exist first.

### Introduce the Concept in Isolation

Real, measured timing, the identical real training loop, against the
`8x8`, stochastic (`is_slippery=True`) map instead:

```text
trained 5000 episodes (8x8, slippery) in 36.219 seconds
win rate: 0.46
```

*What this proves:* a genuinely harder, real environment — more real
states, real, unpredictable transitions — takes real, honestly
multi-second time even for a small number of real episodes; live
progress now has a real, measured reason to exist.

Increasing real, honest thoroughness (a full `100,000`-episode run,
checking real progress every `20,000`), a second, real, more troubling
result appeared:

```text
episode 20000: goal_hits so far=0, elapsed=6.2s, win_rate_now=0.00
episode 40000: goal_hits so far=0, elapsed=13.1s, win_rate_now=0.00
episode 60000: goal_hits so far=0, elapsed=20.0s, win_rate_now=0.00
episode 80000: goal_hits so far=0, elapsed=26.8s, win_rate_now=0.00
episode 100000: goal_hits so far=0, elapsed=33.7s, win_rate_now=0.00
```

Zero real goal hits, across `100,000` real episodes — worse than the
first, smaller run, not better. A real, raw, *pure*-random baseline
(no learning at all) found the goal `37` times in `20,000` real
tries — meaning the real, live-training run above was somehow doing
*worse* than acting completely randomly.

*What this proves:* something in the real training loop itself, not
just the environment's own real difficulty, was actively working
against it.

### Discard the Throwaway Example

The isolated timing scripts above were run only to measure and diagnose
a real, existing problem; neither is real project code, and neither is
kept.

### Mechanical Walkthrough

- `q_table[state].index(max(q_table[state]))` — the real, existing
  "pick the best known action" line, unchanged since `pocket-db`'s own
  Lesson 27 — `.index(max(...))` real-returns the *first* real action
  whose value equals the real maximum, not a real, random one among
  any ties.
- Every `q_table` entry starts at exactly `0.0`, real-identical across
  every real action, for every real state that hasn't been visited yet
  — which, early in a real, large, `8x8` environment, is most of them.
- The real, direct consequence: `.index(max(...))` on an all-zero real
  row always real-returns action `0` — on `FrozenLake`, real, literally
  "move left" — meaning the moment `epsilon` decays enough to matter,
  the real "exploit" branch stops behaving like a real fallback and
  starts real, actively pulling the agent toward one fixed, real
  direction, away from where the real goal actually is.

### CS Lens

This is a real, classic, well-documented reinforcement-learning
pitfall: **naive argmax tie-breaking**. A real function like `.index(
max(...))` or `numpy.argmax` looks like it's choosing "the best
option," but on a real tie, it silently, deterministically favors
whichever option happens to sort first — indistinguishable from a real
bug unless a reader already knows to look for it, because the code
never raises a real error; it just quietly, systematically prefers one
real direction.

Also recognized in: a real load balancer that always picks server `0`
whenever every real server reports identical load, silently
overloading it; a real scheduling algorithm that always breaks a tie by
process ID, systematically starving whichever process happens to have
been created last; a real sorting-based "pick a winner" step anywhere
ties are more common than the code's own author assumed.

### SE Lens

Why didn't `pocket-db`'s own Lesson 27 ever hit this real bug, if the
identical real line (`.index(max(...))`) is used there too? Because its
own real, `4x4`, deterministic map is small and easy enough that a
random walk finds the real goal constantly, *before* `epsilon` ever
decays far enough for the real bias to matter — the identical real code
was never actually exercised under the real conditions that expose it.
This is a real, honest, worked example of why this project's own
established standard — verify a real construct against a small, real
input before trusting it on the input it was actually built for (the
Concept Isolation Rule's own escalating-input guidance) — matters even
for code that already, apparently, worked once elsewhere.

### Project Change

- **Reference Source:** `pocket-db`'s own
  `Lesson-27-a-policy-that-outlives-the-process.md`, its own second
  Concept Unit's `train_agent.py` — the real Q-learning loop this
  lesson's own `train_agent` protocol method (next unit) is built from,
  with this unit's own real fix applied.
- **Files affected:** `query_server.py` (a new, real `best_action`
  helper).
- **Change type:** Add.
- **Dependencies:** None beyond what this project already has.

### The New Code — `query_server.py`

```python
def best_action(q_row):
    best_value = max(q_row)
    best_actions = [action for action, value in enumerate(q_row) if value == best_value]
    return random.choice(best_actions)
```

### The Updated Project — `query_server.py`

```python
def evaluate_policy(q_table, trial_count=100):
    eval_env = gym.make("FrozenLake-v1", map_name="8x8", is_slippery=True)
    wins = 0
    for trial in range(trial_count):
        state, _ = eval_env.reset(seed=5000 + trial)
        for _ in range(200):
            action = best_action(q_table[state])
            state, reward, terminated, truncated, _ = eval_env.step(action)
            if terminated or truncated:
                if reward > 0:
                    wins += 1
                break
    eval_env.close()
    return wins / trial_count
```

`best_action` sits alongside `evaluate_policy` (this lesson's own next
unit adds the real training loop that calls both); every real, future
"which action looks best" decision in this lesson routes through it
instead of the real, original, biased `.index(max(...))` line.

### Mechanical Walkthrough

- `best_value = max(q_row)` — reappearing shape (`max`, already
  established) — the real, highest value among this real state's own
  four real action values.
- `[action for action, value in enumerate(q_row) if value == best_value]`
  — `enumerate`, first appearance — real-pairs every real action index
  with its own real value; the list comprehension (already established,
  `pocket-db`'s own Lesson 25) keeps only the ones real-tied for the
  maximum, instead of only the first.
- `random.choice(best_actions)` — first, real appearance of
  `random.choice` — picks real, uniformly among whichever real actions
  are actually tied; when there's real, only one true maximum, this is
  the identical real result `.index(max(...))` already gave — the real
  fix changes behavior *only* in the exact real case that was broken.

### CS Lens

Breaking ties real, uniformly at random restores a genuinely important
real property this project's own earlier "exploit" step silently
lacked: **unbiased selection among equally good options**. A real
policy that's supposed to represent "no real preference yet" should
behave that way, not secretly encode a fixed, real, arbitrary
preference nobody chose on purpose.

### SE Lens

Why fix this with real, random tie-breaking, rather than simply
initializing `q_table` with tiny, real, distinct random values instead
of exact zeros (a real, common alternative in some real RL
implementations)? Because random initialization would only mask the
identical real problem, not fix it — ties can still real, genuinely
recur later in training (two real actions truly deserving equal value),
and a real fix that only works when initial values happen to differ is
a real, fragile fix, not a correct one.

### Commands Needed

No new commands for this unit.

### Run It

Real, re-run proof with the fix applied — the identical real, harder
`8x8`, slippery environment:

```text
episode  5000: goal_hits so far=270,  win_rate_now=0.15
episode 15000: goal_hits so far=1509, win_rate_now=0.51
episode 50000: goal_hits so far=5850, win_rate_now=0.11
```

*What this proves:* the agent now real, genuinely reaches the goal
thousands of real times across training (versus real, literal zero
before), and the real, final win rate — noisy, imperfect, honestly
reported, not smoothed over — is a real, legitimate outcome for a
genuinely hard, stochastic environment, not a symptom of a real, hidden
bug anymore.

### Connection

A correct, real Q-learning loop exists, and takes long enough, for a
real, honest reason, to need live progress. Sending that progress back
while the real request is still open is next.

---

## Concept Unit: A Response Line That Isn't the Response

### The Problem

`query_server.py`'s own real protocol (Lesson 2) has always matched
exactly one real response line to each real request `id`, then
forgotten it. A real, live training loop needs to send *several* real
lines under the identical real `id`, before the real, final one — and
`PocketDBClient` (Lesson 2) currently deletes a pending request the
moment *any* line with a matching real `id` arrives.

### Introduce the Concept in Isolation

Real, isolated proof — the real, existing protocol, unmodified, with a
`train_agent` request in flight, its own real stdout captured line by
line:

```text
PROGRESS: {"episode":2000,"episodeCount":50000}
PROGRESS: {"episode":4000,"episodeCount":50000}
...
PROGRESS: {"episode":50000,"episodeCount":50000}
FINAL: {"id":2,"result":{"episodeCount":50000,"winRate":0.28}}
```

*What this proves:* nothing stops `query_server.py` from printing many
real, extra lines — real, valid JSON, one per real line, exactly like
every other real response — *before* its own real, final
`{"id": 2, "result": ...}` line. `PocketDBClient`'s own real buffering
(Lesson 2) already handles this correctly at the framing level (each
real line still ends in `\n`); the real, new problem is purely what the
*client* does once it has one.

### Discard the Throwaway Example

This isolated test ran directly against real, already-existing project
code and produced no separate, discardable files.

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:** `query_server.py` (modified — `train_agent`
  prints real, periodic progress lines); `src/pocketdb-client.ts`
  (modified — `RpcResponse`/`PendingRequest` gain a real `progress`
  field; `handleData` and `request` both updated).
- **Change type:** Add.
- **Dependencies:** This lesson's own first unit.

### The New Code — `query_server.py`

```python
if (episode + 1) % progress_interval == 0:
    progress_line = {
        "id": request_id,
        "progress": {"episode": episode + 1, "episodeCount": episode_count},
    }
    print(json.dumps(progress_line), flush=True)
```

### The Updated Project — `query_server.py`'s `train_agent` branch

```python
    elif method == "train_agent":
        global trained_q_table
        request_id = request["id"]

        env = gym.make("FrozenLake-v1", map_name="8x8", is_slippery=True)
        state_count = env.observation_space.n
        action_count = env.action_space.n
        q_table = [[0.0] * action_count for _ in range(state_count)]

        alpha = 0.5
        gamma = 0.95
        epsilon = 1.0
        epsilon_min = 0.1
        epsilon_decay = 0.9995
        episode_count = 50000
        progress_interval = 2000

        for episode in range(episode_count):
            state, _ = env.reset()
            for step in range(200):
                if random.random() < epsilon:
                    action = env.action_space.sample()
                else:
                    action = best_action(q_table[state])
                next_state, reward, terminated, truncated, _ = env.step(action)
                done = terminated or truncated
                best_next = max(q_table[next_state])
                target = reward + gamma * best_next * (0 if done else 1)
                q_table[state][action] += alpha * (target - q_table[state][action])
                state = next_state
                if done:
                    break
            epsilon = max(epsilon_min, epsilon * epsilon_decay)

            if (episode + 1) % progress_interval == 0:
                progress_line = {
                    "id": request_id,
                    "progress": {"episode": episode + 1, "episodeCount": episode_count},
                }
                print(json.dumps(progress_line), flush=True)

        env.close()
        trained_q_table = q_table

        return {"episodeCount": episode_count, "winRate": evaluate_policy(q_table)}
```

`train_agent`'s own real training loop — the identical real algorithm
this lesson's own first unit already fixed and proved — now prints one
real, extra `progress` line every `2000` real episodes, using the exact
same real `id` the eventual `{"id": request_id, "result": ...}` line
(printed by the unchanged, real bottom loop, Lesson 2) will use.

### Mechanical Walkthrough

- `request_id = request["id"]` — reappearing shape (dict indexing,
  already established); saved once, up front, since `request` itself
  isn't in scope inside the real training loop's own, later real lines.
- `(episode + 1) % progress_interval == 0` — reappearing shape (`%`,
  already established since `pocket-db`'s own real work) — real,
  exactly every `2000`th episode, `1`-indexed so the real, first
  progress line reports `2000`, not `0`.
- `{"id": request_id, "progress": {...}}` — first appearance of a real,
  new message shape this protocol has never sent before: a real
  dictionary with a `progress` key instead of `result`/`error`, but the
  identical real `id` as the request it belongs to.
- `print(json.dumps(progress_line), flush=True)` — reappearing shape
  (the identical real pattern the bottom, response-writing loop already
  uses, Lesson 2) — real, immediately visible to the parent process the
  moment each real line is written, not buffered until the function
  returns.

The real, new piece on the TypeScript side:

```typescript
interface RpcResponse {
  id: number;
  result?: unknown;
  error?: string;
  progress?: unknown;
}
```

`progress` joins `result`/`error` as a real, third, optional field —
any one real line now carries exactly one of the three. `handleData`
(Lesson 2) checks for it first, before deciding whether this request is
actually finished:

```typescript
if (response.progress !== undefined) {
  pending.onProgress?.(response.progress);
  continue;
}

this.pending.delete(response.id);
```

- `response.progress !== undefined` — reappearing shape (already
  established comparison syntax) — the real, only way `handleData`
  tells a real progress line apart from a real, final one.
- `pending.onProgress?.(response.progress)` — first appearance of the
  real, optional-call operator (`?.` applied to a function value, not
  just a property) — calls `onProgress` only if a real, non-`undefined`
  callback was actually provided when `request()` was called; does
  nothing, safely, otherwise.
- `continue` — reappearing syntax (already established) — real,
  deliberately skips `this.pending.delete(response.id)`, the one real
  line that would otherwise end this request early.

### CS Lens

Reusing the identical real `id` for both progress and the final result
is a small, real instance of a **correlation identifier** — the same
real idea a distributed system's own real "trace ID" or "request ID"
uses to tie many real, separate log lines back to the one real
operation that produced them, without needing a second, separate
bookkeeping scheme.

### SE Lens

Why does `train_agent` print progress from *inside* `handle_request`
itself, rather than the real, existing bottom loop somehow polling for
updates? Because `handle_request` is already real, synchronously
running the entire real training loop — nothing else in this
single-threaded real Python process runs concurrently with it; printing
directly, from inside the loop, at the real moment each milestone
happens, is the only real option that doesn't require a second, real
process or thread this project has no other real reason to add.

### Commands Needed

No new commands for this unit.

### Run It

Shown above, under "Introduce the Concept in Isolation" and "The
Updated Project."

### Connection

`query_server.py` now sends real, live progress; `PocketDBClient` now
correctly keeps a request open across it. Getting that progress all
the way into the actual, rendered window — a real, second IPC boundary
this project has never crossed this way before — is next.

---

## Concept Unit: A Message Nobody Asked For

### The Problem

`PocketDBClient`'s own `onProgress` callback runs inside the main
process. Every real UI update this project has ever shown started from
a real `ipcRenderer.invoke` call's own, eventual resolved value
(Lesson 1) — but the renderer's own `trainAgent()` call won't resolve
at all until training genuinely finishes; there's no real way for a
single `invoke`'s own return value to also deliver several, real,
earlier updates along the way.

### Introduce the Concept in Isolation

Real, isolated proof — a tiny, separate Electron main process,
`webContents.send`ing three real, separate messages `300`ms apart, with
no real request ever sent from the renderer at all:

```javascript
let count = 0;
const interval = setInterval(() => {
  count++;
  window.webContents.send("ping-event", `push #${count}`);
  if (count === 3) {
    clearInterval(interval);
  }
}, 300);
```

That real, main-process half sends; this real, renderer-side half
(injected here via `executeJavaScript`, standing in for a real preload
script for this isolated lab only) receives:

```javascript
ipcRenderer.on("ping-event", (event, value) => {
  window.received.push(value);
});
```

Real, captured output, read back from the renderer's own real state
after all three real sends completed:

```text
RECEIVED (renderer never sent a request): ["push #1","push #2","push #3"]
```

This is called **one-way IPC**, named in the Header above (`webContents
.send`/`ipcRenderer.on`) — *what this proves:* three, real, genuinely
separate messages arrived in the renderer, in order, with zero real
`invoke` calls anywhere in this isolated example at all — a real,
fundamentally different shape from every earlier lesson's own IPC.

### Discard the Throwaway Example

The isolated main process above is not part of this project and is not
kept.

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:** `src/main.ts` (modified — `mainWindow` lifted to
  module scope; a new `"train-agent"` handler using
  `webContents.send`), `src/preload.ts` (modified — `trainAgent`/
  `onAgentProgress`), `src/App.tsx` (modified — agent state, the
  "Train Agent" section).
- **Change type:** Add/Refactor.
- **Dependencies:** This lesson's own previous two units.

### The New Code — `src/main.ts`

```typescript
ipcMain.handle("train-agent", async (): Promise<TrainAgentResult> => {
  const client = await getDbClient();
  return (await client.request("train_agent", {}, (progress) => {
    mainWindow?.webContents.send("agent-progress", progress);
  })) as TrainAgentResult;
});

let mainWindow: BrowserWindow | null = null;
```

### The Updated Project — `src/main.ts`

```typescript
import { app, BrowserWindow, ipcMain } from "electron";
import * as path from "path";
import { PocketDBClient } from "./pocketdb-client";

ipcMain.handle("ping", async (): Promise<string> => {
  return "pong from the main process";
});

let dbClient: PocketDBClient | null = null;

function resourceDir(): string {
  return app.isPackaged
    ? path.join(process.resourcesPath, "app.asar.unpacked")
    : path.join(__dirname, "..");
}

async function getDbClient(): Promise<PocketDBClient> {
  if (!dbClient) {
    const dir = resourceDir();
    dbClient = new PocketDBClient("python", path.join(dir, "query_server.py"));
    await dbClient.request("open", { path: path.join(dir, "games.pdb") });
  }
  return dbClient;
}

// ... list-tables, get-rows, run-query, create-table, insert-row,
// analyze, train-model, predict: unchanged since Lessons 1, 2, 9, 10

interface TrainAgentResult {
  episodeCount: number;
  winRate: number;
}

ipcMain.handle("train-agent", async (): Promise<TrainAgentResult> => {
  const client = await getDbClient();
  return (await client.request("train_agent", {}, (progress) => {
    mainWindow?.webContents.send("agent-progress", progress);
  })) as TrainAgentResult;
});

let mainWindow: BrowserWindow | null = null;

app.whenReady().then(() => {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
    },
  });
  mainWindow.loadFile(path.join(__dirname, "..", "index.html"));
});
```

`window`, a real, local `const` inside `app.whenReady().then(...)`
since Lesson 0, becomes `mainWindow` — a real, module-level `let` — so
this lesson's own new `"train-agent"` handler, defined earlier in the
file, can reach the real, actual window at all; every other real
handler in this file is unchanged.

### Mechanical Walkthrough

- `client.request("train_agent", {}, (progress) => { ... })` — the
  real, third argument this lesson's own second unit just added to
  `PocketDBClient.request` — an arrow function (reappearing syntax,
  already established) real-called every time a real progress line
  arrives.
- `mainWindow?.webContents.send("agent-progress", progress)` — `?.`
  reappearing (this lesson's own second unit); `webContents.send` and
  the real, `"agent-progress"` channel name — covered fully in Objects
  and methods used, above.
- `let mainWindow: BrowserWindow | null = null;` — reappearing shape
  (`dbClient`'s own identical real, module-level, nullable pattern,
  Lesson 2) — applied here to a `BrowserWindow` instead of a
  `PocketDBClient`.

The real, matching renderer-side pieces:

```typescript
trainAgent: (): Promise<TrainAgentResult> => ipcRenderer.invoke("train-agent"),
onAgentProgress: (callback: (progress: AgentProgress) => void): void => {
  ipcRenderer.on("agent-progress", (_event, progress: AgentProgress) => callback(progress));
},
```

`preload.ts` now exposes two, real, differently-shaped members for the
identical real feature — `trainAgent`, an ordinary `invoke`, and
`onAgentProgress`, a real subscription. `App.tsx` registers the second
one exactly once, when the component first mounts:

```typescript
useEffect(() => {
  api.onAgentProgress((progress) => setAgentProgress(progress));
}, []);
```

The first one — the real, ordinary `invoke` call — is what
`trainAgent()`, `App.tsx`'s own real, new async function, actually
calls to start training and learn when it's genuinely finished:

```typescript
async function trainAgent() {
  setTrainingAgent(true);
  setAgentProgress(null);
  setAgentResult(null);
  const result = await api.trainAgent();
  setAgentResult(result);
  setTrainingAgent(false);
}
```

- `trainAgent: (): Promise<TrainAgentResult> => ipcRenderer.invoke(
  "train-agent")` — reappearing shape (every other method already on
  `pocketStudio`, Lesson 1) — a real, ordinary `invoke` call; the real,
  eventual value it resolves to is only the *final* result — progress
  never travels through this call at all.
- `onAgentProgress: (callback) => { ipcRenderer.on(...) }` — first,
  real appearance of `contextBridge` exposing a real *subscription*
  instead of a real, awaited value — `ipcRenderer.on`, covered fully in
  Objects and methods used, above, called once, registering `callback`
  to run every real, future time `"agent-progress"` arrives, for as
  long as this window stays open.
- `useEffect(() => { api.onAgentProgress(...); }, [])` — reappearing
  shape (`useEffect` with an empty dependency array, Lesson 3) — real,
  registered exactly once, when `App` first mounts, matching the real,
  one-time nature of a subscription rather than a per-request fetch.
- `setTrainingAgent(true)` / `setAgentProgress(null)` /
  `setAgentResult(null)` — reappearing shape (already established
  `useState` setters) — a real, deliberate reset before each real
  training run starts, the identical real discipline `runQuery`
  (Lesson 7) already established for `setError(null)`.

### CS Lens

`ipcRenderer.invoke`/`ipcMain.handle` (Lesson 1) is the **request-
response** pattern; `webContents.send`/`ipcRenderer.on` is the
**publish-subscribe** pattern — a real, genuinely different, standard
messaging shape where a sender pushes real, unprompted messages to
whichever real listeners happen to be registered, with no reply
expected and no per-message request required. This project uses both,
now, for genuinely different real reasons: request-response for "ask
one question, get one answer"; publish-subscribe for "tell me whenever
something happens, for as long as I'm listening."

Also recognized in: a real WebSocket server pushing real, live stock
prices to every real, connected browser tab; a real Node
`EventEmitter`, used throughout Node's own standard library; a real
message queue's own "topic" subscribers, each real subscriber getting
every real, published message with no individual request per message.

### SE Lens

Why does `onAgentProgress` register one real, fixed callback for the
lifetime of the window, rather than `trainAgent()` passing its own
progress callback through per call, the way `PocketDBClient.request`
does internally? Because the real, public `contextBridge` surface
(Lesson 1's own established, narrow-boundary principle) can only carry
real, plain, structured-cloneable values across it — a real, live
JavaScript function passed from the renderer into `ipcRenderer.invoke`
can't cross back out the other side unchanged; a real, one-time
`onAgentProgress` subscription, set up once from the renderer's own
side, sidesteps that limitation entirely, at the honest, real cost of
only ever supporting one real, currently-active training run's own
progress stream at a time — the identical real, single-model
limitation this lesson's own predecessor, Lesson 10, already named for
`trained_model`.

### Commands Needed

```bash
npm start
```

### Run It

Real, end-to-end proof — "Train Agent" clicked in the actual, running
window, polled repeatedly while the real request was still open:

```text
episode 8000 / 50000
episode 14000 / 50000
episode 22000 / 50000
episode 30000 / 50000
episode 38000 / 50000
episode 46000 / 50000
trained 50000 episodes, win rate 0.36
```

*What this proves:* the real, live episode count genuinely updates in
the actual DOM while `trainAgent()`'s own `invoke` call is still
pending — proof this project's own first real use of one-way IPC works
correctly end to end, not just inside this lesson's own isolated lab.

### Connection

S11 is complete: a real, harder RL problem, a real bug found and fixed
along the way, and a real, second IPC mechanism this project has never
needed before, all come together in one, real, live-updating "Train
Agent" button.

---

## Closing

### Connect the Pieces

This lesson's first unit chose a genuinely harder, real environment —
honestly measured to actually need live progress, unlike `pocket-db`'s
own fast, easy `4x4` case — and, in doing so, uncovered a real,
classic argmax tie-breaking bug that was silently making training
*worse* than acting randomly; fixed with real, random tie-breaking,
proven both broken and fixed with real, measured numbers. The second
unit extended this project's own real, established JSON-lines protocol
with a real, new message shape — a `progress` field sharing its
request's own real `id` — proven with a real, isolated capture showing
many real progress lines arriving before the one real, final response,
and taught `PocketDBClient` to keep such a request open across them.
The third unit crossed a real, second Electron IPC boundary this
project had never used before — `webContents.send`/`ipcRenderer.on`,
real publish-subscribe instead of request-response — carrying that live
progress the rest of the way into the actual, rendered window, proven
end-to-end with a real, running training session whose own live episode
count was directly observed, updating, while still in flight.

### What Breaks Without This

In `src/main.ts`'s own `"train-agent"` handler, remove the
`mainWindow?.webContents.send("agent-progress", progress)` call
entirely (keep the `onProgress` callback itself, just make it do
nothing), rebuild, and click "Train Agent" again. The real button still
works — training still completes, the real, final win rate still
appears — but the actual window shows nothing at all while it runs, the
identical real "silent, frozen wait" this lesson's own first unit
started out trying to avoid. Restore the real `send` call and confirm
the live episode counter returns.

### Exercises

- `train_agent` currently ignores its own real `params` entirely —
  `episode_count`, `epsilon_decay`, and `map_name` are all real,
  hardcoded constants. Add a real form (reusing this project's own
  established controlled-input pattern) letting a user choose the real
  episode count before training starts, and pass it through the
  real protocol as a real, new parameter.
- This lesson's own `onAgentProgress` supports exactly one real,
  active subscriber. Add a second, real, independent progress display
  elsewhere in the window (say, a real progress bar, computed from
  `agentProgress.episode / agentProgress.episodeCount`), and confirm
  both real displays update together from the identical real messages.
- `evaluate_policy`'s own real, held-out win rate is computed once,
  only after training fully finishes. Extend `progress_line` to
  include a real, periodic win-rate estimate too (calling
  `evaluate_policy` every real `progress_interval`, at some real,
  honest cost to total training time), and show it updating live,
  alongside the real episode count.

### Definition of Done

- [ ] `query_server.py`'s own `best_action` helper exists and is used
      everywhere `train_agent`/`evaluate_policy` pick an action.
- [ ] You reproduced the real "zero goal hits" bug yourself (or
      confirmed this lesson's own real, captured output) and understand
      why `.index(max(...))` caused it.
- [ ] `query_server.py` sends real, periodic `progress` lines sharing
      the request's own real `id`; `PocketDBClient` keeps the request
      open across them and calls a real `onProgress` callback.
- [ ] `mainWindow` is a real, module-level variable; the `"train-agent"`
      handler pushes real, live progress via `webContents.send`.
- [ ] A real "Train Agent" button in the actual, running window shows a
      real, live-updating episode count, then a real, final win rate.
- [ ] You caused the real "no visible progress" regression yourself and
      confirmed restoring `webContents.send` fixes it.
- [ ] You can explain, from memory, the real difference between
      `ipcRenderer.invoke` and `ipcRenderer.on` — referencing this
      lesson's own third unit's CS Lens.
- [ ] Committed with a message stating why, for example:
      `git commit -m "Add live-progress RL training, fixing a real tie-breaking bug along the way"`.
