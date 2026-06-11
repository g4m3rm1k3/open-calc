# PyX — LAB 22 — useState

**Prerequisites:** Lab 21 complete. `update()` applies diffs correctly.

**What this lab adds:**
- The hook slot array — a global structure that stores state values
- `useState<T>(initial: T): [T, (value: T) => void]` — the state hook
- The scheduler — triggers re-render after a setter is called
- Why hooks cannot be called conditionally — demonstrated with a broken example

**Time:** 75–105 minutes.

---

## What You Will Build

After this lab, clicking "+" in the counter increments the count in the browser:

```typescript
function Counter() {
  const [count, setCount] = useState(0);  // slot 0

  function increment() {
    setCount(count + 1);  // triggers re-render
  }

  return h('div', null,
    h('p', null, `Count: ${count}`),
    h('button', { onClick: increment }, '+')
  );
}
```

The counter renders with `count = 0`. Clicking calls `setCount(1)`. The runtime re-renders `Counter`, `useState` returns `[1, setCount]` from the stored slot, the reconciler diffs the new tree against the old, and the DOM updates to show "Count: 1".

---

> **Quick Check — try to answer before reading further:**
>
> 1. `useState` is called inside a component function. How does `useState` know *which component* it belongs to when multiple components are being rendered?
> 2. If `useState` is called twice in one component, how does it know which call is the first and which is the second?
> 3. The rule "hooks cannot be called inside conditionals" exists because hooks use a slot index. Demonstrate with an example: what goes wrong if `useState` is inside an `if` statement?
>
> *(Answers at the end of this lab)*

---

## Concept: The Hook Slot Array

**What it is:** Every component instance has a **slot array** — a list of values, one per hook call. Each `useState` call reads from and writes to a specific slot in this array, identified by its call order.

**How it works:**

```
Component renders (first time):
  Slot 0: useState(0) → stores 0, returns [0, setter0]
  Slot 1: useState('') → stores '', returns ['', setter1]
  Slot 2: useState(false) → stores false, returns [false, setter2]

Component re-renders (after setter0(1) called):
  Slot 0: useState(0) → reads 1 (stored), returns [1, setter0]  ← new value
  Slot 1: useState('') → reads '' (stored), returns ['', setter1]  ← unchanged
  Slot 2: useState(false) → reads false (stored), returns [false, setter2]
```

The slot index is tracked by a **global cursor** that resets to 0 at the start of each component render. Each `useState` call reads the cursor value (the slot index), reads or writes the slot, and increments the cursor.

**Why hooks cannot be conditional:**

```typescript
// BAD: conditional hook
function Bad() {
  if (someCondition) {
    const [x, setX] = useState(0);  // sometimes slot 0, sometimes skipped
  }
  const [y, setY] = useState('');   // sometimes slot 0, sometimes slot 1!
}
```

If `someCondition` is true on the first render, `y` is in slot 1. If `someCondition` is false on the second render (hook skipped), `y` is in slot 0 — a different slot. `useState` returns the wrong value. React enforces the "hooks at the top level" rule for this reason.

**Watch for:** This is not unique to React or PyX. The slot array is a well-known technique for implementing continuations in a functional style. You will see analogous patterns in state machines (a current-state index), iterators (a cursor), and coroutines (a yield-point index).

---

## Concept: TypeScript Generics in `useState`

`useState` needs to work with any type of value:

```typescript
// TypeScript without generics — loses type information:
function useState(initial: unknown): [unknown, (v: unknown) => void]
// useState(0) returns [unknown, setter] — TypeScript doesn't know it's a number

// TypeScript with generics:
function useState<T>(initial: T): [T, (v: T) => void]
// useState(0) returns [number, setter] — TypeScript infers T = number
```

The `<T>` is a **type parameter**. The caller does not have to write `useState<number>(0)` — TypeScript infers `T = number` from the `initial` argument. If you call `useState(0)`, TypeScript knows the return is `[number, (v: number) => void]`. Any attempt to call `setCount("wrong")` is a type error.

