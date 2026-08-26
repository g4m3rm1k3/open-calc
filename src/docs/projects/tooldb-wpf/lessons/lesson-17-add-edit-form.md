# Lesson 17: A Button That Doesn't Know What It Runs

**What you will build.** A third real window, `ToolEditDialog`, presents a
real, editable form — four `TextBox` elements, each two-way bound to a
new `ToolEditViewModel`'s own mutable properties, pre-filled from a real
`Tool`. Its own `Save`/`Cancel` buttons are wired through `Command`, not
`Click` — a real, different mechanism this project hasn't used before. A
new `ToolRepository.UpdateTool` method persists every edited field at
once. The transferable problem underneath the feature has two real parts.
First: Lesson 16's own binding was one-directional — data flowed from a
ViewModel to a `TextBlock`, never back; a real form needs the opposite
direction too, values a user types flowing back into the object that
holds them. Second: a `Click` handler (Lesson 13) is tied to one specific
event on one specific control class; a real action like "save this form"
is a piece of behavior a ViewModel should be able to own and describe
declaratively, the same way it already owns the data a View displays.

**A real, deliberate scope limit, stated up front:** this lesson edits an
existing tool's own `Name`, `OverallDiameter`, `OverallLength`, and
`FluteCount` — not its vendor. `Tool.Manufacturer` (Lesson 9) is a joined
string, not a real, directly editable foreign key on this record; deciding
how a user would actually pick or create a vendor from this form is a
real, separate design question this lesson doesn't resolve. `ToolEditDialog`
is also not yet reachable from `MainWindow` — nothing yet lets a user pick
*which* real tool to edit from the WebView2 table; that real wiring is
this project's own roadmap's explicit next lesson's job (Lesson 18, "Two-
Way Communication Across the Split"). This lesson builds and proves the
dialog itself works, correctly, in isolation.

**What you need to know first.** Lesson 8 — `Tool` as an immutable
`record`. Lesson 13 — `Grid.RowDefinitions`/`Grid.Row`, `Button`,
`ContentControl.Content`. Lesson 16 — `{Binding}`, `DataContext`,
`INotifyPropertyChanged`, and `AboutViewModel` as this project's first
ViewModel.

**Terms used in this lesson**

- **two-way binding** — a real `{Binding}` (Lesson 16) configured so data
  flows in both directions: the target property (here, `TextBox.Text`)
  both reads its source's current value *and* writes a user's own edits
  back to it. Per Microsoft's own official documentation (fetched this
  session), "`TwoWay` binding causes changes to either the source property
  or the target property to automatically update the other" — a real,
  necessary contrast with Lesson 16's own binding, which only ever read a
  computed, read-only property, never wrote to it.
- **`UpdateSourceTrigger`** — a real, per-binding setting controlling
  *when*, exactly, a two-way binding's own target-to-source direction
  actually fires. Per that same documentation, `TextBox.Text` specifically
  defaults to `LostFocus` — the ViewModel's own property only updates once
  a `TextBox` loses focus, not on every keystroke — "for text fields,
  updating after every keystroke can diminish performance and denies the
  user the usual opportunity to backspace and fix typing errors before
  committing to the new value."
- **default type conversion (in binding)** — a real, built-in mechanism
  letting a binding connect a string-typed target property
  (`TextBox.Text`) to a differently-typed source property (`OverallDiameter`,
  a real `double`) with no custom converter written. Per that same
  documentation, "default conversions may be available because of type
  converters that are present in the type being bound to" — real,
  ordinary .NET numeric types already carry one; typing genuinely
  non-numeric text into a bound numeric `TextBox` is a real, known gap
  this lesson doesn't resolve, deferred to whichever future lesson takes
  up real input validation.
