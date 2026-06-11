# PyX — LAB 19 — The Component Tree

**Prerequisites:** Lab 18 complete. Component rendering and props.children work.

**What this lab adds:**
- A `debug.ts` module that logs the virtual tree at each render
- Understanding of the two-phase render: component resolution vs DOM construction
- `props.children` typing with TypeScript generics
- Phase 4 review: what the runtime can and cannot do

**Time:** 45–60 minutes.

---

## What You Will Build

A `logTree(vnode, depth)` function that prints the virtual node tree to the console with indentation, and a three-level component hierarchy that you can inspect:

```
App
  Header props={title="PyX"}
    div.header
      h1
        "PyX"
  Main
    ul
      Item props={text="First"}
        li "First"
      Item props={text="Second"}
        li "Second"
```

This visualization shows the **two-phase render**: the tree before component calls (containing `Header`, `Main`, `Item` nodes) and the tree after (containing only host nodes like `div`, `ul`, `li`).

---

> **Quick Check — try to answer before reading further:**
>
> 1. The component tree has two forms: before and after component resolution. What changes between the two?
> 2. In PyX, components are functions. Each component call produces a VNode subtree. What would happen if a component accidentally returned `undefined` instead of a VNode?
> 3. After Phase 4, the runtime can render components to the DOM. What is still missing that prevents the counter from actually counting?
>
> *(Answers at the end of this lab)*

---

## Step 1 — Write `debug.ts`

Create `runtime/src/debug.ts`:

```typescript
import type { Child, VNode } from './types.js';

/**
 * Log a VNode tree to the console with indentation.
 * Shows both component nodes and host nodes.
 */
export function logTree(node: VNode | Child, depth: number = 0): void {
  const indent = '  '.repeat(depth);

  if (node === null || node === undefined || node === false) {
    return;
  }

  if (typeof node === 'string' || typeof node === 'number') {
    console.log(`${indent}"${node}"`);
    return;
  }

  if (Array.isArray(node)) {
    for (const child of node) {
      logTree(child, depth);
    }
    return;
  }

  const v = node as VNode;

  if (typeof v.type === 'function') {
    const name = v.type.name || '(anonymous)';
    const propsStr = Object.entries(v.props)
      .map(([k, val]) => `${k}=${JSON.stringify(val)}`)
      .join(' ');
    console.log(`${indent}${name}${propsStr ? ` props={${propsStr}}` : ''}`);
    // Log children (before component is called)
    for (const child of v.children) {
      logTree(child, depth + 1);
    }
  } else {
    const tagName = v.type as string;
    const className = v.props.className ? `.${v.props.className}` : '';
    console.log(`${indent}${tagName}${className}`);
    for (const child of v.children) {
      logTree(child, depth + 1);
    }
  }
}
```

---

## Step 2 — Build a Three-Level Component Tree

Create `runtime/src/example-tree.ts` (not part of the tests — just for exploration):

```typescript
import { h } from './h.js';
import { render } from './render.js';
import { logTree } from './debug.js';

interface ItemProps {
  text: string;
}

function Item(props: ItemProps) {
  return h('li', { className: 'item' }, props.text);
}

interface MainProps {
  items: string[];
}

function Main(props: MainProps) {
  return h('ul', { className: 'list' },
    ...props.items.map(text => h(Item, { text }))
  );
}

interface HeaderProps {
  title: string;
}

function Header(props: HeaderProps) {
  return h('div', { className: 'header' },
    h('h1', null, props.title)
  );
}

function App() {
  return h('div', { className: 'app' },
    h(Header, { title: 'PyX' }),
    h(Main, { items: ['First', 'Second', 'Third'] })
  );
}

// Log the tree before rendering
const tree = h(App, null);
console.log('=== Virtual tree (before component resolution) ===');
logTree(tree);

// Render to DOM
const container = document.getElementById('root')!;
render(tree, container);
console.log('=== Rendered to DOM ===');
```

---

## Step 3 — Tests for Component Tree Rendering

Add to `render.test.ts`:

```typescript
describe('multi-level component tree', () => {
  let container: HTMLDivElement;
  beforeEach(() => { container = document.createElement('div'); });

  it('renders a three-level component tree', () => {
    const Leaf = (props: { label: string }) => h('span', null, props.label);
    const Middle = (props: { values: string[] }) =>
      h('div', null, ...props.values.map(v => h(Leaf as any, { label: v })));
    const Root = () => h(Middle as any, { values: ['x', 'y'] });

    render(h(Root, null), container);
    expect(container.querySelectorAll('span').length).toBe(2);
    expect(container.textContent).toBe('xy');
  });

  it('handles empty component output gracefully', () => {
    const Empty = () => h('div', null);
    render(h(Empty, null), container);
    expect(container.children[0].tagName).toBe('DIV');
    expect(container.children[0].children.length).toBe(0);
  });
});
```

---

### SAVE AND TRY

```
> npm test
```

