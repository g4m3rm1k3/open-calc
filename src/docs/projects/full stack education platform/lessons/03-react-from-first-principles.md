# Lesson 03 — React From First Principles

## What You Will Build

Break the single-file app into components: a `Header` component, a `Counter` component,
and a `Button` component. The visible result is identical to Lesson 02 — the same
counter, the same button — but the code is now organised into reusable, self-contained
units. This lesson teaches the structure that every React app in the world is built on.

---

## What You Need to Know First

- Lesson 01: Running the Expo app, JSX basics
- Lesson 02: `useState`, the reactive model, `const`/`let`, TypeScript types

---

## The Lesson

### Step 1 — The Tree Data Structure

Before writing any components, understand the data structure they form.

A **tree** is a data structure made of **nodes** connected by **parent-child relationships**.
Every node has exactly one parent (except the root, which has none), and can have zero or
more children. Trees are used everywhere in computing: the filesystem is a tree of
directories and files; HTML is a tree of elements; a company's org chart is a tree.

The browser's representation of an HTML page is called the **DOM** (Document Object Model)
— a tree of elements. `<html>` is the root; `<body>` is its child; `<div>`, `<p>`, and
`<span>` elements hang below that.

React renders a **component tree** — a tree of components where each component can render
child components. Your app's structure:

```
App
├── Header
└── Counter
    └── Button
```

React renders this tree recursively: it calls `App()`, which returns JSX containing
`Header` and `Counter`. React then calls `Header()` and `Counter()`. `Counter()` returns
JSX containing `Button`, so React calls `Button()`. The recursion stops when all nodes
return only primitive elements (like `<Text>` and `<View>`), not more custom components.

**Why tree structure?** A tree models containment naturally. A `Header` is inside the
`App`. A `Button` is inside the `Counter`. Trees also allow efficient updates: when one
node changes, React only needs to re-render that node and its subtree, not the entire app.

### Step 2 — The Virtual DOM

**The problem:** Updating the real DOM is expensive. The browser must recalculate layout,
repaint pixels, and update accessibility trees — dozens of operations per change. If every
state update touched the DOM directly, a complex app with many updates would stutter.

**The solution — the virtual DOM:** React maintains a **virtual DOM** — a lightweight
JavaScript copy of the UI tree, stored in memory. When state changes:
1. React creates a new virtual tree reflecting the new state
2. React **diffs** the old and new virtual trees — compares them to find exactly what changed
3. React applies only the minimal set of real DOM changes

This is **reconciliation**: React reconciles the virtual description of the UI with the
actual DOM, touching only what has changed.

**CS lens — diff algorithms:** The comparison React performs is algorithmically similar to
the diff algorithm used by `git diff`. Git finds the minimum edits to transform one file
into another; React finds the minimum DOM mutations to transform the old UI into the new one.
Both use tree diffing with heuristics to keep the complexity manageable.

### Step 3 — The `Header` Component

Create `src/components/Header.tsx`:

```typescript
import { StyleSheet, Text, View } from 'react-native'

interface HeaderProps {
  readonly title: string
}

export function Header({ title }: HeaderProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    backgroundColor: 'white',
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#111827',
  },
})
```

**`interface HeaderProps` explained:**
An `interface` is a TypeScript construct that defines the shape of an object — what
properties it has and what type each holds. `HeaderProps` says: this component accepts
one prop, `title`, which must be a `string`. TypeScript will error if you use `Header`
without passing a `title` prop, or if you pass a number instead.

`readonly` on an interface property means the property cannot be reassigned inside the
component. Props are always `readonly` — a component is not allowed to modify the props
it receives. Data flows down (parents set props), and events flow up (children call
callbacks). A component that could modify its own props would violate this contract.

**`{ title }: HeaderProps` — destructuring:**
The parameter `{ title }` is **object destructuring** — extracting the `title` property
from the props object and binding it to a local constant named `title`. Without
destructuring: `props.title`. With destructuring: `title`. Shorter and clearer.

**CS lens:** `Header` is a **pure function** — given the same `title`, it always returns
the same JSX. There is no side effect, no state, no randomness. Pure functions are
predictable, easy to test, and easy to reason about.

**SE lens — single responsibility:** The `Header` component has one job: render the
app's header with a given title. It does not know about counters, navigation, or any
other part of the app. If the header style needs to change, you change this one file.

### Step 4 — The `Button` Component

Create `src/components/Button.tsx`:

```typescript
import { StyleSheet, Text, TouchableOpacity } from 'react-native'

interface ButtonProps {
  readonly label: string
  readonly onPress: () => void
}

export function Button({ label, onPress }: ButtonProps) {
  return (
    <TouchableOpacity style={styles.button} onPress={onPress}>
      <Text style={styles.label}>{label}</Text>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#3b82f6',
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 8,
  },
  label: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
})
```

**`onPress: () => void` explained:**
`() => void` is a **function type** — it describes a function that takes no arguments and
returns nothing (`void` means no return value). `Button` accepts a function as a prop and
calls it when pressed.

This is a critical design decision: `Button` does not know what happens when it is pressed.
It only knows that it should call `onPress`. What `onPress` does is the caller's concern.
A `Button` that hardcoded `incrementCount()` could only ever increment a counter; a
`Button` that calls `onPress()` can be used anywhere in any app.

**CS lens — first-class functions:** Functions in TypeScript are **first-class values** —
they can be stored in variables, passed as arguments, and returned from other functions.
`onPress: () => void` is a function stored as a prop. The callback pattern
(pass a function, call it later) appears everywhere in JavaScript: event handlers, promises,
array methods like `map` and `filter`.

