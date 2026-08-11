# Lesson 44: A Different Way to Say the Same Thing

*(`DragDrop.DoDragDrop`, `DragEventArgs`, `AllowDrop`)*

**User Story**
> As a user, I want to drag an item onto a category to re-categorize it.

**What you will build**
A real drag-and-drop interaction: pick up a row, drop it on a category
target, and its category changes — the exact same underlying operation
`BulkSetCategory` (Lesson 43) already performs, reached through a
completely different gesture. This lesson's own glossary names the real
point directly: **direct manipulation as an alternative UI to menus —
a real usability tradeoff, not strictly "better."**

**What you need to know first:** Lesson 12: `Category`, `enum`. Lesson
43: changing an item's category and persisting it — the same real
operation, a new trigger for it.

**Terms introduced in this lesson:**
- **`DragDrop.DoDragDrop`** — starts a real drag operation, carrying data
  along with it until the user releases the mouse over a valid drop
  target.
- **`AllowDrop`** — must be `true` on an element for it to ever receive
  a `Drop` event at all.
- **`DragEventArgs`/`IDataObject`** — the event WPF raises when
  something is dropped; `.Data`, an `IDataObject`, is where the actual
  dragged payload lives.

**Objects and methods used**
- `DragDrop.DoDragDrop`, `AllowDrop`, and `DragEventArgs`/`IDataObject`
  are this lesson's own subject, given full treatment in the Concept
  Units below.
- **`Point`**
  - *What it is:* a plain, immutable pair of coordinates — an X and a Y,
    nothing else.
  - *Implementation:* a WPF struct (`System.Windows.Point`), copied by
    value on assignment, not shared by reference. The two real members
    this lesson reads: `public double X { get; }` and `public double Y
    { get; }`.
  - *Its use:* `dragStartPoint` and `currentPosition` (below) each hold
    one — the on-screen location the mouse was at, at two different
    moments, so the code can measure how far it's actually moved.
- **`MouseButtonEventArgs`/`MouseEventArgs`**
  - *What it is:* the real event-argument objects WPF hands a mouse
    event handler — everything the handler is told about the mouse at
    the moment the event fired.
  - *Implementation:* both are real WPF classes; `MouseButtonEventArgs`
    (used by `PreviewMouseLeftButtonDown`) extends `MouseEventArgs`
    (used by `PreviewMouseMove`), adding button-specific members a
    plain move event doesn't need. The one member this lesson calls on
    either, `GetPosition(IInputElement? relativeTo)`, is declared on
    the shared base, `MouseEventArgs` itself; `e.LeftButton` is
    declared there too.
  - *Its use:* every mouse-related handler in this unit receives one of
    these as its second parameter — `e`, by the same convention every
    event handler in this project has used — and reads the real mouse
    position and button state off it, rather than polling the mouse
    from anywhere else.
- **`e.GetPosition(null)`**
  - *What it is:* a method that answers "where was the mouse, in
    coordinates relative to some specific element?"
  - *Implementation:* `Point GetPosition(IInputElement? relativeTo)` —
    passing a real element returns coordinates relative to that
    element's own top-left corner; passing `null` — exactly what this
    lesson's code does, both times it's called — returns coordinates
    relative to the whole window instead, the one reference frame
    guaranteed to stay consistent regardless of which specific element
    the mouse happens to be over at that instant.
  - *Its use:* both mouse handlers below call this to get a `Point` in
    the same, shared coordinate space, so the two calls' results can be
    meaningfully subtracted from each other.
- **`MouseButtonState.Pressed`**
  - *What it is:* one named value of a small, closed set — the real,
    current state of a specific mouse button.
  - *Implementation:* `MouseButtonState` is a WPF `enum` with exactly
    two values, `Pressed` and `Released`; `e.LeftButton` returns
    whichever one currently applies.
  - *Its use:* checked against `!=` to bail out of a handler the moment
    the button is no longer actually held down — see the Mechanical
    Walkthrough below for the exact line.
