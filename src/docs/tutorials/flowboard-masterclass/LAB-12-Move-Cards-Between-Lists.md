# FlowBoard Masterclass — LAB 12 — Moving Cards Between Lists

**Prerequisites:** LAB-11 — Multiple boards with sidebar. The full board data model with nested `Board → List → Card` types. `boardUtils.ts` with pure update functions.

**What this lab adds:**
- Atomic multi-list state updates — remove from one list, add to another, in a single update
- Move card buttons (← →) as a simpler alternative to drag-and-drop
- ID-based lookup in nested structures
- Extending `boardUtils.ts` with a `moveCard` function
- Preview of drag-and-drop (Labs 25–26) — the data layer is done here

**Time:** 50–65 minutes

---

> **Quick Check — try to answer before reading further:**
>
> 1. Moving a card requires two changes: remove from list A, add to list B. Could these be two separate `setBoards` calls? What might go wrong?
> 2. The `moveCard` function needs to know the source list, the destination list, and the card itself. How does the ID-based model make this easier than anything else?
> 3. What should happen if the user tries to move a card to the same list it is already in? (Should it be an error? A no-op? Something else?)
>
> *(Answers at the end of this lab)*

---

## What You Will Build

Each card will have left/right arrow buttons. Clicking → moves the card to the next list. Clicking ← moves it to the previous list. Arrows are disabled when the card is already at the first or last list.

```
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│  TO DO    2  │  │ IN PROGRESS 1│  │   DONE    0  │
├──────────────┤  ├──────────────┤  ├──────────────┤
│ Fix login  → │  │ Dashboard ←→ │  │              │
│ Update home→ │  │              │  │  (empty)     │
└──────────────┘  └──────────────┘  └──────────────┘
        ↕ click → on "Fix login" ↕
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│  TO DO    1  │  │ IN PROGRESS 2│  │   DONE    0  │
├──────────────┤  ├──────────────┤  ├──────────────┤
│ Update home→ │  │ Fix login  ←→│  │              │
│              │  │ Dashboard ←→ │  │              │
└──────────────┘  └──────────────┘  └──────────────┘
```

---

## Concept: Atomic Multi-List Updates

**What it is:** Making two related changes to state in a single update call, so the UI never sees an intermediate inconsistent state.

**The problem with two separate calls:**

```tsx
// WRONG — two separate calls
function handleMoveCard(cardId, fromListId, toListId) {
  // First call: card is removed from fromList
  setBoards(prev => removeCard(prev, fromListId, cardId));
  
  // Between these two calls, React might render — card is gone from both lists!
  
  // Second call: card is added to toList
  setBoards(prev => addCard(prev, toListId, card));
}
```

React batches state updates in event handlers in React 18, so in practice these two `setBoards` calls would be batched into one render. But relying on batching behavior is fragile — it can fail in async contexts. More importantly, it is conceptually wrong: moving a card is one operation, not two.

**The atomic pattern — one update, two changes:**

```tsx
function moveCard(lists: List[], cardId: string, fromListId: string, toListId: string): List[] {
  // Find the card to move
  const fromList = lists.find(l => l.id === fromListId);
  const card = fromList?.cards.find(c => c.id === cardId);
  if (!card) return lists;  // card not found — no change

  // In one map pass, remove from source and add to destination
  return lists.map(list => {
    if (list.id === fromListId) {
      return { ...list, cards: list.cards.filter(c => c.id !== cardId) };
    }
    if (list.id === toListId) {
      return { ...list, cards: [...list.cards, card] };
    }
    return list;  // other lists unchanged
  });
}
```

One function call, one state update, one render. The card is never "missing" from both lists simultaneously.

**You will see this again in:** Bank transfer (debit one account, credit another), inventory reallocation, any operation that must be all-or-nothing. In database terms, this is a transaction. In React, a single `setState` call is the equivalent — the UI only ever sees the before-state or the after-state.

---

## Step 1 — Add `moveCard` to `boardUtils.ts`

