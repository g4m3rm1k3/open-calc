# Concept: Mutable Object Aliasing

**What you'll understand by the end:** why appending the same mutable object to a list multiple times doesn't create multiple independent snapshots — and how to actually get independent snapshots instead.

**Prerequisites:** `python-classes-instances.md`.

## Setup

Python 3, no packages needed.

## The Problem

Collecting a sequence of "states over time" (positions, statuses, any value that changes) into a list seems like it should preserve each state as it was at that moment. If the same mutable object is reused and appended repeatedly, that assumption is silently wrong — every entry in the list can end up reflecting only the *final* state, not the state at the time each entry was added.

## The Isolated Example

```python
class Point:
    def __init__(self):
        self.x = 0
        self.y = 0


shared = Point()
history_broken = []

shared.x = 1
history_broken.append(shared)
shared.x = 2
history_broken.append(shared)
shared.x = 3
history_broken.append(shared)

print([p.x for p in history_broken])
```

**Real output:**
```
[3, 3, 3]
```

**What this proves:** all three list entries report `x = 3` — the *final* value — even though `.append(shared)` was called three separate times, at three different points, when `x` was `1`, then `2`, then `3`. All three list entries are the *same object* (`shared`), not three independent snapshots — mutating it after appending changes what every previous append "shows," because there was never more than one real object to begin with.

The fix — appending a fresh copy each time:
```python
shared2 = Point()
history_correct = []

shared2.x = 1
history_correct.append(Point())
history_correct[-1].x = shared2.x
shared2.x = 2
history_correct.append(Point())
history_correct[-1].x = shared2.x
shared2.x = 3
history_correct.append(Point())
history_correct[-1].x = shared2.x

print([p.x for p in history_correct])
```
```
[1, 2, 3]
```

## Mechanical Walkthrough

- `history_broken.append(shared)` doesn't copy `shared` — it appends a *reference* to the exact same object already in memory. Python variables (and list entries) hold references to objects, not the objects' contents directly.
- Because all three list entries are references to the *one* `shared` object, reading `.x` off any of them reads whatever `shared.x` currently is — at the moment of reading, not at the moment each reference was appended.
- The fixed version creates a genuinely new, independent `Point()` for each entry, so each one's `.x` is set once and never touched again by any later code.

## CS Lens

This is **aliasing** — two or more names (or, here, list slots) referring to the *same* underlying object in memory, rather than independent copies of it. A mutation through any one alias is visible through every other alias, because there was only ever one real object being looked at multiple ways.

Also recognized in: two variables pointing at the same list (`a = [1, 2]; b = a; b.append(3)` changes what `a` sees too — the same underlying trap), function arguments passed by reference in any language that shares this model (Python, Java, JavaScript objects), and shared mutable global state generally — the same root cause behind a large fraction of real, hard-to-reproduce bugs across many languages.

## SE Lens

The fix in general — not just for this specific example — is ensuring each "snapshot" is a genuinely independent object, either by constructing a fresh one each time (as shown) or by explicitly copying an existing one (Python's `copy.copy`/`copy.deepcopy`, or, for a dict specifically, `dict(original)` or `{**original}`). A function whose entire job is "report the current state" is a natural, reliable place to guarantee this: if it always returns a brand-new object built fresh from current values, nothing that calls it can ever accidentally alias a shared, still-mutating object — the guarantee lives in one place, not in every caller remembering to copy defensively.

## Connection

Builds on `python-classes-instances.md`. This is the exact reasoning behind a state object's "report my current values" method always building and returning a fresh dict rather than exposing its own internal, still-mutable attributes directly — the moment a caller collects several of these reports into a list over time, only a fresh-object guarantee prevents every entry from silently collapsing into the same final state.

## Try It Yourself

1. Confirm the aliasing bug for real with a plain dict instead of a class instance: append the *same* dict object to a list three times, mutating one of its keys between appends, and observe every list entry shows the final value.
2. Fix the dict version using `history.append(dict(shared))` (a shallow copy) instead of `history.append(shared)`, and confirm each entry now correctly preserves its value at the time of the append.
3. Construct a case where a *shallow* copy (`dict(original)`, or `copy.copy`) still isn't enough — a dict whose value is itself a mutable object (a list, or another dict) — and confirm mutating that nested object still leaks across every "copied" entry, because a shallow copy only copies the outer container, not what it points to. Use `copy.deepcopy` to fix that deeper case, and explain in your own words why it was needed here but not in the flatter examples above.
