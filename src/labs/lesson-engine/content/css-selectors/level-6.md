---
series: css-selectors
level: 6
title: Pseudo-elements
lang: css
---

# Pseudo-elements

Pseudo-elements let you style **parts** of an element or **insert content** that does not exist in the HTML. They use double-colon syntax (`::`) to distinguish them from pseudo-classes (`:`).

## ::before and ::after — generated content

`::before` inserts content before an element's content, `::after` inserts it after. They require a `content` property. Edit the `content` value or change the colour to see the insertion.

```html
<ul id="features">
  <li>Unlimited projects</li>
  <li>Priority support</li>
  <li>Custom domain</li>
  <li>API access</li>
</ul>
```

```css
body { background: #0f172a; font-family: system-ui; padding: 16px; }
#features { list-style: none; padding: 0; }
#features li { padding: 10px 0; color: #e2e8f0; border-bottom: 1px solid #1e293b; }
#features li::before { content: "✓ "; color: #10b981; font-weight: 700; }
```

**CS lens:** `::before` and `::after` create virtual DOM nodes in the browser's rendering tree that don't exist in the HTML source. They have no impact on accessibility — screen readers typically ignore generated content — so never put meaningful text in them.

## Decorative patterns with ::before / ::after

Section dividers, quote marks, and badge decorations — all with no extra HTML. Edit the `content` property to change what is inserted.

```html
<blockquote id="quote">
  The best way to predict the future is to invent it.
  <cite>— Alan Kay</cite>
</blockquote>
<div class="section-divider">OR</div>
<span class="badge">Pro</span>
```

```css
body { background: #0f172a; font-family: system-ui; padding: 16px; color: #e2e8f0; }
#quote { background: #1e293b; padding: 20px 20px 20px 32px; border-radius: 8px; color: #e2e8f0; font-style: italic; margin: 0 0 16px; position: relative; }
#quote::before { content: "\201C"; position: absolute; left: 8px; top: 8px; font-size: 3rem; color: #334155; line-height: 1; font-style: normal; }
cite { display: block; font-size: 12px; color: #64748b; margin-top: 8px; font-style: normal; }
.section-divider { display: flex; align-items: center; gap: 12px; color: #475569; font-size: 13px; margin: 16px 0; }
.section-divider::before, .section-divider::after { content: ""; flex: 1; height: 1px; background: #334155; }
.badge { display: inline-block; padding: 2px 10px; border-radius: 9999px; background: #3b82f6; color: white; font-size: 12px; font-weight: 600; }
.badge::before { content: "★ "; color: #fbbf24; }
```

## ::first-line and ::first-letter

Style just the first rendered line or the very first character — without wrapping them in spans.

```html
<article>
  <p id="article-text">The history of computing begins with mechanical calculation devices. Modern computers process billions of operations per second, enabling everything from smartphones to spacecraft. This paragraph demonstrates ::first-line and ::first-letter styling without any extra HTML markup.</p>
</article>
```

```css
body { background: #0f172a; font-family: Georgia, serif; padding: 24px; }
article { background: #1e293b; padding: 24px; border-radius: 8px; max-width: 500px; }
#article-text { color: #94a3b8; line-height: 1.7; margin: 0; }
#article-text::first-letter { font-size: 3.5rem; float: left; line-height: 1; margin: 0 8px -4px 0; color: #3b82f6; font-weight: 700; }
#article-text::first-line { color: #e2e8f0; font-weight: 500; }
```

## ::placeholder and ::selection

Customise placeholder text and the colour users see when they highlight text.

```html
<input type="text" placeholder="Search anything...">
<input type="email" placeholder="your@email.com">
<p id="selectable">Try selecting this text — it will highlight with a custom colour instead of the default blue.</p>
```

```css
body { background: #0f172a; font-family: system-ui; padding: 16px; }
input { display: block; width: 100%; margin: 8px 0; padding: 10px 12px; border-radius: 6px; border: 1px solid #334155; background: #1e293b; color: #e2e8f0; box-sizing: border-box; }
input::placeholder { color: #475569; font-style: italic; }
#selectable { color: #e2e8f0; background: #1e293b; padding: 12px; border-radius: 6px; margin-top: 12px; }
::selection { background: #6366f1; color: white; }
```

**SE lens:** Pseudo-elements are a browser performance feature: generated content is managed by the rendering engine with no real DOM nodes, no layout recalculation on insertion, and no JavaScript cost.

**Common mistakes:**
- Forgetting `content: ""` on `::before` or `::after` — without it (even an empty string), the pseudo-element does not render at all.
- Using single colons (`:before`, `:after`) — legacy CSS2 syntax; use `::` to distinguish pseudo-elements from pseudo-classes.
- Putting meaningful text in `::before`/`::after` — screen readers may not read generated content. Use it only for decoration.

**Debug tip:** In DevTools Elements panel, expand any element with `::before` or `::after` — the pseudo-element appears as a child node you can select and inspect.

**Next:** Cascade layers — `@layer` — named, explicitly ordered buckets for CSS rules that end specificity battles permanently.

## Challenge: pseudo-elements

Style the HTML below using `::before` and `::placeholder`.

1. Set `color` of `.badge` to `rgb(251, 191, 36)`
2. Set `font-weight` of `.badge` to `700`
3. Use `::before` on `.badge` to insert any non-empty string (`"★ "`, `"● "`, etc.)
4. Set `color` of `input::placeholder` to `rgb(71, 85, 105)`
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