- **`ICommand`** — a real interface describing an action a UI element can
  invoke, independent of any specific event or control class. Per
  Microsoft's own official documentation (fetched this session), it
  declares two real methods, `Execute(Object)` ("defines the method to be
  called when the command is invoked") and `CanExecute(Object)`
  ("determines whether the command can execute in its current state"),
  plus one real event, `CanExecuteChanged` ("occurs when changes take
  place that affect whether or not the command should execute"). It
  exists so a ViewModel can expose *behavior* the identical, declarative
  way it already exposes *data* — through a bindable property — rather
  than a View's own code-behind subscribing to a control-specific event
  like `Click`.
- **`Command` (the `Button.Command` property)** — a real property, on
  `Button` and every other real class deriving from `ButtonBase`
  (established Lesson 13), accepting an `ICommand`. Bound to a real
  `ICommand`, a button invokes that command's own `Execute` when clicked,
  instead of raising `Click` for code-behind to catch.

**Objects and methods used**

- **`Grid.ColumnDefinitions`/`Grid.Column`**
  - *What it is:* the direct real counterpart to `Grid.RowDefinitions`/
    `Grid.Row` (established Lesson 13), this time dividing a `Grid`
    horizontally instead of vertically.
  - *Implementation:* real, identical shape to its row-based sibling —
    `Grid.ColumnDefinitions` holds real `ColumnDefinition` elements, each
    with a `Width` (`Auto`/`*`/fixed, the identical real values
    `RowDefinition.Height` already accepts); `Grid.Column`, a real attached
    property (Lesson 13's own Terms), marks which real column a child
    belongs to.
  - *Its use:* `ToolEditDialog.xaml`'s own `<Grid>`, this lesson's own
    first unit — two real columns (a fixed-width label column, a
    flexible, star-sized input column), reused across all five real rows.
  - *Type:* the same real category as `Grid.RowDefinitions`/`Grid.Row` —
    a real collection property plus a real, `static` attached property.
  - *Responsibility:* the identical real job as `RowDefinitions`/`Row`,
    on the other real axis — deciding column widths, and which column
    each real child belongs to.
  - *Depends on:* being declared, and used, on a real `Grid` — the
    identical dependency `RowDefinitions`/`Row` already has.
  - *Connects to:* combined with `Grid.Row` on the identical elements, so
    each real `TextBlock`/`TextBox` pair lands at one specific real
    row-and-column intersection.
  - *Shape:* proof that "layout panel" (Lesson 13's own Terms) is one
    real, two-axis idea, not two separate ones — the identical real
    mechanism, applied a second time, on the axis this project hadn't
    needed yet.
- **`Binding.Mode`/`BindingMode.TwoWay`**
  - *What it is:* the real property (and real enum value) explicitly
    naming a binding's own direction — though, per this lesson's own
    Header (`UpdateSourceTrigger`, above), this lesson's own real code
    never sets it explicitly, relying entirely on `TextBox.Text`'s own
    real default.
  - *Implementation:* per Microsoft's own official documentation (fetched
    this session), most properties default to `OneWay`, "but some
    dependency properties (typically properties of user-editable
    controls such as `TextBox.Text`... default to `TwoWay`" — confirmed,
    concretely, by that same documentation's own real, captured debug
    output: `BindsTwoWayByDefault: True`, read directly off
    `TextBox.TextProperty`'s own real metadata.
  - *Its use:* implicitly, everywhere this lesson's own `Text="{Binding
    ...}"` appears — no `Mode=TwoWay` is ever written, because it would
    only restate what `TextBox.Text` already does by default.
  - *Type:* a real property on `Binding` (Lesson 16), and a real value
    from the `BindingMode` enum.
  - *Responsibility:* decide which real direction(s) a binding actually
    keeps synchronized — target-to-source, source-to-target, or both.
  - *Depends on:* nothing this lesson's own code sets directly — entirely
    inherited from `TextBox.Text`'s own real, documented default.
  - *Connects to:* every `TextBox` in this lesson's own new form, all
    relying on the identical real default.
  - *Shape:* named here for completeness, since the Header's own
    Vocabulary Extraction requires it — its real, active presence in this
    lesson's own code is entirely implicit, not a line anyone wrote.
- **`ICommand.Execute`/`ICommand.CanExecute`**
  - *What it is:* this lesson's own new subject (Terms, above) — the two
    real methods every `ICommand` implementation must provide.
  - *Implementation:* this lesson's own new class, `RelayCommand`, gives
    `Execute` a real body that invokes a stored `Action` (a real delegate
    type, first appearing in this project, matching any parameterless
    method); `CanExecute` always real, unconditionally, returns `true` —
    a real, deliberate simplification this unit's own SE Lens explains.
  - *Its use:* `SaveCommand`/`CancelCommand`, this lesson's own third
    unit, each a real `RelayCommand` wrapping one of `ToolEditViewModel`'s
    own private methods.
  - *Type:* two real interface methods, implemented concretely on
    `RelayCommand`.
  - *Responsibility:* `Execute` runs the real action a command represents;
    `CanExecute` reports whether it's currently valid to run at all —
    WPF's own command infrastructure calls `CanExecute` to decide whether
    a bound button should even appear enabled.
  - *Depends on:* `Execute` depends on a real delegate to actually call;
    `CanExecute`, in this lesson's own simplified `RelayCommand`, depends
    on nothing at all.
  - *Connects to:* both are called by WPF's own real, internal command-
    binding machinery, never directly by this project's own code.
  - *Shape:* the real, minimal contract that lets a plain C# object stand
    in for what a `Click` handler used to be.

**Everything else in the file, not this lesson's own subject but still
explained**

- **`Tool` (the immutable `record`)**
  - *What it is:* reappearing from Lesson 8 — this project's own real,
    immutable domain model.
  - *Implementation:* established Lesson 8, unchanged.
  - *Its use:* `ToolEditViewModel`'s own constructor (this lesson's own
    first unit) reads a real `Tool`'s own four editable fields once, at
    construction time, copying each into its own separate, mutable field —
    `Tool` itself is never mutated.
- **`INotifyPropertyChanged`, `PropertyChanged`**
  - *What it is:* reappearing from Lesson 16 — the real interface and
    event letting a bound object announce its own changes.
  - *Implementation:* established Lesson 16, unchanged.
  - *Its use:* `ToolEditViewModel` implements it identically to
    `AboutViewModel`, so every real edit a user makes is reflected the
    instant its own property setter runs.

---

## Concept Unit: A Form — Two-Way Binding TextBoxes to a ViewModel

### The Problem

Nothing in this project can yet show more than one bindable field at once,
laid out as a real, labeled form, nor let a user's own typed input flow
back into a real C# object — Lesson 16's own binding only ever displayed a
computed, read-only string.

> **Try this first:** Lesson 13's own `Grid.RowDefinitions`/`Grid.Row`
> already divides a `Grid` into real, independent rows. Given a form needs
> a label *and* an input side by side, on every one of several real rows —
> not stacked vertically the way this project's own rows have only ever
> been used so far — what real, parallel mechanism would you expect `Grid`
> to offer for dividing itself horizontally, given `RowDefinitions`/`Row`
> already proved the identical vertical idea?

### Project Change

- **Reference Source** — no reference counterpart consulted this session;
  per this project's own self-containment rule.
- **Files affected** — `ToolDB/ToolEditViewModel.cs`, created.
  `ToolDB/ToolEditDialog.xaml`, created. `ToolDB/ToolEditDialog.xaml.cs`,
  created.
- **Change type** — add (three new files, a complete new dialog and
  ViewModel).
- **Location** — new files, sitting alongside `AboutDialog`'s own three
  files (Lesson 13, 16) in `ToolDB/`.
- **Dependencies** — `Tool` (Lesson 8), `INotifyPropertyChanged`
  (Lesson 16).

### The New Code

```csharp
public string Name
{
    get => _name;
    set { _name = value; OnPropertyChanged(nameof(Name)); }
}
```

```xml
<Grid.ColumnDefinitions>
    <ColumnDefinition Width="Auto" />
    <ColumnDefinition Width="*" />
</Grid.ColumnDefinitions>
<TextBlock Grid.Row="0" Grid.Column="0" Text="Name" Margin="0,0,8,8" />
<TextBox Grid.Row="0" Grid.Column="1" Text="{Binding Name}" Margin="0,0,0,8" />
```

### The Updated Project

`ToolDB/ToolEditViewModel.cs`, in full (a brand-new file, nothing to mark
as changed):

```csharp
 1  using System;
 2  using System.ComponentModel;
 3  using System.Windows.Input;
 4
 5  public class ToolEditViewModel : INotifyPropertyChanged
 6  {
 7      private string _name;
 8      private double _overallDiameter;
 9      private double _overallLength;
10      private int _fluteCount;
11
12      public ToolEditViewModel(Tool tool)
13      {
14          _name = tool.Name;
15          _overallDiameter = tool.OverallDiameter;
16          _overallLength = tool.OverallLength;
17          _fluteCount = tool.FluteCount;
18
19          SaveCommand = new RelayCommand(Save);
20          CancelCommand = new RelayCommand(Cancel);
21      }
22
23      public string Name
24      {
25          get => _name;
26          set { _name = value; OnPropertyChanged(nameof(Name)); }
27      }
28
29      public double OverallDiameter
30      {
31          get => _overallDiameter;
32          set { _overallDiameter = value; OnPropertyChanged(nameof(OverallDiameter)); }
33      }
34
35      public double OverallLength
36      {
37          get => _overallLength;
38          set { _overallLength = value; OnPropertyChanged(nameof(OverallLength)); }
39      }
40
41      public int FluteCount
42      {
43          get => _fluteCount;
44          set { _fluteCount = value; OnPropertyChanged(nameof(FluteCount)); }
45      }
46
47      public ICommand SaveCommand { get; }
48      public ICommand CancelCommand { get; }
49
50      public bool? DialogResult { get; private set; }
51
52      public event EventHandler? RequestClose;
53      public event PropertyChangedEventHandler? PropertyChanged;
54
55      private void Save()
56      {
57          DialogResult = true;
58          RequestClose?.Invoke(this, EventArgs.Empty);
59      }
60
61      private void Cancel()
62      {
63          DialogResult = false;
64          RequestClose?.Invoke(this, EventArgs.Empty);
65      }
66
67      private void OnPropertyChanged(string propertyName)
68      {
69          PropertyChanged?.Invoke(this, new PropertyChangedEventArgs(propertyName));
70      }
71  }
```

`ToolDB/ToolEditDialog.xaml`, in full (a brand-new file):

```xml
 1  <Window x:Class="ToolDB.ToolEditDialog"
 2          xmlns="http://schemas.microsoft.com/winfx/2006/xaml/presentation"
 3          xmlns:x="http://schemas.microsoft.com/winfx/2006/xaml"
 4          Title="Edit Tool" Height="230" Width="320" WindowStartupLocation="CenterOwner">
 5      <Grid Margin="16">
 6          <Grid.RowDefinitions>
 7              <RowDefinition Height="Auto" />
 8              <RowDefinition Height="Auto" />
 9              <RowDefinition Height="Auto" />
10              <RowDefinition Height="Auto" />
11              <RowDefinition Height="Auto" />
12          </Grid.RowDefinitions>
13          <Grid.ColumnDefinitions>
14              <ColumnDefinition Width="Auto" />
15              <ColumnDefinition Width="*" />
16          </Grid.ColumnDefinitions>
17          <TextBlock Grid.Row="0" Grid.Column="0" Text="Name" Margin="0,0,8,8" />
18          <TextBox Grid.Row="0" Grid.Column="1" Text="{Binding Name}" Margin="0,0,0,8" />
19          <TextBlock Grid.Row="1" Grid.Column="0" Text="Overall Diameter" Margin="0,0,8,8" />
20          <TextBox Grid.Row="1" Grid.Column="1" Text="{Binding OverallDiameter}" Margin="0,0,0,8" />
21          <TextBlock Grid.Row="2" Grid.Column="0" Text="Overall Length" Margin="0,0,8,8" />
22          <TextBox Grid.Row="2" Grid.Column="1" Text="{Binding OverallLength}" Margin="0,0,0,8" />
23          <TextBlock Grid.Row="3" Grid.Column="0" Text="Flute Count" Margin="0,0,8,8" />
24          <TextBox Grid.Row="3" Grid.Column="1" Text="{Binding FluteCount}" Margin="0,0,0,16" />
25          <Button Grid.Row="4" Grid.Column="0" Content="Cancel" Command="{Binding CancelCommand}" HorizontalAlignment="Right" Margin="0,8,8,0" />
26          <Button Grid.Row="4" Grid.Column="1" Content="Save" Command="{Binding SaveCommand}" HorizontalAlignment="Left" Margin="0,8,0,0" />
27     </Grid>
28  </Window>
```

Every one of this dialog's own four editable rows repeats the identical
real shape: a plain, unnamed `TextBlock` label in column `0`, and a
`TextBox` in column `1` whose own `Text` is bound directly to one of
`ToolEditViewModel`'s own four real properties — no code-behind reads or
sets any of them; the entire form's own real behavior lives in the
ViewModel this unit already shows in full, including its own `SaveCommand`/
`CancelCommand` (this lesson's own second and third units' real subject).

### Proving It in Isolation

No throwaway example exists for this unit — `Grid.ColumnDefinitions`/
`Grid.Column`'s own real mechanics are the identical, already-proven
mechanics `Grid.RowDefinitions`/`Grid.Row` established in Lesson 13, on a
second axis; a throwaway version would repeat that lesson's own isolated
lab with nothing new to show. This unit's own real, new claim —
`TextBox.Text`'s own default two-way binding — is proven directly by
quoting Microsoft's own official, real, captured debug output (Header,
above: `BindsTwoWayByDefault: True`), not by re-running it, since that
output is already real, genuine, and directly on point.

### Discard the Throwaway Example

Not applicable, for the reason stated above.

### Mechanical Walkthrough

- `<Grid.ColumnDefinitions>` / `<ColumnDefinition Width="Auto" />` /
  `<ColumnDefinition Width="*" />` — `Grid.ColumnDefinitions`/
  `ColumnDefinition` (Header, above) — the identical real property-element
  syntax and `Width` values `Grid.RowDefinitions`/`RowDefinition` already
  established (Lesson 13), applied to columns: a fixed-to-content label
  column, and a star-sized column absorbing whatever width is left for
  real input text.
- `Grid.Column="0"` / `Grid.Column="1"` — `Grid.Column` (Header, above),
  the identical real attached-property mechanism as `Grid.Row` (Lesson
  13), naming which real column each element belongs to.
- `Text="{Binding Name}"` (and its three siblings) — `{Binding}` (Lesson
  16), reappearing, this time on `TextBox.Text` instead of `TextBlock.Text`
  — real, load-bearing difference: per this lesson's own Header,
  `TextBox.Text` is one of the specific real properties that "default to
  `TwoWay`" binding, unlike `TextBlock.Text` (Lesson 5, 13, 16), which
  only ever supports `OneWay` — the same `{Binding}` syntax, a genuinely
  different real direction, decided entirely by which target property it's
  attached to.
- `Text="{Binding OverallDiameter}"` — the identical real binding syntax,
  bound this time to a real `double` property rather than a `string` one —
  **default type conversion** (Terms, above) is what lets this compile and
  work at all without a custom converter, per this lesson's own Header.

### CS Lens

Two-way binding — a single declared connection keeping two independent
real objects' own values synchronized in both directions — is a specific
instance of **bidirectional data flow**, distinct from the one-directional
flow this project's own Lesson 16 already used. Also recognized in: a
thermostat's own display and its own dial (turning the dial changes the
target temperature; the system reaching that temperature updates the
display — two real directions, one real relationship), a spreadsheet cell
referenced by a formula that itself feeds back into a circular reference
(a real failure mode precisely because two-way flow was created
unintentionally), and this project's own real database `UPDATE` (Lesson
14) considered alongside `SELECT` (Lesson 4) — reading and writing the
identical real row through two genuinely different real statements, the
same conceptual split `{Binding}`'s own `Mode` makes explicit in one
declaration instead of two.

