# Concept: `QPlainTextEdit` — a Real, Plain-Text Editing Widget

**What you'll understand by the end:** how to display and edit plain
text in a real Qt widget, what "read-only" actually restricts (and
doesn't), and how to set its real display font.

**Prerequisites:** `pyside6-qapplication-and-mainwindow.md`.

## Setup

Python 3 with `pip install PySide6`.

## The Problem

A real application often needs to show — and sometimes let a user
edit — a block of plain text (source code, a log, a document) inside a
real window, with real scrolling, real cursor/selection handling, and
real keyboard input already implemented, rather than building any of
that from scratch.

## The Isolated Example

```python
import sys
from PySide6.QtGui import QFont
from PySide6.QtWidgets import QApplication, QPlainTextEdit

app = QApplication.instance() or QApplication(sys.argv)

editor = QPlainTextEdit()
editor.setFont(QFont("Menlo", 11))
editor.setPlainText("line one\nline two")
print("toPlainText():", repr(editor.toPlainText()))

editor.setReadOnly(True)
# A read-only editor still allows programmatic changes -- only real
# user keystrokes are blocked.
editor.setPlainText("changed programmatically")
print("after programmatic change while read-only:", repr(editor.toPlainText()))
print("isReadOnly:", editor.isReadOnly())
print("font family actually applied:", editor.font().family())
```

**Real output, run this session:**
```
toPlainText(): 'line one\nline two'
after programmatic change while read-only: 'changed programmatically'
isReadOnly: True
font family actually applied: Menlo
```

**What this proves:** even with `isReadOnly()` reporting `True`,
`setPlainText(...)` still successfully changed the widget's real
content — `"changed programmatically"` genuinely replaced the original
text. Read-only only blocks the widget's own real, interactive keyboard
input path; it never prevents a program's own code from setting content
directly.

## Mechanical Walkthrough

- `QPlainTextEdit()` constructs a real, ready-to-use multi-line text
  widget — scrolling, text selection, copy/paste, and cursor movement
  all work immediately, with zero additional setup.
- `.setPlainText(text)` / `.toPlainText()` set and read the widget's
  entire real content as one plain Python `str` — internally the widget
  keeps a richer real document model (paragraphs, formatting), but
  these two methods deal only in flat text.
- `.setFont(QFont("Menlo", 11))` sets the real font family and point
  size used to *display* the text — `editor.font().family()` confirms
  it was genuinely applied, not merely requested (a font name Qt
  doesn't recognize on the running system would silently fall back to
  a real, different font — worth checking for real, not assumed).
- `.setReadOnly(True)` disables the widget's own real, interactive
  editing (a user's keystrokes no longer insert or delete text) while
  leaving every programmatic method (`setPlainText`, cursor
  manipulation, `insertText` via a real `QTextCursor`) fully functional.

## CS Lens

This is a real **widget with an internal model**: `QPlainTextEdit`
doesn't just render a string — it maintains its own real, structured
document object internally (accessible via `.document()`), with
`setPlainText`/`toPlainText` acting as a simplified, flat-text
interface over that richer real structure. Read-only vs. editable is a
real, distinct *interaction policy* layered on top of that model, not
a property of the model or content itself.

Also recognized in: any real rich-text or code editor component across
GUI toolkits (a browser's `contenteditable` with `readonly` set,
similarly still programmatically modifiable via JavaScript) — the same
real split between "can a human type into this" and "can code change
this" recurring wherever an editable-content widget exists at all.

## SE Lens

The real, practical reason read-only-but-programmatically-mutable
matters: a real application often wants to *show* live, changing,
read-only content (a log viewer, a diff pane, a live status display)
that updates from code while still preventing a user from accidentally
typing into and corrupting it — exactly the real shape `setReadOnly(
True)` plus continued programmatic `setPlainText`/cursor calls
provides, without needing a second, different, non-editable widget type
at all.

## Connection

Builds on `pyside6-qapplication-and-mainwindow.md`. `QFont` construction
and `.setFont(...)` are the identical real mechanism used to configure
display appearance on other widgets throughout a real PySide6
application, not unique to this one.

## Try It Yourself

1. Call `editor.clear()` and confirm `toPlainText()` returns an empty
   string — a real, dedicated method for the common "erase everything"
   case, distinct from `setPlainText("")`.
2. Construct a `QFont` with a font family name you're confident doesn't
   exist on your system (e.g. `QFont("Definitely Not A Real Font", 11)`)
   and check `.family()` afterward — observe Qt's real fallback
   behavior rather than assuming the requested name was silently
   honored.
3. With `setReadOnly(True)` still active, try (in a real, non-headless
   environment) to click into the widget and type — confirm no real
   keystroke changes the displayed text, while a follow-up
   `setPlainText(...)` call from code still works exactly as shown
   above.

## A Second Real Facet: Searching Content with `.find()`

`QPlainTextEdit` also has a real, built-in search method — worth its
own real example, since it both returns a value the caller must check
and has a real, visible side effect (moving the selection) only on
success:

```python
import sys
from PySide6.QtWidgets import QApplication, QPlainTextEdit

app = QApplication.instance() or QApplication(sys.argv)

editor = QPlainTextEdit()
editor.setPlainText("the quick brown fox\njumps over the lazy dog")

found = editor.find("brown")
print("found 'brown':", found)
print("selected text after find:", repr(editor.textCursor().selectedText()))
print("cursor position after find:", editor.textCursor().position())

not_found = editor.find("giraffe")
print("found 'giraffe':", not_found)
print("selection unchanged after a failed find:", repr(editor.textCursor().selectedText()))
```

**Real output, run this session:**
```
found 'brown': True
selected text after find: 'brown'
cursor position after find: 15
found 'giraffe': False
selection unchanged after a failed find: 'brown'
```

**What this proves:** `.find("brown")` returned `True` **and** left the
matched word genuinely selected — a real, visible side effect, not just
a boolean report. `.find("giraffe")`, finding nothing, returned `False`
**and** left the previous selection completely untouched — a failed
`find()` never clears or moves anything; the caller has to treat the
`False` return as the entire signal that nothing changed.

**What this means for a real caller:** `.find(query)` always searches
**forward from the current cursor position** — it will never find a
match that appears *before* where the cursor currently sits, even if
that match genuinely exists earlier in the document. A caller wanting
a real "search the whole document" experience has to handle that case
itself — see `pyside6-qtextcursor-position-and-selection.md` for the
real, wrap-around retry logic this project builds on top of `.find()`
for exactly that reason.

### Try It Yourself (second facet)

1. Call `editor.find("brown")` a **second** time immediately after the
   first (with no intervening cursor movement) and observe it returns
   `False` — `brown` appears only once, and the search continues
   forward from the cursor's new, post-match position, not from the
   start.
2. Look up `QTextDocument.FindFlag.FindBackward` (passed as a second
   argument to `.find()`) and use it to search backward from the
   current position instead — confirm it can find a match the default
   forward search would miss from the same starting point.
3. Search for a query that doesn't exist at all and confirm
   `editor.textCursor().position()` is completely unchanged from before
   the failed call — real, additional proof that a failed `find()` has
   zero side effects beyond its `False` return value.
