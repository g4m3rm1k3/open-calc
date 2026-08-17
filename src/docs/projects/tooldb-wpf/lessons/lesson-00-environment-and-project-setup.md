# Lesson 0: The SDK, the Project File, and the Package Manager
### (Environment & Project Setup)

**What you will build.** By the end of this lesson, a real, empty-but-running
.NET console project named `ToolDB` exists on disk — created by a verified
SDK install, declaring exactly which .NET version it targets, with the
`Microsoft.Data.Sqlite` package already installed and restored, ready for
Lesson 1 to open an actual database connection against. Nothing here talks
to a database or opens a window yet. The transferable problem this lesson is
actually about is bigger than this one project: how does a pile of source
text become something the operating system can run, and how does a project
declare and fetch its own external dependencies without shipping someone
else's code inside your own repository? Every .NET project this curriculum
builds — console, WPF, whatever comes later — starts from this exact same
three-step shape.

**What you need to know first.** Nothing — this is the first lesson in this
curriculum.

**Terms used in this lesson**

- **SDK (Software Development Kit)** — a bundled set of compilers, a
  runtime, base class libraries, and command-line tooling, published by
  Microsoft, that turns C# source text into a program the operating system
  can actually execute. It exists because a language's grammar alone (what
  C# syntax is legal) is useless without something that turns it into
  runnable output — and without one official bundle, every project would
  have to separately negotiate compiler version, runtime version, and
  tooling version by hand.
- **CLI (command-line interface)** — a program controlled entirely by typed
  text commands and flags, with no buttons or menus. The `dotnet` program is
  the SDK's own CLI, and it matters beyond convenience: every GUI tool this
  curriculum might later touch (Visual Studio's build button, VS Code's C#
  extension) is a thin wrapper that ultimately shells out to these same
  commands — there is no separate "IDE build system" underneath.
- **project file (`.csproj`)** — an XML file that tells the SDK's build
  engine what kind of thing a folder of code produces (an executable, a
  library), which .NET version it targets, and which external packages it
  depends on. It exists because the compiler cannot infer "build this as a
  console app targeting .NET 10" from source files alone — something has to
  state that intent explicitly.
- **MSBuild** — the actual build engine that reads the project file and does
  the work: compiling code, copying output files, triggering package
  restore. The `dotnet` CLI's `build`/`run`/`new` commands are a friendlier
  front end over MSBuild, not a separate, competing build system.
- **target framework moniker (TFM)** — a short string like `net10.0`, written
  inside the project file, naming the exact .NET version and API surface a
  build compiles against. It exists because .NET ships a new major version
  every year, the same source code can often target more than one of them,
  and something has to pin which specific set of runtime behavior and
  available APIs this particular build is compiled and checked against.
- **top-level statements** — a C# feature that lets executable code sit
  directly at the top of a file, with no visible `class Program { static
  void Main() { ... } }` wrapper around it. It exists to remove ceremony a
  first program doesn't need yet, without changing what the compiler
  actually builds underneath — proven, not just asserted, later in this
  lesson.
- **package** — a versioned, downloadable unit of already-written,
  already-compiled code — someone else's library — that a project can
  depend on instead of writing that code itself.
- **package manager (NuGet)** — .NET's system for publishing, discovering,
  downloading, and versioning packages. It exists because "find a `.dll`
  somewhere and copy it into the project by hand" has no version tracking,
  no record of what that `.dll` itself depends on, and no repeatable way for
  a second machine to end up with the identical result.
- **`PackageReference`** — the XML element inside the project file that
  names one package dependency and the version constraint on it. This is
  the literal thing NuGet reads to know what to fetch.
