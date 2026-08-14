# Lesson 22: Async/Await and the Dispatcher

**What you will build:** a real, deliberately slow synchronous call
proven to freeze the entire window — not just the button that triggered
it — fixed with `async`/`await`, and a real cross-thread exception
proven and fixed with `Dispatcher.Invoke`.

**What you need to know first:** [Lesson 13](lesson-13-events-and-routed-events.md)
(event handlers, where a slow call typically starts) and
[Lesson 06](lesson-06-delegates-func-action.md) (`Func<>`, useful context
for `Task<T>`'s own shape, though not required).

**Terms introduced in this lesson:**
- **UI thread** — the single thread WPF runs all UI work and, by
  default, every event handler on.
- **`async`/`await`** — language features letting a method pause at a
  real I/O wait without occupying the UI thread for that wait's
  duration, then resume automatically once the wait completes.
- **`Task`/`Task<T>`** — the real async return type, representing
  in-progress work that will eventually produce a result (or nothing,
  for plain `Task`).
- **`Dispatcher`** — the real object representing the UI thread's own
  work queue, used to run code on it from a thread that isn't already
  the UI thread.

**Objects and methods used:** `System.Threading.Tasks.Task`,
`System.Windows.Threading.Dispatcher` — both given full treatment as
this lesson's own subject.

---

## Concept Unit: A Slow Synchronous Call Freezes the Whole Window

### The Problem

A button click running a slow operation — a real, deliberate
`Thread.Sleep(3000)` standing in for a slow database/network call —
should, if the freeze claim is real, make more than just that one button
unresponsive. This needs to be proven directly, not assumed from
description.

### Introduce the Concept in Isolation

```csharp
private void LoadButton_Click(object sender, RoutedEventArgs e)
{
    System.Threading.Thread.Sleep(3000);
    StatusText.Text = "Loaded!";
}
```

Clicking "Load" and, during the following three seconds, attempting to
drag the window, click a *different*, unrelated button, or even resize
the window — all of them fail to respond, and the window itself stops
redrawing (it visibly shows as "Not Responding" if moved). This proves
the claim directly: `Thread.Sleep(3000)` occupies the **UI thread** —
the one single thread WPF runs all UI work and, by default, every event
handler on — for its full three seconds, and since *everything* WPF does
(redrawing, handling other clicks, moving the window) needs that same
thread, none of it can happen until `LoadButton_Click` finishes.

### Discard

This frozen-window proof is disposable; the fixed version, next,
replaces it directly.

### Mechanical Walkthrough

- `System.Threading.Thread.Sleep(3000);` — **(a) first appearance** as a
  deliberate stand-in for a slow real operation; its real effect —
  freezing the entire window, not just this handler — is proven above.
- `StatusText.Text = "Loaded!";` — **(b) hard concept reappearing**,
  ordinary property assignment via a generated `x:Name` field (Lesson
  10); it does correctly run, eventually — the *freeze* during the wait,
  not a total failure, is this unit's real point.

## Concept Unit: `async`/`await` — the Real Fix

### The Problem

Does replacing `Thread.Sleep`'s synchronous wait with an equivalent
*asynchronous* one keep the rest of the application responsive during
the identical three-second wait?

### Introduce the Concept in Isolation

```csharp
private async void LoadButton_Click(object sender, RoutedEventArgs e)
{
    await Task.Delay(3000);
    StatusText.Text = "Loaded!";
}
```

Clicking "Load" now leaves the rest of the window fully responsive
during the three-second wait — dragging, resizing, and clicking other
buttons all continue working normally, confirmed directly by doing
exactly that while waiting — and `StatusText.Text` still correctly
updates to `"Loaded!"` once the wait genuinely completes.

### Discard

Nothing here is disposable — this is the real, correct shape for any
slow operation inside an event handler for the rest of this series.

### Mechanical Walkthrough

- `private async void LoadButton_Click(...)` — **(a) first appearance**
  of `async` on a method signature: enables the `await` keyword to be
  legal inside this method's body; it does not, by itself, move
  anything to a background thread.
- `await Task.Delay(3000);` — **(a) first appearance** of the actual
  mechanism: execution genuinely **pauses** at this line and returns
  control back to the caller — for an event handler, that means control
  returns to WPF's own message loop, which is exactly what keeps the UI
  thread free to keep processing other clicks and redraws during the
  wait. `Task.Delay(3000)` itself — **(a) first appearance**, a real
  static method producing a `Task` that completes after the given
  number of milliseconds, the async-friendly counterpart to
  `Thread.Sleep` used deliberately here as a like-for-like replacement.
- `StatusText.Text = "Loaded!";` — **(b) hard concept reappearing**;
  its real timing — resuming automatically, back on the UI thread, once
  the awaited delay completes — is this unit's own proof, made concrete
  in the next unit's execution trace.

### Execution Trace

1. `LoadButton_Click` starts running, on the UI thread — the same thread
   that would otherwise be frozen by `Thread.Sleep`.
2. Execution reaches `await Task.Delay(3000);`. This is the real pause
   point: control returns to the caller (WPF's own message loop) *before*
   the three seconds elapse — proven directly by the window staying
   responsive during exactly this interval.
3. While paused here, WPF's message loop is free to process anything
   else — other button clicks, window redraws, resize events — all of
   which genuinely worked in this unit's own real test.
4. Once three real seconds pass, the awaited `Task` completes, and
   execution resumes **automatically**, exactly where it left off,
   inside `LoadButton_Click` — back on the UI thread (WPF's own
   `SynchronizationContext`, not explored further in this lesson, is
   what guarantees this resume happens on the correct thread).
5. `StatusText.Text = "Loaded!";` runs — safely, on the UI thread, with
   no special handling required, because step 4 already placed execution
   back there correctly.

### SE Lens

The real alternative to `async`/`await` — manually starting a background
`Thread` for the slow work, then somehow getting the result back onto
the UI thread afterward (the next unit's own `Dispatcher` mechanism,
used by hand) — genuinely works, and is real, substantially more code
per call site, with real risk of forgetting the hand-off step entirely
and crashing (proven directly in this lesson's own next unit).
`async`/`await` is the language absorbing that ceremony: the source
reads like ordinary sequential code, while the compiler rewrites it
underneath into the equivalent pause-and-resume logic — at the honest
cost that an `async` method's real execution order is genuinely less
obvious from a quick read than fully synchronous code, which is exactly
what this lesson's own execution trace exists to make concrete rather
than asserted.

## Concept Unit: `Dispatcher` — Touching UI From a Thread That Isn't the UI Thread

### The Problem

Not every background operation is started by `await`'s own automatic
thread management — a raw background `Thread`, started by hand, needs a
real way to update UI safely. Does touching a UI element directly from
such a thread simply work, the way it does inside an `async` method
after `await` resumes?

### Introduce the Concept in Isolation

```csharp
private void StartButton_Click(object sender, RoutedEventArgs e)
{
    var thread = new System.Threading.Thread(() =>
    {
        System.Threading.Thread.Sleep(1000);
        StatusText.Text = "Done from background thread";
    });
    thread.Start();
}
```

Running this produces a real, observed crash, roughly one second after
clicking:

```
System.InvalidOperationException: The calling thread cannot access this
object because a different thread owns it.
```

Direct, provable proof that `async`/`await`'s "resumes safely on the UI
thread" guarantee from the previous unit is a real, specific feature of
that mechanism — not a general property of all background code. A raw
background `Thread`, started by hand, has no such guarantee at all;
touching `StatusText` from inside it throws immediately.

### Discard

This crashing proof is disposable; the fixed version, next, replaces it
directly.

### The Fix, Proven

```csharp
private void StartButton_Click(object sender, RoutedEventArgs e)
{
    var thread = new System.Threading.Thread(() =>
    {
        System.Threading.Thread.Sleep(1000);
        Application.Current.Dispatcher.Invoke(() =>
        {
            StatusText.Text = "Done from background thread";
        });
    });
    thread.Start();
}
```

With the UI update wrapped in `Dispatcher.Invoke(...)`, the identical
background-thread scenario now completes with no crash, correctly
updating `StatusText` roughly one second later.

### Mechanical Walkthrough

- `new System.Threading.Thread(() => { ... });` / `thread.Start();` —
  **(a) first appearance** of manually starting a real background
  thread; the lambda passed to it (Lesson 05) runs on that new thread,
  not the UI thread — the direct cause of the crash proven above.
- `Application.Current.Dispatcher` — **(a) first appearance.** Every
  `DispatcherObject` — every UI element, including `StatusText`, is one
  — is tied to a real `Dispatcher`, representing the UI thread's own
  work queue; `Application.Current` reaches the one running application
  instance, whose `Dispatcher` is the correct one to target.
- `.Invoke(() => { StatusText.Text = "..."; });` — **(a) first
  appearance.** Hands the lambda to that queue, to be run *on* the UI
  thread, and blocks the calling background thread until it completes —
  `.InvokeAsync(...)`, a real non-blocking counterpart, exists but isn't
  exercised in this lesson.

### CS Lens

Not a hard CS concept in the design-pattern sense — this is a real,
concrete instance of the general rule that most UI toolkits enforce
**thread affinity**: UI objects may only be touched from the specific
thread that owns them, because concurrent, uncoordinated access from
multiple threads to the same visual state would risk real, hard-to-debug
corruption; `Dispatcher.Invoke` is WPF's real, explicit hand-off
mechanism for crossing that boundary safely.

## Connect the pieces

One trace: `Thread.Sleep` inside an event handler freezes the entire
window, not just the triggering control — proven by every other control
failing to respond during the wait. `await Task.Delay(...)` fixes this
by genuinely pausing and returning control to WPF's own message loop,
then resuming automatically, back on the UI thread, once the real wait
completes — proven by an execution trace naming exactly where the pause
and resume happen. A raw background `Thread`, started by hand instead of
through `async`/`await`, has no such automatic resume-on-the-UI-thread
guarantee at all — proven by a real, reproduced crash — and
`Dispatcher.Invoke` is the real, explicit fix for exactly that gap.

## What breaks without this

Call `Task.Delay(3000)` **without** `await` in front of it, as a plain
statement with no other change:

```csharp
private void LoadButton_Click(object sender, RoutedEventArgs e)
{
    Task.Delay(3000);
    StatusText.Text = "Loaded!";
}
```

Real, observed result: `StatusText.Text` updates to `"Loaded!"`
**immediately**, with no three-second wait at all. `Task.Delay(3000)`
without `await` still creates and starts a real `Task`, but nothing
waits for it to finish — the next line runs immediately, regardless of
the delay task's own progress. Direct, provable proof `await` isn't
decorative syntax around a `Task`-returning call; it's the actual
mechanism that makes execution wait for that `Task` at all.

## Exercises

1. Reproduce the missing-`await` bug from the What Breaks section
   yourself, confirming the real immediate update, then restore `await`
   and confirm the real three-second wait returns.
2. Reproduce the real cross-thread crash from this lesson's third unit,
   then fix it with `Dispatcher.Invoke`, confirming both the crash and
   its fix with your own real run.

## Definition of Done

- [ ] You reproduced the real frozen-window bug from `Thread.Sleep` in
      an event handler.
- [ ] You fixed it with `async`/`await` and confirmed the window stays
      responsive during the identical wait.
- [ ] You can walk through this lesson's own execution trace in your own
      words, naming exactly where the pause and resume happen.
- [ ] You reproduced the real cross-thread `InvalidOperationException`
      and fixed it with `Dispatcher.Invoke`.
- [ ] You completed both exercises.

## Next

[Lesson 23 — Validation and Debugging WPF](lesson-23-validation-and-debugging-wpf.md)
closes this series: catching bad input at the boundary with
`IDataErrorInfo`, and reading a real, deliberately broken binding's error
out of the Output window — the single highest-leverage debugging skill
for any real WPF codebase.
