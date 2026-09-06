# Lesson 8: Making the History Outlive the Program

**What you will build. Every name greeted in Lesson 7's history list
currently vanishes the instant the program closes, since
`GreetedNamesModel` only ever exists in memory for as long as the
process runs. This lesson saves that list to a real file on disk when
the program quits, and loads it back the next time the program starts
— so a user who greets three people, closes the application, and
reopens it later finds all three names still there. The transferable
problem this lesson is actually about: every program built so far in
this curriculum has had a clean, simple lifecycle — start, run, stop,
forget everything. The moment a program needs to remember anything
across separate runs, it has to cross a boundary this curriculum
hasn't touched yet: reading and writing a real file, and, just as
important, handling every realistic way that file might not be exactly
what the program expects — because a file on disk, unlike an in-memory
Python object, can be missing, empty, or corrupted by something outside
the program's own control, and a program that doesn't plan for that
will crash the first time reality doesn't match its assumptions.

**What you need to know first.** Lesson 1's `QApplication` and the
event loop. Lesson 5's `NameGreeter` and encapsulation. Lesson 6's
`app.quit()`, and its own confirmed requirement that the event loop be
running for it to take effect. Lesson 7's `GreetedNamesModel`.

**Terms used in this lesson**

- **Persistence** — making data survive beyond the lifetime of the
  program that created it, typically by writing it to a file or a
  database. Exists as a distinct concept from simply "having data,"
  because everything this curriculum has built so far has been
  perfectly real, working data — right up until the process ends, at
  which point it's gone; persistence is specifically the extra step of
  saving that data somewhere that outlives the process itself.
- **Serialization** — converting an in-memory value (here, a Python
  list of strings) into a format that can be written to a file and
  later read back into an equivalent in-memory value. Exists because a
  file on disk is fundamentally just bytes — there's no such thing as
  "a Python list" sitting directly on a hard drive; something has to
  define exactly how a list's contents get turned into bytes, and back,
  consistently.
- **Defensive copy** — returning a *copy* of an internal, mutable value
  (here, a list) from a method, rather than the original object itself,
  so that code outside the class can't accidentally (or deliberately)
  modify the class's own internal state by mutating what it was handed
  back. Exists as a direct extension of Lesson 5's own encapsulation
  principle: exposing a value isn't automatically safe just because
  it's *readable* from outside — if it's also *mutable*, handing back
  the real, original object quietly breaks the same boundary
  encapsulation was meant to protect.

**Objects and methods used**

- **`GreetedNamesModel.__init__(self, names=None, parent=None)`**
  - *What it is:* Lesson 7's own model constructor, modified to
    optionally accept a starting list of names, rather than always
    beginning empty.
  - *Implementation:* the same method already fully explained in
    Lesson 7, with one new parameter, `names=None`, and one new line,
    `self._names = list(names) if names is not None else []`.
  - *Its use:* this lesson needs the model to be constructible either
    with real, previously-saved names (loaded from disk at startup) or
    with none at all (the very first time the program is ever run, with
    no history file yet) — confirmed this session, both cases work
    correctly: `NamesModel(["Alice", "Bob"])` starts with
    `rowCount()` reporting `2`, while `NamesModel()`, called with no
    argument at all, starts at `0`, exactly as Lesson 7's own version
    always did.
  - *Type:* an instance method — a modification to code this project
    already owns and controls, not a new external dependency.
  - *Responsibility:* still constructs a working model, exactly as
    Lesson 7 already established — with one addition: it now
    guarantees `self._names` is a genuinely separate list object from
    whatever was passed in, not a second reference to the caller's own
    list — confirmed this session, `list(names)` really does produce a
    new object, distinct from the original.
  - *Depends on:* `list(...)`, Python's own built-in function for
    constructing a new list from an existing iterable — explained in
    full below, under "Everything else in the file."
  - *Connects to:* this lesson's own `load_history` function, covered
    below, whose return value is passed directly into this constructor.
  - *Shape:* unchanged from Lesson 7 in every other respect — still one
    object per model, still answering `rowCount()` and `data()` exactly
    as before.

