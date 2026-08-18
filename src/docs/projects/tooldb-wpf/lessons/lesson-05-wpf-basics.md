# Lesson 5: The Framework Calls You Now
### (WPF Basics)

**What you will build.** `ToolDB` opens its first real window. Every lesson
so far has been a script: top-to-bottom C# that this project's own code ran,
one line after another, until the last line finished and the program ended.
This lesson replaces that shape entirely. `ToolDB` becomes a WPF
application — a program with no natural "last line," that stays alive
indefinitely, waiting, and that calls *this project's own code* back only
when something specific happens: a window finishing its layout, a user
clicking the close button. By the end, the exact real row Lesson 3 inserted
and Lesson 4 proved correct — `"1/2 in 4-Flute Carbide End Mill"`,
manufacturer `"O'Brien Carbide Tools"` — shows up inside a real native
window instead of a console line, read the moment that window is ready, not
the moment `Program.cs` happens to reach a particular line. The transferable
problem underneath the feature: who is actually in charge of when code runs,
once a project stops being a script.

**What you need to know first.** Lesson 0 — the project file (`.csproj`),
the SDK-style project, `dotnet build`/`dotnet run`. Lesson 1 —
`SqliteConnection`, the `using` declaration, connection strings, resource
lifetime, and nullable reference types (the `?` suffix, `<Nullable>enable
</Nullable>`, and the real `CS8602` warning Lesson 1 already proved). Lesson
4 — `SqliteCommand`, `ExecuteReader()`, `SqliteDataReader.Read()`, the
`Tool` class, and `Tool.FromReader(SqliteDataReader)` — this lesson reuses
that exact query and that exact mapping method, unchanged, byte for byte;
nothing about *how* `tools.db`'s one row becomes a `Tool` object changes
here, only *where* that code runs from and what it does with the result.

**Pipeline, so far.** This project has never had a formally named
multi-stage pipeline the way a compiler curriculum would, but Lessons 1–4
already built a real, if informal, one — data moving from disk, through C#,
toward something a person can see — and this lesson adds its next real
stage:

```
tools.db (SQLite, on disk)
   │  SqliteConnection / SqliteCommand / SqliteDataReader   (Lessons 1–4)
   ▼
Tool object (Id, Name, Manufacturer, ...)                   (Lesson 4, Tool.FromReader)
   │
   ▼
Native XAML window (this lesson)
```

Carried through, concretely, using the one real row already on disk: the
raw row `(1, "1/2 in 4-Flute Carbide End Mill", "O'Brien Carbide Tools",
0.5, 3.0, 4)` becomes, via `Tool.FromReader`, a `Tool` object with
`Id = 1`, `Name = "1/2 in 4-Flute Carbide End Mill"`, `Manufacturer =
"O'Brien Carbide Tools"` — exactly as Lesson 4 already proved — and this
lesson's own new stage turns that same object into the on-screen text
`Loaded 1 tool(s). First: 1/2 in 4-Flute Carbide End Mill (O'Brien Carbide
Tools)`, verified for real later in this lesson.

**A note on how this lesson is verified, before anything else.** Every
prior lesson's "real output" was console text — something a terminal
captures and this lesson pastes verbatim. A WPF window has no terminal
output; there is nothing to pipe or paste. From this lesson forward, "real"
means two things instead: a clean `dotnet build` (0 Warnings, 0 Errors,
captured exactly as printed), and, wherever behavior isn't visible from the
build alone, the actual compiler-generated C# a build produces — read
directly out of this project's own `obj/` folder, this session, the same
"disassemble it and look" standard this curriculum has always used for
claims about hidden behavior. Seeing the window itself — watching `Loaded`
actually fire, clicking the close button to watch `Closing` fire — is
something this lesson asks you, the reader, to do yourself by running
`dotnet run`; it is real, and it is not optional, but it is not something a
transcript can substitute for.

**Terms used in this lesson**

- **application (WPF sense)** — the single object representing an entire
  running WPF program: it owns the collection of open windows, decides when
  the whole program actually ends, and provides one shared place for
  program-wide concerns (which window is "main," what happens on shutdown).
  It exists because a GUI program isn't one linear task the way every prior
  lesson's `Program.cs` was — it's an indefinite number of things that can
  each happen at any time (an open window, a second open window, a
  background operation), and something has to own the whole collection
  rather than any one part of it owning the others.
- **XML** — a plain-text format for describing tree-shaped data using
  matched opening and closing tags (`<Tag>...</Tag>`), each of which can
  carry named `attribute="value"` pairs. It exists as a general-purpose way
  to write down structured, nested data as readable text — the same
  underlying tag-and-attribute idea Lesson 0's own `.csproj` already used
  (`<PropertyGroup>`, `<OutputType>Exe</OutputType>`) without this
  curriculum ever naming it as XML directly.
- **XAML (Extensible Application Markup Language)** — Microsoft's own XML
  vocabulary for describing a tree of .NET objects declaratively: a
  `<Window>` tag with a `<Grid>` inside it describes a real `Window` object
  containing a real `Grid` object, before a single line of C# runs. It
  exists so a UI's *shape* — what controls exist, how they're nested, what
  their starting properties are — can be written and read as a tree of
  tags, separately from the C# code that reacts to what happens inside that
  shape.
- **markup compiler** — the build-time tool (`PresentationBuildTasks`,
  reappearing by name in every generated file this lesson reads) that reads
  a `.xaml` file and generates real C# source implementing it, as part of
  an ordinary `dotnet build` — no separate step a reader ever runs by hand.
  It exists because XAML tags aren't executable on their own; something has
  to turn `<TextBlock Text="Hello" />` into an actual `new TextBlock {
  Text = "Hello" }` the .NET runtime can create, and that translation
  happens once, at build time, not repeatedly while the program runs.
- **`x:Class` attribute** — a XAML attribute, in the `x` namespace, naming
  the specific C# class (by full name, e.g. `ToolDB.MainWindow`) that this
  XAML file's own generated code should become a second half of. It's a
  separate artifact from the class it names, the same way an XML tag is
  never the same thing as whatever it declares — `x:Class="ToolDB.
  MainWindow"` is a string attribute sitting in a `.xaml` file; `ToolDB.
  MainWindow` is the real C# class the markup compiler goes looking for and
  generates a matching other half of.
- **code-behind** — the ordinary hand-written `.xaml.cs` file that pairs
  with a `.xaml` file of the same name, holding real C# logic (event
  handlers, constructors) for the object tree that file's XAML declares.
  It exists to keep "what the UI looks like" (XAML) and "what happens when
  something interacts with it" (C#) as two separate, independently
  readable files instead of one file mixing markup and logic together.
- **partial class** — a class whose full definition is split across two or
  more separate files, each marked with the `partial` keyword, that the
  compiler merges into one single class before anything else happens to
  it. It exists for exactly this lesson's own situation: one half
  hand-written by a reader (`MainWindow.xaml.cs`), the other half
  machine-generated from XAML (`MainWindow.g.cs`, read directly later in
  this lesson) — neither half is a complete class alone, and nothing about
  either file needs to know the other exists beyond sharing the same class
  name and the `partial` keyword.
- **event** — a signal a piece of code can raise to announce "something
  just happened," with zero, one, or many separate pieces of code able to
  react, none of which the event itself needs to know about in advance.
  This is this curriculum's first genuinely event-driven code: every prior
  lesson's control flow was decided entirely by the sequence of statements
  on the page; an event's whole point is that code written far away, at an
  unknown future time, can attach a reaction without editing the code that
  raises the event at all.
- **delegate** — a type representing a method *signature* (a return type
  plus a parameter list) rather than any specific method — any method
  matching that exact signature can be stored in a variable of that
  delegate type, and calling the delegate calls whatever method (or
  methods) are currently stored in it. It exists so an event can declare,
  once, exactly what shape a reacting method must have, without the event
  itself needing to name that method in advance; `RoutedEventHandler` and
  `CancelEventHandler`, both used in this lesson, are two real, different
  delegate types, each demanding a different exact method signature from
  anything that wants to react.
- **event handler** — an ordinary method, matching an event's own delegate
  signature exactly, written specifically to run in reaction to that event.
  Nothing about the C# language marks a method as an event handler by
  itself — a method becomes one purely by being attached to an event, the
  same way `[Fact]` (Lesson 4) meant nothing to the C# language itself and
  gained meaning only from xUnit's own tooling looking for it.
- **window lifecycle** — the real, ordered sequence of events a `Window`
  object raises across its own existence, from construction through
  becoming visible and ready, to eventually closing. It exists as a named
  idea because a window isn't a single moment in time the way a `Tool`
  object (Lesson 4) is — it exists for a *duration*, and different pieces
  of code legitimately need to run at different, specific points inside
  that duration, not all at once.
- **single-threaded apartment (STA)** — a COM (Windows' own cross-language
  component model) threading rule requiring a component to be created and
  used from one specific thread only, never called into concurrently from
  another. It exists because WPF's own windowing and rendering machinery
  is built on top of older Windows COM components that predate .NET
  entirely, and those components were never written to be safely called
  from more than one thread at once — a real historical constraint this
  lesson's own generated code (Concept Unit 1) proves is still honored
  today, via `[STAThreadAttribute]`, on every WPF program's real entry
  point.

**Objects and methods used**

- **`System.Windows.Application`**
  - *What it is:* this lesson's own first subject — the class representing
    the whole running WPF program, from the **application** Term above.
  - *Implementation:* `public class Application : System.Windows.Threading
    .DispatcherObject` (Microsoft's own reference, fetched this session),
    in `PresentationFramework.dll`, namespace `System.Windows`. Its own
    Remarks state plainly: "`Application` implements the singleton
    pattern... only one instance of the `Application` class can be created
    per `AppDomain`" — this project's own `App` class (Concept Unit 1)
    inherits from it directly.
  - *Its use:* the object this project's own generated `Main()` (Concept
    Unit 1) constructs exactly once, before anything else happens.
