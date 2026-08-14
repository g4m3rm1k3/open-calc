# Concept: `QGraphicsView`/`QGraphicsScene`/`QGraphicsItem` — Real Objects on a Real Canvas

**What you'll understand by the end:** how Qt's Graphics View
framework represents drawn content as real, individual objects
(`QGraphicsItem` subclasses) living in a `QGraphicsScene`, viewed
through a `QGraphicsView` that only ever renders what's actually
visible — and why this is a genuinely different real mechanism from
painting pixels directly in a widget's own `paintEvent`.

**Prerequisites:** `pyside6-custom-widget-painting.md`.

## Setup

Python 3 with `pip install PySide6`.

## The Problem

`pyside6-custom-widget-painting.md` already covers drawing directly
onto a widget with `QPainter` inside `paintEvent` — real, but every
pixel is just paint; nothing drawn that way is individually clickable,
movable, or independently trackable as its own real object. A real
visualization with many independent, interactive pieces (a chart's own
bars, a diagram's own boxes) needs each piece to be a genuine, separate
real object — with its own position, its own click handling — not just
a region of painted pixels a widget has to manually figure out which
piece a click landed on.

## The Isolated Example

```python
import sys
from PySide6.QtCore import QRectF
from PySide6.QtGui import QBrush, QColor
from PySide6.QtWidgets import (
    QApplication,
    QGraphicsRectItem,
    QGraphicsScene,
    QGraphicsSceneMouseEvent,
    QGraphicsView,
)

app = QApplication.instance() or QApplication(sys.argv)


class ClickableBar(QGraphicsRectItem):
    def __init__(self, rect, label, owner):
        super().__init__(rect)
        self.label = label
        self.owner = owner

    def mousePressEvent(self, event: QGraphicsSceneMouseEvent) -> None:
        self.owner.bar_clicked.append(self.label)
        super().mousePressEvent(event)


class BarChartView(QGraphicsView):
    def __init__(self):
        self.bar_clicked = []
        scene = QGraphicsScene()
        super().__init__(scene)
        self.scene_ref = scene

    def add_bar(self, x, width, label):
        item = ClickableBar(QRectF(x, 0, width, 20), label, self)
        item.setBrush(QBrush(QColor("#4a90d9")))
        self.scene_ref.addItem(item)
        return item


view = BarChartView()
bar_a = view.add_bar(0, 50, "task-a")
bar_b = view.add_bar(50, 30, "task-b")

print("items in scene:", len(view.scene_ref.items()))
print("bar_a rect:", bar_a.rect())
print("scene sceneRect before setSceneRect:", view.scene_ref.sceneRect())
view.scene_ref.setSceneRect(0, 0, 80, 20)
print("scene sceneRect after setSceneRect:", view.scene_ref.sceneRect())

fake_event = QGraphicsSceneMouseEvent()
bar_b.mousePressEvent(fake_event)
print("bar_clicked after simulated click:", view.bar_clicked)
```

**Real output, run this session:**
```
items in scene: 2
bar_a rect: PySide6.QtCore.QRectF(0.000000, 0.000000, 50.000000, 20.000000)
scene sceneRect before setSceneRect: PySide6.QtCore.QRectF(-0.500000, -0.500000, 81.000000, 21.000000)
scene sceneRect after setSceneRect: PySide6.QtCore.QRectF(0.000000, 0.000000, 80.000000, 20.000000)
bar_clicked after simulated click: ['task-b']
```

**What this proves:** `view.scene_ref.items()` genuinely reports both
real bars as independently-tracked objects, each retrievable and
inspectable on its own (`bar_a.rect()` reads back its own exact real
geometry). Before any explicit `setSceneRect` call, the scene's own
real bounding rect **auto-derives** from its items' combined geometry,
with Qt's own small implicit padding (`-0.5, -0.5, 81, 21` instead of
an exact `0, 0, 80, 20`) — confirming the scene tracks its own real
content extent automatically, only overridden once `setSceneRect` is
called explicitly. Calling `bar_b`'s own `mousePressEvent` directly
(the real, headless-safe way to simulate a click without a live
display) correctly appended `"task-b"` — proof each bar is a genuine,
independent object with its own real, callable event handler, not
just a region a shared widget-level handler has to disambiguate.

## Mechanical Walkthrough

- A `QGraphicsScene` holds real, independent `QGraphicsItem` objects
  (here, `QGraphicsRectItem`, one of several built-in shapes) — each
  item owns its own real position, size, and appearance, addressable
  and modifiable individually via `scene.addItem(item)`/`item.rect()`/
  etc., completely independent of any specific view.
