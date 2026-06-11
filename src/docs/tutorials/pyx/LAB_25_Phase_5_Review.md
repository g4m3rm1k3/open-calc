# PyX — LAB 25 — Phase 5 Review: The Counter End-to-End

**Prerequisites:** Labs 20–24 complete. The counter increments in the browser.

**What this lab does:**
- Traces the full path from `.pyx` source to a button click updating the DOM
- Names every concept, every module, and every stage in the trace
- Tests that the complete system works end-to-end with real state
- Closes Phase 5 and prepares you for Phase 6

**Time:** 45 minutes. Most of this lab is reading and writing, not coding.

---

> **Quick Check — try to answer before reading further:**
>
> 1. `useState` stores state in a "slot array." When a component re-renders, how does `useState(0)` know whether to use the initial value `0` or the value that was stored from the previous render?
> 2. The reconciler diffs two virtual DOM trees. When a `<div>` becomes a `<p>`, what does the reconciler do — update the element or replace it entirely? Why?
> 3. The `diff()` function is described as "pure." The `apply()` function is described as "impure." What is the difference, and why does it matter for testing?
>
> *(Answers at the end of this lab)*

---

## The Full Trace

Write this trace yourself before reading the answers. For each step, name the module, the data structure, and the transformation:

```
1. Developer writes counter.pyx
2. Developer runs: pyxc build counter.pyx
3. _____ (module) reads counter.pyx and outputs _____
4. _____ (module) parses the output and produces _____
5. _____ (module) walks the AST and produces _____
6. _____ (module) walks the IR and writes _____
7. Vite starts. Developer opens localhost:5173.
8. Browser downloads counter.jsx. Vite compiled JSX to _____.
9. main.jsx calls renderRoot(Counter, container).
10. renderRoot calls Counter({}).
11. Counter calls useState(0). _____ (mechanism) allocates slot 0 with value 0.
12. Counter returns _____ (data structure).
13. renderRoot calls _____ (function) with the VNode and the container.
14. _____ (function) recursively creates _____ (DOM nodes).
15. The browser displays "Count: 0" and a "+" button.
16. User clicks "+".
17. The onClick handler calls increment().
18. increment() calls setCount(count + 1) = setCount(1).
19. setCount writes _____ to slot 0 and calls _____ (function).
20. The component renders again. useState(0) returns _____ from slot 0.
21. Counter returns a new VNode with "Count: 1".
22. _____ (function) diffs the old VNode against the new VNode.
23. The diff produces _____ (data structure).
24. _____ (function) applies the patches.
25. Only _____ (DOM nodes) change. The div and button are untouched.
```

---

## Reference Answers

| Step | Answer |
|---|---|
| 3 | `preprocessor.py` reads counter.pyx, outputs valid Python with `h()` calls |
| 4 | `ast.parse` (in `parser_py.py`) parses the Python, produces `ast.Module` |
| 5 | `Transformer` walks the AST, produces `IRModule` |
| 6 | `CodeGenerator` walks the IR, writes `counter.jsx` |
| 8 | Vite compiled JSX to JavaScript function calls using `h()` as the factory |
| 11 | The hook slot array in `hooks.ts` allocates slot 0 with value 0 |
| 12 | `VNode` object: `{ type: 'div', props: {className: 'counter'}, children: [...] }` |
| 13 | `render()` (in `render.ts`) with the VNode and the container |
| 14 | `createDOMNode()` recursively creates `HTMLElement` and `Text` nodes |
| 19 | setCount writes `1` to slot 0 and calls `instance.rerender()` |
| 20 | useState(0) returns `[1, setCount]` (slot 0 now holds 1) |
| 22 | `diff()` (in `reconciler.ts`) diffs the old VNode against the new VNode |
| 23 | A list of `Patch` objects (specifically: `SET_TEXT` for the count text node) |
| 24 | `applyPatches()` (in `apply.ts`) applies the patches |
| 25 | Only the text node inside `<p>` changes ("Count: 0" → "Count: 1") |

