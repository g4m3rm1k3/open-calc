---
series: css-flexbox
level: 1
title: justify-content
lang: css
---

# justify-content

`justify-content` controls how items are **distributed along the main axis** after all items have their base sizes. If the items don't fill the container, the leftover space is distributed according to this property. It is one of the most-used flex properties.

## The six values — side by side

All six values in one view. The container has the same three items in each row — only `justify-content` changes. Resize the code to widen the container and see the space distribution shift.

```html
<div class="demo" id="jc-start">
  <span class="label">flex-start</span>
  <div class="row"><div class="b">A</div><div class="b">B</div><div class="b">C</div></div>
</div>
<div class="demo" id="jc-end">
  <span class="label">flex-end</span>
  <div class="row end"><div class="b">A</div><div class="b">B</div><div class="b">C</div></div>
</div>
<div class="demo" id="jc-center">
  <span class="label">center</span>
  <div class="row ctr"><div class="b">A</div><div class="b">B</div><div class="b">C</div></div>
</div>
<div class="demo" id="jc-sb">
  <span class="label">space-between</span>
  <div class="row sb"><div class="b">A</div><div class="b">B</div><div class="b">C</div></div>
</div>
<div class="demo" id="jc-sa">
  <span class="label">space-around</span>
  <div class="row sa"><div class="b">A</div><div class="b">B</div><div class="b">C</div></div>
</div>
<div class="demo" id="jc-se">
  <span class="label">space-evenly</span>
  <div class="row se"><div class="b">A</div><div class="b">B</div><div class="b">C</div></div>
</div>
```

```css
body { background: #0f172a; padding: 16px; font-family: system-ui; }
.demo  { background: #1e293b; border-radius: 8px; padding: 12px 16px; margin-bottom: 8px; }
.label { display: block; color: #64748b; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 6px; }
.row   { display: flex; background: #0f172a; border-radius: 6px; padding: 8px; }
.b     { background: #6366f1; color: white; padding: 10px 16px; border-radius: 4px; font-weight: 700; font-size: 13px; }
.end { justify-content: flex-end; }
.ctr { justify-content: center; }
.sb  { justify-content: space-between; }
.sa  { justify-content: space-around; }
.se  { justify-content: space-evenly; }
```

`flex-start` — items at the start of the main axis (default). `flex-end` — items at the end. `center` — items centred. `space-between` — first item at start, last item at end, equal gaps between. `space-around` — equal space on each side of every item (corners get half). `space-evenly` — equal space everywhere including corners.

**CS lens:** `justify-content` only has an effect when there is **free space** on the main axis. If items use `flex: 1` (growing to fill all space), there is no free space left and `justify-content` does nothing.

## space-between — the nav bar pattern

`space-between` is the classic value for navigation bars: logo on the far left, links on the far right, with nothing explicit needed.

```html
<nav>
  <div class="brand">UpskillOS</div>
  <ul class="links">
    <li><a href="#">Courses</a></li>
    <li><a href="#">Labs</a></li>
    <li><a href="#">Community</a></li>
  </ul>
  <button class="cta">Sign Up</button>
</nav>
```

```css
body { background: #0f172a; padding: 24px; font-family: system-ui; margin: 0; }
nav { display: flex; justify-content: space-between; align-items: center; background: #1e293b; padding: 12px 24px; border-radius: 10px; }
.brand { color: #818cf8; font-weight: 800; font-size: 1.1rem; }
.links { display: flex; list-style: none; gap: 20px; margin: 0; padding: 0; }
.links a { color: #94a3b8; text-decoration: none; font-size: 14px; font-weight: 500; }
.cta { background: #6366f1; color: white; border: none; padding: 8px 16px; border-radius: 6px; font-weight: 600; cursor: pointer; font-size: 14px; }
```

## center — the hero pattern

`justify-content: center` combined with `align-items: center` on a flex container is the shortest path to perfect centering — horizontal and vertical simultaneously.

```html
<div class="hero">
  <div class="hero-content">
    <h1>Centred perfectly</h1>
    <p>justify-content: center + align-items: center = two-axis centering in two lines</p>
  </div>
</div>
```

```css
body { background: #0f172a; padding: 24px; font-family: system-ui; margin: 0; }
.hero {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
  background: linear-gradient(135deg, #1e1b4b, #0f172a);
  border-radius: 12px;
}
.hero-content { text-align: center; }
.hero-content h1 { color: #818cf8; margin: 0 0 8px; font-size: 1.5rem; }
.hero-content p  { color: #64748b; margin: 0; font-size: 14px; }
```

**SE lens:** This two-property centering pattern (`justify-content: center; align-items: center`) replaced years of `margin: 0 auto` + `position: absolute; top: 50%; transform: translateY(-50%)` hacks. It works for any content size without knowing dimensions.

**Common mistakes:**
- Confusing `justify-content` (main axis) with `align-items` (cross axis). When `flex-direction: column`, `justify-content` controls vertical distribution.
- Using `space-between` with a single item — there are no gaps between items when there is only one item.
- Forgetting that `space-around` gives half-gaps at the edges, making outer spacing look uneven compared to inner spacing.

**Debug tip:** In Chrome DevTools Flexbox inspector, `justify-content` values are shown as icon buttons. Click them to toggle values live and see the effect immediately.

**Next:** `align-items` and `align-self` — the same concept but for the **cross axis**.

## Challenge: justify_content

Set up the nav container to use `space-between` and the hero to use `center`.

1. `.nav` — `display: flex`, `justify-content: space-between`, `align-items: center`
2. `.hero` — `display: flex`, `justify-content: center`, `align-items: center`

```html
<nav class="nav">
  <div id="logo">Logo</div>
  <button id="btn">Sign Up</button>
</nav>
<div class="hero">
  <p id="hero-text">Centred content</p>
</div>
```

```challenge
.nav {
  background: #1e3a5f;
  padding: 16px;
  border-radius: 8px;
  margin-bottom: 12px;
  height: 60px;
  box-sizing: border-box;
}

.hero {
  background: #1e1b4b;
  height: 120px;
  border-radius: 8px;
}

#logo, #btn, #hero-text { color: white; margin: 0; font-family: system-ui; }
#btn { background: #3b82f6; border: none; padding: 8px 16px; border-radius: 6px; cursor: pointer; }
```

```test
var nav = getComputedStyle(document.querySelector('.nav'))
var hero = getComputedStyle(document.querySelector('.hero'))
assert nav.display === 'flex'
assert nav.justifyContent === 'space-between'
assert nav.alignItems === 'center'
assert hero.display === 'flex'
assert hero.justifyContent === 'center'
assert hero.alignItems === 'center'
```
