# FlowBoard Masterclass — LAB 09 — Immutable State, Lifting State Up, and Deleting Cards

**Prerequisites:** LAB-08 — Adding cards via controlled input. You have `useState` in `App.tsx` holding all board data, and callback props passing `onAddCard` through `Board` to `List`.

**What this lab adds:**
- Why you must NOT mutate state directly — what goes wrong and why
- Immutable update patterns with the spread operator
- How to delete a card using the same callback prop pattern
- Pure update functions — state transformations extracted from components
- Lifting state up — which component should own which state

**Time:** 50–65 minutes

---

> **Quick Check — try to answer before reading further:**
>
> 1. What do you think would happen if you did `boardLists.push(newList)` instead of `setBoardLists([...boardLists, newList])`?
> 2. `{...list}` creates a shallow copy of an object. What does "shallow" mean here — what is NOT copied deeply?
> 3. You know that state lives in App.tsx. What do you think would happen if state lived in Board.tsx or List.tsx instead — what would change if you added a second board?
>
> *(Answers at the end of this lab)*

---

## What You Will Build

Each card will have a delete button (×). Clicking it removes the card from the list immediately. You will also see — deliberately — the mutation bug, so you understand exactly why the immutable pattern exists.

```
┌──────────────┐
│  TO DO    3  │
├──────────────┤
│ Fix login  × │  ← × button on hover
│ Update home× │
│ Write email× │
└──────────────┘
         ↕ click × on "Fix login" ↕
┌──────────────┐
│  TO DO    2  │
├──────────────┤
│ Update home× │
│ Write email× │
└──────────────┘
```

---

## Concept: Immutable State — Why You Must Not Mutate

**What it is:** In React, state must be replaced, never modified in place. Every state update should produce a new value — a new object, a new array — rather than changing the existing one.

**The problem — what mutation looks like:**

```tsx
// WRONG — mutates the existing array
function handleAddCard(listId: string, cardTitle: string) {
  const list = boardLists.find(l => l.id === listId);
  list.cards.push({ title: cardTitle, description: '' });  // ← mutates in place
  setBoardLists(boardLists);                               // ← same array reference!
}
```

**What goes wrong:**

React uses reference equality to decide whether to re-render. If you mutate the array and pass the same array reference to `setBoardLists`, React sees `boardLists === boardLists` — they are literally the same object. React concludes nothing changed and skips the re-render.

The card appears to not be added. Or it appears added sometimes but not others (timing-dependent). Or it works now but breaks in a future React version. Mutation bugs are subtle because the data is technically correct — React just doesn't know it changed.

**You will see the bug now:**

Deliberately break the add-card handler in `App.tsx` to use mutation:

```tsx
// DELIBERATELY BROKEN — for learning only
function handleAddCard(listId: string, cardTitle: string) {
  const targetList = boardLists.find(l => l.id === listId)!;
  targetList.cards.push({ title: cardTitle, description: '' });  // mutate
  setBoardLists(boardLists);  // same reference
}
```

### SAVE AND TRY (the broken version)

Save. In the browser, type a card title and press Enter.

**You should see:** The card does NOT appear. The input clears (that works — it is separate state), but the board does not update.

**To confirm the data changed:** Open React DevTools → Components → click `App` → look at `boardLists`. The card IS there in the state. But React did not re-render because the array reference did not change.

This is the mutation bug. Now fix it by restoring the correct pattern.

---

## Concept: The Spread Operator for Immutable Updates

**What it is:** The `...` spread operator creates a shallow copy of an array or object. Combined with `Array.map()`, it enables the "replace the changed piece, keep everything else" update pattern.

**For arrays — add to end:**

```tsx
// Create a new array with all existing items plus one more
const newArray = [...existingArray, newItem];
```

**For arrays — remove an item:**

```tsx
// Create a new array excluding the item with id === targetId
const newArray = existingArray.filter(item => item.id !== targetId);
```

**For objects — update one property:**

```tsx
// Create a new object with all existing properties, with one changed
const newObject = { ...existingObject, title: 'New Title' };
```

