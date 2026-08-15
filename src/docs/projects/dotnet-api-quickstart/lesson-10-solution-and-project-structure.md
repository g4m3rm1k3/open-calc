# Lesson 10: Solution and Project Structure

**What this covers:** `.sln` vs `.csproj`, how one project references another
(or references your host application's own real assemblies), and how to
open an unfamiliar, real add-in template and know what you're looking at.

**What you need first:** [Lesson 05](lesson-05-class-libraries-and-how-a-host-app-loads-your-code.md).

---

## Solution vs. project: two real, different things

A **project** (`.csproj`) is one real, buildable unit — one real `.dll`
or `.exe` comes out of it. A **solution** (`.sln`) is a real, plain
text file that groups one or more real projects together so Visual
Studio can open, build, and navigate them as one real workspace. A
real add-in you're handed is almost always a real **solution**
containing at least one real project — sometimes several: your actual
add-in Class Library, maybe a separate project for shared data models,
maybe a small console project for quick testing.

There's no real, direct Python equivalent to a solution — the closest
real comparison is a monorepo holding several real, separate
`pip`-installable packages, each with its own `setup.py`.

## Solution Explorer: the real map

Visual Studio's **Solution Explorer** panel (View → Solution Explorer)
shows the real, whole structure at once: the solution at the top,
each real project underneath it, and inside each project — a real
**Dependencies** (or **References**) node, then your real `.cs` and
`.xaml` files. Expanding **Dependencies** shows you every real thing
this specific project depends on: NuGet packages (Lesson 07) under one
real heading, and **project references** or plain **assembly
references** under others.

## Two real, different kinds of reference

```xml
<!-- A NuGet package (Lesson 07) -->
<PackageReference Include="Microsoft.Extensions.Logging" Version="8.0.0" />

<!-- Another project in the same, real solution -->
<ProjectReference Include="..\MyAddIn.Shared\MyAddIn.Shared.csproj" />

<!-- A real, local .dll on disk — not from NuGet -->
<Reference Include="Mastercam.NETAddInAPI">
  <HintPath>C:\Program Files\...\Mastercam.NETAddInAPI.dll</HintPath>
</Reference>
```

A real add-in template almost always includes that third real form: a
plain `<Reference>` pointing at a real, local `.dll` file, usually
somewhere inside the host application's own real install folder — not
from NuGet at all. This is the real, exact reason `IHostAddIn`
(Lesson 05's illustrative interface) resolves and compiles: the real
type it names lives inside that specific, real, referenced `.dll`.
When you open an unfamiliar add-in template and want to know "where
does this interface actually come from," this is the first, real
place to look.

## `TargetFramework`: a real constraint you don't control

```xml
<PropertyGroup>
  <TargetFramework>net48</TargetFramework>
</PropertyGroup>
```

Near the top of any real `.csproj` is a real `TargetFramework`
(or `TargetFrameworks`, plural, for more than one). `net48` means real,
classic .NET Framework 4.8; `net8.0-windows` means a real, modern .NET
8 build. A real host application usually requires a specific, real
target — set by the template you were given, not something to change.
If you ever add a real NuGet package that refuses to install, a
mismatched `TargetFramework` is one of the real, common reasons why.

## Reading an unfamiliar solution, in order

1. Open the `.sln` — note how many real projects it contains, and each
   one's real name.
2. For the project that's actually your add-in, open its `.csproj` and
   read `TargetFramework` first.
3. Expand **Dependencies** in Solution Explorer — separate the real
   NuGet packages from the real, local host-assembly references.
4. Open whichever real class implements the host's known interface
   (Lesson 05) — that's your real, actual entry point.

## Definition of done

- [ ] You can state, in your own words, the real difference between a
      solution and a project.
- [ ] You opened a real add-in template's `.csproj` and found its
      `TargetFramework`.
- [ ] You found a real, local `<Reference>` (not NuGet) pointing at a
      host application's own `.dll`, and can say where that `.dll`
      lives on disk.
- [ ] You can state, in your own words, the real difference between a
      `<PackageReference>`, a `<ProjectReference>`, and a plain
      `<Reference>`.

## Next

[Lesson 11 — Just Enough C# Syntax](lesson-11-just-enough-csharp-syntax.md)
steps back to the real, small syntax differences from Python that
matter most once you're reading real code inside a project like this
one.
