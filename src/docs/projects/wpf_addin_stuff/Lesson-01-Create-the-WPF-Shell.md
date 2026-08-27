# Lesson 1: What Declares vs. What Runs — Building the WPF Shell

**What you will build.** A running Windows desktop application: a single
window with a title bar reading "Mastercam Generator" and an empty content
area underneath it. You launch it by running one build command and then
executing the compiled program. Nothing in the window responds to a click
yet — that arrives in a later lesson. What this lesson is actually about is
three things that generalize far past this one window: how a folder of
source files stops being "just C# code" and becomes a specific *kind* of
program — a windowed desktop application instead of a console program —
purely through declarative configuration, with no C# statement anywhere
saying "make this windowed"; how a markup language (XAML) describes a tree
of real objects and their property values without a single `new` keyword
appearing in the file that defines it; and how two files that never call
each other directly, and that contain no visible application logic, end up
wired into a real, running program through code the build process writes
*for* you — code you will never type, and will not find in any file you
opened to write this lesson's project.

**What you need to know first.** Nothing. This is the first lesson in this
curriculum.

**Terms used in this lesson.**

- **MSBuild** — the build engine that reads a `.csproj` file and turns C#
  source into a compiled program. It exists because compiling a real
  project is never just "run the compiler on every `.cs` file" — a project
  needs to know its target platform, which libraries it depends on, what
  kind of output to produce, and dozens of other settings, and MSBuild is
  the tool that reads a declarative description of all of that and carries
  out the actual build steps in the right order.
- **SDK-style project file** — the modern, short form of a `.csproj` file
  (as opposed to the much longer form .NET projects used before 2017).
  It exists because the old format listed every single source file by name
  inside the project file itself, which meant adding a new `.cs` file
  meant editing two places; the SDK-style format instead just says "I am
  this kind of SDK project" and lets MSBuild infer "include every `.cs`
  file under this folder" automatically.
- **PropertyGroup** — an XML element inside a `.csproj` file that holds a
  set of named build settings as child elements. It exists so build
  settings have one obvious, single place to live, grouped together,
  rather than being scattered as attributes on the root `<Project>`
  element itself.
- **OutputType** — a build setting (an MSBuild property) controlling what
  *kind* of executable the compiler produces: a console program, a
  windowed program, or a library with no entry point at all. It exists
  because the same C# compiler produces all three; something has to tell
  it which one this project is.
- **TargetFramework** — a build setting naming which .NET runtime and
  platform this project compiles against (for example, ".NET 10, and only
  the Windows-specific parts of it"). It exists because .NET runs on
  multiple operating systems, and code that touches Windows-only APIs
  (like the entire windowing system this lesson uses) has to explicitly
  opt into a Windows-flavored target or those APIs simply won't be visible
  to the compiler.
- **Nullable reference types** — a C# compiler feature (turned on here via
  `<Nullable>enable</Nullable>`) that makes the compiler track, for every
  variable of a reference type (a class type, as opposed to a primitive
  value type), whether that variable is allowed to legally hold the
  absence-of-a-value marker `null`. It exists because a variable holding
  `null` when code assumes it never can is one of the single most common
  sources of a running .NET program crashing; with this feature on, the
  compiler flags a *warning* at the exact line where a possibly-null value
  is used somewhere that assumed it couldn't be, catching that class of
  bug before the program ever runs, instead of only at the moment it
  crashes.
- **Implicit usings** — a C# project feature (turned on here via
  `<ImplicitUsings>enable</ImplicitUsings>`) that automatically makes a
  small standard set of extremely common namespaces available in every
  `.cs` file in the project, without a `using` line at the top of each
  file naming them individually. It exists purely to cut boilerplate:
  without it, nearly every C# file in existence would start with the same
  five or six identical `using System;`-style lines, repeated file after
  file, for namespaces so common they're used almost everywhere.
- **UseWPF** — a build setting that tells MSBuild "this project links
  against the Windows Presentation Foundation UI libraries, and its XAML
  files need to be compiled as part of the build." It exists because most
  .NET projects are not desktop UI applications, so pulling in an entire
  UI framework's assemblies and enabling XAML compilation has to be an
  explicit opt-in, not something every project pays the cost of by
  default.
- **XAML** ("Extensible Application Markup Language") — an XML-based
  markup language for describing a tree of .NET objects and the values of
  their properties, declaratively, without writing the C# statements that
  would construct that same tree by hand. It exists because a UI is
  fundamentally a nested tree of objects (a window contains a layout
  container, which contains controls, which contain more controls), and
  writing that tree out as nested markup tags reads far closer to how a
  person visually pictures a UI's structure than the equivalent chain of
  `new SomeType()` constructor calls and property assignments would.
- **XML element** — a markup unit written as a tag, either paired
  (`<Grid>...</Grid>`) or self-closing (`<Grid/>`), that XAML uses to
  represent one object being created. It exists as XML's basic building
  block for describing nested, tree-shaped data — which is exactly the
  shape a UI's object graph has.
- **XML attribute** — a `name="value"` pair written inside an element's
  opening tag (for example `Title="Mastercam Generator"`). In XAML, an
  attribute on an element maps onto setting a property of the object that
  element represents. It exists as XML's mechanism for attaching simple,
  single-value data to an element, which XAML repurposes specifically to
  mean "set this property to this value."
- **XML namespace declaration (`xmlns`)** — an attribute on a root XML
  element that tells a parser which vocabulary of element and attribute
  names is valid inside this document, identified by a URI string (a
  unique name, not necessarily a real fetchable web address). It exists
  because XML by itself has no idea what `<Grid>` or `<Window>` mean; the
  `xmlns` declaration is what tells the WPF XAML parser "resolve tag names
  in this document against the WPF presentation vocabulary," the same way
  a `using` directive tells the C# compiler which namespace an unqualified
  type name should resolve against.
- **`x:Class` directive** — a special XAML attribute, from XAML's own
  reserved `x:` namespace (not the WPF presentation namespace), that names
  the specific C# class this markup file is paired with. It exists to make
  the link between a markup file and its code-behind class explicit and
  checkable by the compiler, rather than left to guesswork from matching
  file names alone.
- **namespace** — a C# keyword that groups a set of related types under one
  shared name, used to avoid naming collisions between types that happen
  to share a short name but come from different parts of a codebase (or
  different libraries entirely). It exists because in a program built from
  many files and many libraries, two unrelated things being named the same
  short name (`Window`, `Grid`, `Application`) is common; a namespace lets
  both exist without conflict, distinguished by their full name
  (`MastercamGenerator.MainWindow` vs. `System.Windows.Window`).
- **class** — a C# keyword declaring a blueprint for objects: a named type
  that specifies what fields, properties, and methods every object built
  from it will have. A class is not itself a running thing — it is the
  template; an actual object built from that template (an *instance*) is
  what exists in memory while the program runs.
- **partial class** — a C# feature letting a single class's definition be
  split across two or more physical files, with the compiler merging them
  back into one class at compile time. It exists specifically for exactly
  this lesson's situation: WPF needs to generate an entire class's worth of
  code from a XAML file automatically (wiring up everything the markup
  declared), while still letting a human write ordinary hand-authored
  C# logic for that same class in a separate file — `partial` is what lets
  both halves legally be "the same class" without either file needing to
  know the other's exact contents.
