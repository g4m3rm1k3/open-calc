# Concept: Promoting Shared State to Per-Instance State for Multiplicity

**What you'll understand by the end:** why state that was correctly
shared (a single "current path," a single "dirty" flag) becomes a real
bug the moment an application needs to support *more than one* of the
thing that state describes at once — and the real fix: moving that
state onto each individual instance instead of leaving it shared.

**Prerequisites:** `python-classes-instances.md`,
`single-responsibility-principle.md`.

## Setup

None — plain Python, no packages.

## The Problem

A real application often starts by supporting exactly one of
something — one open document, one active connection — and tracking
that thing's state in one shared place (a global, a single attribute
on a top-level object) is completely correct as long as that
assumption genuinely holds. The moment a real, new requirement breaks
that assumption — supporting *several* open documents at once — the
identical, previously-correct shared state becomes a real, concrete
bug: every instance now silently competes for the same single slot.

## The Isolated Example

Before — one shared, module-level "current document" state:

```python
current_path = None
dirty = False


def open_document(path):
    global current_path, dirty
    current_path = path
    dirty = False


def edit_document():
    global dirty
    dirty = True


open_document("report.txt")
edit_document()
open_document("notes.md")  # a SECOND document opened -- but there's only one real slot
print("after opening notes.md, current_path:", current_path)
print("report.txt's own dirty status was LOST -- global dirty is now:", dirty)
```

**Real output, run this session:**
```
after opening notes.md, current_path: notes.md
report.txt's own dirty status was LOST -- global dirty is now: False
```

After — state moved onto each instance:

```python
class Document:
    def __init__(self, path):
        self.path = path
        self.dirty = False

    def edit(self):
        self.dirty = True


doc1 = Document("report.txt")
doc1.edit()
doc2 = Document("notes.md")

print("doc1.path:", doc1.path, "| doc1.dirty:", doc1.dirty)
print("doc2.path:", doc2.path, "| doc2.dirty:", doc2.dirty)
```

**Real output, run this session:**
```
doc1.path: report.txt | doc1.dirty: True
doc2.path: notes.md | doc2.dirty: False
```

**What this proves:** with shared, module-level state, opening a
**second** real document (`"notes.md"`) genuinely **destroyed** the
first document's own real state — `report.txt`'s own `dirty: True`
status is completely gone, silently replaced by the second document's
fresh `False`. With state moved onto each `Document` instance, both
real documents track their own path and dirty status **completely
independently** — `doc1.dirty` staying `True` while `doc2.dirty` is
`False`, simultaneously, correctly.

## Mechanical Walkthrough

- Shared state (a module-level global, or a single attribute on one
  top-level "owner" object) has exactly **one** real slot — every
  operation reads and writes that same one place, which is correct
  precisely when there's only ever one real "current" thing to track.
- The moment a second, independent real instance needs to exist at the
  same time, shared state can't distinguish between them — every write
  overwrites whatever the *previous* instance's operations left there,
  with no error, no warning, just silently wrong data.
- The real fix is structural, not a bug patch: state genuinely
  describing *one specific document* has to actually live *on* that
  document — each `Document` instance carries its own `path`/`dirty`,
  so operations on `doc1` can never collide with `doc2`'s own state at
  all, because they're no longer the same real storage location.
- This is a real, structural move, not just a rename — every piece of
  code that used to read/write the shared global now has to go through
  a specific instance instead (`doc1.dirty` instead of bare `dirty`),
  which is exactly why this kind of change tends to touch many call
  sites at once in a real, larger codebase.

## CS Lens

