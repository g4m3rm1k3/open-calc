# FlowBoard Masterclass — LAB 08 — Typing Creates Cards: `useState` and Controlled Inputs

**Prerequisites:** LAB-07 — Viewport layout with sticky header and scrollable board.

**What this lab adds:**
- `useState` hook — React's mechanism for storing values that change over time
- Controlled inputs — HTML `<input>` where React owns the value
- Event handlers — responding to keyboard and form events
- Local component state — state that lives in one component only
- Adding an input field to `List` that creates a new card on Enter

**Time:** 55–75 minutes

---

> **Quick Check — try to answer before reading further:**
>
> 1. HTML inputs have their own built-in state (whatever the user has typed). What problem might arise if the input's value and your JavaScript variable are not synchronized?
> 2. A React component re-renders when something changes. What kind of "something" would tell React "the user typed a character, re-render the input with the new value"?
> 3. An input that calls `onChange` and reads from a state variable is called a "controlled input." What do you think an "uncontrolled input" would be?
>
> *(Answers at the end of this lab)*

---

## What You Will Build

Each list will have a text input at the bottom. When the user types a card title and presses Enter, the new card appears in that list immediately, and the input clears.

```
┌──────────────┐
│  TO DO    3  │
├──────────────┤
│ Fix login    │
│ Update home  │
│ Write email  │
├──────────────┤
│ + Add a card │  ← input field
│ [____________]
└──────────────┘
     ↕ type "New card" and press Enter ↕
┌──────────────┐
│  TO DO    4  │
├──────────────┤
│ Fix login    │
│ Update home  │
│ Write email  │
│ New card     │  ← added
├──────────────┤
│ + Add a card │
│ [____________]
└──────────────┘
```

---

## Concept: `useState`

**What it is:** `useState` is a React hook that stores a value inside a component and causes the component to re-render when the value changes. It returns a pair: the current value, and a function to update it.

**The problem before:**

Try to add a card without state:

```tsx
// In List.tsx — this DOES NOT WORK
let inputValue = '';

function handleKeyDown(event: React.KeyboardEvent) {
  if (event.key === 'Enter') {
    // "add a card with inputValue"
    // But where? cards is a prop — we can't modify it.
    // And even if we could, React doesn't know anything changed.
    inputValue = '';
  }
}
```

Two problems:
1. Regular variables are reset every time the component re-renders — any value you store disappears
2. Changing a regular variable does not tell React to re-render

`useState` solves both problems: the value persists between renders, and calling the setter function schedules a re-render.

**The syntax:**

```tsx
import { useState } from 'react';

// Declare a state variable
const [value, setValue] = useState('');
//     ↑         ↑              ↑
//  current   setter fn    initial value
```

The array destructuring `[value, setValue]` unpacks two things:
- `value` — the current stored value (a string, a number, an array, anything)
- `setValue` — a function you call to update the value. React re-renders when you call it.

**What happens when you call `setValue`:**

```tsx
setValue('hello'); // 1. React stores 'hello' as the new value
                   // 2. React schedules a re-render
                   // 3. Component function runs again
                   // 4. useState returns 'hello' as value
                   // 5. JSX is recomputed with the new value
```

**You will see this again in:** Every interactive React component uses `useState` — search inputs, form fields, toggle buttons, counters, accordions, modal open/close. It is the most fundamental React concept after components and props.

---

## Concept: Controlled Inputs

**What it is:** An input where React owns the value. The `value` prop is set from a state variable, and `onChange` updates the state variable whenever the user types. React and the input are always synchronized.

**The problem before — uncontrolled input:**

An HTML input has its own browser-managed state. If you render `<input />`, the browser tracks what the user typed. Your React code has no access to this value unless you use a `ref` to read it on demand — this is the "uncontrolled" pattern.

```tsx
// Uncontrolled — React does NOT know the current value
<input onKeyDown={handleKeyDown} />
// To read the value, you need a ref: inputRef.current.value
```

The problem: when you need to clear the input (after Enter), you must imperatively call `inputRef.current.value = ''`. When the input value affects other UI (like a search that filters results), you must manually synchronize the input value with that UI.

**Controlled input — React owns everything:**

```tsx
// Controlled — React always knows the current value
const [inputValue, setInputValue] = useState('');

<input
  value={inputValue}           // ← React controls what the input shows
  onChange={(e) => setInputValue(e.target.value)}  // ← React tracks every keystroke
/>
```

With a controlled input:
- Clearing the input is just `setInputValue('')`
- Reading the value is just `inputValue` — no ref needed
- The value can be used in JSX directly (`if (inputValue.length > 0)`)

**The data flow:**

```
User types 'A'
    ↓
onChange fires with event.target.value = 'A'
    ↓
setInputValue('A')
    ↓
React re-renders
    ↓
<input value="A" /> — input shows 'A'
```

