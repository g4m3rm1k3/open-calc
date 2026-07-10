# 008 — The DOM Manipulation Problem

*Why imperative DOM code collapses under complexity, and what the failure looks like*

---

## What You Will Build

You will build a calculator UI using only the DOM APIs from lesson 004 — no React, no JSX, no framework. The calculator will have a display, a history panel, and enough state that updating the UI requires coordinating three different parts of the DOM.

By the end of this lesson the app will work correctly, but maintaining it will feel fragile. Every function will need to know about every piece of the DOM. Every state change will require finding elements and rewriting them. You will feel the problem firsthand, which makes the solution in lesson 009 meaningful rather than arbitrary.

---

## What You Need to Know First

Lesson 004 — What a Browser Actually Does. All DOM APIs used here (`getElementById`, `createElement`, `addEventListener`, `textContent`, `appendChild`, `removeChild`) were introduced there.

Lesson 005 — JavaScript Modules. The code in this lesson uses `export` and `import`.

Lesson 007 — Build Tools and the Dev Server. Vite is serving the project. You will add a new page to the existing project rather than creating a standalone HTML file.

---

## The Lesson

### What imperative means

The DOM APIs you used in lesson 004 are **imperative** — you tell the computer exactly what to do, step by step, in what order.

```javascript
const button = document.getElementById('toggle-button')
button.textContent = 'Hide requirements'
```

These two lines say: (1) find this element, (2) set its text. The programmer manages every step.

The opposite of imperative is **declarative** — you describe what the result should look like, and the system figures out what to do.

```jsx
<button>{isShowing ? 'Hide requirements' : 'Show requirements'}</button>
```

This line says: the button's text should be this string. The system (React) figures out which DOM operations are needed to make that true.

The difference is subtle at small scale. It becomes dramatic as state grows more complex.

---

**CS lens — state and render coupling:**

In imperative UI code, **state** (the data the program tracks) and **render** (the DOM operations that display that data) are interleaved. Every function that changes state must also perform the render operations for every piece of UI that depends on that state.

If you have 4 pieces of state and 8 UI elements, and each piece of state affects 3 UI elements, you need to write render logic for 4 × 3 = 12 dependencies. Each time you add a piece of state, you potentially add render calls to every existing function that indirectly affects that state. The complexity grows as a product, not a sum.

This is the core of the DOM manipulation problem — not that any one function is hard to write, but that the total number of state-render dependencies is hard to track and easy to get wrong.

---

**SE lens — the cost of invisible invariants:**

An **invariant** is a condition that must always be true. In the calculator you are about to build, one invariant is: "the display always shows the current expression, and the history always shows all completed calculations."

In imperative code, this invariant is maintained by convention — every developer who writes code must remember to update both places. It is not enforced by the structure of the code. If you add a feature and forget to update the history, the invariant breaks silently.

This is the category of bug the DOM manipulation problem produces: not crashes, but silent inconsistency. The UI shows stale data. Two panels show different values for the same underlying state. A button's text says "start" when the operation has already started. These bugs are hard to reproduce because they depend on the sequence of events.

React solves this by making the UI a function of state: `ui = render(state)`. If you define this function correctly once, the invariant is structural — it cannot be violated by adding features.

---

### Build the imperative calculator

Create `src/calculator-v1.js`:

```javascript
// src/calculator-v1.js
//
// Imperative calculator using raw DOM APIs.
// No framework. Every state change requires manual DOM updates.
//
// Purpose of this file: demonstrate the DOM manipulation problem.
// This approach will become unmanageable. Lesson 009 replaces it.

// ---- State ----
// These variables are the source of truth for the calculator's current state.
// Every time state changes, we must manually update every DOM element
// that displays this state.

let currentExpression = ''   // what the user is typing (e.g. "123+4")
let history           = []   // array of { expression: string, result: number }
let isError           = false

// ---- DOM References ----
// Cache references to DOM elements at startup.
// Looking up elements by ID every time is slower than caching once.

const displayEl      = document.getElementById('calc-display')
const expressionEl   = document.getElementById('calc-expression')
const historyEl      = document.getElementById('calc-history')
const historyCountEl = document.getElementById('calc-history-count')
const clearBtn       = document.getElementById('btn-clear')
const equalsBtn      = document.getElementById('btn-equals')

// Guard: verify all elements exist before using them
const requiredElements = {
  'calc-display':       displayEl,
  'calc-expression':    expressionEl,
  'calc-history':       historyEl,
  'calc-history-count': historyCountEl,
  'btn-clear':          clearBtn,
  'btn-equals':         equalsBtn,
}

Object.entries(requiredElements).forEach(([id, el]) => {
  if (el === null) {
    throw new Error(`Required element #${id} not found in the DOM.`)
  }
})

