# FlowBoard Masterclass — LAB 18 — PATCH, PUT, and Error Handling

**Prerequisites:** LAB-17 — POST creates cards optimistically. Backend has create/delete/move endpoints.

**What this lab adds:**
- HTTP PATCH vs PUT — partial vs full update
- Editing a card's title inline — clicking to edit, pressing Enter to save
- `PATCH /api/boards/{boardId}/lists/{listId}/cards/{cardId}`
- Error types — network error vs HTTP error vs validation error
- Fetch error handling hierarchy — where to catch, what to show
- Stale data — detecting when the server has newer data

**Time:** 65–80 minutes

---

> **Quick Check — try to answer before reading further:**
>
> 1. `PUT /api/cards/1` with body `{"title": "New title"}` vs `PATCH /api/cards/1` with body `{"title": "New title"}`. What is the difference in what each is supposed to do?
> 2. When you call `fetch(...)` and the server returns a 500 error, does `fetch` throw an exception? What about if the server is completely unreachable?
> 3. You are editing a card title. At the same moment, another user deletes that card. When you press Save, what should happen?
>
> *(Answers at the end of this lab)*

---

## What You Will Build

Cards become editable inline. Clicking a card title turns it into an `<input>`. Pressing Enter (or clicking outside) saves the change via PATCH. Errors are categorized and shown contextually — a card-level error appears on the card, not as a global toast.

---

## Concept: PUT vs PATCH

**PUT — replace the resource:**

```http
PUT /api/boards/1/lists/list-todo/cards/card-1
Content-Type: application/json

{"id": "card-1", "title": "New title", "description": "Must send all fields", "createdAt": 1700000000000}
```

PUT replaces the entire resource. If you only send `{"title": "New title"}` with PUT, you are (by REST convention) replacing the card with a card that has only a title — all other fields become null/missing.

**PATCH — update specified fields:**

```http
PATCH /api/boards/1/lists/list-todo/cards/card-1
Content-Type: application/json

{"title": "New title"}
```

PATCH updates only the fields you provide. Unmentioned fields are unchanged. This is almost always what you want for "edit one field" operations.

