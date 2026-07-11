---
series: css-grid
level: 4
title: Grid Alignment
lang: css
---

# Grid Alignment

Grid has two sets of alignment controls: **track alignment** (how the entire grid sits in its container) and **item alignment** (how each item sits within its cell). The naming follows a pattern: `justify-*` for the column axis, `align-*` for the row axis.

## justify-items and align-items — default cell alignment

These set the default alignment for ALL items within their cells. Items don't have to fill their entire cell — they can be smaller and positioned within it.

```html
<p class="lbl">justify-items: start · align-items: start</p>
<div class="grid g-start">
  <div class="item">A</div><div class="item">B</div><div class="item wide">Wide</div>
  <div class="item tall">Tall</div><div class="item">E</div><div class="item">F</div>
</div>
<p class="lbl">justify-items: center · align-items: center</p>
<div class="grid g-center">
  <div class="item">A</div><div class="item">B</div><div class="item wide">Wide</div>
  <div class="item tall">Tall</div><div class="item">E</div><div class="item">F</div>
</div>
<p class="lbl">justify-items: stretch · align-items: stretch (default)</p>
<div class="grid g-stretch">
  <div class="item">A</div><div class="item">B</div><div class="item wide">Wide</div>
  <div class="item tall">Tall</div><div class="item">E</div><div class="item">F</div>
</div>
```

```css
body { background: #0f172a; padding: 16px; font-family: system-ui; }
.lbl { color: #64748b; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; margin: 12px 0 4px; }
.grid { display: grid; grid-template-columns: repeat(3, 1fr); grid-auto-rows: 70px; gap: 6px; background: #1e293b; padding: 8px; border-radius: 8px; margin-bottom: 6px; }
.item { background: #6366f1; color: white; padding: 8px 12px; border-radius: 4px; font-weight: 700; font-size: 13px; }
.wide { width: 80px; }
.tall { height: 40px; }
.g-start   { justify-items: start;   align-items: start;   }
.g-center  { justify-items: center;  align-items: center;  }
.g-stretch { justify-items: stretch; align-items: stretch; }
```

`stretch` is the default — items fill their cell. `start` pins items to the cell's start corner. `center` centres them within the cell.

## justify-self and align-self — per-item overrides

Override the container's `justify-items` / `align-items` for one specific item. Identical concept to flexbox's `align-self`.

```html
<div class="grid">
  <div class="item" id="default">Default (stretch)</div>
  <div class="item" id="j-center">justify-self: center</div>
  <div class="item" id="j-end">justify-self: end</div>
  <div class="item" id="a-center">align-self: center</div>
  <div class="item" id="place-center">place-self: center (both)</div>
  <div class="item" id="normal">Normal</div>
</div>
```

```css
body { background: #0f172a; padding: 24px; font-family: system-ui; }
.grid { display: grid; grid-template-columns: repeat(3, 1fr); grid-auto-rows: 100px; gap: 8px; background: #1e293b; padding: 10px; border-radius: 10px; }
.item { background: #6366f1; color: white; padding: 10px 14px; border-radius: 6px; font-size: 12px; font-weight: 600; }
#j-center     { justify-self: center; background: #059669; }
#j-end        { justify-self: end;    background: #d97706; }
#a-center     { align-self: center;   background: #dc2626; }
#place-center { place-self: center;   background: #7c3aed; }
```

`place-self: center` is shorthand for `align-self: center; justify-self: center` — the cleanest way to centre one item in its cell.

**CS lens:** `place-items` is shorthand for both `align-items` and `justify-items` at once: `place-items: center` centres all items in their cells on both axes simultaneously.

## justify-content and align-content — aligning the whole grid

When the total grid size is smaller than the container, these properties control how the tracks are distributed within the container space — exactly like `justify-content` and `align-content` in flexbox.

