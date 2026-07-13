---
series: css-grid
level: 1
title: repeat(), fr, and minmax()
lang: css
---

# repeat(), fr, and minmax()

The three most powerful grid functions. `repeat()` avoids repetition for regular grids. `fr` distributes space proportionally. `minmax()` sets floor and ceiling on track sizes. Together they make grids that adapt to content and viewport without media queries.

## repeat() — shorthand for regular grids

`repeat(count, size)` is shorthand for writing the same track definition multiple times. `grid-template-columns: repeat(4, 1fr)` is identical to `grid-template-columns: 1fr 1fr 1fr 1fr`.

```html
<p class="lbl">repeat(4, 1fr) — 4 equal columns</p>
<div class="grid g4">
  <div class="item">1</div><div class="item">2</div><div class="item">3</div><div class="item">4</div>
  <div class="item">5</div><div class="item">6</div><div class="item">7</div><div class="item">8</div>
</div>

<p class="lbl">repeat(3, 200px) — 3 fixed 200px columns</p>
<div class="grid g3-fixed">
  <div class="item">200px</div><div class="item">200px</div><div class="item">200px</div>
</div>

<p class="lbl">repeat(2, 1fr 2fr) — alternating column widths</p>
<div class="grid g-alt">
  <div class="item">1fr</div><div class="item">2fr</div>
  <div class="item">1fr</div><div class="item">2fr</div>
</div>
```

```css
body { background: #0f172a; padding: 16px; font-family: system-ui; }
.lbl { color: #64748b; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; margin: 12px 0 4px; }
.grid { display: grid; gap: 8px; background: #1e293b; padding: 10px; border-radius: 8px; margin-bottom: 6px; }
.item { background: #6366f1; color: white; padding: 12px; border-radius: 6px; font-weight: 700; font-size: 13px; text-align: center; }
.g4 { grid-template-columns: repeat(4, 1fr); }
.g3-fixed { grid-template-columns: repeat(3, 200px); }
.g-alt { grid-template-columns: repeat(2, 1fr 2fr); }
```

## fr — the fraction unit

`fr` is a grid-only unit meaning "one fraction of the **free space** after fixed and auto tracks are sized." Fractions are distributed proportionally — `2fr` gets twice as much space as `1fr`.

```html
<div class="fr-demo">
  <div class="item" id="fr1">1fr</div>
  <div class="item" id="fr2">2fr</div>
  <div class="item" id="fr1b">1fr</div>
</div>
<div class="fr-mixed">
  <div class="item fixed">200px fixed</div>
  <div class="item grow">1fr — gets all remaining space</div>
  <div class="item fixed">120px fixed</div>
</div>
```

```css
body { background: #0f172a; padding: 24px; font-family: system-ui; }
.item { background: #6366f1; color: white; padding: 14px; border-radius: 6px; font-weight: 600; font-size: 13px; text-align: center; }
.fixed { background: #475569; }
.grow  { background: #059669; }
.fr-demo   { display: grid; grid-template-columns: 1fr 2fr 1fr; gap: 8px; background: #1e293b; padding: 10px; border-radius: 8px; margin-bottom: 12px; }
.fr-mixed  { display: grid; grid-template-columns: 200px 1fr 120px; gap: 8px; background: #1e293b; padding: 10px; border-radius: 8px; }
```

`fr` tracks only share the **remaining space** after fixed tracks are sized. In `.fr-mixed`, the fixed columns take 320px first, then the `1fr` column gets everything left.

**CS lens:** `fr` is computed at layout time — the browser first sizes all non-fr tracks, subtracts their widths and gaps from the container, then divides what's left by the total fr count. This happens every time the container resizes.

## minmax() — floor and ceiling

`minmax(min, max)` sets a minimum and maximum size for a track. The track will be at least `min` and at most `max`. This is the key function for responsive grids.

```html
<div class="minmax-demo">
  <div class="item">minmax(150px, 1fr)</div>
  <div class="item">minmax(150px, 1fr)</div>
  <div class="item">minmax(150px, 1fr)</div>
</div>
<p class="note">Each column is at least 150px wide and grows to fill available space equally. Try narrowing this frame.</p>

<div class="sidebar-layout">
  <div class="item sidebar">minmax(200px, 300px) sidebar</div>
  <div class="item content">1fr main content</div>
</div>
```