// ---- Render Functions ----
// These functions read the current state and update the DOM to match.
// Notice: every state change requires calling multiple render functions.
// This is the problem.

function renderDisplay() {
  if (isError) {
    displayEl.textContent = 'Error'
    displayEl.style.color = '#ff6b6b'
  } else if (currentExpression === '') {
    displayEl.textContent = '0'
    displayEl.style.color = ''
  } else {
    displayEl.textContent = currentExpression
    displayEl.style.color = ''
  }
}

function renderExpression() {
  if (currentExpression !== '') {
    expressionEl.textContent = currentExpression + ' ='
  } else {
    expressionEl.textContent = ''
  }
}

function renderHistory() {
  // Remove all existing history items from the DOM
  while (historyEl.firstChild) {
    historyEl.removeChild(historyEl.firstChild)
  }

  // Rebuild the history list from scratch
  if (history.length === 0) {
    const emptyMsg = document.createElement('p')
    emptyMsg.textContent = 'No calculations yet.'
    emptyMsg.style.color = '#999'
    historyEl.appendChild(emptyMsg)
  } else {
    // Show most recent first
    const reversed = [...history].reverse()
    reversed.forEach(({ expression, result }) => {
      const item = document.createElement('div')
      item.style.padding = '4px 0'
      item.style.borderBottom = '1px solid #eee'

      const exprSpan = document.createElement('span')
      exprSpan.textContent = expression + ' = '
      exprSpan.style.color = '#666'

      const resultSpan = document.createElement('span')
      resultSpan.textContent = result
      resultSpan.style.fontWeight = 'bold'

      item.appendChild(exprSpan)
      item.appendChild(resultSpan)
      historyEl.appendChild(item)
    })
  }
}

function renderHistoryCount() {
  historyCountEl.textContent = `${history.length} calculation${history.length !== 1 ? 's' : ''}`
}

function renderClearButton() {
  // The clear button label changes based on whether there is input
  if (currentExpression !== '' || isError) {
    clearBtn.textContent = 'C'
    clearBtn.title = 'Clear entry'
  } else {
    clearBtn.textContent = 'AC'
    clearBtn.title = 'All clear'
  }
}

// ---- Event Handlers ----
// Each handler modifies state, then must call every render function
// whose output depends on the changed state.

function handleDigit(digit) {
  if (isError) return

  // Prevent leading zeros (except before a decimal)
  if (digit === '0' && currentExpression === '0') return
  if (currentExpression === '0' && digit !== '.') {
    currentExpression = digit
  } else {
    currentExpression += digit
  }

  // State changed. Must update: display, expression preview, clear button.
  // (History is unchanged, but we must remember not to call renderHistory
  // here — calling it would work, but rebuilds the entire list unnecessarily.)
  renderDisplay()
  renderExpression()
  renderClearButton()
}

function handleOperator(op) {
  if (isError) return
  if (currentExpression === '') return

  // Prevent consecutive operators
  const lastChar = currentExpression.slice(-1)
  if (['+', '-', '*', '/'].includes(lastChar)) {
    // Replace the last operator
    currentExpression = currentExpression.slice(0, -1) + op
  } else {
    currentExpression += op
  }

  renderDisplay()
  renderExpression()
  renderClearButton()
}

function handleEquals() {
  if (isError)                return
  if (currentExpression === '') return

  const expression = currentExpression

  try {
    // eval() is used here for brevity in a demonstration context.
    // NEVER use eval() in production code — it executes arbitrary strings
    // as JavaScript. A real calculator parses expressions with a proper
    // algorithm. eval() is acceptable in a controlled lesson sandbox.
    //
    // The security concern: if `expression` were user input from a real
    // application (not a controlled UI input), eval() could execute
    // injected code. Here every character comes from button clicks, but
    // the pattern itself is dangerous. Lesson 027 will test the safe
    // expression parser that replaces this.
    const result = eval(expression) // eslint-disable-line no-eval

    history.push({ expression, result })
    currentExpression = String(result)
    isError = false

    // State changed: expression (now the result), history (new entry),
    // clear button (expression is non-empty). Must update all four:
    renderDisplay()
    renderExpression()
    renderHistory()
    renderHistoryCount()
    renderClearButton()

  } catch (e) {
    isError = true
    currentExpression = ''

    renderDisplay()
    renderExpression()
    renderClearButton()
    // History does not change on error — do NOT call renderHistory.
    // Calling renderHistory on error would be correct but wasteful.
    // NOT calling it on error is fragile: if history ever changes on
    // error, this function needs to be updated. The developer must remember.
  }
}