### SE Lens

Why does this lesson never write `Mode=TwoWay` explicitly on any of these
four bindings, relying entirely on `TextBox.Text`'s own real default,
rather than stating it directly for clarity? The alternative not chosen —
explicit `Mode=TwoWay` everywhere — was rejected because it would be real,
genuine noise: per this lesson's own cited documentation, `TextBox.Text`
already defaults to exactly that, so writing it again states nothing a
future reader couldn't already predict from the target property alone.
The honest cost: a reader unfamiliar with this one, specific real default
(documented, but easy to not know) might reasonably assume every binding
in this file is one-way unless told otherwise — this project accepts that
real, small ambiguity in exchange for four lines that would otherwise
restate a documented default.

### Run It

A real `dotnet build` was run this session against the actual new files:
build succeeded, 0 Warnings, 0 Errors (this unit's own files alone —
the real warning this lesson's own second unit surfaces comes from a
different, new file). This project's own standing constraint (no live WPF
window observed this session) applies to watching a real keystroke
actually flow back into `ToolEditViewModel`'s own properties — what's
verified for real instead is `ToolEditViewModel`'s own constructor
correctly copying a real `Tool`'s fields, proven by a real, passing test
in this lesson's own third unit.

### Connecting Back

A real, working form now exists, reading from and ready to write back to a
real ViewModel — but its own two buttons don't yet do anything. The next
unit gives them real behavior, through a mechanism this project hasn't
used before.