- **`SystemParameters.MinimumHorizontalDragDistance`/`MinimumVerticalDragDistance`**
  - *What it is:* the operating system's own, user-configurable answer
    to "how far does the mouse have to move, while a button is held,
    before that counts as a drag instead of a click?"
  - *Implementation:* two real `static double` properties on WPF's
    `SystemParameters` class, both reading a genuine Windows system
    setting — not a WPF-invented constant, the exact distance a person
    can configure in their own OS accessibility settings.
  - *Its use:* compared against how far the mouse has actually moved
    since the button first went down — moving less than this distance
    is treated as an ordinary click/selection, not a drag attempt;
    moving past it is what actually starts the real drag.
- **`DragDropEffects`**
  - *What it is:* a small, closed set of named values describing what
    kind of drop operation is being offered or accepted — move, copy,
    a scroll request, or none at all.
  - *Implementation:* a WPF `[Flags] enum` (`System.Windows.DragDropEffects`),
    meaning its values can be combined with `|`, though this lesson only
    ever passes one at a time: `.Move`. `DragDrop.DoDragDrop`'s third
    parameter is this type — what the drag source declares it's
    offering; a drop target's own code can inspect it back (via
    `DragEventArgs.Effects` — not read anywhere in this lesson's own
    code) to decide whether to accept it, and WPF itself uses it to
    change the mouse cursor during the drag — a "move" cursor, a "copy"
    cursor, or a "no drop" cursor, depending on the value and whether
    the pointer is currently over a valid target.
  - *Its use:* `DragDrop.DoDragDrop(ItemsGrid, data, DragDropEffects.Move)`
    declares this drag as a move — conceptually, "the item is leaving
    its old category and landing in a new one," not "a copy is being
    left behind in both."
- **`ItemsControl`/`ItemsControl.ItemTemplate`/`DataTemplate`** — a
  compound shape (`ItemsSource` and `ItemTemplate` used together),
  covered in full, standalone, in `wpf-itemscontrol-and-datatemplate.md`;
  applied to this project's own real code — the category drop targets —
  in the Concept Unit below.

---

## Concept Unit: `IDataObject` — Proving the Payload Actually Travels

### The Problem

A real drag-and-drop gesture is inherently a live mouse interaction —
click, hold, move, release — not something a throwaway console lab can
simulate directly. What *can* be proven directly, without a real mouse
gesture, is the actual data-carrying mechanism underneath it:
`IDataObject`, the exact type `DragEventArgs.Data` exposes.

### Introduce the Concept in Isolation
```bash
dotnet new wpf -o lab-dragdrop
```

Replace `MainWindow.xaml`'s `Grid` contents:

```xml
<StackPanel Loaded="StackPanel_Loaded">
    <Border x:Name="DropTarget" Width="150" Height="80" Background="LightBlue"
            AllowDrop="True" Drop="DropTarget_Drop" />
</StackPanel>
```

Replace `MainWindow.xaml.cs`'s contents:

```csharp
using System.Windows;

namespace lab_dragdrop
{
    public class Item
    {
        public string Name { get; set; } = string.Empty;
        public string Category { get; set; } = string.Empty;
    }

    public partial class MainWindow : Window
    {
        public MainWindow()
        {
            InitializeComponent();
        }

        private void StackPanel_Loaded(object sender, RoutedEventArgs e)
        {
            Item original = new Item { Name = "Hex Bolts", Category = "Tools" };

            DataObject data = new DataObject();
            data.SetData(typeof(Item), original);

            Console.WriteLine($"GetDataPresent(typeof(Item)): {data.GetDataPresent(typeof(Item))}");

            Item? retrieved = data.GetData(typeof(Item)) as Item;
            Console.WriteLine($"Retrieved same object? {ReferenceEquals(original, retrieved)}");
            Console.WriteLine($"Retrieved.Name: {retrieved?.Name}");

            HandleDrop(data, "Electronics");
            Console.WriteLine($"After simulated drop, original.Category: {original.Category}");
        }

        private void DropTarget_Drop(object sender, DragEventArgs e)
        {
            HandleDrop(e.Data, "Electronics");
        }

        private void HandleDrop(System.Windows.IDataObject data, string newCategory)
        {
            if (!data.GetDataPresent(typeof(Item)))
            {
                return;
            }

            Item item = (Item)data.GetData(typeof(Item))!;
            item.Category = newCategory;
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
GetDataPresent(typeof(Item)): True
Retrieved same object? True
Retrieved.Name: Hex Bolts
After simulated drop, original.Category: Electronics
```

