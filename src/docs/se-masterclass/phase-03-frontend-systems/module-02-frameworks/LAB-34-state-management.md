# SE Masterclass — LAB-34 — State Management

**Language: TypeScript (Browser)** — same setup as LAB-29–33.

**Prerequisites:** LAB-33 (Component Architecture — components with PRIVATE state) and LAB-32 (signals). This lab is about what happens the moment TWO components need the SAME state, and neither one should privately own it.

**What this lab adds:**
- The exact problem: sibling components that need to share state, where neither is the other's parent
- "Lifting state up" — moving state to the nearest common ancestor, passing it DOWN as props
- Prop drilling — the pain of passing state through components that don't themselves need it
- A simple global store — shared state reachable from anywhere, without drilling

**Time:** 70–90 minutes

---

> **Quick Check — try to answer before reading:**
>
> 1. Component A has signal `count`. Component B needs to read and change the SAME `count`. If B is not a child of A, can B just call `createSignal` itself to get "the same" state?
> 2. "Lifting state up" means moving state to a common ANCESTOR. Why does that specific location — the common ancestor — work, when a random unrelated component wouldn't?
> 3. A deeply nested component (5 levels down) needs a piece of global state. Passing it as props through all 5 levels is called prop drilling. What's annoying about it, SPECIFICALLY (not just "it's more code")?
>
> *(Answers at the end of this lab)*

---

## What You Will Build

By the end of this lab, the browser shows:

```
=== The Problem: Unsynced Siblings ===
Celsius input:  [ 20 ]
Fahrenheit display: 68°F   ← correct on load, but editing Celsius does NOT update this (no shared source)

=== Fixed: Lifted State ===
Celsius input:  [ 20 ]  <-> Fahrenheit input: [ 68 ]
  ← editing EITHER one updates the OTHER — both read/write the SAME lifted signal

=== Global Store: No Prop Drilling ===
Header shows count: 0
Sidebar shows count: 0
[Increment from Footer]
Header shows count: 1
Sidebar shows count: 1
  ← Header, Sidebar, and Footer are NOT parent/child — none of them passed count as a prop
```

---

### Concept: The Sibling Problem

**What it is:** LAB-33's `Counter` components each had PRIVATE, independent state — which is correct when nothing else needs to know about it. But if TWO SEPARATE components (say, a Celsius input and a Fahrenheit input) need to represent the SAME underlying value, private state per-component is WRONG — each would drift independently, with no way to stay in sync.

**The problem before:**

```ts
function CelsiusInput() {
  const [celsius, setCelsius] = createSignal(20)     // PRIVATE — Fahrenheit knows nothing about this
  // ...
}
function FahrenheitInput() {
  const [fahrenheit, setFahrenheit] = createSignal(68)   // ALSO private — completely disconnected from celsius
  // ...
}
```

Editing `celsius` has NO way to affect `fahrenheit` — they are two entirely separate signals, living in two entirely separate closures, with no relationship to each other at all.

**The solution — "lifting state up":** Move the SHARED piece of state to the nearest common ANCESTOR of both components that need it, and pass it DOWN to both as props.

---

## Step 1 — Feel the Problem

```ts
// main.ts
import { createSignal, createEffect } from './signals'

const app = document.querySelector<HTMLDivElement>('#app')!

console.log('=== The Problem: Unsynced Siblings ===')

function CelsiusInputBroken(): HTMLDivElement {
  const [celsius, setCelsius] = createSignal(20)       // private — Fahrenheit has no idea this exists
  const el = document.createElement('div')
  const label = document.createElement('span')
  const input = document.createElement('input')
  input.type = 'number'
  input.value = String(celsius())
  input.addEventListener('input', () => setCelsius(Number(input.value)))
  createEffect(() => { label.textContent = 'Celsius input: ' })
  el.append(label, input)
  return el
}

function FahrenheitDisplayBroken(initialC: number): HTMLDivElement {
  const el = document.createElement('div')
  el.textContent = `Fahrenheit display: ${(initialC * 9) / 5 + 32}°F   ← correct on load, but editing Celsius does NOT update this (no shared source)`
  return el
}

app.append(CelsiusInputBroken(), FahrenheitDisplayBroken(20))
```

### SAVE AND TRY

Save. Change the Celsius input's value in the browser.

**Confirm the bug:** The Fahrenheit display NEVER updates, no matter what you type — it was computed ONCE, from a plain number, at construction time, with no ongoing connection to the Celsius input's signal at all. This is structurally the SAME problem as LAB-31, but between two SIBLING components instead of within one component's internal sync logic.

---

## Step 2 — Lift State to the Common Ancestor

```ts
// components/celsius-input.ts
export function CelsiusInput(celsius: () => number, setCelsius: (v: number) => void): HTMLDivElement {
  const el = document.createElement('div')
  const label = document.createElement('span')
  label.textContent = 'Celsius input: '
  const input = document.createElement('input')
  input.type = 'number'

  createEffect(() => { input.value = String(celsius()) })      // ← add: DISPLAY reflects the LIFTED signal
  input.addEventListener('input', () => setCelsius(Number(input.value)))   // ← add: WRITES to the LIFTED signal

  el.append(label, input)
  return el
}
```

