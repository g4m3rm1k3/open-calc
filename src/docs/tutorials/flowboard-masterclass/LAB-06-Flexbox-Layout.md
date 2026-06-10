# FlowBoard Masterclass — LAB 06 — Flexbox Layout: Main and Cross Axes

**Prerequisites:** LAB-05 complete. You have `List` and `Card` components working. Your layout uses vertical flex.

**What this lab adds:**
- A mental model for Flexbox (main axis, cross axis, space negotiation) that transfers to any layout problem
- The `Board` component that renders multiple `List` components horizontally (FlowBoard application)
- Proof that this layout pattern works in sidebars, grids, and multi-column UIs (transfer)

**Time:** 75–90 minutes

---

## What You Will Build

**Before this lab:**
```
One vertical list of cards
```

**After this lab:**
```
Multiple lists side by side, horizontally scrollable
(The classic Trello/FlowBoard shape)
```

Visually: cards grouped into columns.  
Architecturally: a new layout primitive (horizontal flex) that you'll use forever.

---

## Quick Check — answer before reading further

1. What is the difference between the main axis and cross axis in Flexbox?
2. When do you use `flex-direction: row` vs `flex-direction: column`?
3. What does `flex-shrink: 0` do, and why would you use it?

*(Answers at the end of this lab)*

---

## The Problem (Raw Version First)

### What You Have Now

Your `App.tsx` renders one `List` with several cards. To add more lists (columns), you'd have to:
- Create the HTML structure for multiple lists
- Position them somehow
- Make them stay aligned

Here's what **does not work** without understanding layout:

```tsx
// This puts lists one on top of another (wrong for Trello)
<List items={todoCards} title="To Do" />
<List items={doingCards} title="Doing" />
<List items={doneCards} title="Done" />
```

The browser's default behavior is to stack everything vertically. You need to tell it: "put these side by side."

### Concrete Failure

Create a test in `App.tsx`:

```tsx
const todoCards = [
  { id: '1', title: 'Start sprint', label: 'Planning' },
];

const doingCards = [
  { id: '2', title: 'Fix auth bug', label: 'Bug' },
];

const doneCards = [
  { id: '3', title: 'Deploy to staging', label: 'DevOps' },
];

export default function App() {
  return (
    <div className="app">
      <List items={todoCards} title="To Do" />
      <List items={doingCards} title="Doing" />
      <List items={doneCards} title="Done" />
    </div>
  );
}
```

### SAVE AND TRY

You should see:
- Three lists, **stacked vertically** (wrong)
- Each list is full width (wrong)
- No side-by-side Trello board appearance

This is the **raw version pain**: browsers default to vertical stacking. You need a layout system to say "render horizontally."

---

## Abstraction Block 1: Flexbox as a Problem-Solving Mental Model

### What It Is

**Flexbox** is a system where:
- A parent container declares itself as "flexible"
- The parent negotiates space among its children
- Children can grow, shrink, or stay fixed size
- Everything stays aligned without hardcoding pixel positions

### The Core Concepts

#### 1. Main Axis vs Cross Axis

When you declare `display: flex`, you get:
- **Main axis**: the primary direction children flow
- **Cross axis**: the perpendicular direction

If `flex-direction: row`:
- Main axis = horizontal (left to right)
- Cross axis = vertical (top to bottom)

If `flex-direction: column`:
- Main axis = vertical (top to bottom)
- Cross axis = horizontal (left to right)

**What it hides:**
- You don't calculate pixel positions manually
- You don't write `position: absolute`
- You don't hardcode widths/heights in every child

**Protected invariant:**
- Items always stay aligned in their axis
- Space is distributed according to your rules, not by guessing
- Responsive: if container size changes, distribution adapts automatically

### The Raw Version (Without Flexbox)

Here's how people used to layout side-by-side items:

```css
/* Old way: position absolute (breaks everything) */
.list {
  position: absolute;
  left: 0;
  width: 300px;
  height: 600px;
}

.list:nth-child(2) {
  left: 320px;
  width: 300px;
}

.list:nth-child(3) {
  left: 640px;
  width: 300px;
}
```

**The pain:**
- Hardcoded pixel offsets (brittle)
- If you add a 4th list, you must calculate `left: 960px`
- If the container resizes, everything breaks
- If the items need different widths, you recalculate everything
- Responsive design is impossible without rewriting CSS at every breakpoint

