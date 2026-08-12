# Lesson 19: Showing Only What Matches, Without Deleting Anything

*(`ICollectionView.Filter`, `Predicate<T>`)*

**User Story**
> As a user, I want to search by name and see the grid narrow live, as I
> type.

**What you will build**
`ItemsGrid` currently shows every item, grouped and sorted. This lesson
adds a search box: type "bolt," and only items whose name contains
"bolt" stay visible — everything else hides, without being removed,
deleted, or even touched. The mechanism is a third independent
responsibility living on the same `ICollectionView` that already grouped
(Lesson 17) and sorted (Lesson 18) this exact data.

**What you need to know first:** Lesson 17/18: `ICollectionView`,
`CollectionViewSource.GetDefaultView`. Lesson 7: `TextChanged`-style live
updates already proven for `{Binding}`.

**Terms introduced in this lesson:**
- **`ICollectionView.Filter`** — a property accepting a function; every
  item is passed to it, and only items the function returns `true` for
  stay visible in the view.
- **`Predicate<T>`** — a built-in delegate type: a function taking one
  `T` and returning `bool`. `Filter`'s actual type is
  `Predicate<object>`, since a view can hold any kind of item.

**Objects and methods used**
- **`ICollectionView.Filter`**
  - *What it is:* a property accepting a function; every item in the
    view is passed to it, and only items the function returns `true`
    for stay visible — nothing is removed, deleted, or copied out of
    the underlying collection.
  - *Implementation:* a `Predicate<object>`-typed property on
    `ICollectionView` (Lesson 17). Assigning it — or reassigning it,
    or calling `.Refresh()` afterward — re-evaluates every item in the
    view against the new function.
  - *Its use:* `GroupedItems.Filter = item => ((InventoryItem)item).Name.Contains(searchText)`
    — this lesson's own live, narrowing search, coexisting with
    grouping (Lesson 17) and sorting (Lesson 18) on the exact same
    view. Full lab, real output, and both lenses in this lesson's own
    Concept Unit.
- **`Predicate<T>`**
  - *What it is:* a built-in delegate type — a function taking one `T`
    and returning `bool`.
  - *Implementation:* `System.Predicate<T>`, part of the same "ready-
    made delegate signature" family as `Action`/`Func` (Lesson 4).
    `Filter`'s own real type is specifically `Predicate<object>`, not
    `Predicate<InventoryItem>`, since a view can hold any kind of item.
  - *Its use:* the exact type a lambda assigned to `Filter` has to
    match — read directly, not constructed by hand.

`ICollectionView` reappears from
`Lesson-17-collectionviewsource-and-grouping.md`; the `delegate`
mechanism reappears from
`Lesson-06-b-custom-delegates-and-events.md` — both already given full
treatment there, brief reminder only, per the Repetition Rule.

---

## Concept Unit: `ICollectionView.Filter` and `Predicate<T>`

### The Problem

Showing only items matching a search term, without touching the
underlying collection at all — the same "don't duplicate or mutate the
data to change what's presented" principle Lessons 17 and 18 already
established for grouping and sorting, now needed for narrowing what's
visible.

### Introduce the Concept in Isolation
```bash
dotnet new wpf -o lab-predicate
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

namespace lab_predicate
{
    public class Cat
    {
        public string Name { get; set; } = string.Empty;
    }

    public partial class MainWindow : Window
    {
        public ObservableCollection<Cat> Cats { get; } = new ObservableCollection<Cat>
        {
            new Cat { Name = "Whiskers" },
            new Cat { Name = "Mittens" },
            new Cat { Name = "Tiger" },
            new Cat { Name = "Shadow" }
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
            Console.WriteLine("No filter:");
            PrintVisible();

            View.Filter = new Predicate<object>(entry => ((Cat)entry).Name.Contains("i"));
            Console.WriteLine("Filter: Name contains 'i':");
            PrintVisible();

            View.Filter = new Predicate<object>(entry => ((Cat)entry).Name.StartsWith("S"));
            Console.WriteLine("Filter changed to: Name starts with 'S':");
            PrintVisible();

            Console.WriteLine($"Cats.Count (underlying collection, unaffected): {Cats.Count}");
        }

        private void PrintVisible()
        {
            foreach (object entry in View)
            {
                Cat cat = (Cat)entry;
                Console.WriteLine($"  {cat.Name}");
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
No filter:
  Whiskers
  Mittens
  Tiger
  Shadow
Filter: Name contains 'i':
  Whiskers
  Mittens
  Tiger
Filter changed to: Name starts with 'S':
  Shadow
Cats.Count (underlying collection, unaffected): 4
```

