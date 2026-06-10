# FlowBoard Masterclass — LAB 31 — List Operations: Create, Rename, Delete, Archive

**Prerequisites:** LAB-30 — Zustand store. All board state in `useBoardStore`.

**What this lab adds:**
- Create new lists on a board
- Rename list titles (inline editing, same pattern as board title)
- Delete a list with its cards (with confirmation)
- Archive a list — soft hide but don't delete
- "Add another list" button that appears at the end of the board's column row
- Backend endpoints for list CRUD

**Time:** 65–80 minutes

---

> **Quick Check — try to answer before reading further:**
>
> 1. A list delete destroys all cards in the list. In the database, this is handled by `CASCADE` on the foreign key. What does `ON DELETE CASCADE` mean, and what happens without it?
> 2. Archive vs delete: archive hides the list but keeps the data. Name one use case where archive is preferable to delete.
> 3. When a user creates a new list and immediately types in it, that's two operations: create → focus add-card input. How do you sequence these programmatically?
>
> *(Answers at the end of this lab)*

---

## What You Will Build

The board shows an "Add List" button at the end of the horizontal scroll. Clicking creates a new list and focuses its title for immediate renaming. Lists have a menu (three-dot button) with Rename, Archive, and Delete options. Archived lists are hidden from the board but visible in a "Show archived" drawer.

---

## Concept: Cascading Deletes in SQL

When you delete a board, you want its lists deleted. When you delete a list, you want its cards deleted. This is a database cascade.

**Without CASCADE:**
```sql
-- Deleting a list while cards still reference it:
DELETE FROM lists WHERE id = 'list-1';
-- ERROR: Foreign key constraint failed —
-- cards.list_id still references list-1
```

**With ON DELETE CASCADE:**
```python
# SQLAlchemy model:
class CardModel(Base):
    list_id = Column(String, ForeignKey("lists.id", ondelete="CASCADE"))
    # When a list is deleted, all its cards are automatically deleted
```

```sql
-- Now this works — cards deleted automatically:
DELETE FROM lists WHERE id = 'list-1';
-- → CardModel rows with list_id='list-1' are also deleted
```

SQLAlchemy also supports `cascade` at the relationship level for ORM-level cascades:
```python
class ListModel(Base):
    cards = relationship("CardModel", back_populates="list",
                         cascade="all, delete-orphan")
    # "delete-orphan" deletes cards when they're removed from the relationship
```

---

## Concept: The "Add at End" UI Pattern

Trello's UX for adding lists is instructive:

1. Shows "+ Add another list" at the end of the board
2. Clicking it transforms the button into a form (title input + submit)
3. Submitting creates the list and transforms back to the button
4. Escape or clicking outside cancels

This is the same controlled-input + toggle pattern from Lab 8, applied to a list creation UI.

```tsx
function AddListButton() {
  const [isAdding, setIsAdding] = useState(false);
  const [title, setTitle] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  function startAdding() {
    setIsAdding(true);
    // Focus happens after render via useEffect
  }

  useEffect(() => {
    if (isAdding) inputRef.current?.focus();
  }, [isAdding]);

  function submit() {
    if (title.trim()) {
      onAddList(title.trim());
    }
    setTitle('');
    setIsAdding(false);
  }

  if (!isAdding) {
    return (
      <button className="add-list-btn" onClick={startAdding}>
        + Add another list
      </button>
    );
  }

  return (
    <div className="add-list-form">
      <input
        ref={inputRef}
        value={title}
        onChange={e => setTitle(e.target.value)}
        onKeyDown={e => { if (e.key === 'Enter') submit(); if (e.key === 'Escape') setIsAdding(false); }}
        placeholder="Enter list title..."
      />
      <button onClick={submit}>Add List</button>
      <button onClick={() => setIsAdding(false)}>Cancel</button>
    </div>
  );
}
```

---

## Step 1 — Backend: list CRUD endpoints

Add to `backend/main.py`:

