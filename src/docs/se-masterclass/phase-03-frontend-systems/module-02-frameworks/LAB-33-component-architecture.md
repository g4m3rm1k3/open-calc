# SE Masterclass — LAB-33 — Component Architecture

**Language: TypeScript (Browser)** — same setup as LAB-29–32.

**Prerequisites:** LAB-32 (Reactivity — components combine with signals directly) and LAB-19 (composition over inheritance — a component tree IS composition, applied to UI).

**What this lab adds:**
- A component as a FUNCTION: props in, a DOM node out — nothing more exotic than that
- Props: how a parent passes data DOWN to a child, without the child reaching up for it
- Composition: building complex UI by nesting simple components, exactly like LAB-19's behavior objects
- Children/slots: letting a parent inject arbitrary CONTENT into a child's structure

**Time:** 70–90 minutes

---

> **Quick Check — try to answer before reading:**
>
> 1. A component is described as "props in, DOM out." What does this make a component, in terms of LAB-02's vocabulary?
> 2. If `Button({ label: 'Save' })` and `Button({ label: 'Cancel' })` are two SEPARATE calls, do they produce ONE shared DOM element or two independent ones?
> 3. A `Card` component wants to let its PARENT decide what content goes inside it, without `Card` needing to know in advance what that content will be. What pattern from LAB-21 does this resemble?
>
> *(Answers at the end of this lab)*

---

## What You Will Build

By the end of this lab, the browser shows:

```
[Save]  [Cancel]     ← two Button components, same function, different props

Card: "Welcome"
  This is arbitrary content passed as a child.
  <button>A nested component, passed as a slot child</button>

Counter: 0  [+1]      ← a component with its OWN internal, encapsulated state
Counter: 0  [+1]      ← a SECOND instance — completely independent state
```

---

### Concept: A Component Is Just a Function

**What it is:** Strip away the frameworks, and a **component** is nothing more than a FUNCTION that takes some input (**props**) and returns a piece of UI (here: a DOM node). This is LAB-02's "functions are values" idea, applied to UI construction.

**The problem before:** LAB-29 built UI with flat, one-off `createElement` calls — a `Button` was built inline, once, with no way to REUSE that exact construction logic for a second button with different text, without copy-pasting the same 3 lines again.

**The solution:** Wrap the construction logic in a function that takes the VARYING parts as parameters.

```ts
interface ButtonProps {
  label: string
  onClick: () => void
}

function Button(props: ButtonProps): HTMLButtonElement {
  const el = document.createElement('button')
  el.textContent = props.label
  el.addEventListener('click', props.onClick)
  return el
}
```

**Project Application (The "Why" here):** This is EXACTLY LAB-02's `area(width, height)` function — a named, reusable, input-output transformation — except here the "output" is a DOM node instead of a number.

---

## Step 1 — Components as Functions

```ts
// components/button.ts
export interface ButtonProps {
  label: string
  onClick: () => void
}

export function Button(props: ButtonProps): HTMLButtonElement {
  const el = document.createElement('button')
  el.textContent = props.label
  el.addEventListener('click', props.onClick)
  return el
}
```

```ts
// main.ts
import { Button } from './components/button'

const app = document.querySelector<HTMLDivElement>('#app')!

const saveButton = Button({ label: 'Save', onClick: () => console.log('Save clicked') })
const cancelButton = Button({ label: 'Cancel', onClick: () => console.log('Cancel clicked') })
app.append(saveButton, cancelButton)
```

### SAVE AND TRY

Save. The browser should show two buttons: "Save" and "Cancel." Click each — check the DevTools console for the logged messages.

**Confirm each call produces an INDEPENDENT DOM node:** `saveButton` and `cancelButton` are two SEPARATE `<button>` elements — calling `Button(...)` twice ran the SAME function body twice, each time creating its OWN `document.createElement('button')`, exactly like calling `area(4, 5)` and `area(10, 3)` in LAB-02 produced two independent results from the same function, never sharing state between calls.

