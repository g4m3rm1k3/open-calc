# WPF Lesson 1: A Window Is a Class Split in Two

*(Track purpose, scope, concept-reuse rule, and cadence: `README.md` —
not restated per-lesson. Unsure what to actually type/run/create for one
of the linked concept files' own isolated examples:
`HOW-TO-RUN-EXAMPLES.md`.)*

## What C# and WPF are

**WPF** (Windows Presentation Foundation) is Microsoft's framework, built
on .NET, for building Windows desktop GUI applications — programs with
real windows, buttons, and text on screen, as opposed to a command-line
program that only prints text. **C#** ("C sharp") is the language WPF
apps are written in. It is **statically typed** and **compiled** —
"statically typed" means every variable's type is fixed and checked
*before* the program ever runs (get a type wrong, and the program refuses
to build at all, rather than failing partway through running); "compiled"
means the source code you write is translated into a different, runnable
form (machine code, here by way of .NET) by a separate step (`dotnet
build`, covered below) before it executes — both ideas are explained
properly, in the concept files below, the moment real code needs them.

## What you will build

A real, running WPF desktop application — a window with one visible
element in it — built by first reading and understanding every file
`dotnet new wpf` generates (nothing here is hand-waved as "boilerplate,
don't worry about it"), then making one real, hand-typed change to it.
The transferable problem this lesson is really about: **a WPF window is
not one file — it's a C# class whose definition is split across a markup
file and a code file, merged back into one class by the compiler**, and
until that mechanism is real to you, every WPF file layout looks like
arbitrary convention instead of a mechanism with a real reason.

## What you need to know first

Exactly three things, per this track's own stated floor (see
`README.md`): basic functions, basic data types, basic loops. Nothing
about C# or WPF. **Nothing about classes, objects, or inheritance
either** — those are general CS ideas, not C#-specific ones, but they are
still first appearances here, not assumed background, and get real,
from-scratch treatment the moment this lesson's first real code needs
them (`../concepts/csharp-classes-objects-and-fields.md`). No HTML/XML
familiarity is assumed either — XAML (below) is explained as its own
thing, not "the same shape as something you've already seen."

## Terms introduced in this lesson

> **.NET** — Microsoft's runtime, standard library, and tooling platform
> that compiled C# code runs on.

> **WPF (Windows Presentation Foundation)** — Microsoft's framework,
> built on .NET, for building Windows desktop GUI applications.

> **C#** — the statically-typed, compiled language WPF applications are
> written in.

> **dotnet CLI** — .NET's command-line tool for creating, building, and
> running projects.

> **Template (`dotnet new`)** — a named, pre-defined starting file set a
> project is scaffolded from.

> **SDK-style project (`.csproj`)** — the modern, minimal XML project-file
> format that discovers source files by folder convention instead of
> listing each one explicitly.

> **OutputType** — the `.csproj` property choosing what kind of binary a
> project compiles into (`WinExe`, `Exe`, or `Library`).

> **TargetFramework** — the `.csproj` property naming which .NET version,
> and for Windows-only APIs which OS, a project compiles against.

> **Nullable reference types** — the C# compiler feature
> (`<Nullable>enable</Nullable>`) that warns when a reference might be
> used while `null` without being checked first.

> **ImplicitUsings** — the `.csproj` setting that auto-adds a standard
> set of common `using` directives to every file.

> **UseWPF** — the `.csproj` flag telling the build system to compile
> `.xaml` files and link in the WPF framework libraries.

> **partial class** — a class whose definition is split across multiple
> files, merged into one class by the compiler before anything else is
> compiled.

> **using directive** — brings a namespace's names into scope so they
> can be written unqualified, without the full `Namespace.TypeName` path.

> **namespace** — a named grouping of related types; `System.Windows` is
> WPF's own core namespace.

> **Access modifier (`public` / `internal`)** — controls where a type can
> be used from; `public` allows use from other projects, `internal` (C#'s
> default for an unmarked top-level type) restricts use to the same
> project only.

> **Constructor** — a method with the same name as its class and no
> return type, run automatically when `new ClassName()` is called.

> **`InitializeComponent()`** — the method, generated from a window's
> `.xaml` file at build time, that constructs the real object tree the
> markup describes.

