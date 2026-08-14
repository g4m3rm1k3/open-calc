# Lesson 12: DataGrid and ListView In Depth

**What this covers:** `DataGrid` — columns, selection, and editing — the
control most real assignment projects lean on for anything table-shaped,
and the specific properties that decide whether it's read-only or
editable.

**What you need to know first:** [Lesson 04](lesson-04-core-controls-tour.md)
(`ListBox`, whose `ItemsSource`/`SelectedItem` shape `DataGrid` reuses
directly) and [Lesson 06](lesson-06-data-binding-fundamentals.md).

## Auto-generated columns — the fastest path, and its real limits

```xml
<DataGrid ItemsSource="{Binding Items}" AutoGenerateColumns="True" />
```

`AutoGenerateColumns="True"` (the default) inspects `Item`'s public
properties via reflection and builds one column per property
automatically — every `public` property on `Item`, in declaration order,
each becoming a column titled with that property's name. Fast to get
something on screen; the real limits: no control over column order,
titles (`"PurchaseDate"` shows literally, not "Purchase Date"), which
properties are excluded, or per-column formatting — any real project
past a first prototype switches to explicit columns.

## Explicit columns — real control, one column per real column

```xml
<DataGrid ItemsSource="{Binding Items}" AutoGenerateColumns="False">
    <DataGrid.Columns>
        <DataGridTextColumn Header="Name" Binding="{Binding Name}" Width="*" />
        <DataGridTextColumn Header="Value" Binding="{Binding Value, StringFormat=C}" Width="100" />
        <DataGridCheckBoxColumn Header="Favorite" Binding="{Binding IsFavorite}" Width="60" />
        <DataGridComboBoxColumn Header="Category" SelectedItemBinding="{Binding Category}"
                                 ItemsSource="{Binding Source={StaticResource Categories}}" Width="120" />
    </DataGrid.Columns>
</DataGrid>
```

`AutoGenerateColumns="False"` turns off the reflection-based behavior
above so only the explicitly declared columns appear. Four real column
types, each matching a control from Lesson 04:

- `DataGridTextColumn` — a plain bound text cell, `Binding="{Binding
  Name}"` the same binding syntax as everywhere else, `StringFormat=C`
  the same format specifier from Lesson 09.
- `DataGridCheckBoxColumn` — a real `CheckBox` per cell, bound to a
  `bool` property.
- `DataGridComboBoxColumn` — a dropdown per cell; note the property name
  is `SelectedItemBinding`, not `Binding` — a naming difference from
  `DataGridTextColumn` worth knowing before hunting for a plain `Binding`
  property that doesn't exist on this column type.
- `Width="*"`/`Width="100"` — the identical star-sizing syntax from
  `Grid` (Lesson 03), reused here for column widths: `*` takes remaining
  space, a fixed number is a fixed pixel width.

## `SelectedItem` — same shape as `ListBox`, now the whole row

```xml
<DataGrid ItemsSource="{Binding Items}" SelectedItem="{Binding SelectedItem}" />
```

```csharp
private Item? _selectedItem;
public Item? SelectedItem
{
    get => _selectedItem;
    set { _selectedItem = value; OnPropertyChanged(); }
}
```

Identical mechanism to `ListBox.SelectedItem` from Lesson 04 — clicking a
row two-way binds the whole `Item` object into `SelectedItem`, which is
how a detail panel elsewhere in the same window shows "whatever row is
currently selected" with no manual wiring beyond this one binding.

## Editing — `IsReadOnly` and what actually triggers a write-back

```xml
<DataGrid ItemsSource="{Binding Items}" IsReadOnly="False" CanUserAddRows="False" />
```

`IsReadOnly="False"` (the grid-wide default is actually editable,
somewhat counter to what you might expect) makes every cell editable
in-place: double-click, or start typing while a cell is selected, opens
edit mode. **The actual write happens when the edit commits** — pressing
Enter, Tab, or clicking a different row — not on every keystroke; a
`TwoWay` binding (Lesson 06, the default for editable-looking bindings
here too) on a `DataGridTextColumn` only pushes the new value into the
underlying object at that commit point, unlike a plain `TextBox` with
`UpdateSourceTrigger=PropertyChanged`. `CanUserAddRows="False"` turns off
the built-in blank "new row" placeholder row `DataGrid` shows by default
at the bottom — real, and often turned off deliberately in projects that
handle "add a new item" through a separate form (Lesson 07's `AddCommand`
pattern) instead of inline grid editing.

