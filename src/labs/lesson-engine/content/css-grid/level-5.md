---
series: css-grid
level: 5
title: Auto-flow and Implicit Grids
lang: css
---

# Auto-flow and Implicit Grids

When you add more items than your grid has defined tracks, the browser creates **implicit tracks** automatically. `grid-auto-flow` controls which direction new tracks are created; `grid-auto-rows` and `grid-auto-columns` size them. Understanding implicit grids is key to dynamic content — blog post lists, photo galleries, search results.

## grid-auto-flow — row vs column

By default, items flow into rows (`grid-auto-flow: row`) — filling left-to-right, then creating new rows. Switch to `column` to fill top-to-bottom and create new columns instead.

```html
<p class="lbl">grid-auto-flow: row (default) — fills across then down</p>
<div class="grid row-flow">
  <div class="item">1</div><div class="item">2</div><div class="item">3</div>
  <div class="item">4</div><div class="item">5</div><div class="item">6</div>
  <div class="item">7</div>
</div>

<p class="lbl">grid-auto-flow: column — fills down then across</p>
<div class="grid col-flow">
  <div class="item">1</div><div class="item">2</div><div class="item">3</div>
  <div class="item">4</div><div class="item">5</div><div class="item">6</div>
  <div class="item">7</div>
</div>
```

```css
body { background: #0f172a; padding: 16px; font-family: system-ui; }
.lbl { color: #64748b; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; margin: 12px 0 4px; }
.grid  { display: grid; gap: 8px; background: #1e293b; padding: 10px; border-radius: 8px; margin-bottom: 8px; }
.item  { background: #6366f1; color: white; padding: 14px; border-radius: 6px; font-weight: 700; font-size: 14px; text-align: center; }
.row-flow { grid-template-columns: repeat(3, 1fr); grid-auto-flow: row;    grid-auto-rows: 60px; }
.col-flow { grid-template-rows: repeat(3, 60px);   grid-auto-flow: column; grid-auto-columns: 1fr; }
```

## grid-auto-rows — sizing implicit rows

`grid-auto-rows` controls the height of any implicitly created rows (rows beyond your `grid-template-rows` definition). `minmax(100px, auto)` means "at least 100px, but grows if content is taller."

```html
<div class="gallery">
  <div class="photo" id="p1">Short caption</div>
  <div class="photo" id="p2">This photo has a very long caption that needs more space to display correctly</div>
  <div class="photo" id="p3">Medium length caption</div>
  <div class="photo" id="p4">Caption</div>
  <div class="photo" id="p5">Another photo</div>
  <div class="photo" id="p6">Short</div>
</div>
```

```css
body { background: #0f172a; padding: 24px; font-family: system-ui; }
.gallery {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  grid-auto-rows: minmax(80px, auto);   /* implicit rows: at least 80px */
  gap: 10px;
}
.photo {
  background: #1e293b;
  color: #e2e8f0;
  padding: 16px;
  border-radius: 8px;
  font-size: 13px;
  line-height: 1.5;
  border: 1px solid #334155;
}
.photo::before {
  content: "";
  display: block;
  width: 100%;
  height: 80px;
  background: #334155;
  border-radius: 4px;
  margin-bottom: 10px;
}
```

## dense packing — filling gaps left by spanning items

`grid-auto-flow: row dense` allows the algorithm to backfill holes left by items that span multiple cells. Without `dense`, items flow strictly in order and leave gaps.

```html
<p class="lbl">auto-flow: row — gaps left by spanning items</p>
<div class="grid no-dense">
  <div class="item span2">A (span 2)</div>
  <div class="item">B</div>
  <div class="item">C</div>
  <div class="item span2">D (span 2)</div>
  <div class="item">E</div>
  <div class="item">F</div>
</div>

<p class="lbl">auto-flow: row dense — backfills gaps</p>
<div class="grid dense">
  <div class="item span2">A (span 2)</div>
  <div class="item">B</div>
  <div class="item">C</div>
  <div class="item span2">D (span 2)</div>
  <div class="item">E</div>
  <div class="item">F</div>
</div>
```