**When to use which:**
- PATCH: "I want to update only this field"
- PUT: "I'm replacing the whole object" (rare in frontend apps)
- In practice, many APIs use PUT for partial updates too (it's common to be informal about this)

**You will see this again in:** Card title editing (this lab), board renaming (Lab 11 will be updated), card description editing (coming in Lab 25).

---

## Concept: Error Handling Hierarchy

**Three distinct error types:**

```
Level 1: Network error — server unreachable
  fetch(...) throws an exception (TypeError: Failed to fetch)
  
Level 2: HTTP error — server responded, but with an error status
  response.ok === false (status 4xx or 5xx)
  fetch does NOT throw — you must check response.ok
  
Level 3: Validation error — server responded 422 Unprocessable Entity
  FastAPI sends detailed error info in the response body
  { "detail": [{ "loc": [...], "msg": "..." }] }
```

**The correct pattern:**

```js
try {
  const response = await fetch(...);
  
  // Level 2: check HTTP status
  if (!response.ok) {
    if (response.status === 404) {
      // specific handling: card was deleted by someone else
    } else if (response.status === 422) {
      const err = await response.json();
      // show validation error
    } else {
      throw new Error(`Server error: ${response.status}`);
    }
    return;
  }
  
  const data = await response.json();
  // success path
  
} catch (err) {
  // Level 1: network error
  // Only reaches here for TypeError (unreachable) or if we threw above
  showError(String(err));
}
```

**Where to show errors:**

- Global toast: server-wide failures (can't connect)
- Component-level: operation-specific failures (card not found)
- Field-level: validation failures (title too long)

**You will see this again in:** Every API call. Auth errors (401 → redirect to login in Lab 21), not-found errors (404 → redirect), validation errors (422 → show next to form field). Error handling is the difference between a professional app and a toy.

---

## Step 1 — Add the PATCH endpoint

Update `backend/main.py`:

```python
# Add model:
class UpdateCardRequest(BaseModel):
    title: str | None = None
    description: str | None = None

# Add route:
@app.patch(
    "/api/boards/{board_id}/lists/{list_id}/cards/{card_id}",
    response_model=CardData
)
async def update_card(
    board_id: str,
    list_id: str,
    card_id: str,
    request: UpdateCardRequest
):
    """Update one or more fields on a card."""
    board = next((b for b in boards if b["id"] == board_id), None)
    if board is None:
        raise HTTPException(status_code=404, detail=f"Board '{board_id}' not found")

    lst = next((l for l in board["lists"] if l["id"] == list_id), None)
    if lst is None:
        raise HTTPException(status_code=404, detail=f"List '{list_id}' not found")

    card = next((c for c in lst["cards"] if c["id"] == card_id), None)
    if card is None:
        raise HTTPException(status_code=404, detail=f"Card '{card_id}' not found")

    # Apply only the provided fields
    if request.title is not None:
        if len(request.title.strip()) == 0:
            raise HTTPException(status_code=422, detail="Title cannot be empty")
        card["title"] = request.title.strip()

    if request.description is not None:
        card["description"] = request.description

    return card
```

### SAVE AND TRY

Visit `http://localhost:8000/docs`. Test the PATCH endpoint — send `{"title": "Updated!"}` and confirm only the title changes. Send `{}` — no changes. Send `{"title": ""}` — receive a 422 error.

---

## Step 2 — Add `updateCard` to `boardsApi.ts`

```ts
// src/api/boardsApi.ts

export async function updateCard(
  boardId: string,
  listId: string,
  cardId: string,
  updates: { title?: string; description?: string }
): Promise<ApiCard> {
  const response = await fetch(
    `${API_BASE}/api/boards/${boardId}/lists/${listId}/cards/${cardId}`,
    {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    }
  );

  if (response.status === 404) {
    throw new Error('CARD_NOT_FOUND');  // specific error code
  }

  if (response.status === 422) {
    const err = await response.json();
    throw new Error(`VALIDATION:${err.detail}`);  // validation message
  }

  if (!response.ok) {
    throw new Error(`SERVER_ERROR:${response.status}`);
  }

  return response.json() as Promise<ApiCard>;
}
```

---

## Step 3 — Make card titles editable

Update `Card.tsx` to support inline editing:

```tsx
// Card.tsx — add inline editing

import { useState, useRef, useEffect } from 'react';

interface CardProps extends Card {
  listId: string;
  onDelete?: (id: string) => void;
  onMoveLeft?: (id: string) => void;
  onMoveRight?: (id: string) => void;
  onUpdate?: (id: string, updates: { title?: string; description?: string }) => void;
  saveError?: string | null;
}

export function Card(props: CardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(props.title);
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus the input when editing starts
  useEffect(() => {
    if (isEditing) {
      inputRef.current?.focus();
      inputRef.current?.select();  // select all text for quick replacement
    }
  }, [isEditing]);

  function handleTitleClick() {
    setEditValue(props.title);
    setIsEditing(true);
  }

  function handleEditKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter') commitEdit();
    if (e.key === 'Escape') cancelEdit();
  }

  function commitEdit() {
    const trimmed = editValue.trim();
    if (trimmed && trimmed !== props.title) {
      props.onUpdate?.(props.id, { title: trimmed });
    }
    setIsEditing(false);
  }

  function cancelEdit() {
    setEditValue(props.title);
    setIsEditing(false);
  }

  return (
    <div className="card">
      <div className="card-content">
        {isEditing ? (
          <input
            ref={inputRef}
            className="card-title-input"
            value={editValue}
            onChange={e => setEditValue(e.target.value)}
            onKeyDown={handleEditKeyDown}
            onBlur={commitEdit}
          />
        ) : (
          <p className="card-title" onClick={handleTitleClick} title="Click to edit">
            {props.title}
          </p>
        )}
        {props.description && (
          <p className="card-description">{props.description}</p>
        )}
        {props.saveError && (
          <p className="card-error">{props.saveError}</p>
        )}
      </div>
      <div className="card-actions">
        {props.onMoveLeft && (
          <button className="card-action-btn" onClick={() => props.onMoveLeft!(props.id)} title="Move left">←</button>
        )}
        {props.onMoveRight && (
          <button className="card-action-btn" onClick={() => props.onMoveRight!(props.id)} title="Move right">→</button>
        )}
        {props.onDelete && (
          <button className="card-action-btn card-delete-btn" onClick={() => props.onDelete!(props.id)} title="Delete">×</button>
        )}
      </div>
    </div>
  );
}
```

Add styles to `Card.css`:

```css
.card-title {
  cursor: pointer;
  margin: 0;
  font-size: 14px;
  font-weight: 500;
  color: #2d3748;
}

.card-title:hover {
  text-decoration: underline;
  text-underline-offset: 2px;
}

.card-title-input {
  width: 100%;
  font-size: 14px;
  font-weight: 500;
  border: 2px solid #4299e1;
  border-radius: 4px;
  padding: 2px 4px;
  outline: none;
  box-sizing: border-box;
}

.card-error {
  font-size: 11px;
  color: #e53e3e;
  margin: 4px 0 0 0;
}
```

---

## Step 4 — Add `handleUpdateCard` to `useBoardState`

```ts
// useBoardState.ts — add a card errors map

const [cardErrors, setCardErrors] = useState<Record<string, string>>({});

function setCardError(cardId: string, message: string) {
  setCardErrors(prev => ({ ...prev, [cardId]: message }));
  setTimeout(() => setCardErrors(prev => {
    const next = { ...prev };
    delete next[cardId];
    return next;
  }), 5000);
}

async function handleUpdateCard(
  listId: string,
  cardId: string,
  updates: { title?: string; description?: string }
): Promise<void> {
  if (!activeBoard) return;

  // Optimistic update
  const boardsBeforeUpdate = boards;
  setBoards(prev => prev.map(board => {
    if (board.id !== selectedBoardId) return board;
    return {
      ...board,
      lists: board.lists.map(list => {
        if (list.id !== listId) return list;
        return {
          ...list,
          cards: list.cards.map(card =>
            card.id === cardId ? { ...card, ...updates } : card
          ),
        };
      }),
    };
  }));

  try {
    await updateCard(activeBoard.id, listId, cardId, updates);
  } catch (err) {
    const message = String(err);
    if (message === 'Error: CARD_NOT_FOUND') {
      setBoards(boardsBeforeUpdate);
      setCardError(cardId, 'Card was deleted by another user.');
    } else if (message.startsWith('Error: VALIDATION:')) {
      setBoards(boardsBeforeUpdate);
      setCardError(cardId, message.replace('Error: VALIDATION:', ''));
    } else {
      setBoards(boardsBeforeUpdate);
      setCardError(cardId, 'Failed to save. Try again.');
    }
  }
}

// Add to return:
return {
  // ... existing ...
  handleUpdateCard,
  cardErrors,
};
```

### SAVE AND TRY

Click a card title to edit. Type a new title. Press Enter — the card updates. Hover over the card to see the change reflected. Check `GET /api/boards` — the server has the new title.

**Test error paths:**
1. Try saving an empty title — the backend returns 422, the card title reverts
2. Stop the server, try to save — the card reverts and shows the error message

---

## 🎯 Challenge: Show a "saved" confirmation

**You know:** Component state, setTimeout, CSS transitions

**Task:** When a card edit is successfully saved, briefly show a "✓ saved" indicator on the card (green, fades out after 1.5 seconds).

**Hints:**
- Add `onUpdate` success callback that triggers a `showSaved` state in Card.tsx
- Or: in `useBoardState`, track recently saved card IDs in a Set, clear them after 1.5s
- CSS: `opacity: 1` → `opacity: 0` with `transition: opacity 0.5s`

---

<details>
<summary>▶ Show Solution</summary>

In `useBoardState.ts`, add:
```ts
const [savedCardIds, setSavedCardIds] = useState<Set<string>>(new Set());

// In handleUpdateCard, after successful API call:
setSavedCardIds(prev => new Set([...prev, cardId]));
setTimeout(() => setSavedCardIds(prev => {
  const next = new Set(prev);
  next.delete(cardId);
  return next;
}), 1500);

// Add to return:
savedCardIds,
```

In `CardProps`, add `justSaved?: boolean`. Pass `savedCardIds.has(card.id)` as the prop.

In `Card.tsx`:
```tsx
{props.justSaved && <span className="card-saved-indicator">✓ saved</span>}
```

In `Card.css`:
```css
@keyframes fade-out {
  from { opacity: 1; }
  to { opacity: 0; }
}

.card-saved-indicator {
  font-size: 11px;
  color: #38a169;
  animation: fade-out 0.5s ease-in 1s forwards;
}
```

**Key insight:** The `animation: fade-out 0.5s ease-in 1s forwards` breaks down as: `fade-out` (the keyframe name), `0.5s` (duration), `ease-in` (timing function), `1s` (delay — show solid for 1 second before fading), `forwards` (keep the end state — opacity:0 — after the animation finishes). Without `forwards`, the element would snap back to opacity:1 after the animation ends.

</details>

---

## Final Check

| Feature | How to Verify |
|---|---|
| `PATCH` endpoint exists and works | Test in `/docs` — update title |
| PATCH returns 422 for empty title | Send `{"title": ""}` in `/docs` |
| Clicking card title starts inline edit | Click title in browser |
| Enter saves the edit | Edit title → press Enter |
| Escape cancels without saving | Edit title → press Escape |
| Blur (click away) saves the edit | Edit title → click elsewhere |
| Optimistic update happens immediately | Title changes before server responds |
| 404 shows card-level error | (Manual: delete card directly in server memory, then edit) |
| Empty title shows validation error | Clear the title input → press Enter |
| `updateCard` in `boardsApi.ts` throws typed error codes | Check the implementation |
| No TypeScript errors | Problems panel clean |

---

## Quick Check Answers

**1. PUT vs PATCH for updating one field:**

`PUT /api/cards/1` with `{"title": "New title"}` is supposed to REPLACE the entire card with `{"title": "New title"}` — the description, createdAt, and id fields would be gone (or defaulted). This is destructive if you only want to update one field. `PATCH /api/cards/1` with `{"title": "New title"}` updates ONLY the title — all other fields remain as they were. For single-field edits, PATCH is always the right choice. In practice, many APIs are informal about this distinction and accept partial bodies on PUT — but the REST specification is clear: PUT replaces, PATCH modifies.

**2. When does `fetch` throw?**

`fetch` throws an exception (specifically a `TypeError: Failed to fetch`) ONLY when the server is completely unreachable — no network connection, DNS resolution failure, refused connection. It does NOT throw for HTTP error status codes (4xx, 5xx). A server returning 500 Internal Server Error gives you a response object with `response.ok === false` and `response.status === 500` — no exception. This surprises almost everyone the first time. You must always check `response.ok` or `response.status` after `await fetch(...)`.

**3. You edited a card that another user deleted:**

The PATCH returns 404 (card not found). The frontend should: (1) roll back the optimistic update (restore the previous state), (2) show a message explaining what happened ("This card was deleted by another user"). The card was optimistically updated to show the new title — rolling back means it disappears from the UI, because from the server's perspective, the card no longer exists. This is a category of "stale data" problems that become more complex in collaborative apps — solutions range from polling (Lab 18 extension) to WebSockets (future lab) to conflict resolution strategies (operational transform).

---

## Next Lab

In **LAB-19**, you will add a real database. Cards and boards will be stored in SQLite using SQLAlchemy's ORM. Data will survive server restarts. You will learn the ORM model pattern, database sessions, and migration from in-memory to persistent storage — with zero changes to the frontend.
