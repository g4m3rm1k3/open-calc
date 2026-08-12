# Lesson 42: More Than One, at Once

*(`DataGrid.SelectionMode`, `SelectedItems`)*

**User Story**
> As a user, I want to select multiple items at once, so I can act on
> all of them together.

**What you will build**
Real multi-row selection — Ctrl-click and Shift-click, both visibly
highlighting several rows at once — and a way to read exactly which
items are currently selected. This lesson is deliberately setup only:
nothing acts on the selection yet (Lesson 43 does), but getting a real,
correctly-typed handle on "everything currently selected" is worth its
own lesson before building anything on top of it.

**What you need to know first:** Lesson 16: `DataGrid`,
`SelectionChanged`. Lesson 21: `ItemsGrid.SelectedItem` (singular),
the direct contrast this lesson draws against.

**Terms introduced in this lesson:**
- **`SelectionMode`** — controls whether a selectable control allows one
  selected item (`Single`) or several at once (`Extended`, supporting
  Ctrl-click and Shift-click).
- **`SelectedItems`** — the plural counterpart to `SelectedItem`; a
  real, live collection of every currently selected row.
- **`IList`** (non-generic) — the actual shape `SelectedItems` returns:
  a collection of plain `object`s, not a strongly-typed
  `IList<InventoryItem>`.

**Objects and methods used**
- **`DataGrid.SelectionMode`**
  - *What it is:* controls whether a selectable control allows one
    selected item or several at once.
  - *Implementation:* an enum-backed property; `Single` allows one row,
    `Extended` (proven this lesson to already be `DataGrid`'s own real
    default) supports Ctrl-click and Shift-click for multiple.
  - *Its use:* confirmed, not assumed — this lesson's own real proof
    that multi-selection already worked before any code changed it.
- **`SelectedItems` / `IList`**
  - *What they are:* the plural counterpart to `SelectedItem` — a real,
    live collection of every currently selected row — and the actual,
    non-generic collection type it returns.
  - *Implementation:* `DataGrid.SelectedItems` returns
    `System.Collections.IList`, a collection of plain `object`s, not a
    strongly-typed `IList<InventoryItem>` — each element needs an
    explicit cast to use as a real `InventoryItem`.
  - *Its use:* this lesson's own real, correctly-typed handle on
    "everything currently selected," proven with 2 of 3 lab items
    selected, deliberately built with nothing yet acting on it (Lesson
    43 does). Full lab, real output, and both lenses in this lesson's
    own Concept Unit.

**Everything else in the file, not this lesson's subject but still
explained**
- **`SelectedItem` / `DataGrid`**
  - *What they are:* the property holding one currently-selected item,
    and the table control this lesson extends.
  - *Implementation:* full treatment already given in
    `Lesson-08-selecteditem-and-two-way-binding.md` and
    `Lesson-16-the-datagrid-control.md`.
  - *Its use:* named here only as the direct, singular contrast this
    lesson's plural `SelectedItems` is drawn against.

---

## Concept Unit: `SelectedItems` — a Real, Non-Generic `IList`

### The Problem

`ItemsGrid.SelectedItem` (Lesson 21) only ever holds *one* item. Acting
on several rows at once needs a way to see the *whole* current
selection, not just the most recently clicked row.

### Introduce the Concept in Isolation
```bash
dotnet new wpf -o lab-multiselect
```

Replace `MainWindow.xaml`'s `Grid` contents:

```xml
<StackPanel Loaded="StackPanel_Loaded">
    <DataGrid x:Name="Grid1" AutoGenerateColumns="True" />
</StackPanel>
```

Replace `MainWindow.xaml.cs`'s contents:

```csharp
using System.Collections;
using System.Collections.ObjectModel;
using System.Windows;

namespace lab_multiselect
{
    public class Item
    {
        public string Name { get; set; } = string.Empty;
    }

    public partial class MainWindow : Window
    {
        public ObservableCollection<Item> Items { get; } = new ObservableCollection<Item>
        {
            new Item { Name = "A" },
            new Item { Name = "B" },
            new Item { Name = "C" },
        };

        public MainWindow()
        {
            InitializeComponent();
            Grid1.ItemsSource = Items;
        }

        private void StackPanel_Loaded(object sender, RoutedEventArgs e)
        {
            Console.WriteLine($"Default DataGrid.SelectionMode: {Grid1.SelectionMode}");

            Grid1.SelectedItems.Add(Items[0]);
            Grid1.SelectedItems.Add(Items[2]);

            IList selected = Grid1.SelectedItems;
            Console.WriteLine($"SelectedItems.Count: {selected.Count}");
            Console.WriteLine($"SelectedItems type: {selected.GetType().Name}");
            foreach (object item in selected)
            {
                Console.WriteLine($"  Selected: {((Item)item).Name}");
            }
        }
    }
}
```

Run it on your Windows machine:

```bash
dotnet run
```

Real output:

```text
Default DataGrid.SelectionMode: Extended
SelectedItems.Count: 2
SelectedItems type: SelectedItemCollection
  Selected: A
  Selected: C
```

#### Execution Trace

