# Lesson 28: Gone From View, Not Gone From the Database

*(`IsArchived`, a second, independent `ICollectionView`)*

**User Story**
> As a user, I want to archive items instead of permanently deleting
> them, and bring them back later if I change my mind.

**What you will build**
Lesson 22 built real, permanent deletion, deliberately, with a real
confirmation dialog. This lesson adds a second, softer option:
archiving — an item disappears from the main grid, but stays completely
intact in the database, recoverable with one click, until someone
chooses the permanent option explicitly. Both stay available; this
lesson doesn't remove Lesson 22's real Delete, it gives users a real
choice between two genuinely different guarantees.

**What you need to know first:** Lesson 17: `ICollectionView`,
`CollectionViewSource.GetDefaultView`. Lesson 19/20: `Filter`, combined
predicates. Lesson 22: real, permanent `DeleteItemFromDatabase`.

**Terms introduced in this lesson:**
- **Soft delete** — marking a row as removed (a `bool` flag) without
  actually deleting it; the row survives, just hidden from normal views.
- **Hard delete** — an actual `DELETE`, permanent, unrecoverable; what
  Lesson 22 already built.
- **`ListCollectionView`** — a concrete `ICollectionView` implementation
  that can be constructed directly, giving a genuinely independent view
  over a collection, distinct from the one `CollectionViewSource.GetDefaultView`
  always returns.

**Objects and methods used**
- **`ListCollectionView`**
  - *What it is:* a concrete `ICollectionView` implementation that can
    be constructed directly, giving a genuinely independent view over a
    collection — distinct from the one, shared view
    `CollectionViewSource.GetDefaultView` always returns for a given
    source.
  - *Implementation:* `System.Windows.Data.ListCollectionView`,
    constructed with `new ListCollectionView(items)`, implementing
    `ICollectionView` (Lesson 17) the same as the default view does —
    its own `Filter`, `SortDescriptions`, and `GroupDescriptions` are
    completely separate from any other view over the same source.
  - *Its use:* a second, real, independent view over `Items` — one
    showing active items, the other archived ones — proven this
    lesson, with `ReferenceEquals`, to genuinely be two different
    objects. Full lab, real output, and both lenses in this lesson's
    own Concept Unit.

**Everything else in the file, not this lesson's subject but still
explained**
- **`ICollectionView` / `Filter`**
  - *What they are:* the interface a bound view implements, and the
    property that narrows which items in it are currently visible.
  - *Implementation:* full treatment already given in
    `Lesson-17-collectionviewsource-and-grouping.md` and
    `Lesson-19-predicates-and-live-search.md`.
  - *Its use:* both `ListCollectionView`s this lesson builds use
    `Filter` to show only active or only archived items, respectively.
- **`MessageBox.Show`**
  - *What it is:* opens a real, modal system dialog box.
  - *Implementation:* full treatment already given in
    `Lesson-22-modal-dialogs-and-messageboxresult.md`.
  - *Its use:* confirms restoring an archived item, the same pattern as
    Lesson 22's delete confirmation.

---

## Concept Unit: A Second, Independent `ICollectionView`

### The Problem

`GroupedItems` (Lesson 17) is the *one* view `CollectionViewSource.GetDefaultView(Items)`
has ever returned — calling it again returns the exact same cached
object, not a fresh one. Showing archived items separately, filtered
oppositely from the main grid, needs a second view with its own,
independent `Filter`.

### Introduce the Concept in Isolation
```bash
dotnet new wpf -o lab-archive
```

Replace `MainWindow.xaml`'s `Grid` contents:

```xml
<StackPanel Loaded="StackPanel_Loaded" />
```

Replace `MainWindow.xaml.cs`'s contents:

```csharp
using System.Collections.ObjectModel;
using System.ComponentModel;
using System.Windows;
using System.Windows.Data;

namespace lab_archive
{
    public class Item
    {
        public string Name { get; set; } = string.Empty;
        public bool IsArchived { get; set; }
    }

    public partial class MainWindow : Window
    {
        public ObservableCollection<Item> Items { get; } = new ObservableCollection<Item>
        {
            new Item { Name = "Hammer", IsArchived = false },
            new Item { Name = "Old Drill", IsArchived = true },
            new Item { Name = "Wrench", IsArchived = false },
            new Item { Name = "Broken Saw", IsArchived = true }
        };

        public ICollectionView ActiveView { get; }
        public ICollectionView ArchivedView { get; }

        public MainWindow()
        {
            InitializeComponent();

            ActiveView = CollectionViewSource.GetDefaultView(Items);
            ActiveView.Filter = entry => !((Item)entry).IsArchived;

            ArchivedView = new ListCollectionView(Items) { Filter = entry => ((Item)entry).IsArchived };

            DataContext = this;
        }

        private void StackPanel_Loaded(object sender, RoutedEventArgs e)
        {
            Console.WriteLine("ActiveView (not archived):");
            foreach (object entry in ActiveView)
            {
                Console.WriteLine($"  {((Item)entry).Name}");
            }

            Console.WriteLine("ArchivedView (archived only):");
            foreach (object entry in ArchivedView)
            {
                Console.WriteLine($"  {((Item)entry).Name}");
            }

            Console.WriteLine($"Are ActiveView and ArchivedView the same object? {ReferenceEquals(ActiveView, ArchivedView)}");

            Items[0].IsArchived = true;
            ActiveView.Refresh();
            ArchivedView.Refresh();

            Console.WriteLine("After archiving 'Hammer':");
            Console.WriteLine("ActiveView (not archived):");
            foreach (object entry in ActiveView)
            {
                Console.WriteLine($"  {((Item)entry).Name}");
            }
            Console.WriteLine("ArchivedView (archived only):");
            foreach (object entry in ArchivedView)
            {
                Console.WriteLine($"  {((Item)entry).Name}");
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
ActiveView (not archived):
  Hammer
  Wrench
ArchivedView (archived only):
  Old Drill
  Broken Saw
Are ActiveView and ArchivedView the same object? False
After archiving 'Hammer':
ActiveView (not archived):
  Wrench
ArchivedView (archived only):
  Hammer
  Old Drill
  Broken Saw
```

#### Execution Trace

1. `ActiveView`'s `foreach` walks all four `Items`, keeping only those
   its `Filter` (`!IsArchived`) returns `true` for: `Hammer` and
   `Wrench` print; `Old Drill` and `Broken Saw` (both `IsArchived: true`)
   are silently skipped.
2. `ArchivedView`'s `foreach` walks the exact same four `Items`, its own
   `Filter` (`IsArchived`) keeping the opposite two: `Old Drill` and
   `Broken Saw` print.
3. `Items[0].IsArchived = true` mutates `"Hammer"` in place — the one
   object both views already reference; neither view's own output
   changes yet, because nothing has told either to re-check.
4. `ActiveView.Refresh()` and `ArchivedView.Refresh()` run — each
   re-applies its own `Filter` against the current state of every item.
5. `ActiveView`'s second `foreach` now visits only `Wrench` — `Hammer`
   no longer passes `!IsArchived`. `ArchivedView`'s second `foreach` now
   visits `Hammer`, `Old Drill`, and `Broken Saw` — `Hammer` newly
   passes `IsArchived`, joining the two that already did.

*What this proves:* `ActiveView` and `ArchivedView` are genuinely two
different objects (`ReferenceEquals` reports `False`), each wrapping the
exact same four-item `Items` collection with opposite `Filter`
conditions — every item appears in exactly one of the two views, never
both, never neither. Setting `Items[0].IsArchived = true` and calling
`.Refresh()` on both moves `"Hammer"` from `ActiveView` to `ArchivedView`
live — the same underlying object, now filtered differently, because the
one fact that changed (`IsArchived`) is exactly what each view's
`Filter` checks.

### Discard the Throwaway Example
Delete the `lab-archive` folder. `ListCollectionView` and the two-views
pattern are not discarded — the real project's Archive view uses exactly
this next.

### Mechanical Walkthrough