- **`GreetedNamesModel.names(self)`**
  - *What it is:* a new method, added this lesson, that returns every
    name currently held by the model, as a plain Python list.
  - *Implementation:* `return list(self._names)` — the same `list(...)`
    construct used in the modified constructor, above, applied here to
    produce a **defensive copy**, already defined in this lesson's
    Terms section, above, rather than the model's own real, internal
    list object.
  - *Its use:* this lesson needs a way to get the model's current
    contents out, at quit time, in order to save them — without
    exposing `self._names` itself, which would let outside code mutate
    the model's real internal state directly, bypassing `add_name` and
    its required `beginInsertRows`/`endInsertRows` signaling entirely.
  - *Type:* an ordinary instance method, this project's own new
    addition to a class it already owns.
  - *Responsibility:* confirmed directly this session: mutating the
    list this method returns (appending an extra, fake name to it) had
    **no effect at all** on the model's own real data — a second call
    to `.names()` immediately afterward still reported only the real,
    original names, proving the returned list really is independent,
    not a second reference to the same underlying object.
  - *Depends on:* `self._names`, this instance's own real data.
  - *Connects to:* this lesson's own `save_history` function, covered
    below, which receives this method's return value directly.
  - *Shape:* returns a plain Python `list` of strings — confirmed this
    session, in the exact order names were added, matching
    `data()`'s own row-by-row order exactly.

- **`json.dumps(value)` and `json.loads(text)`**
  - *What they are:* two functions from Python's own standard-library
    `json` module — `dumps` converts a Python value into a JSON-
    formatted string; `loads` converts a JSON-formatted string back
    into an equivalent Python value.
  - *Implementation:* real signatures `json.dumps(obj) -> str` and
    `json.loads(s: str) -> Any`. Confirmed this session,
    `json.dumps(["Alice", "Bob", "Carol"])` produces the exact string
    `'["Alice", "Bob", "Carol"]'`, and passing that exact string into
    `json.loads(...)` produces back a real Python list, confirmed equal
    to the original with `==`.
  - *Its use:* this lesson's own `save_history` and `load_history`
    functions, covered below, use these two functions as the actual
    **serialization** mechanism, already defined in this lesson's Terms
    section, above, translating between the model's own real list of
    strings and the plain text a file on disk can actually hold.
  - *Type:* standard-library functions, not methods on any particular
    object — called directly as `json.dumps(...)` and `json.loads(
    ...)`, after `import json`.
  - *Responsibility:* `dumps` and `loads` are each other's exact
    inverse for the simple data this lesson uses (a flat list of
    strings) — confirmed this session by a real round trip: a list,
    serialized, then immediately deserialized, compared equal to the
    original with `==`.
  - *Depends on:* `dumps` depends on a value JSON can actually
    represent (lists, strings, numbers, and a few others not used in
    this lesson); `loads` depends on its input actually being
    well-formed JSON text — confirmed this session, deliberately
    malformed text (`"not valid json {{{"`) raised a real
    `json.JSONDecodeError` when passed to `loads`, rather than
    returning some default or partial value silently.
  - *Connects to:* `dumps`'s own output is exactly what this lesson's
    `save_history` writes to a file; `loads`'s own input is exactly
    what this lesson's `load_history` reads from one.
  - *Shape:* `dumps` returns a `str`; `loads` returns whatever Python
    value the given JSON text actually represents — a `list`, in every
    case this lesson uses.

- **`pathlib.Path`, `.read_text()`, and `.write_text(text)`**
  - *What it is:* `Path`, from Python's own standard-library `pathlib`
    module, represents a filesystem location; `.read_text()` and `
    .write_text(...)` are its own methods for reading and writing a
    file's entire contents as plain text, in one call each.
  - *Implementation:* real signatures `Path.read_text() -> str` and
    `Path.write_text(data: str) -> int` (the integer returned is the
    number of characters written — not used directly by this lesson's
    own code, but confirmed this session to be the real, documented
    return value). Confirmed this session, `.write_text(...)` followed
    immediately by `.read_text()` on the same `Path` correctly returns
    exactly what was just written, with `.exists()`, also confirmed
    this session, correctly reporting `False` before the first write
    and `True` after.
  - *Its use:* this lesson's own `save_history` and `load_history`
    functions use these two methods as the actual mechanism for
    touching a real file on disk, rather than Python's older,
    lower-level `open(...)`/`.read()`/`.write()`/`.close()` pattern.
  - *Type:* `Path` is a class; `.read_text()` and `.write_text(...)`
    are ordinary instance methods on a constructed `Path` object.
  - *Responsibility:* `.read_text()` reads a file's entire contents as
    one string, or, confirmed directly this session, raises a real
    `FileNotFoundError` — not a special "missing file" value — if the
    file genuinely doesn't exist; `.write_text(...)` creates the file
    if it doesn't already exist, or replaces its entire contents if it
    does.
  - *Depends on:* `.read_text()` depends on the file already existing
    and being readable; `.write_text(...)` depends on the containing
    directory already existing and being writable.
  - *Connects to:* this lesson's own `load_history` and `save_history`
    functions, covered below, call these methods directly.
  - *Shape:* `.read_text()` returns a plain `str`; `.write_text(...)`
    takes one, and, per its own confirmed return value above, reports
    back how many characters it wrote.

