# Lesson 23: What `Click="..."` Was Always Hiding

*(`ICommand`, a hand-written `RelayCommand`, `ViewModel` classes)*

**User Story**
> As a developer, I want Add/Edit/Delete/Search logic that isn't scattered
> across click handlers in a file that also knows about `TextBox`es and
> `DataGrid`s — logic I could test without opening a window at all.

**What you will build**
Nothing new visually. `InventoryPage.xaml.cs` has grown, across Lessons
6 through 22, into a file that mixes three genuinely different concerns:
plain data rules (what makes a valid item), plain data access (SQLite),
and WPF-specific plumbing (event handlers, `DataGrid` selection). This
lesson pulls the first two into a real `InventoryViewModel` class that
has never heard of `Window`, `Page`, or `Click`, and replaces
`AddButton_Click` with a real `ICommand` — bound declaratively in XAML,
automatically disabling the Add button the instant `Name` is blank, with
zero code checking `IsEnabled` by hand.

**What you need to know first:** Every lesson since Lesson 6 —
`InventoryItem`, `INotifyPropertyChanged`, `ObservableCollection<T>`,
`ICollectionView`, and every method on `InventoryPage` this lesson moves
or wraps.

**Terms introduced in this lesson:**
- **`ICommand`** — a built-in interface (`System.Windows.Input`) with
  three members: `Execute`, `CanExecute`, and a `CanExecuteChanged`
  event; any control's `Command` property (`Button.Command`, among
  others) can bind to anything implementing it.
