# Lesson 5: Separating Your Data from Your GUI (PySide6)

Same rules as Lessons 1-4: every block tagged, every output actually run
this session (including real, headless PySide6 windows — verified with
`QT_QPA_PLATFORM=offscreen`, no display needed), CRC-lite on Header
entries.

## What you will build

The actual fix for "I have to close and reopen the GUI when the data
regenerates": a small `InspectionModel` object that *owns* the parsed
data and announces when it changes, and a widget that *subscribes* to
those announcements instead of being built from a one-time snapshot of
data. Once this is wired up, re-parsing — triggered by a button, a
timer, a file watcher, whatever — updates the same, already-open window
in place. Nothing gets destroyed and rebuilt.

## What you need to know first

Everything from Lessons 1-4 (dataclasses, parsing, merging,
config-driven validation). Nothing about PySide6 assumed — this lesson
introduces it from zero.

## Terms used in this lesson

- **Tight coupling** — when one piece of code directly depends on the
  exact internal details of another, such that a change in one forces a
  change in the other. It exists as a named problem because it's the
  root cause of the bug you described: a widget built directly *from* a
  parsed value has no way to find out that value changed later — it was
  never given a way to ask.
- **Observer pattern** — a design where one object (the *subject*)
  announces "something changed" without knowing or caring who's
  listening, and other objects (*observers*) register interest ahead of
  time and get notified when it happens. It exists to solve exactly the
  tight-coupling problem above: the subject doesn't need a direct
  reference to every widget that cares about it, and new observers can
  be added later without changing the subject at all.
- **Signal (Qt)** — Qt's concrete implementation of "announce that
  something happened," attached to a `QObject` subclass. It exists as
  its own mechanism (rather than, say, plain Python callback lists)
  because Qt's signal/slot system is thread-safe and integrates with
  Qt's own event loop, which matters once your GUI does anything
  asynchronous (background parsing, file watching) — outside this
  lesson's scope, but the reason Qt built its own mechanism instead of
  leaving you to hand-roll one.
- **Slot (Qt)** — any regular Python function or method connected to a
  signal, called automatically when that signal fires. It exists as
  Qt's name for "the observer's response" — the thing that actually
  runs when the subject announces a change.
- **Model (in Model/View separation)** — an object whose only job is
  holding and managing data, with no knowledge of how (or whether) it's
  displayed. It exists so the same underlying data could, in principle,
  feed two different widgets, a console printout, and a test — all
  without the data-holding code itself changing.

## Objects and methods used

- **`PySide6.QtCore.QObject`**
  *What it is:* the base class nearly everything in Qt inherits from,
  including anything that wants to emit or receive signals.
  *Implementation:* `class InspectionModel(QObject): ...` — inheriting
  from it is what makes defining a `Signal` on your own class legal at
  all.
  *Its use:* `InspectionModel` isn't a widget and never appears on
  screen — it inherits from `QObject`, not `QWidget`, purely to get
  signal/slot support.
- **`PySide6.QtCore.Signal`**
  *What it is:* a class-level declaration on a `QObject` subclass,
  defining a named "event" that instances of that class can emit.
  *Implementation:* `dataChanged = Signal()` declares a signal with no
  arguments; `Signal(int)` would declare one that carries an integer
  payload when emitted.
  *Its use:* `InspectionModel.dataChanged` — fired every time the
  model's data is replaced, with no payload (listeners just re-read the
  model's current state themselves, rather than being handed a copy of
  it directly).
- **`Signal.connect(callable)`**
  *What it is:* a method on a signal instance, registering a function or
  method to be called whenever that signal fires.
  *Implementation:* `some_signal.connect(some_function)` — `some_function`
  is called with whatever arguments the signal was declared to carry.
  *Its use:* `self.model.dataChanged.connect(self.refresh)` inside the
  widget's constructor — this one line is the entire fix for the
  original bug.
