# Concept: Live (Two-Way) Binding vs. Staged-Commit Editing

**What you'll understand by the end:** two genuinely different, both
legitimate real ways a form can relate to the real data it edits —
writing every change immediately into the real, shared object, versus
holding edits in a separate draft until an explicit "Apply" — and how
to recognize which one a given real form is actually using.

**Prerequisites:** `mutable-object-aliasing.md`.

## Setup

None — plain Python, no packages.

## The Problem

A real, editable form needs to decide, as a real design choice, *when*
a field's new value actually reaches the underlying object it
describes: the instant the user changes it, or only once they
explicitly confirm the whole set of changes. These are two genuinely
different real behaviors with different real consequences for what
"cancel," a crash mid-edit, or another part of the program reading the
same object concurrently would actually see.

## The Isolated Example

```python
class Assignment:
    def __init__(self, channel):
        self.channel = channel


class LiveBoundForm:
    """Every field change writes IMMEDIATELY into the real, shared object."""

    def __init__(self, assignment):
        self.assignment = assignment

    def on_field_changed(self, new_value):
        self.assignment.channel = new_value


class StagedForm:
    """Edits accumulate in a LOCAL draft; nothing real changes until Apply."""

    def __init__(self, assignment):
        self.assignment = assignment
        self.draft_channel = assignment.channel

    def on_field_changed(self, new_value):
        self.draft_channel = new_value

    def apply(self):
        self.assignment.channel = self.draft_channel


real = Assignment(channel=1)
live = LiveBoundForm(real)
live.on_field_changed(5)
print("live-bound: real object updated IMMEDIATELY:", real.channel)

real2 = Assignment(channel=1)
staged = StagedForm(real2)
staged.on_field_changed(5)
print("staged: real object UNCHANGED until apply():", real2.channel)
staged.apply()
print("staged: real object updated AFTER apply():", real2.channel)
```

**Real output, run this session:**
```
live-bound: real object updated IMMEDIATELY: 5
staged: real object UNCHANGED until apply(): 1
staged: real object updated AFTER apply(): 5
```

**What this proves:** the live-bound form's real, shared
`Assignment` object changed **immediately** on the first edit — no
separate confirmation step exists. The staged form's real object
stayed completely **unchanged** after the identical edit — genuinely
still `1`, its original value — right up until `.apply()` was called
explicitly; only then did the real object actually change.

## Mechanical Walkthrough

- **Live binding**: a field's change handler writes directly into the
  real, shared object's own attribute — there is no intermediate,
  separate "draft" state at all; the UI and the underlying data are, at
  every moment, the same real thing.
- **Staged-commit editing**: a field's change handler writes into a
  **separate**, local draft value — the real, shared object is
  completely untouched until an explicit, real "commit" step (`.apply()`
  here, an "OK"/"Save" button in a real UI) copies the draft values
  over.
- Both are real, complete, valid designs — the difference is entirely
  about *when* a change becomes real and visible to anything else that
  might read the same underlying object.

## CS Lens

This is the real, general distinction between **eager** and
**deferred** mutation — the same underlying tension `python-context-
manager-with-statement.md`'s own transactional framing touches on for
resource cleanup, applied here to user-facing edits instead. Live
binding trades away any real "cancel and discard everything" capability
in exchange for simplicity (no draft state to manage at all, no
explicit sync step ever needed); staged-commit trades a small, real
amount of extra bookkeeping (a separate draft, an explicit apply step)
for a genuine, real "nothing changes until confirmed" guarantee.

Also recognized in: a database transaction (staged — nothing is
visible to other real readers until `COMMIT`) versus autocommit mode
(live — every statement takes effect immediately); a version-control
working directory (staged — `git add`/`git commit` are explicit,
separate steps from editing a file) versus a live-collaborative
document editor (every keystroke is immediately visible to every real,
concurrent viewer).

## SE Lens

The real, practical choice depends on what a real form is actually
for: live binding is the right, simpler real choice when there's no
real need for "cancel" to mean anything beyond "stop editing, whatever
was typed already happened" — appropriate for a form directly, always
reflecting one specific, currently-open real object with no competing
concurrent access. Staged-commit is the right, more complex real
choice when a genuine "discard my changes" or "review before saving"
capability matters, or when partially-applied changes mid-edit would
be a real, meaningfully bad state for anything else in the system to
observe.

## Connection

Builds on `mutable-object-aliasing.md`. A details/settings panel that
always reflects one specific, currently-open real object — never several
at once, never a saved-elsewhere draft — is the common real case where
live binding is deliberately chosen over staged-commit, for exactly the
"always reflects the one open real thing" reasoning this file's own SE
Lens names. Live binding's own real correctness — when several widgets
are updated *programmatically* at once, rather than by a real user edit
— depends on `reentrancy-guard-flag-for-programmatic-updates.md`'s own
real technique to avoid corrupting the very object being loaded.

## Try It Yourself

1. Add a real "cancel" operation to `StagedForm` (simply discard the
   draft, never calling `.apply()`) and confirm the real, shared object
   is left completely untouched — a real capability `LiveBoundForm`
   cannot offer at all, once a change has already been written.
2. Add a second, independent `LiveBoundForm` pointed at the identical
   real `Assignment` object, make an edit through one, and confirm the
   other immediately reflects it too — a real, direct consequence of
   there being no draft state separating either form from the shared
   object.
3. Identify a real, existing form (in this project or elsewhere) and
   determine, by reading its own code, which of the two real styles it
   actually uses — reasoning about whether that choice matches what
   the form is actually for.
