# Concept: `QTextCursor` — a Detached Snapshot, and Wrap-Around Search

**What you'll understand by the end:** whether retrieving a widget's
`QTextCursor` gives you a live reference or a detached snapshot (and
how to prove it), and how to build a real, correct "search forward,
then wrap around to the start" retry on top of a forward-only `.find()`.

**Prerequisites:** `pyside6-qplaintextedit-widget.md`,
`mutable-object-aliasing.md`.

## Setup

Python 3 with `pip install PySide6`.

## The Problem

A text widget's cursor — its current position and any active selection
— needs to be both *readable* (where is it right now?) and *movable*
(put it somewhere specific). Before writing code that moves a cursor,
there's a real, easy-to-get-wrong question: does mutating a retrieved
cursor object change the widget immediately, or is it a separate copy
that has to be explicitly handed back?

## The Isolated Example

```python
import sys
from PySide6.QtGui import QTextCursor
from PySide6.QtWidgets import QApplication, QPlainTextEdit

app = QApplication.instance() or QApplication(sys.argv)

editor = QPlainTextEdit()
editor.setPlainText("the quick brown fox\njumps over the lazy dog")
editor.moveCursor(QTextCursor.MoveOperation.End)

print("editor's real cursor position before:", editor.textCursor().position())

# Retrieve a cursor and mutate it -- does this affect the widget?
snapshot = editor.textCursor()
snapshot.movePosition(QTextCursor.MoveOperation.Start)
print("the SNAPSHOT's position after moving it:", snapshot.position())
print("editor's real cursor position -- unchanged?:", editor.textCursor().position())

# Only pushing it back explicitly actually changes the widget:
editor.setTextCursor(snapshot)
print("editor's real cursor position AFTER setTextCursor:", editor.textCursor().position())
```

**Real output, run this session:**
```
editor's real cursor position before: 43
the SNAPSHOT's position after moving it: 0
editor's real cursor position -- unchanged?: 43
editor's real cursor position AFTER setTextCursor: 0
```

**What this proves:** moving `snapshot` to position `0` had **zero**
effect on the real widget — `editor.textCursor().position()` still
reported `43`, completely unchanged, right after the mutation. Only the
explicit `editor.setTextCursor(snapshot)` call actually moved the
widget's own real cursor. `editor.textCursor()` genuinely returns a
detached **copy**, not a live, shared reference to the widget's
internal cursor state — directly answerable by testing it, exactly the
way `mutable-object-aliasing.md`'s own "is a mutation visible elsewhere"
question is answered there.

## The Isolated Example, Part 2: Wrap-Around Search

`.find()` (`pyside6-qplaintextedit-widget.md`'s second facet) only
ever searches **forward** from the cursor's current position — a real,
correct "search the whole document" needs to retry from the start if a
forward search comes up empty:

```python
def find_with_wraparound(editor, query):
    if editor.find(query):
        return True
    cursor = editor.textCursor()
    cursor.movePosition(QTextCursor.MoveOperation.Start)
    editor.setTextCursor(cursor)
    return editor.find(query)


editor = QPlainTextEdit()
editor.setPlainText("the quick brown fox\njumps over the lazy dog")

# Move the cursor PAST "quick" -- a forward-only find() from here
# would miss it without the wrap-around retry.
editor.moveCursor(QTextCursor.MoveOperation.End)

direct = editor.find("quick")
print("direct forward find() from the END finds 'quick'?:", direct)

editor.moveCursor(QTextCursor.MoveOperation.End)
wrapped = find_with_wraparound(editor, "quick")
print("find_with_wraparound() finds 'quick'?:", wrapped)
print("selected text after the successful wrap-around:", repr(editor.textCursor().selectedText()))

not_there = find_with_wraparound(editor, "giraffe")
print("find_with_wraparound() for a genuinely absent word:", not_there)
```

**Real output, run this session:**
```
direct forward find() from the END finds 'quick'?: False
find_with_wraparound() finds 'quick'?: True
selected text after the successful wrap-around: 'quick'
find_with_wraparound() for a genuinely absent word: False
```

**What this proves:** with the cursor at the document's real end, a
plain forward `.find("quick")` genuinely fails (`False`) — `"quick"`
only exists *before* the cursor's current position, and `.find()` never
looks backward on its own. `find_with_wraparound` succeeds on the
identical real starting position by explicitly moving the cursor to the
start and retrying — and correctly still reports `False` for a query
that genuinely doesn't exist anywhere, proving the retry doesn't turn
into an infinite or incorrect "always true" loop.

## Mechanical Walkthrough

- `editor.textCursor()` returns a real, independent `QTextCursor`
  **value** — a full copy of the widget's current cursor state at the
  moment it's called, not a live handle onto the widget's internals.
- `.movePosition(QTextCursor.MoveOperation.Start)` mutates *that
  specific cursor object* — moving it to the document's real start —
  with no effect on any other `QTextCursor` object, including the
  widget's own internal one.
- `editor.setTextCursor(cursor)` is the one real, required step that
  pushes a (possibly mutated) cursor *back into* the widget, making it
  the widget's actual, current cursor — this is the only way a
  retrieved-and-mutated cursor ever affects what the widget itself
  shows or searches from next.
- `find_with_wraparound` composes exactly these pieces: try the
  forward search first (the common, cheap case); on failure, reset the
  cursor to the real start and retry exactly once — a bounded,
  real search-then-restart, not an unbounded loop.

## CS Lens

This is a real, concrete instance of `mutable-object-aliasing.md`'s
own question — "does mutating this shared-looking object affect
something else?" — answered here specifically: **no**, a `QTextCursor`
retrieved via `.textCursor()` is a detached value, and `setTextCursor`
is the real, explicit synchronization point required to push a change
back. The wrap-around retry itself is a small, real instance of turning
a **linear search** into a **circular** one — conceptually identical to
searching a fixed-size array from an arbitrary starting index and
wrapping past the end back to index `0`, applied here to text positions
instead of array indices.

Also recognized in: any "resume from where you left off, wrapping
around" search (a media player's "next track," looping back to the
first after the last; a round-robin scheduler cycling back to its
first entry after reaching the end of its list).

