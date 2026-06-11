# PyX — LAB 18 — Rendering Components

**Prerequisites:** Lab 17 complete. `npm test` shows "20 passed."

**What this lab adds:**
- Understanding of function components as higher-order functions
- The component rendering loop: calling the component function and rendering its output
- `props.children` — passing content into a component from its parent
- Tests for component composition

**Time:** 45–60 minutes. Lab 17 already handles basic components; this lab deepens the model.

---

## What You Will Build

Component composition: components that render other components, components that receive children as props, and the rendering of a three-level component tree.

```typescript
// A layout component that wraps content in a card
function Card(props: { title: string; children?: VNode[] }) {
  return h('div', { className: 'card' },
    h('h2', null, props.title),
    ...( props.children ?? [] )
  );
}

// Using the Card component:
h(Card, { title: 'Counter' }, h(Counter, {}))
// Renders: <div class="card"><h2>Counter</h2>...(Counter output)...</div>
```

---

> **Quick Check — try to answer before reading further:**
>
> 1. A component function takes `props` and returns a VNode. What TypeScript type represents "a function that takes props and returns a VNode"?
> 2. React has `props.children` — the content passed between component opening and closing tags. How is this passed in `h()` calls? (Hint: it is just another prop or argument.)
> 3. When rendering `h(Card, { title: 'Hello' }, h('p', null, 'body'))`, the `h('p', ...)` is the third argument to `h`. Where does it end up in the VNode? How does `Card` access it?
>
> *(Answers at the end of this lab)*

---

## Concept: Higher-Order Functions

**What it is:** A **higher-order function** is a function that takes other functions as arguments, returns a function, or both. The `render` function in PyX is higher-order: it takes a component function (via the VNode) and calls it.

In functional programming, components are pure functions — given the same props, they always return the same VNode tree. The runtime calls them when it needs their output.

**The rendering loop:**

```typescript
// Step 1: h() creates a VNode with type = the component function
const node = h(Card, { title: 'Hello' }, h('p', null, 'body'));
// node = { type: Card, props: { title: 'Hello' }, children: [<p>vnode] }

// Step 2: render() detects type is a function and calls it
const tree = node.type(node.props);  // Card({ title: 'Hello' }) → a host VNode

// Step 3: render the returned host VNode
createDOMNode(tree);
```

Note: in step 2, the children from the `h()` call are not automatically passed to the component. The children are in `node.children`, but the component only receives `node.props`. To pass children to a component, you must put them in props explicitly.

**The `children` prop convention:**

React (and PyX) use a convention: children passed between tags are put in `props.children`. The `h()` function and the JSX compiler handle this automatically in React. In PyX, the code generator puts children as additional arguments to `h()`, which means they end up in `vnode.children`. The runtime must merge `vnode.children` into `props.children` when calling a component.

---

## Step 1 — Merge Children Into Props for Components

Update `createDOMNode` in `runtime/src/render.ts` to pass children as `props.children` when calling component functions:

```typescript
// Component VNode → call the component function to get a host VNode
if (typeof v.type === 'function') {
  // Merge children into props as props.children (the convention)
  const propsWithChildren: Props = {
    ...v.props,
    ...(v.children.length > 0 ? { children: v.children } : {}),
  };
  const result = v.type(propsWithChildren);
  return createDOMNode(result);
}
```

This means a component function can access `props.children` to render content passed in from outside.

---

## Step 2 — Write Component Composition Tests

Add to `runtime/src/render.test.ts`:

```typescript
describe('component rendering', () => {
  let container: HTMLDivElement;

  beforeEach(() => {
    container = document.createElement('div');
  });

  it('calls a component with its props', () => {
    const Greeting = (props: { name: string }) =>
      h('p', null, `Hello ${props.name}`);
    render(h(Greeting as any, { name: 'world' }), container);
    expect(container.textContent).toBe('Hello world');
  });

  it('passes children as props.children', () => {
    const Wrapper = (props: { children?: any[] }) =>
      h('section', null, ...(props.children ?? []));
    render(h(Wrapper as any, null, h('p', null, 'inside')), container);
    expect(container.querySelector('section p')).not.toBeNull();
    expect(container.textContent).toBe('inside');
  });

  it('renders nested components', () => {
    const Inner = () => h('span', null, 'inner');
    const Outer = () => h('div', null, h(Inner, null));
    render(h(Outer, null), container);
    expect(container.querySelector('div span')).not.toBeNull();
    expect(container.textContent).toBe('inner');
  });

  it('passes props through component chain', () => {
    const Label = (props: { text: string }) => h('label', null, props.text);
    const Field = (props: { label: string }) =>
      h('div', null, h(Label as any, { text: props.label }));
    render(h(Field as any, { label: 'Name' }), container);
    expect(container.querySelector('label')!.textContent).toBe('Name');
  });

  it('renders a three-level component tree', () => {
    const Item = (props: { value: string }) => h('li', null, props.value);
    const List = (props: { items: string[] }) =>
      h('ul', null, ...props.items.map(v => h(Item as any, { value: v })));
    const App = () => h(List as any, { items: ['a', 'b', 'c'] });

    render(h(App, null), container);
    expect(container.querySelectorAll('li').length).toBe(3);
    expect(container.textContent).toBe('abc');
  });
});
```

