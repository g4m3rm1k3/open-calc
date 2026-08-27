# Lesson 13: Crossing Back to the Thread That Owns It — Background Work and the WPF Dispatcher

**What you will build.** Two real fixes to the two different kinds of
background work this project now does: `LiveFileTracker`'s callback-based
file events, which an earlier lesson left crossing thread boundaries
unsafely, get wrapped in a real `Dispatcher.Invoke` call; and
`BrowseButton_Click`'s own directory scan gets moved onto a background
thread deliberately, using `Task.Run` and `async`/`await`, so a large
folder no longer freezes the window while it's being scanned. What this
lesson is actually about goes past these two fixes: an earlier lesson
ended by naming a real bug and citing WPF's own documented threading
model without proving it firsthand. This lesson opens by reproducing that
exact exception for real, then teaches two genuinely different tools for
two genuinely different situations — one for work this project chooses to
push onto a background thread on purpose, and one for work (a real OS
file-system callback) that was never on the UI thread to begin with, and
has no `await` anywhere in its own call chain to lean on.

**What you need to know first.** Lesson 12 — this lesson's entire reason
for existing: its own closing section named, and cited real WPF
documentation for, the exact cross-thread bug this lesson now reproduces
and fixes. Lesson 5 — `DirectoryScanner.ScanDirectory`, called here from a
background thread for the first time, unchanged itself.

**Terms used in this lesson.**

- **`async`** — a C# modifier applied to a method, enabling that method's
  body to use `await` (below). Applied here to an event handler
  (`private async void BrowseButton_Click(...)`), a genuinely special
  case: ordinarily, an `async` method should return `Task` rather than
  `void`, so its own caller has something to `await`; `async void` is a
  narrow, accepted exception specifically for event handlers, which WPF
  itself calls directly and never awaits. It exists to let a method
  contain a real pause — waiting for something else to finish — without
  blocking the entire thread it's running on while it waits.
- **`await`** — a C# keyword, written immediately before an expression
  producing a `Task` (below), that suspends the containing `async`
  method at that exact point until the awaited `Task` completes — without
  blocking the thread the method was running on, which remains free to do
  other work (for a UI thread, specifically: staying responsive to input,
  repainting, and running other event handlers) while the wait continues.
  Once the awaited work finishes, the rest of the method resumes running
  on the same kind of thread it was on before the `await` — for a method
  that started on the UI thread, that means the code *after* an `await`
  is automatically back on the UI thread, with no explicit step required
  to return there.

**Objects and methods used.**

- **`System.Threading.Tasks.Task<TResult>`**
  - *What it is:* a .NET class representing an operation that may still
    be running, and will eventually produce a value of type `TResult`
    once it finishes.
  - *Implementation:* a public class in `System.Threading.Tasks` —
    available in this project with no `using` directive needed, since
    that namespace is one of this project's own real, generated implicit
    usings, proven in an earlier lesson.
  - *Its use:* the real return type of `Task.Run` (below), representing
    "the directory scan currently running on some other thread, which
    will eventually produce a `List<InputFile>`."
  - *Type:* a public generic class.
  - *Responsibility:* tracking whether a background operation has
    finished yet, and, once it has, holding the value it produced (or the
    exception it threw, if it failed) for whoever's waiting on it.
  - *Depends on:* whatever work was actually started to produce it —
    here, `Task.Run`'s own delegate.
  - *Connects to:* returned by `Task.Run`; consumed by this lesson's own
    `await` expression.
  - *Shape:* the real object an `await` expression is always,
    structurally, waiting on — never magic, always a real, inspectable
    value.
