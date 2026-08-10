# Concept: `UniformGrid` — Equal Cells Without Declaring Them

**What you'll understand by the end:** how `UniformGrid` divides its
space into equal-sized cells automatically, without a `RowDefinitions`/
`ColumnDefinitions` block, and exactly when that automatic behavior is
the right tradeoff against a real `Grid`'s explicit control.

**Prerequisites:** `wpf-grid-rows-and-columns.md`.

## Setup

```
dotnet new wpf -o ConceptDemo
cd ConceptDemo
```
Open `MainWindow.xaml` and replace the generated `<Grid></Grid>` with the
example below.

## The Problem

A `Grid` with, say, six same-sized buttons in a 2×3 layout needs an
explicit `RowDefinitions`/`ColumnDefinitions` block (per
`wpf-grid-rows-and-columns.md`) *and* an explicit `Grid.Row`/`Grid.Column`
on every single child — a lot of markup for a layout whose actual rule is
as simple as "divide the space evenly, arrange children in reading
order."

## The Isolated Example

```xml
<UniformGrid Rows="2" Columns="3">
    <Button Content="1" Margin="4" />
    <Button Content="2" Margin="4" />
    <Button Content="3" Margin="4" />
    <Button Content="4" Margin="4" />
    <Button Content="5" Margin="4" />
    <Button Content="6" Margin="4" />
</UniformGrid>
```

```
dotnet build
```
**Real output:**
```
Build succeeded.
    0 Warning(s)
    0 Error(s)
```

Run it: six buttons appear in a clean 2-row-by-3-column arrangement, each
cell exactly the same size, filled in reading order (left-to-right, then
top-to-bottom) — with no `Grid.Row`/`Grid.Column` written anywhere.

**What this proves:** `UniformGrid` divides its available space into
`Rows × Columns` equal-sized cells and places children into them in
declaration order automatically — the placement a real `Grid` would need
an explicit attached property on every child to achieve.

## Mechanical Walkthrough

- `<UniformGrid Rows="2" Columns="3">` — declares the cell grid directly
  as two properties on the panel itself, rather than a
  `RowDefinitions`/`ColumnDefinitions` property-element block the way a
  real `Grid` requires.
- No `Grid.Row`/`Grid.Column` (or any attached property at all) appears
  on any child — `UniformGrid` assigns each child to the next available
  cell in declaration order automatically; a `Grid` never does this,
  since an un-positioned `Grid` child defaults to cell `(0, 0)` and
  simply stacks with every other un-positioned sibling instead.
- Omitting `Rows`/`Columns` entirely is legal too: `UniformGrid`
  computes a number of rows and columns automatically from however many
  children it actually has, aiming for a roughly square arrangement.

## CS Lens

`UniformGrid` is **grid layout with the structure inferred instead of
declared** — the same underlying idea `wpf-grid-rows-and-columns.md`
covers (dividing space into a named, indexable structure before placing
content), specialized for the common case where every cell is genuinely
the same size and children fill it in a fixed, predictable order.

Also recognized in: CSS Grid's `grid-template-columns: repeat(3, 1fr)`
shorthand (declaring "N equal columns" as one expression instead of N
separate track definitions), and any photo-grid or icon-grid UI that
arranges same-sized tiles in reading order without per-tile placement
logic.

## SE Lens

The tradeoff against a real `Grid` is direct: `UniformGrid` writes far
less markup for the equal-cells, fill-in-order case, but gives up two
things a real `Grid` allows — cells of genuinely different sizes (every
`UniformGrid` cell is forced equal, by definition), and placing a
specific child into a specific cell out of declaration order (a real
`Grid`'s explicit `Grid.Row`/`Grid.Column` can put any child anywhere;
`UniformGrid` cannot). `UniformGrid` is the right tool exactly when both
of those real `Grid` features would go unused anyway — a button toolbar,
a fixed keypad, a photo grid — and the wrong one the moment a design
needs an irregular cell size anywhere in the layout.

## Connection

Builds directly on `wpf-grid-rows-and-columns.md` — the same
divide-space-before-filling-it idea, with the structure computed instead
of declared. Contrast with `wpf-wrappanel.md`, which flows variably-sized
content instead of dividing space into forced-equal cells.

## Try It Yourself

1. Remove `Rows="2" Columns="3"` entirely, keeping all six buttons, and
   observe what arrangement `UniformGrid` computes on its own.
2. Add a seventh button without changing `Rows`/`Columns` — confirm
   whether it's simply cut off (uncomputed cells beyond `Rows × Columns`
   don't grow to fit) or whether the existing cells shrink to
   accommodate it, and connect that observation back to `Rows`/`Columns`
   being a fixed declaration, not a live-computed one when both are set
   explicitly.
3. Change `Columns="3"` to `Columns="2"` while leaving `Rows="2"` and
   six children — confirm two children now have no cell to land in, and
   observe what `UniformGrid` actually does with content it can't fit.
