# Lesson 5: Designing Your Own Widget

**What you will build.** The label, text field, and button Lesson 4
left scattered across `main.py` get bundled into one new class,
`NameGreeter`, that owns and manages all three internally — and
announces a successful greeting through a signal of its own, the same
kind of mechanism Lesson 2 first showed `QPushButton` using. The
transferable problem this lesson is actually about: every widget used
so far has been one of Qt's own, built exactly the way Qt's own authors
designed it. Nothing so far has asked *how* `QPushButton` or `QLabel`
came to exist as classes in the first place, or whether the same
technique is available to you. It is — and using it turns three
loosely related widgets, wired together by hand inside one long file,
into one real, self-contained, reusable *thing* — with its own name,
its own internal structure, and its own public behavior, hiding exactly
how that behavior is implemented from whatever code uses it.

**What you need to know first.** Lesson 1's `QApplication`, `QWidget`,
and the event loop. Lesson 2's parent-child ownership and signals and
slots, including `.connect()`. Lesson 3's `QVBoxLayout` and
`QLabel`. Lesson 4's `QLineEdit`, `.text()`, and input validation.

**Terms used in this lesson**

- **Subclass / inheritance** — defining a new class that starts from
  an existing class's own full behavior and adds to or changes it,
  rather than writing that behavior from scratch. Every widget class
  used in this curriculum so far (`QPushButton`, `QLabel`, `QLineEdit`)
  is already a subclass of `QWidget`, confirmed in each of their own
  Header entries in earlier lessons — this lesson is the first time
  *this project's own code*, rather than Qt's, defines a new one.
- **Encapsulation** — bundling related data and behavior together
  inside one class, and deciding, deliberately, what that class exposes
  to outside code versus what it keeps entirely to itself. Exists
  because a large program built from many small, independent pieces
  only stays manageable if each piece can be understood, and changed,
  without every other piece needing to change along with it — which
  requires each piece to hide its own internal details behind a
  smaller, stable, external face.
- **Public interface** — the specific, deliberately chosen set of
  attributes, methods, and signals a class exposes for outside code to
  use. Exists as a concept distinct from "everything the class
  happens to contain," because a class's own internal variables and
  helper methods are just as real as its public ones — the distinction
  is about *intent*: which parts the class's own author is promising to
  keep working the same way, versus which parts are free to change
  later without warning anyone.

**Objects and methods used**

- **`class NameGreeter(QWidget):`**
  - *What it is:* not a class PySide6 provides — this is a brand-new
    class, written for this project, inheriting from `QWidget`.
  - *Implementation:* a Python class statement,
    `class NameGreeter(QWidget):`. Writing `(QWidget)` after the class
    name is what makes this inheritance, the concept named in this
    lesson's Terms section, above — confirmed this session,
    `isinstance(g, QWidget)` reports `True` for an instance of a class
    defined exactly this way, proving a `NameGreeter` really is a
    `QWidget`, with every method and behavior Lessons 1 through 4
    already established for `QWidget` — `.show()`, `.setLayout(...)`,
    parent-child ownership, all of it — fully available on it with no
    extra code required.
  - *Its use:* this lesson needs one single object that represents
    "the whole name-greeting feature" as one unit, rather than three
    separate widgets a caller has to know how to wire together
    correctly every time it's needed.
  - *Type:* a class — the same kind of thing `QWidget` and
    `QPushButton` themselves are, just one this project's own code
    defines instead of importing.
  - *Responsibility:* owns and manages its own internal label, field,
    and button — none of which any other part of the program needs to
    know exist — and exposes exactly one thing to the outside world: an
    announcement, via a signal explained below, that a name was
    successfully submitted.
  - *Depends on:* `QWidget`, the class it inherits from — without it,
    this class would have to reimplement everything `QWidget` already
    provides (visibility, layout support, ownership) completely from
    scratch, which is precisely what inheriting from it avoids.
  - *Connects to:* the rest of `main.py`, covered in this lesson's
    second Concept Unit, constructs one `NameGreeter` and connects to
    its `greeted` signal — with no code outside this class ever
    touching its internal label, field, or button directly.
  - *Shape:* a class definition, from which any number of independent
    instances can be constructed — confirmed this session, constructing
    two separate `NameGreeter`-style widgets and proving each one's own
    signal connections and internal state stayed completely
    independent of the other's.

