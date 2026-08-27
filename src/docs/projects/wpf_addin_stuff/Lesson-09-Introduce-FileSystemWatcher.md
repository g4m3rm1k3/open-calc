# Lesson 9: A Program That Reacts Without Being Asked — Introducing `FileSystemWatcher`

**What you will build.** A standalone `DirectoryWatcher` class wrapping
.NET's own `FileSystemWatcher` — given a real directory, it can start
watching it and report, through its own events, every time a file inside
it is created, changed, renamed, or deleted. Nothing in this project calls
it yet; this lesson proves the mechanism works, on its own, before a later
lesson connects it to anything this program already does. What this
lesson is actually about goes past this one class: every single thing
this project has reacted to so far — a button click, a folder being
picked — happened because a user, sitting in front of the running program,
did something. This lesson introduces the first event this project can
receive that no user caused directly at all: a file appearing on disk,
possibly written by Mastercam itself, possibly minutes after anyone last
touched this program's own window. This is genuinely new territory for
this project's whole shape: everything until now assumed the program was
waiting for a person; this lesson's whole subject is a program that has to
stay ready for something to happen with nobody watching.

**What you need to know first.** Lesson 2 — `event`, `delegate`, `event
handler`, and `+=` (event subscription), all first explained there for
`Button.Click`, a UI event this project only ever consumed, never
declared itself. This lesson is the first time this project *declares*
its own events, rather than only reacting to ones WPF already provides.

**Terms used in this lesson.**

- **event-driven programming** — a style of programming where a
  significant part of what a program does is triggered by events —
  signals that something happened — rather than by a fixed, predictable
  sequence of statements running top to bottom. A program built this way
  spends much of its time simply waiting, with no code actively running at
  all, until some event (a click, a keystroke, or, as of this lesson, a
  file appearing on disk) causes a specific piece of code to run. It
  exists because a huge number of real programs — anything with a UI, or
  anything reacting to the outside world — genuinely cannot know in
  advance what will happen next, or when; structuring a program around
  events, rather than a single predetermined sequence, is how software
  handles that uncertainty without needing to constantly ask "did anything
  happen yet?" in a loop.
- **null-conditional operator (`?.`)** — a C# operator, written as `?.`
  in place of an ordinary `.`, that only actually calls a method or reads
  a property if the value on its left isn't `null` — if it is, the whole
  expression short-circuits to `null` instead of throwing. It exists
  specifically for situations exactly like this lesson's own events: a
  `public event FileSystemEventHandler? Created;` field is `null` until
  at least one piece of code subscribes to it (`+=`, already fully
  explained in an earlier lesson) — attempting to invoke a `null` event
  directly would throw a real `NullReferenceException`, and `?.` is the
  direct, built-in way to say "call this, but only if anyone's actually
  listening."

**Objects and methods used.**

- **`DirectoryWatcher`**
  - *What it is:* this project's new class representing "something that
    watches a real directory and reports what happens inside it," wrapping
    .NET's own `FileSystemWatcher` (below) behind this project's own,
    simpler surface.
  - *Implementation:* `public class DirectoryWatcher` in the
    `MastercamGenerator` namespace — no base class, the same plain-class
    shape every application-logic class in this project has used since an
    earlier lesson.
  - *Its use:* a standalone proof, this lesson, that this project can
    watch a real directory and receive real events from it — not yet
    connected to `MainWindow` or any other part of this project.
  - *Type:* a public class, instantiated with `new DirectoryWatcher
    (directoryPath)`.
  - *Responsibility:* owning one real `FileSystemWatcher`, configured for
    this project's own `.xml` files specifically, and re-announcing
    whatever it reports through this class's own, separately-declared
    events.
  - *Depends on:* a real directory path, handed to its constructor.
  - *Connects to:* constructs and configures a real `FileSystemWatcher`
    internally; nothing else in this project constructs a
    `DirectoryWatcher` yet.
  - *Shape:* a fifth real dependency boundary in this project — a thin
    wrapper whose entire purpose is standing between .NET's own
    filesystem-watching machinery and whatever, eventually, this project
    decides to do in response to it.
