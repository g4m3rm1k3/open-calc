# Lesson 69: ANR (Application Not Responding)

**What you will build:** A real Android contract, read directly —
nothing here compiles with plain `javac`.

**What you need to know first:** Lesson 60's main thread constraint.

**Terms introduced in this lesson:**

- **ANR (Application Not Responding)** — Android detects when the main
  thread's event loop hasn't returned to process the next task in time
  and shows a system "not responding" dialog — the direct, real
  consequence of running slow work on that thread.

---

## Concept Unit: ANR (Application Not Responding)

### The Problem

Lesson 60 established the main thread UI constraint as a rule, and named
the exceptions Room and `RecyclerView` themselves throw when violated —
but neither of those exceptions is what actually happens when slow
work runs directly on the main thread *without* tripping one of those
specific, code-level checks. Something else, at the OS level, detects
this specific failure and reacts to it.

### Introduce the Concept in Isolation

This is not a throwaway lab — it's a real, documented Android platform
behavior, verified against the actual framework mechanism:

```java
// Directly on the main thread — no background thread, no
// ExecutorService (Lesson 60) — this blocks Lesson 59's own event loop
// for its entire five-second duration:
Thread.sleep(5000);
```

This is `ANR` (Application Not Responding) — **first appearance**:
Android detects when the main thread's event loop hasn't returned to
process the next task in time and shows a system "not responding"
dialog — the direct, real consequence of running slow work on that
thread. `Thread.sleep(5000)` called directly here blocks the main
thread's own event loop (Lesson 59) from returning to pull its next
queued task for the full five seconds; past Android's own threshold
(historically around five seconds for a foreground Activity), the OS
itself detects the loop hasn't returned and shows a real, system-level
"App isn't responding" dialog, offering the user a choice to wait or
force-close the app.

### Discard the Throwaway Example

Nothing here is a throwaway lab to discard — this is a real, documented
Android platform behavior.

### Mechanical Walkthrough

1. `Thread.sleep(5000);` called directly on the main thread — **(b)
   reappearing** from Lesson 59's own `Thread.sleep` call, but here run
   directly on the thread the event loop itself needs back.
2. The main thread's own event loop (Lesson 59) cannot return to pull its
   next queued task — every pending click, redraw, or callback is stuck
   waiting behind this one blocking call.
3. Once Android's own internal watchdog detects the main thread hasn't
   returned within its threshold, it shows the real ANR dialog — a
   system-level response, entirely independent of whether the blocking
   code ever throws an exception of its own.

### CS Lens

ANR is not a bug in any one app's code path — it's the OS itself
detecting a symptom (the main thread's event loop failing to return in
time) and reacting at the platform level, regardless of *why* the thread
is blocked. This is the real, concrete consequence Lesson 60's own main
thread constraint exists to prevent: Room and `RecyclerView` each throw
their own specific exception for their own specific violation, but
*any* sufficiently long blocking call on the main thread — a network
call, a tight loop, this lesson's own `Thread.sleep` — risks the exact
same platform-level ANR, whether or not any framework-specific exception
would have caught it first.

Also recognized in: "unresponsive script" warnings in web browsers (a
similar watchdog detecting a blocked main/UI thread), watchdog timers in
embedded systems generally — the same underlying pattern of an external
monitor detecting an unresponsive process and intervening.

### SE Lens

The alternative — trusting that only Room's or `RecyclerView`'s own
specific exceptions need to be avoided, and treating the main thread
constraint as satisfied once those are handled — was not chosen because
ANR can be triggered by *any* long-running call on the main thread, not
only the specific framework calls that happen to throw their own
exception; `ExecutorService` (Lesson 60) and `runOnUiThread` together are
the actual, general-purpose discipline that prevents ANR, regardless of
which specific slow call would have caused it.

---

## Connect the Pieces

Lesson 60 established the main thread UI constraint as a rule, with Room
and `RecyclerView` each enforcing their own specific piece of it via
their own specific exceptions. ANR is the real, observable, platform-level
consequence the constraint exists to prevent in the first place — not
limited to those two specific exceptions, but triggered by any
sufficiently long block on the main thread's own event loop (Lesson 59),
proving the constraint was never a hypothetical rule to begin with.

## What Breaks Without This

Running any sufficiently slow operation directly on the main thread —
not only a Room query or a `RecyclerView` update, but a tight loop, a
network call, or a call like this lesson's own `Thread.sleep(5000)` —
risks a real, user-visible ANR dialog, independent of whether any
framework-specific exception would have caught the same mistake first.

## Exercises

1. Explain, in your own words, why `Thread.sleep(5000)` on the main
   thread triggers an ANR even though it throws no exception of its own,
   unlike Room's `IllegalStateException` or `RecyclerView`'s
   `CalledFromWrongThreadException` from Lesson 60.
2. Explain, in your own words, why moving this lesson's own
   `Thread.sleep(5000)` call inside an `ExecutorService` task
   (Lesson 60) prevents the ANR.
3. Explain, in your own words, why ANR detection happens at the OS level
   rather than being one more exception thrown by a specific Android
   framework class.

## Definition of Done

- [ ] You can state, without looking back at this lesson, what Android
      detects to trigger an ANR.
- [ ] You can explain why ANR is a broader, platform-level consequence
      than Room's or `RecyclerView`'s own specific main-thread exceptions
      from Lesson 60.
- [ ] You can explain, in your own words, why moving slow work off the
      main thread (Lesson 60) is what actually prevents ANR.
