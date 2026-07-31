# Lesson 5c: Checkpointing

**What you will build:** A small, fully runnable, plain Java lab.

**What you need to know first:** Nothing beyond the Learner Baseline.

**Terms introduced in this lesson:**

- **Checkpointing** — saving just enough state before a destructive
  event to reconstruct correctness afterward, without persisting
  everything.

---

## Concept Unit: Checkpointing

### The Problem

Some processes are destroyed and rebuilt entirely, rather than
incrementally modified — but a full rebuild that discards absolutely
everything loses real, small pieces of state a user would reasonably
expect to still be there afterward (which tab was selected, how far
they'd scrolled). Saving *everything* defeats the point of a
lightweight rebuild; saving *nothing* loses real, expected continuity.

### Introduce the Concept in Isolation

```
mkdir lesson-5c
cd lesson-5c
```

Create `Main.java`:

```java
import java.util.HashMap;
import java.util.Map;

public class Main {
    public static void main(String[] args) {
        Map<String, Object> savedState = new HashMap<>();
        savedState.put("scrollPosition", 340);

        System.out.println("Simulating full teardown and rebuild...");

        int restoredScrollPosition = (int) savedState.get("scrollPosition");
        System.out.println("Restored scroll position: " + restoredScrollPosition);
    }
}
```

Compile and run it:

```
javac Main.java
java Main
```

Here is the real output:

```
Simulating full teardown and rebuild...
Restored scroll position: 340
```

`savedState` holds exactly one small value, `scrollPosition`, saved
before the simulated teardown and read back afterward. This is
`checkpointing` — **first appearance**: saving just enough state
before a destructive event to reconstruct correctness afterward,
without persisting everything. Nothing about the rest of the
(simulated) program's state was saved — only the one specific value
worth preserving across the destructive event.

### Discard the Throwaway Example

This version is deleted now. It will not appear again.

### Mechanical Walkthrough

1. `Map<String, Object> savedState = new HashMap<>();` — **(a) first
   appearance** of `HashMap`, a key-value standard-library type;
   `Object` as the value type here permits storing values of different
   types under different keys, at the cost of needing a cast to read
   them back as their real type.
2. `savedState.put("scrollPosition", 340);` — stores the one small
   value worth checkpointing, before the simulated destructive event.
3. `(int) savedState.get("scrollPosition")` — **(b) reappearing**
   runtime-type-narrowing cast from Lesson 0o, needed here because
   `get(...)` returns the general `Object` type, not `int` directly.

### CS Lens

Checkpointing is a deliberate, minimal snapshot — the opposite extreme
from full serialization, which preserves an entire object graph.
Recognizing which small pieces of state are actually worth
checkpointing, versus safely discardable and rebuildable from scratch,
is the real design skill this concept requires.

Also recognized in: video game "save points" (a deliberately small
snapshot, not the entire game engine's memory), database checkpointing
(periodically saving enough state to recover from a crash without
replaying an entire transaction log from the beginning), browser tab
restoration after a crash (saving scroll position and open tabs, not
every in-memory JavaScript variable).

### SE Lens

The alternative — saving the entire object graph before every
destructive event, the way full serialization does — was not chosen
for frequent, lightweight destructions (a screen rotation, expected to
happen often) because full serialization is real, comparatively
expensive work; checkpointing only the small, specific pieces worth
preserving keeps the destroy-and-rebuild cycle itself cheap and fast.

---

## Connect the Pieces

`savedState.put("scrollPosition", 340)` demonstrated checkpointing in
miniature: save only what's worth preserving before a destructive
event. The next lesson (Configuration Change) shows the real,
Android-scale destructive event this concept exists to survive.

## What Breaks Without This

Discarding all state before a destructive event, with no checkpointing
at all, loses real, expected continuity — a user's scroll position,
half-typed search, or selected tab simply resets, with no error or
crash to signal it happened.

## Exercises

1. Add a second checkpointed value, `String searchQuery`, to this
   lesson's own example.
2. Explain, in your own words, why checkpointing saves only a small
   piece of state rather than the entire program's state.
3. Name, from memory, one real-world example of checkpointing outside
   this lesson's own example.

## Definition of Done

- [ ] You ran the checkpointing example and saw the real, restored
      value.
- [ ] You completed Exercise 1.
- [ ] You can state, without looking back at this lesson, why
      checkpointing saves only a small piece of state.
