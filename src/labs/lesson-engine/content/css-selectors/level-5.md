---
series: css-selectors
level: 5
title: ":has() — The Parent Selector"
lang: css
---

# :has() — The Parent Selector

For 25 years, CSS had no way to select a parent element based on its children. `:has()` finally solves this — it is one of the most powerful selectors in modern CSS.

## Basic :has() — select by what you contain

A `.card` that contains an `<img>` gets styled differently from one without. Remove the `<img>` from the first card and watch it switch styles.

```html
<div class="card" id="with-img">
  <img src="https://picsum.photos/300/120" style="display:block;width:100%;" alt="">
  <div class="card-body">Card with image — gets blue border</div>
</div>
<div class="card" id="no-img">
  <div class="card-body">Card without image — gets dark background</div>
</div>
```

```css
body { background: #0f172a; font-family: system-ui; padding: 16px; display: flex; gap: 12px; }
.card { border-radius: 8px; overflow: hidden; width: 220px; border: 2px solid #334155; }
.card-body { padding: 12px; color: #e2e8f0; font-size: 14px; }
.card:has(img) { border-color: #3b82f6; }
.card:not(:has(img)) { background: #1e293b; }
```

**CS lens:** Before `:has()`, you had to traverse to a child and then style the parent — which CSS could not do. JavaScript's `closest()` / `parentElement` can walk up the DOM; CSS couldn't until `:has()`.

## :has() for interactive state

When the checkbox inside a label is checked, the whole label changes colour. This pattern was previously JavaScript-only. Click the checkboxes to see it work.

```html
<ul style="list-style:none;padding:0;">
  <li><label class="task"><input type="checkbox"> Buy groceries</label></li>
  <li><label class="task"><input type="checkbox" checked> Write tests</label></li>
  <li><label class="task"><input type="checkbox"> Deploy release</label></li>
</ul>
```

```css
body { background: #0f172a; font-family: system-ui; padding: 16px; }
.task { display: flex; align-items: center; gap: 10px; padding: 12px 16px; border-radius: 6px; cursor: pointer; color: #e2e8f0; margin-bottom: 4px; background: #1e293b; transition: all 0.15s; }
.task:has(input:checked) { background: #052e16; color: #10b981; text-decoration: line-through; opacity: 0.8; }
input[type="checkbox"] { accent-color: #10b981; width: 16px; height: 16px; }
```

## :has() for form validation feedback

Disable the submit button while any required field is invalid. Try typing a valid email and watch the button enable.

```html
<form id="frm">
  <input type="email" placeholder="your@email.com" required id="email-field">
  <input type="text" placeholder="Username" required id="user-field" minlength="3">
  <button type="submit" id="submit-btn">Submit</button>
</form>
```

```css
body { background: #0f172a; font-family: system-ui; padding: 16px; }
input { display: block; width: 100%; margin: 8px 0; padding: 10px 12px; border-radius: 6px; border: 1px solid #334155; background: #1e293b; color: #e2e8f0; box-sizing: border-box; }
button { display: block; width: 100%; padding: 10px; border-radius: 6px; border: none; background: #3b82f6; color: white; font-weight: 600; cursor: pointer; margin-top: 8px; }
form:has(input:invalid) button[type="submit"] { opacity: 0.4; pointer-events: none; background: #334155; }
```

## :has() with sibling combinators

`:has()` can look sideways at siblings too. An `<h2>` that is followed by a `<p>` (not another heading) gets tighter margin-bottom.

```html
<article>
  <h2>Section with paragraph after</h2>
  <p>The heading above gets less margin because :has(+ p) detected this paragraph.</p>
  <h2>Section with heading after</h2>
  <h3>Sub-heading — h2:has(+ p) does NOT match here</h3>
  <p>Content below.</p>
</article>
```

```css
body { background: #0f172a; font-family: system-ui; padding: 16px; }
article { background: #1e293b; padding: 16px; border-radius: 8px; color: #e2e8f0; }
h2 { margin: 16px 0 12px; color: #e2e8f0; }
h3 { margin: 12px 0 8px; color: #94a3b8; }
p  { color: #64748b; margin: 0 0 8px; }
h2:has(+ p) { margin-bottom: 4px; color: #3b82f6; }
```

**SE lens:** `:has()` shifts a large class of JS-powered DOM interactions into pure CSS. Instead of adding `.has-error` to a form wrapper via JavaScript, write `form:has(input:invalid)` and CSS does the work.

**Common mistakes:**
- `:has()` has no support in Firefox before 121 (Dec 2023). Check `@supports selector(:has(*))` for older environments.
- `:has()` cannot be nested — `:has(:has(...))` is not valid.
- Performance: `*:has(img)` makes the browser check every element. Keep the left side specific: `.card:has(img)`.

**Debug tip:** Test in DevTools Console: `document.querySelectorAll('.card:has(img)')` shows exactly which cards have images. If zero results return, check that the image is a *descendant* of `.card`, not a sibling.

**Next:** Pseudo-elements — `::before`, `::after`, `::placeholder` — virtual content the browser renders without any HTML.

## Challenge: parent selection

1. Set `border-color` of `.card:has(img)` to `rgb(59, 130, 246)`
2. Set `border-style` to `solid` and `border-width` to `2px` on `.card:has(img)`
3. Set `background-color` of `.card:not(:has(img))` to `rgb(30, 41, 59)`
4. Set `opacity` of the submit button inside `form:has(input:invalid)` to `0.4`
5. Set `pointer-events` of that button to `none`

```html
<div class="card" id="with-img">
  <img src="" alt="photo">
  <p>Card with image</p>
</div>
<div class="card" id="no-img">
  <p>Card without image</p>
</div>
<form id="frm">
  <input type="email" value="not-an-email" required>
  <button type="submit" id="sub">Submit</button>
</form>
```

```challenge
/* Use :has() */

```

```test
var withImg = document.querySelector('#with-img')
var noImg = document.querySelector('#no-img')
var sub = document.querySelector('#sub')
var sW = getComputedStyle(withImg)
var sSub = getComputedStyle(sub)
assert sW.borderTopColor === 'rgb(59, 130, 246)'
assert sW.borderTopWidth === '2px'
assert sW.borderTopStyle === 'solid'
assert getComputedStyle(noImg).backgroundColor === 'rgb(30, 41, 59)'
assert sSub.opacity === '0.4'
assert sSub.pointerEvents === 'none'
```