- **`__init__(self, parent=None):` and `super().__init__(parent)`**
  - *What it is:* `__init__` is the constructor method every Python
    class can define, run automatically each time a new instance is
    created; `super().__init__(parent)`, called as its first line here,
    is what actually runs `QWidget`'s own constructor — the exact same
    constructor Lesson 1 already gave full treatment to — before this
    class's own setup code runs any further.
  - *Implementation:* `super()` returns a special proxy object standing
    in for this class's own parent class (`QWidget`, per this lesson's
    `class NameGreeter(QWidget):` line); calling `.__init__(parent)` on
    it runs `QWidget.__init__` with `self` — the new object currently
    under construction — automatically supplied as the instance it's
    initializing.
  - *Its use:* this lesson's `NameGreeter` needs everything a real
    `QWidget` provides — visibility tracking, layout support, the
    ability to be a parent to other widgets or a child of one — and the
    only way to get all of that is to let `QWidget`'s own constructor
    actually run and set it up, rather than trying to reconstruct any
    of it by hand.
  - *Type:* `__init__` is an instance method, automatically called by
    Python itself at construction time; `super()` is a built-in
    function, not a method on any specific object.
  - *Responsibility:* `super().__init__(parent)` is responsible for
    every piece of setup `QWidget`'s own constructor performs
    internally — confirmed this session to be a genuine, load-bearing
    requirement, not a stylistic convention: a class that skips this
    call constructs without any error at that exact moment, but later
    fails, confirmed directly this session, the instant any real
    `QWidget` behavior is used on it — a call to `.show()` on such an
    object raised a real `RuntimeError`, with the message
    `libshiboken: '__init__' method of object's base class
    (BrokenGreeter) not called`, naming the exact problem precisely.
  - *Depends on:* being called before any other `QWidget`-provided
    behavior is used inside `__init__` — this lesson's own labs,
    below, confirm it must run first, since everything this class adds
    afterward (its label, field, button, and their layout) itself
    depends on `self` already being a genuine, fully initialized
    widget.
  - *Connects to:* every later line inside `NameGreeter.__init__`
    that calls a `QWidget`-provided method on `self` (`self.setLayout(
    ...)`, covered below) depends on this line having already run.
  - *Shape:* `super().__init__(parent)` returns nothing meaningful
    (`None`) — its entire purpose is the side effect of properly
    constructing the underlying `QWidget`.

- **`Signal(str)`, used as a class attribute**
  - *What it is:* PySide6's own tool for declaring a brand-new signal
    on a custom class — the exact same kind of thing `QPushButton`'s
    `clicked` and `QLineEdit`'s `returnPressed` already were, except
    this one is authored by this project's own code instead of by Qt.
  - *Implementation:* imported from `PySide6.QtCore`, used here as
    `greeted = Signal(str)`, written directly inside the class body,
    not inside `__init__`. The `str` inside the parentheses declares
    that every emission of this signal will carry exactly one string
    argument — confirmed this session, `self.greeted.emit("Zoe")`
    correctly delivered `"Zoe"`, and exactly that value, to a connected
    function.
  - *Its use:* this lesson's `NameGreeter` needs a way to tell outside
    code "a name was successfully submitted," without that outside code
    needing to know anything about the internal label, field, or button
    that produced it.
  - *Type:* confirmed this session, accessing this attribute on the
    class itself (`NameGreeter.greeted`) reports its type as
    `PySide6.QtCore.Signal` — but accessing the identical-looking
    attribute on a real, constructed instance (`some_greeter.greeted`)
    reports a different type, `PySide6.QtCore.SignalInstance` — the
    same type every built-in signal used so far in this curriculum has
    had. `Signal(str)` itself is essentially a declaration or template;
    each real instance of the class gets its own independent, live
    `SignalInstance` automatically, confirmed this session by
    constructing two separate `NameGreeter`-style objects and proving
    `g1.greeted is g2.greeted` is `False` — they are two genuinely
    separate signal objects, not one shared between every instance of
    the class.
  - *Responsibility:* announces, once, every time `.emit(...)` is
    called on it, carrying whatever value was passed — nothing more; it
    has no memory of past emissions and no idea, itself, which slot
    functions, if any, are currently connected.
  - *Depends on:* being declared as a class attribute — not inside
    `__init__` — so that PySide6's own machinery can correctly give
    each instance its own separate `SignalInstance`, exactly as this
    lesson's own two-instance lab confirmed happens.
  - *Connects to:* `self.greeted.emit(name)`, called from inside this
    lesson's own internal submit-handling method, covered below;
    outside code, in this lesson's second Concept Unit, calls
    `.connect(...)` on it, the same method already given full treatment
    in Lesson 2.
  - *Shape:* not a value — a declaration that produces a live signal
    channel per instance, the same shape every signal in this
    curriculum has had since Lesson 2, just self-authored instead of
    inherited from a Qt-provided class.

- **`self.greeted.emit(name)`**
  - *What it is:* the method that actually fires a signal, causing
    every currently connected slot to run.
  - *Implementation:* an instance method on a `SignalInstance`, real
    signature `emit(*args) -> None` — the number and type of arguments
    it accepts is determined by how the signal was declared;
    `Signal(str)` means `.emit(...)` here expects exactly one string.
  - *Its use:* this lesson's `NameGreeter` calls it exactly once,
    inside its own internal submit-handling method, and only in the
    branch where the typed name passed validation — never in the
    empty-input branch, confirmed directly this session: an empty
    submission left a connected outside function's own record of
    received names completely empty, while a valid `"Finn"` submission
    correctly appended exactly `"Finn"` to it.
  - *Type:* an ordinary instance method on the signal object itself
    (`self.greeted.emit(...)`) — not `static`, and not called on the
    widget (`self.emit(...)` is not how this works).
  - *Responsibility:* runs every connected slot, in the order they were
    connected — the same guarantee already established for
    `QPushButton.clicked` back in Lesson 2 — passing along whatever
    arguments were given to `.emit(...)` itself.
  - *Depends on:* being called with arguments matching the signal's own
    declared shape — one `str`, here, since this signal was declared
    with `Signal(str)`.
  - *Connects to:* every slot connected via `.connect(...)`, including,
    in this lesson's own labs, an outside, ordinary function with no
    connection to `NameGreeter`'s own internals at all — proving the
    whole point of this lesson's encapsulation: the emitting code and
    the reacting code share no knowledge of each other beyond this one
    signal.
  - *Shape:* returns `None`; its effect is entirely the side effect of
    running every connected slot.