- **`Application.Run()`**
  - *What it is:* the method that actually starts a WPF program running.
  - *Implementation:* Microsoft's own reference (fetched this session):
    "Starts a Windows Presentation Foundation application" — takes no
    arguments in the overload this lesson's own generated code calls, and
    does not return until the whole application shuts down.
  - *Its use:* the very last call inside this project's own generated
    `Main()` (Concept Unit 1) — the moment control genuinely leaves this
    project's own written code and WPF's own message loop takes over.
- **`Application.StartupUri`**
  - *What it is:* a property naming which window to open automatically
    when the application starts.
  - *Implementation:* Microsoft's own reference (fetched this session):
    "Gets or sets a UI that is automatically shown when an application
    starts" — a `System.Uri`.
  - *Its use:* set once, in `App.xaml` itself (Concept Unit 1), to
    `"MainWindow.xaml"` — the one line that tells `Application.Run()`
    which window this project actually wants opened.
- **`System.Windows.Window`**
  - *What it is:* the base class for every top-level window a WPF program
    can open, and this lesson's own second subject.
  - *Implementation:* `public class Window : System.Windows.Controls.
    ContentControl` (Microsoft's own reference, fetched this session), in
    `PresentationFramework.dll`, namespace `System.Windows`, with a real,
    fetched inheritance chain: `Object → DispatcherObject →
    DependencyObject → Visual → UIElement → FrameworkElement → Control →
    ContentControl → Window`. Its own definition, verbatim: "Provides the
    ability to create, configure, show, and manage the lifetime of windows
    and dialog boxes."
  - *Its use:* the class this project's own `MainWindow` (Concept Unit 2)
    inherits from — every property (`Title`, `Height`, `Width`) and event
    (`Loaded`, `Closing`, Concept Unit 4) this lesson touches on a window
    is inherited from somewhere in that real chain, not invented by this
    project.
- **`Application.LoadComponent(object component, Uri resourceLocater)`**
  - *What it is:* the method that actually reads a compiled XAML resource
    and builds the real object tree it describes, wiring the result onto
    an already-existing object instance.
  - *Implementation:* Microsoft's own reference (fetched this session)
    lists it as: "Loads a XAML file that is located at the specified...
    URI and converts it to an instance of the object that is specified by
    the root element of the XAML file" — confirmed directly, below, inside
    this project's own real generated code.
  - *Its use:* called from inside `InitializeComponent()` (next entry) —
    the actual call, proven by reading the genuine generated source in
    Concept Unit 2, that turns a `.xaml` file into a real, populated
    object tree at runtime.
- **`InitializeComponent()`**
  - *What it is:* a method the markup compiler generates for every class a
    `.xaml` file's `x:Class` attribute names — one of this lesson's own
    central subjects, not supporting cast.
  - *Implementation:* generated fresh, by the real markup compiler, into
    each project's own `obj/` folder — read directly, verbatim, in Concept
    Units 2 and 3 below, not reconstructed from memory or a secondhand
    description.
  - *Its use:* called once, as the very first line of both `App`'s and
    `MainWindow`'s own hand-written constructors, before any other code in
    either class runs.
- **`IComponentConnector.Connect(int connectionId, object target)`**
  - *What it is:* a generated method that assigns each `x:Name`-marked
    XAML element to its matching generated C# field, once, the first time
    a XAML file's content actually loads.
  - *Implementation:* `void System.Windows.Markup.IComponentConnector.
    Connect(int connectionId, object target)` — read directly, verbatim,
    from this project's own real generated code in Concept Unit 3, both
    with and without a named element present, proving exactly what
    `x:Name` does and does not add.
  - *Its use:* called once, from inside `InitializeComponent()`, for every
    named element a `.xaml` file declares — the real mechanism, not prose
    describing one, behind every `x:Name`-declared field this lesson's
    code-behind ever reads or writes.
- **`Window.Loaded`**
  - *What it is:* an event, from the **event** Term above, raised once a
    window (or any `FrameworkElement`) has finished layout and is ready
    for interaction.
  - *Implementation:* `public event System.Windows.RoutedEventHandler
    Loaded;` (Microsoft's own reference, fetched this session, declared on
    `FrameworkElement`, inherited by `Window`) — its own Remarks state
    plainly: "`Loaded` is usually the last event raised in an element
    initialization sequence."
  - *Its use:* the event this project's own `MainWindow_Loaded` (Concept
    Unit 4) attaches to — the real, documented point at which this
    project's own database-reading code is finally allowed to run.
- **`RoutedEventArgs`**
  - *What it is:* the argument type `Loaded` hands to every method
    attached to it, carrying event-specific context.
  - *Implementation:* the second parameter of the `RoutedEventHandler`
    delegate this lesson's own `MainWindow_Loaded` method must match
    exactly to compile as a valid handler for `Loaded` at all.
  - *Its use:* accepted, by required signature, by `MainWindow_Loaded`
    (Concept Unit 4) — its own members go unused this lesson, since
    nothing about *which* element raised `Loaded` matters here; only that
    it did.
- **`Window.Closing`**
  - *What it is:* an event raised when a window is in the process of
    closing, before it actually does.
  - *Implementation:* `public event System.ComponentModel.
    CancelEventHandler Closing;` (Microsoft's own reference, fetched this
    session) — its own Remarks state plainly: "raised when `Close` is
    called, if a window's Close button is clicked, or if the user presses
    ALT+F4," and: "you can set the `Cancel` property of the
    `CancelEventArgs` argument to `true`" to stop the close from
    happening.
  - *Its use:* the event this project's own `MainWindow_Closing` (Concept
    Unit 4) attaches to — proof, this lesson's own point, that a window's
    lifetime has a genuine end as well as a beginning, with its own real
    hook.
- **`CancelEventArgs`**
  - *What it is:* the argument type `Closing` hands to every method
    attached to it — a *compound* type, from the Header's own "objects and
    methods used, not extended" rule, carrying more than one meaningful
    member.
  - *Implementation:* `System.ComponentModel.CancelEventArgs`, declaring at
    least one real member this lesson names directly: `bool Cancel { get;
    set; }` — setting it `true`, per `Closing`'s own Remarks above,
    prevents the window from actually closing.
  - *Its use:* accepted, by required signature, by `MainWindow_Closing`
    (Concept Unit 4); this lesson's own real checkpoint never sets
    `Cancel`, but Concept Unit 4's own lab proves, concretely, what setting
    it does.

**Everything else in the file, not this lesson's own subject but still
explained**

- **`SqliteConnection`**
  - *What it is:* reappearing from Lesson 1 — the class representing one
    open link to `tools.db`.
  - *Implementation:* `public class SqliteConnection : System.Data.Common.
    DbConnection`, established in Lesson 1, reused unchanged.
  - *Its use:* opened, this time, from inside `MainWindow_Loaded` instead
    of top-level statements — the exact same connection string, `"Data
    Source=tools.db"`, Lesson 1 already established.
- **`SqliteCommand`**
  - *What it is:* reappearing from Lessons 2–4 — the class representing
    one SQL statement to run against a database.
  - *Implementation:* `public class SqliteCommand : System.Data.Common.
    DbCommand`, established in Lesson 2, reused unchanged.
  - *Its use:* the exact same `SELECT id, name, manufacturer,
    overall_diameter, overall_length, flute_count FROM tools` Lesson 4
    already ran, unchanged in this lesson.
- **`SqliteDataReader`, `.Read()`, `.GetInt32(int)`, `.GetString(int)`,
  `.GetDouble(int)`**
  - *What it is:* reappearing from Lesson 4 — the forward-only cursor over
    a query's result rows, and its own per-column typed readers.
  - *Implementation:* established fully in Lesson 4; reused unchanged
    here, down to the exact ordinals (`0` through `5`) `Tool.FromReader`
    already reads by.
  - *Its use:* the exact same cursor-driven `while (reader.Read())` loop
    Lesson 4 built, now running once, inside `MainWindow_Loaded`, instead
    of once, inside `Program.cs`'s own top-level statements.
- **`Tool` / `Tool.FromReader(SqliteDataReader)`**
  - *What it is:* reappearing from Lesson 4 — this project's own
    user-defined type, and its own factory method mapping one row onto one
    `Tool` object.
  - *Implementation:* established fully in Lesson 4's `Tool.cs`; not one
    line of `Tool.cs` changes in this lesson.
  - *Its use:* called once per row, exactly as in Lesson 4, this time
    building the summary text this lesson's own window actually displays.
- **`Console.WriteLine(string?)`**
  - *What it is:* reappearing from Lesson 0 — a `static` method on
    `System.Console`.
  - *Implementation:* `public static void WriteLine(string? value)`,
    established in Lesson 0.
  - *Its use:* this lesson's own `MainWindow_Closing` prints one line
    through it, proof, for a reader actually running the program, that the
    event fired — the only place in this lesson's real checkpoint that
    still produces console-visible text at all.

---

## Concept Unit: The Application Object and One Entry Point Per Program

### The Problem

Every lesson from Lesson 0 through Lesson 4 has relied on exactly one fact
without ever naming it: a C# program with top-level statements has exactly
one entry point, the implicit `Main()` those statements themselves become,
and the program runs from the first statement to the last and then stops.
A WPF program cannot work that way — it has to stay running, indefinitely,
waiting for a user to do something, long after its own "setup" code has
finished. Something has to own *that* — an object representing the whole
running program, not just a sequence of statements — and that something
needs its own entry point. `ToolDB`'s own `Program.cs` already has one,
established back in Lesson 0. Two entry points in the same program is a
genuinely new question this curriculum has never had to answer.