- **package restore** — the step where the build tooling reads every
  `PackageReference` in the project file, resolves the *full* dependency
  graph (a package's own dependencies, and theirs, recursively), downloads
  anything not already present into a shared local cache, and records
  exactly what it resolved. It exists so a build doesn't silently
  re-resolve a possibly-different set of compatible versions every single
  time — restore happens once (or whenever the project file changes), and
  every later build trusts that one result instead of redoing the search.
- **global package cache** — the single shared folder on disk
  (`C:\Users\<you>\.nuget\packages` on Windows) where every downloaded
  package version is stored exactly once and reused by every project on the
  machine that needs it, instead of each project keeping its own private
  copy.
- **lock file (`project.assets.json`)** — a generated file, written by
  restore, recording the exact resolved package graph — every package,
  every version, every dependency of every package — that the last restore
  produced. It exists so a second restore later, on this machine or a
  teammate's, reproduces the identical dependency graph instead of
  possibly re-resolving to a different-but-technically-compatible set of
  versions.
- **version control (git)** — a system that records named, timestamped
  snapshots of a project's files over time, so past states can be
  recovered, compared, or reasoned about later. This curriculum's own
  convention — every lesson ends in a commit — depends on it existing from
  this very first lesson onward.
- **repository** — the folder git is tracking, plus its entire recorded
  history of snapshots; created by `git init`.
- **commit** — one saved, named snapshot of the project's files at a
  specific point in time, permanently recorded in the repository's history.

**Objects and methods used**

- **`Console.WriteLine(string?)`**
  - *What it is:* a `static` method on .NET's `System.Console` class —
    `static` meaning it belongs to the class itself, not to an instance you
    construct. There is no `new Console()` anywhere in the generated code,
    because a running program has exactly one console to write to, not many
    independent console objects that would each need their own instance.
  - *Implementation:* one of several overloads on `Console`; the one called
    here has the public contract `public static void WriteLine(string?
    value)` — takes a single, nullable string, returns nothing (`void`),
    and writes that string to standard output followed by a
    platform-specific newline. This contract is documented on Microsoft's
    own public API reference for `System.Console`; the actual runtime
    implementation lives in the `dotnet/runtime` repository, the same
    public source repository every part of the .NET runtime and base class
    library ships from.
  - *Its use:* the generated `Program.cs` calls it exactly once, as the
    entire program — the smallest possible piece of real, visible output,
    proving the full pipeline (source text → compiler → runtime → something
    you can actually see) works, before any project-specific code exists.

---

## Concept Unit: The .NET SDK and the `dotnet` CLI

### The Problem

Before any project exists, there's a more basic question: does this machine
even have the tooling that turns C# source text into something the
operating system can execute? .NET is not part of Windows — it's a separate
install — and every single command this curriculum will ever run (creating
a project, adding a package, building, running) goes through one program:
`dotnet`. Before trusting that program to do anything else, confirm it's
actually present, and which version it is.

### Introduce the Concept in Isolation

In any empty folder — nothing project-related exists yet — run:

```
dotnet --version
```

Real output, captured this session:

```
10.0.301
```

This one line proves two things at once: the `dotnet` program is installed
and reachable from this shell (a shell with no `dotnet` installed reports
"command not found" or an equivalent error instead of a version number),
and it names a specific SDK version, `10.0.301`. This program is called the
**`dotnet` CLI**.

A second, more detailed check exists too:

```
dotnet --info
```

Real output, captured this session (trimmed — the full report is much
longer):

```
.NET SDK:
 Version:           10.0.301
 Commit:            96856fd726
 Workload version:  10.0.300-manifests.8c7d7c03
 MSBuild version:   18.6.4+96856fd72

Runtime Environment:
 OS Name:     Windows
 OS Version:  10.0.26200
 OS Platform: Windows
 RID:         win-x64
 Base Path:   C:\Program Files\dotnet\sdk\10.0.301\
 ...
.NET SDKs installed:
  9.0.315 [C:\Program Files\dotnet\sdk]
  10.0.301 [C:\Program Files\dotnet\sdk]

.NET runtimes installed:
  Microsoft.AspNetCore.App 10.0.9 [C:\Program Files\dotnet\shared\Microsoft.AspNetCore.App]
  Microsoft.NETCore.App 10.0.9 [C:\Program Files\dotnet\shared\Microsoft.NETCore.App]
  Microsoft.WindowsDesktop.App 10.0.9 [C:\Program Files\dotnet\shared\Microsoft.WindowsDesktop.App]
```

This proves something specifically useful to this project: alongside the
plain `Microsoft.NETCore.App` runtime, a `Microsoft.WindowsDesktop.App`
runtime is also installed on this machine — the exact runtime WPF needs,
confirmed present now (Lesson 0) rather than discovered missing partway
through Lesson 5, when a WPF window is first opened.

### Discard the Throwaway Example

Nothing was created by either command — no folder, no file. There's nothing
to delete. The "throwaway" part here is the *act* of checking: a one-time
verification, never something the project depends on running again.

### Mechanical Walkthrough

- `dotnet` — the name of the installed program itself, invoked directly
  because the SDK's installer added its folder to the system `PATH` (the
  list of folders the shell searches when a bare command name is typed with
  no full path in front of it).
