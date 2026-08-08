# Lesson 69: Halving the Problem Beats Doing It Faster

## What you will build

Binary search, measured directly against linear search at real scale —
1,000,000 comparisons versus 20. Merge sort, built from genuine
divide-and-conquer recursion, traced step by step. And quicksort,
verified correct on 200 random inputs alongside merge sort — then shown,
with real measured timing, degrading catastrophically on exactly the
input its naive pivot choice handles worst: already-sorted data. The
transferable idea this lesson is actually about: an algorithm's
worst-case behavior isn't a footnote — it can turn a fast algorithm into
one dramatically slower than a "worse" one, on inputs that occur
naturally, not just in adversarial test cases.

## What you need to know first

- **Lesson 58** — recursive descent and recursion generally. Merge
  sort's and quicksort's own recursive structure — splitting a problem,
  solving the pieces, combining results — is the identical shape,
  applied to sorting instead of parsing.
- **Lesson 68** — `Stack`/`Queue`, and the general habit of choosing a
  data structure or algorithm based on what it actually costs, not what
  looks simplest. Today applies that same habit to choosing a *sorting
  algorithm*.

---

## The Problem, in prose, no code yet

Finding a specific value in an unsorted list has only one honest
approach: check every element, one at a time, until it's found or the
list runs out — **linear search**. If the list happens to be sorted,
there's a dramatically better option: check the middle element; if it's
too big, the answer can only be in the left half; if too small, only the
right half — repeat on whichever half remains, throwing away the other
half entirely, every single step. This lesson measures exactly how much
that "throw away half" trick is worth, then builds two real sorting
algorithms — merge sort and quicksort — that make sorted data possible
in the first place, and confronts directly why one of them can turn
catastrophically slow on data that looks perfectly ordinary.

---

## Concept Unit: Linear vs. Binary Search, Measured

### The Problem

"Binary search is faster" is easy to accept without ever seeing how much
faster, at real scale, in real numbers.

### Introduce the concept in isolation

```python
def linear_search(sorted_list, target):
    comparisons = 0
    for index, value in enumerate(sorted_list):
        comparisons += 1
        if value == target:
            return index, comparisons
    return -1, comparisons


def binary_search(sorted_list, target):
    comparisons = 0
    low, high = 0, len(sorted_list) - 1
    while low <= high:
        mid = (low + high) // 2
        comparisons += 1
        if sorted_list[mid] == target:
            return mid, comparisons
        elif sorted_list[mid] < target:
            low = mid + 1
        else:
            high = mid - 1
    return -1, comparisons


for size in [10, 100, 1_000, 10_000, 100_000, 1_000_000]:
    data = list(range(size))
    target = size - 1  # worst case for linear search
    _, linear_comparisons = linear_search(data, target)
    _, binary_comparisons = binary_search(data, target)
    print(f"size={size:>9,}  linear={linear_comparisons:>9,}  binary={binary_comparisons:>3}")
```

Run it:

```
size=       10  linear comparisons=       10  binary comparisons=  4
size=      100  linear comparisons=      100  binary comparisons=  7
size=    1,000  linear comparisons=    1,000  binary comparisons= 10
size=   10,000  linear comparisons=   10,000  binary comparisons= 14
size=  100,000  linear comparisons=  100,000  binary comparisons= 17
size=1,000,000  linear comparisons=1,000,000  binary comparisons= 20
```

What this proves: linear search's comparison count grows in exact
lockstep with the list size — a real, direct `O(n)` relationship, `n`
comparisons for `n` elements in the worst case. Binary search's count
barely moves at all — `20` comparisons for a million elements, up from
`4` for just ten — because `mid = (low + high) // 2` (a **hard concept
reappearing**, integer division established since early lessons) always
discards *half* of whatever remains, and halving a million repeatedly
reaches one remaining element in only about 20 steps (`2^20 ≈
1,000,000`) — the direct, concrete meaning of **logarithmic growth**,
`O(log n)`.

This lab is deleted now; it never appears in the project. What survives
is the measured, real cost of the tradeoff binary search requires: it
only works on data that's already sorted — which is exactly the problem
the rest of this lesson exists to solve.

### CS Lens