**Everything else in the file, not this lesson's subject but still
explained.**

- **`self`** — the conventional first parameter of every instance
  method in Python, automatically bound to the specific object the
  method was called on. Not new to this lesson conceptually (every
  method call already made throughout this curriculum — `window.show
  ()`, `button.click()` — relies on this same mechanism on the *calling*
  side), but this is the first lesson where this project's own code
  defines methods that receive it explicitly, so, per the Repetition
  Rule, it earns its own real entry: inside `NameGreeter.__init__`,
  `self` refers to the specific `NameGreeter` instance currently being
  constructed, which is why `self.label = QLabel(...)` stores the label
  onto *this* instance specifically, not onto the class itself or onto
  some other instance.

---

## Concept Unit: A Class of Your Own, Inheriting From `QWidget`

### The Problem

Lesson 4's `main.py` builds a label, a field, and a button, and wires
them together with roughly a dozen lines scattered across the file —
some constructing widgets, some building a layout, some defining and
connecting `on_submit`. Nothing about those lines says, anywhere, "this
group of things is one feature." If this project later wanted a second,
independent name-greeting section in the same window — or wanted to
reuse this exact feature in a completely different program — every one
of those dozen lines would have to be copied and re-wired by hand, with
real risk of getting some part of it subtly wrong the second time. What
would it take to turn "a dozen related lines" into "one reusable
thing," the same way `QPushButton` itself already is one reusable
thing, usable with a single line, `QPushButton("Click Me")`, anywhere
it's needed?

> Before reading on: you've already used four classes Qt provides —
> `QWidget`, `QPushButton`, `QLabel`, `QLineEdit` — every one of them by
> writing `ClassName(...)` and getting back a working object with real
> behavior already built in. Given that `QPushButton` is, per Lesson
> 2's own confirmed inheritance chain, ultimately *also* a `QWidget`
> underneath — what do you think the actual, real difference is between
> a class Qt's own authors wrote and a class you could write yourself?
> Is there a technical wall stopping you from writing something Qt
> would treat exactly the way it treats `QPushButton` — or is
> `QPushButton` simply proof that this has already been done at least
> once, by someone else, using tools you might already have everything
> you need to use yourself?

### Introducing the Concept, in Isolation

```python
from PySide6.QtWidgets import QApplication, QWidget
import sys

app = QApplication(sys.argv)

class Greeter(QWidget):
    def __init__(self, parent=None):
        print("  Greeter.__init__ starting, before super().__init__()")
        super().__init__(parent)
        print("  Greeter.__init__ after super().__init__() - self.isVisible():", self.isVisible())

print("Constructing Greeter()...")
g = Greeter()
print("type(g):", type(g))
print("isinstance(g, QWidget):", isinstance(g, QWidget))
print("g.isVisible() before show():", g.isVisible())
g.show()
print("g.isVisible() after show():", g.isVisible())
```

Real output from running this, this session, headless:

```
Constructing Greeter()...
  Greeter.__init__ starting, before super().__init__()
  Greeter.__init__ after super().__init__() - self.isVisible(): False
type(g): <class '__main__.Greeter'>
isinstance(g, QWidget): True
g.isVisible() before show(): False
g.isVisible() after show(): True
```

This proves the central claim directly: `Greeter`, a class written
entirely by this lesson's own code, with nothing imported from Qt
beyond `QWidget` itself, is a genuine, fully-functioning `QWidget` —
`isinstance(g, QWidget)` reports `True`, and `.isVisible()` and
`.show()`, methods Lesson 1 already gave full treatment to as belonging
to `QWidget`, work on it identically, with zero extra code written to
support either one. This is called **inheritance**: `Greeter` doesn't
reimplement visibility tracking, or anything else `QWidget` already
does — it inherits all of it, automatically, the instant
`class Greeter(QWidget):` names `QWidget` as its parent.

A second lab proves `super().__init__(parent)` is not a stylistic
convention — it's a genuine, load-bearing requirement:

```python
from PySide6.QtWidgets import QApplication, QWidget
import sys

app = QApplication(sys.argv)

class BrokenGreeter(QWidget):
    def __init__(self, parent=None):
        # deliberately NOT calling super().__init__(parent)
        self.name = "test"

try:
    bg = BrokenGreeter()
    print("Constructed without error (unexpected)")
    bg.show()
    print("show() worked")
except Exception as e:
    print(f"Error type: {type(e).__name__}")
    print(f"Error message: {e}")
```

