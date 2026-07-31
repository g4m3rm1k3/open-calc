# Lesson 31c: `IdlingResource`

**What you will build:** No new code to compile — this reads real
Android testing code directly.

**What you need to know first:** Lesson 31b's Instrumented UI Testing,
Lesson 14d's `ExecutorService`.

**Terms introduced in this lesson:**

- **`IdlingResource`** — a counter-based signal telling a test framework
  "still busy, keep waiting" versus "idle, safe to proceed" for
  background work the framework's own automatic waiting can't see.

---

## Concept Unit: `IdlingResource`

### The Problem

Espresso automatically waits for the main thread's own UI queue (Lesson
14b's own event loop) to go idle before proceeding — but it has no idea a
separate background thread (database work, via `ExecutorService`,
Lesson 14d) is still running; a test could assert before that background
work genuinely finishes, producing a real, intermittent, hard-to-reproduce
test failure.

### Introduce the Concept in Isolation

This is not a throwaway lab — it's real Android testing code, verified
against the actual Espresso framework source:

```java
public class DatabaseIdlingResource implements IdlingResource {
    private volatile boolean idle = true;
    private ResourceCallback callback;

    void setBusy() { idle = false; }
    void setIdle() {
        idle = true;
        if (callback != null) callback.onTransitionToIdle();
    }

    @Override
    public boolean isIdleNow() { return idle; }

    @Override
    public void registerIdleTransitionCallback(ResourceCallback callback) {
        this.callback = callback;
    }
}
```

This is `IdlingResource` — **first appearance**: a counter-based signal
telling a test framework "still busy, keep waiting" versus "idle, safe
to proceed" for background work the framework's own automatic waiting
can't see. `setBusy()` is called right before database work (Lesson
14d's own `ExecutorService` task) starts; `setIdle()` is called once it
finishes — Espresso itself calls `isIdleNow()` and waits until it
returns `true` before letting the test's own assertions run.

### Discard the Throwaway Example

Nothing here is a throwaway lab to discard — this is real, verified
Android testing code.

### Mechanical Walkthrough

1. `setBusy()` — **(a) first appearance**: called right before
   background database work (Lesson 14d) begins, signaling Espresso to
   wait.
2. `isIdleNow()` — **(a) first appearance**: Espresso itself polls this
   method; while it returns `false`, the test's own next step is held.
3. `setIdle()` — **(a) first appearance**: called once the background
   work genuinely finishes, notifying Espresso via `callback
   .onTransitionToIdle()` that it's now safe to proceed.

### CS Lens

`IdlingResource` extends Espresso's own automatic main-thread-idle
detection (Lesson 14b's own event loop, applied here) to cover
asynchronous work Espresso has no built-in visibility into — a real,
necessary bridge whenever a test needs to wait on something outside the
main thread's own queue.

Also recognized in: explicit "wait for network idle" or "wait for
condition" mechanisms in web UI automation frameworks (Selenium's own
explicit waits) — the same underlying need to signal asynchronous
readiness to an automated test.

### SE Lens

The alternative — a fixed `Thread.sleep(...)` delay in the test, hoping
the background work finishes in time — was not chosen because it's
either too short (producing the exact flaky failure `IdlingResource`
prevents) or too long (wasting real time on every test run);
`IdlingResource` waits exactly as long as the real work actually takes,
no more and no less.

---

## Connect the Pieces

`IdlingResource` closes the one gap Espresso's own automatic waiting
can't see on its own: asynchronous background work happening outside the
main thread's own event loop.

## What Breaks Without This

Running an instrumented test against a screen with background database
work, with no `IdlingResource` registered, produces a real, intermittent
failure: the test's own assertion can run before the background work
finishes, failing unpredictably depending on timing alone.

## Exercises

1. Explain, in your own words, why a fixed `Thread.sleep(2000)` in a test
   is a worse solution than `IdlingResource` for waiting on background
   database work.
2. Explain, in your own words, what would happen if `setIdle()` were
   never called after `setBusy()`.
3. Explain, in your own words, why `isIdleNow()` is polled by Espresso
   itself, rather than the test calling it directly.

## Definition of Done

- [ ] You read the real `IdlingResource` example and can explain what
      problem it solves that Espresso's own automatic waiting does not.
- [ ] You completed Exercise 1.
- [ ] You can state, without looking back at this lesson, why a fixed
      delay is a worse solution than `IdlingResource`.
