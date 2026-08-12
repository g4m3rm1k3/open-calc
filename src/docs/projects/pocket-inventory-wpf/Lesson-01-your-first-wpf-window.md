# Lesson 1: Composing a Screen From Independent Elements

*(Your First Real Home Screen)*

**User Story**
> As a user, I want to launch Pocket Inventory and see a welcoming home
> screen.

**What you will build**
Lesson 0's "Pocket Inventory is running." text was a developer's toolchain
check — proof that XAML compiles and a window opens, nothing more. This
lesson deletes it and replaces it with the actual first thing a real user of
this app sees: a title, a welcome message that's genuinely computed by C#
code rather than hardcoded text sitting in markup, and a small footer. The
transferable problem underneath "make a nicer home screen" is composing
several independent visual elements in a shared direction (stacked
vertically) and connecting markup to the C# code that can compute values for
it — the second half of a divide that Lesson 0 only showed one side of.

**What you need to know first**
Lesson 0: the .NET SDK and CLR, C#'s static typing and `var`, why WPF was
chosen, the anatomy of a WPF project (`MainWindow.xaml` / `MainWindow.xaml.cs`
as a matched pair), and XAML as a declarative object tree. This lesson
assumes all of that and builds on the exact `MainWindow.xaml` Lesson 0 left
behind.

**Terms introduced in this lesson:**
- **Panel** — WPF's general term for any element whose entire job is
  arranging its children (as opposed to an element like `TextBlock`,
  which displays content but arranges nothing).
- **`StackPanel`** — a panel that arranges its children in a single
  vertical (default) or horizontal sequence, one after another.
- **`x:Name`** — assigns an element a name the code-behind file can
  refer to directly; not a property of the element itself, but an
  instruction to the XAML compiler (`x:` marks XAML-language features,
  as opposed to properties of whatever object the tag represents).
- **`Margin`** — space around an element's outer edge, as four
  comma-separated numbers: left, top, right, bottom, in that order.
- **Layout algorithm** — the general idea a panel embodies: taking a
  list of children and deciding where each one goes; swapping one panel
  type for another changes the whole arrangement with no change to the
  children themselves.
- **Interpolated string** (`$"..."`) — a string literal whose `{expression}`
  placeholders (e.g. `{appName}`, `{screenCount}`) are evaluated and
  spliced into the result directly; C#'s
  equivalent of Python's `f"..."`.

**Objects and methods used**
- **`StackPanel`**
  - *What it is:* a layout panel that arranges its children in a single
    vertical (default) or horizontal sequence, one after another, each
    keeping its own natural size.
  - *Implementation:* `System.Windows.Controls.StackPanel`. Every direct
    child is placed one after the previous, in source order — no
    row/column structure to declare, unlike `Grid`.
  - *Its use:* this lesson's own subject — replaces Lesson 0's single,
    centered `TextBlock` inside `MainWindow.xaml`'s `Grid`, arranging
    three `TextBlock`s (title, welcome message, footer) in a vertical
    stack. Full treatment, real running proof, and both lenses in
    Concept Unit 1, below.
- **`System.DateTime`**
  - *What it is:* a built-in .NET struct representing a specific point
    in calendar time.
  - *Implementation:* `DateTime.Now` is a `static` property (no
    parentheses — reading it, not calling a method with arguments) that
    returns the current local date and time at the exact moment it's
    read, computed fresh from the operating system's own clock each
    time, never a value fixed once and reused.
  - *Its use:* `WelcomeMessage.Text = $"Welcome — today is
    {DateTime.Now:MMMM d, yyyy}."` — the welcome message's date is
    genuinely computed live, at the moment the window opens, not a
    fixed string baked into the markup. Full treatment in this lesson's
    third Concept Unit.

**Everything else in the file, not this lesson's subject but still
explained**
- **`TextBlock`**
  - *What it is:* the basic WPF control for displaying a run of text.
  - *Implementation:* full treatment already given in
    `Lesson-00-developer-environment.md`.
  - *Its use:* three of them, here — a bold title, a computed welcome
    message, and a gray footer — stacked inside this lesson's new
    `StackPanel`.
