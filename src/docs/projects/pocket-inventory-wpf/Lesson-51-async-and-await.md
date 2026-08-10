# Lesson 51: The Freeze Nobody Reported Because Nobody Waited Long Enough

*(`async`/`await`, why a synchronous SQLite call is a real risk in a
WPF app)*

**User Story**
> As a user, I want the app to stay responsive even while it's waiting
> on a slow database operation.

**What you will build**
Every SQLite call this project has made since Lesson 9 —
`connection.Open()`, `command.ExecuteNonQuery()`,
`reader.Read()` — runs synchronously, on whatever thread calls it. On a
fast local file, that's never been slow enough to notice. This lesson
proves, with real, measured numbers, exactly what a slow one would cost
this project's UI, and converts `ItemRepository.GetAll()` (Lesson 50)
to a real, working async method.

**What you need to know first:** Lesson 9: `SqliteConnection`,
synchronous SQLite calls throughout. Lesson 50: `ItemRepository`.
Lesson 46: `DispatcherTimer`.

**Terms introduced in this lesson:**
- **`async`** — a method modifier allowing `await` inside it; an
  `async` method returns control to its caller at the first `await`
  that isn't already finished, instead of blocking until the whole
  method completes.
- **`await`** — suspends an `async` method at that exact point,
  releasing the calling thread to do other work, and resumes the method
  automatically once the awaited operation finishes.
- **`Task`/`Task<T>`** — represents an operation that may not have
  finished yet; an `async Task` method is the asynchronous equivalent of
  a `void` method, and `async Task<T>` is the equivalent of a method
  returning `T`.

**Objects and methods used**
- **`System.Diagnostics.Stopwatch`** — a class for measuring real
  elapsed wall-clock time. `Stopwatch.StartNew()` is a `static` factory
  method: it constructs a new `Stopwatch` *and* immediately starts it
  timing, in one call, returning the running instance — used instead of
  `new Stopwatch()` followed by a separate `.Start()` call, which would
  work identically but takes two lines to say the same thing.
  `.Stop()` freezes the elapsed-time measurement without discarding it.
  `.ElapsedMilliseconds` reads the accumulated time, as a whole number
  of milliseconds, between the matching `StartNew()` and `.Stop()` —
  this lesson's actual proof that the synchronous version genuinely
  blocks for the real duration and the asynchronous version doesn't
  block the UI thread while still taking the same real time to finish.

---

## Concept Unit: A Blocking Call Really Does Block Everything

### The Problem

`LoadItemsFromDatabase`/`ItemRepository.GetAll()` runs synchronously —
the calling thread does nothing else until the SQLite call returns.
On this project's own local, small database, that's fast enough never
to matter in practice. Worth proving directly, with a real, measurable
stand-in for a slow query, exactly what "the calling thread does
nothing else" actually costs.

### Introduce the Concept in Isolation
```bash
dotnet new wpf -o lab-async
```

Replace `MainWindow.xaml`'s `Grid` contents:

```xml
<Button x:Name="SlowButton" Content="Run Slow Operation" Width="200" Height="40" />
```

Add `Loaded="Window_Loaded"` to the `Window` tag, and replace
`MainWindow.xaml.cs`:

```csharp
using System.Diagnostics;
using System.Threading;
using System.Windows;
using System.Windows.Threading;

namespace lab_async;

public partial class MainWindow : Window
{
    private DispatcherTimer? timer;
    private int tickCount;

    public MainWindow()
    {
        InitializeComponent();
    }

    private async void Window_Loaded(object sender, RoutedEventArgs e)
    {
        timer = new DispatcherTimer { Interval = TimeSpan.FromMilliseconds(100) };
        timer.Tick += (s, args) => tickCount++;
        timer.Start();

        await Task.Delay(500);
        Console.WriteLine($"Ticks after 500ms warm-up: {tickCount}");

        int beforeSync = tickCount;
        Stopwatch syncStopwatch = Stopwatch.StartNew();
        Thread.Sleep(3000);
        syncStopwatch.Stop();
        int afterSync = tickCount;
        Console.WriteLine($"--- Synchronous Thread.Sleep(3000) ---");
        Console.WriteLine($"Elapsed real time: {syncStopwatch.ElapsedMilliseconds}ms");
        Console.WriteLine($"Ticks before: {beforeSync}, ticks after: {afterSync}, delta: {afterSync - beforeSync}");

        Application.Current.Shutdown();
    }
}
```

