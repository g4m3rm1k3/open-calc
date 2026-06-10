# Junior to Senior — T12·L9 — Grid

**Prerequisites:** T12·L8 (Flexbox). You can lay out items in a single row or column
with Flexbox. This lesson teaches CSS Grid — the layout model for two-dimensional
arrangements. You will understand tracks, areas, and when to use Grid instead of Flexbox.

**What this lab adds:**
- `display: grid` and what changes
- Defining columns and rows with `grid-template-columns` and `grid-template-rows`
- The `fr` unit — fractional units that distribute free space
- `grid-template-areas` — the readable layout declaration
- `grid-column` and `grid-row` — placing items explicitly
- `auto-fill` and `auto-fit` — responsive grids without media queries
- When to use Grid vs Flexbox

**Time:** 60–90 minutes

---

> **Quick Check — try to answer before reading:**
>
> 1. Flexbox and Grid both lay out elements. What is the key difference in how they think
>    about layout?
> 2. You declare `grid-template-columns: 1fr 2fr 1fr`. The container is 600px wide.
>    How wide is each column?
> 3. `auto-fill` vs `auto-fit` with `minmax(200px, 1fr)`. The container is 500px.
>    What is the difference in the result?
>
> *(Answers at the end of this lab)*

---

## The Problem This Lesson Solves

You want a page layout: a header across the top, a sidebar on the left, a main content
area on the right, and a footer across the bottom. With Flexbox you need nested containers
and `flex-direction: column` wrappers and percentage widths that do not quite align.

Grid lets you describe the entire layout in one declaration:

```css
grid-template-areas:
  "header  header"
  "sidebar main"
  "footer  footer";
```

Two-dimensional problems need a two-dimensional tool.

---

## Step 1 — The Problem

Create `grid.html` in your `css-foundations` folder:

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>CSS Grid</title>
  <style>
    *, *::before, *::after { box-sizing: border-box; }

    :root {
      --space-2: 0.5rem;
      --space-3: 0.75rem;
      --space-4: 1rem;
      --space-5: 1.5rem;
      --space-6: 2rem;
      --space-7: 3rem;
    }

    body { font-family: sans-serif; max-width: 900px; margin: 40px auto; padding: 0 var(--space-4); }

    .area {
      background: cornflowerblue;
      color: white;
      padding: var(--space-4);
      border-radius: 4px;
      text-align: center;
    }
  </style>
</head>
<body>
  <h2>No grid — four areas in default document flow:</h2>
  <div>
    <div class="area">Header</div>
    <div class="area">Sidebar</div>
    <div class="area">Main Content</div>
    <div class="area">Footer</div>
  </div>
</body>
</html>
```

### CSS AND SEE

Four blue boxes stacked vertically. No layout structure. The goal is to arrange these
into a proper page layout without adding HTML nesting.

---

## Concept: `display: grid` — The Grid Container

**What it is:** Setting `display: grid` on an element turns it into a **grid container**.
Its direct children become **grid items** placed into a grid of rows and columns.

**What changes immediately:**
- Children still stack vertically (no columns defined yet)
- Children do NOT become inline (unlike Flexbox which puts items in a row by default)

**The two dimensions:**
- **Columns** — defined with `grid-template-columns`
- **Rows** — defined with `grid-template-rows` (or auto-created by the browser)

**Flexbox vs Grid — when to use each:**

| Flexbox | Grid |
|---|---|
| Items flow in ONE direction (row OR column) | Items arranged in TWO dimensions (rows AND columns) |
| Content-driven: items size to their content | Layout-driven: you define the structure, items fill it |
| Navigation bars, button groups, card rows | Page layouts, card grids, form layouts |
| When the NUMBER of items is unknown | When the STRUCTURE is defined regardless of count |

**The canonical test:** Are you arranging items along ONE axis? Use Flexbox. Do you need
rows AND columns to align? Use Grid. A navigation bar is Flexbox. A photo gallery is Grid.
A page layout (header/sidebar/main/footer) is Grid.

**What it hides:** The complexity of calculating column widths, row heights, and placement
positions. You describe the structure; Grid places items automatically.

**You will see this again in:**
- Every dashboard layout uses Grid for the macro structure, Flexbox inside each cell
- React Native: does NOT have CSS Grid — this is one reason mobile layouts use different approaches
- Tailwind: `grid-cols-3` = `grid-template-columns: repeat(3, minmax(0, 1fr))`

---

## Step 2 — Define Columns

Add to `grid.html`:

```html
<h2 style="margin-top: var(--space-6);">Three equal columns:</h2>   <!-- ← add -->
<div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: var(--space-2);">
  <div class="area">Box 1</div>
  <div class="area">Box 2</div>
  <div class="area">Box 3</div>
  <div class="area">Box 4</div>
  <div class="area">Box 5</div>
  <div class="area">Box 6</div>