This is the real, general distinction between **singleton-shaped
state** (correct for exactly one logical instance) and **per-instance
state** (correct for however many logical instances actually exist) —
promoting from the former to the latter is a real, common consequence
of a system's own requirements changing from "there is one" to "there
can be several." It's a genuinely different real move from `move-
method-refactoring.md`'s own idea (relocating a *method* to the class
whose data it already depends on, a pure, behavior-preserving cleanup)
— this file's own move relocates *state itself*, and is driven by a
real, new requirement (multiplicity) rather than being a pure
refactor with no behavior change.

Also recognized in: a web server naively storing "the current logged-in
user" in a single global variable, correct only for a single-user
prototype, becoming a real, serious bug (or security issue) the moment
multiple concurrent users/sessions need to be supported — the fix is
the identical real move: promote that state onto a per-request or
per-session object instead of a shared global.

## SE Lens

The real, practical warning sign this pattern teaches: shared,
singleton-shaped state is often *correct* for a long time, right up
until a real, new requirement (multiplicity) silently invalidates the
assumption it was built on — and because the original code was
genuinely correct when written, the resulting bug can be surprising,
showing up only once multiplicity is actually exercised, not from any
mistake in the original design. Recognizing "this state describes one
specific X" as a real signal — even while there's still only one X in
practice — is worth doing proactively when multiplicity is a
plausible, foreseeable future requirement, though `avoid-premature-
abstraction.md`'s own judgment call still applies: don't promote state
prematurely for a multiplicity requirement that may never actually
arrive.

## Connection

Builds on `python-classes-instances.md` (the real mechanism state gets
promoted *onto*) and `single-responsibility-principle.md` (each
instance now genuinely owns and is responsible for its own state).
Distinct from `move-method-refactoring.md` — that file relocates
behavior with no requirement change; this file relocates state,
specifically driven by a new multiplicity requirement.

## Try It Yourself

1. Add a third, real "document" opened through the shared-global
   version and confirm the identical real collision happens again —
   the bug isn't specific to exactly two instances.
2. Extend the per-instance `Document` version with a real list holding
   several open documents at once (`documents = [doc1, doc2]`) and a
   function finding "the currently active one" by index — confirming
   the promoted state genuinely supports the multiplicity the shared
   version never could.
3. Find (or recall) a real, shared/global piece of state in a codebase
   you've worked with, and reason about whether it's genuinely
   singleton-shaped (correct as shared) or a real, latent instance of
   this exact bug waiting for a multiplicity requirement to expose it.

## A Second Real Facet: the Mirror-Image Move — Demoting Per-Instance State Onto a Shared Owner

This file's own first facet promotes state from one shared slot to
many per-instance slots, when a single *thing being described* turns
into several. A real, opposite-direction version of the identical
underlying "does this state have the right owner" question shows up
when it's the **viewers** of one thing that multiply, not the thing
itself: several independent objects (views) all showing the *same*
one real underlying document.

```python
class Document:
    def __init__(self, text):
        self.text = text


class View:
    def __init__(self, document):
        self.document = document
        self.dirty = False  # per-VIEW state -- about to be the wrong choice

    def edit(self, addition):
        self.document.text += addition
        self.dirty = True


doc = Document("hello")
view_a = View(doc)
view_b = View(doc)  # a SECOND view of the SAME document

view_a.edit(" world")

print("view_a.dirty:", view_a.dirty)
print("view_b.dirty:", view_b.dirty, "-- but the document view_b shows HAS unsaved changes too!")
```

**Real output, run this session:**
```
view_a.dirty: True
view_b.dirty: False -- but the document view_b shows HAS unsaved changes too!
```

**What this proves:** `dirty` stored **on each `View`** genuinely gave
the wrong answer for `view_b` — the real underlying document it's
showing (the same `doc` object `view_a` also edits) has genuinely
unsaved changes, but `view_b`'s own, separate `dirty` flag never heard
about the edit `view_a` made, because each view tracked its own copy
of state that actually describes the shared document, not the view.

**The fix — move `dirty` onto the shared `Document` instead:**

```python
class Document2:
    def __init__(self, text):
        self.text = text
        self.dirty = False


class View2:
    def __init__(self, document):
        self.document = document

    def edit(self, addition):
        self.document.text += addition
        self.document.dirty = True  # state moved ONTO the shared document


doc2 = Document2("hello")
view2_a = View2(doc2)
view2_b = View2(doc2)

view2_a.edit(" world")

print("doc2.dirty (checked via view2_a.document):", view2_a.document.dirty)
print("doc2.dirty (checked via view2_b.document):", view2_b.document.dirty)
```

**Real output, run this session:**
```
doc2.dirty (checked via view2_a.document): True
doc2.dirty (checked via view2_b.document): True
```

**What this proves:** with `dirty` stored on the shared `Document2`
instance instead of on each `View2`, both `view2_a` and `view2_b`
genuinely, correctly agree — because there's only one real place that
value is stored, read through whichever view happens to ask.

**Mechanical note — how this is the mirror image, not a
contradiction, of this file's first facet:** both facets ask the
identical real question — "does this state genuinely describe *one*
of the thing that owns it, or does it need to be shared?" — and answer
it by moving state to wherever it's structurally accurate. The first
facet's bug was state shared when it should have been per-instance
(multiple real documents wrongly sharing one slot); this facet's bug
is the opposite — state kept per-instance when it should have been
shared (multiple views of one real document wrongly keeping separate
copies). Which direction is correct depends entirely on what's
actually multiplying: the thing being described, or the things
describing it.

### Try It Yourself (second facet)

1. Add a third `View2` of the same `doc2` and confirm all three agree
   on `dirty` immediately after any one of them edits — real proof
   this scales past two viewers the same way the first facet's fix
   scaled past two documents.
2. Give `View2` a second document (`view2_c = View2(Document2("separate"))`)
   and confirm its `dirty` is correctly independent of `doc2`'s — real
   proof shared-per-document state still correctly distinguishes
   between genuinely different documents, it only merges state for
   views of the *same* one.
3. Reason about which of this project's own two multiplicity moves —
   promoting state per-instance, or demoting it onto a shared owner —
   would be the right fix for a real bug you're given, based on
   whether the thing multiplying is the described object or its
   viewers.
