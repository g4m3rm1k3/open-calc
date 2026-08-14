# Lesson 14: Async/Await and the Dispatcher

**What this covers:** why one slow call freezes the *entire* application
— not just the control that triggered it — and the real fix: `async`/
`await`. Also `Dispatcher`, for the rarer case of updating UI from a
background thread directly.

**What you need to know first:** [Lesson 05](lesson-05-events-and-routed-events.md)
(event handlers, which is where a slow call usually starts).

## The problem, proven

```csharp
private void LoadButton_Click(object sender, RoutedEventArgs e)
{
    var items = _repository.GetAllItems(); // a real database call, takes 2 seconds
    ItemsGrid.ItemsSource = items;
}
```

Click "Load," and for those two seconds: the window can't be moved,
resized, or closed; no other button responds; nothing redraws, even
things unrelated to loading data. This is not a bug specific to database
calls — **WPF runs all UI work on exactly one thread**, the UI thread,
and that same thread is what runs every event handler by default. A slow
synchronous call inside a handler occupies that one thread for its full
duration, and since nothing else — not even redrawing the window — can
happen without that thread, the entire app appears frozen, not just the
feature that's slow.

## `async`/`await` — the real fix

```csharp
private async void LoadButton_Click(object sender, RoutedEventArgs e)
{
    var items = await _repository.GetAllItemsAsync();
    ItemsGrid.ItemsSource = items;
}
```

```csharp
public async Task<List<Item>> GetAllItemsAsync()
{
    using var connection = new SqliteConnection(_connectionString);
    await connection.OpenAsync();
    // ... real async query logic
    return items;
}
```

- `async` on the method signature — **(a) first appearance.** Marks a
  method as containing `await` points; it doesn't itself make anything
  run in the background — it enables the `await` keyword to be legal
  inside this method's body.
- `Task<List<Item>>` — **(a) first appearance.** The real async return
  type: not "a `List<Item>`, eventually," but a `Task` object
  *representing* work in progress that will eventually produce a
  `List<Item>` — the async equivalent of a `Future`/`Promise` if you've
  seen either from another language; a plain `void`-returning async
  method (`async void`, as `LoadButton_Click` uses above) is the one
  real exception to this, allowed specifically for event handlers because
  nothing else can `await` an event handler's own completion anyway.
- `await connection.OpenAsync();` — **(a) first appearance**, the actual
  mechanism: execution genuinely pauses *this method* at this line and
  returns control back to the caller — for `LoadButton_Click`, that means
  control returns to WPF's own message loop, which is what keeps the UI
  thread free to keep processing clicks, redraws, and everything else
  while the database call is in flight. When the awaited operation
  finishes, execution resumes exactly where it left off, on the UI
  thread again (WPF's `SynchronizationContext`, not covered further here,
  is what guarantees the resume happens back on the correct thread) —
  which is precisely why `ItemsGrid.ItemsSource = items;` after the
  `await` above is safe to write with no extra thread-marshaling code:
  it really does run back on the UI thread, automatically.

**This is not multithreading, and worth stating plainly because it looks
like it should be:** nothing above spawns a new thread by itself — `await`
on a real I/O operation (database, network, file) yields the current
thread back to the caller *while the operating system itself* handles the
actual waiting, then resumes on a thread from the pool once the OS signals
completion. `Task.Run(...)`, covered below, is the real mechanism for
actually running CPU-bound work on a separate thread — a different tool
for a different problem.

## Execution trace: what actually happens, step by step

```
1. LoadButton_Click starts, running on the UI thread.
2. Hits `await _repository.GetAllItemsAsync()`. GetAllItemsAsync begins
   running, also initially on the UI thread — up to its own first `await`.
3. GetAllItemsAsync hits `await connection.OpenAsync()`. This is where
   the pause actually happens: control returns to LoadButton_Click's
   caller (WPF's message loop), which is now free — the window can be
   moved, other buttons respond, redraws happen normally, all while the
   real database connection is opening in the background.
4. The database connection finishes opening. Execution resumes inside
   GetAllItemsAsync, right after the `await`, back on the UI thread.
5. GetAllItemsAsync finishes, returning its List<Item>. Execution resumes
   inside LoadButton_Click, right after its own `await`, still on the UI
   thread — `ItemsGrid.ItemsSource = items;` runs safely.
```

