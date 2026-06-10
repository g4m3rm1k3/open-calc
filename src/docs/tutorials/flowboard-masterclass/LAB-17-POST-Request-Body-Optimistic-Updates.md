# FlowBoard Masterclass — LAB 17 — Writing Data: POST, Request Bodies, Optimistic Updates

**Prerequisites:** LAB-16 — Boards fetched from `/api/boards`. Frontend has `src/api/boardsApi.ts`.

**What this lab adds:**
- HTTP POST — sending data to create resources
- Request body — the JSON payload you send with POST/PUT/PATCH
- Optimistic UI updates — showing the result before the server confirms
- Rollback on failure — undoing the optimistic update if the server fails
- Adding cards via API
- Error state in the UI — communicating server errors to the user

**Time:** 65–80 minutes

---

> **Quick Check — try to answer before reading further:**
>
> 1. Currently, adding a card works locally — `handleAddCard` updates React state immediately. If you instead wait for the API response before updating state, what does the user experience? What is better about updating first?
> 2. An optimistic update shows the result immediately, then rolls back on failure. What does "rollback" mean technically — how would you undo the optimistic update?
> 3. A POST request has a "body." What format is this body in for a JSON API, and what HTTP header must you include to tell the server what format it is?
>
> *(Answers at the end of this lab)*

---

## What You Will Build

When the user adds a card, the card appears immediately in the UI (optimistic update). Simultaneously, a POST request goes to the server. If the server succeeds, the server-generated card (with its definitive ID) replaces the optimistic one. If the server fails, the optimistic card is removed and an error message appears.

```
User types title, presses Enter
        │
        ├── Optimistic: card appears immediately in UI with temp ID
        │
        ├── POST /api/boards/{boardId}/lists/{listId}/cards
        │         body: { "title": "...", "description": "" }
        │
        ├── If server responds 201 Created:
        │       Replace temp card with server card (permanent ID)
        │
        └── If server responds error:
                Remove optimistic card from UI
                Show error message
```

---

## Concept: HTTP POST and Request Bodies

**GET vs POST:**

`GET` reads data. It has no body. All parameters go in the URL. Responses are cacheable.

`POST` creates data. It has a body — a payload you send to the server. The server processes it and returns the created resource. Responses are not cached.

**A POST request looks like:**

```http
POST /api/boards/board-1/lists/list-todo/cards HTTP/1.1
Host: localhost:8000
Content-Type: application/json
Content-Length: 52

{"title": "Fix login button", "description": ""}
```

- `Content-Type: application/json` — tells the server the body is JSON, not form data
- The body is a JSON string

**In JavaScript with `fetch`:**

```js
const response = await fetch('/api/boards/board-1/lists/list-todo/cards', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',  // REQUIRED for JSON body
  },
  body: JSON.stringify({ title: 'Fix login button', description: '' }),
});
```

`JSON.stringify()` converts a JavaScript object to a JSON string. The server's JSON parser converts it back to a Python dict.

**You will see this again in:** Every create operation in the app. Login (Lab 21) sends credentials via POST. All "form submission" patterns use POST or PUT.

---

## Concept: Optimistic UI Updates

**The naive approach — wait for server:**

```
User types → sends POST → waits 100–500ms → UI updates
```

Users feel every network delay. For a fast action like adding a card, 200ms latency feels broken.

**The optimistic approach — update first:**

```
User types → UI updates immediately → sends POST → if error: rollback
```

Users get instant feedback. The server request happens in the background. Failures are rare — show an error only when they happen.

**When NOT to use optimistic updates:**

- When the server generates data you need before displaying (e.g., server assigns a ticket number that must be shown)
- When failures are common (e.g., flaky network, business rule validation)
- When the operation is destructive and hard to undo (e.g., deleting an account)

For adding a card: failures are rare, card content is local, and the temporary ID can be replaced. Optimistic update is appropriate.

**The rollback pattern:**

```tsx
async function handleAddCard(listId: string, cardTitle: string) {
  // 1. Save current state before optimistic update
  const previousBoards = boards;
  
  // 2. Optimistic update with temp card
  const tempCard = { id: `temp-${Date.now()}`, title: cardTitle, ... };
  setBoards(applyAddCard(boards, listId, tempCard));
  
  try {
    // 3. API call
    const serverCard = await createCard(boardId, listId, { title: cardTitle });
    
    // 4. Replace temp card with server card
    setBoards(replaceCard(boards, listId, tempCard.id, serverCard));
    
  } catch (err) {
    // 5. Rollback on failure
    setBoards(previousBoards);
    showError('Failed to add card. Try again.');
  }
}
```

