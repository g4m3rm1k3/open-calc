# Lesson 14: The Main Thread Cannot Wait — Threading, ANRs, and Executors

**What you will build:** Nothing new user-facing — this lesson goes
back and fully explains the `ExecutorService`/`runOnUiThread` machinery
Lesson 13 introduced at the minimum depth needed to make Room work, by
deliberately triggering a real ANR (Application Not Responding) dialog
and a real cross-thread crash, on purpose, then fixing both correctly.
The transferable problem: every single line of code this project has
written since Lesson 2 — every `onCreate`, every click listener — has
silently run on one specific thread the whole time, and nothing forced
you to notice. This lesson makes that thread visible, shows exactly
what happens when you make it wait, and gives you the vocabulary
(`Thread`, `Looper`, `Executor`) to reason about concurrency instead of
just copying a pattern that happened to work.

**What you need to know first:** Lesson 2 (the OS calling your
Activity's methods — this lesson is about *which* thread makes those
calls), Lesson 13 (`ExecutorService`, `runOnUiThread`, used but not yet
explained).

---

## Concept Unit: The Main Thread Is a Queue, Continuously Drained

### The Problem

Lesson 2 established that Android calls `onCreate`, and Lesson 4
established that Android calls your click listener when the user taps
a button. Both of those are true — but *what*, mechanically, is doing
the calling, and why can only one of them ever run at a time (you've
never seen two callbacks execute simultaneously in this project)?

### Introduce the Concept in Isolation

The mechanism is genuinely simple once isolated from Android
entirely — a loop that continuously pulls tasks off a queue and runs
them, one at a time, forever:

```java
import java.util.LinkedList;
import java.util.Queue;

public class LooperDemo {
    public static void main(String[] args) throws InterruptedException {
        Queue<Runnable> taskQueue = new LinkedList<>();
        taskQueue.add(() -> System.out.println("Task A running"));
        taskQueue.add(() -> System.out.println("Task B running"));
        taskQueue.add(() -> System.out.println("Task C running"));

        while (!taskQueue.isEmpty()) {
            Runnable task = taskQueue.poll();
            task.run();
        }
    }
}
```

```
javac LooperDemo.java
java LooperDemo
```

Output:

```
Task A running
Task B running
Task C running
```

This proves the mechanism: `Runnable` — **first appearance** — is a
single-abstract-method interface (same shape as `OnItemClickListener`,
Lesson 8) whose one method, `run()`, takes no arguments and returns
nothing — a pure "do this later" wrapper. The `while` loop, pulling one
`Runnable` at a time and calling `.run()`, processes them strictly in
order, one fully finishing before the next starts — never two at once.

### Discard the Throwaway Example

Delete `LooperDemo.java`. Android's real main thread runs a class
called `Looper`, backed by a `MessageQueue`, doing exactly this —
continuously pulling and running one task at a time, forever, for the
entire life of your app's process. Every `onCreate` call, every click
listener invocation, every `Log.d` you've written since Lesson 2 has
been one task pulled off that same queue and run to completion before
the next one starts. This is *why* two callbacks never overlap in this
project: there is only ever one thread doing the pulling.

### CS Lens

This is the **event loop** pattern — a single thread continuously
consuming and executing queued units of work. Also recognized in:
JavaScript's own single-threaded event loop (the exact same shape,
different runtime), any GUI toolkit's message pump (Windows' classic
message loop, GTK's main loop), and game engines' per-frame update
loop pulling queued input events.

---

## Concept Unit: Blocking the Loop — a Real ANR, on Purpose

### The Problem

If the main thread is one loop processing one task at a time, what
happens if *one* task simply takes a very long time to finish?

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:** `InventoryActivity.java` (temporary).
- **Change type:** Add, then fully revert.

### The New Code

Temporarily add a fourth button to `activity_inventory.xml` (or reuse
`settingsButton`'s listener briefly — either works; a dedicated
temporary button is cleaner to remove afterward) wired to:

```java
android.util.Log.d("ANRDemo", "Button tapped, about to block");
try {
    Thread.sleep(8000);
} catch (InterruptedException e) {
    e.printStackTrace();
}
android.util.Log.d("ANRDemo", "Finished blocking");
```