**For nested data — update a nested item:**

The board state is nested: `boardLists → list → cards`. To update a card, you must create new objects at every level from the changed item up to the root:

```tsx
const updatedLists = boardLists.map(list => {
  if (list.id !== targetListId) return list;  // ← unchanged lists: same reference
  return {
    ...list,                                   // ← new list object
    cards: list.cards.filter(card => card.title !== cardTitle)  // ← new cards array
  };
});
```

**"Shallow copy" means:** The spread operator only copies one level deep. `{ ...list }` creates a new object with the same property values — but if a property's value is itself an object or array, the copy and the original both point to the same inner object. That's why we must also spread/replace the nested `cards` array when we change it.

**You will see this again in:** Every state update in React. Form updates (`{ ...formData, email: newEmail }`), list reorders, removing items, updating nested records. The spread + map + filter combination covers 90% of React state update cases.

---

## Concept: Lifting State Up

**What it is:** Moving state to the lowest common ancestor that needs to access it. When two or more components need to share or coordinate on the same data, that data's state belongs in their shared parent.

**The rule:**

> State should live in the component that needs it. If multiple components need it, it lives in their nearest shared parent.

**The current architecture:**

```
App.tsx
  └── boardLists: ListData[]    ← state lives here
      └── Board.tsx             ← receives lists as props, passes onAddCard up
          └── List.tsx          ← receives cards as props, calls onAddCard
```

The board data lives in `App` because `App` is the nearest shared ancestor of all lists. If card state lived in `List.tsx`, you could not implement drag-and-drop between lists (Lab 12) — each list would have its own isolated card state with no shared parent to coordinate the move.

**When to lift vs when to keep local:**

- `inputValue` (the add-card text field) stays in `List.tsx` — only one component needs it
- `boardLists` (all list and card data) lives in `App.tsx` — every list needs access, and cross-list operations require a shared owner
- `isExpanded` for an accordion card would stay in that card component — no parent needs to know

The question to ask: "Does any other component need this value?" If no → keep it local. If yes → lift it to the nearest shared ancestor.

**You will see this again in:** Form validation state (does the form parent or each field own validation errors?), modal open/close state (does the trigger or a parent own it?), filter state (does the filter bar or the page that shows filtered results own it?).

---

## Step 1 — Restore the correct `handleAddCard`

If you implemented the deliberately broken version, restore the correct one in `App.tsx`:

```tsx
function handleAddCard(listId: string, cardTitle: string) {
  const newCard: CardProps = {
    title: cardTitle,
    description: '',
  };

  const updatedLists = boardLists.map(list => {
    if (list.id !== listId) return list;
    return {
      ...list,
      cards: [...list.cards, newCard],
    };
  });

  setBoardLists(updatedLists);
}
```

### SAVE AND TRY

Save. Confirm add-card works again.

---

## Step 2 — Add a card ID field

To delete a card by reference, we need a stable unique identifier per card. Right now cards only have `title` and `description`. Add an `id` field.

Update `Card.tsx`'s `CardProps` interface:

```tsx
// Card.tsx — updated interface

export interface CardProps {
  id: string;          // ← new: stable unique identifier
  title: string;
  description: string;
}
```

Update the initial data in `App.tsx` to include IDs:

```tsx
const INITIAL_BOARD: ListData[] = [
  {
    id: 'list-todo',
    title: 'To Do',
    cards: [
      { id: 'card-1', title: 'Fix login button', description: 'Does not respond on mobile.' },
      { id: 'card-2', title: 'Update homepage hero', description: 'New design in Figma.' },
      { id: 'card-3', title: 'Write onboarding email', description: 'Three-step welcome sequence.' },
    ],
  },
  {
    id: 'list-in-progress',
    title: 'In Progress',
    cards: [
      { id: 'card-4', title: 'Design new dashboard', description: 'Working with design team.' },
      { id: 'card-5', title: 'Migrate database', description: 'SQLite to Postgres.' },
    ],
  },
  {
    id: 'list-done',
    title: 'Done',
    cards: [
      { id: 'card-6', title: 'Set up CI pipeline', description: 'GitHub Actions on every push.' },
    ],
  },
];
```

