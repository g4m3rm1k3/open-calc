# Lesson 122: Interval Problems

**What you will build**: By the end of this lesson you'll derive two greedy algorithms for interval problems genuinely different from Lesson 118's activity selection — merging overlapping intervals into their union, and finding the minimum number of resources needed to schedule every interval without conflict — the second one reusing Lesson 94's heap directly rather than a plain scan.

**What you need to know first**: Lesson 118's activity selection and exchange argument, for direct contrast; Lesson 94's `heap-insert`/`heap-peek`; Lesson 96's `heap-extract-min`; Lesson 30's `max`.

**Terms introduced in this lesson**:

- **interval partitioning** — given a set of intervals, finding the minimum number of resources (rooms, machines, servers) such that no two intervals assigned to the same resource overlap. *Why it matters*: a genuinely different question from Lesson 118's activity selection, which maximized how many intervals *one* resource could hold — this lesson's second problem asks how many resources are needed to hold *all* of them.

**Objects and methods used**: None new. This lesson reuses `get`, `count` (Lesson 84), `max` (Lesson 30), and `heap-insert`/`heap-peek`/`heap-extract-min` (Lesson 94, Lesson 96), each already covered.

---

## Concept Unit: Merging Overlapping Intervals

### The Problem

Given a set of intervals, sorted by start time, which ones actually overlap and should be treated as one combined interval, rather than several separate ones?

### Introduce the concept in isolation

```clojure
(defn intervals-overlap? [current next-interval]
  (<= (get next-interval 0) (get current 1)))

(defn merge-into [current next-interval]
  [(get current 0) (max (get current 1) (get next-interval 1))])

(defn merge-from [intervals i current merged]
  (if (>= i (count intervals))
    (assoc merged (count merged) current)
    (if (intervals-overlap? current (get intervals i))
      (merge-from intervals (+ i 1) (merge-into current (get intervals i)) merged)
      (merge-from intervals (+ i 1) (get intervals i) (assoc merged (count merged) current)))))

(defn merge-intervals [intervals]
  (merge-from intervals 1 (get intervals 0) []))
```

```
user=> (merge-intervals [[1 3] [2 6] [8 10] [15 18]])
[[1 6] [8 10] [15 18]]
```

`[1 3]` and `[2 6]` overlap (`2 \leq 3`) — merged into `[1 6]`. `[8 10]` starts after `[1 6]` ends (`8 > 6`) — kept separate. `[15 18]` starts after `[8 10]` ends — also separate. Three intervals become two, wherever they genuinely overlapped; the rest stay untouched.

### Discard the throwaway example

Not applicable — every function here is real and reusable.

### Project Change

- **Reference Source**: No reference counterpart — a direct greedy scan, sorted by start time, merging whenever the next interval's start falls within the current merged interval's own end.
- **Files affected**: None.
- **Change type**: N/A.
- **Location**: N/A.
- **Dependencies**: Babashka, already installed.

### The New Code — type it yourself

```clojure
(defn merge-intervals [intervals]
  (merge-from intervals 1 (get intervals 0) []))
```

### The Updated Project

Skipped — no enclosing file exists yet.

### Mechanical walkthrough — how it works in isolation

- **`(<= (get next-interval 0) (get current 1))`** — first appearance: two intervals overlap (or touch) exactly when the next one starts no later than the current merged interval ends.
- **`[(get current 0) (max (get current 1) (get next-interval 1))]`** — first appearance: merging keeps the *earlier* start (already known, from `current`) and takes the *later* of the two ends — reappearing `max` (Lesson 30), deciding which interval actually extends further.
- **`(assoc merged (count merged) current)`** — reappearing `assoc`-as-append (Lesson 94): a finished, non-overlapping interval is only added to the result once nothing further can extend it.

### CS Lens

This greedy scan is a genuinely different shape from Lesson 118's activity selection: activity selection *chooses a subset*, discarding incompatible intervals entirely; merging *combines* every interval into the output, in possibly-fewer pieces — neither one is a special case of the other, despite both being interval problems, both greedy, and both requiring sorted input.

### SE Lens

