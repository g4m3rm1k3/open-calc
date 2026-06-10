# Calculator — Lesson 03 — Input

## What You Will Build

Clicking digit and operator buttons builds an expression string on the display.
Clicking `3`, `+`, `4` shows `3+4`. Clicking `C` clears back to `0`. Clicking `.`
twice in the same number does nothing the second time. Clicking a digit after `=`
starts a new number rather than extending the previous result.

By the end of this lesson the calculator is fully interactive — every button press
produces a visible, correct result on the display.

## What You Need to Know First

Lessons 01 and 02 — the HTML shell and the button grid with TypeScript types. This
lesson uses `ButtonType` and `ButtonConfig` from lesson 02 directly. If those are
not yet built, build them first.

---

## The Problem

A calculator display does not simply concatenate every button press. Consider what
should happen:

- Pressing `5` when the display shows `7+` should extend the expression: `7+5`
- Pressing `5` when the display shows `=7` (a fresh result) should start a new
  number: `5`, not `75`
- Pressing `.` when the number already has a decimal point should do nothing

These are not three isolated special cases. They are three manifestations of one
underlying question: *what should this button do, given the current situation?*

The answer depends on the **state** the calculator is in. Naming the states
explicitly — rather than checking a growing collection of booleans — is what
separates a working calculator from one that produces wrong results in unusual
button-press sequences.

---

## Step 1 — The Input States

### The problem

Before any transition logic, the valid states must be named. A state without a
name is an implicit state — one that exists in practice but cannot be referred to,
tested, or reasoned about. The first job is to make every state explicit.

### The code

Create `src/input-state.ts`:

```typescript
export const InputState = {
  IDLE:            'IDLE',
  ENTERING_NUMBER: 'ENTERING_NUMBER',
  AFTER_OPERATOR:  'AFTER_OPERATOR',
  AFTER_EQUALS:    'AFTER_EQUALS',
} as const

export type InputState = typeof InputState[keyof typeof InputState]
```

**What `src/input-state.ts` is:**
`input-state.ts` owns the definition of valid input states. It has one job: say
what the valid states are. It knows nothing about how states transition or how the
display is updated. One file, one responsibility.

The `as const` pattern and the derived type are identical to the `ButtonType`
pattern from lesson 02 — a closed set of named values, enforced by the type system.
The reason is the same: a typo like `InputState.IDLE` being mistyped as
`InputState.ILDLE` is a compile error, not a silent bug.

### Walkthrough — what the `InputState` object looks like at runtime

After TypeScript compiles this file, the JavaScript object in memory is:

```javascript
InputState = {
  IDLE:            'IDLE',
  ENTERING_NUMBER: 'ENTERING_NUMBER',
  AFTER_OPERATOR:  'AFTER_OPERATOR',
  AFTER_EQUALS:    'AFTER_EQUALS',
}
```

`InputState.IDLE` evaluates to the string `'IDLE'`. When stored in
`CalculatorState`, the `inputState` field holds one of these four strings. The
`as const` makes each string a literal type — TypeScript tracks not just "this is
a string" but "this is specifically the string `'IDLE'`". That precision is what
allows exhaustiveness checking.

**CS lens — finite state machine:**
A **finite state machine** (FSM) is a system that can be in exactly one of a fixed
number of named states at any time. When an input arrives, the machine transitions
from the current state to a new state according to defined rules. The set of valid
states is finite — there are exactly four here.

```
IDLE            — nothing entered yet; display shows '0'
ENTERING_NUMBER — user is building a number digit by digit
AFTER_OPERATOR  — an operator was just pressed; next digit starts a new number
AFTER_EQUALS    — '=' was pressed; next input starts fresh
```

The same digit button `5` produces different behaviour depending on the current
state:
- In `IDLE`: replaces the `0` on the display with `5`
- In `ENTERING_NUMBER`: appends `5` to what is already there
- In `AFTER_OPERATOR`: appends `5` to the operator character (building the right
  operand)
- In `AFTER_EQUALS`: replaces the result with `5` (starting a new expression)

