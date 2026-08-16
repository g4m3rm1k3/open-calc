# Lesson 194: Heap Allocation

- **What you will build** — a free-list allocator using first-fit
  placement, a concrete demonstration of external fragmentation causing a
  perfectly satisfiable request to fail anyway, and a coalescing `free`
  that merges adjacent free blocks back together. The transferable
  problem: Lesson 193's stack only ever grows and shrinks from one end, in
  strict last-pushed-first-popped order — cheap, but rigid. Real programs
  need to allocate memory whose size isn't known until the program is
  already running, and free it in whatever order they're done with it,
  not necessarily the order they got it in. That flexibility is the
  **heap**, and it comes with a real, well-documented cost the stack never
  had to pay.
- **What you need to know first** — `write-byte`, `read-byte`
  (Lesson 191); the accessor-function-per-field pattern (Lesson 92's
  `bst-value`/`bst-left`/`bst-right`); `nil?` (Lesson 136); `cons`,
  `first`, `rest`, `empty?` (Section II).
- **Terms introduced in this lesson**
  - **heap** — a region of memory allocated and freed in arbitrary order,
    at arbitrary sizes, at arbitrary times — as opposed to the stack's
    strict, automatic last-in-first-out discipline.
  - **free list** — a list of every currently-unused block of heap
    memory, each recorded as a starting address and a size; the only
    record of what's actually available to allocate.
  - **first-fit** — an allocation strategy: scan the free list in order
    and use the *first* block found that's big enough, splitting off
    whatever's left over as its own new free block.
  - **external fragmentation** — free memory that adds up to enough
    total space for a request, but is scattered across blocks too small
    individually to satisfy it — the request fails not from a lack of
    free memory, but from how it's laid out.
  - **coalescing** — merging a newly freed block with any free block
    immediately next to it, so freed space doesn't stay needlessly split
    into smaller pieces than it has to be.
- **Objects and methods used**: None new. This lesson reuses `[...]`,
  `get` (Section V), `cons`, `first`, `rest`, `empty?` (Section II),
  `nil?` (Lesson 136), `if`, `=`, `+`, `-`, `>=` (Section I), each already
  covered.

---

## Concept Unit: The Free List and First-Fit Allocation

### The Problem

Lesson 191's memory has no notion of "available to allocate" at all —
every address was always just as writable as any other, with the whole
program responsible for knowing where things lived. A real allocator
needs to track, on its own, exactly which parts of memory are currently
free, and hand out a piece of the right size on request.

### Introduce the Concept in Isolation

Skipped — a free list is a plain list of `[start size]` pairs, the same
vector-as-pair and accessor-function convention already lab'd (Lesson
92's tree-node accessors); nothing syntactic here is new, only the
allocation strategy itself, demonstrated directly below.

### Discard the Throwaway Example

Not applicable — there is no separate throwaway example in this unit.

### Project Change

- **Reference Source**: No reference counterpart — a from-scratch addition
  continuing directly from Lesson 191's memory model.
- **Files affected**: None — a standalone `bb` script for this lesson.
- **Change type**: N/A.
- **Location**: N/A.
- **Dependencies**: Babashka, already installed.

### The New Code

Every free block is a two-slot pair, given its own named accessors —
the same convention Lesson 92 used for tree nodes:

```clojure
(defn block-start [block] (get block 0))
(defn block-size [block] (get block 1))
```

Finding the first block big enough for a request:

```clojure
(defn find-fit
  [free-list requested]
  (if (empty? free-list)
    nil
    (find-fit-check (first free-list) free-list requested)))
```

```clojure
(defn find-fit-check
  [block free-list requested]
  (if (>= (block-size block) requested)
    block
    (find-fit (rest free-list) requested)))
```

### The Updated Project

Removing a specific block from the free list once it's been chosen:

```clojure
(defn remove-block
  [free-list block]
  (if (= (first free-list) block)
    (rest free-list)
    (cons (first free-list) (remove-block (rest free-list) block))))
```

`allocate` ties all three together — find a fit, remove it, and, if
there's space left over past what was actually requested, add that
leftover back as its own smaller free block:

```clojure
(defn allocate
  [free-list requested]
  (allocate-with-fit free-list requested (find-fit free-list requested)))
```

```clojure
(defn allocate-with-fit
  [free-list requested fit]
  (if (nil? fit)
    nil
    (allocate-split free-list requested fit)))
```

```clojure
(defn allocate-split
  [free-list requested fit]
  (allocate-result (block-start fit) (remove-block free-list fit)
                    (- (block-size fit) requested) (+ (block-start fit) requested)))
```

