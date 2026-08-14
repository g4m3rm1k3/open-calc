# Lesson 03: Layout Panels

**What this covers:** every panel WPF ships for arranging children —
`Grid`, `StackPanel`, `DockPanel`, `WrapPanel`, `Canvas`, `UniformGrid` —
what each one is actually good at, and how to pick correctly instead of
reaching for `Grid` out of habit for everything.

**What you need to know first:** [Lesson 02](lesson-02-xaml-syntax-itself.md).

## The shared idea: a `Panel` owns arrangement, children don't position themselves

Every panel below is a `ViewGroup`-equivalent: a `View` that holds other
`View`s and decides where each one goes. A plain `TextBlock` or `Button`
has no opinion about its own screen position — whatever panel contains it
decides that, which is why the *same* button behaves completely
differently depending only on which panel it's placed inside, with zero
change to the button itself. Choosing a panel is choosing an arrangement
*algorithm*, not decorating a container.

## `StackPanel` — one axis, in declaration order

```xml
<StackPanel Orientation="Vertical">
    <TextBlock Text="Name:" />
    <TextBox />
    <TextBlock Text="Email:" />
    <TextBox />
    <Button Content="Submit" />
</StackPanel>
```

Stacks children along one axis — `Vertical` (top to bottom) or
`Horizontal` (left to right) — strictly in the order they appear in the
XML. Each child's position is entirely determined by what came before it.
No way to center something independent of its siblings, or anchor to an
edge regardless of other content. **Use for:** simple forms, toolbars,
anything that's genuinely a single-file line of things.

## `Grid` — rows and columns, the default choice for real screens

```xml
<Grid>
    <Grid.RowDefinitions>
        <RowDefinition Height="Auto" />
        <RowDefinition Height="*" />
        <RowDefinition Height="Auto" />
    </Grid.RowDefinitions>
    <Grid.ColumnDefinitions>
        <ColumnDefinition Width="150" />
        <ColumnDefinition Width="*" />
    </Grid.ColumnDefinitions>

    <TextBlock Grid.Row="0" Grid.Column="0" Text="Header" />
    <ListBox Grid.Row="1" Grid.Column="0" Grid.ColumnSpan="2" />
    <Button Grid.Row="2" Grid.Column="1" Content="OK" />
</Grid>
```

- `<Grid.RowDefinitions>`/`<Grid.ColumnDefinitions>` — property-element
  syntax (Lesson 02) declaring the grid's row/column structure before any
  child references it.
- `Height="Auto"` — this row sizes itself to fit its tallest child, no
  bigger.
- `Height="*"` — a **star size**: this row takes a *share* of whatever
  space is left over after every `Auto` and fixed-size row is satisfied.
  Multiple `*` rows split the remainder proportionally (`Height="2*"` next
  to `Height="1*"` gives the first row twice the leftover space).
- `Width="150"` — a fixed pixel width, no flexing.
- `Grid.Row="0" Grid.Column="0"` — these aren't `Grid`'s own properties;
  they're **attached properties** (full mechanism explained in
  [Lesson 01a-equivalent territory](lesson-10-dependency-properties.md) —
  for now: a property a *child* sets on itself that only means something
  because it's inside a `Grid`, letting any element declare its own cell
  without `Grid` needing a property for every possible child type).
  `Grid.ColumnSpan="2"` stretches one child across two columns.

**Use for:** almost any real screen — forms, dashboards, anything with
actual visual structure rather than a single line of stacked controls.
This is the panel your assigned project's main layout is most likely
built on.

## `DockPanel` — pin children to an edge, last one fills what's left

```xml
<DockPanel LastChildFill="True">
    <Menu DockPanel.Dock="Top" />
    <StatusBar DockPanel.Dock="Bottom" />
    <TreeView DockPanel.Dock="Left" Width="200" />
    <ContentControl />
</DockPanel>
```

Each child (except the last) declares which edge it docks to via the
`DockPanel.Dock` attached property (`Top`, `Bottom`, `Left`, `Right`).
`LastChildFill="True"` (the default) makes the final undecorated child —
here, `ContentControl` — expand to fill whatever space remains after
every docked edge is carved out. **Use for:** the classic
menu-bar-top / status-bar-bottom / sidebar-left / main-content-fills-rest
application shell shape — genuinely the natural fit, better than
recreating the same layout by hand with `Grid` rows and columns.

