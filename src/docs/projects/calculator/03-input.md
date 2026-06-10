# Lesson 03 — Input

## What You Will Build

Clicking digit and operator buttons builds an expression string on the display.
The display updates on every click. The `C` button clears it back to `0`.

By the end of this lesson the calculator face is interactive. You click `3`, `+`,
`4` and see `3+4` on the display. That is the entire lesson.

## What You Need to Know First

Lessons 01 and 02 — the HTML shell and the button grid with TypeScript types.
This lesson adds the first stateful logic: the input state machine.

---

## The Lesson

### The problem

A calculator display does not simply concatenate every button press. Pressing `+`
after `=` starts a new expression. Pressing `5` after another digit extends the
current number. Pressing `.` in the middle of a number adds a decimal point, but
pressing `.` again in the same number should do nothing.

These rules are not a list of special cases. They are a state machine: the display
behaves differently depending on what state it is currently in. Naming the states
explicitly is what separates a working calculator from one that breaks in unexpected
ways.

---

### Step 1 — The input states

Create `src/input-state.ts`:

```typescript
export const InputState = {
  IDLE:             'IDLE',
  ENTERING_NUMBER:  'ENTERING_NUMBER',
  AFTER_OPERATOR:   'AFTER_OPERATOR',
  AFTER_EQUALS:     'AFTER_EQUALS',
} as const

export type InputState = typeof InputState[keyof typeof InputState]
```

**CS lens — finite state machine:**
A finite state machine is a system that can be in exactly one of a fixed number
of states at any time, and transitions between states when specific inputs arrive.
The calculator's input system has four states:

- `IDLE` — nothing has been entered yet. Display shows `0`.
- `ENTERING_NUMBER` — the user is typing digits or a decimal. Display grows right.
- `AFTER_OPERATOR` — an operator was just pressed. Next digit starts a new number.
- `AFTER_EQUALS` — `=` was pressed. Next input starts fresh.

Every button press is an input event. The current state determines what that
event does. The same digit button behaves differently in `AFTER_OPERATOR` state
(starts a new number) vs `ENTERING_NUMBER` state (extends the current number).
Without naming the states, this logic becomes a tangle of booleans. With named
states, the transitions are readable.

---

### Step 2 — The calculator state

Create `src/calculator-state.ts`:

```typescript
import { InputState } from './input-state.js'

export interface CalculatorState {
  displayValue:   string
  inputState:     InputState
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

**SE lens — single source of truth:**
All state lives in one object. The display value, the current input state, and
whether a decimal point has been entered are all in `CalculatorState`. No state
is stored in the DOM. No state is stored in a module-level variable scattered
across files.

This is the single source of truth principle: there is one place to read the
current state of the application, and one place to update it. When a bug appears,
you look at the state object. When you want to understand what the calculator is
doing, you read the state.

The alternative — storing state in DOM attributes, in `dataset` values, in
separate booleans — means state is spread across the application. When something
goes wrong, you cannot tell what is true.

---

### Step 3 — The transition function

Create `src/input-reducer.ts`:

```typescript
import { ButtonType }       from './types.js'
import { InputState }       from './input-state.js'
import { CalculatorState }  from './calculator-state.js'
import type { ButtonConfig } from './buttons.js'

export function applyButtonPress(
  state:        CalculatorState,
  buttonConfig: ButtonConfig,
): CalculatorState {
  switch (buttonConfig.type) {
    case ButtonType.DIGIT:
      return applyDigit(state, buttonConfig.value)
    case ButtonType.DECIMAL:
      return applyDecimal(state)
    case ButtonType.OPERATOR:
      return applyOperator(state, buttonConfig.value)
    case ButtonType.EQUALS:
      return applyEquals(state)
    case ButtonType.CLEAR:
      return applyClear()
    case ButtonType.PAREN:
      return applyParen(state, buttonConfig.value)
  }
}

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
  const newDisplay = state.displayValue === '0'
    ? digit
    : state.displayValue + digit

  return {
    ...state,
    displayValue: newDisplay,
    inputState:   InputState.ENTERING_NUMBER,
  }
}

