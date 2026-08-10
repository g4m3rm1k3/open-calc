# Concept: HTML Table Elements

**What you'll understand by the end:** the real, semantic HTML elements used to mark up tabular data, and why using them correctly matters beyond just visual appearance.

**Prerequisites:** none.

## Setup

Any plain HTML file — no install needed.

## The Problem

Tabular data — rows and columns, with headers labeling each column — could technically be approximated with nested `<div>`s and CSS `display: grid`, but doing so throws away real, built-in meaning browsers, screen readers, and other tools already understand about tables specifically: which cells are headers, which row a given cell belongs to, and how the whole structure relates as a table.

## The Isolated Example

```html
<table>
  <thead>
    <tr>
      <th>Name</th>
      <th>Diameter (mm)</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>End Mill</td>
      <td>10</td>
    </tr>
    <tr>
      <td>Ball Mill</td>
      <td>10</td>
    </tr>
  </tbody>
</table>
```

**Real, rendered result:** a browser renders this with default table styling (borders between cells depending on the browser/stylesheet, bold+centered header text) with zero CSS required — and a screen reader announces "Name, column header" / "Diameter (mm), column header" before reading each row's cells, correctly associating each data cell with its column header — behavior that requires no extra markup or ARIA attributes, purely from using the correct elements.

## Mechanical Walkthrough

- `<table>` — the whole table; a real, distinct HTML element type, not a generic container.
- `<thead>` — groups the header row(s); `<tbody>` groups the actual data rows — this separation lets a browser (or a stylesheet, or a script) treat headers and data differently (sticky headers when scrolling a long table is a common, real feature relying on exactly this grouping).
- `<tr>` — one table row, valid inside either `<thead>` or `<tbody>` (or a third, less common `<tfoot>` for summary rows).
- `<th>` — a **header cell**: semantically a label for a row or column, not just a bold `<td>` — browsers apply bold, centered styling by default specifically because `<th>` carries this distinct meaning, and assistive technology uses it to announce column/row context for each data cell.
- `<td>` — a real **data cell** — the actual tabular content.
- Every `<tr>` inside `<thead>`/`<tbody>` should contain the same number of cells (accounting for any deliberate `colspan`/`rowspan` merges) for the table to make structural sense — a table with rows of inconsistent length is a real, common markup mistake.

## CS Lens

This is **semantic markup** — choosing an element for what it structurally *means*, not merely how it happens to render by default. The same visual result (a grid of bordered cells) is achievable with generic `<div>`s and CSS, but only the semantic table elements carry meaning a browser, search engine, or screen reader can actually use — the distinction between "looks like a table" and "is a table, structurally" is exactly the same distinction `html-id-attribute.md` and other semantic-HTML concepts draw between visual appearance and real, machine-readable structure.

Also recognized in: `<nav>`, `<article>`, `<header>` and HTML5's other semantic sectioning elements (each could be approximated with a `<div>`, but only the semantic element communicates real meaning to tools beyond a human eye), and, more broadly, any format offering both a generic and a specific way to express the same visual/structural idea, where the specific form is almost always the better choice when it genuinely fits.

## SE Lens

Using real table elements is close to free — no more markup than an equivalent `<div>`-based grid — while providing real, concrete benefits a `<div>`-based approximation doesn't: default, sensible styling with zero CSS, correct accessibility behavior with zero extra ARIA attributes, and cell/row relationships a script can query directly (`table.rows`, `row.cells`) rather than needing to reconstruct from generic, unstructured `<div>` nesting. The real caveat, worth naming honestly: `<table>` should be reserved for genuinely tabular data — using it purely to achieve a grid *layout* for unrelated content (a common practice in the pre-CSS-Grid era of web development) is a real, historical misuse of the element's actual semantic meaning.

## Connection

Directly what a component maps real data into via `.map()` (see `javascript-array-foreach.md`'s sibling concept `javascript-array-map.md`) when rendering a list of records as rows — each data item becoming one real `<tr>`, matching `react-key-prop-reconciliation.md`'s discussion of tracking each generated row's identity correctly.

## Try It Yourself

1. Remove `<thead>`/`<tbody>` entirely, leaving bare `<tr>`s as direct children of `<table>` — confirm the table still renders visually (browsers tolerate this), then reason about what's lost structurally (no way to style headers separately, no clean row-grouping for a script to query).
2. Inspect a real table you've built using your browser's accessibility inspector (most dev tools have one) and confirm each `<td>` reports its associated column header — direct, observable proof of the semantic relationship `<th>` establishes.
3. Build the identical visual result using only `<div>`s and CSS Grid, then compare: how much CSS was required to match the table version's default styling, and what accessibility behavior (if any) does the `<div>`-based version provide with no extra work?