Update `handleAddCard` to generate a unique ID for each new card:

```tsx
function handleAddCard(listId: string, cardTitle: string) {
  const newCard: CardProps = {
    // Date.now() gives a millisecond timestamp — unique enough for local state.
    // In Lab 10 we'll use a proper ID generation strategy.
    id: `card-${Date.now()}`,
    title: cardTitle,
    description: '',
  };

  const updatedLists = boardLists.map(list => {
    if (list.id !== listId) return list;
    return {
      ...list,
      cards: [...list.cards, newCard],
    };
  });

  setBoardLists(updatedLists);
}
```

Update the `key` prop in `List.tsx` to use `card.id` instead of `card.title`:

```tsx
// List.tsx — in the cards.map()
<Card
  key={card.id}          // ← use id, not title
  id={card.id}
  title={card.title}
  description={card.description}
/>
```

### SAVE AND TRY

Save. TypeScript errors appear because `Card` now expects an `id` prop. The map in `List.tsx` passes `id={card.id}` — that fixes it. Verify no errors remain in the Problems panel.

---

## Step 3 — Add the delete callback prop to `Card`

The delete button lives on the `Card` component. When clicked, it calls a callback to notify the parent. Add `onDelete` to `CardProps`:

```tsx
// Card.tsx — full updated file

import './Card.css';

export interface CardProps {
  id: string;
  title: string;
  description: string;
  onDelete?: (id: string) => void;  // optional — cards without delete still work
}

export function Card(props: CardProps) {
  return (
    <div className="card">
      <div className="card-header">
        <h3 className="card-title">{props.title}</h3>
        {/* Only render the delete button if onDelete was provided */}
        {props.onDelete && (
          <button
            className="card-delete-btn"
            onClick={() => props.onDelete!(props.id)}
            aria-label={`Delete card: ${props.title}`}
          >
            ×
          </button>
        )}
      </div>
      {props.description && (
        <p className="card-description">{props.description}</p>
      )}
    </div>
  );
}
```

Two patterns here:
1. `onDelete?` — the `?` makes it optional. Cards rendered without an `onDelete` prop will not show the button.
2. `aria-label` — accessible label for screen readers. The × character alone is not descriptive.

---

## Step 4 — Style the delete button

In `Card.css`, update `.card` to use flex (for positioning the delete button), and add `.card-delete-btn`:

```css
/* Card.css — updates */

.card {
  background-color: white;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  padding: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
}

/* card-header holds title + delete button side by side */
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 8px;
}

.card-title {
  font-size: 14px;
  font-weight: 600;
  color: #2d3748;
  margin: 0;
  flex: 1;           /* takes remaining width after delete button */
}

.card-description {
  font-size: 13px;
  color: #718096;
  margin: 6px 0 0 0;
  line-height: 1.5;
}

/* Delete button — hidden by default, visible on card hover */
.card-delete-btn {
  background: none;
  border: none;
  cursor: pointer;
  color: #a0aec0;
  font-size: 18px;
  line-height: 1;
  padding: 0 2px;
  border-radius: 4px;
  opacity: 0;
  transition: opacity 0.15s, color 0.15s;
  flex-shrink: 0;
}

/* Show delete button when hovering the card */
.card:hover .card-delete-btn {
  opacity: 1;
}

/* Turn red when hovering the button itself */
.card-delete-btn:hover {
  color: #e53e3e;
}
```

### CSS AND SEE

Save. Hover over a card. The × button fades in on the right side of the card title.

---

## Step 5 — Wire the delete callback through the chain

**In `List.tsx`:** Add `onDeleteCard` to `ListProps` and pass it to each `Card`:

```tsx
// List.tsx — updated ListProps and card rendering

export interface ListProps {
  title: string;
  cards: CardProps[];
  onAddCard: (title: string) => void;
  onDeleteCard: (cardId: string) => void;   // ← new prop
}

// Inside the List function's cards.map():
{props.cards.map(card => (
  <Card
    key={card.id}
    id={card.id}
    title={card.title}
    description={card.description}
    onDelete={props.onDeleteCard}             // ← pass down
  />
))}
```

