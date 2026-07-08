# React Calculator — Lesson 18 — Outgrowing useState: Calculator Actions as a Reducer

## What You Will Build

The exact same working calculator — nothing changes on screen — with its
internals reorganized around one function, `calculatorReducer`, that
describes every possible thing a button press can do to the calculator's
state, in one place, as data instead of as seven separate functions each
calling `setState` by hand.

---

## What You Need to Know First

Lesson 17 — a working calculator with `expression`, `result`,
`scientificMode`, and `angleMode`, each its own `useState`, each with its
own handler function performing its own `setState` calls.

---

## Step 1 — Name What's Starting to Strain

`Calculator.tsx` now has four separate pieces of state and six handler
functions (`handleDigit`, `handleOperator`, `handleParen`, `handleEquals`,
`handlePercent`, `handleSignChange`, `handleFunction`, `handleClear` — eight,
in fact), each independently calling `setExpression` and/or `setResult`.
Nothing is broken. But three real problems are growing:

1. **Every handler repeats the same shape** — read some state, compute a
   new value, call one or two setters — with no single place describing
   "here is the full list of things that can happen to this calculator."
2. **Testing one action in isolation is awkward.** There's no way to ask
   "what would `expression` become if the user pressed `7` right now?"
   without actually rendering the component and simulating a real click.
3. **Lesson 19 is about to add five more actions** (MS, MR, MC, M+, M-)
   for calculator memory. Eight growing to thirteen handler functions,
   each independently touching state, is exactly the kind of growth that
   becomes hard to follow later, even though no single addition looks
   like a problem in the moment it's made.

---

## Step 2 — Describe Every Action as Data

In `Calculator.tsx`, above the `Calculator` function:

```tsx
type CalculatorAction =
  | { type: "digit"; digit: string }
  | { type: "operator"; operator: string }
  | { type: "paren"; paren: string }
  | { type: "equals" }
  | { type: "percent" }
  | { type: "signChange" }
  | { type: "function"; name: string; angleMode: AngleMode }
  | { type: "clear" };
```

**Walkthrough.** Another discriminated union — the same tool that shaped
`Token`, `ExpressionNode`, and `CalculatorResult` in `engine.ts`, applied
here to something new: not a piece of data being processed, but a
**description of an event that happened.** `{ type: "digit"; digit: "7" }`
doesn't perform anything by itself — it's an inert, plain object stating
"the user pressed the digit 7," nothing more. Every distinct thing this
calculator can be asked to do gets its own variant here, in one place —
which means this union is, by itself, a complete, readable list of
everything the calculator supports, without reading a single line of logic.

**CS lens — this is the Command pattern, restated in TypeScript's own
terms.** Representing an action as a plain, inert piece of data — rather
than immediately calling a function — is a well-known design pattern:
capture "what should happen" as a value first, decide "how to actually do
it" separately, later. This separation is what makes the next two steps
possible: a reducer that interprets these actions, and (in a real
production app, though not needed here) the ability to log, replay, or
even undo a sequence of actions, since each one is just data that can be
stored, not a function call that already happened and is gone.

**CS lens — a reducer is a finite state machine, generalized.** Lesson 10
named the eager operator model a **state machine** — a system with a fixed
set of states and rules for moving between them — and found it too small
a machine to represent this calculator correctly. `calculatorReducer` is
also a state machine, but a much larger, more capable one: its "states"
are every possible `CalculatorState` value (effectively unlimited, since
`expression` can be any string), and its "transitions" are exactly the
branches of the `switch` — one named, explicit rule per `CalculatorAction`
variant, for how one state becomes the next. A **finite** state machine
technically requires a *fixed*, countable set of states, which
`CalculatorState` doesn't quite satisfy (an unbounded string field makes
the state space infinite) — worth being precise about even while using
the same mental model: `calculatorReducer` is a state machine in the
general sense (states, actions, deterministic transitions between them),
looser than the strict finite-state-machine definition lesson 28's
`route` (a small, genuinely fixed set: `"basic"`, `"scientific"`,
`"settings"`) satisfies exactly.

---

## Step 3 — Write the Reducer

```tsx
interface CalculatorState {
  expression: string;
  result: string | null;
}

function calculatorReducer(state: CalculatorState, action: CalculatorAction): CalculatorState {
  switch (action.type) {
    case "digit":
      return { expression: state.expression + action.digit, result: null };

    case "operator":
      return { expression: state.expression + action.operator, result: null };

    case "paren":
      return { expression: state.expression + action.paren, result: null };

    case "equals": {
      const outcome = evaluate(state.expression === "" ? "0" : state.expression);
      return {
        expression: state.expression,
        result: outcome.kind === "success" ? String(outcome.value) : outcome.message,
      };
    }

    case "percent": {
      const outcome = evaluate(state.expression === "" ? "0" : state.expression);
      if (outcome.kind !== "success") return { expression: state.expression, result: outcome.message };
      return { expression: String(outcome.value / 100), result: null };
    }

    case "signChange": {
      const outcome = evaluate(state.expression === "" ? "0" : state.expression);
      if (outcome.kind !== "success") return { expression: state.expression, result: outcome.message };
      return { expression: String(outcome.value * -1), result: null };
    }

    case "function": {
      const outcome = evaluate(state.expression === "" ? "0" : state.expression);
      if (outcome.kind !== "success") return { expression: state.expression, result: outcome.message };
      const applyFunction = TRIG_FUNCTIONS[action.name];
      const input = action.angleMode === "degrees" ? outcome.value * (Math.PI / 180) : outcome.value;
      return { expression: String(roundForDisplay(applyFunction(input))), result: null };
    }

    case "clear":
      return { expression: "", result: null };

    default:
      return state;
  }
}
```

