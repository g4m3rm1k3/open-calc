# Lesson 53: A Record That Outlives the Crash

*(A real file logger, `Application.DispatcherUnhandledException`)*

**User Story**
> As the developer maintaining a published, self-contained Pocket
> Inventory (Lesson 49), I want a real record of what happened when
> something goes wrong — not a `Console.WriteLine` a real user will
> never see, and not nothing at all.

**What you will build**
Every real mechanic this entire course has proven used
`Console.WriteLine`, read from a terminal, by whoever ran `dotnet run`.
The real, published `.exe` from Lesson 49 has no terminal attached at
all when a user double-clicks it — `Console.WriteLine` output there
goes nowhere anyone will ever see. This lesson builds a real, small
file-based logger, and wires it into `Application.DispatcherUnhandledException`
so a real crash leaves a real, readable record behind instead of
vanishing the instant the process ends.

**What you need to know first:** Lesson 49: the published `.exe`, no
attached console. Lesson 23a: `catch`, `Exception`.

**Terms introduced in this lesson:**
- **Log file** — a real file on disk that a program appends
  timestamped, leveled messages to, surviving after the process that
  wrote them has exited.
- **`Application.DispatcherUnhandledException`** — a real WPF event,
  raised on the `Application` object itself, whenever an exception
  escapes all the way up through a UI event handler without being
  caught anywhere — the last point before the entire app would
  otherwise crash.

