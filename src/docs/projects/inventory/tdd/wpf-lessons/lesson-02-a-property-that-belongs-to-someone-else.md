# WPF Lesson 2: A Property That Belongs to Someone Else

*(Track purpose, scope, concept-reuse rule, and cadence: `README.md` —
not restated per-lesson. Unsure what to actually type/run/create for one
of the linked concept files' own isolated examples:
`HOW-TO-RUN-EXAMPLES.md`.)*

## What you will build

The same window from Lesson 1, given real structure (two rows instead of
one undivided cell) and, for the first time, something to actually click:
a `Button` that increments a counter shown in the existing text. The
transferable problem this lesson is really about: **a property WPF reads
doesn't have to live on the object it describes** (`Grid.Row` is set on
the child, not the `Grid`), and **a click doesn't run code by being
polled for — it runs a specific method WPF calls for you, at a moment
you don't control.**

## What you need to know first

Lesson 1's end state (`wpf-app/CncWpf`, a `Window` containing a `Grid`
with one centered `TextBlock`) — this lesson edits that project directly,
it doesn't start fresh. Reused from Lesson 1 without re-explanation:
`partial class`, `x:Class`, XAML attribute syntax, and that `Title`/
`Height`/`Width`/`Text`/`FontSize` are ordinary settable properties.

## Terms introduced in this lesson

> **RowDefinitions / RowDefinition** — the property-element collection
> declaring a `Grid`'s named, indexable rows.

> **Star sizing (`*`)** — a row/column size meaning "an equal share of
> whatever space remains" after fixed-size rows/columns are subtracted.

> **Auto sizing** — a row/column size meaning "exactly as much space as
> this row's/column's content naturally needs."

> **Attached property** — a property (like `Grid.Row`) that conceptually
> belongs to one type (`Grid`) but is set on a different object (its
> child) to communicate something back to it.

> **`x:Name`** — the XAML attribute that makes the build process
> generate a real, typed field for an element, usable directly from
> code-behind.

> **Event** — a notification a .NET object can raise, that other code can
> subscribe a method to run in response to.

> **Event handler** — the method subscribed to an event; runs only when
> that event is actually raised, never before.

> **`RoutedEventArgs`** — the required second parameter of a WPF event
> handler; carries extra information about the event itself.

> **`sender`** — the required first parameter of an event handler; the
> exact object that raised the event.

> **Interpolated string (`$"..."`)** — a string literal prefixed with
> `$`; any `{expr}` inside it is replaced with that expression's real
> value when the string is built, instead of being kept as literal text.

> **Access modifier (`private`)** — restricts a member to code inside its
> own containing class only; the default for a class member with no
> modifier written (narrower than `internal`, the default for a
> top-level type, covered in Lesson 1).

## Concepts cataloged from this lesson

`wpf-grid-rows-and-columns` · `wpf-attached-properties` ·
`xaml-x-name-and-generated-fields` · `wpf-click-event-handling`

Each has its own full standalone treatment in `../concepts/` — this
lesson names each one, then goes straight to applying it in the real
project; it does not re-derive the isolated lab already sitting in that
file.

---

## Concept Unit: Grid Rows and Columns

*(Full standalone treatment: `../concepts/wpf-grid-rows-and-columns.md`.)*

### The Problem

The window has one thing in it. Adding a second — a button, below the
existing text — needs somewhere of its own to go; the `Grid`'s single,
undivided cell has nowhere to put a second element without it landing on
top of the first.

### Project Change

- **Reference Source** — none; from-scratch addition, per this track's
  own rule (see `README.md`).
- **Files affected** — `wpf-app/CncWpf/MainWindow.xaml`.
- **Change type** — add.
- **Location** — inside `<Grid>`, before the existing `<TextBlock>`.
- **Dependencies** — Lesson 1's end state.

### The New Code

```xml
<Grid.RowDefinitions>
    <RowDefinition Height="*" />
    <RowDefinition Height="Auto" />
</Grid.RowDefinitions>
```

### The Updated Project

