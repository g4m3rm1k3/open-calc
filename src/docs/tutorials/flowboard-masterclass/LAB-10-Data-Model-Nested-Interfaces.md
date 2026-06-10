# FlowBoard Masterclass — LAB 10 — The Data Model: Nested Interfaces and a Single Source of Truth

**Prerequisites:** LAB-09 — Delete cards. `boardUtils.ts` exists with pure update functions. `CardProps` has an `id` field.

**What this lab adds:**
- Nested TypeScript interfaces — modelling a board → list → card hierarchy
- `type` vs `interface` — what they are and when to choose each
- A single typed `Board` object as the sole source of truth
- ID fields as the foundation for all future operations
- Separating types into a dedicated `types.ts` file

**Time:** 45–60 minutes

---

> **Quick Check — try to answer before reading further:**
>
> 1. Right now `CardProps` is named with "Props" because it started as a component props interface. But it also serves as the data model for a card. What tension might arise from this dual role?
> 2. `type` and `interface` are both TypeScript keywords for defining shapes. What do you think the difference might be between them?
> 3. The board data currently is `ListData[]` — an array of lists. What would you need to add to support *multiple* boards?
>
> *(Answers at the end of this lab)*

---

## What You Will Build

No visible UI change in this lab. The outcome is a cleaner, more extensible codebase: typed data model in one file, components separated from data shapes, and a `Board` type that the entire app uses consistently.

This is a **refactor lab** — you improve the foundation without changing behavior. The test: everything works exactly the same before and after, but the code is better structured for what comes next.

---

## Concept: The Difference Between `type` and `interface`

**What it is:** TypeScript has two ways to define object shapes: `interface` and `type`. Both can describe objects. They differ in what else they can do and how they behave in edge cases.

**`interface` — for describing object shapes:**

```ts
interface Card {
  id: string;
  title: string;
  description: string;
}
```

- Can be extended with `extends` (inheritance-like composition)
- Can be merged by declaration: two `interface Card {}` in the same file merge into one (called "declaration merging")
- Slightly better error messages in TypeScript
- Convention: use `interface` for object shapes that represent "a thing"

**`type` — for everything else:**

```ts
// Type aliases — name an existing type
type CardId = string;

// Union types — one of several shapes
type Priority = 'low' | 'medium' | 'high';

// Intersection types — combine two shapes
type CardWithMeta = Card & { createdAt: Date };

// Computed/complex types
type CardMap = Record<string, Card>;
```

- Can express unions, intersections, tuples, conditionals — things `interface` cannot
- Cannot be "declaration merged" — re-declaring a `type` is an error
- Preferred for anything that is NOT a plain object shape: unions, aliases, utility types

**The practical rule for this project:**

- Use `interface` for component props and data model shapes (`Card`, `List`, `Board`)
- Use `type` for union types (`Priority`, `Status`), aliases, and complex computed types

**You will see this again in:** Every TypeScript file. The `interface` vs `type` choice is a matter of convention in most codebases. Some teams use `interface` everywhere; some use `type` everywhere. The FlowBoard convention: `interface` for object shapes, `type` for everything else.

---

## Concept: Nested TypeScript Interfaces

**What it is:** Interfaces that reference other interfaces, forming a hierarchy that matches the data structure.

**The current problem:**

`CardProps`, `ListData`, and `BoardProps` are scattered — defined in component files, with names like "Props" that conflate UI concerns with data model concerns.

**The goal — a clean domain model in `types.ts`:**

```ts
// types.ts — the full data model

interface Card {
  id: string;
  title: string;
  description: string;
}

interface List {
  id: string;
  title: string;
  cards: Card[];    // ← List contains an array of Cards
}

interface Board {
  id: string;
  title: string;
  lists: List[];    // ← Board contains an array of Lists
}
```

Three levels of nesting. The hierarchy mirrors reality: a board has lists; each list has cards.

**Why IDs at every level:**

Every entity needs a stable, unique ID because:
1. React keys use IDs for stable rendering
2. Update functions need IDs to find the right item (`list.id !== targetId`)
3. The backend (Labs 15+) will use IDs as primary keys
4. Drag-and-drop (Lab 12) needs IDs to identify "which card moved from which list to which list"