**In `Board.tsx`:** Add `onDeleteCard` to `BoardProps` and pass it through:

```tsx
// Board.tsx — updated BoardProps

export interface BoardProps {
  lists: ListData[];
  onAddCard: (listId: string, cardTitle: string) => void;
  onDeleteCard: (listId: string, cardId: string) => void;  // ← new prop
}

// Inside the lists.map():
<List
  key={list.id}
  title={list.title}
  cards={list.cards}
  onAddCard={(cardTitle) => props.onAddCard(list.id, cardTitle)}
  onDeleteCard={(cardId) => props.onDeleteCard(list.id, cardId)}  // ← pass through
/>
```

**In `App.tsx`:** Add the `handleDeleteCard` function and pass it to `Board`:

```tsx
// App.tsx — add this function inside App()

function handleDeleteCard(listId: string, cardId: string) {
  const updatedLists = boardLists.map(list => {
    if (list.id !== listId) return list;
    return {
      ...list,
      cards: list.cards.filter(card => card.id !== cardId),  // remove the card
    };
  });

  setBoardLists(updatedLists);
}

// In the JSX:
<Board
  lists={boardLists}
  onAddCard={handleAddCard}
  onDeleteCard={handleDeleteCard}   // ← pass to Board
/>
```

### SAVE AND TRY

Save. In the browser:

1. Hover over a card — the × button appears
2. Click the × button — the card disappears immediately
3. The card count badge in the list header decrements
4. Add a card, then delete it — both operations work correctly
5. No console errors

---

## Step 6 — Extract pure update functions

`handleAddCard` and `handleDeleteCard` are state transformation functions — pure logic that takes the current state and returns a new state. This kind of logic is easy to test and reason about if it does not live inside the component. Extract them to `src/utils/boardUtils.ts`.

Create `src/utils/boardUtils.ts`:

```ts
// boardUtils.ts
// Pure functions for board state updates.
// These take data in, return new data out — no React, no side effects.

import { ListData } from '../components/Board';
import { CardProps } from '../components/Card';

export function addCardToList(
  lists: ListData[],
  listId: string,
  newCard: CardProps
): ListData[] {
  return lists.map(list => {
    if (list.id !== listId) return list;
    return { ...list, cards: [...list.cards, newCard] };
  });
}

export function deleteCardFromList(
  lists: ListData[],
  listId: string,
  cardId: string
): ListData[] {
  return lists.map(list => {
    if (list.id !== listId) return list;
    return { ...list, cards: list.cards.filter(card => card.id !== cardId) };
  });
}
```

Update `App.tsx` to use these functions:

```tsx
import { addCardToList, deleteCardFromList } from './utils/boardUtils';

// (in App function)
function handleAddCard(listId: string, cardTitle: string) {
  const newCard: CardProps = {
    id: `card-${Date.now()}`,
    title: cardTitle,
    description: '',
  };
  setBoardLists(prev => addCardToList(prev, listId, newCard));
}

function handleDeleteCard(listId: string, cardId: string) {
  setBoardLists(prev => deleteCardFromList(prev, listId, cardId));
}
```

Note: `setBoardLists(prev => ...)` uses the **functional update form** of `setState`. Instead of passing the new value directly, you pass a function that receives the current state and returns the new state. This is safer when the new state depends on the previous state — it ensures you are always working with the latest state, not a stale closure.

### SAVE AND TRY

Save. Verify add and delete still work. The behavior is identical — you have only improved the code structure.

---

## 🎯 Challenge: Add an "undo last delete" feature

**You know:** `useState`, callback props, the callback-prop wiring pattern

**Task:** Add an "Undo" button to the app header that re-adds the last deleted card to the list it was deleted from. The button should only appear after a card has been deleted. Clicking it once should restore the card and hide the button.

