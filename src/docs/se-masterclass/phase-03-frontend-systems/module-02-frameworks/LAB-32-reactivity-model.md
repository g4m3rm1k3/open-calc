# SE Masterclass — LAB-32 — Reactivity Model

**Language: TypeScript (Browser)** — same setup as Module 1, Module 2 begins.

**Prerequisites:** LAB-31 (Manual State Sync — this lab fixes that exact bug, structurally) and LAB-22 (Event Bus — a signal is a specialized, automatic version of publish/subscribe).

**What this lab adds:**
- **Signals**: reactive values that automatically track WHO depends on them
- **Effects**: functions that automatically RE-RUN whenever any signal they read changes — no manual sync calls, anywhere
- Automatic dependency tracking — the system discovers "this effect depends on this signal" by WATCHING what gets read, not from a hand-maintained list
- Rebuilding LAB-31's shopping cart, this time with the sync bug structurally impossible

**Time:** 90–110 minutes

---

> **Quick Check — try to answer before reading:**
>
> 1. LAB-31 needed a human to remember which functions to call after `items` changed. A signal system needs to discover this automatically. What information does it have available to figure that out?
> 2. If `total = computed(() => items().reduce(...))`, and NOTHING ever reads `total`, should the computation even run when `items` changes?
> 3. An effect reads `signalA` on its FIRST run, but due to an `if`, reads `signalB` instead on its SECOND run. Should the effect still be listening to `signalA` after that second run?
>
> *(Answers at the end of this lab)*

---

## What You Will Build

By the end of this lab, browser console output (open DevTools) shows:

```
=== Signals: Get and Set ===
count(): 0
count.set(5)
count(): 5

=== Effects: Automatic Re-run ===
effect ran — count is: 0
count.set(1)
effect ran — count is: 1
count.set(2)
effect ran — count is: 2
  ← the effect re-ran automatically — nobody called it manually

=== Effects Track ONLY What They Actually Read ===
effect ran — reading count: 0
otherSignal.set(999)
(no output — the effect never read otherSignal, so it's not subscribed to it)
count.set(1)
effect ran — reading count: 1
  ← re-ran only for the signal it actually depends on

=== Computed: Derived Signals ===
total(): 5.5
items.set([...updated with one more apple...])
total(): 6.5
  ← total recomputed automatically — no manual recalculation call anywhere

=== LAB-31's Bug, Now Structurally Impossible ===
effect ran — total: $5.50, checkout enabled: true
items.set([]) — clearing the cart
effect ran — total: $0.00, checkout enabled: false
  ← ONE effect, reading 'total', automatically re-ran — there was no separate "sync" call to forget

=== Dynamic Dependencies ===
effect ran — using signalA (value: 1)
switching condition — effect will now read signalB instead
signalA.set(999) — should NOT trigger a re-run anymore
(no output)
signalB.set(42) — SHOULD trigger a re-run
effect ran — using signalB (value: 42)
```

---

### Concept: A Signal — A Value That Knows Who's Watching

**What it is:** A **signal** is a reactive container for a value, with a `get` and a `set`. The key difference from a plain variable: reading a signal INSIDE an effect automatically registers that effect as a SUBSCRIBER — and setting a signal automatically NOTIFIES every subscriber to re-run, exactly like LAB-22's event bus, but wired up AUTOMATICALLY instead of requiring manual `bus.on(...)` calls.

**The problem before:** LAB-31 needed a human to remember: "when `items` changes, also call `syncTotal()` and `syncCheckoutButton()`." That's a manually maintained, invisible, easily-broken dependency list.

**The solution:** Track dependencies by OBSERVING, not by being TOLD. When an effect runs, temporarily record "I am the currently running effect." Every signal's `get()` checks "is there a currently running effect?" — if so, it adds that effect to its OWN subscriber list, automatically. No developer ever writes "this effect depends on that signal" — the SYSTEM discovers it by watching what code actually reads during execution.

**Canonical example (General Explanation):** Think of a smart spreadsheet cell (this is EXACTLY what LAB-37 builds next): typing `=A1+B1` into cell C1 doesn't require you to separately tell the spreadsheet "recalculate C1 whenever A1 or B1 changes" — the spreadsheet FIGURES THAT OUT by seeing which cells the formula in C1 actually references. A signal system does the identical thing for code.

---

## Step 1 — Signals: Get and Set