- **`Console.WriteLine`**
  - *What it is:* .NET's way of printing a line of text to the running
    program's terminal.
  - *Implementation:* full treatment already given in
    `Lesson-00-a-classes-objects-and-inheritance.md`.
  - *Its use:* this lesson's own throwaway string-interpolation lab,
    proving `$"..."` and the real `f"..."` compile error, before either
    ever touches real project code.

---

## Concept Unit: StackPanel

### The Problem

Lesson 0's `Grid` held exactly one child, centered. A real home screen needs
at least three independent pieces of text — a title, a welcome message, and
a small footer — stacked one above the other, each keeping its own natural
height. Centering three separate elements inside one `Grid` cell would stack
them on top of each other, overlapping; `Grid` alone doesn't arrange multiple
children in a sequence.

### Introduce the Concept in Isolation
Create a throwaway WPF project to see this one control in isolation, without
any of Pocket Inventory's real content nearby.

```bash
dotnet new wpf -o lab-stackpanel
```

Replace the generated `MainWindow.xaml`'s `Grid` contents:

```xml
<StackPanel>
    <TextBlock Text="First" FontSize="20" />
    <TextBlock Text="Second" FontSize="20" />
    <TextBlock Text="Third" FontSize="20" />
</StackPanel>
```

Run it on your Windows machine:

```bash
dotnet run
```

Expected result, to verify yourself: the window shows "First," "Second," and
"Third," each on its own line, stacked top to bottom in the exact order they
appear in the markup — not overlapping, and not centered as a group unless
you tell it to be.

*What this proves:* `StackPanel` gives every child its own row, one after
another, in source order, using each child's own natural (unstretched)
height by default — a fundamentally different layout rule than `Grid`, which
requires you to explicitly define rows and columns before it knows where
anything goes.

### Discard the Throwaway Example
Delete the `lab-stackpanel` folder. `StackPanel` itself is not thrown away —
it's about to become part of the real project — only this specific
three-line demonstration is discarded.

### Project Change

- **Reference Source:** No reference counterpart — Pocket Inventory has no
  pre-existing home screen design to port from; this is a from-scratch
  layout decision.
- **Files affected:** `MainWindow.xaml`.
- **Change type:** Replace.
- **Location:** Replacing the single centered `TextBlock` Lesson 0 added
  inside `MainWindow.xaml`'s `<Grid>`.
- **Dependencies:** None beyond Lesson 0's scaffolded project.

### The New Code

```xml
<StackPanel VerticalAlignment="Center"
            HorizontalAlignment="Center">
    <TextBlock Text="Pocket Inventory"
               FontSize="32"
               FontWeight="Bold"
               HorizontalAlignment="Center" />
    <TextBlock x:Name="WelcomeMessage"
               FontSize="16"
               Margin="0,12,0,0"
               HorizontalAlignment="Center" />
    <TextBlock Text="Your inventory, organized."
               FontSize="12"
               Foreground="Gray"
               Margin="0,24,0,0"
               HorizontalAlignment="Center" />
</StackPanel>
```

Notice the second `TextBlock` has no `Text` attribute at all yet, only a
name — Concept Unit 3 fills that in from C#, on purpose, not as an oversight.

### The Updated Project

```xml
<Window x:Class="PocketInventory.MainWindow"
        xmlns="http://schemas.microsoft.com/winfx/2006/xaml/presentation"
        xmlns:x="http://schemas.microsoft.com/winfx/2006/xaml"
        Title="Pocket Inventory" Height="450" Width="800">
    <Grid>
        <StackPanel VerticalAlignment="Center"
                    HorizontalAlignment="Center">
            <TextBlock Text="Pocket Inventory"
                       FontSize="32"
                       FontWeight="Bold"
                       HorizontalAlignment="Center" />
            <TextBlock x:Name="WelcomeMessage"
                       FontSize="16"
                       Margin="0,12,0,0"
                       HorizontalAlignment="Center" />
            <TextBlock Text="Your inventory, organized."
                       FontSize="12"
                       Foreground="Gray"
                       Margin="0,24,0,0"
                       HorizontalAlignment="Center" />
        </StackPanel>
    </Grid>
</Window>
```