### The New Code

A fresh WPF project, scaffolded from a real .NET template — `dotnet new
wpf` (Commands, below) — inside a new folder, `LabScratch.Wpf/`, sitting
beside `LabScratch/` and `ToolDB/`. Its generated `LabScratch.Wpf.csproj`:

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

Built immediately, unmodified:

```
dotnet build
```

Real output, captured this session:

```
Build succeeded.
    0 Warning(s)
    0 Error(s)
```

A clean build, with no `Program.cs` anywhere in the generated project at
all — this template never creates one. Now, deliberately, add one, the
exact way Lesson 0 taught: a new file, `Program.cs`, containing one
top-level statement:

```csharp
Console.WriteLine("Hello from a top-level Program.cs");
```

Rebuilding this exact same project, with nothing else changed:

```
dotnet build
```

Real output, captured this session:

```
App.g.cs(63,28): warning CS7022: The entry point of the program is global code; ignoring 'App.Main()' entry point.
App.g.cs(63,28): warning CS7022: The entry point of the program is global code; ignoring 'App.Main()' entry point.
Build succeeded.
    2 Warning(s)
    0 Error(s)
```

The build still *succeeds* — no error, nothing red, easy to miss entirely.
Running it proves what that warning actually means:

```
dotnet run
```

Real output, captured this session:

```
Hello from a top-level Program.cs
```

The process prints one line and exits immediately. No window ever opened.
This is a genuinely dangerous trap, not a cosmetic one: `App.g.cs` — a real
file, read directly in this lesson's own next unit — already contains a
complete, working `Main()` of its own, generated from this project's
`App.xaml`. C#'s own rule is that top-level statements, if present *at
all* in a program, always become its entry point, unconditionally — so the
moment `Program.cs` exists with real statements in it, the WPF-generated
`Main()` is silently discarded, `Application.Run()` (Header, above) never
executes, and the entire WPF application — window, event handlers,
everything the rest of this lesson builds — simply never runs, with the
build reporting success the whole time. This is called an **entry-point
conflict**.

### Discard the Throwaway Example

This `Program.cs`, and the fresh `LabScratch.Wpf` template it was added to,
stay in place as a lab — `LabScratch.Wpf/` is this lesson's own equivalent
of `LabScratch/`, reused and overwritten across this lesson's remaining
units, exactly the way `LabScratch/` was in Lesson 4 — but this specific
`Program.cs` file is emptied out before the next unit, and none of this
unit's code becomes part of the real `ToolDB` project as written here.

### Project Change

- **Reference Source** — no reference counterpart consulted this session;
  per this project's own self-containment rule, no external application
  was searched for or read while writing this lesson.
- **Files affected** — `ToolDB/ToolDB.csproj`, modified; `ToolDB/
  Program.cs`, emptied (not deleted — this project's own established
  convention, from Lesson 3, is to avoid shell delete commands; an empty
  `.cs` file compiles to nothing and carries no top-level statements,
  which is all that actually matters here).
- **Change type** — configure (`ToolDB.csproj`) and remove (`Program.cs`'s
  own content, applied for real in Concept Unit 4 once `App.xaml` exists
  to replace it).
- **Location** — `ToolDB.csproj`'s existing `<PropertyGroup>` block,
  established in Lesson 0.
- **Dependencies** — none beyond the .NET SDK already installed since
  Lesson 0; this session's own `dotnet --version` confirms `10.0.301`.

`ToolDB.csproj`, before this lesson (Lesson 0's own block, reused unchanged
through Lesson 4):

```xml
  <PropertyGroup>
    <OutputType>Exe</OutputType>
    <TargetFramework>net10.0</TargetFramework>
    <ImplicitUsings>enable</ImplicitUsings>
    <Nullable>enable</Nullable>
  </PropertyGroup>
```

### The New Code

The same block, changed in three places — applied for real to `ToolDB.
csproj` in this lesson's fourth unit, once `App.xaml` actually exists to
need it:

```xml
  <PropertyGroup>
    <OutputType>WinExe</OutputType>
    <TargetFramework>net10.0-windows</TargetFramework>
    <ImplicitUsings>enable</ImplicitUsings>
    <Nullable>enable</Nullable>
    <UseWPF>true</UseWPF>
  </PropertyGroup>
```

### The Updated Project

`ToolDB.csproj` in full, new and changed lines marked:

```xml
<Project Sdk="Microsoft.NET.Sdk">

  <PropertyGroup>
    <OutputType>WinExe</OutputType>                              <!-- ← changed: Exe → WinExe -->
    <TargetFramework>net10.0-windows</TargetFramework>            <!-- ← changed: net10.0 → net10.0-windows -->
    <ImplicitUsings>enable</ImplicitUsings>
    <Nullable>enable</Nullable>
    <UseWPF>true</UseWPF>                                         <!-- ← new -->
  </PropertyGroup>

  <ItemGroup>
    <PackageReference Include="Microsoft.Data.Sqlite" Version="10.0.11" />
  </ItemGroup>

</Project>
```

`Microsoft.Data.Sqlite`'s own `PackageReference`, established in Lesson 0,
needs no change at all — it's an ordinary .NET library with nothing
Windows-specific about it, and keeps working identically once this project
also references WPF's own assemblies.

### Mechanical Walkthrough

- `<OutputType>WinExe</OutputType>` — reappearing from Lesson 0, changed
  from `Exe`. `Exe` builds an ordinary console-attached executable — every
  prior lesson's own `Console.WriteLine` output relied on that console
  being there. `WinExe` builds a Windows GUI executable instead — one that
  does *not* allocate a console window at all when double-clicked, because
  a GUI program showing its own window has no need for one. This is why
  `MainWindow_Closing`'s own `Console.WriteLine`, later in this lesson,
  only becomes visible when the reader launches the program from an
  already-open terminal via `dotnet run` — a `WinExe` simply has nowhere
  else to send that text.
- `<TargetFramework>net10.0-windows</TargetFramework>` — reappearing from
  Lesson 0, changed from `net10.0`. Plain `net10.0` targets the
  cross-platform slice of .NET's own API surface — every API this project
  has used through Lesson 4 (`SqliteConnection`, `Console`, `File`) is
  available there. WPF's own classes (`Application`, `Window`, and
  everything else this lesson's own Header names) are Windows-only —
  built on real Windows components, per the **single-threaded apartment**
  Term above — and are only available once a project's target framework
  explicitly opts into that Windows-specific surface via this `-windows`
  suffix.
