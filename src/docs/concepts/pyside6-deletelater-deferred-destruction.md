# Concept: `deleteLater()` — Deferred Destruction, Not Python Garbage Collection

**What you'll understand by the end:** how `deleteLater()` schedules a
real Qt object's destruction for later, rather than destroying it
immediately, and why this is a genuinely separate mechanism from
Python's own reference-counting garbage collector.

**Prerequisites:** `event-loop.md`, `pyside6-qapplication-and-mainwindow.md`.

## Setup

Python 3 with `pip install PySide6`.

## The Problem

Removing a real widget that's currently part of a live GUI — say, a
closed tab's own editor — is riskier to destroy *immediately* than it
sounds: other code (a signal still mid-delivery, an event still being
processed) might still hold a real, live reference to it at that exact
moment. Destroying it synchronously, right where the removal happens,
risks that other code touching a real object that's already gone.

## The Isolated Example

```python
import sys
from PySide6.QtCore import QCoreApplication, QEvent
from PySide6.QtWidgets import QApplication, QLabel

app = QApplication.instance() or QApplication(sys.argv)

widget = QLabel("temporary")
print("widget exists before deleteLater():", widget.text())

widget.deleteLater()
print("widget still usable IMMEDIATELY after deleteLater():", widget.text())

QCoreApplication.sendPostedEvents(None, QEvent.Type.DeferredDelete)
QCoreApplication.processEvents()

try:
    print(widget.text())
    print("still alive")
except RuntimeError as e:
    print(f"RuntimeError: {e}")
```

**Real output, run this session:**
```
widget exists before deleteLater(): temporary
widget still usable IMMEDIATELY after deleteLater(): temporary
RuntimeError: libshiboken: Internal C++ object (PySide6.QtWidgets.QLabel) already deleted.
```

**What this proves:** the widget was genuinely still fully usable
**immediately** after `deleteLater()` was called — `widget.text()`
returned its real content with no error, direct proof destruction did
**not** happen synchronously at the call site. Only after explicitly
letting Qt process its own deferred-delete events did the real,
underlying C++ object actually get destroyed — confirmed by the real
`RuntimeError` on the next access, `libshiboken` reporting the object
is genuinely, permanently gone.

**A real, worth-being-precise-about wrinkle:** the two calls above
(`sendPostedEvents(None, QEvent.Type.DeferredDelete)` **and**
`processEvents()`) were used together — it's tempting to assume plain
`processEvents()` alone, called enough times, would eventually get
there too. It genuinely does not:

```python
widget2 = QLabel("still temp")
widget2.deleteLater()

for _ in range(20):
    QCoreApplication.processEvents()

try:
    print(widget2.text())
    print("STILL ALIVE after 20x plain processEvents() alone")
except RuntimeError as e:
    print(f"RuntimeError: {e}")
```

**Real output, run this session:**
```
still temp
STILL ALIVE after 20x plain processEvents() alone
```

**What this proves:** even 20 real calls to plain `processEvents()`,
with **no** `sendPostedEvents(None, QEvent.Type.DeferredDelete)`
anywhere, genuinely never destroyed `widget2` — it's still alive,
`.text()` still works. `QEvent.Type.DeferredDelete` events are
real, specifically-typed events that plain `processEvents()` does not
reliably dispatch on its own in a headless script with no actively
running `app.exec()` loop; `sendPostedEvents(None, QEvent.Type.
DeferredDelete)` is the real, more specific call that actually flushes
*that* event type — not an optional extra alongside `processEvents()`,
but the actual mechanism doing the real work.

## Mechanical Walkthrough

- `widget.deleteLater()` posts a real, special deferred-delete event
  onto the object's own event queue — it does **not** call the real
  destructor at that moment; the call returns immediately, and the
  object is still completely valid to use right after.
- The real destruction only happens once Qt's own event-processing
  machinery actually handles that deferred-delete event — in a real,
  normally-running application (`app.exec()`'s own continuously-turning
  loop), this happens naturally, soon, without any special code needed;
  in a headless script or test with no such loop actively running, it
  may require an explicit nudge (as shown above) to actually occur.
- This is a genuinely **separate** real mechanism from Python's own
  garbage collector: Python's GC reclaims memory once an object's
  Python-level reference count hits zero — a completely different real
  process operating on the Python wrapper object, not on Qt's own
  underlying C++ object lifecycle, which `deleteLater()` specifically
  manages.
