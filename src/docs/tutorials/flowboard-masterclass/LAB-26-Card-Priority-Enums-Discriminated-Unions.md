# FlowBoard Masterclass — LAB 26 — Card Priority: TypeScript Enums and Discriminated Unions

**Prerequisites:** LAB-25 — Drag and drop.

**What this lab adds:**
- TypeScript `enum` vs `const` object vs union type — when to use each
- Discriminated unions — a pattern for type-safe conditionals
- Exhaustive type checking — TypeScript telling you when you've missed a case
- Card priority field: Low, Medium, High, Urgent
- Priority badge on cards and filter by priority

**Time:** 60–75 minutes

---

> **Quick Check — try to answer before reading further:**
>
> 1. TypeScript has `enum`, `const enum`, and `const` objects used as enums. What's the difference between a TypeScript `enum` and a `const` object used as an enum (`const PRIORITY = { LOW: 'low', ... } as const`)?
> 2. A discriminated union is a union type where each member has a shared property with a unique literal value. What problem does this solve that a plain union does not?
> 3. The TypeScript compiler can warn you when you have a `switch` statement that doesn't handle all cases of a union type. What technique do you use to achieve this warning?
>
> *(Answers at the end of this lab)*

---

## What You Will Build

Each card has a Priority field: Low, Medium, High, or Urgent. The priority is shown as a colored badge on the card. Clicking the card opens the detail modal where you can change the priority. A priority filter in the board header lets you show only cards of a specific priority.

---

## Concept: Three Ways to Define an Enum in TypeScript

**Method 1 — TypeScript enum:**

```typescript
enum Priority {
  Low = 'LOW',
  Medium = 'MEDIUM',
  High = 'HIGH',
  Urgent = 'URGENT',
}

const p: Priority = Priority.High;  // type-safe
// p === 'HIGH' at runtime
```

**Downsides of TypeScript enum:**
- Generates runtime JavaScript (unlike most TypeScript, which erases to nothing)
- Can cause issues with JSON serialization (numeric enums serialize as numbers)
- Harder to iterate over values

**Method 2 — `const` object (preferred by many teams):**

```typescript
const Priority = {
  Low: 'LOW',
  Medium: 'MEDIUM',
  High: 'HIGH',
  Urgent: 'URGENT',
} as const;

type Priority = typeof Priority[keyof typeof Priority];
// Type is: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'
```

**Advantages:**
- No runtime code — erased to a plain object
- Works with JSON naturally
- `as const` makes every value a literal type
- `Object.values(Priority)` gives you all values for dropdowns

**Method 3 — plain union type:**

```typescript
type Priority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
```

Simplest. No companion object. Good when you don't need to iterate and are comfortable writing the literal strings.

**Which to use:** Most modern TypeScript code avoids `enum` in favor of `const` objects or plain union types. This lab uses `const` objects because they work best with `Object.values()` for rendering dropdown options.

---

## Concept: Discriminated Unions

A discriminated union is a union of object types where each type has a shared "discriminant" property with a unique literal value:

```typescript
type CardAction =
  | { type: 'ADD'; title: string; listId: string }
  | { type: 'DELETE'; cardId: string }
  | { type: 'MOVE'; cardId: string; fromListId: string; toListId: string };

function handleAction(action: CardAction) {
  switch (action.type) {
    case 'ADD':
      // TypeScript knows: action.title and action.listId exist
      return addCard(action.title, action.listId);
    case 'DELETE':
      // TypeScript knows: action.cardId exists (action.title does NOT)
      return deleteCard(action.cardId);
    case 'MOVE':
      // TypeScript knows: action.fromListId and action.toListId exist
      return moveCard(action.cardId, action.fromListId, action.toListId);
  }
}
```

The `type` field is the discriminant. TypeScript narrows the type automatically in each `case` block. Without discriminated unions, you'd need optional fields and runtime checks (`if ('title' in action)` etc.).

**Exhaustive checking with `never`:**

```typescript
function assertNever(x: never): never {
  throw new Error(`Unhandled case: ${JSON.stringify(x)}`);
}

function handleAction(action: CardAction) {
  switch (action.type) {
    case 'ADD': return addCard(action.title, action.listId);
    case 'DELETE': return deleteCard(action.cardId);
    // If you add 'MOVE' to CardAction but forget it here:
    default:
      return assertNever(action);  // TypeScript ERROR: 'MOVE' is not assignable to 'never'
  }
}
```

This technique makes TypeScript tell you at compile time when you add a new union member but forget to handle it.

**You will see this again in:** Lab 30 (Zustand actions), Lab 32 (filter state), any place you have a closed set of tagged alternatives.

---

## Step 1 — Add priority to the types

Update `src/types.ts`:

```typescript
// Define Priority as a const object with values
export const Priority = {
  Low: 'LOW',
  Medium: 'MEDIUM',
  High: 'HIGH',
  Urgent: 'URGENT',
} as const;

// Derive the type from the object values
export type Priority = typeof Priority[keyof typeof Priority];

// Add to Card interface
export interface Card {
  id: string;
  title: string;
  description: string;
  priority: Priority;
  createdAt: number;
}
```