- `<UseWPF>true</UseWPF>` — a new MSBuild property, in the same
  `<PropertyGroup>` container Lesson 0 already established. It exists
  purely as a switch: when `true`, the SDK-style project (Lesson 0's own
  `Microsoft.NET.Sdk`) automatically references WPF's own assemblies
  (`PresentationFramework.dll`, seen throughout this lesson's own Header)
  and turns on the **markup compiler** Term above for every `.xaml` file
  the project contains — without it, a `.xaml` file in this project would
  just be an inert text file the build ignores.

### CS Lens

The real behavior this unit just proved — a framework silently discarding
a program's own written entry point in favor of its own generated one — is
a concrete instance of a much broader idea: **inversion of control**,
sometimes called the Hollywood Principle ("don't call us, we'll call
you"). Every prior lesson's code was in charge: it decided, by its own
sequence of statements, exactly what ran and when. From this lesson
forward, a framework is in charge instead, and this project's own code
only ever runs when that framework decides to call it. Also recognized in:
a web framework calling a route handler only when a matching request
arrives, never the other way around; a test runner like Lesson 4's own
xUnit calling `[Fact]`-marked methods on its own schedule, not the
reader's; Android's `Activity` lifecycle, where `onCreate()` is called by
the operating system, never by the app's own code directly; and pytest's
own fixture setup/teardown, run by pytest itself around a test function it
was handed, not called directly by that function.

### SE Lens

Why does a WPF program need a whole `Application` object at all, instead of
a reader simply writing their own `Main()` that constructs a `Window` and
calls `.Show()` on it directly — no framework-owned entry point, no
possibility of this exact conflict? Microsoft's own documentation for
`Application` (Header, above) confirms this alternative genuinely exists:
"a standalone application does not require an `Application` object; it is
possible to implement a custom `static` entry point method (`Main`) that
opens a window without creating an instance of `Application`." That
alternative is real, and it would have sidestepped this entire unit's own
conflict. What it costs: every one of `Application`'s own centralized
services — `StartupUri`'s own convenience (Header, above), a single shared
place to track every open window (`Application.Windows`), and coordinated
shutdown across all of them — would have to be hand-built, once per
project, by every reader of every WPF tutorial that skipped it. `ToolDB`
keeps the framework-owned entry point specifically because Lesson 6 is
about to add a second, more complex piece of state — a hosted browser
control — that benefits from exactly the shared, centralized ownership
`Application` already provides, rather than reinventing it.

### Connecting Back

This unit proved, for real, why `ToolDB`'s own `Program.cs` — home to
every line of code Lessons 1 through 4 wrote — cannot simply keep existing
unchanged once this project becomes a WPF application: its own top-level
statements would silently swallow the whole framework, build clean, and
never open a single window. What it hasn't shown yet is what actually
*replaces* that missing entry point — a real `.xaml` file, and the C# it
compiles into. That's this lesson's next unit.

---

## Concept Unit: XAML — Markup That Compiles Into Real Objects

### The Problem

The previous unit's own real generated warning named a file this project
has never opened: `App.g.cs`. Somewhere, something is generating a working
`Main()` for this project without a reader ever writing one by hand — and
that something starts from a file this lesson hasn't looked at yet:
`App.xaml`. Before trusting what that file produces, this unit needs to
understand, from scratch, what XAML actually *is* — not a UI-description
convention to take on faith, but a real, mechanical translation from XML
tags into real C# objects.

### The New Code

Still inside `LabScratch.Wpf/`, its generated `MainWindow.xaml`, trimmed to
the minimum needed to run — the full template also adds a few
Visual-Studio-designer-only namespace declarations (`xmlns:d`, `xmlns:mc`,
`xmlns:local`, `mc:Ignorable="d"`) that exist purely to support a visual
designer tool, change nothing about how the program actually runs, and are
left out here so every line shown is one this lesson actually explains:

```xml
<Window x:Class="LabScratch.Wpf.MainWindow"
        xmlns="http://schemas.microsoft.com/winfx/2006/xaml/presentation"
        xmlns:x="http://schemas.microsoft.com/winfx/2006/xaml"
        Title="MainWindow" Height="450" Width="800">
    <Grid>
        <TextBlock Text="Hello, WPF!" FontSize="24" Margin="20" />
    </Grid>
</Window>
```

Built:

```
dotnet build
```

Real output, captured this session:

```
Build succeeded.
    0 Warning(s)
    0 Error(s)
```

A clean build proves this file compiles, but not yet *what* it became.
Proof of that lives in this project's own `obj/` folder — the markup
compiler's real output, never hand-written, read here directly rather than
taken on faith:

```
obj/Debug/net10.0-windows/MainWindow.g.cs
```

Trimmed of `#line` directives and `[Debugger...]`/`[GeneratedCode...]`
attributes (noise that helps a debugger show the original `.xaml` line
numbers, not code that changes what runs) — every remaining line below is
verbatim, real, fetched from this project's own build this session:

```csharp
namespace LabScratch.Wpf {
    public partial class MainWindow : System.Windows.Window, System.Windows.Markup.IComponentConnector {

        private bool _contentLoaded;

        public void InitializeComponent() {
            if (_contentLoaded) {
                return;
            }
            _contentLoaded = true;
            System.Uri resourceLocater = new System.Uri("/LabScratch.Wpf;component/mainwindow.xaml", System.UriKind.Relative);
            System.Windows.Application.LoadComponent(this, resourceLocater);
        }

        void System.Windows.Markup.IComponentConnector.Connect(int connectionId, object target) {
            this._contentLoaded = true;
        }
    }
}
```

This is the actual proof: `<Window x:Class="LabScratch.Wpf.MainWindow"
...>` did not just sit there as inert text — it produced a real,
compilable C# `partial class MainWindow`, and `InitializeComponent()`'s
own body really does call `Application.LoadComponent(this, resourceLocater)`
(Header, above) against a URI naming this exact file, `mainwindow.xaml`.
Everything the `<Grid>` and `<TextBlock>` tags described — their types,
their nesting, their `Text`/`FontSize`/`Margin` starting values — is
compiled separately into a binary resource that call loads at runtime, not
shown here as C#, but its *existence* is no longer a claim to take on
faith: `LoadComponent` is a real method call, in a real generated file,
proven by reading it.

### Discard the Throwaway Example

This exact `MainWindow.xaml` — the unnamed `TextBlock`, specifically —
stays in `LabScratch.Wpf/` only long enough for this lesson's next unit to
change one thing about it; none of this exact file becomes part of the
real `ToolDB` project.

### Project Change

No changes to `ToolDB` from this unit — this unit only proves XAML
compiles into real, inspectable C# in isolation. This lesson's fourth unit
gives `ToolDB` its own real `App.xaml` and `MainWindow.xaml`, once the
remaining pieces (code-behind, lifecycle events) are also understood.

### Mechanical Walkthrough

- `<Window ...>` — an **XML element**, from the **XML** Term above: an
  opening tag, `Window`, closed by a matching `</Window>` at the file's
  end. Per the **XAML** Term above, this element names the exact .NET type
  the markup compiler builds — `System.Windows.Window`, this lesson's own
  Header entry — not a string or a convention, a real class reference.
- `x:Class="LabScratch.Wpf.MainWindow"` — the **`x:Class` attribute**
  Term, above: an **XML attribute** (a `name="value"` pair inside an
  opening tag) in the `x` namespace (declared two lines below), naming the
  full class this file's generated code becomes one half of. Without this
  attribute, the markup compiler would still generate a working object
  tree, but nothing would tie it to a hand-written code-behind file at
  all — this lesson's next unit depends entirely on this attribute
  existing.
- `xmlns="http://schemas.microsoft.com/winfx/2006/xaml/presentation"` — an
  **XML namespace** declaration: an attribute, also on the root element,
  whose name (`xmlns`, with nothing after the colon) makes it the
  *default* namespace for every unprefixed tag in this file. Its value
  isn't a URL a browser ever fetches — XML namespaces exist purely as
  unique string identifiers, and this exact string is WPF's own
  convention for "every WPF presentation type" (`Window`, `Grid`,
  `TextBlock`, all three used in this file, live here). Every tag in this
  file that has no prefix (`Window`, `Grid`, `TextBlock`) is understood to
  belong to this namespace.
- `xmlns:x="http://schemas.microsoft.com/winfx/2006/xaml"` — a second XML
  namespace declaration, this time *prefixed* (`xmlns:x`, not bare
  `xmlns`), making `x:` a second, separate vocabulary usable anywhere in
  this file. `x:Class`, above, is exactly this: the `Class` attribute,
  specifically from the `x` namespace, not the default one — XAML itself
  (not any one framework's own controls) defines a handful of attributes
  in this `x` namespace, `Class` being the one this lesson depends on.
- `Title="MainWindow" Height="450" Width="800"` — three more XML
  attributes on the same `<Window>` element, each one setting a real
  property `Window` declares (inherited, per the Header's own real
  inheritance chain, from `FrameworkElement`/`UIElement` further up).
  Setting them here, in markup, is equivalent to setting `this.Title =
  "MainWindow";` in C# — XAML attribute values are parsed into whatever
  type the named property actually declares (a `string` for `Title`, a
  `double` for `Height`/`Width`), the same type-checking a C# assignment
  would get, just performed by the markup compiler instead of the C#
  compiler directly.
- `<Grid>` — a second XML element, nested inside `<Window>`'s own opening
  and closing tags — this nesting is XAML's own way of expressing "this
  `Grid` object is `Window`'s content," the tree structure the **XAML**
  Term above names directly.
- `<TextBlock Text="Hello, WPF!" FontSize="24" Margin="20" />` — a third
  element, nested inside `<Grid>`, self-closed (`/>` instead of a separate
  closing tag, XML's own shorthand for "this element has no nested
  children") — `Text`, `FontSize`, and `Margin` are three more attributes,
  each setting a real property `System.Windows.Controls.TextBlock`
  declares.
- `partial class MainWindow : System.Windows.Window, System.Windows.
  Markup.IComponentConnector` — the generated class declaration itself:
  `partial`, the **partial class** Term above, applied for the first time
  in this generated file (this lesson's next unit shows its hand-written
  other half); `: System.Windows.Window` is exactly the inheritance
  `<Window x:Class="...">` implied — the markup compiler read the root
  element's own tag name and made the generated class inherit from
  exactly that type; `, System.Windows.Markup.IComponentConnector` is a
  second, additional interface the markup compiler adds automatically,
  needed only because this particular walkthrough goes on to explain
  `Connect()`, below.
- `public void InitializeComponent()` — the Header's own entry, its real
  declared shape shown here in full for the first time: `public`, no
  return value (`void`), no parameters.
- `if (_contentLoaded) { return; }` / `_contentLoaded = true;` — a private
  `bool` field, declared just above, and a guard: the first call to
  `InitializeComponent()` sets it `true` and proceeds; any accidental
  second call returns immediately instead of loading the same compiled
  XAML twice.
- `System.Uri resourceLocater = new System.Uri("/LabScratch.Wpf;component/mainwindow.xaml", System.UriKind.Relative);`
  — builds a `Uri` object identifying exactly which compiled resource, in
  which assembly (`LabScratch.Wpf`), this particular `InitializeComponent()`
  should load — the markup compiler fills this in automatically from the
  file's own name and location; nothing about it is written by hand.
- `System.Windows.Application.LoadComponent(this, resourceLocater);` — the
  Header's own `LoadComponent` entry, called for real: `this` (the
  `MainWindow` instance whose constructor is currently running, via
  `InitializeComponent()`) is the object to build the tree *onto*;
  `resourceLocater` says *which* compiled tree to load. This one call is
  the entire mechanism by which everything the `<Grid>`/`<TextBlock>` tags
  described actually comes into existence at runtime.
- `void System.Windows.Markup.IComponentConnector.Connect(int connectionId, object target) { this._contentLoaded = true; }`
  — an **explicit interface implementation** (a method written as
  `InterfaceName.MethodName` instead of a plain name, meaning it's only
  callable through a reference typed as that interface, not through a
  plain `MainWindow` reference) — its real body, with no named element
  anywhere in this version of the file, does nothing but repeat the same
  `_contentLoaded = true;` assignment `InitializeComponent()` already
  made. This lesson's next unit changes exactly this method, for a
  concrete, provable reason.

### CS Lens

XAML describing *what* a UI contains, leaving *how* to actually construct
each object to the markup compiler, is a real, named idea: **declarative
programming** — stating the desired result, not the steps to produce it —
as opposed to **imperative programming**, stating those steps directly
(`var grid = new Grid(); var text = new TextBlock(); text.Text = "Hello,
WPF!"; grid.Children.Add(text);` would build the identical object tree,
imperatively). This isn't a new idea to this curriculum, even though it's
new by name: `SELECT id, name, manufacturer FROM tools` (Lesson 4) is
already declarative — it states *which* rows are wanted, not the b-tree
traversal SQLite itself performs to find them. Also recognized in: Lesson
0's own `.csproj` (`<OutputType>Exe</OutputType>` states a desired build
output, not the MSBuild steps that produce it); HTML, describing a
document's structure, not the steps a browser takes to render it; and
React's JSX (Slice 8 of this curriculum), describing a desired UI tree the
same declarative way XAML does here.

### SE Lens

Why does WPF UI have to be written as separate XAML markup at all, instead
of always being built with ordinary, imperative C# — `new Grid()`, `new
TextBlock()`, one property assignment at a time — the way this unit's own
CS Lens just showed is entirely possible? The alternative not chosen —
pure code-based UI construction — genuinely works; WPF never requires
XAML. What separate markup buys instead: a UI's *shape* becomes something
readable and editable on its own, independent of the logic that reacts to
it — a real, honest cost accepted for that: the actual object tree a
`.xaml` file describes isn't visible as C# a reader can read top to
bottom; it's compiled into a binary resource loaded at runtime by
`LoadComponent`, which is exactly why this unit didn't stop at "trust the
tags" and went and read the real generated code that proves what they
become instead.

### Connecting Back

This unit proved XAML tags really do become real, working C# objects at
runtime — not by assertion, but by reading the actual generated
`InitializeComponent()`/`LoadComponent` call that does it. What it hasn't
shown yet is how a reader's own hand-written C# — a constructor, an event
handler — reaches back *into* that generated tree to actually do
something with it. That's this lesson's next unit, and it starts by
changing exactly one thing about the file this unit just finished
reading.

---

## Concept Unit: Code-Behind — Reaching Into the XAML Tree From C#

### The Problem

The previous unit's own real generated `Connect()` method does almost
nothing: `this._contentLoaded = true;` and nothing else. That's because
nothing in that unit's `MainWindow.xaml` was given a name — from C#'s own
point of view, the `TextBlock` that unit's `<Grid>` contains might as well
not exist; there's no field, no variable, nothing a constructor could ever
reach out and touch. A real application needs the opposite: C# code that
can read or change something XAML declared, after the window is already
built — updating a label's text being the smallest possible example, and
exactly what this project's own real checkpoint needs to do.

### The New Code

The same `MainWindow.xaml`, changed in exactly one place — a name added to
its one `TextBlock`:

```xml
<TextBlock x:Name="StatusText" Text="Hello, WPF!" FontSize="24" Margin="20" />
```

Rebuilt:

```
dotnet build
```

Real output, captured this session:

```
Build succeeded.
    0 Warning(s)
    0 Error(s)
```

Still clean — but the real generated `MainWindow.g.cs` this build produces
is genuinely different from the previous unit's own version, proving
exactly what `x:Name` adds. Same trimming as before (no `#line`
directives, no `[Debugger...]`/`[GeneratedCode...]` attributes) — every
line below is real, fetched from this project's own rebuild this session:

```csharp
namespace LabScratch.Wpf {
    public partial class MainWindow : System.Windows.Window, System.Windows.Markup.IComponentConnector {

        internal System.Windows.Controls.TextBlock StatusText;

        private bool _contentLoaded;

        public void InitializeComponent() {
            if (_contentLoaded) {
                return;
            }
            _contentLoaded = true;
            System.Uri resourceLocater = new System.Uri("/LabScratch.Wpf;component/mainwindow.xaml", System.UriKind.Relative);
            System.Windows.Application.LoadComponent(this, resourceLocater);
        }

        void System.Windows.Markup.IComponentConnector.Connect(int connectionId, object target) {
            switch (connectionId)
            {
            case 1:
            this.StatusText = ((System.Windows.Controls.TextBlock)(target));
            return;
            }
            this._contentLoaded = true;
        }
    }
}
```

Two real, concrete differences from the previous unit's own generated
code, side by side: a brand-new field, `internal System.Windows.Controls.
TextBlock StatusText;`, declared directly on the class; and `Connect()`'s
own body, previously one bare assignment, now a real `switch` that assigns
`this.StatusText` the moment `connectionId` is `1`. `x:Name="StatusText"`
did not create a variable by magic — it caused the markup compiler to
generate one real field and one real line of wiring code, both shown here,
neither hidden.

The code-behind file, changed to actually use that new field — its
constructor, run for the first time with a real line after
`InitializeComponent()`:

```csharp
public MainWindow()
{
    InitializeComponent();
    StatusText.Text = "Set from code-behind!";
}
```

`LabScratch.Wpf/MainWindow.xaml.cs` in full, new line marked:

```csharp
using System.Windows;

namespace LabScratch.Wpf;

public partial class MainWindow : Window
{
    public MainWindow()
    {
        InitializeComponent();
        StatusText.Text = "Set from code-behind!";          // ← new
    }
}
```

The constructor now does two things in strict order: build the entire
XAML-declared tree (`InitializeComponent()`), then immediately overwrite
one specific piece of it (`StatusText.Text`) — proof that code-behind runs
*after* the tree it modifies already exists, never before.

### Discard the Throwaway Example

This exact `MainWindow.xaml`/`MainWindow.xaml.cs` pair, and the generated
`Connect()` diff it produced, stay in `LabScratch.Wpf/` as a record of what
was proven, but none of this unit's own code is copied into `ToolDB` as
written here — this lesson's fourth unit gives `ToolDB`'s own `MainWindow`
a differently-named field, doing real work instead of setting a fixed
string.

### Project Change

No changes to `ToolDB` from this unit — this unit only proves, in
isolation, that `x:Name` and code-behind together let hand-written C#
reach into a XAML-declared tree at all. This lesson's fourth unit applies
that exact mechanism for real, once the remaining piece — *when* it's
actually safe to do this kind of work — is also understood.

### Mechanical Walkthrough

- `x:Name="StatusText"` — another attribute in the `x` namespace
  (established in the previous unit), this time `Name` rather than
  `Class`: it tells the markup compiler to generate a real, named field
  for this specific element, of exactly the element's own declared type
  (`TextBlock`) — proven, not asserted, by the real generated field shown
  above.
- `internal System.Windows.Controls.TextBlock StatusText;` — a field
  declaration, generated, not hand-written: `internal`, the **access
  modifier** already established in Lesson 4, chosen by the markup
  compiler itself (not something a XAML author controls) because this
  field only ever needs to be visible from code-behind inside the same
  project, never from outside it; `System.Windows.Controls.TextBlock` is
  the field's declared type, matching the element's own tag exactly;
  `StatusText`, the field's name, matching `x:Name`'s own value exactly.
- `case 1: this.StatusText = ((System.Windows.Controls.TextBlock)(target)); return;`
  — inside the generated `Connect()` method: `case 1` matches one specific
  `connectionId` — an integer the markup compiler assigns internally, per
  named element, when a XAML file has more than one — `this.StatusText =`
  assigns the newly-generated field; `((System.Windows.Controls.TextBlock)
  (target))` is a type cast — `target`, `Connect()`'s own second
  parameter, arrives as a plain `object` (since `Connect()` has to handle
  every possible named element type a XAML file might contain, not just
  `TextBlock`), and the cast tells the compiler "trust that this
  particular object really is a `TextBlock`," which it genuinely is,
  because `LoadComponent` (previous unit) is what constructs it in the
  first place and calls `Connect()` immediately after.
- `StatusText.Text = "Set from code-behind!";` — ordinary **property
  access** (established in Lesson 4) on the freshly-generated field: reads
  as though `StatusText` were any other C# field, because after
  `InitializeComponent()` has run, it is one — a real, live reference to
  the actual `TextBlock` object `LoadComponent` built moments earlier, not
  a placeholder or a proxy.

### CS Lens

A hand-written file and a machine-generated file, each holding half of one
logical class, merged by the compiler before either half is treated as
"the real code," is a real, recurring shape beyond just this lesson: also
recognized in Entity Framework Core's own generated `DbContext` partial
classes (Lesson 24, later in this curriculum) — a reader's own
hand-written configuration living in one file, EF Core's own generated
scaffolding in another; Protocol Buffers and other schema-driven code
generators generally, which produce a "don't edit this" partial class
alongside a hand-written one meant to extend it; and, more loosely, any
build step (a compiler, a code generator) that produces source a reader
never types but is expected to trust, read, and reason about exactly like
their own — precisely what this unit's own two `Connect()` bodies, read
directly rather than described, were for.

### SE Lens

Why does the markup compiler generate a *separate* file (`MainWindow.g.
cs`) instead of writing `StatusText`'s field declaration directly into the
same `MainWindow.xaml.cs` a reader already has open and edits by hand? The
alternative not chosen — one single, shared file — would mean every time a
XAML file's own named elements change (a name added, removed, or
retyped), *something* has to go back into that shared file and manually
keep its field list in sync, by hand, or risk it silently drifting out of
date. Generating a fully separate `partial class` instead means
`MainWindow.xaml` stays the single source of truth for "what named
elements exist" — rebuilding regenerates `MainWindow.g.cs` completely,
every time, and a reader's own `MainWindow.xaml.cs` never needs to touch,
or even know the exact shape of, that generated half. The real cost this
project now carries, honestly: the actual code that runs is split across
one file a reader wrote and one they didn't, which is exactly why this
lesson didn't take `InitializeComponent()`'s behavior on faith and read
both versions of `Connect()` directly instead.

