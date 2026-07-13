---
series: css-fundamentals
level: 4
title: Text & Fonts
lang: css
---

# Text & Fonts

Typography is the single most impactful category of CSS. Most of what users read on a web page is text, and the properties that control text — family, size, weight, line height, spacing — determine whether a page feels professional or amateurish, readable or dense.

## font-family

`font-family` specifies which typeface to use, with fallbacks. The browser tries each font in order, using the first one available. Edit the font stack to see how the fallback chain works.

```html
<p id="body-text">Body text uses the system font stack — fast, no download, native look on every OS.</p>
<code id="code-text">code { font-family: monospace } makes this render in a monospaced font.</code>
<p id="serif-text">Georgia is a classic serif — great for reading-heavy content like articles.</p>
```

```css
body { background: #0f172a; padding: 24px; }
#body-text {
  font-family: 'Inter', 'Segoe UI', 'Helvetica Neue', Arial, sans-serif;
  color: #e2e8f0;
  font-size: 16px;
  line-height: 1.6;
}
#code-text {
  display: block;
  font-family: 'Fira Code', 'Cascadia Code', 'Courier New', monospace;
  color: #6ee7b7;
  font-size: 14px;
  background: #1e293b;
  padding: 12px;
  border-radius: 6px;
  margin: 12px 0;
}
#serif-text {
  font-family: Georgia, 'Times New Roman', serif;
  color: #cbd5e1;
  font-size: 16px;
  line-height: 1.7;
}
```

**SE lens:** The system font stack (`'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif`) gives you a native-looking font on every OS without loading any file — fast and no FOUT (flash of unstyled text). This is what GitHub, Notion, and many modern apps use.

## font-size, font-weight, font-style

These three properties control the scale, thickness, and slant of text. See how `font-weight` values from 300 to 900 look different when the font supports them — and how `italic` is a distinct slanted variant.

```html
<div id="size-demo">
  <h1>2.25rem heading (36px)</h1>
  <p>1rem body text (16px) — the standard reading size</p>
  <small>0.75rem label (12px)</small>
</div>
<div id="weight-demo">
  <p class="w300">font-weight: 300 — Light</p>
  <p class="w400">font-weight: 400 — Regular</p>
  <p class="w600">font-weight: 600 — Semi Bold</p>
  <p class="w800">font-weight: 800 — Extra Bold</p>
  <p class="italic">font-style: italic — slanted variant</p>
</div>
```

```css
body { background: #0f172a; padding: 24px; font-family: system-ui; display: flex; gap: 24px; }
#size-demo, #weight-demo { flex: 1; background: #1e293b; padding: 16px; border-radius: 8px; }
h1 { font-size: 2.25rem; font-weight: 800; color: #818cf8; margin: 0 0 8px; }
p, small { display: block; color: #e2e8f0; margin: 4px 0; }
small { font-size: 0.75rem; color: #64748b; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; }
.w300 { font-weight: 300; color: #94a3b8; }
.w400 { font-weight: 400; color: #e2e8f0; }
.w600 { font-weight: 600; color: #e2e8f0; }
.w800 { font-weight: 800; color: #e2e8f0; }
.italic { font-style: italic; color: #c7d2fe; }
```

`font-size` — always use `rem` so it scales with user preferences. `font-weight` accepts `100`–`900`. Not all weights are available for every font — unavailable weights fall back to the nearest.

## line-height

`line-height` controls the vertical space between lines of text — the single most impactful property for readability. Compare tight vs loose line-height on the same paragraph of text.

```html
<div id="tight">
  <p class="label-tag">line-height: 1.2 — cramped, hard to read</p>
  <p>The quick brown fox jumps over the lazy dog. Legibility suffers when lines are packed too close together and the eye struggles to track from the end of one line back to the start of the next.</p>
</div>
<div id="loose">
  <p class="label-tag">line-height: 1.7 — comfortable, readable</p>
  <p>The quick brown fox jumps over the lazy dog. Generous line spacing gives the eye clear lanes to follow, making longer passages feel effortless to read. This is the professional default for body copy.</p>
</div>
```

```css
body { background: #0f172a; padding: 24px; font-family: system-ui; display: flex; gap: 16px; }
#tight, #loose { flex: 1; background: #1e293b; padding: 16px; border-radius: 8px; }
.label-tag { font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; color: #64748b; margin: 0 0 8px; }
#tight p:not(.label-tag) { line-height: 1.2; color: #94a3b8; font-size: 15px; margin: 0; }
#loose p:not(.label-tag) { line-height: 1.7; color: #e2e8f0; font-size: 15px; margin: 0; }
```

Use a **unitless** value (like `1.6`) — it scales proportionally with font-size. Professional defaults: body text 1.5–1.7, headings 1.1–1.3.

## letter-spacing and word-spacing

`letter-spacing` adjusts the space between characters. Tight tracking on large headings and wide tracking on small all-caps labels — two classic typographic techniques.