function handleClear() {
  if (currentExpression !== '' || isError) {
    // C — clear current entry only
    currentExpression = ''
    isError = false
  } else {
    // AC — clear everything including history
    history = []
    renderHistory()
    renderHistoryCount()
  }

  renderDisplay()
  renderExpression()
  renderClearButton()
}

function handleDecimal() {
  if (isError) return

  // Only add decimal if the current number segment doesn't have one
  const segments = currentExpression.split(/[+\-*/]/)
  const currentSegment = segments[segments.length - 1]

  if (currentSegment.includes('.')) return

  currentExpression += currentExpression === '' ? '0.' : '.'
  renderDisplay()
  renderExpression()
}

// ---- Wire up button click events ----
// The digit and operator buttons are created programmatically.
// This avoids writing 16 nearly-identical HTML button elements.

const buttonGrid = document.getElementById('btn-grid')

if (buttonGrid === null) {
  throw new Error('Required element #btn-grid not found.')
}

const buttons = [
  { label: '7', action: () => handleDigit('7') },
  { label: '8', action: () => handleDigit('8') },
  { label: '9', action: () => handleDigit('9') },
  { label: '/', action: () => handleOperator('/') },
  { label: '4', action: () => handleDigit('4') },
  { label: '5', action: () => handleDigit('5') },
  { label: '6', action: () => handleDigit('6') },
  { label: '*', action: () => handleOperator('*') },
  { label: '1', action: () => handleDigit('1') },
  { label: '2', action: () => handleDigit('2') },
  { label: '3', action: () => handleDigit('3') },
  { label: '-', action: () => handleOperator('-') },
  { label: '0', action: () => handleDigit('0') },
  { label: '.', action: () => handleDecimal() },
  { label: '+', action: () => handleOperator('+') },
]

buttons.forEach(({ label, action }) => {
  const btn = document.createElement('button')
  btn.textContent = label
  btn.style.padding = '16px'
  btn.style.fontSize = '18px'
  btn.style.cursor = 'pointer'
  btn.style.border = '1px solid #ccc'
  btn.style.background = '#fff'
  btn.style.borderRadius = '4px'
  btn.addEventListener('click', action)
  buttonGrid.appendChild(btn)
})

clearBtn.addEventListener('click',  handleClear)
equalsBtn.addEventListener('click', handleEquals)

// ---- Initial render ----
// Call all render functions once to set the initial UI state.
// If you add a new render function and forget to call it here,
// the initial state will be wrong.

renderDisplay()
renderExpression()
renderHistory()
renderHistoryCount()
renderClearButton()
```

---

Create `calculator.html` in the project root (next to `index.html`):

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Calculator v1 — Imperative DOM</title>
    <style>
      body {
        font-family: system-ui, sans-serif;
        max-width: 480px;
        margin: 40px auto;
        padding: 0 16px;
        background: #f5f5f5;
      }

      .calculator {
        background: #fff;
        border-radius: 8px;
        box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        overflow: hidden;
      }

      .display-area {
        background: #1a1a2e;
        color: #fff;
        padding: 20px 16px 12px;
        text-align: right;
      }

      #calc-expression {
        font-size: 13px;
        color: #aaa;
        min-height: 18px;
        margin-bottom: 4px;
      }

      #calc-display {
        font-size: 36px;
        font-weight: 300;
        letter-spacing: -1px;
      }

      .controls {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 1px;
        background: #eee;
      }

      #btn-clear, #btn-equals {
        padding: 14px;
        font-size: 16px;
        cursor: pointer;
        border: none;
        font-family: inherit;
      }

      #btn-clear  { background: #ff9f43; color: #fff; }
      #btn-equals { background: #2ed573; color: #fff; }

      #btn-grid {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: 1px;
        background: #eee;
      }

      .history-panel {
        padding: 16px;
        border-top: 1px solid #eee;
      }

      .history-panel h3 {
        margin: 0 0 8px;
        font-size: 14px;
        color: #999;
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }

      #calc-history-count {
        font-size: 12px;
        color: #bbb;
        margin-bottom: 8px;
      }

      #calc-history {
        max-height: 160px;
        overflow-y: auto;
        font-size: 14px;
      }
    </style>
  </head>
  <body>
    <h2>Calculator v1 — Imperative DOM</h2>
    <p>Built with raw DOM APIs. No framework.</p>

    <div class="calculator">
      <div class="display-area">
        <div id="calc-expression"></div>
        <div id="calc-display">0</div>
      </div>

      <div class="controls">
        <button id="btn-clear">AC</button>
        <button id="btn-equals">=</button>
      </div>

      <div id="btn-grid"></div>

      <div class="history-panel">
        <h3>History</h3>
        <div id="calc-history-count"></div>
        <div id="calc-history"></div>
      </div>
    </div>

    <script type="module" src="/src/calculator-v1.js"></script>
  </body>
</html>
```

