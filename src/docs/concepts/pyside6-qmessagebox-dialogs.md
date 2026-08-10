# Concept: `QMessageBox` — Notices, Errors, and Yes/No Prompts

**What you'll understand by the end:** `QMessageBox`'s real, distinct
static dialog methods — a one-way error/info **notice** versus a real
**question** the caller branches on — and the concrete UX principle
behind confirming before a destructive, hard-to-reverse action.

**Prerequisites:** `pyside6-qapplication-and-mainwindow.md`.

## Setup

Python 3 with `pip install PySide6`.

## The Problem

A real application needs more than one distinct kind of real modal
dialog: sometimes it just needs to *tell* the user something went wrong
(no real decision to make, one dismissal button), and sometimes it needs
to genuinely *ask* the user something, where the answer changes what
happens next (proceed or don't). Both are real, native, blocking dialogs
— but they carry different real shapes and different real purposes.

## The Isolated Example

```python
import sys
from unittest.mock import patch
from PySide6.QtWidgets import QApplication, QMessageBox

app = QApplication.instance() or QApplication(sys.argv)

# .critical() -- an error NOTICE. Real signature returns a button
# constant too, but callers of .critical() typically only care that it
# was shown, not what was clicked (there's usually only one button).
calls = []
with patch.object(
    QMessageBox, "critical",
    side_effect=lambda *a, **kw: calls.append(a[1:]) or QMessageBox.StandardButton.Ok,
):
    result = QMessageBox.critical(None, "Save Failed", "Could not write the file.")
print("critical() shown with:", calls)
print("critical() returned Ok?", result == QMessageBox.StandardButton.Ok)

# .question() -- a real yes/no PROMPT. The return value is what the
# caller actually branches on.
with patch.object(QMessageBox, "question", return_value=QMessageBox.StandardButton.Yes):
    answer = QMessageBox.question(
        None, "Discard changes?", "You have unsaved changes. Discard them?",
        QMessageBox.StandardButton.Yes | QMessageBox.StandardButton.No,
    )
print("question() returned Yes?", answer == QMessageBox.StandardButton.Yes)

with patch.object(QMessageBox, "question", return_value=QMessageBox.StandardButton.No):
    answer2 = QMessageBox.question(
        None, "Discard changes?", "You have unsaved changes. Discard them?",
        QMessageBox.StandardButton.Yes | QMessageBox.StandardButton.No,
    )
print("question() returned Yes the second time?", answer2 == QMessageBox.StandardButton.Yes)
```

**Real output, run this session:**
```
critical() shown with: [('Save Failed', 'Could not write the file.')]
critical() returned Ok? True
question() returned Yes? True
question() returned Yes the second time? False
```

**What this proves:** both are real, static methods on the same class,
but they're used for genuinely different real purposes: the two
`question()` calls, patched to two different fixed answers, produced two
genuinely different real results (`True`, then `False`) — proving a
real caller of `question()` *must* branch on its return value to behave
correctly. `critical()`, by contrast, was called purely to show the
user something went wrong — its own caller in this project never
inspects the return value at all.

## Mechanical Walkthrough

- `QMessageBox.critical(parent, title, text)` is a real **static
  method** that shows a native, real modal error dialog with a red
  error icon and (by default) a single "OK" button — it blocks until
  dismissed, and its return value is rarely used by its caller, since
  there's usually only one real button to click.
- `QMessageBox.question(parent, title, text, buttons)` shows a real,
  different modal dialog — no error icon, a real question posed to the
  user, and a `buttons` parameter naming *which* real buttons should
  appear (`Yes | No` here — see `bitwise-or-flag-combination.md` for
  how that combination actually works).
- `question()`'s **return value is the whole point of calling it** — it
  tells the caller exactly which real button the user clicked
  (`QMessageBox.StandardButton.Yes`, `.No`, or others depending on what
  was offered), so the caller can branch: proceed if `Yes`, do nothing
  if `No`.
- Both are real, blocking calls in normal (non-mocked) use — the calling
  code genuinely pauses at that line until a real human responds, which
  is exactly why testing either one headlessly requires patching it, as
  done above.

## CS Lens

This is **modal, synchronous user confirmation**: the calling code's
own control flow is genuinely suspended until a real decision is made,
then resumes based on that decision — a direct, real instance of
blocking I/O, except the "input" is a human's click rather than a
network or disk read. `critical()` (no real decision, one path forward)
versus `question()` (a real fork in control flow based on the answer)
mirrors the general distinction between a **notification** and a
**query** in any request/response-shaped system.

Also recognized in: every native GUI toolkit's equivalent modal dialog
pair (a browser's `alert()` versus `confirm()` is the identical real
distinction in a web context — `alert()` has no meaningful return
value, `confirm()`'s boolean return is the entire point of calling it).

## SE Lens

The concrete UX principle actually being applied here: **confirm before
a destructive, hard-to-reverse action.** Discarding unsaved edits is
real, hard-to-reverse data loss — once confirmed, the content is gone,
with no real undo available at that point. That's precisely why this
project reaches for `question()` (a real, explicit fork requiring a
deliberate answer) rather than proceeding silently, and why `critical()`
alone — a dialog with no real decision to make — would be the wrong
real tool for this particular moment, even though both are, mechanically,
just `QMessageBox` static methods.

## Connection

Builds on `pyside6-qapplication-and-mainwindow.md`. `critical()`'s real
role in this project is the GUI-side half of
`exception-translation-at-boundary.md`'s own pattern — the dialog a
translated, caught exception ultimately surfaces as. `question()`'s
`Yes | No` parameter is a real, first appearance of
`bitwise-or-flag-combination.md`'s own mechanism. Testing either
headlessly uses the identical `unittest.mock.patch`/`pytest-monkeypatch-
fixture.md` substitution technique already established for
`QFileDialog` (`pyside6-qfiledialog-open-and-save.md`).

## Try It Yourself

1. Offer a third real button (`QMessageBox.StandardButton.Cancel`,
   combined with `|` alongside `Yes` and `No`) and patch `question()` to
   return it — confirm a caller checking only `== Yes` treats `Cancel`
   identically to `No` unless it explicitly checks for it too.
2. Look up `QMessageBox.warning()` — a real, third static method,
   between `.critical()`'s severity and a plain notice — and decide,
   from its real icon and default buttons, which of this project's real
   dialogs (if any) might be better suited to it than `.critical()`.
3. Remove the `unittest.mock.patch` around one call and run this in a
   real, non-headless environment — confirm a real, native dialog
   genuinely appears and blocks until you respond.

## A Third Real Static Method: `.information()`

A real third shape, distinct from both of the above — a pure,
no-error, no-question **notice**:

```python
import sys
from unittest.mock import patch
from PySide6.QtWidgets import QApplication, QMessageBox

app = QApplication.instance() or QApplication(sys.argv)

calls = []
with patch.object(
    QMessageBox, "information",
    side_effect=lambda *a, **kw: calls.append(a[1:]) or QMessageBox.StandardButton.Ok,
):
    result = QMessageBox.information(None, "Not Found", "No more matches found.")

print("information() shown with:", calls)
print("information() returned Ok?", result == QMessageBox.StandardButton.Ok)
```

**Real output, run this session:**
```
information() shown with: [('Not Found', 'No more matches found.')]
information() returned Ok? True
```

**What this proves:** `.information()` shares `.critical()`'s exact
real shape — a title, a message, one dismissal button, a return value
its own caller typically ignores — but carries a genuinely different
real *meaning*: nothing went wrong here. `critical()` reports a real
failure (a save that couldn't complete); `information()` reports a
real, neutral fact (a search reached the end with nothing left to
find) — the same mechanical API, chosen deliberately based on whether
the message is actually bad news or not.

### Try It Yourself (third method)

1. Compare `.information()`'s and `.critical()`'s default icons in a
   real, non-headless run — confirm Qt genuinely renders a different
   icon for each, even though both share an identical call signature.
2. Decide, and justify, which of this project's real dialogs so far
   (Steps 2, 5, 7, and this one) *should* be `.critical()` versus
   `.information()` versus `.question()` — not every "something the
   user should know" moment is actually an error.