**You will see this again in:** Every mutation in the app. Real-time collaborative apps (Notion, Linear, Figma) use this pattern heavily. Libraries like React Query and SWR automate the rollback mechanism.

---

## Step 1 — Add the card creation endpoint to the backend

Update `backend/main.py`:

```python
# Add these models after the existing models:

class CreateCardRequest(BaseModel):
    title: str
    description: str = ""  # default to empty string

class MoveCardRequest(BaseModel):
    from_list_id: str
    to_list_id: str


# Add these routes:

@app.post(
    "/api/boards/{board_id}/lists/{list_id}/cards",
    response_model=CardData,
    status_code=201
)
async def create_card(board_id: str, list_id: str, request: CreateCardRequest):
    """Add a card to a list."""
    import time

    board = next((b for b in boards if b["id"] == board_id), None)
    if board is None:
        raise HTTPException(status_code=404, detail=f"Board '{board_id}' not found")

    lst = next((l for l in board["lists"] if l["id"] == list_id), None)
    if lst is None:
        raise HTTPException(status_code=404, detail=f"List '{list_id}' not found")

    new_card = {
        "id": f"card-{uuid.uuid4().hex[:8]}",
        "title": request.title,
        "description": request.description,
        "createdAt": int(time.time() * 1000),  # milliseconds
    }
    lst["cards"].append(new_card)
    return new_card


@app.delete("/api/boards/{board_id}/lists/{list_id}/cards/{card_id}", status_code=204)
async def delete_card(board_id: str, list_id: str, card_id: str):
    """Delete a card from a list."""
    board = next((b for b in boards if b["id"] == board_id), None)
    if board is None:
        raise HTTPException(status_code=404, detail=f"Board '{board_id}' not found")

    lst = next((l for l in board["lists"] if l["id"] == list_id), None)
    if lst is None:
        raise HTTPException(status_code=404, detail=f"List '{list_id}' not found")

    original_count = len(lst["cards"])
    lst["cards"] = [c for c in lst["cards"] if c["id"] != card_id]
    
    if len(lst["cards"]) == original_count:
        raise HTTPException(status_code=404, detail=f"Card '{card_id}' not found")
    
    return None  # 204 No Content


@app.post(
    "/api/boards/{board_id}/cards/{card_id}/move",
    response_model=BoardData
)
async def move_card(board_id: str, card_id: str, request: MoveCardRequest):
    """Move a card from one list to another."""
    board = next((b for b in boards if b["id"] == board_id), None)
    if board is None:
        raise HTTPException(status_code=404, detail=f"Board '{board_id}' not found")

    # Find and remove from source list
    card = None
    for lst in board["lists"]:
        for c in lst["cards"]:
            if c["id"] == card_id:
                card = c
                break
        if card:
            lst["cards"] = [c for c in lst["cards"] if c["id"] != card_id]
            break

    if card is None:
        raise HTTPException(status_code=404, detail=f"Card '{card_id}' not found")

    # Add to target list
    target_list = next((l for l in board["lists"] if l["id"] == request.to_list_id), None)
    if target_list is None:
        raise HTTPException(status_code=404, detail=f"Target list '{request.to_list_id}' not found")

    target_list["cards"].append(card)
    return board
```

### SAVE AND TRY

Visit `http://localhost:8000/docs`. Use the interactive UI to POST a card to a list. You should see the card appear in the `GET /api/boards` response after creating it.

---

## Step 2 — Add API functions to `boardsApi.ts`

