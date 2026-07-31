# Lesson 60: `ExecutorService`, the Main Thread Constraint, and `runOnUiThread`

**What you will build:** All three units read real Android/Java standard
library code directly.

**What you need to know first:** Lesson 46's `RecyclerView.Adapter`,
Lesson 59's thread, event loop, and Object Pool Pattern.

**Terms introduced in this lesson:**

- **`ExecutorService`** — a standard-library abstraction managing a pool
  of reusable background threads, submitting tasks to run on them instead
  of creating and destroying a raw `Thread` per task.
- **Main thread UI constraint** — every read or write of an on-screen
  view must happen on the app's one main thread; touching a view from
  any other thread is not merely discouraged but produces a real, visible
  crash.
- **`runOnUiThread`** — a method that hands a piece of code back to the
  main thread's own event loop for execution, used to safely deliver a
  background thread's results to the screen.

---

## Concept Unit: `ExecutorService`

### The Problem

Real database work happens repeatedly — every launch's load, every item
added. Lesson 59's own `new Thread(...)`, called fresh every single time,
would repeatedly pay real, measurable thread-construction cost for work
that recurs constantly, exactly the waste the Object Pool Pattern
(Lesson 59) was introduced to avoid.

### Introduce the Concept in Isolation

This is not a throwaway lab — it's real Java standard library code,
verified against the actual `java.util.concurrent` source:

```java
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

ExecutorService executor = Executors.newFixedThreadPool(2);

executor.submit(() -> {
    List<Item> items = loadItemsFromDatabase();
    System.out.println("Loaded " + items.size() + " items on a background thread.");
});
```

This is `ExecutorService` — **first appearance**: a standard-library
abstraction managing a pool of reusable background threads, submitting
tasks to run on them instead of creating and destroying a raw `Thread`
per task. `Executors.newFixedThreadPool(2)` builds a real Object Pool
(Lesson 59) of exactly two reusable threads, up front; every later
`executor.submit(...)` call hands a task to one of those *existing*
threads rather than constructing a new one.

### Discard the Throwaway Example

Nothing here is a throwaway lab to discard — this is real, verified Java
standard library code.

### Mechanical Walkthrough

1. `Executors.newFixedThreadPool(2)` — **(a) first appearance**:
   constructs exactly two real threads up front — **(b) reappearing**
   the same Object Pool Pattern shape from Lesson 59's own
   `ConnectionPool`.
2. `executor.submit(() -> { ... });` — **(a) first appearance**: hands
   the given task to one of the pool's existing threads to run — no new
   `Thread` is constructed for this call.
3. A second, later `executor.submit(...)` call (not shown) would reuse
   one of the same two pooled threads, exactly as `ConnectionPool
   .borrow()` reused an existing `ExpensiveConnection` in Lesson 59.

### CS Lens

`ExecutorService` names directly why a real app doesn't spin up a brand-
new `Thread` for every single database operation: it's Lesson 59's own
Object Pool Pattern, applied specifically to threads, provided ready-made
by the standard library rather than hand-written.

Also recognized in: thread pools across virtually every mainstream
language's own standard library or runtime (`ThreadPoolExecutor` in Java,
thread pools in .NET, worker pools in many web server frameworks).

### SE Lens

The alternative — `new Thread(...)` for every single background
operation, as Lesson 59's own isolated example did — was not chosen for
real, recurring work because repeated thread construction/destruction
carries real, measurable OS-level cost; `ExecutorService` pays that cost
once, up front, and reuses the same threads for every later task.

---

## Concept Unit: Main Thread UI Constraint

### The Problem

Room (Lesson 56) refuses to run a database query directly on the same
thread responsible for the screen at all, and `RecyclerView` (Lesson 46)
refuses to be updated from any other thread — both are the same
underlying rule, encountered from two different directions, and neither
is merely a style guideline.

### Introduce the Concept in Isolation

This is not a throwaway lab — it's a real, documented Android rule,
verified against the actual framework source:

```java
// Running database work directly here, on the main thread, is rejected
// by Room itself at runtime with a real, visible crash:
List<Item> items = database.itemDao().getAll(); // IllegalStateException

// Updating RecyclerView's adapter from a background thread is also
// rejected, with a different but equally real crash:
executor.submit(() -> {
    adapter.notifyDataSetChanged(); // CalledFromWrongThreadException
});
```

This is the `main thread UI constraint` — **first appearance**: every
read or write of an on-screen view must happen on the app's one main
thread; touching a view from any other thread is not merely discouraged
but produces a real, visible crash. Room enforces the same underlying
rule from the opposite direction: it refuses to run genuinely slow
database work *on* the main thread at all, specifically to keep that
thread's own event loop (Lesson 59) free to keep processing UI callbacks
without freezing.

### Discard the Throwaway Example

Nothing here is a throwaway lab to discard — this is a real, documented
Android rule.

### Mechanical Walkthrough

1. `database.itemDao().getAll();` called directly on the main thread —
   **(a) first appearance**: Room detects this and throws a real
   `IllegalStateException` rather than silently running the query and
   risking freezing the event loop.
2. `adapter.notifyDataSetChanged();` called from inside
   `executor.submit(...)`'s own background-thread task — **(a) first
   appearance**: `RecyclerView` detects this and throws a real
   `CalledFromWrongThreadException`, since only the main thread is
   permitted to touch its views at all.

### CS Lens