- `--version` — a flag: a named option, prefixed with `--`, telling the
  `dotnet` CLI to print its own SDK version and immediately exit, doing
  nothing else.
- `--info` — a different flag on the same program, telling it to print a
  full diagnostic report instead: every installed SDK, every installed
  runtime, the detected OS and processor architecture.

### CS Lens

Nothing here rises to a hard concept (a design pattern, an SE principle, a
named CS idea) — this is ordinary tooling invocation, not something to force
extra weight onto. The one thing worth naming plainly: a flag like
`--version` is a form of parameterizing a single program's behavior from
outside itself, at the moment it's invoked, rather than needing a
completely different program for every different report you might want.

### SE Lens

Why verify the SDK before typing anything else, instead of just running
`dotnet new` and finding out the hard way? The alternative not chosen —
skip the check, start immediately — trades one cheap command now for a
harder debugging problem later: if the SDK is missing or badly configured,
the very first real command fails with an error that's about *that*
command, not about the actual root cause, and figuring out "wait, is
`dotnet` even installed?" becomes a detour in the middle of something else.
Verifying first costs a few seconds and converts a possibly-confusing
downstream failure into an immediate, obvious answer.

It's also worth being honest about what this machine's `dotnet --info`
output above actually reveals: two SDKs are installed side by side, `9.0.315`
and `10.0.301`. .NET SDKs installing side-by-side like this is normal and
intentional — a project's own `TargetFramework` setting (the next unit)
decides which APIs and runtime behavior it targets, independent of which
SDK version happens to be newest on the machine. "Wrong SDK installed" and
"wrong `TargetFramework` in a project file" are two different failure modes,
worth being able to tell apart later when something doesn't build.

### Commands Needed

- `dotnet --version` — prints the active SDK version, nothing else.
- `dotnet --info` — prints the full diagnostic report shown above.
- If `dotnet` isn't found at all: the SDK installer is published at
  Microsoft's own `dotnet.microsoft.com/download` — install the SDK (not
  just the smaller "runtime" package, which can run programs but can't
  build or create new ones), then re-run `dotnet --version` to confirm.

### Run It — Real Output

Already shown above, captured this session on the machine this lesson was
written on: `10.0.301`.

### Connecting Back

This confirms the exact tool the next unit uses to create the project
itself.

---

## Concept Unit: The Project File — `dotnet new console`, `.csproj`, and Top-Level Statements

### The Problem

The SDK is confirmed present, but a folder full of loose `.cs` files still
isn't something the SDK knows how to build. Nothing yet tells it "this
folder is an executable program," or which .NET version it should be
compiled against. .NET needs a manifest before it can do anything.

### Introduce the Concept in Isolation

In a throwaway scratch folder, run:

```
dotnet new console -o LabScratch
```

Real output, captured this session:

```
The template "Console App" was created successfully.

Processing post-creation actions...
Restoring .../LabScratch/LabScratch.csproj:
  Determining projects to restore...
  Restored .../LabScratch/LabScratch.csproj (in 59 ms).
Restore succeeded.
```

Two files now exist. `LabScratch.csproj`:

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

`Program.cs`:

```csharp
Console.WriteLine("Hello, World!");
```

Running it:

```
dotnet run
```

Real output:

```
Hello, World!
```

This proves two things. First, a project file is real, plain, readable
XML — not a hidden binary format, not magic — and this particular shape,
with almost nothing written in it, is called an **SDK-style project file**.
Second, the template's own generated code already runs correctly with zero
edits: `dotnet new` didn't just create files, it created a *working*
program.

### Discard the Throwaway Example

`LabScratch/` is deleted. It taught what a fresh project file and a fresh
`Program.cs` look like; it will not appear again.

### Project Change

- **Reference Source** — no reference counterpart. This project is a
  rewrite of an existing Python + pywebview application, but that fact
  only matters once there's application logic to port; environment
  bootstrapping (creating an empty project, installing the SDK) has no
  meaningful predecessor to read from — it's tooling setup, not ported
  behavior.
- **Files affected** — creates a new project folder (`ToolDB/`, wherever
  you choose to keep it on disk) containing `ToolDB.csproj`, `Program.cs`,
  and the generated `obj/` and `bin/` folders.
