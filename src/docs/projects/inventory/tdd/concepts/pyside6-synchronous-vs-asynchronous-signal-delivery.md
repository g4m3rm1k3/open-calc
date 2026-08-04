# Concept: Synchronous vs. Asynchronous Signal Delivery

**What you'll understand by the end:** that most Qt signals fire
**synchronously** — inline, before the triggering call even returns —
while a real few (like an async operation's own completion signal)
fire **asynchronously**, only once the event loop gets a chance to
run, and how to tell which one you're dealing with by actually
checking the order of events, not assuming.

**Prerequisites:** `pyside6-signals-and-slots.md`, `event-loop.md`,
`pyside6-model-view-with-qfilesystemmodel.md`.

## Setup

Python 3 with `pip install PySide6`.

## The Problem

Two real, different-feeling Qt behaviors both go through the identical
signal/slot mechanism, and code depending on the wrong assumption
about *when* a connected handler actually runs can break in real,
subtle ways: does a handler connected to a signal run **immediately**,
before the code that triggered it continues — or does it run **later**,
once something else (the event loop) gets a turn?

## The Isolated Example

The default, synchronous case:

```python
import sys
from PySide6.QtWidgets import QApplication, QPlainTextEdit

app = QApplication.instance() or QApplication(sys.argv)

order_of_events = []

editor = QPlainTextEdit()
editor.textChanged.connect(lambda: order_of_events.append("handler ran"))

order_of_events.append("before setPlainText")
editor.setPlainText("hello")
order_of_events.append("after setPlainText")

print(order_of_events)
```

**Real output, run this session:**
```
['before setPlainText', 'handler ran', 'after setPlainText']
```

A genuinely asynchronous case, for direct contrast:

```python
import time
from PySide6.QtWidgets import QApplication, QFileSystemModel

app = QApplication.instance() or QApplication(sys.argv)

order_of_events = []

model = QFileSystemModel()
model.directoryLoaded.connect(lambda path: order_of_events.append("handler ran"))

order_of_events.append("before setRootPath")
model.setRootPath("/some/real/directory")
order_of_events.append("after setRootPath, BEFORE the event loop runs")

deadline = time.monotonic() + 3
while time.monotonic() < deadline and "handler ran" not in order_of_events:
    app.processEvents()
    time.sleep(0.01)

order_of_events.append("after pumping the event loop")

print(order_of_events)
```

**Real output, run this session:**
```
['before setRootPath', 'after setRootPath, BEFORE the event loop runs', 'handler ran', 'after pumping the event loop']
```

**What this proves:** `textChanged`'s handler ran **between**
`"before setPlainText"` and `"after setPlainText"` — genuinely inline,
before `setPlainText` itself even returned. `directoryLoaded`'s
handler, by real contrast, ran **after** `"after setRootPath, BEFORE
the event loop runs"` — `setRootPath` itself returned long before the
handler ever fired; the handler only ran once the event loop
(`app.processEvents()`, called in a loop) actually got a chance to
process it.

## Mechanical Walkthrough

- **Synchronous delivery** is the real, default behavior for most Qt
  signals: `.emit()` (called internally by `setPlainText` here) calls
  every connected slot **directly**, right then, as an ordinary
  function call — the emitting code doesn't continue past that point
  until every connected handler has finished running.
- **Asynchronous delivery** applies to signals representing a real,
  genuinely time-consuming operation that can't complete instantly
  (per `pyside6-model-view-with-qfilesystemmodel.md`'s own real
  directory-scan example) — the triggering call (`setRootPath`)
  returns immediately, and the real work happens later, announced via
  the signal only once it actually finishes, which requires the event
  loop to run.
- There is no single, real syntactic marker distinguishing the two —
  both are ordinary `.connect(...)` calls on ordinary signals; knowing
  which timing behavior a specific real signal has requires either
  documentation or, as shown here, directly testing the real order of
  events.
- This project's own real code depends on knowing the synchronous case
  correctly: `MainWindow._open_path` assigns `current_path` **before**
  calling `setPlainText`, specifically because a connected panel's
  `refresh()` handler runs *during* `setPlainText` and reads
  `current_path` at that exact moment — getting the order backward
  would mean the handler reads a stale or missing `current_path`.

## CS Lens

This is a real, concrete instance of the general distinction between
**synchronous** and **asynchronous** execution (`event-loop.md`'s own
"wait, then react" framing, here narrowed to a single signal's real
delivery timing) — the identical underlying signal/slot *mechanism*
(Observer, per `pyside6-signals-and-slots.md`'s own CS Lens) can be
wired to either timing behavior depending on what's actually emitting
it, and a reader has to know which one applies to reason correctly
about ordering.

Also recognized in: JavaScript's own synchronous DOM event dispatch
(a `click` handler runs inline, blocking further script execution)
versus a `fetch()` Promise's callback (genuinely deferred, running only
once the current synchronous code finishes and the event loop
processes the resolved Promise) — the identical real sync/async
contrast, a different language and API surface.

## SE Lens

The real, practical risk of assuming the wrong timing: code relying on
a handler having *already run* by the time a call returns (correct for
synchronous signals) would read stale or default data if the same
assumption were applied to an asynchronous one — and the reverse,
code adding an unnecessary event-loop-pumping wait around a call that
was always synchronous, wastes real effort solving a problem that
never existed. The real, correct practice: verify a specific signal's
real delivery timing (by testing, as done here, or by checking real
documentation) rather than assuming based on how "slow-sounding" the
underlying operation seems — `setPlainText` sounds instantaneous and
is; `setRootPath` sounds instantaneous too, but genuinely isn't.

## Connection

Builds on `pyside6-signals-and-slots.md`, `event-loop.md`, and directly
contrasts with `pyside6-model-view-with-qfilesystemmodel.md`'s own
real async example. This project's own real ordering fix
(`current_path` before `setPlainText`) is a direct, applied consequence
of correctly understanding `textChanged`'s synchronous delivery.

## Try It Yourself

1. Move the `order_of_events.append("before setPlainText")` line to
   *after* `setPlainText` instead, and confirm the real, resulting
   order changes — direct, hands-on proof of exactly where in the
   timeline the synchronous handler actually runs.
2. Connect a handler to a signal you haven't checked the timing of
   before, and write a small, real "order of events" test like this
   file's own two examples to determine, empirically, which category
   it falls into — rather than guessing.
3. Explain, in your own words, why `pyside6-manual-event-loop-pumping-
   for-async-test-waiting.md`'s own technique (manually pumping
   `processEvents()`) is only ever necessary for the asynchronous case
   — what would happen if you tried applying it, unnecessarily, around
   a call to a purely synchronous signal like `textChanged`?
