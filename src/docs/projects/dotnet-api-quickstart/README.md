# .NET API Quick Start — Interfaces, Discovery, and Add-in Basics

**What this is:** a fast, condensed series — not the full, isolated-lab
treatment this site's other curricula use — for one specific, real
goal: reading and using an unfamiliar .NET/C# API (a real, existing
example: Mastercam's own .NET API) when you already know how to code
(Python, in this case) but don't yet know C#'s own real answers to
"what's an interface," "how do I explore a class I've never seen
before the way I'd use `dir()`/`help()` in Python," and "what is this
WPF template thing a host application gives me to build a plugin
with."

**What you need first:** real, working programming experience (this
series assumes Python) and nothing else. No prior C# assumed at all.

## Lessons

| # | Lesson | Covers |
|---|---|---|
| 01 | [Interfaces and Implementation](lesson-01-interfaces-and-implementation.md) | what an interface actually is, what "implementing" one means, why real APIs hand you interfaces instead of concrete classes |
| 02 | [Reading an Unfamiliar Type's Shape](lesson-02-reading-an-unfamiliar-types-shape.md) | properties vs. methods, method signatures, overloads, and just enough generics (`List<T>`, `IEnumerable<T>`) to read a real signature without panicking |
| 03 | [Discovering an API at Runtime](lesson-03-discovering-an-api-at-runtime.md) | C#'s real, direct equivalent of Python's `dir()`/`help()` — `System.Reflection`, printing out a real, unfamiliar type's members and trying them |
| 04 | [Discovering an API in Visual Studio](lesson-04-discovering-an-api-in-visual-studio.md) | the way this actually gets done day to day — IntelliSense, Go To Definition, and the Object Browser |
| 05 | [Class Libraries and How a Host App Loads Your Code](lesson-05-class-libraries-and-how-a-host-app-loads-your-code.md) | what a Class Library project actually is, and the real, general pattern behind "a host application loads a plugin" |
| 06 | [A WPF UserControl for a Host Application](lesson-06-a-wpf-usercontrol-for-a-host-application.md) | the real, specific difference between a standalone `Window` and the `UserControl` a real add-in template hands you |
| 07 | [NuGet Basics](lesson-07-nuget-basics.md) | what NuGet actually is — Python's `pip` for .NET — `PackageReference`, `dotnet add package`, and where packages actually live |
| 08 | [Logging the Professional Way](lesson-08-logging-the-professional-way.md) | `Microsoft.Extensions.Logging` from NuGet, log levels, structured logging, and why `Console.WriteLine` isn't what real apps use |
| 09 | [Configuration With `appsettings.json`](lesson-09-configuration-with-appsettings-json.md) | the real, standard way a professional .NET app reads settings, instead of hardcoding them |
| 10 | [Solution and Project Structure](lesson-10-solution-and-project-structure.md) | `.sln` vs `.csproj`, multiple projects referencing each other, and how to navigate a real, unfamiliar add-in template's files |
| 11 | [Just Enough C# Syntax](lesson-11-just-enough-csharp-syntax.md) | value vs. reference types, `var`, namespaces and `using`, and the other small, real syntax differences from Python that trip people up first |
| 12 | [Enums — The Real Fix for Numeric-Code Lookups](lesson-12-enums-the-real-fix-for-numeric-code-lookups.md) | replacing a hand-maintained `dict` of numeric codes to string labels with a real, built-in C# `enum` |
| 13 | [Exception Handling](lesson-13-exception-handling.md) | `try`/`catch`/`finally`, real exception types, and catching specific vs. general failures from a real host API call |
| 14 | [LINQ — Querying Collections the Real, Standard Way](lesson-14-linq-querying-collections.md) | `Where`, `Select`, `FirstOrDefault`, and reading a real LINQ chain, for the `IList<T>`/`IEnumerable<T>` collections a real API hands you |
| 15 | [Events and Delegates](lesson-15-events-and-delegates.md) | how a real host API notifies your code when something happens, and how to subscribe to it |
| 16 | [Extension Methods](lesson-16-extension-methods.md) | why `.Where()` works on a type you never wrote, and why it won't show up the way Lesson 03's reflection expects |
| 17 | [Debugging and the Immediate Window](lesson-17-debugging-and-the-immediate-window.md) | breakpoints, the Watch window, and the Immediate Window — the real, direct C# equivalent of "I just print stuff and look at it" |
| 18 | [Async and Await — Just Enough to Read It](lesson-18-async-and-await.md) | reading and calling a real `async`/`await` method without needing the full, real threading model behind it |
