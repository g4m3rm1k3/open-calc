---
series: css-box-model
level: 5
title: Display — Block, Inline, Inline-Block
lang: css
---

# Display — Block, Inline, Inline-Block

The `display` property controls how an element participates in the document flow. It determines whether the element takes up full width, flows with text, or sits somewhere in between.

## Block Elements

```css
div, p, h1, section { display: block; }
```

```text
Block elements:
• Take up the FULL width of their parent by default
• Start on a NEW LINE (they stack vertically)
• Accept width, height, margin, and padding on ALL sides
```

`div`, `p`, `h1`–`h6`, `ul`, `li`, `header`, `footer`, `section` are block by default.

**CS lens:** A block element generates a **block-level box** in the normal flow. The block formatting context means block boxes stack vertically, each on its own line. Their width defaults to 100% of the containing block.

## Inline Elements

```css
span, a, strong, em { display: inline; }
```

```text
Inline elements:
• Flow WITH text — they do not break to a new line
• Width and height have NO EFFECT
• Top/bottom margin and padding are applied but do not push adjacent lines apart
• Left/right margin and padding work normally
```

`span`, `a`, `strong`, `em`, `img`, `button` are inline by default (with some caveats for `img` and `button`).

```css
/* This does nothing for inline elements */
span {
  width: 200px;  /* ignored */
  height: 50px;  /* ignored */
}
```

## Inline-Block

`display: inline-block` combines the best of both:

```css
.tag {
  display: inline-block;
  padding: 4px 12px;
  background: #334155;
  border-radius: 4px;
}
```

```text
Inline-block elements:
• Flow with text (like inline)
• Accept width, height, and ALL margin/padding (like block)
```

This is how you make little badges, tags, and pill buttons that sit in a line but have height and padding.

## none vs hidden

```css
.hidden-element   { display: none; }    /* removed from layout entirely */
.invisible-element { visibility: hidden; } /* invisible but KEEPS its space */
```

```text
display: none         → element takes up NO space, other elements fill the gap
visibility: hidden    → element is invisible but its box STILL OCCUPIES SPACE
opacity: 0            → element is invisible but STILL INTERACTABLE (pointer events, focus)
```

**SE lens:** `display: none` is the standard toggle for showing/hiding UI. Frameworks like React use it under the hood (or unmount the node entirely). `visibility: hidden` is useful when you want to hide content without causing layout shifts — e.g., hiding a loading skeleton that is replaced by real content at the same size.

**Common mistakes:**
- Setting `width` and `height` on an `inline` element and expecting them to apply — they are ignored. Switch to `display: inline-block` or `block`.
- Using `display: inline-block` for navigation items and getting unexpected gaps between them — whitespace in the HTML source (newlines, spaces) creates a small gap between inline-block elements. Fix with `font-size: 0` on the parent, flexbox, or by removing the HTML whitespace.
- Thinking `display: none` is for accessibility hiding — screen readers also ignore `display: none`. Use `visually-hidden` utility classes (position absolute, 1px clip) to hide content visually while keeping it accessible to screen readers.

**Debug tip:** In DevTools, elements with `display: none` appear dimmed in the Elements panel. The Computed tab shows `display: none` for the element. To temporarily reveal a hidden element, select it and uncheck the `display` property in the Styles panel.

**Next:** Sizing constraints — `min-width`, `max-width`, `clamp()`, and `aspect-ratio` — making elements responsive without media queries.

## Challenge: display

Apply display values to make the layout correct.

1. Set `display` of `#block-el` to `block` and `width` to `100%`
2. Set `display` of `#inline-el` to `inline`
3. Set `display` of `#ib` to `inline-block`, `padding` to `8px 16px`
4. Set `display` of `#gone` to `none`

```html
<div id="block-el">Block</div>
<span id="inline-el">Inline</span>
<span id="ib">Inline-Block</span>
<div id="gone">Hidden</div>
```

```challenge
/* Set display values */

```

```test
var block = document.querySelector('#block-el')
var inline = document.querySelector('#inline-el')
var ib = document.querySelector('#ib')
var gone = document.querySelector('#gone')
assert getComputedStyle(block).display === 'block'
assert getComputedStyle(block).width !== '0px'
assert getComputedStyle(inline).display === 'inline'
assert getComputedStyle(ib).display === 'inline-block'
assert getComputedStyle(ib).paddingTop === '8px'
assert getComputedStyle(gone).display === 'none'
```
