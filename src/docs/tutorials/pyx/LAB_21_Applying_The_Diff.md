# PyX — LAB 21 — Applying the Diff to the DOM

**Prerequisites:** Lab 20 complete. Reconciler produces correct patch lists.

**What this lab adds:**
- `apply.ts` — applies a list of patches to the real DOM
- Integration: `update(oldVNode, newVNode, container)` diffing + applying in one call
- Event listener cleanup when nodes are replaced or removed
- Tests that verify DOM state after applying patches

**Time:** 45–60 minutes.

---

## What You Will Build

```typescript
// Instead of re-rendering the whole app on every state change:
render(newTree, container); // deletes and recreates everything

// Use the reconciler + apply:
update(oldTree, newTree, container); // only changes what changed
```

After this lab, `update` is the function `useState`'s setter will call on every state change.

---

> **Quick Check — try to answer before reading further:**
>
> 1. When a node is REPLACED, the old node's event listeners should be removed to avoid memory leaks. Why does an event listener on a removed DOM node cause a memory leak?
> 2. `REORDER` moves a node to a different position. The DOM method for this is `insertBefore(node, referenceNode)`. What happens if `referenceNode` is `null`?
> 3. The reconciler produces patches but does not apply them. `apply.ts` applies patches but does not produce them. Why is this separation valuable?
>
> *(Answers at the end of this lab)*

---

## Concept: DOM Mutation Methods

The patch operations map directly to DOM mutation methods:

| Patch type | DOM operation |
|---|---|
| `SET_TEXT` | `node.textContent = text` |
| `SET_PROP className` | `element.className = value` |
| `SET_PROP onClick` | `element.addEventListener('click', handler)` |
| `REMOVE_PROP` | `element.removeAttribute(key)` or `removeEventListener` |
| `REPLACE_NODE` | `parent.replaceChild(newNode, oldNode)` |
| `INSERT_NODE` | `parent.insertBefore(newNode, before)` (before=null appends) |
| `REMOVE_NODE` | `parent.removeChild(node)` |
| `REORDER` | `parent.insertBefore(node, before)` |

---

## Step 1 — Write `apply.ts`

Create `runtime/src/apply.ts`:

```typescript
import type { Patch } from './patches.js';

/**
 * Apply a list of patches to the real DOM.
 */
export function applyPatches(patches: Patch[]): void {
  for (const patch of patches) {
    applyPatch(patch);
  }
}

function applyPatch(patch: Patch): void {
  switch (patch.type) {
    case 'SET_TEXT':
      patch.node.textContent = patch.text;
      break;

    case 'SET_PROP':
      setPropOnElement(patch.element as HTMLElement, patch.key, patch.value);
      break;

    case 'REMOVE_PROP':
      removePropFromElement(patch.element as HTMLElement, patch.key);
      break;

    case 'REPLACE_NODE':
      patch.parent.replaceChild(patch.newNode, patch.oldNode);
      cleanupNode(patch.oldNode);
      break;

    case 'INSERT_NODE':
      patch.parent.insertBefore(patch.newNode, patch.before);
      break;

    case 'REMOVE_NODE':
      patch.parent.removeChild(patch.node);
      cleanupNode(patch.node);
      break;

    case 'REORDER':
      patch.parent.insertBefore(patch.node, patch.before);
      break;
  }
}

function setPropOnElement(element: HTMLElement, key: string, value: unknown): void {
  if (key === 'className') {
    element.className = value as string;
  } else if (key === 'style' && typeof value === 'object' && value !== null) {
    for (const [prop, val] of Object.entries(value)) {
      (element.style as any)[prop] = val;
    }
  } else if (key.startsWith('on') && typeof value === 'function') {
    // Remove old listener if there was one, then add new
    const eventName = key.slice(2).toLowerCase();
    const oldHandler = (element as any)[`__${key}`];
    if (oldHandler) {
      element.removeEventListener(eventName, oldHandler);
    }
    element.addEventListener(eventName, value as EventListener);
    (element as any)[`__${key}`] = value;  // Store for future cleanup
  } else {
    element.setAttribute(key, String(value));
  }
}

function removePropFromElement(element: HTMLElement, key: string): void {
  if (key === 'className') {
    element.className = '';
  } else if (key.startsWith('on')) {
    const eventName = key.slice(2).toLowerCase();
    const oldHandler = (element as any)[`__${key}`];
    if (oldHandler) {
      element.removeEventListener(eventName, oldHandler);
      delete (element as any)[`__${key}`];
    }
  } else {
    element.removeAttribute(key);
  }
}

/**
 * Remove event listeners from a node being removed from the DOM.
 * Prevents memory leaks.
 */
function cleanupNode(node: Node): void {
  if (node.nodeType !== Node.ELEMENT_NODE) return;

  const element = node as HTMLElement;

  // Remove all stored event handlers
  for (const key of Object.keys(element)) {
    if (key.startsWith('__on')) {
      const eventName = key.slice(4);
      element.removeEventListener(eventName, (element as any)[key]);
    }
  }

  // Recursively clean up children
  for (const child of Array.from(element.childNodes)) {
    cleanupNode(child);
  }
}
```

