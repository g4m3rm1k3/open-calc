# Concept: TypeScript's `ReactNode` Type

**What you'll understand by the end:** how to type a prop that can hold "anything React can actually render," and why that's a real, specific, checked type rather than just `any`.

**Prerequisites:** `typescript-interfaces.md`, `jsx-syntax.md`.

## Setup

Any React + TypeScript project — `ReactNode` is exported from the `react` package itself, no separate install needed.

## The Problem

A component that receives pre-built content to render — a card wrapping whatever's passed to it, a panel showing whatever tab is active — needs to accept a real range of values: plain text, a number, a whole nested JSX tree, or nothing at all. `any` would technically accept all of these, but it would also silently accept a plain object or a function — real values React cannot render at all, and that would fail confusingly at runtime instead of being caught while typing the code.

## The Isolated Example

```tsx
import type { ReactNode } from "react";

interface CardProps {
  content: ReactNode;
}

function Card({ content }: CardProps) {
  return <div className="card">{content}</div>;
}

const a = <Card content="a plain string" />;
const b = <Card content={<strong>bold JSX</strong>} />;
const c = <Card content={42} />;
const d = <Card content={null} />;
```

**Real output, run this session** (`tsc --noEmit` against the file above):
```
(no errors — all four calls compile cleanly)
```

Then, adding a fifth call with a plain object instead:
```tsx
const e = <Card content={{ not: "valid" }} />;
```

**Real output:**
```
error TS2353: Object literal may only specify known properties, and 'not'
does not exist in type 'ReactElement<...> | Iterable<ReactNode> |
ReactPortal | Promise<...>'.
```

**What this proves:** `ReactNode` genuinely accepts the real range of renderable values (a string, JSX, a number, `null`) with zero extra work at each call site, while still catching a real, non-renderable value (a plain object) at compile time — something `any` would have let through silently.

## Mechanical Walkthrough

- `import type { ReactNode } from "react"` — **(b) reappearing** a type-only import (`typescript-type-only-import.md`) — `ReactNode` is a real, exported type, not a value, so nothing here has any runtime presence at all.
- `content: ReactNode` — **(a) first appearance** — a real, built-in **union type** (`typescript-union-types.md`'s own mechanism) already defined by React's own type declarations as "a string, a number, a boolean, `null`, `undefined`, a JSX element, or an array/iterable of any of those" — not something this project defines, reused directly from the library.
- The rejected object literal — **(b) reappearing** the same real type-checking `python-isinstance.md`'s own guard already relied on in spirit (rejecting a value that merely *looks* similar) — here caught statically, before anything runs, rather than at runtime.

## CS Lens

This is a real **discriminated union of "everything renderable"**, defined once by the library whose job it is to know exactly what its own render function can handle — the same general idea as any type system encoding "one of these specific alternatives, and nothing else" (`typescript-union-types.md`), applied here to a genuinely open-ended-*sounding* but actually precisely bounded set of values.

## SE Lens

The real, tempting shortcut — typing a "renders anything" prop as `any` — trades away the exact guarantee this concept exists to provide: `any` would accept the same plain object this lab's own real error caught, and the resulting bug (React silently rendering nothing useful, or throwing a real runtime error deep inside its own reconciliation code) would surface far later and less clearly than a compile error naming the exact wrong value, at the exact line it was passed.

## Connection

Builds on `typescript-union-types.md` and `jsx-syntax.md`. Directly relevant to any component accepting pre-built content to render rather than raw data to render *itself* — used in this project for a panel tab's own content, built once in `App.tsx` and handed down as already-constructed JSX.

## Try It Yourself

1. Try passing a real array of JSX elements (`content={[<span key="a">a</span>, <span key="b">b</span>]}`) and confirm it compiles — `ReactNode`'s own definition includes iterables of itself, which is exactly what makes this valid.
2. Try passing `undefined` explicitly and confirm it compiles, then try passing a plain function (`content={() => "hi"}`) and read the real error — reasoning about why a function value, unlike a string or JSX, isn't something React knows how to render directly.
3. Look up `ReactElement` (a narrower, real sibling type — specifically *only* a JSX element, not the full `ReactNode` range) and identify which of this lab's four originally-valid calls would fail to compile if `CardProps.content` were typed as `ReactElement` instead.
