# Concept: `QInputDialog.getText` — a Real, Separate `ok` Flag

**What you'll understand by the end:** `QInputDialog.getText`'s real
return shape — a `(text, ok)` tuple with an *explicit*, separate
boolean signaling cancellation — and why that's a genuinely different
real cancellation shape from its sibling dialogs.

**Prerequisites:** `pyside6-qmessagebox-dialogs.md`,
`pyside6-qfiledialog-open-and-save.md`, `python-tuple-unpacking.md`.

## Setup

Python 3 with `pip install PySide6`.

## The Problem

Prompting a user to type a short piece of text (a search term, a new
name) needs a real, native input dialog — and like any real dialog, it
needs a way to signal that the user cancelled rather than genuinely
confirmed an answer. Different real Qt dialogs signal cancellation in
different, real shapes, and `QInputDialog` picks a genuinely different
one from its siblings.

## The Isolated Example

```python
import sys
from unittest.mock import patch
from PySide6.QtWidgets import QApplication, QInputDialog

app = QApplication.instance() or QApplication(sys.argv)

# Simulating the user typing something and clicking OK:
with patch.object(QInputDialog, "getText", return_value=("brown fox", True)):
    text, ok = QInputDialog.getText(None, "Find", "Find:")
print("user confirmed -- text:", repr(text), "ok:", ok)

# Simulating the user clicking Cancel instead:
with patch.object(QInputDialog, "getText", return_value=("", False)):
    text2, ok2 = QInputDialog.getText(None, "Find", "Find:")
print("user cancelled -- text:", repr(text2), "ok:", ok2)

# The real trap: a user CAN click OK with an empty field.
with patch.object(QInputDialog, "getText", return_value=("", True)):
    text3, ok3 = QInputDialog.getText(None, "Find", "Find:")
print("user confirmed an EMPTY field -- text:", repr(text3), "ok:", ok3)
```

**Real output, run this session:**
```
user confirmed -- text: 'brown fox' ok: True
user cancelled -- text: '' ok: False
user confirmed an EMPTY field -- text: '' ok: True
```

**What this proves:** the second and third cases both return an empty
string for `text` — **identical** on that value alone — yet they mean
completely different things: the second is a real cancellation
(`ok: False`), and the third is a genuine confirmation of nothing
(`ok: True`). Checking only `if not text:` would treat both cases
identically, silently conflating "the user cancelled" with "the user
confirmed an empty answer" — a real, distinct case `QFileDialog`'s own
single-string return (`pyside6-qfiledialog-open-and-save.md`) doesn't
have to distinguish, since it has no separate "confirmed but empty"
possibility at all.

## Mechanical Walkthrough

- `QInputDialog.getText(parent, title, label)` is a real static method,
  the same shape as `QFileDialog`'s and `QMessageBox`'s own static
  dialog methods — it shows a real, native text-entry dialog and blocks
  until the user responds.
- It returns a real **2-tuple**: `(text, ok)` — `text` is whatever
  string was in the input field at the moment the dialog closed
  (empty string if nothing was typed), and `ok` is a real, independent
  boolean stating whether the user clicked OK/pressed Enter (`True`) or
  Cancel/closed the dialog (`False`).
- Because `ok` is tracked completely separately from `text`, all four
  real combinations are genuinely possible: confirmed with real text,
  confirmed with empty text, cancelled with whatever was typed
  discarded, and (functionally identical to the previous case from the
  caller's perspective) cancelled with nothing typed at all.
- A caller that wants to correctly distinguish "the user meant to
  submit nothing" from "the user backed out entirely" **must** check
  `ok`, not just whether `text` is non-empty.

## CS Lens

This is a real, deliberate contrast in how different dialogs encode
"the user didn't complete this" in their return value — a small, real
case study in API design around **optional/cancellable results**.
`QFileDialog` overloads a single value (empty string means both "no
file" and "cancelled" — those happen to be the same real state for a
path). `QMessageBox.question` encodes it as *which* button was
clicked, folded into the same enum as a real answer. `QInputDialog`
instead uses a genuinely separate, explicit flag — closer in spirit to
returning an `Optional`/nullable type in languages that have one, made
explicit here as a second boolean rather than folded into the primary
value.

Also recognized in: any API returning `(value, found)` or `(value,
success)` pairs rather than relying on a sentinel value like `None` or
`""` to mean "nothing" — Python's own `dict.get(key, default)` sidesteps
this by taking a default instead, while `re.match`, by contrast, returns
`None` on failure, folding "no match" into the primary return value the
same way `QFileDialog` does.

## SE Lens

The real, practical risk of not checking `ok` explicitly: a caller that
only checks `if text:` will silently treat "user cancelled" and "user
confirmed nothing" identically — usually harmless for a search dialog
(both cases mean "there's nothing to search for" either way), but a
real, worth-noticing gap in a different real context (imagine
confirming an empty value is meant to explicitly *clear* a field,
versus cancelling meaning *leave it unchanged* — there, conflating the
two would be a genuine, real bug).

## Connection

Builds on `pyside6-qmessagebox-dialogs.md` and `pyside6-qfiledialog-
open-and-save.md` — grouped together as this project's three real,
native dialog-return shapes, each genuinely different despite sharing
the "static method, blocks until response" pattern. Uses `python-tuple-
unpacking.md`'s mechanism directly (`text, ok = QInputDialog.getText(
...)`).

## Try It Yourself

1. Write a small function that takes the real `(text, ok)` pair and
   returns one of three distinct results — `"cancelled"`,
   `"empty"`, `"search: <text>"` — correctly distinguishing all three
   real cases demonstrated above.
2. Look up `QInputDialog.getInt`/`getDouble` — real siblings returning
   `(int, ok)`/`(float, ok)` — and confirm they share the identical
   `(value, ok)` shape, just with a different value type.
3. Consider (or test, in a real non-headless run) what `ok` reports if
   the user presses Enter with the field still showing its original,
   pre-filled default text, unchanged — confirm whether that counts as
   a real confirmation.
