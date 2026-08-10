# Concept: Qt's Signal/Slot Mechanism (`QAction`, and Any Other Widget's Own Signals)

**What you'll understand by the end:** what Qt's signal/slot mechanism
actually does, how to build a real, working menu command with it via
`QAction`, that the identical mechanism drives *any* widget's own
built-in signals (not just menu actions), and the two real GoF design
patterns — Observer and Command — this one mechanism is a genuine,
textbook instance of.

**Prerequisites:** `pyside6-qapplication-and-mainwindow.md`,
`event-driven-ui-callbacks.md`.

## Setup

Python 3 with `pip install PySide6`.

## The Problem

A real GUI needs a way for one part of the program (a menu item being
clicked, a text box's content changing, a button being pressed) to
trigger real code elsewhere, without the object that *detects* the
event needing to know, in advance, everything that should happen in
response — and a real application often wants more than one independent
thing to happen (run the command *and* log that it ran, say) without
those independent reactions needing to know about each other, or about
how the event was actually triggered.

## The Isolated Example

`QAction` — a real, standalone command, triggerable from more than one
real widget:

```python
import sys
from PySide6.QtGui import QAction
from PySide6.QtWidgets import QApplication, QMainWindow, QToolButton

app = QApplication.instance() or QApplication(sys.argv)
window = QMainWindow()

triggered_log = []

open_action = QAction("&Open...", window)
open_action.setShortcut("Ctrl+O")
open_action.triggered.connect(lambda: triggered_log.append("handler A: opened!"))

# A SECOND, independent observer registers on the SAME action --
# open_action never needed to know this would happen.
open_action.triggered.connect(lambda: triggered_log.append("handler B: logged the open"))

file_menu = window.menuBar().addMenu("&File")
file_menu.addAction(open_action)

open_action.trigger()  # same real effect a real menu click has
print(triggered_log)
print("shortcut:", open_action.shortcut().toString())
print("text:", open_action.text())

# The SAME QAction object also drives a completely separate real
# widget -- a toolbar button -- with zero new wiring of its own.
button = QToolButton()
button.setDefaultAction(open_action)
triggered_log.clear()
button.click()
print("after clicking the BUTTON (not the menu):", triggered_log)
```

**Real output, run this session:**
```
['handler A: opened!', 'handler B: logged the open']
shortcut: Ctrl+O
text: &Open...
after clicking the BUTTON (not the menu): ['handler A: opened!', 'handler B: logged the open']
```

**What this proves:** one `.trigger()` call ran **both** independently-
registered handlers, in registration order — `open_action` never needed
to know how many observers it had, or what they do. Clicking the
**button** afterward fired the exact same two handlers again, with no
new `.connect()` call anywhere near the button — the button and the
menu item are two different, real widgets sharing one real command
object.

A **different signal**, on a **different kind of widget entirely** —
proving the mechanism isn't specific to `QAction` or menus at all:

```python
import sys
from PySide6.QtGui import QTextCursor
from PySide6.QtWidgets import QApplication, QPlainTextEdit

app = QApplication.instance() or QApplication(sys.argv)

edit = QPlainTextEdit()
change_log = []

edit.textChanged.connect(lambda: change_log.append(edit.toPlainText()))

edit.setPlainText("first")
edit.moveCursor(QTextCursor.MoveOperation.End)
edit.insertPlainText(" second")

print(change_log)
print("number of times textChanged fired:", len(change_log))
```

**Real output, run this session:**
```
['first', 'first second']
number of times textChanged fired: 2
```

**What this proves:** `QPlainTextEdit.textChanged` is a real signal,
built into the widget itself — no `QAction`, no menu, no shortcut
anywhere near it — and connecting to it with `.connect(callback)` works
identically to `QAction.triggered` above: every real edit to the text
(`setPlainText`, then `insertPlainText`) fired the signal exactly once,
each time calling the connected callback with the text's current state
at that moment.

## Mechanical Walkthrough

- `QAction("&Open...", window)` creates a real, standalone object
  representing one user-facing command — it carries its own text, an
  optional icon, and (via `setShortcut`) a real keyboard shortcut, all
  independent of any specific widget displaying it.
- `menuBar().addMenu("&File")` / `file_menu.addAction(open_action)`
  place this existing action into a real menu — the menu doesn't own
  the command's behavior, it only displays and offers to trigger it.
- `.triggered.connect(callback)` — Qt's real **signal/slot**
  connection: `triggered` is a **signal** the action emits when
  activated (by click, shortcut, or `.trigger()`); each `callback` is a
  **slot** — any callable — registered to run when that signal fires.
  Any number of independent slots can connect to the same signal.
- `button.setDefaultAction(open_action)` binds a completely different
  real widget (`QToolButton`) to the *same* `QAction` — the button
  automatically displays the action's text/icon and, when clicked,
  triggers the identical signal every other connected slot already
  reacts to.
- **The mechanism generalizes beyond `QAction` entirely**: any Qt widget
  can define its own signals for its own real events — `QPlainTextEdit`
  emits `textChanged` whenever its content changes, for any real reason
  (typing, `setPlainText`, `insertPlainText`, undo). Connecting to it is
  the identical `.signal.connect(callback)` call, with nothing about
  menus, actions, or shortcuts involved anywhere.

## CS Lens

Qt's signal/slot connection is a real, checked instance of the GoF
**Observer** pattern: a subject (`open_action`, or `edit` for
`textChanged`) emits an event without knowing or caring who, if anyone,
is listening; any number of decoupled observers (the connected
callbacks) can be added or removed independently, with no coupling
between the subject's own code and any particular observer's.

`QAction` itself is *additionally* a real, checked instance of the GoF
**Command** pattern: a request ("open a file") encapsulated as a
standalone, reusable object — carrying its own display text, icon,
shortcut, and enabled state — capable of being triggered identically
from multiple, independent real invokers (a menu item, a toolbar
button, a keyboard shortcut), demonstrated directly above: the same
`open_action` object drove both a menu entry and a completely separate
button, with the button requiring zero new logic of its own. `textChanged`
is Observer *without* Command — there's no reusable, standalone
"request object" here, just a plain notification that something
happened.

Also recognized in: Observer — any publish/subscribe system, DOM event
listeners, reactive-programming frameworks. Command — a text editor's
undo stack (each undoable action stored as a real object), a game's
input-remapping system (the same "jump" command bound to a key, a
gamepad button, and a touchscreen icon simultaneously).

## SE Lens

The real, practical payoff: adding a *second* real reaction to the same
command (the logging handler above) required touching zero existing
code — no modification to `open_action`, no modification to the first
handler, just one more `.connect()` call. Reusing the identical command
across a menu item and a toolbar button required zero duplicated logic
— nothing about "what happens when Open is triggered" is written more
than once, anywhere, regardless of how many different real widgets can
trigger it. The `textChanged` example shows the same decoupling paying
off in a completely different, non-command context: whatever needs to
react to "the text changed" (marking a document dirty, re-running a
syntax check, updating a status bar) can all connect independently,
with `QPlainTextEdit` itself never needing to know any of them exist.

## Connection

Builds on `pyside6-qapplication-and-mainwindow.md` and generalizes
`event-driven-ui-callbacks.md`'s DOM-specific framing to Qt's own real
signal/slot mechanism. This project's own later history shows Command's
reusability exercised even further — the identical `QAction` driving a
completely different kind of widget (a ribbon button) built steps
later, with the menu it originally lived on removed entirely and the
action itself untouched. `textChanged` specifically is the real
mechanism behind a document's own "unsaved changes" dirty-tracking (see
`dirty-flag-unsaved-changes-tracking.md`) — the signal that notifies
"something changed" is Observer; what a connected slot then *does* with
that notification (set a dirty flag, update a title) is a separate
concern this file doesn't itself decide.

