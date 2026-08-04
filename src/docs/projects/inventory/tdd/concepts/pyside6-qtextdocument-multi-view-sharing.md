# Concept: Sharing One `QTextDocument` Across Two Independent Views

**What you'll understand by the end:** how `QPlainTextEdit.setDocument`
lets two genuinely independent widgets display and edit the *same*
underlying `QTextDocument` — a real, live, two-way link, not a copy —
and why properties like `isModified()` come "for free" already shared
across every view once this is set up.

**Prerequisites:** `pyside6-qplaintextedit-widget.md`,
`mutable-object-aliasing.md`.

## Setup

Python 3 with `pip install PySide6`.

## The Problem

Showing the same real text in two places at once — a split editor, a
"preview alongside the source" layout — could be done by copying the
text from one widget into another, but a copy immediately goes stale:
edit one side, and the other still shows whatever it had at copy time,
with no code anywhere keeping them in sync. What's actually needed is
two widgets that are two different *views*, both looking at the exact
same underlying real data.

## The Isolated Example

```python
view_a = QPlainTextEdit()
view_a.setPlainText("line one\nline two")

view_b = QPlainTextEdit()  # starts with its own, independent, empty document

print("BEFORE sharing -- view_b text:", repr(view_b.toPlainText()))
print("BEFORE sharing -- same document object:", view_a.document() is view_b.document())
```

**Real output, run this session:**
```
BEFORE sharing -- view_b text: ''
BEFORE sharing -- same document object: False
```

**What this proves:** every `QPlainTextEdit` owns its own real,
independent `QTextDocument` by default — `view_a` and `view_b` genuinely
have two separate document objects, confirmed directly (`is` reports
`False`), which is exactly why `view_b` starts out empty despite
`view_a` already having real text.

The fix — pointing `view_b` at `view_a`'s own document instead of its
own:

```python
view_b.setDocument(view_a.document())

print("AFTER sharing -- view_b text:", repr(view_b.toPlainText()))
print("AFTER sharing -- same document object:", view_a.document() is view_b.document())
```

**Real output, run this session:**
```
AFTER sharing -- view_b text: 'line one\nline two'
AFTER sharing -- same document object: True
```

**What this proves:** `view_b` genuinely now displays `view_a`'s exact
real text — not a copy of it — confirmed by `is` now reporting `True`:
both widgets' `.document()` calls return the literal same object.

Now a real edit made *through* `view_b`:

```python
cursor = view_b.textCursor()
cursor.movePosition(QTextCursor.MoveOperation.End)
cursor.insertText(" typed via view_b")

print("AFTER editing via view_b -- view_a text:", repr(view_a.toPlainText()))
print("AFTER editing via view_b -- view_a.document().isModified():", view_a.document().isModified())
```

**Real output, run this session:**
```
AFTER editing via view_b -- view_a text: 'line one\nline two typed via view_b'
AFTER editing via view_b -- view_a.document().isModified(): True
```

**What this proves:** text typed **through `view_b`** genuinely shows
up when reading `view_a` — real, live, two-way sharing, with zero
manual sync code written anywhere. `view_a.document().isModified()`
also correctly reports `True`, even though the edit happened via
`view_b`'s own cursor — `isModified()` is a property of the shared
*document*, not of either individual view, so it's automatically
correct regardless of which view made the change.

## Mechanical Walkthrough

- Every `QPlainTextEdit` (and `QTextEdit`) owns its own
  `QTextDocument` by default, created automatically at construction —
  this is what actually stores the real text content; the widget
  itself is just one way of *displaying and editing* it.
- `widget.setDocument(other_document)` replaces a widget's own default
  document with a different, existing one — a real reparenting-like
  operation on the *document*, not the widget. The widget's previous
  document (if nothing else references it) becomes unused; the new one
  is now what the widget actually reads from and writes to.
- Any state Qt tracks **on the document itself** — `isModified()`,
  the real text content, undo history — is automatically, correctly
  shared the moment two widgets point at the same document object.
  There is no separate step to "sync" it; there is only ever one real
  document being read.
- Any state a widget tracks **on itself** (cursor position, current
  scroll offset, text selection) stays genuinely per-view — two
  widgets sharing one document can each have their own cursor sitting
  at a different line, which is exactly the real, useful behavior a
  split editor needs.

## CS Lens

This is a real, applied instance of the **Model-View** idea (already
named more generally in `pyside6-model-view-with-qfilesystemmodel.md`):
`QTextDocument` is the real, single source of truth (the model);
`QPlainTextEdit` is one of potentially several independent *views* onto
it. Two views sharing one model is precisely how Model-View
architectures avoid the sync problem a naive copy-based approach runs
into — there's only ever one real place the data lives, so there's
nothing that could ever go out of sync in the first place.

Also recognized in: two browser tabs' `document.execCommand`-style
collaborative editors sharing one underlying CRDT/OT document; a
spreadsheet's formula bar and its corresponding cell both displaying
(and both able to edit) the exact same underlying cell value.

## SE Lens

