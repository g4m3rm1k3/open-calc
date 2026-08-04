# Concept: `QStackedWidget` — Switching Which of Several Pages Is Shown

**What you'll understand by the end:** how `QStackedWidget` holds
several real, independent widgets ("pages") but shows only one at a
time, and the real, common pattern of driving which page is visible
from a separate selector control (a `QComboBox`), rather than each
page managing its own visibility.

**Prerequisites:**
`pyside6-composing-a-widget-from-children-via-layout.md`,
`pyside6-widget-reparenting-and-visibility.md`.

## Setup

Python 3 with `pip install PySide6`.

## The Problem

A real form whose fields genuinely depend on some earlier choice (which
operation, which mode) could show every possible field at once, with
irrelevant ones grayed out — real, but confusing and wastes space. A
cleaner real approach: group each choice's own fields into a separate
page, and show only the one page that's actually relevant right now,
switching automatically the moment the choice changes.

## The Isolated Example

```python
import sys
from PySide6.QtWidgets import QApplication, QComboBox, QLabel, QStackedWidget

app = QApplication.instance() or QApplication(sys.argv)

combo = QComboBox()
combo.addItem("Translate", "translate")
combo.addItem("Scale", "scale")

pages = QStackedWidget()
translate_page = QLabel("translate controls")
scale_page = QLabel("scale controls")
pages.addWidget(translate_page)
pages.addWidget(scale_page)

combo.currentIndexChanged.connect(pages.setCurrentIndex)

print("initial currentIndex:", pages.currentIndex())
print("initial currentWidget is translate_page:", pages.currentWidget() is translate_page)

combo.setCurrentIndex(1)
print("after selecting Scale -- currentIndex:", pages.currentIndex())
print("after selecting Scale -- currentWidget is scale_page:", pages.currentWidget() is scale_page)
print("translate_page.isVisible():", translate_page.isVisible())
```

**Real output, run this session:**
```
initial currentIndex: 0
initial currentWidget is translate_page: True
after selecting Scale -- currentIndex: 1
after selecting Scale -- currentWidget is scale_page: True
translate_page.isVisible(): False
```

**What this proves:** `combo.currentIndexChanged` connected **directly**
to `pages.setCurrentIndex` — no custom slot function needed anywhere —
genuinely switched which page is current the instant the combo's own
selection changed. `translate_page.isVisible()` reporting `False` once
it's no longer the current page confirms `QStackedWidget` really does
hide every page except the active one, the identical real mechanism
`pyside6-widget-reparenting-and-visibility.md` already names as what
powers `QTabWidget` internally — here used directly, with no tab bar
at all, driven entirely by an external combo box instead.

## Mechanical Walkthrough

- `QStackedWidget.addWidget(page)` adds one real page, returning its
  own assigned index (`0`, `1`, `2`, ... in the order added) — every
  page is a genuinely real, live widget the whole time, not created or
  destroyed on demand.
- `setCurrentIndex(i)` switches which single page is shown — the
  previously-current page becomes hidden (`isVisible()` reports
  `False`), not destroyed; its own state (any text a user already
  typed into it) is fully preserved for whenever it becomes current
  again.
- A `QComboBox`'s `currentIndexChanged` signal carries exactly the new
  integer index — since `setCurrentIndex` accepts an integer index too,
  connecting one directly to the other needs no intermediate function
  at all, as long as the two indices are meant to stay in lockstep.
- The real, structural requirement this depends on: pages must be
  added to the `QStackedWidget` in the **same order** items are added
  to the combo box — index `1` has to mean "Scale" in both places at
  once, or the wrong page would show for a given selection.

## CS Lens

This is a real, applied instance of driving **view state from a single
source of truth** — the combo box's own current index *is* the entire
real state determining which page is visible, with the stacked widget
doing no independent decision-making of its own, just mirroring
whatever index it's told. This is the identical underlying shape as a
`switch`/`match` statement selecting one of several branches by an
integer or enum value — here expressed as data (a signal carrying an
index) driving a widget's own behavior directly, rather than as
explicit control-flow code.

Also recognized in: a wizard-style multi-step form advancing through
numbered pages by an external "Next"/"Back" index; a mobile app's
bottom-navigation bar switching which full-screen view is shown by tab
index; any settings UI with a sidebar list on the left and a single
detail pane on the right that changes based on which sidebar item is
selected.

## SE Lens

The real, practical payoff: adding a new choice (a new page) is
localized to two places — one new combo item, one new page added in
the same relative position — with zero new conditional logic needed to
decide when to show it; the direct signal-to-slot connection already
handles every case uniformly. The real, honest risk this pattern
carries: the two parallel orderings (combo items, stacked pages) are
never enforced to match by the type system or by Qt itself — nothing
stops a future edit from adding a new combo item without adding a
correspondingly-positioned page, silently showing the wrong page for a
given selection. Keeping the two lists visibly adjacent in the same
constructor, with an explicit comment stating the invariant, is a real,
lightweight mitigation for a mistake nothing else catches automatically.

## Connection

Builds on `pyside6-composing-a-widget-from-children-via-layout.md` and
directly on `pyside6-widget-reparenting-and-visibility.md`'s own
identification of `QStackedWidget` as what powers `QTabWidget`
internally — this file is the first real, explicit, standalone use of
that same mechanism with no tab bar at all, driven instead by an
external selector control. A real, applied instance in this project's
own history: a G-code transform dialog offering four real operations
(Translate/Scale/Rotate/Mirror), each with its own distinct set of
parameter fields, switching pages by connecting a `QComboBox`'s
`currentIndexChanged` directly to the stacked widget's own
`setCurrentIndex`, with an explicit source comment stating the
page-order-must-match-combo-order invariant.

## Try It Yourself

1. Add a third page and a third combo item, but insert the page in the
   **wrong** relative position — confirm selecting the third combo item
   shows the second page's own content instead, direct, real proof of
   the SE Lens's own named risk.
2. Type text into a `QLineEdit` on one page, switch to a different
   page, switch back, and confirm the typed text is still there —
   real, direct proof pages are hidden, not destroyed, when inactive.
3. Replace the combo box with a `QListWidget` (one item per page,
   `currentRowChanged` instead of `currentIndexChanged`) and confirm
   the identical direct-connection pattern still works — real proof
   this technique isn't specific to `QComboBox`, just to "some control
   that reports a current integer index."
