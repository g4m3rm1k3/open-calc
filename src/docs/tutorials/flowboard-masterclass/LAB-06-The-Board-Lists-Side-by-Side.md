# FlowBoard Masterclass — LAB 06 — The Board: Lists Side by Side

**Prerequisites:** LAB-05 — The List Component. You have a `List` component that renders a titled column of cards, and `App.tsx` renders at least two `<List />` components.

**What this lab adds:**
- Multiple lists displayed side by side horizontally
- Horizontal scroll when there are more lists than the screen can show
- `flex-shrink: 0` to prevent lists from squishing each other
- A `<Board />` component that owns the horizontal layout

**Time:** 45–60 minutes

---

> **Quick Check — try to answer before reading further:**
>
> 1. Flexbox with `flex-direction: row` lays children out horizontally. What do you think happens when there are more children than the container is wide?
> 2. You have seen `flex-direction: column` (items stack down). What properties do you think control sizing along the main axis in a row layout?
> 3. When you scroll horizontally on a Kanban board like Trello, the header stays fixed at the top. How might CSS achieve that?
>
> *(Answers at the end of this lab)*

---

## What You Will Build

By the end of this lab, the board shows multiple columns side by side. When the columns exceed the viewport width, a horizontal scrollbar appears on the board area. The page header remains visible.

```
┌─────────────────── FlowBoard ───────────────────┐  ← header (fixed)
│─────────────────────────────────────────────────│
│  ┌──────────────┐  ┌──────────────┐  ┌────────  │  ← board area (scrollable)
│  │  TO DO    3  │  │ IN PROGRESS 2│  │  DONE  ← scroll to see
│  ├──────────────┤  ├──────────────┤  ├────────
│  │ Fix login    │  │ Design new   │  │ ...
│  │ ...          │  │ dashboard    │  │
│  │ Update home  │  │ Migrate DB   │  │
│  │ ...          │  │ ...          │  │
│  └──────────────┘  └──────────────┘  └────────
```

---

## Concept: Flex Row Layout

**What it is:** Setting `flex-direction: row` on a flex container makes its children line up horizontally — left to right — instead of stacking vertically.

**The problem before:**

Right now the two `<List />` components in `App` stack vertically (one below the other) because `app-layout` uses block layout. Flex column layout would still stack them. You need flex row to place them side by side.

**What happens without `flex-direction: row`:**

```css
/* Current — block layout */
.app-layout { padding: 24px; }

/* Lists stack vertically — block elements do this by default */
[List 1]
[List 2]
[List 3]
```

**What happens with flex row:**

```css
.app-layout { display: flex; flex-direction: row; }

/* Lists appear side by side */
[List 1]  [List 2]  [List 3]
```

**The default `flex-direction` is `row`** — if you write `display: flex` without specifying direction, children line up horizontally. This is why `flex-direction: row` is technically optional when you want a row. We write it explicitly for clarity.

**You will see this again in:** Navigation bars, button toolbars, tag lists, image galleries, product grids — any time items need to line up horizontally. Flex row + flex column together cover virtually all layout needs.

---

## Concept: `flex-shrink` and Why Lists Must Not Shrink

**What it is:** `flex-shrink` controls whether a flex item is allowed to shrink below its natural size when the flex container runs out of space.

**The problem you are about to see:**

Add `display: flex` to `app-layout` and resize the browser window. Watch what happens to the lists. They will squish — each list tries to fit inside the available space by shrinking its width. A list that was 360px wide becomes 150px. The cards' text wraps aggressively. The board becomes unreadable.

This is Flexbox's default behavior: `flex-shrink: 1` — "shrink if needed."

**The fix:**

```css
.column {
  flex-shrink: 0; /* never shrink — I need my full width */
}
```

With `flex-shrink: 0`, each list holds its full width (360px). When the total width of all lists exceeds the viewport, they overflow — and that is exactly what we want, because we handle overflow with horizontal scrolling.

**The concept — flex sizing shorthand:**

