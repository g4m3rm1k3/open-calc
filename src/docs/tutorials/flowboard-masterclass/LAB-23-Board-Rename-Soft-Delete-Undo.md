# FlowBoard Masterclass — LAB 23 — Board Renaming, Soft Delete, and Undo

**Prerequisites:** LAB-22 — React Router with URL-based board navigation.

**What this lab adds:**
- Inline editing of the board title in the header
- `PATCH /api/boards/{boardId}` — update board title
- Soft delete — marking as deleted instead of hard removal
- Undo window — 5-second countdown before the delete is permanent
- `useRef` for DOM manipulation — focusing elements programmatically

**Time:** 65–80 minutes

---

> **Quick Check — try to answer before reading further:**
>
> 1. Soft delete keeps the row in the database but marks it as deleted. What are two advantages of this approach over immediately deleting the row?
> 2. You want to focus an input element when the user clicks "Edit." You could use a `useEffect` with a boolean state, but `useRef` is more direct. What does `useRef` let you do that state does not?
> 3. The undo window is 5 seconds. The user adds a card 2 seconds after clicking delete. Should the undo still work? What complications arise?
>
> *(Answers at the end of this lab)*

---

## What You Will Build

The board title in the header is clickable — clicking it turns it into an editable input. Pressing Enter saves the new title via API. Delete board shows a 5-second undo toast — the board reappears until the window expires, then the delete becomes permanent.

---

## Concept: `useRef` for DOM Access

**What `useRef` is:**

A ref is a mutable container that persists across renders without causing re-renders. Its primary use is accessing DOM elements directly — something you need when:
- Focusing an input programmatically
- Measuring an element's dimensions
- Integrating with third-party DOM libraries

**The pattern:**

```tsx
const inputRef = useRef<HTMLInputElement>(null);

// In JSX:
<input ref={inputRef} />

// Anywhere in the component:
inputRef.current?.focus();
inputRef.current?.select();
console.log(inputRef.current?.value);
```

`inputRef.current` is the actual DOM element after the component mounts. It is `null` before mount and when the element is not rendered.

**Why not just use state:**

State triggers re-renders. If you stored "is the input focused?" as a boolean state and called `setState(true)` then tried to focus in a useEffect, you'd need an extra render cycle. With `useRef`, you call `.focus()` directly — no re-render needed.

**You will see this again in:** Card title editing (already in Lab 18), drag-and-drop reference tracking (Lab 25), virtual list item measurements (Lab 37).

---

## Concept: Soft Delete and Undo

**Hard delete:**
```sql
DELETE FROM boards WHERE id = 'board-1';
```
The row is gone. No recovery. If the user clicked Delete by mistake, they lose data.

**Soft delete:**
```sql
UPDATE boards SET deleted_at = NOW() WHERE id = 'board-1';
```
The row remains in the database, marked as deleted. Queries exclude deleted rows. Recovery is possible: `UPDATE boards SET deleted_at = NULL WHERE id = 'board-1'`.

**Advantages of soft delete:**
1. **Undo** — you can restore deleted records without complex data reconstruction
2. **Audit trail** — you can see what was deleted and when
3. **Tombstones** — in distributed systems, you need a record of "this was deleted" to sync the deletion to other clients

**The undo pattern:**

```tsx
function handleDeleteBoard(boardId: string) {
  // Optimistic: mark as deleted in UI
  markBoardAsDeleted(boardId);
  
  // Start countdown
  const timeout = setTimeout(() => {
    // 5 seconds passed — make it permanent
    deleteBoardApi(boardId);
    clearPendingDelete(boardId);
  }, 5000);
  
  setPendingDeletes(prev => ({ ...prev, [boardId]: timeout }));
}

function handleUndoDelete(boardId: string) {
  // Cancel the countdown
  clearTimeout(pendingDeletes[boardId]);
  setPendingDeletes(prev => { const next = {...prev}; delete next[boardId]; return next; });
  
  // Restore in UI
  unmarkBoardAsDeleted(boardId);
}
```

**You will see this again in:** "Undo archive" in email clients (Gmail), "Undo delete" in Notion. This pattern is common in productivity apps where accidental deletion is costly.

---

