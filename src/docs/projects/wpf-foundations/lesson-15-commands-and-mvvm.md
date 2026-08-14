# Lesson 15: Commands and MVVM

**What you will build:** a real `ICommand` implementation
(`RelayCommand`), proven against a `Button` two ways — via `Click` first
(showing the real problem), then via `Command` (showing the fix) — and a
real `MainViewModel` proven testable with zero `Window` ever opened.

**What you need to know first:** [Lesson 06](lesson-06-delegates-func-action.md)
(`Func<>`/`Action<>`) and [Lesson 14](lesson-14-data-binding-fundamentals.md)
(`INotifyPropertyChanged`, `DataContext`).

**Terms introduced in this lesson:**
- **`ICommand`** — a real .NET interface describing a bindable action:
  whether it can currently run, and what running it does.
- **MVVM (Model-View-ViewModel)** — an architecture splitting plain data
  (Model), markup-only UI (View), and a UI-independent class exposing
  bindable state and commands (ViewModel).

**Objects and methods used:**

**`ICommand`**
- *What it is:* a real interface in `System.Windows.Input`.
- *Implementation:* `public interface ICommand { bool
  CanExecute(object? parameter); void Execute(object? parameter); event
  EventHandler? CanExecuteChanged; }` — confirmed against the real .NET
  interface declaration.
- *Its use:* the interface this lesson's `RelayCommand` implements, and
  the real type `Button.Command` expects.

---

## Concept Unit: The Real Problem With Logic Inside a `Click` Handler

### The Problem

A `Click` handler (Lesson 13) reaching directly into named controls —
`NameBox.Text`, `ItemsList.SelectedItem` — works for one button on one
screen. Whether that same shape scales to a real screen with several
related actions needs to be shown as a real, felt problem, not assumed.

### Introduce the Concept in Isolation

```csharp
private void AddButton_Click(object sender, RoutedEventArgs e)
{
    if (string.IsNullOrWhiteSpace(NameBox.Text)) return;
    Items.Add(new Item { Name = NameBox.Text });
    NameBox.Clear();
}
```

This compiles and works — and it can only be exercised by actually
clicking a real button in a real, open `Window`. Writing a test for "does
Add correctly reject blank input" requires constructing an entire
`Window`, finding `NameBox` inside it, and simulating a click — real,
heavy machinery for testing what's really just an `if` check and a list
add. This is the real, provable cost this lesson's fix addresses: logic
and UI are the same piece of code, so testing the logic *is* testing the
UI.

### Discard

This handler is disposable; the real fix, `RelayCommand`, is built next.

### Mechanical Walkthrough

- `string.IsNullOrWhiteSpace(NameBox.Text)` — **(c) already basic**, a
  real .NET method already familiar in shape from earlier lessons'
  string handling.
- `NameBox.Text` / `Items.Add(...)` / `NameBox.Clear()` — **(c) already
  basic**, ordinary member access; their direct coupling to a specific
  named control is this unit's entire point.

## Concept Unit: `ICommand` — a Bindable Action Instead of a Bindable Value

### The Problem

Lesson 14 proved a *value* (`Name`) can be bound so the UI reflects it
automatically. An *action* — "run this when clicked, but only if it's
currently valid to" — needs a comparable, bindable shape. Does .NET
provide a real interface for this?

### Introduce the Concept in Isolation

```csharp
public class RelayCommand : ICommand
{
    private readonly Action<object?> _execute;
    private readonly Func<object?, bool>? _canExecute;

    public RelayCommand(Action<object?> execute, Func<object?, bool>? canExecute = null)
    {
        _execute = execute;
        _canExecute = canExecute;
    }

    public bool CanExecute(object? parameter) => _canExecute?.Invoke(parameter) ?? true;
    public void Execute(object? parameter) => _execute(parameter);

    public event EventHandler? CanExecuteChanged
    {
        add => CommandManager.RequerySuggested += value;
        remove => CommandManager.RequerySuggested -= value;
    }
}
```

```csharp
var printCommand = new RelayCommand(
    execute: _ => Console.WriteLine("Executed!"),
    canExecute: _ => true);

Console.WriteLine(printCommand.CanExecute(null));
printCommand.Execute(null);
```