```python
class CreateListRequest(BaseModel):
    title: str

class UpdateListRequest(BaseModel):
    title: Optional[str] = None
    is_archived: Optional[bool] = None

# Add is_archived to ListModel in models.py:
# is_archived = Column(Boolean, default=False)

@app.post("/api/boards/{board_id}/lists", response_model=dict)
async def create_list(
    board_id: str,
    request: CreateListRequest,
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_current_user)
):
    board = db.query(BoardModel).filter(
        BoardModel.id == board_id,
        BoardModel.owner_id == current_user.id
    ).first()
    if board is None:
        raise HTTPException(status_code=404, detail="Board not found")
    
    # Position = end of current lists
    position = db.query(ListModel).filter(ListModel.board_id == board_id).count()
    
    new_list = ListModel(
        id=str(uuid.uuid4()),
        title=request.title.strip(),
        board_id=board_id,
        position=position,
    )
    db.add(new_list)
    db.commit()
    db.refresh(new_list)
    return {"id": new_list.id, "title": new_list.title, "cards": [], "position": new_list.position}


@app.patch("/api/lists/{list_id}", response_model=dict)
async def update_list(
    list_id: str,
    request: UpdateListRequest,
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_current_user)
):
    list_ = db.query(ListModel).join(BoardModel).filter(
        ListModel.id == list_id,
        BoardModel.owner_id == current_user.id
    ).first()
    if list_ is None:
        raise HTTPException(status_code=404, detail="List not found")
    
    if request.title is not None:
        list_.title = request.title.strip()
    if request.is_archived is not None:
        list_.is_archived = request.is_archived
    
    db.commit()
    db.refresh(list_)
    return {"id": list_.id, "title": list_.title, "is_archived": list_.is_archived}


@app.delete("/api/lists/{list_id}", status_code=204)
async def delete_list(
    list_id: str,
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_current_user)
):
    list_ = db.query(ListModel).join(BoardModel).filter(
        ListModel.id == list_id,
        BoardModel.owner_id == current_user.id
    ).first()
    if list_ is None:
        raise HTTPException(status_code=404, detail="List not found")
    
    db.delete(list_)  # CASCADE deletes cards too (via ondelete="CASCADE")
    db.commit()
    return None
```

---

## Step 2 — API functions

Add to `src/api/boardsApi.ts`:

```typescript
export async function createList(boardId: string, title: string): Promise<ApiList> {
  const response = await fetch(`${API_BASE}/api/boards/${boardId}/lists`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ title }),
  });
  if (response.status === 401) throw new Error('UNAUTHORIZED');
  if (!response.ok) throw new Error(`Failed to create list: HTTP ${response.status}`);
  return response.json() as Promise<ApiList>;
}

export async function updateList(listId: string, updates: { title?: string; is_archived?: boolean }): Promise<void> {
  const response = await fetch(`${API_BASE}/api/lists/${listId}`, {
    method: 'PATCH',
    headers: getAuthHeaders(),
    body: JSON.stringify(updates),
  });
  if (response.status === 401) throw new Error('UNAUTHORIZED');
  if (!response.ok) throw new Error(`Failed to update list: HTTP ${response.status}`);
}

export async function deleteList(listId: string): Promise<void> {
  const response = await fetch(`${API_BASE}/api/lists/${listId}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  if (response.status === 401) throw new Error('UNAUTHORIZED');
  if (!response.ok) throw new Error(`Failed to delete list: HTTP ${response.status}`);
}
```

---

## Step 3 — Create `AddListButton` component

Create `src/components/AddListButton.tsx`:

```tsx
// src/components/AddListButton.tsx

import { useState, useRef, useEffect } from 'react';
import './AddListButton.css';

interface AddListButtonProps {
  onAddList: (title: string) => void;
}

export function AddListButton({ onAddList }: AddListButtonProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [title, setTitle] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isAdding) inputRef.current?.focus();
  }, [isAdding]);

  function submit() {
    const trimmed = title.trim();
    if (trimmed) {
      onAddList(trimmed);
      setTitle('');
      setIsAdding(false);
    }
  }

  function cancel() {
    setTitle('');
    setIsAdding(false);
  }

  if (!isAdding) {
    return (
      <button className="add-list-btn" onClick={() => setIsAdding(true)}>
        <span>+</span> Add another list
      </button>
    );
  }

  return (
    <div className="add-list-form">
      <input
        ref={inputRef}
        className="add-list-input"
        value={title}
        onChange={e => setTitle(e.target.value)}
        onKeyDown={e => {
          if (e.key === 'Enter') submit();
          if (e.key === 'Escape') cancel();
        }}
        placeholder="Enter list title..."
      />
      <div className="add-list-actions">
        <button className="add-list-submit" onClick={submit}>Add List</button>
        <button className="add-list-cancel" onClick={cancel} aria-label="Cancel">✕</button>
      </div>
    </div>
  );
}
```

Create `src/components/AddListButton.css`:

```css
.add-list-btn {
  flex-shrink: 0;
  width: 272px;
  background: rgba(255,255,255,0.2);
  border: none;
  border-radius: 12px;
  padding: 12px 16px;
  color: white;
  cursor: pointer;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 8px;
  align-self: flex-start;
  transition: background 0.15s;
}

.add-list-btn:hover { background: rgba(255,255,255,0.3); }

.add-list-form {
  flex-shrink: 0;
  width: 272px;
  background: #ebecf0;
  border-radius: 12px;
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  align-self: flex-start;
}

