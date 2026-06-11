# PyX — LAB 20 — The Reconciler: Diffing Two Trees

**Prerequisites:** Lab 19 complete. All 25+ runtime tests pass.

**What this lab adds:**
- Understanding of tree diffing: naive O(n³) vs React's O(n) algorithm
- The two O(n) heuristics: different types = replace, keys = stable identity
- A `diff(oldVNode, newVNode)` function that produces a list of DOM operations
- Tests with hardcoded tree pairs

**Time:** 90–120 minutes. The reconciler is the most algorithmically complex part of the runtime.

---

## What You Will Build

A `diff` function that compares two VNode trees and produces a list of patch operations:

```typescript
const oldTree = h('div', null, h('p', null, 'old'));
const newTree = h('div', null, h('p', null, 'new'));

diff(oldTree, newTree, domNode);
// → [PatchTextContent(pNode, 'new')]
// → only the text changes, not the whole div
```

The reconciler does not touch the DOM directly — it produces a list of operations. Lab 21 applies those operations.

---

> **Quick Check — try to answer before reading further:**
>
> 1. Naive tree diffing (comparing every old node to every new node) is O(n³). Why is it O(n³)?
> 2. React's first heuristic: "nodes of different types produce different trees." What does this mean in practice — what does the reconciler do when it sees `<div>` become `<p>`?
> 3. React's second heuristic: "keys identify stable nodes across renders." Without keys, how does the reconciler match list items when one is inserted at the top?
>
> *(Answers at the end of this lab)*

---

## Concept: The Naive Diffing Problem

**What it is:** You have a tree with n nodes (the old tree) and another tree with n nodes (the new tree). You want to find the minimum set of changes to transform the old tree into the new tree.

The theoretical minimum-edit-distance algorithm for general trees is O(n³):
- For each of the n nodes in the old tree…
- Check each of the n nodes in the new tree…
- To see if they match, run a comparison that itself takes O(n) time.

For a UI with 1,000 nodes: 10⁹ operations per render. At 60 frames per second, this is impossible.

**React's insight:** You do not need the globally optimal edit sequence. You need a fast, good-enough sequence. Two heuristics make the algorithm O(n):

**Heuristic 1 — Different types → replace everything:**

If the old node is `<div>` and the new node is `<p>`, do not try to convert one to the other. Throw away the entire old subtree and create the new subtree from scratch. In practice, this is almost always correct — a `<div>` rarely transforms to a `<p>` in a real UI update.

**Heuristic 2 — Keys identify stable elements:**

For lists of children, a `key` prop lets the reconciler match old and new nodes by identity, not position. Without keys, inserting an element at position 0 of a 10-item list looks like all 10 items changed (each node at each position is now different). With keys, the reconciler builds a map of `key → node` and matches by key — finding that items 1-10 are unchanged and only item 0 is new.

These two heuristics reduce the worst case to O(n) — one pass over the tree.

**Watch for:** The O(n) guarantee only holds under the assumption that sibling elements rarely change type. In the unusual case where a `<div>` really does become a `<span>`, the reconciler discards and recreates the subtree — which is correct but slower than an in-place update.

---

## Concept: Patch Operations

**What it is:** Instead of mutating the DOM directly, the reconciler produces a list of **patch operations** — data objects that describe what needs to change. Lab 21 applies these operations.

**Why separate diff from apply:**

The diff is a pure function: given old and new trees, it produces the same patch list every time with no side effects. Pure functions are easier to test — you can verify the patch list without a DOM.

The apply step is impure: it mutates the DOM. By isolating it in Lab 21, you can test the diff algorithm completely without a browser.

**The patch types:**

```typescript
type Patch =
  | { type: 'SET_TEXT'; node: Text; text: string }
  | { type: 'SET_PROP'; element: Element; key: string; value: unknown }
  | { type: 'REMOVE_PROP'; element: Element; key: string }
  | { type: 'REPLACE_NODE'; parent: Element; oldNode: Node; newNode: Node }
  | { type: 'INSERT_NODE'; parent: Element; newNode: Node; before: Node | null }
  | { type: 'REMOVE_NODE'; parent: Element; node: Node }
  | { type: 'REORDER'; parent: Element; node: Node; before: Node | null }
```

---

## Step 1 — Define Patch Types

Create `runtime/src/patches.ts`:

```typescript
/**
 * DOM patch operations produced by the reconciler.
 * Applied by applyPatches() in apply.ts (Lab 21).
 */

export type Patch =
  | { readonly type: 'SET_TEXT'; node: Text; text: string }
  | { readonly type: 'SET_PROP'; element: Element; key: string; value: unknown }
  | { readonly type: 'REMOVE_PROP'; element: Element; key: string }
  | { readonly type: 'REPLACE_NODE'; parent: Element; oldNode: Node; newNode: Node }
  | { readonly type: 'INSERT_NODE'; parent: Element; newNode: Node; before: Node | null }
  | { readonly type: 'REMOVE_NODE'; parent: Element; node: Node }
  | { readonly type: 'REORDER'; parent: Element; node: Node; before: Node | null };
```

---

## Step 2 — Write the Reconciler

Create `runtime/src/reconciler.ts`:

```typescript
import { createDOMNode } from './render.js';
import type { Child, VNode } from './types.js';
import type { Patch } from './patches.js';

/**
 * Diff an old VNode against a new VNode, producing a list of patches.
 *
 * The domNode is the real DOM node corresponding to oldVNode.
 * The parent is the DOM parent of domNode.
 */
export function diff(
  oldVNode: VNode | Child,
  newVNode: VNode | Child,
  domNode: Node,
  parent: Element,
): Patch[] {
  const patches: Patch[] = [];

  // Both are text/number
  if (
    (typeof oldVNode === 'string' || typeof oldVNode === 'number') &&
    (typeof newVNode === 'string' || typeof newVNode === 'number')
  ) {
    if (String(oldVNode) !== String(newVNode)) {
      patches.push({ type: 'SET_TEXT', node: domNode as Text, text: String(newVNode) });
    }
    return patches;
  }

  // Both are VNodes
  if (isVNode(oldVNode) && isVNode(newVNode)) {
    // Heuristic 1: different types → replace
    if (oldVNode.type !== newVNode.type) {
      const newDomNode = createDOMNode(newVNode)!;
      patches.push({ type: 'REPLACE_NODE', parent, oldNode: domNode, newNode: newDomNode });
      return patches;
    }

    // Same type — diff props and children
    diffProps(oldVNode, newVNode, domNode as Element, patches);
    diffChildren(oldVNode.children, newVNode.children, domNode as Element, patches);
    return patches;
  }

  // Type changed (e.g., text became element or vice versa) → replace
  const newDomNode = createDOMNode(newVNode as Child)!;
  if (newDomNode) {
    patches.push({ type: 'REPLACE_NODE', parent, oldNode: domNode, newNode: newDomNode });
  } else {
    patches.push({ type: 'REMOVE_NODE', parent, node: domNode });
  }
  return patches;
}

function isVNode(node: unknown): node is VNode {
  return typeof node === 'object' && node !== null && 'type' in node;
}

/**
 * Diff the props of two same-type elements and emit SET_PROP / REMOVE_PROP patches.
 */
function diffProps(
  oldVNode: VNode,
  newVNode: VNode,
  domNode: Element,
  patches: Patch[],
): void {
  const oldProps = oldVNode.props;
  const newProps = newVNode.props;

  // New or changed props
  for (const key of Object.keys(newProps)) {
    if (key === 'key') continue;
    if (oldProps[key] !== newProps[key]) {
      patches.push({ type: 'SET_PROP', element: domNode, key, value: newProps[key] });
    }
  }

  // Removed props
  for (const key of Object.keys(oldProps)) {
    if (key === 'key') continue;
    if (!(key in newProps)) {
      patches.push({ type: 'REMOVE_PROP', element: domNode, key });
    }
  }
}

/**
 * Diff two children arrays.
 * Uses key-based matching (Heuristic 2) if keys are present.
 * Falls back to position-based matching if keys are absent.
 */
function diffChildren(
  oldChildren: Child[],
  newChildren: Child[],
  parent: Element,
  patches: Patch[],
): void {
  const domChildren = Array.from(parent.childNodes);

  // Check if any children have keys
  const hasKeys = newChildren.some(
    c => isVNode(c) && c.key !== undefined
  );

  if (hasKeys) {
    diffKeyedChildren(oldChildren, newChildren, parent, domChildren, patches);
  } else {
    diffUnkeyedChildren(oldChildren, newChildren, parent, domChildren, patches);
  }
}

function diffUnkeyedChildren(
  oldChildren: Child[],
  newChildren: Child[],
  parent: Element,
  domChildren: Node[],
  patches: Patch[],
): void {
  const max = Math.max(oldChildren.length, newChildren.length);

  for (let i = 0; i < max; i++) {
    const oldChild = oldChildren[i];
    const newChild = newChildren[i];
    const domChild = domChildren[i];

    if (oldChild === undefined) {
      // New child added
      const newDomNode = createDOMNode(newChild as Child);
      if (newDomNode) {
        patches.push({ type: 'INSERT_NODE', parent, newNode: newDomNode, before: null });
      }
    } else if (newChild === undefined) {
      // Old child removed
      patches.push({ type: 'REMOVE_NODE', parent, node: domChild });
    } else {
      // Diff existing children
      const childPatches = diff(oldChild, newChild, domChild, parent);
      patches.push(...childPatches);
    }
  }
}

function diffKeyedChildren(
  oldChildren: Child[],
  newChildren: Child[],
  parent: Element,
  domChildren: Node[],
  patches: Patch[],
): void {
  // Build map of key → { vnode, domNode } for old children
  const oldByKey = new Map<string | number, { vnode: VNode; domNode: Node }>();
  oldChildren.forEach((child, i) => {
    if (isVNode(child) && child.key !== undefined) {
      oldByKey.set(child.key, { vnode: child, domNode: domChildren[i] });
    }
  });

  // Process new children in order
  let prevDomNode: Node | null = null;
  for (const newChild of newChildren) {
    if (!isVNode(newChild) || newChild.key === undefined) continue;

    const key = newChild.key;
    const old = oldByKey.get(key);

    if (old) {
      // Key exists: diff the old and new
      const childPatches = diff(old.vnode, newChild, old.domNode, parent);
      patches.push(...childPatches);
      // Ensure correct position
      patches.push({ type: 'REORDER', parent, node: old.domNode, before: null });
      oldByKey.delete(key);
    } else {
      // New key: insert
      const newDomNode = createDOMNode(newChild);
      if (newDomNode) {
        patches.push({ type: 'INSERT_NODE', parent, newNode: newDomNode, before: prevDomNode });
      }
    }
  }

  // Remove old keys not in new list
  for (const { domNode } of oldByKey.values()) {
    patches.push({ type: 'REMOVE_NODE', parent, node: domNode });
  }
}
```