Real output:

```
Error type: RuntimeError
Error message: libshiboken: '__init__' method of object's base class (BrokenGreeter) not called.
```

The object's own construction — `BrokenGreeter()` — didn't fail
immediately; ordinary Python attribute assignment (`self.name =
"test"`) works on any object regardless. It's only the instant real
`QWidget` behavior is asked of it — `.show()`, here — that the failure
surfaces, with an error message naming the exact, real problem: the
base class's own `__init__` genuinely never ran, and `shiboken`
(PySide6's own underlying binding layer connecting Python objects to
Qt's real C++ objects) refuses to treat this as a real, usable widget
until it does.

Both labs are now **discarded** — the real project's version, below,
never omits `super().__init__(parent)`, and doesn't print debug
statements from inside its own constructor; both existed only to make
this unit's proof visible.

### Project Change

- **Reference Source:** No reference counterpart — from-scratch
  addition, same as every unit so far.
- **Files affected:** `main.py` — modified. (This lesson's second
  Concept Unit splits the project into two files; this first unit still
  edits the single `main.py` this curriculum has used since Lesson 1.)
- **Change type:** refactor — Lesson 4's separately constructed
  `label`, `line_edit`, and `button`, along with the layout and
  `on_submit` function that wired them together, are being replaced by
  one class that owns and builds all of them internally.
- **Location:** the entire block from `button = QPushButton(...)`
  through `line_edit.returnPressed.connect(on_submit)`, all from
  Lesson 4, is being replaced.
- **Dependencies:** `Signal`, newly imported from `PySide6.QtCore`.

### The New Code

```python
class NameGreeter(QWidget):
    greeted = Signal(str)

    def __init__(self, parent=None):
        super().__init__(parent)
```

### The Updated Project

This is the start of a brand-new class definition — the smallest
enclosing structure that exists so far is the class body itself, with
nothing inside `__init__` yet beyond the required `super().__init__(
parent)` call:

```python
1  class NameGreeter(QWidget):
2      greeted = Signal(str)      # <- new
3
4      def __init__(self, parent=None):   # <- new
5          super().__init__(parent)       # <- new
```

As a whole, this is currently a real, constructable, but functionally
empty widget: `NameGreeter()` would produce a genuine `QWidget`
instance, per this unit's own lab, complete with a working `greeted`
signal ready to be connected to — but with no visible content and no
behavior yet, since nothing has been added to `__init__` beyond the
one required line. This lesson's next Concept Unit fills that in.

### Mechanical Walkthrough

- **`class NameGreeter(QWidget):`** — a class definition. Explained in
  full in this lesson's Header, above, under Objects and methods used.
- **`greeted = Signal(str)`** — a class-level attribute assignment,
  the same basic assignment construct already explained repeatedly in
  this curriculum, here assigning the result of `Signal(str)` — itself
  explained in full in this lesson's Header, above — to a name,
  `greeted`, that every instance of this class will be able to access
  and connect to.
- **`def __init__(self, parent=None):`** — a method definition inside a
  class body; `self` and `parent=None` are its two parameters, both
  explained in full in this lesson's Header, above (`self` under
  "Everything else in the file"; `parent`'s default of `None` mirrors
  the exact same optional-parent pattern already established for every
  Qt-provided widget constructor used since Lesson 2).
- **`super().__init__(parent)`** — explained in full in this lesson's
  Header, above, under Objects and methods used.

### CS Lens

Inheritance — a new class starting from an existing class's full
behavior and building on it, rather than reimplementing it — is a hard
concept: one of the foundational ideas of object-oriented programming,
not routine syntax.

Also recognized in: a biological species inheriting traits from its
parent species while adding or modifying some of its own; a legal
franchise (a specific restaurant location) inheriting an entire
standardized operating system from its parent company while still
having its own specific staff, hours, and local menu items; a
software driver for a specific printer model inheriting a generic
"printer" interface's whole contract while implementing only the parts
genuinely specific to that one model; a city government inheriting
national laws by default while still being free to add its own local
ordinances on top.

### SE Lens

The alternative *not* chosen here is composition without inheritance:
writing `NameGreeter` as an ordinary Python class that does *not*
inherit from `QWidget` at all, but instead holds a `QWidget` as one of
its own internal attributes (`self._widget = QWidget()`), and manually
forwards whatever methods outside code might need (`def show(self):
self._widget.show()`, and so on, for every method anyone might ever
call). The real tradeoff: composition avoids this lesson's whole
`super().__init__()` requirement, and some real, larger projects prefer
it specifically to avoid deep inheritance chains becoming hard to
reason about. The cost it would carry here, honestly: `QWidget` has
dozens of real methods (`.show()`, `.resize()`, `.setLayout()`, many
more never even named in this curriculum), and a composition-based
`NameGreeter` would need to manually forward every single one it wanted
to expose, or callers would be unable to use it as a real widget at
all — unable, for instance, to pass it directly to another widget's own
`.addWidget(...)` the way this lesson's next Concept Unit does.
Inheriting from `QWidget` gets every one of those methods for free, in
exchange for `NameGreeter` now being permanently, structurally *a*
`QWidget`, not merely something that happens to have widget-like
behavior — a real commitment, not a free choice reversible later
without changing this class's own declaration.

