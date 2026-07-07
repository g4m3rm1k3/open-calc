# React Calculator — Lesson 20 — Custom Hooks: useMemory()

## What You Will Build

The exact same working MS/MR/MC/M+/M- buttons from lesson 19 — nothing
changes on screen — with memory's logic extracted out of
`calculatorReducer` entirely and into its own reusable function,
`useMemory()`, that any future component could call to get a fully
working, independent memory slot in a single line.

---

## What You Need to Know First

Lesson 19 — memory folded into `CalculatorState`/`CalculatorAction`/
`calculatorReducer`, working correctly.

---

## Step 1 — Why Pull Memory Back Out of the Reducer

Memory in lesson 19 works correctly, but notice what it actually has in
common with `expression` and `result`: nothing. Memory doesn't care what's
being typed, doesn't participate in parsing, and doesn't need to share a
single `switch` statement with digit or operator handling at all — it
ended up there mostly because `useReducer` was the tool already in hand.
Two unrelated concerns sharing one reducer is a smaller-scale version of
the exact problem lesson 08 solved by giving the math engine its own file:
things that don't depend on each other shouldn't have to change together
just because they happen to live in the same place.

**Rules of Hooks — required before writing a custom one.** Every hook this
project has used so far (`useState`, `useReducer`, `useContext`) has been
called directly inside a component function, unconditionally, at the top
level. This isn't a stylistic preference — it's a real constraint React
depends on: hooks are tracked internally by the **order they're called
in**, matched up call-by-call across every render of the same component.
Calling a hook inside an `if`, a loop, or after an early `return` would
shift that order on some renders but not others, silently corrupting which
piece of remembered state a later hook call actually gets back. This is
why every hook in this project — including the one about to be written —
is always called the same way, every single render, no exceptions. It's
also why hook names conventionally start with `use`: tooling (and other
developers reading the code) rely on that prefix to know a function
follows this rule and needs to be called the same way.

---

## Step 2 — Write `useMemory`

Create `useMemory.ts`:

```typescript
interface UseMemoryResult {
  memory: number;
  memoryStore: (value: number) => void;
  memoryClear: () => void;
  memoryAdd: (value: number) => void;
  memorySubtract: (value: number) => void;
}

function useMemory(): UseMemoryResult {
  const [memory, setMemory] = React.useState(0);

  function memoryStore(value: number): void {
    setMemory(value);
  }

  function memoryClear(): void {
    setMemory(0);
  }

  function memoryAdd(value: number): void {
    setMemory(memory + value);
  }

  function memorySubtract(value: number): void {
    setMemory(memory - value);
  }

  return { memory, memoryStore, memoryClear, memoryAdd, memorySubtract };
}
```

**Walkthrough — a custom hook is just a function that calls other hooks.**
There is no special syntax for defining a hook — `useMemory` is an
ordinary function, exactly like `add` or `requireElement`. What makes it a
*hook*, specifically, is that it calls `React.useState` internally and
returns something built from that state. Any component that calls
`useMemory()` gets its own completely independent `memory` value and its
own set of functions to change it — calling `useMemory()` twice, from two
different components, produces two separate memory slots that know
nothing about each other, the same way two separate `useState` calls
would.

**Walkthrough — `UseMemoryResult`, and returning an object instead of an
array.** `useState` and `useReducer` both return a two-item array,
accessed by position (`const [value, setValue] = ...`). `useMemory`
returns a plain object instead, accessed by name
(`const { memory, memoryStore } = ...`). Both are valid choices — arrays
work well for exactly two related values where order is obvious (a value
and its setter); an object works better here because there are five
things being returned, and `memory`, `memoryStore`, `memoryAdd` communicate
their purpose by name in a way `[a, b, c, d, e]` never could.

**CS lens — this is encapsulation again, at the hook level.** Nothing
outside `useMemory` can see the underlying `useState` call it's built on
— a component using `useMemory()` has no way to accidentally call
`setMemory` directly, bypassing `memoryAdd`'s logic. The *only* surface
exposed is the five named operations this lesson decided memory should
support. This is the same principle lesson 07 used to explain why React
doesn't let components reach into each other's state directly, now
applied to hiding a hook's own internal implementation from whatever calls
it.

---

## Step 3 — Remove Memory From the Reducer, Use the Hook Instead