#### Execution Trace

1. `PrintVisible()`, called before `Filter` is ever set, walks `View`
   with no restriction: all four cats print, in insertion order.
2. `View.Filter` is assigned a function testing `Name.Contains("i")`.
   The second `PrintVisible()`'s `foreach` now visits only the entries
   that function returns `true` for: `Whiskers` (contains `i`), `Mittens`
   (contains `i`), `Tiger` (contains `i`) — `Shadow` is tested too,
   returns `false`, and the loop simply never visits it.
3. `View.Filter` is reassigned to a different function, testing
   `Name.StartsWith("S")`. The third `PrintVisible()`'s `foreach` now
   visits only `Shadow` — the previous filter is gone the instant
   `Filter` was reassigned, not combined with the new one.
4. `Cats.Count` is read directly, one last time: `4` — the same number
   as before any filter existed, confirming every pass iterated a subset
   of the same four objects, never a smaller real collection.

*What this proves:* with no `Filter` set, `View` shows all four cats.
Setting `View.Filter` to a function checking `Name.Contains("i")`
immediately narrows `View` to the three cats whose name contains an `i`
— `Shadow` has none, and correctly disappears. Reassigning `Filter`
entirely — a different function, `Name.StartsWith("S")` — immediately
re-narrows to just `Shadow`, with no `.Clear()` needed first (unlike
`SortDescriptions`, `Filter` is a single property, not a collection —
assigning it replaces whatever was there). `Cats.Count` staying `4`
through every filter change is the direct proof nothing was ever removed
— only `View`'s idea of what's currently visible changed.

### Discard the Throwaway Example
Delete the `lab-predicate` folder. `Filter`/`Predicate<T>` are not
discarded — the real search box uses exactly this next.

### Mechanical Walkthrough

- `View.Filter = new Predicate<object>(entry => ((Cat)entry).Name.Contains("i"));`
  — **first appearance of `ICollectionView.Filter` and `Predicate<T>`.**
  `Predicate<object>` — (first appearance) — is a built-in delegate type:
  a function taking one `object` (every item in the view, regardless of
  its real type) and returning `bool`; `entry => ((Cat)entry).Name.Contains("i")`
  is a **lambda expression**, an inline, unnamed function — `entry`
  is the parameter, everything after `=>` is what it returns. `View`
  calls this function once per item, keeping only the ones it returns
  `true` for.
- `((Cat)entry).Name.Contains("i")` — the same explicit cast
  `foreach (object entry in View)` already required back in Lesson 18,
  necessary here for the identical reason: `Filter`'s parameter type is
  the general `object`, not `Cat` specifically, because a view can hold
  any kind of item.
- Reassigning `View.Filter` entirely (not adding to a collection) —
  worth contrasting directly against `SortDescriptions`/`GroupDescriptions`,
  both genuine collections supporting multiple simultaneous entries;
  `Filter` is a single property holding at most one function at a time.

### CS Lens

`Predicate<T>` is one of .NET's built-in generic delegate types — the
same underlying idea as `Action`/`Func` this project hasn't needed until
now, specialized for exactly "test one value, get a `bool` back."
Filtering-by-predicate is a real, general pattern well beyond WPF: the
same shape underlies `List<T>.Where(...)` in LINQ and `Array.FindAll(...)`
— WPF's `ICollectionView.Filter` is one specific application of a much
more general "pass a test function, keep what passes" idea.

### SE Lens

Why does `ICollectionView` use a single `Filter` property instead of a
`FilterDescriptions` collection, symmetrical with `SortDescriptions` and
`GroupDescriptions`? Because sorting and grouping are naturally
additive — multiple sort keys, multiple grouping levels, all can coexist
meaningfully. Filtering with more than one independent rule needs a
*combining* decision first — should an item pass if it matches rule A
*and* rule B, or *either* one? — a genuine ambiguity sorting and grouping
don't have. A single `Filter` sidesteps that ambiguity by making the
caller responsible for combining multiple conditions into one function
themselves — exactly Lesson 20's subject.

### Connection

