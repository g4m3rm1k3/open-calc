# Junior to Senior — T12·L8 — Flexbox

**Prerequisites:** T12·L7 (Spacing Systems). You have a spacing scale. This lesson
teaches Flexbox — the layout model for arranging items in a single row or column. You
will understand what the main axis is, why items grow and shrink, and how alignment
properties work, so you can predict layout instead of guessing.

**What this lab adds:**
- `display: flex` — what it does to the parent and to children
- The main axis vs cross axis — why alignment properties have different names
- `flex-direction`, `justify-content`, `align-items`
- `flex-grow`, `flex-shrink`, `flex-basis` — the three-value flex model
- `flex-wrap` — when children overflow vs wrap
- `gap` as the primary spacing tool inside flex containers
- Real components: navigation bar, button group, card row, sidebar layout

**Time:** 60–90 minutes

---

> **Quick Check — try to answer before reading:**
>
> 1. A flex container has `flex-direction: row`. You use `justify-content: space-between`.
>    Which axis does `justify-content` control — horizontal or vertical?
> 2. A flex child has `flex-grow: 1`. Its sibling has `flex-grow: 2`.
>    The container has 300px of free space. How much does each child get?
> 3. You have a row of buttons. The container is `display: flex`. You want the last
>    button to stick to the far right regardless of how many buttons are before it.
>    Which single CSS property on the LAST button achieves this?
>
> *(Answers at the end of this lab)*

---

## The Problem This Lesson Solves

You have three boxes. You want them side by side, centered vertically, with equal space
between them. You try `float: left`. They work but overflow the parent. You try
`display: inline-block`. There are mysterious gaps between elements. You add
`vertical-align: middle`. Something shifts. You spend an hour on Stack Overflow.

Flexbox is the solution to this exact class of problem. Once you understand the two-axis
model, you can place items anywhere in a container with two or three properties.

---

## Step 1 — The Problem Without Flexbox

Create `flexbox.html` in your `css-foundations` folder:

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Flexbox</title>
  <style>
    *, *::before, *::after { box-sizing: border-box; }

    :root {
      --space-1: 0.25rem;
      --space-2: 0.5rem;
      --space-3: 0.75rem;
      --space-4: 1rem;
      --space-5: 1.5rem;
      --space-6: 2rem;
      --space-7: 3rem;
    }

    body { font-family: sans-serif; max-width: 900px; margin: 40px auto; padding: 0 var(--space-4); }

    .box {
      background: cornflowerblue;
      color: white;
      padding: var(--space-3) var(--space-4);
      border-radius: 4px;
    }
  </style>
</head>
<body>
  <h2>Without flex — blocks stack vertically:</h2>
  <div>
    <div class="box">Box 1</div>
    <div class="box">Box 2</div>
    <div class="box">Box 3</div>
  </div>
</body>
</html>
```

### CSS AND SEE

**You should see:** Three blue boxes stacked vertically — each takes the full width.
This is the default: `div` is a block element, block elements stack vertically.

---

## Concept: `display: flex` — The Flex Container

**What it is:** Setting `display: flex` on an element turns it into a **flex container**.
Its DIRECT children become **flex items** and obey Flexbox layout rules instead of
the normal block/inline rules.

**What changes immediately (with no other flex properties):**
- Children line up in a horizontal row (left to right)
- Children shrink to fit their content (no longer full-width)
- Children line up along the same baseline

**The two axes:**

```
flex-direction: row (default)
─────────────────────────────→  MAIN AXIS (left to right)
│
│   [Box 1] [Box 2] [Box 3]
│
↓  CROSS AXIS (top to bottom)
```

The **main axis** is the direction items are placed.
The **cross axis** is perpendicular to it.

This distinction matters because the alignment properties each control one axis:
- `justify-content` — aligns items along the MAIN axis
- `align-items` — aligns items along the CROSS axis

With `flex-direction: row`: main = horizontal, cross = vertical.
With `flex-direction: column`: main = vertical, cross = horizontal.

**What it hides:** The block formatting context of the children. Flex items no longer
have margins that collapse, they no longer become full-width, and `vertical-align` does
not apply to them. The Flexbox model replaces those mechanisms.

**Canonical example:** A single shelf in a bookcase. The shelf is the flex container.
Books stand side by side along the shelf (main axis). You can align them to the top or
bottom of the shelf (cross axis). You can spread them out or push them to one end.

**You will see this again in:**
- Every navigation bar, toolbar, and button group uses Flexbox
- React Native: Flexbox is the ONLY layout model — no tables, no floats, no inline-block
- The CAD/CAM toolbar you will build later: buttons in a row, icon+label aligned, groups separated

---

## Step 2 — Apply Flex

Update `flexbox.html` — add `display: flex` to the container:

```html
<h2>With flex — items in a row:</h2>   <!-- ← add this section -->
<div style="display: flex;">
  <div class="box">Box 1</div>
  <div class="box">Box 2</div>
  <div class="box">Box 3</div>