The `Grid` still has exactly one direct child — now a `StackPanel` instead
of a bare `TextBlock` — and that one child internally arranges three
`TextBlock`s in a vertical sequence. The `Grid`'s own centering
(`VerticalAlignment`/`HorizontalAlignment="Center"`, now moved onto the
`StackPanel` itself) centers the whole stacked group as one unit; the
`StackPanel`'s job is only the arrangement *within* that group. Also note
`Title="Pocket Inventory"` replacing the template's default `Title="MainWindow"` —
the window's own title bar text, a property on `Window` itself, unrelated to
anything inside it.

### Mechanical Walkthrough
Every new distinct element, in order:

1. `<StackPanel ...>` — (first appearance) instantiates
   `System.Windows.Controls.StackPanel`, a layout **panel** — a WPF term for
   any element whose entire job is arranging its children, as opposed to
   `TextBlock`, which displays content but arranges nothing.
2. `VerticalAlignment="Center"` / `HorizontalAlignment="Center"` — (hard
   concept reappearing) the same enum-backed alignment properties Lesson 0
   introduced on the `TextBlock`; here they center the `StackPanel` as a
   whole within the `Grid` cell it occupies.
3. `FontWeight="Bold"` — (first appearance) another enum-backed property
   (`Normal`, `Bold`, and several intermediate named weights), controlling
   text thickness.
4. `x:Name="WelcomeMessage"` — (first appearance) assigns this specific
   `TextBlock` a name the code-behind file can refer to. `x:` is a namespace
   prefix (declared back in the `Window` tag's `xmlns:x="..."` attribute in
   Lesson 0) reserved for XAML-language features rather than properties of
   whatever object the tag represents — `x:Name` is not a property of
   `TextBlock` itself, it's an instruction to the XAML compiler about how to
   expose this specific instance to C#. Concept Unit 3 uses this directly.
5. `Margin="0,12,0,0"` — (first appearance) space around the element's outer
   edge, as four comma-separated numbers: left, top, right, bottom, in that
   order. `0,12,0,0` means no space on three sides and 12 units of space
   above this element only — the gap between the title and the welcome
   message.
6. `Foreground="Gray"` — (first appearance) the text color, referenced here
   by a named color rather than a numeric value — WPF recognizes a fixed set
   of named colors matching standard color names.

### CS Lens

`StackPanel` and `Grid` are two different implementations of the same
underlying idea: a **layout algorithm** that takes a list of children and
decides where each one goes. Swapping one panel type for another, with no
change to the children themselves, changes the whole arrangement — the
children don't know or care which panel is arranging them.