## Try It Yourself

1. Add a third, independent slot to `open_action.triggered` and confirm
   `.trigger()` now runs all three, in the order they were connected.
2. Call `open_action.setEnabled(False)` and confirm `button.isEnabled()`
   becomes `False` too, automatically — the button reflects the shared
   action's real state, not its own independent one.
3. Disconnect one specific handler (keep a reference to it, then call
   `open_action.triggered.disconnect(that_handler)`) and confirm
   `.trigger()` now only runs the remaining one(s) — observers can be
   removed as independently as they were added.
4. Connect a second, independent slot to `edit.textChanged` (alongside
   the one already there) and confirm both fire on every real edit —
   the identical multi-observer behavior proven for `QAction.triggered`
   above, now shown on a signal that has nothing to do with actions or
   menus at all.

## A Second Real Facet: Defining a Brand-New Signal, Not Just Consuming One

Every signal used above already existed, built into Qt itself —
`triggered`, `textChanged`. A real, custom class can define its own,
brand-new signal the identical way:

```python
from PySide6.QtCore import QObject, Signal

class FileBrowser(QObject):
    # DEFINING a brand-new signal -- a class attribute naming both
    # that it exists and what type of data it carries.
    file_selected = Signal(str)

    def select(self, path):
        # Firing it explicitly -- nothing does this automatically.
        self.file_selected.emit(path)


browser = FileBrowser()
received = []
browser.file_selected.connect(lambda path: received.append(path))

browser.select("/tmp/report.txt")
browser.select("/tmp/notes.md")

print("received:", received)
```