**CS lens — the word "reducer" is not a React invention; it's the same
shape as `Array.prototype.reduce`.** `[1, 2, 3].reduce((accumulator, item)
=> accumulator + item, 0)` calls its function once per array element,
each time combining the *running total so far* with *one new item* to
produce the *next* running total. `calculatorReducer(state, action)` is
the identical shape: `state` is the running total (the calculator's
current condition), `action` is the one new item (what just happened),
and the return value is the next running total. `useReducer` is, in a
real sense, "run `.reduce()` over the entire sequence of actions a user
ever dispatches, one at a time, keeping only the latest running total
visible" — the name was chosen deliberately to point at this exact
parallel, not coined fresh for React.

**Connect to the real world — this state/action/reducer/dispatch
vocabulary predates `useReducer` itself.** This entire shape — actions as
plain data objects with a `type` field, a pure reducer function computing
new state from old state plus an action, a `dispatch` function as the only
way to trigger a change — is the core design of **Redux**, a
state-management library that predates React's own `useReducer` hook by
several years and popularized this exact pattern across the whole
JavaScript ecosystem (the broader idea is called **Flux architecture**).
React eventually added `useReducer` as a built-in hook specifically
because this pattern proved useful often enough, for state local to one
component, that reaching for an external library felt like overkill just
to get it. Recognizing this vocabulary — action, reducer, dispatch — means
recognizing Redux code (or any Flux-inspired state management) on sight,
in any React codebase that uses it, as the same idea this lesson just
built from scratch.

**Walkthrough — a reducer's exact shape: `(state, action) => newState`.**
`calculatorReducer` takes the calculator's *current* state and one action,
and returns a *brand new* state object describing what it should become —
it never modifies `state` directly (notice every branch returns a fresh
object literal, never `state.expression = ...`). This is the same
immutability discipline lesson 06 introduced for a single `setValue` call,
now applied to a whole state object at once.

**Walkthrough — the `switch` on `action.type`, and why every branch
returns.** TypeScript narrows `action`'s type inside each `case`, exactly
the way `switch (cell.kind)` narrowed `Cell` in the TypeScript Spreadsheet
project — inside `case "digit":`, TypeScript knows `action` specifically
has a `digit: string` field, and would flag an attempt to read
`action.operator` there as an error. The `default: return state;` branch
exists for type-safety completeness (satisfying TypeScript that every
possible `action.type` is handled) even though, with every real variant
already listed above it, it can never actually run for a value this
union's type allows — the same "written defensively, not because it's
reachable" reasoning `tokenize`'s final `throw` used in lesson 11.

**SE lens — this reducer contains the calculator's entire behavior, and
nothing else does.** Every rule this calculator follows — how a digit
appends, what percent does, what happens on clear — now lives in exactly
one function, entirely separate from anything about buttons, clicks, or
JSX. `calculatorReducer` could be tested, in principle, by calling it
directly with a state and an action and checking what comes back — no
component, no click, no browser needed — because it's a plain function
taking data in and returning data out, the same **pure function** quality
`add` and `multiply` have had since lesson 08, now applied to an entire
state transition instead of a single number.

**Why `angleMode` rides along inside the action itself, instead of the
reducer just reading it.** `angleMode` is going to stay its own
`useState`, outside this reducer (Step 4 explains why). It might look
simpler for `calculatorReducer`'s `"function"` branch to just reach out
and read `angleMode` directly from wherever it lives. That would break the
exact guarantee the SE lens above just described: a reducer is only
allowed to depend on its two arguments, `state` and `action` — nothing
else, from anywhere else. The moment it quietly reads some outside
variable, calling `calculatorReducer(sameState, sameAction)` twice could
produce two *different* results depending on what that outside variable
happened to be each time — it would stop being a pure function, and every
benefit that came with that (testable in isolation, predictable, safe to
reason about one case at a time) would go with it. The fix is for
`angleMode` to travel *inside* the action instead — `{ type: "function";
name: string; angleMode: AngleMode }` — so everything the reducer needs is
sitting right there in its own two arguments, and the component doing the
`dispatch` (which already has `angleMode` in scope) is the one responsible
for including it.

**The general law, stated once, so every future case is obvious instead of
memorized one at a time.**

> **A reducer is a mathematical function: `(oldState, action) → newState`.
> Nothing else is allowed in.**