- After real destruction, the Python-level wrapper object still
  technically exists as a Python value, but every real operation on it
  raises `RuntimeError` — the underlying C++ object it wrapped is
  genuinely gone, even though the Python name `widget` still points at
  *something*.

## CS Lens

This is a real, deliberate instance of **deferred cleanup** — scheduling
a resource's destruction for a later, safer point (the next event-loop
turn) rather than destroying it at the exact point removal was
requested, specifically to avoid destroying something still
potentially in use by code currently executing. It's conceptually
adjacent to (but a genuinely different mechanism from) Python's own
`__del__`/reference counting — Qt's object lifecycle is managed by its
own real C++ layer, which PySide6's Python wrapper objects sit on top
of, not replace.

Also recognized in: any deferred-cleanup pattern where destruction is
scheduled rather than immediate — a database connection pool marking a
connection for later cleanup rather than closing it mid-transaction; a
garbage collector's own "generation" system, deferring collection of
longer-lived objects to less frequent, batched passes.

## SE Lens

The real, practical reason this matters for a real widget lifecycle
specifically: a closed tab's editor might still be the target of an
in-flight signal (a `textChanged` that was already queued before the
tab closed) — destroying it synchronously at the moment `removeTab` runs
risks that queued signal delivery touching an already-destroyed real
object. `deleteLater()` sidesteps this entirely: the object stays valid
through the remainder of the current event-processing cycle, and is
only actually destroyed once it's safe — the next time the event loop
turns and no such in-flight work could still be reaching it.

## Connection

Builds on `event-loop.md` (destruction genuinely depends on the event
loop turning) and `pyside6-qapplication-and-mainwindow.md`. Related in
spirit, but a real, different mechanism from, `pyside6-manual-event-
loop-pumping-for-async-test-waiting.md`'s own technique — both require
manually driving Qt's event processing outside a real, running
`app.exec()` loop, for two genuinely different real reasons (waiting
for an async signal vs. waiting for deferred destruction).

A real, direct bookend with `pyside6-qt-python-object-lifetime-and-
references.md`'s own finding, worth stating explicitly: that file
covers the *opposite* direction of this same dual-language-ownership
reality — there, **Python's** own garbage collector destroys a Qt
object that Qt-side, on-screen state still genuinely needed (an
unreferenced-but-shown `DiffView` silently vanishing); here, **Qt's**
own C++ side destroys an object that **Python** still holds a live,
named reference to (`widget` still technically "exists" as a Python
value after `deleteLater()` actually runs — a real, harmless "zombie"
wrapper — but every real operation on it raises `RuntimeError`,
confirmed directly above). Both are the identical real fact — a Qt
object's lifecycle is governed by its own C++ side, not by whichever
one language's reference-counting or garbage-collection scheme happens
to be watching it — cutting in both directions depending on which side
loses its reference first.

## Try It Yourself

1. Call `widget.deleteLater()` and then immediately try to reparent it
   (`widget.setParent(some_other_widget)`) before any event processing
   happens — confirm this still works, direct, real proof the object
   is genuinely still alive and usable until destruction actually
   occurs.
2. In a real, non-headless application actually running `app.exec()`,
   call `deleteLater()` on a widget and confirm it gets destroyed
   "soon" with no manual `sendPostedEvents` call needed at all — the
   explicit nudge in this file's own example exists specifically
   because no such loop is continuously running in a plain script.
3. Look up why Qt's own documentation recommends `deleteLater()` over
   plain Python `del widget` for real Qt objects specifically — connect
   your answer back to this file's own real distinction between Qt's
   object lifecycle and Python's reference counting.

## A Second Real Facet: `setParent(None)` as a Rescue, the Opposite Direction

Every earlier example here destroyed a widget on purpose. The same
parent/child ownership fact this file already relies on — a widget's
children are destroyed along with it — has a real, opposite-direction
use: **detaching** a widget from a parent that's about to be torn down,
specifically so it *survives*.

