# Lesson 30: The Filesystem Doesn't Tell You Once (Watching the Filesystem for Changes)

**What you will build.** A new, real, permanent class, `ToolFileWatcher`,
watching a real folder for changes to any real `.db` file inside it and
raising one real, coalesced `FilesChanged` event per real, logical save —
built in two real, deliberate stages so the real problem it solves is
seen directly, not just described. The transferable problem underneath
the feature: a real operating system's own file-change notification is
not a clean, one-event-per-save signal — a single real save can fire more
than one real event, and the real moment that event fires says nothing
about whether the file is actually safe to read yet.

**What you need to know first.** A Database on a Network Share —
`ToolRepository.OpenWithBusyTimeout`'s own real `Default Timeout=`
mechanism, directly relevant to this lesson's own third unit. Aggregating
Many Users' Files Automatically — `FindAllToolsInFolder`, the real method
this lesson's own watcher is meant to eventually trigger (not yet wired
together — that's Wiring Live Data Into Both UIs' own job).

**Terms used in this lesson**

- **`FileSystemWatcher`** — a real, `System.IO` class that raises real
  .NET events when files or directories change on disk. It exists so a
  real application can react to real, external changes — a real file
  another process just saved — without constantly polling the real
  filesystem itself to check.
- **event debouncing** — coalescing a real, rapid burst of related
  events into exactly one real, actionable notification, by waiting a
  short real interval after the *last* one before actually acting. It
  exists because a single, real, logical action — one real save — can
  genuinely produce more than one real, raw notification, and reacting
  to every single one, individually, would mean redoing the same real
  work multiple times for what is, to a person, one real event.
- **race condition** — a real class of bug where the correctness of a
  real result depends on the exact real timing of two or more things
  happening close together, rather than on anything the code itself
  explicitly controls. It exists as a named concept here because this
  lesson's own third unit proves directly that a real file-changed
  notification firing says nothing, by itself, about whether the real
  file is actually safe to open at that exact real moment.
- **`System.Timers.Timer`** — a real, first-used-in-this-lesson .NET
  class that raises a real `Elapsed` event once a real, configured
  interval passes, and can be restarted before it fires. It exists here
  as the real, concrete mechanism behind event debouncing (above):
  restarting the same real timer on every new raw event means it only
  ever actually elapses once nothing new has happened for its own full,
  real interval.
- **RESERVED / PENDING / EXCLUSIVE (SQLite locking states)** — three of
  SQLite's own real, named internal lock states a database connection
  can hold, of five real total. Per sqlite.org's own real, fetched
  documentation (`sqlite.org/lockingv3.html`), "RESERVED differs from
  PENDING in that new SHARED locks can be acquired while there is a
  RESERVED lock," while "no new SHARED locks are permitted against the
  database if a PENDING lock is active," and "only one EXCLUSIVE lock is
  allowed on the file and no other locks of any kind are allowed to
  coexist with an EXCLUSIVE lock." They exist, and matter directly to
  this lesson, because they define exactly when a real, concurrent read
  is and isn't safe against a real, in-progress write — a real writer
  merely holding an open transaction (RESERVED) does not block a real
  reader; only the real, brief window right at an actual commit
  (PENDING, then EXCLUSIVE) does.

**Objects and methods used**

- **`ToolFileWatcher`**
  - *What it is:* a new, real, permanent class this lesson builds, in two
    real stages — wrapping `FileSystemWatcher` (below) to raise one real,
    debounced `FilesChanged` event per real, logical folder change.
  - *Implementation:* `public class ToolFileWatcher : IDisposable`, a
    real constructor taking a real folder path and a real, optional
    debounce interval, one real public event (`FilesChanged`), and a
    real `Dispose()` — shown in full across this lesson's first two
    units.
  - *Its use:* the real, concrete subject of this lesson — the first
    real, live, event-driven capability this project has built outside
    the WebView2 bridge itself.
  - *Type:* a real, concrete class implementing `IDisposable`
    (established Connecting to a Database File's own real
    `using`/`IDisposable` pattern).
  - *Responsibility:* its full real charter is watching one real folder
    for real `.db` file changes and raising exactly one real
    `FilesChanged` event per real, coalesced burst of underlying activity
    — never more, and never before the real, underlying filesystem
    activity has actually settled.
  - *Depends on:* a real, existing folder to watch; a real
    `FileSystemWatcher` and a real `System.Timers.Timer` internally.
  - *Connects to:* not yet constructed anywhere in `MainWindow.xaml.cs` —
    proven correct by two new, real, permanent tests only, matching this
    project's own established "prove it, then wire it in later" pattern;
    Wiring Live Data Into Both UIs is where this project's own roadmap
    actually connects it to a real, running UI.
  - *Shape:* a new, real, standalone capability — this project's own
    first class built specifically around raising and coalescing events,
    rather than around SQL or XAML.