```ts
// boardUtils.ts — add this function

export function moveCard(
  lists: List[],
  cardId: string,
  fromListId: string,
  toListId: string
): List[] {
  // Same-list move is a no-op
  if (fromListId === toListId) return lists;

  // Find the card before we modify anything
  const fromList = lists.find(l => l.id === fromListId);
  const card = fromList?.cards.find(c => c.id === cardId);
  
  // If the card doesn't exist, return unchanged state
  if (!card) return lists;

  // Build the new lists array in a single map pass:
  // - Source list: remove the card
  // - Destination list: append the card
  // - All other lists: unchanged
  return lists.map(list => {
    if (list.id === fromListId) {
      return { ...list, cards: list.cards.filter(c => c.id !== cardId) };
    }
    if (list.id === toListId) {
      return { ...list, cards: [...list.cards, card] };
    }
    return list;
  });
}
```

### SAVE AND TRY

Save. No visible change yet — function exists but nothing calls it.

---

## Step 2 — Add move callbacks to the component props chain

**In `Board.tsx`**, add `onMoveCard` to `BoardProps`:

```tsx
// Board.tsx — updated BoardProps

export interface BoardProps extends Board {
  onAddCard: (listId: string, cardTitle: string) => void;
  onDeleteCard: (listId: string, cardId: string) => void;
  onMoveCard: (cardId: string, fromListId: string, toListId: string) => void;  // ← new
}
```

**In `List.tsx`**, add `onMoveCardLeft` and `onMoveCardRight` to `ListProps`:

```tsx
// List.tsx — updated ListProps

export interface ListProps extends List {
  onAddCard: (title: string) => void;
  onDeleteCard: (cardId: string) => void;
  onMoveCardLeft?: (cardId: string) => void;   // optional — first list has no ←
  onMoveCardRight?: (cardId: string) => void;  // optional — last list has no →
}
```

Using optional `?` here is intentional: the first list has no "move left" option, the last list has no "move right" option. Passing `undefined` for a direction is how we signal "this direction is disabled."

**In `Card.tsx`**, add move callbacks to `CardProps`:

```tsx
// Card.tsx — updated CardProps

export interface CardProps extends Card {
  onDelete?: (id: string) => void;
  onMoveLeft?: (id: string) => void;    // ← new
  onMoveRight?: (id: string) => void;   // ← new
}
```

---

## Step 3 — Update `Card.tsx` to show move buttons

```tsx
// Card.tsx — updated JSX

export function Card(props: CardProps) {
  return (
    <div className="card">
      <div className="card-header">
        <h3 className="card-title">{props.title}</h3>
        <div className="card-actions">
          {/* Left arrow — only rendered if onMoveLeft was provided */}
          {props.onMoveLeft && (
            <button
              className="card-action-btn"
              onClick={() => props.onMoveLeft!(props.id)}
              aria-label={`Move card left: ${props.title}`}
            >
              ←
            </button>
          )}
          {/* Right arrow — only rendered if onMoveRight was provided */}
          {props.onMoveRight && (
            <button
              className="card-action-btn"
              onClick={() => props.onMoveRight!(props.id)}
              aria-label={`Move card right: ${props.title}`}
            >
              →
            </button>
          )}
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
      </div>
      {props.description && (
        <p className="card-description">{props.description}</p>
      )}
    </div>
  );
}
```

Update `.card-header` in `Card.css` — rename `.card-header` to hold a `.card-actions` group:

```css
/* Card.css — update */

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
  flex: 1;
}

/* .card-actions holds the arrow and delete buttons */
.card-actions {
  display: flex;
  align-items: center;
  gap: 2px;
  opacity: 0;
  transition: opacity 0.15s;
  flex-shrink: 0;
}

.card:hover .card-actions {
  opacity: 1;
}

.card-action-btn,
.card-delete-btn {
  background: none;
  border: none;
  cursor: pointer;
  color: #a0aec0;
  font-size: 14px;
  line-height: 1;
  padding: 2px 4px;
  border-radius: 4px;
  transition: color 0.1s, background-color 0.1s;
}

.card-action-btn:hover {
  color: #4299e1;
  background-color: #ebf8ff;
}

.card-delete-btn:hover {
  color: #e53e3e;
  background-color: #fff5f5;
}
```

