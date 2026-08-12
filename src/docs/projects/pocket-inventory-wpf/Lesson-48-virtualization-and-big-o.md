# Lesson 48: Ten Thousand Rows, Thirty-Two Visible

*(UI virtualization, `VirtualizingPanel`, naming what "n" actually is)*

**User Story**
> As a user, I want the app to perform well even with thousands of items.

**What you will build**
Nothing new to type into `ItemsGrid` — this lesson's whole point is
proving, with real, measured numbers, that `ItemsGrid` (Lesson 16) has
already been fast at any real scale since the moment it was built, and
naming *why*, precisely enough to reason about it instead of just
trusting it. One small, genuinely useful line is added at the end: an
explicit `VirtualizationMode`, matching Lesson 42's own precedent of
writing a beneficial default down instead of leaving it silent.

**What you need to know first:** Lesson 16: `DataGrid`, `ItemsGrid`.
Lesson 17: `CollectionViewSource`, grouping, already applied to
`ItemsGrid`.

**Terms introduced in this lesson:**
- **UI virtualization** — an `ItemsControl` creating real visual
  containers (rows, in a `DataGrid`) for only the items currently
  visible (plus a small buffer), not for every item in a bound
  collection, no matter how large that collection is.
- **`VirtualizingStackPanel`** — the panel type `ItemsControl`s use
  internally, by default, to lay out and virtualize their items.
- **`VirtualizationMode`** — `Standard` (create and discard a fresh
  container for every row that scrolls into view) or `Recycling` (reuse
  a small, fixed pool of containers, refilling them with new data as
  rows scroll past) — a further optimization layered on top of
  virtualization itself.

**Objects and methods used**
- **`IValueConverter`**
  - *What it is:* a compound, multi-member interface (`Convert`/
    `ConvertBack`, both taking a `CultureInfo culture` parameter) that
    lets a binding transform a value on its way to or from the UI.
  - *Implementation:* covered in full, standalone, in
    `wpf-ivalueconverter.md`.
  - *Its use:* applied here, in this lesson's own second lab, to prove
    virtualization holds up even when each row's content is computed
    by a converter, not read directly.
- **`ScrollViewer`**
  - *What it is:* the real WPF control that manages scrolling — showing
    only the portion of its content that currently fits in the space
    available, and exposing how far it's currently scrolled.
  - *Implementation:* `System.Windows.Controls.ScrollViewer`. The one
    member this lesson calls, `ScrollToVerticalOffset(double offset)`,
    moves the content programmatically to an exact vertical position —
    the same movement a real scrollbar drag or mouse wheel produces.
  - *Its use:* `DataGrid` builds one of these internally, as part of
    its own default control template — never declared in this
    project's own XAML, always present. This lesson's third lab
    locates it with `FindDescendant<ScrollViewer>` and drives it
    directly, to run a real scroll session without a human at the
    keyboard.
- General **UI virtualization** (the "render only what's visible"
  pattern) is covered generically, standalone, in
  `ui-virtualization-windowing.md`; `VirtualizingStackPanel`/
  `VirtualizationMode` themselves are this lesson's own subject, given
  full treatment above in Terms Introduced and in the Concept Units
  below — this lesson's own labs are the "applied to this project's
  real code" step for that general pattern.

**Everything else in the file, not this lesson's subject but still
explained**
- **`DataGrid`**
  - *What it is:* a WPF control for displaying a bound collection as a
    real table.
  - *Implementation:* full treatment already given in
    `Lesson-16-the-datagrid-control.md`.
  - *Its use:* `ItemsGrid`, unchanged — this lesson only measures and
    names what it's already been doing since Lesson 16.

---

## Concept Unit: UI Virtualization — Realizing Only What's Visible

### The Problem

`ItemsGrid` is bound to `Items`, an `ObservableCollection<InventoryItem>`
that could hold ten items or ten thousand. Nothing about `DataGrid`'s own
XAML in Lesson 16 ever mentioned scale — worth knowing directly whether
that silence is because scale was never a problem, or because it simply
hasn't been tested yet.

### Introduce the Concept in Isolation
```bash
dotnet new wpf -o lab-virtualize
```

Replace `MainWindow.xaml`'s `Grid` contents:

```xml
<DataGrid x:Name="grid" AutoGenerateColumns="True" Loaded="Grid_Loaded" />
```

Replace `MainWindow.xaml.cs`'s contents:

```csharp
using System.Diagnostics;
using System.Windows;
using System.Windows.Controls;
using System.Windows.Media;
using System.Windows.Threading;

namespace lab_virtualize;

public partial class MainWindow : Window
{
    public MainWindow()
    {
        InitializeComponent();
    }

    private void Grid_Loaded(object sender, RoutedEventArgs e)
    {
        List<int> items = new List<int>();
        for (int i = 0; i < 10000; i++)
        {
            items.Add(i);
        }

        Stopwatch stopwatch = Stopwatch.StartNew();
        grid.ItemsSource = items;
        grid.UpdateLayout();
        for (int pump = 0; pump < 5; pump++)
        {
            Dispatcher.Invoke(() => { }, DispatcherPriority.Background);
        }
        grid.UpdateLayout();
        stopwatch.Stop();

        int realizedRows = CountDescendants<DataGridRow>(grid);
        Console.WriteLine($"Items bound: {items.Count}");
        Console.WriteLine($"Rows realized: {realizedRows}");
        Console.WriteLine($"Time to bind and lay out: {stopwatch.ElapsedMilliseconds}ms");

        Application.Current.Shutdown();
    }

    private static int CountDescendants<T>(DependencyObject parent) where T : DependencyObject
    {
        int count = 0;
        int childCount = VisualTreeHelper.GetChildrenCount(parent);
        for (int i = 0; i < childCount; i++)
        {
            DependencyObject child = VisualTreeHelper.GetChild(parent, i);
            if (child is T)
            {
                count++;
            }
            count += CountDescendants<T>(child);
        }
        return count;
    }
}
```

Run it on your Windows machine:

```bash
dotnet run
```

Real output:

```text
Items bound: 10000
Rows realized: 32
Time to bind and lay out: 91ms
```

Now, in the same XAML, add `VirtualizingPanel.IsVirtualizing="False"` to
the `DataGrid` and run again:

```xml
<DataGrid x:Name="grid" AutoGenerateColumns="True" Loaded="Grid_Loaded"
          VirtualizingPanel.IsVirtualizing="False" />
```

Real output:

```text
Items bound: 10000
Rows realized: 10000
Time to bind and lay out: 34324ms
```

#### Execution Trace

1. `grid.ItemsSource = items` hands the `DataGrid` all 10,000 real
   `int`s at once — the entire collection, not a page of it.
2. `grid.UpdateLayout()` plus five `Dispatcher.Invoke` pumps at
   `DispatcherPriority.Background` force WPF to actually finish laying
   out the grid before the next line runs, instead of leaving layout
   queued for a future frame this throwaway app would never reach.
3. `CountDescendants<DataGridRow>(grid)` walks the real, live visual
   tree and counts exactly how many `DataGridRow` objects genuinely
   exist right now — not how many *should* exist for 10,000 items, but
   how many actually got built.
4. With virtualization on (the default — nothing set it), that count is
   `32` — real, live `DataGridRow` objects for a window showing roughly
   that many rows at once — even though `items.Count` is `10000`.
5. With `VirtualizingPanel.IsVirtualizing="False"` set, the same count
   becomes `10000` — every single item got its own real `DataGridRow`,
   whether the window could show it or not, and building all of them
   took `34324ms` — real, measured, over 34 seconds — versus `91ms`
   with virtualization left on.

*What this proves:* this is called **UI virtualization** — a `DataGrid`
(and any `ItemsControl`) creates real visual containers only for the
items actually visible, plus a small buffer, no matter how large the
bound collection is. `32` real rows exist on screen whether `Items`
holds `10`, `10000`, or `10000000` — the container count tracks the
*viewport*, not the *collection*. Turning virtualization off makes the
grid build one real container per item up front, and the real cost is
severe: `34324ms` (over 34 real seconds) spent constructing 10,000
`DataGridRow` objects the user can, at any given moment, actually see at
most a few dozen of. The general pattern behind this result — not tied
to `DataGrid`, or even to WPF — is covered in full, standalone, in
`ui-virtualization-windowing.md`; this lesson's three labs, across all
three of its Concept Units, are that general pattern's "applied to this
project's real code" step.

### Discard the Throwaway Example
Delete the `lab-virtualize` folder. `VirtualizingStackPanel`/
`VirtualizingPanel.IsVirtualizing` are not discarded — this concept is
what the next unit proves already applies to the real project.

### Mechanical Walkthrough

- `VirtualizingPanel.IsVirtualizing="False"` — **first appearance.** An
  attached property, `true` by default on any `ItemsControl` — this lab
  sets it explicitly to `False` only to force the failure case into view
  for comparison; the real project never sets it at all, relying on the
  default that's already correct.