- **Change type** — add (brand-new).
- **Location** — not applicable; there is no existing structure to locate a
  position within. This is the first file in the project.
- **Dependencies** — the SDK confirmed present in the previous unit.

### The New Code

```
dotnet new console -o ToolDB
```

Real output, captured this session:

```
The template "Console App" was created successfully.

Processing post-creation actions...
Restoring .../ToolDB/ToolDB.csproj:
  Determining projects to restore...
  Restored .../ToolDB/ToolDB.csproj (in 50 ms).
Restore succeeded.
```

`ToolDB.csproj`:

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

`Program.cs`:

```csharp
Console.WriteLine("Hello, World!");
```

This is a brand-new folder with nothing surrounding it yet — the code shown
above *is* the whole new structure, so there's no larger enclosing file to
return to and re-show.

### Mechanical Walkthrough

`ToolDB.csproj`, element by element:

- `<Project Sdk="Microsoft.NET.Sdk">` — the root element. The `Sdk`
  attribute tells MSBuild which SDK's own default build logic to
  implicitly import — a large set of build rules and defaults this file
  never has to spell out itself. This is exactly why a project file this
  short can still fully build a program: almost everything is inherited
  from `Microsoft.NET.Sdk`, not written here.
- `<PropertyGroup>` — an MSBuild container element that groups related
  named build settings (properties) together. It has no value of its own;
  it only holds other elements.
- `<OutputType>Exe</OutputType>` — a property setting the build's output
  kind to an executable (produces a runnable program with an entry point)
  rather than a library with no entry point of its own.
- `<TargetFramework>net10.0</TargetFramework>` — the target framework
  moniker from the Terms glossary above, pinning this build to compile
  against .NET 10's specific API surface and runtime behavior.
- `<ImplicitUsings>enable</ImplicitUsings>` — a property that turns on
  automatically-included `using` statements for a standard set of common
  namespaces (including `System`, which is why `Console` below didn't need
  an explicit `using System;` line above it). It exists to remove a small,
  repetitive piece of ceremony from every new file.
- `<Nullable>enable</Nullable>` — a property that turns on nullable
  reference type analysis: the compiler starts tracking, per reference
  type, whether it's allowed to be `null`, and warns when a plain
  (non-`?`-suffixed) reference type might end up holding `null` anyway.
- `</PropertyGroup>`, `</Project>` — ordinary closing XML tags, matching
  the opening elements above.

`Program.cs`, element by element:

- `Console.WriteLine(...)` — the method call itself, fully explained in
  "Objects and methods used" above: a static method on `System.Console`
  that writes a line of text to standard output.
- `"Hello, World!"` — a string literal: a fixed sequence of characters
  written directly in the source code, passed here as the single argument
  to `WriteLine`.
- `;` — statement terminator, ordinary C# syntax marking the end of this
  one statement.
- The absence of any surrounding `class Program { static void Main(string[]
  args) { ... } }` around this line — this file's single statement runs
  directly as the program's entry point, with none of that structure
  visible. This is called **top-level statements**.

### Proof: What Top-Level Statements Actually Compile To

A claim like "the compiler still builds a class and an entry-point method
around this, you just don't see it" is exactly the kind of hidden-behavior
claim that needs real proof, not a confident sentence. Here's that proof,
run for real this session — a small, disposable diagnostic script, not
part of the project and never reused, the same way disassembling a compiled
file to check a claim doesn't require teaching the disassembler itself:

```csharp
var m = System.Reflection.MethodBase.GetCurrentMethod()!;
System.Console.WriteLine($"Declaring type: {m.DeclaringType!.FullName}");
System.Console.WriteLine($"Method name:    {m.Name}");
```

Real output:

```
Declaring type: Program
Method name:    <Main>$
```

This is the proof: running code from inside the top-level statements and
asking the runtime "what method and type is this code actually inside of
right now" gets back a real class named `Program` and a real method named
`<Main>$`. The angle brackets and `$` in `<Main>$` aren't legal characters
in a name you could type yourself in C# — that's the compiler marking this
as a name *it* generated, not one you wrote. Top-level statements are
therefore not a different execution model; they're the exact same
class-plus-`Main`-method shape every C# program has always needed, with the
compiler writing that wrapper for you instead of you typing it by hand.

### CS Lens