```python
import sys
from PySide6.QtCore import QCoreApplication, QEvent
from PySide6.QtWidgets import QApplication, QLabel, QWidget

app = QApplication.instance() or QApplication(sys.argv)

container = QWidget()
child = QLabel("rescue me", parent=container)
print("child parent before:", child.parent())

# The rescue: detach BEFORE the parent is destroyed.
child.setParent(None)
print("child parent after setParent(None):", child.parent())

container.deleteLater()
QCoreApplication.sendPostedEvents(None, QEvent.Type.DeferredDelete)
QCoreApplication.processEvents()

print("child still usable after container destroyed:", child.text())

# CONTRAST -- a second child, NOT rescued, dies with its parent.
container2 = QWidget()
child2 = QLabel("not rescued", parent=container2)
container2.deleteLater()
QCoreApplication.sendPostedEvents(None, QEvent.Type.DeferredDelete)
QCoreApplication.processEvents()
try:
    print(child2.text())
except RuntimeError as e:
    print(f"RuntimeError: {e}")
```

**Real output, run this session:**
```
child parent before: <PySide6.QtWidgets.QWidget(0x233a5d76410) at 0x00000233A676A500>
child parent after setParent(None): None
child still usable after container destroyed: rescue me
RuntimeError: libshiboken: Internal C++ object (PySide6.QtWidgets.QLabel) already deleted.
```

**What this proves:** `child`, rescued via `setParent(None)` *before*
`container.deleteLater()` ran, genuinely survived `container`'s real
destruction — `child.text()` still worked afterward, with no error.
`child2`, left parented to `container2` with no rescue, was genuinely
destroyed **along with it** — the identical real `RuntimeError` this
file's very first example already showed, now triggered by a *parent's*
destruction rather than the widget's own.

**Mechanical note:** `setParent(None)` doesn't destroy or hide
anything by itself — it's a real, ordinary reparenting operation (the
same mechanism `pyside6-widget-reparenting-and-visibility.md` covers in
full), just reparenting to "no parent" instead of to another real
widget. What makes it a *rescue* here is purely **timing**: calling it
*before* the old parent's destruction runs removes the child from that
parent's ownership entirely, so when the deferred delete for
`container` actually processes, `child` is no longer among its
children at all, and is never touched.

**Connecting the two directions:** this project's own real code
comment states the relationship directly — `MainWindow._close_tab`'s
own deletion cascade (the *first* real facet in this file: closing a
tab destroys its editor via `deleteLater()`, with nothing else holding
a reference) and this rescue are "the same lesson applied in the
opposite direction." Both depend on the identical real fact — Qt
destroys a widget's children along with it — one embracing that fact to
clean up an editor nobody needs anymore, the other deliberately
sidestepping it to keep a widget that's still needed elsewhere alive
past its original parent's own destruction.

### Try It Yourself (second facet)

1. Reorder the rescue example so `container.deleteLater()` runs
   **before** `child.setParent(None)` — confirm the rescue now fails
   (`child` is destroyed along with `container` after all), direct,
   real proof the rescue's timing, not merely calling `setParent(None)`
   at some point, is what matters.
2. After a successful rescue, reparent `child` into a brand-new, live
   widget (`child.setParent(some_new_widget)`) and confirm it displays
   normally there — a rescued widget with no parent is exactly as
   reusable as any other genuinely orphaned real widget.
3. Reread this file's very first example (destroying `widget` directly,
   with nothing rescued) side by side with this facet's rescue example
   — write, in one sentence each, what real, structural difference
   between the two determines whether a child widget survives its
   parent's destruction.

## A Third Real Facet: Implicit Cleanup Timing Is Unreliable for a Scarce Native Resource

This file's own first facet relies on `deleteLater()` — Qt's own
managed, deferred cleanup, still guaranteed to run soon (the next
event-loop turn). A real, more severe situation shows up when a
resource is only cleaned up via Python's own `__del__`/garbage
collection, with **no** guaranteed timing at all — especially once
that resource sits inside a real reference cycle.

```python
import gc


class NativeResource:
    def __init__(self, name):
        self.name = name
        self.closed = False
        self._self_ref = self  # a reference cycle -- refcounting alone can't collect this

    def close(self):
        if not self.closed:
            self.closed = True
            print(f"{self.name}: closed explicitly")

    def __del__(self):
        if not self.closed:
            print(f"{self.name}: closed via __del__ (GC finally got to it)")


gc.disable()

r1 = NativeResource("resource-A")
del r1  # drop the only external reference
print("immediately after del -- was resource-A closed yet? (nothing printed above means no)")

r2 = NativeResource("resource-B")
r2.close()
del r2
```