Every step that touches UI happens on the UI thread; only the actual
waiting (step 3, inside the OS/database driver) happens without
occupying it — that's the entire mechanism, and it's why the fix is a
handful of `async`/`await` keywords rather than a rewrite involving
manual threads.

## `Task.Run` — for CPU-bound work, not I/O

```csharp
private async void ProcessButton_Click(object sender, RoutedEventArgs e)
{
    var result = await Task.Run(() => HeavyComputation(largeDataSet));
    ResultText.Text = result;
}
```

A database call or a network request is I/O-bound — most of its time is
spent *waiting*, not computing, which is exactly what plain `await` (no
`Task.Run`) handles well with no extra thread involved. A genuinely
CPU-heavy calculation (sorting a huge in-memory dataset, image
processing) has no "waiting" to yield during — it's actually busy the
whole time — so `await`ing it directly would still block the UI thread
for its full duration. `Task.Run(() => ...)` — the lambda (Lesson 00b)
passed to it genuinely runs on a separate thread-pool thread, freeing the
UI thread for that computation's whole duration, and `await`ing the
`Task.Run` call itself is what brings execution back to the UI thread
once it's done, the same resume mechanism as above.

## `Dispatcher` — updating UI from a thread that isn't the UI thread

```csharp
private void OnBackgroundTimerTick(object sender, ElapsedEventArgs e)
{
    // This runs on a background timer's own thread, NOT the UI thread.
    Application.Current.Dispatcher.Invoke(() =>
    {
        StatusText.Text = $"Last checked: {DateTime.Now}";
    });
}
```

Touching a UI element directly from any thread other than the UI thread
throws a real exception at runtime
(`InvalidOperationException: The calling thread cannot access this
object because a different thread owns it`) — a hard rule, not a
guideline. `Dispatcher` — the real object every `DispatcherObject` (every
UI element ultimately is one) is tied to, representing "the UI thread's
own work queue." `.Invoke(() => { ... })` — hands the lambda to that
queue, to be run *on* the UI thread, and blocks the calling background
thread until it's done (`.InvokeAsync(...)` is the non-blocking
counterpart, when the caller doesn't need to wait). This is genuinely
rarer to need directly than `async`/`await` — most real UI updates in a
modern WPF app happen inside an `async` method that's already resumed
correctly on the UI thread by the mechanism above; `Dispatcher.Invoke` is
specifically for code running on a thread WPF itself didn't put there for
you (a raw `System.Timers.Timer`, a manually started `Thread`).

## SE Lens

The real alternative to `async`/`await` — spawning a raw `Thread` for
every slow operation and manually marshaling results back via
`Dispatcher` — works, and is real, substantially more code per call site,
with real risk of forgetting the marshaling step and hitting the
cross-thread exception above. `async`/`await` is the language absorbing
that ceremony: the compiler rewrites an `async` method into the
equivalent state-machine/continuation code under the hood, so the source
you write reads like ordinary sequential code while actually yielding
control at each `await`. The cost: an `async` method's actual execution
order — what runs before the yield, what runs after — is genuinely less
obvious from a quick read than fully synchronous code, which is exactly
what the execution trace above exists to make concrete instead of
abstract.

## What to check first in your assigned project

- Any event handler making a direct database/file/network call with no
  `await` in sight is a real, freezing-the-UI bug waiting to be noticed
  under load — a strong "make it better" candidate if your assignment
  allows touching it.
- `async void` should appear **only** on event handlers — an `async
  void` method anywhere else (not wired to an event) is a common,
  real mistake: exceptions thrown inside it can't be caught by an
  `await`ing caller the normal way, because there's no `Task` for them to
  propagate through.
- Any `Dispatcher.Invoke` in the codebase names a real background thread
  somewhere else worth finding — a timer, a manually started `Thread`, or
  a callback from a non-WPF library.

## Next

[Lesson 15 — Validation and Debugging WPF](lesson-15-validation-and-debugging-wpf.md)
closes this reference: catching bad input at the boundary, and reading
the Output window when a binding silently fails.
