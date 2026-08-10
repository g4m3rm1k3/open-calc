# Lesson 18: An Order, Declared Instead of Computed

*(`SortDescription`, `IComparable`)*

**User Story**
> As a user, I want items sorted — alphabetically by default, and by
> clicking a column header to sort by anything else.

**What you will build**
Clicking a `DataGrid` column header already re-sorts the grid — Lesson
16 noted this as free, built-in behavior with no code written for it.
This lesson names the exact mechanism behind that free behavior
(`SortDescription`, living on the same `ICollectionView` Lesson 17 just
introduced for grouping) and uses it deliberately: `ItemsGrid` currently
shows items in whatever order SQLite happened to return them in — this
lesson gives it a real, declared default order instead.

**What you need to know first:** Lesson 17: `ICollectionView`,
`CollectionViewSource.GetDefaultView`, `GroupDescriptions`. Lesson 16:
the observation that clicking a `DataGrid` column header already sorts,
unexplained until now.

**Terms introduced in this lesson:**
- **`SortDescription`** — a small struct naming a property and a
  direction (`ListSortDirection.Ascending`/`Descending`); added to an
  `ICollectionView`'s `SortDescriptions` collection, it reorders the view
  without touching the underlying collection.
- **`IComparable`** — the interface .NET's built-in sorting (including
  `SortDescription`'s own comparisons) relies on to know how to order two
  values of the same type — already implemented by every built-in type
  this project sorts by (`string`, `decimal`, `DateTime`), never written
  by hand in this project.

**Objects and methods used**
- `ICollectionView` (Lesson 17) reappears here, already given full
  treatment — brief reminder only, per the Repetition Rule.
  `SortDescription` and `IComparable` are this lesson's own subject,
  given full treatment below.

---

## Concept Unit: `SortDescription` — Ordering a View, Not the Data

### The Problem

`Cats` (or `Items`, in the real project) holds items in whatever order
they were added, or loaded from a database — insertion order, not
necessarily a useful order for a person reading them. Sorting the
underlying collection itself would work once, but the moment a new item
is added, that manual order is stale again.

### Introduce the Concept in Isolation
```bash
dotnet new wpf -o lab-sortdescription
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

namespace lab_sortdescription
{
    public class Cat
    {
        public string Name { get; set; } = string.Empty;
        public int Age { get; set; }
    }

    public partial class MainWindow : Window
    {
        public ObservableCollection<Cat> Cats { get; } = new ObservableCollection<Cat>
        {
            new Cat { Name = "Whiskers", Age = 3 },
            new Cat { Name = "Mittens", Age = 5 },
            new Cat { Name = "Tiger", Age = 1 }
        };

        public ICollectionView View { get; }

        public MainWindow()
        {
            InitializeComponent();
            View = CollectionViewSource.GetDefaultView(Cats);
            DataContext = this;
        }

        private void StackPanel_Loaded(object sender, RoutedEventArgs e)
        {
            Console.WriteLine("Unsorted order:");
            PrintOrder();

            View.SortDescriptions.Add(new SortDescription("Age", ListSortDirection.Ascending));
            Console.WriteLine("After sorting by Age ascending:");
            PrintOrder();

            View.SortDescriptions.Clear();
            View.SortDescriptions.Add(new SortDescription("Age", ListSortDirection.Descending));
            Console.WriteLine("After sorting by Age descending:");
            PrintOrder();
        }

        private void PrintOrder()
        {
            foreach (object entry in View)
            {
                Cat cat = (Cat)entry;
                Console.WriteLine($"  {cat.Name} ({cat.Age})");
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
Unsorted order:
  Whiskers (3)
  Mittens (5)
  Tiger (1)
After sorting by Age ascending:
  Tiger (1)
  Whiskers (3)
  Mittens (5)
After sorting by Age descending:
  Mittens (5)
  Whiskers (3)
  Tiger (1)
```

#### Execution Trace

1. `PrintOrder()`, called before any `SortDescription` exists, walks
   `View` in `Cats`' own insertion order: `Whiskers`, `Mittens`, `Tiger`
   — the identical order they were constructed in.
2. `View.SortDescriptions.Add(new SortDescription("Age", Ascending))`
   runs — `View`'s iteration order changes immediately, with no
   `.Refresh()` or rebind needed. The second `PrintOrder()` walks the
   *same three objects*, now ordered `Tiger (1)`, `Whiskers (3)`,
   `Mittens (5)` — youngest first.
3. `View.SortDescriptions.Clear()` removes the ascending rule; the
   following `.Add(new SortDescription("Age", Descending))` installs its
   replacement. The third `PrintOrder()` walks the identical three
   objects a third time, now `Mittens (5)`, `Whiskers (3)`, `Tiger (1)` —
   the exact reverse of the ascending pass, proving the same three `Cat`
   instances, never copied or recreated, are what every pass iterates.

