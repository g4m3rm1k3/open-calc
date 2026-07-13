---
series: css-visual-design
level: 1
title: Typography Hierarchy
lang: css
---

# Typography Hierarchy

Open any professional design critique and "hierarchy" is the word you'll hear most. Hierarchy is what tells a reader where to look first, what's a heading, what's supporting detail. Without it, every element competes for attention equally — and nothing wins.

Typography is the primary tool for creating visual hierarchy. Size, weight, line-height, and letter-spacing together signal importance without requiring color or layout changes. Learning to control them deliberately is the difference between a UI that guides the reader and one that dumps text on a page.

By the end of this lesson you will understand type scales and the mathematical ratios behind them, know how to use `font-weight`, `line-height`, and `letter-spacing` to create hierarchy, and recognize the patterns used in real design systems for headings, body copy, and labels.

## Type scale

```html
<article class="article">
  <p class="label">Tutorial</p>
  <h1 class="heading-1">Building a design system</h1>
  <p class="subtitle">How to make every component feel consistent without repeating yourself</p>
  <h2 class="heading-2">Start with a type scale</h2>
  <p class="body">A type scale is a set of font sizes with a fixed ratio between each step. The most common ratio is 1.25 (Major Third) or 1.333 (Perfect Fourth).</p>
  <p class="caption">Last updated July 2026</p>
</article>
```

```css
/* Major Third scale: each step × 1.25 */
:root {
  --text-xs:   0.64rem;   /* caption, label */
  --text-sm:   0.8rem;    /* small body */
  --text-base: 1rem;      /* body */
  --text-lg:   1.25rem;   /* subtitle / h3 */
  --text-xl:   1.563rem;  /* h2 */
  --text-2xl:  1.953rem;  /* h1 */
  --text-3xl:  2.441rem;  /* display */
}

.article { max-width: 600px; font-family: system-ui, sans-serif; line-height: 1.6; }
.label    { font-size: var(--text-xs); text-transform: uppercase; letter-spacing: 0.08em; font-weight: 600; color: #6366f1; margin: 0 0 0.5rem; }
.heading-1 { font-size: var(--text-2xl); font-weight: 800; line-height: 1.2; margin: 0 0 0.75rem; color: #0f172a; }
.subtitle  { font-size: var(--text-lg); color: #475569; line-height: 1.5; margin: 0 0 2rem; }
.heading-2 { font-size: var(--text-xl); font-weight: 700; line-height: 1.3; margin: 2rem 0 0.75rem; color: #0f172a; }
.body      { font-size: var(--text-base); color: #334155; margin: 0 0 1rem; }
.caption   { font-size: var(--text-xs); color: #94a3b8; }
```

**CS lens:** A type scale is a geometric sequence — each value is the previous multiplied by a constant ratio. `clamp()` makes it fluid: `font-size: clamp(1rem, 2.5vw, 1.25rem)`. This is a piecewise linear function: below the lower bound, the value is fixed; inside the range, it scales linearly with viewport width; above the upper bound, it's fixed again.

## Font weight and meaning

```html
<div class="weight-demo">
  <p class="w-300">300 — Light. Used for large display text, decorative.</p>
  <p class="w-400">400 — Regular. Body text, readable at small sizes.</p>
  <p class="w-500">500 — Medium. UI labels, slightly emphasized.</p>
  <p class="w-600">600 — Semibold. Subheadings, strong labels.</p>
  <p class="w-700">700 — Bold. Headings, calls to action.</p>
  <p class="w-800">800 — Extrabold. Hero headings, impactful statements.</p>
</div>
```

```css
.weight-demo { font-family: system-ui, sans-serif; display: flex; flex-direction: column; gap: 0.5rem; }
.weight-demo p { margin: 0; font-size: 1rem; color: #1e293b; }
.w-300 { font-weight: 300; }
.w-400 { font-weight: 400; }
.w-500 { font-weight: 500; }
.w-600 { font-weight: 600; }
.w-700 { font-weight: 700; }
.w-800 { font-weight: 800; }
```

## Line height and letter spacing

```html
<div class="spacing-demo">
  <div class="card tight">
    <h3>Tight (1.2)</h3>
    <p>Good for headings and large display text. Not for body copy — lines merge together when text wraps.</p>
  </div>
  <div class="card normal">
    <h3>Normal (1.6)</h3>
    <p>Good for body copy. The space between lines lets the eye track back to the start of the next line without confusion.</p>
  </div>
  <div class="card loose">
    <h3>Loose (2.0)</h3>
    <p>Too much for body. Used for UI controls, single-line labels, or when you want a very airy feel.</p>
  </div>
</div>
```

```css
.spacing-demo { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; font-family: system-ui, sans-serif; }
.card { padding: 1rem; border: 1px solid #e2e8f0; border-radius: 8px; }
.card h3 { font-size: 0.85rem; font-weight: 600; margin: 0 0 0.5rem; color: #6366f1; text-transform: uppercase; letter-spacing: 0.05em; }
.card p { margin: 0; font-size: 0.875rem; color: #334155; }
.tight  p { line-height: 1.2; }
.normal p { line-height: 1.6; }
.loose  p { line-height: 2.0; }
```

**SE lens:** Every major design system codifies typography as tokens: `--font-size-body`, `--line-height-body`, `--font-weight-heading`. This is not over-engineering — it's because a designer's "change all body text from 16px to 15px" request becomes a one-line change to a token, not a find-and-replace across 80 components. Tokens also enable theming (compact vs. comfortable density modes) without duplicating component styles.

**Common mistakes:**
- Using too many font sizes — more than 5-6 distinct sizes creates visual noise, not hierarchy. Limit yourself to your type scale.
- Setting `line-height` in `px` instead of unitless numbers — unitless values (like `1.6`) scale correctly when font size changes. `24px` stays `24px` even if font size doubles.

**Debug tip:** In DevTools Elements panel, select any text element — the Computed tab shows the resolved `font-size`, `line-height`, and `font-weight`. Use this to verify your scale is being applied as expected.

**Next:** Spacing systems — the 8-point grid and consistent spatial relationships.

## Challenge: type_hierarchy

Apply a clear heading/body hierarchy.

```html
<div id="article-demo">
  <h1 class="demo-heading">Main Heading</h1>
  <p class="demo-body">Body text that explains things in detail. It should be readable and comfortable at normal reading sizes.</p>
</div>
```

```challenge css
#article-demo { font-family: system-ui, sans-serif; }
.demo-heading {
  font-size: 2rem;
  font-weight: 700;
  line-height: 1.2;
  margin: 0 0 1rem;
}
.demo-body {
  font-size: 1rem;
  line-height: 1.6;
  color: #334155;
}
```

```test
const heading = document.querySelector('.demo-heading')
const body = document.querySelector('.demo-body')
const hSize = parseFloat(getComputedStyle(heading).fontSize)
const bSize = parseFloat(getComputedStyle(body).fontSize)
assert hSize > bSize * 1.4
assert hSize >= 20
assert bSize >= 14
const hWeight = getComputedStyle(heading).fontWeight
assert parseInt(hWeight) >= 600
const bLineHeight = parseFloat(getComputedStyle(body).lineHeight) / parseFloat(getComputedStyle(body).fontSize)
assert bLineHeight >= 1.4
```
