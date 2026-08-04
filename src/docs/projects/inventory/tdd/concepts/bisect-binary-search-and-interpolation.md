# Concept: Binary Search via `bisect`, and Interpolating Within the Result

**What you'll understand by the end:** how Python's standard-library
`bisect` module finds a position in a **sorted** sequence in
logarithmic time instead of scanning linearly, the real, precise
difference between `bisect_left` and `bisect_right` at an exact match,
and how pairing a `bisect` lookup with linear interpolation answers
"what's the value at this in-between point" from a sequence of
discrete, sorted samples.

**Prerequisites:** `python-list-sort-with-key-function.md`.

## Setup

Python 3, no packages needed — `bisect` is standard library.

## The Problem

Finding "where would this value fit" in a **sorted** sequence — which
two neighboring entries bracket it — can always be done with a plain
linear scan, checking each element in order. That works, but does real,
unnecessary work: a sorted sequence's own order means most of that
scanning is provably wasted, since ruling out half the remaining
candidates at each step (thanks to the sequence being sorted) is
always possible, not just sometimes.

## The Isolated Example

The real cost difference, measured directly on a sorted list of
200,000 numbers:

```python
import bisect
import random
import time

data = sorted(random.sample(range(10_000_000), 200_000))
target = data[150_000] + 0.5


def linear_scan(data, target):
    for i, value in enumerate(data):
        if value > target:
            return i
    return len(data)


t0 = time.perf_counter()
for _ in range(20):
    linear_scan(data, target)
t1 = time.perf_counter()
print("linear scan avg (ms):", (t1 - t0) / 20 * 1000)

t0 = time.perf_counter()
for _ in range(20):
    bisect.bisect_right(data, target)
t1 = time.perf_counter()
print("bisect avg (ms):", (t1 - t0) / 20 * 1000)
```

**Real output, run this session:**
```
linear scan avg (ms): 27.774389999103732
bisect avg (ms): 0.0013999990187585354
```

**What this proves:** both approaches find the identical real answer —
but `bisect_right` did it roughly **20,000 times faster** than the
linear scan, on a real, 200,000-element sorted list. Both are correct;
only one of them actually exploits the fact that the data is sorted.

## Mechanical Walkthrough

- `bisect.bisect_right(data, target)` returns the index where `target`
  would be inserted to keep `data` sorted, placed **after** any
  existing entries equal to `target`. `bisect_left` does the identical
  job, but places the insertion point **before** any equal entries.
- Both work by repeatedly checking the **middle** element of the
  remaining real search range and discarding the half that can't
  possibly contain the answer — never scanning every element, because
  the sequence being sorted guarantees the discarded half is provably
  irrelevant.
- Each check halves the remaining range, so the real number of checks
  needed grows with `log2(n)`, not `n` — for the `200,000`-element list
  above, that's roughly `18` real checks, versus up to `200,000` for a
  worst-case linear scan.
- The real, precise difference between `bisect_left` and `bisect_right`
  only matters when the target value **already appears** in the
  sequence — for a value with no exact match, both return the
  identical index.

## A Second Real Facet: `bisect_left` vs. `bisect_right` at an Exact Match

The distinction above sounds abstract until it produces a real,
concrete bug. Consider stepping forward to the **next distinct**
sample in a sorted sequence, starting from a position that's already
**exactly on** one of the samples:

```python
samples = [0, 5, 11, 18]
current = 11  # already exactly on a real sample

print("bisect_right(current):", bisect.bisect_right(samples, current))
next_index = bisect.bisect_right(samples, current)
print("-> correct next sample:", samples[next_index])

wrong_index = bisect.bisect_left(samples, current)
print("bisect_left(current):", wrong_index)
print("-> WRONG 'next' sample using bisect_left:", samples[wrong_index])
```

**Real output, run this session:**
```
bisect_right(current): 3
-> correct next sample: 18
bisect_left(current): 2
-> WRONG 'next' sample using bisect_left: 11
```

**What this proves:** `bisect_right` correctly skipped **past** the
exact match at `11` and landed on `18`, the real next distinct
sample — exactly the real behavior "step forward" needs.
`bisect_left`, used the identical way, returned index `2` — pointing
straight back at the **same** value, `11`, the position already
occupied. A "step forward" operation built on `bisect_left` would
silently get stuck, never advancing past a sample it's already
sitting exactly on.

## A Third Real Facet: Interpolating Within the Bracketing Pair

`bisect` alone only answers "which interval." Getting a real value
**between** two known samples needs one further, real step: linear
interpolation using the bracketing pair `bisect` found.