*What this proves:* `Cats` itself never changed order — `foreach (object
entry in View)` walks `View`, the `ICollectionView` wrapper, not `Cats`
directly, and it's `View`'s own iteration order that changed, three times,
purely from adding and clearing `SortDescription`s. Ascending put the
youngest (`Tiger`, `1`) first; descending, cleared and re-added, reversed
it completely — no manual comparison code written, `SortDescription`
alone drove both orderings.

### Discard the Throwaway Example
Delete the `lab-sortdescription` folder. `SortDescription` itself is not
discarded — the real `GroupedItems` gets a real default sort next.

### Mechanical Walkthrough

- `View.SortDescriptions.Add(new SortDescription("Age", ListSortDirection.Ascending))`
  — **first appearance of `SortDescription`.** A property name (as a
  string, the same convention `PropertyGroupDescription` already used in
  Lesson 17) plus a direction — added to `SortDescriptions`, an
  `ICollectionView` collection exactly parallel to `GroupDescriptions`.
- `View.SortDescriptions.Clear()` — reappearing (`.Clear()`, familiar from
  `ObservableCollection<T>` since Lesson 6), here removing the previous
  sort before applying a new, different one — `SortDescriptions` doesn't
  automatically replace an old entry; a second `.Add` without clearing
  would sort by *both*, the first as the primary key, the second as a
  tiebreaker.
- `foreach (object entry in View)` — **first appearance of iterating an
  `ICollectionView` directly** (a plain, non-generic `IEnumerable`) — each
  `entry` needs an explicit cast (`(Cat)entry`) back to its real type,
  unlike iterating `Cats` itself, which would already be `IEnumerable<Cat>`.

### CS Lens

`SortDescription` relies on `IComparable` behind the scenes — every
built-in type this project sorts by (`string` for `Name`, `int` for
`Age`, `decimal` for `Value`, `DateTime` for `PurchaseDate`) already
implements `IComparable`, which is precisely *how* .NET knows `1 < 3 < 5`
or that one `string` alphabetically precedes another, without this
project ever writing a comparison function by hand. This is the same
"the framework already solved this for built-in types" pattern
`Enum.GetValues`, `decimal.Parse`, and `DateTime.Parse` have all
represented since their own first appearances.

### SE Lens

Why is sorting implemented as `SortDescription`s on the *view*, exactly
like Lesson 17's `GroupDescriptions`, instead of a `List<T>.Sort()` call
on `Cats` itself? For the identical reason already given there: sorting
is a *presentation* decision, not a fact about the data — `Cats`
shouldn't need to know or care whether whoever's showing it wants it
alphabetical, by age, or in whatever order items were added. Keeping both
`SortDescriptions` and `GroupDescriptions` on the same `ICollectionView`
also means they compose for free — a view can be sorted *and* grouped at
once, each responsibility handled independently by the same underlying
object, proven directly in the real project next.

### Connection

`GroupedItems`, already grouping `Items` by `Category` since Lesson 17,
gets a real default sort within each group next.

---

## Concept Unit: A Real Default Sort for `GroupedItems`

### The Problem

`GroupedItems` currently shows items in whatever order SQLite's `SELECT`
happened to return — an accident of implementation, not a deliberate
choice, and the exact opposite of every other decision this project has
made explicitly.

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:** `InventoryPage.xaml.cs`.
- **Change type:** Modify (the constructor, right after `GroupedItems` is
  created).
- **Dependencies:** `SortDescription`, previous unit; `GroupedItems`,
  Lesson 17.

### The New Code

```csharp
GroupedItems.SortDescriptions.Add(new SortDescription(nameof(InventoryItem.Name), ListSortDirection.Ascending));
```

### The Updated Project

```csharp
GroupedItems = CollectionViewSource.GetDefaultView(Items);
GroupedItems.GroupDescriptions.Add(new PropertyGroupDescription(nameof(InventoryItem.Category)));
GroupedItems.SortDescriptions.Add(new SortDescription(nameof(InventoryItem.Name), ListSortDirection.Ascending));  // ← new
```

### Mechanical Walkthrough

- `new SortDescription(nameof(InventoryItem.Name), ListSortDirection.Ascending)`
  — reappearing exactly, `nameof(InventoryItem.Name)` chosen over a raw
  `"Name"` literal for the same compile-time-safety reason
  `GroupDescriptions` already established in Lesson 17.
- Order matters here in one specific way worth naming: this line runs
  *after* `GroupDescriptions.Add(...)` — `ItemsGrid` groups by `Category`
  first, then sorts *within* each group alphabetically by `Name`,
  because that's the order these two operations were composed in, not
  because one is inherently primary.

