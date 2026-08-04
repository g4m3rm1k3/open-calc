# Concept: `beginEditBlock`/`endEditBlock` — Grouping Edits into One Undo Step

**What you'll understand by the end:** how wrapping several otherwise-
independent document edits in `beginEditBlock()`/`endEditBlock()` makes
them undo together as a single real step, and the real, honest cost of
skipping it.

**Prerequisites:** `pyside6-qtextcursor-position-and-selection.md`.

## Setup

Python 3 with `pip install PySide6`.

## The Problem

A single real, user-facing action — "Replace All" — often has to
perform several separate, individual text edits under the hood (one
per match). Without any special handling, a real text widget's own
undo stack treats each individual edit as its own separate undo step —
meaning a user who wants to undo one "Replace All" action has to press
Undo once *per match* to fully revert it, a real, confusing mismatch
between what the user did (one action) and what undoing it requires
(many presses).

## The Isolated Example

Grouped into one real undo step:

```python
import sys
from PySide6.QtGui import QTextCursor
from PySide6.QtWidgets import QApplication, QPlainTextEdit

app = QApplication.instance() or QApplication(sys.argv)

editor = QPlainTextEdit()
editor.setPlainText("cat cat cat")

edit_cursor = editor.textCursor()
edit_cursor.beginEditBlock()

positions = [0, 4, 8]
for start in sorted(positions, reverse=True):
    c = editor.textCursor()
    c.setPosition(start)
    c.setPosition(start + 3, QTextCursor.MoveMode.KeepAnchor)
    c.insertText("dog")

edit_cursor.endEditBlock()

print("after 3 replacements:", repr(editor.toPlainText()))

editor.undo()
print("after ONE undo():     ", repr(editor.toPlainText()))
```

**Real output, run this session:**
```
after 3 replacements: 'dog dog dog'
after ONE undo():      'cat cat cat'
```

The identical three edits, **without** the edit block:

```python
editor = QPlainTextEdit()
editor.setPlainText("cat cat cat")

for start in sorted(positions, reverse=True):
    c = editor.textCursor()
    c.setPosition(start)
    c.setPosition(start + 3, QTextCursor.MoveMode.KeepAnchor)
    c.insertText("dog")

editor.undo()
print("after ONE undo():     ", repr(editor.toPlainText()))
editor.undo()
print("after a SECOND undo():", repr(editor.toPlainText()))
editor.undo()
print("after a THIRD undo(): ", repr(editor.toPlainText()))
```

**Real output, run this session:**
```
after ONE undo():     'cat dog dog'
after a SECOND undo(): 'cat cat dog'
after a THIRD undo():  'cat cat cat'
```

**What this proves:** with `beginEditBlock`/`endEditBlock`, a single
`editor.undo()` call reverted **all three** replacements at once —
back to the fully original `'cat cat cat'`. Without it, the identical
three edits required **three separate** `undo()` calls, each reverting
exactly one replacement, leaving the document in a real, genuinely
intermediate state (`'cat dog dog'`) between presses — a state the
user never actually saw or asked for as a distinct step.

## Mechanical Walkthrough

- `beginEditBlock()`/`endEditBlock()` are called on a `QTextCursor`,
  but they mark boundaries on the **document's own** undo stack, not
  something private to that one cursor instance — any edits made
  through *any* cursor on the same document, between the two calls,
  get grouped into the same real undo step.
- Every real `insertText(...)` call inside the block still executes
  immediately, in order, exactly as it would without the block — the
  block doesn't defer or batch the edits themselves, only how they're
  recorded on the undo stack.
- `endEditBlock()` must be called to close the group — an edit block
  left open (an early `return`, an unhandled exception between the two
  calls) would incorrectly continue grouping *later*, unrelated edits
  into the same undo step, a real, worth-guarding-against risk in
  code more complex than this isolated example.

## CS Lens

