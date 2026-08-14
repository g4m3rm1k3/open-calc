# Lesson 11: Collections and ICollectionView

**What this covers:** `ObservableCollection<T>` (why a bound list updates
itself when items are added/removed), and `ICollectionView` (live sort,
filter, and group applied *on top of* a collection without copying or
mutating the underlying data).

**What you need to know first:** [Lesson 06](lesson-06-data-binding-fundamentals.md).

## `ObservableCollection<T>` — announces additions and removals

`INotifyPropertyChanged` (Lesson 06) announces "this property's *value*
changed." It says nothing about a `List<T>` gaining or losing an *item* —
adding to a plain `List<T>` a `ListBox` is bound to does not update the
UI, because nothing fired any notification at all:

```csharp
public ObservableCollection<Item> Items { get; } = new();
```

```xml
<ListBox ItemsSource="{Binding Items}" />
```

```csharp
Items.Add(new Item { Name = "Drill" });    // ListBox updates immediately
Items.RemoveAt(0);                          // ListBox updates immediately
```

`ObservableCollection<T>` — a real generic class in
`System.Collections.ObjectModel`, implementing `List<T>`'s everyday
surface (`Add`, `Remove`, `Count`, indexing, `foreach`) plus one more
real interface, `INotifyCollectionChanged`, with a `CollectionChanged`
event (the same `event` mechanism from Lesson 00b, again) that fires
automatically inside `Add`/`Remove`/`Clear` themselves. WPF's binding
engine subscribes to that event the moment `ItemsSource` is set, the
identical Observer-pattern relationship Lesson 06 named for
`PropertyChanged` — now watching the collection's membership instead of
one property's value. This is why `Items.Add(...)` above needs no manual
refresh call: the `ListBox` finds out the instant it happens, because
`ObservableCollection<T>` told it.

**The gotcha this doesn't cover:** `ObservableCollection<T>` announces
items being added or removed — it says nothing about an *existing* item's
own properties changing. `Items[0].Name = "New name";` fires no
`CollectionChanged` event at all (the collection's membership didn't
change, only something *inside* one of its items did) — that update only
reaches the UI if `Item` itself implements `INotifyPropertyChanged`
(Lesson 06) and fires `PropertyChanged` for `Name`. The two mechanisms
are complementary, not redundant: one for "the list changed," one for
"an item in the list changed," and a real bound list generally needs
both working correctly.

## The problem `ICollectionView` solves

A search box, a "sort by name" column header, and a "show favorites only"
checkbox all sound like they need three separate, hand-maintained copies
of `Items` — filtered, sorted, whatever's currently visible — kept in
sync by hand every time the underlying data changes. `ICollectionView`
is WPF's real answer: a *view* layered on top of one collection, applying
sort/filter/group without ever copying or mutating the actual data
underneath.

```csharp
private ICollectionView _itemsView;

public MainViewModel()
{
    _itemsView = CollectionViewSource.GetDefaultView(Items);
}

public ICollectionView ItemsView => _itemsView;
```

```xml
<ListBox ItemsSource="{Binding ItemsView}" />
```

