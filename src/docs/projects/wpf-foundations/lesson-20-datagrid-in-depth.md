# Lesson 20: `DataGrid` In Depth

**What you will build:** a `DataGrid` proven to auto-generate columns via
reflection, then rebuilt with real explicit columns — and a real,
observed proof of exactly *when* an in-grid edit commits back to the
bound object, since it isn't "on every keystroke" the way Lesson 14's
`TextBox` could be configured to be.

**What you need to know first:** [Lesson 14](lesson-14-data-binding-fundamentals.md)
(binding modes) and [Lesson 19](lesson-19-collections-and-icollectionview.md)
(`ObservableCollection<T>`, `ICollectionView`).

**Terms introduced in this lesson:**
- **`AutoGenerateColumns`** — when `true` (the default), `DataGrid`
  builds one column per public property via reflection; when `false`,
  only explicitly declared columns appear.
- **`DataGridTextColumn`/`DataGridCheckBoxColumn`/`DataGridComboBoxColumn`**
  — real explicit column types, each matching a familiar control from
  Lesson 12.

**Objects and methods used:** `System.Windows.Controls.DataGrid` and its
real column types, each given full treatment as this lesson's own
subject.

---

## Concept Unit: `AutoGenerateColumns` — Reflection, and Its Real Limits

### The Problem

A `DataGrid` bound to a collection of `Item` objects (Lesson 19) — does
it need to be told, column by column, what to show, or can it figure
that out from the data itself?

### Introduce the Concept in Isolation

```csharp
public class Item
{
    public string Name { get; set; } = "";
    public decimal Value { get; set; }
    public DateTime? PurchaseDate { get; set; }
}
```

```xml
<DataGrid ItemsSource="{Binding Items}" />
```

With no column configuration at all, the grid shows **three real
columns** — titled literally `Name`, `Value`, `PurchaseDate` — one per
public property on `Item`, in declaration order, built entirely by
inspecting the bound type at runtime. Adding a fourth property to `Item`
and rerunning, with no XAML change at all, adds a fourth column
automatically — direct, provable proof this is genuinely reflection-based,
not a one-time snapshot taken at compile time.

### Discard

This proof is disposable; the explicit-column version, next, is the
real, standard shape for anything beyond a quick inspection view.

### Mechanical Walkthrough

- `<DataGrid ItemsSource="{Binding Items}" />` — **(b) hard concept
  reappearing**, `ItemsSource`/`{Binding}` from Lessons 12/14.
  `AutoGenerateColumns` — **(a) first appearance**, defaulting to
  `true` with no attribute written at all; its real mechanism —
  building one column per public property via reflection, at runtime —
  is this unit's own proof.

### SE Lens

The real limit, proven directly by the literal `"PurchaseDate"` column
title above (not the friendlier "Purchase Date" a real app would want):
`AutoGenerateColumns` gives zero control over column order, titles, or
per-column formatting, and it exposes *every* public property, whether
that's wanted or not. Genuinely useful for a quick debugging/inspection
view; the wrong choice for real, user-facing UI — exactly what the next
unit fixes.

## Concept Unit: Explicit Columns — Real Control, One Column at a Time

### The Problem

A real, user-facing grid needs friendly headers, chosen column order,
and per-column formatting — none of which `AutoGenerateColumns` can
express. Does turning it off, and declaring columns by hand, close that
gap directly?

### Introduce the Concept in Isolation

```xml
<DataGrid ItemsSource="{Binding Items}" AutoGenerateColumns="False">
    <DataGrid.Columns>
        <DataGridTextColumn Header="Item Name" Binding="{Binding Name}" Width="*" />
        <DataGridTextColumn Header="Value" Binding="{Binding Value, StringFormat=C}" Width="100" />
        <DataGridCheckBoxColumn Header="In Stock" Binding="{Binding InStock}" Width="70" />
    </DataGrid.Columns>
</DataGrid>
```

Three columns, in the exact order declared, each with a real,
human-readable header — `"Item Name"` rather than the reflected
`"Name"` — and the currency `StringFormat=C` from Lesson 17 applied
directly to the `Value` column. Reordering the three `<DataGridTextColumn>`/
`<DataGridCheckBoxColumn>` elements in the XAML, with no other change,
reorders the visible columns identically — direct proof column order is
driven purely by declaration order, the same principle `StackPanel`
(Lesson 11) already proved for its children.

### Discard

Nothing here is disposable — explicit columns are the real, standard
shape used for the rest of this series wherever a `DataGrid` appears.

### Mechanical Walkthrough

- `AutoGenerateColumns="False"` — **(b) hard concept reappearing**,
  turning off the previous unit's reflection-based behavior.
- `<DataGrid.Columns>` — **(b) hard concept reappearing**,
  property-element syntax (Lesson 10) applied to `Columns`.
- `<DataGridTextColumn Header="Item Name" Binding="{Binding Name}"
  Width="*" />` — **(a) first appearance** as this lesson's subject:
  `Header` — the real, human-chosen column title; `Binding` — **(b)
  hard concept reappearing**, the identical `{Binding}` mechanism from
  Lesson 14, here scoped per-column rather than per-element; `Width="*"`
  — **(b) hard concept reappearing**, `Grid`'s own star-sizing syntax
  (Lesson 11), reused here for column width.
