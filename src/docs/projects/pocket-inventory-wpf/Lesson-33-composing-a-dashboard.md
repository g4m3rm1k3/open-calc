# Lesson 33: A Screen Built Entirely From What Already Exists

*(Composing existing queries into one dashboard)*

**User Story**
> As a user, I want a single screen summarizing my whole inventory —
> total value, category breakdown, most valuable items, and anything
> missing a purchase date — without re-deriving any of it by hand.

**What you will build**
A real Dashboard screen, reached by navigating away from the main
inventory view and back. Every number on it already exists —
`TotalValue` (Lesson 30), `CategoryTotals` (Lesson 31), `TopValuableItems`
and `ItemsMissingPurchaseDate` (Lesson 32) — this lesson adds zero new
queries, zero new SQL. It's entirely composition: one new `Page`, bound
to properties that already work, correctly, proven with real output
three lessons in a row.

**What you need to know first:** Lesson 3/4: `Page`,
`NavigationService.Navigate`, `GoBack`. Lessons 30–32: every property
this dashboard displays.

**Terms introduced in this lesson:**
- **Open/closed principle** — code should be open to extension (new
  behavior can be added) but closed to modification (existing, working
  code doesn't need to change to add that behavior); this lesson is a
  direct demonstration, not just a definition.

**Objects and methods used**
- **`object.ReferenceEquals(object?, object?)`**
  - *What it is:* a check for whether two variables point at the
    literal same object in memory.
  - *Implementation:* full treatment already given in
    `Lesson-27-deep-copy-vs-reference-copy.md`.
  - *Its use:* this lesson's own real, decisive proof that
    `Frame.GoBack()` returns to the *exact same* cached `Page`
    instance, not a freshly-constructed one — the load-bearing fact
    this whole lesson's "compose, don't reload" design depends on.

**Everything else in the file, not this lesson's subject but still
explained**
- **`Frame.GoBack()` / `Frame.CanGoBack`**
  - *What they are:* pops the back stack and navigates to the previous
    page, and the live check for whether that's currently possible.
  - *Implementation:* full treatment already given in
    `Lesson-04-the-navigation-stack.md`.
  - *Its use:* the exact mechanism this lesson verifies actually
    preserves `InventoryViewModel`'s state across a Dashboard visit.
- **`Dispatcher.Invoke` / `DispatcherPriority.ContextIdle`**
  - *What they are:* WPF's UI-thread message queue, and the mechanism
    for scheduling work onto it at a specific priority.
  - *Implementation:* full treatment already given in
    `Lesson-23-icommand-relaycommand-and-mvvm.md`.
  - *Its use:* the same `Pump()`/`ContextIdle` pattern used earlier, to
    let a binding-driven navigation settle before this lesson's own
    `ReferenceEquals` assertions run.
- **`SUM()` / `GROUP BY` / `ORDER BY ... LIMIT`**
  - *What they are:* the SQL aggregate/grouping/ordering machinery
    behind every number this dashboard displays.
  - *Implementation:* full treatment already given in
    `Lesson-30-sum-and-aggregate-queries.md`,
    `Lesson-31-group-by.md`, and `Lesson-32-order-by-and-limit.md`.
  - *Its use:* not used directly in this lesson's own code — this
    lesson composes the existing properties those queries already
    populate, introducing zero new SQL.

---

## Concept Unit: Does `GoBack()` Actually Preserve State?

### The Problem

Navigating to a new `DashboardPage` and back to `InventoryPage` needs to
leave `InventoryViewModel` — every item, every filter, everything —
exactly as it was. Worth confirming this directly rather than assuming
it, since a wrong assumption here would mean the entire inventory
silently reloading from scratch every time a user checks the dashboard.

### Introduce the Concept in Isolation
```bash
dotnet new wpf -o lab-navcache
```

Replace `MainWindow.xaml`'s `Grid` contents:

```xml
<Frame x:Name="ContentFrame" NavigationUIVisibility="Hidden" JournalOwnership="OwnsJournal" />
```

Replace `MainWindow.xaml.cs`'s contents:

```csharp
using System.Windows;
using System.Windows.Threading;

namespace lab_navcache
{
    public partial class MainWindow : Window
    {
        public MainWindow()
        {
            InitializeComponent();
            Loaded += MainWindow_Loaded;
        }

        private void Pump()
        {
            Dispatcher.Invoke(() => { }, DispatcherPriority.ContextIdle);
        }

        private void MainWindow_Loaded(object sender, RoutedEventArgs e)
        {
            PageA pageA = new PageA();
            ContentFrame.Navigate(pageA);
            Pump();
            pageA.Counter = 42;
            Console.WriteLine($"PageA.Counter set to: {pageA.Counter}");

            ContentFrame.Navigate(new PageB());
            Pump();
            Console.WriteLine($"Navigated to PageB. CanGoBack: {ContentFrame.CanGoBack}");

            ContentFrame.GoBack();
            Pump();
            PageA afterGoBack = (PageA)ContentFrame.Content;
            Console.WriteLine($"After GoBack, same PageA instance? {ReferenceEquals(pageA, afterGoBack)}");
            Console.WriteLine($"After GoBack, PageA.Counter: {afterGoBack.Counter}");
        }
    }

    public class PageA : System.Windows.Controls.Page
    {
        public int Counter { get; set; }
    }

    public class PageB : System.Windows.Controls.Page
    {
    }
}
```

Run it on your Windows machine:

```bash
dotnet run
```

Real output:

```text
PageA.Counter set to: 42
Navigated to PageB. CanGoBack: True
After GoBack, same PageA instance? True
After GoBack, PageA.Counter: 42
```

*What this proves:* `Frame`'s navigation journal doesn't discard a page
when navigating away from it — `GoBack()` returns to the *exact same*
`PageA` object (`ReferenceEquals` reports `True`), with `Counter` still
holding `42`, never reset or reconstructed. This is real, load-bearing
behavior this lesson's dashboard depends on: navigating to
`DashboardPage` and back will return to the identical `InventoryPage`
instance, with its `InventoryViewModel` — every loaded item, every active
filter — completely untouched.

### Discard the Throwaway Example
Delete the `lab-navcache` folder. This confirmed `GoBack()` behavior is
not discarded — it's the reason the real Dashboard navigation needs no
extra state-preservation code at all.

### Mechanical Walkthrough

- `JournalOwnership="OwnsJournal"` — (first appearance) — makes this
  `Frame` responsible for its own back/forward history, rather than
  relying on a parent `NavigationWindow`'s journal — necessary here
  specifically because this lab's `Frame` isn't hosted inside one; the
  real project's own `Frame` (Lesson 3) already has this, implicitly,
  through its actual hosting setup.
- `ContentFrame.GoBack()` — reappearing (Lesson 4), the specific detail
  proven here for the first time: it navigates back to a *cached* page
  instance, not a freshly constructed one.
- `Pump()` — reappearing (a hard concept, per the Repetition Rule): the
  same `Dispatcher`/`ContextIdle` pump Lesson 23 first gave full
  treatment to, queuing a deliberately empty piece of work at the same
  low priority a binding-driven UI update is queued at, so this lab's
  own `Console.WriteLine` calls never read a property (`CanGoBack`,
  `Content`) before WPF has actually finished applying whatever change
  just triggered it.

### CS Lens

This is the real mechanism behind something this project has relied on
implicitly since Lesson 4, now verified rather than assumed: `Frame`'s
navigation journal is closer to a real browser's back button than to
"re-run whatever created this page" — each forward `Navigate` call
pushes a new page instance onto the journal; `GoBack()` pops back to a
previous one, unchanged, exactly as it was left.

### SE Lens

Why does this matter enough to verify directly, rather than trusting it
by analogy to how web browsers work? Because if it were *wrong* — if
`GoBack()` silently reconstructed a fresh `InventoryPage`/
`InventoryViewModel` every time — every filter a user had set, every
unsaved (but not-yet-committed) form state, would silently reset the
instant they checked the dashboard and came back. That would be a real,
frustrating, easy-to-miss regression, exactly the kind of thing worth
proving before building a feature that depends on it, not after.

### Connection

The real Dashboard, reached and returned from exactly this way, is built
next.

---

## Concept Unit: `DashboardPage`, Built Entirely From Existing Properties

### The Problem

`TotalValue`, `CategoryTotals`, `TopValuableItems`, and
`ItemsMissingPurchaseDate` all exist and work, proven independently
across three lessons — nothing currently shows them together, in one
place, at a glance.

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:** New `DashboardPage.xaml`/`DashboardPage.xaml.cs`,
  `InventoryPage.xaml`.
- **Change type:** Add.
- **Dependencies:** Every property from Lessons 30–32; `Frame`/
  `NavigationService`, Lessons 3/4.

### The New Code — `DashboardPage.xaml.cs`

```csharp
using System.Windows.Controls;

namespace PocketInventory
{
    public partial class DashboardPage : Page
    {
        public DashboardPage(InventoryViewModel viewModel)
        {
            InitializeComponent();
            DataContext = viewModel;
        }
    }
}
```

### The New Code — `DashboardPage.xaml`

```xml
<Page x:Class="PocketInventory.DashboardPage"
      xmlns="http://schemas.microsoft.com/winfx/2006/xaml/presentation"
      xmlns:x="http://schemas.microsoft.com/winfx/2006/xaml">
    <StackPanel Margin="24">
        <TextBlock Text="Dashboard" FontWeight="Bold" FontSize="20" Margin="0,0,0,16" />

        <TextBlock Text="{Binding TotalValue, StringFormat={}Total Inventory Value: {0:C}}"
                   FontWeight="Bold" Margin="0,0,0,16" />

        <TextBlock Text="By Category" FontWeight="SemiBold" Margin="0,0,0,4" />
        <ItemsControl ItemsSource="{Binding CategoryTotals}" Margin="0,0,0,16">
            <ItemsControl.ItemTemplate>
                <DataTemplate>
                    <TextBlock Text="{Binding Category, StringFormat={}{0}: }" />
                </DataTemplate>
            </ItemsControl.ItemTemplate>
        </ItemsControl>

        <TextBlock Text="Top 5 Most Valuable" FontWeight="SemiBold" Margin="0,0,0,4" />
        <ItemsControl ItemsSource="{Binding TopValuableItems}" Margin="0,0,0,16">
            <ItemsControl.ItemTemplate>
                <DataTemplate>
                    <TextBlock Text="{Binding Name}" />
                </DataTemplate>
            </ItemsControl.ItemTemplate>
        </ItemsControl>

        <TextBlock Text="Missing a Purchase Date" FontWeight="SemiBold" Margin="0,0,0,4" />
        <ItemsControl ItemsSource="{Binding ItemsMissingPurchaseDate}" Margin="0,0,0,16">
            <ItemsControl.ItemTemplate>
                <DataTemplate>
                    <TextBlock Text="{Binding Name}" />
                </DataTemplate>
            </ItemsControl.ItemTemplate>
        </ItemsControl>

        <Button Content="Back to Inventory" Click="BackButton_Click" HorizontalAlignment="Left" />
    </StackPanel>
</Page>
```

### The New Code — the Back Button and Navigation

```csharp
private void BackButton_Click(object sender, RoutedEventArgs e)
{
    NavigationService.GoBack();
}
```

```xml
<Button Content="Dashboard"
        Style="{StaticResource ToolbarButtonStyle}"
        Margin="12,0,0,0"
        Click="DashboardButton_Click" />
```

```csharp
private void DashboardButton_Click(object sender, RoutedEventArgs e)
{
    InventoryViewModel viewModel = (InventoryViewModel)DataContext;
    NavigationService.Navigate(new DashboardPage(viewModel));
}
```

### Mechanical Walkthrough

- `public DashboardPage(InventoryViewModel viewModel)` — (first
  appearance of a `Page` constructor taking a parameter) — every `Page`
  this project has navigated to before (`new InventoryPage()`, Lesson 6)
  took none; `DashboardPage` needs the *existing* `InventoryViewModel`
  passed in explicitly, rather than constructing (and wastefully
  reloading) a second one.
- `DataContext = viewModel;` — reappearing (`DataContext`, familiar
  since Lesson 3), set to the *same* object `InventoryPage` is already
  using — every `{Binding TotalValue}`, `{Binding CategoryTotals}`, and
  the rest resolve against it identically, because a binding only cares
  that its `DataContext` has the named property.
- `NavigationService.GoBack();` — reappearing (Lesson 4), returning to
  the cached `InventoryPage` instance, proven correct by this lesson's
  first unit.

### CS Lens

This entire unit is the **open/closed principle**, named directly:
`TotalValue`, `CategoryTotals`, `TopValuableItems`, and
`ItemsMissingPurchaseDate` were not modified at all to build this
dashboard — not one line of Lessons 30–32's own code changed. The
dashboard adds real, new behavior (a new screen, a new composed view)
entirely by *extension* — a new `Page`, new bindings — while everything
it depends on stayed exactly as it already was, working, proven, and
untouched.

### SE Lens

Why pass the existing `InventoryViewModel` into `DashboardPage`'s
constructor, rather than having `DashboardPage` construct its own fresh
one? Because a fresh `InventoryViewModel` would mean a second,
independent database load — genuinely wasteful, and worse, a second
in-memory `Items` collection completely disconnected from the one
`InventoryPage` is actively showing and editing; any change made on one
screen wouldn't reflect on the other at all. Sharing the one real
instance is what makes "navigate to the dashboard, see current data;
navigate back, everything's still there" true without any extra
synchronization code.

### Commands Needed

```bash
dotnet run
```

### Run It

On your Windows machine: click Dashboard — a real summary screen
appears, every number matching what Lessons 30–32 already proved
correct independently. Click "Back to Inventory" — the exact same
`InventoryPage`, with any filters or selections you'd set before
navigating away, is exactly as you left it.

### Connection

Epic 8 is complete: totals, breakdowns, rankings, and gaps are all real,
correctly computed, and now visible together. Epic 9 turns to a
different kind of correctness — getting data safely *out* of this
project, starting with CSV export and the real escaping rules a naive
"just join with commas" approach would get wrong.

---

## Closing

### Connect the Pieces

Clicking Dashboard passes the current `InventoryViewModel` — the exact
same object `InventoryPage` has been using all along — into a new
`DashboardPage`, whose every binding resolves against properties proven
correct across three separate lessons: `TotalValue`'s honestly-rounded
`SUM()` (Lesson 30), `CategoryTotals`' real `GROUP BY` breakdown (Lesson
31), and `TopValuableItems`/`ItemsMissingPurchaseDate`'s correctly
ordered and filtered queries (Lesson 32). Clicking "Back to Inventory"
calls `GoBack()`, returning to the cached `InventoryPage` instance —
proven, with real output, to be the identical object, not a freshly
reloaded one, in this lesson's own first unit.