```ts
// components/fahrenheit-input.ts
export function FahrenheitInput(celsius: () => number, setCelsius: (v: number) => void): HTMLDivElement {
  const el = document.createElement('div')
  const label = document.createElement('span')
  label.textContent = ' <-> Fahrenheit input: '
  const input = document.createElement('input')
  input.type = 'number'

  createEffect(() => { input.value = String((celsius() * 9) / 5 + 32) })    // ← add: DERIVED from the SAME lifted signal
  input.addEventListener('input', () => {
    const f = Number(input.value)
    setCelsius(((f - 32) * 5) / 9)                                            // ← add: writes BACK to the shared signal, converted
  })

  el.append(label, input)
  return el
}
```

Add to `main.ts`:

```ts
import { CelsiusInput } from './components/celsius-input'
import { FahrenheitInput } from './components/fahrenheit-input'

console.log('\n=== Fixed: Lifted State ===')
const [celsius, setCelsius] = createSignal(20)     // ← add: lives in the COMMON ANCESTOR (main.ts itself, here)

const row = document.createElement('div')
row.append(CelsiusInput(celsius, setCelsius), FahrenheitInput(celsius, setCelsius))
app.appendChild(row)
```

### SAVE AND TRY

Save. Edit the Celsius input — confirm the Fahrenheit input updates automatically. Edit the Fahrenheit input — confirm Celsius updates too.

**Confirm WHY this works now:** Both `CelsiusInput` and `FahrenheitInput` receive the SAME `celsius`/`setCelsius` pair as PARAMETERS — neither one created its own private signal. Both are `createEffect`-driven off the exact SAME underlying value (LAB-32's automatic re-run), so a change from EITHER side propagates correctly to both displays. This is "lifting state up" — the state moved from living inside two separate, disconnected components to living in their nearest COMMON ANCESTOR, which then hands it down to both.

**Why the common ancestor SPECIFICALLY:** Any component that's an ancestor of BOTH `CelsiusInput` and `FahrenheitInput` can pass the SAME signal down to both. A component that's an ancestor of only ONE of them couldn't hand it to the other at all — the common ancestor is the LOWEST point in the tree from which both siblings are still reachable.

---

### Concept: Prop Drilling

**What it is:** If a piece of LIFTED state needs to reach a component several levels DEEP in the tree, it must be passed as a prop through EVERY intermediate component along the way — even ones that don't themselves use it, just to hand it further down. This is called **prop drilling**.

**The problem, specifically:** It's not just "more typing" — every INTERMEDIATE component's signature now mentions a prop it has NO actual use for, purely to relay it. If the deeply nested component's need for that state ever changes, EVERY intermediate component's signature might need to change too, even though none of them cared about the DATA itself — only about passing it through.

---

## Step 3 — A Global Store, No Drilling Required

```ts
// store.ts
import { createSignal } from './signals'

export const [globalCount, setGlobalCount] = createSignal(0)    // ← add: ONE shared signal, module-level — reachable by import, from ANYWHERE
```

```ts
// components/header.ts
import { globalCount } from '../store'
export function Header(): HTMLDivElement {
  const el = document.createElement('div')
  createEffect(() => { el.textContent = `Header shows count: ${globalCount()}` })
  return el
}
```

```ts
// components/sidebar.ts
import { globalCount } from '../store'
export function Sidebar(): HTMLDivElement {
  const el = document.createElement('div')
  createEffect(() => { el.textContent = `Sidebar shows count: ${globalCount()}` })
  return el
}
```

```ts
// components/footer.ts
import { globalCount, setGlobalCount } from '../store'
export function Footer(): HTMLDivElement {
  const el = document.createElement('div')
  const button = document.createElement('button')
  button.textContent = 'Increment from Footer'
  button.addEventListener('click', () => setGlobalCount(globalCount() + 1))
  el.appendChild(button)
  return el
}
```

Add to `main.ts`:

```ts
import { Header } from './components/header'
import { Sidebar } from './components/sidebar'
import { Footer } from './components/footer'

console.log('\n=== Global Store: No Prop Drilling ===')
app.append(Header(), Sidebar(), Footer())
```

### SAVE AND TRY

Save. Click "Increment from Footer" in the browser. Confirm BOTH `Header` and `Sidebar` update.

**Expected:**
```
Header shows count: 0
Sidebar shows count: 0
[Increment from Footer]
Header shows count: 1
Sidebar shows count: 1
```

**Confirm ZERO props were passed between these three components:** `Header`, `Sidebar`, and `Footer` are NOT parent/child of each other — they're all just appended to `app` as siblings. NONE of them received `count` as a function parameter — each one IMPORTS `globalCount`/`setGlobalCount` directly from `store.ts`, exactly like LAB-17's `Repository<T>` pattern: a SHARED, IMPORTABLE abstraction that multiple independent consumers depend on directly, without needing to be wired together explicitly through props at every level.

---

## 🎯 Challenge: When SHOULD You Use Local State vs. a Global Store?

**You know:** LAB-33's `Counter` used PRIVATE signals (correct — nothing else needed that specific instance's count). This lab's `globalCount` is SHARED (correct — multiple unrelated components need the SAME value).

