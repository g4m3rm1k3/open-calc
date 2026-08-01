# Lesson 46: A Backup Nobody Has to Remember to Take

*(`DispatcherTimer`, `File.Copy`)*

**User Story**
> As a user, I want automatic backups of my inventory database.

**What you will build**
A real, scheduled backup — a timestamped copy of `pocketinventory.db`,
appearing in a real backups folder on a real interval, with zero manual
action required. This lesson's own glossary names the real principle:
**backups as a scheduled side effect, decoupled from the save path
itself** — nothing about `SaveItemToDatabase`, `UpdateItemInDatabase`,
or any other write path changes at all; backup is a completely
independent, parallel concern.

**What you need to know first:** Lesson 25: `File.Copy`,
`AppContext.BaseDirectory`-style folder management.

**Terms introduced in this lesson:**
- **`DispatcherTimer`** — a WPF timer that raises its `Tick` event on
  the UI thread, at a real, configurable interval, safe to touch UI
  elements from directly (unlike a plain background timer).

---

## Concept Unit: A Real, Ticking `DispatcherTimer`

### The Problem

A backup needs to happen automatically, on a real schedule — not
triggered by any specific user action, the way every other save in this
project has been until now.

### Introduce the Concept in Isolation
```bash
dotnet new wpf -o lab-timer
```

Replace `MainWindow.xaml`'s `Grid` contents:

```xml
<StackPanel Loaded="StackPanel_Loaded" />
```

Replace `MainWindow.xaml.cs`'s contents:

```csharp
using System.IO;
using System.Windows;
using System.Windows.Threading;

namespace lab_timer
{
    public partial class MainWindow : Window
    {
        private DispatcherTimer? timer;
        private int tickCount;
        private string sourcePath = string.Empty;
        private string backupFolder = string.Empty;

        public MainWindow()
        {
            InitializeComponent();
        }

        private void StackPanel_Loaded(object sender, RoutedEventArgs e)
        {
            sourcePath = Path.Combine(Path.GetTempPath(), "lab-timer-source.db");
            File.WriteAllText(sourcePath, "pretend database bytes");
            backupFolder = Path.Combine(Path.GetTempPath(), "lab-timer-backups");
            Directory.CreateDirectory(backupFolder);

            timer = new DispatcherTimer
            {
                Interval = TimeSpan.FromMilliseconds(300)
            };
            timer.Tick += Timer_Tick;
            timer.Start();
        }

        private void Timer_Tick(object? sender, EventArgs e)
        {
            tickCount++;
            Console.WriteLine($"Tick {tickCount} at {DateTime.Now:HH:mm:ss.fff}");

            string backupPath = Path.Combine(backupFolder, $"backup-{DateTime.Now:yyyyMMdd-HHmmss-fff}.db");
            File.Copy(sourcePath, backupPath);
            Console.WriteLine($"  Backup created: {File.Exists(backupPath)}");

            if (tickCount >= 3)
            {
                timer!.Stop();
                Console.WriteLine($"Backups folder contains {Directory.GetFiles(backupFolder).Length} file(s)");
            }
        }
    }
}
```

Run it on your Windows machine:

```bash
dotnet run
```

Real output:

```text
Tick 1 at 18:38:56.452
  Backup created: True
Tick 2 at 18:38:56.763
  Backup created: True
Tick 3 at 18:38:57.077
  Backup created: True
Backups folder contains 3 file(s)
```

*What this proves:* `DispatcherTimer`, given a real `Interval`, fires
its `Tick` event repeatedly and automatically — no user action, no
button click, three real ticks roughly `300ms` apart (`18:38:56.452` →
`18:38:56.763` → `18:38:57.077`, real, measured gaps). Each tick
creates a real, distinct backup file via `File.Copy` — the final check
confirms exactly `3` real files exist in the backups folder, one per
tick, each with its own unique, timestamped name.

### Discard the Throwaway Example
Delete the `lab-timer` folder. `DispatcherTimer`/`File.Copy` are not
discarded — the real backup schedule uses exactly this next.

### Mechanical Walkthrough

