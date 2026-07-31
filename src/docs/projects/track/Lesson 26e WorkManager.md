# Lesson 26e: `WorkManager`

**What you will build:** No new code to compile — this reads real
Android code directly.

**What you need to know first:** Lesson 26d's Background Execution
Limits, Lesson 14d's `ExecutorService`, Lesson 6g's Strategy Pattern.

**Terms introduced in this lesson:**

- **`WorkManager`** — a library for deferrable, guaranteed-eventually
  background work, internally choosing the best underlying scheduling
  mechanism per device so the app doesn't have to.

---

## Concept Unit: `WorkManager`

### The Problem

Manually building "run periodically, survive reboots, respect Doze
(battery-saving restrictions), retry on failure, adapt to whichever
Android version this device runs" correctly, by hand, on top of a plain
`Service`, is real, substantial, error-prone work — exactly the kind of
repeated boilerplate this course has already seen centralized elsewhere
(Room's generated DAOs, Lesson 13g; `ListAdapter`, Lesson 20c).

### Introduce the Concept in Isolation

This is not a throwaway lab — it's real Android code, verified against
the actual framework source:

```java
PeriodicWorkRequest syncRequest = new PeriodicWorkRequest.Builder(
    SyncWorker.class, 15, TimeUnit.MINUTES
).build();

WorkManager.getInstance(context).enqueue(syncRequest);
```

```java
public class SyncWorker extends Worker {
    public SyncWorker(Context context, WorkerParameters params) {
        super(context, params);
    }

    @Override
    public Result doWork() {
        syncDataWithServer();
        return Result.success();
    }
}
```

This is `WorkManager` — **first appearance**: a library for deferrable,
guaranteed-eventually background work, internally choosing the best
underlying scheduling mechanism per device so the app doesn't have to.
`new PeriodicWorkRequest.Builder(...)` (Lesson 13d's own builder
pattern) configures the recurring schedule; `WorkManager
.getInstance(context).enqueue(syncRequest)` hands it to the library,
which internally chooses the correct mechanism — a `Service`, an alarm,
or another strategy — for whichever Android version and battery state
the device is actually running under.

### Discard the Throwaway Example

Nothing here is a throwaway lab to discard — this is real, verified
Android code.

### Mechanical Walkthrough

1. `new PeriodicWorkRequest.Builder(SyncWorker.class, 15,
   TimeUnit.MINUTES).build();` — **(b) reappearing** builder pattern
   from Lesson 13d, configuring a recurring work schedule step by step.
2. `WorkManager.getInstance(context).enqueue(syncRequest);` — **(b)
   reappearing** singleton-pattern shape from Lesson 13h (`getInstance`),
   handing the configured request to the library rather than managing a
   `Service` directly.
3. `class SyncWorker extends Worker { ... Result doWork() { ...
   return Result.success(); } }` — **(a) first appearance**: the actual
   work to run, wrapped in a class `WorkManager` itself is responsible for
   invoking correctly, on whatever underlying mechanism it internally
   selects.

### CS Lens

`WorkManager` is Lesson 6g's own Strategy Pattern, real and load-bearing,
at the platform level: the *interface* a developer writes against
(`Worker`/`doWork()`) stays the same regardless of which underlying
strategy (`Service`, `AlarmManager`, `JobScheduler`) `WorkManager` itself
selects for a given Android version and battery state — the strategy is
swapped internally, transparently, without the calling code ever needing
to know or choose.

Also recognized in: task-scheduling libraries across virtually every
platform that must adapt to varying underlying OS capabilities
(background job schedulers in other mobile and desktop frameworks) — the
same "one stable API, multiple internal strategies" shape.

### SE Lens

The alternative — hand-managing a plain `Service`, choosing the correct
underlying mechanism for each Android version and battery state manually
— was not chosen because it's real, substantial, and error-prone work,
repeated by every app that needs reliable background work; `WorkManager`
centralizes that correctness once, in the library, the same reasoning
that motivated `ListAdapter` (Lesson 20c) and Room's generated DAOs
(Lesson 13g).

---

## Connect the Pieces

`Service` (Lesson 26c) is a real, distinct Android component kind — code
with no window, for work that must run independent of any visible
screen. Background execution limits (Lesson 26d) are the real,
platform-enforced cost of that: the OS itself can stop a plain `Service`
at any time, regardless of its own code. `WorkManager` is the real,
load-bearing answer, correctly handling scheduling, retries, reboots,
and version/battery adaptation once, in the library — Lesson 6g's own
Strategy Pattern, applied at the platform level, so calling code only
ever writes a `Worker`'s own `doWork()`.

## What Breaks Without This

Relying on a plain, manually-started `Service` for work that must
reliably recur risks the OS stopping it at any time, with no guarantee it
resumes — a real, observed failure on modern Android versions, not a
hypothetical one.

## Exercises

1. Explain, in your own words, why `startService(...)` alone offers no
   guarantee of continued execution on a modern Android version,
   connecting your answer to Lesson 26d's own material.
2. Explain, in your own words, how `WorkManager`'s own
   `Worker`/`doWork()` contract matches Lesson 6g's own Strategy Pattern
   material.
3. Change `15, TimeUnit.MINUTES` to a different interval and explain, in
   your own words, what changes about `SyncWorker`'s own behavior.

## Definition of Done

- [ ] You read the real `WorkManager`/`Worker` example and can explain
      what it handles that a hand-managed `Service` would not.
- [ ] You completed Exercise 2.
- [ ] You can state, without looking back at this lesson, why
      `WorkManager` is described as an instance of the Strategy Pattern.
