# SE Masterclass — LAB-13 — State Machine

**Language: JavaScript (Node.js)** — same project family as LAB-09–12; this lab is a new, standalone mini-project.

**Prerequisites:** LAB-09–12. This lab reuses the dispatch-table pattern (LAB-09) and boundary validation (LAB-09, LAB-10), applied to a new problem: modeling something that changes over TIME instead of computing one answer from one input.

**What this lab adds:**
- What a finite state machine (FSM) is: a fixed set of states, and rules for which transitions between them are ALLOWED
- Why FSMs eliminate impossible states — states your program should never be able to reach
- A transition table: the same dispatch-table idea, keyed by `(state, event)` instead of just an operator
- `onEnter`/`onExit` hooks — running code exactly when a transition happens, not before or after
- A second, more realistic example: a network connection's lifecycle

**Time:** 70–90 minutes

---

> **Quick Check — try to answer before reading:**
>
> 1. A traffic light: `RED → GREEN → YELLOW → RED → ...`. Should `RED` be allowed to go directly to `YELLOW`? Why is answering "no" useful?
> 2. If your code tracks state with two separate booleans, `isLoading` and `isError`, what happens if BOTH become `true` at once? Is that a real, meaningful state?
> 3. A vending machine event, "insert coin," is valid while `IDLE` but should do something DIFFERENT (or be rejected) while `DISPENSING`. What decides the behavior — the event alone, or something else?
>
> *(Answers at the end of this lab)*

---

## What You Will Build

When this lab is complete, running `node main.js` prints:

```
=== Traffic Light ===
state: RED
  tick -> GREEN
state: GREEN
  tick -> YELLOW
state: YELLOW
  tick -> RED
state: RED

=== Invalid Transition ===
"pedestrianButton" from RED threw: no transition for event "pedestrianButton" in state "RED"

=== Vending Machine ===
state: IDLE
  insertCoin -> HAS_COIN (balance: 100)
  insertCoin -> HAS_COIN (balance: 200)
  select -> DISPENSING (dispensing: soda)
  [enter DISPENSING] motor running...
  [exit DISPENSING] motor stopped
  dispenseComplete -> IDLE (balance: 0)

=== Vending Machine: Rejected Events ===
"select" from IDLE threw: no transition for event "select" in state "IDLE"
"insertCoin" from DISPENSING threw: no transition for event "insertCoin" in state "DISPENSING"

=== Connection Lifecycle ===
state: DISCONNECTED
  connect -> CONNECTING
  [enter CONNECTING] opening socket...
  socketOpen -> CONNECTED
  [enter CONNECTED] heartbeat started
  [exit CONNECTED] heartbeat stopped
  disconnect -> DISCONNECTED
  [enter DISCONNECTED] cleanup complete

=== Connection: Reconnect Attempt Limit ===
attempt 1: CONNECTING
attempt 2: CONNECTING
attempt 3: CONNECTING
attempt 4: FAILED (max retries reached)
```

---

### Concept: What a Finite State Machine Is

**What it is:** A **finite state machine** models something that can be in exactly ONE of a fixed, KNOWN set of **states** at any time, and defines exactly which **events** can move it from one state to another (a **transition**). Crucially, an FSM makes ILLEGAL transitions IMPOSSIBLE to represent, not just "something you remember not to do."

**The problem before:** Tracking "what's happening" with loose, independent variables lets you represent states that make no sense:

```js
let isLoading = false
let isError = false
let isSuccess = false
// nothing stops this:
isLoading = true
isError = true      // loading AND error, simultaneously? what does the UI even show?
```

Three independent booleans have `2^3 = 8` possible combinations, but the REAL system only has maybe 4 meaningful states (idle, loading, success, error) — the other 4 combinations are bugs waiting to happen, reachable purely by accident.

**The solution:** Name the states explicitly, and define ONLY the transitions that are meaningful:

```js
const states = ['IDLE', 'LOADING', 'SUCCESS', 'ERROR']   // exactly these four — nothing else is representable
```

Now "loading AND error at once" isn't a bug you have to remember to avoid — it's not even expressible, because there is exactly one current state, always.

**Canonical example (General Explanation):**

Think of a traffic light. It is never "kind of red and kind of green." At any instant, it is in EXACTLY one of a small number of named states, and the rules for what comes next are fixed and few: green always goes to yellow, yellow always goes to red, red always goes to green. You cannot skip straight from red to yellow — that transition simply doesn't exist in the rules.

**Project Application (The "Why" here):**

