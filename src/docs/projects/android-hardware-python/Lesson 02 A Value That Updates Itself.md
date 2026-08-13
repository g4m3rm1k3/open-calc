# Lesson 02: A Value That Updates Itself

**What you will build:** a label that updates its own text, ten times
a second, with no sensor involved yet — just a plain counting number.
The transferable problem: every real hardware reading this series
will ever show has to get from "a value changed" to "the screen shows
it," repeatedly, over time — and Kivy's own event loop, not a
hand-written loop of your own, is what has to drive that repetition.
Proving this mechanism works with a trivial, fake value first means
Lesson 03's real sensor reading only has to add *one* new idea, not
two at once.

**What you need to know first:** Lesson 01 in full — the `App` class,
`build()`, running on the desktop before packaging for Android.

**Terms introduced in this lesson:**
- **Event loop** — the running loop, owned by the framework itself,
  that keeps a Kivy app alive: redrawing the screen, responding to
  input, and — this lesson's own subject — running any scheduled work,
  all without your own code ever writing a `while True:` loop by hand.
- **Scheduled callback** — a function handed to Kivy's event loop to
  be called later, repeatedly, on its own timing — not called directly
  by your own code at the moment it's scheduled.

**Objects and methods this lesson uses:**
- **`kivy.clock.Clock`**
  - *What it is:* the object that owns Kivy's event loop's own sense
    of time — every scheduled, repeating, or delayed piece of work in
    a Kivy app goes through it.
  - *Implementation:* imported directly, used without ever
    instantiating it yourself — its real methods are used as declared
    on the imported object itself.
  - *Its use:* `.schedule_interval(...)`, below, is the one method this
    lesson actually calls on it.
- **`Clock.schedule_interval(callback, timeout)`**
  - *What it is:* registers a function to be called repeatedly, on a
    fixed interval, until something explicitly cancels it.
  - *Implementation:* `callback` must accept one argument (conventionally
    named `dt`, covered in the Mechanical Walkthrough below);
    `timeout` is the interval, in seconds, between calls.
  - *Its use:* the actual mechanism driving this lesson's repeated
    label updates.
- **`kivy.uix.label.Label.text`**
  - *What it is:* the property holding a `Label`'s currently displayed
    string.
  - *Implementation:* an ordinary, reassignable attribute — setting it
    to a new string is enough to change what's on screen; Kivy's own
    rendering picks up the change automatically, with no separate
    "redraw" call needed.
  - *Its use:* reassigned once per scheduled callback, below.

---

## Concept Unit: Repetition Owned by the Framework, Not by You

### The Problem

An ordinary Python script that needs to do something repeatedly would
reach for a `while` loop, or `time.sleep(...)` between iterations. A
Kivy app already has its own always-running loop — the one that keeps
the window open and responsive — and a hand-written `while True:`
loop of your own would block that same loop completely, freezing the
entire app's display and input the same way a genuinely blocking call
would. Repeated work in a Kivy app has to be handed *to* the
framework's own loop, not layered in a second loop beside it.

### Introduce the Concept in Isolation — Step 1: Proving the Callback Really Repeats, With the Smallest Possible App

**A real constraint worth stating outright:** `Clock.schedule_interval`
only fires inside a running Kivy event loop — confirmed against Kivy's
own documentation this session — there is no supported way to pump it
from a bare script with no `App` at all. So this isolation uses the
smallest possible real app instead: no visible label, nothing on
screen worth looking at, existing only to prove the repeating-callback
mechanism, then closing itself automatically.

Scratch file:

```python
from kivy.app import App
from kivy.uix.widget import Widget
from kivy.clock import Clock
import time


class TickApp(App):
    def build(self):
        self.count = 0
        Clock.schedule_interval(self.tick, 0.5)
        Clock.schedule_once(lambda dt: self.stop(), 2.6)  # closes itself after ~5 ticks
        return Widget()  # a real, valid, empty root widget — nothing to look at on purpose

    def tick(self, dt):
        self.count += 1
        print("Tick", self.count, "at", round(time.time(), 2))


TickApp().run()
```

Run it. Expected output — five real, separate calls, roughly half a
second apart, then the app closes itself:

```
Tick 1 at 1723...
Tick 2 at 1723...
Tick 3 at 1723...
Tick 4 at 1723...
Tick 5 at 1723...
```

`self.tick` was handed to `Clock` once — it was never called directly
by this script's own code — and yet it ran five separate times, on its
own schedule. `Clock.schedule_once`, used here only to end the demo
automatically, is `schedule_interval`'s one-shot sibling — same idea,
fires exactly once instead of repeatedly. This proves the actual
mechanism the real app below relies on, using nothing but the same
`App`/`build()`/`.run()` shape Lesson 01 already established, with no
visible widget needed to prove it.

**Discard this scratch file.**

### The Real Thing

**Reference Source:** no reference counterpart — this is the second
lesson of a new series, extending Lesson 01's own minimal app. The
`Clock` API is confirmed against Kivy's current official
documentation, fetched this session.

**Files affected:** `main.py`, the same file Lesson 01 created.

**Change type:** replace `build()`'s body — the static `Label` from
Lesson 01 becomes a `Label` this lesson updates repeatedly.

**Location:** inside `MyApp`, replacing Lesson 01's one-line `build()`.

**Dependencies:** none beyond Lesson 01's own working desktop setup.

```python
from kivy.app import App
from kivy.uix.label import Label
from kivy.clock import Clock
from kivy.logger import Logger


class MyApp(App):
    def build(self):
        self.label = Label(text="0")                                     # <- new (was a fixed string in Lesson 01)
        Clock.schedule_interval(self.update_label, 0.1)                  # <- new
        return self.label

    def update_label(self, dt):                                          # <- new
        current = int(self.label.text)                                   # <- new
        self.label.text = str(current + 1)                                # <- new
        if current % 10 == 0:                                             # <- new
            Logger.info(f"MyApp: label is now {self.label.text}")         # <- new


if __name__ == "__main__":
    MyApp().run()
```

### Mechanical Walkthrough

- `self.label = Label(text="0")` — **reappearing `Label` construction
  from Lesson 01, new detail: assigned to `self.label` instead of
  returned directly.** Needed here because `update_label`, below, has
  to reach the exact same `Label` instance later — Lesson 01's version
  never needed to refer back to its own label after returning it.
- `Clock.schedule_interval(self.update_label, 0.1)` — **first
  appearance**, full treatment above (Objects and methods). `0.1`
  means roughly ten calls per second — "roughly," not "exactly,"
  covered next.
- `def update_label(self, dt):` — **first appearance of the required
  callback shape.** Every function `Clock.schedule_interval` calls
  must accept one argument beyond `self` — conventionally named `dt`
  — the real, actual elapsed seconds since the *previous* call, not
  always precisely `0.1`; a busy frame can make `dt` briefly larger.
  This lesson doesn't use `dt`'s value, but the parameter itself is
  required — Kivy always passes it, whether the callback needs it or
  not.
- `int(self.label.text)` / `str(current + 1)` — **ordinary Python,
  already assumed knowledge — worth noting only because `Label.text`
  is always a `str`, never stored as a number**, which is why reading
  it back for arithmetic requires converting it first, every time.
- `self.label.text = str(current + 1)` — **reappearing property
  assignment from Lesson 01's own `Objects and methods` treatment of
  `Label`.** What's new here isn't the assignment itself, but that it
  happens *repeatedly*, from inside a scheduled callback, each call
  producing a real, visible change on screen without any explicit
  redraw request.
- `Logger.info(f"MyApp: label is now {self.label.text}")` —
  **reappearing from Lesson 01, new detail: an f-string, and a
  conditional call.** Logged only every tenth tick (`current % 10 ==
  0`) — deliberately, so real output stays readable instead of
  scrolling ten lines a second.

### Execution Trace

**Same honesty note as this whole project:** predicted output,
verified against Kivy's own current documentation, not a captured
run.

1. `build()` runs once. `self.label` is created showing `"0"`,
   `schedule_interval` registers `update_label`, and the label itself
   is returned as the root widget — predict the window opens showing
   `"0"` for a brief moment.
