# Lesson 02 — TypeScript From First Principles

## What You Will Build

Add a counter to your screen. A button increments it. The current count is displayed.
This is the simplest possible interaction — but it requires understanding variables,
types, functions, and state. Everything you build in the rest of this curriculum builds
on these four concepts.

---

## What You Need to Know First

- Lesson 01: The running Expo app, `App.tsx`, how to run with `npm start`

---

## The Lesson

### Step 1 — Variables and Memory

A **variable** is a named location in memory that holds a value. When your program runs,
your operating system allocates a region of memory for it. Variables are how your code
gives names to those memory locations so you can refer to them.

```typescript
const greeting = "Hello, world"
let count = 0
```

**`const` vs `let`:** These are two different kinds of variable declaration.
- `const` declares a variable whose **binding** cannot be reassigned. Once `const count = 0`,
  you cannot write `count = 5` — TypeScript will report an error. Use `const` by default.
- `let` declares a variable that can be reassigned. `let count = 0; count = 1` is valid.
  Use `let` only when you know the value will change.
- `var` is the older syntax. It has confusing scoping rules (not block-scoped) and is
  never used in modern TypeScript. Forget it exists.

**Why `const` by default?** Code is easier to understand when you can tell at a glance
which values change and which do not. If everything is `const`, a `let` stands out and
signals: this value changes — pay attention to when and why.

### Step 2 — Types

Every value in TypeScript has a **type** — a classification that determines what
operations are valid on it and what it can hold.

**The primitive types:**
- `string` — a sequence of characters. `"hello"`, `"42"`, `""`. Strings support
  `.length`, `.toUpperCase()`, concatenation with `+`.
- `number` — any numeric value: integers, decimals, negatives. `0`, `3.14`, `-7`.
  There is no separate integer type in JavaScript/TypeScript.
- `boolean` — exactly two values: `true` or `false`. Used for conditions.

```typescript
const name: string = "Alice"
const age: number = 30
const isLoggedIn: boolean = false
```

**Type annotations** (`: string`, `: number`) tell TypeScript what type a variable holds.
TypeScript then enforces that only compatible values are assigned.

**Type inference:** TypeScript is smart enough to figure out the type from the value.
```typescript
const count = 0  // TypeScript infers: count has type 'number'
```
The annotation `: number` is optional here — TypeScript already knows. Write annotations
when the type is not obvious, or when you want to be explicit for documentation.

### Step 3 — Primitive vs Reference Types

This is one of the most important distinctions in programming.

**Primitive types** (string, number, boolean) are **copied by value**:

```typescript
let first = 5
let second = first   // second gets a copy of the value 5
second = 10          // changing second does not change first
console.log(first)   // still 5
```

When you assign `second = first`, JavaScript copies the value `5` into a new memory
location. `first` and `second` are independent.

**Reference types** (objects, arrays, functions) are **copied by reference**:

```typescript
const personA = { name: "Alice", score: 10 }
const personB = personA   // personB points to the SAME object in memory
personB.score = 99        // this modifies the shared object
console.log(personA.score) // 99 — personA was also changed
```

`personA` holds a **reference** (a pointer) to an object in memory. `personB = personA`
copies the reference, not the object. Both variables now point to the same object.

**Why this matters for UI:** React's re-render system compares state values to decide
whether to update the screen. With primitives, `5 === 5` works correctly. With objects,
`{ score: 10 } === { score: 10 }` is `false` even though they look identical — because
they are two different objects in memory. This is why React state must be updated
immutably (return a new object, not mutate the existing one).

### Step 4 — Functions

A **function** is a named, reusable block of code. It takes **parameters** (inputs),
executes some code, and returns a value.

```typescript
function add(firstNumber: number, secondNumber: number): number {
  return firstNumber + secondNumber
}

const result = add(3, 7)  // result is 10
```

**Parameters vs arguments:** The variables in the function definition (`firstNumber`,
`secondNumber`) are **parameters**. The values you pass when calling it (`3`, `7`) are
**arguments**. Parameters are the placeholders; arguments are the actual values.