## SE Lens

The real, practical value of confirming "snapshot, not live reference"
directly, rather than assuming it either way: code that mutates a
retrieved cursor and *forgets* `setTextCursor` fails silently — no
exception, no warning, just a widget that never visibly moved, which
can be a genuinely confusing, hard-to-diagnose real bug if the
"snapshot vs. live" question was never actually settled. The
wrap-around retry's own real design constraint — retry **exactly
once**, not in an unbounded loop — matters because a query that
genuinely doesn't exist anywhere must still terminate; a naive "keep
retrying until not found" without that bound could loop forever if
`.find()}` ever wrapped its own internal search unexpectedly.

## Connection

Builds on `pyside6-qplaintextedit-widget.md`'s `.find()` facet and
directly applies `mutable-object-aliasing.md`'s question to a new, real
Qt object. This project's own real `find_text()` method is exactly the
`find_with_wraparound` shape shown here, wired to a real
`QInputDialog.getText` prompt (`pyside6-qinputdialog-gettext.md`) and a
real `QMessageBox.information` notice on genuine failure
(`pyside6-qmessagebox-dialogs.md`).

## Try It Yourself

1. Change `find_with_wraparound` to retry in an actual `while` loop
   instead of exactly once, and construct a real scenario (hint: what
   happens if `query` is an empty string?) where an unbounded version
   could loop forever — then explain why retrying exactly once avoids
   that specific real risk.
2. Confirm `editor.textCursor()` called twice in a row, with no
   mutation or `setTextCursor` between the calls, returns two cursors
   that report equal positions but are still two separate, real Python
   objects (`is` comparison, not just `==`) — connecting directly to
   `python-is-vs-equals.md`.