Also recognized in: CSS Flexbox (`display: flex` is conceptually
`StackPanel`; `display: grid` is conceptually WPF's `Grid`), Android's
`LinearLayout` versus `ConstraintLayout` (this curriculum's `../track/`
project uses `ConstraintLayout` directly), and SwiftUI's `VStack`/`HStack`
versus its `Grid` — the same "pluggable arrangement algorithm" idea,
recurring across every UI framework that separates *what* to display from
*how to arrange* it.

### SE Lens

Why not just use `Grid` everywhere, since it can do everything `StackPanel`
can and more? Because `Grid` requires explicitly declared rows and columns
before anything can be positioned — real ceremony for a case as simple as
"three things, stacked." The real tradeoff: `StackPanel` is simpler to read
for a single-axis layout, but doesn't support two independent elements
occupying the same row while a third spans both, the way `Grid` does — which
is exactly why Lesson 2 reaches for `Grid` the moment this app needs a
header, a content area, and a footer as three genuinely independent regions,
not one stacked sequence.

### Connection

This is the first layout panel this project uses for real, non-throwaway
content — every future screen's overall structure builds on the same
"pick the panel whose arrangement rule matches the content" decision made
here.

---

## Concept Unit: String Interpolation

### The Problem

The middle `TextBlock` above has an `x:Name` but no `Text` — it's
deliberately blank in XAML because the actual welcome message needs to be
*computed*, not hand-typed: "Welcome — today is {today's date}." Building
that string means combining fixed text with a value that changes every day,
which needs its own concept before touching the code-behind file at all.

### Introduce the Concept in Isolation
You already know Python's f-strings — `f"Hello, {name}"` — and this looks
almost identical in C#, which is exactly why it earns its own lab rather than
being assumed. Create a throwaway console project:

```bash
dotnet new console -o lab-interpolation
cd lab-interpolation
```

Replace `Program.cs`:

```csharp
string appName = "Pocket Inventory";
int screenCount = 1;
Console.WriteLine($"Welcome to {appName} — screen {screenCount} of many.");
```

Run it:

```bash
dotnet run
```

Real output:

```text
Welcome to Pocket Inventory — screen 1 of many.
```

*What this proves:* `$"..."` — a string literal prefixed with `$` — lets you
embed any C# expression directly inside `{ }` within the text, and it's
replaced with that expression's value, converted to text automatically. This
is the direct C# equivalent of Python's f-string, with one difference worth
stating precisely: Python's is `f"{value}"`; C#'s is `$"{value}"` — the
prefix letter itself differs, and typing `f"..."` in C# does not error, it
just produces a literal string containing the letter `f`, silently, with no
interpolation at all:

```csharp
int count = 5;
Console.WriteLine(f"Count is {count}");
```

Real output — verified on the machine this lesson was written on:

```text
Program.cs(2,29): error CS0103: The name 'f' does not exist in the current context
```

*What this proves:* C# has no `f`-string syntax at all; `f"..."` parses as
the identifier `f` immediately followed by a separate string literal, which
is a syntax error in this position — not silently-wrong output, an outright
compile failure. The habit to build here is `$`, not `f`.

### Discard the Throwaway Example
Delete the `lab-interpolation` folder. String interpolation itself is not
discarded — it's about to compute the real welcome message in
`MainWindow.xaml.cs`.

### Mechanical Walkthrough

- `$"Welcome to {appName} — screen {screenCount} of many."` — **first
  appearance.** The `$` prefix marks an interpolated string; each
  `{expression}` inside it is evaluated and converted to text, spliced
  directly into the resulting string — C#'s equivalent of Python's
  `f"..."`.
- `{appName}` / `{screenCount}` — **first appearance of embedding a
  variable directly.** Each name inside `{ }` is looked up and its
  current value substituted — `appName`'s and `screenCount`'s reads are
  otherwise ordinary variable reads (basic, already-established).
- `f"Count is {count}"` (no `$`) — **first appearance of the failure
  case, deliberately triggered.** C# has no `f`-string syntax; this
  parses as the identifier `f` directly followed by a separate string
  literal — a compile error (`CS0103`), not silently wrong output.

### CS Lens

This is **string interpolation**: source-level syntax that expands embedded
expressions into a string at the point it's written, as opposed to manually
concatenating pieces with `+` or calling a separate formatting function.
Under the hood, the C# compiler actually rewrites `$"..."` into a call to
`string.Format(...)` — interpolation is compiler sugar over a mechanism that
already existed, not new runtime behavior.

Also recognized in: Python f-strings, JavaScript template literals
(`` `${value}` ``), and Ruby's `"#{value}"` — the same idea, "embed the
expression next to the text it belongs in instead of stitching pieces
together," with each language choosing its own delimiter syntax.

### SE Lens

The alternative, string concatenation with `+` —
`"Welcome to " + appName + " — screen " + screenCount + " of many."` — works
identically but scales badly: adding a fourth piece means finding the right
spot in a chain of `+`s and getting the spacing right by hand. Interpolation
keeps each piece of text visually next to the value that fills it in,
which is the real readability win, not just fewer characters typed.

### Connection

This is the exact mechanism Concept Unit 3 uses to build the real welcome
message from inside `MainWindow.xaml.cs`.

---

## Concept Unit: `x:Name` and the Partial Class Connection

### The Problem

`WelcomeMessage`, the `TextBlock` from Concept Unit 1, has no `Text` set in
XAML. Something has to set it, and it needs to happen in C#, since it should
be computed with string interpolation. How does C# code in a completely
different file — `MainWindow.xaml.cs` — get a reference to an element
declared in `MainWindow.xaml`?

### Introduce the Concept in Isolation
Open `MainWindow.xaml.cs` as `dotnet new wpf` generated it — you have not
edited this file yet in this curriculum:

```csharp
using System.Windows;

namespace PocketInventory
{
    public partial class MainWindow : Window
    {
        public MainWindow()
        {
            InitializeComponent();
        }
    }
}
```

*What this proves, before any edit:* the class is declared `partial`. A
`partial class` is one class whose definition is split across two or more
files that the compiler merges into a single type before compiling anything
further. This file is only half of `MainWindow` — the other half is
generated automatically, by WPF's build tooling, directly from
`MainWindow.xaml`, and contains one field for every element in that file
that has an `x:Name`. You never see that generated half directly (it lives
in an `obj/` folder created during build), but it's real, compiled C#, and
it's why `WelcomeMessage` is about to be usable here as if it were declared
right in this file.

### Discard nothing — this is the real, existing file

This file already exists as part of the scaffolded project; there is no
throwaway version to discard.

### Project Change

- **Reference Source:** No reference counterpart — the constructor logic
  here is new, project-specific behavior with no prior lesson version.
- **Files affected:** `MainWindow.xaml.cs`.
- **Change type:** Add.
- **Location:** Inside the `MainWindow()` constructor, after the existing
  `InitializeComponent();` call.
- **Dependencies:** Concept Unit 1's `x:Name="WelcomeMessage"` must already
  exist in `MainWindow.xaml`; Concept Unit 2's string interpolation.

### The New Code

```csharp
WelcomeMessage.Text = $"Welcome — today is {DateTime.Now:MMMM d, yyyy}.";
```

### The Updated Project

```csharp
using System;
using System.Windows;

namespace PocketInventory
{
    public partial class MainWindow : Window
    {
        public MainWindow()
        {
            InitializeComponent();
            WelcomeMessage.Text = $"Welcome — today is {DateTime.Now:MMMM d, yyyy}."; // ← new
        }
    }
}
```

The constructor now does two things instead of one: `InitializeComponent()`
(generated code, unchanged, which builds the visual tree from
`MainWindow.xaml` and populates every `x:Name`-tagged field, including
`WelcomeMessage`) runs first, and only after that field genuinely exists
does the new line set its `Text` — this ordering isn't optional; setting
`WelcomeMessage.Text` before `InitializeComponent()` runs would fail, because
the field would still be its default, unset value.

### Mechanical Walkthrough
1. `WelcomeMessage` — (first appearance, connecting to Concept Unit 1) not a
   new variable — this is the generated field the `x:Name` attribute
   produced, now usable exactly like any other C# object reference.
2. `.Text` — (hard concept reappearing) the same `Text` property Lesson 0
   set directly in XAML; here it's set imperatively, from code, after the
   window is already constructed.
3. `= $"..."` — (hard concept reappearing) Concept Unit 2's string
   interpolation, assigning the resulting string to `.Text`.
4. `DateTime.Now` — (first appearance) a property on .NET's built-in
   `DateTime` type that returns the current date and time at the exact
   moment it's read — not a fixed value baked in at compile time.
5. `:MMMM d, yyyy` — (first appearance) a **format string**, placed after a
   colon inside the interpolation's `{ }`. `MMMM` means the full month name,
   `d` the day number with no leading zero, `yyyy` the four-digit year — this
   is what turns a raw `DateTime` value into human-readable text like
   "July 23, 2026" instead of a default, less readable representation.
6. `using System;` — (first appearance) the `using` **directive**, placed at
   the top of the file. `DateTime` lives in the `System` namespace; without
   this line, the compiler would not know where to find the name `DateTime`
   at all and would reject the file. This is the direct C# equivalent of a
   Python `import` statement — a declaration of exactly which other code
   this file depends on.

### CS Lens

The `partial` keyword implements **code generation meeting hand-written
code** in the same type: one half is authored by you, the other half is
mechanically derived from a different source file (the XAML) at build time.
This is why editing `MainWindow.xaml` and rerunning `dotnet run` makes new
`x:Name`d fields available in `MainWindow.xaml.cs` immediately, with no
manual step to "connect" them — the connection is regenerated on every
build.

Also recognized in: gRPC and GraphQL codegen (hand-written business logic
alongside a generated client), Entity Framework's generated migration
scaffolding, and Android's View Binding (this curriculum's `../track/`
project reaches the same underlying idea — generated code exposing
XML-declared views to Java/Kotlin — from the opposite direction, arriving at
it later in its own sequence).