**This is identical to Java's and C#'s generic methods** — the syntax and semantics are the same in all three languages. TypeScript generics are your introduction to the pattern you will use constantly in typed OO languages.

---

## Step 1 — Write the Hook Scheduler

Create `runtime/src/hooks.ts`:

```typescript
import type { VNode } from './types.js';
import { update } from './update.js';

/**
 * Hook execution context.
 * The scheduler sets these before calling a component function.
 */
interface HookContext {
  slots: unknown[];           // the hook slot array for this component
  cursor: number;             // current slot index
  vnode: VNode;               // the component's VNode (for re-rendering)
  container: Element;         // the DOM container to update into
  prevVNode: VNode | null;    // the previous VNode (for diffing)
}

// The currently executing component's context.
// null when no component is rendering.
let _current: HookContext | null = null;

// All component instances' hook states, keyed by a stable identity.
// We use a simple counter for component identity in this implementation.
let _nextId = 0;
const _componentStates = new Map<number, unknown[]>();

/**
 * Mount a component and set up its re-render loop.
 */
export function mountComponent(
  componentFn: (props: any) => VNode,
  props: any,
  container: Element,
): void {
  const id = _nextId++;
  _componentStates.set(id, []);

  let prevVNode: VNode | null = null;

  function rerender(): void {
    const slots = _componentStates.get(id)!;

    _current = { slots, cursor: 0, vnode: null!, container, prevVNode };
    const newVNode = componentFn(props);
    _current = null;

    update(prevVNode, newVNode, container);
    prevVNode = newVNode;
  }

  // Store rerender on the context for setters to call
  // We do this by running the first render and capturing it
  rerender();
  // After first render, update the rerender function to be available for setters
  // The setters close over 'rerender' — so subsequent calls work correctly
}

/**
 * useState — returns the current state value and a setter.
 * Must be called inside a component function during rendering.
 */
export function useState<T>(initial: T): [T, (value: T) => void] {
  if (!_current) {
    throw new Error('useState must be called inside a component function.');
  }

  const context = _current;
  const slotIndex = context.cursor++;

  // First render: initialise the slot
  if (context.slots[slotIndex] === undefined) {
    context.slots[slotIndex] = initial;
  }

  const value = context.slots[slotIndex] as T;

  // The setter: update the slot and re-render
  const setter = (newValue: T): void => {
    context.slots[slotIndex] = newValue;
    // Schedule a re-render
    // In this implementation, re-render happens synchronously
    // A production runtime would batch and schedule via requestAnimationFrame
    scheduleRerender(context.container);
  };

  return [value, setter];
}

// Map of container → rerender function
const _rerenders = new Map<Element, () => void>();

export function registerRerender(container: Element, fn: () => void): void {
  _rerenders.set(container, fn);
}

function scheduleRerender(container: Element): void {
  const fn = _rerenders.get(container);
  if (fn) fn();
}
```

The `mountComponent` architecture is simplified for clarity. Let me rewrite it more cleanly:

```typescript
// Rewrite of hooks.ts with cleaner re-render scheduling

import type { VNode } from './types.js';
import { update } from './update.js';

interface ComponentInstance {
  slots: unknown[];
  rerender: () => void;
}

// Currently rendering component (set by the runtime before calling the component fn)
export let _currentInstance: ComponentInstance | null = null;
export let _currentSlotIndex: number = 0;

/**
 * Render a root component into a container.
 * Sets up the re-render loop.
 */
export function renderRoot(
  componentFn: () => VNode,
  container: Element,
): void {
  const instance: ComponentInstance = {
    slots: [],
    rerender: () => {},
  };

  let prevVNode: VNode | null = null;

  instance.rerender = () => {
    _currentInstance = instance;
    _currentSlotIndex = 0;

    const newVNode = componentFn();

    _currentInstance = null;
    _currentSlotIndex = 0;

    update(prevVNode, newVNode, container);
    prevVNode = newVNode;
  };

  instance.rerender();
}

/**
 * useState<T> — state hook.
 */
export function useState<T>(initial: T): [T, (value: T) => void] {
  if (!_currentInstance) {
    throw new Error('useState must be called inside a component function during rendering.');
  }

  const instance = _currentInstance;
  const slotIndex = _currentSlotIndex++;

  if (instance.slots[slotIndex] === undefined) {
    instance.slots[slotIndex] = initial;
  }

  const value = instance.slots[slotIndex] as T;

  const setter = (newValue: T): void => {
    instance.slots[slotIndex] = newValue;
    instance.rerender();
  };

  return [value, setter];
}
```