Every keystroke goes through this cycle. This is React's "controlled component" pattern — React is the single source of truth for the input's value.

**You will see this again in:** Every form, search bar, filter input, inline editor in the app. Controlled inputs are the standard React pattern for all user input.

---

## Concept: Event Handlers in React

**What it is:** Functions attached to JSX elements that run when user interactions occur. React uses camelCase event names like `onClick`, `onChange`, `onKeyDown` — the JSX versions of the browser's `onclick`, `onchange`, `onkeydown`.

**The events you need for this lab:**

```tsx
// onChange fires on every keystroke in an input
<input onChange={(event) => setInputValue(event.target.value)} />

// onKeyDown fires when a key is pressed
<input onKeyDown={(event) => {
  if (event.key === 'Enter') {
    // user pressed Enter
  }
}} />
```

**Event object typing in TypeScript:**

React provides typed event objects. For input events, the types are:
- `React.ChangeEvent<HTMLInputElement>` — for `onChange` on an `<input>`
- `React.KeyboardEvent<HTMLInputElement>` — for `onKeyDown` on an `<input>`

TypeScript will infer these types automatically from the JSX — you only need to write them explicitly in extracted handler functions.

**Inline vs extracted handlers:**

```tsx
// Inline — fine for simple one-liners
<input onChange={(e) => setInputValue(e.target.value)} />

// Extracted — better when logic is more than one line
function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
  setInputValue(event.target.value);
}
<input onChange={handleChange} />
```

**You will see this again in:** Every interactive element — buttons, inputs, selects, checkboxes. `onClick` on buttons, `onChange` on inputs, `onSubmit` on forms.

---

## Step 1 — Add local state to the `List` component

The new card input lives in `List.tsx`. The input's current value is local to the list — no other component needs to know what the user is typing.

Update `List.tsx` to add `useState`:

```tsx
// List.tsx

import { useState } from 'react';
import { Card, CardProps } from './Card';
import './List.css';

export interface ListProps {
  title: string;
  cards: CardProps[];
}

export function List(props: ListProps) {
  // inputValue is the current text in the "add card" input.
  // It starts empty and updates on every keystroke.
  const [inputValue, setInputValue] = useState('');

  // Count for the badge — derived from props, not state
  const cardCount = props.cards.length;

  return (
    <div className="column">
      <div className="column-header">
        <span className="column-title">{props.title}</span>
        {cardCount > 0 && (
          <span className="column-count">{cardCount}</span>
        )}
      </div>

      <div className="card-list">
        {props.cards.length > 0
          ? props.cards.map(card => (
              <Card
                key={card.title}
                title={card.title}
                description={card.description}
              />
            ))
          : <p className="empty-state">No cards yet</p>
        }
      </div>

      {/* Add card input area */}
      <div className="add-card-area">
        <input
          className="add-card-input"
          type="text"
          placeholder="+ Add a card..."
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
        />
      </div>
    </div>
  );
}
```

### SAVE AND TRY

Save. Look at the browser.

**You should see:** Each list now has a text input at the bottom with placeholder "+ Add a card...".

**Test controlled input behavior:** Click into one of the inputs and type. Each keystroke updates the input. Open React DevTools → Components panel → select the `List` component. Watch the `inputValue` state update in real time as you type. This is the controlled input cycle working.

**Test independence:** Type in one list's input. The other lists' inputs remain empty. Each `List` component has its own independent `inputValue` state.

---

## Step 2 — Style the input

Add styles to `List.css` for the add-card area:

```css
/* List.css — append these rules */

.add-card-area {
  margin-top: 4px;
}

.add-card-input {
  width: 100%;
  padding: 8px 10px;
  border: 2px solid transparent;
  border-radius: 8px;
  background-color: rgba(0, 0, 0, 0.05);
  font-size: 14px;
  color: #4a5568;
  outline: none;
  box-sizing: border-box;
  transition: border-color 0.15s, background-color 0.15s;
}

/* When the input is focused, show a blue border */
.add-card-input:focus {
  border-color: #4299e1;
  background-color: white;
}

/* Style the placeholder text */
.add-card-input::placeholder {
  color: #a0aec0;
}
```

### CSS AND SEE

Save. Look at the browser.

**You should see:**
- Inputs are full-width within each column
- Light grey background, no visible border
- On click/focus: blue border appears, background turns white
- Placeholder text is a lighter grey
- Clean, card-like appearance

---

## Step 3 — Handle Enter to add a card

Now wire up the Enter key. But there is a problem: where do the new cards go?

Cards are in `BOARD_DATA` in `App.tsx`. The `List` component receives cards as props — it cannot modify props. To add a card, `List` needs to communicate upward to whoever owns the data.

