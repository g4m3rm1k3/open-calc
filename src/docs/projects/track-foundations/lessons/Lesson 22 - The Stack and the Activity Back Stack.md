# Lesson 22: The Stack and the Activity Back Stack

**What you will build:** The first unit is a small, fully runnable, plain
Java lab. The second reads the real Android mechanism it's modeling.

**What you need to know first:** Lesson 10's `Activity` and `Activity
lifecycle`.

**Terms introduced in this lesson:**

- **Stack (LIFO)** — a data structure allowing additions and removals
  only at the same end, so the most recently added entry is always the
  first one removed (Last In, First Out).
- **Activity back stack** — the stack Android maintains recording every
  Activity navigated away from, in order — the source of truth for what
  the system Back button returns to.

---

## Concept Unit: Stack — Last In, First Out

### The Problem

Some sequences of items need to be undone in the exact reverse order they
were added — the most recent addition is always the first one removed.
A plain `List` (Lesson 07) permits removing from anywhere; a more
restricted structure, allowing changes only at one end, is what actually
enforces the reverse-order guarantee, rather than trusting calling code
to always remove from the right place by convention.

### Introduce the Concept in Isolation

```
mkdir lesson-22
cd lesson-22
```

Create `Main.java`:

```java
import java.util.ArrayDeque;