.add-list-input {
  padding: 8px 10px;
  border: 2px solid #4299e1;
  border-radius: 4px;
  font-size: 14px;
  outline: none;
  width: 100%;
  box-sizing: border-box;
}

.add-list-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.add-list-submit {
  background: #0052cc;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 6px 12px;
  cursor: pointer;
  font-size: 14px;
}

.add-list-cancel {
  background: none;
  border: none;
  cursor: pointer;
  color: #5e6c84;
  font-size: 18px;
  padding: 4px;
}
```

---

## Step 4 — Add list menu (rename, archive, delete)

Create `src/components/ListMenu.tsx`:

```tsx
// src/components/ListMenu.tsx
// Three-dot menu for list operations.

import { useState, useRef, useEffect } from 'react';
import './ListMenu.css';

interface ListMenuProps {
  listId: string;
  listTitle: string;
  onRename: (newTitle: string) => void;
  onArchive: () => void;
  onDelete: () => void;
}

export function ListMenu({ listId, listTitle, onRename, onArchive, onDelete }: ListMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isRenaming, setIsRenaming] = useState(false);
  const [newTitle, setNewTitle] = useState(listTitle);
  const menuRef = useRef<HTMLDivElement>(null);
  const renameInputRef = useRef<HTMLInputElement>(null);

  // Close when clicking outside
  useEffect(() => {
    if (!isOpen) return;
    function handleOutsideClick(e: MouseEvent) {
      if (!menuRef.current?.contains(e.target as Node)) setIsOpen(false);
    }
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [isOpen]);

  useEffect(() => {
    if (isRenaming) renameInputRef.current?.focus();
  }, [isRenaming]);

  function handleRenameSubmit() {
    if (newTitle.trim() && newTitle.trim() !== listTitle) {
      onRename(newTitle.trim());
    }
    setIsRenaming(false);
    setIsOpen(false);
  }

  if (isRenaming) {
    return (
      <div className="list-rename-inline">
        <input
          ref={renameInputRef}
          value={newTitle}
          onChange={e => setNewTitle(e.target.value)}
          onKeyDown={e => {
            if (e.key === 'Enter') handleRenameSubmit();
            if (e.key === 'Escape') { setIsRenaming(false); setNewTitle(listTitle); }
          }}
          onBlur={handleRenameSubmit}
        />
      </div>
    );
  }

  return (
    <div className="list-menu-container" ref={menuRef}>
      <button
        className="list-menu-trigger"
        onClick={() => setIsOpen(prev => !prev)}
        aria-label="List options"
        aria-expanded={isOpen}
      >
        ···
      </button>

      {isOpen && (
        <div className="list-menu-dropdown">
          <button onClick={() => { setIsRenaming(true); setNewTitle(listTitle); }}>
            Rename list
          </button>
          <button onClick={() => { onArchive(); setIsOpen(false); }}>
            Archive list
          </button>
          <button
            className="list-menu-delete-btn"
            onClick={() => {
              if (confirm(`Delete list "${listTitle}" and all its cards?`)) {
                onDelete();
              }
              setIsOpen(false);
            }}
          >
            Delete list
          </button>
        </div>
      )}
    </div>
  );
}
```

Create `src/components/ListMenu.css`:

```css
.list-menu-container { position: relative; }

.list-menu-trigger {
  background: none;
  border: none;
  cursor: pointer;
  color: #5e6c84;
  font-size: 16px;
  padding: 4px 6px;
  border-radius: 4px;
  letter-spacing: 2px;
  line-height: 1;
}

.list-menu-trigger:hover { background: rgba(0,0,0,0.1); }

.list-menu-dropdown {
  position: absolute;
  right: 0;
  top: calc(100% + 4px);
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  box-shadow: 0 4px 16px rgba(0,0,0,0.12);
  min-width: 160px;
  z-index: 100;
  overflow: hidden;
}

.list-menu-dropdown button {
  display: block;
  width: 100%;
  text-align: left;
  padding: 10px 16px;
  background: none;
  border: none;
  font-size: 14px;
  cursor: pointer;
  color: #2d3748;
}

