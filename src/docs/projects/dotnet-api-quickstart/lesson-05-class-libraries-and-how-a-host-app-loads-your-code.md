# Lesson 05: Class Libraries and How a Host App Loads Your Code

**What this covers:** what a Class Library project actually is, and
the real, general mechanism behind "a host application (like
Mastercam) loads a plugin you wrote" — so the real add-in template
you've been handed stops being a mystery.

**What you need first:** [Lesson 01](lesson-01-interfaces-and-implementation.md).

**One honest note before you start:** the exact, real interface name
and method your specific host application looks for is defined in
*its own* real documentation — the example below is illustrative,
built to show the real, general mechanism, not a claim about what any
specific real product actually calls things. Check your own real docs
for the exact, real names.

---

## Two real kinds of .NET project, and why the difference matters

A **Console App** or **WPF App** project compiles to a real,
standalone `.exe` — something a real user (or you) double-clicks and
runs directly. A **Class Library** project compiles to a real `.dll`
instead — genuinely not runnable on its own at all. A `.dll` only ever
does anything once some *other*, real, running program loads it and
calls into it.

This is the real, entire shape of a plugin: your own, real code is a
Class Library; the host application (Mastercam, in your case) is the
real, separate `.exe` that loads your `.dll` and calls into it.

## The real, general mechanism, illustrated

A real host application, at its own real startup, does roughly this:

```csharp
// This is illustrative — your real host's actual code is proprietary
// and internal to it. Shown here only to make the real mechanism visible.
using System.Reflection;

foreach (string dllPath in Directory.GetFiles("plugins", "*.dll"))
{
    Assembly assembly = Assembly.LoadFrom(dllPath);

    foreach (Type type in assembly.GetTypes())
    {
        if (typeof(IHostAddIn).IsAssignableFrom(type) && !type.IsInterface)
        {
            IHostAddIn addIn = (IHostAddIn)Activator.CreateInstance(type);
            addIn.Initialize();
        }
    }
}
```

`Assembly.LoadFrom` is the real, standard .NET way to load a real
`.dll` at runtime, by path. `assembly.GetTypes()` — the identical real
reflection from Lesson 03, now used by the *host* instead of you —
lists every real type inside it. `typeof(IHostAddIn).IsAssignableFrom
(type)` asks "does this real type implement the specific interface I,
the host, know how to work with?" — and if so, `Activator.CreateInstance`
makes a real, live instance of it and calls a real, agreed-upon method
(`Initialize()`, here — your own real host's actual method name will
be whatever its own real documentation says).

## What this means for the project template you were given

A real add-in project template (the "WPF module/template something")
almost always already has this half solved for you: it's pre-configured
as a real Class Library, already references the host's own real
assemblies (so `typeof(IHostAddIn)` — or whatever it's actually
called — resolves correctly), and often already contains a real,
starter class implementing the required, real interface, with empty,
real method bodies for you to fill in. Understanding this lesson's
own, real, general mechanism is what lets you read that generated,
real starter code and know *why* every piece of it exists, rather than
treating it as boilerplate to leave alone.

## Definition of done

- [ ] You can state, in your own words, the real difference between
      what a Console/WPF App project produces and what a Class Library
      produces.
- [ ] You can explain, in your own words, the real, general sequence a
      host application follows to load and run a plugin.
- [ ] You opened your own, real, actual add-in project template and
      identified which real class is the one the host will instantiate.

## Next

[Lesson 06 — A WPF UserControl for a Host Application](lesson-06-a-wpf-usercontrol-for-a-host-application.md)
covers the one, real, practical difference this changes about how you
build the UI itself: not a standalone `Window`, but a `UserControl`
the host embeds inside its own, real window.