> **XAML (eXtensible Application Markup Language)** — WPF's XML-based
> markup language for declaratively describing an object tree.

> **XML namespace (`xmlns`)** — a unique string identifying which
> vocabulary of element names a markup file is using, avoiding name
> collisions between unrelated sources of elements.

> **`x:Class`** — the XAML attribute linking a markup file to the
> specific `partial class` its generated code attaches to.

> **`StartupUri`** — the `Application` property naming which window to
> construct and show automatically when the program starts.

> **Grid** — WPF's most common layout panel; a container other elements
> are placed inside.

> **TextBlock** — the standard WPF control for displaying non-editable
> text.

> **HorizontalAlignment / VerticalAlignment** — properties controlling
> how an element positions itself within the space its parent gives it.

## Concepts cataloged from this lesson

Every concept this lesson introduces has its own isolated, runnable entry
in `../concepts/` (per the rule stated in `../concepts/README.md`) — a
later lesson only skips re-teaching one of these on a **100% match**,
never on resemblance:

`csharp-classes-objects-and-fields` · `dotnet-cli-and-project-scaffolding` ·
`csproj-sdk-style-project-file` · `csharp-partial-classes` ·
`csharp-namespaces-and-using-directives` · `csharp-access-modifiers` ·
`csharp-constructors` · `csharp-inheritance` · `xaml-declarative-ui-markup` ·
`wpf-layout-panels-and-controls`

`csharp-classes-objects-and-fields` in particular is worth reading first
if it's genuinely new — everything else in this lesson that mentions a
`class`, a field, `new SomeType()`, or a method assumes that file's own
vocabulary, not general familiarity with the idea.

---

## Concept Unit: The Project Manifest

*(Full standalone treatment: `../concepts/dotnet-cli-and-project-scaffolding.md`
and `../concepts/csproj-sdk-style-project-file.md`.)*

### The Problem

Before any window can exist, something has to tell the .NET tools "this
folder is a WPF application, not a console program or a class library,"
and record which version of .NET it targets.

### The Concept, Commands Run for Real

There's no smaller disposable example to isolate here — the command
itself *is* the smallest real demonstration, run for real rather than
described:

```
dotnet new wpf -n CncWpf
```

**.NET** (say "dot net") is Microsoft's platform for building and running
C# programs — a **runtime** (a program that takes compiled code and
actually executes it) bundled with a large standard library and a family of
command-line/build tools. `dotnet` is the .NET command-line tool (C#'s
rough equivalent of the `python`/`node` commands — one CLI that can
create projects, build them, and run them). `new` is the subcommand for scaffolding a new project from a
**template** — a pre-defined starting file set. `wpf` names which
template (there are others: `console`, `classlib`, `wpflib`; confirmed
by listing them first: `dotnet new list wpf` showed `wpf`, `wpflib`,
`wpfcustomcontrollib`, `wpfusercontrollib`). `-n CncWpf` names the new
project `CncWpf` — this becomes both the folder name and, as the next
unit shows, the default **namespace** every generated file uses.

**Real output:**
```
The template "WPF Application" was created successfully.

Processing post-creation actions...
Restoring C:\...\wpf-app\CncWpf\CncWpf.csproj:
  Determining projects to restore...
  Restored C:\...\wpf-app\CncWpf\CncWpf.csproj (in 59 ms).
Restore succeeded.
```
"Restoring" is .NET's equivalent of `pip install`-ing a project's
dependencies (covered properly once a real one is added — this template
has none yet) — it runs automatically after `new`, without being asked.

### Project Change

- **Reference Source** — none. This is a from-scratch C#/WPF
  fundamentals lesson, not a port of anything in `cnc-web`/`cnc-service`.
- **Files affected** — new `wpf-app/CncWpf/CncWpf.csproj`.
- **Change type** — add (generated by the `dotnet new` command above, not
  hand-typed).
- **Location** — new top-level folder `wpf-app/`, alongside the existing
  `cnc-service/`/`cnc-web/`.
- **Dependencies** — a working .NET **SDK** install (Software Development
  Kit — the .NET runtime plus the extra tools needed to *build* programs,
  not just run already-built ones; verified: `dotnet --version` →
  `10.0.301`).

