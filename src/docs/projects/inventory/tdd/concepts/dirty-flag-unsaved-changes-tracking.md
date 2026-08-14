# Concept: The Dirty Flag (Unsaved-Changes Tracking)

**What you'll understand by the end:** the real, widely-recognized
pattern nearly every document-editing application uses to track "does
this have unsaved changes," how it's set and cleared, and the real,
manual-discipline risk it carries that nothing in the pattern itself
protects against.

**Prerequisites:** none beyond the assumed floor.

## Setup

None — plain Python, no packages.

## The Problem

A document-editing application needs to answer one real, recurring
question: has this document changed since it was last saved (or last
loaded)? That answer drives real, visible behavior — showing a `*` in a
title bar, warning before closing an unsaved document, greying out a
"Save" button when there's nothing new to save. Recomputing "has it
changed" by comparing the current content against the last-saved
content on every check would work, but is real, unnecessary overhead
for something that can instead just be tracked directly, as it happens.

## The Isolated Example

```python
class Document:
    def __init__(self):
        self._content = ""
        self.dirty = False

    def edit(self, new_content):
        self._content = new_content
        self.dirty = True

    def save(self):
        self.dirty = False

    def title(self, base_name):
        marker = "*" if self.dirty else ""
        return f"{marker}{base_name}"


doc = Document()
print(doc.title("report.txt"), "| dirty:", doc.dirty)

doc.edit("first draft")
print(doc.title("report.txt"), "| dirty:", doc.dirty)

doc.save()
print(doc.title("report.txt"), "| dirty:", doc.dirty)

doc.edit("second draft")
doc.edit("third draft")
print(doc.title("report.txt"), "| dirty:", doc.dirty, "(still just True, not a count)")
```

**Real output, run this session:**
```
report.txt | dirty: False
*report.txt | dirty: True
report.txt | dirty: False
*report.txt | dirty: True (still just True, not a count)
```

**What this proves:** `dirty` starts `False` on a freshly-created,
unedited document. One real `edit()` call flips it to `True`, and the
title immediately reflects that with a `*`. `save()` resets it to
`False`, clearing the marker. Two *more* edits after that still leave
`dirty` simply `True` — a plain boolean, not a count of how many
changes are pending; the flag only ever answers "any unsaved changes at
all," never "how many."

## Mechanical Walkthrough

- The **dirty flag** is a boolean (`self.dirty`) that starts `False`
  and is set `True` by any real method that mutates the document's
  actual content.
- It's reset back to `False` only at explicit **synchronization
  points** — moments where the in-memory state and the saved/persisted
  state are known to genuinely match again: after a successful save,
  and (in a real editor) also after a fresh load or a "new document"
  reset, since those also start from a state with nothing unsaved yet.
- The flag is read, not recomputed, wherever the "has this changed"
  question is asked (here, `title()`) — no comparison against previous
  content ever happens at read time; the bookkeeping was already done
  the moment the mutation occurred.
- The flag itself carries no information about *what* changed, *how
  much* changed, or *how many* separate edits happened since the last
  save — only the one, coarse yes/no fact.

## CS Lens

This is a small, real instance of a broader idea: maintaining a cheap,
incrementally-updated **summary** of state (one boolean) instead of
recomputing an expensive comparison against a reference point on every
read. The tradeoff mirrors `caching-and-memoization.md`'s own — real
speed and simplicity gained at read time, in exchange for the write
side (every mutating method) now bearing the responsibility of keeping
the summary correct.

Also recognized in: virtually every real text editor, IDE, and office
application's own "unsaved changes" indicator; version control's own
concept of a "dirty working tree" (uncommitted changes present) is the
identical underlying idea, applied to a whole repository rather than one
open document.

## SE Lens

The real, present risk this pattern carries, honestly: nothing in the
pattern itself *enforces* that every method which mutates the
document's real content remembers to set `dirty = True`. It's manual
discipline — a plain assignment a future method has to remember to
include — not a compiler- or framework-checked guarantee. A future
method added later that mutates `_content` directly, or through some
new path, and forgets to set `dirty`, would silently produce a document
whose real content has genuinely changed but whose title still claims
"no unsaved changes," with no error, warning, or test failure anywhere
to catch it unless a test specifically exercises that exact new path.
This is a real, worth-naming class of bug risk, not a hypothetical one
— it's exactly the kind of thing `single-responsibility-principle.md`'s
own discipline (one clear place responsible for one clear thing) helps
guard against, by keeping "does this method mutate content" and "does
this method remember the flag" as close together and as few places as
possible.

## Connection

The signal that typically *drives* setting a dirty flag in a real GUI
is a widget's own change notification — see `pyside6-signals-and-
slots.md`'s `textChanged` example for the actual mechanism a real text
editor uses to detect "the content just changed" in the first place;
this file is deliberately about what happens *after* that detection
(what state gets tracked and why), not the detection itself.

## Try It Yourself

1. Add a second mutating method to `Document` (say, `rename()` that
   changes some unrelated metadata, not `_content`) and decide, and
   justify, whether it should set `dirty = True` — a real design
   judgment call, not a mechanical rule.
2. Deliberately add a new "mutates content" method that forgets to set
   `dirty = True`, then write a test that would have caught the bug —
   confirm no *other* test in this file's own examples would have
   caught it, concretely demonstrating the real risk named above.
3. Extend `Document` to track *when* it became dirty (a timestamp set
   alongside the flag) and use it to answer a richer real question:
   "how long has this document had unsaved changes?"