The real search box sets `GroupedItems.Filter` to exactly this kind of
function next.

---

## Concept Unit: Live Search on `ItemsGrid`

### The Problem

A user typing into a search box should see `ItemsGrid` narrow with every
keystroke — no button to click, no "Search" step, matching the
live-update feel every binding in this project has had since Lesson 7.

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:** `InventoryPage.xaml`, `InventoryPage.xaml.cs`.
- **Change type:** Add.
- **Dependencies:** `GroupedItems`, Lesson 17; `Predicate<T>`, previous
  unit.

### The New Code — the Search Box

```xml
<TextBox Width="200"
         Margin="12,0,0,0"
         TextChanged="SearchBox_TextChanged" />
```

### The New Code — the Handler

```csharp
private void SearchBox_TextChanged(object sender, TextChangedEventArgs e)
{
    string searchText = ((TextBox)sender).Text;

    GroupedItems.Filter = new Predicate<object>(entry =>
    {
        InventoryItem item = (InventoryItem)entry;
        return item.Name.Contains(searchText, StringComparison.OrdinalIgnoreCase);
    });
}
```

### The Updated Project — the Add Row

```xml
<StackPanel Grid.Row="0" Orientation="Horizontal">
    <TextBox x:Name="NameInput"
             Width="240"
             Text="{Binding NewItemDraft.Name, ValidatesOnDataErrors=True, UpdateSourceTrigger=PropertyChanged}" />
    <ComboBox Width="140"
              Margin="12,0,0,0"
              ItemsSource="{Binding CategoryValues}"
              SelectedItem="{Binding NewItemDraft.Category}" />
    <TextBox Width="160"
             Margin="12,0,0,0"
             Text="{Binding NewItemDraft.Location, UpdateSourceTrigger=PropertyChanged}" />
    <TextBox Width="100"
             Margin="12,0,0,0"
             Text="{Binding NewItemDraft.Value, UpdateSourceTrigger=PropertyChanged}" />
    <DatePicker Width="130"
                Margin="12,0,0,0"
                SelectedDate="{Binding NewItemDraft.PurchaseDate}" />
    <Button Content="Add"
            Style="{StaticResource ToolbarButtonStyle}"
            Margin="12,0,0,0"
            Click="AddButton_Click" />
    <TextBox Width="200"                                                          <!-- ← new -->
             Margin="12,0,0,0"                                                    <!-- ← new -->
             TextChanged="SearchBox_TextChanged" />                                <!-- ← new -->
</StackPanel>
```

### The Updated Project — the Handler

```csharp
private void SearchBox_TextChanged(object sender, TextChangedEventArgs e)   // ← new
{
    string searchText = ((TextBox)sender).Text;

    GroupedItems.Filter = new Predicate<object>(entry =>
    {
        InventoryItem item = (InventoryItem)entry;
        return item.Name.Contains(searchText, StringComparison.OrdinalIgnoreCase);
    });
}
```

### Mechanical Walkthrough

- `TextChanged="SearchBox_TextChanged"` — reappearing (the XAML
  event-wiring shape, familiar since `Click="..."` in Lesson 1),
  `TextChanged` specifically fires on every keystroke, unlike `Click`,
  which needs no field to track "what was typed since last time" — the
  handler simply reads `((TextBox)sender).Text` fresh, every call.
- `item.Name.Contains(searchText, StringComparison.OrdinalIgnoreCase)` —
  (first appearance of `StringComparison.OrdinalIgnoreCase`) — makes the
  search case-insensitive; without it, typing `"bolt"` would miss an item
  named `"Hex Bolts"` purely because of capitalization, a real, easy
  mistake worth naming rather than discovering by accident.