**Task:** For each scenario below, decide: local component state, lifted state (common ancestor), or a global store? Justify each answer in one sentence.

1. Whether a single dropdown menu is currently open.
2. The logged-in user's name, needed by a header, a profile page, and a settings page.
3. Two number inputs in a "min/max price filter" that must always satisfy `min <= max`.

<details>
<summary>▶ Show Solution</summary>

1. **Local state.** Only the dropdown component itself cares whether IT is open — no other component needs to know or react to this, so keeping it private (like LAB-33's `Counter`) avoids unnecessary global coupling.
2. **Global store.** The header, profile page, and settings page are NOT in a simple parent/child relationship with each other, and ALL need the SAME logged-in user data — exactly this lab's `globalCount` scenario, just with user data instead of a counter.
3. **Lifted state.** `min` and `max` are two SIBLING inputs that must stay CONSTRAINED relative to each other (LAB-31's kind of derived-value relationship) — lifting both into their nearest common ancestor component (a `PriceFilter` component containing both inputs) lets that ancestor enforce `min <= max` in ONE place, exactly like Step 2's Celsius/Fahrenheit lifting.

**Key insight:** There is no single "correct" default — the RIGHT choice depends on WHO needs the state and HOW related those consumers are in the component tree. Overusing a global store for state that's genuinely local makes small, focused components unnecessarily coupled to global concerns; underusing one for genuinely shared state leads straight back into LAB-31's manual-sync pain.

</details>

---

## Mental Model: Where This Shows Up

| This lab | Real-world equivalent |
|---|---|
| Lifting state to a common ancestor | React's "lift state up" pattern — the exact same term |
| `store.ts`'s module-level signal | Zustand, Jotai, or a simple Context + `useReducer` in React; Pinia in Vue |
| Prop drilling | The EXACT problem React's Context API and Vue's `provide`/`inject` exist to avoid |
| `Header`/`Sidebar`/`Footer` importing the same store | Redux's single global store, imported wherever needed |

**Where you will see this again:** LAB-37 (Reactive Spreadsheet) needs shared state across many cells (a grid-wide store). LAB-43 (IDE Layout System) needs shared layout state across many independent panels — both build directly on this lab's lifted-state and global-store patterns.

---

## Final Check

| Feature | How to verify |
|---|---|
| Two components with independent private signals do NOT stay in sync | Step 1 |
| Lifted state (shared signal passed as props) keeps two sibling inputs in sync both directions | Step 2 |
| A global store lets THREE unrelated components share state with zero prop drilling | Step 3 |
| You can correctly classify local/lifted/global for three different scenarios | Challenge |
| You can explain, without notes, why the "common ancestor" is the right place to lift state to | Concept box |

---

## Quick Check Answers

**1. Can component B get "the same" state as A by just calling `createSignal` itself?**

No — calling `createSignal` ANYWHERE creates a BRAND NEW, independent signal with its own private value and subscriber list; there is no way for two separate `createSignal` calls to ever refer to the "same" reactive value. Step 1 demonstrated this directly: `CelsiusInputBroken`'s private signal and `FahrenheitDisplayBroken`'s plain number had zero connection, no matter how similar their initial values looked. Sharing state REQUIRES using the exact same signal instance — either by lifting it (Step 2) or importing it from a shared module (Step 3) — never by independently creating "equivalent" state in two places.

**2. Why does lifting to the common ancestor specifically work?**

Because the common ancestor is the LOWEST point in the component tree from which BOTH components needing the shared state are still reachable — it can pass the SAME signal down to both as props (Step 2). Any component that is an ancestor of only ONE of the two siblings could hand the state to that one, but has no path to also hand it to the other — the common ancestor is the minimal point where a single piece of state can flow to every consumer that needs it.

**3. What's specifically annoying about prop drilling, beyond "more code"?**

Every INTERMEDIATE component along the drilling path ends up with a prop in its signature that IT never actually uses — it exists purely to relay the value one level further down. This couples components that have NOTHING to do with the shared state to its existence anyway, and means a change to what's being drilled (a renamed field, an added piece of related state) potentially requires editing EVERY intermediate component's signature, even though none of them cared about the data itself — a real maintenance cost, not just extra typing, which is exactly why Step 3's global store (bypassing the tree entirely for genuinely shared, non-hierarchical state) is often the better choice.

---

*Next: [LAB-35 — Rendering Pipelines](LAB-35-rendering-pipelines.md) — TypeScript (Browser), same module*
