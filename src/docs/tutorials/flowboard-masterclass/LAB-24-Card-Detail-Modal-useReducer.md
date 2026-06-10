# FlowBoard Masterclass — LAB 24 — Card Detail Modal: React Portals and `useReducer`

**Prerequisites:** LAB-23 — Board renaming and soft delete. Full CRUD via API.

**What this lab adds:**
- React Portals — rendering outside the component tree
- The modal pattern — backdrop, focus trap, keyboard escape
- `useReducer` — managing multi-field form state with actions
- Card detail view — title + description editing in a modal
- `aria-modal`, `role="dialog"` — basic accessibility

**Time:** 75–90 minutes

---

> **Quick Check — try to answer before reading further:**
>
> 1. A modal overlays the entire screen. Why is it important that it renders in a portal (at `document.body`) rather than inside the component tree? What visual problem does rendering it inside the component tree cause?
> 2. `useReducer` is an alternative to `useState` for complex state. When would you prefer `useReducer` over multiple `useState` calls?
> 3. When a modal is open, pressing Tab should cycle through only the modal's interactive elements — not the content behind it. This is called a "focus trap." Why is it important for accessibility?
>
> *(Answers at the end of this lab)*

---

## What You Will Build

Clicking a card (not the action buttons, but the card body) opens a full modal with the card title and description as editable fields. The modal has a backdrop (clicking outside closes it), Escape closes it, and changes are saved via PATCH on close.

---

## Concept: React Portals

**The problem:**

```tsx
// Card is deeply nested:
<Board>
  <List>
    <Card />  ← modal renders here, INSIDE this chain
```

The modal's CSS requires `position: fixed` to overlay the whole screen. But if any ancestor has `transform`, `filter`, or `overflow: hidden`, `position: fixed` is contained to that ancestor, not the viewport. The backdrop and centering break.

**The portal solution:**

```tsx
import { createPortal } from 'react-dom';

function Modal({ children }) {
  return createPortal(
    <div className="modal-backdrop">{children}</div>,
    document.body  // render here, outside the component tree
  );
}
```

The component `<Modal>` is inside the React component tree (its events and context still work). But the DOM output is at `document.body` — no ancestor transforms or overflow constraints apply.

**You will see this again in:** Tooltips, dropdowns, notification toasts, dialogs — anything that must overlay the full viewport regardless of where it's used in the component tree.

---

## Concept: `useReducer` for Form State

**When multiple `useState` calls become awkward:**

```tsx
// Managing a form with 3 fields + loading + error:
const [title, setTitle] = useState('');
const [description, setDescription] = useState('');
const [isSaving, setIsSaving] = useState(false);
const [error, setError] = useState<string | null>(null);

// To save: need to coordinate 3 state updates atomically
setIsSaving(true);
setError(null);  // 2 updates → 2 re-renders (or React batches them in newer versions)
```

**With `useReducer` — one object, one update:**

```tsx
type FormState = {
  title: string;
  description: string;
  isSaving: boolean;
  error: string | null;
};

type FormAction =
  | { type: 'SET_TITLE'; payload: string }
  | { type: 'SET_DESCRIPTION'; payload: string }
  | { type: 'SAVE_START' }
  | { type: 'SAVE_SUCCESS' }
  | { type: 'SAVE_ERROR'; payload: string };

function formReducer(state: FormState, action: FormAction): FormState {
  switch (action.type) {
    case 'SET_TITLE':
      return { ...state, title: action.payload };
    case 'SET_DESCRIPTION':
      return { ...state, description: action.payload };
    case 'SAVE_START':
      return { ...state, isSaving: true, error: null };  // always one update
    case 'SAVE_SUCCESS':
      return { ...state, isSaving: false };
    case 'SAVE_ERROR':
      return { ...state, isSaving: false, error: action.payload };
    default:
      return state;
  }
}

const [state, dispatch] = useReducer(formReducer, { title: '', description: '', isSaving: false, error: null });
```

Benefits:
- All state is one object — impossible to forget updating one field
- Actions are explicit — `SAVE_START` clearly documents what's happening
- Reducer is testable without React — just call `formReducer(state, action)`

**When to prefer `useReducer`:** When you have 3+ related state values, when state transitions are complex (multiple values change together), or when the logic benefits from explicit action names.

**You will see this again in:** Lab 30 (Zustand store), Lab 32 (complex filter state). `useReducer` is the foundation of Redux, Zustand, and other state management libraries.

---

## Step 1 — Create the Modal component

