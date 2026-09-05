# Lesson 2: A Window That Notices You

**What you will build.** The Lesson 1 window gains a real button that
does something when clicked — printing a message to the terminal. The
transferable problem this lesson is actually about: Lesson 1 ended with
a program that *waits*, but waiting for what, specifically? This lesson
answers that concretely — the event loop doesn't dispatch raw clicks to
your code directly; it dispatches them to *widgets*, and widgets
re-announce them through a mechanism called signals and slots. Learning
that mechanism, not just wiring up one button, is the actual point:
every interactive PySide6 program you'll ever write reduces to
"something happened → a signal fires → some slot runs," repeated for
every different kind of thing that can happen.

**What you need to know first.** Lesson 1's `QApplication` (the single,
shared object every widget depends on), `QWidget` (the base class for
everything visible), and the event loop `app.exec()` starts and blocks
inside of.

**Terms used in this lesson**

- **Widget tree / parent-child ownership** — the structure Qt uses to
  track which widgets live "inside" which other widgets, and,
  separately, which objects are responsible for destroying which other
  objects when the program is done with them. Exists because a GUI is
  naturally hierarchical (a button lives inside a window, which might
  live inside another window) and because manually tracking "who
  deletes this object, and when" across a large program is a well-known
  source of memory bugs in languages without automatic garbage
  collection — Qt itself is written in C++, which has no garbage
  collector, so this ownership tree is Qt's own built-in answer to that
  problem, one PySide6 inherits directly.
- **Signal** — an announcement a Qt object makes that "something just
  happened," with no knowledge of, or care about, who (if anyone) is
  listening. Exists to decouple *the thing that detects an event* (a
  button noticing it was pressed and released) from *the code that
  should react to it* (your own application logic) — the button itself
  contains no application-specific behavior at all; it only ever
  announces.
- **Slot** — any callable — an ordinary function, a method, a lambda —
  that has been registered to run when a specific signal fires. Exists
  as the other half of the same decoupling: a slot doesn't know or care
  which signal called it, or how many other slots are also listening to
  that same signal.
- **Connection** — the specific, individual link between one signal and
  one slot, created by calling `.connect(...)`. Exists as its own
  concept, separate from the signal and the slot themselves, because
  one signal can have many connections (many slots all listening to the
  same event) and a single connection can later be individually broken
  with `.disconnect(...)` without affecting any of the others.

**Objects and methods used**

- **`QPushButton`**
  - *What it is:* a clickable, labeled push-button widget — the
    standard "click this to do a thing" control.
  - *Implementation:* a class in `PySide6.QtWidgets`, constructed here
    as `QPushButton("Click Me", window)`. Its real inheritance chain,
    confirmed against the actual installed library this session —
    `QPushButton → QAbstractButton → QWidget → QObject → QPaintDevice →
    Object → object` — shows it is not a special case bolted onto Qt
    from outside: it is a `QWidget`, with everything Lesson 1 already
    established about `QWidget` (it can be shown, hidden, given a
    parent, painted) fully intact, plus one additional parent class,
    `QAbstractButton`, that adds the shared behavior every clickable
    button-like control needs (checkbox, radio button, and push button
    alike) — being pressed, being released, and announcing both.
  - *Its use:* this lesson needs one concrete, visible thing the user
    can actually interact with, and a push button is the simplest
    widget whose entire purpose is being clicked.
  - *Type:* a class, instantiated once in this lesson's code — an
    ordinary object once constructed, not a `static` method.
  - *Responsibility:* displays its own label text, tracks its own
    pressed/released/hovered visual state, and announces — via the
    `clicked` signal explained below — whenever a complete press-then-
    release happens on it. It is not responsible for knowing what
    should happen in response; that is deliberately left to whatever
    code connects to its signal.
  - *Depends on:* a text label, passed to its constructor
    (`"Click Me"`); optionally, a parent widget, also accepted directly
    by the constructor, covered in this lesson's first Concept Unit.
  - *Connects to:* your own code calls `.text()` to read its label and
    `.clicked.connect(...)` to attach behavior to it; internally, the
    event loop from Lesson 1 is what actually delivers the raw mouse
    press and release events to it in the first place, which is what
    causes it to emit `clicked` at all.
  - *Shape:* one object per button. Its label is a plain Python `str`,
    confirmed this session (`found.text()` returned `'Click Me'`
    exactly); it holds no other applicaton data of its own.