---

## Concept Unit: `ICommand` — A Button Wired Without a Click Handler

### The Problem

Every button this project has ever wired — `AboutButton`, `CloseButton`
(Lesson 13), even the `Close` button in `AboutDialog` itself — has used
`Click`, a real event handled by name in code-behind. A ViewModel
(Lesson 16) has no way to be that code-behind; `Save`/`Cancel`'s own real
behavior needs to live where the rest of this dialog's own real behavior
already lives — inside `ToolEditViewModel` itself.

> **Try this first:** the Header's own `ICommand` entry names two real
> methods, `Execute`/`CanExecute`, and a real event, `CanExecuteChanged` —
> a shape that has nothing to do with any specific control class, unlike
> `Click`, which only exists on `ButtonBase`-derived types (Lesson 13).
> Given a plain C# class can implement any interface it wants, what would
> you predict happens if `Button`'s own real `Command` property (Header,
> above) is bound, through `{Binding}`, to a real property on a ViewModel
> whose own type is `ICommand` — does the button still need a `Click`
> handler in code-behind at all?

### Project Change

- **Reference Source** — no reference counterpart consulted this session;
  per this project's own self-containment rule.
- **Files affected** — `ToolDB/RelayCommand.cs`, created.
- **Change type** — add (one new file, one new class).
- **Location** — new file, sitting alongside `ToolEditViewModel.cs` in
  `ToolDB/`.