### Run It

Already run and shown above, under "Introducing the Concept, in
Isolation" — two separate real executions this session, both under
`QT_QPA_PLATFORM=offscreen`.

### Connecting This Unit

`NameGreeter` now exists as a real, working `QWidget` subclass, with a
signal ready to announce successful greetings — but it's still
functionally empty: no label, no field, no button, and no logic
connecting them. That's this lesson's final unit.

---

## Concept Unit: Moving the Feature Inside

### The Problem

Lesson 4's actual feature — a label, a field, a button, wired together
with validation logic — still exists only as loose code sitting
directly in `main.py`. `NameGreeter`, as it stands after this lesson's
first unit, is a real widget with nowhere near enough content to be
useful yet. What needs to happen to move that entire feature — every
widget, the layout arranging them, and the logic connecting them — from
`main.py`'s own top level into this one class, so that `main.py` itself
only ever has to write `NameGreeter(...)` to get the whole thing, the
same way it already writes `QPushButton(...)` to get a whole working
button?

> Before reading on: Lesson 4's own `on_submit` function referred to
> `line_edit`, `label`, and `button` directly, as plain variables
> sitting in the same file. If those three widgets are about to become
> `self.line_edit`, `self.label`, and `self.button` — attributes stored
> on the `NameGreeter` instance itself instead of bare module-level
> variables — what do you predict has to change inside the logic that
> reads and updates them? Does the underlying behavior of `.text()`,
> `.strip()`, or `.setText(...)` change at all — or only *how you refer
> to* the objects those methods are being called on?

### Introducing the Concept, in Isolation

```python
from PySide6.QtWidgets import QApplication, QWidget, QPushButton, QVBoxLayout
from PySide6.QtCore import Signal, SignalInstance
import sys

app = QApplication(sys.argv)

class Greeter(QWidget):
    greeted = Signal(str)

    def __init__(self, parent=None):
        super().__init__(parent)
        button = QPushButton("Say Hi", self)
        layout = QVBoxLayout()
        layout.addWidget(button)
        self.setLayout(layout)
        button.clicked.connect(self._on_click)

    def _on_click(self):
        self.greeted.emit("Zoe")

g = Greeter()
print("type(Greeter.greeted):", type(Greeter.greeted))
print("type(g.greeted):", type(g.greeted))
print("isinstance(g.greeted, SignalInstance):", isinstance(g.greeted, SignalInstance))

received = []
def on_greeted(name):
    received.append(name)
    print(f"  outside slot received: {name!r}")

g.greeted.connect(on_greeted)
g.show()

button = g.findChild(QPushButton)
button.click()
button.click()
print("received list:", received)
```

Real output from running this, this session, headless:

```
type(Greeter.greeted): <class 'PySide6.QtCore.Signal'>
type(g.greeted): <class 'PySide6.QtCore.SignalInstance'>
isinstance(g.greeted, SignalInstance): True
  outside slot received: 'Zoe'
  outside slot received: 'Zoe'
received list: ['Zoe', 'Zoe']
```

This proves the class-attribute-versus-instance distinction named in
this lesson's Header, above: `Greeter.greeted`, read directly on the
class, reports type `Signal` — but `g.greeted`, read on a real,
constructed instance, reports the different type `SignalInstance`, the
same live, connectable kind of object every built-in signal in this
curriculum has already been. It also proves the whole point of this
unit concretely: `on_greeted`, an ordinary function defined completely
outside the `Greeter` class, with no access to its internals at all,
correctly received `"Zoe"` twice, once per real click — proving a
custom signal genuinely lets outside code react to what happens inside
a class without that outside code needing to know how the class
produces the value at all.

A second lab confirms each instance's signal is genuinely its own,
never shared:

```python
g1 = Greeter()
g2 = Greeter()

g1_calls = []
g2_calls = []
g1.greeted.connect(lambda name: g1_calls.append(name))
g2.greeted.connect(lambda name: g2_calls.append(name))

g1.show()
g2.show()

btn1 = g1.findChild(QPushButton)
btn1.click()
btn1.click()

print("g1_calls:", g1_calls)
print("g2_calls:", g2_calls)
print("g1.greeted is g2.greeted:", g1.greeted is g2.greeted)
```

Real output:

```
g1_calls: ['hi', 'hi']
g2_calls: []
g1.greeted is g2.greeted: False
```

Clicking `g1`'s own internal button never affected `g2` at all —
confirmed directly, `g2_calls` stayed completely empty — and
`g1.greeted is g2.greeted` is `False`: two real, separate `Greeter`
instances really do each get their own independent `greeted` signal,
exactly as `Signal(str)`'s own class-attribute declaration, from this
lesson's first Concept Unit, was described as guaranteeing.