### Run It

Run the app, tap the button, and **immediately** try to scroll the
list or tap anything else. Nothing responds — the whole UI is frozen —
because the single main-thread loop from the previous unit is sitting
inside `Thread.sleep(8000)`, unable to pull the *next* task (your
scroll gesture, another tap) off the queue until this one finishes.
Wait roughly 5 seconds without tapping again: Android itself detects
the main thread hasn't returned to its loop in time and shows a system
**"Pocket Inventory isn't responding"** dialog, offering to close the
app — the actual ANR (**A**pplication **N**ot **R**esponding) this
unit is named for, not a hypothetical.

### Discard the Throwaway Example

Delete this block and the temporary button entirely — it never
appears in the project again; Lesson 13's `dbExecutor` pattern is
already the real, permanent fix, now fully motivated by having seen the
failure it prevents.

### Mechanical Walkthrough
- `Thread.sleep(8000)` — **first appearance.** Pauses *the calling
  thread* — here, the main thread, since that's what ran this click
  listener — for the given number of milliseconds, doing no other work
- in the meantime.
- `throws InterruptedException`/`try`/`catch` — the
  compiler requires handling this checked exception (a category
- distinct from the unchecked `NumberFormatException` in Lesson 9 —
  covered again properly if a later lesson needs the distinction; for
  now, know Java forces you to acknowledge this specific possible
  failure at compile time, not just at runtime).

### CS Lens

**This is a hard concept — blocking a single-threaded event loop — and
it recurs constantly:** any system built around one thread processing
a queue is only as responsive as its slowest individual task. Also
recognized in: a Node.js server handling one slow synchronous
computation and freezing every other request in the process, a GUI
event handler doing a slow file read and freezing the whole window
manager's message pump for that app, and any single-threaded game loop
whose per-frame logic occasionally spikes, causing a visible stutter.

### SE Lens

**Why does Android use one single main thread for all UI work instead
of letting any thread touch any view, the way some other frameworks
allow with careful locking?** The alternative — multi-threaded UI
access — sounds more flexible, but introduces exactly the kind of
subtle race conditions between simultaneously-running threads that are
notoriously hard to reproduce and debug (two threads updating the same
view's state at slightly different times, producing an ordering-
dependent bug that only appears occasionally). Confining all UI
mutation to one thread makes an entire category of bugs structurally
impossible, at the direct cost you just witnessed: that one thread
must never be kept busy with anything slow, or the whole UI stalls.

---

## Concept Unit: `Thread` and `Runnable` — the Manual Way, and Why Not

### The Problem

The obvious fix for "don't block the main thread" is: run the slow
work on a *different* thread. Java's most basic tool for that is the
`Thread` class itself, used directly — worth seeing once, to understand
what `ExecutorService` (Lesson 13) is actually saving you from.

### Introduce the Concept in Isolation

```java
public class ThreadDemo {
    public static void main(String[] args) throws InterruptedException {
        System.out.println("Main thread: " + Thread.currentThread().getName());

        Thread worker = new Thread(() -> {
            System.out.println("Worker thread: " + Thread.currentThread().getName());
        });
        worker.start();
        worker.join();

        System.out.println("Main thread again, worker is done");
    }
}
```

```
javac ThreadDemo.java
java ThreadDemo
```

Output:

```
Main thread: main
Worker thread: Thread-0
Main thread again, worker is done
```

This proves two real threads existed, each reporting a different name
via `Thread.currentThread().getName()`, running the same program at
the same time — `worker.start()` doesn't block; `main` could keep
going immediately, and `worker.join()` (explained below) is what makes
`"Main thread again..."` wait until the worker genuinely finishes,
rather than printing out of order.

### Discard the Throwaway Example

Delete `ThreadDemo.java` — the real project doesn't create raw
`Thread` objects directly; the next unit explains why, and Lesson 13's
`ExecutorService` remains the real, permanent tool.

### Mechanical Walkthrough
- `Thread.currentThread().getName()` — **first appearance.** Returns
- the currently-executing thread's name — `"main"` is a fixed, special
  name every Java (and Android) process's initial thread carries.
