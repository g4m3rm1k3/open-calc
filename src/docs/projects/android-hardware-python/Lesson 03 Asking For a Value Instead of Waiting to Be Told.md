# Lesson 03: Asking For a Value Instead of Waiting to Be Told

**What you will build:** the phone's real accelerometer, polled ten
times a second and shown on Lesson 02's already-proven live-updating
label — real hardware, for the first time in this series, using the
exact scheduling mechanism Lesson 02 already isolated and trusted.
The transferable problem, and the one genuinely new idea this lesson
adds: this project's hardware access library doesn't *tell* your code
when a new reading exists — your code has to *ask*, on its own
schedule, every single time.

**What you need to know first:** Lesson 02 in full — `Clock.schedule_interval`,
a callback updating a label repeatedly.

**Terms introduced in this lesson:**
- **Pull-based sensor access** — a hardware API where reading the
  current value is a separate, on-demand action your own code
  performs, as often as it chooses — as opposed to a push-based
  (callback/listener) design, where the hardware or OS calls your code
  the moment a new value exists, unprompted. Plyer's sensor facades are
  pull-based: nothing runs *for* you when the accelerometer produces a
  new reading. If nothing in this project ever asks again, the last
  value read is simply never updated.

**Objects and methods this lesson uses:**
- **`plyer.accelerometer`**
  - *What it is:* Plyer's cross-platform accelerometer facade —
    Python's own version of asking the OS for access to hardware you
    didn't create yourself, the same underlying need every hardware
    lesson in this project will keep returning to, whatever the
    specific API looks like each time.
  - *Implementation:* imported as a ready-to-use object, not a class
    you construct — `plyer.accelerometer.enable()`,
    `plyer.accelerometer.disable()`, and the `.acceleration` property,
    covered next.
  - *Its use:* this lesson's entire real subject.
- **`accelerometer.enable()` / `accelerometer.disable()`**
  - *What they are:* turn the underlying hardware sensor on and off.
  - *Implementation:* `enable()` may raise an error on a device with no
    accelerometer at all — not handled yet in this lesson, a real,
    open gap named honestly in this lesson's own SE Lens.
  - *Its use:* called once each, in this lesson's real code below.
- **`accelerometer.acceleration`**
  - *What it is:* the current reading, read on demand.
  - *Implementation:* a property, not a method — read with no
    parentheses; returns a `(x, y, z)` tuple of real acceleration
    values, or `(None, None, None)` if no reading is currently
    available.
  - *Its use:* read once per scheduled tick, below — a fresh read
    every single call, never cached automatically between calls.

---

## Concept Unit: Nothing Calls You — You Have to Call It

### The Problem

Lesson 02 proved the *scheduling* half of this project's live-value
pattern with a fake, self-incrementing number — a number that changes
because this project's own code changed it, on its own schedule,
which was never in question. A real sensor is different: the actual
new reading is produced by hardware and the OS, on their own timing,
outside this project's control entirely. Plyer's own design — pull,
not push — means the only way to ever see a new reading is to ask
again, and Lesson 02's `Clock.schedule_interval` turns out to be
exactly the right tool for asking repeatedly, not because it was built
for sensors specifically, but because "do this again, on a timer" is
exactly what polling actually is.

### Introduce the Concept in Isolation — Step 1: A Fake "Sensor" That Only Answers When Asked

Scratch file, no Kivy, no real hardware:

```python
import random

class FakeSensor:
    def read(self):
        return round(random.uniform(-1.0, 1.0), 3)

sensor = FakeSensor()

print("Nothing has called read() yet — no value exists anywhere.")
print("First read:", sensor.read())
print("Second read:", sensor.read())
print("Third read:", sensor.read())
```

Run it. Expected output — three real, independently random values,
proving each one only exists *because* `.read()` was called again:

```
Nothing has called read() yet — no value exists anywhere.
First read: 0.482
Second read: -0.107
Third read: 0.916
```

Nothing in `FakeSensor` ever calls your code — there's no listener to
register, no callback to provide, per Terms above. If this script
simply stopped calling `.read()`, no error would occur and no value
would ever go stale in an observable way — it would just never be
asked again. This is the exact shape `plyer.accelerometer.acceleration`
has in the real code below, minus the real hardware behind it.