*What this proves:* `DataObject.SetData(typeof(Item), original)` stores
a real reference to `original`; `GetDataPresent(typeof(Item))` correctly
confirms data of that type is present, and `GetData(typeof(Item))`
retrieves the *exact same object* (`ReferenceEquals` reports `True`) —
not a copy. `HandleDrop`, called directly here with the same
`IDataObject` a real `Drop` event would provide, correctly mutates the
real item's `Category`. This is the real mechanism `DragEventArgs.Data`
exposes during an actual drag — this lab proves the payload genuinely
carries the real object across the operation, before ever touching a
real mouse gesture.

### Discard the Throwaway Example
Delete the `lab-dragdrop` folder. `IDataObject`/`GetDataPresent`/
`GetData` are not discarded — the real drop handler uses exactly this
next.

### Mechanical Walkthrough

- `DataObject data = new DataObject(); data.SetData(typeof(Item), original);`
  — **first appearance of `DataObject`.** A real, general-purpose
  container for arbitrary data, keyed by type here (a string key is
  also possible, but the type itself is simpler and unambiguous for
  this project's own use).
- `data.GetDataPresent(typeof(Item))` — **first appearance.** Checks
  whether data of a given type/key exists *before* trying to read it —
  the same "check before you leap" discipline `File.Exists` (Lesson 25)
  and `IsDBNull` (Lesson 14) already established for other kinds of
  possibly-absent data.
- `HandleDrop(System.Windows.IDataObject data, ...)` — **first
  appearance of `IDataObject`** as a parameter type, deliberately
  separated from the real `Drop` event handler — the same "extract the
  real logic into something testable independent of the actual WPF
  event" discipline this project hasn't needed to name before, because
  most of its logic already lived on `InventoryViewModel`, reachable
  without any WPF event at all.

### CS Lens

`IDataObject` is a real, general **key-value payload container** —
conceptually similar to a small dictionary, keyed by type or string,
carrying arbitrary data across an operation that doesn't know or care
what that data actually is. The clipboard (copy/paste, not built by
this project, but genuinely present in every Windows app) uses this
exact same interface — drag-and-drop and copy/paste are, underneath,
closely related mechanisms for moving data between two places that
otherwise know nothing about each other.

### SE Lens

Why key the data by `typeof(Item)` (a real C# type) rather than a plain
string like `"Item"`? Because a `Type` key is checked by the compiler —
`typeof(Item)` can never be typo'd the way `"Item"` and `"item"` could
accidentally mismatch between the drag source and the drop target,
silently failing `GetDataPresent` with no error, just a drop that
mysteriously does nothing.

### Connection

The real drag source and drop target, using exactly this `IDataObject`
mechanism, are wired next.

---

## Concept Unit: Real Drag-and-Drop Re-Categorization

### The Problem

`IDataObject` is proven in isolation; nothing in this project can
currently start a real drag from `ItemsGrid` or accept a real drop
anywhere.

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:** `InventoryPage.xaml`, `InventoryPage.xaml.cs`.
- **Change type:** Add.
- **Dependencies:** `IDataObject`, previous unit; `UpdateItemInDatabase`,
  Lesson 21.

### The New Code — Starting a Drag

```xml
<DataGrid x:Name="ItemsGrid"
          PreviewMouseLeftButtonDown="ItemsGrid_PreviewMouseLeftButtonDown"
          PreviewMouseMove="ItemsGrid_PreviewMouseMove"
          ...>
```

```csharp
private Point dragStartPoint;

private void ItemsGrid_PreviewMouseLeftButtonDown(object sender, MouseButtonEventArgs e)
{
    dragStartPoint = e.GetPosition(null);
}

private void ItemsGrid_PreviewMouseMove(object sender, MouseEventArgs e)
{
    if (e.LeftButton != MouseButtonState.Pressed || ItemsGrid.SelectedItem is not InventoryItem selected)
    {
        return;
    }

    Point currentPosition = e.GetPosition(null);
    if (Math.Abs(currentPosition.X - dragStartPoint.X) < SystemParameters.MinimumHorizontalDragDistance &&
        Math.Abs(currentPosition.Y - dragStartPoint.Y) < SystemParameters.MinimumVerticalDragDistance)
    {
        return;
    }

    DataObject data = new DataObject();
    data.SetData(typeof(InventoryItem), selected);
    DragDrop.DoDragDrop(ItemsGrid, data, DragDropEffects.Move);
}
```

### The New Code — Category Drop Targets

```xml
<StackPanel>
    <TextBlock Text="Drag an item here to re-categorize:" />
    <ItemsControl ItemsSource="{Binding CategoryValues}">
        <ItemsControl.ItemTemplate>
            <DataTemplate>
                <Border Width="120" Height="30" Margin="0,4,0,0" Background="LightGray"
                        AllowDrop="True" Drop="CategoryTarget_Drop" Tag="{Binding}">
                    <TextBlock Text="{Binding}" HorizontalAlignment="Center" VerticalAlignment="Center" />
                </Border>
            </DataTemplate>
        </ItemsControl.ItemTemplate>
    </ItemsControl>
</StackPanel>
```

```csharp
private void CategoryTarget_Drop(object sender, DragEventArgs e)
{
    if (!e.Data.GetDataPresent(typeof(InventoryItem)))
    {
        return;
    }

    InventoryItem item = (InventoryItem)e.Data.GetData(typeof(InventoryItem))!;
    Category newCategory = (Category)((Border)sender).Tag;

    InventoryViewModel viewModel = (InventoryViewModel)DataContext;
    item.Category = newCategory;
    viewModel.UpdateSingleItem(item);
}
```

### The New Code — a Public Entry Point on the ViewModel

```csharp
public void UpdateSingleItem(InventoryItem item)
{
    UpdateItemInDatabase(item);
}
```

`UpdateItemInDatabase` itself (Lesson 21) has always been `private` —
correct for every earlier caller, since they all lived inside
`InventoryViewModel` itself. `CategoryTarget_Drop` lives in
`InventoryPage`'s code-behind, outside the ViewModel entirely, so it
needs a real, public entry point to reach it — `UpdateSingleItem` is
that one-line, deliberately thin wrapper, not a reimplementation.

### Mechanical Walkthrough

- `private Point dragStartPoint;` — **first appearance of `Point`
  as a field** (full treatment in this lesson's header, above). Holds
  where the mouse was the moment the button first went down, so a
  later moment's position can be compared against it.
- `ItemsGrid_PreviewMouseLeftButtonDown(object sender, MouseButtonEventArgs e)`
  — **first appearance of `MouseButtonEventArgs`** (header, above).
  WPF hands this specific event-args type to a button-related mouse
  handler; the parameter named `e`, by the same convention every event
  handler in this project has followed.
- `dragStartPoint = e.GetPosition(null);` — **first appearance of
  `GetPosition`** (header, above). Reads the mouse's real position,
  relative to the whole window (`null`), and stores it.
- `PreviewMouseLeftButtonDown`/`PreviewMouseMove` — **first appearance
  of manually detecting a drag gesture.** WPF has no built-in "start
  dragging this row" behavior for `DataGrid`; this project has to watch
  for the mouse moving a real minimum distance while the left button
  stays held, the standard, real pattern every hand-rolled WPF drag
  source uses.
- `ItemsGrid_PreviewMouseMove(object sender, MouseEventArgs e)` —
  **first appearance of `MouseEventArgs`** (header, above; the base
  type `MouseButtonEventArgs` itself extends). A plain mouse-move
  carries no button-specific data, so this handler gets the plainer of
  the two types.
- `e.LeftButton != MouseButtonState.Pressed` — **first appearance of
  `MouseButtonState`** (header, above). `e.LeftButton` reports the
  real, current state of the left button; this check is what stops an
  ordinary mouse move — button already released — from being mistaken
  for an in-progress drag.
- `ItemsGrid.SelectedItem is not InventoryItem selected` — reappearing
  shape (pattern-matching `is`, already established earlier in this
  project), combined with a `not` check: bails out of the whole
  handler immediately unless something is genuinely selected.
- `Point currentPosition = e.GetPosition(null);` — the second call to
  `GetPosition`, in the same shared, window-relative coordinate space
  as `dragStartPoint`'s own — the two are only meaningfully comparable
  because both were measured the same way.
- `Math.Abs(currentPosition.X - dragStartPoint.X) < SystemParameters.MinimumHorizontalDragDistance`
  (and the matching `.Y`/`MinimumVerticalDragDistance` check) — **first
  appearance of `SystemParameters.Minimum*DragDistance`** (header,
  above). Subtracting the two `Point`s' matching coordinates gives real
  signed distance moved on each axis; `Math.Abs` makes direction
  irrelevant (a drag up-and-left counts the same as down-and-right);
  comparing against the OS's own configured threshold, rather than a
  made-up constant, is what makes this check behave the way every other
  Windows application's own drag detection does.
- `DataObject data = new DataObject(); data.SetData(typeof(InventoryItem), selected);`
  — reappearing exactly (this lesson's own first Concept Unit,
  `IDataObject`/`DataObject.SetData`), now packaging the real, selected
  `InventoryItem` instead of the lab's throwaway `Item`.
- `DragDrop.DoDragDrop(ItemsGrid, data, DragDropEffects.Move)` — **first
  appearance of starting the real drag operation, and of
  `DragDropEffects.Move`'s actual meaning** (header, above, for
  `DragDropEffects` itself). This call *blocks* until the user releases
  the mouse, over a valid drop target or not — the same "modal until
  the user answers" shape `MessageBox.Show` (Lesson 22) and
  `PrintDialog.ShowDialog()` (Lesson 37) have both already established,
  here for a mouse gesture instead of a dialog. Passing `.Move`
  specifically declares this drag as *moving* the item to a new
  category, not leaving a copy behind in the old one — WPF reflects
  that back to the user during the drag itself, showing a "move" cursor
  rather than a "copy" cursor once the pointer is over a valid target.
- `<ItemsControl ItemsSource="{Binding CategoryValues}"><ItemsControl.ItemTemplate><DataTemplate>...`
  — **first appearance of `ItemsControl`/`ItemTemplate`/`DataTemplate`
  together**, a compound shape covered in full, standalone, in
  `wpf-itemscontrol-and-datatemplate.md`: one real `Border` gets built
  per value in `CategoryValues`, each one bound to its own category —
  applied here exactly as that file's own isolated example proves,
  with `CategoryValues` (this project's own real enum-values
  collection) standing in for that file's plain string list.
- `AllowDrop="True"` on each category `Border` — reappearing shape
  (a plain attribute, familiar since Lesson 1), required on every
  element meant to ever receive a `Drop` event — without it, dropping
  anywhere on that element does nothing at all, silently.
- `Tag="{Binding}"` — (first appearance of `Tag` used deliberately) — a
  general-purpose property every `FrameworkElement` has, here holding
  which `Category` this specific `Border` represents, read back inside
  `CategoryTarget_Drop` via `((Border)sender).Tag`.
- `e.Data.GetDataPresent(typeof(InventoryItem))`/`e.Data.GetData(typeof(InventoryItem))`
  — reappearing exactly (this lesson's own first Concept Unit), now
  called on a real `DragEventArgs.Data` instead of the lab's manually
  constructed one.
- `Category newCategory = (Category)((Border)sender).Tag;` — an
  ordinary cast, reading back the exact value `Tag="{Binding}"` stored,
  above.
- `InventoryViewModel viewModel = (InventoryViewModel)DataContext;` —
  reappearing shape (a `DataContext` cast, the same pattern this
  project's code-behind has used since early lessons whenever
  code-behind needs to reach the ViewModel directly).

### CS Lens

This unit is the direct, worked demonstration of this lesson's own
named principle: **direct manipulation as an alternative UI to
menus.** `CategoryTarget_Drop`'s actual logic —
`item.Category = newCategory; viewModel.UpdateSingleItem(item);` — is
almost identical to `BulkSetCategory`'s own single-item case (Lesson
43); the entire lesson's real content is the *gesture* leading to that
identical, already-correct outcome, not new business logic.

### SE Lens

Why does this lesson's own glossary explicitly call drag-and-drop "a
real usability tradeoff, not strictly better," rather than presenting
it as a straightforward improvement? Because direct manipulation has
real, genuine costs a menu or button doesn't: it's not discoverable
(nothing on screen hints that dragging does anything, unlike a visible
"Bulk Set Category" button), it's harder for some users to perform
precisely, and it offers no keyboard equivalent at all. This project
keeps the bulk-edit button (Lesson 43) *and* adds drag-and-drop — two
paths to the identical outcome, matching this project's own
discoverability principle from Lesson 41, not replacing one with the
other.

### Commands Needed

```bash
dotnet run
```

### Run It

On your Windows machine: click and hold a row in `ItemsGrid`, drag it
onto one of the category targets, and release — the item's category
changes immediately, and the change persists (confirmed by fully
quitting and reopening the app). Try dropping outside any real target;
nothing happens, no error, exactly `AllowDrop`'s own behavior.

### Connection

Bulk actions and direct manipulation both reuse the same underlying,
already-correct operations through genuinely different gestures. The
next lesson gives one of this project's existing destructive actions a
real, formal undo — the Command pattern,
deepened.

---

## Closing

### Connect the Pieces

Pressing and dragging a row past the real minimum distance
(`SystemParameters.MinimumHorizontalDragDistance`) calls
`DragDrop.DoDragDrop`, packaging the selected `InventoryItem` into a
real `DataObject` — the exact `IDataObject` mechanism proven, with real,
verified output, in this lesson's own first unit. Dropping it on a
category `Border` fires `Drop`, and `e.Data.GetDataPresent`/`GetData`
retrieve the identical real item, whose `Category` is then updated and
persisted via `UpdateSingleItem` — the same real database write Lesson
43's bulk operations already use, reached through an entirely different
gesture.

### What Breaks Without This

Temporarily remove `AllowDrop="True"` from the category `Border`s (the
`Drop="CategoryTarget_Drop"` handler stays attached). Rerun and try
dragging an item onto one. Real, representative failure: nothing
happens at all — no drop, no error, no visual feedback — because WPF
never even considers an element without `AllowDrop="True"` a valid drop
target, regardless of whether it has a real `Drop` handler wired up.
This is a genuinely easy mistake to make (wiring the event handler and
forgetting the one attribute that actually enables it) and a genuinely
silent one to debug. Restore `AllowDrop="True"` afterward.

### Exercises

- In the `lab-dragdrop` throwaway pattern, call `HandleDrop` with an
  `IDataObject` that never had `SetData(typeof(Item), ...)` called on
  it at all — confirm, with real output, that `GetDataPresent` correctly
  reports `False` and the method safely does nothing.
- Now that you know what `DragDropEffects.Move` itself declares:
  predict, in your own words, whether swapping it for
  `DragDropEffects.Copy` would change anything about
  `CategoryTarget_Drop`'s own *behavior* — given that its code never
  reads `e.Effects` at all — versus what you'd expect to change only
  *visually*, during the drag itself. Then test it and confirm.
- Add a real visual cue — changing the cursor, or highlighting the
  `Border` currently being dragged over — using `DragEnter`/`DragLeave`
  events, both new to this project, both following the identical
  `AllowDrop`/`DragEventArgs` shape already proven here.

### Definition of Done

- [ ] Dragging a row from `ItemsGrid` and dropping it on a category
      target re-categorizes that item.
- [ ] The change persists through a full quit and reopen of the app.
- [ ] Dropping outside any real target does nothing, with no error.
- [ ] The existing "Bulk Set Category" button (Lesson 43) still works
      unchanged — drag-and-drop is a second path, not a replacement.
- [ ] You reproduced the missing-`AllowDrop` regression on purpose,
      confirmed drops silently do nothing without it, and restored the
      real attribute.
- [ ] Committed with a message stating why: for example,
      `git commit -m "Add drag-and-drop re-categorization as an alternative to Bulk Set Category"`.
