---
series: css-grid
level: 2
title: Grid Placement
lang: css
---

# Grid Placement

By default, grid items flow into the next available cell. But you can override this — placing any item at any grid line, spanning multiple cells, or layering items on top of each other. Explicit placement is what makes grid layouts like dashboards and magazine spreads possible.

## Grid lines — the coordinate system

Grid lines are numbered from 1. A 3-column grid has 4 vertical lines (1, 2, 3, 4) and negative equivalents (-1, -2, -3, -4) from the end. `grid-column: 1 / 3` means "start at line 1, end at line 3" — spanning two columns.

```html
<div class="grid">
  <div class="item" id="a">A: col 1/2, row 1/2</div>
  <div class="item" id="b">B: col 2/4, row 1/2 — spans 2 cols</div>
  <div class="item" id="c">C: col 1/3, row 2/3 — spans 2 cols</div>
  <div class="item" id="d">D: col 3/4, row 2/4 — spans 2 rows</div>
  <div class="item" id="e">E: col 1/2, row 3/4</div>
  <div class="item" id="f">F: col 2/3, row 3/4</div>
</div>
```

```css
body { background: #0f172a; padding: 24px; font-family: system-ui; }
.grid { display: grid; grid-template-columns: repeat(3, 1fr); grid-template-rows: repeat(3, 80px); gap: 8px; background: #1e293b; padding: 10px; border-radius: 10px; }
.item { background: #6366f1; color: white; padding: 12px; border-radius: 6px; font-size: 12px; font-weight: 600; display: flex; align-items: center; justify-content: center; text-align: center; }
#a { grid-column: 1 / 2; grid-row: 1 / 2; }
#b { grid-column: 2 / 4; grid-row: 1 / 2; background: #059669; }
#c { grid-column: 1 / 3; grid-row: 2 / 3; background: #d97706; }
#d { grid-column: 3 / 4; grid-row: 2 / 4; background: #dc2626; }
#e { grid-column: 1 / 2; grid-row: 3 / 4; background: #7c3aed; }
#f { grid-column: 2 / 3; grid-row: 3 / 4; background: #0891b2; }
```

## span — relative placement

Instead of specifying start and end lines, `span N` means "take up N tracks." `grid-column: span 2` is "start wherever auto-flow puts me, span 2 columns."

```html
<div class="grid">
  <div class="item" id="s1">span 2 cols</div>
  <div class="item" id="s2">1 col (default)</div>
  <div class="item" id="s3">1 col</div>
  <div class="item" id="s4">span 3 cols (full width)</div>
  <div class="item" id="s5">span 2 rows tall</div>
  <div class="item" id="s6">1 col</div>
  <div class="item" id="s7">1 col</div>
</div>
```

```css
body { background: #0f172a; padding: 24px; font-family: system-ui; }
.grid { display: grid; grid-template-columns: repeat(3, 1fr); grid-auto-rows: 70px; gap: 8px; background: #1e293b; padding: 10px; border-radius: 10px; }
.item { background: #6366f1; color: white; padding: 10px; border-radius: 6px; font-size: 12px; font-weight: 600; display: flex; align-items: center; justify-content: center; text-align: center; }
#s1 { grid-column: span 2; background: #059669; }
#s4 { grid-column: span 3; background: #d97706; }
#s5 { grid-row: span 2; background: #dc2626; }
```

`grid-column: 1 / -1` — a common shorthand for "start at line 1, end at the last line" — spans the full width regardless of how many columns the grid has.

**CS lens:** When you use `span` without specifying a start line, the auto-placement algorithm decides where to start. The algorithm scans left-to-right, top-to-bottom, placing items in the first available space that fits the span.

## The -1 trick — full-width items

`grid-column: 1 / -1` always spans the full row width because `-1` refers to the last grid line regardless of column count. Change the grid to 4 columns and the header still fills the row.