Expected: all previous tests plus the new ones pass.

---

## Phase 4 Complete — What the Runtime Can Do

| Capability | Status |
|---|---|
| Create virtual DOM nodes with `h()` | ✅ Lab 16 |
| Render host elements to real DOM | ✅ Lab 17 |
| Call component functions with props | ✅ Lab 17 |
| Pass children as `props.children` | ✅ Lab 18 |
| Handle multi-level component trees | ✅ Lab 19 |

**What is still missing:**

| Capability | Coming in |
|---|---|
| State (`useState`) | Lab 22 |
| Side effects (`useEffect`) | Lab 23 |
| Re-rendering when state changes | Lab 22 |
| Efficient DOM updates (reconciliation) | Lab 20-21 |
| Keyed list rendering | Lab 24 |

Right now, `render()` replaces the entire DOM every time you call it. This is correct but very slow — for every state change, you would delete and recreate the entire component tree. The reconciler (Labs 20-21) fixes this.

---

## Challenge: Handle Components That Return Arrays

**You know:** JSX allows components to return an array of elements (React calls this a Fragment). `function App() { return [<p>one</p>, <p>two</p>]; }` — the component returns two elements at the top level, not one.

**Task:** Update `createDOMNode` to handle this case. When a component function returns an array, render each element and wrap them in a `DocumentFragment`.

---

<details>
<summary>▶ Show Solution</summary>

```typescript
if (typeof v.type === 'function') {
  const propsWithChildren: Props = {
    ...v.props,
    ...(v.children.length > 0 ? { children: v.children } : {}),
  };
  const result = v.type(propsWithChildren);
  
  // Handle array return (fragment)
  if (Array.isArray(result)) {
    const fragment = document.createDocumentFragment();
    for (const child of result) {
      const node = createDOMNode(child);
      if (node) fragment.appendChild(node);
    }
    return fragment;
  }
  
  return createDOMNode(result);
}
```

**Key insight:** Fragment returns are common in real-world React components. A component that renders a list header and a list body might return both without an enclosing wrapper. The `DocumentFragment` is the correct DOM primitive for this — it is a "virtual" container that disappears when its children are inserted into the real DOM.

</details>

---

## Final Check

| Feature | How to verify |
|---|---|
| `logTree` logs without errors | Call `logTree(h(App, null))` in the browser console |
| Three-level tree renders | `container.querySelectorAll('span').length === 2` |
| All runtime tests pass | `npm test` shows no failures |

---

## Your Complete Files

### New / changed files this lab

**`runtime/src/debug.ts`** — new `logTree(vnode, indent)` utility for logging the virtual tree (Step 2).

**`runtime/src/render.ts`** — updated to support `renderRoot(componentFn, container)` for mounting a top-level component (Step 1).

**`runtime/src/index.ts`** — updated to export `renderRoot` and `logTree`.

### Project structure at end of Lab 19

```
pyx/
├── .venv/
├── compiler/              ← unchanged
├── runtime/
│   ├── index.html
│   ├── package.json
│   ├── vite.config.ts
│   └── src/
│       ├── debug.ts       ← new
│       ├── h.ts
│       ├── h.test.ts
│       ├── index.ts       ← updated
│       ├── main.tsx
│       ├── render.ts      ← updated (renderRoot)
│       └── render.test.ts
└── pyproject.toml
```

---

## Quick Check Answers

**1. What changes between the "before" and "after" component resolution trees?**

Before: the tree contains component VNodes (`type` is a function like `Header`, `Main`, `Item`). After: all component VNodes have been replaced by the host VNodes they produced — only `div`, `ul`, `li`, `h1`, `span`, etc. remain. Component nodes are "resolved" by calling the component function and substituting its return value. The before tree is what `h()` produces. The after tree is what the renderer produces by calling each component function.

**2. What would happen if a component returned `undefined`?**

`createDOMNode(undefined)` returns `null` (handled by the early null check). The component's slot in the parent would produce no DOM node. The UI would have a missing section with no error. This is a silent bug — the page looks wrong but there is no exception. A typed component with return type `VNode` prevents this: TypeScript would flag `return undefined` as a type error because `undefined` is not assignable to `VNode`. This is one concrete way TypeScript prevents runtime bugs.

**3. What is missing that prevents the counter from counting?**

State management. When the user clicks "+", the `onClick` handler calls `set_count(count + 1)`. But `set_count` does nothing currently (the stub or the real `useState` without a scheduler). The counter needs: (1) `useState` that stores the count value somewhere persistent across renders, (2) a setter that updates the stored value and triggers a re-render, and (3) a reconciler that efficiently updates only the changed DOM nodes. Labs 20-22 build all three.

---

*End of LAB 19.*

*Phase 5 begins in Lab 20 with the reconciler — the algorithm that compares two virtual DOM trees and produces the minimum set of DOM operations to make the real DOM match the new tree. This is the O(n) diffing algorithm used by React.*
