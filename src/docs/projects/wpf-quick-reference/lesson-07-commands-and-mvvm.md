# Lesson 07: Commands and MVVM

**What this covers:** `ICommand`, a hand-written `RelayCommand`, and what
MVVM (Model-View-ViewModel) actually is — not as a rule to follow because
"that's the WPF way," but as the concrete fix for a real, felt problem.
This is the lesson worth reading even if your assignment doesn't strictly
need it — it's the difference between patching a file you were handed and
genuinely improving its structure.

**What you need to know first:** [Lesson 05](lesson-05-events-and-routed-events.md)
(what `Click` handlers are, so you can see what this replaces) and
[Lesson 06](lesson-06-data-binding-fundamentals.md) (`INotifyPropertyChanged`,
which a ViewModel also implements).

## The problem, concretely

Code-behind `Click` handlers work fine for one button. A real screen with
Add, Edit, Delete, and Save often ends up like this:

```csharp
private void AddButton_Click(object sender, RoutedEventArgs e)
{
    if (string.IsNullOrWhiteSpace(NameBox.Text)) return;
    Items.Add(new Item { Name = NameBox.Text });
    NameBox.Clear();
}

private void DeleteButton_Click(object sender, RoutedEventArgs e)
{
    if (ItemsList.SelectedItem is Item item)
        Items.Remove(item);
}
```

Two real problems, both structural, not stylistic: this logic can only be
tested by actually clicking buttons in a running window — there's no way
to call `AddButton_Click` from a unit test without a real `Button` and a
real `RoutedEventArgs` to hand it, most of which it doesn't even use. And
every handler reaches directly into named controls (`NameBox.Text`,
`ItemsList.SelectedItem`) — the logic and the UI are the same piece of
code, so testing the logic *is* testing the UI, and the two can never be
separated later without a rewrite.

## `ICommand` — a bindable action instead of a bindable value

```csharp
public interface ICommand
{
    bool CanExecute(object? parameter);
    void Execute(object? parameter);
    event EventHandler? CanExecuteChanged;
}
```

This is a real .NET interface (`System.Windows.Input.ICommand`), not
project-specific. Two methods and one event: `Execute` is the actual
action; `CanExecute` returns whether it's currently valid to run (WPF
automatically disables a bound `Button` — greys it out — when this
returns `false`, with zero code written for that); `CanExecuteChanged`
lets a command announce "re-check `CanExecute`, something that affects it
just changed" — the same `event` mechanism as `INotifyPropertyChanged`'s
`PropertyChanged` (Lesson 06), applied to "is this action currently
allowed" instead of "did this value change."

## A hand-written `RelayCommand` — the standard implementation

No built-in concrete class ships this in WPF itself (frameworks like
Prism/CommunityToolkit.Mvvm provide one; this reference writes it by hand
so nothing is hidden):

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

- `Action<object?> _execute` / `Func<object?, bool>? _canExecute` — the
  `Func<>`/`Action<>` delegate types from Lesson 00b, stored as fields:
  `RelayCommand` doesn't know or care *what* action it wraps — it's handed
  the actual behavior as a value, the same way `Doorbell` never knew what
  its subscribers did.