**Making one specific column read-only while the rest of the grid stays
editable:**

```xml
<DataGridTextColumn Header="ID" Binding="{Binding Id}" IsReadOnly="True" />
```

Each column also has its own `IsReadOnly`, independent of the grid-wide
setting — the common real pattern: an auto-generated `Id` column stays
read-only while user-entered fields (`Name`, `Value`) stay editable, on
the same grid.

## Row events — reacting to a commit, a selection change, or a double-click

```xml
<DataGrid ItemsSource="{Binding Items}"
          SelectionChanged="ItemsGrid_SelectionChanged"
          MouseDoubleClick="ItemsGrid_MouseDoubleClick"
          CellEditEnding="ItemsGrid_CellEditEnding" />
```

```csharp
private void ItemsGrid_MouseDoubleClick(object sender, MouseButtonEventArgs e)
{
    if (((DataGrid)sender).SelectedItem is Item item)
        OpenEditWindow(item);
}
```

Ordinary code-behind event handlers, same shape as Lesson 05's
`(object sender, EventArgs e)` pattern. `MouseDoubleClick` — the common
real wiring for "double-click a row to open its detail/edit view."
`CellEditEnding` — fires right before an edit commits, `e.Cancel = true`
inside it is the real mechanism for rejecting an edit (invalid input)
before it ever reaches the bound property — a validation hook distinct
from, and earlier than, `IDataErrorInfo` (Lesson 15).

## Sorting and grouping — built in, or via `ICollectionView`

`DataGrid`'s column headers are clickable to sort by default (a
triangle indicator appears, ascending/descending toggles on repeated
clicks) with **zero extra code**, for any column bound via a plain
property path — this is `DataGrid`'s own built-in behavior, separate from
and simpler than the manual `SortDescription` from Lesson 11. Reach for
`ICollectionView`'s `SortDescriptions`/`Filter`/`GroupDescriptions`
instead specifically when sort needs to be set programmatically (a
default sort order on load) or combined with live filtering — the two
mechanisms aren't mutually exclusive; a grid can have live-filtered
`ItemsSource` (via `ICollectionView`) *and* still let the user click a
header to re-sort within that filtered view.

## Selection modes — one row, or many

```xml
<DataGrid SelectionMode="Extended" SelectionUnit="FullRow" />
```

`SelectionMode` — `Single` (default) or `Extended` (Ctrl/Shift-click for
multiple, matching `ListBox`'s own `SelectionMode` from Lesson 04).
`SelectionUnit` — `FullRow` (default), `Cell`, or `CellOrRowHeader`,
controlling whether a click selects the whole row or one individual cell
— relevant the moment a feature needs "which exact cell," not just "which
row," selected.

## SE Lens

`AutoGenerateColumns` versus explicit columns is a real, honest tradeoff,
not "always use explicit": auto-generation is the right choice for a
genuine one-off debugging/inspection view where seeing every property
raw is the actual goal; explicit columns are the right choice the moment
the grid is real, user-facing UI, because the reflection-based approach
has zero control over what a user actually needs to see, in what order,
formatted how.

## What to check first in your assigned project

- `AutoGenerateColumns` — if `"True"` on a user-facing grid, that's a
  concrete, low-risk "make it better" candidate: converting to explicit
  columns gives immediate control over headers/formatting/order with no
  behavior change to the underlying data.
- `IsReadOnly` at both the grid level and per-column — mismatches (a
  grid-level `IsReadOnly="True"` with per-column overrides trying to
  re-enable editing, which does **not** work — grid-level `True` wins) are
  a real, easy-to-miss bug source.
- Any `CellEditEnding` handler — that's where in-grid validation logic
  lives; read it before assuming validation only happens in a separate
  form.

## Next

[Lesson 13 — Dialogs and Windows](lesson-13-dialogs-and-windows.md) covers
`MessageBox`, file pickers, and secondary windows — what a "double-click a
row to edit" flow like the one above typically opens into.