Create `src/components/Modal.tsx`:

```tsx
// src/components/Modal.tsx
// A generic modal that renders via a React Portal.

import { useEffect, ReactNode } from 'react';
import { createPortal } from 'react-dom';
import './Modal.css';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}

export function Modal({ isOpen, onClose, title, children }: ModalProps) {
  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Prevent body scroll while modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  if (!isOpen) return null;

  return createPortal(
    <div
      className="modal-backdrop"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <div className="modal-content">
        <div className="modal-header">
          <h2 className="modal-title">{title}</h2>
          <button
            className="modal-close-btn"
            onClick={onClose}
            aria-label="Close modal"
          >
            ×
          </button>
        </div>
        {children}
      </div>
    </div>,
    document.body
  );
}
```

Create `src/components/Modal.css`:

```css
.modal-backdrop {
  position: fixed;
  inset: 0;                           /* top: 0; right: 0; bottom: 0; left: 0 */
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding-top: 80px;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 12px;
  width: 560px;
  max-width: calc(100vw - 40px);
  max-height: calc(100vh - 120px);
  overflow-y: auto;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.4);
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px 0 24px;
}

.modal-title {
  font-size: 18px;
  font-weight: 600;
  color: #1a202c;
  margin: 0;
}

.modal-close-btn {
  background: none;
  border: none;
  font-size: 24px;
  color: #718096;
  cursor: pointer;
  padding: 0;
  line-height: 1;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
}

.modal-close-btn:hover { background: #f7fafc; color: #2d3748; }
```

---

## Step 2 — Create the Card Detail modal with `useReducer`

Create `src/components/CardDetailModal.tsx`:

```tsx
// src/components/CardDetailModal.tsx

import { useReducer, useEffect } from 'react';
import { Modal } from './Modal';
import { Card } from '../types';
import './CardDetailModal.css';

// --- State and actions for the form ---

interface CardFormState {
  title: string;
  description: string;
  isDirty: boolean;  // has the user changed anything?
  isSaving: boolean;
  error: string | null;
}

type CardFormAction =
  | { type: 'INIT'; card: Card }
  | { type: 'SET_TITLE'; value: string }
  | { type: 'SET_DESCRIPTION'; value: string }
  | { type: 'SAVE_START' }
  | { type: 'SAVE_SUCCESS' }
  | { type: 'SAVE_ERROR'; error: string };

function cardFormReducer(state: CardFormState, action: CardFormAction): CardFormState {
  switch (action.type) {
    case 'INIT':
      return {
        title: action.card.title,
        description: action.card.description,
        isDirty: false,
        isSaving: false,
        error: null,
      };
    case 'SET_TITLE':
      return { ...state, title: action.value, isDirty: true };
    case 'SET_DESCRIPTION':
      return { ...state, description: action.value, isDirty: true };
    case 'SAVE_START':
      return { ...state, isSaving: true, error: null };
    case 'SAVE_SUCCESS':
      return { ...state, isSaving: false, isDirty: false };
    case 'SAVE_ERROR':
      return { ...state, isSaving: false, error: action.error };
    default:
      return state;
  }
}

// --- Component ---

interface CardDetailModalProps {
  card: Card | null;
  listId: string | null;
  onClose: () => void;
  onUpdate: (listId: string, cardId: string, updates: { title?: string; description?: string }) => Promise<void>;
  onDelete: (listId: string, cardId: string) => void;
}

export function CardDetailModal({ card, listId, onClose, onUpdate, onDelete }: CardDetailModalProps) {
  const [state, dispatch] = useReducer(cardFormReducer, {
    title: '',
    description: '',
    isDirty: false,
    isSaving: false,
    error: null,
  });

  // Initialize form when card changes
  useEffect(() => {
    if (card) dispatch({ type: 'INIT', card });
  }, [card?.id]);  // re-init if a different card is opened

  async function handleSave() {
    if (!card || !listId || !state.isDirty) return;
    if (!state.title.trim()) {
      dispatch({ type: 'SAVE_ERROR', error: 'Title cannot be empty.' });
      return;
    }

    dispatch({ type: 'SAVE_START' });
    try {
      await onUpdate(listId, card.id, {
        title: state.title.trim(),
        description: state.description,
      });
      dispatch({ type: 'SAVE_SUCCESS' });
    } catch (err) {
      dispatch({ type: 'SAVE_ERROR', error: 'Failed to save changes.' });
    }
  }

  function handleClose() {
    if (state.isDirty) {
      // Auto-save on close
      handleSave().then(() => onClose());
    } else {
      onClose();
    }
  }

  function handleDelete() {
    if (!card || !listId) return;
    if (confirm(`Delete card "${card.title}"?`)) {
      onDelete(listId, card.id);
      onClose();
    }
  }

  return (
    <Modal isOpen={card !== null} onClose={handleClose} title="Card Details">
      {card && (
        <div className="card-detail">
          <div className="card-detail-field">
            <label className="card-detail-label">Title</label>
            <input
              className="card-detail-input"
              value={state.title}
              onChange={e => dispatch({ type: 'SET_TITLE', value: e.target.value })}
              placeholder="Card title"
            />
          </div>

          <div className="card-detail-field">
            <label className="card-detail-label">Description</label>
            <textarea
              className="card-detail-textarea"
              value={state.description}
              onChange={e => dispatch({ type: 'SET_DESCRIPTION', value: e.target.value })}
              placeholder="Add a more detailed description..."
              rows={6}
            />
          </div>

          {state.error && <p className="card-detail-error">{state.error}</p>}

          <div className="card-detail-footer">
            <button
              className="card-detail-delete-btn"
              onClick={handleDelete}
              disabled={state.isSaving}
            >
              Delete Card
            </button>
            <div className="card-detail-actions">
              {state.isDirty && (
                <button
                  className="card-detail-save-btn"
                  onClick={handleSave}
                  disabled={state.isSaving}
                >
                  {state.isSaving ? 'Saving...' : 'Save Changes'}
                </button>
              )}
              <button className="card-detail-close-btn" onClick={handleClose}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </Modal>
  );
}
```