---

### SAVE AND TRY

```
> npm test
```

**Expected:** 25+ tests pass.

---

## Challenge: TypeScript Props Typing for Components

**You know:** The `Props` type is `Record<string, unknown>` — accepts any key-value pair. But each component has specific props. TypeScript can enforce this if you type your components properly.

**Task:** Create a `typed` version of `h()` that accepts a component function and infers the prop types from it:

```typescript
function hTyped<P extends Props>(
  type: (props: P) => VNode,
  props: P | null,
  ...children: unknown[]
): VNode
```

This should make `hTyped(Counter, { initialCount: "wrong" })` a type error if `Counter` expects `{ initialCount: number }`.

---

<details>
<summary>▶ Show Solution</summary>

```typescript
export function hTyped<P extends Props>(
  type: ((props: P) => VNode) | string,
  props: (P & Record<string, unknown>) | null,
  ...rawChildren: unknown[]
): VNode {
  return h(type as any, props, ...rawChildren);
}
```

This is a thin wrapper around `h()` that adds generic type inference. When you write `hTyped(Counter, { initialCount: 0 })`, TypeScript infers `P` from the function type of `Counter`, then checks that the props argument matches `P`.

**Key insight:** This is called **function overloading** or **generic constraint**. The pattern `T extends Base` says "T can be any type, as long as it extends Base." In C# this is `where T : Base`; in Java it is `<T extends Base>`. The concept is identical across all three languages — you are meeting it here first.

</details>

---

## Final Check

| Feature | How to verify |
|---|---|
| Component receives props | `h(Greeting, { name: 'x' })` → renders "Hello x" |
| Children passed as `props.children` | `h(Wrapper, null, child)` → Wrapper can render `props.children` |
| Nested components render | Three-level tree produces correct DOM |
| All tests pass | `npm test` shows no failures |

---

## Your Complete Files

### Changed files this lab

**`runtime/src/render.ts`** — updated `createDOMNode` to detect function-type VNodes and call the component function before rendering (changes in Step 1).

**`runtime/src/render.test.ts`** — updated with component rendering tests (Step 2).

### Project structure at end of Lab 18

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
│       ├── index.ts
│       ├── main.tsx
│       ├── render.ts      ← updated (component support)
│       └── render.test.ts ← updated
└── pyproject.toml
```

---

## Quick Check Answers

**1. What TypeScript type represents "a function that takes props and returns a VNode"?**

`(props: Props) => VNode` — a function type. The `Props` type (`Record<string, unknown>`) describes the argument, and `VNode` describes the return type. In the code this is aliased as `ComponentFn`. In a more specific context: `(props: { name: string }) => VNode` describes a component that specifically requires a `name` string prop.

**2. How is children passed in `h()` calls?**

Children are the third and subsequent arguments to `h()`. `h(Card, { title: 'Hello' }, child1, child2)` puts `child1` and `child2` into `vnode.children`. The runtime then merges `vnode.children` into `props.children` when calling the component function. This is the convention; a component accesses its passed-in content via `props.children`.

**3. Where does `h('p', null, 'body')` end up when passed as the third arg to `h(Card, ...)`?**

It ends up in `vnode.children[0]`. The outer `h(Card, { title: 'Hello' }, h('p', null, 'body'))` creates a VNode where `type = Card`, `props = { title: 'Hello' }`, and `children = [{ type: 'p', ... }]`. When the runtime calls `Card`, it merges children into `props.children`, so the component receives `{ title: 'Hello', children: [{ type: 'p', ... }] }`.

---

*End of LAB 18.*

*Lab 19 completes Phase 4 by rendering a multi-level component tree and introducing the debug tool that logs the virtual tree at each render. You will see the "before" tree (with component nodes) and the "after" tree (with only host nodes).*