### SE Lens

Why does WPF generate a field per `x:Name` instead of requiring you to
manually look up each element by name at runtime (the way, for comparison,
`document.getElementById(...)` works in a browser)? Because the generated
field is **strongly typed** — the compiler already knows `WelcomeMessage` is
specifically a `TextBlock`, and setting `.Texst` (a typo) is a compile error,
not a runtime crash discovered only when a user happens to trigger that code
path. The `document.getElementById` equivalent returns a generic type and
defers that same mistake to runtime — exactly the static-vs-dynamic tradeoff
from Lesson 0, appearing again in a completely different context.

### Commands needed

```bash
dotnet run
```

### Run it

On your Windows machine, this now opens a window titled "Pocket Inventory"
showing three lines: the bold title, a welcome message with today's actual
date computed live, and the gray footer line — verify the date shown matches
today's date on your machine, proving `DateTime.Now` is read live rather than
a value baked into the markup.

### Connection

This is the first time this project's code-behind has done anything beyond
the generated `InitializeComponent()` call — every future click handler,
starting with Lesson 3's navigation, is more C# added to this exact same
constructor-adjacent pattern: markup declares structure, code-behind adds
behavior on top of it.

---

## Closing

### Connect the Pieces
One concrete trace: `MainWindow.xaml` declares a `StackPanel` (Concept Unit
1) holding three `TextBlock`s, the middle one tagged `x:Name="WelcomeMessage"`
with no `Text`. When the app launches, `MainWindow`'s constructor runs
`InitializeComponent()`, which builds that exact tree and populates the
generated `WelcomeMessage` field (Concept Unit 3). The very next line uses
string interpolation (Concept Unit 2) to compute today's date into readable
text and assigns it to `WelcomeMessage.Text`. The window that appears on
screen is the result of all three units working together: layout, a C#
language feature, and the generated bridge between markup and code.