- **`app.aboutToQuit` (a signal on `QApplication`, inherited from
  `QCoreApplication`)**
  - *What it is:* a signal that fires once, right before the
    application actually finishes quitting — after `app.quit()` (or
    the equivalent) has been requested, but before the process itself
    ends.
  - *Implementation:* confirmed this session, this exact attribute
    (`aboutToQuit`) genuinely exists on `QCoreApplication` — the same
    parent class Lesson 1's own confirmed `QApplication` inheritance
    chain already named as the class owning the event loop and,
    per Lesson 6, `.quit()` itself. This lesson connects to it directly
    for the first time in this curriculum; Lesson 6's own verification
    already confirmed it fires, but this lesson is the first to build
    real, permanent behavior around it.
  - *Its use:* this lesson connects it to a function that saves the
    model's current names to disk — the one, single, correct moment in
    this program's entire lifecycle to do that save: late enough that
    every greeting already happened, but early enough that the process
    hasn't actually ended yet.
  - *Type:* an attribute access returning a live `SignalInstance`
    object — the same mechanism every signal in this curriculum has
    been since Lesson 2.
  - *Responsibility:* fires exactly once per real quit — confirmed
    directly in Lesson 6's own verification run, and relied on again,
    unmodified, this lesson.
  - *Depends on:* the event loop actually running and actually being
    told to quit — the same real, confirmed requirement Lesson 6 first
    established for `app.quit()` itself, since `aboutToQuit` is part of
    that same shutdown sequence.
  - *Connects to:* this lesson's own save function, covered in this
    lesson's second Concept Unit.
  - *Shape:* not a value — a live announcement channel, the same shape
    every signal in this curriculum has had since Lesson 2.

**Everything else in the file, not this lesson's subject but already
covered.**

- **`list(...)`** — Python's own standard-library function,
  constructing a new list from any iterable — an existing list, in
  every case this lesson uses it. Applied to an existing list, it
  produces a genuinely new, independent list object with the same
  elements — confirmed this session, mutating the copy never affected
  the original.
- **`try` / `except`** — Python's own standard-library exception-
  handling syntax; this lesson's `load_history` catches two specific
  exception types, both already confirmed by this lesson's own labs to
  be exactly what's raised in the two real failure cases this function
  needs to handle: `FileNotFoundError` (from `.read_text()`, above,
  when the file doesn't exist) and `json.JSONDecodeError` (from
  `json.loads(...)`, above, when the file's contents aren't valid
  JSON).

---

## Concept Unit: A Model That Can Start With Data

### The Problem

`GreetedNamesModel`, exactly as Lesson 7 left it, can only ever start
empty — its constructor takes no arguments beyond the optional `parent`
every widget and model in this curriculum has accepted since Lesson 2.
For this lesson's history to actually survive between runs, the model
has to be constructible with a real, already-known list of names — the
ones loaded from a file — rather than always starting from nothing and
relying only on `add_name` to grow it one at a time, live, during a
single run.

> Before reading on: Lesson 7's own `rowCount()` already returns
> `len(self._names)`, computed fresh every time it's called, from
> whatever `self._names` actually contains at that moment — not a
> separately tracked count. Given that, if `__init__` were changed to
> set `self._names` to some non-empty list *before* anything else runs,
> what do you predict `rowCount()` would report immediately after
> construction, with no `add_name` call made at all? Would anything
> about `rowCount()` or `data()`'s own existing code need to change to
> make that work correctly?

### Introducing the Concept, in Isolation

```python
from PySide6.QtWidgets import QApplication
from PySide6.QtCore import QAbstractListModel, Qt, QModelIndex
import sys

app = QApplication(sys.argv)

class NamesModel(QAbstractListModel):
    def __init__(self, names=None, parent=None):
        super().__init__(parent)
        self._names = list(names) if names is not None else []

    def rowCount(self, parent=QModelIndex()):
        return len(self._names)

    def data(self, index, role):
        if role == Qt.DisplayRole:
            return self._names[index.row()]
        return None

    def add_name(self, name):
        row = len(self._names)
        self.beginInsertRows(QModelIndex(), row, row)
        self._names.append(name)
        self.endInsertRows()

    def names(self):
        return list(self._names)

model = NamesModel(["Alice", "Bob"])
print("initial rowCount:", model.rowCount())
print("names():", model.names())

external_copy = model.names()
external_copy.append("Injected")
print("after mutating external copy, model.rowCount():", model.rowCount())
print("model.names() still:", model.names())

model.add_name("Carol")
print("after add_name, names():", model.names())

empty_model = NamesModel()
print("empty_model.rowCount():", empty_model.rowCount())
```