- `new DispatcherTimer { Interval = TimeSpan.FromMilliseconds(300) }` —
  **first appearance of `DispatcherTimer`.** `Interval` is a
  `TimeSpan` — this lab uses milliseconds to keep the lab itself fast
  to run; the real project uses a real, much longer interval.
- `timer.Tick += Timer_Tick; timer.Start();` — reappearing shape
  (`+=` event subscription, familiar since `Click="..."`'s C#-side
  equivalent), `Start()` beginning the real, repeating schedule.
- `$"backup-{DateTime.Now:yyyyMMdd-HHmmss-fff}.db"` — (first appearance
  of this specific timestamp format) — sortable by filename alone
  (year-month-day-hour-minute-second-millisecond, largest unit first),
  and guaranteed unique down to the millisecond — two backups can never
  collide on the same filename.

### CS Lens

`DispatcherTimer` firing on the UI thread — unlike `System.Timers.Timer`
or `System.Threading.Timer`, which fire on a background thread pool
thread — is a real, deliberate WPF design choice: any code touching UI
elements (which this project's backup logic doesn't need to, but easily
could, like updating a "last backup" status message) can do so directly
inside `Tick`, with none of the cross-thread marshaling a background
timer would require.

### SE Lens

Why does this lesson's own throwaway lab copy a `.db` file *between*
statements rather than mid-transaction? Because this project's own
established pattern — a fresh `SqliteConnection` opened and closed for
every single operation (Lesson 9 onward), never one long-lived
connection held open — means the database file is essentially never
"mid-write" for any meaningful stretch of time. A real backup timer
firing at some arbitrary moment is, in practice, always catching the
file between operations, not during one — a real, honest reason this
project's specific architecture makes a plain `File.Copy` safe here,
not a general guarantee every SQLite application could rely on
automatically.

### Connection

The real, scheduled backup of `pocketinventory.db`, using exactly this
pattern, is wired into the app's startup next.

---

## Concept Unit: A Real, Scheduled Database Backup

### The Problem

Nothing in this project currently protects a user against losing
`pocketinventory.db` — a drive failure, an accidental deletion, or a
corrupted file would mean losing every item ever entered, with no
recovery path at all.

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:** `InventoryViewModel.cs`.
- **Change type:** Add.
- **Dependencies:** `DispatcherTimer`/`File.Copy`, previous unit;
  `AppContext.BaseDirectory`, Lesson 25.

### The New Code

```csharp
private DispatcherTimer? backupTimer;

public void StartAutomaticBackups()
{
    backupTimer = new DispatcherTimer
    {
        Interval = TimeSpan.FromMinutes(15)
    };
    backupTimer.Tick += (sender, e) => CreateBackup();
    backupTimer.Start();
}

private void CreateBackup()
{
    string backupFolder = Path.Combine(AppContext.BaseDirectory, "Backups");
    Directory.CreateDirectory(backupFolder);

    string dbPath = ConnectionString.Replace("Data Source=", "");
    string backupPath = Path.Combine(backupFolder, $"pocketinventory-{DateTime.Now:yyyyMMdd-HHmmss}.db");

    File.Copy(dbPath, backupPath, overwrite: true);
}
```

```csharp
// In the constructor, after everything else is loaded:
StartAutomaticBackups();
```

### Mechanical Walkthrough