---

## Step 2 — Write the `update` Function

Create `runtime/src/update.ts`:

```typescript
import { diff } from './reconciler.js';
import { applyPatches } from './apply.js';
import { render } from './render.js';
import type { VNode } from './types.js';

/**
 * Update the DOM by diffing oldVNode against newVNode and applying patches.
 *
 * If no oldVNode is provided (first render), falls back to render().
 */
export function update(
  oldVNode: VNode | null,
  newVNode: VNode,
  container: Element,
): void {
  if (!oldVNode || !container.firstChild) {
    render(newVNode, container);
    return;
  }

  const patches = diff(oldVNode, newVNode, container.firstChild, container);
  applyPatches(patches);
}
```

---

## Step 3 — Tests

Create `runtime/src/apply.test.ts`:

```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import { h } from './h.js';
import { render } from './render.js';
import { update } from './update.js';

describe('update (diff + apply)', () => {
  let container: HTMLDivElement;

  beforeEach(() => {
    container = document.createElement('div');
  });

  it('updates text content without recreating the element', () => {
    render(h('p', null, 'old'), container);
    const pBefore = container.querySelector('p')!;
    update(h('p', null, 'old'), h('p', null, 'new'), container);
    const pAfter = container.querySelector('p')!;
    expect(pAfter.textContent).toBe('new');
    expect(pBefore).toBe(pAfter); // same DOM node — not replaced
  });

  it('updates className', () => {
    render(h('div', { className: 'old' }), container);
    update(h('div', { className: 'old' }), h('div', { className: 'new' }), container);
    expect(container.querySelector('div')!.className).toBe('new');
  });

  it('replaces element when type changes', () => {
    render(h('div', null), container);
    const divBefore = container.querySelector('div')!;
    update(h('div', null), h('p', null), container);
    expect(container.querySelector('div')).toBeNull();
    expect(container.querySelector('p')).not.toBeNull();
  });

  it('adds a new child', () => {
    render(h('ul', null, h('li', null, 'a')), container);
    update(
      h('ul', null, h('li', null, 'a')),
      h('ul', null, h('li', null, 'a'), h('li', null, 'b')),
      container,
    );
    expect(container.querySelectorAll('li').length).toBe(2);
  });

  it('removes a child', () => {
    render(h('ul', null, h('li', null, 'a'), h('li', null, 'b')), container);
    update(
      h('ul', null, h('li', null, 'a'), h('li', null, 'b')),
      h('ul', null, h('li', null, 'a')),
      container,
    );
    expect(container.querySelectorAll('li').length).toBe(1);
  });

  it('calls event handler after update', () => {
    let count = 0;
    render(h('button', { onClick: () => count++ }, 'click'), container);
    update(
      h('button', { onClick: () => count++ }, 'click'),
      h('button', { onClick: () => count += 10 }, 'click'),
      container,
    );
    container.querySelector('button')!.click();
    expect(count).toBe(10); // new handler, not old
  });
});
```

---

### SAVE AND TRY

```
> npm test
```

**Expected:** All tests pass including the apply tests.

---

## Challenge: Prevent Memory Leaks with a Listener Registry