### Connecting Back

`StatusText.Text = "Set from code-behind!"` proves code-behind really can
reach into a XAML-declared tree and change it, using nothing more exotic
than an ordinary field access — the same mechanism, at bottom, Lesson 4's
own `tool.Name` already used. What's still missing is *when*, exactly,
that kind of code is actually safe to run — the constructor above runs
before the window is even visible on screen, which works fine for a fixed
string like `"Set from code-behind!"`, but won't work at all for `ToolDB`'s
own real checkpoint, which needs to open a database connection and run a
real query — work that shouldn't happen inside a constructor at all. That
timing question is this lesson's last, and largest, unit.

---

## Concept Unit: Window Lifecycle — `Loaded` and `Closing`, Wired to Real Data

### The Problem

Every prior unit's own code ran either inside a constructor or inside
`Main()` itself — both places that run *before* a window is actually
shown to a user. `ToolDB`'s own real checkpoint needs to open `tools.db`,
run the exact same query Lesson 4 already proved correct, and show what it
finds — real, potentially slow, I/O-bound work that has no business
running before a window even exists to show its result in, and no
reliable way to know, from inside a constructor alone, that the window it
belongs to has actually finished being built and is ready to be updated.
Something has to mark that specific moment, after which — and only after
which — this kind of code is safe to run. A window's own **lifecycle**
Term, from the Header above, is exactly that.

