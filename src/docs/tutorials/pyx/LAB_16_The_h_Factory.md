# PyX — LAB 16 — The h() Factory

**Prerequisites:** Lab 15 complete. The compiler pipeline is complete. This lab switches to TypeScript for the runtime.

**What this lab adds:**
- A `runtime/` TypeScript project set up with Vite
- TypeScript fundamentals: types, interfaces, generics, function signatures
- `h.ts` — the element factory that creates virtual DOM nodes
- Tests for the `h` function using Vitest

**Time:** 75–105 minutes. The TypeScript setup is new ground — take your time on the concepts.

---

## What You Will Build

The language switches from Python to TypeScript in this lab. Everything you build in Labs 16–25 is TypeScript.

`h.ts` — a function that creates a virtual DOM node:

```typescript
h("div", { className: "app" }, "Hello")
// returns:
{
  type: "div",
  props: { className: "app" },
  children: ["Hello"]
}
```

This object is a **virtual DOM node** — a plain JavaScript/TypeScript object that describes what the DOM should look like. No real DOM elements are created yet. Lab 17 turns virtual nodes into real DOM elements.

---

> **Quick Check — try to answer before reading further:**
>
> 1. TypeScript is described as "JavaScript with types." What does adding types to JavaScript actually mean — what can you do with a typed language that you cannot do without types?
> 2. The `h()` function returns a plain object, not a real DOM element. What is the advantage of this? Why not create the DOM element immediately?
> 3. `h("div", ...)` takes a lowercase string for HTML elements, and `h(Counter, ...)` takes a function for components. How would TypeScript represent this — what type would the first argument be?
>
> *(Answers at the end of this lab)*

---

## Concept: TypeScript — Typed JavaScript

**What it is:** TypeScript is a programming language that extends JavaScript with a static type system. Every TypeScript file (`.ts` or `.tsx`) is compiled to JavaScript before it runs. The TypeScript compiler checks your code for type errors during compilation — before the code runs in the browser.

**JavaScript vs TypeScript:**

```javascript
// JavaScript — no types, no protection:
function add(a, b) {
  return a + b;
}
add(1, 2)    // 3 — correct
add("1", 2)  // "12" — wrong, but JavaScript allows it
```

```typescript
// TypeScript — types protect against the mistake:
function add(a: number, b: number): number {
  return a + b;
}
add(1, 2)    // 3 — correct
add("1", 2)  // TypeScript error: Argument of type 'string' is not assignable to 'number'
```

The `: number` annotation tells TypeScript what type a variable or parameter holds. TypeScript catches type mismatches before the code runs.

**Why TypeScript for the runtime:**

The runtime has complex type relationships: a virtual node's `type` can be a string (HTML element) or a function (component). The `props` of a component are defined by the component author. The children can be text, expressions, or other virtual nodes. TypeScript makes these relationships explicit and catches mistakes.

