# PyX — LAB 24 — Keys and List Rendering

**Prerequisites:** Lab 23 complete. `useEffect` works with deps and cleanup.

**What this lab adds:**
- Key-based reconciliation for list children
- A to-do list example with add, remove, and verify operations
- Tests that confirm unchanged DOM nodes are preserved across list operations
- The keyed reconciliation algorithm from Lab 20 — verified in integration

**Time:** 45–60 minutes.

---

## What You Will Build

A to-do list where adding an item at the top does not re-create the existing items:

```typescript
function TodoList() {
  const [items, setItems] = useState([
    { id: 1, text: 'First' },
    { id: 2, text: 'Second' },
  ]);

  function addItem() {
    setItems([{ id: Date.now(), text: 'New' }, ...items]);
  }

  return h('div', null,
    h('button', { onClick: addItem }, 'Add'),
    h('ul', null,
      ...items.map(item =>
        h('li', { key: item.id }, item.text)  // key = stable identity
      )
    )
  );
}
```

Without keys: adding to the front causes every existing item's DOM node to be updated (position 0 changes, position 1 changes, etc.) even though their content is unchanged.

With keys: the reconciler matches `id: 1` and `id: 2` to their existing DOM nodes, recognises they are unchanged, and inserts the new item without touching the existing nodes.

---

> **Quick Check — try to answer before reading further:**
>
> 1. The reconciler's keyed algorithm builds a `Map<key, {vnode, domNode}>` for old children. Why a `Map` rather than an array for lookups?
> 2. What should happen if two sibling elements have the same key? How would you detect this during reconciliation?
> 3. What happens if a component renders a list of items *without* keys? Is it wrong, or just slower?
>
> *(Answers at the end of this lab)*

---

## Concept: The Key as a Contract

**What it is:** A `key` prop is a developer promise to the runtime: "this identifier is stable across renders." If item ID 3 is in the list today and it is in the list after a re-render, the DOM node for item ID 3 should be the same DOM node — just potentially updated.

**The runtime promise in return:** "I will not destroy your DOM nodes unnecessarily." If the key matches, the existing DOM node is reused and only its changed attributes are updated.

**When to use keys:**

Keys are required in any list where items can be added, removed, or reordered. They are not needed for static lists (a fixed number of items in a fixed order).

**What makes a good key:**

A stable, unique identifier that does not change even when the item's content changes. Database IDs are ideal. Array indices (`key: i`) are not: if you add an item at position 0, every item's index changes — keys are now meaningless.

**Watch for:** The PyX key is extracted from props in `h()` (Lab 16) and stored as `vnode.key`. The key is never passed to the component or rendered into the DOM — it is purely a runtime mechanism.

---

## Step 1 — Verify the Keyed Reconciler Works

The keyed reconciliation algorithm was written in Lab 20 (`diffKeyedChildren`). This lab verifies it with integration tests.

Create `runtime/src/keys.test.ts`:

```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import { h } from './h.js';
import { renderRoot, useState } from './hooks.js';

describe('keyed list rendering', () => {
  let container: HTMLDivElement;

  beforeEach(() => {
    container = document.createElement('div');
  });

  it('preserves DOM nodes for unchanged keyed items', () => {
    let setter!: (v: Array<{id: number; text: string}>) => void;

    renderRoot(() => {
      const [items, setItems] = useState([
        { id: 1, text: 'a' },
        { id: 2, text: 'b' },
      ]);
      setter = setItems;
      return h('ul', null,
        ...items.map(item => h('li', { key: item.id }, item.text))
      );
    }, container);

    const liItems = Array.from(container.querySelectorAll('li'));
    expect(liItems).toHaveLength(2);
    const firstLiBefore = liItems[0];

    // Add a new item at the end — first item should be the same DOM node
    setter([
      { id: 1, text: 'a' },
      { id: 2, text: 'b' },
      { id: 3, text: 'c' },
    ]);

    const firstLiAfter = container.querySelectorAll('li')[0];
    expect(firstLiAfter).toBe(firstLiBefore);  // same DOM node
    expect(container.querySelectorAll('li').length).toBe(3);
  });

  it('removes items correctly', () => {
    let setter!: (v: Array<{id: number}>) => void;

    renderRoot(() => {
      const [items, setItems] = useState([{ id: 1 }, { id: 2 }, { id: 3 }]);
      setter = setItems;
      return h('ul', null,
        ...items.map(item => h('li', { key: item.id }, `${item.id}`))
      );
    }, container);

    setter([{ id: 1 }, { id: 3 }]);  // remove id: 2
    expect(container.querySelectorAll('li').length).toBe(2);
    expect(container.textContent).toBe('13');
  });

  it('handles adding to the front', () => {
    let setter!: (v: number[]) => void;

    renderRoot(() => {
      const [items, setItems] = useState([1, 2, 3]);
      setter = setItems;
      return h('ul', null,
        ...items.map(id => h('li', { key: id }, `${id}`))
      );
    }, container);

    setter([0, 1, 2, 3]);  // add 0 at front
    expect(container.querySelectorAll('li').length).toBe(4);
    expect(container.textContent).toBe('0123');
  });
});
```

---

### SAVE AND TRY

```
> npm test
```

**Expected:** All tests including keyed list tests pass.

---

## Step 2 — Build the To-Do List Example