- A `QGraphicsView` is a real, separate **viewport** onto a scene —
  the same scene can be shown through multiple independent views at
  once (each with its own pan/zoom), and critically, a view only ever
  renders the portion of the scene actually visible in its own current
  viewport — items far outside view are never even considered for
  painting, the real, structural reason this scales to a large,
  complex scene where `paintEvent`-based manual painting would have to
  redraw (or explicitly skip) everything itself.
- Each `QGraphicsItem` can override its own real event handlers
  (`mousePressEvent`, here) exactly the way a `QWidget` does — the
  identical general mechanism `pyside6-qcloseevent-blocking-window-
  close.md` already establishes for widgets, now shown at the level of
  an individual scene item instead of a whole window.
- `scene.sceneRect()` — the scene's own real logical bounds — either
  auto-computes from its items' combined geometry (with a small
  implicit margin) or can be pinned explicitly via `setSceneRect(...)`,
  the real, deliberate choice this project's own code makes once a
  scene's real content size (total elapsed time, scaled to pixels) is
  already known in advance.

## CS Lens

This is a real, applied instance of a **retained-mode** graphics
model — the scene retains real, addressable objects describing *what*
to draw, and the framework itself figures out *how* and *when* to
actually paint them (including skipping off-screen ones) — the
opposite of an **immediate-mode** model like raw `QPainter` in
`paintEvent`, where the application must explicitly issue every draw
call, every single repaint, with no persistent object representation
in between. The same real retained-vs-immediate distinction recurs in
graphics programming broadly (a browser's DOM, retained, vs. drawing
directly to an HTML `<canvas>`, immediate) and is the real, structural
reason retained-mode scales better to many independent, interactive
elements: the framework — not application code — owns the bookkeeping
of which elements exist and where.

Also recognized in: a vector graphics editor's own real object model
(each shape a real, selectable, movable object, not painted pixels); a
mapping application's own layer of real, individually-clickable map
markers, rendered efficiently only within the current viewport
regardless of how many total markers exist across the whole map.

## SE Lens

The real, practical payoff: adding interactivity (click, hover, drag)
to one piece of a complex visualization means overriding that one
`QGraphicsItem` subclass's own event method — no manual hit-testing
math anywhere in the surrounding widget code, unlike a `paintEvent`-
based approach where a click handler would have to manually compare
click coordinates against every painted region's own remembered
bounds. The real, honest cost: an item-based scene has real, per-item
object overhead (memory, construction cost) that a pure `QPainter`
pass doesn't — for a genuinely enormous number of simple, non-
interactive marks (a scatter plot with a million points, say), raw
painting can still be the more efficient real choice; Graphics View
earns its cost specifically once individual pieces need their own
real identity, interactivity, or independent movement.

## Connection

Builds on `pyside6-custom-widget-painting.md` as the direct, real
contrast this file's own framing depends on — both ultimately render
pixels, but retained real objects versus immediate manual painting are
genuinely different mechanisms, right for genuinely different real
needs. A real, applied instance in this project's own history: a
Gantt-style cycle-time timeline, one real `QGraphicsRectItem` per
G-code motion or wait segment, each one's real width computed directly
from that segment's own real duration scaled by a fixed pixels-per-
second factor, each one independently clickable to jump a real editor
to that segment's own real source line — explicitly chosen over a
plotting library specifically so panning and zooming a long, complex
real program stays native to the view, per the code's own real,
stated reasoning.

## Try It Yourself

1. Add a third bar positioned far outside the first two (`x=10000`)
   and confirm `scene.items()` still reports all three — items exist
   in the scene regardless of whether any current view happens to be
   showing that part of it.
2. Call `view.scene_ref.itemAt(25, 10, view.transform())` (a real,
   built-in hit-test — the exact "what's at this point" query
   `mousePressEvent` relies on internally) and confirm it returns the
   correct real bar for a coordinate inside its bounds.
3. Give two different `QGraphicsView`s the identical real scene
   (`QGraphicsView(shared_scene)` twice) and confirm a change made to
   one item (moving it, recoloring it) is immediately visible through
   *both* views — real, direct proof the scene, not the view, is what
   actually owns the real content.

## A Real Second Facet: `setAcceptedMouseButtons(NoButton)` — Letting a Click Pass Through to the Item Beneath