---

## Step 1 — Write the End-to-End Browser Test

Create `runtime/src/e2e.test.ts`:

```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import { h } from './h.js';
import { renderRoot, useState, useEffect } from './hooks.js';

describe('counter end-to-end', () => {
  let container: HTMLDivElement;

  beforeEach(() => {
    container = document.createElement('div');
  });

  it('renders the initial count', () => {
    renderRoot(() => {
      const [count] = useState(0);
      return h('div', null,
        h('p', null, `Count: ${count}`),
        h('button', { onClick: () => {} }, '+')
      );
    }, container);
    expect(container.querySelector('p')!.textContent).toBe('Count: 0');
  });

  it('increments on click', () => {
    renderRoot(() => {
      const [count, setCount] = useState(0);
      return h('div', null,
        h('p', null, `Count: ${count}`),
        h('button', { onClick: () => setCount(count + 1) }, '+')
      );
    }, container);

    expect(container.querySelector('p')!.textContent).toBe('Count: 0');

    container.querySelector('button')!.click();
    expect(container.querySelector('p')!.textContent).toBe('Count: 1');

    container.querySelector('button')!.click();
    expect(container.querySelector('p')!.textContent).toBe('Count: 2');
  });

  it('text node updates without replacing surrounding elements', () => {
    renderRoot(() => {
      const [count, setCount] = useState(0);
      return h('div', null,
        h('p', null, `Count: ${count}`),
        h('button', { onClick: () => setCount(count + 1) }, '+')
      );
    }, container);

    const pBefore = container.querySelector('p')!;
    const buttonBefore = container.querySelector('button')!;

    container.querySelector('button')!.click();

    expect(container.querySelector('p')).toBe(pBefore);      // same node
    expect(container.querySelector('button')).toBe(buttonBefore);  // same node
    expect(container.querySelector('p')!.textContent).toBe('Count: 1');
  });

  it('useEffect fires after state change', () => {
    const log: string[] = [];
    let setter!: (v: number) => void;

    renderRoot(() => {
      const [count, setCount] = useState(0);
      setter = setCount;
      useEffect(() => { log.push(`effect:${count}`); }, [count]);
      return h('div', null);
    }, container);

    expect(log).toEqual(['effect:0']);
    setter(1);
    expect(log).toEqual(['effect:0', 'effect:1']);
  });
});
```

---

### SAVE AND TRY

```
> npm test
```

**Expected:** All tests pass, including the end-to-end tests.

---

## Phase 5 Complete — What the Runtime Can Do

| Capability | Lab |
|---|---|
| `h()` creates virtual nodes | 16 |
| `render()` creates real DOM | 17 |
| Components call with props | 17-18 |
| Multi-level tree rendering | 19 |
| Reconciler diffs two trees | 20 |
| Patches apply to the DOM | 21 |
| `useState` stores and updates state | 22 |
| `useEffect` runs side effects | 23 |
| Keys preserve DOM nodes in lists | 24 |

**The runtime is complete.** The pyx-runtime stub can be removed from the Vite app.

---

## Update the Runtime Package for Export

Update `runtime/package.json` to add a name and version:

```json
{
  "name": "pyx-runtime",
  "version": "0.1.0",
  "main": "src/index.ts",
  ...
}
```

The Vite alias in `app/vite.config.js` now works against the fully functional runtime.

---

## Challenge: Name Every Pattern

Look at the PyX codebase. For each of these design patterns, name where it appears:

| Pattern | Where in PyX |
|---|---|
| Finite state machine | |
| Recursive descent parsing | |
| Visitor pattern | |
| Pipeline pattern | |
| Observer pattern | |
| Virtual machine | |
| Tree diffing | |
| Pure function | |

Write your answers before checking:

<details>
<summary>▶ Answers</summary>