1. `Grid1.SelectedItems.Add(Items[0])` adds `"A"` to the selection —
   `Count` becomes `1`.
2. `Grid1.SelectedItems.Add(Items[2])` adds `"C"` — `Count` becomes `2`;
   `Items[1]` (`"B"`) was never added and stays unselected.
3. `Count` reads `2`, confirmed directly.
4. The `foreach` visits the first selected entry, `"A"`, printing
   `  Selected: A`.
5. The loop visits the second and last entry, `"C"`, printing
   `  Selected: C`, then stops — exactly the two items added, in the
   order they were added, `"B"` never appearing.

*What this proves:* `DataGrid.SelectionMode` is already `Extended` by
default — Ctrl-click and Shift-click multi-select already work in every
`DataGrid` this project has built since Lesson 16, with no explicit
setting required; worth confirming directly rather than assuming this
lesson's own subject needed enabling in the first place.
`Grid1.SelectedItems.Add(...)` (simulating what Ctrl-clicking two rows
would do) produces a real, live collection — `Count` reports exactly
`2`, and iterating it visits exactly the two items added, `"A"` and
`"C"`, skipping `"B"` entirely. Its real runtime type,
`SelectedItemCollection`, implements the plain, non-generic `IList` —
each `item` read out of the `foreach` arrives as `object`, needing an
explicit cast (`(Item)item`) back to a real type, the same "plural
selection is inherently loosely typed" fact this lesson's own glossary
names.

### Discard the Throwaway Example
Delete the `lab-multiselect` folder. `SelectedItems`/`IList` are not
discarded — the real project reads exactly this next.

### Mechanical Walkthrough

- `Grid1.SelectionMode` reporting `Extended` with no XAML setting at
  all — worth naming plainly: this lesson's own `SelectionMode` isn't
  strictly "new behavior" so much as "a real property worth setting
  explicitly, for clarity, even though its default already does what
  this project wants."
- `IList selected = Grid1.SelectedItems;` — **first appearance of
  `SelectedItems`.** The plural counterpart to `SelectedItem`
  (Lesson 21) — a real, live collection, not a single value.
- `foreach (object item in selected)` — **first appearance of iterating
  a plain, non-generic `IList`** in this project's real code — every
  other collection this project has iterated (`ObservableCollection<InventoryItem>`,
  `List<Supplier>`) has been strongly typed since its declaration;
  `SelectedItems` genuinely isn't, and each element needs an explicit
  cast.

### CS Lens

`IList` (non-generic) predates C# generics in .NET's own history — the
identical "this API predates generics and was never updated" fact
already named for `Enum.GetValues`'s own return type, `Array`, back in
Lesson 12. `SelectedItems` inherited this older, less-specific shape
because `DataGrid`/`ListBox`/every selectable WPF control shares one
common, general-purpose selection API, written once, long before
generics existed to make it more specific.

### SE Lens

Why does this project bother reading `SelectedItems` into a real,
strongly-typed `List<InventoryItem>` at all (the next unit does exactly
this), rather than just working with the raw `IList` directly wherever
a selection is needed? Because every real cast (`(InventoryItem)item`)
scattered through calling code is a small, repeated risk — a copy-paste
error casting to the wrong type would only surface at runtime, not
compile time. Converting once, at the boundary where `SelectedItems` is
first read, into a real `List<InventoryItem>` means every line of code
afterward gets genuine compile-time type safety back.

### Connection

The real `ItemsGrid.SelectedItems`, converted into a strongly-typed
list ready for bulk actions, is read exactly this way next.

---

## Concept Unit: Reading a Real Multi-Selection

### The Problem

`ItemsGrid` already allows multi-selection (proven in the previous
unit, already the default); nothing currently reads that selection into
a form the rest of this project can act on.

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:** `InventoryPage.xaml`, `InventoryViewModel.cs`.
- **Change type:** Add.
- **Dependencies:** `SelectedItems`, previous unit.

### The New Code — Being Explicit About `SelectionMode`

```xml
<DataGrid x:Name="ItemsGrid"
          SelectionMode="Extended"
          SelectionChanged="ItemsGrid_SelectionChanged"
          ...>
```

### The New Code — Reading the Selection

```csharp
private void ItemsGrid_SelectionChanged(object sender, SelectionChangedEventArgs e)
{
    InventoryViewModel viewModel = (InventoryViewModel)DataContext;
    viewModel.SelectedItem = ItemsGrid.SelectedItem as InventoryItem;
    DetailPanel.DataContext = ItemsGrid.SelectedItem;

    List<InventoryItem> selectedItems = new List<InventoryItem>();
    foreach (object item in ItemsGrid.SelectedItems)
    {
        selectedItems.Add((InventoryItem)item);
    }
    viewModel.SelectedItems = selectedItems;
}
```

```csharp
public List<InventoryItem> SelectedItems { get; set; } = new List<InventoryItem>();
```

### Mechanical Walkthrough

