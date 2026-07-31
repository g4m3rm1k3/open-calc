# Lesson 66: `Service`, Background Execution Limits, and `WorkManager`

**What you will build:** All three units read real Android mechanisms
directly.

**What you need to know first:** Lesson 11's Android Manifest, Lesson
46's Strategy Pattern, Lesson 59's thread, Lesson 60's `ExecutorService`.

**Terms introduced in this lesson:**

- **`Service`** — a fourth kind of app component, distinct from
  `Activity`, `ContentProvider`, and `BroadcastReceiver`, running code
  with no window or UI of its own, declared in the Manifest like an
  Activity, for work that needs to run without any visible screen.
- **Background execution limits** — OS-enforced restrictions on what a
  background component may do and for how long, tightened across Android
  versions specifically to protect battery life and system responsiveness.
- **`WorkManager`** — a standard library built on top of `Service`
  internally, scheduling deferred, guaranteed background work that
  survives reboots and automatically adapts its strategy to whichever
  Android version and battery state the device is actually running under.

---

## Concept Unit: `Service`

### The Problem

Every background operation this curriculum has shown so far — Room
queries (Lesson 56), `ExecutorService` tasks (Lesson 60) — has been tied
directly to a visible screen's own lifecycle. Nothing in this app does
anything at all while it's fully closed; some real work (a long file
download, syncing data periodically) needs to keep running independent
of whether any screen is currently open.

### Introduce the Concept in Isolation

This is not a throwaway lab — it's a real component contract, verified
against the actual Android framework source:

```java
public class SyncService extends Service {
    @Override
    public int onStartCommand(Intent intent, int flags, int startId) {
        executor.submit(() -> {
            syncDataWithServer();
            stopSelf();
        });
        return START_NOT_STICKY;
    }

    @Override
    public IBinder onBind(Intent intent) {
        return null;
    }
}
```

This is `Service` — **first appearance**: a fourth kind of app
component, distinct from `Activity`, `ContentProvider`, and
`BroadcastReceiver`, running code with no window or UI of its own,
declared in the Manifest (Lesson 11) like an Activity, for work that
needs to run without any visible screen. `SyncService` `extends`
(Lesson 05) `Service`, and `onStartCommand` is where it does its actual
work — no `setContentView`, no view tree (Lesson 41) at all, since a
`Service` has no window of its own to draw into.

### Discard the Throwaway Example

Nothing here is a throwaway lab to discard — this is a real, verified
framework contract.

### Mechanical Walkthrough

1. `public class SyncService extends Service` — **(b) reappearing**
   inheritance shape from Lesson 05, this time extending Android's real
   `Service` base class — the fourth component kind this curriculum has
   now shown, after `Activity` (Lesson 10), `ContentProvider` (Lesson
   12), and `BroadcastReceiver` (Lesson 14).
2. `onStartCommand(Intent intent, int flags, int startId)` — **(a) first
   appearance**: called when something starts this `Service`; unlike
   `BroadcastReceiver`'s own single, brief `onReceive`, a `Service` can
   keep running after this method returns.
3. `executor.submit(() -> { syncDataWithServer(); stopSelf(); });` —
   **(b) reappearing** `ExecutorService` call from Lesson 60, doing the
   actual work off the main thread, then calling `stopSelf()` once
   finished — a `Service`, unlike a `BroadcastReceiver`, must explicitly
   stop itself when its work is done.
4. `onBind(Intent intent) { return null; }` — **(a) first appearance**:
   required by the `Service` contract, but returning `null` here since
   this particular `Service` is only ever started, never bound to
   directly by another component.

### CS Lens

`Service` is the genuine fourth Android component kind: `Activity` has a
window and a rich, multi-step lifecycle (Lesson 10); `ContentProvider`
mediates data access (Lesson 12); `BroadcastReceiver` reacts briefly to
one event with no lifecycle of its own (Lesson 14); `Service` runs real,
possibly longer-lived work with no window at all. Each of the four
solves a genuinely different shape of problem.

Also recognized in: background services/daemons across virtually every
mainstream operating system — a unit of running code with no user-facing
window, doing work independent of any particular screen.

### SE Lens

The alternative — running all background work only while some Activity
happens to be open, as every previous lesson's material has done — was
not chosen for work that genuinely needs to continue regardless of
whether any screen is currently visible; `Service` is the component kind
built specifically for that case.

---

## Concept Unit: Background Execution Limits

### The Problem

A plain started `Service`, once running, is not free to run forever: the
OS can, and does, stop it within moments of the app leaving the
foreground, on modern Android versions — nothing about a plain `Service`
by itself schedules periodic, reliable work that survives this.

### Introduce the Concept in Isolation

This is not a throwaway lab — it's a real, documented Android
restriction, verified against the actual platform behavior:

```java
// Starting a background Service while the app is not in the foreground,
// on a modern Android version, is itself restricted or disallowed —
// this call alone offers no guarantee it will keep running:
startService(new Intent(this, SyncService.class));
```