- **`RelayCommand`** — not a built-in type; a small, reusable `ICommand`
  implementation this lesson writes by hand, wrapping any two delegates
  (what to do, and whether it's currently allowed) as a real command.
- **ViewModel** — a plain class holding a screen's state and behavior,
  with zero dependency on any WPF type — no `Window`, `Page`, `Button`,
  or `TextBox` referenced anywhere inside it.
- **The Command pattern** — encapsulating "an action to perform" as an
  object, instead of a bare method call, so it can be passed around,
  bound to, disabled, and (Lesson 45) reversed.

---

## Concept Unit: `ICommand` and a Hand-Written `RelayCommand`

### The Problem

Every button in this project so far calls one specific, hardcoded
method via `Click="..."` — there's no way to ask, generically, "is this
action currently allowed?" without a control directly checking some
`bool` by hand. `ICommand` is the built-in shape WPF controls understand
for exactly that question.

### Introduce the Concept in Isolation
```bash
dotnet new console -o lab-icommand
cd lab-icommand
```

Replace `Program.cs`:

```csharp
using System.Windows.Input;

int counter = 0;

RelayCommand incrementCommand = new RelayCommand(
    execute: _ => counter++,
    canExecute: _ => counter < 3);

Console.WriteLine($"counter={counter}, CanExecute={incrementCommand.CanExecute(null)}");

incrementCommand.Execute(null);
Console.WriteLine($"counter={counter}, CanExecute={incrementCommand.CanExecute(null)}");

incrementCommand.Execute(null);
Console.WriteLine($"counter={counter}, CanExecute={incrementCommand.CanExecute(null)}");

incrementCommand.Execute(null);
Console.WriteLine($"counter={counter}, CanExecute={incrementCommand.CanExecute(null)}");

int raisedCount = 0;
incrementCommand.CanExecuteChanged += (sender, e) => raisedCount++;
incrementCommand.RaiseCanExecuteChanged();
Console.WriteLine($"CanExecuteChanged raised {raisedCount} time(s) after RaiseCanExecuteChanged()");

class RelayCommand : ICommand
{
    private readonly Action<object?> execute;
    private readonly Predicate<object?> canExecute;

    public RelayCommand(Action<object?> execute, Predicate<object?> canExecute)
    {
        this.execute = execute;
        this.canExecute = canExecute;
    }

    public bool CanExecute(object? parameter) => canExecute(parameter);

    public void Execute(object? parameter) => execute(parameter);

    public event EventHandler? CanExecuteChanged;

    public void RaiseCanExecuteChanged()
    {
        CanExecuteChanged?.Invoke(this, EventArgs.Empty);
    }
}
```

Run it:

```bash
dotnet run
```

Real output:

```text
counter=0, CanExecute=True
counter=1, CanExecute=True
counter=2, CanExecute=True
counter=3, CanExecute=False
CanExecuteChanged raised 1 time(s) after RaiseCanExecuteChanged()
```

*What this proves:* `RelayCommand` wraps two plain delegates — `execute`
(what `Execute` actually runs) and `canExecute` (what `CanExecute`
checks) — into one object satisfying `ICommand`. `CanExecute(null)`
correctly tracks `counter < 3` live, with no separate `bool` field to
keep in sync by hand — it re-evaluates the same `canExecute` function
every single call. Once `counter` reaches `3`, `CanExecute` genuinely
flips to `False`, proving the command itself, not just the caller, knows
it shouldn't run again. `CanExecuteChanged` firing exactly once after
`RaiseCanExecuteChanged()` confirms the event this lesson's XAML unit
relies on to tell a bound `Button` "re-check whether you should be
enabled" actually works.

### Discard the Throwaway Example
Delete the `lab-icommand` folder. `ICommand`/`RelayCommand` are not
discarded — the real `RelayCommand.cs` file uses exactly this next.

### Mechanical Walkthrough

- `class RelayCommand : ICommand` — **first appearance of `ICommand`.**
  An interface with exactly three members — this class is the first,
  concrete implementation this project writes.
- `Action<object?> execute` / `Predicate<object?> canExecute` — two
  delegate fields, taking `execute`/`canExecute` in via the constructor —
  `RelayCommand` itself contains no actual increment/validation logic; it
  only ever calls whatever it was handed.
- `public bool CanExecute(object? parameter) => canExecute(parameter);` /
  `public void Execute(object? parameter) => execute(parameter);` —
  `ICommand`'s two required methods, each a one-line forward to the
  matching stored delegate.
- `public event EventHandler? CanExecuteChanged;` plus a manual
  `RaiseCanExecuteChanged()` method — `ICommand`'s third member, a plain
  event this class controls directly, letting external code
  (`Execute`'s own caller, typically, once state that `CanExecute`
  depends on has changed) explicitly signal "re-check me."

### CS Lens

This is the **Command pattern**, named directly in this lesson's own
glossary: wrapping "an action" as a real object (implementing a known
interface) instead of a bare method reference, so it can be passed
around, stored in a property, disabled, and — Lesson 45 — made to know
how to undo itself. `RelayCommand` specifically is the common,
general-purpose implementation nearly every hand-rolled MVVM codebase
writes once and reuses everywhere, rather than writing a new,
purpose-built `ICommand` class for every single action.

### SE Lens

Why does `RelayCommand` take two *delegates* in its constructor instead
of being subclassed once per command (an `AddItemCommand : ICommand`
class, a `DeleteItemCommand : ICommand` class, and so on)? Because the
actual *logic* for "add an item" and "delete an item" already lives
somewhere sensible — a `ViewModel`'s own methods — and `RelayCommand`'s
whole job is just wrapping *whatever* logic it's handed in the shape
`ICommand` requires. One reusable class, instantiated many times with
different delegates, beats one hand-written subclass per action, the
same "don't repeat structurally identical code" instinct behind every
shared pattern this project has used since `INotifyPropertyChanged`'s
own property shape.

### Connection

`RelayCommand` becomes a real, reusable file next — and the real Add
button binds to one.

---

## Concept Unit: `Command="{Binding ...}"` and Automatic `IsEnabled`

### The Problem

`Click="AddButton_Click"` runs unconditionally — nothing disables the Add
button when `NewItemDraft.Name` is blank; `AddButton_Click` itself
silently returns instead. A real `ICommand`, bound declaratively, can
disable the button directly, with no code checking `IsEnabled` by hand.

### Introduce the Concept in Isolation
```bash
dotnet new wpf -o lab-commandbutton
```

Replace `MainWindow.xaml`'s `Grid` contents:

```xml
<StackPanel Loaded="StackPanel_Loaded">
    <Button x:Name="IncrementButton" Content="Increment" Command="{Binding IncrementCommand}" />
</StackPanel>
```

Replace `MainWindow.xaml.cs`'s contents:

```csharp
using System.Windows;
using System.Windows.Input;
using System.Windows.Threading;

namespace lab_commandbutton
{
    public class RelayCommand : ICommand
    {
        private readonly Action<object?> execute;
        private readonly Predicate<object?> canExecute;

        public RelayCommand(Action<object?> execute, Predicate<object?> canExecute)
        {
            this.execute = execute;
            this.canExecute = canExecute;
        }

        public bool CanExecute(object? parameter) => canExecute(parameter);

        public void Execute(object? parameter) => execute(parameter);

        public event EventHandler? CanExecuteChanged
        {
            add { CommandManager.RequerySuggested += value; }
            remove { CommandManager.RequerySuggested -= value; }
        }
    }

    public partial class MainWindow : Window
    {
        public int Counter { get; private set; }
        public RelayCommand IncrementCommand { get; }

        public MainWindow()
        {
            InitializeComponent();
            IncrementCommand = new RelayCommand(
                execute: _ => Counter++,
                canExecute: _ => Counter < 3);
            DataContext = this;
        }

        private void StackPanel_Loaded(object sender, RoutedEventArgs e)
        {
            Console.WriteLine($"Counter={Counter}, IncrementButton.IsEnabled={IncrementButton.IsEnabled}");

            for (int i = 0; i < 3; i++)
            {
                IncrementCommand.Execute(null);
                CommandManager.InvalidateRequerySuggested();
                Dispatcher.Invoke(() => { }, DispatcherPriority.ContextIdle);
                Console.WriteLine($"Counter={Counter}, IncrementButton.IsEnabled={IncrementButton.IsEnabled}");
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
Counter=0, IncrementButton.IsEnabled=True
Counter=1, IncrementButton.IsEnabled=True
Counter=2, IncrementButton.IsEnabled=True
Counter=3, IncrementButton.IsEnabled=False
```

#### Execution Trace

1. Before the loop, `Counter` is `0` and `IncrementButton.IsEnabled` is
   `True` — `CanExecute` (`Counter < 3`) is satisfied.
2. **Iteration 1:** `IncrementCommand.Execute(null)` runs, `Counter`
   becomes `1`; forcing a requery confirms `IsEnabled` is still `True`
   (`1 < 3`).
3. **Iteration 2:** `Execute` runs again, `Counter` becomes `2`;
   `IsEnabled` is still `True` (`2 < 3`).
4. **Iteration 3:** `Execute` runs a third time, `Counter` becomes `3`;
   forcing a requery this time shows `IsEnabled` has flipped to `False`
   — `CanExecute` now evaluates `3 < 3`, which is `False`, and the
   button's own displayed state changed to match, with no code directly
   setting `IsEnabled` anywhere.

*What this proves:* `Command="{Binding IncrementCommand}"` — with no
`IsEnabled` binding written anywhere — ties `IncrementButton.IsEnabled`
directly to `IncrementCommand.CanExecute(null)`. The button starts
enabled (`Counter=0 < 3`); after three real `Execute` calls,
`Counter` reaches `3`, `CanExecute` flips to `False`, and
`IncrementButton.IsEnabled` becomes `False` — all without a single line
of code that reads or sets `IsEnabled` directly. In the real, interactive
app, clicking the button itself (not calling `Execute` from code, the
way this lab does to stay automatable) triggers WPF's own automatic
re-check after every click — the manual `CommandManager.InvalidateRequerySuggested()`
call here exists only to force that same re-check synchronously, for a
lab with no real mouse click to trigger it.

### Discard the Throwaway Example
Delete the `lab-commandbutton` folder. `Command="{Binding ...}"` and this
`RelayCommand` shape are not discarded — the real Add button binds to
`AddCommand` exactly this way next.

### Mechanical Walkthrough

- `Command="{Binding IncrementCommand}"` — **first appearance of
  `Button.Command`.** The same `{Binding}` syntax used for every other
  property in this project, here targeting `Button`'s built-in `Command`
  property instead of `Click`.
- `public event EventHandler? CanExecuteChanged { add { CommandManager.RequerySuggested += value; } remove { ... } }`
  — (first appearance of `CommandManager.RequerySuggested`, a WPF-specific
  member unavailable in the previous unit's plain console lab) —
  subscribing to WPF's own built-in "something happened that might affect
  commands" signal (keyboard/mouse activity, focus changes, and more),
  instead of requiring every command author to remember to call
  `RaiseCanExecuteChanged()` by hand after every relevant change.

### CS Lens

`Button`, bound to an `ICommand`, is itself an example of the **Adapter
pattern** already named for `ICollectionView` back in Lesson 17 — `Button`
doesn't know or care what `IncrementCommand` actually does; it only knows
the three-member `ICommand` shape, and adapts its own `Click`/`IsEnabled`
behavior to whatever that shape reports.

### SE Lens

Why is this meaningfully better than `Click="IncrementButton_Click"` plus
a hand-written `if (Counter >= 3) { return; }` guard inside the handler?
Because the *button itself* now visibly, correctly reflects whether the
action is allowed — a real, disabled-looking button — instead of looking
identically clickable regardless of state and silently doing nothing when
clicked. This is a genuine UX improvement, not just an internal
refactor: a user can *see* an action isn't currently available, rather
than discovering that only by trying it.

### Connection

The real Add button converts to exactly this pattern next, disabling
itself the instant `NewItemDraft.Name` is blank.

---

## Concept Unit: `InventoryViewModel` — Separating State From the Window

### The Problem

`InventoryPage.xaml.cs` currently mixes three things: data rules (is this
item valid?), data access (SQLite), and WPF plumbing (which `TextBox`
fired `TextChanged`). None of the first two actually need `Page`,
`Window`, or any WPF type at all — testing "does `AddCommand` correctly
refuse a blank name" currently requires constructing an entire `Page`,
just to reach a method that never touches the screen.

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:** New `RelayCommand.cs`, new `InventoryViewModel.cs`,
  `InventoryPage.xaml`, `InventoryPage.xaml.cs`.
- **Change type:** Add/Move/Modify.
- **Dependencies:** Every method this lesson relocates already exists,
  proven, in `InventoryPage.xaml.cs` from Lessons 6 through 22.

### The New Code — `RelayCommand.cs`

```csharp
using System.Windows.Input;

namespace PocketInventory
{
    public class RelayCommand : ICommand
    {
        private readonly Action<object?> execute;
        private readonly Predicate<object?> canExecute;

        public RelayCommand(Action<object?> execute, Predicate<object?> canExecute)
        {
            this.execute = execute;
            this.canExecute = canExecute;
        }

        public bool CanExecute(object? parameter) => canExecute(parameter);

        public void Execute(object? parameter) => execute(parameter);

        public event EventHandler? CanExecuteChanged
        {
            add { CommandManager.RequerySuggested += value; }
            remove { CommandManager.RequerySuggested -= value; }
        }

        public void RaiseCanExecuteChanged() => CommandManager.InvalidateRequerySuggested();
    }
}
```

### The New Code — `InventoryViewModel.cs`

```csharp
using Microsoft.Data.Sqlite;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.ComponentModel;
using System.Globalization;
using System.Windows.Data;

namespace PocketInventory
{
    public class InventoryViewModel : INotifyPropertyChanged
    {
        private const string ConnectionString = "Data Source=pocketinventory.db";
        private int? editingItemId;

        public ObservableCollection<InventoryItem> Items { get; } = new ObservableCollection<InventoryItem>();
        public ICollectionView GroupedItems { get; }
        public Array CategoryValues => Enum.GetValues(typeof(Category));

        private InventoryItem newItemDraft = new InventoryItem();
        public InventoryItem NewItemDraft
        {
            get { return newItemDraft; }
            set
            {
                newItemDraft = value;
                PropertyChanged?.Invoke(this, new PropertyChangedEventArgs(nameof(NewItemDraft)));
                AddCommand.RaiseCanExecuteChanged();
            }
        }

        private InventoryItem? selectedItem;
        public InventoryItem? SelectedItem
        {
            get { return selectedItem; }
            set
            {
                selectedItem = value;
                if (value != null)
                {
                    editingItemId = value.Id;
                    NewItemDraft = new InventoryItem
                    {
                        Name = value.Name,
                        Category = value.Category,
                        Location = value.Location,
                        Value = value.Value,
                        PurchaseDate = value.PurchaseDate,
                        Notes = value.Notes,
                        IsFavorite = value.IsFavorite
                    };
                }
                DeleteCommand.RaiseCanExecuteChanged();
            }
        }

        public event PropertyChangedEventHandler? PropertyChanged;

        public RelayCommand AddCommand { get; }
        public RelayCommand DeleteCommand { get; }

        public InventoryViewModel()
        {
            EnsureDatabaseCreated();
            foreach (InventoryItem item in LoadItemsFromDatabase())
            {
                Items.Add(item);
            }

            GroupedItems = CollectionViewSource.GetDefaultView(Items);
            GroupedItems.GroupDescriptions.Add(new PropertyGroupDescription(nameof(InventoryItem.Category)));
            GroupedItems.SortDescriptions.Add(new SortDescription(nameof(InventoryItem.Name), ListSortDirection.Ascending));

            AddCommand = new RelayCommand(
                execute: _ => AddOrUpdateItem(),
                canExecute: _ => !string.IsNullOrWhiteSpace(NewItemDraft.Name));

            DeleteCommand = new RelayCommand(
                execute: _ => RemoveItem(SelectedItem!),
                canExecute: _ => SelectedItem != null);
        }

        private void AddOrUpdateItem()
        {
            if (editingItemId is int id)
            {
                NewItemDraft.Id = id;
                UpdateItemInDatabase(NewItemDraft);

                for (int index = 0; index < Items.Count; index++)
                {
                    if (Items[index].Id == id)
                    {
                        Items[index] = NewItemDraft;
                        break;
                    }
                }
            }
            else
            {
                Items.Add(NewItemDraft);
                SaveItemToDatabase(NewItemDraft);
            }

            editingItemId = null;
            NewItemDraft = new InventoryItem();
        }

        public void RemoveItem(InventoryItem item)
        {
            DeleteItemFromDatabase(item.Id);
            Items.Remove(item);

            if (editingItemId == item.Id)
            {
                editingItemId = null;
                NewItemDraft = new InventoryItem();
            }
        }

        public void ApplyFilter(string searchText, Category? categoryFilter, bool favoritesOnly)
        {
            GroupedItems.Filter = new Predicate<object>(entry =>
            {
                InventoryItem item = (InventoryItem)entry;
                bool matchesSearch = item.Name.Contains(searchText, StringComparison.OrdinalIgnoreCase);
                bool matchesCategory = categoryFilter == null || item.Category == categoryFilter;
                bool matchesFavorite = !favoritesOnly || item.IsFavorite;
                return matchesSearch && matchesCategory && matchesFavorite;
            });
        }

        // EnsureDatabaseCreated, LoadItemsFromDatabase, SaveItemToDatabase,
        // UpdateItemInDatabase, DeleteItemFromDatabase — unchanged from
        // Lessons 9, 10, 21, and 22, moved here verbatim.
    }
}
```

### The New Code — `InventoryPage.xaml.cs`, Trimmed

```csharp
using System.Windows;
using System.Windows.Controls;

namespace PocketInventory
{
    public partial class InventoryPage : Page
    {
        public InventoryPage()
        {
            InitializeComponent();
            DataContext = new InventoryViewModel();
        }

        private void ItemsGrid_SelectionChanged(object sender, SelectionChangedEventArgs e)
        {
            InventoryViewModel viewModel = (InventoryViewModel)DataContext;
            viewModel.SelectedItem = ItemsGrid.SelectedItem as InventoryItem;
            DetailPanel.DataContext = ItemsGrid.SelectedItem;
        }

        private void DeleteButton_Click(object sender, RoutedEventArgs e)
        {
            InventoryViewModel viewModel = (InventoryViewModel)DataContext;
            if (viewModel.SelectedItem is not InventoryItem selected)
            {
                return;
            }

            MessageBoxResult result = MessageBox.Show(
                $"Delete \"{selected.Name}\"? This cannot be undone.",
                "Confirm Delete",
                MessageBoxButton.YesNo,
                MessageBoxImage.Warning);

            if (result == MessageBoxResult.Yes)
            {
                viewModel.RemoveItem(selected);
            }
        }

        private void SearchBox_TextChanged(object sender, TextChangedEventArgs e)
        {
            ApplyCurrentFilters();
        }

        private void FilterControls_Changed(object sender, RoutedEventArgs e)
        {
            ApplyCurrentFilters();
        }

        private void ApplyCurrentFilters()
        {
            InventoryViewModel viewModel = (InventoryViewModel)DataContext;
            Category? categoryFilter = CategoryFilterBox.SelectedItem as Category?;
            viewModel.ApplyFilter(SearchBox.Text, categoryFilter, FavoritesOnlyBox.IsChecked == true);
        }
    }
}
```

### The New Code — the Add Button in XAML

```xml
<Button Content="Add"
        Style="{StaticResource ToolbarButtonStyle}"
        Margin="12,0,0,0"
        Command="{Binding AddCommand}" />
```

### Mechanical Walkthrough

- `public class InventoryViewModel : INotifyPropertyChanged` — **first
  appearance of a ViewModel class in this project.** Every property and
  method inside it — `Items`, `GroupedItems`, `AddCommand`,
  `EnsureDatabaseCreated`, all of it — compiles and could be tested with
  zero reference to `System.Windows.Controls` or any WPF window type.
- `DataContext = new InventoryViewModel();` — reappearing (`DataContext`,
  familiar since Lesson 3), now pointed at a real, separate object
  instead of `this` (the `Page` itself, every binding target since
  Lesson 6) — every existing `{Binding Items}`, `{Binding NewItemDraft.Name}`,
  and the rest resolve identically, because `DataContext` is still
  whatever object they're all reading from; only *what kind* of object
  that is changed.
- `Command="{Binding AddCommand}"` — **changed** from
  `Click="AddButton_Click"`. `AddButton_Click` itself is gone entirely —
  `AddCommand.Execute` (private `AddOrUpdateItem`) does everything it
  used to, called by WPF instead of by name.
- `viewModel.SelectedItem = ItemsGrid.SelectedItem as InventoryItem;` —
  (first appearance of a code-behind handler forwarding into the
  ViewModel) — `ItemsGrid_SelectionChanged` still exists, because
  `DataGrid.SelectionChanged` has no `ICommand`-bindable equivalent in
  plain WPF; it does the smallest possible job now — telling the
  ViewModel what's selected — instead of containing the actual
  load-into-form logic itself, which moved into `SelectedItem`'s own
  `set` block.
- `if (editingItemId == item.Id) { editingItemId = null; NewItemDraft = new InventoryItem(); }`
  inside `RemoveItem` — worth proving, not trusting: without this check,
  selecting an item, deleting that exact item, then typing a brand-new
  name and clicking Add silently does nothing — `editingItemId` still
  holds the deleted item's `Id`, so `AddOrUpdateItem` takes the `UPDATE`
  branch against a row that no longer exists, and the `for` loop finds no
  matching entry in `Items` either, so the "new" item vanishes with no
  error at all. Reproduced for real, in a throwaway console harness
  referencing this exact `InventoryViewModel` (no `Window` needed —
  this lesson's own central claim, confirmed): `Items.Count` stayed `0`
  after the add without this check, and correctly became `1` with it.

### CS Lens

This is **separation of concerns**, made concrete rather than asserted:
`InventoryViewModel` genuinely could be instantiated, have `AddCommand.Execute(null)`
called, and `Items.Count` checked afterward — in a plain console app, or
a real unit test project, with no `Window` ever created. `InventoryPage`
now contains *only* the things that are genuinely, unavoidably
WPF-specific: which `TextBox` fired an event, whether a `MessageBox` was
confirmed.

### SE Lens

Why does `DeleteButton_Click` stay in code-behind, with the `MessageBox.Show`
call still living there, rather than moving `DeleteCommand`'s `Execute`
straight to a confirmation-then-delete flow entirely inside the
ViewModel? Because `MessageBox.Show` is itself a real WPF UI call — a
`ViewModel` that opens dialog boxes directly is no longer the thing this
lesson just proved was UI-independent. `DeleteCommand`'s `CanExecute`
(is anything selected?) genuinely belongs in the ViewModel and stays
there — disabling the Delete button is a data question. *Confirming* a
destructive action is a UI concern, and this project keeps it exactly
where Lesson 22 first put it: a thin, honest exception, not a rule this
lesson quietly breaks.

### Commands Needed

```bash
dotnet run
```

### Run It

On your Windows machine: clear the `Name` field in the Add row entirely —
the Add button visibly grays out, with no click needed to discover it's
disabled. Type a name; it re-enables immediately. Every other feature —
edit, delete, search, category filter, favorites-only — still works
exactly as it did before this lesson; nothing about the app's visible
behavior changed, only how the code behind it is organized.

### Connection

Epic 5 is complete: create, read, update, and delete are all real,
confirmed, and now properly separated from the window that displays
them. Epic 6 turns to relational data — suppliers, foreign keys, and
`JOIN` — the next real growth in what this project's data actually models.

---

## Closing

### Connect the Pieces

`InventoryPage`'s constructor now creates one `InventoryViewModel` and
sets it as `DataContext` — every binding already written since Lesson 6
(`{Binding Items}`, `{Binding NewItemDraft.Name}`, `{Binding GroupedItems}`)
keeps resolving against it unchanged, because a binding only ever cares
that `DataContext` *has* the named property, never what kind of object
it's attached to. The Add button's `Command="{Binding AddCommand}"`
(this lesson's second unit's proof, applied for real) ties its
`IsEnabled` directly to `!string.IsNullOrWhiteSpace(NewItemDraft.Name)`
— typing or clearing the name field calls `RaiseCanExecuteChanged()`
(inside `NewItemDraft`'s own `set` block, new this lesson), which WPF
uses to re-check that condition and update the button's visible state,
live.

### What Breaks Without This

Temporarily remove the `AddCommand.RaiseCanExecuteChanged();` call from
`NewItemDraft`'s `set` block (leaving everything else unchanged) and
rerun. Type a name into a previously blank Add form. Real, representative
failure: the Add button stays visibly disabled even though `Name` is no
longer blank — `CanExecute` would return `True` if actually asked, but
nothing told WPF to *ask again* after `NewItemDraft` changed, so the
button's displayed `IsEnabled` state silently goes stale. This is exactly
the failure this lesson's first unit's `CanExecuteChanged` proof existed
to prevent. Restore the `RaiseCanExecuteChanged()` call afterward.

### Exercises

- In a throwaway console project, construct a bare `InventoryViewModel`
  (copy `InventoryItem.cs`, `RelayCommand.cs`, and `InventoryViewModel.cs`
  in, no `Page`/`Window` anywhere), call `AddCommand.CanExecute(null)`
  with `NewItemDraft.Name` left blank, then set a real name and check
  again — confirm real output showing `False` then `True`, with no WPF
  window ever created, direct proof of this lesson's central SE claim.
- Predict, in your own words, what happens to the Delete button's
  `IsEnabled` state immediately after this lesson's changes, given it
  still uses `Click`, not `Command` — does it ever visibly disable itself
  the way Add does? Confirm on the real, running app, then explain why,
  referencing this lesson's SE Lens.
- Convert `DeleteCommand`'s `CanExecute` check into a real, bound
  `Command="{Binding DeleteCommand}"` on the Delete button (keeping the
  `MessageBox` confirmation as a *separate* step some other way — you
  decide how, there's more than one reasonable answer) — and explain, in
  your own words, the tradeoff you chose.

### Definition of Done

- [ ] `RelayCommand.cs` and `InventoryViewModel.cs` both exist as
      separate files; `InventoryViewModel` references no WPF UI types.
- [ ] `InventoryPage`'s `DataContext` is a real `InventoryViewModel`
      instance, not `this`.
- [ ] The Add button binds `Command="{Binding AddCommand}"`, visibly
      disabling itself the instant `Name` is blank, with no `Click`
      handler remaining for it.
- [ ] Every existing feature — add, edit, delete, search, filter — still
      works exactly as before this lesson.
- [ ] You reproduced the stale-`IsEnabled` bug on purpose (removing
      `RaiseCanExecuteChanged()`), confirmed it, and restored the call.
- [ ] Committed with a message stating why: for example,
      `git commit -m "Extract InventoryViewModel; Add button uses a real ICommand — Epic 5 complete"`.