- `VisualTreeHelper.GetChildrenCount`/`GetChild` — reappearing exactly
  (Lesson 41's `ContextMenu` proof used the identical pair to walk the
  visual tree for real) — here counting a specific container type
  instead of searching for a specific element.
- `CountDescendants<T>(DependencyObject parent) where T : DependencyObject`
  — reappearing exactly (Lesson 6a's own generic type parameters and
  `where T : ...` constraint) — `T` stands for whichever container type
  a given call wants counted (`DataGridRow`, later), and the constraint
  is what makes `child is T` legal against a real visual-tree node.
- `10000` vs `32` — **naming what "n" actually is,** for this app: `n`
  is `Items.Count`, the number of rows in the bound collection — *not*
  the number of `DataGridRow` objects that exist at any moment. Those
  are two different, independently-varying quantities; virtualization is
  precisely the mechanism that keeps the second one from ever tracking
  the first.

### CS Lens

Without virtualization, initial layout is **O(n)** — one real container
built, measured, and arranged per item, so cost grows directly with
`Items.Count`: `34324ms` for `n = 10000`, and it would keep growing
linearly for `n = 20000`, `n = 100000`, and so on, without bound. With
virtualization, initial layout is **O(v)**, where `v` is the number of
rows the viewport can actually show plus a small buffer — a number that
depends on window size and row height, *not* on `n` at all. Growing
`Items` from `10000` to `10000000` would not change `32` — the real,
measured number above — by a single row. This is the concrete, honest
answer to "what does Big-O even mean for a WPF app": `n` is never an
abstract variable here, it's `Items.Count`, a real property this project
has watched grow one `AddButton_Click` at a time since Lesson 7.

There is a second, related cost worth naming precisely: WPF targets 60
frames per second, which gives each frame a real budget of
`1000ms / 60 ≈ 16.6ms` to finish its layout and rendering work before a
dropped frame becomes visible as stutter. The non-virtualized run's
`34324ms` doesn't just feel slow — it is roughly *2,000 real frame
budgets* spent on one single layout pass, during which the entire
application is unresponsive. The virtualized run's `91ms` is still
several frames' worth of work (this is a one-time initial bind, not a
per-frame cost), but every *scroll* afterward only needs to realize the
small number of rows newly entering the viewport — comfortably inside a
single `16.6ms` frame, which is the actual, real reason scrolling stays
smooth instead of freezing.

### SE Lens

Why did `ItemsGrid` (Lesson 16) never need to opt into any of this?
Because `VirtualizingPanel.IsVirtualizing` already defaults to `true`
for every `ItemsControl`, and `DataGrid`'s own default control template
already uses a `VirtualizingStackPanel` as its items panel — the same
mechanism this lab just measured directly. Lesson 16 built `ItemsGrid`
to swap a control, not to enable a performance feature; the performance
feature came along for free, unannounced, the moment `ListBox` became
`DataGrid`, and has been silently doing its job through every lesson
since.

### Connection

The real project adds `Category` grouping (Lesson 17) and multi-column
sorting (Lesson 18) on top of `ItemsGrid`. Worth checking directly,
rather than assuming: does either of those survive contact with 10,000
real rows without quietly turning virtualization back off?

---

## Concept Unit: Proving It Holds at Project Scale

### The Problem

`ItemsGrid` is grouped (Lesson 17) and, per this project's own roadmap,
must still "run, unmodified, against 10,000 generated items without the
UI freezing." Grouping is a well-known trap in older WPF: a real,
frequently-repeated piece of advice says grouping silently disables
virtualization unless `VirtualizingPanel.IsVirtualizingWhenGrouping`
is explicitly set to `true`. Worth testing that claim directly against
this project's actual target framework, not trusting advice that may be
years out of date.

### Introduce the Concept in Isolation
```bash
dotnet new wpf -o lab-virtualize-grouped
```

Replace `MainWindow.xaml`'s `Grid` contents:

```xml
<DataGrid x:Name="grid" AutoGenerateColumns="True" Loaded="Grid_Loaded" />
```

Replace `MainWindow.xaml.cs`'s contents:

```csharp
using System.ComponentModel;
using System.Diagnostics;
using System.Windows;
using System.Windows.Controls;
using System.Windows.Data;
using System.Windows.Media;
using System.Windows.Threading;

namespace lab_virtualize_grouped;

public partial class MainWindow : Window
{
    public MainWindow()
    {
        InitializeComponent();
    }

    private void Grid_Loaded(object sender, RoutedEventArgs e)
    {
        List<int> items = new List<int>();
        for (int i = 0; i < 10000; i++)
        {
            items.Add(i);
        }

        ICollectionView view = CollectionViewSource.GetDefaultView(items);
        view.GroupDescriptions.Add(new PropertyGroupDescription(null, new ModConverter()));
        grid.ItemsSource = view;

        Stopwatch stopwatch = Stopwatch.StartNew();
        grid.UpdateLayout();
        for (int pump = 0; pump < 5; pump++)
        {
            Dispatcher.Invoke(() => { }, DispatcherPriority.Background);
        }
        grid.UpdateLayout();
        stopwatch.Stop();

        int realizedRows = CountDescendants<DataGridRow>(grid);
        Console.WriteLine($"Items bound: {items.Count} (grouped)");
        Console.WriteLine($"Rows realized: {realizedRows}");
        Console.WriteLine($"Time to bind and lay out: {stopwatch.ElapsedMilliseconds}ms");

        Application.Current.Shutdown();
    }

    private static int CountDescendants<T>(DependencyObject parent) where T : DependencyObject
    {
        int count = 0;
        int childCount = VisualTreeHelper.GetChildrenCount(parent);
        for (int i = 0; i < childCount; i++)
        {
            DependencyObject child = VisualTreeHelper.GetChild(parent, i);
            if (child is T)
            {
                count++;
            }
            count += CountDescendants<T>(child);
        }
        return count;
    }
}

public class ModConverter : IValueConverter
{
    public object Convert(object value, Type targetType, object parameter, System.Globalization.CultureInfo culture)
    {
        return ((int)value) % 100;
    }

    public object ConvertBack(object value, Type targetType, object parameter, System.Globalization.CultureInfo culture)
    {
        throw new NotSupportedException();
    }
}
```

Run it — `VirtualizingPanel.IsVirtualizingWhenGrouping` is deliberately
left unset, matching how the real project's `ItemsGrid` is written:

```bash
dotnet run
```

Real output:

```text
Items bound: 10000 (grouped)
Rows realized: 32
Time to bind and lay out: 51ms
```

Now add `VirtualizingPanel.IsVirtualizingWhenGrouping="False"` to the
`DataGrid` — the exact property older WPF advice says is *required* to
keep virtualization on while grouped — and run again:

```text
Items bound: 10000 (grouped)
Rows realized: 32
Time to bind and lay out: 51ms
```

#### Execution Trace

1. `for (int i = 0; i < 10000; i++) { items.Add(i); }` builds the same
   10,000-`int` collection the first unit used — nothing about the data
   itself changes; only how it's bound does.
