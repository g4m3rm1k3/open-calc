# Concept: The Memento Pattern

**What you'll understand by the end:** how to capture an object's internal state externally, at a specific moment, so it can be restored later — without the thing doing the capturing ever getting to see or touch that state's actual structure.

**Prerequisites:** none.

## Setup

```
dotnet new console -o lab-memento
cd lab-memento
```

Replace the generated `Program.cs`'s contents with the example below.

## The Problem

Undo is a common, real need: let a user reverse a change and get back exactly what was there before. The obvious approach — some other piece of code reaching into the changed object and copying out its fields by hand — has a real cost: it forces that outside code to know the object's *entire* internal shape, and to keep tracking it correctly every time that shape changes. A `History` class that has to know `TextDocument` stores its content in a field called `text`, and update itself every time `TextDocument` gains a new field worth saving, is coupled to `TextDocument`'s internals in exactly the way encapsulation exists to prevent.

## The Isolated Example

```csharp
TextDocument doc = new TextDocument();
History history = new History();

doc.Content = "Draft one";
history.Push(doc.Save());

doc.Content = "Draft two";
history.Push(doc.Save());

doc.Content = "Draft three (typo)";
Console.WriteLine($"Current: {doc.Content}");

doc.Restore(history.Pop());
Console.WriteLine($"After undo: {doc.Content}");

doc.Restore(history.Pop());
Console.WriteLine($"After second undo: {doc.Content}");

class TextDocument
{
    public string Content { get; set; } = "";

    // Returns the saved state as a bare `object` — the Caretaker
    // (History, below) receives a handle to it, never the real type.
    public object Save() => new Memento(Content);

    public void Restore(object memento)
    {
        if (memento is Memento real)
        {
            Content = real.SavedContent;
        }
    }

    // Nested AND private: no code outside TextDocument can even name
    // this type, let alone construct one or read SavedContent.
    private class Memento
    {
        public string SavedContent { get; }
        public Memento(string content) => SavedContent = content;
    }
}

class History
{
    private readonly Stack<object> mementos = new();

    public void Push(object memento) => mementos.Push(memento);
    public object Pop() => mementos.Pop();
}
```

**Real output:**
```
Current: Draft three (typo)
After undo: Draft two
After second undo: Draft one
```

**What this proves:** `history.Pop()` returns state in the *exact* reverse order it was pushed — the most recently saved snapshot comes back first — and `doc.Restore(...)` correctly puts `Content` back to precisely what it was at that snapshot's moment, both times. `History` never read or wrote `Content` directly anywhere in this trace; it only ever held opaque handles it got from `TextDocument.Save()` and handed back unchanged to `TextDocument.Restore()`.

**Now prove `History` genuinely cannot reach inside a memento — not just that it didn't, but that it structurally can't.** Temporarily add this line right after the second `Undo`:

```csharp
object peeked = history.Pop();
TextDocument.Memento real2 = (TextDocument.Memento)peeked; // attempt to reach in from outside
```

**Real output — `dotnet build`:**
```
Program.cs(21,14): error CS0122: 'TextDocument.Memento' is inaccessible due to its protection level
Program.cs(21,44): error CS0122: 'TextDocument.Memento' is inaccessible due to its protection level

Build FAILED.
```

**What this proves:** this isn't a polite convention `History` happens to follow — `Memento`'s `private` accessibility, combined with it being nested *inside* `TextDocument`, makes the type itself unnameable from any code outside `TextDocument`. The compiler refuses to build code that tries. Remove those two lines and confirm the build is clean again before moving on.

## Mechanical Walkthrough

- **The Originator** (`TextDocument`) — the object whose state is being saved and restored. It's the only code that ever constructs a `Memento` or reads one apart — `Save()` builds one from its own current `Content`; `Restore()` is the only method that ever reads a `Memento`'s `SavedContent` back out.
- **The Memento** (`TextDocument.Memento`) — a small, otherwise-inert value holding exactly the state needed to restore the Originator later, and nothing else. Declaring it `private` and nested inside `TextDocument` is what turns "please don't peek inside this" from a comment into a compiler-enforced rule.
- **The Caretaker** (`History`) — holds mementos and decides *when* to save or restore one (here: on every change, and on every undo), but never *what's inside* one. Its own field is typed `Stack<object>` — deliberately the least specific type that can hold a memento — because `History` genuinely has no legitimate reason to know more than "some opaque saved state."
- `doc.Save()` returning `object` rather than `TextDocument.Memento` — this is what makes the encapsulation real rather than nominal. Even if `History` were written carelessly, there is no type it could declare a variable as that would let it see `Memento`'s members; `object` is the most specific *public* type available.

## CS Lens

This is the **Memento pattern** (one of the original "Gang of Four" design patterns): capture and externalize an object's internal state so it can be restored later, without violating that object's own encapsulation. The three roles above — Originator, Memento, Caretaker — are the pattern's own standard names; recognizing this shape by name is what lets "we need undo" translate directly into "who's the Originator, what's the minimal Memento, who's the Caretaker" instead of a bespoke design each time.

Also recognized in: a version control system's own commits (each one a memento of a whole repository's state, with the VCS itself acting as caretaker, never needing to understand any individual file's contents to store or retrieve one); a video game's save file (the game engine is the Originator, the save file is the memento, the OS's file system is an indifferent caretaker); a database transaction's rollback log (captures enough to undo a change without the transaction manager needing to understand the table schema it's protecting); a text editor's undo history, exactly as modeled here.

## SE Lens

The alternative — letting `History` reach directly into `TextDocument`'s real fields to snapshot and restore them — would work, but it welds `History` to `TextDocument`'s current internal layout. Every time `TextDocument` gains a new piece of state worth undoing, someone has to remember to go update `History` too, and nothing about the type system would catch a forgotten spot — it would just silently fail to restore that one new field. Memento moves that responsibility to exactly one place that already has to know it: the Originator itself, which already owns and already changes when its own shape changes. The real cost is memory: every pushed memento is a real, retained copy of past state, and a caretaker that never bounds how many it keeps (this lab's `History` never does) can grow without limit — a genuine, common bug in real undo systems, not a hypothetical one.

## Connection

Often paired with the **Command pattern** — a reversible command's own `Undo()` method is frequently implemented by capturing a Memento before it acts and restoring it when reversed, so the caretaker-of-commands (an undo stack of commands) and the caretaker-of-state (this pattern) end up layered directly on top of each other in a real undo/redo feature.

## Try It Yourself

1. Add a second field to `TextDocument` (say, `public int CursorPosition { get; set; }`) and update `Memento`/`Save`/`Restore` to capture and restore it too. Confirm `History` needed zero changes — the Caretaker's code is identical before and after, because it never depended on what a memento actually contains.
2. Give `History` a maximum size (say, 2) by discarding the oldest memento once `Push` would exceed it. Confirm, with real output, that undoing past that limit restores only as far back as the oldest *kept* snapshot — a real, honest limitation every bounded undo history has.
3. Remove the `private` modifier from `Memento` (keep it nested) and confirm the earlier "reach in from outside" code that failed to compile now compiles — proving directly which single keyword was actually doing the enforcement.