- **`Signal.emit(...)`**
  *What it is:* the method that actually fires a signal, triggering
  every connected slot.
  *Implementation:* `some_signal.emit()` (or `.emit(value)` for a signal
  declared to carry a payload).
  *Its use:* called once, inside `InspectionModel.set_data`, right after
  the model's internal data is replaced — the single point where "data
  changed" becomes a real, broadcast event.
- **`PySide6.QtWidgets.QWidget`**
  *What it is:* the base class for anything that appears as a visible
  window or region on screen.
  *Implementation:* `class ReportWidget(QWidget): ...`.
  *Its use:* `ReportWidget` is the actual visible piece — unlike
  `InspectionModel`, this one does inherit from a widget base class,
  because it's meant to be shown.
- **`PySide6.QtWidgets.QApplication`**
  *What it is:* the object managing the whole GUI application's event
  loop and global state; exactly one must exist before creating any
  widget.
  *Implementation:* `QApplication.instance() or QApplication(sys.argv)`
  — reuses an existing instance if one's already running (relevant for
  tests, which may create widgets multiple times), otherwise creates one.
  *Its use:* required once, near your program's actual entry point (or
  once per test session, as in this lesson's tests) — never created more
  than once per process.

---

## Concept Unit 1: Naming the actual bug

### The Problem

You already know the symptom: re-parsed data doesn't show up until the
GUI restarts. Before looking at the fix — given what a widget's
`__init__` typically does (set up its own state, once, when constructed)
— what would have to be true about *when* that widget reads your parsed
data, for a later re-parse to have any chance of being reflected? Is
"read the data once, at construction" ever going to work for that?

### Introduce the concept in isolation

> **SCRATCH — run it yourself, then discard it. Never saved anywhere.**

```python
class BrokenLabel:
    """Stands in for a GUI widget: reads data once, at construction time."""
    def __init__(self, data):
        self.displayed_text = f"Value: {data}"

data_holder = {"value": 1}
label = BrokenLabel(data_holder["value"])
print("label shows:", label.displayed_text)

data_holder["value"] = 99  # simulates re-parsing producing new data
print("data_holder now:", data_holder["value"])
print("label STILL shows:", label.displayed_text)
```

Real output:

```
label shows: Value: 1
data_holder now: 99
label STILL shows: Value: 1
```

This is your actual bug, reproduced in six lines with no GUI framework
involved at all. `BrokenLabel.__init__` copies the *value* `1` into
`self.displayed_text` at construction time — once that copy happens,
`label` has no ongoing connection to `data_holder` whatsoever. Changing
`data_holder["value"]` later can't possibly affect `label`, because
nothing ever told `label` to look again. This proves the problem isn't
"something's wrong with Qt" — it's this exact shape, copy-once at
construction, wherever it appears.

### Discard the throwaway example

`BrokenLabel`/`data_holder` don't appear again — only the diagnosis
carries forward: the fix has to replace "read once at construction" with
"read again whenever told to."

### Connect

Named the actual problem. Next: the mechanism that lets something "tell"
a widget to look again.

---

## Concept Unit 2: Signals and slots, in isolation

### The Problem

