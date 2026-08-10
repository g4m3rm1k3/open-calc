# Concept: `DockPanel` — Arranging Children Against Edges

**What you'll understand by the end:** how `DockPanel` arranges children
against the edges of the space it's given, what `DockPanel.Dock` actually
is, and why the order children appear in matters here in a way it never
did for `Grid`.

**Prerequisites:** `wpf-layout-panels-and-controls.md`.

## Setup

```
dotnet new wpf -o ConceptDemo
cd ConceptDemo
```
Open `MainWindow.xaml` and replace the generated `<Grid></Grid>` with the
example below.

## The Problem

A `Grid` positions children into cells you define ahead of time —
exact, but it means deciding a whole row/column structure even for a
simple "toolbar on top, status bar on bottom, content filling whatever's
left" layout, one of the most common shapes a real application window
actually needs.

## The Isolated Example

```xml
<DockPanel LastChildFill="True">
    <TextBlock DockPanel.Dock="Top" Text="Toolbar" Background="LightGray" Padding="8" />
    <TextBlock DockPanel.Dock="Bottom" Text="Status bar" Background="LightGray" Padding="8" />
    <TextBlock DockPanel.Dock="Left" Text="Sidebar" Background="Gainsboro" Padding="8" />
    <TextBlock Text="Main content — fills whatever space is left" Background="White" Padding="8" />
</DockPanel>
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

Run it: "Toolbar" spans the full width, pinned to the top; "Status bar"
spans the full width, pinned to the bottom; "Sidebar" fills the
remaining height along the left edge; "Main content" fills every pixel
left over after the other three claim their edges.

**What this proves:** `DockPanel` arranges children against the edges of
its own available space, in the order they're declared, and the *last*
child (with `LastChildFill="True"`, the default) automatically fills
whatever space remains — without that last child needing its own
`DockPanel.Dock` value at all.

## Mechanical Walkthrough

- `<DockPanel LastChildFill="True">` — `LastChildFill` controls whether
  the final child (the one with no `DockPanel.Dock` set) automatically
  stretches to fill remaining space; `True` is actually the default, set
  explicitly here only to name it. Setting it `False` instead means the
  last child docks and sizes to its own content like every other child,
  leaving genuinely empty space if the edges don't add up to the whole
  area.
- `DockPanel.Dock="Top"` — an **attached property** (the same mechanism
  `wpf-attached-properties.md` covers for `Grid.Row`/`Grid.Column`): a
  property that belongs to `DockPanel`, set on a *child* element to tell
  the parent how to treat it, not a property of the child itself. Legal
  values are `Left`, `Top`, `Right`, and `Bottom`.
- **Declaration order matters here** in a way it never did for `Grid`:
  each docked child claims space from whatever remains *after* every
  child declared before it already claimed its own edge. Swapping the
  `Top` and `Left` children's order in the markup changes the actual
  rendered shape — the sidebar would then span the full height first,
  and the toolbar would only span the width remaining after the sidebar
  already claimed its column.

## CS Lens

`DockPanel` is a **greedy, order-dependent allocation** strategy: each
child claims a slice of the remaining space, in turn, in exactly the
order it appears — the same shape as a bin-packing algorithm that places
items one at a time and never revisits an earlier placement once made.

Also recognized in: CSS's `float: left`/`float: right` (order-dependent
edge-claiming, the direct ancestor of this same idea on the web), and
any UI toolkit's "border layout" (edges plus a center) — Java Swing's
`BorderLayout` uses the identical five-region model (`North`/`South`/
`East`/`West`/`Center`) under different names.

## SE Lens

The alternative — a `Grid` with explicit `RowDefinitions`/
`ColumnDefinitions` computed by hand to achieve the same toolbar/sidebar/
content shape — works, but requires deciding the exact row/column
structure up front and keeping every child's `Grid.Row`/`Grid.Column`
consistent with it by hand. `DockPanel` trades that explicit structure
for an implicit one inferred from declaration order — less to write for
this specific, very common shape, at the cost of a layout whose result
depends on an ordering a reader has to trace through rather than read
directly off explicit row/column numbers.

## Connection

Builds on `wpf-attached-properties.md`'s attached-property mechanism,
applied to a genuinely different parent (`DockPanel` instead of `Grid`).
`wpf-layout-panels-and-controls.md` covers the general idea of a layout
panel this specializes.

## Try It Yourself

1. Swap the declaration order of the `Top`-docked and `Left`-docked
   children and rerun — observe the shape actually change, proof that
   order, not just the `Dock` value, determines the result.
2. Set `LastChildFill="False"` and give the last child an explicit
   `DockPanel.Dock="Right"` — confirm it now docks to a specific edge
   like every other child instead of filling remaining space.
3. Add a second `Top`-docked child after the first. Confirm both stack
   at the top, each claiming space in the order declared, rather than
   overlapping.