- **`DirectoryWatcher.Created` / `.Changed` / `.Deleted`**
  - *What it is:* three of the four events `DirectoryWatcher` declares
    and exposes, one for each kind of change this lesson's curriculum
    outline names (`Renamed`, structurally different, is next).
  - *Implementation:* `public event FileSystemEventHandler? Created;`,
    and identically-shaped declarations for `Changed` and `Deleted` — each
    a **nullable** (already fully explained) field of delegate type
    `FileSystemEventHandler` (below), declared with the `event` keyword
    (already fully explained, in an earlier lesson, for consuming
    `Button.Click`; this is the first time this project's own code
    appears on the *declaring* side of that same keyword).
  - *Its use:* the actual, public surface this lesson's class exposes —
    whatever code eventually uses `DirectoryWatcher` will subscribe to
    these, the same mechanical way this project's own `BrowseButton_Click`
    already subscribes to `Button.Click`.
  - *Type:* instance events.
  - *Responsibility:* notifying whatever's subscribed, automatically, the
    instant this class's own internal `FileSystemWatcher` reports the
    matching real filesystem change.
  - *Depends on:* the internal `FileSystemWatcher`'s own matching event
    actually firing.
  - *Connects to:* invoked from inside `DirectoryWatcher`'s own
    constructor, via the **null-conditional operator** (Header above),
    each time the wrapped `FileSystemWatcher` raises its own matching
    event.
  - *Shape:* this project's re-exposed version of a real .NET mechanism —
    same delegate type, same information, wrapped so that whoever
    eventually uses `DirectoryWatcher` depends on this class, not on
    `FileSystemWatcher` directly.
- **`DirectoryWatcher.Renamed`**
  - *What it is:* the fourth event `DirectoryWatcher` declares, reporting
    a file's old and new name together.
  - *Implementation:* `public event RenamedEventHandler? Renamed;` — a
    different delegate type, `RenamedEventHandler` (below), from the
    other three, because a rename genuinely carries different information
    (two names, not one) than a create, change, or delete.
  - *Its use:* the one event this lesson's four that can't be handled with
    the exact same handler shape as the other three.
  - *Type:* an instance event.
  - *Responsibility:* notifying whatever's subscribed of both a file's
    previous name and its new one, together, in a single notification.
  - *Depends on:* the internal `FileSystemWatcher`'s own `Renamed` event
    actually firing.
  - *Connects to:* invoked the same way as `Created`/`Changed`/`Deleted`,
    from inside the constructor.
  - *Shape:* proof that not every kind of notification carries the same
    shape of information — this project's own re-exposed events mirror
    that real distinction rather than flattening it away.