- **Dependencies** — `ICommand` (Header, above).

### The New Code

```csharp
public class RelayCommand : ICommand
{
    private readonly Action _execute;

    public RelayCommand(Action execute)
    {
        _execute = execute;
    }

    public event EventHandler? CanExecuteChanged;

    public bool CanExecute(object? parameter) => true;

    public void Execute(object? parameter) => _execute();
}
```

### The Updated Project

`ToolDB/RelayCommand.cs`, in full (a brand-new file):

```csharp
 1  using System;
 2  using System.Windows.Input;
 3
 4  public class RelayCommand : ICommand
 5  {
 6      private readonly Action _execute;
 7
 8      public RelayCommand(Action execute)
 9      {
10          _execute = execute;
11      }
12
13      public event EventHandler? CanExecuteChanged;
14
15      public bool CanExecute(object? parameter) => true;
16
17      public void Execute(object? parameter) => _execute();
18  }
```

`ToolEditViewModel`'s own constructor (this lesson's own first unit,
already shown) uses this exact class twice — `SaveCommand = new
RelayCommand(Save);` and `CancelCommand = new RelayCommand(Cancel);` —
each wrapping one of `ToolEditViewModel`'s own private methods
(`Save`/`Cancel`, this lesson's own third unit) as a real `ICommand` a
XAML `Button` can bind to directly.

### Proving It in Isolation

A minimal, unrelated throwaway class, isolating `RelayCommand` before it
meets this project's own real Save/Cancel behavior:

```csharp
var executed = false;
var command = new RelayCommand(() => executed = true);

Console.WriteLine($"CanExecute: {command.CanExecute(null)}");
command.Execute(null);
Console.WriteLine($"Executed: {executed}");
```

Run for real this session (this exact throwaway example needs
`System.Windows.Input.ICommand`, real and only reachable from a WPF-
enabled project — `LabScratch` was temporarily given `<UseWPF>true</UseWPF>`
and `net9.0-windows` to run it for real, then reverted immediately
afterward, since neither is needed for any of `LabScratch`'s own other
real scripts):

```
CanExecute: True
Executed: True
```

This real output proves `RelayCommand.Execute(null)` genuinely invokes the
real `Action` it was constructed with — `executed`, a plain `bool`, is
only ever set to `true` inside that lambda, and it reads back `true` only
because `Execute` really ran it.

### Discard the Throwaway Example

The example above is discarded now — it never appears in this project
again. What's proven is that `RelayCommand` really does forward `Execute`
to its own stored delegate — not this specific boolean flag.

### Mechanical Walkthrough

- `public class RelayCommand : ICommand` — a real class, first appearing
  in this project, implementing `ICommand` (Header, above) — the first
  interface this project's own code has implemented directly (Lesson 16's
  own `INotifyPropertyChanged` was the first interface implemented at
  all).