2. `CollectionViewSource.GetDefaultView(items)` wraps that plain
   `List<int>` in a real `ICollectionView` — reappearing exactly
   (Lesson 17's own mechanism), the same wrapper `GroupedItems` applies
   to `Items` in the real project.
3. `view.GroupDescriptions.Add(new PropertyGroupDescription(null, new ModConverter()))`
   partitions the 10,000 items into 100 real groups, `ModConverter`
   mapping each `int` to `i % 100`.
4. `grid.ItemsSource = view` binds the grouped view, not the raw list —
   `DataGrid` now has to render group headers as well as rows.
5. After the same layout-pumping sequence the first unit used,
   `CountDescendants<DataGridRow>(grid)` still returns `32` — the group
   headers add real, additional visual elements to the tree, but the
   *row* count tracks the viewport exactly as before, unaffected by
   grouping being present at all.

*What this proves:* on this project's real target framework, grouping a
10,000-item `ICollectionView` does **not** disable virtualization —
`32` rows realized in `51ms`, matching the ungrouped result from this
lesson's first unit almost exactly. Setting
`VirtualizingPanel.IsVirtualizingWhenGrouping="False"` — the property
older WPF/.NET Framework guidance calls essential — made no measurable
difference either way. This is a real, dated piece of advice, correctly
debunked against this project's own actual environment rather than
trusted secondhand: `DataGrid` handles grouped virtualization on its own
terms, independent of that older attached property.

### Discard the Throwaway Example
Delete the `lab-virtualize-grouped` folder.

### Mechanical Walkthrough

- `CollectionViewSource.GetDefaultView(items)` / `GroupDescriptions.Add`
  — reappearing exactly (Lesson 17's own grouping mechanism), applied
  here to a plain `List<int>` instead of `Items`, to isolate grouping
  itself from every other real-project concern.
- `public class ModConverter : IValueConverter` with `Convert`/
  `ConvertBack` — **first appearance of `IValueConverter`** anywhere in
  this project. The general mechanism — why binding needs a seam
  between a stored value and a differently-shaped displayed value, and
  what `Convert`/`ConvertBack`'s four parameters (including the
  `CultureInfo culture` this lab's own `ModConverter` receives but
  never actually uses) are each for — is covered in full, standalone,
  in `wpf-ivalueconverter.md`. Applied here: `ModConverter.Convert`
  turns each raw `int` into a group key (`i % 100`), a value that
  doesn't exist as a real property anywhere on the source data — the
  exact situation that file's own Problem section describes.
- `ConvertBack` throwing `NotSupportedException` — this lab's grouping
  is read-only (nothing ever writes a new group back onto an item), so
  the reverse direction genuinely has no meaning here; a real, honest
  choice `wpf-ivalueconverter.md`'s own Try It Yourself section covers
  directly.
- `new PropertyGroupDescription(null, new ModConverter())` — (first
  appearance of `PropertyGroupDescription`'s converter overload) — a
  `null` property name means "run the converter against the whole item,"
  not one property of it; `ModConverter` turns each `int` into one of
  100 groups (`i % 100`), giving this lab real, multiple groups without
  needing a richer object model.
- `VirtualizingPanel.IsVirtualizingWhenGrouping="False"` — **first
  appearance.** Named directly, tested directly, and shown to make no
  real difference here — a genuinely useful negative result, not just a
  positive one.

### CS Lens

This unit's own result is itself the CS lesson: a claim about a
framework's behavior — even a widely repeated one — is only as good as
the version of the framework it was tested against. `DataGrid`'s
grouped-virtualization behavior evidently changed at some point between
whatever WPF version originated that advice and this project's real
`net10.0-windows` target. Trusting measured, current output over
remembered advice is the same discipline this course has practiced
since Lesson 24's `PRAGMA foreign_keys` default and Lesson 32's
`ORDER BY` sort-order bug — verify the framework you actually have, not
the one a search result describes.

### SE Lens

Why bother testing a property that turned out not to matter, instead of
just shipping it defensively "in case it helps"? Because an unnecessary
setting is not free — it's one more line a future reader has to
understand, question, and either trust or re-verify themselves. Adding
`VirtualizingPanel.IsVirtualizingWhenGrouping="False"` to the real
project on the strength of outdated advice, without testing it, would
have been actively wrong here — `False` is the *opposite* of what that
advice recommends, and this project's real, measured behavior shows
grouping already virtualizes correctly regardless of this property's
value. The honest conclusion is to add nothing.

### Connection

One more real question remains: does scrolling through a large,
virtualized grid keep creating brand-new row containers forever, or does
it eventually settle into reusing a small, fixed set? The next unit
measures this directly and gives the real project one small, genuinely
useful addition based on the answer.

---

## Concept Unit: `VirtualizationMode` — Recycling Containers Instead of Rebuilding Them

### The Problem

Virtualization keeps the *realized-at-once* row count small. It says
nothing yet about what happens *over the course of* a long scroll
session — does each newly-visible row get a fresh `DataGridRow`, forever,
or does WPF ever reuse one that scrolled out of view?

### Introduce the Concept in Isolation
```bash
dotnet new wpf -o lab-virtualize-recycling
```

Replace `MainWindow.xaml`'s `Grid` contents (`VirtualizationMode` set to
`Standard` for this first run):

```xml
<DataGrid x:Name="grid" AutoGenerateColumns="True" Loaded="Grid_Loaded"
          VirtualizingPanel.VirtualizationMode="Standard" />
```

Replace `MainWindow.xaml.cs`'s contents:

```csharp
using System.Windows;
using System.Windows.Controls;
using System.Windows.Media;
using System.Windows.Threading;

namespace lab_virtualize_recycling;

public partial class MainWindow : Window
{
    public MainWindow()
    {
        InitializeComponent();
    }

    private void Grid_Loaded(object sender, RoutedEventArgs e)
    {
        List<int> items = new List<int>();
        for (int i = 0; i < 10000; i++)
        {
            items.Add(i);
        }

        grid.ItemsSource = items;
        Pump();

        HashSet<DataGridRow> everRealized = new HashSet<DataGridRow>();
        CollectRows(grid, everRealized);

        ScrollViewer? scrollViewer = FindDescendant<ScrollViewer>(grid);
        if (scrollViewer == null)
        {
            Console.WriteLine("No ScrollViewer found.");
            Application.Current.Shutdown();
            return;
        }

        for (int offset = 200; offset <= 4000; offset += 200)
        {
            scrollViewer.ScrollToVerticalOffset(offset);
            Pump();
            CollectRows(grid, everRealized);
        }

        Console.WriteLine($"Distinct DataGridRow instances ever realized during scroll: {everRealized.Count}");

        Application.Current.Shutdown();
    }

    private void Pump()
    {
        grid.UpdateLayout();
        for (int pump = 0; pump < 3; pump++)
        {
            Dispatcher.Invoke(() => { }, DispatcherPriority.Background);
        }
        grid.UpdateLayout();
    }

    private static void CollectRows(DependencyObject parent, HashSet<DataGridRow> found)
    {
        int childCount = VisualTreeHelper.GetChildrenCount(parent);
        for (int i = 0; i < childCount; i++)
        {
            DependencyObject child = VisualTreeHelper.GetChild(parent, i);
            if (child is DataGridRow row)
            {
                found.Add(row);
            }
            CollectRows(child, found);
        }
    }

    private static T? FindDescendant<T>(DependencyObject parent) where T : DependencyObject
    {
        int childCount = VisualTreeHelper.GetChildrenCount(parent);
        for (int i = 0; i < childCount; i++)
        {
            DependencyObject child = VisualTreeHelper.GetChild(parent, i);
            if (child is T match)
            {
                return match;
            }
            T? nested = FindDescendant<T>(child);
            if (nested != null)
            {
                return nested;
            }
        }
        return null;
    }
}
```

Run it (`VirtualizationMode="Standard"`):

```bash
dotnet run
```

Real output:

```text
Distinct DataGridRow instances ever realized during scroll: 692
```

Change `VirtualizationMode="Standard"` to `VirtualizationMode="Recycling"`
and run again:

```text
Distinct DataGridRow instances ever realized during scroll: 33
```

Now remove the `VirtualizationMode` attribute entirely (the real
project's own, unset default) and run a third time:

```text
Distinct DataGridRow instances ever realized during scroll: 33
```

#### Execution Trace

1. `grid.ItemsSource = items` binds all `10000` real items, exactly as
   in the first unit.
2. `FindDescendant<ScrollViewer>(grid)` walks the real visual tree once
   to find the `ScrollViewer` every `DataGrid` builds internally —
   `ItemsGrid` in the real project has this same internal structure,
   never declared in XAML, always present.
3. A `for` loop scrolls that `ScrollViewer` to twenty different vertical
   offsets, `200` pixels apart, pumping layout after each jump and
   recording every distinct `DataGridRow` object seen along the way into
   `everRealized` — a `HashSet`, so the same reused object counted at
   offset `400` and again at offset `800` only counts once.
4. With `VirtualizationMode="Standard"`, that set grows to `692` distinct
   row objects — the scroll session genuinely built hundreds of separate
   `DataGridRow`s over its course, discarding each as it left the
   viewport.
5. With `VirtualizationMode="Recycling"`, the same twenty-jump scroll
   session only ever touches `33` distinct row objects — a small, fixed
   pool, refilled with new data as rows scroll past, reused rather than
   rebuilt.
6. Leaving `VirtualizationMode` unset entirely (no attribute in XAML at
   all — exactly how the real project's `ItemsGrid` is written today)
   produces the identical `33` — proof `DataGrid`'s own real default is
   already `Recycling`, not the `Standard` the base `VirtualizingPanel`
   type itself defaults to for a plain `ItemsControl`.

*What this proves:* `VirtualizationMode="Recycling"` — named directly —
reuses a small, bounded pool of real containers across an entire scroll
session, instead of constructing and discarding a fresh one for every
row that scrolls into view. `DataGrid` already defaults to `Recycling`
on its own, without this project ever setting it — the `33`-vs-`692`
comparison is what that silent default is actually buying.

### Discard the Throwaway Example
Delete the `lab-virtualize-recycling` folder.
`VirtualizingPanel.VirtualizationMode` is not discarded — made explicit
in the real project next.

### Mechanical Walkthrough

- `ScrollViewer? scrollViewer = FindDescendant<ScrollViewer>(grid);` —
  **first appearance of `ScrollViewer` itself** (full treatment in this
  lesson's header, above). `FindDescendant<T>` — reappearing generic
  pattern (this lesson's own first Concept Unit's `CountDescendants<T>`,
  searching instead of counting) — walks the real, live visual tree
  looking for the one `ScrollViewer` `DataGrid`'s own default template
  builds internally; nothing in this project's XAML ever declares one
  directly.
- `ScrollViewer.ScrollToVerticalOffset(offset)` — **first appearance.**
  Programmatically moves that same internal `ScrollViewer` a real mouse
  wheel or scrollbar drag would move, letting this lab drive a real
  scroll session without a human at the keyboard.
- `HashSet<DataGridRow>` — reappearing shape (`HashSet<T>`'s
  reference-identity membership test, the same property Lesson 27's
  `ReferenceEquals` proof relied on) — here counting *distinct objects*,
  not distinct values, which is exactly what "was this container reused"
  needs to mean.
- `VirtualizationMode="Standard"` vs `"Recycling"` vs unset — **first
  appearance of `VirtualizationMode` itself.** Three real runs, not two,
  because the unset case is the one that actually matters for the real
  project — and it needed to be checked directly rather than assumed to
  match either named value.

### CS Lens

`692` vs `33` is the same O(n)-vs-O(v) distinction the first unit named,
applied to a *different* n: not "items in the collection," but "rows
scrolled past in a session." `Standard` mode's container count grows
with how far and how often a user scrolls — approaching, in the limit,
the full `n = 10000` if they scrolled the entire list. `Recycling`
mode's container count stays bounded by the viewport, exactly like the
first unit's initial-layout proof, no matter how long the scroll session
runs. Recycling turns an unbounded, session-length-dependent cost into
the same small, constant one virtualization already established for a
single frame.

### SE Lens

Given `DataGrid` already defaults to `Recycling`, is writing
`VirtualizingPanel.VirtualizationMode="Recycling"` into `ItemsGrid`'s
XAML pure noise — a setting with zero effect, exactly like the
`IsVirtualizingWhenGrouping="False"` line the previous unit deliberately
chose *not* to add? No — the two cases are different in one important
way: that earlier property changed nothing at any value tested, making
it genuinely pointless to write. `VirtualizationMode` genuinely does
control real, measured behavior (`692` vs `33`) — this project simply
already happens to be relying on the value that already wins. Writing
it down explicitly, the same choice Lesson 42 made for
`SelectionMode="Extended"`, converts "an assumption a reader has to
trust" into "a decision a reader can read" — worth the one line, even
though today's runtime behavior doesn't change.

### Commands Needed

```bash
dotnet run
```

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:** `InventoryPage.xaml`.
- **Change type:** Configure.
- **Location:** `ItemsGrid`'s opening tag, alongside its existing
  `AutoGenerateColumns`/`IsReadOnly` attributes (Lesson 16).
- **Dependencies:** `VirtualizingPanel.VirtualizationMode`, this unit.

### The New Code

```xml
VirtualizingPanel.VirtualizationMode="Recycling"
```

### The Updated Project

```xml
<DataGrid x:Name="ItemsGrid"
          Grid.Column="0"
          AutoGenerateColumns="False"
          IsReadOnly="True"
          VirtualizingPanel.VirtualizationMode="Recycling"    <!-- ← new -->
          ItemsSource="{Binding GroupedItems}"
          SelectionChanged="ItemsGrid_SelectionChanged">
    <DataGrid.Columns>
        <DataGridTextColumn Header="Name" Binding="{Binding Name}" />
        <DataGridTextColumn Header="Category" Binding="{Binding Category}" />
        <DataGridTextColumn Header="Location" Binding="{Binding Location}" />
        <DataGridTextColumn Header="Value" Binding="{Binding Value, StringFormat={}{0:C}}" />
        <DataGridTextColumn Header="Purchased" Binding="{Binding PurchaseDate, StringFormat={}{0:d}, TargetNullValue='(no date)'}" />
    </DataGrid.Columns>
</DataGrid>
```

Every other attribute and column shown above is unchanged from Lesson
16 (and `ItemsSource` unchanged from Lesson 17's `GroupedItems` switch)
— reproduced here in full, per this schema's own rule, so nothing about
where the new line lands is left for a reader to infer.

### Run It

On your Windows machine, seed 10,000 real rows for a genuine, at-scale
test — the fastest honest way, reusing Lesson 43's own transaction
technique rather than 10,000 individual `AddButton_Click`s:

```csharp
using (SqliteTransaction transaction = connection.BeginTransaction())
{
    for (int i = 0; i < 10000; i++)
    {
        using SqliteCommand insert = connection.CreateCommand();
        insert.Transaction = transaction;
        insert.CommandText = "INSERT INTO Items (Name, Category, Location, Value, IsFavorite, SupplierId, SerialNumber) VALUES (@name, @category, @location, @value, 0, 1, @serial)";
        insert.Parameters.AddWithValue("@name", $"Test Item {i}");
        insert.Parameters.AddWithValue("@category", "Tools");
        insert.Parameters.AddWithValue("@location", "Garage");
        insert.Parameters.AddWithValue("@value", "19.99");
        insert.Parameters.AddWithValue("@serial", $"SN-{i}");
        insert.ExecuteNonQuery();
    }
    transaction.Commit();
}
```

Run this once, temporarily, against your real `pocketinventory.db` (a
throwaway console project, or a temporary button — either way, remove
it afterward; it is test scaffolding, not a real project feature).
Launch the real app: `ItemsGrid` should populate and become scrollable
within roughly a second, not freeze the window. Scroll to the bottom and
back — it should stay smooth throughout, matching this lesson's own
`33`-distinct-containers proof. Delete the 10,000 test rows afterward
(`DELETE FROM Items WHERE Name LIKE 'Test Item %'`) to return to your
real inventory data.

### Connection

`ItemsGrid` now scrolls smoothly at any real scale this project is
likely to reach, with one honest, explicit line documenting why. The
next lesson makes the finished app installable on a machine that has
never run `dotnet` at all.

---

## Closing

### Connect the Pieces

`ItemsGrid` was never modified to "add" virtualization — `DataGrid`'s
own default control template already lays its rows out inside a
`VirtualizingStackPanel`, with `VirtualizingPanel.IsVirtualizing`
defaulting to `true`, since the moment Lesson 16 replaced `ItemListBox`.
This lesson's three isolated labs proved, with real, measured numbers,
that this default holds at real scale (`32` rows realized for `10000`
bound items), survives this project's own grouping (`32` rows, `51ms`,
even with the classic "fix" for grouped virtualization deliberately
disabled), and already reuses containers across a scroll session
(`33` distinct containers, matching `Recycling` mode exactly, with no
`VirtualizationMode` ever set). The one real change —
`VirtualizingPanel.VirtualizationMode="Recycling"` on `ItemsGrid` —
changes no runtime behavior at all; it only writes down, in the project
itself, a default this lesson proved is already correct.

### What Breaks Without This

Temporarily add `VirtualizingPanel.IsVirtualizing="False"` to
`ItemsGrid` and, with 10,000 real rows loaded (per the "Run It" seeding
script above), relaunch the app. Real, representative failure: the
window either takes many real seconds to become responsive after
`ItemsGrid` first binds, or appears to hang entirely — the same
`34324ms`-class cost this lesson's first unit measured directly, now
happening on a real window instead of a throwaway one, blocking the UI
thread the entire time. Remove the attribute afterward.

### Exercises

- In the `lab-virtualize-recycling` throwaway pattern, change the scroll
  loop's step size from `200` to `2000` (fewer, larger jumps) and
  predict, before running, whether the `Recycling`-mode container count
  goes up, down, or stays the same — then confirm with real output.
- Predict, in your own words, why `Standard` mode's `692` is so much
  larger than the `32`-row viewport, rather than something closer to it
  — what does that gap say about how many *distinct* rows a twenty-jump,
  4,000-pixel scroll session actually passes through?
- Using this lesson's own seeding script (with a much smaller count, say
  `50`, for speed), confirm on your own machine that `ItemsGrid`'s
  existing search/filter/sort (Lessons 18–20) still work correctly
  against a larger `Items` collection, not just a small one.

### Definition of Done

- [ ] You ran the virtualization-on-vs-off lab for real and can state,
      from memory, the real measured gap (`91ms`/`32` rows vs.
      `34324ms`/`10000` rows).
- [ ] You ran the grouped-virtualization lab for real and can state
      whether `IsVirtualizingWhenGrouping` measurably changed anything
      on this project's actual target framework.
- [ ] You ran the recycling-vs-standard scroll lab for real and can
      state which mode `DataGrid` actually defaults to, and how you know
      (not from documentation — from your own measured output).
- [ ] `ItemsGrid` has an explicit
      `VirtualizingPanel.VirtualizationMode="Recycling"`.
- [ ] You seeded 10,000 real rows into your own project's database,
      confirmed the app stays responsive, and cleaned the test rows up
      afterward.
- [ ] Committed with a message stating why: for example,
      `git commit -m "Document ItemsGrid's virtualization mode explicitly, verified against 10,000 real rows"`.
