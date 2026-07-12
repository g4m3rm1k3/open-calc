# Building a Context From Scratch

Today we study **avoiding prop drilling by construction**. You've already
*consumed* an existing Context (`useGlobalTheme()`, in the Flutter Playground lesson
set) without seeing how one is built. Today you build one — a real, small,
genuinely useful piece of shared state for this app — from nothing, using the exact
three-part shape every Context in this codebase (`ThemeContext.jsx`,
`AuthContext.jsx`, `PinsContext.jsx`, `ProgressContext.jsx`) already follows.

---

## What You Will Build

A real `RecentLabsContext` — a small, genuinely useful piece of shared state that
remembers the last few labs you've opened, app-wide, so any component (a future
"Recently Opened" widget, a Start Menu section, anything) could read it without
needing it passed down as a prop. You'll build the Context, the Provider, the
consuming hook, wire the Provider into the app's real root, and prove it works with
one small real consumer.

---

## What You Need to Know First

`useState` (Flutter Playground Lesson 3) and consuming a Context via a custom hook
(Flutter Playground Lesson 4). Nothing else is assumed.

---

## The Lesson

### Step 1 — The Problem, Made Concrete

Imagine three unrelated components — the Start Menu, a home page widget, and a
debug panel — all needing to know "what are the last 5 labs the user opened."
Without Context, the component that *knows* this (wherever a lab actually gets
opened — `usePinLauncher.js`, in this app's real code) would need to pass that list
down as a prop through every layer of the component tree between it and each of
those three consumers — even through components that don't care about it at all,
purely to relay it further down. That's **prop drilling**, named in Flutter
Playground Lesson 4's Step 1, now about to be solved instead of just named.

### Step 2 — `createContext`: A Box With No Value Yet

#### Concept lab: the smallest possible Context, with no Provider at all

Disposable — `src/labs/_scratch/CounterContext.tsx`. This one stays disposable for
several steps in a row, deliberately, because the *mistakes* a Context makes before
it's properly wired are as instructive as the working version.

```typescript
import { createContext, useContext } from 'react'

const CounterContext = createContext<number | undefined>(undefined)

export function useCounterContext() {
  return useContext(CounterContext)
}
```

**`createContext<number | undefined>(undefined)`** — `createContext` builds a
Context object: a container that *can* hold a shared value, once something provides
one. The type argument `<number | undefined>` says: whatever value ends up in this
Context is either a real `number`, or `undefined` — the "no Provider is present at
all" case. The `(undefined)` argument is the **default value** — what
`useContext(CounterContext)` returns if it's called by a component that isn't
wrapped in a matching Provider anywhere above it in the tree.

**`useContext(CounterContext)`** — a built-in React hook (not one you write
yourself) that reads whatever value the *nearest* enclosing Provider for this exact
Context object is currently providing — or the default, if there is none.
`useCounterContext` is a thin wrapper around it, following exactly the naming
convention `useGlobalTheme()` already established: a custom hook, not the raw
`useContext` call, is what other files actually import and use.

Render a tiny probe consuming this — temporarily in `HomePage.jsx`:

```typescript
import { useCounterContext } from '../labs/_scratch/CounterContext.tsx'
// ...
const count = useCounterContext()
console.log('Context value with no Provider:', count)
```

**Expected output**, in the console: `Context value with no Provider: undefined` —
proving the default value is exactly what you get when nothing above this component
in the tree is actually providing a real one. This is worth seeing before building
the Provider, specifically so the *next* step's success is a contrast you actually
witnessed, not just told about.

**CS lens:** `createContext` is building an **implicit, tree-scoped global** — a
value reachable by any descendant, without being explicitly passed through every
level, but still scoped to wherever a Provider actually wraps the tree (unlike a
true global variable, which has no scoping at all).

**SE lens:** The `number | undefined` default, rather than just `number`, is a
**deliberate honesty about an unprovided Context** — TypeScript now forces every
consumer to handle the "nobody's providing this" case explicitly, rather than
silently assuming a value is always there and crashing unpredictably later if a
Provider is ever accidentally left out somewhere in the tree.

---

### Step 3 — `Provider`: Actually Supplying a Value

Extend the same disposable file:

```typescript
import { createContext, useContext, useState, type ReactNode } from 'react'

const CounterContext = createContext<number | undefined>(undefined)

export function CounterProvider({ children }: { children: ReactNode }) {
  const [count] = useState(42)
  return <CounterContext.Provider value={count}>{children}</CounterContext.Provider>
}

export function useCounterContext() {
  return useContext(CounterContext)
}
```

**`{ children }: { children: ReactNode }`** — `children` is a special prop every
component can accept: whatever JSX was written *between* its opening and closing
tags by whoever renders it (`<CounterProvider>THIS PART</CounterProvider>`).
`ReactNode` is a TypeScript type (imported from `react`) meaning "anything React can
render" — a string, a number, JSX, `null`, an array of any of those — the correct,
general type for "arbitrary renderable content," which is exactly what `children`
always is.

**`<CounterContext.Provider value={count}>{children}</CounterContext.Provider>`** —
every Context object created by `createContext` automatically comes with a
`.Provider` component. Wrapping any JSX in it, with a `value` prop, means: every
descendant of this Provider, no matter how deep, calling `useContext(CounterContext)`
(or, here, `useCounterContext()`) will get `count` back — not the `undefined`
default from Step 2, because a real Provider is now present above them.

Update the probe: wrap it in the new Provider and see the real value.

```typescript
import { CounterProvider, useCounterContext } from '../labs/_scratch/CounterContext.tsx'

function Probe() {
  const count = useCounterContext()
  return <p>Context value with a Provider: {count}</p>
}

// rendered as: <CounterProvider><Probe /></CounterProvider>
```

**Expected output:** "Context value with a Provider: 42" — the same hook, the same
component, now returning the real value instead of `undefined`, purely because a
Provider now wraps it. **This is the entire mechanism.** Everything else about
Context — more complex values, setters, multiple consumers — is this same shape,
just with a richer `value`.

Delete `src/labs/_scratch/CounterContext.tsx` and its `HomePage.jsx` probes now.

**CS lens:** `.Provider` establishes a **scope boundary in the component tree** —
`useContext` doesn't search the whole app, it searches *upward* from wherever it's
called until it finds the nearest matching Provider. Nest two `CounterContext.Provider`s
with different values, and a component between them sees the *inner* one — the same
"nearest enclosing scope wins" rule as variable shadowing in ordinary JavaScript
block scopes.

**SE lens:** Splitting `CounterProvider` (owns and computes the value) from
`useCounterContext` (reads it) and from whatever eventually calls `<CounterProvider>`
(decides *where in the tree* it's available) is **separation of concerns** applied
to shared state specifically: three distinct responsibilities, three distinct places
in the code, none of which need to know the internals of the others.

---

### Step 4 — Real Project Code: `RecentLabsContext`

Create `src/context/RecentLabsContext.tsx`:

```typescript
import { createContext, useContext, useState, type ReactNode } from 'react'

interface RecentLabsContextValue {
  recentLabKeys: string[]
  recordLabOpened: (labKey: string) => void
}

const RecentLabsContext = createContext<RecentLabsContextValue | undefined>(undefined)

const MAX_RECENT = 5

export function RecentLabsProvider({ children }: { children: ReactNode }) {
  const [recentLabKeys, setRecentLabKeys] = useState<string[]>([])

  function recordLabOpened(labKey: string) {
    setRecentLabKeys(previous => {
      const withoutDuplicate = previous.filter(key => key !== labKey)
      return [labKey, ...withoutDuplicate].slice(0, MAX_RECENT)
    })
  }

  return (
    <RecentLabsContext.Provider value={{ recentLabKeys, recordLabOpened }}>
      {children}
    </RecentLabsContext.Provider>
  )
}

export function useRecentLabs(): RecentLabsContextValue {
  const value = useContext(RecentLabsContext)
  if (!value) {
    throw new Error('useRecentLabs must be called inside a RecentLabsProvider')
  }
  return value
}
```

**`interface RecentLabsContextValue { recentLabKeys: string[]; recordLabOpened: (labKey: string) => void }`**
— this Context shares *two* things at once: the data (`recentLabKeys`) and a
function to change it (`recordLabOpened`) — a richer shape than Step 3's bare
`number`, and the far more common real shape: a Context usually shares both a value
and a controlled way to update it, the same "expose a setter, not direct mutation
access" discipline `useState` itself enforces (Flutter Playground Lesson 3's SE
lens), just extended to something shared app-wide instead of owned by one component.

**`previous.filter(key => key !== labKey)` then `[labKey, ...previous].slice(0, MAX_RECENT)`**
— `filter` (a new array method, explained now) walks an array and keeps only the
elements for which the given function returns `true` — here, "every key except this
one," removing any existing occurrence of `labKey` first, so reopening an
already-recent lab moves it to the front instead of appearing twice. `[labKey,
...withoutDuplicate]` uses the **spread operator** (`...`) — first appearance in this
lesson set — which unpacks an existing array's elements into a new array literal;
`[labKey, ...withoutDuplicate]` means "a new array starting with `labKey`, followed
by every element of `withoutDuplicate` in order." `.slice(0, MAX_RECENT)` then keeps
only the first `MAX_RECENT` (5) elements, discarding anything older.

**`useRecentLabs()`'s `if (!value) throw new Error(...)`** — a **guard clause**
(named and used before, in `matrix-reducer-copy-button`'s Lesson 2, if you've read
it): if `useContext` returns the `undefined` default (meaning: whoever called this
hook forgot to wrap their component tree in `RecentLabsProvider`), this throws
immediately, loudly, with a specific, actionable message — instead of returning
`undefined` and letting every single consumer separately have to check for it
themselves, the way Step 2's raw Context required. This is the real reason for the
`| undefined` in the Context's own type: it forces exactly one place
(`useRecentLabs` itself) to handle the "missing Provider" case, once, so every real
consumer of `useRecentLabs()` can trust its return type is always the real,
complete `RecentLabsContextValue` — never `undefined` — without checking for it
themselves every time.

---

### Step 5 — Wiring the Provider Into the Real App

Every Context in this app is provided once, near the very top of the component
tree, in `src/App.jsx` — open it and find where the existing providers
(`AuthProvider`, `PinsProvider`, `ProgressProvider`, and others) wrap the rest of
the app. Add yours alongside them:

```typescript
import { RecentLabsProvider } from './context/RecentLabsContext.tsx'
// ...
<RecentLabsProvider>
  {/* the existing app tree */}
</RecentLabsProvider>
```

**Why it has to wrap *around* everything that might use it, not just sit next to
it:** `useContext` only ever searches *upward*, toward the root — a component can
only see a Provider that is one of its actual ancestors in the rendered tree. Place
`RecentLabsProvider` anywhere *except* near the true root, and every component
outside its wrapped subtree would get the `undefined` default (or, with your guard
clause, the thrown error) no matter how correctly everything else was written.

---

### Step 6 — One Real Consumer, Proving the Whole Chain

In `usePinLauncher.js` (the real file that already runs every time a lab is
opened, from earlier session work), call `recordLabOpened` inside `openPin`:

```javascript
import { useRecentLabs } from '../context/RecentLabsContext.tsx'
// inside usePinLauncher():
const { recordLabOpened } = useRecentLabs()
// inside openPin, wherever a lab is actually launched:
if (pin.labKey) recordLabOpened(pin.labKey)
```

Then, anywhere else entirely — a temporary `HomePage.jsx` probe is enough to prove
it, no need to build a real UI yet:

```typescript
import { useRecentLabs } from '../context/RecentLabsContext.tsx'
// ...
const { recentLabKeys } = useRecentLabs()
console.log('Recently opened labs:', recentLabKeys)
```

Run the app, open two or three different labs from the Start Menu or Explore, and
watch the console. **Expected output:** `recentLabKeys` grows with each new lab
opened, most recent first, capped at 5 — read by a component (`HomePage.jsx`) that
has *no idea* `usePinLauncher.js` is the thing updating it, and `usePinLauncher.js`
has no idea `HomePage.jsx` (or anything else) is reading it. That mutual
independence, with neither side holding a reference to the other, is the entire
payoff of Context, proven with real, currently-running code instead of the
disposable `CounterContext` from earlier steps.

Remove the temporary `HomePage.jsx` console.log probe now (the real
`recordLabOpened` call inside `usePinLauncher.js` should stay — it's genuinely
useful, real project code, not a probe).

---

## Connect the Pieces

`RecentLabsContext.tsx` follows the exact three-part shape `ThemeContext.jsx`
already used, which you consumed without building in Flutter Playground Lesson 4:
`createContext` (the box), a `Provider` component (owns the real state via
`useState` and supplies it), and a custom consuming hook (`useRecentLabs`, wrapping
`useContext` with a guard clause `useGlobalTheme()` itself doesn't bother with,
because `ThemeContext.jsx`'s Provider is guaranteed to wrap the whole app already).
You didn't just learn to read this pattern — you now know how to build a new one
any time a genuinely app-wide piece of shared state is needed.

---

## What Breaks Without This

Skip Step 5 (never wrap the app in `RecentLabsProvider`) and every call to
`useRecentLabs()` throws the guard-clause error the moment it runs — loud and
immediate, exactly the fail-fast behavior Flutter Playground Lesson 1 first
introduced, now protecting a Context instead of a function parameter.

Skip the guard clause itself (just `return useContext(RecentLabsContext)` with no
check) under the same missing-Provider mistake: `useRecentLabs()` silently returns
`undefined`, and the very next line — `const { recentLabKeys } = useRecentLabs()` —
crashes with "Cannot destructure property 'recentLabKeys' of undefined," a real
error, but one pointing at the *destructuring* line, nowhere near the actual mistake
(the missing Provider, possibly many files away) — a much harder bug to trace back
to its real cause than the guard clause's specific, immediate message.

---

## Definition of Done

- [ ] `src/context/RecentLabsContext.tsx` exists with `createContext`, a
      `RecentLabsProvider`, and a `useRecentLabs` hook with a guard clause
- [ ] `RecentLabsProvider` wraps the real app tree in `App.jsx`
- [ ] `usePinLauncher.js`'s `openPin` calls `recordLabOpened` for real, on every
      lab launch
- [ ] You opened several labs and watched `recentLabKeys` update, most-recent-first,
      capped at 5, with no duplicates
- [ ] You can explain, without looking back, what `useContext` searches for and in
      which direction through the tree
- [ ] You can explain why the guard clause in `useRecentLabs` exists, and what error
      message you'd see without it, at what line
- [ ] `_scratch/CounterContext.tsx` and every temporary probe are deleted
- [ ] `git commit` explaining why: for example, "Add RecentLabsContext — a small,
      genuinely shared piece of app state (last 5 labs opened), wired through
      usePinLauncher with zero coupling between the writer and any future reader"