The pattern for this is a **callback prop** — the parent passes a function down to the child, and the child calls it when something happens.

Update `ListProps` to accept an `onAddCard` callback:

```tsx
// List.tsx — updated ListProps interface

export interface ListProps {
  title: string;
  cards: CardProps[];
  onAddCard: (title: string) => void;  // ← parent provides this function
}
```

Add the `handleKeyDown` function and connect it to the input:

```tsx
// List.tsx — inside the List function, after useState

function handleKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
  // Only act on Enter key
  if (event.key !== 'Enter') return;

  // Trim whitespace — don't add blank cards
  const trimmed = inputValue.trim();
  if (trimmed === '') return;

  // Tell the parent about the new card
  props.onAddCard(trimmed);

  // Clear the input
  setInputValue('');
}
```

Connect `handleKeyDown` to the input element:

```tsx
<input
  className="add-card-input"
  type="text"
  placeholder="+ Add a card..."
  value={inputValue}
  onChange={(e) => setInputValue(e.target.value)}
  onKeyDown={handleKeyDown}          // ← add this
/>
```

### SAVE AND TRY

Save. The TypeScript error: `Property 'onAddCard' is missing in type...`. This is TypeScript telling you `Board.tsx` is passing `ListProps` without `onAddCard`. Fix this in the next step.

This is TypeScript working correctly — it caught the incomplete wiring immediately.

---

## Step 4 — Wire `onAddCard` through `Board.tsx`

`Board.tsx` renders `List` components. It must now pass an `onAddCard` to each list.

But `Board` does not own the card data either — it receives `lists` as a prop from `App.tsx`. So `Board` also needs a callback prop to pass up to `App`.

Update `Board.tsx`:

```tsx
// Board.tsx

import { List } from './List';
import { CardProps } from './Card';
import './Board.css';

export interface ListData {
  id: string;
  title: string;
  cards: CardProps[];
}

export interface BoardProps {
  lists: ListData[];
  onAddCard: (listId: string, cardTitle: string) => void;  // ← new prop
}

export function Board(props: BoardProps) {
  return (
    <div className="board-area">
      {props.lists.map(list => (
        <List
          key={list.id}
          title={list.title}
          cards={list.cards}
          // For each list, create a handler that calls the board's onAddCard 
          // with the list's id and the new card's title.
          onAddCard={(cardTitle) => props.onAddCard(list.id, cardTitle)}
        />
      ))}
    </div>
  );
}
```

### SAVE AND TRY

Save. Now the error moves to `App.tsx`: `Property 'onAddCard' is missing`. TypeScript is walking up the chain. Fix it in Step 5.

---

## Step 5 — Manage card state in `App.tsx`

`App.tsx` is where the board data lives. This is where `useState` must manage the full board state, because adding a card changes the data.

Move `BOARD_DATA` from a constant into `useState`:

```tsx
// App.tsx — full file

import { useState } from 'react';
import { Board, ListData } from './components/Board';
import { CardProps } from './components/Card';
import './App.css';

// Initial data — used once to seed the state
const INITIAL_BOARD: ListData[] = [
  {
    id: 'list-todo',
    title: 'To Do',
    cards: [
      { title: 'Fix login button', description: 'Does not respond on mobile.' },
      { title: 'Update homepage hero', description: 'New design in Figma.' },
      { title: 'Write onboarding email', description: 'Three-step welcome sequence.' },
    ],
  },
  {
    id: 'list-in-progress',
    title: 'In Progress',
    cards: [
      { title: 'Design new dashboard', description: 'Working with design team.' },
      { title: 'Migrate database', description: 'SQLite to Postgres.' },
    ],
  },
  {
    id: 'list-done',
    title: 'Done',
    cards: [
      { title: 'Set up CI pipeline', description: 'GitHub Actions on every push.' },
    ],
  },
];

function App() {
  // boardLists is the source of truth for all lists and their cards.
  // useState is initialized with INITIAL_BOARD — this only runs once.
  const [boardLists, setBoardLists] = useState<ListData[]>(INITIAL_BOARD);

  // handleAddCard is called by Board when the user presses Enter in a list.
  // listId tells us WHICH list to add to. cardTitle is the new card's title.
  function handleAddCard(listId: string, cardTitle: string) {
    // Build the new card object
    const newCard: CardProps = {
      title: cardTitle,
      description: '',  // empty description for now — editing will come in a later lab
    };

    // Create a new array with the updated list — we must NOT mutate the existing array.
    // (Why? Explained in Lab 09 — for now, trust the pattern.)
    const updatedLists = boardLists.map(list => {
      if (list.id !== listId) return list;   // other lists unchanged
      return {
        ...list,                             // copy all list properties
        cards: [...list.cards, newCard],     // append the new card
      };
    });

    setBoardLists(updatedLists);
  }

  return (
    <div className="app-layout">
      <header className="app-header">
        <span className="app-name">FlowBoard</span>
      </header>
      <Board
        lists={boardLists}
        onAddCard={handleAddCard}
      />
    </div>
  );
}

export default App;
```