---

## Step 4 — Wire move through `List.tsx` to `Card`

In `List.tsx`, pass `onMoveLeft` and `onMoveRight` to each `Card`:

```tsx
// List.tsx — inside the cards.map()

{props.cards.map(card => (
  <Card
    key={card.id}
    id={card.id}
    title={card.title}
    description={card.description}
    onDelete={props.onDeleteCard}
    onMoveLeft={props.onMoveCardLeft}    // ← pass through (may be undefined)
    onMoveRight={props.onMoveCardRight}  // ← pass through (may be undefined)
  />
))}
```

---

## Step 5 — Wire move through `Board.tsx`

`Board` knows the list indices — it can determine which lists are adjacent to each list. It passes the correct callbacks down to each list:

```tsx
// Board.tsx — updated lists.map()

export function Board(props: BoardProps) {
  return (
    <div className="board-area">
      {props.lists.map((list, index) => (
        <List
          key={list.id}
          id={list.id}
          title={list.title}
          cards={list.cards}
          onAddCard={(cardTitle) => props.onAddCard(list.id, cardTitle)}
          onDeleteCard={(cardId) => props.onDeleteCard(list.id, cardId)}
          // onMoveCardLeft is undefined for the first list (index === 0)
          onMoveCardLeft={
            index > 0
              ? (cardId) => props.onMoveCard(cardId, list.id, props.lists[index - 1].id)
              : undefined
          }
          // onMoveCardRight is undefined for the last list
          onMoveCardRight={
            index < props.lists.length - 1
              ? (cardId) => props.onMoveCard(cardId, list.id, props.lists[index + 1].id)
              : undefined
          }
        />
      ))}
    </div>
  );
}
```

---

## Step 6 — Add `handleMoveCard` to `App.tsx`

```tsx
// App.tsx — add this handler

function handleMoveCard(cardId: string, fromListId: string, toListId: string) {
  setBoards(prev => prev.map(board => {
    if (board.id !== selectedBoardId) return board;
    return { ...board, lists: moveCard(board.lists, cardId, fromListId, toListId) };
  }));
}

// Add moveCard to imports from boardUtils
import { addCardToList, deleteCardFromList, moveCard } from './utils/boardUtils';

// Pass to BoardComponent:
<BoardComponent
  id={activeBoard.id}
  title={activeBoard.title}
  lists={activeBoard.lists}
  onAddCard={handleAddCard}
  onDeleteCard={handleDeleteCard}
  onMoveCard={handleMoveCard}           // ← new
/>
```

### SAVE AND TRY

Save. Fix any TypeScript errors (the Problems panel will guide you).

In the browser:
1. Hover over a card in the "To Do" list — you should see a → button and a × button
2. Click → — the card moves to "In Progress"
3. Hover over the moved card — it now shows ← → (can go either direction)
4. Click ← — the card moves back to "To Do"
5. Cards in the last list show only ← (no →)
6. Cards in the first list show only → (no ←)

---

## 🎯 Challenge: Move card to a specific list by name

**You know:** The `moveCard` utility, callback props, Board's knowledge of list indices

**Task:** Add a small dropdown (a `<select>` element) on each card that shows all other list names. Selecting a list name from the dropdown immediately moves the card to that list. The dropdown should not show the card's current list (it cannot move to itself).

**Hints:**
- `Board` knows all lists and each list's ID — it can compute the "other lists" for each card
- Pass a new callback: `onMoveTo: (cardId: string, targetListId: string) => void`
- In `Card.tsx`, render a `<select>` with options for each other list
- A `<select>` with `onChange` that immediately calls `onMoveTo` on every change works well here
- `onChange` on a select: `(e: React.ChangeEvent<HTMLSelectElement>) => { onMoveTo(props.id, e.target.value); }`

---