**SE lens — the single responsibility principle and composability:**
`Button` renders a button and calls its press handler. It knows nothing about the outside
world. `Header` renders a header. `Counter` manages a count and renders a counter.
Each component is responsible for exactly one thing. Combining them — composing them —
produces the full UI. This is **composition**: building complex things from simple,
independent parts.

### Step 5 — The `Counter` Component

Create `src/components/Counter.tsx`:

```typescript
import { useState } from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { Button } from './Button'

export function Counter() {
  const [count, setCount] = useState<number>(0)

  function incrementCount() {
    setCount(count + 1)
  }

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Count</Text>
      <Text style={styles.countDisplay}>{count}</Text>
      <Button label="Increment" onPress={incrementCount} />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: 48,
  },
  label: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  countDisplay: {
    fontSize: 72,
    fontWeight: '700',
    color: '#3b82f6',
    marginBottom: 32,
  },
})
```

**`import { Button } from './Button'` explained:**
`'./Button'` is a **relative path** — it means "look for a file named `Button` in the
same directory as this file." The `./` prefix means "relative to here." TypeScript resolves
`./Button` to `./Button.tsx` automatically. We import the named export `Button` — the
function we exported with `export function Button`.

**`<Button label="Increment" onPress={incrementCount} />`:**
This passes `"Increment"` as the `label` prop and `incrementCount` as the `onPress` prop.
Note: `onPress={incrementCount}` passes the function; `onPress={incrementCount()}` would
call the function immediately and pass its return value (which is `undefined`). This
is the most common beginner mistake with callbacks.

**Module boundaries and the `export` keyword:**
`export function Counter()` marks `Counter` as available for other files to import.
Without `export`, the function exists but cannot be imported. `export` is how modules
declare their public surface — what they share with the outside world.

A file named `Button.tsx` with `export function Button()` promises: I provide a `Button`
component. Files that import it depend on that promise. If you rename the function to
`Btn` without updating the imports, every import breaks. The exported name is a contract.

**SE lens — encapsulation:** `Counter` owns its state. `count` lives inside `Counter`.
`App` cannot see or modify `count` — it is hidden inside the component. If `Counter`
needs to change how it stores its count (e.g., using `useReducer` instead of `useState`),
that is an internal change that does not affect any other component. This is
**encapsulation**: internal state is hidden from the outside world.

### Step 6 — Updating `App.tsx`

```typescript
import { StyleSheet, View } from 'react-native'
import { Header } from './src/components/Header'
import { Counter } from './src/components/Counter'

export default function App() {
  return (
    <View style={styles.container}>
      <Header title="Codex Education" />
      <Counter />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
})
```

`App` now composes `Header` and `Counter`. It does not manage any state — it is a
layout-only component. Its job is to assemble the pieces.

**The component lifecycle (brief introduction):**
Every React component goes through three phases:
1. **Mount** — the component appears on screen for the first time. `useState` initialises.
2. **Update** — state or props change, triggering a re-render. React calls the component
   function again with the new values.
3. **Unmount** — the component is removed from the screen. Any subscriptions or timers
   (covered in Lesson 08) must be cleaned up here.

Understanding the lifecycle is essential for Lesson 08 (`useEffect`) and Lesson 36
(memory leaks from unmounted components that are still referenced).

### Step 7 — Named vs Default Exports

Two export styles exist in TypeScript/JavaScript modules:

**Default export:** `export default function App()` — one per file, imported without braces:
```typescript
import App from './App'
```

**Named exports:** `export function Header()` — multiple per file, imported with braces:
```typescript
import { Header } from './Header'
```

**Convention:** Use named exports for components (makes the name explicit at the import
site) and default exports for entry points (like `App.tsx`, which Expo expects as a
default export). Named exports are easier to refactor because the name in the import
must match the export exactly — there is no ambiguity.

---

## Connect the Pieces

The component structure built here is the foundation for every UI feature in this
curriculum. Lesson 05 (navigation) will add a navigator that wraps these components.
Lesson 08 (state management) will lift state from `Counter` into a context when multiple
components need the same data. Lesson 21 (the lesson engine) will add a `LessonCard`
component built exactly like `Counter` — props in, events out, isolated state.

The **separation of concerns** in this lesson (each component owns its appearance and
behaviour) is the same principle that separates the API from the database in Lesson 12,
and the frontend from the backend throughout. One principle, many scales.

In React codebases at scale — Meta's web app, the VS Code editor interface, Airbnb's
design system — every UI element is a component. The component contract (props in,
events out, isolated state) is the same here as it is at billions of users.

---

## What Breaks Without This

Without the component split, adding a second counter would require duplicating all of
`App.tsx`. Without the component split, changing the button's style requires finding it
in one large file. Without `readonly` on props, a child component could modify its own
props, making data flow unpredictable — `Header` could change its own `title`, and `App`
would not know. The `readonly` constraint is enforced by TypeScript, not by runtime
behaviour.

---

## Definition of Done

- [ ] The app has three component files: `Header.tsx`, `Counter.tsx`, `Button.tsx`
- [ ] `App.tsx` imports and composes them
- [ ] The visible result is identical to Lesson 02 — counter increments on press
- [ ] `npm start` shows no TypeScript errors
- [ ] You can answer: what is the virtual DOM and what problem does it solve?
- [ ] You can answer: why are props `readonly`?
- [ ] You can answer: what is the difference between `onPress={fn}` and `onPress={fn()}`?
- [ ] You can answer: what does `export` do, and what is the difference between a named and default export?
- [ ] `git commit` with a message explaining why — "Split App into Header, Counter, Button components for separation of concerns"
