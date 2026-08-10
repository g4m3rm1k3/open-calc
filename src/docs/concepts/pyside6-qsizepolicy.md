# Concept: `QSizePolicy` — How a Widget Competes for Space

**What you'll understand by the end:** how a widget's own horizontal
and vertical size policy governs how it competes against its layout
siblings for available space, and the real, common bug that shows up
when a widget inherits a size policy that doesn't match what its
actual content needs.

**Prerequisites:**
`pyside6-composing-a-widget-from-children-via-layout.md`.

## Setup

Python 3 with `pip install PySide6`.

## The Problem

A layout manager doesn't just place widgets — when there's more real
space available than every widget's own ideal size adds up to (or
less), it has to decide who gets the extra room (or who gets
squeezed). That decision is governed by each widget's own **size
policy**, a real, per-widget setting most code never touches
explicitly because most widgets' own defaults already make sense. A
real, easy-to-miss bug shows up when a widget *inherits* a default
size policy from whatever base class it subclasses, and that inherited
policy doesn't actually match what the new widget's own content needs.

## The Isolated Example

A toolbar-like widget (subclassing `QTabWidget`, which defaults to
expanding in both directions) placed above a document area in a shared
vertical layout:

```python
import sys
from PySide6.QtWidgets import (
    QApplication, QHBoxLayout, QLabel, QPushButton,
    QSizePolicy, QTabWidget, QVBoxLayout, QWidget,
)

app = QApplication.instance() or QApplication(sys.argv)


class Toolbar(QTabWidget):
    def __init__(self):
        super().__init__()
        page = QWidget()
        row = QHBoxLayout(page)
        row.addWidget(QPushButton("New"))
        row.addWidget(QPushButton("Open"))
        self.addTab(page, "Home")


class DocumentArea(QWidget):
    def __init__(self):
        super().__init__()
        layout = QVBoxLayout(self)
        layout.addWidget(QLabel("document content here"))


window = QWidget()
outer = QVBoxLayout(window)
toolbar = Toolbar()
docs = DocumentArea()
outer.addWidget(toolbar)
outer.addWidget(docs)
window.resize(400, 400)
window.show()

print("BEFORE fix -- toolbar vertical size policy:", toolbar.sizePolicy().verticalPolicy())
print("BEFORE fix -- toolbar height:", toolbar.height())
print("BEFORE fix -- docs height:", docs.height())
```

**Real output, run this session:**
```
BEFORE fix -- toolbar vertical size policy: Policy.Expanding
BEFORE fix -- toolbar height: 342
BEFORE fix -- docs height: 30
```

**What this proves:** in a 400px-tall window, `toolbar` — a strip of
content that only actually needs enough height for one row of buttons
— genuinely claimed **342 pixels**, leaving `docs` squeezed into a
mere **30**. `toolbar`'s own vertical policy reports `Expanding`
because it inherited that default straight from `QTabWidget`, which
`Toolbar` subclasses — nothing in `Toolbar`'s own code set this
explicitly; it simply never overrode the base class's own default.

The real fix — an explicit, direct size-policy override:

```python
toolbar.setSizePolicy(QSizePolicy.Policy.Expanding, QSizePolicy.Policy.Maximum)
window.layout().activate()
app.processEvents()

print("AFTER fix -- toolbar vertical size policy:", toolbar.sizePolicy().verticalPolicy())
print("AFTER fix -- toolbar height:", toolbar.height())
print("AFTER fix -- docs height:", docs.height())
```

**Real output, run this session:**
```
AFTER fix -- toolbar vertical size policy: Policy.Maximum
AFTER fix -- toolbar height: 66
AFTER fix -- docs height: 306
```

**What this proves:** with the vertical policy explicitly set to
`Maximum`, `toolbar` genuinely shrank to **66 pixels** — just enough
for its real content — and `docs` correctly grew to claim the
remaining **306**. Nothing about either widget's own actual content
changed; only the *policy* governing how each competes for the shared
layout's available space did.

## Mechanical Walkthrough

- `QSizePolicy` is a real, **per-widget, per-axis** setting — every
  widget has an independent horizontal and vertical policy, set (or
  inherited) separately; `setSizePolicy(horizontal, vertical)` takes
  both at once.
