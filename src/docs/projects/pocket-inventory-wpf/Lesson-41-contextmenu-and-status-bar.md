# Lesson 41: A Popup That Doesn't Live Where You'd Expect

*(`ContextMenu`, `StatusBar`, binding a footer to live view-model state)*

**User Story**
> As a user, I want right-click actions on a row, and a status bar
> showing how many items I have.

**What you will build**
A real right-click menu — Edit, Delete, Duplicate — reusing this
project's own already-proven commands, and a status bar showing a live
item count. This lesson also catches a real, genuinely surprising WPF
behavior before it becomes a silent bug: a `ContextMenu` does **not**
inherit `DataContext` the way every other element in this project has,
proven directly with real, contrasting output before trusting a fix.

**What you need to know first:** Lesson 23: `RelayCommand`,
`Command="{Binding ...}"`. Lesson 40: `ICommand`s reused across multiple
triggers, the same idea this lesson extends to a third trigger.

**Terms introduced in this lesson:**
- **`ContextMenu`** — a popup menu shown on right-click, attached to any
  element via its `ContextMenu` property.
- **`PlacementTarget`** — the element a `ContextMenu` was opened from;
  the real way to reach that element's `DataContext` from inside the
  menu.
- **`StatusBar`** — a WPF control conventionally docked at the bottom of
  a window, showing brief, live status information.
- **`Separator`** — a thin, non-interactive divider line, dropped
  between two items inside a `StatusBar`, `Menu`, or similar container
  to group related items visually with no logic of its own.

**Objects and methods used**
- `ICommand` and `Command="{Binding ...}"` (Lesson 23) reappear here,
  already given full treatment — brief reminder only, per the
  Repetition Rule. `ContextMenu`/`PlacementTarget`/`StatusBar` are this
  lesson's own subject, given full treatment below.

---

## Concept Unit: Why a `ContextMenu`'s Bindings Don't "Just Work"

### The Problem

A `MenuItem` inside a `ContextMenu`, bound the same way every `Button`
in this project has been since Lesson 23 (`Command="{Binding ...}"`),
looks like it should just work. Worth proving directly whether it
actually does, before wiring real commands into it.

### Introduce the Concept in Isolation
```bash
dotnet new wpf -o lab-contextmenu
```

Replace `MainWindow.xaml`'s contents:

```xml
<Window x:Class="lab_contextmenu.MainWindow"
        xmlns="http://schemas.microsoft.com/winfx/2006/xaml/presentation"
        xmlns:x="http://schemas.microsoft.com/winfx/2006/xaml"
        Title="MainWindow" Height="450" Width="800">
    <StackPanel Loaded="StackPanel_Loaded">
        <Border x:Name="TargetBorder" Width="100" Height="50" Background="LightGray">
            <Border.ContextMenu>
                <ContextMenu>
                    <MenuItem x:Name="NaiveMenuItem" Header="Naive (inherited DataContext)" Command="{Binding SomeCommand}" />
                    <MenuItem x:Name="FixedMenuItem" Header="Fixed (PlacementTarget)"
                              Command="{Binding PlacementTarget.DataContext.SomeCommand, RelativeSource={RelativeSource AncestorType=ContextMenu}}" />
                </ContextMenu>
            </Border.ContextMenu>
        </Border>
    </StackPanel>
</Window>
```

Replace `MainWindow.xaml.cs`'s contents:

```csharp
using System.Windows;
using System.Windows.Controls;
using System.Windows.Input;

namespace lab_contextmenu
{
    public class RelayCommand : ICommand
    {
        private readonly Action<object?> execute;
        public RelayCommand(Action<object?> execute) => this.execute = execute;
        public bool CanExecute(object? parameter) => true;
        public void Execute(object? parameter) => execute(parameter);
        public event EventHandler? CanExecuteChanged { add { } remove { } }
    }

    public partial class MainWindow : Window
    {
        public RelayCommand SomeCommand { get; }

        public MainWindow()
        {
            InitializeComponent();
            SomeCommand = new RelayCommand(_ => Console.WriteLine("SomeCommand executed"));
            DataContext = this;
        }

        private void StackPanel_Loaded(object sender, RoutedEventArgs e)
        {
            Console.WriteLine($"Naive MenuItem.Command is null: {NaiveMenuItem.Command == null}");

            ContextMenu menu = TargetBorder.ContextMenu;
            menu.PlacementTarget = TargetBorder;

            Console.WriteLine($"Fixed MenuItem.Command is null: {FixedMenuItem.Command == null}");
            Console.WriteLine($"Fixed MenuItem.Command resolved correctly: {ReferenceEquals(FixedMenuItem.Command, SomeCommand)}");
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
Naive MenuItem.Command is null: True
Fixed MenuItem.Command is null: False
Fixed MenuItem.Command resolved correctly: True
```

