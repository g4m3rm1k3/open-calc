# FlowBoard Masterclass — LAB 04 — Flexbox Column Layout

**Prerequisites:** LAB-03 — Styling the Card. You have styled cards rendering from an array. Each card has padding, border, border-radius, and shadow.

**What this lab adds:**
- Cards arranged in a controlled column with consistent spacing between them
- A maximum-width container so cards don't stretch edge-to-edge on wide screens
- Understanding of Flexbox — what it is, when to use it, and how its five core properties work

**Time:** 45–60 minutes

---

> **Quick Check — try to answer before reading further:**
>
> 1. Right now the cards stack vertically because `<div>` elements are block-level by default. What do you think happens to that stacking if you write `display: flex` on the parent container?
> 2. `gap: 12px` on a flex container. What do you think `gap` is — margin on each child, or something the parent controls?
> 3. The cards currently stretch the full width of the browser window. On a 1920px monitor, a card that wide is hard to read. How would you constrain the width?
>
> *(Answers at the end of this lab)*

---

## What You Will Build

By the end of this lab, the cards are in a clean centered column with 12px of space between them and a maximum width of 360px — the standard width for a Kanban list column. The cards no longer depend on margin collapse for spacing.

```
(before — cards full width, spacing from default browser behavior)
│ Fix login button ─────────────────────────────────────────── │
│ The login button does not respond on mobile screens.         │
│                                                               │
│ Update homepage hero image ──────────────────────────────── │
│ ...

(after — cards in a constrained column with controlled gap)
│        ┌──────────────────────────────┐                      │
│        │ Fix login button             │                      │
│        │ The login button does not    │                      │
│        │ respond on mobile.           │                      │
│        └──────────────────────────────┘                      │
│        ┌──────────────────────────────┐                      │
│        │ Update homepage hero image   │                      │
│        │ New design in Figma.         │                      │
│        └──────────────────────────────┘                      │
```

This column layout is exactly what a list column on the FlowBoard will look like. Every subsequent lab builds on this structure.

---

## Concept: Why Default Block Layout Isn't Enough

Before learning Flexbox, see the problem it solves.

**What `<div>` does by default:**

A `<div>` is a block-level element. Block-level means it:
1. Takes up 100% of its parent's width
2. Forces the next element onto a new line below it

This is why your cards currently stack vertically and stretch edge-to-edge. No CSS is needed for this behavior — it is the browser default.

**What is wrong with just using the default:**

- You cannot control the space between items without using margin on individual items
- Margin on items is fragile — vertical margins collapse (Lab 03 Quick Check Answers)
- You cannot easily center items or distribute them
- You cannot make items line up in a row

**The gap problem specifically:**

Right now you likely have no margin on the `.card` class. The browser adds a default top margin to `<h3>` elements inside the cards, which creates some visual separation — but that is incidental, not controlled. If you remove the `<h3>` or change it to a `<span>`, the spacing changes unexpectedly.

Try it: add two cards with very short content and notice the inconsistent spacing. The space between cards comes from `<h3>` margin, not from a layout decision you made.

Flexbox gives you explicit, intentional control.

---

## Concept: Flexbox

**What it is:** Flexbox (Flexible Box Layout) is a CSS layout mode that makes a container responsible for arranging its direct children. You put `display: flex` on the parent and it gains control over how its children are positioned, sized, and spaced.

**What it hides:** The browser's default block and inline layout algorithms. Without Flexbox, child elements position themselves according to their own `display` type (block, inline, inline-block). With Flexbox, the parent takes over the layout decisions, and the children's default positioning is overridden.