**With Flexbox:**

```css
.board {
  display: flex;
  flex-direction: row;
  gap: 16px;
}

.list {
  flex: 0 0 300px; /* don't grow, don't shrink, base width 300px */
}
```

Position is automatic. Alignment is automatic. Responsive is free.

---

## Step 1 — Create the Board Component (Container)

Create `flowbard/src/Board.tsx`:

```tsx
import List from './List';
import type { CardData } from './Card';
import './Board.css';

interface BoardProps {
  lists: Array<{
    id: string;
    title: string;
    items: CardData[];
  }>;
}

export default function Board({ lists }: BoardProps) {
  return (
    <div className="board">
      {lists.map((list) => (
        <List
          key={list.id}
          title={list.title}
          items={list.items}
        />
      ))}
    </div>
  );
}
```

### Step 2 — Style the Board with Flexbox

Create `flowbard/src/Board.css`:

```css
.board {
  display: flex;
  flex-direction: row;
  gap: 24px;
  padding: 24px;
  overflow-x: auto;
  overflow-y: hidden;
  height: 100vh;
  background-color: #f5f5f5;
}
```

**Breaking down the CSS:**
- `display: flex` — children will be laid out flexibly
- `flex-direction: row` — children flow left to right (the main axis)
- `gap: 24px` — space between children on the main axis
- `overflow-x: auto` — horizontal scroll if lists exceed container width
- `height: 100vh` — take full viewport height
- `background-color: #f5f5f5` — light background like Trello

### Step 3 — Make Lists Non-Shrinking

Update `flowbard/src/List.css` to add a flex property:

```css
.list-container {
  flex: 0 0 320px; /* don't grow, don't shrink, base width 320px */
  display: flex;
  flex-direction: column;
  gap: 20px;
  max-height: 100%;
  overflow-y: auto;
}

.list-title {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #333;
  flex-shrink: 0;
}

.list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  flex: 1;
  overflow-y: auto;
}
```