Flex items have three sizing properties:
- `flex-grow` — how much of extra space to claim (default: 0 — don't grow)
- `flex-shrink` — whether to shrink when space is tight (default: 1 — yes, shrink)
- `flex-basis` — the starting size before growing/shrinking (default: `auto`)

These can be written as a shorthand: `flex: grow shrink basis`. Common values:

```css
flex: 1;         /* shorthand for flex: 1 1 0% — grow and shrink equally */
flex: none;      /* shorthand for flex: 0 0 auto — fixed size, don't grow or shrink */
flex-shrink: 0;  /* just disable shrinking, keep other defaults */
```

**Alternative:** Setting `min-width: 360px` on `.column` also prevents shrinking below 360px. The difference: `flex-shrink: 0` tells Flexbox "don't shrink at all." `min-width` tells the browser "never go below this minimum, but shrink down to it if needed." For lists, `flex-shrink: 0` is the right tool — the list should always be exactly its designed width.

**You will see this again in:** Fixed-width sidebars, navigation items that must not squish, table-like layouts with fixed columns. Any time a flex item must stay a specific size.

---

## Concept: `overflow-x: auto`

**What it is:** `overflow-x: auto` makes horizontal scrolling available when content exceeds the container's width. The scrollbar appears only when needed — if content fits, no scrollbar shows.

**The problem before:**

Without this, overflowing content either:
1. Spills outside the container (visible but unreachable without page scroll)
2. Gets clipped if the container has `overflow: hidden`

For a Kanban board, neither is acceptable. The board should scroll horizontally when there are more lists than fit on screen.

**The options:**

```css
overflow-x: visible; /* default — overflow shows outside the container */
overflow-x: hidden;  /* clips overflow — lists disappear off the edge */
overflow-x: scroll;  /* always shows a scrollbar, even when not needed */
overflow-x: auto;    /* scrollbar appears only when content overflows */
```

We use `auto` — no unnecessary scrollbar when only two lists fit on screen, but scrolling works when there are five.

**The height requirement:** For `overflow-x: auto` on the board to work correctly, the board container needs an explicit height or it must be within a parent that constrains it. Otherwise the browser might scroll the whole page horizontally instead. We handle this by making the board fill the viewport height minus the header.

**You will see this again in:** Code editors (horizontal code scroll), data tables with many columns, image carousels, and any horizontal layout that may overflow. In mobile development, horizontal scroll containers are a primary navigation pattern.

---

## Step 1 — Create the `Board` component

The board is a new component — it owns the horizontal layout of lists. This follows the same composition principle as Lab 05: each component has one job.

Create `src/components/Board.tsx`:

```tsx
// Board.tsx

import { List } from './List';
import { CardProps } from './Card';
import './Board.css';

// ListData defines the shape of one list's data — its title and its cards.
export interface ListData {
  id: string;
  title: string;
  cards: CardProps[];
}

// BoardProps: just the array of lists to render.
export interface BoardProps {
  lists: ListData[];
}

export function Board(props: BoardProps) {
  return (
    // .board-area is the scrollable container for all list columns
    <div className="board-area">
      {props.lists.map(list => (
        <List
          key={list.id}       // stable ID for the list
          title={list.title}
          cards={list.cards}
        />
      ))}
    </div>
  );
}
```

### SAVE AND TRY

Save. Problems panel will show one error: `Cannot find module './Board.css'`. Fix it in the next step.

---

## Step 2 — Create `Board.css`

Create `src/components/Board.css`:

```css
/* Board.css */

/* .board-area is the horizontal scrolling container for all list columns.
   display: flex with flex-direction: row places lists side by side.
   align-items: flex-start prevents lists from stretching to the tallest list's height — 
   each list should be only as tall as its content. */
.board-area {
  display: flex;
  flex-direction: row;      /* lists go left to right */
  align-items: flex-start;  /* lists don't stretch to match the tallest */
  gap: 12px;                /* 12px between each list column */
  overflow-x: auto;         /* horizontal scroll when lists overflow */
  padding: 8px 4px 16px 4px; /* bottom padding so scrollbar doesn't overlap content */
}
```

### CSS AND SEE

Save. The Problems panel error clears.

---

## Step 3 — Update `List.css` to prevent shrinking

Add `flex-shrink: 0` to `.column` in `List.css`. Without this, the board will squish lists when the viewport is too narrow.

```css
/* List.css — add flex-shrink to .column */

.column {
  max-width: 360px;
  min-width: 280px;         /* ← add: never narrower than 280px */
  flex-shrink: 0;           /* ← add: never shrink in the flex row */
  display: flex;
  flex-direction: column;
  gap: 8px;
  background-color: #edf2f7;
  border-radius: 12px;
  padding: 12px;
}
```

We add both `flex-shrink: 0` (don't shrink) and `min-width: 280px` (a reasonable lower bound). Together they guarantee the list is always between 280px and 360px wide.

### CSS AND SEE

Save. No visible change yet — the board component is not used in the app yet.

---

## Step 4 — Update `App.tsx` to use `<Board />`

Now replace `App.tsx`'s manual `<List />` tags with a `<Board />` component:

```tsx
// App.tsx

import { Board, ListData } from './components/Board';
import './App.css';

// The board's data: an array of lists, each with an id, title, and cards array.
const BOARD_DATA: ListData[] = [
  {
    id: 'list-todo',
    title: 'To Do',
    cards: [
      {
        title: 'Fix login button',
        description: 'The login button does not respond on mobile screens.',
      },
      {
        title: 'Update homepage hero image',
        description: 'New design approved in Figma.',
      },
      {
        title: 'Write onboarding email',
        description: 'Three-step welcome sequence for new signups.',
      },
    ],
  },
  {
    id: 'list-in-progress',
    title: 'In Progress',
    cards: [
      {
        title: 'Design new dashboard',
        description: 'Working with design on the analytics view.',
      },
      {
        title: 'Migrate database to Postgres',
        description: 'Moving from SQLite for production readiness.',
      },
    ],
  },
  {
    id: 'list-done',
    title: 'Done',
    cards: [
      {
        title: 'Set up CI pipeline',
        description: 'GitHub Actions runs tests on every push.',
      },
    ],
  },
];

function App() {
  return (
    <div className="app-layout">
      <Board lists={BOARD_DATA} />
    </div>
  );
}

export default App;
```

### SAVE AND TRY

Save. Look at the browser.

**You should see:** Three list columns side by side. "To Do" has 3 cards, "In Progress" has 2, "Done" has 1.

**Verify horizontal scroll:** Make the browser window narrow (drag the edge to about 400px wide). The columns should overflow to the right and a horizontal scrollbar should appear on the board area. The columns should not squish.

**Verify no vertical stretch:** "Done" with 1 card should be short — it should not stretch to match the height of the "To Do" column with 3 cards. This is from `align-items: flex-start` on `.board-area`.

---

## Step 5 — Add a page header

The board needs a header bar — the app name and eventually user controls. The header should stay at the top while the board scrolls below it.

Update `App.css` and `App.tsx`:

In `App.tsx`, add a header:

```tsx
function App() {
  return (
    // app-layout now has two regions: header + board
    <div className="app-layout">
      {/* app-header stays at the top — will become sticky in Lab 07 */}
      <header className="app-header">
        <span className="app-name">FlowBoard</span>
      </header>

      {/* Board fills the remaining space */}
      <Board lists={BOARD_DATA} />
    </div>
  );
}
```

In `App.css`, add the header styles:

```css
/* App.css */

.app-layout {
  min-height: 100vh;
  background-color: #f0f4f8;
  display: flex;
  flex-direction: column;  /* header on top, board below */
}

/* .app-header is the top bar with the app name.
   A dark background distinguishes it from the board area. */
.app-header {
  background-color: #2d3748;
  padding: 0 24px;
  height: 52px;
  display: flex;
  align-items: center;     /* vertically center the app name */
}

.app-name {
  color: white;
  font-size: 18px;
  font-weight: 700;
  letter-spacing: 0.02em;
}

/* .board-area needs padding now that it lives inside the layout */
/* (This rule is in Board.css — no change needed here) */
```

Wait — `app-layout` is now a flex column itself. That means `<Board />` (which wraps `.board-area`) is a flex item in a column. For the board to scroll horizontally correctly, it needs to know its width. Add this:

```css
/* App.css — full file */

.app-layout {
  min-height: 100vh;
  background-color: #f0f4f8;
  display: flex;
  flex-direction: column;
}

.app-header {
  background-color: #2d3748;
  padding: 0 24px;
  height: 52px;
  display: flex;
  align-items: center;
  flex-shrink: 0;       /* header never shrinks — it always gets its 52px */
}

.app-name {
  color: white;
  font-size: 18px;
  font-weight: 700;
  letter-spacing: 0.02em;
}
```

And update `Board.css` to add padding that accounts for the new layout:

```css
/* Board.css */

.board-area {
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  gap: 12px;
  overflow-x: auto;
  padding: 20px 24px 24px 24px; /* top/bottom/side breathing room */
  flex: 1;                       /* ← take up all remaining vertical space */
}
```

`flex: 1` on `.board-area` means: "take all remaining space in the parent flex column after the header uses its space." This is the common pattern for "header + scrollable content" layouts.

### CSS AND SEE

Save. Look at the browser.

**You should see:**
- A dark header bar at the top with "FlowBoard"
- The board area below it with the three columns
- Horizontal scroll on the board when the window is narrow
- The header does not scroll with the board

---

## 🎯 Challenge: Add a fourth list and observe horizontal scroll

**You know:** The `ListData` interface, the `BOARD_DATA` structure, horizontal flex overflow

**Task:** Add a fourth list called "Backlog" with at least three cards. Make the browser window narrow enough (or add enough lists) to trigger the horizontal scrollbar. Verify all four lists scroll correctly and none of them shrink below their minimum width.

**Hints:** None — add to `BOARD_DATA` array.

---

<details>
<summary>▶ Show Solution</summary>

```tsx
// In App.tsx, add to BOARD_DATA:
{
  id: 'list-backlog',
  title: 'Backlog',
  cards: [
    {
      title: 'Set up monitoring',
      description: 'Integrate Datadog for production observability.',
    },
    {
      title: 'Write API documentation',
      description: 'OpenAPI spec for all public endpoints.',
    },
    {
      title: 'Mobile responsive audit',
      description: 'Review all pages on 320px viewport width.',
    },
  ],
},
```

**Key insight:** Adding a list is one object in the data array. Zero JSX changes. The `Board` component renders however many lists are in the array — one, four, or fifty — with the same code. This is the payoff of data-driven rendering at the board level, not just the card level.

</details>

---

## Final Check

| Feature | How to Verify |
|---|---|
| `Board.tsx` exists in `src/components/` | VS Code Explorer |
| `Board.css` exists in `src/components/` | VS Code Explorer |
| Three lists appear side by side | Browser shows columns horizontally |
| Horizontal scroll works when viewport is narrow | Drag browser edge narrow — scrollbar appears |
| Lists do not shrink when viewport narrows | `flex-shrink: 0` on `.column` — width holds at minimum |
| Shorter lists do not stretch to tallest height | "Done" list is shorter than "To Do" list |
| App header shows "FlowBoard" | Dark header bar visible at top |
| Header does not scroll with the board | Scroll the board — header stays |
| React DevTools shows `App > Board > List (×3) > Card (×N)` | React DevTools Components panel |
| No TypeScript errors | Problems panel is clean |
| No console errors | DevTools Console is clean |

---

## Quick Check Answers

**1. What happens when there are more flex-row children than the container is wide?**

By default, Flexbox wraps them to the next line (`flex-wrap: nowrap` is the default — no wrap) OR it shrinks them to fit, because `flex-shrink: 1` is also the default. The browser first tries to shrink items, then if they cannot shrink below their minimum size, they overflow the container. Without `overflow-x: auto`, the overflow is visible but the container does not scroll. With `overflow-x: auto`, the container provides a scrollbar for the overflow. For Kanban boards, we want: no shrink + overflow-x scroll.

**2. What controls sizing along the main axis in a flex row?**

`flex-grow`, `flex-shrink`, and `flex-basis` — collectively the "flex" properties. `flex-grow` determines how much of extra space an item claims. `flex-shrink` controls how much it gives up when space is tight. `flex-basis` is the starting size before growing or shrinking. For list columns, we want `flex-shrink: 0` (never shrink) and the default `flex-grow: 0` (never grow beyond natural size). The natural size is determined by the `max-width: 360px` on `.column`.

**3. How does CSS keep a header fixed while the content below scrolls?**

There are two approaches: `position: sticky; top: 0` keeps the header sticky relative to the scroll container. The layout we built uses a different approach: the header and board are in a `display: flex; flex-direction: column` parent. The header has `flex-shrink: 0` (fixed height). The board has `flex: 1` (takes remaining space). The board itself has `overflow-x: auto`. Only the board scrolls — the header is not inside the board's scroll container, so it stays put. Lab 07 will make the header properly sticky at the viewport level.

---

## Next Lab

In **LAB-07**, you will make the layout fully viewport-aware. The header will be sticky at the top using `position: sticky`. The board will be exactly the right height to fill the viewport below the header without causing a full-page scroll. This introduces `vh` units, `position: sticky`, and the `calc()` CSS function.