```css
body { background: #0f172a; padding: 16px; font-family: system-ui; }
.lbl { color: #64748b; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; margin: 12px 0 4px; }
.grid { display: grid; grid-template-columns: repeat(3, 1fr); grid-auto-rows: 60px; gap: 8px; background: #1e293b; padding: 10px; border-radius: 8px; margin-bottom: 8px; }
.item { background: #6366f1; color: white; padding: 10px; border-radius: 6px; font-weight: 600; font-size: 13px; display: flex; align-items: center; justify-content: center; }
.span2 { grid-column: span 2; background: #059669; }
.no-dense { grid-auto-flow: row; }
.dense    { grid-auto-flow: row dense; }
```

**CS lens:** The auto-placement algorithm runs in a single pass — without `dense`, it never backtracks to fill holes. With `dense`, it uses a "greedy backfill" — at each step, it finds the first available spot that can fit the item, potentially out of order. Useful for Pinterest-style masonry-ish grids.

## Dynamic lists — the implicit grid pattern

The most common real use of implicit grids: items come from data (API response, user input). You define the column structure; rows are created automatically as needed.

```html
<div class="course-list">
  <div class="course-card">
    <span class="badge">Python</span>
    <h3>Python Fundamentals</h3>
    <p>37 levels · Beginner</p>
  </div>
  <div class="course-card">
    <span class="badge">CSS</span>
    <h3>CSS Flexbox</h3>
    <p>9 levels · Intermediate</p>
  </div>
  <div class="course-card">
    <span class="badge">JS</span>
    <h3>JavaScript</h3>
    <p>10 levels · Intermediate</p>
  </div>
  <div class="course-card">
    <span class="badge">SQL</span>
    <h3>SQL Fundamentals</h3>
    <p>8 levels · Beginner</p>
  </div>
  <div class="course-card">
    <span class="badge">TS</span>
    <h3>TypeScript</h3>
    <p>12 levels · Advanced</p>
  </div>
</div>
```

```css
body { background: #0f172a; padding: 24px; font-family: system-ui; }
.course-list {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  grid-auto-rows: auto;
  gap: 16px;
}
.course-card { background: #1e293b; padding: 16px; border-radius: 10px; }
.badge { display: inline-block; background: #6366f1; color: white; padding: 2px 10px; border-radius: 9999px; font-size: 11px; font-weight: 700; margin-bottom: 8px; }
.course-card h3 { color: #e2e8f0; margin: 0 0 4px; font-size: 0.95rem; }
.course-card p  { color: #64748b; font-size: 12px; margin: 0; }
```

**SE lens:** The combination of `grid-template-columns: repeat(auto-fit, minmax(200px, 1fr))` + `grid-auto-rows: auto` is the go-to pattern for dynamic content lists where you don't know the item count at design time.

**Common mistakes:**
- Forgetting to set `grid-auto-rows` when you care about implicit row height — the default is `auto`, which is sized by content.
- Using `dense` when item order matters (accessibility, logical reading sequence) — `dense` may reorder items visually.

**Debug tip:** DevTools shows implicit tracks with a dashed border instead of a solid one in the grid overlay.

**Next:** Real-world grid patterns — dashboard layout, magazine grid, photo mosaic.

## Challenge: auto_flow

Set up a grid that auto-creates rows as items flow in.

1. `.grid` — `display: grid`, `grid-template-columns: repeat(3, 1fr)`, `grid-auto-rows: 80px`, `gap: 10px`
2. `#wide` — `grid-column: span 2`

```html
<div class="grid">
  <div class="item" id="a">A</div>
  <div class="item" id="wide">Wide (span 2)</div>
  <div class="item" id="b">B</div>
  <div class="item" id="c">C</div>
  <div class="item" id="d">D</div>
</div>
```

```challenge
.grid {
  background: #1e293b;
  padding: 10px;
  border-radius: 10px;
}

.item {
  background: #6366f1;
  color: white;
  border-radius: 6px;
  font-family: system-ui;
  font-weight: 700;
  font-size: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
}

#wide {
  background: #059669;
}
```

```test
var g = getComputedStyle(document.querySelector('.grid'))
var w = getComputedStyle(document.querySelector('#wide'))
assert g.display === 'grid'
var cols = g.gridTemplateColumns.split(' ')
assert cols.length === 3
assert g.gap === '10px' || g.columnGap === '10px'
assert w.gridColumnEnd === 'span 2' || w.gridColumnStart === 'span 2' || w.gridColumn.includes('span 2')
```