### What Breaks Without This

Temporarily change `DashboardButton_Click` to construct
`DashboardPage`'s `InventoryViewModel` fresh —
`new DashboardPage(new InventoryViewModel())` instead of passing the
existing one — and rerun. Add an item, then click Dashboard. Real,
representative failure: the dashboard's `TotalValue` and every other
figure reflect the database's state *before* that new item was added —
a second, genuinely different `InventoryViewModel`, freshly loaded from
disk, with no idea about the change still sitting unsaved in memory on
`InventoryPage`'s own instance (or, if the add already persisted,
correctly reflecting the database but demonstrating the deeper problem:
two independent view-models that happen to agree only by coincidence,
not by design). Restore passing the real, shared `viewModel` afterward.

### Exercises

- In the `lab-navcache` throwaway pattern, navigate through three pages
  in sequence (`PageA → PageB → PageC`) and call `GoBack()` twice —
  confirm, with real output, you land back on the original `PageA`
  instance, state intact.
- Predict, in your own words, what would happen to `DashboardPage`'s
  bindings if `InventoryViewModel` were passed in *before*
  `InitializeComponent()` runs, instead of after — does XAML parsing
  depend on `DataContext` being set at any particular point? Reason from
  what you know about `InitializeComponent()`'s role (Lesson 1) before
  testing it.
- Add a fifth summary — total item count across the whole inventory,
  archived or not — to `DashboardPage`, reusing (not duplicating) an
  existing property if one already provides it, or writing one new,
  minimal property if none does.

### Definition of Done

- [ ] `DashboardPage` exists, showing `TotalValue`, `CategoryTotals`,
      `TopValuableItems`, and `ItemsMissingPurchaseDate` together.
- [ ] Navigating to the dashboard and back preserves `InventoryPage`'s
      full state — no data reload, no lost filters.
- [ ] No new SQL queries were written for this lesson — every figure
      reuses an existing, already-proven property.
- [ ] You reproduced the fresh-ViewModel regression on purpose, confirmed
      the dashboard shows stale or disconnected data, and restored the
      real, shared `viewModel` reference.
- [ ] Committed with a message stating why: for example,
      `git commit -m "Add a Dashboard page composing existing summary queries — Epic 8 complete"`.