```clojure
(defn allocate-result
  [address remaining-list leftover leftover-start]
  (if (= leftover 0)
    [address remaining-list]
    [address (cons [leftover-start leftover] remaining-list)]))
```

### Mechanical Walkthrough

Enumerating `find-fit`'s and `find-fit-check`'s bodies:

- `(empty? free-list)`, `nil` — **(c) already basic**; no block anywhere
  in the list was big enough.
- `(>= (block-size block) requested)` — **(c) already basic**; the
  **first-fit** decision itself — the very first block satisfying this
  test wins, with no comparison against any later, possibly better-fitting
  block.

Enumerating `remove-block`'s body:

- `(= (first free-list) block)` — **(c) already basic**; structural
  equality on a whole vector, already relied on since Section V.
- the recursive branch — **(b) a hard concept reappearing**: ordinary
  structural recursion over a list (Section II), searching for one
  matching element and rebuilding the list around it.

Enumerating `allocate`'s chain of helpers:

- `find-fit`, `allocate-with-fit`, `allocate-split`, `allocate-result` —
  **(b) a hard concept reappearing** as a whole: compute-once-pass-to-
  helper, threading the chosen block through three stages instead of
  recomputing `find-fit` at each one.
- `(- (block-size fit) requested)` — **(a) first appearance**: the
  leftover — whatever the chosen block had beyond exactly what was asked
  for.
- `(+ (block-start fit) requested)` — **(a) first appearance**: where
  that leftover starts — immediately after the newly allocated portion.

Trace `allocate` three times in a row, starting from one big free block
covering a twenty-byte heap, `(list [0 20])`:

```
allocate (list [0 20]) 5
  fit = [0 20], remove-block → ()
  leftover = 20 - 5 = 15, leftover-start = 0 + 5 = 5
  → [0 (list [5 15])]              allocated at 0, remaining: one 15-byte block at 5

allocate (list [5 15]) 8
  fit = [5 15], remove-block → ()
  leftover = 15 - 8 = 7, leftover-start = 5 + 8 = 13
  → [5 (list [13 7])]              allocated at 5, remaining: one 7-byte block at 13

allocate (list [13 7]) 3
  fit = [13 7], remove-block → ()
  leftover = 7 - 3 = 4, leftover-start = 13 + 3 = 16
  → [13 (list [16 4])]             allocated at 13, remaining: one 4-byte block at 16
```

Three allocations — `5` bytes at address `0`, `8` bytes at address `5`,
`3` bytes at address `13` — each one splitting off exactly the leftover
the next allocation started from. The heap now has three live allocations
and one remaining `4`-byte free block at address `16`.

### CS Lens

A free list, scanned with first-fit, is a real, historically used
allocator strategy, not a simplification invented for this lesson.

```
Also recognized in: real `malloc`/`free` implementations in C, many of
which use exactly this free-list-plus-placement-strategy structure;
filesystem free-space tracking, recording which disk blocks are unused in
essentially the same shape; and memory allocators inside virtually every
language runtime, performing fundamentally this same bookkeeping beneath
whatever higher-level allocation API a program actually calls
```

### SE Lens

Two real alternatives to first-fit exist: best-fit, scanning the *entire*
free list and choosing the smallest block that still satisfies the
request, and worst-fit, choosing the *largest* available block instead.
First-fit, built here, is fast — it stops at the first success instead of
scanning everything — but can leave many small, awkward leftover
fragments near the front of the list. Best-fit minimizes wasted space on
any single allocation, but, somewhat counterintuitively, tends to
generate *more* small, hard-to-reuse fragments over the life of a
program — a real, documented finding in allocator research, not an
obvious result. Neither is a strictly better choice; real allocators
still make this exact tradeoff differently depending on their workload.

---

## Concept Unit: Freeing and Fragmentation

### The Problem

Every allocation above has stayed permanently allocated. A real program
frees memory too — and not necessarily in the order it allocated it.
What happens to the free list, and to future allocations, once frees
start happening out of order?

### Introduce the Concept in Isolation

Skipped — freeing a block is one `cons`, already fully covered; the real
demonstration in this unit is the concrete consequence, not new syntax.

### Discard the Throwaway Example

Not applicable — same as the first unit.

### Project Change

- **Reference Source**: No reference counterpart — from-scratch, same as
  the first unit.
- **Files affected**: None — same standalone `bb` script, extended.
- **Change type**: Add.
- **Location**: Directly below `allocate-result`.
- **Dependencies**: Babashka, already installed.