A real, common composite shape: one clickable background item with
several purely-visual, non-interactive items layered on top of it (a
progress bar's colored fill, a chart bar's own text label). Without
anything special, whichever item is drawn on top would normally
intercept the click, not the item underneath it that's actually
supposed to handle it.

```python
import sys
from PySide6.QtCore import QPointF, QRectF, Qt
from PySide6.QtGui import QBrush, QColor
from PySide6.QtTest import QTest
from PySide6.QtWidgets import (
    QApplication,
    QGraphicsRectItem,
    QGraphicsScene,
    QGraphicsSceneMouseEvent,
    QGraphicsView,
)

app = QApplication.instance() or QApplication(sys.argv)


class ClickableBackground(QGraphicsRectItem):
    def __init__(self, rect):
        super().__init__(rect)
        self.clicked = False

    def mousePressEvent(self, event: QGraphicsSceneMouseEvent) -> None:
        self.clicked = True
        super().mousePressEvent(event)


scene = QGraphicsScene()
view = QGraphicsView(scene)
view.resize(200, 100)
view.show()
QTest.qWaitForWindowExposed(view)

background = ClickableBackground(QRectF(0, 0, 100, 20))
scene.addItem(background)

overlay = QGraphicsRectItem(QRectF(10, 5, 30, 10))
overlay.setBrush(QBrush(QColor("#2ecc71")))
overlay.setAcceptedMouseButtons(Qt.MouseButton.NoButton)
scene.addItem(overlay)

scene_point = QPointF(20, 10)  # inside BOTH the overlay and the background
view_point = view.mapFromScene(scene_point)
QTest.mouseClick(view.viewport(), Qt.MouseButton.LeftButton, Qt.KeyboardModifier.NoModifier, view_point)
app.processEvents()

print("background.clicked after a real click dispatch:", background.clicked)
```

**Real output, run this session:**
```
background.clicked after a real click dispatch: True
```

**What this proves:** the click landed at a point genuinely inside
*both* the green `overlay` rect (drawn on top) and the `background`
rect beneath it — yet `background.clicked` is `True`, confirming the
real mouse-press event traveled straight through the overlay to reach
the item actually meant to handle it, because `overlay.
setAcceptedMouseButtons(Qt.MouseButton.NoButton)` told the scene's own
event-dispatch machinery to skip it entirely for mouse events, as if
it weren't there for that purpose.

**A real, easy-to-miss gotcha this proves too:** `scene.itemAt(20, 10,
view.transform())` — a plain hit-test query, not a real mouse event —
does **not** honor `acceptedMouseButtons` at all; it simply returns
whichever item is topmost at that point, `overlay` in this case,
regardless of its own accepted-buttons setting. The pass-through
behavior this facet relies on only happens during genuine, real mouse
*event delivery* (`mousePressEvent` and friends), not during a plain
geometric hit-test — a real, worth-remembering distinction between
"what's visually on top here" and "what would actually receive a
click here."

### Try It Yourself (second facet)

1. Remove `overlay.setAcceptedMouseButtons(Qt.MouseButton.NoButton)`
   and re-run the real click dispatch — confirm `background.clicked`
   now stays `False`, direct, real proof of what that one call
   actually prevents.
2. Add a *second* overlay item, also mouse-transparent, stacked on top
   of the first — confirm the click still reaches `background`
   correctly through two layered transparent items, not just one.
3. Reason about why this project's own real code (this file's own
   Connection section) needs this technique specifically: a Gantt
   block's colored rapid/cut/wait sub-rects and its text label are all
   drawn on top of one clickable background rect representing the
   *whole* block — without mouse-transparency on the sub-items, a
   click landing on the "wait" sub-segment specifically would need its
   own separate click handling, rather than uniformly reporting "this
   whole block was clicked" regardless of which visual sub-piece a
   user happened to click.

**A real, widget-level parallel to this exact facet:** `QWidget` has
its own equivalent for a whole *widget* rather than one graphics item
— `widget.setAttribute(Qt.WidgetAttribute.WA_TransparentForMouseEvents)`
makes an entire widget (not a scene item) invisible to mouse event
delivery the identical way, letting clicks pass straight through to
whatever real sibling or ancestor sits beneath it. A real, applied
instance in this project's own history: a transparent overlay widget,
stacked on top of two side-by-side editors via `.raise_()` purely to
paint a connector line between two matched real lines, marked
`WA_TransparentForMouseEvents` so it never actually intercepts a
user's real clicks meant for the editors underneath — the identical
real problem this facet's own `QGraphicsItem` technique solves, one
level up, for a plain `QWidget` rather than a graphics scene item.
