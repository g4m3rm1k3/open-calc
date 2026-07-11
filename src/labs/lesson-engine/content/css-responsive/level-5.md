---
series: css-responsive
level: 5
title: Responsive Layouts Without Media Queries
lang: css
---

# Responsive Layouts Without Media Queries

The best responsive layout often needs zero media queries. CSS Grid and Flexbox have built-in mechanisms that react to available space automatically — `auto-fit`, `auto-fill`, `minmax()`, and `flex-wrap` let layouts reshape themselves without you writing a single `@media` rule.

## CSS Grid with auto-fit and minmax()

`grid-template-columns: repeat(auto-fit, minmax(200px, 1fr))` — each column is at least 200px wide, takes a fraction of available space, and the grid creates as many columns as fit. Resize the browser and columns appear or disappear automatically.

```html
<div class="auto-grid">
  <div class="card">🐍 Python</div>
  <div class="card">⚡ JavaScript</div>
  <div class="card">🎨 CSS</div>
  <div class="card">⚛️ React</div>
  <div class="card">🗄️ SQL</div>
  <div class="card">🔷 TypeScript</div>
</div>
<p class="note">No media queries. The grid rearranges based on available width. Narrow → 1 column. Wide → up to 6 columns.</p>
```

```css
body { background: #0f172a; padding: 20px; font-family: system-ui; }
.auto-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 10px;
  margin-bottom: 12px;
}
.card { background: #1e293b; color: #e2e8f0; padding: 16px; border-radius: 8px; font-size: 14px; font-weight: 700; text-align: center; }
.note { color: #64748b; font-size: 12px; line-height: 1.5; background: #1e293b; padding: 10px 14px; border-radius: 8px; margin: 0; }
```

**The difference between auto-fit and auto-fill:**

`auto-fit` — empty tracks collapse. If 3 items fit in a row, the remaining columns shrink to 0 and the 3 items stretch to fill the row.
`auto-fill` — empty tracks are preserved. If 3 items fit, the remaining columns still exist at `1fr` each, so the items don't stretch.

## Flex wrap — intrinsic responsive rows

`flex-wrap: wrap` with `flex: 1 1 200px` — items have a preferred width of `200px` but grow to fill space and shrink when needed. Items naturally flow to a new row when they can't fit.

```html
<div class="flex-grid">
  <div class="flex-card">Python Fundamentals</div>
  <div class="flex-card">CSS Flexbox</div>
  <div class="flex-card">JavaScript</div>
  <div class="flex-card">React</div>
  <div class="flex-card">TypeScript</div>
  <div class="flex-card">SQL</div>
</div>
<p class="note">flex: 1 1 200px — preferred 200px, grows to fill row, wraps when needed. Different from Grid: items in the last row may not be equal width.</p>
```

```css
body { background: #0f172a; padding: 20px; font-family: system-ui; }
.flex-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 12px;
}
.flex-card { background: #1e293b; color: #e2e8f0; padding: 14px 18px; border-radius: 8px; font-size: 13px; font-weight: 600; flex: 1 1 150px; text-align: center; }
.note { color: #64748b; font-size: 12px; line-height: 1.5; background: #1e293b; padding: 10px 14px; border-radius: 8px; margin: 0; }
```

**CS lens:** `repeat(auto-fit, minmax(200px, 1fr))` is an algorithm. The browser solves it on every layout pass: "how many columns of at least 200px fit in this container?" — computes `floor(containerWidth / 200)`, creates that many columns, distributes remaining space as `1fr`. This is the same bin-packing problem as word wrapping.

## Combining intrinsic layout with a max breakpoint

No media queries for the grid itself — only for the outer container's padding. This is the real pattern: use intrinsic layout for item flow, media queries for spacing/global layout.

```html
<div class="page">
  <header class="page-header">
    <span class="brand">⚡ UpskillOS</span>
    <span class="tagline">Courses</span>
  </header>
  <div class="course-grid">
    <div class="course-card">
      <div class="course-icon">🐍</div>
      <div class="course-title">Python Fundamentals</div>
      <div class="course-meta">36 levels · Beginner</div>
    </div>
    <div class="course-card">
      <div class="course-icon">🎨</div>
      <div class="course-title">CSS Mastery</div>
      <div class="course-meta">60+ levels · Beginner</div>
    </div>
    <div class="course-card">
      <div class="course-icon">⚡</div>
      <div class="course-title">JavaScript</div>
      <div class="course-meta">10 levels · Intermediate</div>
    </div>
    <div class="course-card">
      <div class="course-icon">🗄️</div>
      <div class="course-title">SQL</div>
      <div class="course-meta">8 levels · Beginner</div>
    </div>
  </div>
</div>
```

```css
body { background: #0f172a; margin: 0; font-family: system-ui; }
.page { padding: 16px; }
@media (min-width: 768px) { .page { padding: 32px; } }
.page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
.brand { color: #818cf8; font-weight: 800; }
.tagline { color: #64748b; font-size: 14px; }
/* No media query needed for the grid */
.course-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 14px;
}
.course-card { background: #1e293b; border-radius: 10px; padding: 20px; }
.course-icon  { font-size: 1.75rem; margin-bottom: 10px; }
.course-title { color: #e2e8f0; font-size: 14px; font-weight: 700; margin-bottom: 6px; }
.course-meta  { color: #64748b; font-size: 12px; }
```

**SE lens:** This pattern — intrinsic grid + one padding media query — is used by every major design system. Shopify Polaris, GitHub Primer, and Tailwind UI all favour `auto-fit`/`minmax()` grids over media query breakpoints for card grids. Fewer breakpoints = fewer edge cases = fewer bugs.

**Common mistakes:**
- Using `minmax(200px, 1fr)` without `auto-fit` or `auto-fill` — fixed column counts don't respond. You need `repeat(auto-fit, ...)`.
- Setting `max-width` on flex items in a wrapping row — this breaks the `flex: 1` growing behaviour and creates uneven last rows.

**Debug tip:** Add `outline: 2px solid red` temporarily to grid/flex items to see their actual boundaries. The DevTools grid overlay (click the "grid" badge on a container) shows track sizes directly.

**Next:** Container queries — making components responsive to their parent's size, not the viewport.

## Challenge: intrinsic_grid

Create a responsive grid using auto-fit and minmax — no media queries.

1. `.grid` — `display: grid`, `grid-template-columns: repeat(auto-fit, minmax(160px, 1fr))`, `gap: 12px`

```html
<div class="grid">
  <div class="item" id="i1">Item 1</div>
  <div class="item" id="i2">Item 2</div>
  <div class="item" id="i3">Item 3</div>
  <div class="item" id="i4">Item 4</div>
  <div class="item" id="i5">Item 5</div>
</div>
```

```challenge
body { background: #0f172a; padding: 20px; font-family: system-ui; }
.item { background: #6366f1; color: white; padding: 20px; border-radius: 8px; font-weight: 700; text-align: center; }

.grid {
  /* add grid properties */
}
```

```test
var grid = getComputedStyle(document.querySelector('.grid'))
assert grid.display === 'grid'
var cols = grid.gridTemplateColumns
assert cols.includes('minmax') || cols !== 'none'
var gap = parseFloat(grid.gap || grid.columnGap)
assert gap >= 10
var rules = Array.from(document.styleSheets[0].cssRules)
var hasMedia = rules.some(r => r.constructor.name === 'CSSMediaRule')
assert !hasMedia
```