**Breaking down `flex: 0 0 320px`:**
- First `0` = `flex-grow: 0` (don't claim extra space)
- Second `0` = `flex-shrink: 0` (don't give up your width)
- `320px` = `flex-basis: 320px` (start at 320px wide)

### Step 4 — Update App to Use Board

Update `flowbard/src/App.tsx`:

```tsx
import Board from './Board';
import type { CardData } from './Card';
import './App.css';

const todoCards: CardData[] = [
  { id: '1', title: 'Design new dashboard', label: 'Design' },
  { id: '2', title: 'Plan database schema', label: 'Planning' },
];

const doingCards: CardData[] = [
  { id: '3', title: 'Fix auth bug', label: 'Bug' },
];

const doneCards: CardData[] = [
  { id: '4', title: 'Deploy to staging', label: 'DevOps' },
  { id: '5', title: 'Document API', label: 'Docs' },
];

export default function App() {
  return (
    <Board
      lists={[
        { id: 'todo', title: 'To Do', items: todoCards },
        { id: 'doing', title: 'Doing', items: doingCards },
        { id: 'done', title: 'Done', items: doneCards },
      ]}
    />
  );
}
```

### SAVE AND TRY

You should see:
- Three columns side by side
- Each column has a title
- Each column has its own cards
- Columns do not move around
- Horizontal scroll appears if window is too narrow

Change something:
- Add a 4th list to the `lists` array in `App.tsx`
- Save and observe the 4th column appears automatically
- Columns stay aligned with no CSS changes

This proves the abstraction: the layout mechanism adapts to any number of lists without modification.

---

## Concept Block 2: Flex Direction as the Mental Model

### The Core Principle

`flex-direction` is the single most important Flexbox property because it defines the **flow direction** of everything else:

- `row` = horizontal, left to right
  - Main axis = horizontal (left to right)
  - `justify-content` aligns on the main axis (horizontal)
  - `align-items` aligns on the cross axis (vertical)

- `column` = vertical, top to bottom
  - Main axis = vertical (top to bottom)
  - `justify-content` aligns on the main axis (vertical)
  - `align-items` aligns on the cross axis (horizontal)

### The Raw Version (Confusion Without Axis Thinking)

```css
/* Broken: doesn't know about axes */
.container {
  display: flex;
  justify-content: center;
}
```

**Question:** Does this center horizontally or vertically?

**Answer:** You can't know without knowing `flex-direction`.

Without the axis mental model, Flexbox is confusing.

### With Axis Thinking

```css
.container {
  display: flex;
  flex-direction: row; /* main axis is horizontal */
  justify-content: center; /* center on main axis = center horizontally */
}
```

Or:

```css
.container {
  display: flex;
  flex-direction: column; /* main axis is vertical */
  justify-content: center; /* center on main axis = center vertically */
}
```

The same property (`justify-content`) does different things based on `flex-direction`. **Axis thinking** makes it predictable.

---

## Concept Block 3: Where Else This Applies (Transfer)

This is not a FlowBoard pattern. This is a **universal layout system**.

### Transfer Example 1: Email Application Sidebar + Message List

```
┌──────────┬─────────────┐
│ Sidebar  │ Message     │
│ (flex 0) │ List (flex) │
│          │             │
└──────────┴─────────────┘
```

Both use `flex-direction: row`:
- Sidebar: `flex: 0 0 250px` (fixed width)
- Content: `flex: 1` (takes remaining space)

```css
.email-app {
  display: flex;
  flex-direction: row;
}

.sidebar {
  flex: 0 0 250px;
}

.messages {
  flex: 1;
}
```

Exact same pattern.

### Transfer Example 2: Dashboard Layout (3 Columns)

```
┌──────────┬──────────┬──────────┐
│ Chart 1  │ Chart 2  │ Chart 3  │
│ (flex 1) │ (flex 1) │ (flex 1) │
└──────────┴──────────┴──────────┘
```

All equal width, flex-direction: row:

```css
.dashboard {
  display: flex;
  flex-direction: row;
  gap: 16px;
}

.chart {
  flex: 1; /* each takes 1/3 of space */
}
```

Same axes, same thinking.

### Transfer Example 3: Header + Body + Footer (Vertical Layout)

```
┌─────────────┐
│ Header      │ (fixed, flex-shrink: 0)
├─────────────┤
│             │
│ Main Body   │ (flex: 1, takes rest)
│             │
├─────────────┤
│ Footer      │ (fixed, flex-shrink: 0)
└─────────────┘
```

Uses `flex-direction: column`:

```css
.app-layout {
  display: flex;
  flex-direction: column;
  height: 100vh;
}

.header {
  flex-shrink: 0;
  height: 60px;
}

.body {
  flex: 1;
}

.footer {
  flex-shrink: 0;
  height: 40px;
}
```

Axes still apply: main axis is vertical, `justify-content` centers vertically.

---

## Step 5 — Verify the Abstraction: The List Stays Fixed Width

Try to add a 4th list with more cards:

```tsx
const backlogCards: CardData[] = [
  { id: '6', title: 'Research new framework', label: 'Research' },
  { id: '7', title: 'Set up CI/CD pipeline', label: 'DevOps' },
  { id: '8', title: 'Write deployment guide', label: 'Docs' },
];

export default function App() {
  return (
    <Board
      lists={[
        { id: 'todo', title: 'To Do', items: todoCards },
        { id: 'doing', title: 'Doing', items: doingCards },
        { id: 'done', title: 'Done', items: doneCards },
        { id: 'backlog', title: 'Backlog', items: backlogCards },
      ]}
    />
  );
}
```

### SAVE AND TRY

You should see:
- 4 columns, each still 320px wide (from `flex: 0 0 320px`)
- Horizontal scroll appears to let you scroll right
- Lists don't squeeze or grow
- New list appears automatically

This proves the abstraction: `flex: 0 0 320px` means "always 320px, never negotiate." You didn't have to change any code — the Flexbox system handled it.

---

## Concept Block 4: Why This Matters for "Build Any App"

Flexbox is not just for Trello. It's the layout system for:
- Mobile apps (React Native uses Flexbox)
- Web apps (every modern browser)
- Desktop UIs (Qt and GTK have flex-like concepts)
- Game UIs (many game engines use similar axis-based layouts)

**The transferable principle:**
- Declare a container as flexible
- Set the direction (row or column)
- Children negotiate space on that axis
- Cross-axis alignment happens automatically
- Responsive design is free

The app changes. The layout principle does not.

---

## Final Check

Verify these are all true:

- [ ] `Board.tsx` exists with `BoardProps` interface accepting `lists` array
- [ ] `Board.tsx` renders the `.map()` loop for lists
- [ ] `Board.css` has `display: flex` and `flex-direction: row`
- [ ] `List.css` has `flex: 0 0 320px` or similar fixed-width flex property
- [ ] Cards appear side-by-side in columns (not stacked vertically)
- [ ] Horizontal scroll works when lists exceed viewport width
- [ ] Adding a 5th list renders automatically with no component changes
- [ ] You can explain the main axis and cross axis for a given `flex-direction`

---

## Mistaken Use Case (And Why It Fails)

**Wrong way:**

```css
/* No flex-direction, trying to use row without understanding axes */
.board {
  display: flex;
}
```

Without `flex-direction: row`, the browser defaults to `flex-direction: row`, BUT you haven't proven you understand axes, and the next developer won't know what you meant.

**Correct way:**

```css
.board {
  display: flex;
  flex-direction: row; /* explicitly declare the main axis */
  gap: 24px; /* space on the main axis */
}
```

**Right way with explanation:**

Always declare `flex-direction` explicitly. Add a comment if it's non-obvious:

```css
.board {
  display: flex;
  flex-direction: row; /* lists flow left to right */
  gap: 24px;
  overflow-x: auto; /* scroll horizontally if needed */
}
```

---

## Abstraction Transfer Check — LAB 06

**Abstraction name:**  
Flexbox Layout: Main and Cross Axis

**What it hides:**
- Manual pixel positioning
- Responsive breakpoint calculations
- Space negotiation logic
- Child alignment complexity

**Protected invariant:**
- Children always align perpendicular to their flow direction
- Space is distributed according to flex rules, not hardcoded
- Adding or removing children doesn't break the layout
- Container size changes adapt automatically

**Raw version pain recap:**
- Without Flexbox: position absolute, hardcoded pixels per child, breaks on resize, fragile
- Every new item requires recalculation
- Responsive design requires media query overrides
- Horizontal scrolling requires JavaScript

**Where this applies outside FlowBoard:**
- Email clients (sidebar fixed, content flex)
- Dashboards (multiple columns, equal or custom widths)
- Mobile apps (flex layout, rotate between portrait/landscape)
- Games (UI menus with fixed and dynamic widths)
- E-commerce (product grid, responsive width)
- Chat apps (message thread with header/body/input)

**Misuse case:**

```css
/* Wrong: trying to do layout with hardcoded positions */
.list {
  position: absolute;
  left: 100px;
  width: 300px;
}

.list:nth-child(2) {
  left: 400px;
}
```

**Why it fails:**
- Adding a list requires new CSS rule
- Responsive design breaks
- Container resize is not handled
- Future developer doesn't know why positions are `100px` and `400px`

**Correct:**

```css
.board {
  display: flex;
  flex-direction: row;
}

.list {
  flex: 0 0 300px;
}
```

---

## End State Summary — LAB 06

**Files that exist:**
- `App.tsx` — manages three lists of data, renders `Board` with lists array
- `Board.tsx` — renders collection of `List` components horizontally
- `Board.css` — Flexbox row layout, overflow handling, container sizing
- `List.tsx` — renders `List` with vertical flex for items (unchanged logic, updated CSS)
- `List.css` — `list-container` now has `flex: 0 0 320px` for fixed width; `.list` has `flex: 1` for remaining space
- `Card.tsx` — unchanged from LAB-04
- `Card.css` — unchanged from LAB-04

**What the app does right now:**
The app renders three columns (lists) side by side, styled like Trello. Each column has a title and cards. Columns are fixed 320px wide and horizontally scrollable if they exceed viewport width. The layout is purely CSS-based (Flexbox), no JavaScript positioning logic. New lists render automatically by adding to the array.

**Concepts now in the registry from this lab:**
- Flexbox (`display: flex`)
- `flex-direction` (row vs column)
- Main axis and cross axis terminology
- `flex` shorthand (`flex: 0 0 320px`)
- `overflow-x` and `overflow-y` for scroll control
- `gap` property for spacing

**Next lab will add:**
The sidebar navigation component that will sit to the left of the board, introducing a new overall app layout.