LAB-09's calculator implicitly had states too (reading a number, expecting an operator) — but never named them; LAB-10's lexer's inner "consuming digits" loop is a tiny two-state machine (in-a-number / not-in-a-number) that never got a name either. This lab makes the pattern explicit, so you can recognize it everywhere from here on.

**Watch for:** The number of states should stay SMALL and MEANINGFUL. If you find yourself needing `LOADING_WITH_ERROR_PENDING_RETRY`, that's usually a sign you need a second, independent piece of data (like a retry COUNT) alongside the state, not a combinatorial explosion of new states for every combination.

---

## Step 1 — A Transition Table

```js
// traffic-light.js

const trafficLightTransitions = {
  RED:    { tick: 'GREEN' },      // ← add: from RED, only 'tick' is valid, and it goes to GREEN
  GREEN:  { tick: 'YELLOW' },     // ← add
  YELLOW: { tick: 'RED' },        // ← add
}

function createMachine(transitions, initialState) {
  let state = initialState

  return {
    getState() {
      return state
    },
    send(event) {                                     // ← add: attempt a transition
      const stateTransitions = transitions[state]
      const nextState = stateTransitions[event]
      if (!nextState) {                                  // ← add: this (state, event) pair isn't in the table
        throw new Error(`no transition for event "${event}" in state "${state}"`)
      }
      state = nextState
      return state
    },
  }
}

module.exports = { createMachine, trafficLightTransitions }
```

```js
// main.js
const { createMachine, trafficLightTransitions } = require('./traffic-light')

console.log('=== Traffic Light ===')
const light = createMachine(trafficLightTransitions, 'RED')

console.log(`state: ${light.getState()}`)
console.log(`  tick -> ${light.send('tick')}`)
console.log(`state: ${light.getState()}`)
console.log(`  tick -> ${light.send('tick')}`)
console.log(`state: ${light.getState()}`)
console.log(`  tick -> ${light.send('tick')}`)
console.log(`state: ${light.getState()}`)
```

### SAVE AND TRY

```bash
node main.js
```

**Expected:**
```
=== Traffic Light ===
state: RED
  tick -> GREEN
state: GREEN
  tick -> YELLOW
state: YELLOW
  tick -> RED
state: RED
```

**Confirm the dispatch-table shape:** `transitions[state][event]` is a TWO-LEVEL lookup — first by current state, then by the event — this is LAB-09's dispatch table generalized to two keys instead of one. Both lookups are O(1) (LAB-08), regardless of how many states or events the machine has.

**Change something:** Call `light.send('tick')` a fourth time. Confirm you're back at `GREEN` — the light cycles forever, exactly as a real traffic light does.

---

### Concept: Illegal Transitions Should Fail Loudly

**What it is:** If an event has no entry in the transition table for the CURRENT state, that combination is not just "unhandled" — it's actively INVALID, and the machine should say so clearly, not silently ignore the event or crash with a confusing unrelated error.

**The problem before:** A traffic light physically CANNOT skip from red directly to yellow — there's no wire for that. In software, without an explicit check, calling `send('pedestrianButton')` while in `RED` (if `pedestrianButton` isn't a real event this light supports) might silently do nothing, leaving a bug invisible until much later.

**The solution:** `transitions[state][event]` being `undefined` IS the detection mechanism — Step 1's `if (!nextState) throw ...` already handles this correctly, for free, because looking up a key that doesn't exist in a plain JS object returns `undefined` rather than crashing on its own.

**Project Application (The "Why" here):** This is the SAME boundary-validation instinct from LAB-09 (reject bad calculator input clearly) and LAB-10 (reject unrecognized characters clearly), applied to EVENTS instead of characters or expressions.

---

## Step 2 — Confirm Rejected Transitions

Add to `main.js`:

```js
console.log('\n=== Invalid Transition ===')
try {
  light.send('pedestrianButton')
} catch (err) {
  console.log(`"pedestrianButton" from RED threw: ${err.message}`)
}
```

### SAVE AND TRY

```bash
node main.js
```

**Expected:**
```
=== Invalid Transition ===
"pedestrianButton" from RED threw: no transition for event "pedestrianButton" in state "RED"
```

**Note the exact state at the time of the error:** After the three `tick` calls in Step 1, the light is back at `RED` — the error message correctly reports `"RED"` as the CURRENT state when the invalid event arrived, not `"YELLOW"` or some stale value, because `state` is read fresh inside `send()` every time it's called.

---

### Concept: onEnter / onExit Hooks

**What it is:** Beyond just recording WHICH state you're in, a state machine often needs to run code exactly WHEN a transition happens — starting a motor when entering `DISPENSING`, stopping it when leaving. These are called **entry actions** and **exit actions**.

