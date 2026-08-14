# Lesson 11: Layout Panels

**What you will build:** the same handful of child elements, rearranged
across six real panel types, proving each one's real arrangement
algorithm by observing where identical content actually ends up.

**What you need to know first:** [Lesson 10](lesson-10-xaml-property-elements-and-markup-extensions.md)
and Lesson 09 (`Grid` seen empty, `Window`'s one-child rule not yet
stated).

**Terms introduced in this lesson:**
- **`ViewGroup`-equivalent / layout container** — a panel whose entire
  job is arranging its children; every panel in this lesson is one.
- **Attached property** — a property a *child* element sets on itself
  that only means something because of which panel contains it (`Grid.Row`,
  `DockPanel.Dock`, `Canvas.Left`); the child doesn't own the property,
  its parent panel type does.
- **Star sizing** — a `Grid` row/column `Height`/`Width` of `*`, meaning
  "take a proportional share of whatever space is left over" after every
  fixed-size and `Auto`-size row/column is satisfied.

**Objects and methods used:** `StackPanel`, `Grid`, `DockPanel`,
`WrapPanel`, `Canvas`, `UniformGrid` — six real `System.Windows.Controls`
classes, each given full treatment as this lesson's own subject, below.

---

## Concept Unit: `Window` Allows Exactly One Child

### The Problem

Lesson 09's `Window` contained one empty `<Grid>`. Before adding real
content, a real constraint on `Window` itself needs to be proven: can a
`Window` hold more than one direct child, the way a `StackPanel` (below)
holds many?

### Introduce the Concept in Isolation

```xml
<Window ...>
    <TextBlock Text="First" />
    <TextBlock Text="Second" />
</Window>
```

This does **not** compile:

```
error MC3080: Property 'Window.Content' or 'ContentControl.Content' does not
allow multiple children.
```

`Window` derives from a real WPF category of type — `ContentControl` —
whose `Content` property can hold exactly one child object, full stop.
This is why every real window (Lesson 09's, and every one in this
lesson) wraps its actual content in a single panel — the panel becomes
that one allowed child, and the panel's *own* job is arranging the many
real children inside itself.

### Discard

This two-`TextBlock` failure proof is disposable.

### Mechanical Walkthrough

- `<TextBlock Text="First" />` / `<TextBlock Text="Second" />` — **(b)
  hard concept reappearing**, ordinary elements/attributes from Lesson
  09; the real point is that there are **two** of them, both direct
  children of `Window`, which is what the error rejects.

## Concept Unit: `StackPanel` — One Axis, Declaration Order

### The Problem

The simplest possible real layout need: several elements, one after
another, top to bottom or left to right. Does WPF need something more
elaborate than "just list them" for this common case?

### Introduce the Concept in Isolation

```xml
<StackPanel Orientation="Vertical">
    <TextBlock Text="Name:" />
    <TextBlock Text="Email:" />
    <TextBlock Text="Submit" />
</StackPanel>
```

The three `TextBlock`s render stacked top to bottom, strictly in the
order written, each one directly below the previous. Changing
`Orientation="Vertical"` to `Orientation="Horizontal"` (same three
children, no other change) rearranges them left to right instead — proof
that `Orientation` alone controls the single axis `StackPanel` stacks
along, and that stacking order is tied directly to XAML declaration
order, not any explicit positioning.

### Discard

This proof is disposable.

### Mechanical Walkthrough

- `<StackPanel Orientation="Vertical">` — **(a) first appearance** of
  `StackPanel` as this lesson's subject; `Orientation` — its one
  defining property, explained above.
- Three nested `<TextBlock Text="..." />` — **(b) hard concept
  reappearing**, ordinary elements from Lesson 09; their *order*, not
  their content, is what this unit's proof turns on.

### SE Lens

`StackPanel`'s real limit, worth stating honestly: there is no way to
say "center this one item regardless of the others" or "anchor this to
the far edge" — every child's position is entirely determined by what
came before it in the stack. That's the exact cost `Grid` (next unit)
exists to remove, at the cost of `Grid` needing explicit row/column
declarations `StackPanel` never requires.

## Concept Unit: `Grid` — Rows, Columns, and Star Sizing

### The Problem

A real form needs elements that don't simply stack — a label next to its
field, a footer pinned to the bottom regardless of how much content sits
above it. `StackPanel`'s single axis can't express either. Something
with two-dimensional placement is needed.

### Introduce the Concept in Isolation

```xml
<Grid>
    <Grid.RowDefinitions>
        <RowDefinition Height="Auto" />
        <RowDefinition Height="*" />
        <RowDefinition Height="Auto" />
    </Grid.RowDefinitions>

    <TextBlock Grid.Row="0" Text="Header" />
    <TextBlock Grid.Row="1" Text="Body (grows to fill)" />
    <TextBlock Grid.Row="2" Text="Footer" />
</Grid>
```

Three rows declared, each `TextBlock` placed into one via `Grid.Row`.
Resizing the window taller or shorter changes only the **middle** row's
actual height — the header and footer rows stay exactly as tall as their
content needs (`Height="Auto"`), while the middle row (`Height="*"`)
absorbs every bit of extra or reduced space. This is called **star
sizing**: a `*`-sized row takes a *proportional share* of whatever space
remains after every `Auto` and fixed-size row is satisfied first.