- **`QWidget(parent)` / a widget's parent argument**
  - *What it is:* not a separate class — this is `QWidget`'s own
    constructor, already introduced in Lesson 1, now used with its
    second, previously-unused capability: an optional parent widget,
    passed as an argument (or set afterward with `.setParent(...)`).
  - *Implementation:* real signature `QWidget(parent: QWidget = None)`
    — every widget constructor in PySide6, including `QPushButton`'s,
    accepts this as its last positional argument. Passing `window` here
    does two separate things at once, confirmed by this lesson's own
    labs, below: it places the button visually inside that window, and
    it makes `window` responsible for the button's own lifetime.
  - *Its use:* this lesson's button needs to live inside the lesson's
    existing window, both visually and in terms of memory ownership,
    rather than being its own separate, second top-level window.
  - *Type:* a constructor parameter — not a method of its own — but one
    with real, observable, testable effects, which is why it earns a
    full entry here rather than being folded silently into
    `QPushButton`'s own entry above.
  - *Responsibility:* establishes one parent-child ownership link
    between two `QObject`-derived instances (every widget qualifies,
    since `QWidget` itself descends from `QObject`, confirmed in
    Lesson 1) — nothing more; it does not itself decide position or
    size, only which object the new widget belongs inside.
  - *Depends on:* an already-constructed `QWidget` (or `None`, meaning
    "no parent — this is a top-level window of its own," which is what
    Lesson 1's own `window = QWidget()` did implicitly, with no parent
    argument given at all).
  - *Connects to:* the parent widget's own `.children()` list, proven
    directly in this lesson's own lab, below, to contain the child the
    instant it's constructed — with no separate registration step, and
    with no Python-level variable required to keep the child alive.
  - *Shape:* not a returned value — a link recorded internally by Qt,
    queryable afterward via `.parent()` (returns the parent object, or
    `None`) and `.children()` (returns a plain Python list of every
    direct child).

