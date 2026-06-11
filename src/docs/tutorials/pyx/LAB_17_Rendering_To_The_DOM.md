# PyX — LAB 17 — Rendering to the Real DOM

**Prerequisites:** Lab 16 complete. `npm test` shows "10 passed" for `h.test.ts`.

**What this lab adds:**
- `render.ts` — turns a VNode tree into real DOM elements
- TypeScript DOM types: `HTMLElement`, `Text`, `Node`, `document`
- The `className` → `class` mapping, event handler prop conventions
- Tests that verify real DOM nodes are created correctly

**Time:** 60–80 minutes.

---

## What You Will Build

```typescript
import { h } from './h.js';
import { render } from './render.js';

const vnode = h('div', { className: 'app' },
  h('h1', null, 'Hello from PyX')
);

render(vnode, document.getElementById('root')!);
// The browser now shows: <div class="app"><h1>Hello from PyX</h1></div>
```

`render` takes a VNode and a real DOM container and recursively creates DOM nodes.

---

> **Quick Check — try to answer before reading further:**
>
> 1. `h()` creates a virtual node without touching the DOM. `render()` creates real DOM nodes. What are the two key DOM methods you need to create elements and append them?
> 2. JSX uses `className` but the DOM attribute is called `class`. How will `render` handle this renaming?
> 3. A prop like `onClick` is a function, not a string. How does `render` distinguish event handler props from regular attribute props?
>
> *(Answers at the end of this lab)*

---

## Concept: The Browser DOM API

**What it is:** The **DOM (Document Object Model)** is the browser's in-memory tree of all elements on a page. JavaScript/TypeScript uses a set of built-in functions to create, modify, and traverse this tree.

**The key DOM methods for rendering:**

```typescript
// Create an element node:
const div = document.createElement('div');

// Create a text node:
const text = document.createTextNode('Hello');

// Set an HTML attribute:
div.setAttribute('class', 'app');

// Add an event listener:
div.addEventListener('click', handler);

// Append a child to an element:
div.appendChild(text);

// Replace a container's contents:
container.innerHTML = '';
container.appendChild(div);
```

**TypeScript types for DOM nodes:**

TypeScript knows about every browser API. Key types:

| TypeScript type | What it represents |
|---|---|
| `Node` | Any DOM node (element, text, comment) |
| `Element` | An element node (has tag name, attributes) |
| `HTMLElement` | An HTML element (div, p, button — has className, style) |
| `Text` | A text node |
| `EventTarget` | Any object that can receive events |

When you write `document.createElement('div')`, TypeScript returns `HTMLDivElement` (a subtype of `HTMLElement`). The `lib: ["DOM"]` in `tsconfig.json` enables all these browser types.

**The non-null assertion (`!`):**

`document.getElementById('root')!` — the `!` at the end is TypeScript's non-null assertion. `getElementById` can return `HTMLElement | null` (it returns null if the element is not found). Adding `!` tells TypeScript: "I know this is not null — trust me." Use this only when you are certain the element exists. In a `main.ts` that runs after the HTML is loaded, `document.getElementById('root')` is always defined.

**Watch for:** TypeScript knows the difference between `setAttribute('class', 'app')` (sets any attribute) and `element.className = 'app'` (the JavaScript property that maps to the class attribute). Both work; the property form is slightly faster.

---

## Step 1 — Write `render.ts`

Create `runtime/src/render.ts`:

```typescript
import type { Child, VNode } from './types.js';

/**
 * Render a VNode tree into a real DOM container.
 * Clears the container first, then appends the rendered tree.
 */
export function render(vnode: VNode, container: Element): void {
  container.innerHTML = '';
  const domNode = createDOMNode(vnode);
  if (domNode) {
    container.appendChild(domNode);
  }
}

/**
 * Recursively create a DOM node from a VNode.
 * Returns the created DOM node, or null if nothing should be created.
 */
export function createDOMNode(vnode: VNode | Child): Node | null {
  // String or number children → text node
  if (typeof vnode === 'string' || typeof vnode === 'number') {
    return document.createTextNode(String(vnode));
  }

  // Null, undefined, false → nothing
  if (vnode === null || vnode === undefined || vnode === false) {
    return null;
  }

  const v = vnode as VNode;

  // Component VNode → call the component function to get a host VNode
  if (typeof v.type === 'function') {
    const result = v.type(v.props);
    return createDOMNode(result);
  }

  // Host VNode → create a real DOM element
  const element = document.createElement(v.type as string);

  // Apply props
  for (const [key, value] of Object.entries(v.props)) {
    applyProp(element, key, value);
  }

  // Append children
  for (const child of v.children) {
    const childNode = createDOMNode(child);
    if (childNode) {
      element.appendChild(childNode);
    }
  }

  return element;
}

/**
 * Apply a single prop to a DOM element.
 */
function applyProp(element: HTMLElement, key: string, value: unknown): void {
  if (key === 'className') {
    // JSX uses className; the DOM attribute is class
    element.className = value as string;
  } else if (key === 'style' && typeof value === 'object' && value !== null) {
    // Style object: { color: 'red', fontSize: '16px' }
    for (const [prop, val] of Object.entries(value)) {
      (element.style as any)[prop] = val;
    }
  } else if (key.startsWith('on') && typeof value === 'function') {
    // Event handler: onClick → click, onMouseOver → mouseover
    const eventName = key.slice(2).toLowerCase();
    element.addEventListener(eventName, value as EventListener);
  } else if (key !== 'key') {
    // Regular attribute (skip 'key' — it is for the reconciler)
    element.setAttribute(key, String(value));
  }
}
```

---

## Step 2 — Write the Tests

Create `runtime/src/render.test.ts`:

```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import { h } from './h.js';
import { render, createDOMNode } from './render.js';

describe('render', () => {
  let container: HTMLDivElement;

  beforeEach(() => {
    container = document.createElement('div');
  });

  it('renders a simple element', () => {
    render(h('div', null), container);
    expect(container.children[0].tagName).toBe('DIV');
  });

  it('renders text content', () => {
    render(h('p', null, 'Hello'), container);
    expect(container.textContent).toBe('Hello');
  });

  it('maps className to class attribute', () => {
    render(h('div', { className: 'app' }), container);
    expect(container.children[0].className).toBe('app');
  });

  it('sets regular attributes', () => {
    render(h('input', { type: 'text', id: 'name' }), container);
    const input = container.children[0] as HTMLInputElement;
    expect(input.getAttribute('type')).toBe('text');
    expect(input.getAttribute('id')).toBe('name');
  });

  it('attaches event listeners', () => {
    let clicked = false;
    render(h('button', { onClick: () => { clicked = true; } }, 'Click'), container);
    const button = container.querySelector('button')!;
    button.click();
    expect(clicked).toBe(true);
  });

  it('renders nested elements', () => {
    render(h('div', null, h('p', null, 'inner')), container);
    expect(container.querySelector('p')).not.toBeNull();
    expect(container.querySelector('p')!.textContent).toBe('inner');
  });

  it('renders multiple children', () => {
    render(h('ul', null, h('li', null, 'a'), h('li', null, 'b')), container);
    expect(container.querySelectorAll('li').length).toBe(2);
  });

  it('skips null children', () => {
    render(h('div', null, null, 'text', false), container);
    expect(container.textContent).toBe('text');
  });

  it('renders a function component', () => {
    const Hello = (props: any) => h('h1', null, `Hello ${props.name}`);
    render(h(Hello, { name: 'world' }), container);
    expect(container.querySelector('h1')!.textContent).toBe('Hello world');
  });

  it('clears container before rendering', () => {
    container.innerHTML = '<p>old content</p>';
    render(h('div', null), container);
    expect(container.querySelectorAll('p').length).toBe(0);
    expect(container.children.length).toBe(1);
  });
});
```

---

### SAVE AND TRY

```
> npm test
```

**Expected:** 10 h() tests + 10 render tests = 20 passed.

---

## Step 3 — Update the Vite App to Use the Real Runtime

Update `app/src/main.jsx` to use the runtime from the `runtime/` directory:

This requires making the `runtime/` package importable. The cleanest way during development: update `vite.config.js` in the `app/` to point `'pyx-runtime'` at the runtime's `src/index.ts`:

```js
import { defineConfig } from 'vite';
import path from 'path';

export default defineConfig({
  resolve: {
    alias: {
      'pyx-runtime': path.resolve(__dirname, '../runtime/src/index.ts'),
    },
  },
  esbuild: {
    jsxFactory: 'h',
    jsxFragment: 'Fragment',
    jsxInject: `import { h, Fragment } from 'pyx-runtime'`,
  },
});
```