| Pattern | Where in PyX |
|---|---|
| Finite state machine | `lexer.py` — three states (IN_PYTHON, IN_ELEMENT, IN_EXPRESSION), transitions on characters |
| Recursive descent parsing | `parser.py` — `_parse_element` calls `_parse_children` which calls `_parse_element` |
| Visitor pattern | `transformer.py` — `transform()` dispatcher; `codegen.py` — `_gen_statement()` dispatcher; `codegen_preprocessor.py` — `_generate_node()` |
| Pipeline pattern | `cli.py` — preprocess → parse → transform → codegen, each stage has one input and one output type |
| Observer pattern | `hooks.ts` — `instance.rerender` is the observer; `setter()` is the event that triggers it |
| Virtual machine | `hooks.ts` — the slot array is memory; `_currentSlotIndex` is the instruction pointer; each hook call is an "instruction" that reads/writes a slot |
| Tree diffing | `reconciler.ts` — `diff()` compares two VNode trees |
| Pure function | `diff()` in reconciler, `generate()` in code generator, `preprocess()` in preprocessor — all take input, produce output, no side effects |

</details>

---

## Final Check

| Feature | How to verify |
|---|---|
| Counter increments in browser | Click "+" → count updates |
| Text node updates without DOM replacement | Same `<p>` node before and after click |
| All e2e tests pass | `npm test` shows no failures |
| Full pipeline trace written | You can explain all 25 steps |

---

## Your Complete Files

No new files this lab. This is a review lab — no code changes.

### Project structure at end of Lab 25

```
pyx/
├── .venv/
├── compiler/
│   ├── __init__.py
│   ├── cli.py
│   ├── codegen.py
│   ├── codegen_preprocessor.py
│   ├── errors.py
│   ├── ir.py
│   ├── lexer.py
│   ├── nodes.py
│   ├── parser.py
│   ├── parser_py.py
│   ├── preprocessor.py
│   ├── sourcemap.py
│   ├── tokens.py
│   ├── transformer.py
│   └── tests/
│       ├── (all test files from Labs 01–15)
├── runtime/
│   ├── index.html
│   ├── package.json
│   ├── vite.config.ts
│   └── src/
│       ├── debug.ts
│       ├── h.ts  /  h.test.ts
│       ├── hooks.ts  /  hooks.test.ts
│       ├── index.ts
│       ├── main.tsx
│       ├── reconciler.ts  /  reconciler.test.ts
│       └── render.ts  /  render.test.ts
├── examples/
│   ├── counter.pyx  /  counter.jsx  /  counter.jsx.map
│   └── hello.pyx
└── pyproject.toml
```

---

## Quick Check Answers

**1. How does `useState(0)` know whether to use `0` or the stored value?**

The slot array stores values across renders. On the first render, the slot at `_currentSlotIndex` is empty (undefined), so `useState` stores the initial value `0` and returns it. On every subsequent render, the slot already has a value — `useState` returns that stored value instead of `0`. The initial value argument is only used when the slot is first created.

**2. When `<div>` becomes `<p>`, does the reconciler update or replace?**

Replace entirely. Heuristic 1 of the O(n) algorithm says: nodes of different types produce different trees — replace the whole subtree. This means the `<div>` DOM node and all its children are removed, and a fresh `<p>` node and its children are created from scratch. This is correct behaviour: changing the container element type means the entire subtree needs new DOM nodes anyway.

**3. What is the difference between `diff()` (pure) and `apply()` (impure)?**

`diff()` takes VNodes and returns a patch list — same inputs always produce the same output, no side effects. You can unit-test it without a browser by just checking the patch list. `apply()` takes a patch list and mutates the real DOM — it reads and writes to `document`, which is a shared global state. You cannot meaningfully test `apply()` without a browser environment. Separating them means the complex algorithm (`diff`) is independently testable without browser setup.

---

*End of LAB 25.*

*Phase 6 starts in Lab 26 with the to-do list application — a complete multi-component PyX app that exercises all the compiler and runtime features built in Phases 1-5.*
