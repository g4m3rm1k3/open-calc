# Lesson 07: NuGet Basics

**What this covers:** NuGet — the real, direct .NET equivalent of
Python's `pip` — how a real, external package ends up referenced in
your project, where it actually lives, and how to read what's already
there.

**What you need first:** [Lesson 05](lesson-05-class-libraries-and-how-a-host-app-loads-your-code.md).

---

## The real, direct parallel

| Python | .NET |
|---|---|
| `pip install requests` | `dotnet add package Newtonsoft.Json` |
| `requirements.txt` | `<PackageReference>` entries in your `.csproj` |
| PyPI | NuGet.org |
| `site-packages/` | a real, shared local cache (`~/.nuget/packages`) |

NuGet.org is the real, central, public registry almost every real,
open-source .NET package is published to — the same real role PyPI
plays for Python. A **NuGet package** is a real, versioned `.nupkg`
file bundling compiled code (one or more real `.dll` files) plus
metadata about it.

## Adding a real package

From a terminal, in your project's real folder:

```
dotnet add package Microsoft.Extensions.Logging
```

Or, in Visual Studio: right-click your project → **Manage NuGet
Packages** → search, select, **Install**. Both real routes do the
identical, real thing underneath.

## Where the real reference actually lives

Open your project's own `.csproj` file — a real, plain XML file — and
you'll find a new, real line:

```xml
<ItemGroup>
  <PackageReference Include="Microsoft.Extensions.Logging" Version="8.0.0" />
</ItemGroup>
```

This is the real, entire, durable record of the dependency — genuinely
just a real name and a real version number, checked into source
control like any other real file. The actual, real compiled code isn't
copied into your project at all; it lives once, centrally, in your
real local NuGet cache, and gets pulled in ("restored") automatically
whenever you build. This is the real reason a `.csproj` file, unlike a
`requirements.txt`, never needs a real virtual environment alongside
it — the real cache is already shared, machine-wide.

## Reading what a project already depends on

Given any real, unfamiliar C# project — including a real add-in
project someone else set up for you — open its `.csproj` and look for
every real `<PackageReference>` line. This tells you, at a glance,
every real external library it depends on and the real, exact version,
the identical real information `pip freeze` or `requirements.txt` gives
you in Python, just stored differently.

## Real version numbers, briefly

NuGet uses real semantic versioning: `MAJOR.MINOR.PATCH` (`8.0.0`). A
real major version bump (`7.x` → `8.x`) can mean real, breaking
changes; a real minor or patch bump (`8.0.0` → `8.0.3`) should be
safe to take without changing your own code. Pinning an exact real
version (rather than a real range) is the default, and is the safer,
real choice for a project you want to build reliably.

## Definition of done

- [ ] You added a real NuGet package to a project using either
      `dotnet add package` or Visual Studio's own package manager.
- [ ] You opened the resulting `.csproj` and found the real
      `<PackageReference>` line it added.
- [ ] You can state, in your own words, where the real, compiled code
      for a NuGet package actually lives once installed.
- [ ] You looked at a real, existing project's `.csproj` and listed
      every real package it depends on, without installing anything.

## Next

[Lesson 08 — Logging the Professional Way](lesson-08-logging-the-professional-way.md)
uses your first, real NuGet package — `Microsoft.Extensions.Logging`
— to replace `Console.WriteLine` with what a real, professional .NET
app actually uses.