Not a hard concept in the design-pattern/SE-principle sense — this is
tooling and language ceremony, not an architectural idea. Worth naming once,
though: a compiler generating a name a programmer isn't allowed to type
(`<Main>$`) is a common technique wherever a tool needs to guarantee no
accidental collision with anything a human wrote — the same idea shows up
in compiler-generated backing fields for auto-properties and in generated
lambda-capture classes.

### SE Lens

Why does the SDK-style project file default to almost nothing written in
it, instead of the older style that listed every single source file
explicitly inside the project file? The alternative not chosen — the
pre-2017 verbose `.csproj` format — required updating the project file by
hand every time a `.cs` file was added, renamed, or removed, which meant
noisy, error-prone diffs on nearly every commit just from file bookkeeping,
completely separate from any real code change. The SDK-style format instead
auto-includes source files by convention (anything under the project
folder, by default) and inherits its build behavior from the referenced
SDK. The real cost this project is accepting: a bit less explicit control
over exactly what's included — rarely a problem for a project this shape,
but a real tradeoff, not a free win.

### Commands Needed

- `dotnet new console -o <folder>` — `new` creates a project from a
  built-in template; `console` names the specific template ("Console
  App", per the real output above); `-o <folder>` (short for `--output`)
  names the folder to create it in, which also becomes the project's
  default name.
- `dotnet run` — builds the project (restoring first if needed) and then
  immediately executes the resulting program, streaming its console output
  back to this same terminal.

### Run It — Real Output

```
dotnet run
```

```
Hello, World!
```

Captured this session, from inside the real `ToolDB/` folder.

### Connecting Back

The SDK confirmed in the previous unit is the exact toolchain that just
generated this project file and ran it successfully. The next unit adds the
one thing this project doesn't have yet: a real external dependency.

---

## Concept Unit: Installing a Package — NuGet, `PackageReference`, and Restore

### The Problem

Lesson 1 needs to talk to a SQLite database file from C#. .NET's own base
class library doesn't include a SQLite driver — that functionality lives in
a separately published package, `Microsoft.Data.Sqlite`. How does a project
pull in someone else's already-written, already-compiled code, with its own
version and its own dependencies, without manually hunting down a `.dll` and
copying it in by hand?

### Introduce the Concept in Isolation

Back in the (recreated) throwaway `LabScratch` project, run:

```
dotnet add package Microsoft.Data.Sqlite
```

Real output, captured this session (trimmed — the full run also shows every
individual network request):

```
info : Adding PackageReference for package 'Microsoft.Data.Sqlite' into project '.../LabScratch/LabScratch.csproj'.
info : Restoring packages for .../LabScratch/LabScratch.csproj...
info : Installed Microsoft.Data.Sqlite 10.0.11 from https://api.nuget.org/v3/index.json to C:\Users\g4m3r\.nuget\packages\microsoft.data.sqlite\10.0.11 with content hash ...
info : Installed SQLitePCLRaw.provider.e_sqlite3 2.1.12 from https://api.nuget.org/v3/index.json to C:\Users\g4m3r\.nuget\packages\sqlitepclraw.provider.e_sqlite3\2.1.12 with content hash ...
info : Installed SQLitePCLRaw.core 2.1.12 from https://api.nuget.org/v3/index.json to C:\Users\g4m3r\.nuget\packages\sqlitepclraw.core\2.1.12 with content hash ...
info : Installed SQLitePCLRaw.bundle_e_sqlite3 2.1.12 from https://api.nuget.org/v3/index.json to C:\Users\g4m3r\.nuget\packages\sqlitepclraw.bundle_e_sqlite3\2.1.12 with content hash ...
info : Installed Microsoft.Data.Sqlite.Core 10.0.11 from https://api.nuget.org/v3/index.json to C:\Users\g4m3r\.nuget\packages\microsoft.data.sqlite.core\10.0.11 with content hash ...
info : Package 'Microsoft.Data.Sqlite' is compatible with all the specified frameworks in project '.../LabScratch/LabScratch.csproj'.
info : PackageReference for package 'Microsoft.Data.Sqlite' version '10.0.11' added to file '.../LabScratch/LabScratch.csproj'.
log  : Restored .../LabScratch/LabScratch.csproj (in 1.76 sec).
```

This proves the concept has two real, separate halves, not one: **adding**
the reference (editing the project file to say "this project depends on
package X") and **restoring** it (actually resolving, downloading, and
recording every package needed) both happened here from a single command.
And this wasn't just one download — one requested package pulled in four
more (`Microsoft.Data.Sqlite.Core`, and three `SQLitePCLRaw.*` packages) as
its own dependencies, resolved automatically. This is called a **transitive
dependency graph**: dependencies of dependencies, followed all the way
down, not just the one package named on the command line.

`LabScratch.csproj` after the command:

```xml
<Project Sdk="Microsoft.NET.Sdk">

  <PropertyGroup>
    <OutputType>Exe</OutputType>
    <TargetFramework>net10.0</TargetFramework>
    <ImplicitUsings>enable</ImplicitUsings>
    <Nullable>enable</Nullable>
  </PropertyGroup>

  <ItemGroup>
    <PackageReference Include="Microsoft.Data.Sqlite" Version="10.0.11" />
  </ItemGroup>

</Project>
```

And the global package cache now genuinely holds it:

```
C:\Users\g4m3r\.nuget\packages\microsoft.data.sqlite\
  10.0.10
  10.0.11
```

(`10.0.10` was already present from unrelated earlier work on this machine —
proof this cache is shared across every .NET project on the machine, not
private to this one.)

### Discard the Throwaway Example

`LabScratch/` is deleted again. It proved what a fresh, first-time package
install looks like — the full download; it won't appear again.

### Project Change

- **Reference Source** — no reference counterpart. There is no earlier
  version of this dependency to port; this is the first external package
  this project has ever declared.
- **Files affected** — `ToolDB.csproj` (a new `<ItemGroup>` containing a
  `<PackageReference>` is added); `ToolDB/obj/project.assets.json` and
  related `obj/*.nuget.*` files are created by restore.
- **Change type** — add.
- **Location** — inside `ToolDB.csproj`, as a new `<ItemGroup>` element
  added after the existing `<PropertyGroup>` block from the previous unit.
- **Dependencies** — the `ToolDB` project created in the previous unit.

### The New Code

```
dotnet add package Microsoft.Data.Sqlite
```

Real output, captured this session, run inside the actual `ToolDB/` folder
(trimmed the same way as above — network request lines omitted):

```
info : Adding PackageReference for package 'Microsoft.Data.Sqlite' into project '.../ToolDB/ToolDB.csproj'.
info :   CACHE https://api.nuget.org/v3/registration5-gz-semver2/microsoft.data.sqlite/index.json
info : Restoring packages for .../ToolDB/ToolDB.csproj...
info : Package 'Microsoft.Data.Sqlite' is compatible with all the specified frameworks in project '.../ToolDB/ToolDB.csproj'.
info : PackageReference for package 'Microsoft.Data.Sqlite' version '10.0.11' added to file '.../ToolDB/ToolDB.csproj'.
log  : Restored .../ToolDB/ToolDB.csproj (in 122 ms).
```

Notice what's different from the throwaway lab's output above: every line
that was `GET .../OK ...` before is now `CACHE ...`, and the whole restore
finished in `122 ms` instead of over a second. This is the **global package
cache** from the Terms glossary, proven, not just described: the exact same
package version was already sitting on disk from the lab a moment ago, so
this restore reused it instead of downloading it again.

### The Updated Project

`ToolDB.csproj`, in full, with the new block marked:

```xml
<Project Sdk="Microsoft.NET.Sdk">

  <PropertyGroup>
    <OutputType>Exe</OutputType>
    <TargetFramework>net10.0</TargetFramework>
    <ImplicitUsings>enable</ImplicitUsings>
    <Nullable>enable</Nullable>
  </PropertyGroup>

  <ItemGroup>                                                  <!-- ← new -->
    <PackageReference Include="Microsoft.Data.Sqlite" Version="10.0.11" />  <!-- ← new -->
  </ItemGroup>                                                 <!-- ← new -->

</Project>
```

The project file as a whole now declares two separate things at once: what
kind of program to build and which .NET version to build it against (the
`PropertyGroup`, from the previous unit), and what external code it depends
on to do that (the new `ItemGroup`). Both are read by the same `dotnet
build`/`dotnet run` commands from here on — nothing about invoking the
project changes because a dependency was added.

### Mechanical Walkthrough

- `<ItemGroup>` — an MSBuild container element, structurally the same idea
  as `PropertyGroup` above but for *items* (a category of MSBuild data
  representing a list of things — files, references) rather than
  single-valued properties.
- `<PackageReference Include="Microsoft.Data.Sqlite" Version="10.0.11" />`
  — one item inside that group. `Include="Microsoft.Data.Sqlite"` names
  which package; `Version="10.0.11"` pins which exact published version.
  This single self-closing element is the entire, complete declaration of a
  dependency — there's no separate "download this file" step written
  anywhere by hand; the SDK's build logic (imported via the `Sdk=` attribute
  on the root `<Project>` element, explained in the previous unit) already
  knows what to do with a `PackageReference` element without this file
  spelling it out.