- The constructor takes the real logic as parameters — `execute` is
  required, `canExecute` optional (defaults to `null`, meaning "always
  allowed").
- `CanExecute` calls `_canExecute?.Invoke(parameter) ?? true` — the
  null-conditional from Lesson 00b, plus the **null-coalescing operator**
  `??` (first appearance): "if the left side is `null`, use the right
  side instead" — no `_canExecute` supplied means always return `true`.
- `CanExecuteChanged`'s `add`/`remove` — a custom event implementation
  (rather than a plain `public event EventHandler? X;`) that hooks into
  WPF's own `CommandManager.RequerySuggested` — a built-in WPF event that
  fires automatically after most user input, which is what makes buttons
  re-enable/disable themselves without any manual "please recheck me"
  call. Not required to understand line-by-line to use `RelayCommand`
  correctly — flagged honestly as the one piece of real WPF-specific
  plumbing in this class, not something to reproduce from memory.

## Using it from a ViewModel

```csharp
public class MainViewModel : INotifyPropertyChanged
{
    public ObservableCollection<Item> Items { get; } = new();

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
            execute: _ => {
                Items.Add(new Item { Name = NewItemName });
                NewItemName = "";
            },
            canExecute: _ => !string.IsNullOrWhiteSpace(NewItemName)
        );
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

- `Command="{Binding AddCommand}"` — the exact same `{Binding}` markup
  extension from Lesson 06, now pointed at a property whose type is
  `ICommand` instead of a plain value — WPF's `Button` knows how to bind
  either kind, calling `Execute` on click and greying itself out whenever
  `CanExecute` returns `false`.
- `execute: _ => { ... }` — a lambda (Lesson 00b) ignoring its parameter
  (the conventional `_` name for "this parameter exists but I'm not
  using it").
- `[CallerMemberName] string? name = null` — first appearance: a real
  C# attribute that makes the compiler automatically fill in the calling
  property's name as the argument, so every property's `set` can call
  `OnPropertyChanged()` with no arguments instead of repeating
  `nameof(NewItemName)` by hand in every single property — a real,
  common way to shrink the `INotifyPropertyChanged` boilerplate from
  Lesson 06 once there are several properties.

**Live proof `CanExecute` actually works:** with `NewItemName` empty, the
"Add" button renders visibly disabled (greyed, unclickable) — type a
character, and it becomes enabled with zero code watching for that
transition directly; `CommandManager.RequerySuggested` firing after the
`TextBox` edit is what triggers WPF to re-ask `CanExecute`.

## What MVVM actually names

**Model** — the plain data (`Item`, from earlier lessons) with no WPF
dependency at all. **View** — the `.xaml` file, markup only, no logic
beyond bindings. **ViewModel** — a plain C# class (`MainViewModel`
above) implementing `INotifyPropertyChanged`, exposing properties and
`ICommand`s the View binds to, with **zero reference to any WPF UI
type** — no `Button`, no `TextBox`, nothing from `System.Windows.Controls`
anywhere in it. That last property is the entire payoff: `MainViewModel`
above can be constructed and tested (call `AddCommand.Execute(null)`,
assert `Items.Count` went up) in a plain unit test with no window ever
opened — the exact problem named at the top of this lesson, solved.

## SE Lens

The real alternative MVVM replaces is what this lesson opened with:
logic living directly inside code-behind, reaching into named controls
by field access. That's not automatically wrong — for one button on one
small screen, a `Click` handler is genuinely simpler and MVVM's extra
indirection (a whole ViewModel class, a `RelayCommand` wrapper) is real
overhead with no payoff yet. The tradeoff becomes worth it specifically
once logic needs to be tested independent of a running UI, or once the
same logic needs to be reused/triggered from more than one place (a
button click and a keyboard shortcut both running the same save action,
say) — introduce MVVM when that pain is real, not as a rule applied to
every screen regardless of size.

## What to check first in your assigned project

- Any `Click="X_Click"` handler whose body does real work (touches data,
  not just UI cosmetics) is a candidate for extraction into a ViewModel
  command — a concrete, demonstrable "made it better" if that's part of
  your assignment.
- Look for an existing `ICommand`/`RelayCommand`-shaped class already in
  the project before writing a new one — many assignment starter projects
  include one, under a different name (`DelegateCommand`,
  `ActionCommand`) but the identical shape.
- A ViewModel that references `System.Windows` types directly (a
  `MessageBox.Show` call inside a ViewModel, for instance) is a common,
  real MVVM violation worth noticing — it breaks the "ViewModel has zero
  UI dependency" property this whole pattern exists for.

## Next

[Lesson 08 — Resources and Styles](lesson-08-resources-and-styles.md)
covers keeping visual appearance (colors, fonts, control styling)
DRY across a whole application instead of repeated per element.
