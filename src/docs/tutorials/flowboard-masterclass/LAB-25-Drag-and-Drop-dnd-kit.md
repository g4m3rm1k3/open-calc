# FlowBoard Masterclass — LAB 25 — Drag and Drop Card Reordering with dnd-kit

**Prerequisites:** LAB-24 — Card Detail Modal. Working modal with `useReducer`.

**What this lab adds:**
- Understanding drag and drop from first principles (pointer events)
- `dnd-kit` — the production-ready React drag-and-drop library
- `useDraggable` and `useDroppable` hooks
- Reordering cards within a list by dragging
- Visual feedback: ghost card, active card placeholder

**Time:** 80–100 minutes

---

> **Quick Check — try to answer before reading further:**
>
> 1. What three pointer events make up a drag interaction at the browser level?
> 2. Why is building accessible drag-and-drop from scratch difficult? Name two accessibility concerns.
> 3. `dnd-kit` uses "collision detection" to decide which droppable a dragged item is over. Why not just use `element.getBoundingClientRect()` yourself?
>
> *(Answers at the end of this lab)*

---

## What You Will Build

Cards can be dragged up and down within a list to reorder them. When you pick up a card, the other cards shift to show where it will land. Dropping updates the order via API.

---

## Concept: Drag and Drop Mechanics

**Without any library — raw pointer events:**

```tsx
// Simplified — shows the idea, not production code
function DraggableCard({ id, title }) {
  const [isDragging, setIsDragging] = useState(false);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const startRef = useRef({ x: 0, y: 0, origX: 0, origY: 0 });

  function onPointerDown(e: React.PointerEvent) {
    setIsDragging(true);
    startRef.current = { x: e.clientX, y: e.clientY, origX: pos.x, origY: pos.y };
    // Capture so events still fire if cursor leaves element
    e.currentTarget.setPointerCapture(e.pointerId);
  }

  function onPointerMove(e: React.PointerEvent) {
    if (!isDragging) return;
    setPos({
      x: startRef.current.origX + (e.clientX - startRef.current.x),
      y: startRef.current.origY + (e.clientY - startRef.current.y),
    });
  }

  function onPointerUp() { setIsDragging(false); }

  return (
    <div
      style={{ transform: `translate(${pos.x}px, ${pos.y}px)`, cursor: isDragging ? 'grabbing' : 'grab' }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
    >
      {title}
    </div>
  );
}
```

This shows the principle. But a production implementation needs:
- Drop target hit testing (which list is the card over?)
- Reordering logic (where in the list does it insert?)
- Scroll while dragging
- Keyboard support (for accessibility)
- Touch support
- Screen reader announcements
- Performance (avoiding layout thrashing)

That's hundreds of lines of code and months of testing. This is why `dnd-kit` exists.

**Why `dnd-kit` specifically:**
- Built specifically for React (not a port of a generic library)
- First-class keyboard support with screen reader announcements
- Modular — you compose sensors, collision algorithms, and modifiers
- Performance — uses transforms, not layout reflow

---

## Step 1 — Install `dnd-kit`

```bash
npm install @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities
```

- `@dnd-kit/core` — the foundation: `DndContext`, sensors, collision detection
- `@dnd-kit/sortable` — the sortable preset: `SortableContext`, `useSortable`
- `@dnd-kit/utilities` — CSS helpers like `CSS.Transform.toString()`

---

## Concept: How dnd-kit works

**The three layers:**

```
DndContext                    ← Manages the drag state for a region
  SortableContext             ← Provides sorted item ordering
    useSortable(id)           ← Makes one item draggable AND a drop target
```

**`DndContext`:**

```tsx
<DndContext onDragEnd={handleDragEnd} sensors={sensors} collisionDetection={closestCenter}>
  {/* all draggable/droppable elements go inside */}
</DndContext>
```

The context manages which item is being dragged, coordinates drag events, and calls `onDragEnd` when the drag is complete.

**`SortableContext`:**