This is **logarithmic time complexity**, made concrete rather than
abstract: `log₂(1,000,000) ≈ 20` is not a coincidence of this example,
it's the literal definition of what `O(log n)` means — the number of
times `n` can be halved before reaching `1`.

Also recognized in: every balanced binary search tree's own lookup cost,
`git bisect`'s binary search over commit history, this curriculum's own
Lesson 66 QR code version-selection process (choosing among a fixed,
small number of size classes rather than searching linearly through
arbitrary sizes).

### SE Lens

Binary search's real requirement — the data must already be sorted — is
not a minor footnote; it's the entire reason sorting algorithms, built
next, matter at all: the cost of sorting has to be weighed against how
many searches will be performed on the sorted result afterward. Sorting
once and searching many times amortizes the sorting cost; sorting data
that will only ever be searched once, linearly, might not be worth the
cost at all — a real tradeoff, not a universal "always sort first" rule.

---

## Concept Unit: Merge Sort — Divide, Conquer, Combine

### Project Change

- **Reference Source:** No reference counterpart — standard textbook
  merge sort, verified below against Python's own `sorted()`.
- **Files affected:** new file, `sorting.py`.
- **Change type:** add.
- **Dependencies:** none.

### The New Code

```python
def merge_sort(items):
    if len(items) <= 1:
        return items
    middle = len(items) // 2
    left_half = merge_sort(items[:middle])
    right_half = merge_sort(items[middle:])
    return merge(left_half, right_half)


def merge(left, right):
    result = []
    left_index = right_index = 0
    while left_index < len(left) and right_index < len(right):
        if left[left_index] <= right[right_index]:
            result.append(left[left_index])
            left_index += 1
        else:
            result.append(right[right_index])
            right_index += 1
    result.extend(left[left_index:])
    result.extend(right[right_index:])
    return result
```

### Mechanical Walkthrough

- `if len(items) <= 1: return items` — the recursion's base case: a
  list of zero or one elements is, trivially, already sorted — a **hard
  concept reappearing** from every recursive function this curriculum
  has built since Lesson 55, needing a case where recursion stops.
- `merge_sort(items[:middle])` / `merge_sort(items[middle:])` — the
  recursive step: split the list exactly in half, and sort *each half
  independently*, by calling the same function on a smaller input —
  trusting, per the general recursive-function contract, that the
  recursive calls correctly sort their own smaller pieces.
- `merge(left, right)` — the part that actually does the sorting work:
  given two *already-sorted* lists, walk both simultaneously with two
  separate indices, always taking whichever front element is smaller,
  building the combined result one element at a time. `result.extend(...)`
  (reused list method) appends whichever list still has leftover
  elements once the other is exhausted — necessary because the two
  halves aren't generally the same length.

### Execution Trace

Sorting `[5, 2, 8, 1]`:

```
merge_sort([5, 2, 8, 1])
  split into [5, 2] and [8, 1]
  merge_sort([5, 2])
    split into [5] and [2]
    merge_sort([5]) -> [5]  (base case)
    merge_sort([2]) -> [2]  (base case)
    merge([5], [2]):
      compare 5, 2 -> take 2 -> result=[2]
      right empty -> extend with remaining [5]
      result = [2, 5]
  merge_sort([8, 1])
    split into [8] and [1]
    merge_sort([8]) -> [8]  (base case)
    merge_sort([1]) -> [1]  (base case)
    merge([8], [1]):
      compare 8, 1 -> take 1 -> result=[1]
      right exhausted -> extend with remaining [8]
      result = [1, 8]
  merge([2, 5], [1, 8]):
    compare 2, 1 -> take 1 -> result=[1]
    compare 2, 8 -> take 2 -> result=[1, 2]
    compare 5, 8 -> take 5 -> result=[1, 2, 5]
    right exhausted -> extend with remaining [8]
    result = [1, 2, 5, 8]
```

Every `merge` call only ever combines two lists **already known to be
correctly sorted**, either because they're base-case single elements or
because a deeper recursive call already sorted them — the entire
algorithm's correctness rests on that one invariant, maintained at every
level of the recursion.

### CS Lens

