---
series: css-grid
level: 3
title: grid-template-areas
lang: css
---

# grid-template-areas

Named grid areas let you describe a layout visually in your CSS. Instead of line numbers, you give regions names and assign items to those names. The result reads like a picture of the layout, making complex grids easy to understand and maintain.

## Defining areas — the ASCII map in CSS

`grid-template-areas` takes strings that represent rows. Each word in a string is a cell name. Repeat the same name across adjacent cells to span that area across them.

```html
<div class="page">
  <header class="area-header">Header</header>
  <nav class="area-nav">Nav</nav>
  <main class="area-main">Main Content</main>
  <aside class="area-aside">Aside</aside>
  <footer class="area-footer">Footer</footer>
</div>
```

```css
body { background: #0f172a; padding: 24px; font-family: system-ui; margin: 0; }
.page {
  display: grid;
  grid-template-columns: 180px 1fr 160px;
  grid-template-rows: 60px 1fr 40px;
  grid-template-areas:
    "header header header"
    "nav    main   aside"
    "footer footer footer";
  gap: 8px;
  min-height: 300px;
  background: #1e293b;
  padding: 10px;
  border-radius: 12px;
}
.area-header { grid-area: header; background: #1e1b4b; }
.area-nav    { grid-area: nav;    background: #0f172a; }
.area-main   { grid-area: main;   background: #1e293b; border: 1px solid #334155; }
.area-aside  { grid-area: aside;  background: #0f172a; }
.area-footer { grid-area: footer; background: #0f172a; }

/* Styling */
.page > * { color: #e2e8f0; padding: 12px 16px; border-radius: 6px; font-size: 13px; font-weight: 600; display: flex; align-items: center; }
```

The `grid-template-areas` strings map directly to the visual layout. "header header header" means the header spans all three column tracks in the first row.

**CS lens:** Each unique word in `grid-template-areas` implicitly creates a named grid area — four named lines: `header-start`, `header-end` (both row and column variants). These line names are what `grid-area: header` resolves to behind the scenes.

## Using . for empty cells

A `.` in the area map marks an empty cell. Use it when you want a gap in the grid without breaking the named area structure.

```html
<div class="hero-layout">
  <div class="logo">Logo</div>
  <div class="tagline">The best way to learn CSS</div>
  <div class="cta-btn">Get Started</div>
  <div class="img-area">Hero Image</div>
</div>
```

```css
body { background: #0f172a; padding: 24px; font-family: system-ui; }
.hero-layout {
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-template-rows: 60px 80px 60px;
  grid-template-areas:
    "logo   img"
    "tag    img"
    "cta    .  ";
  gap: 12px;
  background: #1e293b;
  padding: 16px;
  border-radius: 12px;
}
.logo     { grid-area: logo;    background: #1e1b4b; }
.tagline  { grid-area: tag;     background: #0f172a; }
.cta-btn  { grid-area: cta;     background: #6366f1; }
.img-area { grid-area: img;     background: #334155; }
.hero-layout > * { color: #e2e8f0; padding: 12px 16px; border-radius: 8px; font-size: 13px; font-weight: 600; display: flex; align-items: center; }
```

## Responsive layout swap with areas

The same HTML, two completely different layouts. On "mobile" (narrow), everything stacks. On "desktop" (wide), the named areas rearrange. Edit the grid-template-areas string to try different layouts.

```html
<div class="responsive-grid desktop">
  <header class="r-header">Header</header>
  <aside class="r-side">Sidebar</aside>
  <main class="r-main">Main Content</main>
  <footer class="r-foot">Footer</footer>
</div>
<div class="responsive-grid mobile">
  <header class="r-header">Header</header>
  <aside class="r-side">Sidebar</aside>
  <main class="r-main">Main Content</main>
  <footer class="r-foot">Footer</footer>
</div>
```

```css
body { background: #0f172a; padding: 16px; font-family: system-ui; display: flex; gap: 16px; }
.responsive-grid { flex: 1; display: grid; gap: 8px; background: #1e293b; padding: 10px; border-radius: 10px; }
.r-header { grid-area: header; background: #1e1b4b; }
.r-side   { grid-area: sidebar; background: #0f172a; }
.r-main   { grid-area: main; background: #1e293b; border: 1px solid #334155; }
.r-foot   { grid-area: footer; background: #0f172a; }
.responsive-grid > * { color: #e2e8f0; padding: 12px 16px; border-radius: 6px; font-size: 12px; font-weight: 600; display: flex; align-items: center; min-height: 40px; }

/* Desktop: 3-column sidebar + content layout */
.desktop {
  grid-template-columns: 140px 1fr;
  grid-template-rows: 50px 120px 40px;
  grid-template-areas:
    "header  header"
    "sidebar main"
    "footer  footer";
}

/* Mobile: single column stack */
.mobile {
  grid-template-columns: 1fr;
  grid-template-areas:
    "header"
    "main"
    "sidebar"
    "footer";
}
```

**SE lens:** `grid-template-areas` makes the relationship between HTML and layout explicit and readable. When you look at the CSS, you can see the layout. When you look at the HTML, you see the semantic structure. The two are decoupled — you can change the layout by editing only CSS.

**Common mistakes:**
- Area strings that don't form rectangles — every named area must be a contiguous rectangle. `"a b / b a"` creates an L-shape which is invalid.
- Forgetting to match `grid-template-columns` count with the number of words in each row string.

**Debug tip:** DevTools Grid inspector shows named area overlays — each area gets its name displayed in the grid visualisation. This makes it instantly clear which cells belong to each area.

**Next:** Grid alignment — `justify-items`, `align-items`, `place-items`, and the cell-level equivalents.

## Challenge: grid_areas

Define a layout using named grid areas.

1. `.page` — `display: grid`, `grid-template-columns: 200px 1fr`, `grid-template-rows: 60px 1fr 40px`
2. Use `grid-template-areas` with rows: `"header header"`, `"nav main"`, `"footer footer"`
3. Assign items: `#header → header`, `#nav → nav`, `#main → main`, `#footer → footer`

```html
<div class="page" style="background:#1e293b;padding:10px;border-radius:10px;min-height:200px;gap:8px;">
  <div id="header" style="background:#1e1b4b;color:white;border-radius:6px;display:flex;align-items:center;padding:0 16px;font-family:system-ui;font-weight:700;">Header</div>
  <div id="nav"    style="background:#0f172a;color:#94a3b8;border-radius:6px;display:flex;align-items:center;padding:0 16px;font-family:system-ui;font-size:13px;">Nav</div>
  <div id="main"   style="background:#0f172a;color:#e2e8f0;border-radius:6px;display:flex;align-items:center;padding:0 16px;font-family:system-ui;font-size:13px;">Main</div>
  <div id="footer" style="background:#0f172a;color:#64748b;border-radius:6px;display:flex;align-items:center;padding:0 16px;font-family:system-ui;font-size:12px;">Footer</div>
</div>
```

```challenge
.page {

}

#header { grid-area: header; }
#nav    { grid-area: nav; }
#main   { grid-area: main; }
#footer { grid-area: footer; }
```

```test
var page = getComputedStyle(document.querySelector('.page'))
var h = getComputedStyle(document.querySelector('#header'))
var n = getComputedStyle(document.querySelector('#nav'))
assert page.display === 'grid'
var cols = page.gridTemplateColumns.split(' ')
assert cols.length === 2
assert h.gridArea === 'header' || h.gridRowStart !== ''
assert n.gridArea === 'nav' || n.gridColumnStart !== ''
```
