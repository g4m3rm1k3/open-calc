# CSS Masterclass — Lesson 4: CSS Grid

> Grid is for **2D layouts** — rows AND columns simultaneously. It's the best tool for page-level structure, dashboards, and any layout where you need to control both axes at once.

---

## 1. Defining a Grid

```css
.container {
  display: grid;
  grid-template-columns: 200px 1fr 1fr;  /* 3 columns: fixed + two equal */
  grid-template-rows: auto 1fr auto;     /* 3 rows: auto + fill + auto */
  gap: 1rem;
}
```

**`fr` (fraction unit):** divides available space after fixed sizes are allocated.

```css
/* 3 equal columns */
grid-template-columns: 1fr 1fr 1fr;
/* same as: */
grid-template-columns: repeat(3, 1fr);

/* Sidebar layout */
grid-template-columns: 280px 1fr;

/* Mixed */
grid-template-columns: 200px 1fr 2fr; /* 200px fixed, then 1:2 ratio */
```

---

## 2. The `repeat()` Function

```css
repeat(count, size)

repeat(3, 1fr)           /* 3 equal columns */
repeat(3, 200px)         /* 3 fixed columns */
repeat(3, 1fr 2fr)       /* 3 pairs: 1fr 2fr 1fr 2fr 1fr 2fr = 6 columns */
repeat(auto-fill, 200px) /* as many 200px columns as fit */
repeat(auto-fit, 200px)  /* same, but collapses empty tracks */
```

### The responsive grid — no media queries needed

```css
.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 1.5rem;
}
/*
  auto-fill: create as many columns as fit
  minmax(250px, 1fr): each column is at least 250px, at most 1fr
  Result: wraps from 1 column to N columns automatically
*/
```

**`auto-fill` vs `auto-fit`:**
- `auto-fill`: keeps empty columns (grid tracks still exist)
- `auto-fit`: collapses empty columns (items stretch to fill)
- For card grids, use `auto-fill`. For a single row of items that should spread out, `auto-fit`.

---

## 3. Placing Items

By default, items flow into the grid automatically. You can also place them explicitly.

### By line numbers

Grid lines are numbered starting at 1:

```
         1    2    3    4
         |    |    |    |
row 1 → [  A  |  B  |  C  ]
row 2 → [  D  |  E  |  F  ]
         |    |    |    |
```

```css
.item {
  grid-column: 2 / 4;   /* start at line 2, end at line 4 (spans 2 tracks) */
  grid-row: 1 / 3;      /* start at row line 1, end at row line 3 */
}

/* Shorthand with span */
grid-column: 2 / span 2; /* start at 2, span 2 tracks */
grid-column: span 2;     /* span 2 starting from auto-placement position */

/* Negative line numbers count from the end */
grid-column: 1 / -1;     /* span full width */
grid-row: -2 / -1;       /* last row */
```

### Named areas (most readable)

```css
.layout {
  display: grid;
  grid-template-areas:
    "header header header"
    "sidebar main   main"
    "footer footer footer";
  grid-template-columns: 280px 1fr 1fr;
  grid-template-rows: auto 1fr auto;
  min-height: 100vh;
}

.header  { grid-area: header; }
.sidebar { grid-area: sidebar; }
.main    { grid-area: main; }
.footer  { grid-area: footer; }
```

**Rules for `grid-template-areas`:**
- Each string = one row
- Each word = one cell, the same word = merged cell
- `.` = empty cell
- All rows must have same number of cells
- Named areas must be rectangular

```css
/* Responsive with areas */
.layout {
  display: grid;
  grid-template-areas:
    "header"
    "main"
    "sidebar"
    "footer";
}

@media (min-width: 768px) {
  .layout {
    grid-template-areas:
      "header  header"
      "sidebar main"
      "footer  footer";
    grid-template-columns: 280px 1fr;
  }
}
```

---

## 4. Alignment in Grid

Grid has the same alignment properties as flexbox, plus more:

```css
/* Container — aligns all items */
justify-items: stretch | start | end | center;    /* horizontal within cell */
align-items:   stretch | start | end | center;    /* vertical within cell */
place-items: center;                               /* shorthand: align-items justify-items */

/* Container — aligns the grid tracks within the container */
justify-content: start | end | center | space-between | space-evenly;
align-content:   start | end | center | space-between | space-evenly;
place-content: center;

/* Individual item override */
justify-self: start | end | center | stretch;
align-self:   start | end | center | stretch;
place-self:   center center;
```