---

## Step 2 — Update the Runtime Index

Update `runtime/src/index.ts`:

```typescript
export { h } from './h.js';
export { render } from './render.js';
export { renderRoot } from './hooks.js';
export { useState } from './hooks.js';
```

---

## Step 3 — Update the Vite App

Update `app/src/main.jsx`:

```jsx
import { Counter } from './counter.jsx';
import { renderRoot } from 'pyx-runtime';

renderRoot(Counter, document.getElementById('root'));
```

---

## Step 4 — Write `useState` Tests

Create `runtime/src/hooks.test.ts`:

```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import { h } from './h.js';
import { renderRoot, useState } from './hooks.js';

describe('useState', () => {
  let container: HTMLDivElement;

  beforeEach(() => {
    container = document.createElement('div');
  });

  it('returns the initial value on first render', () => {
    let capturedValue: number | undefined;
    renderRoot(() => {
      const [count] = useState(0);
      capturedValue = count;
      return h('div', null);
    }, container);
    expect(capturedValue).toBe(0);
  });

  it('returns updated value after setter call', () => {
    let capturedValue: number | undefined;
    let setter!: (v: number) => void;

    renderRoot(() => {
      const [count, setCount] = useState(0);
      capturedValue = count;
      setter = setCount;
      return h('div', null);
    }, container);

    expect(capturedValue).toBe(0);
    setter(42);
    expect(capturedValue).toBe(42);
  });

  it('maintains multiple independent state slots', () => {
    let capturedA: number | undefined;
    let capturedB: string | undefined;
    let setA!: (v: number) => void;

    renderRoot(() => {
      const [a, sa] = useState(0);
      const [b] = useState('hello');
      capturedA = a;
      capturedB = b;
      setA = sa;
      return h('div', null);
    }, container);

    setA(99);
    expect(capturedA).toBe(99);
    expect(capturedB).toBe('hello');  // unchanged
  });

  it('updates the DOM on state change', () => {
    let setter!: (v: number) => void;
    renderRoot(() => {
      const [count, setCount] = useState(0);
      setter = setCount;
      return h('p', null, `Count: ${count}`);
    }, container);

    expect(container.textContent).toBe('Count: 0');
    setter(1);
    expect(container.textContent).toBe('Count: 1');
  });

  it('throws if called outside component', () => {
    expect(() => useState(0)).toThrow('useState must be called inside a component');
  });
});
```

---

### SAVE AND TRY

```
> npm test
```

**Expected:** All tests pass including useState tests.

**In the browser (Vite app):**

Click the "+" button. The count increments. This is the first time the counter component works end-to-end — `.pyx` source → compiled JSX → real runtime → working interactive component.

---

## Challenge: Demonstrate Why Hooks Cannot Be Conditional

Write a test that shows what happens when `useState` is called conditionally and the condition changes between renders. The test should have two `useState` calls: one inside an `if` statement and one outside. On the second render, toggle the condition and verify that the second `useState` returns the wrong value.

Try writing it yourself before revealing the solution.

---

<details>
<summary>▶ Show Solution</summary>