**Return type:** `: number` after the parentheses declares what type this function
returns. TypeScript verifies that every `return` statement in the function returns
a number.

**Arrow functions:** The same function with arrow syntax:

```typescript
const add = (firstNumber: number, secondNumber: number): number => {
  return firstNumber + secondNumber
}
```

`(parameters) => { body }` is the arrow function syntax. When the body is a single
expression, the braces and `return` can be omitted:

```typescript
const add = (first: number, second: number): number => first + second
```

The `=>` separates parameters from the body. This is shorthand for `function(){}`.
Arrow functions are used when the function is short and does not need a name.

### Step 5 — The Call Stack

When a function is called, the JavaScript engine creates a **stack frame** — a block of
memory holding the function's parameters and local variables. Stack frames are placed on
the **call stack** — a data structure that works like a stack of plates: last in, first out.

```
add(3, 7) is called
  → Stack frame created: { firstNumber: 3, secondNumber: 7 }
  → `return firstNumber + secondNumber` evaluates to 10
  → Stack frame is removed
  → 10 is returned to the caller
```

When a function calls another function, the second frame goes on top of the first.
When the inner function returns, its frame is removed and the outer function resumes.

**Stack overflow:** If a function calls itself indefinitely (or in a very long chain),
the stack grows until it runs out of memory. The JavaScript engine then throws a
`RangeError: Maximum call stack size exceeded`. This is what "stack overflow" means —
the call stack is full.

### Step 6 — Adding the Counter

Now apply these concepts. Replace `App.tsx`:

```typescript
import { useState } from 'react'
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native'

export default function App() {
  const [count, setCount] = useState<number>(0)

  function incrementCount() {
    setCount(count + 1)
  }

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Codex Education</Text>

      <Text style={styles.countDisplay}>{count}</Text>

      <TouchableOpacity style={styles.button} onPress={incrementCount}>
        <Text style={styles.buttonText}>Increment</Text>
      </TouchableOpacity>
    </View>
  )
}
```

**`import { useState } from 'react'` explained:**
`react` is the React library (installed in `node_modules`). `useState` is a named export
from that library — a **hook** (explained below). We import only what we need.

**`useState<number>(0)` explained:**
`useState` is React's mechanism for storing values that change over time. It returns an
array of exactly two things: the current value (`count`) and a function to change it
(`setCount`).

```typescript
const [count, setCount] = useState<number>(0)
```

This is **array destructuring**: `const [a, b] = [1, 2]` assigns `a = 1` and `b = 2`.
`useState` returns `[value, setter]`; destructuring gives each element a name.

The `<number>` is a **type argument** (generic parameter) — it tells TypeScript that this
state holds a number. TypeScript will reject `setCount("hello")` because `"hello"` is not
a number.

The `0` is the **initial value** — what `count` starts as when the component first mounts.

**What `useState` actually does:**
When you call `setCount(count + 1)`, React:
1. Stores the new value internally
2. Re-renders the component (calls `App()` again)
3. This time `useState` returns the new value instead of `0`
4. The screen updates to show the new count

This is the **reactive model**: state changes trigger re-renders. You describe what the
UI looks like for a given state; React handles updating the screen.

**Why you cannot use `let count = 0` instead of `useState`:**
A plain variable lives inside the function. When `App()` is called again for a re-render,
`let count = 0` resets it to zero. `useState` stores the value outside the function, in
React's internal state, so it persists across re-renders.

**`onPress={incrementCount}` explained:**
`onPress` is a prop (a property) of `TouchableOpacity` that accepts a function. When the
button is pressed, React Native calls that function. Here we pass `incrementCount`, which
calls `setCount(count + 1)`.

We pass `incrementCount` (the function itself), not `incrementCount()` (the result of
calling it). `onPress={incrementCount()}` would call `incrementCount` immediately during
rendering, not when the button is pressed.

**`{count}` in JSX:** Curly braces `{}` inside JSX embed a JavaScript expression. `{count}`
evaluates the variable `count` and renders its value as text.