---

## Step 2 — Add priority badge component

Create `src/components/PriorityBadge.tsx`:

```tsx
// src/components/PriorityBadge.tsx

import { Priority } from '../types';
import './PriorityBadge.css';

interface PriorityBadgeProps {
  priority: Priority;
}

const PRIORITY_LABELS: Record<Priority, string> = {
  LOW: 'Low',
  MEDIUM: 'Medium',
  HIGH: 'High',
  URGENT: '🔥 Urgent',
};

const PRIORITY_CLASS: Record<Priority, string> = {
  LOW: 'priority-low',
  MEDIUM: 'priority-medium',
  HIGH: 'priority-high',
  URGENT: 'priority-urgent',
};

export function PriorityBadge({ priority }: PriorityBadgeProps) {
  return (
    <span className={`priority-badge ${PRIORITY_CLASS[priority]}`}>
      {PRIORITY_LABELS[priority]}
    </span>
  );
}
```

Create `src/components/PriorityBadge.css`:

```css
.priority-badge {
  display: inline-block;
  font-size: 11px;
  font-weight: 600;
  padding: 2px 8px;
  border-radius: 12px;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.priority-low     { background: #f0fff4; color: #276749; }
.priority-medium  { background: #fffaf0; color: #744210; }
.priority-high    { background: #fff5f5; color: #c53030; }
.priority-urgent  { background: #e53e3e; color: white; }
```

---

## Step 3 — Add priority field to Card detail modal and Card display

Update `Card.tsx` to show the priority badge:

```tsx
import { PriorityBadge } from './PriorityBadge';

// In JSX, below the title:
<PriorityBadge priority={card.priority} />
```

Update `CardDetailModal.tsx` to include priority selection:

```tsx
import { Priority } from '../types';

// In the form:
<div className="card-detail-field">
  <label className="card-detail-label">Priority</label>
  <select
    className="card-detail-select"
    value={state.priority}
    onChange={e => dispatch({ type: 'SET_PRIORITY', value: e.target.value as Priority })}
  >
    {Object.entries(Priority).map(([label, value]) => (
      <option key={value} value={value}>{label}</option>
    ))}
  </select>
</div>
```

Add to the `CardFormState`:
```tsx
priority: Priority;
```

Add to the reducer:
```tsx
case 'SET_PRIORITY':
  return { ...state, priority: action.value as Priority, isDirty: true };
```

Add to `CardFormAction`:
```tsx
| { type: 'SET_PRIORITY'; value: Priority }
```

Add to `INIT` case:
```tsx
case 'INIT':
  return {
    title: action.card.title,
    description: action.card.description,
    priority: action.card.priority,
    isDirty: false,
    isSaving: false,
    error: null,
  };
```

---

## Step 4 — Backend: add priority to card model

Update `models.py`:

```python
class CardModel(Base):
    __tablename__ = "cards"
    id = Column(String, primary_key=True)
    title = Column(String, nullable=False)
    description = Column(String, default="")
    priority = Column(String, default="LOW")  # ← add
    position = Column(Integer, default=0)
    list_id = Column(String, ForeignKey("lists.id", ondelete="CASCADE"))
    list = relationship("ListModel", back_populates="cards")
```

Update `UpdateCardRequest` in `main.py`:

```python
class UpdateCardRequest(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    priority: Optional[str] = None  # 'LOW', 'MEDIUM', 'HIGH', 'URGENT'

# In the PATCH handler, add:
if request.priority is not None:
    valid_priorities = {'LOW', 'MEDIUM', 'HIGH', 'URGENT'}
    if request.priority not in valid_priorities:
        raise HTTPException(status_code=422, detail=f"Invalid priority: {request.priority}")
    card.priority = request.priority
```

Update `board_to_dict()` to include priority:

```python
"cards": sorted(
    [{
        "id": c.id,
        "title": c.title,
        "description": c.description,
        "priority": c.priority,
        "position": c.position,
    } for c in list_.cards],
    key=lambda c: c.get("position", 0)
)
```

---

## Step 5 — Priority filter in the board header

Add to `useBoardState.ts`:

```ts
const [priorityFilter, setPriorityFilter] = useState<Priority | null>(null);

// Derive filtered active board
const filteredActiveBoard = useMemo(() => {
  if (!activeBoard || !priorityFilter) return activeBoard;
  return {
    ...activeBoard,
    lists: activeBoard.lists.map(list => ({
      ...list,
      cards: list.cards.filter(card => card.priority === priorityFilter),
    })),
  };
}, [activeBoard, priorityFilter]);

return {
  // ... existing ...
  priorityFilter,
  setPriorityFilter,
  activeBoard: filteredActiveBoard,  // use filtered version
};
```

Add the filter UI to `BoardPage.tsx`:

```tsx
<select
  value={priorityFilter ?? ''}
  onChange={e => setPriorityFilter(e.target.value as Priority || null)}
>
  <option value="">All priorities</option>
  {Object.entries(Priority).map(([label, value]) => (
    <option key={value} value={value}>{label}</option>
  ))}
</select>
```

