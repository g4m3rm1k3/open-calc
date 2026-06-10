# Calculator — Lesson 06 — History

## What You Will Build

Every calculation is stored and shown in a scrollable list. After `3 + 4 = 7`,
the history shows `3 + 4 = 7`. After ten calculations, all ten are visible by
scrolling. The most recent entry is always at the top. Clicking a history entry
pastes its result into the display. A "Clear" button empties the list.

By the end of this lesson you will understand why mutation is the wrong approach
for lists that grow over time, and why the immutable append pattern used here is
the same pattern underlying git commits, financial ledgers, and database write-ahead
logs.

## What You Need to Know First

Lessons 01–05. The calculator evaluates arithmetic and formats results. This lesson
adds memory of what was computed. No existing code is replaced — `HistoryEntry`
is added to the type registry, `history` is added to the state, and `applyEquals`
gains one extra return field.

---

## The Problem

The calculator computes `3 + 4` and shows `7`. The user types `8 - 2` and the
previous result is gone. There is no record. Every real calculator keeps a history.

The obvious approach: store a history array and call `.push()` to add each new entry.
This works until you need undo, replay, serialisation, or the ability to reason about
"what was the state before this operation?" Pushed arrays change identity over time:
the same object holds different contents at different moments. You cannot compare
old and new — there is no old.

The correct approach: history is an **immutable log**. Entries are never modified.
New entries are added by creating a new array: `[...existingHistory, newEntry]`. The
previous array is unchanged. Every past state is still reachable if something holds
a reference to it.

---

## Step 1 — The History Entry Type

### The problem

Each history entry needs three pieces of information: the expression the user typed,
the formatted result, and when the calculation happened. These three belong together —
the result is meaningless without the expression that produced it, and the timestamp
allows ordering even if entries are ever filtered or reconstructed.

### The code

Add to `src/types.ts` (the central type registry from lesson 02):

```typescript
export interface HistoryEntry {
  expression: string
  result:     string
  timestamp:  number
}
```

**What `src/types.ts` is:**
`types.ts` is the central type registry — the single file that owns shared type
definitions used across multiple modules. It was established in lesson 02 with
`ButtonType` and `ButtonConfig`. `HistoryEntry` is added here because it is used
by `input-reducer.ts` (creates entries), `calculator-state.ts` (stores them),
and `main.ts` (renders them). A type used in three or more places belongs in the
central registry.

**`timestamp: number`:**
`Date.now()` returns a number — the milliseconds elapsed since January 1, 1970,
00:00:00 UTC (the **Unix epoch**). At the time this is being read, that number
is approximately 1,749,000,000,000 (1.749 trillion). It increases continuously
and never decreases. The timestamp serves two purposes: it records when each
calculation happened, and it provides a stable sort key — entries are always in
chronological order regardless of how the array is reconstructed.

**CS lens — records:**
`HistoryEntry` is a **record** — a named collection of typed fields. An array of
`HistoryEntry` objects is the log data structure. Appending is O(1) amortised.
Reading any entry is O(1). There is no need for sorting, random deletion, or
deduplication. An array is the correct data structure for this use case: ordered,
append-only access.

**`Date.now()` — first appearance:**
`Date.now()` is a static method on JavaScript's built-in `Date` class. It requires
no arguments and returns the current time as a number. It is the simplest way to
get a timestamp. Unlike `new Date()`, it returns a primitive number rather than a
`Date` object — no conversion needed. The number is universally comparable: a larger
number is always a later time.

---

## Step 2 — History in Calculator State

### The problem

History must live in `CalculatorState` alongside `displayValue` and `precision`.
If it lived in a separate module-level variable, clearing history would require
reaching into a foreign module. With history in the state, clearing is a state
transition: `calculatorState = { ...calculatorState, history: [] }`. All state
operations look the same — spread the old state, override the changing fields.

### The code

Update `src/calculator-state.ts`:

```typescript
import { InputState }                        from './input-state.js'
import { PrecisionLevel, DEFAULT_PRECISION } from './format-number.js'
import { HistoryEntry }                      from './types.js'
```

**Import explanation:**
`import { InputState } from './input-state.js'` — `input-state.ts` owns the four
valid input states (lesson 03). This import existed before; unchanged.

`import { PrecisionLevel, DEFAULT_PRECISION } from './format-number.js'` —
`format-number.ts` owns the display formatting and precision type (lesson 05). This
import existed before; unchanged.

