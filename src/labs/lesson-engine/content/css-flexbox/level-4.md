---
series: css-flexbox
level: 4
title: flex-grow, flex-shrink, flex-basis
lang: css
---

# flex-grow, flex-shrink, flex-basis

These three properties control how a **flex item** sizes itself relative to its siblings. `flex-basis` sets the starting size. `flex-grow` lets it claim free space. `flex-shrink` lets it give up space when the container is too narrow. Together they replace most `width: %` calculations with a more powerful proportional system.

## flex-basis — the starting size

`flex-basis` sets the item's size **before** any growing or shrinking happens. It is like `width` for row containers, but it respects the flex context. Edit the values to see how items start at their basis before the container distributes space.

```html
<div class="row">
  <div class="item" id="b1">basis: 100px</div>
  <div class="item" id="b2">basis: 200px</div>
  <div class="item" id="b3">basis: auto (content width)</div>
</div>
```

```css
body { background: #0f172a; padding: 24px; font-family: system-ui; }
.row  { display: flex; gap: 8px; background: #1e293b; padding: 12px; border-radius: 8px; }
.item { background: #6366f1; color: white; padding: 12px; border-radius: 6px; font-size: 13px; font-weight: 600; flex-grow: 0; flex-shrink: 0; }
#b1 { flex-basis: 100px; }
#b2 { flex-basis: 200px; }
#b3 { flex-basis: auto; }
```

`flex-basis: 0` means "ignore content size, start from zero." `flex-basis: auto` uses the item's content size (or its `width` if set). `flex-basis: 200px` starts at 200px.

## flex-grow — claiming free space

`flex-grow` sets how much of the **remaining space** after `flex-basis` an item claims. Items with a higher `flex-grow` number get proportionally more space. Items with `flex-grow: 0` get none.

```html
<div class="row">
  <div class="item" id="g0">grow: 0 (stays at basis)</div>
  <div class="item" id="g1">grow: 1</div>
  <div class="item" id="g2">grow: 2 — gets twice as much free space as grow:1</div>
</div>
```

```css
body { background: #0f172a; padding: 24px; font-family: system-ui; }
.row  { display: flex; gap: 8px; background: #1e293b; padding: 12px; border-radius: 8px; }
.item { background: #6366f1; color: white; padding: 12px; border-radius: 6px; font-size: 13px; font-weight: 600; flex-basis: 0; }
#g0 { flex-grow: 0; background: #475569; }
#g1 { flex-grow: 1; }
#g2 { flex-grow: 2; }
```

**CS lens:** The algorithm: (1) compute each item's `flex-basis` size; (2) sum all bases; (3) calculate free space = container width − sum of bases; (4) distribute free space proportionally by `flex-grow` ratio. A grow ratio of `2:1` means the first item gets 2/3 of the free space, the second gets 1/3.

## flex-shrink — giving up space

`flex-shrink` mirrors `flex-grow` but for when the container is **too small**. Items with `flex-shrink: 0` refuse to shrink below their `flex-basis`. Items with higher shrink values give up more space.

```html
<div class="row narrow">
  <div class="item" id="s0">shrink: 0 — won't shrink, causes overflow</div>
  <div class="item" id="s1">shrink: 1 — normal shrink</div>
  <div class="item" id="s2">shrink: 3 — shrinks 3× faster</div>
</div>
```

```css
body { background: #0f172a; padding: 24px; font-family: system-ui; }
.row  { display: flex; gap: 8px; background: #1e293b; padding: 12px; border-radius: 8px; }
.narrow { width: 400px; overflow: hidden; }
.item   { background: #6366f1; color: white; padding: 12px; border-radius: 6px; font-size: 13px; font-weight: 600; flex-basis: 180px; }
#s0 { flex-shrink: 0; background: #dc2626; }
#s1 { flex-shrink: 1; }
#s2 { flex-shrink: 3; }
```

`flex-shrink: 0` combined with `flex-basis: 280px` is the standard pattern for a sidebar that should never collapse.

## The flex shorthand

`flex` combines all three values: `flex: <grow> <shrink> <basis>`. The four most common shorthand values have special meaning:

```html
<div class="row">
  <div class="item f-1">flex: 1 — fills all space, equal with siblings</div>
  <div class="item f-auto">flex: auto — starts at content size, then grows</div>
  <div class="item f-none">flex: none — fixed at content size, no grow/shrink</div>
  <div class="item f-basis">flex: 0 1 200px — basis 200px, shrinks but won't grow</div>
</div>
```

```css
body { background: #0f172a; padding: 24px; font-family: system-ui; }
.row  { display: flex; gap: 8px; background: #1e293b; padding: 12px; border-radius: 8px; }
.item { color: white; padding: 12px; border-radius: 6px; font-size: 12px; font-weight: 600; line-height: 1.4; }
.f-1     { flex: 1; background: #6366f1; }
.f-auto  { flex: auto; background: #059669; }
.f-none  { flex: none; background: #dc2626; }
.f-basis { flex: 0 1 200px; background: #d97706; }
```

`flex: 1` is equivalent to `flex: 1 1 0` — start at zero, grow and shrink equally. The most common shorthand.

`flex: auto` is equivalent to `flex: 1 1 auto` — start at content size, then grow/shrink.

`flex: none` is equivalent to `flex: 0 0 auto` — fixed at content size.

**SE lens:** In production code, `flex: 1` is used on the "main content" item alongside other fixed-size items. The main content claims all remaining space while nav, sidebar, and footer stay their natural sizes.

**Common mistakes:**
- Writing `flex-grow: 1` without setting `flex-basis: 0` — items will have unequal sizes because each starts at its content width before growing.
- Using `flex-shrink: 0` on every item — when items overflow the container they won't shrink and will cause horizontal scroll.

**Debug tip:** In DevTools, hovering a flex item shows its flex values (grow/shrink/basis) in a tooltip next to the element. The Computed panel shows the resolved `flex-basis` after the browser calculates it.

**Next:** `gap` — the right way to add space between flex items.

## Challenge: flex_sizing

Set the three items to grow proportionally: the sidebar stays fixed, the main content fills remaining space.

1. `#sidebar` — `flex: 0 0 200px` (fixed, no grow or shrink)
2. `#main` — `flex: 1` (claims all remaining space)
3. `#aside` — `flex: 0 0 160px` (fixed, no grow or shrink)

```html
<div class="layout" style="display:flex;gap:16px;background:#1e293b;padding:16px;border-radius:8px;">
  <div id="sidebar">Sidebar</div>
  <div id="main">Main Content</div>
  <div id="aside">Aside</div>
</div>
```

```challenge
#sidebar, #main, #aside {
  background: #6366f1;
  color: white;
  padding: 20px 12px;
  border-radius: 6px;
  font-family: system-ui;
  font-weight: 600;
  font-size: 13px;
}

#sidebar {

}

#main {

}

#aside {

}
```

```test
var sb = getComputedStyle(document.querySelector('#sidebar'))
var main = getComputedStyle(document.querySelector('#main'))
var aside = getComputedStyle(document.querySelector('#aside'))
assert sb.flexGrow === '0'
assert sb.flexShrink === '0'
assert sb.flexBasis === '200px'
assert main.flexGrow === '1'
assert aside.flexGrow === '0'
assert aside.flexShrink === '0'
assert aside.flexBasis === '160px'
```