**Real output, run this session:**
```
received: ['/tmp/report.txt', '/tmp/notes.md']
```

**What this proves:** `file_selected`, a signal that exists **nowhere**
in Qt's own built-in widgets, worked identically to every built-in
signal used earlier in this file — real listeners connected to it via
`.connect(...)` and received every real, emitted value, in order.

**Mechanical note:** `Signal(str)` is a real **class attribute**
declaration — it states the signal exists on every instance of
`FileBrowser`, and that it will always carry one `str` argument when
emitted (a real, checked type, not an untyped free-for-all).
`self.file_selected.emit(path)` is the real, explicit call that
actually fires it — unlike a built-in widget's own signals (which Qt's
own internal code emits automatically in response to real events, like
a click), a custom signal only ever fires where the class's own code
calls `.emit(...)` directly. Defining a signal and consuming one are
two real, necessary halves of the identical mechanism — a signal is
useless if nothing in the codebase can ever define a new one, and this
file's own earlier examples only ever showed the consuming half.

### Try It Yourself (second facet)

1. Define a second custom signal with **no** arguments (`Signal()`) and
   confirm connecting a zero-argument slot to it works — not every
   signal has to carry data.
2. Try calling `.emit("wrong", "number of args")` against `Signal(str)`
   (which only accepts one) and observe the real error this produces —
   confirm the declared signature is genuinely enforced, not just
   documentation.
3. Connect **two** independent slots to `file_selected` and confirm
   both real listeners receive every emitted value — the identical
   Observer-pattern multi-listener behavior this file's very first
   example already proved for `QAction.triggered`, now shown for a
   signal this class itself defined.

## A Third Real Facet: a Framework-Provided `QAction` That Stays Self-Synced

Every `QAction` used so far started as a plain, inert command until an
explicit `.triggered.connect(...)` call gave it a job. Some real Qt
widgets instead **provide their own, ready-made `QAction`** that stays
automatically synchronized with the widget's own state, with no manual
signal wiring at all:

```python
from PySide6.QtCore import Qt
from PySide6.QtWidgets import QApplication, QDockWidget, QListWidget, QMainWindow

app = QApplication.instance() or QApplication(sys.argv)

window = QMainWindow()
dock = QDockWidget("Files")
dock.setWidget(QListWidget())
window.addDockWidget(Qt.DockWidgetArea.LeftDockWidgetArea, dock)
window.show()

toggle_action = dock.toggleViewAction()
print("toggle_action's checked state, dock visible:", toggle_action.isChecked())

dock.hide()
print("after dock.hide() -- toggle_action auto-updates, checked:", toggle_action.isChecked())

# No .connect() was ever written anywhere -- triggering the action re-shows the dock.
toggle_action.trigger()
print("after toggle_action.trigger() -- dock visible again:", dock.isVisible())
print("toggle_action checked again:", toggle_action.isChecked())
```

**Real output, run this session:**
```
toggle_action's checked state, dock visible: True
after dock.hide() -- toggle_action auto-updates, checked: False
after toggle_action.trigger() -- dock visible again: True
toggle_action checked again: True
```