```html
<div class="outer">
  <div class="grid g-start">
    <div class="item">1</div><div class="item">2</div>
    <div class="item">3</div><div class="item">4</div>
    <p class="cap">justify-content: start</p>
  </div>
  <div class="grid g-center">
    <div class="item">1</div><div class="item">2</div>
    <div class="item">3</div><div class="item">4</div>
    <p class="cap">justify-content: center</p>
  </div>
  <div class="grid g-evenly">
    <div class="item">1</div><div class="item">2</div>
    <div class="item">3</div><div class="item">4</div>
    <p class="cap">justify-content: space-evenly</p>
  </div>
</div>
```

```css
body { background: #0f172a; padding: 16px; font-family: system-ui; }
.outer { display: flex; gap: 12px; }
.grid  { flex: 1; display: grid; grid-template-columns: repeat(2, 80px); grid-auto-rows: 50px; gap: 8px; background: #1e293b; padding: 10px; border-radius: 8px; position: relative; padding-bottom: 28px; }
.item  { background: #6366f1; color: white; border-radius: 4px; font-weight: 700; font-size: 14px; display: flex; align-items: center; justify-content: center; }
.cap   { position: absolute; bottom: 4px; left: 0; right: 0; text-align: center; color: #64748b; font-size: 10px; margin: 0; }
.g-start  { justify-content: start; }
.g-center { justify-content: center; }
.g-evenly { justify-content: space-evenly; }
```

`justify-content` only has an effect when the grid tracks have explicit sizes (not `1fr`) that don't fill the container.

## place-items shorthand — the centering trick

`place-items: center` on a grid container centres all items in their cells on both axes — the two-line perfect centering for any content, any size.

```html
<div class="center-grid">
  <div class="card">
    <h2>Centred Card</h2>
    <p>place-items: center centres content in every grid cell</p>
  </div>
</div>
```

```css
body { background: #0f172a; padding: 24px; font-family: system-ui; margin: 0; }
.center-grid {
  display: grid;
  place-items: center;
  min-height: 200px;
  background: linear-gradient(135deg, #1e1b4b, #0f172a);
  border-radius: 12px;
}
.card { background: #1e293b; padding: 24px; border-radius: 10px; max-width: 300px; text-align: center; }
.card h2 { color: #818cf8; margin: 0 0 8px; }
.card p  { color: #94a3b8; font-size: 14px; line-height: 1.5; margin: 0; }
```

**SE lens:** `display: grid; place-items: center` is the cleanest centering solution in CSS — cleaner than flexbox centering (which also works) because it explicitly handles both axes with one property.

**Common mistakes:**
- Confusing `justify-items` (how items sit in cells) with `justify-content` (how cells sit in the container). Use DevTools to see which is which.
- Setting `align-content` expecting it to affect item spacing within cells — it only affects track distribution within the container.

**Debug tip:** `place-items: center center` and `place-items: center` are identical — the shorthand repeats the first value for the second axis when only one is provided.

**Next:** gap, auto-fill/auto-fit, and real-world grid patterns.

## Challenge: grid_alignment

Centre all items in their grid cells and centre the grid in its container.

1. `.grid` — `display: grid`, `grid-template-columns: repeat(3, 100px)`, `grid-auto-rows: 80px`, `gap: 12px`, `justify-items: center`, `align-items: center`

```html
<div class="grid">
  <div class="item" id="i1">A</div>
  <div class="item" id="i2">B</div>
  <div class="item" id="i3">C</div>
</div>
```

```challenge
.grid {
  background: #1e293b;
  padding: 16px;
  border-radius: 10px;
}

.item {
  background: #6366f1;
  color: white;
  width: 50px;
  height: 50px;
  border-radius: 6px;
  font-family: system-ui;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
}
```

```test
var g = getComputedStyle(document.querySelector('.grid'))
assert g.display === 'grid'
assert g.justifyItems === 'center'
assert g.alignItems === 'center'
var cols = g.gridTemplateColumns.split(' ')
assert cols.length === 3
assert g.gap === '12px' || g.columnGap === '12px'
```