### SAVE AND TRY

1. Open a card → the Priority dropdown shows all four options
2. Change priority → card badge updates on close
3. Set filter to "High" in the header → only High priority cards visible
4. Reset filter → all cards visible

---

## 🎯 Challenge: Exhaustive priority switch with `assertNever`

**You know:** TypeScript's `never` type, discriminated unions, exhaustive checking.

**Task:** In `PriorityBadge.tsx`, replace the `PRIORITY_LABELS` record lookup with a `switch` statement that uses `assertNever` to ensure all cases are handled.

```tsx
function getPriorityLabel(priority: Priority): string {
  switch (priority) {
    case 'LOW': return 'Low';
    case 'MEDIUM': return 'Medium';
    case 'HIGH': return 'High';
    case 'URGENT': return '🔥 Urgent';
    default: return assertNever(priority);
  }
}
```

Add `assertNever` to `src/utils/assertNever.ts`:

```ts
export function assertNever(x: never): never {
  throw new Error(`Unhandled case: ${JSON.stringify(x)}`);
}
```

Then add `'CRITICAL'` to the `Priority` object but don't add a `case` for it in the switch — confirm that TypeScript shows a compile error pointing you to the missing case.

---

<details>
<summary>▶ Show Solution</summary>

```ts
// src/utils/assertNever.ts
export function assertNever(x: never): never {
  throw new Error(`Unhandled case: ${JSON.stringify(x)}`);
}
```

```tsx
// PriorityBadge.tsx
import { assertNever } from '../utils/assertNever';

function getPriorityLabel(priority: Priority): string {
  switch (priority) {
    case 'LOW': return 'Low';
    case 'MEDIUM': return 'Medium';
    case 'HIGH': return 'High';
    case 'URGENT': return '🔥 Urgent';
    default: return assertNever(priority);
  }
}
```

When you add `'CRITICAL'` to `Priority` type and don't add a `case` for it, the `default` branch receives `'CRITICAL'`, which is not `never` — TypeScript shows: `Argument of type 'string' is not assignable to parameter of type 'never'`.

**Key insight:** The `never` type is TypeScript's way of saying "this should be unreachable." `assertNever` takes a `never` argument — so TypeScript only accepts it if the type has truly been narrowed to `never` (i.e., all possible cases were handled above). This pattern turns runtime errors into compile-time errors, which is exactly what TypeScript is designed to do. It's also useful in `useReducer` — add `assertNever(action)` to the `default` case so TypeScript catches missing action handlers.

</details>

---

## Final Check

| Feature | How to Verify |
|---|---|
| Priority badge shows on each card | Cards show colored badge |
| Low = green, Medium = orange, High = red, Urgent = red background | Visual check |
| Priority editable in card detail modal | Open modal → Priority dropdown |
| Changing priority updates badge on close | Change to Urgent → close → badge updates |
| Priority filter in board header | Select "High" → only High cards shown |
| Filter reset shows all cards | Select "All priorities" → all visible |
| Priority persisted via API | Change priority → refresh → same priority |
| Priority validated in backend | Send invalid priority via `/docs` → 422 |
| `const Priority` object used (not enum) | Check types.ts |
| `Object.entries(Priority)` for dropdown | Check dropdown rendering code |
| No TypeScript errors | Problems panel clean |

---

## Quick Check Answers

**1. TypeScript `enum` vs `const` object:**

A TypeScript `enum` generates actual JavaScript at runtime — a two-way map object. `const Priority = { Low: 'LOW' }` generates just the plain object (nothing extra). The key difference: with an enum, TypeScript generates code like `var Priority; (function(Priority) { Priority["Low"] = "LOW"; })(Priority = Priority || {})`. With `as const`, there's no special generated code. Additionally, enum members are their own type — you can't pass `'LOW'` where `Priority.Low` is expected without a cast, whereas with union types, string literals are accepted directly.

**2. What problem discriminated unions solve:**

A plain union (`type A = Cat | Dog`) doesn't tell TypeScript which properties are available without narrowing. If both `Cat` and `Dog` have different required properties, TypeScript won't let you access either without a runtime check. A discriminated union (both have `type: 'cat'` or `type: 'dog'`) tells TypeScript: "check the `type` property to know which variant you have." This makes `switch` on `type` automatically narrow the type in each case branch — no casting, no `'name' in x` checks.

**3. The technique for exhaustive checking:**

The `assertNever` pattern: a function that takes an argument of type `never` and throws an error. Place `return assertNever(x)` in the `default` case of a `switch`. TypeScript checks that `x` has type `never` at that point — meaning all members of the union were handled above. If you add a new member to the union without handling it in the switch, the type of `x` at the `default` is the new member (not `never`), and TypeScript reports a type error. This is called "exhaustive pattern matching" and it's a powerful way to make TypeScript enforce completeness.

---

## Next Lab

In **LAB-27**, you will add **card sorting** — sorting cards within a list by priority, by creation date (newest first/oldest first), or alphabetically by title. You will learn `Array.sort()` with comparator functions, the gotchas of in-place vs. copy sorting, and how to preserve sort order independently of drag order.
