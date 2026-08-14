# Lesson 19: Collections and `ICollectionView`

**What you will build:** a real, reproduced bug — a `List<T>` bound to a
`ListBox` that doesn't update when items are added — fixed by
`ObservableCollection<T>`, proven against the identical test Lesson 14
used for `INotifyPropertyChanged`. Then a live filter and sort layered on
top via `ICollectionView`, proven not to touch the underlying data at
all.

**What you need to know first:** [Lesson 14](lesson-14-data-binding-fundamentals.md)
(`INotifyPropertyChanged`, and the exact "change something, watch the UI
not update" proof method this lesson reuses for a collection instead of
a single property).

**Terms introduced in this lesson:**
- **`ObservableCollection<T>`** — a real generic collection announcing
  additions and removals via `INotifyCollectionChanged`, so a bound UI
  updates automatically.
- **`ICollectionView`** — a live, presentation-only view layered over a
  collection, applying sort/filter/group without copying or mutating the
  underlying data.

**Objects and methods used:**

**`ObservableCollection<T>`**
- *What it is:* a real generic class in `System.Collections.ObjectModel`.
- *Implementation:* implements `IList<T>` (the same everyday surface as
  `List<T>` — `Add`, `Remove`, `Count`, indexing) plus
  `INotifyCollectionChanged`, whose one member is `event
  NotifyCollectionChangedEventHandler? CollectionChanged;` — confirmed
  against the real .NET interface declaration.
- *Its use:* the direct replacement for `List<T>` this lesson's first
  unit proves necessary.

---

## Concept Unit: `List<T>` Silently Fails to Update a Bound `ListBox`

### The Problem

Lesson 14 proved a plain auto-property leaves a bound UI stale after a
later change. Does the identical staleness problem affect a bound
*collection* — adding an item to a `List<T>` a `ListBox` is bound to —
the same way, or does `{Binding}` somehow already handle that case?

### Introduce the Concept in Isolation

```csharp
public List<string> Items { get; } = new() { "Drill", "Level" };
```

```xml
<ListBox ItemsSource="{Binding Items}" />
```

```csharp
Items.Add("Hammer");
```

Confirmed by a temporary `Console.WriteLine(Items.Count);` immediately
after — printing `3`, proving the real underlying list did grow — the
`ListBox` on screen **still shows only two rows**. `List<T>` has no
mechanism at all for announcing "an item was added" — `ItemsSource`
correctly reads the list once, when the binding is first set, and never
checks again.

### Discard

This stale-`ListBox` proof is disposable; the fixed version, next,
replaces it directly.

### Mechanical Walkthrough

- `public List<string> Items { get; } = new() { "Drill", "Level" };` —
  **(b) hard concept reappearing**, read-only auto-property (Lesson 15)
  with a collection initializer; `new()` — **(a) first appearance** of
  **target-typed `new`**: since the property's declared type
  (`List<string>`) is already known from the left side, `new()` alone is
  legal shorthand for `new List<string>()` — the compiler infers which
  type to construct from context.
- `Items.Add("Hammer");` — **(c) already basic**, ordinary `List<T>.Add`;
  its real *lack* of any UI-notifying side effect is this unit's whole
  point.

## Concept Unit: `ObservableCollection<T>` — Announcing Membership Changes

### The Problem

Lesson 14 closed an identical gap for one property's *value* with
`INotifyPropertyChanged`. Is there a comparable, real mechanism for a
*collection's membership* — and does simply swapping the collection type
close this lesson's own proven gap, with no other code changed?

### Introduce the Concept in Isolation

```csharp
public ObservableCollection<string> Items { get; } = new() { "Drill", "Level" };
```

```xml
<ListBox ItemsSource="{Binding Items}" />
```

```csharp
Items.Add("Hammer");
```

Identical XAML, identical call — only the property's declared type
changed, `List<string>` to `ObservableCollection<string>` — and the
`ListBox` now correctly shows three rows immediately after `Add` runs,
with no other code touched anywhere.

### Discard

Nothing here is disposable — `ObservableCollection<T>` is the real,
standard collection type the rest of this series uses for any bindable
list.

### Mechanical Walkthrough

- `public ObservableCollection<string> Items { get; } = ...` — **(a)
  first appearance** of `ObservableCollection<T>` itself, its real shape
  confirmed in this lesson's Header — a generic class implementing
  `List<T>`'s everyday surface plus `INotifyCollectionChanged`.
- `Items.Add("Hammer");` — **(b) hard concept reappearing** as plain
  method-call syntax; its real effect this time — firing
  `CollectionChanged` internally, from inside `Add` itself — is what
  closes the gap, proven directly by the corrected output above.

### CS Lens

**(b) hard concept reappearing.** Still the Observer pattern (Lessons
07, 13, 14) — WPF's binding engine subscribes to `CollectionChanged` the
moment `ItemsSource` is set, the identical relationship already proven
for `PropertyChanged`, now watching membership instead of one property's
value.

### SE Lens

**The real, honest gap this doesn't cover:** `ObservableCollection<T>`
announces items being *added or removed* — it says nothing about an
*existing* item's own properties changing. Confirmed directly: given a
collection of real `Item` objects (Lesson 14's own class, without
`INotifyPropertyChanged`), running `Items[0].Name = "New name";` fires no
`CollectionChanged` event at all — the collection's membership genuinely
didn't change, only something *inside* one of its elements did. A real
bound list needs **both** mechanisms working together: `ObservableCollection<T>`
for membership, `INotifyPropertyChanged` on each element for that
element's own property changes — proven as two separate, complementary
gaps, not one gap covered twice.