This is `background execution limits` — **first appearance**:
OS-enforced restrictions on what a background component may do and for
how long, tightened across Android versions specifically to protect
battery life and system responsiveness. `startService(...)` alone offers
no guarantee `SyncService` will keep running once the app leaves the
foreground — the OS itself can, and routinely does, stop it, regardless
of anything `SyncService`'s own code does.

### Discard the Throwaway Example

Nothing here is a throwaway lab to discard — this is a real, documented
Android restriction.

### Mechanical Walkthrough

1. `startService(new Intent(this, SyncService.class));` — **(a) first
   appearance**: starts the `Service`, but on a modern Android version,
   this alone carries no guarantee of continued execution once the app
   leaves the foreground.
2. The OS itself, independent of anything `SyncService`'s own code does,
   can stop this `Service` — the restriction is enforced at the platform
   level, not something a developer can simply code around by writing
   `Service` logic more carefully.

### CS Lens

Background execution limits are a real, deliberate platform-level policy
tradeoff: unrestricted background execution across every installed app
would drain battery and degrade system responsiveness broadly, so the
platform itself restricts it, even at the cost of individual apps needing
a more complex mechanism (this lesson's own next unit) to get reliable
background work done at all.

Also recognized in: background execution restrictions across virtually
every modern mobile OS (iOS's own background task time limits) — the
same underlying tradeoff between individual app capability and
system-wide battery/performance health.

### SE Lens

The alternative — relying on a plain, manually-managed `Service` for
work that must reliably recur or survive reboots — was not chosen
because the OS itself can stop it at any time; correctly handling
"survive being stopped, retry on failure, adapt to whichever Android
version this device runs" by hand, repeatedly, for every app that needs
reliable background work, is real, substantial, error-prone work this
lesson's own next unit exists specifically to avoid repeating.

---

## Concept Unit: `WorkManager`

### The Problem

Manually building "run periodically, survive reboots, respect Doze
(battery-saving restrictions), retry on failure, adapt to whichever
Android version this device runs" correctly, by hand, on top of a plain
`Service`, is real, substantial, error-prone work — exactly the kind of
repeated boilerplate this curriculum has already seen centralized
elsewhere (Room's generated DAOs, Lesson 56; `ListAdapter`, Lesson 64).

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

This is `WorkManager` — **first appearance**: a standard library built
on top of `Service` internally, scheduling deferred, guaranteed
background work that survives reboots and automatically adapts its
strategy to whichever Android version and battery state the device is
actually running under. `new PeriodicWorkRequest.Builder(...)` (Lesson
56's own builder pattern) configures the recurring schedule; `WorkManager
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
   from Lesson 56, configuring a recurring work schedule step by step.
2. `WorkManager.getInstance(context).enqueue(syncRequest);` — **(b)
   reappearing** singleton-pattern shape from Lesson 56 (`getInstance`),
   handing the configured request to the library rather than managing a
   `Service` directly.
3. `class SyncWorker extends Worker { ... Result doWork() { ...
   return Result.success(); } }` — **(a) first appearance**: the actual
   work to run, wrapped in a class `WorkManager` itself is responsible for
   invoking correctly, on whatever underlying mechanism it internally
   selects.

### CS Lens

`WorkManager` is Lesson 46's own Strategy Pattern, real and load-bearing,
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
that motivated `ListAdapter` (Lesson 64) and Room's generated DAOs
(Lesson 56).

---

## Connect the Pieces

`Service` is the fourth, genuinely distinct Android component kind — code
with no window, for work that must run independent of any visible
screen. Background execution limits are the real, platform-enforced cost
of that: the OS itself can stop a plain `Service` at any time, regardless
of its own code. `WorkManager` is the real, load-bearing answer,
correctly handling scheduling, retries, reboots, and version/battery
adaptation once, in the library — Lesson 46's own Strategy Pattern,
applied at the platform level, so calling code only ever writes a
`Worker`'s own `doWork()`.

## What Breaks Without This

Relying on a plain, manually-started `Service` for work that must
reliably recur risks the OS stopping it at any time, with no guarantee it
resumes — a real, observed failure on modern Android versions, not a
hypothetical one. And hand-building "survive reboots, retry on failure,
adapt to Android version and battery state" directly on top of a plain
`Service`, instead of using `WorkManager`, repeats real, substantial,
error-prone work `WorkManager` already exists specifically to centralize.

## Exercises

1. Explain, in your own words, why `SyncService`'s own `onBind` returns
   `null`, connecting your answer to the fact that this `Service` is only
   ever started, never bound to directly.
2. Explain, in your own words, why `startService(...)` alone offers no
   guarantee of continued execution on a modern Android version.
3. Explain, in your own words, how `WorkManager`'s own
   `Worker`/`doWork()` contract matches Lesson 46's own Strategy Pattern
   material.

## Definition of Done

- [ ] You read the real `Service`/`onStartCommand` example and can
      explain what distinguishes it from `Activity` and
      `BroadcastReceiver`.
- [ ] You can state, without looking back at this lesson, why a plain
      `Service` cannot guarantee reliable, recurring background work on
      its own.
- [ ] You read the real `WorkManager`/`Worker` example and can explain
      what it handles that a hand-managed `Service` would not.