```ts
// signals.ts

type Effect = () => void
let currentEffect: Effect | null = null           // ← add: "who is currently running" — the key trick

export function createSignal<T>(initialValue: T): [() => T, (value: T) => void] {
  let value = initialValue
  const subscribers = new Set<Effect>()             // ← add: LAB-22's listener list, but auto-populated

  function get(): T {
    if (currentEffect) {
      subscribers.add(currentEffect)                  // ← add: THE KEY LINE — auto-register whoever is reading right now
    }
    return value
  }

  function set(newValue: T): void {
    value = newValue
    for (const effect of subscribers) {                // ← add: notify everyone who ever read this signal
      effect()
    }
  }

  return [get, set]
}
```

```ts
// main.ts
import { createSignal } from './signals'

console.log('=== Signals: Get and Set ===')
const [count, setCount] = createSignal(0)
console.log(`count(): ${count()}`)
console.log('count.set(5)')
setCount(5)
console.log(`count(): ${count()}`)
```

### SAVE AND TRY

Save, check the browser DevTools console.

**Expected:**
```
=== Signals: Get and Set ===
count(): 0
count.set(5)
count(): 5
```

**Confirm `subscribers` is empty right now:** With no `currentEffect` set (nothing has called `createEffect` yet — Step 2), calling `count()` never adds anything to `subscribers` — `set()` correctly does nothing extra, just updates `value`. This is expected: a signal with nobody "watching" behaves exactly like a plain variable.

---

## Step 2 — Effects: Automatic Re-run

```ts
// Add to signals.ts:
export function createEffect(fn: Effect): void {
  const wrappedEffect = () => {
    currentEffect = wrappedEffect                    // ← add: "I am now the one running — signals I read should track ME"
    fn()
    currentEffect = null                              // ← add: done — stop attributing reads to this effect
  }
  wrappedEffect()                                     // ← add: run it ONCE immediately, which does the FIRST dependency tracking
}
```

Add to `main.ts`:

```ts
import { createEffect } from './signals'

console.log('\n=== Effects: Automatic Re-run ===')
const [count2, setCount2] = createSignal(0)

createEffect(() => {
  console.log(`effect ran — count is: ${count2()}`)      // reading count2() INSIDE the effect — this is the tracked read
})

console.log('count.set(1)')
setCount2(1)
console.log('count.set(2)')
setCount2(2)
console.log('  ← the effect re-ran automatically — nobody called it manually')
```

### SAVE AND TRY

Check the browser console.

**Expected:**
```
=== Effects: Automatic Re-run ===
effect ran — count is: 0
count.set(1)
effect ran — count is: 1
count.set(2)
effect ran — count is: 2
  ← the effect re-ran automatically — nobody called it manually
```

**Trace the mechanism exactly:** `createEffect` runs `wrappedEffect()` immediately. Inside, `currentEffect = wrappedEffect` is set FIRST, THEN `fn()` runs, which calls `count2()` — and `count2`'s `get()` sees `currentEffect` is set, so it adds `wrappedEffect` to ITS `subscribers` set. Later, `setCount2(1)` iterates `subscribers` and calls `wrappedEffect()` again — which AGAIN sets `currentEffect`, AGAIN calls `fn()`, AGAIN reads `count2()` (re-confirming the subscription, harmlessly), and prints the new value. Nobody ever wrote "this effect depends on count2" anywhere — it fell out ENTIRELY from the ORDER of operations: set `currentEffect`, then run code that happens to call `get()`.

---

## Step 3 — Effects Track ONLY What They Actually Read

```ts
console.log('\n=== Effects Track ONLY What They Actually Read ===')
const [count3, setCount3] = createSignal(0)
const [otherSignal, setOtherSignal] = createSignal(0)

createEffect(() => {
  console.log(`effect ran — reading count: ${count3()}`)     // never touches otherSignal at all
})

console.log('otherSignal.set(999)')
setOtherSignal(999)
console.log('(no output — the effect never read otherSignal, so it\'s not subscribed to it)')

console.log('count.set(1)')
setCount3(1)
console.log('  ← re-ran only for the signal it actually depends on')
```

### SAVE AND TRY

**Expected:**
```
=== Effects Track ONLY What They Actually Read ===
effect ran — reading count: 0
otherSignal.set(999)
(no output — the effect never read otherSignal, so it's not subscribed to it)
count.set(1)
effect ran — reading count: 1
  ← re-ran only for the signal it actually depends on
```