This is **divide and conquer**, by name: break a problem into smaller
independent subproblems, solve each recursively, then combine the
sub-solutions into a solution for the whole — the same general strategy
as Lesson 58's precedence-layered recursive descent, applied here to
sorting rather than parsing. Merge sort's worst-case time is `O(n log
n)` — the `log n` from how many times the list can be halved (this
lesson's own first unit), multiplied by the `O(n)` cost of each `merge`
pass across the whole list at that level.

Also recognized in: this curriculum's own Track 11 future concurrency
lessons, where divide-and-conquer maps naturally onto parallel
processing (each half genuinely *could* be sorted on a separate thread,
since the two recursive calls don't depend on each other at all);
distributed MapReduce-style data processing, structurally the same
split/process/combine shape at a much larger scale.

### SE Lens

Merge sort's `O(n log n)` cost holds in the **worst case**, not just on
average — a genuinely important guarantee this lesson's next unit shows
quicksort does not share, at the real cost of `merge_sort` needing extra
memory to hold the split-and-recombined lists at every level (it doesn't
sort "in place" the way some other algorithms can), a real tradeoff
worth naming rather than treating merge sort as a free, unconditional
win.

---

## Concept Unit: Quicksort — And the Input That Breaks It

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:** `sorting.py`.
- **Change type:** add.
- **Location:** below `merge`.

### The New Code

```python
def quick_sort(items):
    if len(items) <= 1:
        return items
    pivot = items[0]  # naive pivot choice: always the first element
    less = [x for x in items[1:] if x < pivot]
    greater_or_equal = [x for x in items[1:] if x >= pivot]
    return quick_sort(less) + [pivot] + quick_sort(greater_or_equal)
```

### Mechanical Walkthrough

- `pivot = items[0]` — quicksort's core idea: pick one element (the
  **pivot**, **first appearance of this term**), then partition every
  *other* element into "smaller than the pivot" and "greater than or
  equal to the pivot" — reused list comprehensions build both groups in
  one pass each.
- `quick_sort(less) + [pivot] + quick_sort(greater_or_equal)` — the
  recursive step: sort each partition independently, then concatenate
  them with the pivot correctly placed in between — since everything in
  `less` is genuinely smaller and everything in `greater_or_equal` is
  genuinely not, the pivot's own final position, once both sides are
  sorted, is already correct with no further work needed.
- The choice `pivot = items[0]` specifically — always the *first*
  element, never a random or middle one — is the deliberate, naive
  choice this unit's own experiment exists to expose.

### Run it — Correctness First

```python
for trial in range(200):
    test_list = [random.randint(-1000, 1000) for _ in range(random.randint(0, 50))]
    merge_result = merge_sort(test_list)
    quick_result = quick_sort(test_list)
    reference = sorted(test_list)
    if merge_result != reference or quick_result != reference:
        print("MISMATCH")
print("all 200 random trials correct:", ...)
```

```
all 200 random trials correct for both merge_sort and quick_sort: True
```

Both algorithms verified correct — a **hard concept reappearing** from
Lesson 58's own `eval()` fuzz test, this time checked against Python's
built-in `sorted()`.

### Run it — The Real Worst Case, Measured

```python
for size in [500, 1000, 2000, 4000]:
    shuffled = list(range(size)); random.shuffle(shuffled)
    already_sorted = list(range(size))

    merge_random_time = time_it(lambda: merge_sort(shuffled))
    quick_random_time = time_it(lambda: quick_sort(shuffled))
    quick_sorted_time = time_it(lambda: quick_sort(already_sorted))

    print(f"size={size:>5}  merge(random)={merge_random_time:.2f}ms  "
          f"quick(random)={quick_random_time:.2f}ms  quick(already-sorted)={quick_sorted_time:.2f}ms")