**What this proves:** calling `dock.hide()` directly — with no
`.connect()` call written anywhere near it — genuinely updated
`toggle_action.isChecked()` to `False` on its own. Triggering the
action afterward genuinely re-showed the real dock **and** flipped its
own checked state back to `True`, in both directions, entirely
automatically. `dock.toggleViewAction()` doesn't return a plain,
inert `QAction` a caller has to wire up — it returns one Qt itself
already keeps in sync with the dock's real, current visibility.

**Mechanical note:** this is possible because `toggleViewAction()`
doesn't create a fresh `QAction` and leave the connecting to the
caller — internally, `QDockWidget` already connects its own visibility
changes to that action's checked state, and the action's own
`triggered` signal to actually showing/hiding the dock, using the
exact same signal/slot mechanism this file's own earlier examples
demonstrate by hand — the framework did the wiring, not this file's
own application code.

### Try It Yourself (third facet)

1. Add `toggle_action` to a real menu (`menu.addAction(toggle_action)`)
   and confirm the menu item's own checkmark stays synced with the
   dock's visibility too — the identical action, reused in a second
   real place, per `QAction`'s own Command-pattern reusability already
   established earlier in this file.
2. Look up which other real Qt widgets provide their own ready-made,
   self-syncing actions (`QDockWidget.toggleViewAction()` has real
   siblings on other widget types) and confirm at least one behaves the
   identical way.
3. Try connecting a **second**, independent slot to `toggle_action.
   triggered` yourself, alongside whatever Qt already wired internally
   — confirm your own added slot fires too, without disturbing the
   framework's own existing connection — the same multi-observer
   guarantee this file's very first example established, still holding
   even when one of the "observers" was set up by the framework itself.

## A Fourth Real Fact: Bidirectional Sync Doesn't Infinite-Loop

Connecting two signals to update each other **both ways** looks, at
first glance, like it should recurse forever — `A` changing triggers
updating `B`, which (also connected back to `A`) would seem to trigger
updating `A` again, endlessly. A real, load-bearing mechanical fact
prevents this:

```python
from PySide6.QtWidgets import QScrollBar

left_bar = QScrollBar()
right_bar = QScrollBar()
left_bar.setRange(0, 100)
right_bar.setRange(0, 100)

call_count = {"left_to_right": 0, "right_to_left": 0}


def sync_right(value):
    call_count["left_to_right"] += 1
    right_bar.setValue(value)


def sync_left(value):
    call_count["right_to_left"] += 1
    left_bar.setValue(value)


left_bar.valueChanged.connect(sync_right)
right_bar.valueChanged.connect(sync_left)

left_bar.setValue(42)

print("left_bar.value():", left_bar.value())
print("right_bar.value():", right_bar.value())
print("call counts:", call_count)
```

**Real output, run this session:**
```
left_bar.value(): 42
right_bar.value(): 42
call counts: {'left_to_right': 1, 'right_to_left': 1}
```

**What this proves:** both scrollbars ended up correctly synced at
`42`, and each sync function fired **exactly once** — not an infinite
chain. `left_bar.setValue(42)` fired `sync_right`, which called
`right_bar.setValue(42)`. That in turn fired `sync_left`, which called
`left_bar.setValue(42)` **again** — but `left_bar` was *already* at
`42`, and `QAbstractSlider.setValue(...)` (which `QScrollBar` inherits
from) only emits `valueChanged` when the value **genuinely changes**;
setting it to its own current value is a real, silent no-op that
doesn't re-emit the signal at all. That's the exact, real mechanical
fact that breaks the chain.

### Try It Yourself (fourth fact)

1. Replace `right_bar.setValue(value)` with `right_bar.setValue(value
   + 1)` (deliberately breaking the "settles at the same value"
   assumption) and observe the real, genuine infinite recursion (or a
   real `RecursionError`) this causes — direct, concrete proof the
   no-op-on-unchanged-value behavior is what was actually preventing
   it, not something inherent to bidirectional connections in general.
2. Confirm the identical no-op behavior directly: call
   `left_bar.setValue(left_bar.value())` (setting a widget to its own
   already-current value) and connect a counter to `valueChanged` first
   — confirm the counter stays at `0`.
