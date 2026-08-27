# Lesson 11: Four Questions, One Decision — Watching for a Newer File

**What you will build.** A `LiveFileTracker` class that coordinates three
already-built pieces of this project — `DirectoryWatcher`,
`FileDateParser`, and `FileReadyWaiter` — into one real, working pipeline:
the instant a real file event fires, it decides, in order, whether the
file matches this project's naming convention, whether it's genuinely
newer than whatever this project currently considers "current," and
whether it's actually finished being written — updating a real, exposed
`CurrentFile` property only once all three questions are answered "yes."
What this lesson is actually about goes past this one class: every class
this project has built since an earlier lesson's `DirectoryWatcher` has
done exactly one job, in isolation, proven correct on its own. This is
the first lesson whose entire point is coordination — taking several
already-correct pieces and deciding the order to ask their questions in,
and what "give up early" looks like at each step, without which even
three perfectly correct classes could still combine into something
subtly wrong.

**What you need to know first.** Lesson 9 — `DirectoryWatcher`'s
`Created` and `Changed` events, and its own real, verified proof that a
single file write can raise both. Lesson 10 — `FileReadyWaiter.
WaitForFileReady`, reused here unchanged. Lesson 7 — `FileDateParser.
TryParseDate`, reused here unchanged, and the `DateTime?` it returns.

**Terms used in this lesson.**

- **relational operators on a nullable type (`<`, `<=`, `>`, `>=`)** — the
  four ordinary numeric comparison operators, already familiar for plain
  numbers, applied here to `DateTime?` (a **nullable value type**, already
  fully explained in an earlier lesson). Unlike `==`/`!=` (already fully
  explained), which have well-defined behavior even when one side is
  `null`, these four relational operators always evaluate to `false` if
  either side is `null` — there's no meaningful answer to "is nothing
  earlier than this date," so C# simply refuses to call it `true`. This
  lesson's own code deliberately checks for `null` explicitly, first, with
  `&&`, specifically so a relational comparison is never actually
  attempted against a `null` value in the first place.