3. Write a version of the wrap-around search that also reports *which*
   direction found the match (`"forward"` vs. `"wrapped"`) — useful,
   real information a caller might want to show the user (e.g., "search
   wrapped to the beginning of the document").

## A Third Real Facet: Reading the Current Line via `.block()`

A real, common need is getting the *whole line* the cursor currently
sits on — not just its numeric position — for something like a status
display:

```python
editor = QPlainTextEdit()
editor.setPlainText("N10 G0 X0 Y0\nN20 G1 X10 Y5\nN30 G1 X20 Y0")

cursor = editor.textCursor()
cursor.setPosition(20)  # somewhere inside the second line
editor.setTextCursor(cursor)

current_block = editor.textCursor().block()
print("current block's own text:", repr(current_block.text()))
print("current block number:", current_block.blockNumber())

editor.moveCursor(editor.textCursor().MoveOperation.End)
last_block = editor.textCursor().block()
print("last block's own text:", repr(last_block.text()))
```

**Real output, run this session:**
```
current block's own text: 'N20 G1 X10 Y5'
current block number: 1
last block's own text: 'N30 G1 X20 Y0'
```

**What this proves:** placing the cursor at raw character position
`20` (a position with no obvious meaning on its own) and calling
`.block()` returned the real, whole line containing that position —
`'N20 G1 X10 Y5'` — with `.blockNumber()` confirming it's the second
line (index `1`, 0-indexed). Moving the cursor to the document's end
and checking `.block()` again correctly returned the real, different
last line — `.block()` always reflects whichever block the cursor
**currently** occupies.

**Mechanical note:** `cursor.block()` returns a real `QTextBlock` (the
identical real object type `pyside6-testing-text-formatting-via-
document-layout.md`'s own `findBlockByNumber(...)` returns) — `.text()`
on it gives the block's plain-text content, and `.blockNumber()` gives
its real, 0-indexed position among all blocks in the document.

### Try It Yourself (third facet)

1. Place the cursor at the very first character of a line versus the
   very last, and confirm `.block().text()` returns the identical real
   line either way — the whole block, not just text after the cursor.
2. Compare `cursor.block().blockNumber()` against
   `editor.document().findBlockByNumber(1)` (Step 8's own technique) on
   the same document — confirm both real approaches identify the
   identical block when given matching real block numbers.
3. Edit the current line's text (`cursor.insertText("X")`) and check
   `.block().text()` again immediately afterward — confirm it reflects
   the real, just-made edit with no extra step needed to "refresh" it.

## A Fourth Real Facet: Capturing a Selection as Plain Ints, Not a Cursor Reference

This file's first facet already proved `.textCursor()` returns a
detached snapshot, not a live reference — a real, related but distinct
technique goes one step further: extracting a selection's bounds as
**plain integers**, specifically so a later change to the *actual*
selection can never affect the captured value at all:

```python
editor = QPlainTextEdit()
editor.setPlainText("the quick brown fox jumps")

cursor = editor.textCursor()
cursor.setPosition(4)
cursor.setPosition(9, QTextCursor.MoveMode.KeepAnchor)  # selects "quick"
editor.setTextCursor(cursor)

captured_range = (editor.textCursor().selectionStart(), editor.textCursor().selectionEnd())
print("captured range:", captured_range)

new_cursor = editor.textCursor()
new_cursor.setPosition(10)
new_cursor.setPosition(15, QTextCursor.MoveMode.KeepAnchor)  # selects "brown"
editor.setTextCursor(new_cursor)

print("editor's CURRENT real selection:", (editor.textCursor().selectionStart(), editor.textCursor().selectionEnd()))
print("captured_range is UNCHANGED:", captured_range)
```

**Real output, run this session:**
```
captured range: (4, 9)
editor's CURRENT real selection: (10, 15)
captured_range is UNCHANGED: (4, 9)
```

**What this proves:** `captured_range`, a plain tuple of two real
`int`s, stayed exactly `(4, 9)` even after the editor's actual
selection genuinely changed to `(10, 15)`. This is a real, deliberate
step beyond simply knowing cursors are detached snapshots
(this file's first facet) — even a *fresh* `.textCursor()` call always
reflects the widget's **current** state, so if the real goal is
"remember exactly what was selected at this one moment, permanently,"
the correct technique is capturing plain values (ints, strings) out of
the cursor, not holding onto any cursor object at all, fresh or
otherwise.

### Try It Yourself (fourth facet)

1. Try capturing `editor.textCursor()` itself (the cursor object, not
   its ints) into a variable, then change the selection, and check
   whether the captured cursor's own `.selectionStart()` reflects the
   old or new selection — compare this real result against
   `captured_range`'s own behavior above.
2. Use a captured `(start, end)` range to filter an already-computed
   list of `(match_start, match_end)` tuples down to only those falling
   inside it — a real, small filtering comprehension
   (`python-comprehension-forms-list-vs-generator.md`) combining
   directly with this file's own capture technique.
3. Explain, in your own words, why `cursor.hasSelection()` needs to be
   checked before capturing `(selectionStart(), selectionEnd())` —
   what real, incorrect range would get captured from a cursor with no
   active selection at all?

## A Fifth Real Fact: `insertText()` Replaces an Active Selection

A real, easy-to-miss mechanical fact makes find-and-replace features
possible at all: calling `.insertText(...)` on a cursor that currently
has an active selection doesn't insert text *alongside* the selection
— it **replaces** it.

```python
editor = QPlainTextEdit()
editor.setPlainText("the quick brown fox")

cursor = editor.textCursor()
cursor.setPosition(4)
cursor.setPosition(9, QTextCursor.MoveMode.KeepAnchor)  # selects "quick"
print("selected text before insertText:", repr(cursor.selectedText()))

cursor.insertText("SLOW")
editor.setTextCursor(cursor)

print("editor's real content after insertText on a selection:", repr(editor.toPlainText()))
```

**Real output, run this session:**
```
selected text before insertText: 'quick'
editor's real content after insertText on a selection: 'the SLOW brown fox'
```

**What this proves:** `"quick"` (the real, selected text) is
completely **gone** from the final content — replaced by `"SLOW"` in
place, not left sitting next to it. This one, real mechanical fact —
`insertText` on an active selection replaces rather than inserts — is
the entire real mechanism a find-and-replace feature depends on: select
a match, then insert the replacement text, and the match is genuinely
gone, swapped for the new text, in a single real operation.

### Try It Yourself (fifth fact)

1. Call `.insertText(...)` on a cursor with **no** active selection
   (just a plain position, no `KeepAnchor` move) and confirm it
   genuinely inserts alongside existing text instead of replacing
   anything — the replace-vs-insert behavior depends entirely on
   whether a selection is currently active.
2. Select a real range and call `.insertText("")` (an empty string) —
   confirm this deletes the selected text entirely, with nothing
   inserted in its place — a real, valid way to implement "delete this
   match" using the identical mechanism.
3. Chain this fact together with this file's own third facet
   (`.block()`/`.text()`): select an entire line via
   `cursor.select(QTextCursor.SelectionType.LineUnderCursor)` and
   replace it wholesale with `insertText(...)` — confirm the whole real
   line changes, not just part of it.
