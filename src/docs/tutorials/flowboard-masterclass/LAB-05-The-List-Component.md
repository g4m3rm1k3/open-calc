# FlowBoard Masterclass — LAB 05 — The List Component

**Prerequisites:** LAB-04 — Flexbox Column Layout. You have styled cards in a 360px flex column with a header showing "To Do" and a card count.

**What this lab adds:**
- A `<List />` component that owns the column header, card count, and card layout
- Component composition: `App` renders `List`, `List` renders `Card`
- The `children` prop — a special React prop that lets a component wrap arbitrary content
- Conditional rendering — showing or hiding JSX based on a condition

**Time:** 45–60 minutes

---

> **Quick Check — try to answer before reading further:**
>
> 1. Right now `App.tsx` has the card list layout mixed in with the data and the root structure. What problems do you think this causes as the app grows to have three lists?
> 2. React components receive `props` from their parent. But what happens when you write `<List><Card /></List>`? Where does `<Card />` go?
> 3. If you have a list with zero cards, what should the UI show? What TypeScript feature lets you express that a prop might or might not be present?
>
> *(Answers at the end of this lab)*

---

## What You Will Build

By the end of this lab, `App.tsx` renders a `<List />` component, which renders `<Card />` components inside it. The column header, the flex layout, and the card rendering are all owned by `List`. `App` only decides which lists exist and passes their data.

```
┌─────────────────────────────────────┐
│  To Do                           3  │   ← List header (owned by List)
├─────────────────────────────────────┤
│  ┌───────────────────────────────┐  │
│  │  Fix login button             │  │   ← Card (rendered by List)
│  │  The login button is broken   │  │
│  └───────────────────────────────┘  │
│  ┌───────────────────────────────┐  │
│  │  Update homepage hero image   │  │
│  │  New design approved.         │  │
│  └───────────────────────────────┘  │
└─────────────────────────────────────┘
```

Component tree at the end of this lab:

```
App
└── List (title="To Do", cards=[...])
    ├── [header section]
    └── [Card, Card, Card]  ← rendered inside List by its own .map()
```

---

## Concept: Component Composition

**What it is:** Component composition is the practice of building complex UI by nesting components inside each other — each one responsible for one specific thing.

**The problem before:**

Right now `App.tsx` contains everything:

```tsx
function App() {
  return (
    <div className="app-layout">
      <div className="column">
        <div className="column-header">       {/* list header logic */}
          <span className="column-title">To Do</span>
          <span className="column-count">{INITIAL_CARDS.length}</span>
        </div>
        <div className="card-list">           {/* list layout logic */}
          {INITIAL_CARDS.map(...)}             {/* card rendering logic */}
        </div>
      </div>
    </div>
  );
}
```

If you want three lists on the board, you need to copy this entire structure three times into `App`. That is 60+ lines of duplicated JSX. If the column header design changes, you update three places. This violates the principle of a single source of truth for structure.

**The solution:** Extract the column into a `List` component. `App` renders `<List title="To Do" cards={INITIAL_CARDS} />`. The entire internal structure — header, count, layout, card rendering — lives in `List.tsx` once.

**What composition means practically:**

```
Before (everything in App):
App = data + list header + list layout + card rendering

After (composed):
App = data + which lists exist
List = list header + list layout + card rendering
Card = one card's appearance
```

Each component has exactly one job. To understand what `App` does, you only need to read `App`. To change how a list is laid out, you only touch `List.tsx`.

**What it hides:** The internal structure of a list column. `App` does not need to know about `.column-header`, `.card-list`, or the `.map()` call — it just writes `<List title="..." cards={[...]} />` and gets a complete, styled column.

**The protected invariant:** A component's internals are private. Parent components interact with a component only through its props interface. Changes to `List`'s internal JSX structure do not require changes in `App`.

**You will see this again in:** Every React application ever written. UI libraries (like shadcn/ui, MUI, Chakra) are composed of components exactly like this. When you install a `<Modal />` component, you are using composition — you do not know or care about the modal's internal JSX.

