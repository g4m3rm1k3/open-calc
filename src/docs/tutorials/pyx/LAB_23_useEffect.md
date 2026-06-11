# PyX — LAB 23 — useEffect

**Prerequisites:** Lab 22 complete. `useState` works and the counter increments.

**What this lab adds:**
- `useEffect(fn, deps)` — runs side effects after render
- The dependency array: `[]` runs once, `[dep]` runs when dep changes, no array runs every render
- Cleanup functions: returned from effect, called before the next run and on unmount
- Tests verifying effect timing, deps comparison, and cleanup

**Time:** 60–80 minutes.

---

## What You Will Build

```typescript
function DataComponent() {
  const [data, setData] = useState<string | null>(null);

  useEffect(() => {
    // Runs after first render (deps = [])
    fetch('/api/data')
      .then(r => r.json())
      .then(d => setData(d.message));

    // Cleanup: cancel the fetch if the component unmounts
    // (simplified — real cancellation uses AbortController)
    return () => {
      console.log('DataComponent unmounted');
    };
  }, []);  // empty deps: run once on mount

  return h('p', null, data ?? 'Loading...');
}
```

---

> **Quick Check — try to answer before reading further:**
>
> 1. Why do effects run *after* render, not during? What would happen if an effect called a setter during render?
> 2. The dependency array `[count]` means "run when `count` changes." How does `useEffect` compare the previous deps to the current deps to detect a change?
> 3. `useEffect(() => { ... return () => { cleanup } }, [])` — when does the cleanup function run?
>
> *(Answers at the end of this lab)*

---

## Concept: Side Effects in a Pure Rendering Model

**What it is:** A **side effect** is anything that affects something outside the component's return value — network requests, timers, DOM mutations, subscriptions, logging. The rendering model is: given props and state, return a VNode tree. It is a pure function.

Pure functions have no side effects. But real applications need side effects — you cannot build a useful app without fetching data.

`useEffect` is the **escape hatch**: it lets you run impure code in a controlled way, after the render, when you know the DOM has been updated.

**Why after render:**

If an effect calls a setter during the render function, the render would trigger another render, which would trigger another effect, which would... infinite loop. Effects run after render to break this cycle.

**The dependency array as a memoisation key:**

`useEffect(fn, deps)` stores `deps` from the previous render and compares them to the current `deps` with shallow equality. If they are the same, the effect does not run. This is the same technique as `useMemo` — "only recompute when inputs change."

**Watch for:** `useEffect(() => { ... }, [])` with an empty dependency array runs exactly once — after the first render. This is the correct pattern for "run on mount." Without the dependency array (`useEffect(() => { ... })`), the effect runs after every render.

---

## Step 1 — Add `useEffect` to `hooks.ts`

Add to `runtime/src/hooks.ts` (inside the `ComponentInstance` and the slot mechanism):

First, add an `effects` array to track pending effects:

```typescript
interface EffectSlot {
  fn: () => (() => void) | void;
  deps: unknown[] | undefined;
  prevDeps: unknown[] | undefined;
  cleanup: (() => void) | undefined;
}

interface ComponentInstance {
  slots: unknown[];       // useState slots
  effects: EffectSlot[]; // useEffect slots
  rerender: () => void;
}
```

Update `renderRoot` to flush effects after each render:

```typescript
export function renderRoot(componentFn: () => VNode, container: Element): void {
  const instance: ComponentInstance = {
    slots: [],
    effects: [],
    rerender: () => {},
  };

  let prevVNode: VNode | null = null;
  let _effectSlotIndex = 0;

  instance.rerender = () => {
    _currentInstance = instance;
    _currentSlotIndex = 0;
    _currentEffectIndex = 0;

    const newVNode = componentFn();

    _currentInstance = null;

    update(prevVNode, newVNode, container);
    prevVNode = newVNode;

    // Flush effects after DOM update
    flushEffects(instance);
  };

  instance.rerender();
}

let _currentEffectIndex: number = 0;

/**
 * useEffect — run a side effect after render.
 */
export function useEffect(
  fn: () => (() => void) | void,
  deps?: unknown[],
): void {
  if (!_currentInstance) {
    throw new Error('useEffect must be called inside a component function during rendering.');
  }

  const instance = _currentInstance;
  const slotIndex = _currentEffectIndex++;

  if (!instance.effects[slotIndex]) {
    instance.effects[slotIndex] = {
      fn,
      deps,
      prevDeps: undefined,
      cleanup: undefined,
    };
  } else {
    instance.effects[slotIndex].fn = fn;
    instance.effects[slotIndex].deps = deps;
  }
}

/**
 * Run all pending effects for a component instance.
 */
function flushEffects(instance: ComponentInstance): void {
  for (const slot of instance.effects) {
    if (shouldRunEffect(slot.prevDeps, slot.deps)) {
      // Run cleanup from previous run
      if (slot.cleanup) {
        slot.cleanup();
        slot.cleanup = undefined;
      }
      // Run the effect and store the cleanup
      const cleanup = slot.fn();
      slot.cleanup = cleanup || undefined;
      slot.prevDeps = slot.deps ? [...slot.deps] : undefined;
    }
  }
}

function shouldRunEffect(
  prevDeps: unknown[] | undefined,
  deps: unknown[] | undefined,
): boolean {
  if (deps === undefined) return true;         // no deps: always run
  if (prevDeps === undefined) return true;     // first run
  if (deps.length !== prevDeps.length) return true;
  return deps.some((dep, i) => dep !== prevDeps[i]);  // shallow comparison
}
```

---

## Step 2 — Update the Runtime Index

```typescript
export { h } from './h.js';
export { render } from './render.js';
export { renderRoot, useState, useEffect } from './hooks.js';
```

---

## Step 3 — Tests

Create `runtime/src/hooks.effect.test.ts`:

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { h } from './h.js';
import { renderRoot, useState, useEffect } from './hooks.js';

describe('useEffect', () => {
  let container: HTMLDivElement;
  beforeEach(() => { container = document.createElement('div'); });

  it('runs after first render', () => {
    let ran = false;
    renderRoot(() => {
      useEffect(() => { ran = true; }, []);
      return h('div', null);
    }, container);
    expect(ran).toBe(true);
  });

  it('does not re-run with empty deps', () => {
    let runCount = 0;
    let setter!: (v: number) => void;

    renderRoot(() => {
      const [n, set] = useState(0);
      setter = set;
      useEffect(() => { runCount++; }, []);
      return h('div', null);
    }, container);

    expect(runCount).toBe(1);
    setter(1);  // trigger re-render
    expect(runCount).toBe(1);  // effect did not re-run
  });

  it('re-runs when dep changes', () => {
    let runCount = 0;
    let setter!: (v: number) => void;

    renderRoot(() => {
      const [n, set] = useState(0);
      setter = set;
      useEffect(() => { runCount++; }, [n]);
      return h('div', null);
    }, container);

    expect(runCount).toBe(1);
    setter(1);
    expect(runCount).toBe(2);  // ran again because n changed
  });

  it('calls cleanup before next run', () => {
    const calls: string[] = [];
    let setter!: (v: number) => void;

    renderRoot(() => {
      const [n, set] = useState(0);
      setter = set;
      useEffect(() => {
        calls.push('effect');
        return () => calls.push('cleanup');
      }, [n]);
      return h('div', null);
    }, container);

    setter(1);
    expect(calls).toEqual(['effect', 'cleanup', 'effect']);
  });

  it('runs every render with no dep array', () => {
    let runCount = 0;
    let setter!: (v: number) => void;

    renderRoot(() => {
      const [n, set] = useState(0);
      setter = set;
      useEffect(() => { runCount++; }); // no deps
      return h('div', null);
    }, container);

    setter(1);
    setter(2);
    expect(runCount).toBe(3);
  });
});
```

---

### SAVE AND TRY

```
> npm test
```

**Expected:** All tests pass.

---

## Challenge: Add `useEffect` to the Counter for Local Storage

**Task:** Update `examples/counter.pyx` to persist `count` to `localStorage`. Every time `count` changes, save it. Use `useEffect` with `[count]` as the deps array.

Recompile with `pyxc build examples/counter.pyx` and verify in the browser that the count persists across page refreshes.

**Hint:** `localStorage` is a browser global — use it directly in the PyX source. The code generator emits it as a plain variable reference.

Try writing the updated component before revealing the solution.

---

<details>
<summary>▶ Show Solution</summary>

```python
from pyx import useState, useEffect