Without named states, these four cases become four `if` checks spread through the
code, each looking at different combinations of boolean flags. Named states
consolidate all of this into one switch statement.

FSMs appear throughout software:
- **Lexers** (lesson 07) are FSMs that read characters one at a time and
  transition between states like `READING_NUMBER`, `READING_IDENTIFIER`, `IDLE`
- **TCP connections** have states: `CLOSED`, `LISTEN`, `SYN_SENT`, `ESTABLISHED`,
  `CLOSE_WAIT`, `TIME_WAIT`
- **UI components** have states: a button is `default`, `hover`, `active`,
  `disabled`
- **Traffic lights** are FSMs: `RED`, `RED_AMBER`, `GREEN`, `AMBER`

The pattern is universal: whenever a system's behaviour depends on its current
mode, a finite state machine is the right model.

**SE lens — named states eliminate boolean creep:**
Without named states, input handling accumulates booleans: `isAfterOperator`,
`isAfterEquals`, `isFirstDigit`, `hasDecimalPoint`. Each new rule requires a new
boolean. After four rules, no one can hold all the valid and invalid combinations
in their head. `isAfterOperator = true` and `isAfterEquals = true` at the same
time — is that possible? What does it mean?

Named states make invalid combinations impossible by construction. The calculator
is either `AFTER_OPERATOR` or `AFTER_EQUALS`. It cannot be both. The type system
enforces this. The transitions are explicit and local.

**What breaks without this:**
A calculator without named states will work for the most common paths — typing `3 + 4 =` — and fail in subtle ways for unusual ones: pressing `=` twice, starting an expression with a decimal point, pressing an operator immediately after another operator. Each bug requires hunting through a maze of boolean conditions. Named states make every case findable.

---

## Step 2 — The Calculator State

### The problem

The display value, the current input state, and whether a decimal point has been
entered are related. They must travel together. If `inputState` and `hasDecimalPoint`
lived in separate variables in separate files, they could become inconsistent: one
updated and the other not. A function that changes the display must atomically change
all related state. The only way to guarantee this is to group all state in one object.

### The code

Create `src/calculator-state.ts`:

```typescript
import { InputState } from './input-state.js'
```

**Import explanation:**
`input-state.ts` is the module responsible for defining the valid input states.
We import `InputState` — the type and the object of named values — because
`CalculatorState` contains a field of that type. Without this import, TypeScript
does not know what `InputState` is.

```typescript
export interface CalculatorState {
  displayValue:    string
  inputState:      InputState
  hasDecimalPoint: boolean
}

export function createInitialState(): CalculatorState {
  return {
    displayValue:    '0',
    inputState:      InputState.IDLE,
    hasDecimalPoint: false,
  }
}
```

**What `src/calculator-state.ts` is:**
`calculator-state.ts` owns the shape of the application state and the function that
creates the initial state. Later lessons will add fields to `CalculatorState` —
`precision` (lesson 05), `history` (lesson 06), `environment` (lesson 08) — all in
this file. It is the authoritative source of what the calculator's state looks like.

### Walkthrough — what `createInitialState()` returns

`createInitialState()` returns a plain JavaScript object:

```
{
  displayValue:    '0',      // the display shows the digit zero
  inputState:      'IDLE',   // nothing has been typed yet
  hasDecimalPoint: false,    // no decimal point in the current number
}
```

This is the state at page load and after pressing `C` (clear). Every reset
in the entire application returns to this exact structure. Knowing the initial
state means knowing where all resets point.

`interface` recap (from lesson 02): An interface is a named TypeScript type
describing the shape of an object. It is erased at compile time and produces
no runtime code. It exists only to tell TypeScript what fields to expect and what
types they must have.

**CS lens — single source of truth:**
`CalculatorState` is the **single source of truth** for the entire calculator's
condition. The display value is not stored in the DOM. The input state is not stored
in a module-level boolean. The decimal flag is not stored in a data attribute.
One object, one place to read, one place to update.

When two representations of the same fact exist — say, `inputState` in state AND
a boolean `isAfterOperator` in a DOM data attribute — they can disagree. One gets
updated and the other does not. The bug manifests far from the cause. A single
source of truth makes disagreement structurally impossible.