```ts
// src/api/boardsApi.ts — add these functions:

export async function createCard(
  boardId: string,
  listId: string,
  data: { title: string; description: string }
): Promise<ApiCard> {
  const response = await fetch(
    `${API_BASE}/api/boards/${boardId}/lists/${listId}/cards`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }
  );
  if (!response.ok) {
    throw new Error(`Failed to create card: HTTP ${response.status}`);
  }
  return response.json() as Promise<ApiCard>;
}

export async function deleteCard(
  boardId: string,
  listId: string,
  cardId: string
): Promise<void> {
  const response = await fetch(
    `${API_BASE}/api/boards/${boardId}/lists/${listId}/cards/${cardId}`,
    { method: 'DELETE' }
  );
  if (!response.ok) {
    throw new Error(`Failed to delete card: HTTP ${response.status}`);
  }
}

export async function moveCard(
  boardId: string,
  cardId: string,
  fromListId: string,
  toListId: string
): Promise<void> {
  const response = await fetch(
    `${API_BASE}/api/boards/${boardId}/cards/${cardId}/move`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ from_list_id: fromListId, to_list_id: toListId }),
    }
  );
  if (!response.ok) {
    throw new Error(`Failed to move card: HTTP ${response.status}`);
  }
}
```

---

## Step 3 — Update `useBoardState` with optimistic updates

Update the handlers in `useBoardState.ts`:

```ts
// useBoardState.ts — import the new API functions
import { fetchBoards, createBoard, createCard, deleteCard, moveCard as moveCardApi } from '../api/boardsApi';

// Add toast/error state
const [toastError, setToastError] = useState<string | null>(null);

// Helper to show a brief error toast
function showError(message: string) {
  setToastError(message);
  setTimeout(() => setToastError(null), 4000);
}

// Updated handleAddCard with optimistic update:
async function handleAddCard(listId: string, cardTitle: string): Promise<void> {
  if (!activeBoard) return;
  
  const tempId = `temp-${Date.now()}`;
  const tempCard: Card = {
    id: tempId,
    title: cardTitle,
    description: '',
    createdAt: Date.now(),
  };
  
  // Optimistic update
  const boardsBeforeAdd = boards;
  setBoards(prev => prev.map(board => {
    if (board.id !== selectedBoardId) return board;
    return { ...board, lists: addCardToList(board.lists, listId, tempCard) };
  }));

  try {
    const serverCard = await createCard(activeBoard.id, listId, { title: cardTitle, description: '' });
    // Replace temp card with real server card
    setBoards(prev => prev.map(board => {
      if (board.id !== selectedBoardId) return board;
      return {
        ...board,
        lists: board.lists.map(list => {
          if (list.id !== listId) return list;
          return {
            ...list,
            cards: list.cards.map(card => card.id === tempId ? serverCard : card),
          };
        }),
      };
    }));
  } catch (err) {
    // Rollback on failure
    setBoards(boardsBeforeAdd);
    showError('Failed to add card. Is the server running?');
  }
}

// Updated handleDeleteCard with optimistic update:
async function handleDeleteCard(listId: string, cardId: string): Promise<void> {
  if (!activeBoard) return;
  
  const boardsBeforeDelete = boards;
  
  // Optimistic delete
  setBoards(prev => prev.map(board => {
    if (board.id !== selectedBoardId) return board;
    return { ...board, lists: deleteCardFromList(board.lists, listId, cardId) };
  }));

  try {
    await deleteCard(activeBoard.id, listId, cardId);
  } catch (err) {
    setBoards(boardsBeforeDelete);
    showError('Failed to delete card. Try again.');
  }
}

// Updated handleMoveCard with optimistic update:
async function handleMoveCard(cardId: string, fromListId: string, toListId: string): Promise<void> {
  if (!activeBoard) return;

  const boardsBeforeMove = boards;

  // Optimistic move
  setBoards(prev => prev.map(board => {
    if (board.id !== selectedBoardId) return board;
    return { ...board, lists: moveCard(board.lists, cardId, fromListId, toListId) };
  }));

  try {
    await moveCardApi(activeBoard.id, cardId, fromListId, toListId);
  } catch (err) {
    setBoards(boardsBeforeMove);
    showError('Failed to move card. Try again.');
  }
}

// Add toastError to return:
return {
  // ... existing return ...
  toastError,
};
```

---

## Step 4 — Show the error toast in the UI

Add a toast component to `App.tsx`:

```tsx
// In App.tsx, add toastError to destructuring:
const { ..., toastError } = useBoardState();

// Add to JSX (before the closing </div> of app-layout):
{toastError && (
  <div className="toast-error" role="alert">
    {toastError}
  </div>
)}
```

Add toast styles to `App.css`:

