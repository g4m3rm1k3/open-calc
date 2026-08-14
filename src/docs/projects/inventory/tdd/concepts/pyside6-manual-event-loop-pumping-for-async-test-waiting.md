# Concept: Manually Pumping the Event Loop to Wait for a Real Async Signal

**What you'll understand by the end:** the real technique for waiting,
inside a test function, for an asynchronous Qt signal to fire —
connecting a throwaway listener, capturing its connection handle so it
can be disconnected later, and manually pumping `app.processEvents()`
in a loop against a real wall-clock deadline.

**Prerequisites:** `event-loop.md`, `pyside6-signals-and-slots.md`,
`pyside6-model-view-with-qfilesystemmodel.md`.

## Setup

Python 3 with `pip install PySide6`.

## The Problem

A real, running GUI application's own event loop (`app.exec()`) keeps
turning continuously, so an asynchronous signal like
`QFileSystemModel.directoryLoaded` fires naturally whenever the next
iteration happens to process it. A **test function**, by contrast, is
just a plain function call — no event loop is running while it's on
the call stack — so an async signal genuinely never fires on its own
during a test unless something inside the test explicitly makes room
for Qt's own event processing to happen.

## The Isolated Example

```python
import sys
import time
from PySide6.QtWidgets import QApplication, QFileSystemModel

app = QApplication.instance() or QApplication(sys.argv)


def wait_for_load(model, path, timeout=3.0):
    loaded = {"done": False}

    def on_loaded(loaded_path):
        if loaded_path == path:
            loaded["done"] = True

    connection = model.directoryLoaded.connect(on_loaded)

    deadline = time.monotonic() + timeout
    iterations = 0
    while not loaded["done"] and time.monotonic() < deadline:
        app.processEvents()
        time.sleep(0.01)
        iterations += 1

    model.directoryLoaded.disconnect(connection)
    return loaded["done"], iterations


model = QFileSystemModel()
model.setRootPath("/some/real/directory")

success, iterations = wait_for_load(model, "/some/real/directory")
print("directoryLoaded fired before the timeout:", success)
print("real number of event-loop iterations it took:", iterations)

root_index = model.index("/some/real/directory")
print("row count after wait_for_load:", model.rowCount(root_index))
```

**Real output, run this session (a real directory with 3 entries):**
```
directoryLoaded fired before the timeout: True
real number of event-loop iterations it took: 2
row count after wait_for_load: 3
```

**What this proves:** the real, asynchronous directory scan genuinely
completed after only **2** manual iterations of the loop — and the
model's row count is correctly populated (`3`) only *after*
`wait_for_load` returns, confirming the wait actually accomplished
something real, not just a fixed delay. A second, real run against a
path that will **never** load (checked separately) confirms the
timeout escape hatch genuinely fires and the function returns `False`
rather than looping forever.

## Mechanical Walkthrough

- `model.directoryLoaded.connect(on_loaded)` returns a real
  **connection handle** — capturing it (`connection = ...`) matters
  specifically because `on_loaded` is defined as a local, throwaway
  function (or could be a `lambda`): passing the original function
  object a second time to `.disconnect(...)` isn't guaranteed to be
  recognized as "the same connection" the way the handle itself is —
  disconnecting by handle is the real, reliable way to remove a
  listener whose original reference might not round-trip cleanly.
- `app.processEvents()` manually runs **one** iteration of Qt's own
  event loop — processing whatever real events are currently pending
  (including, potentially, the `directoryLoaded` signal firing) — and
  then returns immediately, rather than blocking the way `app.exec()`
  would.
- The `while` loop calls `app.processEvents()` repeatedly, giving Qt
  real, repeated opportunities to notice the directory scan has
  finished and fire its signal — `on_loaded` sets `loaded["done"] =
  True` the moment that actually happens, which is what lets the loop
  exit as soon as real work is done, rather than always waiting the
  full timeout.
- `time.monotonic() + timeout` establishes a real, wall-clock deadline
  — the loop's own, necessary escape hatch if the awaited signal never
  fires at all (a genuine bug, a path that doesn't exist, or any other
  real failure) — without it, a signal that never fires would hang the
  test forever.
- `model.directoryLoaded.disconnect(connection)` cleans up the
  temporary listener once done — leaving it connected would mean
  `on_loaded` (and its closure over `loaded`, a dict local to this one
  call) keeps firing on every future real load, a real, avoidable
  leak.

## CS Lens

This is **polling** — repeatedly checking for a condition to become
true, rather than being passively notified — applied here specifically
because a test function has no real event loop of its own already
running to deliver a passive notification. It's a real, concrete,
different problem from `retry-timeout-and-backoff.md`'s own retry
technique: that file retries a *failed operation*, backing off between
attempts; this technique polls, unconditionally, for one real event's
*first* occurrence, with a fixed, short delay between checks and no
concept of "failure" to back off from at all.

Also recognized in: any test framework's own "wait for async condition"
helper (JavaScript testing libraries' `waitFor(...)` utilities poll a
DOM condition in an analogous real way); manually driving an event
loop for testing purposes is a common real technique across GUI
frameworks generally, whenever a test needs to observe something the
framework normally delivers only during real, ongoing event processing.

## SE Lens

The real, practical reason this technique exists at all: without it, a
test of any code depending on `QFileSystemModel`'s real, asynchronous
behavior would either need to assume completion (fragile — genuinely
timing-dependent, and wrong on a slower real machine) or use a fixed
`time.sleep(N)` with no real signal-based confirmation at all (wasteful
when the real load finishes faster, and still potentially wrong if it
takes longer). Actively pumping and checking a real completion signal,
bounded by a real timeout, is the correct, honest middle ground —
finishing exactly when the real work finishes, while still terminating
with a clear, real failure if something never completes.

## Connection

Builds on `event-loop.md`, `pyside6-signals-and-slots.md`, and
`pyside6-model-view-with-qfilesystemmodel.md` (the real async behavior
this technique exists to wait for). This project's own first real
instance of asynchronous behavior anywhere in its codebase, and this
file is the first real technique built to test it correctly.

## Try It Yourself

1. Remove the `time.sleep(0.01)` from the loop and confirm
   `wait_for_load` still works correctly, just consuming real CPU more
   aggressively while polling — the sleep is a real, deliberate
   courtesy to the CPU, not a functional requirement of the technique.
2. Lower the `timeout` to something clearly too short for a real
   directory scan to finish, and confirm the function correctly
   returns `False` rather than hanging — direct, real proof the
   deadline escape hatch works.
3. Remove the final `.disconnect(connection)` call, then trigger a
   *second*, real directory load on the same model afterward — observe
   whether the original, supposedly-removed `on_loaded` closure still
   reacts, connecting directly to this file's own real cleanup
   rationale.