Create `examples/todo.pyx`:

```python
from pyx import useState

def TodoApp():
    items, set_items = useState([
        {"id": 1, "text": "Learn PyX", "done": False},
        {"id": 2, "text": "Build something", "done": False},
    ])
    next_id, set_next_id = useState(3)

    def add_item():
        new_item = {"id": next_id, "text": "New task", "done": False}
        set_items([new_item] + items)
        set_next_id(next_id + 1)

    def toggle(id):
        updated = [
            {"id": item["id"], "text": item["text"], "done": not item["done"]}
            if item["id"] == id
            else item
            for item in items
        ]
        set_items(updated)

    def remove(id):
        set_items([item for item in items if item["id"] != id])

    return (
        <div class="todo-app">
            <h1>To-Do</h1>
            <button onClick={add_item}>Add</button>
            <ul>
                {[<li key={item["id"]} class="todo-item">
                    <span>{item["text"]}</span>
                    <button onClick={lambda: toggle(item["id"])}>Toggle</button>
                    <button onClick={lambda: remove(item["id"])}>Remove</button>
                </li> for item in items]}
            </ul>
        </div>
    )
```

Compile and run:

```
> pyxc build examples/todo.pyx
```

Verify the output has `key={item.id}` in the list items and that the Vite app can load it.

---

## Challenge: Warn on Duplicate Keys

**You know:** Duplicate keys break the reconciler — two items with the same key, the reconciler only processes one. The browser shows the wrong DOM.

**Task:** Add a check to `diffKeyedChildren` in `reconciler.ts` that detects duplicate keys and emits a `console.warn`:

```
Warning: PyX: Duplicate key "3" in list. Keys must be unique among siblings.
```

Only warn in development mode (you can check `import.meta.env.DEV` in Vite — it is `true` during development and `false` in production builds).

---

<details>
<summary>▶ Show Solution</summary>

In `diffKeyedChildren`, before building the `oldByKey` map:

```typescript
if (import.meta.env.DEV) {
  const newKeys = new Set<string | number>();
  for (const child of newChildren) {
    if (isVNode(child) && child.key !== undefined) {
      if (newKeys.has(child.key)) {
        console.warn(`Warning: PyX: Duplicate key "${child.key}" in list. Keys must be unique among siblings.`);
      }
      newKeys.add(child.key);
    }
  }
}
```

**Key insight:** Development-only warnings are a standard pattern in UI libraries. React does the same. In production builds, `import.meta.env.DEV` is `false` and the entire block is dead code — tree-shaken away by the bundler. This means development has better error messages at zero production cost. The `import.meta.env` mechanism is Vite's way of exposing build-time flags; in create-react-app it is `process.env.NODE_ENV`.

</details>

---

## Final Check

| Feature | How to verify |
|---|---|
| Unchanged keyed items reuse DOM nodes | Same DOM object before and after list update |
| Remove works correctly | List shrinks; correct items remain |
| Add to front works | New item appears first; existing items unchanged |
| All tests pass | `npm test` shows no failures |
| To-do app compiles | `pyxc build examples/todo.pyx` produces JSX |

---

## Your Complete Files

### Changed files this lab

**`runtime/src/reconciler.ts`** — add `diffKeyedChildren()` alongside the existing `diffUnkeyedChildren()`. When children have `key` props, use the keyed path; otherwise fall back to positional diffing. Updated content in Steps 1–2.

**`runtime/src/reconciler.test.ts`** — updated with keyed list tests.

### Project structure at end of Lab 24

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
│       ├── hooks.ts
│       ├── hooks.test.ts
│       ├── index.ts
│       ├── main.tsx
│       ├── reconciler.ts      ← updated (keyed diff)
│       ├── reconciler.test.ts ← updated
│       ├── render.ts
│       └── render.test.ts
└── pyproject.toml
```

---

## Quick Check Answers

**1. Why a `Map` rather than an array for key lookups?**

`Map.get(key)` is O(1) — constant time regardless of how many items are in the map. Array search (`array.find(item => item.key === key)`) is O(n) — linear in the number of items. For a list with 1000 items, diffing would require 1000 × 1000 = 1,000,000 comparisons without a map, but only 1000 map lookups with one. The `Map` is the essential data structure that makes keyed reconciliation O(n) rather than O(n²).

**2. What should happen if two sibling elements have the same key?**

A warning should be emitted and the reconciler should process only one of the duplicates (typically the last one). The DOM result will be incorrect — this is expected, because the developer has broken the contract (keys must be unique among siblings). React does the same: warns in development, produces unpredictable output in production. The warning is the actionable feedback; the incorrect output is the consequence of the broken contract.

**3. What happens if a component renders a list without keys? Is it wrong or just slower?**

Slower, not wrong — for stable lists. The unkeyed reconciler compares children by position: old[0] vs new[0], old[1] vs new[1], etc. If items are added or removed, every subsequent item looks different and gets updated. For a static list (always the same items in the same order), unkeyed is fine. For any dynamic list (can add, remove, or reorder), keys are required for correctness as well as performance — without keys, a removed item from position 0 causes every subsequent item to look "changed" even if their content is identical.

---

*End of LAB 24.*

*Lab 25 is the Phase 5 review — you trace the counter component from `.pyx` source all the way through to a button click updating the DOM, naming every concept and every module involved.*
