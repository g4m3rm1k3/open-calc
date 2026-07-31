# Lesson 2f: The Activity Lifecycle — The Fixed Sequence Itself

**What you will build:** No new code to compile — this reads the real
lifecycle contract directly.

**What you need to know first:** Lesson 2e's `Activity`, Lesson 2d's
template method pattern.

**Terms introduced in this lesson:**

- **Activity lifecycle** — the fixed sequence of framework-invoked
  methods (starting with `onCreate`) an Activity moves through, each
  one a hook for your own code to fill in.

---

## Concept Unit: The Activity Lifecycle — The Fixed Sequence Itself

### The Problem

Lesson 2e showed `onCreate` as one method Android calls. A real
Activity's actual sequence is longer than one method — Android calls
several, in a specific, guaranteed order, as a screen is created,
becomes visible, goes into the background, and is eventually destroyed.
Without knowing this sequence exists and is fixed, `onCreate` reads as
an arbitrary starting function rather than one stop on a real, ordered
path.

### Introduce the Concept in Isolation

The real, partial shape of `Activity`'s lifecycle methods — verified against
the real framework source — in the order the Android OS actually calls
them for a screen appearing and then being fully closed:

```java
public class Activity extends ContextThemeWrapper {
    protected void onCreate(Bundle savedInstanceState) { }
    protected void onStart() { }
    protected void onResume() { }
    protected void onPause() { }
    protected void onStop() { }
    protected void onDestroy() { }
}
```

This is the `activity lifecycle` — **first appearance**: the fixed
sequence of framework-invoked methods (starting with `onCreate`) an
Activity moves through, each one a hook for your own code to fill in.
None of these six methods are ever called by application code directly
— the Android OS calls each one, in this exact order, as a screen is
created (`onCreate` → `onStart` → `onResume`), then eventually torn
down (`onPause` → `onStop` → `onDestroy`) — the same template-method
shape as Lesson 2d's own `setup()`/`execute()`/`teardown()`, just with
six steps instead of three, and driven by real user actions (opening
the app, switching away, closing it) instead of one direct method call.

### Discard the Throwaway Example

Nothing here is a throwaway lab to discard — this is the real framework
contract, kept as reference.

### Mechanical Walkthrough

1. `onCreate`, `onStart`, `onResume`, `onPause`, `onStop`, `onDestroy`
   — **(a) first appearance** as a named, ordered sequence — six
   template-method steps, all optional to override individually (an
   Activity that overrides none of them still moves through all six,
   doing nothing extra at each), but whose *order* is entirely fixed by
   the framework, never by application code.
2. Every method shown `protected` — **(b) reappearing** access level
   from Lesson 2e, consistently applied across the whole sequence:
   subclasses override these, unrelated outside code never calls them
   directly.

### CS Lens

The Activity lifecycle is the template method pattern at full scale:
six ordered steps instead of Lesson 2d's own three, each individually
overridable, with the sequence itself entirely outside any subclass's
control. `onCreate` being "one stop on a fixed sequence" rather than an
arbitrary starting function is exactly what Lesson 2a through this
lesson have been building toward — the same inversion of control from
Lesson 2a, now recognizable in its real, full Android form.

Also recognized in: every component lifecycle across mobile frameworks
generally (iOS's `viewDidLoad`/`viewWillAppear`/`viewDidDisappear`
sequence is a direct structural equivalent), any framework's
"mount"/"update"/"unmount" component lifecycle (web UI frameworks like
React use this same fixed-sequence, overridable-steps shape).

### SE Lens

The alternative — a single `onCreate`-only lifecycle, with no further
hooks — was not chosen because a real screen needs to react differently
to different moments: `onPause` is the right place to save state before
possibly being interrupted; `onResume` is the right place to refresh
data that might have changed while the screen was away. Six distinct,
ordered hooks let application code respond precisely to each specific
moment, rather than trying to infer "which phase are we in" from inside
one single, overloaded method.

---

## Connect the Pieces

`MiniFramework.run()` (Lesson 2a) called `onStart()` at a moment only
`MiniFramework` controlled — inversion of control, the root idea.
`Button` (Lesson 2b) registered a `ClickHandler` ahead of time and
invoked it later — a callback, one concrete shape inversion of control
takes. Both are instances of event-driven programming (Lesson 2c):
code that responds to moments it doesn't schedule itself.
`MiniFramework.run()`'s fixed `setup`/`execute`/`teardown` sequence
(Lesson 2d) named the template method pattern precisely. `Activity`'s
real `onCreate` (Lesson 2e) is exactly that same pattern — and its full
lifecycle (`onCreate` through `onDestroy`), this lesson's own subject,
is that same pattern's real, six-step Android form: a fixed sequence,
application code filling in some steps, the Android OS deciding when
each one actually runs.

## What Breaks Without This

Assuming `onCreate` is the *only* moment worth overriding, with no
awareness of `onPause`/`onResume`, risks real data-loss bugs: state
that should have been saved in `onPause` (before the OS might destroy
the Activity entirely) never gets saved at all, since nothing in
`onCreate` alone runs at that later moment.

## Exercises

1. Write out, from memory, the real `Activity` lifecycle's six method
   names in order, then check them against this lesson's own contract
   block.
2. Explain, in your own words, why `onPause` and `onResume` are useful
   hooks distinct from `onCreate`.
3. Explain, in your own words, why none of these six methods are ever
   called directly by application code.

## Definition of Done

- [ ] You can state, without looking back at this lesson, the real
      Activity lifecycle's six method names, in order.
- [ ] You completed Exercise 2.
- [ ] You can state, without looking back at this lesson, why this
      sequence is called a template method pattern.