## `WrapPanel` — like `StackPanel`, but wraps to a new line/column

```xml
<WrapPanel Orientation="Horizontal">
    <Button Content="Tag 1" Margin="4" />
    <Button Content="Tag 2" Margin="4" />
    <Button Content="Tag 3" Margin="4" />
    <!-- as many as fit per row; overflow wraps to the next row automatically -->
</WrapPanel>
```

Same one-axis stacking as `StackPanel`, except when a child would run off
the available width (for `Horizontal`) it wraps to a new row — the direct
equivalent of how text wraps in a paragraph. **Use for:** a flag/tag
list, a photo thumbnail grid, a toolbar of buttons whose count isn't
fixed ahead of time.

## `Canvas` — exact pixel coordinates, no automatic arrangement at all

```xml
<Canvas>
    <Ellipse Width="20" Height="20" Fill="Red" Canvas.Left="50" Canvas.Top="30" />
    <Ellipse Width="20" Height="20" Fill="Blue" Canvas.Left="120" Canvas.Top="80" />
</Canvas>
```

`Canvas.Left`/`Canvas.Top` — attached properties, same mechanism as
`Grid.Row` — place a child at an exact `(x, y)` offset from the panel's
top-left corner. No automatic reflow, no relative positioning between
siblings at all; resize the window and every child stays at its literal
pixel coordinates. **Use for:** drawing, diagrams, a game board, anything
genuinely coordinate-based — the one panel in this list that's the wrong
default for ordinary application UI, and the one most likely to look
"broken" (content clipped or overlapping) the moment a window is resized,
because nothing here is designed to adapt.

## `UniformGrid` — every cell exactly the same size, no per-cell config

```xml
<UniformGrid Rows="2" Columns="3">
    <Button Content="1" />
    <Button Content="2" />
    <Button Content="3" />
    <Button Content="4" />
    <Button Content="5" />
    <Button Content="6" />
</UniformGrid>
```

Like `Grid`, but every row and column is forced to the same size
automatically, and children fill cells in order with no `Grid.Row`/
`Grid.Column` needed at all — a calculator's button pad or a photo
thumbnail wall is the textbook case. **Use for:** exactly that uniform,
evenly-sized-cells shape; reach for `Grid` instead the moment cells need
to differ in size.

## The tradeoff, stated once

`StackPanel`/`DockPanel`/`WrapPanel`/`UniformGrid` are all, underneath,
convenience wrappers around what `Grid` could also express by hand with
enough rows/columns/spans — they exist because writing that by hand every
time is real, avoidable overhead for a shape that has a name. `Canvas` is
the outlier: it can express layouts none of the others can (true
free-form/overlapping placement), at the total cost of zero automatic
adaptation to size changes.

## Nesting panels — the real, normal pattern

```xml
<DockPanel>
    <StackPanel DockPanel.Dock="Top" Orientation="Horizontal">
        <Button Content="New" Margin="4" />
        <Button Content="Open" Margin="4" />
        <Button Content="Save" Margin="4" />
    </StackPanel>
    <Grid>
        <!-- main content -->
    </Grid>
</DockPanel>
```

A real screen almost always nests panels — a `DockPanel` shell with a
`StackPanel` toolbar docked to the top and a `Grid` filling the rest is
completely ordinary, not a sign of doing something wrong. Reading an
unfamiliar `.xaml` file, the panel nesting *is* the visual structure —
trace it the same way you'd trace nested HTML `<div>`s.

## What to check first in your assigned project

- Identify the outermost panel in each window/page — that names the
  screen's overall shape before you read a single control inside it.
- Any `Canvas` is worth a second look: it's the one panel that won't
  adapt if you resize the window, which matters if "make it better"
  includes making the UI resize cleanly.
- If you see manually duplicated spacing (`Margin="4"` on ten separate
  buttons) where a `UniformGrid` or a `Style` (Lesson 08) could express
  it once, that's a real, concrete "make it better" candidate.

## Next

[Lesson 04 — Core Controls Tour](lesson-04-core-controls-tour.md) covers
what actually goes *inside* these panels.