Without IDs, operations like "move card from list A to list B" have no reliable way to refer to the entities involved.

**You will see this again in:** Every real-world data model. API responses, database schemas, Redux stores — all use ID fields for the same reasons.

---

## Concept: Single Source of Truth

**What it is:** One authoritative location for each piece of data. No duplicates, no derived copies stored as state.

**The anti-pattern — multiple sources:**

```tsx
// BAD — card count stored in two places
const [cards, setCards] = useState<Card[]>([]);
const [cardCount, setCardCount] = useState(0);

// Now you must keep them in sync manually
function addCard(card: Card) {
  setCards([...cards, card]);
  setCardCount(cardCount + 1);  // easy to forget, easy to get wrong
}
```

**The correct pattern — one source, derive the rest:**

```tsx
// GOOD — only one source
const [cards, setCards] = useState<Card[]>([]);

// Count is derived — always correct by definition
const cardCount = cards.length;
```

For FlowBoard:
- `boardLists` in `App.tsx` is the single source of truth for all board data
- Card counts, list lengths, "is this list empty?" — all derived from `boardLists`
- The URL could be a source of truth for "which board is selected" (Lab 11)
- The backend (Lab 16+) becomes the ultimate source of truth for persistent data

**You will see this again in:** Database normalization (no duplicate data), Redux selectors (derive from store, not duplicate), form validation (derive error messages from values, not store them separately).

---

## Step 1 — Create `src/types.ts`

Create `src/types.ts` with the full data model:

```ts
// src/types.ts
// The FlowBoard data model.
// These are pure data shapes — no React, no UI concerns.

// A single task card on the board.
export interface Card {
  id: string;
  title: string;
  description: string;
}

// A list (column) of cards.
export interface List {
  id: string;
  title: string;
  cards: Card[];
}

// A project board containing multiple lists.
export interface Board {
  id: string;
  title: string;
  lists: List[];
}

// The priority level of a card (for Lab 29).
// Using 'type' here because this is a union — not a plain object shape.
export type Priority = 'low' | 'medium' | 'high';
```

### SAVE AND TRY

Save. No errors — these are just type definitions. Nothing uses them yet.

---

## Step 2 — Update `Card.tsx` to use the new types

`CardProps` mixed UI concerns (the `onDelete` callback) with data concerns (`title`, `description`). Separate them:

```tsx
// Card.tsx

import { Card } from '../types';
import './Card.css';

// CardProps extends the Card data shape and adds UI-specific callbacks.
// The data fields come from the Card interface; the callback is UI-only.
export interface CardProps extends Card {
  onDelete?: (id: string) => void;
}

export function Card(props: CardProps) {
  return (
    <div className="card">
      <div className="card-header">
        <h3 className="card-title">{props.title}</h3>
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

`extends Card` means: `CardProps` has all the fields of `Card` (`id`, `title`, `description`) plus the added `onDelete` callback. This is interface extension — `CardProps` is a superset of `Card`.

---

## Step 3 — Update `List.tsx` to use the new types

```tsx
// List.tsx

import { useState } from 'react';
import { List } from '../types';
import { Card, CardProps } from './Card';
import './List.css';

// ListProps extends the List data shape and adds UI-specific callbacks.
export interface ListProps extends List {
  onAddCard: (title: string) => void;
  onDeleteCard: (cardId: string) => void;
}

export function List(props: ListProps) {
  const [inputValue, setInputValue] = useState('');

  const cardCount = props.cards.length;

  function handleKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key !== 'Enter') return;
    const trimmed = inputValue.trim();
    if (trimmed === '') return;
    props.onAddCard(trimmed);
    setInputValue('');
  }

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
                key={card.id}
                id={card.id}
                title={card.title}
                description={card.description}
                onDelete={props.onDeleteCard}
              />
            ))
          : <p className="empty-state">No cards yet</p>
        }
      </div>

      <div className="add-card-area">
        <input
          className="add-card-input"
          type="text"
          placeholder="+ Add a card..."
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
        />
      </div>
    </div>
  );
}
```

---

## Step 4 — Update `Board.tsx` to use the new types

```tsx
// Board.tsx