*What this proves:* `NaiveMenuItem.Command`, bound the exact same way
every `Button` in this project has been since Lesson 23, is genuinely
`null` — the plain `{Binding SomeCommand}` never resolved at all. A
`ContextMenu` is a separate popup, not a normal part of the visual tree
the element it's attached to lives in, so `DataContext` doesn't flow
into it automatically the way it does into an ordinary child element.
`FixedMenuItem`, using `PlacementTarget.DataContext` with a
`RelativeSource` pointing at the `ContextMenu` itself, correctly
resolves — `ReferenceEquals` confirms it's the exact same `SomeCommand`
object.

### Discard the Throwaway Example
Delete the `lab-contextmenu` folder. The `PlacementTarget.DataContext`
pattern is not discarded — the real inventory row's context menu uses
exactly this next.

### Mechanical Walkthrough

- `Command="{Binding SomeCommand}"` inside a `ContextMenu` — **proven
  broken, deliberately, first.** A plain `{Binding}` here resolves
  against the `ContextMenu`'s own (effectively absent) `DataContext`,
  not the `Window`'s.
- `menu.PlacementTarget = TargetBorder;` — (first appearance of
  `PlacementTarget`, set manually here to make this proof runnable
  without a real right-click) — in real, interactive use, WPF sets this
  automatically the moment a `ContextMenu` opens, to whatever element it
  was opened from.
- `{Binding PlacementTarget.DataContext.SomeCommand, RelativeSource={RelativeSource AncestorType=ContextMenu}}`
  — **first appearance of this specific fix.** `RelativeSource AncestorType=ContextMenu`
  finds the `ContextMenu` itself (since the `MenuItem`'s own ancestors,
  in its *logical* tree, do include the menu); `.PlacementTarget.DataContext`
  then reaches back out to the element that actually opened it, and
  that element's real `DataContext` — the `Window`'s, in this lab.

### CS Lens

This is a real, concrete case where WPF's **logical tree** (used for
property/`DataContext` inheritance) and an element's *visual*
placement genuinely diverge — a `ContextMenu` is logically rooted
separately, popped up wherever it's shown, rather than nested inside
the element that opened it the way a child `Button` inside a `StackPanel`
would be. Property inheritance follows the logical tree exactly as
designed; the surprise is only in assuming a `ContextMenu` is part of
the same logical tree as its `PlacementTarget`, when it isn't.

### SE Lens

Why does this matter enough for its own concept unit, rather than being
a minor XAML quirk? Because the failure mode is silent and easy to
ship: a `ContextMenu` with an unresolved `Command` doesn't throw, doesn't
show a design-time error — the menu item just does nothing when
clicked, indistinguishable at a glance from a `CanExecute` returning
`false`. Proving the real cause here, once, means recognizing it
immediately in the real project instead of debugging a "why doesn't
this menu item do anything" mystery from scratch.

### Connection

The real row context menu, using exactly this fix, is built next.

---

## Concept Unit: A Real Right-Click Menu and Status Bar

### The Problem

Nothing in this project currently offers a right-click menu, and
nothing shows a live item count at a glance.

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:** `InventoryPage.xaml`.
- **Change type:** Add.
- **Dependencies:** `PlacementTarget.DataContext` fix, previous unit;
  `EditCommand`-equivalent (reuse `SelectedItem` + the existing edit
  flow, Lesson 21), `DeleteCommand`, `DuplicateCommand` (Lesson 27).

### The New Code — the Context Menu

```xml
<DataGrid.ContextMenu>
    <ContextMenu>
        <MenuItem Header="Delete"
                  Command="{Binding PlacementTarget.DataContext.DeleteCommand, RelativeSource={RelativeSource AncestorType=ContextMenu}}" />
        <MenuItem Header="Duplicate"
                  Command="{Binding PlacementTarget.DataContext.DuplicateCommand, RelativeSource={RelativeSource AncestorType=ContextMenu}}" />
    </ContextMenu>
</DataGrid.ContextMenu>
```

### The New Code — the Status Bar

```xml
<StatusBar Grid.Row="3">
    <StatusBarItem>
        <TextBlock Text="{Binding Items.Count, StringFormat={}{0} item(s)}" />
    </StatusBarItem>
    <Separator />
    <StatusBarItem>
        <TextBlock Text="{Binding TotalValue, StringFormat={}Total: {0:C}}" />
    </StatusBarItem>
</StatusBar>
```

### Mechanical Walkthrough

- `<DataGrid.ContextMenu>` — reappearing shape (attached-property-style
  XAML, familiar since `Grid.Row` in Lesson 2), attaching the menu to
  the whole grid — right-clicking any row opens it, `PlacementTarget`
  becoming that specific `DataGrid` each time.