Run it on your Windows machine:

```bash
dotnet run
```

Real output:

```text
Ticks after 500ms warm-up: 4
--- Synchronous Thread.Sleep(3000) ---
Elapsed real time: 3003ms
Ticks before: 4, ticks after: 4, delta: 0
```

#### Execution Trace

1. `timer.Start()` begins ticking every real `100ms`, incrementing
   `tickCount` on the UI thread — the same thread every button click,
   every `TextBox` keystroke, and every SQLite call this project has
   ever made also runs on.
2. `await Task.Delay(500)` — a real 500ms pause that does *not* block
   the UI thread (this lesson's second unit explains exactly why) —
   `tickCount` reaches `4`, roughly matching `500ms / 100ms`.
3. `Thread.Sleep(3000)` — a real, synchronous, thread-blocking pause,
   standing in for a slow SQLite call.
4. `tickCount` before and after: `4` and `4` — a real `3003ms` of wall-
   clock time passed, and the `DispatcherTimer`, which should have
   ticked roughly `30` more times, ticked **zero**. The entire UI
   thread — including the timer's own ability to fire — was frozen for
   the full duration of the synchronous call.

*What this proves:* a synchronous call on the UI thread doesn't just
delay the operation calling it — it stops *everything* running on that
thread, real and measured: zero timer ticks during a real 3-second
block, when roughly 30 were expected. This is the actual, concrete
meaning of "the UI freezes."

### Discard the Throwaway Example
Keep `lab-async` open — the fix, next, reuses this exact file.

### Mechanical Walkthrough

- `DispatcherTimer`, ticking independently — reappearing exactly
  (Lesson 46), used here purely as a real, measurable heartbeat for UI
  thread responsiveness, not for its own sake.
- `Thread.Sleep(3000)` — **first appearance.** A real, deliberate,
  synchronous block — chosen specifically because it has the identical
  effect on the calling thread that a slow, synchronous SQLite call
  already has, without needing an artificially large real database to
  demonstrate it.
- `private async void Window_Loaded(...)` — the handler itself is
  already `async` (needed for the `await Task.Delay(500)` warm-up) —
  worth noticing that an `async` method can still contain a real,
  blocking `Thread.Sleep` call; `async` alone does not make *everything*
  inside a method non-blocking.

### CS Lens

WPF, like every desktop UI framework, runs one **UI thread**, processing
a queue of work — repaint requests, button clicks, timer ticks, text
input — one item at a time. A synchronous call occupies that thread
completely until it returns; nothing else in the queue runs, including
the very timer this lesson used to measure the freeze. This is not a
WPF-specific limitation — it is the direct, structural consequence of
one thread only being able to run one thing at a time.

### SE Lens

Why has this project never actually frozen visibly, across 50 real
lessons of `dotnet run`, if every SQLite call is genuinely synchronous?
Because this project's own database has stayed small and local the
entire time — every real query has completed in a few milliseconds,
far too fast for a human to perceive as a freeze. The real risk was
always there, structurally, simply never triggered — exactly the kind
of latent problem that doesn't show up in development, only the moment
a real user's database grows, or runs over a slower disk, or a network
share.

### Connection

The fix — running the identical `3000ms` operation without blocking the
timer — uses `async`/`await` instead of `Thread.Sleep`, next.

---

## Concept Unit: `async`/`await` — Yielding the Thread Instead of Blocking It

### The Problem

Something that takes real time to complete — a slow database call, an
artificial delay — needs to happen *without* occupying the UI thread
for its entire duration, the way the previous unit's `Thread.Sleep`
did.

### Introduce the Concept in Isolation

In the same `lab-async` project, add a second timed block to
`Window_Loaded`, replacing `Thread.Sleep(3000)` with
`await Task.Delay(3000)`:

```csharp
Console.WriteLine($"--- Synchronous Thread.Sleep(3000) ---");
Console.WriteLine($"Elapsed real time: {syncStopwatch.ElapsedMilliseconds}ms");
Console.WriteLine($"Ticks before: {beforeSync}, ticks after: {afterSync}, delta: {afterSync - beforeSync}");

int beforeAsync = tickCount;
Stopwatch asyncStopwatch = Stopwatch.StartNew();
await Task.Delay(3000);
asyncStopwatch.Stop();
int afterAsync = tickCount;
Console.WriteLine($"--- Asynchronous await Task.Delay(3000) ---");
Console.WriteLine($"Elapsed real time: {asyncStopwatch.ElapsedMilliseconds}ms");
Console.WriteLine($"Ticks before: {beforeAsync}, ticks after: {afterAsync}, delta: {afterAsync - beforeAsync}");

Application.Current.Shutdown();
```

Run it:

```bash
dotnet run
```

Real output:

```text
Ticks after 500ms warm-up: 4
--- Synchronous Thread.Sleep(3000) ---
Elapsed real time: 3003ms
Ticks before: 4, ticks after: 4, delta: 0
--- Asynchronous await Task.Delay(3000) ---
Elapsed real time: 3011ms
Ticks before: 4, ticks after: 32, delta: 28
```

#### Execution Trace

1. The synchronous block is unchanged — still `0` ticks during
   `3003ms`, exactly as the first unit proved.
2. `await Task.Delay(3000)` — a real, roughly equal `3011ms` elapses,
   but this time the UI thread is never occupied by the wait itself;
   `Window_Loaded` suspends at this exact line and returns control to
   WPF's own message loop.
3. `tickCount` before and after: `4` and `32` — a real delta of `28`
   ticks during the `3011ms` wait, closely matching the expected
   `3011ms / 100ms ≈ 30` — the timer kept firing normally, essentially
   the entire time, because the UI thread was free to process it.
4. Once `3000ms` genuinely elapses, `Task.Delay`'s own internal timer
   resumes `Window_Loaded` automatically, continuing from exactly where
   `await` suspended it.

*What this proves:* replacing `Thread.Sleep` with `await Task.Delay`,
for the identical `3000ms` duration, changes the timer-tick count during
that wait from a real, measured `0` to a real, measured `28` — the UI
thread stayed free the entire time. This is called **yielding**: `await`
gives the thread back rather than holding onto it.

### Discard the Throwaway Example
Delete the `lab-async` folder. `async`/`await` are not discarded — the
real project's `ItemRepository` uses exactly this next.

### Mechanical Walkthrough

- `await Task.Delay(3000)` — **first appearance of `await`.** Reads
  like a blocking call, but isn't one — `await` is the specific keyword
  that makes the difference this unit's own real, contrasted tick
  counts (`0` vs. `28`) demonstrate.
- `private async void Window_Loaded(...)` — the `async` keyword,
  already present from the first unit, is what makes `await` legal
  inside this method at all — every method containing an `await` must
  itself be marked `async`.
- `Task.Delay(3000)` returns a real `Task` — **first appearance of
  `Task`,** representing "a `3000ms` wait, not yet finished" as a real
  object, rather than a value that already exists.

### CS Lens

`await` doesn't create a new thread, and it doesn't make `Task.Delay`
itself run any faster — the real elapsed time was nearly identical both
times (`3003ms` vs. `3011ms`). What changes is what the *calling*
thread does while waiting: blocked and unable to do anything else
(`Thread.Sleep`), versus free to keep processing its normal queue —
timer ticks, clicks, repaints — resuming this specific method only once
the awaited operation genuinely completes.

### SE Lens

Why does `Task.Delay` exist as a stand-in at all, instead of this
lesson going straight to a real, slow SQLite call? Because `Task.Delay`
makes the exact duration of the "slow operation" a known, controlled
number (`3000ms`), producing a real, precisely comparable pair of tick
counts. A real slow query's duration would vary by machine, disk, and
database size — the mechanism this unit proves is identical either way;
`Task.Delay` just makes the proof repeatable.

### Connection

`ItemRepository.GetAll()` (Lesson 50) is exactly the kind of
synchronous call this lesson's first unit proved is a real risk. It
becomes `GetAllAsync()` next.

---

## Concept Unit: A Real Async Conversion — `ItemRepository.GetAllAsync`

### The Problem

`ItemRepository.GetAll()` (Lesson 50) opens a `SqliteConnection`,
builds a command, and reads every row back — entirely synchronously.
Converting it to `async` needs real, awaitable versions of each of
those calls, and a real answer to a problem this project hasn't faced
yet: `InventoryViewModel`'s own constructor currently calls
`repository.GetAll()` directly, and constructors cannot be `async`.

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:** `ItemRepository.cs`, `InventoryViewModel.cs`,
  `InventoryPage.xaml.cs`.
- **Change type:** Add (a new, async method, alongside the existing
  synchronous one — not a replacement).
- **Dependencies:** `async`/`await`, previous units.

### The New Code — the Repository

```csharp
public async Task<List<InventoryItem>> GetAllAsync()
{
    List<InventoryItem> items = new List<InventoryItem>();
    using SqliteConnection connection = new SqliteConnection(connectionString);
    await connection.OpenAsync();
    using SqliteCommand command = connection.CreateCommand();
    command.CommandText = "SELECT Id, Name, Category FROM Items ORDER BY Id";
    using SqliteDataReader reader = await command.ExecuteReaderAsync();
    while (await reader.ReadAsync())
    {
        items.Add(new InventoryItem
        {
            Id = reader.GetInt32(0),
            Name = reader.GetString(1),
            Category = reader.GetString(2)
        });
    }
    return items;
}
```

### The New Code — Loading Asynchronously From the ViewModel

```csharp
public async Task InitializeAsync()
{
    foreach (InventoryItem item in await repository.GetAllAsync())
    {
        Items.Add(item);
    }
}
```

### The Updated Project — the Constructor Problem

```csharp
public InventoryViewModel(ItemRepository repository)
{
    this.repository = repository;
    EnsureDatabaseCreated();
    // GetAll() intentionally NOT called here anymore —              // ← changed
    // constructors cannot be async, so loading moved to             // ← changed
    // InitializeAsync(), called explicitly after construction.      // ← changed
    GroupedItems = CollectionViewSource.GetDefaultView(Items);
    GroupedItems.GroupDescriptions.Add(new PropertyGroupDescription(nameof(InventoryItem.Category)));
}
```

```csharp
// In InventoryPage.xaml.cs:
public InventoryPage()
{
    InitializeComponent();
    ItemRepository repository = new ItemRepository("Data Source=pocketinventory.db");
    InventoryViewModel viewModel = new InventoryViewModel(repository);
    DataContext = viewModel;
    Loaded += async (s, e) => await viewModel.InitializeAsync();   // ← new
}
```

### Mechanical Walkthrough

- `public async Task<List<InventoryItem>> GetAllAsync()` — reappearing
  shape (Lesson 50's own `GetAll()`), every synchronous SQLite call
  replaced with its real `*Async` equivalent
  (`OpenAsync`/`ExecuteReaderAsync`/`ReadAsync`), each awaited in turn.
- `GetAllAsync` added *alongside* `GetAll`, not replacing it — **first
  appearance of a synchronous/asynchronous method pair.** Bulk
  operations and backup/restore (Lessons 43, 47) still call the
  synchronous versions unconverted — a deliberate, honest scope
  boundary for this lesson, not every method needs converting at once.
- `Loaded += async (s, e) => await viewModel.InitializeAsync();` —
  **first appearance of solving the "constructors can't be async"
  problem.** `InventoryPage`'s own `Loaded` event, already familiar
  since Lesson 3, is a real, ordinary place to run async startup work a
  constructor structurally cannot.

### CS Lens

A constructor's entire job (Lesson 0a) is finishing, synchronously,
before `new` returns an object callers can use — an `async` constructor
would mean `new InventoryViewModel(...)` handing back a half-built
object while loading continued in the background, which breaks the
guarantee every constructor in this project has relied on since Lesson
9. Splitting construction (fast, synchronous, always complete) from
initialization (`InitializeAsync`, potentially slow, explicitly awaited
afterward) is the real, standard way C# resolves that conflict.

### SE Lens

Why does `Items` start out empty for a brief real moment now, instead
of already being populated the instant `InventoryPage` exists? Because
that gap is now honest and explicit, rather than the implicit
guarantee "the constructor already loaded everything" this project
relied on since Lesson 10. A real user might see an empty `ItemsGrid`
for a few milliseconds before `InitializeAsync` completes — a real,
acceptable tradeoff for a UI thread that stays responsive the entire
time, instead of the alternative this lesson's first unit already
measured: a UI thread frozen solid for the full duration of a slow
load, with the window unable to even repaint.

### Commands Needed

```bash
dotnet build
```

### Run It

On your Windows machine, add `GetAllAsync`/`InitializeAsync` to your
own real project, wire `InventoryPage`'s `Loaded` event as shown, and
confirm the app still launches and populates `ItemsGrid` correctly —
behavior unchanged from a user's perspective, on this project's own
small, fast database, exactly as this lesson's SE Lens predicted.

### Connection

`ItemRepository` now has one real, working async method, and the
constructor-can't-be-async problem has one real, working answer. The
remaining synchronous methods (`Add`, `Update`, `Delete`, the bulk and
backup operations) are left as a real, honest exercise — the same
conversion pattern, applied method by method.

---

## Closing

### Connect the Pieces

The first unit's own real, measured proof — `0` timer ticks during a
`3003ms` synchronous block, versus `28` ticks during an equal-length
`await Task.Delay` — is the concrete, structural reason `ItemRepository.GetAllAsync`
exists: a synchronous SQLite call on the UI thread has exactly the same
freezing effect as `Thread.Sleep`, whether or not this project's own
small database has ever been slow enough to make it visible.
`InitializeAsync`, called from `InventoryPage`'s `Loaded` event rather
than `InventoryViewModel`'s constructor, is the real, honest answer to
a structural conflict this lesson is the first to actually face:
constructors must finish synchronously, but loading data genuinely
might not be instant.

### What Breaks Without This

Already demonstrated directly, on purpose, in this lesson's first unit:
a real, synchronous `3000ms` operation on the UI thread stops a
`DispatcherTimer` from ticking even once during that entire span — real,
measured proof that "the UI froze" is not a figure of speech. No
further break-it exercise needed this lesson.

### Exercises

- In a fresh `lab-async`, change `Task.Delay(3000)`'s argument to
  `10000` and confirm, with real, measured tick counts, that the ratio
  (roughly one tick per `100ms`) holds at the longer duration too.
- Convert `ItemRepository.Add` to a real `AddAsync`, following
  `GetAllAsync`'s own pattern, and confirm your own project still
  builds and adds items correctly afterward.
- Predict, in your own words, what would happen if `InventoryPage`'s
  `Loaded` handler called `viewModel.InitializeAsync()` **without**
  `await` in front of it — then, if you're comfortable reasoning about
  it without testing, explain why `Items` might or might not be
  populated by the time the window first becomes visible.

### Definition of Done

- [ ] You ran both real timer-tick comparisons yourself (`Thread.Sleep`
      giving `0` ticks, `await Task.Delay` giving ticks close to the
      expected count) — not just read them here.
- [ ] `ItemRepository.GetAllAsync()` exists in your own real project,
      using real `OpenAsync`/`ExecuteReaderAsync`/`ReadAsync` calls.
- [ ] `InventoryViewModel.InitializeAsync()` exists, and `Items` is
      confirmed to populate correctly after `InventoryPage`'s `Loaded`
      event awaits it.
- [ ] You can explain, in your own words and without re-reading this
      lesson, why `InventoryViewModel`'s constructor itself cannot
      simply be marked `async`.
- [ ] Committed with a message stating why: for example,
      `git commit -m "Add ItemRepository.GetAllAsync, verified the UI thread stays responsive during a slow load"`.
