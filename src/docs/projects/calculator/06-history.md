# Lesson 06 — History

## What You Will Build

Every calculation is stored and shown in a scrollable list. After `3 + 4 = 7`,
the history shows `3 + 4 = 7`. After ten calculations, all ten are visible by
scrolling. Clicking a history entry pastes its result into the display.

## What You Need to Know First

Lessons 01–05. The calculator evaluates arithmetic and formats results.
This lesson adds memory of what was computed.

---

## The Lesson

### The problem

The calculator computes `3 + 4` and shows `7`. Then the user types `8 - 2` and
the previous result is gone. There is no record. Every real calculator keeps a
history. The question is how to store it correctly.

The wrong approach: store the history list and mutate it on every calculation.
Push new entries onto an array, modify entries in place. This works until you
need to undo, replay, or debug. Mutated state is hard to reason about because
it changes over time and you cannot go back.

The right approach: history is an immutable log. Entries are never modified.
New entries are appended. Nothing is deleted (unless the user explicitly clears).
The current state of history is always the full log from the beginning.

---

### Step 1 — The history entry type

Add to `src/types.ts`:

```typescript
export interface HistoryEntry {
  expression: string
  result:     string
  timestamp:  number
}
```

**CS lens — data structures:**
`HistoryEntry` is a record — a named collection of fields with defined types.
The array of `HistoryEntry` objects is the history data structure. Reading it
is `O(1)` per entry. Appending to it is `O(1)` amortised. It is the simplest
data structure that fits the problem. A calculator history does not need sorted
access, random deletion, or deduplication. An array is correct.

**SE lens — timestamp for ordering:**
`timestamp: number` stores `Date.now()` — milliseconds since epoch — at the
moment the calculation was made. This ensures entries are always in chronological
order even if the array is ever sorted, filtered, or reconstructed. The timestamp
is the ground truth about when something happened. It is cheap to store and
invaluable when you later need to sort or group.

---

### Step 2 — History in the calculator state

Update `src/calculator-state.ts`:

```typescript
import { HistoryEntry }  from './types.js'

export interface CalculatorState {
  displayValue:    string
  inputState:      InputState
  hasDecimalPoint: boolean
  precision:       PrecisionLevel
  history:         readonly HistoryEntry[]  // readonly: never mutate directly
}

export function createInitialState(): CalculatorState {
  return {
    displayValue:    '0',
    inputState:      InputState.IDLE,
    hasDecimalPoint: false,
    precision:       DEFAULT_PRECISION,
    history:         [],
  }
}
```

**SE lens — `readonly` array:**
`readonly HistoryEntry[]` tells TypeScript that this array must not be mutated.
Calling `.push()` or `.splice()` on it is a compile error. To add an entry, you
create a new array: `[...state.history, newEntry]`. The old array is unchanged.
The new state has a new array with one more entry.

This is the immutability principle: state does not change, it is replaced. Every
version of the history array that ever existed still exists in memory (until
garbage collected). This is the foundation of undo — you keep the previous state.

---

### Step 3 — Recording history on equals

Update `applyEquals` in `src/input-reducer.ts`:

```typescript
function applyEquals(state: CalculatorState): CalculatorState {
  const result = evaluate(state.displayValue)

  if (isCalcError(result)) {
    return {
      ...state,
      displayValue: `Error: ${result.message}`,
      inputState:   InputState.IDLE,
    }
  }

  const formattedResult = formatResult(result, state.precision)

  const newEntry: HistoryEntry = {
    expression: state.displayValue,
    result:     formattedResult,
    timestamp:  Date.now(),
  }

  return {
    ...state,
    displayValue:    formattedResult,
    inputState:      InputState.AFTER_EQUALS,
    hasDecimalPoint: formattedResult.includes('.'),
    history:         [...state.history, newEntry],
  }
}
```

**CS lens — append-only log:**
`[...state.history, newEntry]` creates a new array containing all previous
entries plus the new one. The original `state.history` array is never touched.
This pattern — appending to an immutable list — is the basis of event sourcing:
a system where the state is the sum of all events that have happened, never
modified after the fact.

---

### Step 4 — The history UI component

Add to `index.html` inside `.calculator`, below the button grid:

```html
<div class="history-panel">
  <div class="history-header">
    <span class="history-title">History</span>
    <button class="history-clear-btn" id="history-clear">Clear</button>
  </div>
  <ul class="history-list" id="history-list"></ul>
</div>
```

Add tokens and styles to `style.css`:

```css
:root {
  --color-history-bg:       #0f172a;
  --color-history-text:     #94a3b8;
  --color-history-result:   #e2e8f0;
  --color-history-hover:    #1e293b;
  --font-size-history:      0.85rem;
  --height-history-panel:   200px;
}

.history-panel {
  margin-top:    var(--spacing-md);
  border-top:    1px solid var(--color-border);
  padding-top:   var(--spacing-sm);
}

.history-header {
  display:         flex;
  justify-content: space-between;
  align-items:     center;
  margin-bottom:   var(--spacing-sm);
}

.history-title {
  color:       var(--color-history-text);
  font-size:   var(--font-size-history);
  font-family: var(--font-family-display);
}

.history-clear-btn {
  background: transparent;
  color:      var(--color-history-text);
  border:     1px solid var(--color-border);
  font-size:  var(--font-size-history);
  padding:    0.2rem var(--spacing-sm);
  cursor:     pointer;
  height:     auto;
}

.history-list {
  list-style:    none;
  max-height:    var(--height-history-panel);
  overflow-y:    auto;
  display:       flex;
  flex-direction: column-reverse; /* most recent at top */
}

.history-entry {
  padding:         var(--spacing-sm);
  cursor:          pointer;
  border-radius:   var(--radius-display);
  display:         flex;
  justify-content: space-between;
  align-items:     center;
  gap:             var(--spacing-sm);
}

.history-entry:hover {
  background-color: var(--color-history-hover);
}

.history-expression {
  color:     var(--color-history-text);
  font-size: var(--font-size-history);
  font-family: var(--font-family-display);
}

.history-result {
  color:     var(--color-history-result);
  font-size: var(--font-size-history);
  font-family: var(--font-family-display);
  font-weight: bold;
}
```

---

### Step 5 — Render history and wire events

Add to `src/main.ts`:

```typescript
function renderHistory(): void {
  const historyList = document.querySelector<HTMLUListElement>('#history-list')
  if (historyList === null) return

  historyList.innerHTML = ''

  for (const entry of calculatorState.history) {
    const listItem = document.createElement('li')
    listItem.className = 'history-entry'

    const expressionSpan = document.createElement('span')
    expressionSpan.className = 'history-expression'
    expressionSpan.textContent = entry.expression

    const resultSpan = document.createElement('span')
    resultSpan.className = 'history-result'
    resultSpan.textContent = `= ${entry.result}`

    listItem.appendChild(expressionSpan)
    listItem.appendChild(resultSpan)

    listItem.addEventListener('click', () => {
      calculatorState = {
        ...calculatorState,
        displayValue:    entry.result,
        inputState:      InputState.AFTER_EQUALS,
        hasDecimalPoint: entry.result.includes('.'),
      }
      updateDisplay()
    })

    historyList.appendChild(listItem)
  }
}

const historyClearButton = document.querySelector('#history-clear')
historyClearButton?.addEventListener('click', () => {
  calculatorState = { ...calculatorState, history: [] }
  renderHistory()
})
```

Update `updateDisplay` to call `renderHistory`:

```typescript
function updateDisplay(): void {
  const displayElement = document.querySelector('.display-value')
  if (displayElement === null) throw new Error('Display element not found')
  displayElement.textContent = calculatorState.displayValue
  renderHistory()
}
```

---

## Connect the Pieces

The history array in `CalculatorState` is the complete record of every calculation.
Every other component reads from state — it does not maintain its own record. The
history panel renders whatever is in `state.history`. When the calculator is reset,
a new state with an empty history is produced. The history is always correct because
the state is always correct.

In a future extension, the history log could be serialised to `localStorage` to
persist across page refresh. Because history is a plain array of plain objects,
serialisation is `JSON.stringify(state.history)`. No special handling needed.

---

## What Breaks Without This

Without immutability, history is an array that gets `.push()`ed on every calculation.
When the user presses `C`, do you clear the history? Do you leave it? What if you
want to undo the last calculation? You would need to `.pop()` from the array —
but `pop` mutates the same array that every part of the application references.
Two references to the same array, one mutation, unpredictable behaviour.

With immutability, there is no ambiguity. `C` produces a new state with the same
history. A "clear history" button produces a new state with `history: []`. The
display reverts to a previous state by restoring a previous state object. Every
operation is a state transition, not a mutation.

---

## Definition of Done

- [ ] After `3 + 4 =`, the history shows `3 + 4 = 7`
- [ ] After 10 calculations, all 10 are visible by scrolling
- [ ] The most recent entry is visible without scrolling
- [ ] Clicking a history entry pastes its result into the display
- [ ] The "Clear History" button empties the history list
- [ ] The history array is `readonly` in `CalculatorState`
- [ ] History entries are appended with spread (`[...state.history, newEntry]`) — never `.push()`
