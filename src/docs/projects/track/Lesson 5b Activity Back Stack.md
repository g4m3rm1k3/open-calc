# Lesson 5b: The Activity Back Stack

**What you will build:** No new code to compile — this traces a real
Android mechanism directly.

**What you need to know first:** Lesson 5a's stack, Lesson 4f's
`Intent`, Lesson 2f's Activity lifecycle.

**Terms introduced in this lesson:**

- **Activity back stack** — the stack Android maintains recording
  every Activity navigated away from, in order — the source of truth
  for what the system Back button returns to.

---

## Concept Unit: The Activity Back Stack

### The Problem

Every Activity launched via `startActivity` (Lesson 4f) doesn't
replace the previous screen — pressing the system Back button
correctly returns to wherever the user came from, in the exact reverse
order they navigated, no matter how many screens deep they've gone.
Nothing in this course's own code has managed that ordering
explicitly; Android itself must be tracking it somewhere.

### Introduce the Concept in Isolation

This is not a throwaway lab — it's a real Android mechanism, verified
against the actual framework behavior, not runnable via plain `javac`.
Tracing three real `startActivity` calls and two real Back presses:

```
startActivity(Intent → SettingsActivity)   // back stack: [Main, Settings]
startActivity(Intent → ProfileActivity)    // back stack: [Main, Settings, Profile]
(user presses Back)                        // back stack: [Main, Settings]
(user presses Back)                        // back stack: [Main]
```

This is the `activity back stack` — **first appearance**: the stack
Android maintains recording every Activity navigated away from, in
order — the source of truth for what the system Back button returns
to. Every `startActivity` call pushes the new Activity on top; every
system Back press pops the current top, revealing whatever Activity
sits beneath it — the exact same LIFO shape as Lesson 5a's own
`ArrayDeque` example, now applied to real, on-screen Activities
instead of strings.

### Discard the Throwaway Example

Nothing here is a throwaway lab to discard — this traces a real,
verified Android mechanism.

### Mechanical Walkthrough

1. `startActivity(Intent → SettingsActivity)` — **(b) reappearing**
   `Intent`-based launch from Lesson 4f, now shown specifically for
   its effect on the back stack: pushes `SettingsActivity` on top of
   `MainActivity`, which was already there from the app's own launch.
2. `startActivity(Intent → ProfileActivity)` — a second push; the
   stack now holds three Activities, `ProfileActivity` on top.
3. Each Back press pops the current top Activity, which is *destroyed*
   (`onDestroy`, from Lesson 2f's own Activity lifecycle) — never
   merely hidden — and reveals whatever was beneath it, which was only
   ever paused and stopped, never destroyed, which is exactly why
   pressing Back returns to `MainActivity` without its `onCreate`
   running again: it was still alive on the stack the whole time, just
   not on top.

### CS Lens

The activity back stack is a real, load-bearing instance of the LIFO
structure Lesson 5a opened with: `push` on every `startActivity` call,
`pop` on every Back press, `peek` (in effect) being whatever Activity
is currently visible on screen. Recognizing this as "the same stack"
already built and run in plain Java, rather than an unrelated,
Android-specific mechanism, is the entire point of pairing these two
lessons together.

Also recognized in: browser tab history (Back returns to the
previously-viewed page, in exact reverse order), any "wizard" or
multi-step flow UI where Back must return to precisely the previous
step, in order, regardless of how many steps deep the user has gone.

### SE Lens

Android maintaining this stack automatically — rather than requiring
every app to track its own navigation history by hand — is what makes
Back work correctly and consistently across every Android app, without
each individual app needing to reimplement stack-based navigation
tracking itself. The cost, covered in later lessons on navigation, is
that unusual navigation patterns (jumping directly to a deep screen
from a notification, for instance) require deliberately constructing
the back stack to match what a user would expect, rather than trusting
the default push-on-launch behavior alone.

---

## Connect the Pieces

Lesson 5a's `screens.push("Profile")` then `screens.pop()`
demonstrated LIFO ordering directly, in plain Java. The Activity back
stack is that exact structure, real and load-bearing: every
`startActivity` call is a push, every system Back press is a pop, and
the reason Back never re-runs `MainActivity`'s `onCreate` is that it
was never popped at all — only Activities on top of the stack are ever
destroyed by a Back press.

## What Breaks Without This

Assuming Back always simply "closes the current screen" rather than
correctly popping the real stack leads to a real, wrong prediction:
launching three Activities via `startActivity` and pressing Back three
times returns all the way to the very first screen, in exact reverse
launch order — not back to some arbitrary or most-recently-defined
screen. A developer who doesn't understand the stack model might
incorrectly assume Back always returns to a fixed "home" screen
regardless of navigation depth — a real, common misunderstanding this
lesson's own traced example, verified against the actual framework
behavior, directly corrects.

## Exercises

1. Trace, on paper, what the back stack looks like after: launch
   `MainActivity` → `startActivity` to `SettingsActivity` →
   `startActivity` to `ProfileActivity` → one Back press →
   `startActivity` to `HelpActivity`. State exactly which Activities
   remain on the stack, top to bottom.
2. Explain, in your own words, why an Activity revealed by a Back
   press does not re-run its `onCreate` method.
3. Explain, in your own words, why the Activity back stack is
   described as LIFO rather than FIFO.

## Definition of Done

- [ ] You completed Exercise 1 and correctly traced the back stack's
      contents through four navigation events.
- [ ] You completed Exercise 2.
- [ ] You can state, without looking back at this lesson, why the
      Activity back stack is described as LIFO rather than FIFO.