- **inheritance (`: BaseType`)** — a C# syntax, written as a colon after a
  class name, declaring that this class is built *on top of* an existing
  class, automatically getting everything that base class already defines
  (its fields, properties, and methods) and then being free to add more or
  override some of it. It exists so that a large, complex capability (like
  "being a resizable window with a title bar, that the operating system
  knows how to draw and manage") can be written once, in a base class, and
  reused by every class that needs it, instead of being rewritten from
  scratch each time.
- **constructor** — a special method with the same name as its class, run
  automatically exactly once, at the moment a `new` expression creates an
  object from that class, before any other code can use that object. It
  exists to guarantee an object can never be observed in an unfinished,
  half-set-up state — whatever a constructor does is guaranteed to have
  already happened by the time anyone else gets a reference to that
  object.
- **static method** — a method that belongs to the class itself rather
  than to any one object built from that class, callable without ever
  creating an instance first (there is no "this particular object" it runs
  against). It exists for operations that are meaningful without needing
  any particular object's own state — starting an entire program, before
  a single object of any kind has been created yet, being the clearest
  possible example.
- **`[STAThread]` attribute** — a piece of metadata attached directly above
  a method declaration (here, above the generated `Main` method), read by
  the .NET runtime before that method ever runs. It exists specifically
  for Windows desktop UI code: it tells the runtime to start the program's
  main thread in "Single-Threaded Apartment" mode, a Windows COM threading
  requirement that most of the Windows UI plumbing WPF sits on top of
  depends on; without it, constructing certain Windows UI objects can fail
  outright at runtime.
- **auto-generated code** — source code written by a build tool rather
  than by a person, produced fresh from other input (here, from a XAML
  file) every time the project is built. It exists because some code is
  entirely mechanical to derive from something else already written (in
  this case, from the markup) — writing it by hand every time that markup
  changes would be repetitive, error-prone, and would drift out of sync
  with the markup it's supposed to match.
- **compiled markup resource** — the actual binary form a `.xaml` file is
  turned into during the build, embedded into the compiled program as a
  resource, and read back and turned into real objects at the moment the
  program runs (not while it's being built). It exists as a middle ground:
  parsing raw XML text every single time a window opens would be slower
  than necessary, so WPF's build step does the expensive parsing-and-
  validating work once, at build time, and leaves a form that's fast to
  turn into objects at startup.

**Objects and methods used.**

- **`Window`**
  - *What it is:* the base class for every top-level window a WPF desktop
    application shows — the thing with a title bar, a border, minimize/
    maximize/close buttons, and exactly one content area.
  - *Implementation:* `public class Window : ContentControl` in the
    `System.Windows` namespace (part of the `PresentationFramework`
    library that `UseWPF` pulls in). As a `ContentControl`, it exposes a
    single `Content` property that holds the *one* object filling its
    body.
  - *Its use:* this lesson's `MainWindow` class is built by inheriting
    from `Window` — that single line of inheritance is what turns a plain
    C# class into something the operating system will actually draw as a
    real, resizable, closable window on screen.
  - *Type:* a public class, meant to be inherited from (not sealed),
    instantiated with `new`.
  - *Responsibility:* owns the operating-system-level window handle,
    draws its own title bar/border/chrome, hosts exactly one root visual
    (via `Content`), and forwards Windows messages (resize, move, close)
    into the WPF framework's own event system.
  - *Depends on:* the WPF presentation libraries (`PresentationFramework`,
    `PresentationCore`) being present, which is exactly what `UseWPF`
    guarantees at build time.
  - *Connects to:* `Application` creates and shows the first `Window`
    named by `StartupUri`; a `Window`'s own `Content` property in turn
    holds whatever layout container (here, a `Grid`) the markup put inside
    it.
  - *Shape:* the outermost public surface of a WPF desktop app — the
    boundary between "operating system window" and "WPF object tree."
- **`Window.Title`**
  - *What it is:* a string property on `Window` controlling the text shown
    in the window's title bar.
  - *Implementation:* a settable (read/write) `string` property, backed
    internally by a WPF dependency property (a special kind of property
    WPF uses so it can be set from XAML, data-bound, and animated — not a
    concept this lesson needs beyond naming that it exists).
  - *Its use:* this lesson sets it, from XAML, to the literal text
    `"Mastercam Generator"`, which is the only visible proof, once the
    program runs, that this specific window is the one being built.
  - *Type:* an instance property (each `Window` object has its own
    `Title`, not shared across all windows).
  - *Responsibility:* holding and exposing the exact text the Windows
    title bar renders for this one window.
  - *Depends on:* nothing beyond the `Window` instance existing.
  - *Connects to:* set once here from XAML at construction; Windows'
    own window-chrome rendering reads it whenever it redraws the title
    bar.
  - *Shape:* a simple, public, single-value property — the smallest
    possible example of "an XML attribute becomes a property assignment."
- **`Window.Height` and `Window.Width`**
  - *What it is:* two `double` properties, inherited from `FrameworkElement`
    (a base class further up `Window`'s own inheritance chain), controlling
    the window's starting size in device-independent units.
  - *Implementation:* both are settable `double` properties; in this
    lesson's markup they're set to `450` and `800`.
  - *Its use:* without setting *some* starting size, WPF still picks one,
    but leaving it to a framework default is not a deliberate choice —
    this lesson sets both explicitly so the window's starting size is
    something this project's own markup states, not something inherited
    silently from whatever WPF happens to default to.
  - *Type:* instance properties, identical in shape and role to each
    other — one controls the vertical dimension, one the horizontal.
  - *Responsibility:* together, defining the window's initial pixel-ish
    size the instant it opens, before a user ever resizes it by hand.
  - *Depends on:* nothing beyond the `Window` instance existing.
  - *Connects to:* read once by the windowing system at the moment the
    window is shown; a user dragging the window's edge afterward changes
    these same two properties again, live.
  - *Shape:* ordinary public properties, set from markup exactly the same
    mechanical way `Title` is.
- **`Grid`**
  - *What it is:* a layout container — a class whose entire job is
    arranging other visual objects inside itself, here used still empty,
    as a placeholder container with nothing arranged in it yet.
  - *Implementation:* `public class Grid : Panel` in `System.Windows.
    Controls`. `Panel` is WPF's own base class for "something that holds
    and arranges more than one child object" — `Grid` specifically
    arranges children into rows and columns (unused so far in this
    lesson, since nothing has been put inside it yet).
  - *Its use:* it fills `Window.Content` — WPF's `ContentControl` (the
    base `Window` inherits from) can hold exactly one child object; a
    `Grid`, because it is a `Panel`, is itself able to hold *many*
    children. Putting an (empty, for now) `Grid` there is what makes room
    for every control a later lesson adds — without it, `Window.Content`
    could only ever hold one single object directly.
  - *Type:* a public class, instantiated with `new` in code, or, as here,
    via a XAML element.
  - *Responsibility:* owning a collection of child visual objects and
    deciding, every time it needs to redraw, where each one is positioned
    and how large it is.
  - *Depends on:* nothing beyond the WPF presentation libraries being
    referenced.
  - *Connects to:* sits inside `Window.Content`; every future control this
    curriculum adds becomes one of this `Grid`'s children.
  - *Shape:* the seam, inside this one window, between "the window frame
    itself" (owned by `Window`) and "everything the window actually shows"
    (owned by whatever sits in `Content`).
- **`Application`**
  - *What it is:* the class representing the running program as a whole —
    not any one window, but the process-wide object that exists for the
    entire lifetime of the program, from before the first window opens
    until after the last one closes.
  - *Implementation:* `public class Application` in `System.Windows`,
    instantiated exactly once per process. This lesson's `App` class
    inherits from it.
  - *Its use:* `App.xaml`/`App.xaml.cs` together define this project's
    one `Application` subclass, which is what actually gets created and
    run when the program starts.
  - *Type:* a public class, meant to be inherited from, instantiated once.
  - *Responsibility:* owning the process's message loop (the mechanism
    that waits for and dispatches every mouse click, keypress, and window
    event for the entire program), tracking every open window, and
    deciding when the whole program should exit.
  - *Depends on:* the WPF presentation libraries, same as `Window`.
  - *Connects to:* its generated `Main` method creates it and calls
    `Run()` on it; its own `StartupUri` property tells it which `Window`
    to open first.
  - *Shape:* one level above `Window` in the architecture — there is
    exactly one `Application` per running program, and potentially many
    `Window`s underneath it.
- **`Application.StartupUri`**
  - *What it is:* a property naming which XAML file's window `Application.
    Run()` should automatically create and show first.
  - *Implementation:* a settable property of type `System.Uri`; this
    lesson's `App.xaml` sets it via the XAML attribute `StartupUri=
    "MainWindow.xaml"`.
  - *Its use:* it is the entire reason a plain, otherwise-empty `App.xaml`
    file is what causes `MainWindow` specifically to appear when this
    program runs — nothing else in this lesson's code ever explicitly
    constructs a `MainWindow` object.
  - *Type:* an instance property on `Application`.
  - *Responsibility:* holding the one piece of information `Application.
    Run()` needs to know which window is "the first one."
  - *Depends on:* being set before `Run()` is called (this lesson's
    generated code, shown below, sets it inside `InitializeComponent()`,
    which runs before `Run()`).
  - *Connects to:* read once, by `Application.Run()`, at startup.
  - *Shape:* the single wire connecting the `Application` half of this
    project to the `Window` half.
- **`Application.Run()`**
  - *What it is:* the method that actually starts the program running —
    opens the `StartupUri` window and begins the message loop that keeps
    the whole program alive and responsive.
  - *Implementation:* an instance method on `Application`, called with no
    arguments, that does not return until the entire application shuts
    down (every window has closed).
  - *Its use:* it's the very last line the generated `Main` method calls —
    everything before it is setup; this one line is what actually makes a
    window appear and the program stay open instead of starting and
    immediately exiting.
  - *Type:* an instance method.
  - *Responsibility:* creating and showing the startup window, then
    blocking, dispatching Windows messages, for as long as the program
    runs.
  - *Depends on:* `StartupUri` already being set.
  - *Connects to:* called once, from the generated `Main` method; it is
    what ultimately causes `MainWindow`'s own constructor to run.
  - *Shape:* the outermost "start everything" call for the entire
    program — nothing in this lesson's own code calls anything after it.

**Everything else in the file, not this lesson's subject but still
explained.**

- **`InitializeComponent()`**
  - *What it is:* a method the build process generates — one for `App`,
    one for `MainWindow` — that does the actual work of turning that
    class's paired XAML file into real, running objects.
  - *Implementation:* on `App`, its generated body sets `StartupUri`; on
    `MainWindow`, its generated body loads the compiled markup resource
    and hands it to WPF's markup loader. Both are shown and proven, in
    full, in this lesson's fourth and fifth Concept Units.
  - *Its use:* both generated constructors (`App`'s implicit one,
    `MainWindow`'s explicit one) call it as their very first action —
    it's what makes the rest of each class's own hand-written code able to
    assume the XAML-declared object tree already exists.
  - *Type:* a generated instance method, one per partial class.
  - *Responsibility:* bridging "a compiled XAML resource exists" to "this
    object's properties and child objects are actually populated."
  - *Depends on:* the compiled markup resource for that class already
    being embedded in the build output.
  - *Connects to:* called from each class's own constructor; internally
    calls `Application.LoadComponent` (on `MainWindow`) or sets properties
    directly (on `App`).
  - *Shape:* the seam between "hand-written code-behind" and "markup-
    generated setup" — never written by a person, always read by one, once
    they know to look for it.
- **`System.Windows.Application.LoadComponent(object, System.Uri)`**
  - *What it is:* a static method that reads a compiled markup resource
    (identified by the given `Uri`) and applies it to an already-existing
    object (the `object` argument) — populating that object's properties
    and building its child object tree from the markup.
  - *Implementation:* `public static void LoadComponent(object component,
    Uri resourceLocater)`, defined on the `Application` class itself
    (called as `System.Windows.Application.LoadComponent(...)`, not
    through any particular `Application` instance — it's `static`).
  - *Its use:* this is the exact call, real and unedited, that this
    lesson's generated `MainWindow.g.cs` makes — it's the actual mechanism
    by which `<Grid></Grid>` in a XAML file becomes a real `Grid` object
    living inside a real `MainWindow`, proven in full in this lesson's
    fifth Concept Unit.
  - *Type:* a `static` method — callable through the class name directly,
    with no `Application` instance needed, because loading one component's
    markup has nothing to do with any particular running `Application`'s
    own state.
  - *Responsibility:* parsing a compiled markup resource and using it to
    build and wire up an entire object tree, attached to the object passed
    in as `component`.
  - *Depends on:* a real compiled resource existing at the given URI (which
    only exists because the build compiled this project's `.xaml` files).
  - *Connects to:* called from `MainWindow`'s generated `InitializeComponent
    ()`; internally, WPF's own markup-reading machinery does the actual
    parsing (not shown in this lesson — one layer past what this lesson's
    reveal goes).
  - *Shape:* the real, single, load-bearing line proving XAML markup is
    not silently unrolled into C# `new` statements at build time — it's
    parsed from a compiled resource, at runtime, by this one call.
- **`System.Uri`**
  - *What it is:* a general-purpose .NET class representing a URI (a
    structured way of naming a resource — a web address is one familiar
    kind, but a URI can just as well name a resource embedded inside a
    compiled program, which is exactly how it's used here).
  - *Implementation:* constructed here as `new System.Uri("/MastercamGen
    erator;component/mainwindow.xaml", System.UriKind.Relative)` — the
    string names the embedded resource's path, and `UriKind.Relative` (a
    member of the `UriKind` enum) tells the constructor this URI has no
    scheme (like `https://`) and should be resolved relative to the
    running application itself, not treated as an absolute address.
  - *Its use:* it's the value handed to `LoadComponent`, telling it
    exactly which compiled markup resource, out of potentially many in
    the same program, to load.
  - *Type:* an instance class, constructed with `new`, from the `System`
    namespace (part of the base class library, unrelated to WPF
    specifically).
  - *Responsibility:* parsing and holding a structured resource address,
    so calling code never has to hand-parse a raw string itself.
  - *Depends on:* a valid URI-shaped string at construction; throws an
    exception if given one that isn't.
  - *Connects to:* constructed once, inside `InitializeComponent()`, and
    passed straight into `LoadComponent`.
  - *Shape:* a small, general-purpose utility object — not part of WPF at
    all, just borrowed by it here.
- **`IComponentConnector` and `Connect(int, object)`**
  - *What it is:* an interface WPF's generated code implements so that,
    for a XAML element given a name (via `x:Name`), the runtime markup
    loader can call back into generated code to wire that named element up
    to a field. `Connect` is its one method.
  - *Implementation:* `void System.Windows.Markup.IComponentConnector.
    Connect(int connectionId, object target)`, implemented explicitly (the
    interface name qualifies the method name) on the generated
    `MainWindow` class.
  - *Its use:* this lesson's `MainWindow.xaml` names nothing with `x:Name`
    (its one child, the `Grid`, is unnamed), so the generated body of this
    method does nothing beyond an internal bookkeeping flag — it's shown
    here, in full, specifically *because* an empty body is real, verified
    proof that "no named elements yet" is exactly why there's nothing yet
    to connect.
  - *Type:* an interface method, explicitly implemented.
  - *Responsibility:* in general (not exercised by this lesson yet),
    matching a numeric ID the markup compiler assigned to a named XAML
    element back to the correct generated field assignment.
  - *Depends on:* being called by WPF's markup loader while parsing a
    compiled resource — never called directly by hand-written code.
  - *Connects to:* called by `LoadComponent`'s internal parsing machinery,
    once per named element it encounters, once this project's markup
    actually has any.
  - *Shape:* a hook this lesson's project has not started using yet —
    visible, real, and proven empty, not omitted.
- **`Main()` (generated)**
  - *What it is:* the actual entry point of this compiled program — the
    one method the operating system calls to start it running.
  - *Implementation:* `[System.STAThreadAttribute()] public static void
    Main()`, generated inside `App.g.cs`, with a body that constructs an
    `App`, calls its `InitializeComponent()`, and then calls `Run()`.
  - *Its use:* it's the answer to "where does this program actually
    start?" — proven, in this lesson's sixth Concept Unit, to live inside
    generated code the reader never wrote and will not find by searching
    their own hand-authored files.
  - *Type:* a `static` method — called by the operating system's process
    loader before any object in this program exists yet, so it could not
    possibly be an instance method belonging to some object.
  - *Responsibility:* the very first and very last thing this program's
    own code controls directly — creating the one `Application` object
    this process will ever have, and handing control to it.
  - *Depends on:* nothing — it is the starting point; nothing runs before
    it.
  - *Connects to:* calls `App`'s constructor, then `InitializeComponent()`,
    then `Run()`, in that order, and nothing else.
  - *Shape:* the true outermost boundary of the entire program — one level
    further out than `Application.Run()` itself, since this is what calls
    `Run()`.

---

## Concept Unit: The Project File Declares What Kind of Program This Is

### The Problem

A folder of `.cs` files is not yet any particular *kind* of program. The
same C# compiler that can produce a console program that prints to a black
text window can just as easily produce a program that opens a graphical
window with a title bar — nothing about the C# language itself says which
one you're building. Something outside the C# code itself has to say it.

> Before reading on: if you were designing a build tool from scratch, where
> would you put the setting for "this is a windowed program, not a console
> one" — inside a `.cs` file, as a line of code that runs, or somewhere
> else entirely? What's different about a setting that has to be known
> *before* any code runs, versus one a running program decides for itself?

### Introduce the Concept in Isolation

Two real project scaffolds, generated by the same tool, one command apart,
prove where that setting actually lives. Both were run for real, using
.NET SDK 10.0.301, and both are shown here exactly as generated, with
nothing edited by hand:

```
dotnet new console -n ScratchConsole
```

produced this `ScratchConsole.csproj`:

```xml
<Project Sdk="Microsoft.NET.Sdk">

  <PropertyGroup>
    <OutputType>Exe</OutputType>
    <TargetFramework>net10.0</TargetFramework>
    <ImplicitUsings>enable</ImplicitUsings>
    <Nullable>enable</Nullable>
  </PropertyGroup>

</Project>
```

while

```
dotnet new wpf -n MastercamGenerator
```

produced this `MastercamGenerator.csproj`:

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

Not one line of C# differs between what either template *could* run — the
only difference visible anywhere is these few lines of XML. That proves the
"windowed vs. console" decision is not a runtime decision at all; it's
settled before the compiler even starts, by three real differences:
`OutputType` (`Exe` vs. `WinExe`), `TargetFramework` (`net10.0` vs.
`net10.0-windows`), and the presence of `UseWPF`. This is called
**declarative configuration** — stating a fact about the project for a tool
to read, rather than writing a statement for a machine to execute.

### Discard the Throwaway Example

`ScratchConsole` was deleted immediately after this comparison was
captured — it exists only in this lesson's verification record, never in
the actual project. Nothing about it is reused below.

### Project Change

- **Reference Source** — no reference counterpart. This is a brand-new
  project with no prior implementation being ported; the BRD this
  curriculum is built from explicitly treats the earlier Python tools as
  prior art for logic, not as a UI or project structure to replicate.
- **Files affected** — created: `MastercamGenerator.csproj`, at the project
  root.
- **Change type** — add (a brand-new file, produced by running a command,
  not typed by hand).
- **Location** — n/a; this is the project's first file.
- **Dependencies** — the .NET SDK must be installed and on the system
  `PATH` (verified here against SDK version 10.0.301).

### The New Code

Run, from an empty folder:

```
dotnet new wpf -n MastercamGenerator
```

This generates the project's real `MastercamGenerator.csproj`:

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

### The Updated Project

This *is* the whole new structure — a brand-new file with nothing
surrounding it yet — so there is nothing further to return to.

### Mechanical Walkthrough

Enumerating every distinct element in the file, in order:

1. `<Project Sdk="Microsoft.NET.Sdk">` — the root XML element. The
   `Sdk="Microsoft.NET.Sdk"` attribute is what makes this an **SDK-style
   project file**: it tells MSBuild to start from a large set of sensible
   defaults (like "compile every `.cs` file under this folder") instead of
   requiring every single file to be listed explicitly, the way older
   `.csproj` files required.
2. `<PropertyGroup>` — opens a **PropertyGroup**, a container for the
   named build settings that follow. A `.csproj` can have more than one
   `PropertyGroup` (for settings that only apply under certain build
   configurations), but this project needs only one.
3. `<OutputType>WinExe</OutputType>` — sets **OutputType** to `WinExe`.
   Contrasted against the console scaffold's `Exe` above: `Exe` produces a
   program that gets an attached console text window automatically;
   `WinExe` produces one that does not — its windows, if any, are entirely
   whatever the program itself creates (in this project's case, the
   `Window`-derived class this lesson builds).
4. `<TargetFramework>net10.0-windows</TargetFramework>` — sets
   **TargetFramework**. `net10.0` alone would target .NET 10 in a way that
   runs on Windows, macOS, or Linux alike; the `-windows` suffix opts this
   project specifically into the Windows-only API surface — including
   every WPF type this lesson uses — which is simply invisible to a
   project that leaves the suffix off.
5. `<Nullable>enable</Nullable>` — turns on **nullable reference types**.
   With it on, the compiler tracks, for every variable of a class type,
   whether `null` is a legal value for it, and warns when code doesn't
   handle that possibility somewhere it should.
6. `<ImplicitUsings>enable</ImplicitUsings>` — turns on **implicit
   usings**. A small standard set of extremely common namespaces (proven
   real below) becomes available in every `.cs` file in this project
   automatically, with no `using` line needed for them.
7. `<UseWPF>true</UseWPF>` — sets **UseWPF**. This is the one line with no
   equivalent at all in the console scaffold above: it tells MSBuild two
   things at once — link this project against WPF's `PresentationFramework`
   and `PresentationCore` libraries, and treat any `.xaml` file in this
   project as something to compile, not just an inert text file to copy
   into the output folder.

`Nullable` and `ImplicitUsings` are two ordinary C# project settings,
unrelated to windows or WPF specifically — every modern `dotnet new`
template, console or WPF, turns them on by default, which is exactly why
both scaffolds above share them identically.

### CS Lens

This is **declarative configuration**: stating a fact for a tool to
interpret, rather than writing an instruction for a machine to carry out
step by step. `<OutputType>WinExe</OutputType>` never *executes* — nothing
"runs" it — MSBuild simply *reads* it and behaves differently as a result,
the same way a recipe's ingredient list doesn't cook anything by itself,
but changes what the recipe's instructions produce. Also recognized in: a
database schema declaring a column's type, a `Dockerfile`'s `FROM` line
naming a base image, a regular expression declaring what a valid string
looks like without stating the steps to check one, HTML declaring a
document's structure while JavaScript executes behavior within it. This
same declarative/imperative split reappears inside this very lesson, one
Concept Unit from now, as XAML vs. C#.

### SE Lens

The alternative this format replaced — the pre-2017 `.csproj` format —
listed every single source file by explicit `<Compile Include="...">`
entries. That made the build description an exact, auditable record of
every file in the project, at the cost of a real, recurring maintenance
tax: add a `.cs` file in an editor, forget to also add it to the project
file, and it silently never compiles at all — a bug with no error message,
because the file that should have caught it was never told the new file
exists. The SDK-style format chosen here trades that explicitness for
convention (compile everything found under this folder), removing an
entire class of "forgot to register the file" bugs at the cost of the
project file no longer being a complete, explicit inventory of every
source file — a real tradeoff, not a strict improvement.

### Commands Needed

- `dotnet new wpf -n MastercamGenerator` — `dotnet` is the .NET CLI tool;
  `new` is its subcommand for scaffolding a project from a template; `wpf`
  names which template (there are dozens: `console`, `classlib`, `wpf`,
  and more); `-n MastercamGenerator` sets both the project's folder name
  and its root namespace. Success looks like: `The template "WPF
  Application" was created successfully.`

### Run It

Real, captured output from running the comparison above (.NET SDK
10.0.301):

```
--- ScratchConsole.csproj (dotnet new console) ---
<Project Sdk="Microsoft.NET.Sdk">
  <PropertyGroup>
    <OutputType>Exe</OutputType>
    <TargetFramework>net10.0</TargetFramework>
    <ImplicitUsings>enable</ImplicitUsings>
    <Nullable>enable</Nullable>
  </PropertyGroup>
</Project>

--- MastercamGenerator.csproj (dotnet new wpf) ---
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

(Saved in full at `verification/lesson-01/console-vs-wpf-csproj.txt` in
this curriculum's own folder.)

### Connecting Back

This one file is the reason every other file in this lesson — the two
XAML files, their two code-behind files — is even legal to write the way
it's about to be written; without `UseWPF`, none of the WPF types the rest
of this lesson depends on would be visible to the compiler at all.

---

## Concept Unit: XAML Describes Objects Without Constructing Them

### The Problem

A window, once built, is really just a tree of ordinary .NET objects — a
`Window` object holding a `Grid` object, which will eventually hold more
objects still. Every object graph like that could, in principle, be built
by writing ordinary C# statements: `new` each object, then set its
properties one assignment at a time. So why would this project's actual UI
files contain no `new` keyword anywhere in them?

> Given what you already know about C# — that building an object means
> calling `new SomeType()`, and setting a property means writing `object.
> PropertyName = value;` — what would the C# code to build a `Grid` sitting
> inside a `Window` titled `"Mastercam Generator"` actually look like, if
> you wrote it by hand, statement by statement? Now picture that same
> object graph, nested visually the way a family tree or a folder tree is
> drawn, with each object's properties written right next to it instead of
> on a separate line. Which one more closely matches how you'd *sketch* a
> window's structure on paper before writing any code at all?

### Introduce the Concept in Isolation

The same two-object tree — a `Grid` sitting inside a `Window` whose title
is `"Mastercam Generator"` — written two ways.

Hand-written C#, constructing the tree with ordinary statements:

```csharp
var window = new Window();
window.Title = "Mastercam Generator";
var grid = new Grid();
window.Content = grid;
```

The equivalent XAML, describing the same tree as nested markup:

```xml
<Window Title="Mastercam Generator">
    <Grid></Grid>
</Window>
```

Neither snippet was executed standalone — nothing needs to be *run* to
predict what each one does: the C# version is four ordinary, already-legal
statements whose effect is exactly what they read as (`new Window()`
constructs one object; `window.Title = "..."` assigns one property;
`window.Content = grid` assigns another). The XAML version's real
equivalence to it is proven for real, at build time, in this same lesson's
fourth and fifth Concept Units, once `x:Class`, `InitializeComponent()`,
and the compiled resource that markup becomes have all been introduced —
this unit's isolated point is narrower: shown side by side, every XML
*element* here corresponds to one `new` call, and every XML *attribute*
corresponds to one property assignment. This mapping — element becomes
object, attribute becomes property, nesting becomes ownership — is called
**XAML**, this project's declarative alternative to hand-writing the C#
above.

### Discard the Throwaway Example

This four-line hand-written C# snippet exists nowhere in the actual
project — it was written only to sit next to the equivalent XAML for
comparison, and is discarded now.

### Project Change

- **Reference Source** — no reference counterpart; this Concept Unit
  teaches a general mapping (XAML markup ↔ C# object construction), not a
  specific file this project will contain in this exact shape.
- **Files affected** — none yet; the real files this mapping applies to
  (`MainWindow.xaml`, `App.xaml`) are built in this lesson's next three
  Concept Units.
- **Change type** — n/a for this unit.
- **Location** — n/a.
- **Dependencies** — the project file from the previous Concept Unit
  (`UseWPF` must already be `true`, or the compiler has no idea what a
  `Window` or `Grid` element even refers to).

### Connecting Back

The previous Concept Unit's `UseWPF` setting is what makes this unit's
markup even legal — without it, there would be no compiled markup
resource, no `LoadComponent`, and this mapping would have nowhere to run.
The next two Concept Units apply this exact mapping to this project's real
`MainWindow.xaml`, one XML detail at a time.

---

## Concept Unit: The `Window` Class Is the Top-Level Container

### The Problem

Windows (the operating system's kind — a resizable, movable rectangle with
a title bar and its own entry in the taskbar) are not something ordinary
C# code can conjure from nothing; they're a real operating-system concept,
with real OS-level behavior (dragging, resizing, minimizing) that a .NET
class has to represent and delegate to.

> If you were the one designing a UI framework, would you make "having a
> title bar and being resizable" something every single UI object can do,
> or something only one special kind of object provides, with everything
> else living *inside* it? What would break if every button and text box
> could independently have its own title bar?

### Introduce the Concept in Isolation

The project file from this lesson's first Concept Unit was scaffolded by
`dotnet new wpf`, which also generated a starting `MainWindow.xaml`. Its
real, unedited root element:

```xml
<Window x:Class="MastercamGenerator.MainWindow"
        xmlns="http://schemas.microsoft.com/winfx/2006/xaml/presentation"
        xmlns:x="http://schemas.microsoft.com/winfx/2006/xaml"
        Title="MainWindow" Height="450" Width="800">
```

Nothing here needed to be run to know what it does — `Window` is this
lesson's own subject, given full treatment in the Header above, and every
attribute on this element is an ordinary XML attribute mapping onto a
`Window` property exactly as the previous Concept Unit proved: `Title`
becomes `window.Title = "..."`, `Height` becomes `window.Height = 450`,
`Width` becomes `window.Width = 800`. The two `xmlns` attributes are the
**XML namespace declarations** that tell the XAML parser which vocabulary
(`Window`, `Grid`, and every other WPF type) and which special reserved
directives (`x:Class`, seen next) are legal inside this document at all.

### Discard the Throwaway Example

This unit uses the project's own real, generated file directly — there is
no separate throwaway example to discard here.

### Project Change

- **Reference Source** — no reference counterpart (brand-new project).
- **Files affected** — modified: `MainWindow.xaml`, at the project root
  (generated by the previous Concept Unit's `dotnet new wpf` command,
  edited now).
- **Change type** — replace (one attribute value) and remove (three
  attributes not needed yet).
- **Location** — the root `<Window ...>` opening tag.
- **Dependencies** — the project scaffolded by the first Concept Unit.

### The New Code

The generated file also included three attributes this lesson doesn't need
yet — `xmlns:d`, `xmlns:mc`, and `mc:Ignorable="d"`, all support for the
Visual Studio visual designer, not for anything the program does at
runtime — and a `Title` still reading the template's placeholder text.
Trimmed to exactly what this lesson's own concepts require, and with the
title changed:

```xml
Title="Mastercam Generator" Height="450" Width="800">
```

### The Updated Project

The full root element, with the changed and removed attributes marked:

```xml
1  <Window x:Class="MastercamGenerator.MainWindow"
2          xmlns="http://schemas.microsoft.com/winfx/2006/xaml/presentation"
3          xmlns:x="http://schemas.microsoft.com/winfx/2006/xaml"
4          Title="Mastercam Generator" Height="450" Width="800">   // ← changed (was "MainWindow"); designer-only xmlns/mc:Ignorable removed
5      <Grid>
6  
7      </Grid>
8  </Window>
```

This element now declares one `Window` object, with its `Title`, `Height`,
and `Width` properties all set from markup, holding one `Grid` as its
`Content` — the `Grid` itself is this lesson's next Concept Unit.

### Mechanical Walkthrough

1. `<Window` — opens the **XML element** that XAML maps onto constructing
   a `Window` object (full treatment in the Header above): this is where
   `new Window()` conceptually happens, even though no `new` keyword
   appears anywhere in this file.
2. `x:Class="MastercamGenerator.MainWindow"` — the **`x:Class` directive**.
   Unlike every other attribute on this element, this one isn't a property
   being set on a `Window` — it names the specific C# **partial class**
   (`MastercamGenerator.MainWindow`) this markup file is paired with. This
   is the exact link that makes the *code-behind* class discussed in this
   lesson's next Concept Unit legally "the same class" as this markup.
3. `xmlns="http://schemas.microsoft.com/winfx/2006/xaml/presentation"` —
   an **XML namespace declaration** with no prefix, making it the
   *default* namespace for this document: every unprefixed element name
   from here down (`Window` itself, `Grid` below) resolves against WPF's
   presentation vocabulary because of this one line.
4. `xmlns:x="http://schemas.microsoft.com/winfx/2006/xaml"` — a second
   **XML namespace declaration**, this one given the prefix `x:`. It's
   what makes `x:Class` (above) a legal attribute name at all — anything
   written as `x:Something` resolves against XAML's own reserved
   vocabulary of directives, entirely separate from WPF's UI vocabulary.
5. `Title="Mastercam Generator"` — an **XML attribute**, mapping onto
   setting `Window.Title` (full treatment in the Header above) to the
   literal string `"Mastercam Generator"` — the only place in this entire
   project that exact text appears.
6. `Height="450"` — an **XML attribute** mapping onto `Window.Height`
   (Header above), setting the window's starting vertical size to `450`
   device-independent units.
7. `Width="800"` — an **XML attribute** mapping onto `Window.Width`
   (Header above), setting the starting horizontal size to `800`.

### CS Lens

`x:Class` is what makes this file and its C# code-behind file two halves
of one **partial class** (full treatment in the Header above, and in the
next Concept Unit) — a single logical class, split across two physical
files by design, each able to change independently. Also recognized in:
a database migration file paired with a rollback file that together define
one schema change; a compiled protocol-buffer `.proto` schema paired with
the generated language bindings built from it; a CSS stylesheet paired
with the HTML it styles, where neither file alone is "the whole page."

### SE Lens

The alternative not chosen here would be building this entire object graph
in C#, by hand, inside the constructor — exactly the four-line style shown
in the previous Concept Unit, just longer. That alternative is not wrong;
WPF fully supports it, and some WPF codebases do exactly that for pieces
built dynamically at runtime. The tradeoff: XAML's nested-tag structure
visually mirrors the tree it builds (a `Grid` written *inside* a `Window`
tag looks like what it is: a child inside a parent), while the equivalent
C# statements are a flat sequence where that same parent/child
relationship is expressed only by one line assigning to another object's
property — readable, but not something the eye can see the *shape* of at
a glance the way indentation in markup shows it directly.

### Commands Needed

None beyond the previous Concept Unit's `dotnet new wpf` (this unit only
edits the file that command already generated).

### Run It

Predicted, not re-executed here: setting an XML attribute to a literal
string value and having it become the identical string assigned to the
matching C# property is XAML's most basic, most stable, most thoroughly
documented behavior — unchanged since WPF's first release and re-proven,
for real, by this exact project's own successful build, captured in full
in this lesson's fifth Concept Unit below. Predicting "`Title="Mastercam
Generator"` becomes a `Window` whose `Title` property equals the string
`"Mastercam Generator"`" carries the same confidence as predicting what
`int x = 5;` assigns to `x`.

### Connecting Back

The previous Concept Unit proved the *general* shape of "XML element
becomes object, XML attribute becomes property" using a throwaway example;
this unit applies that exact mapping to this project's own real,
persisted `MainWindow.xaml` for the first time.

---

## Concept Unit: A Layout Container Makes Room for More Than One Child

### The Problem

`Window` inherits from `ContentControl` (named, not yet shown in detail,
in this Header's `Window` entry) — and a `ContentControl`'s `Content`
property can hold exactly one object. This lesson's window is empty today,
but the very next lesson in this curriculum adds a folder path display and
a "Browse" button — two separate objects. If `Content` can only ever hold
one thing, where do a second, third, and eventventually dozens of controls
go?

> `Window.Content` holds exactly one object. If you needed that one object
> to visually contain several others — arranged, eventually, in some kind
> of grid of rows and columns — what *kind* of object would that one
> object need to be? Does it need to be a `Window` itself, or something
> else, whose entire job is holding more than one child?

### Introduce the Concept in Isolation

The previous Concept Unit's `MainWindow.xaml` already contains this
project's real, unedited answer — nothing new needs to be written to
isolate it, only named and explained on its own, apart from the `Window`
that hosts it:

```xml
<Grid>

</Grid>
```

An empty pair of tags, describing one object with nothing inside it yet.
Nothing here needs to be executed to know what it produces: an XML element
with no attributes and no children maps, by the same rule this lesson's
second Concept Unit already proved, onto `new Grid()` with no properties
set and nothing added to it — there's no runtime ambiguity left to check
by running it.

### Discard the Throwaway Example

Not applicable — this unit examines the project's own real, persisted
markup directly, not a separate throwaway snippet.

### Project Change

- **Reference Source** — no reference counterpart.
- **Files affected** — `MainWindow.xaml`, already containing this element
  from the original `dotnet new wpf` scaffold; no further edit needed for
  this unit specifically.
- **Change type** — n/a (no edit; explaining an already-present element).
- **Location** — inside `<Window>`, as its one `Content` child.
- **Dependencies** — the `Window` element from the previous Concept Unit.

### The New Code

No new code — this unit's entire point is that the `Grid` is already
there, already legal, and already empty, because nothing has been added
inside it yet.

### The Updated Project

The full `MainWindow.xaml`, as it stands at the end of this Concept Unit,
with the `Grid` marked:

```xml
1  <Window x:Class="MastercamGenerator.MainWindow"
2          xmlns="http://schemas.microsoft.com/winfx/2006/xaml/presentation"
3          xmlns:x="http://schemas.microsoft.com/winfx/2006/xaml"
4          Title="Mastercam Generator" Height="450" Width="800">
5      <Grid>                                                      // ← this unit's subject: Window's one Content child
6  
7      </Grid>
8  </Window>
```

The window's `Content` now holds one `Grid` object, itself still empty —
together, this is the complete object graph this lesson builds: one
`Window`, holding one `Grid`, holding nothing yet.

### Mechanical Walkthrough

1. `<Grid>` — opens the **XML element** mapping onto `new Grid()`, this
   lesson's second subject class (full treatment in the Header above): a
   `Panel`-derived object whose entire purpose is arranging more than one
   child, unlike `Window`, which can hold only one.
2. (blank line) — no element, attribute, or text node here at all; XML
   permits pure whitespace between tags, and the parser ignores it. Not
   a concept — noted only because it's real content of the file, not
   something silently skipped.
3. `</Grid>` — the closing tag, ending the element opened above. Because
   nothing appears between the opening and closing tags, this `Grid`
   object is constructed with zero children — an empty container, not a
   missing one.

### CS Lens

This is **composition over inheritance in miniature**: `Window` doesn't
gain the ability to hold many children by inheriting some "multi-child
window" subclass; instead, it holds *one* object (`Grid`) whose own job is
holding many. The capability is composed in, not baked into `Window`
itself. Also recognized in: a car's engine not being welded directly into
its frame but bolted in as a separate, swappable assembly; a `<body>` tag
in HTML holding a single wrapping `<div>` that everything else nests
inside, rather than every element being a direct child of `<body>`; a
shipping container holding many boxes, itself being the one unit a crane
actually lifts.

### SE Lens

The alternative would be `Window` itself directly supporting a collection
of children (an `AddChild()` method, a `Children` list, built into `Window`
the same way `Content` already is). WPF's actual designers chose not to:
every `ContentControl` (not just `Window`) is capped at exactly one child,
and *anything* needing to hold many children — a `Grid`, a `StackPanel`, a
`Border` with one child of its own — is a separate, purpose-built class
instead. The cost: an empty `Grid` sitting inside an equally-empty `Window`
looks, right now, like pointless extra nesting for a window with nothing
in it yet. The benefit only shows up the moment a second control needs a
place to live — which is precisely why this lesson adds it now, one lesson
before it's needed, rather than only when the pressure to add it finally
arrives.

### Commands Needed

None; no new command beyond this lesson's first Concept Unit.

### Run It

Predicted, not re-executed: an empty XML element with no attributes and no
child content mapping onto a default-constructed object with no properties
set carries the same confidence as the previous Concept Unit's prediction —
this is XAML's most basic possible case, re-verified for real, for this
exact file, by the successful build shown in the next Concept Unit.

### Connecting Back

`Window` (previous Concept Unit) and `Grid` (this unit) together are the
complete object graph this lesson's window is built from. The next
Concept Unit answers a question this unit's markup alone can't: markup
*describes* this tree, but nothing in `MainWindow.xaml` itself explains
how or when that description turns into real, running C# objects — that's
code-behind.

---

## Concept Unit: Code-Behind Turns Markup Into Real Objects

### The Problem

`MainWindow.xaml` describes a `Window` holding a `Grid`. Description alone
doesn't run anything — nothing reads a `.xaml` file and animates it into
existence by magic. Something has to actually execute, at some specific
moment, and do the work of turning that markup into a real object graph in
memory.

> `x:Class="MastercamGenerator.MainWindow"` names a C# class. If that
> class doesn't exist as hand-written code anywhere in this project's
> `.xaml` file itself (XAML isn't C#), where would you expect to find it —
> and given the previous Concept Unit's `partial class` term, what would
> the *rest* of that same class, defined somewhere else, need to actually
> do to make this markup real?
</p>

### Introduce the Concept in Isolation

`dotnet new wpf` also scaffolds a second file paired with `MainWindow.
xaml` — its real, unedited contents:

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

namespace MastercamGenerator;

public partial class MainWindow : Window
{
    public MainWindow()
    {
        InitializeComponent();
    }
}
```

This is C#, not XAML — every line here is an ordinary statement or
declaration, nothing declarative about it. Building the project (captured
in full below) and inspecting the compiler's own generated output proves,
for real, what the single call inside this constructor actually does —
not asserted from memory, but read directly from the real file the build
produces:

```csharp
public void InitializeComponent() {
    if (_contentLoaded) {
        return;
    }
    _contentLoaded = true;
    System.Uri resourceLocater = new System.Uri("/MastercamGenerator;component/mainwindow.xaml", System.UriKind.Relative);
    System.Windows.Application.LoadComponent(this, resourceLocater);
}
```

(Real output, from `obj/Debug/net10.0-windows/MainWindow.g.cs`, generated
by this exact project's own build — saved in full at `verification/
lesson-01/generated/MainWindow.g.cs`; the `#line` directives and
attributes present in the real file are covered in this unit's Mechanical
Walkthrough below.) This is the proof that XAML does **not** compile down
to a literal, line-by-line `new Grid()`-shaped C# rewrite of the markup —
it compiles into a call to `LoadComponent`, which parses a **compiled
markup resource** (full treatment in the Header above) at the moment the
program actually runs, not at the moment it's built.

### Discard the Throwaway Example

Not applicable — this unit's proof is the project's own real, generated
file, inspected directly, not a separate written-to-be-discarded example.

### Project Change

- **Reference Source** — no reference counterpart.
- **Files affected** — `MainWindow.xaml.cs`, already generated by the
  first Concept Unit's `dotnet new wpf`; no edit needed — this unit
  explains what's already there.
- **Change type** — n/a.
- **Location** — the whole file (it's short enough to show in full).
- **Dependencies** — `MainWindow.xaml` from the previous two Concept
  Units, and a successful build (to generate `MainWindow.g.cs`, the file
  this unit's proof reads from).

### The New Code

No new hand-written code for this unit — the file already exists exactly
as shown above. What *is* new here is running the build and reading the
file it generates, which is this unit's actual "New Code" in spirit:

```
dotnet build
```

### The Updated Project

`MainWindow.xaml.cs` in full, as already generated (nothing changes here
in this unit — shown whole because this is the enclosing structure the
Header's `InitializeComponent()` and `Window` entries both refer to):

```csharp
1  using System.Text;
2  using System.Windows;
3  using System.Windows.Controls;
4  using System.Windows.Data;
5  using System.Windows.Documents;
6  using System.Windows.Input;
7  using System.Windows.Media;
8  using System.Windows.Media.Imaging;
9  using System.Windows.Navigation;
10 using System.Windows.Shapes;
11
12 namespace MastercamGenerator;
13
14 public partial class MainWindow : Window
15 {
16     public MainWindow()
17     {
18         InitializeComponent();                                  // ← proven, below, to call LoadComponent
19     }
20 }
```

This class now does exactly one thing when constructed: call
`InitializeComponent()`, which — proven above — reads this project's
compiled `MainWindow.xaml` and builds the real `Window`/`Grid` object tree
from it.

### Mechanical Walkthrough

1. `using System.Text;` through `using System.Windows.Shapes;` (ten
   lines) — ten **`using` directives**, each making one namespace's types
   available in this file by their short name instead of their full,
   namespace-qualified name. Most are unused by this lesson's own code
   (they're the template's defaults, left in for whatever a later lesson
   in this curriculum ends up needing); `System.Windows` specifically is
   used, since it's where `Window` itself lives.
2. `namespace MastercamGenerator;` — a **namespace** declaration (full
   treatment in the Header above) using C#'s newer "file-scoped" form (a
   semicolon instead of a following `{ }` block) — everything below this
   line, for the rest of the file, belongs to the `MastercamGenerator`
   namespace, which is exactly the namespace `x:Class="MastercamGenerator.
   MainWindow"` named back in this lesson's third Concept Unit.
3. `public partial class MainWindow : Window` — declares a **partial
   class** (Header above) named `MainWindow`, using **inheritance**
   (Header above) to build it on top of `Window` (this lesson's own
   subject, full treatment in the Header). `partial` is what lets this
   hand-written half of the class coexist with the build-generated half
   (`MainWindow.g.cs`, examined above) as one single, merged class.
4. `public MainWindow()` — a **constructor** (Header above) with the same
   name as the class, taking no parameters, callable as `new MainWindow()`
   — though nothing in this lesson's own code calls it directly; that's
   this lesson's final Concept Unit's subject.
5. `InitializeComponent();` — a call to the generated method proven above,
   in full, to construct `System.Uri` and call `System.Windows.
   Application.LoadComponent(this, resourceLocater)` — the one call in
   this entire class responsible for this window's `Grid` coming into
   existence at all.

### CS Lens

This is a real instance of **generated code you inspect, not write** — the
same idea recurs anywhere a build step produces source from a
higher-level description: a database access layer generated from a schema
file, TypeScript's `.d.ts` type declaration files generated from
JavaScript, a gRPC service's client stub generated from a `.proto` file, a
compiler's own intermediate representation generated from source before
it becomes machine code. In every case, trusting *that* the generated code
does what it claims — without ever reading it — is a habit that eventually
gets someone burned by a wrong assumption; this unit modeled the
alternative: go look at the real thing.

### SE Lens

The alternative to code generation here would be requiring every WPF
developer to hand-write the `LoadComponent` call, the resource `Uri`
string, and the `IComponentConnector` wiring (this lesson's next unit) by
hand, in every window's constructor, for every window in every project.
WPF's designers chose to generate it instead, from the markup itself,
specifically because that exact code is entirely mechanical to derive —
the resource path, for instance, is always just the `.xaml` file's own
project-relative path, lowercased. The real cost of this choice: the
actual behavior of "what does opening this window do" now lives partly in
a file (`MainWindow.g.cs`) that doesn't exist until the project is built,
isn't tracked in version control, and most WPF developers never open in
years of working in the framework — genuinely hidden machinery, unless a
reader deliberately goes looking, exactly as this unit just did.

### Commands Needed

- `dotnet build` — compiles the project, which is also the step that
  generates `MainWindow.g.cs` from `MainWindow.xaml`. Real, captured
  output from running it against this project, unedited:

```
Determining projects to restore...
All projects are up-to-date for restore.
MastercamGenerator -> <project>\bin\Debug\net10.0-windows\MastercamGenerator.dll

Build succeeded.
    0 Warning(s)
    0 Error(s)

Time Elapsed 00:00:01.80
```

(Full output saved at `verification/lesson-01/build-output.txt`; the
generated `MainWindow.g.cs` this unit quotes from is saved in full at
`verification/lesson-01/generated/MainWindow.g.cs`.)

### Run It

Shown above, in full, as real build output and real generated source —
not predicted. This is exactly the kind of claim ("the compiler generates
this behind the scenes") the schema this curriculum follows requires
actual proof for, not a confident sentence — which is why this unit reads
the real file instead of describing what it probably contains.

### Connecting Back

The previous two Concept Units built the markup this unit's generated code
actually reads (`Window` holding `Grid`); this unit is the missing link
between "markup describing an object tree" and "a real object tree that
exists in memory while the program runs." One piece remains: nothing yet
has explained what causes `MainWindow`'s constructor to be called at all —
that's this lesson's final Concept Unit.

---

## Concept Unit: `Application` and `StartupUri` Start the Program

### The Problem

`MainWindow`'s constructor (previous Concept Unit) is real, working code —
but a constructor only runs when something calls `new MainWindow()`. Not
one line, anywhere in this project so far, does that. Yet running this
program does open a `MainWindow`. Something else, not yet examined, is
responsible for that first `new`.

> A running program needs exactly one starting point — some first line of
> code the operating system itself calls, before any object the program
> defines has been created yet. Nothing has been created yet at that
> point, which means that starting code can't be an *instance* method (an
> instance of what — nothing exists yet). Given the Header's `static
> method` term, what kind of method must a program's true starting point
> be?

### Introduce the Concept in Isolation

`dotnet new wpf` also scaffolds a project-wide counterpart to
`MainWindow.xaml`, paired the same `x:Class` way — its real, unedited
contents, `App.xaml`:

```xml
<Application x:Class="MastercamGenerator.App"
             xmlns="http://schemas.microsoft.com/winfx/2006/xaml/presentation"
             xmlns:x="http://schemas.microsoft.com/winfx/2006/xaml"
             xmlns:local="clr-namespace:MastercamGenerator"
             StartupUri="MainWindow.xaml">
    <Application.Resources>
         
    </Application.Resources>
</Application>
```

and its code-behind, `App.xaml.cs`:

```csharp
using System.Configuration;
using System.Data;
using System.Windows;

namespace MastercamGenerator;

public partial class App : Application
{
}
```

`App.xaml.cs` here is almost entirely empty — no constructor written by
hand at all, unlike `MainWindow.xaml.cs`. Building the project and reading
the compiler's own generated `App.g.cs` proves, for real, where this
project's actual entry point lives — not guessed, read directly:

```csharp
public void InitializeComponent() {
    this.StartupUri = new System.Uri("MainWindow.xaml", System.UriKind.Relative);
}

[System.STAThreadAttribute()]
public static void Main() {
    MastercamGenerator.App app = new MastercamGenerator.App();
    app.InitializeComponent();
    app.Run();
}
```

(Real output, from `obj/Debug/net10.0-windows/App.g.cs`, generated by this
exact project's own build — saved in full at `verification/lesson-01/
generated/App.g.cs`.) This is real, direct proof — not an assertion "the
framework handles this automatically" — of exactly where this program's
`Main` method lives: not in any file the reader opened to write this
project, but generated, entirely, from `App.xaml`.

### Discard the Throwaway Example

Not applicable — this unit's proof is the project's own real, generated
file, inspected directly.

### Project Change

- **Reference Source** — no reference counterpart.
- **Files affected** — `App.xaml`, generated by the first Concept Unit's
  `dotnet new wpf`, trimmed (same reasoning as `MainWindow.xaml` in this
  lesson's third Concept Unit: designer-only `xmlns:d`/`xmlns:mc`/
  `mc:Ignorable="d"` and the unused `xmlns:local` removed, along with the
  empty `<Application.Resources>` block this lesson has nothing to put in
  yet).
- **Change type** — remove (unneeded attributes and an empty element).
- **Location** — the root `<Application ...>` element and its body.
- **Dependencies** — the project scaffolded by the first Concept Unit.

### The New Code

Trimmed to exactly what this lesson's own concepts require:

```xml
<Application x:Class="MastercamGenerator.App"
             xmlns="http://schemas.microsoft.com/winfx/2006/xaml/presentation"
             xmlns:x="http://schemas.microsoft.com/winfx/2006/xaml"
             StartupUri="MainWindow.xaml">
</Application>
```

### The Updated Project

The full, final `App.xaml`, with every line numbered:

```xml
1  <Application x:Class="MastercamGenerator.App"
2               xmlns="http://schemas.microsoft.com/winfx/2006/xaml/presentation"
3               xmlns:x="http://schemas.microsoft.com/winfx/2006/xaml"
4               StartupUri="MainWindow.xaml">                       // ← the one setting that names MainWindow as the first window
5  </Application>
```

This file now declares exactly one thing beyond the class-linking and
namespace boilerplate already explained in this lesson's third Concept
Unit: which window to open first, once the program starts.

### Mechanical Walkthrough

1. `<Application` — the **XML element** mapping onto constructing this
   project's `Application` object (this lesson's own subject, full
   treatment in the Header above) — the process-wide object, not a
   window.
2. `x:Class="MastercamGenerator.App"` — the same **`x:Class` directive**
   mechanism explained in this lesson's third Concept Unit, this time
   linking `App.xaml` to the `App` **partial class** shown above, instead
   of `MainWindow.xaml` to `MainWindow`.
3. `xmlns="..."` and `xmlns:x="..."` — the identical two **XML namespace
   declarations** explained in the third Concept Unit, needed here for
   exactly the same reason: to make `Application` resolve against WPF's
   vocabulary and `x:Class` resolve against XAML's own reserved one.
4. `StartupUri="MainWindow.xaml"` — an **XML attribute** mapping onto
   `Application.StartupUri` (Header above), set to a relative path naming
   `MainWindow.xaml`. This is the single value that answers "which window
   opens first" — change this string to point at a different `.xaml`
   file, and a different window would open first instead, with none of
   this project's other files needing to change at all.

### CS Lens

Generating `Main()` itself, rather than requiring a person to write it, is
an example of **convention over configuration**: WPF assumes every project
using it wants exactly the same entry-point shape (create the one
`Application`, initialize it, run it), so it generates that shape
automatically from the presence of `StartupUri`, instead of requiring a
person to hand-write the same four or five lines in every WPF project that
will ever exist. Also recognized in: a web framework that automatically
maps a file named `users.py` in a certain folder to a `/users` URL route,
with no explicit registration line required; a test runner that treats
every method starting with `test_` as a test to run, with no explicit
list of tests to execute; a build tool that automatically finds and
compiles every `.cs` file under a project folder — the very same
convention this lesson's first Concept Unit's SDK-style project format
already relies on.

### SE Lens

The alternative — a person hand-writing their own `Main` method, the way
a console application's template does — is not actually forbidden by WPF;
it's possible to opt out of the generated entry point and write one by
hand. WPF's default (generate it) trades a small amount of control (a
developer can't easily add a line of code that runs *before*
`Application.InitializeComponent()`, since that method doesn't exist as
hand-editable code) for removing an entire category of "forgot the
`[STAThread]` attribute" bugs — a real, specific Windows failure mode
where UI objects throw exceptions at construction time if the thread
they're created on isn't in the right COM threading mode, a mistake easy
to make once and easy to spend real debugging time on, that generating
`Main()` correctly, every time, removes entirely.

### Commands Needed

`dotnet build`, already run for this lesson's fifth Concept Unit — this
unit's proof reuses that same real build rather than running it again,
per this curriculum's own batching practice: one build, inspected for
everything it generates, not one separate build per Concept Unit.

### Run It

Shown above, in full, as real generated source, read directly from this
project's own build output — the same file the previous Concept Unit's
build already produced. Executing the compiled program itself (actually
opening the window) is not run as part of this lesson's own verification
— what it will show is confidently predictable from everything proven
above: a window, sized 800×450, with a title bar reading "Mastercam
Generator," and an empty area beneath it, because that is the literal,
traced consequence of `Main()` calling `Run()`, `Run()` reading
`StartupUri` to construct a `MainWindow`, and that constructor's
`InitializeComponent()` — proven, not assumed, in the previous Concept
Unit — loading exactly the markup this lesson's third and fourth Concept
Units built.

### Connecting Back

Every previous Concept Unit in this lesson built one piece of a chain this
unit finally closes end to end: the project file (first unit) made `Window`
and `Application` visible to the compiler at all; the `Window`/`Grid`
markup (third and fourth units) described what this project's one window
looks like; `MainWindow.xaml.cs`'s `InitializeComponent()` call (fifth
unit) proved how that markup becomes real objects; this unit's `App.xaml`
and its generated `Main()` are what actually calls all of it, starting
from nothing, the instant the compiled program runs.

---

## Connect the Pieces

Trace one concrete fact — the string `"Mastercam Generator"` — through
every piece this lesson built, start to finish:

1. It is typed once, by hand, as the value of the `Title` attribute on
   `MainWindow.xaml`'s root `<Window>` element (third Concept Unit) —
   nowhere else in the entire project.
2. When the compiled program starts, the operating system calls the
   generated `Main()` method inside `App.g.cs` (sixth Concept Unit),
   which constructs one `App` object, calls its generated
   `InitializeComponent()` — which sets `Application.StartupUri` to
   `"MainWindow.xaml"` — and then calls `Application.Run()`.
3. `Run()` reads `StartupUri`, resolves it to `MainWindow`, and
   constructs one: `new MainWindow()` (fifth Concept Unit's constructor),
   whose body calls `InitializeComponent()` — this time `MainWindow`'s
   own generated version.
4. That `InitializeComponent()` builds a `System.Uri` naming
   `MainWindow.xaml`'s compiled resource and calls `System.Windows.
   Application.LoadComponent(this, resourceLocater)` (fifth Concept
   Unit) — the real call, proven by inspecting generated code rather than
   assumed, that reads the compiled form of the exact markup written in
   the third and fourth Concept Units.
5. `LoadComponent` parses that compiled resource and, among everything
   else it builds (the `Grid` from the fourth Concept Unit included),
   sets the real `MainWindow` object's `Title` property to the literal
   string typed in step 1 — the value this whole trace has been
   following.
6. Windows' own window-chrome rendering (outside this project's code
   entirely) reads that `Title` property and draws it into the title bar
   the instant the window appears on screen.

None of this chain exists because any one file calls any other file
directly by name. It exists because the project file (first Concept Unit)
declared this to be a WPF project at all, and every file after it followed
a convention WPF itself enforces — which is exactly why the smallest
possible working WPF application still touches five real files and one
generated one, and why reading the generated file, rather than trusting a
description of it, was this lesson's actual proof throughout.