- `private readonly Action _execute;` — a real, `readonly` field holding a
  real `Action` — a built-in .NET delegate type representing any method
  taking no parameters and returning nothing, first appearing in this
  project by name (though this project's own event handlers, established
  Lesson 5, already used other, differently-shaped delegate types).
- `public RelayCommand(Action execute) { _execute = execute; }` — a real
  constructor (established Lesson 13) taking one real parameter, storing
  it directly.
- `public event EventHandler? CanExecuteChanged;` — the real event
  `ICommand` (Header, above) requires — declared here to satisfy the
  interface, but never actually raised anywhere in this class's own real
  code, a genuine, real gap this unit's own SE Lens explains.
- `public bool CanExecute(object? parameter) => true;` — `ICommand
  .CanExecute` (Header, above), implemented here as an expression-bodied
  method (established Lesson 16) that ignores its own real `parameter` and
  always returns `true`.
- `public void Execute(object? parameter) => _execute();` — `ICommand
  .Execute` (Header, above), implemented by calling the real, stored
  `_execute` delegate — this class's own entire real purpose.

### CS Lens

Wrapping an arbitrary real delegate (`_execute`) behind a fixed, real
interface (`ICommand`) that a completely separate system (WPF's own
command-binding infrastructure) already knows how to call is a specific
instance of the **Adapter pattern** — making one real shape usable where a
different, specific real shape is expected, without changing either side.
Also recognized in: this project's own `SqliteDataReader` being adapted
into a real `Tool` by `Tool.FromReader` (Lesson 4) — a completely
different real shape (database row columns) made to fit what `Tool`'s own
constructor needs — and a physical travel power adapter letting one
country's own real plug fit a wall socket shaped for a different country's
own standard, changing neither the plug nor the appliance behind it.

### SE Lens

Why does `CanExecute` always return `true`, and why is `CanExecuteChanged`
declared but never raised — a real, honest gap this exact build already
surfaced as a genuine compiler warning (`CS0067: The event
'RelayCommand.CanExecuteChanged' is never used`)? The alternative not
chosen — a real, dynamic `CanExecute` that could return `false` (disabling
`Save`, say, until required fields are filled in) — was rejected for this
lesson's own real, stated scope: nothing in this project yet defines what
"invalid" input for this form even means, since real validation isn't a
concept this lesson introduces. A fuller `RelayCommand` would accept a
real `Func<bool>` predicate and raise `CanExecuteChanged` whenever
conditions affecting it change — a real, legitimate future extension,
deliberately deferred rather than built speculatively now. The honest
cost, already visible in this session's own real build output: a genuine
compiler warning exists in this project's own code right now, a small,
real, acknowledged debt rather than a silently-ignored one.

### Run It

A real `dotnet build` was run this session against the actual new file:
build succeeded, but with one real, genuine warning —
`CS0067: The event 'RelayCommand.CanExecuteChanged' is never used` —
already predicted directly above, and left in the codebase deliberately
rather than suppressed, since it accurately reflects this lesson's own
real, stated scope limitation. The throwaway example above was run for
real this session with `dotnet run`; source and output are saved in this
project's own `verification/lesson-17/` folder
(`lab2-relaycommand-isolated.cs`) — including this unit's own real,
literal first (wrong) output, corrected in place rather than silently
replaced, per this schema's own standard for an honest record of what was
actually run.

### Connecting Back

A real button can now invoke real ViewModel behavior with no `Click`
handler anywhere in code-behind — proven, concretely, by a real,
successfully-executed delegate. The final unit gives `Save`/`Cancel`
their own real, meaningful behavior, and closes the loop back to
`tools.db` itself.

---

## Concept Unit: Save and Cancel — A Real Result, Not a Direct Close Call

### The Problem

`ToolEditViewModel`'s own `Save`/`Cancel` methods (this lesson's own first
unit) already set a real `DialogResult` and raise `RequestClose` — but
nothing yet actually closes `ToolEditDialog` itself, or persists a real
edit to `tools.db` at all.

> **Try this first:** Lesson 13's own real, fetched documentation for
> `Window.DialogResult` states it can only be set while a window is
> already showing via `ShowDialog()` — and its own real, official example
> sets `this.DialogResult = true;` alone, with no separate `Close()` call
> anywhere in that same handler. Given `ToolEditViewModel` itself is a
> plain C# object with no reference to any real `Window` at all, what real
> mechanism would let `ToolEditDialog` — which *does* know about
> `DialogResult` — react the instant the ViewModel decides Save or Cancel
> happened, without the ViewModel needing to reach into the View directly?

### Project Change

- **Reference Source** — no reference counterpart consulted this session;
  per this project's own self-containment rule.
- **Files affected** — `ToolDB/ToolEditDialog.xaml.cs`, created.
  `ToolDB/ToolRepository.cs`, modified.
- **Change type** — add (constructor logic wiring `RequestClose`); add
  (one new repository method, `UpdateTool`).
- **Location** — `ToolEditDialog.xaml.cs`'s own constructor; `ToolRepository`,
  alongside `UpdateFluteCount`/`Delete` (Lesson 14).