- `<DataGridCheckBoxColumn Header="In Stock" Binding="{Binding
  InStock}" Width="70" />` — **(a) first appearance** of this specific
  column type: a real `CheckBox` (Lesson 12) rendered per cell, bound to
  a `bool` property.

## Concept Unit: When an Edit Actually Commits

### The Problem

Lesson 14 proved a `TextBox`'s `TwoWay` binding, by default, only writes
back on `LostFocus`, and can be switched to write back on every
keystroke via `UpdateSourceTrigger=PropertyChanged`. Does an editable
`DataGrid` cell follow either of those same rules, or something else
entirely?

### Introduce the Concept in Isolation

```xml
<DataGrid ItemsSource="{Binding Items}" AutoGenerateColumns="False" IsReadOnly="False">
    <DataGrid.Columns>
        <DataGridTextColumn Header="Item Name" Binding="{Binding Name}" />
    </DataGrid.Columns>
</DataGrid>
```

With a `PropertyChanged` handler temporarily attached to a real `Item`
(the exact `INotifyPropertyChanged` pattern from Lesson 14, printing
whenever `Name` changes), typing several characters into an open grid
cell — **without** pressing Enter, Tab, or clicking away — produces
**zero** printed change notifications, even mid-edit. Only pressing
Enter, pressing Tab, or clicking a different row prints the
notification, once, with the full final text. This proves the real,
different rule: a `DataGridTextColumn`'s edit commits on a real,
discrete **commit point** — not continuously, the way
`UpdateSourceTrigger=PropertyChanged` made a plain `TextBox` behave in
Lesson 14.

### Discard

This proof is disposable.

### Mechanical Walkthrough

- `IsReadOnly="False"` — **(a) first appearance.** The grid-wide default
  is genuinely editable already; writing it explicitly here is for
  clarity, not because it changes the previous unit's behavior.
- The real commit-point behavior — proven above — is this unit's entire
  point; no new syntax is introduced beyond `IsReadOnly` itself.

### SE Lens

The real reason `DataGrid` doesn't default to per-keystroke commits the
way a `TextBox` *can* be configured to: a grid cell mid-edit is a
genuinely different interaction shape than a standalone text field —
committing on every keystroke while a user is still typing into one cell
of a large, possibly filtered/sorted (Lesson 19) grid risks re-triggering
that filter/sort mid-edit, visibly moving the row the user is still
typing into. Committing only at a real, deliberate boundary (Enter, Tab,
row change) avoids that entirely, at the honest cost that live,
per-character reactions (a running character count, say) are genuinely
harder to build against grid cells than against a plain `TextBox`.

## Connect the pieces

One trace: `AutoGenerateColumns` builds columns via reflection — fast,
and proven to expose every public property with no control over
headers or order. Explicit `DataGridTextColumn`/`DataGridCheckBoxColumn`
entries, declared in `DataGrid.Columns`, give real control — friendly
headers, chosen order, per-column formatting via the same
`{Binding, StringFormat=...}` syntax from Lesson 17 — at the cost of one
column declared per real column wanted. Editing a cell commits at a
real, discrete boundary — proven directly by a `PropertyChanged`
listener staying silent mid-keystroke and firing exactly once, on
commit — a genuinely different rule than a plain `TextBox`'s tunable
`UpdateSourceTrigger`.

## What breaks without this

Set `IsReadOnly="True"` at the grid level while leaving a specific
column with its own `IsReadOnly="False"` set directly on it, attempting
to make just that one column editable inside an otherwise read-only
grid:

```xml
<DataGrid IsReadOnly="True" ...>
    <DataGridTextColumn IsReadOnly="False" ... />
</DataGrid>
```

Real, observed result: **the grid-level setting wins** — that column
stays uneditable, despite its own explicit `IsReadOnly="False"`. Direct,
provable proof `IsReadOnly` isn't simply "most specific setting wins";
the grid-level value acts as a hard ceiling, and a per-column override
can only narrow editability *further* (`IsReadOnly="True"` on one column
inside an otherwise-editable grid genuinely does lock just that column),
never loosen it back up.

## Exercises

1. Reproduce the grid-level/column-level `IsReadOnly` precedence from
   the What Breaks section yourself, then flip it — `IsReadOnly="False"`
   at the grid level, `IsReadOnly="True"` on one specific column —
   confirming this direction genuinely does work, isolating exactly one
   column as uneditable inside an otherwise-editable grid.
2. Add a `DataGridComboBoxColumn` (a real dropdown per cell, matching
   `ComboBox` from Lesson 12) bound to a `Category` property, with
   `ItemsSource` pointing at a small fixed list of category strings.
   Confirm selecting a value in one row's dropdown commits immediately
   on selection, not requiring a separate Tab/Enter the way the text
   column did.

## Definition of Done

- [ ] You confirmed `AutoGenerateColumns` builds real columns via
      reflection, including its literal, unfriendly header text.
- [ ] You built explicit columns with real headers, order, and
      formatting.
- [ ] You confirmed a text cell's edit commits only at Enter/Tab/row
      change, not per keystroke, using a real `PropertyChanged` listener.
- [ ] You reproduced the `IsReadOnly` precedence rule in both
      directions.
- [ ] You completed both exercises.

## Next

[Lesson 21 — Dialogs and Windows](lesson-21-dialogs-and-windows.md)
covers `MessageBox`, real file pickers, and secondary windows — modal
vs. modeless, and how a closed child window hands data back to whoever
opened it.
