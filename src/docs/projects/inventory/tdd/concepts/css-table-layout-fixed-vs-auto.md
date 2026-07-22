# Concept: `table-layout: fixed` vs. `auto`

**What you'll understand by the end:** why an HTML table's column
widths can shift based on content by default, and how to make them
stable and predictable instead.

**Prerequisites:** `html-table-elements.md`.

## Setup

Plain HTML/CSS, any browser.

## The Problem

A `<table>`'s columns need widths from *somewhere* — but nothing about
the markup itself says how wide each one should be. Left to its own
default behavior, a browser measures the actual content of every cell
in a column (across every row, including any nested elements) to decide
that column's width — which means the same logical column can render at
a *different* width in two separate `<table>` elements, if their
content happens to differ, even when both are meant to look identical.

## The Isolated Example

```html
<table style="border: 1px solid black;">
  <tr><td>A</td><td>1</td></tr>
</table>
<table style="border: 1px solid black; margin-top: 4px;">
  <tr><td>A</td><td>1000000</td></tr>
</table>
```

**Real output:** the first table's second column renders narrow (just
wide enough for `"1"`); the second table's second column renders much
wider (wide enough for `"1000000"`) — two separate `<table>` elements,
meant to represent the same logical shape, rendering with visibly
different column widths.

**The fix:**

```html
<table style="table-layout: fixed; width: 300px;">
  <tr><td style="width: 200px;">A</td><td style="width: 100px;">1</td></tr>
</table>
```

**Real output:** this table's columns are now exactly 200px/100px,
regardless of what text is actually typed into either cell later —
confirmed by replacing `"1"` with a much longer string and observing
the column width stays fixed while the text either wraps or overflows,
rather than the column growing to fit it.

## Mechanical Walkthrough

- Default `table-layout: auto` — the browser inspects every cell's
  content (across all rows) to compute each column's "preferred" width,
  then distributes the table's total available width among columns
  based on that measurement — a real, per-table computation, not a
  fixed rule.
- `table-layout: fixed` — column widths come *only* from the widths
  declared on the first row's cells (or a `<colgroup>`, not shown here)
  — cell content is never measured to influence column width; overflow
  content wraps or is clipped instead of growing the column.
- A fixed-layout table also renders faster on large tables, since the
  browser doesn't need to inspect every row's content before it can
  start laying anything out — it can begin rendering after only the
  first row's widths are known.

## CS Lens

Not a hard CS concept — a real, practical layout-algorithm choice
(measure-then-size vs. declare-then-render), not an algorithm a program
implements.

## SE Lens

The real tradeoff: `auto` looks better with no extra work for a table
whose content naturally varies in a way you want reflected (a column
sized exactly to its longest real value) — but two separate tables (or
a table added to gradually, one row at a time) can end up visibly
misaligned from each other, since each is measured independently.
`fixed` guarantees identical, predictable column widths across any
number of separate table instances (the exact real problem this
project hit: each "run" of movement rows renders its own separate
`<table>`), at the cost of manually choosing widths instead of letting
content decide them.

## Connection

Builds on `html-table-elements.md`. Commonly paired with `css-box-
sizing-content-box-vs-border-box.md` when a table's cells contain their
own padded/bordered elements (an input, a badge) — both need to agree
on how width is measured, or the same overflow problem recurs one level
down.

## Try It Yourself

1. Remove the explicit `width` from the fixed-layout example's `<table>`
   itself (keep the cell widths) and observe what happens to the total
   table width — confirm the cell widths still hold even without an
   explicit table-level width.
2. Add a third row to the fixed-layout table with much longer text in
   its first cell, and confirm the *column* width doesn't grow — only
   the text itself wraps or overflows within the fixed column.
3. Build two separate `<table>` elements, both `table-layout: fixed`,
   both declaring identical explicit column widths, with very different
   content — confirm their columns align identically despite the
   different content, the real property this concept exists to
   guarantee.
