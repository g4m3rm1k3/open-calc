---
series: css-fundamentals
level: 4
title: Text & Fonts
lang: css
---

# Text & Fonts

Typography is the single most impactful category of CSS. Most of what users read on a web page is text, and the properties that control text — family, size, weight, line height, spacing — determine whether a page feels professional or amateurish, readable or dense. This lesson covers the full set of text properties and explains the reasoning behind the professional defaults.

## font-family

`font-family` specifies which typeface to use, with fallbacks:

```css
body {
  font-family: 'Inter', 'Segoe UI', 'Helvetica Neue', Arial, sans-serif;
}

code, pre {
  font-family: 'Fira Code', 'Cascadia Code', 'Courier New', monospace;
}
```

```text
The browser tries each font in order, using the first one available.
'Inter'        — custom web font (loaded separately)
'Segoe UI'     — Windows system font
'Helvetica Neue' — macOS system font
Arial          — universal fallback
sans-serif     — generic family (browser chooses)
```

Always end the list with a generic family: `serif`, `sans-serif`, `monospace`, `cursive`, or `fantasy`. Fonts are **inherited** — setting `font-family` on `body` applies it to all text in the document unless overridden.

**SE lens:** The system font stack (`'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif`) gives you a native-looking font on every OS without loading any file — fast and no FOUT (flash of unstyled text). This is what GitHub, Notion, and many modern apps use.

## font-size, font-weight, font-style

```css
h1 {
  font-size: 2.25rem;   /* 36px at root 16px */
  font-weight: 800;     /* extra bold */
}

p {
  font-size: 1rem;      /* 16px */
  font-weight: 400;     /* normal */
  font-style: normal;   /* or italic */
}

.label {
  font-size: 0.75rem;   /* 12px */
  font-weight: 600;     /* semi-bold */
  font-style: italic;
}
```

`font-size` — always use `rem` so it scales with user preferences.

`font-weight` accepts `100`–`900` in 100 increments. Not all weights are available for every font:
```text
100  Thin
200  Extra Light
300  Light
400  Normal / Regular
500  Medium
600  Semi Bold
700  Bold
800  Extra Bold
900  Black / Heavy
```

`font-style: italic` — slanted variant of the typeface (a separate font file in most families).

## line-height

`line-height` controls the vertical space between lines of text. It is the single most impactful property for readability:

```css
body {
  line-height: 1.6;       /* unitless — multiplier of font-size */
}

h1 {
  line-height: 1.15;      /* tight for large display text */
}

.compact {
  line-height: 1.2;
}
```

```text
font-size: 16px + line-height: 1.6 → line box is 25.6px tall
The extra 9.6px is split evenly above and below the text.
```

Use a **unitless** value (like `1.6`) — it scales proportionally with font-size. A `px` value (`line-height: 24px`) stops scaling when font-size changes.

**Professional defaults:**
```text
Body text:    1.5–1.7 (ample space for reading paragraphs)
Headings:     1.1–1.3 (tighter — headings are short)
Code:         1.5–1.6 (space to visually separate lines)
```

## letter-spacing and word-spacing

```css
.hero-title {
  letter-spacing: -0.02em;  /* slightly tighter — common for bold headings */
}

.label {
  letter-spacing: 0.1em;    /* wider — common for all-caps labels */
  text-transform: uppercase;
  font-size: 0.75rem;
  font-weight: 600;
}
```

`letter-spacing` is best expressed in `em` so it scales with font size.

## text-align, text-decoration, text-transform

```css
.center  { text-align: center; }
.right   { text-align: right; }
.justify { text-align: justify; }

a { text-decoration: none; }        /* remove underline */
.underline { text-decoration: underline; }
.strike    { text-decoration: line-through; }

.caps  { text-transform: uppercase; }
.lower { text-transform: lowercase; }
.title { text-transform: capitalize; }  /* capitalises first letter of each word */
```

`text-align` aligns text within its container. `justify` stretches text to fill the full width — common in print, less common in web (creates uneven word spacing).

## The font Shorthand

`font` is a shorthand that combines multiple properties:

```css
p {
  font: italic 600 1rem/1.6 'Inter', sans-serif;
}
/* equivalent to: */
p {
  font-style: italic;
  font-weight: 600;
  font-size: 1rem;
  line-height: 1.6;
  font-family: 'Inter', sans-serif;
}
```

Format: `font-style font-weight font-size/line-height font-family`. The size and family are required.

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
assert h.fontSize === '32px'
assert h.fontWeight === '700'
assert h.lineHeight === '38.4px'
assert b.fontSize === '16px'
assert b.lineHeight === '25.6px'
assert b.fontWeight === '400'
assert l.fontSize === '12px'
assert l.fontWeight === '600'
assert l.textTransform === 'uppercase'
```
