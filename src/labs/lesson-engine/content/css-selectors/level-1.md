---
series: css-selectors
level: 1
title: Attribute Selectors
lang: css
---

# Attribute Selectors

Element types and class names cover most cases, but sometimes you need to select by an element's attribute — its `href`, `type`, `data-*`, `disabled` state, or any other HTML attribute. Attribute selectors let you do this without adding extra classes to your markup.

## The Presence Selector [attr]

Square brackets target elements that have an attribute, regardless of its value.

```css
a[href] {
  color: #3b82f6;
  text-decoration: underline;
}

input[disabled] {
  opacity: 0.4;
  cursor: not-allowed;
}
```

```text
a[href]       — any <a> that has an href attribute
input[disabled] — any <input> with a disabled attribute present
```

This is more precise than `a {}` — it only styles links that actually go somewhere.

## Exact Value [attr="value"]

```css
input[type="text"] { border: 1px solid #64748b; }
input[type="submit"] { background: #3b82f6; color: white; }
a[target="_blank"]::after { content: " ↗"; }
```

```text
Targets elements where the attribute value exactly matches the string.
```

**CS lens:** This is equality matching — the equivalent of `if element.getAttribute('type') === 'text'`.

## Pattern Matching

CSS attribute selectors include three substring matchers:

```css
/* Starts with */
a[href^="https"] { color: #10b981; }

/* Ends with */
a[href$=".pdf"] { padding-right: 20px; }

/* Contains anywhere */
a[href*="github"] { font-weight: bold; }
```

```text
^=   starts with the value
$=   ends with the value
*=   contains the value anywhere
```

These map to the same logic as `startsWith()`, `endsWith()`, and `includes()` in JavaScript.

## Data Attributes

HTML allows `data-*` attributes for storing custom data. Attribute selectors target them directly.

```css
[data-status="active"]  { background: #10b981; color: white; }
[data-status="pending"] { background: #f59e0b; color: white; }
[data-status="error"]   { background: #ef4444; color: white; }
```

```text
<div data-status="active">Running</div>   → green background
<div data-status="pending">Queued</div>   → yellow background
<div data-status="error">Failed</div>     → red background
```

**SE lens:** Using `data-*` + attribute selectors decouples state from styling class names. JavaScript updates `el.dataset.status = 'error'`; CSS applies the visual. No JS class toggling needed.

**Common mistakes:**
- `[type=text]` vs `[type="text"]` — both are valid; quotes are optional for simple values but required if the value contains spaces or special characters. Always quote for consistency.
- `a[href]` matches any `<a>` with *any* href value, including `href=""` (empty string) and `href="#"`. If you want only non-empty, real links, use `a[href]:not([href=""])`.
- `[href*="github"]` is case-sensitive by default. Add `i` for case-insensitive: `[href*="github" i]`.

**Debug tip:** In DevTools Styles panel, hover over a rule — the matched selector highlights in blue. For attribute selectors that aren't firing, inspect the element's attributes in the Elements panel: the attribute name or value may differ from what you expect (e.g., `data-Status` vs `data-status`).

**Next:** Structural pseudo-classes — selecting by position in the document tree (first child, nth child, last child) without adding position classes to the HTML.

## Challenge: attributes

The HTML below has inputs with different types, links with different href patterns, and status badges with `data-status`. Style them using attribute selectors only.

1. Set `opacity` of any `input[disabled]` to `0.4`
2. Set `color` of links starting with `https` to `rgb(16, 185, 129)` (green)
3. Set `background-color` of `[data-status="error"]` to `rgb(239, 68, 68)` (red)
4. Set `background-color` of `[data-status="ok"]` to `rgb(16, 185, 129)` (green)

```html
<input id="txt" type="text" value="Editable">
<input id="off" type="text" value="Disabled" disabled>
<a id="secure" href="https://example.com">Secure link</a>
<a id="plain" href="http://example.com">Plain link</a>
<div id="err" data-status="error">Error</div>
<div id="ok" data-status="ok">OK</div>
```

```challenge
/* Style by attribute — no class or ID selectors */

```

```test
var off = document.querySelector('#off')
var secure = document.querySelector('#secure')
var plain = document.querySelector('#plain')
var err = document.querySelector('#err')
var ok = document.querySelector('#ok')
var sOff = getComputedStyle(off)
var sSecure = getComputedStyle(secure)
var sPlain = getComputedStyle(plain)
var sErr = getComputedStyle(err)
var sOk = getComputedStyle(ok)
assert sOff.opacity === '0.4'
assert sSecure.color === 'rgb(16, 185, 129)'
assert sErr.backgroundColor === 'rgb(239, 68, 68)'
assert sOk.backgroundColor === 'rgb(16, 185, 129)'
```
