# FlowBoard Masterclass — LAB 07 — Viewport Layout: Sticky Header and Full-Height Board

**Prerequisites:** LAB-06 — The Board. You have a dark header bar and a board area with horizontally scrollable columns.

**What this lab adds:**
- The board fills exactly the viewport height below the header — no full-page vertical scroll
- The header stays fixed at the top when the board scrolls vertically
- `vh` units for viewport-relative sizing
- `calc()` to subtract the header height from the viewport
- `position: sticky` to anchor the header to the viewport top
- `overflow-y: auto` for the board's own vertical scroll

**Time:** 40–55 minutes

---

> **Quick Check — try to answer before reading further:**
>
> 1. `100vh` means 100% of the viewport height. If the header is 52px tall, how would you express "the viewport height minus the header"?
> 2. A sticky element says "scroll with the page until you hit the top, then stick there." How is that different from `position: fixed`?
> 3. Right now if a list has many cards, the whole page scrolls vertically. What would make only the board area scroll, not the page?
>
> *(Answers at the end of this lab)*

---

## What You Will Build

The layout will have three distinct regions:
1. A header that sticks to the top of the viewport at all times
2. A board area below the header that fills the remaining viewport height
3. Scrolling (horizontal and/or vertical) happens inside the board — the page itself never scrolls

```
┌──────────────── Viewport ────────────────┐
│  ┌──────────── .app-header ────────────┐ │  52px, sticky — never scrolls
│  │  FlowBoard                          │ │
│  └─────────────────────────────────────┘ │
│  ┌──────────── .board-area ────────────┐ │  calc(100vh - 52px) tall
│  │  [To Do]  [In Progress]  [Done]     │ │  ← scrolls horizontally
│  │  ...       ...            ...       │ │  ← scrolls vertically if needed
│  │  (this area scrolls, page does not) │ │
│  └─────────────────────────────────────┘ │
└──────────────────────────────────────────┘
```

---

## Concept: Viewport Units — `vh` and `vw`

**What it is:** `vh` stands for "viewport height." `1vh` = 1% of the browser window's visible height. `100vh` = the full visible height. Similarly, `vw` = viewport width.

**The problem before:**

Right now `app-layout` has `min-height: 100vh`. The board fills the viewport when there is little content, but if a list has many cards, the page grows and a full-page scrollbar appears. We want the board to be exactly tall enough to fill the space below the header — no more, no less.

**What percentage cannot do:**

You might try `height: 100%` on the board. This means "100% of my parent's height." But the parent needs a height for that to work, and the parent's parent does too, all the way up to `<body>` and `<html>`. Getting percentage heights to work consistently requires setting `height: 100%` on every ancestor — fragile and verbose.

`100vh` breaks this chain. It does not care about parent heights — it measures directly against the viewport.

**You will see this again in:** Modals (centered, full-screen overlays), hero sections ("fold" content that fills the first screen), sidebars that fill screen height, and any layout where something must be exactly as tall as the browser window.

---

## Concept: `calc()` — Math in CSS

**What it is:** `calc()` lets you perform arithmetic directly inside a CSS value. You can mix units — `calc(100vh - 52px)` subtracts 52px from 100% of the viewport height.

**Why this is needed:**

The board should be `viewport height minus header height`. In code:

```css
/* board height = all the viewport, minus the 52px header */
height: calc(100vh - 52px);
```

Without `calc()`, you cannot express this in CSS. You would need JavaScript to read the header's height and set the board's height dynamically. `calc()` handles this at pure CSS level.

**Supported operators:** `+`, `-`, `*`, `/`. The spaces around `+` and `-` are required — `calc(100vh-52px)` is invalid, `calc(100vh - 52px)` is valid.

**You will see this again in:** Anywhere fixed and fluid units mix — sidebars with a fixed toolbar on top, elements that must avoid a fixed footer, responsive columns with fixed gutters (`calc(33.33% - 16px)`).

---

## Concept: `position: sticky` vs `position: fixed`

**What it is:** `position: sticky` makes an element scroll with the page normally, but when it reaches a specified threshold (like `top: 0`), it "sticks" and stays in place for the rest of the scroll. `position: fixed` removes the element from the normal flow entirely — it always stays at its position relative to the viewport, regardless of scrolling.

**The key difference:**

```
position: fixed:
- Does NOT take up space in the document flow
- All other content ignores it — you must add padding/margin manually to prevent overlap
- Stays fixed even when the scroll container is not the page

position: sticky:
- DOES take up space in the document flow
- Content naturally flows below it — no overlap
- Only sticks within its parent's bounds — when the parent scrolls away, the sticky element goes with it
```

**Why we use `sticky` here:**