`MainWindow.xaml`, in full, nothing elided:

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
        </Grid.RowDefinitions>

        <TextBlock Text="Hello, WPF" FontSize="24" HorizontalAlignment="Center" VerticalAlignment="Center" />
    </Grid>
</Window>
```
The `Grid` now has two real rows — a flexible one that takes whatever
space is left over, and a second sized to fit its own content — but the
existing `TextBlock` doesn't yet say which one it belongs to, so it still
renders exactly as it did at the end of Lesson 1.

### Mechanical Walkthrough

- `<Grid.RowDefinitions>` / `<RowDefinition Height="*" />` / `<RowDefinition Height="Auto" />` —
  **(a) first appearance**, full treatment in
  `../concepts/wpf-grid-rows-and-columns.md`: property-element syntax
  declaring two rows, one star-sized, one auto-sized.
- Everything else in this file — **(c) already basic**, unchanged from
  Lesson 1.

### Execution Trace

No loop, recursion, or carried state in this unit — two static row
declarations, nothing computed. Not applicable.

### CS Lens / SE Lens

Both covered in full in the linked concept file — this unit is the
concept's first real application, not a new angle on it.

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

Run and compare side by side with Lesson 1's end state — identical, by
design: `RowDefinitions` alone changes nothing visible, proven directly
in `../concepts/wpf-grid-rows-and-columns.md`'s own isolated example.

---

## Concept Unit: Attached Properties — Placing Children Into Rows

*(Full standalone treatment: `../concepts/wpf-attached-properties.md`.)*

### The Problem

The rows exist, but the `TextBlock` doesn't know it should live in the
first one — and a new `Button`, once added, needs to land in the second
one specifically, not stacked on top of the text.

### Project Change

- **Reference Source** — none.
- **Files affected** — `wpf-app/CncWpf/MainWindow.xaml`.
- **Change type** — add (`Grid.Row` on the existing `TextBlock`) and add
  (a new `Button`).
- **Location** — on the existing `<TextBlock>`, and a new sibling element
  after it, still inside `<Grid>`.
- **Dependencies** — the `RowDefinitions` from the previous unit.

### The New Code

```xml
<Button Grid.Row="1" Content="Click Me" Width="120" Height="32" Margin="16" HorizontalAlignment="Center" />
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
        </Grid.RowDefinitions>

        <TextBlock Grid.Row="0" Text="Hello, WPF" FontSize="24" HorizontalAlignment="Center" VerticalAlignment="Center" />
        <Button Grid.Row="1" Content="Click Me" Width="120" Height="32" Margin="16" HorizontalAlignment="Center" />
    </Grid>
</Window>
```
The window now has two real, distinct rows of content — the greeting on
top, a plain, not-yet-wired button beneath it.

### Mechanical Walkthrough

- `Grid.Row="0"` on `<TextBlock>` — **(a) first appearance** of using an
  attached property (full treatment:
  `../concepts/wpf-attached-properties.md`), applied here to the element
  already on screen since Lesson 1.
- `<Button ... />` — **(a) first appearance** of the `Button` control
  itself — a real WPF element, not yet covered elsewhere; its own click
  behavior is the next unit's subject, not this one's.
- `Content="Click Me"` — **(b) hard concept reappearing**: the same
  attribute-sets-a-real-property mechanism already established for
  `Text`/`Title` in Lesson 1, a different property name (`Button` shows
  arbitrary content, not just text, which is why the property is named
  `Content` rather than `Text` — not explored further here).
- `Width="120" Height="32" Margin="16"` — **(c) already basic**, same
  attribute mechanism as `Height`/`Width` on `Window` in Lesson 1.
- `Grid.Row="1"` — **(b) hard concept reappearing**, same mechanism as
  the `TextBlock`'s own `Grid.Row` above, second row.

### Execution Trace

No loop, recursion, or carried state — static placement. Not applicable.

### CS Lens / SE Lens

Covered in full in `../concepts/wpf-attached-properties.md`.

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

Run, confirmed as a real process:
```
dotnet run
tasklist /FI "IMAGENAME eq CncWpf.exe"

