# Lesson 73: Almost Sorted, On Purpose — a Priority Queue from a Heap

**What you will build:** a `MinHeap` class with `push`, `pop`, and
`peek`, backed by nothing but a plain Python list — no pointers, no
`TreeNode`, no linked structure at all. The working feature is a
priority queue: always know the smallest item instantly, and add or
remove items without ever fully re-sorting. The transferable problem:
sometimes you don't need data *fully* ordered, you only ever need to
know what's *smallest right now* — and paying for full order costs
more than the problem actually requires.

**What you need to know first:** Lesson 71 (binary tree + graph
traversal) — a heap is a binary tree, same "each node has up to two
children" shape as the BST there, but this lesson deliberately does
*not* reuse `TreeNode`: it stores the tree as a flat array instead of
linked nodes, which is itself the lesson's central idea, made concrete
by contrast with Lesson 71's pointer-based tree. Lesson 69 (binary
search + merge sort) — this lesson's closing section shows a heap
recovering fully sorted order through repeated `pop` calls, worth
comparing against merge sort's very different approach to the same
destination.

---

## Concept Unit: The Problem — Full Order Is More Than "Smallest First" Needs

### The Problem

A job queue that always needs to run its highest-priority job next has
two bad options with a plain list: leave it unsorted, and finding the
minimum means scanning everything, every time; or keep it fully
sorted, and finding the minimum is instant, but every single insertion
means finding the right spot *and shifting every element after it* —
paying full sort-maintenance cost for a benefit ("everything in exact
order") the problem never actually asked for. Only the front needs to
be right.

### The New Code

```python
import random

jobs = [random.randint(1, 100) for _ in range(8)]
print("jobs (priority = smaller runs first):", jobs)

# Option 1: unsorted list -- insert is O(1), but finding the smallest means scanning everything.
def find_min(jobs):
    smallest = jobs[0]
    for j in jobs:
        if j < smallest:
            smallest = j
    return smallest

print("unsorted: find_min scans all", len(jobs), "items ->", find_min(jobs))

# Option 2: keep it fully sorted -- smallest is always jobs[0], O(1) to read...
sorted_jobs = sorted(jobs)
print("sorted: smallest is just sorted_jobs[0] ->", sorted_jobs[0])
# ...but inserting a new job means finding its spot AND shifting everything after it.
sorted_jobs.insert(0, 1)  # a new highest-priority job just arrived
print("after inserting a new job 1:", sorted_jobs, "-- every other element had to shift")
```

### Run It

```
jobs (priority = smaller runs first): [22, 56, 13, 32, 18, 39, 66, 52]
unsorted: find_min scans all 8 items -> 13
sorted: smallest is just sorted_jobs[0] -> 13
after inserting a new job 1: [1, 13, 18, 22, 32, 39, 52, 56, 66] -- every other element had to shift
```

Discarded now. What's needed is a structure that's cheap to insert
into *and* cheap to read the minimum from — not fully sorted, just
sorted *enough* to guarantee the smallest is always easy to find. That
weaker, cheaper guarantee is called a **heap**.

### CS Lens

Doing exactly as much ordering work as a problem needs, no more, is a
recurring tradeoff, not unique to heaps. Also recognized in: a
database choosing a partial index over a full sort, a rendering engine
only depth-sorting the objects near the camera, Lesson 70's hash table
choosing "same key, same bucket" over "every key in a fully searchable
order" — heaps are this same instinct, applied to "find the minimum,"
specifically.

---

## Concept Unit: A Tree Hiding Inside an Array

### The Problem

Lesson 71's tree used real pointers (`.left`, `.right`) linking real
`TreeNode` objects. A heap needs to be a binary tree too — but one
extra fact about the *specific shape* of tree a heap uses makes
pointers unnecessary entirely: a heap is always a **complete** binary
tree (every level fully filled, left to right, before the next level
starts) — and a complete tree's shape is so regular it can be
described with pure arithmetic on array indices, no pointers needed at
all.

### The New Code

```python
data = ["A", "B", "C", "D", "E", "F", "G"]

def parent(i):
    return (i - 1) // 2

def left(i):
    return 2 * i + 1

def right(i):
    return 2 * i + 2

for i in range(len(data)):
    p = parent(i) if i > 0 else None
    l = left(i) if left(i) < len(data) else None
    r = right(i) if right(i) < len(data) else None
    print(f"index {i} ({data[i]}): parent={p}, left={l}, right={r}")
```

### Run It

```
index 0 (A): parent=None, left=1, right=2
index 1 (B): parent=0, left=3, right=4
index 2 (C): parent=0, left=5, right=6
index 3 (D): parent=1, left=None, right=None
index 4 (E): parent=1, left=None, right=None
index 5 (F): parent=2, left=None, right=None
index 6 (G): parent=2, left=None, right=None
```

Three formulas, proven here against a real 7-element list: `A` (index
0) is everyone's ancestor, with no parent of its own; `B` (index 1)
and `C` (index 2) are its children; `D`/`E` (indices 3, 4) are `B`'s
children; `F`/`G` (indices 5, 6) are `C`'s. **`(i - 1) // 2`** always
lands on the correct parent index, **`2 * i + 1`** and **`2 * i + 2`**
always land on the correct child indices — a genuine consequence of
what "complete" means, not a coincidence of this particular list. This
is discarded as a standalone lab now, but the three formulas
themselves are exactly what the real `MinHeap` class uses next — not
reimplemented, just moved inside a class.

### CS Lens

Encoding a tree's shape entirely through index arithmetic instead of
explicit pointers is called an **implicit data structure** — the
structure exists, but nothing in memory directly represents it beyond
the array itself and the rules for interpreting it. Also recognized
in: a chessboard represented as a flat 64-element array with rank/file
arithmetic instead of a 2D grid of linked cells, a spreadsheet engine
computing a cell's neighbors from its row/column indices rather than
storing explicit links, and — going the other direction — exactly why
this is *not* how Lesson 71's `TreeNode` worked: that tree wasn't
complete (any node could be missing a child at any point), so no fixed
arithmetic could describe its shape; pointers were the only option
there.

---

## Concept Unit: The Heap Invariant and `push`

### The Problem

An array alone doesn't guarantee anything about where the minimum
value is. A heap adds exactly one rule — the **heap invariant**: every
parent must be less than or equal to both its children — and, more
importantly, a way to *restore* that rule after every single insertion,
without re-sorting the whole array.

### Project Change

- **Reference Source:** No reference counterpart — from-scratch
  addition, same as Lessons 70–72.
- **Files affected:** `heap.py` (new file).
- **Change type:** add.
- **Location:** n/a — brand-new file.
- **Dependencies:** none beyond the standard library.

### The New Code

```python
class MinHeap:
    def __init__(self):
        self.data = []

    def _parent(self, i):
        return (i - 1) // 2

    def _left(self, i):
        return 2 * i + 1

    def _right(self, i):
        return 2 * i + 2

    def push(self, value):
        self.data.append(value)
        self._sift_up(len(self.data) - 1)

    def _sift_up(self, i):
        while i > 0:
            parent = self._parent(i)
            if self.data[i] < self.data[parent]:
                self.data[i], self.data[parent] = self.data[parent], self.data[i]
                i = parent
            else:
                break
```

### Run It

```python
>>> from heap import MinHeap
>>> h = MinHeap()
>>> for v in [22, 56, 13, 32, 18]:
...     h.push(v)
...     print(f"after push({v}):", h.data)
after push(22): [22]
after push(56): [22, 56]
after push(13): [13, 56, 22]
after push(32): [13, 32, 22, 56]
after push(18): [13, 18, 22, 56, 32]
```

### Mechanical Walkthrough

- `self._parent`, `self._left`, `self._right` — the exact three
  formulas from the previous unit's lab, moved inside the class
  unchanged, as promised.
- `def push(self, value): self.data.append(value); self._sift_up(len(self.data) - 1)`
  — insertion always happens at the *end* of the array first,
  regardless of where the value would eventually belong — `.append`
  is already-basic, `O(1)` on a Python list. The new value's correct
  position is figured out *after* it's added, not before.
- `def _sift_up(self, i):` — **first appearance of the "bubble
  upward" repair.** Starting at the index the new value just landed
  at, this repeatedly compares it against its parent and swaps if the
  heap invariant is violated (`self.data[i] < self.data[parent]`) —
  reassigning `i = parent` after every swap, so the *same* value keeps
  moving upward, one level at a time, only as far as it actually needs
  to.
- `else: break` — the moment a value finds a parent it's *not*
  smaller than, the invariant holds from that point down, and nothing
  further needs checking — the loop stops immediately rather than
  continuing needlessly.

### Execution Trace

```python
h = MinHeap()
for v in [22, 56, 13]:
    h.push(v)
```

1. `push(22)` — `data = [22]`; `_sift_up(0)` — `i=0`, loop condition
   `i > 0` is false immediately, nothing to do.
2. `push(56)` — `data = [22, 56]`; `_sift_up(1)` — `parent =
   _parent(1) = 0`; `data[1]=56 < data[0]=22`? No — loop's `else`
   branch fires, `break` immediately. `data` unchanged: `[22, 56]`.
3. `push(13)` — `data = [22, 56, 13]`; `_sift_up(2)` — `parent =
   _parent(2) = 0`; `data[2]=13 < data[0]=22`? Yes — swap:
   `data = [13, 56, 22]`, `i` becomes `0`. Loop condition `i > 0` is
   now false — stop. Final: `[13, 56, 22]`.

Real output for the first three pushes — `[22]`, `[22, 56]`,
`[13, 56, 22]` — matches this trace exactly: `13` bubbled all the way
from the last position up to the root in a single swap, because its
only comparison (against `22`) already broke the invariant.

### CS Lens

Repairing a structure locally, near where a change just happened,
rather than re-validating the whole structure from scratch, is a
recurring efficiency trick. Also recognized in: a database index
updating just the affected page after a single-row insert instead of
rebuilding the whole index, a spreadsheet recalculating only the cells
that depend on a changed one instead of every cell, Git computing a
diff instead of comparing entire file contents.

### SE Lens

`_sift_up` only ever compares a value against its *ancestors*, moving
straight up one path — it never compares siblings against each other,
and it never needs to. That's a direct consequence of the heap
invariant only constraining parent-vs-child relationships, never
sibling-vs-sibling ones — which is exactly why a heap is cheaper to
maintain than a fully sorted array: it's enforcing a strictly weaker
guarantee, and paying a correspondingly smaller cost for it.

---

## Concept Unit: `peek` and `pop`

### The Problem

`push` keeps the invariant true on the way in. Nothing yet reads the
minimum back out, or removes it while keeping every *remaining* item's
position still valid.

### Project Change

- **Reference Source:** No reference counterpart — from-scratch
  addition.
- **Files affected:** `heap.py`.
- **Change type:** add.
- **Location:** inside `MinHeap`, immediately after `push` and
  `_sift_up`.
- **Dependencies:** `push` (something to pop).

### The New Code

```python
    def peek(self):
        return self.data[0]

    def pop(self):
        if len(self.data) == 1:
            return self.data.pop()
        root = self.data[0]
        self.data[0] = self.data.pop()
        self._sift_down(0)
        return root

    def _sift_down(self, i):
        n = len(self.data)
        while True:
            left = self._left(i)
            right = self._right(i)
            smallest = i
            if left < n and self.data[left] < self.data[smallest]:
                smallest = left
            if right < n and self.data[right] < self.data[smallest]:
                smallest = right
            if smallest == i:
                break
            self.data[i], self.data[smallest] = self.data[smallest], self.data[i]
            i = smallest
```

### The Updated Project

```python
class MinHeap:
    def __init__(self):
        self.data = []

    def _parent(self, i):
        return (i - 1) // 2

    def _left(self, i):
        return 2 * i + 1

    def _right(self, i):
        return 2 * i + 2

    def push(self, value):
        self.data.append(value)
        self._sift_up(len(self.data) - 1)

    def _sift_up(self, i):
        while i > 0:
            parent = self._parent(i)
            if self.data[i] < self.data[parent]:
                self.data[i], self.data[parent] = self.data[parent], self.data[i]
                i = parent
            else:
                break

    def peek(self):                                                     # ← new
        return self.data[0]                                               # ← new

    def pop(self):                                                        # ← new
        if len(self.data) == 1:                                            # ← new
            return self.data.pop()                                          # ← new
        root = self.data[0]                                                  # ← new
        self.data[0] = self.data.pop()                                        # ← new
        self._sift_down(0)                                                     # ← new
        return root                                                             # ← new

    def _sift_down(self, i):                                                     # ← new
        n = len(self.data)                                                        # ← new
        while True:                                                                # ← new
            left = self._left(i)                                                    # ← new
            right = self._right(i)                                                   # ← new
            smallest = i                                                               # ← new
            if left < n and self.data[left] < self.data[smallest]:                       # ← new
                smallest = left                                                            # ← new
            if right < n and self.data[right] < self.data[smallest]:                         # ← new
                smallest = right                                                               # ← new
            if smallest == i:                                                                    # ← new
                break                                                                              # ← new
            self.data[i], self.data[smallest] = self.data[smallest], self.data[i]                    # ← new
            i = smallest                                                                                # ← new
```

`MinHeap` is now a complete priority queue: `push` inserts and repairs
upward; `peek` reads the minimum in O(1) with no repair needed at all
(the invariant guarantees it's always at index 0); `pop` removes the
minimum and repairs downward, restoring the invariant for whatever
remains.

### Mechanical Walkthrough

- `def peek(self): return self.data[0]` — no traversal, no
  computation — the heap invariant alone guarantees the smallest value
  is always at index `0`, so reading it is a single array access.
- `if len(self.data) == 1: return self.data.pop()` — an edge case
  handled first: with exactly one item, there's no "restore the
  invariant afterward" step needed — removing the only element leaves
  an empty, trivially valid heap.
- `root = self.data[0]` — save the value about to be returned, *before*
  it gets overwritten below.
- `self.data[0] = self.data.pop()` — **first appearance of
  "swap-with-last, then remove."** `self.data.pop()` (no argument)
  removes and returns the *last* element of the list — already
  established from earlier lessons — and that value is written into
  position `0`, directly overwriting the old minimum. This is why the
  minimum had to be saved as `root` a line earlier: the moment this
  line runs, `self.data[0]` no longer holds it.
- `self._sift_down(0)` — the array is now shaped correctly (same
  length as after a real removal) but almost certainly *not* a valid
  heap anymore — whatever was last in the array is now sitting at the
  root with no guarantee it's small. This call restores the invariant.
- `return root` — hand back the actual minimum, saved before the
  overwrite.
- `def _sift_down(self, i):` — **first appearance of the "bubble
  downward" repair**, the mirror image of `_sift_up`. `smallest = i`
  starts by assuming the current node is fine; the two `if` blocks
  check both children (guarded by `left < n` / `right < n`, since a
  node near the bottom of the tree may have zero, one, or two real
  children) and update `smallest` if either child is actually smaller.
- `if smallest == i: break` — if neither child was smaller, the
  invariant already holds at this position and everything below it
  was untouched, so there's nothing further to check — stop
  immediately, same efficiency reasoning as `_sift_up`'s `else: break`.
- `self.data[i], self.data[smallest] = self.data[smallest], self.data[i]; i = smallest`
  — otherwise, swap the out-of-place value down into the smaller
  child's old position, and continue checking *from there* — the value
  keeps sinking, one level at a time, until it either finds a spot
  where it's smaller than both children or reaches the bottom of the
  tree.

### Execution Trace

Heap `[13, 18, 22, 56, 32]` from the previous unit's final state.

```python
h.pop()
```

1. `len(self.data)` is `5`, not `1` — skip the trivial case.
2. `root = self.data[0]` → `root = 13`.
3. `self.data[0] = self.data.pop()` — `.pop()` removes and returns the
   last element, `32`; `data` shrinks to `[13, 18, 22, 56]`, then
   `data[0]` is overwritten: `data = [32, 18, 22, 56]`.
4. `_sift_down(0)`: `n=4`. `left=1`, `right=2`; `smallest=0`.
   `data[1]=18 < data[0]=32`? Yes — `smallest=1`. `data[2]=22 <
   data[1]=18`? No — `smallest` stays `1`. `smallest(1) != i(0)` —
   swap positions `0` and `1`: `data = [18, 32, 22, 56]`; `i=1`.
   Loop again: `left=3`, `right=4`. `n=4`, so `right(4) < 4` is false
   — no right child exists. `left=3 < 4`: `data[3]=56 < data[1]=32`?
   No — `smallest` stays `1`. `smallest(1) == i(1)` — `break`.
5. `return root` → returns `13`.

Final `data = [18, 32, 22, 56]`.

### Run It

```
final heap array: [13, 18, 22, 56, 32]
peek: 13
popped: 13
heap after pop: [18, 32, 22, 56]
popped: 18
heap after pop: [22, 32, 56]
```

Real output, matching the trace exactly for the first `pop`. The
second `pop` (`18` returned, `[22, 32, 56]` remaining) follows the same
mechanism: `56` (the array's last element) swaps into the root, then
sifts down past `32` on its way toward the bottom, since `22` is
smaller than both `32` and `56` and correctly stays put as the new
root.

### CS Lens

"Move the last element to the front, then repair downward" — rather
than, say, shifting every remaining element left by one to close the
gap where the root used to be — trades an `O(n)` shift for an `O(log
n)` sift, because a complete binary tree's height grows only
logarithmically with its size. Also recognized in: a hash table's own
deletion strategies avoiding full re-shuffling where possible, database
page-splitting algorithms that move a small number of records instead
of rewriting an entire table.

---

## Connect the Pieces — A Heap Recovers Sorted Order

```python
from heap import MinHeap

h = MinHeap()
values = [22, 56, 13, 32, 18, 39, 66, 52, 5, 91]
for v in values:
    h.push(v)

print("original order:", values)
print("heap array (not sorted, just heap-ordered):", h.data)

result = []
while h.data:
    result.append(h.pop())
print("popped in order:", result)
print("matches sorted():", result == sorted(values))
```

```
original order: [22, 56, 13, 32, 18, 39, 66, 52, 5, 91]
heap array (not sorted, just heap-ordered): [5, 13, 22, 18, 32, 39, 66, 56, 52, 91]
popped in order: [5, 13, 18, 22, 32, 39, 52, 56, 66, 91]
matches sorted(): True
```

Real output, worth sitting with: the raw `h.data` array — `[5, 13, 22,
18, 32, 39, 66, 56, 52, 91]` — is genuinely *not* sorted (`18` sits
after `22`, `56` sits before `52`) — only the heap invariant holds,
parent-less-than-children, nothing about left-to-right order at all.
And yet popping repeatedly, one minimum at a time, recovers full
sorted order anyway — for free, as a side effect of what `pop` already
does, with no separate sort step anywhere. This is a genuinely
different route to the same destination Lesson 69's merge sort
reaches: merge sort commits to a full ordering strategy up front and
sorts everything in one pass; a heap never commits to more order than
the invariant strictly requires, and full sorted order falls out
anyway, purely from repeatedly asking "what's smallest right now."
This *is* a real sorting algorithm, with a name — **heapsort** — even
though nothing above was written with sorting as the explicit goal.

## What Breaks Without This

Delete the `_sift_down(0)` call from `pop` — leave the swap-with-last
step in place, but skip the repair:

```python
def pop(self):
    if len(self.data) == 1:
        return self.data.pop()
    root = self.data[0]
    self.data[0] = self.data.pop()
    # self._sift_down(0)      # <- removed
    return root
```

Run the exact same heapsort sequence from above:

```
popped order: [5, 91, 52, 56, 66, 39, 32, 18, 22, 13]
actually sorted: [5, 13, 18, 22, 32, 39, 52, 56, 66, 91]
matches sorted: False
```

No crash, no exception — the heap just quietly returns items in the
wrong order after the very first pop, because the value swapped into
the root from the end of the array was never checked against its new
children at all. This is the dangerous kind of bug: every individual
`pop()` call still runs and returns *something* that looks plausible,
and the corruption compounds silently with every subsequent call,
rather than failing loudly the moment it happens.

## Exercises

- Add a `heapify(values)` class method or function that builds a valid
  heap from an existing list in one pass, rather than calling `push`
  once per element — research why this can be done in `O(n)` total
  time rather than `O(n log n)` (one `push` per element, each up to
  `O(log n)`).
- Build a `MaxHeap` by flipping every `<` in `_sift_up` and
  `_sift_down` to `>` — confirm `peek()` now always returns the
  largest value instead of the smallest.
- Wrap `MinHeap` around `(priority, item)` tuples instead of bare
  values, and use it to build a real task scheduler: `push((priority,
  task_name))`, and confirm `pop()` always returns the highest-priority
  (lowest-number) task first, even when tasks are added in a random
  order.
- Compare against Python's own `heapq` module (`heapq.heappush`,
  `heapq.heappop`) on the same input — confirm it's a min-heap by
  default too, and that it operates on a plain list exactly the way
  `MinHeap.data` does here.

## Definition of Done

- [ ] `MinHeap.push`, `.peek`, and `.pop` implemented and run, matching
      every trace above.
- [ ] The five-element `push` sequence (`22, 56, 13, 32, 18` → final
      array `[13, 18, 22, 56, 32]`) reproduced on your own machine.
- [ ] The heapsort demo run for real: confirm `result == sorted(values)`
      evaluates to `True` on your own random or chosen input, not just
      the values shown here.
- [ ] The `_sift_down`-removed failure actually triggered, confirming
      silent, wrong-order output rather than a crash.
- [ ] Can explain out loud, without looking at the code, why `peek` is
      O(1) and needs no repair step, while `pop` needs `_sift_down`.
- [ ] Committed, with a message explaining *why* — e.g. `"Min-heap
      priority queue: O(log n) push/pop by storing a complete binary
      tree in a flat array, no pointers needed"` — not `"add heap.py"`.