The header is inside the `app-layout` div. Using `sticky` means it holds its space in the layout, so the board area automatically starts below it. Using `fixed` would require us to manually add a 52px top margin or padding to the board area to prevent overlap.

**When to use `fixed`:** Floating action buttons, cookie consent bars, or anything that must be visible regardless of which scroll container is active on the page.

**You will see this again in:** Table headers that stay visible while data rows scroll, section navigation that highlights as you scroll ("scrollspy"), shopping cart drawers that stick to the right side.

---

## Step 1 — Diagnose the current layout problem

Before changing anything, deliberately reproduce the problem to understand what you are fixing.

In `App.tsx`, add a list with many cards to `BOARD_DATA`:

```tsx
{
  id: 'list-review',
  title: 'Review',
  cards: [
    { title: 'Card 1', description: 'Description for card one.' },
    { title: 'Card 2', description: 'Description for card two.' },
    { title: 'Card 3', description: 'Description for card three.' },
    { title: 'Card 4', description: 'Description for card four.' },
    { title: 'Card 5', description: 'Description for card five.' },
    { title: 'Card 6', description: 'Description for card six.' },
    { title: 'Card 7', description: 'Description for card seven.' },
    { title: 'Card 8', description: 'Description for card eight.' },
  ],
},
```

### SAVE AND TRY

Save. In the browser, scroll down.

**You should see:** The whole page scrolls. The header scrolls away. The board area gets taller. This is the behavior we are about to fix.

Now you understand the exact problem. Let's fix it.

---

## Step 2 — Make the header sticky

In `App.css`, add `position: sticky` and `top: 0` to `.app-header`:

```css
.app-header {
  background-color: #2d3748;
  padding: 0 24px;
  height: 52px;
  display: flex;
  align-items: center;
  flex-shrink: 0;
  position: sticky;   /* ← stick to the scroll container */
  top: 0;             /* ← stick when the element reaches 0px from the top */
  z-index: 10;        /* ← stay on top of card content that scrolls under it */
}
```

`z-index: 10` is needed because when cards scroll under the header, they would visually overlap the header text without it. Higher `z-index` values render "in front of" lower values.

### SAVE AND TRY

Save. In the browser, scroll down.

**You should see:** The header stays at the top as you scroll! The board content scrolls behind it.

**But notice:** The page still scrolls — the board area is still growing to hold all content. The header problem is fixed, but the board still extends the page. Fix this in the next step.

---

## Step 3 — Give the board a fixed height

The board should be exactly `100vh - 52px` (viewport height minus header height). Update `Board.css`:

```css
/* Board.css */

.board-area {
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  gap: 12px;
  overflow-x: auto;
  overflow-y: auto;                   /* ← also allow vertical scroll inside the board */
  padding: 20px 24px 24px 24px;
  height: calc(100vh - 52px);        /* ← exactly fill the space below the header */
  box-sizing: border-box;            /* ← padding is included in the height calculation */
}
```

Two key additions:
1. `height: calc(100vh - 52px)` — the board's height is fixed at "viewport minus header"
2. `overflow-y: auto` — if a list has more cards than the board height allows, the board scrolls vertically

### SAVE AND TRY

Save. In the browser:

**You should see:**
- The page no longer scrolls vertically
- The board fills the exact space below the header
- The "Review" list with 8 cards causes the board area itself to scroll vertically (not the page)
- The header remains fixed at the top in all cases

**Test all scrolling directions:**
1. Make the browser window narrow — horizontal scrollbar on the board ✓
2. The "Review" list has many cards — vertical scrollbar on the board ✓
3. Scroll in both directions — the header never moves ✓

---

## Step 4 — Remove the debug "Review" list

Now that the layout works, remove the 8-card "Review" list from `BOARD_DATA` in `App.tsx`. Keep only "To Do", "In Progress", and "Done".

### SAVE AND TRY

Save. The page shows three clean columns. The board fills the space below the header. No page scroll.

---

## Step 5 — Extract the header height as a CSS custom property

Right now `52px` appears in two places: `.app-header`'s height and `.board-area`'s `calc()`. If you change the header height, you must update both. CSS custom properties (CSS variables) eliminate this duplication.

In `App.css`, add this to the `:root` selector at the top of the file, then update the `.app-header` rule to use it:

```css
/* App.css — full file */

/* :root is the top-level selector — custom properties defined here 
   are available to every element in the document. */
:root {
  --header-height: 52px;
}

.app-layout {
  background-color: #f0f4f8;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.app-header {
  background-color: #2d3748;
  padding: 0 24px;
  height: var(--header-height);       /* ← use the variable */
  display: flex;
  align-items: center;
  flex-shrink: 0;
  position: sticky;
  top: 0;
  z-index: 10;
}

.app-name {
  color: white;
  font-size: 18px;
  font-weight: 700;
  letter-spacing: 0.02em;
}
```