### CS Lens

Dependency resolution — reading a set of declared dependencies, following
each one's own dependencies recursively, and settling on one compatible
version of everything — is a hard concept worth naming as a pattern, not
just a NuGet-specific detail. Also recognized in: `npm`'s `package.json` +
`package-lock.json`, Python's `pip` with `requirements.txt` or Poetry's
`poetry.lock`, Rust's `Cargo.toml` + `Cargo.lock`, and Java's Maven with
`pom.xml`. Every one of these tools solves the identical underlying
problem — declare what you need, let the tool compute the full graph and
freeze the exact result — even though the file formats and command names
are all different.

### SE Lens

Why isn't the downloaded package content committed directly into the
project's own source control, instead of being fetched fresh into a shared
cache? The alternative not chosen — vendoring: copying dependency binaries
straight into the repository — keeps a clone fully self-contained with no
network dependency at build time, at the real cost of a much larger
repository, no clean way to see *which* dependency changed in a diff (a
binary blob replacing another binary blob), and no automatic handling of
*that* dependency's own dependencies. Declaring a `PackageReference` and
letting restore populate a shared cache keeps the repository small and the
dependency graph explicit and diff-able, at the real cost this project is
accepting: a fresh clone needs either network access or an already-warm
NuGet cache before its first build can succeed. The lock file
(`obj/project.assets.json`) is what keeps that first restore
*deterministic* rather than a live re-negotiation every time — worth seeing
for real:

```
C:\...\ToolDB\obj\project.assets.json (excerpt, real, this session):

{
  "version": 4,
  "targets": {
    "net10.0": {
      "Microsoft.Data.Sqlite/10.0.11": {
        "type": "package",
        "dependencies": {
          "Microsoft.Data.Sqlite.Core": "10.0.11",
          "SQLitePCLRaw.bundle_e_sqlite3": "2.1.12",
          "SQLitePCLRaw.core": "2.1.12"
        },
        ...
```

This is the transitive graph from the isolated lab, written down concretely:
`Microsoft.Data.Sqlite` at exactly `10.0.11`, depending on exactly these
other packages at exactly these versions — not "whatever the latest
compatible version happens to be the next time someone restores."

### Commands Needed

- `dotnet add package <name>` — adds a `PackageReference` for the named
  package at its current latest stable version to the project file in the
  current directory, and immediately restores it.
- `dotnet build` — compiles the project; as part of that, it restores any
  packages that aren't already resolved (this is *implicit restore* — a
  standalone `dotnet restore` command also exists, but `build` and `run`
  trigger it automatically when needed, so it's rarely typed on its own).

### Run It — Real Output

```
dotnet build
```

Real output, captured this session, from inside `ToolDB/`:

```
  Determining projects to restore...
  All projects are up-to-date for restore.
  ToolDB -> .../ToolDB/bin/Debug/net10.0/ToolDB.dll

Build succeeded.
    0 Warning(s)
    0 Error(s)

Time Elapsed 00:00:01.00
```

`ToolDB` still only prints `Hello, World!` when run — the package is
installed and proven to build cleanly alongside it, but nothing in
`Program.cs` calls into it yet. That's Lesson 1's job.

### Connecting Back

The SDK version confirmed in Unit 1 created the `net10.0`-targeted project
in Unit 2 — and that exact `net10.0` value is precisely what Unit 3's
restore checked `Microsoft.Data.Sqlite` against before writing
`"Package 'Microsoft.Data.Sqlite' is compatible with all the specified
frameworks in project ToolDB.csproj"` into the real output above. All three
units are one continuous chain, not three separate facts.

---

## Closing

### Connect the Pieces

