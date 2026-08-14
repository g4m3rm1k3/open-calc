# Concept: Order-Preserving De-Duplication (a `seen` Set Alongside a List)

**What you'll understand by the end:** how to remove duplicate values
from a sequence while keeping the real, original left-to-right order
of their first occurrence — something a plain `set(...)` conversion
cannot do, since sets carry no reliable order at all.

**Prerequisites:** none beyond the assumed floor.

## Setup

None — plain Python, no packages.

## The Problem

Removing duplicates from a real sequence is an extremely common real
need — a user's selection might list the same file twice (once from
each of two separate selection actions), and downstream code often
needs each real value exactly once. Python's built-in `set(...)`
removes duplicates in one call, but a `set` carries **no** reliable
order at all — converting a real, meaningfully-ordered sequence to a
`set` and back loses that order, which matters whenever "the order the
user selected things in" is itself real, useful information.

## The Isolated Example

```python
raw_selection = ["report.txt", "notes.md", "report.txt", "data.csv", "notes.md"]

as_set = set(raw_selection)
print("plain set():", as_set)

seen = set()
ordered_unique = []
for path in raw_selection:
    if path not in seen:
        seen.add(path)
        ordered_unique.append(path)

print("order-preserving:", ordered_unique)
```

**Real output, run this session:**
```
plain set(): {'notes.md', 'data.csv', 'report.txt'}
order-preserving: ['report.txt', 'notes.md', 'data.csv']
```

**What this proves:** `set(raw_selection)` correctly removed the
duplicates, but its own printed order (`notes.md`, `data.csv`,
`report.txt`) bears no relationship to the real, original left-to-
right order they first appeared in — a `set`'s iteration order is
determined by Python's internal hashing, not insertion sequence. The
`seen`-set-plus-list technique produced the exact real first-occurrence
order (`report.txt`, `notes.md`, `data.csv`) — each value appearing
exactly once, in the order it was *first* seen.

## Mechanical Walkthrough

- `seen = set()` tracks, cheaply, which real values have already been
  added — checking `path not in seen` is a fast, real `O(1)` average-
  case membership test, the entire reason a `set` is used here at all
  rather than checking membership in the growing `ordered_unique` list
  itself (which would be a real, slower `O(n)` check per item).
- `ordered_unique = []` is the real, separate list actually preserving
  order — every value gets appended to it, in the exact order
  encountered, but only the **first** time.
- The `if path not in seen:` guard is what makes this order-*preserving*
  de-duplication rather than just de-duplication: a value's real,
  first position is exactly where it ends up in the final list; every
  later repeat is silently skipped, never disturbing that first
  position.
- This is a genuinely different real technique from `set(raw_selection)`
  alone — both remove duplicates, but only this one preserves the real,
  original sequence order alongside doing so.

## CS Lens

This is a real, classic combination of two different data structures,
each doing the job it's actually good at: a `set` for fast, real
membership testing, and a `list` for preserving real, meaningful
order — neither one alone solves the full real problem (a `set` alone
loses order; a `list` alone checking `if path not in ordered_unique`
would work correctly but degrade to real, slow `O(n²)` behavior on a
large input, checking membership in a growing list instead of a real,
constant-time set).

Also recognized in: any "unique, in original order" requirement across
real, larger systems — deduplicating a real log of user actions while
preserving their real chronological order; building a set of unique
imports in a source file while preserving the order they were first
referenced.

## SE Lens

The real, practical reason order matters here specifically: a user
selecting several real files by clicking, in a specific sequence,
might reasonably expect operations acting on "the selected files" to
process them in that same real, chosen order — silently reordering
them (as a plain `set` conversion would) is a real, small but
genuinely surprising behavior change a user never asked for. The real,
small cost of the order-preserving technique (one extra `set` for
membership tracking) is trivial compared to the real correctness it
buys.

## Connection

Directly relevant wherever a real, ordered user selection (multiple
clicked files, per `pyside6-qabstractitemview-selectedindexes.md`'s
own real selection-reading technique) needs de-duplicating before
further processing — exactly the real, combined need this project's
own `selected_file_paths()` method has.

## A Second Real Facet: `dict.fromkeys()` — a One-Line Alternative

Python's dicts have preserved real, genuine insertion order since 3.7
— which makes `dict.fromkeys()`, a real, general dict-building tool in
its own right, a genuine one-line alternative to the explicit
`seen`-set loop above:

```python
channel_paths = dict.fromkeys(range(1, 3))
print("fromkeys with no default (None):", channel_paths)

channel_paths_explicit = dict.fromkeys(range(1, 4), "unassigned")
print("fromkeys with an explicit default:", channel_paths_explicit)

raw_selection = ["report.txt", "notes.md", "report.txt", "data.csv"]
ordered_unique = list(dict.fromkeys(raw_selection))
print("order-preserving dedup via fromkeys:", ordered_unique)
```

**Real output, run this session:**
```
fromkeys with no default (None): {1: None, 2: None}
fromkeys with an explicit default: {1: 'unassigned', 2: 'unassigned', 3: 'unassigned'}
order-preserving dedup via fromkeys: ['report.txt', 'notes.md', 'data.csv']
```

**What this proves:** `dict.fromkeys(iterable)` built a real dictionary
with one entry per real element of `iterable`, each mapped to the
identical shared default value (`None` unless a second, explicit
argument is given). Applied to `raw_selection` — a list with real,
repeated values — `dict.fromkeys(raw_selection)` naturally collapses
the duplicates (a dict can't have two entries with the same real key),
and because dict keys preserve real insertion order, converting the
result back to a `list` produces the **exact same** order-preserving,
de-duplicated result as the explicit `seen`-set loop, in one line.

**Mechanical note:** `dict.fromkeys(iterable)` is genuinely a **third**
real way to build a dictionary in this project's own history, alongside
a plain literal (`{1: None, 2: None}`) and `.setdefault()`
(`python-dict-setdefault.md`) — each suited to a different real
construction need: a literal for a small, fixed, known set of entries;
`setdefault` for "only set if not already present" during real,
incremental building; `fromkeys` for "every key from this iterable,
sharing one common starting value."

### Try It Yourself (second facet)

1. Time both the `seen`-set technique and `dict.fromkeys()` against a
   real, large input (100,000+ repeated values) and compare their real,
   measured performance — reasoning about whether the one-line version
   is also the faster one, or just the more concise one.
2. Use `dict.fromkeys(range(1, channel_count + 1))` to build a real,
   fresh per-channel slot dictionary the way this project's own `Job`
   dataclass does — confirming the identical real technique applies
   directly to that real, applied case.
3. Extend the technique to de-duplicate based on only *part* of each
   real value (say, a case-insensitive comparison) by storing a
   transformed key in `seen` while still appending the real, original
   value to the output list — a real case `dict.fromkeys()` alone can't
   handle directly, since it only ever preserves the *last* seen value
   per key, not the original casing of the *first*.