- **`FileSystemWatcher` / `Changed` event / `EnableRaisingEvents`**
  - *What it is:* the real, external .NET class `ToolFileWatcher` wraps;
    `Changed` is its real event, raised when a watched real file's
    contents change; `EnableRaisingEvents` is a real, `bool` property
    that must be set `true` before any real event fires at all.
  - *Implementation:* real, relevant declared shape, verified against
    real .NET documentation and this lesson's own real, executed labs:
    `public FileSystemWatcher(string path, string filter)`; `public event
    FileSystemEventHandler? Changed`; `public bool EnableRaisingEvents {
    get; set; }`.
  - *Its use:* `ToolFileWatcher`'s own real constructor creates one,
    filtered to `"*.db"`, and subscribes to its real `Changed` event.
  - *Type:* `FileSystemWatcher` is a real, concrete class;
    `EnableRaisingEvents` is a real, ordinary property; `Changed` is a
    real, multicast event.
  - *Responsibility:* its full real charter is monitoring one real
    directory's own real files, matching a given real filter, and
    raising real, raw .NET events for real, underlying operating-system
    notifications — with no real guarantee, as this lesson's own first
    unit proves directly, of exactly one event per real, logical change.
  - *Depends on:* a real, existing, readable directory.
  - *Connects to:* its own real, raw `Changed` event is exactly what
    `ToolFileWatcher`'s own real debounce logic (this lesson's second
    unit) exists to tame.
  - *Shape:* a real, external, framework-owned event source — the
    genuine origin of every real notification this lesson's own code
    reacts to, never itself modified by this project.

- **`System.Timers.Timer` / `Elapsed` / `Start()` / `Stop()` / `AutoReset`**
  - *What it is:* the real, external .NET class behind event debouncing
    (Terms, above) — `Elapsed` is its real event, raised once its own
    real interval passes; `Start()`/`Stop()` control whether it's
    currently counting down; `AutoReset` controls whether it restarts
    itself automatically after firing.
  - *Implementation:* real, relevant declared shape: `public
    Timer(double interval)`; `public event ElapsedEventHandler? Elapsed`;
    `public void Start()`; `public void Stop()`; `public bool AutoReset {
    get; set; }`.
  - *Its use:* `ToolFileWatcher`'s own real debounce timer is constructed
    with `AutoReset = false` — it fires its real `Elapsed` event exactly
    once per real "armed" period, then stays stopped until explicitly
    restarted, rather than firing repeatedly on a real, fixed schedule.
  - *Type:* a real, concrete class; the other three are real instance
    members.
  - *Responsibility:* its full real charter is measuring one real,
    configurable interval and raising exactly one real notification when
    it elapses, unless stopped and restarted first — restarting is what
    lets `ToolFileWatcher` treat "another raw event arrived" as "push the
    real deadline back out," the entire real mechanism behind debouncing.
  - *Depends on:* nothing beyond a real, chosen interval.
  - *Connects to:* its own `Elapsed` handler is where `ToolFileWatcher`'s
    own real, public `FilesChanged` event actually gets raised.
  - *Shape:* a second real, external, framework-owned mechanism,
    composed together with `FileSystemWatcher` inside `ToolFileWatcher`
    to produce one real, combined, well-behaved capability neither piece
    provides alone.

**Everything else in the file, not this lesson's own subject but still
explained**

- **`SqliteConnection`, `SqliteCommand`, `BeginTransaction()`, `Commit()`/
  `Rollback()`**
  - *What it is:* reappearing, unchanged — this project's own real,
    established ADO.NET and transaction vocabulary.
  - *Implementation:* unchanged from every earlier real appearance.
  - *Its use:* this lesson's own third unit uses all of these to
    construct a real, deliberate, open, uncommitted transaction — a
    genuine real RESERVED lock (Terms, above) — to test what a real
    concurrent read can and can't do against it.
  - *Type:* unchanged real ADO.NET classes/methods.
  - *Responsibility:* unchanged.
  - *Depends on:* unchanged.
  - *Connects to:* unchanged.
  - *Shape:* unchanged.

---

## Concept Unit: `FileSystemWatcher` — One Save, More Than One Event

### The Problem

