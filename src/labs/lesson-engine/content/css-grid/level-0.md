---
series: css-grid
level: 0
title: The Grid Container
lang: css
---

# The Grid Container

CSS Grid is a **two-dimensional** layout system — it controls rows AND columns at the same time. Where flexbox arranges items along one axis, grid lets you place items anywhere in a two-dimensional structure. It is the right tool for page layouts, dashboards, and any time you need explicit column and row control.

## display: grid — the switch

`display: grid` turns a container into a grid. Without defining columns or rows, children stack vertically just like block elements — because no tracks are defined yet. The magic begins when you define `grid-template-columns`.

```html
<p class="lbl">display: block — items stack (default)</p>
<div class="block-demo">
  <div class="item">One</div>
  <div class="item">Two</div>
  <div class="item">Three</div>
</div>

<p class="lbl">display: grid — same result until tracks are defined</p>
<div class="grid-demo">
  <div class="item">One</div>
  <div class="item">Two</div>
  <div class="item">Three</div>
</div>

<p class="lbl">display: grid + grid-template-columns — now it's a grid</p>
<div class="grid-cols">
  <div class="item">One</div>
  <div class="item">Two</div>
  <div class="item">Three</div>
  <div class="item">Four</div>
  <div class="item">Five</div>
</div>
```

```css
body { background: #0f172a; padding: 16px; font-family: system-ui; }
.lbl { color: #64748b; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; margin: 12px 0 4px; }
.item { background: #6366f1; color: white; padding: 12px 16px; border-radius: 6px; font-weight: 600; font-size: 13px; }
.block-demo, .grid-demo { background: #1e293b; padding: 10px; border-radius: 8px; margin-bottom: 6px; display: block; gap: 8px; }
.block-demo .item { margin-bottom: 8px; }
.grid-demo { display: grid; }
.grid-demo .item { margin-bottom: 8px; }
.grid-cols { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 8px; background: #1e293b; padding: 10px; border-radius: 8px; }
```

`grid-template-columns: 1fr 1fr 1fr` creates three equal columns. `1fr` means "1 fraction of available space."

**CS lens:** `display: grid` creates a **grid formatting context**. Items become grid items placed into **grid tracks** (rows and columns). Unlike flexbox where items control their own size, grid tracks are defined on the container — items fit into the tracks.

## grid-template-columns — defining tracks

Column tracks define the horizontal divisions of the grid. You can mix units: `fr`, `px`, `%`, `auto`. Each value is one column.

```html
<div class="grid-a">
  <div class="item">200px</div>
  <div class="item">1fr</div>
  <div class="item">200px</div>
</div>
<div class="grid-b">
  <div class="item">auto</div>
  <div class="item">auto</div>
  <div class="item">auto</div>
  <div class="item">auto</div>
</div>
<div class="grid-c">
  <div class="item">1fr</div>
  <div class="item">2fr</div>
  <div class="item">1fr</div>
</div>
```

```css
body { background: #0f172a; padding: 24px; font-family: system-ui; }
.item { background: #6366f1; color: white; padding: 14px; border-radius: 6px; font-weight: 600; font-size: 13px; text-align: center; }
.grid-a, .grid-b, .grid-c { display: grid; gap: 8px; background: #1e293b; padding: 10px; border-radius: 8px; margin-bottom: 12px; }
.grid-a { grid-template-columns: 200px 1fr 200px; }
.grid-b { grid-template-columns: auto auto auto auto; }
.grid-c { grid-template-columns: 1fr 2fr 1fr; }
```

`200px` — fixed column. `1fr` — fraction of remaining space. `auto` — sized to content. `2fr` — gets twice as much space as `1fr` tracks.

## grid-template-rows — defining row tracks

Row tracks work the same way as column tracks. When you don't define rows, the grid creates **implicit rows** automatically as items flow in.

```html
<div class="grid-rows">
  <div class="item a">80px row</div>
  <div class="item b">120px row</div>
  <div class="item c">auto row (content-sized)</div>
  <div class="item d">80px row</div>
  <div class="item e">120px row</div>
  <div class="item f">auto — this item is in an implicit row</div>
</div>
```

```css
body { background: #0f172a; padding: 24px; font-family: system-ui; }
.item { background: #6366f1; color: white; padding: 12px; border-radius: 6px; font-weight: 600; font-size: 12px; text-align: center; display: flex; align-items: center; justify-content: center; }
.grid-rows {
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-template-rows: 80px 120px auto;  /* explicit rows */
  /* row 4+ are implicit — sized by grid-auto-rows */
  grid-auto-rows: 60px;
  gap: 8px;
  background: #1e293b;
  padding: 10px;
  border-radius: 8px;
}
.a { background: #6366f1; }
.b { background: #059669; }
.c { background: #d97706; }
.d { background: #dc2626; }
.e { background: #7c3aed; }
.f { background: #0891b2; }
```

Rows 1-3 are explicit (80px, 120px, auto). Row 4+ are implicit — sized by `grid-auto-rows`.

**SE lens:** Defining explicit tracks gives you control. Implicit tracks (auto-created) are useful when you don't know how many items you'll have — like a blog post list or a photo gallery. `grid-auto-rows: 200px` ensures every implicit row is the same height.

**Common mistakes:**
- Setting `grid-template-columns` on items instead of the container — column definitions belong on the grid container.
- Expecting `display: grid` alone to create a multi-column layout — you must also define `grid-template-columns`.

**Debug tip:** In Chrome DevTools, selecting a grid container shows a "grid" badge. Clicking it overlays the grid lines and track sizes on the page — the fastest way to debug grid layouts.

**Next:** `repeat()`, `fr`, `minmax()` — the powerful functions that make grid tracks flexible and responsive.

## Challenge: grid_container

Create a 3-column grid with equal columns and a 16px gap.

1. `.grid` — `display: grid`, `grid-template-columns: 1fr 1fr 1fr`, `gap: 16px`

```html
<div class="grid">
  <div class="cell" id="c1">1</div>
  <div class="cell" id="c2">2</div>
  <div class="cell" id="c3">3</div>
  <div class="cell" id="c4">4</div>
  <div class="cell" id="c5">5</div>
  <div class="cell" id="c6">6</div>
</div>
```

```challenge
.grid {

}

.cell {
  background: #6366f1;
  color: white;
  padding: 20px;
  border-radius: 8px;
  font-family: system-ui;
  font-weight: 700;
  text-align: center;
}
```

```test
var g = getComputedStyle(document.querySelector('.grid'))
assert g.display === 'grid'
var cols = g.gridTemplateColumns.split(' ')
assert cols.length === 3
assert cols[0] === cols[1] && cols[1] === cols[2]   // equal columns
assert g.gap === '16px' || g.columnGap === '16px'
```