**You know:** The current cleanup uses `__onX` properties stored directly on the element. This works but is not clean — you are storing runtime metadata on the DOM node.

**Task:** Create a `WeakMap<Element, Map<string, EventListener>>` that maps each element to its registered event listeners. Update `setPropOnElement` and `removePropFromElement` to use this registry instead of `__onX` properties.

Using `WeakMap` means: when the element is garbage collected (removed from the DOM and no longer referenced), its listener registry is automatically cleaned up too — no memory leak even without explicit cleanup.

---

<details>
<summary>▶ Show Solution</summary>

```typescript
const listenerRegistry = new WeakMap<Element, Map<string, EventListener>>();

function getListeners(element: Element): Map<string, EventListener> {
  if (!listenerRegistry.has(element)) {
    listenerRegistry.set(element, new Map());
  }
  return listenerRegistry.get(element)!;
}

function setPropOnElement(element: HTMLElement, key: string, value: unknown): void {
  if (key.startsWith('on') && typeof value === 'function') {
    const eventName = key.slice(2).toLowerCase();
    const listeners = getListeners(element);
    const old = listeners.get(eventName);
    if (old) element.removeEventListener(eventName, old);
    element.addEventListener(eventName, value as EventListener);
    listeners.set(eventName, value as EventListener);
  }
  // ... rest unchanged
}
```

**Key insight:** `WeakMap` is one of TypeScript/JavaScript's most important data structures for memory management. A regular `Map` holds strong references to its keys — as long as the Map exists, its keys cannot be garbage collected. A `WeakMap` holds *weak* references — if the key (the DOM element) is no longer reachable from anywhere else, the garbage collector can free it even though it is in the WeakMap. This pattern appears in every production React-like runtime.

</details>

---

## Final Check

| Feature | How to verify |
|---|---|
| `update` changes text without replacing node | Same DOM node object before and after text update |
| `update` replaces node on type change | Old tag absent, new tag present |
| Event handler updates to new function | Click calls new handler, not old |
| All tests pass | `npm test` shows no failures |

---

## Your Complete Files

### New / changed files this lab

**`runtime/src/reconciler.ts`** — updated with `apply(patches, container)` function and full `renderRoot` integration (changes in Steps 1–3).

**`runtime/src/reconciler.test.ts`** — updated with apply tests.

**`runtime/src/render.ts`** — updated `renderRoot` to call `diff` + `apply` on re-render instead of full DOM replacement.

### Project structure at end of Lab 21

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
│       ├── index.ts
│       ├── main.tsx
│       ├── reconciler.ts      ← updated (apply added)
│       ├── reconciler.test.ts ← updated
│       ├── render.ts          ← updated (uses diff+apply)
│       └── render.test.ts
└── pyproject.toml
```

---

## Quick Check Answers

**1. Why does an event listener on a removed DOM node cause a memory leak?**

An event listener is a function reference. The DOM element holds a reference to the listener (via `addEventListener`), and if the listener is a closure, it holds references to the variables it closes over. Even after you `removeChild` the element from the DOM, the element object remains in memory as long as any reference to it exists — including the listener registry inside the browser. In older browsers and some frameworks, removed elements with event listeners stayed in memory indefinitely. Modern browsers garbage-collect them, but it is still a best practice to remove listeners explicitly when removing elements.

**2. What happens when `insertBefore(node, null)` is called?**

`insertBefore(node, null)` appends the node to the end of the parent's children — it is equivalent to `appendChild(node)`. The MDN specification states: "If the second argument is null, the new node is inserted at the end of the list of child nodes." This is how `INSERT_NODE` patches with `before: null` append new children.

**3. Why is separating diff from apply valuable?**

Testing. The `diff` function is pure — it takes VNodes and a DOM snapshot and returns a data structure (the patch list). You can unit-test it by checking the patch list without touching a real DOM. The `apply` function is impure — it mutates the DOM — but it is also so simple (a switch over patch types) that the real tests are the integration tests in `apply.test.ts`. Separating them means the complex logic (the diff algorithm) is independently verifiable without a browser environment.

---

*End of LAB 21.*

*Lab 22 implements `useState` — the hook that stores component state and triggers re-rendering when the state changes. After Lab 22, the counter component actually counts.*
