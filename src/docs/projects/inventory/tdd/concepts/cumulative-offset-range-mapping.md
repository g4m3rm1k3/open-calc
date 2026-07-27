# Concept: Mapping Grouped Items Back to Positions in a Flat Sequence

**What you'll understand by the end:** how to recover "which real
positions in the original, flat sequence does this group occupy" after
you've already partitioned that sequence into groups — using a running
total, not by re-searching.

**Prerequisites:** none beyond arrays and a `for` loop.

## Setup

Python 3, no packages needed.

## The Problem

Grouping a flat sequence into chunks (paragraphs from lines, pages from
records, operations from G-code commands) is common — but the grouped
result, by itself, no longer says *where* each group's items sat in the
original sequence. If something downstream needs to refer back to real
positions (a page number, a byte offset, an index into a separate array
that's still keyed by the original flat order), re-deriving that from
the grouped structure alone requires either storing it during grouping,
or reconstructing it afterward.

## The Isolated Example

```python
words = ["The", "quick", "brown", "fox", "jumps", "over", "the", "lazy", "dog"]

# Already grouped into "sentences" of a fixed size, elsewhere -- the
# grouping itself no longer records each group's real position in `words`.
groups = [words[0:3], words[3:6], words[6:9]]

def group_ranges(groups):
    ranges = []
    cursor = 0
    for group in groups:
        start = cursor
        cursor += len(group)
        ranges.append((start, cursor - 1))
    return ranges

ranges = group_ranges(groups)
print(ranges)
for (start, end), group in zip(ranges, groups):
    print(f"words[{start}:{end+1}] = {group}")
```

**Real output:**
```
[(0, 2), (3, 5), (6, 8)]
words[0:3] = ['The', 'quick', 'brown']
words[3:6] = ['fox', 'jumps', 'over']
words[6:9] = ['the', 'lazy', 'dog']
```

**What this proves:** `group_ranges` recovers exactly the real `[start,
end]` slice each group came from, using only each group's own `len()`
— no searching `words` for where a group's contents actually appear,
which would be both slower and ambiguous if any words repeated.

## Mechanical Walkthrough

- `cursor = 0` — a running total, tracking "how many original items
  have been accounted for so far" — the entire technique is this one
  variable, updated once per group.
- `start = cursor` — this group's own first real position is wherever
  the running total currently stands, *before* this group's own length
  is added.
- `cursor += len(group)` — advances the running total past this
  group's own items, so the *next* group's `start` correctly begins
  right after this one ends.
- `cursor - 1` as the inclusive `end` — `cursor` itself now points one
  position *past* this group's last real item (the same off-by-one
  convention Python's own slicing already uses), so subtracting 1
  converts it to the actual last included index.

## Execution Trace

`group_ranges(groups)` for `groups = [words[0:3], words[3:6], words[6:9]]`
(three groups of 3), traced against the real output above:

```
Before the loop: cursor = 0, ranges = []

Group 1 (len 3): start = cursor = 0
                 cursor += 3 → cursor = 3
                 ranges.append((0, 3-1)) → ranges = [(0, 2)]

Group 2 (len 3): start = cursor = 3
                 cursor += 3 → cursor = 6
                 ranges.append((3, 6-1)) → ranges = [(0, 2), (3, 5)]

Group 3 (len 3): start = cursor = 6
                 cursor += 3 → cursor = 9
                 ranges.append((6, 9-1)) → ranges = [(0, 2), (3, 5), (6, 8)]

Final: ranges = [(0, 2), (3, 5), (6, 8)]
```

Each iteration reads `cursor` *before* advancing it (that's `start`) and
writes the range using the value *after* advancing it (that's `end`) —
the running total is doing two jobs, one on each side of the same
`+=` line.

## CS Lens

This is a **prefix sum** (a running cumulative total), one of the most
common small techniques in real code — anywhere a sequence of
variable-sized chunks needs to be located within a larger, flat
structure by position rather than by searching for their content.

Also recognized in: computing byte offsets for variable-length records
in a file format; a paginated UI computing which page a given item
index falls on from a list of page sizes; a virtualized/windowed list
(rendering only visible rows) computing each row's real scroll offset
from cumulative row heights; a compiler computing each token's real
column position from cumulative line lengths.

## SE Lens

The real alternative — searching the original sequence for where a
group's own content actually appears (e.g., `words.index(group[0])`) —
is both slower (a real search, potentially the entire sequence, for
every group) and *wrong* the moment any content repeats (searching for
`"the"` again would find the first occurrence, `words[0]`, not the
second real one at index 6, silently producing an incorrect range).
Tracking position via a running cumulative total during a single,
linear pass is both faster and the only version that's actually
correct when values can repeat — it depends on position, never content.

## Connection

Builds on ordinary array/loop fundamentals. Pairs directly with
`attributing-resolved-state-to-its-origin-event.md` once ranges are
known — that concept finds *which* line set a value; this one is what
makes it possible to say *which range of a larger structure* a smaller,
already-grouped piece of it corresponds to in the first place.

## Try It Yourself

1. Change `groups` to have deliberately uneven sizes (`words[0:2]`,
   `words[2:7]`, `words[7:9]`) and confirm `group_ranges` still reports
   the correct ranges — the technique doesn't assume equal-sized
   groups.
2. Introduce a repeated word (change `"the"` in `words[6]` to also
   appear earlier) and confirm `group_ranges`'s own cumulative approach
   still reports correct ranges, while a `words.index(...)`-based
   search-based alternative would not.
3. Add a real "offset" parameter to `group_ranges` (some number of
   items that exist in the original sequence *before* `groups[0]` even
   starts, e.g. a header row stripped out before grouping) and confirm
   adding it to `cursor`'s own starting value correctly shifts every
   reported range to account for it.
