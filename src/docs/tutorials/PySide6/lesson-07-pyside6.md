# Lesson 7: Separating What the Data Is From How It's Shown

**What you will build.** A running history of every name successfully
greeted, shown as a real, scrolling list beneath the `NameGreeter`
built in Lesson 5 — replacing Lesson 6's status bar, which could only
ever show the single most recent greeting before overwriting it. The
transferable problem this lesson is actually about: every widget this
curriculum has built holds its own data directly — `QLabel` holds its
own text, `QLineEdit` holds its own typed string. That works cleanly
for one value at a time, but breaks down the moment a program needs to
manage a genuinely large or changing *collection* of something — a
list of a hundred names, a table of orders, a tree of files — where the
data's own real shape, and the specific widget used to display it, are
two decisions that need to be able to change independently. This lesson
introduces Qt's own deliberate answer to that: pulling the data itself
out into its own object, completely separate from anything that
displays it, and defining a small, fixed contract between the two. This
is the single idea, more than any other in this curriculum so far, that
turns "I can assemble widgets Qt already provides" into "I can
represent and display *any* data my own program needs to."

**What you need to know first.** Lesson 1's `QApplication`, `QWidget`,
and the event loop. Lesson 2's signals and slots. Lesson 3's layouts.
Lesson 5's class subclassing, `super().__init__()`, and custom
`Signal`s — this lesson subclasses a different base class using the
identical pattern. Lesson 5's `NameGreeter`, reused here unmodified.

**Terms used in this lesson**

- **Model/view architecture** — a design where an object representing
  raw data (the **model**) is kept completely separate from any object
  that displays it (the **view**), with a small, fixed set of methods
  connecting the two. Exists because a widget that owns its data
  directly, the pattern every earlier lesson has used, only scales to
  one value at a time — the moment real data needs to be sorted,
  filtered, displayed in more than one place at once, or simply grow
  past a size where copying it into a widget's own internal state makes
  sense, separating "what the data is" from "how it's currently being
  shown" stops being optional.
- **Index** — a lightweight, temporary reference to one specific piece
  of data inside a model — a row (and, for grid-shaped data not covered
  in this lesson, a column) — used to *ask* the model for a value,
  never a container for the value itself.
- **Role** — a label attached to a request for data, specifying *which
  aspect* of that data is being asked for — the text to display, a
  tooltip, an icon, and others not covered in this lesson. Exists
  because a single piece of data — one row of a model — often has more
  than one representation a view might need simultaneously: the same
  row's `DisplayRole` might be plain text while its `ToolTipRole` is a
  longer, different string, both describing the exact same underlying
  value.

**Objects and methods used**

- **`class GreetedNamesModel(QAbstractListModel):`**
  - *What it is:* not a class PySide6 provides ready to use — like
    Lesson 5's `NameGreeter`, this is a new class, written for this
    project, inheriting from `QAbstractListModel`, one of Qt's own
    base classes specifically meant to be subclassed rather than used
    directly.
  - *Implementation:* a Python class statement, the identical
    `class Name(BaseClass):` construct Lesson 5 already gave full
    treatment to, applied here to a different base class.
    `QAbstractListModel`'s own real inheritance chain, confirmed this
    session — `QAbstractListModel → QAbstractItemModel → QObject →
    Object → object` — is worth reading closely for what it does
    **not** contain: no `QWidget`, and no `QPaintDevice` either. A
    model has no pixels of its own, cannot be shown, and cannot be
    added to a layout — it is pure data and pure notification
    machinery, the same non-visual role Lesson 3 already established
    for `QLayout`.
  - *Its use:* this lesson needs a real place to hold a growing list of
    greeted names — not inside any one widget's own internal state, but
    as its own independent object, so that list can be displayed,
    unmodified, by whatever view widget is asked to show it.
  - *Type:* a class, the same kind of thing `NameGreeter` itself is —
    one this project's own code defines by inheriting from a Qt-
    provided base class.
  - *Responsibility:* holds the real, canonical list of greeted names
    and answers exactly two kinds of question about it, both covered
    below: "how many rows do you have?" and "what's at this specific
    row?" — nothing about displaying that data on screen is this
    class's concern at all.
  - *Depends on:* `QAbstractListModel`, the class it inherits from —
    which itself provides the real notification machinery (the
    `rowsInserted` signal, used in this lesson's own verification, and
    others not covered here) that lets any connected view stay
    correctly in sync.
  - *Connects to:* a `QListView`, covered below, via `.setModel(...)`;
    `NameGreeter`'s own `greeted` signal, from Lesson 5, connected
    directly to this class's own `add_name` method, covered below.
  - *Shape:* one object holding a real Python list internally (`self
    ._names`, in this lesson's own code) — but that internal list is
    never accessed directly by anything outside this class; every
    outside access goes through `rowCount()` and `data()`, both
    covered below.

- **`rowCount(self, parent=QModelIndex())`**
  - *What it is:* one of exactly two methods a working
    `QAbstractListModel` subclass is required to implement — the one
    that reports how many rows of data currently exist.
  - *Implementation:* a method this project's own code must define,
    overriding a real method Qt itself declares on `QAbstractItemModel`
    — real expected signature `rowCount(self, parent: QModelIndex =
    QModelIndex()) -> int`. Confirmed this session, a real `QListView`
    with this model attached correctly reflects whatever integer this
    method returns.
  - *Its use:* this lesson's implementation returns
    `len(self._names)` — the real, current length of the internal list
    — every single time it's called, rather than tracking a separately
    maintained count that could fall out of sync with the list itself.
  - *Type:* an instance method — this project's own code, not
    something PySide6 provides a working default for; a subclass that
    fails to override it correctly would report `0` rows always, since
    `QAbstractItemModel`'s own base implementation has no real data to
    count.
  - *Responsibility:* answers, correctly and immediately, exactly one
    question — "how many rows?" — every time it's asked; nothing about
    display, ordering, or filtering is this method's concern.
  - *Depends on:* `self._names`, this instance's own internal list.
  - *Connects to:* called internally by any attached view (a
    `QListView`, in this lesson) every time it needs to know how many
    rows to be prepared to display; also called directly by this
    lesson's own verification code.
  - *Shape:* returns a plain Python `int` — confirmed this session,
    correctly reporting `0` for a freshly constructed, empty model, and
    the exact current count after real names were added.

- **`data(self, index, role)`**
  - *What it is:* the second of the two required methods — the one
    that actually returns a specific piece of data, for a specific row,
    for a specific role.
  - *Implementation:* a method this project's own code must define,
    real expected signature `data(self, index: QModelIndex, role: int)
    -> Any`. Confirmed this session, called directly with
    `Qt.DisplayRole`, it correctly returned the exact name stored at
    the requested row; called with a role this lesson's implementation
    doesn't specifically handle (`Qt.EditRole`, in this lesson's own
    lab), it correctly fell through to returning `None` — the expected,
    correct behavior for "I have nothing to say about this
    combination," not an error.
  - *Its use:* this lesson's implementation checks the given `role`
    against `Qt.DisplayRole` — the plain, on-screen text every widget
    used since Lesson 3 has ultimately displayed — and, when it
    matches, returns `self._names[index.row()]`; for any other role, it
    returns `None`.
  - *Type:* an instance method, this project's own code, the same
    override relationship already explained for `rowCount`, above.
  - *Responsibility:* translates one specific `(index, role)` request
    into one specific real value, reading from `self._names` — and
    correctly returning `None` for anything it isn't prepared to
    answer, rather than raising an error, since a view routinely asks
    for many different roles it may have no real use for on a given
    model.
  - *Depends on:* `index`, an already-constructed `QModelIndex`,
    covered below, and `role`, a value from `Qt.ItemDataRole`, covered
    below; and, to actually answer, `self._names`.
  - *Connects to:* called internally by any attached view, once per
    role it needs, for every row currently visible — confirmed this
    session, a `QListView` attached to a real model with three names
    correctly displayed all three, in order, when queried this same
    way directly.
  - *Shape:* returns a single value whose real type depends entirely on
    which role was asked for — a plain `str` for `Qt.DisplayRole` in
    this lesson's own implementation — or `None`, confirmed this
    session, for any role this implementation doesn't specifically
    recognize.