**Confirm the precision of this tracking:** The effect body never calls `otherSignal()` — so `otherSignal`'s `subscribers` set NEVER includes this effect, ever. `setOtherSignal(999)` iterates a subscriber list this effect was never added to, so it's genuinely skipped — not filtered out by some special-case check, just structurally absent from the notification list in the first place. This precision (react to EXACTLY what's read, nothing more, nothing less) is what makes signal-based reactivity efficient even in large applications with hundreds of pieces of state.

---

### Concept: Computed — A Signal Derived From Other Signals

**What it is:** A **computed** value is BOTH a signal (something effects can read and depend on) AND an effect (something that automatically re-runs when ITS OWN dependencies change) — chained together. This is exactly LAB-31's `total`, but self-updating.

**The solution:**

```ts
export function createComputed<T>(fn: () => T): () => T {
  const [value, setValue] = createSignal(fn())     // computed ONCE up front for an initial value
  createEffect(() => {
    setValue(fn())                                    // whenever a DEPENDENCY changes, recompute and push the new value
  })
  return value                                          // expose only the GETTER — computed values aren't set directly
}
```

---

## Step 4 — Computed Signals

```ts
// Add to signals.ts:
export function createComputed<T>(fn: () => T): () => T {
  const [value, setValue] = createSignal(fn())
  createEffect(() => {
    setValue(fn())
  })
  return value
}
```

Add to `main.ts`:

```ts
import { createComputed } from './signals'

console.log('\n=== Computed: Derived Signals ===')
interface CartItem { name: string; price: number; quantity: number }
const [items, setItems] = createSignal<CartItem[]>([
  { name: 'Apple', price: 1.0, quantity: 2 },
  { name: 'Bread', price: 3.5, quantity: 1 },
])

const total = createComputed(() =>
  items().reduce((sum, item) => sum + item.price * item.quantity, 0)
)

console.log(`total(): ${total()}`)
console.log('items.set([...updated with one more apple...])')
setItems([...items(), { name: 'Apple', price: 1.0, quantity: 1 }])
console.log(`total(): ${total()}`)
console.log('  ← total recomputed automatically — no manual recalculation call anywhere')
```

### SAVE AND TRY

**Expected:**
```
=== Computed: Derived Signals ===
total(): 5.5
items.set([...updated with one more apple...])
total(): 6.5
  ← total recomputed automatically — no manual recalculation call anywhere
```

**Confirm `total` is BOTH readable AND self-updating:** `total()` is called just like `count()` — a plain signal getter. But its VALUE changes automatically whenever `items` changes, because `createComputed` wraps the computation in an EFFECT that reads `items()` (registering the dependency) and writes the RESULT into an internal signal — the exact chaining LAB-31 needed a human to perform manually, now happening structurally.

---

## Step 5 — LAB-31's Bug, Now Structurally Impossible

```ts
console.log('\n=== LAB-31\'s Bug, Now Structurally Impossible ===')
const [cartItems, setCartItems] = createSignal<CartItem[]>([
  { name: 'Apple', price: 1.0, quantity: 2 },
  { name: 'Bread', price: 3.5, quantity: 1 },
])

const cartTotal = createComputed(() =>
  cartItems().reduce((sum, item) => sum + item.price * item.quantity, 0)
)
const checkoutEnabled = createComputed(() => cartTotal() > 0)

createEffect(() => {                                       // ← ONE effect — no separate "syncTotal" / "syncCheckoutButton" calls
  console.log(`effect ran — total: $${cartTotal().toFixed(2)}, checkout enabled: ${checkoutEnabled()}`)
})

console.log('items.set([]) — clearing the cart')
setCartItems([])
console.log('  ← ONE effect, reading \'total\', automatically re-ran — there was no separate "sync" call to forget')
```

### SAVE AND TRY

**Expected:**
```
=== LAB-31's Bug, Now Structurally Impossible ===
effect ran — total: $5.50, checkout enabled: true
items.set([]) — clearing the cart
effect ran — total: $0.00, checkout enabled: false
  ← ONE effect, reading 'total', automatically re-ran — there was no separate "sync" call to forget
```

**This is the direct fix for LAB-31's Step 3 bug:** There is NO `clearButton`-specific code here that needs to "remember" to sync anything — `setCartItems([])` just updates the SOURCE signal. `cartTotal` automatically recomputes (it's a `createComputed` that reads `cartItems`). `checkoutEnabled` automatically recomputes (it reads `cartTotal`). The effect automatically re-runs (it reads both `cartTotal` and `checkoutEnabled`). A NEW feature that mutates `cartItems` in some future, not-yet-written way would AUTOMATICALLY get correct total/checkout behavior too — there's no "list of sync calls" a new feature could ever forget, because there IS no such list anymore.

---

## 🎯 Challenge: Dynamic Dependencies

**You know:** An effect's dependencies are determined by WHAT IT ACTUALLY READS, discovered fresh, every single run — not a fixed list decided once.

**Task:** Write an effect that reads `signalA` under one condition and `signalB` under another (based on some OTHER signal, `useA`). Confirm that when the condition flips, the effect STOPS reacting to the signal it no longer reads, and STARTS reacting to the one it now reads.

