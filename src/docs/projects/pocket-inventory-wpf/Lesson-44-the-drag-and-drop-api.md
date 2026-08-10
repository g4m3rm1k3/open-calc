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
- No supporting cast beyond this lesson's own subject —
  `DragDrop.DoDragDrop`, `AllowDrop`, and `DragEventArgs`/`IDataObject`
  are given full treatment in the Concept Units below.

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

- `PreviewMouseLeftButtonDown`/`PreviewMouseMove` — (first appearance
  of manually detecting a drag gesture) — WPF has no built-in "start
  dragging this row" behavior for `DataGrid`; this project has to watch
  for the mouse moving a real minimum distance
  (`SystemParameters.MinimumHorizontalDragDistance`) while the left
  button stays held, the standard, real pattern every hand-rolled WPF
  drag source uses.
- `DragDrop.DoDragDrop(ItemsGrid, data, DragDropEffects.Move)` — **first
  appearance.** Starts the real drag operation; this call *blocks*
  until the user releases the mouse, over a valid drop target or not —
  the same "modal until the user answers" shape `MessageBox.Show`
  (Lesson 22) and `PrintDialog.ShowDialog()` (Lesson 37) have both
  already established, here for a mouse gesture instead of a dialog.
- `AllowDrop="True"` on each category `Border` — reappearing shape
  (a plain attribute, familiar since Lesson 1), required on every
  element meant to ever receive a `Drop` event — without it, dropping
  anywhere on that element does nothing at all, silently.
- `Tag="{Binding}"` — (first appearance of `Tag` used deliberately) — a
  general-purpose property every `FrameworkElement` has, here holding
  which `Category` this specific `Border` represents, read back inside
  `CategoryTarget_Drop` via `((Border)sender).Tag`.

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
- Predict, in your own words, what `DragDropEffects.Move` versus
  `DragDropEffects.Copy` actually changes about this project's real
  drag-and-drop behavior — does anything about `CategoryTarget_Drop`'s
  own code depend on which one was passed to `DoDragDrop`?
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