Update `runtime/src/index.ts`:

```typescript
export { h } from './h.js';
export { render } from './render.js';
```

Update `app/src/main.jsx`:

```jsx
import { Counter } from './counter.jsx';
import { render } from 'pyx-runtime';

render(Counter({}), document.getElementById('root'));
```

Start Vite:

```
> npm run dev
```

The counter now renders using the real `h` and `render` functions — not the stub. The count still does not update on click (no `useState` yet).

---

## Challenge: Handle Array Children from `map()`

**You know:** The `.map()` list rendering pattern produces an array of VNodes:
```jsx
{items.map(item => <li key={item.id}>{item.name}</li>)}
```

In JSX this becomes a child that is an array. The `normalizeChildren` function in `h.ts` already flattens one level of arrays. But `createDOMNode` in `render.ts` does not handle the case where a child is an array of VNodes.

**Task:** Handle array children in `createDOMNode`. When a child is an array, render each element of the array and append the resulting DOM nodes.

---

<details>
<summary>▶ Show Solution</summary>

In `createDOMNode`, add an array check:

```typescript
export function createDOMNode(vnode: VNode | Child): Node | null {
  // Handle array children (from .map())
  if (Array.isArray(vnode)) {
    const fragment = document.createDocumentFragment();
    for (const child of vnode) {
      const node = createDOMNode(child);
      if (node) fragment.appendChild(node);
    }
    return fragment;
  }
  // ... rest of the function
}
```

A `DocumentFragment` is an invisible container that groups DOM nodes. When you `appendChild` a fragment to an element, all the fragment's children are moved (not the fragment itself). This is the standard way to insert multiple nodes at once without creating a wrapper element.

</details>

---

## Final Check

| Feature | How to verify |
|---|---|
| `render` creates a DOM element | `render(h('div', null), container)` → `container.children[0].tagName === 'DIV'` |
| `className` maps to class | `h('div', { className: 'x' })` → element has `class="x"` |
| Event listeners attach | Button with `onClick` → clicking calls the handler |
| Component functions are called | `h(Counter, {})` → Counter is called, its VNode is rendered |
| All 20 tests pass (h + render) | `npm test` shows "20 passed" |

---

## Your Complete Files

### New file this lab

**`runtime/src/render.ts`** — the renderer. Full content in Steps 1–2.

**`runtime/src/render.test.ts`** — test suite (Step 3).

**`runtime/src/index.ts`** — updated to export `render` alongside `h`.

### Project structure at end of Lab 17

```
pyx/
├── .venv/
├── compiler/              ← unchanged
├── runtime/
│   ├── index.html
│   ├── package.json
│   ├── vite.config.ts
│   └── src/
│       ├── h.ts
│       ├── h.test.ts
│       ├── index.ts       ← updated (exports render)
│       ├── main.tsx
│       ├── render.ts      ← new
│       └── render.test.ts ← new
├── examples/
└── pyproject.toml
```

---

## Quick Check Answers

**1. What are the two key DOM methods?**

`document.createElement(tagName)` creates an element node. `element.appendChild(child)` attaches a child node. Together these are sufficient to build any DOM tree. The other methods (`setAttribute`, `addEventListener`, `createTextNode`) handle specific requirements: setting attributes, attaching handlers, and creating text.

**2. How does `render` handle the `className` → `class` renaming?**

In `applyProp`: `if (key === 'className') { element.className = value as string; }`. The `className` property is the JavaScript DOM property for the `class` HTML attribute. Setting `element.className = 'app'` is equivalent to `element.setAttribute('class', 'app')`. The renaming happens in `render.ts`, not earlier in the pipeline — the IR and code generator preserve `className` as-is.

**3. How does `render` distinguish event handler props from attribute props?**

By the naming convention: `key.startsWith('on')` and `typeof value === 'function'`. If a prop starts with `on` and its value is a function, it is an event handler: `element.addEventListener(key.slice(2).toLowerCase(), value)`. `onClick` → `addEventListener('click', ...)`, `onMouseOver` → `addEventListener('mouseover', ...)`. All other props are set as HTML attributes with `setAttribute`.

---

*End of LAB 17.*

*Lab 18 handles component rendering — when `vnode.type` is a function, calling it with props produces the virtual subtree. After Lab 18, `<Counter />` in PyX compiles to `h(Counter, {})` and the runtime correctly calls `Counter({})` to get its virtual tree.*