function applyDecimal(state: CalculatorState): CalculatorState {
  if (state.hasDecimalPoint) {
    return state // second decimal in same number: do nothing
  }

  const newDisplay = state.inputState === InputState.AFTER_OPERATOR
    ? state.displayValue + '0.'
    : state.displayValue + '.'

  return {
    ...state,
    displayValue:    newDisplay,
    inputState:      InputState.ENTERING_NUMBER,
    hasDecimalPoint: true,
  }
}

function applyOperator(state: CalculatorState, operator: string): CalculatorState {
  return {
    ...state,
    displayValue: state.displayValue + operator,
    inputState:   InputState.AFTER_OPERATOR,
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

**CS lens — pure functions and immutability:**
`applyButtonPress` takes a state and a button press, and returns a new state.
It does not mutate the existing state. It does not touch the DOM. It has no
side effects. A function with no side effects and no external dependencies is
called a pure function.

Pure functions are easy to test: call them with an input, check the output.
No setup, no teardown, no mocking the DOM. In lesson 04 you will write tests
that call `applyButtonPress` directly, with no browser involved.

**SE lens — the reducer pattern:**
`applyButtonPress` is a reducer: it takes the current state and an action (the
button press) and returns the next state. This pattern — `(state, action) => newState`
— separates the logic of what the state should be from the concern of when to
update the display. The reducer does not know the display exists. The display
code does not know the transition logic exists. Each has one job.

---

### Step 4 — Wire to the display

Update `src/main.ts`:

```typescript
import { BUTTON_GRID }        from './buttons.js'
import { createInitialState } from './calculator-state.js'
import { applyButtonPress }   from './input-reducer.js'

let calculatorState = createInitialState()

function updateDisplay(): void {
  const displayElement = document.querySelector('.display-value')
  if (displayElement === null) {
    throw new Error('Display element not found')
  }
  displayElement.textContent = calculatorState.displayValue
}

function renderButtons(): void {
  const calculator = document.querySelector('.calculator')
  if (calculator === null) {
    throw new Error('Calculator element not found')
  }

  const buttonGrid = document.createElement('div')
  buttonGrid.className = 'button-grid'

  for (const buttonConfig of BUTTON_GRID) {
    const button = document.createElement('button')
    button.textContent = buttonConfig.label

    if (buttonConfig.cssClass !== undefined) {
      button.classList.add(buttonConfig.cssClass)
    }

    button.addEventListener('click', () => {
      calculatorState = applyButtonPress(calculatorState, buttonConfig)
      updateDisplay()
    })

    buttonGrid.appendChild(button)
  }

  calculator.appendChild(buttonGrid)
}

renderButtons()
updateDisplay()
```

**SE lens — state flows one way:**
The flow is: button click → `applyButtonPress` → new state → `updateDisplay`.
The display is always derived from the state. The state is never derived from
the display. This one-way flow means there is one place where the display value
is decided: the state object. If the display shows the wrong thing, you debug
the state, not the DOM.

---

## Connect the Pieces

`CalculatorState` is the single truth about what the calculator is doing. The
display reads from it. In lesson 04, the evaluator will read `displayValue` from
it to compute a result. In lesson 06, the history will record entries from it.
Every lesson that adds behaviour will either read from this state object or
return a new one via `applyButtonPress` or a new reducer function.

The state machine transitions defined here are the rules of the input layer.
They do not change when the evaluator is added. They do not change when history
is added. They are the input rules, and they live in one place.

---

## What Breaks Without This

Without a state machine, input handling becomes a chain of `if` statements spread
across event listeners. When the `5` button is clicked, one block checks if the
last press was an operator. Another checks if there is already a decimal. Another
checks if `=` was just pressed. These checks are interleaved with DOM reads and
writes. When one case breaks, the bug is invisible because the state that caused
it is spread across the DOM.

With the state machine, every rule is in `input-reducer.ts`. Every state is named.
Every transition is explicit. When the `5` button behaves wrongly, you read the
transition for `DIGIT` in the current state. The bug is there.

---

## Definition of Done

- [ ] Clicking `3`, `+`, `4` shows `3+4` on the display
- [ ] Clicking `C` clears the display to `0`
- [ ] Clicking `.` twice in the same number does not add a second decimal point
- [ ] The input state machine has four explicit states: `IDLE`, `ENTERING_NUMBER`, `AFTER_OPERATOR`, `AFTER_EQUALS`
- [ ] The display value is never read from the DOM — it is always read from `CalculatorState`
- [ ] `applyButtonPress` is a pure function with no DOM access