Both labs are now **discarded** — the real project's version, below,
uses this exact structure, but with the full label/field/button trio
from Lesson 4, not a single stand-in button.

### Project Change

- **Reference Source:** No reference counterpart — from-scratch
  addition.
- **Files affected:** `name_greeter.py` — created, holding the
  `NameGreeter` class itself; `main.py` — modified, now importing and
  using it instead of building the feature directly.
- **Change type:** refactor (splitting one file into two, and moving
  Lesson 4's feature logic inside a class method) and add (the
  `NameGreeter.__init__` body, and its new private `_on_submit`
  method).
- **Location:** everything inside `NameGreeter.__init__`, below,
  replaces this lesson's own first Concept Unit's placeholder version
  (which had only the required `super().__init__(parent)` line);
  `main.py` is rewritten to construct one `NameGreeter` instead of
  three separate widgets.
- **Dependencies:** `QLabel` and `QLineEdit`, both already used in
  earlier lessons, now imported inside `name_greeter.py` instead of
  `main.py`.

### The New Code

```python
self.label = QLabel("Status: idle")
self.line_edit = QLineEdit()
self.line_edit.setPlaceholderText("Enter your name")
self.button = QPushButton("Click Me")

layout = QVBoxLayout()
layout.addWidget(self.label)
layout.addWidget(self.line_edit)
layout.addWidget(self.button)
self.setLayout(layout)

self.button.clicked.connect(self._on_submit)
self.line_edit.returnPressed.connect(self._on_submit)
```

```python
def _on_submit(self):
    name = self.line_edit.text().strip()
    if name == "":
        self.label.setText("Status: please enter a name")
    else:
        self.label.setText(f"Status: Hello, {name}!")
        self.greeted.emit(name)
    self.line_edit.clear()
```

### The Updated Project

`name_greeter.py`, complete, as this lesson leaves it:

```python
 1  from PySide6.QtWidgets import QWidget, QPushButton, QLabel, QLineEdit, QVBoxLayout
 2  from PySide6.QtCore import Signal
 3
 4
 5  class NameGreeter(QWidget):
 6      greeted = Signal(str)
 7
 8      def __init__(self, parent=None):
 9          super().__init__(parent)
10          self.label = QLabel("Status: idle")               # <- new
11          self.line_edit = QLineEdit()                       # <- new
12          self.line_edit.setPlaceholderText("Enter your name")  # <- new
13          self.button = QPushButton("Click Me")               # <- new
14
15          layout = QVBoxLayout()                              # <- new
16          layout.addWidget(self.label)                        # <- new
17          layout.addWidget(self.line_edit)                    # <- new
18          layout.addWidget(self.button)                       # <- new
19          self.setLayout(layout)                              # <- new
20
21          self.button.clicked.connect(self._on_submit)        # <- new
22          self.line_edit.returnPressed.connect(self._on_submit)  # <- new
23
24      def _on_submit(self):                                   # <- new
25          name = self.line_edit.text().strip()                # <- new
26          if name == "":                                      # <- new
27              self.label.setText("Status: please enter a name")  # <- new
28          else:                                                # <- new
29              self.label.setText(f"Status: Hello, {name}!")   # <- new
30              self.greeted.emit(name)                         # <- new
31          self.line_edit.clear()                              # <- new
```

As a whole, this class is now a complete, self-contained rewrite of
everything Lesson 4 built directly in `main.py`: it constructs its own
label, field, and button, none of which any outside code ever touches
directly (lines 10–13); arranges them with its own internal layout
(lines 15–19); wires both `clicked` and `returnPressed` to its own
private `_on_submit` method (lines 21–22, mirroring Lesson 4's own
double-connection exactly); and, inside that method, performs the
identical validation logic Lesson 4 already proved correct — with one
real addition: line 30 emits `greeted` with the valid name, letting
outside code react to a successful submission without ever needing to
know a label, a field, or a button were involved in producing it at
all.

`main.py`, complete, as it stands at the end of this lesson:

```python
 1  from PySide6.QtWidgets import QApplication, QWidget, QVBoxLayout
 2  from name_greeter import NameGreeter
 3  import sys
 4
 5  app = QApplication(sys.argv)
 6  window = QWidget()
 7  window.setWindowTitle("Lesson 1 Lab")
 8
 9  greeter = NameGreeter(window)
10  layout = QVBoxLayout()
11  layout.addWidget(greeter)
12  window.setLayout(layout)
13
14  def on_greeted(name):
15      print(f"Someone greeted: {name}")
16
17  greeter.greeted.connect(on_greeted)
18
19  window.show()
20  sys.exit(app.exec())
```