**Hints:**
- You need to remember what was deleted and which list it belonged to. What type would you use to store that?
- A tuple `{ card: CardProps, listId: string } | null` could represent "a deleted card or nothing."
- `addCardToList` already does what you need for the restore operation.

---

<details>
<summary>▶ Show Solution</summary>

In `App.tsx`:

```tsx
// Add state to remember the last deleted card
const [lastDeleted, setLastDeleted] = useState<{ card: CardProps; listId: string } | null>(null);

// Update handleDeleteCard to save the deleted card
function handleDeleteCard(listId: string, cardId: string) {
  // Find the card before deleting it
  const list = boardLists.find(l => l.id === listId);
  const deletedCard = list?.cards.find(c => c.id === cardId);
  if (deletedCard) {
    setLastDeleted({ card: deletedCard, listId });
  }

  setBoardLists(prev => deleteCardFromList(prev, listId, cardId));
}

// Add an undo handler
function handleUndo() {
  if (!lastDeleted) return;
  setBoardLists(prev => addCardToList(prev, lastDeleted.listId, lastDeleted.card));
  setLastDeleted(null);
}

// In JSX, add to the header:
{lastDeleted && (
  <button onClick={handleUndo} className="undo-btn">
    ↩ Undo
  </button>
)}
```

**Key insight:** The "undo" feature requires memory of what changed — a second piece of state that stores the "last deleted" record. This is the **command pattern** at its simplest: remember the inverse of every action. For a full multi-level undo, you'd store a stack of past states (an array). This is how text editors, design tools, and games implement undo — the principle scales from this simple version all the way up.

</details>

---

## Final Check

| Feature | How to Verify |
|---|---|
| `Card.tsx` has `id` prop and `onDelete?` callback | Read the interface |
| × button appears on card hover | Hover over a card |
| × button turns red when hovered directly | Hover the × specifically |
| Clicking × removes the card | Click × — card disappears |
| Card count badge decrements on delete | Count goes from 3 to 2 |
| Adding and deleting both work together | Add a card, then delete it |
| `boardUtils.ts` exists in `src/utils/` | VS Code Explorer |
| `addCardToList` and `deleteCardFromList` are pure functions | They take state in, return new state out |
| Functional `setBoardLists(prev => ...)` form used | Check App.tsx |
| No TypeScript errors | Problems panel clean |
| No console errors | Browser Console clean |

---

## Quick Check Answers

**1. What happens if you do `boardLists.push(newList)` instead of `setBoardLists([...boardLists, newList])`?**

The push mutates the `boardLists` array in place. Then `setBoardLists(boardLists)` is called with the same array reference. React compares the previous reference to the new reference — they are identical. React concludes the state did not change and does not schedule a re-render. The new list is in the data but the UI does not update. The bug is that the mutation did work — the data changed — but React never knew to re-render.

**2. What does "shallow copy" mean for `{ ...list }`?**

It means only the top level is copied. The new object has new references for the object itself (new identity), but for nested values like `cards: CardProps[]`, the new object's `cards` property still points to the same array in memory as the original. If you then mutate that inner array (e.g., `newList.cards.push(...)`), you are mutating the original list's cards too. That is why we must also replace the nested array: `{ ...list, cards: [...list.cards, newCard] }` — a new outer object AND a new inner array.

**3. What would change if board state lived in `Board.tsx` or `List.tsx`?**

If it lived in `Board.tsx`, a second `<Board />` component (a second project board) would have no way to share data with the first — they would be isolated. Cross-board operations would be impossible. If it lived in `List.tsx`, each list's cards would be independently owned. Drag-and-drop between lists (Lab 12) would require List A to somehow tell List B to gain a card — but siblings cannot communicate directly; they must go through a shared parent. State that is shared or coordinated across components always belongs in their nearest common ancestor.

---

## Next Lab

In **LAB-10**, you will formalize the data model for the whole app — boards, lists, and cards — as a set of nested TypeScript interfaces. You will understand the difference between `type` and `interface`, why `id` fields are essential, and how a single well-designed data model makes every future feature easier to implement.