### The New Code

Freeing, for now, does the simplest possible thing: add the block back to
the free list, with no attempt to merge it with anything nearby:

```clojure
(defn free
  [free-list address size]
  (cons [address size] free-list))
```

### The Updated Project

Skipped — no enclosing file exists yet; a standalone sequence of calls at
the `bb` REPL.

### Mechanical Walkthrough

`cons [address size] free-list` — **(c) already basic**; the newly freed
block simply joins the list, in whatever position `cons` puts it, with no
relationship recorded between it and any block already there.

Free the *first* and *third* allocations from the previous unit — address
`0` (size `5`) and address `13` (size `3`) — but **not** the second one,
address `5` (size `8`), leaving it still allocated, sitting *between* the
two newly freed blocks:

```
free (list [16 4]) 0 5   → (list [0 5] [16 4])
free ...            13 3 → (list [13 3] [0 5] [16 4])
```

Three free blocks now exist: `3` bytes at `13`, `5` bytes at `0`, and `4`
bytes at `16` — `12` bytes free in total, out of a `20`-byte heap. Attempt
an allocation for `10` bytes, well under that `12`-byte total:

```
find-fit (list [13 3] [0 5] [16 4]) 10
  [13 3]: size 3, not ≥ 10 → check next
  [0 5]:  size 5, not ≥ 10 → check next
  [16 4]: size 4, not ≥ 10 → check next
  free-list now empty → nil
```

`allocate` returns `nil` — the allocation fails — even though `12` bytes
are genuinely free somewhere in this heap. Not one of the three
individual blocks is big enough on its own, because the still-allocated
`8`-byte block at address `5` sits directly between two of them, splitting
what would otherwise be contiguous free space into three separate,
individually-too-small pieces. This is **external fragmentation**: a
request failing not from too little free memory, but from how that free
memory happens to be laid out.

### CS Lens

Enough total free capacity failing to satisfy a request because of how
it's scattered is a real, well-documented phenomenon well beyond this
lesson's own toy heap.

```
Also recognized in: real long-running programs whose memory usage grows
over time even without an actual memory leak, purely from accumulated
fragmentation; filesystem fragmentation, where free disk space scattered
across many small non-contiguous regions can't fit one large new file
even though the total free space is sufficient; and bin-packing, a real,
named optimization problem studying exactly this "capacity is sufficient,
layout isn't" situation in general
```

### SE Lens

An alternative was available: allocate only in a small number of fixed
sizes, rounding every request up to the nearest one, so any freed block
is immediately reusable by the next same-size request with no possibility
of an awkward, too-small leftover. That eliminates external fragmentation
entirely, but trades it for **internal** fragmentation instead — wasted
space *inside* an oversized block that's bigger than what was actually
requested, on every single allocation, whether or not it's ever freed and
reused. Neither choice removes waste; it only decides which real, named
shape that waste takes.

---

## Concept Unit: Coalescing

### The Problem

The previous unit's failure happened because freed space stayed split
into pieces smaller than it needs to be. If a newly freed block sits
immediately next to an already-free one, merging them back into a single,
larger block would recover exactly the contiguous space fragmentation
just lost. Can `free` do that automatically?

### Introduce the Concept in Isolation

Skipped — coalescing composes already-lab'd list recursion and
arithmetic comparisons; the new material is the merging strategy itself,
demonstrated directly in the real code and trace below.

### Discard the Throwaway Example

Not applicable — same as the earlier units.

### Project Change

- **Reference Source**: No reference counterpart — from-scratch, same as
  the earlier units.
- **Files affected**: None — same standalone `bb` script, extended.
- **Change type**: Add.
- **Location**: Directly below `free`.
- **Dependencies**: Babashka, already installed.

### The New Code

A block is adjacent *on the left* of a freed block if some free block
already ends exactly where the freed block begins:

```clojure
(defn find-adjacent-left
  [free-list address]
  (if (empty? free-list)
    nil
    (find-adjacent-left-check (first free-list) free-list address)))
```

```clojure
(defn find-adjacent-left-check
  [block free-list address]
  (if (= (+ (block-start block) (block-size block)) address)
    block
    (find-adjacent-left (rest free-list) address)))
```

Adjacent *on the right* is the mirror: a free block that starts exactly
where the freed block ends:

```clojure
(defn find-adjacent-right
  [free-list end-address]
  (if (empty? free-list)
    nil
    (find-adjacent-right-check (first free-list) free-list end-address)))
```