### Discard

This proof is disposable.

### Mechanical Walkthrough

- `<Grid.RowDefinitions>` — **(a) first appearance** of property-element
  syntax (Lesson 10) applied to `Grid`'s own `RowDefinitions` property —
  a real, recognized reuse of last lesson's syntax, not a new mechanism.
- `<RowDefinition Height="Auto" />` — **(a) first appearance.** `Auto`
  sizes this row to exactly fit its tallest child, no more, no less.
- `<RowDefinition Height="*" />` — **(a) first appearance** of star
  sizing, explained above.
- `Grid.Row="0"` (and `"1"`, `"2"`) — **(a) first appearance** of the
  **attached property** mechanism itself: `Grid.Row` is not a property
  `TextBlock` declares — it's a property `Grid` defines, settable on
  *any* child placed inside a `Grid`, naming which row (zero-indexed)
  that child occupies. A full explanation of the mechanism enabling this
  — how a type can attach a property to another type it doesn't own —
  is this series' upcoming Dependency Properties lesson; this unit
  proves the *usage* and *effect*, that lesson proves the *mechanism*
  underneath it.

### CS Lens

Star sizing is a real instance of **proportional space distribution**:
multiple `*`-sized rows split remaining space by their relative weight
(`Height="2*"` next to `Height="1*"` splits leftover space 2:1) — the
same underlying idea as CSS Flexbox's `flex-grow`, or splitting a
remainder proportionally in any resource-allocation problem.

## Concept Unit: `DockPanel` — Pin to an Edge, Last Child Fills the Rest

### The Problem

A common real application shape — toolbar pinned to the top, status bar
pinned to the bottom, main content filling whatever's left — is
expressible in `Grid` with enough rows, but only by hand-computing which
row is which. Is there a panel that expresses "pin to an edge" directly?

### Introduce the Concept in Isolation

```xml
<DockPanel LastChildFill="True">
    <TextBlock DockPanel.Dock="Top" Text="Toolbar" />
    <TextBlock DockPanel.Dock="Bottom" Text="Status bar" />
    <TextBlock Text="Main content (fills remaining space)" />
</DockPanel>
```

The first two children dock to the top and bottom edges respectively,
regardless of their own size. The third — with no `DockPanel.Dock` set
at all — expands to fill whatever space remains after both docked edges
are carved out, because it's the *last* child and `LastChildFill="True"`
(the default).

### Discard

This proof is disposable.

### Mechanical Walkthrough

- `<DockPanel LastChildFill="True">` — **(a) first appearance.**
  `LastChildFill` — controls whether the final undecorated child expands
  to fill remaining space (the behavior just proven) or is docked like
  everything else, sized to its own content, with true empty space left
  over.
- `DockPanel.Dock="Top"` / `"Bottom"` — **(b) hard concept reappearing**,
  the identical attached-property mechanism as `Grid.Row`, now owned by
  `DockPanel` instead of `Grid`, naming an edge instead of a row index.

## Concept Unit: `WrapPanel` — Stacking That Overflows to a New Line

### The Problem

`StackPanel`'s single axis never wraps — a `Horizontal` `StackPanel`
with too many children simply runs off the visible width, with no
automatic reflow. A tag list or a toolbar of unknown length needs
something that wraps, the way text wraps in a paragraph.

### Introduce the Concept in Isolation

```xml
<WrapPanel Orientation="Horizontal" Width="150">
    <Button Content="Tag A" Margin="2" />
    <Button Content="Tag B" Margin="2" />
    <Button Content="Tag C" Margin="2" />
    <Button Content="Tag D" Margin="2" />
</WrapPanel>
```

With `Width="150"` constraining the panel's available horizontal space,
the four buttons render across **two** visible rows instead of one —
however many fit within 150 units on the first row, with the rest
wrapping automatically to a second. Removing the fixed `Width` (letting
the panel take whatever space its own parent offers) changes exactly how
many buttons fit per row, with the same wrapping behavior throughout.

### Discard

This proof is disposable.

### Mechanical Walkthrough

- `<WrapPanel Orientation="Horizontal" Width="150">` — **(a) first
  appearance.** Same `Orientation` property as `StackPanel`; the real
  new behavior — wrapping once available space runs out — is what
  distinguishes it, proven above.
- `Margin="2"` — **(a) first appearance.** Space reserved *outside* an
  element's own boundary, pushing it away from its siblings — distinct
  from `Padding` (space reserved *inside* a container, pushing its
  children inward), which this series' quick-reference material already
  named in passing; full contrast between the two is left to direct
  observation via this unit's own exercises.

## Concept Unit: `Canvas` — Exact Coordinates, No Automatic Arrangement

### The Problem

Every panel so far arranges children relative to each other or to
available space. Something genuinely different is needed for content
whose position is meant to be exact and absolute — a diagram, a drawing
surface, a game board.

### Introduce the Concept in Isolation