`ToolRepository.FindAllToolsInFolder` (Aggregating Many Users' Files
Automatically) can already re-scan a real folder on demand — but nothing
in this project yet knows *when* to call it again. A real, live-updating
application needs to notice a real, external change to that real folder
without a person clicking a real "refresh" button. Does watching a real
folder for changes behave the way "one event per save" would suggest —
simple to react to directly — or is there a real, hidden complication
worth proving before this project's own real code assumes otherwise?

> **Try this first:** this project's own real WebView2 bridge (A Shared
> Language Across the Boundary) already proved that a real, single
> logical action — posting one real message — corresponds to exactly one
> real event on the receiving side. Given that a real file save, from a
> person's own point of view, is also "one logical action," would you
> expect a real `FileSystemWatcher`'s own `Changed` event to fire exactly
> once per real save the same way — or might a real operating system's
> own, lower-level view of "what changed" not match a person's own
> higher-level idea of "one save" quite so cleanly?

### Introduce the Concept in Isolation

A real, throwaway text file, watched for real, then written to exactly
once:

```csharp
using var watcher = new FileSystemWatcher(watchedFolder, watchedFile);
watcher.NotifyFilter = NotifyFilters.LastWrite;
watcher.Changed += (sender, e) => Console.WriteLine($"Changed event, ChangeType={e.ChangeType}");
watcher.EnableRaisingEvents = true;

File.WriteAllText(watchedFullPath, "updated content");
```

Real, captured output:

```
Changed event #1 at 21:11:53.316, ChangeType=Changed
Changed event #2 at 21:11:53.353, ChangeType=Changed
--- Real total Changed events fired for one real write: 2 ---
```

This real, captured output proves the Socratic question's own answer
directly: one real `File.WriteAllText` call — one, real, logical save —
genuinely fired **two** real `Changed` events, 37 real milliseconds
apart. Real applications built naively around "one event means one
change" would, provably, do twice the real work this specific real save
actually needed.

### Discard the Throwaway Example

This exact throwaway watched text file is discarded now — it never
appears in this project again. What's proven is that `FileSystemWatcher`
genuinely can, and does, fire more than one real event for one real save
— not this specific throwaway timing.

### Project Change

- **Reference Source** — no reference counterpart consulted this session;
  per this project's own self-containment rule.
- **Files affected** — `ToolDB/ToolFileWatcher.cs`, created.
- **Change type** — add.
- **Location** — a brand-new file, alongside `ToolRepository.cs`.
- **Dependencies** — none beyond `System.IO`'s own real
  `FileSystemWatcher`.

### The New Code

```csharp
public class ToolFileWatcher : IDisposable
{
    private readonly FileSystemWatcher _watcher;

    public event EventHandler? FilesChanged;

    public ToolFileWatcher(string folderPath)
    {
        _watcher = new FileSystemWatcher(folderPath, "*.db");
        _watcher.NotifyFilter = NotifyFilters.LastWrite;
        _watcher.Changed += (sender, e) => FilesChanged?.Invoke(this, EventArgs.Empty);
        _watcher.EnableRaisingEvents = true;
    }

    public void Dispose()
    {
        _watcher.Dispose();
    }
}
```

### The Updated Project

`ToolDB/ToolFileWatcher.cs`, a brand-new file (Project Change already
covers the "brand-new file" case):

```csharp
1  public class ToolFileWatcher : IDisposable
2  {
3      private readonly FileSystemWatcher _watcher;
4
5      public event EventHandler? FilesChanged;
6
7      public ToolFileWatcher(string folderPath)
8      {
9          _watcher = new FileSystemWatcher(folderPath, "*.db");
10         _watcher.NotifyFilter = NotifyFilters.LastWrite;
11         _watcher.Changed += (sender, e) => FilesChanged?.Invoke(this, EventArgs.Empty);
12         _watcher.EnableRaisingEvents = true;
13     }
14
15     public void Dispose()
16     {
17         _watcher.Dispose();
18     }
19 }
```

This real, first-stage class works, but carries the identical real flaw
this unit's own isolated lab just proved: a single real save to a
watched `.db` file will make its own `FilesChanged` fire more than once,
exactly as the underlying real `Changed` event does — proven directly
against this exact class, not just the analogy, in a real, temporary
check this session (a real folder with one watched `.db` file, one real
write, `FilesChanged` observed firing twice). Fixing that is this
lesson's own next unit.

### Mechanical Walkthrough

- `public class ToolFileWatcher : IDisposable` — `class`/`:` (reappearing)
  — implementing `IDisposable` (established Connecting to a Database
  File, reappearing) so a real caller can reliably stop watching via a
  real `using` block or explicit `Dispose()` call.