```tsx
<SortableContext items={cardIds} strategy={verticalListSortingStrategy}>
  {cards.map(card => <SortableCard key={card.id} card={card} />)}
</SortableContext>
```

Provides the sorted items array to child hooks so they know their position.

**`useSortable`:**

```tsx
function SortableCard({ card }) {
  const {
    attributes,      // aria-* attributes for accessibility
    listeners,       // pointer/keyboard event listeners
    setNodeRef,      // ref callback — attach to the DOM element
    transform,       // CSS transform for the current drag position
    transition,      // CSS transition for smooth snapping
    isDragging,      // true while this item is being dragged
  } = useSortable({ id: card.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,  // ghost effect
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      {card.title}
    </div>
  );
}
```

---

## Step 2 — Create `SortableCard` wrapper

Create `src/components/SortableCard.tsx`:

```tsx
// src/components/SortableCard.tsx
// Thin wrapper that adds drag-and-drop to Card.

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Card } from './Card';
import { Card as CardType } from '../types';

interface SortableCardProps {
  card: CardType;
  listId: string;
  onDelete: (cardId: string) => void;
  onMoveLeft?: () => void;
  onMoveRight?: () => void;
  onOpen: (cardId: string) => void;
  onUpdate: (cardId: string, updates: Partial<CardType>) => void;
}

export function SortableCard(props: SortableCardProps) {
  const { card } = props;

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: card.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0 : 1,  // hide card while dragging (ghost replaces it)
    position: isDragging ? 'relative' as const : undefined,
    zIndex: isDragging ? 0 : undefined,
  };

  return (
    <div ref={setNodeRef} style={style}>
      <Card
        {...props}
        dragHandleProps={{ ...attributes, ...listeners }}
      />
    </div>
  );
}
```

Update `Card.tsx` to accept drag handle props:

```tsx
interface CardProps {
  // ... existing props ...
  dragHandleProps?: React.HTMLAttributes<HTMLElement>;
}

// In JSX, add a drag handle:
<div className="card-drag-handle" {...props.dragHandleProps}>
  ⠿  {/* drag handle icon */}
</div>
```

Add to `Card.css`:

```css
.card-drag-handle {
  cursor: grab;
  color: #cbd5e0;
  font-size: 16px;
  padding: 4px;
  flex-shrink: 0;
  touch-action: none;  /* required for pointer events on touch */
}

.card-drag-handle:hover { color: #718096; }
.card-drag-handle:active { cursor: grabbing; }
```

---

## Step 3 — Update `List` to use `SortableContext`

Update `List.tsx`:

```tsx
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { SortableCard } from './SortableCard';

// In the JSX where cards are rendered:
const cardIds = cards.map(c => c.id);

<SortableContext items={cardIds} strategy={verticalListSortingStrategy}>
  {cards.map(card => (
    <SortableCard
      key={card.id}
      card={card}
      listId={listId}
      onDelete={id => onDeleteCard?.(listId, id)}
      onOpen={id => onOpenCard?.(listId, id)}
      onUpdate={(id, updates) => onUpdateCard?.(listId, id, updates)}
      onMoveLeft={/* same as before */}
      onMoveRight={/* same as before */}
    />
  ))}
</SortableContext>
```

---

## Step 4 — Add `DndContext` to `Board` with `onDragEnd`

Update `Board.tsx`:

```tsx
import {
  DndContext,
  DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { sortableKeyboardCoordinates, arrayMove } from '@dnd-kit/sortable';

interface BoardProps {
  // ... existing ...
  onReorderCards: (listId: string, orderedCardIds: string[]) => void;
}

export function Board({ lists, onReorderCards, ...rest }: BoardProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,  // must move 8px before drag starts (allows click events to work)
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    // Find which list the dragged card is in
    const listContainingCard = lists.find(list =>
      list.cards.some(card => card.id === active.id)
    );
    if (!listContainingCard) return;

    const cardIds = listContainingCard.cards.map(c => c.id);
    const oldIndex = cardIds.indexOf(active.id as string);
    const newIndex = cardIds.indexOf(over.id as string);

    if (oldIndex === -1 || newIndex === -1) return;

    const newOrder = arrayMove(cardIds, oldIndex, newIndex);
    onReorderCards(listContainingCard.id, newOrder);
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <div className="board">
        {lists.map(list => (
          <List key={list.id} {...list} {...rest} />
        ))}
      </div>
    </DndContext>
  );
}
```

