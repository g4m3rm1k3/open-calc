# Lesson 9: Doing Slow Work Without Freezing the Window

**What you will build.** Submitting a name now triggers a simulated,
deliberately slow "verification" step — standing in for something a
real program might actually do slowly, like a network request or a
disk-heavy computation — before the name is added to the history list.
Done naively, that slow step freezes the entire window for its whole
duration; this lesson moves it onto a separate thread so the window
stays fully responsive while it runs. The transferable problem this
lesson is actually about: every operation this curriculum's program has
ever performed — validating a name, updating a label, writing a file in
Lesson 8 — has been fast enough to finish before a human could ever
notice it happening at all, so nothing so far has had to confront a
fact this lesson makes unavoidable: `app.exec()`'s own event loop, first
explained in Lesson 1, is a single, one-at-a-time loop, and any code
that runs slowly inside a signal handler blocks that *entire* loop —
no other clicks, no other repaints, nothing — for exactly as long as
that slow code takes. Learning to recognize that danger, and the one
correct tool PySide6 provides for it, is this lesson's real subject.

**What you need to know first.** Lesson 1's `QApplication` and the
event loop. Lesson 2's signals and slots. Lesson 5's class subclassing,
`super().__init__()`, and custom `Signal`s. Lesson 7's
`GreetedNamesModel`, connected here to a new source.

**Terms used in this lesson**

- **Blocking the event loop** — running code slow enough, inside a
  signal handler or any other code that executes on the event loop's
  own thread, that the event loop cannot return to processing other
  events (clicks, repaints, timers) until that slow code finishes.
  Already implied by Lesson 1's own description of the event loop as a
  loop that "repeatedly checks for and dispatches events" — this term
  names the specific, real failure that happens when one single
  dispatched event refuses to give control back.
- **Thread** — an independent sequence of execution that a program can
  run alongside its main one, sharing the same process but progressing
  on its own, separate timeline. Exists because a single sequence of
  execution — the only kind every earlier lesson in this curriculum has
  ever used — has no way to do two genuinely separate things "at the
  same time"; a slow operation and the event loop that needs to keep
  running are exactly two such things.
- **Worker object** — an ordinary `QObject` whose entire job is doing
  one piece of real work, written so it can be moved onto a separate
  thread and run there instead of on the event loop's own thread. Not a
  special PySide6 class of its own — a design pattern, using ordinary
  tools this curriculum has already covered, for organizing code that's
  meant to run off the main thread.
- **Thread affinity** — which specific thread a given `QObject`
  "belongs to," determining which thread's own event loop actually runs
  that object's slots when a signal connected to it fires. Exists
  because PySide6, underneath, is genuinely running more than one
  thread once this lesson's own pattern is used, and something has to
  define, unambiguously, which thread is actually responsible for
  executing which code.

**Objects and methods used**

- **`class VerifyWorker(QObject):`**
  - *What it is:* not a class PySide6 provides — a new class, written
    for this project, representing this lesson's own **worker object**,
    already defined above: a plain `QObject` (not a `QWidget` — this
    class has no visible content at all) whose entire job is performing
    one slow operation and announcing its result.
  - *Implementation:* a Python class statement, inheriting from
    `QObject` directly — confirmed this session, `QObject`'s own real
    inheritance chain is simply `QObject → Object → object`, the
    shortest chain of any class this curriculum has subclassed, since
    it carries none of `QWidget`'s own visual machinery at all — the
    same `class Name(BaseClass):` and `super().__init__(parent)`
    pattern already fully explained in Lesson 5, applied here to a base
    class with no display capability whatsoever, the same
    non-visual role Lesson 7 already established for
    `QAbstractListModel`.
  - *Its use:* this lesson needs a real object to represent "the slow
    verification work for one specific name," constructed fresh for
    each submission, that can be handed off to run on a separate
    thread.
  - *Type:* a class, this project's own new addition.
  - *Responsibility:* holds the one piece of data it needs (the name
    being verified) and, when asked, performs the actual slow work and
    announces the result via its own signal — nothing about *how* or
    *where* it runs is this class's own concern; that's decided
    entirely by the code that constructs and uses it, covered next.
  - *Depends on:* `QObject`, the class it inherits from, which provides
    the real thread-affinity and signal/slot machinery this whole
    lesson depends on.
  - *Connects to:* a `QThread`, covered below, via `.moveToThread(
    ...)`; its own `verified` signal, covered below, connected directly
    to `GreetedNamesModel.add_name`, from Lesson 7.
  - *Shape:* one object per verification — confirmed this session, a
    fresh `VerifyWorker` constructed for one specific name, run once,
    and never reused.