- Common real policy values: `Fixed` (never grow or shrink past its
  size hint), `Minimum` (never shrink below its size hint, can grow),
  `Maximum` (never grow past its size hint, can shrink), `Preferred`
  (size hint is a soft target, can grow or shrink), `Expanding` (wants
  as much space as it can get, competing aggressively with siblings for
  extra room).
- A **subclass** doesn't automatically get a size policy matching its
  own actual content — it inherits whatever policy its **base class**
  set, which was chosen for the base class's own typical, original use
  case (a `QTabWidget` holding potentially large, growable page
  content, not a slim, fixed-height toolbar strip).
- A layout manager, when distributing extra or insufficient real space,
  consults every child widget's own policy to decide who absorbs the
  difference — a widget marked `Expanding` volunteers aggressively for
  extra space; one marked `Maximum` explicitly declines to grow past
  what its own content needs, ceding that space to siblings instead.

## CS Lens

This is a real, per-component instance of a **constraint-based layout
system** — rather than each widget being told an exact pixel size, it
declares real, relative *preferences* (how eagerly it wants extra
space, how firmly it resists shrinking), and the layout engine solves
for a real, concrete arrangement satisfying every widget's stated
preferences as well as possible given the actual available space.

Also recognized in: CSS Flexbox's `flex-grow`/`flex-shrink` (the
identical real idea — a per-element preference for absorbing extra or
insufficient space, not a fixed pixel size); Android's `layout_weight`;
any real GUI toolkit's own size-negotiation protocol between a
container and its children.

## SE Lens

The real, practical risk this bug demonstrates directly: a real defect
that's completely invisible in an isolated component test (`Ribbon`'s
own tests never placed it inside a real, competing layout alongside
other real siblings — there was nothing for it to visually crowd out)
and only became visible once the component was actually wired into a
real window with real neighbors fighting it for space. This is an
honest, worth-naming limit of component-level testing: it verifies a
component's own internal correctness, but layout-competition bugs are
fundamentally about *interaction between siblings*, which an isolated
test, by construction, never exercises.

## Connection