**Watch for:** Composition is not inheritance. React components do not inherit from each other. The relationship is "uses" (composition), not "is a" (inheritance). `App` uses `List`. `List` uses `Card`. None of them extend each other.

---

## Concept: The `children` Prop

**What it is:** `children` is a special built-in React prop that contains whatever JSX is written between a component's opening and closing tags.

**The problem before:**

All components you have written so far are self-closing: `<Card />`. There is no content between opening and closing tags. But sometimes you want to write:

```tsx
<List>
  <Card title="..." description="..." />
  <Card title="..." description="..." />
</List>
```

Without `children`, `List` would have no way to receive and render the `<Card />` elements placed between its tags.

**The solution:** Any JSX placed between a component's tags becomes available as `props.children` inside the component.

```tsx
interface ListProps {
  title: string;
  children: React.ReactNode; // React.ReactNode means "any valid JSX"
}

function List(props: ListProps) {
  return (
    <div className="column">
      <h2>{props.title}</h2>
      <div className="card-list">
        {props.children}  {/* renders whatever was placed between <List>...</List> */}
      </div>
    </div>
  );
}

// Usage:
<List title="To Do">
  <Card title="Fix login" description="..." />  {/* becomes props.children */}
  <Card title="Update home" description="..." /> {/* also part of props.children */}
</List>
```

**`React.ReactNode`:** The TypeScript type for anything React can render: a string, a number, JSX, `null`, `undefined`, a boolean, or an array of any of these. Using `React.ReactNode` for `children` means the parent can put any valid JSX between the tags.

**Alternative approach — passing cards as a prop instead of children:**

In this lab, we will actually pass `cards` as a prop array and let `List` render them with `.map()` internally. This is a deliberate choice over using `children`. The tradeoff:

- `children` approach: parent decides how cards are rendered inside the list, `List` just provides a wrapper
- `cards` prop approach: `List` owns the rendering logic for cards — it receives data and renders them

For FlowBoard, `List` should own the card rendering because the list is responsible for its cards' layout and ordering. If the parent decided which `<Card />` to render, every parent that uses `<List>` would duplicate the `.map()` logic. Giving `List` a `cards` array prop keeps the rendering logic in one place.

We teach `children` here because it is a required concept — you will encounter it in every UI library.

**You will see this again in:** Layout wrappers, modal containers, sidebar panels, form fieldsets, card wrappers, and every third-party component library (`<Modal>`, `<Drawer>`, `<Dialog>`, `<Tooltip>`). Anything that wraps arbitrary content uses `children`.

**Watch for:** `children` is optional unless you explicitly require it. A component that accepts `children` but nothing is placed between its tags receives `props.children = undefined`. Make `children` optional (`children?: React.ReactNode`) if the component can be used both ways.

---

## Concept: Conditional Rendering

**What it is:** Conditional rendering is rendering different JSX (or no JSX) based on a condition — a value in props, state, or any expression.

**The problem before:**

What should a list show when it has no cards? Right now, if `INITIAL_CARDS` were empty, `List` would render an empty `.card-list` div with a count badge showing "0". That is not wrong, but it is not intentional either. You should explicitly control what happens in the empty state.

**The two patterns you need:**

**Pattern 1 — Logical AND (`&&`):**

```tsx
{cards.length > 0 && <p>Showing {cards.length} cards</p>}
```

If `cards.length > 0` is `false`, the `&&` short-circuits and renders nothing. If `true`, it renders the `<p>`. Used for: "show this only when condition is met."

**Pattern 2 — Ternary (`? :`):**

```tsx
{cards.length > 0
  ? <div className="card-list">...</div>
  : <p className="empty-message">No cards yet</p>
}
```

Used for: "show A when condition is met, otherwise show B."

**Important:** `&&` with a falsy number (0) renders the number `0` in the DOM. This is a React gotcha.

```tsx
// WRONG — if cards.length is 0, this renders "0" as text in the DOM
{cards.length && <p>Showing {cards.length} cards</p>}

// CORRECT — convert to boolean first
{cards.length > 0 && <p>Showing {cards.length} cards</p>}
```

