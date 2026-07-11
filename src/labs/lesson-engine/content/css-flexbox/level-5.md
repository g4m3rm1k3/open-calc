---
series: css-flexbox
level: 5
title: gap and order
lang: css
---

# gap and order

`gap` is the clean way to add space between flex items. `order` lets you change the visual order of items without touching the HTML. Together they give you fine-grained control over spacing and sequence.

## gap — space between items

`gap` sets the space between flex items. It is simpler and less error-prone than margins because it only applies *between* items — no extra space at the start or end of the container.

```html
<p class="lbl">No gap — items touching</p>
<div class="row no-gap">
  <div class="item">A</div><div class="item">B</div><div class="item">C</div>
</div>

<p class="lbl">gap: 8px — tight</p>
<div class="row gap-8">
  <div class="item">A</div><div class="item">B</div><div class="item">C</div>
</div>

<p class="lbl">gap: 24px — generous</p>
<div class="row gap-24">
  <div class="item">A</div><div class="item">B</div><div class="item">C</div>
</div>

<p class="lbl">column-gap: 32px; row-gap: 8px — different axes</p>
<div class="row wrap-gap">
  <div class="item">A</div><div class="item">B</div><div class="item">C</div>
  <div class="item">D</div><div class="item">E</div>
</div>
```

```css
body { background: #0f172a; padding: 16px; font-family: system-ui; }
.lbl  { color: #64748b; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; margin: 12px 0 4px; }
.row  { display: flex; flex-wrap: wrap; background: #1e293b; padding: 10px; border-radius: 8px; margin-bottom: 6px; }
.item { background: #6366f1; color: white; padding: 10px 18px; border-radius: 4px; font-weight: 700; font-size: 13px; }
.no-gap  { gap: 0; }
.gap-8   { gap: 8px; }
.gap-24  { gap: 24px; }
.wrap-gap { column-gap: 32px; row-gap: 8px; }
```

`gap: 16px` applies equally to both row and column gaps. `gap: 8px 16px` sets row-gap then column-gap. `row-gap` and `column-gap` can be set independently for wrapping layouts.

**CS lens:** `gap` works identically in Grid and Flexbox — it replaced the Grid-only `grid-gap` property and was extended to Flexbox. Using `margin` to space items is an older pattern; `gap` is the preferred modern approach because it doesn't add space before the first item or after the last.

## gap vs margin — why gap wins

Using `margin-right` on flex items to create gutters adds extra space at the end of each row. `gap` avoids this. Compare:

```html
<p class="lbl">margin-right approach — unwanted space after last item</p>
<div class="row margin-way">
  <div class="item">A</div><div class="item">B</div><div class="item">C</div>
</div>

<p class="lbl">gap approach — clean, no extra space</p>
<div class="row gap-way">
  <div class="item">A</div><div class="item">B</div><div class="item">C</div>
</div>
```

```css
body { background: #0f172a; padding: 16px; font-family: system-ui; }
.lbl  { color: #64748b; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; margin: 12px 0 4px; }
.row  { display: flex; background: #1e293b; padding: 10px; border-radius: 8px; margin-bottom: 6px; }
.item { background: #6366f1; color: white; padding: 10px 18px; border-radius: 4px; font-weight: 700; font-size: 13px; }
.margin-way .item { margin-right: 16px; } /* last item still gets 16px right margin */
.gap-way { gap: 16px; }                   /* no space outside the items */
```

## order — changing visual sequence

`order` changes the visual order of flex items without changing the HTML. Default order is `0` — higher values move items later, negative values move them earlier. This is useful for responsive design: reorder items at different breakpoints.

```html
<div class="row">
  <div class="item" id="a">A (order: 3)</div>
  <div class="item" id="b">B (order: 1)</div>
  <div class="item" id="c">C (order: 2)</div>
  <div class="item" id="d">D (order: -1 — goes first)</div>
</div>
<p class="note">HTML order: A, B, C, D — Visual order: D, B, C, A</p>
```