```css
.toast-error {
  position: fixed;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  background: #e53e3e;
  color: white;
  padding: 10px 20px;
  border-radius: 8px;
  font-size: 14px;
  z-index: 1000;
  box-shadow: 0 4px 12px rgba(0,0,0,0.3);
  pointer-events: none;
}
```

### SAVE AND TRY

Add a card. It appears instantly (optimistic). Then verify the card appears in `http://localhost:8000/api/boards` — it was saved to the server.

Delete a card. Move a card. Check the server response each time.

**Test rollback:** Stop the backend. Try adding a card — it appears briefly, then disappears and the toast shows "Failed to add card." Start the server again — normal operation.

---

## 🎯 Challenge: Show an "is saving..." indicator on the card while the server request is in-flight

**You know:** Local component state, optimistic updates, temp IDs

**Task:** Cards with IDs starting with `temp-` are not yet confirmed by the server. Add a CSS class `card--saving` to these cards that shows a subtle pulsing opacity animation. When the server confirms and replaces the temp ID, the animation stops.

**Hints:**
- In `Card.tsx`, check `if (props.id.startsWith('temp-'))` to add the class
- CSS `@keyframes` for pulsing: animate `opacity` between 1 and 0.5
- The animation runs until the real card replaces the temp one (instant for fast servers)

---

<details>
<summary>▶ Show Solution</summary>

In `Card.tsx`:
```tsx
const isSaving = props.id.startsWith('temp-');
// In the className:
<div className={`card ${isSaving ? 'card--saving' : ''}`}>
```

In `Card.css`:
```css
@keyframes pulse-opacity {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.6; }
}

.card--saving {
  animation: pulse-opacity 0.8s ease-in-out infinite;
}
```

**Key insight:** Temporary IDs (prefixed with `temp-`) serve as a visual contract: the UI knows this card is in-flight. When the server replaces the temp ID with a permanent one, the `isSaving` check automatically becomes false and the animation stops. This technique of using ID prefixes as a UI signal is a real pattern in collaborative editors and list apps — you can see it in Trello's card creation behavior. The prefix `temp-` is a convention; some teams use a separate `isPending: boolean` field instead.

</details>

---

## Final Check

| Feature | How to Verify |
|---|---|
| `POST /api/boards/{boardId}/lists/{listId}/cards` exists | Test in `/docs` |
| `DELETE` and move card endpoints exist | Test in `/docs` |
| Cards appear immediately on add (optimistic) | Add card — appears before server response |
| Cards saved to server | Check `GET /api/boards` after adding |
| Toast error appears when server is down | Stop server → add card → error toast appears |
| Optimistic add rolls back on failure | Toast + card disappears on server failure |
| Delete card works end-to-end | Delete card → gone from server response |
| Move card works end-to-end | Move card → check `GET /api/boards` |
| `boardsApi.ts` exports `createCard`, `deleteCard`, `moveCard` | Check the file |
| No TypeScript errors | Problems panel clean |

---

## Quick Check Answers

**1. Why is updating the UI before the server responds better?**

Network requests take 50–500ms even on localhost. On a real deployment, this can be 200ms or more. If the UI waits for the server, every user action has a perceptible delay — the interface feels sluggish. Optimistic updates make the UI feel instant because the result appears in the frame after the user's action. The cost is complexity — you must handle the failure case with a rollback. The trade-off is usually worth it for common operations (adding, moving, deleting) where failures are rare.

**2. What does "rollback" mean technically?**

Saving the state before the optimistic update (`const boardsBeforeAdd = boards`), then restoring it with `setBoards(boardsBeforeAdd)` if the API call fails. This works because React state is immutable — you're not mutating objects, so the captured `boardsBeforeAdd` variable holds a clean snapshot that you can restore at any time. This is why immutable state patterns (Lab 09) matter: mutable state cannot be rolled back because the previous values are gone.

**3. What format is the POST body, and what header do you need?**

The body is a JSON string (created by `JSON.stringify()`). The required header is `Content-Type: application/json`. Without this header, many servers will reject the request or fail to parse the body. Some servers also accept `application/x-www-form-urlencoded` or `multipart/form-data` — different formats for different use cases. For API-to-API communication, JSON is standard.

---

## Next Lab

In **LAB-18**, you will complete the API layer with PATCH (updating a card's title or description) and explore error handling patterns — what to show when specific operations fail vs a general server outage. You will also handle the "stale data" problem: what happens when another user changes the server data while you are viewing it.