**Real output, run this session:**
```
immediately after del -- was resource-A closed yet? (nothing printed above means no)
resource-B: closed explicitly
resource-A: closed via __del__ (GC finally got to it)
```

**What this proves:** `resource-A`'s only external reference was
dropped immediately (`del r1`), yet it genuinely **stayed open** for
the rest of the program's real execution — with cyclic garbage
collection disabled, plain reference counting alone can never collect
an object holding a reference to itself, so its `__del__` never ran
until interpreter shutdown finally, forcibly cleaned it up.
`resource-B`, closed **explicitly**, was released immediately,
confirmed by its own message printing right when `close()` was
called, long before `resource-A`'s delayed cleanup finally happened.

**Mechanical note — why this is a real, more severe consequence than
this file's own first facet:** a `QWidget` left to `deleteLater()`
still gets cleaned up promptly, by a real, running Qt event loop that
processes deferred deletions continuously. A **native** resource
(an OpenGL context, a file handle, a network socket) wrapped by a
Python object has no such guarantee at all if its cleanup depends on
`__del__` — real reference cycles (common in GUI code: a widget
referencing a callback that closes over the widget itself) can delay
that cleanup indefinitely, and a scarce native resource pool can be
**exhausted** by several such objects all waiting on cleanup that
never comes, long before any of them are ever collected.

## CS Lens (third facet)

This is the real, general reason RAII (Resource Acquisition Is
Initialization, C++'s own deterministic-destructor idiom) and Python's
`with`-statement context managers both exist: **explicit, deterministic
cleanup**, triggered by a real, specific program event (leaving a
`with` block, calling `close()` directly) rather than an implicit,
timing-unpredictable one (waiting for garbage collection). `__del__`
is real and does eventually run for genuinely unreachable objects —
but "eventually," for a scarce, real external resource, can mean "too
late, after the pool is already exhausted."

## SE Lens (third facet)

The real, practical lesson this project's own history demonstrates at
its most severe: relying on implicit cleanup timing for a **native**,
non-Python-managed resource isn't just a logical bug waiting to
happen (a widget outliving its intended lifetime) — it can be a real,
reproducible **crash**, since the underlying native library has no
concept of Python's own reference counting or garbage collection at
all, and a resource it was never told to release stays claimed
indefinitely. The fix is always the same real shape: an explicit,
synchronous cleanup call, triggered by a specific, known program
event — never a hope that garbage collection gets there in time.

## Connection (third facet)

A real, more severe sibling of this file's own first facet — both
concern trusting *when* cleanup actually happens, but this facet's
real failure mode is a genuine crash, not a logical/visibility bug. A
real, applied instance in this project's own history: several modal
designer dialogs, each owning its own independent, real OpenGL
context (a live native resource no different in kind from this
facet's own `NativeResource`), were being left to whatever order
Python's garbage collector eventually reclaimed them in — genuinely,
reproducibly crashing the real application (`wglMakeCurrent failed`)
after opening more than one designer in a session. The real fix: an
explicit `dialog.viewport.close()` called immediately after `exec()`
returns, regardless of the real result — deterministic, immediate
cleanup, exactly like this facet's own `resource-B`, needed
specifically because `QDialog.exec()`'s own accept/reject path doesn't
fire `closeEvent` at all (see
`pyside6-qcloseevent-blocking-window-close.md`'s own second facet),
so there was no other real hook available to place this cleanup in.

### Try It Yourself (third facet)

1. Re-enable garbage collection (`gc.enable()`) and call `gc.collect()`
   explicitly right after `del r1` — confirm `resource-A` now closes
   immediately, direct, real proof the cyclic collector *can* find it,
   it just isn't guaranteed to run at any particular, real moment.
2. Remove the `self._self_ref = self` reference cycle from
   `NativeResource` and rerun the original example — confirm
   `resource-A` now closes immediately via `__del__` even with `gc`
   disabled, since plain reference counting alone is sufficient once
   there's no real cycle involved.
3. Write a real context-manager version of `NativeResource`
   (`__enter__`/`__exit__` calling `close()`) and use it in a `with`
   block — confirming this is the standard, real Python idiom for
   guaranteeing deterministic cleanup, the direct language-level
   parallel to this project's own explicit `dialog.viewport.close()`
   fix.