- **Dependencies** — `ToolEditViewModel`'s own `RequestClose` event and
  `DialogResult` property, this lesson's own first unit.

### The New Code

```csharp
public ToolEditDialog(Tool tool)
{
    InitializeComponent();

    var viewModel = new ToolEditViewModel(tool);
    viewModel.RequestClose += (sender, e) => DialogResult = viewModel.DialogResult;
    DataContext = viewModel;
}
```

```csharp
public static void UpdateTool(SqliteConnection connection, SqliteTransaction transaction, int id, string name, double overallDiameter, double overallLength, int fluteCount)
{
    using var command = new SqliteCommand(
        "UPDATE tools SET name = @name, overall_diameter = @overallDiameter, overall_length = @overallLength, flute_count = @fluteCount WHERE id = @id",
        connection,
        transaction);
    command.Parameters.AddWithValue("@name", name);
    command.Parameters.AddWithValue("@overallDiameter", overallDiameter);
    command.Parameters.AddWithValue("@overallLength", overallLength);
    command.Parameters.AddWithValue("@fluteCount", fluteCount);
    command.Parameters.AddWithValue("@id", id);
    command.ExecuteNonQuery();
}
```

### The Updated Project

`ToolDB/ToolEditDialog.xaml.cs`, in full (a brand-new file):

```csharp
1  using System.Windows;
2
3  namespace ToolDB;
4
5  public partial class ToolEditDialog : Window
6  {
7      public ToolEditDialog(Tool tool)
8      {
9          InitializeComponent();
10
11         var viewModel = new ToolEditViewModel(tool);
12         viewModel.RequestClose += (sender, e) => DialogResult = viewModel.DialogResult;
13         DataContext = viewModel;
14     }
15 }
```

`ToolDB/ToolRepository.cs`, in full, new lines marked:

```csharp
 1  using Microsoft.Data.Sqlite;
 2
 3  public static class ToolRepository
 4  {
 5      public static void UpdateFluteCount(SqliteConnection connection, SqliteTransaction transaction, int id, int newFluteCount)
 6      {
 7          using var command = new SqliteCommand(
 8              "UPDATE tools SET flute_count = @fluteCount WHERE id = @id",
 9              connection,
10              transaction);
11          command.Parameters.AddWithValue("@fluteCount", newFluteCount);
12          command.Parameters.AddWithValue("@id", id);
13          command.ExecuteNonQuery();
14      }
15
16      public static void UpdateTool(SqliteConnection connection, SqliteTransaction transaction, int id, string name, double overallDiameter, double overallLength, int fluteCount)  // ← new
17      {                                                                                                                                                                              // ← new
18          using var command = new SqliteCommand(                                                                                                                                    // ← new
19              "UPDATE tools SET name = @name, overall_diameter = @overallDiameter, overall_length = @overallLength, flute_count = @fluteCount WHERE id = @id",                       // ← new
20              connection,                                                                                                                                                            // ← new
21              transaction);                                                                                                                                                          // ← new
22          command.Parameters.AddWithValue("@name", name);                                                                                                                            // ← new
23          command.Parameters.AddWithValue("@overallDiameter", overallDiameter);                                                                                                      // ← new
24          command.Parameters.AddWithValue("@overallLength", overallLength);                                                                                                          // ← new
25          command.Parameters.AddWithValue("@fluteCount", fluteCount);                                                                                                                // ← new
26          command.Parameters.AddWithValue("@id", id);                                                                                                                                // ← new
27          command.ExecuteNonQuery();                                                                                                                                                 // ← new
28      }                                                                                                                                                                              // ← new
29
30      public static void Delete(SqliteConnection connection, SqliteTransaction transaction, int id)
31      {
32          using var command = new SqliteCommand(
33              "DELETE FROM tools WHERE id = @id",
34              connection,
35              transaction);
36          command.Parameters.AddWithValue("@id", id);
37          command.ExecuteNonQuery();
38      }
39  }
```

`ToolRepository` now offers a real, complete field-by-field `UPDATE`
alongside its own narrower `UpdateFluteCount` (Lesson 14) — this lesson's
own real form needs all four editable fields updated together, in one
real statement, rather than one call per field.

### Proving It in Isolation

No throwaway example exists for `ToolEditDialog`'s own constructor logic —
it's already the smallest real demonstration of the pattern; a throwaway
version would need an unrelated fake ViewModel with the identical real
shape, proving nothing further. `UpdateTool`'s own real behavior is proven
directly, permanently, in this project's own real test suite, following
the identical real pattern `UpdateFluteCount`/`Delete` already established
(Lesson 14) — reused here rather than re-isolated, since the underlying
mechanism (a parameterized `UPDATE`, inside a caller-supplied transaction)
was already isolated and proven once, in full, in that earlier lesson.

### Discard the Throwaway Example

Not applicable, for the reasons stated above.

### Mechanical Walkthrough

- `var viewModel = new ToolEditViewModel(tool);` — real object
  construction (Lesson 4), passing this constructor's own real `tool`
  parameter straight through.