```clojure
(defn find-adjacent-right-check
  [block free-list end-address]
  (if (= (block-start block) end-address)
    block
    (find-adjacent-right (rest free-list) end-address)))
```

### The Updated Project

`free-coalesced` checks both directions and merges whichever it finds,
falling back to plain `free`'s behavior — just adding the block — when
neither side has a match:

```clojure
(defn free-coalesced
  [free-list address size]
  (free-merge-left free-list address size (find-adjacent-left free-list address)))
```

```clojure
(defn free-merge-left
  [free-list address size left-match]
  (if (nil? left-match)
    (free-merge-right free-list address size (find-adjacent-right free-list (+ address size)))
    (free-merge-right (remove-block free-list left-match) (block-start left-match)
                       (+ (block-size left-match) size)
                       (find-adjacent-right (remove-block free-list left-match) (+ address size)))))
```

```clojure
(defn free-merge-right
  [free-list address size right-match]
  (if (nil? right-match)
    (cons [address size] free-list)
    (cons [address (+ size (block-size right-match))] (remove-block free-list right-match))))
```

### Mechanical Walkthrough

Enumerating `find-adjacent-left-check`'s and `find-adjacent-right-check`'s
bodies:

- `(+ (block-start block) (block-size block))` — **(a) first appearance**:
  a free block's own *end* address — where it stops, computed rather than
  stored, the same "compute, don't store, whatever arithmetic can derive"
  discipline Lesson 191's `element-address` already established.
- the equality check against `address` (or `end-address`) — **(c) already
  basic**; adjacency is nothing more than one address exactly matching
  another.

Enumerating `free-coalesced`'s and its helpers' bodies:

- `find-adjacent-left`, `find-adjacent-right` — **(c) already basic**,
  just defined above.
- `(nil? left-match)` — **(c) already basic**, Lesson 136.
- the merged block, `[(block-start left-match) (+ (block-size left-match)
  size)]` — **(a) first appearance**: one new block replacing two old
  ones — the freed block's own identity disappears entirely into the
  block it merged with.

Trace `free-coalesced` freeing the *middle* allocation from the first
unit — address `5`, size `8` — against the previous unit's fragmented
free list, `(list [13 3] [0 5] [16 4])`:

```
find-adjacent-left free-list 5
  [13 3]: 13+3=16, not 5 → check next
  [0 5]:  0+5=5, matches! → left-match = [0 5]

free-merge-left: left-match found
  remove-block free-list [0 5] → (list [13 3] [16 4])
  new address = 0, new size = 5 + 8 = 13
  find-adjacent-right (list [13 3] [16 4]) (5+8=13)
    [13 3]: start 13, matches! → right-match = [13 3]

free-merge-right: right-match found
  remove-block (list [13 3] [16 4]) [13 3] → (list [16 4])
  final block: [0 (13 + 3)] = [0 16]
  → (list [0 16] [16 4])
```

Freeing one middle block merged it with a free block on its left *and* a
free block on its right in the same operation, producing one `16`-byte
free block at address `0`, plus the untouched `4`-byte block at `16` —
together, every one of the heap's original `20` bytes is free again.
Retrying the previous unit's failed `10`-byte allocation against this new
list: `find-fit` checks `[0 16]` first, `16 >= 10`, success. The identical
request that failed against three fragmented pieces succeeds instantly
against one coalesced block.

One honest limit is visible in the result itself: `[0 16]` and `[16 4]`
are themselves adjacent — `0 + 16 = 16` — and could in principle merge
into one `20`-byte block, but `free-coalesced` only ever checks the
*newly freed* block's own neighbors, not the whole list transitively.
This lesson's own `[16 4]` was never the block being freed, so it was
never re-examined.

### CS Lens

Coalescing adjacent free blocks is exactly what real, production memory
allocators do, not a simplification invented for this lesson's own
teaching purposes.

```
Also recognized in: real `malloc` implementations, which perform exactly
this adjacent-block merging on every `free` call — often called
"boundary tag" coalescing in real allocator literature, using small
hidden size markers at each block's edges to make the adjacency check
fast; defragmentation utilities for real filesystems, which perform a
more thorough, transitive version of this same merging; and a garbage
collector's compaction phase (a related, more aggressive strategy that
actually moves live data together, rather than merely merging the gaps
between it)
```

### SE Lens