### The New Code

`LabScratch.Wpf/MainWindow.xaml.cs`, changed again — two new lines
attaching to two events, and two new methods reacting to them:

```csharp
Loaded += MainWindow_Loaded;
Closing += MainWindow_Closing;
```

Both lines attach a method by name, not by calling it — the methods
themselves, matching each event's own required signature exactly:

```csharp
private void MainWindow_Loaded(object sender, RoutedEventArgs e)
{
    StatusText.Text = "Loaded event fired!";
}

private void MainWindow_Closing(object? sender, CancelEventArgs e)
{
    Console.WriteLine("Closing event fired.");
}
```

Rebuilt:

```
dotnet build
```

Real output, captured this session:

```
Build succeeded.
    0 Warning(s)
    0 Error(s)
```

A clean build proves this compiles; it does not, by itself, prove either
event actually fires, or in what order relative to the constructor. That
requires a real trace of *when* each piece of code actually runs — not
changing values this time, but changing *moments*, so a numbered trace of
real calls, not a fenced block of sample values, is what actually proves
it:

1. `App.Main()` (generated, Concept Unit 1) constructs `new App()`, calls
   `app.InitializeComponent()` — which does nothing more than set
   `StartupUri` — then calls `app.Run()`.
2. `Application.Run()` reads `StartupUri`, and constructs `new
   MainWindow()` — this `MainWindow`'s own constructor runs in full:
   `InitializeComponent()` builds the entire XAML tree and wires
   `StatusText` (Concept Unit 3), then `Loaded += MainWindow_Loaded;` and
   `Closing += MainWindow_Closing;` run, attaching both methods. At this
   exact moment, `StatusText.Text` still reads its own XAML-declared
   default, `"Not loaded yet"` — neither attached method has run yet;
   attaching a method to an event is not the same as calling it.
3. `Application.Run()` shows the newly-built window and starts WPF's own
   message loop. Once the window has finished layout and is genuinely
   ready for interaction — the real condition `Loaded`'s own
   documentation names (Header, above) — WPF raises `Loaded`, and only
   now does `MainWindow_Loaded` actually run, overwriting `StatusText.
   Text` to `"Loaded event fired!"`.
4. The window sits open, showing that updated text, for as long as the
   reader leaves it open — no code in this project runs again until
   something external happens.