</div>
```

### CSS AND SEE

**You should see:** Three boxes in a horizontal row, each sized to fit its content.

**Change something:** Add `flex-direction: column` to the container.

**Expected:** Items stack vertically again — but now as flex items, not blocks. The
visual result looks similar to the start, but the Flexbox rules now apply for alignment.

---

## Step 3 — Alignment Properties

Add examples for each alignment:

```html
<h2 style="margin-top: var(--space-6);">justify-content (main axis):</h2>   <!-- ← add -->

<p>flex-start (default):</p>
<div style="display: flex; justify-content: flex-start; gap: var(--space-2); background: #f0f0f0; padding: var(--space-2);">
  <div class="box">A</div><div class="box">B</div><div class="box">C</div>
</div>

<p>center:</p>
<div style="display: flex; justify-content: center; gap: var(--space-2); background: #f0f0f0; padding: var(--space-2);">
  <div class="box">A</div><div class="box">B</div><div class="box">C</div>
</div>

<p>space-between:</p>
<div style="display: flex; justify-content: space-between; background: #f0f0f0; padding: var(--space-2);">
  <div class="box">A</div><div class="box">B</div><div class="box">C</div>
</div>

<p>space-around:</p>
<div style="display: flex; justify-content: space-around; background: #f0f0f0; padding: var(--space-2);">
  <div class="box">A</div><div class="box">B</div><div class="box">C</div>
</div>
```

```html
<h2 style="margin-top: var(--space-6);">align-items (cross axis):</h2>   <!-- ← add -->

<p>stretch (default — children fill the container height):</p>
<div style="display: flex; align-items: stretch; gap: var(--space-2); background: #f0f0f0; padding: var(--space-2); height: 80px;">
  <div class="box">Short</div>
  <div class="box">Taller<br>content</div>
  <div class="box">Short</div>
</div>

<p>center:</p>
<div style="display: flex; align-items: center; gap: var(--space-2); background: #f0f0f0; padding: var(--space-2); height: 80px;">
  <div class="box">Short</div>
  <div class="box">Taller<br>content</div>
  <div class="box">Short</div>
</div>

<p>flex-start:</p>
<div style="display: flex; align-items: flex-start; gap: var(--space-2); background: #f0f0f0; padding: var(--space-2); height: 80px;">
  <div class="box">Short</div>
  <div class="box">Taller<br>content</div>
  <div class="box">Short</div>
</div>
```

### CSS AND SEE

Study each demo. They each show one property changed.

**The key observation:** `justify-content: space-between` pushes items to opposite ends
with equal spacing. This is the most commonly used value for navigation bars (logo left,
links right).

---

## Concept: `flex-grow`, `flex-shrink`, `flex-basis` — How Items Size Themselves

**What it is:** Three properties on flex ITEMS (not the container) that control how much
space an item takes up and how it responds to available/insufficient space.

**`flex-basis`:** The item's starting size before flex distributes free space.
- `flex-basis: auto` (default) — use the item's width or content size
- `flex-basis: 200px` — start at 200px, then grow/shrink from there
- `flex-basis: 0` — start from 0, distribute all space via `flex-grow`

**`flex-grow`:** A number. Specifies how much of the REMAINING (free) space an item claims.
- `flex-grow: 0` (default) — do not grow
- `flex-grow: 1` — claim an equal share of free space
- `flex-grow: 2` — claim twice as much free space as an item with `flex-grow: 1`

The total free space is split in the RATIO of `flex-grow` values:

```
Container: 600px wide. Three children: 100px, 100px, 100px.
Free space: 600 - 300 = 300px.