Both crashes are the same underlying rule enforced from two directions:
Room protects the main thread's event loop from being blocked by slow
work; `RecyclerView` protects its own view state from being mutated by a
thread other than the one the event loop itself runs on. Recognizing
"this is one rule, not two separate ones" is the transferable insight.

Also recognized in: UI-thread affinity rules across virtually every
mainstream UI framework (Swing's own Event Dispatch Thread, iOS's main
thread requirement for UIKit) — the same underlying constraint,
enforced by a different framework each time.

### SE Lens

The alternative — allowing views to be touched from any thread, or
allowing slow work to run on the main thread without restriction — was
not chosen because it would reintroduce exactly the two failure modes
this constraint prevents: a frozen UI from slow main-thread work, or
data races from multiple threads mutating the same view state
concurrently.

---

## Concept Unit: `runOnUiThread`

### The Problem

Background database work (via `ExecutorService`) can safely read and
write the database off the main thread — but its results still need to
reach the screen eventually, and the main thread UI constraint forbids
updating `RecyclerView`'s adapter directly from that same background
thread.

### Introduce the Concept in Isolation

This is not a throwaway lab — it's real Android code, verified against
the actual framework source:

```java
executor.submit(() -> {
    List<Item> items = database.itemDao().getAll();

    runOnUiThread(() -> {
        adapter.updateItems(items);
        adapter.notifyDataSetChanged();
    });
});
```

This is `runOnUiThread` — **first appearance**: a method that hands a
piece of code back to the main thread's own event loop for execution,
used to safely deliver a background thread's results to the screen.
`database.itemDao().getAll()` runs safely on the background thread,
respecting Room's own half of the main thread constraint; `runOnUiThread
(() -> { ... })` then hands `adapter`'s update back to the main thread's
event loop (Lesson 59) — the *only* place `RecyclerView` permits its own
views to be touched.

### Discard the Throwaway Example

Nothing here is a throwaway lab to discard — this is real, verified
Android code.

### Mechanical Walkthrough

1. `executor.submit(() -> { ... });` — **(b) reappearing**
   `ExecutorService` call from this lesson's own first unit, running the
   real database query off the main thread.
2. `List<Item> items = database.itemDao().getAll();` — **(b) reappearing**
   Room `@Dao` call from Lesson 56, now safely run on a background
   thread rather than the main thread.
3. `runOnUiThread(() -> { adapter.updateItems(items);
   adapter.notifyDataSetChanged(); });` — **(a) first appearance**: hands
   this exact block of code to the main thread's own event loop, to run
   there instead of on the current background thread.
4. `adapter.notifyDataSetChanged();` — **(b) reappearing**
   `RecyclerView.Adapter` call from Lesson 46, now safely executed on the
   main thread, satisfying the constraint this lesson's own previous unit
   established.

### CS Lens

`runOnUiThread` is a real, concrete bridge between two threads,
connecting directly to Lesson 59's own event loop: the code passed to it
doesn't run immediately, on the calling background thread — it's queued
onto the main thread's own event loop, and runs only once that loop
reaches it, exactly like any other queued callback.

Also recognized in: `Handler.post(...)` (Android's own more general
version of this same mechanism), dispatch-to-main-thread APIs across
virtually every mainstream UI framework (`DispatchQueue.main.async` in
iOS's Swift, `Dispatcher.Invoke` in WPF).

### SE Lens

The alternative — calling `adapter.notifyDataSetChanged()` directly from
inside the background thread's own task, skipping `runOnUiThread`
entirely — was not chosen because it violates the main thread UI
constraint directly, producing the real `CalledFromWrongThreadException`
this lesson's own previous unit demonstrated.

---

## Connect the Pieces

`ExecutorService` provides a real, reused pool of background threads —
Lesson 59's own Object Pool Pattern, applied to threads specifically. The
main thread UI constraint explains *why* that background work can't
simply update the screen directly once finished: Room and `RecyclerView`
enforce the same underlying rule from two directions. And `runOnUiThread`
is the real, concrete bridge connecting the two — handing a background
thread's finished results back to the main thread's own event loop
(Lesson 59), the only place `RecyclerView`'s views may be safely touched.

## What Breaks Without This

Running `database.itemDao().getAll()` directly on the main thread
produces a real, visible `IllegalStateException` crash, per Room's own
enforcement of the main thread constraint. Calling
`adapter.notifyDataSetChanged()` directly from a background thread,
skipping `runOnUiThread`, produces a real
`CalledFromWrongThreadException` crash instead. Both crashes are real,
immediate, and non-negotiable — neither is a style suggestion a
developer could safely ignore.

## Exercises

1. Explain, in your own words, why `Executors.newFixedThreadPool(2)`
   only ever constructs two threads, no matter how many tasks are later
   submitted to it.
2. Explain, in your own words, why Room throws `IllegalStateException`
   for a main-thread query, while `RecyclerView` throws a *different*
   exception (`CalledFromWrongThreadException`) for a background-thread
   view update, even though both enforce the same underlying constraint.
3. Rewrite this lesson's own `runOnUiThread` example so the database
   query itself accidentally runs inside the `runOnUiThread(...)` block
   instead of before it, and explain, in your own words, what real
   problem that reintroduces.

## Definition of Done

- [ ] You read the real `ExecutorService` example and can explain why it
      constructs its threads once, up front.
- [ ] You can state, without looking back at this lesson, why Room's
      `IllegalStateException` and `RecyclerView`'s
      `CalledFromWrongThreadException` are the same underlying rule.
- [ ] You read the real `runOnUiThread` example and can explain what
      would happen if it were removed from the code shown.
