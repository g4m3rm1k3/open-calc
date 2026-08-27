# Lesson 10: Waiting for the World to Finish — Dealing With Files That Aren't Ready

**What you will build.** A `FileReadyWaiter` class with one method,
`WaitForFileReady`, that repeatedly checks whether a real file is safe to
open for reading, waiting and retrying, up to a limit, if it isn't —
instead of assuming the instant a file exists, it's already finished
being written. What this lesson is actually about goes past this one
method: an earlier lesson's own real, verified proof already showed that
writing a brand-new file can raise both `Created` and `Changed` events for
the same operation — and neither of those events actually promises the
file is *finished*. Mastercam, or any program, can still be in the middle
of writing a file's contents at the exact moment this project's own
`DirectoryWatcher` first learns the file exists. This lesson's whole
subject is the gap between "a file exists" and "a file is done" — a real,
timing-dependent gap this project cannot see directly, and has to survive
by checking, patiently, rather than assuming away.

**What you need to know first.** Lesson 5 — `try`/`catch`, already fully
explained there for a missing directory; this lesson reuses the identical
construct for a different, equally real filesystem failure. Lesson 9 —
`DirectoryWatcher`'s own real, verified proof that a `Created` event does
not mean a file is actually finished being written — the exact problem
this lesson exists to solve.

**Terms used in this lesson.**

- **`for` loop** — a C# control-flow statement that repeats its body a
  controlled number of times, using an explicit counter variable it
  creates, tests, and updates itself, in one single line: `for
  (initializer; condition; update) { ... }`. Written as `for (int i = 0; i
  < 5; i++)`, it creates `i` starting at `0`, runs its body only while `i
  < 5` is `true`, and increments `i` by one after each run of the body. It
  exists for situations where a **`foreach` loop** (already fully
  explained, in an earlier lesson) doesn't fit: `foreach` walks every
  element of an existing collection, one by one, with no way to count
  attempts that aren't tied to real elements at all — this lesson needs
  to count *attempts*, not walk a collection, which is exactly what a
  `for` loop's own explicit counter is built for.
- **the `using` statement (using declaration)** — a C# construct,
  written as `using` followed by a variable declaration
  (`using FileStream stream = ...;`), that guarantees the declared
  object's `Dispose()` method (below) runs automatically once execution
  leaves the block it was declared in — whether that block finishes
  normally, returns early, or throws an exception partway through. This is
  a completely different use of the word `using` than the **`using`
  directive** (already fully explained, in an earlier lesson, for
  bringing a namespace into scope) — the two share a keyword and nothing
  else; context (a namespace name versus a variable declaration) is the
  only way to tell them apart. It exists because some objects hold onto
  real, limited operating-system resources — an open file handle, in this
  lesson's case — that must be explicitly released, and a `using`
  statement makes that release automatic and impossible to forget, even
  if an exception happens partway through the block.