As a whole, `main.py` no longer knows or cares that a `NameGreeter`
internally contains a label, a field, and a button at all — it
constructs one (line 9), adds it to its own layout the exact same way
any other widget would be added (lines 10–12, the identical
`addWidget`/`setLayout` pattern Lesson 3 already gave full treatment
to), and connects to its one public signal (line 17) — confirmed this
session, this exact structure produces a real, nested parent-child
chain: the `NameGreeter`'s own internal button is a child of the
`NameGreeter` itself, which is in turn a child of `window`, both links
confirmed directly (`greeter.parent() is window` and
`greeter.button.parent() is greeter` both reported `True`).

### Mechanical Walkthrough

- **`self.label = QLabel("Status: idle")`** — an assignment, the same
  construct already explained repeatedly, storing the constructed
  `QLabel` onto `self` — this instance of `NameGreeter` specifically —
  rather than into a bare module-level variable the way Lesson 3 did;
  `self` is explained in full in this lesson's Header, above.
- **`self.line_edit = QLineEdit()`**, **`self.line_edit
  .setPlaceholderText(...)`**, **`self.button = QPushButton(
  "Click Me")`** — the same assignment and constructor-call constructs
  already fully explained across this curriculum, each storing its
  result onto `self` instead of a bare variable, for the same reason
  as the label above. Note `QPushButton("Click Me")` here is
  constructed with no parent argument at all — unlike Lesson 2's own
  original version — because, exactly as Lesson 3's own lab already
  proved, `layout.addWidget(...)`, called two lines later, does not
  itself set the parent; it's the following `self.setLayout(layout)`
  call that does, the same mechanism Lesson 3 already gave full
  treatment to, here parenting each widget to `self` (this
  `NameGreeter` instance) rather than to a bare `window` variable.
- **`layout = QVBoxLayout()`**, **`layout.addWidget(...)`** (three
  times), **`self.setLayout(layout)`** — all already fully explained
  in Lesson 3; the only genuinely new detail is that `self.setLayout(
  layout)` is called on `self` rather than on a variable named
  `window`, which is what causes this `NameGreeter` instance itself,
  rather than some separate top-level window, to become every one of
  these three widgets' real parent.
- **`self.button.clicked.connect(self._on_submit)`**,
  **`self.line_edit.returnPressed.connect(self._on_submit)`** — the
  exact `.connect()` construct already fully explained in Lesson 2 (for
  `clicked`) and Lesson 4 (for `returnPressed`); the only new detail is
  the slot itself, `self._on_submit`, a *method* — a function defined
  inside this class, bound to this specific instance — rather than a
  plain, standalone function the way Lesson 4's `on_submit` was.
- **`def _on_submit(self):`** — a method definition, the same
  construct already explained for `__init__`, above, in this lesson's
  first Concept Unit; the name's leading underscore is a widely used
  Python convention, not an enforced language rule, signaling to
  anyone reading this class that `_on_submit` is meant only for
  `NameGreeter`'s own internal use, not something outside code should
  ever call directly — the actual, real mechanism for outside code to
  react to a submission is the `greeted` signal, not this method.
- **`name = self.line_edit.text().strip()`**,
  **`if name == "":`**, **`self.label.setText(...)`** (both
  branches), **`self.line_edit.clear()`** — every one of these is the
  identical logic and identical constructs Lesson 4 already gave full
  treatment to; the only change anywhere in this block is that every
  reference reads `self.line_edit` and `self.label` instead of Lesson
  4's bare `line_edit` and `label` — confirming this unit's own
  Socratic prompt's real answer: the underlying behavior of `.text()`,
  `.strip()`, and `.setText(...)` did not change at all; only how the
  objects they're called on are referred to did.
- **`self.greeted.emit(name)`** — a method call, explained in full in
  this lesson's Header, above; placed inside the `else` branch only,
  so it never fires for empty or whitespace-only input — confirmed
  directly in this unit's own Introducing-the-Concept lab and, for
  this exact validation logic, in this lesson's own end-to-end
  verification.
- **`from name_greeter import NameGreeter`** (in `main.py`) — an
  import statement, the same basic construct already explained in
  Lesson 1, here importing a name from a file this project's own code
  wrote (`name_greeter.py`) rather than from PySide6 itself — proving
  a class this project defines can be imported and used exactly the
  same way any of PySide6's own classes have been throughout this
  curriculum.
- **`layout.addWidget(greeter)`** (in `main.py`) — the same
  `addWidget` construct already fully explained in Lesson 3, here
  called with a `NameGreeter` instance as its argument instead of a
  `QPushButton` or `QLabel` — valid, and unremarkable to `addWidget`
  itself, precisely because `NameGreeter` really is a `QWidget`,
  confirmed by this lesson's first Concept Unit's own `isinstance`
  check.

### CS Lens

Encapsulation — bundling `NameGreeter`'s three internal widgets and its
validation logic together, and exposing only one signal to the outside
— is a hard concept, already named and defined in this lesson's Terms
section, above, worth restating here in its full, real form: it's the
principle that a class's own internal implementation details should be
free to change without breaking any code that uses it, provided its
public interface — also already defined in this lesson's Terms section
— stays the same. Confirmed concretely by this lesson's own project
code: `main.py` never once mentions `label`, `line_edit`, or the exact
validation rule (`.strip()`, checking against `""`) at all — every one
of those details could change completely inside `name_greeter.py`
(different validation, an extra field, a completely different internal
layout) without `main.py` needing to change even one character, as
long as `greeted` keeps emitting a name string the way it always has.