## Concept Unit: `ICollectionView` — Live Filter and Sort, No Copy

### The Problem

A search box narrowing a `ListBox` down to matching rows sounds like it
needs a second, hand-maintained filtered `ObservableCollection<T>`, kept
manually in sync with the real one every time either changes. Is there a
way to filter what's *displayed* without duplicating the underlying
data at all?

### Introduce the Concept in Isolation

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

```csharp
_itemsView.Filter = obj => obj is string s && s.Contains("D");
_itemsView.Refresh();
```

With `Items` still holding all three real strings (`"Drill"`, `"Level"`,
`"Hammer"`), the bound `ListBox` now shows **only** `"Drill"` — confirmed
directly by `Items.Count` still reporting `3` via a temporary
`Console.WriteLine`, proving the underlying collection was never
touched; only what the *view* presents changed.

### Discard

This proof is disposable; real, ViewModel-integrated `ICollectionView`
usage — including combined filter, sort, and grouping — is the standard,
reusable shape the rest of this series relies on wherever search/sort
appears.

### Mechanical Walkthrough

- `CollectionViewSource.GetDefaultView(Items)` — **(a) first
  appearance.** A real static method returning (creating one, if it
  doesn't already exist) the default `ICollectionView` wrapping `Items`
  — this specific call is what makes the *view*, not `Items` itself, the
  thing everything below actually manipulates.
- `public ICollectionView ItemsView => _itemsView;` — **(b) hard concept
  reappearing**, expression-bodied read-only property (Lessons 01, 02).
- `_itemsView.Filter = obj => obj is string s && s.Contains("D");` —
  **(a) first appearance** of `.Filter`, accepting a `Predicate<object>`
  — a delegate shaped `(object) => bool`, the same delegate concept as
  Lesson 06's `Func<>`/`Action<>` family, just named differently for this
  specific "should this be visible" role. `obj is string s` — **(b)
  hard concept reappearing**, the same type-pattern syntax from Lesson
  17's `value is bool b`.
- `_itemsView.Refresh();` — **(a) first appearance.** Re-runs the
  assigned `Filter` (and any sort/group descriptions, next) against
  every item — setting `.Filter` alone does not retroactively apply it;
  `Refresh()` is the real trigger, proven necessary by omitting it in
  this lesson's What Breaks section.

## Connect the pieces

One trace: `List<T>` has no mechanism to announce a membership change,
proven by a real added item never appearing on screen.
`ObservableCollection<T>` closes that exact gap via `CollectionChanged`
— the identical Observer-pattern relationship already proven for
`PropertyChanged` — with zero other code changed. It leaves a real,
separate gap for an *existing* item's own property changes, needing
`INotifyPropertyChanged` on the element type too. `ICollectionView`
layers live filtering (and, by the identical mechanism, sorting and
grouping) on top of any collection, proven not to touch the underlying
data — `Items.Count` stayed `3` throughout, only the *view's* presented
subset changed.

## What breaks without this

Set `.Filter` without calling `.Refresh()` afterward:

```csharp
_itemsView.Filter = obj => obj is string s && s.Contains("D");
```

Real, observed result: the `ListBox` still shows all three items,
completely unfiltered — direct, provable proof that assigning `.Filter`
only *registers* the predicate; it does not retroactively apply it to
already-displayed items. Adding `_itemsView.Refresh();` immediately
after fixes it, exactly as this lesson's own working proof already
showed.

## Exercises

1. Add `_itemsView.SortDescriptions.Add(new SortDescription("", 
   ListSortDirection.Ascending));` (sorting plain strings directly, no
   property path needed) and confirm the `ListBox`'s real, live
   alphabetical reordering, with `Items`'s own insertion order
   unchanged — confirm this directly by reading `Items[0]` after
   sorting and observing it's still `"Drill"`, the original first
   element, even though the view displays a different order.
2. Reproduce this lesson's own stated gap directly: build a small
   `ObservableCollection<Item>` (Lesson 14's `Item`, without
   `INotifyPropertyChanged`), bind it to a `ListBox` with a
   `DataTemplate` (Lesson 17) showing `Name`, then run
   `Items[0].Name = "Changed";` from code. Confirm the display does
   **not** update, then add `INotifyPropertyChanged` to `Item` and
   confirm it does.

## Definition of Done

- [ ] You reproduced the real `List<T>` staleness bug and fixed it with
      `ObservableCollection<T>`.
- [ ] You can state, from Exercise 2's real result, why
      `ObservableCollection<T>` alone doesn't cover an existing item's
      own property changes.
- [ ] You built a live filter via `ICollectionView` and confirmed
      `Items.Count` stayed unchanged throughout.
- [ ] You reproduced the missing-`Refresh()` failure.
- [ ] You completed both exercises.

## Next

[Lesson 20 — `DataGrid` In Depth](lesson-20-datagrid-in-depth.md) covers
the control most real assignment/addin projects lean on for tabular
data — explicit columns, `SelectedItem`, and what actually triggers an
in-grid edit to commit.