No reading the clock (`Date.now()`, `new Date()`). No random numbers
(`Math.random()`). No reading or writing `localStorage`. No touching the
DOM. No network requests. No reading a file. No reading or writing any
variable declared outside the reducer function itself. Every one of those
is a way for the *same* `(oldState, action)` pair to produce a *different*
`newState` on two separate calls — the exact property a pure function must
never have. `angleMode` read from outside would have broken this law the
same way `Date.now()` would have, for identical reasons — this project
will reference this exact law again, by name, every time a reducer
threatens to reach outside its own two arguments.

---

## Step 4 — Use `useReducer` Instead of Two `useState` Calls

Replace the top of `Calculator`:

```tsx
function Calculator() {
  const [state, dispatch] = React.useReducer(calculatorReducer, { expression: "", result: null });
  const [scientificMode, setScientificMode] = React.useState(false);
  const [angleMode, setAngleMode] = React.useState<AngleMode>("degrees");

  function toggleAngleMode(): void {
    setAngleMode(angleMode === "degrees" ? "radians" : "degrees");
  }

  const displayValue = state.result !== null ? state.result : (state.expression === "" ? "0" : state.expression);

  return (
    <AngleModeContext.Provider value={{ angleMode, toggleAngleMode }}>
      <div className="calculator">
        <Display value={displayValue} />
        <Keypad
          onDigit={(digit) => dispatch({ type: "digit", digit })}
          onOperator={(operator) => dispatch({ type: "operator", operator })}
          onParen={(paren) => dispatch({ type: "paren", paren })}
          onEquals={() => dispatch({ type: "equals" })}
          onPercent={() => dispatch({ type: "percent" })}
          onSignChange={() => dispatch({ type: "signChange" })}
          onClear={() => dispatch({ type: "clear" })}
        />
        <button className="mode-toggle" onClick={() => setScientificMode(!scientificMode)}>
          {scientificMode ? "Basic" : "Scientific"}
        </button>
        {scientificMode && (
          <ScientificPad onFunction={(name) => dispatch({ type: "function", name, angleMode })} />
        )}
      </div>
    </AngleModeContext.Provider>
  );
}
```

Click **▶ Preview**. Every existing feature — digits, operators,
parentheses, percent, sign-change, trig functions, clear — still works
exactly as before.

**Walkthrough — `React.useReducer(reducer, initialState)`.** Returns the
same two-item array shape `useState` does — `[state, dispatch]` — but
`state` here is `calculatorReducer`'s entire `CalculatorState` object, not
a single value, and `dispatch` is not a setter for one field; it's a
function that takes an **action** and hands it to the reducer. Calling
`dispatch({ type: "digit", digit: "7" })` runs
`calculatorReducer(currentState, { type: "digit", digit: "7" })`
internally, and React re-renders with whatever that call returned as the
new state — the same "calling the setter triggers a re-render" mechanism
`useState` has always used, generalized to a whole object and a described
action instead of one raw value.

**Walkthrough — `scientificMode` and `angleMode` stayed as `useState`.**
Not every piece of state needs to become part of the reducer. `useReducer`
earns its keep specifically where several related actions all transform
*the same* piece of state through *related* logic — exactly true of
`expression`/`result`, and about to become more true once memory joins
them in lesson 19. `scientificMode` and `angleMode` are each a single,
independent flag with one trivial way to change — reducing them into the
same action union would add a layer of indirection without solving a real
problem. Choosing `useState` versus `useReducer` per piece of state,
rather than picking one tool for everything, is itself a real engineering
decision, not a rule to apply uniformly.

---

## Connect the Pieces

```
Calculator.tsx   CalculatorAction — every possible action, as data
                 CalculatorState — { expression, result }
                 calculatorReducer() — the entire rule book for how
                 actions change state, in one pure function
                 dispatch() — replaces eight separate handler functions'
                 worth of direct setState calls
```

---

## What Breaks Without This

**Mutating `state` directly inside a reducer branch** (`state.expression +=
action.digit; return state;` instead of returning a new object): React
compares old and new state by reference to decide whether to re-render.
Returning the *same* object reference back — even after changing a field
on it — looks identical to "nothing changed" from React's perspective, and
the screen silently fails to update, the same invisible-failure shape
lesson 05's broken `let` produced, now at the scale of a whole state
object instead of one variable.

---

## Definition of Done

- [ ] Every existing calculator feature still works after switching to `useReducer`, including `sin`/`cos`/`tan` correctly respecting degrees vs. radians
- [ ] `calculatorReducer` never mutates its `state` argument — every branch returns a new object
- [ ] You can explain the difference between an action and a reducer
- [ ] You can explain why `scientificMode` and `angleMode` were left as `useState`
- [ ] You can explain what would go wrong if a reducer branch mutated `state` instead of returning a new object
- [ ] You can explain why `angleMode` had to travel inside the `"function"` action instead of the reducer just reading it directly
- [ ] You can state, from memory, the general law a reducer must never break, and list at least four kinds of outside access it forbids
- [ ] You can explain why "reducer" is the same shape as `Array.prototype.reduce`
- [ ] You can name Redux and explain how this project's action/reducer/dispatch vocabulary maps onto it

---

*Next: Lesson 19 — Memory Buttons via the Reducer. MS, MR, MC, M+, and M-
join the action union.*
