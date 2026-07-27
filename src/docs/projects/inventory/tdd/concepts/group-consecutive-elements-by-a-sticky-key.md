# Concept: Partitioning a Sequence by a Sticky Key

**What you'll understand by the end:** how to split a flat sequence
into groups when the value that should decide "same group or new
group" doesn't appear on every element — only sparsely, on the
elements that actually start a new group — and every element in
between has to inherit whichever group-starting value came last.

**Prerequisites:** `sticky-state-modal-behavior.md`.

## Setup

Python 3, no packages needed.

## The Problem

The obvious way to group a sequence of items into runs is to compare
each item to the one immediately before it: start a new group whenever
the value changes. That works when every element genuinely carries the
grouping value. It fails when only *some* elements carry a real,
meaningful value, and the rest carry something else — a placeholder, a
generated filler, a `None` — that was never meant to define a boundary
at all. Comparing raw values in that case fragments the sequence
constantly, once per filler element, instead of respecting the sparse,
real boundaries.

## The Isolated Example

The naive approach, and why it fails:

```python
items = [
    {"real": True, "key": 100},
    {"real": False, "key": 101},   # filler — a made-up, unique id
    {"real": False, "key": 102},   # filler
    {"real": True, "key": 200},
    {"real": False, "key": 201},   # filler
]

# Naive: group by raw equality with the previous item's key.
groups = []
for item in items:
    if groups and groups[-1][-1]["key"] == item["key"]:
        groups[-1].append(item)
    else:
        groups.append([item])

print(len(groups))
```

**Real output:**
```
5
```

**What this proves:** every item lands in its own group — the filler
items' keys are unique, generated values, so none of them ever equals
the previous item's key, and the grouping is completely useless despite
there being exactly two real boundaries (`100` and `200`) in the data.

**The fix — track the last real key seen, not the raw previous value:**

```python
groups = []
current_key = None
for item in items:
    if item["real"] and item["key"] != current_key:
        current_key = item["key"]
        groups.append([item])
    elif groups:
        groups[-1].append(item)
    else:
        groups.append([item])

print([[i["key"] for i in g] for g in groups])
```

**Real output:**
```
[[100, 101, 102], [200, 201]]
```

**What this proves:** the two real boundaries (`100`, `200`) each start
a real, new group; every filler item, regardless of its own unique key,
joins whichever group the last real key started — exactly the two
groups the data actually has, not five.

## Mechanical Walkthrough

- `current_key = None` — the sticky state (see `sticky-state-modal-
  behavior.md`): holds the last *real* boundary value seen so far, not
  the literal previous element.
- `if item["real"] and item["key"] != current_key:` — a new group only
  starts when an element is both flagged real *and* its key genuinely
  differs from the current sticky value — a filler element (`real:
  False`) can never satisfy this, regardless of its own key.
- `elif groups: groups[-1].append(item)` / `else: groups.append([item])`
  — every non-triggering element joins the most recent group; the
  `else` only covers the very first element, before any group exists
  yet.

## Execution Trace

The naive version, against `items` (5 elements, keys
`100, 101, 102, 200, 201`, no two consecutive raw keys ever equal):

```
groups = []
item(key=100): groups empty → groups.append([item]) → groups = [[100]]
item(key=101): groups[-1][-1]["key"] (100) == 101? No → groups.append([item]) → [[100],[101]]
item(key=102): groups[-1][-1]["key"] (101) == 102? No → groups.append([item]) → [[100],[101],[102]]
item(key=200): groups[-1][-1]["key"] (102) == 200? No → groups.append([item]) → [...,[200]]
item(key=201): groups[-1][-1]["key"] (200) == 201? No → groups.append([item]) → [...,[201]]
Final: 5 groups — every item alone, since raw keys are never equal.
```

The fixed version, tracking `current_key` (the last *real* boundary),
against the same 5 items:

```
Start: current_key = None, groups = []

item(real=True,  key=100): real and 100 != None → True
  → current_key = 100; groups.append([item]) → groups = [[100]]
item(real=False, key=101): real is False → condition False
  → groups is non-empty → groups[-1].append(item) → groups = [[100,101]]
item(real=False, key=102): real is False → condition False
  → groups[-1].append(item) → groups = [[100,101,102]]
item(real=True,  key=200): real and 200 != 100 (current_key) → True
  → current_key = 200; groups.append([item]) → groups = [[100,101,102],[200]]
item(real=False, key=201): real is False → condition False
  → groups[-1].append(item) → groups = [[100,101,102],[200,201]]

Final: [[100,101,102],[200,201]] — 2 groups, matching the real data's
actual boundaries.
```

`current_key` only changes on the two `real=True` elements — every
`real=False` filler element leaves it untouched and just joins whatever
group is already open, regardless of its own, irrelevant key.

## CS Lens

This is the same idea as SQL's `LAG()` window function, or a classic
"group consecutive equal elements" reduce, but keyed on a *derived*,
sticky value rather than each element's own raw value — closer to "does
this element differ from the last one that *mattered*" than "does this
element differ from the literal previous one."

Also recognized in: video codecs' keyframe/delta-frame structure (a
keyframe is the real marker; every frame after it is diffed against it,
not against raw frame-to-frame equality); terminal scrollback collapsing
repeated log lines under the last distinct one; any modal state machine
where most transitions are implicit continuations of whatever mode was
last explicitly entered.

## SE Lens

The alternative — requiring every element to explicitly restate the
grouping key, so raw equality is always safe to compare — removes the
need for this pattern entirely, but pushes the burden onto whatever
produces the data (every line of a file, every event in a stream) to
never omit it. Real-world sparse data (a file where only some lines are
explicitly numbered, a log where only some entries carry a request ID)
overwhelmingly can't guarantee that, so the sticky-key comparison earns
its complexity specifically because the alternative isn't actually
available.

## Connection

Builds directly on `sticky-state-modal-behavior.md` — `current_key`
here is exactly that same "persists until explicitly changed" idea,
applied to decide array-partition boundaries specifically, rather than
to drive some other read/format operation.

## Try It Yourself

1. Add a third real boundary to the example list, immediately after the
   first (`{"real": True, "key": 100}` twice in a row, no filler between
   them). Confirm the two real, identical-valued items merge into one
   group rather than starting a second one — the boundary condition
   requires the key to actually *change*, not just reappear as real.
2. Feed the fixed version a list with *no* real elements at all (every
   item's `"real"` is `False`). Confirm it still produces exactly one
   group, not zero and not a crash — the `else: groups.append([item])`
   branch is what makes that safe.
3. Change the fixed version to key on a tuple `(category, key)` instead
   of a single value, and confirm two elements with the same `key` but
   different `category` correctly start separate groups.