Output:
```
True
Executed!
```

`RelayCommand` implements `ICommand` by *wrapping* two ordinary
delegates (Lesson 06) — it doesn't know or care what the actual behavior
is, exactly the way `Doorbell` (Lesson 07) never knew what its
subscribers did. `printCommand.CanExecute(null)` correctly runs the
supplied `_ => true` and returns `True`; `printCommand.Execute(null)`
runs the supplied `_ => Console.WriteLine("Executed!")` and produces the
real printed line — proof this class is a genuine, working `ICommand`,
built from nothing but delegates already known from Lesson 06.

### Discard

This throwaway `printCommand` is disposable; `RelayCommand` itself is
not — it's real, reusable infrastructure this lesson's remaining units
build on.

### Mechanical Walkthrough

- `private readonly Action<object?> _execute;` — **(b) hard concept
  reappearing**, `Action<>` from Lesson 06, stored as a field; `readonly`
  — **(a) first appearance**: assignable only in the constructor, never
  reassigned after — a real, compiler-enforced guarantee this field's
  value is fixed once the object is built.
- `private readonly Func<object?, bool>? _canExecute;` — **(b) hard
  concept reappearing**, `Func<>` from Lesson 06; the trailing `?` —
  **(b) hard concept reappearing** from Lesson 03, this field may
  genuinely be `null` when no `canExecute` logic was supplied.
- `public RelayCommand(Action<object?> execute, Func<object?, bool>?
  canExecute = null)` — **(a) first appearance** of a **default
  parameter value**: `= null` means callers can omit `canExecute`
  entirely, and it's treated as `null` automatically — no method
  overload needed for "called with just one argument."
- `_canExecute?.Invoke(parameter) ?? true` — **(b) hard concept
  reappearing**, the null-conditional `?.Invoke` from Lesson 07; **(a)
  first appearance** of the **null-coalescing operator** `??`: "if the
  left side evaluates to `null`, use the right side instead" — no
  `canExecute` supplied means `_canExecute?.Invoke(parameter)` itself
  evaluates to `null`, and `?? true` supplies the correct default,
  "always allowed."
- `public event EventHandler? CanExecuteChanged { add => ...; remove =>
  ... }` — **(a) first appearance** of a custom event accessor: rather
  than a plain `public event EventHandler? X;` (Lesson 07's own shape),
  this hooks `+=`/`-=` on `CanExecuteChanged` directly into WPF's own
  `CommandManager.RequerySuggested` — a real, built-in WPF event firing
  automatically after most user input, which is what makes a
  `Command`-bound `Button` re-check `CanExecute` and re-enable/disable
  itself with no manual "please recheck me" call anywhere in application
  code. This is genuine WPF-specific plumbing, not something to
  reproduce from memory — the correct move is copying this exact shape
  when writing a `RelayCommand`, understanding *why* it's there (proven
  directly in the next unit) rather than deriving it from first
  principles each time.

## Concept Unit: `Command="{Binding ...}"` — Wiring a Button to an `ICommand`

### The Problem

`RelayCommand` is a real, working `ICommand` — but nothing yet connects
it to an actual `Button` on screen. Does `Button` bind to an `ICommand`
the same `{Binding}` way Lesson 14 bound a plain value?

### Introduce the Concept in Isolation

```csharp
public class MainViewModel
{
    public ICommand AddCommand { get; }

    public MainViewModel()
    {
        AddCommand = new RelayCommand(
            execute: _ => Console.WriteLine("Add ran"),
            canExecute: _ => true);
    }
}
```

```xml
<Button Content="Add" Command="{Binding AddCommand}" />
```

```csharp
public MainWindow()
{
    InitializeComponent();
    DataContext = new MainViewModel();
}
```

Clicking the button prints `Add ran` — `Command="{Binding AddCommand}"`
is the *exact same* `{Binding ...}` markup extension from Lesson 14,
now pointed at a property of type `ICommand` instead of a plain value.
`Button`, seeing a bound `ICommand`, calls `Execute` on click
automatically — no `Click="..."` handler anywhere in this code.

### Discard

This proof is disposable; a real `CanExecute`-driven disable/enable
proof, next, uses a slightly richer version.

### Mechanical Walkthrough