### SAVE AND TRY

Save. In the browser:

1. Click into any list's input field
2. Type a card title (e.g., "New task for testing")
3. Press Enter

**You should see:**
- The new card appears immediately in the list
- The card count badge increments
- The input clears
- Other lists are unaffected

**Test with multiple lists:** Add cards to different lists. Each list works independently. Add several cards — the count badge updates.

**Open React DevTools:** Components panel → click `App`. Watch the `boardLists` state — it contains the full array. When you add a card, the state updates and the component tree re-renders.

---

## 🎯 Challenge: Show a character count on the input

**You know:** `useState`, controlled inputs, `inputValue` string

**Task:** Below the input (or inside it as a trailing element), show a live character count. If the user has typed 0 characters, show nothing. If they have typed 1–49 characters, show the count in grey. If they hit 50 characters, prevent further input and show the count in red.

**Hints:** You can compute the count directly from `inputValue.length`. For limiting input, check `event.target.value.length` in `onChange` before calling `setInputValue`. For conditional styling, use a ternary or a state variable for the "over limit" flag.

---

<details>
<summary>▶ Show Solution</summary>

In `List.tsx`, update the `onChange` handler and add count display below the input:

```tsx
// List.tsx — updated add-card-area
<div className="add-card-area">
  <input
    className="add-card-input"
    type="text"
    placeholder="+ Add a card..."
    value={inputValue}
    onChange={(e) => {
      // Allow up to 50 characters only
      if (e.target.value.length <= 50) {
        setInputValue(e.target.value);
      }
    }}
    onKeyDown={handleKeyDown}
  />
  {inputValue.length > 0 && (
    <span
      className="add-card-count"
      style={{ color: inputValue.length >= 50 ? '#e53e3e' : '#a0aec0' }}
    >
      {inputValue.length}/50
    </span>
  )}
</div>
```

In `List.css`, add:
```css
.add-card-count {
  display: block;
  font-size: 11px;
  text-align: right;
  margin-top: 2px;
}
```

**Key insight:** The character count is derived from `inputValue` — it is not separate state. Any value that can be computed from existing state should be computed, not stored in additional state variables. Storing it separately would create the possibility of the count being out of sync with the input. Deriving it keeps them guaranteed in sync.

</details>

---

## Final Check

| Feature | How to Verify |
|---|---|
| Input appears at bottom of each list | Browser shows input in every column |
| Typing updates input (controlled) | Type — input shows what you type |
| Each list's input is independent | Type in one, others are unchanged |
| Enter adds card to correct list | Press Enter — card appears in that list |
| Input clears after Enter | After pressing Enter, input is empty |
| Blank Enter does nothing | Press Enter on empty input — no card added |
| Card count badge updates | Count increments after each add |
| State lives in App.tsx | React DevTools: App has `boardLists` state |
| No TypeScript errors | Problems panel clean |
| No console errors | Browser Console clean |

---

## Quick Check Answers

**1. What problem arises if input value and JavaScript variable are not synchronized?**

Desynchronization — the UI shows one value while your code works with another. Example: user types "Fix login" but your code reads an empty string. Or your code clears the variable (sets to `''`) but the input still shows "Fix login" because you did not update the input's value attribute. Controlled inputs prevent this: the input's `value` prop is always the state variable, so they are always the same value.

**2. What tells React to re-render when the user types?**

State — specifically the `useState` setter function. When `onChange` fires and you call `setInputValue(e.target.value)`, React schedules a re-render. The component function runs again. `useState` returns the new value. The `<input value={inputValue} />` renders with the updated value. Without state, there is nothing to trigger a re-render, and the input's `value` attribute would never update.

**3. What is an "uncontrolled input"?**

An input whose value React does not track via state. The browser manages the value natively. You access it using a `ref` — `inputRef.current.value` — which reads the DOM's current value on demand (e.g., on form submit). Uncontrolled inputs are simpler for basic forms but make real-time validation, conditional rendering based on input, and programmatic clearing more cumbersome. Controlled inputs are the standard React pattern for anything more than a simple "submit and forget" form.

---

## Next Lab

In **LAB-09**, you will understand *why* the `handleAddCard` function creates a new array instead of mutating the existing one. You will learn the rules of immutable state updates, why direct mutation causes bugs that are very hard to track down, and the spread operator patterns used to update nested data. You will also experience the bug that mutation causes — and fix it.
