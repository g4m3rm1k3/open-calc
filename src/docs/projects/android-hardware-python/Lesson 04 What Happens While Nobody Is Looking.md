# Lesson 04: What Happens While Nobody Is Looking

**What you will build:** the accelerometer, correctly turned off the
moment the app leaves the foreground, and back on the moment it
returns — fixing a real, currently-existing waste in Lesson 03's own
code, which has been polling real hardware ten times a second whether
anyone can see the result or not, for as long as the app has been
running at all. The transferable problem: a phone app doesn't control
its own lifetime the way a desktop script does — the OS can pause it
at any moment, for reasons entirely outside this project's code, and
correct hardware use means reacting to that, not ignoring it.

**What you need to know first:** Lesson 03 in full — polling,
`accelerometer.enable()`/`.disable()`, `Clock.schedule_interval`.

**Terms introduced in this lesson:**
- **Pause (app lifecycle)** — the state Android puts an app into when
  it leaves the foreground without being fully closed — a Home press,
  a phone call arriving, another app opening on top of it. A paused
  app is not running, but hasn't been destroyed either; it can be
  resumed later, picking up from exactly where it left off, or the OS
  can decide to kill it entirely while paused, without ever calling
  anything further at all.

**Objects and methods this lesson uses:**
- **`App.on_pause()`**
  - *What it is:* called when Android is about to pause this app.
  - *Implementation:* must return `True` for the app to actually be
    allowed to pause and later resume — returning `False`, or defining
    it with no `return` at all, tells Android this app cannot be
    paused, and `on_stop()` runs instead, ending the app outright.
  - *Its use:* where this lesson turns the accelerometer off and stops
    polling.
- **`App.on_resume()`**
  - *What it is:* called when a previously paused app returns to the
    foreground.
  - *Implementation:* takes no arguments, returns nothing meaningful —
    Android's own documentation is explicit that this method is not
    guaranteed to run at all, if the OS chose to fully kill the app
    while it was paused instead of merely holding it.
  - *Its use:* where this lesson turns the accelerometer back on and
    resumes polling.
- **`Clock.unschedule(callback)`**
  - *What it is:* cancels a previously scheduled repeating callback.
  - *Implementation:* takes the exact same function reference that was
    originally passed to `schedule_interval`.
  - *Its use:* stops `update_label` from continuing to run while the
    app is paused and its own label isn't even visible.

---

## Concept Unit: A Reading Nobody Can See Is Still a Real Cost

### The Problem

Lesson 03's `accelerometer.enable()` runs exactly once, in `build()`,
and nothing in that lesson's code ever calls `.disable()` at all — the
sensor stays on, and `Clock.schedule_interval` keeps polling it ten
times a second, for the app's entire lifetime, including every moment
the app is sitting paused in the background with nothing on screen for
anyone to see. Real battery, spent on real hardware, producing real
readings nobody will ever read.

### Introduce the Concept in Isolation — Step 1: Proving Pause and Resume Really Are Separate Moments

Scratch file — a tiny, throwaway app whose only job is proving
`on_pause`/`on_resume` genuinely fire, using nothing but `print`:

```python
from kivy.app import App
from kivy.uix.widget import Widget
from kivy.clock import Clock


class LifecycleApp(App):
    def build(self):
        print("build() — app starting")
        Clock.schedule_once(lambda dt: self.stop(), 5)
        return Widget()

    def on_pause(self):
        print("on_pause() — about to leave the foreground")
        return True

    def on_resume(self):
        print("on_resume() — back in the foreground")


LifecycleApp().run()
```

Run it on a real device or emulator. Send it to the background (Home
button) partway through its five-second lifetime, then bring it back
before the five seconds finish. Expected output, in this exact order:

```
build() — app starting
on_pause() — about to leave the foreground
on_resume() — back in the foreground
```

If the five seconds run out while the app is still paused, expect
`on_resume()` never to print at all — the app simply closes itself
from the background, exactly as this lesson's own Objects and methods
section already warned. Both outcomes are real and worth seeing at
least once, not just read about.