**Discard this scratch file.**

### The Real Thing

**Reference Source:** no reference counterpart — Plyer's accelerometer
facade API is confirmed by reading its actual source
(`plyer/facades/accelerometer.py`) this session, not assumed from
memory.

**Files affected:** `main.py`, `buildozer.spec` (a new dependency and
a new permission — covered in the Mechanical Walkthrough).

**Change type:** replace Lesson 02's fake counting logic in
`update_label`; add to `buildozer.spec`.

**Location:** inside `MyApp`, replacing Lesson 02's `update_label`
body; a new line in `buildozer.spec`'s `[app]` section.

**Dependencies:** `plyer` itself, added to `buildozer.spec`'s
`requirements`.

```ini
requirements = python3,kivy,plyer
android.permissions = android.permission.BODY_SENSORS
```

```python
from kivy.app import App
from kivy.uix.label import Label
from kivy.clock import Clock
from kivy.logger import Logger
from plyer import accelerometer                                          # <- new


class MyApp(App):
    def build(self):
        self.label = Label(text="Starting accelerometer...")             # <- changed from Lesson 02
        accelerometer.enable()                                            # <- new
        Clock.schedule_interval(self.update_label, 0.1)
        return self.label

    def update_label(self, dt):
        x, y, z = accelerometer.acceleration                              # <- new
        self.label.text = f"x={x}\ny={y}\nz={z}"                          # <- new
        Logger.info(f"MyApp: x={x} y={y} z={z}")                          # <- new


if __name__ == "__main__":
    MyApp().run()
```

### Mechanical Walkthrough

- `android.permissions = android.permission.BODY_SENSORS` — **first
  appearance of a `buildozer.spec` permission line.** Declared here,
  in this project's build config, rather than requested at runtime —
  motion sensors are a normal, not a dangerous, Android permission
  (confirmed consistent with how this category of sensor behaves on
  Android generally); this project's later Bluetooth lessons will need
  a genuinely different, runtime-requested kind of permission, and the
  contrast is worth remembering once that lesson arrives.
- `requirements = python3,kivy,plyer` — **reappearing field from
  Lesson 01, new dependency.** `plyer` has to be listed explicitly, the
  same way `kivy` itself did — nothing is available inside the built
  app that wasn't declared here.
- `from plyer import accelerometer` — **first appearance**, full
  treatment above (Objects and methods). Imported as a ready object,
  not a class — there is no `Accelerometer()` constructor call
  anywhere in this file.
- `accelerometer.enable()` — **first appearance**, full treatment
  above. Called once, in `build()`, not repeated on every tick — this
  lesson turns the sensor on once and leaves it on for the whole
  session; turning it back off is Lesson 04's own subject, not this
  one's.
- `x, y, z = accelerometer.acceleration` — **first appearance of the
  property read, and of this exact tuple-unpacking shape in this
  series.** Read fresh, every single call to `update_label` — nothing
  about this line reuses a previous reading; per Step 1's isolated
  proof, an unread value simply never happens, not a stale one.
- `f"x={x}\ny={y}\nz={z}"` — **ordinary Python f-string formatting,
  already assumed knowledge** — worth noting only because `\n` inside
  a `Label`'s `text` produces a real, visible multi-line label, not an
  escaped, literal backslash-n.

### Execution Trace

**Same honesty note as this whole project:** predicted output,
verified against Plyer's own real source and Kivy's documentation,
not a captured run — this one specifically needs real hardware to
confirm, more than any lesson so far.

1. `build()` runs. `accelerometer.enable()` turns the sensor on.
   `Clock.schedule_interval` begins polling, reusing Lesson 02's exact
   mechanism, now targeting a real property instead of a fake counter.
2. Predict, for a phone lying flat and still: `x` and `y` close to
   `0`, `z` close to `9.8` — real, gravity-inclusive behavior confirmed
   from Plyer's own documentation and Android's real accelerometer
   behavior, not an assumption.
3. Predict the on-screen label visibly updates ten times a second,
   and a real `Logger.info` line logs the same values, once per tick —
   more frequent logging than Lesson 02's deliberately-throttled
   version, acceptable here since three short numbers is far less
   log volume than the incrementing-counter case ever needed to worry
   about.