Always compare to a value (`> 0`, `=== true`, `!== null`) rather than relying on a number's truthiness in `&&` expressions.

**You will see this again in:** Loading states, error states, empty states, authenticated vs unauthenticated views, feature flags — any place in React where you decide what to show based on data. It is one of the most common React patterns.

**Watch for:** The `0` rendering bug with `&&`. Always use `count > 0` instead of just `count` when `count` could be zero.

---

## Step 1 — Create `List.tsx`

In VS Code, right-click `src/components/` and create `List.tsx`.

Your components folder:

```
src/components/
├── Card.tsx
├── Card.css
└── List.tsx   ← new
```

Open `List.tsx`. Write the interface first — the contract before the implementation:

```tsx
// List.tsx

import { Card, CardProps } from './Card';
// We import CardProps because the cards prop is an array of card data,
// and CardProps defines that data's shape.

// ListProps defines what a List component requires.
// title: the name of the column (e.g. "To Do", "In Progress")
// cards: the array of card data to render inside this list
export interface ListProps {
  title: string;
  cards: CardProps[]; // an array — each element matches the CardProps shape
}
```

### SAVE AND TRY

Save. Check the Problems panel. Zero errors — the interface is valid.

Notice we imported `CardProps` from `Card.tsx`. We reuse the existing interface rather than defining a new shape. The data that flows into `List` is the same shape that flows into each `Card`. This is type reuse — one definition, used in multiple places.

---

## Step 2 — Write the List component

Add the component function below the interface:

```tsx
// List.tsx

import { Card, CardProps } from './Card';
import './List.css'; // ← we will create this next

export interface ListProps {
  title: string;
  cards: CardProps[];
}

export function List(props: ListProps) {
  return (
    // .column is the outer container — controls width and vertical stacking
    <div className="column">

      {/* Column header: title on the left, card count on the right */}
      <div className="column-header">
        <span className="column-title">{props.title}</span>
        {/* Conditional rendering: only show the count badge if there are cards.
            props.cards.length > 0 ensures we never show "0" as a ghost badge. */}
        {props.cards.length > 0 && (
          <span className="column-count">{props.cards.length}</span>
        )}
      </div>

      {/* Card list: renders each card, or an empty-state message */}
      {props.cards.length > 0
        ? (
          // There are cards — render the flex column of Card components
          <div className="card-list">
            {props.cards.map(card => (
              // key goes on the outermost element in the .map() return
              <Card
                key={card.title} // temporary — we'll use IDs in the next lab
                title={card.title}
                description={card.description}
              />
            ))}
          </div>
        )
        : (
          // No cards — render a placeholder so the column doesn't look broken
          <p className="empty-state">No cards yet</p>
        )
      }
    </div>
  );
}
```

**Note on `key={card.title}`:** Ideally the key would be a stable ID. But `CardProps` currently only has `title` and `description` — no `id`. In the next lab we will update the data model. For now, `title` works as a temporary key as long as all titles are unique.

### SAVE AND TRY

Save `List.tsx`. The Problems panel will show one error: `Cannot find module './List.css'`. You referenced the CSS file but haven't created it yet. That is expected — fix it in the next step.

---

## Step 3 — Create `List.css`

Right-click `src/components/` and create `List.css`.

Move the column layout rules from `App.css` into `List.css` — they belong to the `List` component:

```css
/* List.css */

/* .column is the outer wrapper for one list column.
   It controls the width and stacks the header + card list vertically. */
.column {
  max-width: 360px;
  display: flex;
  flex-direction: column;
  gap: 8px;                 /* space between header and card-list */
  background-color: #edf2f7; /* light gray panel — distinguishes from white cards */
  border-radius: 12px;
  padding: 12px;
}

/* .column-header sits at the top of the column.
   Flexbox row puts the title on the left and count on the right. */
.column-header {
  display: flex;
  justify-content: space-between; /* title left, count right */
  align-items: center;
  padding: 4px 4px 8px 4px;
}

.column-title {
  font-weight: 600;
  font-size: 14px;
  color: #2d3748;
  text-transform: uppercase;   /* standard Kanban column header convention */
  letter-spacing: 0.05em;      /* slight spacing makes uppercase more readable */
}

.column-count {
  font-size: 12px;
  color: #718096;
  background-color: white;
  border-radius: 12px;
  padding: 2px 8px;
  font-weight: 600;
}

/* .card-list is the flex column of Card components inside the List */
.card-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

/* .empty-state shows when a list has no cards.
   Dashed border signals "you can add something here". */
.empty-state {
  text-align: center;
  color: #a0aec0;
  font-size: 13px;
  padding: 24px;
  border: 2px dashed #cbd5e0;
  border-radius: 8px;
  margin: 0;
}
```

### CSS AND SEE

Save. The Problems panel error disappears. But the app still looks unchanged in the browser because `App.tsx` hasn't been updated to use `<List>` yet.

---

## Step 4 — Update `App.tsx` to use `<List />`

Now replace `App.tsx`'s manual column structure with a single `<List />`:

```tsx
// App.tsx

import { List } from './components/List';
// Note: we no longer import Card directly in App — List renders Cards internally.
// App.css only needs the outer layout styles now.
import './App.css';

// CardData type moved here — App owns the data, so it defines the data shape.
// In a later lab, this will move to a shared types file.
interface CardData {
  id: string;
  title: string;
  description: string;
}

const INITIAL_CARDS: CardData[] = [
  {
    id: 'card-1',
    title: 'Fix login button',
    description: 'The login button does not respond on mobile screens.',
  },
  {
    id: 'card-2',
    title: 'Update homepage hero image',
    description: 'New design approved in Figma.',
  },
  {
    id: 'card-3',
    title: 'Write onboarding email',
    description: 'Three-step welcome sequence for new signups.',
  },
];

function App() {
  return (
    <div className="app-layout">
      {/* App renders a List and passes it the title and cards.
          App does not know or care about how the column header is built,
          or how the cards are laid out — that is List's job. */}
      <List
        title="To Do"
        cards={INITIAL_CARDS}
      />
    </div>
  );
}

export default App;
```

Also clean up `App.css` — remove the column-related rules that moved to `List.css`:

```css
/* App.css */

/* app-layout is the outermost page container.
   In Lab 06 it will arrange multiple List columns side by side. */
.app-layout {
  padding: 24px;
  min-height: 100vh;
  background-color: #f0f4f8; /* slightly blue-tinted gray — the board background */
}
```

### SAVE AND TRY

Save both files. Look at the browser.

**You should see:** The column appears with the "To Do" header, count badge, and all three cards. The visual result is identical to Lab 04 — but the code structure is completely different. `App.tsx` is now 30 lines. The entire column logic lives in `List.tsx`.