You need a way for one object to say "something changed" and have
another object react — without the first object needing to know
anything about widgets, labels, or GUI code at all (your parsing/merge
code from Lessons 1-4 shouldn't need to import anything GUI-related).
What would the *smallest* version of "announce an event, let others
react" look like, using nothing but a name for the event and a list of
interested parties?

### Introduce the concept in isolation

> **SCRATCH — run it yourself, then discard it. Never saved anywhere.**

```python
from PySide6.QtCore import QObject, Signal

class Broadcaster(QObject):
    valueChanged = Signal(int)

def on_value_changed(new_value):
    print("received signal, new_value =", new_value)

b = Broadcaster()
b.valueChanged.connect(on_value_changed)

print("emitting 5...")
b.valueChanged.emit(5)
print("emitting 99...")
b.valueChanged.emit(99)
```

Real output:

```
emitting 5...
received signal, new_value = 5
emitting 99...
received signal, new_value = 99
```

This proves the whole mechanism in isolation: `Broadcaster` (which
inherits from `QObject`) declares a signal, `on_value_changed` (a plain
function, nothing GUI about it) registers interest via `.connect(...)`,
and every `.emit(...)` call runs `on_value_changed` automatically, with
the emitted value passed straight through as its argument. Crucially,
`Broadcaster` itself never calls `on_value_changed` by name anywhere —
it has no idea that function exists. That's the decoupling: the
subject (`Broadcaster`) only knows it *has* a signal; it never knows
who's listening.

### Discard the throwaway example

`Broadcaster`/`on_value_changed` don't appear again — only the
declare-a-signal, connect-a-function, emit-to-notify shape carries
forward.

### Connect

You've proven the mechanism works, standalone. Next: attaching it to
your real data.

---

## Concept Unit 3: A model that owns the data and announces changes

### The Problem

Your parsing/merge/validation code from Lessons 1-4 currently returns
plain values — a list of `MergedOperation`s, a `ValidationResult` — with
nothing holding onto them after the function that produced them returns.
Given `Broadcaster`'s shape from Concept Unit 2, what would a small
object need to do to (a) hold onto the *current* data persistently, and
(b) announce whenever that data is replaced?

### The New Code

> **→ goes in `inspection_model.py`**

```python
from PySide6.QtCore import QObject, Signal


class InspectionModel(QObject):
    """Owns the current merged/validated data. Knows nothing about any widget."""

    dataChanged = Signal()

    def __init__(self):
        super().__init__()
        self._merged_ops = []
        self._result = None

    @property
    def merged_ops(self):
        return self._merged_ops

    @property
    def result(self):
        return self._result

    def set_data(self, merged_ops, result):
        """The only way this model's data ever changes."""
        self._merged_ops = merged_ops
        self._result = result
        self.dataChanged.emit()
```

### The Updated Project

Brand-new file — full contents shown above.

### Mechanical walkthrough

- `class InspectionModel(QObject):` — inherits from `QObject`, not
  `QWidget`; this object is never shown on screen, it just needs
  signal/slot support, which `QObject` provides.
- `dataChanged = Signal()` — a signal carrying no payload; listeners
  don't get handed the new data directly, they're just told "go look,"
  and read the model's current state themselves via `merged_ops`/`result`
  — a deliberate choice, explained in the SE lens below.
- `def __init__(self): super().__init__()` — `QObject.__init__` must run
  before this object's signals/slots work at all; skipping
  `super().__init__()` here is a real, easy-to-make mistake that fails
  silently in confusing ways, so it's worth naming explicitly even
  though it's "just" the usual Python inheritance call.
- `self._merged_ops = []`, `self._result = None` — private-by-convention
  storage (the leading underscore signals "don't touch this directly
  from outside"), starting empty/`None` — this is the model's state
  *before* any real parsing has happened, matching your real program's
  startup moment.
- `@property def merged_ops(self): return self._merged_ops` — a
  read-only public view onto the private field, same `@property`
  mechanism from Lesson 1's `ValidationResult.is_valid`: callers read
  `model.merged_ops` like a plain attribute, but can't accidentally
  assign to it directly (`model.merged_ops = [...]` would raise, since
  no setter is defined) — the *only* sanctioned way to change this data
  is `set_data`, below.
- `def set_data(self, merged_ops, result):` — takes the already-computed
  results (from `merge_by_id` and `validate_all_against_gui_config`,
  Lessons 3-4) and stores them, then calls `self.dataChanged.emit()` as
  the very last step — after the data is actually updated, so anything
  reacting to the signal sees the *new* state, not stale data mid-update.

### Run it

```python
model = InspectionModel()

def on_changed():
    print('signal fired: model now has', len(model.merged_ops), 'ops, is_valid =',
          model.result.is_valid if model.result else None)

model.dataChanged.connect(on_changed)

op = MergedOperation(op_id='1101', tool_name='0.5 Bull endmill', tool_type='Bull endmill',
                      feedrate_ipm=48.0, spindle_rpm=4000.0)
result = validate_all_against_gui_config([op], GuiConfig())
model.set_data([op], result)

op2 = MergedOperation(op_id='1101', tool_name='0.5 Bull endmill', tool_type='Bull endmill',
                       feedrate_ipm=999.0, spindle_rpm=4000.0)
result2 = validate_all_against_gui_config([op2], GuiConfig())
model.set_data([op2], result2)
```

Real output:

```
signal fired: model now has 1 ops, is_valid = True
signal fired: model now has 1 ops, is_valid = False
```

Two separate `set_data` calls, two separate signal firings, each
reflecting the model's state *at that moment* — proving the model
correctly announces every change, not just the first one.

### CS lens

`InspectionModel` is the **Model** half of Model/View separation (an
application of the Observer pattern from this lesson's Terms section):
an object whose entire job is owning and announcing changes to data,
with zero knowledge of how — or whether — that data gets displayed.
Also recognized in: any reactive UI framework (React's state, Vue's
reactivity system, SwiftUI's `@State`) — all solve this identical
problem, "how does a view find out data changed," with mechanisms
different from Qt's signals but the same underlying idea.

### SE lens

The signal could have been declared `Signal(list, object)` and emit the
new `merged_ops`/`result` directly as arguments, letting listeners skip
reading `model.merged_ops` themselves. The no-payload version chosen
here is simpler and, more importantly, means a listener always reads the
model's *current, authoritative* state at the moment it reacts — with a
payload-carrying signal, a slow listener could theoretically process an
older emitted value after a newer one had already been emitted and
overwritten it, if things happened out of order. For a single-threaded
GUI updating from simple, direct method calls (this lesson's whole
setup), that risk is minimal — but "always read current state, don't
trust what was in the signal" is a safer default habit as the app grows.

### Connect

You have a model that holds data and announces changes. Next: a real
widget that listens.

---

## Concept Unit 4: A widget that subscribes instead of snapshotting

### The Problem

Given `InspectionModel.dataChanged` from Concept Unit 3, and given the
`BrokenLabel` bug from Concept Unit 1 (read once, at construction) —
what needs to happen inside a real widget's `__init__` so that reading
the model's data isn't a one-time thing?

### The New Code

> **→ goes in `report_widget.py`**

```python
from PySide6.QtWidgets import QWidget, QLabel, QVBoxLayout


class ReportWidget(QWidget):
    """Knows about the model (to read from it and to listen for changes).
    The model does not know this widget exists."""

    def __init__(self, model, parent=None):
        super().__init__(parent)
        self.model = model
        self.status_label = QLabel("No data yet")
        layout = QVBoxLayout(self)
        layout.addWidget(self.status_label)

        self.model.dataChanged.connect(self.refresh)
        self.refresh()  # show whatever the model already has, if anything

    def refresh(self):
        """The one place this widget reads from the model and updates itself.
        Called at construction AND every time the model's data changes."""
        if self.model.result is None:
            self.status_label.setText("No data yet")
            return
        status = "PASS" if self.model.result.is_valid else "FAIL"
        self.status_label.setText(f"{len(self.model.merged_ops)} operations — {status}")
```

### The Updated Project

Brand-new file — full contents shown above.

### Mechanical walkthrough

- `class ReportWidget(QWidget):` — this one *does* inherit from
  `QWidget`, since it's meant to be a real, visible piece of UI, unlike
  `InspectionModel`.
- `def __init__(self, model, parent=None):` — takes the model as a
  constructor argument; `parent=None` is ordinary Qt convention for
  "this widget may optionally be embedded inside another widget" — not
  used further in this lesson, included because it's idiomatic Qt.
- `super().__init__(parent)` — `QWidget.__init__` must run first, same
  reasoning as `QObject.__init__` in Concept Unit 3.
- `self.model = model` — stores a reference to the model so `refresh`
  can read from it later; this is the widget knowing about the model
  (one direction of the relationship) — the model, per the docstring,
  never gets a reference back to this widget (the other direction stays
  absent, which is the actual point).
- `self.status_label = QLabel("No data yet")` — a real Qt label widget,
  with a placeholder starting text.
- `layout = QVBoxLayout(self)`, `layout.addWidget(self.status_label)` —
  standard Qt layout setup: a vertical box layout, attached to this
  widget, containing the label. Not this lesson's focus — included
  because a `QWidget` needs some layout to actually show its children.
- `self.model.dataChanged.connect(self.refresh)` — **this line is the
  entire fix.** The widget registers its own `refresh` method as a slot
  for the model's signal, right here in `__init__` — meaning from this
  point forward, every future `model.set_data(...)` call, no matter when
  it happens or what triggers it, will call `self.refresh()`
  automatically.
- `self.refresh()` — called once immediately after connecting, so the
  widget shows whatever the model *already* has (if `set_data` was
  somehow called before this widget existed) rather than staying blank
  until the next change.
- `def refresh(self):` — reads `self.model.result`/`self.model.merged_ops`
  fresh, every single time it's called — never storing a snapshot in its
  own `__init__`-time state the way `BrokenLabel` did. This is the
  direct structural fix for Concept Unit 1's bug: reading happens on
  every call to `refresh`, not once.

### Run it

Constructing the widget once, then updating the model twice, with no
widget reconstruction at any point:

```python
model = InspectionModel()
widget = ReportWidget(model)
print('at construction, label reads:', repr(widget.status_label.text()))

op = MergedOperation(op_id='1101', tool_name='0.5 Bull endmill', tool_type='Bull endmill',
                      feedrate_ipm=48.0, spindle_rpm=4000.0)
result = validate_all_against_gui_config([op], GuiConfig())
model.set_data([op], result)
print('after first set_data, label reads:', repr(widget.status_label.text()))

op2 = MergedOperation(op_id='1101', tool_name='0.5 Bull endmill', tool_type='Bull endmill',
                       feedrate_ipm=999.0, spindle_rpm=4000.0)
result2 = validate_all_against_gui_config([op2], GuiConfig())
model.set_data([op2], result2)
print('after re-parse (second set_data), label reads:', repr(widget.status_label.text()))
```

Real output:

```
at construction, label reads: 'No data yet'
after first set_data, label reads: '1 operations — PASS'
after re-parse (second set_data), label reads: '1 operations — FAIL'
```

`widget` is the *same Python object* across all three print statements —
never recreated, never destroyed. That's the fix, proven for real: the
label's text changes across two separate `set_data` calls with zero
reconstruction anywhere in this trace.

### Execution trace

Tracing the second `model.set_data([op2], result2)` call:

1. `InspectionModel.set_data` runs: `self._merged_ops = [op2]`,
   `self._result = result2` — the model's private state is now updated.
2. `self.dataChanged.emit()` fires. Qt looks up everything connected to
   this signal — one thing: `widget.refresh`, connected back in
   `ReportWidget.__init__`.
3. `widget.refresh()` runs. `self.model.result` is now `result2`
   (`is_valid` is `False`, since `feedrate_ipm=999.0` is out of the
   default `GuiConfig`'s allowed range). `status = "FAIL"`.
   `self.status_label.setText("1 operations — FAIL")` updates the
   already-existing label widget's text in place.
4. Control returns all the way back up to `set_data`, which returns.
   Nothing about this sequence created a new widget, a new window, or a
   new label — one existing `QLabel` object had its displayed text
   changed.

### CS lens

`ReportWidget` is the **View** half of Model/View separation, and
`self.refresh` is a **slot** in Qt's own terms — this whole unit is one
concrete instance of the Observer pattern named in this lesson's Terms
section, now fully wired: subject (`InspectionModel`), announcement
mechanism (`Signal`), observer (`ReportWidget`), and the observer's
reaction (`refresh`, connected as a slot).

### SE lens

The alternative — polling: have the widget check
`model.merged_ops`/`model.result` on a repeating timer, say every second,
instead of being told when to look — would also work, and doesn't
require the model to know anything about signals either. It costs real,
constant CPU work checking for changes that usually haven't happened,
and it introduces a real lag (up to one polling interval) between a
change and the widget noticing it. Signals cost a small amount of setup
(the `.connect(...)` call) in exchange for zero wasted work and
zero-lag updates — the right tradeoff for a GUI reacting to explicit user
or program actions like a "Reload" click, rather than something like a
live external sensor feed where polling is sometimes unavoidable.

### Connect

Model and widget are now correctly decoupled. Last piece: the actual
trigger — the function your "Reload" button (or whatever kicks off
re-parsing in your real program) should call.

---

## Concept Unit 5: Wiring re-parsing to the model

### The New Code

> **→ goes in `controller.py`**

```python
from toolpath_ops import parse_toolpath_ops
from setupsheet import parse_setup_sheet_file
from merge import merge_by_id
from gui_config import GuiConfig
from gui_validate import validate_all_against_gui_config


def reparse_and_update(model, toolpath_path, xml_path, gui_config):
    """The actual I/O + pipeline call, triggered by a 'Reload' button or a file watcher.
    Never touches any widget directly - only ever talks to the model."""
    with open(toolpath_path) as f:
        toolpath_ops = parse_toolpath_ops(f.readlines())
    sheet = parse_setup_sheet_file(xml_path)
    merged_ops = merge_by_id(toolpath_ops, sheet.operations)
    result = validate_all_against_gui_config(merged_ops, gui_config)
    model.set_data(merged_ops, result)
```

### Mechanical walkthrough

- `reparse_and_update(model, toolpath_path, xml_path, gui_config)` — a
  **controller** function, in the Model/View/Controller sense: it's the
  glue that calls your Lessons 1-4 pipeline (parse both files, merge,
  validate) and hands the *result* to the model via `set_data`. Notice
  what it does *not* do: it never imports `ReportWidget`, never touches
  any label, never knows a GUI is even involved. This function would
  work identically if called from a command-line script with no GUI at
  all — that's the real payoff of the separation this lesson built:
  parsing/merging/validating is completely independent of display, and
  was already independent as far back as Lesson 1's I/O-vs-logic split;
  this lesson just extends that same boundary to cover the GUI layer
  too.
- In your real program, this function is what a `QPushButton`'s
  `clicked` signal (Qt's built-in signal for button presses, not
  something this lesson defines) would connect to — the same
  `.connect(...)` mechanism from Concept Unit 2, just connecting a
  built-in Qt signal to your own function instead of your own signal to
  your own function.

### Run it

```python
model = InspectionModel()
widget = ReportWidget(model)
print('before any reload:', repr(widget.status_label.text()))

reparse_and_update(model, 'toolpath.txt', 'sample.xml', GuiConfig())
print('after Reload click #1:', repr(widget.status_label.text()))

strict = GuiConfig(min_feedrate=10.0)
reparse_and_update(model, 'toolpath.txt', 'sample.xml', strict)
print('after Reload click #2 (stricter config, same files):', repr(widget.status_label.text()))
```

Real output:

```
before any reload: 'No data yet'
after Reload click #1: '2 operations — PASS'
after Reload click #2 (stricter config, same files): '2 operations — FAIL'
```

This is the complete, real fix for your original problem, proven: one
`widget` object, constructed once, correctly reflecting two separate
re-parses — the second one even using a *different* validation config —
with no restart anywhere in the trace.

### Connect

Parsing (Lessons 1-2), merging (Lesson 3), config-driven validation
(Lesson 4), and now live GUI updates (this lesson) are all wired
together through one clean seam: the controller calls the pipeline and
hands results to the model; the model announces; the widget reacts. No
piece needs to know about the pieces more than one step away from it.

---

## Concept Unit 6: Testing the model, the widget, and the wiring

### The New Code

> **→ goes in `test_model_and_widget.py`**

```python
import pytest
from PySide6.QtWidgets import QApplication
from inspection_model import InspectionModel
from report_widget import ReportWidget
from merge import MergedOperation, ValidationResult
from controller import reparse_and_update
from gui_config import GuiConfig

@pytest.fixture(scope="session")
def qapp():
    """A QApplication is required before creating any QWidget - one per test session."""
    app = QApplication.instance()
    if app is None:
        app = QApplication([])
    return app


def make_result(is_valid=True):
    result = ValidationResult()
    if not is_valid:
        result.add("1101", "some problem")
    return result


def test_model_starts_empty():
    model = InspectionModel()
    assert model.merged_ops == []
    assert model.result is None

def test_set_data_updates_model_state():
    model = InspectionModel()
    op = MergedOperation(op_id="1101")
    result = make_result(is_valid=True)
    model.set_data([op], result)
    assert model.merged_ops == [op]
    assert model.result is result

def test_set_data_emits_signal():
    model = InspectionModel()
    received = []
    model.dataChanged.connect(lambda: received.append(True))
    model.set_data([MergedOperation(op_id="1101")], make_result())
    assert received == [True]

def test_set_data_called_twice_emits_signal_twice():
    model = InspectionModel()
    count = {"n": 0}
    model.dataChanged.connect(lambda: count.update(n=count["n"] + 1))
    model.set_data([], make_result())
    model.set_data([], make_result())
    assert count["n"] == 2


def test_widget_shows_placeholder_before_any_data(qapp):
    model = InspectionModel()
    widget = ReportWidget(model)
    assert widget.status_label.text() == "No data yet"

def test_widget_updates_after_model_change_with_no_reconstruction(qapp):
    model = InspectionModel()
    widget = ReportWidget(model)  # constructed once

    model.set_data([MergedOperation(op_id="1101")], make_result(is_valid=True))
    assert "PASS" in widget.status_label.text()

    model.set_data([MergedOperation(op_id="1101")], make_result(is_valid=False))
    assert "FAIL" in widget.status_label.text()  # same widget object, new text

def test_widget_constructed_after_model_already_has_data_shows_it_immediately(qapp):
    model = InspectionModel()
    model.set_data([MergedOperation(op_id="1101")], make_result(is_valid=True))
    widget = ReportWidget(model)  # constructed AFTER data already exists
    assert "PASS" in widget.status_label.text()


def test_reparse_and_update_populates_model_from_real_files():
    model = InspectionModel()
    reparse_and_update(model, "toolpath.txt", "sample.xml", GuiConfig())
    assert len(model.merged_ops) == 2
    assert model.result.is_valid

def test_reparse_with_stricter_config_flips_validity():
    model = InspectionModel()
    reparse_and_update(model, "toolpath.txt", "sample.xml", GuiConfig())
    assert model.result.is_valid

    strict = GuiConfig(min_feedrate=10.0)
    reparse_and_update(model, "toolpath.txt", "sample.xml", strict)
    assert not model.result.is_valid

def test_widget_reflects_controller_reparse_end_to_end(qapp):
    model = InspectionModel()
    widget = ReportWidget(model)
    reparse_and_update(model, "toolpath.txt", "sample.xml", GuiConfig())
    assert "PASS" in widget.status_label.text()
```

### Mechanical walkthrough

- `@pytest.fixture(scope="session")` — a **pytest fixture**: a function
  whose return value can be requested by name as a test function's
  parameter, with `pytest` handling calling it and passing the result
  in. `scope="session"` means it's created once for the entire test run
  and reused, rather than once per test — appropriate here since a
  `QApplication` is meant to be a single, process-wide object, not
  something recreated per test.
- `QApplication.instance() or QApplication([])` — checks whether one
  already exists (relevant across multiple test files or repeated test
  runs in the same process) before creating a new one, avoiding a real
  Qt error that occurs if you try to construct a second `QApplication`.
- `def qapp():` as a test parameter — any test function that declares
  `qapp` as a parameter (like `test_widget_shows_placeholder_before_any_data(qapp)`)
  automatically gets the fixture's return value injected by `pytest`;
  tests that don't touch any real widget (the model-only tests above)
  don't need it at all, since only *constructing a `QWidget`* requires a
  `QApplication` to exist first.
- The four model tests each isolate one fact about `InspectionModel`
  from Concept Unit 3: starts empty, `set_data` stores what it's given,
  `set_data` emits, and emits *every* time, not just once.
- `test_widget_constructed_after_model_already_has_data_shows_it_immediately`
  — a case not explicitly walked through earlier: what if the widget is
  built *after* the model already has real data? This proves the
  `self.refresh()` call at the end of `ReportWidget.__init__` (Concept
  Unit 4) handles that correctly too, not just the "starts empty" case.
- The controller tests use the real sample files on disk, same as every
  golden test in this lesson series — proving the actual end-to-end path
  a "Reload" button press would take.

### Run it

Actually run with `python3 -m pytest test_model_and_widget.py -v`. Real
output:

```
============================= test session starts ==============================
platform linux -- Python 3.12.3, pytest-9.1.1, pluggy-1.6.0
collecting ... collected 10 items

test_model_and_widget.py::test_model_starts_empty PASSED                                    [ 10%]
test_model_and_widget.py::test_set_data_updates_model_state PASSED                          [ 20%]
test_model_and_widget.py::test_set_data_emits_signal PASSED                                 [ 30%]
test_model_and_widget.py::test_set_data_called_twice_emits_signal_twice PASSED               [ 40%]
test_model_and_widget.py::test_widget_shows_placeholder_before_any_data PASSED               [ 50%]
test_model_and_widget.py::test_widget_updates_after_model_change_with_no_reconstruction PASSED [ 60%]
test_model_and_widget.py::test_widget_constructed_after_model_already_has_data_shows_it_immediately PASSED [ 70%]
test_model_and_widget.py::test_reparse_and_update_populates_model_from_real_files PASSED     [ 80%]
test_model_and_widget.py::test_reparse_with_stricter_config_flips_validity PASSED            [ 90%]
test_model_and_widget.py::test_widget_reflects_controller_reparse_end_to_end PASSED          [100%]
```

(All 10 collected tests passed; run with `-v` this session, headless via
`QT_QPA_PLATFORM=offscreen` — the same environment variable you'd set
for CI, but not needed on your own machine with a real display.)

---

## Connect the pieces

One re-parse, traced end to end through everything built in this lesson:
a "Reload" button's `clicked` signal (Qt's own, not one this lesson
defined) is connected to `reparse_and_update` (Unit 5). When clicked,
`reparse_and_update` runs your real Lessons 1-4 pipeline — parse the
toolpath file, parse the XML, merge by ID, validate against the current
`GuiConfig` — then calls `model.set_data(merged_ops, result)` (Unit 3).
Inside `set_data`, the model's private fields are updated, then
`self.dataChanged.emit()` fires (Unit 3). Qt calls every connected slot
— here, `widget.refresh` (Unit 4), connected back when the widget was
first constructed. `refresh` reads the model's *current* `merged_ops`
and `result` (not a stale copy — Concept Unit 1's bug, fixed) and calls
`self.status_label.setText(...)`, updating the visible label in place.
The `ReportWidget` object itself, and the window it lives in, were never
destroyed or rebuilt at any point in this entire chain — which is the
whole fix for the problem you described.

---

## Files for this lesson

`inspection_model.py`, `report_widget.py`, `controller.py`,
`test_model_and_widget.py`, and an updated `requirements.txt` (adding
`PySide6`) are attached. Run tests with:

```
QT_QPA_PLATFORM=offscreen python3 -m pytest test_model_and_widget.py -v
```

(`QT_QPA_PLATFORM=offscreen` is only needed in headless environments
like CI or this sandbox — drop it when running on your own machine with
a real display.)

## Where this goes from here

Your real GUI almost certainly has more than one widget caring about
this data (a table of operations, a status bar, maybe a per-row error
indicator) — every one of them connects to the *same*
`model.dataChanged` signal, independently, the exact same way
`ReportWidget` did here. None of them need to know about each other, and
none of them need any change to `InspectionModel` or `reparse_and_update`
at all. If you want, the next lesson can cover a richer widget — a real
`QTableWidget` showing one row per operation, with per-row error
highlighting driven by the same `errors_for`-style lookup from Lesson 4's
Jinja report, now applied to actual Qt widgets instead of rendered text.