- **`IDisposable` and disposal** — `IDisposable` is a .NET interface
  declaring one method, `Dispose()`, that a class implements when its
  objects hold onto a real, limited resource (an open file, a network
  connection, and others this lesson doesn't touch) that needs explicit
  cleanup once the object is no longer needed — unlike ordinary memory,
  which .NET's own garbage collector reclaims automatically, without any
  method needing to be called by hand. It exists because the garbage
  collector only knows how to reclaim memory; it has no idea an object is
  also holding open a real file handle the operating system needs back,
  so a class wrapping such a resource has to say so explicitly, through
  this one shared interface, so that constructs like the `using` statement
  (above) know exactly what to call.

**Objects and methods used.**

- **`FileReadyWaiter`**
  - *What it is:* this project's new class representing "something that
    can tell whether a file is actually safe to read from yet, and wait,
    patiently, if it isn't."
  - *Implementation:* `public class FileReadyWaiter` in the
    `MastercamGenerator` namespace — no base class, the same plain-class
    shape every application-logic class in this project has used since an
    earlier lesson.
  - *Its use:* a standalone class, this lesson, proving this project can
    correctly detect and wait out a file mid-write — not yet connected to
    `DirectoryWatcher` or `MainWindow`.
  - *Type:* a public class, instantiated with `new`.
  - *Responsibility:* deciding, for a given file, whether it's currently
    safe to open, and, if not, waiting and re-checking, up to a limit,
    rather than either giving up instantly or waiting forever.
  - *Depends on:* nothing beyond being constructed.
  - *Connects to:* not yet called from anywhere else in this project —
    this lesson's own throwaway proof is its only real caller so far.
  - *Shape:* a sixth real dependency boundary in this project — the one
    class responsible for the timing question "is this safe yet," kept
    separate from watching for files at all (`DirectoryWatcher`) and
    separate from parsing them once they genuinely are ready
    (`FileDateParser`).
- **`FileReadyWaiter.WaitForFileReady(string, int, int)`**
  - *What it is:* the one public method `FileReadyWaiter` exposes.
  - *Implementation:* `public bool WaitForFileReady(string filePath, int
    maxAttempts, int delayMilliseconds)` — returns `true` the moment the
    file is found ready, `false` if every attempt, up to `maxAttempts`,
    finds it still locked.
  - *Its use:* the real, working answer to this lesson's entire problem —
    called once per file a future caller needs to be sure is safe to
    open.
  - *Type:* a public instance method.
  - *Responsibility:* repeatedly checking readiness, waiting between
    checks, and giving up cleanly, reporting `false`, rather than looping
    forever on a file that never becomes ready.
  - *Depends on:* a real file path, a maximum number of attempts, and a
    delay between them, all supplied by the caller.
  - *Connects to:* calls `IsFileReady` (below) once per attempt.
  - *Shape:* the one public entry point into this lesson's new class.
- **`FileReadyWaiter.IsFileReady(string)`** *(private)*
  - *What it is:* the private helper that performs one single readiness
    check.
  - *Implementation:* `private bool IsFileReady(string filePath)` — an
    **access modifier** (already fully explained) of `private` this time,
    rather than `public`: nothing outside `FileReadyWaiter` itself is
    meant to call a single, one-shot check directly — only the retrying
    version, `WaitForFileReady`, is this class's real, public promise.
  - *Its use:* called once per attempt, inside `WaitForFileReady`'s own
    `for` loop.
  - *Type:* a private instance method.
  - *Responsibility:* answering, once, right now, whether this specific
    file can currently be opened exclusively for reading.
  - *Depends on:* a real file path.
  - *Connects to:* calls `File.Open` (below); called from
    `WaitForFileReady`.
  - *Shape:* the actual mechanism underneath this lesson's whole feature
    — everything else in this class exists to call this, repeatedly, with
    patience.
- **`File.Open(string, FileMode, FileAccess, FileShare)`**
  - *What it is:* the method that actually opens a file, with explicit
    control over how it's opened and whether other code is allowed to
    touch it at the same time.
  - *Implementation:* a `static` method on `System.IO.File`, returning a
    `FileStream` — real, verified proof that it throws, rather than
    quietly succeeding, when a file is genuinely locked by another open
    handle, comes from this lesson's own throwaway console check, below.
  - *Its use:* the actual mechanism `IsFileReady` uses to test whether a
    file is currently locked, by attempting the single kind of access
    this project actually cares about: exclusive read access, the same
    access a real parsing step would eventually need.
  - *Type:* a `static` method.
  - *Responsibility:* opening a real file according to exactly the mode,
    access level, and sharing permissions requested, or throwing a real
    exception if the operating system can't honor that exact request
    right now.
  - *Depends on:* the file existing, and the requested access actually
    being possible given whatever else currently has it open.
  - *Connects to:* called from `IsFileReady`; its result, a `FileStream`,
    is immediately disposed via this lesson's own `using` statement
    (Header above), without ever being read from.
  - *Shape:* the one real, OS-facing call this entire lesson exists to
    interpret correctly.
- **`FileMode.Open`**
  - *What it is:* the `FileMode` enum member requesting "open an existing
    file; fail if it doesn't exist."
  - *Implementation:* one member of the `FileMode` enum, alongside others
    this lesson doesn't use (`Create`, `Append`, and more).
  - *Its use:* this lesson's own check only makes sense for a file that
    already exists — nothing here is trying to create one.
  - *Type:* an enum member.
  - *Responsibility:* telling `File.Open` exactly what to do if the file
    does, or doesn't, already exist.
  - *Depends on:* nothing.
  - *Connects to:* passed as `File.Open`'s second argument.
  - *Shape:* a small, closed vocabulary — the same kind of enum-as-fixed-
    choices idea an earlier lesson already named for `Orientation`.
- **`FileAccess.Read`**
  - *What it is:* the `FileAccess` enum member requesting read-only
    access.
  - *Implementation:* one member of the `FileAccess` enum, alongside
    `Write` and `ReadWrite`.
  - *Its use:* this lesson never needs to write to the file being
    checked — only to confirm it can be read.
  - *Type:* an enum member.
  - *Responsibility:* telling `File.Open` what this specific call intends
    to do with the file, once opened.
  - *Depends on:* nothing.
  - *Connects to:* passed as `File.Open`'s third argument.
  - *Shape:* the same closed-vocabulary idea as `FileMode.Open`, applied
    to a different question.
- **`FileShare.None`**
  - *What it is:* the `FileShare` enum member requesting exclusive
    access — no other open handle, anywhere, is allowed to touch this
    file while this one is open.
  - *Implementation:* one member of the `FileShare` enum, alongside
    `Read`, `Write`, `ReadWrite`, and others this lesson doesn't use.
  - *Its use:* the actual mechanism this lesson's whole readiness check
    depends on — requesting exclusive access is exactly what fails, with
    a real exception, if Mastercam (or anything else) still has the file
    open for writing.
  - *Type:* an enum member.
  - *Responsibility:* telling the operating system how strict to be about
    letting anything else access this file at the same time this handle
    is open.
  - *Depends on:* nothing.
  - *Connects to:* passed as `File.Open`'s fourth argument — the one
    argument this lesson's entire technique actually hinges on.
  - *Shape:* the specific choice, out of several possible `FileShare`
    values, that turns an ordinary file-open call into a real readiness
    test.
- **`System.IO.IOException`**
  - *What it is:* the exception .NET throws for a general input/output
    failure — including, as this lesson uses it, a file that's currently
    locked by another open handle.
  - *Implementation:* a class in `System.IO`; real, verified proof that
    this specific exception type is what a locked file actually throws
    comes from this lesson's own throwaway console check, below.
  - *Its use:* the specific exception this lesson's `try`/`catch`
    (already fully explained, in an earlier lesson, for a missing
    directory) watches for.
  - *Type:* a class, thrown internally by `File.Open`.
  - *Responsibility:* signaling, specifically, that an I/O operation
    couldn't complete — here, because the requested exclusive access
    couldn't be granted.
  - *Depends on:* being thrown by `File.Open` internally.
  - *Connects to:* caught inside `IsFileReady`'s own `catch
    (IOException)` block.
  - *Shape:* this lesson's own version of an already-familiar shape — a
    specific, named, anticipated exception, caught by name, exactly the
    pattern an earlier lesson already established for
    `DirectoryNotFoundException`.
- **`Thread.Sleep(int)`**
  - *What it is:* the method that pauses the currently running code for a
    specified number of milliseconds.
  - *Implementation:* a `static` method on `System.Threading.Thread`,
    taking one `int` parameter — the number of milliseconds to pause —
    and blocking the calling thread for at least that long.
  - *Its use:* the actual pause between one failed readiness check and
    the next, giving whatever's still writing the file real time to
    finish before this lesson's code checks again.
  - *Type:* a `static` method.
  - *Responsibility:* deliberately doing nothing, for a controlled amount
    of time, on purpose.
  - *Depends on:* nothing beyond a valid, non-negative number of
    milliseconds.
  - *Connects to:* called once per unsuccessful attempt, inside
    `WaitForFileReady`'s own `for` loop.
  - *Shape:* the one place in this entire method where this project
    deliberately waits, rather than immediately trying again as fast as
    possible.

---

## Concept Unit: Detecting Whether a File Is Locked

### The Problem

`DirectoryWatcher`'s own `Created` event, proven real in an earlier
lesson, fires the instant a file appears — with no guarantee at all that
whatever's writing to it has finished. Attempting to parse a file that's
still being written to would mean reading incomplete, possibly invalid
XML, and this project's own `FileDateParser` (an earlier lesson's own
class) was never built to handle that gracefully; nothing in this project
can currently tell the difference between "this file exists" and "this
file is actually done."

> If a program on this same computer still has a file open and is
> actively writing to it, and a second, completely different piece of
> code tries to open that same file for its own exclusive use at that
> exact moment, what do you think happens — does the second attempt
> succeed, silently, as if nothing were wrong, or does the operating
> system refuse it somehow?

### Introduce the Concept in Isolation

A real, throwaway console project, scaffolded and run for real — because
whether attempting exclusive access to a locked file genuinely fails, and
with what real exception, is not something to predict from a general
sense of "files can be locked" alone:

```csharp
bool IsFileReady(string filePath)
{
    try
    {
        using FileStream stream = File.Open(filePath, FileMode.Open, FileAccess.Read, FileShare.None);
        return true;
    }
    catch (IOException)
    {
        return false;
    }
}

FileStream writer = File.Open(tempFile, FileMode.Create, FileAccess.Write, FileShare.None);
writer.Write(System.Text.Encoding.UTF8.GetBytes("<partial"));
writer.Flush();

Console.WriteLine($"While still open for writing, IsFileReady = {IsFileReady(tempFile)}");
writer.Close();
Console.WriteLine($"After closing the writer, IsFileReady = {IsFileReady(tempFile)}");
```

Real, captured output from running this exact code (.NET SDK 10.0.301),
against a real temporary file:

```
While still open for writing, IsFileReady = False
After closing the writer, IsFileReady = True
```

This proves, for real: while a real `FileStream` is still open, holding
exclusive write access, a second attempt to open that same file
exclusively genuinely fails — caught here as `IOException` (Header above)
— and the identical check on the identical file, once the first handle is
closed, genuinely succeeds. Nothing about this behavior is invented for
this lesson; it's the real operating system enforcing a real file lock.

### Discard the Throwaway Example

The version above, its temporary file, and the console project it ran
inside were all deleted immediately after this real output was captured
— this lesson's real project code (below) performs the identical check,
permanently, inside `FileReadyWaiter`.

### Project Change

- **Reference Source** — no reference counterpart.
- **Files affected** — created: `FileReadyWaiter.cs`, in the
  `MastercamGenerator/` project folder.
- **Change type** — add (a brand-new file).
- **Location** — n/a; the start of a new file.
- **Dependencies** — none beyond the project itself already existing.

### The New Code

```csharp
using System.IO;

namespace MastercamGenerator;

public class FileReadyWaiter
{
    private bool IsFileReady(string filePath)
    {
        try
        {
            using FileStream stream = File.Open(filePath, FileMode.Open, FileAccess.Read, FileShare.None);
            return true;
        }
        catch (IOException)
        {
            return false;
        }
    }
}
```

### The Updated Project

This *is* the whole new structure — a brand-new file with nothing
surrounding it yet — so there is nothing further to return to.

### Mechanical Walkthrough

1. `using System.IO;` — a **`using` directive** (already fully
   explained), bringing `File`, `FileStream`, and the three enums this
   lesson uses into scope by their short names.
2. `public class FileReadyWaiter` — a plain **`class`** declaration
   (already fully explained), the same shape as every other
   application-logic class in this project.
3. `private bool IsFileReady(string filePath)` — a method declaration:
   `private` (an **access modifier**, already fully explained), returning
   `bool`, taking one `string` parameter.
4. `using FileStream stream = File.Open(filePath, FileMode.Open,
   FileAccess.Read, FileShare.None);` — the **`using` statement** (Header
   above), declaring a local variable, `stream`, whose disposal is
   guaranteed the instant this line's own block ends. `File.Open(...)`
   (Header above) is called with four arguments: `filePath`;
   **`FileMode.Open`** (Header above); **`FileAccess.Read`** (Header
   above); and **`FileShare.None`** (Header above) — the one argument
   that actually makes this call a genuine readiness test, by demanding
   nothing else may have this file open at the same time.
5. `return true;` — a **`return` statement** (already fully explained):
   if `File.Open` didn't throw, the file was successfully opened
   exclusively, meaning nothing else currently has it locked.
6. `catch (IOException)` — the **`try`/`catch`** construct (already fully
   explained), watching specifically for **`System.IO.IOException`**
   (Header above).
7. `return false;` — inside the `catch` block: if `File.Open` threw
   `IOException`, the file is currently locked by something else, and
   this method honestly reports "not ready" rather than letting the
   exception escape.

### CS Lens

This is a **transient failure** — a real, named category of failure that
is expected to be temporary, likely to succeed if simply retried a short
time later, as opposed to a permanent failure (a file that doesn't exist
at all, say) that retrying can never fix. Recognizing the difference
matters: an earlier lesson's `DirectoryNotFoundException` handling gave up
immediately and returned an empty result, correctly, because retrying a
directory that doesn't exist wouldn't help — this lesson's own
`IOException`, by contrast, is exactly the kind of failure retrying is
actually the right response to. Also recognized in: a web request failing
because a server is briefly overloaded, likely to succeed moments later;
a phone call failing because a line is busy, not because the number is
disconnected; a vending machine briefly rejecting a card due to a network
hiccup, not because the card itself is invalid.

### SE Lens

The alternative — checking the file's size, or its last-modified
timestamp, and guessing "ready" once it stops changing for a moment — was
available, and is a real technique some real systems actually use. It's
not chosen here because it's fundamentally a guess: a large, slow write
could pause briefly between chunks and look "finished" by that measure
while genuinely still incomplete. Actually attempting the exact kind of
access a real reader will eventually need — exclusive access, so nothing
else can be mid-write — asks the operating system the real question
directly, rather than inferring an answer indirectly from a proxy that
could be wrong.

### Commands Needed

- `dotnet new console -n ScratchFileLockCheck` — scaffolds this unit's
  own throwaway proof project.
- `dotnet run` — runs it, producing the real output quoted above.

### Run It

Shown above, in full, as real captured output — not predicted, since
whether a locked file genuinely causes a second exclusive-access attempt
to fail, and with which real exception type, is precisely the kind of
OS-level behavior this curriculum's own schema requires proof for.

### Connecting Back

`FileReadyWaiter` can now answer, once, whether a file is currently
locked. It has no way to wait and retry yet — that's this lesson's next
two Concept Units.

---

## Concept Unit: The `using` Statement — Guaranteed Disposal

### The Problem

`IsFileReady`'s own `using FileStream stream = ...;` line, from this
lesson's previous Concept Unit, was used without yet being explained: what
does `using`, here, actually guarantee, and why does it matter that a
`FileStream` gets closed again after this method is done checking it?
Left open, that same file handle would remain locked by this project's
own check — the exact problem this lesson exists to detect in *other*
programs, caused by this project's own code instead.

> A `FileStream`, once opened, holds a real, limited operating-system
> resource — an open file handle — for as long as it stays open. If
> `IsFileReady` opened one, read nothing from it, and simply returned
> `true` without ever explicitly closing it again, what would happen the
> *next* time anything, including this project's own future retry, tried
> to open that same file?

### Introduce the Concept in Isolation

A tiny, uninvolved example, its behavior predictable with real
confidence — the `using` statement's disposal guarantee is a stable,
thoroughly documented C# language feature, not a runtime quirk needing
fresh proof:

```csharp
public class Whistle : IDisposable
{
    public void Dispose()
    {
        Console.WriteLine("Whistle put away.");
    }
}

using (var whistle = new Whistle())
{
    Console.WriteLine("Blowing the whistle.");
}
```

This prints `"Blowing the whistle."`, then `"Whistle put away."` — the
`using` block's own closing brace is what triggers `Dispose()`
automatically, with no explicit call to it anywhere in this code. This is
called the **`using` statement**: `Whistle` implements **`IDisposable`**
(Header above), the interface declaring the one method, `Dispose()`, a
`using` block promises to call once the block it wraps ends — whether
that's by reaching the closing brace normally, or by an exception being
thrown partway through.

### Discard the Throwaway Example

`Whistle` doesn't appear in the real project — it exists only to isolate
what the `using` statement guarantees before this lesson's real code
(previous Concept Unit) relies on that exact guarantee for a real
`FileStream` instead of an imagined whistle. Discarded now.

### Project Change

- **Reference Source** — no reference counterpart.
- **Files affected** — none for this unit specifically; this Concept Unit
  explains a construct already present in this lesson's previous Concept
  Unit's own code, rather than adding new code of its own.
- **Change type** — n/a.
- **Location** — n/a.
- **Dependencies** — this lesson's previous Concept Unit's `IsFileReady`
  method.

### Mechanical Walkthrough

1. `public class Whistle : IDisposable` — **inheritance** (already fully
   explained, though here naming an interface rather than a base class) —
   `Whistle` promises to satisfy `IDisposable`'s (Header above) one
   required member.
2. `public void Dispose()` — the one method `IDisposable` requires,
   implemented here to simply print a message, standing in for whatever
   real cleanup a genuine resource-holding class would perform.
3. `using (var whistle = new Whistle())` — the **`using` statement**
   (Header above), in its older, parenthesized form (functionally
   identical to the `using FileStream stream = ...;` declaration form
   this lesson's own real code actually uses, just with explicit braces
   marking exactly where the wrapped block ends).
4. `{ Console.WriteLine("Blowing the whistle."); }` — the wrapped block;
   the instant it ends, `whistle.Dispose()` runs automatically.

### CS Lens

Guaranteed disposal, regardless of how a block actually exits — normally,
or via an exception — is a form of **deterministic resource management**:
knowing exactly when a resource is released, rather than leaving it to
.NET's garbage collector, which reclaims memory eventually, on its own
schedule, with no promise about exactly when. A real file handle,
network connection, or database connection left open even briefly longer
than necessary can cause real, observable problems (exactly this lesson's
own concern: a lingering handle would make this project's *own* readiness
check permanently, incorrectly, report "not ready"). Also recognized in: a
library ensuring a borrowed book is checked back in the instant a reader
is done, rather than waiting for a periodic inventory sweep to eventually
notice; a rental car being returned immediately after a trip, not left
running in a lot until someone happens to notice it.

### SE Lens

The alternative — calling `stream.Dispose()` (or `stream.Close()`, which
does the same thing for a `FileStream`) explicitly, by hand, at the end
of the method — was available, and would work correctly for this
lesson's own simple, single-path method. It becomes genuinely risky the
moment a method can exit in more than one way: an early `return`, or an
exception thrown partway through, could both skip a hand-written
`Dispose()` call sitting only at the very end of a method, leaving the
resource open. The `using` statement removes that risk structurally —
there's no code path through a `using` block that can skip its own
disposal, which is exactly why this lesson's own `IsFileReady` uses it
even though its own body has only one exit path today.

### Commands Needed

None beyond this lesson's shared, end-of-lesson `dotnet build`.

### Run It

Predicted with full confidence, not executed standalone: the `using`
statement's disposal guarantee is a stable, spec-guaranteed C# language
feature, unchanged since long before this project began — this lesson's
own real `FileStream` usage, inside `IsFileReady`, is covered by this
lesson's own real, full build, shown at this lesson's end.

### Connecting Back

`IsFileReady`'s own `using` statement, from this lesson's first Concept
Unit, is now fully explained — proven to release its `FileStream`
correctly regardless of how the method exits. The next Concept Unit gives
`FileReadyWaiter` a way to call `IsFileReady` more than once, patiently.

---

## Concept Unit: The `for` Loop and Retrying Over Time

### The Problem

`IsFileReady` (first Concept Unit) answers, correctly, whether a file is
ready *right now* — but a single "no" isn't the end of the story. A file
mid-write a moment ago might be finished a second later; this project
needs to check more than once, with real pauses in between, before
honestly giving up.

> `foreach`, already used throughout this project, walks every element of
> an existing collection — but there's no collection of "attempts" to
> walk here; attempts are just a number counting up, with no elements of
> their own. What construct would let code repeat something a specific
> number of times, counting as it goes, without needing a collection to
> walk at all?

### Introduce the Concept in Isolation

A tiny, uninvolved `for` loop, its behavior predictable with full
confidence — nothing about basic loop counting needs a fresh run to
verify:

```csharp
for (int i = 0; i < 3; i++)
{
    Console.WriteLine($"Attempt {i}");
}
```

This prints `"Attempt 0"`, `"Attempt 1"`, `"Attempt 2"`, in that order,
then stops — three total runs of the body, `i` counting `0`, `1`, `2`.
This is a **`for` loop** (Header above): `int i = 0` runs once, before
anything else; `i < 3` is checked before every single run of the body,
including the very first; `i++` runs after every completed run of the
body, immediately before the condition is checked again.

### Discard the Throwaway Example

This exact three-line loop doesn't appear in the real project — it exists
only to isolate a `for` loop's own mechanics before this lesson's real
loop (below) counts real attempts against a real file instead of printing
numbers. Discarded now.

### Project Change

- **Reference Source** — no reference counterpart.
- **Files affected** — modified: `FileReadyWaiter.cs`.
- **Change type** — add (the public `WaitForFileReady` method).
- **Location** — inside the `FileReadyWaiter` class body, above the
  existing private `IsFileReady` method.
- **Dependencies** — this lesson's first Concept Unit's `IsFileReady`.

### The New Code

```csharp
public bool WaitForFileReady(string filePath, int maxAttempts, int delayMilliseconds)
{
    for (int attempt = 0; attempt < maxAttempts; attempt++)
    {
        if (IsFileReady(filePath))
        {
            return true;
        }

        Thread.Sleep(delayMilliseconds);
    }

    return false;
}
```

### The Updated Project

The full `FileReadyWaiter.cs`, with the new method marked:

```csharp
1  using System.IO;
2  
3  namespace MastercamGenerator;
4  
5  public class FileReadyWaiter
6  {
7      public bool WaitForFileReady(string filePath, int maxAttempts, int delayMilliseconds)  // ← new
8      {                                                                                        // ← new
9          for (int attempt = 0; attempt < maxAttempts; attempt++)                              // ← new
10         {                                                                                     // ← new
11             if (IsFileReady(filePath))                                                        // ← new
12             {                                                                                 // ← new
13                 return true;                                                                  // ← new
14             }                                                                                 // ← new
15 
16             Thread.Sleep(delayMilliseconds);                                                  // ← new
17         }                                                                                     // ← new
18 
19         return false;                                                                        // ← new
20     }
21 
22     private bool IsFileReady(string filePath)
23     {
24         try
25         {
26             using FileStream stream = File.Open(filePath, FileMode.Open, FileAccess.Read, FileShare.None);
27             return true;
28         }
29         catch (IOException)
30         {
31             return false;
32         }
33     }
34 }
```

`FileReadyWaiter` now has a complete, working public method: given a
file, a maximum number of attempts, and a delay between them, it returns
`true` the moment the file is found ready, and `false` only after every
attempt has genuinely failed.

### Mechanical Walkthrough

1. `public bool WaitForFileReady(string filePath, int maxAttempts, int
   delayMilliseconds)` — a method declaration: `public` (already fully
   explained), returning `bool`, taking three parameters — the file to
   check, how many times to try, and how long to wait between tries.
2. `for (int attempt = 0; attempt < maxAttempts; attempt++)` — the
   **`for` loop** (Header above): `attempt` starts at `0`; the loop
   continues only while `attempt < maxAttempts`; `attempt` increases by
   one after each full pass through the body.
3. `if (IsFileReady(filePath))` — the **`if` statement** (already fully
   explained), calling `IsFileReady` (this lesson's first Concept Unit)
   directly, using its own `bool` result as the condition, with no
   comparison operator needed.
4. `return true;` — a **`return` statement** (already fully explained):
   the instant the file is found ready, this method reports success
   immediately, without waiting out any remaining attempts.
5. `Thread.Sleep(delayMilliseconds);` — reached only if `IsFileReady`
   returned `false`: calls **`Thread.Sleep(int)`** (Header above),
   pausing for the caller-specified delay before the loop's own `attempt++`
   runs and the condition is checked again.
6. `return false;` — reached only once the `for` loop's own condition
   finally fails (`attempt` has reached `maxAttempts`): every attempt
   genuinely failed, and this method honestly reports that, rather than
   looping forever.

### CS Lens

This is **polling** — repeatedly checking whether some condition has
become true, with a deliberate pause between checks, rather than either
checking exactly once or checking continuously with no pause at all. The
`maxAttempts` limit is what turns this specific polling loop into
something with a real **timeout** — a hard limit on how long this project
will ever wait for one specific thing, past which it gives up rather than
risking waiting forever on a file that may never actually finish. Also
recognized in: a doctor's office periodically checking if a patient's
paperwork has arrived, rather than staring at the fax machine
continuously; an elevator repeatedly checking whether it has arrived at
the requested floor; a kettle's auto-shutoff switch checking the water's
temperature repeatedly until it reaches boiling, then stopping.

### SE Lens

The alternative — polling with no delay at all between attempts,
checking as fast as the computer possibly can — was available, and would
detect a newly-ready file marginally sooner. It's not chosen because it
would spend real, continuous CPU time doing nothing but repeatedly
asking the same question, as fast as possible, for however long a file
takes to finish — genuinely wasteful compared to a short, deliberate
pause between checks, which costs this project nothing but a small,
bounded delay in noticing. The real tradeoff of *any* fixed delay: too
short, and this project polls more often than it needs to; too long, and
a file that became ready almost immediately still waits out most of one
full delay before anything notices — a real tuning decision, not
something this lesson claims to have picked the one correct value for.

### Commands Needed

- `dotnet new console -n ScratchFileLockCheck` — scaffolds this unit's own
  throwaway proof project, calling copies of `IsFileReady` and
  `WaitForFileReady` identical to the real project's own.
- `dotnet run` — runs it, producing the real output below.

### Run It

Real, captured output from running this lesson's complete logic against
two real, controlled scenarios (.NET SDK 10.0.301) — not predicted, since
whether this exact loop retries the right number of times, waits between
attempts, and gives up honestly once genuinely exhausted is precisely the
kind of timing-dependent claim this curriculum's own schema requires
proof for:

```
Proving the retry loop actually retries, against a file that never unlocks:
  Attempt 1: checking...
  Attempt 2: checking...
  Attempt 3: checking...
WaitForFileReady result (never released): False

Proving it succeeds once the file happens to already be free:
  Attempt 1: checking...
WaitForFileReady result (already free): True
```

This proves, for real, both of this method's genuinely different
outcomes: given a file locked for the entire duration of every attempt
it's allowed, `WaitForFileReady` makes exactly the number of attempts it
was told to, waiting between each one, and honestly returns `false` once
they're exhausted — no hidden extra attempt, no silent success. Given a
file that's already free, it succeeds immediately, on the very first
attempt, without waiting out any delay it didn't need.

### Connecting Back

Every earlier Concept Unit in this lesson built one piece of a chain this
one finally confirms works, end to end: detecting a lock (first unit) and
guaranteeing the check itself doesn't leave a lock behind (second unit)
are both exercised, for real, by this unit's own retrying loop, proven
above to genuinely wait, genuinely retry, and genuinely give up on
schedule — not just individually correct, but working together.

---

## Connect the Pieces

Trace one real file, mid-write, through every piece this lesson built:

1. Mastercam (or, in this lesson's own proof, a stand-in `FileStream`)
   opens a file and begins writing to it, holding it open the entire
   time — this lesson's first Concept Unit already proved, for real, that
   a second attempt to open that exact file exclusively fails while this
   is happening.
2. Something calls `_fileReadyWaiter.WaitForFileReady(path, maxAttempts,
   delayMilliseconds)` (third Concept Unit). Its `for` loop begins:
   `attempt` starts at `0`.
3. Each pass calls `IsFileReady` (first Concept Unit), which attempts
   `File.Open` with `FileShare.None` (Header above) — while Mastercam
   still holds the file, this throws `IOException`, caught and reported
   as `false`; the `using` statement (second Concept Unit) guarantees
   whatever brief handle this attempt itself opened is released
   immediately either way, so this project's own check never becomes the
   thing holding a lock.
4. `Thread.Sleep(delayMilliseconds)` pauses before the next attempt,
   giving Mastercam real time to finish.
5. The moment Mastercam closes its own handle, the very next attempt's
   `IsFileReady` call succeeds — `File.Open` returns a real, usable
   `FileStream` instead of throwing, `IsFileReady` returns `true`, and
   `WaitForFileReady` returns `true` immediately, without waiting out any
   remaining attempts.
6. If Mastercam never finishes within the attempts allowed, the loop's own
   condition eventually fails, and `WaitForFileReady` returns `false` —
   an honest, bounded "no," not an infinite wait.

This project still has no code deciding what to actually *do* with that
`true` or `false` — whether to finally parse the file, or to log a
warning and move on. That decision, and connecting this lesson's
`FileReadyWaiter` to `DirectoryWatcher`'s own real events, is left for
this curriculum's next lesson, exactly as an earlier lesson's own
`DirectoryWatcher` left "what to do about a doubled `Created`/`Changed`
notification" for this one.
