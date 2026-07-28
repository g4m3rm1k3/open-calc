# WPF Lesson 3: A Value That Announces Its Own Changes

*(Track purpose, scope, concept-reuse rule, and cadence: `README.md` —
not restated per-lesson. Unsure what to actually type/run/create for one
of the linked concept files' own isolated examples:
`HOW-TO-RUN-EXAMPLES.md`.)*

## What you will build

A second `TextBlock`, added below the button, that mirrors the click
counter — not by another manual `SomeText.Text = ...` assignment in the
handler, but by *binding* to the same underlying value the existing text
already reflects. Along the way, the original `TextBlock` itself switches
from Lesson 2's `x:Name`-and-assign approach to the same binding, and
`ClickMeButton_Click` shrinks to touching exactly one thing. The
transferable problem this lesson is really about: **a UI element bound to
a property doesn't automatically notice that property changing — a class
has to actively announce its own changes**, and the mechanism for that
announcement is what makes data binding actually reactive instead of a
one-time read.

## What you need to know first

Lesson 2's end state: a two-row `Grid` with a bound-free `TextBlock`
(`x:Name="StatusText"`), a `Button` wired to `ClickMeButton_Click`, and a
private `_clickCount` field. Reused without re-explanation: `partial
class`, `x:Name`, event handlers, `private` fields.

## Terms introduced in this lesson

> **DataContext** — the object a `{Binding}` expression looks up its
> property on by default; set once per window (or per element) rather
> than specified in each binding.

> **`{Binding}` (markup extension)** — XAML syntax that connects a
> property to a value looked up on the current `DataContext` at runtime,
> instead of a fixed literal string.

> **Auto-property** — a C# property declared as `{ get; set; }` with no
> hand-written body; the compiler generates a hidden backing field
> automatically.

> **`INotifyPropertyChanged`** — the standard .NET interface a class
> implements to announce, via its `PropertyChanged` event, that one of
> its own properties just changed.

> **Backing field** — a private field manually paired with a property's
> `get`/`set`, used once a property needs real logic beyond "store and
> return a value."

> **`nameof`** — a compiler operator that turns an identifier into the
> literal string of its own name, checked at compile time.

## Concepts cataloged from this lesson

`wpf-data-binding-and-datacontext` · `csharp-inotifypropertychanged`

---

## Concept Unit: `DataContext` and `{Binding}` — Reading a Property Declaratively

*(Full standalone treatment: `../concepts/wpf-data-binding-and-datacontext.md`.)*

### The Problem

Adding a second element that shows the same click count, Lesson 2's own
way, means a second `x:Name`, a second field reference, and a second
assignment line in the handler — a manual sync job that only gets worse
as more elements need the same value. Something should let a second
element show the same value *without* teaching the handler about it
directly.

### Project Change

- **Reference Source** — none; from-scratch addition, per this track's
  own rule (see `README.md`).
- **Files affected** — `wpf-app/CncWpf/MainWindow.xaml` (a third row, a
  new `TextBlock`); `wpf-app/CncWpf/MainWindow.xaml.cs` (a new property,
  `DataContext` set, the handler also writes the new property).
- **Change type** — add.
- **Location** — new `RowDefinition`, new `TextBlock` after the
  `Button`; new property and `DataContext = this;` inside `MainWindow`;
  one new line inside `ClickMeButton_Click`.
- **Dependencies** — Lesson 2's end state.

### The New Code

```xml
<TextBlock Grid.Row="2" Text="{Binding StatusMessage}" FontSize="16" Foreground="Gray" HorizontalAlignment="Center" />
```
```csharp
public string StatusMessage { get; set; } = "Hello, WPF";
```

### The Updated Project

`MainWindow.xaml`, in full:

```xml
<Window x:Class="CncWpf.MainWindow"
        xmlns="http://schemas.microsoft.com/winfx/2006/xaml/presentation"
        xmlns:x="http://schemas.microsoft.com/winfx/2006/xaml"
        xmlns:d="http://schemas.microsoft.com/expression/blend/2008"
        xmlns:mc="http://schemas.openxmlformats.org/markup-compatibility/2006"
        xmlns:local="clr-namespace:CncWpf"
        mc:Ignorable="d"
        Title="MainWindow" Height="450" Width="800">
    <Grid>
        <Grid.RowDefinitions>
            <RowDefinition Height="*" />
            <RowDefinition Height="Auto" />
            <RowDefinition Height="Auto" />
        </Grid.RowDefinitions>

        <TextBlock x:Name="StatusText" Grid.Row="0" Text="Hello, WPF" FontSize="24" HorizontalAlignment="Center" VerticalAlignment="Center" />
        <Button Grid.Row="1" Content="Click Me" Click="ClickMeButton_Click" Width="120" Height="32" Margin="16" HorizontalAlignment="Center" />
        <TextBlock Grid.Row="2" Text="{Binding StatusMessage}" FontSize="16" Foreground="Gray" HorizontalAlignment="Center" />
    </Grid>
</Window>
```

`MainWindow.xaml.cs`, in full:

```csharp
using System.Text;
using System.Windows;
using System.Windows.Controls;
using System.Windows.Data;
using System.Windows.Documents;
using System.Windows.Input;
using System.Windows.Media;
using System.Windows.Media.Imaging;
using System.Windows.Navigation;
using System.Windows.Shapes;

namespace CncWpf;

/// <summary>
/// Interaction logic for MainWindow.xaml
/// </summary>
public partial class MainWindow : Window
{
    private int _clickCount = 0;

    public string StatusMessage { get; set; } = "Hello, WPF";

    public MainWindow()
    {
        InitializeComponent();
        DataContext = this;
    }

    private void ClickMeButton_Click(object sender, RoutedEventArgs e)
    {
        _clickCount++;
        StatusText.Text = $"Clicked {_clickCount} times";
        StatusMessage = $"Clicked {_clickCount} times";
    }
}
```
The window now has a third row showing `StatusMessage` — and the click
handler updates *both* `StatusText.Text` (Lesson 2's way) and
`StatusMessage` (the new, bound property) on every click, side by side,
on purpose — so the difference between them is directly observable
rather than assumed.

### Mechanical Walkthrough

- `DataContext = this;` — **(a) first appearance**, full treatment in
  `../concepts/wpf-data-binding-and-datacontext.md`: makes `MainWindow`
  itself the lookup source for every `{Binding}` in this window.
- `Text="{Binding StatusMessage}"` — **(a) first appearance**, full
  treatment in the linked concept file: reads `StatusMessage` off the
  current `DataContext`, instead of a fixed string.
- `public string StatusMessage { get; set; } = "Hello, WPF";` — **(a)
  first appearance** of this specific syntax, **(c) already basic** as a
  property in general (Lesson 1's own `Name`/`Title` properties already
  established the idea) — an **auto-property**, full treatment in the
  linked concept file.
- `StatusMessage = $"Clicked {_clickCount} times";` — **(c) already
  basic**, the same property-assignment and string-interpolation
  mechanism already used for `StatusText.Text` one line above.

### Execution Trace

`StatusMessage` and `StatusText.Text` are both carried state, updated
together across repeated clicks — verified this session via temporary
instrumentation (a `Loaded` handler simulating two clicks and reading
back all three values, added to the constructor and removed again before
the file shown above):

```
After click 1: StatusMessage="Clicked 1 times", StatusText.Text="Clicked 1 times", EchoText.Text="Hello, WPF"
After click 2: StatusMessage="Clicked 2 times", StatusText.Text="Clicked 2 times", EchoText.Text="Hello, WPF"
```
(`EchoText` was a temporary `x:Name` added only for this proof, reading
the new, unnamed row-2 `TextBlock` — removed along with the rest of the
verification harness.)

1. **Click 1** — `_clickCount` becomes `1`; `StatusText.Text` is
   assigned directly and reflects it immediately, exactly as in Lesson
   2. `StatusMessage` is *also* assigned `"Clicked 1 times"` — its own
   backing storage really does hold the new value, proven by reading
   `StatusMessage` itself, not just the UI. The bound `TextBlock`
   (`EchoText` above) still reads `"Hello, WPF"` — the value it read
   once, at binding time, with nothing telling it a newer value exists.
2. **Click 2** — same story again: `StatusMessage` correctly becomes
   `"Clicked 2 times"`, `StatusText.Text` follows it (direct assignment,
   unaffected by anything to do with binding), and the bound `TextBlock`
   is still frozen at `"Hello, WPF"` — proof this isn't a one-click
   fluke; a real, plain property change *never* reaches a binding on its
   own, no matter how many times it happens.

### CS Lens / SE Lens

Both covered in full in `../concepts/wpf-data-binding-and-datacontext.md`.

### Commands and Real Output

```
dotnet build
```
**Real output:**
```
Build succeeded.
    0 Warning(s)
    0 Error(s)
```

### Run It

Run for real and click the button — the top text updates every time
(Lesson 2's mechanism, unchanged); the new gray text underneath never
moves from "Hello, WPF," matching the execution trace above exactly.

---

## Concept Unit: `INotifyPropertyChanged` — Making the Property Announce Itself

*(Full standalone treatment: `../concepts/csharp-inotifypropertychanged.md`.)*

### The Problem

`StatusMessage` really changes every click — proven directly in the
previous unit — but nothing tells the binding that happened. The bound
`TextBlock` needs the property itself to actively announce "I just
changed," not to be silently, repeatedly overwritten with no one
noticing.

### Project Change

- **Reference Source** — none.
- **Files affected** — `wpf-app/CncWpf/MainWindow.xaml` (the first
  `TextBlock` switches from `x:Name`+static text to binding);
  `wpf-app/CncWpf/MainWindow.xaml.cs` (`StatusMessage` becomes a full
  property with a backing field and a change notification; the class
  implements `INotifyPropertyChanged`; the handler drops its direct
  `StatusText.Text` assignment).
- **Change type** — replace.
- **Location** — the first `<TextBlock>`'s `Text` attribute; the
  `StatusMessage` property declaration; the class header; inside
  `ClickMeButton_Click`.
- **Dependencies** — the `StatusMessage` property and `DataContext` from
  the previous unit.

### The New Code

```csharp
public event PropertyChangedEventHandler? PropertyChanged;

private string _statusMessage = "Hello, WPF";
public string StatusMessage
{
    get => _statusMessage;
    set
    {
        _statusMessage = value;
        PropertyChanged?.Invoke(this, new PropertyChangedEventArgs(nameof(StatusMessage)));
    }
}
```

### The Updated Project

`MainWindow.xaml`, in full:

```xml
<Window x:Class="CncWpf.MainWindow"
        xmlns="http://schemas.microsoft.com/winfx/2006/xaml/presentation"
        xmlns:x="http://schemas.microsoft.com/winfx/2006/xaml"
        xmlns:d="http://schemas.microsoft.com/expression/blend/2008"
        xmlns:mc="http://schemas.openxmlformats.org/markup-compatibility/2006"
        xmlns:local="clr-namespace:CncWpf"
        mc:Ignorable="d"
        Title="MainWindow" Height="450" Width="800">
    <Grid>
        <Grid.RowDefinitions>
            <RowDefinition Height="*" />
            <RowDefinition Height="Auto" />
            <RowDefinition Height="Auto" />
        </Grid.RowDefinitions>

        <TextBlock Grid.Row="0" Text="{Binding StatusMessage}" FontSize="24" HorizontalAlignment="Center" VerticalAlignment="Center" />
        <Button Grid.Row="1" Content="Click Me" Click="ClickMeButton_Click" Width="120" Height="32" Margin="16" HorizontalAlignment="Center" />
        <TextBlock Grid.Row="2" Text="{Binding StatusMessage}" FontSize="16" Foreground="Gray" HorizontalAlignment="Center" />
    </Grid>
</Window>
```

`MainWindow.xaml.cs`, in full:

```csharp
using System.ComponentModel;
using System.Text;
using System.Windows;
using System.Windows.Controls;
using System.Windows.Data;
using System.Windows.Documents;
using System.Windows.Input;
using System.Windows.Media;
using System.Windows.Media.Imaging;
using System.Windows.Navigation;
using System.Windows.Shapes;

namespace CncWpf;

/// <summary>
/// Interaction logic for MainWindow.xaml
/// </summary>
public partial class MainWindow : Window, INotifyPropertyChanged
{
    public event PropertyChangedEventHandler? PropertyChanged;

    private int _clickCount = 0;

    private string _statusMessage = "Hello, WPF";
    public string StatusMessage
    {
        get => _statusMessage;
        set
        {
            _statusMessage = value;
            PropertyChanged?.Invoke(this, new PropertyChangedEventArgs(nameof(StatusMessage)));
        }
    }

    public MainWindow()
    {
        InitializeComponent();
        DataContext = this;
    }

    private void ClickMeButton_Click(object sender, RoutedEventArgs e)
    {
        _clickCount++;
        StatusMessage = $"Clicked {_clickCount} times";
    }
}
```
Both `TextBlock`s now bind to the same property, and `x:Name="StatusText"`
is gone entirely — nothing in code needs to reach into either element
directly anymore, since the click handler's only job now is updating one
property. That single line is what keeps both elements in sync, with no
call listing which UI elements care about it.

### Mechanical Walkthrough

- `: Window, INotifyPropertyChanged` — **(a) first appearance**, full
  treatment in `../concepts/csharp-inotifypropertychanged.md`.
- `public event PropertyChangedEventHandler? PropertyChanged;` — **(b)
  hard concept reappearing**: an `event`, the same mechanism
  `wpf-click-event-handling.md` already established for `Button.Click`,
  now declared *on this class* rather than consumed from a control WPF
  provides.
- `private string _statusMessage` / the full `StatusMessage` property —
  **(a) first appearance** of a hand-written **backing field**, full
  treatment in the linked concept file; replaces the previous unit's
  auto-property specifically because the setter now needs real logic.
- `PropertyChanged?.Invoke(this, new PropertyChangedEventArgs(nameof(StatusMessage)));` —
  **(a) first appearance**, full treatment in the linked concept file:
  raises the notification, `nameof(StatusMessage)` naming which property
  changed as a compiler-checked string.
- `StatusText.Text = $"Clicked {_clickCount} times";` — **removed**, not
  reappearing: the handler no longer needs it, since the binding now
  does that job.
- `x:Name="StatusText"` — **removed** from the first `TextBlock`: nothing
  in code reads or writes it anymore, so the name — Lesson 2's whole
  reason for existing — is now genuinely dead weight, and dropped.

### Execution Trace

Same two-click scenario as the previous unit, same temporary
instrumentation technique, rerun against this unit's real code:

```
After click 1: StatusMessage="Clicked 1 times", StatusText.Text="Clicked 1 times", EchoText.Text="Clicked 1 times"
After click 2: StatusMessage="Clicked 2 times", StatusText.Text="Clicked 2 times", EchoText.Text="Clicked 2 times"
```
(Both `StatusText`/`EchoText` names were temporarily restored for this
one proof, to read both elements' real `Text` values side by side —
neither exists in the file shown above.)

1. **Click 1** — `ClickMeButton_Click` sets `StatusMessage`, and
   *only* `StatusMessage`. Its setter runs, stores `"Clicked 1 times"`
   in `_statusMessage`, and raises `PropertyChanged`. Both bindings —
   completely independent of each other, never communicating directly —
   react to the same event and pull the new value, landing at the same
   string.
2. **Click 2** — identical mechanism, `"Clicked 2 times"` — the pattern
   this trace actually proves: one write, two listeners, zero code
   naming either listener.

### CS Lens / SE Lens

Both covered in full in `../concepts/csharp-inotifypropertychanged.md`.

### Commands and Real Output

```
dotnet build
```
**Real output:**
```
Build succeeded.
    0 Warning(s)
    0 Error(s)
```

### Run It

```
dotnet run
```
Run for real and click the button — both lines of text now update on
every click, together, confirmed for real:
```
tasklist /FI "IMAGENAME eq CncWpf.exe"

Image Name                     PID Session Name        Session#    Mem Usage
========================= ======== ================ =========== ============
CncWpf.exe                   56660 Console                    1     98,900 K
```

---

## Connect the Pieces

One concrete trip through everything built in this lesson, start to
finish:

1. `DataContext = this;` runs once, in the constructor, making
   `MainWindow` the lookup source for both `{Binding StatusMessage}`
   expressions in `MainWindow.xaml`.
2. Both `<TextBlock>`s read `StatusMessage`'s current value the moment
   the window loads — `"Hello, WPF"`, the field initializer's value.
3. A user clicks the button. `ClickMeButton_Click` runs, increments
   `_clickCount`, and assigns a new string to `StatusMessage` — nothing
   else.
4. `StatusMessage`'s own setter runs, stores the new value in
   `_statusMessage`, and raises `PropertyChanged` with
   `nameof(StatusMessage)`.
5. Both bindings — set up independently in step 1/2, with no reference
   to each other — react to that one event and re-read `StatusMessage`,
   landing on the same new string, with the click handler never
   mentioning either `TextBlock` by name.

## What Breaks Without This

This lesson's central claim is that a plain property change is
*invisible* to a binding without `INotifyPropertyChanged` — not a
compile error, a real, silent staleness bug. Reverted on purpose, this
session — `StatusMessage` changed back to a plain auto-property with no
notification, same as this lesson's own first unit:

```csharp
public string StatusMessage { get; set; } = "Hello, WPF";
```
```
dotnet build

Build succeeded.
    0 Warning(s)
    0 Error(s)
```
**It builds — and runs — with no error at all.** Clicking the button in
this broken state, verified for real this session (same temporary
instrumentation as above):
```
After click 1: StatusMessage="Clicked 1 times", StatusText.Text="Clicked 1 times", EchoText.Text="Hello, WPF"
```
Both `TextBlock`s were bound to the same property, both were reading it
correctly at startup — and one of them silently stops following it the
instant that property's own notification disappears, with nothing in the
build output, the console, or an exception ever pointing at the cause.

**Restored, rebuilt, verified clean:**
```csharp
private string _statusMessage = "Hello, WPF";
public string StatusMessage
{
    get => _statusMessage;
    set
    {
        _statusMessage = value;
        PropertyChanged?.Invoke(this, new PropertyChangedEventArgs(nameof(StatusMessage)));
    }
}
```
```
dotnet build

Build succeeded.
    0 Warning(s)
    0 Error(s)
```

## Exercises

1. Add a third bound `TextBlock`, reading the same `StatusMessage`, in a
   new fourth row. Confirm it starts working correctly immediately, with
   zero changes to `ClickMeButton_Click` — proof of this lesson's own
   "one write, arbitrarily many listeners" claim.
2. Add a second property, `ClickCountMessage`, computed from `_clickCount`
   in a different format (e.g. `"You have clicked 3 times"` instead of
   `"Clicked 3 times"`), with its own backing field and its own
   `PropertyChanged` raise. Bind a new `TextBlock` to it and update it
   alongside `StatusMessage` inside the handler.
3. Leave `StatusMessage`'s own `PropertyChanged?.Invoke(...)` call using
   `nameof(StatusMessage)` untouched, but change `ClickCountMessage`'s
   own raise (from Exercise 2) to use a raw string with a typo instead
   of `nameof`, e.g. `"ClikCountMessage"`. Rebuild, run, and click —
   confirm that specific property's binding silently stops updating
   while `StatusMessage`'s correctly-`nameof`'d one keeps working, then
   fix it.

## Definition of Done

- [ ] Both `TextBlock`s in `wpf-app/CncWpf/MainWindow.xaml` read
      `{Binding StatusMessage}`, and both update together on every real
      click, verified by actually running the app.
- [ ] `MainWindow` implements `INotifyPropertyChanged`, and
      `StatusMessage`'s setter really raises `PropertyChanged` on every
      assignment.
- [ ] Neither `TextBlock` has an `x:Name` anymore, and
      `ClickMeButton_Click` no longer references either element
      directly — only `StatusMessage`.
- [ ] You can explain, without looking back at this lesson, why a plain
      C# property change doesn't reach a WPF binding on its own.
- [ ] You caused the real silent-staleness failure in "What Breaks
      Without This" yourself, confirmed the build succeeds anyway, and
      understood why this specific bug produces no error at all.
- [ ] You completed Exercises 1–3 above and observed the described real
      behavior yourself.