```css
/* Center content in a grid cell */
.cell {
  display: grid;
  place-items: center;  /* grid cells are also great for centering */
}
```

---

## 5. Implicit vs Explicit Grid

You define the **explicit grid** with `grid-template-*`. The **implicit grid** is auto-created when items overflow it.

```css
.grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);  /* explicit: 3 columns */
  /* rows are implicit: created automatically */

  grid-auto-rows: 200px;       /* set size for implicit rows */
  grid-auto-columns: 1fr;      /* set size for implicit columns */
  grid-auto-flow: row;         /* fill row by row (default) */
  grid-auto-flow: column;      /* fill column by column */
  grid-auto-flow: row dense;   /* fill in gaps (good for masonry-ish layouts) */
}
```

---

## 6. `minmax()` — Track Sizing with Constraints

```css
grid-template-rows: minmax(100px, auto);  
/* rows: at least 100px, grow with content */

grid-template-columns: minmax(200px, 1fr) 1fr;
/* first column: at least 200px, at most 1fr */

/* In repeat */
repeat(auto-fill, minmax(200px, 1fr))
```

---

## 7. Subgrid (Modern — very powerful)

Child grids can participate in parent grid tracks:

```css
.parent {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1rem;
}

.card {
  grid-column: span 2;
  display: grid;
  grid-template-columns: subgrid;  /* inherits parent column tracks */
  grid-template-rows: subgrid;     /* inherits parent row tracks */
}
```

---

## 8. Classic Grid Layouts

### Holy grail layout

```css
.page {
  display: grid;
  grid-template:
    "header" auto
    "main"   1fr
    "footer" auto
    / 1fr;
  min-height: 100vh;
}

@media (min-width: 768px) {
  .page {
    grid-template:
      "header header  header"  auto
      "nav    content aside"   1fr
      "footer footer  footer"  auto
      / 200px 1fr     200px;
  }
}
```

### Dashboard grid

```css
.dashboard {
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  grid-auto-rows: minmax(100px, auto);
  gap: 1.5rem;
}

.widget-full   { grid-column: 1 / -1; }          /* full width */
.widget-half   { grid-column: span 6; }           /* half width */
.widget-third  { grid-column: span 4; }           /* third */
.widget-quarter{ grid-column: span 3; }           /* quarter */
.widget-tall   { grid-row: span 2; }              /* double height */
```

### Responsive card grid (the most-used pattern)

```css
.cards {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.5rem;
}
/* No media queries. Works from 1 to N columns automatically. */
```

### Magazine / editorial layout

```css
.editorial {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 2rem;
}

.feature   { grid-column: span 4; grid-row: span 2; }
.secondary { grid-column: span 2; }
.wide      { grid-column: 1 / -1; }
```

---

## 9. Grid vs Flexbox: When to Use Which

| Situation | Use |
|-----------|-----|
| Page-level layout (header/sidebar/main) | Grid |
| Card grids, image galleries | Grid |
| Dashboard with positioned widgets | Grid |
| Navigation bar (horizontal items) | Flex |
| Centering a single item | Flex or Grid (both work) |
| Distributing items along one axis | Flex |
| Form label + input pairs | Either |
| Items that need to line up with items in other rows | Grid |
| Items that should be sized by their own content | Flex |

**Real answer:** Use both. Flex for components, Grid for page layout. They compose — a grid cell can contain a flex container.

---

## Quick Reference Card

```
Define grid:
  display: grid
  grid-template-columns: 280px 1fr   | repeat(3, 1fr) | repeat(auto-fill, minmax(200px, 1fr))
  grid-template-rows: auto 1fr auto
  gap: <row> <col>
  grid-auto-rows: minmax(100px, auto)

Place items:
  grid-column: 2 / 4         → lines 2 to 4
  grid-column: span 2        → span 2 tracks
  grid-column: 1 / -1        → full width
  grid-row: span 2           → double height
  grid-area: name            → named area

Named areas:
  grid-template-areas: "header header"
                       "sidebar main"
  Then: .el { grid-area: header; }

Alignment:
  justify-items / align-items   → items within cells
  justify-content / align-content → tracks within container
  place-items: center           → both at once
  place-content: center

Responsive no-breakpoints:
  repeat(auto-fill, minmax(MIN, 1fr))
```

---