Remove `memory` from `CalculatorState`, and remove the five memory
variants from `CalculatorAction` along with their five branches in
`calculatorReducer` — memory no longer needs to exist inside this reducer
at all.

Update `Calculator.tsx`:

```tsx
function Calculator() {
  const [state, dispatch] = React.useReducer(calculatorReducer, { expression: "", result: null });
  const { memory, memoryStore, memoryClear, memoryAdd, memorySubtract } = useMemory();
  const [scientificMode, setScientificMode] = React.useState(false);
  const [angleMode, setAngleMode] = React.useState<AngleMode>("degrees");

  function toggleAngleMode(): void {
    setAngleMode(angleMode === "degrees" ? "radians" : "degrees");
  }

  function handleMemoryStore(): void {
    const outcome = evaluate(state.expression === "" ? "0" : state.expression);
    if (outcome.kind === "success") memoryStore(outcome.value);
  }

  function handleMemoryRecall(): void {
    dispatch({ type: "digit", digit: "" }); // placeholder — see below
  }

  function handleMemoryAdd(): void {
    const outcome = evaluate(state.expression === "" ? "0" : state.expression);
    if (outcome.kind === "success") memoryAdd(outcome.value);
  }

  function handleMemorySubtract(): void {
    const outcome = evaluate(state.expression === "" ? "0" : state.expression);
    if (outcome.kind === "success") memorySubtract(outcome.value);
  }

  // ...rest unchanged...
}
```

**Stop and notice a real problem before finishing this step.** `memoryRecall`
needs to *replace* the current expression with the recalled number — but
that's a change to `state`, which now only `calculatorReducer` is allowed
to make, and `useMemory` has no way to reach into a *different* piece of
state that isn't its own. The placeholder above is deliberately wrong,
left in to make this visible rather than silently worked around.

**The real fix: add one small action back to `CalculatorAction`,** just
for receiving an already-known value:

```tsx
type CalculatorAction =
  | { type: "digit"; digit: string }
  // ...existing variants...
  | { type: "setExpression"; value: string };
```

```tsx
case "setExpression":
  return { ...state, expression: action.value, result: null };
```

```tsx
function handleMemoryRecall(): void {
  dispatch({ type: "setExpression", value: String(memory) });
}
```

**Walkthrough — this is the real, honest shape of two independent pieces
of state that occasionally need to affect each other.** `useMemory` owns
`memory` completely; `calculatorReducer` owns `expression` completely.
Neither reaches into the other directly — `Calculator` itself, the
component that has access to both, is the one place that reads a value
out of one and explicitly hands it to the other, through the same
`dispatch` mechanism every other change to `expression` already goes
through. This is a small amount of extra wiring in exchange for `memory`
and `expression` never being able to drift out of sync through some
untracked back channel.

Wire `MemoryPanel`'s props to `handleMemoryStore`, `handleMemoryRecall`,
`memoryClear`, `handleMemoryAdd`, and `handleMemorySubtract`. Click
**▶ Preview** and confirm every memory button still works exactly as it
did at the end of lesson 19.

---

## Connect the Pieces

```
useMemory.ts     a custom hook — an independent memory slot, usable by
                 any component, with no knowledge of calculatorReducer
Calculator.tsx   a small "setExpression" action, the one deliberate bridge
                 between two otherwise-independent pieces of state
```

---

## What Breaks Without This

**Calling `React.useState` conditionally inside `useMemory`** (for
example, `if (someCondition) { const [memory, setMemory] = React.useState(0); }`):
violates the Rules of Hooks named in Step 1. React would either throw a
real runtime error ("Rendered fewer hooks than expected") or, worse,
silently mix up which stored value belongs to which hook call on a render
where the condition's truth value changed — a category of bug that can
look like completely unrelated state getting corrected values, far from
where the actual mistake was made.

---

## Definition of Done

- [ ] Memory buttons work exactly as they did at the end of lesson 19
- [ ] `useMemory` contains zero references to `expression`, `result`, or `calculatorReducer`
- [ ] You can explain the Rules of Hooks and why they exist
- [ ] You can explain why `memoryRecall` needed a new reducer action instead of `useMemory` reaching into `state` directly

---

*Next: Lesson 21 — Forms: A Formula Editor. A real, controlled form lets a
user name and save a formula — the Formula Library begins.*
