# Concept: Replace Conditional with Polymorphism (Refactoring)

**What you'll understand by the end:** the real, named refactoring for
collapsing an `isinstance`/`elif` branch chain — one branch per
concrete type a caller might be holding — into a single polymorphic
call, once every real branch's implementation already exists as a
matching method on each type.

**Prerequisites:** `python-typing-protocol-structural-typing.md`,
`move-method-refactoring.md`.

## Setup

Python 3, no packages needed.

## The Problem

Code that needs to do "the right thing" depending on which concrete
type a value actually is often starts as a real, explicit `isinstance`/
`elif` chain — one branch per known type. This works, but every new
method that needs to make the same kind of distinction has to repeat
the identical chain, and every time a new type is added, every one of
those scattered chains has to be found and updated with one more
branch — a real, compounding maintenance cost, and a real, easy place
to miss one.

## The Isolated Example

The conditional version — a real, growing coupling problem:

```python
class SingleTrack:
    def duration(self):
        return 180


class Playlist:
    def __init__(self, tracks):
        self.tracks = tracks

    def duration(self):
        return sum(t.duration() for t in self.tracks)


def describe(item):
    if isinstance(item, Playlist):
        return f"a playlist, {item.duration()}s total"
    elif isinstance(item, SingleTrack):
        return f"a single track, {item.duration()}s"
    else:
        raise TypeError(f"unknown item type: {type(item)}")


track = SingleTrack()
playlist = Playlist([SingleTrack(), SingleTrack()])
print(describe(track))
print(describe(playlist))
```

**Real output, run this session:**
```
a single track, 180s
a playlist, 360s total
```

The refactored version — the identical two real calls, with the
`isinstance` chain gone entirely, because both types already share the
matching real method shape (`duration()`, `label()`):

```python
class SingleTrack:
    def duration(self):
        return 180

    def label(self):
        return "a single track"


class Playlist:
    def __init__(self, tracks):
        self.tracks = tracks

    def duration(self):
        return sum(t.duration() for t in self.tracks)

    def label(self):
        return "a playlist"


def describe(item):
    return f"{item.label()}, {item.duration()}s total"


track = SingleTrack()
playlist = Playlist([SingleTrack(), SingleTrack()])
print(describe(track))
print(describe(playlist))
```

**Real output, run this session:**
```
a single track, 180s total
a playlist, 360s total
```

**What this proves:** both versions produce the (near-identical —
`SingleTrack`'s own real wording now goes through the exact same
f-string as `Playlist`'s) real output, but `describe` itself shrank
from a three-way branch naming every known type explicitly to a single
line that works identically regardless of which concrete type `item`
actually is. Adding a **third** real type (say, `Album`) to the
conditional version requires finding and editing `describe` (and every
other function with a similar chain); adding it to the refactored
version requires only giving `Album` its own real `duration()`/
`label()` methods — `describe` itself never needs to change again.

## Mechanical Walkthrough

- The **conditional** version centralizes the "what to do for each
  type" *decision* inside `describe` itself — `describe` has to know
  about, and explicitly name, every real type it might ever receive.
- The **polymorphic** version moves that same decision onto each type
  itself, as a same-named method — `describe` no longer needs to know
  the full, real list of types at all; it only needs to know that
  *whatever* it's given has a `duration()` and a `label()`.
- This refactoring's real precondition: every branch's real behavior
  has to already be expressible as a method living on the
  corresponding type — if the branches do something that doesn't
  naturally belong to any one type (formatting for a specific,
  unrelated external system, say), forcing it onto the type anyway can
  create the opposite problem (`single-responsibility-principle.md`'s
  own concern, a type accumulating unrelated jobs).
- A real `TypeError` for a genuinely unknown type doesn't disappear in
  the polymorphic version — it happens naturally, the moment `item.
  duration()` is called on something that doesn't have one
  (`AttributeError`, not the conditional version's own explicit,
  intentional `TypeError` — a real, worth-noticing difference in *which*
  error and *when* it fires).

## CS Lens

This is one of Martin Fowler's original, named refactorings — like
Move Method and Rename, a real, deliberate structural transformation,
here specifically replacing a **type-based conditional** with real
**polymorphic dispatch**: instead of one piece of code asking "what
type is this, and what should I do about it," each type itself answers
"what should be done, given that I am this type" — the identical real
distinction `open-closed-principle.md` cares about (adding a new type
requires zero edits to the existing dispatching code, only a new,
additive method on the new type).

Also recognized in: virtual method dispatch in any object-oriented
language (the language's own runtime performing exactly this
polymorphic lookup automatically, rather than a hand-written `if`
chain); the Visitor design pattern (a real, more elaborate technique
for the harder case where the "what to do" logic can't live on the
type itself at all).

## SE Lens

The real, practical payoff, demonstrated directly above: a genuinely
new type needs zero changes to `describe`, or to any other function
that follows the same polymorphic call shape — only a new, additive
method on the new type itself. The real, honest cost: the "what to do"
logic is now spread across every real type instead of living in one
centralized place — reading "everything `describe` might do" requires
opening each type's own file rather than one function, a real tradeoff
this refactoring is only worth making once a conditional chain is
genuinely repeated across more than one caller, or is expected to grow
new branches over time (the identical judgment call `avoid-premature-
abstraction.md` already names, applied here to *dispatch logic*
instead of extraction).

## Connection

Builds on `python-typing-protocol-structural-typing.md` (a `Protocol`
is what lets the polymorphic version's own callers state, formally,
"anything with these methods," even when the concrete types involved
share no common base class) and `move-method-refactoring.md`/
`rename-refactoring.md` — the third real, named refactoring from the
identical Fowler catalog this project's own history has now used,
each triggered by a different real, concrete problem (Move Method:
logic living on the wrong class; Rename: a name no longer matching real
scope; Replace Conditional with Polymorphism: an `isinstance` chain
duplicated or growing across more than one caller).

## Try It Yourself

1. Add a third type, `Album`, with its own real `duration()`/`label()`
   methods, and confirm `describe` needs zero changes to correctly
   handle it — direct, real proof of the refactoring's own central
   claim.
2. Deliberately pass something with **neither** method to the
   polymorphic `describe` (a plain `int`, say) and observe the real,
   different error it produces compared to the conditional version's
   own explicit `TypeError` — reasoning about whether an unhandled
   `AttributeError` is a worse or better failure mode for a genuinely
   unexpected type, and what (if anything) should be added to guard
   against it.
3. Find a real `isinstance`/`elif` chain in a codebase you have access
   to that appears in **more than one** function, and sketch what each
   involved type's own new method would need to look like to collapse
   every one of those call sites the same way.