```python
import math

waypoints = [(0, 0), (3, 4), (3, 10), (10, 10)]

cumulative = [0.0]
for i in range(1, len(waypoints)):
    cumulative.append(cumulative[-1] + math.dist(waypoints[i - 1], waypoints[i]))

print("cumulative distances:", cumulative)


def position_at(distance):
    distance = max(0.0, min(distance, cumulative[-1]))  # clamp to the real path's extent
    index = bisect.bisect_right(cumulative, distance) - 1
    index = max(0, min(index, len(waypoints) - 2))
    segment_start = cumulative[index]
    segment_length = cumulative[index + 1] - segment_start
    fraction = 0.0 if segment_length == 0 else (distance - segment_start) / segment_length
    x1, y1 = waypoints[index]
    x2, y2 = waypoints[index + 1]
    return (x1 + (x2 - x1) * fraction, y1 + (y2 - y1) * fraction)


for d in [0, 2.5, 5, 9, 12, 100]:
    print(f"distance {d}: position {position_at(d)}")
```

**Real output, run this session:**
```
cumulative distances: [0.0, 5.0, 11.0, 18.0]
distance 0: position (0.0, 0.0)
distance 2.5: position (1.5, 2.0)
distance 5: position (3.0, 4.0)
distance 9: position (3.0, 8.0)
distance 12: position (4.0, 10.0)
distance 100: position (10.0, 10.0)
```

**What this proves:** `position_at(2.5)` — exactly halfway along the
first, real 5-unit segment — correctly landed at `(1.5, 2.0)`, the
real midpoint between `(0,0)` and `(3,4)`. `position_at(100)`, a
distance far beyond the real path's own total length (`18.0`), was
correctly **clamped**, landing on the final real waypoint rather than
extrapolating nonsensically past it. `bisect_right` finds *which* real
segment a distance falls within in logarithmic time; the interpolation
step then answers *where exactly* within that segment.

## CS Lens

This is a real, textbook instance of **binary search** — a classic
`O(log n)` algorithm exploiting sorted order to eliminate half the
remaining search space on every real comparison, rather than
`bisect`'s alternative, a plain `O(n)` linear scan. Pairing it with
**linear interpolation** (finding a value proportionally between two
known bracketing points) is the standard, real complementary
technique whenever a continuous quantity needs to be estimated from a
sequence of discrete, sorted samples — together they answer "which
interval, and where exactly within it" in one real, efficient
two-step process.

Also recognized in: a dictionary's own printed pages (opening roughly
to the middle, narrowing which half to check next, rather than reading
page by page); database index lookups (a B-tree index is, at its
core, a real, disk-friendly generalization of binary search);
`np.interp` and every real graphics/animation keyframe system (finding
the two bracketing keyframes, then interpolating a value between
them).

## SE Lens

The real, practical payoff of reaching for `bisect` over a hand-rolled
linear scan: correctness *and* a real, dramatic performance win on any
sequence large enough to matter, for genuinely less code than writing
the search loop by hand. The real, honest precondition: `bisect`
**requires** the sequence already be sorted — running it against
unsorted data doesn't raise an error, it silently returns a
meaningless index, since the whole technique depends entirely on the
sorted-order guarantee it never actually checks.

## Connection

Builds on `python-list-sort-with-key-function.md` for the sorted-data
precondition this technique depends on, and on `python-math-dist.md`
for the cumulative-distance construction in this file's own third
facet. A real, applied instance in this project's own history: a
continuous toolpath-playback feature converting a discrete sequence of
motion segments (arcs included, via their own interpolated points)
into a flat, cumulative-distance-tagged path — `bisect_right`/
`bisect_left` locating the bracketing samples for both "step to the
next/previous real sample" and "find the position at an arbitrary,
continuous playback distance," with linear interpolation answering the
exact in-between position for the marker and cursor sync — this
project's own first real use of binary search anywhere.

## Try It Yourself

1. Run the timing comparison again with a **10x** smaller list
   (`20,000` elements instead of `200,000`) and confirm the linear
   scan's own real time drops roughly proportionally, while `bisect`'s
   own time barely changes at all — direct, concrete evidence of the
   `O(n)` vs. `O(log n)` real growth-rate difference, not just a
   one-off speed number.
2. Call `position_at` with a **negative** distance and confirm the
   real clamping correctly returns the very first waypoint, the
   mirror-image case of the `distance=100` clamp already shown.
3. Modify `waypoints` to include a real, duplicate consecutive point
   (a zero-length segment) and confirm `position_at` still behaves
   sensibly at that segment's own boundary — reasoning about why the
   `segment_length == 0` guard in `position_at` exists at all.
