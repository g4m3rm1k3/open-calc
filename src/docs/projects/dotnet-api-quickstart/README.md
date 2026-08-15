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
