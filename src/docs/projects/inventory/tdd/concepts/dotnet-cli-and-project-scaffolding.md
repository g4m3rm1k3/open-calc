# Concept: The `dotnet` CLI and Project Scaffolding

**What you'll understand by the end:** what `dotnet new`, `dotnet build`, and `dotnet run` each actually do, and what "scaffolding" a project really produces.

**Prerequisites:** none.

## Setup

The .NET SDK installed (`dotnet --version` prints a version number, e.g. `10.0.301`). No existing project needed — this creates one.

## The Problem

Before any C# code can be organized into something the compiler recognizes as "a project," something has to create the files that say what kind of program this is (a console app? a GUI app? a library?) and set up a starting point to build from — by hand, from nothing, every time, would be needless repeated boilerplate.

## The Isolated Example

```
dotnet new console -n Demo
```

**Real output:**
```
The template "Console App" was created successfully.

Processing post-creation actions...
Restoring .../Demo/Demo.csproj:
  Determining projects to restore...
  Restored .../Demo/Demo.csproj (in 53 ms).
Restore succeeded.
```

The command generated two files. `Demo.csproj`:
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
**Real output:**
```
Hello, World!
```

**What this proves:** one command produced a complete, immediately-runnable program — a project file describing how to build it, and a source file with real (if minimal) code — without any file being typed by hand first. `dotnet run` then proved the generated code isn't just a placeholder: it actually compiles and executes.

## Mechanical Walkthrough

- `dotnet` — the .NET command-line tool: one CLI that can scaffold, build, and run projects, in the same role `python`/`node` play for their own ecosystems.
- `new` — the subcommand for scaffolding a new project from a **template**, a named, pre-defined starting file set. `console` names which template; others exist (`classlib` for a library, `wpf` for a desktop GUI app) — `dotnet new list` prints the full set installed locally.
- `-n Demo` — names the new project `Demo`; becomes both the folder name and the project's default namespace.
- `Program.cs`'s single line, with no visible `Main` method anywhere, is C#'s **top-level statements** feature: the compiler generates an implicit entry point (a hidden `Main` method) wrapping whatever statements sit at a file's top level, so a minimal program doesn't need the ceremony of an explicit `class Program { static void Main() { ... } }` wrapper.
- `dotnet build` compiles a project without running it, producing a `.dll` (the real compiled output — even for an `Exe` project, the actual code lives in a `.dll`; a small native `.exe` stub loads and runs it).
- `dotnet run` does both: builds, then immediately executes the result.

## CS Lens

This is **code generation from a template** — producing a working starting artifact from a named, parameterized pattern rather than starting from a blank file.

Also recognized in: `npm create vite@latest` and `create-react-app` (Node/JS's own project scaffolders), Rails' `rails new`, Django's `django-admin startproject`, Java's Maven archetypes — nearly every modern language ecosystem ships some form of "generate a working starting project" tool.

## SE Lens

The alternative — hand-typing a project file and starting source file for every new project — is a small, repeated cost per project, but a real one: it's easy to get subtly wrong (a missing property, a typo in a framework reference) in a way that only surfaces as a confusing build error later. A generated starting point is a working, valid project *first*, from generation itself, before any code you personally trust has been written into it — a real baseline to build from rather than debug into existence.

## Connection

Every WPF, console, or library project used going forward starts from this exact mechanism. `csproj-sdk-style-project-file.md` covers what the generated `.csproj` file's own properties actually control, in depth.

## Try It Yourself

1. Run `dotnet new list` and read the real list of templates installed on your machine — confirm `console`, `classlib`, and `wpf` are all really there.
2. Change `Program.cs` to print something else, save, and run `dotnet run` again with no rebuild step of your own — confirm it picks up the change automatically.
3. Delete `bin/` and `obj/` (the folders `dotnet build` creates) entirely, then run `dotnet run` again with no other changes. Confirm it recreates them and still works — proof they're disposable, regenerable build output, not something to hand-edit or commit.