---

## Step 5 — Add `handleReorderCards` to `useBoardState`

```ts
async function handleReorderCards(listId: string, orderedCardIds: string[]): Promise<void> {
  if (!activeBoard) return;
  
  // Optimistic: update UI immediately
  setBoards(prev => prev.map(board =>
    board.id !== activeBoard.id ? board : {
      ...board,
      lists: board.lists.map(list =>
        list.id !== listId ? list : {
          ...list,
          cards: orderedCardIds
            .map(id => list.cards.find(c => c.id === id))
            .filter((c): c is Card => c !== undefined),
        }
      ),
    }
  ));

  // Persist to server
  try {
    await reorderCardsApi(listId, orderedCardIds);
  } catch (err) {
    // Rollback on failure — re-fetch from server
    await loadBoards();
    showError('Failed to reorder cards.');
  }
}
```

---

## Step 6 — Add reorder endpoint to the backend

Add to `backend/main.py`:

```python
class ReorderCardsRequest(BaseModel):
    card_ids: list[str]

@app.post("/api/lists/{list_id}/reorder", status_code=204)
async def reorder_cards(
    list_id: str,
    request: ReorderCardsRequest,
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_current_user)
):
    # Verify the list belongs to the current user
    list_ = db.query(ListModel).join(BoardModel).filter(
        ListModel.id == list_id,
        BoardModel.owner_id == current_user.id
    ).first()
    
    if list_ is None:
        raise HTTPException(status_code=404, detail="List not found")
    
    # Update position of each card
    for position, card_id in enumerate(request.card_ids):
        db.query(CardModel).filter(
            CardModel.id == card_id,
            CardModel.list_id == list_id
        ).update({"position": position})
    
    db.commit()
    return None
```

Add `position` column to `CardModel` in `models.py`:

```python
class CardModel(Base):
    __tablename__ = "cards"
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    title = Column(String, nullable=False)
    description = Column(String, default="")
    position = Column(Integer, default=0)  # ← add this
    list_id = Column(String, ForeignKey("lists.id", ondelete="CASCADE"))
    list = relationship("ListModel", back_populates="cards")
```

Update `board_to_dict()` to sort cards by position:

```python
def board_to_dict(board: BoardModel) -> dict:
    return {
        "id": board.id,
        "title": board.title,
        "lists": [
            {
                "id": list_.id,
                "title": list_.title,
                "cards": sorted(
                    [{"id": c.id, "title": c.title, "description": c.description} for c in list_.cards],
                    key=lambda c: c.get("position", 0)  # sort by position
                )
            }
            for list_ in board.lists
        ]
    }
```

### SAVE AND TRY

1. Drag a card by its drag handle (the `⠿` icon) and reorder within the list
2. Release — the card snaps to position, API call fires
3. Refresh the page — order is preserved
4. Try Tab → Space to pick up a card, arrow keys to move, Space to drop (keyboard drag-and-drop!)

---

## 🎯 Challenge: Drag cards between lists

**You know:** `DndContext`, `onDragEnd`, the list structure, cross-list moves from LAB-12.

**Task:** Currently, dragging only works within the same list. When the user drags a card to a different list, it should move there (not reorder within the original list).

**Hints:**
- In `handleDragEnd`, check if the `over.id` is a card (in a different list) or a list itself
- Find the source list and target list separately
- If same list: `arrayMove` (reorder)
- If different list: remove from source, insert at target position
- You'll need each list to also be a droppable (use `useDroppable` in List or pass `id` to SortableContext)

---

<details>
<summary>▶ Show Solution</summary>

