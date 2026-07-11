---
series: css-flexbox
level: 2
title: align-items and align-self
lang: css
---

# align-items and align-self

`align-items` controls how flex items are positioned on the **cross axis** — the axis perpendicular to the main axis. When `flex-direction: row`, the main axis runs left-to-right and the cross axis runs top-to-bottom. `align-items` on the container sets the default for all items; `align-self` overrides it for one item.

## align-items — all five values

Each row below uses a different `align-items` value on a tall container. Notice how the items change vertical position while their horizontal position stays the same.

```html
<p class="lbl">stretch (default) — items fill the cross-axis height</p>
<div class="box stretch"><div class="i">A</div><div class="i tall">B tall</div><div class="i">C</div></div>

<p class="lbl">flex-start — items align to the top</p>
<div class="box start"><div class="i">A</div><div class="i tall">B tall</div><div class="i">C</div></div>

<p class="lbl">flex-end — items align to the bottom</p>
<div class="box end"><div class="i">A</div><div class="i tall">B tall</div><div class="i">C</div></div>

<p class="lbl">center — items align to the middle</p>
<div class="box ctr"><div class="i">A</div><div class="i tall">B tall</div><div class="i">C</div></div>

<p class="lbl">baseline — items align on their text baseline</p>
<div class="box base"><div class="i sm">small</div><div class="i lg">BIG</div><div class="i">mid</div></div>
```

```css
body { background: #0f172a; padding: 16px; font-family: system-ui; }
.lbl { color: #64748b; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; margin: 12px 0 4px; }
.box { display: flex; gap: 8px; background: #1e293b; padding: 8px; border-radius: 8px; height: 80px; }
.i   { background: #6366f1; color: white; padding: 8px 14px; border-radius: 4px; font-weight: 700; font-size: 13px; display: flex; align-items: center; }
.tall { height: 60px; }
.sm  { font-size: 10px; }
.lg  { font-size: 28px; padding: 0 8px; }
.stretch { align-items: stretch; }
.start   { align-items: flex-start; }
.end     { align-items: flex-end; }
.ctr     { align-items: center; }
.base    { align-items: baseline; }
```

`stretch` — items grow to fill the container's cross-axis size (default). `flex-start` — items stick to the start of the cross axis. `flex-end` — items stick to the end. `center` — items centred. `baseline` — items aligned on the baseline of their text content.

**CS lens:** `align-items: stretch` means flex items don't need an explicit height to fill the container. This is why flex containers are often used for "equal height columns" — children stretch to match the tallest sibling automatically.

## align-self — per-item override

`align-self` applies to a single flex item and overrides the container's `align-items` for that item. Here three items share `align-items: flex-start` on the container, but the middle item uses `align-self: center` and the last uses `align-self: flex-end`.

```html
<div class="container">
  <div class="item" id="item-start">align-items: flex-start (inherited)</div>
  <div class="item" id="item-self-center">align-self: center</div>
  <div class="item" id="item-self-end">align-self: flex-end</div>
</div>
```

```css
body { background: #0f172a; padding: 24px; font-family: system-ui; }
.container {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  background: #1e293b;
  padding: 16px;
  border-radius: 10px;
  height: 120px;
}
.item { background: #6366f1; color: white; padding: 12px 16px; border-radius: 6px; font-size: 13px; font-weight: 600; }
#item-self-center { align-self: center; background: #059669; }
#item-self-end    { align-self: flex-end; background: #dc2626; }
```

## The alignment grid — both axes at once

With `justify-content` and `align-items` together, you control a 6×5 grid of possible positions. This demo lets you see a few key combinations — notice how the two properties work independently.

```html
<div class="grid-demo">
  <div class="cell" id="c1">
    <p class="tag">justify: flex-start<br>align: flex-start</p>
    <div class="f f1"><div class="dot"></div></div>
  </div>
  <div class="cell" id="c2">
    <p class="tag">justify: center<br>align: center</p>
    <div class="f f2"><div class="dot"></div></div>
  </div>
  <div class="cell" id="c3">
    <p class="tag">justify: flex-end<br>align: flex-end</p>
    <div class="f f3"><div class="dot"></div></div>
  </div>
  <div class="cell" id="c4">
    <p class="tag">justify: space-between<br>align: center</p>
    <div class="f f4"><div class="dot"></div><div class="dot"></div><div class="dot"></div></div>
  </div>
</div>
```

```css
body { background: #0f172a; padding: 16px; font-family: system-ui; }
.grid-demo { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
.cell { background: #1e293b; border-radius: 8px; padding: 12px; }
.tag  { color: #64748b; font-size: 11px; margin: 0 0 8px; line-height: 1.4; }
.f    { display: flex; background: #0f172a; border-radius: 6px; height: 64px; }
.dot  { width: 20px; height: 20px; background: #6366f1; border-radius: 50%; flex-shrink: 0; }
.f1 { justify-content: flex-start; align-items: flex-start; }
.f2 { justify-content: center; align-items: center; }
.f3 { justify-content: flex-end; align-items: flex-end; }
.f4 { justify-content: space-between; align-items: center; }
```

**SE lens:** The ability to control two alignment axes independently, without knowing element dimensions, is what made flexbox revolutionary. The classic "three equal columns with equal gaps and centred content" used to require 20+ lines of float-based CSS. With flexbox it is six properties.

**Common mistakes:**
- Using `align-items` on items — it belongs on the container. Per-item overrides use `align-self`.
- Expecting `align-items` to work when the container has no height — if the container shrinks to fit its content (default), there is no cross-axis space to align within.

**Debug tip:** DevTools Flexbox inspector shows the alignment axis with arrows. Blue arrows = main axis, orange arrows = cross axis. The arrows flip when you change `flex-direction`.

**Next:** `flex-wrap` — what happens when items don't fit on one line.

## Challenge: align_self

Set the cross-axis alignment so:
1. `.container` has `align-items: flex-start`
2. `#middle` has `align-self: center`
3. `#last` has `align-self: flex-end`

```html
<div class="container" style="height:120px;gap:12px;">
  <div class="box" id="first">First</div>
  <div class="box" id="middle">Middle</div>
  <div class="box" id="last">Last</div>
</div>
```

```challenge
.container {
  display: flex;
  background: #1e293b;
  padding: 16px;
  border-radius: 8px;
  box-sizing: border-box;
}

.box {
  background: #6366f1;
  color: white;
  padding: 12px 20px;
  border-radius: 6px;
  font-family: system-ui;
  font-weight: 600;
}

/* Set align-items on .container, align-self on #middle and #last */
```

```test
var c = getComputedStyle(document.querySelector('.container'))
var m = getComputedStyle(document.querySelector('#middle'))
var l = getComputedStyle(document.querySelector('#last'))
assert c.alignItems === 'flex-start' || c.alignItems === 'start'
assert m.alignSelf === 'center'
assert l.alignSelf === 'flex-end' || l.alignSelf === 'end'
```