**Discard this scratch file.**

### The Real Thing

**Reference Source:** no reference counterpart — Kivy's `App`
lifecycle methods are confirmed against Kivy's own current official
documentation, fetched this session.

**Files affected:** `main.py` — the same file Lessons 01–03 have been
building.

**Change type:** add two new methods to `MyApp`; no change to
`build()` itself.

**Location:** `on_pause`/`on_resume` sit alongside `build()` and
`update_label`, as new methods on the same class.

**Dependencies:** Lesson 03's `accelerometer.enable()` call and
`update_label`'s scheduled callback, both reused unchanged here.

```python
from kivy.app import App
from kivy.uix.label import Label
from kivy.clock import Clock
from kivy.logger import Logger
from plyer import accelerometer


class MyApp(App):
    def build(self):
        self.label = Label(text="Starting accelerometer...")
        accelerometer.enable()
        Clock.schedule_interval(self.update_label, 0.1)
        return self.label

    def update_label(self, dt):
        x, y, z = accelerometer.acceleration
        self.label.text = f"x={x}\ny={y}\nz={z}"
        Logger.info(f"MyApp: x={x} y={y} z={z}")

    def on_pause(self):                                                  # <- new
        Clock.unschedule(self.update_label)                              # <- new
        accelerometer.disable()                                          # <- new
        Logger.info("MyApp: paused — accelerometer disabled")            # <- new
        return True                                                      # <- new

    def on_resume(self):                                                 # <- new
        accelerometer.enable()                                           # <- new
        Clock.schedule_interval(self.update_label, 0.1)                  # <- new
        Logger.info("MyApp: resumed — accelerometer re-enabled")         # <- new


if __name__ == "__main__":
    MyApp().run()
```

### Mechanical Walkthrough

- `def on_pause(self):` — **first appearance**, full treatment above.
- `Clock.unschedule(self.update_label)` — **first appearance**, full
  treatment above (Objects and methods). Stops the *scheduling*, not
  the sensor — the two are independent actions, both needed, covered
  as separate lines on purpose rather than assumed to imply each
  other.
- `accelerometer.disable()` — **reappearing from Lesson 03's own
  Objects and methods treatment, first real use.** Lesson 03 named
  this method but never called it; this is its actual first use in the
  real project.
- `return True` (inside `on_pause`) — **first appearance of this
  return value's real meaning**, full treatment above. Not a generic
  Python `True` — this exact value is Android's own signal, via Kivy,
  that this app is capable of being paused and later resumed rather
  than needing to be fully stopped.
- `def on_resume(self):` — **first appearance**, full treatment above.
- `accelerometer.enable()` / `Clock.schedule_interval(self.update_label, 0.1)` —
  **both reappearing exactly from `build()`, called a second time.**
  The same two calls that started things running the first time,
  called again here because pausing genuinely turned both off — this
  is not a different, resume-specific mechanism, it's the identical
  startup sequence, run again.

### Execution Trace

**Same honesty note as this whole project:** predicted output,
verified against Kivy's real documentation, not a captured run.

1. `build()` runs once: sensor enabled, polling starts, exactly as
   Lesson 03 already established.
2. The user presses Home. Predict `on_pause()` runs:
   `Clock.unschedule` stops `update_label` from firing again,
   `accelerometer.disable()` turns the real sensor off, and the real
   log line confirms it — `return True` tells Android this app is safe
   to hold in the background rather than kill outright.
3. While paused, predict *zero* further `Logger.info` lines from
   `update_label` appear — the polling genuinely stopped, not merely
   invisible.
4. The user reopens the app. Predict `on_resume()` runs: the sensor
   turns back on, polling resumes at the same `0.1`-second interval as
   before, and a fresh `Logger.info` line confirms it.
5. Alternative real outcome: the OS fully kills the paused app instead
   of holding it (common under real memory pressure, or after a long
   enough pause). Predict `on_resume()` never runs in this case — the
   next thing that happens is a fresh `build()`, the same cold start
   Lesson 01 first established, with no memory of ever having been
   paused at all.