- `SelectionMode="Extended"` — reappearing (this lesson's first unit),
  written explicitly even though it matches the default — a small,
  deliberate act of documentation: any future reader sees this project's
  intent to support multi-select stated directly, rather than relying
  on an unstated default they'd have to already know.
- `foreach (object item in ItemsGrid.SelectedItems) { selectedItems.Add((InventoryItem)item); }`
  — reappearing (this lesson's first unit's exact iteration shape),
  applied for real — converts the loosely-typed `IList` into a genuine
  `List<InventoryItem>`, the boundary conversion this lesson's own SE
  Lens already justified.
- `public List<InventoryItem> SelectedItems { get; set; }` on the
  ViewModel — a plain, mutable property (no `INotifyPropertyChanged`
  announcement needed yet — nothing currently binds to it directly;
  Lesson 43 reads it only from code, the same reasoning `SupplierName`
  used back in Lesson 24 for a property that's written but never
  live-bound).

### CS Lens

This unit is a direct, worked example of **type narrowing at a
boundary** — `ItemsGrid.SelectedItems` (loosely typed `IList`, owned by
WPF) crosses into `viewModel.SelectedItems` (a real, strongly-typed
`List<InventoryItem>`, owned by this project's own model) at exactly
one point, `ItemsGrid_SelectionChanged`. Everywhere else in this
project that will ever read `SelectedItems`, it's already the real,
correct, compile-time-checked type.

### SE Lens

Why rebuild `selectedItems` from scratch on every single
`SelectionChanged` event, rather than trying to incrementally add/remove
from an existing list as the selection changes? Because
`SelectionChangedEventArgs` already tells WPF exactly which items were
added or removed from the selection, but tracking that incrementally
would mean this project's own list could drift out of sync with
`ItemsGrid`'s real selection if any edge case were missed. Rebuilding
completely, every time, directly from `ItemsGrid.SelectedItems` itself,
guarantees `viewModel.SelectedItems` is always exactly correct — the
same "ask the source of truth fresh, don't try to track it separately"
principle behind `TotalValue`'s own live database query (Lesson 30).

### Commands Needed

```bash
dotnet run
```

### Run It

On your Windows machine: click one row, then Ctrl-click a second and
third — all three highlight visibly. Shift-click a fourth row further
down the list — every row between the first click and this one
highlights too, standard `Extended` selection behavior. Nothing visible
happens beyond the highlighting yet — that's genuinely correct for this
lesson; `DetailPanel` still reflects only `SelectedItem` (the most
recent single click), and `viewModel.SelectedItems` now correctly holds
every highlighted row, ready for the next lesson to act on.

### Connection

A real, correctly-typed multi-selection now exists. The next lesson
finally does something with it: bulk edit and bulk delete, acting on
every selected item at once instead of one at a time.

---

## Closing

### Connect the Pieces

`ItemsGrid`'s `SelectionMode="Extended"` — already the real default,
proven directly in this lesson's own lab, written explicitly here as
documentation — lets a user Ctrl-click or Shift-click several rows.
Every selection change fires `ItemsGrid_SelectionChanged`, which now
also walks `ItemsGrid.SelectedItems` (the exact loosely-typed `IList`
this lesson's first unit proved with real output) and rebuilds
`viewModel.SelectedItems` as a genuine, strongly-typed
`List<InventoryItem>` — the one, single point where WPF's general-purpose
selection API converts into this project's own real model type.

### What Breaks Without This

Temporarily remove the `foreach` loop that populates
`viewModel.SelectedItems`, leaving the property permanently empty.
Select three rows and note (with a temporary debug line, or by
proceeding to Lesson 43's own bulk actions once built) that
`viewModel.SelectedItems.Count` stays `0` regardless of how many rows
are visibly highlighted. Real, representative failure: the UI looks
completely correct — three rows genuinely highlighted — while the
ViewModel's own idea of "what's selected" has silently stopped updating
entirely, a real, easy-to-miss disconnect between what a user sees and
what the code actually knows. Restore the real `foreach` loop
afterward.

### Exercises

- In the `lab-multiselect` throwaway pattern, select zero, then one,
  then three items in sequence (via direct `SelectedItems.Add`/`Clear`
  calls) and confirm, with real output, `Count` correctly reports `0`,
  `1`, and `3` at each step.
- Predict, in your own words, what `ItemsGrid.SelectedItem` (singular)
  reports when three rows are actually selected via Ctrl-click — is it
  `null`, the first one clicked, or the last? Confirm on the real,
  running app.
- Change `SelectionMode` to `Single` temporarily and confirm, on the
  real, running app, that Ctrl-click and Shift-click both stop
  multi-selecting — direct, hands-on proof of what the property
  actually controls, beyond just reading its default value.

### Definition of Done

- [ ] `ItemsGrid.SelectionMode="Extended"` is set explicitly.
- [ ] Ctrl-click and Shift-click both select multiple rows, visibly
      highlighted.
- [ ] `viewModel.SelectedItems` is rebuilt as a real, strongly-typed
      `List<InventoryItem>` on every `SelectionChanged` event.
- [ ] You reproduced the stale-empty-selection regression on purpose,
      confirmed the UI and the ViewModel can silently disagree, and
      restored the real conversion loop.
- [ ] Committed with a message stating why: for example,
      `git commit -m "Read a real, strongly-typed multi-selection from DataGrid.SelectedItems"`.
