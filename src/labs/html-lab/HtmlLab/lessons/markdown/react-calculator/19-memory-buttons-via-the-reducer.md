# React Calculator — Lesson 19 — Memory Buttons via the Reducer

## What You Will Build

Working MS, MR, MC, M+, and M- buttons — a calculator memory that stores
one number, recalls it, clears it, and adds to or subtracts from it,
independent of whatever's currently being typed.

---

## What You Need to Know First

Lesson 18 — `calculatorReducer`, `CalculatorAction`, and `useReducer`
replacing individual `useState`/handler pairs for `expression` and
`result`.

---

## Step 1 — Add `memory` to the State, and Feel the Consequence

Add a third field to `CalculatorState`:

```tsx
interface CalculatorState {
  expression: string;
  result: string | null;
  memory: number;
}
```

**The problem this immediately causes, on purpose.** Every existing branch
of `calculatorReducer` currently returns a brand-new object literal built
from scratch — `{ expression: ..., result: ... }` — with no `memory`
field at all. TypeScript will now flag every one of them: `Property
'memory' is missing`. This is real, useful friction, not an accident to
work around quietly. Update every existing branch to spread the incoming
`state` first, then override only what actually changes:

```tsx
case "digit":
  return { ...state, expression: state.expression + action.digit, result: null };
```

Apply the same `{ ...state, ... }` pattern to every other existing branch
(`operator`, `paren`, `equals`, `percent`, `signChange`, `function`,
`clear`).

**Walkthrough — `{ ...state, expression: ..., result: null }`, object
spread.** `...state` copies every field from `state` into the new object
literal first; anything written *after* it in the literal overrides that
copied value. This is the object equivalent of the immutable array update
pattern lessons 06 and 22 rely on — `{ ...state, memory: newValue }`
produces a whole new object, leaving `state` itself untouched, exactly the
way `[...array, newItem]` produces a new array without mutating the
original. Writing every branch this way from the start means adding a
*fourth* field to `CalculatorState` later would only require updating the
branches that actually care about it — every other branch, already using
`...state`, carries new fields forward automatically without being
touched.

---

## Step 2 — Add Five Memory Actions

```tsx
type CalculatorAction =
  | { type: "digit"; digit: string }
  | { type: "operator"; operator: string }
  | { type: "paren"; paren: string }
  | { type: "equals" }
  | { type: "percent" }
  | { type: "signChange" }
  | { type: "function"; name: string; angleMode: AngleMode }
  | { type: "clear" }
  | { type: "memoryStore" }
  | { type: "memoryRecall" }
  | { type: "memoryClear" }
  | { type: "memoryAdd" }
  | { type: "memorySubtract" };
```

Add five branches to `calculatorReducer`:

```tsx
case "memoryStore": {
  const outcome = evaluate(state.expression === "" ? "0" : state.expression);
  if (outcome.kind !== "success") return { ...state, result: outcome.message };
  return { ...state, memory: outcome.value };
}

case "memoryRecall":
  return { ...state, expression: String(state.memory), result: null };

case "memoryClear":
  return { ...state, memory: 0 };

case "memoryAdd": {
  const outcome = evaluate(state.expression === "" ? "0" : state.expression);
  if (outcome.kind !== "success") return { ...state, result: outcome.message };
  return { ...state, memory: state.memory + outcome.value };
}

case "memorySubtract": {
  const outcome = evaluate(state.expression === "" ? "0" : state.expression);
  if (outcome.kind !== "success") return { ...state, result: outcome.message };
  return { ...state, memory: state.memory - outcome.value };
}
```

Update `useReducer`'s initial state to include `memory: 0`:

```tsx
const [state, dispatch] = React.useReducer(calculatorReducer, { expression: "", result: null, memory: 0 });
```

**Walkthrough.** Every memory action follows the same "evaluate, then
transform" shape percent and sign-change established in lesson 14 —
`memoryStore` and `memoryAdd`/`memorySubtract` all call `evaluate` on
whatever's currently displayed before touching `memory` at all, so typing
`12+8` and pressing `MS` correctly stores `20`, not the raw, uncomputed
text. `memoryRecall` does the reverse: takes the stored number and starts
a fresh expression from it, the same shape `handlePercent` used to move a
computed value back into `expression`.