**TypeScript and your goals (C# and Java):**

TypeScript's type system is deliberately similar to C# and Java. Interfaces, generics, union types, class hierarchies — these concepts appear in all three languages. Building the runtime in TypeScript teaches you these patterns in a familiar (JavaScript) context before you encounter them in C# or Java.

**Watch for:** TypeScript files are compiled to JavaScript. The TypeScript type annotations are *erased* before the code runs — they exist only as a writing-time tool. The output JavaScript is identical to what you would write without types, but without the bugs that types would have caught.

---

## Concept: TypeScript Interfaces and Types

**What it is:** An **interface** in TypeScript is a named description of an object's shape — what properties it has and what types those properties hold. It is similar to a Python dataclass, but TypeScript interfaces only describe the shape; they do not create values.

**The VNode interface:**

The virtual DOM node (`VNode`) has a well-defined shape:
```typescript
interface VNode {
  type: string | ComponentFn;   // "div" for HTML, a function for components
  props: Props;                  // key-value properties
  children: Child[];             // zero or more children
}
```

Each field has a type annotation: `type` is either a string or `ComponentFn`, `props` is a `Props` object, `children` is an array of `Child`.

**Type aliases:**

`type` (lowercase) creates an alias for a more complex type:

```typescript
type Props = Record<string, unknown>;
// Record<string, unknown> means: an object with string keys and any values

type ComponentFn = (props: Props) => VNode;
// A function that takes Props and returns a VNode

type Child = VNode | string | number | boolean | null | undefined;
// A child can be any of these types
```

**Union types (`|`):**

`string | ComponentFn` means "either a string or a ComponentFn." TypeScript checks which branch you are in when you use the value.

**Watch for:** `Record<string, unknown>` is TypeScript's way of saying "an object with any string keys." `unknown` is the safe version of `any` — you cannot use an `unknown` value directly; you must check its type first. This prevents the kind of runtime error where you try to access a property on a value that does not have it.

---

## Concept: TypeScript Generics

**What it is:** **Generics** are a way to write code that works with any type while still being type-safe. Instead of accepting `unknown` (which loses all type information), a generic function can accept `T` — a placeholder that gets filled in by the caller.

You will encounter generics in the runtime when handling props:

```typescript
// Without generics — loses type information:
function getProps(node: VNode): Record<string, unknown> { ... }

// With generics — preserves type information:
function getProps<T extends Props>(node: VNodeTyped<T>): T { ... }
```

For this lab, you do not need to write generics. But you need to recognise the `<T>` syntax when you see it. The `useState` hook in Lab 22 uses generics: `useState<number>(0)` tells TypeScript the state value is a number.

**Watch for:** Generics are syntactically identical in TypeScript, C#, and Java (`<T>`). When you see them in C# or Java later, you will already know the concept.

---

## Step 1 — Set Up the Runtime Project

From the `pyx/` folder, create the runtime project:

```
> mkdir runtime
> cd runtime
> npm create vite@latest . -- --template vanilla-ts
> npm install
```

The `vanilla-ts` template gives you a TypeScript project without React — correct, since we are building the runtime from scratch.

Install Vitest for testing:

```
> npm install --save-dev vitest
```

Update `package.json` to add a test script:

```json
"scripts": {
  "dev": "vite",
  "build": "tsc && vite build",
  "preview": "vite preview",
  "test": "vitest"
}
```

Create `vitest.config.ts`:

```typescript
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'jsdom',
  },
});
```

Install `jsdom` (a simulated browser environment for tests):

```
> npm install --save-dev @vitest/jsdom jsdom
```

Delete the Vite starter files (`src/counter.ts`, `src/style.css`, `src/typescript.svg`) — you will write your own. Update `index.html` to just have a `<div id="root">`.

---

## Step 2 — Define the VNode Types

Create `runtime/src/types.ts`:

```typescript
/**
 * VNode — a virtual DOM node.
 * This is a plain TypeScript object, not a real DOM element.
 * The renderer (render.ts) turns VNodes into real DOM elements.
 */

/** A component function: accepts props, returns a VNode. */
export type ComponentFn = (props: Props) => VNode;

/** Props are key-value pairs where values can be anything. */
export type Props = Record<string, unknown>;

/** A child can be a VNode, text, number, or nothing. */
export type Child = VNode | string | number | boolean | null | undefined;

/** A virtual DOM node. */
export interface VNode {
  /** The element type: an HTML tag name ("div") or a component function. */
  type: string | ComponentFn;
  /** The element's props (attributes, event handlers, etc.). */
  props: Props;
  /** The element's children. */
  children: Child[];
  /** Internal flag: true for host elements (HTML tags), false for components. */
  isHost: boolean;
}
```

---

## Step 3 — Write `h.ts`

Create `runtime/src/h.ts`:

```typescript
import type { Child, ComponentFn, Props, VNode } from './types.js';

/**
 * Create a virtual DOM node.
 *
 * h("div", { className: "app" }, "Hello")
 * → { type: "div", props: { className: "app" }, children: ["Hello"], isHost: true }
 *
 * h(Counter, { initial: 0 })
 * → { type: Counter, props: { initial: 0 }, children: [], isHost: false }
 */
export function h(
  type: string | ComponentFn,
  props: Props | null,
  ...rawChildren: unknown[]
): VNode {
  const normalizedProps: Props = props ?? {};
  const children = normalizeChildren(rawChildren);
  const isHost = typeof type === 'string';

  return {
    type,
    props: normalizedProps,
    children,
    isHost,
  };
}

/**
 * Flatten and filter the raw children array.
 *
 * - Flattens one level of nesting (h("div", {}, [child1, child2]) works)
 * - Removes null, undefined, and false (conditional rendering)
 * - Converts numbers to strings
 */
function normalizeChildren(raw: unknown[]): Child[] {
  const result: Child[] = [];

  for (const item of raw) {
    if (item === null || item === undefined || item === false) {
      continue; // skip falsy values — used in conditional rendering
    }
    if (Array.isArray(item)) {
      // Flatten one level: h("ul", {}, items.map(...))
      for (const child of item) {
        if (child !== null && child !== undefined && child !== false) {
          result.push(child as Child);
        }
      }
    } else {
      result.push(item as Child);
    }
  }

  return result;
}
```

---

## Step 4 — Write the Tests

Create `runtime/src/h.test.ts`:

```typescript
import { describe, it, expect } from 'vitest';
import { h } from './h.js';

describe('h() factory', () => {
  it('creates a host element for string type', () => {
    const node = h('div', null);
    expect(node.type).toBe('div');
    expect(node.isHost).toBe(true);
  });

  it('creates a component node for function type', () => {
    const Counter = (props: any) => h('div', null);
    const node = h(Counter, null);
    expect(node.type).toBe(Counter);
    expect(node.isHost).toBe(false);
  });

  it('normalizes null props to empty object', () => {
    const node = h('div', null);
    expect(node.props).toEqual({});
  });

  it('preserves props', () => {
    const node = h('div', { className: 'app', id: 'main' });
    expect(node.props).toEqual({ className: 'app', id: 'main' });
  });

  it('collects children', () => {
    const node = h('div', null, 'hello', 'world');
    expect(node.children).toEqual(['hello', 'world']);
  });

  it('filters null children', () => {
    const node = h('div', null, null, 'text', undefined, false);
    expect(node.children).toEqual(['text']);
  });

  it('flattens array children', () => {
    const items = [h('li', null, 'a'), h('li', null, 'b')];
    const node = h('ul', null, items);
    expect(node.children).toHaveLength(2);
    expect((node.children[0] as any).type).toBe('li');
  });

  it('creates nested elements', () => {
    const node = h('div', null, h('p', null, 'text'));
    expect(node.children).toHaveLength(1);
    expect((node.children[0] as any).type).toBe('p');
  });

  it('handles event handler props', () => {
    const handler = () => {};
    const node = h('button', { onClick: handler });
    expect(node.props.onClick).toBe(handler);
  });

  it('handles no children', () => {
    const node = h('input', { type: 'text' });
    expect(node.children).toEqual([]);
  });
});
```

---

### SAVE AND TRY

```
> npm test
```

**Expected output:**
```
 ✓ src/h.test.ts (10 tests) 25ms

 Test Files  1 passed (1)
      Tests  10 passed (10)
   Duration  ...
```

---

## Step 5 — Create the Runtime Index

Create `runtime/src/index.ts`:

```typescript
export { h } from './h.js';
// Future exports: render, useState, useEffect (Labs 17-23)
```

Update `runtime/src/main.ts` to verify the runtime works:

```typescript
import { h } from './index.js';

// Quick verification: create a vnode and log it
const node = h('div', { className: 'app' }, h('h1', null, 'Hello from PyX'));
console.log('VNode:', node);
```

Run `npm run dev` and open `localhost:5173`. Check the browser console — you should see the virtual node logged.

---

## Challenge: Add a `key` Prop to `VNode`

**You know:** In Lab 24, the reconciler uses `key` props to identify stable list items across renders. The `key` is not a regular prop — it is a special field that the runtime uses internally and does not pass to the component.

**Task:** Add a `key?: string | number` field to the `VNode` interface. Update `h()` to extract `key` from props (if present), store it on the VNode, and remove it from the props object so components do not receive it.

**Expected behaviour:**
```typescript
const node = h('li', { key: 'item-1', className: 'list-item' }, 'text');
// node.key === 'item-1'
// node.props.key === undefined  (key removed from props)
// node.props.className === 'list-item'  (other props preserved)
```

---

<details>
<summary>▶ Show Solution</summary>

Update `types.ts`:
```typescript
export interface VNode {
  type: string | ComponentFn;
  props: Props;
  children: Child[];
  isHost: boolean;
  key?: string | number;  // ← add this
}
```

Update `h.ts`:
```typescript
export function h(
  type: string | ComponentFn,
  props: Props | null,
  ...rawChildren: unknown[]
): VNode {
  const normalizedProps: Props = { ...(props ?? {}) };
  
  // Extract key from props (key is not a real prop)
  const key = normalizedProps['key'] as string | number | undefined;
  if ('key' in normalizedProps) {
    delete normalizedProps['key'];
  }

  return {
    type,
    props: normalizedProps,
    children: normalizeChildren(rawChildren),
    isHost: typeof type === 'string',
    key,
  };
}
```

Add tests:
```typescript
it('extracts key from props', () => {
  const node = h('li', { key: 'item-1', className: 'x' });
  expect(node.key).toBe('item-1');
  expect(node.props.key).toBeUndefined();
  expect(node.props.className).toBe('x');
});
```

**Key insight:** `key` is special in React/PyX: it is used by the reconciler but never passed to the component. Removing it from `props` before passing to the component is correct — if you leave it in, the component's props type definition would need to include `key`, even though the component never uses it. This separation of "reconciler-internal metadata" from "component-visible props" is a real React design decision.

</details>

---

## Final Check

| Feature | How to verify |
|---|---|
| TypeScript project compiles | `npm run build` succeeds without type errors |
| `h("div", null)` returns a VNode | Node has `type: "div"`, `isHost: true`, `children: []` |
| `h(fn, null)` returns a component VNode | Node has `isHost: false` |
| Null children are filtered | `h("div", null, null, "text")` → children = `["text"]` |
| Array children are flattened | `h("ul", null, [child1, child2])` → children has 2 items |
| All 10 tests pass | `npm test` shows "10 passed" |

---

## Your Complete Files

### `runtime/src/types.ts`
*(full file as written in Step 2)*

### `runtime/src/h.ts`
*(full file as written in Step 3)*

### `runtime/src/h.test.ts`
*(full file as written in Step 4)*

### `runtime/src/index.ts`
*(full file as written in Step 5)*

---

## Quick Check Answers

**1. What can you do with a typed language that you cannot do without?**

You can detect a class of bugs at write-time instead of run-time. In JavaScript, passing a string where a number is expected silently produces `NaN` — a bug that may not manifest until a specific user interaction. In TypeScript, the same mistake produces an error immediately as you type the code. You also get IDE autocomplete driven by types: TypeScript knows the shape of a `VNode` and autocompletes `.props`, `.children`, `.isHost` as you type. Without types, the IDE cannot know which properties exist.

**2. Why return a plain object instead of creating a DOM element immediately?**

Three reasons. First, the virtual DOM is cheap to create (plain objects) and cheap to throw away. Real DOM operations are slow — every `createElement`, `appendChild`, and `setAttribute` call may trigger a browser layout calculation. Creating a virtual node first and batching the DOM operations is faster. Second, you need the old virtual tree to diff against the new one (Lab 20) — if you create real DOM elements immediately, you have no record of what the tree looked like before. Third, virtual nodes can be created in non-browser environments (like test environments) — testing rendering logic without a DOM requires this.

**3. What TypeScript type would the first argument of `h()` be?**

`string | ComponentFn` — a union type. When `typeof type === 'string'`, it is an HTML element tag name. When `typeof type === 'function'`, it is a component function. TypeScript's union type precisely captures this: the argument is one or the other. Inside `h()`, TypeScript narrows the type based on `typeof` checks — after `if (typeof type === 'string')`, TypeScript knows `type` is a string and allows string-specific operations.

---

*End of LAB 16.*

*Lab 17 writes the renderer — `render(vnode, container)` walks a VNode tree and creates real DOM elements. `h("div", {className: "app"}, "Hello")` becomes an actual `<div class="app">Hello</div>` node in the DOM. For the first time, a PyX virtual node appears visibly in the browser.*
