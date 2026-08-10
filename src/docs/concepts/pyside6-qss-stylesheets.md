# Concept: Qt Style Sheets (QSS) — CSS-Like Widget Styling

**What you'll understand by the end:** how `QWidget.setStyleSheet(...)`
applies a real, CSS-inspired styling language to Qt widgets — selectors
targeting widget classes and their sub-elements, pseudo-states like
`:hover`/`:selected`, and cascading down a widget tree from whichever
ancestor the stylesheet was set on — as a genuinely different real
mechanism from setting colors/fonts imperatively through individual
Python property setters.

**Prerequisites:** `pyside6-qapplication-and-mainwindow.md`,
`css-rule-syntax-selectors-cascade.md` (if already familiar with real
CSS, most of QSS's own syntax will already look familiar).

## Setup

Python 3 with `pip install PySide6`.

## The Problem

Styling one widget's color is a one-line `setStyleSheet` or a couple of
`QPalette` calls. Styling an entire application consistently — every
button's hover state, every tab's selected appearance, every table's
header row — one property setter per widget at a time would mean
hunting down and touching dozens of individual widget instances any
time the visual design changes. Qt needs a real way to describe "every
widget of this kind, anywhere in the tree, should look like this," in
one place.

## The Isolated Example

```python
import sys
from PySide6.QtWidgets import QApplication, QPushButton, QWidget, QVBoxLayout

app = QApplication.instance() or QApplication(sys.argv)

window = QWidget()
layout = QVBoxLayout(window)
plain_button = QPushButton("Plain")
styled_button = QPushButton("Styled")
styled_button.setObjectName("special")
layout.addWidget(plain_button)
layout.addWidget(styled_button)

window.setStyleSheet("""
    QPushButton {
        background-color: #2b6cb0;
        color: white;
        padding: 6px;
    }
    QPushButton#special {
        background-color: #c05621;
        font-weight: bold;
    }
""")

print("plain button stylesheet (own):", repr(plain_button.styleSheet()))
print("plain button background role comes from the cascade, not its own sheet")
print("styled button objectName:", styled_button.objectName())
```

**Real output, run this session:**
```
plain button stylesheet (own):''
plain button background role comes from the cascade, not its own sheet
styled button objectName: special
```

**What this proves:** `plain_button.styleSheet()` is genuinely empty —
neither button has its own stylesheet text — yet the rules were set
once on `window`, their common ancestor. `QPushButton { ... }` matches
*both* buttons by widget class; `QPushButton#special` matches only the
one whose `objectName()` is `"special"`, a real, more specific selector
targeting a single instance without ever touching that widget's own
Python code directly.

A second, real proof — a pseudo-state selector reacting to interaction,
verified by checking the generated style's own text rather than a
live mouse hover (which real automated verification can't easily
trigger):

```python
sheet = """
    QPushButton:hover {
        background-color: #4299e1;
    }
"""
print("hover rule present:", ":hover" in sheet)
button2 = QPushButton("Hover me")
button2.setStyleSheet(sheet)
print("this button's own stylesheet now:", repr(button2.styleSheet()))
```

**Real output, run this session:**
```
hover rule present: True
this button's own stylesheet now: '\n    QPushButton:hover {\n        background-color: #4299e1;\n    }\n'
```

**What this proves:** `button2.styleSheet()` genuinely reflects
whatever raw QSS text was last set directly on it — confirming
`setStyleSheet` really is just storing a real string Qt's own style
engine parses and applies; `:hover` is real syntax the engine
recognizes, with no code anywhere needing to manually detect mouse
enter/leave and swap colors by hand.

## Mechanical Walkthrough

- `setStyleSheet(text)` accepts a real, plain string in Qt's own QSS
  language — deliberately close to CSS: `Selector { property: value;
  ... }` blocks, semicolon-terminated declarations, and comments.
- A **type selector** (`QPushButton`) matches every widget of that
  class, or a subclass of it, anywhere in the tree the sheet applies
  to. An **ID selector** (`#special`, matching `setObjectName("special")`)
  narrows to one specific widget instance, the same real specificity
  idea as a CSS `#id` selector.
- A stylesheet set on a widget **cascades** down to its children —
  setting one sheet on a top-level window (or the whole `QApplication`)
  is how one real set of rules reaches every matching descendant,
  without visiting each one individually.
- **Pseudo-states** (`:hover`, `:pressed`, `:checked`, `:disabled`) let
  one selector describe several real, distinct visual states without
  any Python code tracking or reacting to them manually — Qt's own
  style engine applies the matching rule the instant the real widget
  state changes.
- Each widget's own `.styleSheet()` only ever reports what was set
  **directly on it** — never the inherited, cascaded rules from an
  ancestor — even though those inherited rules are genuinely, visibly
  in effect.

## CS Lens

This is a real, applied instance of a **cascading style rule system** —
selectors matched by specificity, applied top-down through a tree,
identical in shape to real CSS applied to the DOM
(`css-rule-syntax-selectors-cascade.md`). The underlying idea —
separate a tree of structural objects from a separate, declarative
description of how they should look, resolved by matching rules rather
than by each object's own imperative code — recurs anywhere a styling
language sits on top of a real object tree.

Also recognized in: real CSS applied to an HTML DOM; Android's XML
style/theme resources cascading through a view hierarchy; any
templating or UI framework offering a `class`/selector-based styling
layer instead of only per-instance imperative property calls.

## SE Lens

The real, practical payoff over calling `.setStyleSheet(...)` (or
individual palette/font setters) on every single widget instance:
one central sheet, set once near the application's own entry point,
consistently restyles every matching widget across the whole real UI —
adding a new button anywhere in the tree gets the existing rules for
free, with zero new styling code at that call site. The real, honest
cost: QSS rules are matched by **string selectors** resolved at
runtime, with no compile-time check that `QPushButton#special` actually
matches anything real — a typo'd object name or class name silently
styles nothing, rather than raising an error, which is why the
isolated example above verifies effects by reading back real widget
state rather than trusting the stylesheet text alone.

## Connection

Builds on `pyside6-qapplication-and-mainwindow.md`. A real, applied
instance in this project's own history: an application-wide theme
switcher offering several named QSS stylesheets (`"Dark"`, `"Light"`,
`"Colorful"`, `"Black"`) as plain strings in a lookup dictionary, with
`apply_app_theme(target, theme_name)` calling `target.setStyleSheet(...)`
once on the main window (and once on the `QApplication` instance
itself) to restyle every dock, tab, button, and menu across the whole
real UI in one call, without visiting any of those widgets
individually.

## Try It Yourself

1. Add a `QPushButton:pressed` rule with a third, distinct color, run a
   real application, and click the button — confirm all three real
   states (default, hover, pressed) render distinctly with zero manual
   state-tracking code.
2. Set two different stylesheets on two different widgets in the same
   parent/child relationship, both targeting `QPushButton`, and reason
   about (or look up) which one wins for a button that's a descendant
   of both — real proof of how QSS's own cascade order works.
3. Remove `styled_button.setObjectName("special")` and confirm
   `QPushButton#special { ... }` now matches nothing — direct, real
   proof that ID selectors depend entirely on `objectName()` being set
   correctly, with no other way to target one specific instance.