```typescript
it('breaks when useState is conditional (demonstration)', () => {
  let condition = true;
  let setA!: (v: number) => void;
  let capturedB: string | undefined;

  renderRoot(() => {
    if (condition) {
      const [a, sa] = useState(0);  // slot 0 when condition is true
      setA = sa;
    }
    const [b] = useState('hello');   // slot 0 when condition is false, slot 1 when true
    capturedB = b;
    return h('div', null);
  }, container);

  expect(capturedB).toBe('hello');  // correct on first render

  condition = false;
  setA(99);  // trigger re-render — but slot 0 is now the 'b' slot!
  // capturedB will be 99 (wrong) instead of 'hello'
  expect(capturedB).not.toBe('hello');  // the bug is demonstrated
});
```

**Key insight:** The test shows the bug without claiming to fix it — it documents the constraint. When `condition` becomes false, the conditional `useState` is skipped. The second `useState` (for `b`) now reads slot 0, which was written by `setA(99)`. It returns `99` instead of `'hello'`. The slot index is no longer stable, so the hook reads the wrong state. This is why the "rules of hooks" prohibit conditional hook calls — the slot index is the only identity a hook has.

</details>

---

## Final Check

| Feature | How to verify |
|---|---|
| Initial value returned | `useState(0)` → `[0, setter]` on first render |
| Setter triggers re-render | `setter(42)` → component re-renders with new value |
| Multiple slots independent | Two `useState` calls → two independent slots |
| DOM updates on state change | Text changes in container after setter call |
| Error outside component | `useState(0)` outside render throws |
| Counter works in browser | Click "+" → count increments visually |

---

## Your Complete Files

### New file this lab

**`runtime/src/hooks.ts`** — `useState`, `_currentInstance`, `_currentSlotIndex`, `ComponentInstance` type. Full content in Steps 1–3.

**`runtime/src/hooks.test.ts`** — test suite.

### Changed files this lab

**`runtime/src/render.ts`** — updated `renderRoot` to create a `ComponentInstance`, set `_currentInstance` before calling the component function, and register `rerender` as the re-render trigger.

### Project structure at end of Lab 22

```
pyx/
├── .venv/
├── compiler/              ← unchanged
├── runtime/
│   ├── index.html
│   ├── package.json
│   ├── vite.config.ts
│   └── src/
│       ├── debug.ts
│       ├── h.ts
│       ├── h.test.ts
│       ├── hooks.ts           ← new
│       ├── hooks.test.ts      ← new
│       ├── index.ts           ← updated (exports useState)
│       ├── main.tsx
│       ├── reconciler.ts
│       ├── reconciler.test.ts
│       ├── render.ts          ← updated (ComponentInstance integration)
│       └── render.test.ts
└── pyproject.toml
```

---

## Quick Check Answers

**1. How does `useState` know which component it belongs to?**

Through the `_currentInstance` global. Before the runtime calls a component function, it sets `_currentInstance` to that component's `ComponentInstance` object. `useState` reads `_currentInstance` to know which slot array to use. After the component function returns, `_currentInstance` is reset to `null`. This is a global variable pattern — similar to Python's `threading.local()` for thread-local storage. It works because JavaScript is single-threaded: only one component renders at a time.

**2. How does `useState` know which call is the first and which is the second?**

Through the `_currentSlotIndex` counter. It resets to 0 at the start of each render. The first `useState` call reads index 0 and increments to 1. The second call reads index 1 and increments to 2. The nth call reads index n-1. The slot array is indexed by call order — which is stable as long as the hooks are always called in the same order.

**3. What goes wrong if `useState` is inside an `if` statement?**

The slot index becomes unstable. On the first render where the condition is true, the conditional `useState` uses slot 0, and the next `useState` uses slot 1. On the next render where the condition is false, the conditional `useState` is skipped — its slot is never read. The next `useState` now uses slot 0 instead of slot 1. It reads the value that was stored by the conditional hook (a different type, a different value). The component reads wrong state and renders incorrectly.

---

*End of LAB 22.*

*Lab 23 implements `useEffect` — the hook for side effects like data fetching, subscriptions, and timers. Effects run after render and can return a cleanup function that runs before the next effect or when the component unmounts.*