**The protected invariant:** Flexbox layout is entirely determined by the parent's rules and the children's sizes. Children cannot position themselves relative to each other — only the parent container does that. This means changing the layout of a list means changing one place (the container's CSS), not every item's CSS.

**The main axis and cross axis:**

Flexbox has two axes. The direction of stacking is the **main axis**. Perpendicular to it is the **cross axis**.

```
flex-direction: row (default)

main axis →  [item 1]  [item 2]  [item 3]
                  ↕ cross axis
```

```
flex-direction: column (what we want for the card list)

main axis
↓
[item 1]
↓
[item 2]
↓
[item 3]
    ↔ cross axis
```

**The five properties you need for column layout:**

| Property | What it controls | Value we use |
|---|---|---|
| `display: flex` | Activates Flexbox on the container | required |
| `flex-direction` | Main axis direction: row or column | `column` |
| `gap` | Space between children (not margin) | `12px` |
| `align-items` | Alignment on the cross axis | `stretch` (default) |
| `width` / `max-width` | Container width constraint | `max-width: 360px` |

**Canonical example:**

```css
/* A vertical list with gaps — no margins on children needed */
.list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
```

```html
<div class="list">
  <div class="item">Item 1</div>  <!-- gap adds 12px below this -->
  <div class="item">Item 2</div>  <!-- gap adds 12px below this -->
  <div class="item">Item 3</div>  <!-- no gap after the last item -->
</div>
```

`gap` is the parent telling children how far apart to space them. Unlike margin, `gap` does not apply after the last item, never collapses, and works identically for any number of items.

**Alternative to Flexbox for stacking:** Block layout with `margin-bottom` on each `.card`. The tradeoff: margin on items means changing spacing requires updating every item class, and the last item has extra spacing that must be canceled with `:last-child { margin-bottom: 0 }`. Flexbox `gap` on the parent is one rule that works for any number of children with no last-item exception. Use Flexbox.

**Alternative to `flex-direction: column`:** CSS Grid. Grid is more powerful for two-dimensional layouts (rows AND columns simultaneously). For a single column or single row, Flexbox is simpler and sufficient. We will use Grid in Lab 07 when we need to divide the page into multiple regions.

**You will see this again in:** Every modern CSS layout. Flexbox is the primary layout tool for navigation bars, button groups, card lists, form rows, sidebars, and toolbars. It is a required skill for any frontend role and tested in every CSS interview.

**Watch for:** `display: flex` is set on the **parent**, not the children. This is the most common Flexbox mistake. If you set `display: flex` on a card, you are making the card a flex container for the `h3` and `p` inside it — not arranging the cards themselves. The parent that wraps all the cards is what gets `display: flex`.

---

## Concept: `max-width` and `width`

**What it is:** `max-width` sets an upper limit on how wide an element can grow. The element can be narrower (if its content is narrow or the viewport is small) but it will never exceed the specified maximum.

**The problem before:**

Without a width constraint, a flex column grows to fill its parent container. On a wide monitor, a card might be 1600px wide — the text is spread thin and hard to read. A column of task cards should be a fixed, compact width regardless of screen size.

**`width` vs `max-width`:**

```css
width: 360px;       /* always exactly 360px — overflows on 300px screens */
max-width: 360px;   /* up to 360px — shrinks naturally on small screens */
```

`max-width` is the responsive choice. The element is as wide as it needs to be, up to the limit.

**Project application:** The card column container gets `max-width: 360px`. On a desktop screen it is 360px. On a phone with a 320px screen, it shrinks to fit.

**You will see this again in:** Every responsive layout. `max-width` on a centered container is the standard technique for keeping content readable on wide screens. It is also used on images to prevent them from exceeding their natural dimensions.

---

## Step 1 — See the problem: full-width cards

Before making any changes, take a screenshot in your mind (or literally) of the current state. Cards stretch edge-to-edge. The spacing between them is from `<h3>` default margins, not from a layout decision.

To make the problem obvious, temporarily add some margin to the page body. Open `src/index.css` and check its current contents. It likely has some default Vite styles. Do not touch it yet — just observe.

Open DevTools → Elements → click on a `.card` div. In the Box Model panel (right side), look at its width. On a standard laptop, it will likely be `700px` or wider — the full width of the viewport.

Now you are going to fix this with Flexbox.

---

## Step 2 — Add a `CardList` wrapper in `App.tsx`

The flex container needs to wrap the cards. Right now the cards are children of a plain `<div>` in `App`. You will give that div a class name and style it.

Update `App.tsx`:

```tsx
// App.tsx

import { Card } from './components/Card';
import './App.css'; // ← add this — we will create App.css with the container styles

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
    // app-layout is the outermost container — controls page-level layout
    <div className="app-layout">
      {/* card-list is the flex container — directly wraps the Card components */}
      <div className="card-list">
        {INITIAL_CARDS.map(({ id, title, description }) => (
          <Card
            key={id}
            title={title}
            description={description}
          />
        ))}
      </div>
    </div>
  );
}

export default App;
```

### SAVE AND TRY

Save `App.tsx`. Nothing visually changes yet — the classes exist but have no rules. No errors in the console.

**Verify the structure:** DevTools → Elements. You should see:

```html
<div class="app-layout">
  <div class="card-list">
    <div class="card">...</div>
    <div class="card">...</div>
    <div class="card">...</div>
  </div>
</div>
```

This is the nesting structure Flexbox needs: `card-list` is the parent, the `card` divs are its children.

---

## Step 3 — Create `App.css` and add the container layout

Open `src/App.css`. Vite's default project has this file filled with demo styles. **Delete all its contents** and replace with:

```css
/* App.css */

/* app-layout is the outermost wrapper for the whole application.
   padding: 24px gives the page breathing room from the viewport edge.
   min-height: 100vh means it covers the full browser height even with little content.
   A gray background makes the white cards visually distinct. */
.app-layout {
  padding: 24px;
  min-height: 100vh;
  background-color: #f7fafc;
}
```

### CSS AND SEE

Save. Look at the browser.

**You should see:** The page now has a light gray background. The cards have 24px of space from the edges of the browser window. The cards themselves are still full-width inside the container.

---

## Step 4 — Apply Flexbox to the card list

Now add the Flexbox rules to `.card-list` in `App.css`:

```css
/* App.css */

.app-layout {
  padding: 24px;
  min-height: 100vh;
  background-color: #f7fafc;
}

/* card-list is the flex container for the Card components.
   display: flex activates Flexbox on this element.
   flex-direction: column stacks children vertically (main axis = top to bottom).
   gap: 12px puts 12px of space between each card — no margins on cards needed. */
.card-list {
  display: flex;              /* ← activates Flexbox */
  flex-direction: column;     /* ← stack cards top-to-bottom */
  gap: 12px;                  /* ← 12px space between each card */
}
```

### CSS AND SEE

Save. Look at the browser.

**You should see:** Cards are stacked vertically with consistent 12px gaps between them. The spacing looks more intentional than before — it is controlled by the parent, not by `<h3>` default margins.

**Verify in DevTools:** DevTools → Elements → click `.card-list`. In the Styles panel, you see the flex rules. In the browser viewport, you may see a "flex" badge on the element in the Elements panel — that is DevTools confirming it is a flex container.

**The gap in action:** DevTools → Layout panel (or hover over the element in Elements) — you can see the 12px gap regions between the cards.

---

## Step 5 — Constrain the width

Add `max-width` and centering to `.card-list`:

```css
.card-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  max-width: 360px;   /* ← cards never wider than 360px */
}
```

### CSS AND SEE

Save. Look at the browser.

**You should see:** The cards are now 360px wide (or narrower on small screens). There is space to the right of the column on a wide screen.

**Experiment:** Change `max-width: 360px` to `max-width: 600px`. The cards grow wider. Change to `max-width: 200px`. The cards are narrow — text wraps. Change back to `360px`.

**Optional centering:** If you want the column centered in the page rather than left-aligned, add `margin: 0 auto` to `.card-list`. This is the classic technique for centering a block element: set left and right margins to `auto`, and the browser distributes the remaining space equally on both sides.

```css
.card-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  max-width: 360px;
  margin: 0 auto; /* ← centers the column horizontally */
}
```

We will leave centering as optional for now — in Lab 06 when we add multiple columns side by side, `margin: 0 auto` on the list would conflict with the horizontal layout.

---

## Step 6 — Verify `align-items` behavior

`align-items` controls how children are aligned on the **cross axis** (horizontal, when `flex-direction: column`).

The default is `align-items: stretch` — children stretch to fill the full width of the flex container. This is why the cards fill the 360px width even though their content might only need 200px.

**Try the alternative:**

```css
.card-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  max-width: 360px;
  align-items: flex-start; /* ← try this */
}
```

### CSS AND SEE

Save. The cards now shrink to their content width — they are no longer the same width. This is `align-items: flex-start` — children sit at the start of the cross axis and size to their content.

This is wrong for our layout — we want cards to be the same consistent width. Change it back to the default (remove the `align-items` line, or set `align-items: stretch`).

**The key insight:** `stretch` (the default) makes all children fill the container's cross-axis dimension. `flex-start` lets them be their natural size. Understanding this default behavior prevents a common confusion: "why are my flex children all the same width even though I didn't set a width?"

---

## 🎯 Challenge: Add a visible column header

**You know:** Flexbox, `className`, CSS box model, component structure

**Task:** Above the card list, add a column header that says "To Do" with a count of how many cards are in the list. The header should be the same width as the card list (360px). Style it to look distinct from the cards — perhaps a slightly different background or font weight.

**Starting code:** Your current `App.tsx` and `App.css`.

**Hints:**

1. The count can come from `INITIAL_CARDS.length`
2. In JSX, embed a JavaScript expression in curly braces: `{INITIAL_CARDS.length}`
3. The header can be a `<div>` with its own class name, placed above the `<div className="card-list">`

Try for at least 5 minutes before revealing the solution.

---

<details>
<summary>▶ Show Solution</summary>

In `App.tsx`:

```tsx
function App() {
  return (
    <div className="app-layout">
      <div className="column">
        {/* Column header — shows the list name and card count */}
        <div className="column-header">
          <span className="column-title">To Do</span>
          <span className="column-count">{INITIAL_CARDS.length}</span>
        </div>

        <div className="card-list">
          {INITIAL_CARDS.map(({ id, title, description }) => (
            <Card
              key={id}
              title={title}
              description={description}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
```

In `App.css`, add:

```css
.column {
  max-width: 360px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.column-header {
  display: flex;
  justify-content: space-between; /* title left, count right */
  align-items: center;
  padding: 8px 4px;
}

.column-title {
  font-weight: 600;
  font-size: 14px;
  color: #2d3748;
}

.column-count {
  font-size: 12px;
  color: #718096;
  background-color: #edf2f7;
  border-radius: 12px;
  padding: 2px 8px;
}
```

And update `.card-list` to remove `max-width` (the parent `.column` now controls it):

```css
.card-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
```

**Key insight:** `justify-content: space-between` is a new Flexbox property — when `flex-direction: row` (the default), it pushes the first child to the left and the last child to the right, with space distributed between them. Two items with `space-between` produces a perfect left/right split.

</details>

---

## Final Check

| Feature | How to Verify |
|---|---|
| `App.css` imported in `App.tsx` | First import in `App.tsx` includes `'./App.css'` |
| Cards have `.card-list` as their parent container | DevTools → Elements shows `div.card-list` wrapping the `div.card` elements |
| Cards stack vertically with `flex-direction: column` | DevTools → Styles on `.card-list` shows `flex-direction: column` |
| Cards have 12px gap between them | DevTools → Layout panel or visual inspection shows equal spacing |
| Card column is max 360px wide | DevTools → Box Model panel on `.card-list` shows width ≤ 360px |
| Page has gray background | Browser shows `#f7fafc` background |
| No margin-collapse spacing between cards | Spacing is consistent — no extra space before or after any card |
| No TypeScript errors | Problems panel is clean |
| No console errors | DevTools → Console is clean |

---

## Quick Check Answers

**1. What happens when you write `display: flex` on the parent?**

The parent becomes a flex container. Its direct children become flex items and lose their default block behavior — they no longer automatically take up 100% width or force new lines. Instead, they flow along the flex container's main axis (horizontally by default, vertically with `flex-direction: column`). The key insight: `display: flex` is set on the **parent**, not the children. The parent takes control of how its children are arranged.

**2. Is `gap: 12px` margin on each child, or something the parent controls?**

Something the parent controls. `gap` is a property of the flex container, not the children. It tells the browser to place 12px of space between each adjacent pair of children. Unlike margin, `gap` does not apply after the last child, never collapses, and the children themselves have no knowledge of it. To change the spacing, you change one line on the parent, not styles on every child.

**3. How would you constrain a card's width so it doesn't stretch across a wide screen?**

Use `max-width` on the container element — the element that wraps the cards. For example, `max-width: 360px` means the container will be at most 360px wide, regardless of the viewport size. The cards inside a flex column stretch to fill their parent (due to `align-items: stretch` default), so constraining the parent constrains the cards automatically. `max-width` is preferred over `width` because `max-width` is responsive — on a narrow screen, the container shrinks below 360px naturally, while a fixed `width: 360px` would overflow.

---

## Next Lab

In **LAB-05**, you will extract the column into its own `<List />` component. Right now `App.tsx` mixes the data (`INITIAL_CARDS`) with the layout logic (the `.card-list` div). A `List` component will own the visual list structure — `App` will only be responsible for which lists exist. This is the concept of component composition: building complex UI from simple, single-purpose pieces.