```tsx
// In Board.tsx handleDragEnd:
function handleDragEnd(event: DragEndEvent) {
  const { active, over } = event;
  if (!over) return;

  const activeId = active.id as string;
  const overId = over.id as string;
  
  if (activeId === overId) return;

  // Find source list
  const sourceList = lists.find(l => l.cards.some(c => c.id === activeId));
  if (!sourceList) return;

  // Find destination list — over could be a card OR a list
  const destList = lists.find(l => l.cards.some(c => c.id === overId))
                || lists.find(l => l.id === overId);
  if (!destList) return;

  if (sourceList.id === destList.id) {
    // Same list — reorder
    const ids = sourceList.cards.map(c => c.id);
    const newOrder = arrayMove(ids, ids.indexOf(activeId), ids.indexOf(overId));
    onReorderCards(sourceList.id, newOrder);
  } else {
    // Different list — move
    const destIndex = destList.cards.findIndex(c => c.id === overId);
    onMoveCardToList(activeId, sourceList.id, destList.id, destIndex >= 0 ? destIndex : destList.cards.length);
  }
}
```

**Key insight:** The challenge with multi-list drag-and-drop is that `over.id` can be either a card ID (hovering over a specific card in the target list) or a list ID (hovering over the empty space of a list). You need to handle both cases. The `over.data.current` property on the drag event can carry custom data from each `useSortable` or `useDroppable` hook to help disambiguate — this is `dnd-kit`'s mechanism for attaching arbitrary data to droppables.

</details>

---

## Final Check

| Feature | How to Verify |
|---|---|
| Drag handle visible on cards | Look for `⠿` icon |
| Dragging card moves with cursor | Pick up card → follows cursor |
| Card becomes transparent while dragging | Drag card → ghost visible |
| Dropping reorders correctly | Drag to new position → order updates |
| Order preserved on page refresh | Reorder → refresh → same order |
| Keyboard drag works | Tab to drag handle → Space → arrow keys → Space |
| `distance: 8` allows click | Click card → modal opens (not drag) |
| `@dnd-kit/core` installed | `package.json` has the packages |
| No TypeScript errors | Problems panel clean |

---

## Quick Check Answers

**1. Three pointer events that make up a drag:**

`pointerdown` — the drag starts (mouse button pressed or finger touches screen). `pointermove` — the drag is in progress (cursor/finger is moving). `pointerup` — the drag ends (button released or finger lifted). `pointercancel` is also important — fires when the browser interrupts a pointer event (e.g., a scroll gesture takes over on mobile). A production drag-and-drop implementation handles all four.

**2. Two accessibility concerns with drag-and-drop:**

First, **keyboard access** — dragging is a mouse/touch action. Keyboard-only users cannot perform it unless you provide an alternative (keyboard shortcuts, or the ability to "pick up" an item with Space, move with arrow keys, and drop with Space or Enter). Second, **screen reader announcements** — dragging silently reorders items, which is invisible to screen readers. You need `aria-live` announcements like "Card 'Fix bug' picked up. Position 2 of 5 in Backlog. Press arrow keys to move." `dnd-kit` provides both of these via its built-in accessibility layer when you use `KeyboardSensor` and spread `attributes` on the draggable element.

**3. Why not use `getBoundingClientRect()` yourself:**

You could — but it's expensive. `getBoundingClientRect()` forces the browser to flush pending layout calculations (a "forced reflow") to return accurate measurements. Called repeatedly during a fast drag (60fps = every ~16ms), this can seriously degrade performance. `dnd-kit` batches measurements and uses transforms for visual feedback (transforms don't trigger reflow), only measuring when necessary. It also uses intersection algorithms more sophisticated than simple bounding box overlap.

---

## Next Lab

In **LAB-26**, you will add card **priority** (Low, Medium, High, Urgent) using TypeScript **enums** and **discriminated unions**. This is also where you will practice TypeScript's type narrowing — writing code that TypeScript can verify is exhaustive.