## Step 1 — Add PATCH and DELETE endpoints to the backend

Update `backend/main.py`:

```python
# Add UpdateBoardRequest model:
class UpdateBoardRequest(BaseModel):
    title: Optional[str] = None

# Add board update route:
@app.patch("/api/boards/{board_id}", response_model=BoardData)
async def update_board(
    board_id: str,
    request: UpdateBoardRequest,
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_current_user)
):
    board = db.query(BoardModel).filter(
        BoardModel.id == board_id,
        BoardModel.owner_id == current_user.id
    ).first()
    
    if board is None:
        raise HTTPException(status_code=404, detail="Board not found")
    
    if request.title is not None:
        if len(request.title.strip()) == 0:
            raise HTTPException(status_code=422, detail="Title cannot be empty")
        board.title = request.title.strip()
    
    db.commit()
    db.refresh(board)
    return board_to_dict(board)


# Add soft-delete support — add deleted_at column to BoardModel first:
# (models.py update)
# deleted_at = Column(Integer, nullable=True, default=None)  # unix timestamp

# Board delete (hard delete for now — soft delete in the frontend):
@app.delete("/api/boards/{board_id}", status_code=204)
async def delete_board(
    board_id: str,
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_current_user)
):
    board = db.query(BoardModel).filter(
        BoardModel.id == board_id,
        BoardModel.owner_id == current_user.id
    ).first()
    
    if board is None:
        raise HTTPException(status_code=404, detail="Board not found")
    
    db.delete(board)
    db.commit()
    return None
```

---

## Step 2 — Add API functions

Add to `src/api/boardsApi.ts`:

```ts
export async function updateBoard(boardId: string, updates: { title?: string }): Promise<ApiBoard> {
  const response = await fetch(`${API_BASE}/api/boards/${boardId}`, {
    method: 'PATCH',
    headers: getAuthHeaders(),
    body: JSON.stringify(updates),
  });
  if (response.status === 401) throw new Error('UNAUTHORIZED');
  if (!response.ok) throw new Error(`Failed to update board: HTTP ${response.status}`);
  return response.json() as Promise<ApiBoard>;
}

export async function deleteBoard(boardId: string): Promise<void> {
  const response = await fetch(`${API_BASE}/api/boards/${boardId}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  if (response.status === 401) throw new Error('UNAUTHORIZED');
  if (!response.ok) throw new Error(`Failed to delete board: HTTP ${response.status}`);
}
```

---

## Step 3 — Editable board title in the header

Create `src/components/EditableBoardTitle.tsx`:

```tsx
// src/components/EditableBoardTitle.tsx

import { useState, useRef, useEffect } from 'react';
import './EditableBoardTitle.css';

interface EditableBoardTitleProps {
  title: string;
  onSave: (newTitle: string) => void;
}