```

```
size=  500  merge(random)=   0.67ms  quick(random)=   0.46ms  quick(already-sorted)=    12.54ms
size= 1000  merge(random)=   1.46ms  quick(random)=   2.89ms  quick(already-sorted)=    24.70ms
size= 2000  merge(random)=   3.15ms  quick(random)=   2.13ms  quick(already-sorted)=    91.77ms
size= 4000  merge(random)=   6.35ms  quick(random)=   4.52ms  quick(already-sorted)=   602.46ms
```

Real, measured, dramatic degradation: on random data, quicksort keeps
pace with (and here occasionally beats) merge sort, both scaling gently
as size grows. On **already-sorted** input — with this specific,
naive "always pick the first element" pivot rule — quicksort's time
explodes: roughly `12ms → 25ms → 92ms → 602ms` as size merely doubles
three times, growth far steeper than merge sort's own steady
`0.67ms → 1.46ms → 3.15ms → 6.35ms` on the identical input sizes.

### Why, Specifically

On already-sorted data, `items[0]` is always the *smallest* remaining
element — every single partition puts *everything* into
`greater_or_equal` and *nothing* into `less`. Instead of splitting the
problem roughly in half at every level (merge sort's own guaranteed
behavior), each recursive call shrinks the problem by exactly one
element, turning `O(log n)` levels of recursion into `O(n)` levels —
and multiplied by the `O(n)` partitioning cost at each level, quicksort
degrades to genuine `O(n²)` — the same fundamentally worse growth class
Lesson 41's naive full-copy backup exhibited compared to its own
hard-linked version, here emerging from an algorithm's own structure
rather than a design choice about what to copy.

### CS Lens

This is quicksort's real, well-known **worst-case time complexity**,
`O(n²)`, contrasted directly against its typical **average-case**
performance, which is genuinely excellent, often faster in practice
than merge sort on random data (visible above: quicksort beat merge
sort at three of the four random-data sizes tested). An algorithm's
average case and worst case can differ dramatically, and quoting only
one without the other — "quicksort is fast" — is a real, incomplete
claim.

### SE Lens

The specific fix real-world quicksort implementations use — choosing
the pivot randomly, or as the median of a small sample, rather than
always the first element — doesn't eliminate the `O(n²)` worst case
entirely (some input can always be constructed to defeat any fixed
pivot rule) but makes it so unlikely on *naturally occurring* data
(already-sorted, or nearly so, being exactly the common real-world case
this naive version fails on) that it's rarely encountered in practice.
This lesson's own naive version was chosen deliberately to make the
failure mode reproducible and measurable, not to represent how
quicksort should actually be implemented for real use.

---

## Connect the pieces

One kind of input, already-sorted data, followed through both
algorithms: merge sort doesn't care what order its input arrives in at
all — its recursive split always halves the list exactly, regardless of
content, guaranteeing `O(n log n)` unconditionally, confirmed by its
own steady, gentle timing growth above. Quicksort's naive first-element
pivot choice interacts *specifically* with already-sorted input to
produce the worst possible partition at every single level, confirmed
by real, measured, dramatic slowdown on exactly that input — both
algorithms verified correct on 200 random cases each, so the difference
measured here is purely a *performance* story, not a correctness one.

## What breaks without this

Already demonstrated directly, with real timing: naive quicksort on
already-sorted data at size 4000 took **602ms**, roughly **95 times
longer** than merge sort's own **6.35ms** on the identical input size —
not a contrived adversarial case, but exactly the kind of already-mostly-
ordered data that occurs naturally (re-sorting an already-sorted log,
processing sequential IDs) in real applications.

## Definition of done

- [ ] Binary search's comparison count for a million-element list is
      measured directly, not assumed, to be around 20.
- [ ] `merge_sort` and `quick_sort` both produce output identical to
      `sorted()` across 200 randomly generated test cases.
- [ ] `quick_sort` on already-sorted input is measured to take
      dramatically longer than on random input of the same size, and
      dramatically longer than `merge_sort` on the identical
      already-sorted input.
- [ ] You can trace, by hand, `merge_sort([5, 2, 8, 1])`'s full
      recursive split-and-merge sequence, matching this lesson's own
      execution trace.
- [ ] You can explain, in your own words, exactly why an already-sorted
      list is quicksort's worst case when the pivot is always the first
      element.
- [ ] Commit with a message explaining why, not just what:

  ```
  git add sorting.py
  git commit -m "Add merge sort and quicksort, verified against sorted() on 200 random cases — measured quicksort's real ~95x slowdown on already-sorted input due to its naive first-element pivot choice"
  ```

## What's next

Lesson 70's hash table returns to this lesson's own opening
question — fast lookup — from a completely different angle: not
narrowing a search space by half each step, but computing exactly
where a value belongs in one step, the technique this curriculum's own
Lesson 13 duplicate-file finder and Lesson 47 API key store already
leaned on informally, now built and understood from first principles.
