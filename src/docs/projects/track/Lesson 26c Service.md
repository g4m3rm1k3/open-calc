# Lesson 26c: `Service`

**What you will build:** No new code to compile — this reads a real
component contract, verified against the actual Android framework
source.

**What you need to know first:** Lesson 2h's Android Manifest, Lesson
14a's thread.

**Terms introduced in this lesson:**

- **`Service`** — a fourth kind of app component running code with no
  window or UI of its own, declared in the Manifest like an Activity,
  for work that needs to run without any visible screen.

---

## Concept Unit: `Service`

### The Problem

Every background operation this course has shown so far — Room queries
(Lesson 13g), `ExecutorService` tasks (Lesson 14d) — has been tied
directly to a visible screen's own lifecycle. Nothing in this app does
anything at all while it's fully closed; some real work (a long file
download, syncing data periodically) needs to keep running independent
of whether any screen is currently open.

### Introduce the Concept in Isolation

This is not a throwaway lab — it's a real component contract, verified against the actual Android framework source:

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
component running code with no window or UI of its own, declared in the
Manifest (Lesson 2h) like an Activity, for work that needs to run
without any visible screen — distinct from `Activity` and
`ContentProvider` (Lesson 25b), already covered, and from
`BroadcastReceiver`, a fourth component kind a later lesson covers.
`SyncService` `extends` (Lesson 0l) `Service`, and `onStartCommand` is
where it does its actual work — no `setContentView`, no view tree
(Lesson 3a) at all, since a `Service` has no window of its own to draw
into.

### Discard the Throwaway Example

Nothing here is a throwaway lab to discard — this is a real, verified
framework contract.

### Mechanical Walkthrough

1. `public class SyncService extends Service` — **(b) reappearing**
   inheritance shape from Lesson 0l, this time extending Android's real
   `Service` base class.
2. `onStartCommand(Intent intent, int flags, int startId)` — **(a) first
   appearance**: called when something starts this `Service`; unlike a
   brief, single callback, a `Service` can keep running after this
   method returns.
3. `executor.submit(() -> { syncDataWithServer(); stopSelf(); });` —
   **(b) reappearing** `ExecutorService` call from Lesson 14d, doing the
   actual work off the main thread, then calling `stopSelf()` once
   finished — a `Service` must explicitly stop itself when its work is
   done.
4. `onBind(Intent intent) { return null; }` — **(a) first appearance**:
   required by the `Service` contract, but returning `null` here since
   this particular `Service` is only ever started, never bound to
   directly by another component.

### CS Lens

`Service` runs real, possibly longer-lived work with no window at all —
a genuinely different shape of problem from `Activity`'s own rich,
multi-step, window-owning lifecycle (Lesson 2f) or `ContentProvider`'s
own data-mediation role (Lesson 25b).

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

## Connect the Pieces

`Service` runs code with no window, independent of any visible screen.
The next lesson shows the real, platform-enforced cost of that freedom.

## What Breaks Without This

Running all background work only while some Activity happens to be open
means nothing in the app does anything at all once every screen is
closed — work that genuinely needs to continue regardless has nowhere
to run.

## Exercises

1. Explain, in your own words, why `SyncService`'s own `onBind` returns
   `null`, connecting your answer to the fact that this `Service` is only
   ever started, never bound to directly.
2. Explain, in your own words, why `stopSelf()` is called explicitly
   inside the submitted task, rather than left for the OS to figure out
   on its own.
3. Explain, in your own words, why `Service` has no view tree, connecting
   your answer to Lesson 3a's own material.

## Definition of Done

- [ ] You read the real `Service`/`onStartCommand` example and can
      explain what distinguishes it from `Activity`.
- [ ] You completed Exercise 1.
- [ ] You can state, without looking back at this lesson, what kind of
      work `Service` is built for.