import { Board } from '../types';
import { List } from './List';
import './Board.css';

// BoardProps extends the Board data shape and adds UI callbacks.
export interface BoardProps extends Board {
  onAddCard: (listId: string, cardTitle: string) => void;
  onDeleteCard: (listId: string, cardId: string) => void;
}

export function Board(props: BoardProps) {
  return (
    <div className="board-area">
      {props.lists.map(list => (
        <List
          key={list.id}
          id={list.id}
          title={list.title}
          cards={list.cards}
          onAddCard={(cardTitle) => props.onAddCard(list.id, cardTitle)}
          onDeleteCard={(cardId) => props.onDeleteCard(list.id, cardId)}
        />
      ))}
    </div>
  );
}
```

---

## Step 5 — Update `boardUtils.ts` to use the new types

```ts
// boardUtils.ts

import { Board, List, Card } from '../types';

export function addCardToList(
  lists: List[],
  listId: string,
  newCard: Card
): List[] {
  return lists.map(list => {
    if (list.id !== listId) return list;
    return { ...list, cards: [...list.cards, newCard] };
  });
}

export function deleteCardFromList(
  lists: List[],
  listId: string,
  cardId: string
): List[] {
  return lists.map(list => {
    if (list.id !== listId) return list;
    return { ...list, cards: list.cards.filter(card => card.id !== cardId) };
  });
}
```

---

## Step 6 — Update `App.tsx` to use the `Board` type

```tsx
// App.tsx

import { useState } from 'react';
import { Board, Card } from './types';
import { Board as BoardComponent, BoardProps } from './components/Board';
import { addCardToList, deleteCardFromList } from './utils/boardUtils';
import './App.css';

// The full board, typed as Board — one object containing all data.
const INITIAL_BOARD: Board = {
  id: 'board-1',
  title: 'My Project',
  lists: [
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
  ],
};

function App() {
  const [board, setBoard] = useState<Board>(INITIAL_BOARD);

  function handleAddCard(listId: string, cardTitle: string) {
    const newCard: Card = {
      id: `card-${Date.now()}`,
      title: cardTitle,
      description: '',
    };
    setBoard(prev => ({
      ...prev,
      lists: addCardToList(prev.lists, listId, newCard),
    }));
  }

  function handleDeleteCard(listId: string, cardId: string) {
    setBoard(prev => ({
      ...prev,
      lists: deleteCardFromList(prev.lists, listId, cardId),
    }));
  }

  return (
    <div className="app-layout">
      <header className="app-header">
        <span className="app-name">FlowBoard</span>
        <span className="board-title-text">{board.title}</span>
      </header>
      <BoardComponent
        id={board.id}
        title={board.title}
        lists={board.lists}
        onAddCard={handleAddCard}
        onDeleteCard={handleDeleteCard}
      />
    </div>
  );
}

export default App;
```

Note: `Board as BoardComponent` renames the imported component to avoid naming conflicts with the `Board` interface from `types.ts`. Also, add the board title to the header and add a style for it in `App.css`:

```css
/* App.css — add to existing rules */

