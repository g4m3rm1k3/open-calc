# Concept: Reparenting a Live Widget — the Real Hidden-Tab Visibility Gotcha

**What you'll understand by the end:** how to move a real, already-
constructed widget into a new parent (a `QSplitter`, a real, user-
resizable split view) without destroying or recreating it, and the
real, easy-to-miss gotcha this project's own code ran into: a widget
that was an *inactive* tab stays hidden even after being reparented,
requiring an explicit `.show()`.

**Prerequisites:** `pyside6-composing-a-widget-from-children-via-layout.md`,
`pyside6-qtabwidget.md`.

## Setup

Python 3 with `pip install PySide6`.

## The Problem

Two real widgets currently living as separate tabs sometimes need to
be shown **side by side** instead — the exact same, real, live
`DocumentEditor` objects, not copies (per `mutable-object-aliasing.md`'s
own deliberate-use facet). Moving a real widget to a new parent is a
real, supported Qt operation — but a widget that was *hidden* for a
real reason before the move (it was the inactive tab in a `QTabWidget`)
doesn't automatically become visible just because it has a new parent.

## The Isolated Example

```python
import sys
from PySide6.QtWidgets import QApplication, QLabel, QMainWindow, QSplitter, QTabWidget

app = QApplication.instance() or QApplication(sys.argv)

tabs = QTabWidget()
page_a = QLabel("Channel A content")
page_b = QLabel("Channel B content")
tabs.addTab(page_a, "Channel A")
tabs.addTab(page_b, "Channel B")  # page_b is NOT the active tab

window = QMainWindow()
window.setCentralWidget(tabs)
window.show()

print("BEFORE reparenting -- page_b.isVisible():", page_b.isVisible())

splitter = QSplitter()
splitter.addWidget(page_a)
splitter.addWidget(page_b)

print("AFTER reparenting, BEFORE explicit .show() -- page_b.isVisible():", page_b.isVisible())

page_a.show()
page_b.show()
splitter.show()

print("AFTER explicit .show() calls -- page_b.isVisible():", page_b.isVisible())
```

**Real output, run this session:**
```
BEFORE reparenting -- page_b.isVisible(): False
AFTER reparenting, BEFORE explicit .show() -- page_b.isVisible(): False
AFTER explicit .show() calls -- page_b.isVisible(): True
```

**What this proves:** `page_b`, the inactive tab, genuinely reports
`isVisible() == False` even while it's sitting right there inside a
real, shown `QTabWidget` — `QTabWidget` internally uses a real
`QStackedWidget`, which only actually shows the one currently active
page, keeping every other page real but hidden. Moving `page_b` into
the real `splitter` did **not** change that hidden state on its own —
it stayed `False` immediately after reparenting. Only the explicit
`.show()` call afterward genuinely made it visible.

## Mechanical Walkthrough

- `splitter.addWidget(widget)` performs a real **reparenting**
  operation — the widget keeps every bit of its own real, live state
  (its content, its own child widgets, any signal connections still
  intact) but its parent changes from the old `QTabWidget` to the new
  `QSplitter`. Nothing is destroyed or rebuilt.
- `QSplitter` is a real, distinct layout mechanism from every prior
  layout in this project — it arranges its real children side by side
  (or stacked, depending on orientation) with a real, user-draggable
  handle between them, letting a person resize each pane interactively.
- A widget's own `isVisible()` state is a real, independent fact from
  its parentage — it can be `False` for reasons entirely unrelated to
  where it's parented (an inactive tab, an explicitly hidden widget,
  a parent that's itself hidden) — reparenting alone never resets it.
- `.show()` explicitly sets a widget's own visibility flag to `True` —
  the real, necessary step after reparenting a widget that might have
  been hidden for an unrelated, real reason before the move.

## CS Lens