```html
<h1 id="tight-head">TIGHT TRACKING</h1>
<p class="body-text">Normal body text — default letter-spacing is best for reading paragraphs</p>
<span class="label-caps">category label · wide tracking</span>
<h2 id="wide-display">Wide Display Heading</h2>
```

```css
body { background: #0f172a; padding: 24px; font-family: system-ui; }
#tight-head {
  font-size: 3rem;
  font-weight: 800;
  letter-spacing: -0.03em;
  color: #818cf8;
  margin: 0 0 8px;
}
.body-text {
  font-size: 1rem;
  line-height: 1.6;
  color: #94a3b8;
  margin: 8px 0;
}
.label-caps {
  font-size: 0.7rem;
  font-weight: 700;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  color: #6ee7b7;
  display: block;
  margin: 12px 0;
}
#wide-display {
  font-size: 1.5rem;
  letter-spacing: 0.1em;
  color: #c7d2fe;
  margin: 0;
}
```

`letter-spacing` is best expressed in `em` so it scales with font size.

## text-align, text-decoration, text-transform

These three properties handle alignment, underlines/strikethrough, and capitalisation. A live comparison showing all the common values.

```html
<div class="align-demo">
  <p class="left">text-align: left — the default for most languages</p>
  <p class="center">text-align: center — for headings and short lines</p>
  <p class="right">text-align: right — for dates, prices, right-rail content</p>
</div>
<div class="deco-demo">
  <a class="no-underline" href="#">text-decoration: none — link without underline</a>
  <span class="underline">text-decoration: underline — explicit underline</span>
  <span class="strike">text-decoration: line-through — strikethrough</span>
</div>
<div class="transform-demo">
  <p class="upper">text-transform: uppercase</p>
  <p class="lower">TEXT-TRANSFORM: LOWERCASE</p>
  <p class="cap">text-transform: capitalize — first letter of each word</p>
</div>
```

```css
body { background: #0f172a; padding: 24px; font-family: system-ui; font-size: 14px; }
.align-demo, .deco-demo, .transform-demo { background: #1e293b; padding: 16px; border-radius: 8px; margin-bottom: 12px; }
p { margin: 4px 0; color: #e2e8f0; }
.left { text-align: left; }
.center { text-align: center; }
.right { text-align: right; }
a, span { display: block; margin: 6px 0; color: #e2e8f0; }
.no-underline { text-decoration: none; color: #60a5fa; }
.underline { text-decoration: underline; color: #6ee7b7; }
.strike { text-decoration: line-through; color: #94a3b8; }
.upper { text-transform: uppercase; color: #818cf8; }
.lower { text-transform: lowercase; color: #c7d2fe; }
.cap   { text-transform: capitalize; color: #6ee7b7; }
```

## The font Shorthand

`font` combines style, weight, size, line-height, and family into one declaration. The format: `font-style font-weight font-size/line-height font-family`.

```html
<p id="shorthand">This paragraph uses the font shorthand: italic 600 1rem/1.6 system-ui</p>
<p id="longhand">This paragraph uses the same properties written longhand — identical result.</p>
```

```css
body { background: #0f172a; padding: 24px; }
#shorthand {
  font: italic 600 1rem/1.6 system-ui;
  color: #c7d2fe;
  background: #1e293b;
  padding: 16px;
  border-radius: 6px;
  margin-bottom: 12px;
}
#longhand {
  font-style: italic;
  font-weight: 600;
  font-size: 1rem;
  line-height: 1.6;
  font-family: system-ui;
  color: #6ee7b7;
  background: #1e293b;
  padding: 16px;
  border-radius: 6px;
}
```

The size and family are required in the shorthand. Note: using `font` shorthand resets any omitted font sub-properties to their initial values — if you only want to change `font-weight`, set it individually.

## Challenge: text_styles

Style the elements below so that:
1. `#heading` has `font-size: 2rem`, `font-weight: 700`, `line-height: 1.2`, `letter-spacing: -0.02em`
2. `#body-text` has `font-size: 1rem`, `line-height: 1.6`, `font-weight: 400`
3. `#label` has `font-size: 0.75rem`, `font-weight: 600`, `text-transform: uppercase`, `letter-spacing: 0.1em`

```html
<h1 id="heading">Article Title</h1>
<p id="body-text">This is the body text of the article.</p>
<span id="label">Category</span>
```

```challenge
#heading {

}

#body-text {

}

#label {

}
```

```test
var h = getComputedStyle(document.querySelector('#heading'))
var b = getComputedStyle(document.querySelector('#body-text'))
var l = getComputedStyle(document.querySelector('#label'))
assert h.fontSize === '32px' && h.fontWeight === '700'
assert h.lineHeight === '38.4px'
assert b.fontSize === '16px' && b.fontWeight === '400' && b.lineHeight === '25.6px'
assert l.fontSize === '12px' && l.fontWeight === '600' && l.textTransform === 'uppercase'
```