This is a document-editing widget's own real, local version of a
database **transaction** (`sql-transactions-and-commit.md`): several
individual mutations grouped into one atomic unit *from the outside
observer's perspective* — a database client sees an all-or-nothing
commit; here, the document's undo stack sees one single, reversible
step. These are genuinely different real APIs solving analogous
problems in unrelated systems (an in-memory document's undo history
vs. a database's durable transaction log) — worth recognizing the
shared underlying pattern (group several changes so they're observed
and reverted as one) without conflating the two as the same mechanism.

Also recognized in: any "batch operation, single undo" feature across
real editing software (a vector graphics tool grouping a multi-object
move into one undo step; a spreadsheet grouping a fill-down operation
the same way).

## SE Lens

The real, practical payoff: a user's mental model of "I did one thing"
(Replace All) stays matched to "I can undo one thing" — without
grouping, the mismatch between a single logical action and many
individual undo steps is a real, concrete usability regression, however
technically correct each individual edit is on its own. The real cost
of skipping this: not a crash, not a data-loss bug, but a subtly
frustrating, real user experience that only shows up the first time
someone actually tries to undo a batch operation.

## Connection

Builds on `pyside6-qtextcursor-position-and-selection.md`. Draws a
real, deliberate — but not literal — parallel to
`sql-transactions-and-commit.md`'s own atomicity guarantee, worth
citing as the same underlying idea recurring in a completely different
real system, not the identical mechanism.

## Try It Yourself

1. Deliberately leave `endEditBlock()` uncalled (comment it out) and
   perform one more, unrelated edit afterward — confirm that later edit
   gets incorrectly swept into the same undo group, direct, real proof
   of the risk an unclosed block carries.
2. Nest a second `beginEditBlock()`/`endEditBlock()` pair inside the
   first and research (or test) how Qt's own real nesting behavior
   works — does the inner block create its own separate undo step, or
   does it merge into the outer one?
3. Time how long grouping actually matters in practice: replace a
   genuinely large number of matches (say, 500) both with and without
   an edit block, and count how many real `undo()` presses each version
   would require to fully revert — connecting the abstract idea to a
   concrete, real-scale consequence.

## A Real Second Facet: `insertText` Doesn't Compare — Even Identical Text Still Creates a Real Edit

A real, easy-to-assume-away detail: replacing a selection with text
that happens to be **character-for-character identical** to what was
already there still counts as a real edit, with real, unwanted
side effects.

```python
import sys
from PySide6.QtGui import QTextCursor
from PySide6.QtWidgets import QApplication, QPlainTextEdit

app = QApplication.instance() or QApplication(sys.argv)

editor = QPlainTextEdit()
editor.setPlainText("G00X0Y0")
editor.document().setModified(False)

print("isModified before:", editor.document().isModified())
print("isUndoAvailable before:", editor.document().isUndoAvailable())

original = editor.toPlainText()
stripped = original  # identical -- nothing to strip

cursor = editor.textCursor()
cursor.beginEditBlock()
cursor.setPosition(0)
cursor.setPosition(len(original), QTextCursor.MoveMode.KeepAnchor)
cursor.insertText(stripped)
cursor.endEditBlock()

print("isModified after inserting IDENTICAL text:", editor.document().isModified())
print("isUndoAvailable after inserting IDENTICAL text:", editor.document().isUndoAvailable())
```

**Real output, run this session:**
```
isModified before: False
isUndoAvailable before: False
isModified after inserting IDENTICAL text: True
isUndoAvailable after inserting IDENTICAL text: True
```

**What this proves:** `stripped` and `original` are the exact same
real string — nothing about the document's actual, visible content
changed at all — yet `isModified()` and `isUndoAvailable()` both
flipped to `True` regardless. `insertText` genuinely never compares
its argument against the text it's replacing; select-then-insertText
is an unconditional real edit, recorded on the undo stack and marked
dirty, exactly as if the content had actually changed.

**The real, practical fix — check *before* touching the cursor at
all:**

```python
if stripped == original:
    return  # skip the whole edit block -- nothing to do
```

**Mechanical note — why this has to happen before `beginEditBlock`,
not inside it:** this file's own first facet already shows
`beginEditBlock`/`endEditBlock` groups *however many* real edits
happen between the two calls into one undo step — but grouping only
controls how many edits are *recorded as*, not whether a genuinely
unnecessary edit happens at all. Skipping the equality-guarded case
entirely, before any cursor work, is the only way to leave `isModified()`
and the undo stack completely untouched — not "grouped into a smaller
no-op step," but genuinely never touched.

**Why this matters beyond a technically-harmless no-op:** a document
that reports `isModified() == True` typically drives real, visible UI
— a dirty-flag asterisk in a tab title, a "discard unsaved changes?"
prompt on close. Flipping that state for an edit that changed *nothing
visible* is a real, user-facing false signal: a user would be asked to
save (or warned about losing) a change that, textually, never actually
happened.

### Try It Yourself (second facet)

1. Remove the `if stripped == original: return` guard from a real
   "normalize this text" feature and trigger it twice in a row on
   already-normalized text — confirm the tab/document reports dirty
   both times, even though the second run changed literally nothing.
2. Check whether `QPlainTextEdit.setPlainText(same_text)` (a full
   document replace, not a cursor-based selection-and-insert) has the
   identical "no comparison, always counts as an edit" behavior, or
   whether it behaves differently — real, direct proof of whether this
   fact is specific to `insertText` or applies more broadly.
3. Write a small, generic helper, `replace_if_different(cursor, start,
   end, new_text)`, that performs the equality check internally before
   ever touching the cursor, and reason about whether that guard
   belongs inside a shared helper (once) or at each call site (every
   time) in a real codebase with several similar "normalize the whole
   document" features.