export function EditableBoardTitle({ title, onSave }: EditableBoardTitleProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [value, setValue] = useState(title);
  const inputRef = useRef<HTMLInputElement>(null);

  // Sync value if title changes (e.g., after server confirmation)
  useEffect(() => {
    if (!isEditing) setValue(title);
  }, [title, isEditing]);

  // Focus and select when editing starts
  useEffect(() => {
    if (isEditing) {
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [isEditing]);

  function handleClick() {
    setValue(title);
    setIsEditing(true);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter') commit();
    if (e.key === 'Escape') cancel();
  }

  function commit() {
    const trimmed = value.trim();
    if (trimmed && trimmed !== title) {
      onSave(trimmed);
    }
    setIsEditing(false);
  }

  function cancel() {
    setValue(title);
    setIsEditing(false);
  }

  if (isEditing) {
    return (
      <input
        ref={inputRef}
        className="board-title-edit-input"
        value={value}
        onChange={e => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={commit}
      />
    );
  }

  return (
    <span
      className="board-title-text board-title-text--editable"
      onClick={handleClick}
      title="Click to rename"
    >
      {title}
    </span>
  );
}
```

Create `src/components/EditableBoardTitle.css`:

```css
.board-title-text--editable {
  cursor: pointer;
  border-radius: 4px;
  padding: 2px 6px;
  transition: background 0.15s;
}

.board-title-text--editable:hover {
  background: rgba(255,255,255,0.1);
}

.board-title-edit-input {
  font-size: 16px;
  font-weight: 600;
  color: white;
  background: rgba(255,255,255,0.15);
  border: 2px solid rgba(255,255,255,0.4);
  border-radius: 4px;
  padding: 2px 8px;
  outline: none;
  min-width: 120px;
  max-width: 300px;
}
```

---

## Step 4 — Add delete board with undo to `useBoardState`

Add the soft-delete/undo state to `useBoardState.ts`:

```ts
// Pending deletes: boardId -> timeout ID
const pendingDeletesRef = useRef<Record<string, ReturnType<typeof setTimeout>>>({});
const [deletedBoardIds, setDeletedBoardIds] = useState<Set<string>>(new Set());
const [undoMessage, setUndoMessage] = useState<{ boardId: string; title: string } | null>(null);

async function handleRenameBoard(boardId: string, newTitle: string): Promise<void> {
  // Optimistic update
  setBoards(prev => prev.map(b => b.id === boardId ? { ...b, title: newTitle } : b));
  try {
    await updateBoardApi(boardId, { title: newTitle });
  } catch (err) {
    // Rollback
    setBoards(prev => prev);  // re-fetch would be cleaner — simplified here
    showError('Failed to rename board.');
  }
}

function handleDeleteBoard(boardId: string): void {
  const board = boards.find(b => b.id === boardId);
  if (!board) return;

  // Mark as deleted in UI immediately (optimistic)
  setDeletedBoardIds(prev => new Set([...prev, boardId]));
  setUndoMessage({ boardId, title: board.title });

  // Schedule permanent delete after 5 seconds
  const timeout = setTimeout(async () => {
    setUndoMessage(null);
    setBoards(prev => prev.filter(b => b.id !== boardId));
    try {
      await deleteBoardApi(boardId);
    } catch (err) {
      // If delete fails, restore the board
      setDeletedBoardIds(prev => { const n = new Set(prev); n.delete(boardId); return n; });
      showError('Failed to delete board.');
    }
    delete pendingDeletesRef.current[boardId];
  }, 5000);

  pendingDeletesRef.current[boardId] = timeout;
}

function handleUndoDelete(): void {
  if (!undoMessage) return;
  const { boardId } = undoMessage;
  
  // Cancel the timeout
  clearTimeout(pendingDeletesRef.current[boardId]);
  delete pendingDeletesRef.current[boardId];
  
  // Restore in UI
  setDeletedBoardIds(prev => { const n = new Set(prev); n.delete(boardId); return n; });
  setUndoMessage(null);
}

// In return:
// Filter out boards that are deleted (hidden during undo window)
const visibleBoards = boards.filter(b => !deletedBoardIds.has(b.id));

return {
  boards: visibleBoards,  // filtered
  // ...
  undoMessage,
  handleRenameBoard,
  handleDeleteBoard,
  handleUndoDelete,
};
```

---

## Step 5 — Show the undo toast

In `BoardPage.tsx`, show the undo toast:

```tsx
const { ..., undoMessage, handleDeleteBoard, handleUndoDelete } = useBoardState(boardId!);

// In JSX:
{undoMessage && (
  <div className="undo-toast">
    <span>"{undoMessage.title}" deleted.</span>
    <button onClick={handleUndoDelete}>Undo</button>
  </div>
)}
```

Add to `App.css`:

```css
.undo-toast {
  position: fixed;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  background: #2d3748;
  color: white;
  padding: 12px 20px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  gap: 16px;
  z-index: 1000;
  box-shadow: 0 4px 12px rgba(0,0,0,0.3);
  font-size: 14px;
}

.undo-toast button {
  background: none;
  border: 1px solid rgba(255,255,255,0.4);
  color: white;
  padding: 4px 10px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
}

.undo-toast button:hover { background: rgba(255,255,255,0.1); }
```

### SAVE AND TRY

1. Click the board title in the header — it becomes an editable input
2. Type a new name and press Enter — the title updates and the API call is made
3. Click Delete in the sidebar — the board disappears with an undo toast
4. Click Undo within 5 seconds — the board reappears
5. Delete again and wait 5 seconds — the board is permanently removed (API call fires)

---

## 🎯 Challenge: Show a countdown timer in the undo toast

**You know:** `useState`, `useEffect`, `setInterval`, the undo pattern

**Task:** The undo toast currently shows "Undo" with no time indication. Add a countdown: "Undo (4s)" counting down to "Undo (0s)" before the toast disappears.

**Hints:**
- Track countdown with `useState<number>(5)` initialized when `undoMessage` appears
- `setInterval` in a `useEffect` that runs when `undoMessage` changes
- Clear the interval in the cleanup function
- Display: `Undo (${countdown}s)`

---

<details>
<summary>▶ Show Solution</summary>

In the component that shows the undo toast:
```tsx
const [countdown, setCountdown] = useState(5);

useEffect(() => {
  if (!undoMessage) return;
  setCountdown(5);
  
  const interval = setInterval(() => {
    setCountdown(prev => {
      if (prev <= 1) {
        clearInterval(interval);
        return 0;
      }
      return prev - 1;
    });
  }, 1000);
  
  return () => clearInterval(interval);
}, [undoMessage]);

// In toast JSX:
<button onClick={handleUndoDelete}>Undo ({countdown}s)</button>
```

**Key insight:** The `setInterval` in a `useEffect` is a common pattern, but it has a subtle issue: the interval callback captures the initial value of `countdown` (0 from state initialization) due to JavaScript closures. The fix is to use the functional form of `setState`: `setCountdown(prev => prev - 1)` — this always uses the latest value, not the captured one. This "stale closure" problem is one of the most common bugs in React hooks code with `setInterval`.

</details>

---

## Final Check

| Feature | How to Verify |
|---|---|
| Clicking board title starts edit | Click header title → input appears |
| Enter saves the new title | Type new name → Enter → title updated |
| Escape cancels without saving | Type new name → Escape → original title restored |
| Title update sent to API | Check `/docs` or network tab |
| Delete board shows undo toast | Click delete → toast appears |
| Undo restores the board | Click Undo within 5 seconds → board back |
| Board permanently deleted after 5 seconds | Delete → wait 5s → board gone from server |
| `PATCH /api/boards/{id}` works | Test in `/docs` |
| `DELETE /api/boards/{id}` works | Test in `/docs` |
| `useRef` used for input focus | Check EditableBoardTitle.tsx |
| No TypeScript errors | Problems panel clean |

---

## Quick Check Answers

**1. Two advantages of soft delete over hard delete:**

First, **undo capability** — the record is marked as deleted but not gone; you can reverse the operation by clearing the `deleted_at` field. This is essential for user-facing deletion where mistakes are common. Second, **audit trail** — you know what was deleted and when. In compliance-heavy domains (finance, healthcare), you may be required to retain deletion records. Soft delete is also useful for debugging: a user says "I deleted something important" and you can look at deleted records rather than the application logs.

**2. What does `useRef` let you do that state does not?**

`useRef` gives you a mutable container that does not trigger re-renders when changed. When you set `inputRef.current?.focus()`, nothing re-renders — you're just calling a DOM method directly. If you had `const [isFocused, setIsFocused] = useState(false)` and `useEffect(() => { if (isFocused) inputRef.current?.focus(); }, [isFocused])`, you'd need an extra render cycle, which introduces a timing gap where the input exists in the DOM but isn't focused yet. `useRef` eliminates this indirection: get the DOM element directly, call methods on it directly.

**3. Should undo still work if the user adds a card 2 seconds after clicking delete?**

The undo mechanism (a `setTimeout`) doesn't know about card additions. If you undo at second 2, the board (with any new cards) reappears — including cards added during the undo window. This is fine for a simple implementation. Complications in a real collaborative system: another user might be viewing and editing the "deleted" board during the undo window. The soft-delete pattern handles this gracefully — the board still exists in the database, so concurrent edits to it still work. When the delete is committed (or undone), consistency is restored.

---

## Next Lab

In **LAB-24**, you will add card descriptions — a longer text field that appears when you click a card. This introduces the **modal pattern**: a React Portal that renders outside the normal component tree, keyboard trap (focus management), and `useReducer` for managing multi-field form state.