With the Vite dev server running (`npm run dev`), open `http://localhost:5173/calculator.html`. The calculator works: buttons input digits, the display updates, equals evaluates and adds to history.

---

### What is wrong here

The calculator works. But read the code carefully and count the problems.

**Problem 1 — Every function knows about the DOM.**

`handleDigit`, `handleOperator`, `handleEquals`, `handleClear`, and `handleDecimal` all call render functions. The business logic (digit handling, expression parsing, operator management) is interleaved with render calls.

If you add a new feature — say, a "memory" button that saves the current result — you need to:
1. Add a `memory` state variable
2. Add a `renderMemory()` function
3. Add `renderMemory()` calls to every handler that might affect memory
4. Add a `#calc-memory` element to the HTML
5. Remember to call `renderMemory()` in the initial render block

Step 3 requires reading every handler and deciding whether it affects memory. If you add the handler and forget one call, the memory UI goes stale. The bug is a missing function call in a list of calls — not a logic error, but a completeness error that requires reading all handlers to catch.

---

**Problem 2 — Render coordination is manual.**

Look at `handleEquals`:

```javascript
renderDisplay()
renderExpression()
renderHistory()
renderHistoryCount()
renderClearButton()
```

And `handleClear` with history:

```javascript
renderHistory()
renderHistoryCount()
renderDisplay()
renderExpression()
renderClearButton()
```

The order and selection of render calls must be correct. If `renderHistoryCount()` is called before `renderHistory()`, it reads `history.length` before history is updated — except in this case, `history` is in the same scope and always current. But if the functions were more complex (fetching from an API, reading from a cache), the order would matter and be invisible.

---

**CS lens — the state → UI mapping problem:**

In a system with `n` state variables and `m` UI elements, where each state variable can affect multiple UI elements, the number of `(state variable, UI element)` pairs that need to be maintained grows as O(n × m).

In this calculator:
- State variables: `currentExpression`, `history`, `isError` — 3 variables
- UI elements: display, expression preview, history list, history count, clear button label — 5 elements
- Some state variables affect multiple elements: `currentExpression` affects 3 elements; `history` affects 2; `isError` affects 2

This is manageable at this scale. At 20 state variables and 40 UI elements, the coordination becomes nearly impossible to keep correct manually. The render function calls multiply. The chance of a missing render call grows. The debugging process becomes: "which state variable changed, and which render function did I forget to call?"

---

**Problem 3 — Rebuilding instead of updating.**

`renderHistory()` deletes all DOM children and rebuilds the history from scratch every time:

```javascript
while (historyEl.firstChild) {
  historyEl.removeChild(historyEl.firstChild)
}
// rebuild from history array
```

This is safe but inefficient. If the history has 100 entries and one new entry is added, the function deletes 100 DOM nodes and creates 101 new ones. The browser must recompute layout for all 101 elements.

The correct approach is to add only the new element. But that requires knowing what changed — tracking a "previous state" alongside the current state. In imperative code this means adding more variables, more logic, more coordination.

This is what React's **Virtual DOM** solves: React compares the previous render output (the virtual DOM) to the new render output and computes the minimal set of DOM operations needed to transition from one to the other. This algorithm is called **reconciliation**. You describe the desired state; React handles the diff.

---

**Problem 4 — State lives in multiple places.**

The state (`currentExpression`, `history`, `isError`) and the DOM elements that display that state are both representations of the same truth. When a render function runs, it writes the state into the DOM. Between renders, there are two sources of truth: the variables and the DOM.

This causes a class of bugs called **stale DOM state**: the DOM reflects state from a previous render, and you read the DOM to make a decision instead of reading the state. For example:

```javascript
// Reading state from the DOM — dangerous
if (clearBtn.textContent === 'C') {
  // ... there is already input
}
```

versus:

```javascript
// Reading state from the state variable — correct
if (currentExpression !== '' || isError) {
  // ... there is already input
}
```

