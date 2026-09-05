# Lesson 3: Letting the Toolkit Do the Arranging

**What you will build.** A second widget — a status label — is added
above the Lesson 2 button, and both are handed to a layout object
instead of being positioned by hand. Clicking the button now updates
the label's own text. The transferable problem this lesson is actually
about: Lesson 2's button sat at a hardcoded `(0, 0)` only because
nothing else was competing for space in the window. The instant a
second widget needs to share that same window, "where does each widget
go" stops being a question you can answer once and forget — it has to
be answered continuously, every time the window is resized, every time
a widget's own content changes size. This lesson replaces manual
positioning with an object whose entire job is answering that question
automatically, forever, so your own code never has to.

**What you need to know first.** Lesson 1's `QApplication`, `QWidget`,
and the event loop. Lesson 2's parent-child ownership (the widget tree)
and signals and slots — specifically `QPushButton`'s `clicked` signal
and `.connect()`.

**Terms used in this lesson**

- **Layout** — an object whose job is to calculate the position and
  size of every widget inside a parent widget, and to recalculate all
  of them automatically whenever anything relevant changes — the
  parent being resized, a child widget's own preferred size changing,
  a child being added or removed. Exists because manual positioning,
  the strategy Lesson 2 used by simply accepting Qt's leftover default
  of `(0, 0)`, cannot scale past one widget: the moment a second widget
  needs space in the same window, someone has to decide, continuously,
  who goes where — and a layout is Qt's own answer to "that someone
  should not have to be you, doing arithmetic by hand, every time
  anything changes."
- **Content margin** — the empty space a layout leaves between the
  outer edge of the widget it's attached to and the widgets it arranges
  inside that widget. Exists so widgets don't visually touch the very
  edge of the window they live in by default, which would look cramped
  regardless of what's inside.
- **Spacing** — the empty space a layout leaves *between* the widgets
  it arranges, distinct from the margin around the whole group. Exists
  as a separate, independently controllable value from the margin,
  because "space around the group" and "space between members of the
  group" are two different visual decisions a layout author might want
  to make differently.

**Objects and methods used**