</div>
```

### CSS AND SEE

**You should see:** Six boxes in a 3-column grid. Items 4, 5, 6 automatically wrap to
the second row — the browser creates implicit rows for overflow items.

**Change something:** Change `grid-template-columns: 1fr 1fr 1fr` to `grid-template-columns: 200px 1fr 2fr`.

**Expected:** Column 1 is fixed at 200px. Columns 2 and 3 split the remaining space in
a 1:2 ratio. Box 1, 4 are narrow; Box 3, 6 are wide.

---

## Concept: The `fr` Unit

**What it is:** A fractional unit. `1fr` means "1 fraction of the available space."
It is exclusive to CSS Grid.

**The calculation:**

```
grid-template-columns: 1fr 2fr 1fr;
Container: 600px. No fixed columns. No gap.
Total fractions: 1 + 2 + 1 = 4 parts.
Column 1: 600 × (1/4) = 150px
Column 2: 600 × (2/4) = 300px
Column 3: 600 × (1/4) = 150px
```

**With fixed and fractional columns:**

```
grid-template-columns: 200px 1fr 2fr;
Container: 600px.
Fixed: 200px. Remaining: 400px. Fractions: 1+2=3.
Column 1: 200px (fixed)
Column 2: 400 × (1/3) ≈ 133px
Column 3: 400 × (2/3) ≈ 267px
```

**`fr` vs percentages:** `fr` accounts for `gap` automatically. `width: 33.33%` on three
children does not account for the gap between them and overflows. `1fr` does not have this
problem — it distributes free space AFTER the gap is subtracted.

**`repeat(n, value)` shorthand:**

```css
grid-template-columns: repeat(3, 1fr);          /* same as 1fr 1fr 1fr */
grid-template-columns: repeat(4, 1fr 2fr);       /* 1fr 2fr 1fr 2fr 1fr 2fr 1fr 2fr */
grid-template-columns: 200px repeat(3, 1fr);     /* fixed sidebar + 3 equal columns */
```

---

## Step 3 — `grid-template-areas`

The most readable way to define a page layout:

```html
<h2 style="margin-top: var(--space-6);">Page layout with grid-template-areas:</h2>  <!-- ← add -->

<div style="
  display: grid;
  grid-template-columns: 200px 1fr;
  grid-template-rows: auto 1fr auto;
  grid-template-areas:
    'header  header'
    'sidebar main'
    'footer  footer';
  gap: var(--space-2);
  min-height: 300px;
">
  <div class="area" style="grid-area: header;">Header</div>
  <div class="area" style="grid-area: sidebar; background: #e63946;">Sidebar</div>
  <div class="area" style="grid-area: main; background: #2a9d8f;">Main</div>
  <div class="area" style="grid-area: footer;">Footer</div>
</div>
```

### CSS AND SEE

**You should see:** A full page layout — header spanning both columns at top, sidebar and
main side by side, footer spanning both columns at bottom. Four elements, one grid declaration.

**Change something:** Swap the areas string so the sidebar is on the right:

```css
grid-template-areas:
  'header  header'
  'main    sidebar'
  'footer  footer';
```

**Expected:** The layout mirrors — sidebar is now on the right. The HTML order did not
change, only the layout declaration. This is the power of grid-template-areas: layout
is decoupled from DOM order.

---

## Concept: `grid-column` and `grid-row` — Explicit Placement

**What it is:** Properties on grid ITEMS that place them at specific positions in the grid,
spanning multiple columns or rows.

**The syntax:**

```css
.item {
  grid-column: 1 / 3;    /* start at column line 1, end at column line 3 (span 2 columns) */
  grid-row:    1 / 2;    /* start at row line 1, end at row line 2 (span 1 row) */
}
```

Grid lines are numbered starting at 1. A 3-column grid has 4 column lines:

```
|  col 1  |  col 2  |  col 3  |
1         2         3         4
```

**Shorthand with `span`:**

```css
grid-column: 1 / span 2;  /* start at 1, span 2 columns */
grid-column: span 3;       /* span 3 columns from wherever it naturally falls */
```

**Negative line numbers:**

```css
grid-column: 1 / -1;   /* from first line to LAST line — full width regardless of column count */
```

**When to use explicit placement vs `grid-template-areas`:**

`grid-template-areas` — use when you are defining a NAMED layout (header/sidebar/main/footer).
Readable, easy to change, obvious structure.

`grid-column` / `grid-row` — use when you need precise control over individual items,
especially in content grids where items span different amounts (like a magazine layout
or a photo gallery where some photos are larger).

---

## Step 4 — Spanning Items

Add:

```html
<h2 style="margin-top: var(--space-6);">Magazine-style grid:</h2>   <!-- ← add -->

