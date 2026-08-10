# Concept: CSS Flexbox

**What you'll understand by the end:** how to lay out a row (or column) of elements that align and space themselves automatically, without manually calculating positions.

**Prerequisites:** `css-rule-syntax-selectors-cascade.md`.

## Setup

Any plain HTML file with a `<style>` block — no build tool needed.

## The Problem

Positioning several elements in a row — say, a label and a value, vertically centered against each other, with consistent spacing between elements of varying natural width — required real, fiddly manual work in older CSS (floats, manually computed margins). Flexbox exists specifically to make "arrange these elements in a line, aligned and spaced a certain way" a small, declarative set of properties rather than a manual layout calculation.

## The Isolated Example

```html
<div class="row">
  <span class="label">Spindle</span>
  <span class="value">1000 RPM</span>
</div>

<style>
  .row {
    display: flex;
    align-items: center;
    gap: 8px;
    border: 1px solid #2b3a55;
    padding: 5px 8px;
  }
  .value {
    flex: 1;
    text-align: right;
  }
</style>
```

**Real, rendered result:** "Spindle" and "1000 RPM" appear on the same horizontal line, vertically centered against each other even if one has a larger font size than the other, with exactly 8px of gap between them, and "1000 RPM" pushed all the way to the right edge of the container.

## Mechanical Walkthrough

- `display: flex` turns an element into a **flex container** — every direct child becomes a **flex item**, laid out in a row by default (left to right), rather than each stacking on its own line the way ordinary block elements do.
- `align-items: center` aligns flex items along the **cross axis** (perpendicular to the row direction — vertically, for a default left-to-right row) — without it, items would align to the top by default, which can look visually uneven when items have different heights.
- `gap: 8px` inserts consistent spacing *between* flex items, without needing individual margins on each child (and without the classic "extra margin at the very start/end" problem manually-applied margins on every child would cause).
- `flex: 1` on a specific child tells it to **grow** to fill any remaining available space in the row — this is what pushes `.value` to the far right: the label takes only the width its text needs, and the value's flex item expands to consume everything left over, with its own `text-align: right` then aligning its actual text to that expanded box's right edge.

## CS Lens

Flexbox is a **constraint-based layout algorithm** — rather than positioning each element with explicit coordinates, a developer describes relationships and constraints (how items should align, how extra space should be distributed) and the browser's own layout engine solves for the actual pixel positions. This is a fundamentally different approach from manually computing positions, and closely related to how `css-grid-layout.md`'s two-dimensional layout model works — both are **declarative layout systems**, following the same "describe the desired outcome, let the engine compute how" principle `declarative-vs-imperative-queries.md` describes for SQL, applied here to visual layout instead of data retrieval.

Also recognized in: nearly every native UI framework's own layout system built on comparable constraint/flow-based ideas (iOS's Auto Layout, Android's `LinearLayout`, both conceptually similar to flexbox's row/column-plus-growth model).

## SE Lens

Flexbox is the right tool specifically for **one-dimensional** layout — a single row or a single column of items — and using `gap` and `flex: 1`-style growth instead of manually-computed margins and widths means a layout automatically adapts correctly when content changes (a longer label, an extra digit in a number) with zero layout code needing to change. For layouts needing alignment across **two** dimensions simultaneously (rows *and* columns together, like a real grid of boxes), `css-grid-layout.md` is the more appropriate, purpose-built tool — reaching for nested flexbox to simulate a grid is a real, common workaround that Grid was specifically introduced to replace.

## Connection

Builds on `css-rule-syntax-selectors-cascade.md`. Commonly used for rows within a larger `css-grid-layout.md`-based page structure — the two layout models compose naturally, each handling the dimension it's actually suited for.

## Try It Yourself

1. Remove `align-items: center` and add a larger `font-size` to one of the two spans — observe the default top-alignment this produces, then restore `align-items: center` and confirm both spans align to their shared vertical center instead.
2. Change `flex: 1` from the value span to the label span instead, and observe which element now expands to fill available space — confirming `flex: 1` genuinely controls *which* item absorbs the extra room, not just that some item does.
3. Add `flex-direction: column` to `.row` and observe the same two children now stack vertically instead of horizontally — with `align-items: center` now aligning them horizontally instead of vertically, direct proof that flexbox's "main axis" and "cross axis" swap roles based on `flex-direction`.