Real output from running this, this session, headless:

```
initial rowCount: 2
names(): ['Alice', 'Bob']
after mutating external copy, model.rowCount(): 2
model.names() still: ['Alice', 'Bob']
after add_name, names(): ['Alice', 'Bob', 'Carol']
empty_model.rowCount(): 0
```

This confirms exactly what this unit's own Socratic prompt predicted:
`rowCount()`, completely unmodified from Lesson 7, correctly reports
`2` the instant a model is constructed with two initial names — no
changes needed anywhere else in the class, because `rowCount()` and
`data()` never assumed anything about *how* `self._names` came to hold
what it holds; they only ever read it fresh. It also proves the
**defensive copy** this lesson's Terms section named: appending
`"Injected"` to the list returned by `.names()` had zero effect on the
model's own real data — `model.rowCount()` stayed at `2`, and a second
call to `.names()` still reported only the original two — proving
`.names()` really does hand back an independent copy, not a second
reference to `self._names` itself. `add_name` still works exactly as
Lesson 7 already proved. And `NamesModel()`, constructed with no
argument at all, still correctly starts empty — the `if names is not
None else []` in the constructor is what preserves that original
Lesson 7 behavior for the case where no initial data is given.

This throwaway example is now **discarded** — the real project's
version, below, applies this exact change directly to
`greeted_names_model.py`.

### Project Change

- **Reference Source:** No reference counterpart — from-scratch
  addition, same as every unit so far.
