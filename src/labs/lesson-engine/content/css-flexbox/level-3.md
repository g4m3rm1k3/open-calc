---
series: css-flexbox
level: 3
title: flex-wrap
lang: css
---

# flex-wrap

By default, flex items squeeze onto a single line — they shrink to fit even if it makes them too narrow to read. `flex-wrap: wrap` tells the container: "if items don't fit on one line, start a new line." This is the first step toward responsive flex layouts.

## nowrap vs wrap — the core difference

Without `flex-wrap`, five items cram into one row and shrink. With `flex-wrap: wrap` they overflow onto a new line when there's no more space. Edit the item width to see when wrapping kicks in.

```html
<p class="lbl">flex-wrap: nowrap (default) — items shrink to fit one row</p>
<div class="row nowrap">
  <div class="item">Item 1</div>
  <div class="item">Item 2</div>
  <div class="item">Item 3</div>
  <div class="item">Item 4</div>
  <div class="item">Item 5</div>
</div>

<p class="lbl">flex-wrap: wrap — items flow to new lines</p>
<div class="row wrap">
  <div class="item">Item 1</div>
  <div class="item">Item 2</div>
  <div class="item">Item 3</div>
  <div class="item">Item 4</div>
  <div class="item">Item 5</div>
</div>
```

```css
body { background: #0f172a; padding: 16px; font-family: system-ui; }
.lbl { color: #64748b; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; margin: 12px 0 4px; }
.row  { display: flex; gap: 8px; background: #1e293b; padding: 12px; border-radius: 8px; margin-bottom: 8px; }
.item { background: #6366f1; color: white; padding: 10px 16px; border-radius: 4px; font-weight: 600; font-size: 13px; min-width: 100px; text-align: center; }
.nowrap { flex-wrap: nowrap; }
.wrap   { flex-wrap: wrap; }
```

**CS lens:** When `flex-wrap: nowrap`, the `flex-shrink` factor controls how items compress. When `flex-wrap: wrap`, items maintain their base size (or `flex-basis`) and a new line starts when there's no room. The two mechanisms don't mix — it's either "shrink on one line" or "wrap to new lines."

## flex-wrap with flex-basis — the responsive card grid

Giving items a `flex-basis` (minimum width) combined with `flex-wrap: wrap` creates a naturally responsive grid with no media queries — items fill the row and wrap when they can't fit.

```html
<div class="card-grid">
  <div class="card">Card 1<br><small>flex-basis: 200px</small></div>
  <div class="card">Card 2<br><small>Grows to fill available space</small></div>
  <div class="card">Card 3<br><small>Wraps when no room left</small></div>
  <div class="card">Card 4<br><small>Starts a new row</small></div>
  <div class="card">Card 5<br><small>Fills new row too</small></div>
</div>
```

```css
body { background: #0f172a; padding: 24px; font-family: system-ui; }
.card-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
}
.card {
  flex: 1 1 200px;  /* grow | shrink | basis */
  background: #1e293b;
  color: #e2e8f0;
  padding: 20px;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 600;
  line-height: 1.6;
}
small { font-weight: 400; color: #64748b; }
```

`flex: 1 1 200px` means: start at 200px wide, grow to fill available space, shrink if needed. Items with `flex-basis: 200px` fit two or three per row depending on the container width — and wrap naturally without a single media query.

## align-content — controlling wrapped rows

When items wrap, `align-content` controls how the **rows themselves** are distributed on the cross axis. It is `justify-content` but for rows, not items. It has no effect when there is only one row.

```html
<div class="wrap-demo stretch">
  <div class="i">1</div><div class="i">2</div><div class="i">3</div>
  <div class="i">4</div><div class="i">5</div>
  <p class="caption">align-content: stretch (default)</p>
</div>
<div class="wrap-demo space-between">
  <div class="i">1</div><div class="i">2</div><div class="i">3</div>
  <div class="i">4</div><div class="i">5</div>
  <p class="caption">align-content: space-between</p>
</div>
<div class="wrap-demo center-ac">
  <div class="i">1</div><div class="i">2</div><div class="i">3</div>
  <div class="i">4</div><div class="i">5</div>
  <p class="caption">align-content: center</p>
</div>
```

```css
body { background: #0f172a; padding: 16px; font-family: system-ui; }
.wrap-demo { display: flex; flex-wrap: wrap; gap: 6px; background: #1e293b; padding: 10px; border-radius: 8px; height: 120px; margin-bottom: 10px; position: relative; }
.i { background: #6366f1; color: white; width: 60px; height: 30px; border-radius: 4px; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 12px; }
.caption { position: absolute; bottom: 4px; right: 8px; color: #475569; font-size: 10px; margin: 0; }
.stretch       { align-content: stretch; }
.space-between { align-content: space-between; }
.center-ac     { align-content: center; }
```

**SE lens:** `flex-wrap: wrap` combined with `flex-basis` and `gap` is often enough for a responsive grid without CSS Grid. Use it when items are naturally uniform — tags, cards, avatars. Switch to CSS Grid when you need explicit column control or non-uniform layouts.

**Common mistakes:**
- Confusing `align-items` (aligns items within their row) with `align-content` (aligns rows within the container). `align-content` only applies with `flex-wrap: wrap`.
- Setting `flex-wrap: wrap` but not giving items a `flex-basis` — items at 100% width wrap onto individual lines, which is rarely intended.

**Debug tip:** In DevTools, a wrapping flex container shows multiple "lines" in the Flexbox inspector. Each line is a distinct row with its own cross-axis space allocation.

**Next:** `flex-grow`, `flex-shrink`, and `flex-basis` — the three properties that control how individual items size themselves.

## Challenge: flex_wrap

Create a wrapping card grid.

1. `.grid` — `display: flex`, `flex-wrap: wrap`, `gap: 16px`
2. `.card` — `flex: 1 1 160px` (grow, shrink, basis)

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
  padding: 20px;
  border-radius: 8px;
  font-family: system-ui;
  font-weight: 600;
  text-align: center;
}
```

```test
var g = getComputedStyle(document.querySelector('.grid'))
var c = getComputedStyle(document.querySelector('#c1'))
assert g.display === 'flex'
assert g.flexWrap === 'wrap'
assert g.gap === '16px'
assert c.flexGrow === '1'
assert c.flexShrink === '1'
assert c.flexBasis === '160px'
```