```css
body { background: #0f172a; padding: 24px; font-family: system-ui; }
.item { background: #6366f1; color: white; padding: 14px; border-radius: 6px; font-weight: 600; font-size: 13px; text-align: center; }
.sidebar { background: #7c3aed; }
.content { background: #059669; }
.minmax-demo { display: grid; grid-template-columns: repeat(3, minmax(150px, 1fr)); gap: 8px; background: #1e293b; padding: 10px; border-radius: 8px; margin-bottom: 8px; }
.note { color: #64748b; font-size: 13px; margin: 4px 0 16px; }
.sidebar-layout { display: grid; grid-template-columns: minmax(200px, 300px) 1fr; gap: 8px; background: #1e293b; padding: 10px; border-radius: 8px; }
```

## auto-fill and auto-fit — responsive without media queries

`repeat(auto-fill, minmax(200px, 1fr))` creates as many columns as fit, each at least 200px wide. No media queries needed — items wrap naturally.

```html
<p class="lbl">auto-fill: always maintains column tracks even if empty</p>
<div class="auto-fill">
  <div class="card">Card 1</div>
  <div class="card">Card 2</div>
  <div class="card">Card 3</div>
</div>

<p class="lbl">auto-fit: collapses empty tracks — items stretch to fill</p>
<div class="auto-fit">
  <div class="card">Card 1</div>
  <div class="card">Card 2</div>
  <div class="card">Card 3</div>
</div>
```

```css
body { background: #0f172a; padding: 16px; font-family: system-ui; }
.lbl { color: #64748b; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; margin: 12px 0 4px; }
.card { background: #6366f1; color: white; padding: 20px 16px; border-radius: 8px; font-weight: 600; font-size: 14px; text-align: center; }
.auto-fill { display: grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); gap: 12px; background: #1e293b; padding: 12px; border-radius: 8px; margin-bottom: 8px; }
.auto-fit  { display: grid; grid-template-columns: repeat(auto-fit,  minmax(180px, 1fr)); gap: 12px; background: #1e293b; padding: 12px; border-radius: 8px; }
```

`auto-fill` vs `auto-fit`: with few items in a wide container, `auto-fill` keeps empty column tracks while `auto-fit` collapses them, making items stretch to fill all space.

**SE lens:** `repeat(auto-fit, minmax(250px, 1fr))` is the single most common grid pattern in production — responsive card grids, product lists, photo galleries. It replaces multiple breakpoint-specific column declarations with one line.

**Common mistakes:**
- Using `minmax(0, 1fr)` instead of `1fr` when items can overflow — `1fr` has an implicit minimum of `auto` (content size), which can cause overflow. `minmax(0, 1fr)` allows the track to shrink below content size.
- Mixing `auto-fill` and fixed column counts in the same rule — pick one approach.

**Debug tip:** The DevTools Grid inspector shows each track's computed size. Hover a track to highlight it and see its exact pixel width.

**Next:** Grid placement — `grid-column`, `grid-row`, and `span` for explicit item positioning.

## Challenge: repeat_minmax

Create a responsive card grid.

1. `.grid` — `display: grid`, `grid-template-columns: repeat(auto-fit, minmax(160px, 1fr))`, `gap: 16px`

```html
<div class="grid">
  <div class="card" id="c1">Card 1</div>
  <div class="card" id="c2">Card 2</div>
  <div class="card" id="c3">Card 3</div>
  <div class="card" id="c4">Card 4</div>
</div>
```

```challenge
.grid {

}

.card {
  background: #6366f1;
  color: white;
  padding: 24px 16px;
  border-radius: 8px;
  font-family: system-ui;
  font-weight: 700;
  text-align: center;
}
```

```test
var g = getComputedStyle(document.querySelector('.grid'))
assert g.display === 'grid'
assert g.gap === '16px' || g.columnGap === '16px'
var cols = g.gridTemplateColumns
assert cols !== 'none' && cols !== ''
var cardWidth = document.querySelector('#c1').getBoundingClientRect().width
assert cardWidth >= 160   // minmax(160px, ...) enforces a minimum column width
```