This principle appears at every scale of software:
- A database is the single source of truth for persisted data
- A Redux store is the single source of truth for a React application's UI state
- A configuration file is the single source of truth for build settings

**SE lens — explicit state over implicit DOM state:**
Early interactive JavaScript stored state in the DOM: reading `element.textContent`
to find the current display value, checking `element.classList` to find the current
mode. This works until two pieces of code read the DOM at different times and see
different values (if an animation is running, or if an async operation is in progress).

Storing state in a JavaScript object is always consistent: the object does not
change between two reads unless code explicitly changes it.

**What breaks without this:**
If `displayValue` were read from the DOM instead of from state, the input reducer
would call `document.querySelector('.display-value').textContent` to find the
current expression. Any race condition, any DOM manipulation from another source,
any timing issue would silently corrupt the calculator's understanding of what is
on the display. The pure state object has no such vulnerability.

---

## Step 3 — The Transition Function

### The problem

Given the current state and a button press, what is the new state? This question
needs exactly one answer, not multiple implementations scattered across event
listeners, DOM reads, and conditional branches. A single pure function that takes
state and a button and returns new state is the correct structure.

### The code

Create `src/input-reducer.ts`:

```typescript
import { ButtonType }        from './types.js'
import { InputState }        from './input-state.js'
import { CalculatorState }   from './calculator-state.js'
import type { ButtonConfig } from './buttons.js'
```

**Import explanations:**

`import { ButtonType } from './types.js'` — `types.ts` is the central type registry
(lesson 02). We import `ButtonType` — the object of named button kinds — because
the switch statement dispatches on `buttonConfig.type`, which holds values like
`ButtonType.DIGIT`. We need `ButtonType.DIGIT` to compare against.

`import { InputState } from './input-state.js'` — we import `InputState` for the
same reason: comparisons like `state.inputState === InputState.IDLE` appear throughout
the transition functions. Without this import, `InputState.IDLE` is undefined.

`import { CalculatorState } from './calculator-state.js'` — `CalculatorState` is
the type of the first parameter of every transition function. Without the import,
TypeScript cannot type-check the parameter.

`import type { ButtonConfig } from './buttons.js'` — `import type` imports only
the TypeScript type, not any runtime value. The compiled JavaScript will contain
no reference to this import — it is erased at compilation. `import type` is correct
when you only need the type for a parameter annotation (`buttonConfig: ButtonConfig`)
and do not call any functions or read any values from the module at runtime. Using
`import type` where possible keeps the compiled output lean and makes dependency
relationships explicit.

```typescript
export function applyButtonPress(
  state:        CalculatorState,
  buttonConfig: ButtonConfig,
): CalculatorState {
  switch (buttonConfig.type) {
    case ButtonType.DIGIT:    return applyDigit(state, buttonConfig.value)
    case ButtonType.DECIMAL:  return applyDecimal(state)
    case ButtonType.OPERATOR: return applyOperator(state, buttonConfig.value)
    case ButtonType.EQUALS:   return applyEquals(state)
    case ButtonType.CLEAR:    return applyClear()
    case ButtonType.PAREN:    return applyParen(state, buttonConfig.value)
  }
}
```

**`switch` statement — first appearance:**
`switch (buttonConfig.type)` tests a value against multiple possible cases. When
the value matches a case, that case's code runs. The `return` inside each case exits
the function, so no `break` is needed.

TypeScript's **exhaustiveness checking** applies here. Because `ButtonType` is a
closed union (six specific string values) and every case is covered, TypeScript
knows that `applyButtonPress` always returns a `CalculatorState`. If a new value
were added to `ButtonType` but not handled in the switch, TypeScript would report
an error: the function might not return in all cases. The switch is both logic and
safety net.