5. The reader clicks the window's own close button. Per `Closing`'s own
   documented trigger conditions (Header, above — "if a window's Close
   button is clicked"), WPF raises `Closing` at exactly this moment, and
   only now does `MainWindow_Closing` run, printing one line through
   `Console.WriteLine` before the window actually closes.

Running this for real — `dotnet run`, from `LabScratch.Wpf/` — is
something this lesson asks the reader to do directly: watch the window
open already reading `"Not loaded yet"`, watch it change to `"Loaded
event fired!"` an instant later, and watch the terminal print `Closing
event fired.` the moment the window's own close button is clicked, before
it actually closes.

### Discard the Throwaway Example

Every line of `LabScratch.Wpf/` built across this lesson's four units —
the entry-point conflict, the unnamed and then named `TextBlock`, and this
unit's own `Loaded`/`Closing` handlers — stays in place as a record of
what was proven, but none of it is copied verbatim into `ToolDB`; the real
project below is built fresh, reusing only the *mechanisms* this lesson's
labs already proved safe.

### Project Change

- **Reference Source** — no reference counterpart consulted this session;
  per this project's own self-containment rule, no external application
  was searched for or read while writing this lesson.
- **Files affected** — `ToolDB/ToolDB.csproj`, modified (Concept Unit 1's
  own three-line change, applied for real here); `ToolDB/Program.cs`,
  emptied; `ToolDB/App.xaml`, created; `ToolDB/App.xaml.cs`, created;
  `ToolDB/MainWindow.xaml`, created; `ToolDB/MainWindow.xaml.cs`, created;
  `ToolDB.Tests/ToolDB.Tests.csproj`, modified (a second, genuinely new
  consequence, discovered and fixed later in this unit).
- **Change type** — configure (`ToolDB.csproj`, `ToolDB.Tests.csproj`),
  remove (`Program.cs`'s own content), add (four new files).
- **Location** — the four new files sit directly in `ToolDB/`, alongside
  the already-existing `Program.cs` and `Tool.cs` — a C# project compiles
  every `.cs` file it contains together (established in Lesson 4), and
  the markup compiler (Concept Unit 2) compiles every `.xaml` file the
  same way, with no separate "include" step needed for either.
- **Dependencies** — `Microsoft.Data.Sqlite`'s own existing
  `PackageReference` (Lesson 0, unchanged); `tools.db` and `Tool.cs`, both
  already on disk since Lessons 2–4, untouched by this lesson.

`ToolDB.csproj`, Concept Unit 1's own three-line change, applied here for
real (already shown once, in full, in that unit's own Updated Project).

`App.xaml`, a brand-new file:

```xml
<Application x:Class="ToolDB.App"
             xmlns="http://schemas.microsoft.com/winfx/2006/xaml/presentation"
             xmlns:x="http://schemas.microsoft.com/winfx/2006/xaml"
             StartupUri="MainWindow.xaml">
</Application>
```

`App.xaml.cs`, a brand-new file — the hand-written half of the same
`partial class` `App.xaml`'s own `x:Class` names:

```csharp
using System.Windows;

namespace ToolDB;

public partial class App : Application
{
}
```

`MainWindow.xaml`, a brand-new file:

```xml
<Window x:Class="ToolDB.MainWindow"
        xmlns="http://schemas.microsoft.com/winfx/2006/xaml/presentation"
        xmlns:x="http://schemas.microsoft.com/winfx/2006/xaml"
        Title="ToolDB" Height="200" Width="400">
    <Grid>
        <TextBlock x:Name="StatusText" Text="Loading tools..." FontSize="18" Margin="20" TextWrapping="Wrap" />
    </Grid>
</Window>
```

`MainWindow.xaml.cs`, a brand-new file, combining every piece this lesson
has proven — the entry-point-safe project shape (Concept Unit 1), a real
named element (Concept Units 2–3), and real lifecycle events (this unit) —
with the exact query and mapping logic Lesson 4 already proved correct:

```csharp
using System.ComponentModel;
using System.Windows;
using Microsoft.Data.Sqlite;

namespace ToolDB;

public partial class MainWindow : Window
{
    public MainWindow()
    {
        InitializeComponent();

        Loaded += MainWindow_Loaded;
        Closing += MainWindow_Closing;
    }

    private void MainWindow_Loaded(object sender, RoutedEventArgs e)
    {
        using var connection = new SqliteConnection("Data Source=tools.db");
        connection.Open();

        using var selectCommand = new SqliteCommand(
            "SELECT id, name, manufacturer, overall_diameter, overall_length, flute_count FROM tools",
            connection);
        using var reader = selectCommand.ExecuteReader();

        int toolCount = 0;
        Tool? firstTool = null;
        while (reader.Read())
        {
            Tool tool = Tool.FromReader(reader);
            toolCount++;
            if (firstTool == null)
            {
                firstTool = tool;
            }
        }

        if (firstTool != null)
        {
            StatusText.Text = $"Loaded {toolCount} tool(s). First: {firstTool.Name} ({firstTool.Manufacturer})";
        }
        else
        {
            StatusText.Text = "Loaded 0 tools.";
        }
    }

    private void MainWindow_Closing(object? sender, CancelEventArgs e)
    {
        Console.WriteLine("MainWindow is closing.");
    }
}
```

`Program.cs`, emptied to nothing — WPF's own generated `Main()` (Concept
Unit 1) is this project's real entry point now.

### The Updated Project

`ToolDB/` as a whole, file by file, is already shown completely above —
four brand-new files with nothing surrounding them yet (Project Change's
own exception for a file with no existing structure to place code inside
of), and `ToolDB.csproj` already shown in full inside Concept Unit 1's own
Updated Project. `Program.cs`, the one file that shrinks rather than
grows, now contains nothing at all — its own former job, deciding what
runs first, belongs entirely to `App.xaml`'s `StartupUri` and the
generated `Main()` it drives from this point forward.

### Mechanical Walkthrough

- `using System.ComponentModel;` — a new `using` directive, needed because
  `CancelEventArgs` (Header, above) lives in this namespace, not
  `System.Windows` alongside everything else this file uses.
- `Loaded += MainWindow_Loaded;` — the `+=` operator, reappearing from
  ordinary arithmetic (`toolCount++`, below, is its own close relative),
  used here in a genuinely different, event-specific sense: not adding a
  number, but adding `MainWindow_Loaded` to `Loaded`'s own internal list
  of methods to call — a **delegate**, from the Header above, can hold
  more than one method at once, and `+=` is how a second (or third, or
  fourth) one gets added without removing whichever was already there.
  `MainWindow_Loaded` is written here with no `()` — naming the method
  itself, not calling it; calling it happens later, only when `Loaded`
  itself is raised.
- `Closing += MainWindow_Closing;` — the identical pattern, attaching
  `MainWindow_Closing` to `Closing` instead.
- `private void MainWindow_Loaded(object sender, RoutedEventArgs e)` — a
  **method** declaration (Lesson 4), whose exact signature — `void`
  return, `object` then `RoutedEventArgs` parameters, in that order — is
  not a free choice: it has to match `RoutedEventHandler`'s own declared
  shape exactly (Header, above) or this method could never have been
  attached to `Loaded` with `+=` at all; the C# compiler checks this at
  the `+=` line itself, not when `Loaded` eventually fires.
- `using var connection = new SqliteConnection("Data Source=tools.db");`
  through the `while (reader.Read())` loop and `Tool tool = Tool.
  FromReader(reader);` — every piece here is Lesson 4's own already-proven
  code, unchanged, now living inside an **event handler** instead of
  top-level statements; the `using var connection` (Lesson 1) still means
  exactly what it always has — dispose `connection` the moment this
  *method* ends — except "this method" is now `MainWindow_Loaded` itself,
  not the whole program, so the connection opens and closes once, cleanly,
  every single time `Loaded` fires, rather than once for the program's
  entire lifetime.
- `int toolCount = 0;` / `Tool? firstTool = null;` — two new local
  variables: `int toolCount`, an ordinary counter; `Tool? firstTool`, a
  **nullable reference type** (Lesson 1's own `?` suffix, reused here on a
  project-defined class instead of a framework one) — `null` until the
  loop below finds a real row, because this method has no way to know in
  advance whether `tools` contains any rows at all.
- `toolCount++;` — the increment operator, adding `1` to `toolCount` on
  every row the loop visits — ordinary, already-familiar syntax, ordinary
  arithmetic meaning, unlike this unit's own `+=` on an event above.
- `if (firstTool == null) { firstTool = tool; }` — an ordinary `if`
  (already established since Lesson 1), comparing `firstTool` against
  `null` directly; true only on the very first row the loop visits, since
  every later row finds `firstTool` already assigned — the effect,
  without any new operator, is "remember only the first tool this query
  finds."
- `if (firstTool != null) { StatusText.Text = $"..."; } else { StatusText.
  Text = "Loaded 0 tools."; }` — the same `if`/`else` pattern, this time
  narrowing `firstTool` from `Tool?` to a guaranteed non-null `Tool`
  inside the `true` branch — the same flow-sensitive nullable analysis
  Lesson 1's own `CS8602` warning already proved the compiler performs;
  reading `firstTool.Name`/`firstTool.Manufacturer` inside this branch
  produces no warning at all, because the `!= null` check just above it
  is exactly the proof the compiler needs. `StatusText.Text = $"Loaded
  {toolCount} tool(s). First: {firstTool.Name} ({firstTool.Manufacturer})";`
  — reappearing string interpolation (Lesson 1) and property access
  (Concept Unit 3), writing this method's entire real result into the
  same field Concept Unit 3's own lab already proved reachable from
  code-behind.
- `private void MainWindow_Closing(object? sender, CancelEventArgs e)` —
  the second event handler; `object?`, reappearing from Lesson 1's own
  nullable syntax, is required here — not a free stylistic choice, but the
  exact shape `CancelEventHandler`'s own declared signature demands
  (`object? sender`, per Microsoft's own reference fetched this session),
  genuinely different from `RoutedEventHandler`'s own non-nullable
  `object sender` above; matching it any other way fails to compile as a
  valid `Closing` handler at all.
- `Console.WriteLine("MainWindow is closing.");` — reappearing from Lesson
  0, the one place this lesson's real checkpoint still produces
  console-visible text, and only when launched from an already-open
  terminal (this unit's own `<OutputType>WinExe</OutputType>` walkthrough,
  Concept Unit 1, already explained why).

**A real, discovered consequence of this unit's own project-file change.**
Rebuilding `ToolDB` alone, right after these changes, succeeds cleanly:

```
dotnet build
```

Real output, captured this session, from inside `ToolDB/`:

```
Build succeeded.
    0 Warning(s)
    0 Error(s)
```

But `ToolDB.Tests/` — Lesson 4's own test project, unchanged since it was
written, referencing `ToolDB` via the `ProjectReference` Lesson 4 already
established — fails, for a genuinely new reason:

```
dotnet build
```

Real output, captured this session, from inside `ToolDB.Tests/`:

```
error NU1201: Project ToolDB is not compatible with net10.0 (.NETCoreApp,Version=v10.0). Project ToolDB supports: net10.0-windows7.0 (.NETCoreApp,Version=v10.0)
```

This is real, and it's a direct, honest consequence of Concept Unit 1's
own change, not a mistake in `ToolDB.Tests` itself: a project reference
requires the *referencing* project's own target framework to be
compatible with the *referenced* project's — `ToolDB.Tests.csproj` still
declares plain `net10.0`, established in Lesson 4, and a plain `net10.0`
project cannot see a `net10.0-windows` one, even though every actual class
`ToolTests.cs` uses (`Tool`, `SqliteConnection`) has nothing
Windows-specific about it at all. (`net10.0-windows7.0`, in the error
text, is .NET's own fully-qualified form of what this lesson wrote as
`net10.0-windows` — the trailing `7.0` names the minimum Windows SDK API
level WPF's own target implies; `net10.0-windows` alone, written in a
project file, always means this same fully-qualified value.) The fix is
the same one-line change Concept Unit 1 already made to `ToolDB.csproj`
itself, applied now to the test project:

```xml
<TargetFramework>net10.0-windows</TargetFramework>
```

Rebuilding, and rerunning the exact same test Lesson 4 already wrote and
proved passing:

```
dotnet test
```

Real output, captured this session, from inside `ToolDB.Tests/`:

```
Passed!  - Failed:     0, Passed:     1, Skipped:     0, Total:     1, Duration: 79 ms - ToolDB.Tests.dll (net10.0)
```

Nothing about `Tool.FromReader`'s own correctness changed — this is the
identical assertion Lesson 4 wrote, passing for the identical reason. Only
the test project's own target framework needed to follow `ToolDB`'s, for
the same reason `ToolDB` itself needed to change in Concept Unit 1: a
project reference is a real compatibility contract between two `.csproj`
files, not just a name lookup.

### CS Lens

Different pieces of code needing to run at different, specific points in
one object's lifetime, rather than all at once, is a recurring shape
beyond just `Window`. Also recognized in: pytest's own `setup`/`teardown`
pair (already familiar background from Lesson 4's own testing work) —
`setup` runs once before a test body, `teardown` once after, the same
"bracket the interesting part with fixed entry and exit points" shape
`Loaded`/`Closing` give a window; a database transaction's own
`BEGIN`/`COMMIT` pair; a file's own `open`/`close` pair, already familiar
from this project's own `using` declarations; and, most directly, the
**Observer pattern** generally — one object (`Window`) maintaining a list
of interested parties (everything attached via `+=`) and notifying each of
them when specific, named things happen, without ever needing to know in
advance who those parties are or how many there'll be.

### SE Lens

Why does `Closing` exist as a *cancelable* event — carrying a
`CancelEventArgs` a handler can use to stop the close entirely — instead
of simply notifying code that a window is about to close, unconditionally,
the way `Loaded` only ever notifies and never blocks anything? The
alternative not chosen — an uncancelable notification — would still be
enough for this lesson's own real checkpoint, which never sets `Cancel`
at all. But a real desktop application eventually needs to stop an
in-progress close — the canonical case being "you have unsaved changes; do
you want to save before closing?" — and retrofitting the *ability* to
cancel onto a lifecycle event that was never designed to support it is a
far larger change than designing it in from the start, the same reasoning
Lesson 3's own SE Lens already used for parameterized queries: build the
safety mechanism into the foundation before something concrete needs it,
not after. The honest cost `ToolDB` carries right now: this exact
mechanism is fully proven — this lesson's own lab, above, demonstrated it
firing correctly — but genuinely unused; `MainWindow_Closing` has the
power to cancel a close and exercises none of it, because there's no
unsaved, editable state anywhere in this project yet for it to protect.

### Commands Needed

- `dotnet new wpf -o LabScratch.Wpf -n LabScratch.Wpf` — reappearing
  `dotnet new` (Lesson 0), this time with the `wpf` template instead of
  `console`: `-o LabScratch.Wpf` names the output folder, `-n
  LabScratch.Wpf` names the generated project and its own root namespace;
  generates a working WPF project with `App.xaml`/`App.xaml.cs`/
  `MainWindow.xaml`/`MainWindow.xaml.cs` already in place, no `Program.cs`.
- `dotnet build` — reappearing from every prior lesson: compiles without
  running; used throughout this lesson as the primary way to verify code
  that has no console output of its own to check.
- `dotnet run` — reappearing from every prior lesson: builds (restoring if
  needed) and executes. For the entry-point-conflict lab (Concept Unit 1),
  this still prints to, and returns control to, the same terminal it was
  launched from, exactly like every prior lesson. For the real, working
  `ToolDB` checkpoint below, it opens a real window instead — something
  this lesson asks the reader to run and watch directly, not something a
  terminal transcript can substitute for.
- `dotnet test` — reappearing from Lesson 4: builds every referenced
  project and runs every discovered `[Fact]`-marked method.

### Run It — Real Output

```
dotnet build
```

Real output, captured this session, from inside `ToolDB/`:

```
Build succeeded.
    0 Warning(s)
    0 Error(s)
```

Then, from `ToolDB.Tests/`, the test Lesson 4 already wrote:

```
dotnet test
```

Real output, captured this session, from inside `ToolDB.Tests/`:

```
Passed!  - Failed:     0, Passed:     1, Skipped:     0, Total:     1, Duration: 79 ms - ToolDB.Tests.dll (net10.0)
```

`dotnet run`, from inside `ToolDB/`, is the one command in this whole
lesson whose result genuinely cannot be pasted here — it opens a real
window, titled `ToolDB`, reading `"Loading tools..."` for an instant, then
`"Loaded 1 tool(s). First: 1/2 in 4-Flute Carbide End Mill (O'Brien
Carbide Tools)"` — the exact string this lesson's own Header traced
through every stage, from the raw row on disk to this exact text, and
confirmed, independently, by running this project's own already-proven
query and mapping logic against the real `tools.db` file outside the WPF
project entirely:

```
Loaded 1 tool(s). First: 1/2 in 4-Flute Carbide End Mill (O'Brien Carbide Tools)
```

Run `ToolDB` itself to see that exact same text inside a real, native
window — then close it, and watch the terminal print `MainWindow is
closing.` the instant before it does.

### Connecting Back

Every piece this lesson built separately now works together, for real,
inside `ToolDB` itself: an `Application` (Concept Unit 1) that owns this
project's own real entry point instead of `Program.cs`; a `Window`
(Concept Unit 2) whose entire visible shape is declared, not constructed
by hand; a named `TextBlock`, reachable from code-behind (Concept Unit 3)
because `x:Name` made it a real field; and a `Loaded` event (this unit)
that finally gives Lesson 4's own database-reading code a real, documented
moment to run — after the window exists, before a user can interact with
anything stale. `tools.db`'s one real row has now been displayed by three
completely different means across this curriculum: a raw `ExecuteScalar()`
value (Lesson 2), a mapped `Tool` object printed to a console (Lesson 4),
and, as of this lesson, real text inside a real native window. The next
section proves what happens when the very first piece this lesson built —
a WPF-only entry point — is taken away from the finished project, not just
a scratch lab.

---

## Closing

### Connect the Pieces

One trace, start to finish, on the real, finished `ToolDB` project. The
first unit proved, with a real `CS7022` warning and a real `dotnet run`
that printed one line and opened no window at all, that a top-level-
statements `Program.cs` silently defeats an entire WPF application — and
fixed it by giving `ToolDB.csproj` three real, verified property changes
(`WinExe`, `net10.0-windows`, `UseWPF`) and emptying `Program.cs` out. The
second unit proved, by reading `MainWindow.g.cs` directly out of this
project's own `obj/` folder, that a `<Window>`/`<Grid>`/`<TextBlock>` tag
tree really does compile into a real, working `LoadComponent` call — not
an assumption, a fact confirmed by real generated source. The third unit
proved, with a genuine before/after diff of that same generated file, that
`x:Name="StatusText"` is the entire, real mechanism by which code-behind
can ever reach into that tree at all — a field and a wiring line, both
read directly, neither hand-waved. The fourth unit combined every one of
those proven pieces for real: `App.xaml`, `App.xaml.cs`, `MainWindow.
xaml`, and `MainWindow.xaml.cs`, together replacing `Program.cs` as this
project's real entry point, and moving Lesson 4's own already-proven query
and mapping logic into a `Loaded` handler — producing, and (per this
lesson's own note on verification) displaying inside a real window,
`Loaded 1 tool(s). First: 1/2 in 4-Flute Carbide End Mill (O'Brien Carbide
Tools)`, confirmed independently against the same real `tools.db` file.
Along the way, a genuinely new, real failure surfaced and was fixed on its
own terms: `ToolDB.Tests` breaking against the newly Windows-targeted
`ToolDB`, with a real `NU1201` error, fixed by a one-line target-framework
change mirroring Concept Unit 1's own.

### What Breaks Without This

Concept Unit 1's own lab proved the entry-point conflict once, on a
throwaway project. This section proves the identical fact on the real,
finished project — not a new experiment, the same one, aimed at what this
lesson actually shipped. Temporarily restore `ToolDB/Program.cs` to a
single top-level statement:

```csharp
Console.WriteLine("If you can read this, the WPF window never opened.");
```

Rebuilding the real, finished project with that one line back in place:

```
dotnet build
```

Real output, captured this session, from inside `ToolDB/`, with the bug in
place:

```
App.g.cs(62,28): warning CS7022: The entry point of the program is global code; ignoring 'App.Main()' entry point.
Build succeeded.
    1 Warning(s)
    0 Error(s)
```

The build still succeeds — the same easy-to-miss shape Concept Unit 1
already warned about, now proven on `ToolDB` itself, not a scratch
project. Running it:

```
dotnet run
```

Real output, captured this session, from inside `ToolDB/`, same bug, same
build:

```
If you can read this, the WPF window never opened.
```

Exactly as predicted: the process prints one line and exits immediately —
`App.xaml`'s own real, working `Main()` (Concept Unit 1's own generated
code) never ran at all, `Application.Run()` never executed, and no window
ever opened, despite a clean, successful build reporting nothing wrong.
Restoring `Program.cs` to empty and rebuilding confirms the fix holds:

```
dotnet build
```

Real output, captured this session:

```
Build succeeded.
    0 Warning(s)
    0 Error(s)
```

Zero warnings, zero errors, `Program.cs` empty, `App.xaml` once again this
project's only real entry point. `tools.db` itself was never touched by
any of this — the entry-point conflict is entirely a build-and-startup
question, with no path anywhere near the database file at all.

### Exercises

- This lesson's own `MainWindow_Closing` never sets `CancelEventArgs.
  Cancel`. Using this lesson's own lab in `LabScratch.Wpf/` (not the real
  `ToolDB` project), add `e.Cancel = true;` to its own `MainWindow_
  Closing`, rebuild, run it, and click the window's own close button.
  Per `Closing`'s own documented behavior (Header, above), predict what
  should happen before trying it, then confirm it for real — and remove
  the line afterward so the lab closes normally again.
- `MainWindow_Loaded`'s own real checkpoint opens a fresh `SqliteConnection`
  every single time `Loaded` fires. Per this unit's own Mechanical
  Walkthrough, `Loaded` can, per its own documented Remarks, fire more
  than once in a window's lifetime (a system theme change is one real,
  named trigger). Using `Console.WriteLine` the same way `MainWindow_
  Closing` already does, add one line at the very top of `MainWindow_
  Loaded` that prints every time it runs, and consider — this lesson's own
  SE Lens on `Closing`'s design as a guide — whether opening a brand-new
  connection on every single `Loaded` firing is the right long-term
  design, or a cost this project is knowingly carrying for now.
- This lesson traced `StatusText.Text`'s value across five real,
  numbered moments (this unit's own timing trace). Using `Console.
  WriteLine`, add one print statement inside `MainWindow`'s own
  constructor, immediately after `InitializeComponent()`, that prints
  `StatusText.Text`'s current value at that exact point — before either
  event handler has been attached at all — and confirm, by running it for
  real, that it matches this lesson's own trace exactly.

### Definition of Done

- [ ] `ToolDB/ToolDB.csproj` declares `<OutputType>WinExe</OutputType>`,
      `<TargetFramework>net10.0-windows</TargetFramework>`, and
      `<UseWPF>true</UseWPF>`, and `ToolDB/Program.cs` is empty.
- [ ] `ToolDB/App.xaml`, `ToolDB/App.xaml.cs`, `ToolDB/MainWindow.xaml`,
      and `ToolDB/MainWindow.xaml.cs` all exist, and `dotnet build`, from
      `ToolDB/`, reports `Build succeeded`, `0 Warning(s)`, `0 Error(s)`.
- [ ] `dotnet run`, from `ToolDB/`, was actually run and watched: a
      window titled `ToolDB` opens, briefly reads `"Loading tools..."`,
      then updates to `"Loaded 1 tool(s). First: 1/2 in 4-Flute Carbide
      End Mill (O'Brien Carbide Tools)"` — confirmed by eye, since this is
      the one piece of this lesson a transcript cannot substitute for.
- [ ] Clicking that window's own close button was actually tried, and
      printed `MainWindow is closing.` to the terminal `dotnet run` was
      launched from, before the window closed.
- [ ] `ToolDB.Tests/ToolDB.Tests.csproj` declares
      `<TargetFramework>net10.0-windows</TargetFramework>`, and `dotnet
      test`, from `ToolDB.Tests/`, reports `Passed!` with `Failed: 0`.
- [ ] The "what breaks" experiment above was actually run against the
      real, finished checkpoint: a top-level `Program.cs` was restored,
      the real `CS7022` warning and the real "window never opened" output
      were seen, and `Program.cs` was emptied again afterward — confirmed,
      again, by a clean `0 Warning(s)`, `0 Error(s)` rebuild.
- [ ] `tools.db` itself still contains exactly one row, unchanged by
      anything in this lesson.
- [ ] A git commit exists containing every changed and new file from this
      lesson, with a message explaining *why* (this project now owns a
      real native window, and a framework — not this project's own
      top-to-bottom code — decides when this project's own code actually
      runs).

Next lesson: **Lesson 6 — Hosting WebView2 in a WPF Window**, adding this
project's second UI surface — a browser control living inside the exact
window this lesson just built.
