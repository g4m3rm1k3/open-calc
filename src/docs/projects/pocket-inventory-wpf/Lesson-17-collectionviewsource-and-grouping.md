# Lesson 17: One Collection, Grouped Without Copying It

*(`CollectionViewSource`, `ICollectionView`, `GroupDescriptions`)*

**User Story**
> As a user, I want items grouped by category, so I can see everything in
> "Tools" together, everything in "Hardware" together, and so on.

**What you will build**
`ItemsGrid` currently shows one flat table. This lesson groups the exact
same data by `Category` — Tools together, Hardware together — without
creating a second collection, a second query, or a second copy of
anything. The mechanism WPF provides for this, `ICollectionView`, is
already sitting quietly behind every binding this project has ever made
to `Items`; this lesson makes it visible and puts it to work directly for
the first time.

**What you need to know first:** Lesson 7: `ObservableCollection<T>`,
`{Binding Items}`. Lesson 12: `enum Category`. Lesson 16: `DataGrid`,
`ItemsSource`.

**Terms introduced in this lesson:**
- **`ICollectionView`** — a wrapper WPF puts around any bound collection,
  responsible for sorting, filtering, grouping, and tracking "which item
  is currently selected" — none of which the raw collection itself knows
  anything about.
- **`CollectionViewSource`** — the entry point for getting a specific
  collection's `ICollectionView`; `CollectionViewSource.GetDefaultView(...)`
  returns the one WPF already created the first time that collection was
  bound to anything.
- **`GroupDescriptions`** — a property on `ICollectionView`: a list of
  rules (usually a single property name) describing how to partition the
  same underlying items into named groups, with no items moved, copied,
  or removed from the original collection.
- **Type pattern** (`is CollectionViewGroup group`) — tests an object's
  runtime type and, only if it matches, binds it to a new, correctly-
  typed variable, in one expression — distinct from a plain `(Type)`
  cast, which throws instead of returning `false` when the value turns
  out to be the wrong type. Full treatment, an isolated lab, and real
  verified output: `csharp-type-pattern-matching.md`.

**Objects and methods used**
- **`CollectionViewSource.GetDefaultView(object)`**
  - *What it is:* the entry point for getting a specific collection's
    `ICollectionView` — the one WPF already created and has been
    maintaining behind the scenes since that collection was first
    bound to anything.
  - *Implementation:* a `static` method on
    `System.Windows.Data.CollectionViewSource`. Not a new object each
    call — the *same* view, retrieved, every time it's called against
    the identical source collection.
  - *Its use:* `CollectionViewSource.GetDefaultView(Items)` — how this
    lesson gets a real, configurable `ICollectionView` over `Items`
    without constructing anything new.
- **`PropertyGroupDescription`**
  - *What it is:* one rule describing how to partition a collection's
    items into named groups, by a single property's own distinct
    values.
  - *Implementation:* `System.ComponentModel.PropertyGroupDescription`,
    constructed with the property name to group by (as a string, or —
    in the real project — `nameof(InventoryItem.Category)` for
    compile-time safety).
  - *Its use:* added to `GroupedItems.GroupDescriptions` — the one
    line that actually tells `ICollectionView` how to group `Items` by
    `Category`, with no items moved, copied, or removed from the
    original collection.