- `new Thread(() -> { ... })` — **first appearance.** `Thread`'s
- constructor accepts a `Runnable` — the exact same interface labbed
  in this lesson's first unit — describing what the new thread should
  run.
- `worker.start()` — **first appearance.** Actually begins the new
  thread's execution, running its `Runnable` concurrently with
- whatever called `start()` — **not** the same as calling `.run()`
  directly, which would just execute the `Runnable`'s code on the
  *current* thread with no new thread created at all, a common
  first-time mistake worth flagging explicitly.
- `worker.join()` — **first appearance.** Blocks the calling thread
- until `worker` finishes — the deliberate, controlled version of
  "wait for this to be done," in contrast to the *accidental*,
  uncontrolled blocking of the main thread in the previous unit's ANR
- demo.
- `join()` here runs on `main`, which is fine — this is a
  standalone demo, not an Android UI thread with real responsiveness
  requirements.

### SE Lens

**Why does the real project use `ExecutorService.execute(...)` instead
of `new Thread(...).start()` directly, for every piece of background
work?** Creating a real OS thread has genuine, measurable cost —
allocating its stack, registering it with the OS scheduler — and
`InventoryActivity`'s database work (Lesson 13) happens repeatedly:
every launch's initial load, every item added. Spinning up a brand-new
`Thread` object for each one, then discarding it, wastes that setup
cost over and over. An `ExecutorService` backed by a thread *pool*
(the next unit) reuses a small, fixed number of already-created
threads across many submitted tasks — you pay the thread-creation cost
once, not per operation, at the cost of losing the direct, one-object-
per-task simplicity `Thread` gives you.

---

## Concept Unit: `Executors` — Pooling Instead of Creating Ad Hoc

### The Problem

Lesson 13 used `Executors.newSingleThreadExecutor()` without fully
explaining the choice. Now that raw `Thread` cost is understood, the
actual design decision is worth naming directly.

### The Concept, Briefly

`Executors` (the standard-library factory, already used in Lesson 13)
offers several pool shapes: `newSingleThreadExecutor()` — exactly one
background thread, processing submitted tasks strictly one at a time,
in submission order; `newFixedThreadPool(n)` — `n` threads, allowing
that many tasks to run genuinely simultaneously; and others not needed
by this project. `dbExecutor` in `InventoryActivity` deliberately uses
the single-thread version, for a reason directly tied to a loose end
Lesson 13 flagged and left open: `AppDatabase.getInstance`'s
`if (instance == null)` check isn't safe against two threads racing
into it at the exact same instant — but because **every** database
operation this app performs is submitted through this one single-
thread executor, only one background operation involving the database
can ever be in flight at a time, closing that race in practice without
needing `synchronized` (a real locking keyword, out of scope for this
project's needs, but worth knowing exists for whenever true concurrent
access — a `newFixedThreadPool`, for instance — genuinely requires it).

### CS Lens

