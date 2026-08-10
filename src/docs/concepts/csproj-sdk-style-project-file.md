# Concept: The SDK-Style Project File (`.csproj`)

**What you'll understand by the end:** what a `.csproj` file's XML properties actually configure, and how a WPF project's file differs from a plain console project's.

**Prerequisites:** `dotnet-cli-and-project-scaffolding.md` (this file explains the project `dotnet new` scaffolding produces).

## Setup

*(Full walkthrough of these mechanics: `../wpf-lessons/HOW-TO-RUN-EXAMPLES.md`.)*

```
dotnet new wpf -n ConceptDemo -o ConceptDemo
```
Nothing to edit yet — the generated `.csproj` itself is the example.

## The Problem

Before any window can exist, something has to record, in one canonical place, what kind of program this is, which .NET version it targets, and which optional framework features (like WPF itself) it needs linked in.

## The Isolated Example

The generated `ConceptDemo.csproj` (from the `dotnet new wpf` in Setup, above), in full:
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

**What this proves:** nothing here is hand-maintained boilerplate — every line is a real, individually meaningful setting read by the build system; changing or removing any one of them changes what the project actually is (proven directly below by removing `UseWPF`).

Removing `<UseWPF>true</UseWPF>` from `ConceptDemo.csproj`, and adding a
`TextBlock` inside `MainWindow.xaml`'s generated `<Grid></Grid>`, then building:
```
dotnet build
```
**Real failure:**
```
error MC3074: The tag 'TextBlock' does not exist in the namespace
'http://schemas.microsoft.com/winfx/2006/xaml/presentation'.
```
Restoring the line and rebuilding:
```
Build succeeded.
    0 Warning(s)
    0 Error(s)
```
`UseWPF` isn't decorative — without it, the build system doesn't know to compile `.xaml` files or link WPF's own controls in at all, so a real WPF element becomes an unrecognized tag.

## Mechanical Walkthrough

- `<Project Sdk="Microsoft.NET.Sdk">` — the whole file is XML; `Sdk="Microsoft.NET.Sdk"` says "build this using .NET's own standard, modern build logic" — the **SDK-style** project format, which discovers `.cs`/`.xaml` files by folder convention rather than listing every source file explicitly (the older, pre-2016 format did list every file).
- `<OutputType>WinExe</OutputType>` — what kind of binary this compiles into: a Windows GUI executable with no visible console window, as opposed to `Exe` (a console app) or `Library` (a `.dll`, not runnable on its own).
- `<TargetFramework>net10.0-windows</TargetFramework>` — which .NET version this compiles against; the `-windows` suffix specifically unlocks Windows-only APIs (WPF is Windows-only).
- `<Nullable>enable</Nullable>` — turns on C#'s nullable-reference-type checking: the compiler warns when a reference might be used while `null` without being checked first.
- `<ImplicitUsings>enable</ImplicitUsings>` — auto-adds a handful of extremely common `using` directives (`System`, `System.Linq`, ...) to every file, without writing them by hand.
- `<UseWPF>true</UseWPF>` — the flag that actually makes this a WPF project: tells the build system to also compile `.xaml` files and link in the WPF framework libraries, proven directly above by removing it.

## CS Lens

This is **declarative configuration** — the file states *what* the project is and needs, not a sequence of setup steps to execute; a build tool reads and interprets it rather than running it as a program.

Also recognized in: `package.json` (Node), `pyproject.toml`/`setup.py` (Python), `Cargo.toml` (Rust) — every ecosystem's own project-manifest format does this same job, in its own syntax.

## SE Lens

The SDK-style format's real payoff over the older, fully-explicit format: adding a new `.cs`/`.xaml` file requires *no* project-file edit at all — the build system finds it automatically by folder convention. The tradeoff: a stray file left in the folder for the wrong reason gets compiled in too, silently — the older style's verbosity at least made "what's actually part of this build" fully explicit and auditable in one place.

## Connection

`dotnet-cli-and-project-scaffolding.md` covers the command that generates this file. `xaml-declarative-ui-markup.md` covers what `UseWPF` actually unlocks the build system to do with `.xaml` files.

## Try It Yourself

1. Change `<OutputType>WinExe</OutputType>` to `<OutputType>Exe</OutputType>`, rebuild, and run the result from a terminal — confirm a console window now appears alongside the WPF window (a visible difference this one property controls).
2. Remove `<Nullable>enable</Nullable>` entirely, add code that dereferences a `string?` (nullable string) without checking it first, and rebuild — confirm the warning that appeared with `Nullable` enabled is now gone.
3. Delete `<TargetFramework>net10.0-windows</TargetFramework>` and replace it with plain `net10.0` (no `-windows`), then rebuild — read the real error about WPF needing the `-windows` suffix.