<details>
<summary>▶ Show Solution</summary>

Update `CardProps` in `Card.tsx`:
```tsx
export interface CardProps extends Card {
  onDelete?: (id: string) => void;
  onMoveLeft?: (id: string) => void;
  onMoveRight?: (id: string) => void;
  moveOptions?: Array<{ id: string; title: string }>;   // other lists
  onMoveTo?: (cardId: string, targetListId: string) => void;
}
```

In `Card.tsx` JSX, add inside `.card-actions`:
```tsx
{props.moveOptions && props.moveOptions.length > 0 && props.onMoveTo && (
  <select
    className="card-move-select"
    value=""
    onChange={(e) => props.onMoveTo!(props.id, e.target.value)}
    aria-label="Move to list"
  >
    <option value="" disabled>Move to...</option>
    {props.moveOptions.map(opt => (
      <option key={opt.id} value={opt.id}>{opt.title}</option>
    ))}
  </select>
)}
```

In `Board.tsx` lists.map, add to each `List`:
```tsx
// Pass other lists as move options to each List, then through to Card
otherLists={props.lists.filter(l => l.id !== list.id)}
onMoveTo={(cardId, targetId) => props.onMoveCard(cardId, list.id, targetId)}
```

**Key insight:** `<select>` with `value=""` and `onChange` that immediately fires is a "fire once and reset" pattern — the user picks an option, the action fires, the select resets to the placeholder. This is cleaner than a controlled select that shows the "current state" for actions that are commands rather than settings.

</details>

---

## Final Check

| Feature | How to Verify |
|---|---|
| `moveCard` function exists in `boardUtils.ts` | Check the file |
| → button appears on cards not in the last list | Hover card in "To Do" — see → |
| ← button appears on cards not in the first list | Hover card in "In Progress" — see ← |
| First list's cards have no ← | "To Do" cards only show → |
| Last list's cards have no → | "Done" cards only show ← |
| Clicking → moves card to the next list | Card disappears from current list, appears in next |
| Clicking ← moves card to the previous list | Reverse of above |
| Card count badges update correctly | Count decrements on source, increments on destination |
| Move is atomic — card never missing from both lists | Visual inspection during the move |
| `boardUtils.ts` imports use `List` from types.ts | Check imports in the file |
| No TypeScript errors | Problems panel clean |
| No console errors | Browser Console clean |

---

## Quick Check Answers

**1. Could two separate `setBoards` calls work? What might go wrong?**

In React 18, two `setBoards` calls inside the same event handler are batched into one render, so the user would not see an intermediate state. But it is conceptually fragile: (a) in async code (inside `setTimeout`, `Promise.then`, `async` functions) React does NOT batch, so two calls would cause two renders — one with the card missing from both lists; (b) it is semantically wrong — a move is one operation, not two; (c) if the first call succeeds and the second fails (in an API context), the card is lost. The atomic pattern is always correct.

**2. How does the ID-based model make this easier?**

Without IDs, you would need to use array indices (`fromIndex`, `toIndex`, `cardIndex`) which are fragile (see Lab 11's discussion of index-based selection). With IDs, the function signature is clear and stable: `moveCard(lists, cardId, fromListId, toListId)`. You look up the card by ID, remove by ID, add by ID. Order changes do not invalidate references. The logic reads like the domain: "move this card from this list to this list" — not "move the item at position 2 from array at position 1 to array at position 3."

**3. What should happen if the user tries to move a card to the same list?**

A no-op — return the lists unchanged. There is no error, because the outcome is already correct: the card is in the list. The `if (fromListId === toListId) return lists` guard at the top of `moveCard` handles this. Treating it as an error would require error-handling UI that is unnecessary for an impossible-to-cause-by-accident operation (the UI never shows a "move to current list" option).

---

## Next Lab

In **LAB-13**, you will make the board data survive page refreshes. Right now every reload resets to the initial data. You will use `localStorage` to persist the state, `useEffect` to synchronize state with storage, and learn about the serialization round-trip — what happens when objects are converted to JSON and back.