.list-menu-dropdown button:hover { background: #f7fafc; }
.list-menu-delete-btn { color: #e53e3e !important; }

.list-rename-inline input {
  border: 2px solid #4299e1;
  border-radius: 4px;
  padding: 4px 8px;
  font-size: 14px;
  font-weight: 600;
  outline: none;
  width: 100%;
  box-sizing: border-box;
}
```

### SAVE AND TRY

1. Click "Add another list" → form appears, type a title → Enter → list created
2. Click the `···` menu on a list → Rename, Archive, Delete options
3. Rename → type new title → Enter → title updated
4. Archive → list disappears from board
5. Delete with confirmation → list and all cards removed

---

## 🎯 Challenge: Show archived lists in a collapsible drawer

**You know:** `useState`, conditional rendering, API calls, the list data shape.

**Task:** Add an "Archived lists" section below the board that's collapsed by default. Clicking it expands to show archived list titles with an "Unarchive" button for each.

**Hints:**
- Filter `activeBoard.lists` by `isArchived === true` to get archived lists
- Currently, archived lists are excluded from the main board view
- `<details>` HTML element gives you a collapsible section without JavaScript
- Or use `useState(false)` with a toggle button

---

<details>
<summary>▶ Show Solution</summary>

```tsx
// In BoardPage.tsx:
const archivedLists = activeBoard?.lists.filter(l => l.isArchived) ?? [];

{archivedLists.length > 0 && (
  <details className="archived-lists-drawer">
    <summary className="archived-lists-toggle">
      Archived lists ({archivedLists.length})
    </summary>
    <div className="archived-lists-content">
      {archivedLists.map(list => (
        <div key={list.id} className="archived-list-item">
          <span>{list.title}</span>
          <button onClick={() => unarchiveList(list.id)}>Restore</button>
        </div>
      ))}
    </div>
  </details>
)}
```

In the store:
```typescript
unarchiveList: async (listId) => {
  set(state => ({
    boards: updateListInBoards(state.boards, state.selectedBoardId, listId, list => ({
      ...list,
      isArchived: false,
    })),
  }));
  await updateList(listId, { is_archived: false });
},
```

**Key insight:** The `<details>` and `<summary>` HTML elements give you a native collapsible section with no JavaScript, no CSS tricks, and built-in keyboard and screen reader support. The `<summary>` is the clickable header. Clicking toggles the `open` attribute on `<details>`. You can style it with CSS (hide the default triangle with `summary { list-style: none }`). For most "show/hide" use cases, native HTML elements are better than custom implementations.

</details>

---

## Final Check

| Feature | How to Verify |
|---|---|
| "Add another list" button visible | End of board horizontal scroll |
| Creating a list works | Add list → appears on board |
| List title immediately editable after create | New list → cursor in title |
| List menu opens with three-dot button | Click `···` → menu appears |
| Rename works | Menu → Rename → type → Enter |
| Archive hides list from board | Menu → Archive → list hidden |
| Delete asks for confirmation | Menu → Delete → confirm dialog |
| Delete removes list and cards | Confirm delete → list + cards gone |
| Backend cascade delete works | `/api/lists/{id}` DELETE → cards also deleted |
| `ON DELETE CASCADE` on CardModel FK | Check models.py |
| Archived lists showable | Challenge: archived drawer |
| No TypeScript errors | Problems panel clean |

---

## Quick Check Answers

**1. `ON DELETE CASCADE` and what happens without it:**

`ON DELETE CASCADE` on a foreign key tells the database: when the referenced row (a list) is deleted, automatically delete all rows that reference it (the list's cards). Without `CASCADE`, the database enforces referential integrity — if any card still has `list_id = 'list-1'`, deleting that list raises a foreign key constraint error. You'd have to manually delete all cards first: `DELETE FROM cards WHERE list_id = 'list-1'` followed by `DELETE FROM lists WHERE id = 'list-1'`. Cascade automates this. The risk: cascade deletes can silently remove more data than intended — always document which relationships cascade.

**2. When archive is preferable to delete:**

When the data has value even when inactive. Example: a sprint board in Agile — completed sprint lists shouldn't be deleted (you lose the history), but they clutter the active board. Archiving hides them without data loss. Other examples: completed project columns in a CRM, closed support ticket queues, old product categories in an e-commerce store. Archive is essentially the same as soft delete with an explicit "inactive but keepable" semantic. Hard delete should be reserved for data that is truly unneeded and should not be recoverable.

**3. Sequencing create → focus:**

You need to wait for the list to be created and the component to render before calling `.focus()`. The sequence: (1) call `createList` API, (2) update state with the new list, (3) React re-renders with the new `List` component, (4) after that render, trigger focus. The pattern is: `useEffect(() => { if (newlyCreatedListId) { listTitleRefs[newlyCreatedListId]?.focus(); setNewlyCreatedListId(null); } }, [newlyCreatedListId])`. Alternatively, the `AddListButton` component can handle its own focus internally (as shown in this lab) — it shows a form, creates the list, then resets. The new list appears with the normal "add card" UI already focused.

---

## Next Lab

In **LAB-32**, you will implement **search and filtering** — a real-time search that highlights matching cards across all lists, plus a multi-select filter panel for priority and list. You will learn about debouncing user input, the `useTransition` hook for non-urgent UI updates, and how to build a filter state machine.