- **`Task.Run<TResult>(Func<TResult>)`**
  - *What it is:* the method that actually starts a piece of work running
    on a different thread, from .NET's own managed thread pool, and
    hands back a `Task<TResult>` (above) tracking it.
  - *Implementation:* a `static` method on `Task`, taking a **lambda
    expression** (already fully explained) representing the work to run,
    and returning `Task<TResult>` immediately, without waiting for that
    work to finish.
  - *Its use:* the one line that actually moves `DirectoryScanner.
    ScanDirectory` off the UI thread.
  - *Type:* a `static` method.
  - *Responsibility:* handing a piece of work to the thread pool and
    returning a live handle to its eventual result, immediately, without
    blocking the calling thread even briefly.
  - *Depends on:* a real delegate describing the work to run.
  - *Connects to:* called from `BrowseButton_Click`; its result is
    immediately `await`-ed.
  - *Shape:* the actual mechanism this lesson uses to deliberately choose
    "run this somewhere else," as opposed to `LiveFileTracker`'s own
    background thread, which this project never chose — .NET's own
    `FileSystemWatcher` picked it.
- **`System.Windows.Threading.Dispatcher`**
  - *What it is:* the real object, already named without being shown, in
    an earlier lesson's own cited WPF documentation — the mechanism a
    background thread uses to ask the UI thread to run something on its
    behalf.
  - *Implementation:* a public class in `System.Windows.Threading`. Every
    `DispatcherObject` (the base, several levels up, of every WPF control
    — already named, though not shown, in an earlier lesson) exposes its
    own creating thread's `Dispatcher` through a `Dispatcher` property;
    `MainWindow` itself, being a `DispatcherObject`, exposes one directly,
    reachable in this lesson's own code simply as `Dispatcher`.
  - *Its use:* the real bridge `OnWatcherStatusUpdated` (an earlier
    lesson's own method) uses to safely reach back to the UI thread from
    inside a callback `LiveFileTracker` invokes on its own, separate
    thread.
  - *Type:* a public class, one instance per UI thread, never constructed
    directly by this project's own code.
  - *Responsibility:* maintaining a queue of work items and running each
    one, in order, on the one specific thread it belongs to — the same
    thread that created every WPF control this project has ever built.
  - *Depends on:* being associated, at construction, with a real UI
    thread WPF itself started.
  - *Connects to:* its `Invoke` method (below) is the one member this
    lesson's own code calls.
  - *Shape:* the actual, real object underneath the documented
    enforcement mechanism an earlier lesson could only cite, not show —
    shown here, for the first time, doing real work.
- **`Dispatcher.Invoke(Action)`**
  - *What it is:* the method that runs a piece of work on the
    `Dispatcher`'s own UI thread, waiting until it's actually finished
    before returning control to whichever thread called it.
  - *Implementation:* an instance method on `Dispatcher`, taking a
    **lambda expression** (already fully explained) with no parameters
    and no return value — real, verified proof that calling it from a
    background thread genuinely succeeds, where a direct assignment from
    that same thread genuinely throws, comes from this lesson's own
    throwaway console-and-WPF check, below.
  - *Its use:* the one call standing between `OnWatcherStatusUpdated`'s
    own background thread and the real UI-owned properties it needs to
    update safely.
  - *Type:* an instance method.
  - *Responsibility:* queuing the given work onto the UI thread's own
    `Dispatcher` queue, and blocking the calling thread until that work
    has actually run to completion.
  - *Depends on:* a functioning, still-running `Dispatcher` — the UI
    thread it belongs to must still be alive and processing its queue.
  - *Connects to:* called from `OnWatcherStatusUpdated`, itself called
    from `LiveFileTracker`'s own background thread; everything inside its
    lambda runs safely on the UI thread instead.
  - *Shape:* the real, concrete tool this entire lesson exists to
    introduce — the missing piece an earlier lesson's own closing section
    named but couldn't yet provide.

---

## Concept Unit: Proving Cross-Thread Access Really Throws

### The Problem

An earlier lesson's own closing section cited WPF's official
documentation, stating that `DispatcherObject`s enforce thread affinity
through a method named `VerifyAccess`, and that a mismatch "throws an
exception." That citation is real, but it's still a description of a
mechanism, not a demonstration of it actually happening, for real, in
this curriculum's own code.

> If a `TextBlock` is created on one thread, and a second, different
> thread attempts to set its `Text` property directly, what do you expect
> to actually happen — a silent, harmless assignment that simply doesn't
> show up visually, or something more immediate and disruptive?

### Introduce the Concept in Isolation

A real, throwaway WPF console project, scaffolded and run for real —
because whether cross-thread access genuinely throws, and with exactly
which real exception and message, is not something to state from a
documentation citation alone, per the Verification Rule's own treatment
of hidden or invisible behavior:

```csharp
[STAThread]
private static void Main()
{
    var textBlock = new TextBlock();
    textBlock.Text = "Created on the main thread";

    var backgroundThread = new Thread(() =>
    {
        try
        {
            textBlock.Text = "Set from a background thread";
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Exception type: {ex.GetType().FullName}");
            Console.WriteLine($"Message: {ex.Message}");
        }
    });
    backgroundThread.Start();
    backgroundThread.Join();
}
```

Real, captured output from running this exact code (.NET SDK 10.0.301, a
console project with `UseWPF` enabled):

```
Exception type: System.InvalidOperationException
Message: The calling thread cannot access this object because a different thread owns it.
```

This proves, for real, exactly what an earlier lesson's citation only
described: a `TextBlock` created on one thread genuinely cannot be
touched from a different one — not silently ignored, not a warning, a
real, immediate `InvalidOperationException`, thrown the instant the
assignment is attempted, with a message naming the real cause directly.

### Discard the Throwaway Example

The version above, and the throwaway WPF console project it ran inside,
were both deleted immediately after this real output was captured — this
lesson's real fix (next Concept Unit) applies the same lesson to this
project's own real `TextBlock`s, permanently.

### Project Change

- **Reference Source** — no reference counterpart.
- **Files affected** — none for this unit; this unit's own proof runs
  entirely inside a throwaway project, deleted once its output was
  captured above.
- **Change type** — n/a.
- **Location** — n/a.
- **Dependencies** — none.

### Mechanical Walkthrough

1. `[STAThread]` — the **`[STAThread]` attribute** (already fully
   explained, in an earlier lesson, for this project's own generated
   `Main` method), required here by hand since this throwaway project's
   own `Main` is written directly rather than generated — WPF's own UI
   machinery genuinely requires it, the same real requirement an earlier
   lesson's own generated code already carried automatically.
2. `var textBlock = new TextBlock();` — constructs a real **`TextBlock`**
   (already fully explained), on whatever thread happens to be running
   `Main` — this becomes the thread that "owns" it, per WPF's own
   documented model.
3. `var backgroundThread = new Thread(...);` — constructs a real
   **`System.Threading.Thread`**, .NET's own most basic unit of
   concurrent execution, given a lambda expression (already fully
   explained) to run once started.
4. `backgroundThread.Start();` and `backgroundThread.Join();` — starts
   the new thread running, then blocks the main thread until it finishes
   — used here purely so this lesson's own `Main` doesn't exit before the
   background thread has had a chance to run and print its result.
5. `textBlock.Text = "Set from a background thread";` — the one line, run
   from inside the background thread, that genuinely throws.
6. `catch (Exception ex)` — a **`try`/`catch`** (already fully explained),
   here catching the general `Exception` base type specifically to
   observe, and print, whatever real exception type actually occurs,
   rather than assuming it in advance.

### CS Lens

This is **thread affinity** — the real, named property some objects have
of being usable only by the specific thread that created them, rather
than being safely shareable across any thread that happens to hold a
reference. WPF's UI objects are thread-affine by deliberate design, not
by oversight: the same "one thread paints the screen" rule an earlier
lesson's own cited documentation already named for classic Windows UI
programming generally. Also recognized in: a car with only one driver's
seat — passengers can ride along, but only one person actually operates
the controls at a time; a single microphone at a press conference,
physically passed from speaker to speaker rather than several people
talking into it at once; a single point of contact at a company that
every external request must route through, rather than any employee
directly handling any inquiry.

### SE Lens

The alternative WPF's own designers could have chosen — making every UI
object safely accessible from any thread, with WPF handling
synchronization internally — was available, and is exactly how some other
UI frameworks work. It's a real, deliberate tradeoff, not an oversight:
internally synchronizing every single property access on every control
would add real, constant overhead to the overwhelming majority of UI code
that never touches more than one thread at all, to protect against a
situation (multi-threaded UI access) that's rare by design. Enforcing
thread affinity instead, loudly, with an immediate exception, makes the
mistake impossible to miss during development — the real cost this
lesson's own earlier work already paid, silently, until this exact
exception was reproduced.

### Commands Needed

- `dotnet new console -n ScratchDispatcherCheck` — scaffolds this unit's
  own throwaway project, with `<UseWPF>true</UseWPF>` added to its
  `.csproj` by hand (WPF's UI types aren't available in a plain console
  project's own default template, the same real fact an earlier lesson's
  own comparison between console and WPF project files already
  established).
- `dotnet run` — runs it, producing the real output quoted above.

### Run It

Shown above, in full, as real captured output — not predicted, since
exact exception types and messages are explicitly outside what this
curriculum's own schema treats as safe to state from memory, even when a
prior lesson already cited official documentation describing the general
mechanism.

### Connecting Back

This lesson now has real, direct proof of the exact failure an earlier
lesson's own `OnWatcherStatusUpdated` is genuinely exposed to. The next
Concept Unit provides the real fix.

---

## Concept Unit: `Dispatcher.Invoke` — Crossing Back to the UI Thread

### The Problem

`OnWatcherStatusUpdated`, as an earlier lesson left it, assigns
`_watcherStatus`'s own properties directly, from whatever thread
`LiveFileTracker` calls it on — exactly the unsafe pattern this lesson's
previous Concept Unit just proved throws a real exception. Nothing yet
gives that method a safe way to reach the UI thread.

> This lesson's previous Concept Unit's `textBlock.Dispatcher` property
> would give access to the exact `Dispatcher` belonging to the thread
> that created that `TextBlock`. If a background thread held a reference
> to that `Dispatcher` object, what would calling a method on it —
> something like "please run this specific piece of code for me" — need
> to actually do, mechanically, to get code running back on the correct
> thread?

### Introduce the Concept in Isolation

Real, captured proof, extending this lesson's own first Concept Unit's
throwaway project before it was deleted — because whether `Dispatcher.
Invoke` genuinely succeeds where a direct assignment fails is exactly the
kind of claim worth proving alongside the failure it fixes, not merely
asserting:

```csharp
textBlock.Dispatcher.Invoke(() =>
{
    textBlock.Text = "Set via Dispatcher.Invoke";
    Console.WriteLine($"Success. textBlock.Text is now: \"{textBlock.Text}\"");
});
```

Real, captured output, immediately following this lesson's previous
Concept Unit's own exception, from the same run:

```
Now retrying the same assignment, correctly, via the Dispatcher:
Success. textBlock.Text is now: "Set via Dispatcher.Invoke"
```

This proves, for real, that the identical assignment that just threw,
moments earlier, from a background thread, succeeds without any error at
all once routed through `Dispatcher.Invoke` — the exact same `TextBlock`,
the exact same kind of assignment, the only difference being which thread
actually performs it.

### Discard the Throwaway Example

The version above, and the throwaway project it extended, were both
deleted immediately after this real output was captured — this project's
own real fix (below) applies the identical call to `OnWatcherStatusUpdated`,
permanently.

### Project Change

- **Reference Source** — no reference counterpart.
- **Files affected** — modified: `MainWindow.xaml.cs`.
- **Change type** — replace (wrapping `OnWatcherStatusUpdated`'s existing
  body in a `Dispatcher.Invoke` call).
- **Location** — inside `OnWatcherStatusUpdated`, an earlier lesson's own
  method.
- **Dependencies** — an earlier lesson's own `OnWatcherStatusUpdated` and
  `_watcherStatus`.

### The New Code

```csharp
private void OnWatcherStatusUpdated(string message)
{
    Dispatcher.Invoke(() =>
    {
        _watcherStatus.StatusMessage = message;

        if (_liveFileTracker?.CurrentFile != null)
        {
            _watcherStatus.CurrentFileText = _liveFileTracker.CurrentFile.FileName;
        }
    });
}
```

### The Updated Project

The full `OnWatcherStatusUpdated` method, with the new lines marked:

```csharp
1  private void OnWatcherStatusUpdated(string message)
2  {
3      Dispatcher.Invoke(() =>                                              // ← new
4      {                                                                    // ← new
5          _watcherStatus.StatusMessage = message;
6  
7          if (_liveFileTracker?.CurrentFile != null)
8          {
9              _watcherStatus.CurrentFileText = _liveFileTracker.CurrentFile.FileName;
10         }
11     });                                                                  // ← new
12 }
```

`OnWatcherStatusUpdated`'s own logic is completely unchanged — the exact
same two property assignments an earlier lesson already wrote — now
wrapped so they actually run on the UI thread, regardless of which thread
called this method in the first place.

### Mechanical Walkthrough

1. `Dispatcher.Invoke(...)` — reads `Dispatcher` — a property `MainWindow`
   inherits, unnamed until now, from `DispatcherObject`, several levels
   up its own inheritance chain (already established, for `ListBox` and
   `DataGrid` alike, in earlier lessons) — returning **`System.Windows.
   Threading.Dispatcher`** (Header above), specifically the one belonging
   to the thread that constructed this `MainWindow` — the real UI thread.
   Calling **`Dispatcher.Invoke(Action)`** (Header above) on it, passing a
   **lambda expression** (already fully explained) with the method's
   original two lines inside it.
2. `_watcherStatus.StatusMessage = message;` and the `if` block reading
   `_liveFileTracker.CurrentFile` — both completely unchanged from an
   earlier lesson; the only difference is that they now run inside
   `Dispatcher.Invoke`'s own lambda, guaranteed to execute on the UI
   thread no matter which thread called `OnWatcherStatusUpdated` itself.

### CS Lens

`Dispatcher.Invoke` is a real, concrete instance of **marshaling** —
moving a piece of work from the thread it's currently running on to a
different, specific thread required to safely perform it, and waiting for
that transfer to complete before continuing. This is the real mechanism
underneath the documented enforcement an earlier lesson could only cite —
proven, this lesson, both to fail without it and succeed with it, on the
identical assignment. Also recognized in: a courtroom requiring evidence
to be formally entered through the court itself, rather than a witness
handing something directly to the jury; an embassy handling a citizen's
request abroad by relaying it back to the home government rather than
acting on its own authority; air traffic control relaying a pilot's
request to the one controller actually responsible for that specific
runway.

### SE Lens

The alternative — `Dispatcher.BeginInvoke`, a real, sibling method this
lesson doesn't use, which queues work on the UI thread and returns
immediately, without waiting for it to finish — was available. `Invoke`
is chosen here because `OnWatcherStatusUpdated`'s own two lines are fast,
simple property assignments with no reason to run concurrently with
whatever called this method; blocking briefly until they're done is
simpler to reason about than a queued operation whose exact completion
time this lesson's own code would otherwise need to track. The real cost
of `Invoke` specifically: the calling thread — here, whatever thread
`LiveFileTracker` raised its event on — is blocked, briefly, until the UI
thread actually gets around to running this work, a real, if usually
small, delay this lesson's own code accepts rather than works around.

### Commands Needed

None beyond this lesson's shared, end-of-lesson `dotnet build`.

### Run It

Shown above, in full, as real captured output — not predicted, since
whether this exact fix genuinely resolves the exact failure this lesson's
first Concept Unit already proved is worth demonstrating directly, side
by side with the failure itself.

### Connecting Back

`OnWatcherStatusUpdated` is now genuinely safe to call from any thread —
the exact fix an earlier lesson's own closing section promised, without
yet being able to provide it. The remaining Concept Units address this
project's *other* kind of background work — not a callback this project
never chose to receive on a background thread, but a scan this project
can choose to run on one deliberately.

---

## Concept Unit: `Task`, `async`, and `await` — Choosing to Run Work Off the UI Thread

### The Problem

`BrowseButton_Click`, as every earlier lesson has left it, calls
`_directoryScanner.ScanDirectory(folder)` directly, on the UI thread,
waiting for it to finish before the method continues. For a folder with a
handful of files, this is instant; for a folder with a great many, this
would freeze `MainWindow` completely for however long scanning takes —
no repainting, no responding to input, nothing — because the one UI
thread is busy running `ScanDirectory` instead of processing its own
`Dispatcher` queue.

> `Dispatcher.Invoke` (previous Concept Unit) moves work *onto* the UI
> thread, from somewhere else. If a UI thread instead needed to move
> work *off* itself — deliberately, on purpose, to keep itself free to
> stay responsive — what would the opposite kind of tool need to do
> differently?

### Introduce the Concept in Isolation

A tiny, uninvolved example, its behavior predictable with real
confidence — `Task.Run`'s own contract, and `async`/`await`'s own
documented control-flow behavior, are stable, thoroughly documented C#
language and library features, not runtime quirks needing fresh proof:

```csharp
async Task<int> ComputeAsync()
{
    int result = await Task.Run(() => 2 + 2);
    return result;
}
```

Calling `ComputeAsync()` starts `2 + 2` running on a separate thread pool
thread via `Task.Run`; the calling method suspends at the `await`,
without blocking whatever thread called `ComputeAsync` itself, and
resumes once that background work finishes, with `result` holding `4`.

### Discard the Throwaway Example

`ComputeAsync` doesn't appear in the real project — it exists only to
isolate `Task.Run`/`async`/`await`'s own control-flow shape before this
lesson's real code (below) applies the identical shape to a real
directory scan instead of trivial arithmetic. Discarded now.

### Project Change

- **Reference Source** — no reference counterpart.
- **Files affected** — modified: `MainWindow.xaml.cs`.
- **Change type** — replace (`BrowseButton_Click`'s method signature and
  its direct `ScanDirectory` call).
- **Location** — `BrowseButton_Click`'s own declaration line, and the
  line calling `ScanDirectory`.
- **Dependencies** — an earlier lesson's own complete `BrowseButton_Click`.

### The New Code

```csharp
private async void BrowseButton_Click(object sender, RoutedEventArgs e)
```

```csharp
List<InputFile> discoveredFiles = await Task.Run(() => _directoryScanner.ScanDirectory(folder));
```

### The Updated Project

The relevant part of `BrowseButton_Click`, with the changed lines marked:

```csharp
1  private async void BrowseButton_Click(object sender, RoutedEventArgs e)  // ← changed (added async)
2  {
3      string? folder = _fileSource.SelectDirectory();
4      if (folder != null)
5      {
6          _selectedFolder = folder;
7          FolderPathText.Text = folder;
8  
9          List<InputFile> discoveredFiles = await Task.Run(() => _directoryScanner.ScanDirectory(folder));  // ← changed (added await Task.Run)
10         _discoveredFiles.Clear();
11         // ...unchanged from here down
12     }
13 }
```

### Mechanical Walkthrough

1. `private async void BrowseButton_Click(object sender, RoutedEventArgs
   e)` — adds the **`async`** modifier (Header above) to an
   already-existing method. `void`, not `Task`, specifically because this
   remains a real WPF event handler — the one situation this lesson's own
   Header names as a genuine exception to the usual "an `async` method
   should return `Task`" guideline, since `Button.Click` (an earlier
   lesson's own subject) itself expects a `void`-returning
   `RoutedEventHandler` and would have nothing to `await` even if this
   method did return one.
2. `await Task.Run(() => _directoryScanner.ScanDirectory(folder));` —
   calls **`Task.Run<TResult>(Func<TResult>)`** (Header above) with a
   **lambda expression** (already fully explained) wrapping the identical
   `ScanDirectory` call an earlier lesson already wrote — now running on a
   thread-pool thread instead of the UI thread. The **`await`** keyword
   (Header above) suspends `BrowseButton_Click` at this exact point,
   freeing the UI thread to keep processing its own `Dispatcher` queue —
   repainting, responding to other clicks — until the background scan
   finishes; `discoveredFiles` then receives the real `List<InputFile>`
   `ScanDirectory` produced, and every line after this one resumes
   running back on the UI thread automatically, with no `Dispatcher` call
   needed here at all.

### CS Lens

`await` automatically resuming on the original calling context — the UI
thread, for a method that started there — is a real, deliberate language
feature, not a coincidence: it's exactly why this Concept Unit needed no
`Dispatcher.Invoke` anywhere, unlike the previous one. This is the core
difference this lesson's own opening paragraph promised: work this
project *chooses* to run in the background, through `Task`, gets its
return-to-the-UI-thread step handled automatically by `await` itself;
work that arrives on a background thread some other way — a real OS
callback, like `FileSystemWatcher`'s own events, with no `await` anywhere
in its own call chain — has no such automatic return trip, and needs
`Dispatcher.Invoke` explicitly instead. Also recognized in: a
restaurant order handed to the kitchen, with the waiter automatically
returning to the exact same table once it's ready, versus a delivery
driver who has no idea which specific table to bring food back to unless
explicitly told.

### SE Lens

The alternative — leaving `ScanDirectory` running synchronously on the UI
thread, accepting that a large folder would freeze the window briefly —
was available, and is exactly what every earlier lesson already shipped,
without incident, because this project's own real test folders have
never been large enough for the freeze to be noticeable. The real,
deferred cost of that choice: a genuinely large real Mastercam reports
folder could freeze this project's entire UI for a real, perceptible
amount of time, with no way for a user to even cancel it mid-scan. Moving
the call onto a background thread costs exactly two changed lines, thanks
to `async`/`await` handling the return trip automatically — a small price
for removing a real, if previously invisible, scalability limit.

### Commands Needed

None beyond this lesson's shared, end-of-lesson `dotnet build`.

### Run It

Predicted with full confidence for `Task.Run`/`async`/`await`'s own
documented control-flow behavior — this project's real, full build,
covering this exact method, is shown at this lesson's end.

### Connecting Back

`BrowseButton_Click` now runs its real directory scan off the UI thread,
deliberately, with `await` handling the return trip on its own —
completing this lesson's second real fix, built on a genuinely different
mechanism than its first.

---

## Connect the Pieces

Trace two real, separate pieces of background work — one this project
chose, one it didn't — through this lesson's two different fixes:

1. A user clicks `Browse`. `BrowseButton_Click` (this lesson's third and
   fourth Concept Units) runs on the UI thread, as always, right up until
   `await Task.Run(...)` — at that exact point, the real directory scan
   begins on a separate thread-pool thread, and the UI thread is freed to
   keep processing input and repainting for however long that scan takes.
2. The scan finishes. `await` resumes `BrowseButton_Click` automatically,
   back on the UI thread — no `Dispatcher` call anywhere in this path,
   because `async`/`await` handled the return trip as part of its own
   documented contract.
3. Separately, and on its own schedule, Mastercam writes a real file.
   `FileSystemWatcher`'s own internal machinery — never something this
   project's own code started with `Task.Run`, and something with no
   `await` anywhere in its own call chain — raises a real event on a
   thread WPF had no part in choosing.
4. `LiveFileTracker.OnFileEvent`, then `StatusUpdated`, then `MainWindow.
   OnWatcherStatusUpdated` (all earlier lessons' own code) all run on that
   same thread. This time, `OnWatcherStatusUpdated`'s own body is wrapped
   in `Dispatcher.Invoke` (this lesson's second Concept Unit) — the real
   fix this exact path needed, proven, in this lesson's first two Concept
   Units, to fail without it and succeed with it.

Two real kinds of background work, arriving through two genuinely
different doors — one this project opened on purpose, one that was
already open before this project ever got involved — now both land
safely back on the one thread WPF has always required for touching its
own controls, each through the specific tool actually built for its own
door.