**CS lens — a calculator's memory is the same idea as a CPU's
accumulator register.** Long before high-level state management existed,
early calculators and the earliest computers held exactly one number in a
dedicated physical storage slot — an **accumulator** — that instructions
could read from, write to, add to, or subtract from, one operation at a
time, completely independent of whatever else was being computed. `MS`,
`MR`, `MC`, `M+`, and `M-` are the direct descendants of that idea,
unchanged in concept for decades: one slot, five operations, entirely
separate from the "current calculation" being built up elsewhere.
`state.memory` *is* an accumulator, implemented as a plain TypeScript
number instead of a physical register.

---

## Step 3 — A New Component for the Memory Buttons

Create `MemoryPanel.tsx`:

```tsx
interface MemoryPanelProps {
  onMemoryStore: () => void;
  onMemoryRecall: () => void;
  onMemoryClear: () => void;
  onMemoryAdd: () => void;
  onMemorySubtract: () => void;
}

function MemoryPanel({ onMemoryStore, onMemoryRecall, onMemoryClear, onMemoryAdd, onMemorySubtract }: MemoryPanelProps) {
  return (
    <div className="memory-panel">
      <Button label="MS" onClick={onMemoryStore} />
      <Button label="MR" onClick={onMemoryRecall} />
      <Button label="MC" onClick={onMemoryClear} />
      <Button label="M+" onClick={onMemoryAdd} />
      <Button label="M-" onClick={onMemorySubtract} />
    </div>
  );
}
```

Render it from `Calculator.tsx`, always visible, alongside the keypad:

```tsx
<MemoryPanel
  onMemoryStore={() => dispatch({ type: "memoryStore" })}
  onMemoryRecall={() => dispatch({ type: "memoryRecall" })}
  onMemoryClear={() => dispatch({ type: "memoryClear" })}
  onMemoryAdd={() => dispatch({ type: "memoryAdd" })}
  onMemorySubtract={() => dispatch({ type: "memorySubtract" })}
/>
```

Click **▶ Preview**. Type `20`, press `MS`. Clear the display, type `5`,
press `M+`. Press `MC`, then `MR` — the display shows `0`. Press `MR`
again without clearing memory first (repeat the `20`, `MS` step) — the
display shows `20`.

**SE lens — this is exactly why lesson 18's reducer refactor was worth
doing before this lesson, not after.** Adding memory meant: one new field
on `CalculatorState`, five new variants on `CalculatorAction`, five new
`switch` branches, and one new component. Not one existing branch's
*logic* changed — only its literal syntax, to carry the new field forward.
Had memory been added on top of lesson 17's separate `useState` calls
instead, it would have meant a fifth independent `useState`, plus finding
and updating every one of eight separate handler functions individually to
make sure none of them needed to know about it — exactly the kind of
scattered change a reducer's single switch statement was built to prevent.

---

## Connect the Pieces

```
Calculator.tsx     CalculatorState gains memory: number
                   five new CalculatorAction variants and reducer branches
MemoryPanel.tsx    a new component, single responsibility: memory buttons
```

---

## What Breaks Without This

**Forgetting to spread `...state` in a new branch, e.g. `case
"memoryClear": return { memory: 0 };`:** compiles to a runtime bug, not a
type error in this specific case, since a bare `{ memory: 0 }` is missing
`expression` and `result` entirely — TypeScript *would* catch this as a
missing-properties error, exactly as it did in Step 1, which is the real
protection here: the compiler refuses to let a branch silently forget a
field, converting what would otherwise be a subtle runtime bug (memory
clearing also silently wiped out whatever expression was mid-typing) into
an error caught before the code ever runs.

---

## Definition of Done

- [ ] MS, MR, MC, M+, and M- all work correctly and independently of the current expression
- [ ] Every reducer branch uses `{ ...state, ... }` rather than a from-scratch object literal
- [ ] You can explain what an accumulator is and how it relates to `state.memory`
- [ ] You can explain why adding memory to a reducer-based design touched fewer places than it would have with separate `useState` calls

---

*Next: Lesson 20 — Custom Hooks: useMemory(). The same memory behavior,
extracted into one reusable line any future component could call.*