Image Name                     PID Session Name        Session#    Mem Usage
========================= ======== ================ =========== ============
CncWpf.exe                    1840 Console                    1     98,828 K
```

### Run It

A real, visible change from Lesson 1's end state: the window now shows
the greeting on top and a real, clickable-looking button beneath it —
pressing it does nothing yet, on purpose; that's the next two units.

---

## Concept Unit: `x:Name` — Reaching an Element From Code

*(Full standalone treatment: `../concepts/xaml-x-name-and-generated-fields.md`.)*

### The Problem

Making the button do something requires changing the `TextBlock`'s own
`Text` from C# — but nothing in `MainWindow.xaml.cs` has any way to refer
to that specific object yet. It was declared in XAML; code-behind is a
separate file with no automatic reference to it.

### Project Change

- **Reference Source** — none.
- **Files affected** — `wpf-app/CncWpf/MainWindow.xaml`.
- **Change type** — add (`x:Name` on the existing `TextBlock`).
- **Location** — on the `<TextBlock>` element.
- **Dependencies** — none beyond what already exists.

### The New Code

```xml
x:Name="StatusText"
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
        </Grid.RowDefinitions>

        <TextBlock x:Name="StatusText" Grid.Row="0" Text="Hello, WPF" FontSize="24" HorizontalAlignment="Center" VerticalAlignment="Center" />
        <Button Grid.Row="1" Content="Click Me" Width="120" Height="32" Margin="16" HorizontalAlignment="Center" />
    </Grid>
</Window>
```
Nothing visibly changes — `x:Name` doesn't affect rendering at all; it
only makes `StatusText` usable as a real field the next unit's code
depends on.

### Mechanical Walkthrough

- `x:Name="StatusText"` — **(a) first appearance**, full treatment in
  `../concepts/xaml-x-name-and-generated-fields.md`: generates a real
  `TextBlock` field named `StatusText` in the same generated `partial
  class` piece `InitializeComponent()` lives in.

### Execution Trace

Not applicable — no runtime behavior changes in this unit at all.

### CS Lens / SE Lens

Covered in full in the linked concept file.

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

Not independently observable — this unit's only effect is a field that
doesn't exist yet from any caller's point of view. The next unit is the
first thing that actually reads it.

---

## Concept Unit: Click Event Handling — A Method WPF Calls For You

*(Full standalone treatment: `../concepts/wpf-click-event-handling.md`.)*

### The Problem

The button is on screen and the text is reachable from code — but
nothing yet connects "the button was clicked" to "run some code." Without
that connection, `StatusText` and the button are two unrelated objects
that happen to share a window.

### Project Change

- **Reference Source** — none.
- **Files affected** — `wpf-app/CncWpf/MainWindow.xaml` (add `Click` to
  the `Button`); `wpf-app/CncWpf/MainWindow.xaml.cs` (add a field and a
  handler method).
- **Change type** — add.
- **Location** — `Click="..."` on the existing `<Button>`; the field and
  method go inside `public partial class MainWindow`, alongside the
  existing constructor.
- **Dependencies** — `StatusText`'s `x:Name` from the previous unit.

### The New Code

```xml
Click="ClickMeButton_Click"
```
```csharp
private int _clickCount = 0;