And update `Board.css` to reference the same variable:

```css
/* Board.css */

.board-area {
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  gap: 12px;
  overflow-x: auto;
  overflow-y: auto;
  padding: 20px 24px 24px 24px;
  height: calc(100vh - var(--header-height));   /* ← use the variable */
  box-sizing: border-box;
}
```

### SAVE AND TRY

Save. Visually nothing changes. But now if you change `--header-height: 52px` to `--header-height: 64px` in `:root`, both the header and the board update instantly. Try it, then put it back to `52px`.

---

## 🎯 Challenge: Add a second sticky element — a board title bar

**You know:** `position: sticky`, CSS custom properties, flex column layout

**Task:**

Add a thin "board title" bar between the header and the columns. It should:
1. Show the text "My Project Board" 
2. Have a light background (`#e2e8f0`) and 8px top/bottom padding
3. Stick to the top below the header when the board scrolls vertically
4. Update the `calc()` in `.board-area` to account for the new bar's height

**Hints:** You need to know the title bar's height. Set an explicit height or use another CSS variable. Stack two sticky elements by setting `top: var(--header-height)` on the second one.

---

<details>
<summary>▶ Show Solution</summary>

In `App.tsx`:
```tsx
function App() {
  return (
    <div className="app-layout">
      <header className="app-header">
        <span className="app-name">FlowBoard</span>
      </header>

      {/* Board title bar — sticks below the header */}
      <div className="board-title-bar">
        <span className="board-title">My Project Board</span>
      </div>

      <Board lists={BOARD_DATA} />
    </div>
  );
}
```

In `App.css`, add to `:root` and add a new rule:
```css
:root {
  --header-height: 52px;
  --board-title-height: 40px;
}

/* (after .app-header rule) */
.board-title-bar {
  height: var(--board-title-height);
  background-color: #e2e8f0;
  display: flex;
  align-items: center;
  padding: 0 24px;
  flex-shrink: 0;
  position: sticky;
  top: var(--header-height);   /* stick just below the header */
  z-index: 9;                  /* slightly behind the header if they overlap */
}

.board-title {
  font-size: 14px;
  font-weight: 600;
  color: #4a5568;
}
```

In `Board.css`, update the `calc()`:
```css
height: calc(100vh - var(--header-height) - var(--board-title-height));
```

**Key insight:** Multiple sticky elements stack by setting each one's `top` to the combined height of the sticky elements above it. CSS variables make this maintainable — change `--header-height` once, and every calculation that references it updates automatically. This is the CSS equivalent of a named constant.

> You can remove the board title bar before continuing — it was a learning exercise.

</details>

---

## Final Check

| Feature | How to Verify |
|---|---|
| Header stays at top when board scrolls | Scroll the board — header does not move |
| Board fills exactly viewport height below header | No dead space below board, no page scrollbar |
| Horizontal scroll works when many columns | Narrow the window — scrollbar appears on board |
| Vertical scroll works inside board (not page) | Add a long list — board scrolls, page does not |
| `calc(100vh - var(--header-height))` used in Board.css | Check the rule in Board.css |
| `--header-height` defined in `:root` | Check App.css :root block |
| Changing `--header-height` value updates both header and board | Test by changing the value temporarily |
| No TypeScript errors | Problems panel clean |
| No console errors | Browser Console clean |

---

## Quick Check Answers

**1. How do you express "viewport height minus the header"?**

`calc(100vh - 52px)`. Or better, using a CSS variable: `calc(100vh - var(--header-height))`. `calc()` evaluates the math at render time — the browser computes the pixel value from the current viewport height minus 52px.

**2. How is `position: sticky` different from `position: fixed`?**

`position: fixed` removes the element from the document flow. No space is reserved for it — other content fills in as if it does not exist. You must manually offset other content (e.g., `margin-top: 52px`) to prevent overlap. `position: sticky` keeps the element in the document flow — space is reserved for it just like a normal element. It scrolls with the page normally, then sticks when it reaches its `top` threshold. The header in this lab uses `sticky` so the board naturally starts below it with no manual offset.

**3. What makes only the board area scroll, not the page?**

Setting an explicit `height` (or `max-height`) on the board container combined with `overflow-y: auto`. When the container has a fixed height, it cannot expand to hold overflowing content — instead, the overflow triggers the scrollbar inside the container. If the container has no explicit height, it expands to hold all content, the page grows, and the page scrollbar appears.

---

## Next Lab

In **LAB-08**, you will add interactivity. The board is currently static — all card data is hardcoded. You will add an input field to each list that lets you type a card title and press Enter to add it. This introduces `useState`, event handlers, and the concept of controlled inputs — the foundation of all user interaction in React.