One trace, start to finish, using only what actually happened on this
machine this session: `dotnet --version` (Unit 1) confirmed SDK `10.0.301`
was present. That exact SDK is what `dotnet new console -o ToolDB` (Unit 2)
used to generate `ToolDB.csproj`, declaring `<TargetFramework>net10.0</
TargetFramework>`. That exact TFM is the value NuGet's restore step checked
`Microsoft.Data.Sqlite` against when `dotnet add package Microsoft.Data.
Sqlite` (Unit 3) ran, before it was willing to add the `PackageReference`
and write it into `project.assets.json`. Change any one link — a different
SDK, a different TFM, a package that genuinely didn't support `net10.0` —
and the next link has nothing valid to check against.

### What Breaks Without This

Try this yourself, in the real `ToolDB/` folder: rename `ToolDB.csproj` to
`ToolDB.csproj.bak` (or move it out of the folder entirely), then run
`dotnet build` again. There is now no project file for the SDK-style build
process to read — no declared output type, no target framework, no
dependency list — and the CLI has nothing to guess from; it reports that it
can't find a project file to build in the current directory, rather than
falling back to any default. Rename the file back before continuing —
nothing later in this lesson depends on having broken it.

### Version Control: Turning This Into a Real Commit

Every lesson in this project ends in a git commit — starting with this one.
Inside `ToolDB/`, before committing, one more real file is needed: a
`.gitignore`. Without it, the `obj/` and `bin/` folders created by every
build and restore above — generated output, not source — would get
committed too, and would keep changing on every single future build,
polluting every later diff with noise that has nothing to do with any real
code change.

`.gitignore`:

```
bin/
obj/
```

Two lines, one per generated folder: `bin/` holds build output (the
compiled `ToolDB.dll` seen in the build output above); `obj/` holds
intermediate build and restore artifacts (`project.assets.json` and the
rest of the restore lock-file machinery from Unit 3). Neither is source —
both are fully and deterministically regenerated by `dotnet build` from the
files that *are* committed, which is exactly why they don't belong in
history.

Commands, run from inside `ToolDB/`:

```
git init
git add .gitignore ToolDB.csproj Program.cs
git commit -m "..."
```

- `git init` — creates a new, empty repository in the current folder (a
  hidden `.git/` subfolder holding all future history).
- `git add <files>` — stages the named files: marks them to be included in
  the *next* commit. Named explicitly here, rather than `git add .`,
  because `bin/` and `obj/` already exist in this folder from the builds
  above, and naming files explicitly is the safest way to avoid
  accidentally staging generated output before `.gitignore` has been
  double-checked.
- `git commit -m "..."` — records a permanent snapshot of everything
  currently staged, labeled with the given message.

### Exercises

- Run `dotnet --info` again and find the exact line that lists
  `Microsoft.WindowsDesktop.App` — confirm for yourself it's present, since
  Lesson 5 depends on it.
- Delete `ToolDB/obj/` entirely (not `bin/`, just `obj/`) and run `dotnet
  build` again. Watch the restore step run again from scratch and recreate
  it — proof that `obj/` is fully regenerable and never needed to be kept.
- Open the full (non-trimmed) `project.assets.json` and find every one of
  the four transitive dependencies `Microsoft.Data.Sqlite` pulled in during
  Unit 3's isolated lab. Confirm each one's version matches what the real
  `dotnet add package` output reported.

### Definition of Done

- [ ] `dotnet --version` and `dotnet --info` run successfully, and
      `Microsoft.WindowsDesktop.App` is confirmed present among the
      installed runtimes.
- [ ] A `ToolDB/` project exists, created with `dotnet new console -o
      ToolDB`, and `dotnet run` prints `Hello, World!`.
- [ ] `ToolDB.csproj` contains a `<PackageReference Include="Microsoft.Data.
      Sqlite" .../>` element, added via `dotnet add package
      Microsoft.Data.Sqlite`.
- [ ] `dotnet build` succeeds with 0 warnings and 0 errors.
- [ ] A `.gitignore` excluding `bin/` and `obj/` exists.
- [ ] `git init` has been run, and a first commit exists containing
      `.gitignore`, `ToolDB.csproj`, and `Program.cs` — with a message
      explaining *why* this exists (the toolchain and dependency every
      later lesson is pinned against), not just restating "initial
      commit."

Next lesson: **Lesson 1 — Connecting to a Database File**, building directly
on the `Microsoft.Data.Sqlite` package installed here.