def Counter():
    count, set_count = useState(0)

    def increment():
        set_count(count + 1)

    useEffect(lambda: localStorage.setItem("count", count), [count])

    return (
        <div class="counter">
            <p>Count: {count}</p>
            <button onClick={increment}>+</button>
        </div>
    )
```

**Key insight:** `useEffect(fn, [count])` runs `fn` every time `count` changes. `localStorage.setItem` persists the value. `lambda: localStorage.setItem("count", count)` is a zero-argument arrow function in the generated JavaScript — `() => localStorage.setItem("count", count)`. The `count` variable is captured in the closure, so the effect always writes the current count, not a stale one.

</details>

---

## Final Check

| Feature | How to verify |
|---|---|
| Effect runs after first render | `runCount` is 1 immediately after `renderRoot` |
| Empty deps: no re-run | `setter(1)` does not re-run effect with `[]` deps |
| Dep changed: re-runs | `setter(1)` triggers re-run with `[n]` deps |
| Cleanup called before next run | Cleanup runs between effect runs |
| No deps: runs every render | Three renders → three effect calls |

---

## Your Complete Files

### Changed files this lab

**`runtime/src/hooks.ts`** — add `useEffect` implementation: store `[fn, deps, cleanup]` in a slot array, compare deps on re-render, call cleanup before re-running. Updated content in Steps 1–2.

**`runtime/src/hooks.test.ts`** — updated with `useEffect` tests.

**`runtime/src/render.ts`** — updated `renderRoot` to flush the effect queue after each render (effects must run after DOM updates).

### Project structure at end of Lab 23

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
│       ├── hooks.ts           ← updated (useEffect added)
│       ├── hooks.test.ts      ← updated
│       ├── index.ts           ← updated (exports useEffect)
│       ├── main.tsx
│       ├── reconciler.ts
│       ├── reconciler.test.ts
│       ├── render.ts          ← updated (effect flush)
│       └── render.test.ts
└── pyproject.toml
```

---

## Quick Check Answers

**1. Why do effects run after render, not during?**

If an effect called a setter during the render function, the setter would trigger a re-render — which would call the component function again — which would run the effect again — which would call the setter again. Infinite recursion. By running effects *after* the DOM is updated, the runtime guarantees that the current render is complete before any state changes from effects trigger the next render. React's rule: "effects run after every commit to the DOM."

**2. How does `useEffect` compare previous and current deps?**

Shallow equality: `deps.some((dep, i) => dep !== prevDeps[i])`. Each dep at index `i` is compared to the previous dep at index `i` using `!==`. For primitive values (numbers, strings, booleans), `!==` is value equality. For objects and arrays, `!==` is reference equality — if the same object reference is passed, the effect does not re-run, even if the object's contents changed. This is why `[{ id: 1 }]` in deps always looks "changed" even if the object is equivalent — a new object literal creates a new reference.

**3. When does the cleanup function run?**

Before the next effect run (if deps changed and the effect runs again), and when the component unmounts (leaves the DOM). This is used to cancel timers (`clearTimeout`), cancel network requests (`controller.abort()`), and remove event listeners (`window.removeEventListener`). Without cleanup, these background operations would continue running even after the component is removed from the page.

---

*End of LAB 23.*

*Lab 24 implements keyed list rendering — the reconciler uses `key` props to match old and new list items, enabling add, remove, and reorder operations without re-creating unchanged DOM nodes.*
