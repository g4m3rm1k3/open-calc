# Concept: WPF Layout Panels and Controls (`Grid`, `TextBlock`, Alignment)

**What you'll understand by the end:** what a layout panel is for, how a control like `TextBlock` is placed inside one, and how alignment properties position it within the space it's given.

**Prerequisites:** `xaml-declarative-ui-markup.md`.

## Setup

*(Full walkthrough of these mechanics: `../wpf-lessons/HOW-TO-RUN-EXAMPLES.md`.)*

```
dotnet new wpf -n ConceptDemo -o ConceptDemo
cd ConceptDemo
```
Open `MainWindow.xaml` and edit the empty `<Grid>` it generates — the
example below shows exactly what to add inside it.

## The Problem

A window needs somewhere to put visible content, and that content needs a way to say where within the available space it should sit — especially since a window's own size can change (the user can resize it) after the program starts.

## The Isolated Example

In `MainWindow.xaml`, replace the generated `<Grid></Grid>` with:
```xml
<Grid>
    <TextBlock Text="Concept demo" FontSize="24" HorizontalAlignment="Center" VerticalAlignment="Center" />
</Grid>
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

Run, and confirmed as a real running process:
```
dotnet run
tasklist /FI "IMAGENAME eq ConceptDemo.exe"

Image Name                     PID Session Name        Session#    Mem Usage
========================= ======== ================ =========== ============
ConceptDemo.exe              37584 Console                    1    104,736 K
```

**What this proves:** the window, previously a blank rectangle (empty `Grid`), now really renders visible text — a real, observable change caused entirely by adding one element inside an existing container, with no code-behind change at all.

## Mechanical Walkthrough

- `<Grid>` — WPF's most common **layout panel**: a container whose whole job is arranging the elements placed inside it. Used here with no rows/columns defined, so it behaves as one single cell.
- `<TextBlock ... />` — a real WPF **control**, the standard element for displaying non-editable text. The trailing `/>` is XML's self-closing tag form, used because this element has no children.
- `Text="Concept demo"` — the actual string content displayed; same attribute mechanism as `Title` on `Window`, applied to a different, nested object.
- `FontSize="24"` — same attribute mechanism, a different property.
- `HorizontalAlignment="Center"` / `VerticalAlignment="Center"` — how this element positions itself *within* the space its parent (`Grid`) gives it, independent of the window's actual current size — `Center` on both means the text sits in the middle regardless of how the window is resized.

## CS Lens

This is a **constraint-based layout system**: an element declares *how* it wants to be positioned relative to available space, and the layout engine recalculates the actual pixel position every time that space changes — rather than the element (or the programmer) computing and hard-coding an absolute position once.

Also recognized in: CSS Flexbox/Grid (`justify-content: center` is the direct web equivalent of `HorizontalAlignment="Center"`), Android's `ConstraintLayout`, iOS's Auto Layout — nearly every modern UI toolkit replaced fixed-coordinate positioning with some form of this same relative, recalculated-on-resize model.

## SE Lens

The alternative — positioning `TextBlock` with a hand-calculated `Margin` (fixed pixel offsets from an edge) — works for exactly one window size and silently breaks the moment the window is resized, since fixed offsets don't know anything about the space actually available. `HorizontalAlignment`/`VerticalAlignment` cost nothing extra to write and stay correct automatically across every resize, with zero extra code — a real, concrete payoff for very little added complexity.

## Connection

Builds directly on `xaml-declarative-ui-markup.md`'s empty `<Grid>` — this is what actually goes inside it. A future concept, not yet written, covers `Grid.RowDefinitions`/`Grid.ColumnDefinitions` — what happens once more than one element needs to share the same `Grid` without stacking on top of each other.

## Try It Yourself

1. Resize the running window by dragging its edge and confirm the text really does stay centered at every size — the `SE Lens` claim above, proven directly rather than taken on faith.
2. Add a second `TextBlock` directly below the first, inside the same `Grid`. Rebuild and rerun — observe that it renders *on top of* the first one, not below it (a `Grid` with no rows/columns defined stacks every child in the same single cell). Don't fix this — just observe it.
3. Change `HorizontalAlignment="Center"` to `HorizontalAlignment="Left"` (leaving `VerticalAlignment="Center"`) and confirm the text now sits at the left edge, vertically centered — proof the two alignment properties are independent of each other.