public class Main {
    public static void main(String[] args) {
        ArrayDeque<String> screens = new ArrayDeque<>();

        screens.push("Home");
        screens.push("Settings");
        screens.push("Profile");

        System.out.println("Current: " + screens.peek());
        screens.pop();
        System.out.println("Current: " + screens.peek());
        screens.pop();
        System.out.println("Current: " + screens.peek());
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
Current: Profile
Current: Settings
Current: Home
```

`"Profile"`, the most recently pushed screen, is also the first one
removed. This is a `stack (LIFO)` — **first appearance**: a data
structure allowing additions and removals only at the same end, so the
most recently added entry is always the first one removed (Last In,
First Out). `push` adds to the top; `pop` removes from the top; `peek`
reads the top without removing it — there is no operation to add or
remove from the bottom, or from the middle, at all.

### Discard the Throwaway Example

This version is deleted now. It will not appear in the project again.

### Mechanical Walkthrough

1. `ArrayDeque<String> screens = new ArrayDeque<>();` — **(a) first
   appearance** of `ArrayDeque`, Java's standard-library class used here
   as a stack (its own name reflects a more general "double-ended queue"
   capability, only the stack-relevant half of which this lesson uses).
   `<String>` is Lesson 07's generics, reused, **(b)**.
2. `screens.push("Home");`, `screens.push("Settings");`,
   `screens.push("Profile");` — **(a) first appearance** of `push`: adds
   to the top. After all three calls, `"Profile"` sits on top,
   `"Settings"` beneath it, `"Home"` at the bottom.
3. `screens.peek()` — **(a) first appearance**: reads the current top
   entry without removing it.
4. `screens.pop()` — **(a) first appearance**: removes and returns the
   top entry. Called once, it removes `"Profile"`, leaving `"Settings"`
   as the new top; called again, it removes `"Settings"`, leaving
   `"Home"`.

### CS Lens

LIFO ordering is what distinguishes a stack from a plain list or queue:
the *only* accessible entry at any moment is the most recently added
one. This is also, not coincidentally, the exact mechanism behind
function-call return addresses in every language's runtime — a stack
trace (Lesson 09's own thrown exceptions produce one) is a literal, real
stack of function calls, most recent on top.

Also recognized in: undo history in virtually every editor (the most
recent action is always the first one undone), the browser's own Back
button, `list.append()`/`list.pop()` used as a stack in Python.

### SE Lens

The alternative — using a plain `List` and always removing from
`list.size() - 1` by convention — was not chosen because nothing stops
code from accidentally removing from index `0` instead, silently
breaking the LIFO guarantee with no error at all. A dedicated stack type,
exposing only `push`/`pop`/`peek`, makes that mistake impossible to make
by accident — the type itself enforces the ordering, rather than
depending on every caller remembering a convention correctly.

---

## Concept Unit: The Activity Back Stack

### The Problem

Every Activity launched via `startActivity` (Lesson 19) doesn't replace
the previous screen — pressing the system Back button correctly returns
to wherever the user came from, in the exact reverse order they
navigated, no matter how many screens deep they've gone. Nothing in this
curriculum's own code has managed that ordering explicitly; Android
itself must be tracking it somewhere.

### Introduce the Concept in Isolation

This is not a throwaway lab — it's a real Android mechanism, verified against
the actual framework behavior, not runnable via plain `javac`. Tracing
three real `startActivity` calls and two real Back presses:

```
startActivity(Intent → SettingsActivity)   // back stack: [Main, Settings]
startActivity(Intent → ProfileActivity)    // back stack: [Main, Settings, Profile]
(user presses Back)                        // back stack: [Main, Settings]
(user presses Back)                        // back stack: [Main]
```

This is the `activity back stack` — **first appearance**: the stack
Android maintains recording every Activity navigated away from, in
order — the source of truth for what the system Back button returns to.
Every `startActivity` call pushes the new Activity on top; every system
Back press pops the current top, revealing whatever Activity sits beneath
it — the exact same LIFO shape as this lesson's own `ArrayDeque` example,
now applied to real, on-screen Activities instead of strings.

### Discard the Throwaway Example

Nothing here is a throwaway lab to discard — this traces a real,
verified Android mechanism.

### Mechanical Walkthrough

1. `startActivity(Intent → SettingsActivity)` — **(b) reappearing**
   `Intent`-based launch from Lesson 19, now shown specifically for its
   effect on the back stack: pushes `SettingsActivity` on top of
   `MainActivity`, which was already there from the app's own launch.
2. `startActivity(Intent → ProfileActivity)` — a second push; the stack
   now holds three Activities, `ProfileActivity` on top.
3. Each Back press pops the current top Activity, which is *destroyed*
   (Lesson 10's `onDestroy`, from the Activity lifecycle) — never merely
   hidden — and reveals whatever was beneath it, which was only ever
   paused and stopped, never destroyed, which is exactly why pressing
   Back returns to `MainActivity` without its `onCreate` running again:
   it was still alive on the stack the whole time, just not on top.

### CS Lens

The activity back stack is a real, load-bearing instance of the LIFO
structure this lesson opened with: `push` on every `startActivity` call,
`pop` on every Back press, `peek` (in effect) being whatever Activity is
currently visible on screen. Recognizing this as "the same stack" this
lesson already built and ran in plain Java, rather than an unrelated,
Android-specific mechanism, is the entire point of pairing these two
units together.

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
that unusual navigation patterns (jumping directly to a deep screen from
a notification, for instance) require deliberately constructing the back
stack to match what a user would expect, rather than trusting the
default push-on-launch behavior alone.

---

## Connect the Pieces

`screens.push("Profile")` then `screens.pop()` demonstrated LIFO
ordering directly, in plain Java: the most recently added entry is
always the first one removed. The Activity back stack is that exact
structure, real and load-bearing: every `startActivity` call is a push,
every system Back press is a pop, and the reason Back never re-runs
`MainActivity`'s `onCreate` is that it was never popped at all — only
Activities on top of the stack are ever destroyed by a Back press.

## What Breaks Without This

Assuming Back always simply "closes the current screen" rather than
correctly popping the real stack leads to a real, wrong prediction:
launching three Activities via `startActivity` and pressing Back three
times returns all the way to the very first screen, in exact reverse
launch order — not back to some arbitrary or most-recently-defined
screen. A developer who doesn't understand the stack model might
incorrectly assume Back always returns to a fixed "home" screen
regardless of navigation depth — a real, common misunderstanding this
lesson's own traced example directly corrects.

## Exercises

1. Extend this lesson's own `ArrayDeque` example with a fourth `push`
   and a third `pop`, predicting the printed output before running it.
2. Trace, on paper, what the back stack looks like after: launch
   `MainActivity` → `startActivity` to `SettingsActivity` → `startActivity`
   to `ProfileActivity` → one Back press → `startActivity` to
   `HelpActivity`. State exactly which Activities remain on the stack,
   top to bottom.
3. Explain, in your own words, why an Activity revealed by a Back press
   does not re-run its `onCreate` method.

## Definition of Done

- [ ] You ran the `ArrayDeque` stack example and saw the real LIFO
      output.
- [ ] You completed Exercise 1 and correctly predicted the output before
      running it.
- [ ] You completed Exercise 2 and correctly traced the back stack's
      contents through four navigation events.
- [ ] You can state, without looking back at this lesson, why the
      Activity back stack is described as LIFO rather than FIFO.