3. Look up whether this same real "only emits on genuine change"
   behavior applies to other common Qt properties (`QLineEdit.setText`
   given its own already-current text, for instance) — confirm your
   finding with a real, small test.

## A Fifth Real Fact: Disconnecting from a Signal You Don't Own

Every re-scoping example so far (`FindBar.set_editor` and similar)
connected signals living on the widget's **own** children — nothing to
leak. Connecting directly to a signal on an **external** object passed
in from outside (an editor a panel doesn't own) needs a real, explicit
disconnect before re-scoping, or the old connection silently survives
forever:

```python
class BrokenSummaryPanel:
    """NO disconnect -- every previously-viewed editor keeps notifying forever."""

    def __init__(self):
        self.editor = None
        self.refresh_count = 0

    def refresh(self):
        self.refresh_count += 1

    def set_editor(self, new_editor):
        self.editor = new_editor
        self.editor.textChanged.connect(self.refresh)  # no disconnect first


panel = BrokenSummaryPanel()
editor_a = QPlainTextEdit()
editor_b = QPlainTextEdit()

panel.set_editor(editor_a)
editor_a.setPlainText("first document")
print("refresh_count after editing editor_a:", panel.refresh_count)

panel.set_editor(editor_b)
editor_b.setPlainText("second document")
print("refresh_count after editing editor_b:", panel.refresh_count)

editor_a.setPlainText("editor_a changed again -- should NOT still trigger the panel")
print("refresh_count after editing editor_a AGAIN (a stale connection LEAKED):", panel.refresh_count)
```

**Real output, run this session:**
```
refresh_count after editing editor_a: 1
refresh_count after editing editor_b: 2
refresh_count after editing editor_a AGAIN (a stale connection LEAKED): 3
```

**What this proves:** editing `editor_a` **again**, well after the
panel had switched to `editor_b`, still incremented `refresh_count` —
a real, genuine leak: the panel's `refresh` stayed connected to
`editor_a.textChanged` forever, silently accumulating one more stale
connection every time `set_editor` was called on a new editor.

The real fix — disconnect from the old editor first:

```python
class SummaryPanel:
    def __init__(self):
        self.editor = None
        self.refresh_count = 0

    def refresh(self):
        self.refresh_count += 1

    def set_editor(self, new_editor):
        if self.editor is not None:
            self.editor.textChanged.disconnect(self.refresh)
        self.editor = new_editor
        self.editor.textChanged.connect(self.refresh)
```

**Real output, run this session:**
```
refresh_count after editing editor_a: 1
refresh_count after editing editor_b: 2
refresh_count after editing editor_a AGAIN (should be unchanged): 2
```

**What this proves:** with the explicit `.disconnect(self.refresh)`
call first, editing `editor_a` again after switching away from it left
`refresh_count` genuinely **unchanged** — the panel is correctly deaf
to an editor it's no longer scoped to.

**Mechanical note:** `signal.disconnect(handler)` requires passing the
*same* real handler reference originally connected — a bound method
like `self.refresh` works because Python creates an equivalent bound
method object each time, which Qt's own signal machinery recognizes as
the same connection; a `lambda` defined fresh at connect time, by
contrast, cannot be disconnected this way at all (there's no way to
refer to it again), which is exactly why `pyside6-manual-event-loop-
pumping-for-async-test-waiting.md`'s own disconnect technique instead
captures and disconnects by **connection handle**, not by re-supplying
the original callable.

### Try It Yourself (fifth fact)

1. Remove just the `if self.editor is not None:` guard (call
   `.disconnect(self.refresh)` unconditionally) and confirm the real,
   different error this produces on the *first* `set_editor` call, when
   there's genuinely nothing yet connected to disconnect from.
2. Add a *second* panel connected to the same `editor_a`, and confirm
   disconnecting the first panel's own handler leaves the second
   panel's own, independent connection completely untouched — the
   Observer pattern's own multi-listener independence, now shown for
   disconnection too.
3. Reason about why this exact risk never applied to `FindBar`'s own
   re-scoping in earlier steps — what real, structural difference
   between "a signal on your own child widget" and "a signal on an
   externally-owned object" makes one safe to leave connected and the
   other not?

## A Sixth Real Fact: `QShortcut` — a Keyboard Shortcut With No `QAction` At All

Every keyboard shortcut used so far in this project came from
`QAction.setShortcut(...)` — a shortcut riding along with a real,
reusable command that also has menu text, an icon, an enabled state.
`QShortcut` is a genuinely different, smaller mechanism: a keyboard
shortcut bound **directly to a widget**, with no action, no menu item,
no toolbar button anywhere in the picture.

```python
import sys
from PySide6.QtGui import QKeySequence, QShortcut
from PySide6.QtWidgets import QApplication, QWidget

app = QApplication.instance() or QApplication(sys.argv)

widget = QWidget()
widget.show()

fired = []
shortcut = QShortcut(QKeySequence("Ctrl+Down"), widget)
shortcut.activated.connect(lambda: fired.append("next"))

print("shortcut key:", shortcut.key().toString())
print("shortcut parent:", shortcut.parent() is widget)

shortcut.activated.emit()
print("fired:", fired)

print("shortcut context:", shortcut.context())
```

**Real output, run this session:**
```
shortcut key: Ctrl+Down
shortcut parent: True
fired: ['next']
shortcut context: ShortcutContext.WindowShortcut
```

**What this proves:** `QShortcut(QKeySequence("Ctrl+Down"), widget)`
created a real, standalone object — not a property tacked onto some
other command — whose own `.parent()` is genuinely `widget` itself
(the second constructor argument). It carries its own real `activated`
signal, connected to a slot the identical `.connect(callback)` way as
every other signal in this file. Its default `context` is
`WindowShortcut` — real, built-in scoping meaning the shortcut only
fires while some widget in `widget`'s own window has focus, not
globally across the whole application.

**Mechanical note:** unlike `QAction.setShortcut(...)`, there is no
menu text, no icon, no `.trigger()`-vs-click distinction here at all —
`QShortcut` exists purely to bind a key combination to a slot. It's the
right real tool specifically when a shortcut needs to exist **without**
a corresponding visible command anywhere (no menu item, no button) —
exactly this project's own real case: "Next/Previous Pair" navigation
that's reachable by keyboard shortcut alone, with the row of visible
"← Previous Pair"/"Next Pair →" buttons wired to the identical handler
functions via their own separate, ordinary `.clicked.connect(...)`
calls (Observer, same as ever) rather than via a shared `QAction`.

### Try It Yourself (sixth fact)

1. Construct a second `QShortcut` with the *same* key sequence
   (`"Ctrl+Down"`) on a *different* widget in the same window, connect
   it to a second handler, and press-simulate both — reason about which
   one Qt would actually deliver to first, and look up
   `QShortcut.setContext(...)`'s other real values
   (`Qt.ShortcutContext.ApplicationShortcut`, etc.) to see how the
   ambiguity can be controlled explicitly.
2. Connect a `QShortcut.activated` signal to the *same* handler a
   button's `clicked` signal already connects to — confirm both the
   keyboard shortcut and the button press trigger the identical real
   code path, direct proof a `QShortcut` is just another independent
   Observer on the same slot, not a special case.
3. Try constructing a `QShortcut` with no parent widget at all
   (`QShortcut(QKeySequence("Ctrl+Down"), None)`) — look up why Qt's own
   documentation recommends always giving it a real parent widget, and
   connect your answer back to this project's own established parent/
   child ownership lessons (`pyside6-deletelater-deferred-destruction.md`).

## A Seventh Real Fact: `QMainWindow.addActions([...])` — Keeping a Shortcut Alive When Its Owning Widget Is Hidden

`QAction.setShortcut(...)` (used throughout this project since Step 1)
normally keeps working for as long as *some* widget the action is
attached to is visible somewhere in the window. A real, easy-to-miss
consequence: if that widget becomes hidden — exactly what happens to a
ribbon tab's own buttons when a *different* ribbon tab is the one
currently showing — the shortcut genuinely stops firing, even though
the action itself, and the window it belongs to, are both still fully
visible.

```python
import sys
from PySide6.QtGui import QAction, QKeySequence
from PySide6.QtWidgets import QApplication, QMainWindow, QToolButton, QWidget, QVBoxLayout
from PySide6.QtTest import QTest
from PySide6.QtCore import Qt

app = QApplication.instance() or QApplication(sys.argv)


def make_window():
    window = QMainWindow()
    fired = []
    action = QAction("New")
    action.setShortcut(QKeySequence("Ctrl+N"))
    action.triggered.connect(lambda: fired.append("triggered"))

    page = QWidget(window)  # stands in for one ribbon tab's own page
    QVBoxLayout(page)
    button = QToolButton(page)
    button.setDefaultAction(action)
    page.layout().addWidget(button)
    window.setCentralWidget(page)
    return window, action, fired, page


window, action, fired, page = make_window()
window.show()
QTest.qWaitForWindowExposed(window)
page.hide()  # simulating a different ribbon tab now being the active one
app.processEvents()
window.setFocus()
QTest.keyClick(window, Qt.Key.Key_N, Qt.KeyboardModifier.ControlModifier)
app.processEvents()
print("button's own page hidden, no addActions, Ctrl+N fired:", fired)

window2, action2, fired2, page2 = make_window()
window2.addActions([action2])  # the fix
window2.show()
QTest.qWaitForWindowExposed(window2)
page2.hide()
app.processEvents()
window2.setFocus()
QTest.keyClick(window2, Qt.Key.Key_N, Qt.KeyboardModifier.ControlModifier)
app.processEvents()
print("button's own page hidden, WITH addActions, Ctrl+N fired:", fired2)
```

**Real output, run this session:**
```
button's own page hidden, no addActions, Ctrl+N fired: []
button's own page hidden, WITH addActions, Ctrl+N fired: ['triggered']
```

**What this proves:** with the action living only on a `QToolButton`
inside a now-hidden `page`, `Ctrl+N` genuinely does nothing — `fired`
stays empty even though `window` itself is fully visible and focused.
Once the identical action is also registered directly on the window via
`window.addActions([action])`, the exact same hidden-page scenario now
fires correctly. Nothing else about the action changed — same
`QKeySequence`, same `triggered` connection — only *where else* it's
registered.

**Mechanical note — why this matches this project's own real
situation:** a ribbon (`pyside6-composing-a-widget-from-children-via-
layout.md`) shows exactly one tab's page at a time; every other tab's
buttons — and the actions riding on them — are real, genuinely hidden
widgets whenever their own tab isn't the active one. Without also
registering each action on the main window itself, `Ctrl+N`/`Ctrl+S`/
etc. would only work while the *Home* tab happened to be showing — a
real, surprising, hard-to-notice gap (the shortcut "sometimes" works,
depending on which ribbon tab a user last clicked) that
`addActions([...])` on the window closes, by giving every real
shortcut a second, always-visible home.

**How this differs from the sixth fact's own `QShortcut`:** `QShortcut`
is a standalone mechanism with no `QAction` involved at all — the right
tool when no menu item or button should exist anywhere. This facet
keeps the *existing* `QAction` (already wired to a real menu item and a
ribbon button) as the single source of truth, and simply widens *where*
its shortcut stays reachable — a real, different fix for a real,
different problem (an already-visible-somewhere action's shortcut
going dark, not the absence of a visible command at all).

### Try It Yourself (seventh fact)

1. Remove `window.addActions([action])` and instead call
   `page.addAction(action)` (registering it on the tab's own page
   rather than the window) — confirm the shortcut still breaks once
   `page` is hidden, direct proof the fix specifically needs a
   widget that stays visible regardless of which tab is active.
2. Look up `QAction`'s own `shortcutContext()` values
   (`Qt.ShortcutContext.WidgetShortcut`,
   `Qt.ShortcutContext.WindowShortcut`, `Qt.ShortcutContext.
   ApplicationShortcut`) and reason about why `WindowShortcut` (the
   real default) still isn't enough on its own to save a shortcut
   whose *only* registered widget is hidden.
3. Add a *second*, independent `QAction` with the same shortcut,
   registered only on a visible widget, and confirm which of the two
   actually fires — real, direct proof of what happens when two
   real actions with an identical key sequence are both reachable at
   once.
