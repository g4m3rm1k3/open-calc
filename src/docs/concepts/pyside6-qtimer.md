# Concept: `QTimer` — a Time-Driven Signal Source

**What you'll understand by the end:** how `QTimer` emits its
`timeout` signal repeatedly at a fixed real interval, entirely on its
own, without any user interaction driving each firing — a genuinely
different *kind* of event source from every button click or text edit
a signal/slot connection normally responds to — and its real
`start()`/`stop()`/`isActive()` state.

**Prerequisites:** `pyside6-signals-and-slots.md`.

## Setup

Python 3 with `pip install PySide6`.

## The Problem

Every signal this project has used so far fires **because a user did
something** — clicked a button, typed a character, changed a tab.
Some real features (a live playback marker advancing on its own, a
periodic auto-save, a polling check) need code to run repeatedly, on a
real schedule, with **no** user action triggering each individual run
— a genuinely different real requirement a click-driven `QAction` or a
`textChanged` signal has no way to satisfy on its own.

## The Isolated Example

```python
ticks = []


def on_timeout():
    ticks.append(len(ticks))
    print("tick", ticks[-1])
    if len(ticks) >= 3:
        timer.stop()
        app.quit()


timer = QTimer()
timer.setInterval(50)
timer.timeout.connect(on_timeout)

print("before start -- isActive:", timer.isActive())
timer.start()
print("after start -- isActive:", timer.isActive())

app.exec()

print("after loop ends -- isActive:", timer.isActive())
print("total ticks:", len(ticks))
```

**Real output, run this session:**
```
before start -- isActive: False
after start -- isActive: True
tick 0
tick 1
tick 2
after loop ends -- isActive: False
total ticks: 3
```

**What this proves:** `on_timeout` fired **three separate times**,
with no code anywhere calling it directly — `app.exec()` is the
**only** call after `timer.start()`, yet `"tick"` printed three times
before the script's own final lines ran. `isActive()` genuinely
tracks the timer's real running state: `False` before `start()`,
`True` immediately after, and `False` again once `.stop()` was called
from inside the timeout handler itself.

## Mechanical Walkthrough

- `QTimer()` creates a real, inactive timer object — constructing it
  alone does **not** start anything.
- `.setInterval(milliseconds)` sets how often, in real milliseconds,
  the timer's own `timeout` signal fires once running — `50` here
  means roughly every 50 real milliseconds.
- `.timeout` is an ordinary Qt **signal**, connected to a slot exactly
  like any button's `clicked` signal — the genuinely new part isn't
  the connection mechanism, it's *what emits it*.
- `.start()` genuinely activates the timer — from this point on, Qt's
  own real event loop (`app.exec()`) is what actually delivers each
  `timeout` firing, at roughly the configured interval, for as long as
  the timer stays active.
- `.stop()` deactivates it — no further `timeout` signals fire after
  this, confirmed directly by `isActive()` correctly reporting `False`
  once called.
- `.isActive()` is a real, simple boolean query — whether the timer is
  currently running — useful for code elsewhere that needs to know
  "is this already going" before deciding whether to start or stop it
  again.

## CS Lens

This is a real instance of a **time-driven** (as opposed to
**event-driven** in the narrower, user-interaction sense) trigger — the
same underlying idea behind `browser-request-animation-frame.md`'s own
continuous render loop, just Qt's own, desktop-application-native
mechanism instead of a browser API. Both hand control of "when does
this run again" to the platform's own event loop, rather than the
application code manually looping and sleeping — which would block the
entire real UI from responding to anything else while it slept.

Also recognized in: `setInterval` in JavaScript (the closest direct
analog — a callback fired repeatedly, driven by the browser's own
event loop, not by manually-written looping code); a cron job (time-
driven, no user present to trigger each individual real run); any
polling loop checking a real external condition on a fixed schedule.

## SE Lens

The real, practical reason `QTimer` (backed by the real event loop)
is the right tool over a manual `while True: sleep(...)` loop: a
sleeping loop would **block** the entire application — no button
clicks, no repaints, nothing else could happen while it slept.
`QTimer` instead schedules its own `timeout` firing *through* the
event loop, the same real mechanism already responsible for delivering
every other signal — the rest of the application stays fully
responsive between firings, since nothing is ever blocked waiting.

## Connection

Builds on `pyside6-signals-and-slots.md` — `timeout` connects and
disconnects exactly like any other Qt signal; what's new here is the
real *source* triggering it, not the connection mechanism itself.
Directly parallel to `browser-request-animation-frame.md`'s own
time-driven render loop, Qt's own desktop-native equivalent. A real,
applied instance in this project's own history: a VCR-style playback
control (`Play`/`Pause`/`Step Forward`/`Step Back`) advancing a marker
through a program's own real motion timeline — `QTimer.timeout`,
fired on a fixed real interval while playing, is what drives each
automatic step forward, with `.stop()` called the moment a user pauses
or the underlying program is edited (invalidating the in-progress
playback position).

## Try It Yourself

1. Call `timer.start()` a second time while it's already active
   (before it ever stops) and confirm, via `isActive()`, that it's
   still just one real, running timer — reasoning about what a second,
   real `start()` call actually does to an already-running timer's own
   interval.
2. Set `setSingleShot(True)` on a fresh `QTimer` before starting it,
   and confirm its `timeout` signal fires exactly **once**, then
   `isActive()` reports `False` on its own — no explicit `.stop()`
   call needed, unlike this file's own repeating example.
3. Connect a second, independent slot to the same `timer.timeout`
   signal and confirm both slots run on every single firing — the
   identical real one-signal-many-slots behavior
   `pyside6-signals-and-slots.md` already establishes, now demonstrated
   against a time-driven signal instead of a user-driven one.