**Verify the component tree:** DevTools → React DevTools (install the React DevTools browser extension if you haven't — it is essential). In the Components panel you should see:

```
App
└── List
    ├── Card
    ├── Card
    └── Card
```

This is the component tree. Each component is in its own box. Clicking `List` shows its props: `{ title: "To Do", cards: [...] }`.

---

## Step 5 — Test conditional rendering (empty state)

Temporarily pass an empty array to `List` to verify the empty state renders:

```tsx
<List
  title="To Do"
  cards={[]}  // ← empty array
/>
```

### SAVE AND TRY

Save. Look at the browser.

**You should see:**
- The "To Do" header (always shown)
- No count badge (because `cards.length > 0` is false)
- The "No cards yet" placeholder with the dashed border

Restore `cards={INITIAL_CARDS}` before continuing.

---

## 🎯 Challenge: A second list

**You know:** Component composition, the `List` interface, passing props

**Task:** Add a second `<List />` below the first in `App.tsx`, titled "In Progress", with two different cards of your own invention. The two lists should appear side by side (do not worry about making them horizontal yet — they will stack for now). Verify both lists render correctly with their own card counts.

**Starting code:** Your current `App.tsx`.

**Hints:** None — this is a direct application of what you just learned.

Try for 3 minutes before revealing the solution.

---

<details>
<summary>▶ Show Solution</summary>

```tsx
// App.tsx

import { List } from './components/List';
import './App.css';

interface CardData {
  id: string;
  title: string;
  description: string;
}

const TODO_CARDS: CardData[] = [
  {
    id: 'card-1',
    title: 'Fix login button',
    description: 'The login button does not respond on mobile screens.',
  },
  {
    id: 'card-2',
    title: 'Update homepage hero image',
    description: 'New design approved in Figma.',
  },
  {
    id: 'card-3',
    title: 'Write onboarding email',
    description: 'Three-step welcome sequence for new signups.',
  },
];

const IN_PROGRESS_CARDS: CardData[] = [
  {
    id: 'card-4',
    title: 'Design new dashboard',
    description: 'Working with the design team on the analytics view.',
  },
  {
    id: 'card-5',
    title: 'Migrate database to Postgres',
    description: 'Moving from SQLite for production readiness.',
  },
];

function App() {
  return (
    <div className="app-layout">
      <List title="To Do" cards={TODO_CARDS} />
      <List title="In Progress" cards={IN_PROGRESS_CARDS} />
    </div>
  );
}

export default App;
```

**Key insight:** `App.tsx` went from managing all the column structure to simply deciding which lists exist and what data they get. Adding a third list takes one line. The column's internal structure never changes. This is composition — you assemble complex UI from simple, reusable pieces, each with a single responsibility.

</details>

---

## Final Check

| Feature | How to Verify |
|---|---|
| `List.tsx` exists in `src/components/` | VS Code Explorer |
| `List.css` exists in `src/components/` | VS Code Explorer |
| `List` renders the column header with title | Browser shows "TO DO" (or similar) at top of column |
| `List` renders a count badge when cards exist | Browser shows "3" badge in header |
| `List` hides the count badge when `cards` is empty | Pass `cards={[]}`, count badge disappears |
| `List` renders the empty-state when `cards` is empty | Pass `cards={[]}`, dashed placeholder appears |
| `App.tsx` no longer contains column header or card layout JSX | `App.tsx` only contains `<List>` tags |
| React DevTools shows `App > List > Card (×3)` | React DevTools Components panel |
| No TypeScript errors | Problems panel is clean |
| No console errors | DevTools Console is clean |

---

## Quick Check Answers

**1. What problems does mixing everything in `App` cause as the app grows?**

With three lists, `App` would have three copies of the column header JSX, three copies of the card list layout, and three `.map()` calls. If the column design changes — say, you add a "collapse" button to headers — you update three places. If you add a fourth list, you add another copy. Over time, `App` becomes a thousand-line file that is impossible to navigate. Extracting `List` means the column structure is defined once. Three lists = three `<List />` tags, each one line. Changes are made once.

**2. Where does content between `<List>...</List>` tags go?**

It becomes `props.children` inside the `List` component. `children` is a special React prop that automatically holds whatever JSX is placed between the component's opening and closing tags. The `List` component can place `{props.children}` wherever it wants in its own JSX output. In this lab we chose to use a `cards` prop instead of `children` because `List` should own the rendering logic — but `children` remains the right choice for wrapper components that do not need to control the rendering of what is inside them.

**3. What TypeScript feature lets you express that a prop might or might not be present?**

The `?` optional marker on an interface field: `count?: number` means the prop is optional — it can be a `number` or it can be absent entirely (`undefined`). TypeScript treats optional fields as `T | undefined` inside the component. This forces you to handle both cases: either check `if (props.count !== undefined)` before using it, or use `props.count ?? 0` to provide a default. The `?` is not a maybe type — it is a compile-time contract that says "callers may omit this."

---

## Next Lab

In **LAB-06**, you will place multiple lists side by side horizontally. Right now two `<List />` components stack vertically because `app-layout` uses default block layout. The next lab changes `app-layout` to a horizontal flex row, adds `overflow-x: auto` for when there are more lists than the screen can show, and introduces `flex-shrink: 0` to prevent flex items from squishing each other.