**The problem before:** Without hooks, you'd have to remember to manually call "start the motor" right after every `send()` call that COULD lead to `DISPENSING` — easy to forget in one place, causing the motor to never start, or to double-start if called from two different code paths.

**The solution:** Attach the action to the STATE itself, inside the machine, so it runs automatically and exactly once, no matter which event or code path caused the transition.

**Canonical example (General Explanation):**

Think of a hotel room's automatic lights — they turn on the MOMENT the door opens (entering "occupied") and off the moment it closes (exiting "occupied"), regardless of who opened the door or why. The action is tied to the STATE TRANSITION itself, not to any particular cause of it.

```js
const states = {
  DISPENSING: {
    onEnter: () => console.log('  [enter DISPENSING] motor running...'),
    onExit: () => console.log('  [exit DISPENSING] motor stopped'),
  },
}
```

**Where you will see this:** React's `useEffect` cleanup function is exactly an exit hook. Every animation library's "on transition end" callback is this pattern. LAB-51 (WebSocket Server) will use entry/exit hooks on connection states to start and stop heartbeat timers — exactly foreshadowed by this lab's Connection Lifecycle example below.

---

## Step 3 — A Vending Machine With Hooks and Data

```js
// vending-machine.js

function createVendingMachine() {
  let state = 'IDLE'
  let balance = 0
  let selectedItem = null

  const transitions = {
    IDLE: {
      insertCoin: 'HAS_COIN',
    },
    HAS_COIN: {
      insertCoin: 'HAS_COIN',       // stays in HAS_COIN — inserting more coins is always valid here
      select: 'DISPENSING',
    },
    DISPENSING: {
      dispenseComplete: 'IDLE',
    },
  }

  const hooks = {
    DISPENSING: {
      onEnter: () => console.log('  [enter DISPENSING] motor running...'),
      onExit: () => console.log('  [exit DISPENSING] motor stopped'),
    },
  }

  function send(event, payload) {
    const stateTransitions = transitions[state]
    const nextState = stateTransitions && stateTransitions[event]
    if (!nextState) {
      throw new Error(`no transition for event "${event}" in state "${state}"`)
    }

    if (event === 'insertCoin') balance += payload            // ← add: events can carry data
    if (event === 'select') selectedItem = payload
    if (event === 'dispenseComplete') { balance = 0; selectedItem = null }

    if (hooks[state] && hooks[state].onExit) hooks[state].onExit()    // ← add: exit hook for the OLD state
    state = nextState
    if (hooks[state] && hooks[state].onEnter) hooks[state].onEnter()  // ← add: enter hook for the NEW state

    return { state, balance, selectedItem }
  }

  return { send, getState: () => state, getBalance: () => balance }
}

module.exports = { createVendingMachine }
```

Add to `main.js`:

```js
const { createVendingMachine } = require('./vending-machine')

console.log('\n=== Vending Machine ===')
const machine = createVendingMachine()
console.log(`state: ${machine.getState()}`)

let result = machine.send('insertCoin', 100)
console.log(`  insertCoin -> ${result.state} (balance: ${result.balance})`)

result = machine.send('insertCoin', 100)
console.log(`  insertCoin -> ${result.state} (balance: ${result.balance})`)

result = machine.send('select', 'soda')
console.log(`  select -> ${result.state} (dispensing: ${result.selectedItem})`)

result = machine.send('dispenseComplete')
console.log(`  dispenseComplete -> ${result.state} (balance: ${result.balance})`)
```

### SAVE AND TRY

```bash
node main.js
```

**Expected:**
```
=== Vending Machine ===
state: IDLE
  insertCoin -> HAS_COIN (balance: 100)
  insertCoin -> HAS_COIN (balance: 200)
  select -> DISPENSING (dispensing: soda)
  [enter DISPENSING] motor running...
  [exit DISPENSING] motor stopped
  dispenseComplete -> IDLE (balance: 0)
```

**Trace the hook timing:** `select` moves `HAS_COIN → DISPENSING`. The `onExit` hook checked is for the OLD state (`HAS_COIN`, which has none), then `state` updates, then the `onEnter` hook for the NEW state (`DISPENSING`) fires — hence `[enter DISPENSING]` prints. The NEXT transition, `dispenseComplete`, moves `DISPENSING → IDLE` — this time `DISPENSING`'s `onExit` fires FIRST (`[exit DISPENSING]`), then the transition completes.

**Change something:** Add an `onEnter` hook for `IDLE` that prints `'  [enter IDLE] ready for next customer'`. Confirm it fires after `dispenseComplete`.

---

## 🎯 Challenge: Reject Invalid Events With Clear Messages

