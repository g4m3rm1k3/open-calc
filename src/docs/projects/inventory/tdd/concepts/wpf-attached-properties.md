# Concept: Attached Properties (`Grid.Row`, `Grid.Column`)

**What you'll understand by the end:** what an "attached property" actually is, and why `Grid.Row="1"` is set *on the child*, not on the `Grid`.

**Prerequisites:** `wpf-grid-rows-and-columns.md`.

## Setup

*(Full walkthrough of these mechanics: `../wpf-lessons/HOW-TO-RUN-EXAMPLES.md`.)*

```
dotnet new wpf -n ConceptDemo -o ConceptDemo
cd ConceptDemo
```
Open `MainWindow.xaml` and replace the generated empty `<Grid></Grid>`
with the example below — a complete, standalone `Grid`, not a
continuation of any other file (even though the row structure matches
`wpf-grid-rows-and-columns.md`'s own).

## The Problem

A `Grid`'s rows exist, but nothing yet says *which* row each child actually belongs in — and that information has to live somewhere. It can't live on the `Grid` itself (the `Grid` doesn't know its own children's identities ahead of time), and it isn't a property `TextBlock` itself was ever designed to have (a `TextBlock` should work the same whether it's inside a `Grid`, a `StackPanel`, or nothing at all).

## The Isolated Example

In `MainWindow.xaml`, replace the generated `<Grid></Grid>` with:
```xml
<Grid>
    <Grid.RowDefinitions>
        <RowDefinition Height="*" />
        <RowDefinition Height="Auto" />
    </Grid.RowDefinitions>

    <TextBlock Grid.Row="0" Text="Top row" FontSize="24" HorizontalAlignment="Center" VerticalAlignment="Center" />
    <TextBlock Grid.Row="1" Text="Bottom row" FontSize="24" HorizontalAlignment="Center" VerticalAlignment="Center" />
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

Trying the same thing without the `Grid.` prefix — `Row="1"` instead of `Grid.Row="1"` — and rebuilding:
```
error MC3072: The property 'Row' does not exist in XML namespace
'http://schemas.microsoft.com/winfx/2006/xaml/presentation'.
```

**What this proves:** `Row` is not a real property of `TextBlock` — the compiler says so directly. `Grid.Row`, with the `Grid.` prefix, is a completely different, real thing: an **attached property**, defined by `Grid` but *set* on any child placed inside one. The prefix isn't decoration or a namespace qualifier the way it might look — it's the actual required syntax for using it at all.

## Mechanical Walkthrough

- `Grid.Row="0"` — an **attached property**: a property that conceptually belongs to `Grid` (only a `Grid` ever reads it, when arranging its children), but is *set* on whatever child needs to communicate its row to that `Grid`. Any element type can carry a `Grid.Row` value, not just `TextBlock` — the property is "attached" to it from outside, not declared as part of its own class.
- `Grid.Row="1"` — same mechanism, second child, second row — `Grid` reads each child's own `Grid.Row` value when arranging them, placing each into the matching `RowDefinition`.
- No `Grid.Column` on either — both default to column 0, the only column that exists in a `Grid` with no `ColumnDefinitions` declared.

## CS Lens

This is **externalized/attached state** — data associated with an object without being part of that object's own declared type, looked up by whatever consumer actually needs it (here, the parent `Grid`, at layout time) rather than baked into the child's own definition.

Also recognized in: HTML/CSS's `data-*` attributes read by external JavaScript rather than being part of the element's own built-in behavior, ECS (Entity-Component-System) game architectures where "position" is a component attached to an entity rather than a method the entity implements itself, Android's own `LayoutParams` pattern (a child view's layout info is set by whichever parent `ViewGroup` it's inside, not fixed to the view's own class).

## SE Lens

The real alternative — giving `TextBlock` its own `Row`/`Column` properties directly — would mean *every* element class in WPF needs its own row/column properties (and its own dock properties, its own canvas-position properties, ...) whether or not it's ever used inside the layout panel that reads them, bloating every single control's own definition with properties 90% of uses will never touch. Attached properties let `Grid` define `Row`/`Column` exactly once, usable by *any* element without that element's own class needing to know `Grid` exists at all — the real reason this mechanism exists rather than being "just" unusual syntax.

## Connection

Builds on `wpf-grid-rows-and-columns.md`'s `RowDefinitions`. The same mechanism, different owner, shows up as `Canvas.Left`/`Canvas.Top` and `DockPanel.Dock` — not covered yet, but recognizable by the same `Owner.Property="value"` shape wherever it's seen.

## Try It Yourself

1. Set `Grid.Row="5"` (a row index that doesn't exist — only rows 0 and 1 are defined) on one of the `TextBlock`s. Rebuild and run — no compile error occurs; observe what actually happens at runtime instead, and reason about why an out-of-range index doesn't fail the same way `Row="1"` (no prefix) did.
2. Add `<ColumnDefinition Width="*" />` twice (two columns) and set `Grid.Column="1"` on the second `TextBlock` (keep both at `Grid.Row="0"` this time). Confirm they now sit side by side instead of stacked or in separate rows.
3. Remove `Grid.Row` from both `TextBlock`s entirely, without removing `RowDefinitions`. Confirm the earlier stacking-in-row-0 behavior returns — proof the *default*, with no attached property set, is row 0 for everyone, not "spread evenly" or "error."