- `public ICommand AddCommand { get; }` — **(b) hard concept
  reappearing**, a read-only auto-property (Lesson 02's `{ get; }`, no
  `set` at all — assignable only from inside the constructor, the same
  restriction `readonly` enforced on `RelayCommand`'s own fields).
- `Command="{Binding AddCommand}"` — **(a) first appearance** of binding
  specifically to a command-typed property; the `{Binding ...}`
  mechanism itself is fully known from Lesson 14 — only the *target
  property's type* (`ICommand` instead of `string`/`decimal`) is new
  here, and `Button` handles either correctly with no different syntax.

## Concept Unit: `CanExecute` Actually Disables the Button

### The Problem

`ICommand.CanExecute` returns a real `bool`. Does anything *visible*
happen when it returns `false`, or does a bound `Button` stay clickable
regardless?

### Introduce the Concept in Isolation

```csharp
public class MainViewModel : INotifyPropertyChanged
{
    private string _newItemName = "";
    public string NewItemName
    {
        get => _newItemName;
        set { _newItemName = value; OnPropertyChanged(); }
    }

    public ICommand AddCommand { get; }

    public MainViewModel()
    {
        AddCommand = new RelayCommand(
            execute: _ => Console.WriteLine($"Added: {NewItemName}"),
            canExecute: _ => !string.IsNullOrWhiteSpace(NewItemName));
    }

    public event PropertyChangedEventHandler? PropertyChanged;
    private void OnPropertyChanged([CallerMemberName] string? name = null) =>
        PropertyChanged?.Invoke(this, new PropertyChangedEventArgs(name));
}
```

```xml
<TextBox Text="{Binding NewItemName, UpdateSourceTrigger=PropertyChanged}" />
<Button Content="Add" Command="{Binding AddCommand}" />
```

With `NewItemName` empty, the "Add" button renders visibly disabled
(greyed out, unclickable) — real, observed, with zero code explicitly
setting `IsEnabled`. Typing a single character makes it enable itself
immediately, live, still with no code directly toggling it.

### Discard

This proof is not fully disposable — this shape (a `RelayCommand` whose
`canExecute` checks a bound property) is the real, standard pattern used
throughout the rest of this series wherever MVVM-style commands appear.

### Mechanical Walkthrough

- `set { _newItemName = value; OnPropertyChanged(); }` — **(b) hard
  concept reappearing**, `INotifyPropertyChanged`'s real pattern from
  Lesson 14, here via a helper method instead of inlining
  `PropertyChanged?.Invoke(...)` directly.
- `[CallerMemberName] string? name = null` — **(a) first appearance** of
  a real C# attribute: the compiler automatically fills in the *calling
  property's own name* as this parameter's argument, so
  `OnPropertyChanged()` called from inside `NewItemName`'s `set` needs
  no explicit `nameof(NewItemName)` — it's supplied for free, by the
  compiler, based purely on which property's `set` block called it.
- `canExecute: _ => !string.IsNullOrWhiteSpace(NewItemName)` — **(b)
  hard concept reappearing**, ordinary lambda; its real effect — driving
  the button's visible enabled state — is proven by the live behavior
  observed above, not asserted.
- The real mechanism connecting a `TextBox` edit to the button
  re-checking itself: typing fires `NewItemName`'s `set`, which calls
  `OnPropertyChanged()`, which is a plain `PropertyChanged` notification
  (Lesson 14) — separately, WPF's `CommandManager.RequerySuggested`
  (fired by `RelayCommand`'s own custom `CanExecuteChanged` accessor,
  previous unit) fires after essentially any user input event, which is
  what actually triggers WPF to re-ask every visible command's
  `CanExecute` and update each bound button's `IsEnabled` accordingly.

## Concept Unit: What MVVM Actually Names

### The Problem

`MainViewModel` above has no reference to `Button`, `TextBox`, or any
type from `System.Windows.Controls` anywhere in it. Whether that
property is genuinely useful, or just an incidental fact about this
lesson's example, needs to be proven directly.

### Introduce the Concept in Isolation

```csharp
var vm = new MainViewModel();
vm.NewItemName = "Drill";
vm.AddCommand.Execute(null);
```

Output:
```
Added: Drill
```

This is a **plain console program** — no `Window`, no `InitializeComponent()`,
no XAML file loaded, no WPF application running at all — and it fully
exercises `MainViewModel`'s real add logic, correctly. This is called
**MVVM (Model-View-ViewModel)**: `Item`/`MainViewModel`'s own plain data
is the **Model**; the `.xaml` file (markup and bindings only, no logic
beyond what `{Binding}` expresses) is the **View**; `MainViewModel`
itself — plain C#, `INotifyPropertyChanged`, `ICommand`s, zero UI-type
references — is the **ViewModel**. The lesson's very first unit named
the real problem this fixes: `AddButton_Click`'s logic could only be
exercised by clicking a real button in a real window; `MainViewModel`'s
identical logic just ran, correctly, with none of that machinery at all.

### Discard

Nothing here is disposable — this is the real architecture the rest of
this series' WPF lessons build on.

### SE Lens

The real alternative — logic living directly in code-behind, as this
lesson opened with — is not automatically wrong: for one button on one
small, truly simple screen, a `Click` handler is genuinely less
ceremony, and MVVM's extra indirection (a whole `RelayCommand` wrapper,
a separate ViewModel class) is real overhead bought for no payoff yet.
The tradeoff becomes worth it specifically once logic needs to be tested
independent of a running UI (proven directly above) or reused/triggered
from more than one place — introduce MVVM when that pain is real and
felt, exactly as this lesson's own first unit demonstrated it, not as a
rule applied uniformly regardless of a screen's actual size.

