# Concept: `WrapPanel` — Flowing Children Onto New Lines

**What you'll understand by the end:** how `WrapPanel` arranges children
in a flowing line that wraps onto a new row (or column) once it runs out
of room, and why that makes it a genuinely different tool than `Grid` or
`StackPanel`, not just a variant of either.

**Prerequisites:** `wpf-layout-panels-and-controls.md`.

## Setup

```
dotnet new wpf -o ConceptDemo
cd ConceptDemo
```
Open `MainWindow.xaml` and replace the generated `<Grid></Grid>` with the
example below.

## The Problem

A `StackPanel` arranges children in one single row or column, with no
limit — given enough children, a horizontal `StackPanel` just keeps
growing wider, off the edge of the window if it has to, rather than ever
wrapping. A tag list, a photo gallery, or any collection of same-sized
items whose *count* isn't known ahead of time needs a layout that keeps
using the width it's given and starts a new row only when it actually
runs out of room.

## The Isolated Example

```xml
<WrapPanel>
    <Button Content="Electronics" Margin="4" Padding="8,4" />
    <Button Content="Furniture" Margin="4" Padding="8,4" />
    <Button Content="Kitchenware" Margin="4" Padding="8,4" />
    <Button Content="Office Supplies" Margin="4" Padding="8,4" />
    <Button Content="Tools" Margin="4" Padding="8,4" />
    <Button Content="Outdoor" Margin="4" Padding="8,4" />
</WrapPanel>
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

Run it, then narrow the window by dragging its edge: the buttons fill
each row left-to-right until the next one genuinely wouldn't fit, then
continue on a new row automatically — with no code deciding where the
break happens, and no code re-run when the window is resized.

**What this proves:** `WrapPanel` fills its available width (its default
`Orientation`) with children in order, and moves to a new row only when
the next child genuinely doesn't fit in the remaining space on the
current one — recalculated live, every time the available space changes.

## Mechanical Walkthrough

- `<WrapPanel>` — no `Orientation` set, so it defaults to `Horizontal`:
  children flow left-to-right, wrapping to a new row beneath when a
  child would overflow the available width. Setting
  `Orientation="Vertical"` instead flows children top-to-bottom, wrapping
  into a new *column* to the right when one overflows the available
  height — the same idea, rotated.
- Each `Button`'s own `Margin`/`Padding` are already-established
  properties, unrelated to `WrapPanel` itself — `WrapPanel` only decides
  *where* each already-sized child lands, never how large any individual
  child is.
- Nothing here declares how many buttons fit per row — that number is
  computed live, from each button's actual rendered width and the
  panel's current available width, recalculated on every resize.

## CS Lens

`WrapPanel` is a **greedy line-breaking algorithm** — pack items onto the
current line until the next one doesn't fit, then start a new line —
computed fresh against whatever width is currently available, never
against a fixed, precomputed item-per-row count.

Also recognized in: word processors and web browsers wrapping text onto
a new line once the next word would overflow the current one (the
identical algorithm, operating on words instead of `Button`s); CSS
Flexbox's `flex-wrap: wrap`, the web's direct equivalent.

## SE Lens

The alternative — a `UniformGrid` with a fixed `Columns` count, or a
`Grid` with hand-computed columns — requires deciding *how many* items
fit per row ahead of time, which only stays correct for one specific
window width and one specific item size. `WrapPanel` trades that
up-front decision for a live computation performed on every layout pass,
at the cost of every child needing a roughly self-determined size (it
doesn't divide space evenly the way `UniformGrid` does) — the right tool
specifically when item count and window size aren't both known in
advance, the wrong one when a strict N-equal-cells grid is actually what
the design calls for (`wpf-uniformgrid.md` covers that case).

## Connection

Builds on `wpf-layout-panels-and-controls.md`'s general layout-panel
idea. Contrast directly with `wpf-uniformgrid.md`, which divides space
into a fixed number of equal cells instead of flowing and wrapping
variably-sized content.

## Try It Yourself

1. Resize the running window narrower and wider and watch the button
   count per row change live, with no code re-run — confirm this really
   is computed continuously, not fixed at startup.
2. Change `Orientation="Vertical"` and give the `WrapPanel` a fixed
   `Height` (e.g. `Height="150"`) — confirm it now wraps into new
   *columns* instead of rows once it runs out of vertical room.
3. Replace the six `Button`s with ten, keeping everything else the same
   — confirm no markup change is needed for the extra four to flow and
   wrap correctly.
