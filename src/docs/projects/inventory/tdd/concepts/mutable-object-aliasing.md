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

## Execution Trace

The broken version — one object, three appended references:

```
shared = Point()  → one real object, id X, shared.x = 0
history_broken = []

shared.x = 1
history_broken.append(shared)  → history_broken = [ref→X]  (X.x is currently 1)

shared.x = 2  → the SAME object X now has x=2 — this changes what the
                already-appended reference above "shows" too
history_broken.append(shared)  → history_broken = [ref→X, ref→X]  (X.x is currently 2)

shared.x = 3  → X.x=3, changing BOTH already-appended references again
history_broken.append(shared)  → history_broken = [ref→X, ref→X, ref→X]  (X.x is 3)

Read [p.x for p in history_broken]:
  ref→X: reads X.x → 3
  ref→X: reads X.x → 3  (same object, read again)
  ref→X: reads X.x → 3  (same object, read again)
Final: [3, 3, 3]
```

The fixed version — three separate objects, one real reference each:

```
shared2 = Point()  → object Y, shared2.x = 0
history_correct = []

shared2.x = 1
history_correct.append(Point())  → a brand-new object Z1, history_correct = [ref→Z1]
history_correct[-1].x = shared2.x  → Z1.x = 1  (Z1 is untouched by anything after this)

shared2.x = 2
history_correct.append(Point())  → a brand-new object Z2, history_correct = [ref→Z1, ref→Z2]
history_correct[-1].x = shared2.x  → Z2.x = 2

shared2.x = 3
history_correct.append(Point())  → a brand-new object Z3
history_correct[-1].x = shared2.x  → Z3.x = 3

Read [p.x for p in history_correct]:
  ref→Z1: reads Z1.x → 1  (never touched since being set)
  ref→Z2: reads Z2.x → 2
  ref→Z3: reads Z3.x → 3
Final: [1, 2, 3]
```

Every `.append()` call in the broken version stores a reference to the
exact same memory; every later mutation of `shared` is visible through
all three references at once, because there was only ever one real
object to read from.

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

## A Second Real Facet: The Identical Mechanism, Used Deliberately

Everything above treats aliasing as a real bug to avoid. The exact
same mechanism is also a real, deliberate tool — when two independent
real views genuinely need to stay in sync automatically, sharing the
*same* object on purpose is precisely how that's achieved:

```python
class Document:
    def __init__(self, content):
        self.content = content


class TabView:
    def __init__(self, document):
        self.document = document

    def show(self):
        return f"[Tab] {self.document.content}"


class ChannelView:
    def __init__(self, document):
        self.document = document

    def show(self):
        return f"[Channel] {self.document.content}"


shared_doc = Document("original text")
tab = TabView(shared_doc)
channel = ChannelView(shared_doc)

print(tab.show())
print(channel.show())

shared_doc.content = "edited text"
print("after editing via shared_doc directly:")
print(tab.show())
print(channel.show())
print("both views are the SAME real object:", tab.document is channel.document)
```

**Real output, run this session:**
```
[Tab] original text
[Channel] original text
after editing via shared_doc directly:
[Tab] edited text
[Channel] edited text
both views are the SAME real object: True
```

**What this proves:** editing `shared_doc.content` **once** was
immediately, automatically visible through **both** independent views
— the identical real aliasing behavior this file's own first facet
warns about, now genuinely intended: `TabView` and `ChannelView` never
copy the document; they deliberately hold the same real reference, so
neither view can ever silently drift out of sync with the other.

**The real, honest distinction:** this is the *identical* underlying
Python fact as the bug earlier in this file — the difference is
entirely about **intent**. Collecting "snapshots over time" into a
list needs independent copies, because each entry is meant to freeze
one moment; two live *views* of one, single, currently-open real thing
need the opposite — a shared reference is exactly what makes "edit
here, see it there" work at all, with zero explicit synchronization
code required anywhere.

### Try It Yourself (second facet)

1. Change `ChannelView` to hold a **copy** of the document instead
   (`copy.copy(document)`) and confirm editing `shared_doc` no longer
   updates `channel.show()` — direct, real proof of exactly what
   deliberate aliasing was providing, once it's removed.
2. Add a third, real view sharing the same `shared_doc` and confirm all
   three stay in sync through a single edit — the sharing scales to
   any number of real, simultaneous views.
3. Write one sentence for each of this file's own two facets stating
   the real, concrete test you'd use to decide which one applies to a
   new, real situation you encounter — "is this meant to be one
   changing thing observed from multiple places, or several independent
   snapshots in time?"
