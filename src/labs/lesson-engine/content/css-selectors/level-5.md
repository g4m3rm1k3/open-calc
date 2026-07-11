---
series: css-selectors
level: 5
title: ":has() — The Parent Selector"
lang: css
---

# :has() — The Parent Selector

For 25 years, CSS had no way to select a parent element based on its children. `:has()` finally solves this. It is one of the most powerful selectors in modern CSS.

## What :has() Does

`:has(selector)` matches an element **if any of its descendants match the argument**.

```css
/* A <figure> that contains an <img> */
figure:has(img) {
  border: 2px solid #334155;
  border-radius: 8px;
  padding: 16px;
}

/* A <label> that contains a checked input */
label:has(input:checked) {
  background: #10b981;
  color: white;
}

/* A <div> that does NOT have a <p> */
div:not(:has(p)) {
  background: #1e293b;
}
```

```text
figure:has(img)    — select <figure> elements that contain an <img>
label:has(:checked) — select <label> elements that wrap a checked input
```

**CS lens:** Before `:has()`, you had to traverse to a child and then somehow style the parent — which CSS could not do. JavaScript's `querySelector` can walk up the DOM; CSS couldn't until `:has()`.

## Practical Patterns

```css
/* Card with image gets a different background than card without image */
.card:has(img) { padding-top: 0; }
.card:not(:has(img)) { padding-top: 24px; }

/* Navigation that contains a dropdown — expand the nav height */
nav:has(.dropdown:hover) { height: auto; }

/* Table row where any cell has .error */
tr:has(td.error) { background: rgba(239, 68, 68, 0.1); }

/* Form submit button is enabled only when all required fields are valid */
form:has(input:invalid) button[type="submit"] {
  opacity: 0.4;
  pointer-events: none;
}
```

## :has() with Sibling Selectors

`:has()` can look at siblings using the `+` and `~` combinators inside the parentheses.

```css
/* Select an <h2> that is immediately followed by a <p> */
h2:has(+ p) {
  margin-bottom: 4px;
}

/* Select a <section> that has a sibling <aside> somewhere after it */
section:has(~ aside) {
  max-width: 70%;
}
```

**SE lens:** `:has()` shifts a large class of JS-powered DOM interactions into pure CSS. Instead of adding `.has-error` to a form wrapper via JavaScript, you write `form:has(input:invalid)` and CSS does the work itself.

**Common mistakes:**
- Using `:has()` in older browsers — it has no support in Firefox before 121 (Dec 2023) and none in IE/legacy Edge. Always check `@supports selector(:has(*))` if targeting older environments.
- `:has()` cannot be used inside another `:has()` — nested `:has(:has(...))` is not valid.
- Performance: `:has()` can be expensive when used broadly (e.g., `*:has(img)`) because the browser must check every element. Keep the left side specific: `.card:has(img)`, not `*:has(img)`.

**Debug tip:** Test `:has()` in the DevTools Console: `document.querySelectorAll('.card:has(img)')` shows exactly which cards have images. If zero results return, check that the image is a *descendant* of `.card` — not a sibling.

**Next:** Pseudo-elements — `::before`, `::after`, `::placeholder` — virtual content the browser renders without any HTML.

## Challenge: parent selection

The HTML has cards — some contain an `<img>`, some don't. It also has a form with an invalid field.

1. Set `border-color` of `.card:has(img)` to `rgb(59, 130, 246)` (blue)
2. Set `border-style` of `.card:has(img)` to `solid` and `border-width` to `2px`
3. Set `background-color` of `.card:not(:has(img))` to `rgb(30, 41, 59)`
4. Set `opacity` of `button[type="submit"]` inside `form:has(input:invalid)` to `0.4`
5. Set `pointer-events` of that same button to `none`

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
