---
series: css-selectors
level: 1
title: Attribute Selectors
lang: css
---

# Attribute Selectors

Sometimes you need to select by an element's attribute — its `href`, `type`, `data-*`, `disabled` state — without adding extra classes to your markup.

## Presence selector `[attr]` — has the attribute

Square brackets target elements that have an attribute, regardless of its value. `a[href]` styles only links that go somewhere. `input[disabled]` styles only disabled inputs.

```html
<a href="https://example.com">Real link — has href, styled</a>
<a>Anchor with no href — not styled</a>
<br><br>
<input type="text" value="Enabled input">
<input type="text" value="Disabled" disabled>
```

```css
body { background: #0f172a; font-family: system-ui; padding: 16px; color: #e2e8f0; }
a[href]       { color: #3b82f6; font-weight: 600; }
a             { color: #64748b; }
input         { display: block; margin: 8px 0; padding: 8px; background: #1e293b; border: 1px solid #334155; color: #e2e8f0; border-radius: 4px; }
input[disabled] { opacity: 0.4; cursor: not-allowed; }
```

**CS lens:** This is equality matching — the equivalent of `if (element.hasAttribute('href'))`.

## Exact value `[attr="value"]` — precise match

Matches elements where the attribute equals exactly the string. Style different input types differently with no extra classes.

```html
<input type="text" placeholder="Text input">
<input type="email" placeholder="Email input">
<input type="submit" value="Submit button">
<br>
<a href="https://example.com" target="_blank">Opens in new tab ↗</a>
<a href="/about">Internal link</a>
```

```css
body { background: #0f172a; font-family: system-ui; padding: 16px; }
input { display: block; margin: 8px 0; padding: 8px 12px; border-radius: 4px; border: 1px solid #334155; background: #1e293b; color: #e2e8f0; }
input[type="email"]  { border-color: #3b82f6; }
input[type="submit"] { background: #3b82f6; color: white; cursor: pointer; border: none; font-weight: 600; }
a[target="_blank"]::after { content: " ↗"; font-size: 0.8em; opacity: 0.6; }
a { display: block; margin: 8px 0; color: #94a3b8; }
```

## Pattern matching — starts, ends, contains

Three substring matchers. Edit the href values in the HTML to see which selector picks them up.

```html
<ul>
  <li><a href="https://example.com">https link — green (starts with https)</a></li>
  <li><a href="http://legacy.com">http link — not green</a></li>
  <li><a href="/report.pdf">PDF download (ends with .pdf)</a></li>
  <li><a href="https://github.com/user/repo">GitHub link (contains github)</a></li>
</ul>
```

```css
body { background: #0f172a; font-family: system-ui; padding: 16px; }
ul   { list-style: none; padding: 0; }
li   { margin: 8px 0; }
a    { color: #94a3b8; text-decoration: none; }
a[href^="https"] { color: #10b981; }
a[href$=".pdf"]::after  { content: " [PDF]"; font-size: 0.75em; background: #ef4444; color: white; padding: 1px 5px; border-radius: 3px; margin-left: 4px; }
a[href*="github"] { font-weight: 700; }
```

## Data attributes — state without JS class toggling

`data-*` attributes carry custom state. CSS reads them directly — no JavaScript class toggling needed to reflect state visually.

```html
<div class="job" data-status="running">▶ Build running</div>
<div class="job" data-status="passed">✓ Tests passed</div>
<div class="job" data-status="failed">✗ Deploy failed</div>
<div class="job" data-status="queued">⋯ Job queued</div>
```

```css
body { background: #0f172a; font-family: system-ui; padding: 16px; }
.job { padding: 10px 16px; margin: 6px 0; border-radius: 6px; font-weight: 500; background: #1e293b; color: #e2e8f0; }
[data-status="running"] { border-left: 4px solid #3b82f6; }
[data-status="passed"]  { border-left: 4px solid #10b981; color: #10b981; }
[data-status="failed"]  { border-left: 4px solid #ef4444; color: #ef4444; }
[data-status="queued"]  { border-left: 4px solid #475569; opacity: 0.6; }
```

**SE lens:** Using `data-*` + attribute selectors decouples state from styling class names. JavaScript updates `el.dataset.status = 'failed'`; CSS applies the visual. No JS class toggling needed.

**Common mistakes:**
- `[type=text]` vs `[type="text"]` — both work; quotes are optional for simple values but required if the value contains spaces or special characters.
- `a[href]` also matches `href=""` and `href="#"`. Use `a[href]:not([href=""])` for only real links.
- `[href*="github"]` is case-sensitive by default. Add `i` for case-insensitive: `[href*="github" i]`.

**Debug tip:** In DevTools Elements panel, inspect the element's attributes — the attribute name or value may differ from what you expect (e.g., `data-Status` vs `data-status`).

**Next:** Structural pseudo-classes — selecting by position in the document tree (first child, nth child) without adding position classes to the HTML.

## Challenge: attributes

Style the elements using attribute selectors only.

1. Set `opacity` of any `input[disabled]` to `0.4`
2. Set `color` of links starting with `https` to `rgb(16, 185, 129)`
3. Set `background-color` of `[data-status="error"]` to `rgb(239, 68, 68)`
4. Set `background-color` of `[data-status="ok"]` to `rgb(16, 185, 129)`

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
var sErr = getComputedStyle(err)
var sOk = getComputedStyle(ok)
assert sOff.opacity === '0.4'
assert sSecure.color === 'rgb(16, 185, 129)'
assert sErr.backgroundColor === 'rgb(239, 68, 68)'
assert sOk.backgroundColor === 'rgb(16, 185, 129)'
```