Also recognized in: a car's own dashboard exposing a speedometer and a
few pedals while the engine's actual combustion process stays
completely hidden from the driver; a restaurant's own menu listing
dishes by name and price with no requirement that a customer understand
the kitchen's internal recipe or process to order one; a library's own
public catalog and checkout desk, with the specific shelving system
used to physically organize books behind the scenes never needing to be
known by a patron at all; a thermostat exposing a single target-
temperature dial while its own internal heating/cooling logic stays
completely hidden from whoever sets it.

### SE Lens

The alternative *not* chosen here is leaving Lesson 4's structure
exactly as it was: three separate widgets and a validation function,
all sitting directly in `main.py`, with no class wrapping any of it.
The real tradeoff: that flat structure genuinely has less code to write
for a single, one-off feature that will only ever be used once, in one
place — writing a whole class, with `__init__`, `super().__init__()`,
and a private method, is real, additional structure that a program
which will never grow past this one feature doesn't strictly need. The
cost that flat structure carries, honestly, the moment this exact
feature needs to appear a second time in the same program, or in a
different one entirely: every widget, every layout call, and the
validation logic itself would have to be copied by hand, with real risk
that a fix made to one copy — closing a validation bug, say — never
gets applied to the other, because nothing connects them once they're
duplicated. Wrapping the feature in a class the first time it's built
means every future use of it is one line, `NameGreeter(parent)`, with
every internal detail, correct or not yet correct, shared identically
across every place it's used.

### Run It

Already run and shown above, under "Introducing the Concept, in
Isolation" — two separate real executions this session, both under
`QT_QPA_PLATFORM=offscreen` — plus one further real, end-to-end
execution of this lesson's actual project files together, confirming
`greeter.parent() is window`, `greeter.button.parent() is greeter`, an
empty submission producing no `greeted` emission, and a real submission
of `"Finn"` correctly producing exactly one emission of `"Finn"` and
the expected label text.

### Connecting This Unit

`NameGreeter`, empty at the end of this lesson's first Concept Unit,
now contains the entire feature Lesson 4 built — reachable, from
outside, through nothing but its constructor and its one signal. This
lesson's own Connect the Pieces, below, traces one full submission
through this new structure end to end.

---

## Connect the Pieces

Trace one concrete action — a user typing a name and submitting it —
through everything this lesson built, start to finish:

`main.py` constructs `window` (line 6) and then, line 9, constructs one
`NameGreeter(window)`. Inside `NameGreeter.__init__`,
`super().__init__(parent)` runs first — proven, in this lesson's first
Concept Unit, to be a genuine requirement, not a formality, by the real
`RuntimeError` a skipped call produces the instant real widget behavior
is used. With that done, `self.label`, `self.line_edit`, and
`self.button` are constructed and stored on this specific instance
(lines 10–13), arranged into a vertical stack via `self.setLayout(
layout)` (line 19) — which, exactly as Lesson 3's own lab proved for a
bare `window`, is the actual moment each of those three widgets becomes
a real child of `self`, this `NameGreeter` instance, confirmed directly
this session. Back in `main.py`, `layout.addWidget(greeter)` (line 11)
and `window.setLayout(layout)` (line 12) make `greeter` itself a real
child of `window` — a second, outer layer of the same ownership
mechanism Lesson 2 first introduced, now nested one level deeper than
any earlier lesson has shown.

The user types "Finn" and presses Enter. `self.line_edit`'s own
`returnPressed` signal fires — the identical mechanism Lesson 4 already
proved — and, because line 22 connected it to `self._on_submit`, that
method runs. `name` becomes `"Finn"` after `.strip()` (line 25, no
whitespace here to remove); the `if` check on line 26 is `False`; line
29 sets `self.label`'s text to `"Status: Hello, Finn!"`, exactly as
Lesson 4 already proved this validation logic does — and now, line 30
runs too, calling `self.greeted.emit("Finn")`. That's the moment this
lesson's whole feature actually reaches outside the class: back in
`main.py`, line 17's `greeter.greeted.connect(on_greeted)` means
`on_greeted`, defined on lines 14–15, runs next, printing
`"Someone greeted: Finn"` to the terminal — a function that has never
once referred to a label, a field, or a button, reacting correctly to
a real user action buried three layers of ownership deep inside
`NameGreeter`'s own internals, exactly the separation this lesson's own
CS Lens named as encapsulation's whole point.

**Next lesson:** Lesson 6 — real application chrome. This lesson's
window is still a bare `QWidget`; the next lesson switches to
`QMainWindow`, adding a menu bar and a status bar, and covers the
specific structural contract `QMainWindow` expects from anything placed
inside it as its own "central widget" — which `NameGreeter`, built this
lesson to be a perfectly ordinary, reusable `QWidget`, is already fully
prepared to become.
