# Lesson 5e: `onSaveInstanceState`

**What you will build:** No new code to compile — this reads real
Android code directly.

**What you need to know first:** Lesson 5d's configuration change,
Lesson 2o's `Bundle`.

**Terms introduced in this lesson:**

- **`onSaveInstanceState`** — a callback letting an Activity write
  small values into a `Bundle` right before a destruction it expects to
  recreate from, read back out in the next `onCreate` to restore
  transient state.

---

## Concept Unit: `onSaveInstanceState`

### The Problem

A full destroy-and-recreate, per Lesson 5d, discards every plain field
on the original Activity object — including small, transient state a
user would reasonably expect to survive a rotation, like text
half-typed into a form. Some explicit hook is needed to checkpoint
exactly that kind of small state before the destruction, and restore it
afterward.

### Introduce the Concept in Isolation

This is not a throwaway lab — it's real Android code, verified against
the actual framework source:

```java
@Override
protected void onSaveInstanceState(Bundle outState) {
    super.onSaveInstanceState(outState);
    outState.putInt("scroll_position", currentScrollPosition);
}

@Override
protected void onCreate(Bundle savedInstanceState) {
    super.onCreate(savedInstanceState);
    if (savedInstanceState != null) {
        currentScrollPosition = savedInstanceState.getInt("scroll_position");
    }
}
```

This is `onSaveInstanceState` — **first appearance**: a callback
letting an Activity write small values into a `Bundle` right before a
destruction it expects to recreate from, read back out in the next
`onCreate` to restore transient state. `onSaveInstanceState` is called
automatically by the framework before a configuration-change
destruction; the very next `onCreate`'s own `savedInstanceState`
parameter — unexplained since Lesson 2e — is exactly the `Bundle` that
method wrote into. This is the concept that finally gives that
long-unexplained parameter a real job.

### Discard the Throwaway Example

Nothing here is a throwaway lab to discard — this is real, verified
Android code.

### Mechanical Walkthrough

1. `protected void onSaveInstanceState(Bundle outState)` — **(a) first
   appearance** of this specific lifecycle-adjacent method: called by
   the framework automatically before a configuration-change
   destruction, never called directly by application code.
2. `outState.putInt("scroll_position", currentScrollPosition);` —
   **(b) reappearing** `Bundle` key-value storage from Lesson 2o, here
   specifically writing the one small value worth checkpointing.
3. `if (savedInstanceState != null) { ... }` — **(a) first appearance**
   of this specific null check: `savedInstanceState` is `null` on a
   genuinely fresh launch (nothing was ever checkpointed), but
   non-null specifically when recreated after a configuration change —
   this check distinguishes the two cases.
4. `savedInstanceState.getInt("scroll_position")` — reads the value
   back out, by the same key it was stored under, restoring the small
   piece of state the destroy-and-recreate cycle would otherwise have
   discarded.

### CS Lens

`onSaveInstanceState`/`onCreate`'s `savedInstanceState` parameter
together are checkpointing (Lesson 5c), real and load-bearing: the
framework calls the save hook automatically before a destruction it
expects to recreate from, and hands the exact same `Bundle` back to
the very next `onCreate`, closing the loop between "an object is about
to be destroyed" and "a new one just came to life that should restore
what mattered."

Also recognized in: any framework's own "save state before disposal,
restore on recreation" hook — web browsers restoring scroll position
and form input after a page reload, IDE session restoration after a
restart.

### SE Lens

The alternative — application code manually detecting a configuration
change and trying to migrate state itself — was not chosen because
Android's own `onSaveInstanceState`/`savedInstanceState` pair already
provides exactly the right hook, automatically, at exactly the right
moments; the discipline required is only in choosing what small state
is actually worth checkpointing, not in detecting when a save is
needed at all.

---

## Connect the Pieces

Lesson 5c's checkpointing named the general idea; Lesson 5d's
configuration change named the real, destructive event. This lesson
closes the loop: `onSaveInstanceState`/`savedInstanceState` is
Android's own real, load-bearing checkpointing mechanism, finally
explaining the `Bundle savedInstanceState` parameter that has sat,
unexplained, in every `onCreate` signature since Lesson 2e.

## What Breaks Without This

Relying on a plain field to survive a configuration change, with no
`onSaveInstanceState` at all, produces a real, observable bug:
rotating the device resets any such field to its default value,
discarding whatever the user had scrolled to or typed, with no error
or crash at all — simply silently lost state.

## Exercises

1. Add a second checkpointed value, `String searchQuery`, following
   the exact same `onSaveInstanceState`/`onCreate` shape as
   `scroll_position`.
2. Explain, in your own words, why `savedInstanceState` is checked for
   `null` inside `onCreate`, rather than assumed to always contain a
   value.
3. Trace, on paper, the complete sequence of lifecycle methods called,
   in order, for a rotation, and identify exactly where
   `onSaveInstanceState` fits into that sequence.

## Definition of Done

- [ ] You read the real `onSaveInstanceState`/`onCreate` example and
      can explain what `savedInstanceState` being `null` signifies.
- [ ] You completed Exercise 1.
- [ ] You can state, without looking back at this lesson, why a plain
      field, with no checkpointing, is reset by a screen rotation.