private void ClickMeButton_Click(object sender, RoutedEventArgs e)
{
    _clickCount++;
    StatusText.Text = $"Clicked {_clickCount} times";
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
        </Grid.RowDefinitions>

        <TextBlock x:Name="StatusText" Grid.Row="0" Text="Hello, WPF" FontSize="24" HorizontalAlignment="Center" VerticalAlignment="Center" />
        <Button Grid.Row="1" Content="Click Me" Click="ClickMeButton_Click" Width="120" Height="32" Margin="16" HorizontalAlignment="Center" />
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

    public MainWindow()
    {
        InitializeComponent();
    }

    private void ClickMeButton_Click(object sender, RoutedEventArgs e)
    {
        _clickCount++;
        StatusText.Text = $"Clicked {_clickCount} times";
    }
}
```
The window is now genuinely interactive: pressing the button increments
a real counter and reflects it in the text on screen, with no other code
change needed to keep the two in sync — because the handler updates
`StatusText.Text` directly, every click.

### Mechanical Walkthrough

- `Click="ClickMeButton_Click"` — **(a) first appearance**, full
  treatment in `../concepts/wpf-click-event-handling.md`: wires the
  method below as `Button.Click`'s real event handler.
- `private int _clickCount = 0;` — **(b) hard concept reappearing**: a
  field, the same mechanism `Robot`'s `Name` field used in Lesson 1
  (`../concepts/csharp-partial-classes.md`) — new here is `private`
  (full treatment: `../concepts/csharp-access-modifiers.md`, which
  covered `public`/`internal` at the *type* level; `private` here
  applies the same idea one level down, at the *member* level, where the
  default for an unmarked member is `private`, not `internal`).
- `private void ClickMeButton_Click(object sender, RoutedEventArgs e)` —
  **(a) first appearance** of the required event-handler shape, full
  treatment in the linked concept file.
- `_clickCount++;` — **(c) already basic**, the increment operator,
  ordinary arithmetic on an `int`.
- `StatusText.Text = $"Clicked {_clickCount} times";` — **(b) hard
  concept reappearing**: `StatusText` is the `x:Name`-generated field
  from the previous unit, `Text` is the same settable property already
  used since Lesson 1. `$"..."` is **(a) first appearance** of C#'s
  **interpolated string**: the leading `$` before the opening quote
  means any `{expr}` inside the string is replaced with that
  expression's real value, converted to text, when the string is built
  — `$"Clicked {_clickCount} times"` with `_clickCount` equal to `3`
  produces the actual string `"Clicked 3 times"`, not the literal text
  `"Clicked {_clickCount} times"`. Without the leading `$`, `{` and `}`
  would just be ordinary characters in the string, not a substitution.

### Execution Trace

`_clickCount` is state carried across separate calls to the same
handler — a real carried-state trigger. Simulated for real, three
calls in sequence (via `RaiseEvent`, the same technique
`../concepts/wpf-click-event-handling.md` uses, temporarily added to this
exact constructor and removed again before this file's own final state
above):

```
After simulated click 1: _clickCount=1, StatusText.Text="Clicked 1 times"
After simulated click 2: _clickCount=2, StatusText.Text="Clicked 2 times"
After simulated click 3: _clickCount=3, StatusText.Text="Clicked 3 times"
```

1. **Click 1** — `_clickCount` starts at its field initializer's value,
   `0`; `_clickCount++` makes it `1`; `StatusText.Text` is assigned the
   interpolated string built from that new value.
2. **Click 2** — `_clickCount` is *not* reset to `0` — the same
   `MainWindow` instance, and therefore the same field, is still alive
   from the previous click, so `++` runs against `1`, producing `2`.
3. **Click 3** — same reasoning again, `2` → `3`. The pattern this trace
   actually proves: a field on a live object is real, persistent memory
   — it remembers exactly what the last handler call left it holding,
   which is *why* a counter like this works at all without extra
   plumbing.

### CS Lens

`_clickCount` living on the `MainWindow` instance itself, read and
written by a method that runs at an unpredictable future time, is
**object state** — the same idea `csharp-constructors.md`'s `Lamp`
example first proved (`IsOn` set once and read back later), now proven
across *multiple, separate, framework-triggered calls* instead of one
straight-line sequence.

Also recognized in: any stateful UI widget (a checkbox remembering
whether it's checked between renders), a game object's own health/score
fields read and written across many separate update calls, a server
session object accumulating state across separate requests.

### SE Lens

The alternative — a `static` counter, shared across every window instance
rather than one field per `MainWindow` — would mean two open windows of
this same app secretly share one counter, incrementing together no
matter which one is clicked; a real, surprising bug the instance field
avoids by construction. `private` (rather than `public`) on `_clickCount`
matters for a different reason: nothing outside `MainWindow` has any
legitimate reason to read or set it directly — `StatusText.Text` is the
one, deliberate, public-facing way the count is exposed, and `private`
makes that the *only* way, provable directly below.

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
Run for real and click the button several times — `StatusText` updates
from "Hello, WPF" to "Clicked 1 times," "Clicked 2 times," and so on,
exactly matching the simulated trace above.

---

## Connect the Pieces

One concrete trip through everything built in this lesson, start to
finish:

1. `MainWindow.xaml` is parsed at build time. `Grid.RowDefinitions`
   builds a real two-row structure. Each child's own `Grid.Row` attached
   property tells the `Grid` which row to place it in — `StatusText` in
   row 0, the button in row 1.
2. `x:Name="StatusText"` makes the XAML compiler generate a real
   `TextBlock StatusText` field inside `MainWindow`'s generated `partial
   class` piece, assigned inside `InitializeComponent()`.
3. `Click="ClickMeButton_Click"` makes the same generated code subscribe
   `ClickMeButton_Click` to the button's `Click` event.
4. A user clicks the button. WPF raises `Click`, calling
   `ClickMeButton_Click(button, someRoutedEventArgs)` — `_clickCount`
   increments, and `StatusText.Text` is reassigned through the exact
   field `x:Name` generated in step 2.
5. Because `_clickCount` is a field on the live `MainWindow` instance —
   not a local variable re-created each call — every future click keeps
   counting up from wherever the last click left it, proven for real in
   this lesson's own Execution Trace.

## What Breaks Without This

This lesson's Click Event Handling unit claims `Click="..."` really does
require a real, matching method — not just a string WPF interprets
loosely. Broken on purpose, this session:

```xml
<!-- MainWindow.xaml, Click renamed to a method that doesn't exist -->
<Button Grid.Row="1" Content="Click Me" Click="NotARealHandler" ... />
```
```
dotnet build