---

## Step 2 — Composition: Components Containing Components

```ts
// components/card.ts
export interface CardProps {
  title: string
  content: HTMLElement[]        // ← add: children — arbitrary DOM nodes the CALLER decides on
}

export function Card(props: CardProps): HTMLDivElement {
  const el = document.createElement('div')
  el.style.border = '1px solid #ccc'
  el.style.padding = '8px'

  const heading = document.createElement('h3')
  heading.textContent = `Card: "${props.title}"`
  el.appendChild(heading)

  for (const child of props.content) {        // ← add: append whatever the CALLER provided — Card doesn't know what it is
    el.appendChild(child)
  }

  return el
}
```

Add to `main.ts`:

```ts
import { Card } from './components/card'

const paragraph = document.createElement('p')
paragraph.textContent = 'This is arbitrary content passed as a child.'

const nestedButton = Button({                      // ← a COMPONENT, nested inside ANOTHER component's children
  label: 'A nested component, passed as a slot child',
  onClick: () => console.log('nested button clicked'),
})

const card = Card({ title: 'Welcome', content: [paragraph, nestedButton] })
app.appendChild(card)
```

### SAVE AND TRY

Save. The browser should show a bordered card titled `Card: "Welcome"` containing the paragraph text and a button.

**Confirm `Card` never needed to know it was receiving a `Button`:** `Card`'s `content: HTMLElement[]` prop accepts ANY array of DOM nodes — a paragraph, a button, another `Card`, ANYTHING. `Card` composes whatever it's handed without needing a special case for each possible child type. This is LAB-19's composition principle directly: `Card` HAS content, it doesn't need to KNOW what specific thing that content is.

---

### Concept: Slots — Letting the Parent Decide

**What it is:** This lab's `content: HTMLElement[]` prop (Step 2) IS a **slot** — a designated place where a PARENT injects content, without the CHILD component needing any advance knowledge of what will go there. This is the same idea as LAB-21's plugin extension points, applied to UI composition instead of a text pipeline.

**Where you will see this:** React calls this pattern `children` (`<Card>{someContent}</Card>`); Vue calls it `<slot>`. Both are the exact same idea this lab just built by hand: a component defines a HOLE, and whoever USES the component decides what fills it.

---

## Step 3 — A Component With Its Own Encapsulated State

Combine LAB-32's signals with the component pattern — a component that owns PRIVATE, internal state, invisible to whoever uses it.

```ts
// components/counter.ts
import { createSignal, createEffect } from '../signals'

export function Counter(): HTMLDivElement {
  const el = document.createElement('div')
  const label = document.createElement('span')
  const button = document.createElement('button')
  button.textContent = '+1'

  const [count, setCount] = createSignal(0)          // ← add: PRIVATE state — lives entirely inside this function call

  createEffect(() => {
    label.textContent = `Counter: ${count()} `          // ← add: automatically stays in sync — LAB-32's whole point
  })

  button.addEventListener('click', () => setCount(count() + 1))

  el.append(label, button)
  return el
}
```

Add to `main.ts`:

```ts
import { Counter } from './components/counter'

app.appendChild(Counter())
app.appendChild(Counter())          // ← a SECOND, completely independent instance
```

### SAVE AND TRY

Save. The browser should show TWO "Counter: 0 [+1]" rows. Click the first one's button several times — confirm the SECOND counter's number does NOT change.

**Confirm true independence between instances:** Each call to `Counter()` runs `createSignal(0)` FRESH — `count`/`setCount` are LOCAL to that specific function call, captured in a CLOSURE (LAB-02) that the returned DOM node's event listener uses. Two calls to `Counter()` create two ENTIRELY separate closures, exactly like LAB-02's `make_adder(5)` and `make_adder(10)` never shared their captured `n` — clicking one counter's button has ZERO effect on the other's `count` signal, because they are genuinely different variables in genuinely different closures, not two views of the same shared state.

