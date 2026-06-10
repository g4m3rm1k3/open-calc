# FlowBoard Masterclass — LAB 11 — Multiple Boards and a Sidebar

**Prerequisites:** LAB-10 — Typed data model. `src/types.ts` with `Board`, `List`, `Card` interfaces. App state is `useState<Board>`.

**What this lab adds:**
- A sidebar component with a list of boards
- Switching the active board by clicking its name in the sidebar
- Array of boards as state
- Index-based vs ID-based selection — why IDs are superior
- Derived rendering — the active board is found from state, not stored separately

**Time:** 50–65 minutes

---

> **Quick Check — try to answer before reading further:**
>
> 1. To track which board is selected, one option is `selectedIndex: number`. Another is `selectedBoardId: string`. What could go wrong with the index approach?
> 2. If the sidebar is a component, it does not own the boards data — `App` does. What props would `Sidebar` need?
> 3. When you select a different board, should the lists from the previous board be remembered? How is that different from when you *change* a board — add a card, rename a list?
>
> *(Answers at the end of this lab)*

---

## What You Will Build

A collapsible sidebar on the left shows a list of boards. Clicking a board name switches the main panel to show that board's lists. The active board is highlighted in the sidebar.

```
┌──────── FlowBoard ────────────────────────────────┐
│──────────────────────────────────────────────────│
│ ┌───────────┐  ┌──────────────────────────────┐  │
│ │ My Project│  │  TO DO    IN PROGRESS   DONE  │  │
│ │ ● Team    │  │  [cards]  [cards]        ...  │  │
│ │   Work    │  │                               │  │
│ │ + New     │  │                               │  │
│ └───────────┘  └──────────────────────────────┘  │
└──────────────────────────────────────────────────┘
```

---

## Concept: ID-Based Selection vs Index-Based Selection

**What it is:** Two strategies for tracking "which item is selected" — by its position in the array (index) or by its stable unique ID.

**The problem with index-based selection:**

```tsx
// Index-based
const [selectedIndex, setSelectedIndex] = useState(0);
const activeBoard = boards[selectedIndex];

// You add a new board — boards gets reordered.
// Now selectedIndex = 1 points to a different board than before.
// The user was on "Team Work" (index 1), now they're on "Personal" (index 2).
// The selection silently switched to the wrong board.
```

Indices are positions. Positions change. Any array operation (add, remove, sort, filter) can invalidate an index.

**ID-based selection:**

```tsx
// ID-based
const [selectedBoardId, setSelectedBoardId] = useState<string>('board-1');
const activeBoard = boards.find(b => b.id === selectedBoardId);

// You add, remove, or reorder boards.
// selectedBoardId = 'board-team-work' always finds the right board.
// The only way selection breaks is if that board is deleted.
```

IDs are stable. They travel with the data, not with its position.

**The one case where index works:** When order is guaranteed to be stable and items are never reordered, added, or removed. In practice, this is almost never true for user-managed lists.

**You will see this again in:** URL routing (`/boards/board-team-work`), tabs and nav panels, table row selection, tree views. Any time something is "selected" from a list, use an ID.

---

## Concept: Derived Rendering

**What it is:** Computing what to display from existing state, rather than storing the computed value as separate state.

**The anti-pattern:**

```tsx
// BAD — duplicate state
const [boards, setBoards] = useState<Board[]>([...]);
const [activeBoard, setActiveBoard] = useState<Board>(boards[0]);  // DUPLICATE

// Now you must keep them synchronized.
// When you update a board in `boards`, you must also update `activeBoard`.
// When you select a different board, you must find it in `boards` AND set `activeBoard`.
// Double the state updates, double the chances of desync.
```

**The correct pattern — derive:**