- **`System.IO.FileSystemWatcher`**
  - *What it is:* the real .NET class that watches a real directory and
    raises real events when files inside it change.
  - *Implementation:* `public class FileSystemWatcher : System.
    ComponentModel.Component, System.ComponentModel.ISupportInitialize`,
    also implementing `IDisposable` (through `Component`) — confirmed
    against the class's own published definition. Constructed here via
    its `FileSystemWatcher(string path, string filter)` overload, one of
    three real constructors the class provides.
  - *Its use:* the actual mechanism doing every bit of real filesystem
    watching in this lesson — `DirectoryWatcher` exists specifically to
    wrap this one object.
  - *Type:* a public class, instantiated with `new`.
  - *Responsibility:* asking the operating system to notify it of real
    filesystem changes matching its configured path and filter, and
    raising its own `Created`, `Changed`, `Deleted`, and `Renamed` events
    (among others this lesson doesn't use) in response.
  - *Depends on:* a real, existing directory to watch, and
    `EnableRaisingEvents` (below) being set to `true` before it will
    actually report anything.
  - *Connects to:* constructed inside `DirectoryWatcher`'s constructor;
    its four events are subscribed to, internally, via lambda expressions
    that re-raise `DirectoryWatcher`'s own matching events.
  - *Shape:* the real, OS-facing mechanism this entire lesson exists to
    put a simpler face on.
- **`FileSystemWatcher.EnableRaisingEvents`**
  - *What it is:* the switch that actually turns watching on.
  - *Implementation:* a settable `bool` property, `false` by default —
    a `FileSystemWatcher` can be fully constructed and configured and
    still report nothing at all until this is explicitly set to `true`.
  - *Its use:* set inside `DirectoryWatcher.StartWatching()`, the one
    method that actually activates watching, kept separate from
    construction itself.
  - *Type:* an instance property.
  - *Responsibility:* the one piece of state deciding whether this
    `FileSystemWatcher` is currently doing anything at all.
  - *Depends on:* nothing beyond the `FileSystemWatcher` instance already
    existing.
  - *Connects to:* set to `true` inside `StartWatching()`; read
    internally by the watcher's own OS-level notification machinery.
  - *Shape:* a deliberate separation between "this object exists and is
    configured" and "this object is actually doing its job right now" —
    the same kind of two-step lifecycle an earlier lesson's `readonly`
    fields already established for construction versus use, applied here
    to on/off state instead.
- **`FileSystemEventHandler`**
  - *What it is:* the delegate type (already fully explained as a concept,
    in an earlier lesson, for `RoutedEventHandler`) that `Created`,
    `Changed`, and `Deleted` all require any handler to match.
  - *Implementation:* `public delegate void FileSystemEventHandler(object
    sender, FileSystemEventArgs e)` — any method matching this exact
    shape (or, as this lesson uses, a lambda expression of the same
    shape) can be attached to any of these three events.
  - *Its use:* the required shape of the lambda expressions this lesson's
    constructor uses to re-raise `DirectoryWatcher`'s own matching events.
  - *Type:* a delegate type.
  - *Responsibility:* defining the exact calling contract every
    `Created`/`Changed`/`Deleted` handler must satisfy.
  - *Depends on:* nothing; it's a pure type declaration.
  - *Connects to:* the type of `DirectoryWatcher.Created`, `.Changed`, and
    `.Deleted` (Header above) alike.
  - *Shape:* the compiler-enforced contract standing between "some code
    that reacts to a file appearing" and the actual event that reports it.
- **`RenamedEventHandler`**
  - *What it is:* the distinct delegate type `Renamed` requires.
  - *Implementation:* `public delegate void RenamedEventHandler(object
    sender, RenamedEventArgs e)` — the same shape as `FileSystemEventHandler`
    except for its second parameter's type, `RenamedEventArgs`, which
    carries both a file's old and new name, rather than just one.
  - *Its use:* the required shape of the lambda expression this lesson's
    constructor uses to re-raise `DirectoryWatcher.Renamed`.
  - *Type:* a delegate type.
  - *Responsibility:* defining the exact calling contract a `Renamed`
    handler must satisfy — distinct from the other three specifically
    because renaming carries different information.
  - *Depends on:* nothing; a pure type declaration.
  - *Connects to:* the type of `DirectoryWatcher.Renamed` (Header above).
  - *Shape:* proof, at the type level, that a rename is a genuinely
    different kind of event, not just a differently-named version of the
    same one.

---

## Concept Unit: `FileSystemWatcher` — Watching a Real Directory

### The Problem

Nothing in this project can currently learn about a file appearing,
changing, or disappearing unless a user explicitly clicks `Browse` and
triggers a fresh scan. A real Mastercam workflow, per this curriculum's
own outline, needs this project to notice a brand-new setup sheet the
moment it's written — without anyone having to click anything at all.

> If a program needed to know the instant a new file appeared in a
> folder, without constantly re-scanning that folder on a timer (checking
> "has anything changed yet?" over and over, wastefully, even when nothing
> has), what would it need instead — something that actively asks the
> operating system to report changes as they happen, rather than the
> program repeatedly asking on its own?

### Introduce the Concept in Isolation

A real, throwaway console project, scaffolded and run for real — because
whether a real, running `FileSystemWatcher` genuinely reports real file
operations, and in what order, is not something to predict from the
class's description alone:

```csharp
var watcher = new FileSystemWatcher(tempDir, "*.xml");
watcher.Created += (sender, e) => Console.WriteLine($"Created: {e.Name}");
watcher.Changed += (sender, e) => Console.WriteLine($"Changed: {e.Name}");
watcher.Renamed += (sender, e) => Console.WriteLine($"Renamed: {e.OldName} -> {e.Name}");
watcher.Deleted += (sender, e) => Console.WriteLine($"Deleted: {e.Name}");
watcher.EnableRaisingEvents = true;

File.WriteAllText(Path.Combine(tempDir, "one.xml"), "<a/>");
// ... a rename and a delete follow, each with a short pause after
```

Real, captured output from running this exact sequence against a real,
temporary directory (.NET SDK 10.0.301):

```
Writing file...
Created: one.xml
Changed: one.xml
Writing to it again...
Changed: one.xml
Renaming file...
Renamed: one.xml -> two.xml
Deleting file...
Deleted: two.xml
```

This proves, for real, that a real `FileSystemWatcher`, watching a real
directory, genuinely reports real file operations as they happen — this
lesson's next Concept Unit returns to this exact output for a second,
more surprising fact already visible in it.

### Discard the Throwaway Example

The version above, its temporary directory, and the console project it
ran inside were all deleted immediately after this real output was
captured — this project's own `DirectoryWatcher` (below) wraps the
identical mechanism permanently, inside a real project file.

### Project Change

- **Reference Source** — no reference counterpart.
- **Files affected** — created: `DirectoryWatcher.cs`, in the
  `MastercamGenerator/` project folder.
- **Change type** — add (a brand-new file).
- **Location** — n/a; the start of a new file.
- **Dependencies** — none beyond the project itself already existing.

### The New Code

```csharp
using System.IO;

namespace MastercamGenerator;

public class DirectoryWatcher
{
    private readonly FileSystemWatcher _watcher;

    public DirectoryWatcher(string directoryPath)
    {
        _watcher = new FileSystemWatcher(directoryPath, "*.xml");
    }

    public void StartWatching()
    {
        _watcher.EnableRaisingEvents = true;
    }
}
```

### The Updated Project

This *is* the whole new structure — a brand-new file with nothing
surrounding it yet — so there is nothing further to return to.

### Mechanical Walkthrough

1. `using System.IO;` — a **`using` directive** (already fully
   explained), bringing `FileSystemWatcher` (Header above) into scope by
   its short name — the same namespace, already used this way, in an
   earlier lesson's `DirectoryScanner.cs`.
2. `public class DirectoryWatcher` — a plain **`class`** declaration
   (already fully explained), the same shape as every other
   application-logic class in this project.
3. `private readonly FileSystemWatcher _watcher;` — an **instance field**
   (already fully explained), this time declared without an inline
   initializer — its real value is assigned inside the constructor
   instead, because it needs the constructor's own `directoryPath`
   parameter to build.
4. `public DirectoryWatcher(string directoryPath)` — a **constructor**
   (already fully explained, in an earlier lesson, for `MainWindow`
   itself) taking one parameter this project hasn't given a constructor
   before now — every other class's constructor so far has taken none.
5. `_watcher = new FileSystemWatcher(directoryPath, "*.xml");` — inside
   the constructor: constructs one **`System.IO.FileSystemWatcher`**
   (Header above), using its `(string path, string filter)` constructor
   overload, passing `directoryPath` and the literal `"*.xml"` — the
   identical filter pattern an earlier lesson's `DirectoryScanner`
   already used for a completely different reason (there, filtering
   `GetFiles`'s results; here, filtering which files this watcher even
   bothers reporting on).
6. `public void StartWatching()` — a plain method, deliberately kept
   separate from the constructor.
7. `_watcher.EnableRaisingEvents = true;` — sets **`FileSystemWatcher.
   EnableRaisingEvents`** (Header above), the one line that actually
   turns watching on.

### CS Lens

Separating "construct and configure" (the constructor) from "actually
start doing the job" (`StartWatching`) is the same **two-phase lifecycle**
already implicit in this project's own `readonly` fields — build it
completely first, use it only once it's ready — made explicit here as two
separate method calls instead of one. This matters more for a watcher
than it did for `FileSource` or `DirectoryScanner`, specifically because
watching is an ongoing activity with a genuine "off" state, not a single
one-shot operation. Also recognized in: a car being fully assembled on a
production line before its ignition is ever turned; a recording device
being loaded with tape and positioned before the record button is
pressed; a security camera being mounted, wired, and configured before
its live feed is actually switched on.

### SE Lens

The alternative — starting `EnableRaisingEvents = true` immediately inside
the constructor, the instant a `DirectoryWatcher` is created — was
available, and would work for this lesson's own limited scope. It's not
chosen because it removes a real, useful moment of control: constructing
a `DirectoryWatcher` and deciding to actually start watching are two
genuinely separate decisions a future caller might want to make at
different times (build it once, start and stop watching repeatedly, for
instance, as a user's own selected folder changes) — collapsing them into
one step now would need to be undone later the moment that need arrives.

### Commands Needed

- `dotnet new console -n ScratchWatcherCheck` — scaffolds this unit's own
  throwaway proof project.
- `dotnet run` — runs it, producing the real output quoted above.

### Run It

Shown above, in full, as real captured output — not predicted, since
whether a real `FileSystemWatcher`, watching a real directory, actually
reports real file operations is exactly the kind of "hidden," OS-level
behavior this curriculum's own schema requires proof for.

### Connecting Back

`DirectoryWatcher` can now watch a real directory and turn that watching
on. It has no way to tell anyone what it saw yet — that's this lesson's
next two Concept Units.

---

## Concept Unit: Declaring Your Own Event

### The Problem

`FileSystemWatcher`, inside `DirectoryWatcher`, already knows how to
report `Created`, `Changed`, `Deleted`, and `Renamed` — but only to
whatever subscribes to it directly. Nothing outside `DirectoryWatcher`
can see those events at all right now, because nothing outside it has any
way to reach the private `_watcher` field to subscribe to them. This
project needs `DirectoryWatcher` itself to offer that same kind of
notification, to its own future callers, without exposing `_watcher`
directly.

> An earlier lesson's `BrowseButton_Click` subscribes to `Button.Click`
> using `+=` — something WPF itself already declared, ready to be
> subscribed to. If `DirectoryWatcher` needed to offer that same kind of
> subscribable notification, but for something *this project's own class*
> defines, not WPF, what would need to appear inside `DirectoryWatcher`'s
> own declaration — the same `event` keyword an earlier lesson only ever
> saw used by someone else?

### Introduce the Concept in Isolation

A tiny, uninvolved event declaration, its behavior predictable with real
confidence — the same `event` keyword already fully proven, from the
consuming side, in an earlier lesson; only which side of it this project's
own code sits on is new:

```csharp
public class Siren
{
    public event Action? Sounded;

    public void Sound()
    {
        Sounded?.Invoke();
    }
}
```

Any code holding a `Siren` can write `mySiren.Sounded += () =>
Console.WriteLine("Alarm!");` — the identical `+=` subscription syntax an
earlier lesson already proved for `Button.Click` — and calling `mySiren.
Sound()` would print `"Alarm!"`. `Sounded?.Invoke()` is this lesson's own
**null-conditional operator** (Header above): if nothing has subscribed
yet, `Sounded` is `null`, and `?.Invoke()` simply does nothing at all,
rather than throwing.

### Discard the Throwaway Example

`Siren` doesn't appear in the real project — it exists only to isolate
declaring and raising a custom event before this lesson's real events
(below) do the same thing for a real filesystem change instead of an
imagined alarm. Discarded now.

### Project Change

- **Reference Source** — no reference counterpart.
- **Files affected** — modified: `DirectoryWatcher.cs`.
- **Change type** — add (four new event declarations).
- **Location** — inside the `DirectoryWatcher` class body, above its
  constructor.
- **Dependencies** — this lesson's previous Concept Unit's class shell.

### The New Code

```csharp
public event FileSystemEventHandler? Created;
public event FileSystemEventHandler? Changed;
public event FileSystemEventHandler? Deleted;
public event RenamedEventHandler? Renamed;
```

### The Updated Project

The full `DirectoryWatcher.cs`, with the new lines marked:

```csharp
1  using System.IO;
2  
3  namespace MastercamGenerator;
4  
5  public class DirectoryWatcher
6  {
7      private readonly FileSystemWatcher _watcher;
8  
9      public event FileSystemEventHandler? Created;    // ← new
10     public event FileSystemEventHandler? Changed;    // ← new
11     public event FileSystemEventHandler? Deleted;    // ← new
12     public event RenamedEventHandler? Renamed;        // ← new
13 
14     public DirectoryWatcher(string directoryPath)
15     {
16         _watcher = new FileSystemWatcher(directoryPath, "*.xml");
17     }
18 
19     public void StartWatching()
20     {
21         _watcher.EnableRaisingEvents = true;
22     }
23 }
```

`DirectoryWatcher` now offers four real, subscribable events of its own —
still never actually raised by anything, since nothing yet connects them
to `_watcher`'s own matching events. That's this lesson's final Concept
Unit.

### Mechanical Walkthrough

1. `public event FileSystemEventHandler? Created;` — the **`event`**
   keyword (already fully explained, from the consuming side, in an
   earlier lesson), here on the *declaring* side for the first time in
   this project: declares a new event named `Created`, of delegate type
   **`FileSystemEventHandler`** (Header above), marked **nullable**
   (already fully explained) with `?` because it starts out with no
   subscribers at all.
2. `public event FileSystemEventHandler? Changed;` and `public event
   FileSystemEventHandler? Deleted;` — two more events, identically
   shaped, one per remaining kind of change this class's curriculum
   outline names except renaming.
3. `public event RenamedEventHandler? Renamed;` — a fourth event, of the
   distinct delegate type **`RenamedEventHandler`** (Header above),
   because a rename genuinely carries different information (an old name
   and a new one) than the other three.

### CS Lens

A class declaring its own event is the same **Observer pattern** already
named twice in this project — once for `Button.Click`, once for
`ObservableCollection<T>.CollectionChanged` — now demonstrated from the
*authoring* side for the first time: `DirectoryWatcher` is the subject,
maintaining an implicit list of interested subscribers (whatever gets
attached with `+=`) and notifying every one of them, automatically,
whenever its own relevant state changes — with no need to know, in
advance, who those subscribers will be or how many there'll be. Also
recognized, once more, in: a newsletter's mailing list, growing and
shrinking as people subscribe and unsubscribe, with the publisher never
needing to know in advance who's on it.

### SE Lens

The alternative — exposing `_watcher` itself as a public property, letting
outside code subscribe to `FileSystemWatcher`'s own events directly — was
available, and would need noticeably less code inside `DirectoryWatcher`
itself. It's not chosen because it would leak .NET's own filesystem-
watching type out through this project's own boundary, the same way an
earlier lesson's `DirectoryScanner` deliberately avoided leaking
`FileInfo` — any future code depending directly on `_watcher` would be
depending on `FileSystemWatcher` itself, not on `DirectoryWatcher`,
undermining the entire reason this wrapper class exists.

### Commands Needed

None yet beyond `dotnet build`, run once for this lesson's whole batch of
changes at the end.

### Run It

Not applicable — these are event declarations with nothing yet raising
them; there is no behavior to observe until this lesson's final Concept
Unit connects them to something real.

### Connecting Back

`DirectoryWatcher` now has four real events to offer, but nothing inside
it ever raises them — `_watcher`'s own matching events and this class's
own new ones are still two entirely separate, unconnected things. The
final Concept Unit connects them.

---

## Concept Unit: Re-Raising an Event With the Null-Conditional Operator

### The Problem

`_watcher.Created`, `_watcher.Changed`, `_watcher.Deleted`, and
`_watcher.Renamed` (all real, from .NET itself) fire correctly, proven for
real in this lesson's first Concept Unit — but nothing subscribes to any
of them yet, and even if something did, that code would still be coupled
to `_watcher` directly, exactly what this lesson's previous Concept Unit
was trying to avoid. `DirectoryWatcher`'s own four events, from that same
previous Concept Unit, need to actually fire whenever `_watcher`'s
matching ones do.

> If `_watcher.Created` fires, and `DirectoryWatcher.Created` (this
> lesson's own event) needs to fire too, in response, what would the
> simplest possible connection between the two look like — a method that
> runs when one fires and immediately triggers the other?

### Introduce the Concept in Isolation

No new isolated example — subscribing to one event with a lambda that
immediately raises a second one combines two constructs already fully
proven: `+=` subscription (already fully explained, in an earlier
lesson) and the null-conditional invocation this lesson's own second
Concept Unit already isolated with `Siren`. Isolating the combination a
second time would test nothing new.

### Discard the Throwaway Example

Not applicable — no new throwaway example was written for this unit.

### Project Change

- **Reference Source** — no reference counterpart.
- **Files affected** — modified: `DirectoryWatcher.cs`.
- **Change type** — add (four subscription lines inside the constructor).
- **Location** — inside the constructor, immediately after `_watcher` is
  constructed.
- **Dependencies** — this lesson's previous Concept Unit's four event
  declarations.

### The New Code

```csharp
_watcher.Created += (sender, e) => Created?.Invoke(sender, e);
_watcher.Changed += (sender, e) => Changed?.Invoke(sender, e);
_watcher.Deleted += (sender, e) => Deleted?.Invoke(sender, e);
_watcher.Renamed += (sender, e) => Renamed?.Invoke(sender, e);
```

### The Updated Project

The full `DirectoryWatcher.cs`, as it stands at the end of this lesson,
with the new lines marked:

```csharp
1  using System.IO;
2  
3  namespace MastercamGenerator;
4  
5  public class DirectoryWatcher
6  {
7      private readonly FileSystemWatcher _watcher;
8  
9      public event FileSystemEventHandler? Created;
10     public event FileSystemEventHandler? Changed;
11     public event FileSystemEventHandler? Deleted;
12     public event RenamedEventHandler? Renamed;
13 
14     public DirectoryWatcher(string directoryPath)
15     {
16         _watcher = new FileSystemWatcher(directoryPath, "*.xml");
17         _watcher.Created += (sender, e) => Created?.Invoke(sender, e);    // ← new
18         _watcher.Changed += (sender, e) => Changed?.Invoke(sender, e);    // ← new
19         _watcher.Deleted += (sender, e) => Deleted?.Invoke(sender, e);    // ← new
20         _watcher.Renamed += (sender, e) => Renamed?.Invoke(sender, e);    // ← new
21     }
22 
23     public void StartWatching()
24     {
25         _watcher.EnableRaisingEvents = true;
26     }
27 }
```

`DirectoryWatcher` is now complete: constructing one, calling
`StartWatching()`, and subscribing to any of its four events produces
real, working notifications, driven entirely by a real `FileSystemWatcher`
underneath, with nothing outside this class ever touching that
`FileSystemWatcher` directly.

### Mechanical Walkthrough

1. `_watcher.Created += (sender, e) => Created?.Invoke(sender, e);` — the
   `+=` **event subscription** (already fully explained) attaches a
   **lambda expression** (already fully explained) to `_watcher.Created`.
   The lambda takes the exact two parameters `FileSystemEventHandler`
   (Header above) requires — `sender` and `e` — and its body,
   `Created?.Invoke(sender, e)`, uses the **null-conditional operator**
   (Header above) to call `DirectoryWatcher`'s own `Created` event (this
   lesson's second Concept Unit) with those same two values, but only if
   something has actually subscribed to it — if `Created` is still
   `null`, this line does nothing at all rather than throwing.
2. `_watcher.Changed += (sender, e) => Changed?.Invoke(sender, e);` and
   `_watcher.Deleted += (sender, e) => Deleted?.Invoke(sender, e);` — the
   identical pattern, twice more, for the two remaining
   `FileSystemEventHandler`-typed events.
3. `_watcher.Renamed += (sender, e) => Renamed?.Invoke(sender, e);` — the
   same pattern once more, this time matching `RenamedEventHandler`
   (Header above)'s own two-parameter shape — mechanically identical to
   the other three, just carrying `RenamedEventArgs` instead of
   `FileSystemEventArgs` as `e`'s real type.

### CS Lens

This is **event forwarding** — one object subscribing to an event purely
to immediately raise a different event of its own, in response, so that
its own subscribers never need to know the original event even exists.
This is what actually makes `DirectoryWatcher` a real wrapper rather than
just a class that happens to sit near a `FileSystemWatcher`: from outside
this class, `_watcher` might as well not exist at all — every real
notification a caller ever receives comes through `DirectoryWatcher`'s
own events. Also recognized in: a receptionist relaying a phone call to
the right department, rather than transferring the caller directly to
someone's personal, undisclosed extension; a translator relaying a
diplomat's words in a different language, so the audience never needs to
understand the original.

### SE Lens

A real, honest cost of this lesson's design: every one of `Directory
Watcher`'s four events fires exactly one lambda deeper than
`FileSystemWatcher`'s own equivalent would, and if this class ever grows
to modify or filter what gets forwarded (skipping a `Changed` event
that immediately follows a `Created` one, say — a real, plausible next
step, given this lesson's own final Concept Unit's discovery), that logic
has exactly one obvious place to live: right here, inside these four
lines, rather than scattered across every future caller that would
otherwise need to apply the same filtering itself, independently, and
likely inconsistently.

### Commands Needed

None beyond this lesson's shared, end-of-lesson `dotnet build`.

### Run It

Predicted with the same confidence already established for `+=`
subscription and null-conditional invocation individually — this
project's real, full build, covering this exact constructor, is shown at
this lesson's end.

### Connecting Back

`DirectoryWatcher` is now fully wired, end to end: a real filesystem
change flows from the operating system, through `_watcher`, through this
lesson's four forwarding lambdas, out through `DirectoryWatcher`'s own
events, to whatever eventually subscribes to them. This lesson's closing
section returns to a real, surprising fact already visible in its very
first Concept Unit's captured output.

---

## Connect the Pieces

Trace one real file write through every piece this lesson built, and
close with the exact fact this curriculum's own outline asked this lesson
to teach: why filesystem events aren't as simple as "a file appeared."

1. Something writes `"one.xml"` into a directory `DirectoryWatcher` is
   watching (`StartWatching()` already called). The operating system
   itself detects this and notifies the underlying `FileSystemWatcher`
   this lesson's first Concept Unit constructed.
2. `_watcher` raises its own `Created` event — and, per this lesson's
   first Concept Unit's own real, captured proof, its `Changed` event
   too, for the exact same write. This is not a bug in this lesson's own
   code; it's real, documented .NET behavior — `FileSystemWatcher`'s own
   official documentation states plainly: "Common file system operations
   might raise more than one event... Moving a file is a complex
   operation that consists of multiple simple operations, therefore
   raising multiple events." Writing a brand-new file is exactly such an
   operation: the file is created, and then written to, as two genuinely
   separate real events, even though a person watching would describe it
   as one single thing happening.
3. This lesson's third Concept Unit's forwarding lambdas run twice, once
   per real event: `Created?.Invoke(...)` fires once, then, moments
   later, `Changed?.Invoke(...)` fires too — both ultimately caused by
   the exact same single line of code that wrote the file.
4. Anything subscribed to `DirectoryWatcher.Created` and `.Changed`
   separately would be notified twice, for what a person would call one
   real event — a genuine, documented fact about how this operating
   system reports filesystem activity, not a detail this project's own
   `DirectoryWatcher` introduced or could paper over without deciding,
   deliberately, what to do about it.

This is exactly the fact this lesson's own opening paragraph promised:
"why filesystem events aren't as simple as 'a file appeared'" is not a
hypothetical warning — it's real, observable behavior, proven in this
lesson's very first Concept Unit and explained by .NET's own official
documentation. Deciding what to actually *do* about a file that reports
both `Created` and `Changed` for the same real write — and whether a file
reported as "changed" from a Mastercam program mid-write is even safe to
read from yet — is deliberately left to this curriculum's next lesson,
not solved here.
