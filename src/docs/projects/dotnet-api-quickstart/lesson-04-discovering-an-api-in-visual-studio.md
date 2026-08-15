# Lesson 04: Discovering an API in Visual Studio

**What this covers:** the way real, unfamiliar API exploration
actually happens most of the time — IntelliSense, Go To Definition,
and the Object Browser — faster than reflection (Lesson 03) for the
real, everyday case, and how the two complement each other.

**What you need first:** [Lesson 03](lesson-03-discovering-an-api-at-runtime.md).

---

## IntelliSense: real-time `dir()`, as you type

The instant you type `part.` in Visual Studio, a real, live dropdown
appears listing every real, available member — the identical real
information Lesson 03's own `GetMethods()`/`GetProperties()` loop
produced, without writing or running a single line of code. Keep
typing (`part.Cu`) and the real list narrows automatically.

Hovering over any real item in that list — or over `part` itself,
anywhere in your real code — shows a real, quick-info tooltip: the
full, real signature, and, if the library's own authors included real
documentation comments (very common in a real, professional API), the
real, authored explanation of what it does. This is the single fastest
real way to answer "what does this take, what does it return."

## Go To Definition: jump straight to the real, actual source

Right-click any real, unfamiliar type or method — `IMachinable`, say —
and choose **Go To Definition** (or press `F12` with your cursor on
it). Visual Studio jumps you directly to the real, actual declaration
— real, readable source if it exists, or a real, automatically
generated, decompiled signature if it doesn't (common for a real,
compiled-only library with no shipped source).

**Peek Definition** (`Alt+F12`) does the identical, real thing without
leaving your current file — a real, small, inline popup shows the
definition, and you keep working where you were.

## The Object Browser: the real, whole map at once

IntelliSense and Go To Definition both start from code you've already
written. The **Object Browser** (`Ctrl+Alt+J`, or View → Object
Browser) starts from nothing — it shows you every real namespace,
type, and member in any real, referenced assembly, browsable as a
real, plain tree, with the identical real signature detail
IntelliSense shows, for anything you click. This is the real, correct
tool for "I have a real, unfamiliar library referenced in my project
and I want to see everything it offers," before you've written any
real code against it at all — genuinely the closest real match to
Python's own `help(module)` printing an entire module's contents at
once.

## When to reach for reflection instead

Lesson 03's own, real, code-based approach still matters for one real
case these tools don't cover: a real object whose *declared* type
(an interface, say) is narrower than its real, actual type at runtime.
IntelliSense only ever shows you members of the real, *declared* type
you're looking at; if you genuinely need to know what real, concrete
class is underneath an interface-typed value, `GetType()` (Lesson 03)
is the real, correct, and only, way to ask.

## Definition of done

- [ ] You used IntelliSense's own real, live dropdown to explore a
      real, unfamiliar type's members.
- [ ] You used Go To Definition (or Peek Definition) on a real
      method call and saw its real, actual declaration.
- [ ] You opened the Object Browser and found a real, specific type
      inside a real, referenced library without writing any code first.
- [ ] You can state, in your own words, the one real case where
      reflection (Lesson 03) tells you something these tools can't.

## Next

[Lesson 05 — Class Libraries and How a Host App Loads Your Code](lesson-05-class-libraries-and-how-a-host-app-loads-your-code.md)
covers the real, general shape behind a plugin/add-in project — what
it actually is, and how a real, separate application ends up running
your own, real, compiled code at all.