```xml
<Canvas Width="200" Height="100">
    <Ellipse Width="20" Height="20" Fill="Red" Canvas.Left="10" Canvas.Top="10" />
    <Ellipse Width="20" Height="20" Fill="Blue" Canvas.Left="150" Canvas.Top="60" />
</Canvas>
```

Both ellipses render at exactly the pixel offsets named — `Canvas.Left`/
`Canvas.Top` measured from the `Canvas`'s own top-left corner, with zero
relationship to each other or to any content-based sizing. Resizing the
`Window` this sits inside leaves both ellipses at their literal
coordinates — proof `Canvas` performs no automatic reflow at all, unlike
every other panel in this lesson.

### Discard

This proof is disposable.

### Mechanical Walkthrough

- `<Canvas Width="200" Height="100">` — **(a) first appearance** as this
  lesson's subject.
- `Canvas.Left="10" Canvas.Top="10"` — **(b) hard concept reappearing**,
  the identical attached-property mechanism as `Grid.Row`/
  `DockPanel.Dock`, now owned by `Canvas`, naming an exact `(x, y)`
  pixel offset instead of a row or an edge.

### SE Lens

`Canvas` is the one panel in this lesson capable of true overlapping,
free-form placement none of the others can express — at the total,
honest cost of adapting to nothing: resize the containing window, and
every child stays at its literal coordinates, which is exactly wrong for
ordinary application UI and exactly right for a drawing surface or a
diagram where absolute position *is* the content.

## Concept Unit: `UniformGrid` — Every Cell Forced to the Same Size

### The Problem

A calculator's button pad, or a photo thumbnail wall, needs a grid where
every cell is guaranteed identical in size, with children filling cells
in order — `Grid` can express this, but only by hand-writing identical
`RowDefinition`/`ColumnDefinition` entries and explicit `Grid.Row`/
`Grid.Column` on every child.

### Introduce the Concept in Isolation

```xml
<UniformGrid Rows="2" Columns="2">
    <Button Content="1" />
    <Button Content="2" />
    <Button Content="3" />
    <Button Content="4" />
</UniformGrid>
```

Four buttons, no `Grid.Row`/`Grid.Column` (or any attached property at
all) on any of them, and they still arrange into a real 2×2 grid,
filling cells left-to-right, top-to-bottom, in declaration order — each
cell forced to the exact same size automatically.

### Discard

This proof is disposable.

### Mechanical Walkthrough

- `<UniformGrid Rows="2" Columns="2">` — **(a) first appearance.** `Rows`/
  `Columns` fix the grid's shape; no attached property is needed on any
  child at all, unlike `Grid` — cell assignment is entirely automatic,
  by declaration order.

## Connect the pieces

One trace across all six: `StackPanel` arranges along one axis, in
order, with no wrapping. `Grid` arranges by explicit row/column, the
only one with proportional (`*`) space distribution. `DockPanel` pins
children to an edge, with the last one optionally filling what's left.
`WrapPanel` is `StackPanel`'s stacking behavior plus automatic wrapping
once space runs out. `Canvas` abandons automatic arrangement entirely for
exact coordinates. `UniformGrid` is `Grid`'s row/column shape with every
cell forced equal and no attached properties required. All six share one
mechanism proven at the very start: `Window`'s one-child rule is exactly
why a real screen always wraps its true content in one of these six.

## What breaks without this

Give a `UniformGrid` five children while it's declared `Rows="2"
Columns="2"` (only four cells) — real, observed result: the fifth
`Button` is simply not shown; `UniformGrid` does not grow its own
`Rows`/`Columns` automatically to accommodate more children than cells
declared. Restoring either a fourth child removed or `Columns="3"` added
fixes it — direct, provable evidence that `Rows`/`Columns` are a real,
fixed capacity, not a hint.

## Exercises

1. Build the toolbar/status-bar/content shape from the `DockPanel` unit
   using only `Grid` (three `RowDefinition`s, `Grid.Row` on each child)
   instead — confirm both produce the same visible layout, and state, in
   your own words, which felt more direct to write for this specific
   shape.
2. In the `WrapPanel` unit's example, add `Margin="2"` and a fixed
   `Width`/`Height` to a plain `<Border Background="Gray" Width="20"
   Height="20" />` instead of a `Button`, confirmed against `Padding`
   (space inside a container, pushing children inward) by adding
   `Padding="10"` to the `WrapPanel` itself and observing where the
   overall content shifts versus where individual children's own
   `Margin` pushes them apart from each other.

## Definition of Done

- [ ] You caused the real `MC3080` failure and understand `Window`'s
      one-child rule.
- [ ] You can state which panel you'd choose for: a simple vertical form,
      a toolbar/content/status-bar shell, a tag list of unknown length, a
      diagram needing exact placement, and a uniform button grid.
- [ ] You reproduced the `UniformGrid` capacity limit and understood why
      the fifth child didn't appear.
- [ ] You completed both exercises.

## Next

[Lesson 12 — Core Controls Tour](lesson-12-core-controls-tour.md) covers
what actually goes inside these panels — `Button`, `TextBox`, `CheckBox`,
`ComboBox`, and the rest of WPF's everyday control set.
