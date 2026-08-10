# Concept: `Canvas` — Absolute Positioning by Coordinate

**What you'll understand by the end:** how `Canvas` places children at
exact coordinates instead of computing a position for you, and why that
makes it the deliberate exception among WPF's layout panels rather than
the default choice.

**Prerequisites:** `wpf-layout-panels-and-controls.md`.

## Setup

```
dotnet new wpf -o ConceptDemo
cd ConceptDemo
```
Open `MainWindow.xaml` and replace the generated `<Grid></Grid>` with the
example below.

## The Problem

Every layout panel covered so far — `Grid`, `DockPanel`, `WrapPanel` —
computes each child's actual position *for* the developer, from rows,
docked edges, or flowing order. Some content genuinely needs the
opposite: placing an element at an exact, specific point — a marker on a
map, a shape in a diagram, a piece of a custom-drawn visualization —
where "compute this for me" is actively the wrong behavior.

## The Isolated Example

```xml
<Canvas Background="WhiteSmoke">
    <Ellipse Canvas.Left="20" Canvas.Top="20" Width="40" Height="40" Fill="CornflowerBlue" />
    <Ellipse Canvas.Left="100" Canvas.Top="60" Width="40" Height="40" Fill="IndianRed" />
    <TextBlock Canvas.Left="20" Canvas.Top="120" Text="Positioned by exact coordinate" />
</Canvas>
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

Run it: the two circles render at their exact declared pixel positions,
overlapping the way their coordinates dictate, with no repositioning
based on each other's size or presence. Resize the window — neither
circle moves at all, since nothing about their position is relative to
the window's own size.

**What this proves:** `Canvas` places every child at an exact `(Left,
Top)` — or `(Right, Bottom)` — coordinate, computed by the developer, not
the panel; unlike every other panel covered so far, resizing the
`Canvas` itself changes nothing about where already-placed children sit.

## Mechanical Walkthrough

- `<Canvas Background="WhiteSmoke">` — a layout panel whose entire job,
  unlike `Grid`/`DockPanel`/`WrapPanel`, is to *not* compute a child's
  position — it only paints a background and hosts children at whatever
  coordinates they declare.
- `Canvas.Left="20" Canvas.Top="20"` — an **attached property** (the
  same mechanism as `Grid.Row` or `DockPanel.Dock`) giving this specific
  child's distance, in pixels, from the `Canvas`'s own left and top
  edges. `Canvas.Right`/`Canvas.Bottom` exist too, measuring from the
  opposite edges instead — using more than one pair on the same axis
  (both `Left` and `Right`) on one element is a real conflict WPF
  resolves by preferring `Left`/`Top` and ignoring the other.
- A child with **no** `Canvas.Left`/`Canvas.Top` set at all defaults to
  `(0, 0)` — the top-left corner — rather than causing an error; every
  child not explicitly positioned silently stacks at the same corner.

## CS Lens

`Canvas` is **absolute (coordinate-based) positioning**, the direct
opposite of the constraint-based, relative positioning every other panel
in this project uses. Also recognized in: HTML/CSS `position: absolute`
(the identical model, coordinates relative to a positioned ancestor);
raw pixel-buffer graphics APIs generally, where every drawn element is
placed by explicit coordinate because nothing about the medium implies
any other relationship between elements.

## SE Lens

Why does WPF default every other panel to relative, computed
positioning, and make `Canvas` the one deliberate exception, rather than
the other way around? Because absolute coordinates are correct for
exactly one window size and one specific arrangement — the two circles
above will silently start overlapping content around them, or run off
the edge, the moment the design needs to adapt to a different window
size, a different font size, or a different language's longer text,
none of which a fixed pixel number knows anything about. `Canvas` is the
right tool specifically when a layout genuinely calls for exact,
deliberate coordinates — a diagram, a game board, a custom chart — and
the wrong default for ordinary application UI, which is why this
project's own screens use `Grid`, `DockPanel`, and `StackPanel`
everywhere instead.

## Connection

Builds on `wpf-layout-panels-and-controls.md`'s general layout-panel
idea, and `wpf-attached-properties.md`'s attached-property mechanism,
applied here to raw coordinates instead of a row/column index or a
docked edge.

## Try It Yourself

1. Resize the running window and confirm neither circle moves even one
   pixel — direct proof `Canvas` truly ignores its own available size
   when positioning already-placed children.
2. Add a third `Ellipse` with no `Canvas.Left`/`Canvas.Top` at all and
   confirm it renders stacked exactly at the top-left corner, behind or
   in front of anything else already there, rather than causing an
   error.
3. Give one `Ellipse` both `Canvas.Left="20"` and `Canvas.Right="20"`
   at once. Predict which one WPF honors before rerunning to check.