```html
<div class="dashboard">
  <div class="item header">Header — grid-column: 1 / -1 always full width</div>
  <div class="item main">Main content area</div>
  <div class="item right">Right panel</div>
  <div class="item footer">Footer — also 1 / -1</div>
</div>
```

```css
body { background: #0f172a; padding: 24px; font-family: system-ui; }
.dashboard { display: grid; grid-template-columns: 2fr 1fr; grid-auto-rows: minmax(60px, auto); gap: 8px; background: #1e293b; padding: 10px; border-radius: 10px; }
.item { background: #6366f1; color: white; padding: 16px; border-radius: 6px; font-size: 13px; font-weight: 600; display: flex; align-items: center; }
.header { grid-column: 1 / -1; background: #1e1b4b; font-size: 1rem; font-weight: 700; }
.footer { grid-column: 1 / -1; background: #0f172a; color: #64748b; font-size: 12px; }
.main   { background: #059669; }
.right  { background: #7c3aed; }
```

**SE lens:** Explicit placement shines for **dashboard layouts** where specific components must live in specific spots. Auto-flow handles regular grids (galleries, card lists); explicit placement handles bespoke page layouts.

**Common mistakes:**
- Off-by-one errors — a 3-column grid has lines 1, 2, 3, 4 (not 1, 2, 3). `grid-column: 1 / 3` spans columns 1 and 2, not 1, 2, and 3.
- Placing an item outside the explicit grid — it creates an implicit track. Explicit placement only works within defined tracks (or auto-creates implicit ones).

**Debug tip:** DevTools Grid inspector numbers all grid lines when you hover the grid badge — exactly matching the CSS line numbers. Use this to verify your `grid-column` and `grid-row` values.

**Next:** Named grid areas — a more readable way to assign items to regions.

## Challenge: grid_placement

Place the items explicitly in a 3-column grid.

1. `#header` — `grid-column: 1 / -1` (full width)
2. `#sidebar` — `grid-column: 1 / 2`, `grid-row: 2 / 3`
3. `#main` — `grid-column: 2 / 4`, `grid-row: 2 / 3`
4. `#footer` — `grid-column: 1 / -1` (full width)

```html
<div class="grid" style="display:grid;grid-template-columns:repeat(3,1fr);grid-template-rows:60px 120px 40px;gap:8px;background:#1e293b;padding:10px;border-radius:10px;">
  <div id="header" style="background:#1e1b4b;color:white;border-radius:6px;display:flex;align-items:center;padding:0 16px;font-family:system-ui;font-weight:700;">Header</div>
  <div id="sidebar" style="background:#7c3aed;color:white;border-radius:6px;display:flex;align-items:center;padding:0 16px;font-family:system-ui;font-weight:600;">Sidebar</div>
  <div id="main" style="background:#059669;color:white;border-radius:6px;display:flex;align-items:center;padding:0 16px;font-family:system-ui;font-weight:600;">Main</div>
  <div id="footer" style="background:#0f172a;color:#64748b;border-radius:6px;display:flex;align-items:center;padding:0 16px;font-family:system-ui;font-size:13px;">Footer</div>
</div>
```

```challenge
#header {

}

#sidebar {

}

#main {

}

#footer {

}
```

```test
var h  = getComputedStyle(document.querySelector('#header'))
var sb = getComputedStyle(document.querySelector('#sidebar'))
var m  = getComputedStyle(document.querySelector('#main'))
var f  = getComputedStyle(document.querySelector('#footer'))
assert h.gridColumnStart === '1'
assert h.gridColumnEnd === '-1' || h.gridColumnEnd === '4'
assert sb.gridColumnStart === '1'
assert sb.gridColumnEnd === '2'
assert m.gridColumnStart === '2'
assert m.gridColumnEnd === '4'
assert f.gridColumnStart === '1'
assert f.gridColumnEnd === '-1' || f.gridColumnEnd === '4'
```