- Both `MenuItem`s reuse the exact `PlacementTarget.DataContext...`
  pattern proven in this lesson's first unit — `DeleteCommand` and
  `DuplicateCommand` already exist, already work through their toolbar
  buttons (Lessons 23, 27); nothing about either command changed to
  support this third trigger.
- `{Binding Items.Count, StringFormat={}{0} item(s)}` — reappearing
  (`StringFormat`, familiar since Lesson 13), `Items.Count` updating
  live as items are added or removed — `ObservableCollection<T>`
  (Lesson 7) raises its own change notification for `Count` on every
  add/remove, the same mechanism that's kept `ItemsGrid` live all
  along, now also driving a plain `TextBlock`.
- `<Separator />` — **first appearance.** A real `StatusBar` (and
  `Menu`) divider control — a thin, non-interactive visual rule with no
  data and no logic of its own, no properties set here at all. Dropped
  between the two `StatusBarItem`s purely so a reader's eye has
  something to catch on between "item count" and "total value," instead
  of two `TextBlock`s running together with nothing marking where one
  ends and the next begins.

### CS Lens

The status bar's `TotalValue` binding reuses the exact property Lesson
30 already proved correct — no new query, no new logic, direct
confirmation that a value computed for one purpose (a dashboard
summary) is equally valid reused for a second, much smaller one (a
one-line footer).

### SE Lens

This lesson's own glossary names the real principle directly:
**discoverability — the same commands, surfaced a third way.** A
toolbar button, a keyboard shortcut (Lesson 40), and now a right-click
menu all trigger the identical `DeleteCommand`/`DuplicateCommand` —
different users discover and prefer different interaction styles, and
offering the same real capability through multiple paths, with zero
duplicated logic, costs only a little XAML once the underlying
`ICommand`s already exist.

### Commands Needed

```bash
dotnet run
```

### Run It

On your Windows machine: right-click any row — Delete and Duplicate
both appear and both work, identical to their toolbar buttons and
keyboard shortcuts. The status bar at the bottom always shows the
current item count and total value, updating live as you add, delete,
or archive items.

### Connection

Epic 10 is complete: theming, shortcuts, and now discoverable actions
and live status, all reusing already-proven pieces. Epic 11 turns to
multi-item selection — choosing several rows at once, and acting on all
of them together.

---

## Closing

### Connect the Pieces

Right-clicking `ItemsGrid` opens its `ContextMenu`, with `PlacementTarget`
set automatically by WPF to `ItemsGrid` itself. Each `MenuItem`'s
`Command` binding follows the exact `PlacementTarget.DataContext...`
path proven, with real, contrasting output, in this lesson's own first
unit — reaching `InventoryViewModel`'s already-proven `DeleteCommand`/
`DuplicateCommand`, unchanged since Lessons 23 and 27. The status bar's
two `TextBlock`s bind directly to `Items.Count` and `TotalValue`
(Lesson 30), both already-live, already-correct properties, reused here
for a third and fourth real purpose respectively.

### What Breaks Without This

Temporarily remove the `PlacementTarget.DataContext...`/`RelativeSource`
portion from one `MenuItem`'s binding, leaving just
`Command="{Binding DeleteCommand}"` — the naive version this lesson's
first unit already proved broken. Rerun, right-click a row, and click
Delete from the menu. Real, representative failure: nothing happens at
all — no error, no console output, the menu simply closes — because the
binding never resolved a real command in the first place, exactly the
silent failure mode this lesson's own SE Lens named as the real reason
this deserved its own proof. Restore the real
`PlacementTarget.DataContext` binding afterward.

### Exercises

- In the `lab-contextmenu` throwaway pattern, add a third `MenuItem`
  using the fixed pattern and confirm, with real output, it resolves
  correctly too — the fix isn't specific to one particular `MenuItem`.
- Predict, in your own words, what `PlacementTarget` would be if the
  same `ContextMenu` were attached to `Border` in this lab's own
  example versus attached to the whole `StackPanel` instead — does the
  fix still work either way?
- Add a real "Edit" `MenuItem` to `ItemsGrid`'s context menu — since
  this project has no single dedicated `EditCommand` (editing happens
  by selecting a row, which already populates the Add form, per Lesson
  21), decide what this menu item should actually do, and justify your
  choice in a comment.

### Definition of Done

- [ ] Right-clicking a row in `ItemsGrid` shows a real context menu with
      Delete and Duplicate.
- [ ] Both menu items use the `PlacementTarget.DataContext` binding
      pattern and correctly trigger their real, already-proven commands.
- [ ] A status bar shows a live item count and total value, both
      updating automatically as the inventory changes.
- [ ] You reproduced the silent-failure naive binding on purpose,
      confirmed a context menu click does nothing with no error, and
      restored the real `PlacementTarget` binding.
- [ ] Committed with a message stating why: for example,
      `git commit -m "Add a right-click context menu and live status bar — Epic 10 complete"`.
