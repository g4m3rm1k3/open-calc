# Concept: Grid Rows and Columns (`Grid.RowDefinitions`)

**What you'll understand by the end:** how to give a `Grid` real structure — named rows and columns a child can be placed into — instead of the single, undivided cell it starts with.

**Prerequisites:** `wpf-layout-panels-and-controls.md` (this file assumes `Grid`/`TextBlock`/alignment are already familiar).

## Setup

.NET SDK with the `wpf` template.

## The Problem

A `Grid` with no structure is one single cell — every child placed inside it, per `wpf-layout-panels-and-controls.md`'s own "Try It Yourself" observation, stacks on top of every other child in that same cell. A window with more than one real piece of content needs a way to actually divide the available space first.

## The Isolated Example

```xml
<Grid>
    <Grid.RowDefinitions>
        <RowDefinition Height="*" />
        <RowDefinition Height="Auto" />
    </Grid.RowDefinitions>

    <TextBlock Text="Top row" FontSize="24" HorizontalAlignment="Center" VerticalAlignment="Center" />
    <TextBlock Text="Bottom row" FontSize="24" HorizontalAlignment="Center" VerticalAlignment="Center" />
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

**What this proves:** this builds cleanly — `RowDefinitions` alone is valid, real structure — but neither `TextBlock` names which row it belongs to, so (per the already-established single-cell-stacking default) both still land in row 0 together, overlapping. Declaring rows and *placing a child into one* are two separate steps — proven directly in `wpf-attached-properties.md`, which is what actually moves the second `TextBlock` into row 1.

## Mechanical Walkthrough

- `<Grid.RowDefinitions>...</Grid.RowDefinitions>` — a special XAML syntax (**property-element syntax**, as opposed to the attribute syntax used for `Title="..."` etc.) for setting a property whose value is too complex for one attribute string — here, a whole collection of rows rather than a single value.
- `<RowDefinition Height="*" />` — one row. `Height="*"` (a **star size**) means "take an equal share of whatever space is left over after fixed-size rows are subtracted" — the same star-sizing idea CSS Grid's `fr` unit uses.
- `<RowDefinition Height="Auto" />` — a second row, sized to exactly fit its content's natural height, no more, no less.
- No `Grid.Column`/`ColumnDefinitions` here — a `Grid` with rows only still has exactly one column, spanning the full width; rows and columns are declared independently.

## CS Lens

This is a **grid-based layout model** — dividing available space into a named, indexable structure (rows and columns) *before* placing content, rather than positioning each piece of content by absolute coordinates.

Also recognized in: CSS Grid (`grid-template-rows`/`grid-template-columns`, `fr` units mirroring `*` sizing), Android's `GridLayout`, spreadsheet software's own row/column model — the same underlying idea recurs anywhere space needs to be divided before it's filled in.

## SE Lens

The alternative — giving every element a fixed `Margin` offset instead of a row — works for exactly one window size and one specific piece of content; adding a third element means recalculating every other element's offset by hand. Declared rows/columns let elements come and go, or resize, without the surrounding layout needing to be manually recomputed — the tradeoff is one extra, slightly verbose block of markup (`RowDefinitions`) upfront.

## Connection

`wpf-layout-panels-and-controls.md` covers the single-cell `Grid` this builds structure onto. `wpf-attached-properties.md` covers the actual mechanism (`Grid.Row`) that places a child into one of these named rows.

## Try It Yourself

1. Run the isolated example for real and observe the overlap described above with your own eyes, rather than taking it on faith.
2. Add a third `RowDefinition Height="100"` (a fixed pixel height, not `*` or `Auto`) and reason about how three differently-sized rows share the window's total height between one `*` row, one `Auto` row, and one fixed 100px row.
3. Add `<Grid.ColumnDefinitions>` with two `<ColumnDefinition Width="*" />` entries alongside the existing rows. Confirm the `Grid` now has a real 2-row-by-2-column structure (four cells), even though nothing is placed into the new column yet.