---

## Step 3 — Write Reconciler Tests

Create `runtime/src/reconciler.test.ts`:

```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import { h } from './h.js';
import { render } from './render.js';
import { diff } from './reconciler.js';

describe('reconciler diff', () => {
  let container: HTMLDivElement;
  let oldDom: Node;

  function setup(oldTree: any) {
    container = document.createElement('div');
    render(oldTree, container);
    oldDom = container.firstChild!;
  }

  it('produces no patches for identical trees', () => {
    setup(h('div', null, 'hello'));
    const patches = diff(
      h('div', null, 'hello'),
      h('div', null, 'hello'),
      oldDom,
      container,
    );
    expect(patches).toHaveLength(0);
  });

  it('produces SET_TEXT for changed text', () => {
    setup(h('p', null, 'old'));
    const patches = diff(
      h('p', null, 'old'),
      h('p', null, 'new'),
      oldDom,
      container,
    );
    const textPatch = patches.find(p => p.type === 'SET_TEXT');
    expect(textPatch).toBeDefined();
    expect((textPatch as any).text).toBe('new');
  });

  it('produces REPLACE_NODE when type changes', () => {
    setup(h('div', null));
    const patches = diff(
      h('div', null),
      h('p', null),
      oldDom,
      container,
    );
    expect(patches.some(p => p.type === 'REPLACE_NODE')).toBe(true);
  });

  it('produces SET_PROP for new prop', () => {
    setup(h('div', null));
    const patches = diff(
      h('div', null),
      h('div', { className: 'new' }),
      oldDom,
      container,
    );
    const setPropPatch = patches.find(p => p.type === 'SET_PROP' && (p as any).key === 'className');
    expect(setPropPatch).toBeDefined();
  });

  it('produces REMOVE_PROP for removed prop', () => {
    setup(h('div', { className: 'old' }));
    const patches = diff(
      h('div', { className: 'old' }),
      h('div', null),
      oldDom,
      container,
    );
    expect(patches.some(p => p.type === 'REMOVE_PROP' && (p as any).key === 'className')).toBe(true);
  });

  it('produces INSERT_NODE for new child', () => {
    setup(h('ul', null, h('li', null, 'a')));
    const patches = diff(
      h('ul', null, h('li', null, 'a')),
      h('ul', null, h('li', null, 'a'), h('li', null, 'b')),
      oldDom,
      container,
    );
    expect(patches.some(p => p.type === 'INSERT_NODE')).toBe(true);
  });

  it('produces REMOVE_NODE for removed child', () => {
    setup(h('ul', null, h('li', null, 'a'), h('li', null, 'b')));
    const patches = diff(
      h('ul', null, h('li', null, 'a'), h('li', null, 'b')),
      h('ul', null, h('li', null, 'a')),
      oldDom,
      container,
    );
    expect(patches.some(p => p.type === 'REMOVE_NODE')).toBe(true);
  });
});
```