- `ActiveView = CollectionViewSource.GetDefaultView(Items);` —
  reappearing (Lesson 17), the *one* default view this project has
  used until now.
- `ArchivedView = new ListCollectionView(Items) { Filter = ... };` —
  **first appearance of `ListCollectionView`, constructed directly.**
  `GetDefaultView` always returns the same cached object per collection
  (confirmed back in Lesson 17's own exploration); `new ListCollectionView(Items)`
  is how to get a second, genuinely independent one, still wrapping the
  identical `Items` collection.
- `.Refresh()` — (first appearance) — forces a view to re-run its
  `Filter`/`SortDescriptions`/`GroupDescriptions` against its source
  collection right now; needed here because changing a plain property
  on an `Item` (`IsArchived`) doesn't automatically tell either view
  anything changed — unlike `ObservableCollection<T>` itself raising a
  change notification when an item is *added or removed*, a property
  changing *on* one of its existing items is invisible to the collection
  unless something explicitly asks the view to re-check.

### CS Lens

Two `ICollectionView`s over one collection is the same "one data source,
many presentations" principle Lesson 17 first established for grouping —
extended here from "the same data, organized differently" to "the same
data, *partitioned* into two mutually exclusive views." Nothing about
`Items` itself changed to make this possible; the capability was always
there, in `ICollectionView`'s own design.

### SE Lens

Why does moving an item between views require an explicit `.Refresh()`
call, rather than happening automatically the instant `IsArchived`
changes? Because a view has no way to know, in general, which properties
a `Filter` function depends on — `Filter` is an arbitrary function,
opaque to WPF. `INotifyPropertyChanged` (Lesson 7) tells a *binding*
which property changed by name; a `Filter` delegate gives no such
information back. `.Refresh()` is the honest, manual bridge: "something
that might affect filtering just changed — re-check everything." A more
advanced feature, live shaping (`IsLiveFilteringRequested`), can automate
this for specific named properties — genuinely useful, and deliberately
out of scope here in favor of the simpler, explicit call.

### Connection

The real `ArchivedItems` view, filtering the same `Items` collection this
project has always had, is built exactly this way next.

---

## Concept Unit: Growing the Schema — `IsArchived`

### The Problem

`InventoryItem` needs a real, persisted fact: has this item been
archived?

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:** `InventoryItem.cs`, `InventoryViewModel.cs`
  (schema/load/save methods).
- **Change type:** Add.

### The New Code — `InventoryItem` Growth

```csharp
private bool isArchived;

public bool IsArchived
{
    get { return isArchived; }
    set
    {
        isArchived = value;
        PropertyChanged?.Invoke(this, new PropertyChangedEventArgs(nameof(IsArchived)));
    }
}
```

### The New Code — the Table Shape

```csharp
command.CommandText = "... IsFavorite INTEGER NOT NULL, SupplierId INTEGER NOT NULL DEFAULT 3, SerialNumber TEXT NOT NULL, IsArchived INTEGER NOT NULL DEFAULT 0, FOREIGN KEY (SupplierId) REFERENCES Suppliers(Id))";
```

### Mechanical Walkthrough

- `private bool isArchived;` / `public bool IsArchived { get; set; ... }`
  — reappearing exactly (`IsFavorite`'s own shape, Lesson 15) — a second
  `bool` on this class, defaulting correctly to `false` with no
  initializer, the same reasoning already established there.
- `IsArchived INTEGER NOT NULL DEFAULT 0` — reappearing (`IsFavorite`'s
  own `0`/`1` SQLite convention, Lesson 15), `DEFAULT 0` this time
  because it's added to an existing table shape — every item, old or
  new, should default to "not archived" unless explicitly changed.

### CS Lens

Nothing new mechanically — direct reuse of `IsFavorite`'s already-proven
`bool`-in-SQLite pattern, the payoff of naming that pattern explicitly
back in Lesson 15 instead of treating it as a one-off.

### SE Lens

Why give `IsArchived` its own dedicated column instead of, say, reusing
`Notes` with a special marker string to mean "archived"? Because a
special-cased string is exactly the kind of convention this project has
consistently rejected — `enum Category` over free text (Lesson 12),
`DateTime?` over a sentinel date (Lesson 14) — a real, typed `bool`
column is the same commitment applied here: "archived" is a genuine,
first-class fact about an item, queryable directly
(`WHERE IsArchived = 1`), not a string a future reader would need to
know to specifically look for.

### Connection

The Delete button's real behavior changes to use this next.

---

## Concept Unit: Archiving Instead of Deleting

### The Problem

Lesson 22's Delete permanently removes a row — exactly what a
destructive-action confirmation is *for*, but not what every removal
actually needs. This project now offers both: Archive (soft, reversible)
as the default action, and a genuine, permanent Delete kept available
from the Archive view itself.

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:** `InventoryPage.xaml`, `InventoryViewModel.cs`.
- **Change type:** Modify/Add.
- **Dependencies:** `IsArchived`, previous unit; `DeleteButton_Click`,
  Lesson 22; `ApplyFilter`, Lesson 20.

### The New Code — the Button (Renamed)

```xml
<Button Content="Archive"
        Style="{StaticResource ToolbarButtonStyle}"
        Margin="12,0,0,0"
        Click="ArchiveButton_Click" />
```

### The New Code — Archiving

```csharp
private void ArchiveButton_Click(object sender, RoutedEventArgs e)
{
    InventoryViewModel viewModel = (InventoryViewModel)DataContext;
    if (viewModel.SelectedItem is not InventoryItem selected)
    {
        return;
    }

    viewModel.ArchiveItem(selected);
}
```

```csharp
public void ArchiveItem(InventoryItem item)
{
    item.IsArchived = true;
    UpdateItemInDatabase(item);
    GroupedItems.Refresh();
    ArchivedItems.Refresh();
}
```

### The New Code — the Main View's Filter

```csharp
public void ApplyFilter(string searchText, Category? categoryFilter, bool favoritesOnly)
{
    GroupedItems.Filter = new Predicate<object>(entry =>
    {
        InventoryItem item = (InventoryItem)entry;
        bool matchesSearch = item.Name.Contains(searchText, StringComparison.OrdinalIgnoreCase);
        bool matchesCategory = categoryFilter == null || item.Category == categoryFilter;
        bool matchesFavorite = !favoritesOnly || item.IsFavorite;
        return matchesSearch && matchesCategory && matchesFavorite && !item.IsArchived;
    });
}
```

### Mechanical Walkthrough

- `viewModel.ArchiveItem(selected);` — no confirmation dialog. Worth
  naming directly: this is the entire point of offering both actions —
  Archive is reversible, so it doesn't need the same deliberate pause
  Lesson 22's permanent Delete does.
- `item.IsArchived = true; UpdateItemInDatabase(item);` — reappearing
  (`UpdateItemInDatabase`, Lesson 21), reused here for the first time to
  persist a single-field change rather than a full form edit — the same
  method, a different real use.
- `GroupedItems.Refresh(); ArchivedItems.Refresh();` — reappearing
  (this lesson's first unit), both views refreshed together, since one
  item just became invisible in one and visible in the other.
- `&& !item.IsArchived` — appended to `ApplyFilter`'s existing chain —
  reappearing exactly (Lesson 20's `&&`-composition), a fourth condition
  joining the three already there, changing nothing about how the first
  three work.

### CS Lens

Reusing `UpdateItemInDatabase` for a single-field change is direct proof
that a general, well-designed method doesn't need to know how many
fields actually changed — it always writes every column, whether one
value changed or seven, the same "the method doesn't need special cases"
principle Lesson 21's own comparison of `Items[index] = NewItemDraft`
against field-by-field mutation already made.

### SE Lens

This lesson's own glossary names the real tradeoff directly: **soft
delete vs. hard delete — recoverability vs. unbounded storage growth.**
Archiving forever means the database never actually shrinks — every item
ever archived stays, permanently, taking up real (if small) space. Hard
delete (Lesson 22, still available) actually reclaims that space, at the
cost of being irreversible. Neither is universally correct; offering
both, honestly, is this project's actual answer, rather than picking one
and hiding the other's real cost.

### Connection

The Archive view itself, and Restore, are built next.

---

## Concept Unit: An Archive View and Restoring an Item

### The Problem

Archived items are hidden, but nothing lets a user see them again, bring
one back, or permanently delete one they're now sure about.

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:** `InventoryPage.xaml`, `InventoryViewModel.cs`.
- **Change type:** Add.
- **Dependencies:** `ListCollectionView`, first unit;
  `DeleteItemFromDatabase`, Lesson 22.

### The New Code — the ViewModel

```csharp
public ICollectionView ArchivedItems { get; }
public RelayCommand RestoreCommand { get; }

// In the constructor, alongside GroupedItems:
ArchivedItems = new ListCollectionView(Items) { Filter = entry => ((InventoryItem)entry).IsArchived };

RestoreCommand = new RelayCommand(
    execute: _ => RestoreItem(SelectedItem!),
    canExecute: _ => SelectedItem?.IsArchived == true);

public void RestoreItem(InventoryItem item)
{
    item.IsArchived = false;
    UpdateItemInDatabase(item);
    GroupedItems.Refresh();
    ArchivedItems.Refresh();
}
```

`SelectedItem`'s own `set` block (Lesson 23) now also calls
`RestoreCommand.RaiseCanExecuteChanged();`, alongside `DeleteCommand`'s.

### The New Code — the Toggle and Restore Button

```xml
<CheckBox x:Name="ShowArchivedBox"
          Content="Show Archived"
          Margin="12,0,0,0"
          VerticalAlignment="Center"
          Checked="ShowArchivedBox_Changed"
          Unchecked="ShowArchivedBox_Changed" />
<Button Content="Restore"
        Style="{StaticResource ToolbarButtonStyle}"
        Margin="12,0,0,0"
        Command="{Binding RestoreCommand}" />
```

```csharp
private void ShowArchivedBox_Changed(object sender, RoutedEventArgs e)
{
    InventoryViewModel viewModel = (InventoryViewModel)DataContext;
    ItemsGrid.ItemsSource = ShowArchivedBox.IsChecked == true
        ? viewModel.ArchivedItems
        : viewModel.GroupedItems;
}
```

### Mechanical Walkthrough

- `new ListCollectionView(Items) { Filter = ... }` — reappearing exactly
  (this lesson's first unit), now the real `ArchivedItems`.
- `ItemsGrid.ItemsSource = ... ? viewModel.ArchivedItems : viewModel.GroupedItems;`
  — (first appearance of swapping a control's `ItemsSource` in
  code-behind, rather than through a binding) — `ItemsGrid` itself
  doesn't change; only *which* `ICollectionView` it's currently pointed
  at does, live, the moment the checkbox toggles.
- `canExecute: _ => SelectedItem?.IsArchived == true` — reappearing
  (`RelayCommand`'s `canExecute` delegate, Lesson 23) — the Restore
  button visibly disables itself for a non-archived selection, the
  identical automatic-`IsEnabled` payoff `AddCommand`/`DeleteCommand`
  already demonstrated, rather than needing a separate, unexplained
  mechanism to hide or show it based on which view is active.
- `RestoreItem` — the exact mirror of `ArchiveItem`, `IsArchived` flipped
  the other direction, both views refreshed the same way — worth seeing
  as confirmation, not new material: the same operation, reversed.

### CS Lens

Swapping `ItemsGrid.ItemsSource` between two different `ICollectionView`s
at runtime is the clearest possible demonstration of this project's
long-running theme, first stated explicitly back in Lesson 16: **the
control never cares what specific data it's showing** — only that
whatever it's pointed at implements the shapes it expects
(`IEnumerable`, in this case). Swapping the source is a one-line
assignment, not a structural change to the grid itself.

### SE Lens

Why does `Restore` skip a confirmation dialog, the same as `Archive`,
while permanent deletion (reachable from the Archive view, reusing
Lesson 22's existing confirmed `DeleteButton_Click`/`DeleteCommand`
unchanged) still requires one? Because `Restore` and `Archive` are both
fully reversible — undoing an accidental click of either just means
clicking the other. Permanent deletion has no undo at all, which is the
entire, consistent reason this project has confirmed it since Lesson 22
and continues to here.

### Commands Needed

```bash
dotnet run
```

### Run It

On your Windows machine: select an item, click Archive — it disappears
from the main grid immediately, with no confirmation. Check "Show
Archived" — the same grid now shows only archived items, including the
one just archived. Select it, click Restore — it disappears from the
archive view and reappears in the main grid the moment the checkbox is
unchecked. From the Archive view, select an item and use the existing
Delete button — the real, permanent confirmation dialog from Lesson 22
still appears, and confirming actually removes it, this time for good.

### Connection

This project now offers a real, honest choice between recoverable and
permanent removal. The next lesson gives borrowed items a similarly
explicit state — not just archived or not, but a small, real sequence of
valid states a borrowed item moves through.

---

## Closing

### Connect the Pieces

Clicking Archive sets `IsArchived = true` on the selected item and
persists it via the existing `UpdateItemInDatabase` (third unit), then
refreshes both `GroupedItems` and `ArchivedItems` — two genuinely
independent `ICollectionView`s (proven with real, contrasting output in
this lesson's first unit) wrapping the identical `Items` collection with
opposite `Filter` conditions. Toggling "Show Archived" simply repoints
`ItemsGrid.ItemsSource` at whichever view is currently relevant (fourth
unit) — the grid control itself never changes. Restoring reverses the
exact same operation; permanent deletion, when it's genuinely wanted,
still runs through Lesson 22's original, confirmed, irreversible path,
completely unchanged.

### What Breaks Without This

Temporarily remove the `ArchivedItems.Refresh();` call from `ArchiveItem`
(leaving `GroupedItems.Refresh();` in place) and rerun. Archive an item,
then immediately check "Show Archived." Real, representative failure:
the item is correctly gone from the main grid, but doesn't appear in the
Archive view either — `ArchivedItems`'s own `Filter` was never told to
re-run, so it's still showing whatever it last computed, before this
item became archived. The item is, for a moment, in neither view — not
lost (a `LoadItemsFromDatabase` on next launch would find it correctly),
but genuinely inaccessible from the running app until something else
happens to trigger a refresh. Restore the real `ArchivedItems.Refresh();`
call afterward.

### Exercises

- In the `lab-archive` throwaway pattern, archive a second item and
  confirm, with real output, that both `ActiveView` and `ArchivedView`
  correctly reflect all four items' current states after refreshing.
- Predict, in your own words, what would show in `ArchivedItems`
  immediately after `RestoreItem` runs, *before* `ArchivedItems.Refresh()`
  is called — then confirm by temporarily removing that one line and
  observing the real, stale result.
- Add a "Permanently delete all archived items older than today" cleanup
  action (a real `DELETE FROM Items WHERE IsArchived = 1`, no per-row
  loop needed) — run it against a database with at least one archived
  item, and confirm with a real `SELECT` that only archived rows were
  affected.

### Definition of Done

- [ ] `IsArchived` (`bool`) exists on `InventoryItem` and persists
      correctly.
- [ ] Archiving an item hides it from the main grid without deleting it
      from the database.
- [ ] "Show Archived" reveals archived items in the same grid, via a
      genuinely independent `ICollectionView`.
- [ ] Restoring an archived item returns it to the main grid.
- [ ] Permanent deletion, from the Archive view, still requires the real
      confirmation dialog from Lesson 22 and is genuinely irreversible.
- [ ] You reproduced the missing-refresh bug on purpose, confirmed an
      archived item can briefly vanish from both views, and restored the
      real `ArchivedItems.Refresh()` call.
- [ ] Committed with a message stating why: for example,
      `git commit -m "Add archive/restore as a reversible alternative to permanent delete"`.