- `viewModel.RequestClose += (sender, e) => DialogResult = viewModel
  .DialogResult;` — a real event subscription (established Lesson 5/13),
  using a real lambda (Lesson 7) — the *View* (this dialog) reacts to the
  *ViewModel* announcing it's done, rather than the ViewModel reaching
  into the View directly; `DialogResult` here refers to `Window
  .DialogResult` (established Lesson 13's own citation of it), assigned
  from `viewModel.DialogResult` (this lesson's own first unit's own
  property) — two same-named, but genuinely different real members, on
  two different real classes.
- `DataContext = viewModel;` — `FrameworkElement.DataContext` (Lesson 16),
  reappearing — set last, after the real event subscription above, so the
  subscription is already active before any binding could possibly react
  to anything.
- `UpdateTool(...)` itself — the identical real shape `UpdateFluteCount`
  already established (Lesson 14): an already-open `connection` and
  already-begun `transaction`, both supplied by the caller, never managed
  internally — the identical real reasoning Lesson 14's own SE Lens
  already gave still applies here.

### CS Lens

The View reacting to a real event the ViewModel raises — rather than the
ViewModel calling a method on the View directly — is a specific instance
of **inversion of control**: the dependency points from View to ViewModel,
never the other way around, so the identical `ToolEditViewModel` could, in
principle, be reused by a completely different real View that reacts to
`RequestClose` differently. Also recognized in: this project's own real
`INotifyPropertyChanged` (Lesson 16) — WPF's own binding engine reacts to
`PropertyChanged`; `AboutViewModel`/`ToolEditViewModel` never reach into
WPF to push updates themselves — and a smoke detector sounding an alarm
without knowing or caring whether a person, a sprinkler system, or an
automated fire department dispatch is what actually responds to it.

### SE Lens

Why does `ToolEditViewModel` expose a `RequestClose` event and a
`DialogResult` property, rather than simply calling `Window.Close()` and
setting `Window.DialogResult` directly on some `Window` reference handed
to it at construction time — a real, simpler-looking alternative? The
alternative not chosen — handing the ViewModel a real `Window` reference
— was rejected because it would give `ToolEditViewModel` a real,
direct dependency on WPF's own `Window` class, meaning this exact
ViewModel could never be reused, or even compiled, anywhere WPF itself
isn't referenced — a real, meaningful loss for a class whose own actual
job (holding and validating four real tool fields) has nothing to do with
windows at all. The honest cost of the event-based approach instead: an
extra, real layer of indirection — anyone reading `Save()`'s own real body
sees `RequestClose?.Invoke(...)`, not `Close()` directly, and has to follow
the subscription in `ToolEditDialog`'s own constructor to see what
actually happens next.

### Run It

A real `dotnet build` was run this session against the actual, modified
and new files: build succeeded, 0 Warnings, 0 Errors for these specific
files (the one real warning this lesson produces belongs to `RelayCommand
.cs`, this lesson's own second unit). A real `dotnet test` confirmed five
new, real, passing tests: `ToolEditViewModelTests` (construction correctly
copies a real `Tool`'s own fields; `SaveCommand`/`CancelCommand` each set
the correct real `DialogResult` and raise `RequestClose`; editing a
ViewModel's own fields never mutates the original, real, immutable `Tool`)
and `ToolRepositoryTests.UpdateTool_CommitsAllFourFields` (a real,
permanent proof that all four edited fields persist together) — fourteen
tests total across this project, zero failures. This project's own
standing constraint (no live WPF window observed this session) still
applies to watching this real dialog actually open, be edited, and close
in a running window.

### Connecting Back

`ToolEditDialog` is now a real, complete, independently-correct dialog —
proven by real, passing tests to copy a tool's own real data in, react
correctly to Save or Cancel, and, through `ToolRepository.UpdateTool`,
persist a real edit — with nothing left unresolved except the one thing
this lesson deliberately deferred: letting a user actually open it,
pointed at a specific, real tool, from `MainWindow` itself.

---

## Connect the Pieces

One concrete trace, start to finish, through everything this lesson built:

1. `ToolEditViewModel` was built to copy a real `Tool`'s own four editable
   fields into its own separate, mutable, notifying properties —
   `Grid.ColumnDefinitions`/`Grid.Column`, the direct horizontal
   counterpart to Lesson 13's own vertical `RowDefinitions`/`Row`, laid
   out a real label-and-input form; each `TextBox.Text` bound two-way by
   real, documented default, no `Mode=TwoWay` ever written (Unit 1).
2. `RelayCommand`, this project's own first hand-implemented interface,
   let `Save`/`Cancel` become real, bindable `ICommand`s instead of
   `Click` handlers — proven, for real, to correctly forward `Execute` to
   its own stored delegate, and left with one honest, acknowledged
   compiler warning naming exactly what this lesson's own simplified
   version doesn't yet do (Unit 2).
3. `ToolEditDialog`'s own constructor subscribed to `RequestClose`,
   translating the ViewModel's own real decision into `Window
   .DialogResult`, without the ViewModel ever referencing `Window` at
   all; a new `ToolRepository.UpdateTool` gives this project its first
   real way to persist every edited field together, proven by a real,
   permanent, passing test (Unit 3).

**Next lesson:** 18 — Two-Way Communication Across the Split.