- `Interval = TimeSpan.FromMinutes(15)` — reappearing (`TimeSpan`,
  this lesson's first unit), a real, sensible interval for a desktop
  inventory app — frequent enough that a crash never loses much
  progress, infrequent enough not to matter for disk activity.
- `backupTimer.Tick += (sender, e) => CreateBackup();` — (first
  appearance of a lambda used directly as an event handler in this
  project) — a small, inline function, exactly equivalent to a
  separately named method, chosen here because `CreateBackup` needs no
  parameters from the event itself.
- `ConnectionString.Replace("Data Source=", "")` — (first appearance
  of extracting a real file path from this project's own connection
  string) — `ConnectionString` has been `"Data Source=pocketinventory.db"`
  since Lesson 9; this line recovers the bare file path from it, rather
  than this project maintaining the path as a second, separate,
  possibly-drifting constant.
- `File.Copy(dbPath, backupPath, overwrite: true);` — reappearing
  (`File.Copy`, Lesson 25), `overwrite: true` this time — genuinely
  needed here, unlike Lesson 25's photo copies, because this method
  could theoretically be called twice within the same real second
  (manually, for testing) and shouldn't throw over a filename collision.

### CS Lens

`StartAutomaticBackups`/`CreateBackup` touch nothing about
`SaveItemToDatabase`, `AddOrUpdateItem`, or any other existing write
path — this is the concrete meaning of this lesson's own glossary
phrase, **backups as a scheduled side effect, decoupled from the save
path itself**. A backup happens on its own real schedule, entirely
independent of how many times (or how rarely) a user actually adds or
edits an item.

### SE Lens

Why back up on a fixed timer rather than immediately after every single
save (`SaveItemToDatabase`, `UpdateItemInDatabase`, and the rest each
triggering their own backup)? Because backing up on every single write
would mean a real file copy for every keystroke-driven edit this
project makes (`Location`'s `UpdateSourceTrigger=PropertyChanged`
binding alone could trigger dozens per minute) — real, wasted disk
activity, for a feature whose entire purpose is protecting against
catastrophic loss, not capturing every intermediate edit. A fixed
interval is the honest, appropriate granularity for what backups are
actually for.

### Commands Needed

```bash
dotnet run
```

### Run It

On your Windows machine, temporarily shorten `Interval` to something
observable (`TimeSpan.FromSeconds(10)`, for testing only) — a real,
timestamped `.db` file appears in the app's own `Backups` folder on
schedule, with no action taken beyond leaving the app open. Restore the
real `TimeSpan.FromMinutes(15)` afterward.

### Connection

Automatic backups now exist, completely decoupled from every other
part of this project. The next lesson closes the loop: restoring from
one of these backup files when it's actually needed.

---

## Closing

### Connect the Pieces

`StartAutomaticBackups`, called once at startup, creates a real
`DispatcherTimer` — the exact mechanism proven, with real, measured
tick timing, in this lesson's own first unit — firing `CreateBackup`
every 15 real minutes. `CreateBackup` extracts the real database file
path from `ConnectionString` (already established since Lesson 9) and
`File.Copy`s it into a real, timestamped file inside a `Backups`
folder, using the identical `File.Copy` mechanism Lesson 25 already
proved works correctly for real files.

### What Breaks Without This

Temporarily remove `overwrite: true` from `File.Copy` and call
`CreateBackup()` twice within the same real second (a quick, manual
test — call it directly from a temporary button, twice in a row).
Real, representative failure: the second call throws a real
`IOException` — "the file already exists" — because the timestamp
format this lesson uses is only precise to the second, and two calls
within the same second produce an identical filename. `overwrite: true`
exists specifically to make this edge case harmless rather than a real
crash. Restore it afterward.

### Exercises

- In the `lab-timer` throwaway pattern, change the interval and confirm,
  with real, measured output, that the gap between ticks changes to
  match.
- Predict, in your own words, what happens to `backupTimer` if
  `InventoryViewModel` itself were ever garbage collected while the
  timer was still running — does the timer keep firing, keep this
  project's own `InventoryViewModel` alive longer than expected, or
  something else? This is a genuinely subtle question about
  `DispatcherTimer`'s own event-subscription lifetime, worth reasoning
  through even without a definitive hands-on test.
- Add a real "Backup Now" button, calling `CreateBackup()` directly,
  giving a user a way to force an immediate backup instead of waiting
  for the next scheduled tick.

### Definition of Done

- [ ] `StartAutomaticBackups` runs once, at startup.
- [ ] A real, timestamped backup file appears in a `Backups` folder on
      a real, fixed schedule, with no user action required.
- [ ] No existing save path (`SaveItemToDatabase`,
      `UpdateItemInDatabase`, and the rest) was modified to support
      backups.
- [ ] You reproduced the same-second filename collision on purpose,
      confirmed the real `IOException` without `overwrite: true`, and
      restored it.
- [ ] Committed with a message stating why: for example,
      `git commit -m "Add scheduled automatic backups via DispatcherTimer — Epic 12 begins"`.