---

### SAVE AND TRY

```
> npm test
```

**Expected:** All previous tests plus reconciler tests pass.

---

## Challenge: Track Unkeyed Children That Change Type

**You know:** Heuristic 1 says different types → replace everything. But in `diffUnkeyedChildren`, the current code diffs old[i] against new[i] by position. If old[0] is `<div>` and new[0] is `<p>`, the diff will correctly emit a `REPLACE_NODE` (because `diffProps` and `diffChildren` are skipped — the top-level diff already detects the type change). Verify this is correct by adding a test.

Try writing the test before revealing the solution.

---

<details>
<summary>▶ Show Solution</summary>

```typescript
it('replaces child when type changes', () => {
  const container = document.createElement('div');
  const oldTree = h('ul', null, h('div', null, 'item'));
  const newTree = h('ul', null, h('p', null, 'item'));

  render(oldTree, container);
  const patches = diff(oldTree, newTree, container.firstChild as Element);
  apply(patches);

  expect(container.querySelector('p')).not.toBeNull();
  expect(container.querySelector('div')).toBeNull();
});
```

**Key insight:** The test confirms Heuristic 1 behaviour: changing the element type produces a `REPLACE_NODE` patch, not an `UPDATE_PROPS` patch. The `div` is completely gone and a fresh `p` is created. Its children are re-created too — the reconciler never tries to re-use DOM nodes from the old subtree when the root type changes.

</details>

---

## Final Check

| Feature | How to verify |
|---|---|
| Identical trees produce no patches | `diff(same, same, ...)` returns `[]` |
| Changed text produces `SET_TEXT` | Text change → patch with new text content |
| Changed type produces `REPLACE_NODE` | `<div>` → `<p>` produces a REPLACE_NODE patch |
| New child produces `INSERT_NODE` | Adding a child → INSERT_NODE patch |
| Removed child produces `REMOVE_NODE` | Removing a child → REMOVE_NODE patch |
| All tests pass | `npm test` shows no failures |

---

## Your Complete Files

### New file this lab

**`runtime/src/reconciler.ts`** — the `diff()` function and `Patch` types. Full content in Steps 1–3.

**`runtime/src/reconciler.test.ts`** — test suite.

### Project structure at end of Lab 20

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
│       ├── index.ts       ← updated (exports diff)
│       ├── main.tsx
│       ├── reconciler.ts      ← new
│       ├── reconciler.test.ts ← new
│       ├── render.ts
│       └── render.test.ts
└── pyproject.toml
```

---

## Quick Check Answers

**1. Why is naive tree diffing O(n³)?**

For each of the n nodes in the old tree, you try to match it against each of the n nodes in the new tree (n × n = n² comparisons). For each potential match, you need to recursively verify that the subtrees also match — that recursion takes O(n) in the worst case. Total: O(n × n × n) = O(n³).

**2. What does the reconciler do when `<div>` becomes `<p>`?**

Heuristic 1: different types produce different trees. The reconciler discards the entire `<div>` subtree (all its children) and creates the entire `<p>` subtree from scratch. This is O(n) for the subtree — and it is the right thing to do in practice because when a container element changes type, all its children need to be re-attached anyway.

**3. Without keys, how does the reconciler handle an item inserted at position 0?**

Without keys, it compares by position. Old[0] is matched against new[0], old[1] against new[1], etc. If item 0 is new, then: new[0] vs old[0] → different (or same type but different content) → update or replace; new[1] vs old[1] → different → update or replace; ... every item looks different. The reconciler creates N updates for N unchanged items. With keys, it builds a `key → node` map and finds that items with keys 1-N are unchanged (REORDER only) and key 0 is new (INSERT).

---

*End of LAB 20.*

*Lab 21 applies the patches from the reconciler to the real DOM — making the DOM match the new virtual tree with the minimum number of operations.*