```typescript
function applyDigit(state: CalculatorState, digit: string): CalculatorState {
  if (state.inputState === InputState.IDLE ||
      state.inputState === InputState.AFTER_EQUALS) {
    return {
      displayValue:    digit,
      inputState:      InputState.ENTERING_NUMBER,
      hasDecimalPoint: false,
    }
  }

  if (state.inputState === InputState.AFTER_OPERATOR) {
    return {
      displayValue:    state.displayValue + digit,
      inputState:      InputState.ENTERING_NUMBER,
      hasDecimalPoint: false,
    }
  }

  // ENTERING_NUMBER: extend the current number
  const newDisplayValue = state.displayValue === '0'
    ? digit
    : state.displayValue + digit

  return {
    ...state,
    displayValue: newDisplayValue,
    inputState:   InputState.ENTERING_NUMBER,
  }
}
```

**Spread syntax recap (from lesson 03 step in lesson 02):**
`{ ...state, displayValue: newDisplayValue }` creates a new object containing all
properties of `state`, with `displayValue` overridden by `newDisplayValue`. The
original `state` object is not modified. Every transition function returns a new
state object — the old one is never mutated.

```typescript
function applyDecimal(state: CalculatorState): CalculatorState {
  if (state.hasDecimalPoint) {
    return state  // second decimal in same number: return unchanged state
  }

  const prefix = state.inputState === InputState.AFTER_OPERATOR
    ? state.displayValue + '0'
    : state.displayValue

  return {
    ...state,
    displayValue:    prefix + '.',
    inputState:      InputState.ENTERING_NUMBER,
    hasDecimalPoint: true,
  }
}

function applyOperator(state: CalculatorState, operator: string): CalculatorState {
  return {
    ...state,
    displayValue:    state.displayValue + operator,
    inputState:      InputState.AFTER_OPERATOR,
    hasDecimalPoint: false,
  }
}

function applyEquals(state: CalculatorState): CalculatorState {
  return {
    ...state,
    inputState: InputState.AFTER_EQUALS,
  }
}

function applyClear(): CalculatorState {
  return {
    displayValue:    '0',
    inputState:      InputState.IDLE,
    hasDecimalPoint: false,
  }
}

function applyParen(state: CalculatorState, paren: string): CalculatorState {
  if (state.inputState === InputState.IDLE ||
      state.inputState === InputState.AFTER_EQUALS) {
    return {
      displayValue:    paren,
      inputState:      InputState.ENTERING_NUMBER,
      hasDecimalPoint: false,
    }
  }

  return {
    ...state,
    displayValue: state.displayValue + paren,
  }
}
```

**What `src/input-reducer.ts` is:**
`input-reducer.ts` owns all transition logic — the rules that say "given this state
and this button, produce this new state." It imports types from three other modules
but does not call any DOM methods, set any timers, or read any global variables. It
is a collection of pure functions over data.

### Walkthrough — pressing `3`, `+`, `.`, `4`, `.`

Starting state: `{ displayValue: '0', inputState: 'IDLE', hasDecimalPoint: false }`

**Press `3` (DIGIT, value `'3'`):**
`applyDigit(state, '3')`. `inputState` is `'IDLE'` → first branch fires.
Returns: `{ displayValue: '3', inputState: 'ENTERING_NUMBER', hasDecimalPoint: false }`

**Press `+` (OPERATOR, value `'+'`):**
`applyOperator(state, '+')`.
Returns: `{ displayValue: '3+', inputState: 'AFTER_OPERATOR', hasDecimalPoint: false }`

**Press `.` (DECIMAL):**
`applyDecimal(state)`. `hasDecimalPoint` is `false` → proceed.
`inputState` is `'AFTER_OPERATOR'` → `prefix = state.displayValue + '0' = '3+0'`.
Returns: `{ displayValue: '3+0.', inputState: 'ENTERING_NUMBER', hasDecimalPoint: true }`

The `'0.'` prefix is intentional: pressing `.` right after an operator starts a
number like `0.5` rather than `.5`. This matches standard calculator behaviour.

**Press `4` (DIGIT, value `'4'`):**
`applyDigit(state, '4')`. `inputState` is `'ENTERING_NUMBER'` → last branch.
`displayValue` is `'3+0.'`, not `'0'` → append.
Returns: `{ displayValue: '3+0.4', inputState: 'ENTERING_NUMBER', hasDecimalPoint: true }`

