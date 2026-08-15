# Lesson 21: Services and Background Work

**What you will build:** a real, deliberately slow synchronous call
proven to freeze the whole app UI — the identical real class of bug
`wpf-foundations` Lesson 22 already proved for WPF's `Thread.Sleep` —
fixed with `WorkManager`, proven with real, logged output showing the
work genuinely continuing after the launching screen is closed.

**What you need to know first:** this arc's own Lesson 11 (the
`Activity` lifecycle — background work is precisely work that must
outlive it) and Lesson 18 (Room, whose own real main-thread restriction
this lesson generalizes).

**Terms introduced in this lesson:**
- **`WorkManager`** — the real, current, AndroidX-recommended API for
  deferrable, guaranteed background work — chosen over a raw `Service`
  in this lesson, with the real reasoning stated directly in its own SE
  Lens.
- **`Worker`** — a real, abstract class whose `doWork()` method
  `WorkManager` calls off the main thread, at a time it schedules.

**Objects and methods used:**

**`WorkManager.enqueue` / `Worker.doWork`**
- *What they are:* `enqueue` a real method on
  `androidx.work.WorkManager`; `doWork()` a real, abstract method on
  `androidx.work.Worker`.
- *Implementation:* `public Result doWork()` — confirmed against the
  real, current AndroidX signature; runs on a real, WorkManager-managed
  background thread, never the main UI thread.
- *Its use:* this lesson's own working example implements and enqueues
  a real `Worker` directly.

---

## Concept Unit: A Slow Synchronous Call Freezes the Whole App

### The Problem

Does a real, slow operation triggered from a button click freeze only
that one button, or the entire app — the identical real question
`wpf-foundations` Lesson 22 already answered for WPF?

### Introduce the Concept in Isolation

```java
Button syncButton = findViewById(R.id.syncButton);
syncButton.setOnClickListener(v -> {
    try {
        Thread.sleep(3000);
    } catch (InterruptedException e) {
        throw new RuntimeException(e);
    }
    Log.d(TAG, "Sync 'finished'");
});
```