This is a real, concrete instance of a broader idea: **moving an
object between containers doesn't reset its own independent state** —
the identical real principle behind moving an item between two
real data structures without accidentally reinitializing its own
fields. A `QStackedWidget`'s own "only show the current page" behavior
is itself a real, deliberate optimization/design choice (per `keep-
mounted-vs-conditional-unmount.md`'s own related framing) — inactive
pages stay real and alive, just not rendered, which is exactly why
they can be silently hidden independent of their real parent.

Also recognized in: moving a DOM element between two containers in
JavaScript (`appendChild` on an already-attached element moves it,
rather than cloning it — its own inline styles, including `display:
none`, travel with it unchanged); moving a database row between two
real logical groupings without resetting any of its own column values.

## SE Lens

The real, practical risk this project's own code comment names
directly: forgetting the explicit `.show()` after reparenting an
inactive tab's widget would produce a genuinely broken real UI — a
`QSplitter` with one pane silently, invisibly empty, for a real reason
that has nothing to do with the splitter itself and everything to do
with state the widget was carrying from *before* the move. Naming this
gotcha explicitly, in a real code comment, is exactly the kind of
honest, worth-preserving knowledge that saves a future maintainer from
re-discovering the identical real bug from scratch.

## Connection

Builds on `pyside6-composing-a-widget-from-children-via-layout.md` and
`pyside6-qtabwidget.md` (the real source of the hidden state this file
explains). Directly relevant to `mutable-object-aliasing.md`'s own
deliberate-use facet — reparenting the *same*, live `DocumentEditor`
(not a copy) is exactly what makes this project's own multichannel
editing feature work at all.

## Try It Yourself

1. Reparent the *active* tab's widget (`page_a`) instead, and confirm
   it's already `isVisible() == True` even before the explicit
   `.show()` call — direct, real proof the gotcha is specific to
   *inactive* tabs, not reparenting in general.
2. Try `splitter.setOrientation(Qt.Orientation.Vertical)` and confirm
   the real, resulting arrangement stacks the two panes top-to-bottom
   instead of side by side.
3. Reparent a widget back into a `QTabWidget` after having moved it
   into a splitter, and confirm the real, complementary question: does
   it need an explicit hide, or does the tab widget's own internal
   `QStackedWidget` correctly manage that automatically this time?

## A Second Real Facet: a Hidden Ancestor Suppresses Its Entire Subtree

This file's own first example only ever showed a **leaf** widget being
hidden and re-shown. A real, deeper question: what if the widget that
needs an explicit `.show()` after reparenting has its own children —
does showing just the *child* count, or does the *ancestor's* own
hidden state independently override it?

```python
tabs = QTabWidget()

page_a = QLabel("Channel A content")
tabs.addTab(page_a, "Channel A")

ancestor = QWidget()  # a container with its own child widget
child = QLabel("child content")
layout = QVBoxLayout(ancestor)
layout.addWidget(child)
tabs.addTab(ancestor, "Combined")  # NOT the active tab

tabs.show()
app.processEvents()

print("BEFORE any show() -- ancestor.isVisible():", ancestor.isVisible())
print("BEFORE any show() -- child.isVisible():", child.isVisible())

child.show()  # show only the child -- NOT the ancestor
app.processEvents()
print("AFTER child.show() only -- ancestor.isVisible():", ancestor.isVisible())
print("AFTER child.show() only -- child.isVisible():", child.isVisible())
```

**Real output, run this session:**
```
BEFORE any show() -- ancestor.isVisible(): False
BEFORE any show() -- child.isVisible(): False
AFTER child.show() only -- ancestor.isVisible(): False
AFTER child.show() only -- child.isVisible(): False
```

**What this proves:** calling `.show()` on `child` alone genuinely
**did not** make it visible — it's still `False` afterward. `child`'s
own visibility is real, but Qt's actual rendering also requires every
**ancestor** in the widget's chain to be visible, and `ancestor` — the
inactive tab's own container — never got shown at all.

**The fix — show the ancestor too:**

```python
ancestor.show()
app.processEvents()
print("AFTER ancestor.show() too -- ancestor.isVisible():", ancestor.isVisible())
print("AFTER ancestor.show() too -- child.isVisible():", child.isVisible())
```

**Real output, run this session:**
```
AFTER ancestor.show() too -- ancestor.isVisible(): True
AFTER ancestor.show() too -- child.isVisible(): True
```

**What this proves:** only once `ancestor` itself was also shown did
`child` genuinely become visible — confirming a hidden ancestor
independently suppresses its **entire subtree**, regardless of what
any individual descendant's own `.show()` call claims.

**Mechanical note:** this is the same real underlying mechanism as
this file's first facet (an inactive `QTabWidget` page starts hidden,
and reparenting alone doesn't change that) — this facet's real,
additional finding is that the fix has to be applied at **every**
level of the moved subtree that was affected, not just the one leaf
widget a person might be most focused on. A composite widget being
reparented out of an inactive tab needs its own top-level `.show()`
call; showing only some deeply-nested child inside it is not enough,
no matter how correct that child's own individual `.show()` call is.

### Try It Yourself (second facet)

1. Show `ancestor` first, *then* try hiding just `child` with
   `child.hide()` — confirm `child.isVisible()` correctly reports
   `False` this time, direct, real proof a visible ancestor doesn't
   force every descendant visible, it only permits it.
2. Add a second child to `ancestor` and confirm it also stays hidden
   until `ancestor.show()` runs, even though it was never touched
   individually — real proof the suppression genuinely applies to the
   *entire* subtree, not just the one child this example happens to
   show.
3. Reason about (then confirm) whether calling `.show()` on `tabs`
   itself (the outermost ancestor of all) at the very start would have
   been enough on its own, without ever calling `.show()` on `ancestor`
   or `child` individually.