The alternative to incremental coalescing, done here on every `free`
call, is a periodic, expensive "compact everything" pass instead —
rebuilding the whole free list from scratch, and, in some real garbage
collectors, physically moving allocated data together to eliminate gaps
entirely. Incremental coalescing is cheap per call — a couple of
adjacency checks — but only ever catches immediately-adjacent merges,
exactly the honest limitation this unit's own trace just exposed with
`[0 16]` and `[16 4]`. A full compaction pass catches everything, at the
real cost of a full scan every time it runs — or, if it also has to move
already-allocated data, of finding and updating every pointer to it,
which is only safe if every one of them can actually be located. Neither
is free; real allocators and garbage collectors still choose differently
between them today, often using cheap incremental coalescing most of the
time and falling back to an expensive full pass only occasionally.

---

## Connect the Pieces

Follow one heap, twenty bytes, through every function this lesson built.
Three allocations — `5`, `8`, and `3` bytes — leave one `4`-byte block
free at address `16`. Freeing the first and third allocations (addresses
`0` and `13`), without coalescing, fragments the heap into three separate
pieces; a `10`-byte request, well within the `12` bytes genuinely free,
fails outright, because no single piece is big enough. Freeing the
*middle* allocation, address `5`, with `free-coalesced` instead, finds
free blocks on both sides — the just-freed address `0` block and the
already-free address `13` block — and merges all three into one `16`-byte
block in a single operation. The identical `10`-byte request that failed
moments earlier now succeeds immediately. Nothing about `allocate` or
`find-fit` changed between the failure and the success — only how the
free space they were searching happened to be laid out.

## What Breaks Without This

Nothing in `free` or `free-coalesced` checks whether the block being
freed is actually still allocated. Free the same block twice in a row:

```clojure
(free (free (list [16 4]) 0 5) 0 5)
```

Trace it: the first `free` gives `(list [0 5] [16 4])`. The second `free`
call, on the exact same address and size, gives `(list [0 5] [0 5] [16
4])` — the block `[0 5]` now appears **twice**. Nothing detected this;
`free`'s own definition has no way to know whether address `0` was
genuinely allocated at the moment it was asked to free it again.

Now allocate `5` bytes, twice, against this doubled list:

```
allocate (list [0 5] [0 5] [16 4]) 5
  fit = [0 5] (the first occurrence), remove-block removes only that one
  → [0 (list [0 5] [16 4])]              allocated at address 0

allocate (list [0 5] [16 4]) 5
  fit = [0 5] (the second occurrence, still sitting in the list)
  → [0 (list [16 4])]                    allocated at address 0 — again
```

Two completely separate allocations both returned address `0`. Whatever
two different parts of a real program believe they each independently
own that memory will silently overwrite each other's data the moment
either one writes to it — no crash, no warning, just two owners for one
address. This is a real, well-known, security-relevant bug class called a
**double free**, and this lesson's simulation reproduces its exact
mechanism: freeing something already free doesn't corrupt anything by
itself, but it corrupts the free list's own bookkeeping, and *that*
corruption is what hands the same live memory to two unrelated
allocations later. A real allocator needs to track which blocks are
actually currently allocated — something this lesson's simple free list,
built to demonstrate allocation and fragmentation, was never given.

## Exercises

1. Trace `allocate` on `(list [0 20])` for a request of exactly `20`
   bytes, and confirm `allocate-result`'s `(= leftover 0)` branch is what
   correctly avoids creating a useless zero-size free block.
2. Using `free-coalesced`, free address `16` (size `4`) against the free
   list `(list [0 16])` — the state right after this lesson's own
   three-way merge — and confirm it produces a single `20`-byte block,
   healing the one honest gap this lesson's own trace left behind.
3. Sketch, in prose, what `find-fit` would need to do differently to
   implement best-fit instead of first-fit — scanning the *whole* list
   and remembering the smallest block seen so far that still satisfies
   the request, rather than stopping at the first one. No code required
   yet.

## Definition of Done

- [ ] `find-fit`, `remove-block`, and `allocate` are written and
      hand-traced for the three-allocation sequence, matching this
      lesson's worked trace.
- [ ] `free` and the fragmentation demonstration are hand-traced,
      confirming a `10`-byte request fails against three fragmented
      blocks totaling `12` free bytes.
- [ ] `find-adjacent-left`, `find-adjacent-right`, and `free-coalesced`
      are written and hand-traced for freeing the middle allocation,
      matching the merged `[0 16]` result.
- [ ] The double-free demonstration in "What Breaks Without This" is
      understood well enough to explain, without notes, why the bug lives
      in the free list's bookkeeping, not in either `allocate` call by
      itself.
- [ ] Commit with a message explaining *why* coalescing only checks the
      newly freed block's immediate neighbors rather than re-scanning the
      whole free list, not just *what* functions were added.