4. Pick the phone up and tilt it. Predict the on-screen values change
   visibly and immediately, on the very next scheduled tick — at most
   0.1 seconds of real delay, not a longer, noticeable lag.

### CS Lens

**Polling — repeatedly asking whether something has changed, on a
fixed schedule, instead of being told the moment it does — is a real,
named tradeoff against push-based notification**, recognized far
beyond this one lesson: a browser tab checking `document.title` for
changes versus subscribing to a real DOM mutation event; an
old-style program checking a file's modified-time in a loop instead of
using the OS's own file-change notification API; a taskbar clock
redrawing itself every second rather than being told the exact instant
each second ticks over. The real, general tradeoff every one of these
shares: polling is simpler to reason about and never needs a callback
registration step at all, at the cost of a real, structural gap
between when something actually changes and when your code next
happens to notice.

### SE Lens

**What does this lesson deliberately leave unhandled, and why is that
an honest, named gap rather than a silent one?** `accelerometer.enable()`
is called with no error handling at all — on a device with no
accelerometer, Plyer's own facade documents that this can raise a real
exception, and this lesson's code would crash immediately, on the very
first line of `build()`. This is a real, recurring tension in any
lesson introducing a new mechanism: catching every possible failure
in the *very first* lesson introducing it would bury the one new idea
(pull-based polling) under defensive code that isn't this lesson's
actual subject. The honest choice made here: leave it
unhandled, name the gap outright, and let a later lesson — once
polling itself is old news — be the one that adds the real check.

---

## Connect the Pieces

`plyer.accelerometer`, this project's first real hardware access, is
pull-based — Step 1's fake `FakeSensor.read()` already proved, with no
real hardware involved, that nothing calls your code back on its own;
a value only exists at the moment something asks for it. Lesson 02's
`Clock.schedule_interval`, built and trusted before this lesson ever
needed it, turns out to be exactly the tool "ask again, repeatedly, on
a timer" requires — polling and scheduled callbacks are, at this
level, the same mechanism serving two different purposes.

## What Breaks Without This

Call `accelerometer.enable()` once, then read `.acceleration` exactly
once, immediately after, with no polling at all:

```python
def build(self):
    accelerometer.enable()
    x, y, z = accelerometer.acceleration   # <- read once, immediately
    self.label = Label(text=f"x={x} y={y} z={z}")   # <- never updates again
    return self.label
```

Predicted result: on real hardware, the very first reading —
sometimes taken before the sensor has actually produced its first real
value yet — can legitimately be `(None, None, None)`, per this
facade's own documented behavior, and the label would then show that
placeholder forever, since nothing ever asks again. Restore the
scheduled polling version, and confirm for yourself that repeated
asking is what actually produces a real, non-`None` reading reliably.

## Exercises

1. Log `accelerometer.acceleration` immediately after `enable()`,
   before any scheduling begins, and confirm for yourself whether your
   own device's first real reading is ever actually `(None, None,
   None)` or already valid immediately.
2. Compute a real magnitude from `x`, `y`, `z` (`(x**2 + y**2 +
   z**2) ** 0.5`) and show it on the label alongside the three raw
   values. Confirm it stays close to `9.8` while the phone is still —
   a real, physical sanity check on gravity's own magnitude.
3. Change the polling interval from `0.1` to `1.0` and observe, by
   physically shaking the phone between updates, how much real motion
   information gets missed between one read and the next — a direct,
   felt demonstration of polling's own named tradeoff from this
   lesson's CS Lens.

## Definition of Done

- [ ] You ran Step 1's scratch file and confirmed, with no real
      hardware involved, that a value only ever exists at the moment
      `.read()` is actually called.
- [ ] You ran the real Step 2 code on a real device and saw real,
      changing accelerometer values on screen, updating as you moved
      the phone.
- [ ] You can explain, without looking, the difference between
      pull-based and push-based sensor access, and which one Plyer's
      accelerometer facade actually is.
- [ ] You confirmed, for real, what a still and flat phone's `x`,
      `y`, `z` values actually are, and compared them to this lesson's
      prediction.
- [ ] You can state, in your own words, why this lesson left
      `enable()`'s potential failure unhandled on purpose, and what a
      real fix would need to check.
- [ ] Commit: the updated `main.py` and `buildozer.spec`.