Create `src/components/CardDetailModal.css`:

```css
.card-detail {
  padding: 20px 24px 24px 24px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.card-detail-field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.card-detail-label {
  font-size: 12px;
  font-weight: 600;
  color: #718096;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.card-detail-input {
  padding: 8px 12px;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  font-size: 16px;
  outline: none;
  font-weight: 500;
}

.card-detail-input:focus {
  border-color: #4299e1;
  box-shadow: 0 0 0 3px rgba(66,153,225,0.15);
}

.card-detail-textarea {
  padding: 8px 12px;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  font-size: 14px;
  outline: none;
  resize: vertical;
  font-family: inherit;
  line-height: 1.5;
}

.card-detail-textarea:focus {
  border-color: #4299e1;
  box-shadow: 0 0 0 3px rgba(66,153,225,0.15);
}

.card-detail-error {
  color: #e53e3e;
  font-size: 13px;
  margin: 0;
}

.card-detail-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 8px;
  border-top: 1px solid #e2e8f0;
}

.card-detail-actions {
  display: flex;
  gap: 8px;
}

.card-detail-save-btn {
  background: #4299e1;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
}

.card-detail-save-btn:hover:not(:disabled) { background: #3182ce; }
.card-detail-save-btn:disabled { opacity: 0.6; }

.card-detail-close-btn {
  background: #edf2f7;
  color: #4a5568;
  border: none;
  padding: 8px 16px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
}

.card-detail-close-btn:hover { background: #e2e8f0; }

.card-detail-delete-btn {
  background: none;
  color: #e53e3e;
  border: 1px solid #fed7d7;
  padding: 8px 16px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
}

.card-detail-delete-btn:hover { background: #fff5f5; }
```

---

## Step 3 — Add modal state to `useBoardState` and wire Card click

Add to `useBoardState.ts`:

```ts
const [selectedCard, setSelectedCard] = useState<{ card: Card; listId: string } | null>(null);

function handleOpenCard(listId: string, card: Card) {
  setSelectedCard({ card, listId });
}

function handleCloseCard() {
  setSelectedCard(null);
}

// Return:
return {
  // ...
  selectedCard,
  handleOpenCard,
  handleCloseCard,
};
```

In `Card.tsx`, add an `onClick` to the card body (not the action buttons):

```tsx
<div className="card" onClick={(e) => {
  // Only open if clicking the card body, not action buttons
  if ((e.target as HTMLElement).closest('.card-actions')) return;
  props.onOpen?.(props.id);
}}>
```

Add `onOpen?: (id: string) => void` to `CardProps`.

In `BoardPage.tsx`, wire the modal:

```tsx
const { ..., selectedCard, handleOpenCard, handleCloseCard, handleUpdateCard } = useBoardState(boardId!);

// In JSX:
<CardDetailModal
  card={selectedCard?.card ?? null}
  listId={selectedCard?.listId ?? null}
  onClose={handleCloseCard}
  onUpdate={handleUpdateCard}
  onDelete={handleDeleteCard}
/>
```

### SAVE AND TRY

Click a card body (not the arrow or delete buttons) — the modal opens with the card's title and description. Edit the description. Close — the changes are saved. Check the server response.

---

## 🎯 Challenge: Show the card's creation date in the modal

**You know:** The `Card` interface has a `createdAt` timestamp (milliseconds since epoch). The modal has access to the card.

**Task:** Show the creation date in the modal footer: "Created: Dec 15, 2024 at 3:42 PM". Use the `Intl.DateTimeFormat` API (built into browsers) to format it.

**Hints:**
- `new Date(card.createdAt)` converts the timestamp to a Date object
- `new Intl.DateTimeFormat('en-US', { dateStyle: 'medium', timeStyle: 'short' }).format(date)`
- Add it to the modal footer between the delete button and the action buttons

---

<details>
<summary>▶ Show Solution</summary>

```tsx
// In CardDetailModal.tsx, add to the footer:
<span className="card-detail-created">
  Created: {new Intl.DateTimeFormat('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short'
  }).format(new Date(card.createdAt))}
</span>
```

In CSS:
```css
.card-detail-created {
  font-size: 11px;
  color: #a0aec0;
}
```

**Key insight:** `Intl.DateTimeFormat` is the modern, correct way to format dates in JavaScript. It automatically respects the user's locale — the same timestamp displayed as "Dec 15, 2024 at 3:42 PM" in the US would appear as "15 déc. 2024, 15:42" in France. Avoid `toLocaleString()` (inconsistent across environments) and avoid manual date formatting (`month[date.getMonth()]`) — both are error-prone.

</details>

---

## Final Check

| Feature | How to Verify |
|---|---|
| Clicking card body opens modal | Click card (not buttons) → modal appears |
| Escape closes modal | Press Escape while modal open |
| Clicking backdrop closes modal | Click outside the modal panel |
| Title is editable | Edit title in modal |
| Description is editable | Edit description in modal |
| Close auto-saves if dirty | Edit description → Close → changes saved |
| Save button visible when dirty | Edit field → Save button appears |
| Delete shows confirmation | Click Delete → confirm dialog |
| Modal renders at `document.body` | Inspect element → modal is direct child of body |
| Body scroll prevented while modal open | Open modal → try to scroll body |
| `useReducer` used for form state | Check CardDetailModal.tsx |
| No TypeScript errors | Problems panel clean |

---

## Quick Check Answers

**1. Why must modals render in a portal?**

If the modal renders inside the component tree (e.g., inside `<List>` which is inside a column with `overflow: hidden`), the modal is visually clipped to the column's bounds. `position: fixed` normally positions relative to the viewport — but if any ancestor has `transform: translateX(...)` or `will-change: transform`, the fixed-position element becomes contained to that ancestor instead of the viewport. By rendering at `document.body`, the modal has no ancestors with these styles. The portal maintains the React event and context hierarchy (so `useContext` works correctly from inside the modal) while escaping the DOM hierarchy for rendering.

**2. When to prefer `useReducer` over `useState`:**

Prefer `useReducer` when: (1) you have multiple state values that must update together atomically (like `SAVE_START` setting `isSaving: true` and `error: null` in one action), (2) the next state depends on complex logic involving multiple current values, (3) you want explicit, named transitions that document what's happening (`SAVE_START` is clearer than two separate `setX(true)`/`setY(null)` calls). Prefer multiple `useState` for simple, independent values.

**3. Why is a focus trap important for accessibility?**

Screen reader users and keyboard-only users navigate by pressing Tab. Without a focus trap, Tab from the last interactive element in the modal cycles back to the first focusable element in the page body — the modal is still visible but Tab has escaped it. For screen reader users, this means announcing elements from behind the modal backdrop, which is confusing and broken. The `aria-modal="true"` attribute tells screen readers to treat the modal as a modal and ignore content behind it. A proper focus trap (which our simple implementation does not fully implement) also prevents focus from leaving the modal via Tab.

---

## Next Lab

In **LAB-25**, you will add drag-and-drop card reordering within and between lists. Starting from scratch with pointer events (to understand the mechanism), then replacing with `dnd-kit` — the production-ready drag-and-drop library for React. You will learn about drag handles, drop targets, collision detection, and the visual feedback of items being dragged.