```css
body { background: #0f172a; padding: 24px; font-family: system-ui; }
.row  { display: flex; gap: 8px; background: #1e293b; padding: 12px; border-radius: 8px; }
.item { background: #6366f1; color: white; padding: 12px 16px; border-radius: 6px; font-weight: 700; font-size: 13px; }
#a { order: 3; }
#b { order: 1; }
#c { order: 2; }
#d { order: -1; background: #dc2626; }
.note { color: #64748b; font-size: 13px; margin-top: 8px; }
```

**CS lens:** `order` only affects visual rendering — the DOM order stays the same. Tab navigation, screen readers, and `querySelector` all follow DOM order. This means `order` can create a mismatch between the visual order and the keyboard/accessibility order. Use it sparingly and test with keyboard navigation.

## Responsive reorder — the hero pattern

On mobile (narrow), show content first and image second. On desktop (wide), show image first and content second — pure CSS, no JavaScript.

```html
<div class="hero">
  <div class="content" id="content">
    <h2>Learn flexbox</h2>
    <p>Content appears first in DOM and on mobile. Image is pushed after it.</p>
    <button>Get started</button>
  </div>
  <div class="image" id="image">
    <div class="img-placeholder">Image</div>
  </div>
</div>
```

```css
body { background: #0f172a; padding: 24px; font-family: system-ui; }
.hero { display: flex; gap: 24px; background: #1e293b; padding: 24px; border-radius: 12px; }
.content { flex: 1; order: 2; }  /* visual order: second */
.image   { flex: 0 0 160px; order: 1; }  /* visual order: first */
.content h2 { color: #e2e8f0; margin: 0 0 8px; }
.content p  { color: #94a3b8; font-size: 14px; line-height: 1.5; margin: 0 0 12px; }
.content button { background: #6366f1; color: white; border: none; padding: 8px 16px; border-radius: 6px; font-weight: 600; cursor: pointer; }
.img-placeholder { background: #334155; border-radius: 8px; height: 100%; min-height: 100px; display: flex; align-items: center; justify-content: center; color: #475569; font-weight: 600; }
```

**SE lens:** `order` is a visual-only operation — it is safe for cosmetic reordering where the content makes sense in both orders. Never use it to hide the actual logical sequence of content from assistive technology.

**Common mistakes:**
- Using `margin` instead of `gap` for gutters — margin accumulates at the container edges.
- Using `order` for tab order control — it only affects visual rendering, not focus order. Use `tabindex` or reorder the DOM for focus control.

**Debug tip:** In DevTools, flex items show their `order` value in the Flexbox inspector. You can see the visual order highlighted with numbers.

**Next:** Real-world flex patterns — sticky footer, split sidebar layout, holy grail.

## Challenge: gap_and_order

1. `.row` — `display: flex`, `gap: 20px`
2. `#first-visual` — `order: -1` (appears first visually even though it is second in HTML)
3. `#last-visual` — `order: 10` (appears last)

```html
<div class="row">
  <div class="box" id="html-first">HTML 1st</div>
  <div class="box" id="first-visual">HTML 2nd → Visual 1st</div>
  <div class="box" id="html-third">HTML 3rd</div>
  <div class="box" id="last-visual">HTML 4th → Visual last</div>
</div>
```

```challenge
.row {
  background: #1e293b;
  padding: 12px;
  border-radius: 8px;
}

.box {
  background: #6366f1;
  color: white;
  padding: 12px 16px;
  border-radius: 6px;
  font-family: system-ui;
  font-weight: 600;
  font-size: 13px;
}

/* Set gap on .row, order on #first-visual and #last-visual */
```

```test
var r = getComputedStyle(document.querySelector('.row'))
var fv = getComputedStyle(document.querySelector('#first-visual'))
var lv = getComputedStyle(document.querySelector('#last-visual'))
assert r.display === 'flex'
assert r.gap === '20px'
assert parseInt(fv.order) < 0
assert parseInt(lv.order) >= 10
```
