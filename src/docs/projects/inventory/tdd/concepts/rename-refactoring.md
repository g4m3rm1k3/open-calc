# Concept: Rename (Refactoring)

**What you'll understand by the end:** the real, named refactoring for
changing a class, method, or variable's name to accurately reflect
what it actually does, once that's become clearer than the original
name — a pure, behavior-preserving change, distinct from relocating
code (Move Method) or restructuring it.

**Prerequisites:** `move-method-refactoring.md`.

## Setup

None — plain Python, no packages.

## The Problem

A name chosen early — before a class or function's real, final scope
was fully clear — can end up vague, misleading, or simply wrong once
its actual behavior settles. `ProgramDetailsPanel` sounds like it might
edit a program's details broadly; if what it actually, narrowly does
is edit one specific real thing (which machine/controller/channel a
program is *assigned* to), the original name actively misleads a
reader about the real scope of what the code does.

## The Isolated Example

```python
class ProgramDetailsPanel:
    def __init__(self):
        self.machine_id = None
        self.channel = 1


def build_panel_before():
    return ProgramDetailsPanel()


class ProgramAssignmentPanel:
    def __init__(self):
        self.machine_id = None
        self.channel = 1


def build_panel_after():
    return ProgramAssignmentPanel()


before = build_panel_before()
after = build_panel_after()

print("before:", type(before).__name__, vars(before))
print("after: ", type(after).__name__, vars(after))
print("identical real behavior, only the NAME changed:",
      vars(before) == vars(after))
```

**Real output, run this session:**
```
before: ProgramDetailsPanel {'machine_id': None, 'channel': 1}
after:  ProgramAssignmentPanel {'machine_id': None, 'channel': 1}
identical real behavior, only the NAME changed: True
```

**What this proves:** both classes hold real, identical state
(`vars(before) == vars(after)` is `True`) — genuinely nothing about
what the code *does* changed. The only real difference is the name
itself, now accurately describing the narrower, real scope
(`ProgramAssignmentPanel` for a panel that edits one specific
assignment) instead of the original, vaguer one.

## Mechanical Walkthrough

- **Rename** replaces every real occurrence of an old identifier with
  a new one — the class/method/variable name itself, and every real
  reference to it throughout a codebase (imports, call sites, type
  annotations, test file names) — with zero change to any real
  behavior.
- Unlike `move-method-refactoring.md`'s own move (relocating code to a
  different, more appropriate owner), Rename never changes *where*
  code lives or *what* it does — only what it's *called*.
- A real, mechanical rename is typically detected by version control
  itself as exactly that — Git recognizes a file whose content is
  nearly identical to a deleted one under a new name as a real rename
  (`R` status), not an unrelated delete-and-add, precisely because the
  actual content barely changed.

## CS Lens

This is another of Martin Fowler's original, named, real refactorings
— like Move Method, a **behavior-preserving** transformation, provably
so here (`vars(before) == vars(after))` confirms the two versions are
structurally identical). Rename specifically targets a real, common
problem in long-lived code: a name accurately describing an *original*
intent can drift into inaccuracy as real understanding of a system's
actual scope evolves, even though the code's own behavior never
changed at all.

Also recognized in: virtually every modern IDE's own "Rename Symbol"
refactoring command, automating exactly this mechanical, whole-codebase
replacement safely (updating every real reference, not just the
declaration).

## SE Lens

The real, practical value: an accurate name is itself a form of real
documentation — a reader encountering `ProgramAssignmentPanel` for the
first time gets a genuinely more accurate mental model of its real
scope than they would from `ProgramDetailsPanel`, with zero need to
read the class's own body first. The real, honest cost: a rename
touches every real reference across a codebase — genuinely mechanical,
but real, repeated work in a large project, which is exactly why
tooling support (an IDE's automated rename) matters for doing it
safely and completely, not leaving a stale reference behind somewhere.

## Connection

Builds on `move-method-refactoring.md` — both are real, named
refactorings from the identical Fowler catalog, applied at different
real moments in this project's own history for different real reasons
(Move Method once it was clear logic belonged to a different class;
Rename once it was clear a name no longer matched its real scope).

## Try It Yourself

1. Find a real, existing class or function whose name you find at
   least slightly inaccurate for what it actually does, and perform a
   real rename (using an IDE's rename tool if available) — confirm
   every real reference gets updated, not just the declaration.
2. Compare a hand-done, manual rename (find-and-replace by hand)
   against an IDE's automated rename tool on the identical real target
   — reasoning about what real, easy mistakes manual renaming risks
   (renaming a substring match inside an unrelated word, missing a
   reference in a string or comment) that tooling avoids.
3. Explain, in your own words, why a real rename showing up as `R` in
   `git status` (rather than a separate delete and add) matters for a
   real code reviewer trying to understand a change — what does that
   status tell them about the actual size and risk of the diff, before
   they've read a single line of it?
