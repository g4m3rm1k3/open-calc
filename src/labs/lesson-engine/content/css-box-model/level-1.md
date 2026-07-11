---
series: css-box-model
level: 1
title: box-sizing
lang: css
---

# box-sizing

The default box model adds padding and border on top of your declared `width`, making layouts break in unexpected ways. `box-sizing: border-box` fixes this and is used in every professional CSS project.

## The content-box problem — see it break

Two columns that should each be 50% of the container. Try adding `padding: 20px` to `.col` and watch the right column fall below.

```html
<div id="container">
  <div class="col" id="left">Left column — 50%</div>
  <div class="col" id="right">Right column — 50%</div>
</div>
<p id="note">Remove the padding and both columns fit. Add it back and the right column breaks.</p>
```

```css
#container { display: flex; flex-wrap: wrap; background: #0f172a; font-family: system-ui; }
.col       { width: 50%; padding: 20px; background: #1e293b; color: #e2e8f0; border: 2px solid #334155; }
#note      { color: #94a3b8; font-size: 13px; font-family: system-ui; }
```

With `box-sizing: content-box` (the default): each column is `50% + 40px + 4px` wide. Together they overflow the container. The right column wraps. This is why CSS layouts were notoriously fragile before `border-box`.

**CS lens:** `border-box` changes the semantics of `width` from "content area size" to "total element size including padding and border." This is the model most developers intuitively expect.

## border-box — width means total width

Now add `box-sizing: border-box` to `.col` and both columns fit perfectly regardless of padding.

```html
<div id="container">
  <div class="col" id="left">Left column — 50% including padding</div>
  <div class="col" id="right">Right column — 50% including padding</div>
</div>
```

```css
#container { display: flex; background: #0f172a; font-family: system-ui; }
.col {
  box-sizing: border-box;
  width: 50%;
  padding: 20px;
  border: 2px solid #334155;
  background: #1e293b;
  color: #e2e8f0;
}
```

You say `50%`, the element is exactly `50%`. Padding and border are subtracted from the content area — they do not add to the outside.

## The universal reset

Every modern project starts with this. Try removing `box-sizing: border-box` from the rule below and see the layout shift.

```html
<nav id="nav">Navigation</nav>
<main id="main">
  <section id="sidebar">Sidebar</section>
  <section id="content">Main content area</section>
</main>
```

```css
*, *::before, *::after { box-sizing: border-box; }

#nav     { padding: 16px; background: #0f172a; color: #e2e8f0; font-family: system-ui; }
#main    { display: flex; }
#sidebar { width: 200px; padding: 16px; background: #1e293b; color: #94a3b8; font-family: system-ui; font-size: 13px; }
#content { width: calc(100% - 200px); padding: 16px; background: #0f172a; color: #e2e8f0; font-family: system-ui; }
```

**SE lens:** The CSS spec defaulted to `content-box` for historical reasons. `border-box` is so universally preferred that the CSS working group has discussed making it the default. Until then, the `*` reset is line one of every serious stylesheet.

**Common mistakes:**
- Applying `border-box` to one element and expecting inheritance everywhere — `box-sizing` does not inherit. The `*, *::before, *::after` reset covers all elements.
- Thinking `margin` is included in `border-box` — margin is always outside the box regardless of `box-sizing`.
- Using `border-box` and being surprised when `min-width` / `max-width` also apply to the border-box size — they do.

**Debug tip:** In DevTools Computed tab, with `border-box`, the content size will be smaller than your declared `width` (padding and border are subtracted). With `content-box`, content size equals declared `width`. Use this to diagnose which mode an element is in.

**Next:** Margin — the space outside the border — and the surprising behaviour of margin collapsing.

## Challenge: border-box

Apply `box-sizing: border-box` to `#box` so its total rendered width stays at `300px` despite padding and border.

1. Set `box-sizing` to `border-box`
2. Set `width` to `300px`
3. Set `padding` to `30px`
4. Set `border` to `5px solid rgb(16, 185, 129)`

```html
<div id="box">Fixed Width</div>
```

```challenge
#box {
  /* Make total width 300px including padding and border */
}
```

```test
var box = document.querySelector('#box')
var s = getComputedStyle(box)
assert s.boxSizing === 'border-box'
assert s.width === '300px'
assert s.paddingTop === '30px'
assert s.borderTopWidth === '5px'
```
