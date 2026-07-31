# Lesson 11c: Process Death

**What you will build:** No new code to compile — this reads a real
Android mechanism directly.

**What you need to know first:** Lesson 5d's configuration change,
Lesson 11b's volatile vs. non-volatile state.

**Terms introduced in this lesson:**

- **Process death** — the Android OS terminating an app's entire process
  (swiped away, force-stopped, or reclaimed for memory), destroying
  everything in memory — including any state a configuration-change
  rescue like `onSaveInstanceState` would have saved.

---

## Concept Unit: Process Death

### The Problem

Lesson 5d's configuration change destroys and recreates one Activity
object, but the surrounding Android process — and everything else in its
memory — keeps running the entire time. Something stronger can happen: the
Android OS can terminate the *entire process*, not just recreate one
Activity within it — a genuinely different, more severe event a
configuration-change rescue was never designed to survive.

### Introduce the Concept in Isolation

This is not a throwaway lab — it's a real Android mechanism, verified against
the actual framework behavior, not runnable via plain `javac`:

```
(user swipes the app away from the recent-apps list)
  → Android may terminate the entire app process immediately
  → every object in memory is gone, with no further callbacks at all
  → (later) user reopens the app
  → Android starts a completely new process from scratch
  → InventoryActivity.onCreate(savedInstanceState) — but savedInstanceState
    is often null here too, since the process itself, not just one
    Activity, was destroyed
```

This is `process death` — **first appearance**: the Android OS
terminating an app's entire process (swiped away, force-stopped, or
reclaimed for memory), destroying everything in memory — including any
state a configuration-change rescue like `onSaveInstanceState` would
have saved. `onSaveInstanceState`'s own `Bundle` is itself held in
memory, by the OS, only for a limited time and only in some
circumstances — it is not a guarantee against process death the way it
is against a configuration change; assuming otherwise is a real, common,
and mistaken assumption this unit exists specifically to correct.

### Discard the Throwaway Example

Nothing here is a throwaway lab to discard — this traces a real,
verified Android mechanism.

### Mechanical Walkthrough

1. The app process is terminated entirely — **(a) first appearance** of
   this specific severity: not one Activity being destroyed and
   recreated within a continuing process (Lesson 5d), but the entire
   process, and everything volatile within it (Lesson 11b), ending.
2. A completely new process starts later — **(a) first appearance**:
   this is not a continuation of anything — every static field
   (Lesson 0i), every object, everything volatile, has been rebuilt from
   nothing.

### CS Lens

Process death is a stronger event than a configuration change: a
configuration change destroys one Activity object while the process
itself, and its other volatile state, continues running; process death
ends the process itself, taking every volatile piece of state with it,
`onSaveInstanceState`'s own rescued `Bundle` included in many real
circumstances.

Also recognized in: an operating system terminating any background
process under memory pressure generally, a server process being
restarted (losing all in-memory state not written to a database first).

### SE Lens

The mistaken assumption this unit corrects — treating
`onSaveInstanceState` as a general-purpose persistence mechanism — has a
real, concrete cost: state that only exists in a rescued `Bundle`,
without ever being written to genuinely non-volatile storage, can still
be lost the moment process death (rather than a mere configuration
change) occurs. Anything that must survive process death specifically
needs the next lesson's own subject.

---

## Connect the Pieces

Lesson 11b showed volatile state directly. Process death is the real
event that ends *all* of a process's own volatile state at once — a
stronger event than Lesson 5d's configuration change, and one
`onSaveInstanceState`'s own rescued `Bundle` does not reliably survive
either. The next lesson shows the concrete, non-volatile alternative
that actually does.

## What Breaks Without This

Assuming `onSaveInstanceState` protects against every kind of Activity
destruction produces a real, silent gap: process death discards its
rescued `Bundle` too, in many real circumstances, with no error or
warning distinguishing this case from a survived configuration change.

## Exercises

1. Explain, in your own words, why swiping an app away from the
   recent-apps list is a stronger event than rotating the device.
2. Explain, in your own words, why `savedInstanceState` can still be
   `null` even after process death, despite `onSaveInstanceState` having
   run earlier.
3. Name one static field or in-memory object from earlier in this
   course that would be lost entirely on process death.

## Definition of Done

- [ ] You read the real process-death lifecycle trace and can state why
      it's a stronger event than a configuration change.
- [ ] You completed Exercise 2.
- [ ] You can state, without looking back at this lesson, why
      `onSaveInstanceState` is not a reliable defense against process
      death.