Sorting by *start* time here, rather than Lesson 118's own sort by *finish* time, is what this specific problem needs — proof that "greedy on intervals" isn't one fixed recipe; the correct sort key depends entirely on what the problem is actually asking.

---

## Concept Unit: Interval Partitioning — Minimum Resources, via a Heap

### The Problem

Given intervals that genuinely overlap and all need to be scheduled — not merged away, not discarded — what's the fewest number of resources (rooms, servers) needed so no resource ever holds two overlapping intervals at once?

### Introduce the concept in isolation

```clojure
(defn rooms-needed-step [intervals i room-ends max-rooms]
  (if (and (> (count room-ends) 0) (<= (heap-peek room-ends) (get (get intervals i) 0)))
    (rooms-needed-from intervals (+ i 1) (heap-insert (get (heap-extract-min room-ends) 1) (get (get intervals i) 1)) max-rooms)
    (rooms-needed-from intervals (+ i 1) (heap-insert room-ends (get (get intervals i) 1)) (max max-rooms (+ (count room-ends) 1)))))

(defn rooms-needed-from [intervals i room-ends max-rooms]
  (if (>= i (count intervals))
    max-rooms
    (rooms-needed-step intervals i room-ends max-rooms)))

(defn rooms-needed [intervals]
  (rooms-needed-from intervals 0 [] 0))
```

```
user=> (rooms-needed [[1 4] [2 5] [3 6] [7 8]])
3
```

`room-ends` is a min-heap (Lesson 94) of currently-occupied rooms' end times. For each interval, sorted by start time: if the *earliest*-freeing room (`heap-peek`) is already free by this interval's start, **reuse** it — `heap-extract-min` then `heap-insert` the new end time, room count unchanged. Otherwise, **allocate a new room** — `heap-insert` alone, room count grows by one, and `max-rooms` tracks the largest count ever reached. `[1 4]`, `[2 5]`, `[3 6]` all genuinely overlap each other (all three active at once, just after time `3`) — three rooms; `[7 8]` starts after all three have freed, reusing whichever room's heap presents as earliest-freeing.

### Discard the throwaway example

Not applicable — every function here is real, reusable, and hand-verified against a concrete overlap.

### Project Change

- **Reference Source**: `rooms-needed-step` reuses Lesson 94's `heap-insert`/`heap-peek` and Lesson 96's `heap-extract-min` directly — the first genuine reuse of the priority-queue ADT (Lesson 96) for a problem outside Section V.
- **Files affected**: None.
- **Change type**: N/A.
- **Location**: N/A.
- **Dependencies**: Babashka, already installed.

### The New Code — type it yourself

```clojure
(defn rooms-needed [intervals]
  (rooms-needed-from intervals 0 [] 0))
```

### The Updated Project

Skipped — no enclosing file exists yet.

### Mechanical walkthrough — how it works in isolation

- **`(<= (heap-peek room-ends) (get (get intervals i) 0))`** — first appearance: checks only the *single* earliest-freeing room — if even the best candidate for reuse doesn't fit, no room does, since every other occupied room frees no earlier.
- **`(heap-insert (get (heap-extract-min room-ends) 1) ...)`** — reappearing `heap-extract-min` (Lesson 96, returning a pair, Lesson 85) immediately followed by `heap-insert`: one room's old end time leaves the heap, the new one enters, size unchanged.
- **`(max max-rooms (+ (count room-ends) 1))`** — reappearing `max` (Lesson 30): the running maximum only updates when a *new* room is actually allocated, never when one is reused.

### CS Lens

The final `max-rooms` equals the **maximum number of intervals ever simultaneously overlapping**, at any single point in time — a real, provable lower bound on resources needed (you can never schedule more simultaneously-overlapping intervals than you have resources), which this greedy algorithm always achieves exactly, never more.

### SE Lens