`import { HistoryEntry } from './types.js'` — `types.ts` is the central type
registry (lesson 02). We import `HistoryEntry` — the type just defined in step 1 —
because `CalculatorState.history` must be typed as an array of that shape. The
import also ensures TypeScript checks that anything we store in the array matches
the `HistoryEntry` interface.

```typescript
export interface CalculatorState {
  displayValue:    string
  inputState:      InputState
  hasDecimalPoint: boolean
  precision:       PrecisionLevel
  history:         readonly HistoryEntry[]
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

**`readonly HistoryEntry[]` — first appearance:**
`readonly` before an array type means the array's contents cannot be mutated.
TypeScript rejects `.push()`, `.pop()`, `.splice()`, `.sort()`, and every other
method that modifies the array in place:

```typescript
state.history.push(newEntry)    // TypeScript error: push not available on readonly array
state.history[0] = newEntry     // TypeScript error: index assignment blocked
```

To add an entry, a **new array** must be created:
```typescript
[...state.history, newEntry]    // allowed — creates a new array
```

The old array is unchanged. This is **immutability at the type level**: the type
system enforces the pattern, making mutation a compile error rather than a silent bug.

**CS lens — why `readonly` and not just convention:**
The alternative is to rely on convention — "we agree not to push." Conventions are
enforced by culture, not by the compiler. A new team member, or a tired senior one,
mutates the array. The bug is silent and may manifest far from the cause. TypeScript's
`readonly` encodes the convention as a type constraint. Violation is a compile error.
No code review needed; the tool catches it first.

**SE lens — immutability as the foundation of persistence:**
An immutable log is the data structure behind **event sourcing** — a pattern where
system state is derived by replaying a complete history of events. In this approach:
- **git** stores commits as an immutable append-only log (every commit is permanent)
- **Financial ledgers** add transactions; they never modify or delete past entries
- **Database WAL** (write-ahead log) records every change before applying it,
  enabling recovery after crashes
- **Kafka** and similar message queues are immutable logs consumed by many readers

The history array here is the same pattern at a small scale: each entry is an event
("this expression was evaluated to this result at this time"). Mutating it would be
like editing a past git commit — the history becomes unreliable.

---

## Step 3 — Recording History on Equals

### The problem

When `=` is pressed and the result is valid, a new entry must be appended to the
history. The entry records the expression as typed and the formatted result.

### The code

Update `applyEquals` in `src/input-reducer.ts`:

```typescript
import { HistoryEntry } from './types.js'
```

**Import explanation:**
`import { HistoryEntry } from './types.js'` — `types.ts` is the central type
registry (lesson 02). We import `HistoryEntry` — the type defined in step 1 —
because `applyEquals` creates a new `HistoryEntry` object. TypeScript uses the
type annotation (`const newEntry: HistoryEntry = {...}`) to verify that the object
has all required fields with the correct types. Without the import, TypeScript does
not know what `HistoryEntry` requires.

```typescript
function applyEquals(state: CalculatorState): CalculatorState {
  const evaluationResult = evaluate(state.displayValue)

  if (isCalcError(evaluationResult)) {
    return {
      ...state,
      displayValue:    `Error: ${evaluationResult.message}`,
      inputState:      InputState.IDLE,
      hasDecimalPoint: false,
    }
  }

  const formattedResult = formatResult(evaluationResult, state.precision)

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

**The append pattern — `[...state.history, newEntry]`:**
Spread syntax recap (from lesson 03): `[...state.history, newEntry]` creates a
**new array** containing all elements of `state.history` followed by `newEntry`.
The original `state.history` is not modified — a new array is created. This is
the immutable append: the old state still holds its array unchanged; the new state
holds a new array with one more element.

Contrast with the wrong approach:
```typescript
state.history.push(newEntry)    // TypeScript error (readonly), and wrong anyway
```
`push` modifies the array that the **old state** still references. Any code holding
the old state would see the new entry appear retroactively — the old state is
corrupted. With `[...state.history, newEntry]`, the old state is unchanged.

### Walkthrough — recording `3 + 4 = 7`

State before pressing `=`:
```
{ displayValue: '3+4', inputState: 'AFTER_OPERATOR', history: [], precision: 10, ... }
```

`evaluate('3+4')` returns `7` (a number, not an error).
`formatResult(7, 10)` returns `'7'`.

`newEntry`:
```
{ expression: '3+4', result: '7', timestamp: 1749000000000 }
```

`[...state.history, newEntry]`:
The old `history` is `[]` (empty array). The new array is `[ { expression: '3+4', result: '7', ... } ]`.
A new array object is created; the old empty array is unchanged.

Returned state:
```
{
  displayValue:    '7',
  inputState:      'AFTER_EQUALS',
  hasDecimalPoint: false,
  history: [
    { expression: '3+4', result: '7', timestamp: 1749000000000 }
  ],
  precision: 10,
}
```

**After a second calculation `8 - 2 = 6`:**
The new `history` is `[...previousHistory, newEntry2]`:
```
[
  { expression: '3+4', result: '7',  timestamp: T1 },
  { expression: '8-2', result: '6',  timestamp: T2 },
]
```
Each `applyEquals` call creates a new array with all previous entries plus one new
one. No entry is ever modified. The log is permanent.

**CS lens — O(n) copy cost:**
`[...state.history, newEntry]` copies all existing entries into a new array. After
100 calculations, this copies 100 entries. This is O(n) in the number of history
entries. For a human-speed calculator (one calculation per few seconds), 100 entries
is negligible — microseconds of work. For a system receiving a million events per
second, O(n) copy would be unacceptable and a persistent data structure (such as a
linked list or a functional array) would be used instead. The correct choice depends
on the scale. Here, O(n) is correct.

---

## Step 4 — The History UI

### The problem

The history array exists in state. Now it must be visible on screen as a scrollable
panel that shows each entry and allows clicking an entry to reuse its result.

### Add to `index.html`

Inside `.calculator`, below the button grid:

```html
<div class="history-panel">
  <div class="history-header">
    <span class="history-title">History</span>
    <button class="history-clear-btn" id="history-clear">Clear</button>
  </div>
  <ul class="history-list" id="history-list"></ul>
</div>
```

**`<ul>` and `<li>` elements — first appearance:**
`<ul>` is an **unordered list** — a semantic HTML element for a list of items where
the order is not the primary meaning. `<li>` is a **list item** — each entry in the
list. Using `<ul>` with `<li>` children is semantically correct for a history panel:
the browser exposes it as a list to screen readers and accessibility tools, and CSS
can target the list structure directly.

### Add to `style.css`

```css
:root {
  /* Add to existing root tokens */
  --colour-history-text:   #94a3b8;
  --colour-history-result: #e2e8f0;
  --colour-history-hover:  #1e293b;
  --height-history-panel:  200px;
}

.history-panel {
  margin-top:  var(--space-md);
  border-top:  1px solid var(--colour-border);
  padding-top: var(--space-sm);
}

.history-header {
  display:         flex;
  justify-content: space-between;
  align-items:     center;
  margin-bottom:   var(--space-sm);
}

.history-title {
  color:       var(--colour-history-text);
  font-size:   var(--font-size-history);
  font-family: var(--font-display);
}

.history-clear-btn {
  background: transparent;
  color:      var(--colour-history-text);
  border:     1px solid var(--colour-border);
  font-size:  var(--font-size-history);
  padding:    0.2rem var(--space-sm);
  cursor:     pointer;
  height:     auto;
}

.history-list {
  list-style:     none;
  max-height:     var(--height-history-panel);
  overflow-y:     auto;
  display:        flex;
  flex-direction: column-reverse;
}

.history-entry {
  padding:         var(--space-sm);
  cursor:          pointer;
  border-radius:   var(--radius-display);
  display:         flex;
  justify-content: space-between;
  align-items:     center;
  gap:             var(--space-sm);
}

.history-entry:hover {
  background-color: var(--colour-history-hover);
}

.history-expression {
  color:       var(--colour-history-text);
  font-size:   var(--font-size-history);
  font-family: var(--font-display);
}

.history-result {
  color:       var(--colour-history-result);
  font-size:   var(--font-size-history);
  font-family: var(--font-display);
  font-weight: bold;
}
```

**`overflow-y: auto` — first appearance:**
`overflow-y: auto` tells the browser: if the list content is taller than
`max-height`, show a vertical scrollbar on the right side. Without it, the panel
would grow as tall as needed and push all elements below it down the page. With it,
the panel stays at a fixed height (`--height-history-panel`) and the user scrolls
within it. `overflow-y: auto` adds a scrollbar only when content overflows; `scroll`
would show a scrollbar permanently.

**`flex-direction: column-reverse` — first appearance:**
`flex-direction: column-reverse` stacks flex items from bottom to top instead of
top to bottom. The first `<li>` added to the DOM appears at the **bottom** of the
panel; the last added appears at the **top**. For a history list, this means newer
entries appear at the top without any JavaScript sorting. Adding entries to the end
of the DOM is sufficient to keep the most recent result visible without scrolling.

A consequence worth understanding: the DOM order and the visual order are opposite.
The first `<li>` in the HTML is the oldest calculation, appearing at the bottom.
The last `<li>` is the newest, appearing at the top. This is intentional.

---

## Step 5 — Render History and Wire Events

### The code

Add to `src/main.ts`:

```typescript
import { InputState }   from './input-state.js'
import { formatResult } from './format-number.js'
```

**Import explanation:**
`import { InputState } from './input-state.js'` — `input-state.ts` owns the four
valid input states (lesson 03). We import `InputState` because the click handler
for a history entry sets `inputState: InputState.AFTER_EQUALS` — we need the named
constant, not the raw string `'AFTER_EQUALS'`.

`import { formatResult } from './format-number.js'` — `format-number.ts` owns
display formatting (lesson 05). These imports may already exist in `main.ts`;
confirm they are present.

```typescript
function renderHistory(): void {
  const historyList =
    document.querySelector<HTMLUListElement>('#history-list')
  if (historyList === null) return

  historyList.textContent = ''

  for (const entry of calculatorState.history) {
    const listItem = document.createElement('li')
    listItem.className = 'history-entry'

    const expressionSpan = document.createElement('span')
    expressionSpan.className   = 'history-expression'
    expressionSpan.textContent = entry.expression

    const resultSpan = document.createElement('span')
    resultSpan.className   = 'history-result'
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
```

Wire the Clear button:

```typescript
const historyClearButton =
  document.querySelector<HTMLButtonElement>('#history-clear')
historyClearButton?.addEventListener('click', () => {
  calculatorState = { ...calculatorState, history: [] }
  renderHistory()
})
```

Update `updateDisplay` to call `renderHistory` at the end:

```typescript
function updateDisplay(): void {
  const displayElement =
    document.querySelector<HTMLSpanElement>('.display-value')
  if (displayElement === null) throw new Error('Display element not found')
  displayElement.textContent = calculatorState.displayValue
  renderHistory()
}
```

**`historyList.textContent = ''` — clearing the DOM:**
Setting `textContent` to an empty string removes all child nodes of an element.
This is the safe way to clear a container — safer than `innerHTML = ''` because
it cannot accidentally trigger HTML parsing. After clearing, the loop rebuilds the
list entirely from the current state. This is the **render from scratch** pattern:
every `updateDisplay` re-renders the full history from state. For a human-speed
calculator with at most a few hundred entries, re-rendering is instantaneous.

**Security — `textContent` continues the safe pattern:**
`expressionSpan.textContent = entry.expression` assigns the expression as plain
text. `entry.expression` is a string the user typed — for example, `'3+4'` or
`'sin(30)'`. Using `textContent` means even if the string contained `<script>`,
`<img onerror=...>`, or any other HTML, it would be rendered literally as characters
rather than parsed and executed. The safe pattern from lesson 02 is maintained
consistently throughout the application.

**Clicking a history entry:**
When the user clicks an entry, the state is updated to show `entry.result` as the
current display value, with `inputState: AFTER_EQUALS`. This means the user can
immediately continue: click the `8 - 2 = 6` history entry, then press `× 3 =` to
get `18`.

### Walkthrough — rendering after two calculations

After `3 + 4 = 7` and `8 - 2 = 6`:
```
calculatorState.history = [
  { expression: '3+4', result: '7', timestamp: T1 },
  { expression: '8-2', result: '6', timestamp: T2 },
]
```

`renderHistory()` clears `historyList`. The `for...of` loop iterates in array order:
first `3+4 = 7` → appended as first `<li>`, then `8-2 = 6` → appended as second `<li>`.

DOM order: `[ 3+4=7 (first), 8-2=6 (second) ]`.

`flex-direction: column-reverse` reverses visual order:
```
8-2 = 6    ← visible at top (most recent)
3+4 = 7    ← visible below (earlier)
```

The most recent calculation is always at the top. The user does not need to scroll
to find what they just computed.

---

## Debugging: When History Behaves Wrongly

**Symptom: history shows an entry for failed calculations**

`renderHistory` rebuilds from `calculatorState.history`. The history is only updated
in `applyEquals`, and only when the result is a number (not a `CalcError`). Add a
temporary log at the start of `applyEquals`:

```typescript
console.log('applyEquals called, error?', isCalcError(evaluate(state.displayValue)))
```

If a failed calculation appears in history, the early return on `isCalcError` is
missing or positioned after the `history: [...]` field update.

**Symptom: clicking a history entry does not update the display**

The click handler sets `calculatorState` but `updateDisplay()` is not called, or
the wrong element selector is used. Add a temporary log:

```typescript
listItem.addEventListener('click', () => {
  console.log('clicked entry:', entry)
  // ...
  updateDisplay()
  console.log('state after click:', calculatorState.displayValue)
})
```

**Symptom: the most recent entry appears at the bottom, not the top**

`flex-direction: column-reverse` is missing or overridden. Open the browser DevTools
(F12 → Elements tab), inspect `.history-list`, and check the computed CSS. If
`column-reverse` is not applied, check the CSS for a competing rule.

**Symptom: pressing Clear does not clear the history panel visually**

The `renderHistory()` call is missing from the Clear button's event handler. The
state is updated (`history: []`) but the DOM is not re-rendered. Add `renderHistory()`
immediately after the state assignment in the Clear handler.

Remove all temporary `console.log` statements before committing.

---

## Connect the Pieces

The `history` field in `CalculatorState` is an append-only log of every successful
evaluation. In lesson 08 (variables), the environment is also immutable and
append-only — the same pattern applied to name-to-value bindings. Every time a
concept requires "add without overwriting the old version," the spread-and-append
pattern is the answer.

Because `HistoryEntry` contains only `string` and `number` fields, the entire
history can be serialised to JSON and stored in `localStorage`:

```typescript
localStorage.setItem('history', JSON.stringify(calculatorState.history))
```

This requires no special handling — plain object, plain JSON. The immutable log
design makes persistence a one-liner.

The timestamp field makes future features straightforward: grouping by session,
filtering to the last hour, or displaying elapsed time since each calculation all
start from `entry.timestamp` — a value that was free to add and costs nothing at
render time.

---

## What Breaks Without This

**Without `readonly HistoryEntry[]`:**
Any code in the project could write:
```typescript
calculatorState.history.push(newEntry)
```
This mutates the array that the **previous state** also references. If any test
holds a reference to the previous state (to verify it was not changed), that test
would silently see the new entry. Future lessons that keep references to intermediate
states (for undo, for replay) would find those references corrupted. With `readonly`,
`push` is a compile error — the mutation cannot happen, by construction.

**Without `textContent = ''` before re-rendering:**
Each call to `renderHistory` would append new `<li>` elements without removing the
old ones. After three calculations, pressing `=` for the fourth time would result in
seven `<li>` elements: the previous three (not removed) plus the same three re-added
plus the new one. The history list would show duplicates and grow without bound.

**Without `flex-direction: column-reverse`:**
Entries would appear in DOM order, with the oldest at the top and the newest at the
bottom. After ten calculations, the user would need to scroll down to see the most
recent result. This is opposite to the expected mental model — the most recently
done thing should be immediately visible, not buried.

---

## Definition of Done

- [ ] After `3 + 4 =`, the history panel shows `3 + 4` on the left and `= 7` on the right
- [ ] After 10 calculations, all 10 are visible by scrolling
- [ ] The most recent entry is visible at the top without scrolling
- [ ] Clicking a history entry pastes its result into the display
- [ ] The user can continue calculating from a pasted history result (e.g., `= 7` then
      `× 2 =` gives `14`)
- [ ] The "Clear" button empties the history list
- [ ] Failed calculations (e.g., `1 / 0 =`) do not appear in the history
- [ ] `history` in `CalculatorState` is typed as `readonly HistoryEntry[]`
- [ ] History entries are appended with `[...state.history, newEntry]` — `.push()` is
      never used
- [ ] You can explain what `readonly HistoryEntry[]` prevents at the type level
- [ ] You can explain the difference between `push` (mutation) and spread-append
      (immutable copy) and what breaks with each
- [ ] You can explain what `Date.now()` returns and what the Unix epoch is
- [ ] You can explain what `overflow-y: auto` does and when it shows a scrollbar
- [ ] You can explain what `flex-direction: column-reverse` does and why it is used
- [ ] You can explain why `textContent` is used instead of `innerHTML` to set entry text
- [ ] You can explain the event sourcing pattern and name two production systems that
      use it (git, financial ledgers, database WAL, etc.)
- [ ] You can explain why the history list is re-rendered from scratch on each
      `updateDisplay` call
- [ ] Run:
      ```
      git add src/types.ts src/calculator-state.ts src/input-reducer.ts src/main.ts index.html src/style.css
      git commit -m "Add calculation history: immutable append-only log, scroll panel shows most recent first, click to reuse results"
      ```

---

*Next: Lesson 07 — Full Expressions. The simple string-splitting evaluator is
replaced by a lexer and recursive descent parser. Parentheses work. Exponentiation
is right-associative. The grammar is written before the parser — the specification
precedes the implementation.*