Builds on `pyside6-composing-a-widget-from-children-via-layout.md`. A
real, applied instance in this project's own history: a ribbon
component, subclassing `QTabWidget` and inheriting its default
`Expanding` vertical policy, silently claiming far more vertical space
than its own real content needed the moment it was placed above a
document area competing for the same space — fixed with exactly the
explicit override shown here, caught only once real, integrated use
(not the component's own isolated tests) exposed it.

## Try It Yourself

1. Change `docs`'s own size policy to `Fixed` instead of leaving it at
   its default, and observe how the space distribution changes again —
   confirm the layout engine's own decision genuinely depends on
   *both* siblings' policies, not just `toolbar`'s.
2. Try `QSizePolicy.Policy.Minimum` instead of `Maximum` for `toolbar`'s
   vertical policy, and reason about (then confirm) why the real,
   resulting behavior in this specific scenario ends up looking similar
   to `Maximum` here, despite the two policies having a real, different
   meaning in general (a `Minimum` widget can still grow if there's
   genuinely nothing else competing for the space).
3. Look up `QWidget.sizeHint()` and `QWidget.setMaximumHeight(...)` as
   two real, related-but-different mechanisms — reasoning about when an
   explicit pixel cap (`setMaximumHeight`) is the right real tool
   instead of (or alongside) a size *policy*, which expresses a
   relative preference rather than an absolute limit.

## A Second Real Facet: A Layout's Own Stretch Factor — the Same Problem, Solved One Level Up

`QSizePolicy` is a property a widget carries with it everywhere it
goes. A real, genuinely different mechanism solves the identical class
of "who gets the extra space" problem from the **layout call site**
instead — an optional stretch-factor argument to `addWidget`:

```python
window = QWidget()
outer = QVBoxLayout(window)

header = QHBoxLayout()
header.addWidget(QLabel("a header row"))
header_widget = QWidget()
header_widget.setLayout(header)

body = QLabel("the real content area")
outer.addWidget(header_widget)
outer.addWidget(body)  # NO stretch factor
window.resize(400, 400)
window.show()

print("NO stretch factor -- header height:", header_widget.height())
print("NO stretch factor -- body height:", body.height())
```

**Real output, run this session:**
```
NO stretch factor -- header height: 186
NO stretch factor -- body height: 186
```

**What this proves:** with neither widget's own size policy overridden
(both default to `Preferred`, no explicit maximum), a `QVBoxLayout`
genuinely splits the real surplus space **evenly** between them — 186
pixels each, in a ~372px content area — even though `header_widget`
only really needs enough height for one row of text.

**The fix — a stretch factor on the layout call itself, not a
`setSizePolicy` call on either widget:**

```python
outer2 = QVBoxLayout(window2)
outer2.addWidget(header_widget2)
outer2.addWidget(body2, 1)  # stretch factor: give ALL surplus space to body2
```

**Real output, run this session:**
```
WITH stretch factor on body -- header height: 30
WITH stretch factor on body -- body height: 342
```

**What this proves:** with the identical two widgets, neither one's own
size policy touched at all, `addWidget(body, 1)` genuinely redirected
essentially all the real surplus space to `body` (342px) and left
`header_widget` at just its natural content height (30px) — the exact
same real outcome this file's own first facet achieved via
`setSizePolicy`, produced instead entirely by the layout call site.

**Mechanical note:** the stretch-factor argument is a real, separate
mechanism from `QSizePolicy`, not a shorthand for it — a widget's
`QSizePolicy` travels with the widget itself, into whatever layout it's
later placed in; a stretch factor is a property of one specific
`addWidget`/`addLayout` **call**, only meaningful within that one
layout's own space-distribution decision. The real, practical choice
between them: `QSizePolicy` is the right tool when a widget's own
nature ("I should never grow past my content") is true everywhere it
might ever be placed; a stretch factor is the right tool when the
*correct proportions* are really a fact about one specific arrangement,
not an inherent property of either widget.

### Try It Yourself (second facet)

1. Give **both** `addWidget` calls an explicit stretch factor (`1` and
   `2`) and confirm the real surplus space now splits proportionally
   (roughly 1:2) between them, rather than all going to one side.
2. Apply this file's own first facet's `setSizePolicy(Expanding,
   Maximum)` fix to `header_widget` *instead* of using a stretch factor
   on `body`, and confirm it produces the identical real end result —
   direct, real proof these are two different real paths to the same
   outcome, not the same mechanism under two names.
3. Reason about (and confirm) what happens if you set **both** a
   restrictive `QSizePolicy` on `header_widget` **and** a stretch
   factor of `0` on `body` in the same layout — does one mechanism
   override the other, or do they combine?

## A Third Real Facet: `QSplitter.setSizes` — an Explicit, One-Time Initial Split

`QSplitter` (a real, distinct layout mechanism — see
`pyside6-widget-reparenting-and-visibility.md`) faces the identical
real "who gets the space" question this file's first two facets
already solved, but answers it with a third, genuinely different real
mechanism: an explicit list of pixel sizes, one per pane, set once at
construction time.

```python
splitter = QSplitter(Qt.Orientation.Horizontal, window)
left = QLabel("left pane")
right = QLabel("right pane")
splitter.addWidget(left)
splitter.addWidget(right)
window.show()
app.processEvents()

print("NO setSizes -- left width:", left.width(), "right width:", right.width())
```

**Real output, run this session:**
```
NO setSizes -- left width: 472 right width: 524
```

**What this proves:** with neither pane's own size policy touched and
no explicit sizes given, `QSplitter` genuinely defaults to splitting
its real, available 1000px width roughly **evenly** between the two
panes (472/524, the small imbalance coming from the splitter's own
draggable handle claiming a few pixels).

**The fix — an explicit, one-time initial proportion:**

```python
splitter2.setSizes([300, 700])
```

**Real output, run this session:**
```
WITH setSizes([300, 700]) -- left width: 299 right width: 697
```

**What this proves:** the identical two-pane splitter, given
`setSizes([300, 700])`, genuinely starts out proportioned roughly
30/70 (299/697) instead of the default even split — `setSizes` takes
one integer per pane, in the same order the panes were added, and
Qt scales them to fit whatever real space is actually available (the
values are a *ratio*, not a hard pixel guarantee, which is why 300/700
came out as 299/697 rather than exactly on the nose).

**Mechanical note — how this differs from the other two facets:**
`setSizes` is neither a per-widget property (`QSizePolicy`) nor a
per-layout-call argument (a stretch factor) — it's a one-time
instruction to the splitter itself, valid only immediately after its
panes exist. Critically, it only sets the **initial** proportions: a
real, live `QSplitter` lets a person drag the handle between panes to
change that split interactively at any time afterward, which neither
`QSizePolicy` nor a stretch factor allows (those stay fixed until code
changes them). Choosing `setSizes` over the other two mechanisms is
therefore also a choice to make the split **user-adjustable**, not
just a shorter way to write the same fixed layout.

### Try It Yourself (third facet)

1. Call `splitter.setSizes([1, 1])` (equal ratio, tiny numbers) and
   confirm the real, resulting widths land close to a 50/50 split —
   direct, real proof the values are scaled as a ratio against the
   real available space, not read as literal pixel counts.
2. Call `setSizes` a second time, after the splitter has already been
   shown once, with different numbers — confirm it can genuinely
   re-set the proportions later, not just at construction.
3. Look up `QSplitter.sizes()` (no `set`) as the real, complementary
   read side — useful for persisting a user's own manually-dragged
   split across a real save/restore of application state.

## A Fourth Real Facet: Sizing the Top-Level Window Itself, Relative to the Real Screen

This file's first three facets all answer "who gets the space" *inside*
an already-sized container. A real, related question sits one level
higher: what size should the top-level window itself start at? A fixed
pixel size (`window.resize(900, 600)`) has the identical real problem
Step 80's own original bug (this file's opening motivation) had at the
layout level — it looks fine on whatever screen it was picked on, and
wrong everywhere else: cramped on a small laptop display, comically
small in the corner of a large 4K monitor.