### CS Lens

Nothing new mechanically — this unit is pure application of the previous
unit's proof, the same "compose already-proven pieces" pattern every
wiring unit in this project has followed since Lesson 12. Worth naming
directly, though: `GroupDescriptions` and `SortDescriptions` living on the
same `ICollectionView`, applied together here for the first time, is
concrete proof they really do compose independently, exactly as this
lesson's first unit's CS Lens predicted.

### SE Lens

Why alphabetical by `Name` specifically, rather than by `Value` (most
expensive first) or `PurchaseDate` (newest first)? Because "alphabetical"
is the one default order that stays meaningful and predictable regardless
of what a user is actually looking for — a user hunting for a specific
item by name can reliably guess roughly where it'll be; a value-sorted or
date-sorted default would only serve *some* tasks well, at the cost of
making "find this specific item" measurably harder for everyone else.
Clicking any column header (already free, since Lesson 16) still lets a
user choose value or date sorting themselves, on demand — the default
just shouldn't force that choice on them.

### Commands Needed

```bash
dotnet run
```

### Run It

On your Windows machine: items now appear alphabetically by name within
each category group, from the moment the app opens — no clicking
required. Click the `Value` column header; the grid re-sorts by value
instead, using the exact `SortDescriptions` mechanism this lesson just
named, silently replacing the default `Name` sort this unit just added
(`DataGrid`'s own header-click handling manages `SortDescriptions`
directly, the same collection this unit just wrote to by hand). Add a new
item; it appears in its correct alphabetical position within its
category's group immediately, with no manual re-sort needed.

### Connection

`GroupedItems` now has both a real grouping and a real default order,
composed from two independent, already-proven mechanisms. The next lesson
adds a third: filtering, so a user can narrow what's visible without
touching how it's grouped or sorted.

---

## Closing

### Connect the Pieces

`GroupedItems`, wrapping the same `Items` `ObservableCollection<T>`
Lesson 17 already grouped by `Category`, gets one more line in this
lesson's second unit: `SortDescriptions.Add(new SortDescription(nameof(InventoryItem.Name), ...))`
— the identical mechanism this lesson's first unit proved with real,
reversible output on a throwaway `Cat` list. `ItemsGrid`, bound to
`GroupedItems` since Lesson 17, picks up both the grouping and this new
default sort automatically, with zero changes to the `DataGrid` markup
itself — proof that `ICollectionView`'s responsibilities (grouping,
sorting) really do stack independently on top of the same underlying
`Items` collection, never touching `AddButton_Click`, `SaveItemToDatabase`,
or `LoadItemsFromDatabase`.

### What Breaks Without This

Temporarily comment out this lesson's one new line
(`GroupedItems.SortDescriptions.Add(...)`) and rerun. Real, representative
result: the app doesn't crash — `SortDescriptions` is perfectly valid
left empty, `ICollectionView` doesn't require one — items within each
category group simply revert to whatever order `LoadItemsFromDatabase`'s
`SELECT` happened to return them in, an order this project has never
actually guaranteed or controlled (SQLite makes no ordering promise
without an explicit `ORDER BY`, a fact Lesson 32 revisits directly). This
is a quiet regression, not a crash: the app still runs, still looks
plausible, and only close inspection reveals the alphabetical order is
gone. Restore the real line afterward.

### Exercises

- In the `lab-sortdescription` throwaway pattern, add a second
  `SortDescription` (for example, sort by `Name` as a tiebreaker after
  `Age`) without clearing the first — confirm real output showing cats
  with tied `Age` values landing in alphabetical order relative to each
  other.
- Predict, in your own words, what `View.SortDescriptions.Count` would
  report immediately after this lesson's `.Clear()` call, before the
  following `.Add()` runs — then confirm it in a throwaway lab.
- In the real, running app, click the `Category` column header directly
  (not the group headers) — predict what happens given `ItemsGrid` is
  already grouped by `Category`, then confirm your prediction by running
  it.

### Definition of Done

- [ ] `GroupedItems` has a real default `SortDescription` — `Name`,
      ascending — applied once, in the constructor.
- [ ] The running app shows items alphabetically within each category
      group from the moment it opens, with no user interaction required.
- [ ] Clicking a column header still re-sorts the grid, using the same
      `SortDescriptions` mechanism this lesson named.
- [ ] You reproduced the quiet regression (commenting out the new line),
      confirmed the app still runs but loses its guaranteed order, and
      restored the real code.
- [ ] Committed with a message stating why: for example,
      `git commit -m "Add a default alphabetical SortDescription to GroupedItems"`.