Child 1: flex-grow: 1  → gets 300 × (1/(1+1+2)) = 75px → final: 175px
Child 2: flex-grow: 1  → gets 300 × (1/(1+1+2)) = 75px → final: 175px
Child 3: flex-grow: 2  → gets 300 × (2/(1+1+2)) = 150px → final: 250px
```

**`flex-shrink`:** The reverse — how much an item shrinks when there is NOT enough space.
- `flex-shrink: 1` (default) — shrink proportionally
- `flex-shrink: 0` — do not shrink — the item may overflow the container

**The shorthand `flex`:**

```css
flex: 1;               /* grow: 1, shrink: 1, basis: 0% */
flex: 1 1 200px;       /* grow: 1, shrink: 1, basis: 200px */
flex: 0 0 250px;       /* do not grow, do not shrink, always 250px */
flex: auto;            /* grow: 1, shrink: 1, basis: auto */
```

**Why `flex: 1` on children creates equal-width columns:**

With `flex: 1` (shorthand for `flex-grow: 1; flex-shrink: 1; flex-basis: 0`), all children
start at zero width and split the container equally. This is simpler than `width: 33.33%`
because it adjusts automatically to any number of children.

**You will see this again in:**
- `flex: 1` on sidebar and main content to fill available space — sidebar fixed, main grows
- Responsive card grids: `flex: 1 1 200px` with `flex-wrap: wrap` creates a responsive grid
  without media queries (each card is at least 200px, wraps when there is not enough room)

---

## Step 4 — Flex Item Sizing

Add to `flexbox.html`:

```html
<h2 style="margin-top: var(--space-6);">flex-grow:</h2>   <!-- ← add -->

<p>All flex-grow: 1 — equal widths:</p>
<div style="display: flex; gap: var(--space-2); background: #f0f0f0; padding: var(--space-2);">
  <div class="box" style="flex: 1;">Grows equally</div>
  <div class="box" style="flex: 1;">Grows equally</div>
  <div class="box" style="flex: 1;">Grows equally</div>
</div>

<p>flex-grow: 1, 1, 2 — last gets double:</p>
<div style="display: flex; gap: var(--space-2); background: #f0f0f0; padding: var(--space-2);">
  <div class="box" style="flex-grow: 1;">1</div>
  <div class="box" style="flex-grow: 1;">1</div>
  <div class="box" style="flex-grow: 2;">2 (double)</div>
</div>

<p>Sidebar layout — sidebar fixed, main grows:</p>
<div style="display: flex; gap: var(--space-3); background: #f0f0f0; padding: var(--space-2); height: 80px;">
  <div class="box" style="flex: 0 0 200px; background: #e63946;">Sidebar (200px fixed)</div>
  <div class="box" style="flex: 1;">Main (fills rest)</div>
</div>
```

### CSS AND SEE

**Change something:** Change `flex: 0 0 200px` on the sidebar to `flex: 0 0 50%`.

**Expected:** Sidebar takes exactly half the container width. The main area takes the other half.
The sidebar does not grow or shrink from 50%.

---

## Concept: `flex-wrap` — When Items Overflow vs Wrap

**What it is:** Controls whether flex items stay on one line or wrap to a new line.

**Two values:**
- `flex-wrap: nowrap` (default) — items shrink as needed to stay on one line; may overflow if `flex-shrink: 0`
- `flex-wrap: wrap` — items wrap to the next line when they cannot all fit

**The responsive card pattern (no media queries):**

```css
.card-container {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
}

.card {
  flex: 1 1 250px;   /* grow and shrink, but start at 250px */
}
```

At 800px wide: 3 cards fit (3 × 250 = 750 ≤ 800).
At 600px wide: 2 cards fit (2 × 250 = 500 ≤ 600, 3 × 250 = 750 > 600).
At 300px wide: 1 card fits.

No media queries. Each card is at minimum 250px. They wrap automatically.

---

## Step 5 — Build a Real Navigation Bar

Build a complete navigation component:

```html
<h2 style="margin-top: var(--space-6);">Navigation Bar:</h2>   <!-- ← add -->

<nav style="
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-3) var(--space-5);
  background: #1a1a2e;
  border-radius: 8px;
">
  <span style="color: white; font-weight: 700; font-size: 1.2rem;">CNC·SIM</span>

  <ul style="
    list-style: none;
    margin: 0;
    padding: 0;
    display: flex;
    gap: var(--space-5);
  ">
    <li><a href="#" style="color: #aaa; text-decoration: none;">File</a></li>
    <li><a href="#" style="color: #aaa; text-decoration: none;">Edit</a></li>
    <li><a href="#" style="color: white; text-decoration: none; font-weight: 600;">View</a></li>
    <li><a href="#" style="color: #aaa; text-decoration: none;">Help</a></li>
  </ul>

  <button style="
    background: cornflowerblue;
    color: white;
    border: none;
    padding: var(--space-2) var(--space-4);
    border-radius: 4px;
    cursor: pointer;
  ">Connect</button>