The real, practical payoff: any code that already correctly reacts to
document-level state (a `textChanged` signal, `isModified()`) keeps
working completely unchanged once a second view is added — it was
never watching a *view*, it was already watching the *document*,
which is still the one true source of that state. The real, honest
risk this same sharing creates: any state a class stores
**per-widget** silently stops being correct the moment that widget's
document might be shared — `mutable-object-aliasing.md`'s own general
warning about mutation surprising a second reference-holder, applied
here specifically to a widget's own document.

## Connection

Builds on `pyside6-qplaintextedit-widget.md` and connects directly to
`mutable-object-aliasing.md` (this is the deliberate-use facet of that
same underlying idea — two independent variables/widgets intentionally
aliasing the same real, mutable object). A real, applied instance in
this project's own history: a 3D backplot view needing to show a
program's real source code alongside its 3D preview, without
disturbing the program's own already-open editor tab — a second,
independent `DocumentEditor` widget was created and pointed at the
first one's document via `setDocument`, so both views edit the exact
same live program; the existing dirty-tracking and file-path logic
needed no new sync code at all, once they were moved (via
`python-property-decorator.md`'s own real instance) onto the shared
document itself rather than staying per-widget.

## Try It Yourself

1. Add a **third** `QPlainTextEdit`, also pointed at `view_a.document()`
   via `setDocument`, and confirm an edit made through *any one* of the
   three shows up when reading any of the others — real proof this
   scales past two views.
2. Give `view_b` its own, brand-new `QTextDocument` again
   (`view_b.setDocument(QTextDocument())`) after having shared it, and
   confirm `view_a`'s own text is completely unaffected — real,
   concrete proof that "un-sharing" a view doesn't touch the document
   the *other* view still owns.
3. Compare each widget's own `.textCursor().position()` while sharing
   one document — confirm each view genuinely tracks its own,
   independent cursor position even while displaying identical shared
   text, direct proof of which state is per-document and which is
   per-view.

## A Real Correction: a `QSyntaxHighlighter` Is Owned by the View That Created It, Not the Document

This file's own Mechanical Walkthrough draws a clean line: document-
level state (`isModified()`, content, undo history) is automatically
shared; widget-level state is not. A real, easy-to-miss third case sits
right at that boundary: a `QSyntaxHighlighter` is *constructed against*
a `QTextDocument` (it's passed the document in its own constructor,
per `pyside6-qtextcharformat-and-qcolor.md`), which makes it feel
document-owned — but the *Python reference* to that highlighter object
still lives wherever the code that created it stored it, typically as
an attribute on the view, not the document.

```python
class DocumentEditor(NumberedEditor):
    def __init__(self):
        super().__init__()
        self.highlighter = GCodeHighlighter(self.document())

    def share_document_from(self, other):
        self.setDocument(other.document())
        # Without this line, self.highlighter still points at this
        # view's own now-orphaned, discarded original document's
        # highlighter — a real, live object attached to a document
        # nothing displays anymore.
        self.highlighter = other.highlighter
```

**What this proves, reasoned from this file's own established
mechanics:** `self.setDocument(other.document())` alone genuinely makes
`self` *display* `other`'s real text — this file's own core proof —
but does nothing at all to `self.highlighter`, a completely separate
Python attribute that still holds a reference to the *original*
`GCodeHighlighter`, built against `self`'s now-discarded prior
document. That original highlighter keeps working — it's still a real,
live `QSyntaxHighlighter` attached to *some* document — it's simply the
wrong one: the orphaned original, not the one now actually being
displayed by either view. `self.highlighter = other.highlighter` is
the second, necessary line: explicitly re-pointing this view's own
Python reference at the *same* highlighter instance the other view
already uses, so both views genuinely share one highlighter watching
one document, not two independent highlighters each watching a
different document (one of them no longer shown anywhere).

**Why this doesn't contradict the file's own "document state is
free" claim:** `setDocument` really does hand over every real,
Qt-tracked document property automatically. A highlighter *reference*
stored as a plain Python attribute on the view is not a Qt-tracked
document property at all — it's ordinary, per-widget application state
that happens to point at something document-shaped, and it follows
this file's own general per-widget-state rule (stays independent unless
explicitly reassigned), not the document-state rule a reader might
assume from the highlighter's own constructor shape.

### Try It Yourself (correction)

1. Deliberately omit `self.highlighter = other.highlighter` and confirm
   syntax highlighting on newly-typed text in `self` genuinely stops
   working (or applies to the wrong, orphaned document) — real, direct
   proof of the bug this line fixes.
2. Check whether the orphaned original highlighter and document are
   ever actually freed, using `pyside6-qt-python-object-lifetime-and-
   references.md`'s own real technique — reasoning about whether
   forgetting this reassignment also leaks memory, not just breaks
   highlighting.
3. Name one other piece of state, besides the highlighter, that this
   project's own `DocumentEditor` stores as a plain attribute rather
   than on the document itself, and reason about whether `share_
   document_from` would need to explicitly reassign it too.