**Template literals:** An alternative way to build strings with embedded values:

```typescript
const message = `Count is: ${count}`
```

Backticks (`` ` ``) delimit a template literal. `${...}` embeds any JavaScript expression.
The `+` operator concatenates strings; template literals are cleaner for complex strings.

**CS lens — the call stack in action:**
When the button is pressed, the call stack looks like this:
```
[TouchableOpacity press handler]
  → [incrementCount]
    → [setCount]
      → [React's internal state update]
    ← [returns]
  ← [returns]
← [returns]
```
Then React schedules a re-render, `App` is called again, and the stack for rendering
`App` is built fresh.

**SE lens — single responsibility:**
`incrementCount` has one job: increment the counter. It does not update the UI, log
anything, or do network calls. When functions have one responsibility, they are easy
to test and easy to change.

Add the remaining styles:

```typescript
const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f9fafb',
  },
  heading: {
    fontSize: 28,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 32,
  },
  countDisplay: {
    fontSize: 64,
    fontWeight: '700',
    color: '#3b82f6',
    marginBottom: 32,
  },
  button: {
    backgroundColor: '#3b82f6',
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 8,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
})
```

### Step 7 — Immutability

**Immutability** means not modifying data in place — instead, creating a new value.

```typescript
// Mutable approach (do not do this in React)
count = count + 1   // modifies count directly

// Immutable approach (correct in React)
setCount(count + 1) // creates a new value and asks React to store it
```

Why does immutability matter? React uses the old and new values to decide whether to
re-render. If you mutate state directly (`count = count + 1`), React never sees a change
— you modified the existing value without going through `setCount`. The screen never
updates. Bugs caused by mutation are particularly hard to trace because the data changed
but React did not know.

This principle extends to objects. Never do `user.name = "Bob"` to update React state.
Instead: `setUser({ ...user, name: "Bob" })` — create a new object with the updated field.

The `...user` syntax is the **spread operator**: it copies all properties from `user`
into the new object. `{ ...user, name: "Bob" }` means "all of user's properties, but
with `name` replaced by `"Bob"`."

---

## Connect the Pieces

The `useState` hook is the foundation of every interactive feature in this app. Every
lesson from here that shows updated data on screen — lesson progress, streak counts,
search results — will use the same `[value, setter] = useState(initial)` pattern.

The immutability principle introduced here is the same principle that protects database
records from partial updates (Lesson 12) and that makes the functional programming
patterns in Lesson 33 safe: pure transformations on immutable data are easy to reason
about, easy to test, and free of the mutation bugs that cause state corruption.

`useState` is one of React's **hooks** — functions that give components access to React
features. The next React concept, `useEffect`, will appear in Lesson 08, and
`useReducer` immediately after. They all follow the same rule: call them at the top
level of a component, not inside conditions or loops.

In production software, every major UI framework manages mutable state similarly:
SwiftUI uses `@State`, Flutter uses `setState`, Vue uses `ref`. The pattern — "declare
state, bind it to the UI, trigger updates through a setter" — is universal.

---

## What Breaks Without This

If you replace `setCount(count + 1)` with `count = count + 1`, the number on screen
never changes. `count` is declared `const` — TypeScript reports a compile error:
`Cannot assign to 'count' because it is a constant`. If you used `let` instead of
`useState`, `count` would increment in memory but React would never re-render, and the
screen would remain showing `0`. Mutation and state management are separate concerns.

---

## Definition of Done

- [ ] The counter increments each time the button is pressed
- [ ] The count is visible on screen and updates without a page reload
- [ ] `npm start` shows no TypeScript errors in the terminal
- [ ] You can answer: what is the difference between `const` and `let`?
- [ ] You can answer: why does React require `setCount` instead of `count = count + 1`?
- [ ] You can answer: what is the difference between a primitive type and a reference type?
- [ ] You can answer: what is the call stack and what causes a stack overflow?
- [ ] `git commit` with a message explaining why — "Add counter to understand React state and TypeScript types" not "lesson 02"