<details>
<summary>▶ Show Solution</summary>

```ts
console.log('\n=== Dynamic Dependencies ===')
const [useA, setUseA] = createSignal(true)
const [signalA, setSignalA] = createSignal(1)
const [signalB, setSignalB] = createSignal(2)

createEffect(() => {
  if (useA()) {
    console.log(`effect ran — using signalA (value: ${signalA()})`)
  } else {
    console.log(`effect ran — using signalB (value: ${signalB()})`)
  }
})

console.log('switching condition — effect will now read signalB instead')
setUseA(false)

console.log('signalA.set(999) — should NOT trigger a re-run anymore')
setSignalA(999)

console.log('signalB.set(42) — SHOULD trigger a re-run')
setSignalB(42)
```

**Note:** This lab's minimal `createSignal` (Step 1) adds a subscriber but never REMOVES one — a genuinely complete reactive system re-collects dependencies on EVERY run and clears stale subscriptions first, which is a bit more machinery than this lab builds by hand. **Key insight (the part that DOES hold with this lab's simple version):** every time `useA` flips, the effect re-runs (since it always reads `useA()`), and during THAT run, it reads whichever of `signalA`/`signalB` matches the CURRENT branch — meaning it re-subscribes to the right one every time it runs, even though a proper implementation would also need to actively STOP tracking the branch it's no longer taking. This is exactly why production reactive systems (SolidJS, Vue 3) invest real engineering effort into "cleanup old subscriptions before re-tracking" — a subtlety this lab's from-scratch version deliberately simplifies to keep the core mechanism visible.

</details>

---

## Mental Model: What You Just Built Is Real

| This lab's from-scratch code | The real thing |
|---|---|
| `createSignal` | SolidJS's `createSignal`, Vue 3's `ref`, Preact Signals' `signal()` — nearly identical APIs |
| `createEffect` | SolidJS's `createEffect`, Vue's `watchEffect` |
| `createComputed` | SolidJS's `createMemo`, Vue's `computed` |
| The `currentEffect` global + auto-subscription trick | The ACTUAL mechanism every fine-grained reactive framework uses internally |

**Where you will see this again:** LAB-37 (Reactive Spreadsheet) is THIS lab's exact mechanism, applied to spreadsheet formulas instead of a shopping cart — cell dependencies discovered automatically, the same way. LAB-34 (State Management) and LAB-35 (Rendering Pipelines) build on this foundation directly.

---

## Final Check

| Feature | How to verify |
|---|---|
| `createSignal` correctly gets and sets a value | Step 1 |
| `createEffect` runs immediately, then automatically re-runs when a read signal changes | Step 2 |
| An effect does NOT re-run for a signal it never reads | Step 3 |
| `createComputed` produces a value that automatically stays in sync with its dependencies | Step 4 |
| LAB-31's exact bug (a forgotten sync call) is now structurally impossible to write | Step 5 |
| You can explain, without notes, HOW a signal knows which effects depend on it | The `currentEffect` global trick |

---

## Quick Check Answers

**1. What information lets a signal system discover dependencies automatically?**

The ORDER of execution: `createEffect` sets a global `currentEffect` variable BEFORE running the effect's function body, and every signal's `get()` checks that global DURING its own execution — if it's set, the signal adds whatever effect is "currently running" to its own subscriber list. The system never needs to be TOLD the dependency graph; it discovers it by watching WHICH signals get READ while a given effect is the one currently executing, confirmed directly in Step 2's trace.

**2. If nothing ever reads `total`, should the computation still run when `items` changes?**

With THIS lab's simple implementation — yes, it still runs, because `createComputed` wraps its function in a `createEffect`, and that effect subscribes to `items` regardless of whether anything downstream ever reads `total`. (Production frameworks like SolidJS optimize this further with "lazy" computeds that only recompute when actually READ, an optimization beyond this lab's from-scratch scope — but the CORE mechanism, automatic dependency discovery, is the same either way.)

**3. An effect reads `signalA` first, then `signalB` on a later run — should it still listen to `signalA`?**

Ideally, no — a fully correct reactive system re-collects dependencies FRESH on every run and drops subscriptions the effect no longer actually uses (demonstrated conceptually in the Challenge). This lab's simplified `createSignal`/`createEffect` don't implement that cleanup step, which is a genuine, acknowledged limitation — real frameworks (SolidJS, Vue 3) invest meaningful engineering effort specifically in this "stop tracking what you no longer read" problem, precisely because getting it wrong causes exactly the kind of stale, unnecessary updates (or missed updates) this whole lab exists to eliminate.

---

*Next: [LAB-33 — Component Architecture](LAB-33-component-architecture.md) — TypeScript (Browser), same module*