```tsx
// GOOD — one source of truth
const [boards, setBoards] = useState<Board[]>([...]);
const [selectedBoardId, setSelectedBoardId] = useState<string>(boards[0].id);

// activeBoard is derived — computed from existing state
const activeBoard = boards.find(b => b.id === selectedBoardId);

// When you update a board in `boards`, activeBoard automatically reflects the change.
// When you select a board, you only change `selectedBoardId`.
// Two independent facts → two state variables. One derived fact → no state variable.
```

**The rule:** Only store in state what cannot be derived from other state. Everything else is a computation.

**You will see this again in:** Filtered lists (don't store filtered array — derive it from the full array and filter criteria), counts (don't store count — `array.length`), selected item details (don't duplicate — look up by ID), form validation errors (derive from field values).

---

## Step 1 — Update `App.tsx` to support multiple boards

Change the app state from one board to an array of boards with a selection tracker:

```tsx
// App.tsx — updated state

const INITIAL_BOARDS: Board[] = [
  {
    id: 'board-1',
    title: 'My Project',
    lists: [
      {
        id: 'list-todo',
        title: 'To Do',
        cards: [
          { id: 'card-1', title: 'Fix login button', description: 'Does not respond on mobile.', createdAt: Date.now() },
          { id: 'card-2', title: 'Update homepage hero', description: 'New design in Figma.', createdAt: Date.now() },
        ],
      },
      {
        id: 'list-in-progress',
        title: 'In Progress',
        cards: [
          { id: 'card-4', title: 'Design new dashboard', description: 'Working with design team.', createdAt: Date.now() },
        ],
      },
      {
        id: 'list-done',
        title: 'Done',
        cards: [],
      },
    ],
  },
  {
    id: 'board-2',
    title: 'Team Work',
    lists: [
      {
        id: 'list-team-todo',
        title: 'Backlog',
        cards: [
          { id: 'card-10', title: 'Define sprint goals', description: 'Q3 planning session.', createdAt: Date.now() },
        ],
      },
      {
        id: 'list-team-in-progress',
        title: 'In Progress',
        cards: [],
      },
      {
        id: 'list-team-done',
        title: 'Done',
        cards: [],
      },
    ],
  },
];
```

Replace the single `board` state with two state variables:

```tsx
function App() {
  const [boards, setBoards] = useState<Board[]>(INITIAL_BOARDS);
  const [selectedBoardId, setSelectedBoardId] = useState<string>(INITIAL_BOARDS[0].id);

  // activeBoard is derived — not stored separately
  const activeBoard = boards.find(b => b.id === selectedBoardId)!;

  // Update state updaters to operate on the correct board within the array
  function handleAddCard(listId: string, cardTitle: string) {
    const newCard: Card = {
      id: `card-${Date.now()}`,
      title: cardTitle,
      description: '',
      createdAt: Date.now(),
    };
    setBoards(prev => prev.map(board => {
      if (board.id !== selectedBoardId) return board;
      return { ...board, lists: addCardToList(board.lists, listId, newCard) };
    }));
  }

  function handleDeleteCard(listId: string, cardId: string) {
    setBoards(prev => prev.map(board => {
      if (board.id !== selectedBoardId) return board;
      return { ...board, lists: deleteCardFromList(board.lists, listId, cardId) };
    }));
  }

  return (
    <div className="app-layout">
      <header className="app-header">
        <span className="app-name">FlowBoard</span>
        <span className="board-title-text">{activeBoard.title}</span>
      </header>

      <div className="app-body">
        {/* Sidebar with board list */}
        <Sidebar
          boards={boards}
          selectedBoardId={selectedBoardId}
          onSelectBoard={setSelectedBoardId}
        />

        {/* Active board content */}
        <BoardComponent
          id={activeBoard.id}
          title={activeBoard.title}
          lists={activeBoard.lists}
          onAddCard={handleAddCard}
          onDeleteCard={handleDeleteCard}
        />
      </div>
    </div>
  );
}
```

---

## Step 2 — Create the `Sidebar` component

Create `src/components/Sidebar.tsx`:

```tsx
// Sidebar.tsx

import { Board } from '../types';
import './Sidebar.css';

export interface SidebarProps {
  boards: Board[];
  selectedBoardId: string;
  onSelectBoard: (boardId: string) => void;
}

export function Sidebar(props: SidebarProps) {
  return (
    <aside className="sidebar">
      <p className="sidebar-section-label">YOUR BOARDS</p>

      <nav className="sidebar-board-list">
        {props.boards.map(board => (
          <button
            key={board.id}
            className={`sidebar-board-item ${board.id === props.selectedBoardId ? 'active' : ''}`}
            onClick={() => props.onSelectBoard(board.id)}
          >
            {board.title}
          </button>
        ))}
      </nav>
    </aside>
  );
}
```

Key patterns:
1. The `active` class is conditional — derived from `board.id === props.selectedBoardId`. No separate state needed.
2. Each item is a `<button>` — semantically correct for "click to change app state." Use `<a>` only for navigating to a URL.
3. `onSelectBoard` is just `setSelectedBoardId` passed down — the parent owns the state, the sidebar only triggers changes.

---

## Step 3 — Create `Sidebar.css`

```css
/* Sidebar.css */

.sidebar {
  width: 220px;
  flex-shrink: 0;                  /* never shrink — always stays 220px */
  background-color: #2d3748;       /* dark — matches the header */
  padding: 16px 8px;
  display: flex;
  flex-direction: column;
  gap: 4px;
  overflow-y: auto;
}

.sidebar-section-label {
  font-size: 11px;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.4);
  letter-spacing: 0.08em;
  padding: 0 8px;
  margin: 0 0 8px 0;
}

.sidebar-board-list {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.sidebar-board-item {
  background: none;
  border: none;
  cursor: pointer;
  text-align: left;
  padding: 8px 12px;
  border-radius: 6px;
  font-size: 14px;
  color: rgba(255, 255, 255, 0.7);
  transition: background-color 0.1s, color 0.1s;
  width: 100%;
}

.sidebar-board-item:hover {
  background-color: rgba(255, 255, 255, 0.1);
  color: white;
}

/* Active board is highlighted */
.sidebar-board-item.active {
  background-color: rgba(255, 255, 255, 0.15);
  color: white;
  font-weight: 600;
}
```

---

## Step 4 — Update the app layout to show sidebar + board side by side

The header takes the full width. Below it: sidebar on the left, board on the right — a horizontal flex layout.

Update `App.css`:

```css
/* App.css — full updated file */

:root {
  --header-height: 52px;
}

.app-layout {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: #f0f4f8;
  overflow: hidden;  /* prevent page-level scroll */
}

.app-header {
  background-color: #2d3748;
  padding: 0 24px;
  height: var(--header-height);
  display: flex;
  align-items: center;
  flex-shrink: 0;
  position: sticky;
  top: 0;
  z-index: 10;
  gap: 16px;
}

.app-name {
  color: white;
  font-size: 18px;
  font-weight: 700;
  letter-spacing: 0.02em;
}

.board-title-text {
  color: rgba(255, 255, 255, 0.6);
  font-size: 14px;
}

/* .app-body is the region below the header.
   Sidebar on the left, board on the right — both fill the remaining height. */
.app-body {
  display: flex;
  flex-direction: row;
  flex: 1;
  overflow: hidden;  /* children handle their own overflow */
  min-height: 0;     /* required for flex children to scroll correctly in some browsers */
}
```

And update `Board.css` — remove the fixed height (the layout now handles it):

```css
/* Board.css — remove height: calc(...), use flex: 1 instead */

.board-area {
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  gap: 12px;
  overflow-x: auto;
  overflow-y: auto;
  padding: 20px 24px 24px 24px;
  flex: 1;           /* take all available width and height from .app-body */
  min-height: 0;     /* allow flex child to scroll vertically */
  box-sizing: border-box;
}
```

Also update `Sidebar.css` to take full height:

```css
/* Add to .sidebar */
.sidebar {
  /* existing styles... */
  height: 100%;      /* fill .app-body's height */
}
```

### SAVE AND TRY

Save. Import `Sidebar` in `App.tsx`:
```tsx
import { Sidebar } from './components/Sidebar';
```

In the browser:

**You should see:**
- Dark sidebar on the left showing "MY PROJECT" and "TEAM WORK" board names
- "My Project" board is active (highlighted)
- The board content fills the right panel
- Header shows "FlowBoard · My Project"

**Test board switching:**
1. Click "Team Work" in the sidebar
2. The board immediately shows Team Work's lists
3. The header updates to show "Team Work"
4. Click "My Project" — returns to the original board with all previously added cards intact (state is preserved)

---

## Step 5 — Add a "New Board" button

```tsx
// In Sidebar.tsx — update SidebarProps and JSX

export interface SidebarProps {
  boards: Board[];
  selectedBoardId: string;
  onSelectBoard: (boardId: string) => void;
  onCreateBoard: () => void;    // ← new: called when + button is clicked
}

// In the JSX, after .sidebar-board-list:
<button className="sidebar-new-board-btn" onClick={props.onCreateBoard}>
  + New board
</button>
```

In `App.tsx`, add the handler:

```tsx
function handleCreateBoard() {
  const newBoard: Board = {
    id: `board-${Date.now()}`,
    title: `New Board ${boards.length + 1}`,
    lists: [
      { id: `list-${Date.now()}-todo`, title: 'To Do', cards: [] },
      { id: `list-${Date.now()}-done`, title: 'Done', cards: [] },
    ],
  };
  setBoards(prev => [...prev, newBoard]);
  setSelectedBoardId(newBoard.id);   // switch to the new board
}

// Pass to Sidebar:
<Sidebar
  boards={boards}
  selectedBoardId={selectedBoardId}
  onSelectBoard={setSelectedBoardId}
  onCreateBoard={handleCreateBoard}
/>
```

In `Sidebar.css`:

```css
.sidebar-new-board-btn {
  background: none;
  border: 1px dashed rgba(255, 255, 255, 0.3);
  border-radius: 6px;
  color: rgba(255, 255, 255, 0.5);
  cursor: pointer;
  padding: 6px 12px;
  font-size: 13px;
  margin-top: 8px;
  text-align: left;
  width: 100%;
  transition: border-color 0.15s, color 0.15s;
}

.sidebar-new-board-btn:hover {
  border-color: rgba(255, 255, 255, 0.6);
  color: rgba(255, 255, 255, 0.8);
}
```

### SAVE AND TRY

Save. Click "+ New board". A new board appears in the sidebar and becomes active immediately. The board shows empty "To Do" and "Done" lists. Add cards to it. Switch between boards — each board remembers its state independently.

---

## 🎯 Challenge: Make new board names editable

**You know:** Controlled inputs, `useState`, callback props, immutable updates on arrays

**Task:** When a new board is created, its name starts as `"New Board N"`. Let the user double-click the board name in the sidebar to edit it inline. On Enter or blur (clicking away), save the new name.

**Hints:**
- You need state in `Sidebar.tsx` to track which board (if any) is being edited: `editingBoardId: string | null`
- When in edit mode, render an `<input>` instead of the board name text
- On Enter/blur, call a new `onRenameBoard` callback prop with the new name
- In `App.tsx`, the handler does an immutable update on the `boards` array

---

<details>
<summary>▶ Show Solution</summary>

In `Sidebar.tsx`, add editing state and a new prop:

```tsx
import { useState } from 'react';

export interface SidebarProps {
  boards: Board[];
  selectedBoardId: string;
  onSelectBoard: (boardId: string) => void;
  onCreateBoard: () => void;
  onRenameBoard: (boardId: string, newTitle: string) => void;
}

export function Sidebar(props: SidebarProps) {
  const [editingBoardId, setEditingBoardId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState('');

  function startEditing(board: Board) {
    setEditingBoardId(board.id);
    setEditingTitle(board.title);
  }

  function commitEdit() {
    if (editingBoardId && editingTitle.trim()) {
      props.onRenameBoard(editingBoardId, editingTitle.trim());
    }
    setEditingBoardId(null);
    setEditingTitle('');
  }

  // In the board list render:
  {props.boards.map(board => (
    <div key={board.id} className="sidebar-board-row">
      {editingBoardId === board.id ? (
        <input
          className="sidebar-board-rename-input"
          value={editingTitle}
          autoFocus
          onChange={(e) => setEditingTitle(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') commitEdit(); }}
          onBlur={commitEdit}
        />
      ) : (
        <button
          className={`sidebar-board-item ${board.id === props.selectedBoardId ? 'active' : ''}`}
          onClick={() => props.onSelectBoard(board.id)}
          onDoubleClick={() => startEditing(board)}
        >
          {board.title}
        </button>
      )}
    </div>
  ))}
}
```

In `App.tsx`:
```tsx
function handleRenameBoard(boardId: string, newTitle: string) {
  setBoards(prev => prev.map(board => 
    board.id === boardId ? { ...board, title: newTitle } : board
  ));
}

// Pass: onRenameBoard={handleRenameBoard}
```

**Key insight:** The editing state (`editingBoardId`, `editingTitle`) is local to `Sidebar` — only the sidebar needs to know which item is being edited. The result of the edit (the new title) is owned by `App` through the callback. This is the correct division: transient UI state stays local; persistent data state lives in its owner.

</details>

---

## Final Check

| Feature | How to Verify |
|---|---|
| Sidebar shows board list | "MY PROJECT" and "TEAM WORK" in sidebar |
| Clicking board name switches active board | Click "Team Work" — board changes |
| Active board is highlighted in sidebar | Currently selected board has distinct style |
| Header shows active board title | Header updates on board switch |
| State persists when switching boards | Add card to board 1, switch to board 2, switch back — card still there |
| "+ New board" creates a board | Click it — new board appears and is selected |
| New board has empty default lists | New board shows "To Do" and "Done" columns |
| Layout: sidebar left, board right | Visual layout correct |
| No TypeScript errors | Problems panel clean |
| No console errors | Browser Console clean |

---

## Quick Check Answers

**1. What could go wrong with index-based selection?**

If the selected index is `1` (the second board) and you add a new board at position 0 (before it), the second board is now at index 2. Your selection still points to index 1 — a different board. This is a silent bug. The user was looking at "Team Work", adds a new board, and suddenly they're looking at "My Project" instead. ID-based selection is immune: `selectedBoardId = 'board-team-work'` always finds the right board regardless of its position in the array.

**2. What props would Sidebar need?**

At minimum: `boards: Board[]` (the data to display), `selectedBoardId: string` (which one to highlight), `onSelectBoard: (id: string) => void` (callback for when the user clicks). The parent owns the data and the selection state; the sidebar is purely a display + trigger component.

**3. When you select a different board, should the previous board's state be remembered? How is that different from changing a board?**

Yes — the previous board's state is remembered because all boards live in the `boards` array in `App.tsx`. Selecting a different board just changes `selectedBoardId` — the boards array is unchanged. The previous board's lists and cards are still in the array, just not being displayed. "Changing a board" (adding a card, renaming a list) is an update to the `boards` array: find the right board by ID, and return an updated copy. Both operations are immutable — the array changes, but previous values are not lost.

---

## Next Lab

In **LAB-12**, you will implement card moving — dragging a card from one list to another. This requires an immutable nested update that removes a card from one list and adds it to another, atomically, without ever touching the original data. It is the most complex state update you have written yet and the foundation for drag-and-drop in Lab 25.