```python
import sys
from PySide6.QtWidgets import QApplication, QMainWindow

app = QApplication.instance() or QApplication(sys.argv)
window = QMainWindow()

window.resize(900, 600)
print("hardcoded size:", window.width(), window.height())

screen = app.primaryScreen()
rect = screen.availableGeometry()
print("real available screen geometry:", rect.width(), rect.height())

w = max(1100, int(rect.width() * 0.65))
h = max(750, int(rect.height() * 0.75))
window.resize(min(w, rect.width()), min(h, rect.height()))
print("screen-relative size:", window.width(), window.height())
```

**Real output, run this session (headless/offscreen platform, which
reports a real 800x800 available screen):**
```
hardcoded size: 900 600
real available screen geometry: 800 800
screen-relative size: 800 750
```

**What this proves:** `app.primaryScreen().availableGeometry()`
returns the real, actual usable screen area (excluding OS taskbars/
docks) as a `QRect` — genuinely different per machine, confirmed here
by this session's own real offscreen platform reporting an 800x800
area, not whatever fixed numbers the code guesses at. The final
`window.resize(...)` call computes a real proportion of that (65%
width, 75% height), floors it at a real, sensible minimum (`1100`,
`750`, so a tiny real screen doesn't produce an unusably small window),
and caps it at the real screen's own size (`min(w, rect.width())`, so
the *minimum* floor can never make the window larger than the actual
screen) — landing on `800, 750` here specifically because this
session's own 800-wide screen is narrower than even the `1100` floor,
so the real screen-size cap won that comparison instead of the
percentage or the minimum.

**Mechanical note — why three numbers are combined, not just one:** a
plain percentage alone (`rect.width() * 0.65`) could still produce an
uncomfortably small window on a genuinely tiny real screen; a plain
minimum alone could overflow a genuinely tiny real screen entirely.
`max(minimum, percentage)` then `min(that, real screen size)` is a
real, three-way clamp — never smaller than a usable floor, never larger
than the real screen actually allows, proportional to real available
space in between.

### Try It Yourself (fourth facet)

1. Run the identical code against a real, non-offscreen platform (an
   actual visible display) and compare the real `availableGeometry()`
   numbers reported against your own screen's real resolution — confirm
   they reflect genuine hardware, not a fixed simulated value.
2. Remove the `min(w, rect.width())` cap and reason about (or
   construct) a real screen size small enough that the `1100`/`750`
   floor alone would produce a window wider or taller than the actual
   screen — the real failure this cap specifically prevents.
3. Compare this facet against the file's own second facet (a layout
   stretch factor): both solve a "don't hardcode a fixed number, size
   relative to real available space" problem, one level apart —
   reasoning about why a top-level window has no *parent layout* to ask
   for a stretch factor from, and has to ask the screen itself instead.