Choosing a min-heap specifically, rather than a plain vector scanned for the smallest end time (Lesson 111's own brute-force style), is what keeps each step `O(\log n)` instead of `O(n)` — Lesson 94's own motivating case, "repeatedly need the current minimum," reused here for a genuinely different problem than the priority-queue applications Lesson 96 originally named.

### Connection to the previous unit

The previous unit combined overlapping intervals into fewer pieces; this unit keeps every interval distinct but asks how many resources their overlaps genuinely require — a related but structurally different question, answered by a different data structure entirely.

---

## Connect the Pieces

All three interval problems this series has now built, named side by side:

```
Lesson 118 -- Activity selection: maximize count using ONE resource (discard incompatible intervals)
This lesson -- Merge intervals:    combine overlapping intervals into fewer, larger ones
This lesson -- Interval partitioning: minimize resources needed to keep EVERY interval
```

```clojure
(println "Merged:" (merge-intervals [[1 3] [2 6] [8 10] [15 18]]))
(println "Rooms needed:" (rooms-needed [[1 4] [2 5] [3 6] [7 8]]))
```

```
Merged: [[1 6] [8 10] [15 18]]
Rooms needed: 3
```

Three genuinely different questions about intervals, three different greedy strategies, one of them (this lesson's second) reaching directly back into Section V's own priority queue rather than building anything new from scratch.

## What Breaks Without This

Suppose `rooms-needed-step` checked `heap-peek` without first confirming the heap is non-empty:

```clojure
(defn broken-rooms-step [intervals i room-ends max-rooms]
  (if (<= (heap-peek room-ends) (get (get intervals i) 0))
    (rooms-needed-from intervals (+ i 1) (heap-insert (get (heap-extract-min room-ends) 1) (get (get intervals i) 1)) max-rooms)
    (rooms-needed-from intervals (+ i 1) (heap-insert room-ends (get (get intervals i) 1)) (max max-rooms (+ (count room-ends) 1)))))
```

On the very first interval, `room-ends` is `[]` — `(heap-peek [])` is `(get [] 0)`, which is `nil`, and `(<= nil ...)` is not a valid comparison Clojure's `<=` can evaluate, producing an error rather than correctly recognizing "no rooms exist yet, so a new one is obviously needed." This lesson's real `rooms-needed-step` checks `(> (count room-ends) 0)` *first*, exactly the kind of precondition check Lesson 110's own specification discipline requires before trusting an operation that has one.

## Exercises

1. **Trace.** By hand, trace `(merge-intervals [[1 4] [4 5] [6 8]])`, confirming `[1 4]` and `[4 5]` merge (touching endpoints count as overlapping) while `[6 8]` stays separate.
2. **Predict.** Before checking, predict `(rooms-needed [[1 4] [4 5] [6 8]])` — the identical intervals as Exercise 1. Does merging and room-counting agree on how many genuinely overlap?
3. **Verify.** Confirm `(rooms-needed [[1 4] [2 5] [3 6] [7 8]])`'s answer, `3`, matches the maximum number of these intervals ever active at the same instant, checked directly by picking a specific time and counting.
4. **Break it, on purpose.** Run `broken-rooms-step` on any non-empty interval list and confirm it fails on the very first call.
5. **Generalize.** State activity selection (Lesson 118), interval merging, and interval partitioning as three separate one-sentence specifications, without conflating any two of them.
6. **Reconstruct.** Close this lesson. From memory, explain why interval partitioning's answer equals the maximum simultaneous overlap, and why a heap, not a plain scan, is the natural structure for tracking it efficiently.

## Definition of Done

- [ ] You can implement `merge-intervals` and explain its overlap test precisely.
- [ ] You can implement `rooms-needed` and explain why it reuses Lesson 94's heap rather than a plain vector scan.
- [ ] You can state all three interval problems (activity selection, merging, partitioning) as distinct specifications.
- [ ] You completed Exercise 3 and confirmed the maximum-simultaneous-overlap claim directly.
- [ ] You completed Exercise 4 and demonstrated the empty-heap precondition failure.
- [ ] Commit your Exercise 3 and Exercise 4 work to your notes repository, with a commit message stating what you confirmed and found — for example, `"Confirm rooms-needed=3 matches maximum simultaneous overlap at t=3.5; demonstrate broken-rooms-step failing on an empty heap"` — not just `"lesson 122 exercise"`.

---

**Next lesson:** Lesson 123, *Graphs as Computational Objects*, moves beyond intervals and trees entirely, introducing vertices and edges as this series' most general way of representing relationships between things — the structure Lesson 124 onward builds an entire family of algorithms around.
