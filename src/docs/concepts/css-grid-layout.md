# Concept: CSS Grid

**What you'll understand by the end:** how to lay out elements into rows and columns simultaneously, declaring the grid's shape once rather than positioning each item individually.

**Prerequisites:** `css-rule-syntax-selectors-cascade.md`.

## Setup

Any plain HTML file with a `<style>` block — no build tool needed.

## The Problem

Arranging several elements into a real, two-dimensional grid — say, four status boxes arranged two-by-two, each the same size — is awkward with tools meant for one-dimensional layout: flexbox (see `css-flexbox-layout.md`) naturally handles a single row or column well, but simulating a genuine multi-row, multi-column grid with it requires wrapping rows inside rows, manually keeping each row's item count consistent.

## The Isolated Example

```html
<div class="grid">
  <div class="box">Spindle</div>
  <div class="box">Dir</div>
  <div class="box">Feed</div>
  <div class="box">Coolant</div>
</div>

<style>
  .grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 4px;
  }
  .box {
    border: 1px solid #2b3a55;
    padding: 5px 7px;
  }
</style>
```

**Real, rendered result:** four boxes arranged in a genuine 2×2 grid — "Spindle"/"Dir" on the first row, "Feed"/"Coolant" on the second — each column exactly half the container's width, with no wrapping markup needed to define where one row ends and the next begins; the grid itself, not nested elements, determines the row breaks.

## Mechanical Walkthrough

- `display: grid` turns an element into a **grid container** — its direct children automatically become grid items, placed into the grid the container's own properties define.
- `grid-template-columns: 1fr 1fr` defines exactly two columns, each taking an equal **fraction** (`fr`, a real CSS unit meaning "one share of the available space") of the container's width — `1fr 1fr 1fr` would define three equal columns instead, `2fr 1fr` would make the first column twice as wide as the second.
- Grid items are placed automatically, filling the defined columns left to right, wrapping to a new row once a row's columns are full — with four items and two columns, the browser computes two rows without any explicit row markup needed.
- `gap: 4px` inserts consistent spacing between every grid cell, both horizontally and vertically, in one single property — the two-dimensional equivalent of flexbox's own `gap`.

## CS Lens

CSS Grid is a **two-dimensional constraint-based layout system** — rather than nesting one-dimensional containers to simulate rows and columns together, a single grid container declares its full shape (how many columns, how wide each is) once, and every child is placed into that shape automatically. This is the natural extension of the same declarative-layout idea `css-flexbox-layout.md` applies in one dimension, generalized to two — describing a target *structure* and letting the layout engine solve for actual positions, rather than manually computing them.

Also recognized in: spreadsheet layout itself (rows and columns defined once, cells placed automatically within that structure), and native UI frameworks' own grid layout systems (Android's `GridLayout`, SwiftUI's `LazyVGrid`) — the same underlying two-dimensional layout need, addressed with comparable declarative syntax across platforms.

## SE Lens

Choosing Grid specifically when a layout is genuinely two-dimensional (rows *and* columns both matter, as with a real dashboard of status boxes) avoids the fragile nested-flexbox-rows workaround layouts often resorted to before Grid existed — a workaround that requires manually keeping each "row" `<div>`'s item count consistent, and breaks visually the moment that count changes. Grid's `grid-template-columns` declares the shape once, centrally, and every item automatically respects it, with no per-row bookkeeping required anywhere in the markup.

## Connection

Builds on `css-rule-syntax-selectors-cascade.md`. Commonly composed with `css-flexbox-layout.md` — a page's overall structure laid out with Grid, with individual rows *within* one grid cell laid out using flexbox for that cell's own internal, one-dimensional alignment needs.

## Try It Yourself

1. Change `grid-template-columns` to `1fr 1fr 1fr 1fr` (four equal columns) and observe all four boxes now sit on a single row instead of wrapping into two — confirming the column count, not the item count, is what determines row breaks.
2. Add a fifth box and confirm it wraps onto a new, third row automatically under the original `1fr 1fr` (two-column) definition, with zero markup changes needed to accommodate it.
3. Replace `grid-template-columns: 1fr 1fr` with `grid-template-columns: 2fr 1fr` and observe the first column become visibly wider than the second — confirming `fr` units divide available space proportionally, not equally by default.
