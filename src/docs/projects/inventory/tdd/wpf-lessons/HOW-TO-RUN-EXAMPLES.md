# How to Run a Concept's Isolated Example Yourself

Every concept file in `../concepts/` has a "Setup" section and an
isolated example — real code, meant to be typed and run, not just read.
This page is the one place that explains the mechanics of *doing* that,
so no individual concept file has to re-explain it. Read this once.

## Where these examples live

Nowhere near the real project (`wpf-app/CncWpf`). Make one scratch folder
anywhere convenient — outside any real project entirely, e.g.
`wpf-labs/` next to (not inside) `wpf-app/` — and create a **new,
separate folder per example** inside it, one per concept file. Each is
fully disposable: delete it the moment you're done, or leave it around,
it doesn't matter — nothing in it is ever referenced by the real project.

## Step 1: pick a template, and know why

Every concept file's own "Setup" section now states the exact command —
but the reasoning behind *which template* is worth having once, so a
future concept file with a command you haven't seen yet still makes
sense:

- **`console`** — for any concept that's pure C# language syntax with no
  UI involved (`partial`, namespaces, access modifiers, constructors,
  inheritance, classes/objects themselves). Fastest to build and run;
  output is plain text in the terminal, easy to read and paste as real
  proof.
- **`wpf`** — for anything that's WPF-specific (XAML, a `Window`, a
  `Grid`, a `Button`, data binding). Needs the actual WPF framework
  linked in (`UseWPF`, `csproj-sdk-style-project-file.md`), which
  `console` doesn't have.
- **`classlib`** — only when a concept specifically needs *two separate
  projects* referencing each other (so far: only
  `csharp-access-modifiers.md`, to prove `internal` really is invisible
  across a project boundary, not just a file boundary). Rare; a concept
  file's own Setup says so explicitly when it's needed.

## Step 2: the actual command

```
dotnet new console -n SomeDemo -o SomeDemo
```
or
```
dotnet new wpf -n SomeDemo -o SomeDemo
```
`-n SomeDemo` names the project (and its default namespace); `-o SomeDemo`
puts it in a folder of the same name, created for you. Run this from
inside your scratch folder — pick any name you like for `SomeDemo`; it
never matters and nothing else depends on it. Then `cd SomeDemo` before
running anything else.

## Step 3: adding or editing files — the part that isn't obvious

**A `.cs` file's name, and where it sits in the folder, mean nothing to
the compiler.** This is the single most common wrong assumption coming
from a language like Java, where a class's package genuinely has to
match its folder path or the build fails. **C# has no such rule.** An
SDK-style project (everything `dotnet new` generates — see
`csproj-sdk-style-project-file.md`) automatically compiles *every* `.cs`
file anywhere under the project folder, at any depth, with any name.

Concretely:

- To **add a new file** a concept file's example calls for (e.g.
  `Robot.Body.cs`), just create it, with that exact name, directly in the
  project folder (the one `-o SomeDemo` created, right next to the
  auto-generated `Program.cs`). No registration step, no project-file
  edit, nothing else required — the next `dotnet build`/`dotnet run`
  picks it up automatically.
- To **edit the generated `Program.cs`**, just open it and replace its
  contents with whatever the concept file's example shows — `dotnet new
  console` always generates one, with a single `Console.WriteLine("Hello,
  World!");` line, meant to be overwritten.
- **A dot inside a filename (`Robot.Body.cs`, `Robot.Brain.cs`) is purely
  cosmetic** — the same file could be named `RobotPart1.cs` and behave
  identically. Some real C# codebases use a `TypeName.Aspect.cs` naming
  pattern (matching this track's own `Robot.Body.cs`/`Robot.Brain.cs`) as
  a *human* hint about which type a file's `partial` piece belongs to —
  a filename convention, never something the compiler reads or enforces.
  What actually determines "these two files are the same class" is the
  code inside them: matching `namespace` and `partial class Name` — never
  the filename, and never a folder.

## Step 4: build and run

```
dotnet build
dotnet run
```
For a `console` project, real output prints directly to the terminal.
For a `wpf` project, `dotnet run` opens a real window — confirm it's
really running with `tasklist /FI "IMAGENAME eq SomeDemo.exe"` from a
second terminal, then close the window (or `taskkill /F /IM
SomeDemo.exe`) when done.

## Step 5: discard

Every concept file says so explicitly when the example is meant to be
deleted rather than kept. When it does: delete the whole per-example
folder, not just the `.cs` file — there is nothing in it worth keeping,
and the next example starts from a clean `dotnet new` regardless.