- **`private set` (asymmetric property accessibility)** — a C# property
  written with two different access modifiers on its two accessors —
  `public InputFile? CurrentFile { get; private set; }` can be *read* by
  any code that can see the property at all, but *assigned* only by code
  inside the same class that declares it. It exists for exactly this
  lesson's own situation: `CurrentFile` needs to be visible to whatever,
  eventually, displays it (a future lesson's own UI code), but the
  *decision* about when it changes has to stay entirely inside
  `LiveFileTracker` itself — a plain public property with an ordinary
  `set` would let any outside code overwrite it directly, bypassing every
  one of this lesson's own three questions entirely.

**Objects and methods used.**

- **`LiveFileTracker`**
  - *What it is:* this project's new class representing "something that
    watches a directory and keeps track of whichever file currently
    counts as the real, current one."
  - *Implementation:* `public class LiveFileTracker` in the
    `MastercamGenerator` namespace — no base class, the same plain-class
    shape every application-logic class in this project has used since
    an earlier lesson.
  - *Its use:* the real coordinator this lesson exists to build — the
    first class in this project that owns other application classes as
    collaborators (`DirectoryWatcher`, `FileDateParser`,
    `FileReadyWaiter`, all three) rather than standing alone.
  - *Type:* a public class, instantiated with `new LiveFileTracker
    (directoryPath)`.
  - *Responsibility:* deciding, for every file event a `DirectoryWatcher`
    reports, whether that file should become this project's new
    `CurrentFile` — and nothing about how that file eventually gets
    displayed, which stays a future lesson's job.
  - *Depends on:* a real directory path, handed to its constructor.
  - *Connects to:* constructs one `DirectoryWatcher`, one
    `FileDateParser`, and one `FileReadyWaiter` internally; not yet
    constructed by anything else in this project.
  - *Shape:* this project's first genuine coordinator — a class whose
    entire job is combining other classes' already-correct answers into
    one larger decision, not answering a question of its own from
    scratch.
- **`LiveFileTracker.CurrentFile`**
  - *What it is:* the one piece of state `LiveFileTracker` exposes —
    whichever file, if any, currently counts as this project's newest,
    complete, correctly-named file.
  - *Implementation:* `public InputFile? CurrentFile { get; private set;
    }` — an **auto-property** (a property whose backing storage the
    compiler generates automatically, rather than a hand-written field
    referenced by name in explicit `get`/`set` bodies) with **asymmetric
    accessibility** (Header above): publicly readable, privately
    writable.
  - *Its use:* the real, working answer to this lesson's own question —
    whatever any future code eventually reads to find out "what's the
    current file right now."
  - *Type:* a public instance property.
  - *Responsibility:* holding exactly one `InputFile`, or `null` if
    nothing has qualified yet, and refusing to let anything outside this
    class change that directly.
  - *Depends on:* nothing beyond the containing `LiveFileTracker`
    instance existing.
  - *Connects to:* read by any future caller; written only from inside
    `LiveFileTracker`'s own private event handler.
  - *Shape:* this lesson's entire externally-visible surface — everything
    else about `LiveFileTracker` is either construction or private
    decision-making.
- **`LiveFileTracker.Start()`**
  - *What it is:* the method that actually begins watching.
  - *Implementation:* `public void Start()`, internally calling the
    already-existing `DirectoryWatcher.StartWatching()` (an earlier
    lesson's own subject).
  - *Its use:* keeps the same two-phase lifecycle an earlier lesson
    already established for `DirectoryWatcher` itself — construct fully
    configured, then explicitly start.
  - *Type:* a public instance method.
  - *Responsibility:* the one action that turns a fully-built, but
    inactive, `LiveFileTracker` into one that's actually watching.
  - *Depends on:* the internal `DirectoryWatcher` already being fully
    constructed.
  - *Connects to:* calls `DirectoryWatcher.StartWatching()`.
  - *Shape:* a thin pass-through, deliberately kept as simple as the
    method it forwards to.

**Everything else in the file, not this lesson's subject but still
explained.**

- **`DirectoryWatcher.Created` / `.Changed`**
  - *What it is:* the two events an earlier lesson's `DirectoryWatcher`
    already declares and raises.
  - *Implementation:* unchanged — `public event FileSystemEventHandler?
    Created;` and the identically-shaped `Changed`.
  - *Its use:* both subscribed to the *same* handler method in this
    lesson's constructor, since this project's own reaction — check
    whether the file is newer, then whether it's ready — is identical
    regardless of which of the two actually fired.
  - *Type:* instance events.
  - *Responsibility:* unchanged from an earlier lesson.
  - *Depends on:* the internal `FileSystemWatcher`'s own matching events.
  - *Connects to:* both wired to `LiveFileTracker`'s own private
    `OnFileEvent` method in this lesson's constructor.
  - *Shape:* real, verified proof, from an earlier lesson, that a single
    file write can raise *both* of these for the same real change — the
    exact reason this lesson's own logic (next Concept Unit) has to
    survive being called twice for one real file, not just once.
- **`FileDateParser.TryParseDate(string)`**
  - *What it is:* the method that reads this project's own date
    convention out of a filename, already fully explained and verified in
    an earlier lesson.
  - *Implementation:* unchanged — `public DateTime? TryParseDate(string
    fileName)`.
  - *Its use:* the first of this lesson's three real questions — "does
    this filename even match this project's own convention" — reused
    here exactly as already proven, on a fully-qualified path this time
    rather than a bare filename (its own internal `Path.
    GetFileNameWithoutExtension` call already strips the directory
    portion regardless of which one it's given).
  - *Type:* a public instance method.
  - *Responsibility:* unchanged from an earlier lesson.
  - *Depends on:* nothing beyond a string being passed in.
  - *Connects to:* called from `LiveFileTracker`'s own `OnFileEvent`.
  - *Shape:* the first gate in this lesson's own pipeline.
- **`FileReadyWaiter.WaitForFileReady(string, int, int)`**
  - *What it is:* the method that patiently retries a file-lock check,
    already fully explained and verified in an earlier lesson.
  - *Implementation:* unchanged — `public bool WaitForFileReady(string
    filePath, int maxAttempts, int delayMilliseconds)`.
  - *Its use:* this lesson's third real question — "is this file actually
    finished being written" — called only once the first two questions
    have already both answered "yes," since there's no reason to wait out
    a real retry loop for a file that's already been rejected on other
    grounds.
  - *Type:* a public instance method.
  - *Responsibility:* unchanged from an earlier lesson.
  - *Depends on:* a real file path, plus the attempt count and delay this
    lesson's own code supplies.
  - *Connects to:* called from `LiveFileTracker`'s own `OnFileEvent`.
  - *Shape:* the last gate in this lesson's own pipeline — deliberately
    the most expensive check (it can genuinely wait, in real time), which
    is exactly why it runs last, after the two cheaper checks have already
    ruled out anything that doesn't need it.
- **`System.IO.FileInfo`** and **`InputFile`**
  - *What they are:* an earlier lesson's own real filesystem-metadata
    class, and this project's own data record — both already fully
    explained.
  - *Implementation:* unchanged.
  - *Their use:* once a file passes all three of this lesson's questions,
    a fresh `FileInfo` is constructed from its path, and its `FullName`,
    `Name`, and `LastWriteTime` (all already fully explained) are
    converted into a new `InputFile` — the identical Adapter conversion an
    earlier lesson already established, reused here unchanged.
  - *Type:* a class and a record, respectively.
  - *Responsibility:* unchanged from earlier lessons.
  - *Depends on:* a real, now-confirmed-ready file path.
  - *Connects to:* the resulting `InputFile` is assigned to
    `LiveFileTracker.CurrentFile`.
  - *Shape:* the final payload this entire pipeline exists to produce.

---

## Concept Unit: The Coordinator's Shell — Subscribing One Handler to Two Events

### The Problem

`DirectoryWatcher`, `FileDateParser`, and `FileReadyWaiter` all exist, all
individually proven correct — but nothing in this project connects them
to each other. `DirectoryWatcher`'s own real events currently have no
subscriber anywhere in this project's actual code, only in earlier
lessons' own throwaway proofs.

> An earlier lesson's `DirectoryWatcher` already filters, internally, to
> only `*.xml` files — its own `FileSystemWatcher` was constructed with
> that exact filter. Given that, does anything subscribing to
> `DirectoryWatcher.Created` or `.Changed` still need to separately check
> "is this an XML file" itself, or has that question already been
> answered before the event even reaches a subscriber at all?

### Introduce the Concept in Isolation

No new isolated example — subscribing the same method to two different
events, both already-proven real (`Created` and `Changed`, an earlier
lesson's own subjects), is two ordinary `+=` subscriptions (already fully
explained), not a new mechanism.

### Discard the Throwaway Example

Not applicable — no throwaway example was written for this unit.

### Project Change

- **Reference Source** — no reference counterpart.
- **Files affected** — created: `LiveFileTracker.cs`, in the
  `MastercamGenerator/` project folder.
- **Change type** — add (a brand-new file).
- **Location** — n/a; the start of a new file.
- **Dependencies** — `DirectoryWatcher`, `FileDateParser`,
  `FileReadyWaiter`, and `InputFile`, all from earlier lessons.

### The New Code

```csharp
using System.IO;

namespace MastercamGenerator;

public class LiveFileTracker
{
    private readonly FileDateParser _fileDateParser = new FileDateParser();
    private readonly FileReadyWaiter _fileReadyWaiter = new FileReadyWaiter();
    private readonly DirectoryWatcher _directoryWatcher;

    public LiveFileTracker(string directoryPath)
    {
        _directoryWatcher = new DirectoryWatcher(directoryPath);
        _directoryWatcher.Created += OnFileEvent;
        _directoryWatcher.Changed += OnFileEvent;
    }

    public void Start()
    {
        _directoryWatcher.StartWatching();
    }

    private void OnFileEvent(object sender, FileSystemEventArgs e)
    {
    }
}
```

### The Updated Project

This *is* the whole new structure — a brand-new file with nothing
surrounding it yet — so there is nothing further to return to.

### Mechanical Walkthrough

1. `private readonly FileDateParser _fileDateParser = new
   FileDateParser();` and `private readonly FileReadyWaiter
   _fileReadyWaiter = new FileReadyWaiter();` — the identical `readonly`
   field pattern (already fully explained) already established for every
   other application dependency in this project, this time holding two
   collaborators at once inside a third class.
2. `private readonly DirectoryWatcher _directoryWatcher;` — an
   **instance field** (already fully explained) declared without an
   inline initializer, the same reason an earlier lesson's
   `DirectoryWatcher` itself declared its own `_watcher` field this way:
   it needs the constructor's own parameter to build.
3. `public LiveFileTracker(string directoryPath)` — a **constructor**
   (already fully explained) taking one parameter, the same shape an
   earlier lesson's `DirectoryWatcher` constructor already established.
4. `_directoryWatcher = new DirectoryWatcher(directoryPath);` — constructs
   one `DirectoryWatcher` (an earlier lesson's own subject), passing
   through the directory path this constructor itself received.
5. `_directoryWatcher.Created += OnFileEvent;` and `_directoryWatcher.
   Changed += OnFileEvent;` — two `+=` **event subscriptions** (already
   fully explained), both attaching the *same* method,
   `OnFileEvent`, to two different events — legal because both `Created`
   and `Changed` (Header above) share the identical delegate type,
   `FileSystemEventHandler`, so one method can satisfy both.
6. `public void Start()` and its body, `_directoryWatcher.
   StartWatching();` — a thin forwarding method, calling an earlier
   lesson's own `DirectoryWatcher.StartWatching()` directly.
7. `private void OnFileEvent(object sender, FileSystemEventArgs e)` — a
   **private** (already fully explained) method matching `FileSystemEventHandler`'s
   own required shape — still empty; this lesson's remaining Concept
   Units fill it in.

### CS Lens

Subscribing one method to two different events is **event
consolidation** — recognizing that two distinct signals genuinely call
for the identical reaction, and writing that reaction exactly once,
rather than duplicating it per event. This only works safely because this
lesson's own Header already established why: a single real file write can
raise *both* `Created` and `Changed`, and this project's own reaction
("consider this file as a candidate") is identical either way — there's
no reason to write it twice just because two different-sounding events
happen to trigger it. Also recognized in: a single alarm-response
procedure triggered identically by either a smoke detector or a manual
pull station; a single "please log in again" screen shown identically
whether a session expired or a token was explicitly revoked.

### SE Lens

The alternative — two separate handler methods, `OnCreated` and
`OnChanged`, each independently containing this lesson's own three-question
logic — was available, and would work. It's not chosen because it would
mean the exact same logic, maintained in two places, with a real risk of
the two drifting apart over time (a bug fixed in one, forgotten in the
other). One shared method, subscribed twice, keeps this lesson's real
decision logic in exactly one place, at the cost of that one method's
`FileSystemEventArgs` parameter no longer indicating, on its own, which
specific kind of event actually caused it to run (a real, small loss of
information this lesson's own logic doesn't happen to need).

### Commands Needed

None yet beyond `dotnet build`, run once for this lesson's whole batch of
changes at the end.

### Run It

Not applicable — `OnFileEvent`'s body is still empty; there is no
behavior yet to observe.

### Connecting Back

`LiveFileTracker` can now receive every real file event `DirectoryWatcher`
reports, for both of the two events that can fire for one real write. It
does nothing with them yet — that's this lesson's remaining Concept
Units.

---

## Concept Unit: Deciding "Is It Newer?"

### The Problem

`OnFileEvent` now runs for every real file event — including, per this
lesson's own Header, both `Created` and `Changed` for the exact same
write. Nothing yet decides whether a given file is even one this project
should care about: its name might not match this project's convention at
all, or it might be genuinely older than whatever this project already
considers current.

> `FileDateParser.TryParseDate`, already proven correct, returns `DateTime?`
> — a real date, or `null`. If `LiveFileTracker` needs to remember the
> most recent file's date to compare future files against, and nothing
> has arrived yet when the very first file event fires, what should that
> remembered "current date so far" start out as?

### Introduce the Concept in Isolation

A real, throwaway console project, scaffolded and run for real — because
whether this lesson's comparison logic genuinely accepts a newer file,
correctly rejects an older or duplicate-dated one, and correctly rejects
an unparseable name, are real behavioral claims worth proving directly,
not asserting from the code's own apparent logic:

```csharp
bool ConsiderFile(string name, DateTime? parsedDate)
{
    if (parsedDate == null)
    {
        return false;
    }

    if (currentFileDate != null && parsedDate <= currentFileDate)
    {
        return false;
    }

    currentFileName = name;
    currentFileDate = parsedDate;
    return true;
}
```

Run against five real, escalating scenarios, real, captured output (.NET
SDK 10.0.301):

```
First file accepted: True, current now: SetupSheet_2026-08-20_0900.xml
Older file accepted: False, current still: SetupSheet_2026-08-20_0900.xml
Duplicate-date file accepted: False, current still: SetupSheet_2026-08-20_0900.xml
Newer file accepted: True, current now: SetupSheet_2026-08-26_0512.xml
Unparseable file accepted: False, current still: SetupSheet_2026-08-26_0512.xml
```

This proves, for real: the very first file is always accepted, since
nothing exists yet to compare it against; a genuinely older file is
rejected; a file reporting the *exact same* date as the current one — the
realistic shape of a duplicate `Changed` notification for a file already
accepted — is also rejected, because this lesson's comparison uses `<=`,
not `<`; a genuinely newer file is accepted, replacing the old one; and a
file whose name doesn't parse at all is rejected before any date
comparison is even attempted.

### Discard the Throwaway Example

The version above, and the console project it ran inside, were both
deleted immediately after this real output was captured — this lesson's
real code (below) performs the identical logic, permanently, inside
`LiveFileTracker`.

### Project Change

- **Reference Source** — no reference counterpart.
- **Files affected** — modified: `LiveFileTracker.cs`.
- **Change type** — add (a new field, and the first half of
  `OnFileEvent`'s body).
- **Location** — a new field alongside the existing three, and the start
  of `OnFileEvent`'s previously-empty body.
- **Dependencies** — this lesson's previous Concept Unit's class shell.

### The New Code

```csharp
private DateTime? _currentFileDate;
```

```csharp
DateTime? parsedDate = _fileDateParser.TryParseDate(e.FullPath);
if (parsedDate == null)
{
    return;
}

if (_currentFileDate != null && parsedDate <= _currentFileDate)
{
    return;
}
```

### The Updated Project

The full `LiveFileTracker.cs`, with the new lines marked:

```csharp
1  using System.IO;
2  
3  namespace MastercamGenerator;
4  
5  public class LiveFileTracker
6  {
7      private readonly FileDateParser _fileDateParser = new FileDateParser();
8      private readonly FileReadyWaiter _fileReadyWaiter = new FileReadyWaiter();
9      private readonly DirectoryWatcher _directoryWatcher;
10     private DateTime? _currentFileDate;                                   // ← new
11 
12     public LiveFileTracker(string directoryPath)
13     {
14         _directoryWatcher = new DirectoryWatcher(directoryPath);
15         _directoryWatcher.Created += OnFileEvent;
16         _directoryWatcher.Changed += OnFileEvent;
17     }
18 
19     public void Start()
20     {
21         _directoryWatcher.StartWatching();
22     }
23 
24     private void OnFileEvent(object sender, FileSystemEventArgs e)
25     {
26         DateTime? parsedDate = _fileDateParser.TryParseDate(e.FullPath);   // ← new
27         if (parsedDate == null)                                           // ← new
28         {                                                                 // ← new
29             return;                                                      // ← new
30         }                                                                 // ← new
31 
32         if (_currentFileDate != null && parsedDate <= _currentFileDate)   // ← new
33         {                                                                 // ← new
34             return;                                                      // ← new
35         }                                                                 // ← new
36     }
37 }
```

`OnFileEvent` now answers this lesson's first two real questions — "does
the name parse at all" and "is it genuinely newer" — for every file event
it receives, before doing anything else at all.

### Mechanical Walkthrough

1. `private DateTime? _currentFileDate;` — an **instance field** (already
   fully explained) of **nullable value type** `DateTime?` (already fully
   explained), starting at its default value, `null`, since no field
   initializer is given — no file has been accepted yet.
2. `DateTime? parsedDate = _fileDateParser.TryParseDate(e.FullPath);` —
   calls **`FileDateParser.TryParseDate(string)`** (Header above),
   passing `e.FullPath` — a real, non-nullable `string` property on
   `FileSystemEventArgs`, confirmed against that property's own published
   definition, holding the complete path of whatever file the event
   concerns.
3. `if (parsedDate == null)` — the **`if` statement** with the equality
   operator (both already fully explained), a **guard clause** (already
   fully explained, in an earlier lesson, for a wrong-shaped filename)
   rejecting anything that doesn't match this project's own naming
   convention at all.
4. `return;` — a bare **`return` statement** (already fully explained,
   used here with no value at all, legal because `OnFileEvent`'s own
   return type is `void`): ends this method immediately, doing nothing
   further for this event.
5. `if (_currentFileDate != null && parsedDate <= _currentFileDate)` — a
   second guard clause: `_currentFileDate != null` (already fully
   explained) is checked first, specifically so the **relational
   operator** `<=` (Header above) is never evaluated against a `null`
   value — the `&&` operator's own short-circuiting behavior (already
   established by this exact pattern in an earlier lesson) guarantees the
   right-hand side only runs once the left-hand side has already
   confirmed `_currentFileDate` holds a real date.
6. `return;` — reached only if the new file's date is not strictly
   greater than the current one: rejects both a genuinely older file and
   one reporting the exact same date as the one already accepted.

### CS Lens

The `!= null && ...` guard, protecting a relational comparison from ever
running against a potentially-`null` value, is **defensive programming**
— writing code that actively protects itself against a specific,
anticipated bad input, rather than trusting that input will always be
well-formed. This is the same defensive habit an earlier lesson already
established for `bool?`, now extended to a genuinely different operator
category (relational, not equality). Also recognized in: a recipe
checking "do I have eggs" before attempting to crack one; a pilot's
checklist confirming landing gear is down before attempting to compare
current altitude against ground level; a vending machine checking a coin
is genuinely present before attempting to read its denomination.

### SE Lens

The alternative — comparing with plain `<` instead of `<=`, treating a
file reporting the exact same date as the current one as "not newer,
therefore reject" either way — was available and, in fact, is exactly
what this lesson chose, deliberately: `<=` rejects strictly more than
`<` would (it rejects equal dates too, not only lesser ones). Choosing
`<=` here, rather than `<`, is what makes this lesson's own real, verified
proof of a duplicate `Changed` notification harmless — the second
notification for the same already-accepted file reports the identical
date, and `<=` correctly treats "the same file arriving again" as nothing
new to act on, without needing separate logic to detect "is this the same
file I already have" by any other means (a filename comparison, for
instance) — the date comparison alone already handles it.

### Commands Needed

- `dotnet new console -n ScratchLiveTrackerCheck` — scaffolds this unit's
  own throwaway proof project.
- `dotnet run` — runs it, producing the real output quoted above.

### Run It

Shown above, in full, as real captured output — not predicted, since
whether this exact comparison logic correctly handles all five of these
real scenarios, including the specific edge case of a duplicate date, is
worth proving directly rather than trusting the code's own apparent
logic.

### Connecting Back

`OnFileEvent` now correctly filters out anything that doesn't match this
project's convention, and anything that isn't genuinely newer than what's
already current. The next Concept Unit adds this lesson's third real
question.

---

## Concept Unit: Deciding "Is It Complete?"

### The Problem

A file that passes this lesson's first two questions might still be
mid-write — an earlier lesson's own real proof already showed that a
`Created` (or `Changed`) event carries no guarantee the file behind it is
actually finished. Nothing in `OnFileEvent` yet checks that.

### Introduce the Concept in Isolation

No new isolated example — `FileReadyWaiter.WaitForFileReady` is already
fully proven correct, on its own, in an earlier lesson; calling it here
with a real path and real numbers needs no separate isolation.

### Discard the Throwaway Example

Not applicable — no throwaway example was written for this unit.

### Project Change

- **Reference Source** — no reference counterpart.
- **Files affected** — modified: `LiveFileTracker.cs`.
- **Change type** — add (a third guard clause inside `OnFileEvent`).
- **Location** — inside `OnFileEvent`, immediately after this lesson's
  previous Concept Unit's second guard clause.
- **Dependencies** — this lesson's previous Concept Unit's parsed-date
  logic.

### The New Code

```csharp
bool ready = _fileReadyWaiter.WaitForFileReady(e.FullPath, maxAttempts: 10, delayMilliseconds: 200);
if (!ready)
{
    return;
}
```

### The Updated Project

The full `LiveFileTracker.cs`, with the new lines marked:

```csharp
1  using System.IO;
2  
3  namespace MastercamGenerator;
4  
5  public class LiveFileTracker
6  {
7      private readonly FileDateParser _fileDateParser = new FileDateParser();
8      private readonly FileReadyWaiter _fileReadyWaiter = new FileReadyWaiter();
9      private readonly DirectoryWatcher _directoryWatcher;
10     private DateTime? _currentFileDate;
11 
12     public LiveFileTracker(string directoryPath)
13     {
14         _directoryWatcher = new DirectoryWatcher(directoryPath);
15         _directoryWatcher.Created += OnFileEvent;
16         _directoryWatcher.Changed += OnFileEvent;
17     }
18 
19     public void Start()
20     {
21         _directoryWatcher.StartWatching();
22     }
23 
24     private void OnFileEvent(object sender, FileSystemEventArgs e)
25     {
26         DateTime? parsedDate = _fileDateParser.TryParseDate(e.FullPath);
27         if (parsedDate == null)
28         {
29             return;
30         }
31 
32         if (_currentFileDate != null && parsedDate <= _currentFileDate)
33         {
34             return;
35         }
36 
37         bool ready = _fileReadyWaiter.WaitForFileReady(e.FullPath, maxAttempts: 10, delayMilliseconds: 200);  // ← new
38         if (!ready)                                                        // ← new
39         {                                                                 // ← new
40             return;                                                      // ← new
41         }                                                                 // ← new
42     }
43 }
```

`OnFileEvent` now answers all three of this lesson's real questions in
order — name, date, then readiness — rejecting a file at the earliest
question it fails, rather than doing more expensive work than necessary
on a file already ruled out.

### Mechanical Walkthrough

1. `bool ready = _fileReadyWaiter.WaitForFileReady(e.FullPath, maxAttempts:
   10, delayMilliseconds: 200);` — calls **`FileReadyWaiter.
   WaitForFileReady(string, int, int)`** (Header above), passing named
   arguments (`maxAttempts:`, `delayMilliseconds:` — an ordinary C#
   syntax naming which parameter each value fills, used here purely for
   readability at the call site, since the method's own parameter order
   alone would otherwise leave two bare numbers with no visible meaning)
   for ten attempts, two hundred milliseconds apart — two literal
   constants this lesson chooses deliberately, not values `FileReadyWaiter`
   itself prescribes.
2. `if (!ready)` — the **`if` statement** (already fully explained),
   using the **logical negation operator** `!` on a plain `bool` (a
   different `!` than this project's own null-forgiving operator, an
   earlier lesson's own Terms entry — the same character, two entirely
   different meanings depending on what it's applied to: a `bool`
   produces logical negation; a nullable reference or value type
   produces the null-forgiving assertion).
3. `return;` — reached only if the file never became ready within the
   attempts allowed: rejects a genuinely newer, correctly-named file that
   nonetheless never finished being written in time.

### CS Lens

Ordering this lesson's three questions — cheap checks first, the one
genuinely expensive, time-consuming check last — is **short-circuit
evaluation** applied at the level of a whole pipeline, not just a single
Boolean expression: the same principle an earlier lesson's own `&&`
already demonstrated for two conditions in one line, scaled up here to
three entire method calls in sequence. A file with an unparseable name,
or one that's simply older, is rejected instantly, without ever paying
the cost of `WaitForFileReady`'s own real, potentially multi-second retry
loop. Also recognized in: a job application process rejecting candidates
missing a required qualification before ever scheduling the far more
expensive step of an in-person interview; a spam filter's cheap
keyword check running before its far more expensive machine-learning
classifier; a factory's visual inspection (fast) happening before its
destructive stress test (slow and costly) on the same part.

### SE Lens

The alternative — checking readiness first, before even parsing the
filename — was available, and would work identically for any file that
eventually passes all three checks. It's a real, avoidable cost for every
file that *doesn't*: an unrelated `.xml` file with the wrong name shape
would still pay the full cost of a real retry loop before ever being
rejected, for a question ("is this file even one we care about") that
could have been answered instantly. Ordering guard clauses from cheapest
to most expensive is a small, deliberate design decision, not an
incidental side effect of the order these three classes happened to be
built in.

### Commands Needed

None beyond this lesson's shared, end-of-lesson `dotnet build`.

### Run It

Predicted with the same confidence already established for
`WaitForFileReady` on its own, in an earlier lesson — this project's
real, full build, covering this exact method, is shown at this lesson's
end.

### Connecting Back

`OnFileEvent` now correctly answers all three of this lesson's real
questions. The final Concept Unit is what happens once a file finally
passes all three.

---

## Concept Unit: Making It Current — A Property With a Private Setter

### The Problem

A file that survives all three of this lesson's questions still doesn't
change anything about `LiveFileTracker`'s own state — there's no
`CurrentFile` yet for anything to become. This project needs a real,
observable place for "the current file" to live, visible to whatever
future code eventually needs to read it, but changeable only by this
class's own, carefully-ordered decision logic.

> If `CurrentFile` were declared as an ordinary `public InputFile?
> CurrentFile { get; set; }` — a plain, fully public property — what
> would stop some future, completely unrelated piece of code from writing
> `tracker.CurrentFile = someRandomFile;` directly, bypassing every one of
> this lesson's own three questions entirely?

### Introduce the Concept in Isolation

A tiny, uninvolved property declaration, its behavior predictable with
full confidence — asymmetric property accessibility is a stable,
thoroughly documented C# language feature:

```csharp
public class Vault
{
    public int Contents { get; private set; } = 100;

    public void Withdraw(int amount)
    {
        Contents -= amount;
    }
}
```

Any code holding a `Vault` can read `vault.Contents` freely, but writing
`vault.Contents = 0;` from outside the class fails to compile — only
`Vault`'s own methods, like `Withdraw`, can assign it, since its `set`
accessor is `private`.

### Discard the Throwaway Example

`Vault` doesn't appear in the real project — it exists only to isolate
**`private set`** (Header above) before this lesson's real property
(below) uses the identical mechanism for a real file instead of an
imagined balance. Discarded now.

### Project Change

- **Reference Source** — no reference counterpart.
- **Files affected** — modified: `LiveFileTracker.cs`.
- **Change type** — add (the `CurrentFile` property and the code that
  finally assigns it).
- **Location** — a new property in the class body, and new lines at the
  end of `OnFileEvent`, after this lesson's previous Concept Unit's third
  guard clause.
- **Dependencies** — this lesson's complete, three-question `OnFileEvent`.

### The New Code

```csharp
public InputFile? CurrentFile { get; private set; }
```

```csharp
var fileInfo = new FileInfo(e.FullPath);
CurrentFile = new InputFile(fileInfo.FullName, fileInfo.Name, fileInfo.LastWriteTime);
_currentFileDate = parsedDate;
```

### The Updated Project

The full `LiveFileTracker.cs`, as it stands at the end of this lesson,
with every new line marked:

```csharp
1  using System.IO;
2  
3  namespace MastercamGenerator;
4  
5  public class LiveFileTracker
6  {
7      private readonly FileDateParser _fileDateParser = new FileDateParser();
8      private readonly FileReadyWaiter _fileReadyWaiter = new FileReadyWaiter();
9      private readonly DirectoryWatcher _directoryWatcher;
10     private DateTime? _currentFileDate;
11 
12     public InputFile? CurrentFile { get; private set; }                   // ← new
13 
14     public LiveFileTracker(string directoryPath)
15     {
16         _directoryWatcher = new DirectoryWatcher(directoryPath);
17         _directoryWatcher.Created += OnFileEvent;
18         _directoryWatcher.Changed += OnFileEvent;
19     }
20 
21     public void Start()
22     {
23         _directoryWatcher.StartWatching();
24     }
25 
26     private void OnFileEvent(object sender, FileSystemEventArgs e)
27     {
28         DateTime? parsedDate = _fileDateParser.TryParseDate(e.FullPath);
29         if (parsedDate == null)
30         {
31             return;
32         }
33 
34         if (_currentFileDate != null && parsedDate <= _currentFileDate)
35         {
36             return;
37         }
38 
39         bool ready = _fileReadyWaiter.WaitForFileReady(e.FullPath, maxAttempts: 10, delayMilliseconds: 200);
40         if (!ready)
41         {
42             return;
43         }
44 
45         var fileInfo = new FileInfo(e.FullPath);                          // ← new
46         CurrentFile = new InputFile(fileInfo.FullName, fileInfo.Name, fileInfo.LastWriteTime);  // ← new
47         _currentFileDate = parsedDate;                                    // ← new
48     }
49 }
```

`LiveFileTracker` is now complete: a real file event, surviving all three
of this lesson's questions, results in a real state change — `CurrentFile`
becomes a genuinely new `InputFile`, and `_currentFileDate` is updated to
match, ready to correctly reject the next file that isn't actually newer
than this one.

### Mechanical Walkthrough

1. `public InputFile? CurrentFile { get; private set; }` — an
   **auto-property** with **`private set`** (both Header above): `public
   get` lets any code read the current file; `private set` restricts
   assignment to `LiveFileTracker`'s own code.
2. `var fileInfo = new FileInfo(e.FullPath);` — **`var`** (already fully
   explained) and **`System.IO.FileInfo`** (Header above), constructed
   from the real, now-confirmed-ready path.
3. `CurrentFile = new InputFile(fileInfo.FullName, fileInfo.Name,
   fileInfo.LastWriteTime);` — the identical `FileInfo`-to-`InputFile`
   conversion (Header above) an earlier lesson already established,
   assigned directly to `CurrentFile` — legal here specifically because
   this assignment happens from inside `LiveFileTracker` itself, where
   the `private set` accessor is visible.
4. `_currentFileDate = parsedDate;` — updates this lesson's own tracked
   comparison date (previous Concept Unit's field) to match the file just
   accepted, so the *next* file event correctly compares against this
   one, not whatever was current before it.

### CS Lens

`private set` is **encapsulated state with a public read surface** — a
real, common refinement of the general encapsulation idea an earlier
lesson already named for `DirectoryScanner`'s own dependency boundary: not
every piece of state needs to be either fully public or fully private:
letting outside code freely *observe* a value while reserving the actual
*decision* about when it changes for the class that owns it is its own
distinct, useful middle ground. Also recognized in: a bank displaying a
customer's balance on request, while only the bank's own internal ledger
logic can actually change it; a thermostat's current-temperature display,
readable by anyone in the room, changeable only by its own internal
sensor logic; a scoreboard showing the current score to every spectator,
updated only by the official scorekeeper.

### SE Lens

The alternative — a plain `public InputFile? CurrentFile { get; set; }`,
relying on every future piece of code that touches a `LiveFileTracker` to
simply *choose* never to assign it directly — was available, and would
compile identically for every legitimate use in this project today. It's
a real, latent risk: nothing about a plain public setter stops a future
lesson's UI code, or a hasty edit, from writing `tracker.CurrentFile =
something;` directly, silently bypassing this lesson's entire three-question
pipeline with no compiler warning at all. `private set` turns that
mistake into an immediate compile error instead of a subtle, working-until-
it-isn't bug — the real cost being that `LiveFileTracker` itself is now
the *only* place `CurrentFile` can ever be set, which is exactly the
point, not a limitation to work around.

### Commands Needed

None beyond this lesson's one shared `dotnet build`, run once, covering
every Concept Unit's changes together — shown next.

### Run It

Real, captured output from running `dotnet build` against this lesson's
complete, final `LiveFileTracker.cs` (.NET SDK 10.0.301), unedited:

```
Determining projects to restore...
All projects are up-to-date for restore.
MastercamGenerator -> <project>\bin\Debug\net10.0-windows\MastercamGenerator.dll

Build succeeded.
    0 Warning(s)
    0 Error(s)
```

This one real build covers every Concept Unit in this lesson at once —
the coordinator's shell, both nullable-date guard clauses, the readiness
check, and this unit's own `CurrentFile` property and assignment all
compiled together, in a single pass, per this curriculum's own batching
practice.

### Connecting Back

Every earlier Concept Unit in this lesson built one piece of a pipeline
this unit finally completes: a shared handler (first unit) received every
real event; two guard clauses (second and third units) rejected anything
that didn't belong; this unit is what happens to the one file, out of
however many events actually fire, that survives all three — becoming a
real, observable, safely-encapsulated `CurrentFile`.

---

## Connect the Pieces

Trace two real file events — the doubled `Created`/`Changed` notification
an earlier lesson already proved happens for one real write — through
this lesson's complete pipeline:

1. Mastercam writes a new, correctly-named, genuinely newer setup sheet.
   The OS reports `Created`, then, per an earlier lesson's own real proof,
   `Changed` too, for the same write. Both are routed to the same
   `OnFileEvent` (first Concept Unit).
2. First call (`Created`): `TryParseDate` (second Concept Unit) succeeds;
   the date comparison (second Concept Unit) passes, since this file is
   genuinely newer; `WaitForFileReady` (third Concept Unit) is called —
   and, if Mastercam is still writing at this exact instant, correctly
   waits, or correctly returns `false` if it never finishes in time,
   ending this particular call right there.
3. Second call (`Changed`, moments later, for the same file): `TryParseDate`
   succeeds again, producing the identical date as before. This time,
   `_currentFileDate` may already hold that same date, if the first call
   already succeeded — the `<=` comparison (second Concept Unit) then
   correctly rejects this second call as nothing new, exactly as this
   lesson's own real, captured proof already demonstrated for a duplicate
   date.
4. If instead the first call's `WaitForFileReady` failed (the file wasn't
   ready yet) and returned early, the second call gets a fresh chance:
   `_currentFileDate` was never updated by the failed first attempt, so
   this call's own comparison still passes, and its own `WaitForFileReady`
   call tries again — the file may well be finished by now.
5. Whichever call finally succeeds sets `CurrentFile` (fourth Concept
   Unit) exactly once, through its own `private set`, to a fresh
   `InputFile` built from the real, confirmed-ready file.

This is exactly the coordination this lesson's opening paragraph
promised: three already-correct classes, none of which know the other two
exist, combined through one shared handler and three ordered questions,
surviving a real, previously-proven quirk of the underlying
`FileSystemWatcher` without any special-case code written specifically to
handle it. `CurrentFile` still has no UI reading it — that connection is
this curriculum's next lesson.