## Connect the pieces

One trace: a `Click` handler reaching into named controls directly can
only be tested by opening a real window — the real, felt problem.
`ICommand` gives a bindable *action* the same status `{Binding}` already
gave a bindable *value* (Lesson 14); `RelayCommand` implements it by
wrapping ordinary `Func<>`/`Action<>` delegates (Lesson 06).
`Command="{Binding AddCommand}"` wires it to a `Button` with the same
markup extension already known; `CanExecute`, tied to
`CommandManager.RequerySuggested`, drives the button's real, visible
enabled state with zero manual toggling. The payoff, proven directly:
the exact same add logic ran correctly from a plain console program, no
`Window` involved at all — the concrete, provable reason MVVM exists.

## What breaks without this

Omit the `canExecute` argument entirely from `RelayCommand`'s
constructor (relying on its `= null` default), keeping everything else
unchanged. Real, observed result: the "Add" button is **always**
enabled, even with `NewItemName` empty — `CanExecute` falls back to
`_canExecute?.Invoke(parameter) ?? true`, and with `_canExecute` truly
`null`, that expression evaluates to `true` unconditionally. Direct,
provable confirmation the null-coalescing default from this lesson's
second unit is exactly what determines this fallback behavior, not a
separate special case written elsewhere.

## Exercises

1. Add a `DeleteCommand` to `MainViewModel`, wired to a second `Button`,
   whose `canExecute` checks whether a bound `SelectedItem` property is
   non-null. Confirm the delete button is disabled with nothing selected
   and enables once something is.
2. Write a small, standalone console program (no `Window`, matching this
   lesson's own MVVM-proof shape) that constructs `MainViewModel`,
   asserts `AddCommand.CanExecute(null)` is `false` before setting
   `NewItemName`, then `true` after — confirming the exact behavior
   proven visually earlier, now proven through code with no UI at all.

## Definition of Done

- [ ] You reproduced the real testing-cost problem from a `Click`
      handler reaching into named controls.
- [ ] You built `RelayCommand` and confirmed it correctly wraps
      arbitrary `Execute`/`CanExecute` delegates.
- [ ] You confirmed a `Command`-bound button visibly enables/disables
      itself with zero manual `IsEnabled` code.
- [ ] You ran `MainViewModel`'s real logic from a plain console program
      with no `Window` involved, and understood why that's the actual
      point of MVVM.
- [ ] You completed both exercises.

## Next

[Lesson 16 — Resources and Styles](lesson-16-resources-and-styles.md)
covers keeping visual appearance DRY across a whole application —
`ResourceDictionary`, `Style`, `Setter`, and `Trigger` — the real
mechanism behind a `Button`'s hover/disabled *look*, distinct from the
`IsEnabled` *behavior* this lesson just proved.