2. Roughly ten times per second, `update_label` runs. Predict the
   on-screen number visibly climbs — `1`, `2`, `3`, ... — fast enough
   to look close to continuous, not fast enough to be unreadable.
3. Predict a real `Logger.info` line appears roughly once per second
   (every tenth tick at a ~10Hz interval), showing the label's current
   value at that moment — a coarser-grained log than the on-screen
   update rate, on purpose.
4. Closing the window ends the app — predict `update_label` simply
   stops being called; nothing in this lesson's own code explicitly
   unschedules it, because the whole event loop (and everything
   scheduled on it) ends together when the app itself closes.

### CS Lens

**Handing a function to a framework's own loop to be called later,
repeatedly, on a timer, is the same event-driven scheduling idea
recognized across essentially every GUI and game framework** — a game
engine's per-frame `update()` callback, a web browser's
`setInterval(...)`, any animation framework's own tick callback. The
shared shape is always the same: your code never writes the loop
itself, only the piece of work that happens on each pass through
someone else's loop.

### SE Lens

**Why `schedule_interval`, called once in `build()`, instead of a
plain Python `threading.Timer` doing the same repeated work on a
separate thread?** A separate thread updating `self.label.text`
directly would be touching UI state from outside Kivy's own event
loop — a real, general hazard in essentially every GUI framework, not
specific to Kivy, since the framework's own rendering assumes nothing
else is changing widget state concurrently, mid-frame. `Clock.schedule_interval`
guarantees its callback runs *on* the event loop itself, at a safe,
predictable point, specifically to avoid that hazard entirely — the
real cost being that the callback's timing is only ever approximate
(the real `dt`, not a guaranteed-exact `0.1`), never a hard real-time
guarantee.

---

## Connect the Pieces

`Clock.schedule_interval`, proven first in Step 1 with nothing but a
`print` and no UI at all, is the entire mechanism behind this lesson's
real, visible, repeatedly-updating label — `self.label` reassigned
from inside a callback the framework itself calls, on its own timing,
never from a loop this project's own code wrote by hand. Every later
lesson that shows a live, changing hardware reading builds directly on
this exact mechanism, unchanged — only the value being displayed will
differ.

## What Breaks Without This

Replace `Clock.schedule_interval` with a real, blocking loop directly
inside `build()`:

```python
def build(self):
    self.label = Label(text="0")
    for i in range(100):                     # <- wrong: a real loop, not a scheduled callback
        self.label.text = str(i)
        time.sleep(0.1)
    return self.label
```

Predicted result: the window doesn't appear to open at all until this
entire loop finishes — roughly ten real seconds — because `build()`
itself is expected to return quickly, and Kivy cannot draw a single
frame while your own code is still inside it, blocking. Once it
finally returns, the label shows only its *last* value, `"99"` — every
intermediate update happened while nothing was able to render at all.
Restore `Clock.schedule_interval` when done, and confirm for yourself
that the visible, animated counting only appears with the scheduled
version, never the blocking one.

## Exercises

1. Change `0.1` to `1.0` and confirm, by watching the real window, that
   the label now visibly updates roughly once per second instead of
   ten times per second.
2. Add a second, independent `Clock.schedule_interval` call in
   `build()`, calling a second method that logs a different message on
   its own, different interval. Confirm both run concurrently, each on
   its own timing.
3. Call `Clock.unschedule(self.update_label)` from inside
   `update_label` itself once `current` reaches some fixed number (say,
   50). Confirm the label really does stop updating at exactly that
   value, and stays there.

## Definition of Done

- [ ] You ran Step 1's scratch file and saw five real, separately
      timed callback calls, with no app, window, or widget involved at
      all.
- [ ] You ran the real Step 2 code and watched a real label count up
      on screen, roughly ten times a second.
- [ ] You can explain, without looking, why a plain `while`/`for` loop
      placed directly inside `build()` would freeze the app instead of
      animating it.
- [ ] You can state what the `dt` parameter every scheduled callback
      receives actually represents, and why it isn't always exactly
      the requested interval.
- [ ] You triggered the real blocking-loop failure from What Breaks
      Without This, watched the window fail to appear until it
      finished, and restored the scheduled version.
- [ ] Commit: the updated `main.py`.
