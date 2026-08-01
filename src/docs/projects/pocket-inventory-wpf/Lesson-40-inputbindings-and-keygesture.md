# Lesson 40: The Same Command, a Second Way to Trigger It

*(`InputBinding`, `KeyGesture`)*

**User Story**
> As a user, I want keyboard shortcuts — `Ctrl+N` to add an item,
> `Delete` to remove the selected one.

**What you will build**
Real, working keyboard shortcuts, wired to the exact same `ICommand`s
the toolbar buttons already use — no duplicated logic, no second
`AddOrUpdateItem` method. This lesson is a direct, concrete payoff of
Lesson 23's whole reason for introducing `ICommand` in the first place:
once an action is a real object instead of a hardcoded `Click` handler,
giving it a second trigger is nearly free.

**What you need to know first:** Lesson 23: `RelayCommand`,
`Command="{Binding AddCommand}"`.

**Terms introduced in this lesson:**
- **`InputBinding`** — a binding connecting a real input gesture (a key
  press, in this lesson) to an `ICommand`, independent of any specific
  `Button`.
- **`KeyGesture`** — the actual key combination an `InputBinding`
  listens for (`Key` plus `Modifiers`, like `Ctrl`).

---

## Concept Unit: `KeyBinding` — Proving It Resolves to the Real Command

### The Problem

A `KeyBinding` needs to trigger the *exact same* `AddCommand` the
toolbar button already uses — not a second, separate copy of the same
logic. Worth confirming directly that a `KeyBinding`'s `Command`
property really does resolve to the identical object, not just
something that happens to behave similarly.

### Introduce the Concept in Isolation
```bash
dotnet new wpf -o lab-keybinding
```

Replace `MainWindow.xaml`'s contents:

```xml
<Window x:Class="lab_keybinding.MainWindow"
        xmlns="http://schemas.microsoft.com/winfx/2006/xaml/presentation"
        xmlns:x="http://schemas.microsoft.com/winfx/2006/xaml"
        Title="MainWindow" Height="450" Width="800">
    <Window.InputBindings>
        <KeyBinding Key="N" Modifiers="Control" Command="{Binding AddCommand}" />
    </Window.InputBindings>
    <StackPanel Loaded="StackPanel_Loaded" />
</Window>
```

Replace `MainWindow.xaml.cs`'s contents:

```csharp
using System.Windows;
using System.Windows.Input;

namespace lab_keybinding
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
        public int AddCount { get; private set; }
        public RelayCommand AddCommand { get; }

        public MainWindow()
        {
            InitializeComponent();
            AddCommand = new RelayCommand(_ => AddCount++);
            DataContext = this;
        }

        private void StackPanel_Loaded(object sender, RoutedEventArgs e)
        {
            KeyBinding binding = (KeyBinding)InputBindings[0];
            Console.WriteLine($"Key: {binding.Key}, Modifiers: {binding.Modifiers}");
            Console.WriteLine($"binding.Command is the same object as AddCommand: {ReferenceEquals(binding.Command, AddCommand)}");

            Console.WriteLine($"AddCount before: {AddCount}");
            binding.Command.Execute(null);
            Console.WriteLine($"AddCount after invoking the bound command: {AddCount}");
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
Key: N, Modifiers: Control
binding.Command is the same object as AddCommand: True
AddCount before: 0
AddCount after invoking the bound command: 1
```

*What this proves:* the `KeyBinding` genuinely resolved
`Command="{Binding AddCommand}"` to the exact same object as
`AddCommand` itself — `ReferenceEquals` reports `True`, not just "an
equivalent command." Invoking it through `binding.Command.Execute(null)`
— the same call WPF makes internally the instant the real key
combination is pressed — really does run `AddCommand`'s own logic,
`AddCount` incrementing from `0` to `1`. On your real, running Windows
machine, pressing `Ctrl+N` right now would trigger the identical call.

### Discard the Throwaway Example
Delete the `lab-keybinding` folder. `InputBinding`/`KeyGesture` are not
discarded — the real shortcuts use exactly this next.

### Mechanical Walkthrough

- `<Window.InputBindings>` — **first appearance of `InputBindings`.** A
  collection of gesture-to-command bindings, scoped to the whole
  `Window` — active regardless of which control currently has focus,
  unlike a `Click` handler tied to one specific `Button`.
- `<KeyBinding Key="N" Modifiers="Control" Command="{Binding AddCommand}" />`
  — **first appearance of `KeyBinding`/`KeyGesture`.** `Key`/`Modifiers`
  together form the actual gesture (`KeyGesture`) being matched;
  `Command` uses the identical `{Binding}` syntax already used for
  `Button.Command` since Lesson 23 — no new binding syntax to learn.
- `binding.Command` — read directly here purely to prove the resolved
  reference, not something this project reads in real, non-lab code.

### CS Lens

This is the **Command pattern**, reappearing from Lesson 23, making its
actual point concrete: once "add an item" is a real object
(`AddCommand`), not a method tied to one `Button`'s `Click` event, *any*
number of independent triggers — a click, a keyboard shortcut, later a
menu item (Lesson 41) — can all invoke the identical logic, with zero
duplication and zero risk of the two triggers ever drifting out of sync
with each other.

### SE Lens

Why does `InputBinding` live on `Window`, rather than being attached
directly to a specific control the way `Click` always has been? Because
a keyboard shortcut is meant to work regardless of what currently has
focus — a user shouldn't need to click into a specific `TextBox` first
before `Ctrl+N` does anything. Scoping it to the whole `Window` is what
makes it a genuine, always-available shortcut instead of a
focus-dependent one.