- `GroupedItems.Filter = new Predicate<object>(entry => { ... });` —
  reappearing exactly (the previous unit's lab), reassigned on every
  keystroke — a brand new function each time, closing over whatever
  `searchText` currently is at that specific call.

### CS Lens

This is a **closure** — the lambda `entry => { ... }` reads `searchText`,
a variable from the *enclosing method*, not a parameter of the lambda
itself; every time `SearchBox_TextChanged` runs, it creates a fresh
function that remembers that specific call's `searchText`, permanently,
even after `SearchBox_TextChanged` itself has returned. This is why
reassigning `GroupedItems.Filter` on every keystroke genuinely produces a
different, correctly-updated filter each time, rather than one stale
function checking against whatever `searchText` happened to be first.

### SE Lens

Why filter only by `Name`, when this project's `InventoryItem` also has
`Location` and `Notes` — plausible search targets too? Because this
lesson's user story specifically asked for search *by name* — adding
`Location`/`Notes` to the same predicate would be nearly free code, but
would also silently change what "search" means without anyone asking for
that, the same discipline this project has followed since Epic 2's
smallest-possible-vertical-slice approach: build exactly what's asked,
not what's merely easy to also include.

### Commands Needed

```bash
dotnet run
```

### Run It

On your Windows machine: type into the new search box — `ItemsGrid`
narrows live, on every keystroke, to only items whose name contains what
you've typed so far, case-insensitively. Clear the box entirely; every
item reappears. Notice group headers with zero remaining visible items
disappear too — `ICollectionView`'s grouping (Lesson 17) and filtering
compose automatically, with no code coordinating them directly.

### Connection

`GroupedItems` now grounds, sorts, and filters the same `Items`
collection, three independent responsibilities stacked on one
`ICollectionView` with zero data duplicated anywhere. The next lesson
adds a second, independent filter — by category — and combines both into
one predicate, the exact ambiguity this lesson's first unit's SE Lens
named as `Filter`'s reason for being a single property instead of a
collection.

---

## Closing

### Connect the Pieces

A user types "bolt" into the new search box — `TextChanged` fires on
every keystroke (this lesson's second unit), reading the box's current
`Text` fresh each time and building a brand-new `Predicate<object>`
closure (proven in the first unit's isolated lab) that checks
`item.Name.Contains(searchText, StringComparison.OrdinalIgnoreCase)`.
Assigning that predicate to `GroupedItems.Filter` — the same
`ICollectionView` already grouping by `Category` (Lesson 17) and sorting
by `Name` (Lesson 18) — immediately narrows what `ItemsGrid` shows, live,
with `Items` itself, `SaveItemToDatabase`, and `LoadItemsFromDatabase`
all completely untouched.

### What Breaks Without This

Temporarily remove `StringComparison.OrdinalIgnoreCase` from the
`Contains` call (leaving just `item.Name.Contains(searchText)`), rerun,
and search for `"BOLT"` (uppercase) when an item is actually named
`"Hex Bolts"` (lowercase). Real, representative failure: nothing crashes
— `Contains` without a comparison argument defaults to a case-sensitive,
ordinal comparison, and simply returns `false` for every real item,
because `"Hex Bolts"` doesn't literally contain the substring `"BOLT"` in
matching case. The grid silently shows zero results for a search a user
would reasonably expect to match — no error, just a search that quietly
doesn't work the way anyone would assume it should. Restore
`StringComparison.OrdinalIgnoreCase` afterward.

### Exercises

- In the `lab-predicate` throwaway pattern, write a predicate that keeps
  only cats whose name is *exactly* four letters long
  (`entry => ((Cat)entry).Name.Length == 4`) and confirm the real,
  correct output against the four sample cats.
- Predict, in your own words, what `GroupedItems.Filter = null;` would do
  to the running app's search box before trying it — then confirm by
  temporarily adding that line to `SearchBox_TextChanged` (guarded behind
  `if (string.IsNullOrEmpty(searchText))`) and testing an empty search.
- Add a second search box searching `Location` instead of `Name`, wired
  to its own separate `TextChanged` handler that *also* sets
  `GroupedItems.Filter` — run the app, type into both boxes in sequence,
  and explain in your own words why only the second box's filter ends up
  actually controlling what's visible.

### Definition of Done

- [ ] A search `TextBox` exists in the Add row, wired to
      `TextChanged="SearchBox_TextChanged"`.
- [ ] Typing into it narrows `ItemsGrid` live, on every keystroke,
      case-insensitively, by `Name`.
- [ ] Clearing the search box restores every item.
- [ ] `Items.Count`/`Cats.Count` (whichever you checked) stays unchanged
      through every filter change — nothing is ever actually removed.
- [ ] You reproduced the case-sensitivity bug on purpose, confirmed a
      real search silently returns zero results, and restored
      `StringComparison.OrdinalIgnoreCase`.
- [ ] Committed with a message stating why: for example,
      `git commit -m "Add live, case-insensitive name search via ICollectionView.Filter"`.