REAL FAILURE CAPTURED:
error CS1061: 'MainWindow' does not contain a definition for
'NotARealHandler' and no accessible extension method 'NotARealHandler'
accepting a first argument of type 'MainWindow' could be found (are you
missing a using directive or an assembly reference?)
```
The error is a real C# compiler error (`CS1061`), not a XAML-specific
one — proof `Click="..."` compiles down to an ordinary method reference
the C# compiler checks like any other, not a loosely-typed string
looked up at runtime.

A second, related failure — `_clickCount` really is inaccessible from
outside `MainWindow`, not just conventionally private. Broken on purpose,
by adding a second class in the same project:
```csharp
class TempAccessTest
{
    void Test(MainWindow w)
    {
        int x = w._clickCount;
    }
}
```
```
dotnet build

REAL FAILURE CAPTURED:
error CS0122: 'MainWindow._clickCount' is inaccessible due to its
protection level
```

**Both restored, rebuilt, verified clean:**
```
dotnet build

Build succeeded.
    0 Warning(s)
    0 Error(s)
```

## Exercises

1. Add a second `Button`, "Reset," in a third row (`RowDefinition
   Height="Auto"`, `Grid.Row="2"`) with its own `Click` handler that sets
   `_clickCount` back to `0` and updates `StatusText.Text` to match.
2. Change `_clickCount`'s type from `int` to `uint` (an unsigned integer
   — cannot go negative) and reason about whether anything in this
   lesson's own code could ever have driven it negative in the first
   place, before making the change.
3. Give the `Button` an `x:Name` of its own and rewrite the handler to
   read `((Button)sender).Content` instead of hardcoding a fixed label —
   confirm it still reads `"Click Me"` correctly, proof `sender` really
   is usable, not just present for signature-matching.

## Definition of Done

- [ ] `wpf-app/CncWpf/MainWindow.xaml` has a two-row `Grid`: the greeting
      in row 0, a button in row 1.
- [ ] Clicking the button updates the on-screen text to "Clicked N
      times," incrementing correctly across repeated clicks, verified by
      actually running the app and clicking it yourself.
- [ ] You can explain, without looking back at this lesson, why
      `Grid.Row` is set on the child instead of the `Grid`.
- [ ] You caused both real failures in "What Breaks Without This"
      yourself, read the real errors, and understood why one is a XAML
      compile error surfaced as a C# error, and the other is an ordinary
      access-modifier violation.
- [ ] You completed Exercises 1–3 above and observed the described real
      behavior yourself.