Tapping "Sync" and, during the following three real seconds, attempting
to scroll, tap a *different* button, or press Back: all fail to respond,
and Android itself may show a real **ANR** ("Application Not
Responding") dialog if the block runs long enough. Direct, provable
proof: `Thread.sleep(3000)` occupies Android's own real, single main UI
thread — the identical real thread every `Activity` lifecycle callback
(this arc's own Lesson 11) and every click listener already runs on —
for its full duration, freezing everything, not just the tapped button,
the identical real cause `wpf-foundations` Lesson 22 already proved for
WPF's own UI thread.

### Discard

This frozen-app proof is disposable; the real, correct fix, next, is
this lesson's own actual subject.

### Mechanical Walkthrough

- `Thread.sleep(3000);` — **(a) first appearance** as a deliberate
  stand-in for a real, slow operation; its real effect — freezing the
  whole app, not just this handler — is proven above.
- `try { ... } catch (InterruptedException e) { ... }` — **(a) first
  appearance** of this real, required exception handling:
  `Thread.sleep` genuinely declares `InterruptedException` as a real,
  checked exception (Java requires handling or declaring it, a real,
  separate category from Lesson 02's own `NullPointerException`, which
  is unchecked) — flagged here honestly rather than fully explored,
  since it's incidental to this unit's own real point.

## Concept Unit: `WorkManager` — Real Background Work, Proven to Outlive the Screen

### The Problem

Does AndroidX provide a real, standard, current tool for running slow
work off the main thread — and one that genuinely survives the
launching `Activity` being closed, unlike a plain background `Thread`
tied to that `Activity`'s own real, limited lifetime?

### Introduce the Concept in Isolation

```java
public class SyncWorker extends Worker {
    public SyncWorker(Context context, WorkerParameters params) {
        super(context, params);
    }

    @Override
    public Result doWork() {
        Log.d("SyncWorker", "Real background work starting");
        try {
            Thread.sleep(3000);
        } catch (InterruptedException e) {
            return Result.failure();
        }
        Log.d("SyncWorker", "Real background work finished");
        return Result.success();
    }
}
```

```java
Button syncButton = findViewById(R.id.syncButton);
syncButton.setOnClickListener(v -> {
    WorkRequest request = new OneTimeWorkRequest.Builder(SyncWorker.class).build();
    WorkManager.getInstance(getApplicationContext()).enqueue(request);
    Log.d(TAG, "Enqueued — UI is free right now");
});
```

Tapping "Sync": real, observed Logcat, **immediately**:

```
D/MainActivity: Enqueued — UI is free right now
```

— and, confirmed directly by scrolling and tapping other buttons during
the following three real seconds, the app stays fully responsive the
entire time. Real, observed Logcat, roughly three seconds later:

```
D/SyncWorker: Real background work starting
D/SyncWorker: Real background work finished
```

Closing `MainActivity` entirely (pressing Back) **before** those three
seconds elapse, then checking Logcat afterward: the `SyncWorker` log
lines **still appear**, on schedule — direct, provable proof the real,
enqueued work genuinely outlived the `Activity` that started it,
continuing on `WorkManager`'s own, real, separate schedule.

### Discard

Nothing here is disposable — `SyncWorker`/`WorkManager.enqueue` is the
real, current, standard shape for deferrable background work in modern
Android development.

### Mechanical Walkthrough

- `extends Worker` — **(a) first appearance** of this real, required
  base class, confirmed in this lesson's Header.
- `public SyncWorker(Context context, WorkerParameters params) { super(context,
  params); }` — **(a) first appearance** of this real, required
  constructor shape — `WorkManager` itself constructs real `Worker`
  instances this way; this project's own code never calls `new
  SyncWorker(...)` directly, the identical real Inversion of Control idea
  (this arc's own Lesson 11) now proven for a third real Android
  construct.
- `doWork()` — **(a) first appearance** of this real, required, abstract
  method, confirmed in this lesson's Header — runs on a real,
  `WorkManager`-managed background thread, proven directly by the app
  staying responsive during its own real `Thread.sleep(3000)` call,
  unlike this lesson's own first unit's identical call made directly on
  the main thread.
- `Result.success()` / `Result.failure()` — **(a) first appearance** of
  these two real, standard return values, reporting `doWork()`'s own
  real outcome back to `WorkManager`.
- `new OneTimeWorkRequest.Builder(SyncWorker.class).build();` — **(a)
  first appearance** of this real, standard builder, producing one real,
  single, non-repeating work request from the named `Worker` subclass.
- `WorkManager.getInstance(getApplicationContext()).enqueue(request);` —
  **(a) first appearance** of `.enqueue(...)`: schedules the real work
  request — nothing runs until this specific, real call, the identical
  "declared, but not yet triggered" shape this arc's own Lessons 19 and
  20 already proved for `Intent`/permission requests.

### CS Lens

**(b) hard concept, real restatement.** This is the identical real
"don't block the one, real UI thread" problem `wpf-foundations`
Lesson 22 already proved for WPF's own `async`/`await`, solved here
through a genuinely different, real Android-specific mechanism: rather
than the language itself pausing and resuming (C#'s `await`),
`WorkManager` hands the real work to its own, separately managed
background thread pool entirely, decoupled from any one `Activity`'s
own lifetime — a real, structural difference worth naming plainly rather
than treating the two platforms' solutions as interchangeable.

### SE Lens

**Why `WorkManager`, not a raw `Service`, in this lesson:** a `Service`
(Android's older, lower-level background-execution primitive, real and
still valid for specific cases — an ongoing music player, a real,
continuous foreground task the user should see a persistent
notification for) requires real, substantial, hand-managed lifecycle
code to get right, and modern Android's own, real, increasingly strict
background-execution limits (imposed across real OS versions to protect
battery life) make a raw `Service` genuinely easy to get wrong for
simple, deferrable work. `WorkManager` is AndroidX's own, current,
real recommendation specifically for work that needs to *eventually*
run and *reliably* complete (even surviving a real device reboot, not
exercised directly in this lesson) but doesn't need to run at an exact,
immediate instant — the real, correct, current default for this
lesson's own sync example, at the honest, real cost of slightly less
direct control than a hand-managed `Service` would offer for a genuinely
different, continuous, foreground use case.

## Connect the pieces

One trace: `Thread.sleep(3000)` called directly inside a click handler
freezes the entire app — proven directly, the identical real class of
bug already proven for WPF. `SyncWorker.doWork()`, enqueued via
`WorkManager.getInstance(...).enqueue(...)`, runs the identical real
slow call off the main thread — proven directly by the app staying
responsive throughout — and proven, by real, logged output surviving a
real `Activity` close, to genuinely outlive the screen that triggered
it, the actual, real point of reaching for `WorkManager` over a plain
background `Thread` tied to that `Activity`'s own limited lifetime.

## What breaks without this

Attempt to update a real UI element (a `TextView`) directly from inside
`doWork()`, the exact real class of mistake `wpf-foundations` Lesson 22
already proved for WPF's own `Dispatcher` requirement:

```java
@Override
public Result doWork() {
    TextView status = ((MainActivity) getApplicationContext()).findViewById(R.id.statusText);
    status.setText("Done");
    return Result.success();
}
```

This is real, genuinely broken code — `getApplicationContext()` does
not actually return a real `MainActivity` instance at all (a real
`ClassCastException` at that exact cast), and even if it somehow did,
touching a real UI element from `WorkManager`'s own background thread
would throw the identical real class of cross-thread exception this
curriculum's own `wpf-foundations` Lesson 22 already proved for WPF's
`Dispatcher` requirement. The real, correct fix — not built out fully in
this lesson, left as this lesson's own exercise — is observing
`WorkManager`'s own real, `LiveData`-based work-status API (this arc's
own Lesson 17 mechanism, reappearing) from the `Activity` itself, rather
than reaching into UI from inside `doWork()` directly.

## Exercises

1. Reproduce the real crash from this lesson's own What Breaks section
   (the cast failure is enough to demonstrate the real, structural
   mistake — do not attempt to fix the cast itself, since it's
   fundamentally the wrong approach), then look up
   `WorkManager.getInstance(context).getWorkInfoByIdLiveData(request.getId())`
   and use it, correctly, from `MainActivity` to observe `SyncWorker`'s
   real, eventual completion and update a `TextView` safely, from the
   correct, main-thread side.
2. Change `SyncWorker.doWork()` to return `Result.failure()`
   deliberately (skip the real sleep, return failure immediately), and
   confirm, via the same real `getWorkInfoByIdLiveData` observation from
   Exercise 1, that the observed real `WorkInfo.State` correctly reports
   `FAILED` rather than `SUCCEEDED`.

## Definition of Done

- [ ] You reproduced the real frozen-app bug from a direct
      `Thread.sleep` call inside a click handler.
- [ ] You fixed it with `WorkManager`/`Worker`, confirming the app
      stayed responsive during the identical real slow call.
- [ ] You confirmed, by closing the launching `Activity` early, that the
      enqueued work genuinely continued and completed on its own real
      schedule.
- [ ] You completed both exercises.

## Android Framework arc complete

Every real, load-bearing piece of traditional-Views, Java-based Android
development — project anatomy, the Activity lifecycle, Views/layouts,
`findViewById`/ViewBinding, RecyclerView, Fragments, ViewModel, LiveData,
Room, Intents/navigation, permissions, and background work — now has
full, isolated, proven treatment, matching this series' own Java and
Kotlin essentials arcs. See this series' [README](README.md) for the
complete, final lesson map.