- **`QModelIndex`**
  - *What it is:* the object representing one specific location inside
    a model — a row, and, for grid-shaped models not covered in this
    lesson, a column — used to ask a model for data without the index
    itself ever holding that data.
  - *Implementation:* a class in `PySide6.QtCore`. Confirmed this
    session, calling `model.index(0, 0)` — a method every
    `QAbstractItemModel` subclass, including this lesson's, inherits
    and doesn't need to override — returns a real `QModelIndex` object,
    whose own `.row()` and `.column()` methods correctly report back
    `0` and `0`.
  - *Its use:* this lesson's own `data()` method receives one every
    time it's called, and reads `index.row()` from it to know which
    element of `self._names` to return.
  - *Type:* a class, but a deliberately lightweight one — confirmed by
    its own defined purpose: a temporary locator, not a container for
    real data, created fresh whenever something needs to refer to a
    specific row, and not meant to be held onto for long after.
  - *Responsibility:* identifies one specific position inside a model
    — nothing more; asking a `QModelIndex` itself for its underlying
    value is not how this works — the model's own `data()` method,
    covered above, is the only real way to translate an index into an
    actual value.
  - *Depends on:* the model it was created from — `model.index(0, 0)`
    only makes sense in the context of the specific model that produced
    it.
  - *Connects to:* passed directly into `data()` calls, as this
    lesson's own labs, and its own project code, both do repeatedly.
  - *Shape:* a small object holding, at minimum, a row and a column —
    confirmed this session, `.row()` and `.column()` correctly report
    exactly the values it was constructed with.

- **`Qt.DisplayRole` (and `Qt.ItemDataRole`, more broadly)**
  - *What it is:* one specific, named value from `Qt.ItemDataRole` — an
    enumeration Qt itself defines, listing every standard kind of
    request a view might make of a model's `data()` method.
  - *Implementation:* an attribute on `Qt`, imported from
    `PySide6.QtCore`. Confirmed this session, `Qt.DisplayRole` and
    `Qt.ToolTipRole` are genuinely distinct values (`0` and `3`,
    confirmed directly this session by converting each to a plain
    `int`) — not just two different names referring to the same
    underlying thing.
  - *Its use:* this lesson's `data()` method checks its `role`
    parameter against `Qt.DisplayRole` specifically, because that's the
    one role every standard view widget, including `QListView`, always
    asks for by default, to get the plain text it should render.
  - *Type:* not a class, and not a method — a named constant, one
    member of a larger, predefined enumeration Qt provides.
  - *Responsibility:* on its own, none — it's a label, used only to
    distinguish one kind of data request from another inside a model's
    own `data()` method; the real responsibility for answering
    correctly, for whichever role is being asked about, belongs to
    `data()` itself.
  - *Depends on:* nothing; it's a fixed, predefined value.
  - *Connects to:* every call to `data(index, role)`, throughout this
    lesson, passes some value from this same enumeration as its second
    argument.
  - *Shape:* a single, fixed integer value under the hood, confirmed
    this session, though almost never compared to directly as a raw
    number in real code — comparisons use the named constant
    (`Qt.DisplayRole`) instead, for the same readability reason any
    named constant is preferred over a bare "magic number."