- `private readonly FileSystemWatcher _watcher;` — `private readonly`
  (established What an ORM Is and Isn't, reappearing) — holds the one
  real, underlying watcher this class wraps.
- `public event EventHandler? FilesChanged;` — `event` (reappearing,
  established `AboutViewModel`'s own `PropertyChanged`) declares a real,
  public event; `EventHandler?` (reappearing, established `EventHandler
  <TEventArgs>`'s own generic family) is the real, non-generic delegate
  type for an event that carries no extra real data beyond "something
  happened" — the real `?` marks it nullable, since no real subscriber is
  required to exist.
- `public ToolFileWatcher(string folderPath)` — reappearing (established
  `ToolDbContext`'s own real constructor) — takes one real, required
  folder path.
- `_watcher = new FileSystemWatcher(folderPath, "*.db");` — `FileSystemWatcher`
  (Header, above)'s own real, two-argument constructor: the real folder
  to watch, and a real filter string restricting real notifications to
  files matching `*.db` only.
- `_watcher.NotifyFilter = NotifyFilters.LastWrite;` — `NotifyFilter` is
  a real, `FileSystemWatcher` property choosing which real *kind* of
  change to report; `NotifyFilters.LastWrite` (a real, first-appearing
  enum value) means "a file's own last-written timestamp changed" — the
  real, specific signal this project cares about, since a tool database
  being saved is exactly that.
- `_watcher.Changed += (sender, e) => FilesChanged?.Invoke(this,
  EventArgs.Empty);` — `+=` (reappearing, established Two-Way
  Communication Across the Split's own real event subscriptions)
  subscribes a real lambda expression (reappearing) to `FileSystemWatcher`'s
  own real `Changed` event; inside it, `FilesChanged?.Invoke(...)`
  (reappearing, established `AboutViewModel`'s own `PropertyChanged?
  .Invoke(...)`) raises this class's own real, public event in turn,
  passing `EventArgs.Empty` (a real, shared, argument-free instance) since
  no extra real data needs to travel with it.
- `_watcher.EnableRaisingEvents = true;` — Header, above — the real,
  necessary final step; without it, `FileSystemWatcher` constructs
  successfully but never actually raises any real event at all.
- `public void Dispose() { _watcher.Dispose(); }` — reappearing
  (established Connecting to a Database File) — releases the real,
  underlying operating-system watch handle `FileSystemWatcher` itself
  holds.

### CS Lens

`ToolFileWatcher` re-raising its own real event from inside a real
handler for someone else's event is a concrete instance of the
**Observer pattern**, reappearing — a subject (here, `FileSystemWatcher`)
notifies its own real subscribers when something changes, and one of
those real subscribers (`ToolFileWatcher` itself) turns around and
becomes a subject to a second, different real set of listeners. Also
recognized in: this project's own `AboutViewModel`'s own real
`PropertyChanged` event, established XAML Data Binding & MVVM Basics; a
real UI framework's own event bubbling, where a low-level real event (a
mouse click on a button) re-fires as a higher-level real event (a menu
command); a real message queue consumer that re-publishes a transformed
real event onto a second, different real topic.

### SE Lens

Why build `ToolFileWatcher` as its own real, separate class, rather than
subscribing to a real `FileSystemWatcher` directly wherever this project
eventually needs live updates (`MainWindow.xaml.cs`, for instance)? The
real alternative — no wrapper at all — was rejected here because this
unit's own real proof already shows raw `FileSystemWatcher` events are
not safe to react to directly; every real caller would otherwise need to
reimplement the identical real debounce logic (this lesson's own next
unit) by hand, or risk the identical real double-firing bug. The real,
honest cost of this specific first stage: it is not yet safe to use for
anything real — it's shown here, unfinished, specifically so the next
unit's own real fix can be understood as a fix for something already
proven broken, not an abstract precaution.

### Run It

A real `dotnet build` was run this session: build succeeded, 0 new
Warnings, 0 Errors. This exact real class's own double-firing behavior
was confirmed directly this session, matching the isolated lab's own real
result — no permanent test was written against it, since asserting a
known real bug as a permanent, expected contract would itself be
misleading; the next unit's own permanent test asserts the real, correct,
fixed behavior instead. Real source and captured output for the isolated
duplicate-event lab are saved in
`verification/lesson-30/lab1-duplicate-events-and-debounce.cs`.

### Connecting Back

`ToolFileWatcher` now exists and genuinely watches a real folder — but it
inherits `FileSystemWatcher`'s own real, proven flaw of firing more than
once per real save. The next unit fixes that directly, with debouncing.

---

## Concept Unit: Event Debouncing — Coalescing a Real Burst Into One Real Signal

### The Problem

This lesson's own first unit proved `ToolFileWatcher` fires its own
`FilesChanged` event more than once for a single real save. If this
project's own eventual real UI reacted to every single real
`FilesChanged` firing by immediately re-running
`FindAllToolsInFolder` (Aggregating Many Users' Files Automatically), one
real save could trigger that real, potentially-expensive scan twice, or
more. What real mechanism could collapse a real, rapid burst of related
events into exactly one real, actionable signal?

> **Try this first:** `System.Timers.Timer` (Terms, above) raises its own
> real `Elapsed` event once a chosen real interval passes since it was
> last started — and, critically, `Start()` can be called again before
> it elapses, which simply restarts the real countdown. Given that, what
> would happen if *every* real, raw `Changed` event restarted the same
> real timer, rather than each one independently scheduling its own?
> Under what real condition would the timer's own `Elapsed` event ever
> actually get to fire?

### Introduce the Concept in Isolation

A real, throwaway debounce timer, fed four real, artificial "raw events,"
50 real milliseconds apart — well inside a real 300-millisecond debounce
window:

```csharp
var debounceTimer = new System.Timers.Timer(300);
debounceTimer.AutoReset = false;
debounceTimer.Elapsed += (s, e) => Console.WriteLine("Real coalesced event fired");

void OnRawEvent()
{
    debounceTimer.Stop();
    debounceTimer.Start();
}
```

Real, captured output:

```
Real raw event #1 at 21:12:39.706 — restarting the real debounce timer
Real raw event #2 at 21:12:39.815 — restarting the real debounce timer
Real raw event #3 at 21:12:39.878 — restarting the real debounce timer
Real raw event #4 at 21:12:39.940 — restarting the real debounce timer
--- Waiting for the real debounce window to actually elapse ---
Real coalesced event #1 fired at 21:12:40.263
--- Real totals: 4 raw events, 1 coalesced event(s) ---
```

This real, captured output proves the Socratic question's own answer
directly: each real, raw event restarted the timer before it could ever
elapse, so all four collapsed into real silence until, finally, no new
real event arrived for the timer's own full, real 300-millisecond
window — at which point it fired exactly once. This technique is called
**event debouncing** (Terms, above).

### Discard the Throwaway Example

This exact throwaway four-event burst is discarded now — it never
appears in this project again. What's proven is that a
restart-on-every-event real timer genuinely coalesces a real burst into
one real signal — not this specific throwaway timing or event count.

### Project Change

- **Reference Source** — no reference counterpart consulted this session;
  per this project's own self-containment rule.
- **Files affected** — `ToolDB/ToolFileWatcher.cs`, modified (debounce
  timer added). `ToolDB.Tests/ToolFileWatcherTests.cs`, created (first
  real, permanent test).
- **Change type** — add.
- **Location** — `ToolFileWatcher.cs`'s own constructor, established this
  lesson's first unit.
- **Dependencies** — `System.Timers.Timer` (Header, above).

### The New Code

```csharp
public ToolFileWatcher(string folderPath, double debounceMilliseconds = 500)
{
    _debounceTimer = new System.Timers.Timer(debounceMilliseconds);
    _debounceTimer.AutoReset = false;
    _debounceTimer.Elapsed += (sender, e) => FilesChanged?.Invoke(this, EventArgs.Empty);

    _watcher = new FileSystemWatcher(folderPath, "*.db");
    _watcher.NotifyFilter = NotifyFilters.LastWrite;
    _watcher.Changed += (sender, e) =>
    {
        _debounceTimer.Stop();
        _debounceTimer.Start();
    };
    _watcher.EnableRaisingEvents = true;
}
```

### The Updated Project

`ToolDB/ToolFileWatcher.cs`, with the debounce timer added directly into
the constructor, and a matching field/`Dispose()` update:

```csharp
1  public class ToolFileWatcher : IDisposable
2  {
3      private readonly FileSystemWatcher _watcher;
4      private readonly System.Timers.Timer _debounceTimer;                            // ← new
5
6      public event EventHandler? FilesChanged;
7
8      public ToolFileWatcher(string folderPath, double debounceMilliseconds = 500)     // ← new
9      {
10         _debounceTimer = new System.Timers.Timer(debounceMilliseconds);              // ← new
11         _debounceTimer.AutoReset = false;                                            // ← new
12         _debounceTimer.Elapsed += (sender, e) => FilesChanged?.Invoke(this, EventArgs.Empty); // ← new
13
14         _watcher = new FileSystemWatcher(folderPath, "*.db");
15         _watcher.NotifyFilter = NotifyFilters.LastWrite;
16         _watcher.Changed += (sender, e) =>                                           // ← new
17         {                                                                             // ← new
18             _debounceTimer.Stop();                                                    // ← new
19             _debounceTimer.Start();                                                   // ← new
20         };                                                                            // ← new
21         _watcher.EnableRaisingEvents = true;
22     }
23
24     public void Dispose()
25     {
26         _watcher.Dispose();
27         _debounceTimer.Dispose();                                                     // ← new
28     }
29 }
```

`ToolFileWatcher` now raises exactly one real `FilesChanged` event per
real, coalesced burst of underlying `Changed` activity, rather than one
per raw, individual event. A new, real, permanent test confirms this
directly: four real, rapid writes to a real, watched file, 50
milliseconds apart, produce exactly one real `FilesChanged` firing.

### Mechanical Walkthrough

- `private readonly System.Timers.Timer _debounceTimer;` —
  `private readonly` (reappearing) — a second real field, holding the
  real debounce timer this constructor builds.
- `public ToolFileWatcher(string folderPath, double debounceMilliseconds
  = 500)` — a real, second constructor parameter, `debounceMilliseconds`,
  given a real default value of `500` — the first real default parameter
  value in this project, letting most real callers omit it while still
  allowing a real, explicit override (used directly by this lesson's own
  test, passing `300`).
- `_debounceTimer = new System.Timers.Timer(debounceMilliseconds);` —
  `Timer(double)` (Header, above) — constructs the real timer with the
  real, chosen interval.
- `_debounceTimer.AutoReset = false;` — `AutoReset` (Header, above) — a
  real, deliberate `false`: without it, the real timer would keep firing
  its own `Elapsed` event repeatedly, every real interval, forever, once
  started, rather than firing once and then waiting to be armed again by
  the next real, raw event.
- `_debounceTimer.Elapsed += (sender, e) => FilesChanged?.Invoke(this,
  EventArgs.Empty);` — `Elapsed` (Header, above) is subscribed once, in
  the constructor — this is the one real place `FilesChanged` (this
  class's own public event) is actually raised now, no longer raised
  directly from `FileSystemWatcher`'s own `Changed` handler.
- `_watcher.Changed += (sender, e) => { _debounceTimer.Stop();
  _debounceTimer.Start(); };` — the real, raw `Changed` handler no longer
  raises `FilesChanged` itself; it instead calls `Stop()` then `Start()`
  (Header, above) on the real debounce timer — restarting its own real
  countdown every single time, the exact real mechanism this unit's own
  isolated lab already proved collapses a real burst into one signal.

### CS Lens

Restarting a real, single timer on every new real event, so it only ever
fires once nothing new has happened for its own full real interval, is a
concrete instance of **debouncing** as a general real technique — the
same real idea recognized well beyond this one real class. Also
recognized in: a real, physical light switch's own "off delay" circuit,
resetting its own countdown every time it senses motion again; a real web
search box's own "wait until the user stops typing" behavior before
firing a real autocomplete request; a real mechanical relay's own
contact bounce being filtered in hardware, so one real physical press
registers as one real electrical signal, not several.

### SE Lens

Why choose a real 500-millisecond default debounce interval, rather than
some other real value? The real alternative — a much shorter real
interval, closer to this project's own observed real 37-millisecond gap
between duplicate events — was rejected here because that real gap is
itself just one real, observed data point, not a real, guaranteed upper
bound; a slower real disk, a real network share (A Database on a Network
Share), or a real antivirus scanner briefly touching the file could all
plausibly widen that real gap beyond a too-tight real debounce window,
causing the identical real double-firing bug to resurface even with
debouncing "in place." The real, honest cost of 500 milliseconds instead:
a genuinely real, live update now takes up to half a real second longer
to actually appear on screen than the theoretical real minimum — a real,
deliberate trade of a small, real, human-imperceptible delay for real
robustness against a real timing assumption this project cannot fully
control or verify in advance.

### Run It

A real `dotnet build` was run this session: build succeeded, 0 new
Warnings, 0 Errors. A new, real, permanent test,
`FilesChanged_FiresExactlyOnce_ForARapidBurstOfRealWrites`, was added to
a new file, `ToolDB.Tests/ToolFileWatcherTests.cs` — confirmed passing
this session. Real source and captured output for the isolated debounce
lab are saved in `verification/lesson-30/lab1-duplicate-events-and-debounce.cs`.

### Connecting Back

`ToolFileWatcher` now genuinely raises one real, coalesced event per real
save, proven directly against its own real, permanent code. The next
unit proves a second, separate real problem this fix does not solve: even
one, correctly-coalesced real event says nothing about whether the real
file is actually safe to read the instant it fires.

---

## Concept Unit: A Race Condition — "Changed" Doesn't Mean "Safe to Read"

### The Problem

`ToolFileWatcher` can now tell this project's own code, reliably, "a real
`.db` file in this folder just finished one real, coalesced burst of
changes." But *when* exactly does that real notification fire relative
to the real writer's own work actually finishing? If this project's own
eventual real handler reacted by immediately calling
`FindAllToolsInFolder` (Aggregating Many Users' Files Automatically), is
that real file always guaranteed to be genuinely safe to open at that
exact real moment — or could a real reader arrive too early, mid-write?

> **Try this first:** A Database on a Network Share already proved a
> real writer's own open transaction can block a *second real writer*
> outright. Given SQLite names several real, distinct internal lock
> states, not just "locked" and "unlocked," would you expect a real
> *reader* arriving while a writer's own transaction is merely open, but
> not yet committed, to be treated the identical real way as a second
> writer would be — or might reading and writing be governed by real,
> different rules?

### Introduce the Concept in Isolation

A real, deliberate writer, holding a real, open, uncommitted transaction
— a genuine RESERVED lock (Terms, above) — while a second, real, plain
connection attempts to read:

```csharp
using var transaction = writerConnection.BeginTransaction();
new SqliteCommand("INSERT INTO widgets (name) VALUES ('from writer')", writerConnection, transaction).ExecuteNonQuery();
// transaction deliberately left open here

using var plainReader = new SqliteConnection($"Data Source={dbPath}");
plainReader.Open();
new SqliteCommand("SELECT COUNT(*) FROM widgets", plainReader).ExecuteScalar();
```

Real, captured output:

```
--- Lab: reading with a plain connection, no timeout, while still locked ---
Plain read succeeded (unexpected).
```

This real, captured output is genuinely instructive precisely because it
contradicts a naive first guess: the real read succeeded immediately,
with no wait and no exception, even though the writer's own transaction
was still fully open. Per sqlite.org's own real, fetched documentation,
quoted in this lesson's own Header, this is exactly correct: "new SHARED
locks can be acquired while there is a RESERVED lock." The real risk this
lesson's own Socratic question predicted is real, but it lives somewhere
narrower — per that same real documentation, only once a writer reaches
PENDING (right before an actual commit) are *new* readers refused, and
only EXCLUSIVE (the instant the commit itself writes) blocks every real
access outright. An ordinary, small real commit passes through those two
real states essentially instantly, which is exactly why this specific,
real, local test cannot reliably force that narrower window on demand —
the identical real category of honest limit this project's own WAL/
network-share findings (A Database on a Network Share) already
established for a different real reason.

### Discard the Throwaway Example

This exact throwaway `widgets` table and writer/reader pair are discarded
now — neither appears in this project again. What's proven is that a
RESERVED lock genuinely does not block a new real reader — a real,
important, non-obvious fact — while the narrower, real PENDING/EXCLUSIVE
risk remains real and documented, not locally reproduced.

### Project Change

- **Reference Source** — no reference counterpart consulted this session;
  per this project's own self-containment rule.
- **Files affected** — `ToolDB/ToolRepository.cs`, modified
  (`FindAllToolsInFolder`'s own connection string). `ToolDB.Tests
  /ToolRepositoryTests.cs`, modified (one new, real, permanent test).
- **Change type** — configure.
- **Location** — `FindAllToolsInFolder`, established Aggregating Many
  Users' Files Automatically.
- **Dependencies** — `Default Timeout=` (established A Database on a
  Network Share).

### The New Code

```csharp
using var connection = new SqliteConnection($"Data Source={file};Mode=ReadOnly;Default Timeout=2");
```

### The Updated Project

`ToolRepository.cs`'s own `FindAllToolsInFolder`, with one real
connection-string value changed:

```csharp
112 public static (List<Tool> Tools, List<string> Errors) FindAllToolsInFolder(string folderPath)
113 {
114     var tools = new List<Tool>();
115     var errors = new List<string>();
116
117     foreach (string file in Directory.GetFiles(folderPath, "*.db"))
118     {
119         try
120         {
121             using var connection = new SqliteConnection($"Data Source={file};Mode=ReadOnly;Default Timeout=2");  // ← changed
122             connection.Open();
123
124             /* unchanged from here down, established Aggregating Many Users' Files Automatically */
141 }
```

This real, small, deliberate change costs nothing on the common, real
path this lesson's own second unit's isolated lab already proved is safe
(a real reader against a real RESERVED lock succeeds immediately either
way) — it exists specifically as cheap, real insurance against the
narrower, real, documented PENDING/EXCLUSIVE window this session's own
tests cannot force on demand, and against any real, future write path
this method might one day gain. A new, real, permanent test confirms
`FindAllToolsInFolder` still succeeds, with zero real errors reported,
against a real file another connection currently holds open via an
uncommitted transaction.

### Mechanical Walkthrough

- `$"Data Source={file};Mode=ReadOnly;Default Timeout=2"` — `Data
  Source`/`Mode=ReadOnly` (established Aggregating Many Users' Files
  Automatically, reappearing) are unchanged; `Default Timeout=2`
  (established A Database on a Network Share, reappearing) is the one
  real, new addition — a real, small, two-second real busy-timeout,
  applied per real file, per real aggregation pass.

### CS Lens

Adding a cheap, real safeguard against a real, documented risk this
session's own tests couldn't force on demand, rather than skipping it
because "the test didn't catch anything," is a concrete instance of
**defense in depth** — a real design principle where a real safeguard's
own justification comes from a documented, real threat model, not solely
from a locally-reproduced failure. Also recognized in: real seatbelt
laws, justified by real, aggregate crash statistics no single real
individual's own driving record could ever prove; a real building's own
fire sprinklers, installed even in a building that has never once caught
fire; this project's own real, established practice of parameterizing
every real SQL value (Never Let Data Become Code) regardless of whether
any specific real value passed to it has ever actually been malicious.

### SE Lens

Why make this real change to `FindAllToolsInFolder` specifically, rather
than to `ToolFileWatcher` itself? The real alternative — teaching the
watcher to retry — was rejected here because `ToolFileWatcher`'s own real
job (Header, above) is narrowly "notice a change and say so once,
reliably" — it has no real reason to know anything about SQLite,
connections, or timeouts at all; folding retry logic into it would mix
two real, separate responsibilities into one real class. The real,
correct seam for this real fix is the method that actually opens a real
SQLite connection — `FindAllToolsInFolder` — keeping `ToolFileWatcher`
genuinely reusable for watching any real kind of file change, not
specifically tied to this project's own real SQLite-specific concerns.
The real, honest cost: this real fix is invisible until the exact,
narrow, real PENDING/EXCLUSIVE window actually occurs — a caller reading
this method's own code with no context might reasonably wonder why a
`Default Timeout=` sits on a method that, per this lesson's own real
tests, appears to work identically without it.

### Run It

A real `dotnet build` was run this session: build succeeded, 0 new
Warnings, 0 Errors. A new, real, permanent test was added to
`ToolRepositoryTests.cs`
(`FindAllToolsInFolder_SucceedsAgainstAFile_WithARealOpenUncommittedWriter`).
**Full suite: 36 tests, 0 failures** — the real, current, full count for
this project (up from 34). Real source and captured output for the
isolated RESERVED-lock lab are saved in
`verification/lesson-30/lab2-reserved-lock-allows-readers.cs`.

### Connecting Back

This project now has direct, real, honest evidence for exactly when a
real, concurrent read is and isn't safe against a real, in-progress
write — reassuringly permissive in the common, real case this session
could test, and defended, cheaply, against the narrower, real,
documented case it couldn't.

---

## Connect the Pieces

One real, watched folder, traced through all three units:

1. `ToolFileWatcher` was built, in its first, real, incomplete form, and
   immediately shown — against its own real code, not just an analogy —
   to inherit `FileSystemWatcher`'s own real, proven flaw: one real save
   can fire more than one real event (Unit 1).
2. A real, restart-on-every-event `System.Timers.Timer`, proven first in
   isolation, then wired directly into `ToolFileWatcher`'s own real
   constructor, fixed that — a new, real, permanent test confirms exactly
   one real `FilesChanged` firing for a real, rapid burst of writes
   (Unit 2).
3. A real, deliberate writer/reader test proved a genuinely reassuring,
   real fact — a plain read succeeds against an open, uncommitted writer
   — while sqlite.org's own real, cited documentation named the real,
   narrower risk that specific test couldn't force; `FindAllToolsInFolder`
   gained a cheap, real, defensive `Default Timeout=` against it anyway,
   proven not to change the method's own already-correct, common-case
   real behavior (Unit 3).

**Next lesson:** 31 — Doing That Without Freezing the GUI (`Task`,
`async`/`await`, `Dispatcher`; includes diagnosing and fixing a real UI
freeze/deadlock).