**You know:** The transition table's `undefined` lookup, from Step 2, already causes a clear rejection.

**Task:** Confirm `select` is correctly rejected from `IDLE` (you can't select an item with no money in), and `insertCoin` is correctly rejected from `DISPENSING` (the machine shouldn't accept coins mid-dispense).

<details>
<summary>▶ Show Solution</summary>

No new code is needed — this is confirming that the transition table you already built correctly EXCLUDES these two combinations, since `IDLE` only lists `insertCoin`, and `DISPENSING` only lists `dispenseComplete`:

```js
console.log('\n=== Vending Machine: Rejected Events ===')
const freshMachine = createVendingMachine()
try {
  freshMachine.send('select', 'soda')
} catch (err) {
  console.log(`"select" from IDLE threw: ${err.message}`)
}

freshMachine.send('insertCoin', 100)
freshMachine.send('select', 'chips')
try {
  freshMachine.send('insertCoin', 100)
} catch (err) {
  console.log(`"insertCoin" from DISPENSING threw: ${err.message}`)
}
```

**Key insight:** You never had to write "if state is IDLE, reject select" as a special-case `if` statement anywhere — the ABSENCE of an entry in `transitions.IDLE` (no `select` key) is itself the rejection. This is the real payoff of a transition table over scattered `if` checks: what's NOT listed is automatically forbidden, so there's no way to forget a guard clause for an invalid combination — there's nothing to forget, because there's no permissive default to guard against.

</details>

### SAVE AND TRY

**Expected:**
```
=== Vending Machine: Rejected Events ===
"select" from IDLE threw: no transition for event "select" in state "IDLE"
"insertCoin" from DISPENSING threw: no transition for event "insertCoin" in state "DISPENSING"
```

---

## Step 4 — A More Realistic Example: Connection Lifecycle

```js
// connection.js

function createConnection() {
  let state = 'DISCONNECTED'
  let retryCount = 0

  const transitions = {
    DISCONNECTED: { connect: 'CONNECTING' },
    CONNECTING: { socketOpen: 'CONNECTED', socketError: 'RETRYING' },
    CONNECTED: { disconnect: 'DISCONNECTED', socketError: 'RETRYING' },
    RETRYING: { retry: 'CONNECTING', giveUp: 'FAILED' },
    FAILED: {},                          // terminal state — no events accepted, by design
  }

  const hooks = {
    CONNECTING: { onEnter: () => console.log('  [enter CONNECTING] opening socket...') },
    CONNECTED: {
      onEnter: () => console.log('  [enter CONNECTED] heartbeat started'),
      onExit: () => console.log('  [exit CONNECTED] heartbeat stopped'),
    },
    DISCONNECTED: { onEnter: () => console.log('  [enter DISCONNECTED] cleanup complete') },
  }

  function send(event) {
    const stateTransitions = transitions[state]
    const nextState = stateTransitions[event]
    if (!nextState) throw new Error(`no transition for event "${event}" in state "${state}"`)

    if (event === 'connect' || event === 'retry') retryCount++     // track attempts across CONNECTING entries

    if (hooks[state] && hooks[state].onExit) hooks[state].onExit()
    state = nextState
    if (hooks[state] && hooks[state].onEnter) hooks[state].onEnter()

    return state
  }

  return { send, getState: () => state, getRetryCount: () => retryCount }
}

module.exports = { createConnection }
```

Add to `main.js`:

```js
const { createConnection } = require('./connection')

console.log('\n=== Connection Lifecycle ===')
const conn = createConnection()
console.log(`state: ${conn.getState()}`)
console.log(`  connect -> ${conn.send('connect')}`)
console.log(`  socketOpen -> ${conn.send('socketOpen')}`)
console.log(`  disconnect -> ${conn.send('disconnect')}`)
```

### SAVE AND TRY

```bash
node main.js
```

**Expected:**
```
=== Connection Lifecycle ===
state: DISCONNECTED
  connect -> CONNECTING
  [enter CONNECTING] opening socket...
  socketOpen -> CONNECTED
  [enter CONNECTED] heartbeat started
  [exit CONNECTED] heartbeat stopped
  disconnect -> DISCONNECTED
  [enter DISCONNECTED] cleanup complete
```

**Notice `FAILED` has an empty transitions object (`{}`):** This is a deliberate **terminal state** — once reached, NO event can move the machine anywhere else, by design, because `transitions.FAILED` has no keys at all, so every lookup fails and every `send()` call throws. A terminal state doesn't need special-case code; it falls naturally out of an empty entry in the same table.

---

## Step 5 — Retry Limit Using External State