### What Breaks Without This
Remove `InitializeComponent();` from the constructor (comment it out) and
run the app. Real, representative failure: the app throws a
`NullReferenceException` the moment the next line tries to use
`WelcomeMessage.Text`, because without `InitializeComponent()`, the visual
tree was never built and `WelcomeMessage` was never assigned an actual
object — it's still `null`. Restore the line and the app runs correctly
again. This is the concrete proof behind Concept Unit 3's claim that
`InitializeComponent()` must run first.

### Exercises

- Change the date format string from `MMMM d, yyyy` to `MM/dd/yyyy` and
  observe the different output — then look up (or guess and verify) what
  lowercase `mm` would do differently from uppercase `MM` in a `DateTime`
  format string.
- Add a fourth `TextBlock` to the `StackPanel` with no `Margin` at all, and
  observe that it sits directly against the element above it — connecting
  back to what `Margin="0,12,0,0"` was actually doing on the others.
- In the `lab-interpolation` throwaway pattern, try interpolating an
  expression more complex than a single variable, like
  `$"{screenCount + 1}"`, and confirm C# evaluates the whole expression, not
  just a bare variable name, inside the braces.

### Definition of Done
- [ ] `MainWindow.xaml`'s `Grid` contains a `StackPanel` with three
      `TextBlock`s, matching the Updated Project shown above.
- [ ] The app runs and shows today's actual date in the welcome message —
      not a hardcoded date.
- [ ] You can explain, without looking back at this lesson, what
      `InitializeComponent()` does and why it must run before
      `WelcomeMessage.Text` is set.
- [ ] You triggered the real `f"..."` compile error from Concept Unit 2
      yourself.
- [ ] Committed with a message stating why: for example,
      `git commit -m "Replace toolchain-check window with a real home screen computing its own welcome message"`.