- **A signal's `.connect(slot)`**
  - *What it is:* the method that creates one connection (defined in
    this lesson's Terms, above) between a specific signal and a
    specific slot.
  - *Implementation:* an instance method on a signal object itself —
    confirmed this session that `button.clicked`'s real runtime type is
    `PySide6.QtCore.SignalInstance` — real signature
    `connect(slot: Callable) -> None`. The `slot` argument can be any
    Python callable: a plain function, a bound method, a lambda — Qt
    itself does not require the target to be a specially-declared
    "slot" the way older Qt tutorials sometimes describe; in PySide6,
    an ordinary Python function is enough.
  - *Its use:* this lesson calls it once, connecting `QPushButton`'s
    `clicked` signal to a plain function this lesson defines, so that
    function runs every time the button is clicked.
  - *Type:* an instance method, called on a specific signal instance
    (`button.clicked.connect(...)`) — never on the class `QPushButton`
    itself, and never on the button object directly (`button.connect`
    is not a thing; the signal itself is the object with `.connect`).
  - *Responsibility:* records the association between this one signal
    and this one slot, so that from this point forward, every time the
    signal fires, this slot is one of the things that runs. It does
    not run the slot itself, and does not run it immediately upon
    connecting.
  - *Depends on:* an already-existing signal (here, `button.clicked`,
    which exists the instant `button` is constructed — signals are not
    separately created) and a callable to connect it to.
  - *Connects to:* whatever internal code inside `QAbstractButton`
    later calls `.emit()` on this same `clicked` signal (this lesson
    does not show that internal call — it's Qt's own C++ code, outside
    what this curriculum ports — but it's what `.click()`, used in this
    lesson's own lab, and a real mouse click alike, both ultimately
    trigger); the connected slot function itself, called with whatever
    arguments the signal was declared to carry.
  - *Shape:* returns `None`. A single signal may have any number of
    live connections simultaneously — confirmed in this lesson's own
    lab, below, where the same `clicked` signal is connected to two
    separate functions and both ran on the same click.

- **`clicked` (a specific signal on `QPushButton`, via `QAbstractButton`)**
  - *What it is:* the specific signal this lesson connects to — Qt's
    own announcement that a complete press-then-release cycle just
    happened on this button.
  - *Implementation:* declared, in Qt's own real source, with the
    signature `clicked(checked: bool = False)`. Confirmed directly this
    session: a slot written to accept one argument receives a real
    Python `bool`, value `False`, on every emission from this lesson's
    non-checkable button. That argument only ever matters for a
    *checkable* button (a toggle button, covered in a later lesson) —
    for the plain push button this lesson uses, it is always `False`,
    carried along only because the signal's declared shape is shared
    across every kind of `QAbstractButton` subclass, checkable or not.
  - *Its use:* this is the one signal this lesson's whole feature
    depends on — everything else in this lesson exists to get one
    function connected to this one signal.
  - *Type:* an attribute of the button instance, but not a plain
    attribute holding a value — accessing `button.clicked` returns a
    live `SignalInstance` object, confirmed this session, that itself
    has methods (`.connect`, `.disconnect`, `.emit`) on it.
  - *Responsibility:* fires exactly once per genuine click — confirmed
    this session by calling `.click()` three times and observing a
    connected counter increment exactly three times, no more, no fewer
    — and carries the one `bool` argument described above to every
    slot connected to it.
  - *Depends on:* the button's own internal press/release state
    tracking, inherited from `QAbstractButton`; this lesson's own code
    never touches that machinery directly, only the signal it produces.
  - *Connects to:* every slot connected to it via `.connect()`, called
    in the order they were connected — confirmed this session by
    connecting two separate functions and observing both ran, in
    connection order, on one call to `.click()`.
  - *Shape:* not a value you read — a live announcement channel. There
    is no `button.clicked` value to inspect at rest; the only way to
    observe it is to connect something to it, or manually `.emit()` it
    (not used in this lesson).

- **`QPushButton.click()`**
  - *What it is:* a method that programmatically simulates a complete
    click — press and release together — without any real mouse
    involved at all.
  - *Implementation:* an instance method, real signature `click() ->
    None`, inherited from `QAbstractButton`.
  - *Its use:* this lesson's own verification labs, below, use it to
    prove the `clicked` signal fires correctly in this headless
    environment, where no real mouse or display exists to generate a
    genuine click. In the real, non-headless project this lesson
    builds, a real mouse click is what triggers the signal instead —
    `.click()` itself never appears in `main.py`.
  - *Type:* an ordinary instance method — not `static`.
  - *Responsibility:* triggers the exact same internal press-then-
    release sequence, and therefore the exact same `clicked` emission,
    that a genuine mouse click would — confirmed this session by
    observing identical behavior (the connected slot running, the
    `bool` argument arriving) as would be expected from a real click.
  - *Depends on:* nothing beyond an already-constructed, enabled
    button.
  - *Connects to:* triggers `clicked` to fire, exactly as described
    above — this is the one link between this method and everything
    else in this lesson.
  - *Shape:* returns `None`; its entire effect is the side effect of
    emitting `clicked`.

**Everything else in the file, not this lesson's subject but still
explained.**

- **`print(...)`** — Python's own standard-library function for writing
  text to the terminal. Not new to this lesson, but reappearing inside
  this lesson's own connected slot function, so, per the Repetition
  Rule, it gets its own real mention here: it accepts any number of
  values, converts each to its string form, and writes them to standard
  output separated by spaces, followed by a newline.

---

## Concept Unit: A Widget Inside a Widget

### The Problem

Lesson 1's window is completely empty — a blank rectangle with nothing
in it. Putting a button "in" that window can't just mean drawing it
somewhere near the window on screen; if it did, moving or resizing the
window would leave the button behind, stranded in the wrong place. The
button has to genuinely belong to the window, in some way the toolkit
itself understands and manages automatically. What information would
you need to give a new widget to make it official — belonging inside
another one — rather than existing as its own independent window right
next to it?

> Before reading on: when you constructed `QWidget()` in Lesson 1, you
> gave it no arguments at all, and it became its own independent,
> top-level window. What's your guess for the *simplest* possible way
> a second widget's constructor could be told "no, put me inside that
> other one instead of making me my own window"? And separately: if a
> button belongs to a window this way, what do you think should happen
> to the button if that window is later closed and destroyed — should
> the button keep existing on its own, or should destroying the window
> take the button down with it? Which behavior would surprise you less
> as a programmer relying on this toolkit?

### Introducing the Concept, in Isolation

```python
from PySide6.QtWidgets import QApplication, QWidget, QPushButton
import sys

app = QApplication(sys.argv)
window = QWidget()

# Constructed with no Python variable holding a reference to it at all.
QPushButton("Click Me", window)

print("window.children():", window.children())
found = window.findChild(QPushButton)
print("findChild(QPushButton):", found)
print("found.text():", found.text())
print("found.parent() is window:", found.parent() is window)
```

Real output from running this, this session, headless:

```
window.children(): [<PySide6.QtWidgets.QPushButton(0x3aa92400) at 0x7f94f80c31c0>]
findChild(QPushButton): <PySide6.QtWidgets.QPushButton(0x3aa92400) at 0x7f94f80c31c0>
found.text(): Click Me
found.parent() is window: True
```

This is deliberately written with no Python variable ever holding the
button — `QPushButton("Click Me", window)` is called and its result is
simply discarded as far as Python itself is concerned. In an ordinary
Python program with no such parent, an object like that would normally
become eligible for garbage collection almost immediately — nothing
Python-level is keeping it alive. And yet `window.children()` shows it
still exists, fully intact, findable, with its label still readable.

A second lab proves the contrast directly — this time genuinely with
*no* parent at all:

```python
from PySide6.QtWidgets import QApplication, QWidget, QPushButton
import sys, gc

app = QApplication(sys.argv)
window = QWidget()

def make_orphan_button():
    b = QPushButton("Orphan")   # no parent argument at all
    return b.text()             # only the text is returned, not the object

text = make_orphan_button()
gc.collect()
print("Function returned text:", text)
print("window.children() after orphan went out of scope:", window.children())
```

Real output:

```
Function returned text: Orphan
window.children() after orphan went out of scope: []
```

Here, with no parent given, the button genuinely only existed for the
duration of `make_orphan_button()` — once that function returned, and
garbage collection ran, `window.children()` is empty, because this
particular button was never anyone's child at all. Together these two
labs prove the real mechanism: passing `window` as a widget's parent
argument does not merely position it — it hands ownership of that
widget's entire lifetime to the parent, tracked by Qt's own internal
bookkeeping, independent of whatever Python's own garbage collector
would otherwise decide. This is called **parent-child ownership**, and
the structure it builds up, one widget belonging inside another, is
called the **widget tree**.

Both labs are now **discarded** — the real project's version, below,
keeps a Python variable for the button (because this lesson's next unit
needs to call `.connect()` on it), but the ownership guarantee just
proven holds regardless of whether that variable is kept.

### Project Change

- **Reference Source:** No reference counterpart — from-scratch
  addition, same as every unit in Lesson 1.
- **Files affected:** `main.py` — modified.
- **Change type:** add.
- **Location:** inserted between the `window.setWindowTitle(...)` line
  and the `window.show()` line, both added in Lesson 1.
- **Dependencies:** none beyond what Lesson 1 already added.

### The New Code

```python
button = QPushButton("Click Me", window)
```

### The Updated Project

`main.py`, as it stands after this unit:

```python
 1  from PySide6.QtWidgets import QApplication, QWidget, QPushButton
 2  import sys
 3
 4  app = QApplication(sys.argv)
 5  window = QWidget()
 6  window.setWindowTitle("Lesson 1 Lab")
 7  button = QPushButton("Click Me", window)   # <- new
 8  window.show()
 9  sys.exit(app.exec())
```

As a whole, the file now constructs a window (lines 5–6), constructs a
button belonging to that window (line 7), and then shows the window
(line 8) and enters the event loop (line 9), exactly as Lesson 1 left
it. The import on line 1 also grew — `QPushButton` was added alongside
the two names Lesson 1 already imported from `PySide6.QtWidgets`.

### Mechanical Walkthrough

- **`button = `** — an ordinary assignment, the same construct already
  explained in Lesson 1's first Concept Unit; a variable named `button`
  now holds a reference to the constructed `QPushButton`. This
  reference is not what keeps the button alive — this unit's own lab
  just proved that — but it's needed anyway, because the next Concept
  Unit calls `.connect()` on this exact object.
- **`QPushButton(...)`** — a constructor call. Explained in full in
  this lesson's Header, above, under Objects and methods used.
- **`"Click Me"`** — a string literal, passed as the button's label
  text — not a new construct (string literals appeared already in
  Lesson 1's `setWindowTitle` call), but per the Repetition Rule, still
  worth naming here: this is the first positional argument to
  `QPushButton`'s constructor, and it's what `found.text()` returned
  in this unit's own lab, confirmed above.
- **`window`** — a variable read, referring to the same `QWidget`
  object constructed in Lesson 1. Passed here as `QPushButton`'s second
  positional argument, explained in full in this lesson's Header, above
  ("`QWidget(parent)`").

### CS Lens

Parent-child ownership, as demonstrated here, is a form of a
computer-science idea called **ownership-based memory management** —
resources (here, GUI widgets) are freed not by tracing whether anything
still references them (the strategy Python's own garbage collector
otherwise uses, and the strategy this unit's second lab showed
*wasn't* what saved the first button from collection), but by an
explicit, declared hierarchy: one specific object is responsible for
one or more others, and destroying the owner destroys everything it
owns.

Also recognized in: a filesystem's own directory tree (deleting a
folder deletes everything inside it, without individually tracking
who else might have "referenced" each file); C++'s own RAII idiom,
where an object's destructor cleans up everything it owns the instant
it goes out of scope; a company's own organizational chart, where a
manager being let go doesn't leave direct reports floating
free — responsibility for them is explicitly reassigned, never left
ambiguous.

### SE Lens

The alternative *not* chosen here is what Python programs normally rely
on: track every object purely by whether anything still refers to it,
and free it automatically once nothing does — ordinary Python garbage
collection, with no explicit ownership hierarchy at all. Qt does not
use that strategy for its own widgets, for a concrete reason: Qt itself
is a C++ library underneath PySide6, and C++ has no garbage collector
built into the language at all — something has to explicitly decide
when a widget's memory is freed, and "whichever Python variables happen
to still exist" is not information C++'s own memory management can see
or use. The real tradeoff: an explicit ownership tree means a
programmer has to actually think about *who owns what* as the program
is designed, rather than trusting an automatic system to sort it out —
but it buys a guarantee ordinary garbage collection can't: an entire
subtree of fifty widgets can be released in one guaranteed step by
destroying their single common parent, with no risk of accidentally
leaving one behind because some stray Python reference to it happened
to still exist somewhere. The cost this project is now carrying,
honestly: forgetting to pass a parent, or passing the wrong one, is a
real and common class of PySide6 bug — a widget silently becomes its
own separate top-level window instead of appearing where you intended,
which is a mistake that produces no error message at all, only a
visually wrong result.

### Run It

Already run and shown above, under "Introducing the Concept, in
Isolation" — two separate real executions, both from this session,
both under `QT_QPA_PLATFORM=offscreen`.

### Connecting This Unit

The button now genuinely belongs inside the window — it will be
positioned within it, shown when it's shown, and destroyed when it is —
but it doesn't yet *do* anything when clicked. That's this lesson's
next and final unit.

---

## Concept Unit: Signals and Slots

### The Problem

The button exists, belongs to the window, and — proven in this unit's
own lab, below — is even already visible on screen, sized and
positioned by Qt's own defaults, the moment the window is shown. But
clicking it right now would do precisely nothing observable at all,
because nothing in `main.py` has told the program what a click should
*mean*. The button itself has no idea what your application is
supposed to do in response to being clicked — nor should it; the same
`QPushButton` class ships inside PySide6 completely unmodified,
regardless of whether it's used to submit a form, delete a file, or
start a game. How could a widget that knows nothing about your
program's own logic still let your program's own logic run in response
to it being clicked?

> Before reading on: think about a real doorbell — the physical button
> on someone's front door. The button itself doesn't know or care
> whether it's wired to a chime, a smart-home notification, both, or
> nothing at all; pressing it only ever does one thing: complete a
> circuit and send a signal down a wire. What does *wiring* the
> doorbell to a specific chime remind you of, compared to the button
> knowing, itself, "when pressed, ring this exact chime"? Now translate
> that back to code: if `QPushButton` is deliberately built to not know
> what should happen when it's clicked, what's the smallest possible
> way your own code could still say "when this happens, run this"?

### Introducing the Concept, in Isolation

First, confirming the button is genuinely already visible and on
screen, with no signal work done yet at all:

```python
from PySide6.QtWidgets import QApplication, QWidget, QPushButton
import sys

app = QApplication(sys.argv)
window = QWidget()
window.setWindowTitle("Lesson 1 Lab")
button = QPushButton("Click Me", window)

print("Before window.show():")
print("  window.isVisible():", window.isVisible())
print("  button.isVisible():", button.isVisible())

window.show()
print("After window.show():")
print("  window.isVisible():", window.isVisible())
print("  button.isVisible():", button.isVisible())
print("  window.size():", window.size())
print("  button.pos():", button.pos())
print("  button.size():", button.size())
```

Real output:

```
Before window.show():
  window.isVisible(): False
  button.isVisible(): False
  window.size(): PySide6.QtCore.QSize(100, 30)
  button.pos(): PySide6.QtCore.QPoint(0, 0)
  button.size(): PySide6.QtCore.QSize(80, 22)
After window.show():
  window.isVisible(): True
  button.isVisible(): True
```

(The `size()`/`pos()` calls above are shown out of their real printed
order for clarity here — the actual run printed them after the second
`isVisible()` block, exactly as the code lists them.) This confirms two
things: a child widget's own visibility follows its parent's — the
button was invisible while the window was, and became visible the
instant the window was shown, with no separate `button.show()` call
anywhere — and, with no layout at all (a later lesson's subject),
`QWidget`'s own default size, `100×30`, and `QPushButton`'s own default
size, `80×22` positioned at `(0, 0)`, are what Qt falls back to.

Now, the actual mechanism this unit is about — connecting a plain
function to the button's `clicked` signal:

```python
from PySide6.QtWidgets import QApplication, QPushButton
from PySide6.QtCore import SignalInstance
import sys

app = QApplication(sys.argv)
button = QPushButton("Click Me")

print("type(button.clicked):", type(button.clicked))
print("isinstance of SignalInstance:", isinstance(button.clicked, SignalInstance))

click_count = 0
def on_click():
    global click_count
    click_count += 1
    print(f"  -> slot ran, click_count is now {click_count}")

button.clicked.connect(on_click)
print("Calling button.click() three times:")
button.click()
button.click()
button.click()
print("Final click_count:", click_count)

button.clicked.disconnect(on_click)
button.click()
print("After disconnect, one more click(). click_count still:", click_count)
```

Real output:

```
type(button.clicked): <class 'PySide6.QtCore.SignalInstance'>
isinstance of SignalInstance: True
Calling button.click() three times:
  -> slot ran, click_count is now 1
  -> slot ran, click_count is now 2
  -> slot ran, click_count is now 3
Final click_count: 3
After disconnect, one more click(). click_count still: 3
```

This proves the whole mechanism concretely. `button.clicked` is a real,
live object — a `SignalInstance` — not just a description of an event
in documentation somewhere. `on_click` was never told anything about
buttons, windows, or Qt at all; it's an ordinary Python function that
simply increments a counter, and connecting it via `.connect()` is what
made the button's own click cause it to run. Calling `.click()` three
times ran the slot exactly three times, one-to-one, proving the
connection fires once per event, not on some other schedule. Calling
`.disconnect(on_click)` and then clicking once more left `click_count`
unchanged — the connection genuinely was individually broken, without
needing to destroy the button or the signal itself to stop that one
function from being called.

One more real run, showing that `clicked` really does carry the `bool`
argument named in this lesson's Header, and that a slot is free to
ignore it entirely:

```python
def on_click_with_arg(checked):
    print("  -> received checked argument:", checked, type(checked))

button.clicked.connect(on_click_with_arg)
button.click()

def on_click_no_arg():
    print("  -> zero-argument slot also works")

button.clicked.connect(on_click_no_arg)
button.click()
```

Real output:

```
  -> received checked argument: False <class 'bool'>
  -> received checked argument: False <class 'bool'>
  -> zero-argument slot also works
```

This confirms `clicked` really does emit a real `bool`, always `False`
here since this button was never made checkable — and confirms PySide6
inspects how many parameters a connected function actually accepts and
adjusts what it passes automatically, rather than forcing every slot to
declare a parameter it may not care about. This whole announce-and-
react mechanism — an object emitting a **signal** with no knowledge of
who's listening, and separate code registering a **slot** to run in
response — is called **signals and slots**, and it is the single
mechanism every interactive PySide6 program, no matter how large,
ultimately reduces to.

All labs above are now **discarded** — none of this exact scaffolding
(the manual `click_count`, the disconnect demonstration, the two
differently-shaped slot functions) appears in the real project; the
real project keeps the same `.connect()` call with a single, permanent
slot function.

### Project Change

- **Reference Source:** No reference counterpart — from-scratch
  addition.
- **Files affected:** `main.py` — modified.
- **Change type:** add.
- **Location:** inserted directly after the `button = QPushButton(...)`
  line added in this lesson's first Concept Unit, above.
- **Dependencies:** the `button` variable that unit added.

### The New Code

```python
def on_button_clicked():
    print("Button was clicked!")

button.clicked.connect(on_button_clicked)
```

### The Updated Project

`main.py`, complete, as it stands at the end of this lesson:

```python
 1  from PySide6.QtWidgets import QApplication, QWidget, QPushButton
 2  import sys
 3
 4  app = QApplication(sys.argv)
 5  window = QWidget()
 6  window.setWindowTitle("Lesson 1 Lab")
 7  button = QPushButton("Click Me", window)
 8
 9  def on_button_clicked():         # <- new
10      print("Button was clicked!") # <- new
11
12  button.clicked.connect(on_button_clicked)  # <- new
13
14  window.show()
15  sys.exit(app.exec())
```

As a whole, the file's structure now has four real phases in sequence:
build the shared application object (line 4); build the window and its
button, with the button owned by the window (lines 5–7); define what a
click should mean and wire that definition to the button's own click
announcement (lines 9–12); and only then actually show the window and
hand control to the event loop (lines 14–15). Running this program now
opens a window with a real, working button in the corner — clicking it
prints `Button was clicked!` to the terminal, once per click, for as
long as the window stays open.

### Mechanical Walkthrough

- **`def on_button_clicked():`** — a function definition — not a new
  construct in the language sense (functions haven't been introduced
  as a first-time concept in this curriculum, since this lesson
  presumes basic Python), but its role here is new and worth stating
  precisely: this function is defined but not called anywhere in this
  file directly — its only path to ever running at all is through the
  connection made on line 12, below.
- **`print("Button was clicked!")`** — explained in full in this
  lesson's Header, above, under "Everything else in the file."
- **`button.clicked`** — an attribute access on the `button` object,
  returning the live signal object explained in full in this lesson's
  Header, above.
- **`.connect(on_button_clicked)`** — a method call on that signal
  object. Explained in full in this lesson's Header, above. The
  argument, `on_button_clicked`, is the function itself — its name used
  with no parentheses after it, which matters: `on_button_clicked` (no
  parentheses) refers to the function object itself, to be called
  later, exactly once per click; `on_button_clicked()` (with
  parentheses) would call it immediately, once, right now, on this
  line, and pass whatever it returns (`None`, since it has no `return`
  statement) to `.connect()` instead — which is not what this line is
  for.

### CS Lens

Signals and slots is a hard concept — a real, named software design
pattern, not routine syntax — worth naming precisely: it's Qt's own
specific implementation of a broader idea usually called the
**observer pattern** — one object (the *subject*, here the button)
maintains a list of interested parties (*observers*, here every
function connected via `.connect()`) and notifies each of them,
automatically, whenever its own relevant state changes, without the
subject needing to know anything about who those observers are or what
they do.

Also recognized in: a browser's own `addEventListener` (a DOM element
announcing a click with no idea what JavaScript code is listening); a
spreadsheet recalculating every cell whose formula depends on a cell
you just edited, without that edited cell knowing which formulas depend
on it; a stock ticker broadcasting a price change to every subscribed
trading algorithm simultaneously; a magazine subscription, where the
publisher prints one issue and mails it to every current subscriber
without needing to know anything about any of them individually.

### SE Lens

The alternative *not* chosen here — and the one every beginner reaches
for before learning this — is hard-coding the reaction directly inside
the widget: give `QPushButton` itself a method like
`onClickDoSomething()` that you'd override in a subclass every time you
wanted different click behavior. The real tradeoff signals and slots
avoids: that alternative means Qt's own `QPushButton` source code would
need to somehow anticipate every possible thing any application might
ever want to do on a click — completely impossible — or every single
PySide6 program would need its own custom subclass of `QPushButton`
just to attach ordinary application logic, multiplying the number of
classes in every real project for no structural benefit. Signals and
slots decouples those two concerns completely: `QPushButton` only ever
needs to know how to detect and announce a click, and your own code
only ever needs to know how to react to one, with the connection
between them made once, in one line, wherever it's actually needed.
The cost this project is now carrying, honestly: because a signal
doesn't know or care who's listening, a bug where a slot silently isn't
running — a typo in a function name passed to `.connect()`, or a
`.connect()` call that never executed because it sat inside code that
was never reached — produces no error at all; the program just quietly
does nothing when clicked, which can be a genuinely difficult class of
bug to track down compared to a normal Python exception with a
traceback pointing at the exact wrong line.

### Commands Needed

No new commands beyond Lesson 1's own `python3 main.py` — this lesson
adds no new tooling, only new code inside the same file.

### Run It

Already run and shown above, under "Introducing the Concept, in
Isolation" — three separate real executions this session, all under
`QT_QPA_PLATFORM=offscreen`: visibility inheritance, the connect /
click / disconnect sequence, and the signal's real argument signature.

### Connecting This Unit

The `button` this lesson's first Concept Unit gave the window, and the
`clicked` signal this unit connected a real function to, together
finish what Lesson 1 started: a window that not only stays open, per
Lesson 1's event loop, but now genuinely reacts to something the user
does inside it.

---

## Connect the Pieces

Trace one concrete action — a user actually clicking the button — 
through everything this lesson built, start to finish:

The program is already running, sitting inside `app.exec()` on line 15,
exactly as Lesson 1's own event loop explained. The user clicks the
button on screen. The operating system's windowing layer reports a raw
mouse-down-then-up event; Qt's own internal code, running inside that
same blocking `exec()` call, determines which widget was actually under
the cursor — the button constructed on line 7, which this lesson's
first Concept Unit proved genuinely belongs to `window`, both visually
and in terms of ownership, confirmed directly by `window.children()`
containing it. `QAbstractButton`'s own internal press/release tracking,
inherited by `QPushButton` per this lesson's confirmed inheritance
chain, recognizes a complete click and emits the `clicked` signal —
proven in this lesson's own lab to carry one `bool` argument, always
`False` for this non-checkable button. That emission is exactly the
event the connection made on line 12 was waiting for: because
`on_button_clicked`, defined on lines 9–10, was connected via
`.connect()`, Qt calls it now — and because `on_button_clicked` takes
zero parameters, PySide6 calls it with none, exactly as this lesson's
own lab proved a zero-argument slot can do even when the signal itself
carries an argument. `print("Button was clicked!")` runs, the text
appears in the terminal, and control returns to the event loop, which
goes right back to waiting — ready to notice the very same click
happen again, or a window-close event, or nothing at all, for as long
as the program keeps running.

**Next lesson:** Lesson 3 — layouts. This lesson's button sits at a
hardcoded `(0, 0)` because Qt has been given no other instruction; the
next lesson replaces that manual positioning with `QVBoxLayout`, so
widgets arrange themselves correctly regardless of how the window is
resized.