A thread pool is the **Object Pool pattern** applied specifically to
threads — expensive-to-create resources kept alive and reused across
many requests for work, instead of created and destroyed per request.
Also recognized in: database connection pools (mentioned in Lesson
13's DAO discussion), HTTP client connection reuse (keep-alive), and
game engines pooling bullet/particle objects instead of allocating a
new one every frame.

---

## Concept Unit: Crossing Back — Why Views Demand the Main Thread

### The Problem

Lesson 13's `dbExecutor.execute { ... runOnUiThread { ... } }` pattern
wraps the UI-touching part specifically. What actually happens if that
wrapping is skipped?

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:** `InventoryActivity.java` (temporary).
- **Change type:** Add, then fully revert.

### The New Code

Temporarily change the item-loading block from Lesson 13 to skip
`runOnUiThread`:

```java
dbExecutor.execute(() -> {
    List<Item> loaded = itemDao.getAll();
    items.clear();
    items.addAll(loaded);
    adapter.notifyDataSetChanged();  // called directly from the background thread
});
```

### Run It

Run the app. Read the real crash in Logcat:
`android.view.ViewRootImpl$CalledFromWrongThreadException: Only the
original thread that created a view hierarchy can touch its views.` —
`notifyDataSetChanged()` internally touches the `RecyclerView`'s views
to trigger a re-layout, and the framework itself explicitly checks and
rejects that call the moment it detects it didn't come from the main
thread — this is not a vague race condition you got unlucky with; it's
an immediate, deliberate, always-reproducible guard.

### Discard the Throwaway Example

Restore the `runOnUiThread(...)`-wrapped version from Lesson 13 —
that's the permanent code; this was only ever a demonstration of the
guard it satisfies.

### CS Lens

`CalledFromWrongThreadException` is a concrete instance of a **thread-
confinement invariant, enforced defensively at the boundary** — rather
than allowing unsafe cross-thread access and hoping developers never
trigger the resulting race, the framework actively checks and fails
loudly, immediately, the first time the rule is broken. Also recognized
in: Python's GIL-related restrictions on certain C-extension calls,
database drivers that refuse to share one connection object across
threads, and any framework's explicit `assertOnMainThread()`-style
guard.

---

## Connect the Pieces

Full trace, now fully explained rather than just used: Android's main
thread runs one continuous loop (the `LooperDemo` lab's shape, for
real) pulling and running one task at a time — every lifecycle call,
every click listener, since Lesson 2. Blocking that loop with
`Thread.sleep` froze the entire app and produced a real ANR after
roughly five seconds, proving why Lesson 13's database work couldn't
run there directly. `ExecutorService`'s pooled background thread (not a
raw `Thread` per call, for the cost reasons this lesson named) runs the
slow work off that loop entirely — but touching a `View` from that
background thread is *also* forbidden, enforced immediately by
`CalledFromWrongThreadException`, which is exactly why Lesson 13's
pattern always wraps the UI-touching half in `runOnUiThread`, posting
that work back onto the one thread allowed to do it.

## What Breaks Without This

Already demonstrated twice, on purpose, within this lesson's own
units: the ANR from blocking the main thread directly, and
`CalledFromWrongThreadException` from touching a view off the main
thread. Both were reverted immediately after observing them — no
further break-it exercise needed this lesson.

## Exercises

1. In the `ThreadDemo` lab, remove `worker.join()` and rerun it several
   times. Because there's no `join()`, `"Main thread again, worker is
   done"` and `"Worker thread: Thread-0"` are now racing — predict, and
   then observe, whether the output order stays consistent across
   multiple runs. This is a direct, hands-on demonstration of why
   unsynchronized concurrent output ordering can't be relied upon.
2. Change `dbExecutor` in `InventoryActivity` from
   `Executors.newSingleThreadExecutor()` to
   `Executors.newFixedThreadPool(4)` and add several rapid taps of "+
   Add Item" in a row (save several items quickly). Nothing should
   visibly break for this project's simple insert pattern — but think
   through, and write down for yourself, a scenario involving two
   *simultaneous* writes where a fixed pool of more than one thread
   genuinely could cause a problem a single-thread executor
   structurally couldn't. Revert to `newSingleThreadExecutor()`
   afterward — it remains the correct choice for this project.

## Definition of Done

- [ ] You ran the `LooperDemo` lab and can explain the main thread as a
      queue-processing loop in your own words.
- [ ] You triggered a real ANR dialog on purpose by blocking the main
      thread, and reverted the code afterward.
- [ ] You ran the `ThreadDemo` lab and can explain the difference
      between `.start()` and calling `.run()` directly.
- [ ] You triggered a real `CalledFromWrongThreadException` on purpose
      and can explain why `runOnUiThread` fixes it.
- [ ] You can explain, using your own words, why `dbExecutor` in this
      project uses a single-thread executor rather than a raw `Thread`
      per call or a larger pool.
- [ ] Commit: message explaining why (e.g. "No production change this
      lesson — deliberately triggered and explained the ANR and
      cross-thread-access failures that Lesson 13's ExecutorService/
      runOnUiThread pattern exists to prevent").

Lesson 15 is next: `items` and `adapter` still live as plain fields on
`InventoryActivity`, which means Lesson 5's rotation problem never
actually went away for anything except that one `tapCount` — `ViewModel`,
and state that survives configuration changes without a hand-written
`Bundle` rescue for every single field.