The DOM-reading version is fragile: if you change the button text for styling or localisation, the business logic breaks. The variable-reading version is safe: the business logic reads the actual source of truth.

In React, the principle is: **never read state from the DOM**. The DOM is a render output, not a state store. State lives in React's state system (`useState`, `useReducer`). The DOM is always derived from state, never the origin of it.

---

### Count the render calls

Across all five handlers, count the total number of render function calls:

- `handleDigit`: 3 calls (`renderDisplay`, `renderExpression`, `renderClearButton`)
- `handleOperator`: 3 calls (same)
- `handleEquals` (success path): 5 calls
- `handleEquals` (error path): 3 calls
- `handleClear` (expression clear): 3 calls
- `handleClear` (full clear): 5 calls
- `handleDecimal`: 2 calls

Total: **24 render calls** spread across 6 handlers for a 3-variable, 5-element calculator.

Now imagine adding the memory feature. Each of the 6 handlers needs to decide whether to call `renderMemory()`. That is 6 more potential render calls, and 6 places where a developer could forget.

This is the DOM manipulation problem. It is not one big bug. It is the accumulation of render coordination cost as the application grows.

---

**SE lens — imperative UI as technical debt:**

This is technical debt in its original sense: a design decision that makes the system harder to change over time. The calculator works today. But every new feature — memory, keyboard input, calculation modes, a settings panel — increases the number of render calls and the number of places where a developer can forget to call one.

The debt compounds because fixing it later requires rewriting all the handlers and all the render functions at once. There is no partial fix: as long as state is separate from render, every handler is a potential place where render is missed.

Recognising this pattern is what makes choosing a framework a reasoned engineering decision rather than a fashion choice. Frameworks like React, Vue, and Angular all solve the same underlying problem: making the UI a deterministic function of state so that render coordination is handled by the system, not by the developer.

---

## Connect the Pieces

This lesson is the motivation for everything in modules 002 and 003. React (lesson 009) replaces the render function calls with a component model where the connection between state and UI is structural. `useState` (lesson 014) makes state changes automatically trigger re-renders, eliminating the manual render call pattern entirely.

The specific problems this lesson demonstrates:
- **Manual render coordination** → solved by React's component model (009) and `useState` (014)
- **Rebuilding instead of updating** → solved by React's Virtual DOM and reconciliation (009)
- **Stale DOM state** → solved by "state lives in state variables, DOM is derived" (014)
- **State-render coupling** → solved by the declarative component pattern (013)

The history panel in this lesson — a list that grows and is rebuilt from scratch — is the precursor to the lab registry (lesson 022). The registry is a list of labs. React renders that list declaratively. Adding a lab means adding to an array; the render follows automatically.

---

## What Breaks Without This

Without the initial render block at the bottom of `calculator-v1.js`, the page loads with all elements in their default state — display shows "0" from HTML, history count is empty, clear button says "AC" from HTML. This happens to match the initial state, but if the initial state were different (e.g. pre-loaded with a saved expression), the UI and state would be out of sync from the first render.

Without guard clauses for null elements:

```javascript
const clearBtn = document.getElementById('btn-clear')
clearBtn.addEventListener('click', handleClear)  // TypeError if clearBtn is null
```

```
TypeError: Cannot read properties of null (reading 'addEventListener')
```

If `#btn-clear` does not exist in the HTML, `getElementById` returns `null`, and trying to call `.addEventListener` on `null` crashes immediately. This is why the guard block at the top of the file is necessary — it converts a confusing `TypeError` into a clear error message naming the missing element.

---

## Definition of Done

- [ ] `calculator.html` exists with all required element IDs
- [ ] `src/calculator-v1.js` exists and runs without errors
- [ ] Opening `http://localhost:5173/calculator.html` shows the calculator
- [ ] Entering digits, operators, and pressing = computes the correct result
- [ ] Results appear in the history panel
- [ ] The clear button shows "C" when there is input and "AC" when empty
- [ ] You can name all three state variables and what each tracks
- [ ] You can explain why `handleEquals` calls five render functions
- [ ] You can explain what would break if you added a memory feature and forgot one render call
- [ ] You can explain the difference between reading state from variables vs reading it from the DOM
- [ ] Git commit:
  ```
  git add calculator.html src/calculator-v1.js
  git commit -m "Add imperative calculator to demonstrate DOM manipulation problem

  Working calculator with display, operators, and history panel.
  Built with raw DOM APIs to expose the render coordination problem:
  every state change requires manual render calls to all dependent elements.
  This is the motivation for React's declarative component model."
  ```