- **`ICollectionView`**
  - *What it is:* the interface itself — what `GetDefaultView(...)`
    actually returns, and what every property this lesson reads off it
    (`GroupDescriptions`, `Groups`) is really declared on.
  - *Implementation:* a real WPF interface
    (`System.ComponentModel.ICollectionView`, in `WindowsBase.dll`),
    implemented internally by `CollectionView` and its subclasses —
    confirmed against [Microsoft's own `ICollectionView` reference
    page](https://learn.microsoft.com/en-us/dotnet/api/system.componentmodel.icollectionview)
    this session. This lesson calls two of its real members — its
    actual declared shape, limited to those two, not the ~20-member
    interface in full:
    ```csharp
    public interface ICollectionView : IEnumerable, INotifyCollectionChanged
    {
        ObservableCollection<GroupDescription> GroupDescriptions { get; }
        ReadOnlyObservableCollection<object> Groups { get; } // null if no groups exist
    }
    ```
  - *Its use:* `GroupDescriptions` is written to (`.Add(...)`) to
    configure grouping; `Groups` is read afterward to see the result —
    same object, two different members, two different directions
    (write the rule in, read the outcome back out).
- **`CollectionViewGroup`**
  - *What it is:* the real object `ICollectionView.Groups` actually
    hands back for each group `GroupDescriptions` produces — not a
    plain string label, a full object.
  - *Implementation:* an `abstract` WPF class
    (`System.Windows.Data.CollectionViewGroup`, in `PresentationFramework.dll`)
    implementing `INotifyPropertyChanged` — confirmed against
    [Microsoft's own `CollectionViewGroup` reference page](https://learn.microsoft.com/en-us/dotnet/api/system.windows.data.collectionviewgroup)
    and its [`Items` property page](https://learn.microsoft.com/en-us/dotnet/api/system.windows.data.collectionviewgroup.items)
    this session. Its real declared shape, limited to the members this
    lesson actually reads:
    ```csharp
    public abstract class CollectionViewGroup : INotifyPropertyChanged
    {
        public object Name { get; }
        public int ItemCount { get; }
        public ReadOnlyObservableCollection<object> Items { get; }
        public bool IsBottomLevel { get; }
    }
    ```
    Being `abstract` means you never construct one directly — WPF's own
    grouping machinery builds the real, concrete instances internally;
    application code only ever reads one back, never creates one.
  - *Its use:* `Name` is what a group's own distinct value was (`"Orange"`),
    `ItemCount` is how many items landed in it — both read directly in
    this unit's own `foreach`, below. `Items`/`IsBottomLevel` aren't
    called anywhere in this lesson, included here so the shape shown
    isn't silently incomplete — `Items` is the read side of nested
    (multi-level) grouping, not used since this lesson only groups one
    level deep.

---

## Concept Unit: `ICollectionView` and `GroupDescriptions`

### The Problem

`Items` is a flat `ObservableCollection<InventoryItem>` — nothing about it
knows how to organize itself by `Category`. Building a *second* collection
— one dictionary keyed by category, say — would work, but would need to
be kept in sync with `Items` by hand, forever, the exact kind of manual
duplication this project has avoided since `INotifyPropertyChanged`
replaced `ItemListBox.Items.Clear()`/rebuild back in Lesson 7.

### Introduce the Concept in Isolation
```bash
dotnet new wpf -o lab-collectionview
```

Replace `MainWindow.xaml`'s `Grid` contents:

```xml
<StackPanel Loaded="StackPanel_Loaded">
    <DataGrid x:Name="ItemsGrid" ItemsSource="{Binding GroupedView}" AutoGenerateColumns="True" />
</StackPanel>
```

Replace `MainWindow.xaml.cs`'s contents:

```csharp
using System.Collections.ObjectModel;
using System.Windows;
using System.Windows.Data;

namespace lab_collectionview
{
    public class Cat
    {
        public string Name { get; set; } = string.Empty;
        public string Color { get; set; } = string.Empty;
    }

    public partial class MainWindow : Window
    {
        public ObservableCollection<Cat> Cats { get; } = new ObservableCollection<Cat>
        {
            new Cat { Name = "Whiskers", Color = "Orange" },
            new Cat { Name = "Mittens", Color = "Black" },
            new Cat { Name = "Tiger", Color = "Orange" },
            new Cat { Name = "Shadow", Color = "Black" },
            new Cat { Name = "Snowball", Color = "White" }
        };

        public ICollectionView GroupedView { get; }

        public MainWindow()
        {
            InitializeComponent();

            GroupedView = CollectionViewSource.GetDefaultView(Cats);
            GroupedView.GroupDescriptions.Add(new PropertyGroupDescription("Color"));

            DataContext = this;
        }

        private void StackPanel_Loaded(object sender, RoutedEventArgs e)
        {
            Console.WriteLine($"Cats.Count (the one real data source): {Cats.Count}");

            foreach (object entry in GroupedView.Groups)
            {
                if (entry is CollectionViewGroup group)
                {
                    Console.WriteLine($"Group '{group.Name}': {group.ItemCount} item(s)");
                }
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
Cats.Count (the one real data source): 5
Group 'Orange': 2 item(s)
Group 'Black': 2 item(s)
Group 'White': 1 item(s)
```

#### Execution Trace

One `foreach` over `GroupedView.Groups`, walking the three real groups
`GroupDescriptions` just produced:

1. `Cats.Count` prints `5` — the underlying collection, untouched.
2. The `foreach` visits the first group WPF's grouping machinery built —
   `"Orange"`, matching `Whiskers` and `Tiger`'s shared `Color` — printing
   `"Group 'Orange': 2 item(s)"`.
3. The loop advances to the second group, `"Black"` (`Mittens` and
   `Shadow`), printing `"Group 'Black': 2 item(s)"`.
4. The loop reaches the third and last group, `"White"` (`Snowball`
   alone), printing `"Group 'White': 1 item(s)"`, then stops — three
   distinct `Color` values among the five cats, three groups, summing
   back to the original `5`.

Also worth seeing directly: the running `DataGrid` shows real, visible,
expandable group headers — "Orange," "Black," "White" — with the matching
cats nested underneath each one, and no second collection anywhere in the
code that produced it.

*What this proves:* `Cats` still holds exactly 5 items, unchanged and
un-copied — `Cats.Count` proves it directly. `GroupedView`, obtained via
`CollectionViewSource.GetDefaultView(Cats)`, is a *view* over that same 5
items, not a new collection of its own; adding a
`PropertyGroupDescription("Color")` to its `GroupDescriptions` made
`GroupedView.Groups` report three real groups — `2 + 2 + 1 = 5`, the exact
same 5 items, now partitioned rather than duplicated.

### Discard the Throwaway Example
Delete the `lab-collectionview` folder. `ICollectionView`/`GroupDescriptions`
are not discarded — the real `ItemsGrid` groups by `Category` using
exactly this next.

### Mechanical Walkthrough

- `CollectionViewSource.GetDefaultView(Cats)` — **first appearance.**
  Returns the `ICollectionView` WPF has already been maintaining behind
  the scenes for `Cats` since the moment anything first bound to it — not
  a new object created here, the *existing* one, retrieved.
- `GroupedView.GroupDescriptions.Add(new PropertyGroupDescription("Color"))`
  — **first appearance of `PropertyGroupDescription`.** Names a property
  (by string, matching `{Binding}`'s own path syntax) whose distinct
  values become group boundaries — every `Cat` whose `Color` is
  `"Orange"` lands in the same group, automatically, with no manual
  partitioning code written.
- `GroupedView.Groups` — **first appearance.** A read-only collection of
  the resulting groups, each one a real `CollectionViewGroup` — real
  declared shape shown in "Objects and methods used," above.
- `foreach (object entry in GroupedView.Groups)` — `Groups` is declared
  as a collection of plain `object`, not `CollectionViewGroup`
  specifically (WPF's own real declared shape, so the same collection
  type can hold different concrete group implementations in other
  scenarios) — which is exactly why the next line has to check what
  each `entry` actually is before using it as a `CollectionViewGroup`.
- `if (entry is CollectionViewGroup group)` — **first appearance of a
  type pattern.** Tests whether `entry`'s real runtime type is
  `CollectionViewGroup` and, only when it matches, binds it to a new
  variable `group`, already typed as `CollectionViewGroup` — in one
  expression, with no separate cast line and no exception if it didn't
  match. Full treatment, an isolated lab, and real verified output:
  `csharp-type-pattern-matching.md`.
- `group.Name` / `group.ItemCount` — **first appearance of reading
  `CollectionViewGroup`'s own members.** Only reachable *because* the
  `is` check above already proved `entry` really is a
  `CollectionViewGroup` — reading `.Name`/`.ItemCount` on a plain
  `object` (before the pattern match narrowed it) would be a compile
  error; the type pattern is what makes these two ordinary property
  reads legal at all.

### CS Lens

`ICollectionView` is the **Adapter pattern** — a wrapper presenting a
different, richer interface (sorting, filtering, grouping) over an object
that doesn't natively support any of it (`ObservableCollection<T>` alone
has none of these capabilities). Every binding this project has ever made
to `{Binding Items}` was already going through an `ICollectionView`
without this course ever naming it — this unit is the first time that
underlying adapter becomes something the code explicitly asks for and
configures, rather than something WPF quietly supplies by default.

### SE Lens

Why is grouping implemented as a property (`GroupDescriptions`) on a
*view* over the data, instead of a method on `ObservableCollection<T>`
itself, or a completely separate grouped collection maintained by hand?
Because a collection's job is holding items; a *view*'s job is
presenting them — the same **separation of concerns** already behind
every `Model`/`View` split this project has made. `Items` never needs to
know it's sometimes shown flat, sometimes grouped; that decision belongs
entirely to whatever's presenting it, which is exactly why the real
`InventoryPage` (next unit) can group `Items` for `ItemsGrid` without
touching `Items`, `SaveItemToDatabase`, or `LoadItemsFromDatabase` at all.

### Connection

The real `ItemsGrid` groups `Items` by `Category` using exactly this
mechanism next.

---

## Concept Unit: Grouping `ItemsGrid` by `Category`

### The Problem

`ItemsGrid` shows every item in one flat table. Grouping it by `Category`
— the same field `ComboBox` already restricts to a fixed set of values
(Lesson 12) — is the natural first grouping this project's own data
supports.

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:** `InventoryPage.xaml.cs`, `InventoryPage.xaml`.
- **Change type:** Add.
- **Dependencies:** `ICollectionView`/`GroupDescriptions`, previous unit;
  `Items`, existing since Lesson 7.

### The New Code — the ViewModel Property

```csharp
public ICollectionView GroupedItems { get; }
```

```csharp
GroupedItems = CollectionViewSource.GetDefaultView(Items);
GroupedItems.GroupDescriptions.Add(new PropertyGroupDescription(nameof(InventoryItem.Category)));
```

### The New Code — the Binding

```xml
<DataGrid x:Name="ItemsGrid"
          Grid.Column="0"
          AutoGenerateColumns="False"
          IsReadOnly="True"
          ItemsSource="{Binding GroupedItems}"
          SelectionChanged="ItemsGrid_SelectionChanged">
```

### The Updated Project

```csharp
using Microsoft.Data.Sqlite;
using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.ComponentModel;
using System.Globalization;
using System.Windows;
using System.Windows.Controls;
using System.Windows.Data;

namespace PocketInventory
{
    public partial class InventoryPage : Page, INotifyPropertyChanged
    {
        private const string ConnectionString = "Data Source=pocketinventory.db";

        public ObservableCollection<InventoryItem> Items { get; } = new ObservableCollection<InventoryItem>();

        public ICollectionView GroupedItems { get; }                                             // ← new

        public Array CategoryValues => Enum.GetValues(typeof(Category));

        private InventoryItem newItemDraft = new InventoryItem();

        public InventoryItem NewItemDraft
        {
            get { return newItemDraft; }
            set
            {
                newItemDraft = value;
                PropertyChanged?.Invoke(this, new PropertyChangedEventArgs(nameof(NewItemDraft)));
            }
        }

        public event PropertyChangedEventHandler? PropertyChanged;

        public InventoryPage()
        {
            InitializeComponent();
            DataContext = this;
            EnsureDatabaseCreated();

            foreach (InventoryItem item in LoadItemsFromDatabase())
            {
                Items.Add(item);
            }

            GroupedItems = CollectionViewSource.GetDefaultView(Items);                            // ← new
            GroupedItems.GroupDescriptions.Add(new PropertyGroupDescription(nameof(InventoryItem.Category))); // ← new
        }

        // EnsureDatabaseCreated, LoadItemsFromDatabase, AddButton_Click,
        // SaveItemToDatabase, ItemsGrid_SelectionChanged all unchanged from Lesson 16.
    }
}
```

`GroupedItems` is built once, in the constructor, *after* `Items` is
populated from the database — the same `Items` collection every other
part of this project already reads and writes, wrapped, not replaced.

### Mechanical Walkthrough

- `public ICollectionView GroupedItems { get; }` — reappearing (the
  previous unit's lab), a read-only property this time — nothing in this
  project ever needs to *replace* the view, only read it, so no `set`
  block or `PropertyChanged` announcement is needed the way every mutable
  property on this class has required.
- `CollectionViewSource.GetDefaultView(Items)` — reappearing exactly,
  now wrapping the real `Items` collection instead of the lab's `Cats`.
- `new PropertyGroupDescription(nameof(InventoryItem.Category))` —
  reappearing, one new detail: `nameof(InventoryItem.Category)` instead
  of a raw string literal `"Category"` — the same compile-time-checked
  reasoning `nameof` has provided everywhere else it's appeared in this
  project (Lesson 7 onward), here protecting this exact line from
  silently breaking if `Category` were ever renamed.
- `ItemsSource="{Binding GroupedItems}"` — **changed** from
  `{Binding Items}` (Lesson 16). Binding directly to an `ICollectionView`
  rather than the raw collection is what actually makes the grouping
  visible — binding to `Items` itself would show the flat, ungrouped
  list, because `Items` has no idea `GroupedItems` even exists.

### CS Lens

Nothing about `Items` changed — not its type, not a single line that adds
or removes an item from it. `GroupedItems` is a second, independent way
of *looking at* the same data, proving directly what Lesson 16's
`DataGrid` swap already established: presentation and data are genuinely
decoupled in this project, not just in principle.

### SE Lens

Why does `ItemsGrid` bind to `GroupedItems` instead of the previous
approach of binding directly to `Items` and letting `DataGrid` group
itself via some `GroupBy` setting on the control? Because grouping is
fundamentally a *data-shaping* decision (which property partitions this
data, and how), not a *rendering* decision — keeping it on the
`ICollectionView`, one layer below any specific control, means the exact
same `GroupedItems` could feed a completely different control (a grouped
`ListBox`, for instance) with zero duplicated grouping logic, the same
"decouple the decision from any one control" reasoning Lesson 16 already
established for the `DataGrid` swap itself.

### Commands Needed

```bash
dotnet run
```

### Run It

On your Windows machine: `ItemsGrid` now shows real, expandable group
headers — one per distinct `Category` currently in use — with each
item's row nested underneath its own category, using WPF's own default
group-header appearance (no custom styling written this lesson).
Add a new item in a category with no existing items yet; a new group
header appears for it automatically, live, with no manual refresh.

### Connection

`Items` now has a genuinely grouped presentation, built entirely from
already-proven pieces. The next lesson gives the same `ICollectionView`
a second job — sorting — driven by clicking a column header instead of
a fixed, hardcoded rule.

---

## Closing

### Connect the Pieces

`Items` is populated exactly as it has been since Lesson 7 —
`AddButton_Click` calling `Items.Add(NewItemDraft)`, nothing about that
call aware `GroupedItems` exists. `GroupedItems`, built once in the
constructor by wrapping that same `Items` with
`CollectionViewSource.GetDefaultView` (this lesson's first unit) and one
`PropertyGroupDescription` naming `Category`, is what `ItemsGrid` actually
binds to now — the one line changed in this lesson's second unit. Every
group header visible in the running app traces back to real, distinct
`Category` values already sitting on real `InventoryItem`s, computed
fresh by WPF's own grouping machinery, never hand-maintained.

### What Breaks Without This

Temporarily change `ItemsSource="{Binding GroupedItems}"` back to
`ItemsSource="{Binding Items}"` and rerun. Real, representative result:
the app doesn't crash — `Items` is still a perfectly valid binding target,
exactly as it was through Lesson 16 — but every group header disappears,
back to one flat table, because `Items` itself was never grouped; only
`GroupedItems`, the view wrapped around it, was. This is concrete proof
that grouping lives entirely in the view layer this unit added, not in
the data itself — a real, easy mistake (binding to the familiar `Items`
out of habit) that produces no error, just a silently ungrouped screen.
Restore `{Binding GroupedItems}` afterward.

### Exercises

- In the `lab-collectionview` throwaway pattern, change
  `new PropertyGroupDescription("Color")` to group by a different
  property (add one, if needed, like a `bool IsIndoor`) and confirm real,
  different group headers appear.
- Predict, in your own words, what happens to `ItemsGrid`'s groups the
  moment you change an existing item's `Category` via a future edit
  feature (Lesson 21) — does the item's row move to a new group
  automatically, or would something else need to happen first? You don't
  need to build the edit feature to answer this; reason from what
  `ICollectionView` and `ObservableCollection<T>`'s `INotifyPropertyChanged`
  reliance already proved back in Lesson 7.
- Add a second `GroupDescription` to `GroupedItems` (for example,
  grouping by `Location` *within* each `Category`) and confirm, on your
  own running app, that `DataGrid` nests the second grouping level
  correctly with no other code changes.

### Definition of Done

- [ ] `GroupedItems` (`ICollectionView`) exists on `InventoryPage`,
      wrapping `Items` with a `PropertyGroupDescription` on `Category`.
- [ ] `ItemsGrid.ItemsSource` binds to `GroupedItems`, not `Items`
      directly.
- [ ] The running app shows real, expandable group headers by category,
      with items correctly nested under each one.
- [ ] Adding a new item in a not-yet-seen category creates a new group
      header live, with no manual refresh.
- [ ] You reproduced the flat-list regression (binding back to `Items`),
      confirmed it fails silently rather than crashing, and restored
      `{Binding GroupedItems}`.
- [ ] Committed with a message stating why: for example,
      `git commit -m "Group ItemsGrid by Category via ICollectionView, no data duplicated"`.