### CS Lens

**Turning off a source of repeated work exactly when its output stops
being observable is a real, general resource-management discipline**
— recognized well beyond mobile app pause states: a video player
pausing its decode pipeline when its own tab is backgrounded in a
browser; a server closing idle database connections instead of
holding them open indefinitely; a monitoring dashboard stopping its
own polling loop when its browser tab isn't the active one. The shared
reasoning is identical every time: work whose result nothing can
currently observe is close to pure waste, and the systems that handle
this well are exactly the ones that notice the observer left.

### SE Lens

**Why does this lesson call the exact same two lines
(`accelerometer.enable()` / `Clock.schedule_interval(...)`) in both
`build()` and `on_resume()`, instead of factoring them into one shared
method called from both places?** This is a real, live design choice,
left as this lesson's own honest tradeoff rather than resolved
silently: duplicating two lines is small enough to read clearly in
both places at once; a shared `start_polling()` method would remove
the duplication at the cost of one more layer of indirection for a
reader to follow. Real projects lean either way depending on how much
more logic accumulates at each call site over time — worth revisiting
if either method ever grows past a couple of lines, not a rule to
apply here pre-emptively.

---

## Connect the Pieces

`on_pause`, run by Android through Kivy at a moment this project's own
code never chooses, is where `Clock.unschedule` and
`accelerometer.disable()` — one stopping the *asking*, one stopping
the *hardware* — together end Lesson 03's polling loop cleanly.
`on_resume`, when it runs at all, restarts the exact same sequence
`build()` used the first time. Step 1's own throwaway proof — plain
`print` calls, no sensor involved — already showed both the ordinary
case (pause, then resume) and the real, harder case (paused, then
never resumed) before either mattered to a single real reading.

## What Breaks Without This

Remove `on_pause`/`on_resume` entirely and go back to Lesson 03's
original, unpaused behavior — polling runs continuously regardless of
whether the app is visible.

Predicted result: nothing crashes, and nothing about the app's visible
behavior changes at all when foregrounded — which is exactly the
danger. The real cost is invisible from inside the app itself: real
battery spent on a real sensor and a real ten-times-a-second Python
callback, for however long the app sits paused in the background,
producing log lines and readings nothing will ever display. Confirm
this for yourself by watching `logcat` continue to show fresh
`Logger.info` lines after pressing Home, with the un-fixed version —
then restore the pause/resume handling and confirm the lines actually
stop.

## Exercises

1. Add a `Logger.info` call inside `on_pause` logging how many total
   ticks `update_label` had run since the app started, using a counter
   field similar to Lesson 02's own. Confirm the count stops changing
   while paused and resumes climbing afterward.
2. Force-stop the app from Android's own system app-info screen while
   it's paused (not just backgrounded), rather than waiting for the OS
   to reclaim it naturally. Confirm `on_resume` never runs, and that
   reopening the app afterward is a genuine fresh `build()`, per this
   lesson's own predicted alternative outcome.
3. Try returning `False` from `on_pause` instead of `True`, then press
   Home. Predict, then confirm, what actually happens — does the app
   pause, or does something closer to `on_stop`'s behavior occur
   instead?

## Definition of Done

- [ ] You ran Step 1's scratch file and saw the real
      `build()`/`on_pause()`/`on_resume()` order for yourself, at
      least once with a genuine pause-then-resume.
- [ ] You also saw, at least once, the pause-then-never-resume case —
      either by letting Step 1's own timer run out while backgrounded,
      or by force-stopping a paused app in Exercise 2.
- [ ] You ran the real Step 2 code and confirmed, via real `logcat`
      output, that polling genuinely stops while paused and genuinely
      resumes afterward — not merely invisible the whole time.
- [ ] You can explain, without looking, what `on_pause` returning
      `True` actually promises Android, and what happens if it
      returns `False` instead.
- [ ] You can state, in your own words, why `on_resume` is not
      guaranteed to run, and what that means for any state a real app
      might need to save before pausing.
- [ ] Commit: the updated `main.py`.
