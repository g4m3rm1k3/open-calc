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

---

*Next: Lesson 19 — Memory Buttons via the Reducer. MS, MR, MC, M+, and M-
join the action union.*
