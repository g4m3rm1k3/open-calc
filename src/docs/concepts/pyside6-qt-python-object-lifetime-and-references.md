# Concept: Qt/Python Object Lifetime — a Live Widget Still Needs a Python Reference

**What you'll understand by the end:** why a real, currently-shown Qt
widget (or any Qt object a live, on-screen thing still depends on)
gets destroyed the moment nothing in Python holds a reference to it —
regardless of whether the underlying Qt object logically "should"
still be alive — and the real, deliberate technique (keeping an
explicit list) this project uses to prevent it.

**Prerequisites:** `pyside6-qapplication-and-mainwindow.md`,
`pyside6-deletelater-deferred-destruction.md`.

## Setup

Python 3 with `pip install PySide6`.

## The Problem

A real, shown top-level window looks, to a human watching the screen,
like it's obviously "alive" and doesn't need anything else keeping it
that way — it's visibly there. But PySide6 widgets are real Python
objects underneath, subject to Python's own reference counting: the
moment **no Python code holds a reference** to a widget, Python's
garbage collector is free to reclaim it — and when it does, the real,
underlying Qt/C++ object goes with it, regardless of whether it's
still visibly on screen at that exact moment.

## The Isolated Example

```python
import sys
import gc
from PySide6.QtWidgets import QApplication, QWidget

app = QApplication.instance() or QApplication(sys.argv)


def make_unreferenced_window():
    window = QWidget()
    window.setWindowTitle("no-python-reference")
    window.show()
    # No return, no storage anywhere -- the ONLY Python reference was
    # the local variable `window`, which goes away when this function returns.


make_unreferenced_window()
gc.collect()
app.processEvents()

top_level_titles = [w.windowTitle() for w in app.topLevelWidgets()]
print("top-level widgets after gc.collect(), with NO stored reference:", top_level_titles)

kept_windows = []


def make_referenced_window(store):
    window = QWidget()
    window.setWindowTitle("has-python-reference")
    window.show()
    store.append(window)


make_referenced_window(kept_windows)
gc.collect()
app.processEvents()

top_level_titles2 = [w.windowTitle() for w in app.topLevelWidgets()]
print("top-level widgets after gc.collect(), WITH a stored reference:", top_level_titles2)
```

**Real output, run this session:**
```
top-level widgets after gc.collect(), with NO stored reference: []
top-level widgets after gc.collect(), WITH a stored reference: ['has-python-reference']
```

**What this proves:** `make_unreferenced_window()` genuinely showed a
real window — but the instant the function returned, its only Python
reference (the local `window` variable) went out of scope. After
`gc.collect()`, Qt's own list of real, live top-level widgets
(`app.topLevelWidgets()`) shows **nothing** — the window is genuinely
gone, silently, despite having been shown. `make_referenced_window`,
storing the identical kind of window into a real, external list, kept
it genuinely alive and visible after the identical `gc.collect()`
call — the *only* real difference between the two cases is whether a
Python reference to the widget still exists anywhere.

## Mechanical Walkthrough

- Every PySide6 widget is a real Python object wrapping an underlying
  C++/Qt object — Python's own reference counting governs the Python
  wrapper's lifetime, and (outside of `deleteLater()`'s own deferred
  mechanism) the wrapper's destruction takes the real underlying Qt
  object down with it.
- Calling `.show()` makes a widget **visible**, but visibility and
  Python-reference-liveness are two genuinely separate, independent
  real facts — `.show()` does not itself create any additional Python
  reference keeping the object alive.
- A local variable inside a function is a real, but **temporary**
  reference — the moment the function returns, that reference is gone,
  and if it was the *only* one, the object becomes eligible for real
  garbage collection.
- Appending a widget to a list stored somewhere longer-lived (an
  instance attribute like `self._diff_windows`) creates a real,
  additional, durable reference — as long as that list itself stays
  alive, every widget inside it does too.

## CS Lens

This is a direct, concrete instance of **reference-counted garbage
collection** interacting with a **manually-managed, real external
resource** (a native GUI window) — the object's *logical* lifetime (a
window a user can see and interact with) and its *Python reference*
lifetime are two related but genuinely separate things, and it's the
reference lifetime, not the visible, logical one, that actually
determines when destruction happens. This is a real, general class of
bug wherever a managed language (Python) wraps an unmanaged, real
external resource (here, a native Qt window) — the wrapper object's
own reference count is what the garbage collector actually tracks, and
it has no independent awareness of "this thing looks important on
screen right now."

Also recognized in: any FFI (foreign function interface) binding where
a managed-language wrapper object owns an unmanaged native resource —
losing the wrapper's last reference destroys the native resource
regardless of whether other, non-Python code still expects it to
exist; a similar real risk with database connections, file handles, or
network sockets wrapped by a garbage-collected language.

## SE Lens

The real, practical fix this project's own code applies twice,
independently, in the same real step: keep an explicit, durable
Python reference — `self._diff_windows: list[DiffView]` for shown
windows, and a similar stored dict/list for `QTextCharFormat` objects
a live `ExtraSelection` still points at — specifically so nothing gets
silently collected out from under a still-in-use real Qt object. This
is real, deliberate, manual lifetime management layered on top of
Python's own automatic garbage collection, necessary precisely because
Python's own GC has no way to know a Qt object is still "logically"
needed just because it's currently visible on screen.