<div style="
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: var(--space-2);
">
  <!-- Featured article: spans 2 columns and 2 rows -->
  <div class="area" style="grid-column: span 2; grid-row: span 2; background: #e63946;">
    Featured (2×2)
  </div>
  <div class="area">Article 2</div>
  <div class="area">Article 3</div>
  <div class="area">Article 4</div>
  <div class="area">Article 5</div>
  <!-- Full-width footer: spans all 4 columns -->
  <div class="area" style="grid-column: 1 / -1; background: #333;">
    Full-width section (1 / -1)
  </div>
</div>
```

### CSS AND SEE

**You should see:** The featured article occupies a 2×2 cell, regular articles fill
individual cells, and the footer-like item spans the full width using `grid-column: 1 / -1`.

---

## Concept: `auto-fill` and `auto-fit` — Responsive Grid Without Media Queries

**What it is:** Keywords that tell Grid to create as many columns as will fit at a
given minimum size.

```css
grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
```

- `repeat(auto-fill, ...)` — create as many columns as fit, filling the row
- `minmax(200px, 1fr)` — each column is at least 200px but can grow to fill space

**`auto-fill` vs `auto-fit`:**

At 500px wide with `minmax(200px, 1fr)`:
- **`auto-fill`:** Creates 2 explicit columns (500/200=2.5 → 2 fit). Empty columns still
  take up space — visible if you inspect the grid.
- **`auto-fit`:** Creates 2 columns AND collapses empty ones. The 2 filled columns each
  grow to `1fr`. Usually what you want for content grids.

**The practical difference:**

If you have 2 items in a 5-column auto-fill grid: the items are in columns 1 and 2,
the remaining 3 columns are empty but still exist — items do not stretch.

If you have 2 items in a 5-column auto-fit grid: empty columns collapse — the 2 items
each get 50% of the container.

**When to use which:**
- `auto-fit` for card grids where you want items to grow and fill space
- `auto-fill` for grids where you want to lock items to a specific size even with empty columns

---

## Step 5 — Responsive Card Grid

Add:

```html
<h2 style="margin-top: var(--space-6);">Responsive grid (auto-fit):</h2>   <!-- ← add -->

<div style="
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: var(--space-3);
">
  <div class="area">Card 1</div>
  <div class="area">Card 2</div>
  <div class="area">Card 3</div>
  <div class="area">Card 4</div>
  <div class="area">Card 5</div>