- **`beginInsertRows(parent, first, last)` and `endInsertRows()`**
  - *What they are:* a required pair of calls that must surround any
    code adding new rows to a model, announcing the change to every
    connected view before and after it actually happens.
  - *Implementation:* two instance methods, inherited from
    `QAbstractItemModel`, real signatures
    `beginInsertRows(parent: QModelIndex, first: int, last: int) ->
    None` and `endInsertRows() -> None`.
  - *Its use:* this lesson's own `add_name` method calls
    `beginInsertRows(QModelIndex(), row, row)` — an empty, "no parent"
    `QModelIndex()`, since this is a flat list with no grid structure —
    immediately before appending the new name to `self._names`, and
    calls `endInsertRows()` immediately after.
  - *Type:* ordinary instance methods, called on the model itself
    (`self.beginInsertRows(...)`, `self.endInsertRows()`) — not
    `static`.
  - *Responsibility:* this is the mechanism, and this lesson's own
    verified proof, of the entire reason model/view architecture
    actually works reliably: confirmed this session with a direct,
    stark contrast — a model that mutated its own internal list with
    no signaling at all left its `rowsInserted` signal never firing,
    confirmed by an empty list of recorded calls; the identical
    mutation, wrapped correctly in `beginInsertRows`/`endInsertRows`,
    correctly fired `rowsInserted` with the exact row range affected —
    `(0, 0)`, then `(1, 1)`, then `(2, 2)`, one call per addition,
    confirmed directly this session. A connected view relies on that
    signal, not on noticing the model's own internal data changed by
    some other means — `QAbstractItemModel` has no way to "notice" a
    plain Python list was appended to; it only knows what it's
    explicitly told.
  - *Depends on:* being called correctly paired — `beginInsertRows`
    before the actual mutation, `endInsertRows` after — with the row
    range given to `beginInsertRows` matching the rows that are about
    to actually exist once the mutation completes.
  - *Connects to:* every view attached to this model via `.setModel(
    ...)` — confirmed this session, a real `QListView`, after three
    correctly signaled additions, reported the expected content when
    queried, in order, through the same model.
  - *Shape:* both return `None`; their entire purpose is the side
    effect of firing `QAbstractItemModel`'s own real, built-in
    `rowsInserted` signal (confirmed this session to be exactly that —
    a real `SignalInstance`, the same kind of object every signal in
    this curriculum has been since Lesson 2) at the correct moment,
    with the correct row range.

- **`QListView`**
  - *What it is:* a widget whose entire purpose is displaying a
    model's data as a simple, scrolling, vertical list.
  - *Implementation:* a class in `PySide6.QtWidgets`, constructed here
    as `QListView()`, with no required arguments. Its real inheritance
    chain, confirmed this session — `QListView → QAbstractItemView →
    QAbstractScrollArea → QFrame → QWidget → QObject → QPaintDevice →
    Object → object` — introduces two new intermediate parent classes
    not yet seen in this curriculum: `QAbstractItemView` (shared base
    behavior for every model-driven view — this lesson's `QListView`,
    and, not used in this lesson, table- and tree-shaped views) and
    `QAbstractScrollArea` (adds scrolling support, which is what lets
    this lesson's list correctly display more names than fit in the
    window at once) — both flagged here, not explained further, per
    this curriculum's own established convention for naming an
    intermediate parent without expanding it fully in a lesson that
    isn't specifically about it.
  - *Its use:* this lesson needs a real, visible widget to display the
    `GreetedNamesModel`'s own growing list of names, and `QListView` is
    the specific, plainest view class whose entire purpose is exactly
    that — the visible half of the model/view split this whole lesson
    is about.
  - *Type:* a class, instantiated once in this lesson's code — a real
    `QWidget`, confirmed by its own inheritance chain, with everything
    every earlier lesson already established about `QWidget` fully
    intact.
  - *Responsibility:* displays whatever model it's given, row by row,
    and automatically keeps that display correct whenever the model
    correctly announces a change via `beginInsertRows`/`endInsertRows`
    or any of `QAbstractItemModel`'s other real signals — it has no
    idea, itself, what a "name" is, or where the data actually comes
    from; it only knows how to ask a model the two questions
    `rowCount()` and `data()` answer, and how to react to that model's
    own change signals.
  - *Depends on:* a model, given via `.setModel(...)`, covered below —
    confirmed this session, a `QListView` constructed with no model set
    at all simply displays nothing, with no error.
  - *Connects to:* `.setModel(...)`, covered below; internally, it's
    what actually calls `rowCount()` and `data()` on whatever model
    it's given, and what actually listens for that model's own
    `rowsInserted` signal.
  - *Shape:* one widget, displaying one model at a time — confirmed
    this session, `view.model()` correctly reported back the exact
    model object given to `.setModel(...)`.