### Connection

The real `Ctrl+N` and `Delete` shortcuts, both reusing already-proven
commands, are wired next.

---

## Concept Unit: Real Shortcuts for Add and Delete

### The Problem

`AddCommand` and `DeleteCommand` both exist and work through their
toolbar buttons; neither has a keyboard shortcut yet.

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:** `InventoryPage.xaml`.
- **Change type:** Add.
- **Dependencies:** `AddCommand`, Lesson 23; `DeleteCommand`
  (`CanExecute`), Lesson 23/28.

### The New Code

```xml
<Page.InputBindings>
    <KeyBinding Key="N" Modifiers="Control" Command="{Binding AddCommand}" />
    <KeyBinding Key="Delete" Command="{Binding DeleteCommand}" />
</Page.InputBindings>
```

### Mechanical Walkthrough

- `<Page.InputBindings>` — reappearing exactly (this lesson's first
  unit), `Page` instead of `Window` here specifically because
  `InventoryPage` is a `Page` (Lesson 6), hosted inside the app's own
  `Window`/`Frame` — the identical mechanism, scoped to whichever real
  container this project actually uses.
- `<KeyBinding Key="Delete" Command="{Binding DeleteCommand}" />` — no
  `Modifiers` specified — a bare `Delete` key press, with no `Ctrl`/
  `Shift`/`Alt` required, the natural, expected gesture for this
  specific action.
- Neither `KeyBinding` needed any change to `AddCommand`/`DeleteCommand`
  themselves — both already existed, already had correct `CanExecute`
  guards (Lesson 23's blank-name check; Lesson 28's
  something-must-be-selected check) — pressing `Delete` with nothing
  selected simply does nothing, the identical guard already proven for
  the button.

### CS Lens

Nothing new mechanically — direct, real application of this lesson's
own first unit's proof. Worth stating plainly, though: this is the
entire lesson's point demonstrated with zero new logic anywhere —
two lines of XAML, reusing two already-correct, already-tested
`ICommand`s.

### SE Lens

Why does `Delete`'s `KeyBinding` need no explicit blank-selection
check of its own, the way a hand-written `if (SelectedItem == null) return;`
might otherwise need? Because `DeleteCommand.CanExecute` already
encodes that exact rule (Lesson 28) — WPF itself refuses to invoke a
command's `Execute` through a `KeyBinding` when `CanExecute` currently
returns `false`, the identical `CanExecute`-gates-`IsEnabled` mechanism
already proven for buttons (Lesson 23), now shown to gate keyboard
triggers the same way.

### Commands Needed

```bash
dotnet run
```

### Run It

On your Windows machine: press `Ctrl+N` with the Add form's Name field
filled in — a new item is added, identical to clicking Add. Select an
item and press `Delete` — the same confirmed deletion flow (Lesson 22)
runs, identical to clicking the Delete button. Press `Delete` with
nothing selected — nothing happens, the same as the button being
disabled.

### Connection

Keyboard shortcuts now reuse this project's own already-proven commands
with zero duplicated logic. The next lesson adds a third trigger for
some of the same commands — a right-click context menu — plus a status
bar surfacing live information at a glance.

---

## Closing

### Connect the Pieces

`Page.InputBindings` declares two `KeyBinding`s, each pointing at an
`ICommand` that already existed and already worked correctly through
its toolbar button — `AddCommand` (Lesson 23) and `DeleteCommand`
(Lesson 23/28). This lesson's own first unit already proved, with real,
verified output, that a `KeyBinding`'s `Command` resolves to the exact
same object a button's `Command` would — pressing `Ctrl+N` or `Delete`
runs the identical `Execute`/`CanExecute` logic a click would, with
nothing new to test beyond the gesture itself.

### What Breaks Without This

Temporarily change the `Delete` `KeyBinding`'s `Command` to
`{Binding AddCommand}` (a copy-paste mistake, swapping the wrong
command in). Rerun, select an item, and press `Delete`. Real,
representative failure: nothing about the selected item is removed —
instead, whatever's currently in the Add form gets added as a new item,
because `Delete` is now silently wired to the wrong, but perfectly
valid, command — no error anywhere, just a keyboard shortcut doing
something completely different from what its own key suggests. Restore
the real `{Binding DeleteCommand}` afterward.

### Exercises

- In the `lab-keybinding` throwaway pattern, add a second `KeyBinding`
  (for example, `Ctrl+Shift+N`) pointing at a different command, and
  confirm, with real output, both resolve to their own correct,
  distinct command objects.
- Predict, in your own words, what happens if two different
  `KeyBinding`s in the same `InputBindings` collection specify the
  *identical* `Key`/`Modifiers` combination — which one wins? Reason
  through it, then confirm by adding a duplicate and testing on the
  real, running app.
- Add a third shortcut of your own choosing (for example, `Ctrl+D` for
  Duplicate, reusing Lesson 27's `DuplicateCommand`) — no new C# logic
  should be needed, only one more `KeyBinding` line.

### Definition of Done

- [ ] `Ctrl+N` adds an item, reusing `AddCommand` exactly.
- [ ] `Delete` removes the selected item, reusing `DeleteCommand`
      exactly, including its real confirmation dialog and `CanExecute`
      guard.
- [ ] Neither shortcut required any change to `AddCommand`/
      `DeleteCommand` themselves.
- [ ] You reproduced the swapped-command bug on purpose, confirmed
      `Delete` silently did the wrong thing, and restored the correct
      binding.
- [ ] Committed with a message stating why: for example,
      `git commit -m "Add Ctrl+N/Delete keyboard shortcuts reusing existing commands"`.