- **`QThread`**
  - *What it is:* the class representing a real, separate thread of
    execution.
  - *Implementation:* a class in `PySide6.QtCore`, constructed here as
    `QThread()`, with no required arguments. Its real inheritance
    chain, confirmed this session — `QThread → QObject → Object →
    object` — shows it is, itself, an ordinary `QObject` too, meaning
    it has its own real signals (`started` and `finished`, both used in
    this lesson) and can itself be a signal/slot participant, the same
    mechanism already fully explained since Lesson 2.
  - *Its use:* this lesson needs a genuine, separate thread for the
    verification work to actually run on, distinct from the thread the
    event loop itself runs on — confirmed this session, `QThread
    .currentThread()`, called from inside a worker's own method while
    running on a started `QThread`, correctly reports back a different
    object than `QApplication.instance().thread()`, the main thread.
  - *Type:* a class, instantiated once per verification, mirroring
    `VerifyWorker` itself.
  - *Responsibility:* runs its own independent event loop, on its own
    real operating-system thread, once `.start()` is called — separate
    entirely from the main event loop Lesson 1 first explained, though
    built from the identical underlying concept.
  - *Depends on:* being given something to actually run — in this
    lesson's own pattern, that's a worker object's method, connected to
    this thread's own `started` signal, covered next.
  - *Connects to:* `VerifyWorker`, via `.moveToThread(...)`; this
    lesson's own code, via `.start()`, `.quit()`, and its own `started`
    and `finished` signals.
  - *Shape:* one object representing one real thread — confirmed this
    session, `.isRunning()` correctly reports `True` immediately after
    `.start()`.

- **`VerifyWorker.moveToThread(thread)`**
  - *What it is:* the method that changes a `QObject`'s own **thread
    affinity**, already defined in this lesson's Terms section, above
    — reassigning which thread is responsible for running that
    object's own slots.
  - *Implementation:* an instance method, inherited from `QObject`,
    real signature `moveToThread(thread: QThread) -> None`.
  - *Its use:* this lesson calls it once per verification, moving a
    freshly constructed `VerifyWorker` onto a freshly constructed
    `QThread`, before that thread is started.
  - *Type:* an ordinary instance method, called on the worker (`worker
    .moveToThread(thread)`) — not `static`.
  - *Responsibility:* from this call forward, any slot connected to
    this specific worker object will actually execute on the given
    thread, not on whatever thread happened to emit the connected
    signal — confirmed directly this session: `worker.run()`, connected
    to `thread.started`, printed `QThread.currentThread()` as the
    genuinely different, non-main thread object, exactly the thread
    this method moved it onto.
  - *Depends on:* a `QThread` that has not yet been started — moving an
    object onto an already-running thread is possible but not the
    pattern this lesson uses.
  - *Connects to:* every one of `VerifyWorker`'s own slots, from this
    point forward, until (or unless) it's moved again.
  - *Shape:* returns `None`.

- **The `started` and `finished` signals, on `QThread`**
  - *What they are:* two real signals `QThread` itself provides —
    `started`, firing the moment the thread's own event loop actually
    begins running; `finished`, firing once that thread's own event
    loop has stopped.
  - *Implementation:* confirmed this session, both are real
    `SignalInstance` objects, the same mechanism as every other signal
    in this curriculum since Lesson 2; `started` carries no arguments —
    it exists purely to signal "the thread is now live and ready to
    run something."
  - *Its use:* this lesson connects `started` directly to
    `worker.run` — the actual slow work — so that work begins the
    moment the thread genuinely starts running, not before; `finished`
    is connected to `thread.deleteLater`, covered below, to correctly
    clean up the thread object once it's done.
  - *Type:* attribute accesses returning live `SignalInstance` objects.
  - *Responsibility:* `started` fires exactly once, at the real moment
    a call to `.start()` actually causes this thread's own execution to
    begin; `finished` fires exactly once, after the thread's own run
    method (here, indirectly, `worker.run`, via the connection this
    lesson makes) has returned and the thread is winding down.
  - *Depends on:* `.start()` being called, for `started`; the thread's
    own work actually completing, for `finished`.
  - *Connects to:* `worker.run` (for `started`) and `thread.deleteLater`
    (for `finished`), both covered in this lesson's own project code.
  - *Shape:* both are signals carrying no arguments — unlike every
    signal in this curriculum since Lesson 2's own `clicked`, neither
    passes any value to its connected slots.