</div>
```

### CSS AND SEE

**Resize the browser window.**

**You should see:** On wide screens, all 5 cards are in a row. As you narrow the window,
cards wrap to new rows automatically. Each card is always at least 180px wide.

**Change something:** Replace `auto-fit` with `auto-fill`.

**Expected:** On a very wide screen with few cards, `auto-fill` leaves visible empty
column tracks (you can see this in DevTools by enabling grid overlay — Elements panel,
click the grid badge). `auto-fit` collapses them so cards expand to fill available space.

---

## 🎯 Challenge: Build a Dashboard Layout

**Task:** Build a complete dashboard page using CSS Grid:

1. A header bar across the full top
2. A left sidebar (fixed 240px width)
3. A main area with a **grid of 4 stat cards** (2×2)
4. Below the stat cards, a **wide chart area** that spans 2 columns
5. A footer across the full bottom

Requirements:
- Page layout: `grid-template-areas`
- Stat cards: `repeat(2, 1fr)` grid
- Chart: `grid-column: 1 / -1`
- All spacing from your `--space-N` scale

---

<details>
<summary>▶ Show Solution</summary>

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Dashboard</title>
  <style>
    *, *::before, *::after { box-sizing: border-box; }
    :root {
      --space-2: 0.5rem; --space-3: 0.75rem; --space-4: 1rem;
      --space-5: 1.5rem; --space-6: 2rem;
    }
    body { margin: 0; font-family: sans-serif; background: #f5f5f5; min-height: 100vh; }

    .app {
      display: grid;
      grid-template-columns: 240px 1fr;
      grid-template-rows: 56px 1fr 48px;
      grid-template-areas:
        'header  header'
        'sidebar main'
        'footer  footer';
      min-height: 100vh;
      gap: var(--space-3);
      padding: var(--space-3);
    }

    .header  { grid-area: header;  background: #1a1a2e; color: white; display: flex; align-items: center; padding: 0 var(--space-4); border-radius: 6px; }
    .sidebar { grid-area: sidebar; background: white; border-radius: 6px; padding: var(--space-4); }
    .main    { grid-area: main; }
    .footer  { grid-area: footer;  background: white; border-radius: 6px; display: flex; align-items: center; justify-content: center; color: #888; font-size: 0.85rem; }

    .stats {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: var(--space-3);
      margin-bottom: var(--space-3);
    }

    .stat-card {
      background: white;
      padding: var(--space-4);
      border-radius: 6px;
      border-left: 4px solid cornflowerblue;
    }

    .stat-card h3 { margin: 0 0 var(--space-2); font-size: 0.85rem; color: #888; text-transform: uppercase; letter-spacing: 0.05em; }
    .stat-card p  { margin: 0; font-size: 1.75rem; font-weight: 700; color: #1a1a2e; }

    .chart {
      background: white;
      border-radius: 6px;
      padding: var(--space-4);
      min-height: 160px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #aaa;
      grid-column: 1 / -1;
    }
  </style>
</head>
<body>
  <div class="app">
    <header class="header">CNC·SIM Dashboard</header>

    <aside class="sidebar">
      <p style="font-weight: 600; margin: 0 0 var(--space-3);">Navigation</p>
      <ul style="list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: var(--space-2);">
        <li>Overview</li><li>Jobs</li><li>Settings</li>
      </ul>
    </aside>

    <main class="main">
      <div class="stats">
        <div class="stat-card"><h3>Jobs Today</h3><p>12</p></div>
        <div class="stat-card"><h3>Active Jobs</h3><p>3</p></div>
        <div class="stat-card"><h3>Errors</h3><p>0</p></div>
        <div class="stat-card"><h3>Uptime</h3><p>99.8%</p></div>
        <div class="chart">Chart area (grid-column: 1 / -1)</div>
      </div>
    </main>

    <footer class="footer">CNC·SIM v1.0</footer>
  </div>
</body>
</html>
```

**Key insight:** Two levels of Grid:
1. The APP grid (`grid-template-areas`) — the macro page layout
2. The STATS grid inside `<main>` — the card grid with `grid-column: 1 / -1` for the chart

The chart's `grid-column: 1 / -1` refers to the STATS grid (its parent), not the app grid.
Each grid only has authority over its direct children.

</details>

---

## Final Check

| Concept | How to verify |
|---|---|
| `display: grid` with 3 columns | 6 items fill 3 columns, auto-wrap to row 2 |
| `1fr` equal columns | Three `1fr` columns are identical widths |
| `grid-template-areas` layout | Header spans both columns, sidebar+main side by side |
| `grid-column: 1 / -1` | Item spans all columns regardless of column count |
| `auto-fit minmax` | Cards wrap on narrow screen without any media queries |
| `auto-fit` vs `auto-fill` | 2 items: `auto-fit` fills container; `auto-fill` keeps fixed column width |

---

## Quick Check Answers

**1. Key difference between Flexbox and Grid?**

Flexbox is one-dimensional — items flow along ONE axis (row or column). Grid is two-dimensional —
items are placed in a defined structure of rows AND columns simultaneously. Flexbox is
content-driven (items size to their content, the container adapts). Grid is layout-driven
(you define the structure, items fill it). Use Flexbox when you are arranging items in a
line; use Grid when you need rows and columns to align.

**2. `grid-template-columns: 1fr 2fr 1fr`. Container is 600px. Column widths?**

Total fractions: 1+2+1 = 4. Each fraction = 600/4 = 150px.
Column 1: 1 × 150 = 150px. Column 2: 2 × 150 = 300px. Column 3: 1 × 150 = 150px.

**3. `auto-fill` vs `auto-fit`, 500px container, `minmax(200px, 1fr)`. Difference?**

Both create 2 columns (500/200 = 2.5 → 2 columns fit). The difference appears when
columns would be empty (fewer items than possible columns):

`auto-fill`: The 2 explicit columns exist and occupy space. A lone item in column 1 stays
200px wide — the empty column 2 still takes up 200px+.

`auto-fit`: Empty columns collapse. The lone item in column 1 grows to `1fr` = the full
500px because the collapsed column 2 contributes no space.

For card grids where items should stretch to fill available space: use `auto-fit`.