## Connection

Builds on `pyside6-qapplication-and-mainwindow.md` and directly
contrasts with `pyside6-deletelater-deferred-destruction.md` — that
file covers *intentional*, deliberate destruction, deferred to a safe
point; this file covers *accidental*, premature destruction from a
missing reference, an entirely different real failure mode requiring
the opposite fix (keep a reference alive, rather than schedule
cleanup).

## Try It Yourself

1. Remove the `.show()` call from `make_unreferenced_window` and
   confirm the identical real collection still happens — visibility
   was never actually the deciding factor, only the Python reference
   was.
2. Store a widget in a **local** variable inside a loop, overwriting it
   each iteration (`for i in range(3): temp = QWidget(); temp.show()`),
   and confirm only the **last** one survives after the loop and a real
   `gc.collect()` — each iteration's own previous reference is
   overwritten before the loop ends.
3. Remove a widget from `kept_windows` explicitly (`kept_windows.pop()`)
   and confirm it becomes real, genuinely eligible for collection at
   that point, even though it was alive and visible right up until
   the removal — the reference, not any property of the widget itself,
   is what determines this.

## A Second Real Facet: When the Workaround Stops Being Needed At All

This file's own explicit `self._diff_windows` list exists specifically
because a standalone comparison **window** had no other real, durable
Python reference anywhere. A real, later architectural change — turning
that standalone window into a **tab** living inside an existing, always-
referenced `QTabWidget` — removes the underlying problem entirely,
making the workaround not just simplifiable, but genuinely unnecessary:

```python
import gc
from PySide6.QtWidgets import QTabWidget, QLabel

kept_tabs_widget = QTabWidget()
kept_tabs_widget.show()


def add_unreferenced_tab(tabs):
    page = QLabel("a real tab page, no separate Python reference kept anywhere else")
    tabs.addTab(page, "Compare")
    # No return, no external list -- the only other reference besides
    # tabs' own internal ownership was the local 'page' variable.


add_unreferenced_tab(kept_tabs_widget)
gc.collect()

print("tab count after gc.collect(), with NO separate Python list:", kept_tabs_widget.count())
page_back = kept_tabs_widget.widget(0)
print("the real page widget is still alive and usable:", page_back.text())
```

**Real output, run this session:**
```
tab count after gc.collect(), with NO separate Python list: 1
the real page widget is still alive and usable: a real tab page, no separate Python reference kept anywhere else
```

**What this proves:** `page`'s only local Python reference went out of
scope the moment `add_unreferenced_tab` returned — the identical real
shape as this file's own first, failing example — yet `page` genuinely
survived `gc.collect()` with **zero** extra list anywhere holding it.
`addTab(page, "Compare")` gave `kept_tabs_widget` real, internal
ownership of `page` (Qt's own parent/child tree, not a Python list);
`kept_tabs_widget` itself already has a durable, external Python
reference (the caller's own `kept_tabs_widget` variable), and that's
now sufficient to keep the whole real chain alive.

**Mechanical note:** this isn't a new rule — it's this file's own first
facet's identical rule, `addTab` simply changes *which* Python
reference is doing the keeping-alive work. A standalone window has no
natural container holding a durable reference to it, so the code itself
has to manufacture one (`self._diff_windows`); a tab lives inside a
`QTabWidget` that's *already* referenced for other, unrelated reasons
(it's `self.tabs`, the main window's own central widget), so it needs
no separate bookkeeping at all.

**The real, satisfying payoff, stated plainly:** this project's own
real history shows this exact workaround being deleted outright once a
standalone comparison window was rearchitected into a tab — not
refactored to be "cleaner," but removed entirely, because the
underlying condition that made it necessary (no durable reference
existing anywhere) stopped being true. A workaround tied to a specific
architectural choice is worth re-examining, not just carrying forward
unquestioned, every time that underlying architecture changes.

### Try It Yourself (second facet)

1. Call `kept_tabs_widget.removeTab(0)` (removing the tab, without
   calling `deleteLater()` on the page itself) and confirm the page
   widget still has *some* real Python-level existence immediately
   after — then reason about whether it's now eligible for collection,
   connecting your answer back to `pyside6-deletelater-deferred-
   destruction.md`'s own real distinction between removal and
   destruction.
2. Repeat this facet's own example, but let `kept_tabs_widget` itself
   go out of scope with no reference anywhere (not even a local
   variable) right after `add_unreferenced_tab` runs — confirm the
   *entire* chain, including `page`, is now genuinely collectible,
   direct, real proof the tab's own survival was always downstream of
   `kept_tabs_widget`'s own reference, not something `page` earned
   independently.
3. Find a different real workaround in a codebase you have access to
   (a manually-managed cache, an explicit "keep alive" list, a global
   registry) and reason about what underlying architectural condition
   originally made it necessary — then consider whether that condition
   still actually holds today, or whether the workaround has quietly
   outlived its own original reason for existing.
