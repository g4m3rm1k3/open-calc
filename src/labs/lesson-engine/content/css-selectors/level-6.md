---
series: css-selectors
level: 6
title: Pseudo-elements
lang: css
---

# Pseudo-elements

Pseudo-elements let you style **parts** of an element or **insert content** that does not exist in the HTML. They use double-colon syntax (`::`) to distinguish them from pseudo-classes (`:`).

## ::before and ::after

`::before` and `::after` insert a generated content box before or after an element's content. They require a `content` property.

```css
.badge::before {
  content: "★ ";
  color: #f59e0b;
}

.external-link::after {
  content: " ↗";
  font-size: 0.75em;
  opacity: 0.7;
}
```

```text
::before — inserts at the START of the element's content
::after  — inserts at the END of the element's content
```

They are inline by default but can take any `display` value. With `display: block` or `position: absolute`, they become layout elements.

**CS lens:** `::before` and `::after` create **virtual DOM nodes** in the browser's rendering tree that don't exist in the HTML source. They have no impact on accessibility — screen readers typically ignore generated content — so never put meaningful text in them.

## Decorative Patterns

Generated content enables purely decorative effects without extra HTML:

```css
/* Quote marks around a blockquote */
blockquote::before { content: "\201C"; font-size: 4rem; color: #334155; }
blockquote::after  { content: "\201D"; font-size: 4rem; color: #334155; }

/* Horizontal rule with a centred label */
.section-divider::before,
.section-divider::after {
  content: "";
  display: inline-block;
  width: 40%;
  height: 1px;
  background: #334155;
  vertical-align: middle;
}
```

## ::first-line and ::first-letter

```css
p::first-line   { font-weight: 600; color: #f1f5f9; }
p::first-letter { font-size: 3rem; float: left; line-height: 1; margin-right: 6px; }
```

```text
::first-line   — the first rendered line of a block element (changes with viewport)
::first-letter — the very first character (enables drop-cap typography)
```

## ::placeholder and ::selection

```css
input::placeholder {
  color: #475569;
  font-style: italic;
}

::selection {
  background: #3b82f6;
  color: white;
}
```

```text
::placeholder — the placeholder text inside an empty input
::selection   — text the user has highlighted (click-drag)
```

**SE lens:** Pseudo-elements are a browser performance feature: generated content is managed by the rendering engine with no real DOM nodes, no layout recalculation on insertion, and no JavaScript cost.

**Common mistakes:**
- Forgetting `content: ""` on `::before` or `::after` — without a `content` property (even an empty string), the pseudo-element does not render at all.
- Using single colons (`:before`, `:after`) — these are legacy CSS2 syntax and still work, but double colons (`::before`, `::after`) are the standard since CSS3. Use `::` to distinguish pseudo-elements from pseudo-classes.
- Putting meaningful text in `::before`/`::after` content — screen readers may or may not read generated content; behavior is inconsistent across assistive technology. Use generated content only for decoration.

**Debug tip:** In DevTools Elements panel, expand any element with `::before` or `::after` — the pseudo-element appears as a child node. You can select it and inspect its computed styles in the Computed tab, including the `content` value.

**Next:** Cascade layers — `@layer` — named, explicitly ordered buckets for CSS rules that end specificity battles permanently.

## Challenge: pseudo-elements

Style the HTML below using `::before` or `::after`.

1. Set `color` of the `.badge` element itself to `rgb(251, 191, 36)` (yellow)
2. Set `font-weight` of `.badge` to `700`
3. Use `::before` on `.badge` to insert content — any non-empty string (`"★ "`, `"● "`, etc.)
4. Set `color` of `input::placeholder` text to `rgb(71, 85, 105)` (slate-600)
5. Set `font-style` of `input::placeholder` to `italic`

```html
<span class="badge" id="badge">Pro</span>
<input id="inp" type="text" placeholder="Search...">
```

```challenge
/* Use pseudo-elements */

```

```test
var badge = document.querySelector('#badge')
var inp = document.querySelector('#inp')
var sBadge = getComputedStyle(badge)
var sBefore = getComputedStyle(badge, '::before')
var sPlaceholder = getComputedStyle(inp, '::placeholder')
assert sBadge.color === 'rgb(251, 191, 36)'
assert sBadge.fontWeight === '700'
assert sBefore.content !== 'none' && sBefore.content !== ''
assert sPlaceholder.color === 'rgb(71, 85, 105)'
assert sPlaceholder.fontStyle === 'italic'
```