- **`worker.verified` (this lesson's own custom `Signal(str)`) and
  `.emit(name)`**
  - *What it is:* a signal, declared on `VerifyWorker` the identical
    way Lesson 5's `NameGreeter.greeted` was declared — `Signal(str)`,
    as a class attribute — announcing that this specific worker's slow
    verification has finished, and carrying the verified name.
  - *Implementation:* the exact `Signal(str)` construct already fully
    explained in Lesson 5; called here as `self.verified.emit(self
    ._name)` from inside `run()`, after the slow work completes.
  - *Its use:* this is the one piece of information this whole
    background operation needs to report back — which name was
    verified — and it's the signal this lesson connects directly to
    `GreetedNamesModel.add_name`, from Lesson 7.
  - *Type:* a class-level `Signal` declaration, producing a real,
    per-instance `SignalInstance`, identical to every detail Lesson 5
    already confirmed for `NameGreeter.greeted`.
  - *Responsibility:* announces exactly once per worker, carrying
    exactly the name that worker was constructed with — confirmed this
    session, connecting it directly to `history_model.add_name`
    correctly grew the model by exactly one row, with exactly the
    submitted name, only after the full simulated delay had passed —
    confirmed by `rowCount()` still reporting `0` immediately after
    the triggering click, and reporting `1` only once the delay had
    genuinely elapsed.
  - *Depends on:* `run()` actually completing its slow work first.
  - *Connects to:* `GreetedNamesModel.add_name`, from Lesson 7 — the
    exact same "connect a signal directly to a bound method, no
    intermediate function needed" pattern Lesson 7 already
    established, here crossing a real thread boundary for the first
    time in this curriculum.
  - *Shape:* not a value — a live announcement channel, the same shape
    every signal in this curriculum has had since Lesson 2 — carrying
    one `str`, this signal's own declared shape.

- **`thread.deleteLater()`**
  - *What it is:* a method, inherited from `QObject`, that schedules an
    object to be deleted safely, once the event loop next has a chance,
    rather than deleting it immediately, right where it's called.
  - *Implementation:* an instance method, real signature `deleteLater()
    -> None`.
  - *Its use:* this lesson connects `thread.finished` to `thread
    .deleteLater`, so the `QThread` object itself is cleaned up
    correctly once it's genuinely done running — not deleted while it
    might still be finishing up internally.
  - *Type:* an ordinary instance method, inherited, not `static`.
  - *Responsibility:* avoids deleting a `QObject` — here, the thread
    itself — at a moment that could be unsafe, by deferring the actual
    deletion to a point the event loop itself chooses as safe.
  - *Depends on:* an event loop that will eventually run again to
    actually process the deferred deletion — the same real, running
    event loop every deferred or delayed mechanism in this curriculum,
    since Lesson 1, has ultimately depended on.
  - *Connects to:* `thread.finished`, this lesson's own connection.
  - *Shape:* returns `None`; its effect is entirely the side effect of
    a deletion that happens later, not immediately.

**Everything else in the file, not this lesson's subject but already
covered.**

- **`time.sleep(seconds)`** — a standard-library function that pauses
  the *current* thread for the given number of seconds, doing nothing
  else during that time. Used in this lesson's own `VerifyWorker.run`
  to stand in for genuinely slow real work; its choice of *which*
  thread it pauses — whichever thread actually calls it — is precisely
  what this entire lesson is about.
- **`QTimer`** — briefly used in this lesson's own verification labs,
  already flagged as test scaffolding, not fully explained, back in
  Lesson 1's own third Concept Unit; used again here the same way, to
  measure whether the event loop keeps responding during the slow work.

---

## Concept Unit: Proving the Freeze

### The Problem

Every operation this curriculum's program has performed so far —
validating a name, updating a label, appending to a list — finishes in
a small enough fraction of a second that nothing about the event loop's
own single-threaded nature has ever mattered. A real program often
needs to do something genuinely slow in response to user action — a
network request, a large computation, a slow disk operation. If that
slow work is simply written directly inside a connected slot, the same
way every slot in this curriculum has been written since Lesson 2,
what actually happens to the rest of the program while it runs?

> Before reading on: Lesson 1 already established that `app.exec()`
> runs a loop that "repeatedly checks for and dispatches events," and
> that this loop is what makes a click actually get noticed and
> reacted to at all. If one single dispatched event — say, a
> `clicked` signal's own connected slot — took three full seconds to
> return, using ordinary, blocking code like `time.sleep(3)`, what do
> you predict happens to any *other* click the user makes during those
> three seconds? Does the event loop somehow "notice" the second click
> and queue it up for later, or does something more fundamental prevent
> it from being noticed at all until the first slot finally returns?

### Introducing the Concept, in Isolation

```python
from PySide6.QtWidgets import QApplication
from PySide6.QtCore import QTimer
import sys, time

app = QApplication(sys.argv)

tick_times = []
def tick():
    tick_times.append(time.monotonic())

timer = QTimer()
timer.timeout.connect(tick)
timer.start(10)  # fire every 10ms

start = time.monotonic()

def do_slow_work_directly():
    print("  starting slow work directly on main thread...")
    time.sleep(0.3)  # simulate a slow operation, blocking
    print("  slow work done")

QTimer.singleShot(20, do_slow_work_directly)

def stop():
    app.quit()

QTimer.singleShot(500, stop)
app.exec()

end = time.monotonic()
print(f"total wall time: {end - start:.3f}s")
print(f"number of timer ticks recorded: {len(tick_times)}")
if len(tick_times) >= 2:
    gaps = [tick_times[i+1]-tick_times[i] for i in range(len(tick_times)-1)]
    print(f"largest gap between ticks: {max(gaps)*1000:.1f}ms")
```

Real output from running this, this session, headless:

```
  starting slow work directly on main thread...
  slow work done
total wall time: 0.475s
number of timer ticks recorded: 18
largest gap between ticks: 300.6ms
```

A `QTimer` set to fire every 10 milliseconds should, over roughly 500
milliseconds, produce something close to 50 ticks, each one about 10
milliseconds apart. Instead, this run recorded only 18 — and the
largest single gap between two consecutive ticks was `300.6ms`, almost
exactly matching the `0.3` second `time.sleep(0.3)` call inside
`do_slow_work_directly`. This is **blocking the event loop**, already
defined in this lesson's Terms section, above, made directly visible:
for the entire 300 milliseconds that slow function was running, the
event loop could not process *anything* else — not the timer that was
supposed to fire every 10 milliseconds, and, in a real, visible
application, not a single click, keypress, or window repaint either.
The event loop doesn't queue up missed ticks to fire in a burst
afterward — it simply never got the chance to notice them at all while
that one slot refused to return.

This throwaway example is now **discarded** — the real project's
version, below, never runs slow work directly on the main thread at
all; the rest of this lesson exists specifically to avoid ever
reproducing what this lab just deliberately demonstrated.

### Project Change

- **Reference Source:** No reference counterpart — from-scratch
  addition, same as every unit so far.
- **Files affected:** none — this unit is diagnostic only, proving a
  problem this lesson's remaining units then solve; no project file is
  modified by this unit itself.
- **Change type:** n/a.
- **Location:** n/a.
- **Dependencies:** n/a.

### The New Code

n/a — this unit's own lab, above, is the complete demonstration; no
project code is added here.

### The Updated Project

n/a — no project file changes in this unit.

### Mechanical Walkthrough

- **`timer.start(10)`** — a method call on a `QTimer`, already flagged
  as test scaffolding since Lesson 1, here configured to fire
  repeatedly, every `10` milliseconds, rather than the one-shot style
  (`QTimer.singleShot(...)`) already used in earlier lessons.
- **`time.sleep(0.3)`** — explained in full in this lesson's Header,
  above, under "Everything else in the file"; called with `0.3`,
  pausing for three-tenths of a second.
- **`time.monotonic()`** — a standard-library function returning a
  steadily increasing timestamp, suitable for measuring elapsed time
  (unlike a plain wall-clock time, which can jump backward or forward
  if the system clock itself changes) — used here purely to measure
  real gaps between events for this unit's own proof, not part of the
  real project's own later code.

### CS Lens

**Blocking the event loop**, already named and defined in this lesson's
Terms section, above, is a hard concept worth restating precisely here:
any single-threaded, event-driven system — this curriculum's own
program since Lesson 1, but also many others — has exactly one thread
available to both run application code *and* respond to new events;
any code that runs long on that one thread necessarily delays every
other event waiting behind it, with no exception and no way for the
event loop itself to interrupt code that's already running.

Also recognized in: a web browser's own main JavaScript thread freezing
an entire page's scrolling and button clicks while a slow, synchronous
script runs; a restaurant with exactly one server, who can't take a new
table's order while still standing at another table working through a
complicated, slow request; a single customer-service phone line that
puts every other caller on hold, unable to even register that they've
called, for as long as the current call continues; a single-lane
one-way bridge, where one slow vehicle blocks every vehicle behind it
completely, regardless of how many vehicles are actually waiting.

### SE Lens

The alternative *not* explored in this unit — and the one this lesson's
remaining units actually build — is moving the slow work off the event
loop's own thread entirely. This unit exists specifically to make the
cost of *not* doing that impossible to hand-wave past: a real,
measured, 300-millisecond gap where absolutely nothing else could
happen, produced by three ordinary, unremarkable lines of code that
would look completely unsuspicious sitting inside a real, otherwise
correct signal handler. The real cost of this specific failure mode is
that it very often works "fine" in casual testing — an operation that's
merely slow enough to be annoying, not so slow it looks obviously
broken, can sit undetected in real, shipped code for a long time,
because nothing about it produces an error; it only produces a window
that occasionally, mysteriously, stops responding for a moment, exactly
the kind of bug that's easy to dismiss as "probably just my machine"
until it's measured directly, the way this unit's own lab just did.

### Run It

Already run and shown above, under "Introducing the Concept, in
Isolation" — a real execution this session, under
`QT_QPA_PLATFORM=offscreen`.

### Connecting This Unit

This unit proved, with a real, measured number, exactly the failure
this lesson exists to prevent. The next unit introduces the actual
mechanism — a separate thread — that fixes it.

---

## Concept Unit: Moving the Work Off the Main Thread

### The Problem

The slow work itself — whatever it actually does — hasn't changed; what
needs to change is *which thread* actually executes it, so the main
thread, and its event loop, stay free to keep responding to everything
else while that work happens somewhere else, in parallel. PySide6
provides a specific, real class for exactly this — a separate
**thread**, already defined in this lesson's Terms section, above — but
simply running arbitrary code on a second thread isn't enough on its
own: that second thread's own results need to get back to the main
thread safely, without corrupting shared data or crashing outright.

> Before reading on: this curriculum has relied on signals and slots to
> connect independent pieces of code since Lesson 2, and, since Lesson
> 7, to connect a signal directly to another object's own method with
> no intermediate function at all. Given that a signal doesn't care
> *what* is connected to it, only that it's a valid callable — what do
> you predict would need to be true for a signal emitted from a
> completely separate thread to still safely and correctly run a slot
> that touches the main thread's own real objects (like this
> curriculum's own `GreetedNamesModel`)? Is that something signals and
> slots already handle for you, or something you'd expect to need extra
> care for?

### Introducing the Concept, in Isolation

```python
from PySide6.QtWidgets import QApplication
from PySide6.QtCore import QObject, QThread, Signal, QTimer
import sys, time

app = QApplication(sys.argv)

class Worker(QObject):
    finished = Signal(str)

    def __init__(self, name, parent=None):
        super().__init__(parent)
        self._name = name

    def run(self):
        print("  worker.run() starting on thread:", QThread.currentThread())
        time.sleep(0.3)
        print("  worker.run() done")
        self.finished.emit(self._name)

print("main thread:", QThread.currentThread())

tick_times = []
def tick():
    tick_times.append(time.monotonic())

timer = QTimer()
timer.timeout.connect(tick)
timer.start(10)

results = []
def on_finished(name):
    results.append(name)
    print("  received finished signal with:", name)

thread = QThread()
worker = Worker("Alice")
worker.moveToThread(thread)
thread.started.connect(worker.run)
worker.finished.connect(on_finished)
worker.finished.connect(thread.quit)
thread.finished.connect(thread.deleteLater)

start = time.monotonic()
thread.start()

def stop():
    app.quit()

QTimer.singleShot(500, stop)
app.exec()

end = time.monotonic()
print(f"total wall time: {end - start:.3f}s")
print(f"number of timer ticks recorded: {len(tick_times)}")
if len(tick_times) >= 2:
    gaps = [tick_times[i+1]-tick_times[i] for i in range(len(tick_times)-1)]
    print(f"largest gap between ticks: {max(gaps)*1000:.1f}ms")
print("results:", results)
```

Real output from running this, this session, headless:

```
main thread: <PySide6.QtCore.QThread(0x22fc2ae0, name = "Qt mainThread") at 0x7f3a7b66b380>
  worker.run() starting on thread: <PySide6.QtCore.QThread(0x22fcb800) at 0x7f3a7b66b600>
  worker.run() done
  received finished signal with: Alice
total wall time: 0.525s
number of timer ticks recorded: 52
largest gap between ticks: 10.2ms
results: ['Alice']
```

This is the exact same 300-millisecond slow operation as this lesson's
first unit — and this time, the largest gap between ticks was
`10.2ms`, essentially the timer's own configured interval, not
`300.6ms`. `worker.run()`'s own printed thread object is a genuinely
different, distinct `QThread` instance than the main thread printed
moments earlier — real, direct proof the slow work is now running
somewhere else entirely, in parallel with the event loop, rather than
blocking it. `results` correctly ended up with `['Alice']` — the
`finished` signal, crossing from the worker's own thread back to code
running on the main thread, delivered its value correctly regardless.

This throwaway example is now **discarded** — the real project's
version, below, uses this exact `QThread`/worker pattern, applied to
this curriculum's own `NameGreeter` and `GreetedNamesModel`.

### Project Change

- **Reference Source:** No reference counterpart — from-scratch
  addition.
- **Files affected:** `verify_worker.py` — created, holding
  `VerifyWorker`.
- **Change type:** add (new file).
- **Location:** n/a — new file.
- **Dependencies:** none beyond `PySide6` itself.

### The New Code

```python
from PySide6.QtCore import QObject, Signal
import time


class VerifyWorker(QObject):
    verified = Signal(str)

    def __init__(self, name, parent=None):
        super().__init__(parent)
        self._name = name

    def run(self):
        time.sleep(1.0)
        self.verified.emit(self._name)
```

### The Updated Project

This is a brand-new file with nothing surrounding it yet — Project
Change, above, already covers this case. `verify_worker.py` currently
contains exactly this class, with nothing yet actually constructing a
`QThread` or running it.

### Mechanical Walkthrough

- **`class VerifyWorker(QObject):`** — a class definition. Explained in
  full in this lesson's Header, above, under Objects and methods used.
- **`verified = Signal(str)`** — a class-level `Signal` declaration,
  the identical construct already fully explained in Lesson 5.
- **`def __init__(self, name, parent=None): super().__init__(parent);
  self._name = name`** — the same constructor pattern already fully
  explained since Lesson 5, storing the one piece of data this worker
  needs.
- **`def run(self): time.sleep(1.0); self.verified.emit(self._name)`**
  — a method definition; `time.sleep(1.0)` is explained in full in this
  lesson's Header, above; `self.verified.emit(self._name)` is the exact
  `.emit(...)` construct already fully explained in Lesson 5, applied
  here to this lesson's own new signal.

### CS Lens

The **worker object** pattern this class embodies — a plain `QObject`,
holding just enough data to do one job, designed to be moved onto a
thread rather than run directly — is a specific, real application of a
broader idea: separating *what work is done* from *where and how it
runs*. `VerifyWorker` itself contains no knowledge at all of threads,
event loops, or anything about its own eventual execution context — it
just does its one job and announces the result, the same encapsulation
principle Lesson 5 already established for `NameGreeter`, here applied
specifically so the same class could, in principle, be run directly
(for testing) or on a background thread (for real use) with zero
changes to the class itself.

Also recognized in: a job submitted to a printer queue, which knows
nothing about which physical printer, or when, actually processes it;
a task handed to a delivery service, indifferent to which specific
driver or vehicle ends up completing it; a function passed to a thread
pool in many programming languages, written with no built-in assumption
about which specific thread will eventually execute it.

### SE Lens

The alternative *not* chosen here is writing the slow work as a bare
function, with no class at all, and using Python's own lower-level
`threading` module directly instead of `QThread`. The real tradeoff:
Python's own `threading.Thread` is genuinely simpler for code with no
GUI involved at all — but it has no built-in, safe way to deliver a
result back into a running Qt event loop; doing so correctly, without
this lesson's own real, later-verified proof that a signal crossing
threads is delivered safely, would require manually protecting shared
data with locks — a real, easy-to-get-wrong mechanism this curriculum
hasn't covered, and one `QThread`, combined with signals and slots,
was specifically designed to make largely unnecessary for exactly this
kind of "do work elsewhere, report back safely" pattern. The cost
`QThread` carries in exchange: it only exists inside a running Qt
application at all — code written this way has a real, permanent
dependency on PySide6 itself, unlike a plain Python thread, which would
work identically in any Python program, GUI or not.

### Run It

Already run and shown above, under "Introducing the Concept, in
Isolation" — a real execution this session, under
`QT_QPA_PLATFORM=offscreen`, directly contrasted against this lesson's
own first unit.

### Connecting This Unit

`VerifyWorker` now exists, ready to be constructed and moved onto a
real thread — but nothing yet actually does that, and nothing yet
connects it to this curriculum's own `NameGreeter` or
`GreetedNamesModel`. That's this lesson's final unit.

---

## Concept Unit: Wiring the Worker Into the Real Application

### The Problem

`VerifyWorker` exists in isolation, proven correct by this lesson's own
lab — but the real program still submits a name directly to
`GreetedNamesModel.add_name`, exactly as Lesson 7 left it, with no
verification step at all. What has to happen, concretely, every time a
name is submitted, to construct a fresh `VerifyWorker`, move it onto a
fresh `QThread`, start that thread, and correctly route its eventual
result into the model — repeatably, for every single submission, not
just once?

> Before reading on: this lesson's own second unit constructed exactly
> one `QThread` and one `Worker`, used exactly once, for the lifetime
> of that entire script. This lesson's real feature needs to handle any
> number of submissions, one after another, potentially in quick
> succession. Given that a `QThread`, once started and finished, isn't
> meant to be restarted and reused for a second, unrelated job — what
> do you predict the real project's own code needs to do differently
> from this lesson's own lab, structurally, to correctly support
> submission after submission rather than just one?

### Introducing the Concept, in Isolation

```python
from PySide6.QtWidgets import QApplication, QMainWindow, QWidget, QVBoxLayout, QListView
from PySide6.QtCore import QObject, QThread, Signal, QTimer, Qt
from PySide6.QtTest import QTest
from name_greeter import NameGreeter
from greeted_names_model import GreetedNamesModel
import sys, time

app = QApplication(sys.argv)

class VerifyWorker(QObject):
    verified = Signal(str)
    def __init__(self, name, parent=None):
        super().__init__(parent)
        self._name = name
    def run(self):
        time.sleep(0.1)
        self.verified.emit(self._name)

window = QMainWindow()
greeter = NameGreeter()
history_model = GreetedNamesModel()
history_view = QListView()
history_view.setModel(history_model)

container = QWidget()
layout = QVBoxLayout()
layout.addWidget(greeter)
layout.addWidget(history_view)
container.setLayout(layout)
window.setCentralWidget(container)

active_threads = []

def start_verification(name):
    thread = QThread()
    worker = VerifyWorker(name)
    worker.moveToThread(thread)
    thread.started.connect(worker.run)
    worker.verified.connect(history_model.add_name)
    worker.verified.connect(thread.quit)
    thread.finished.connect(thread.deleteLater)
    active_threads.append((thread, worker))
    thread.start()

greeter.greeted.connect(start_verification)

tick_times = []
timer = QTimer()
timer.timeout.connect(lambda: tick_times.append(time.monotonic()))
timer.start(10)

window.show()
print("rowCount before submit:", history_model.rowCount())
QTest.keyClicks(greeter.line_edit, "Dana")
greeter.button.click()
print("rowCount immediately after click (verification pending):", history_model.rowCount())

def check_after_delay():
    print("rowCount after 200ms (verification should be done):", history_model.rowCount())
    if history_model.rowCount() > 0:
        print("row 0:", history_model.data(history_model.index(0,0), Qt.DisplayRole))
    print("number of timer ticks during the wait:", len(tick_times))
    app.quit()

QTimer.singleShot(200, check_after_delay)
app.exec()
```

Real output from running this, this session, headless:

```
rowCount before submit: 0
rowCount immediately after click (verification pending): 0
rowCount after 200ms (verification should be done): 1
row 0: Dana
number of timer ticks during the wait: 21
```

This confirms the whole real feature, end to end. Immediately after the
click, `rowCount()` is still `0` — the verification genuinely hadn't
finished yet, proving the name isn't added synchronously the moment
it's submitted, the same way Lesson 7's version always was. After the
simulated delay, `rowCount()` correctly becomes `1`, with `"Dana"`
correctly present — the `verified` signal, crossing from the worker's
own thread back to the main thread, correctly reached
`history_model.add_name` and triggered Lesson 7's own correct
`beginInsertRows`/`endInsertRows` sequence, exactly as before. And the
timer, ticking every 10 milliseconds throughout the entire 200
millisecond wait, recorded `21` real ticks — close to the expected
count, and nothing like the catastrophic gap this lesson's first unit
measured — proving the event loop stayed genuinely responsive the
entire time the verification was actually running.

`start_verification` is written as a function, constructing a fresh
`QThread` and `VerifyWorker` on every single call — answering this
unit's own Socratic prompt directly: a `QThread`, once run to
completion, is not reused for a second job; each submission gets its
own, independent thread and worker, exactly the same "construct fresh
per use" pattern this lesson's own `VerifyWorker` was already designed
around.

This throwaway example is now **discarded** — the real project's
version, below, moves this exact structure into `main.py`, connected to
the real `greeter.greeted` signal in place of Lesson 7's direct
connection to `history_model.add_name`.

### Project Change

- **Reference Source:** No reference counterpart — from-scratch
  addition.
- **Files affected:** `main.py` — modified.
- **Change type:** replace (Lesson 7's direct `greeter.greeted.connect(
  history_model.add_name)` connection) and add (`start_verification`,
  and the import of `VerifyWorker`, `QObject`, and `QThread`).
- **Location:** `greeter.greeted.connect(history_model.add_name)`,
  from Lesson 7, is replaced with a connection to the new
  `start_verification` function, defined directly above it.
- **Dependencies:** `VerifyWorker`, newly imported from
  `verify_worker.py`; `QThread`, newly imported from `PySide6.QtCore`.

### The New Code

```python
active_threads = []

def start_verification(name):
    thread = QThread()
    worker = VerifyWorker(name)
    worker.moveToThread(thread)
    thread.started.connect(worker.run)
    worker.verified.connect(history_model.add_name)
    worker.verified.connect(thread.quit)
    thread.finished.connect(thread.deleteLater)
    active_threads.append((thread, worker))
    thread.start()

greeter.greeted.connect(start_verification)
```

### The Updated Project

`main.py`, complete, as it stands at the end of this lesson:

```python
 1  from PySide6.QtWidgets import QApplication, QMainWindow, QWidget, QVBoxLayout, QListView
 2  from PySide6.QtGui import QAction
 3  from PySide6.QtCore import QThread                        # <- new
 4  from name_greeter import NameGreeter
 5  from greeted_names_model import GreetedNamesModel
 6  from verify_worker import VerifyWorker                     # <- new
 7  from pathlib import Path
 8  import json
 9  import sys
10
11  HISTORY_PATH = Path(__file__).parent / "history.json"
12
13  def load_history(path):
14      try:
15          return json.loads(path.read_text())
16      except (FileNotFoundError, json.JSONDecodeError):
17          return []
18
19  def save_history(path, names):
20      path.write_text(json.dumps(names))
21
22  app = QApplication(sys.argv)
23  window = QMainWindow()
24  window.setWindowTitle("Lesson 1 Lab")
25
26  greeter = NameGreeter()
27  history_model = GreetedNamesModel(load_history(HISTORY_PATH))
28  history_view = QListView()
29  history_view.setModel(history_model)
30
31  container = QWidget()
32  container_layout = QVBoxLayout()
33  container_layout.addWidget(greeter)
34  container_layout.addWidget(history_view)
35  container.setLayout(container_layout)
36  window.setCentralWidget(container)
37
38  file_menu = window.menuBar().addMenu("&File")
39  quit_action = QAction("&Quit", window)
40  quit_action.triggered.connect(app.quit)
41  file_menu.addAction(quit_action)
42
43  active_threads = []                                        # <- new
44
45  def start_verification(name):                              # <- new
46      thread = QThread()                                       # <- new
47      worker = VerifyWorker(name)                              # <- new
48      worker.moveToThread(thread)                              # <- new
49      thread.started.connect(worker.run)                       # <- new
50      worker.verified.connect(history_model.add_name)          # <- new
51      worker.verified.connect(thread.quit)                     # <- new
52      thread.finished.connect(thread.deleteLater)              # <- new
53      active_threads.append((thread, worker))                  # <- new
54      thread.start()                                           # <- new
55
56  greeter.greeted.connect(start_verification)                 # <- new
57
58  app.aboutToQuit.connect(lambda: save_history(HISTORY_PATH, history_model.names()))
59
60  window.statusBar().showMessage("Ready")
61  window.show()
62  sys.exit(app.exec())
```

As a whole, submitting a name through `NameGreeter` (still completely
unmodified since Lesson 5) no longer adds it to the history
immediately — it now triggers a fresh, independent background
verification (lines 45–54), and only once that verification genuinely
completes does the name actually reach `history_model.add_name` (line
50), with the window, and every widget in it, fully responsive to
clicks, resizing, and the Quit menu the entire time that verification
is running — exactly what this lesson's own timer-based proof confirmed
line by line.

### Mechanical Walkthrough

- **`active_threads = []`** — an assignment, an empty list literal, the
  same construct already established since Lesson 7. Explained further
  under CS Lens, below, since its real purpose is worth its own
  discussion, not just naming the syntax.
- **`def start_verification(name):`** — a function definition, the
  same construct already established repeatedly; `name` is its one
  parameter, matching exactly what `greeter.greeted` emits, per Lesson
  5's own confirmed `Signal(str)` declaration.
- **`thread = QThread()`**, **`worker = VerifyWorker(name)`** — two
  constructor calls, both explained in full in this lesson's Header,
  above.
- **`worker.moveToThread(thread)`** — a method call, explained in full
  in this lesson's Header, above.
- **`thread.started.connect(worker.run)`**,
  **`worker.verified.connect(history_model.add_name)`**,
  **`worker.verified.connect(thread.quit)`**,
  **`thread.finished.connect(thread.deleteLater)`** — four separate
  uses of the exact `.connect()` construct already fully explained in
  Lesson 2, connecting, respectively: the thread's own start to the
  worker's actual work; the worker's own result to Lesson 7's model,
  crossing threads for the first time in this curriculum; the same
  result also to stopping the thread's own event loop, since its one
  job is now done; and the thread's own finish to its own deferred
  deletion, explained in full in this lesson's Header, above.
- **`active_threads.append((thread, worker))`** — a method call, the
  same `.append(...)` construct already explained in Lesson 8, here
  appending a tuple — two values grouped together with parentheses and
  a comma, standard Python syntax not otherwise singled out yet in this
  curriculum — holding both the thread and its worker together as one
  entry.
- **`thread.start()`** — a method call, explained in full in this
  lesson's Header, above (under `QThread`'s own Responsibility entry).
- **`greeter.greeted.connect(start_verification)`** — the exact
  `.connect()` construct already fully explained in Lesson 2, replacing
  Lesson 7's own direct connection to `history_model.add_name`.

### CS Lens

`active_threads`, this unit's own new list, is worth its own real
discussion beyond naming its syntax: `thread` and `worker`, once
constructed inside `start_verification`, would otherwise have no Python
variable holding a reference to them once that function returns — and,
per this curriculum's own confirmed rule about garbage collection,
first demonstrated all the way back in Lesson 2's own parent-child lab,
an object with nothing keeping it alive is eligible for collection.
Unlike a `QWidget`, a `QThread` with no parent given has no equivalent
ownership mechanism protecting it automatically — appending it to
`active_threads`, a plain, module-level Python list that persists for
the life of the program, is what keeps both objects alive long enough
for their own signals to actually fire and their own work to actually
complete, a real, practical consequence of Python's own memory model
interacting with a class this curriculum hadn't needed to worry about
keeping alive this way before.

### SE Lens

The alternative *not* chosen here — worth naming honestly as a real
limitation of this lesson's own code, not glossed over — is that
`active_threads` only ever grows; nothing in this lesson's own project
code ever removes a finished thread and worker from that list once
their job is done, even though `thread.finished.connect(thread
.deleteLater)` does correctly free the underlying Qt object itself.
The real tradeoff: writing the correct removal logic (connecting
`thread.finished` to code that also removes the matching tuple from
`active_threads`) is genuinely more code, and, for a program that
greets a small, human-scale number of names in one sitting, the actual
cost of a growing list of now-empty Python references is negligible.
The cost this project is now carrying, honestly, and deliberately left
as a named limitation rather than silently ignored: a version of this
program that ran for a very long time, processing a very large number
of submissions, would see `active_threads` grow without bound — a real,
if slow-forming, memory leak that a production version of this exact
feature would need to address, most simply by also removing each tuple
from the list inside a slot connected to that same `thread.finished`
signal.

### Run It

Already run and shown above, under "Introducing the Concept, in
Isolation" — a real execution this session, under
`QT_QPA_PLATFORM=offscreen`, directly measuring both the correctness of
the result and the continued responsiveness of the event loop
throughout.

### Connecting This Unit

The complete feature this lesson set out to build is now real: a slow
operation, genuinely running off the main thread, correctly reporting
its result back into the exact model this curriculum built in Lesson 7
— with the specific, measured proof, in this lesson's own first unit,
of exactly what would have gone wrong without it.

---

## Connect the Pieces

Trace one submission through everything this lesson built, start to
finish, contrasted directly against what this lesson's own first unit
proved would have happened without any of it:

The user types "Dana" and clicks the button. `NameGreeter`'s own
`_on_submit` — completely unmodified since Lesson 5 — validates the
name and emits `greeted("Dana")`. Line 56's connection means
`start_verification("Dana")` runs — not `history_model.add_name`
directly, the way Lesson 7 originally wired it. Inside
`start_verification`: a fresh `QThread` and a fresh `VerifyWorker("D
ana")` are constructed; `worker.moveToThread(thread)` reassigns the
worker's own thread affinity, confirmed by this lesson's own lab to
genuinely change which thread its slots run on; `thread.started
.connect(worker.run)` and `thread.start()` together cause `run()` to
actually begin executing on that new, separate thread — confirmed
directly, in this lesson's own second unit, by printing
`QThread.currentThread()` from inside it and getting back a real,
different object than the main thread.

For the full duration of `VerifyWorker.run`'s own `time.sleep(...)`
call, the main thread — and its event loop, first explained all the way
back in Lesson 1 — is completely free: this lesson's first unit already
measured, directly, exactly what would happen if that same delay had
run there instead — an entire window frozen for the delay's full
duration, with not even a scheduled `QTimer` tick able to fire. Here,
instead, the event loop keeps running normally: the window stays
responsive, other widgets keep working, and, this lesson's own final
unit's lab already confirmed, a separate timer kept ticking, close to
its own configured rate, the entire time.

Once the simulated delay genuinely elapses, `self.verified.emit(
"Dana")` fires. Line 50's connection means `history_model.add_name` now
runs — the identical method Lesson 7 already fully explained, complete
with its own required `beginInsertRows`/`endInsertRows` signaling —
except this time, the call arrived from a signal that crossed a real
thread boundary, correctly and safely, exactly as this lesson's own
Socratic prompt anticipated signals and slots would handle. `history
_view`, still displaying the same model, correctly shows the new row.
Line 51's connection also fires `thread.quit()`, stopping that now-
finished thread's own event loop; `thread.finished`, once that stop
completes, triggers `thread.deleteLater()`, cleaning up the `QThread`
object itself correctly and safely, exactly as this lesson's Header
already explained.

**Next lesson:** Lesson 10 — packaging. Every lesson in this curriculum
has run as loose Python source files, launched with `python3 main.py`;
the next lesson covers turning this exact, complete project into a
single, real, shippable executable someone else could run without
installing Python or PySide6 themselves at all.