---

## 🎯 Challenge: A Configurable Counter Component

**You know:** Props let a parent customize a component's behavior; internal signals let a component manage its own state privately.

**Task:** Extend `Counter` to accept an OPTIONAL `step: number` prop (defaulting to `1`) controlling how much each click increments by, and an optional `initial: number` prop (defaulting to `0`) for the starting value.

<details>
<summary>▶ Show Solution</summary>

```ts
export interface CounterProps {
  step?: number
  initial?: number
}

export function Counter(props: CounterProps = {}): HTMLDivElement {
  const step = props.step ?? 1            // LAB-01's default-parameter pattern, TypeScript's nullish coalescing flavor
  const initial = props.initial ?? 0

  const el = document.createElement('div')
  const label = document.createElement('span')
  const button = document.createElement('button')
  button.textContent = `+${step}`

  const [count, setCount] = createSignal(initial)
  createEffect(() => { label.textContent = `Counter: ${count()} ` })
  button.addEventListener('click', () => setCount(count() + step))

  el.append(label, button)
  return el
}

// usage: Counter({ step: 5, initial: 100 })
```

**Key insight:** Props are just FUNCTION PARAMETERS with a nicer calling shape (one object instead of positional arguments) — everything you already know about default parameters (LAB-02), optional values, and function design applies directly. There is no separate "props system" to learn beyond "this is how you pass arguments to a function whose job happens to be building DOM."

</details>

---

## Mental Model: Where This Shows Up

| This lab | React equivalent |
|---|---|
| `function Button(props)` | A React functional component |
| `props.content: HTMLElement[]` | React's `children` prop |
| `createSignal` inside a component | React's `useState` |
| `createEffect` inside a component | React's `useEffect` |
| Two independent `Counter()` calls | Two independent instances of the same React component on screen |

**Where you will see this again:** LAB-34 (State Management) tackles what happens when TWO SIBLING components need to share state that neither one privately owns. LAB-37 (Reactive Spreadsheet) and beyond will use this exact component + signal pattern as their foundation.

---

## Final Check

| Feature | How to verify |
|---|---|
| Two `Button(...)` calls produce two independent DOM elements | Step 1 |
| `Card` correctly composes arbitrary child content without knowing what it is | Step 2 |
| Two `Counter()` instances maintain completely independent state | Step 3 |
| A configurable `Counter` accepts `step`/`initial` props with sensible defaults | Challenge |
| You can explain, without notes, why a component is "just a function" | Concept box |

---

## Quick Check Answers

**1. "Props in, DOM out" — what does this make a component?**

A pure-ish function in LAB-02's sense: a named, reusable, input-output transformation — `props` are the input, a DOM node is the output. (It's not PERFECTLY pure if it also attaches event listeners with side effects, but the SHAPE — takes an input, returns an output — is exactly LAB-02's `area(width, height)` pattern, just returning a DOM node instead of a number.)

**2. `Button({ label: 'Save' })` and `Button({ label: 'Cancel' })` — one shared element or two?**

Two completely independent elements — confirmed in Step 1. Each CALL to `Button(...)` runs the function body fresh, including its own `document.createElement('button')` — there is no shared state between the two calls, exactly like two separate calls to `area(4, 5)` and `area(10, 3)` in LAB-02 never affected each other.

**3. `Card` letting its parent decide what content goes inside — what LAB-21 pattern does this resemble?**

Extension points / plugins: `Card`'s `content` prop is a designated HOLE the component leaves open, and the CALLER decides what fills it — `Card` never needs to know in advance what kind of content it will receive, exactly like LAB-21's `PluginHost` never needed to know what any specific plugin would do, only that it satisfied the shared shape (`TextPlugin` there, `HTMLElement[]` here).

---

*Next: [LAB-34 — State Management](LAB-34-state-management.md) — TypeScript (Browser), same module*