`CollectionViewSource.GetDefaultView(Items)` — a real static method that
returns (creating one if it doesn't already exist) the default
`ICollectionView` wrapping `Items`. Binding the `ListBox` to `ItemsView`
instead of `Items` directly is what makes everything below actually
affect what's on screen.

## Live filtering — a `Predicate<T>`, re-applied automatically

```csharp
_itemsView.Filter = obj =>
{
    if (obj is not Item item) return false;
    return string.IsNullOrEmpty(SearchText) ||
           item.Name.Contains(SearchText, StringComparison.OrdinalIgnoreCase);
};
```

`.Filter` accepts a `Predicate<object>` — a delegate (Lesson 00b) shaped
`(object) => bool`: "should this item be visible?" Assigning it doesn't
filter once — the view re-runs this predicate against every item
whenever `.Refresh()` is called (typically wired to run whenever
`SearchText` itself changes, via `PropertyChanged`, Lesson 06). Nothing
is removed from `Items` itself — `Items.Count` stays the full,
unfiltered count; only what the *view* presents to the `ListBox` shrinks
and grows.

## Live sorting — `SortDescription`, declarative, not a manual `.Sort()` call

```csharp
_itemsView.SortDescriptions.Add(new SortDescription(nameof(Item.Name), ListSortDirection.Ascending));
```

`SortDescription` is a real `struct` (Lesson 00's value-type coverage) —
a small, copyable value naming a property (`nameof(Item.Name)`, Lesson
06's compiler-checked string trick again) and a direction. Adding it to
`.SortDescriptions` sorts the *view's* presentation order, live, with no
manual `Items.Sort()` call and no risk of accidentally reordering the
real underlying `ObservableCollection<T>` that other code might depend on
staying in insertion order.

## Live grouping — one flat collection, presented with headers

```csharp
_itemsView.GroupDescriptions.Add(new PropertyGroupDescription(nameof(Item.Category)));
```

```xml
<ListBox ItemsSource="{Binding ItemsView}">
    <ListBox.GroupStyle>
        <GroupStyle>
            <GroupStyle.HeaderTemplate>
                <DataTemplate>
                    <TextBlock Text="{Binding Name}" FontWeight="Bold" Background="LightGray" />
                </DataTemplate>
            </GroupStyle.HeaderTemplate>
        </GroupStyle>
    </ListBox.GroupStyle>
</ListBox>
```

`PropertyGroupDescription(nameof(Item.Category))` tells the view to
cluster items sharing the same `Category` value under a shared header,
without `Items` itself being restructured into nested groups anywhere —
still one flat `ObservableCollection<Item>` underneath; the *view* is
what's presenting it as sectioned. `GroupStyle.HeaderTemplate` — a
`DataTemplate` (Lesson 09) specifically for the header row itself, whose
`{Binding Name}` refers to the **group's** own `Name` (the shared
`Category` value for that cluster), not any one `Item`'s property — a
subtlety worth stating because it's easy to assume it's still binding to
an `Item`.

## Combining filter, sort, and grouping — all three, same view, at once

```csharp
_itemsView.Filter = FilterPredicate;
_itemsView.SortDescriptions.Add(new SortDescription(nameof(Item.Name), ListSortDirection.Ascending));
_itemsView.GroupDescriptions.Add(new PropertyGroupDescription(nameof(Item.Category)));
```

All three apply together, in this real order: filter first (deciding
membership), then group, then sort within each group — one `ListBox`,
one bound `ItemsView`, showing a live-searchable, grouped-by-category,
alphabetically-sorted-within-group list, with `Items` itself never
touched.

## SE Lens

The real alternative — three separate `ObservableCollection<Item>`
fields (`AllItems`, `FilteredItems`, `SortedItems`) manually kept in sync
— is real, working code, and a maintenance trap: every add/remove/edit
has to remember to update every derived copy, and it's easy to miss one
under real deadline pressure. `ICollectionView` is one source of truth
(`Items`) with presentation concerns (filter/sort/group) layered on as
*view* state, never duplicated data — the same "one source of truth"
principle Lesson 06 named for a single value, now applied to a whole
collection's presentation.

## What to check first in your assigned project

- Any hand-maintained "filtered copy" list sitting next to the real one
  is a concrete refactor candidate toward `ICollectionView` — a real,
  demonstrable improvement if "make it better" is part of your
  assignment.
- If a `DataGrid`/`ListBox` is bound directly to an `ObservableCollection<T>`
  (not a `.../View` property) and the project still has working
  search/sort/filter, look for manual list-rebuilding logic elsewhere —
  it's solving the same problem `ICollectionView` solves declaratively.
- `CollectionViewSource` can also be declared entirely in XAML (as a
  resource, bound via `{Binding Source={StaticResource ...}}`) instead of
  C# — if your project's XAML has a `<CollectionViewSource>` resource,
  that's this exact mechanism, XAML-side instead of code-behind.

## Next

[Lesson 12 — DataGrid and ListView In Depth](lesson-12-datagrid-and-listview.md)
covers the control most real assignment projects actually lean on for
tabular data — columns, editing, and selection.