</nav>
```

### CSS AND SEE

**You should see:** A dark navigation bar with a logo on the left, links in the center,
and a button on the right — the classic navbar layout, achieved with one line of Flexbox.

**Break it to understand it:** Remove `justify-content: space-between`.

**Expected:** Logo, links, and button all cluster to the left.

Add it back. Remove `align-items: center`.

**Expected:** Logo and button shrink to content height; links list may not be vertically
centered. This shows that `align-items: center` was doing the vertical centering.

---

## 🎯 Challenge: Build a Responsive Card Row

**Task:** Create a row of cards that:
1. Shows 3 cards side by side on wide screens
2. Each card is at minimum 200px wide
3. Cards wrap to the next row automatically when the window is narrow (no media queries)
4. Equal space between cards using `gap`
5. Each card has a heading, a short paragraph, and a "Learn more →" link at the BOTTOM
   (use `flex-direction: column` with `flex: 1` on the content area to push the link down)

---

<details>
<summary>▶ Show Solution</summary>

```html
<div style="
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-4);
  margin-top: var(--space-6);
">
  <!-- Card template (repeat 3 times): -->
  <article style="
    flex: 1 1 200px;
    background: white;
    border: 1px solid #ddd;
    border-radius: 8px;
    padding: var(--space-4);
    display: flex;
    flex-direction: column;
  ">
    <h3 style="margin: 0 0 var(--space-2);">Card Title</h3>
    <p style="flex: 1; margin: 0 0 var(--space-3); color: #555;">
      Description text. The flex: 1 on this paragraph makes it grow
      to fill space, pushing the link to the bottom.
    </p>
    <a href="#" style="color: cornflowerblue; text-decoration: none;">Learn more →</a>
  </article>

  <article style="flex: 1 1 200px; background: white; border: 1px solid #ddd; border-radius: 8px; padding: var(--space-4); display: flex; flex-direction: column;">
    <h3 style="margin: 0 0 var(--space-2);">Another Card</h3>
    <p style="flex: 1; margin: 0 0 var(--space-3); color: #555;">Shorter text.</p>
    <a href="#" style="color: cornflowerblue; text-decoration: none;">Learn more →</a>
  </article>

  <article style="flex: 1 1 200px; background: white; border: 1px solid #ddd; border-radius: 8px; padding: var(--space-4); display: flex; flex-direction: column;">
    <h3 style="margin: 0 0 var(--space-2);">Third Card</h3>
    <p style="flex: 1; margin: 0 0 var(--space-3); color: #555;">
      This one has more content so the description area is taller, but
      the "Learn more" link stays at the bottom on all cards.
      Flexbox makes all cards stretch to equal height.
    </p>
    <a href="#" style="color: cornflowerblue; text-decoration: none;">Learn more →</a>
  </article>
</div>
```

**Key insight:** Two levels of Flexbox:
1. The OUTER container: `display: flex; flex-wrap: wrap` — cards flow into rows
2. Each CARD: `display: flex; flex-direction: column` — heading, content (with `flex: 1`), link

The inner `flex: 1` on the `<p>` consumes all available vertical space in the card, pushing
the link to the bottom. Without it, the link floats just below the text and cards with
different text lengths have links at different heights.

</details>

---

## Final Check

| Concept | How to verify |
|---|---|
| `display: flex` puts items in a row | Blocks that were stacked now appear side by side |
| `justify-content: space-between` | Logo and button at opposite ends of navbar |
| `align-items: center` | All nav items vertically centered |
| `flex: 1` equal columns | Three children fill the container equally |
| `flex: 0 0 200px` fixed child | Sidebar does not grow or shrink |
| `flex-wrap: wrap` responsive | Narrow window — cards wrap to new rows |
| `flex-direction: column` card | "Learn more" links aligned at card bottom |

---

## Quick Check Answers

**1. `flex-direction: row`, `justify-content: space-between`. Which axis?**

Horizontal. `justify-content` always controls the MAIN axis. With `flex-direction: row`,
the main axis is horizontal (left to right). So `space-between` distributes space horizontally.
If you change to `flex-direction: column`, the main axis becomes vertical, and
`justify-content: space-between` would push items to the top and bottom.

**2. `flex-grow: 1` and `flex-grow: 2`. Container has 300px free space. How much each?**

Child 1 gets 100px. Child 2 gets 200px. The total ratio is 1+2=3 parts.
Child 1 gets 1/3 of 300px = 100px. Child 2 gets 2/3 of 300px = 200px.
`flex-grow` distributes FREE space proportionally — it is not the total size, only
the space beyond `flex-basis`.

**3. Last button to far right. One CSS property on that button?**

`margin-left: auto`. Margins set to `auto` in Flexbox consume all available space.
`margin-left: auto` on the last item pushes it to the far right by absorbing all
free space between it and the preceding items. This is the cleanest way to right-align
a single item without changing the container's `justify-content`.