**Press `.` again (DECIMAL):**
`applyDecimal(state)`. `hasDecimalPoint` is `true` → `return state`. Unchanged.
Display remains `3+0.4`. The second decimal is silently rejected.

### Walkthrough — `applyDecimal` in detail

`applyDecimal` has two branches that deserve independent examination.

**Case 1: `state.hasDecimalPoint === true`**
Return `state` — the exact same object, unchanged. This is a deliberate choice:
rather than creating a new state with the same values, return the existing object.
This matters for performance in systems that use reference equality to detect changes
(React's `useState`, for example). Returning the same reference signals "nothing
changed." Returning a new object with identical values signals "something changed,
check me." Here the distinction is minor, but the habit of returning the existing
object when nothing changes is the correct one.

**Case 2: `state.hasDecimalPoint === false`, state is `AFTER_OPERATOR`**
The user pressed `+` and then `.`. The intended number is `0.something`. Without
the `'0'` prefix, the display would show `3+.4`, which is valid in some contexts
but looks odd. Adding `'0'` produces `3+0.4` — conventional calculator behaviour.
The `prefix` variable makes the intent explicit: when an operator was just pressed,
start the decimal number with `0`.

**CS lens — pure functions:**
`applyButtonPress` takes a state and a button, returns a new state. It does not
modify `state`. It does not read from the DOM. It does not call `Date.now()` or
`Math.random()`. It has no side effects. It depends on no external state. Given the
same inputs, it always returns the same output.

A function with no side effects and no external dependencies is a **pure function**.
Pure functions are the easiest code to reason about, because the only thing that
affects their output is their input. They are the easiest to test: call with inputs,
check output. No browser, no mocked DOM, no setup.

Lesson 04 will write tests that call `evaluate` — also a pure function — with no
browser. The same will be possible for `applyButtonPress` if you want to test the
state machine. Pure functions eliminate the need for test infrastructure.

**SE lens — the reducer pattern:**
`applyButtonPress` is a **reducer**: a function with the signature
`(currentState, action) => nextState`. The action is the button press. The reducer
never modifies `currentState` — it produces `nextState`. The reducer does not know
the display exists. The display code does not know the transition logic exists.
Each has one job.

This pattern — separate what the state should become from when to update the screen
— is the foundation of Redux (React's state management library), Elm's architecture,
and the Flux pattern used by Facebook to manage complex UI state. When Redux became
popular in 2015, it was teaching the reducer pattern to JavaScript developers who
had been managing state imperatively. This lesson builds the same pattern by hand,
which is how you understand why the pattern exists.

---

## Step 4 — Wire to the Display

### The problem

The reducer produces new state but nothing renders it. `main.ts` must call the
reducer on every button click and push the result to the DOM.

### The code

Update `src/main.ts` to replace the `console.log` click handler from lesson 02:

```typescript
import { BUTTON_GRID }        from './buttons.js'
import { createInitialState } from './calculator-state.js'
import { applyButtonPress }   from './input-reducer.js'
```

**Import explanations:**

`import { BUTTON_GRID } from './buttons.js'` — `buttons.ts` owns the button
configuration data (lesson 02). We import `BUTTON_GRID` — the array of button
definitions — because `renderButtons` iterates it to create DOM elements. We also
no longer import `ButtonType` here: `main.ts` does not need to inspect button types
directly; it passes each `ButtonConfig` to `applyButtonPress` which handles the
dispatch.

`import { createInitialState } from './calculator-state.js'` — `calculator-state.ts`
(this lesson) owns the state shape and its initial value. We import
`createInitialState` to create the starting state object.

`import { applyButtonPress } from './input-reducer.js'` — `input-reducer.ts`
(this lesson) owns the transition logic. We import `applyButtonPress` because
it is the function the click handler calls on every button press.

```typescript
let calculatorState = createInitialState()
```

**`let` vs `const` — why `let` here:**
`calculatorState` is declared with `let` because it is **reassigned** on every
button press: `calculatorState = applyButtonPress(calculatorState, buttonConfig)`.
`const` prevents reassignment — a `const` variable always refers to the same value.
The state objects themselves are immutable (never mutated); the variable that holds
the current state changes. These are two separate concepts: the immutability of
the object, and the mutability of the variable reference. Here the variable must
be mutable; the objects need not be.

```typescript
function updateDisplay(): void {
  const displayElement =
    document.querySelector<HTMLSpanElement>('.display-value')
  if (displayElement === null) {
    throw new Error('Display element not found')
  }
  displayElement.textContent = calculatorState.displayValue
}

function renderButtons(): void {
  const calculatorElement =
    document.querySelector<HTMLDivElement>('.calculator')
  if (calculatorElement === null) {
    throw new Error('Calculator element not found')
  }

  const buttonGrid = document.createElement('div')
  buttonGrid.className = 'button-grid'

  for (const buttonConfig of BUTTON_GRID) {
    const buttonElement = document.createElement('button')
    buttonElement.textContent = buttonConfig.label
    buttonElement.dataset['type']  = buttonConfig.type
    buttonElement.dataset['value'] = buttonConfig.value

    if (buttonConfig.cssClass !== undefined) {
      buttonElement.classList.add(buttonConfig.cssClass)
    }

    buttonElement.addEventListener('click', () => {
      calculatorState = applyButtonPress(calculatorState, buttonConfig)
      updateDisplay()
    })

    buttonGrid.appendChild(buttonElement)
  }

  calculatorElement.appendChild(buttonGrid)
}

renderButtons()
updateDisplay()
```

**Security — `textContent` continues the safe pattern:**
`displayElement.textContent = calculatorState.displayValue` assigns the display
value as plain text, as established in lesson 02. `displayValue` is built from
button presses that have passed through `applyButtonPress` — our own code. Even
so, using `textContent` is the correct habit. If `displayValue` ever contained
HTML characters (from an error message string, for example), `textContent` renders
them literally. `innerHTML` would parse and execute them.

### Walkthrough — one complete button press

When the user clicks the `3` button, this is the full sequence:

1. **Browser event loop** detects the click and calls the registered handler:
   `() => { calculatorState = applyButtonPress(calculatorState, buttonConfig) }`

2. **`buttonConfig`** is the object `{ label: '3', type: 'DIGIT', value: '3' }`
   captured from `BUTTON_GRID` when the button was created — the same object for
   the lifetime of the page.

3. **`applyButtonPress(calculatorState, buttonConfig)`** is called. The current
   `calculatorState` is `{ displayValue: '0', inputState: 'IDLE', ... }`.
   The switch dispatches to `applyDigit(state, '3')`. `inputState` is `'IDLE'` →
   returns `{ displayValue: '3', inputState: 'ENTERING_NUMBER', hasDecimalPoint: false }`.

4. **`calculatorState`** is reassigned to the new object. The old object
   `{ displayValue: '0', ... }` exists in memory until the garbage collector
   reclaims it. No other variable holds a reference to it, so it will be collected.

5. **`updateDisplay()`** is called. `querySelector('.display-value')` finds the
   `<span>`. `textContent = '3'` sets it. The browser repaints. The display shows `3`.

**SE lens — one-way data flow:**

```
button click → applyButtonPress → new state → updateDisplay → DOM
```

Data moves in one direction only. The display is always derived from state. State
is never derived from the display. The `querySelector` calls inside `renderButtons`
happen once at setup; thereafter, every interaction goes through the reducer.

If the display shows the wrong value, the cause is in `applyButtonPress` — there
is nowhere else to look. This directional constraint eliminates an entire category
of debugging confusion.

This is the same principle that makes React, Vue, and Angular predictable: they
all enforce one-way data flow at the framework level. This lesson builds it by hand.

---

## Debugging: When the State Machine Behaves Wrongly

When a button produces the wrong result on the display, the bug is always in
`applyButtonPress` — in one of the transition functions. Here is how to locate it.

**Step 1: Add a temporary log to `updateDisplay`:**

```typescript
function updateDisplay(): void {
  console.log('State:', calculatorState)
  // ...existing code...
}
```

Open the browser console (F12 → Console). Press the sequence that produces the
wrong result. The console shows the full state after every button press. Compare
the `inputState` field at each step to what you expect from the state machine
diagram above.

**Step 2: Find the wrong transition:**

If `inputState` is `'ENTERING_NUMBER'` when it should be `'AFTER_OPERATOR'`, look
at `applyOperator` — the function responsible for setting `AFTER_OPERATOR`. If
`displayValue` is wrong, check the function for the previous button press.

**Step 3: Remove the log before committing:**

Temporary `console.log` statements in production code produce noise. Remove them
before the git commit. The state machine is correct when every item in the
Definition of Done passes.

---

## Connect the Pieces

```
src/input-state.ts      InputState — the four valid states
src/calculator-state.ts CalculatorState — the single source of truth
src/input-reducer.ts    applyButtonPress — all transition logic
src/main.ts             click handler → reducer → display update
```

`CalculatorState` is the foundation everything else builds on. In lesson 04,
`applyEquals` is updated to evaluate `displayValue` and return the result. In
lesson 05, `precision` is added to `CalculatorState`. In lesson 06, `history` is
added. Every subsequent lesson either reads from this state or returns a new version
of it. The state machine transitions defined here do not change — they are the input
rules, and they are complete.

---

## What Breaks Without This

**Without named states — boolean flag approach:**
```typescript
let isAfterOperator  = false
let isAfterEquals    = false
let hasDecimalPoint  = false
```

Press `.` right after `=`. Is `isAfterEquals` still `true` when `.` arrives?
Depends on whether pressing `.` resets the flag. And `isAfterOperator`? Also needs
resetting? Each new rule adds another flag and another interaction to check. After
six rules, there are `2^6 = 64` possible flag combinations, most of which are
invalid but reachable. Finding a bug requires checking which combination is wrong,
not which state transition is wrong.

**Without `return state` in `applyDecimal` for the second decimal:**
Without the early return, a second `.` appends another decimal point. The display
shows `3.1.4`. `parseFloat('3.1.4')` returns `3.1` — the trailing `.4` is silently
ignored. The user sees `3.1.4` on the screen and `3.1` as the evaluation result. The
display lies. The early return makes this impossible.

**Without immutable state objects:**
If `applyDigit` mutated `state.displayValue` in place instead of returning a new
object, every reference to the previous state would see the updated value. Future
lessons (history, undo) keep references to previous states. Mutation would silently
corrupt those references. Immutability makes previous states permanent.

---

## Definition of Done

- [ ] Clicking `3`, `+`, `4` shows `3+4` on the display
- [ ] Clicking `C` clears the display to `0`
- [ ] Clicking `.` twice in the same number does not add a second decimal point
- [ ] Clicking a digit after `=` starts a new number (replaces the result)
- [ ] Clicking `.` immediately after an operator shows `0.` — not `.` alone
- [ ] The state machine has four states: `IDLE`, `ENTERING_NUMBER`,
      `AFTER_OPERATOR`, `AFTER_EQUALS`
- [ ] `calculatorState.displayValue` is never read from the DOM — always from state
- [ ] `applyButtonPress` is a pure function: no DOM access, no side effects
- [ ] You can explain what a finite state machine is and name the four states
- [ ] You can explain why named states eliminate boolean creep
- [ ] You can explain what a pure function is and why pure functions are easy to test
- [ ] You can explain what the reducer pattern is: `(state, action) => newState`
- [ ] You can explain `import type` and when to use it instead of `import`
- [ ] You can explain spread syntax in `{ ...state, displayValue: newValue }`:
      what it creates, what it does not modify
- [ ] You can explain why `calculatorState` uses `let` instead of `const`
- [ ] You can explain why one-way data flow makes bugs easier to locate
- [ ] You can name two production systems that use the reducer pattern
- [ ] Run:
      ```
      git add src/input-state.ts src/calculator-state.ts src/input-reducer.ts src/main.ts
      git commit -m "Introduce the input state machine: four named states replace boolean flags, reducer pattern separates transition logic from display updates"
      ```

---

*Next: Lesson 04 — Arithmetic. Pressing `=` evaluates the expression. The first
pure evaluator is built. Why `eval()` is a security vulnerability is demonstrated
directly before the safe alternative is written.*