### The Generated File

```xml
<Project Sdk="Microsoft.NET.Sdk">

  <PropertyGroup>
    <OutputType>WinExe</OutputType>
    <TargetFramework>net10.0-windows</TargetFramework>
    <Nullable>enable</Nullable>
    <ImplicitUsings>enable</ImplicitUsings>
    <UseWPF>true</UseWPF>
  </PropertyGroup>

</Project>
```

### Mechanical Walkthrough

- `<Project Sdk="Microsoft.NET.Sdk">` — **(a) first appearance.** A
  `.csproj` file is XML (a markup format — angle-bracket-delimited
  elements, covered properly in the next unit's own concept) describing
  *how to build this project*: what kind of program it is, which
  dependencies it needs, and which build settings apply.
  `Sdk="Microsoft.NET.Sdk"` says "build this
  using .NET's own standard build logic" — the modern, minimal
  "SDK-style" project format (older, pre-.NET-Core project files listed
  every single source file explicitly; this style discovers `.cs` files
  automatically by folder convention instead).
- `<OutputType>WinExe</OutputType>` — **(a) first appearance.** What kind
  of program this compiles into: a Windows GUI executable (no visible
  console window when run), as opposed to `Exe` (a console app, with a
  console window) or `Library` (a `.dll`, not runnable on its own).
- `<TargetFramework>net10.0-windows</TargetFramework>` — **(a) first
  appearance.** Which .NET version this project compiles against — `net10.0`
  is the .NET version installed on this machine; `-windows` is a real,
  required suffix specifically for any project using Windows-only APIs
  (WPF is Windows-only — there is no cross-platform WPF), unlocking
  Windows-specific APIs that a plain `net10.0` target wouldn't expose.
- `<Nullable>enable</Nullable>` — **(a) first appearance.** Turns on C#'s
  nullable-reference-type checking — the compiler starts warning when
  code might use a reference that could be `null` without checking first.
  Not exercised yet (no code exists), named now since it'll matter the
  moment real fields are added.
- `<ImplicitUsings>enable</ImplicitUsings>` — **(a) first appearance.**
  `using X;` (covered next unit — it brings a group of related types into
  scope so they can be referred to by short name) auto-adds a handful of
  extremely common `using` statements (`System`, `System.Linq`, etc.) to
  every file without writing them by hand — a convenience default, not
  something we'll rely
  on understanding yet.
- `<UseWPF>true</UseWPF>` — **(a) first appearance.** The one flag that
  actually makes this a WPF project instead of a plain console app: it
  tells the build system to also compile `.xaml` files (next unit) and
  link in the WPF framework libraries.

### CS Lens

Not a hard CS concept — this is build configuration, declarative data
about the project rather than an algorithm.

### SE Lens

The SDK-style format's real payoff over the older, fully-explicit
(pre-2016) project file style: adding a new `.cs` file to this folder
requires *no* project file edit at all — the build system finds it automatically by convention
(any `.cs` file under this folder). The tradeoff: implicit discovery
means a stray `.cs` file left in the folder for the wrong reason gets
compiled in too, silently — the older style's verbosity at least made
"what's actually part of this build" explicit and auditable.

### Commands

Already shown above (`dotnet new wpf -n CncWpf`). One more, to confirm
the project actually compiles before touching any code:

```
dotnet build
```
**Real output:**
```
  Determining projects to restore...
  All projects are up-to-date for restore.
  CncWpf -> C:\...\wpf-app\CncWpf\bin\Debug\net10.0-windows\CncWpf.dll
Build succeeded.
    0 Warning(s)
    0 Error(s)
```
`dotnet build` compiles the project without running it — `.dll` here
means "dynamic-link library," the compiled output file (even for an
`OutputType=WinExe` project, the actual compiled code lives in a `.dll`;
a small `.exe` stub loads and runs it — not explored further now).

---

## Concept Unit: A Class Split in Two

*(Full standalone treatment: `../concepts/csharp-classes-objects-and-fields.md`
(read this one first if "class"/"object"/"field" aren't already solid —
everything below assumes it, not general familiarity),
`../concepts/csharp-partial-classes.md`,
`../concepts/csharp-namespaces-and-using-directives.md`,
`../concepts/csharp-access-modifiers.md`,
`../concepts/csharp-constructors.md`, and
`../concepts/csharp-inheritance.md`.)*

### The Problem

Opening the generated project shows two files per window —
`MainWindow.xaml` and `MainWindow.xaml.cs` — both claiming to describe
the *same* `MainWindow`. Before reading either one, the mechanism that
lets two separate files define one real class needs to exist as a
provable fact, not an assumption.

### Introduce the Concept in Isolation

A tiny, disposable console app — not WPF, no XAML — proving the one
mechanism this all rests on: `partial`.

```csharp
// Robot.Body.cs
partial class Robot
{
    public string Name = "Rex";

    public void Greet()
    {
        System.Console.WriteLine($"{Name} says hi from Body.cs");
    }
}
```

```csharp
// Robot.Brain.cs
partial class Robot
{
    public void Think()
    {
        System.Console.WriteLine($"{Name} says hi from Brain.cs");
    }
}

class Program
{
    static void Main()
    {
        Robot r = new Robot();
        r.Greet();
        r.Think();
    }
}
```

**Real output, run this session (`dotnet run`):**
```
Rex says hi from Body.cs
Rex says hi from Brain.cs
```

**What this proves:** two separate `.cs` files, each declaring `partial
class Robot`, are really the *same* class — `Think()` (defined in
`Robot.Brain.cs`) reads `Name` (defined in `Robot.Body.cs`) with no
error, no import, no reference between the two files at all. Without
`partial` on both, this would be a compile error ("Robot" defined twice).
`partial` is a real keyword telling the compiler "don't complain that
this class is declared more than once — merge every `partial`
declaration with this same name, in this same namespace, into one class
before compiling anything else." Nothing here explains *why* WPF wants
this yet — only that the mechanism itself is real, provable, and not
magic.

### Discard

`Robot`/`Body.cs`/`Brain.cs` are deleted now. They exist only to prove
`partial` — they will not appear in the real project.

### Project Change

- **Reference Source** — none; C# language syntax, not ported from
  anywhere.
- **Files affected** — `wpf-app/CncWpf/App.xaml.cs`,
  `wpf-app/CncWpf/MainWindow.xaml.cs` (both generated, read here, not
  yet edited).
- **Change type** — read/understand (generated content).
- **Location** — project root.
- **Dependencies** — the `partial` mechanism just proven above.

### The Generated Files

```csharp
// App.xaml.cs
using System.Configuration;
using System.Data;
using System.Windows;

namespace CncWpf;

public partial class App : Application
{
}
```

```csharp
// MainWindow.xaml.cs
using System.Text;
using System.Windows;
using System.Windows.Controls;
// ...six more using lines, same shape, not yet needed...

namespace CncWpf;

public partial class MainWindow : Window
{
    public MainWindow()
    {
        InitializeComponent();
    }
}
```

### Mechanical Walkthrough

- `using System.Windows;` — **(a) first appearance.** A **using
  directive**: pulls a **namespace** (a named group of related classes —
  `System.Windows` is WPF's own core namespace, containing `Window`,
  `Application`, and everything else this lesson uses) into scope, so
  code below can write `Window` instead of the fully-qualified
  `System.Windows.Window` every time.
- `namespace CncWpf;` — **(a) first appearance.** Declares that
  everything below belongs to a namespace called `CncWpf` — matching the
  `-n CncWpf` project name from the previous unit (a convention, not a
  requirement: the project name and root namespace happen to default to
  the same string, but nothing forces them to match). This is the
  *semicolon* form (C# 10+) — everything in the rest of the file is
  implicitly inside this namespace, without an enclosing `{ }` block.
- `public partial class App : Application` — three ideas at once:
  `public` — **(a) first appearance** — an access modifier: this class
  can be used by code outside this project (as opposed to `internal`,
  C#'s default when a top-level class has no modifier written at all,
  which restricts use to code within this same project — a top-level
  class can't be scoped down to just "this file"; that's a common
  first-guess, but not how C# actually works). `partial` — **(b) hard concept reappearing**,
  just proven above with `Robot`. `: Application` — **(a) first
  appearance** — **inheritance**, full standalone treatment in
  `../concepts/csharp-inheritance.md`: `App` *is an* `Application` (a
  real WPF class from `System.Windows`), gaining every capability that
  class already has — every field and method `Application` defines is
  now usable on `App` too, with nothing re-declared here.
- `public partial class MainWindow : Window` — same three ideas,
  reapplied: **(c) already basic**, no new explanation owed for the
  *shape* — `MainWindow` inherits from `Window` instead of `Application`.
- `public MainWindow() { InitializeComponent(); }` — **(a) first
  appearance**, two ideas: this is a **constructor** — a method with the
  exact same name as its class and no return type, run automatically the
  moment `new MainWindow()` is called (proven for real by `Robot r = new
  Robot();` above, which ran `Robot`'s own default, invisible
  constructor). `InitializeComponent()` — **(a) first appearance** — a
  method call with no visible definition anywhere in this file. It isn't
  missing: it's generated by the build process from `MainWindow.xaml`
  (next unit) into a *third*, invisible `partial class MainWindow` piece
  the compiler merges in — the exact mechanism just proven with `Robot`,
  now explaining why a method with no visible body doesn't error.

### CS Lens

`partial` is a real, if unusual, instance of **separation of concerns**
at the language level rather than the usual file/module level: WPF wants
one half of a class (layout — what's on screen) authored in a markup
language suited to describing trees of visual elements, and the other
half (behavior — what happens on a click) authored in a general-purpose
language suited to logic — `partial` is the mechanism letting both exist
as one real class instead of forcing an artificial split into two
differently-named types wired together by hand.

Also recognized in: any generated-code-plus-hand-written-code pairing
(protobuf/gRPC generated stubs extended by hand in many languages),
Entity Framework's generated `DbContext` partials, ASP.NET's generated
Razor page code-behind — the same shape recurs anywhere a tool generates
one half of a type and a human maintains the other.

### SE Lens

The alternative WPF could have chosen: one single `.cs` file per window,
with the visual tree built by hand in C# (`new Grid(); grid.Children.Add(new
TextBlock { Text = "..." }); ...`) — no XAML, no `partial`, no generation
step. This is real, valid WPF (`InitializeComponent()` itself does
exactly this, generated). The cost of *not* splitting: a window with any
real layout complexity becomes a wall of imperative `new`/`.Add()` calls
with no visual shape to the code matching the visual shape on screen —
XAML's declarative, nested-element syntax (next unit) reads *like* the
tree it produces; hand-built C# doesn't. The cost `partial` pays for
that readability: two files to keep mentally associated per window,
and a generated third piece a beginner can't `Ctrl+click` into by
reading source alone (a real, if rarely painful, tooling-support edge
this project accepts).

### Commands

None new — `dotnet build` (already run, previous unit) already compiles
both halves together; a genuine mismatch would have failed it (proven
directly in this lesson's own What Breaks Without This, below).

### Run It

Not runnable standalone yet — `InitializeComponent()`'s own generated
half doesn't exist until `MainWindow.xaml` is read, next.

---

## Concept Unit: XAML — Markup That Compiles Into C#

*(Full standalone treatment: `../concepts/xaml-declarative-ui-markup.md`.)*

### The Problem

`InitializeComponent()` has to come from *somewhere* — the previous unit
named it as "generated from `MainWindow.xaml`" without yet showing that
file or explaining what generates code from it.

### Project Change

- **Reference Source** — none.
- **Files affected** — `wpf-app/CncWpf/App.xaml`,
  `wpf-app/CncWpf/MainWindow.xaml` (both generated, read here).
- **Change type** — read/understand.
- **Location** — project root.
- **Dependencies** — the `partial class`/inheritance mechanism from the
  previous unit.

### The Generated Files

```xml
<!-- MainWindow.xaml -->
<Window x:Class="CncWpf.MainWindow"
        xmlns="http://schemas.microsoft.com/winfx/2006/xaml/presentation"
        xmlns:x="http://schemas.microsoft.com/winfx/2006/xaml"
        xmlns:d="http://schemas.microsoft.com/expression/blend/2008"
        xmlns:mc="http://schemas.openxmlformats.org/markup-compatibility/2006"
        xmlns:local="clr-namespace:CncWpf"
        mc:Ignorable="d"
        Title="MainWindow" Height="450" Width="800">
    <Grid>

    </Grid>
</Window>
```

```xml
<!-- App.xaml -->
<Application x:Class="CncWpf.App"
             xmlns="http://schemas.microsoft.com/winfx/2006/xaml/presentation"
             xmlns:x="http://schemas.microsoft.com/winfx/2006/xaml"
             xmlns:local="clr-namespace:CncWpf"
             StartupUri="MainWindow.xaml">
    <Application.Resources>

    </Application.Resources>
</Application>
```

### Mechanical Walkthrough

- `<Window ...>` / `<Application ...>` — **(a) first appearance,** of
  both XAML and the XML tag syntax it's built on. **XAML** (pronounced
  "zammel," *eXtensible Application Markup Language*) is **XML**: text
  structured as nested **elements**, each written as a start tag
  (`<Window ...>`) and matching end tag (`</Window>`), with everything
  between them considered "inside" that element — the same nested,
  tagged-text shape a `<Grid>...</Grid>` a few lines down uses one level
  deeper. Here, XAML describes a real object tree rather than arbitrary
  text: the root element's *name* (`Window`, `Application`) is a real
  WPF class, and writing `<Window>...</Window>` is a declarative way of
  saying "construct a `Window` object" without writing `new Window()` in
  C# directly.
- `x:Class="CncWpf.MainWindow"` — **(a) first appearance**, the single
  most load-bearing line in the file: this is what tells the build
  system *which* `partial class` (previous unit) this markup's generated
  half belongs to. Change this to a name that doesn't match the real
  class, and the generated `InitializeComponent()` has nowhere real to
  attach — proven for real in this lesson's own What Breaks Without This,
  below.
- `xmlns="http://schemas.microsoft.com/winfx/2006/xaml/presentation"` —
  **(a) first appearance.** An XML namespace declaration — not a URL
  that's ever actually fetched (no network request happens), just a
  unique string identifying *which* vocabulary of element names
  (`Window`, `Grid`, `TextBlock`, ...) this file is using, the same way
  two different companies could both have a class named `Model` without
  colliding, as long as each lives in its own namespace.
  `xmlns:x="http://schemas.microsoft.com/winfx/2006/xaml"` is a
  *second*, separately-prefixed namespace (`x:`) specifically for XAML's
  own language-level attributes (`x:Class` above is one) — distinct from
  the *default* namespace (no prefix) used for WPF's own UI elements.
- `xmlns:d="..."` / `mc:Ignorable="d"` — **(a) first appearance**, named
  but not used yet: `d:` is the "design-time" namespace (values a visual
  designer tool reads while editing, never compiled into the running
  app); `mc:Ignorable="d"` tells a non-design-aware tool "any attribute
  prefixed `d:` is safe to ignore." Not exercised in this lesson —
  named so it isn't mistaken for something load-bearing later.
- `Title="MainWindow" Height="450" Width="800"` — **(a) first
  appearance.** XML **attributes** setting real properties on the
  `Window` object being constructed — `Title` is the text shown in the
  window's own title bar; `Height`/`Width` are its starting pixel size.
  Exactly the same idea as an HTML tag's attributes (`<img src="...">`),
  new only in that these specific attribute names correspond to real C#
  properties on the `Window` class, settable in code too
  (`this.Title = "MainWindow";`) — XAML attributes and C# property
  assignments are two syntaxes for the identical real operation.
- `<Grid>` `</Grid>` — **(a) first appearance.** A child element — WPF's
  most common **layout panel**, a container other elements go inside.
  Empty right now (nothing between the tags), which is exactly why the
  window currently shows as a blank rectangle — proven directly, next
  unit, once something real is placed inside it.
- `StartupUri="MainWindow.xaml"` (on `<Application>` only) — **(a) first
  appearance.** Tells the application which window to construct and show
  automatically the moment the program starts — the real answer to "how
  does `MainWindow` ever get shown at all," since nothing in
  `MainWindow.xaml.cs` itself calls `new MainWindow().Show()`.

### CS Lens

This is the same **declarative vs. imperative** distinction the main
track's own `declarative-vs-imperative-queries.md` already names for SQL
vs. hand-rolled loops, reapplied to UI construction: XAML states *what*
the object tree should look like; the generated code it compiles into
is the *how* (a real sequence of `new Grid(); this.Content = grid; ...`
calls), same as a SQL query states *what* rows to return while a query
planner decides *how*.

### SE Lens

The real reason WPF uses a separate markup language instead of just
letting `MainWindow.xaml.cs` build the tree directly in C# (both are
real, valid ways to construct the same objects): a nested element
structure in XAML visually mirrors the nested visual structure it
produces on screen, which a flat sequence of `new`/`.Add()` calls in C#
does not — and, not exercised in this lesson but real: XAML can be
edited by a visual designer tool that never has to understand C#
control flow at all, only object trees.

### Commands

None new.

### Run It

Not independently runnable — an empty `<Grid>` produces a blank window,
proven directly in the next unit once something real is inside it.

---

## Concept Unit: Adding a Real Element

*(Full standalone treatment: `../concepts/wpf-layout-panels-and-controls.md`.)*

### The Problem

Every file so far was generated, not typed — read to understand the
mechanism, never proven as something *you* changed. A real change,
rebuilt and rerun, is what actually closes the loop.

### The New Code

```xml
<TextBlock Text="Hello, WPF" FontSize="24" HorizontalAlignment="Center" VerticalAlignment="Center" />
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
        <TextBlock Text="Hello, WPF" FontSize="24" HorizontalAlignment="Center" VerticalAlignment="Center" />
    </Grid>
</Window>
```
The window now has one real, visible child: a `Grid` (still the only
direct child of `Window`, unchanged) containing one `TextBlock`,
centered both ways.

### Mechanical Walkthrough

- `<TextBlock ... />` — **(a) first appearance.** A real WPF element —
  the standard control for displaying a run of non-editable text. The
  trailing `/>` (instead of a separate closing `</TextBlock>`) is a
  **self-closing tag** — **(a) first appearance** of this specific XML
  shape: legal only when an element has no children, purely a shorter
  way to write `<TextBlock ...></TextBlock>` with nothing between the
  tags.
- `Text="Hello, WPF"` — **(a) first appearance** of this specific
  property, **(c) already basic** as an attribute in general (same
  mechanism as `Title`/`Height`/`Width`, previous unit): the actual
  string this element displays.
- `FontSize="24"` — **(c) already basic**, same attribute mechanism,
  a different property.
- `HorizontalAlignment="Center"` / `VerticalAlignment="Center"` — **(a)
  first appearance** of these two specific properties: how this element
  positions itself *within* the space its parent (`Grid`) gives it —
  `Center` on both means the text sits in the middle of the window
  regardless of the window's own size, rather than defaulting to the
  top-left corner.

### Execution Trace

No loop, recursion, short-circuiting search, or carried-state branch in
this unit — one element with four static attribute assignments,
constructed once. Execution Trace not applicable.

### CS Lens

Not a hard CS concept — setting properties on a newly-constructed
object, the same idea as the `Window`'s own `Title`/`Height`/`Width` in
the previous unit, applied to a different, nested object.

### SE Lens

`HorizontalAlignment`/`VerticalAlignment="Center"` versus the
alternative (leaving them unset, then centering by calculating exact
`Margin` pixel offsets by hand) is a real, small instance of a bigger
WPF theme not fully explored yet: WPF's layout system is designed to
*react* to available space (a resized window keeps the text centered,
automatically, with zero extra code) rather than pin elements to fixed
coordinates the way an older, simpler UI toolkit might. Not proven
live in this lesson (resizing the window is left as an exercise) —
named honestly as asserted, not yet demonstrated.

### Commands and Real Output

```
dotnet build
```
**Real output:**
```
  Determining projects to restore...
  All projects are up-to-date for restore.
  CncWpf -> C:\...\wpf-app\CncWpf\bin\Debug\net10.0-windows\CncWpf.dll
Build succeeded.
    0 Warning(s)
    0 Error(s)
```

Then, confirmed as a real, running process (not just "should work" —
started, verified, stopped, this session):
```
dotnet run
tasklist /FI "IMAGENAME eq CncWpf.exe"

Image Name                     PID Session Name        Session#    Mem Usage
========================= ======== ================ =========== ============
CncWpf.exe                   12180 Console                    1    104,812 K
```
A real Windows process, `CncWpf.exe`, actually running with the new
`TextBlock` compiled in — not described, observed.

---

## Connect the Pieces

One concrete trip through everything built in this lesson:

1. `dotnet build` reads `CncWpf.csproj`, sees `UseWPF=true`, and — beyond
   ordinary C# compilation — runs a XAML-specific build step first:
   `MainWindow.xaml` and `App.xaml` are each parsed and compiled into a
   generated `partial class` (a `.g.cs` file, never opened by hand in
   this lesson) containing an `InitializeComponent()` method that
   constructs the real object tree the markup described — for
   `MainWindow.xaml`, that's now a `Grid` containing one `TextBlock`.
2. That generated partial merges with the hand-read
   `public partial class MainWindow : Window { public MainWindow() {
   InitializeComponent(); } }` from `MainWindow.xaml.cs` — the exact
   `partial` mechanism proven with `Robot`/`Body.cs`/`Brain.cs` at the
   start of this lesson, now doing real work: one class, two files,
   merged by the compiler before either half is treated as complete.
3. `dotnet run` starts the compiled `CncWpf.exe`. `App.xaml`'s own
   `StartupUri="MainWindow.xaml"` fires automatically, constructing a
   `MainWindow` — its constructor runs, calling `InitializeComponent()`,
   which builds and attaches the real `Grid`/`TextBlock` tree the XAML
   described.
4. A real window appears on screen, titled "MainWindow," showing
   "Hello, WPF" centered — confirmed as a real OS-level process
   (`tasklist`, above), not just "the build succeeded."

## What Breaks Without This

This lesson's central claim is that `x:Class` is what really links a
XAML file to its `partial class` — not file location, not naming
convention. Broken on purpose, this session:

```
<!-- MainWindow.xaml, x:Class changed -->
<Window x:Class="CncWpf.NotTheRealClassName"
```

```
dotnet build

REAL FAILURE CAPTURED:
MainWindow.xaml.cs(21,9): error CS0103: The name 'InitializeComponent'
does not exist in the current context
```
With `x:Class` pointing at a name that doesn't match the real
`MainWindow` class, the XAML compiler generates its `InitializeComponent()`
method onto a *different*, nonexistent partial class instead — leaving
the real `MainWindow.xaml.cs` calling a method that, from the compiler's
point of view, was never generated anywhere it can see. The error
location is telling: it points at `MainWindow.xaml.cs` line 21 (the call
site), not at the XAML file where the actual mistake lives — a real,
observed instance of an error surfacing one layer away from its real
cause.

**Restored, rebuilt, verified clean:**
```
<Window x:Class="CncWpf.MainWindow"
```
```
dotnet build

Build succeeded.
    0 Warning(s)
    0 Error(s)
```

## Exercises

1. Change `FontSize="24"` to something much larger, rebuild, rerun, and
   resize the window by dragging its edge — confirm the text really does
   stay centered at every size (the `SE Lens` claim above, left
   unproven in this lesson on purpose).
2. Add a second `TextBlock` inside the same `Grid`, directly below the
   first in the XAML. Rebuild and rerun — you'll find it renders
   *on top of* the first, not below it (a real, common first surprise:
   `Grid` with no rows/columns defined stacks every child in the same
   single cell). Don't fix this yet — just observe it, and be ready to
   explain *why* once `Grid.RowDefinitions` is covered.
3. Delete the `InitializeComponent();` call from `MainWindow.xaml.cs`
   entirely (not the method — just the call) and rebuild. Predict
   whether it will compile before running the command, then compare.

## Definition of Done

- [ ] `wpf-app/CncWpf/` exists, and `dotnet build` run from inside it
      succeeds with 0 errors.
- [ ] `dotnet run` opens a real window titled "MainWindow" showing
      "Hello, WPF" centered.
- [ ] You can explain, without looking back at this lesson, what
      `partial` does and why WPF needs it — not just that it's required.
- [ ] You caused the `x:Class` mismatch error yourself, read the real
      message, and understood why it points at the `.cs` file instead of
      the `.xaml` file.
- [ ] You completed Exercises 1–3 above and observed the described real
      behavior yourself.