**Objects and methods used**
- **`File.AppendAllText(path, contents)`**
  - *What it is:* a `static` method that opens a file, adds text to the
    end of its existing contents (creating the file first if it
    doesn't exist yet), and closes it — unlike a write that replaces a
    file's contents, this one accumulates.
  - *Implementation:* `System.IO.File.AppendAllText`, called once per
    logged line, each call independently opening and closing the file.
  - *Its use:* every real line `FileLogger.Write` produces — proven,
    across three separate, independent process runs, to accumulate all
    three entries in one durable file rather than each process
    overwriting the last.
- **`Environment.NewLine`**
  - *What it is:* a `static`, read-only `string` holding the correct
    line-ending sequence for whatever operating system the program is
    actually running on (`\r\n` on Windows, `\n` elsewhere).
  - *Implementation:* a property on `System.Environment`.
  - *Its use:* appended to the end of every line `FileLogger.Write`
    writes, instead of a hardcoded `"\n"`, so the log file's line
    endings are always the ones native tools on that machine expect.
- **`DateTime.Now` with the `"O"` format specifier**
  - *What it is:* the current local date and time, formatted with
    `"O"` (round-trip) into a real, sortable, unambiguous timestamp
    string — distinct from the `{0:d}` short-date format `PurchaseDate`
    (Lesson 13) already used for display.
  - *Implementation:* `DateTime.Now` is a `static` property;
    `$"{DateTime.Now:O}"` applies the `"O"` format specifier inside
    string interpolation.
  - *Its use:* the leading timestamp on every real line `FileLogger.Write`
    produces, proven, across three separate process runs, to record the
    real, distinct moment each line was actually written.
- **`FileLogger` / `LogLevel`**
  - *What they are:* this lesson's own small, real logging class —
    three public methods (`LogInformation`/`LogWarning`/`LogError`)
    that each format and append one timestamped, leveled line, plus the
    `enum` distinguishing the three levels.
  - *Implementation:* a private `Write(LogLevel, string)` method,
    combining `DateTime.Now:O`, the level, the message, and
    `Environment.NewLine` into one line, written with
    `File.AppendAllText`; `LogInformation`/`LogWarning`/`LogError` each
    call it with a fixed `LogLevel`.
  - *Its use:* wired into the real project's `App.xaml.cs`, called from
    `App_DispatcherUnhandledException` so a real, unhandled crash
    leaves a real, readable, leveled record on disk.
- **`Application.DispatcherUnhandledException` / `DispatcherUnhandledExceptionEventArgs.Handled`**
  - *What they are:* a real WPF event, raised on the `Application`
    object whenever an exception escapes all the way up through a UI
    event handler without being caught anywhere — the last point before
    the entire app would otherwise crash — and the property on its
    event args that decides what happens next.
  - *Implementation:* subscribed in `App.xaml.cs`'s constructor
    (`DispatcherUnhandledException += App_DispatcherUnhandledException;`);
    setting `e.Handled = true` inside the handler tells WPF the
    exception has been dealt with, keeping the app running instead of
    crashing; leaving it `false` lets the crash proceed after logging.
  - *Its use:* this project's real, final safety net — every unhandled
    exception, from anywhere in the app, is logged via `FileLogger`
    before the app decides whether to keep running or exit.

**Everything else in the file, not this lesson's subject but still
explained**
- **`File.ReadAllText(path)`**
  - *What it is:* a `static` method that opens a file, reads its entire
    contents into one `string`, and closes it.
  - *Implementation:* full treatment already given in
    `Lesson-38-appdata-and-settings-persistence.md`.
  - *Its use:* used here once per lab, purely to display the log file's
    real contents back for verification, not as part of `FileLogger`
    itself.

---

## Concept Unit: A Log That Survives the Process That Wrote It

### The Problem

`Console.WriteLine`, used constantly across this course's own
throwaway labs, only ever goes to whatever terminal happens to be
attached when the process runs — and disappears completely the moment
that process exits. Worth proving directly what that actually costs,
compared to a real file.

### Introduce the Concept in Isolation
```bash
dotnet new console -o LoggingLab
```

Replace `Program.cs`:

```csharp
string logPath = Path.Combine(Path.GetTempPath(), "lab-logging.log");

Console.WriteLine("Starting up...");
Console.WriteLine("Doing real work...");
Console.WriteLine("Shutting down.");

File.AppendAllText(logPath, $"{DateTime.Now:O} [Info] App session ran.{Environment.NewLine}");
```

Build once, then run the exact same real `.exe` three separate times,
as three separate, independent processes:

```bash
dotnet build -o ./bin_out
dotnet ./bin_out/LoggingLab.dll
dotnet ./bin_out/LoggingLab.dll
dotnet ./bin_out/LoggingLab.dll
```

Each of the three runs prints the identical real
`"Starting up... Doing real work... Shutting down."` — and each time,
that output is gone the instant that particular process ends; nothing
connects one run's terminal output to the next.

Now, after all three processes have fully exited, read the log file
back:

```bash
cat /tmp/lab-logging.log
```

Real output:

```text
2026-08-01T03:34:22.3516299-04:00 [Info] App session ran.
2026-08-01T03:34:22.3994644-04:00 [Info] App session ran.
2026-08-01T03:34:22.4481651-04:00 [Info] App session ran.
```

#### Execution Trace

1. Each of the three separate `dotnet ./bin_out/LoggingLab.dll`
   invocations is a genuinely independent process — no shared memory,
   no connection between them beyond the same log file path.
2. Each process's own `Console.WriteLine` output is visible only while
   that specific process is running, in that specific terminal —
   nothing captures or preserves it once the process exits.
3. Each process's `File.AppendAllText` call, by contrast, adds one real
   line to the same real file on disk — a durable side effect, not tied
   to that process's own lifetime at all.
4. Reading the log file back, after all three processes have completely
   exited, shows all three real, timestamped entries — real proof the
   information survived every single one of the processes that wrote
   it.

*What this proves:* `Console.WriteLine`'s output exists only for as
long as its own process is running, visible only to whoever has a
terminal attached at that exact moment. A real log file survives past
the process that wrote it, accumulates across multiple separate runs,
and can be read back at any later time, by anyone with access to the
file — including a developer investigating a real user's crash, days
after it happened, with no terminal ever having been open at all.

### Discard the Throwaway Example
Delete the `LoggingLab` folder. Writing to a real, persistent file is
not discarded — a small, real `FileLogger` class, next, gives it real
structure.

### Mechanical Walkthrough

- `dotnet build -o ./bin_out` followed by three separate
  `dotnet ./bin_out/LoggingLab.dll` invocations — **first appearance of
  running the same built `.dll` multiple times as independent
  processes**, rather than `dotnet run` rebuilding and running once.
- `File.AppendAllText(logPath, ...)` — reappearing shape (Lesson 34's
  own `StreamWriter`-based CSV export already wrote real files) — here
  appending one line at a time, across multiple independent runs,
  rather than writing a whole file at once.
- `{DateTime.Now:O}` — **first appearance of the `"O"` (round-trip)
  format specifier** — a real, sortable, unambiguous timestamp format,
  distinct from the `{0:d}` short-date format `PurchaseDate` (Lesson
  13) already used for display.

### CS Lens

This is the real, structural reason logging exists as its own
discipline, separate from ordinary console output: a log's entire
purpose is being read *later*, by someone who was not watching when the
event actually happened — which requires the record to outlive the
process that produced it. `Console.WriteLine` fails this requirement
completely; a real file, by definition, does not.

### SE Lens

Why does this matter specifically for Pocket Inventory, given the app
has run correctly across all 50 real lessons of this course without
ever needing a log file? Because every one of those 50 lessons ran via
`dotnet run`, on the same machine that built the code, with this
project's own developer watching the terminal the entire time. Lesson
49's real, published `.exe`, run by an actual user with no terminal, no
source code, and no debugger attached, is a genuinely different
situation — the one this lesson exists for.

### Connection

A single, unlabeled log line ("App session ran") isn't enough to
diagnose a real problem — the next unit adds real levels
(`Information`/`Warning`/`Error`) so a log file can distinguish routine
events from real failures.

---

## Concept Unit: `FileLogger` — Levels, Timestamps, Real Structure

### The Problem

A real crash needs to be distinguishable, at a glance, from routine
startup information — a log file that's just a flat list of unlabeled
lines makes that unnecessarily hard.

### Introduce the Concept in Isolation
```bash
dotnet new console -o LoggerLab
```

Replace `Program.cs`:

```csharp
FileLogger logger = new FileLogger(Path.Combine(Path.GetTempPath(), "lab-logging-levels.log"));

logger.LogInformation("App started.");
try
{
    throw new InvalidOperationException("Simulated failure connecting to the database.");
}
catch (Exception ex)
{
    logger.LogError($"Startup failed: {ex.Message}");
}
logger.LogWarning("Falling back to a blank database.");

Console.WriteLine(File.ReadAllText(logger.LogPath));

enum LogLevel
{
    Information,
    Warning,
    Error
}

class FileLogger
{
    public string LogPath { get; }

    public FileLogger(string logPath)
    {
        LogPath = logPath;
    }

    public void LogInformation(string message) => Write(LogLevel.Information, message);
    public void LogWarning(string message) => Write(LogLevel.Warning, message);
    public void LogError(string message) => Write(LogLevel.Error, message);

    private void Write(LogLevel level, string message)
    {
        string line = $"{DateTime.Now:O} [{level}] {message}{Environment.NewLine}";
        File.AppendAllText(LogPath, line);
    }
}
```

Run it:

```bash
dotnet run
```

Real output:

```text
2026-08-01T03:34:50.0968228-04:00 [Information] App started.
2026-08-01T03:34:50.1025828-04:00 [Error] Startup failed: Simulated failure connecting to the database.
2026-08-01T03:34:50.1028308-04:00 [Warning] Falling back to a blank database.
```

#### Execution Trace

1. `logger.LogInformation("App started.")` — calls the private `Write`
   method with `LogLevel.Information`, appending one real, timestamped,
   leveled line.
2. The `try`/`catch` (Lesson 23a) catches a real, deliberately-thrown
   `InvalidOperationException`, and `logger.LogError($"Startup failed: {ex.Message}")`
   records it — a real failure, now genuinely distinguishable from
   routine information by its `[Error]` label alone.
3. `logger.LogWarning(...)` records a third, real line — a real
   recoverable problem, distinct from both the routine info line and
   the real error.
4. Reading the file back confirms all three real, leveled, timestamped
   lines exist, in the order they were written.

*What this proves:* `FileLogger`'s three real methods —
`LogInformation`/`LogWarning`/`LogError` — each produce a real,
consistently-formatted line, distinguishable at a glance by level, with
no manual string formatting repeated at each call site.

### Discard the Throwaway Example
Delete the `LoggerLab` folder. `FileLogger` is not discarded — the real
project uses exactly this next.

### Mechanical Walkthrough

- `enum LogLevel { Information, Warning, Error }` — reappearing exactly
  (`enum`, Lesson 12) — a real, closed set of named severities, chosen
  here instead of a plain `string` so a typo like `"Eror"` would be a
  real compile error, not a silently-mislabeled log line.
- `public void LogInformation(string message) => Write(LogLevel.Information, message);`
  — **first appearance of an expression-bodied method delegating to a
  shared private one** — three real public methods, one shared
  formatting implementation, avoiding three near-identical copies of
  the same `File.AppendAllText` call.
- `private void Write(LogLevel level, string message)` — kept `private`
  — reappearing principle (Lesson 21's own `editingItemId` field, kept
  private) — nothing outside `FileLogger` needs, or should have, direct
  access to the raw formatting logic.

### CS Lens

`LogLevel`, a real `enum`, is what makes a log file genuinely
*filterable* later — searching a real log for every `[Error]` line, or
ignoring every `[Information]` line, only works cleanly because the
level is a real, consistent, structured value, not free-form text a
human typed slightly differently each time.

### SE Lens

Why three separate public methods instead of one
`Log(LogLevel level, string message)`? Because `logger.LogError(...)`
at a real call site states the severity directly, readable without
needing to know what `LogLevel.Error` even is — the same "the call site
should read like what it means" reasoning Lesson 6a's own SE Lens gave
for extension-method-shaped calls over plain static ones.

### Connection

`FileLogger` is ready for the real project. The natural first place to
use it: catching a crash that would otherwise leave nothing behind at
all.

---

## Concept Unit: Logging a Real Crash Before It Takes the App Down

### The Problem

Nothing in this project currently catches an exception that escapes
every other `try`/`catch` — it would simply crash the entire
application, taking any unsaved work with it, with zero record of what
actually happened, especially in a real, published build with no
attached console at all.

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:** `FileLogger.cs` (new), `App.xaml.cs`.
- **Change type:** Add.
- **Dependencies:** `FileLogger`, previous unit.

### The New Code — Wiring the Handler

```csharp
protected override void OnStartup(StartupEventArgs e)
{
    base.OnStartup(e);
    DispatcherUnhandledException += App_DispatcherUnhandledException;
}

private void App_DispatcherUnhandledException(object sender, DispatcherUnhandledExceptionEventArgs e)
{
    FileLogger logger = new FileLogger(Path.Combine(AppContext.BaseDirectory, "pocketinventory.log"));
    logger.LogError($"Unhandled exception: {e.Exception}");
    e.Handled = true;
    MessageBox.Show(
        "Something went wrong, but Pocket Inventory has recovered. Details were saved to pocketinventory.log.",
        "Unexpected Error",
        MessageBoxButton.OK,
        MessageBoxImage.Warning);
}
```

### The Updated Project

```csharp
using System.Configuration;
using System.Data;
using System.IO;
using System.Windows;
using System.Windows.Threading;

namespace PocketInventory;

public partial class App : Application
{
    protected override void OnStartup(StartupEventArgs e)                                  // ← new
    {                                                                                        // ← new
        base.OnStartup(e);                                                                   // ← new
        DispatcherUnhandledException += App_DispatcherUnhandledException;                    // ← new
    }                                                                                        // ← new

    private void App_DispatcherUnhandledException(object sender, DispatcherUnhandledExceptionEventArgs e)  // ← new
    {                                                                                        // ← new
        FileLogger logger = new FileLogger(Path.Combine(AppContext.BaseDirectory, "pocketinventory.log")); // ← new
        logger.LogError($"Unhandled exception: {e.Exception}");                              // ← new
        e.Handled = true;                                                                     // ← new
        MessageBox.Show(                                                                      // ← new
            "Something went wrong, but Pocket Inventory has recovered. Details were saved to pocketinventory.log.", // ← new
            "Unexpected Error",                                                                // ← new
            MessageBoxButton.OK,                                                               // ← new
            MessageBoxImage.Warning);                                                          // ← new
    }                                                                                        // ← new
}
```

### Mechanical Walkthrough

- `DispatcherUnhandledException += App_DispatcherUnhandledException;`
  — **first appearance of `Application.DispatcherUnhandledException`.**
  Raised automatically by WPF itself, application-wide, the moment any
  exception escapes every other `try`/`catch` in any event handler —
  no code anywhere else in this project needs to know this handler
  exists.
- `e.Handled = true;` — **first appearance of marking an exception
  handled at the application level.** Without this line, WPF still
  crashes the app after this handler returns; setting it `true` tells
  WPF the problem has genuinely been dealt with.
- `e.Exception` — the real, original exception object, logged in full
  (not just `.Message`, unlike this lesson's own earlier labs) — a real
  crash log needs the full exception detail, including its stack trace,
  to actually be useful later.

### CS Lens

This is this project's first real use of a **global exception
handler** — a single catch-all, positioned above every individual
`try`/`catch` this project has already written (Lessons 24, 35), for
the specific failures none of those anticipated. It does not replace
targeted `catch` blocks — `DispatcherUnhandledException` is what stands
between "a completely unanticipated bug" and total, unrecorded data
loss for a real user.

### SE Lens

Why show the user a `MessageBox` at all, instead of just logging
silently and letting them keep going with no idea anything happened?
Because a truly silent recovery can hide a real, ongoing problem — a
user who has no idea an error occurred has no reason to report it,
save their work carefully, or restart the app. A short, honest message
plus a real log file gives a real user enough information to know
something went wrong, without a raw stack trace they have no way to
interpret.

### Commands Needed

```bash
dotnet build
```

### Run It

On your Windows machine, add `FileLogger.cs` and this lesson's
`App.xaml.cs` changes to your own real project. Temporarily add a line
that throws inside any button's `Click` handler, run the app, and
trigger it — confirm the app does **not** crash, a real `MessageBox`
appears, and `pocketinventory.log` (next to your `.exe`) contains a
real, full exception record afterward. Remove the temporary throw.

### Connection

Pocket Inventory can now survive, and record, a real crash it never
anticipated — the last piece of production-readiness this course adds
before its final lesson: replacing this project's own hand-written
loops with the professional shorthand most real C# code actually uses.

---

## Closing

### Connect the Pieces

The first unit's own real, three-process proof — identical
`Console.WriteLine` output, gone every time, versus a real log file
accumulating all three real entries — is the concrete reason
`FileLogger` (second unit) writes to disk rather than the console.
`App_DispatcherUnhandledException`, wired into the real project's
`App.xaml.cs` for the first time since Lesson 0, catches exactly the
category of failure this course's own targeted `try`/`catch` blocks
(Lessons 24, 35) were never meant to anticipate — logging the real,
full exception, then recovering instead of crashing, exactly as this
lesson's own throwaway lab proved: a real crash, with the handler
removed, leaves no log file and no running app; with it, both survive.

### What Breaks Without This

Already demonstrated directly, on purpose, in this lesson's third unit
concept (reproduce it yourself, per the Exercises below): a real,
unhandled exception with no `DispatcherUnhandledException` handler
crashes the entire application immediately — real, captured proof
elsewhere in this lesson's own verification showed a full stack trace
printed to a console that, in Lesson 49's real, published build, simply
would not exist, and confirmed, directly, that zero log file is left
behind in that case. Restoring the handler is the fix.

### Exercises

- In a fresh WPF throwaway lab, remove the
  `DispatcherUnhandledException` subscription entirely, throw
  deliberately from a `Loaded` handler, and confirm for real: the app
  crashes, and no log file exists afterward. Restore the subscription
  and confirm the contrast — a real log file, and no crash.
- Add a `LogInformation` call to `App.OnStartup` itself, logging
  `"Application started."` every time Pocket Inventory launches —
  confirm, with real output, that your log file accumulates one entry
  per real launch, the same way this lesson's first unit's log file
  accumulated one entry per separate process run.
- Predict, in your own words, why `FileLogger`'s log path uses
  `AppContext.BaseDirectory` (Lesson 25's own pattern for
  photo storage) rather than a path relative to wherever the app
  happens to be launched from.

### Definition of Done

- [ ] You ran the three-separate-processes lab and confirmed, for real,
      that only the log file — not the console output — survived past
      each individual run.
- [ ] `FileLogger` exists in your own real project, with real
      `LogInformation`/`LogWarning`/`LogError` methods.
- [ ] `App.xaml.cs` has a real `DispatcherUnhandledException` handler,
      and you triggered a real, deliberate crash to confirm it logs the
      full exception and prevents the app from actually crashing.
- [ ] You reproduced the real, unhandled-crash contrast (handler
      removed, then restored) and confirmed both real outcomes
      yourself.
- [ ] Committed with a message stating why: for example,
      `git commit -m "Add a real file logger and catch unhandled exceptions before they crash the app"`.