- **`QListView.setModel(model)`**
  - *What it is:* the method that connects a view to a specific model,
    the one call that actually links "the data" to "the thing
    displaying it."
  - *Implementation:* an instance method, real signature `setModel(
    model: QAbstractItemModel) -> None`, inherited from
    `QAbstractItemView`.
  - *Its use:* this lesson calls it once, connecting the
    `GreetedNamesModel` instance to the `QListView` meant to display
    it.
  - *Type:* an ordinary instance method, called on the view (`view
    .setModel(...)`) — not `static`.
  - *Responsibility:* records which model this view should query and
    listen to — confirmed this session, `view.model() is model` reports
    `True` immediately after this call. It does not copy the model's
    data into the view — the view continues asking the same model
    object every time it needs to display something, rather than
    holding its own separate copy that could fall out of sync.
  - *Depends on:* a real `QAbstractItemModel` (or a subclass of it,
    like this lesson's own `GreetedNamesModel`) to connect to.
  - *Connects to:* from this point forward, this view calls this
    model's `rowCount()` and `data()` whenever it needs to render, and
    listens for this model's own change signals to know when to
    re-render.
  - *Shape:* returns `None`.

**Everything else in the file, not this lesson's subject but still
explained.**

- **`len(...)`** — Python's own standard-library function, returning
  the number of items in a list (or any other sized collection). Used
  inside this lesson's own `rowCount()` and `add_name()` to read and
  compute against `self._names`'s real, current length.
- **`.append(...)`** — a standard-library list method that adds one
  item to the end of a list, growing it by one element. Used inside
  this lesson's own `add_name()` method to actually add the new name to
  `self._names`, sitting directly between the required
  `beginInsertRows` and `endInsertRows` calls.

---

## Concept Unit: A Model That Answers Two Questions

### The Problem

Lesson 6's status bar can only ever show one message at a time — every
new greeting completely overwrites whatever was shown before it, with
no way to see who was greeted five submissions ago. Simply switching
from a status bar to a `QLabel` that keeps appending text wouldn't
really solve the underlying problem either — it would just be storing a
growing list of names as one long, single string, glued together,
inside a widget whose whole design, since Lesson 3, has been "hold one
string." A real, growing list of independent items — sortable,
individually addressable, potentially very large — needs something
that isn't fundamentally "one string a widget happens to hold." What
would a class purpose-built to represent *a list of things*, completely
separate from whatever eventually displays it, actually need to be able
to do?

> Before reading on: think about the two most basic questions anyone
> would need answered about *any* list, in any programming language you
> already know — a Python list, an array, anything ordered and
> countable. What's the smallest set of questions you could ask that
> would let you reconstruct the entire list's contents, one at a time,
> without ever being handed the whole thing directly? (Hint: think about
> how a `for` loop over a list actually works, one step at a time, not
> about what the list "is" as a whole object.)

### Introducing the Concept, in Isolation

```python
from PySide6.QtWidgets import QApplication, QListView
from PySide6.QtCore import QAbstractListModel, Qt, QModelIndex
import sys

app = QApplication(sys.argv)

class NamesModel(QAbstractListModel):
    def __init__(self, names, parent=None):
        super().__init__(parent)
        self._names = names

    def rowCount(self, parent=QModelIndex()):
        return len(self._names)

    def data(self, index, role):
        if role == Qt.DisplayRole:
            return self._names[index.row()]
        return None

model = NamesModel(["Alice", "Bob", "Carol"])
print("model.rowCount():", model.rowCount())

idx0 = model.index(0, 0)
print("type(idx0):", type(idx0))
print("idx0.row():", idx0.row(), "idx0.column():", idx0.column())
print("model.data(idx0, Qt.DisplayRole):", model.data(idx0, Qt.DisplayRole))

idx2 = model.index(2, 0)
print("model.data(idx2, Qt.DisplayRole):", model.data(idx2, Qt.DisplayRole))

view = QListView()
view.setModel(model)
view.show()
print("view.model() is model:", view.model() is model)
```

Real output from running this, this session, headless:

```
model.rowCount(): 3
type(idx0): <class 'PySide6.QtCore.QModelIndex'>
idx0.row(): 0 idx0.column(): 0
model.data(idx0, Qt.DisplayRole): Alice
model.data(idx2, Qt.DisplayRole): Carol
view.model() is model: True
```

This proves the whole minimal contract works: a class defining only
`rowCount()` and `data()` — nothing about drawing, positioning, or
scrolling — is already enough for `QListView`, a widget this class
never even imports or knows about at definition time, to correctly
display it. `model.index(2, 0)`, requesting row `2`, produced a real
`QModelIndex` whose `.row()` correctly reports `2`; passing that index,
along with `Qt.DisplayRole`, into `data()` correctly returned
`"Carol"` — the third name in the original list, confirming `rowCount()`
and `data()` really are the two, and only two, questions this whole
mechanism depends on being answered correctly.

This throwaway example is now **discarded** — the real project's
version, below, starts with an empty list rather than three hardcoded
names, and adds names over time rather than being given a fixed list at
construction, a difference this lesson's second Concept Unit covers.

### Project Change

- **Reference Source:** No reference counterpart — from-scratch
  addition, same as every unit so far.
- **Files affected:** `greeted_names_model.py` — created.
- **Change type:** add (new file).
- **Location:** n/a — this is the file's first content.
- **Dependencies:** none beyond `PySide6` itself.

### The New Code

```python
from PySide6.QtCore import QAbstractListModel, Qt, QModelIndex


class GreetedNamesModel(QAbstractListModel):
    def __init__(self, parent=None):
        super().__init__(parent)
        self._names = []

    def rowCount(self, parent=QModelIndex()):
        return len(self._names)

    def data(self, index, role):
        if role == Qt.DisplayRole:
            return self._names[index.row()]
        return None
```

### The Updated Project

This is a brand-new file with nothing surrounding it yet — Project
Change, above, already covers this case, so there is no enclosing
structure to return to. `greeted_names_model.py` currently contains
exactly this class, with no way yet to add a name to it.

### Mechanical Walkthrough

- **`class GreetedNamesModel(QAbstractListModel):`** — a class
  definition, the identical construct Lesson 5 already gave full
  treatment to, applied here to a new base class. Explained in full in
  this lesson's Header, above, under Objects and methods used.
- **`def __init__(self, parent=None): super().__init__(parent):`** —
  the exact same constructor-and-`super()` pattern Lesson 5 already
  gave full treatment to, applied here to `QAbstractListModel` instead
  of `QWidget`; the requirement to call `super().__init__(...)` before
  anything else is the same one Lesson 5's own lab proved, with the
  same real `RuntimeError` consequence for skipping it, since
  `QAbstractListModel`, confirmed this lesson's own inheritance check,
  is, underneath, a real `QObject`, the same base class every signal-
  bearing class in this curriculum has ultimately shared since Lesson
  1's own confirmed `QWidget` chain.
- **`self._names = []`** — an assignment, the same basic construct
  already explained repeatedly, storing an empty list literal (`[]`,
  Python's own syntax for a list with no elements) onto this instance.
- **`def rowCount(self, parent=QModelIndex()): return len(self._names)`**
  — a method definition. Explained in full in this lesson's Header,
  above, under Objects and methods used; `len(self._names)` is
  explained in full in this lesson's Header, above, under "Everything
  else in the file."
- **`def data(self, index, role): if role == Qt.DisplayRole: return
  self._names[index.row()] return None`** — a method definition.
  Explained in full in this lesson's Header, above, under Objects and
  methods used; `index.row()` is a method call on a `QModelIndex`,
  also explained in full in this lesson's Header, above;
  `self._names[index.row()]` is a list index operation, standard Python
  syntax not otherwise used yet in this curriculum, reading the single
  element at the given position from the list.

### CS Lens

Model/view architecture — a real, well-known, hard concept, already
named and defined in this lesson's Terms section, above — is worth
restating in full here: separating raw data from its presentation so
that either can change independently, and so more than one presentation
can share the exact same underlying data without duplicating it.

Also recognized in: a relational database, where the same stored table
can be viewed through many different queries or reports without the
underlying data ever being copied for each one; the Model-View-
Controller (MVC) pattern used broadly across web application
frameworks, where the same underlying data can be rendered as an HTML
page, a JSON API response, or a PDF report, all from one shared source
of truth; a spreadsheet's own underlying cell data being simultaneously
representable as a table, a chart, or a pivot summary, all reading from
the same real values; a music player's own song library being
displayable as an alphabetical list, an album grid, or a "recently
played" view, all backed by one real collection of songs.

### SE Lens

The alternative *not* chosen here is exactly what every earlier lesson
in this curriculum has quietly relied on: let the display widget itself
own the data directly, the way `QLineEdit` owns its own typed string.
For a single value, that's genuinely the simpler, more direct choice —
this curriculum used it deliberately through Lesson 6, and nothing
about Lessons 1 through 6 was wrong to do so. The real tradeoff that
changes here: a widget owning its own data works cleanly right up until
more than one thing needs to see that same data, or the data itself
needs to be manipulated (sorted, filtered, searched) independently of
whatever's currently displaying it — at which point a widget-owned
value has no clean way to be shared or transformed without either
duplicating it or reaching directly into the widget's own internals,
which breaks the exact encapsulation Lesson 5 spent an entire lesson
establishing as worth protecting. The cost model/view architecture
carries in exchange, honestly: it is real, additional structure — two
required methods, a class of its own, `QModelIndex` objects passed
around instead of plain Python values — for a problem that a single
`QLabel` would have solved with dramatically less code, if the actual
requirement genuinely never grew past "show one thing."

### Run It

Already run and shown above, under "Introducing the Concept, in
Isolation" — a real execution this session, under
`QT_QPA_PLATFORM=offscreen`.

### Connecting This Unit

`GreetedNamesModel` can now answer the two questions any view needs —
but it has no way, yet, to actually grow: nothing has added a name to
it beyond what this unit's own throwaway lab hardcoded at construction.
This lesson's second unit is where names actually get added, correctly.

---

## Concept Unit: Growing a Model Correctly

### The Problem

`GreetedNamesModel`, as it stands, could be constructed with a list
already inside it — this unit's own first lab did exactly that — but
this lesson's real feature needs the list to *grow*, one name at a
time, as the user submits each one. The obvious approach — just call
`self._names.append(name)` somewhere — would genuinely change the
list's real, underlying data. Whether a `QListView` displaying that
model would actually notice, and correctly redraw to show the new row,
is a completely separate question this unit has to answer directly.

> Before reading on: think back to this curriculum's own signal/slot
> mechanism, first covered in Lesson 2 — a `QPushButton` doesn't get
> "noticed" being clicked by some outside code polling it repeatedly;
> it *announces* the click, once, through `clicked`, and only code that
> explicitly connected to that signal ever finds out. Given that a
> `QListView` has no way to constantly re-check a model's own internal
> Python list for changes on every single frame, what do you predict
> has to happen, mechanically, for a view to actually find out new data
> was added — does something need to be *announced*, the same way a
> click is? And if so, what do you think would happen to a view if a
> model's data changed but nothing ever announced it?

### Introducing the Concept, in Isolation

First, the broken version — deliberately mutating a model's data with
no signaling at all:

```python
from PySide6.QtWidgets import QApplication, QListView
from PySide6.QtCore import QAbstractListModel, Qt, QModelIndex
import sys

app = QApplication(sys.argv)

class BrokenModel(QAbstractListModel):
    def __init__(self, parent=None):
        super().__init__(parent)
        self._names = []

    def rowCount(self, parent=QModelIndex()):
        return len(self._names)

    def data(self, index, role):
        if role == Qt.DisplayRole:
            return self._names[index.row()]
        return None

    def add_name_broken(self, name):
        # deliberately just mutates the list with no signaling at all
        self._names.append(name)

model = BrokenModel()
view = QListView()
view.setModel(model)
view.show()

rows_inserted_calls = []
model.rowsInserted.connect(lambda *args: rows_inserted_calls.append(args))

model.add_name_broken("Eve")
print("model.rowCount() after broken add:", model.rowCount())
print("rows_inserted_calls:", rows_inserted_calls)
```

Real output from running this, this session, headless:

```
model.rowCount() after broken add: 1
rows_inserted_calls: []
```

`rowCount()` does correctly report `1` — asked directly, the model
tells the truth, because `rowCount()` always recomputes from the real,
current list. But `rows_inserted_calls` stayed completely empty: this
model's own real `rowsInserted` signal, inherited from
`QAbstractItemModel`, never fired at all. A real, attached `QListView`
has no mechanism for noticing that `self._names` changed on its own —
it only ever finds out about a change by being told, through this exact
signal — meaning a view relying on this broken method would keep
displaying its previous, stale content indefinitely, with no error and
no warning, until something else eventually forced it to re-query the
model from scratch.

The corrected version, using the required pair this lesson's Header
already named:

```python
from PySide6.QtWidgets import QApplication, QListView
from PySide6.QtCore import QAbstractListModel, Qt, QModelIndex
import sys

app = QApplication(sys.argv)

class NamesModel(QAbstractListModel):
    def __init__(self, parent=None):
        super().__init__(parent)
        self._names = []

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

model = NamesModel()
view = QListView()
view.setModel(model)
view.show()

rows_inserted_calls = []
model.rowsInserted.connect(lambda parent, first, last: rows_inserted_calls.append((first, last)))

model.add_name("Finn")
print("after 1st add, rowCount():", model.rowCount())
print("rows_inserted_calls:", rows_inserted_calls)

model.add_name("Grace")
model.add_name("Hank")
print("after 3 adds, rowCount():", model.rowCount())
print("rows_inserted_calls:", rows_inserted_calls)

for row in range(model.rowCount()):
    idx = model.index(row, 0)
    print(f"  row {row}:", model.data(idx, Qt.DisplayRole))
```

Real output:

```
after 1st add, rowCount(): 1
rows_inserted_calls: [(0, 0)]
after 3 adds, rowCount(): 3
rows_inserted_calls: [(0, 0), (1, 1), (2, 2)]
  row 0: Finn
  row 1: Grace
  row 2: Hank
```

The contrast is direct and complete. This version's `rowsInserted`
signal fired exactly once per addition, each time with exactly the
right row range — `(0, 0)` for the first name added to an empty model,
then `(1, 1)`, then `(2, 2)`, each new addition landing at the next
available position, exactly matching `row = len(self._names)`,
computed fresh each time, *before* the append happens, since that's
precisely the index the new element is about to occupy. This is the
real, working mechanism: `beginInsertRows` announces, in advance,
exactly which rows are about to appear, giving any attached view a
chance to prepare; the actual mutation happens; `endInsertRows`
announces that it's now safe to actually query and display those new
rows — proven correct here by reading every row back afterward, in
order, and getting exactly the names in exactly the order they were
added.

Both labs are now **discarded** — the real project's version, below,
uses this exact, correct pattern, and drops the standalone `rows_
inserted_calls` tracking list, which existed only to make this unit's
own proof visible.

### Project Change

- **Reference Source:** No reference counterpart — from-scratch
  addition.
- **Files affected:** `greeted_names_model.py` — modified.
- **Change type:** add.
- **Location:** appended directly after the `data(...)` method, added
  in this lesson's first Concept Unit.
- **Dependencies:** none beyond what this lesson's first unit already
  added.

### The New Code

```python
def add_name(self, name):
    row = len(self._names)
    self.beginInsertRows(QModelIndex(), row, row)
    self._names.append(name)
    self.endInsertRows()
```

### The Updated Project

`greeted_names_model.py`, complete, as this lesson leaves it:

```python
 1  from PySide6.QtCore import QAbstractListModel, Qt, QModelIndex
 2
 3
 4  class GreetedNamesModel(QAbstractListModel):
 5      def __init__(self, parent=None):
 6          super().__init__(parent)
 7          self._names = []
 8
 9      def rowCount(self, parent=QModelIndex()):
10          return len(self._names)
11
12      def data(self, index, role):
13          if role == Qt.DisplayRole:
14              return self._names[index.row()]
15          return None
16
17      def add_name(self, name):               # <- new
18          row = len(self._names)                # <- new
19          self.beginInsertRows(QModelIndex(), row, row)  # <- new
20          self._names.append(name)              # <- new
21          self.endInsertRows()                  # <- new
```

As a whole, this class is now a complete, correctly-behaving,
growable model: the two required questions, `rowCount()` and `data()`,
were already answered by this lesson's first unit; this unit adds the
one real way this project's own code ever adds a name — `add_name`,
which any attached view will now correctly, automatically reflect,
proven directly by this unit's own contrasting labs above.

### Mechanical Walkthrough

- **`def add_name(self, name):`** — a method definition, the same
  construct already explained repeatedly since Lesson 5.
- **`row = len(self._names)`** — an assignment, storing the current
  length of the list — which, since Python lists are indexed starting
  at `0`, is exactly the index the next appended element is about to
  occupy; `len(...)` is explained in full in this lesson's Header,
  above.
- **`self.beginInsertRows(QModelIndex(), row, row)`** — a method call,
  explained in full in this lesson's Header, above; `QModelIndex()`
  here, constructed with no arguments, represents "no parent" — the
  correct value for a flat list model with no grid or tree structure;
  `row, row` as the second and third arguments means exactly one row,
  at position `row`, is about to be inserted — a range of one, not a
  batch.
- **`self._names.append(name)`** — a method call, explained in full in
  this lesson's Header, above, under "Everything else in the file";
  `name` is the parameter passed into `add_name` itself.
- **`self.endInsertRows()`** — a method call, explained in full in this
  lesson's Header, above; called with no arguments, since it always
  refers to whatever insertion the most recent matching
  `beginInsertRows` call announced.

### CS Lens

Not a hard concept in this unit specifically beyond what this lesson's
first Concept Unit already covered — the required
`beginInsertRows`/`endInsertRows` pair is a specific application of
the same observer-pattern signal/slot mechanism Lesson 2 already gave a
full Recognition list to, here used internally by `QAbstractItemModel`
itself rather than by this project's own code directly.

### SE Lens

The alternative *not* chosen here — the one this unit's own first lab
deliberately demonstrated failing — is mutating a model's internal data
directly with no announcement at all, relying on some other mechanism
(a manual `view.update()` call, or simply hoping the view happens to
re-query on its own) to eventually catch the change. The real tradeoff:
skipping `beginInsertRows`/`endInsertRows` is genuinely less code to
write for a change that will only ever be observed once, immediately,
in a context where the view happens to redraw for some unrelated reason
anyway — which is exactly the kind of accidental correctness that looks
fine in a small test and fails unpredictably later. The cost of
skipping it, confirmed directly by this unit's own lab, isn't a crash
or an error message at all — it's silence: a view that simply never
learns new data exists, with nothing in the program's own behavior
pointing at why. `beginInsertRows`/`endInsertRows` costs two extra
method calls around every mutation, in exchange for that mutation being
guaranteed to actually reach whatever is displaying it, correctly,
every time.

### Run It

Already run and shown above, under "Introducing the Concept, in
Isolation" — two separate real executions this session, both under
`QT_QPA_PLATFORM=offscreen`, deliberately contrasted: one broken, one
correct.

### Connecting This Unit

`GreetedNamesModel` is now a complete, correct, growable model — ready
to be connected to a real view, and to Lesson 5's own `NameGreeter`,
which is exactly what this lesson's final unit does.

---

## Concept Unit: Wiring the Model Into the Real Application

### The Problem

`GreetedNamesModel` exists, works correctly, and is completely
unconnected to anything else in this program. `main.py`, as Lesson 6
left it, still shows only `NameGreeter` as its central widget, with a
status bar reporting one message at a time. Nothing yet displays this
new model, and nothing yet calls `add_name` when a real greeting
happens.

> Before reading on: Lesson 5's `NameGreeter` already emits a signal,
> `greeted`, carrying exactly one string — the name. This lesson's own
> `add_name` method, just written, takes exactly one argument — also a
> name. Given everything Lesson 2 already established about
> `.connect()` accepting any ordinary callable as a slot — not just a
> standalone function, but, as Lesson 5 already showed, a bound method
> too — what do you predict happens if `greeter.greeted` is connected
> directly to `history_model.add_name`, with no separate function
> written in between them at all?

### Introducing the Concept, in Isolation

```python
from PySide6.QtWidgets import QApplication, QMainWindow, QWidget, QVBoxLayout, QListView
from PySide6.QtCore import QAbstractListModel, Qt, QModelIndex
from name_greeter import NameGreeter
import sys

app = QApplication(sys.argv)

class GreetedNamesModel(QAbstractListModel):
    def __init__(self, parent=None):
        super().__init__(parent)
        self._names = []

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

window = QMainWindow()
window.setWindowTitle("Lesson 1 Lab")

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

greeter.greeted.connect(history_model.add_name)

window.show()
print("history_model.rowCount() at start:", history_model.rowCount())
```

Real output from running this, this session, headless (continuing with
real, simulated submissions, exactly as this lesson's own project code
below will actually run):

```
history_model.rowCount() at start: 0
after 'Iris', rowCount(): 1
row 0: Iris
after 'Jack', rowCount(): 2
  row 0: Iris
  row 1: Jack
after empty submit, rowCount(): 2
```

`greeter.greeted.connect(history_model.add_name)` connected Lesson 5's
own signal directly to this lesson's own model method, with no
intermediate function written at all — confirmed working exactly as
this unit's own Socratic prompt predicted, since a bound method is just
as valid a slot as any plain function, the same fact Lesson 5's own
`self._on_submit` already relied on. A real, simulated submission of
`"Iris"` correctly grew the model to one row, with the correct content;
a second submission, `"Jack"`, correctly grew it to two, preserving
`"Iris"` at row `0` — confirming rows genuinely accumulate rather than
being replaced, the actual, real difference between this lesson's list
and Lesson 6's single-message status bar. A third, empty submission
correctly added nothing at all — proof that Lesson 5's own validation
logic, unmodified since it was written, is still the only thing
deciding whether `greeted` fires at all; this lesson never had to
re-implement, or even think about, "should an empty name count" —
that decision already lives entirely inside `NameGreeter`, exactly the
encapsulation Lesson 5 built.

This throwaway example is now **discarded** — the real project's
version, below, moves this exact structure into `main.py` and connects
it to the real, running application, unchanged.

### Project Change

- **Reference Source:** No reference counterpart — from-scratch
  addition.
- **Files affected:** `main.py` — modified.
- **Change type:** replace (the status-bar-based `on_greeted` function
  from Lesson 6, and the direct `window.setCentralWidget(greeter)` call,
  are both replaced) and add (`GreetedNamesModel`'s import, the
  `QListView`, and the container widget arranging `greeter` and the new
  view together).
- **Location:** the entire block from `greeter = NameGreeter(window)`
  through `greeter.greeted.connect(on_greeted)`, all from Lesson 6, is
  being replaced.
- **Dependencies:** `GreetedNamesModel`, newly imported from
  `greeted_names_model.py`; `QListView`, `QWidget`, and `QVBoxLayout`,
  the latter two already used since Lesson 3.

### The New Code

```python
greeter = NameGreeter()
history_model = GreetedNamesModel()
history_view = QListView()
history_view.setModel(history_model)

container = QWidget()
container_layout = QVBoxLayout()
container_layout.addWidget(greeter)
container_layout.addWidget(history_view)
container.setLayout(container_layout)
window.setCentralWidget(container)

greeter.greeted.connect(history_model.add_name)
```

### The Updated Project

`main.py`, complete, as it stands at the end of this lesson:

```python
 1  from PySide6.QtWidgets import QApplication, QMainWindow, QWidget, QVBoxLayout, QListView
 2  from PySide6.QtGui import QAction
 3  from name_greeter import NameGreeter
 4  from greeted_names_model import GreetedNamesModel      # <- new
 5  import sys
 6
 7  app = QApplication(sys.argv)
 8  window = QMainWindow()
 9  window.setWindowTitle("Lesson 1 Lab")
10
11  greeter = NameGreeter()                                 # <- new
12  history_model = GreetedNamesModel()                     # <- new
13  history_view = QListView()                              # <- new
14  history_view.setModel(history_model)                    # <- new
15
16  container = QWidget()                                   # <- new
17  container_layout = QVBoxLayout()                         # <- new
18  container_layout.addWidget(greeter)                      # <- new
19  container_layout.addWidget(history_view)                 # <- new
20  container.setLayout(container_layout)                    # <- new
21  window.setCentralWidget(container)                       # <- new
22
23  file_menu = window.menuBar().addMenu("&File")
24  quit_action = QAction("&Quit", window)
25  quit_action.triggered.connect(app.quit)
26  file_menu.addAction(quit_action)
27
28  greeter.greeted.connect(history_model.add_name)         # <- new
29
30  window.statusBar().showMessage("Ready")
31  window.show()
32  sys.exit(app.exec())
```

As a whole, the program's central content is no longer `NameGreeter`
alone (line 11 now constructs it with no parent given at all, since
line 20's `container.setLayout(...)` is what parents it, exactly as
Lesson 3's own lab already proved happens for any widget added to a
layout and then attached this way) — it's now a small container
holding both `NameGreeter` and a real, scrolling `QListView` beneath
it, displaying every name ever successfully greeted, growing correctly,
in order, for as long as the program runs, with the menu, the status
bar, and the Quit command from Lesson 6 all completely untouched.

### Mechanical Walkthrough

- **`greeter = NameGreeter()`** — a constructor call, the same
  construct Lesson 5 already gave full treatment to; called here with
  no parent argument, unlike Lesson 6's own version, because — the
  same fact Lesson 3's own lab already proved — `container_layout
  .addWidget(greeter)`, two lines later, doesn't itself parent it;
  `container.setLayout(container_layout)`, further down, is what
  actually does.
- **`history_model = GreetedNamesModel()`** — a constructor call,
  the same construct already fully explained in this lesson's first
  Concept Unit; called with no parent argument at all, since
  `QAbstractListModel`, confirmed by this lesson's own inheritance
  check, is a `QObject`, not a `QWidget`, and this project never needs
  to place it inside a layout the way its widgets are placed.
- **`history_view = QListView()`**, **`history_view.setModel(
  history_model)`** — a constructor call and a method call, both
  explained in full in this lesson's Header, above.
- **`container = QWidget()`** — a constructor call, the exact
  `QWidget()` construct Lesson 1 already gave full treatment to; used
  here, for the first time in this curriculum, purely as a plain
  container — a widget with no purpose of its own beyond holding two
  other widgets together in one layout, so that `setCentralWidget`,
  which only accepts one widget, can still be given two.
- **`container_layout = QVBoxLayout()`**,
  **`container_layout.addWidget(greeter)`**,
  **`container_layout.addWidget(history_view)`**,
  **`container.setLayout(container_layout)`** — the exact
  `QVBoxLayout`/`addWidget`/`setLayout` construct already fully
  explained in Lesson 3, applied here to arrange `greeter` above
  `history_view`, top to bottom, per the confirmed ordering rule
  Lesson 3's own lab already established.
- **`window.setCentralWidget(container)`** — a method call, already
  fully explained in Lesson 6; called here with `container` — the new
  combined widget — instead of `greeter` directly, since `QMainWindow`
  accepts exactly one central widget, and this lesson now needs to show
  two things.
- **`greeter.greeted.connect(history_model.add_name)`** — the exact
  `.connect()` construct already fully explained in Lesson 2; its
  argument, `history_model.add_name`, is a bound method — the same
  construct Lesson 5's own `self._on_submit` connection already relied
  on, here written from outside the class instead of from within one.

### CS Lens

Not a hard concept in this unit specifically — connecting one object's
signal directly to another object's method, with no intermediate
function, is the identical signal/slot mechanism already given full
treatment in Lesson 2, applied here between two independently-designed
classes (`NameGreeter`, from Lesson 5, and `GreetedNamesModel`, from
this lesson) that were never written with any specific knowledge of
each other — which is itself the real, practical payoff of both
lessons' own encapsulation, rather than a new concept of its own.

### SE Lens

The alternative *not* chosen here is writing a small, intermediate
function — `def on_greeted(name): history_model.add_name(name)` — and
connecting `greeted` to that instead of directly to the bound method.
The real tradeoff: an intermediate function gives a natural place to
add other behavior later — logging, additional validation, updating
more than one thing in response to a single greeting — without changing
the connection itself. Connecting directly to `history_model.add_name`,
this lesson's own actual choice, is shorter and avoids an extra,
otherwise pointless function that does nothing but forward one call
unchanged. Both are genuinely valid; this lesson picks the direct
connection specifically because `add_name`'s own signature already
matches `greeted`'s own emitted value exactly, with nothing to adapt or
add — the same reasoning that would change the instant a second
behavior needed to happen on the same signal.

### Run It

Already run and shown above, under "Introducing the Concept, in
Isolation" — a real execution this session, under
`QT_QPA_PLATFORM=offscreen`, including two real, simulated valid
submissions and one empty one, and a final, separate, real execution of
this lesson's actual, complete project files together, confirming the
identical behavior end to end.

### Connecting This Unit

The model this lesson built, the correct insertion pattern this
lesson's second unit proved, and the real `NameGreeter` this lesson
reused unmodified from Lesson 5 are now one complete, real, growing
feature — the first time this curriculum's own program has managed
more than one piece of independent, accumulating data at once.

---

## Connect the Pieces

Trace two consecutive submissions — one valid, one empty — through
everything this lesson built, start to finish:

The program is running, inside `app.exec()`, exactly as every earlier
lesson's own trace has described. The user types "Iris" and submits it.
Inside `NameGreeter`'s own `_on_submit` — unmodified since Lesson 5 —
the name passes validation; `self.label` updates, exactly as Lesson 4
and 5 already proved, and `self.greeted.emit("Iris")` fires. Line 28's
connection means `history_model.add_name` runs directly, with `"Iris"`
as its `name` argument — no intermediate function anywhere in the call
chain. Inside `add_name`: `row` becomes `0` (`len(self._names)` on an
empty list); `self.beginInsertRows(QModelIndex(), 0, 0)` announces, in
advance, that row `0` is about to exist — this lesson's own second unit
proved, directly, that skipping this step leaves any attached view
silently unaware; `self._names.append("Iris")` performs the real
mutation; `self.endInsertRows()` announces it's complete. `history_view`,
connected via line 14's `setModel`, receives that signal and correctly
displays the new row — confirmed, in this lesson's own verification, by
reading it directly back through `data()` afterward.

The user then submits an empty field. Inside `NameGreeter`'s own
`_on_submit`, `name == ""` is `True` — the exact validation logic
Lesson 4 already proved correct — `self.label` updates to the
please-enter-a-name message, and, critically, `self.greeted.emit(...)`
is never reached at all, since it sits only inside the `else` branch,
exactly as Lesson 5 built it. `history_model.add_name` is never called;
`rowCount()` stays exactly where it was. No code in this lesson's own
model, view, or wiring had to know or repeat anything about what counts
as a valid name — that decision lives entirely inside `NameGreeter`,
one lesson removed, exactly the separation of concerns this curriculum
has been building toward since Lesson 5 first introduced it.

**Next lesson:** Lesson 8 — persistence. Every name greeted by this
program currently vanishes the instant it's closed, since
`GreetedNamesModel` only ever exists in memory; the next lesson covers
writing that list to a real file when the program exits, and reading it
back the next time it starts, so the history this lesson built actually
survives between runs.