.board-title-text {
  color: rgba(255, 255, 255, 0.7);
  font-size: 14px;
  margin-left: 16px;
}
```

### SAVE AND TRY

Save. Fix any TypeScript errors the Problems panel shows — they will guide you to any missed update.

**You should see:**
- Visually: header now shows "FlowBoard · My Project" (approximately)
- Behavior: adding and deleting cards works exactly as before
- React DevTools: `App` state is now a single `board` object instead of `boardLists` array

---

## 🎯 Challenge: Add a `createdAt` timestamp to cards

**You know:** TypeScript interfaces, the Card interface, `Date.now()`

**Task:** Add a `createdAt: number` field to the `Card` interface (Unix timestamp in milliseconds). Update `handleAddCard` to set it. Display the "time added" on each card in a human-readable relative format — e.g., "Just now" for anything less than 60 seconds ago. Pre-populate the initial data's `createdAt` with `Date.now() - 300000` (5 minutes ago) so you can see non-"just now" output immediately.

**Hints:**
- Add `createdAt: number` to the `Card` interface in `types.ts`
- Update all initial card objects to include `createdAt`
- `handleAddCard` uses `Date.now()` for the new card's `createdAt`
- For display: `const ageMs = Date.now() - props.createdAt; const label = ageMs < 60000 ? 'Just now' : '${Math.floor(ageMs / 60000)}m ago'`

---

<details>
<summary>▶ Show Solution</summary>

In `types.ts`, update `Card`:
```ts
export interface Card {
  id: string;
  title: string;
  description: string;
  createdAt: number;  // Unix timestamp in milliseconds
}
```

Update `INITIAL_BOARD` in `App.tsx` — add `createdAt: Date.now() - 300000` to each initial card.

Update `handleAddCard` in `App.tsx`:
```tsx
const newCard: Card = {
  id: `card-${Date.now()}`,
  title: cardTitle,
  description: '',
  createdAt: Date.now(),
};
```

In `Card.tsx`, add to the JSX (at the bottom of `.card`):
```tsx
<span className="card-time">
  {Date.now() - props.createdAt < 60000
    ? 'Just now'
    : `${Math.floor((Date.now() - props.createdAt) / 60000)}m ago`}
</span>
```

In `Card.css`:
```css
.card-time {
  font-size: 11px;
  color: #a0aec0;
  display: block;
  margin-top: 6px;
}
```

**Key insight:** `createdAt` on the card model is a good example of a data field that belongs in the domain model even though it is only used for display. By putting it in `types.ts`, you make it part of the contract — any code that creates a `Card` must provide a `createdAt`, and any code that displays a card has access to it. If you need it later for sorting by creation date or filtering by "cards added this week", it's already there.

</details>

---

## Final Check

| Feature | How to Verify |
|---|---|
| `src/types.ts` exists with `Card`, `List`, `Board` interfaces | VS Code Explorer |
| `Card`, `List`, `Board` all have `id: string` | Check types.ts |
| `CardProps extends Card` in Card.tsx | Check the interface declaration |
| `ListProps extends List` in List.tsx | Check the interface declaration |
| `BoardProps extends Board` in Board.tsx | Check the interface declaration |
| `App.tsx` state is `useState<Board>` | Check App.tsx |
| Board title shows in the header | Browser shows "My Project" in header |
| Add and delete cards still work | Test interactively |
| `boardUtils.ts` imports from `../types` | Check imports |
| No TypeScript errors | Problems panel clean |

---

## Quick Check Answers

**1. What tension arises from `CardProps` serving as both props and data model?**

`CardProps` has a dual role: it describes a card's data (`id`, `title`, `description`) AND the UI callback (`onDelete`). This means the type is mixed between domain concerns and component concerns. If you want to pass a card to a non-React function (like a pure utility or a network layer), you are forced to include the callback. If you separate them — a `Card` interface for data, `CardProps` for the UI wrapper — each type has one role. The `extends` pattern in this lab formalizes that separation: `CardProps extends Card` means "a card plus its callbacks."

**2. What is the difference between `type` and `interface`?**

Both can describe object shapes. Key differences: `interface` supports declaration merging (two `interface Foo` declarations merge); `type` does not. `type` supports union types, intersections, tuples, and computed types; `interface` cannot express these. Practically: use `interface` for object shapes ("this thing has these fields"), use `type` for everything else (union of strings, intersection types, `Record<K,V>` aliases, etc.).

**3. What would you add to support multiple boards?**

The current state is `board: Board` — a single board. To support multiple boards, the state becomes `boards: Board[]` (an array) and you add `activeBoard: string` (the ID of the currently selected board) or derive the selected board from the URL. The single-board → multi-board transition is easy when the data model uses a `Board` type — you just wrap it in an array. If the data had been structured as `ListData[]` with no wrapping concept, adding multi-board support would require a bigger refactor.

---

## Next Lab

In **LAB-11**, you will add support for multiple boards. The sidebar shows a list of board names; clicking one switches the view. You will see how the `Board` type scales, how index-based vs ID-based selection works, and why the selected board state might belong in the URL rather than in React state.