```js
console.log('\n=== Connection: Reconnect Attempt Limit ===')
const flaky = createConnection()
const MAX_RETRIES = 3

flaky.send('connect')
for (let attempt = 1; attempt <= MAX_RETRIES + 1; attempt++) {
  if (flaky.getState() === 'FAILED') break

  try {
    flaky.send('socketError')       // simulate a failed connection attempt
  } catch (err) {
    break
  }

  if (flaky.getRetryCount() > MAX_RETRIES) {
    flaky.send('giveUp')
    console.log(`attempt ${attempt}: FAILED (max retries reached)`)
  } else {
    flaky.send('retry')
    console.log(`attempt ${attempt}: ${flaky.getState()}`)
  }
}
```

### SAVE AND TRY

```bash
node main.js
```

**Expected:**
```
=== Connection: Reconnect Attempt Limit ===
attempt 1: CONNECTING
attempt 2: CONNECTING
attempt 3: CONNECTING
attempt 4: FAILED (max retries reached)
```

**Why `retryCount` lives OUTSIDE the transition table:** The FSM itself only knows "which state am I in" — it has no built-in concept of "how many times have I been through this state." Counting attempts requires ordinary variable state ALONGSIDE the FSM, exactly like the Concept box for variables in LAB-12 needed an environment alongside the AST. States answer "what mode am I in"; plain data answers "how many, how much, which one" — a real system almost always needs both together, and knowing which kind of question you're answering tells you whether you need a new STATE or just a new VARIABLE.

---

## Mental Model: Where FSMs Show Up

| System | States |
|---|---|
| HTTP request in a UI | `idle → loading → success` or `idle → loading → error` |
| A game character | `idle → walking → jumping → falling → idle` |
| A CI/CD pipeline (LAB-50s territory) | `queued → running → passed` or `queued → running → failed` |
| TCP connection | `closed → syn-sent → established → closing → closed` |
| A traffic light | `red → green → yellow → red` |
| Git merge | `clean → merging → conflicted → clean` or `clean → merging → clean` |

**Where you will see this again:**
- LAB-51 (WebSocket Server) — the connection lifecycle from Step 4, for real
- LAB-96 (Shell) — a shell's REPL loop is a state machine (reading input, executing, waiting)
- LAB-13's transition table pattern reappears any time you see "reducer" in a frontend framework — a reducer IS a transition function, `(state, event) => nextState`

---

## Final Check

| Feature | How to verify |
|---|---|
| Traffic light cycles RED → GREEN → YELLOW → RED correctly | Step 1 |
| An event with no matching transition throws a clear error | Step 2 |
| Vending machine's `onEnter`/`onExit` hooks fire in the correct order | Step 3 |
| Invalid vending machine events (`select` from `IDLE`, `insertCoin` from `DISPENSING`) are rejected | Challenge |
| Connection lifecycle's `FAILED` state accepts no further events | Step 4 |
| Retry counting correctly distinguishes "state" from "plain data alongside state" | Step 5 |
| You can explain why 3 independent booleans are worse than 1 named state, out loud | Concept box, Quick Check #2 |

---

## Quick Check Answers

**1. Should `RED` go directly to `YELLOW`? Why is "no" useful?**

No — a real traffic light's rules never allow that transition, and encoding that as an ABSENT entry in the transition table (rather than a runtime `if` check scattered through the code) means the invalid transition is structurally impossible to reach by accident, not just discouraged. This lab's `RED: { tick: 'GREEN' }` entry has no `otherEvent` key at all — there's no key to accidentally forget to guard against.

**2. Two booleans, `isLoading` and `isError`, both `true` at once — meaningful state?**

No — it's an impossible/meaningless combination that boolean flags don't prevent you from reaching, exactly the problem this lab's opening Concept box described. A named-state FSM (`IDLE | LOADING | SUCCESS | ERROR`) makes "loading and error simultaneously" simply unrepresentable, because there is exactly one current state variable, holding exactly one value, always.

**3. "Insert coin" while `IDLE` vs while `DISPENSING` — what decides the behavior?**

The COMBINATION of the current state AND the event — not the event alone. This lab's `transitions[state][event]` two-level lookup is exactly this: `transitions.IDLE.insertCoin` exists and moves to `HAS_COIN`, while `transitions.DISPENSING.insertCoin` does not exist at all, correctly rejecting the same event when it arrives in a different state. This is why a plain `switch (event)` (which only looks at the event) is insufficient for a real state machine — the SAME event can mean "accept" in one state and "reject" in another, and only checking both together captures that.

---

*Next: [LAB-14 — Dependency Graph](LAB-14-dependency-graph.md) — JavaScript, same module*