- **Files affected:** `greeted_names_model.py` — modified.
- **Change type:** replace (`__init__`'s own signature and body) and
  add (the new `names()` method).
- **Location:** `__init__`, defined in Lesson 7, is modified in place;
  `names()` is appended after `add_name`, also from Lesson 7.
- **Dependencies:** none beyond what Lesson 7 already established.

### The New Code

```python
def __init__(self, names=None, parent=None):
    super().__init__(parent)
    self._names = list(names) if names is not None else []
```

```python
def names(self):
    return list(self._names)
```

### The Updated Project

`greeted_names_model.py`, complete, as this lesson leaves it:

```python
 1  from PySide6.QtCore import QAbstractListModel, Qt, QModelIndex
 2
 3
 4  class GreetedNamesModel(QAbstractListModel):
 5      def __init__(self, names=None, parent=None):        # <- new
 6          super().__init__(parent)
 7          self._names = list(names) if names is not None else []  # <- new
 8
 9      def rowCount(self, parent=QModelIndex()):
10          return len(self._names)
11
12      def data(self, index, role):
13          if role == Qt.DisplayRole:
14              return self._names[index.row()]
15          return None
16
17      def add_name(self, name):
18          row = len(self._names)
19          self.beginInsertRows(QModelIndex(), row, row)
20          self._names.append(name)
21          self.endInsertRows()
22
23      def names(self):                                     # <- new
24          return list(self._names)                          # <- new
```

As a whole, this class can now both start with real, previously-known
data and safely report that data back out to whatever code needs it for
saving — with `rowCount()`, `data()`, and `add_name()`, lines 9–21, all
completely untouched, exactly as this unit's own Socratic prompt
predicted they wouldn't need to change.

### Mechanical Walkthrough

- **`def __init__(self, names=None, parent=None):`** — a method
  definition, the same construct already explained repeatedly since
  Lesson 5; `names=None` is a new parameter with a default value, the
  same default-parameter syntax already established for `parent=None`
  since Lesson 2's own widget constructors.
- **`self._names = list(names) if names is not None else []`** — an
  assignment whose right-hand side is a conditional expression — an
  `if`/`else` written inline, on one line, producing one of two
  possible values rather than the multi-line `if` statement already
  used since Lesson 4. Read left to right: `list(names)` is the value
  used *if* `names is not None` is `True`; `[]`, an empty list literal,
  already used in Lesson 7, is the value used otherwise. `names is not
  None` is a comparison using `is not`, distinct from the `==`
  comparison already used since Lesson 4 — `is` (and `is not`) checks
  genuine object identity, the same check this curriculum has already
  used repeatedly since Lesson 2 to confirm two variables refer to the
  literal same object; here it's checking specifically whether `names`
  is the special singleton value `None`, the conventional, correct way
  to test for "no argument was given" in Python, rather than `names ==
  None`, which would work identically for this specific case but is
  not the idiomatic form.
- **`def names(self):`** — a method definition, the same construct
  already explained repeatedly.
- **`return list(self._names)`** — a `return` statement, standard
  Python syntax not otherwise singled out yet in this curriculum,
  ending the method and producing this exact value as its result;
  `list(self._names)` is explained in full in this lesson's Header,
  above.

### CS Lens

The **defensive copy** this unit builds — `names()` returning
`list(self._names)` rather than `self._names` itself — is a specific,
narrow application of a broader hard concept worth naming precisely:
**value versus reference semantics**. Handing back `self._names`
directly would hand back a *reference* to the model's own real,
internal object — any mutation the receiving code performs would be a
mutation of that same object, visible everywhere else it's used,
including inside the model itself. Handing back `list(self._names)`
instead produces a new object with equal *value* (the same elements, in
the same order) but no shared identity — confirmed directly by this
unit's own lab, mutating one never touches the other.

Also recognized in: passing a mutable object into a function in many
languages, where some pass a genuine copy by default and others pass a
reference, with real, different consequences for code that mutates
what it was given; a photocopy of a signed document, which can be
annotated freely without altering the original; a video game's own
"undo" or "checkpoint" system, which must snapshot a genuinely
independent copy of the game's state, not just a reference to state
that's about to keep changing.

### SE Lens

The alternative *not* chosen here is returning `self._names` directly,
with no copy at all — genuinely less code, and, for a model no other
code ever mutates externally, functionally identical in this project's
own current, actual usage. The real tradeoff: without the defensive
copy, any future code — a bug, or a legitimate but careless feature
added later — that happened to call `.names()` and then mutate the
returned list would silently corrupt the model's own real internal
state, completely bypassing `add_name` and its required
`beginInsertRows`/`endInsertRows` signaling from Lesson 7 — meaning any
attached view would never be told about that change at all, the exact
same silent failure Lesson 7's own second Concept Unit already proved
happens when that signaling is skipped. The defensive copy costs one
small, constant allocation per call, in exchange for `GreetedNamesModel`
staying provably safe to hand its data to any code, forever, regardless
of what that code later does with it — a guarantee worth having
precisely because a violation of it wouldn't announce itself with an
error; it would just quietly break the model's own consistency, exactly
the "silent" class of bug this curriculum has already surfaced once,
directly, in Lesson 7.

### Run It

Already run and shown above, under "Introducing the Concept, in
Isolation" — a real execution this session, under
`QT_QPA_PLATFORM=offscreen`.

### Connecting This Unit

`GreetedNamesModel` can now start with real data and safely report its
own current contents back out — but nothing yet actually reads or
writes a real file. This lesson's second unit is where a genuine file
on disk enters the picture.

---

## Concept Unit: Reading and Writing a Real File, Correctly

### The Problem

A `GreetedNamesModel` can now be constructed with a list of names, and
can report its current list back out — but "a list of names" and "the
contents of a file on disk" are two different things: a file holds raw
text (or bytes), not a live Python list object. Something has to define
exactly how a Python list becomes text that can be written to a file,
and, just as important, exactly what should happen when that file
doesn't exist yet (the very first time this program is ever run), or
exists but has somehow been damaged or altered by something outside
this program's control.

> Before reading on: think about the three realistic situations this
> program's own history file could actually be in, the very first
> moment it tries to read it at startup: the file genuinely doesn't
> exist yet (first run ever); the file exists and holds exactly what
> this program itself wrote there last time; or the file exists but its
> contents are garbled somehow — truncated, edited by hand, corrupted
> by a crash mid-write. For each of those three cases, what do you
> think the *right* behavior is for a program trying to load its own
> history at startup? Should any of them cause the whole program to
> refuse to start at all — or is there a reasonable, safe default
> behavior for every one of them?

### Introducing the Concept, in Isolation

```python
import json
from pathlib import Path
import tempfile

def load_history(path):
    try:
        return json.loads(path.read_text())
    except (FileNotFoundError, json.JSONDecodeError):
        return []

def save_history(path, names):
    path.write_text(json.dumps(names))

tmpdir = Path(tempfile.mkdtemp())
history_path = tmpdir / "history.json"

# Case 1: file doesn't exist yet
print("Case 1 - missing file:", load_history(history_path))

# Case 2: save some names, then load them back
save_history(history_path, ["Mona", "Nate"])
print("Case 2 - after save, file contents:", repr(history_path.read_text()))
print("Case 2 - load back:", load_history(history_path))

# Case 3: corrupt file
history_path.write_text("not valid json {{{")
print("Case 3 - corrupt file:", load_history(history_path))
```

Real output from running this, this session, headless:

```
Case 1 - missing file: []
Case 2 - after save, file contents: '["Mona", "Nate"]'
Case 2 - load back: ['Mona', 'Nate']
Case 3 - corrupt file: []
```

This proves `load_history` correctly handles all three of this unit's
own named cases. Case 1, a genuinely missing file, correctly returns an
empty list rather than crashing — `path.read_text()` really does raise
a `FileNotFoundError` for a nonexistent file, confirmed directly by a
separate, earlier lab this lesson's own Header already cites, and
`load_history`'s own `except` clause catches exactly that, returning
`[]` — the same safe default `GreetedNamesModel()`, this lesson's first
unit already confirmed, already produces on its own when given no
names at all. Case 2 proves the real round trip: `save_history`,
calling `json.dumps(...)` then `.write_text(...)`, produces a file
whose real contents are exactly the expected JSON text — and
`load_history`, reading that same file back, correctly reconstructs
the identical list. Case 3 proves the second failure mode is handled
identically: deliberately corrupted file contents cause `json.loads(
...)` to raise a real `json.JSONDecodeError` — confirmed directly by
this lesson's own earlier lab — caught by the same `except` clause,
falling back to the same safe, empty default rather than crashing the
whole program on startup.

This throwaway example is now **discarded** — the real project's
version, below, places these exact two functions directly inside
`main.py`, connected to the real model and the real `aboutToQuit`
signal.

### Project Change

- **Reference Source:** No reference counterpart — from-scratch
  addition.
- **Files affected:** `main.py` — modified.
- **Change type:** add (the two new functions, and the `HISTORY_PATH`
  constant) and replace (`history_model`'s own construction, now
  loading from disk, and one new `.connect()` call for saving).
- **Location:** `load_history` and `save_history` are added near the
  top of the file, after the imports; `HISTORY_PATH` is defined
  alongside them; `history_model = GreetedNamesModel()`, from Lesson 7,
  is replaced; the new `app.aboutToQuit.connect(...)` line is added
  directly after Lesson 7's own `greeter.greeted.connect(...)` line.
- **Dependencies:** `json` and `pathlib.Path`, both newly imported.

### The New Code

```python
import json
from pathlib import Path

HISTORY_PATH = Path(__file__).parent / "history.json"

def load_history(path):
    try:
        return json.loads(path.read_text())
    except (FileNotFoundError, json.JSONDecodeError):
        return []

def save_history(path, names):
    path.write_text(json.dumps(names))
```

```python
history_model = GreetedNamesModel(load_history(HISTORY_PATH))
```

```python
app.aboutToQuit.connect(lambda: save_history(HISTORY_PATH, history_model.names()))
```

### The Updated Project

`main.py`, complete, as it stands at the end of this lesson:

```python
 1  from PySide6.QtWidgets import QApplication, QMainWindow, QWidget, QVBoxLayout, QListView
 2  from PySide6.QtGui import QAction
 3  from name_greeter import NameGreeter
 4  from greeted_names_model import GreetedNamesModel
 5  from pathlib import Path                                  # <- new
 6  import json                                                # <- new
 7  import sys
 8
 9  HISTORY_PATH = Path(__file__).parent / "history.json"      # <- new
10
11  def load_history(path):                                    # <- new
12      try:                                                    # <- new
13          return json.loads(path.read_text())                 # <- new
14      except (FileNotFoundError, json.JSONDecodeError):        # <- new
15          return []                                            # <- new
16
17  def save_history(path, names):                              # <- new
18      path.write_text(json.dumps(names))                       # <- new
19
20  app = QApplication(sys.argv)
21  window = QMainWindow()
22  window.setWindowTitle("Lesson 1 Lab")
23
24  greeter = NameGreeter()
25  history_model = GreetedNamesModel(load_history(HISTORY_PATH))  # <- new
26  history_view = QListView()
27  history_view.setModel(history_model)
28
29  container = QWidget()
30  container_layout = QVBoxLayout()
31  container_layout.addWidget(greeter)
32  container_layout.addWidget(history_view)
33  container.setLayout(container_layout)
34  window.setCentralWidget(container)
35
36  file_menu = window.menuBar().addMenu("&File")
37  quit_action = QAction("&Quit", window)
38  quit_action.triggered.connect(app.quit)
39  file_menu.addAction(quit_action)
40
41  greeter.greeted.connect(history_model.add_name)
42  app.aboutToQuit.connect(lambda: save_history(HISTORY_PATH, history_model.names()))  # <- new
43
44  window.statusBar().showMessage("Ready")
45  window.show()
46  sys.exit(app.exec())
```

As a whole, the program now has a complete, real, working memory
across separate runs: at startup, line 25 loads whatever history
already exists on disk (or safely defaults to none, for a genuinely
first run); every greeting during the run still updates the model live,
exactly as Lesson 7 already built; and, the moment the user actually
quits — through the Quit menu action, from Lesson 6 — line 42's
connection writes the model's current, complete list back to that same
file, ready to be loaded again the next time the program starts.

### Mechanical Walkthrough

- **`from pathlib import Path`**, **`import json`** — import
  statements, the same basic construct already explained in Lesson 1,
  here bringing in two standard-library tools not otherwise used in
  this curriculum until this lesson.
- **`HISTORY_PATH = Path(__file__).parent / "history.json"`** — an
  assignment; `Path(__file__)` constructs a `Path` object pointing at
  this exact source file, using Python's own built-in `__file__`
  variable (automatically set by the interpreter to the currently
  running file's own path — not otherwise used yet in this curriculum);
  `.parent`, a property on `Path`, resolves to the directory containing
  that file; the `/` operator here is not division — `Path` overloads
  it specifically to mean "join a path segment," so `Path(...).parent /
  "history.json"` produces a new `Path` pointing at a file named
  `history.json` sitting in the same directory as `main.py` itself.
- **`def load_history(path):`**, **`def save_history(path, names):`**
  — function definitions, the same construct already explained
  repeatedly, here defined as plain, standalone functions rather than
  methods on any class — a deliberate choice, since neither function
  needs to know anything about `NameGreeter` or `GreetedNamesModel`
  specifically; each only needs a `Path` (and, for saving, a plain
  list), the same minimal-dependency design already established for
  `GreetedNamesModel` itself never needing to know where its own data
  came from or where it's going.
- **`try:` / `except (FileNotFoundError, json.JSONDecodeError):`** —
  explained in full in this lesson's Header, above, under "Everything
  else in the file"; the two exception types listed together, separated
  by a comma inside one set of parentheses, means this single `except`
  clause catches either one — the correct, minimal set for exactly the
  two real failure modes this unit's own lab already confirmed, no
  broader and no narrower.
- **`path.read_text()`**, **`json.loads(...)`**, **`json.dumps(...)`**,
  **`path.write_text(...)`** — all explained in full in this lesson's
  Header, above, under Objects and methods used.
- **`history_model = GreetedNamesModel(load_history(HISTORY_PATH))`**
  — an assignment whose right-hand side is a constructor call, the same
  construct Lesson 5 already gave full treatment to, with
  `load_history(HISTORY_PATH)`'s own return value — a plain list —
  passed directly as this lesson's first unit's new `names` parameter.
- **`app.aboutToQuit.connect(lambda: save_history(HISTORY_PATH,
  history_model.names()))`** — the exact `.connect()` construct already
  fully explained in Lesson 2, called on the signal explained in full
  in this lesson's Header, above; its argument is a `lambda` — an
  anonymous, inline function, briefly seen but not fully explained in
  an earlier lesson's own throwaway lab — used here, deliberately,
  instead of a separately named function, specifically because
  `save_history` itself needs two arguments (`HISTORY_PATH` and
  `history_model.names()`) while a signal-connected slot is called with
  whatever `aboutToQuit` itself provides (nothing, in this case) — the
  `lambda` exists purely to supply those two fixed values at connection
  time, calling the real function with exactly the arguments it needs,
  regardless of what `aboutToQuit` itself would have passed on its own.

### CS Lens

**Serialization**, already named and defined in this lesson's Terms
section, above, is a hard concept worth restating here in full: the
process of converting an in-memory value into a storable or
transmittable form, and back, with a defined, reliable, reversible
mapping between the two — confirmed, for this lesson's own specific
data, by the direct round-trip proof in this unit's own lab.

Also recognized in: a video game saving player progress to a save file,
using some defined format to turn live game state into bytes and back;
a web browser saving its own tab session to disk so it can be restored
after a restart; a network protocol like HTTP itself, which serializes
a request or response into a stream of bytes to send across a
connection and deserializes it back into a structured message on the
other end; a photograph, in a sense — light hitting a sensor,
serialized into a file format like JPEG, later deserialized back into
an image a screen can display.

### SE Lens

The alternative *not* chosen here is catching a bare, unqualified
`except:` (or the only slightly narrower `except Exception:`) around
the entire `load_history` body, silently defaulting to `[]` for
literally *any* failure, not just the two specific, anticipated ones
this lesson's own function actually names. The real tradeoff: a broad,
catch-everything `except` is genuinely less code to write and would
never crash, regardless of what actually goes wrong — but it would also
silently swallow real, unrelated bugs completely unrelated to "the
history file is missing or corrupted" — a typo in this function's own
code, a permissions error masking a real, fixable configuration
problem, or any other genuine defect — all disguised, identically, as
"no history yet," with the program quietly starting empty and giving
the person running it no indication anything unusual happened at all.
Catching exactly `FileNotFoundError` and `json.JSONDecodeError` — the
two failure modes this unit's own lab specifically proved are the real,
expected ones — means any other, genuinely unexpected error still
surfaces normally, as a real Python traceback, rather than being
silently absorbed into "well, it's empty now" alongside every case this
function actually intended to handle gracefully.

### Run It

Already run and shown above, under "Introducing the Concept, in
Isolation" — a real execution this session, under
`QT_QPA_PLATFORM=offscreen` — plus two further, separate, real
executions of this lesson's actual, complete project files: one
simulating a genuine first run, with no history file present at all,
confirming an initial `rowCount()` of `0`, two real simulated
submissions bringing it to `2`, and, after triggering a real quit
inside a genuinely running event loop — exactly the requirement Lesson
6 already established — a real file on disk afterward containing
exactly `["Oscar", "Priya"]`; and a second, separate execution,
started fresh, confirming that same file is correctly loaded back at
startup (`rowCount()` reporting `2` immediately, with both original
names present, in order, before any new submission at all), a third
name added during that second run, and the file afterward correctly
containing all three: `["Oscar", "Priya", "Quinn"]`.

### Connecting This Unit

The program built by this curriculum since Lesson 1 now has a real,
working memory that survives being closed and reopened — the load/save
functions this unit built, connected to the model this lesson's first
unit prepared to accept them, and to the `aboutToQuit` signal Lesson 6
first confirmed but never used until now.

---

## Connect the Pieces

Trace two separate runs of the program — the second one genuinely
starting after the first one closed — through everything this lesson
built, start to finish:

**Run 1.** The program starts. No `history.json` exists yet anywhere on
disk. Line 25 calls `load_history(HISTORY_PATH)`; inside it,
`path.read_text()` raises a real `FileNotFoundError` — confirmed
directly by this lesson's own lab — caught by the matching `except`
clause, returning `[]`. `GreetedNamesModel([])`, per this lesson's
first unit, starts with `rowCount()` correctly reporting `0` — this
lesson's own verification confirmed this exact value at real startup.
The user greets "Oscar," then "Priya," through `NameGreeter` and
`add_name`, exactly as Lesson 7 already fully explained; `rowCount()`
correctly reaches `2`. The user selects Quit from the File menu.
`quit_action`'s `triggered` signal fires, exactly as Lesson 6 already
proved, running `app.quit`. Because the event loop is genuinely
running — the same real, confirmed requirement Lesson 6 first
established — `aboutToQuit` fires next, as part of that same shutdown
sequence; line 42's connection runs, calling `save_history(HISTORY_PATH,
history_model.names())`. `.names()`, this lesson's first unit's own new
method, returns a safe, independent copy of `["Oscar", "Priya"]`;
`save_history` calls `json.dumps(...)` then `.write_text(...)`,
writing exactly `["Oscar", "Priya"]`, as real JSON text, to a real file
on disk — confirmed, character for character, by this lesson's own
verification.

**Run 2.** The program starts again, as an entirely separate process,
with `history.json` now genuinely present from Run 1. Line 25 calls
`load_history(HISTORY_PATH)` again; this time, `.read_text()` succeeds,
returning the real, saved text; `json.loads(...)` correctly
reconstructs `["Oscar", "Priya"]` as a real Python list —
`GreetedNamesModel(["Oscar", "Priya"])` starts with `rowCount()`
already `2`, both names visible in `history_view` immediately, with no
greeting having happened yet in this run at all — confirmed directly by
this lesson's own verification. The user greets "Quinn." `rowCount()`
reaches `3`. The user quits again; the same `aboutToQuit` sequence
runs, and the file on disk now correctly holds all three names:
`["Oscar", "Priya", "Quinn"]` — proving the history this curriculum's
own program has been building since Lesson 5 genuinely, permanently
survives being closed, not just held in memory for the length of a
single run.

**Next lesson:** Lesson 9 — threading. Every piece of work this
curriculum's program has ever done — reading and writing this lesson's
own history file included — has happened directly inside the event
loop's own thread, fast enough to never be noticed; the next lesson
covers what happens when a real operation is slow enough to actually
freeze the window while it runs, and the specific tools PySide6
provides for moving that work off the event loop's own thread without
breaking the signal/slot mechanism this entire curriculum has been
built on.