- **`QVBoxLayout`**
  - *What it is:* a layout that arranges the widgets given to it in a
    single vertical column, top to bottom, in the order they were
    added.
  - *Implementation:* a class in `PySide6.QtWidgets`, constructed here
    as `QVBoxLayout()`, with no required arguments. Its real
    inheritance chain, confirmed this session —
    `QVBoxLayout → QBoxLayout → QLayout → QObject → QLayoutItem →
    Object → object` — is worth reading carefully for what it
    *doesn't* contain: no `QWidget` anywhere in it. A layout is not
    itself a visible thing — it has no pixels of its own, cannot be
    clicked, and cannot be given a parent the way a widget can; it is
    a pure organizer, one specific `QLayoutItem` among potentially
    many (each widget it manages is wrapped in its own `QLayoutItem`
    too, which is what `QBoxLayout`'s own base class name reveals).
  - *Its use:* this lesson needs its two widgets — a label and a
    button — stacked vertically, in a fixed reading order, and
    `QVBoxLayout` is the specific layout class whose entire job is
    exactly that arrangement.
  - *Type:* a class, instantiated once in this lesson's code — an
    ordinary object once constructed, not a `static` method, and,
    per the point above, not a widget.
  - *Responsibility:* tracks an ordered list of widgets (and,
    optionally, other nested layouts, not used in this lesson) and
    computes each one's real on-screen position and size, top to
    bottom, whenever it's asked to — confirmed this session by
    `layout.count()` correctly reporting `2` after two `addWidget()`
    calls, and `layout.itemAt(...)` correctly returning each widget in
    the exact order it was added.
  - *Depends on:* nothing to construct; but to have any visible effect
    at all, it depends on being attached to a real widget via that
    widget's own `.setLayout(...)` method, covered below — confirmed
    this session that a `QVBoxLayout` with widgets added to it but
    never attached this way leaves those widgets permanently invisible,
    even when the intended parent window is itself shown.
  - *Connects to:* your own code calls `.addWidget(...)` on it to add
    each widget, and `window.setLayout(layout)` to attach the whole
    thing to a real widget; internally, once attached, it's the layout
    — not your own code — that ends up calling each managed widget's
    real position- and size-setting methods, every time a recalculation
    is needed.
  - *Shape:* one object per group of widgets being arranged together;
    holds an ordered list internally, confirmed this session via
    `.count()` and `.itemAt(index)`, not a dictionary or anything
    keyed by name.

- **`QVBoxLayout.addWidget(widget)`**
  - *What it is:* the method that adds one widget to a layout's own
    managed list.
  - *Implementation:* an instance method, real signature
    `addWidget(widget: QWidget) -> None`, inherited from `QBoxLayout`.
  - *Its use:* this lesson calls it twice — once for the label, once
    for the button — in the exact order they should appear top to
    bottom.
  - *Type:* an ordinary instance method, called on a specific layout
    object (`layout.addWidget(...)`) — not `static`.
  - *Responsibility:* records that this widget is now one of the ones
    this layout is responsible for arranging, and remembers the order
    it was added in — nothing more. Confirmed this session: calling it
    does **not**, by itself, change the widget's parent — a widget
    added via `addWidget()` but never attached to a real widget via
    `setLayout()` was confirmed this session to still report
    `.parent()` as `None`.
  - *Depends on:* an already-constructed widget to add.
  - *Connects to:* the layout's own internal ordered list, later read
    back by `.count()` and `.itemAt(...)`, both used in this lesson's
    own verification lab, below, to prove the order was preserved.
  - *Shape:* returns `None`. Calling it repeatedly grows the layout's
    internal list by one widget each time — it does not replace
    anything already added.

- **`QWidget.setLayout(layout)`**
  - *What it is:* the method that attaches a layout object to a real,
    visible widget, making that layout responsible for arranging that
    widget's own children.
  - *Implementation:* an instance method on `QWidget` (already
    introduced in Lesson 1), real signature
    `setLayout(layout: QLayout) -> None`.
  - *Its use:* this lesson calls it once, attaching the `QVBoxLayout`
    holding the label and button to `window` itself, which is the step
    that actually makes the arrangement take effect.
  - *Type:* an ordinary instance method, called on the widget being
    given the layout (`window.setLayout(layout)`) — not `static`, and
    notably called on the *widget*, not on the layout — a detail worth
    stating because it's easy to expect it the other way around.
  - *Responsibility:* this is the step that does the real, observable
    work — confirmed directly this session, by checking a button's
    `.parent()` at three separate points: `None` right after
    construction, still `None` right after `layout.addWidget(button)`,
    and only becoming the real window object *after*
    `window.setLayout(layout)` ran. `setLayout` is what reassigns
    every widget already added to the layout so that the widget
    calling `setLayout` becomes their real parent — `addWidget`, by
    contrast, only ever updates the layout's own internal bookkeeping.
  - *Depends on:* a `QLayout` (or one of its subclasses, like this
    lesson's `QVBoxLayout`) that has already had its widgets added to
    it — though, as this lesson's own lab shows, calling it before or
    after `addWidget()` calls has the same eventual effect, since
    `addWidget()`'s own job (remembering the list and order) is
    independent of when parenting actually happens.
  - *Connects to:* every widget the given layout has been told about
    via `addWidget()`; from this call forward, resizing `window`, or
    any managed widget's own preferred size changing, is what triggers
    the layout to recompute positions — not any code this lesson writes
    directly.
  - *Shape:* returns `None`. A widget can only have one layout set on
    it at a time — `setLayout` replaces, rather than adds to, whatever
    layout (if any) was previously set.

- **`QLabel`**
  - *What it is:* a widget whose entire purpose is displaying a short
    piece of read-only text (or, not used in this lesson, an image).
  - *Implementation:* a class in `PySide6.QtWidgets`, constructed here
    as `QLabel("Status: idle")`. Its real inheritance chain, confirmed
    this session — `QLabel → QFrame → QWidget → QObject → QPaintDevice
    → Object → object` — introduces one new intermediate parent class
    not yet seen in this curriculum, `QFrame` (adds optional border and
    panel-style drawing, not used by this lesson, flagged here, not
    explained) — under which it is, like every widget so far, a real
    `QWidget`, with everything Lesson 1 and 2 already established about
    `QWidget` fully intact.
  - *Its use:* this lesson needs something to display a short status
    message that changes when the button is clicked, and `QLabel` is
    the plainest widget whose entire job is exactly that.
  - *Type:* a class, instantiated once in this lesson's code.
  - *Responsibility:* displays whatever text it's currently holding,
    and nothing else — confirmed this session, it has no click
    behavior, no signal of its own comparable to `QPushButton`'s
    `clicked`; its only real state is the text it shows.
  - *Depends on:* an initial text string, passed to its constructor —
    `"Status: idle"` in this lesson's code.
  - *Connects to:* this lesson's own connected slot function calls
    `.setText(...)` on it directly, in reaction to the button's
    `clicked` signal; the layout this lesson builds is what positions
    it on screen.
  - *Shape:* one object holding one string at a time, readable and
    replaceable via `.text()` and `.setText(...)` — confirmed this
    session, `.text()` correctly reported back exactly what
    `.setText(...)` had most recently set, with no transformation of
    the string in either direction.

- **`QLabel.setText(text)`**
  - *What it is:* the method that replaces a label's currently
    displayed text with new text.
  - *Implementation:* an instance method, real signature
    `setText(text: str) -> None`.
  - *Its use:* this lesson's own click-handling function calls it to
    change the label from `"Status: idle"` to a message reporting how
    many times the button has been clicked.
  - *Type:* an ordinary instance method — not `static`, requires a real
    `QLabel` instance to call it on.
  - *Responsibility:* replaces the label's own internal text and
    triggers it to redraw itself on screen with the new text — nothing
    else; confirmed this session across three consecutive calls (one
    click, then two more), each one correctly reflected by `.text()`
    immediately afterward with no delay or batching observed.
  - *Depends on:* a plain Python string.
  - *Connects to:* called from inside this lesson's `on_button_clicked`
    slot function — the same function this lesson's Concept Unit 2
    connects to the button's `clicked` signal, tying this lesson's new
    material directly to Lesson 2's signal/slot mechanism.
  - *Shape:* returns `None`; its effect is entirely the side effect of
    changing what `.text()` will report afterward.

**Everything else in the file, not this lesson's subject but still
explained.**

- **f-string (`f"..."`)** — Python's own string-formatting syntax,
  where an expression inside `{ }` is evaluated and inserted directly
  into the surrounding string. This lesson's own click-counting slot
  uses `f"Status: clicked {click_count} time(s)"` to build a new label
  string each time, with `click_count`'s current value inserted
  directly into the text.
- **`global`** — a Python keyword that tells a function to modify a
  variable defined outside itself, at module level, rather than
  creating a new, function-local variable with the same name. This
  lesson's click-counting slot uses it because `click_count` needs to
  persist and accumulate across every separate call to the slot, not
  reset back to its starting value every time the function runs.

---

## Concept Unit: A Layout, Attached to a Window

### The Problem

Lesson 2's button sits at `(0, 0)`, hardcoded by Qt's own fallback
behavior, because it was the only widget in the window and nothing else
was competing for space. The moment a second widget needs to live in
that same window — this lesson's upcoming status label — that
free-for-all stops working: something has to decide which widget goes
where, and what happens to that arrangement if the window is resized.
Writing that arithmetic yourself — "the label goes at y=10, the button
ten pixels below the label's own height, recalculated every time either
one changes" — is exactly the kind of bookkeeping code tends to get
wrong the first time and break silently the second time something
nearby changes.

> Before reading on: if you had to solve this with plain Python and
> nothing Qt-specific — position two rectangles, one above the other,
> inside a bigger rectangle, with some breathing room around and
> between them — what values would you actually need to know to
> compute the second rectangle's y-position? Now think about what has
> to happen to that computation the instant the window is resized, or
> the first rectangle's own height changes because its text got longer.
> Does your computation still work, or does it need to run again? What
> does that tell you about whether this is a "compute it once" problem
> or a "recompute it every time something changes" problem?

### Introducing the Concept, in Isolation

```python
from PySide6.QtWidgets import QApplication, QWidget, QPushButton, QVBoxLayout
import sys

app = QApplication(sys.argv)
window = QWidget()
window.setWindowTitle("Lesson 1 Lab")

button = QPushButton("Click Me")
print("button.parent() before any layout:", button.parent())

layout = QVBoxLayout()
print("type(layout):", type(layout))
layout.addWidget(button)
print("button.parent() after layout.addWidget():", button.parent())

window.setLayout(layout)
print("button.parent() after window.setLayout():", button.parent())
print("button.parent() is window:", button.parent() is window)

window.show()
print("window.size():", window.size())
print("button.pos():", button.pos())
print("button.size():", button.size())
```

Real output from running this, this session, headless:

```
button.parent() before any layout: None
type(layout): <class 'PySide6.QtWidgets.QVBoxLayout'>
button.parent() after layout.addWidget(): None
button.parent() after window.setLayout(): <PySide6.QtWidgets.QWidget(0x34b6cae0) at 0x7f9a2bed0c40>
button.parent() is window: True
window.size(): PySide6.QtCore.QSize(102, 44)
button.pos(): PySide6.QtCore.QPoint(11, 11)
button.size(): PySide6.QtCore.QSize(80, 22)
```

This deliberately constructs the button with **no** parent argument at
all — a break from Lesson 2's own `QPushButton("Click Me", window)` —
specifically to isolate exactly which call is responsible for
parenting. The three `.parent()` checks prove it precisely: still
`None` after construction (expected — no parent was given), **still**
`None` after `layout.addWidget(button)` (this is the important,
possibly surprising result — adding a widget to a layout does not, by
itself, parent it to anything), and only becoming the real `window`
object once `window.setLayout(layout)` runs. `addWidget` only ever
updates the layout's own private bookkeeping (an internal list); actual
ownership only changes hands when the layout itself is attached to a
real widget.

The position and size values are worth reading closely too:
`button.pos()` is now `(11, 11)`, not Lesson 2's hardcoded `(0, 0)` —
that `11`-pixel offset is the **content margin** this lesson's Terms
section named: empty space the layout leaves, on every side, between
the window's own edge and whatever it's arranging inside — a value
this lesson never set explicitly; it's Qt's own platform-appropriate
default, applied automatically the instant a layout is attached.

This throwaway example is now **discarded** — the real project's
version, below, goes back to giving the button its parent directly at
construction time, the same as Lesson 2 did, since this lab's whole
point — proving *when* parenting happens — doesn't need to be
re-demonstrated inside the real project itself.

### Project Change

- **Reference Source:** No reference counterpart — from-scratch
  addition, same as every unit so far.
- **Files affected:** `main.py` — modified.
- **Change type:** replace (the manual, parent-argument-only widget
  placement Lesson 2 used is being replaced by layout-managed
  placement).
- **Location:** the block between `window = QWidget()` and
  `window.show()`.
- **Dependencies:** the `window` and `button` objects, both already
  present from Lessons 1 and 2.

### The New Code

```python
layout = QVBoxLayout()
layout.addWidget(button)
window.setLayout(layout)
```

### The Updated Project

`main.py`, as it stands after this unit (the `on_button_clicked`
function and its `.connect()` call from Lesson 2 are omitted from this
intermediate snapshot only because this lesson's second Concept Unit,
below, replaces that function's own body — showing it here and again,
unchanged, immediately after would be pure repetition of a block this
lesson is about to rewrite anyway; every other line is shown in full):

```python
 1  from PySide6.QtWidgets import QApplication, QWidget, QPushButton, QVBoxLayout
 2  import sys
 3
 4  app = QApplication(sys.argv)
 5  window = QWidget()
 6  window.setWindowTitle("Lesson 1 Lab")
 7  button = QPushButton("Click Me", window)
 8
 9  layout = QVBoxLayout()      # <- new
10  layout.addWidget(button)    # <- new
11  window.setLayout(layout)    # <- new
12
13  def on_button_clicked():
14      print("Button was clicked!")
15
16  button.clicked.connect(on_button_clicked)
17
18  window.show()
19  sys.exit(app.exec())
```

As a whole, the file now positions the button through the layout system
(lines 9–11) instead of relying on Qt's own leftover default position —
even though, with only one widget, the visible difference right now is
small (the button moves from `(0, 0)` to `(11, 11)`, the content margin
this unit's lab explained). The real payoff of this change shows up in
the next Concept Unit, the moment a second widget joins the same
layout.

### Mechanical Walkthrough

- **`layout = `** — an assignment, the same construct already
  explained in Lesson 1's first Concept Unit, applied here to hold a
  reference to the newly constructed layout object.
- **`QVBoxLayout()`** — a constructor call with no arguments. Explained
  in full in this lesson's Header, above, under Objects and methods
  used.
- **`layout.addWidget(button)`** — a method call, explained in full in
  this lesson's Header, above; `button` here is a variable read,
  referring to the same `QPushButton` object constructed in Lesson 2's
  own code.
- **`window.setLayout(layout)`** — a method call, explained in full in
  this lesson's Header, above; `window` and `layout` are both variable
  reads, referring to objects already constructed earlier in this same
  file.

### CS Lens

A layout recalculating every managed widget's position whenever
something relevant changes — a resize, a widget's content changing
size — without any of your own code re-running that calculation
manually, is a real instance of the **separation of concerns**
principle applied to a specific, well-known problem generally called
**constraint-based** or **automatic layout**: describing *relationships*
between elements ("this goes above that, with this much space around
the group") rather than *absolute coordinates*, and letting a solver
recompute the actual coordinates whenever the underlying constraints'
inputs change.

Also recognized in: CSS Flexbox and Grid in web development (the same
"describe relationships, let the engine compute pixels" idea, for
browser layout instead of desktop GUI layout); LaTeX's own automatic
placement of paragraphs, figures, and page breaks from written markup
rather than manually specified coordinates; a spreadsheet's own column
auto-width, recalculating every time a cell's content changes; TeX-era
typesetting systems generally, all of which independently arrived at
the same "constraints in, positions out" strategy for exactly this
class of problem.

### SE Lens

The alternative *not* chosen here is exactly what Lesson 2 quietly
relied on by not addressing it at all: absolute positioning, using
`widget.move(x, y)` and `widget.resize(w, h)` to place every widget by
hand, in pixels, computed and written by the programmer. PySide6 does
support this directly — nothing stops you from calling `.move()`
instead of using a layout at all. The real tradeoff: absolute
positioning gives total, precise control over exactly where something
sits, which a layout's own automatic rules sometimes can't quite
replicate — but every one of those hand-picked coordinates has to be
manually recomputed by the programmer the instant anything nearby
changes: the window is resized, a label's text (and therefore its
width) changes, the user's operating system uses a different font size
or DPI scaling than the one the coordinates were originally chosen for.
A layout accepts a small loss of pixel-perfect manual control in
exchange for never having that class of bug exist in the first place.
The cost this project is now carrying, honestly: a layout's own
automatic choices (this unit's `11`-pixel margin, for instance) come
from Qt's own platform-style defaults, not from anything this project's
own code specified — which means visual fine-tuning, when it's
eventually wanted, has to happen through the layout's own configuration
methods (not covered in this lesson) rather than by directly editing a
coordinate the way `.move(x, y)` would have allowed.

### Run It

Already run and shown above, under "Introducing the Concept, in
Isolation" — a real execution this session, under
`QT_QPA_PLATFORM=offscreen`.

### Connecting This Unit

The button is now positioned by the layout system rather than by Qt's
own leftover default — but with only one widget in it, that change
isn't yet doing anything a human would actually notice. The next unit
adds a second widget, which is where a layout's real job — deciding who
goes where, relative to each other — actually becomes visible.

---

## Concept Unit: A Second Widget, and the Order Between Them

### The Problem

The layout built in the previous unit currently manages exactly one
widget, which means it hasn't yet had to make a single interesting
decision — there's no "who goes where" question with only one
occupant. This lesson's actual goal — a status label that updates when
the button is clicked — needs two widgets sharing that same window,
arranged in a specific, meaningful order: the label describing current
status, sitting above the button that changes it. What controls that
order? Is it something about the widgets themselves, or something about
how they're handed to the layout?

> Before reading on: `QVBoxLayout`'s own name contains a hint — "V" for
> vertical, "Box" for the shape it arranges things into. Given that
> this lesson's first unit already showed `layout.addWidget(...)` being
> called once, what's your prediction for what determines the order two
> separately added widgets end up stacked in — the order the
> `addWidget()` calls happen in the code, or something else, like the
> order the widgets were originally constructed in, or alphabetical by
> variable name? How would you design the class yourself, if you were
> the one writing `QVBoxLayout` from scratch, to make that behavior as
> unsurprising as possible to someone reading the code later?

### Introducing the Concept, in Isolation

```python
from PySide6.QtWidgets import QApplication, QWidget, QPushButton, QLabel, QVBoxLayout
import sys

app = QApplication(sys.argv)
window = QWidget()
window.setWindowTitle("Lesson 1 Lab")

label = QLabel("Status: idle")
button = QPushButton("Click Me")

layout = QVBoxLayout()
layout.addWidget(label)
layout.addWidget(button)
window.setLayout(layout)
window.show()

print("layout.count():", layout.count())
print("layout.itemAt(0).widget() is label:", layout.itemAt(0).widget() is label)
print("layout.itemAt(1).widget() is button:", layout.itemAt(1).widget() is button)
print("label.pos():", label.pos())
print("button.pos():", button.pos())
print("label.text():", label.text())
print("window.size():", window.size())
```

Real output from running this, this session, headless:

```
layout.count(): 2
layout.itemAt(0).widget() is label: True
layout.itemAt(1).widget() is button: True
label.pos(): PySide6.QtCore.QPoint(11, 11)
button.pos(): PySide6.QtCore.QPoint(11, 31)
label.text(): Status: idle
window.size(): PySide6.QtCore.QSize(102, 64)
```

This confirms the order directly: `label` was added first, and
`layout.itemAt(0)` — index `0`, the first position — really does hold
it; `button`, added second, sits at index `1`. The order two widgets
end up stacked in is determined by nothing more than the order
`addWidget()` was actually called in this code — not construction
order, not variable naming, not anything about the widgets themselves.
The position values confirm the visual effect of that order: `label`
sits at `y=11` (the same content margin the previous unit's lab already
explained), and `button` sits at `y=31` — twenty pixels below the
label, which is the label's own real rendered height (a separate check,
also run this session, confirmed `label.size()` reports `(80, 14)`) 
plus a small additional gap the layout adds automatically between
managed widgets — this lesson's Terms section named this the layout's
**spacing**, and it is a genuinely separate value from the **content
margin** surrounding the whole group: confirmed this session, a freshly
constructed, unattached `QVBoxLayout`'s own `.contentsMargins()` and
`.spacing()` report `(0, 0, 0, 0)` and `-1` respectively — `-1`
specifically meaning "no explicit value has been set; fall back to
whatever the current platform style recommends" — and it's only once
the layout is actually attached to a real widget via `setLayout()`
that those placeholder values resolve into the real, concrete pixel
values this lab's own `.pos()` calls just measured.

A second lab proves the label can be updated live, exactly the way this
lesson's real feature needs to work:

```python
click_count = 0
def on_click():
    global click_count
    click_count += 1
    label.setText(f"Status: clicked {click_count} time(s)")

button.clicked.connect(on_click)
print("Before click, label.text():", label.text())
button.click()
print("After 1 click, label.text():", label.text())
button.click()
button.click()
print("After 3 clicks, label.text():", label.text())
```

Real output:

```
Before click, label.text(): Status: idle
After 1 click, label.text(): Status: clicked 1 time(s)
After 3 clicks, label.text(): Status: clicked 3 time(s)
```

This ties Lesson 2's signal/slot mechanism and this lesson's `QLabel`
together directly: the same `button.clicked.connect(...)` pattern
Lesson 2 taught now drives a function that calls `label.setText(...)`
instead of only printing to the terminal — proving a slot is free to
touch any other widget it has a reference to, not only print or modify
its own state.

Both labs are now **discarded** — the real project's version, below,
keeps the label and the connection, but drops the standalone
`click_count`/`on_click` scaffolding this lab used to isolate the idea,
replacing it with the real project's own permanent version.

### Project Change

- **Reference Source:** No reference counterpart — from-scratch
  addition.
- **Files affected:** `main.py` — modified.
- **Change type:** add (a new `QLabel`) and replace (the body of
  `on_button_clicked`, which Lesson 2 defined to only `print(...)`, now
  also updates the label).
- **Location:** the `QLabel` construction is inserted immediately
  before the `layout = QVBoxLayout()` line this lesson's first Concept
  Unit added; the `layout.addWidget(label)` call is inserted immediately
  before that same unit's `layout.addWidget(button)` line, so the label
  is added first and therefore appears above the button, per this
  unit's own lab. `on_button_clicked`'s body, defined in Lesson 2, is
  replaced in place.
- **Dependencies:** the `layout` object from this lesson's first
  Concept Unit; the `button` and `on_button_clicked` from Lesson 2.

### The New Code

```python
label = QLabel("Status: idle")

def on_button_clicked():
    global click_count
    click_count += 1
    label.setText(f"Status: clicked {click_count} time(s)")

click_count = 0
```

### The Updated Project

`main.py`, complete, as it stands at the end of this lesson:

```python
 1  from PySide6.QtWidgets import QApplication, QWidget, QPushButton, QLabel, QVBoxLayout
 2  import sys
 3
 4  app = QApplication(sys.argv)
 5  window = QWidget()
 6  window.setWindowTitle("Lesson 1 Lab")
 7  button = QPushButton("Click Me", window)
 8  label = QLabel("Status: idle")             # <- new
 9
10  layout = QVBoxLayout()
11  layout.addWidget(label)                    # <- new
12  layout.addWidget(button)
13  window.setLayout(layout)
14
15  click_count = 0                            # <- new
16
17  def on_button_clicked():
18      global click_count                     # <- new
19      click_count += 1                       # <- new
20      label.setText(f"Status: clicked {click_count} time(s)")  # <- new
21
22  button.clicked.connect(on_button_clicked)
23
24  window.show()
25  sys.exit(app.exec())
```

As a whole, the file now builds two widgets (lines 7–8), arranges them
in a fixed, label-above-button vertical order via the layout system
(lines 10–13), tracks a running count of clicks at module level (line
15), and, on every click, both increments that count and rewrites the
label's own text to report it (lines 17–20) — replacing Lesson 2's
plain `print("Button was clicked!")` with something the user actually
sees change on screen, live, without the window needing to be closed
and reopened.

### Mechanical Walkthrough

- **`label = `** — an assignment, the same construct explained
  repeatedly already in this curriculum, now holding a reference to
  the constructed `QLabel`.
- **`QLabel("Status: idle")`** — a constructor call. Explained in full
  in this lesson's Header, above, under Objects and methods used;
  `"Status: idle"` is a string literal, the label's own initial text.
- **`layout.addWidget(label)`** — explained in full in this lesson's
  Header, above; called before `layout.addWidget(button)` specifically
  so the label appears first, per this unit's own confirmed-by-lab
  ordering rule.
- **`click_count = 0`** — an assignment, the same construct already
  explained, here creating a module-level variable — a name that exists
  in the file's own top-level scope, not inside any function — starting
  at the integer `0`.
- **`def on_button_clicked():`** — a function definition, already
  introduced in Lesson 2; this is the same function name reappearing
  with a changed body, so, per the Repetition Rule, it's worth stating
  plainly: this is not a second, separate function shadowing the first
  — Lesson 2's version and this lesson's version occupy the exact same
  place in the file, and this lesson's Project Change, above, already
  states this is a replace, not an add.
- **`global click_count`** — explained in full in this lesson's Header,
  above, under "Everything else in the file"; required here because
  `on_button_clicked` both reads and reassigns `click_count`, and
  without this line, `click_count += 1` would be treated as creating a
  brand-new, function-local variable instead of modifying the one
  defined on line 15 — which would then fail immediately with an error,
  since a local `click_count` would have no starting value to add `1`
  to.
- **`click_count += 1`** — augmented assignment, an operator that reads
  a variable's current value, adds the right-hand value to it, and
  writes the result back to the same variable — one operation standing
  in for the equivalent, longer `click_count = click_count + 1`.
- **`label.setText(f"Status: clicked {click_count} time(s)")`** — a
  method call, explained in full in this lesson's Header, above, under
  Objects and methods used; its argument is an f-string, explained in
  full in this lesson's Header, above, under "Everything else in the
  file" — `{click_count}` inside it is replaced, at the moment this
  line runs, with `click_count`'s current value, converted to text.

### CS Lens

Not a hard concept in this unit specifically beyond what Concept Unit 1
already covered (the layout-as-constraint-solver idea) — adding a
second widget and connecting a click to a text update are applications
of concepts already given full treatment: Concept Unit 1's automatic
layout, and Lesson 2's observer-pattern signal/slot mechanism.

### SE Lens

The alternative *not* chosen here is keeping the click count as a value
private to the connected function itself, using a construct (a
"closure," capturing a variable from an enclosing scope without needing
`global` at all) not yet introduced in this curriculum — a real, valid
option in Python, deferred to a later lesson. The tradeoff, stated
honestly now: a module-level `global` variable, the choice this lesson
actually makes, is simple and immediately readable to a newcomer, but
it does not scale past one instance — if this program later needed two
independent buttons, each with its own separate click count, a single
shared `click_count` variable would incorrectly count both buttons
together as if they were one. This project is currently carrying that
exact limitation as real, acknowledged debt: it works correctly for
today's one-button program, and would need to change, not just extend,
the moment a second independently-counted button was added.

### Commands Needed

No new commands beyond Lesson 1's own `python3 main.py`.

### Run It

Already run and shown above, under "Introducing the Concept, in
Isolation" — two separate real executions this session, both under
`QT_QPA_PLATFORM=offscreen`: the ordering/positioning proof, and the
click-driven label update.

### Connecting This Unit

The label this unit added, and the layout this lesson's first Concept
Unit attached to `window`, together turn Lesson 2's silent,
terminal-only click handler into something genuinely visible: a program
where clicking a button changes something the user can actually see, on
screen, without touching the terminal at all.

---

## Connect the Pieces

Trace one concrete action — three consecutive clicks — through
everything this lesson built, start to finish:

The program starts inside `app.exec()`, exactly as Lesson 1 explained.
`window`'s layout, attached on line 13, has already positioned `label`
at `(11, 11)` and `button` at `(11, 31)` — the content margin and
inter-widget spacing this lesson's first two Concept Units measured
directly, both automatically recalculated by the layout system rather
than hardcoded anywhere in this file. The user clicks the button once.
Exactly as Lesson 2's own Connect the Pieces traced, Qt's own internal
code recognizes the click and emits `clicked`; the connection made on
line 22 runs `on_button_clicked`. `global click_count` tells this
function that line 15's module-level `0` is the variable it means, not
a fresh, function-local one; `click_count += 1` changes it to `1`; the
f-string on line 20 builds the string `"Status: clicked 1 time(s)"` by
substituting that new value directly into the text; `label.setText(...)`
replaces the label's own displayed text with it, on screen, live,
confirmed by this lesson's own lab to happen with no delay. The user
clicks twice more. The exact same sequence runs twice more,
`click_count` reaching `3`, the label reading `"Status: clicked 3
time(s)"` — confirmed, character for character, by this lesson's own
verified run. Control returns to the event loop after each individual
click, exactly as it always does, ready to notice the next one, or the
window finally closing, at which point `app.exec()` returns and
`sys.exit(...)`, exactly as Lesson 1 explained, hands that return value
back to the operating system as the process's real exit status.

**Next lesson:** Lesson 4 — text input. This lesson's program can only
count clicks; the next lesson adds a `QLineEdit` so the program can
read something the user actually typed, and covers reading and
validating that input before acting on it.
